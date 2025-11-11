-- Notes:
-- 1) All foreign keys, primary keys (composite), checks, and indexes are defined at the end of the file
--    using ALTER TABLE and CREATE INDEX for separation of structure and constraints.
-- 2) FINALIZED: Redundant columns (stops.seq_index, buses.driver_id) have been removed for a cleaner design.
-- 3) FINALIZED: ON DELETE logic for routes -> route_stops changed from RESTRICT to CASCADE.

CREATE DATABASE bus_tracking;
USE bus_tracking;

-- --- TABLE DEFINITIONS (Structure Only) ---

-- Roles
CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Central users table
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  locked BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parent subtype: primary key equals users.user_id (one-to-one)
CREATE TABLE parents (
  parent_id INT PRIMARY KEY,
  relationship ENUM('PARENT', 'GUARDIAN', 'RELATIVE') DEFAULT 'PARENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Driver subtype: primary key equals users.user_id (one-to-one)
CREATE TABLE drivers (
  driver_id INT PRIMARY KEY,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_permit VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Students
CREATE TABLE students (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NULL,
  name VARCHAR(255) NOT NULL,
  class_id INT NULL,
  gender ENUM('MALE','FEMALE','OTHER'),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Classes for students
CREATE TABLE classes (
  class_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Buses (Driver is assigned via schedules, not here)
CREATE TABLE buses (
  bus_id INT PRIMARY KEY AUTO_INCREMENT,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  model VARCHAR(100),
  status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE') DEFAULT 'ACTIVE',
  capacity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Routes: Templates for bus routes
CREATE TABLE routes (
  route_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bus schedules: Assign buses and drivers to routes with shift times
CREATE TABLE schedules (
  schedule_id INT PRIMARY KEY AUTO_INCREMENT,
  route_id INT NOT NULL,
  bus_id INT NOT NULL,
  driver_id INT NOT NULL, -- Main driver
  shift ENUM('MORNING', 'AFTERNOON') DEFAULT 'MORNING',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Schedule days for routes (which days the route operates)
CREATE TABLE schedule_days (
  schedule_id INT NOT NULL,
  day_of_week ENUM('MON','TUE','WED','THU','FRI','SAT','SUN') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stops: A physical location where buses pick up/drop off students (No sequence data here)
CREATE TABLE stops (
  stop_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Route stops: Ordered mapping of stops for each route (Junction Table)
CREATE TABLE route_stops (
  route_id INT NOT NULL,
  stop_id INT NOT NULL,
  stop_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Students assigned to routes (many-to-many)
CREATE TABLE route_passengers (
  route_id INT NOT NULL,
  student_id INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trips: Actual bus trips on specific routes
CREATE TABLE trips (
  trip_id INT PRIMARY KEY AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  trip_date DATE NOT NULL,
  driver_id INT NULL, -- optional override if a different driver fills in
  status ENUM('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'SCHEDULED',
  actual_start_time TIMESTAMP NULL,
  actual_end_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pickup records: when a student was picked up/dropped off at a stop
CREATE TABLE pickup_records (
  record_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  stop_id INT NOT NULL,
  trip_id INT NOT NULL,
  status ENUM('PICKED_UP', 'DROPPED_OFF', 'MISSED', 'WAITING') DEFAULT 'WAITING',
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messages and notifications
CREATE TABLE messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT,
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  type ENUM('INFO', 'SUCCESS', 'ALERT', 'REMINDER', 'WARNING', 'SYSTEM') DEFAULT 'INFO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recipients of notifications
CREATE TABLE user_notifications (
  notification_id INT NOT NULL,
  recipient_id INT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- --- DATA SEEDING ---

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
(4, 'PARENT'),
(5, 'PARENT');

-- Students
INSERT INTO students (parent_id, name, class_id, gender, date_of_birth) VALUES
(4, 'Phạm Tuấn Kiệt', 5, 'MALE', '2015-06-12'),
(4, 'Phạm Ngọc Mai', 3, 'FEMALE', '2017-04-20'),
(5, 'Trần Quốc Huy', 4, 'MALE', '2016-02-10');

-- Classes
INSERT INTO classes (name) VALUES
('Lớp 3A'),
('Lớp 3B'),
('Lớp 4A'),
('Lớp 4B'),
('Lớp 5A');

-- Buses
INSERT INTO buses (plate_number, model, status, capacity) VALUES
('51B-99888', 'Hyundai County 2021', 'ACTIVE', 30), -- ID 1
('79A-77665', 'Thaco Town 2020', 'ACTIVE', 30); -- ID 2

-- Routes
INSERT INTO routes (name, description) VALUES
('Tuyến 1: Quận 1 - Trường Tiểu học DEF', 'Đưa đón học sinh khu vực Quận 1 đến trường DEF'), -- ID 1
('Tuyến 2: Quận Bình Thạnh - Trường Tiểu học DEF', 'Đưa đón học sinh khu vực Bình Thạnh đến trường DEF'); -- ID 2

-- Schedules
INSERT INTO schedules (route_id, bus_id, driver_id, shift, start_time, end_time, active) VALUES
(1, 1, 2, 'MORNING', '06:30:00', '07:15:00', TRUE), -- ID 1 (Bus 1, Driver 2)
(2, 2, 3, 'MORNING', '06:45:00', '07:30:00', TRUE); -- ID 2 (Bus 2, Driver 3)

-- Schedule Days
INSERT INTO schedule_days (schedule_id, day_of_week) VALUES
(1, 'MON'),
(1, 'TUE'),
(1, 'WED'),
(1, 'THU'),
(1, 'FRI'),
(2, 'MON'),
(2, 'TUE'),
(2, 'WED'),
(2, 'THU'),
(2, 'FRI');

-- Stops
INSERT INTO stops (name, latitude, longitude, address) VALUES
('Điểm đón Nguyễn Huệ', 10.776889, 106.700806, 'Số 1 Nguyễn Huệ, Quận 1, TP.HCM'), -- ID 1
('Điểm đón Lý Tự Trọng', 10.778220, 106.695300, '45 Lý Tự Trọng, Quận 1, TP.HCM'), -- ID 2
('Trường Tiểu học DEF', 10.773500, 106.689900, '12 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM'), -- ID 3 (School Stop)
('Điểm đón Phan Văn Trị', 10.810000, 106.688500, '200 Phan Văn Trị, Bình Thạnh, TP.HCM'), -- ID 4
('Điểm đón Lê Quang Định', 10.805500, 106.690700, '150 Lê Quang Định, Bình Thạnh, TP.HCM'); -- ID 5

-- Route Stops (Defines the sequence for each route)
INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES
-- Route 1: Stop IDs 1 -> 2 -> 3 (School)
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
-- Route 2: Stop IDs 4 -> 5 -> 3 (School)
(2, 4, 1),
(2, 5, 2),
(2, 3, 3);

-- Trips
INSERT INTO trips (schedule_id, trip_date, status, actual_start_time, actual_end_time, driver_id) VALUES
(1, '2025-10-11', 'COMPLETED', '2025-10-11 06:30:00', '2025-10-11 07:15:00', NULL), -- Trip ID 1 (Schedule 1, Route 1)
(2, '2025-10-11', 'SCHEDULED', NULL, NULL, NULL);                               -- Trip ID 2 (Schedule 2, Route 2)

-- Route Passengers
INSERT INTO route_passengers (route_id, student_id) VALUES
(1, 1),
(1, 2),
(2, 3);

-- Pickup Records
INSERT INTO pickup_records (student_id, stop_id, trip_id, status, recorded_at) VALUES
(1, 1, 1, 'PICKED_UP', '2025-10-11 06:40:00'),
(1, 3, 1, 'DROPPED_OFF', '2025-10-11 07:10:00'),
(2, 2, 1, 'PICKED_UP', '2025-10-11 06:45:00'),
(2, 3, 1, 'DROPPED_OFF', '2025-10-11 07:15:00'),
(3, 4, 2, 'WAITING', '2025-10-11 06:50:00');

-- Messages
INSERT INTO messages (sender_id, message_text) VALUES
(1, 'Xe buýt Tuyến 1 đã khởi hành.'),
(1, 'Xe buýt Tuyến 2 đang đến điểm đón Phan Văn Trị.'),
(2, 'Học sinh Trần Quốc Huy chưa có mặt tại điểm đón.');

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

-- --- CONSTRAINTS, COMPOSITE KEYS, AND INDEXES ---

-- PRIMARY KEY AND UNIQUE CONSTRAINTS (COMPOSITE)
ALTER TABLE schedule_days ADD PRIMARY KEY (schedule_id, day_of_week);
ALTER TABLE route_stops ADD PRIMARY KEY (route_id, stop_id);
ALTER TABLE route_passengers ADD PRIMARY KEY (route_id, student_id);
ALTER TABLE user_notifications ADD PRIMARY KEY (notification_id, recipient_id);


-- FOREIGN KEY CONSTRAINTS

-- User Relationships
ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT;
ALTER TABLE parents ADD CONSTRAINT fk_parents_user FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE drivers ADD CONSTRAINT fk_drivers_user FOREIGN KEY (driver_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- Students
ALTER TABLE students ADD CONSTRAINT fk_students_parent FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE SET NULL;

-- Classes
ALTER TABLE students ADD CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE SET NULL;

-- Schedules & Routes
ALTER TABLE schedules
  ADD CONSTRAINT fk_schedule_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_schedule_bus FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_schedule_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE RESTRICT;

ALTER TABLE schedule_days ADD CONSTRAINT fk__schedule_day FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE;

-- Route to Stops
ALTER TABLE route_stops
  ADD CONSTRAINT fk_rs_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE, -- If route is deleted, its stops definition is deleted
  ADD CONSTRAINT fk_rs_stop FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE RESTRICT;

-- Trips
ALTER TABLE trips
  ADD CONSTRAINT fk_trips_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_trips_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE SET NULL; -- Trip remains, but driver assignment is cleared

-- Route Passengers
ALTER TABLE route_passengers
  ADD CONSTRAINT fk_route_passengers_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_route_passengers_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE;

-- Logs & Records
ALTER TABLE pickup_records
  ADD CONSTRAINT fk_pickup_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_pickup_stop FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_pickup_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE;

-- Messages & Notifications
ALTER TABLE messages ADD CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL; -- Message sender is optional

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE;

ALTER TABLE user_notifications
  ADD CONSTRAINT fk_un_notification FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_un_recipient FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- CHECK CONSTRAINTS
ALTER TABLE stops ADD CONSTRAINT chk_stops_latitude CHECK (latitude BETWEEN -90 AND 90);
ALTER TABLE stops ADD CONSTRAINT chk_stops_longitude CHECK (longitude BETWEEN -180 AND 180);
ALTER TABLE trips ADD CONSTRAINT chk_trip_times CHECK (actual_end_time IS NULL OR actual_start_time IS NULL OR actual_end_time > actual_start_time);


-- ADDITIONAL PERFORMANCE INDEXES
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_route_stops_route_order ON route_stops(route_id, stop_order);
CREATE INDEX idx_trips_status_date ON trips(status, trip_date);
CREATE INDEX idx_trips_schedule_date ON trips(schedule_id, trip_date);
CREATE INDEX idx_pr_trip_time ON pickup_records(trip_id, recorded_at);
CREATE INDEX idx_pr_student_trip ON pickup_records(student_id, trip_id);
CREATE INDEX idx_pr_composite ON pickup_records(student_id, stop_id, trip_id);
CREATE INDEX idx_notifications_message ON notifications(message_id);
CREATE INDEX idx_un_recipient_read ON user_notifications(recipient_id, read_status);
