<script lang="ts">
  import { character, createCastingSource } from '../../stores/character';
  import { CASTING_KINDS, CASTING_KIND_IDS, type CastingKind } from '../../types/constants';
  import type { CastingSource } from '../../types/character';
  import { calcSpellDC, calcSpellAttack } from '../../utils/calculations';
  import { signedNumber, generateId } from '../../utils/format';
  import ProficiencySelector from './shared/ProficiencySelector.svelte';
  import NumberInput from './shared/NumberInput.svelte';
  import AbilitySelect from './shared/AbilitySelect.svelte';
  import ActionSelect from './shared/ActionSelect.svelte';

  /** Level picked in each source's "add at level" select, by source id. */
  let newLevel: Record<string, number> = {};
  /** Source id whose remove button is waiting for confirmation. */
  let confirmRemove: string | null = null;

  function levelOptions(source: CastingSource): number[] {
    return Array.from({ length: CASTING_KINDS[source.kind].maxLevel + 1 }, (_, i) => i);
  }

  /** Levels that have at least one entry, ascending. */
  function usedLevels(source: CastingSource): number[] {
    return [...new Set(source.entries.map((e) => e.level))].sort((a, b) => a - b);
  }

  function addSource(kind: CastingKind) {
    $character.casting = [...$character.casting, createCastingSource(kind)];
  }

  function removeSource(id: string) {
    $character.casting = $character.casting.filter((s) => s.id !== id);
    confirmRemove = null;
  }

  function updateSource(id: string, fn: (source: CastingSource) => CastingSource) {
    $character.casting = $character.casting.map((s) => (s.id === id ? fn(s) : s));
  }

  function addEntry(source: CastingSource, level: number) {
    updateSource(source.id, (s) => ({
      ...s,
      entries: [...s.entries, { id: generateId(), name: '', level, actions: '', description: '' }],
    }));
  }

  function removeEntry(source: CastingSource, id: string) {
    updateSource(source.id, (s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
  }
</script>

<div class="casting-section">
  <!-- Bindings go through $character.casting[si]... rather than the each items:
       Svelte 5's legacy mode doesn't notify other store subscribers for bindings
       inside an each over a plain item property (source.entries). -->
  {#each $character.casting as source, si (source.id)}
    {@const kind = CASTING_KINDS[source.kind]}
    <div class="source">
      <div class="source-header">
        <h4>{kind.title}{source.name ? ` — ${source.name}` : ''}</h4>
        {#if confirmRemove === source.id}
          <span class="confirm-remove">
            Remove {kind.title.toLowerCase()} and all its entries?
            <button type="button" class="small danger" on:click={() => removeSource(source.id)}>Remove</button>
            <button type="button" class="small secondary" on:click={() => (confirmRemove = null)}>Cancel</button>
          </span>
        {:else}
          <button
            type="button"
            class="remove-btn"
            aria-label="Remove {kind.title.toLowerCase()}{source.name ? ` (${source.name})` : ''}"
            on:click={() => (confirmRemove = source.id)}
          >
            &times;
          </button>
        {/if}
      </div>

      <div class="config-row">
        <div class="field">
          <label for="casting-name-{source.id}">{kind.nameLabel}</label>
          <input
            id="casting-name-{source.id}"
            type="text"
            bind:value={$character.casting[si].name}
            placeholder={kind.namePlaceholder}
            class="name-input"
          />
        </div>
        {#if kind.hasDC}
          <AbilitySelect label="Ability" bind:value={$character.casting[si].ability} />
          <div class="field">
            <span class="column-header">Proficiency</span>
            <ProficiencySelector bind:value={$character.casting[si].proficiency} ariaLabel="{kind.title} proficiency" />
          </div>
          <NumberInput label="Misc" bind:value={$character.casting[si].miscBonus} width="50px" />
          <div class="field">
            <span class="column-header">DC</span>
            <div class="computed-value">{calcSpellDC(source, $character.abilities, $character.level)}</div>
          </div>
          <div class="field">
            <span class="column-header">Attack</span>
            <div class="computed-value">{signedNumber(calcSpellAttack(source, $character.abilities, $character.level))}</div>
          </div>
        {/if}
        {#if kind.hasPerDay}
          <div class="field">
            <label for="casting-perday-{source.id}">Per day</label>
            <input
              id="casting-perday-{source.id}"
              type="number"
              value={source.perDay ?? ''}
              on:input={(e) => {
                const raw = e.currentTarget.value.trim();
                $character.casting[si].perDay = raw === '' ? null : Number(raw);
              }}
              placeholder="--"
              min={0}
              style="width: 60px"
            />
          </div>
        {/if}
      </div>

      {#each usedLevels(source) as level (level)}
        <div class="level-group">
          <div class="level-header">
            <span class="level-label">{kind.levelLabel(level)}</span>
            {#if kind.hasSlots && level > 0}
              <NumberInput
                ariaLabel="{kind.levelLabel(level)} slots"
                bind:value={$character.casting[si].slots[level]}
                min={0}
                width="50px"
              />
              <span class="slots-label">slots</span>
            {/if}
          </div>
          {#each source.entries as entry, ei (entry.id)}
            {#if entry.level === level}
              <div class="entry">
                <div class="entry-row">
                  <input
                    type="text"
                    class="grow"
                    bind:value={$character.casting[si].entries[ei].name}
                    placeholder="{kind.entry[0].toUpperCase()}{kind.entry.slice(1)} name"
                    aria-label="{kind.entry} name"
                  />
                  <ActionSelect bind:value={$character.casting[si].entries[ei].actions} />
                  <button
                    type="button"
                    class="remove-btn"
                    aria-label={`Remove ${entry.name || kind.entry}`}
                    on:click={() => removeEntry(source, entry.id)}
                  >
                    &times;
                  </button>
                </div>
                <textarea
                  bind:value={$character.casting[si].entries[ei].description}
                  placeholder="Description..."
                  aria-label="Description"
                  rows="2"
                ></textarea>
              </div>
            {/if}
          {/each}
          <button type="button" class="add-btn" on:click={() => addEntry(source, level)}>
            + Add {kind.entry}
          </button>
        </div>
      {/each}

      <div class="add-row">
        <select bind:value={newLevel[source.id]} aria-label="Level for new {kind.entry}">
          {#each levelOptions(source) as level}
            <option value={level}>{kind.levelLabel(level)}</option>
          {/each}
        </select>
        <button type="button" class="add-btn" on:click={() => addEntry(source, newLevel[source.id] ?? 0)}>
          + Add {kind.entry}
        </button>
      </div>
    </div>
  {/each}

  <div class="add-sources">
    {#each CASTING_KIND_IDS as kindId}
      <button type="button" class="add-btn" on:click={() => addSource(kindId)}>
        + Add {CASTING_KINDS[kindId].title.toLowerCase()}
      </button>
    {/each}
  </div>
</div>

<style>
  .casting-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .source {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  .source-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--spacing-xs);
  }

  h4 {
    font-size: 0.85rem;
    color: var(--color-primary);
    margin: 0;
  }

  .confirm-remove {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.8rem;
  }

  button.small {
    padding: 2px 8px;
    font-size: 0.8rem;
  }

  button.danger {
    background: var(--color-danger, #c00);
    border-color: var(--color-danger, #c00);
    color: white;
  }

  .config-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .name-input {
    width: 170px;
  }

  .field {
    display: flex;
    flex-direction: column;
  }

  .column-header {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    margin-bottom: 2px;
    white-space: nowrap;
  }

  .computed-value {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--color-primary);
    font-family: var(--font-mono);
    min-width: 40px;
    text-align: center;
    padding: 4px 0;
  }

  .level-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding-left: var(--spacing-sm);
    border-left: 2px solid var(--color-border);
  }

  .level-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .level-label {
    font-weight: 600;
    font-size: 0.85rem;
    min-width: 70px;
  }

  .slots-label {
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .entry {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--color-border);
  }

  .entry-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
  }

  .grow {
    flex: 1;
    min-width: 120px;
  }

  textarea {
    width: 100%;
    resize: vertical;
    font-size: 0.85rem;
  }

  .add-row,
  .add-sources {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
    flex-wrap: wrap;
  }

  .add-btn {
    align-self: flex-start;
    background: none;
    border: 1px dashed var(--color-border);
    color: var(--color-primary);
    border-radius: var(--radius);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.85rem;
    cursor: pointer;
  }

  .add-btn:hover {
    background: var(--color-hover);
    border-style: solid;
  }
</style>
