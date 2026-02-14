import { character, createDefaultCharacter } from './character';
import type { CharacterData } from '../types/character';

const STORAGE_KEY = 'pf2e-character';
const CURRENT_VERSION = 1;

export function loadCharacter(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as CharacterData;
      if (data.version === CURRENT_VERSION) {
        character.set(data);
      }
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
        const data = JSON.parse(reader.result as string) as CharacterData;
        if (typeof data.version !== 'number') {
          reject(new Error('Invalid character file: missing version'));
          return;
        }
        if (data.version !== CURRENT_VERSION) {
          reject(new Error(`Unsupported version: ${data.version}`));
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
