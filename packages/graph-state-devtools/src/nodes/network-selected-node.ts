import { createGraphNode } from 'graph-state';
import nodes, { DataNode } from './nodes';
import networkSelected from './network-selected';

const networkSelectedNode = createGraphNode<DataNode | undefined>({
  get: ({ get }) => {
    const selected = get(networkSelected);

    if (selected && selected.type === 'node') {
      const currentNodes = get(nodes);

      const value = currentNodes.get(selected.id);

      if (value) {
        return {
          ...value,
        };
      }
    }

    return undefined;
  },
});

export default networkSelectedNode;
