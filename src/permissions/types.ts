import type { MongoAbility } from "@casl/ability";
import type { Action } from "./actions";

export type AppAbility = MongoAbility<[Action, string]>;
