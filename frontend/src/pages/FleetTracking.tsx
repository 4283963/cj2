import { useState, useEffect, useCallback } from 'react'
import { fetchAlerts } from '@/api/fleet'
import type { VehicleAlert } from '@/types/vehicle'
import AlertList from '@/components/AlertList'
import AmapView from '@/components/AmapView'

function formatDateTime(isoStr: string): string {
  try {
    const date = new Date(isoStr)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  } catch {
    return isoStr
  }
}

export default function FleetTracking() {
  const [vehicles, setVehicles] = useState<VehicleAlert[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleAlert | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const data = await fetchAlerts()
      setVehicles(data)
      if (data.length > 0) {
        setSelectedVehicle(data[0])
      }
    } catch (error) {
      console.error('加载告警数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectVehicle = useCallback((vehicle: VehicleAlert) => {
    setSelectedVehicle(vehicle)
  }, [])

  const getSelectedId = (vehicle: VehicleAlert | null) => {
    if (!vehicle) return null
    return vehicle.alertType === 'WAREHOUSE' ? vehicle.warehouseId || null : vehicle.vehicleId
  }

  const tempLevel = (temp: number) => {
    if (temp >= 15) return { color: 'text-red-600', bg: 'bg-red-100', label: '严重超温' }
    if (temp >= 10) return { color: 'text-orange-600', bg: 'bg-orange-100', label: '中度超温' }
    return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: '轻度超温' }
  }

  const getTypeLabel = (type: string) => {
    return type === 'VEHICLE' ? '冷藏车' : '前置仓'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">温度告警监控</h2>
          <p className="text-gray-500 mt-1">实时监控冷藏车和前置仓的异常温度告警</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-red-50 rounded-lg border border-red-100">
            <span className="text-sm text-gray-600">待处理告警：</span>
            <span className="text-lg font-bold text-red-600">{vehicles.length}</span>
            <span className="text-sm text-gray-500 ml-1">条</span>
          </div>
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? '加载中...' : '刷新'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
          <AlertList
            vehicles={vehicles}
            selectedId={getSelectedId(selectedVehicle)}
            onSelect={handleSelectVehicle}
            loading={loading}
          />
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
            <AmapView
              selectedVehicle={selectedVehicle}
              vehicles={vehicles}
              onVehicleClick={handleSelectVehicle}
            />
          </div>

          {selectedVehicle && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {selectedVehicle.alertType === 'VEHICLE' ? '🚚' : '🏭'}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {selectedVehicle.plateNumber}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      selectedVehicle.alertType === 'VEHICLE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {getTypeLabel(selectedVehicle.alertType)}
                    </span>
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${tempLevel(selectedVehicle.currentTemperature).bg} ${tempLevel(selectedVehicle.currentTemperature).color}`}>
                    {tempLevel(selectedVehicle.currentTemperature).label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-600">
                    {selectedVehicle.currentTemperature.toFixed(1)}°C
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    阈值：8°C
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500">连续超温</div>
                  <div className="text-lg font-semibold text-gray-800 mt-0.5">
                    {selectedVehicle.consecutiveOverTempCount} 次
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">恢复进度</div>
                  <div className={`text-lg font-semibold mt-0.5 ${
                    selectedVehicle.consecutiveNormalCount > 0 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {selectedVehicle.consecutiveNormalCount > 0
                      ? `${selectedVehicle.consecutiveNormalCount}/3 次`
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">告警时间</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">
                    {formatDateTime(selectedVehicle.alertTime)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">所属</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">
                    {selectedVehicle.warehouseName || '-'}
                  </div>
                </div>
              </div>

              {selectedVehicle.track && selectedVehicle.track.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">
                    行驶轨迹（共 {selectedVehicle.track.length} 个点）
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedVehicle.track.map((point, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 px-3 py-2 bg-gray-50 rounded-lg text-xs"
                      >
                        <div className="text-gray-500">{point.time}</div>
                        <div className="text-gray-800 font-medium mt-0.5">
                          {point.temperature !== undefined
                            ? `${point.temperature.toFixed(1)}°C`
                            : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
