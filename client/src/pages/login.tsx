import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login({ username, password });
      setLocation("/");
    } catch (err: any) {
      const msg = err?.message || "Login failed";
      if (msg.includes("401")) {
        setError("Invalid username or password");
      } else {
        setError(msg);
      }
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <Building2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold font-display text-primary" data-testid="text-app-title">LUMS Registrar Office</CardTitle>
          <CardDescription>
            Sign in to access the Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="input-username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md" data-testid="text-login-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoggingIn}
              data-testid="button-login"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground text-center mb-3">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setUsername("student"); setPassword("student123"); }}
                className="p-2 rounded-md bg-muted/50 text-center hover-elevate cursor-pointer"
                data-testid="button-demo-student"
              >
                <div className="font-semibold">Student</div>
                <div className="text-muted-foreground">student</div>
              </button>
              <button
                type="button"
                onClick={() => { setUsername("instructor"); setPassword("instructor123"); }}
                className="p-2 rounded-md bg-muted/50 text-center hover-elevate cursor-pointer"
                data-testid="button-demo-instructor"
              >
                <div className="font-semibold">Instructor</div>
                <div className="text-muted-foreground">instructor</div>
              </button>
              <button
                type="button"
                onClick={() => { setUsername("admin"); setPassword("admin123"); }}
                className="p-2 rounded-md bg-muted/50 text-center hover-elevate cursor-pointer"
                data-testid="button-demo-admin"
              >
                <div className="font-semibold">Admin</div>
                <div className="text-muted-foreground">admin</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Authorized personnel only. Contact helpdesk for access issues.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
