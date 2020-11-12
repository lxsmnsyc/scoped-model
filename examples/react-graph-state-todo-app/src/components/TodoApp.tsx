import React from 'react';
import { Page, Spacer } from '@geist-ui/react';
import TodoListFilter from './TodoListFilter';
import TodoAppTitle from './TodoAppTitle';
import TodoAppInput from './TodoAppInput';
import TodoList from './TodoList';

export default function TodoApp(): JSX.Element {
  return (
    <Page>
      <Page.Header>
        <TodoAppTitle />
      </Page.Header>
      <Page.Content>
        <TodoListFilter />
        <Spacer y={1} />
        <TodoAppInput />
        <Spacer y={1} />
        <TodoList />
      </Page.Content>
    </Page>
  );
}
