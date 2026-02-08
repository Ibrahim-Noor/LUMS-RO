import { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { useCalendarEvents, useCreateCalendarEvent } from "@/hooks/use-registrar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCalendarEventSchema } from "@shared/schema";
import { Calendar as CalendarIcon, Clock, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

const formSchema = insertCalendarEventSchema.extend({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export default function CalendarPage() {
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
    await createEvent.mutateAsync(data);
    setOpen(false);
    form.reset();
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'holiday': return 'bg-red-100 text-red-700 border-red-200';
      case 'exam': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'deadline': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <LayoutShell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Academic Calendar</h1>
          <p className="text-muted-foreground mt-1">Key dates, deadlines, and holidays.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg">
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
                        <Input placeholder="e.g. Midterm Exams" {...field} />
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
                            <SelectTrigger>
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
                          <Input type="date" {...field} value={field.value ? format(field.value, 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={createEvent.isPending}>
                    {createEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add Event
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          events?.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-all duration-300 border-l-4 overflow-hidden relative" style={{ borderLeftColor: event.type === 'holiday' ? '#ef4444' : event.type === 'exam' ? '#f59e0b' : '#10b981' }}>
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <CalendarIcon className="w-24 h-24" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${getTypeColor(event.type)}`}>
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
    </LayoutShell>
  );
}
