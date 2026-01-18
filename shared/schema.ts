import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for both regular users and drivers
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  name: text("name").notNull(),
  userType: text("user_type").notNull(), // 'user' or 'driver'
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Driver-specific information
export const drivers = sqliteTable("drivers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name"),
  vehicleType: text("vehicle_type").notNull(),
  licensePlate: text("license_plate").notNull(),
  isAvailable: integer("is_available", { mode: 'boolean' }).default(false),
  currentLatitude: real("current_latitude"),
  currentLongitude: real("current_longitude"),
  rating: real("rating").default(0.0),
  totalJobs: integer("total_jobs").default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Tow requests
export const requests = sqliteTable("requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  driverId: integer("driver_id").references(() => drivers.id),
  pickupLatitude: real("pickup_latitude").notNull(),
  pickupLongitude: real("pickup_longitude").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropoffLatitude: real("dropoff_latitude"),
  dropoffLongitude: real("dropoff_longitude"),
  dropoffAddress: text("dropoff_address"),
  estimatedPrice: real("estimated_price").notNull(),
  actualPrice: real("actual_price"),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'arrived', 'in_transit', 'destination_reached', 'completed', 'cancelled'
  arrivedAt: integer("arrived_at", { mode: 'timestamp' }),
  inTransitAt: integer("in_transit_at", { mode: 'timestamp' }),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
  preTowPhotoUrl: text("pre_tow_photo_url"),
  postTowPhotoUrl: text("post_tow_photo_url"),
  recipientName: text("recipient_name"),
  recipientSignatureUrl: text("recipient_signature_url"),
  recipientIdPhotoUrl: text("recipient_id_photo_url"),
  invoiceUrl: text("invoice_url"),
  driverRating: integer("driver_rating"),
  userFeedback: text("user_feedback"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
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
