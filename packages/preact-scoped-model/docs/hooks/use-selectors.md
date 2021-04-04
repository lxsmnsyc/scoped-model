# useSelectors

`useSelectors` receives the transformed and filtered states of the model contained in an array. Using this in a component "subscribes" the component to one of the transformed state's changes.

The hook accepts the following parameters:

- `model`: The model which to subscribe to state changes.
- `selector`: a function that receives the model's state and must return an array of transformed value based from that state. Changes from one of the transformed value (as compared to the previously transformed value) prompts a re-render.
- `shouldUpdate`: Optional. A function that receives the previously transformed array of values and the newly transformed array of values and returns a boolean. Returning a truthy value replaces the internal state with the transformed value. Defaults to `Object.is` comparison for each value.

```tsx
import { useSelectors } from 'preact-scoped-model';

const Counter = createModel(() => {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  // Return the shape of our model
  return {
    count,
    increment,
    decrement,
  };
});

function Controls() {
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
```

## See Also

- [Hooks](/packages/preact-scoped-model/hooks/README.md)
- [Hook Factory](/packages/preact-scoped-model/docs/hook-factory.md)
