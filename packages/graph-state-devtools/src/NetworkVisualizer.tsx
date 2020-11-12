import React, {
  useRef,
  useEffect,
} from 'react';
import {
  useGraphNodeDispatch,
  useGraphNodeValue,
} from 'react-graph-state';

import networkContainer from './nodes/network-container';
import network from './nodes/network';

import NetworkVisualizerControls from './NetworkVisualizerControls';

import './NetworkVisualizer.css';

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
      <div className="NetworkVisualizerControls">
        <NetworkVisualizerControls />
      </div>
    </div>
  );
}
