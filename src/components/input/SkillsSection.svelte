<script lang="ts">
  import { character, computedSkills } from '../../stores/character';
  import { Ability, ProficiencyRank } from '../../types/constants';
  import { signedNumber } from '../../utils/format';
  import ProficiencySelector from './shared/ProficiencySelector.svelte';
  import NumberInput from './shared/NumberInput.svelte';

  $: standardSkills = $character.skills
    .map((s, i) => ({ ...s, index: i }))
    .filter((s) => !s.isLore);

  $: loreSkills = $character.skills
    .map((s, i) => ({ ...s, index: i }))
    .filter((s) => s.isLore);

  function addLore() {
    $character.skills = [
      ...$character.skills,
      {
        name: '',
        ability: Ability.INT,
        proficiency: ProficiencyRank.Trained,
        miscBonus: 0,
        isLore: true,
      },
    ];
  }

  function removeLore(index: number) {
    $character.skills = $character.skills.filter((_, i) => i !== index);
  }
</script>

<div class="skills-section">
  <div class="skills-list">
    {#each standardSkills as skill (skill.index)}
      <div class="skill-row">
        <span class="skill-name">{skill.name}</span>
        <ProficiencySelector
          bind:value={$character.skills[skill.index].proficiency}
        />
        <NumberInput
          label=""
          bind:value={$character.skills[skill.index].miscBonus}
          width="50px"
        />
        <span class="computed-value">
          {signedNumber($computedSkills[skill.index]?.total ?? 0)}
        </span>
      </div>
    {/each}
  </div>

  <div class="lore-section">
    <div class="lore-header">
      <h4>Lore Skills</h4>
      <button class="small secondary" type="button" on:click={addLore}>+ Add Lore</button>
    </div>
    {#each loreSkills as lore (lore.index)}
      <div class="skill-row">
        <div class="field lore-name">
          <input
            type="text"
            bind:value={$character.skills[lore.index].name}
            placeholder="Lore name"
          />
        </div>
        <ProficiencySelector
          bind:value={$character.skills[lore.index].proficiency}
        />
        <NumberInput
          label=""
          bind:value={$character.skills[lore.index].miscBonus}
          width="50px"
        />
        <span class="computed-value">
          {signedNumber($computedSkills[lore.index]?.total ?? 0)}
        </span>
        <button class="small danger" type="button" on:click={() => removeLore(lore.index)}>
          &times;
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .skills-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .skills-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .skill-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
    padding: var(--spacing-xs) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .skill-row:last-child {
    border-bottom: none;
  }

  .skill-name {
    font-weight: 600;
    font-size: 0.85rem;
    min-width: 100px;
  }

  .lore-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .lore-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--color-border);
  }

  .lore-header h4 {
    font-size: 0.85rem;
    color: var(--color-primary);
    margin: 0;
  }

  .field {
    display: flex;
    flex-direction: column;
  }

  .lore-name {
    min-width: 100px;
  }

  .lore-name input {
    width: 100%;
  }

  .computed-value {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--color-primary);
    font-family: var(--font-mono);
    min-width: 36px;
    text-align: center;
  }
</style>
