import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertDriverSchema, insertRequestSchema } from "@shared/schema";
import { upload, getFileUrl } from "./fileStorage";
import { InvoiceGenerator } from "./invoiceGenerator";
import { z } from "zod";
import path from 'path';
import fs from 'fs';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    userType: string;
  };
}

// Simple session-based auth middleware
const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
          if (userId) {
            clients.set(userId, ws);
            ws.send(JSON.stringify({ type: 'authenticated', userId }));
          }
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
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, phone, name, userType } = req.body;
      
      // Only allow user registration, drivers need to apply through official website
      if (userType === 'driver') {
        return res.status(400).json({ 
          message: 'Driver applications must be submitted through our official website. Please visit towapp.com/apply' 
        });
      }
      
      const userData = insertUserSchema.parse({ email, phone, name, userType });
      const user = await storage.createUser(userData);
      
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

  app.post('/api/auth/login', async (req: Request, res: Response) => {
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

  app.post('/api/auth/logout', authenticate, (req: AuthenticatedRequest, res: Response) => {
    (req.session as any).user = null;
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Get Google Maps API key for frontend
  app.get('/api/config/maps', (req: Request, res: Response) => {
    res.json({
      apiKey: 'AIzaSyAgl6sJeKZ83uP9iD8kv5WXqka629pZ2bA'
    });
  });

  // Driver routes
  app.get('/api/drivers/nearby', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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

  app.put('/api/drivers/availability', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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

  app.put('/api/drivers/location', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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
  app.post('/api/requests', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { vehicleInfo, ...otherData } = req.body;
      
      const requestData = insertRequestSchema.parse({
        userId: req.user!.id,
        ...otherData,
        // Store vehicle info as JSON string if provided
        vehicleInfo: vehicleInfo ? JSON.stringify(vehicleInfo) : null
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

  app.put('/api/requests/:id/accept', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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

  app.put('/api/requests/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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

  app.get('/api/requests/my', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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

  app.get('/api/requests/pending', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requests = await storage.getPendingRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get pending requests' });
    }
  });

  // Trip completion endpoints
  app.put('/api/requests/:id/arrived', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const { preTowPhotoUrl } = req.body;
      
      const request = await storage.updateRequestStatus(requestId, 'arrived');
      // TODO: Store pre-tow photo URL
      
      const requestWithDetails = await storage.getRequest(request.id);
      if (requestWithDetails) {
        broadcastToUser(requestWithDetails.userId, {
          type: 'driver_arrived',
          request: requestWithDetails
        });
      }
      
      res.json(requestWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update arrival status' });
    }
  });

  app.put('/api/requests/:id/in-transit', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      
      const request = await storage.updateRequestStatus(requestId, 'in_transit');
      const requestWithDetails = await storage.getRequest(request.id);
      
      if (requestWithDetails) {
        broadcastToUser(requestWithDetails.userId, {
          type: 'in_transit',
          request: requestWithDetails
        });
      }
      
      res.json(requestWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update transit status' });
    }
  });

  app.put('/api/requests/:id/destination-reached', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      
      const request = await storage.updateRequestStatus(requestId, 'destination_reached');
      const requestWithDetails = await storage.getRequest(request.id);
      
      if (requestWithDetails) {
        broadcastToUser(requestWithDetails.userId, {
          type: 'destination_reached',
          request: requestWithDetails
        });
      }
      
      res.json(requestWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update destination status' });
    }
  });

  app.put('/api/requests/:id/complete', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const { 
        postTowPhotoUrl, 
        recipientName, 
        recipientSignatureUrl, 
        recipientIdPhotoUrl,
        actualPrice 
      } = req.body;
      
      // TODO: Store completion data and generate invoice
      const request = await storage.updateRequestStatus(requestId, 'completed');
      const requestWithDetails = await storage.getRequest(request.id);
      
      if (requestWithDetails) {
        broadcastToUser(requestWithDetails.userId, {
          type: 'trip_completed',
          request: requestWithDetails
        });
      }
      
      res.json(requestWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to complete trip' });
    }
  });

  app.post('/api/requests/:id/rating', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const { rating, feedback } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      
      await storage.updateRequestRating(requestId, rating, feedback);
      
      res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to submit rating' });
    }
  });

  app.get('/api/requests/:id/invoice', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
      
      // Generate invoice
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(requestId).padStart(6, '0')}`;
      const filename = await InvoiceGenerator.generateInvoice({
        request,
        invoiceNumber
      });
      
      // Update request with invoice URL
      await storage.updateRequestCompletion(requestId, {
        invoiceUrl: InvoiceGenerator.getInvoiceUrl(filename)
      });
      
      res.json({ 
        invoiceUrl: InvoiceGenerator.getInvoiceUrl(filename),
        invoiceNumber 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate invoice' });
    }
  });

  // File upload endpoints
  app.post('/api/requests/:tripId/upload/:type', authenticate, upload.single('photo'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tripId, type } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const fileUrl = getFileUrl(tripId, file.filename);
      
      // Update request with photo URL based on type
      const updateData: any = {};
      if (type === 'pre-tow') {
        updateData.preTowPhotoUrl = fileUrl;
      } else if (type === 'post-tow') {
        updateData.postTowPhotoUrl = fileUrl;
      } else if (type === 'id-photo') {
        updateData.recipientIdPhotoUrl = fileUrl;
      }
      
      if (Object.keys(updateData).length > 0) {
        await storage.updateRequestCompletion(parseInt(tripId), updateData);
      }
      
      res.json({ fileUrl, filename: file.filename });
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Signature upload endpoint
  app.post('/api/requests/:tripId/signature', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tripId } = req.params;
      const { signature, recipientName } = req.body;
      
      if (!signature || !recipientName) {
        return res.status(400).json({ message: 'Signature and recipient name required' });
      }
      
      // Save signature as base64 image
      const base64Data = signature.replace(/^data:image\/png;base64,/, '');
      const filename = `signature-${Date.now()}.png`;
      const uploadsDir = path.join(process.cwd(), 'uploads', `trip-${tripId}`);
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, base64Data, 'base64');
      
      const signatureUrl = getFileUrl(tripId, filename);
      
      // Update request with signature data
      await storage.updateRequestCompletion(parseInt(tripId), {
        recipientName,
        recipientSignatureUrl: signatureUrl
      });
      
      res.json({ signatureUrl, filename });
    } catch (error) {
      res.status(500).json({ message: 'Failed to save signature' });
    }
  });

  // File serving endpoints
  app.get('/api/files/trip-:tripId/:filename', (req: Request, res: Response) => {
    const { tripId, filename } = req.params;
    const filepath = path.join(process.cwd(), 'uploads', `trip-${tripId}`, filename);
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  app.get('/api/invoices/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    const filepath = InvoiceGenerator.getInvoicePath(filename);
    
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.sendFile(filepath);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  });

  // Test invoice endpoints
  app.post('/api/test/generate-invoice', async (req: Request, res: Response) => {
    try {
      const invoiceData = req.body;
      const invoiceNumber = invoiceData.invoiceNumber || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Generate PDF with company logo and full content
      const filename = await InvoiceGenerator.generateTestInvoice({
        ...invoiceData,
        invoiceNumber
      });
      
      // Store invoice in mock trip history (in production this would be in database)
      const mockTrip = {
        id: Date.now(),
        invoiceNumber,
        filename,
        customerName: invoiceData.customerName,
        driverName: invoiceData.driverName,
        amount: invoiceData.amount,
        date: invoiceData.date,
        status: 'completed'
      };
      
      // In production, save to database:
      // await storage.updateRequestCompletion(tripId, { invoiceUrl: InvoiceGenerator.getInvoiceUrl(filename) });
      
      res.json({ 
        invoiceUrl: InvoiceGenerator.getInvoiceUrl(filename),
        invoiceNumber,
        filename,
        trip: mockTrip
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate test invoice' });
    }
  });

  app.get('/api/test/download-invoice/:invoiceNumber', (req: Request, res: Response) => {
    const { invoiceNumber } = req.params;
    const filename = `${invoiceNumber}.pdf`;
    const filepath = InvoiceGenerator.getInvoicePath(filename);
    
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filepath);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  });

  return httpServer;
}
