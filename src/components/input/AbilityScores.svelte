<script lang="ts">
  import { character } from '../../stores/character';
  import { Ability, ABILITY_NAMES } from '../../types/constants';
  import NumberInput from './shared/NumberInput.svelte';

  const abilities = Object.values(Ability);
</script>

<div class="abilities-row">
  {#each abilities as ab}
    <NumberInput
      label={ABILITY_NAMES[ab]}
      bind:value={$character.abilities[ab]}
    />
  {/each}
</div>

<style>
  .abilities-row {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }
</style>
