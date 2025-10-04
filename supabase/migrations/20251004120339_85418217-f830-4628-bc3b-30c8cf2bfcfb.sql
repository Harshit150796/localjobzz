-- Insert mock job data for 15 major Indian cities
-- Using the existing user account

INSERT INTO public.jobs (user_id, title, job_type, daily_salary, location, description, phone, urgency, category, status, featured) VALUES
-- Mumbai Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Delivery Boy Needed', 'Full-time', '500-700', 'Mumbai', 'Need reliable delivery person for food delivery service. Must have own vehicle.', '+91 9876543210', 'normal', 'Delivery & Logistics', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Office Assistant Required', 'Full-time', '400-600', 'Mumbai', 'Looking for office assistant for administrative tasks. Good communication skills required.', '+91 9876543211', 'urgent', 'Office & Admin', 'active', true),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Plumber Needed Urgently', 'Part-time', '800-1000', 'Mumbai', 'Experienced plumber needed for residential work.', '+91 9876543212', 'immediate', 'Repair & Maintenance', 'active', true),

-- Delhi Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Security Guard Required', 'Full-time', '450-550', 'Delhi', 'Night shift security guard needed for commercial building.', '+91 9876543213', 'normal', 'Security & Safety', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Cook Wanted', 'Full-time', '600-800', 'Delhi', 'Experienced cook needed for restaurant. Must know North Indian cuisine.', '+91 9876543214', 'urgent', 'Hospitality & Service', 'active', true),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Electrician Required', 'Part-time', '700-900', 'Delhi', 'Licensed electrician for home and office electrical work.', '+91 9876543215', 'normal', 'Repair & Maintenance', 'active', false),

-- Bangalore Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Warehouse Helper', 'Full-time', '500-600', 'Bangalore', 'Need helpers for warehouse inventory management.', '+91 9876543216', 'normal', 'Warehouse & Packing', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Housekeeping Staff', 'Full-time', '400-500', 'Bangalore', 'Housekeeping staff needed for corporate office.', '+91 9876543217', 'normal', 'Cleaning & Housekeeping', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Driver Needed', 'Full-time', '600-800', 'Bangalore', 'Experienced driver with valid license. Company cab service.', '+91 9876543218', 'urgent', 'Delivery & Logistics', 'active', true),

-- Hyderabad Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Carpenter Required', 'Part-time', '800-1000', 'Hyderabad', 'Skilled carpenter for furniture making and repairs.', '+91 9876543219', 'normal', 'Construction & Labor', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Sales Executive', 'Full-time', '500-700', 'Hyderabad', 'Sales executive for retail store. Good communication skills required.', '+91 9876543220', 'normal', 'Sales & Marketing', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Data Entry Operator', 'Full-time', '400-600', 'Hyderabad', 'Data entry work in office. Basic computer knowledge required.', '+91 9876543221', 'normal', 'Office & Admin', 'active', false),

-- Chennai Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Factory Worker', 'Full-time', '500-700', 'Chennai', 'Workers needed for manufacturing unit. 8-hour shifts.', '+91 9876543222', 'urgent', 'Manufacturing & Production', 'active', true),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'AC Technician', 'Part-time', '900-1200', 'Chennai', 'Experienced AC repair and maintenance technician.', '+91 9876543223', 'normal', 'Repair & Maintenance', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Peon Required', 'Full-time', '350-450', 'Chennai', 'Office peon for document delivery and general assistance.', '+91 9876543224', 'normal', 'Office & Admin', 'active', false),

-- Kolkata Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Waiter Needed', 'Full-time', '400-600', 'Kolkata', 'Experienced waiter for restaurant. Must be presentable.', '+91 9876543225', 'normal', 'Hospitality & Service', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Mason Required', 'Part-time', '800-1000', 'Kolkata', 'Experienced mason for construction work.', '+91 9876543226', 'urgent', 'Construction & Labor', 'active', true),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Receptionist Wanted', 'Full-time', '450-650', 'Kolkata', 'Receptionist for clinic. Good communication skills required.', '+91 9876543227', 'normal', 'Healthcare & Medical', 'active', false),

-- Pune Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Packing Helper', 'Full-time', '400-550', 'Pune', 'Helpers needed for product packing in warehouse.', '+91 9876543228', 'normal', 'Warehouse & Packing', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Gardener Required', 'Part-time', '350-500', 'Pune', 'Gardener for residential society maintenance.', '+91 9876543229', 'normal', 'Cleaning & Housekeeping', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Painter Needed', 'Part-time', '700-900', 'Pune', 'Experienced painter for residential and commercial projects.', '+91 9876543230', 'normal', 'Repair & Maintenance', 'active', false),

-- Ahmedabad Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Tailor Required', 'Full-time', '500-700', 'Ahmedabad', 'Experienced tailor for garment alterations and stitching.', '+91 9876543231', 'normal', 'Other Services', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Security Supervisor', 'Full-time', '600-800', 'Ahmedabad', 'Supervisor for security team. Must have experience.', '+91 9876543232', 'urgent', 'Security & Safety', 'active', true),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Loading Helper', 'Part-time', '500-600', 'Ahmedabad', 'Helpers for loading and unloading goods.', '+91 9876543233', 'normal', 'Warehouse & Packing', 'active', false),

-- Jaipur Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Shop Assistant', 'Full-time', '400-550', 'Jaipur', 'Assistant needed for retail shop. Billing knowledge preferred.', '+91 9876543234', 'normal', 'Sales & Marketing', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Welder Required', 'Part-time', '800-1100', 'Jaipur', 'Skilled welder for fabrication work.', '+91 9876543235', 'normal', 'Construction & Labor', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Cleaner Needed', 'Full-time', '350-450', 'Jaipur', 'Cleaning staff for office premises.', '+91 9876543236', 'normal', 'Cleaning & Housekeeping', 'active', false),

-- Lucknow Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Bike Mechanic', 'Full-time', '600-800', 'Lucknow', 'Experienced bike mechanic for service center.', '+91 9876543237', 'normal', 'Automobile & Transport', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Tea Boy Required', 'Full-time', '300-400', 'Lucknow', 'Tea/coffee preparation and serving in office.', '+91 9876543238', 'normal', 'Office & Admin', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Mechanic Helper', 'Full-time', '400-550', 'Lucknow', 'Helper for automobile workshop.', '+91 9876543239', 'normal', 'Automobile & Transport', 'active', false),

-- Surat Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Machine Operator', 'Full-time', '550-750', 'Surat', 'Machine operator for textile industry.', '+91 9876543240', 'urgent', 'Manufacturing & Production', 'active', true),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Quality Inspector', 'Full-time', '500-700', 'Surat', 'Quality checking for textile products.', '+91 9876543241', 'normal', 'Manufacturing & Production', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Helper Required', 'Full-time', '400-500', 'Surat', 'General helper for factory work.', '+91 9876543242', 'normal', 'Construction & Labor', 'active', false),

-- Nagpur Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Store Keeper', 'Full-time', '500-650', 'Nagpur', 'Store keeper for inventory management.', '+91 9876543243', 'normal', 'Warehouse & Packing', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Helper Needed', 'Part-time', '400-500', 'Nagpur', 'Helper for construction site.', '+91 9876543244', 'normal', 'Construction & Labor', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Electrician Wanted', 'Part-time', '700-900', 'Nagpur', 'Electrician for residential electrical work.', '+91 9876543245', 'urgent', 'Repair & Maintenance', 'active', true),

-- Indore Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Food Delivery Partner', 'Part-time', '500-700', 'Indore', 'Delivery partners for food delivery app. Own vehicle required.', '+91 9876543246', 'normal', 'Delivery & Logistics', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Office Boy', 'Full-time', '350-450', 'Indore', 'Office boy for general office tasks.', '+91 9876543247', 'normal', 'Office & Admin', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Salesman Required', 'Full-time', '450-650', 'Indore', 'Salesman for electronics showroom.', '+91 9876543248', 'normal', 'Sales & Marketing', 'active', false),

-- Bhopal Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Nurse Required', 'Full-time', '700-900', 'Bhopal', 'Experienced nurse for clinic. Day and night shifts available.', '+91 9876543249', 'urgent', 'Healthcare & Medical', 'active', true),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Lab Technician', 'Full-time', '600-800', 'Bhopal', 'Lab technician for diagnostic center.', '+91 9876543250', 'normal', 'Healthcare & Medical', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Driver Wanted', 'Full-time', '550-700', 'Bhopal', 'Driver for private company. Valid license mandatory.', '+91 9876543251', 'normal', 'Delivery & Logistics', 'active', false),

-- Chandigarh Jobs
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Beautician Required', 'Full-time', '500-700', 'Chandigarh', 'Experienced beautician for salon.', '+91 9876543252', 'normal', 'Beauty & Wellness', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Gym Trainer', 'Part-time', '600-800', 'Chandigarh', 'Certified gym trainer for fitness center.', '+91 9876543253', 'normal', 'Beauty & Wellness', 'active', false),
('9ecd4bd2-9a81-49a3-b11f-c2001a672657', 'Cashier Needed', 'Full-time', '400-550', 'Chandigarh', 'Cashier for supermarket. Billing experience required.', '+91 9876543254', 'normal', 'Sales & Marketing', 'active', false);
