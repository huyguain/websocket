import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Seat {
  id: string
  row: number
  number: number
  status: 'available' | 'selected' | 'occupied' | 'reserved'
  userId?: string
  userName?: string
  selectedAt?: number
}

export interface SeatMap {
  id: string
  name: string
  rows: number
  seatsPerRow: number
  seats: Seat[]
}

export interface User {
  id: string
  name: string
}

export interface SeatMapState {
  seatMap: SeatMap | null
  selectedSeats: string[]
  user: User | null
  isLoading: boolean
  error: string | null
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

const initialState: SeatMapState = {
  seatMap: null,
  selectedSeats: [],
  user: null,
  isLoading: false,
  error: null,
  connectionStatus: 'disconnected',
}

const seatMapSlice = createSlice({
  name: 'seatMap',
  initialState,
  reducers: {
    setLoading: (state: SeatMapState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    setError: (state: SeatMapState, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    setConnectionStatus: (state: SeatMapState, action: PayloadAction<SeatMapState['connectionStatus']>) => {
      state.connectionStatus = action.payload
    },
    
    setUser: (state: SeatMapState, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    
    setSeatMap: (state: SeatMapState, action: PayloadAction<SeatMap>) => {
      state.seatMap = action.payload
    },
    
    updateSeat: (state: SeatMapState, action: PayloadAction<Seat>) => {
      if (state.seatMap) {
        const seatIndex = state.seatMap.seats.findIndex((seat: Seat) => seat.id === action.payload.id)
        if (seatIndex !== -1) {
          state.seatMap.seats[seatIndex] = action.payload
        }
      }
    },
    
    selectSeat: (state: SeatMapState, action: PayloadAction<string>) => {
      if (!state.selectedSeats.includes(action.payload)) {
        state.selectedSeats.push(action.payload)
      }
    },
    
    deselectSeat: (state: SeatMapState, action: PayloadAction<string>) => {
      state.selectedSeats = state.selectedSeats.filter((id: string) => id !== action.payload)
    },
    
    clearSelectedSeats: (state: SeatMapState) => {
      state.selectedSeats = []
    },
    
    bookSeats: (state: SeatMapState, action: PayloadAction<string[]>) => {
      if (state.seatMap) {
        action.payload.forEach((seatId: string) => {
          const seat = state.seatMap!.seats.find((s: Seat) => s.id === seatId)
          if (seat) {
            seat.status = 'occupied'
          }
        })
      }
      state.selectedSeats = []
    },
    
    resetState: () => initialState,
  },
})

export const {
  setLoading,
  setError,
  setConnectionStatus,
  setUser,
  setSeatMap,
  updateSeat,
  selectSeat,
  deselectSeat,
  clearSelectedSeats,
  bookSeats,
  resetState,
} = seatMapSlice.actions

export default seatMapSlice.reducer
