import React from 'react';
import {
  GraphDomain,
} from 'react-graph-state';
import AppContainer from './AppContainer';

export default function App(): JSX.Element {
  return (
    <GraphDomain>
      <AppContainer />
    </GraphDomain>
  );
}
