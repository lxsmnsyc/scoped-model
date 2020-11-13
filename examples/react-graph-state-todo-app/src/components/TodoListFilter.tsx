import React from 'react';
import { ButtonGroup, Button, Row } from '@geist-ui/react';
import { CheckSquare, Checkbox, List } from '@geist-ui/react-icons';
import { useGraphNodeDispatch } from 'react-graph-state';
import todoListFilter from '../nodes/todo-list-filter';

function AllButton(): JSX.Element {
  const setFilter = useGraphNodeDispatch(todoListFilter);

  return (
    <Button
      icon={<List />}
      onClick={() => {
        setFilter('all');
      }}
    >
      All
    </Button>
  );
}

function CompletedButton(): JSX.Element {
  const setFilter = useGraphNodeDispatch(todoListFilter);

  return (
    <Button
      icon={<CheckSquare />}
      onClick={() => {
        setFilter('complete');
      }}
    >
      Completed
    </Button>
  );
}

function IncompleteButton(): JSX.Element {
  const setFilter = useGraphNodeDispatch(todoListFilter);

  return (
    <Button
      icon={<Checkbox />}
      onClick={() => {
        setFilter('incomplete');
      }}
    >
      Incomplete
    </Button>
  );
}

export default function TodoListFilter(): JSX.Element {
  return (
    <Row justify="center">
      <ButtonGroup>
        <AllButton />
        <CompletedButton />
        <IncompleteButton />
      </ButtonGroup>
    </Row>
  );
}
