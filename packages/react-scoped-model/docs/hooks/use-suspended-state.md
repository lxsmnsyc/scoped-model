# useSuspendedState

`useSuspendedState` suspends the component indefinitely and conditionally based on the model's transformed state.

The hook accepts the following parameters:
- `model`: The model which to subscribe to state changes.
- `selector`: a function that receives the model's state and returns an object with two properties:
  - `value`: the transformed state.
  - `suspense`: boolean. If true, the component is suspended until it becomes false (through state updates.)
- `key`: a key used to internally cache the promise as a Suspense resource. Components that uses the same key shares the same Suspense resource.

Useful for suspending the component if the model has an initial state but the expected state is not yet ready.

```tsx
import { useSuspendedState } from 'react-scoped-model';

function SuspendedTimerValue() {
  // Suspend the component until the amount of seconds has passed 10.
  const seconds = useSuspendedState(
    Timer,
    (state) => ({
      value: state.seconds,
      suspend: state.seconds < 10,
    }),
    'suspended-timer',
  );

  return <h1>{`Seconds: ${seconds}`}</h1>;
}

function TimerValue() {
  return (
    <React.Suspense fallback={<Loading />}>
      <SuspendedTimerValue />
    </React.Suspense>
  );
}
```

## See Also
- [Hooks](/packages/react-scoped-model/hooks/README.md)
- [Hook Factory](/packages/react-scoped-model/docs/hook-factory.md)