<script lang="ts">
  import { character, computedClassDC } from '../../stores/character';
  import ProficiencySelector from './shared/ProficiencySelector.svelte';
  import NumberInput from './shared/NumberInput.svelte';
  import AbilitySelect from './shared/AbilitySelect.svelte';
</script>

<div class="classdc-row">
  <ProficiencySelector bind:value={$character.classDC.proficiency} />
  <AbilitySelect label="Key Ability" bind:value={$character.classDC.keyAbility} />
  <NumberInput label="Misc" bind:value={$character.classDC.miscBonus} />
  <div class="computed-value">{$computedClassDC}</div>
</div>

<style>
  .classdc-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-end;
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
