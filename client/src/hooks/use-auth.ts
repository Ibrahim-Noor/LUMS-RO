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

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

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
