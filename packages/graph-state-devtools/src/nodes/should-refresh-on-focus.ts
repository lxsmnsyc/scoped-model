import { createGraphNode } from 'graph-state';

const shouldRefreshOnFocus = createGraphNode<boolean>({
  get: true,
});

export default shouldRefreshOnFocus;
