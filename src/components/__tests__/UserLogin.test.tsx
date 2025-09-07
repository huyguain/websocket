import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import UserLogin from '@/components/UserLogin'
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

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState)
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('UserLogin', () => {
  it('renders login form when user is not logged in', () => {
    renderWithProvider(<UserLogin />)

    expect(screen.getByText('Đăng nhập')).toBeInTheDocument()
    expect(screen.getByText('Đăng nhập với tên tùy chỉnh')).toBeInTheDocument()
    expect(screen.getByText('Đăng nhập nhanh')).toBeInTheDocument()
  })

  it('shows custom login form when clicking custom login button', () => {
    renderWithProvider(<UserLogin />)

    fireEvent.click(screen.getByText('Đăng nhập với tên tùy chỉnh'))
    
    expect(screen.getByPlaceholderText('Nhập tên của bạn')).toBeInTheDocument()
    expect(screen.getByText('Đăng nhập')).toBeInTheDocument()
    expect(screen.getByText('Hủy')).toBeInTheDocument()
  })

  it('handles custom login form submission', async () => {
    renderWithProvider(<UserLogin />)

    fireEvent.click(screen.getByText('Đăng nhập với tên tùy chỉnh'))
    
    const input = screen.getByPlaceholderText('Nhập tên của bạn')
    fireEvent.change(input, { target: { value: 'Test User' } })
    
    fireEvent.click(screen.getByText('Đăng nhập'))

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })

  it('handles quick login', async () => {
    renderWithProvider(<UserLogin />)

    fireEvent.click(screen.getByText('Đăng nhập nhanh'))

    await waitFor(() => {
      expect(screen.getByText(/User-/)).toBeInTheDocument()
    })
  })

  it('shows logged in state when user exists', () => {
    const initialState = {
      user: {
        id: 'user-1',
        name: 'Test User',
      },
    }

    renderWithProvider(<UserLogin />, initialState)

    expect(screen.getByText('Đã đăng nhập với tên:')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
  })

  it('handles logout', async () => {
    const initialState = {
      user: {
        id: 'user-1',
        name: 'Test User',
      },
    }

    renderWithProvider(<UserLogin />, initialState)

    fireEvent.click(screen.getByText('Đăng xuất'))

    await waitFor(() => {
      expect(screen.getByText('Đăng nhập')).toBeInTheDocument()
    })
  })

  it('cancels custom login form', () => {
    renderWithProvider(<UserLogin />)

    fireEvent.click(screen.getByText('Đăng nhập với tên tùy chỉnh'))
    fireEvent.click(screen.getByText('Hủy'))

    expect(screen.getByText('Đăng nhập với tên tùy chỉnh')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Nhập tên của bạn')).not.toBeInTheDocument()
  })

  it('disables login button when input is empty', () => {
    renderWithProvider(<UserLogin />)

    fireEvent.click(screen.getByText('Đăng nhập với tên tùy chỉnh'))
    
    const loginButton = screen.getByText('Đăng nhập')
    expect(loginButton).toBeDisabled()
  })
})
