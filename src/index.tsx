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
    new Set(listeners).forEach(fn => fn(value));
    instance.state = value;
  };

  return instance;
}

type ModelHook<M extends IModelState> = () => M;

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
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export default function createModel<M extends IModelState>(modelHook: ModelHook<M>) {
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

  function EmitterConsumer({ children }: IProviderProps) {
    /**
     * Access context
     */
    const context = React.useContext(Context);

    /**
     * Run hook
     */
    const model = modelHook();
    
    /**
     * Consume the model
     */
    if (context.consume) {
      context.consume(model);
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
  function Provider({ children }: IProviderProps) {
    return (
      <EmitterProvider>
        <EmitterConsumer>
          { children }
        </EmitterConsumer>
      </EmitterProvider>
    );
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
  function useProperty<T>(key: string, listen: boolean = true): T {
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
    const ref = React.useRef(context.state[key]);

    /**
     * Safety set
     */
    ref.current = context.state[key];

    /**
     * Wrap the state setter for watching the property
     */
    const callback = React.useCallback((next: M) => {
      /**
       * Compare states
       */
      if (!Object.is(ref.current, next[key])) {
        /**
         * Update state reference
         */
        ref.current = next[key];

        /**
         * Force update this component
         */
        forceUpdate();
      }
    }, [key]);

    /**
     * Listen to the changes
     */
    useIsomorphicLayoutEffect(() => {
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
      return () => {};
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
  function useProperties<T extends any[]>(keys: string[], listen: boolean = true): T {
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
      keys.map(key => context.state[key])
    ), keys) as T;

    /**
     * Used to contain the state
     */
    const ref = React.useRef(states);

    /**
     * Safety set
     */
    ref.current = states;

    /**
     * Wrap the state setter for watching the property
     */
    const callback = React.useCallback((next: M) => {
      /**
       * New reference container
       */
      const values = [];
      
      /**
       * Do force update flag
       */
      let doUpdate = false;

      /**
       * Iterate keys
       */
      for (let i = 0; i < keys.length; i++) {
        /**
         * Get corresponding values
         */
        const currentValue = ref.current[i];
        const newValue = next[keys[i]];

        /**
         * Compare values
         */
        if (!Object.is(currentValue, newValue)) {
          /**
           * Set the new value to this slot
           */
          values[i] = newValue;
        } else {
          /**
           * Set the value to the old slot
           */
          values[i] = currentValue;
        }
      }

      /**
       * If doUpdate is true, force update this component
       */
      if (doUpdate) {
        forceUpdate();
      }
    }, keys);

    /**
     * Listen to the changes
     */
    useIsomorphicLayoutEffect(() => {
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
      return () => {};
    }, [context, listen, callback]);

    /**
     * Return the current state value
     */
    return ref.current;
  }

  return {
    Provider,
    useProperty,
    useProperties,
  };
}