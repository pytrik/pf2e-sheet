<script lang="ts">
  import { character, computedPerception } from '../../stores/character';
  import { signedNumber } from '../../utils/format';
  import ProficiencySelector from './shared/ProficiencySelector.svelte';
  import NumberInput from './shared/NumberInput.svelte';
</script>

<div class="perception-row">
  <ProficiencySelector bind:value={$character.perception.proficiency} />
  <NumberInput label="Misc" bind:value={$character.perception.miscBonus} />
  <div class="computed-value">{signedNumber($computedPerception)}</div>
</div>

<style>
  .perception-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
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
</style>
