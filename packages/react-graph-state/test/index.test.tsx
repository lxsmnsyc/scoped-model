import React from 'react';
import {
  act, cleanup, fireEvent, render, screen,
} from '@testing-library/react';
import {
  createGraphNode,
} from 'graph-state';
import {
  GraphDomain,
  useGraphNodeDispatch,
  useGraphNodeValue,
} from '../src';
import { supressWarnings, restoreWarnings } from './suppress-warnings';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

jest.useFakeTimers();

const step = () => {
  act(() => {
    jest.advanceTimersByTime(1000);
  });
};

afterEach(cleanup);

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
  it('should re-render if the graph node value changes', () => {
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

    step();
    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should re-render if the dependency graph node value changes', () => {
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

    step();
    expect(screen.getByTitle(finder)).toContainHTML(expected);
  });
  it('should throw an error if the graph domain is not mounted before accessing.', () => {
    const exampleNode = createGraphNode({
      get: 'Example',
    });

    function Consumer(): JSX.Element {
      useGraphNodeValue(exampleNode);

      return <>Test</>;
    }

    supressWarnings();
    expect(() => {
      render(<Consumer />);
    }).toThrowError();
    restoreWarnings();
  });
});

describe('useGraphNodeDispatch', () => {
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
      const update = useGraphNodeDispatch(exampleNode);

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
      const update = useGraphNodeDispatch(exampleNode);

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

    const exampleNode2 = createGraphNode<string, string>({
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
      const update = useGraphNodeDispatch(exampleNode2);

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
      useGraphNodeDispatch(exampleNode);

      return <>Test</>;
    }

    supressWarnings();
    expect(() => {
      render(<Consumer />);
    }).toThrowError();
    restoreWarnings();
  });
});
