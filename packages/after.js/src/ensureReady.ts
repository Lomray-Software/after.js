import { matchRoutes } from 'react-router-dom';
import { AsyncRouteProps, ServerAppState } from './types';
import { isLoadableComponent } from './utils';

type EnsureReadyResult = ServerAppState;

/**
 * This helps us to make sure all the async code is loaded before rendering.
 */
export async function ensureReady(
  routes: AsyncRouteProps[],
  pathname?: string
): Promise<EnsureReadyResult> {
  const location = pathname || window.location.pathname;
  const matchedRoutes = matchRoutes(routes, location);

  const promises = matchedRoutes?.map((match) => {
    const { route: { element } } = match;

    if (!element || !isLoadableComponent(element)) {
      return;
    }

    return element.load?.();
  });

  if (promises) {
    await Promise.all(promises);
  }

  return {
    ...((window as any).__SERVER_APP_STATE__ as ServerAppState),
  };
}
