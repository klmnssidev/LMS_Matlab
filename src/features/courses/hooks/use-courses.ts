"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as courseApi from "@/features/courses/services/course-api";
import type { CourseListParams } from "@/features/courses/services/course-api";

export function useCourses(params: CourseListParams = {}) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseApi.fetchCourses(params),
  });
}

export function useCourse(id: number | null) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => courseApi.fetchCourse(id!),
    enabled: id !== null,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseApi.createCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseApi.updateCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["course"] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseApi.deleteCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}
