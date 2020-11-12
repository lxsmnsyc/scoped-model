import { createGraphNode } from 'graph-state';

const nodeSearchSelected = createGraphNode<string | undefined>({
  get: undefined,
});

export default nodeSearchSelected;
