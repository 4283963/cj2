export type AlertType = 'VEHICLE' | 'WAREHOUSE'

export interface TrackPoint {
  lng: number
  lat: number
  time: string
  temperature?: number
}

export interface VehicleAlert {
  alertType: AlertType
  vehicleId: string
  plateNumber: string
  currentTemperature: number
  consecutiveOverTempCount: number
  consecutiveNormalCount: number
  latitude: number
  longitude: number
  location: string
  alertTime: string
  warehouseId?: string
  warehouseName?: string
  track?: TrackPoint[]
}

export interface NotificationConfig {
  id?: number
  configName: string
  wechatWebhookUrl: string
  enabled: boolean
  enableOfflineAlert: boolean
  offlineTimeoutMinutes: number
  enableTempSpikeAlert: boolean
  tempSpikeThreshold: number
  cooldownMinutes: number
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  page?: number
  size?: number
  total?: number
  totalPages?: number
}
