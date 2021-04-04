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
import createModel from './create-model';

// Model factory
export {
  default as createNullaryModel,
  NullaryScopedModel,
  NullaryScopedModelHook,
  NullaryScopedModelOptions,
} from './model-factory/create-nullary-model';
export {
  default as createStateModel,
  StateScopedModel,
  StateModelOptions,
} from './model-factory/create-state-model';
export {
  default as createReducerModel,
  ReducerScopedModel,
  ReducerScopedModelOptions,
} from './model-factory/create-reducer-model';
export {
  default as createPropsSelectorModel,
  PropsSelectorModel,
} from './model-factory/create-props-selector-model';

// Hook Factory
export { default as createSelector } from './hook-factory/create-selector-hook';
export { default as createSelectors } from './hook-factory/create-selectors-hook';
export { default as createValue } from './hook-factory/create-value-hook';
export { default as createValueOnce } from './hook-factory/create-value-once-hook';
export { default as createSnapshot } from './hook-factory/create-snapshot-hook';
export { default as createSelectorOnce } from './hook-factory/create-selector-once-hook';

// Hooks
export {
  default as useValue,
} from './hooks/useValue';
export {
  default as useSelector,
  SelectorFn,
} from './hooks/useSelector';
export {
  default as useSelectors,
  SelectorsFn,
} from './hooks/useSelectors';
export {
  default as useValueOnce,
} from './hooks/useValueOnce';
export {
  default as useSelectorOnce,
} from './hooks/useSelectorOnce';
export {
  default as useSnapshot,
} from './hooks/useSnapshot';
export {
  default as useScopedModelExists,
} from './hooks/useScopedModelExists';

export * from './create-model';

export { Compare, ListCompare } from './utils/comparer';

export default createModel;
