import type { ReactNode } from "react";
import { useMe } from "./useAuth";
import { LoginView } from "./LoginView";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMe();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate">Lädt…</div>;
  }
  if (!data?.authed) {
    return <LoginView />;
  }
  return <>{children}</>;
}
