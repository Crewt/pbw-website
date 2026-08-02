import { useState } from "react";
import { Controller, useForm, type Control, type UseFormRegister } from "react-hook-form";
import { SCHEMAS, type FieldDef } from "./schema";
import { useContentMutations } from "../hooks/useContent";
import { useToast } from "../components/ToastProvider";
import { Drawer } from "../components/Drawer";
import { ImageUpload } from "../components/ImageUpload";
import { FileUpload } from "../components/FileUpload";
import { isAllowedHref } from "../../lib/url";

type Item = Record<string, any> & { id?: string };
type Values = Record<string, any>;

function defaultsFor(fields: FieldDef[], item: Item | null): Values {
  const out: Values = {};
  for (const f of fields) {
    const v = item ? item[f.key] : undefined;
    if (f.type === "toggle") out[f.key] = typeof v === "boolean" ? v : false;
    else if (f.type === "file") out[f.key] = v ?? null;
    else if (f.type === "select") out[f.key] = typeof v === "string" && v ? v : f.options?.[0]?.[0] ?? "";
    else out[f.key] = typeof v === "string" ? v : "";
  }
  return out;
}

export function ContentEditor({
  coll,
  item,
  onClose,
}: {
  coll: string;
  item: Item | null;
  onClose: () => void;
}) {
  const sch = SCHEMAS[coll];
  const toast = useToast();
  const { save } = useContentMutations();
  const editing = item !== null && !!item.id;

  const { register, control, handleSubmit, watch } = useForm<Values>({
    defaultValues: defaultsFor(sch.fields, item),
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const watched = watch();

  function visible(f: FieldDef): boolean {
    return !f.showIf || watched[f.showIf.key] === f.showIf.value;
  }

  async function onSubmit(values: Values) {
    const errs: Record<string, string> = {};
    for (const f of sch.fields) {
      let req = !!f.required;
      if (f.requiredIf && values[f.requiredIf.key] === f.requiredIf.value) req = true;
      if (!req) continue;
      const v = values[f.key];
      const empty = f.type === "file" ? !(v && (v.name || v.url)) : !(typeof v === "string" ? v.trim() : v);
      if (empty) errs[f.key] = `Bitte „${f.label}“ ausfüllen.`;
    }
    // Restrict URL fields to safe schemes (http/https/mailto/tel or relative
    // paths) — blocks e.g. javascript: values before they reach the site.
    for (const f of sch.fields) {
      if (f.type !== "url" || !visible(f)) continue;
      const v = values[f.key];
      if (typeof v === "string" && v.trim() && !isAllowedHref(v)) {
        errs[f.key] = `Bitte eine gültige URL angeben (z. B. https://…, mailto: oder tel:).`;
      }
    }
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      toast("Bitte Pflichtfelder ausfüllen.", "error");
      return;
    }
    setFieldErrors({});
    try {
      await save.mutateAsync({ coll, item: { ...(item ?? {}), ...values } });
      toast("Gespeichert");
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Speichern fehlgeschlagen", "error");
    }
  }

  return (
    <Drawer
      open
      title={editing ? `${sch.singular} bearbeiten` : `${sch.singular} – neu`}
      onClose={onClose}
      footer={
        <div className="ml-auto flex gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" form="content-form" className="btn-primary" disabled={save.isPending}>
            {save.isPending ? "Speichern…" : "Speichern"}
          </button>
        </div>
      }
    >
      <form id="content-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {sch.fields.map((f) =>
          visible(f) ? (
            <div key={f.key}>
              {f.type !== "toggle" && <label className="field-label">{f.label}</label>}
              <FieldControl f={f} register={register} control={control} />
              {f.hint && <p className="mt-1 text-xs text-slate">{f.hint}</p>}
              {fieldErrors[f.key] && <p className="mt-1 text-sm text-red-700">{fieldErrors[f.key]}</p>}
            </div>
          ) : null
        )}
      </form>
    </Drawer>
  );
}

function FieldControl({
  f,
  register,
  control,
}: {
  f: FieldDef;
  register: UseFormRegister<Values>;
  control: Control<Values>;
}) {
  switch (f.type) {
    case "textarea":
      return <textarea className="field-input min-h-24" {...register(f.key)} />;
    case "select":
      return (
        <select className="field-input" {...register(f.key)}>
          {f.options?.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      );
    case "toggle":
      return (
        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" className="h-4 w-4" {...register(f.key)} />
          {f.label}
        </label>
      );
    case "image":
      return (
        <Controller
          control={control}
          name={f.key}
          render={({ field }) => (
            <ImageUpload
              value={field.value || ""}
              onChange={field.onChange}
              shape={f.imageShape ?? "rect"}
              aspect={f.imageAspect}
            />
          )}
        />
      );
    case "file":
      return (
        <Controller
          control={control}
          name={f.key}
          render={({ field }) => <FileUpload value={field.value ?? null} onChange={field.onChange} />}
        />
      );
    default:
      return (
        <input
          type={f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
          className="field-input"
          placeholder={f.placeholder}
          {...register(f.key)}
        />
      );
  }
}
