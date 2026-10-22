export enum ProficiencyRank {
  Untrained = 0,
  Trained = 1,
  Expert = 2,
  Master = 3,
  Legendary = 4,
}

export const PROFICIENCY_LABELS: Record<ProficiencyRank, string> = {
  [ProficiencyRank.Untrained]: 'U',
  [ProficiencyRank.Trained]: 'T',
  [ProficiencyRank.Expert]: 'E',
  [ProficiencyRank.Master]: 'M',
  [ProficiencyRank.Legendary]: 'L',
};

export enum Ability {
  STR = 'STR',
  DEX = 'DEX',
  CON = 'CON',
  INT = 'INT',
  WIS = 'WIS',
  CHA = 'CHA',
}

export const ABILITY_NAMES: Record<Ability, string> = {
  [Ability.STR]: 'Strength',
  [Ability.DEX]: 'Dexterity',
  [Ability.CON]: 'Constitution',
  [Ability.INT]: 'Intelligence',
  [Ability.WIS]: 'Wisdom',
  [Ability.CHA]: 'Charisma',
};

export interface StandardSkill {
  name: string;
  ability: Ability;
}

export const STANDARD_SKILLS: StandardSkill[] = [
  { name: 'Acrobatics', ability: Ability.DEX },
  { name: 'Arcana', ability: Ability.INT },
  { name: 'Athletics', ability: Ability.STR },
  { name: 'Crafting', ability: Ability.INT },
  { name: 'Deception', ability: Ability.CHA },
  { name: 'Diplomacy', ability: Ability.CHA },
  { name: 'Intimidation', ability: Ability.CHA },
  { name: 'Medicine', ability: Ability.WIS },
  { name: 'Nature', ability: Ability.WIS },
  { name: 'Occultism', ability: Ability.INT },
  { name: 'Performance', ability: Ability.CHA },
  { name: 'Religion', ability: Ability.WIS },
  { name: 'Society', ability: Ability.INT },
  { name: 'Stealth', ability: Ability.DEX },
  { name: 'Survival', ability: Ability.WIS },
  { name: 'Thievery', ability: Ability.DEX },
];

export enum AbilityEntryType {
  Class = 'Class',
  Ancestry = 'Ancestry',
  Feat = 'Feat',
  Skill = 'Skill',
  General = 'General',
  Other = 'Other',
}

export const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type SpellLevel = (typeof SPELL_LEVELS)[number];

export const SPELL_LEVEL_LABELS: Record<number, string> = {
  0: 'Cantrips',
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
  5: '5th',
  6: '6th',
  7: '7th',
  8: '8th',
  9: '9th',
  10: '10th',
};

export type CastingKind = 'spells' | 'formulas';

export interface CastingKindConfig {
  /** Section title on the sheet and in the add button. */
  title: string;
  /** Singular noun for one entry ("spell", "formula"). */
  entry: string;
  /** Label and placeholder for the source's name field. */
  nameLabel: string;
  namePlaceholder: string;
  /** Highest level an entry can have (lowest is always 0). */
  maxLevel: number;
  levelLabel: (level: number) => string;
  /** Has its own DC and attack (ability + proficiency + misc). */
  hasDC: boolean;
  /** Tracks slots per level (level 0 never has slots). */
  hasSlots: boolean;
  /** Tracks a single per-day count, e.g. versatile vials. */
  hasPerDay: boolean;
}

/**
 * Everything that differs between kinds of casting source lives here, so a new
 * kind (focus spells, innate spells, rituals, ...) is one more entry.
 */
export const CASTING_KINDS: Record<CastingKind, CastingKindConfig> = {
  spells: {
    title: 'Spells',
    entry: 'spell',
    nameLabel: 'Tradition',
    namePlaceholder: 'Arcane, Divine...',
    maxLevel: 10,
    levelLabel: (l) => SPELL_LEVEL_LABELS[l] ?? `Rank ${l}`,
    hasDC: true,
    hasSlots: true,
    hasPerDay: false,
  },
  formulas: {
    title: 'Formulas',
    entry: 'formula',
    nameLabel: 'Source',
    namePlaceholder: 'Alchemist, Munitions Crafter...',
    maxLevel: 20,
    levelLabel: (l) => `Level ${l}`,
    hasDC: false,
    hasSlots: false,
    hasPerDay: true,
  },
};

export const CASTING_KIND_IDS = Object.keys(CASTING_KINDS) as CastingKind[];
