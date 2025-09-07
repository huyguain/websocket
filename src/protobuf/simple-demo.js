// 📝 Simple Protobuf Demo - Fallback to JSON
// File: src/protobuf/simple-demo.js

// Mock protobuf functions để demo
const mockProtobuf = {
  initializeProtobuf: () => {
    console.log('📦 Mock Protobuf initialized (using JSON fallback)')
    return true
  },
  
  encodeSeatMap: (data) => {
    console.log('📦 Mock: Would encode seat map to binary')
    return null // Return null to force JSON fallback
  },
  
  decodeSeatMap: (data) => {
    console.log('📦 Mock: Would decode binary to seat map')
    return null // Return null to force JSON fallback
  },
  
  encodeSelectSeatRequest: (data) => {
    console.log('📦 Mock: Would encode select request to binary')
    return null // Return null to force JSON fallback
  },
  
  decodeSelectSeatRequest: (data) => {
    console.log('📦 Mock: Would decode binary to select request')
    return null // Return null to force JSON fallback
  },
  
  statusToString: (status) => {
    const statusMap = { 0: 'available', 1: 'selected', 2: 'occupied' }
    return statusMap[status] || 'available'
  },
  
  stringToStatus: (status) => {
    const statusMap = { 'available': 0, 'selected': 1, 'occupied': 2 }
    return statusMap[status] || 0
  }
}

module.exports = mockProtobuf
