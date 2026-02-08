import { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { useMajorApplications, useCreateMajorApplication } from "@/hooks/use-registrar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMajorApplicationSchema } from "@shared/schema";
import { StatusBadge } from "@/components/status-badge";
import { Building2, Loader2, Plus, ArrowRight } from "lucide-react";
import { z } from "zod";

const formSchema = insertMajorApplicationSchema.extend({
  studentId: z.coerce.number(),
});

export default function MajorApplications() {
  const { data: applications, isLoading } = useMajorApplications();
  const createApplication = useCreateMajorApplication();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 1, // Demo ID
      currentMajor: "Undeclared",
      requestedMajor: "",
      school: "",
      statement: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createApplication.mutateAsync(data);
    setOpen(false);
    form.reset();
  }

  return (
    <LayoutShell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Major Declaration</h1>
          <p className="text-muted-foreground mt-1">Apply for your major or request a transfer.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg">
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
                          <Input {...field} disabled />
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
                            <SelectTrigger>
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
                        <Input placeholder="e.g. Computer Science" {...field} />
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createApplication.isPending}>
                    {createApplication.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Application
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
          applications?.map((app) => (
            <Card key={app.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
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
                        <p className="text-sm text-muted-foreground mt-3 bg-muted/30 p-3 rounded-lg border border-border/50 max-w-xl italic">
                          "{app.statement}"
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {applications?.length === 0 && (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-lg">No Applications</h3>
            <p className="text-muted-foreground">You haven't submitted any major declarations yet.</p>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
