# useSuspenseSelector

`useSuspenseSelector` receives a Promised-based transform value derived from the model's state, and suspends the component until the promise has resolved.

The hook accepts the following parameters:
- `model`: The model which to subscribe to state changes.
- `selector`: a function that receives the model's state and returns a Promise.
- `key`: a key used to internally cache the promise as a Suspense resource. Components that uses the same key shares the same Suspense resource.

```tsx
import { useSuspenseSelector } from 'preact-scoped-model';

function InfoTable() {
  const data = useSuspenseSelector(
    TableNavigation,
    async (state) => {
      const response = await fetch(`/page/${state.count}`);
      const data = await response.json();
      return data;
    },
    'table-details',
  );

  return <TableDetails data={data} />;
}

function Info() {
  return (
    <Suspense fallback={<Loading />}>
      <InfoTable />
    </Suspense>
  );
}
```

## See Also
- [Hooks](/packages/preact-scoped-model/hooks/README.md)
- [Hook Factory](/packages/preact-scoped-model/docs/hook-factory.md)
