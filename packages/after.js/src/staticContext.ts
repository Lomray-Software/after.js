import React from 'react';

export interface IStaticContext {
  statusCode?: number;
  url?: string;
  isServer?: boolean;
}

const StaticContext = React.createContext<IStaticContext>({});

export default StaticContext;
