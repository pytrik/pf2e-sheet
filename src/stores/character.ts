import { writable, derived } from 'svelte/store';
import { Ability, ProficiencyRank, STANDARD_SKILLS, CASTING_KINDS } from '../types/constants';
import type { CastingKind } from '../types/constants';
import type { CharacterData, CastingSource } from '../types/character';
import { generateId } from '../utils/format';
import {
  calcAC,
  calcSave,
  calcSkill,
  calcHP,
  calcClassDC,
  calcPerception,
  calcAttackBonus,
} from '../utils/calculations';

export function createCastingSource(kind: CastingKind): CastingSource {
  return {
    id: generateId(),
    kind,
    name: '',
    ability: Ability.CHA,
    proficiency: ProficiencyRank.Trained,
    miscBonus: 0,
    slots: Array(CASTING_KINDS[kind].maxLevel + 1).fill(0),
    perDay: null,
    entries: [],
  };
}

/** Current save format version. Bump and handle in sanitizeCharacter on breaking changes. */
export const CHARACTER_VERSION = 3;

export function createDefaultCharacter(): CharacterData {
  return {
    version: CHARACTER_VERSION,
    name: '',
    heritage: '',
    class: '',
    level: 1,
    background: '',
    abilities: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    armorClass: {
      proficiency: ProficiencyRank.Trained,
      dexCap: null,
      itemBonus: 0,
      miscBonus: 0,
    },
    savingThrows: {
      fortitude: { proficiency: ProficiencyRank.Trained, miscBonus: 0 },
      reflex: { proficiency: ProficiencyRank.Trained, miscBonus: 0 },
      will: { proficiency: ProficiencyRank.Trained, miscBonus: 0 },
    },
    hp: { ancestryBonus: 0, classBonus: 0, miscBonus: 0 },
    speed: 25,
    perception: { proficiency: ProficiencyRank.Trained, miscBonus: 0 },
    classDC: {
      proficiency: ProficiencyRank.Trained,
      keyAbility: Ability.STR,
      miscBonus: 0,
    },
    skills: STANDARD_SKILLS.map((s) => ({
      name: s.name,
      ability: s.ability,
      proficiency: ProficiencyRank.Untrained,
      miscBonus: 0,
      isLore: false,
    })),
    languages: ['Common'],
    attacks: [],
    abilities_list: [],
    casting: [],
    items: [],
  };
}

export const character = writable<CharacterData>(createDefaultCharacter());

export type RenderMode = 'standard' | 'dense' | 'mobile';
export const renderMode = writable<RenderMode>('standard');

export const computedAC = derived(character, ($c) =>
  calcAC($c.armorClass, $c.abilities, $c.level),
);

export const computedFortitude = derived(character, ($c) =>
  calcSave($c.savingThrows.fortitude, $c.abilities, Ability.CON, $c.level),
);

export const computedReflex = derived(character, ($c) =>
  calcSave($c.savingThrows.reflex, $c.abilities, Ability.DEX, $c.level),
);

export const computedWill = derived(character, ($c) =>
  calcSave($c.savingThrows.will, $c.abilities, Ability.WIS, $c.level),
);

export const computedHP = derived(character, ($c) =>
  calcHP($c.hp, $c.abilities, $c.level),
);

export const computedPerception = derived(character, ($c) =>
  calcPerception($c.perception, $c.abilities, $c.level),
);

export const computedClassDC = derived(character, ($c) =>
  calcClassDC($c.classDC, $c.abilities, $c.level),
);

export const computedSkills = derived(character, ($c) =>
  $c.skills.map((skill) => ({
    ...skill,
    total: calcSkill(skill, $c.abilities, $c.level),
  })),
);

export const computedAttacks = derived(character, ($c) =>
  $c.attacks.map((attack) => ({
    ...attack,
    totalBonus: calcAttackBonus(attack, $c.abilities, $c.level),
  })),
);
