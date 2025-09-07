import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import SeatLegend from '@/components/SeatLegend'

const createMockStore = () => {
  return configureStore({
    reducer: {
      seatMap: () => ({}),
    },
  })
}

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore()
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('SeatLegend', () => {
  it('renders all legend items', () => {
    renderWithProvider(<SeatLegend />)

    expect(screen.getByText('Chú thích:')).toBeInTheDocument()
    expect(screen.getByText('Có sẵn')).toBeInTheDocument()
    expect(screen.getByText('Đã chọn')).toBeInTheDocument()
    expect(screen.getByText('Đã đặt')).toBeInTheDocument()
    expect(screen.getByText('Đã giữ')).toBeInTheDocument()
  })

  it('renders correct icons for each status', () => {
    renderWithProvider(<SeatLegend />)

    // Check for icons
    expect(screen.getByText('1')).toBeInTheDocument() // Available
    expect(screen.getByText('✓')).toBeInTheDocument() // Selected
    expect(screen.getByText('✕')).toBeInTheDocument() // Occupied
    expect(screen.getByText('⏰')).toBeInTheDocument() // Reserved
  })

  it('applies custom className', () => {
    renderWithProvider(<SeatLegend className="custom-class" />)

    const legendElement = screen.getByText('Chú thích:').closest('div')
    expect(legendElement).toHaveClass('custom-class')
  })
})
