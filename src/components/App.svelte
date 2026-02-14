<script lang="ts">
  import '../styles/global.css';
  import '../styles/sheet.css';
  import '../styles/print.css';
  import InputPanel from './input/InputPanel.svelte';
  import PreviewPanel from './preview/PreviewPanel.svelte';
  import { character } from '../stores/character';
  import { exportCharacter, importCharacter, resetCharacter } from '../stores/persistence';

  let fileInput: HTMLInputElement;

  function handleExport() {
    exportCharacter($character);
  }

  async function handleImport() {
    fileInput.click();
  }

  async function handleFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      await importCharacter(file);
    } catch (err) {
      alert((err as Error).message);
    }
    input.value = '';
  }

  function handleNew() {
    if (confirm('Create a new character? Unsaved changes will be lost.')) {
      resetCharacter();
    }
  }
</script>

<div class="app">
  <header class="toolbar" data-print-hide>
    <h1>PF2e Character Sheet</h1>
    <div class="toolbar-actions">
      <button on:click={handleNew} class="secondary">New</button>
      <button on:click={handleExport} class="secondary">Export JSON</button>
      <button on:click={handleImport} class="secondary">Import JSON</button>
      <input
        type="file"
        accept=".json"
        bind:this={fileInput}
        on:change={handleFileSelected}
        hidden
      />
    </div>
  </header>
  <div class="panels">
    <div class="panel-left" data-print-hide>
      <InputPanel />
    </div>
    <div class="panel-right">
      <PreviewPanel />
    </div>
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--color-primary);
    color: white;
    flex-shrink: 0;
  }

  .toolbar h1 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .toolbar-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .toolbar-actions button {
    color: white;
    border-color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
    padding: 4px 10px;
  }

  .toolbar-actions button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .panels {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .panel-left {
    flex: 0 0 45%;
    max-width: 720px;
    overflow-y: auto;
    border-right: 1px solid var(--color-border);
  }

  .panel-right {
    flex: 1;
    overflow-y: auto;
    background: #e8e8e8;
  }

  @media (max-width: 1024px) {
    .panels {
      flex-direction: column;
    }
    .panel-left {
      flex: none;
      max-width: none;
      border-right: none;
      border-bottom: 1px solid var(--color-border);
    }
    .panel-right {
      flex: 1;
    }
  }
</style>
