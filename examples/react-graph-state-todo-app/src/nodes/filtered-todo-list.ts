import { createGraphNode } from 'graph-state';
import todoList, { TodoListData } from './todo-list';
import todoListFilter from './todo-list-filter';

const filteredTodoList = createGraphNode<TodoListData[]>({
  key: 'filteredTodoList',
  get: ({ get }) => {
    const filter = get(todoListFilter);
    const list = get(todoList);

    if (filter === 'complete') {
      return list.filter((data) => data.completed);
    }
    if (filter === 'incomplete') {
      return list.filter((data) => !data.completed);
    }
    return list;
  },
});

export default filteredTodoList;
