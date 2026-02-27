<script lang="ts">
  import { ProficiencyRank, PROFICIENCY_LABELS } from '../../../types/constants';

  export let value: ProficiencyRank = ProficiencyRank.Untrained;

  const ranks = [
    ProficiencyRank.Untrained,
    ProficiencyRank.Trained,
    ProficiencyRank.Expert,
    ProficiencyRank.Master,
    ProficiencyRank.Legendary,
  ];
</script>

<div class="prof-selector" role="radiogroup">
  {#each ranks as rank}
    <button
      type="button"
      class="prof-btn"
      class:active={value === rank}
      role="radio"
      aria-checked={value === rank}
      aria-label={PROFICIENCY_LABELS[rank]}
      on:click={() => (value = rank)}
    >
      {PROFICIENCY_LABELS[rank]}
    </button>
  {/each}
</div>

<style>
  .prof-selector {
    display: inline-flex;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
    height: var(--input-height, 28px);
  }

  .prof-btn {
    padding: 4px 7px;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--color-input-bg);
    color: var(--color-text-muted);
    border: none;
    border-radius: 0;
    border-right: 1px solid var(--color-border);
    min-width: 24px;
  }

  .prof-btn:last-child {
    border-right: none;
  }

  .prof-btn:hover {
    background: var(--color-hover);
  }

  .prof-btn.active {
    background: var(--color-primary);
    color: white;
  }
</style>
