# API Integration Guide

## Cấu trúc API đã tạo

Frontend đã được tích hợp đầy đủ các API modules để kết nối với backend:

### 📁 Các API Modules

1. **authApi** - Xác thực
   - `login()` - Đăng nhập
   - `logout()` - Đăng xuất
   - `checkSession()` - Kiểm tra phiên đăng nhập

2. **userApi** - Quản lý người dùng
   - `getUserById()` - Lấy thông tin người dùng
   - `getDriverInfo()` - Lấy thông tin tài xế
   - `updateUser()` - Cập nhật người dùng
   - `listUsers()` - Danh sách người dùng

3. **tripApi** - Quản lý chuyến đi
   - `listTrips()` - Danh sách chuyến
   - `getTripById()` - Chi tiết chuyến
   - `getTodayTrips()` - Chuyến hôm nay
   - `getTripHistory()` - Lịch sử chuyến
   - `createTrip()`, `updateTrip()`, `deleteTrip()`

4. **pickupApi** - Ghi nhận đón trả
   - `listPickupRecords()` - Danh sách ghi nhận
   - `getPickupRecordsByTrip()` - Ghi nhận theo chuyến
   - `createPickupRecord()` - Tạo ghi nhận mới
   - `updatePickupRecord()` - Cập nhật ghi nhận

5. **routeApi** - Quản lý tuyến đường
   - `listRoutes()` - Danh sách tuyến
   - `getRouteById()` - Chi tiết tuyến
   - `getRouteStops()` - Điểm dừng trên tuyến
   - `getRoutePassengers()` - Học sinh trên tuyến

6. **stopApi** - Quản lý điểm dừng
   - `listStops()` - Danh sách điểm dừng
   - `getStopById()` - Chi tiết điểm dừng
   - CRUD operations

7. **studentApi** - Quản lý học sinh
   - `listStudents()` - Danh sách học sinh
   - `getStudentById()` - Chi tiết học sinh
   - CRUD operations

8. **busApi** - Quản lý xe buýt
   - `listBuses()` - Danh sách xe
   - `getBusById()` - Chi tiết xe
   - CRUD operations

9. **scheduleApi** - Quản lý lịch trình
   - `listSchedules()` - Danh sách lịch
   - `getDriverSchedules()` - Lịch của tài xế
   - `getScheduleDays()` - Chi tiết ngày trong lịch
   - CRUD operations

10. **notificationApi** - Quản lý thông báo
    - `listNotifications()` - Danh sách thông báo
    - `getUserNotifications()` - Thông báo của người dùng
    - `markAsRead()` - Đánh dấu đã đọc
    - `sendNotification()` - Gửi thông báo

## 🚀 Cách sử dụng

### 1. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cấu hình URL API backend:
```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Import và sử dụng trong component

```jsx
import { authApi, tripApi, userApi } from '../api';

// Trong component
const handleLogin = async () => {
  try {
    const result = await authApi.login({
      email: 'driver@example.com',
      password: '123456'
    });
    console.log('Login success:', result);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Lấy chuyến hôm nay
const fetchTodayTrips = async (driverId) => {
  try {
    const result = await tripApi.getTodayTrips(driverId);
    console.log('Today trips:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Lấy thông tin tài xế
const fetchDriverInfo = async (driverId) => {
  try {
    const result = await userApi.getDriverInfo(driverId);
    console.log('Driver info:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 3. Ví dụ tích hợp vào Login component

```jsx
import React, { useState } from 'react';
import { authApi } from '../../api';

const Login = ({ onLogin }) => {
  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authApi.login({
        email: driverId, // hoặc phone
        password: password
      });
      
      // Lưu thông tin session
      localStorage.setItem('userId', result.userId);
      localStorage.setItem('roleId', result.roleId);
      
      // Callback success
      onLogin(result);
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... UI code
  );
};
```

### 4. Ví dụ tích hợp vào DriverDashboard

```jsx
import React, { useState, useEffect } from 'react';
import { userApi, tripApi, busApi } from '../../api';

const DriverDashboard = () => {
  const [driverInfo, setDriverInfo] = useState(null);
  const [todayTrips, setTodayTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      // Lấy userId từ session/localStorage
      const userId = localStorage.getItem('userId');
      
      // Lấy thông tin tài xế
      const userResult = await userApi.getDriverInfo(userId);
      setDriverInfo(userResult.data);
      
      // Lấy chuyến hôm nay
      const tripsResult = await tripApi.getTodayTrips(userId);
      setTodayTrips(tripsResult.data);
      
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    // ... UI code với driverInfo và todayTrips
  );
};
```

## 🔐 Authentication

API sử dụng session cookies, axios đã được cấu hình với `withCredentials: true` để tự động gửi cookies với mỗi request.

## 📝 Response Format

Tất cả API responses theo format:

```javascript
{
  success: true/false,
  message: "Success/Error message",
  data: { ... },
  timestamp: "2024-11-30T..."
}
```

## ⚠️ Error Handling

Các lỗi phổ biến:
- `401 Unauthorized` - Chưa đăng nhập
- `403 Forbidden` - Không có quyền
- `404 Not Found` - Không tìm thấy
- `500 Internal Server Error` - Lỗi server

## 🔄 Pagination

Các API list hỗ trợ pagination:

```javascript
const params = {
  page: 0,     // Trang hiện tại (bắt đầu từ 0)
  size: 10,    // Số items mỗi trang
};

const result = await tripApi.listTrips(params);
// result.data.content - mảng items
// result.data.totalElements - tổng số items
// result.data.totalPages - tổng số trang
```

## 📦 Dependencies

- `axios` - HTTP client (đã có sẵn trong package.json nếu cần)

Nếu chưa có axios, cài đặt:
```bash
npm install axios
```

## 🎯 Next Steps

1. Tích hợp API vào các components
2. Thêm loading states
3. Thêm error handling UI
4. Implement caching nếu cần (React Query/SWR)
5. Add authentication context/provider
