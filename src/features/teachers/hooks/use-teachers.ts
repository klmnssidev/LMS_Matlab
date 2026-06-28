"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as teacherApi from "@/features/teachers/services/teacher-api";
import type { TeacherListParams } from "@/features/teachers/services/teacher-api";

export function useTeachers(params: TeacherListParams = {}) {
  return useQuery({
    queryKey: ["teachers", params],
    queryFn: () => teacherApi.fetchTeachers(params),
  });
}

export function useTeacher(id: number | null) {
  return useQuery({
    queryKey: ["teacher", id],
    queryFn: () => teacherApi.fetchTeacher(id!),
    enabled: id !== null,
  });
}

export function useCreateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teacherApi.createTeacher,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teacherApi.updateTeacher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      qc.invalidateQueries({ queryKey: ["teacher"] });
    },
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teacherApi.deleteTeacher,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}
