import { createGraphNode } from 'graph-state';

import edges, { DataEdge } from './edges';
import networkSelected from './network-selected';

const networkSelectedEdge = createGraphNode<DataEdge | undefined>({
  get: ({ get }) => {
    const selected = get(networkSelected);

    if (selected && selected.type === 'edge') {
      const currentEdges = get(edges);

      const value = currentEdges.get(selected.id);

      if (value) {
        return {
          ...value,
        };
      }
    }

    return undefined;
  },
});

export default networkSelectedEdge;
