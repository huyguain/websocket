// 📝 Client-side Protobuf utilities
// File: src/protobuf/client-schema.js

const protobuf = require('protobufjs')

// Định nghĩa schema giống như server
const seatSchema = `
syntax = "proto3";

enum SeatStatus {
  AVAILABLE = 0;
  SELECTED = 1;
  OCCUPIED = 2;
}

message Seat {
  string id = 1;
  int32 row = 2;
  int32 number = 3;
  SeatStatus status = 4;
  optional string user_id = 5;
  optional string user_name = 6;
}

message SeatMap {
  string id = 1;
  string name = 2;
  int32 rows = 3;
  int32 seats_per_row = 4;
  repeated Seat seats = 5;
}

message SelectSeatRequest {
  string seat_id = 1;
  string user_id = 2;
  string user_name = 3;
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
    
    console.log('✅ Client Protobuf schema loaded')
    return true
  } catch (error) {
    console.error('❌ Error loading client protobuf schema:', error)
    return false
  }
}

// 🔄 ENCODE FUNCTIONS
const encodeSelectSeatRequest = (requestData) => {
  try {
    const message = SelectSeatRequestMessage.create(requestData)
    return SelectSeatRequestMessage.encode(message).finish()
  } catch (error) {
    console.error('Error encoding select seat request:', error)
    return null
  }
}

// 🔄 DECODE FUNCTIONS
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

// 🔄 UTILITY FUNCTIONS
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

// Convert protobuf seat to our format
const convertProtobufSeat = (protobufSeat) => {
  return {
    id: protobufSeat.id,
    row: protobufSeat.row,
    number: protobufSeat.number,
    status: statusToString(protobufSeat.status),
    userId: protobufSeat.userId || undefined,
    userName: protobufSeat.userName || undefined
  }
}

// Convert protobuf seat map to our format
const convertProtobufSeatMap = (protobufSeatMap) => {
  return {
    id: protobufSeatMap.id,
    name: protobufSeatMap.name,
    rows: protobufSeatMap.rows,
    seatsPerRow: protobufSeatMap.seatsPerRow,
    seats: protobufSeatMap.seats.map(convertProtobufSeat)
  }
}

export {
  initializeProtobuf,
  encodeSelectSeatRequest,
  decodeSeat,
  decodeSeatMap,
  convertProtobufSeat,
  convertProtobufSeatMap,
  statusToString,
  stringToStatus
}
