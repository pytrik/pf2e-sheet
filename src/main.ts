import App from './components/App.svelte';
import { loadCharacter, initAutoSave } from './stores/persistence';

loadCharacter();
initAutoSave();

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
