# useSnapshot

`useSnapshot` attaches a listener to a model and subscribes for state updates. The listener receives the newest state.

The hook accepts the following parameters:
- `model`: The model which to subscribe to state changes.
- `listener`: A callback that receives the state updates.


```tsx
import { useSnapshot } from 'react-scoped-model';

// A model that increments the state every second.
const Timer = createModel(() => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCount((current) => current + 1);
    }, 1000);
  }, []);

  return count;
});

// ...
useSnapshot(Timer, (count) => {
  console.log('Current count:', count);
})
````

## See Also
- [Hooks](/packages/react-scoped-model/hooks/README.md)
- [Hook Factory](/packages/react-scoped-model/docs/hook-factory.md)