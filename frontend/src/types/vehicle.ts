export interface TrackPoint {
  lng: number
  lat: number
  time: string
  temperature?: number
}

export interface VehicleAlert {
  vehicleId: string
  plateNumber: string
  currentTemperature: number
  consecutiveOverTempCount: number
  latitude: number
  longitude: number
  location: string
  alertTime: string
  warehouseId?: string
  warehouseName?: string
  track?: TrackPoint[]
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
