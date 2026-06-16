# 冷藏车设备数据接收网关

基于 Express.js 的冷藏车 GPS 和温度传感器数据接收网关服务。

## 功能特性

- 接收冷藏车 GPS 硬件和温度传感器报文（HTTP POST JSON 格式）
- 解析报文（车辆ID、车牌号、设备类型、经纬度、温度、时间戳等）
- 数据存入 PostgreSQL 的 lenglian_records 表
- 健康检查接口
- 完善的错误处理和日志

## 技术栈

- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)

## 项目结构

```
gateway/
├── src/
│   ├── app.js                  # 主应用入口
│   ├── controllers/
│   │   └── gatewayController.js # 网关控制器
│   ├── routes/
│   │   └── gatewayRoutes.js    # 路由定义
│   └── db/
│       └── index.js            # 数据库连接模块
├── sql/
│   └── init.sql                # 数据库初始化脚本
├── .env.example                # 环境变量示例
├── .gitignore
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd gateway
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并根据实际情况修改：

```bash
cp .env.example .env
```

环境变量说明：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 3001 |
| DB_HOST | 数据库主机地址 | localhost |
| DB_PORT | 数据库端口 | 5432 |
| DB_USER | 数据库用户名 | postgres |
| DB_PASSWORD | 数据库密码 | postgres |
| DB_NAME | 数据库名 | lenglian_db |

### 3. 初始化数据库

执行 SQL 脚本创建数据表：

```bash
psql -U postgres -d lenglian_db -f sql/init.sql
```

或在 PostgreSQL 客户端中手动执行 `sql/init.sql` 中的 SQL 语句。

### 4. 启动服务

```bash
# 生产模式
npm start

# 开发模式（需要安装 nodemon）
npm run dev
```

服务启动后：
- 健康检查: http://localhost:3001/health
- 数据接收: http://localhost:3001/api/gateway/receive

## API 接口

### 1. 健康检查

**GET** `/health`

响应示例：
```json
{
  "success": true,
  "message": "服务运行正常",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### 2. 接收设备数据

**POST** `/api/gateway/receive`

请求体：
```json
{
  "device_id": "GPS-001",
  "vehicle_plate": "京A12345",
  "device_type": "GPS_TEMPERATURE",
  "telemetry": {
    "lat": 39.9042,
    "lng": 116.4074,
    "temperature": -18.5,
    "timestamp": "2024-01-01T12:00:00Z",
    "humidity": 65.2,
    "speed": 60.5
  }
}
```

字段说明：
- `device_id` (必填): 设备唯一标识
- `vehicle_plate` (必填): 车牌号
- `device_type` (必填): 设备类型（如 GPS、TEMPERATURE、GPS_TEMPERATURE 等）
- `telemetry` (必填): 遥测数据 JSON 对象，可包含任意字段

响应示例：
```json
{
  "success": true,
  "message": "数据接收成功",
  "data": {
    "id": 1,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

## 数据库表结构

### lenglian_records 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键，自增 |
| device_id | VARCHAR(100) | 设备ID |
| vehicle_plate | VARCHAR(50) | 车牌号 |
| device_type | VARCHAR(50) | 设备类型 |
| telemetry | JSONB | 遥测数据（包含 lat, lng, temperature, timestamp 等） |
| created_at | TIMESTAMP | 创建时间，默认当前时间 |

## 测试示例

使用 curl 测试：

```bash
# 健康检查
curl http://localhost:3001/health

# 发送设备数据
curl -X POST http://localhost:3001/api/gateway/receive \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEVICE-001",
    "vehicle_plate": "京A12345",
    "device_type": "GPS_TEMPERATURE",
    "telemetry": {
      "lat": 39.9042,
      "lng": 116.4074,
      "temperature": -18.5,
      "timestamp": "2024-01-01T12:00:00Z"
    }
  }'
```

## License

ISC
