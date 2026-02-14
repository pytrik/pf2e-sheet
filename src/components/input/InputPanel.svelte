<script lang="ts">
  import CollapsibleSection from './shared/CollapsibleSection.svelte';
  import IdentitySection from './IdentitySection.svelte';
  import AbilityScores from './AbilityScores.svelte';
  import DefenseSection from './DefenseSection.svelte';
  import PerceptionSection from './PerceptionSection.svelte';
  import ClassDCSection from './ClassDCSection.svelte';
  import SkillsSection from './SkillsSection.svelte';
  import LanguagesSection from './LanguagesSection.svelte';
  import AttacksSection from './AttacksSection.svelte';
  import AbilitiesSection from './AbilitiesSection.svelte';
  import SpellsSection from './SpellsSection.svelte';
</script>

<div class="input-panel">
  <CollapsibleSection title="Identity">
    <IdentitySection />
  </CollapsibleSection>

  <CollapsibleSection title="Ability Scores">
    <AbilityScores />
  </CollapsibleSection>

  <CollapsibleSection title="Defense & HP">
    <DefenseSection />
  </CollapsibleSection>

  <CollapsibleSection title="Perception">
    <PerceptionSection />
  </CollapsibleSection>

  <CollapsibleSection title="Class DC">
    <ClassDCSection />
  </CollapsibleSection>

  <CollapsibleSection title="Skills">
    <SkillsSection />
  </CollapsibleSection>

  <CollapsibleSection title="Languages">
    <LanguagesSection />
  </CollapsibleSection>

  <CollapsibleSection title="Attacks">
    <AttacksSection />
  </CollapsibleSection>

  <CollapsibleSection title="Abilities & Feats">
    <AbilitiesSection />
  </CollapsibleSection>

  <CollapsibleSection title="Spellcasting">
    <SpellsSection />
  </CollapsibleSection>
</div>

<style>
  .input-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    max-width: 720px;
  }
</style>
