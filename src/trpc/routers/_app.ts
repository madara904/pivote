import { createTRPCRouter } from '../init';
import { organizationRouter } from './organizations';
import { inquiriesRouter } from './inquiries';
import { quotationsRouter } from './quotations';
import { connectionsRouter } from './connections';
import { dashboardRouter } from './dashboard';

export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  inquiry: inquiriesRouter,
  quotation: quotationsRouter,
  connections: connectionsRouter,
  dashboard: dashboardRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;