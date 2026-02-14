import { ProficiencyRank, type Ability } from '../types/constants';
import type {
  AbilityModifiers,
  ArmorClass,
  CharacterData,
  ClassDC,
  Perception,
  SavingThrow,
  SkillEntry,
  AttackEntry,
  SpellcastingConfig,
} from '../types/character';

export function proficiencyBonus(rank: ProficiencyRank, level: number): number {
  if (rank === ProficiencyRank.Untrained) return 0;
  return rank * 2 + level;
}

export function abilityMod(abilities: AbilityModifiers, ability: Ability): number {
  return abilities[ability];
}

export function calcAC(ac: ArmorClass, abilities: AbilityModifiers, level: number): number {
  const dex = abilities.DEX;
  const dexContribution = ac.dexCap !== null ? Math.min(dex, ac.dexCap) : dex;
  return 10 + proficiencyBonus(ac.proficiency, level) + dexContribution + ac.itemBonus + ac.miscBonus;
}

export function calcSave(
  save: SavingThrow,
  abilities: AbilityModifiers,
  ability: Ability,
  level: number,
): number {
  return proficiencyBonus(save.proficiency, level) + abilityMod(abilities, ability) + save.miscBonus;
}

export function calcSkill(
  skill: SkillEntry,
  abilities: AbilityModifiers,
  level: number,
): number {
  return proficiencyBonus(skill.proficiency, level) + abilityMod(abilities, skill.ability) + skill.miscBonus;
}

export function calcHP(
  hp: CharacterData['hp'],
  abilities: AbilityModifiers,
  level: number,
): number {
  return hp.ancestryBonus + (hp.classBonus + abilities.CON) * level + hp.miscBonus;
}

export function calcClassDC(
  classDC: ClassDC,
  abilities: AbilityModifiers,
  level: number,
): number {
  return 10 + proficiencyBonus(classDC.proficiency, level) + abilityMod(abilities, classDC.keyAbility) + classDC.miscBonus;
}

export function calcPerception(
  perception: Perception,
  abilities: AbilityModifiers,
  level: number,
): number {
  return proficiencyBonus(perception.proficiency, level) + abilities.WIS + perception.miscBonus;
}

export function calcSpellDC(
  spellcasting: SpellcastingConfig,
  abilities: AbilityModifiers,
  level: number,
): number {
  return 10 + proficiencyBonus(spellcasting.proficiency, level) + abilityMod(abilities, spellcasting.ability) + spellcasting.miscBonus;
}

export function calcSpellAttack(
  spellcasting: SpellcastingConfig,
  abilities: AbilityModifiers,
  level: number,
): number {
  return proficiencyBonus(spellcasting.proficiency, level) + abilityMod(abilities, spellcasting.ability) + spellcasting.miscBonus;
}

export function calcAttackBonus(
  attack: AttackEntry,
  abilities: AbilityModifiers,
  level: number,
): number {
  return proficiencyBonus(attack.proficiency, level) + abilityMod(abilities, attack.ability) + attack.itemBonus + attack.miscBonus;
}
