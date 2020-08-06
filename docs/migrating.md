# Migrating

Due to improvements with the modules, a lot of API has been changed and poses a breaking update. Most of the breaking changes are focused on the hooks.

## Migrating the hooks

Previously, `scoped model` instances included the hooks as properties. This posed a problem on build outputs as the hooks are not minifiable nor tree-shakeable.

The library now exports these hooks as a standalone function, but now these functions receives the model as the first parameter.
- `<model>.useValue` -> `useValue(<model>)`
- `<model>.useSelector(selector, shouldUpdate)` -> `useSelector(<model>, selector, shouldUpdate)`
- `<model>.useSelectors(selector, shouldUpdate)` -> `useSelectors(<model>, selector, shouldUpdate)`
- `<model>.useAsyncSelector(selector)` -> `useAsyncSelector(<model>, selector)`
- `<model>.useSuspendedSelector(selector, key)` -> `useSuspenseSelector(<model>, selector, key)`
- `<model>.useSuspendedState(selector, key)` -> `useSuspendedState(<model>, selector, key)`

