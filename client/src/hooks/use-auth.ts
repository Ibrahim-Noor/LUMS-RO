import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, setAccessToken, getAccessToken } from "@/lib/queryClient";

type AuthUser = {
  id: string;
  email: string | null;
  username: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  role: "student" | "instructor" | "admin";
  isActive: boolean;
  studentId: string | null;
  department: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const TOKEN_REFRESH_INTERVAL = 20 * 60 * 1000;

async function refreshToken(): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    setAccessToken(data.access_token);
    return true;
  } catch {
    return false;
  }
}

async function fetchUser(): Promise<AuthUser | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  const response = await fetch("/api/auth/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const retryResponse = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${getAccessToken()!}`,
        },
      });
      if (retryResponse.ok) {
        return retryResponse.json();
      }
    }
    setAccessToken(null);
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (user && getAccessToken()) {
      refreshIntervalRef.current = setInterval(() => {
        refreshToken();
      }, TOKEN_REFRESH_INTERVAL);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await res.json();
      setAccessToken(data.access_token);
      return data.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/auth/user"], userData);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
      setAccessToken(null);
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
