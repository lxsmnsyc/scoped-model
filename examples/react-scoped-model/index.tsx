import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import createModel, {
  useSelector,
  useSuspenseSelector,
  useSuspendedState,
  useAsyncSelector,
  useSelectors,
} from '../../packages/react-scoped-model';

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

const sleep = (time: number) => new Promise((res) => setTimeout(res, time));

function SuspendedCount() {
  const count = useSuspenseSelector(
    Counter,
    async (state) => {
      await sleep(500);

      return state.count;
    },
    'count/suspended',
  );

  return (
    <h1>{`Count: ${count ?? 'undefined'}`}</h1>
  );
}

function SuspendedState() {
  const count = useSuspendedState(
    Counter,
    (state) => ({
      value: state.count,
      suspend: state.count < 5,
    }),
    'state/suspended',
  );

  return (
    <h1>{`Count: ${count ?? 'undefined'}`}</h1>
  );
}

function AsyncCount() {
  const result = useAsyncSelector(Counter, async (state) => {
    await sleep(500);

    return state.count;
  });

  switch (result.status) {
    case 'failure': return <h1>An error occured.</h1>;
    case 'success': return <h1>{`Count: ${result.data}`}</h1>;
    case 'pending': return <h1>Loading...</h1>;
    default: return null;
  }
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

export default function App(): JSX.Element {
  return (
    <Counter.Provider initialCount={1}>
      <Counter.Provider>
        <Count />
        <Increment />
        <Decrement />
      </Counter.Provider>
      <Counter.Provider>
        <h1>Suspended Data:</h1>
        <React.Suspense fallback={<h1>Loading...</h1>}>
          <SuspendedCount />
        </React.Suspense>
        <Increment />
        <Decrement />
      </Counter.Provider>
      <Counter.Provider>
        <h1>Suspended State:</h1>
        <React.Suspense fallback={<h1>Loading...</h1>}>
          <SuspendedState />
        </React.Suspense>
        <Increment />
        <Decrement />
      </Counter.Provider>
      <Counter.Provider>
        <h1>Async Data:</h1>
        <AsyncCount />
        <Increment />
        <Decrement />
      </Counter.Provider>
      <Count />
      <IncDec />
    </Counter.Provider>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
