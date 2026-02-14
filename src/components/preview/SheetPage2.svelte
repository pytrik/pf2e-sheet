<script lang="ts">
  import { SPELL_LEVELS, SPELL_LEVEL_LABELS } from '../../types/constants';
  import type { SpellLevel } from '../../types/constants';
  import type { AbilityEntry } from '../../types/character';
  import {
    character,
    computedAttacks,
    computedSpellDC,
    computedSpellAttack,
  } from '../../stores/character';
  import { signedNumber, formatActions } from '../../utils/format';

  function actionCost(actions: string): number {
    if (!actions) return Infinity;
    if (/^(f|free|r|reaction)$/i.test(actions)) return 0;
    const n = Number(actions);
    if (n >= 1 && n <= 3) return n;
    return 4;
  }

  /** Sort abilities: action-users first, then by cost, level, name. */
  function sortAbilities(list: AbilityEntry[]): AbilityEntry[] {
    return [...list].sort((a, b) => {
      const aHas = a.actions ? 0 : 1;
      const bHas = b.actions ? 0 : 1;
      if (aHas !== bHas) return aHas - bHas;
      const aCost = actionCost(a.actions);
      const bCost = actionCost(b.actions);
      if (aCost !== bCost) return aCost - bCost;
      const aLvl = a.level ?? Infinity;
      const bLvl = b.level ?? Infinity;
      if (aLvl !== bLvl) return aLvl - bLvl;
      return a.name.localeCompare(b.name);
    });
  }

  $: sortedAbilities = sortAbilities($character.abilities_list);

  $: hasSpellcasting = $character.spellcasting.tradition !== '';

  $: spellLevelsWithSpells = (SPELL_LEVELS as readonly SpellLevel[]).filter(
    (lvl) => {
      const data = $character.spellcasting.spellLevels[lvl];
      return data && data.spells.length > 0;
    },
  );
</script>

<div class="sheet-page">
  <!-- Attacks -->
  <h2>Attacks</h2>
  {#if $computedAttacks.length > 0}
    <table class="attacks-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Actions</th>
          <th>Attack</th>
          <th>Damage</th>
          <th>Traits</th>
        </tr>
      </thead>
      <tbody>
        {#each $computedAttacks as atk}
          <tr>
            <td>{atk.name}</td>
            <td>{atk.actions ? formatActions(atk.actions) : '--'}</td>
            <td class="attack-bonus">{signedNumber(atk.totalBonus)}</td>
            <td>{atk.damage || '--'}</td>
            <td class="attack-traits">{atk.traits || '--'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="empty-state">No attacks added</p>
  {/if}

  <!-- Abilities -->
  <h2>Abilities</h2>
  {#if sortedAbilities.length > 0}
    <div class="abilities-list">
      {#each sortedAbilities as entry}
        <div class="ability-entry">
          <div class="ability-entry-header">
            <span class="ability-entry-name">{entry.name}</span>
            <span class="badge">{entry.type}</span>
            {#if entry.level != null}
              <span class="badge">Lvl {entry.level}</span>
            {/if}
            {#if entry.actions}
              <span class="ability-entry-actions">{formatActions(entry.actions)}</span>
            {/if}
          </div>
          {#if entry.description}
            <div class="ability-entry-description">{entry.description}</div>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="empty-state">No abilities added</p>
  {/if}

  <!-- Spells -->
  <h2>Spells</h2>
  {#if hasSpellcasting}
    <div class="spells-section">
      <div class="stat-block">
        <div class="stat-item">
          <span class="stat-label">Tradition</span>
          <span class="stat-value">{$character.spellcasting.tradition}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Spell DC</span>
          <span class="stat-value">{$computedSpellDC}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Spell Attack</span>
          <span class="stat-value">{signedNumber($computedSpellAttack)}</span>
        </div>
      </div>

      {#if spellLevelsWithSpells.length > 0}
        {#each spellLevelsWithSpells as lvl}
          <div class="spell-level-block">
            <div class="spell-level-header">
              <h3>{SPELL_LEVEL_LABELS[lvl]}</h3>
              {#if lvl > 0}
                <span class="spell-slots">{$character.spellcasting.spellLevels[lvl].slots} slot{$character.spellcasting.spellLevels[lvl].slots === 1 ? '' : 's'}</span>
              {/if}
            </div>
            {#each $character.spellcasting.spellLevels[lvl].spells as spell}
              <div class="spell-entry">
                <span class="spell-entry-name">{spell.name}</span>
                {#if spell.actions}
                  <span class="spell-entry-actions">{formatActions(spell.actions)}</span>
                {/if}
                {#if spell.description}
                  <div class="spell-entry-description">{spell.description}</div>
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      {:else}
        <p class="empty-state">No spells added</p>
      {/if}
    </div>
  {:else}
    <p class="empty-state">No spellcasting tradition set</p>
  {/if}
</div>
