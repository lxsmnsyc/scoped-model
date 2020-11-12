import { createGraphNode } from 'graph-state';
import { DataSet } from 'vis-data';

export interface DataNode {
  id: string;
  label: string;
  value: number;
  dependencies: string[];
  dependents: string[];
  state?: any;
}

const nodes = createGraphNode({
  get: new DataSet<DataNode>([]),
});

export default nodes;
