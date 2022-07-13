import * as React from 'react';
import { Route } from 'react-router-dom';
import { AsyncRouteProps, IRouteProps } from './types';

interface IRenderRoutes {
  routes: AsyncRouteProps[];
  routeProps: IRouteProps;
}

const renderRoutes = ({ routes, routeProps }: IRenderRoutes) => routes.map(({
  path,
  element,
  children,
  ...rest
}) => (
  <Route
    {...rest}
    key={`route--${path}`}
    path={path}
    element={React.createElement(element as React.FC, routeProps)}
    children={children && renderRoutes({ routes: children, routeProps })}
  />
))

export default renderRoutes;
