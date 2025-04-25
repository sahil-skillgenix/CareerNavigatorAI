import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Make the initial request
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Check for token refresh in response headers
  const newToken = res.headers.get('X-New-Token');
  if (newToken) {
    console.log('Received refreshed token from server');
    
    // Store the new token in localStorage if needed
    // localStorage.setItem('auth_token', newToken);
    
    // For cookie-based approach, the server should have set the cookie already
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
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        // Optional: Add Authorization header if token is stored in localStorage
        // "Authorization": `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    // Check for token refresh in response headers
    const newToken = res.headers.get('X-New-Token');
    if (newToken) {
      console.log('Received refreshed token from server during query');
      
      // Store the new token in localStorage if needed
      // localStorage.setItem('auth_token', newToken);
      
      // For cookie-based approach, the server should have set the cookie already
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
