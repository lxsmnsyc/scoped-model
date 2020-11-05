export function compareTuple<T, R>(
  prev: [T, R],
  next: [T, R],
): boolean {
  return !(Object.is(prev[0], next[0]) && Object.is(prev[1], next[1]));
}

export function compareArray<T>(prev: T[], next: T[]): boolean {
  if (prev === next) {
    return false;
  }
  if (prev.length !== next.length) {
    return true;
  }
  for (let i = 0; i < prev.length; i += 1) {
    if (!Object.is(prev[i], next[i])) {
      return true;
    }
  }
  return false;
}
