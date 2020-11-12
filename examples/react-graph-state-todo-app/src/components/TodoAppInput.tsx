import React, { useCallback, useRef } from 'react';
import { Input, Row } from '@geist-ui/react';
import { Plus } from '@geist-ui/react-icons';
import { useGraphNodeDispatch } from 'react-graph-state';
import submitInput from '../nodes/submit-input';

export default function TodoAppInput(): JSX.Element {
  const submit = useGraphNodeDispatch(submitInput);

  const ref = useRef<HTMLInputElement | null>(null);

  const onSubmit = useCallback(() => {
    if (ref.current) {
      submit(ref.current.value);
      ref.current.value = '';
    }
  }, [submit]);

  return (
    <Row justify="center">
      <Input
        ref={ref}
        placeholder="Write a task"
        iconRight={<Plus />}
        iconClickable
        width="100%"
        onIconClick={onSubmit}
      />
    </Row>
  );
}
