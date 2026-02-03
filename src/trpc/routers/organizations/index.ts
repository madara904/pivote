import { mergeRouters } from "@/trpc/init";
import { crudRouter } from "./crud";
import { membershipRouter } from "./membership";

export const organizationRouter = mergeRouters(
  crudRouter,
  membershipRouter
); 