import { useForm } from "react-hook-form";
import { useLogin } from "./useAuth";

interface LoginForm {
  username: string;
  password: string;
}

export function LoginView() {
  const { register, handleSubmit } = useForm<LoginForm>({
    defaultValues: { username: "", password: "" },
  });
  const loginM = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent-soft/40 to-bg px-4">
      <div className="w-full max-w-[420px] rounded-xl border border-line-soft bg-white p-8 shadow-xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate">Admin · CMS</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">PBW · Beatrice Czekalla</h1>
        </div>
        <h2 className="mb-1 text-lg font-semibold text-ink">Anmelden</h2>
        <p className="mb-5 text-sm text-slate">
          Bitte melden Sie sich an, um die Website-Inhalte zu verwalten.
        </p>
        <form onSubmit={handleSubmit((data) => loginM.mutate(data))} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="username">
              Benutzername
            </label>
            <input
              id="username"
              className="field-input"
              autoComplete="username"
              {...register("username", { required: true })}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              className="field-input"
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
          </div>
          {loginM.isError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {loginM.error instanceof Error ? loginM.error.message : "Anmeldung fehlgeschlagen."}
            </div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loginM.isPending}>
            {loginM.isPending ? "Anmelden…" : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}
