import React from 'react';
import { cleanup, render } from '@testing-library/react';
import createModel from '../src/create-model';

import '@testing-library/jest-dom';

afterEach(cleanup);

describe('createModel', () => {
  it('should accept props', () => {
    interface ExampleProps {
      value: string;
    }

    const expected = 'Hello World';
    const accepted: Partial<{ props: ExampleProps }> = {};

    const Example = createModel((props: ExampleProps) => {
      accepted.props = props;

      return null;
    });

    render(
      <Example.Provider value={expected} />,
    );

    expect(accepted.props).toBeTruthy();
    expect(accepted.props?.value).toBe(expected);
  });
});
