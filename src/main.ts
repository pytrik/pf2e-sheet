import App from './components/App.svelte';
import { loadCharacter, loadCharacterFromHash, initAutoSave } from './stores/persistence';
import { renderMode } from './stores/character';
import type { RenderMode } from './stores/character';

const params = new URLSearchParams(window.location.search);
const modeParam = params.get('mode');
if (modeParam === 'dense') {
  renderMode.set(modeParam as RenderMode);
}

renderMode.subscribe((mode) => {
  const url = new URL(window.location.href);
  if (mode === 'standard') {
    url.searchParams.delete('mode');
  } else {
    url.searchParams.set('mode', mode);
  }
  history.replaceState(null, '', url.toString());
});

loadCharacter();
loadCharacterFromHash().then(() => {
  initAutoSave();
});

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
