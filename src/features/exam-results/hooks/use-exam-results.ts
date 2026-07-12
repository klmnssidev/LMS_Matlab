"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as examResultApi from "@/features/exam-results/services/exam-result-api";

export function useExamResults(params?: { exam_id?: number }) {
  return useQuery({
    queryKey: ["exam-results", params],
    queryFn: () => examResultApi.fetchExamResults(params),
  });
}

export function useExamResult(id: number | null) {
  return useQuery({
    queryKey: ["exam-results", id],
    queryFn: () => examResultApi.fetchExamResult(id!),
    enabled: id !== null,
  });
}

export function useCreateExamResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: examResultApi.createExamResult,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exam-results"] }),
  });
}

export function useUpdateExamResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: examResultApi.updateExamResult,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exam-results"] }),
  });
}

export function useDeleteExamResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: examResultApi.deleteExamResult,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exam-results"] }),
  });
}
