import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import BookingPanel from '@/components/BookingPanel'
import seatMapReducer from '@/store/seatMapSlice'

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

const mockSeatMap = {
  id: 'theater-1',
  name: 'Test Theater',
  rows: 2,
  seatsPerRow: 3,
  seats: [
    { id: 'seat-1', row: 1, number: 1, status: 'available' as const },
    { id: 'seat-2', row: 1, number: 2, status: 'available' as const },
    { id: 'seat-3', row: 1, number: 3, status: 'occupied' as const },
    { id: 'seat-4', row: 2, number: 1, status: 'available' as const },
    { id: 'seat-5', row: 2, number: 2, status: 'available' as const },
    { id: 'seat-6', row: 2, number: 3, status: 'available' as const },
  ],
}

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState)
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

// Mock useSocket hook
jest.mock('@/hooks/useSocket', () => ({
  useSocket: () => ({
    bookSelectedSeats: jest.fn(),
    isConnected: true,
  }),
}))

describe('BookingPanel', () => {
  it('shows empty state when no seats selected', () => {
    renderWithProvider(<BookingPanel />)

    expect(screen.getByText('Chưa có ghế nào được chọn')).toBeInTheDocument()
    expect(screen.getByText('Hãy chọn ghế từ sơ đồ bên trên')).toBeInTheDocument()
  })

  it('shows selected seats information', () => {
    const initialState = {
      selectedSeats: ['seat-1', 'seat-2'],
      seatMap: mockSeatMap,
      user: { id: 'user-1', name: 'Test User' },
      connectionStatus: 'connected',
    }

    renderWithProvider(<BookingPanel />, initialState)

    expect(screen.getByText('Thông tin đặt ghế')).toBeInTheDocument()
    expect(screen.getByText('Ghế đã chọn:')).toBeInTheDocument()
    expect(screen.getByText('1-1')).toBeInTheDocument()
    expect(screen.getByText('1-2')).toBeInTheDocument()
  })

  it('calculates total price correctly', () => {
    const initialState = {
      selectedSeats: ['seat-1', 'seat-2'],
      seatMap: mockSeatMap,
      user: { id: 'user-1', name: 'Test User' },
      connectionStatus: 'connected',
    }

    renderWithProvider(<BookingPanel />, initialState)

    expect(screen.getByText('Tổng số ghế:')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Giá mỗi ghế:')).toBeInTheDocument()
    expect(screen.getByText('100.000 VND')).toBeInTheDocument()
    expect(screen.getByText('Tổng cộng:')).toBeInTheDocument()
    expect(screen.getByText('200.000 VND')).toBeInTheDocument()
  })

  it('enables book button when connected and user logged in', () => {
    const initialState = {
      selectedSeats: ['seat-1'],
      seatMap: mockSeatMap,
      user: { id: 'user-1', name: 'Test User' },
      connectionStatus: 'connected',
    }

    renderWithProvider(<BookingPanel />, initialState)

    const bookButton = screen.getByText('Đặt ghế')
    expect(bookButton).not.toBeDisabled()
  })

  it('disables book button when not connected', () => {
    const initialState = {
      selectedSeats: ['seat-1'],
      seatMap: mockSeatMap,
      user: { id: 'user-1', name: 'Test User' },
      connectionStatus: 'disconnected',
    }

    renderWithProvider(<BookingPanel />, initialState)

    const bookButton = screen.getByText('Đang kết nối...')
    expect(bookButton).toBeDisabled()
  })

  it('shows connection error message when not connected', () => {
    const initialState = {
      selectedSeats: ['seat-1'],
      seatMap: mockSeatMap,
      user: { id: 'user-1', name: 'Test User' },
      connectionStatus: 'disconnected',
    }

    renderWithProvider(<BookingPanel />, initialState)

    expect(screen.getByText('⚠️ Không thể đặt ghế khi mất kết nối')).toBeInTheDocument()
  })

  it('shows login required message when user not logged in', () => {
    const initialState = {
      selectedSeats: ['seat-1'],
      seatMap: mockSeatMap,
      user: null,
      connectionStatus: 'connected',
    }

    renderWithProvider(<BookingPanel />, initialState)

    expect(screen.getByText('⚠️ Vui lòng đăng nhập để đặt ghế')).toBeInTheDocument()
  })

  it('handles clear selection', async () => {
    const initialState = {
      selectedSeats: ['seat-1', 'seat-2'],
      seatMap: mockSeatMap,
      user: { id: 'user-1', name: 'Test User' },
      connectionStatus: 'connected',
    }

    renderWithProvider(<BookingPanel />, initialState)

    fireEvent.click(screen.getByText('Bỏ chọn tất cả'))

    await waitFor(() => {
      expect(screen.getByText('Chưa có ghế nào được chọn')).toBeInTheDocument()
    })
  })
})
