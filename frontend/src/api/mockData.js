// Mock dataset roughly aligned with BUS_TRACKING_v2.sql for UI development

export const roles = [
  { role_id: 1, name: 'ADMIN' },
  { role_id: 2, name: 'DRIVER' },
  { role_id: 3, name: 'PARENT' },
]

export const users = [
  { user_id: 1, role_id: 1, name: 'Nguyễn Văn Quản', phone_number: '0901000001', email: 'admin@ssb.edu.vn', is_active: true },
  { user_id: 2, role_id: 2, name: 'Trần Văn Tài', phone_number: '0902000001', email: 'tai.tran@ssb.edu.vn', is_active: true },
  { user_id: 3, role_id: 2, name: 'Lê Thị Bình', phone_number: '0902000002', email: 'binh.le@ssb.edu.vn', is_active: true },
  { user_id: 4, role_id: 3, name: 'Phạm Minh Anh', phone_number: '0903000001', email: 'anh.pham@ssb.edu.vn', is_active: true },
  { user_id: 5, role_id: 3, name: 'Ngô Thị Hoa', phone_number: '0903000002', email: 'hoa.ngo@ssb.edu.vn', is_active: true },
  { user_id: 6, role_id: 2, name: 'Đỗ Văn Minh', phone_number: '0902000003', email: 'minh.do@ssb.edu.vn', is_active: true },
  { user_id: 7, role_id: 2, name: 'Phan Thị Hồng', phone_number: '0902000004', email: 'hong.phan@ssb.edu.vn', is_active: true },
  { user_id: 8, role_id: 2, name: 'Vũ Anh Khoa', phone_number: '0902000005', email: 'khoa.vu@ssb.edu.vn', is_active: true },
]

export const drivers = [
  { driver_id: 2, license_number: '79A-123456' },
  { driver_id: 3, license_number: '51B-654321' },
  { driver_id: 6, license_number: '59C-112233' },
  { driver_id: 7, license_number: '60D-445566' },
  { driver_id: 8, license_number: '62E-778899' },
]

export const parents = [
  { parent_id: 4, relationship: 'PARENTS' },
  { parent_id: 5, relationship: 'PARENTS' },
]

export const students = [
  { student_id: 1, parent_id: 4, name: 'Phạm Tuấn Kiệt', class: 'Lớp 5A', gender: 'MALE', date_of_birth: '2015-06-12' },
  { student_id: 2, parent_id: 4, name: 'Phạm Ngọc Mai', class: 'Lớp 3B', gender: 'FEMALE', date_of_birth: '2017-04-20' },
  { student_id: 3, parent_id: 5, name: 'Trần Quốc Huy', class: 'Lớp 4C', gender: 'MALE', date_of_birth: '2016-02-10' },
]

export const buses = [
  { bus_id: 1, driver_id: 2, plate_number: '51B-99888', model: 'Hyundai County 2021', status: 'ACTIVE', capacity: 29 },
  { bus_id: 2, driver_id: 3, plate_number: '79A-77665', model: 'Thaco Town 2020', status: 'ACTIVE', capacity: 30 },
  { bus_id: 3, driver_id: 6, plate_number: '59C-33445', model: 'Isuzu QKR', status: 'ACTIVE', capacity: 25 },
  { bus_id: 4, driver_id: 7, plate_number: '60D-55667', model: 'Kia Bongo', status: 'ACTIVE', capacity: 22 },
  { bus_id: 5, driver_id: 8, plate_number: '62E-88990', model: 'Fuso Rosa', status: 'ACTIVE', capacity: 28 },
]

export const routes = [
  { route_id: 1, name: 'Tuyến 1: Quận 1 - Trường Tiểu học DEF', description: 'Đưa đón học sinh khu vực Quận 1 đến trường DEF' },
  { route_id: 2, name: 'Tuyến 2: Quận Bình Thạnh - Trường Tiểu học DEF', description: 'Đưa đón học sinh khu vực Bình Thạnh đến trường DEF' },
  { route_id: 3, name: 'Tuyến 3: Quận 3 - Trường Tiểu học GHI', description: 'Đưa đón học sinh khu vực Quận 3 đến trường GHI' },
  { route_id: 4, name: 'Tuyến 4: Quận Phú Nhuận - Trường Tiểu học JKL', description: 'Đưa đón học sinh khu vực Phú Nhuận đến trường JKL' },
  { route_id: 5, name: 'Tuyến 5: Quận Tân Bình - Trường Tiểu học MNO', description: 'Đưa đón học sinh khu vực Tân Bình đến trường MNO' },
]

export const stops = [
  { stop_id: 1, route_id: 1, name: 'Điểm đón Nguyễn Huệ', latitude: 10.776889, longitude: 106.700806, address: 'Số 1 Nguyễn Huệ, Q1, TP.HCM', seq_index: 1 },
  { stop_id: 2, route_id: 1, name: 'Điểm đón Lý Tự Trọng', latitude: 10.77822, longitude: 106.6953, address: '45 Lý Tự Trọng, Q1, TP.HCM', seq_index: 2 },
  { stop_id: 3, route_id: 1, name: 'Trường Tiểu học DEF', latitude: 10.7735, longitude: 106.6899, address: '12 Nguyễn Bỉnh Khiêm, Q1, TP.HCM', seq_index: 3 },
  { stop_id: 4, route_id: 2, name: 'Điểm đón Phan Văn Trị', latitude: 10.81, longitude: 106.6885, address: '200 Phan Văn Trị, Bình Thạnh, TP.HCM', seq_index: 1 },
  { stop_id: 5, route_id: 2, name: 'Điểm đón Lê Quang Định', latitude: 10.8055, longitude: 106.6907, address: '150 Lê Quang Định, Bình Thạnh, TP.HCM', seq_index: 2 },
  { stop_id: 6, route_id: 2, name: 'Trường Tiểu học DEF', latitude: 10.7735, longitude: 106.6899, address: '12 Nguyễn Bỉnh Khiêm, Q1, TP.HCM', seq_index: 3 },
  // Route 3 stops (Quận 3)
  { stop_id: 7, route_id: 3, name: 'Điểm đón Cách Mạng Tháng 8', latitude: 10.7722, longitude: 106.6891, address: 'Cách Mạng Tháng 8, Q3', seq_index: 1 },
  { stop_id: 8, route_id: 3, name: 'Điểm đón Lê Văn Sỹ', latitude: 10.7685, longitude: 106.6860, address: 'Lê Văn Sỹ, Q3', seq_index: 2 },
  { stop_id: 9, route_id: 3, name: 'Trường Tiểu học GHI', latitude: 10.7670, longitude: 106.6815, address: 'Đường GHI, Q3', seq_index: 3 },
  // Route 4 stops (Phú Nhuận)
  { stop_id: 10, route_id: 4, name: 'Điểm đón Phan Xích Long', latitude: 10.7925, longitude: 106.6832, address: 'Phan Xích Long, PN', seq_index: 1 },
  { stop_id: 11, route_id: 4, name: 'Điểm đón Nguyễn Văn Trỗi', latitude: 10.7890, longitude: 106.6839, address: 'Nguyễn Văn Trỗi, PN', seq_index: 2 },
  { stop_id: 12, route_id: 4, name: 'Trường Tiểu học JKL', latitude: 10.7860, longitude: 106.6800, address: 'Đường JKL, PN', seq_index: 3 },
  // Route 5 stops (Tân Bình)
  { stop_id: 13, route_id: 5, name: 'Điểm đón Hoàng Văn Thụ', latitude: 10.7898, longitude: 106.6593, address: 'Hoàng Văn Thụ, TB', seq_index: 1 },
  { stop_id: 14, route_id: 5, name: 'Điểm đón Trường Chinh', latitude: 10.7865, longitude: 106.6518, address: 'Trường Chinh, TB', seq_index: 2 },
  { stop_id: 15, route_id: 5, name: 'Trường Tiểu học MNO', latitude: 10.7800, longitude: 106.6470, address: 'Đường MNO, TB', seq_index: 3 },
]

export const trips = [
  { trip_id: 1, route_id: 1, bus_id: 1, start_time: '2025-10-11T06:30:00', end_time: '2025-10-11T07:15:00', status: 'COMPLETED' },
  { trip_id: 2, route_id: 2, bus_id: 2, start_time: '2025-10-11T06:45:00', end_time: '2025-10-11T07:30:00', status: 'SCHEDULED' },
  { trip_id: 3, route_id: 3, bus_id: 3, start_time: '2025-10-11T06:35:00', end_time: '2025-10-11T07:20:00', status: 'SCHEDULED' },
  { trip_id: 4, route_id: 4, bus_id: 4, start_time: '2025-10-11T06:40:00', end_time: '2025-10-11T07:25:00', status: 'SCHEDULED' },
  { trip_id: 5, route_id: 5, bus_id: 5, start_time: '2025-10-11T06:50:00', end_time: '2025-10-11T07:35:00', status: 'SCHEDULED' },
]

export const trip_stops = [
  { trip_id: 1, stop_id: 1, stop_order: 1 },
  { trip_id: 1, stop_id: 2, stop_order: 2 },
  { trip_id: 1, stop_id: 3, stop_order: 3 },
  { trip_id: 2, stop_id: 4, stop_order: 1 },
  { trip_id: 2, stop_id: 5, stop_order: 2 },
  { trip_id: 2, stop_id: 6, stop_order: 3 },
  // trip 3 stops (route 3)
  { trip_id: 3, stop_id: 7, stop_order: 1 },
  { trip_id: 3, stop_id: 8, stop_order: 2 },
  { trip_id: 3, stop_id: 9, stop_order: 3 },
  // trip 4 stops (route 4)
  { trip_id: 4, stop_id: 10, stop_order: 1 },
  { trip_id: 4, stop_id: 11, stop_order: 2 },
  { trip_id: 4, stop_id: 12, stop_order: 3 },
  // trip 5 stops (route 5)
  { trip_id: 5, stop_id: 13, stop_order: 1 },
  { trip_id: 5, stop_id: 14, stop_order: 2 },
  { trip_id: 5, stop_id: 15, stop_order: 3 },
]

export const trip_passengers = [
  { trip_id: 1, student_id: 1 },
  { trip_id: 1, student_id: 2 },
  { trip_id: 2, student_id: 3 },
  { trip_id: 3, student_id: 1 },
  { trip_id: 4, student_id: 2 },
  { trip_id: 5, student_id: 3 },
]

export const pickup_records = [
  { record_id: 1, student_id: 1, stop_id: 1, status: 'PICKED_UP', recorded_at: '2025-10-11T06:40:00' },
  { record_id: 2, student_id: 1, stop_id: 3, status: 'DROPPED_OFF', recorded_at: '2025-10-11T07:10:00' },
  { record_id: 3, student_id: 2, stop_id: 2, status: 'PICKED_UP', recorded_at: '2025-10-11T06:45:00' },
  { record_id: 4, student_id: 2, stop_id: 3, status: 'DROPPED_OFF', recorded_at: '2025-10-11T07:15:00' },
  { record_id: 5, student_id: 3, stop_id: 4, status: 'WAITING', recorded_at: '2025-10-11T06:50:00' },
]

export const navigation_logs = [
  { update_id: 1, bus_id: 1, latitude: 10.775, longitude: 106.698, recorded_at: '2025-10-11T06:35:00' },
  { update_id: 2, bus_id: 1, latitude: 10.774, longitude: 106.695, recorded_at: '2025-10-11T06:38:00' },
  { update_id: 3, bus_id: 2, latitude: 10.808, longitude: 106.689, recorded_at: '2025-10-11T06:55:00' },
  { update_id: 4, bus_id: 3, latitude: 10.771, longitude: 106.687, recorded_at: '2025-10-11T06:40:00' },
  { update_id: 5, bus_id: 4, latitude: 10.789, longitude: 106.683, recorded_at: '2025-10-11T06:45:00' },
  { update_id: 6, bus_id: 5, latitude: 10.786, longitude: 106.651, recorded_at: '2025-10-11T06:55:00' },
]

export const messages = [
  { message_id: 1, message_text: 'Xe buýt Tuyến 1 đã khởi hành.', sent_at: '2025-10-11T06:30:00' },
  { message_id: 2, message_text: 'Xe buýt Tuyến 2 đang đến điểm đón Phan Văn Trị.', sent_at: '2025-10-11T06:50:00' },
  { message_id: 3, message_text: 'Học sinh Trần Quốc Huy chưa có mặt tại điểm đón.', sent_at: '2025-10-11T06:55:00' },
]

export const notifications = [
  { notification_id: 1, message_id: 1, type: 'INFO', sent_at: '2025-10-11T06:30:00' },
  { notification_id: 2, message_id: 2, type: 'REMINDER', sent_at: '2025-10-11T06:50:00' },
  { notification_id: 3, message_id: 3, type: 'WARNING', sent_at: '2025-10-11T06:55:00' },
]

export const user_notifications = [
  { notification_id: 1, recipient_id: 4, read_status: false },
  { notification_id: 2, recipient_id: 5, read_status: false },
  { notification_id: 3, recipient_id: 5, read_status: false },
]
