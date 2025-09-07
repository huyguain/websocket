import React, { useState, useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'

interface ProtobufDemoProps {
  className?: string
}

export const ProtobufDemo: React.FC<ProtobufDemoProps> = ({ className = '' }) => {
  const { socket, connectionStatus } = useSocket()
  const [messageStats, setMessageStats] = useState({
    sent: 0,
    received: 0,
    protobufSent: 0,
    protobufReceived: 0
  })

  useEffect(() => {
    if (!socket) return

    // Track messages
    const originalEmit = socket.emit.bind(socket)
    const originalOn = socket.on.bind(socket)

    // Track sent messages
    socket.emit = function(event: string, ...args: any[]) {
      if (event === 'seat:select') {
        setMessageStats(prev => ({ 
          ...prev, 
          sent: prev.sent + 1,
          protobufSent: Buffer.isBuffer(args[0]) ? prev.protobufSent + 1 : prev.protobufSent
        }))
      }
      return originalEmit(event, ...args)
    }

    // Track received messages
    socket.on('seatMap:data', (data: any) => {
      setMessageStats(prev => ({ 
        ...prev, 
        received: prev.received + 1,
        protobufReceived: Buffer.isBuffer(data) ? prev.protobufReceived + 1 : prev.protobufReceived
      }))
    })

    socket.on('seat:updated', (data: any) => {
      setMessageStats(prev => ({ 
        ...prev, 
        received: prev.received + 1,
        protobufReceived: Buffer.isBuffer(data) ? prev.protobufReceived + 1 : prev.protobufReceived
      }))
    })

    return () => {
      socket.emit = originalEmit
      socket.on = originalOn
    }
  }, [socket])

  const getProtobufUsage = () => {
    const total = messageStats.sent + messageStats.received
    const protobufTotal = messageStats.protobufSent + messageStats.protobufReceived
    return total > 0 ? Math.round((protobufTotal / total) * 100) : 0
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="text-blue-500 text-lg">📦</div>
        
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 mb-3">
            Protocol Buffers Demo
          </h3>
          
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800">Trạng thái:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                connectionStatus === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {connectionStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>

            {/* Message Statistics */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-800">Messages sent:</span>
                <span className="text-sm font-medium text-blue-900">{messageStats.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-800">Messages received:</span>
                <span className="text-sm font-medium text-blue-900">{messageStats.received}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-800">Protobuf usage:</span>
                <span className="text-sm font-medium text-green-600">{getProtobufUsage()}%</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Lợi ích của Protobuf:</h4>
              <ul className="space-y-1">
                <li className="text-xs text-blue-700">📦 Giảm kích thước dữ liệu ~30-50%</li>
                <li className="text-xs text-blue-700">⚡ Tăng tốc độ serialize/deserialize</li>
                <li className="text-xs text-blue-700">🔒 Type safety với schema validation</li>
                <li className="text-xs text-blue-700">🌐 Cross-platform compatibility</li>
              </ul>
            </div>

            {/* Technical Info */}
            <div className="mt-3 p-2 bg-blue-100 border border-blue-200 rounded text-blue-800 text-xs">
              <p><strong>Schema:</strong> Seat, SeatMap, SelectSeatRequest</p>
              <p><strong>Format:</strong> Binary (thay vì JSON)</p>
              <p><strong>Fallback:</strong> JSON khi Protobuf không khả dụng</p>
            </div>

            {/* Demo Instructions */}
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-yellow-800 text-xs">
              <p><strong>💡 Demo:</strong></p>
              <p>1. Đăng nhập để có thể chọn ghế</p>
              <p>2. Click vào ghế để chọn</p>
              <p>3. Xem console để thấy Protobuf vs JSON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtobufDemo
