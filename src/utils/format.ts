export function signedNumber(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}
