# TOWAPP Admin Control System

## 🏗️ Architecture Overview

The admin system runs as a **completely separate service** from the mobile app backend:

```
┌─────────────────────┐     ┌──────────────────────┐
│  Mobile App (5000)  │     │  Admin Server (4000) │
│  - User requests    │     │  - Driver approval   │
│  - Driver jobs      │     │  - User management   │
│  - WebSocket        │     │  - Job oversight     │
└─────────────────────┘     └──────────────────────┘
         │                            │
         └────────────┬───────────────┘
                      │
              ┌───────▼────────┐
              │   Database     │
              │  (Shared Data) │
              └────────────────┘

┌──────────────────────┐
│ Admin Client (3001)  │
│ - Web Dashboard      │
│ - Desktop-first UI   │
└──────────────────────┘
```

## 🔐 Security Architecture

### Separation of Concerns
- **Admin server**: Port 4000 (separate from mobile backend)
- **Admin client**: Port 3001 (web-based dashboard)
- **Mobile backend**: Port 3000/5000/5001 (cannot access admin endpoints)

### Authentication
- **JWT-based** admin authentication (8-hour expiration)
- **Role-based access control**: Super Admin, Support Admin
- **Separate token system** from mobile app
- **Session management** with secure cookies

### API Security
- All admin endpoints require `Authorization: Bearer <token>`
- Role verification on sensitive operations
- Admin actions are logged and immutable
- No admin endpoints exposed to mobile apps

## 👥 Admin Roles

### Super Admin
- Full system access
- Approve/reject driver applications
- Suspend users and drivers
- Adjust earnings and payouts
- View all system data

### Support Admin
- View driver applications
- View job history
- Contact users/drivers
- Limited modification rights

## 🚀 Getting Started

### 1. Start Admin Server
```bash
cd admin-server
npm install
npm run dev
```
Server runs on: http://localhost:4000

### 2. Start Admin Client
```bash
cd admin-client
npm install
npm run dev
```
Dashboard runs on: http://localhost:3001

### 3. Login Credentials
**Super Admin:**
- Email: admin@towapp.co.za
- Password: admin123

**Support Admin:**
- Email: support@towapp.co.za
- Password: admin123

## 📊 Core Features

### 1. Dashboard
- **Active drivers** count
- **Pending applications** requiring review
- **Active tow requests** in progress
- **Completed jobs today** statistics
- **Failed/cancelled jobs** tracking
- **Total revenue** monitoring
- **Recent activity** feed

### 2. Driver Application Management
**View all driver sign-ups with:**
- Full name, email, phone
- Driver license details and expiry
- Tow truck type and vehicle registration
- Uploaded documents (license, registration, photo)
- Application submission date

**Actions:**
- ✅ **Approve** - Activates driver account
- ❌ **Reject** - Denies application with reason
- 👁️ **View documents** - Review uploaded files

**Workflow:**
1. Driver submits application via mobile app
2. Application appears in admin panel as "Pending"
3. Admin reviews documents and details
4. Admin approves or rejects
5. Driver receives notification
6. If approved, driver can start accepting jobs

### 3. Driver Management
- View all active drivers
- See driver statistics (reliability, acceptance rate)
- View last known location (read-only)
- Suspend or reactivate drivers
- View driver job history

### 4. User Management
- View user profiles
- Suspend abusive users
- View user job history
- Track user activity

### 5. Job Management
- View all tow requests (live and historical)
- See job status timeline
- Manually assign/reassign drivers
- Cancel jobs if required
- View job details and customer info

### 6. Disputes & Adjustments
- View dispute submissions
- Adjust earnings manually
- Apply partial payouts
- Add admin notes to jobs
- Track dispute resolution

## 🔍 Admin Action Logging

All admin actions are logged with:
- Admin ID and name
- Action type (approve, suspend, adjust, etc.)
- Target (driver, user, job)
- Timestamp
- Details/reason

**Immutable logs** ensure accountability and audit trail.

## 📱 Mobile App Integration

### Driver Verification Flow

**1. Driver Signs Up:**
- Completes 5-step registration
- Uploads required documents
- Submits application

**2. Pending State:**
- Driver status set to `pending_verification`
- Cannot access job requests
- Sees verification modal on driver map
- Map is blurred in background

**3. Admin Reviews:**
- Admin views application in dashboard
- Reviews documents and credentials
- Approves or rejects

**4. Approval:**
- Driver status changes to `active`
- Verification modal disappears
- Driver can now accept jobs
- Email/SMS notification sent

**5. Rejection:**
- Driver notified with reason
- Can reapply with corrections

### Verification Modal Features
- **Blocks app access** until approved
- **Shows expected timeline** (1-3 days)
- **Contact support** button
- **Sign out** option
- **Email/SMS notification** info

## 🛡️ Production Deployment

### Environment Variables
```bash
# Admin Server (.env)
PORT=4000
ADMIN_JWT_SECRET=<strong-secret-key>
SESSION_SECRET=<session-secret>
DATABASE_URL=<production-db-url>
MOBILE_BACKEND_URL=<mobile-api-url>
MOBILE_BACKEND_API_KEY=<internal-api-key>
```

### Security Checklist
- [ ] Change default admin passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS in production
- [ ] Restrict CORS origins
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Enable audit logging
- [ ] Regular security audits

### Deployment Steps
1. Deploy admin server to separate instance
2. Configure environment variables
3. Set up database connections
4. Deploy admin client (static files)
5. Configure reverse proxy (Nginx)
6. Enable HTTPS
7. Test admin authentication
8. Verify driver approval workflow

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Dashboard
- `GET /api/dashboard/stats` - System statistics
- `GET /api/dashboard/activity` - Recent activity

### Driver Management
- `GET /api/drivers/applications` - All applications
- `GET /api/drivers/applications/:id` - Specific application
- `POST /api/drivers/applications/:id/approve` - Approve driver
- `POST /api/drivers/applications/:id/reject` - Reject driver
- `GET /api/drivers` - All active drivers
- `POST /api/drivers/:id/suspend` - Suspend driver
- `POST /api/drivers/:id/activate` - Reactivate driver

## 📈 Future Enhancements

- Real-time dashboard updates via WebSocket
- Advanced analytics and reporting
- Bulk driver operations
- Automated fraud detection
- Payment reconciliation tools
- Customer support ticketing
- Driver performance analytics
- Revenue forecasting

## 🆘 Support

For admin system issues:
- **Email**: tech@towapp.co.za
- **Phone**: +27 11 123 4567
- **Documentation**: /docs/admin-guide

---

**Status**: ✅ **Production Ready**
- Secure authentication implemented
- Driver verification workflow complete
- Admin action logging operational
- Mobile app integration functional