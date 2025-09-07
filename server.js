const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const protobuf = require('./src/protobuf/simple-demo')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Mock data cho seat map
const mockSeatMap = {
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

// Store để quản lý seat reservations
const seatReservations = new Map()

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // 🚀 Khởi tạo Mock Protobuf (JSON fallback mode)
  const protobufReady = protobuf.initializeProtobuf()
  console.log('✅ Server ready with JSON fallback mode!')
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Khởi tạo Socket.IO server
  const io = new Server(httpServer, {
    path: '/api/ws/socket.io',
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id)

    // Ping/Pong mechanism để kiểm tra kết nối
    socket.on('ping', () => {
      socket.emit('pong')
    })

    // 📦 Gửi seat map data cho client mới (tạm thời dùng JSON)
    socket.emit('seatMap:data', mockSeatMap)
    console.log('📦 Sent seat map data via JSON (fallback mode)')
    
    // Xử lý request JSON data từ client
    socket.on('request-json-data', () => {
      socket.emit('seatMap:data', mockSeatMap)
      console.log('📦 Sent seat map data via JSON (client requested)')
    })

    // 📦 Xử lý seat selection (tạm thời chỉ hỗ trợ JSON)
    socket.on('seat:select', (data) => {
      const { seatId, userId, userName } = data
      console.log('📦 Received JSON select request')
      
      const seat = mockSeatMap.seats.find(s => s.id === seatId)
      
      if (seat && seat.status === 'available') {
        seat.status = 'selected'
        seat.userId = userId
        seat.userName = userName
        seat.selectedAt = Date.now()
        
        seatReservations.set(seatId, { userId, userName, timestamp: Date.now() })
        
        // 📦 Broadcast seat update (JSON mode)
        io.emit('seat:updated', seat)
        console.log(`📦 Sent seat update via JSON`)
        
        console.log(`🎫 Seat ${seatId} selected by ${userName}`)
      } else {
        socket.emit('seat:error', { message: 'Seat not available' })
      }
    })

    // Xử lý seat deselection
    socket.on('seat:deselect', (data) => {
      const { seatId, userId } = data
      const seat = mockSeatMap.seats.find(s => s.id === seatId)
      
      if (seat && seat.userId === userId && seat.status === 'selected') {
        seat.status = 'available'
        seat.userId = undefined
        seat.userName = undefined
        seat.selectedAt = undefined
        
        seatReservations.delete(seatId)
        
        // Broadcast đến tất cả clients
        io.emit('seat:updated', seat)
        console.log(`🎫 Seat ${seatId} deselected by ${userId}`)
      } else {
        socket.emit('seat:error', { message: 'Cannot deselect seat' })
      }
    })

    // Xử lý booking seats
    socket.on('seats:book', (data) => {
      const { seatIds, userId, userName } = data
      const updatedSeats = []
      
      seatIds.forEach((seatId) => {
        const seat = mockSeatMap.seats.find(s => s.id === seatId)
        if (seat && seat.userId === userId && seat.status === 'selected') {
          seat.status = 'occupied'
          updatedSeats.push(seat)
        }
      })
      
      if (updatedSeats.length > 0) {
        // Broadcast đến tất cả clients
        io.emit('seats:booked', { seats: updatedSeats, userId, userName })
        console.log(`🎫 ${updatedSeats.length} seats booked by ${userName}`)
      }
    })

    // Xử lý disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log('> Socket.IO server running on /api/ws/socket.io')
    })
})
