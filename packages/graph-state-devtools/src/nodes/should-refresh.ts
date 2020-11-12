import { createGraphNode } from 'graph-state';

const shouldRefresh = createGraphNode<boolean>({
  get: true,
});

export default shouldRefresh;
