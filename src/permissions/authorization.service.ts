import { auth } from "@clerk/nextjs/server";
import { getLinkedUser } from "@/server/services/account-linking.service";
import type { LinkedUser } from "@/server/services/account-linking.service";
import { buildAbility } from "@/permissions/ability.factory";
import { buildScope } from "@/permissions/scopes";
import { ForbiddenError, AccountNotLinkedError } from "@/permissions/errors";
import type { AppAbility } from "@/permissions/types";
import type { Action } from "@/permissions/actions";
import type { Subject } from "@/permissions/subjects";
import type { AuthorizationScope } from "@/permissions/authorization-scope";

export class AuthorizationContext {
  constructor(
    public readonly account: LinkedUser,
    public readonly ability: AppAbility,
    public readonly scope: AuthorizationScope,
  ) {}

  authorize(action: Action, subject: Subject): this {
    if (!this.ability.can(action, subject)) {
      throw new ForbiddenError(`Cannot ${action} ${subject}`);
    }
    return this;
  }
}

export async function getAuthorizationContext(): Promise<AuthorizationContext> {
  const session = await auth();

  if (!session.userId) {
    throw new ForbiddenError("Forbidden: Not authenticated");
  }

  const account = await getLinkedUser(session.userId);

  if (!account) {
    throw new AccountNotLinkedError(
      "Account not linked. Please complete your profile."
    );
  }

  if (!account.isActive) {
    throw new ForbiddenError("Account is deactivated");
  }

  const ability = buildAbility(account);
  const scope = buildScope(account);

  return new AuthorizationContext(account, ability, scope);
}
