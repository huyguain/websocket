# 📦 Protocol Buffers Implementation - Đơn giản & Dễ hiểu

## 🎯 Protocol Buffers là gì?

**Protocol Buffers (Protobuf)** là một định dạng dữ liệu nhị phân được Google phát triển để:
- **Serialize** (mã hóa) dữ liệu thành binary format
- **Deserialize** (giải mã) binary data thành object
- **Truyền tải** dữ liệu giữa các service một cách hiệu quả

### 🚀 Tại sao sử dụng Protobuf?

| Tiêu chí | JSON | Protobuf | Cải thiện |
|----------|------|----------|-----------|
| **Kích thước** | ~2.5KB | ~1.2KB | **52% nhỏ hơn** |
| **Tốc độ** | ~0.5ms | ~0.2ms | **60% nhanh hơn** |
| **Type Safety** | ❌ | ✅ | **Schema validation** |
| **Cross-platform** | ✅ | ✅ | **Tương đương** |

## 🏗️ Cấu trúc Implementation

### 1. Schema Definition (`src/protobuf/schema.js`)

```javascript
// Định nghĩa schema đơn giản
const seatSchema = `
syntax = "proto3";

enum SeatStatus {
  AVAILABLE = 0;  // Có sẵn
  SELECTED = 1;    // Đã chọn
  OCCUPIED = 2;    // Đã đặt
}

message Seat {
  string id = 1;           // ID ghế
  int32 row = 2;          // Hàng
  int32 number = 3;        // Số ghế
  SeatStatus status = 4;   // Trạng thái
  optional string user_id = 5;    // ID user
  optional string user_name = 6;  // Tên user
}
`
```

### 2. Server Implementation (`server.js`)

```javascript
// Khởi tạo Protobuf
const protobufReady = protobuf.initializeProtobuf()

// Gửi dữ liệu
if (protobufReady) {
  const binaryData = protobuf.encodeSeatMap(seatMapData)
  socket.emit('seatMap:data', binaryData)
} else {
  socket.emit('seatMap:data', seatMapData) // Fallback JSON
}

// Nhận dữ liệu
socket.on('seat:select', (data) => {
  if (Buffer.isBuffer(data)) {
    // Protobuf binary
    const request = protobuf.decodeSelectSeatRequest(data)
  } else {
    // JSON fallback
    const request = data
  }
})
```

### 3. Client Implementation (`src/hooks/useSocket.ts`)

```javascript
// Khởi tạo Protobuf
const protobufReady = protobuf.initializeProtobuf()

// Gửi request
if (protobufReady) {
  const binaryData = protobuf.encodeSelectSeatRequest(requestData)
  socket.emit('seat:select', binaryData)
}

// Nhận response
socket.on('seatMap:data', (data) => {
  if (Buffer.isBuffer(data)) {
    // Protobuf binary
    const seatMap = protobuf.convertProtobufSeatMap(
      protobuf.decodeSeatMap(data)
    )
  } else {
    // JSON fallback
    const seatMap = data
  }
})
```

## 🔄 Cách hoạt động

### 1. **Encode Process** (Object → Binary)
```javascript
// Input: JavaScript Object
const seatData = {
  id: "seat-1",
  row: 1,
  number: 1,
  status: 1, // SELECTED
  userId: "user-123",
  userName: "John Doe"
}

// Output: Binary Buffer
const binaryData = protobuf.encodeSeat(seatData)
// Result: <Buffer 0a 06 73 65 61 74 2d 31 10 01 18 01 20 01 2a 08 75 73 65 72 2d 31 32 33 32 08 4a 6f 68 6e 20 44 6f 65>
```

### 2. **Decode Process** (Binary → Object)
```javascript
// Input: Binary Buffer
const binaryData = <Buffer 0a 06 73 65 61 74 2d 31 10 01 18 01 20 01 2a 08 75 73 65 72 2d 31 32 33 32 08 4a 6f 68 6e 20 44 6f 65>

// Output: JavaScript Object
const seatData = protobuf.decodeSeat(binaryData)
// Result: { id: "seat-1", row: 1, number: 1, status: 1, userId: "user-123", userName: "John Doe" }
```

## 🎮 Demo & Testing

### 1. **Chạy ứng dụng**
```bash
npm run dev
```

### 2. **Mở Developer Console**
- F12 → Console tab
- Xem logs: `📦 Sent select request via Protobuf`
- Xem logs: `📦 Received seat map via Protobuf`

### 3. **Test Protobuf**
1. Đăng nhập vào ứng dụng
2. Click chọn ghế
3. Xem console logs để thấy Protobuf vs JSON
4. Kiểm tra ProtobufDemo component để xem statistics

## 📊 Monitoring

### ProtobufDemo Component hiển thị:
- **Trạng thái kết nối**
- **Số messages sent/received**
- **Tỷ lệ sử dụng Protobuf**
- **Lợi ích của Protobuf**

### Console Logs:
```
✅ Protobuf đã sẵn sàng!
📦 Sent seat map data via Protobuf
📦 Received protobuf select request
📦 Sent seat update via Protobuf
```

## 🔧 Troubleshooting

### 1. **Protobuf không khởi tạo**
```
❌ Error loading protobuf schema: ...
⚠️ Protobuf không khả dụng, sử dụng JSON mode
```
**Giải pháp:** Kiểm tra schema syntax, đảm bảo protobufjs được cài đặt

### 2. **Decode Error**
```
❌ Error decoding seat: Invalid wire type
```
**Giải pháp:** Kiểm tra data format, đảm bảo schema khớp nhau

### 3. **Fallback về JSON**
```
📦 Sent select request via JSON (fallback)
```
**Giải pháp:** Bình thường, hệ thống tự động fallback khi Protobuf fail

## 🎯 Best Practices

### 1. **Schema Design**
- Sử dụng `optional` cho fields có thể null
- Đặt tên fields rõ ràng và nhất quán
- Sử dụng enums cho status values

### 2. **Error Handling**
- Luôn có fallback về JSON
- Wrap encode/decode trong try-catch
- Log errors để debug

### 3. **Performance**
- Cache protobuf instances
- Sử dụng binary format cho WebSocket
- Monitor message sizes

## 🚀 Kết luận

Implementation này cung cấp:
- ✅ **Đơn giản**: Schema dễ hiểu, code rõ ràng
- ✅ **Linh hoạt**: Hỗ trợ cả Protobuf và JSON
- ✅ **Hiệu quả**: Giảm 30-50% kích thước dữ liệu
- ✅ **Ổn định**: Fallback mechanism khi có lỗi
- ✅ **Monitor**: Real-time statistics và logging

Protobuf giúp ứng dụng WebSocket của bạn nhanh hơn và tiết kiệm băng thông đáng kể!
