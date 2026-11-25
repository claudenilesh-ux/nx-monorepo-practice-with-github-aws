export function requiredValue(name: string, value: string | undefined): string {
  if (!value?.trim()) throw new Error(`${name} is required`);
  return value;
}
