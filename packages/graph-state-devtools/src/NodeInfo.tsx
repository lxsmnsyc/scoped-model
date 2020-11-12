import React, {
  useMemo,
  useCallback,
} from 'react';
import {
  Description,
  Link,
  Text,
} from '@geist-ui/react';
import {
  useGraphNodeValue,
  useGraphNodeDispatch,
} from 'react-graph-state';

import networkSelected from './nodes/network-selected';
import refreshedSelectedNode from './nodes/refreshed-selected-node';
import nodes from './nodes/nodes';

import StateViewer from './StateViewer';

function NodeKey() {
  const selectedNode = useGraphNodeValue(refreshedSelectedNode);

  if (selectedNode) {
    return (
      <div className="SidebarContentSection">
        <Description
          title="Graph Node Key"
          content={selectedNode.label}
        />
      </div>
    );
  }

  return null;
}

interface NodeURLProps {
  id: string;
}

export function NodeURL({ id }: NodeURLProps): JSX.Element {
  const currentNodes = useGraphNodeValue(nodes);
  const setSelected = useGraphNodeDispatch(networkSelected);

  const node = useMemo(
    () => currentNodes.get(id),
    [currentNodes, id],
  );

  const onClick = useCallback(
    () => {
      setSelected({
        type: 'node',
        id,
      });
    },
    [id, setSelected],
  );

  if (node) {
    return (
      <Link href="#" onClick={onClick} block>
        { node?.label}
      </Link>
    );
  }
  return <></>;
}

interface NodeURLListProps {
  ids: string[];
}

function NodeURLList({ ids }: NodeURLListProps): JSX.Element {
  if (ids.length) {
    return (
      <>
        {
          ids.map((id) => (
            <NodeURL key={id} id={id} />
          ))
        }
      </>
    );
  }

  return <Text small>There are no nodes.</Text>;
}

interface NodeLinksProps {
  title: string;
  type: 'dependents' | 'dependencies';
}

function NodeLinks({ title, type }: NodeLinksProps): JSX.Element {
  const selectedNode = useGraphNodeValue(refreshedSelectedNode);

  if (selectedNode) {
    return (
      <div className="SidebarContentSection">
        <Description
          title={title}
          content={(
            <NodeURLList
              ids={selectedNode[type]}
            />
          )}
        />
      </div>
    );
  }

  return <></>;
}

function NodeState(): JSX.Element {
  const selectedNode = useGraphNodeValue(refreshedSelectedNode);

  if (selectedNode) {
    return (
      <div className="SidebarContentSection">
        <Description
          title="State"
          content={<StateViewer state={selectedNode.state} />}
        />
      </div>
    );
  }

  return <></>;
}
export default function NodeInfo(): JSX.Element {
  return (
    <>
      <NodeKey />
      <NodeState />
      <NodeLinks title="Dependencies" type="dependencies" />
      <NodeLinks title="Dependents" type="dependents" />
    </>
  );
}
