import * as React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Location } from 'history';
import { loadInitialProps } from './loadInitialProps';
import withRouter, {
  RouteComponentProps,
  WithRouterStatics,
} from './withRouter';
import {
  AsyncRouteProps,
  ServerAppState,
  InitialData,
  TransitionBehavior,
  CtxBase,
  AsyncRouteableComponent,
} from './types';
import { get404Component, getAllRoutes, isInstantTransition } from './utils';

export interface AfterpartyProps extends RouteComponentProps {
  data: ServerAppState;
  routes: AsyncRouteProps[];
  transitionBehavior: TransitionBehavior;
}

export interface AfterpartyState {
  data?: InitialData;
  previousLocation: Location | null;
  currentLocation: Location | null;
  isLoading: boolean;
}

class Afterparty extends React.Component<AfterpartyProps, AfterpartyState> {
  state = {
    data: this.props.data.initialData,
    previousLocation: null,
    currentLocation: this.props.location,
    isLoading: false,
  };

  prefetcherCache: object = {};
  NotfoundComponent: AsyncRouteableComponent = get404Component(
    this.props.routes
  );

  static defaultProps = {
    transitionBehavior: 'blocking' as TransitionBehavior,
  };

  static getDerivedStateFromProps(
    props: AfterpartyProps,
    state: AfterpartyState
  ) {
    const currentLocation = props.location;
    const previousLocation = state.currentLocation;

    const navigated = currentLocation !== previousLocation;
    if (navigated && !props.location.state?.silent) {
      return {
        previousLocation: state.previousLocation || previousLocation,
        currentLocation,
        isLoading: true,
      };
    }

    return null;
  }

  componentDidUpdate(_prevProps: AfterpartyProps, prevState: AfterpartyState) {
    const navigated = prevState.currentLocation !== this.state.currentLocation;
    if (navigated) {
      const {
        location,
        navigate,
        routes,
        data,
        transitionBehavior,
        // we don't want to pass these
        // to loadInitialProps()
        children,
        ...rest
      } = this.props;

      const { scrollToTop, ssg } = data.afterData;
      const isInstantMode: boolean = isInstantTransition(transitionBehavior);
      const isBloackedMode = !isInstantMode;

      const ctx: CtxBase = {
        location,
        navigate,
        scrollToTop,
        ...rest,
      };

      // Only for page changes, prevent scroll up for anchor links
      const isPageChanged: boolean =
        !!prevState.currentLocation &&
        prevState.currentLocation.pathname !== location.pathname;

      const isAllowedToScroll: boolean =
        isPageChanged && scrollToTop.current === true;

      // in instant mode, first we scroll to top then we fetch the data
      if (isInstantMode && isAllowedToScroll) {
        window.scrollTo(0, 0);
      }

      loadInitialProps(location.pathname, routes, ctx, ssg)
        .then(res => res.data)
        .then((data: InitialData) => {
          // if user moved to a new page at the time we were fetching data
          // for the previous page, we ignore data of the previous page
          if (this.state.currentLocation !== location) return;

          // in blocked mode, first we fetch the data and then we scroll to top
          if (isBloackedMode && isAllowedToScroll) {
            window.scrollTo(0, 0);
          }

          this.setState({ previousLocation: null, data, isLoading: false });
        })
        .catch((e: Error) => {
          // @todo we should more cleverly handle errors???
          console.log(e);
        });
    }
  }

  prefetch = (pathname: string) => {
    const { ssg } = this.props.data.afterData;

    loadInitialProps(
      pathname,
      this.props.routes,
      {
        navigate: this.props.navigate,
      },
      ssg
    )
      .then(({ data }) => {
        this.prefetcherCache = {
          ...this.prefetcherCache,
          [pathname]: data,
        };
      })
      .catch(e => console.log(e));
  };

  render() {
    const { previousLocation, data, isLoading } = this.state;
    const { location: currentLocation, transitionBehavior } = this.props;
    const initialData = this.prefetcherCache[currentLocation.pathname] || data;

    const instantMode = isInstantTransition(transitionBehavior);

    // when we are in the instant mode we want to pass the right location prop
    // to the <Route /> otherwise it will render previous match component
    const location = instantMode
      ? currentLocation
      : previousLocation || currentLocation;

    return (
      <Routes location={location}>
        {initialData?.statusCode === 404 && (
          <Route element={this.NotfoundComponent} path={location.pathname} />
        )}
        {initialData?.redirectTo && <Navigate to={initialData.redirectTo} />}
        {getAllRoutes(this.props.routes).map(({ path, element }) => (
          <Route
            key={`route--${path}`}
            path={path}
            element={React.createElement(element as React.FC, {
              ...initialData,
              prefetch: this.prefetch,
              location,
              isLoading,
            })}
          />
        ))}
      </Routes>
    );
  }
}

type TAfterparty = React.ComponentClass<AfterpartyProps>;
type TAfter = React.ComponentClass<
  Omit<AfterpartyProps, keyof RouteComponentProps>
> &
  WithRouterStatics<TAfterparty>;

export const After = withRouter(Afterparty) as TAfter;
