import { createStateModel, createSelector } from 'react-scoped-model';
import React, { useCallback } from 'react';

const Value = createStateModel(0);

const useValue = createSelector(Value, (value) => value[0]);
const useDispatch = createSelector(Value, (value) => value[1]);

function Unit(): JSX.Element {
  const value = useValue();

  return <span>{`${value} `}</span>;
}

function Input(): JSX.Element {
  const setValue = useDispatch();

  const onChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setValue(Number.parseFloat(e.currentTarget.value));
  }, [setValue]);

  return (
    <input
      type="number"
      onChange={onChange}
    />
  );
}

function Stress(): JSX.Element {
  const list = [];

  for (let i = 0; i < 3000; i += 1) {
    list.push(<Unit />);
  }

  return <>{ list }</>;
}

export default function App(): JSX.Element {
  return (
    <Value.Provider>
      <div><Input /></div>
      <div><Stress /></div>
    </Value.Provider>
  );
}
