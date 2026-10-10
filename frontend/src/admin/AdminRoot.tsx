import { RequireAuth } from "./auth/RequireAuth";
import { AdminLayout } from "./AdminLayout";

// Entry of the lazily loaded admin chunk (see router.tsx): auth gate + layout.
export function AdminRoot() {
  return (
    <RequireAuth>
      <AdminLayout />
    </RequireAuth>
  );
}
