/** @jsx h */
import { Fragment, h } from 'preact';
import { Suspense } from 'preact/compat';
import {
  act, cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/preact';
import { supressWarnings, restoreWarnings } from './suppress-warnings';
import ErrorBound from './error-boundary';
import {
  createGraphNode,
  createGraphNodeResource,
  GraphDomain,
  useGraphNodeResource,
  useGraphNodeSetValue,
  useGraphNodeValue,
} from '../src';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

jest.useFakeTimers();

const step = async () => {
  await act(() => {
    jest.advanceTimersByTime(1000);
  });
};

afterEach(cleanup);

const sleep = (count: number) => new Promise((resolve) => {
  setTimeout(resolve, count * 1000, true);
});

describe('useGraphNodeValue', () => {
  it('should receive the value supplied by the node.', () => {
    const expected = 'Hello World';
    const finder = 'example';

    const exampleNode = createGraphNode({
      get: expected,
    });

    function Consumer(): JSX.Element {
      const value = useGraphNodeValue(exampleNode);

      return (
        <p title={finder}>{ value }</p>
      );
    }

    render(
      <GraphDomain>
        <Consumer />
      </GraphDomain>,
    );

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should receive the value supplied by the dependency node.', () => {
    const expected = 'Hello World';
    const finder = 'example';

    const exampleNode = createGraphNode({
      get: expected,
    });

    const exampleNode2 = createGraphNode<string>({
      get: ({ get }) => get(exampleNode),
    });

    function Consumer(): JSX.Element {
      const value = useGraphNodeValue(exampleNode2);

      return (
        <p title={finder}>{ value }</p>
      );
    }

    render(
      <GraphDomain>
        <Consumer />
      </GraphDomain>,
    );

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should re-render if the graph node value changes', async () => {
    const finder = 'example';
    const expected = 'Changed';

    const exampleNode = createGraphNode<string>({
      get: ({ set }) => {
        setTimeout(set, 1000, expected);

        return 'Result';
      },
    });

    function Consumer(): JSX.Element {
      const value = useGraphNodeValue(exampleNode);

      return (
        <p title={finder}>{ value }</p>
      );
    }

    render(
      <GraphDomain>
        <Consumer />
      </GraphDomain>,
    );

    await step();
    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should re-render if the dependency graph node value changes', async () => {
    const finder = 'example';
    const expected = 'Changed';

    const exampleNode = createGraphNode<string>({
      get: ({ set }) => {
        setTimeout(set, 1000, expected);

        return 'Result';
      },
    });

    const exampleNode2 = createGraphNode<string>({
      get: ({ get }) => get(exampleNode),
    });

    function Consumer(): JSX.Element {
      const value = useGraphNodeValue(exampleNode2);

      return (
        <p title={finder}>{ value }</p>
      );
    }

    render(
      <GraphDomain>
        <Consumer />
      </GraphDomain>,
    );

    await step();
    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should throw an error if the graph domain is not mounted before accessing.', () => {
    const exampleNode = createGraphNode({
      get: 'Example',
    });

    function Consumer(): JSX.Element {
      useGraphNodeValue(exampleNode);

      return <Fragment>Test</Fragment>;
    }

    supressWarnings();
    expect(() => {
      render(<Consumer />);
    }).toThrowError();
    restoreWarnings();
  });
});

describe('useGraphNodeSetValue', () => {
  it('should re-render the consumer components of the node', () => {
    const expected = 'Changed';
    const finder = 'example';

    const exampleNode = createGraphNode({
      get: 'Initial',
    });

    function Consumer(): JSX.Element {
      const value = useGraphNodeValue(exampleNode);

      return (
        <p title={finder}>{ value }</p>
      );
    }

    function Updater(): JSX.Element {
      const update = useGraphNodeSetValue(exampleNode);

      return (
        <button
          type="button"
          onClick={() => {
            update(expected);
          }}
        >
          Update
        </button>
      );
    }

    render(
      <GraphDomain>
        <Consumer />
        <Updater />
      </GraphDomain>,
    );

    fireEvent.click(screen.getByText('Update'));

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should re-render the consumer components of the dependent node', () => {
    const expected = 'Changed';
    const finder = 'example';

    const exampleNode = createGraphNode({
      get: 'Initial',
    });

    const exampleNode2 = createGraphNode<string>({
      get: ({ get }) => get(exampleNode),
    });

    function Consumer(): JSX.Element {
      const value = useGraphNodeValue(exampleNode2);

      return (
        <p title={finder}>{ value }</p>
      );
    }

    function Updater(): JSX.Element {
      const update = useGraphNodeSetValue(exampleNode);

      return (
        <button
          type="button"
          onClick={() => {
            update(expected);
          }}
        >
          Update
        </button>
      );
    }

    render(
      <GraphDomain>
        <Consumer />
        <Updater />
      </GraphDomain>,
    );

    fireEvent.click(screen.getByText('Update'));

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should re-render the consumer components of the dependency node through side-effects', () => {
    const expected = 'Changed';
    const finder = 'example';

    const exampleNode = createGraphNode({
      get: 'Initial',
    });

    const exampleNode2 = createGraphNode<string>({
      get: ({ get }) => get(exampleNode),
      set: ({ set }, newValue) => {
        set(exampleNode, newValue);
      },
    });

    function Consumer(): JSX.Element {
      const value = useGraphNodeValue(exampleNode);

      return (
        <p title={finder}>{ value }</p>
      );
    }

    function Updater(): JSX.Element {
      const update = useGraphNodeSetValue(exampleNode2);

      return (
        <button
          type="button"
          onClick={() => {
            update(expected);
          }}
        >
          Update
        </button>
      );
    }

    render(
      <GraphDomain>
        <Consumer />
        <Updater />
      </GraphDomain>,
    );

    fireEvent.click(screen.getByText('Update'));

    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });

  it('should throw an error if the graph domain is not mounted before accessing.', () => {
    const exampleNode = createGraphNode({
      get: 'Example',
    });

    function Consumer(): JSX.Element {
      useGraphNodeSetValue(exampleNode);

      return <Fragment>Test</Fragment>;
    }

    supressWarnings();
    expect(() => {
      render(<Consumer />);
    }).toThrowError();
    restoreWarnings();
  });
});

describe('createGraphNodeResource', () => {
  describe('useGraphNodeValue', () => {
    it('should receive a pending state on initial render.', () => {
      const finder = 'example';
      const expected = 'Pending';

      const exampleAsync = createGraphNode({
        get: async () => {
          await sleep(1);
          return 'Hello World';
        },
      });
      const exampleResource = createGraphNodeResource(exampleAsync);

      function Consumer(): JSX.Element {
        const value = useGraphNodeValue(exampleResource);

        return (
          <p title={finder}>
            {
              value.status === 'pending' ? expected : undefined
            }
          </p>
        );
      }

      render(
        <GraphDomain>
          <Consumer />
        </GraphDomain>,
      );

      expect(screen.getByTitle(finder)).toContainHTML(expected);
    });
    it('should receive a success state upon resolution.', async () => {
      const expected = 'Hello World';

      const exampleAsync = createGraphNode({
        get: async () => {
          await sleep(1);
          return expected;
        },
      });
      const exampleResource = createGraphNodeResource(exampleAsync);

      function Consumer(): JSX.Element {
        const value = useGraphNodeValue(exampleResource);
        return (
          <Fragment>
            <p title={value.status}>
              {
                value.status === 'success' ? value.data : undefined
              }
            </p>
          </Fragment>
        );
      }

      render(
        <GraphDomain>
          <Consumer />
        </GraphDomain>,
      );

      await step();
      expect(await waitFor(() => screen.getByTitle('success'))).toContainHTML(expected);
    });
    it('should receive a failure state upon rejection.', async () => {
      const exampleAsync = createGraphNode({
        get: async () => {
          await sleep(1);
          throw new Error('failed');
        },
      });
      const exampleResource = createGraphNodeResource(exampleAsync);

      function Consumer(): JSX.Element {
        const value = useGraphNodeValue(exampleResource);

        return (
          <Fragment>
            <p title={value.status}>
              {
                value.status === 'failure' ? 'Error' : undefined
              }
            </p>
          </Fragment>
        );
      }

      render(
        <GraphDomain>
          <Consumer />
        </GraphDomain>,
      );

      await step();
      expect(await waitFor(() => screen.getByTitle('failure'))).toContainHTML('Error');
    });
  });
  describe('useGraphNodeResource', () => {
    it('should receive a pending state on initial render.', () => {
      const finder = 'example';
      const expected = 'Pending';

      const exampleAsync = createGraphNode({
        get: async () => {
          await sleep(1);
          return 'Hello World';
        },
      });
      const exampleResource = createGraphNodeResource(exampleAsync);

      function Consumer(): JSX.Element {
        const value = useGraphNodeResource(exampleResource);

        return <p title="success">{ value }</p>;
      }

      function Pending(): JSX.Element {
        return <p title={finder}>Pending</p>;
      }

      render(
        <GraphDomain>
          <Suspense fallback={<Pending />}>
            <Consumer />
          </Suspense>
        </GraphDomain>,
      );

      expect(screen.getByTitle(finder)).toContainHTML(expected);
    });
    it('should receive a success state upon resolution.', async () => {
      const expected = 'Hello World';

      const exampleAsync = createGraphNode({
        get: async () => {
          await sleep(1);
          return expected;
        },
      });
      const exampleResource = createGraphNodeResource(exampleAsync);

      function Consumer(): JSX.Element {
        const value = useGraphNodeResource(exampleResource);

        return <p title="success">{ value }</p>;
      }

      function Pending(): JSX.Element {
        return <p title="pending">Pending</p>;
      }

      render(
        <GraphDomain>
          <Suspense fallback={<Pending />}>
            <Consumer />
          </Suspense>
        </GraphDomain>,
      );

      await step();
      expect(await waitFor(() => screen.getByTitle('success'))).toContainHTML(expected);
    });
    it('should receive a failure state upon rejection.', async () => {
      const exampleAsync = createGraphNode({
        get: async () => {
          await sleep(1);
          throw new Error('failed');
        },
      });
      const exampleResource = createGraphNodeResource(exampleAsync);

      function Consumer(): JSX.Element {
        const value = useGraphNodeValue(exampleResource);

        return (
          <Fragment>
            <p title={value.status}>
              {
                value.status === 'failure' ? 'Error' : undefined
              }
            </p>
          </Fragment>
        );
      }

      function Pending(): JSX.Element {
        return <p title="pending">Pending</p>;
      }

      function Failure(): JSX.Element {
        return <p title="failure">Error</p>;
      }

      render(
        <GraphDomain>
          <ErrorBound fallback={<Failure />}>
            <Suspense fallback={<Pending />}>
              <Consumer />
            </Suspense>
          </ErrorBound>
        </GraphDomain>,
      );

      await step();
      expect(await waitFor(() => screen.getByTitle('failure'))).toContainHTML('Error');
    });
  });
});
