# useAsyncSelector

`useAsyncSelector` receives a Promised-based transform value derived from the model's state.  

The hook accepts the following parameters:
- `model`: The model which to subscribe to state changes.
- `selector`: a function that receives the model's state and returns a Promise.

The hook returns an object that represents the state of the Promise:
- `status`: may contain three possible values:
  - `"pending"`: the Promise is yet to resolve.
  - `"success"`: the Promise has resolved and the resolved value is available.
  - `"failure"`: the Promise threw an error.
- `data`: contains the resolved value (if status is `"success"`), an error (if status is `"failure"`) or undefined if the status is `"pending"`.

```tsx
import { useAsyncSelector } from '@lxsmnsyc/preact-scoped-model';

function InfoTable() {
  const { status, data } = useAsyncSelector(TableNavigation, async (state) => {
    const response = await fetch(`/page/${state.count}`);
    const data = await response.json();
    return data;
  });

  if (status === 'failure') {
    return <ErrorResponse error={data} />;
  }
  if (status === 'pending') {
    return <Loading />;
  }
  return <TableDetails data={data} />;
}
```

## See Also
- [Hooks](/packages/preact-scoped-model/hooks/README.md)
- [Hook Factory](/packages/preact-scoped-model/docs/hook-factory.md)
