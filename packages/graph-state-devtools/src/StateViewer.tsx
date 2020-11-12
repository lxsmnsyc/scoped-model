import React from 'react';
import Inspector from 'react-inspector';

import theme from './utils/state-viewer-theme';

import './StateViewer.css';

interface StateViewerProps {
  state?: any;
}

export default function StateViewer({ state }: StateViewerProps): JSX.Element {
  return (
    <div className="StateViewer">
      <Inspector
        theme={theme}
        data={state}
      />
    </div>
  );
}
