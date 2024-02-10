<script lang="ts">
	import { onMount } from 'svelte';
	import ImageDisplay from '$lib/ImageDisplay/ImageDisplay.svelte';
	import type { ImageBuffer } from '$lib/ImageDisplay/image';
	import * as fastpng from 'fast-png';

	let leftBuffer: ImageBuffer;
	let rightBuffer: ImageBuffer;

	let zoom: number = 1.0;

	onMount(async () => {
		const response = await fetch('/default.png');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const buffer = await response.arrayBuffer();

		const png = fastpng.decode(buffer, { checkCrc: true });

		const imageBuffer = {
			pixels: png.data,
			width: png.width,
			height: png.height,
			channels: png.channels
		};

		leftBuffer = imageBuffer;
		rightBuffer = imageBuffer;
	});
</script>

<header>PixelParity</header>

<main>
	<div class="column" id="left-column">
		<ImageDisplay imageBuffer={leftBuffer} bind:zoom />
	</div>
	<div class="center-bar"></div>
	<div class="column" id="right-column">
		<ImageDisplay imageBuffer={rightBuffer} bind:zoom />
	</div>
</main>

<footer></footer>

<style>
	header {
		height: 3rem;
		background-color: #333;
		color: #d0d0d0;
	}

	footer {
		height: 3rem;
		background-color: #333;
	}
	main {
		display: flex;
		height: calc(100vh - 6rem);
	}

	.column {
		flex: 1;
		background-color: #d0d0d0;
		display: block;
	}

	.center-bar {
		width: 5px;
		background-color: #333;
	}
</style>
