import React from 'react';
import BasicNumberFactType from '../models/BasicNumberFactType';
import BasicNumberFactNumber from '../models/BasicNumberFactNumber';
import BasicNumberFactDisplay from './BasicNumberFactDisplay';
import BasicNumberFactNumberInput from './BasicNumberFactNumberInput';

export default function BasicNumber(): JSX.Element {
  return (
    <BasicNumberFactType.Provider>
      <BasicNumberFactNumber.Provider>
        <BasicNumberFactNumberInput />
        <BasicNumberFactDisplay />
      </BasicNumberFactNumber.Provider>
    </BasicNumberFactType.Provider>
  );
}
