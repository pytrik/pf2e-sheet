<script lang="ts">
  import { character, createCastingSource } from '../../stores/character';
  import { CASTING_KINDS, CASTING_KIND_IDS, type CastingKind } from '../../types/constants';
  import CastingSourceEditor from './CastingSourceEditor.svelte';

  function addSource(kind: CastingKind) {
    $character.casting = [...$character.casting, createCastingSource(kind)];
  }

  function removeSource(id: string) {
    $character.casting = $character.casting.filter((s) => s.id !== id);
  }
</script>

<div class="casting-section">
  {#each $character.casting as source (source.id)}
    <CastingSourceEditor bind:source onRemove={() => removeSource(source.id)} />
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

  .add-sources {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
    flex-wrap: wrap;
  }
</style>
