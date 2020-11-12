import { createGraphNode } from 'graph-state';

import networkSelected from './network-selected';

const networkSelectedId = createGraphNode<string | undefined>({
  get: ({ get }) => get(networkSelected)?.id,
});

export default networkSelectedId;
