<script lang="ts">
  import { character } from '../../stores/character';
</script>

<div class="identity-row">
  <div class="field grow">
    <label for="char-name">Name</label>
    <input id="char-name" type="text" bind:value={$character.name} placeholder="Character name" />
  </div>
  <div class="field grow">
    <label for="char-heritage">Heritage</label>
    <input id="char-heritage" type="text" bind:value={$character.heritage} placeholder="Ancestry / Heritage" />
  </div>
  <div class="field grow">
    <label for="char-class">Class</label>
    <input id="char-class" type="text" bind:value={$character.class} placeholder="Class" />
  </div>
  <div class="field">
    <label for="char-level">Level</label>
    <input
      id="char-level"
      type="number"
      min={1}
      max={20}
      bind:value={$character.level}
      on:change={() => {
        if ($character.level < 1) $character.level = 1;
        if ($character.level > 20) $character.level = 20;
      }}
    />
  </div>
  <div class="field grow">
    <label for="char-background">Background</label>
    <input id="char-background" type="text" bind:value={$character.background} placeholder="Background" />
  </div>
</div>

<style>
  .identity-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .field {
    display: flex;
    flex-direction: column;
  }

  .grow {
    flex: 1;
    min-width: 120px;
  }

  input[type="text"] {
    width: 100%;
  }

  input[type="number"] {
    width: 60px;
    text-align: center;
  }
</style>
