-- 冷藏车设备数据记录表
CREATE TABLE IF NOT EXISTS lenglian_records (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    vehicle_id VARCHAR(100) NOT NULL,
    plate_number VARCHAR(50) NOT NULL,
    warehouse_id VARCHAR(100),
    warehouse_name VARCHAR(200),
    device_type VARCHAR(50) NOT NULL,
    temperature DECIMAL(10,2),
    latitude DECIMAL(12,8),
    longitude DECIMAL(12,8),
    location VARCHAR(500),
    telemetry JSONB NOT NULL,
    record_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_lenglian_records_device_id ON lenglian_records (device_id);
CREATE INDEX IF NOT EXISTS idx_lenglian_records_vehicle_id ON lenglian_records (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_lenglian_records_plate_number ON lenglian_records (plate_number);
CREATE INDEX IF NOT EXISTS idx_lenglian_records_device_type ON lenglian_records (device_type);
CREATE INDEX IF NOT EXISTS idx_lenglian_records_record_time ON lenglian_records (record_time DESC);
CREATE INDEX IF NOT EXISTS idx_lenglian_records_created_at ON lenglian_records (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lenglian_records_temperature ON lenglian_records (temperature);
CREATE INDEX IF NOT EXISTS idx_lenglian_records_telemetry ON lenglian_records USING GIN (telemetry);

-- 注释
COMMENT ON TABLE lenglian_records IS '冷藏车设备数据记录表';
COMMENT ON COLUMN lenglian_records.device_id IS '设备ID';
COMMENT ON COLUMN lenglian_records.vehicle_id IS '车辆ID';
COMMENT ON COLUMN lenglian_records.plate_number IS '车牌号';
COMMENT ON COLUMN lenglian_records.warehouse_id IS '前置仓ID';
COMMENT ON COLUMN lenglian_records.warehouse_name IS '前置仓名称';
COMMENT ON COLUMN lenglian_records.device_type IS '设备类型 (GPS_TEMPERATURE/GATEWAY)';
COMMENT ON COLUMN lenglian_records.temperature IS '温度(°C)，从telemetry提取用于高效查询';
COMMENT ON COLUMN lenglian_records.latitude IS '纬度，从telemetry提取用于高效查询';
COMMENT ON COLUMN lenglian_records.longitude IS '经度，从telemetry提取用于高效查询';
COMMENT ON COLUMN lenglian_records.location IS '位置描述';
COMMENT ON COLUMN lenglian_records.telemetry IS '遥测数据 JSONB (完整原始数据)';
COMMENT ON COLUMN lenglian_records.record_time IS '记录时间(设备上报时间)';
COMMENT ON COLUMN lenglian_records.created_at IS '创建时间(入库时间)';

-- 插入测试数据：V001 连续5次超温
INSERT INTO lenglian_records (device_id, vehicle_id, plate_number, warehouse_id, warehouse_name, device_type, temperature, latitude, longitude, location, telemetry, record_time)
VALUES
('GPS-001', 'V001', '京A·12345', 'WH001', '北京朝阳前置仓', 'GPS_TEMPERATURE', 12.5, 39.90923, 116.397428, '北京市朝阳区建国门外大街', '{"lat": 39.90923, "lng": 116.397428, "temperature": 12.5, "speed": 35, "timestamp": "2026-06-16T14:32:00"}'::jsonb, NOW() - INTERVAL '0 minutes'),
('GPS-001', 'V001', '京A·12345', 'WH001', '北京朝阳前置仓', 'GPS_TEMPERATURE', 11.5, 39.90823, 116.397428, '北京市朝阳区建国门外大街', '{"lat": 39.90823, "lng": 116.397428, "temperature": 11.5, "speed": 38, "timestamp": "2026-06-16T14:31:00"}'::jsonb, NOW() - INTERVAL '1 minutes'),
('GPS-001', 'V001', '京A·12345', 'WH001', '北京朝阳前置仓', 'GPS_TEMPERATURE', 10.3, 39.90723, 116.396428, '北京市朝阳区', '{"lat": 39.90723, "lng": 116.396428, "temperature": 10.3, "speed": 40, "timestamp": "2026-06-16T14:30:00"}'::jsonb, NOW() - INTERVAL '2 minutes'),
('GPS-001', 'V001', '京A·12345', 'WH001', '北京朝阳前置仓', 'GPS_TEMPERATURE', 9.1, 39.90623, 116.394428, '北京市朝阳区', '{"lat": 39.90623, "lng": 116.394428, "temperature": 9.1, "speed": 42, "timestamp": "2026-06-16T14:29:00"}'::jsonb, NOW() - INTERVAL '3 minutes'),
('GPS-001', 'V001', '京A·12345', 'WH001', '北京朝阳前置仓', 'GPS_TEMPERATURE', 8.2, 39.90523, 116.392428, '北京市朝阳区', '{"lat": 39.90523, "lng": 116.392428, "temperature": 8.2, "speed": 45, "timestamp": "2026-06-16T14:28:00"}'::jsonb, NOW() - INTERVAL '4 minutes');

-- V002 连续8次超温（插入最近5条）
INSERT INTO lenglian_records (device_id, vehicle_id, plate_number, warehouse_id, warehouse_name, device_type, temperature, latitude, longitude, location, telemetry, record_time)
VALUES
('GPS-002', 'V002', '京B·67890', 'WH002', '北京东城前置仓', 'GPS_TEMPERATURE', 15.3, 39.92923, 116.417428, '北京市东城区东直门外大街', '{"lat": 39.92923, "lng": 116.417428, "temperature": 15.3, "speed": 25, "timestamp": "2026-06-16T13:45:00"}'::jsonb, NOW() - INTERVAL '50 minutes'),
('GPS-002', 'V002', '京B·67890', 'WH002', '北京东城前置仓', 'GPS_TEMPERATURE', 14.5, 39.92823, 116.416428, '北京市东城区', '{"lat": 39.92823, "lng": 116.416428, "temperature": 14.5, "speed": 28, "timestamp": "2026-06-16T13:44:00"}'::jsonb, NOW() - INTERVAL '51 minutes'),
('GPS-002', 'V002', '京B·67890', 'WH002', '北京东城前置仓', 'GPS_TEMPERATURE', 13.6, 39.92723, 116.415428, '北京市东城区', '{"lat": 39.92723, "lng": 116.415428, "temperature": 13.6, "speed": 30, "timestamp": "2026-06-16T13:43:00"}'::jsonb, NOW() - INTERVAL '52 minutes'),
('GPS-002', 'V002', '京B·67890', 'WH002', '北京东城前置仓', 'GPS_TEMPERATURE', 12.4, 39.92623, 116.414428, '北京市东城区', '{"lat": 39.92623, "lng": 116.414428, "temperature": 12.4, "speed": 32, "timestamp": "2026-06-16T13:42:00"}'::jsonb, NOW() - INTERVAL '53 minutes'),
('GPS-002', 'V002', '京B·67890', 'WH002', '北京东城前置仓', 'GPS_TEMPERATURE', 11.2, 39.92523, 116.413428, '北京市东城区', '{"lat": 39.92523, "lng": 116.413428, "temperature": 11.2, "speed": 35, "timestamp": "2026-06-16T13:41:00"}'::jsonb, NOW() - INTERVAL '54 minutes'),
('GPS-002', 'V002', '京B·67890', 'WH002', '北京东城前置仓', 'GPS_TEMPERATURE', 10.1, 39.92423, 116.412428, '北京市东城区', '{"lat": 39.92423, "lng": 116.412428, "temperature": 10.1, "speed": 38, "timestamp": "2026-06-16T13:40:00"}'::jsonb, NOW() - INTERVAL '55 minutes');

-- V003 连续3次超温
INSERT INTO lenglian_records (device_id, vehicle_id, plate_number, warehouse_id, warehouse_name, device_type, temperature, latitude, longitude, location, telemetry, record_time)
VALUES
('GPS-003', 'V003', '京C·11111', 'WH003', '北京西城前置仓', 'GPS_TEMPERATURE', 9.8, 39.88923, 116.377428, '北京市西城区金融街', '{"lat": 39.88923, "lng": 116.377428, "temperature": 9.8, "speed": 20, "timestamp": "2026-06-16T15:10:00"}'::jsonb, NOW() - INTERVAL '30 minutes'),
('GPS-003', 'V003', '京C·11111', 'WH003', '北京西城前置仓', 'GPS_TEMPERATURE', 9.1, 39.88823, 116.376428, '北京市西城区', '{"lat": 39.88823, "lng": 116.376428, "temperature": 9.1, "speed": 22, "timestamp": "2026-06-16T15:09:00"}'::jsonb, NOW() - INTERVAL '31 minutes'),
('GPS-003', 'V003', '京C·11111', 'WH003', '北京西城前置仓', 'GPS_TEMPERATURE', 8.3, 39.88723, 116.375428, '北京市西城区', '{"lat": 39.88723, "lng": 116.375428, "temperature": 8.3, "speed": 25, "timestamp": "2026-06-16T15:08:00"}'::jsonb, NOW() - INTERVAL '32 minutes'),
('GPS-003', 'V003', '京C·11111', 'WH003', '北京西城前置仓', 'GPS_TEMPERATURE', 7.5, 39.88623, 116.374428, '北京市西城区', '{"lat": 39.88623, "lng": 116.374428, "temperature": 7.5, "speed": 28, "timestamp": "2026-06-16T15:07:00"}'::jsonb, NOW() - INTERVAL '33 minutes');

-- V004 正常车辆（温度都在8度以下），用于验证不会被误报
INSERT INTO lenglian_records (device_id, vehicle_id, plate_number, warehouse_id, warehouse_name, device_type, temperature, latitude, longitude, location, telemetry, record_time)
VALUES
('GPS-004', 'V004', '京F·88888', 'WH006', '北京通州前置仓', 'GPS_TEMPERATURE', 3.2, 39.90123, 116.657428, '北京市通州区', '{"lat": 39.90123, "lng": 116.657428, "temperature": 3.2, "speed": 40, "timestamp": "2026-06-16T14:00:00"}'::jsonb, NOW() - INTERVAL '1 hour'),
('GPS-004', 'V004', '京F·88888', 'WH006', '北京通州前置仓', 'GPS_TEMPERATURE', 2.8, 39.90223, 116.658428, '北京市通州区', '{"lat": 39.90223, "lng": 116.658428, "temperature": 2.8, "speed": 42, "timestamp": "2026-06-16T14:01:00"}'::jsonb, NOW() - INTERVAL '59 minutes'),
('GPS-004', 'V004', '京F·88888', 'WH006', '北京通州前置仓', 'GPS_TEMPERATURE', 3.0, 39.90323, 116.659428, '北京市通州区', '{"lat": 39.90323, "lng": 116.659428, "temperature": 3.0, "speed": 45, "timestamp": "2026-06-16T14:02:00"}'::jsonb, NOW() - INTERVAL '58 minutes');
