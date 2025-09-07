# 🎫 WebSocket Seat Booking System

Dự án này đã được cập nhật để sử dụng **WebSocket thực sự** với Socket.IO thay vì HTTP polling.

## 🚀 Cách chạy ứng dụng

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## 🔧 Thay đổi chính

### 1. **Custom Server** (`server.js`)
- Sử dụng custom server thay vì Next.js default server
- Tích hợp Socket.IO server trực tiếp với HTTP server
- Xử lý tất cả WebSocket events

### 2. **Socket.IO Client** (`src/hooks/useSocket.ts`)
- Thay thế HTTP polling bằng Socket.IO client
- Real-time bidirectional communication
- Auto-reconnection với exponential backoff
- Event-driven architecture

### 3. **WebSocket Events**
- `seatMap:data` - Gửi dữ liệu seat map khi client connect
- `seat:select` - Chọn ghế
- `seat:deselect` - Bỏ chọn ghế  
- `seats:book` - Đặt ghế
- `seat:updated` - Broadcast cập nhật ghế đến tất cả clients
- `seats:booked` - Xác nhận đặt ghế thành công
- `seat:error` - Xử lý lỗi

## 🎯 Tính năng WebSocket

### ✅ Real-time Communication
- **Bidirectional**: Client ↔ Server communication
- **Instant updates**: Thay đổi ghế được broadcast ngay lập tức
- **No polling**: Không cần fetch data định kỳ

### ✅ Connection Management
- **Auto-reconnection**: Tự động kết nối lại khi mất kết nối
- **Connection status**: Hiển thị trạng thái kết nối real-time
- **Error handling**: Xử lý lỗi kết nối gracefully

### ✅ Event-driven Architecture
- **Emit events**: Gửi actions từ client
- **Listen events**: Nhận updates từ server
- **Type-safe**: TypeScript interfaces cho tất cả events

## 🔍 So sánh: Polling vs WebSocket

### ❌ HTTP Polling (Trước đây)
```typescript
// Polling mỗi 2 giây
setInterval(async () => {
  const response = await fetch('/api/ws')
  const data = await response.json()
  // Update UI
}, 2000)
```

### ✅ WebSocket (Hiện tại)
```typescript
// Real-time events
socket.emit('seat:select', { seatId, userId, userName })
socket.on('seat:updated', (seat) => {
  // Update UI ngay lập tức
})
```

## 🧪 Test WebSocket

### 1. Mở 2 browser tabs
- Tab 1: `http://localhost:3000`
- Tab 2: `http://localhost:3000`

### 2. Test real-time sync
- Chọn ghế ở tab 1
- Ghế sẽ được highlight ngay lập tức ở tab 2
- Không cần refresh page

### 3. Test connection status
- Disconnect internet
- UI sẽ hiển thị "Mất kết nối"
- Reconnect internet
- UI sẽ tự động kết nối lại

## 📊 Performance Benefits

- **Reduced server load**: Không cần polling requests
- **Lower latency**: Updates ngay lập tức
- **Better UX**: Real-time feedback
- **Scalable**: Socket.IO hỗ trợ clustering

## 🛠️ Technical Stack

- **Frontend**: React 19, TypeScript, Redux Toolkit
- **Backend**: Next.js 15, Socket.IO 4.7.5
- **Real-time**: WebSocket với fallback polling
- **Styling**: Tailwind CSS 4

## 🎉 Kết luận

Dự án đã được nâng cấp thành công từ HTTP polling sang WebSocket thực sự, mang lại trải nghiệm real-time tốt hơn cho người dùng!
