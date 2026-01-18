import {
  users,
  drivers,
  requests,
  type User,
  type InsertUser,
  type Driver,
  type InsertDriver,
  type Request,
  type InsertRequest,
  type UserWithDriver,
  type DriverWithUser,
  type RequestWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<UserWithDriver | undefined>;
  getUserByEmail(email: string): Promise<UserWithDriver | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Driver operations
  getDriver(id: number): Promise<DriverWithUser | undefined>;
  getDriverByUserId(userId: number): Promise<DriverWithUser | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver>;
  getNearbyDrivers(latitude: number, longitude: number, radiusKm: number): Promise<DriverWithUser[]>;
  updateDriverLocation(driverId: number, latitude: number, longitude: number): Promise<void>;
  updateDriverAvailability(driverId: number, isAvailable: boolean): Promise<void>;

  // Request operations
  getRequest(id: number): Promise<RequestWithDetails | undefined>;
  getRequestsByUserId(userId: number): Promise<RequestWithDetails[]>;
  getRequestsByDriverId(driverId: number): Promise<RequestWithDetails[]>;
  getPendingRequests(): Promise<RequestWithDetails[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequestStatus(id: number, status: string, driverId?: number): Promise<Request>;
  updateRequestPrice(id: number, price: number): Promise<Request>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<UserWithDriver | undefined> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(drivers, eq(drivers.userId, users.id))
      .where(eq(users.id, id));
    
    if (result.length === 0) return undefined;
    
    const user = result[0].users;
    const driver = result[0].drivers;
    
    return {
      ...user,
      driver: driver || undefined,
    };
  }

  async getUserByEmail(email: string): Promise<UserWithDriver | undefined> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(drivers, eq(drivers.userId, users.id))
      .where(eq(users.email, email));
    
    if (result.length === 0) return undefined;
    
    const user = result[0].users;
    const driver = result[0].drivers;
    
    return {
      ...user,
      driver: driver || undefined,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getDriver(id: number): Promise<DriverWithUser | undefined> {
    const result = await db
      .select()
      .from(drivers)
      .innerJoin(users, eq(users.id, drivers.userId))
      .where(eq(drivers.id, id));
    
    if (result.length === 0) return undefined;
    
    const driver = result[0].drivers;
    const user = result[0].users;
    
    return {
      ...driver,
      user,
    };
  }

  async getDriverByUserId(userId: number): Promise<DriverWithUser | undefined> {
    const result = await db
      .select()
      .from(drivers)
      .innerJoin(users, eq(users.id, drivers.userId))
      .where(eq(drivers.userId, userId));
    
    if (result.length === 0) return undefined;
    
    const driver = result[0].drivers;
    const user = result[0].users;
    
    return {
      ...driver,
      user,
    };
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db
      .insert(drivers)
      .values(insertDriver)
      .returning();
    return driver;
  }

  async updateDriver(id: number, driverData: Partial<InsertDriver>): Promise<Driver> {
    const [driver] = await db
      .update(drivers)
      .set({ ...driverData, updatedAt: new Date() })
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  async getNearbyDrivers(latitude: number, longitude: number, radiusKm: number): Promise<DriverWithUser[]> {
    const result = await db
      .select()
      .from(drivers)
      .innerJoin(users, eq(users.id, drivers.userId))
      .where(
        and(
          eq(drivers.isAvailable, true),
          sql`
            (6371 * acos(cos(radians(${latitude})) * cos(radians(${drivers.currentLatitude})) * 
            cos(radians(${drivers.currentLongitude}) - radians(${longitude})) + 
            sin(radians(${latitude})) * sin(radians(${drivers.currentLatitude})))) <= ${radiusKm}
          `
        )
      );
    
    return result.map(row => ({
      ...row.drivers,
      user: row.users,
    }));
  }

  async updateDriverLocation(driverId: number, latitude: number, longitude: number): Promise<void> {
    await db
      .update(drivers)
      .set({
        currentLatitude: latitude.toString(),
        currentLongitude: longitude.toString(),
        updatedAt: new Date(),
      })
      .where(eq(drivers.id, driverId));
  }

  async updateDriverAvailability(driverId: number, isAvailable: boolean): Promise<void> {
    await db
      .update(drivers)
      .set({
        isAvailable,
        updatedAt: new Date(),
      })
      .where(eq(drivers.id, driverId));
  }

  async getRequest(id: number): Promise<RequestWithDetails | undefined> {
    const result = await db
      .select()
      .from(requests)
      .innerJoin(users, eq(users.id, requests.userId))
      .leftJoin(drivers, eq(drivers.id, requests.driverId))
      .where(eq(requests.id, id));
    
    if (result.length === 0) return undefined;
    
    const request = result[0].requests;
    const user = result[0].users;
    const driver = result[0].drivers;
    
    return {
      ...request,
      user,
      driver: driver ? { ...driver, user } : undefined,
    };
  }

  async getRequestsByUserId(userId: number): Promise<RequestWithDetails[]> {
    const result = await db
      .select()
      .from(requests)
      .innerJoin(users, eq(users.id, requests.userId))
      .leftJoin(drivers, eq(drivers.id, requests.driverId))
      .where(eq(requests.userId, userId));
    
    return result.map(row => ({
      ...row.requests,
      user: row.users,
      driver: row.drivers ? { ...row.drivers, user: row.users } : undefined,
    }));
  }

  async getRequestsByDriverId(driverId: number): Promise<RequestWithDetails[]> {
    const result = await db
      .select()
      .from(requests)
      .innerJoin(users, eq(users.id, requests.userId))
      .leftJoin(drivers, eq(drivers.id, requests.driverId))
      .where(eq(requests.driverId, driverId));
    
    return result.map(row => ({
      ...row.requests,
      user: row.users,
      driver: row.drivers ? { ...row.drivers, user: row.users } : undefined,
    }));
  }

  async getPendingRequests(): Promise<RequestWithDetails[]> {
    const result = await db
      .select()
      .from(requests)
      .innerJoin(users, eq(users.id, requests.userId))
      .leftJoin(drivers, eq(drivers.id, requests.driverId))
      .where(eq(requests.status, 'pending'));
    
    return result.map(row => ({
      ...row.requests,
      user: row.users,
      driver: row.drivers ? { ...row.drivers, user: row.users } : undefined,
    }));
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const [request] = await db
      .insert(requests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateRequestStatus(id: number, status: string, driverId?: number): Promise<Request> {
    const [request] = await db
      .update(requests)
      .set({
        status,
        driverId,
        updatedAt: new Date(),
      })
      .where(eq(requests.id, id))
      .returning();
    return request;
  }

  async updateRequestPrice(id: number, price: number): Promise<Request> {
    const [request] = await db
      .update(requests)
      .set({
        actualPrice: price.toString(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, id))
      .returning();
    return request;
  }

  async updateRequestCompletion(id: number, completionData: {
    postTowPhotoUrl?: string;
    recipientName?: string;
    recipientSignatureUrl?: string;
    recipientIdPhotoUrl?: string;
    actualPrice?: number;
  }): Promise<Request> {
    const [request] = await db
      .update(requests)
      .set({
        ...completionData,
        actualPrice: completionData.actualPrice?.toString(),
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, id))
      .returning();
    return request;
  }

  async updateRequestRating(id: number, rating: number, feedback?: string): Promise<Request> {
    const [request] = await db
      .update(requests)
      .set({
        driverRating: rating,
        userFeedback: feedback,
        updatedAt: new Date(),
      })
      .where(eq(requests.id, id))
      .returning();
    return request;
  }
}

export const storage = new DatabaseStorage();
