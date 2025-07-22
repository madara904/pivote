import { createTRPCRouter } from '../init';
import { organizationRouter } from './organizations';
export const appRouter = createTRPCRouter({

  organization: organizationRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;