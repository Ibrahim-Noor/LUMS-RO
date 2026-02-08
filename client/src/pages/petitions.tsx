import { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { usePetitions, useCreatePetition } from "@/hooks/use-registrar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPetitionSchema } from "@shared/schema";
import { StatusBadge } from "@/components/status-badge";
import { GraduationCap, ArrowRight, Loader2, Plus } from "lucide-react";
import { z } from "zod";

const formSchema = insertPetitionSchema.extend({
  studentId: z.coerce.number(),
  instructorId: z.coerce.number(),
});

export default function Petitions() {
  const { data: petitions, isLoading } = usePetitions();
  const createPetition = useCreatePetition();
  const [open, setOpen] = useState(false);

  // Hardcoding IDs for demo purposes since we don't have a full user selector UI
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 1, // Demo ID
      instructorId: 2, // Demo ID
      courseCode: "",
      semester: "Fall 2024",
      currentGrade: "",
      requestedGrade: "",
      reason: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createPetition.mutateAsync(data);
    setOpen(false);
    form.reset();
  }

  return (
    <LayoutShell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Grade Change Petitions</h1>
          <p className="text-muted-foreground mt-1">Submit and track grade change requests.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Petition
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Grade Change Petition</DialogTitle>
              <DialogDescription>
                This request will be forwarded to your instructor, then department chair, and finally the registrar.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. CS 100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Fall 2024" {...field} />
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
                          <Input placeholder="e.g. B+" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requestedGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Grade</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. A-" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Change</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please explain why the grade change is justified..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createPetition.isPending}>
                    {createPetition.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Petition
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          petitions?.map((petition) => (
            <Card key={petition.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary/10 rounded-xl text-secondary-foreground">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display">{petition.courseCode} <span className="text-muted-foreground font-normal text-sm ml-2">{petition.semester}</span></h3>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="font-semibold text-muted-foreground">{petition.currentGrade}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-bold text-primary">{petition.requestedGrade}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xl">{petition.reason}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={petition.status} />
                    <span className="text-xs text-muted-foreground">ID: #{petition.id}</span>
                  </div>
                </div>
                
                {/* Workflow Stepper Visual */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10"></div>
                    {['Submitted', 'Dept Approval', 'Dean Approval', 'Registrar'].map((step, idx) => {
                      const isActive = idx === 0 || 
                        (petition.status.includes('dept') && idx <= 1) ||
                        (petition.status.includes('dean') && idx <= 2) ||
                        (petition.status.includes('registrar') && idx <= 3);
                        
                      return (
                        <div key={step} className="flex flex-col items-center gap-2 bg-card px-2">
                          <div className={`w-3 h-3 rounded-full border-2 ${isActive ? 'bg-primary border-primary' : 'bg-background border-muted'}`} />
                          <span className={isActive ? 'text-foreground font-medium' : ''}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </LayoutShell>
  );
}
