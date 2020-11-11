import { createGraphNode, GraphNodeDebugData } from 'graph-state';
import { DataSet } from 'vis-data';

export interface DataNode extends GraphNodeDebugData {
  id: string;
  label: string;
  value: number;
  dependencies: string[];
  dependents: string[];
}

const nodes = createGraphNode({
  get: new DataSet<DataNode>([]),
});

export default nodes;
