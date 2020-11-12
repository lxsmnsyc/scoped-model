import React from 'react';

import {
  useGraphNodeReset,
} from 'react-graph-state';

import { Button, ButtonGroup } from '@geist-ui/react';
import { RefreshCw } from '@geist-ui/react-icons';

import refresh from './nodes/refresh';

function RefreshControl(): JSX.Element {
  const resetRefresh = useGraphNodeReset(refresh);

  return (
    <Button
      iconRight={<RefreshCw />}
      onClick={resetRefresh}
    />
  );
}

export default function NetworkVisualizerControls(): JSX.Element {
  return (
    <ButtonGroup>
      <RefreshControl />
    </ButtonGroup>
  );
}
