"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as posterApi from "@/features/posters/services/poster-api";

export function usePosters() {
  return useQuery({
    queryKey: ["posters"],
    queryFn: posterApi.fetchPosters,
  });
}

export function useUploadPoster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) => posterApi.uploadPoster(title, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posters"] }),
  });
}

export function useDeletePoster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: posterApi.deletePoster,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posters"] }),
  });
}
