"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as studentApi from "@/features/students/services/student-api";
import type { StudentListParams } from "@/features/students/services/student-api";

export function useStudents(params: StudentListParams = {}) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => studentApi.fetchStudents(params),
  });
}

export function useStudent(id: number | null) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: () => studentApi.fetchStudent(id!),
    enabled: id !== null,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentApi.createStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentApi.updateStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentApi.deleteStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}
