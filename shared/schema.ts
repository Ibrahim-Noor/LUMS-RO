
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, check } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === USERS & ROLES ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Corresponds to Replit Auth username or email
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["student", "alumni", "faculty", "staff", "admin"] }).default("student").notNull(),
  studentId: text("student_id"), // Nullable for staff/faculty
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

// === DOCUMENT REQUESTS ===
export const documentRequests = pgTable("document_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type", { enum: ["transcript", "degree", "letter", "duplicate_degree"] }).notNull(),
  urgency: text("urgency", { enum: ["normal", "urgent"] }).default("normal").notNull(),
  status: text("status", { enum: ["pending", "processing", "completed", "rejected"] }).default("pending").notNull(),
  copies: integer("copies").default(1).notNull(),
  details: jsonb("details"), // For specific letter details etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentRequestsRelations = relations(documentRequests, ({ one }) => ({
  user: one(users, {
    fields: [documentRequests.userId],
    references: [users.id],
  }),
}));

export const insertDocumentRequestSchema = createInsertSchema(documentRequests).omit({ id: true, createdAt: true, updatedAt: true, status: true });

// === PAYMENTS ===
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id"), // Linked to document request
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

// === GRADE CHANGE PETITIONS ===
export const gradeChangePetitions = pgTable("grade_change_petitions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  instructorId: integer("instructor_id").notNull(),
  courseCode: text("course_code").notNull(),
  semester: text("semester").notNull(),
  currentGrade: text("current_grade").notNull(),
  requestedGrade: text("requested_grade").notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["submitted", "approved_dept", "approved_dean", "approved_registrar", "rejected"] }).default("submitted").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const petitionsRelations = relations(gradeChangePetitions, ({ one }) => ({
  student: one(users, {
    fields: [gradeChangePetitions.studentId],
    references: [users.id],
    relationName: "studentPetitions"
  }),
  instructor: one(users, {
    fields: [gradeChangePetitions.instructorId],
    references: [users.id],
    relationName: "instructorPetitions"
  }),
}));

export const insertPetitionSchema = createInsertSchema(gradeChangePetitions).omit({ id: true, createdAt: true, updatedAt: true, status: true });

// === MAJOR DECLARATIONS ===
export const majorApplications = pgTable("major_applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  currentMajor: text("current_major"),
  requestedMajor: text("requested_major").notNull(),
  school: text("school").notNull(), // SSE, SDSB, HSS, etc.
  statement: text("statement"),
  status: text("status", { enum: ["submitted", "under_review", "approved", "rejected"] }).default("submitted").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const majorApplicationsRelations = relations(majorApplications, ({ one }) => ({
  student: one(users, {
    fields: [majorApplications.studentId],
    references: [users.id],
  }),
}));

export const insertMajorApplicationSchema = createInsertSchema(majorApplications).omit({ id: true, createdAt: true, status: true });

// === ACADEMIC CALENDAR ===
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  type: text("type", { enum: ["holiday", "exam", "deadline", "event"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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
