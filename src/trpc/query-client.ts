import {
    defaultShouldDehydrateQuery,
    QueryClient,
  } from '@tanstack/react-query';
 import superjson from 'superjson';
  export function makeQueryClient() {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes instead of 30 seconds
          gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
          retry: 1, // Reduce retries for faster failure
          refetchOnWindowFocus: false, // Prevent unnecessary refetches
        },
        dehydrate: {
           serializeData: superjson.serialize,
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) ||
            query.state.status === 'pending',
        },
        hydrate: {
         deserializeData: superjson.deserialize,
        },
      },
    });
  }