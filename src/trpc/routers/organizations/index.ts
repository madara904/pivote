import { mergeRouters } from "@/trpc/init";
import { invitationRouter } from "./invitation";
import { crudRouter } from "./crud";
import { membershipRouter } from "./membership";

export const organizationRouter = mergeRouters(
  invitationRouter,
  crudRouter,
  membershipRouter
); 