"use client";

import { useQuery } from "@tanstack/react-query";
import type { TranscriptResponse } from "@/server/schemas/transcript.schema";

async function fetchTranscript(semesterId?: number): Promise<TranscriptResponse> {
  const params = new URLSearchParams();
  if (semesterId) params.set("semesterId", String(semesterId));
  const qs = params.toString();
  const res = await fetch(`/api/transcript${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Failed to fetch transcript" }));
    throw new Error(json.error ?? "Failed to fetch transcript");
  }
  return res.json();
}

export function useTranscript(semesterId?: number) {
  return useQuery({
    queryKey: ["transcript", semesterId],
    queryFn: () => fetchTranscript(semesterId),
  });
}
