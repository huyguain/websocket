import React, { memo, useMemo, useCallback, useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectSeat, deselectSeat } from '@/store/seatMapSlice'
import { useSocket } from '@/hooks/useSocket'
import SeatComponent from './Seat'
import SeatLegend from './SeatLegend'

interface SeatMapProps {
  className?: string
}

// Virtualized Seat Row Component
const VirtualizedSeatRow = memo(({ 
  rowSeats, 
  rowIndex, 
  onSelectSeat, 
  onDeselectSeat, 
  selectedSeats, 
  isConnected, 
  user 
}: {
  rowSeats: any[]
  rowIndex: number
  onSelectSeat: (seatId: string) => void
  onDeselectSeat: (seatId: string) => void
  selectedSeats: string[]
  isConnected: boolean
  user: any
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const rowRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (rowRef.current) {
      observer.observe(rowRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={rowRef} className="flex items-center space-x-2">
      <div className="w-8 text-sm font-medium text-gray-600 text-center">
        {rowIndex + 1}
      </div>
      <div className="flex space-x-1">
        {isVisible ? (
          rowSeats.map((seat) => (
            <SeatComponent
              key={seat.id}
              seat={seat}
              isSelected={selectedSeats.includes(seat.id)}
              onSelect={onSelectSeat}
              onDeselect={onDeselectSeat}
              disabled={!isConnected || !user}
            />
          ))
        ) : (
          // Placeholder khi không visible
          <div className="flex space-x-1">
            {rowSeats.map((seat) => (
              <div
                key={seat.id}
                className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

VirtualizedSeatRow.displayName = 'VirtualizedSeatRow'

const SeatMap: React.FC<SeatMapProps> = memo(({ className = '' }) => {
  const dispatch = useAppDispatch()
  const { seatMap, selectedSeats, user, connectionStatus } = useAppSelector(state => state.seatMap)
  const { selectSeat: socketSelectSeat, deselectSeat: socketDeselectSeat, isConnected } = useSocket()

  const handleSelectSeat = useCallback((seatId: string) => {
    if (!user || !isConnected) return
    
    dispatch(selectSeat(seatId))
    socketSelectSeat(seatId)
  }, [user, isConnected, dispatch, socketSelectSeat])

  const handleDeselectSeat = useCallback((seatId: string) => {
    if (!user || !isConnected) return
    
    dispatch(deselectSeat(seatId))
    socketDeselectSeat(seatId)
  }, [user, isConnected, dispatch, socketDeselectSeat])

  const seatRows = useMemo(() => {
    if (!seatMap) return []
    
    const rows: any[][] = []
    for (let i = 0; i < seatMap.rows; i++) {
      const rowSeats = seatMap.seats.filter(seat => seat.row === i + 1)
      rows.push(rowSeats)
    }
    return rows
  }, [seatMap])

  const connectionStatusText = useMemo(() => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Đang kết nối...'
      case 'connected':
        return 'Đã kết nối'
      case 'disconnected':
        return 'Mất kết nối'
      case 'error':
        return 'Lỗi kết nối'
      default:
        return 'Không xác định'
    }
  }, [connectionStatus])

  const connectionStatusColor = useMemo(() => {
    switch (connectionStatus) {
      case 'connecting':
        return 'text-yellow-600'
      case 'connected':
        return 'text-green-600'
      case 'disconnected':
        return 'text-red-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }, [connectionStatus])

  if (!seatMap) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{seatMap.name}</h1>
        <div className="flex items-center justify-center gap-4">
          <div className={`text-sm ${connectionStatusColor}`}>
            Trạng thái: {connectionStatusText}
          </div>
          {user && (
            <div className="text-sm text-gray-600">
              Người dùng: {user.name}
            </div>
          )}
          {selectedSeats.length > 0 && (
            <div className="text-sm text-blue-600">
              Đã chọn: {selectedSeats.length} ghế
            </div>
          )}
        </div>
      </div>

      {/* Screen */}
      <div className="text-center">
        <div className="bg-gray-800 text-white py-2 px-8 rounded-lg inline-block">
          MÀN HÌNH
        </div>
      </div>

      {/* Virtualized Seat Map */}
      <div className="flex flex-col items-center space-y-2 max-h-96 overflow-y-auto">
        {seatRows.map((rowSeats, rowIndex) => (
          <VirtualizedSeatRow
            key={rowIndex}
            rowSeats={rowSeats}
            rowIndex={rowIndex}
            onSelectSeat={handleSelectSeat}
            onDeselectSeat={handleDeselectSeat}
            selectedSeats={selectedSeats}
            isConnected={isConnected}
            user={user}
          />
        ))}
      </div>

      {/* Legend */}
      <SeatLegend />

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p>Nhấp vào ghế để chọn/bỏ chọn. Ghế đã đặt không thể chọn.</p>
        {!isConnected && (
          <p className="text-red-600 mt-2">
            ⚠️ Không thể chọn ghế khi mất kết nối
          </p>
        )}
      </div>
    </div>
  )
})

SeatMap.displayName = 'SeatMap'

export default SeatMap