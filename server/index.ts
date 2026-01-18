import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'towapp-secret-key-dev',
  resave: false,
  saveUninitialized: false,
  name: 'towapp.sid',
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  },
}));

// Phase indicator middleware - adds basic info to responses
app.use((req, res, next) => {
  res.locals.testMode = false;
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") && !path.includes("/auth/me")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed database with sample data
  try {
    const existingUser = await storage.getUserByEmail('bampoesean@gmail.com');
    if (!existingUser) {
      // Create sample users
      const demoUser = await storage.createUser({
        email: 'bampoesean@gmail.com',
        phone: '+27123456789',
        name: 'Demo User',
        userType: 'user'
      });
      
      const driver1User = await storage.createUser({
        email: 'driver1@towapp.com',
        phone: '+27123456700',
        name: 'John Smith',
        userType: 'driver'
      });
      
      const driver2User = await storage.createUser({
        email: 'driver2@towapp.com',
        phone: '+27123456701',
        name: 'Mike Johnson',
        userType: 'driver'
      });
      
      const driver3User = await storage.createUser({
        email: 'driver3@towapp.com',
        phone: '+27123456702',
        name: 'Sarah Wilson',
        userType: 'driver'
      });
      
      // Create driver profiles
      await storage.createDriver({
        userId: driver1User.id,
        companyName: 'QuickTow Services',
        vehicleType: 'Flatbed Truck',
        licensePlate: 'GT-1234-GP',
        isAvailable: true,
        currentLatitude: -25.7483,
        currentLongitude: 28.2299,
        rating: 4.8,
        totalJobs: 127
      });
      
      await storage.createDriver({
        userId: driver2User.id,
        companyName: 'FastTow Co.',
        vehicleType: 'Tow Truck',
        licensePlate: 'TT-5678-GP',
        isAvailable: true,
        currentLatitude: -26.2100,
        currentLongitude: 28.0500,
        rating: 4.8,
        totalJobs: 127
      });
      
      await storage.createDriver({
        userId: driver3User.id,
        companyName: 'RapidTow Solutions',
        vehicleType: 'Heavy Duty Truck',
        licensePlate: 'HD-9012-GP',
        isAvailable: true,
        currentLatitude: -26.1800,
        currentLongitude: 28.0200,
        rating: 4.8,
        totalJobs: 127
      });
      
      // Add Hatfield area drivers
      const hatfieldUser = await storage.createUser({
        email: 'hatfield@towapp.com',
        phone: '+27123456703',
        name: 'Hatfield Haulers',
        userType: 'driver'
      });
      
      const speedyUser = await storage.createUser({
        email: 'speedy@towapp.com',
        phone: '+27123456704',
        name: 'Speedy Tow Pretoria',
        userType: 'driver'
      });
      
      const metroUser = await storage.createUser({
        email: 'metro@towapp.com',
        phone: '+27123456705',
        name: 'Metro Tow Services',
        userType: 'driver'
      });
      
      const campusUser = await storage.createUser({
        email: 'campus@towapp.com',
        phone: '+27123456706',
        name: 'Campus Rescue Tow',
        userType: 'driver'
      });
      
      const towProsUser = await storage.createUser({
        email: 'towpros@towapp.com',
        phone: '+27123456707',
        name: '24/7 Tow Pros',
        userType: 'driver'
      });
      
      await storage.createDriver({
        userId: hatfieldUser.id,
        companyName: 'Hatfield Haulers',
        vehicleType: 'Tow Truck',
        licensePlate: 'HH-1001-GP',
        isAvailable: true,
        currentLatitude: -25.7483,
        currentLongitude: 28.2299,
        rating: 4.5,
        totalJobs: 89
      });
      
      await storage.createDriver({
        userId: speedyUser.id,
        companyName: 'Speedy Tow Pretoria',
        vehicleType: 'Flatbed Truck',
        licensePlate: 'ST-2002-GP',
        isAvailable: true,
        currentLatitude: -25.7490,
        currentLongitude: 28.2315,
        rating: 4.7,
        totalJobs: 156
      });
      
      await storage.createDriver({
        userId: metroUser.id,
        companyName: 'Metro Tow Services',
        vehicleType: 'Heavy Duty Truck',
        licensePlate: 'MT-3003-GP',
        isAvailable: true,
        currentLatitude: -25.7475,
        currentLongitude: 28.2278,
        rating: 4.9,
        totalJobs: 203
      });
      
      await storage.createDriver({
        userId: campusUser.id,
        companyName: 'Campus Rescue Tow',
        vehicleType: 'Tow Truck',
        licensePlate: 'CR-4004-GP',
        isAvailable: true,
        currentLatitude: -25.7494,
        currentLongitude: 28.2320,
        rating: 4.6,
        totalJobs: 134
      });
      
      await storage.createDriver({
        userId: towProsUser.id,
        companyName: '24/7 Tow Pros',
        vehicleType: 'Heavy Duty Truck',
        licensePlate: 'TP-5005-GP',
        isAvailable: true,
        currentLatitude: -25.7487,
        currentLongitude: 28.2280,
        rating: 4.8,
        totalJobs: 267
      });
      
      log('Database seeded with sample data');
    }
  } catch (error) {
    log('Error seeding database:', error);
  }
  
  const server = await registerRoutes(app);
  
  // Enhanced health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const nodeEnv = process.env.NODE_ENV || 'development';
  log(`NODE_ENV: ${nodeEnv}`);
  if (nodeEnv === "development") {
    log('Setting up Vite development server');
    await setupVite(app, server);
  } else {
    log('Setting up static file serving');
    serveStatic(app);
  }

  // Initialize server
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on http://0.0.0.0:${port}`);
    log(`accessible at http://192.168.0.167:${port}`);
    log('🚀 Production Mode: Ready for users');
  });
})();
