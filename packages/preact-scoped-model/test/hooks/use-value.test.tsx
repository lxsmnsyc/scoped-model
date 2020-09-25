/** @jsx h */
import { Fragment, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { cleanup, render, screen } from '@testing-library/preact';
import createModel, { useValue } from '../../src';
import { supressWarnings, restoreWarnings } from '../suppress-warnings';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

afterEach(cleanup);

describe('useValue', () => {
  it('should receive the value supplied by the model.', () => {
    const expected = 'Hello World';
    const finder = 'example';
    const Example = createModel(() => expected);

    function Consumer(): JSX.Element {
      const value = useValue(Example);

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
  it('should re-render if the scoped model value changes', () => {
    const finder = 'example';
    const expected = 'Changed';

    const Example = createModel(() => {
      const [state, setState] = useState('Default');
      useEffect(() => {
        setState(expected);
      }, []);

      return state;
    });

    function Consumer(): JSX.Element {
      const value = useValue(Example);

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
  it('should not re-render if the state is still the same even if the scoped model updates.', () => {
    const finder = 'example';

    const Example = createModel(() => {
      const [state, setState] = useState('Default');
      useEffect(() => {
        setState('Changed');
      }, []);

      return state.length;
    });

    function Consumer(): JSX.Element {
      const value = useValue(Example);
      const count = useRef(0);

      count.current += 1;

      return (
        <Fragment>
          <p>{`Model: ${value}`}</p>
          <p title={finder}>{`Rendered times: ${count.current}`}</p>
        </Fragment>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML('1');
  });
  it('should not re-render if the comparer function returns falsy.', () => {
    const finder = 'example';

    const Example = createModel(() => {
      const [state, setState] = useState('Default');
      useEffect(() => {
        setState('Changed');
      }, []);

      return state;
    });

    function Consumer(): JSX.Element {
      const value = useValue(Example, () => false);
      const count = useRef(0);

      count.current += 1;

      return (
        <Fragment>
          <p>{`Model: ${value}`}</p>
          <p title={finder}>{`Rendered times: ${count.current}`}</p>
        </Fragment>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML('1');
  });
  it('should throw an error if the model is not mounted before accessing.', () => {
    const Expected = createModel(() => 'Test');

    function Consumer(): JSX.Element {
      useValue(Expected);

      return <Fragment>Test</Fragment>;
    }

    supressWarnings();
    expect(() => {
      render(<Consumer />);
    }).toThrowError();
    restoreWarnings();
  });
});
