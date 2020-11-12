import { Checkbox, Col, Row, Spacer } from '@geist-ui/react';
import React from 'react';
import { useGraphNodeDispatch } from 'react-graph-state';
import { TodoListData } from '../nodes/todo-list';
import toggleTodo from '../nodes/toggle-todo';

interface TodoListItemProps {
  data: TodoListData;
}

export default function TodoListItem({ data }: TodoListItemProps): JSX.Element {
  const toggle = useGraphNodeDispatch(toggleTodo);
  return (
    <>
      <Row>
        <Col span={16}>
          <Checkbox
            checked={data.completed}
            onChange={() => {
              toggle(data.id);
            }}
            size="large"
          >
            { data.text }
          </Checkbox>
        </Col>
      </Row>
      <Spacer y={0.5} />
    </>
  );
}
