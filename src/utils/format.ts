export function signedNumber(n: number | null | undefined): string {
  const v = n ?? 0;
  return v >= 0 ? `+${v}` : `${v}`;
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

let idCounter = 0;

export function generateId(): string {
  // randomUUID only exists in secure contexts (https/localhost); fall back for
  // plain-http LAN testing.
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.random().toString(36).slice(2)}`;
}
