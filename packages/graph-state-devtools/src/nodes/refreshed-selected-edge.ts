import { createGraphNode } from 'graph-state';

import { DataEdge } from './edges';
import networkSelectedEdge from './network-selected-edge';
import refresh from './refresh';

const refreshedSelectedEdge = createGraphNode<DataEdge | undefined>({
  get: ({ get }) => {
    get(refresh);
    return get(networkSelectedEdge);
  },
});

export default refreshedSelectedEdge;
