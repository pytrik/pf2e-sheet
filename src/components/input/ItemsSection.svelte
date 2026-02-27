<script lang="ts">
  import { character } from '../../stores/character';
  import { generateId } from '../../utils/format';

  function addItem() {
    $character.items = [
      ...$character.items,
      {
        id: generateId(),
        name: '',
        weight: null,
        value: null,
        amount: null,
        uses: null,
        description: '',
      },
    ];
  }

  function removeItem(id: string) {
    $character.items = $character.items.filter((i) => i.id !== id);
  }

  function handleNumberInput(item: typeof $character.items[0], field: 'weight' | 'value' | 'amount' | 'uses', e: Event) {
    const target = e.target as HTMLInputElement;
    const raw = target.value.trim();
    if (raw === '') {
      item[field] = null;
    } else {
      item[field] = Number(raw);
    }
    $character = $character;
  }
</script>

<div class="items-section">
  {#each $character.items as item, i (item.id)}
    <div class="item-entry">
      <div class="item-row">
        <div class="field grow">
          {#if i === 0}<span class="column-header">Name</span>{/if}
          <input type="text" bind:value={item.name} placeholder="Item name" />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Weight</span>{/if}
          <input
            type="number"
            value={item.weight ?? ''}
            on:input={(e) => handleNumberInput(item, 'weight', e)}
            placeholder="--"
            min={0}
            step="any"
            class="num-input"
          />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Value</span>{/if}
          <input
            type="number"
            value={item.value ?? ''}
            on:input={(e) => handleNumberInput(item, 'value', e)}
            placeholder="--"
            min={0}
            step="any"
            class="num-input"
          />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Amt</span>{/if}
          <input
            type="number"
            value={item.amount ?? ''}
            on:input={(e) => handleNumberInput(item, 'amount', e)}
            placeholder="--"
            min={0}
            class="num-input"
          />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Uses</span>{/if}
          <input
            type="number"
            value={item.uses ?? ''}
            on:input={(e) => handleNumberInput(item, 'uses', e)}
            placeholder="--"
            min={0}
            class="num-input"
          />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">&nbsp;</span>{/if}
          <button type="button" class="remove-btn" on:click={() => removeItem(item.id)}>
            &times;
          </button>
        </div>
      </div>
      <div class="description-row">
        <textarea
          bind:value={item.description}
          placeholder="Description..."
          rows="2"
        ></textarea>
      </div>
    </div>
  {/each}

  <button type="button" class="add-btn" on:click={addItem}>+ Add Item</button>
</div>

<style>
  .items-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .item-entry {
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .item-entry:last-of-type {
    border-bottom: none;
  }

  .item-row {
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

  .num-input {
    width: 55px;
    text-align: center;
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
