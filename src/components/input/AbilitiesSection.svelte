<script lang="ts">
  import { character } from '../../stores/character';
  import { AbilityEntryType } from '../../types/constants';
  import { generateId } from '../../utils/format';
  import NumberInput from './shared/NumberInput.svelte';

  const abilityTypes = Object.values(AbilityEntryType);

  function addAbility() {
    $character.abilities_list = [
      ...$character.abilities_list,
      {
        id: generateId(),
        name: '',
        actions: '',
        type: AbilityEntryType.Class,
        level: null,
        description: '',
      },
    ];
  }

  function removeAbility(id: string) {
    $character.abilities_list = $character.abilities_list.filter((a) => a.id !== id);
  }

  function handleLevelInput(entry: typeof $character.abilities_list[0], e: Event) {
    const target = e.target as HTMLInputElement;
    const raw = target.value.trim();
    if (raw === '') {
      entry.level = null;
    } else {
      entry.level = Number(raw);
    }
    $character = $character;
  }
</script>

<div class="abilities-section">
  {#each $character.abilities_list as entry, i (entry.id)}
    <div class="ability-entry">
      <div class="ability-row">
        <div class="field grow">
          {#if i === 0}<span class="column-header">Name</span>{/if}
          <input type="text" bind:value={entry.name} placeholder="Ability / Feat name" />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Act</span>{/if}
          <input
            type="text"
            bind:value={entry.actions}
            placeholder="--"
            class="actions-input"
          />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Type</span>{/if}
          <select bind:value={entry.type}>
            {#each abilityTypes as t}
              <option value={t}>{t}</option>
            {/each}
          </select>
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Lvl</span>{/if}
          <input
            type="number"
            value={entry.level ?? ''}
            on:input={(e) => handleLevelInput(entry, e)}
            placeholder="--"
            min={1}
            max={20}
            class="level-input"
          />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">&nbsp;</span>{/if}
          <button type="button" class="remove-btn" on:click={() => removeAbility(entry.id)}>
            &times;
          </button>
        </div>
      </div>
      <div class="description-row">
        <textarea
          bind:value={entry.description}
          placeholder="Description..."
          rows="2"
        ></textarea>
      </div>
    </div>
  {/each}

  <button type="button" class="add-btn" on:click={addAbility}>+ Add Ability</button>
</div>

<style>
  .abilities-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .ability-entry {
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .ability-entry:last-of-type {
    border-bottom: none;
  }

  .ability-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .description-row {
    margin-top: var(--spacing-xs);
  }

  .description-row textarea {
    width: 100%;
    resize: vertical;
    font-size: 0.85rem;
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

  .grow {
    flex: 1;
    min-width: 120px;
  }

  .grow input {
    width: 100%;
  }

  .actions-input {
    width: 50px;
    text-align: center;
  }

  .level-input {
    width: 50px;
    text-align: center;
  }

  select {
    width: 90px;
  }

  .remove-btn {
    background: none;
    border: 1px solid var(--color-danger, #c00);
    color: var(--color-danger, #c00);
    border-radius: var(--radius);
    padding: 2px 8px;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }

  .remove-btn:hover {
    background: var(--color-danger, #c00);
    color: white;
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
