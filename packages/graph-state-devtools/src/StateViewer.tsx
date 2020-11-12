import React from 'react';
import Inspector from 'react-inspector';

import theme from './utils/state-viewer-theme';

interface StateViewerProps {
  state?: any;
}

export default function StateViewer({ state }: StateViewerProps): JSX.Element {
  return (
    <Inspector
      theme={theme}
      data={state}
    />
  );
}
