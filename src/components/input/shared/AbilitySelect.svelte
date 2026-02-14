<script lang="ts">
  import { Ability } from '../../../types/constants';

  export let value: Ability = Ability.STR;
  export let label: string = '';

  const abilities = Object.values(Ability);
</script>

<div class="field">
  {#if label}
    <label>{label}</label>
  {/if}
  <select bind:value>
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
