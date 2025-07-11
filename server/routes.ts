import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertDriverSchema, insertRequestSchema } from "@shared/schema";
import { z } from "zod";

interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: number;
    email: string;
    userType: string;
  };
}

// Simple session-based auth middleware
const authenticate = (req: AuthenticatedRequest, res: Express.Response, next: Express.NextFunction) => {
  const sessionUser = (req.session as any)?.user;
  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = sessionUser;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<number, WebSocket>();
  
  wss.on('connection', (ws, req) => {
    let userId: number | undefined;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate') {
          userId = data.userId;
          clients.set(userId, ws);
          ws.send(JSON.stringify({ type: 'authenticated', userId }));
        } else if (data.type === 'location_update' && userId) {
          // Update driver location
          const user = await storage.getUser(userId);
          if (user?.driver) {
            await storage.updateDriverLocation(user.driver.id, data.latitude, data.longitude);
            
            // Broadcast location update to nearby users
            const nearbyDrivers = await storage.getNearbyDrivers(data.latitude, data.longitude, 10);
            nearbyDrivers.forEach(driver => {
              const driverClient = clients.get(driver.userId);
              if (driverClient && driverClient.readyState === WebSocket.OPEN) {
                driverClient.send(JSON.stringify({
                  type: 'driver_location_update',
                  driverId: driver.id,
                  latitude: data.latitude,
                  longitude: data.longitude
                }));
              }
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });
  
  // Helper function to broadcast to user
  const broadcastToUser = (userId: number, message: any) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, phone, name, userType, driverData } = req.body;
      
      const userData = insertUserSchema.parse({ email, phone, name, userType });
      const user = await storage.createUser(userData);
      
      if (userType === 'driver' && driverData) {
        const driverDetails = insertDriverSchema.parse({
          userId: user.id,
          ...driverData
        });
        await storage.createDriver(driverDetails);
      }
      
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        userType: user.userType
      };
      
      const userWithDriver = await storage.getUser(user.id);
      res.json(userWithDriver);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, phone } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Simple auth - in production, use proper password verification
      if (user.phone !== phone) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        userType: user.userType
      };
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Login failed' });
    }
  });

  app.post('/api/auth/logout', authenticate, (req, res) => {
    (req.session as any).user = null;
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Driver routes
  app.get('/api/drivers/nearby', authenticate, async (req, res) => {
    try {
      const { latitude, longitude, radius = 10 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      
      const drivers = await storage.getNearbyDrivers(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(radius as string)
      );
      
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get nearby drivers' });
    }
  });

  app.put('/api/drivers/availability', authenticate, async (req, res) => {
    try {
      const { isAvailable } = req.body;
      const user = await storage.getUser(req.user!.id);
      
      if (!user?.driver) {
        return res.status(400).json({ message: 'User is not a driver' });
      }
      
      await storage.updateDriverAvailability(user.driver.id, isAvailable);
      res.json({ message: 'Availability updated' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update availability' });
    }
  });

  app.put('/api/drivers/location', authenticate, async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      const user = await storage.getUser(req.user!.id);
      
      if (!user?.driver) {
        return res.status(400).json({ message: 'User is not a driver' });
      }
      
      await storage.updateDriverLocation(user.driver.id, latitude, longitude);
      res.json({ message: 'Location updated' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update location' });
    }
  });

  // Request routes
  app.post('/api/requests', authenticate, async (req, res) => {
    try {
      const requestData = insertRequestSchema.parse({
        userId: req.user!.id,
        ...req.body
      });
      
      const request = await storage.createRequest(requestData);
      const requestWithDetails = await storage.getRequest(request.id);
      
      // Broadcast to nearby drivers
      const nearbyDrivers = await storage.getNearbyDrivers(
        parseFloat(requestData.pickupLatitude as string),
        parseFloat(requestData.pickupLongitude as string),
        15
      );
      
      nearbyDrivers.forEach(driver => {
        broadcastToUser(driver.userId, {
          type: 'new_request',
          request: requestWithDetails
        });
      });
      
      res.json(requestWithDetails);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create request' });
    }
  });

  app.put('/api/requests/:id/accept', authenticate, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const user = await storage.getUser(req.user!.id);
      
      if (!user?.driver) {
        return res.status(400).json({ message: 'User is not a driver' });
      }
      
      const request = await storage.updateRequestStatus(requestId, 'accepted', user.driver.id);
      const requestWithDetails = await storage.getRequest(request.id);
      
      // Notify the user
      if (requestWithDetails) {
        broadcastToUser(requestWithDetails.userId, {
          type: 'request_accepted',
          request: requestWithDetails
        });
      }
      
      res.json(requestWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to accept request' });
    }
  });

  app.put('/api/requests/:id/status', authenticate, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      const request = await storage.updateRequestStatus(requestId, status);
      const requestWithDetails = await storage.getRequest(request.id);
      
      if (requestWithDetails) {
        broadcastToUser(requestWithDetails.userId, {
          type: 'request_status_updated',
          request: requestWithDetails
        });
      }
      
      res.json(requestWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update request status' });
    }
  });

  app.get('/api/requests/my', authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      let requests;
      
      if (user?.userType === 'driver' && user.driver) {
        requests = await storage.getRequestsByDriverId(user.driver.id);
      } else {
        requests = await storage.getRequestsByUserId(req.user!.id);
      }
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get requests' });
    }
  });

  app.get('/api/requests/pending', authenticate, async (req, res) => {
    try {
      const requests = await storage.getPendingRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get pending requests' });
    }
  });

  return httpServer;
}
