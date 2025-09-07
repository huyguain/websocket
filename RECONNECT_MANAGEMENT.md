# WebSocket Reconnect Management

## Tổng quan

Hệ thống quản lý reconnect cho WebSocket được thiết kế để đảm bảo kết nối ổn định và tự động phục hồi khi có sự cố mạng hoặc server.

## Tính năng chính

### 1. Exponential Backoff Reconnect
- **Cơ chế**: Tăng dần thời gian chờ giữa các lần thử kết nối lại
- **Cấu hình**:
  - `baseDelay`: 1000ms (thời gian chờ cơ bản)
  - `maxDelay`: 30000ms (thời gian chờ tối đa)
  - `backoffMultiplier`: 1.5 (hệ số tăng)
  - `maxAttempts`: 10 (số lần thử tối đa)

### 2. Heartbeat/Ping-Pong Mechanism
- **Tần suất**: Ping server mỗi 30 giây
- **Mục đích**: Phát hiện sớm kết nối bị mất
- **Xử lý**: Tự động reconnect khi không nhận được pong

### 3. Connection Status Management
- **Các trạng thái**:
  - `connecting`: Đang kết nối lần đầu
  - `connected`: Đã kết nối thành công
  - `reconnecting`: Đang thử kết nối lại
  - `disconnected`: Mất kết nối
  - `error`: Lỗi kết nối

### 4. Manual Controls
- **Reconnect**: Kết nối lại thủ công
- **Disconnect**: Ngắt kết nối thủ công
- **Test Tools**: Simulate các tình huống lỗi

## Cách sử dụng

### Hook useSocket

```typescript
const {
  socket,
  isConnected,
  connectionStatus,
  reconnectAttempts,
  selectSeat,
  deselectSeat,
  bookSelectedSeats,
  manualReconnect,
  disconnect
} = useSocket()
```

### Components

#### ConnectionStatus
Hiển thị trạng thái kết nối hiện tại với các nút điều khiển.

#### ReconnectInfo
Hiển thị thông tin chi tiết về quá trình reconnect (chỉ hiện khi đang reconnect hoặc có lỗi).

#### ReconnectTest
Cung cấp các nút để test các tình huống lỗi khác nhau.

## Cấu hình Server

Server cần hỗ trợ ping/pong mechanism:

```javascript
socket.on('ping', () => {
  socket.emit('pong')
})
```

## Xử lý Edge Cases

### 1. Manual Disconnect
- Khi user disconnect thủ công, hệ thống sẽ không tự động reconnect
- Cần gọi `manualReconnect()` để kết nối lại

### 2. Max Attempts Reached
- Sau 10 lần thử, hệ thống sẽ dừng và hiển thị lỗi
- User có thể thử reconnect thủ công

### 3. Network Recovery
- Khi mạng phục hồi, hệ thống sẽ tự động detect và reconnect
- Heartbeat mechanism giúp phát hiện sớm

## Best Practices

1. **Luôn kiểm tra connection status** trước khi thực hiện operations
2. **Sử dụng manual reconnect** khi cần thiết
3. **Monitor reconnect attempts** để tránh spam server
4. **Implement proper error handling** cho các operations quan trọng

## Testing

Sử dụng ReconnectTest component để test:
- Network error simulation
- Server restart simulation
- Manual reconnect/disconnect

## Monitoring

Theo dõi các metrics:
- Connection success rate
- Reconnect attempts count
- Average reconnect time
- Error frequency
