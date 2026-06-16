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
COMMENT ON COLUMN lenglian_records.telemetry IS '遥测数据 JSONB (完整原始数据：lat, lng, temperature, timestamp, speed, direction 等)';
COMMENT ON COLUMN lenglian_records.record_time IS '记录时间(设备上报时间)';
COMMENT ON COLUMN lenglian_records.created_at IS '创建时间(入库时间)';
