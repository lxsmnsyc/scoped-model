import { createGraphNode } from 'graph-state';

export interface TodoListData {
  completed: boolean;
  text: string;
  id: number;
}

const todoList = createGraphNode<TodoListData[]>({
  key: 'todoList',
  get: [],
});

export default todoList;
