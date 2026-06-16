import type { VehicleAlert } from '@/types/vehicle'

interface AlertListProps {
  vehicles: VehicleAlert[]
  selectedId: string | null
  onSelect: (vehicle: VehicleAlert) => void
  loading: boolean
}

function formatDateTime(isoStr: string): string {
  try {
    const date = new Date(isoStr)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  } catch {
    return isoStr
  }
}

export default function AlertList({ vehicles, selectedId, onSelect, loading }: AlertListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">异常车辆列表</h3>
        <p className="text-sm text-gray-500 mt-1">共 {vehicles.length} 辆异常车辆</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">暂无异常车辆</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {vehicles.map((vehicle) => (
              <li
                key={vehicle.vehicleId}
                onClick={() => onSelect(vehicle)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedId === vehicle.vehicleId ? 'bg-red-50 border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{vehicle.plateNumber}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
                    超温
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">当前温度</span>
                    <span className="text-red-600 font-semibold">{vehicle.currentTemperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">连续超温</span>
                    <span className="text-gray-700 font-medium">{vehicle.consecutiveOverTempCount} 次</span>
                  </div>
                  {vehicle.warehouseName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">所属前置仓</span>
                      <span className="text-gray-600 text-xs">{vehicle.warehouseName}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDateTime(vehicle.alertTime)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
