import type { Ability, AbilityEntryType, CastingKind, ProficiencyRank } from './constants';

export interface AbilityModifiers {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface ArmorClass {
  proficiency: ProficiencyRank;
  dexCap: number | null;
  itemBonus: number;
  miscBonus: number;
}

export interface SavingThrow {
  proficiency: ProficiencyRank;
  miscBonus: number;
}

export interface SkillEntry {
  name: string;
  ability: Ability;
  proficiency: ProficiencyRank;
  miscBonus: number;
  isLore: boolean;
}

export interface AttackEntry {
  id: string;
  name: string;
  actions: string;
  ability: Ability;
  proficiency: ProficiencyRank;
  itemBonus: number;
  miscBonus: number;
  damage: string;
  traits: string;
}

export interface AbilityEntry {
  id: string;
  name: string;
  actions: string;
  type: AbilityEntryType;
  level: number | null;
  description: string;
}

/** A spell, formula, ... Level is the spell rank (0 = cantrip) or item level. */
export interface CastingEntry {
  id: string;
  name: string;
  level: number;
  actions: string;
  description: string;
}

/**
 * One list of spells, alchemical formulas, ... with its own stats. Which fields
 * matter depends on the kind (see CASTING_KINDS); the others are kept at their
 * defaults and ignored.
 */
export interface CastingSource {
  id: string;
  kind: CastingKind;
  name: string;
  ability: Ability;
  proficiency: ProficiencyRank;
  miscBonus: number;
  /** Slots per level, indexed by level. */
  slots: number[];
  perDay: number | null;
  entries: CastingEntry[];
}

export interface Perception {
  proficiency: ProficiencyRank;
  miscBonus: number;
}

export interface ClassDC {
  proficiency: ProficiencyRank;
  keyAbility: Ability;
  miscBonus: number;
}

export interface ItemEntry {
  id: string;
  name: string;
  weight: number | null;
  value: number | null;
  amount: number | null;
  uses: number | null;
  description: string;
}

export interface CharacterData {
  version: number;
  name: string;
  heritage: string;
  class: string;
  level: number;
  background: string;
  abilities: AbilityModifiers;
  armorClass: ArmorClass;
  savingThrows: {
    fortitude: SavingThrow;
    reflex: SavingThrow;
    will: SavingThrow;
  };
  hp: {
    ancestryBonus: number;
    classBonus: number;
    miscBonus: number;
  };
  speed: number;
  perception: Perception;
  classDC: ClassDC;
  skills: SkillEntry[];
  languages: string[];
  attacks: AttackEntry[];
  abilities_list: AbilityEntry[];
  casting: CastingSource[];
  items: ItemEntry[];
}
