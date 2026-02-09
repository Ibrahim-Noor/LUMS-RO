import { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { useAuth } from "@/hooks/use-auth";
import { useDocumentRequests, useCreateDocumentRequest, useProcessPayment, useUpdateDocumentRequestStatus } from "@/hooks/use-registrar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatusBadge } from "@/components/status-badge";
import { FileText, CreditCard, Plus, Loader2, CheckCircle, XCircle } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  type: z.enum(["transcript", "degree", "letter", "duplicate_degree"]),
  urgency: z.enum(["normal", "urgent"]),
  copies: z.coerce.number().min(1, "At least 1 copy is required"),
});

export default function DocumentRequests() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useDocumentRequests();
  const createRequest = useCreateDocumentRequest();
  const processPayment = useProcessPayment();
  const updateStatus = useUpdateDocumentRequestStatus();
  const [open, setOpen] = useState(false);
  const [adminDialogId, setAdminDialogId] = useState<number | null>(null);
  const [adminComment, setAdminComment] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "transcript",
      urgency: "normal",
      copies: 1,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createRequest.mutateAsync(data);
    setOpen(false);
    form.reset();
  }

  async function handleAdminAction(id: number, status: string) {
    await updateStatus.mutateAsync({ id, status, adminComment });
    setAdminDialogId(null);
    setAdminComment("");
  }

  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";

  return (
    <LayoutShell>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-page-title">Document Requests</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Review and manage all document requests." : "Order transcripts, degrees, and official letters."}
          </p>
        </div>
        
        {isStudent && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-request">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request Document</DialogTitle>
                <DialogDescription>Fill out the details below. Fees will be calculated based on urgency.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-doc-type">
                              <SelectValue placeholder="Select document" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="transcript">Official Transcript</SelectItem>
                            <SelectItem value="degree">Degree Certificate</SelectItem>
                            <SelectItem value="letter">Character Certificate</SelectItem>
                            <SelectItem value="duplicate_degree">Duplicate Degree</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-urgency">
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="normal">Normal (5-7 days)</SelectItem>
                              <SelectItem value="urgent">Urgent (24 hours)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="copies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Copies</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={1} data-testid="input-copies" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createRequest.isPending} data-testid="button-submit-request">
                      {createRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Request
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests?.map((request: any) => (
            <Card key={request.id} data-testid={`card-request-${request.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded-md h-fit">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg capitalize font-display">
                      {request.type.replace('_', ' ')}
                    </CardTitle>
                    <CardDescription>
                      {request.copies} {request.copies === 1 ? 'copy' : 'copies'} &middot; <span className="capitalize">{request.urgency}</span>
                    </CardDescription>
                  </div>
                </div>
                <StatusBadge status={request.status} />
              </CardHeader>
              <CardContent>
                {request.adminComment && (
                  <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md mb-4 italic">
                    Admin: {request.adminComment}
                  </div>
                )}
                <div className="mt-2 pt-4 border-t border-border flex items-center justify-between flex-wrap gap-2">
                  {isStudent && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Payment</p>
                      {request.payment ? (
                        <StatusBadge status={request.payment.status} className="mt-1" />
                      ) : (
                        <span className="text-sm font-medium text-amber-600 mt-1 block">Pending Payment</span>
                      )}
                    </div>
                  )}
                  
                  {isStudent && !request.payment && (request.status === "submitted" || request.status === "payment_pending") && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => processPayment.mutate({
                        requestId: request.id,
                        amount: request.urgency === 'urgent' ? 2000 : 1000,
                        method: 'online'
                      })}
                      disabled={processPayment.isPending}
                      data-testid={`button-pay-${request.id}`}
                    >
                      <CreditCard className="w-3 h-3 mr-2" />
                      Pay Now
                    </Button>
                  )}

                  {isAdmin && request.status === "pending_approval" && (
                    <div className="flex gap-2 w-full">
                      <Button 
                        size="sm" 
                        onClick={() => handleAdminAction(request.id, "approved")}
                        disabled={updateStatus.isPending}
                        data-testid={`button-approve-${request.id}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-destructive/20 text-destructive"
                        onClick={() => setAdminDialogId(request.id)}
                        data-testid={`button-reject-${request.id}`}
                      >
                        <XCircle className="w-3 h-3 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {(!requests || requests.length === 0) && (
            <div className="col-span-full text-center py-12 bg-muted/20 rounded-md border border-dashed border-border">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-lg">No Requests Yet</h3>
              <p className="text-muted-foreground">
                {isStudent ? "Start by creating a new document request above." : "No document requests to review."}
              </p>
            </div>
          )}
        </div>
      )}

      <Dialog open={adminDialogId !== null} onOpenChange={() => setAdminDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this request.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            className="min-h-[80px]"
            data-testid="input-admin-comment"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogId(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => adminDialogId && handleAdminAction(adminDialogId, "rejected")}
              disabled={updateStatus.isPending}
              data-testid="button-confirm-reject"
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LayoutShell>
  );
}
