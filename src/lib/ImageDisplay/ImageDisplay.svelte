<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { DrawContext } from './DrawContext';

	let canvas: HTMLCanvasElement;
	let gl: WebGL2RenderingContext | null;
	let drawContext: DrawContext;

	onMount(() => {
		gl = canvas.getContext('webgl2');
		if (!gl) {
			console.error('WebGL2 is not supported - please check browser compatibility');
			alert('WebGL2 is not supported - please check browser compatibility.');
			return;
		}
		if (!gl.getExtension('EXT_color_buffer_float')) {
			console.error('Floating point textures are not supported on this system');
			alert('Floating point textures are not supported on this system.');
			return;
		}
		drawContext = new DrawContext(gl);

		drawContext.draw();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	});

	onDestroy(() => {
		drawContext.cleanup();
	});
</script>

<canvas bind:this={canvas}></canvas>
