import { createGraphNode } from 'graph-state';
import { DataSet } from 'vis-data';

export interface DataEdge {
  id: string;
  from: string;
  to: string;
  arrows: string;
}

const edges = createGraphNode({
  get: new DataSet<DataEdge>([]),
});

export default edges;
