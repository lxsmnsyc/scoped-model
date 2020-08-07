# useSelector

`useSelector` receives the transformed and filtered state of the model. Using this in a component "subscribes" the component to transformed state's changes.

The hook accepts the following parameters:
- `model`: The model which to subscribe to state changes.
- `selector`: a function that receives the model's state and must return a transform value based from that state. Changes from the transformed value (as compared to the previously transformed value) prompts a re-render.
- `shouldUpdate`: Optional. A function that receives the previously transformed value and the newly transformed value and returns a boolean. Returning a truthy value replaces the internal state with the transformed value. Defaults to `Object.is` comparison.

Useful for fine-grained subscription of complex states, instead of re-rendering the component when the whole state updates, we can re-render the component reactively when the state it needs changes.

```tsx
import { useSelector } from '@lxsmnsyc/react-scoped-model';

// A model that increments the state every second.
const Timer = createModel(() => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCount((current) => current + 1);
    }, 1000);
  }, []);

  return {
    count,
  };
});

function TimerValue() {
  const seconds = useSelector(Timer, (state) => state.count);

  return <h1>{`Seconds: ${seconds}`}</h1>;
}
```