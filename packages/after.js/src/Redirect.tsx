import React, { FC, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import StaticContext from './staticContext';

interface IRedirect {
  to: string;
  statusCode?: number;
}

/**
 * Redirect with support SSR
 * @constructor
 */
const Redirect: FC<IRedirect> = ({ to, statusCode = 302 }) => {
  const context = useContext(StaticContext);

  if (context.isServer) {
    context.url = to;
    context.statusCode = statusCode;

    return null;
  }

  return <Navigate to={to} />;
}

export default Redirect;
