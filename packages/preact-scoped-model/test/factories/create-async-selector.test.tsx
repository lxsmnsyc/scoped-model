/** @jsx h */
import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/preact';
import createModel, { createAsyncSelector } from '../../src';
import { supressWarnings, restoreWarnings } from '../suppress-warnings';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

afterEach(cleanup);

const sleep = (count: number) => new Promise((resolve) => {
  setTimeout(resolve, count * 1000, true);
});

jest.useFakeTimers();

describe('createAsyncSelector', () => {
  it('should receive a pending state on initial render.', () => {
    const finder = 'example';
    const expected = 'Pending';

    const Example = createModel(() => 'Hello World');

    const useExample = createAsyncSelector(Example, async (state) => {
      await sleep(1);
      return state;
    });

    function Consumer(): JSX.Element {
      const value = useExample();

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

    const useExample = createAsyncSelector(Example, async (state) => {
      await sleep(1);
      return state;
    });

    function Consumer(): JSX.Element {
      const value = useExample();

      return (
        <Fragment>
          { value.status === 'success' && <span role="alert">Success</span>}
          <p title={finder}>
            {
              value.status === 'success' ? value.data : undefined
            }
          </p>
        </Fragment>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    jest.advanceTimersByTime(1000);
    await waitFor(() => screen.getByRole('alert'));

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should receive a failure state upon rejection.', async () => {
    const finder = 'example';
    const expected = 'Hello World';

    const Example = createModel(() => expected);

    const useExample = createAsyncSelector(Example, async () => {
      await sleep(1);
      throw new Error('failed');
    });

    function Consumer(): JSX.Element {
      const value = useExample();

      return (
        <Fragment>
          { value.status === 'failure' && <span role="alert">Failure</span>}
          <p title={finder}>
            {
              value.status === 'failure' ? 'Error' : undefined
            }
          </p>
        </Fragment>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    jest.advanceTimersByTime(1000);
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

    const useExample = createAsyncSelector(Example, async (state) => {
      await sleep(1);
      return state;
    });

    function Consumer(): JSX.Element {
      const value = useExample();

      return (
        <Fragment>
          <p title={value.status === 'pending' ? finderA : finderB}>
            {value.status === 'success' ? value.data : 'Pending'}
          </p>
        </Fragment>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finderA)).toContainHTML('Pending');
    jest.advanceTimersByTime(1000);
    expect(await waitFor(() => screen.getByTitle(finderB))).toContainHTML('Initial');
    jest.advanceTimersByTime(1000);
    expect(await waitFor(() => screen.getByTitle(finderA))).toContainHTML('Pending');
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

    const useExample = createAsyncSelector(Example, async (state) => {
      await sleep(1);
      return state;
    });

    function Consumer(): JSX.Element {
      const value = useExample();

      return (
        <Fragment>
          <p title={value.status === 'pending' ? finderA : finderB}>
            {value.status === 'success' ? value.data : 'Pending'}
          </p>
        </Fragment>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finderA)).toContainHTML('Pending');
    jest.advanceTimersByTime(1000);
    expect(await waitFor(() => screen.getByTitle(finderB))).toContainHTML('Initial');
    jest.advanceTimersByTime(1000);
    expect(await waitFor(() => screen.getByTitle(finderA))).toContainHTML('Pending');
    jest.advanceTimersByTime(1000);
    expect(await waitFor(() => screen.getByTitle(finderB))).toContainHTML('Update');
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

    const useExample = createAsyncSelector(Example, async (state: string) => {
      await sleep(1);
      if (state === 'Update') {
        throw new Error('failed');
      }
      return state;
    });

    function Consumer(): JSX.Element {
      const value = useExample();

      return (
        <Fragment>
          <p title={value.status === 'pending' ? finderA : finderB}>
            {value.status === 'success' && value.data}
            {value.status === 'pending' && 'Pending'}
            {value.status === 'failure' && 'Error'}
          </p>
        </Fragment>
      );
    }

    render(
      <Example.Provider>
        <Consumer />
      </Example.Provider>,
    );

    expect(screen.getByTitle(finderA)).toContainHTML('Pending');
    jest.advanceTimersByTime(1000);
    expect(await waitFor(() => screen.getByTitle(finderB))).toContainHTML('Initial');
    jest.advanceTimersByTime(1000);
    expect(await waitFor(() => screen.getByTitle(finderA))).toContainHTML('Pending');
    jest.advanceTimersByTime(1000);
    expect(await waitFor(() => screen.getByTitle(finderB))).toContainHTML('Error');
  });
  it('should throw an error if the model is not mounted before accessing.', () => {
    const Expected = createModel(() => 'Test');

    const useExample = createAsyncSelector(Expected, async (state) => {
      await sleep(1);
      return state;
    });

    function Consumer(): JSX.Element {
      useExample();

      return <Fragment>Test</Fragment>;
    }

    supressWarnings();
    expect(() => {
      render(<Consumer />);
    }).toThrowError();
    restoreWarnings();
  });
});
