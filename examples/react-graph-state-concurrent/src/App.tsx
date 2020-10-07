import {
  createGraphNode,
  createGraphNodeResource,
  GraphDomain,
  useGraphNodeResource,
  useGraphNodeSetValue,
} from '@lxsmnsyc/react-graph-state';
import React, { Suspense, useCallback } from 'react';

const sleep = (time: number) => new Promise((resolve) => {
  setTimeout(resolve, time, true);
});

const valueNode = createGraphNode({
  get: 0,
});

const delayedValueNode = createGraphNode<Promise<number>>({
  get: ({ get }) => sleep(1000).then(() => get(valueNode)),
});

const valueResource = createGraphNodeResource(delayedValueNode);

function Unit(): JSX.Element {
  const value = useGraphNodeResource(valueResource);

  return <span>{`${value} `}</span>;
}

function PendingUnit(): JSX.Element {
  return (
    <Suspense fallback={<span>! </span>}>
      <Unit />
    </Suspense>
  );
}
function Input(): JSX.Element {
  const setValue = useGraphNodeSetValue(valueNode);

  const onChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setValue(Number.parseFloat(e.currentTarget.value));
  }, [setValue]);

  return (
    <input
      type="number"
      onChange={onChange}
    />
  );
}

function Stress(): JSX.Element {
  const list = [];

  for (let i = 0; i < 1000; i += 1) {
    list.push(<PendingUnit key={i} />);
  }

  return <>{ list }</>;
}

export default function App(): JSX.Element {
  return (
    <GraphDomain>
      <div>
        <Input />
      </div>
      <div>
        <Stress />
      </div>
    </GraphDomain>
  );
}
