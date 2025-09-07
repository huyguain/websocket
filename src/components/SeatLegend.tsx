import React, { memo, useMemo } from 'react'
import { Seat } from '@/store/seatMapSlice'
import SeatComponent from './Seat'

interface SeatLegendProps {
  className?: string
}

const SeatLegend: React.FC<SeatLegendProps> = memo(({ className = '' }) => {
  const legendItems = useMemo(() => [
    {
      status: 'available' as const,
      label: 'Có sẵn',
      color: 'bg-green-100 border-green-300',
      icon: '1',
    },
    {
      status: 'selected' as const,
      label: 'Đã chọn',
      color: 'bg-blue-200 border-blue-400',
      icon: '✓',
    },
    {
      status: 'occupied' as const,
      label: 'Đã đặt',
      color: 'bg-red-200 border-red-400',
      icon: '✕',
    },
    {
      status: 'reserved' as const,
      label: 'Đã giữ',
      color: 'bg-yellow-200 border-yellow-400',
      icon: '⏰',
    },
  ], [])

  return (
    <div className={`flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg ${className}`}>
      <h3 className="w-full text-sm font-semibold text-gray-700 mb-2">Chú thích:</h3>
      {legendItems.map((item) => (
        <div key={item.status} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs ${item.color}`}>
            {item.icon}
          </div>
          <span className="text-sm text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  )
})

SeatLegend.displayName = 'SeatLegend'

export default SeatLegend
