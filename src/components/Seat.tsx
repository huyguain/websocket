import React, { memo } from 'react'
import { Seat } from '@/store/seatMapSlice'

interface SeatComponentProps {
  seat: Seat
  isSelected: boolean
  onSelect: (seatId: string) => void
  onDeselect: (seatId: string) => void
  disabled?: boolean
}

const SeatComponent: React.FC<SeatComponentProps> = memo(({
  seat,
  isSelected,
  onSelect,
  onDeselect,
  disabled = false,
}) => {
  const handleClick = () => {
    if (disabled || seat.status === 'occupied') return
    
    if (isSelected) {
      onDeselect(seat.id)
    } else {
      onSelect(seat.id)
    }
  }

  const getSeatClasses = () => {
    const baseClasses = 'w-8 h-8 rounded-md border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium'
    
    if (disabled) {
      return `${baseClasses} bg-gray-100 border-gray-300 cursor-not-allowed opacity-50`
    }
    
    switch (seat.status) {
      case 'available':
        return `${baseClasses} bg-green-100 border-green-300 hover:bg-green-200 hover:border-green-400 ${
          isSelected ? 'bg-blue-200 border-blue-400' : ''
        }`
      case 'selected':
        return `${baseClasses} bg-blue-200 border-blue-400`
      case 'occupied':
        return `${baseClasses} bg-red-200 border-red-400 cursor-not-allowed`
      case 'reserved':
        return `${baseClasses} bg-yellow-200 border-yellow-400 cursor-not-allowed`
      default:
        return `${baseClasses} bg-gray-100 border-gray-300`
    }
  }

  const getSeatIcon = () => {
    switch (seat.status) {
      case 'occupied':
        return '✕'
      case 'selected':
        return '✓'
      case 'reserved':
        return '⏰'
      default:
        return seat.number
    }
  }

  return (
    <button
      className={getSeatClasses()}
      onClick={handleClick}
      disabled={disabled || seat.status === 'occupied'}
      title={`Ghế ${seat.row}-${seat.number} - ${getStatusText(seat.status)}`}
      data-testid={`seat-${seat.id}`}
    >
      {getSeatIcon()}
    </button>
  )
})

SeatComponent.displayName = 'SeatComponent'

const getStatusText = (status: Seat['status']): string => {
  switch (status) {
    case 'available':
      return 'Có sẵn'
    case 'selected':
      return 'Đã chọn'
    case 'occupied':
      return 'Đã đặt'
    case 'reserved':
      return 'Đã giữ'
    default:
      return 'Không xác định'
  }
}

export default SeatComponent
