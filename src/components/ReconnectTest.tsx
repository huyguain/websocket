import React from 'react'
import { useSocket } from '@/hooks/useSocket'

interface ReconnectTestProps {
  className?: string
}

export const ReconnectTest: React.FC<ReconnectTestProps> = ({ className = '' }) => {
  const { socket, connectionStatus, manualReconnect, disconnect } = useSocket()

  const simulateNetworkError = () => {
    if (socket) {
      // Simulate network error by closing connection abruptly
      socket.disconnect()
    }
  }

  const simulateServerRestart = () => {
    if (socket) {
      // Simulate server restart
      socket.io.engine.close()
    }
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="font-medium text-gray-900 mb-3">🧪 Test Reconnect</h3>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={simulateNetworkError}
            disabled={connectionStatus !== 'connected'}
            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Simulate Network Error
          </button>
          
          <button
            onClick={simulateServerRestart}
            disabled={connectionStatus !== 'connected'}
            className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Simulate Server Restart
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={manualReconnect}
            disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Manual Reconnect
          </button>
          
          <button
            onClick={disconnect}
            disabled={connectionStatus !== 'connected'}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <p><strong>Trạng thái:</strong> {connectionStatus}</p>
        <p><strong>Socket ID:</strong> {socket?.id || 'N/A'}</p>
      </div>
    </div>
  )
}

export default ReconnectTest
