import { useAuth } from "@/hooks/use-auth";
import { useDocumentRequests, usePetitions, useMajorApplications } from "@/hooks/use-registrar";
import LayoutShell from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { FileText, GraduationCap, CheckCircle, Plus, Building2, Clock } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: requests, isLoading: loadingRequests } = useDocumentRequests();
  const { data: petitions, isLoading: loadingPetitions } = usePetitions();
  const { data: majorApps, isLoading: loadingMajors } = useMajorApplications();

  const isLoading = loadingRequests || loadingPetitions || loadingMajors;

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </LayoutShell>
    );
  }

  const pendingRequests = requests?.filter((r: any) => !["completed", "rejected"].includes(r.status)) || [];
  const pendingPetitions = petitions?.filter((p: any) => !["approved", "rejected"].includes(p.status)) || [];
  const completedCount = (requests?.filter((r: any) => r.status === "completed").length || 0) +
    (petitions?.filter((p: any) => p.status === "approved").length || 0) +
    (majorApps?.filter((a: any) => a.status === "approved").length || 0);

  const roleLabel = user?.role === "admin" ? "Administrator" : user?.role === "instructor" ? "Instructor" : "Student";

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground" data-testid="text-welcome">
              Welcome back, <span className="text-primary">{user?.firstName || user?.fullName?.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {roleLabel} Dashboard - Here's your overview for today.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {user?.role === "student" && (
              <Link href="/requests">
                <Button data-testid="button-new-request">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </Link>
            )}
            {user?.role === "instructor" && (
              <Link href="/petitions">
                <Button data-testid="button-new-petition">
                  <Plus className="w-4 h-4 mr-2" />
                  New Petition
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(user?.role === "student" || user?.role === "admin") && (
            <Card>
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Requests</p>
                  <p className="text-3xl font-bold font-display" data-testid="text-active-requests">{pendingRequests.length}</p>
                </div>
                <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
          )}
          {(user?.role === "instructor" || user?.role === "admin") && (
            <Card>
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Petitions</p>
                  <p className="text-3xl font-bold font-display" data-testid="text-pending-petitions">{pendingPetitions.length}</p>
                </div>
                <div className="p-4 rounded-full bg-amber-50 dark:bg-amber-950">
                  <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold font-display" data-testid="text-completed">{completedCount}</p>
              </div>
              <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {(user?.role === "student" || user?.role === "admin") && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-xl">Recent Requests</CardTitle>
                  <CardDescription>{user?.role === "admin" ? "All document requests" : "Your document requests"}</CardDescription>
                </div>
                <Link href="/requests">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests?.slice(0, 4).map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50" data-testid={`card-request-${req.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-md border border-border">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm capitalize">{req.type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">{req.createdAt ? format(new Date(req.createdAt), "MMM d, yyyy") : ""}</p>
                        </div>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                  ))}
                  {(!requests || requests.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No requests found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {(user?.role === "instructor" || user?.role === "admin") && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-xl">Grade Petitions</CardTitle>
                  <CardDescription>{user?.role === "admin" ? "All grade change petitions" : "Your submitted petitions"}</CardDescription>
                </div>
                <Link href="/petitions">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {petitions?.slice(0, 4).map((petition: any) => (
                    <div key={petition.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50" data-testid={`card-petition-${petition.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-md border border-border">
                          <GraduationCap className="w-4 h-4 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{petition.courseCode}</p>
                          <p className="text-xs text-muted-foreground">{petition.currentGrade} → {petition.newGrade}</p>
                        </div>
                      </div>
                      <StatusBadge status={petition.status} />
                    </div>
                  ))}
                  {(!petitions || petitions.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No petitions found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {(user?.role === "student" || user?.role === "admin") && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-xl">Major Applications</CardTitle>
                  <CardDescription>{user?.role === "admin" ? "All major declarations" : "Your major declarations"}</CardDescription>
                </div>
                <Link href="/majors">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {majorApps?.slice(0, 4).map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50" data-testid={`card-major-${app.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-md border border-border">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{app.requestedMajor}</p>
                          <p className="text-xs text-muted-foreground">{app.school}</p>
                        </div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                  {(!majorApps || majorApps.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No major applications</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
