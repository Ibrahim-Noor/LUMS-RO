import { db } from "./db";
import {
  users, documentRequests, payments, gradeChangePetitions, majorApplications, calendarEvents, notifications,
  type User, type InsertUser,
  type DocumentRequest, type InsertDocumentRequest,
  type Payment, type InsertPayment,
  type Petition, type InsertPetition,
  type MajorApplication, type InsertMajorApplication,
  type CalendarEvent, type InsertCalendarEvent,
  type Notification, type InsertNotification
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;

  getDocumentRequests(userId?: string): Promise<DocumentRequest[]>;
  getDocumentRequest(id: number): Promise<DocumentRequest | undefined>;
  createDocumentRequest(req: InsertDocumentRequest): Promise<DocumentRequest>;
  updateDocumentRequestStatus(id: number, status: string, adminComment?: string): Promise<DocumentRequest>;

  getPayments(requestId: number): Promise<Payment[]>;
  createPayment(payment: any): Promise<Payment>;

  getPetitions(role: string, userId: string): Promise<Petition[]>;
  createPetition(petition: InsertPetition): Promise<Petition>;
  updatePetitionStatus(id: number, status: string, adminComment?: string): Promise<Petition>;

  getMajorApplications(userId?: string): Promise<MajorApplication[]>;
  createMajorApplication(app: InsertMajorApplication): Promise<MajorApplication>;
  updateMajorApplicationStatus(id: number, status: string, adminComment?: string): Promise<MajorApplication>;

  getCalendarEvents(): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent & { createdBy?: string }): Promise<CalendarEvent>;

  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
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

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getDocumentRequests(userId?: string): Promise<DocumentRequest[]> {
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

  async updateDocumentRequestStatus(id: number, status: string, adminComment?: string): Promise<DocumentRequest> {
    const updates: any = { status, updatedAt: new Date() };
    if (adminComment !== undefined) updates.adminComment = adminComment;
    const [req] = await db.update(documentRequests).set(updates).where(eq(documentRequests.id, id)).returning();
    return req;
  }

  async getPayments(requestId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.requestId, requestId));
  }

  async createPayment(payment: any): Promise<Payment> {
    const [p] = await db.insert(payments).values(payment).returning();
    return p;
  }

  async getPetitions(role: string, userId: string): Promise<Petition[]> {
    if (role === 'instructor') {
      return await db.select().from(gradeChangePetitions).where(eq(gradeChangePetitions.instructorId, userId)).orderBy(desc(gradeChangePetitions.createdAt));
    } else if (role === 'admin') {
      return await db.select().from(gradeChangePetitions).orderBy(desc(gradeChangePetitions.createdAt));
    }
    return [];
  }

  async createPetition(petition: InsertPetition): Promise<Petition> {
    const [p] = await db.insert(gradeChangePetitions).values(petition).returning();
    return p;
  }

  async updatePetitionStatus(id: number, status: string, adminComment?: string): Promise<Petition> {
    const updates: any = { status, updatedAt: new Date() };
    if (adminComment !== undefined) updates.adminComment = adminComment;
    const [p] = await db.update(gradeChangePetitions).set(updates).where(eq(gradeChangePetitions.id, id)).returning();
    return p;
  }

  async getMajorApplications(userId?: string): Promise<MajorApplication[]> {
    if (userId) {
      return await db.select().from(majorApplications).where(eq(majorApplications.studentId, userId)).orderBy(desc(majorApplications.createdAt));
    }
    return await db.select().from(majorApplications).orderBy(desc(majorApplications.createdAt));
  }

  async createMajorApplication(app: InsertMajorApplication): Promise<MajorApplication> {
    const [a] = await db.insert(majorApplications).values(app).returning();
    return a;
  }

  async updateMajorApplicationStatus(id: number, status: string, adminComment?: string): Promise<MajorApplication> {
    const updates: any = { status };
    if (adminComment !== undefined) updates.adminComment = adminComment;
    const [a] = await db.update(majorApplications).set(updates).where(eq(majorApplications.id, id)).returning();
    return a;
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).orderBy(calendarEvents.startDate);
  }

  async createCalendarEvent(event: InsertCalendarEvent & { createdBy?: string }): Promise<CalendarEvent> {
    const [e] = await db.insert(calendarEvents).values(event).returning();
    return e;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [n] = await db.insert(notifications).values(notification).returning();
    return n;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
