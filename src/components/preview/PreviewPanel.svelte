<script lang="ts">
  import SheetPage1 from './SheetPage1.svelte';
  import SheetPage2 from './SheetPage2.svelte';
  import { renderMode } from '../../stores/character';

  /** The A4 width in px at 96 dpi (210 mm). */
  const A4_WIDTH_PX = 794;

  /** Horizontal padding (px) so the sheet never touches the edges. */
  const PADDING = 32;

  let containerWidth = 0;

  $: scale = Math.min(1, (containerWidth - PADDING * 2) / A4_WIDTH_PX);
</script>

<div class="preview-panel" class:mobile-panel={$renderMode === 'mobile'} data-preview-panel bind:clientWidth={containerWidth}>
  <div
    class="sheet-scale-wrapper"
    class:dense={$renderMode === 'dense'}
    class:mobile={$renderMode === 'mobile'}
    data-scale-wrapper
    style={$renderMode === 'mobile'
      ? 'width: 100%;'
      : `transform: scale(${scale}); transform-origin: top left; width: ${A4_WIDTH_PX}px;`}
  >
    <SheetPage1 />
    <SheetPage2 />
  </div>
</div>

<style>
  .preview-panel {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: #e8e8e8;
    padding: 24px;
    min-width: 0;
  }

  .preview-panel.mobile-panel {
    background: #fff;
    padding: 0;
  }
</style>
