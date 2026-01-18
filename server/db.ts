import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL || 'file:./local.db';

const sqlite = new Database(DATABASE_URL.replace('file:', ''));
export const db = drizzle(sqlite, { schema });