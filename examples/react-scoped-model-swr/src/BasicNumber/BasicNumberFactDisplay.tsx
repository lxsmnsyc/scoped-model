import React from 'react';
import { useSelector } from '@lxsmnsyc/react-scoped-model';
import BasicNumberFact from '../models/BasicNumberFact';
import BasicNumberFactNumber from '../models/BasicNumberFactNumber';
import BasicNumberFactType from '../models/BasicNumberFactType';

function BasicNumberFactDisplayInternal(): JSX.Element {
  const message = useSelector(BasicNumberFact, (state) => (
    state.isValidating ? 'Loading...' : state.data
  ));

  return (
    <h3>{ message }</h3>
  );
}

export default function BasicNumberFactDisplay(): JSX.Element {
  const number = useSelector(BasicNumberFactNumber, (state) => state[0]);
  const type = useSelector(BasicNumberFactType, (state) => state[0]);

  return (
    <BasicNumberFact.Provider number={number} type={type}>
      <BasicNumberFactDisplayInternal />
    </BasicNumberFact.Provider>
  );
}
