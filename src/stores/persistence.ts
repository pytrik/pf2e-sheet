import { character, createDefaultCharacter, CHARACTER_VERSION } from './character';
import { Ability, AbilityEntryType, ProficiencyRank, SPELL_LEVELS, CASTING_KINDS, CASTING_KIND_IDS } from '../types/constants';
import type {
  CharacterData,
  SavingThrow,
  SkillEntry,
  AttackEntry,
  AbilityEntry,
  CastingEntry,
  CastingSource,
  ItemEntry,
} from '../types/character';
import { generateId } from '../utils/format';
import { getPathbuilderBuild, fromPathbuilder } from './pathbuilder';

const STORAGE_KEY = 'pf2e-character';

// --- Validation ---
// Character data comes from localStorage, imported files and share links, so
// it is untrusted. It is rebuilt field by field on top of the defaults: wrong
// types fall back to the default, numbers are coerced and clamped, enums are
// checked.

type Rec = Record<string, unknown>;

const ABILITIES = Object.values(Ability);
const ENTRY_TYPES = Object.values(AbilityEntryType);

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function rec(v: unknown): Rec {
  return isRec(v) ? v : {};
}

function num(v: unknown, fallback: number, min = -Infinity, max = Infinity): number {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function numOrNull(v: unknown, min = -Infinity): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = num(v, NaN, min);
  return Number.isNaN(n) ? null : n;
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function rank(v: unknown, fallback: ProficiencyRank): ProficiencyRank {
  const n = num(v, fallback);
  return Number.isInteger(n) && n >= 0 && n <= 4 ? (n as ProficiencyRank) : fallback;
}

function oneOf<T>(v: unknown, options: readonly T[], fallback: T): T {
  return options.includes(v as T) ? (v as T) : fallback;
}

function list<T>(v: unknown, fn: (item: Rec) => T): T[] {
  return Array.isArray(v) ? v.filter(isRec).map(fn) : [];
}

function sanitizeSave(v: unknown, d: SavingThrow): SavingThrow {
  const r = rec(v);
  return { proficiency: rank(r.proficiency, d.proficiency), miscBonus: num(r.miscBonus, 0) };
}

function sanitizeSkill(r: Rec): SkillEntry {
  return {
    name: str(r.name),
    ability: oneOf(r.ability, ABILITIES, Ability.STR),
    proficiency: rank(r.proficiency, ProficiencyRank.Untrained),
    miscBonus: num(r.miscBonus, 0),
    isLore: r.isLore === true,
  };
}

function sanitizeAttack(r: Rec): AttackEntry {
  return {
    id: str(r.id) || generateId(),
    name: str(r.name),
    actions: str(r.actions),
    ability: oneOf(r.ability, ABILITIES, Ability.STR),
    proficiency: rank(r.proficiency, ProficiencyRank.Trained),
    itemBonus: num(r.itemBonus, 0),
    miscBonus: num(r.miscBonus, 0),
    damage: str(r.damage),
    traits: str(r.traits),
  };
}

function sanitizeAbilityEntry(r: Rec): AbilityEntry {
  return {
    id: str(r.id) || generateId(),
    name: str(r.name),
    actions: str(r.actions),
    type: oneOf(r.type, ENTRY_TYPES, AbilityEntryType.Other),
    level: numOrNull(r.level, 0),
    description: str(r.description),
  };
}

function sanitizeCastingEntry(r: Rec, maxLevel: number): CastingEntry {
  return {
    id: str(r.id) || generateId(),
    name: str(r.name),
    level: Math.round(num(r.level, 0, 0, maxLevel)),
    actions: str(r.actions),
    description: str(r.description),
  };
}

function sanitizeCastingSource(r: Rec): CastingSource {
  const kind = oneOf(r.kind, CASTING_KIND_IDS, 'spells');
  const { maxLevel } = CASTING_KINDS[kind];
  const slots = Array.isArray(r.slots) ? r.slots : [];
  return {
    id: str(r.id) || generateId(),
    kind,
    name: str(r.name),
    ability: oneOf(r.ability, ABILITIES, Ability.CHA),
    proficiency: rank(r.proficiency, ProficiencyRank.Trained),
    miscBonus: num(r.miscBonus, 0),
    slots: Array.from({ length: maxLevel + 1 }, (_, i) => num(slots[i], 0, 0)),
    perDay: numOrNull(r.perDay, 0),
    entries: list(r.entries, (e) => sanitizeCastingEntry(e, maxLevel)),
  };
}

/**
 * Before v3 there was a single fixed spellcasting block with spells stored per
 * rank. Turn it into a spells source (or nothing, if it was never filled in).
 */
function migrateSpellcasting(v: unknown): Rec[] {
  const sc = rec(v);
  const levels = rec(sc.spellLevels);
  const slots: unknown[] = [];
  const entries: Rec[] = [];
  for (const lvl of SPELL_LEVELS) {
    const l = rec(levels[lvl]);
    slots[lvl] = l.slots;
    for (const spell of list(l.spells, (s) => s)) entries.push({ ...spell, level: lvl });
  }
  if (!str(sc.tradition) && entries.length === 0) return [];
  return [{
    kind: 'spells',
    name: sc.tradition,
    ability: sc.ability,
    proficiency: sc.proficiency,
    miscBonus: sc.miscBonus,
    slots,
    entries,
  }];
}

function sanitizeItem(r: Rec): ItemEntry {
  return {
    id: str(r.id) || generateId(),
    name: str(r.name),
    weight: numOrNull(r.weight, 0),
    value: numOrNull(r.value, 0),
    amount: numOrNull(r.amount, 0),
    uses: numOrNull(r.uses, 0),
    description: str(r.description),
  };
}

/**
 * Turn arbitrary parsed JSON into a valid CharacterData, or null if it isn't a
 * character at all (not an object, unknown version).
 */
export function sanitizeCharacter(raw: unknown): CharacterData | null {
  if (!isRec(raw)) return null;
  // v1 had no items list. Builds before 1.7.0 also labelled new characters as
  // v1, so v1 data may already contain items — those are kept.
  // v2 had a single `spellcasting` block instead of `casting` sources.
  if (raw.version !== 1 && raw.version !== 2 && raw.version !== CHARACTER_VERSION) return null;

  const d = createDefaultCharacter();
  const abilities = rec(raw.abilities);
  const ac = rec(raw.armorClass);
  const saves = rec(raw.savingThrows);
  const hp = rec(raw.hp);
  const perception = rec(raw.perception);
  const classDC = rec(raw.classDC);
  const casting = raw.version === CHARACTER_VERSION ? raw.casting : migrateSpellcasting(raw.spellcasting);

  return {
    version: CHARACTER_VERSION,
    name: str(raw.name),
    heritage: str(raw.heritage),
    class: str(raw.class),
    level: Math.round(num(raw.level, d.level, 1, 20)),
    background: str(raw.background),
    abilities: {
      STR: num(abilities.STR, 0),
      DEX: num(abilities.DEX, 0),
      CON: num(abilities.CON, 0),
      INT: num(abilities.INT, 0),
      WIS: num(abilities.WIS, 0),
      CHA: num(abilities.CHA, 0),
    },
    armorClass: {
      proficiency: rank(ac.proficiency, d.armorClass.proficiency),
      dexCap: numOrNull(ac.dexCap, 0),
      itemBonus: num(ac.itemBonus, 0),
      miscBonus: num(ac.miscBonus, 0),
    },
    savingThrows: {
      fortitude: sanitizeSave(saves.fortitude, d.savingThrows.fortitude),
      reflex: sanitizeSave(saves.reflex, d.savingThrows.reflex),
      will: sanitizeSave(saves.will, d.savingThrows.will),
    },
    hp: {
      ancestryBonus: num(hp.ancestryBonus, 0),
      classBonus: num(hp.classBonus, 0),
      miscBonus: num(hp.miscBonus, 0),
    },
    speed: num(raw.speed, d.speed, 0),
    perception: {
      proficiency: rank(perception.proficiency, d.perception.proficiency),
      miscBonus: num(perception.miscBonus, 0),
    },
    classDC: {
      proficiency: rank(classDC.proficiency, d.classDC.proficiency),
      keyAbility: oneOf(classDC.keyAbility, ABILITIES, d.classDC.keyAbility),
      miscBonus: num(classDC.miscBonus, 0),
    },
    skills: Array.isArray(raw.skills) ? list(raw.skills, sanitizeSkill) : d.skills,
    languages: Array.isArray(raw.languages)
      ? raw.languages.filter((l): l is string => typeof l === 'string')
      : d.languages,
    attacks: list(raw.attacks, sanitizeAttack),
    abilities_list: list(raw.abilities_list, sanitizeAbilityEntry),
    casting: list(casting, sanitizeCastingSource),
    items: list(raw.items, sanitizeItem),
  };
}

// --- localStorage ---

/** Load the saved character into the store. Returns true if one was found. */
export function loadCharacter(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = sanitizeCharacter(JSON.parse(raw));
      if (data) {
        character.set(data);
        return true;
      }
    }
  } catch {
    // ignore corrupt or blocked storage
  }
  return false;
}

function save(data: CharacterData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or blocked — nothing to do
  }
}

export function initAutoSave(): () => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let pending: CharacterData | null = null;
  const flush = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
    if (pending) save(pending);
    pending = null;
  };
  const unsub = character.subscribe((data) => {
    pending = data;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(flush, 500);
  });
  // Don't lose the last edits when the tab closes inside the debounce window.
  window.addEventListener('pagehide', flush);
  return () => {
    unsub();
    window.removeEventListener('pagehide', flush);
  };
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

/**
 * Import a character file: this app's own JSON export, or a Pathbuilder 2e
 * "Export JSON" file. Resolves with notes on what a Pathbuilder file couldn't
 * provide, or null for a native file.
 */
export function importCharacter(file: File): Promise<string[] | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        const build = getPathbuilderBuild(raw);
        const converted = build ? fromPathbuilder(build) : null;
        const data = sanitizeCharacter(converted ? converted.data : raw);
        if (!data) {
          reject(new Error(
            typeof raw?.version === 'number'
              ? `Unsupported character file version: ${raw.version}`
              : 'Invalid character file: missing version',
          ));
          return;
        }
        character.set(data);
        resolve(converted ? converted.notes : null);
      } catch {
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
  // Build the binary string in chunks: spreading a large array into
  // String.fromCharCode overflows the argument limit.
  let binary = '';
  for (let i = 0; i < compressed.length; i += 0x8000) {
    binary += String.fromCharCode(...compressed.subarray(i, i + 0x8000));
  }
  // base64url: +/ → -_, strip padding =
  return btoa(binary)
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
    return sanitizeCharacter(raw);
  } catch {
    return null;
  }
}

export type HashResult =
  | { status: 'none' }
  | { status: 'invalid' }
  | { status: 'ok'; data: CharacterData };

/**
 * Read a shared character from the URL hash (`#char=...`) and clear the hash so
 * a reload doesn't load it again. Does not touch the store — the caller decides
 * whether to replace the current character.
 */
export async function readCharacterFromHash(): Promise<HashResult> {
  const hash = window.location.hash;
  const prefix = '#char=';
  if (!hash.startsWith(prefix)) return { status: 'none' };
  history.replaceState(null, '', window.location.pathname + window.location.search);
  const encoded = hash.slice(prefix.length);
  if (!encoded) return { status: 'none' };
  const data = await decompressCharacter(encoded);
  return data ? { status: 'ok', data } : { status: 'invalid' };
}
