import { useCallback, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectSeat, deselectSeat, clearSelectedSeats } from '@/store/seatMapSlice'

export const useSeatSelection = () => {
  const dispatch = useAppDispatch()
  const { selectedSeats, seatMap, user, connectionStatus } = useAppSelector((state: any) => state.seatMap)

  const isConnected = connectionStatus === 'connected'
  const canSelectSeats = isConnected && !!user

  const selectedSeatsDetails = useMemo(() => {
    if (!seatMap || selectedSeats.length === 0) return []
    
    return selectedSeats.map((seatId: string) => {
      const seat = seatMap.seats.find((s: any) => s.id === seatId)
      return seat ? { 
        id: seat.id,
        row: seat.row, 
        number: seat.number,
        status: seat.status 
      } : null
    }).filter(Boolean)
  }, [seatMap, selectedSeats])

  const totalPrice = useMemo(() => {
    return selectedSeats.length * 100000 // 100k VND per seat
  }, [selectedSeats.length])

  const handleSelectSeat = useCallback((seatId: string) => {
    if (!canSelectSeats) return
    dispatch(selectSeat(seatId))
  }, [canSelectSeats, dispatch])

  const handleDeselectSeat = useCallback((seatId: string) => {
    if (!canSelectSeats) return
    dispatch(deselectSeat(seatId))
  }, [canSelectSeats, dispatch])

  const handleClearAllSelections = useCallback(() => {
    dispatch(clearSelectedSeats())
  }, [dispatch])

  return {
    selectedSeats,
    selectedSeatsDetails,
    totalPrice,
    canSelectSeats,
    isConnected,
    handleSelectSeat,
    handleDeselectSeat,
    handleClearAllSelections,
  }
}
