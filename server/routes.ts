
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Users ===
  app.get(api.users.me.path, async (req, res) => {
    // Mock user for MVP if no auth header - In real app, Replit Auth middleware handles this
    // For now, let's assume a default user if not authenticated, or require authentication
    // Note: In Replit Auth, req.headers['x-replit-user-id'] is available.
    
    const username = req.headers['x-replit-user-name'] as string;
    
    if (!username) {
      // Return 401 if not logged in
      return res.status(401).json({ message: "Not authenticated" });
    }

    let user = await storage.getUserByUsername(username);
    if (!user) {
      // Auto-register user
      user = await storage.createUser({
        username,
        email: `${username}@example.com`,
        fullName: username,
        role: "student", // Default role
        studentId: "24100000",
        department: "SSE"
      });
    }
    res.json(user);
  });

  app.patch(api.users.update.path, async (req, res) => {
    const username = req.headers['x-replit-user-name'] as string;
    if (!username) return res.status(401).json({ message: "Not authenticated" });
    
    const user = await storage.getUserByUsername(username);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updates = api.users.update.input.parse(req.body);
    const updated = await storage.updateUser(user.id, updates);
    res.json(updated);
  });

  // === Document Requests ===
  app.get(api.documentRequests.list.path, async (req, res) => {
    // In a real app, we'd filter by user unless admin. 
    // For MVP, we'll try to get the current user context or return all if admin
    const username = req.headers['x-replit-user-name'] as string;
    const user = username ? await storage.getUserByUsername(username) : undefined;
    
    const requests = await storage.getDocumentRequests(user?.role === 'admin' ? undefined : user?.id);
    res.json(requests);
  });

  app.post(api.documentRequests.create.path, async (req, res) => {
    const input = api.documentRequests.create.input.parse(req.body);
    const request = await storage.createDocumentRequest(input);
    res.status(201).json(request);
  });

  app.get(api.documentRequests.get.path, async (req, res) => {
    const request = await storage.getDocumentRequest(Number(req.params.id));
    if (!request) return res.status(404).json({ message: "Not found" });
    
    const payments = await storage.getPayments(request.id);
    const payment = payments.length > 0 ? payments[0] : undefined;
    
    res.json({ ...request, payment });
  });

  // === Payments ===
  app.post(api.payments.process.path, async (req, res) => {
    const { requestId, amount, method } = req.body;
    // Mock payment processing
    const payment = await storage.createPayment({
      requestId,
      amount,
      method,
      status: "paid", // Auto-success for MVP
      transactionId: `TXN-${Date.now()}`
    });
    res.json(payment);
  });

  // === Petitions ===
  app.get(api.petitions.list.path, async (req, res) => {
    const username = req.headers['x-replit-user-name'] as string;
    const user = username ? await storage.getUserByUsername(username) : undefined;
    
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    
    const petitions = await storage.getPetitions(user.role, user.id);
    res.json(petitions);
  });

  app.post(api.petitions.create.path, async (req, res) => {
    const input = api.petitions.create.input.parse(req.body);
    const petition = await storage.createPetition(input);
    res.status(201).json(petition);
  });

  app.patch(api.petitions.updateStatus.path, async (req, res) => {
    const { status } = req.body;
    const petition = await storage.updatePetitionStatus(Number(req.params.id), status);
    res.json(petition);
  });

  // === Major Applications ===
  app.get(api.majorApplications.list.path, async (req, res) => {
     const username = req.headers['x-replit-user-name'] as string;
    const user = username ? await storage.getUserByUsername(username) : undefined;
    
    const apps = await storage.getMajorApplications(user?.role === 'admin' ? undefined : user?.id);
    res.json(apps);
  });

  app.post(api.majorApplications.create.path, async (req, res) => {
    const input = api.majorApplications.create.input.parse(req.body);
    const appData = await storage.createMajorApplication(input);
    res.status(201).json(appData);
  });

  // === Calendar ===
  app.get(api.calendar.list.path, async (req, res) => {
    const events = await storage.getCalendarEvents();
    res.json(events);
  });

  app.post(api.calendar.create.path, async (req, res) => {
    const input = api.calendar.create.input.parse(req.body);
    const event = await storage.createCalendarEvent(input);
    res.status(201).json(event);
  });

  return httpServer;
}

// Seed function
async function seedDatabase() {
  const events = await storage.getCalendarEvents();
  if (events.length === 0) {
    await storage.createCalendarEvent({
      title: "Fall Semester Starts",
      startDate: new Date("2024-09-01"),
      type: "event",
      description: "First day of classes"
    });
     await storage.createCalendarEvent({
      title: "Midterm Exams",
      startDate: new Date("2024-10-15"),
      endDate: new Date("2024-10-25"),
      type: "exam",
      description: "Midterm examination period"
    });
  }
}
