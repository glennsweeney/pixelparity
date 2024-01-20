<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { DrawContext } from './DrawContext';
	import type { ImageBuffer } from './image';

	export let imageBuffer: ImageBuffer | null;

	let canvas: HTMLCanvasElement;
	let gl: WebGL2RenderingContext | null;
	let drawContext: DrawContext;
	let canvasResizeObserver: ResizeObserver;

	$: if (drawContext && imageBuffer) {
		drawContext.loadImage(imageBuffer);
		drawContext.draw();
	}

	function resizeCanvas() {
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		if (drawContext) {
			drawContext.draw();
		}
	}

	function handleWheel(event: WheelEvent) {
		// Get mouse location relative to the canvas
		const mouseX = event.offsetX;
		const mouseY = event.offsetY;

		console.log(`Mouse location: (${mouseX}, ${mouseY})`);
		console.log(`Mouse wheel delta: ${event.deltaY}`);
	}

	onMount(() => {
		// Set up the canvas
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

		// Attach a resizeObserver so we can adjust canvas size to match its offsetWidth and offsetHeight to avoid pixelation
		canvasResizeObserver = new ResizeObserver((entries) => {
			for (let entry of entries) {
				if (entry.target === canvas) {
					resizeCanvas();
				}
			}
		});

		canvasResizeObserver.observe(canvas);

		resizeCanvas();
		drawContext.draw();
	});

	onDestroy(() => {
		if (drawContext) {
			drawContext.cleanup();
		}
		if (canvasResizeObserver) {
			canvasResizeObserver.unobserve(canvas);
		}
	});
</script>

<canvas bind:this={canvas} on:wheel={handleWheel}></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
