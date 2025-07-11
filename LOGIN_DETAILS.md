# TowApp Login Details

## Driver Accounts

### Driver 1: John Smith
- **Email:** driver1@towapp.com
- **Phone:** +27123456700
- **Company:** QuickTow Services
- **Vehicle:** Flatbed Truck
- **License Plate:** GT-1234-GP
- **Rating:** 4.8/5
- **Total Jobs:** 127

### Driver 2: Mike Johnson  
- **Email:** driver2@towapp.com
- **Phone:** +27123456701
- **Company:** FastTow Co.
- **Vehicle:** Tow Truck
- **License Plate:** TT-5678-GP
- **Rating:** 4.8/5
- **Total Jobs:** 127

### Driver 3: Sarah Wilson
- **Email:** driver3@towapp.com
- **Phone:** +27123456702
- **Company:** RapidTow Solutions
- **Vehicle:** Heavy Duty Truck
- **License Plate:** HD-9012-GP
- **Rating:** 4.8/5
- **Total Jobs:** 127

## User Account (Already Created)

### Demo User
- **Email:** bampoesean@gmail.com
- **Phone:** +27123456789
- **Name:** Demo User
- **User Type:** User

## How to Login

1. **For Users:** Select "I need a tow" on the role selection page
2. **For Drivers:** Select "I am a driver" on the role selection page
3. Enter the email and phone number from the accounts above
4. The system uses simple authentication - just match the email with the correct phone number

## Current Location Data

All drivers are positioned around Johannesburg, South Africa:
- **John Smith:** -26.1956, 28.0342
- **Mike Johnson:** -26.2100, 28.0500  
- **Sarah Wilson:** -26.1800, 28.0200

## Features Available

### For Users:
- View nearby drivers on Google Maps
- Request tow services
- Track driver location in real-time
- View payment methods
- Access trip history
- Profile management

### For Drivers:
- Accept/decline tow requests
- Update availability status
- View pending requests on map
- Track earnings
- Profile management

## Technical Notes

- Google Maps integration is fully functional with the provided API key
- Real-time WebSocket communication for live updates
- All data is stored in PostgreSQL database
- Session-based authentication system