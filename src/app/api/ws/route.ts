import { NextRequest, NextResponse } from 'next/server'

// Interface cho seat data
export interface Seat {
  id: string
  row: number
  number: number
  status: 'available' | 'selected' | 'occupied' | 'reserved'
  userId?: string
  userName?: string
  selectedAt?: number
}

// Interface cho seat map data
export interface SeatMap {
  id: string
  name: string
  rows: number
  seatsPerRow: number
  seats: Seat[]
}

// Mock data cho seat map
const mockSeatMap: SeatMap = {
  id: 'theater-1',
  name: 'Rạp chiếu phim ABC',
  rows: 10,
  seatsPerRow: 15,
  seats: Array.from({ length: 150 }, (_, index) => ({
    id: `seat-${index + 1}`,
    row: Math.floor(index / 15) + 1,
    number: (index % 15) + 1,
    status: Math.random() > 0.7 ? 'occupied' : 'available',
    userId: Math.random() > 0.7 ? `user-${Math.floor(Math.random() * 100)}` : undefined,
    userName: Math.random() > 0.7 ? `User ${Math.floor(Math.random() * 100)}` : undefined,
  })),
}

// GET endpoint để lấy seat map data
export async function GET() {
  return NextResponse.json(mockSeatMap)
}

// POST endpoint để khởi tạo Socket.IO server
export async function POST(request: NextRequest) {
  try {
    // Trong Next.js App Router, chúng ta cần sử dụng cách khác để access HTTP server
    // Tạm thời return success để client có thể connect
    return NextResponse.json({ message: 'Socket.IO server initialization endpoint' })
  } catch (error) {
    console.error('Socket.IO server error:', error)
    return NextResponse.json({ error: 'Failed to initialize Socket.IO server' }, { status: 500 })
  }
}