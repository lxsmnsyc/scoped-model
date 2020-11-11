import React, {
  useRef,
  useEffect,
} from 'react';
import {
  Spinner,
} from '@geist-ui/react';
import {
  useGraphNodeDispatch,
  useGraphNodeValue,
} from 'react-graph-state';

import networkContainer from './nodes/network-container';
import { networkCoreResource } from './nodes/network-core';
import network from './nodes/network';

import './NetworkVisualizer.css';

function NetworkStatus() {
  const resource = useGraphNodeValue(networkCoreResource);

  const isMounted = resource.status === 'pending';
  const mountClass = isMounted ? 'Mounted' : 'Unmounted';

  return (
    <div className={`NetworkStatus ${mountClass}`}>
      <Spinner />
    </div>
  );
}

export default function NetworkVisualizer(): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  const setContainer = useGraphNodeDispatch(networkContainer);

  useGraphNodeValue(network);

  useEffect(() => {
    if (ref.current) {
      setContainer(ref.current);
    }
    return undefined;
  }, [setContainer]);

  const initialRender = useRef(true);

  useEffect(() => {
    initialRender.current = false;
  }, []);

  return (
    <div className="NetworkVisualizerContainer">
      <div
        className="NetworkVisualizer"
        ref={ref}
      />
      <NetworkStatus />
    </div>
  );
}
