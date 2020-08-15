import { useValue } from '@lxsmnsyc/react-scoped-model';
import React, { useCallback, FormEventHandler } from 'react';
import BasicNumberFactNumber from '../models/BasicNumberFactNumber';

export default function BasicNumberFactNumberInput(): JSX.Element {
  const [state, setState] = useValue(BasicNumberFactNumber);

  const onChange = useCallback<FormEventHandler<HTMLInputElement>>((event) => {
    setState(event.currentTarget.value);
  }, [setState]);

  return (
    <input type="number" value={state} onChange={onChange} />
  );
}
