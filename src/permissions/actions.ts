export const Actions = [
  "manage",
  "create",
  "read",
  "update",
  "delete",
  "approve",
  "grade",
  "export",
] as const;

export type Action = (typeof Actions)[number];
