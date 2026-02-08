import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <Building2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold font-display text-primary">LUMS Registrar Office</CardTitle>
          <CardDescription>
            Management System for Students & Faculty
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <Button 
            onClick={handleLogin}
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            Log in with Replit
          </Button>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Authorized personnel only. Contact helpdesk for access issues.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
