<script lang="ts">
  import { character } from '../../stores/character';

  function addLanguage() {
    $character.languages = [...$character.languages, ''];
  }

  function removeLanguage(index: number) {
    $character.languages = $character.languages.filter((_, i) => i !== index);
  }
</script>

<div class="languages-section">
  <div class="languages-list">
    {#each $character.languages as _, i}
      <div class="language-row">
        <input
          type="text"
          bind:value={$character.languages[i]}
          placeholder="Language"
        />
        <button class="remove-btn" type="button" on:click={() => removeLanguage(i)}>
          &times;
        </button>
      </div>
    {/each}
  </div>
  <div>
    <button class="small secondary" type="button" on:click={addLanguage}>+ Add Language</button>
  </div>
</div>

<style>
  .languages-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .languages-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .language-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
  }

  .language-row input {
    flex: 1;
    min-width: 120px;
  }
</style>
