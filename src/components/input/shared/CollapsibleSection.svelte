<script lang="ts">
  export let title: string;
  export let open = true;
</script>

<section class="collapsible">
  <button type="button" class="section-header" on:click={() => (open = !open)}>
    <span class="chevron" class:open>{@html '&#9654;'}</span>
    <h3>{title}</h3>
  </button>
  {#if open}
    <div class="section-content">
      <slot />
    </div>
  {/if}
</section>

<style>
  .collapsible {
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    margin-bottom: var(--spacing-sm);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: none;
    color: var(--color-primary);
    border: none;
    border-radius: var(--radius);
    text-align: left;
    cursor: pointer;
  }

  .section-header:hover {
    background: var(--color-hover);
  }

  h3 {
    font-size: 0.9rem;
    margin: 0;
  }

  .chevron {
    font-size: 0.65rem;
    transition: transform 0.15s;
    display: inline-block;
  }

  .chevron.open {
    transform: rotate(90deg);
  }

  .section-content {
    padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
  }
</style>
