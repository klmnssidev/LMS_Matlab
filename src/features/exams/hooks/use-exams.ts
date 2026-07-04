"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as examApi from "@/features/exams/services/exam-api";

export function useExamList(params?: { offering_id?: number }) {
  return useQuery({
    queryKey: ["exams", params],
    queryFn: () => examApi.fetchExams(params),
  });
}

export function useExam(id: number | null) {
  return useQuery({
    queryKey: ["exams", id],
    queryFn: () => examApi.fetchExam(id!),
    enabled: id !== null,
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: examApi.createExam,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: examApi.updateExam,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: examApi.deleteExam,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}
