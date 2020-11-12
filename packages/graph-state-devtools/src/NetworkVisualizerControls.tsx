import React, { useCallback } from 'react';

import {
  useGraphNodeReset,
  useGraphNodeValue,
} from 'react-graph-state';

import { Button, ButtonGroup } from '@geist-ui/react';
import { ZoomOut, RefreshCw } from '@geist-ui/react-icons';

import refresh from './nodes/refresh';
import network from './nodes/network';

function ZoomOutControl(): JSX.Element {
  const currentNetwork = useGraphNodeValue(network);

  const onClick = useCallback(() => {
    if (currentNetwork) {
      currentNetwork.fit({
        animation: true,
      });
    }
  }, [currentNetwork]);

  return (
    <Button
      iconRight={<ZoomOut />}
      onClick={onClick}
    />
  );
}

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
      <ZoomOutControl />
      <RefreshControl />
    </ButtonGroup>
  );
}
