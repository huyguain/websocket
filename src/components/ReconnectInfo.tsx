import React from 'react'
import { useSocket } from '@/hooks/useSocket'

interface ReconnectInfoProps {
  className?: string
}

export const ReconnectInfo: React.FC<ReconnectInfoProps> = ({ className = '' }) => {
  const { connectionStatus, reconnectAttempts, socket } = useSocket()

  if (connectionStatus !== 'reconnecting' && connectionStatus !== 'error') {
    return null
  }

  const getReconnectDelay = (attempt: number): number => {
    const baseDelay = 1000
    const maxDelay = 30000
    const backoffMultiplier = 1.5
    const delay = baseDelay * Math.pow(backoffMultiplier, attempt)
    return Math.min(delay, maxDelay)
  }

  const nextDelay = getReconnectDelay(reconnectAttempts)
  const maxAttempts = 10

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="text-blue-500 text-lg">🔄</div>
        
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 mb-2">
            Thông tin kết nối lại
          </h3>
          
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Số lần thử:</span>
              <span className="font-medium">{reconnectAttempts}/{maxAttempts}</span>
            </div>
            
            {connectionStatus === 'reconnecting' && (
              <div className="flex justify-between">
                <span>Thời gian chờ tiếp theo:</span>
                <span className="font-medium">{(nextDelay / 1000).toFixed(1)}s</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Socket ID:</span>
              <span className="font-mono text-xs">{socket?.id || 'N/A'}</span>
            </div>
          </div>
          
          {connectionStatus === 'error' && reconnectAttempts >= maxAttempts && (
            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
              <strong>⚠️ Cảnh báo:</strong> Đã đạt giới hạn số lần thử kết nối lại. 
              Vui lòng kiểm tra kết nối mạng hoặc thử kết nối thủ công.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReconnectInfo
