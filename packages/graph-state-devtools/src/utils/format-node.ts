import { AutoCompleteOption } from '@geist-ui/react/dist/auto-complete/auto-complete';
import { GraphNodeKey, GraphNodeDebugData } from 'graph-state';
import { DataSet } from 'vis-data';
import { DataNode } from '../nodes/nodes';

export function formatNodeId(id: GraphNodeKey): string {
  return `GraphNode(id: ${id})`;
}

export function formatNode(
  nodes: DataSet<DataNode>,
  memory: GraphNodeDebugData[],
): void {
  memory.forEach((node) => {
    const id = formatNodeId(node.id);

    nodes.update({
      label: `${node.id}`,
      value: node.dependencies.length + 1,
      ...node,
      dependencies: node.dependencies.map(formatNodeId),
      dependents: node.dependents.map(formatNodeId),
      id,
    });
  });
}

export function formatNodeAutoComplete(
  memory: GraphNodeDebugData[],
): AutoCompleteOption[] {
  return memory.map((node) => ({
    label: `${node.id}`,
    value: `${node.id}`,
  }));
}
