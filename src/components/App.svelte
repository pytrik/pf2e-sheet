<script lang="ts">
  import '../styles/global.css';
  import '../styles/sheet.css';
  import '../styles/print.css';
  import InputPanel from './input/InputPanel.svelte';
  import PreviewPanel from './preview/PreviewPanel.svelte';
  import { character, renderMode } from '../stores/character';
  import { exportCharacter, importCharacter, resetCharacter, compressCharacter } from '../stores/persistence';

  let fileInput: HTMLInputElement;
  let helpDialog: HTMLDialogElement;
  let shareLabel = 'Share';
  let shortLinkLabel = 'Short Link';

  // Custom dialog state
  let confirmDialog: HTMLDialogElement;
  let confirmMessage = '';
  let confirmResolve: ((value: boolean) => void) | null = null;

  let alertDialog: HTMLDialogElement;
  let alertMessage = '';

  function showConfirm(message: string): Promise<boolean> {
    confirmMessage = message;
    return new Promise((resolve) => {
      confirmResolve = resolve;
      confirmDialog.showModal();
    });
  }

  function closeConfirm(result: boolean) {
    confirmResolve?.(result);
    confirmResolve = null;
    confirmDialog.close();
  }

  function showAlert(message: string) {
    alertMessage = message;
    alertDialog.showModal();
  }

  async function handleShare() {
    if (!isPublicUrl()) {
      showAlert('Share links can only be created when the app is hosted on a public URL. The current address (local file or local network) would not be reachable by others.');
      return;
    }
    try {
      const compressed = await compressCharacter($character);
      const url = `${window.location.origin}${window.location.pathname}#char=${compressed}`;
      await navigator.clipboard.writeText(url);
      shareLabel = 'Copied!';
      setTimeout(() => { shareLabel = 'Share'; }, 2000);
    } catch {
      showAlert('Failed to copy share link to clipboard.');
    }
  }

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
      showAlert((err as Error).message);
    }
    input.value = '';
  }

  function isPublicUrl(): boolean {
    const { protocol, hostname } = window.location;
    if (protocol === 'file:') return false;
    if (hostname === 'localhost' || hostname === '[::1]') return false;
    if (hostname.endsWith('.local') || hostname.endsWith('.localhost')) return false;
    // IPv4 private ranges: 10.x, 172.16-31.x, 192.168.x, 127.x
    if (/^(10|127)\.\d+\.\d+\.\d+$/.test(hostname)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname)) return false;
    if (/^192\.168\.\d+\.\d+$/.test(hostname)) return false;
    return true;
  }

  async function handleShortLink() {
    if (!isPublicUrl()) {
      showAlert('Short links can only be created when the app is hosted on a public URL. The current address (local file or local network) would not be reachable by others.');
      return;
    }

    const agreed = await showConfirm(
      'This will send your full character sheet URL to an external service (short.io) to generate a short link.\n\n' +
      'All character data encoded in the URL will be shared with this third-party service. ' +
      'The developer of this app takes no responsibility for how that data is handled, ' +
      'nor can continued availability of the short link be guaranteed.'
    );
    if (!agreed) return;

    shortLinkLabel = 'Shortening...';
    try {
      const compressed = await compressCharacter($character);
      const fullUrl = `${window.location.origin}${window.location.pathname}#char=${compressed}`;

      const res = await fetch('https://api.short.io/links/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'pk_XnroPARqBwaqr2Mb',
        },
        body: JSON.stringify({
          domain: 'pf2esheet.short.gy',
          originalURL: fullUrl,
        }),
      });

      if (!res.ok) throw new Error(`Short.io returned ${res.status}`);
      const data = await res.json();
      await navigator.clipboard.writeText(data.shortURL);
      shortLinkLabel = 'Copied!';
      setTimeout(() => { shortLinkLabel = 'Short Link'; }, 2000);
    } catch {
      shortLinkLabel = 'Short Link';
      showAlert('Failed to create short link.');
    }
  }

  async function handleNew() {
    if (await showConfirm('Create a new character? Unsaved changes will be lost.')) {
      resetCharacter();
    }
  }
</script>

<div class="app">
  <header class="toolbar" data-print-hide>
    <h1>PF2e Character Sheet <span class="version">v1.6.0</span> <a href="https://github.com/pytrik/pf2e-sheet" target="_blank" class="title-link">GitHub</a></h1>
    <div class="toolbar-actions">
      <button on:click={handleNew} class="secondary"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg> New</button>
      <button on:click={handleExport} class="secondary"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export</button>
      <button on:click={handleImport} class="secondary"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Import</button>
      <button on:click={handleShare} class="secondary"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> {shareLabel}</button>
      <button on:click={handleShortLink} class="secondary"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> {shortLinkLabel}</button>
      <button on:click={() => $renderMode = $renderMode === 'standard' ? 'dense' : $renderMode === 'dense' ? 'mobile' : 'standard'} class="secondary">{$renderMode === 'standard' ? 'Standard' : $renderMode === 'dense' ? 'Dense' : 'Mobile'}</button>
      <button on:click={() => window.print()} class="secondary"><svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print</button>
      <input
        type="file"
        accept=".json"
        bind:this={fileInput}
        on:change={handleFileSelected}
        hidden
      />
      <button on:click={() => helpDialog.showModal()} class="secondary"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></button>
    </div>
  </header>

  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <dialog bind:this={helpDialog} class="help-dialog" on:click|self={() => helpDialog.close()}>
    <h2>PF2e Character Sheet</h2>
    <p>Fill in the form on the left — the sheet preview on the right updates live.</p>
    <ul>
      <li>Stats, saves, skills, and attack bonuses are <strong>auto-calculated</strong> from ability modifiers and proficiency.</li>
      <li>Your character is <strong>auto-saved</strong> in the browser. Use Export/Import to back up or transfer as JSON.</li>
      <li>Click <strong>Share</strong> to copy a link that contains your character — anyone who opens it will see your sheet, no file transfer needed.</li>
      <li><strong>Short Link</strong> creates a shorter URL via an external service (short.io). Note: your full character data will be sent to this third-party service. The developer takes no responsibility for how that data is handled, and continued availability of short links cannot be guaranteed.</li>
      <li>Toggle between <strong>Standard</strong> (spacious, two-page), <strong>Dense</strong> (compact, two-column), and <strong>Mobile</strong> (compact, single-column, full-width) sheet layouts. Mobile auto-activates on narrow screens.</li>
      <li>Press <strong>Ctrl+P</strong> (or the Print button) to print — only the sheet pages are printed.</li>
    </ul>
    <button on:click={() => helpDialog.close()}>Close</button>
  </dialog>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <dialog bind:this={confirmDialog} class="app-dialog" on:click|self={() => closeConfirm(false)}>
    <p class="dialog-message">{confirmMessage}</p>
    <div class="dialog-actions">
      <button class="secondary" on:click={() => closeConfirm(false)}>Cancel</button>
      <button on:click={() => closeConfirm(true)}>Continue</button>
    </div>
  </dialog>

  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <dialog bind:this={alertDialog} class="app-dialog" on:click|self={() => alertDialog.close()}>
    <p class="dialog-message">{alertMessage}</p>
    <div class="dialog-actions">
      <button on:click={() => alertDialog.close()}>OK</button>
    </div>
  </dialog>

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
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .toolbar-actions button :global(svg) {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex-shrink: 0;
  }

  .toolbar-actions button:hover {
    background: rgba(255, 255, 255, 0.15);
  }


  .version {
    font-size: 0.7rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 4px;
  }

  .title-link {
    font-size: 0.7rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    margin-left: 6px;
  }

  .title-link:hover {
    color: white;
  }

  .help-dialog {
    max-width: 460px;
    margin: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: var(--spacing-lg);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .help-dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  .help-dialog h2 {
    font-size: 1.1rem;
    margin: 0 0 var(--spacing-sm);
  }

  .help-dialog p {
    margin: 0 0 var(--spacing-sm);
  }

  .help-dialog ul {
    margin: 0 0 var(--spacing-md);
    padding-left: 1.2em;
  }

  .help-dialog li {
    margin-bottom: var(--spacing-xs);
  }

  .help-dialog button {
    float: right;
  }

  .app-dialog {
    max-width: 420px;
    margin: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: var(--spacing-lg);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .app-dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  .dialog-message {
    margin: 0 0 var(--spacing-md);
    white-space: pre-line;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
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
    .toolbar {
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }
    .toolbar-actions {
      flex-wrap: wrap;
    }
    .panels {
      flex-direction: column;
      overflow: auto;
    }
    .panel-left {
      flex: none;
      max-width: none;
      border-right: none;
      border-top: 1px solid var(--color-border);
      order: 2;
    }
    .panel-right {
      flex: none;
      order: 1;
    }
  }
</style>
