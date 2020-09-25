/* @jsx h */
import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { cleanup, render, screen } from '@testing-library/preact';
import createModel, { useValueOnce } from '../../src';
import { supressWarnings, restoreWarnings } from '../suppress-warnings';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

afterEach(cleanup);

describe('useValueOnce', () => {
  it('should receive the value supplied by the model.', () => {
    const expected = 'Hello World';
    const finder = 'example';
    const Example = createModel(() => expected);

    function Consumer(): JSX.Element {
      const value = useValueOnce(Example);

      return (
        <p title={finder}>{ value }</p>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should not re-render if the scoped model value changes', () => {
    const finder = 'example';
    const expected = 'Default';

    const Example = createModel(() => {
      const [state, setState] = useState(expected);
      useEffect(() => {
        setState('Changed');
      }, []);

      return state;
    });

    function Consumer(): JSX.Element {
      const value = useValueOnce(Example);

      return (
        <p title={finder}>{ value }</p>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should throw an error if the model is not mounted before accessing.', () => {
    const Expected = createModel(() => 'Test');

    function Consumer(): JSX.Element {
      useValueOnce(Expected);

      return <Fragment>Test</Fragment>;
    }

    supressWarnings();
    expect(() => {
      render(<Consumer />);
    }).toThrowError();
    restoreWarnings();
  });
});
