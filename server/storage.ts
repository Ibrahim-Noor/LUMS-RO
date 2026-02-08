
import { db } from "./db";
import {
  users, documentRequests, payments, gradeChangePetitions, majorApplications, calendarEvents,
  type User, type InsertUser,
  type DocumentRequest, type InsertDocumentRequest,
  type Payment, type InsertPayment,
  type Petition, type InsertPetition,
  type MajorApplication, type InsertMajorApplication,
  type CalendarEvent, type InsertCalendarEvent
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Document Requests
  getDocumentRequests(userId?: number): Promise<DocumentRequest[]>;
  getDocumentRequest(id: number): Promise<DocumentRequest | undefined>;
  createDocumentRequest(req: InsertDocumentRequest): Promise<DocumentRequest>;

  // Payments
  getPayments(requestId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Petitions
  getPetitions(role: string, userId: number): Promise<Petition[]>; // Filter by role logic
  createPetition(petition: InsertPetition): Promise<Petition>;
  updatePetitionStatus(id: number, status: string): Promise<Petition>;

  // Major Applications
  getMajorApplications(userId?: number): Promise<MajorApplication[]>;
  createMajorApplication(app: InsertMajorApplication): Promise<MajorApplication>;

  // Calendar
  getCalendarEvents(): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Document Requests
  async getDocumentRequests(userId?: number): Promise<DocumentRequest[]> {
    if (userId) {
      return await db.select().from(documentRequests).where(eq(documentRequests.userId, userId)).orderBy(desc(documentRequests.createdAt));
    }
    return await db.select().from(documentRequests).orderBy(desc(documentRequests.createdAt));
  }

  async getDocumentRequest(id: number): Promise<DocumentRequest | undefined> {
    const [req] = await db.select().from(documentRequests).where(eq(documentRequests.id, id));
    return req;
  }

  async createDocumentRequest(req: InsertDocumentRequest): Promise<DocumentRequest> {
    const [request] = await db.insert(documentRequests).values(req).returning();
    return request;
  }

  // Payments
  async getPayments(requestId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.requestId, requestId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [p] = await db.insert(payments).values(payment).returning();
    return p;
  }

  // Petitions
  async getPetitions(role: string, userId: number): Promise<Petition[]> {
    if (role === 'student') {
      return await db.select().from(gradeChangePetitions).where(eq(gradeChangePetitions.studentId, userId));
    } else if (role === 'faculty') {
      return await db.select().from(gradeChangePetitions).where(eq(gradeChangePetitions.instructorId, userId));
    } else {
      // Admin/Staff sees all
      return await db.select().from(gradeChangePetitions);
    }
  }

  async createPetition(petition: InsertPetition): Promise<Petition> {
    const [p] = await db.insert(gradeChangePetitions).values(petition).returning();
    return p;
  }

  async updatePetitionStatus(id: number, status: string): Promise<Petition> {
    const [p] = await db.update(gradeChangePetitions).set({ status }).where(eq(gradeChangePetitions.id, id)).returning();
    return p;
  }

  // Major Applications
  async getMajorApplications(userId?: number): Promise<MajorApplication[]> {
    if (userId) {
      return await db.select().from(majorApplications).where(eq(majorApplications.studentId, userId));
    }
    return await db.select().from(majorApplications);
  }

  async createMajorApplication(app: InsertMajorApplication): Promise<MajorApplication> {
    const [a] = await db.insert(majorApplications).values(app).returning();
    return a;
  }

  // Calendar
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).orderBy(calendarEvents.startDate);
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [e] = await db.insert(calendarEvents).values(event).returning();
    return e;
  }
}

export const storage = new DatabaseStorage();
