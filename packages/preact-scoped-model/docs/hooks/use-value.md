# useValue

`useValue` receives the state of the model (as a whole.). Using this in a component "subscribes" the component to model's state changes.

The hook accepts the following parameters:
- `model`: The model which to subscribe to state changes.
- `shouldUpdate`: Optional. A function that receives the previously stored state and the newly state and returns a boolean. Returning a truthy value replaces the internal state with the new state. Defaults to `Object.is` comparison.


```tsx
import { useValue } from '@lxsmnsyc/preact-scoped-model';

// A model that increments the state every second.
const Timer = createModel(() => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((current) => current + 1);
    }, 1000);
  }, []);

  return count;
});

function TimerValue() {
  const seconds = useValue(Timer);

  return <h1>{`Seconds: ${seconds}`}</h1>;
}
````
