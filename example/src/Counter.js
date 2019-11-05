import createModel from '@lxsmnsyc/react-scoped-model';
import { useState, useCallback } from 'react';


const Counter = createModel(function () {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  return {
    state: {
      count,
    },
    action: {
      increment,
      decrement,
    },
  };
});

export default Counter;