import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  setConnectionStatus, 
  setSeatMap, 
  updateSeat, 
  bookSeats,
  setError 
} from '@/store/seatMapSlice'
import type { Seat, SeatMap } from '@/store/seatMapSlice'

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  selectSeat: (seatId: string) => void
  deselectSeat: (seatId: string) => void
  bookSelectedSeats: () => void
}

export const useSocket = (): UseSocketReturn => {
  const dispatch = useAppDispatch()
  const { user, selectedSeats, connectionStatus } = useAppSelector((state: any) => state.seatMap)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  
  const isConnectedState = connectionStatus === 'connected'

  // Initialize Socket.IO connection
  useEffect(() => {
    const connectSocket = () => {
      const socket = io('http://localhost:3000', {
        path: '/api/ws/socket.io',
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      })

      socketRef.current = socket

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id)
        dispatch(setConnectionStatus('connected'))
        setIsConnected(true)
        dispatch(setError(null))
      })

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason)
        dispatch(setConnectionStatus('disconnected'))
        setIsConnected(false)
      })

      socket.on('connect_error', (error) => {
        console.error('🚨 Socket connection error:', error)
        dispatch(setConnectionStatus('error'))
        dispatch(setError('Không thể kết nối đến server'))
        setIsConnected(false)
      })

      // Seat map data
      socket.on('seatMap:data', (seatMap: SeatMap) => {
        console.log('📊 Received seat map data')
        dispatch(setSeatMap(seatMap))
      })

      // Seat updates
      socket.on('seat:updated', (seat: Seat) => {
        console.log('🔄 Seat updated:', seat.id, seat.status)
        dispatch(updateSeat(seat))
      })

      // Seat booking confirmation
      socket.on('seats:booked', (data: { seats: Seat[], userId: string, userName: string }) => {
        console.log('🎫 Seats booked:', data.seats.length)
        data.seats.forEach((seat: Seat) => {
          dispatch(updateSeat(seat))
        })
        dispatch(bookSeats(data.seats.map(s => s.id)))
      })

      // Error handling
      socket.on('seat:error', (error: { message: string }) => {
        console.error('🚨 Seat operation error:', error.message)
        dispatch(setError(error.message))
      })
    }

    // Connect socket
    connectSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [dispatch])

  const selectSeat = useCallback((seatId: string) => {
    if (!user || !isConnectedState || !socketRef.current) return
    
    socketRef.current.emit('seat:select', {
      seatId,
      userId: user.id,
      userName: user.name,
    })
  }, [user, isConnectedState])

  const deselectSeat = useCallback((seatId: string) => {
    if (!user || !isConnectedState || !socketRef.current) return
    
    socketRef.current.emit('seat:deselect', {
      seatId,
      userId: user.id,
    })
  }, [user, isConnectedState])

  const bookSelectedSeats = useCallback(() => {
    if (!user || !isConnectedState || selectedSeats.length === 0 || !socketRef.current) return
    
    socketRef.current.emit('seats:book', {
      seatIds: selectedSeats,
      userId: user.id,
      userName: user.name,
    })
  }, [user, isConnectedState, selectedSeats])

  return {
    socket: socketRef.current,
    isConnected: isConnectedState,
    selectSeat,
    deselectSeat,
    bookSelectedSeats,
  }
}