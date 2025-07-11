# TOWAPP - Uber-Style Tow Truck Application

## Overview

TOWAPP is a full-stack tow truck booking application that connects users needing tow services with available drivers. The application features separate user and driver portals with real-time communication, location tracking, and an Uber-like interface with live maps and pricing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Brand Colors**: Primary orange (#ff7b29), secondary black, white background

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for live updates
- **Authentication**: Session-based authentication

### Key Components

1. **User Portal**
   - Map interface showing nearby tow trucks
   - Request tow service functionality
   - Real-time price estimates
   - Profile management

2. **Driver Portal**
   - Driver availability toggle
   - Incoming request notifications
   - Location tracking and updates
   - Job management interface

3. **Authentication System**
   - Role-based access (User vs Driver)
   - Simple email/phone registration
   - Session management

4. **Real-time Features**
   - WebSocket connections for live updates
   - Location tracking for drivers
   - Request status updates
   - Push notifications for new requests

## Data Flow

1. **User Registration/Login**: Users select their role (User/Driver) and authenticate
2. **Location Services**: Geolocation API tracks user/driver positions
3. **Service Requests**: Users create tow requests with pickup/dropoff locations
4. **Driver Matching**: System finds nearby available drivers
5. **Real-time Updates**: WebSocket connections keep all parties informed
6. **Job Completion**: Status updates flow from driver to user

## Database Schema

### Users Table
- Stores both regular users and drivers
- Includes contact information and user type
- Timestamps for audit trails

### Drivers Table
- Driver-specific information (company, vehicle, license plate)
- Availability status and current location
- Rating and job statistics

### Requests Table
- Tow service requests with pickup/dropoff locations
- Price estimates and actual pricing
- Status tracking (pending, accepted, in_progress, completed, cancelled)

## External Dependencies

### Database
- **Neon Database**: PostgreSQL hosting service
- **Drizzle ORM**: Type-safe database interactions
- **Connection Pooling**: Efficient database connections

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **React Hook Form**: Form state management
- **TanStack Query**: Server state and caching
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Fast development server and build tool
- **Replit Integration**: Development environment support
- **TypeScript**: Type safety across the stack

## Deployment Strategy

### Development
- Vite dev server for frontend hot reloading
- Express server with TypeScript compilation
- Database migrations with Drizzle Kit
- Environment-based configuration

### Production
- Frontend built and served as static files
- Backend compiled to JavaScript modules
- Database connection via environment variables
- WebSocket support for real-time features

### Key Features
- **Mobile-first Design**: Responsive layout optimized for mobile devices
- **Real-time Communication**: WebSocket connections for instant updates
- **Geolocation Integration**: HTML5 Geolocation API for location services
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Modern UI**: shadcn/ui components with Tailwind CSS styling
- **Session Management**: Secure authentication without complex JWT setup

The application follows a clean separation of concerns with shared types between frontend and backend, ensuring type safety and maintainability throughout the development process.