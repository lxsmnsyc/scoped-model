import { createGraphNode } from 'graph-state';
import todoList from './todo-list';

const submitInput = createGraphNode<undefined, string | undefined>({
  key: 'submitInput',
  get: undefined,
  set: ({ set }, value) => {
    if (value) {
      set(todoList, (currentTodoList) => [
        {
          id: currentTodoList.length,
          text: value,
          completed: false,
        },
        ...currentTodoList,
      ]);
    }
  },
});

export default submitInput;
