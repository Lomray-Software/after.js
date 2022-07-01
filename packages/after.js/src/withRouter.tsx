import {
  NavigateFunction,
  useLocation,
  useNavigate,
  Location,
} from 'react-router-dom';
import React from 'react';

export interface RouteComponentProps<TLocation = unknown> {
  location: Location & { state: TLocation };
  navigate: NavigateFunction;
}

export interface WithRouterStatics<C extends React.ComponentType<any>> {
  WrappedComponent: C;
}

const withRouter = <
  P extends RouteComponentProps,
  C extends React.ComponentType<P>
>(
  Component: C & React.ComponentType<P>
): React.ComponentClass<Omit<P, keyof RouteComponentProps>> => {
  function ComponentWithRouterProp(props: any) {
    const location = useLocation();
    const navigate = useNavigate();

    return <Component {...props} location={location} navigate={navigate} />;
  }

  return (ComponentWithRouterProp as unknown) as React.ComponentClass<
    Omit<P, keyof RouteComponentProps>
  >;
};

export default withRouter;
