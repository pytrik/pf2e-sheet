// Convert a Pathbuilder 2e "Export JSON" file into this app's character format.
// The result is a plain object in the v3 shape; it still goes through
// sanitizeCharacter, so this file only maps fields and never validates.

import { STANDARD_SKILLS, AbilityEntryType, CASTING_KINDS } from '../types/constants';
import { CHARACTER_VERSION } from './character';

type Rec = Record<string, unknown>;

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

function rec(v: unknown): Rec {
  return typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Rec) : {};
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function n(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function s(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function cap(v: string): string {
  return v ? v[0].toUpperCase() + v.slice(1) : v;
}

/** Pathbuilder stores proficiency as its bonus (0/2/4/6/8); this app uses the rank. */
function rank(v: unknown): number {
  return Math.max(0, Math.min(4, Math.round(n(v) / 2)));
}

/** Pathbuilder exports `{ success, build }`; also accept the bare build. */
export function getPathbuilderBuild(raw: unknown): Rec | null {
  const r = rec(raw);
  const build = 'build' in r ? rec(r.build) : r;
  return 'proficiencies' in build && 'abilities' in build && !('version' in build) ? build : null;
}

/** Sum of all bonuses Pathbuilder lists under `mods[key]`, e.g. { "Item Bonus": 1 }. */
function modBonus(build: Rec, key: string): number {
  return Object.values(rec(rec(build.mods)[key])).reduce<number>((sum, v) => sum + n(v), 0);
}

function featType(type: string): AbilityEntryType {
  if (/^(Ancestry Feat|Heritage)$/.test(type)) return AbilityEntryType.Ancestry;
  if (type === 'Skill Feat') return AbilityEntryType.Skill;
  if (type === 'General Feat') return AbilityEntryType.General;
  if (/^(Awarded|Bonus) Feat$/.test(type)) return AbilityEntryType.Feat;
  // "Class Feat", "Archetype Feat", and class-named types like "Ranger Feat"
  if (/Feat$/.test(type)) return AbilityEntryType.Class;
  return AbilityEntryType.Other;
}

const STRIKING_DICE: Record<string, number> = { striking: 2, greaterStriking: 3, majorStriking: 4 };

export interface PathbuilderResult {
  data: Rec;
  /** What couldn't be imported, for telling the user. */
  notes: string[];
}

export function fromPathbuilder(build: Rec): PathbuilderResult {
  const notes: string[] = [];
  const level = Math.max(1, n(build.level));
  const prof = rec(build.proficiencies);
  const attrs = rec(build.attributes);

  // Ability scores (e.g. 14, 19) → modifiers. Pathbuilder may already export
  // modifiers; scores are never below 8 in practice, modifiers never above 7.
  const rawAbilities = rec(build.abilities);
  const scores = ABILITY_KEYS.map((k) => n(rawAbilities[k]));
  const areScores = scores.some((v) => v > 7);
  const mods = Object.fromEntries(
    ABILITY_KEYS.map((k, i) => [k.toUpperCase(), areScores ? Math.floor((scores[i] - 10) / 2) : scores[i]]),
  ) as Record<string, number>;

  const ancestry = s(build.ancestry);
  const heritage = s(build.heritage);
  const heritageText = !heritage ? ancestry
    : !ancestry || heritage.includes(ancestry) ? heritage
    : `${ancestry} (${heritage})`;

  // AC: proficiency of the worn armor's category; Pathbuilder doesn't export
  // the Dex cap, but a Dex bonus lower than the Dex modifier means one applied.
  const worn = arr(build.armor).map(rec).find((a) => a.worn === true);
  const ac = rec(build.acTotal);
  const acDex = n(ac.acAbilityBonus);
  const dexCap = 'acAbilityBonus' in ac && acDex < mods.DEX ? acDex : null;

  const skills = [
    ...STANDARD_SKILLS.map((sk) => ({
      name: sk.name,
      ability: sk.ability,
      proficiency: rank(prof[sk.name.toLowerCase()]),
      miscBonus: modBonus(build, sk.name),
      isLore: false,
    })),
    ...arr(build.lores).map((l) => {
      const [name, p] = arr(l);
      return { name: `${s(name)} Lore`, ability: 'INT', proficiency: rank(p), miscBonus: 0, isLore: true };
    }),
  ];

  const specific = rec(build.specificProficiencies);
  const specificRank = (weapon: string): number | null => {
    const ranks = ['trained', 'expert', 'master', 'legendary'];
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (arr(specific[ranks[i]]).includes(weapon)) return i + 1;
    }
    return null;
  };

  // Pathbuilder gives the final attack bonus but not which ability it used:
  // pick STR or DEX, whichever explains the total, and put any rest in misc.
  const attacks = arr(build.weapons).map(rec).map((w) => {
    const pRank = specificRank(s(w.name)) ?? rank(prof[s(w.prof)]);
    const base = (pRank > 0 ? level + pRank * 2 : 0) + n(w.pot);
    const total = n(w.attack);
    const ability = Math.abs(total - base - mods.DEX) < Math.abs(total - base - mods.STR) ? 'DEX' : 'STR';
    const dice = STRIKING_DICE[s(w.str)] ?? 1;
    const bonus = n(w.damageBonus);
    const damage = [
      `${dice}${s(w.die)}${bonus > 0 ? `+${bonus}` : bonus < 0 ? bonus : ''} ${s(w.damageType)}`.trim(),
      ...arr(w.extraDamage).map(s),
    ].filter(Boolean).join(', ');
    return {
      name: s(w.display) || s(w.name),
      actions: '',
      ability,
      proficiency: pRank,
      itemBonus: n(w.pot),
      miscBonus: total ? total - base - mods[ability] : 0,
      damage,
      traits: arr(w.runes).map(s).filter(Boolean).join(', '),
    };
  });

  const feats = arr(build.feats).map((f) => {
    const [name, extra, type, lvl] = arr(f);
    return {
      name: s(extra) ? `${s(name)} (${s(extra)})` : s(name),
      actions: '',
      type: featType(s(type)),
      level: typeof lvl === 'number' ? lvl : null,
      description: '',
    };
  });
  const featNames = new Set(arr(build.feats).map((f) => s(arr(f)[0])));
  const specials = arr(build.specials).map(s)
    .filter((name) => name && !featNames.has(name))
    .map((name) => ({ name, actions: '', type: AbilityEntryType.Class, level: null, description: '' }));

  const items = [
    ...arr(build.armor).map(rec).map((a) => ({ name: s(a.display) || s(a.name), amount: n(a.qty) || 1 })),
    ...arr(build.equipment).map((e) => {
      const [name, qty] = arr(e);
      return { name: s(name), amount: n(qty) || 1 };
    }),
  ].map((i) => ({ ...i, weight: null, value: null, uses: null, description: '' }));
  const money = rec(build.money);
  const coins = ['pp', 'gp', 'sp', 'cp'].filter((c) => n(money[c]) > 0).map((c) => `${n(money[c])} ${c}`);
  if (coins.length) {
    items.push({ name: 'Money', amount: 1, weight: null, value: null, uses: null, description: coins.join(', ') });
  }

  // Spellcasting: one spells source per caster, plus one per focus tradition.
  const spellSource = (name: string, ability: string, p: unknown, entries: Rec[], slots: unknown[] = []) => ({
    kind: 'spells', name, ability: ability.toUpperCase(), proficiency: rank(p), miscBonus: 0, slots, entries,
  });
  const casting: Rec[] = arr(build.spellCasters).map(rec).map((c) => spellSource(
    [cap(s(c.magicTradition)), s(c.name) && `(${s(c.name)})`].filter(Boolean).join(' '),
    s(c.ability),
    c.proficiency,
    arr(c.spells).map(rec).flatMap((group) =>
      arr(group.list).map((spell) => ({ name: s(spell), level: n(group.spellLevel), actions: '', description: '' })),
    ),
    arr(c.perDay),
  ));
  // Focus spells heighten to half the character's level, rounded up.
  const focusRank = Math.min(CASTING_KINDS.spells.maxLevel, Math.ceil(level / 2));
  for (const [tradition, byAbility] of Object.entries(rec(build.focus))) {
    for (const [ability, f] of Object.entries(rec(byAbility))) {
      const focus = rec(f);
      const entries = [
        ...arr(focus.focusCantrips).map((name) => ({ name: s(name), level: 0 })),
        ...arr(focus.focusSpells).map((name) => ({ name: s(name), level: focusRank })),
      ].map((e) => ({ ...e, actions: '', description: '' }));
      if (entries.length) casting.push(spellSource(`${cap(tradition)} focus`, ability, focus.proficiency, entries));
    }
  }

  // Pathbuilder doesn't export formula levels; they land at level 0.
  const formulas = arr(build.formula).map(rec).filter((f) => arr(f.known).length > 0);
  for (const f of formulas) {
    casting.push({
      kind: 'formulas',
      name: s(f.type),
      perDay: null,
      entries: arr(f.known).map((name) => ({ name: s(name), level: 0, actions: '', description: '' })),
    });
  }

  notes.push('Feat, spell, formula and item descriptions (Pathbuilder only exports names)');
  if (formulas.length) notes.push('Formula levels (all formulas are at level 0; change them per formula)');
  if (worn && !('acAbilityBonus' in ac)) notes.push('Armor Dex cap');
  if (arr(build.pets).length || arr(build.familiars).length) notes.push('Pets and familiars');
  if (n(build.focusPoints) > 0) notes.push(`Focus points (${n(build.focusPoints)})`);

  return {
    notes,
    data: {
      version: CHARACTER_VERSION,
      name: s(build.name),
      heritage: heritageText,
      class: [s(build.class), s(build.dualClass)].filter(Boolean).join(' / '),
      level,
      background: s(build.background),
      abilities: mods,
      armorClass: {
        proficiency: rank(prof[worn ? s(worn.prof) : 'unarmored']),
        dexCap,
        itemBonus: n(ac.acItemBonus),
        miscBonus: 0,
      },
      savingThrows: {
        fortitude: { proficiency: rank(prof.fortitude), miscBonus: modBonus(build, 'Fortitude') },
        reflex: { proficiency: rank(prof.reflex), miscBonus: modBonus(build, 'Reflex') },
        will: { proficiency: rank(prof.will), miscBonus: modBonus(build, 'Will') },
      },
      hp: {
        ancestryBonus: n(attrs.ancestryhp),
        classBonus: n(attrs.classhp) + n(attrs.bonushpPerLevel),
        miscBonus: n(attrs.bonushp),
      },
      speed: n(attrs.speed) + n(attrs.speedBonus),
      perception: { proficiency: rank(prof.perception), miscBonus: modBonus(build, 'Perception') },
      classDC: {
        proficiency: rank(prof.classDC),
        keyAbility: s(build.keyability).toUpperCase(),
        miscBonus: 0,
      },
      skills,
      languages: arr(build.languages).map(s).filter((l) => l && l !== 'None selected'),
      attacks,
      abilities_list: [...feats, ...specials],
      casting,
      items,
    },
  };
}
