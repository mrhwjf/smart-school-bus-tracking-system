# Bus Tracking Simulation System

## Mô tả hệ thống

Hệ thống mô phỏng xe bus di chuyển theo tuyến đường thời gian thực sử dụng:
- **WebSocket (Socket.IO)**: Truyền dữ liệu realtime từ server đến client
- **Redis**: Lưu trữ vị trí xe và trạng thái mô phỏng
- **OpenRouteService**: Vẽ đường đi theo đường thực tế trên bản đồ

## Yêu cầu

- Node.js >= 14
- Redis Server
- Backend API đang chạy
- Frontend đang chạy

## Cài đặt Redis

### Windows
```bash
# Download Redis từ: https://github.com/tporadowski/redis/releases
# Hoặc sử dụng Docker:
docker run -d -p 6379:6379 --name redis redis:alpine
```

### Linux/Mac
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
redis-server

# Mac
brew install redis
brew services start redis
```

### Kiểm tra Redis đã chạy
```bash
redis-cli ping
# Kết quả: PONG
```

## Cấu hình

### Backend `.env`
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Server
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
VITE_ORS_API_KEY=your_openrouteservice_api_key
```

## Chạy hệ thống

### 1. Khởi động Redis
```bash
redis-server
```

### 2. Khởi động Backend
```bash
cd backend
npm install
npm run dev
```

Console sẽ hiển thị:
```
✓ Database connected
✓ Redis connected
✓ Socket.IO initialized
🚀 Server running on port 5000
📡 WebSocket server ready
```

### 3. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```

## Sử dụng

### Admin Tracking Page
1. Truy cập `http://localhost:5173/tracking`
2. Chọn một xe bus từ danh sách bên trái
3. Nhấn nút **"Mô phỏng"** để bắt đầu mô phỏng
4. Xe bus sẽ di chuyển trên bản đồ theo tuyến đường đã định
5. Nhấn **"Dừng"** để dừng mô phỏng

### Parent Map View (GD_Map)
1. Truy cập `http://localhost:5173/map`
2. Xem vị trí xe bus của học sinh theo thời gian thực
3. Vị trí xe sẽ tự động cập nhật khi có mô phỏng đang chạy

## API Endpoints

### Simulation APIs

**Bắt đầu mô phỏng cho trip**
```http
POST /api/v1/simulations/trips/:tripId/start
Body: { "speed": 30 }
```

**Bắt đầu mô phỏng với route trực tiếp**
```http
POST /api/v1/simulations/start
Body: {
  "busId": 1,
  "route": [
    {"latitude": 10.78, "longitude": 106.69, "name": "Stop 1"},
    {"latitude": 10.79, "longitude": 106.70, "name": "Stop 2"}
  ],
  "speed": 30
}
```

**Dừng mô phỏng**
```http
POST /api/v1/simulations/buses/:busId/stop
```

**Lấy vị trí xe**
```http
GET /api/v1/simulations/buses/:busId/location
```

**Lấy tất cả vị trí xe**
```http
GET /api/v1/simulations/buses/locations
```

**Lấy danh sách simulation đang chạy**
```http
GET /api/v1/simulations/active
```

## WebSocket Events

### Client → Server
- `bus:requestAll` - Yêu cầu tất cả vị trí xe
- `bus:request` - Yêu cầu vị trí 1 xe: `{busId: 1}`

### Server → Client
- `bus:location` - Cập nhật vị trí 1 xe
  ```json
  {
    "bus_id": 1,
    "latitude": 10.78,
    "longitude": 106.69,
    "recorded_at": "2025-12-02T10:00:00Z",
    "speed": 30,
    "heading": 45,
    "currentStop": "Stop A",
    "nextStop": "Stop B"
  }
  ```

- `bus:locations` - Tất cả vị trí xe (array)

## Cấu trúc dữ liệu

### Redis Keys
- `bus:location:{busId}` - Vị trí xe (TTL: 1 hour)
- `bus:simulation:{busId}` - Trạng thái mô phỏng (TTL: 1 hour)

### Simulation State
```json
{
  "busId": 1,
  "currentSegment": 0,
  "progress": 0.5,
  "route": [...],
  "speed": 30,
  "status": "running",
  "lastUpdate": 1701518400000
}
```

## Tham số mô phỏng

- **speed**: Tốc độ xe (km/h), mặc định 30 km/h
- **updateInterval**: Cập nhật mỗi 2 giây
- **route**: Mảng các điểm dừng với latitude, longitude

## Công thức tính toán

### Haversine Distance
```javascript
distance = 2 * R * arcsin(sqrt(
  sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
))
```
R = 6,371,000 meters (bán kính trái đất)

### Linear Interpolation
```javascript
currentLat = startLat + (endLat - startLat) * progress
currentLon = startLon + (endLon - startLon) * progress
```

### Bearing/Heading
```javascript
bearing = atan2(
  sin(Δlon) * cos(lat2),
  cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(Δlon)
)
```

## Troubleshooting

### Redis connection failed
```bash
# Kiểm tra Redis đang chạy
redis-cli ping

# Khởi động Redis
redis-server
```

### WebSocket không kết nối
- Kiểm tra CORS configuration trong `backend/src/services/socketService.js`
- Kiểm tra `VITE_API_URL` trong frontend `.env`
- Mở browser console để xem lỗi

### Xe không di chuyển
- Kiểm tra route có ít nhất 2 stops với coordinates hợp lệ
- Kiểm tra console log: "Simulation started for bus X"
- Kiểm tra Redis có dữ liệu: `redis-cli KEYS bus:*`

### ORS không vẽ được đường
- Kiểm tra `VITE_ORS_API_KEY` trong frontend `.env`
- API key lấy miễn phí tại: https://openrouteservice.org/dev/#/signup
- Hệ thống sẽ fallback về polyline thẳng nếu ORS fail

## Monitoring

### Redis CLI
```bash
# Xem tất cả keys
redis-cli KEYS bus:*

# Xem vị trí xe
redis-cli GET bus:location:1

# Xem trạng thái simulation
redis-cli GET bus:simulation:1

# Xóa tất cả dữ liệu
redis-cli FLUSHALL
```

### Backend Logs
- `✓ Simulation started for bus X` - Mô phỏng bắt đầu
- `Bus X: Segment Y/Z, Progress N%` - Tiến độ di chuyển
- `✓ Simulation stopped for bus X` - Mô phỏng dừng

### Browser Console
- `✓ Socket connected: {socketId}` - WebSocket kết nối
- `Bus location update: {busId}` - Nhận update vị trí
- `Student bus location update:` - Cập nhật xe của học sinh

## License

MIT
