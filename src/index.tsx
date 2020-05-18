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
  useContext, createContext, useEffect, useState,
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

export default function createModel<
  Model extends AccessibleObject,
  Props extends AccessibleObject = {},
>(
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

  /**
   * A component that provides the emitter instance
   */
  const EmitterProvider: React.FC<{}> = ({ children }) => {
    const emitter = useConstant(() => new Notifier<Model>({} as Model));

    return (
      <InternalContext.Provider value={emitter}>
        { children }
      </InternalContext.Provider>
    );
  };

  EmitterProvider.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
  };

  const EmitterConsumer: React.FC<Props> = ({ children, ...props }) => {
    /**
     * Access context
     */
    const notifier = useProviderContext();

    /**
     * Run hook
     */
    const model = useModelHook(props as Props);

    notifier.sync(model);

    useEffect(() => {
      notifier.consume(model);
    }, [notifier, model]);

    return (
      <>
        { children }
      </>
    );
  };

  EmitterConsumer.propTypes = {
    ...(options.propTypes || {} as Props),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  EmitterConsumer.defaultProps = {
    children: undefined,
  };

  /**
   * Provides the model and runs the model logic on re-renders
   */
  const Provider: React.FC<Props> = (props) => (
    <EmitterProvider>
      <EmitterConsumer {...props} />
    </EmitterProvider>
  );

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
   * uses the `Object.is` function for comparison
   * @param selector a function that receives the model state
   * and transforms it into a new value.
   * @param listen
   * listen conditionally, triggering re-renders when
   * the value updates. Defaults to true.
   */
  function useSelector<T>(selector: (model: Model) => T, listen = true): T {
    /**
     * Access context
     */
    const notifier = useProviderContext();

    const [state, setState] = useState(() => selector(notifier.value));

    useEffect(() => {
      if (listen) {
        const callback = (next: Model): void => {
          setState(() => selector(next));
        };

        notifier.on(callback);

        return (): void => notifier.off(callback);
      }
      return undefined;
    }, [notifier, selector, listen]);

    /**
     * Return the current state value
     */
    return state;
  }

  /**
   * Listens to the model's property for changes, and updates
   * the component with the new values.
   *
   * Property's value uses the `Object.is` function for comparison
   *
   * @param key property to listen for
   * @param listen
   * listen conditionally, triggering re-renders when
   * the value updates. Defaults to true.
   */
  function useProperty<T>(key: string, listen = true): T {
    const selector = React.useCallback((state) => state[key], [key]);
    return useSelector<T>(selector, listen);
  }


  /**
   * Transforms the model's state into a list of values and
   * listens for the changes from one of the values..
   *
   * If a value changes, the component re-renders.
   *
   * uses the `Object.is` function for comparison
   *
   * @param selector a function that receives the model state
   * @param listen
   * listen conditionally, triggering re-renders when
   * the value updates. Defaults to true.
   */
  function useSelectors<T extends any[]>(selector: (model: Model) => T, listen = true): T {
    const notifier = useProviderContext();

    const [state, setState] = useState(() => selector(notifier.value));

    useEffect(() => {
      if (listen) {
        const callback = (next: Model): void => {
          /**
           * New reference container
           */
          const values = selector(next);

          setState((current) => {
            /**
             * Iterate keys
             */
            for (let i = 0; i < current.length; i += 1) {
              /**
               * Get corresponding values
               */
              const currentValue = current[i];
              const newValue = values[i];

              /**
               * Compare values
               */
              if (!Object.is(currentValue, newValue)) {
                return values;
              }
            }

            return current;
          });
        };

        notifier.on(callback);

        return (): void => notifier.off(callback);
      }
      return undefined;
    }, [notifier, selector, listen]);

    /**
     * Return the current state value
     */
    return state;
  }

  /**
   * Listens to the model's properties for changes, and updates
   * the component with the new values.
   *
   * Property's value uses the `Object.is` function for comparison
   * @param keys array of keys to listen to
   * @param listen
   * listen conditionally, triggering re-renders when
   * the value updates. Defaults to true.
   */
  function useProperties<T extends any[]>(keys: string[], listen = true): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selector = React.useCallback((state) => keys.map((key) => state[key]) as T, keys);
    return useSelectors<T>(selector, listen);
  }

  /**
   * Listens to the model's properties for changes, and updates
   * the component with a new async value.
   *
   * @param selector selector function
   * @param listen should listen to the updates, defaults to true.
   */
  function useAsyncSelector<T>(
    selector: (model: Model) => Promise<T>,
    listen = true,
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
      if (listen) {
        let mounted = true;

        const callback = async (next: Model): Promise<void> => {
          setState({ status: 'pending' });

          try {
            const data = await selector(next);

            if (mounted) {
              setState({
                status: 'success',
                data,
              });
            }
          } catch (data) {
            if (mounted) {
              setState({
                status: 'failure',
                data,
              });
            }
          }
        };

        notifier.on(callback);

        return (): void => {
          mounted = false;
          notifier.off(callback);
        };
      }
      return undefined;
    }, [selector, listen, notifier]);

    return state;
  }

  /**
   * Listens to the model's properties for changes, and updates
   * the component with a new async value.
   *
   * Can only be used inside a Suspense-wrapped component.
   * @param selector selector function
   * @param key for caching purposes
   * @param listen should listen to the updates, defaults to true.
   */
  function useSuspendedSelector<T>(
    selector: (model: Model) => Promise<T>,
    key: string,
    listen = true,
  ): T | undefined {
    const notifier = useProviderContext();

    const forceUpdate = useForceUpdate();

    useEffect(() => {
      if (listen) {
        const callback = (next: Model): void => {
          createCachedData(selector(next), key, notifier.cache);

          forceUpdate();
        };

        notifier.on(callback);

        return (): void => notifier.off(callback);
      }
      return undefined;
    }, [notifier, selector, listen, key, forceUpdate]);

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
    listen = true,
  ): T | undefined {
    const notifier = useProviderContext();

    const forceUpdate = useForceUpdate();

    useEffect(() => {
      if (listen) {
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
      }
      return undefined;
    }, [notifier, selector, listen, key, forceUpdate]);

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
    useProperty,
    useProperties,
    useSelector,
    useSelectors,
    useAsyncSelector,
    useSuspendedSelector,
    useSuspendedState,
  };
}

export * from './types';
