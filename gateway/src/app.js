require('dotenv').config();

const express = require('express');
const gatewayRoutes = require('./routes/gatewayRoutes');
const { healthCheck } = require('./controllers/gatewayController');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url} - ${req.ip}`);
  next();
});

app.get('/health', healthCheck);

app.use('/api/gateway', gatewayRoutes);

app.use((req, res) => {
  console.log(`[HTTP] 404 - ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: '接口不存在',
  });
});

app.use((err, req, res, next) => {
  console.error('[HTTP] 服务器错误:', err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('  冷藏车数据网关服务已启动');
  console.log(`  端口: ${PORT}`);
  console.log(`  健康检查: http://localhost:${PORT}/health`);
  console.log(`  数据接收: http://localhost:${PORT}/api/gateway/receive`);
  console.log('========================================');
});

module.exports = app;
