<script lang="ts">
  import { Ability } from '../../types/constants';
  import {
    character,
    computedAC,
    computedFortitude,
    computedReflex,
    computedWill,
    computedHP,
    computedPerception,
    computedClassDC,
    computedSkills,
    computedAttacks,
  } from '../../stores/character';
  import { signedNumber, formatActions } from '../../utils/format';

  const abilityKeys: Ability[] = [
    Ability.STR,
    Ability.DEX,
    Ability.CON,
    Ability.INT,
    Ability.WIS,
    Ability.CHA,
  ];
</script>

<div class="sheet-page">
  <!-- Header -->
  <div class="sheet-header">
    <h1>{$character.name || 'Unnamed Character'}</h1>
    {#if $character.class}
      <span class="identity-detail"><strong>{$character.class}</strong></span>
    {/if}
    <span class="identity-detail">Lvl {$character.level}</span>
    {#if $character.heritage}
      <span class="identity-detail">{$character.heritage}</span>
    {/if}
    {#if $character.background}
      <span class="identity-detail">{$character.background}</span>
    {/if}
  </div>

  <!-- Ability Modifiers -->
  <h2>Ability Modifiers</h2>
  <div class="ability-row">
    {#each abilityKeys as ab}
      <div class="ability-box">
        <div class="ability-label">{ab}</div>
        <div class="ability-value">{signedNumber($character.abilities[ab])}</div>
      </div>
    {/each}
  </div>

  <!-- Defenses -->
  <h2>Defenses</h2>
  <div class="stat-block">
    <div class="stat-item">
      <span class="stat-label">AC</span>
      <span class="stat-value">{$computedAC}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Fort</span>
      <span class="stat-value">{signedNumber($computedFortitude)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Ref</span>
      <span class="stat-value">{signedNumber($computedReflex)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Will</span>
      <span class="stat-value">{signedNumber($computedWill)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">HP</span>
      <span class="stat-value">{$computedHP}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Speed</span>
      <span class="stat-value">{$character.speed} ft.</span>
    </div>
  </div>

  <!-- Perception & Class DC -->
  <h2>Perception &amp; Class DC</h2>
  <div class="stat-block">
    <div class="stat-item">
      <span class="stat-label">Perception</span>
      <span class="stat-value">{signedNumber($computedPerception)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Class DC</span>
      <span class="stat-value">{$computedClassDC}</span>
    </div>
  </div>

  <!-- Skills -->
  <h2>Skills</h2>
  {#if $computedSkills.length > 0}
    <div class="skills-grid">
      {#each $computedSkills as skill}
        <div class="skill-row">
          <span class="skill-name" class:lore={skill.isLore}>{skill.name}</span>
          <span class="skill-value">{signedNumber(skill.total)}</span>
        </div>
      {/each}
    </div>
  {:else}
    <p class="empty-state">No skills configured</p>
  {/if}

  <!-- Attacks -->
  <h2>Attacks</h2>
  {#if $computedAttacks.length > 0}
    <table class="attacks-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Actions</th>
          <th>Attack</th>
          <th>Damage</th>
          <th>Traits</th>
        </tr>
      </thead>
      <tbody>
        {#each $computedAttacks as atk}
          <tr>
            <td>{atk.name}</td>
            <td>{atk.actions ? formatActions(atk.actions) : '--'}</td>
            <td class="attack-bonus">{signedNumber(atk.totalBonus)}</td>
            <td>{atk.damage || '--'}</td>
            <td class="attack-traits">{atk.traits || '--'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="empty-state">No attacks added</p>
  {/if}

  <!-- Languages -->
  <h2>Languages</h2>
  {#if $character.languages.length > 0}
    <p class="languages-list">{$character.languages.join(', ')}</p>
  {:else}
    <p class="empty-state">No languages added</p>
  {/if}

  <!-- Notes -->
  <h2>Notes</h2>
  <p class="notes-line">Current HP: {$computedHP}</p>
</div>
