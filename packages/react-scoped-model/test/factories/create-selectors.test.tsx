import React, { useEffect, useRef, useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import createModel, { createSelectors } from '../../src';
import { supressWarnings, restoreWarnings } from '../suppress-warnings';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

afterEach(cleanup);

describe('createSelectors', () => {
  it('should receive the array of values supplied by the model and transformed by the selector.', () => {
    const expected = 'World';
    const finder = 'example';
    const Example = createModel(() => expected);

    const selector = (state: string) => [
      `Hello ${state}`,
    ];
    const useExample = createSelectors(Example, selector);

    function Consumer(): JSX.Element {
      const [value] = useExample();

      return (
        <p title={finder}>{ value }</p>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML(selector(expected)[0]);
  });
  it('should re-render if the transformed scoped model value changes', () => {
    const finder = 'example';
    const expected = 'Changed';

    const Example = createModel(() => {
      const [state, setState] = useState('Default');
      useEffect(() => {
        setState(expected);
      }, []);

      return state;
    });

    const selector = (state: string) => [
      `Hello ${state}`,
    ];
    const useExample = createSelectors(Example, selector);

    function Consumer(): JSX.Element {
      const [value] = useExample();

      return (
        <p title={finder}>{ value }</p>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML(selector(expected)[0]);
  });
  it('should not re-render if the transformed state is still the same even if the scoped model updates.', () => {
    const finder = 'example';

    const Example = createModel(() => {
      const [state, setState] = useState('Default');
      useEffect(() => {
        setState('Changed');
      }, []);

      return state.length;
    });

    const selector = (state: number) => [
      `Hello ${state}`,
    ];
    const useExample = createSelectors(Example, selector);

    function Consumer(): JSX.Element {
      const [value] = useExample();
      const count = useRef(0);

      count.current += 1;

      return (
        <>
          <p>{`Model: ${value}`}</p>
          <p title={finder}>{`Rendered times: ${count.current}`}</p>
        </>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML('1');
  });
  it('should not re-render if the returned array reference are the same between model updates.', () => {
    const finder = 'example';

    const Example = createModel(() => {
      const [state, setState] = useState('Default');
      useEffect(() => {
        setState('Changed');
      }, []);

      return state;
    });

    const reference: string[] = [];
    const selector = (state: string) => {
      reference[0] = `Hello ${state}`;
      return reference;
    };
    const useExample = createSelectors(Example, selector);

    function Consumer(): JSX.Element {
      const [value] = useExample();
      const count = useRef(0);

      count.current += 1;

      return (
        <>
          <p>{`Model: ${value}`}</p>
          <p title={finder}>{`Rendered times: ${count.current}`}</p>
        </>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML('1');
  });
  it('should always re-render if the returned array constantly changes size between model updates.', () => {
    const finder = 'example';

    const Example = createModel(() => {
      const [state, setState] = useState('Default');
      useEffect(() => {
        setState('Changed');
      }, []);

      return state;
    });

    const reference: string[] = [];
    const selector = (state: string) => {
      reference.push(`Hello ${state}`);
      return [...reference];
    };
    const useExample = createSelectors(Example, selector);

    function Consumer(): JSX.Element {
      const [value] = useExample();
      const count = useRef(0);

      count.current += 1;

      return (
        <>
          <p>{`Model: ${value}`}</p>
          <p title={finder}>{`Rendered times: ${count.current}`}</p>
        </>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML('2');
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

    const selector = (state: string) => [
      `Hello ${state}`,
    ];
    const useExample = createSelectors(Example, selector, () => false);

    function Consumer(): JSX.Element {
      const [value] = useExample();
      const count = useRef(0);

      count.current += 1;

      return (
        <>
          <p>{`Model: ${value}`}</p>
          <p title={finder}>{`Rendered times: ${count.current}`}</p>
        </>
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

    const useExample = createSelectors(Expected, (state) => [state]);

    function Consumer(): JSX.Element {
      useExample();

      return <>Test</>;
    }

    supressWarnings();
    expect(() => {
      render(<Consumer />);
    }).toThrowError();
    restoreWarnings();
  });
});
