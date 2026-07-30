import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router";
import { ToastProvider } from "./admin/components/ToastProvider";
import { ConsentProvider } from "./site/consent/ConsentContext";
import { ApiError } from "./lib/api";
import "./index.css";

// Centralised 401 handling: if any mutation comes back unauthenticated, drop the
// cached auth state so RequireAuth falls back to the login screen.
let queryClient!: QueryClient;
const mutationCache = new MutationCache({
  onError: (error) => {
    if (error instanceof ApiError && error.status === 401) {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  },
});
queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConsentProvider>
          <RouterProvider router={router} />
        </ConsentProvider>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>
);
