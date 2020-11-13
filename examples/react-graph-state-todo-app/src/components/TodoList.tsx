import React from 'react';
import { useGraphNodeValue } from 'react-graph-state';
import filteredTodoList from '../nodes/filtered-todo-list';
import TodoListItem from './TodoListItem';

export default function TodoList(): JSX.Element {
  const list = useGraphNodeValue(filteredTodoList);

  return (
    <>
      {
        list.map((data) => (
          <TodoListItem
            data={data}
            key={data.id}
          />
        ))
      }
    </>
  );
}
