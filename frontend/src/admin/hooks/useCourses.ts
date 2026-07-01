import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCourse, getCourses, saveCourse } from "../../lib/api";
import type { CoursePayload } from "../../lib/types";

export function useCourses() {
  return useQuery({ queryKey: ["courses"], queryFn: getCourses });
}

export function useCourseMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["courses"] });
  const save = useMutation({ mutationFn: (c: CoursePayload) => saveCourse(c), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => deleteCourse(id), onSuccess: invalidate });
  return { save, remove };
}
