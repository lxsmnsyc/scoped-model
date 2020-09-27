import React, {
  Suspense, useEffect, useState,
} from 'react';
import {
  cleanup, render, screen, waitFor, act,
} from '@testing-library/react';
import createModel, { useSuspenseSelector } from '../../src';
import { supressWarnings, restoreWarnings } from '../suppress-warnings';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import ErrorBound from '../error-boundary';

const sleep = (count: number) => new Promise((resolve) => {
  setTimeout(resolve, count * 1000, true);
});

const step = () => {
  act(() => {
    jest.advanceTimersByTime(1000);
  });
};

jest.useFakeTimers();

describe('useSuspenseSelector', () => {
  beforeEach(() => {
    supressWarnings();
  });
  afterEach(() => {
    restoreWarnings();
    cleanup();
  });
  it('should receive a pending state on initial render.', async () => {
    const finder = 'example';
    const expected = 'Pending';

    const Example = createModel(() => 'Hello World', {
      displayName: 'Test1',
    });

    function Internal(): JSX.Element {
      const value = useSuspenseSelector(
        Example,
        async (state) => {
          await sleep(1);
          return state;
        },
        'example',
      );

      return <>{ value }</>;
    }

    function Pending() {
      return <p title={finder}>{ expected }</p>;
    }

    function Consumer(): JSX.Element {
      return (
        <Suspense fallback={<Pending />}>
          <Internal />
        </Suspense>
      );
    }

    const result = render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(await waitFor(() => result.getByTitle(finder))).toContainHTML(expected);
  });
  it('should receive a success state upon resolution.', async () => {
    const finderA = 'finderA';
    const finderB = 'finderB';
    const expected = 'Hello World';

    const Example = createModel(() => expected, {
      displayName: 'Test2',
    });

    function Internal(): JSX.Element {
      const value = useSuspenseSelector(
        Example,
        async (state) => {
          await sleep(1);
          return state;
        },
        'example',
      );

      return <p title={finderB}>{ value }</p>;
    }

    function Pending() {
      return <p title={finderA}>Pending</p>;
    }

    function Consumer(): JSX.Element {
      return (
        <Suspense fallback={<Pending />}>
          <Internal />
        </Suspense>
      );
    }

    const result = render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(await waitFor(() => result.getByTitle(finderA))).toContainHTML('Pending');
    step();
    expect(await waitFor(() => screen.getByTitle(finderB))).toContainHTML(expected);
  });
  it('should receive a failure state upon rejection.', async () => {
    const finderA = 'finderA';
    const finderB = 'finderB';

    const Example = createModel(() => 'Hello World', {
      displayName: 'Test3',
    });

    function Internal(): JSX.Element {
      const value = useSuspenseSelector(
        Example,
        async () => {
          await sleep(1);
          throw new Error('failed');
        },
        'example',
      );

      return (
        <>
          { value }
        </>
      );
    }

    function Pending() {
      return <p title={finderA}>Pending</p>;
    }

    function Fallback() {
      return <p title={finderB}>Failure</p>;
    }

    function Consumer(): JSX.Element {
      return (
        <ErrorBound fallback={<Fallback />}>
          <Suspense fallback={<Pending />}>
            <Internal />
          </Suspense>
        </ErrorBound>
      );
    }

    const result = render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(await waitFor(() => result.getByTitle(finderA))).toContainHTML('Pending');
    step();
    expect(await waitFor(() => result.getByTitle(finderB))).toContainHTML('Failure');
  });
  it('should receive a pending state on model state update.', async () => {
    const finderA = 'finderA';
    const finderB = 'finderB';

    const Example = createModel(() => {
      const [state, setState] = useState('Initial');

      useEffect(() => {
        const timeout = setTimeout(() => {
          setState('Update');
        }, 2000);
        return () => clearTimeout(timeout);
      }, []);

      return state;
    }, {
      displayName: 'Test4',
    });

    const selector = async (state: string) => {
      await sleep(1);
      return state;
    };

    function Internal() {
      const value = useSuspenseSelector(Example, selector, 'example');

      return <p title={finderB}>{ value }</p>;
    }

    function Fallback() {
      return <p title={finderA}>Pending</p>;
    }

    function Consumer(): JSX.Element {
      return (
        <Suspense fallback={<Fallback />}>
          <Internal />
        </Suspense>
      );
    }

    const result = render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(await waitFor(() => result.getByTitle(finderA))).toContainHTML('Pending');
    step();
    expect(await waitFor(() => result.getByTitle(finderB))).toContainHTML('Initial');
    step();
    expect(await waitFor(() => result.getByTitle(finderA))).toContainHTML('Pending');
  });
  it('should receive a success state upon resolution after model state update.', async () => {
    const finderA = 'finderA';
    const finderB = 'finderB';
    const finderC = 'finderC';

    const Example = createModel(() => {
      const [state, setState] = useState('Initial');

      useEffect(() => {
        const timeout = setTimeout(() => {
          setState('Update');
        }, 2000);
        return () => clearTimeout(timeout);
      }, []);

      return state;
    }, {
      displayName: 'Test5',
    });

    const selector = async (state: string) => {
      await sleep(1);
      return state;
    };

    function Internal() {
      const value = useSuspenseSelector(Example, selector, 'example');

      return <p title={value === 'Initial' ? finderB : finderC}>{ value }</p>;
    }

    function Fallback() {
      return <p title={finderA}>Pending</p>;
    }

    function Consumer(): JSX.Element {
      return (
        <Suspense fallback={<Fallback />}>
          <Internal />
        </Suspense>
      );
    }

    const result = render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(await waitFor(() => result.getByTitle(finderA))).toContainHTML('Pending');
    step();
    expect(await waitFor(() => result.getByTitle(finderB))).toContainHTML('Initial');
    step();
    expect(await waitFor(() => result.getByTitle(finderA))).toContainHTML('Pending');
    step();
    expect(await waitFor(() => result.getByTitle(finderC))).toContainHTML('Update');
  });
  it('should receive a failure state upon rejection after model state update.', async () => {
    const finderA = 'finderA';
    const finderB = 'finderB';
    const finderC = 'finderC';

    const Example = createModel(() => {
      const [state, setState] = useState('Initial');

      useEffect(() => {
        const timeout = setTimeout(() => {
          setState('Update');
        }, 2000);
        return () => clearTimeout(timeout);
      }, []);

      return state;
    }, {
      displayName: 'Test6',
    });

    const selector = async (state: string) => {
      await sleep(1);
      if (state === 'Update') {
        throw new Error('failed');
      }
      return state;
    };

    function Internal() {
      const value = useSuspenseSelector(Example, selector, 'example');

      return <p title={finderB}>{ value }</p>;
    }

    function Pending() {
      return <p title={finderA}>Pending</p>;
    }

    function Fallback() {
      return <p title={finderC}>Failure</p>;
    }

    function Consumer(): JSX.Element {
      return (
        <ErrorBound fallback={<Fallback />}>
          <Suspense fallback={<Pending />}>
            <Internal />
          </Suspense>
        </ErrorBound>
      );
    }

    const result = render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(await waitFor(() => result.getByTitle(finderA))).toContainHTML('Pending');
    step();
    expect(await waitFor(() => result.getByTitle(finderB))).toContainHTML('Initial');
    step();
    expect(await waitFor(() => result.getByTitle(finderA))).toContainHTML('Pending');
    step();
    expect(await waitFor(() => result.getByTitle(finderC))).toContainHTML('Failure');
  });
  it('should throw an error if the model is not mounted before accessing.', () => {
    const Expected = createModel(() => 'Test');

    function Consumer(): JSX.Element {
      useSuspenseSelector(Expected, async (state) => {
        await sleep(1);
        return state;
      }, 'example');

      return <>Test</>;
    }

    expect(() => {
      render(<Consumer />);
    }).toThrowError();
  });
});
