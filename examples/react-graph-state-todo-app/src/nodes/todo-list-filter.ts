import { createGraphNode } from 'graph-state';

export type TodoListFilter =
  | 'all'
  | 'complete'
  | 'incomplete';

const todoListFilter = createGraphNode<TodoListFilter>({
  key: 'todoListFilter',
  get: 'all',
});

export default todoListFilter;
