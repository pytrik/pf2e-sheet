<script lang="ts">
  import { PROFICIENCY_LABELS, CASTING_KINDS } from '../../types/constants';
  import type { AbilityEntry, CastingSource } from '../../types/character';
  import { character } from '../../stores/character';
  import { calcSpellDC, calcSpellAttack } from '../../utils/calculations';
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

  /** Entries grouped by level, ascending; empty levels left out. */
  function groupByLevel(source: CastingSource) {
    const levels = [...new Set(source.entries.map((e) => e.level))].sort((a, b) => a - b);
    return levels.map((level) => ({ level, entries: source.entries.filter((e) => e.level === level) }));
  }

  $: castingSources = $character.casting.filter((s) => s.name !== '' || s.entries.length > 0);
</script>

<div class="sheet-page">
  <!-- Abilities -->
  {#if sortedAbilities.length > 0}
    <h2>Abilities</h2>
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
  {/if}

  <!-- Spells, formulas, ... -->
  {#each castingSources as source (source.id)}
    {@const kind = CASTING_KINDS[source.kind]}
    <h2>{kind.title}{source.name ? ` — ${source.name}` : ''}</h2>
    <div class="spells-section">
      {#if kind.hasDC || (kind.hasPerDay && source.perDay != null)}
        <div class="stat-block">
          {#if kind.hasDC}
            <div class="stat-item">
              <span class="stat-label">DC</span>
              <span class="stat-value">{calcSpellDC(source, $character.abilities, $character.level)} ({PROFICIENCY_LABELS[source.proficiency]})</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Attack</span>
              <span class="stat-value">{signedNumber(calcSpellAttack(source, $character.abilities, $character.level))} ({PROFICIENCY_LABELS[source.proficiency]})</span>
            </div>
          {/if}
          {#if kind.hasPerDay && source.perDay != null}
            <div class="stat-item">
              <span class="stat-label">Per day</span>
              <span class="stat-value">{source.perDay}</span>
            </div>
          {/if}
        </div>
      {/if}

      {#each groupByLevel(source) as group (group.level)}
        <div class="spell-level-block">
          <div class="spell-level-header">
            <h3>{kind.levelLabel(group.level)}</h3>
            {#if kind.hasSlots && group.level > 0 && source.slots[group.level] > 0}
              <span class="spell-slots">{source.slots[group.level] ?? 0} slot{source.slots[group.level] === 1 ? '' : 's'}</span>
            {/if}
          </div>
          {#each group.entries as entry (entry.id)}
            <div class="spell-entry">
              <span class="spell-entry-name">{entry.name}</span>
              {#if entry.actions}
                <span class="spell-entry-actions">{formatActions(entry.actions)}</span>
              {/if}
              {#if entry.description}
                <div class="spell-entry-description">{entry.description}</div>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/each}

  <!-- Items -->
  {#if $character.items.length > 0}
    <h2>Items</h2>
    <table class="items-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Wt</th>
          <th>Val</th>
          <th>Amt</th>
          <th>Uses</th>
        </tr>
      </thead>
      <tbody>
        {#each $character.items as item}
          <tr>
            <td class="item-name">{item.name}</td>
            <td class="item-num">{item.weight ?? '—'}</td>
            <td class="item-num">{item.value ?? '—'}</td>
            <td class="item-num">{item.amount ?? '—'}</td>
            <td class="item-num">{item.uses ?? '—'}</td>
          </tr>
          {#if item.description}
            <tr>
              <td colspan="5" class="item-description">{item.description}</td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {/if}
</div>
