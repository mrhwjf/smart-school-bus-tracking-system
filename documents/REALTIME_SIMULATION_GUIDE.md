# Hướng dẫn Theo dõi & Mô phỏng Thời gian thực

Tài liệu này mô tả chi tiết cách cấu hình Redis, dịch vụ WebSocket và pipeline mô phỏng xe buýt phục vụ trang quản trị Tracking (`frontend/src/pages/admin/Tracking.jsx`).

## 1. Tổng quan hệ thống
- **Backend (`backend/src`)** chạy Express + Socket.IO (`services/socketService.js`) và cung cấp các endpoint mô phỏng tại `/api/v1/simulations`.
- **Redis (`services/redisService.js`)** lưu vị trí xe mới nhất và trạng thái mô phỏng từng xe để mọi client/instance đồng bộ dữ liệu.
- **Engine mô phỏng (`services/simulationService.js`)** nội suy tọa độ dọc tuyến và phát cập nhật tới Redis + Socket.IO.
- **Frontend (`frontend/src/api/socket.js`)** kết nối Socket.IO, lắng nghe các sự kiện `bus:location(s)` và trang Tracking render xe + tuyến ORS.

## 2. Điều kiện & cấu hình
### 2.1 Môi trường backend (.env)
```bash
PORT=5000                     # Tùy chọn, mặc định 5000
CLIENT_URL=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=               # Điền nếu Redis có mật khẩu
SESSION_SECRET=supersecretkey
```
- `CLIENT_URL` phải trùng origin của React để Socket.IO cho phép CORS.
- Triển khai thực tế cần trỏ `CLIENT_URL` tới domain frontend và expose API qua HTTPS, giống host dùng trong `VITE_API_URL`.

### 2.2 Môi trường frontend (`frontend/.env`)
```bash
VITE_API_URL=http://localhost:5000
```
- Socket.IO dùng lại giá trị này (`frontend/src/api/socket.js`) để kết nối backend.

### 2.3 Chuẩn bị Redis
1. Cài Redis nội bộ (ví dụ `brew install redis` trên macOS hoặc Docker image `redis:7`).
2. Khởi động Redis trước backend: `redis-server --port 6379` (thêm `--requirepass` nếu dùng mật khẩu và cập nhật `.env`).
3. Kiểm tra kết nối bằng `redis-cli ping` → nhận `PONG`.

### 2.4 Khởi chạy toàn bộ
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```
Vào trang Tracking trong admin để điều khiển mô phỏng.

## 3. Vòng đời WebSocket
### 3.1 Server (`backend/src/services/socketService.js`)
- `initializeSocket(server)` tạo Socket.IO với `transports: ['websocket','polling']` và cấu hình CORS bằng `CLIENT_URL`.
- Mỗi lần `connection`:
  - Đọc toàn bộ vị trí cache qua `redisService.getAllBusLocations()` rồi emit `bus:locations` để client vẽ ngay đội xe.
  - Lắng nghe:
    - `bus:requestAll` → trả lại `bus:locations`.
    - `bus:request` `{ busId }` → emit `bus:location` cho xe cụ thể.
- Ở bất kỳ đâu có thể gọi `broadcastBusLocation(s)` để push dữ liệu (engine mô phỏng sử dụng) mà không cần quản lý room.

### 3.2 Client (`frontend/src/api/socket.js`)
- `socketService.connect()` tạo kết nối `io(SOCKET_URL)` singleton, tự reconnect (5 lần, delay 1s) và cung cấp:
  - `on/off` để UI đăng ký sự kiện.
  - `requestAllLocations()` & `requestBusLocation(busId)` để chủ động yêu cầu dữ liệu.
- Trang `Tracking.jsx` tiêu thụ:
  - `bus:locations` → thay thế/hợp nhất danh sách xe tại chỗ.
  - `bus:location` → cập nhật realtime cho từng xe.
- Khi socket rớt, hooks ghi log `disconnect` và có thể hiển thị cảnh báo UI nếu cần.

## 4. Hợp đồng dữ liệu Redis (`backend/src/services/redisService.js`)
| Key pattern              | TTL  | Payload mẫu |
|--------------------------|------|-------------|
| `bus:location:<busId>`   | 3600s| `{ bus_id, latitude, longitude, recorded_at, speed, heading, currentStop, nextStop }` |
| `bus:simulation:<busId>` | 3600s| `{ busId, currentSegment, progress, route[], speed, status, lastUpdate }` |

- `getAllBusLocations()` dùng khi client vừa kết nối và ở API `GET /api/v1/simulations/buses/locations`.
- `setSimulationState()` giúp engine stateless giữa các tick—mỗi lần lặp lại đọc Redis nên có thể scale ngang.

## 5. Pipeline mô phỏng
1. **Kích hoạt**:
   - Từ UI (`Tracking.jsx`) thông qua `SimulationService.startSimulationWithRoute` cho từng trip (hàm `handleStartSimulations`).
   - Hoặc REST: `POST /api/v1/simulations/trips/:tripId/start` (backend tự lấy stops) hoặc `POST /api/v1/simulations/start` với `{ busId, route: [{ latitude, longitude, name }], speed }`.
2. **Chuẩn bị tuyến** (`Tracking.jsx`):
   - Lấy danh sách trip + route, chuẩn hóa stops và gọi thêm OpenRouteService (ORS) để có polyline mượt.
   - Khi admin nhấn **Start**, ưu tiên dùng tọa độ ORS; nếu không có sẽ dùng danh sách stops.
3. **Vòng lặp Engine** (`backend/src/services/simulationService.js`):
   - Dừng job cũ (nếu có), ghi state mới vào Redis và bắt đầu interval 2 giây.
   - Mỗi tick: đọc state → tính khoảng cách bằng Haversine → tăng progress theo `speed` → nội suy lat/lng và heading.
   - Lưu `bus:location` + state vào Redis và emit `bus:location` qua Socket.IO để toàn bộ client nhận ngay.
4. **Kết thúc / khởi động lại**:
   - Khi đạt waypoint cuối, engine quay về segment 0 tạo vòng lặp. Dừng (`POST /api/v1/simulations/buses/:busId/stop` hoặc `/stop-all`) sẽ clear interval và đánh dấu state `stopped` trong Redis.

## 6. Luồng trang Tracking admin (`frontend/src/pages/admin/Tracking.jsx`)
1. Khi mount: kết nối socket, subscribe `bus:location(s)`, tải trips + routes, dựng `VehicleList` và fetch ORS trước.
2. Duy trì `Map` ORS (`orsCoordinates`) theo `trip_id` và `tripsRef` để tái sử dụng mỗi lần Start/Stop.
3. `handleStartSimulations()`:
   - Gọi `SimulationService.stopAllSimulations()` để reset backend.
   - Lặp qua trips → xác định tuyến (ưu tiên ORS) → `POST /api/v1/simulations/start` với `busId`, route, speed (mặc định 30 km/h).
   - Cập nhật hook `useSimulationSync` để tab khác biết đang chạy.
4. `handleStopSimulations()` bắn `/stop-all` và xóa trạng thái sync.
5. Bản đồ highlight xe được chọn, vẽ GeoJSON ORS nếu có và tự động pan theo tọa độ socket gửi về.

## 7. Tác vụ thường gặp
### 7.1 Khởi động mô phỏng qua CLI
```bash
curl -X POST http://localhost:5000/api/v1/simulations/start \
  -H "Content-Type: application/json" \
  -d '{
        "busId": 101,
        "speed": 35,
        "route": [
          {"latitude": 10.7768, "longitude": 106.7008, "name": "Điểm 1"},
          {"latitude": 10.7735, "longitude": 106.6899, "name": "Điểm 2"}
        ]
      }'
```
Lặp lại cho từng xe hoặc gọi `POST /api/v1/simulations/trips/<tripId>/start` để backend tự lấy tuyến.

### 7.2 Dừng mô phỏng
```bash
curl -X POST http://localhost:5000/api/v1/simulations/stop-all
# hoặc
curl -X POST http://localhost:5000/api/v1/simulations/buses/101/stop
```

### 7.3 Kiểm tra dữ liệu Redis
```bash
redis-cli KEYS "bus:*"
redis-cli GET "bus:location:101"
redis-cli GET "bus:simulation:101"
```
Dùng để xác nhận xe đang phát tín hiệu; TTL sẽ tự xóa sau 1 giờ nếu không cập nhật.

## 8. Checklist xử lý sự cố
- **Socket không kết nối**: đảm bảo `CLIENT_URL` trùng origin trình duyệt và backend log "✓ Socket.IO initialized". Kiểm tra firewall cổng 5000.
- **Không thấy cập nhật realtime**: xác minh Redis chạy và `redisService` log "✓ Redis connected". Dùng `redis-cli` xem có dữ liệu mới.
- **Simulation dừng ngay**: tuyến phải có tối thiểu 2 tọa độ hợp lệ; kiểm tra payload log ở `startSimulationWithRoute`.
- **Frontend đứng hình**: gọi `socketService.requestAllLocations()` hoặc reload—backend luôn gửi toàn bộ cache khi client connect; nhớ rằng TTL mặc định 1 giờ.

Thực hiện đúng các bước trên sẽ đảm bảo WebSocket, Redis cache và engine mô phỏng vận hành trơn tru, cho phép quản trị viên quan sát và phát lại hành trình xe buýt ngay trên bản đồ Tracking.
