import {
  createGraphNode,
  createGraphNodeResource,
  GraphNodeDebugData,
} from 'graph-state';

import refresh from './refresh';
import nodes from './nodes';
import edges from './edges';

import readMemory from '../utils/read-memory';
import { formatEdge } from '../utils/format-edge';
import { formatNode } from '../utils/format-node';

const memoryLoad = createGraphNode<Promise<GraphNodeDebugData[]>>({
  get: async ({ get }) => {
    get(refresh);

    const memory = await readMemory();

    formatNode(get(nodes), memory);
    formatEdge(get(edges), memory);

    return memory;
  },
});

export const memoryResource = createGraphNodeResource(memoryLoad);

export default memoryLoad;
