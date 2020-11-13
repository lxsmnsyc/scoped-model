import { createGraphNode } from 'graph-state';
import todoList from './todo-list';

const toggleTodo = createGraphNode<undefined, number>({
  key: 'toggleTodo',
  get: undefined,
  set: ({ set }, id) => {
    set(todoList, (currentTodoList) => {
      const index = currentTodoList.findIndex((data) => data.id === id);

      if (index !== -1) {
        const item = currentTodoList[index];
        item.completed = !item.completed;
      }

      return [
        ...currentTodoList,
      ];
    });
  },
});

export default toggleTodo;
