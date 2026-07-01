import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteContentItem, getContent, moveContentItem, saveContentItem } from "../../lib/api";

export function useContent() {
  return useQuery({ queryKey: ["content"], queryFn: getContent });
}

export function useContentMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["content"] });
  const save = useMutation({
    mutationFn: ({ coll, item }: { coll: string; item: Record<string, unknown> & { id?: string } }) =>
      saveContentItem(coll, item),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ coll, id }: { coll: string; id: string }) => deleteContentItem(coll, id),
    onSuccess: invalidate,
  });
  const move = useMutation({
    mutationFn: ({ coll, id, dir }: { coll: string; id: string; dir: -1 | 1 }) =>
      moveContentItem(coll, id, dir),
    onSuccess: invalidate,
  });
  return { save, remove, move };
}
