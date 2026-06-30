import type { LinkedUser } from "@/server/services/account-linking.service";

export type AdminScope = {
  role: "Admin";
  accountId: number;
};

export function buildAdminScope(account: LinkedUser): AdminScope {
  return { role: "Admin", accountId: account.id };
}
