<script lang="ts">
  import { Ability } from '../../../types/constants';
  import { generateId } from '../../../utils/format';

  export let value: Ability = Ability.STR;
  export let label: string = '';

  const abilities = Object.values(Ability);
  const selectId = label ? `ability-${generateId()}` : '';
</script>

<div class="field">
  {#if label}
    <label for={selectId}>{label}</label>
  {/if}
  <select id={selectId || undefined} bind:value>
    {#each abilities as ab}
      <option value={ab}>{ab}</option>
    {/each}
  </select>
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
  }

  select {
    width: 70px;
  }
</style>
