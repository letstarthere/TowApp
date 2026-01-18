-- Insert sample users
INSERT OR IGNORE INTO users (email, phone, name, user_type, created_at, updated_at) VALUES 
('bampoesean@gmail.com', '+27123456789', 'Demo User', 'user', 1704067200000, 1704067200000),
('driver1@towapp.com', '+27123456700', 'John Smith', 'driver', 1704067200000, 1704067200000),
('driver2@towapp.com', '+27123456701', 'Mike Johnson', 'driver', 1704067200000, 1704067200000),
('driver3@towapp.com', '+27123456702', 'Sarah Wilson', 'driver', 1704067200000, 1704067200000);

-- Insert sample drivers
INSERT OR IGNORE INTO drivers (user_id, company_name, vehicle_type, license_plate, is_available, current_latitude, current_longitude, rating, total_jobs, created_at, updated_at) VALUES 
(2, 'QuickTow Services', 'Flatbed Truck', 'GT-1234-GP', 1, -26.1956, 28.0342, 4.8, 127, 1704067200000, 1704067200000),
(3, 'FastTow Co.', 'Tow Truck', 'TT-5678-GP', 1, -26.2100, 28.0500, 4.8, 127, 1704067200000, 1704067200000),
(4, 'RapidTow Solutions', 'Heavy Duty Truck', 'HD-9012-GP', 1, -26.1800, 28.0200, 4.8, 127, 1704067200000, 1704067200000);