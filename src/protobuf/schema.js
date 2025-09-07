// 📝 Schema đơn giản cho Seat data
// File: src/protobuf/schema.js

const protobuf = require('protobufjs')

// Định nghĩa schema bằng cách đơn giản nhất
const seatSchema = `
syntax = "proto3";

// Enum cho trạng thái ghế
enum SeatStatus {
  AVAILABLE = 0;  // Có sẵn
  SELECTED = 1;    // Đã chọn
  OCCUPIED = 2;    // Đã đặt
}

// Message cho một ghế
message Seat {
  string id = 1;           // ID ghế
  int32 row = 2;          // Hàng
  int32 number = 3;        // Số ghế
  SeatStatus status = 4;   // Trạng thái
  optional string user_id = 5;    // ID user (optional)
  optional string user_name = 6;  // Tên user (optional)
}

// Message cho toàn bộ seat map
message SeatMap {
  string id = 1;           // ID rạp
  string name = 2;         // Tên rạp
  int32 rows = 3;          // Số hàng
  int32 seats_per_row = 4; // Số ghế mỗi hàng
  repeated Seat seats = 5; // Danh sách ghế
}

// Message cho request chọn ghế
message SelectSeatRequest {
  string seat_id = 1;      // ID ghế muốn chọn
  string user_id = 2;      // ID user
  string user_name = 3;    // Tên user
}
`

// Khởi tạo protobuf
let root = null
let SeatMessage = null
let SeatMapMessage = null
let SelectSeatRequestMessage = null

// Hàm khởi tạo
const initializeProtobuf = () => {
  try {
    // Parse schema
    root = protobuf.parse(seatSchema).root
    
    // Lấy các message types
    SeatMessage = root.lookupType('Seat')
    SeatMapMessage = root.lookupType('SeatMap')
    SelectSeatRequestMessage = root.lookupType('SelectSeatRequest')
    
    console.log('✅ Protobuf schema loaded successfully')
    return true
  } catch (error) {
    console.error('❌ Error loading protobuf schema:', error)
    return false
  }
}

// 🔄 ENCODE FUNCTIONS (Chuyển object thành binary)
const encodeSeat = (seatData) => {
  try {
    const message = SeatMessage.create(seatData)
    return SeatMessage.encode(message).finish()
  } catch (error) {
    console.error('Error encoding seat:', error)
    return null
  }
}

const encodeSeatMap = (seatMapData) => {
  try {
    const message = SeatMapMessage.create(seatMapData)
    return SeatMapMessage.encode(message).finish()
  } catch (error) {
    console.error('Error encoding seat map:', error)
    return null
  }
}

const encodeSelectSeatRequest = (requestData) => {
  try {
    const message = SelectSeatRequestMessage.create(requestData)
    return SelectSeatRequestMessage.encode(message).finish()
  } catch (error) {
    console.error('Error encoding select seat request:', error)
    return null
  }
}

// 🔄 DECODE FUNCTIONS (Chuyển binary thành object)
const decodeSeat = (binaryData) => {
  try {
    return SeatMessage.decode(binaryData)
  } catch (error) {
    console.error('Error decoding seat:', error)
    return null
  }
}

const decodeSeatMap = (binaryData) => {
  try {
    return SeatMapMessage.decode(binaryData)
  } catch (error) {
    console.error('Error decoding seat map:', error)
    return null
  }
}

const decodeSelectSeatRequest = (binaryData) => {
  try {
    return SelectSeatRequestMessage.decode(binaryData)
  } catch (error) {
    console.error('Error decoding select seat request:', error)
    return null
  }
}

// 🔄 UTILITY FUNCTIONS (Chuyển đổi giữa enum và string)
const statusToString = (status) => {
  switch (status) {
    case 0: return 'available'
    case 1: return 'selected'
    case 2: return 'occupied'
    default: return 'available'
  }
}

const stringToStatus = (status) => {
  switch (status) {
    case 'available': return 0
    case 'selected': return 1
    case 'occupied': return 2
    default: return 0
  }
}

module.exports = {
  initializeProtobuf,
  encodeSeat,
  encodeSeatMap,
  encodeSelectSeatRequest,
  decodeSeat,
  decodeSeatMap,
  decodeSelectSeatRequest,
  statusToString,
  stringToStatus
}
