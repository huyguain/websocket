import React, { memo, useCallback, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { clearSelectedSeats } from '@/store/seatMapSlice'
import { useSocket } from '@/hooks/useSocket'

interface BookingPanelProps {
  className?: string
}

const BookingPanel: React.FC<BookingPanelProps> = memo(({ className = '' }) => {
  const dispatch = useAppDispatch()
  const { selectedSeats, user, seatMap, connectionStatus } = useAppSelector(state => state.seatMap)
  const { bookSelectedSeats, isConnected } = useSocket()

  const handleBookSeats = useCallback(() => {
    if (selectedSeats.length === 0 || !isConnected) return
    
    bookSelectedSeats()
  }, [selectedSeats.length, isConnected, bookSelectedSeats])

  const handleClearSelection = useCallback(() => {
    dispatch(clearSelectedSeats())
  }, [dispatch])

  const selectedSeatsDetails = useMemo(() => {
    if (!seatMap || selectedSeats.length === 0) return []
    
    return selectedSeats.map(seatId => {
      const seat = seatMap.seats.find(s => s.id === seatId)
      return seat ? { row: seat.row, number: seat.number } : null
    }).filter(Boolean)
  }, [seatMap, selectedSeats])

  const totalPrice = useMemo(() => {
    // Giả sử mỗi ghế có giá 100k VND
    return selectedSeats.length * 100000
  }, [selectedSeats.length])

  const canBook = selectedSeats.length > 0 && isConnected && user && connectionStatus === 'connected'

  if (selectedSeats.length === 0) {
    return (
      <div className={`p-6 bg-gray-50 rounded-lg text-center ${className}`}>
        <div className="text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <p className="text-gray-600">Chưa có ghế nào được chọn</p>
        <p className="text-sm text-gray-500 mt-1">Hãy chọn ghế từ sơ đồ bên trên</p>
      </div>
    )
  }

  return (
    <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin đặt ghế</h3>
      
      {/* Selected Seats */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Ghế đã chọn:</h4>
        <div className="flex flex-wrap gap-2">
          {selectedSeatsDetails.map((seat, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {seat?.row}-{seat?.number}
            </span>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tổng số ghế:</span>
          <span className="font-medium">{selectedSeats.length}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-600">Giá mỗi ghế:</span>
          <span className="font-medium">100.000 VND</span>
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
          <span className="font-semibold text-gray-800">Tổng cộng:</span>
          <span className="font-bold text-lg text-blue-600">
            {totalPrice.toLocaleString('vi-VN')} VND
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleBookSeats}
          disabled={!canBook}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            canBook
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isConnected ? 'Đặt ghế' : 'Đang kết nối...'}
        </button>
        
        <button
          onClick={handleClearSelection}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Bỏ chọn tất cả
        </button>
      </div>

      {/* Status Messages */}
      {!isConnected && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ⚠️ Không thể đặt ghế khi mất kết nối
        </div>
      )}
      
      {!user && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          ⚠️ Vui lòng đăng nhập để đặt ghế
        </div>
      )}
    </div>
  )
})

BookingPanel.displayName = 'BookingPanel'

export default BookingPanel
