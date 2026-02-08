import { useAuth } from "@/hooks/use-auth";
import { useDocumentRequests, usePetitions } from "@/hooks/use-registrar";
import LayoutShell from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { FileText, GraduationCap, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: requests, isLoading: loadingRequests } = useDocumentRequests();
  const { data: petitions, isLoading: loadingPetitions } = usePetitions();

  if (loadingRequests || loadingPetitions) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </LayoutShell>
    );
  }

  // Filter pending items based on role
  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const myPetitions = petitions?.filter(p => p.studentId === user?.id) || [];
  
  const stats = [
    { label: "Active Requests", value: pendingRequests.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Petitions", value: myPetitions.filter(p => p.status === "submitted").length, icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completed Items", value: (requests?.filter(r => r.status === "completed").length || 0), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <LayoutShell>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome back, <span className="text-primary">{user?.fullName?.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your academic records today.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/requests">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: stat.color.replace('text-', '') }}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold font-display">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-full ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Document Requests */}
          <Card className="border-t-4 border-t-primary shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Recent Requests</CardTitle>
                <CardDescription>Your latest document applications</CardDescription>
              </div>
              <Link href="/requests">
                <Button variant="ghost" size="sm" className="text-primary">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests?.slice(0, 4).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-md border border-border">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm capitalize">{req.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(req.createdAt!), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                ))}
                {requests?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No requests found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions / Petitions */}
          <Card className="border-t-4 border-t-secondary shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Grade Petitions</CardTitle>
                <CardDescription>Status of your grade change requests</CardDescription>
              </div>
              <Link href="/petitions">
                <Button variant="ghost" size="sm" className="text-secondary-foreground">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {petitions?.slice(0, 4).map((petition) => (
                  <div key={petition.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-md border border-border">
                        <GraduationCap className="w-4 h-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{petition.courseCode}</p>
                        <p className="text-xs text-muted-foreground">Requested: {petition.requestedGrade}</p>
                      </div>
                    </div>
                    <StatusBadge status={petition.status} />
                  </div>
                ))}
                 {petitions?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No petitions found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutShell>
  );
}
