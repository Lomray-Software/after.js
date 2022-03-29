import React, { FC, useContext } from 'react';
import StaticContext from './staticContext';

const NotFound: FC = () => {
  const context = useContext(StaticContext);

  if (context) {
    context.statusCode = 404;
  }

  return <div>The Page You Were Looking For Was Not Found</div>;
};

export default NotFound;
