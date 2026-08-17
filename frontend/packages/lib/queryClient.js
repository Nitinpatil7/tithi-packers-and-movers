import { dehydrate, hydrate, QueryClient } from '@tanstack/react-query';

const CACHE_KEY = 'tithi_public_query_cache_v3';
const LEGACY_CACHE_KEYS = ['tithi_public_query_cache_v2'];
const CACHE_MAX_AGE = 30 * 60 * 1000;

const canHydrateQuery = (queryKey = []) => queryKey[0] !== 'admin' && queryKey[0] !== 'site-setting';

function getHydratableClientState(clientState) {
  if (!clientState?.queries) return clientState;
  return {
    ...clientState,
    queries: clientState.queries.filter((query) => canHydrateQuery(query.queryKey)),
  };
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000,
      },
    },
  });
}

let persistenceEnabled = false;
export function enableQueryPersistence(queryClient) {
  if (typeof window === 'undefined' || persistenceEnabled) return () => {};
  persistenceEnabled = true;
  try {
    LEGACY_CACHE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    const saved = JSON.parse(window.localStorage.getItem(CACHE_KEY) || 'null');
    if (saved?.timestamp && Date.now() - saved.timestamp < CACHE_MAX_AGE && saved.clientState) {
      hydrate(queryClient, getHydratableClientState(saved.clientState));
    }
  } catch { /* Invalid cache should never block the application. */ }
  let timer;
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      try {
        const clientState = dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => (
            query.state.status === 'success'
            && canHydrateQuery(query.queryKey)
          ),
        });
        window.localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), clientState }));
      } catch { /* Storage limits are non-fatal. */ }
    }, 250);
  });
  return () => { window.clearTimeout(timer); unsubscribe(); persistenceEnabled = false; };
}
