# API Flow: Nút "Sẵn sàng đón" → PickUpMap

## Tổng quan
Khi driver nhấn nút **"Sẵn sàng đón"** trong Dashboard, hệ thống sẽ:
1. Chuyển sang màn hình `PickUpMap`
2. Tự động fetch chuyến xe được phân công cho driver hôm nay
3. Load thông tin tuyến đường, điểm dừng và học sinh

## Flow chi tiết

### 1. Trigger: Nhấn nút "Sẵn sàng đón"
**File**: `frontend/src/pages/driver/DriverDashboard.jsx`
```jsx
<Button onClick={() => setScreen("pickup")}>
  Sẵn sàng đón
</Button>
```

### 2. PickUpMap mount và fetch data
**File**: `frontend/src/pages/driver/PickUpMap.jsx`

#### Bước 2.1: Lấy trip được phân công
```javascript
const trip = await getAssignedTripForDriver(DRIVER_ID);
// API: GET /api/v1/trips?tripDate=YYYY-MM-DD
// Response: { success: true, data: { items: [...] } }
```

**Logic filtering** (trong `tripService.js`):
- Lấy tất cả trips của ngày hôm nay
- Ưu tiên status: `SCHEDULED` → `IN_PROGRESS`
- Trả về trip đầu tiên match

#### Bước 2.2: Lấy thông tin schedule
```javascript
const schedule = await getScheduleById(trip.scheduleId);
// API: GET /api/v1/schedules/{scheduleId}
// Cần: schedule.routeId
```

#### Bước 2.3: Lấy thông tin route với stops và students
```javascript
const route = await getRouteById(schedule.routeId);
// API: GET /api/v1/routes/{routeId}
// Response bao gồm:
// - route.stops[] - danh sách điểm dừng
// - stop.students[] - danh sách học sinh tại mỗi stop
// - stop.latitude, stop.longitude - tọa độ
```

### 3. Transform data
Chuyển đổi dữ liệu API sang format component:
```javascript
{
  trip_id: trip.tripId,
  current_stop_index: 0,
  stops: route.stops.map(stop => ({
    stop_id: stop.stopId,
    name: stop.name,
    order: stop.order,
    lat: stop.latitude,
    lng: stop.longitude,
    students: stop.students.map(student => ({
      id: student.studentId,
      name: student.name,
      class: student.className || 'N/A',
      phoneNumber: student.parentPhone || 'N/A',
      checked: false
    }))
  }))
}
```

### 4. Render map với tuyến đường
- Sử dụng **OpenRouteService API** để vẽ tuyến đường giữa các điểm dừng
- Hiển thị markers cho tất cả stops
- Hiển thị danh sách học sinh tại điểm hiện tại

## API Endpoints sử dụng

### Backend đã có (không cần chỉnh)
1. **GET /api/v1/trips**
   - Query params: `tripDate`, `status`
   - Không cần `driverId` filter vì frontend sẽ filter sau

2. **GET /api/v1/schedules/{scheduleId}**
   - Lấy thông tin lịch trình
   - Trả về: `routeId`, `startTime`, `endTime`

3. **GET /api/v1/routes/{routeId}**
   - Lấy chi tiết tuyến đường
   - Include: stops với students, coordinates

## Error Handling

### Trường hợp 1: Không có trip hôm nay
```
Hiển thị: "Không có chuyến đi nào được phân công hôm nay"
Action: Nút "Quay về Dashboard"
```

### Trường hợp 2: Lỗi kết nối API
```
Hiển thị: "Lỗi kết nối API. Vui lòng kiểm tra backend."
Action: Nút "Quay về Dashboard"
```

### Trường hợp 3: Thiếu dữ liệu (schedule/route)
```
Hiển thị: "Không thể tải thông tin lịch trình/tuyến đường"
Action: Nút "Quay về Dashboard"
```

## Files đã chỉnh sửa

### Frontend
1. **tripService.js**
   - `getAllTrips(params)` - chấp nhận query params
   - `getAssignedTripForDriver(driverId, date, statuses)` - helper tìm trip

2. **PickUpMap.jsx**
   - Thêm logic fetch trip từ API
   - Thêm loading/error states
   - Transform API data sang component format
   - Null-safe rendering

### Backend
❌ **Không chỉnh sửa backend** theo yêu cầu

## Testing

### Test case 1: Driver có trip hôm nay
```
Input: DRIVER_ID = 2, ngày hôm nay có trip status SCHEDULED
Expected: Load màn hình map với đầy đủ stops và students
```

### Test case 2: Driver không có trip
```
Input: DRIVER_ID = 99, không có trip nào
Expected: Hiển thị message "Không có chuyến đi..." + nút quay về
```

### Test case 3: Backend offline
```
Input: Backend không chạy
Expected: Hiển thị "Lỗi kết nối API..." + nút quay về
```

## Lưu ý
- DRIVER_ID hiện tại hardcode = 2, cần thay bằng session/context sau
- OpenRouteService API key cần thay trong `PickUpMap.jsx`
- Nếu route không có coordinates, map sẽ không vẽ được polyline
