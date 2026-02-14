<script lang="ts">
  import { character, computedAttacks } from '../../stores/character';
  import { Ability, ProficiencyRank } from '../../types/constants';
  import { signedNumber, generateId } from '../../utils/format';
  import ProficiencySelector from './shared/ProficiencySelector.svelte';
  import NumberInput from './shared/NumberInput.svelte';
  import AbilitySelect from './shared/AbilitySelect.svelte';

  function addAttack() {
    $character.attacks = [
      ...$character.attacks,
      {
        id: generateId(),
        name: '',
        actions: '1',
        ability: Ability.STR,
        proficiency: ProficiencyRank.Trained,
        itemBonus: 0,
        miscBonus: 0,
        damage: '',
        traits: '',
      },
    ];
  }

  function removeAttack(id: string) {
    $character.attacks = $character.attacks.filter((a) => a.id !== id);
  }
</script>

<div class="attacks-section">
  {#each $character.attacks as attack, i (attack.id)}
    {@const computed = $computedAttacks[i]}
    <div class="attack-entry">
      <div class="attack-row">
        <div class="field grow">
          {#if i === 0}<span class="column-header">Name</span>{/if}
          <input type="text" bind:value={attack.name} placeholder="Attack name" />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Act</span>{/if}
          <input
            type="text"
            bind:value={attack.actions}
            placeholder="1"
            class="actions-input"
          />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Ability</span>{/if}
          <AbilitySelect bind:value={attack.ability} />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Prof</span>{/if}
          <ProficiencySelector bind:value={attack.proficiency} />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Item</span>{/if}
          <NumberInput bind:value={attack.itemBonus} width="50px" min={0} />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Misc</span>{/if}
          <NumberInput bind:value={attack.miscBonus} width="50px" />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Total</span>{/if}
          <div class="computed-value">{signedNumber(computed?.totalBonus ?? 0)}</div>
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">Damage</span>{/if}
          <input
            type="text"
            bind:value={attack.damage}
            placeholder="1d8+4"
            class="damage-input"
          />
        </div>
        <div class="field grow">
          {#if i === 0}<span class="column-header">Traits</span>{/if}
          <input type="text" bind:value={attack.traits} placeholder="Traits" />
        </div>
        <div class="field">
          {#if i === 0}<span class="column-header">&nbsp;</span>{/if}
          <button type="button" class="remove-btn" on:click={() => removeAttack(attack.id)}>
            &times;
          </button>
        </div>
      </div>
    </div>
  {/each}

  <button type="button" class="add-btn" on:click={addAttack}>+ Add Attack</button>
</div>

<style>
  .attacks-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .attack-entry {
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--color-border);
  }

  .attack-entry:last-of-type {
    border-bottom: none;
  }

  .attack-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-end;
    flex-wrap: wrap;
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
    min-width: 100px;
  }

  .grow input {
    width: 100%;
  }

  .actions-input {
    width: 50px;
    text-align: center;
  }

  .damage-input {
    width: 100px;
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
