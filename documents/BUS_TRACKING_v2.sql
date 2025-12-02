CREATE DATABASE family_health_management;
USE family_health_management;

CREATE TABLE `roles` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) UNIQUE NOT NULL,
  `description` text
);

CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `role_id` int,
  `password_hash` varchar(255),
  `name` varchar(255),
  `phone` varchar(255) UNIQUE,
  `email` varchar(255) UNIQUE,
  `profile_url` varchar(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `locked` bool NOT NULL DEFAULT false
);

-- Old doctor_profiles table definition
-- CREATE TABLE `doctor_profiles` (
--   `doctor_id` int PRIMARY KEY,
--   `license_number` varchar(255),
--   `certificate_file_url` varchar(255),
--   `verified` bool NOT NULL DEFAULT false
-- );

-- New doctor_profiles table definition
CREATE TABLE `doctor_profiles` (
  `doctor_id` int PRIMARY KEY,
  `facility_id` int,
  `specialization_id` int,
  `license_number` varchar(255),
  `certificate_file_url` varchar(255),
  `verified` bool NOT NULL DEFAULT false
);

CREATE TABLE `doctor_verifications` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `doctor_id` int,
  `admin_id` int,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime,
  `remarks` text
);

CREATE TABLE `specializations` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) UNIQUE NOT NULL,
  `description` text
);

-- Old appointments table definition
-- CREATE TABLE `appointments` (
--   `id` int PRIMARY KEY AUTO_INCREMENT,
--   `issuer_id` int,
--   `patient_id` int,
--   `doctor_id` int,
--   `appointment_datetime` datetime,
--   `location` varchar(255),
--   `status` enum('SCHEDULED','CANCELLED','COMPLETED'),
--   `notes` text
-- );

-- New appointments table definition
CREATE TABLE `appointments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `issuer_id` int,
  `patient_id` int,
  `doctor_id` int,
  `appointment_datetime` datetime,
  `reason` varchar(255),
  `status` enum('PENDING','SCHEDULED','CANCELLED','COMPLETED'),
  `notes` text
);

CREATE TABLE `families` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `creator_id` int,
  `name` varchar(255),
  `address` varchar(255),
  `phone` varchar(255)
);

CREATE TABLE `family_access` (
  `family_id` int,
  `user_id` int,
  `family_creator` boolean,
  Primary key(family_id,user_id)
);

CREATE TABLE `member_access` (
  `member_id` int,
  `doctor_id` int,
  Primary key(member_id, doctor_id)
);

CREATE TABLE `family_members` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `family_id` int,
  `user_id` int,
  `relationship_to_creator_id` int,
  `name` varchar(255),
  `dob` date,
  `gender` enum('MALE','FEMALE','OTHER'),
  `blood_type` enum('A+','A-','B+','B-','AB+','AB-','O+','O-'),
  `phone` varchar(255),
  `profile_url` varchar(255)
);

CREATE TABLE `relationships_to_creator` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `relationship_name` varchar(255) NOT NULL UNIQUE,
  `description` text
);

CREATE TABLE `vaccines` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL UNIQUE
);

CREATE TABLE `vaccination_records` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `family_member_id` int,
  `vacc_id` int,
  `administered_date` date,
  `next_due_date` date
);

CREATE TABLE `facilities` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL
);

CREATE TABLE `medical_records` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `family_member_id` int,
  `doctor_id` int,
  `facility_id` int,
  `date` date,
  `diagnosis` text,
  `treatment` text,
  `follow_up_date` date,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `medical_documents` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `medical_record_id` int,
  `file_name` varchar(255),
  `upload_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `file_url` varchar(255)
);

CREATE TABLE `prescriptions` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `medical_record_id` int,
  `prescribed_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `notes` text
);

CREATE TABLE `drugs` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) UNIQUE NOT NULL,
  `description` text
);

CREATE TABLE `prescription_items` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `prescription_id` int,
  `drug_id` int,
  `dosage` varchar(255),
  `frequency` varchar(255),
  `start_date` date,
  `end_date` date,
  `instructions` text
);

CREATE TABLE `allergies` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `family_member_id` int,
  `allergens` varchar(255),
  `notes` text
);

CREATE TABLE `health_stats_types` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `measurement_unit` varchar(255),
  `name` varchar(255),
  `normal_range_min` decimal(6,2) NULL,
  `normal_range_max` decimal(6,2) NULL,
  `description` text
);

CREATE TABLE `health_stats` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `family_member_id` int,
  `stats_type_id` int,
  `value` decimal(6,2),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `family_invite_codes` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `family_id` int NOT NULL UNIQUE, -- ensures one active code per family
  `code` varchar(255) UNIQUE NOT NULL,
  `updated_at` datetime ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `active` boolean DEFAULT true
);

-- ==========================================
-- Family Health Management - Master Data Seed
-- ==========================================

USE family_health_management;

SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- ROLES
-- =========================
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Quản trị viên hệ thống, có toàn quyền truy cập'),
('DOCTOR', 'Bác sĩ có quyền truy cập hồ sơ y tế của gia đình được liên kết'),
('FAMILY', 'Người tạo và quản lý tài khoản gia đình');

-- =========================
-- VACCINES
-- =========================
INSERT INTO vaccines (name) VALUES
('Viêm gan B'),
('Bại liệt'),
('Sởi - Quai bị - Rubella (MMR)'),
('Uốn ván'),
('Cúm mùa'),
('COVID-19'),
('Lao (BCG)'),
('Bạch hầu'),
('Ho gà'),
('Thủy đậu'),
('Viêm não Nhật Bản'),
('HPV'),
('Phế cầu khuẩn (PCV)'),
('Rotavirus'),
('Hib (Haemophilus influenzae type b)'),
('Tả'),
('Thương hàn'),
('Dại');

-- =========================
-- DRUGS
-- =========================
INSERT INTO drugs (name, description) VALUES
('Paracetamol', 'Thuốc hạ sốt, giảm đau thông thường'),
('Amoxicillin', 'Kháng sinh điều trị nhiễm khuẩn do vi khuẩn gây ra'),
('Metformin', 'Điều trị tiểu đường tuýp 2, giúp kiểm soát đường huyết'),
('Lisinopril', 'Thuốc điều trị cao huyết áp, bảo vệ tim mạch'),
('Atorvastatin', 'Giúp giảm cholesterol và ngăn ngừa bệnh tim mạch'),
('Ibuprofen', 'Thuốc chống viêm không steroid, giảm đau và hạ sốt'),
('Ciprofloxacin', 'Kháng sinh điều trị nhiễm khuẩn đường tiết niệu và hô hấp'),
('Insulin', 'Điều trị tiểu đường, giúp kiểm soát lượng đường trong máu'),
('Amlodipine', 'Thuốc điều trị cao huyết áp và đau thắt ngực'),
('Omeprazole', 'Ức chế bơm proton, điều trị trào ngược dạ dày và loét dạ dày'),
('Aspirin', 'Thuốc giảm đau, chống viêm và ngăn ngừa huyết khối'),
('Levothyroxine', 'Điều trị suy giáp, bổ sung hormone tuyến giáp'),
('Azithromycin', 'Kháng sinh điều trị nhiễm khuẩn đường hô hấp và da'),
('Losartan', 'Thuốc điều trị cao huyết áp và suy tim'),
('Simvastatin', 'Giảm cholesterol, phòng ngừa bệnh tim mạch'),
('Cetirizine', 'Thuốc kháng histamin, điều trị dị ứng và ngứa'),
('Metoprolol', 'Thuốc chẹn beta, điều trị cao huyết áp và rối loạn nhịp tim'),
('Fluoxetine', 'Thuốc chống trầm cảm, điều trị rối loạn lo âu và trầm cảm'),
('Pantoprazole', 'Ức chế bơm proton, điều trị viêm loét dạ dày và trào ngược'),
('Gabapentin', 'Thuốc điều trị động kinh và đau thần kinh');

-- =========================
-- RELATIONSHIPS_TO_CREATOR
-- =========================
INSERT INTO relationships_to_creator (relationship_name, description) VALUES
('Khác', 'Mối quan hệ khác'),
('Vợ', 'Người vợ của người tạo'),
('Chồng', 'Người chồng của người tạo'),
('Con trai', 'Con trai của người tạo'),
('Con gái', 'Con gái của người tạo'),
('Cha', 'Bố của người tạo'),
('Mẹ', 'Mẹ của người tạo'),
('Anh', 'Anh trai ruột của người tạo'),
('Chị', 'Chị gái ruột của người tạo'),
('Em trai', 'Em trai ruột của người tạo'),
('Em gái', 'Em gái ruột của người tạo'),
('Ông nội', 'Ông nội của người tạo'),
('Bà nội', 'Bà nội của người tạo'),
('Ông ngoại', 'Ông ngoại của người tạo'),
('Bà ngoại', 'Bà ngoại của người tạo');

-- =========================
-- FACILITIES
-- =========================
INSERT INTO facilities (name) VALUES
('Bệnh viện Chợ Rẫy'),
('Bệnh viện Đại học Y Dược TP.HCM'),
('Bệnh viện Từ Dũ'),
('Bệnh viện Nhân dân 115'),
('Bệnh viện Nhi Đồng 1'),
('Bệnh viện Ung Bướu TP.HCM'),
('Bệnh viện Quân Y 175'),
('Bệnh viện Đa khoa Quốc tế Vinmec Central Park'),
('Bệnh viện FV (Pháp Việt)'),
('Bệnh viện Đa khoa Tâm Anh TP.HCM'),
('Phòng khám Đa khoa Quốc tế Victoria Healthcare'),
('Phòng khám Đa khoa Vigor Health'),
('Phòng khám Đa khoa Hòa Hảo'),
('Phòng khám Đa khoa Saigon Healthcare');

-- =========================
-- HEALTH_STATS_TYPES
-- =========================
INSERT INTO health_stats_types (name, measurement_unit, normal_range_min, normal_range_max, description) VALUES
('Huyết áp tâm thu', 'mmHg', 90, 120, 'Chỉ số huyết áp tâm thu bình thường'),
('Huyết áp tâm trương', 'mmHg', 60, 80, 'Chỉ số huyết áp tâm trương bình thường'),
('Nhịp tim', 'lần/phút', 60, 100, 'Nhịp tim khi nghỉ ngơi bình thường'),
('Đường huyết lúc đói', 'mg/dL', 70, 100, 'Chỉ số đường huyết bình thường khi đói'),
('Nhiệt độ cơ thể', '°C', 36.1, 37.2, 'Khoảng nhiệt độ cơ thể bình thường'),
('Độ bão hòa oxy trong máu', '%', 95, 100, 'Mức oxy trong máu bình thường'),
('Chiều cao', 'cm', null, null, 'Chiều cao cơ thể con người'),
('Cân nặng', 'kg', null, null, 'Cân nặng cơ thể con người');

-- =========================
-- USERS
-- =========================
INSERT INTO users (role_id, password_hash, name, phone, email, profile_url, locked) VALUES
-- pass: admin_hashed_password
(1, '$2a$10$5cLEAH6w.aAjapwqTwUoCuTz3AptHBMyBxnJccjSS3IEovdF/S3Sq', 'Admin User', '0123456789', 'admin@example.com', 'http://example.com/profile/admin', false),
-- pass: doctor_hashed_password
(2, '$2a$10$1w1WZeFJhuvUSTw.PASfHOov45xWfK2Cggf5izzXeyJoVJCJkIoym', 'Dr. John Doe', '0987654321', 'doctor@example.com', 'http://example.com/profile/doctor', false),
-- pass: family_hashed_password
(3, '$2a$10$NHJHvSJuV7C1ErnfAsOMru16sLoVZhbRf6mskO5pZR3xg428crBbu', 'Family Creator User', '0112233445', 'family@example.com', 'http://example.com/profile/family', false),
-- pass: member_hashed_password
(3, '$2a$10$/YfGL2VwcqbLCnWh3uJcYuYQ8.xnJHQ3d/JMsUZc.wwRTX0pNrwra', 'Family Member User', '0223344556', 'member@example.com', 'http://example.com/profile/member', false);

-- =========================
-- DOCTOR_PROFILES
-- =========================
INSERT INTO doctor_profiles (doctor_id, license_number, certificate_file_url, verified) VALUES
(2, 'DOC123456', 'http://example.com/certificates/doc_john_doe.pdf', true);


-- =========================
-- SPECIALIZATIONS
-- =========================
INSERT INTO specializations (name, description) VALUES
('Nội tổng quát', 'Chẩn đoán và điều trị các bệnh lý nội khoa phổ biến'),
('Nhi khoa', 'Khám và điều trị bệnh cho trẻ sơ sinh, trẻ nhỏ và thanh thiếu niên'),
('Sản phụ khoa', 'Khám thai, sinh nở, điều trị bệnh lý phụ khoa'),
('Tai - Mũi - Họng', 'Điều trị các bệnh lý liên quan đến tai, mũi, họng'),
('Răng - Hàm - Mặt', 'Chăm sóc răng miệng và điều trị các bệnh vùng hàm mặt'),
('Da liễu', 'Điều trị bệnh lý da, tóc, móng và thẩm mỹ da'),
('Tim mạch', 'Chẩn đoán và điều trị bệnh lý tim và mạch máu'),
('Hô hấp', 'Điều trị bệnh phổi và các rối loạn hô hấp'),
('Tiêu hóa', 'Các bệnh lý dạ dày, ruột, gan, tụy'),
('Nội tiết - Tiểu đường', 'Chẩn đoán và điều trị các rối loạn nội tiết và bệnh tiểu đường'),
('Thận - Tiết niệu', 'Điều trị bệnh thận, đường tiết niệu và sinh dục nam'),
('Cơ xương khớp', 'Khám và điều trị bệnh lý xương khớp, chấn thương thể thao'),
('Thần kinh', 'Chẩn đoán và điều trị bệnh lý hệ thần kinh'),
('Ung bướu', 'Khám và điều trị ung thư, khối u lành và ác tính'),
('Huyết học', 'Điều trị các bệnh lý về máu và rối loạn đông máu'),
('Ngoại tổng quát', 'Phẫu thuật và hậu phẫu các bệnh lý ngoại khoa'),
('Chấn thương chỉnh hình', 'Điều trị gãy xương, sai khớp, chấn thương cơ xương khớp'),
('Nhãn khoa', 'Khám và điều trị bệnh về mắt'),
('Tâm thần', 'Khám và điều trị rối loạn tâm lý và tâm thần'),
('Dinh dưỡng', 'Tư vấn và điều trị các vấn đề liên quan đến dinh dưỡng'),
('Lão khoa', 'Khám và điều trị bệnh cho người cao tuổi'),
('Truyền nhiễm', 'Điều trị bệnh do vi khuẩn, virus, ký sinh trùng và nấm'),
('Phục hồi chức năng', 'Vật lý trị liệu và phục hồi sau chấn thương hoặc phẫu thuật');


SET FOREIGN_KEY_CHECKS = 1;


ALTER TABLE `users` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT;

ALTER TABLE `doctor_profiles` ADD FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `doctor_profiles` ADD FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE SET NULL;

ALTER TABLE `doctor_profiles` ADD FOREIGN KEY (`specialization_id`) REFERENCES `specializations` (`id`) ON DELETE SET NULL;

ALTER TABLE `doctor_verifications` ADD FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `doctor_verifications` ADD FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `appointments` ADD FOREIGN KEY (`patient_id`) REFERENCES `family_members` (`id`) ON DELETE CASCADE;

ALTER TABLE `appointments` ADD FOREIGN KEY (`issuer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `appointments` ADD FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `families` ADD FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `family_access` ADD FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE;

ALTER TABLE `family_access` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `member_access` ADD FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `member_access` ADD FOREIGN KEY (`member_id`) REFERENCES `family_members` (`id`) ON DELETE CASCADE;

ALTER TABLE `family_members` ADD FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE;

ALTER TABLE `family_members` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `family_members` ADD FOREIGN KEY (`relationship_to_creator_id`) REFERENCES `relationships_to_creator` (`id`);

ALTER TABLE `vaccination_records` ADD FOREIGN KEY (`family_member_id`) REFERENCES `family_members` (`id`) ON DELETE CASCADE;

ALTER TABLE `vaccination_records` ADD FOREIGN KEY (`vacc_id`) REFERENCES `vaccines` (`id`) ON DELETE SET NULL;

ALTER TABLE `medical_records` ADD FOREIGN KEY (`family_member_id`) REFERENCES `family_members` (`id`) ON DELETE CASCADE;

ALTER TABLE `medical_records` ADD FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `prescriptions` ADD FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE;

ALTER TABLE `prescription_items` ADD FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE;

ALTER TABLE `prescription_items` ADD FOREIGN KEY (`drug_id`) REFERENCES `drugs` (`id`) ON DELETE SET NULL;

ALTER TABLE `allergies` ADD FOREIGN KEY (`family_member_id`) REFERENCES `family_members` (`id`) ON DELETE CASCADE;

ALTER TABLE `health_stats` ADD FOREIGN KEY (`family_member_id`) REFERENCES `family_members` (`id`) ON DELETE CASCADE;

ALTER TABLE `health_stats` ADD FOREIGN KEY (`stats_type_id`) REFERENCES `health_stats_types` (`id`) ON DELETE RESTRICT;

ALTER TABLE `family_invite_codes` ADD FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE;

ALTER TABLE `medical_records` ADD FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE SET NULL;

ALTER TABLE `medical_documents` ADD FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE;

