# TowTech Testing Guide

## Running Both Servers for Testing

### Option 1: Use the Batch File (Recommended)
1. Double-click `start-both-servers.bat`
2. Two command windows will open:
   - Driver Server: http://localhost:5000
   - User Server: http://localhost:5001

### Option 2: Manual Start
Open two separate command prompts in the project directory:

**Terminal 1 (Driver Server):**
```bash
npm run dev:driver
```

**Terminal 2 (User Server):**
```bash
npm run dev:user
```

## Testing Flow

### User Side (Port 5001)
1. Open http://localhost:5001
2. Accept permissions and select "I need a tow"
3. Login with email and phone number
4. Shows home page with map and service selection
5. Select Flatbed or Hook & Chain service
6. Enter destination
7. Click Continue → goes to car details page
8. Fill car details → goes to user-map page
9. Select a driver and click to request
10. Request is sent to driver server in real-time

### Driver Side (Port 5000)
1. Open http://localhost:5000
2. Accept permissions and select "I am a driver"
3. Login with driver email and phone number
4. Shows driver map with availability toggle
5. Toggle "Available" to receive requests
6. Wait for real user requests from the user side
7. Driver can Accept or Decline the request

### Legacy User Side (Port 5001)
1. Open http://localhost:5001
2. Auto-logs in as Demo User
3. Shows home page with map and service selection
4. Follow the user flow to make requests

## Real-time Testing
- Make sure both servers are running
- Have both browser windows open side by side
- Make a request from user side
- Watch the driver side receive the notification instantly
- Test accepting/declining requests

## Test Accounts (for development only)
- **Driver**: driver1@towapp.com / +27123456700 (John Smith)
- **User**: bampoesean@gmail.com / +27123456789 (Demo User)

**Note**: These accounts are for development testing only and should be removed before production.

## WebSocket Communication
The servers share the same database and WebSocket connections, so requests made on the user side will appear on the driver side in real-time.