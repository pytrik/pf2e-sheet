import { mount } from 'svelte';
import App from './components/App.svelte';
import { loadCharacter, initAutoSave } from './stores/persistence';
import { renderMode } from './stores/character';
import type { RenderMode } from './stores/character';

const params = new URLSearchParams(window.location.search);
const modeParam = params.get('mode');
if (modeParam === 'dense' || modeParam === 'mobile') {
  renderMode.set(modeParam as RenderMode);
} else if (window.innerWidth <= 1024) {
  renderMode.set('mobile');
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

// Shared characters in the URL hash are handled by App, which can ask before
// replacing the saved one.
loadCharacter();
initAutoSave();

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
