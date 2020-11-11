import { createGraphNode, createGraphNodeResource } from 'graph-state';
import edges from './edges';
import nodes from './nodes';
import { formatEdge } from '../utils/format-edge';
import { formatNode } from '../utils/format-node';
import memoryLoad from './memory-load';
import networkLoading from './network-loading';
import networkError from './network-error';

const networkCore = createGraphNode<Promise<void>>({
  get: async ({ get, set }) => {
    set(networkLoading, true);
    try {
      const result = await get(memoryLoad);

      formatNode(get(nodes), result);
      formatEdge(get(edges), result);
    } catch (err) {
      set(networkError, err);
    }
    set(networkLoading, false);
  },
});

export const networkCoreResource = createGraphNodeResource(networkCore);

export default networkCore;
