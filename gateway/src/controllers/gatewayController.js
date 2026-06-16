const { insertRecord } = require('../db');

const receiveData = async (req, res) => {
  try {
    const {
      device_id,
      vehicle_id,
      plate_number,
      warehouse_id,
      warehouse_name,
      device_type,
      telemetry,
    } = req.body;

    if (!device_id) {
      return res.status(400).json({
        success: false,
        message: '缺少 device_id 参数',
      });
    }

    if (!vehicle_id) {
      return res.status(400).json({
        success: false,
        message: '缺少 vehicle_id 参数',
      });
    }

    if (!plate_number) {
      return res.status(400).json({
        success: false,
        message: '缺少 plate_number 参数',
      });
    }

    if (!device_type) {
      return res.status(400).json({
        success: false,
        message: '缺少 device_type 参数',
      });
    }

    if (!telemetry || typeof telemetry !== 'object') {
      return res.status(400).json({
        success: false,
        message: '缺少 telemetry 参数或格式错误',
      });
    }

    const temperature = telemetry.temperature !== undefined ? parseFloat(telemetry.temperature) : null;
    const latitude = telemetry.lat !== undefined ? parseFloat(telemetry.lat) : null;
    const longitude = telemetry.lng !== undefined ? parseFloat(telemetry.lng) : null;
    const record_time = telemetry.timestamp || new Date().toISOString();
    const location = telemetry.location || null;

    console.log(
      `[Gateway] 接收到设备数据: device_id=${device_id}, vehicle_id=${vehicle_id}, ` +
      `plate_number=${plate_number}, temp=${temperature}°C, lat=${latitude}, lng=${longitude}`
    );

    const record = await insertRecord({
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
    });

    console.log(`[Gateway] 数据已入库: id=${record.id}`);

    return res.status(200).json({
      success: true,
      message: '数据接收成功',
      data: {
        id: record.id,
        created_at: record.created_at,
      },
    });
  } catch (err) {
    console.error('[Gateway] 数据处理失败:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: err.message,
    });
  }
};

const healthCheck = async (req, res) => {
  try {
    const { pool } = require('../db');
    await pool.query('SELECT 1');

    return res.status(200).json({
      success: true,
      message: '服务运行正常',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err) {
    console.error('[Health] 健康检查失败:', err.message);
    return res.status(503).json({
      success: false,
      message: '服务不可用',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message,
    });
  }
};

module.exports = {
  receiveData,
  healthCheck,
};
