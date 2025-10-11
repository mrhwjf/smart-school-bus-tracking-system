
-- Notes:
-- 1) Use singular/plural names consistently: this script uses plural table names to avoid reserved-word issues (e.g. `users` instead of `user`).
-- 2) `users` is the parent table for all user types. `parents` and `drivers` are 1:1 sub-type tables whose PK equals `users.user_id`.
-- 3) Foreign keys use sensible ON DELETE behavior: cascade where it makes sense (child rows removed when parent removed), set null for optional relations.
-- 4) Added created_at/updated_at timestamps and useful indexes.
CREATE DATABASE bus_tracking;
USE bus_tracking;

-- Roles
CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Central users table (avoids using the reserved word `user`)
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role_id (role_id)
  -- foreign key moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent subtype: primary key equals users.user_id (one-to-one)
CREATE TABLE parents (
  parent_id INT PRIMARY KEY,
  relationship enum('PARENTS', 'GUARDIANS', 'RELATIVES') DEFAULT 'PARENTS',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  -- foreign key moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Driver subtype: primary key equals users.user_id (one-to-one)
CREATE TABLE drivers (
  driver_id INT PRIMARY KEY,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_permit VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  -- foreign key moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Students
CREATE TABLE students (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50),
  gender ENUM('MALE','FEMALE','OTHER'),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_id (parent_id)
  -- foreign key moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Buses
CREATE TABLE buses (
  bus_id INT PRIMARY KEY AUTO_INCREMENT,
  driver_id INT UNIQUE,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  model VARCHAR(100),
  status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE') DEFAULT 'ACTIVE',
  capacity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_driver_id (driver_id)
  -- foreign key moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Routes
CREATE TABLE routes (
  route_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stops
CREATE TABLE stops (
  stop_id INT PRIMARY KEY AUTO_INCREMENT,
  route_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address VARCHAR(255),
  seq_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_route_id (route_id)
  -- foreign key moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trips
CREATE TABLE trips (
  trip_id INT PRIMARY KEY AUTO_INCREMENT,
  route_id INT NOT NULL,
  bus_id INT NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(50) DEFAULT 'SCHEDULED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trip_route (route_id),
  INDEX idx_trip_bus (bus_id)
  -- foreign keys moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ordered mapping of stops for each trip
CREATE TABLE trip_stops (
  trip_id INT NOT NULL,
  stop_id INT NOT NULL,
  stop_order INT DEFAULT 0,
  PRIMARY KEY (trip_id, stop_id),
  INDEX idx_ts_trip (trip_id),
  INDEX idx_ts_stop (stop_id)
  -- foreign keys moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Students assigned to trips (many-to-many)
CREATE TABLE trip_passengers (
  trip_id INT NOT NULL,
  student_id INT NOT NULL,
  PRIMARY KEY (trip_id, student_id),
  INDEX idx_tp_trip (trip_id),
  INDEX idx_tp_student (student_id)
  -- foreign keys moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pickup records: when a student was picked up/dropped off at a stop
CREATE TABLE pickup_records (
  record_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  stop_id INT NOT NULL,
  status ENUM('PICKED_UP', 'DROPPED_OFF', 'MISSED', 'WAITING') DEFAULT 'WAITING',
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pr_student (student_id),
  INDEX idx_pr_stop (stop_id)
  -- foreign keys moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Navigation logs from buses (GPS updates)
CREATE TABLE navigation_logs (
  update_id INT PRIMARY KEY AUTO_INCREMENT,
  bus_id INT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nav_bus (bus_id)
  -- foreign key moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messages and notifications
CREATE TABLE messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  type ENUM('INFO', 'ALERT', 'REMINDER', 'WARNING') DEFAULT 'INFO',
  INDEX idx_notifications_message (message_id)
  -- foreign key moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recipients of notifications
CREATE TABLE user_notifications (
  notification_id INT NOT NULL,
  recipient_id INT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (notification_id, recipient_id),
  INDEX idx_un_notification (notification_id),
  INDEX idx_un_recipient (recipient_id)
  -- foreign keys moved to the end via ALTER TABLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Helpful sample data comments:
-- INSERT INTO roles (name) VALUES ('ADMIN'),('DRIVER'),('PARENT');

-- End of table definitions

-- Data seeding for schema
-- Roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Quản trị hệ thống - có toàn quyền quản lý người dùng, xe buýt, tuyến đường'),
('DRIVER', 'Tài xế xe buýt - chịu trách nhiệm đưa đón học sinh theo tuyến được phân công'),
('PARENT', 'Phụ huynh - có thể xem thông tin và theo dõi xe của con em mình');

-- Users
INSERT INTO users (role_id, name, phone_number, email, password_hash) VALUES
(1, 'Nguyễn Văn Quản', '0901000001', 'admin@ssb.edu.vn', 'hashed_admin_pw'),
(2, 'Trần Văn Tài', '0902000001', 'tai.tran@ssb.edu.vn', 'hashed_driver_pw'),
(2, 'Lê Thị Bình', '0902000002', 'binh.le@ssb.edu.vn', 'hashed_driver_pw'),
(3, 'Phạm Minh Anh', '0903000001', 'anh.pham@ssb.edu.vn', 'hashed_parent_pw'),
(3, 'Ngô Thị Hoa', '0903000002', 'hoa.ngo@ssb.edu.vn', 'hashed_parent_pw');

-- Drivers
INSERT INTO drivers (driver_id, license_number, vehicle_permit) VALUES
(2, '79A-123456', 'Giấy phép lái xe hạng D'),
(3, '51B-654321', 'Giấy phép lái xe hạng D');

-- Parents
INSERT INTO parents (parent_id, relationship) VALUES
(4, 'PARENTS'),
(5, 'PARENTS');

-- Students
INSERT INTO students (parent_id, name, class, gender, date_of_birth) VALUES
(4, 'Phạm Tuấn Kiệt', 'Lớp 5A', 'MALE', '2015-06-12'),
(4, 'Phạm Ngọc Mai', 'Lớp 3B', 'FEMALE', '2017-04-20'),
(5, 'Trần Quốc Huy', 'Lớp 4C', 'MALE', '2016-02-10');

-- Buses
INSERT INTO buses (driver_id, plate_number, model, status, capacity) VALUES
(2, '51B-99888', 'Hyundai County 2021', 'ACTIVE', 29),
(3, '79A-77665', 'Thaco Town 2020', 'ACTIVE', 30);

-- Routes
INSERT INTO routes (name, description) VALUES
('Tuyến 1: Quận 1 - Trường Tiểu học DEF', 'Đưa đón học sinh khu vực Quận 1 đến trường DEF'),
('Tuyến 2: Quận Bình Thạnh - Trường Tiểu học DEF', 'Đưa đón học sinh khu vực Bình Thạnh đến trường DEF');

-- Stops
INSERT INTO stops (route_id, name, latitude, longitude, address, seq_index) VALUES
(1, 'Điểm đón Nguyễn Huệ', 10.776889, 106.700806, 'Số 1 Nguyễn Huệ, Quận 1, TP.HCM', 1),
(1, 'Điểm đón Lý Tự Trọng', 10.778220, 106.695300, '45 Lý Tự Trọng, Quận 1, TP.HCM', 2),
(1, 'Trường Tiểu học DEF', 10.773500, 106.689900, '12 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM', 3),
(2, 'Điểm đón Phan Văn Trị', 10.810000, 106.688500, '200 Phan Văn Trị, Bình Thạnh, TP.HCM', 1),
(2, 'Điểm đón Lê Quang Định', 10.805500, 106.690700, '150 Lê Quang Định, Bình Thạnh, TP.HCM', 2),
(2, 'Trường Tiểu học DEF', 10.773500, 106.689900, '12 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM', 3);

-- Trips
INSERT INTO trips (route_id, bus_id, start_time, end_time, status) VALUES
(1, 1, '2025-10-11 06:30:00', '2025-10-11 07:15:00', 'COMPLETED'),
(2, 2, '2025-10-11 06:45:00', '2025-10-11 07:30:00', 'SCHEDULED');

-- Trip Stops
INSERT INTO trip_stops (trip_id, stop_id, stop_order) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(2, 4, 1),
(2, 5, 2),
(2, 6, 3);

-- Trip Passengers
INSERT INTO trip_passengers (trip_id, student_id) VALUES
(1, 1),
(1, 2),
(2, 3);

-- Pickup Records
INSERT INTO pickup_records (student_id, stop_id, status, recorded_at) VALUES
(1, 1, 'PICKED_UP', '2025-10-11 06:40:00'),
(1, 3, 'DROPPED_OFF', '2025-10-11 07:10:00'),
(2, 2, 'PICKED_UP', '2025-10-11 06:45:00'),
(2, 3, 'DROPPED_OFF', '2025-10-11 07:15:00'),
(3, 4, 'WAITING', '2025-10-11 06:50:00');

-- Messages
INSERT INTO messages (message_text) VALUES
('Xe buýt Tuyến 1 đã khởi hành.'),
('Xe buýt Tuyến 2 đang đến điểm đón Phan Văn Trị.'),
('Học sinh Trần Quốc Huy chưa có mặt tại điểm đón.');

-- Notifications
INSERT INTO notifications (message_id, type) VALUES
(1, 'INFO'),
(2, 'REMINDER'),
(3, 'WARNING');

-- User Notifications
INSERT INTO user_notifications (notification_id, recipient_id, read_status) VALUES
(1, 4, FALSE),
(2, 5, FALSE),
(3, 5, FALSE);

-- Navigation Logs
INSERT INTO navigation_logs (bus_id, latitude, longitude) VALUES
(1, 10.775000, 106.698000),
(1, 10.774000, 106.695000),
(2, 10.808000, 106.689000);
 

-- End of data seeding


-- Add foreign key constraints using ALTER TABLE (moved here for readability)
ALTER TABLE users
  ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT;

ALTER TABLE parents
  ADD CONSTRAINT fk_parents_user FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE drivers
  ADD CONSTRAINT fk_drivers_user FOREIGN KEY (driver_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE students
  ADD CONSTRAINT fk_students_parent FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE CASCADE;

ALTER TABLE buses
  ADD CONSTRAINT fk_buses_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE SET NULL;

ALTER TABLE stops
  ADD CONSTRAINT fk_stops_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE;

ALTER TABLE trips
  ADD CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_trips_bus FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE RESTRICT;

ALTER TABLE trip_stops
  ADD CONSTRAINT fk_trip_stops_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_trip_stops_stop FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE RESTRICT;

ALTER TABLE trip_passengers
  ADD CONSTRAINT fk_trip_passengers_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_trip_passengers_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE;

ALTER TABLE pickup_records
  ADD CONSTRAINT fk_pickup_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_pickup_stop FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE RESTRICT;

ALTER TABLE navigation_logs
  ADD CONSTRAINT fk_nav_bus FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE;

ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE SET NULL;

ALTER TABLE user_notifications
  ADD CONSTRAINT fk_un_notification FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_un_recipient FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- End of foreign key ALTER statements
