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

// 📦 Simple Protobuf detection (fallback to JSON for now)
const isProtobufData = (data: any): boolean => {
  return data instanceof ArrayBuffer || 
         (typeof data === 'object' && data.constructor === Uint8Array) ||
         Buffer.isBuffer(data)
}

interface ReconnectConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'
  reconnectAttempts: number
  selectSeat: (seatId: string) => void
  deselectSeat: (seatId: string) => void
  bookSelectedSeats: () => void
  manualReconnect: () => void
  disconnect: () => void
}

export const useSocket = (): UseSocketReturn => {
  const dispatch = useAppDispatch()
  const { user, selectedSeats, connectionStatus } = useAppSelector((state: any) => state.seatMap)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isManualDisconnectRef = useRef(false)
  
  const isConnectedState = connectionStatus === 'connected'

  // Cấu hình reconnect
  const reconnectConfig: ReconnectConfig = {
    maxAttempts: 10,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 1.5
  }

  // Tính toán delay cho reconnect với exponential backoff
  const calculateReconnectDelay = (attempt: number): number => {
    const delay = reconnectConfig.baseDelay * Math.pow(reconnectConfig.backoffMultiplier, attempt)
    return Math.min(delay, reconnectConfig.maxDelay)
  }

  // Hàm reconnect với exponential backoff
  const attemptReconnect = useCallback(() => {
    if (isManualDisconnectRef.current) return
    
    if (reconnectAttempts >= reconnectConfig.maxAttempts) {
      console.log('🚫 Max reconnect attempts reached')
      dispatch(setConnectionStatus('error'))
      dispatch(setError('Không thể kết nối đến server sau nhiều lần thử'))
      return
    }

    const delay = calculateReconnectDelay(reconnectAttempts)
    console.log(`🔄 Attempting reconnect ${reconnectAttempts + 1}/${reconnectConfig.maxAttempts} in ${delay}ms`)
    
    dispatch(setConnectionStatus('reconnecting' as any))
    setReconnectAttempts(prev => prev + 1)

    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect()
      }
    }, delay)
  }, [reconnectAttempts, dispatch])

  // Hàm khởi tạo heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('ping')
      }
    }, 30000) // Ping mỗi 30 giây
  }, [])

  // Hàm dừng heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // Initialize Socket.IO connection
  useEffect(() => {
    const connectSocket = () => {
      const socket = io('http://localhost:3000', {
        path: '/api/ws/socket.io',
        transports: ['websocket', 'polling'],
        autoConnect: false, // Tắt auto connect để tự quản lý
        reconnection: false, // Tắt auto reconnection để tự quản lý
        timeout: 10000,
      })

      socketRef.current = socket

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id)
        dispatch(setConnectionStatus('connected'))
        setIsConnected(true)
        dispatch(setError(null))
        setReconnectAttempts(0) // Reset reconnect attempts
        startHeartbeat() // Bắt đầu heartbeat
      })

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason)
        dispatch(setConnectionStatus('disconnected'))
        setIsConnected(false)
        stopHeartbeat() // Dừng heartbeat
        
        // Chỉ reconnect nếu không phải manual disconnect
        if (!isManualDisconnectRef.current && reason !== 'io client disconnect') {
          attemptReconnect()
        }
      })

      socket.on('connect_error', (error) => {
        console.error('🚨 Socket connection error:', error)
        dispatch(setConnectionStatus('error'))
        dispatch(setError('Lỗi kết nối đến server'))
        setIsConnected(false)
        stopHeartbeat()
        
        // Thử reconnect sau khi có lỗi
        if (!isManualDisconnectRef.current) {
          attemptReconnect()
        }
      })

      socket.on('pong', () => {
        console.log('🏓 Received pong from server')
      })

      // 📦 Seat map data (hỗ trợ cả Protobuf và JSON)
      socket.on('seatMap:data', (data) => {
        try {
          // Kiểm tra xem data có phải là binary protobuf không
          if (isProtobufData(data)) {
            console.log('📦 Received protobuf data (binary), falling back to JSON mode')
            // Tạm thời fallback về JSON mode
            socket.emit('request-json-data')
          } else {
            // JSON format
            console.log('📦 Received seat map via JSON')
            dispatch(setSeatMap(data))
          }
        } catch (error) {
          console.error('Error processing seat map data:', error)
        }
      })

      // 📦 Seat updates (hỗ trợ cả Protobuf và JSON)
      socket.on('seat:updated', (data) => {
        try {
          // Kiểm tra xem data có phải là binary protobuf không
          if (isProtobufData(data)) {
            console.log('📦 Received protobuf seat update (binary), falling back to JSON mode')
            // Tạm thời fallback về JSON mode
          } else {
            // JSON format
            console.log('📦 Received seat update via JSON:', data.id, data.status)
            dispatch(updateSeat(data))
          }
        } catch (error) {
          console.error('Error processing seat update:', error)
        }
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
    
    // Bắt đầu kết nối
    dispatch(setConnectionStatus('connecting'))
    if (socketRef.current) {
      socketRef.current.connect()
    }

    return () => {
      isManualDisconnectRef.current = true
      stopHeartbeat()
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [dispatch, attemptReconnect, startHeartbeat, stopHeartbeat])

  const selectSeat = useCallback((seatId: string) => {
    if (!user || !isConnectedState || !socketRef.current) return
    
    // 📦 Gửi request bằng JSON (tạm thời)
    socketRef.current.emit('seat:select', {
      seatId,
      userId: user.id,
      userName: user.name,
    })
    console.log('📦 Sent select request via JSON')
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

  // Hàm reconnect thủ công
  const manualReconnect = useCallback(() => {
    if (socketRef.current) {
      isManualDisconnectRef.current = false
      setReconnectAttempts(0)
      dispatch(setConnectionStatus('connecting'))
      socketRef.current.connect()
    }
  }, [dispatch])

  // Hàm disconnect thủ công
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      isManualDisconnectRef.current = true
      stopHeartbeat()
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      socketRef.current.disconnect()
      dispatch(setConnectionStatus('disconnected'))
      setIsConnected(false)
    }
  }, [dispatch, stopHeartbeat])

  return {
    socket: socketRef.current,
    isConnected: isConnectedState,
    connectionStatus,
    reconnectAttempts,
    selectSeat,
    deselectSeat,
    bookSelectedSeats,
    manualReconnect,
    disconnect,
  }
}