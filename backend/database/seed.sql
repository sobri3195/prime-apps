INSERT INTO users (name,email,phone,password,role,status,created_at,updated_at) VALUES
('Pasien Dummy','patient@prime.local','+628111111111', '$2y$10$0A4j0LhYBcsx5Td2f9Jx2uPj4cVKjQf0M1lv2oFS9YNRWSfK6fIm2','patient','active',NOW(),NOW()),
('Dokter Dummy','doctor@prime.local','+628222222222', '$2y$10$0A4j0LhYBcsx5Td2f9Jx2uPj4cVKjQf0M1lv2oFS9YNRWSfK6fIm2','doctor','active',NOW(),NOW());
INSERT INTO patients (user_id,medical_record_number,birth_date,gender,insurance,address,created_at,updated_at) VALUES (1,'MRN-000001','1992-01-21','Laki-laki','BPJS','Jl. Melati Indah',NOW(),NOW());
INSERT INTO products (name,category,description,price,image,badge,stock,requires_doctor_recommendation,status,created_at,updated_at) VALUES ('Kacamata Blue Light','Kacamata','Anti radiasi',350000,'','Best Seller',20,0,'active',NOW(),NOW());
INSERT INTO medical_reports (patient_id,doctor_name,visit_date,right_vision,left_vision,intraocular_pressure,dry_eye_risk,diagnosis_summary,recommendation,status,created_at) VALUES
(1,'dr. Sp.M','2026-05-01','6/9','6/12',18,'Sedang','Mata lelah','Istirahat cukup','published',NOW()),(1,'dr. Sp.M','2026-04-01','6/9','6/9',17,'Rendah','Stabil','Kontrol berkala','published',NOW()),(1,'dr. Sp.M','2026-03-01','6/12','6/12',19,'Sedang','Dry eye','Gunakan tetes mata','published',NOW());
INSERT INTO ai_eye_screenings (patient_id,complaint_text,symptoms,duration,pain_level,risk_level,analysis_summary,recommendation,rule_version,created_at) VALUES (1,'Mata merah','["Mata merah"]','1-3 hari',3,'Sedang','Iritasi ringan','Istirahatkan mata','1.0',NOW());
INSERT INTO rewards (patient_id,points,streak_days,checked_in_date,created_at,updated_at) VALUES (1,120,2,NULL,NOW(),NOW());
INSERT INTO vouchers (name,description,required_points,discount_type,discount_value,minimum_transaction,status,created_at) VALUES ('Voucher 10%','Diskon produk',100,'percentage',10,200000,'active',NOW());
