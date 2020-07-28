/**
 * @license
 * MIT License
 *
 * Copyright (c) 2020 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2020
 */
import React, {
  useContext, createContext, useEffect, useState, useCallback,
} from 'react';
import * as PropTypes from 'prop-types';

import MissingScopedModelError from './utils/MissingScopedModelError';

import useConstant from './hooks/useConstant';
import useForceUpdate from './hooks/useForceUpdate';

import {
  AsyncState, AccessibleObject, ModelHook, ModelOptions, SuspendSelector, ScopedModelInterface,
} from './types';

import Notifier from './notifier';
import createCachedData, { suspendCacheData } from './create-cached-data';

function defaultCompare<T, R>(a: T, b: R): boolean {
  return !Object.is(a, b);
}

function compareList<T extends any[], R extends any[]>(
  a: T, b: R,
  compare = defaultCompare,
): boolean {
  if (a.length !== b.length) {
    return true;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (compare(a[i], b[i])) {
      return true;
    }
  }
  return false;
}

/**
 * Creates a model that accepts a React-base hook which returns the state of the model.
 * This state is injected to its children, and can be consumed through useSelector.
 * @param useModelHook
 * @param options
 */
export default function createModel<Model, Props extends AccessibleObject>(
  useModelHook: ModelHook<Model, Props>,
  options: ModelOptions<Props> = {},
): ScopedModelInterface<Model, Props> {
  /**
   * Create the context
   */
  const InternalContext = createContext<Notifier<Model> | null>(null);

  /**
   * Display name for the model
   */
  const displayName = options.displayName || 'AnonymousScopedModel';

  function useProviderContext(): Notifier<Model> {
    const context = useContext(InternalContext);

    if (!context) {
      throw new MissingScopedModelError(displayName);
    }

    return context;
  }

  const Provider: React.FC<Props> = ({ children, ...props }) => {
    const emitter = useConstant(() => new Notifier<Model>({} as Model));

    const model = useModelHook(props as Props);

    emitter.sync(model);

    useEffect(() => {
      emitter.consume(model);
    }, [emitter, model]);

    return (
      <InternalContext.Provider value={emitter}>
        { children }
      </InternalContext.Provider>
    );
  };

  Provider.propTypes = {
    ...(options.propTypes || {} as Props),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  /**
   * Provider default props
   */
  Provider.defaultProps = {
    ...options.defaultProps,
    children: undefined,
  };

  /**
   * Display name for the Provider
   */
  Provider.displayName = displayName;

  /**
   * Transforms the model's state and listens for the returned value change.
   *
   * If the value changes, the component re-renders.
   *
   * uses the `Object.is` function for comparison by default.
   *
   * @param map a function that receives the model state
   * and transforms it into a new value.
   * @param shouldUpdate a function that compares the
   * previously transformed value to the newly transformed value
   * and if it should replace the previous value and perform an update.
   */
  function useSelector<T>(
    map: (model: Model) => T,
    shouldUpdate = defaultCompare,
  ): T {
    /**
     * Access context
     */
    const notifier = useProviderContext();

    const [state, setState] = useState(() => map(notifier.value));

    useEffect(() => {
      const callback = (next: Model): void => {
        setState((old) => {
          const newValue = map(next);
          if (shouldUpdate(old, newValue)) {
            return newValue;
          }
          return old;
        });
      };

      notifier.on(callback);

      return (): void => notifier.off(callback);
    }, [notifier, map, shouldUpdate]);

    /**
     * Return the current state value
     */
    return state;
  }

  /**
   * Transforms the model's state into a list of values and
   * listens for the changes from one of the values..
   *
   * If a value changes, the component re-renders.
   *
   * uses the `Object.is` function for comparison by default.
   *
   * @param selector a function that receives the model state
   * @param shouldUpdate a function that compares the
   * previously transformed value to the newly transformed value
   * and if it should replace the previous value and perform an update.
   */
  function useSelectors<T extends any[]>(
    selector: (model: Model) => T,
    shouldUpdate = defaultCompare,
  ): T {
    const compare = useCallback((a, b) => (
      compareList(a, b, shouldUpdate)
    ), [shouldUpdate]);
    return useSelector(selector, compare);
  }

  /**
   * Listens to the model's properties for changes, and updates
   * the component with a new async value.
   *
   * @param selector selector function
   */
  function useAsyncSelector<T>(
    selector: (model: Model) => Promise<T>,
  ): AsyncState<T> {
    const notifier = useProviderContext();

    const [state, setState] = useState<AsyncState<T>>({ status: 'pending' });

    useEffect(() => {
      let mounted = true;

      selector(notifier.value).then(
        (data) => {
          if (mounted) {
            setState({
              status: 'success',
              data,
            });
          }
        },
        (data) => {
          if (mounted) {
            setState({
              status: 'failure',
              data,
            });
          }
        },
      );

      return (): void => {
        mounted = false;
      };
    }, [notifier.value, selector, setState]);

    useEffect(() => {
      let mounted = true;

      const callback = (next: Model) => {
        setState({ status: 'pending' });

        selector(next).then(
          (data) => {
            if (mounted) {
              setState({
                status: 'success',
                data,
              });
            }
          },
          (data) => {
            if (mounted) {
              setState({
                status: 'failure',
                data,
              });
            }
          },
        );
      };

      notifier.on(callback);

      return (): void => {
        mounted = false;
        notifier.off(callback);
      };
    }, [selector, notifier]);

    return state;
  }

  /**
   * Listens to the model's properties for changes, and updates
   * the component with a new async value.
   *
   * Can only be used inside a Suspense-wrapped component.
   * @param selector selector function
   * @param key for caching purposes
   */
  function useSuspendedSelector<T>(
    selector: (model: Model) => Promise<T>,
    key: string,
  ): T | undefined {
    const notifier = useProviderContext();

    const forceUpdate = useForceUpdate();

    useEffect(() => {
      const callback = (next: Model): void => {
        createCachedData(selector(next), key, notifier.cache);

        forceUpdate();
      };

      notifier.on(callback);

      return (): void => notifier.off(callback);
    }, [notifier, selector, key, forceUpdate]);

    return suspendCacheData(key, notifier.cache, () => {
      const cachedData = createCachedData(
        selector(notifier.value),
        key,
        notifier.cache,
      );

      throw cachedData.data;
    });
  }

  /**
   * Listens to the model's properties for changes, and updates
   * the component with a new value.
   *
   * Can only be used inside a Suspense-wrapped component.
   * @param selector selector function
   * @param key for caching purposes
   * @param listen should listen to the updates, defaults to true.
   */
  function useSuspendedState<T>(
    selector: (model: Model) => SuspendSelector<T>,
    key: string,
  ): T | undefined {
    const notifier = useProviderContext();

    const forceUpdate = useForceUpdate();

    useEffect(() => {
      const callback = (next: Model): void => {
        createCachedData(new Promise<T>((resolve) => {
          const { value, suspend } = selector(next);
          if (!suspend) {
            resolve(value);
          } else {
            const listener = (m: Model): void => {
              const { value: innerValue, suspend: innerSuspend } = selector(m);
              if (!innerSuspend) {
                resolve(innerValue);
                notifier.off(listener);
              }
            };

            notifier.on(listener);
          }
        }), key, notifier.cache);

        forceUpdate();
      };

      notifier.on(callback);

      return (): void => notifier.off(callback);
    }, [notifier, selector, key, forceUpdate]);

    return suspendCacheData(key, notifier.cache, () => {
      const cachedData = createCachedData(new Promise<T>((resolve) => {
        const { value, suspend } = selector(notifier.value);
        if (!suspend) {
          resolve(value);
        } else {
          const listener = (m: Model): void => {
            const { value: innerValue, suspend: innerSuspend } = selector(m);
            if (!innerSuspend) {
              resolve(innerValue);
              notifier.off(listener);
            }
          };

          notifier.on(listener);
        }
      }), key, notifier.cache);

      throw cachedData.data;
    });
  }

  return {
    Provider,
    useSelector,
    useSelectors,
    useAsyncSelector,
    useSuspendedSelector,
    useSuspendedState,
  };
}

export * from './types';
