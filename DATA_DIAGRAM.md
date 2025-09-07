# 📊 Data Diagram - Seat Map Demo Real-time Booking System

## 🗄️ Database Schema & Data Structure

```mermaid
erDiagram
    SEAT_MAP {
        string id PK "Unique theater identifier"
        string name "Theater name"
        int rows "Number of rows"
        int seats_per_row "Seats per row"
        datetime created_at "Creation timestamp"
        datetime updated_at "Last update timestamp"
    }
    
    SEAT {
        string id PK "Unique seat identifier (seat-{row}-{number})"
        string seat_map_id FK "Reference to seat map"
        int row "Row number (1-based)"
        int number "Seat number in row (1-based)"
        string status "available|selected|occupied|reserved"
        string user_id FK "Current user (if selected)"
        string user_name "User display name"
        datetime selected_at "Selection timestamp"
        datetime expires_at "Reservation expiry"
        datetime created_at "Creation timestamp"
        datetime updated_at "Last update timestamp"
    }
    
    USER {
        string id PK "Unique user identifier"
        string name "User display name"
        string email "User email (optional)"
        datetime created_at "Registration timestamp"
        datetime last_active "Last activity timestamp"
    }
    
    RESERVATION {
        string id PK "Unique reservation identifier"
        string user_id FK "User who made reservation"
        string seat_id FK "Reserved seat"
        string status "pending|confirmed|cancelled|expired"
        datetime reserved_at "Reservation timestamp"
        datetime expires_at "Reservation expiry"
        datetime confirmed_at "Confirmation timestamp"
        datetime cancelled_at "Cancellation timestamp"
    }
    
    BOOKING {
        string id PK "Unique booking identifier"
        string user_id FK "User who made booking"
        json seat_ids "Array of booked seat IDs"
        decimal total_amount "Total booking amount"
        string status "pending|paid|cancelled|refunded"
        datetime booked_at "Booking timestamp"
        datetime paid_at "Payment timestamp"
        datetime expires_at "Booking expiry"
    }
    
    CONNECTION_LOG {
        string id PK "Unique log identifier"
        string user_id FK "User identifier"
        string socket_id "Socket.IO connection ID"
        string status "connecting|connected|disconnected|error"
        datetime connected_at "Connection timestamp"
        datetime disconnected_at "Disconnection timestamp"
        string disconnect_reason "Reason for disconnection"
        int reconnect_attempts "Number of reconnect attempts"
    }
    
    SEAT_MAP ||--o{ SEAT : "contains"
    USER ||--o{ SEAT : "selects"
    USER ||--o{ RESERVATION : "makes"
    USER ||--o{ BOOKING : "creates"
    USER ||--o{ CONNECTION_LOG : "has"
    SEAT ||--o{ RESERVATION : "reserved_in"
```

## 🔄 Data Flow Diagram

```mermaid
flowchart TD
    subgraph "📱 Client Data Flow"
        A[User Action] --> B[React Component]
        B --> C[Redux Action]
        C --> D[Redux Store]
        D --> E[useSocket Hook]
        E --> F[Socket.IO Client]
    end
    
    subgraph "🌐 Network Layer"
        F --> G[WebSocket Message]
        G --> H[Socket.IO Server]
    end
    
    subgraph "🖥️ Server Data Processing"
        H --> I[Event Handler]
        I --> J[Data Validation]
        J --> K[Business Logic]
        K --> L[Mock Database]
        L --> M[Data Update]
        M --> N[Broadcast Event]
    end
    
    subgraph "📊 Data Storage"
        L --> O[Seat Map Data]
        L --> P[User Reservations]
        L --> Q[Connection State]
        L --> R[Error Logs]
    end
    
    subgraph "🔄 Real-time Sync"
        N --> S[Broadcast to All Clients]
        S --> T[Client State Update]
        T --> U[UI Re-render]
    end
    
    style A fill:#87CEEB,stroke:#4682B4,stroke-width:2px
    style D fill:#98FB98,stroke:#32CD32,stroke-width:2px
    style H fill:#FFB6C1,stroke:#FF69B4,stroke-width:2px
    style L fill:#F0E68C,stroke:#DAA520,stroke-width:2px
    style S fill:#DDA0DD,stroke:#9370DB,stroke-width:2px
```

## 📋 Data Models & Interfaces

```mermaid
classDiagram
    class SeatMap {
        +string id
        +string name
        +number rows
        +number seatsPerRow
        +Seat[] seats
        +getSeatById(id: string) Seat
        +getAvailableSeats() Seat[]
        +getSelectedSeats() Seat[]
    }
    
    class Seat {
        +string id
        +number row
        +number number
        +string status
        +string userId?
        +string userName?
        +number selectedAt?
        +isAvailable() boolean
        +isSelected() boolean
        +isOccupied() boolean
        +select(userId: string, userName: string) void
        +deselect() void
    }
    
    class User {
        +string id
        +string name
        +string email?
        +number createdAt
        +number lastActive
        +isActive() boolean
        +updateLastActive() void
    }
    
    class Reservation {
        +string id
        +string userId
        +string seatId
        +string status
        +number reservedAt
        +number expiresAt
        +isExpired() boolean
        +extend(duration: number) void
        +cancel() void
    }
    
    class ConnectionState {
        +string status
        +string socketId?
        +number connectedAt?
        +number reconnectAttempts
        +boolean isConnected
        +boolean isReconnecting
        +updateStatus(status: string) void
        +incrementReconnectAttempts() void
        +resetReconnectAttempts() void
    }
    
    class ErrorState {
        +string message
        +string type?
        +number timestamp
        +string requestId?
        +clear() void
        +setError(message: string, type?: string) void
    }
    
    SeatMap ||--o{ Seat : contains
    User ||--o{ Seat : selects
    User ||--o{ Reservation : makes
    Seat ||--o{ Reservation : reserved_in
```

## 🔄 Message Protocol Data Structure

```mermaid
graph TB
    subgraph "📤 Outgoing Messages (Client → Server)"
        A[seat:select] --> A1[SeatSelectRequest]
        B[seat:deselect] --> B1[SeatDeselectRequest]
        C[seats:book] --> C1[SeatBookRequest]
        D[ping] --> D1[PingMessage]
    end
    
    subgraph "📥 Incoming Messages (Server → Client)"
        E[seatMap:data] --> E1[SeatMapData]
        F[seat:updated] --> F1[SeatUpdateNotification]
        G[seats:booked] --> G1[SeatBookConfirmation]
        H[pong] --> H1[PongMessage]
        I[seat:error] --> I1[ErrorResponse]
    end
    
    subgraph "📊 Message Data Structures"
        A1 --> J[SeatSelectRequest]
        B1 --> K[SeatDeselectRequest]
        C1 --> L[SeatBookRequest]
        E1 --> M[SeatMapData]
        F1 --> N[SeatUpdateNotification]
        G1 --> O[SeatBookConfirmation]
        I1 --> P[ErrorResponse]
    end
    
    subgraph "🔧 Data Fields"
        J --> J1[seatId: string<br/>userId: string<br/>userName: string<br/>timestamp: number<br/>requestId: string]
        K --> K1[seatId: string<br/>userId: string<br/>timestamp: number]
        L --> L1[seatIds: string[]<br/>userId: string<br/>userName: string<br/>timestamp: number]
        M --> M1[id: string<br/>name: string<br/>rows: number<br/>seatsPerRow: number<br/>seats: Seat[]]
        N --> N1[seat: Seat<br/>timestamp: number<br/>action: string]
        O --> O1[seats: Seat[]<br/>userId: string<br/>userName: string<br/>bookingId: string]
        P --> P1[message: string<br/>type: string<br/>requestId?: string<br/>alternatives?: Seat[]]
    end
    
    style A fill:#87CEEB,stroke:#4682B4,stroke-width:2px
    style E fill:#98FB98,stroke:#32CD32,stroke-width:2px
    style J fill:#FFB6C1,stroke:#FF69B4,stroke-width:2px
    style M fill:#F0E68C,stroke:#DAA520,stroke-width:2px
```

## 🗂️ State Management Data Flow

```mermaid
stateDiagram-v2
    [*] --> Initializing : App Start
    
    Initializing --> Connecting : Socket Connect
    Connecting --> Connected : Connection Success
    Connecting --> Disconnected : Connection Failed
    
    Connected --> Selecting : User Selects Seat
    Selecting --> Selected : Selection Success
    Selecting --> Conflict : Selection Conflict
    Selecting --> Error : Selection Error
    
    Selected --> Booking : User Books Seats
    Booking --> Booked : Booking Success
    Booking --> Error : Booking Failed
    
    Connected --> Disconnected : Network Issue
    Disconnected --> Reconnecting : Auto Reconnect
    Reconnecting --> Connected : Reconnect Success
    Reconnecting --> Disconnected : Reconnect Failed
    
    Conflict --> Selecting : Retry Selection
    Error --> Connected : Error Resolved
    
    Booked --> [*] : Booking Complete
    Disconnected --> [*] : App Close
    
    note right of Selecting
        Data: seatId, userId, userName
        Validation: seat availability
        Conflict: multiple users
    end note
    
    note right of Selected
        Data: seat status updated
        Broadcast: to all clients
        Reservation: timeout set
    end note
    
    note right of Conflict
        Data: conflict reason
        Alternatives: suggested seats
        Retry: with new seat
    end note
```

## 📈 Performance Data Metrics

```mermaid
graph LR
    subgraph "📊 Performance Metrics"
        A[Message Latency] --> A1["< 100ms"]
        B[State Update Time] --> B1["< 50ms"]
        C[UI Render Time] --> C1["< 16ms (60fps)"]
        D[Memory Usage] --> D1["< 50MB"]
        E[Bundle Size] --> E1["< 500KB"]
    end
    
    subgraph "🔍 Data Optimization"
        F[Virtualization] --> F1["60% render reduction"]
        G[Memoization] --> G1["40% CPU reduction"]
        H[Lazy Loading] --> H1["30% initial load"]
        I[Code Splitting] --> I1["50% bundle reduction"]
    end
    
    subgraph "📋 Data Validation"
        J[Type Safety] --> J1["TypeScript interfaces"]
        K[Runtime Validation] --> K1["Zod schemas"]
        L[Error Handling] --> L1["Graceful degradation"]
    end
    
    style A fill:#87CEEB,stroke:#4682B4,stroke-width:2px
    style F fill:#98FB98,stroke:#32CD32,stroke-width:2px
    style J fill:#FFB6C1,stroke:#FF69B4,stroke-width:2px
```

## 🔄 Real-time Data Synchronization

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant C1 as Client 1
    participant S as Server
    participant C2 as Client 2
    participant U2 as User 2
    
    Note over U1,U2: 🎬 Real-time Seat Selection Data Flow
    
    U1->>C1: Click seat-17
    C1->>C1: Update local state (optimistic)
    C1->>S: emit('seat:select', {seatId: 'seat-17', userId: 'user-1', userName: 'John'})
    
    S->>S: Validate seat availability
    S->>S: Update seat status to 'selected'
    S->>S: Store reservation data
    
    S->>C1: emit('seat:updated', updatedSeat)
    S->>C2: emit('seat:updated', updatedSeat)
    
    C1->>C1: Confirm local state update
    C2->>C2: Update seat-17 to 'selected'
    
    C1->>U1: Show seat as selected
    C2->>U2: Show seat-17 as unavailable
    
    Note over U1,U2: 🔄 Data Consistency Maintained
    
    U2->>C2: Try to select seat-17
    C2->>S: emit('seat:select', {seatId: 'seat-17', userId: 'user-2', userName: 'Jane'})
    
    S->>S: Check seat status (already selected)
    S->>C2: emit('seat:error', {message: 'Seat not available'})
    
    C2->>U2: Show error message
```

## 🗃️ Data Persistence Strategy

```mermaid
graph TB
    subgraph "💾 Data Storage Layers"
        A[Client State] --> B[Redux Store]
        B --> C[Local Storage]
        C --> D[Session Storage]
        
        E[Server State] --> F[Mock Database]
        F --> G[In-Memory Maps]
        G --> H[File System]
        
        I[Real-time State] --> J[Socket.IO Rooms]
        J --> K[Connection Pool]
        K --> L[Event Queue]
    end
    
    subgraph "🔄 Data Sync Mechanisms"
        M[Optimistic Updates] --> N[Client First]
        O[Server Validation] --> P[Authoritative State]
        Q[Conflict Resolution] --> R[Last Write Wins]
        S[Event Sourcing] --> T[State Replay]
    end
    
    subgraph "📊 Data Backup & Recovery"
        U[State Snapshots] --> V[Periodic Saves]
        W[Transaction Logs] --> X[Audit Trail]
        Y[Error Recovery] --> Z[State Restoration]
    end
    
    style A fill:#87CEEB,stroke:#4682B4,stroke-width:2px
    style E fill:#98FB98,stroke:#32CD32,stroke-width:2px
    style I fill:#FFB6C1,stroke:#FF69B4,stroke-width:2px
    style M fill:#F0E68C,stroke:#DAA520,stroke-width:2px
```

## 🎯 Data Quality & Validation

```mermaid
graph LR
    subgraph "✅ Data Validation Rules"
        A[Seat ID Format] --> A1["seat-{row}-{number}"]
        B[User ID Format] --> B1["user-{uuid}"]
        C[Status Values] --> C1["available|selected|occupied"]
        D[Timestamp Range] --> D1["Valid date range"]
        E[Request ID] --> E1["Unique identifier"]
    end
    
    subgraph "🔍 Data Integrity Checks"
        F[Seat Availability] --> F1["Check before selection"]
        G[User Authorization] --> G1["Verify user permissions"]
        H[Reservation Timeout] --> H1["Auto-expire reservations"]
        I[State Consistency] --> I1["Validate state transitions"]
    end
    
    subgraph "📊 Data Monitoring"
        J[Error Tracking] --> J1["Log all errors"]
        K[Performance Metrics] --> K1["Track response times"]
        L[Usage Analytics] --> L1["Monitor user behavior"]
        M[Health Checks] --> M1["System status monitoring"]
    end
    
    style A fill:#87CEEB,stroke:#4682B4,stroke-width:2px
    style F fill:#98FB98,stroke:#32CD32,stroke-width:2px
    style J fill:#FFB6C1,stroke:#FF69B4,stroke-width:2px
```

---

## 📋 Data Diagram Summary

### 🎯 **Core Data Entities:**
- **SeatMap**: Theater configuration (rows, seats per row)
- **Seat**: Individual seat with status and user assignment
- **User**: User information and session data
- **Reservation**: Temporary seat holds with expiry
- **Booking**: Confirmed seat purchases
- **ConnectionLog**: WebSocket connection tracking

### 🔄 **Data Flow Patterns:**
- **Optimistic Updates**: Client updates immediately, server validates
- **Real-time Sync**: All clients receive updates via WebSocket
- **Conflict Resolution**: Server handles concurrent seat selections
- **State Persistence**: Redux store with local storage backup

### 📊 **Performance Characteristics:**
- **Message Latency**: < 100ms for real-time updates
- **State Consistency**: Guaranteed across all connected clients
- **Data Validation**: Type-safe with runtime validation
- **Error Handling**: Graceful degradation with user feedback

### 🛡️ **Data Security & Integrity:**
- **Input Validation**: All user inputs validated server-side
- **State Authorization**: Users can only modify their own selections
- **Audit Trail**: All actions logged for debugging
- **Error Recovery**: Automatic state restoration on failures

*Data Diagram này thể hiện cấu trúc dữ liệu hoàn chỉnh của Seat Map Demo system, từ database schema đến real-time data synchronization, đảm bảo data consistency và performance optimization.*
