import { createTRPCRouter } from "@/trpc/init";
import { shipperConnectionsRouter } from "./shipper";
import { forwarderConnectionsRouter } from "./forwarder";

export const connectionsRouter = createTRPCRouter({
  shipper: shipperConnectionsRouter,
  forwarder: forwarderConnectionsRouter,
});
