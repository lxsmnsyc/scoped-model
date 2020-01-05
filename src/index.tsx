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

export interface IModelState {
  [key: string]: any;
}

export interface IModelProps {
  [key: string]: any;
}

type EmitterListener<M extends IModelState> = (model: M) => void;
interface IEmitter<M extends IModelState> {
  consume?: (value: M) => void;
  on: (listener: EmitterListener<M>) => void;
  off: (listener: EmitterListener<M>) => void;
  state: M;
}

function createEmitter<M extends IModelState>(): IEmitter<M> {
  const listeners = new Set<EmitterListener<M>>();

  const instance: IEmitter<M> = {
    state: {} as M,
    on: (listener: EmitterListener<M>) => listeners.add(listener),
    off: (listener: EmitterListener<M>) => listeners.delete(listener),
  };

  instance.consume = (value: M) => {
    new Set(listeners).forEach((fn) => fn(value));
    instance.state = value;
  };

  return instance;
}

type ModelHook<M extends IModelState, P extends {}> = (props: P) => M;

export interface IProviderProps {
  children?: React.ReactNode;
}

/**
 * Force render a component manually
 */
function useForceUpdate() {
  const [, set] = React.useState({});

  return React.useCallback(() => set({}), []);
}

// https://github.com/reduxjs/react-redux/blob/v7-beta/src/components/connectAdvanced.js#L35
// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect because we want
// `connect` to perform sync updates to a ref to save the latest props after
// a render is actually committed to the DOM.
export const useIsomorphicEffect = typeof window === 'undefined'
  ? React.useEffect
  : React.useLayoutEffect;

export default function createModel
  <M extends IModelState, P extends IModelProps = {}>(modelHook: ModelHook<M, P>) {
  /**
   * Create the context
   */
  const Context = React.createContext<IEmitter<M>>(createEmitter());

  /**
   * A component that provides the emitter instance
   */
  function EmitterProvider({ children }: IProviderProps) {
    const emitter = React.useMemo(() => createEmitter<M>(), []);

    return (
      <Context.Provider value={emitter}>
        { children }
      </Context.Provider>
    );
  }

  function EmitterConsumer({ children, ...props }: IProviderProps) {
    /**
     * Access context
     */
    const { consume } = React.useContext(Context);

    /**
     * Run hook
     */
    const model = modelHook(props as P);

    /**
     * Consume the model
     */
    if (consume) {
      consume(model);
    }

    return (
      <>
        { children }
      </>
    );
  }

  /**
   * Provides the model and runs the model logic on re-renders
   */
  function Provider(props: IProviderProps & P) {
    return (
      <EmitterProvider>
        <EmitterConsumer {...props} />
      </EmitterProvider>
    );
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
    const context = React.useContext(Context);

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
    const context = React.useContext(Context);

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

  return {
    Provider,
    useProperty,
    useProperties,
    useSelector,
    useSelectors,
  };
}
