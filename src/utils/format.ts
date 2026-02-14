export function signedNumber(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function formatActions(str: string): string {
  switch (str) {
    case '1': return '\u25C6';
    case '2': return '\u25C6\u25C6';
    case '3': return '\u25C6\u25C6\u25C6';
    default:
      if (/^(f|free)$/i.test(str)) return '\u25C7';
      if (/^(r|reaction)$/i.test(str)) return '\u21BA';
      return str;
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}
