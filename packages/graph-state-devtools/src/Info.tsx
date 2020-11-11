import React from 'react';
import {
  useGraphNodeValue,
} from 'react-graph-state';
import {
  Text,
} from '@geist-ui/react';
import networkSelected from './nodes/network-selected';
import EdgeInfo from './EdgeInfo';
import NodeInfo from './NodeInfo';

function Fallback() {
  return (
    <div className="SidebarContentSection">
      <Text>Please select an edge or a node.</Text>
    </div>
  );
}

export default function Info(): JSX.Element {
  const selected = useGraphNodeValue(networkSelected);

  if (selected) {
    if (selected.type === 'node') {
      return <NodeInfo />;
    }
    if (selected.type === 'edge') {
      return <EdgeInfo />;
    }
  }

  return <Fallback />;
}
