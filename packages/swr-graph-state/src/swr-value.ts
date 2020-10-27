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
export type SWRValueListener<T> = (value: T) => void;

export interface SWRValue<T> {
  value: T;
  listeners: Set<SWRValueListener<T>>;
}

export function createSWRValue<T>(value: T): SWRValue<T> {
  return {
    value,
    listeners: new Set(),
  };
}

export function addSWRValueListener<T>(
  ref: SWRValue<T>,
  listener: SWRValueListener<T>,
): void {
  ref.listeners.add(listener);
}

export function removeSWRValueListener<T>(
  ref: SWRValue<T>,
  listener: SWRValueListener<T>,
): void {
  ref.listeners.delete(listener);
}

export function setSWRValue<T>(
  ref: SWRValue<T>,
  value: T,
  notify = true,
): void {
  ref.value = value;

  if (notify) {
    Promise.resolve().then(() => {
      ref.listeners.forEach((listener) => {
        listener(value);
      });
    }, () => {
      // Non-existent
    });
  }
}
