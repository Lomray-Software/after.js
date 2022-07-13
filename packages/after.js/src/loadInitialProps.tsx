import { matchRoutes } from 'react-router-dom';
import { AsyncRouteProps, InitialProps, CtxBase, AsyncMatchPath } from './types';
import { isAsyncComponent } from './utils';

const PAGE_DATA_FILE_NAME = 'page-data.json';

export async function loadInitialProps(
  pathname: string,
  routes: AsyncRouteProps[],
  ctx: CtxBase,
  ssg = false
): Promise<InitialProps> {
  const matchedRoutes = matchRoutes(routes, pathname);

  // load matched routes and their initial props
  const promises = matchedRoutes?.map((match) => {
    const { route: { element } } = match;

    if (!element || !isAsyncComponent(element)) {
      return;
    }

    if (ssg) {
      const PAGE_DATA_FILE_PATH = `${
        pathname === '/' ? '' : pathname
      }/${PAGE_DATA_FILE_NAME}`;

      return Promise.all([fetch(PAGE_DATA_FILE_PATH), element.load?.()])
        .then(([res]) => (res.status === 200 && res.json()) || null)
        .then(res =>
          element.getStaticInitialProps({ match, data: res, ...ctx })
        )
    }

    return element.load
      ? element
        .load()
        .then(() => element.getInitialProps({ match, ...ctx }))
      : element.getInitialProps({ match, ...ctx })
  });

  return {
    match: matchedRoutes?.[matchedRoutes.length - 1] as AsyncMatchPath || null,
    data: (await Promise.all(promises || []))[0],
  };
}
