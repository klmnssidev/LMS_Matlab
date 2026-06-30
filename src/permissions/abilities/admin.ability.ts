import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AppAbility } from "../types";

export function defineAdminAbility(): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  can("manage", "all");
  return build();
}
