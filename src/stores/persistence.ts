import { character, createDefaultCharacter } from './character';
import type { CharacterData } from '../types/character';

const STORAGE_KEY = 'pf2e-character';
const CURRENT_VERSION = 2;

function migrateCharacter(data: Record<string, unknown>): CharacterData | null {
  const version = data.version as number;
  if (version === CURRENT_VERSION) return data as unknown as CharacterData;
  if (version === 1) {
    (data as Record<string, unknown>).items = [];
    data.version = CURRENT_VERSION;
    return data as unknown as CharacterData;
  }
  return null;
}

export function loadCharacter(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = migrateCharacter(JSON.parse(raw));
      if (data) character.set(data);
    }
  } catch {
    // ignore corrupt data
  }
}

export function initAutoSave(): () => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const unsub = character.subscribe((data) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 500);
  });
  return unsub;
}

export function exportCharacter(data: CharacterData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.name || 'character'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importCharacter(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        if (typeof raw.version !== 'number') {
          reject(new Error('Invalid character file: missing version'));
          return;
        }
        const data = migrateCharacter(raw);
        if (!data) {
          reject(new Error(`Unsupported version: ${raw.version}`));
          return;
        }
        character.set(data);
        resolve();
      } catch (e) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function resetCharacter(): void {
  character.set(createDefaultCharacter());
}

export async function compressCharacter(data: CharacterData): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(data));
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(json);
  writer.close();
  const chunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const compressed = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }
  // base64url: +/ → -_, strip padding =
  return btoa(String.fromCharCode(...compressed))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function decompressCharacter(encoded: string): Promise<CharacterData | null> {
  try {
    // base64url decode: -_ → +/, restore padding
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const chunks: Uint8Array[] = [];
    const reader = ds.readable.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const decompressed = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      decompressed.set(chunk, offset);
      offset += chunk.length;
    }
    const json = new TextDecoder().decode(decompressed);
    const raw = JSON.parse(json);
    return migrateCharacter(raw);
  } catch {
    return null;
  }
}

export async function loadCharacterFromHash(): Promise<void> {
  const hash = window.location.hash;
  const prefix = '#char=';
  if (!hash.startsWith(prefix)) return;
  const encoded = hash.slice(prefix.length);
  if (!encoded) return;
  const data = await decompressCharacter(encoded);
  if (data) {
    character.set(data);
  }
  // Clear hash to avoid re-importing on refresh
  history.replaceState(null, '', window.location.pathname + window.location.search);
}
