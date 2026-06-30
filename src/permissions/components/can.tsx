"use client";

import type { ReactNode } from "react";
import { useAbility } from "@/features/auth/hooks/use-ability";
import type { Action, Subject } from "@/permissions";

type CanProps = {
  I: Action;
  a: Subject;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ I, a, children, fallback }: CanProps) {
  const { ability, isLoading } = useAbility();

  if (isLoading || !ability) return null;
  if (!ability.can(I, a)) return fallback ?? null;
  return <>{children}</>;
}
