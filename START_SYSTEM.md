# TOWAPP System Startup Guide

## 🚀 Quick Start - All Servers

### Option 1: Automated Start (Recommended)
Double-click `start-both-servers.bat` in the project root.

This will automatically start:
1. **Admin Server** (Port 4000) - Backend API for admin operations
2. **Admin Dashboard** (Port 3001) - Web-based admin interface
3. **Driver Server** (Port 5000) - Mobile app backend for drivers
4. **User Server** (Port 5001) - Mobile app backend for users

### Option 2: Manual Start
Open 4 separate command prompts:

**Terminal 1 - Admin Server:**
```bash
cd admin-server
npm install  # First time only
npm run dev
```

**Terminal 2 - Admin Dashboard:**
```bash
cd admin-client
npm install  # First time only
npm run dev
```

**Terminal 3 - Driver Server:**
```bash
npm run dev:driver
```

**Terminal 4 - User Server:**
```bash
npm run dev:user
```

## 🌐 Access URLs

Once all servers are running:

| Service | URL | Purpose |
|---------|-----|---------|
| **Admin Dashboard** | http://localhost:3001 | Review driver applications, manage system |
| **Driver App** | http://localhost:5000 | Driver interface and job management |
| **User App** | http://localhost:5001 | User interface for requesting tows |
| **Admin API** | http://localhost:4000 | Admin backend (API only) |

## 🔐 Login Credentials

### Admin Dashboard
- **Super Admin**: admin@towapp.co.za / admin123
- **Support Admin**: support@towapp.co.za / admin123

### Driver App (Port 5000)
- **Driver 1**: driver1@towapp.com / +27123456700
- **Driver 2**: driver2@towapp.com / +27123456701
- **Driver 3**: driver3@towapp.com / +27123456702

### User App (Port 5001)
- **Demo User**: bampoesean@gmail.com / +27123456789

## 📋 Testing Workflow

### 1. Admin System
1. Open http://localhost:3001
2. Login with admin credentials
3. Navigate to "Driver Applications"
4. Review pending driver sign-ups
5. Approve or reject applications

### 2. Driver Verification
1. Open http://localhost:5000
2. Login as a driver
3. If pending verification, see modal blocking access
4. Admin approves driver in dashboard
5. Driver can now access full app

### 3. User Request Flow
1. Open http://localhost:5001
2. Login as user
3. Select service and destination
4. Add vehicle details (or skip)
5. Capture photos
6. Request tow service

### 4. Driver Job Flow
1. Driver toggles "Available" status
2. Receives notification when user requests tow
3. Reviews customer and vehicle details
4. Accepts or declines request
5. Completes job

## 🛑 Stopping Servers

- Close each command window individually, or
- Press `Ctrl+C` in each terminal window

## ⚠️ Troubleshooting

### Port Already in Use
If you see "EADDRINUSE" error:
```bash
# Find and kill process on port
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### Admin Server Won't Start
```bash
cd admin-server
npm install
npm run dev
```

### Admin Dashboard Won't Start
```bash
cd admin-client
npm install
npm run dev
```

### Database Connection Issues
Check that PostgreSQL is running and DATABASE_URL is correct in:
- `.env` (main app)
- `admin-server/.env` (admin server)

## 📦 First Time Setup

Before running servers for the first time:

```bash
# Install main app dependencies
npm install

# Install admin server dependencies
cd admin-server
npm install
cd ..

# Install admin client dependencies
cd admin-client
npm install
cd ..
```

## 🔄 Development Workflow

1. **Start all servers** using batch file
2. **Admin Dashboard** - Manage driver applications
3. **Driver App** - Test driver features
4. **User App** - Test user features
5. **Monitor logs** in each terminal window

## 📊 System Architecture

```
┌─────────────────────┐
│ Admin Dashboard     │ Port 3001 (Web UI)
│ (React/Vite)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Admin Server        │ Port 4000 (API)
│ (Express/Node)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Shared Database     │
│ (PostgreSQL)        │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│ Driver  │ │  User   │
│ Server  │ │ Server  │
│ :5000   │ │ :5001   │
└─────────┘ └─────────┘
```

## ✅ System Health Check

All servers running correctly when you see:
- ✅ Admin Server: "Admin Server running on port 4000"
- ✅ Admin Dashboard: "Local: http://localhost:3001"
- ✅ Driver Server: "Server running on port 5000"
- ✅ User Server: "Server running on port 5001"

---

**Ready to develop!** 🎉