import 'preact/debug';
import { VNode } from 'preact';
import { useState, useCallback } from 'preact/hooks';

import createModel, {
  useSelector,
  useSelectors,
} from 'preact-scoped-model';

interface CounterProps {
  initialCount?: number;
}

const Counter = createModel(({ initialCount }: CounterProps) => {
  const [count, setCount] = useState(initialCount ?? 0);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((c) => c - 1);
  }, []);

  return {
    count,
    increment,
    decrement,
  };
}, {
  displayName: 'Counter',
});

function Count() {
  const count = useSelector(Counter, (state) => state.count);
  return (
    <h1>{`Count: ${count}`}</h1>
  );
}

function Increment() {
  const increment = useSelector(Counter, (state) => state.increment);
  return (
    <button type="button" onClick={increment}>Increment</button>
  );
}

function Decrement() {
  const decrement = useSelector(Counter, (state) => state.decrement);
  return (
    <button type="button" onClick={decrement}>Decrement</button>
  );
}

function IncDec() {
  const [increment, decrement] = useSelectors(Counter, (state) => [
    state.increment,
    state.decrement,
  ]);
  return (
    <>
      <button type="button" onClick={increment}>Increment</button>
      <button type="button" onClick={decrement}>Decrement</button>
    </>
  );
}

export default function App(): VNode {
  return (
    <Counter.Provider initialCount={1}>
      <Counter.Provider>
        <Count />
        <Increment />
        <Decrement />
      </Counter.Provider>
      <Count />
      <IncDec />
    </Counter.Provider>
  );
}
