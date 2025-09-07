import React from 'react'
import { useSocket } from '@/hooks/useSocket'

interface ConnectionStatusProps {
  className?: string
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { connectionStatus, reconnectAttempts, manualReconnect, disconnect } = useSocket()

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connecting':
        return {
          text: 'Đang kết nối...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '🔄'
        }
      case 'connected':
        return {
          text: 'Đã kết nối',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '✅'
        }
      case 'reconnecting':
        return {
          text: `Đang kết nối lại... (${reconnectAttempts})`,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: '🔄'
        }
      case 'disconnected':
        return {
          text: 'Mất kết nối',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '❌'
        }
      case 'error':
        return {
          text: 'Lỗi kết nối',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '🚨'
        }
      default:
        return {
          text: 'Không xác định',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '❓'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${statusInfo.bgColor} ${className}`}>
      <span className="text-lg">{statusInfo.icon}</span>
      
      <div className="flex-1">
        <p className={`font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </p>
        
        {connectionStatus === 'reconnecting' && reconnectAttempts > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Thử lại lần {reconnectAttempts}/10
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
          <button
            onClick={manualReconnect}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Kết nối lại
          </button>
        )}
        
        {connectionStatus === 'connected' && (
          <button
            onClick={disconnect}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Ngắt kết nối
          </button>
        )}
      </div>
    </div>
  )
}

export default ConnectionStatus
