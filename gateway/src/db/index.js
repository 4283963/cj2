const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'lenglian_db',
});

pool.on('connect', () => {
  console.log('[DB] PostgreSQL 连接成功');
});

pool.on('error', (err) => {
  console.error('[DB] PostgreSQL 连接错误:', err.message);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB] 查询执行: ${text.split(' ')[0]}... 耗时: ${duration}ms, 影响行数: ${res.rowCount}`);
    return res;
  } catch (err) {
    console.error('[DB] 查询失败:', err.message);
    throw err;
  }
};

const insertRecord = async (data) => {
  const {
    device_id,
    vehicle_id,
    plate_number,
    warehouse_id,
    warehouse_name,
    device_type,
    temperature,
    latitude,
    longitude,
    location,
    telemetry,
    record_time,
  } = data;

  const sql = `
    INSERT INTO lenglian_records (
      device_id, vehicle_id, plate_number, warehouse_id, warehouse_name,
      device_type, temperature, latitude, longitude, location,
      telemetry, record_time
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id, created_at
  `;
  const params = [
    device_id,
    vehicle_id,
    plate_number,
    warehouse_id || null,
    warehouse_name || null,
    device_type,
    temperature ?? null,
    latitude ?? null,
    longitude ?? null,
    location || null,
    telemetry,
    record_time || new Date().toISOString(),
  ];
  const result = await query(sql, params);
  return result.rows[0];
};

module.exports = {
  pool,
  query,
  insertRecord,
};
