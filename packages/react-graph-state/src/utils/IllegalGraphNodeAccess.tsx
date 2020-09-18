import { GraphNode } from '../graph-node';

export default class IllegalGraphNodeAccessError extends Error {
  constructor(node: GraphNode<any>) {
    super(`
  Illegal graph node access detected. This error will only show
  if the graph node, in context, is being accessed without it's
  properties getting initilized.
  
  (Node: ${node.key})
`);
  }
}
