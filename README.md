# 🎬 Seat Map Demo - Real-time Booking System

## 📋 Tổng quan

Đây là một demo project được xây dựng để thể hiện năng lực **Senior Frontend ReactJS Developer** với các tính năng real-time, tối ưu hiệu năng và code quality cao.

### 🎯 Mục tiêu
- Thể hiện khả năng xây dựng ứng dụng real-time với WebSocket
- Tối ưu hiệu năng với memoization, virtualization và lazy loading
- Code sạch, có cấu trúc tốt với TypeScript
- Test coverage đầy đủ
- Documentation chi tiết cho phỏng vấn

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - App Router, Server Components
- **TypeScript** - Type safety và better DX
- **React 19** - Latest features và concurrent rendering
- **Redux Toolkit** - State management với RTK Query
- **Socket.IO Client** - Real-time communication
- **TailwindCSS** - Utility-first CSS framework
- **Jest + Testing Library** - Unit testing và integration testing

### Backend
- **Next.js API Routes** - Server-side logic
- **Socket.IO Server** - WebSocket server
- **Node.js** - Runtime environment

## 🏗 Kiến trúc hệ thống

### 1. Client-Server Architecture
```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   React Client  │ ◄─────────────► │  Next.js Server │
│                 │                 │                 │
│ - Redux Store   │                 │ - Socket.IO     │
│ - Components    │                 │ - API Routes    │
│ - Hooks         │                 │ - Business Logic│
└─────────────────┘                 └─────────────────┘
```

### 2. State Management Flow
```
User Action → Component → Redux Action → Socket.IO → Server
     ↓                                                      ↓
UI Update ← Redux State ← Socket Event ← Server Logic ← Database
```

### 3. Component Architecture
```
App
├── Providers (Redux Provider)
├── SeatMap (Main Container)
│   ├── VirtualizedSeatRow (Performance Optimization)
│   └── Seat (Individual Seat Component)
├── UserLogin (Authentication)
├── BookingPanel (Booking Logic)
└── SeatLegend (UI Helper)
```

## 🚀 Tính năng chính

### 1. Real-time Seat Selection
- **Chọn ghế**: Click để chọn ghế, real-time sync với server
- **Giữ ghế**: Tự động timeout sau 5 phút nếu không đặt
- **Đặt ghế**: Confirm booking và chuyển trạng thái thành occupied
- **Sync real-time**: Tất cả clients nhận update ngay lập tức

### 2. Performance Optimizations
- **Memoization**: React.memo cho tất cả components
- **Virtualization**: Intersection Observer cho seat rows
- **Lazy Loading**: Suspense cho non-critical components
- **Custom Hooks**: Tách logic và tái sử dụng

### 3. User Experience
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton loading và spinners
- **Error Handling**: Graceful error handling và retry
- **Accessibility**: ARIA labels và keyboard navigation

## 📁 Cấu trúc Project

```
src/
├── app/                    # Next.js App Router
│   ├── api/ws/route.ts     # WebSocket server
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React Components
│   ├── Seat.tsx           # Individual seat component
│   ├── SeatMap.tsx        # Main seat map container
│   ├── SeatLegend.tsx     # Legend component
│   ├── UserLogin.tsx      # Login component
│   ├── BookingPanel.tsx   # Booking panel
│   ├── Providers.tsx      # Redux provider
│   └── __tests__/        # Component tests
├── hooks/                 # Custom Hooks
│   ├── useSocket.ts       # Socket.IO hook
│   └── useSeatSelection.ts # Seat selection logic
├── store/                 # Redux Store
│   ├── seatMapSlice.ts    # Main slice
│   ├── index.ts           # Store configuration
│   ├── hooks.ts           # Typed hooks
│   └── __tests__/        # Store tests
└── types/                 # TypeScript types
```

## 🔧 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

### 3. Chạy tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

### 4. Build production
```bash
npm run build
npm start
```

## 🧪 Testing Strategy

### 1. Unit Tests
- **Components**: Test rendering, user interactions, props
- **Hooks**: Test custom hooks logic và state changes
- **Redux**: Test actions, reducers, selectors
- **Utilities**: Test helper functions

### 2. Integration Tests
- **Socket.IO**: Test real-time communication
- **User Flows**: Test complete user journeys
- **Error Scenarios**: Test error handling

### 3. Test Coverage
- **Target**: >80% coverage
- **Critical Paths**: 100% coverage
- **Edge Cases**: Comprehensive testing

## 🎯 Điểm nổi bật cho phỏng vấn

### 1. Real-time Architecture
```typescript
// WebSocket hook với error handling và reconnection
export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null)
  
  useEffect(() => {
    const socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/ws',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    socket.on('connect', () => {
      dispatch(setConnectionStatus('connected'))
    })

    socket.on('disconnect', () => {
      dispatch(setConnectionStatus('disconnected'))
    })

    return () => {
      socket.disconnect()
    }
  }, [dispatch])
}
```

### 2. Performance Optimization
```typescript
// Virtualized component với Intersection Observer
const VirtualizedSeatRow = memo(({ rowSeats, rowIndex, ... }) => {
  const [isVisible, setIsVisible] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )

    if (rowRef.current) {
      observer.observe(rowRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={rowRef}>
      {isVisible ? (
        rowSeats.map(seat => <SeatComponent key={seat.id} {...seat} />)
      ) : (
        <div className="animate-pulse">Loading...</div>
      )}
    </div>
  )
})
```

### 3. State Management với RTK
```typescript
// Redux slice với TypeScript và immutability
const seatMapSlice = createSlice({
  name: 'seatMap',
  initialState,
  reducers: {
    updateSeat: (state, action: PayloadAction<Seat>) => {
      if (state.seatMap) {
        const seatIndex = state.seatMap.seats.findIndex(seat => seat.id === action.payload.id)
        if (seatIndex !== -1) {
          state.seatMap.seats[seatIndex] = action.payload
        }
      }
    },
  },
})
```

### 4. Custom Hooks Pattern
```typescript
// Tách logic thành custom hooks
export const useSeatSelection = () => {
  const dispatch = useAppDispatch()
  const { selectedSeats, seatMap } = useAppSelector(state => state.seatMap)

  const selectedSeatsDetails = useMemo(() => {
    return selectedSeats.map(seatId => {
      const seat = seatMap?.seats.find(s => s.id === seatId)
      return seat ? { id: seat.id, row: seat.row, number: seat.number } : null
    }).filter(Boolean)
  }, [seatMap, selectedSeats])

  const handleSelectSeat = useCallback((seatId: string) => {
    dispatch(selectSeat(seatId))
  }, [dispatch])

  return {
    selectedSeats,
    selectedSeatsDetails,
    handleSelectSeat,
  }
}
```

## 🎤 Câu hỏi phỏng vấn thường gặp

### 1. Real-time Communication
**Q: Làm thế nào để handle WebSocket connection drops?**
A: Implement reconnection logic với exponential backoff, connection status tracking, và graceful degradation.

**Q: Làm sao đảm bảo data consistency trong real-time app?**
A: Sử dụng optimistic updates với rollback, conflict resolution, và server-side validation.

### 2. Performance Optimization
**Q: Làm thế nào để optimize rendering performance với large datasets?**
A: Virtualization, memoization, lazy loading, và code splitting.

**Q: Khi nào nên sử dụng useMemo và useCallback?**
A: Khi dependencies thay đổi ít, expensive calculations, hoặc prevent unnecessary re-renders.

### 3. State Management
**Q: Tại sao chọn Redux Toolkit thay vì Context API?**
A: RTK cung cấp better DevTools, middleware support, và performance optimizations.

**Q: Làm thế nào để structure Redux store cho large applications?**
A: Feature-based structure, normalized state, và selectors.

### 4. Testing Strategy
**Q: Làm thế nào để test WebSocket functionality?**
A: Mock Socket.IO, test event handlers, và integration tests.

**Q: Khi nào nên viết unit tests vs integration tests?**
A: Unit tests cho individual functions, integration tests cho user flows.

## 📊 Metrics và Monitoring

### 1. Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

### 2. Real-time Metrics
- **WebSocket Connection Time**: < 500ms
- **Message Latency**: < 100ms
- **Reconnection Time**: < 2s
- **Error Rate**: < 1%

## 🔒 Security Considerations

### 1. Client-side Security
- Input validation và sanitization
- XSS prevention với proper escaping
- CSRF protection với SameSite cookies

### 2. WebSocket Security
- Authentication với JWT tokens
- Rate limiting cho message sending
- Input validation trên server-side

## 🚀 Deployment và Production

### 1. Build Optimization
- Code splitting với dynamic imports
- Tree shaking để remove unused code
- Image optimization với Next.js Image component

### 2. Monitoring
- Error tracking với Sentry
- Performance monitoring với Web Vitals
- Real-time metrics với custom dashboard

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Lưu ý**: Đây là demo project để thể hiện năng lực Senior Frontend ReactJS Developer. Không sử dụng trong production environment mà không có proper security review và testing.