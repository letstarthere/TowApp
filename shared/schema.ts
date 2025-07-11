import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for both regular users and drivers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  name: text("name").notNull(),
  userType: text("user_type").notNull(), // 'user' or 'driver'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Driver-specific information
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name"),
  vehicleType: text("vehicle_type").notNull(),
  licensePlate: text("license_plate").notNull(),
  isAvailable: boolean("is_available").default(false),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalJobs: integer("total_jobs").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tow requests
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  driverId: integer("driver_id").references(() => drivers.id),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }).notNull(),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }).notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropoffLatitude: decimal("dropoff_latitude", { precision: 10, scale: 8 }),
  dropoffLongitude: decimal("dropoff_longitude", { precision: 11, scale: 8 }),
  dropoffAddress: text("dropoff_address"),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }).notNull(),
  actualPrice: decimal("actual_price", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;

// Extended types for API responses
export type UserWithDriver = User & {
  driver?: Driver;
};

export type DriverWithUser = Driver & {
  user: User;
};

export type RequestWithDetails = Request & {
  user: User;
  driver?: DriverWithUser;
};
