import React, { Suspense, lazy } from 'react'

// Lazy load các components không cần thiết ngay
const SeatLegend = lazy(() => import('./SeatLegend'))
const BookingPanel = lazy(() => import('./BookingPanel'))

interface LazyComponentsProps {
  children: React.ReactNode
}

const LazyComponents: React.FC<LazyComponentsProps> = ({ children }) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    }>
      {children}
    </Suspense>
  )
}

export { SeatLegend, BookingPanel, LazyComponents }
