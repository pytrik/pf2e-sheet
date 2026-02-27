<script lang="ts">
  import { generateId } from '../../../utils/format';

  export let value: number = 0;
  export let label: string = '';
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let width: string = '60px';

  const inputId = label ? `number-${generateId()}` : '';
</script>

<div class="field">
  {#if label}
    <label for={inputId}>{label}</label>
  {/if}
  <input
    type="number"
    id={inputId || undefined}
    bind:value
    {min}
    {max}
    style="width: {width}"
  />
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
  }
</style>
