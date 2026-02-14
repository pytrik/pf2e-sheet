import App from './components/App.svelte';
import { loadCharacter, loadCharacterFromHash, initAutoSave } from './stores/persistence';

loadCharacter();
loadCharacterFromHash().then(() => {
  initAutoSave();
});

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
