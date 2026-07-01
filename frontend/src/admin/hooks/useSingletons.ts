import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveAbout, saveKontakt } from "../../lib/api";
import type { About, Kontakt } from "../../lib/types";

// Reads come from the aggregate ['content'] query; these mutations save the
// singletons and refresh that aggregate.
export function useSingletonMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["content"] });
  const kontakt = useMutation({ mutationFn: (obj: Kontakt) => saveKontakt(obj), onSuccess: invalidate });
  const about = useMutation({ mutationFn: (obj: About) => saveAbout(obj), onSuccess: invalidate });
  return { kontakt, about };
}
