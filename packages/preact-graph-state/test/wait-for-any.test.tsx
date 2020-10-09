/** @jsx h */
import { h } from 'preact';
import { Suspense } from 'preact/compat';
import {
  act, cleanup, render, screen, waitFor,
} from '@testing-library/preact';
import {
  createGraphNode,
  createGraphNodeResource,
  waitForAny,
} from 'graph-state';
import {
  GraphDomain,
  useGraphNodeResource,
  useGraphNodeValue,
} from '../src';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import ErrorBound from './error-boundary';
import { restoreWarnings, supressWarnings } from './suppress-warnings';

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

describe('waitForAny', () => {
  const resourceA = createGraphNodeResource(
    createGraphNode({
      get: async () => {
        await sleep(1);
        return 'Message A';
      },
    }),
  );
  const resourceB = createGraphNodeResource(
    createGraphNode({
      get: async () => {
        await sleep(2);
        return 'Message B';
      },
    }),
  );
  const resourceC = createGraphNodeResource(
    createGraphNode({
      get: async () => {
        await sleep(3);
        return 'Message C';
      },
    }),
  );
  const resourceF = createGraphNodeResource<string>(
    createGraphNode<Promise<string>>({
      get: async () => Promise.reject(new Error('Message F')),
    }),
  );

  describe('useGraphNodeValue', () => {
    it('should receive a pending state on initial render.', () => {
      const finder = 'example';
      const expected = 'Pending';

      const values = waitForAny([
        resourceA,
        resourceB,
        resourceC,
      ]);

      function Consumer(): JSX.Element {
        const value = useGraphNodeValue(values);

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
    it('should receive a success state when all resources has settled.', async () => {
      const expected = 'Message A';

      const values = waitForAny([
        resourceA,
        resourceB,
        resourceC,
      ]);

      function Consumer(): JSX.Element {
        const value = useGraphNodeValue(values);

        return (
          <p title={value.status}>
            {
              value.status === 'success' ? value.data : undefined
            }
          </p>
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
      const values = waitForAny([
        resourceA,
        resourceF,
        resourceC,
      ]);

      function Consumer(): JSX.Element {
        const value = useGraphNodeValue(values);

        return (
          <p title={value.status}>
            {
              value.status === 'failure' ? 'Error' : undefined
            }
          </p>
        );
      }

      render(
        <GraphDomain>
          <Consumer />
        </GraphDomain>,
      );

      expect(await waitFor(() => screen.getByTitle('failure'))).toContainHTML('Error');
    });
  });

  describe('useGraphNodeResource', () => {
    it('should receive a pending state on initial render.', () => {
      const finder = 'example';
      const expected = 'Pending';

      const values = waitForAny([
        resourceA,
        resourceB,
        resourceC,
      ]);

      function Consumer(): JSX.Element {
        const value = useGraphNodeResource(values);

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
    it('should receive a success state when all resources has settled.', async () => {
      const expected = 'Message A';

      const values = waitForAny([
        resourceA,
        resourceB,
        resourceC,
      ]);

      function Consumer(): JSX.Element {
        const value = useGraphNodeResource(values);

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
      const values = waitForAny([
        resourceA,
        resourceF,
        resourceC,
      ]);

      function Consumer(): JSX.Element {
        const value = useGraphNodeResource(values);

        return <p title="success">{ value }</p>;
      }

      function Pending(): JSX.Element {
        return <p title="pending">Pending</p>;
      }

      function Failure(): JSX.Element {
        return <p title="failure">Error</p>;
      }

      supressWarnings();
      render(
        <GraphDomain>
          <ErrorBound fallback={<Failure />}>
            <Suspense fallback={<Pending />}>
              <Consumer />
            </Suspense>
          </ErrorBound>
        </GraphDomain>,
      );

      expect(await waitFor(() => screen.getByTitle('failure'))).toContainHTML('Error');
      restoreWarnings();
    });
  });
});
