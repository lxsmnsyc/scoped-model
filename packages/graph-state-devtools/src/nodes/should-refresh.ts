import { createGraphNode } from 'graph-state';

const shouldRefresh = createGraphNode<boolean>({
  get: false,
});

export default shouldRefresh;
