<script lang="ts">
  import { ProficiencyRank, PROFICIENCY_LABELS } from '../../../types/constants';

  export let value: ProficiencyRank = ProficiencyRank.Untrained;
  /** Accessible name for the group, e.g. "Fortitude proficiency". */
  export let ariaLabel: string = 'Proficiency';

  const ranks = [
    ProficiencyRank.Untrained,
    ProficiencyRank.Trained,
    ProficiencyRank.Expert,
    ProficiencyRank.Master,
    ProficiencyRank.Legendary,
  ];

  const names: Record<ProficiencyRank, string> = {
    [ProficiencyRank.Untrained]: 'Untrained',
    [ProficiencyRank.Trained]: 'Trained',
    [ProficiencyRank.Expert]: 'Expert',
    [ProficiencyRank.Master]: 'Master',
    [ProficiencyRank.Legendary]: 'Legendary',
  };

  let group: HTMLDivElement;

  // Radio group keyboard pattern: arrows move the selection, one tab stop.
  function handleKeydown(e: KeyboardEvent) {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const idx = Math.max(0, ranks.indexOf(value));
    value = ranks[(idx + step + ranks.length) % ranks.length];
    group.querySelectorAll<HTMLButtonElement>('button')[ranks.indexOf(value)]?.focus();
  }
</script>

<!-- Focus lives on the radio buttons (roving tabindex), not the group itself. -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="prof-selector" role="radiogroup" aria-label={ariaLabel} bind:this={group} on:keydown={handleKeydown}>
  {#each ranks as rank}
    <button
      type="button"
      class="prof-btn"
      class:active={value === rank}
      role="radio"
      aria-checked={value === rank}
      aria-label={names[rank]}
      title={names[rank]}
      tabindex={value === rank ? 0 : -1}
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
