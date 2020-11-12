import { createGraphNode } from 'graph-state';
import nodes, { DataNode } from './nodes';
import networkSelected from './network-selected';
import refresh from './refresh';
import network from './network';
import nodeSearchSelected from './node-search-selected';
import { moveNetworkViewToNode, selectNode } from '../utils/network';

const networkSelectedNode = createGraphNode<DataNode | undefined>({
  get: ({ get, set }) => {
    get(refresh);
    const selected = get(networkSelected);

    if (selected && selected.type === 'node') {
      const currentNodes = get(nodes);

      const value = currentNodes.get(selected.id);

      if (value) {
        set(nodeSearchSelected, value.label);

        const instance = get(network);

        if (instance) {
          selectNode(instance, selected.id);
          moveNetworkViewToNode(instance, selected.id);
        }

        return {
          ...value,
        };
      }
    }

    return undefined;
  },
});

export default networkSelectedNode;
