import React, { useEffect, useRef, useState } from 'react';
import {
  cleanup, render, screen, waitFor,
} from '@testing-library/react';
import createModel, { useAsyncSelector } from '../../src';
import { supressWarnings, restoreWarnings } from '../suppress-warnings';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

afterEach(cleanup);

const sleep = (count: number) => new Promise((resolve) => {
  setTimeout(resolve, count * 1000, true);
});

describe('useAsyncSelector', () => {
  it('should receive a pending state on initial render.', () => {
    const finder = 'example';
    const expected = 'Pending';

    const Example = createModel(() => 'Hello World');

    function Consumer(): JSX.Element {
      const value = useAsyncSelector(Example, async (state) => {
        await sleep(1);
        return state;
      });

      return (
        <p title={finder}>
          {
            value.status === 'pending' ? expected : undefined
          }
        </p>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should receive a success state upon resolution.', async () => {
    const finder = 'example';
    const expected = 'Hello World';

    const Example = createModel(() => expected);

    function Consumer(): JSX.Element {
      const value = useAsyncSelector(Example, async (state) => {
        await sleep(1);
        return state;
      });

      return (
        <>
          { value.status === 'success' && <span role="alert">Success</span>}
          <p title={finder}>
            {
              value.status === 'success' ? value.data : undefined
            }
          </p>
        </>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    await waitFor(() => screen.getByRole('alert'));

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should receive a failure state upon rejection.', async () => {
    const finder = 'example';
    const expected = 'Hello World';

    const Example = createModel(() => expected);

    function Consumer(): JSX.Element {
      const value = useAsyncSelector(Example, async () => {
        await sleep(1);
        throw new Error('failed');
      });

      return (
        <>
          { value.status === 'failure' && <span role="alert">Failure</span>}
          <p title={finder}>
            {
              value.status === 'failure' ? 'Error' : undefined
            }
          </p>
        </>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    await waitFor(() => screen.getByRole('alert'));

    expect(screen.getByTitle(finder)).toContainHTML('Error');
  });
  it('should receive a pending state on model state update.', async () => {
    const finderA = 'finderA';
    const finderB = 'finderB';

    const Example = createModel(() => {
      const [state, setState] = useState('Initial');

      useEffect(() => {
        sleep(2).then(() => {
          setState('Update');
        }, () => {
          // no catch
        });
      }, []);

      return state;
    });

    const selector = async (state: string) => {
      await sleep(1);
      return state;
    };

    function Consumer(): JSX.Element {
      const value = useAsyncSelector(Example, selector);

      const renderCount = useRef(0);

      renderCount.current += 1;

      return (
        <>
          <p title={value.status === 'pending' ? finderA : finderB}>
            {value.status === 'success' ? value.data : 'Pending'}
          </p>
        </>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finderA)).toContainHTML('Pending');
    await waitFor(() => screen.getByTitle(finderB));
    expect(screen.getByTitle(finderB)).toContainHTML('Initial');
    await waitFor(() => screen.getByTitle(finderA));
    expect(screen.getByTitle(finderA)).toContainHTML('Pending');
  });
  it('should receive a success state upon resolution after model state update.', async () => {
    const finderA = 'finderA';
    const finderB = 'finderB';

    const Example = createModel(() => {
      const [state, setState] = useState('Initial');

      useEffect(() => {
        sleep(2).then(() => {
          setState('Update');
        }, () => {
          // no catch
        });
      }, []);

      return state;
    });

    const selector = async (state: string) => {
      await sleep(1);
      return state;
    };

    function Consumer(): JSX.Element {
      const value = useAsyncSelector(Example, selector);

      const renderCount = useRef(0);

      renderCount.current += 1;

      return (
        <>
          <p title={value.status === 'pending' ? finderA : finderB}>
            {value.status === 'success' ? value.data : 'Pending'}
          </p>
        </>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finderA)).toContainHTML('Pending');
    await waitFor(() => screen.getByTitle(finderB));
    expect(screen.getByTitle(finderB)).toContainHTML('Initial');
    await waitFor(() => screen.getByTitle(finderA));
    expect(screen.getByTitle(finderA)).toContainHTML('Pending');
    await waitFor(() => screen.getByTitle(finderB));
    expect(screen.getByTitle(finderB)).toContainHTML('Update');
  });
  it('should receive a failure state upon rejection after model state update.', async () => {
    const finderA = 'finderA';
    const finderB = 'finderB';

    const Example = createModel(() => {
      const [state, setState] = useState('Initial');

      useEffect(() => {
        sleep(2).then(() => {
          setState('Update');
        }, () => {
          // no catch
        });
      }, []);

      return state;
    });

    const selector = async (state: string) => {
      await sleep(1);
      if (state === 'Update') {
        throw new Error('failed');
      }
      return state;
    };

    function Consumer(): JSX.Element {
      const value = useAsyncSelector(Example, selector);

      const renderCount = useRef(0);

      renderCount.current += 1;

      return (
        <>
          <p title={value.status === 'pending' ? finderA : finderB}>
            {value.status === 'success' && value.data}
            {value.status === 'pending' && 'Pending'}
            {value.status === 'failure' && 'Error'}
          </p>
        </>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finderA)).toContainHTML('Pending');
    await waitFor(() => screen.getByTitle(finderB));
    expect(screen.getByTitle(finderB)).toContainHTML('Initial');
    await waitFor(() => screen.getByTitle(finderA));
    expect(screen.getByTitle(finderA)).toContainHTML('Pending');
    await waitFor(() => screen.getByTitle(finderB));
    expect(screen.getByTitle(finderB)).toContainHTML('Error');
  });
  it('should throw an error if the model is not mounted before accessing.', () => {
    const Expected = createModel(() => 'Test');

    function Consumer(): JSX.Element {
      useAsyncSelector(Expected, async (state) => {
        await sleep(1);
        return state;
      });

      return <>Test</>;
    }

    supressWarnings();
    expect(() => {
      render(<Consumer />);
    }).toThrowError();
    restoreWarnings();
  });
});
