import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { 
  InsertDocumentRequest, 
  InsertPetition, 
  InsertMajorApplication, 
  InsertCalendarEvent,
} from "@shared/schema";

export function useDocumentRequests() {
  return useQuery({
    queryKey: [api.documentRequests.list.path],
    queryFn: async () => {
      const res = await fetch(api.documentRequests.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
  });
}

export function useCreateDocumentRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Partial<InsertDocumentRequest>) => {
      const res = await fetch(api.documentRequests.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documentRequests.list.path] });
      toast({ title: "Request Submitted", description: "Your document request has been received." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useProcessPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { requestId: number, amount: number, method: "online" | "voucher" }) => {
      const res = await fetch(api.payments.process.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Payment failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documentRequests.list.path] });
      toast({ title: "Payment Successful", description: "Thank you for your payment." });
    },
    onError: (err) => {
      toast({ title: "Payment Failed", description: err.message, variant: "destructive" });
    }
  });
}

export function useUpdateDocumentRequestStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status, adminComment }: { id: number, status: string, adminComment?: string }) => {
      const url = buildUrl(api.documentRequests.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminComment }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documentRequests.list.path] });
      toast({ title: "Status Updated", description: "Request status has been changed." });
    },
  });
}

export function usePetitions() {
  return useQuery({
    queryKey: [api.petitions.list.path],
    queryFn: async () => {
      const res = await fetch(api.petitions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch petitions");
      return res.json();
    },
  });
}

export function useCreatePetition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Partial<InsertPetition>) => {
      const res = await fetch(api.petitions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit petition");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.petitions.list.path] });
      toast({ title: "Petition Submitted", description: "Your grade change petition has been submitted for review." });
    },
  });
}

export function useUpdatePetitionStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status, adminComment }: { id: number, status: string, adminComment?: string }) => {
      const url = buildUrl(api.petitions.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminComment }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.petitions.list.path] });
      toast({ title: "Status Updated", description: "Petition status has been changed." });
    },
  });
}

export function useMajorApplications() {
  return useQuery({
    queryKey: [api.majorApplications.list.path],
    queryFn: async () => {
      const res = await fetch(api.majorApplications.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
  });
}

export function useCreateMajorApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Partial<InsertMajorApplication>) => {
      const res = await fetch(api.majorApplications.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit application");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.majorApplications.list.path] });
      toast({ title: "Application Submitted", description: "Your major declaration request is under review." });
    },
  });
}

export function useUpdateMajorApplicationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status, adminComment }: { id: number, status: string, adminComment?: string }) => {
      const url = buildUrl(api.majorApplications.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminComment }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.majorApplications.list.path] });
      toast({ title: "Status Updated", description: "Application status has been changed." });
    },
  });
}

export function useCalendarEvents() {
  return useQuery({
    queryKey: [api.calendar.list.path],
    queryFn: async () => {
      const res = await fetch(api.calendar.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch calendar");
      return res.json();
    },
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertCalendarEvent) => {
      const res = await fetch(api.calendar.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.calendar.list.path] });
      toast({ title: "Event Created", description: "Calendar event has been added." });
    },
  });
}
