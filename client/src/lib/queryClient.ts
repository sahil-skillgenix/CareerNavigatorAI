import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Function to get the stored token
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Function to set the auth token
export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Prepare headers
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {})
  };
  
  // Add authorization header if token exists
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Make the request
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Check for token refresh in response headers
  const newToken = res.headers.get('X-New-Token');
  if (newToken) {
    console.log('Received refreshed token from server');
    setAuthToken(newToken);
  }
  
  // Check if we got a token in the response body for login/register
  if (res.ok && (url === '/api/login' || url === '/api/register')) {
    try {
      // Clone the response before reading it
      const clonedRes = res.clone();
      const data = await clonedRes.json();
      if (data.token) {
        console.log('Received auth token from login/register');
        setAuthToken(data.token);
      }
    } catch (error) {
      console.error('Error extracting token from response:', error);
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Prepare headers with auth token if available
    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    // Check for token refresh in response headers
    const newToken = res.headers.get('X-New-Token');
    if (newToken) {
      console.log('Received refreshed token from server during query');
      setAuthToken(newToken);
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
