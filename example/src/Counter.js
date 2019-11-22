import createModel from '@lxsmnsyc/react-scoped-model';
import { useState, useCallback } from 'react';


const Counter = createModel(function ({ initialCount }) {
  const [count, setCount] = useState(initialCount);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  return {
    count,
    increment,
    decrement,
  };
});

export default Counter;