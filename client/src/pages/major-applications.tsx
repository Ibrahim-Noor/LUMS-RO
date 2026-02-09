import { useState, useMemo, useEffect } from "react";
import LayoutShell from "@/components/layout-shell";
import { useAuth } from "@/hooks/use-auth";
import { useMajorApplications, useCreateMajorApplication, useUpdateMajorApplicationStatus } from "@/hooks/use-registrar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatusBadge } from "@/components/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Building2, Loader2, Plus, ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  currentMajor: z.string().default("Undeclared"),
  requestedMajor: z.string().min(1, "Requested major is required"),
  school: z.string().min(1, "School is required"),
  statement: z.string().optional(),
});

export default function MajorApplications() {
  const { user } = useAuth();
  const { data: applications, isLoading } = useMajorApplications();
  const createApplication = useCreateMajorApplication();
  const updateStatus = useUpdateMajorApplicationStatus();
  const [open, setOpen] = useState(false);
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [adminComment, setAdminComment] = useState("");

  const currentMajor = useMemo(() => {
    if (!applications || applications.length === 0) return "Undeclared";
    const approved = applications
      .filter((app: any) => app.status === "approved")
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return approved.length > 0 ? approved[0].requestedMajor : "Undeclared";
  }, [applications]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentMajor: "Undeclared",
      requestedMajor: "",
      school: "",
      statement: "",
    },
  });

  useEffect(() => {
    form.setValue("currentMajor", currentMajor);
  }, [currentMajor, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createApplication.mutateAsync(data);
    setOpen(false);
    form.reset({ currentMajor, requestedMajor: "", school: "", statement: "" });
  }

  async function handleAdminAction(id: number, status: string) {
    await updateStatus.mutateAsync({ id, status, adminComment });
    setRejectDialogId(null);
    setAdminComment("");
  }

  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";

  const hasPendingApplication = useMemo(() => {
    if (!applications) return false;
    const pendingStatuses = ["submitted", "pending_approval"];
    return applications.some((a: any) => pendingStatuses.includes(a.status));
  }, [applications]);

  return (
    <LayoutShell>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-page-title">Major Declaration</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Review and manage major declaration applications." : "Apply for your major or request a transfer."}
          </p>
        </div>
        
        {isStudent && (
          hasPendingApplication ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button disabled data-testid="button-declare-major">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Declare Major
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>You have a pending declaration. Wait until it's resolved.</p>
              </TooltipContent>
            </Tooltip>
          ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-declare-major">
                <Plus className="w-4 h-4 mr-2" />
                Declare Major
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Major Declaration Form</DialogTitle>
                <DialogDescription>
                  Select your intended school and major. A personal statement helps your case.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentMajor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Major</FormLabel>
                          <FormControl>
                            <Input {...field} disabled data-testid="input-current-major" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="school"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-school">
                                <SelectValue placeholder="Select School" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SSE">SSE (Science & Engineering)</SelectItem>
                              <SelectItem value="SDSB">SDSB (Business)</SelectItem>
                              <SelectItem value="HSS">HSS (Humanities)</SelectItem>
                              <SelectItem value="SAHSOL">SAHSOL (Law)</SelectItem>
                              <SelectItem value="SOE">SOE (Education)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="requestedMajor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Major</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Computer Science" {...field} data-testid="input-requested-major" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="statement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Statement (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Why do you want to choose this major?" 
                            className="min-h-[100px]"
                            {...field} 
                            value={field.value || ''}
                            data-testid="input-statement"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={createApplication.isPending} data-testid="button-submit-major">
                      {createApplication.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Application
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          )
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          applications?.map((app: any) => (
            <Card key={app.id} data-testid={`card-major-${app.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-md text-primary">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display">{app.school} - {app.requestedMajor}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>From: <span className="font-medium text-foreground">{app.currentMajor || 'Undeclared'}</span></span>
                        <ArrowRight className="w-3 h-3" />
                        <span>To: <span className="font-medium text-primary">{app.requestedMajor}</span></span>
                      </div>
                      {app.statement && (
                        <p className="text-sm text-muted-foreground mt-3 bg-muted/30 p-3 rounded-md border border-border/50 max-w-xl italic">
                          "{app.statement}"
                        </p>
                      )}
                      {app.adminComment && (
                        <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md mt-2 italic">
                          Admin: {app.adminComment}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={app.status} />
                    {isAdmin && app.status === "submitted" && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm"
                          onClick={() => handleAdminAction(app.id, "approved")}
                          disabled={updateStatus.isPending}
                          data-testid={`button-approve-${app.id}`}
                        >
                          <CheckCircle className="w-3 h-3 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-destructive/20 text-destructive"
                          onClick={() => setRejectDialogId(app.id)}
                          data-testid={`button-reject-${app.id}`}
                        >
                          <XCircle className="w-3 h-3 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {(!applications || applications.length === 0) && !isLoading && (
          <div className="text-center py-12 bg-muted/20 rounded-md border border-dashed border-border">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-lg">No Applications</h3>
            <p className="text-muted-foreground">
              {isStudent ? "You haven't submitted any major declarations yet." : "No applications to review."}
            </p>
          </div>
        )}
      </div>

      <Dialog open={rejectDialogId !== null} onOpenChange={() => setRejectDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this application.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            className="min-h-[80px]"
            data-testid="input-reject-comment"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogId(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => rejectDialogId && handleAdminAction(rejectDialogId, "rejected")}
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
