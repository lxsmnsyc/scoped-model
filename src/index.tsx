/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
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
 * @copyright Alexis Munsayac 2019
 */
import * as React from 'react';
import * as PropTypes from 'prop-types';

import MissingScopedModelError from './utils/MissingScopedModelError';

import useConstant from './hooks/useConstant';
import useForceUpdate from './hooks/useForceUpdate';
import useIsomorphicEffect from './hooks/useIsomorphicEffect';
import usePromise from './hooks/usePromise';

export interface IModelState {
  [key: string]: any;
}

export interface IModelProps {
  [key: string]: any;
}

type EmitterListener<M extends IModelState> = (model: M) => void;

export interface AsyncFailure {
  data: any;
  status: 'failure';
}

export interface AsyncSuccess<T> {
  data: T;
  status: 'success';
}

export interface AsyncPending {
  status: 'pending';
}

export type AsyncState<T> = AsyncSuccess<T> | AsyncFailure | AsyncPending;

export interface CachedPromise<T> {
  instance: Promise<void>;
  state: AsyncState<T>;
}

type EmitterAction<M> = (listener: EmitterListener<M>) => void;

interface IEmitter<M extends IModelState> {
  consume?: EmitterListener<M>;
  on: EmitterAction<M>;
  off: EmitterAction<M>;
  state: M;
  cache: Map<string, CachedPromise<any>>;
}

function createEmitter<M extends IModelState>(): IEmitter<M> {
  const listeners = new Set<EmitterListener<M>>();

  const instance: IEmitter<M> = {
    state: {} as M,
    on: (listener: EmitterListener<M>) => listeners.add(listener),
    off: (listener: EmitterListener<M>) => listeners.delete(listener),
    cache: new Map(),
  };

  instance.consume = (value: M) => {
    new Set(listeners).forEach((fn) => fn(value));
    instance.state = value;
  };

  return instance;
}

export type ModelHook<M extends IModelState, P extends {}> = (props: P) => M;

export interface ModelOptions<P> {
  displayName?: string;
  propTypes?: React.WeakValidationMap<P>;
  defaultProps?: Partial<P>;
}

export interface SuspendSelector<T> {
  value: T;
  suspend: boolean;
}

function createCachedData
<T>(promise: Promise<T>, key: string, cache: Map<string, CachedPromise<any>>): CachedPromise<T> {
  const cachedData: CachedPromise<T> = {
    instance: promise.then(
      (value) => {
        cachedData.state = {
          status: 'success',
          data: value,
        };
      },
      (error) => {
        cachedData.state = {
          status: 'failure',
          data: error,
        };
      },
    ),
    state: {
      status: 'pending',
    },
  };

  cache.set(key, cachedData);

  return cachedData;
}

export default function createModel
<M extends IModelState, P extends IModelProps = {}>(
  modelHook: ModelHook<M, P>,
  options: ModelOptions<P> = {},
) {
  /**
   * Create the context
   */
  const Context = React.createContext<IEmitter<M> | null>(null);

  /**
   * Display name for the model
   */
  const displayName = options.displayName || 'AnonymousScopedModel';

  /**
   * A component that provides the emitter instance
   */
  const EmitterProvider: React.FC<{}> = ({ children }) => {
    const emitter = useConstant(() => createEmitter<M>());

    return (
      <Context.Provider value={emitter}>
        { children }
      </Context.Provider>
    );
  };

  EmitterProvider.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
  };

  const EmitterConsumer: React.FC<P> = ({ children, ...props }) => {
    /**
     * Access context
     */
    const context = React.useContext(Context);

    /**
     * Run hook
     */
    const model = modelHook(props as P);

    /**
     * Consume the model
     */
    if (context) {
      if (context.consume) {
        context.consume(model);
      }
    } else {
      throw new MissingScopedModelError(displayName);
    }

    return (
      <>
        { children }
      </>
    );
  };

  EmitterConsumer.propTypes = {
    ...(options.propTypes || {} as P),
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
  const Provider: React.FC<P> = (props) => (
    <EmitterProvider>
      <EmitterConsumer {...props} />
    </EmitterProvider>
  );

  Provider.propTypes = {
    ...(options.propTypes || {} as P),
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

  function useProviderContext() {
    /**
     * Access context
     */
    const context = React.useContext(Context);

    if (!context) {
      throw new MissingScopedModelError(displayName);
    }
    return context;
  }

  function useListen
    <T extends((...params: any) => any)>(context: IEmitter<M>, callback: T, listen: boolean) {
    /**
     * Listen to the changes
     */
    useIsomorphicEffect(() => {
      if (listen) {
        /**
         * Register callback
         */
        context.on(callback);

        /**
         * Unregister on dependency update
         */
        return () => context.off(callback);
      }
      return () => null;
    }, [context, listen, callback]);
  }

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
  function useSelector<T>(selector: (model: M) => T, listen = true): T {
    /**
     * Access context
     */
    const context = useProviderContext();

    /**
     * Used for force updating/re-rendering
     */
    const forceUpdate = useForceUpdate();

    /**
     * Used to contain the state
     */
    const ref = React.useRef(selector(context.state));

    /**
     * Wrap the state setter for watching the property
     */
    const callback = React.useCallback((next: M) => {
      const selected = selector(next);
      /**
       * Compare states
       */
      if (!Object.is(ref.current, selected)) {
        /**
         * Update state reference
         */
        ref.current = selected;

        /**
         * Force update this component
         */
        forceUpdate();
      }
    }, [forceUpdate, selector]);

    useListen(context, callback, listen);

    /**
     * Return the current state value
     */
    return ref.current;
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
  function useSelectors<T extends any[]>(selector: (model: M) => T, listen = true) {
    /**
     * Access context
     */
    const context = useProviderContext();

    /**
     * Used for force updating/re-rendering
     */
    const forceUpdate = useForceUpdate();

    /**
     * Get all states
     */
    const states = React.useMemo(() => (
      selector(context.state)
    ), [context.state, selector]);

    /**
     * Used to contain the state
     */
    const ref = React.useRef(states);

    /**
     * Wrap the state setter for watching the property
     */
    const callback = React.useCallback((next: M) => {
      /**
       * New reference container
       */
      const values = selector(next);

      /**
       * Do force update flag
       */
      let doUpdate = false;

      /**
       * Iterate keys
       */
      for (let i = 0; i < ref.current.length; i += 1) {
        /**
         * Get corresponding values
         */
        const currentValue = ref.current[i];
        const newValue = values[i];

        /**
         * Compare values
         */
        if (!Object.is(currentValue, newValue)) {
          doUpdate = true;
          break;
        }
      }

      /**
       * If doUpdate is true, force update this component
       */
      if (doUpdate) {
        ref.current = values;
        forceUpdate();
      }
    }, [forceUpdate, selector]);


    useListen(context, callback, listen);
    /**
     * Return the current state value
     */
    return ref.current;
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
  function useAsyncSelector
  <T>(selector: (model: M) => Promise<T>, listen = true): AsyncState<T> {
    /**
     * Access context
     */
    const context = useProviderContext();

    /**
     * callback for forced re-rendering
     */
    const data = React.useRef<AsyncState<T>>({ status: 'pending' });

    /**
     * Used for force updating/re-rendering
     */
    const forceUpdate = useForceUpdate();

    const mounted = usePromise([selector]);

    useIsomorphicEffect(() => {
      mounted(selector(context.state)).then(
        (value) => {
          data.current = {
            status: 'success',
            data: value,
          };
          forceUpdate();
        },
        (error) => {
          data.current = {
            status: 'failure',
            data: error,
          };
          forceUpdate();
        },
      );
    }, []);

    const callback = React.useCallback(async (next: M) => {
      data.current = { status: 'pending' };
      forceUpdate();
      try {
        const value = await mounted(selector(next));
        data.current = {
          status: 'success',
          data: value,
        };
      } catch (error) {
        data.current = {
          status: 'failure',
          data: error,
        };
      } finally {
        forceUpdate();
      }
    }, [forceUpdate, mounted, selector]);

    useListen(context, callback, listen);

    return data.current;
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
  function useSuspendedSelector
  <T>(selector: (model: M) => Promise<T>, key: string, listen = true): T | undefined {
    /**
     * Access context
     */
    const context = useProviderContext();

    /**
     * callback for forced re-rendering
     */
    const forceUpdate = useForceUpdate();

    const callback = React.useCallback((next: M) => {
      createCachedData(selector(next), key, context.cache);

      forceUpdate();
    }, [context, forceUpdate, selector, key]);

    useListen(context, callback, listen);

    /**
     * Check if cache exists
     */
    if (context.cache.has(key)) {
      /**
       * Get cache value
       */
      const cache = context.cache.get(key);

      /**
       * If cached data exists, return data
       */
      if (cache) {
        const { state } = cache as CachedPromise<T>;

        switch (state.status) {
          case 'success': return state.data;
          case 'failure': throw state.data;
          case 'pending':
          default: throw cache.instance;
        }
      }
    } else {
      const cachedData = createCachedData(selector(context.state), key, context.cache);

      throw cachedData.instance;
    }

    return undefined;
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
  function useSuspendedState
  <T>(selector: (model: M) => SuspendSelector<T>, key: string, listen = true): T | undefined {
    /**
     * Access context
     */
    const context = useProviderContext();

    /**
     * callback for forced re-rendering
     */
    const forceUpdate = useForceUpdate();

    const callback = React.useCallback((next: M) => {
      createCachedData(new Promise<T>((resolve) => {
        const { value, suspend } = selector(next);
        if (!suspend) {
          resolve(value);
        } else {
          const listener = (m: M) => {
            const { value: innerValue, suspend: innerSuspend } = selector(m);
            if (!innerSuspend) {
              resolve(innerValue);
              context.off(listener);
            }
          };

          context.on(listener);
        }
      }), key, context.cache);

      forceUpdate();
    }, [context, forceUpdate, selector, key]);

    useListen(context, callback, listen);

    /**
     * Check if cache exists
     */
    if (context.cache.has(key)) {
      /**
       * Get cache value
       */
      const cache = context.cache.get(key);

      /**
       * If cached data exists, return data
       */
      if (cache) {
        const { state } = cache as CachedPromise<T>;

        switch (state.status) {
          case 'success': return state.data;
          case 'failure': throw state.data;
          case 'pending':
          default: throw cache.instance;
        }
      }
    } else {
      const cachedData = createCachedData(new Promise<T>((resolve) => {
        const { value, suspend } = selector(context.state);
        if (!suspend) {
          resolve(value);
        } else {
          const listener = (m: M) => {
            const { value: innerValue, suspend: innerSuspend } = selector(m);
            if (!innerSuspend) {
              resolve(innerValue);
              context.off(listener);
            }
          };

          context.on(listener);
        }
      }), key, context.cache);

      throw cachedData.instance;
    }

    return undefined;
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
