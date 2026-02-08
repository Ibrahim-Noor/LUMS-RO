import { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { useAuth } from "@/hooks/use-auth";
import { useCalendarEvents, useCreateCalendarEvent } from "@/hooks/use-registrar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon, Clock, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["holiday", "exam", "deadline", "event"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export default function CalendarPage() {
  const { user } = useAuth();
  const { data: events, isLoading } = useCalendarEvents();
  const createEvent = useCreateCalendarEvent();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "event",
      startDate: new Date(),
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createEvent.mutateAsync(data as any);
    setOpen(false);
    form.reset();
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'holiday': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800';
      case 'exam': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800';
      case 'deadline': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800';
    }
  };

  const getTypeBorderColor = (type: string) => {
    switch(type) {
      case 'holiday': return '#ef4444';
      case 'exam': return '#f59e0b';
      case 'deadline': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <LayoutShell>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-page-title">Academic Calendar</h1>
          <p className="text-muted-foreground mt-1">Key dates, deadlines, and holidays.</p>
        </div>
        
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-event">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Calendar Event</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Midterm Exams" {...field} data-testid="input-event-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description" {...field} data-testid="input-event-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-event-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="event">General Event</SelectItem>
                              <SelectItem value="holiday">Holiday</SelectItem>
                              <SelectItem value="exam">Exam</SelectItem>
                              <SelectItem value="deadline">Deadline</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''} 
                              onChange={(e) => field.onChange(new Date(e.target.value))} 
                              data-testid="input-event-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={createEvent.isPending} data-testid="button-submit-event">
                      {createEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Add Event
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          events?.map((event: any) => (
            <Card key={event.id} className="relative" style={{ borderLeftWidth: '4px', borderLeftColor: getTypeBorderColor(event.type) }} data-testid={`card-event-${event.id}`}>
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <CalendarIcon className="w-24 h-24" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider border ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                <CardTitle className="mt-2 text-xl font-display">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-muted-foreground mt-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium">{format(new Date(event.startDate), "EEEE, MMMM do, yyyy")}</span>
                </div>
                {event.description && (
                  <p className="mt-3 text-sm text-muted-foreground/80 line-clamp-2">{event.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {(!events || events.length === 0) && !isLoading && (
        <div className="text-center py-12 bg-muted/20 rounded-md border border-dashed border-border">
          <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-lg">No Events</h3>
          <p className="text-muted-foreground">No academic calendar events found.</p>
        </div>
      )}
    </LayoutShell>
  );
}
