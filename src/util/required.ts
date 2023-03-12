export function required<T>(value: T | undefined | null): T {
  if (typeof value === 'undefined' || value === null) {
    throw new Error('Required value was undefined or null');
  }
  return value;
}
