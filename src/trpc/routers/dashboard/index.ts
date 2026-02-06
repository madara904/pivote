import { createTRPCRouter } from "@/trpc/init";
import { forwarderDashboardRouter } from "./forwarder";

export const dashboardRouter = createTRPCRouter({
  forwarder: forwarderDashboardRouter,
});
