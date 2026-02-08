import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

export const documentRequests = pgTable("document_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type", { enum: ["transcript", "degree", "letter", "duplicate_degree"] }).notNull(),
  urgency: text("urgency", { enum: ["normal", "urgent"] }).default("normal").notNull(),
  status: text("status", { enum: ["submitted", "payment_pending", "pending_approval", "approved", "completed", "rejected"] }).default("submitted").notNull(),
  copies: integer("copies").default(1).notNull(),
  amount: integer("amount"),
  details: jsonb("details"),
  adminComment: text("admin_comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentRequestsRelations = relations(documentRequests, ({ one }) => ({
  user: one(users, {
    fields: [documentRequests.userId],
    references: [users.id],
  }),
}));

export const insertDocumentRequestSchema = createInsertSchema(documentRequests).omit({ id: true, createdAt: true, updatedAt: true, status: true, adminComment: true, userId: true });

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id"),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["pending", "paid", "failed"] }).default("pending").notNull(),
  transactionId: text("transaction_id"),
  method: text("method", { enum: ["online", "voucher"] }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  request: one(documentRequests, {
    fields: [payments.requestId],
    references: [documentRequests.id],
  }),
}));

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, status: true, transactionId: true });

export const gradeChangePetitions = pgTable("grade_change_petitions", {
  id: serial("id").primaryKey(),
  instructorId: varchar("instructor_id").notNull(),
  studentId: text("student_id").notNull(),
  courseCode: text("course_code").notNull(),
  currentGrade: text("current_grade").notNull(),
  newGrade: text("new_grade").notNull(),
  justification: text("justification").notNull(),
  status: text("status", { enum: ["submitted", "pending_approval", "approved", "rejected"] }).default("submitted").notNull(),
  adminComment: text("admin_comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const petitionsRelations = relations(gradeChangePetitions, ({ one }) => ({
  instructor: one(users, {
    fields: [gradeChangePetitions.instructorId],
    references: [users.id],
    relationName: "instructorPetitions"
  }),
}));

export const insertPetitionSchema = createInsertSchema(gradeChangePetitions).omit({ id: true, createdAt: true, updatedAt: true, status: true, adminComment: true, instructorId: true });

export const majorApplications = pgTable("major_applications", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id").notNull(),
  currentMajor: text("current_major"),
  requestedMajor: text("requested_major").notNull(),
  school: text("school").notNull(),
  statement: text("statement"),
  status: text("status", { enum: ["submitted", "pending_approval", "approved", "rejected"] }).default("submitted").notNull(),
  adminComment: text("admin_comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const majorApplicationsRelations = relations(majorApplications, ({ one }) => ({
  student: one(users, {
    fields: [majorApplications.studentId],
    references: [users.id],
  }),
}));

export const insertMajorApplicationSchema = createInsertSchema(majorApplications).omit({ id: true, createdAt: true, status: true, adminComment: true, studentId: true });

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  type: text("type", { enum: ["holiday", "exam", "deadline", "event"] }).notNull(),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  creator: one(users, {
    fields: [calendarEvents.createdBy],
    references: [users.id],
  }),
}));

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true, createdBy: true });

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

export type User = typeof users.$inferSelect;
export type DocumentRequest = typeof documentRequests.$inferSelect;
export type InsertDocumentRequest = z.infer<typeof insertDocumentRequestSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Petition = typeof gradeChangePetitions.$inferSelect;
export type InsertPetition = z.infer<typeof insertPetitionSchema>;
export type MajorApplication = typeof majorApplications.$inferSelect;
export type InsertMajorApplication = z.infer<typeof insertMajorApplicationSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
