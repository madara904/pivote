import { createTRPCRouter } from "@/trpc/init";
import { shipperRouter } from "./shipper";
import { forwarderRouter } from "./forwarder";

export const quotationsRouter = createTRPCRouter({
  shipper: shipperRouter,
  forwarder: forwarderRouter,
}); 