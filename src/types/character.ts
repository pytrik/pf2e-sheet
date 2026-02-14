import type { Ability, AbilityEntryType, ProficiencyRank, SpellLevel } from './constants';

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

export interface SpellEntry {
  id: string;
  name: string;
  actions: string;
  description: string;
}

export interface SpellLevelData {
  slots: number;
  spells: SpellEntry[];
}

export interface SpellcastingConfig {
  tradition: string;
  ability: Ability;
  proficiency: ProficiencyRank;
  miscBonus: number;
  spellLevels: Record<SpellLevel, SpellLevelData>;
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
  spellcasting: SpellcastingConfig;
}
