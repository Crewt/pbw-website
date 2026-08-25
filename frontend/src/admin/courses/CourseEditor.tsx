import type { ReactNode } from "react";
import { Controller, useFieldArray, useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Course, CoursePayload } from "../../lib/types";
import { useCourseMutations } from "../hooks/useCourses";
import { useToast } from "../components/ToastProvider";
import { Drawer } from "../components/Drawer";
import { ImageUpload } from "../components/ImageUpload";
import { slugify } from "../lib/slugify";
import { SERVICE_SLOTS } from "../../lib/serviceSlots";

const schema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Bitte geben Sie einen Titel ein."),
  subtitle: z.string(),
  description: z.string(),
  cost: z.string(),
  slug: z.string(),
  image: z.string(),
  isAusbildungskurs: z.boolean(),
  isBildungsurlaub: z.boolean(),
  termine: z.array(
    z.object({ date: z.string(), endDate: z.string(), name: z.string(), description: z.string() })
  ),
  includes: z.array(z.object({ value: z.string() })),
  enables: z.array(z.object({ value: z.string() })),
  homepageSlots: z.array(z.string()),
  arbeitsweise: z.string(),
  useNameWording: z.boolean(),
  nameInSentence: z.string(),
});
type FormValues = z.infer<typeof schema>;

function toForm(course: Course | null): FormValues {
  if (!course) {
    return {
      id: undefined,
      title: "",
      subtitle: "",
      description: "",
      cost: "",
      slug: "",
      image: "",
      isAusbildungskurs: false,
      isBildungsurlaub: false,
      termine: [],
      includes: [{ value: "" }],
      enables: [{ value: "" }],
      homepageSlots: [],
      arbeitsweise: "",
      useNameWording: false,
      nameInSentence: "",
    };
  }
  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    cost: course.cost,
    slug: course.slug,
    image: course.image,
    isAusbildungskurs: course.isAusbildungskurs,
    isBildungsurlaub: course.isBildungsurlaub,
    termine: course.termine.map((t) => ({
      date: t.date,
      endDate: t.endDate ?? "",
      name: t.name,
      description: t.description ?? "",
    })),
    includes: (course.includes.length ? course.includes : [""]).map((value) => ({ value })),
    enables: (course.enables.length ? course.enables : [""]).map((value) => ({ value })),
    homepageSlots: course.homepageSlots ?? [],
    arbeitsweise: course.arbeitsweise ?? "",
    useNameWording: course.useNameWording ?? false,
    nameInSentence: course.nameInSentence ?? "",
  };
}

export function CourseEditor({ course, onClose }: { course: Course | null; onClose: () => void }) {
  const { save, remove } = useCourseMutations();
  const toast = useToast();
  const editing = course !== null;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toForm(course) });

  // Drives the "Seminar" vs "Ausbildungskurs" wording in the labels below and,
  // via the saved flag, on the public detail page.
  const isKurs = watch("isAusbildungskurs");
  const enablesLabel = isKurs ? "Der Ausbildungskurs ermöglicht Ihnen…" : "Das Seminar ermöglicht Ihnen…";
  const useName = watch("useNameWording");

  const termine = useFieldArray({ control, name: "termine" });
  const includes = useFieldArray({ control, name: "includes" });
  const enables = useFieldArray({ control, name: "enables" });

  async function onSubmit(data: FormValues) {
    const payload: CoursePayload = {
      id: data.id || undefined,
      title: data.title.trim(),
      subtitle: data.subtitle.trim(),
      description: data.description.trim(),
      cost: data.cost.trim(),
      slug: data.slug.trim() || slugify(data.title),
      image: data.image,
      isAusbildungskurs: data.isAusbildungskurs,
      isBildungsurlaub: data.isBildungsurlaub,
      termine: data.termine
        .map((t) => ({
          date: t.date,
          endDate: t.endDate.trim() || undefined,
          name: t.name.trim(),
          description: t.description.trim() || undefined,
        }))
        .filter((t) => t.date || t.name),
      includes: data.includes.map((i) => i.value.trim()).filter(Boolean),
      enables: data.enables.map((e) => e.value.trim()).filter(Boolean),
      homepageSlots: data.homepageSlots,
      arbeitsweise: data.arbeitsweise.trim(),
      useNameWording: data.useNameWording,
      nameInSentence: data.nameInSentence.trim(),
    };
    try {
      await save.mutateAsync(payload);
      toast("Gespeichert");
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Speichern fehlgeschlagen", "error");
    }
  }

  async function handleDelete() {
    if (!course) return;
    if (!window.confirm(`Kurs „${course.title}“ wirklich löschen?`)) return;
    try {
      await remove.mutateAsync(course.id);
      toast("Kurs gelöscht");
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Löschen fehlgeschlagen", "error");
    }
  }

  return (
    <Drawer
      open
      title={editing ? "Kurs bearbeiten" : "Neuer Kurs"}
      onClose={onClose}
      footer={
        <>
          {editing && (
            <button type="button" className="btn-danger" onClick={handleDelete}>
              Löschen
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Abbrechen
            </button>
            <button type="submit" form="course-form" className="btn-primary" disabled={save.isPending}>
              {save.isPending ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </>
      }
    >
      <form id="course-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="field-label">Titel</label>
          <input className="field-input" {...register("title")} />
          {errors.title && <p className="mt-1 text-sm text-red-700">{errors.title.message}</p>}
        </div>
        <div>
          <label className="field-label">Untertitel</label>
          <input className="field-input" {...register("subtitle")} />
        </div>
        <div>
          <label className="field-label">Beschreibung</label>
          <textarea className="field-input min-h-24" {...register("description")} />
          <p className="mt-1 text-xs text-slate">Mehrere Absätze mit Leerzeile trennen. Leer = Block wird ausgeblendet.</p>
        </div>
        <div>
          <label className="field-label">Arbeitsweise (optional)</label>
          <textarea className="field-input min-h-24" {...register("arbeitsweise")} />
          <p className="mt-1 text-xs text-slate">
            Erscheint als Abschnitt „Wie ich arbeite" ganz unten auf der Seminarseite. Leer = wird nicht angezeigt.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Kosten</label>
            <input className="field-input" placeholder="z. B. 280,00 €" {...register("cost")} />
          </div>
          <div>
            <label className="field-label">URL-Slug (optional)</label>
            <input className="field-input" {...register("slug")} />
          </div>
        </div>
        <div>
          <label className="field-label">Bild</label>
          <Controller
            control={control}
            name="image"
            render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} shape="rect" />}
          />
        </div>

        <div className="space-y-2 rounded-lg border border-line bg-bg-alt/50 p-4">
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" className="h-4 w-4" {...register("isAusbildungskurs")} />
            Ist ein Ausbildungskurs (statt Seminar)
          </label>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" className="h-4 w-4" {...register("isBildungsurlaub")} />
            Ist anerkannter Bildungsurlaub
          </label>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" className="h-4 w-4" {...register("useNameWording")} />
            Im Text den Kursnamen verwenden (statt „Seminar/Kurs")
          </label>
          {useName && (
            <div className="pl-6">
              <label className="field-label">Bezeichnung im Satz (Dativ, inkl. Artikel)</label>
              <input
                className="field-input"
                placeholder="z. B. der Paarberatung / dem Coaching"
                {...register("nameInSentence")}
              />
              <p className="mt-1 text-xs text-slate">
                Ergibt z. B. „In der Paarberatung erhalten Sie…" und „In der Paarberatung lernen Sie…".
                Leer = generische Formulierung.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-line bg-bg-alt/50 p-4">
          <label className="field-label">Auf Startseite verlinken von…</label>
          <p className="text-xs text-slate">
            Die ausgewählten Startseiten-Karten verlinken auf dieses Seminar (Mehrfachauswahl möglich).
          </p>
          <div className="grid grid-cols-2 gap-2 max-[640px]:grid-cols-1">
            {SERVICE_SLOTS.map((slot) => (
              <label key={slot.key} className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" className="h-4 w-4" value={slot.key} {...register("homepageSlots")} />
                {slot.label}
              </label>
            ))}
          </div>
        </div>

        <Repeater
          label="Termine"
          addLabel="+ Termin hinzufügen"
          onAdd={() => termine.append({ date: "", endDate: "", name: "", description: "" })}
        >
          {termine.fields.map((f, i) => (
            <div key={f.id} className="space-y-2 rounded-lg border border-line bg-white p-3">
              <div className="flex items-center gap-2">
                <input type="date" className="field-input w-40" {...register(`termine.${i}.date`)} />
                <span className="text-sm text-slate">bis</span>
                <input type="date" className="field-input w-40" {...register(`termine.${i}.endDate`)} />
                <button
                  type="button"
                  className="icon-btn icon-btn-danger ml-auto"
                  onClick={() => termine.remove(i)}
                >
                  ✕
                </button>
              </div>
              <input
                className="field-input"
                placeholder="Name des Termins (z. B. Modul 1 · 09:30–18:00 Uhr)"
                {...register(`termine.${i}.name`)}
              />
              <textarea
                className="field-input min-h-16"
                placeholder="Beschreibung / Seminardetails (optional)"
                {...register(`termine.${i}.description`)}
              />
            </div>
          ))}
        </Repeater>

        <Repeater label="Im Kurs erhalten Sie…" addLabel="+ Punkt hinzufügen" onAdd={() => includes.append({ value: "" })}>
          {includes.fields.map((f, i) => (
            <TextRow key={f.id} reg={register(`includes.${i}.value`)} onRemove={() => includes.remove(i)} />
          ))}
        </Repeater>

        <Repeater label={enablesLabel} addLabel="+ Punkt hinzufügen" onAdd={() => enables.append({ value: "" })}>
          {enables.fields.map((f, i) => (
            <TextRow key={f.id} reg={register(`enables.${i}.value`)} onRemove={() => enables.remove(i)} />
          ))}
        </Repeater>
      </form>
    </Drawer>
  );
}

function Repeater({
  label,
  addLabel,
  onAdd,
  children,
}: {
  label: string;
  addLabel: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="space-y-2">{children}</div>
      <button type="button" className="mt-2 text-sm font-medium text-navy hover:underline" onClick={onAdd}>
        {addLabel}
      </button>
    </div>
  );
}

function TextRow({ reg, onRemove }: { reg: UseFormRegisterReturn; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <input className="field-input flex-1" placeholder="Punkt eingeben…" {...reg} />
      <button type="button" className="icon-btn icon-btn-danger" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}
