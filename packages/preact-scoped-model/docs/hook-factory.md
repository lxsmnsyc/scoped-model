# Hook Factory

`preact-scoped-model` provides a set of functions which produces Preact-based hooks based on the [out-of-the-box hooks](/packages/preact-scoped-model/hooks/README.md). These functions accepts the same set of parameters as their hook counterparts.

## List of Hook Factories

- `createValue`: creates a hook based on [useValue](/packages/preact-scoped-model/docs/hooks/use-value.md).
```tsx
import { createValue } from 'preact-scoped-model';

const useTimer = createValue(Timer);

// ...
const { seconds } = useTimer();
```

- `createSelector`: creates a hook based on [useSelector](/packages/preact-scoped-model/docs/hooks/use-selector.md).

```tsx
import { createSelector } from 'preact-scoped-model';

const useTimerSeconds = createSelector(Timer, (state) => state.seconds);

// ...
const seconds = useTimerSeconds();
```

- `createSelectors`: creates a hook based on [useSelectors](/packages/preact-scoped-model/docs/hooks/use-selectors.md).
- `createAsyncSelector`: creates a hook based on [useAsyncSelector](/packages/preact-scoped-model/docs/hooks/use-async-selector.md).
- `createSuspenseSelector`: creates a hook based on [useSuspenseSelector](/packages/preact-scoped-model/docs/hooks/use-suspense-selector.md).
- `createSuspendedState`: creates a hook based on [useSuspendedState](/packages/preact-scoped-model/docs/hooks/use-suspended-state.md)`.
- `createValueOnce`: creates a hook based on [useValueOnce](/packages/preact-scoped-model/docs/hooks/use-value-once.md)`.
- `createSelectorOnce`: creates a hook based on [useValueOnce](/packages/preact-scoped-model/docs/hooks/use-selector-once.md)`.
- `createSnapshot`: creates a hook based on [useSnapshot](/packages/preact-scoped-model/docs/hooks/use-snapshot.md)`.

## See Also
- [Create Model](/packages/preact-scoped-model/docs/create-model.md)
- [Model Factory](/packages/preact-scoped-model/docs/model-factory.md)
- [Hooks](/packages/preact-scoped-model/docs/hooks/README.md)