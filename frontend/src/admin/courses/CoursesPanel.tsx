import { useState } from "react";
import { useCourseMutations, useCourses } from "../hooks/useCourses";
import { useToast } from "../components/ToastProvider";
import { EmptyState, PanelHeader } from "../components/ui";
import { IconEdit, IconEye, IconTrash } from "../components/icons";
import { CourseEditor } from "./CourseEditor";
import type { Course } from "../../lib/types";

export function CoursesPanel() {
  const { data: courses, isLoading } = useCourses();
  const { remove } = useCourseMutations();
  const toast = useToast();
  const [editing, setEditing] = useState<Course | null>(null);
  const [creating, setCreating] = useState(false);
  const open = editing !== null || creating;

  async function handleDelete(c: Course) {
    if (!window.confirm(`Kurs „${c.title}“ wirklich löschen?`)) return;
    try {
      await remove.mutateAsync(c.id);
      toast("Kurs gelöscht");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Löschen fehlgeschlagen", "error");
    }
  }

  return (
    <div>
      <PanelHeader
        title="Kursangebote"
        description="Seminare und Kurse mit Terminen, Inhalten und Preis."
        action={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + Neuer Kurs
          </button>
        }
      />

      {isLoading && <p className="text-slate">Lädt…</p>}

      {!isLoading && courses && courses.length === 0 && (
        <EmptyState
          title="Noch keine Kurse"
          hint="Legen Sie den ersten Kurs an."
          action={
            <button className="btn-primary" onClick={() => setCreating(true)}>
              Ersten Kurs anlegen
            </button>
          }
        />
      )}

      <div className="space-y-3">
        {courses?.map((c) => (
          <div key={c.id} className="flex items-center gap-4 rounded-lg border border-line-soft bg-white p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg-alt text-xs text-slate">
              {c.image ? <img src={c.image} alt="" className="h-full w-full object-cover" /> : "Bild"}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-ink">{c.title}</h3>
              <p className="truncate text-sm text-slate">
                {c.termine.length} Termin(e) · {c.cost || "Kosten n/a"} · {c.includes.length} Inhalt(e)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                className="icon-btn"
                href={`/seminar.html?id=${encodeURIComponent(c.id)}`}
                target="_blank"
                rel="noreferrer"
                title="Ansehen"
              >
                <IconEye />
              </a>
              <button className="icon-btn" onClick={() => setEditing(c)} title="Bearbeiten">
                <IconEdit />
              </button>
              <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(c)} title="Löschen">
                <IconTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <CourseEditor
          course={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}
