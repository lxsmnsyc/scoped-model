import { createGraphNode } from 'graph-state';

import { DataNode } from './nodes';
import networkSelectedNode from './network-selected-node';
import refresh from './refresh';

const refreshedSelectedNode = createGraphNode<DataNode | undefined>({
  get: ({ get }) => {
    get(refresh);
    return get(networkSelectedNode);
  },
});

export default refreshedSelectedNode;
