import { useState } from "react";
import { useContent, useContentMutations } from "../hooks/useContent";
import { useToast } from "../components/ToastProvider";
import { EmptyState, PanelHeader } from "../components/ui";
import { IconDown, IconEdit, IconTrash, IconUp } from "../components/icons";
import { SCHEMAS } from "./schema";
import { ContentEditor } from "./ContentEditor";
import type { Content } from "../../lib/types";

type Item = Record<string, any> & { id: string };

export function CollectionPanel({ coll }: { coll: string }) {
  const sch = SCHEMAS[coll];
  const { data, isLoading } = useContent();
  const { remove, move } = useContentMutations();
  const toast = useToast();
  const [editing, setEditing] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);
  const open = editing !== null || creating;

  const items: Item[] = data ? ((data[coll as keyof Content] as unknown as Item[]) ?? []) : [];

  async function handleDelete(it: Item) {
    const label = sch.rowTitle(it).slice(0, 50);
    if (!window.confirm(`„${label}“ wirklich löschen?`)) return;
    try {
      await remove.mutateAsync({ coll, id: it.id });
      toast("Gelöscht");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Löschen fehlgeschlagen", "error");
    }
  }

  async function handleMove(it: Item, dir: -1 | 1) {
    try {
      await move.mutateAsync({ coll, id: it.id, dir });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Verschieben fehlgeschlagen", "error");
    }
  }

  return (
    <div>
      <PanelHeader
        title={sch.title}
        description={sch.description}
        action={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + Neu
          </button>
        }
      />

      {isLoading && <p className="text-slate">Lädt…</p>}
      {!isLoading && items.length === 0 && (
        <EmptyState title="Noch keine Einträge" hint="Legen Sie den ersten Eintrag an." />
      )}

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-4 rounded-lg border border-line-soft bg-white p-4">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-ink">{sch.rowTitle(it)}</h3>
              <p className="truncate text-sm text-slate">{sch.rowMeta(it)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="icon-btn" disabled={i === 0} onClick={() => handleMove(it, -1)} title="Nach oben">
                <IconUp />
              </button>
              <button
                className="icon-btn"
                disabled={i === items.length - 1}
                onClick={() => handleMove(it, 1)}
                title="Nach unten"
              >
                <IconDown />
              </button>
              <button className="icon-btn" onClick={() => setEditing(it)} title="Bearbeiten">
                <IconEdit />
              </button>
              <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(it)} title="Löschen">
                <IconTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <ContentEditor
          coll={coll}
          item={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}
