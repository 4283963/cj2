import { useEffect, useRef, useState } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import type { VehicleAlert } from '@/types/vehicle'

interface AmapViewProps {
  selectedVehicle: VehicleAlert | null
  vehicles: VehicleAlert[]
  onVehicleClick?: (vehicle: VehicleAlert) => void
}

export default function AmapView({ selectedVehicle, vehicles, onVehicleClick }: AmapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const AMapRef = useRef<any>(null)

  useEffect(() => {
    AMapLoader.load({
      key: 'a12e64dde8cc8dd47c07a25e30c4b17224',
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar'],
    })
      .then((AMap) => {
        AMapRef.current = AMap
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new AMap.Map(mapRef.current, {
            zoom: 12,
            center: [116.397428, 39.90923],
            viewMode: '2D',
          })

          mapInstanceRef.current.addControl(new AMap.Scale())
          mapInstanceRef.current.addControl(new AMap.ToolBar())
          
          setMapReady(true)
        }
      })
      .catch((error) => {
        console.error('高德地图加载失败:', error)
      })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const isEqual = (a: VehicleAlert | null, b: VehicleAlert) => {
    if (!a) return false
    if (a.alertType === 'WAREHOUSE' && b.alertType === 'WAREHOUSE') {
      return a.warehouseId === b.warehouseId
    }
    return a.vehicleId === b.vehicleId
  }

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !AMapRef.current || vehicles.length === 0) return

    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.remove(marker)
    })
    markersRef.current = []

    const AMap = AMapRef.current

    vehicles.forEach((vehicle) => {
      const isSelected = isEqual(selectedVehicle, vehicle)
      const isWarehouse = vehicle.alertType === 'WAREHOUSE'
      const markerColor = isWarehouse ? 'bg-purple-500' : 'bg-red-500'
      const selectedColor = isWarehouse ? 'bg-purple-600' : 'bg-red-600'

      const markerContentClass = isSelected ? selectedColor : markerColor
      const marker = new AMap.Marker({
        position: [vehicle.longitude, vehicle.latitude],
        title: `${isWarehouse ? '🏭 ' : '🚚 '}${vehicle.plateNumber}`,
        content: `
          <div class="w-9 h-9 ${markerContentClass} ${isSelected ? 'scale-110' : ''} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-all">
            ${vehicle.currentTemperature.toFixed(1)}°
          </div>
        `,
        offset: new AMap.Pixel(-18, -18),
      })

      marker.on('click', () => {
        if (onVehicleClick) {
          onVehicleClick(vehicle)
        }
      })

      markersRef.current.push(marker)
      mapInstanceRef.current.add(marker)
    })

    if (vehicles.length > 0) {
      mapInstanceRef.current.setFitView(markersRef.current, false, [80, 80, 80, 80])
    }
  }, [vehicles, onVehicleClick, mapReady, selectedVehicle])

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !AMapRef.current) return

    if (polylineRef.current) {
      mapInstanceRef.current.remove(polylineRef.current)
      polylineRef.current = null
    }

    if (!selectedVehicle || !selectedVehicle.track || selectedVehicle.track.length < 2) {
      return
    }

    const AMap = AMapRef.current
    const path = selectedVehicle.track.map((point) => [point.lng, point.lat])

    const lineColor = selectedVehicle.alertType === 'WAREHOUSE' ? '#a855f7' : '#ef4444'

    polylineRef.current = new AMap.Polyline({
      path: path,
      strokeColor: lineColor,
      strokeWeight: 5,
      strokeOpacity: 0.8,
      lineJoin: 'round',
      showDir: true,
    })

    mapInstanceRef.current.add(polylineRef.current)

    mapInstanceRef.current.setZoomAndCenter(14, [selectedVehicle.longitude, selectedVehicle.latitude])
  }, [selectedVehicle, mapReady])

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="text-sm text-gray-500">地图加载中...</span>
          </div>
        </div>
      )}
      {mapReady && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 z-10">
          <h4 className="text-sm font-medium text-gray-700 mb-2">图例</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">异常冷藏车</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-gray-600">异常前置仓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-600">温度轨迹</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
