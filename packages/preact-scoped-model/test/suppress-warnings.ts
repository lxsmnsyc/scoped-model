/* eslint-disable no-console */
const actualError = console.error;

function defaultError(err: Error): void {
  throw err;
}

export function supressWarnings(): void {
  console.error = defaultError;
}

export function restoreWarnings(): void {
  console.error = actualError;
}
