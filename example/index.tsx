import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import createModel from '../.';

interface CounterProps {
  initialCount?: number;
}

const Counter = createModel(({ initialCount }: CounterProps) => {
  const [count, setCount] = React.useState(initialCount ?? 0);

  const increment = React.useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const decrement = React.useCallback(() => {
    setCount(c => c - 1);
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
  const count = Counter.useSelector(state => state.count);
  console.log('Re-rendered Count');
  return (
    <h1>Count: {count}</h1>
  );
}

function Increment() {
  const increment: () => void = Counter.useProperty('increment');
  console.log('Re-rendered Increment');
  return (
    <button type="button" onClick={increment}>Increment</button>
  );
}

function Decrement() {
  const decrement: () => void = Counter.useProperty('decrement');
  console.log('Re-rendered Decrement');
  return (
    <button type="button" onClick={decrement}>Decrement</button>
  );
}

const sleep = time => new Promise((res) => setTimeout(res, time));

function SuspendedCount() {
  const count = Counter.useSuspendedSelector(async (state) => {
    await sleep(500);

    return state.count;
  }, 'count/suspended');

  console.log('Rendered SuspendedCount');

  return (
    <h1>Count: {count}</h1>
  );
}

function SuspendedState() {
  const count = Counter.useSuspendedState((state) => ({
    value: state.count,
    suspend: state.count < 5,
  }), 'state/suspended');

  console.log('Rendered SuspendedState');

  return (
    <h1>Count: {count}</h1>
  );
}

function AsyncCount() {
  const state = Counter.useAsyncSelector(async (state) => {
    await sleep(500);

    return state.count;
  });

  console.log('Rendered AsyncCount');

  switch (state.status) {
    case 'failure': return <h1>An error occured.</h1>;
    case 'success': return <h1>Count: {state.data}</h1>;
    case 'pending': return <h1>Loading...</h1>;
    default: return null;
  }
}


function IncDec() {
  const [increment, decrement] = Counter.useProperties(['increment', 'decrement']);
  console.log('Re-rendered IncDec');
  return (
    <React.Fragment>
      <button type="button" onClick={increment}>Increment</button>
      <button type="button" onClick={decrement}>Decrement</button>
    </React.Fragment>
  );
}

export default function App() {
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
