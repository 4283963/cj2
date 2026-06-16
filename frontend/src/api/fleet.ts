import type { VehicleAlert, NotificationConfig, ApiResponse } from '@/types/vehicle'
import { mockAlerts, mockNotificationConfig } from '@/mock/alerts'

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

export async function fetchNotificationConfig(): Promise<NotificationConfig> {
  try {
    const response = await fetch(`${API_BASE}/fleet/notification-config`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const result: ApiResponse<NotificationConfig> = await response.json()
    if (result.code !== 200) {
      throw new Error(result.message || '请求失败')
    }
    return result.data
  } catch (error) {
    console.warn('获取通知配置失败，使用 mock 数据:', error)
    return mockNotificationConfig
  }
}

export async function saveNotificationConfig(config: NotificationConfig): Promise<NotificationConfig> {
  try {
    const url = config.id
      ? `${API_BASE}/fleet/notification-config/${config.id}`
      : `${API_BASE}/fleet/notification-config`
    const method = config.id ? 'PUT' : 'POST'
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const result: ApiResponse<NotificationConfig> = await response.json()
    if (result.code !== 200) {
      throw new Error(result.message || '保存失败')
    }
    return result.data
  } catch (error) {
    console.warn('保存通知配置失败:', error)
    throw error
  }
}

export async function toggleNotificationEnabled(): Promise<NotificationConfig> {
  try {
    const response = await fetch(`${API_BASE}/fleet/notification-config/toggle`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const result: ApiResponse<NotificationConfig> = await response.json()
    if (result.code !== 200) {
      throw new Error(result.message || '操作失败')
    }
    return result.data
  } catch (error) {
    console.warn('切换通知状态失败:', error)
    throw error
  }
}

export async function testNotification(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/fleet/notification-config/test`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const result: ApiResponse<null> = await response.json()
    return result.message
  } catch (error) {
    console.warn('测试通知失败:', error)
    return '测试请求已发送（使用 mock 数据）'
  }
}
