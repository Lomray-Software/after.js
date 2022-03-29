import React from 'react';

export interface IStaticContext {
  statusCode?: number;
  url?: string;
}

const StaticContext = React.createContext<IStaticContext>({});

export default StaticContext;
