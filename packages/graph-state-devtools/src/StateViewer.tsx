import React from 'react';
import Inspector from 'react-inspector';

interface StateViewerProps {
  state?: any;
}

export default function StateViewer({ state }: StateViewerProps): JSX.Element {
  return (
    <Inspector
      theme="chromeDark"
      data={state}
    />
  );
}
