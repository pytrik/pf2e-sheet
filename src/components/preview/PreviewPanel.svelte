<script lang="ts">
  import SheetPage1 from './SheetPage1.svelte';
  import SheetPage2 from './SheetPage2.svelte';

  /** The A4 width in px at 96 dpi (210 mm). */
  const A4_WIDTH_PX = 794;

  /** Horizontal padding (px) so the sheet never touches the edges. */
  const PADDING = 32;

  let containerWidth = 0;

  $: scale = Math.min(1, (containerWidth - PADDING * 2) / A4_WIDTH_PX);
</script>

<div class="preview-panel" data-preview-panel bind:clientWidth={containerWidth}>
  <div
    class="sheet-scale-wrapper"
    data-scale-wrapper
    style="transform: scale({scale}); transform-origin: top left; width: {A4_WIDTH_PX}px;"
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
</style>
