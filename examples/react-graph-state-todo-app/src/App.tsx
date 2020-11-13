import React from 'react';
import { GraphDomain } from 'react-graph-state';
import { GeistProvider, CssBaseline } from '@geist-ui/react';
import TodoApp from './components/TodoApp';

export default function App(): JSX.Element {
  return (
    <GeistProvider theme={{ type: 'dark' }}>
      <CssBaseline />
      <GraphDomain>
        <TodoApp />
      </GraphDomain>
    </GeistProvider>
  );
}
