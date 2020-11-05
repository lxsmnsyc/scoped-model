import { useDebugValue } from 'react';
import { defaultCompare, MemoCompare } from './useFreshLazyRef';
import useFreshState from './useFreshState';
import useIsomorphicEffect from './useIsomorphicEffect';

type ReadSource<T> = () => T;
type Subscribe = (callback: () => void) => () => void;

export interface Subscription<T> {
  read: ReadSource<T>;
  subscribe: Subscribe;
  shouldUpdate?: MemoCompare<T>;
}

export default function useSubscription<T>({
  read, subscribe, shouldUpdate = defaultCompare,
}: Subscription<T>): T {
  const [state, setState] = useFreshState(
    () => ({
      read,
      subscribe,
      shouldUpdate,
      value: read(),
    }),
    [read, subscribe, shouldUpdate],
  );

  useDebugValue(state.value);

  useIsomorphicEffect(() => {
    let mounted = true;

    const readCurrent = () => {
      if (mounted) {
        const nextValue = read();

        setState((prev) => {
          if (
            prev.read !== read
            || prev.subscribe !== subscribe
            || prev.shouldUpdate !== shouldUpdate
          ) {
            return prev;
          }
          if (!shouldUpdate(prev.value, nextValue)) {
            return prev;
          }
          return { ...prev, value: nextValue };
        });
      }
    };

    readCurrent();

    const unsubscribe = subscribe(readCurrent);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [read, subscribe, shouldUpdate]);

  return state.value;
}
