import { createTRPCRouter } from "@/trpc/init";
import { forwarderRouter } from "./forwarder";
import { shipperRouter } from "./shipper";

export const inquiriesRouter = createTRPCRouter({
  shipper: shipperRouter,
  forwarder: forwarderRouter,
}); 