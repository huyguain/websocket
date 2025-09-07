import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
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

describe('seatMapSlice', () => {
  it('should handle initial state', () => {
    const store = createMockStore()
    const state = store.getState().seatMap

    expect(state.seatMap).toBeNull()
    expect(state.selectedSeats).toEqual([])
    expect(state.user).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.connectionStatus).toBe('disconnected')
  })

  it('should handle setUser', () => {
    const store = createMockStore()
    const user = { id: 'user-1', name: 'Test User' }

    store.dispatch({ type: 'seatMap/setUser', payload: user })
    const state = store.getState().seatMap

    expect(state.user).toEqual(user)
  })

  it('should handle selectSeat', () => {
    const store = createMockStore()
    const seatId = 'seat-1'

    store.dispatch({ type: 'seatMap/selectSeat', payload: seatId })
    const state = store.getState().seatMap

    expect(state.selectedSeats).toContain(seatId)
  })

  it('should handle deselectSeat', () => {
    const store = createMockStore({
      selectedSeats: ['seat-1', 'seat-2'],
    })

    store.dispatch({ type: 'seatMap/deselectSeat', payload: 'seat-1' })
    const state = store.getState().seatMap

    expect(state.selectedSeats).toEqual(['seat-2'])
  })

  it('should handle clearSelectedSeats', () => {
    const store = createMockStore({
      selectedSeats: ['seat-1', 'seat-2'],
    })

    store.dispatch({ type: 'seatMap/clearSelectedSeats' })
    const state = store.getState().seatMap

    expect(state.selectedSeats).toEqual([])
  })

  it('should handle setConnectionStatus', () => {
    const store = createMockStore()

    store.dispatch({ type: 'seatMap/setConnectionStatus', payload: 'connected' })
    const state = store.getState().seatMap

    expect(state.connectionStatus).toBe('connected')
  })

  it('should handle setSeatMap', () => {
    const store = createMockStore()
    const seatMap = {
      id: 'theater-1',
      name: 'Test Theater',
      rows: 2,
      seatsPerRow: 3,
      seats: [],
    }

    store.dispatch({ type: 'seatMap/setSeatMap', payload: seatMap })
    const state = store.getState().seatMap

    expect(state.seatMap).toEqual(seatMap)
  })

  it('should handle updateSeat', () => {
    const seatMap = {
      id: 'theater-1',
      name: 'Test Theater',
      rows: 2,
      seatsPerRow: 3,
      seats: [
        { id: 'seat-1', row: 1, number: 1, status: 'available' as const },
        { id: 'seat-2', row: 1, number: 2, status: 'available' as const },
      ],
    }

    const store = createMockStore({ seatMap })
    const updatedSeat = { id: 'seat-1', row: 1, number: 1, status: 'selected' as const }

    store.dispatch({ type: 'seatMap/updateSeat', payload: updatedSeat })
    const state = store.getState().seatMap

    expect(state.seatMap?.seats[0]).toEqual(updatedSeat)
  })

  it('should handle bookSeats', () => {
    const seatMap = {
      id: 'theater-1',
      name: 'Test Theater',
      rows: 2,
      seatsPerRow: 3,
      seats: [
        { id: 'seat-1', row: 1, number: 1, status: 'selected' as const },
        { id: 'seat-2', row: 1, number: 2, status: 'selected' as const },
      ],
    }

    const store = createMockStore({ seatMap, selectedSeats: ['seat-1', 'seat-2'] })

    store.dispatch({ type: 'seatMap/bookSeats', payload: ['seat-1', 'seat-2'] })
    const state = store.getState().seatMap

    expect(state.seatMap?.seats[0].status).toBe('occupied')
    expect(state.seatMap?.seats[1].status).toBe('occupied')
    expect(state.selectedSeats).toEqual([])
  })

  it('should handle resetState', () => {
    const store = createMockStore({
      seatMap: { id: 'test', name: 'test', rows: 1, seatsPerRow: 1, seats: [] },
      selectedSeats: ['seat-1'],
      user: { id: 'user-1', name: 'Test User' },
      isLoading: true,
      error: 'Test error',
      connectionStatus: 'connected',
    })

    store.dispatch({ type: 'seatMap/resetState' })
    const state = store.getState().seatMap

    expect(state.seatMap).toBeNull()
    expect(state.selectedSeats).toEqual([])
    expect(state.user).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.connectionStatus).toBe('disconnected')
  })
})
