<script lang="ts">
  import { character, computedAC, computedFortitude, computedReflex, computedWill, computedHP } from '../../stores/character';
  import { signedNumber } from '../../utils/format';
  import ProficiencySelector from './shared/ProficiencySelector.svelte';
  import NumberInput from './shared/NumberInput.svelte';

  let hasDexCap = $character.armorClass.dexCap !== null;

  function toggleDexCap() {
    hasDexCap = !hasDexCap;
    if (hasDexCap) {
      $character.armorClass.dexCap = 0;
    } else {
      $character.armorClass.dexCap = null;
    }
    $character = $character;
  }

  function updateDexCap(e: Event) {
    const target = e.target as HTMLInputElement;
    $character.armorClass.dexCap = Number(target.value);
    $character = $character;
  }
</script>

<div class="defense-section">
  <!-- Armor Class -->
  <div class="subsection">
    <h4>Armor Class</h4>
    <div class="row">
      <ProficiencySelector bind:value={$character.armorClass.proficiency} />
      <div class="field">
        <label>
          <input type="checkbox" checked={hasDexCap} on:change={toggleDexCap} />
          Dex Cap
        </label>
        {#if hasDexCap}
          <input
            type="number"
            value={$character.armorClass.dexCap}
            on:input={updateDexCap}
            min={0}
            style="width: 60px"
          />
        {/if}
      </div>
      <NumberInput label="Item" bind:value={$character.armorClass.itemBonus} min={0} />
      <NumberInput label="Misc" bind:value={$character.armorClass.miscBonus} />
      <div class="computed-value">{$computedAC}</div>
    </div>
  </div>

  <!-- Saving Throws -->
  <div class="subsection">
    <h4>Saving Throws</h4>
    <div class="save-row">
      <span class="save-label">Fortitude</span>
      <ProficiencySelector bind:value={$character.savingThrows.fortitude.proficiency} />
      <NumberInput label="Misc" bind:value={$character.savingThrows.fortitude.miscBonus} />
      <div class="computed-value">{signedNumber($computedFortitude)}</div>
    </div>
    <div class="save-row">
      <span class="save-label">Reflex</span>
      <ProficiencySelector bind:value={$character.savingThrows.reflex.proficiency} />
      <NumberInput label="Misc" bind:value={$character.savingThrows.reflex.miscBonus} />
      <div class="computed-value">{signedNumber($computedReflex)}</div>
    </div>
    <div class="save-row">
      <span class="save-label">Will</span>
      <ProficiencySelector bind:value={$character.savingThrows.will.proficiency} />
      <NumberInput label="Misc" bind:value={$character.savingThrows.will.miscBonus} />
      <div class="computed-value">{signedNumber($computedWill)}</div>
    </div>
  </div>

  <!-- HP -->
  <div class="subsection">
    <h4>Hit Points</h4>
    <div class="row">
      <NumberInput label="Ancestry HP" bind:value={$character.hp.ancestryBonus} min={0} />
      <NumberInput label="Class HP/Lvl" bind:value={$character.hp.classBonus} min={0} />
      <NumberInput label="Misc" bind:value={$character.hp.miscBonus} />
      <div class="computed-value">{$computedHP} HP</div>
    </div>
  </div>

  <!-- Speed -->
  <div class="subsection">
    <h4>Speed</h4>
    <div class="row">
      <NumberInput label="Speed (ft)" bind:value={$character.speed} min={0} width="70px" />
    </div>
  </div>
</div>

<style>
  .defense-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .subsection {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  h4 {
    font-size: 0.85rem;
    color: var(--color-primary);
    margin: 0;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--spacing-xs);
  }

  .row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .save-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
    padding: var(--spacing-xs) 0;
  }

  .save-label {
    font-weight: 600;
    font-size: 0.85rem;
    min-width: 80px;
  }

  .field {
    display: flex;
    flex-direction: column;
  }

  .field label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
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
