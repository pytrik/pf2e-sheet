<script lang="ts">
  import { character, computedSpellDC, computedSpellAttack } from '../../stores/character';
  import { SPELL_LEVELS, SPELL_LEVEL_LABELS, type SpellLevel } from '../../types/constants';
  import { signedNumber, generateId } from '../../utils/format';
  import ProficiencySelector from './shared/ProficiencySelector.svelte';
  import NumberInput from './shared/NumberInput.svelte';
  import AbilitySelect from './shared/AbilitySelect.svelte';
  import CollapsibleSection from './shared/CollapsibleSection.svelte';

  function addSpell(level: SpellLevel) {
    $character.spellcasting.spellLevels[level].spells = [
      ...$character.spellcasting.spellLevels[level].spells,
      {
        id: generateId(),
        name: '',
        actions: '',
        description: '',
      },
    ];
    $character = $character;
  }

  function removeSpell(level: SpellLevel, id: string) {
    $character.spellcasting.spellLevels[level].spells =
      $character.spellcasting.spellLevels[level].spells.filter((s) => s.id !== id);
    $character = $character;
  }
</script>

<div class="spells-section">
  <!-- Spellcasting Config -->
  <div class="spellcasting-config">
    <h4>Spellcasting</h4>
    <div class="config-row">
      <div class="field">
        <label for="spell-tradition">Tradition</label>
        <input
          id="spell-tradition"
          type="text"
          bind:value={$character.spellcasting.tradition}
          placeholder="Arcane, Divine..."
          class="tradition-input"
        />
      </div>
      <AbilitySelect label="Ability" bind:value={$character.spellcasting.ability} />
      <div class="field">
        <span class="column-header">Proficiency</span>
        <ProficiencySelector bind:value={$character.spellcasting.proficiency} />
      </div>
      <NumberInput label="Misc" bind:value={$character.spellcasting.miscBonus} width="50px" />
      <div class="field">
        <span class="column-header">Spell DC</span>
        <div class="computed-value">{$computedSpellDC}</div>
      </div>
      <div class="field">
        <span class="column-header">Spell Attack</span>
        <div class="computed-value">{signedNumber($computedSpellAttack)}</div>
      </div>
    </div>
  </div>

  <!-- Spell Levels -->
  <div class="spell-levels">
    {#each SPELL_LEVELS as level (level)}
      <CollapsibleSection title={SPELL_LEVEL_LABELS[level]} open={level === 0}>
        <div class="spell-level-content">
          {#if level > 0}
            <div class="slots-row">
              <NumberInput
                label="Slots"
                bind:value={$character.spellcasting.spellLevels[level].slots}
                min={0}
                width="50px"
              />
            </div>
          {/if}

          <div class="spell-list">
            {#each $character.spellcasting.spellLevels[level].spells as spell, i (spell.id)}
              <div class="spell-entry">
                <div class="spell-row">
                  <div class="field grow">
                    {#if i === 0}<span class="column-header">Name</span>{/if}
                    <input type="text" bind:value={spell.name} placeholder="Spell name" />
                  </div>
                  <div class="field">
                    {#if i === 0}<span class="column-header">Act</span>{/if}
                    <input
                      type="text"
                      bind:value={spell.actions}
                      placeholder="2"
                      class="actions-input"
                    />
                  </div>
                  <div class="field">
                    {#if i === 0}<span class="column-header">&nbsp;</span>{/if}
                    <button
                      type="button"
                      class="remove-btn"
                      on:click={() => removeSpell(level, spell.id)}
                    >
                      &times;
                    </button>
                  </div>
                </div>
                <div class="description-row">
                  <textarea
                    bind:value={spell.description}
                    placeholder="Description..."
                    rows="2"
                  ></textarea>
                </div>
              </div>
            {/each}
          </div>

          <button type="button" class="add-btn" on:click={() => addSpell(level)}>
            + Add Spell
          </button>
        </div>
      </CollapsibleSection>
    {/each}
  </div>
</div>

<style>
  .spells-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .spellcasting-config {
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

  .config-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .tradition-input {
    width: 130px;
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

  .computed-value {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--color-primary);
    font-family: var(--font-mono);
    min-width: 40px;
    text-align: center;
    padding: 4px 0;
  }

  .spell-levels {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .spell-level-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .slots-row {
    margin-bottom: var(--spacing-xs);
  }

  .spell-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .spell-entry {
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--color-border);
  }

  .spell-entry:last-child {
    border-bottom: none;
  }

  .spell-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .grow {
    flex: 1;
    min-width: 120px;
  }

  .grow input {
    width: 100%;
  }

  .actions-input {
    width: 50px;
    text-align: center;
  }

  .description-row {
    margin-top: var(--spacing-xs);
  }

  .description-row textarea {
    width: 100%;
    resize: vertical;
    font-size: 0.85rem;
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
