import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, requireAuth, requireRole, hashPassword } from "./auth";
import passport from "passport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  setupAuth(app);

  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        const { passwordHash, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      req.session.destroy((err) => {
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get(api.auth.user.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { passwordHash, ...safeUser } = req.user!;
    res.json(safeUser);
  });

  app.get(api.documentRequests.list.path, requireRole("student", "admin"), async (req, res) => {
    const user = req.user!;
    const requests = await storage.getDocumentRequests(user.role === 'admin' ? undefined : user.id);

    const requestsWithPayments = await Promise.all(
      requests.map(async (r) => {
        const paymentList = await storage.getPayments(r.id);
        return { ...r, payment: paymentList.length > 0 ? paymentList[0] : undefined };
      })
    );

    res.json(requestsWithPayments);
  });

  app.post(api.documentRequests.create.path, requireRole("student"), async (req, res) => {
    const input = api.documentRequests.create.input.parse(req.body);
    const request = await storage.createDocumentRequest({
      ...input,
      userId: req.user!.id,
    } as any);
    res.status(201).json(request);
  });

  app.get(api.documentRequests.get.path, requireRole("student", "admin"), async (req, res) => {
    const request = await storage.getDocumentRequest(Number(req.params.id));
    if (!request) return res.status(404).json({ message: "Not found" });

    const paymentList = await storage.getPayments(request.id);
    const payment = paymentList.length > 0 ? paymentList[0] : undefined;
    res.json({ ...request, payment });
  });

  app.patch(api.documentRequests.updateStatus.path, requireRole("admin"), async (req, res) => {
    const { status, adminComment } = req.body;
    const request = await storage.updateDocumentRequestStatus(Number(req.params.id), status, adminComment);
    res.json(request);
  });

  app.post(api.payments.process.path, requireRole("student"), async (req, res) => {
    const { requestId, amount, method } = req.body;
    const payment = await storage.createPayment({
      requestId,
      amount,
      method,
      status: "paid",
      transactionId: `TXN-${Date.now()}`
    });
    await storage.updateDocumentRequestStatus(requestId, "pending_approval");
    res.json(payment);
  });

  app.get(api.petitions.list.path, requireRole("instructor", "admin"), async (req, res) => {
    const user = req.user!;
    const petitions = await storage.getPetitions(user.role, user.id);
    res.json(petitions);
  });

  app.post(api.petitions.create.path, requireRole("instructor"), async (req, res) => {
    const input = api.petitions.create.input.parse(req.body);
    const petition = await storage.createPetition({
      ...input,
      instructorId: req.user!.id,
    } as any);
    res.status(201).json(petition);
  });

  app.patch(api.petitions.updateStatus.path, requireRole("admin"), async (req, res) => {
    const { status, adminComment } = req.body;
    const petition = await storage.updatePetitionStatus(Number(req.params.id), status, adminComment);
    res.json(petition);
  });

  app.get(api.majorApplications.list.path, requireRole("student", "admin"), async (req, res) => {
    const user = req.user!;
    const apps = await storage.getMajorApplications(user.role === 'admin' ? undefined : user.id);
    res.json(apps);
  });

  app.post(api.majorApplications.create.path, requireRole("student"), async (req, res) => {
    const input = api.majorApplications.create.input.parse(req.body);
    const appData = await storage.createMajorApplication({
      ...input,
      studentId: req.user!.id,
    } as any);
    res.status(201).json(appData);
  });

  app.patch(api.majorApplications.updateStatus.path, requireRole("admin"), async (req, res) => {
    const { status, adminComment } = req.body;
    const appData = await storage.updateMajorApplicationStatus(Number(req.params.id), status, adminComment);
    res.json(appData);
  });

  app.get(api.calendar.list.path, requireAuth, async (req, res) => {
    const events = await storage.getCalendarEvents();
    res.json(events);
  });

  app.post(api.calendar.create.path, requireRole("admin"), async (req, res) => {
    const body = {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    };
    const input = api.calendar.create.input.parse(body);
    const event = await storage.createCalendarEvent({
      ...input,
      createdBy: req.user!.id,
    });
    res.status(201).json(event);
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingAdmin = await storage.getUserByUsername("admin");
  if (existingAdmin) return;

  const adminHash = await hashPassword("admin123");
  const studentHash = await hashPassword("student123");
  const instructorHash = await hashPassword("instructor123");

  await storage.createUser({
    username: "admin",
    email: "admin@lums.edu.pk",
    passwordHash: adminHash,
    firstName: "System",
    lastName: "Administrator",
    fullName: "System Administrator",
    role: "admin",
    isActive: true,
    department: "Registrar Office",
  });

  await storage.createUser({
    username: "student",
    email: "student@lums.edu.pk",
    passwordHash: studentHash,
    firstName: "Ahmed",
    lastName: "Khan",
    fullName: "Ahmed Khan",
    role: "student",
    isActive: true,
    studentId: "24100001",
    department: "SSE",
  });

  await storage.createUser({
    username: "instructor",
    email: "instructor@lums.edu.pk",
    passwordHash: instructorHash,
    firstName: "Dr. Sarah",
    lastName: "Ali",
    fullName: "Dr. Sarah Ali",
    role: "instructor",
    isActive: true,
    department: "SSE",
  });

  await storage.createCalendarEvent({
    title: "Fall Semester Starts",
    startDate: new Date("2026-09-01"),
    type: "event",
    description: "First day of classes for Fall 2026"
  });
  await storage.createCalendarEvent({
    title: "Midterm Examinations",
    startDate: new Date("2026-10-15"),
    endDate: new Date("2026-10-25"),
    type: "exam",
    description: "Midterm examination period"
  });
  await storage.createCalendarEvent({
    title: "Spring Break",
    startDate: new Date("2026-03-23"),
    endDate: new Date("2026-03-27"),
    type: "holiday",
    description: "Spring break - No classes"
  });
  await storage.createCalendarEvent({
    title: "Course Registration Deadline",
    startDate: new Date("2026-02-15"),
    type: "deadline",
    description: "Last day to add/drop courses without penalty"
  });
}
