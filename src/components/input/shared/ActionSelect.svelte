<script lang="ts">
  export let value: string = '';
  export let ariaLabel: string = 'Actions';

  const options: { value: string; label: string; name: string }[] = [
    { value: '', label: '\u2014', name: 'None' },
    { value: '1', label: '\u25C6', name: 'One action' },
    { value: '2', label: '\u25C6\u25C6', name: 'Two actions' },
    { value: '3', label: '\u25C6\u25C6\u25C6', name: 'Three actions' },
    { value: 'free', label: '\u25C7', name: 'Free action' },
    { value: 'reaction', label: '\u21BA', name: 'Reaction' },
  ];
</script>

<select bind:value class="action-select" aria-label={ariaLabel}>
  {#each options as opt}
    <option value={opt.value} aria-label={opt.name}>{opt.label}</option>
  {/each}
</select>

<style>
  .action-select {
    width: 60px;
    text-align: center;
  }
</style>
