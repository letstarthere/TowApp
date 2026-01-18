# TowApp Backend Architecture

## Current Implementation (Monolith → Microservices Ready)

### Core Services (Already Implemented)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │  User Service   │    │ Driver Service  │
│                 │    │                 │    │                 │
│ - JWT tokens    │    │ - User profiles │    │ - Driver profiles│
│ - Login/logout  │    │ - Vehicle mgmt  │    │ - Availability  │
│ - Role-based    │    │ - Preferences   │    │ - Location      │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Request Service │    │ Matching Service│    │Real-time Service│
│                 │    │                 │    │                 │
│ - Tow requests  │    │ - Driver match  │    │ - WebSockets    │
│ - Trip states   │    │ - Distance calc │    │ - Live tracking │
│ - Lifecycle     │    │ - Truck type    │    │ - Status updates│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## TowApp Request Flow

### 1. User Authentication
```
User → Auth Service → JWT Token → User/Driver Dashboard
```

### 2. Tow Request Creation
```
User Request → Request Service → {
  userId: number,
  pickupLocation: { lat, lng },
  vehicleType: string,
  truckType: 'flatbed' | 'wheel_lift' | 'integrated',
  description: string
}
```

### 3. Driver Matching Logic (TowApp Specific)
```
Matching Service Logic:
1. Get nearby drivers (5km radius)
2. Filter by:
   - Availability (online/offline)
   - Truck type compatibility
   - Load capacity
   - Driver rating (>4.0)
3. Rank by:
   - Distance (closest first)
   - Acceptance rate
   - Response time history
4. Send to Driver #1
5. If declined/timeout (30s) → Driver #2
6. Continue until accepted
```

### 4. Trip State Machine
```
REQUESTED → DRIVER_ASSIGNED → DRIVER_EN_ROUTE → DRIVER_ARRIVED → 
IN_PROGRESS → COMPLETED → PAID

Events emitted on each transition:
- Notification Service (push/SMS)
- Real-time Service (WebSocket)
- Analytics Service (logging)
```

### 5. Real-time Updates
```
WebSocket Events:
- driver_location_update
- request_status_change
- driver_assigned
- driver_arrived
- trip_started
- trip_completed
```

## Database Schema (Current)

### Users Table
```sql
users {
  id: serial primary key
  email: varchar unique
  phone: varchar
  name: varchar
  userType: 'user' | 'driver'
  createdAt: timestamp
}
```

### Drivers Table
```sql
drivers {
  id: serial primary key
  userId: integer → users.id
  companyName: varchar
  vehicleType: varchar
  licensePlate: varchar
  isAvailable: boolean
  currentLatitude: decimal
  currentLongitude: decimal
  rating: decimal
  totalJobs: integer
}
```

### Requests Table (To Implement)
```sql
tow_requests {
  id: serial primary key
  userId: integer → users.id
  driverId: integer → drivers.id (nullable)
  status: enum
  pickupLat: decimal
  pickupLng: decimal
  dropoffLat: decimal (nullable)
  dropoffLng: decimal (nullable)
  vehicleType: varchar
  truckType: varchar
  estimatedPrice: decimal
  finalPrice: decimal (nullable)
  createdAt: timestamp
  assignedAt: timestamp (nullable)
  completedAt: timestamp (nullable)
}
```

## API Endpoints (Current + Needed)

### Existing
```
POST /api/auth/login
GET  /api/auth/me
GET  /api/drivers
GET  /api/users
```

### To Implement
```
POST /api/requests              # Create tow request
GET  /api/requests/:id          # Get request details
POST /api/requests/:id/accept   # Driver accepts
POST /api/requests/:id/decline  # Driver declines
PUT  /api/requests/:id/status   # Update status
GET  /api/drivers/nearby        # Find nearby drivers
POST /api/drivers/location      # Update driver location
```

## Matching Algorithm (TowApp Specific)

```typescript
interface MatchingCriteria {
  pickupLocation: { lat: number; lng: number };
  vehicleType: string;
  truckType: 'flatbed' | 'wheel_lift' | 'integrated';
  maxDistance: number; // 5km default
}

async function findBestDriver(criteria: MatchingCriteria) {
  // 1. Get nearby drivers
  const nearbyDrivers = await getNearbyDrivers(
    criteria.pickupLocation, 
    criteria.maxDistance
  );
  
  // 2. Filter by truck type
  const compatibleDrivers = nearbyDrivers.filter(driver => 
    driver.vehicleType === criteria.truckType && 
    driver.isAvailable
  );
  
  // 3. Rank by distance + rating
  const rankedDrivers = compatibleDrivers
    .map(driver => ({
      ...driver,
      distance: calculateDistance(criteria.pickupLocation, driver.location),
      score: calculateScore(driver)
    }))
    .sort((a, b) => a.score - b.score);
    
  return rankedDrivers;
}
```

## WebSocket Events

```typescript
// Client → Server
'driver_location_update': { lat, lng, heading }
'request_created': { requestId }
'request_accepted': { requestId, driverId }
'request_declined': { requestId, driverId }
'status_update': { requestId, status }

// Server → Client
'new_request': { request, estimatedEarnings }
'request_assigned': { driverId, estimatedArrival }
'driver_location': { lat, lng, eta }
'status_changed': { status, timestamp }
```

## Next Implementation Steps

### Phase 1: Request Service
1. Create tow_requests table
2. Implement request CRUD API
3. Add request creation UI

### Phase 2: Matching Service
1. Implement driver search algorithm
2. Add request assignment logic
3. Handle accept/decline flow

### Phase 3: Real-time Updates
1. Enhance WebSocket events
2. Add live driver tracking
3. Implement status updates

### Phase 4: Payment Integration
1. Add pricing calculation
2. Implement payment flow
3. Driver earnings system

## Production Scaling (Future)

When ready to scale:
1. Split into microservices
2. Add message queue (Redis/Kafka)
3. Implement API Gateway
4. Add load balancing
5. Database sharding

Current monolith architecture is perfect for MVP and can handle thousands of users before needing to split.