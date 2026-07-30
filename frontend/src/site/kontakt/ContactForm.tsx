import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitContact } from "../../lib/api";
import { useToast } from "../../admin/components/ToastProvider";
import { IconSend } from "../components/Icons";

// Caps mirror the column sizes / server validation in the backend.
const schema = z.object({
  name: z.string().trim().min(1, "Bitte geben Sie Ihren Namen ein.").max(200),
  email: z
    .string()
    .trim()
    .min(1, "Bitte geben Sie Ihre E-Mail an.")
    .max(320)
    .email("Bitte eine gültige E-Mail-Adresse angeben."),
  phone: z.string().trim().max(80),
  subject: z.string().trim().max(300),
  message: z.string().trim().min(1, "Bitte schreiben Sie eine Nachricht.").max(5000),
  // Purely client-side gate — not part of the API payload (see onSubmit).
  privacy: z.boolean().refine((v) => v === true, {
    message: "Bitte stimmen Sie der Verarbeitung Ihrer Daten zu.",
  }),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const [params] = useSearchParams();
  const kurs = params.get("kurs");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: kurs ? `Anmeldung: ${kurs}` : "",
      message: "",
      privacy: false,
    },
  });

  async function onSubmit({ privacy: _privacy, ...payload }: FormValues) {
    try {
      await submitContact(payload);
      setSent(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Senden fehlgeschlagen.", "error");
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white p-10 shadow-soft max-[900px]:p-6">
      <h2 className="mb-8 text-[24px] font-bold text-ink">Schreiben Sie mir</h2>

      {sent ? (
        <div className="rounded-lg border border-line bg-bg-alt p-6 text-[15px] leading-[1.6]">
          <p className="font-semibold text-navy">✓ Vielen Dank!</p>
          <p className="mt-1 text-text">Ihre Nachricht ist eingegangen – ich melde mich zeitnah bei Ihnen.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
            <Field label="Name" error={errors.name?.message}>
              <input className="field-input" placeholder="Ihr Name" {...register("name")} />
            </Field>
            <Field label="E-Mail" error={errors.email?.message}>
              <input
                type="email"
                className="field-input"
                placeholder="ihre.email@beispiel.de"
                {...register("email")}
              />
            </Field>
          </div>
          <Field label="Telefon (optional)" error={errors.phone?.message}>
            <input type="tel" className="field-input" placeholder="+49 (0) 123 456789" {...register("phone")} />
          </Field>
          <Field label="Betreff / Anliegen" error={errors.subject?.message}>
            <input className="field-input" placeholder="Worum geht es in Ihrer Anfrage?" {...register("subject")} />
          </Field>
          <Field label="Ihre Nachricht" error={errors.message?.message}>
            <textarea
              className="field-input min-h-[140px] resize-y"
              placeholder="Wie kann ich Sie unterstützen?"
              {...register("message")}
            />
          </Field>
          <div className="pt-1">
            <label className="flex items-start gap-3 text-[14px] leading-[1.5] text-text">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
                {...register("privacy")}
              />
              <span>
                Ich stimme zu, dass meine Daten gemäß der{" "}
                <a
                  href="/datenschutz"
                  target="_blank"
                  rel="noreferrer"
                  className="text-navy underline underline-offset-2 hover:text-navy-deep"
                >
                  Datenschutzerklärung
                </a>{" "}
                verarbeitet werden.
              </span>
            </label>
            {errors.privacy && <p className="mt-1 text-sm text-red-700">{errors.privacy.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 inline-flex items-center gap-2.5 rounded-md bg-navy px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-deep active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4"
          >
            <IconSend />
            {isSubmitting ? "Senden…" : "Nachricht senden"}
          </button>
        </form>
      )}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
