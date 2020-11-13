import React from 'react';
import { GeistProvider, CssBaseline } from '@geist-ui/react';

import NetworkVisualizer from './NetworkVisualizer';
import Sidebar from './Sidebar';
import AppTitle from './AppTitle';

import './AppContainer.css';

export default function AppContainer(): JSX.Element {
  return (
    <GeistProvider theme={{ type: 'dark' }}>
      <CssBaseline />
      <AppTitle />
      <div className="AppContainer">
        <NetworkVisualizer />
        <Sidebar />
      </div>
    </GeistProvider>
  );
}
