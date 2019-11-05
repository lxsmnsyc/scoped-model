import React from 'react'

import Counter from './Counter'


function Count() {
  const { count } = Counter.useState();

  return (
    <h1>Count: {count}</h1>
  );
}

function Increment() {
  const { increment } = Counter.useAction();
  console.log('Re-rendered Increment');
  return (
    <button type="button" onClick={increment}>Increment</button>
  );
}

function Decrement() {
  const { decrement } = Counter.useAction();
  console.log('Re-rendered Decrement');
  return (
    <button type="button" onClick={decrement}>Decrement</button>
  );
}

export default function App() {
  return (
    <Counter.Provider>
      <Counter.Provider>
        <Count />
        <Increment />
        <Decrement />
      </Counter.Provider>
      <Count />
      <Increment />
      <Decrement />
    </Counter.Provider>
  );
}
