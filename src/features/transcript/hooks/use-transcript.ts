"use client";

import { useQuery } from "@tanstack/react-query";
import type { TranscriptResponse } from "@/server/schemas/transcript.schema";

async function fetchTranscript(): Promise<TranscriptResponse> {
  const res = await fetch("/api/transcript");
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Failed to fetch transcript" }));
    throw new Error(json.error ?? "Failed to fetch transcript");
  }
  return res.json();
}

export function useTranscript() {
  return useQuery({
    queryKey: ["transcript"],
    queryFn: fetchTranscript,
  });
}
