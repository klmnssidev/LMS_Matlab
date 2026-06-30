"use client";

import { useMemo } from "react";
import { createMongoAbility, type RawRuleOf } from "@casl/ability";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import type { AppAbility } from "@/permissions";

async function fetchAbility(): Promise<{ rules: object[]; role: string }> {
  const res = await fetch("/api/ability");
  if (!res.ok) throw new Error("Failed to fetch ability");
  return res.json();
}

export function useAbility(): {
  ability: AppAbility | null;
  role: string | null;
  isLoading: boolean;
} {
  const { user, isLoaded } = useUser();

  const { data, isLoading: isFetching } = useQuery({
    queryKey: ["ability"],
    queryFn: fetchAbility,
    enabled: isLoaded && !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const ability = useMemo(() => {
    if (!data) return null;
    return createMongoAbility(data.rules as RawRuleOf<AppAbility>[]);
  }, [data]);

  return {
    ability: ability as AppAbility | null,
    role: data?.role ?? null,
    isLoading: !isLoaded || isFetching,
  };
}
