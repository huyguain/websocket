'use client'

import React from 'react'
import SeatMap from '@/components/SeatMap'
import BookingPanel from '@/components/BookingPanel'
import UserLogin from '@/components/UserLogin'
import ConnectionStatus from '@/components/ConnectionStatus'
import ReconnectInfo from '@/components/ReconnectInfo'
import ReconnectTest from '@/components/ReconnectTest'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎬 Seat Map Demo
            </h1>
            <p className="text-lg text-gray-600">
              Hệ thống đặt ghế real-time với Next.js, Socket.IO và Redux Toolkit
            </p>
          </div>

          {/* Connection Status */}
          <div className="mb-6">
            <ConnectionStatus />
          </div>

          {/* Reconnect Info */}
          <div className="mb-6">
            <ReconnectInfo />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seat Map */}
            <div className="lg:col-span-2">
              <SeatMap />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <UserLogin />
              <BookingPanel />
              <ReconnectTest />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>
              Demo được xây dựng để thể hiện năng lực Senior Frontend ReactJS
            </p>
            <p className="mt-1">
              Tech Stack: Next.js 15, TypeScript, Redux Toolkit, Socket.IO, TailwindCSS
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
