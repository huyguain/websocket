import { configureStore } from '@reduxjs/toolkit'
import seatMapReducer from './seatMapSlice'

export const store = configureStore({
  reducer: {
    seatMap: seatMapReducer,
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['seatMap/updateSeat'],
        ignoredPaths: ['seatMap.seatMap.seats'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
