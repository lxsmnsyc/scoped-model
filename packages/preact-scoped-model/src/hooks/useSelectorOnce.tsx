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
import { useDebugValue } from 'preact/hooks';
import { ScopedModel } from '../create-model';
import useValueOnce from './useValueOnce';
import { SelectorFn } from './useSelector';
import useMemoCondition from './useMemoCondition';
import { compareTuple } from '../utils/compareTuple';

/**
 * Receives and transforms the model's state. Unlike useSelector,
 * useSelectorOnce does not reactively update to the model's state.
 * @param model
 * @param selector
 */
export default function useSelectorOnce<S, P, R>(
  model: ScopedModel<S, P>,
  selector: SelectorFn<S, R>,
): R {
  const baseValue = useValueOnce(model);

  const value = useMemoCondition<R, [S, SelectorFn<S, R>]>(
    () => selector(baseValue),
    [baseValue, selector],
    compareTuple,
  );
  useDebugValue(value);
  return value;
}
