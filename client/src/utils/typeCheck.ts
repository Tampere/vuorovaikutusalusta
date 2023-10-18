export function assertNever(value: never): never {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`,
  );
}

export function isString(text: unknown): text is string {
  return typeof text === 'string' || text instanceof String;
}

export function isNumeric(val: unknown): val is number {
  return val && !isNaN(Number(val)) && !isNaN(parseFloat(String(val)));
}
