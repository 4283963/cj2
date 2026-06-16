import type { VehicleAlert, ApiResponse } from '@/types/vehicle'
import { mockAlerts } from '@/mock/alerts'

const API_BASE = '/api/v1'

export async function fetchAlerts(page = 0, size = 20): Promise<VehicleAlert[]> {
  try {
    const response = await fetch(`${API_BASE}/fleet/alerts?page=${page}&size=${size}`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const result: ApiResponse<VehicleAlert[]> = await response.json()
    if (result.code !== 200) {
      throw new Error(result.message || '请求失败')
    }
    return result.data
  } catch (error) {
    console.warn('API 请求失败，使用 mock 数据:', error)
    return mockAlerts
  }
}

export async function fetchAlertById(vehicleId: string): Promise<VehicleAlert | null> {
  try {
    const alerts = await fetchAlerts()
    const alert = alerts.find((item) => item.vehicleId === vehicleId)
    return alert || null
  } catch (error) {
    console.warn('API 请求失败，使用 mock 数据:', error)
    const alert = mockAlerts.find((item) => item.vehicleId === vehicleId)
    return alert || null
  }
}
