import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import SeatComponent from '@/components/Seat'
import seatMapReducer from '@/store/seatMapSlice'
import type { Seat } from '@/store/seatMapSlice'

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      seatMap: seatMapReducer,
    },
    preloadedState: {
      seatMap: {
        seatMap: null,
        selectedSeats: [],
        user: null,
        isLoading: false,
        error: null,
        connectionStatus: 'disconnected',
        ...initialState,
      },
    },
  })
}

const mockSeat: Seat = {
  id: 'seat-1',
  row: 1,
  number: 1,
  status: 'available',
}

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState)
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('SeatComponent', () => {
  const mockOnSelect = jest.fn()
  const mockOnDeselect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders seat with correct number', () => {
    renderWithProvider(
      <SeatComponent
        seat={mockSeat}
        isSelected={false}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByTestId('seat-seat-1')).toBeInTheDocument()
  })

  it('calls onSelect when clicking available seat', () => {
    renderWithProvider(
      <SeatComponent
        seat={mockSeat}
        isSelected={false}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />
    )

    fireEvent.click(screen.getByTestId('seat-seat-1'))
    expect(mockOnSelect).toHaveBeenCalledWith('seat-1')
  })

  it('calls onDeselect when clicking selected seat', () => {
    renderWithProvider(
      <SeatComponent
        seat={{ ...mockSeat, status: 'selected' }}
        isSelected={true}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />
    )

    fireEvent.click(screen.getByTestId('seat-seat-1'))
    expect(mockOnDeselect).toHaveBeenCalledWith('seat-1')
  })

  it('does not call handlers when seat is occupied', () => {
    const occupiedSeat = { ...mockSeat, status: 'occupied' as const }
    
    renderWithProvider(
      <SeatComponent
        seat={occupiedSeat}
        isSelected={false}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />
    )

    fireEvent.click(screen.getByTestId('seat-seat-1'))
    expect(mockOnSelect).not.toHaveBeenCalled()
    expect(mockOnDeselect).not.toHaveBeenCalled()
  })

  it('shows correct icon for different seat statuses', () => {
    const { rerender } = renderWithProvider(
      <SeatComponent
        seat={mockSeat}
        isSelected={false}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />
    )

    // Available seat shows number
    expect(screen.getByText('1')).toBeInTheDocument()

    // Occupied seat shows X
    rerender(
      <Provider store={createMockStore()}>
        <SeatComponent
          seat={{ ...mockSeat, status: 'occupied' }}
          isSelected={false}
          onSelect={mockOnSelect}
          onDeselect={mockOnDeselect}
        />
      </Provider>
    )
    expect(screen.getByText('✕')).toBeInTheDocument()

    // Selected seat shows checkmark
    rerender(
      <Provider store={createMockStore()}>
        <SeatComponent
          seat={{ ...mockSeat, status: 'selected' }}
          isSelected={true}
          onSelect={mockOnSelect}
          onDeselect={mockOnDeselect}
        />
      </Provider>
    )
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('applies correct CSS classes for different statuses', () => {
    const { rerender } = renderWithProvider(
      <SeatComponent
        seat={mockSeat}
        isSelected={false}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />
    )

    const seatElement = screen.getByTestId('seat-seat-1')
    
    // Available seat
    expect(seatElement).toHaveClass('bg-green-100', 'border-green-300')

    // Selected seat
    rerender(
      <Provider store={createMockStore()}>
        <SeatComponent
          seat={{ ...mockSeat, status: 'selected' }}
          isSelected={true}
          onSelect={mockOnSelect}
          onDeselect={mockOnDeselect}
        />
      </Provider>
    )
    expect(screen.getByTestId('seat-seat-1')).toHaveClass('bg-blue-200', 'border-blue-400')

    // Occupied seat
    rerender(
      <Provider store={createMockStore()}>
        <SeatComponent
          seat={{ ...mockSeat, status: 'occupied' }}
          isSelected={false}
          onSelect={mockOnSelect}
          onDeselect={mockOnDeselect}
        />
      </Provider>
    )
    expect(screen.getByTestId('seat-seat-1')).toHaveClass('bg-red-200', 'border-red-400')
  })
})
