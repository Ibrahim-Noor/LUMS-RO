import { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { useDocumentRequests, useCreateDocumentRequest, useProcessPayment } from "@/hooks/use-registrar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDocumentRequestSchema } from "@shared/schema";
import { StatusBadge } from "@/components/status-badge";
import { FileText, CreditCard, Plus, Loader2 } from "lucide-react";
import { z } from "zod";

const formSchema = insertDocumentRequestSchema.extend({
  copies: z.coerce.number().min(1, "At least 1 copy is required"),
});

export default function DocumentRequests() {
  const { data: requests, isLoading } = useDocumentRequests();
  const createRequest = useCreateDocumentRequest();
  const processPayment = useProcessPayment();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "transcript",
      urgency: "normal",
      copies: 1,
      details: {}, // Empty JSON for simplicity
      userId: 0 // Will be ignored by backend as it takes from session
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createRequest.mutateAsync(data);
    setOpen(false);
    form.reset();
  }

  return (
    <LayoutShell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Document Requests</h1>
          <p className="text-muted-foreground mt-1">Order transcripts, degrees, and official letters.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg">
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
                          <SelectTrigger>
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
                            <SelectTrigger>
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
                          <Input type="number" {...field} min={1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={createRequest.isPending}>
                    {createRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests?.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg h-fit">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg capitalize font-display">
                      {request.type.replace('_', ' ')}
                    </CardTitle>
                    <CardDescription>
                      {request.copies} {request.copies === 1 ? 'copy' : 'copies'} • <span className="capitalize">{request.urgency}</span>
                    </CardDescription>
                  </div>
                </div>
                <StatusBadge status={request.status} />
              </CardHeader>
              <CardContent>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Payment</p>
                    {request.payment ? (
                      <StatusBadge status={request.payment.status} className="mt-1" />
                    ) : (
                      <span className="text-sm font-medium text-amber-600 mt-1 block">Pending Payment</span>
                    )}
                  </div>
                  
                  {!request.payment && (
                     <Button 
                      size="sm" 
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/5"
                      onClick={() => processPayment.mutate({
                        requestId: request.id,
                        amount: request.urgency === 'urgent' ? 2000 : 1000,
                        method: 'online'
                      })}
                      disabled={processPayment.isPending}
                    >
                      <CreditCard className="w-3 h-3 mr-2" />
                      Pay Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {requests?.length === 0 && (
            <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-lg">No Requests Yet</h3>
              <p className="text-muted-foreground">Start by creating a new document request above.</p>
            </div>
          )}
        </div>
      )}
    </LayoutShell>
  );
}
