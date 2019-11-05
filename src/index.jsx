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
import React, { useContext, createContext } from 'react';
import PropTypes from 'prop-types';

const STATE_CHANGE = 0b01;
const ACTION_CHANGE = 0b10;

/**
 * Used for shallowly comparing two objects
 */
function objectChanged(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return true;
  }

  return bKeys.some((key) => !Object.is(a[key], b[key]));
}

const defaultState = {
  state: {},
  action: {},
};

/**
 * Dictates how the Context should re-render its Consumers
 */
function setObservableBits(prev, next) {
  /**
   * Set default signal
   */
  let bits = 0b00;

  /**
   * Compare states
   */
  if (objectChanged(prev.state, next.state)) {
    bits |= STATE_CHANGE;
  }

  /**
   * Compare actions
   */
  if (objectChanged(prev.action, next.action)) {
    bits |= ACTION_CHANGE;
  }

  return bits;
}

/**
 * Creates a model from a given hook function.
 *
 * Hook function passed must return the shape of a valid model (that is,
 * an object with a state property and an action property.)
 *
 * This hook function is called every render.
 *
 * @param hookFunc a hook function. You can call React hooks inside this function.
 */
export default function createModel(hookFunc) {
  /**
   * Create Context instance
   */
  const Context = createContext(defaultState, setObservableBits);

  /**
   * Scoped Model Provider
   *
   * Runs the given model hook on render and injects
   * the model down the component tree.
   */
  function Provider({ children }) {
    /**
     * Execute hook
     */
    const model = hookFunc();

    return (
      <Context.Provider value={model}>
        { children }
      </Context.Provider>
    );
  }

  Provider.propTypes = {
    children: PropTypes.oneOf([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node),
    ]).isRequired,
  };

  /**
   * Fetches the state of the scoped model
   * and watches for the changes.
   */
  function useState() {
    return useContext(Context, STATE_CHANGE).state;
  }

  /**
   * Fetches the actions of the scoped model
   * and watches for the changes
   */
  function useAction() {
    return useContext(Context, ACTION_CHANGE).action;
  }

  return {
    Provider,
    useState,
    useAction,
  };
}
