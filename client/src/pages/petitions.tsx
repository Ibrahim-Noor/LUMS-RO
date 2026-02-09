import { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { useAuth } from "@/hooks/use-auth";
import { usePetitions, useCreatePetition, useUpdatePetitionStatus } from "@/hooks/use-registrar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatusBadge } from "@/components/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GraduationCap, ArrowRight, Loader2, Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  courseCode: z.string().min(1, "Course code is required"),
  currentGrade: z.string().min(1, "Current grade is required"),
  newGrade: z.string().min(1, "New grade is required"),
  justification: z.string().min(1, "Justification is required"),
});

export default function Petitions() {
  const { user } = useAuth();
  const { data: petitions, isLoading } = usePetitions();
  const createPetition = useCreatePetition();
  const updateStatus = useUpdatePetitionStatus();
  const [open, setOpen] = useState(false);
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [adminComment, setAdminComment] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      courseCode: "",
      currentGrade: "",
      newGrade: "",
      justification: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createPetition.mutateAsync(data);
    setOpen(false);
    form.reset();
  }

  async function handleAdminAction(id: number, status: string) {
    await updateStatus.mutateAsync({ id, status, adminComment });
    setRejectDialogId(null);
    setAdminComment("");
  }

  const isInstructor = user?.role === "instructor";
  const isAdmin = user?.role === "admin";

  return (
    <LayoutShell>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-page-title">Grade Change Petitions</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Review and approve grade change petitions." : "Submit grade change requests for admin approval."}
          </p>
        </div>
        
        {isInstructor && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-petition">
                <Plus className="w-4 h-4 mr-2" />
                New Petition
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Grade Change Petition</DialogTitle>
                <DialogDescription>
                  Submit a grade change request. The admin will review and approve or reject it.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 24100001" {...field} data-testid="input-student-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="courseCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. CS 100" {...field} data-testid="input-course-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Grade</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. B+" {...field} data-testid="input-current-grade" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proposed New Grade</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. A-" {...field} data-testid="input-new-grade" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="justification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Justification</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Explain why the grade change is justified..." 
                            className="min-h-[100px]"
                            {...field} 
                            data-testid="input-justification"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createPetition.isPending} data-testid="button-submit-petition">
                      {createPetition.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Petition
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          petitions?.map((petition: any) => (
            <Card key={petition.id} data-testid={`card-petition-${petition.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary/10 rounded-md text-secondary-foreground">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display">{petition.courseCode}</h3>
                      <p className="text-xs text-muted-foreground">Student ID: {petition.studentId}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="font-semibold text-muted-foreground">{petition.currentGrade}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-bold text-primary">{petition.newGrade}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xl">{petition.justification}</p>
                      {petition.adminComment && (
                        <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md mt-2 italic">
                          Admin: {petition.adminComment}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={petition.status} />
                    {isAdmin && petition.status === "submitted" && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm"
                          onClick={() => handleAdminAction(petition.id, "approved")}
                          disabled={updateStatus.isPending}
                          data-testid={`button-approve-${petition.id}`}
                        >
                          <CheckCircle className="w-3 h-3 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-destructive/20 text-destructive"
                          onClick={() => setRejectDialogId(petition.id)}
                          data-testid={`button-reject-${petition.id}`}
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
        {(!petitions || petitions.length === 0) && !isLoading && (
          <div className="text-center py-12 bg-muted/20 rounded-md border border-dashed border-border">
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-lg">No Petitions</h3>
            <p className="text-muted-foreground">
              {isInstructor ? "Submit your first grade change petition." : "No petitions to review."}
            </p>
          </div>
        )}
      </div>

      <Dialog open={rejectDialogId !== null} onOpenChange={() => setRejectDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Petition</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this petition.</DialogDescription>
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
