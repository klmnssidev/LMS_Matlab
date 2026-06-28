"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as offeringApi from "@/features/course-offerings/services/course-offering-api";

export function useOfferings() {
  return useQuery({
    queryKey: ["course-offerings"],
    queryFn: offeringApi.fetchOfferings,
  });
}

export function useOffering(id: number | null) {
  return useQuery({
    queryKey: ["course-offerings", id],
    queryFn: () => offeringApi.fetchOffering(id!),
    enabled: id !== null,
  });
}

export function useCreateOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: offeringApi.createOffering,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-offerings"] }),
  });
}

export function useUpdateOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: offeringApi.updateOffering,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-offerings"] }),
  });
}

export function useDeleteOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: offeringApi.deleteOffering,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-offerings"] }),
  });
}
