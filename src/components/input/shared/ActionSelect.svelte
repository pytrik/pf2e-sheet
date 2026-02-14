<script lang="ts">
  export let value: string = '';

  const options: { value: string; label: string }[] = [
    { value: '', label: '\u2014' },
    { value: '1', label: '\u25C6' },
    { value: '2', label: '\u25C6\u25C6' },
    { value: '3', label: '\u25C6\u25C6\u25C6' },
    { value: 'free', label: '\u25C7' },
    { value: 'reaction', label: '\u21BA' },
  ];
</script>

<select bind:value class="action-select">
  {#each options as opt}
    <option value={opt.value}>{opt.label}</option>
  {/each}
</select>

<style>
  .action-select {
    width: 60px;
    text-align: center;
  }
</style>
