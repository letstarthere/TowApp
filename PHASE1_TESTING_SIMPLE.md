# Phase 1: Driver Core Testing

## Quick Start
1. Run `start-phase1-proper.bat`
2. Wait for all 4 servers to start
3. Follow the testing flow below

## Testing Flow

### Step 1: Verify Phase Status
- Open: http://localhost:5000/api/testing/phase/status
- Should show: `"currentPhase": "driver_core"`

### Step 2: Test Driver Login
- Open: http://localhost:5000
- Select "I am a driver"
- Login with: `driver1@towapp.com` / `+27123456700`

### Step 3: Test Driver Features
- Verify driver map loads
- Check location updates work
- Test status toggle (online/offline)
- Verify driver profile shows

### Step 4: Verify Restrictions
- User requests should be blocked
- Payment features disabled
- Admin features locked

### Step 5: Admin Verification
- Open: http://localhost:3001
- Login: `admin@towapp.co.za` / `admin123`
- Check driver appears in dashboard

## Expected Results
✅ Driver authentication works
✅ Driver map and location tracking
✅ Driver status management
❌ User request flow blocked
❌ Payment system disabled
❌ Admin overrides locked

## Phase 1 Complete When:
- All driver core features work
- Restrictions properly enforced
- Ready to move to Phase 2 (User Core)