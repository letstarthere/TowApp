# Admin Driver Verification Guide

## 🔄 Complete Verification Workflow

### 1. Driver Signs Up
1. Driver goes to http://localhost:5000
2. Selects "Join as a Driver" 
3. Completes 5-step signup process
4. Uploads required documents
5. Submits application

### 2. Application Appears in Admin
1. Application is saved to localStorage
2. Admin dashboard shows pending application count
3. Application appears in "Driver Applications" section

### 3. Admin Reviews Application
1. Admin logs into http://localhost:3001
2. Navigates to "Driver Applications"
3. Clicks on pending application
4. Reviews all details and documents:
   - Personal information
   - License details and expiry
   - Vehicle information
   - Uploaded documents (license, registration, photo)

### 4. Admin Decision
**To Approve:**
1. Click "Approve" button
2. Driver status changes to "active"
3. Driver can now access full app

**To Reject:**
1. Click "Reject" button
2. Enter rejection reason
3. Driver status changes to "rejected"
4. Driver receives notification

### 5. Driver Experience
**While Pending:**
- Driver sees verification modal
- Map is blurred in background
- Cannot access job features
- Can contact support or sign out

**After Approval:**
- Verification modal disappears
- Full app access granted
- Can toggle availability and accept jobs

**After Rejection:**
- Receives notification with reason
- Can reapply with corrections

## 🧪 Testing the Verification Flow

### Quick Test Setup
1. Start all servers: `start-both-servers.bat`
2. Open admin dashboard: http://localhost:3001
3. Login: admin@towapp.co.za / admin123

### Create Test Application
**Option 1: Use Driver Signup**
1. Go to http://localhost:5000
2. Complete driver signup process
3. Check admin dashboard for new application

**Option 2: Run Test Script**
```bash
node create-test-application.js
```

### Verify Admin Functions
1. **Dashboard**: Shows pending application count
2. **Applications List**: Displays all submitted applications
3. **Application Details**: Shows complete driver information
4. **Document Review**: View uploaded documents
5. **Approve/Reject**: Change application status

### Test Driver Experience
1. **Before Approval**: 
   - Go to http://localhost:5000
   - Login as driver
   - See verification modal blocking access

2. **After Approval**:
   - Admin approves application
   - Driver refreshes page (or waits 5 seconds)
   - Verification modal disappears
   - Full app access granted

## 🔐 Admin Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@towapp.co.za | admin123 |
| Support Admin | support@towapp.co.za | admin123 |

## 📊 Admin Dashboard Features

### Dashboard Overview
- **Active Drivers**: Count of approved drivers
- **Pending Applications**: Applications awaiting review
- **System Statistics**: Jobs, revenue, utilization

### Driver Applications
- **Application List**: All submitted applications
- **Status Filtering**: Pending, Approved, Rejected
- **Document Viewer**: Review uploaded files
- **Approval Workflow**: Approve/reject with reasons

### Real-time Updates
- Dashboard stats update with each approval/rejection
- Driver verification status updates every 5 seconds
- Applications sync between admin and mobile app

## 🛠️ Technical Implementation

### Data Flow
```
Driver Signup → localStorage → Admin Dashboard
     ↓              ↓              ↓
Application → Review Process → Approval/Rejection
     ↓              ↓              ↓
Status Update → Driver App → Access Granted/Denied
```

### Storage Mechanism
- **Applications**: `localStorage.driver_applications`
- **Verification Status**: `localStorage.driver_verification_status`
- **Real-time Sync**: 5-second polling interval

### Security Features
- Admin-only access to verification functions
- JWT-based admin authentication
- Role-based permissions (Super Admin, Support Admin)
- Audit trail of all admin actions

## 🚀 Production Considerations

### Database Integration
In production, replace localStorage with:
- PostgreSQL database tables
- Real-time WebSocket updates
- Email/SMS notifications
- Document storage (AWS S3, etc.)

### Notification System
- Email notifications to drivers
- SMS alerts for status changes
- Push notifications via FCM
- Admin action logging

### Document Management
- Secure document storage
- Image compression and optimization
- Document verification APIs
- Backup and retention policies

---

**Status**: ✅ **Fully Functional**
- Driver signup creates applications
- Admin can review and approve/reject
- Driver verification modal works
- Real-time status updates functional