import { shaderProgramSources } from './shaders/shaders';
import type { ImageBuffer } from './image';

/**
 * Represents a WebGL2 context.
 */
export class GLContext {
	/**
	 * The WebGL2 rendering context.
	 */
	private gl: WebGL2RenderingContext;

	/**
	 * GPU Buffer for the vertex and texture coordinates of the render quad.
	 */
	private quadBuffer: WebGLBuffer;

	private shaderPrograms: { [key: string]: WebGLProgram };

	private imageTexture: WebGLTexture | null = null;

	/**
	 * Constructs a GLContext object from the given WebGL2 rendering context.
	 * Initializes appropriate buffers, shaders, and textures necessary for image rendering.
	 * @param gl The WebGL2 rendering context.
	 */
	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
		this.quadBuffer = initBuffer(this.gl);
		this.shaderPrograms = initShaderPrograms(this.gl);
	}

	/**
	 * Cleans up the WebGL context by deleting all allocated resources.
	 */
	public cleanup(): void {
		// Clean up texture
		if (this.imageTexture) {
			this.gl.deleteTexture(this.imageTexture);
		}
		// Clean up shaders
		for (const program of Object.values(this.shaderPrograms)) {
			this.gl.deleteProgram(program);
		}
		// Clean up buffer
		this.gl.deleteBuffer(this.quadBuffer);
	}

	public loadImage(image: ImageBuffer): void {
		if (this.imageTexture) {
			this.gl.deleteTexture(this.imageTexture);
		}
		this.imageTexture = initTextureForImage(this.gl, image);
	}
}

/**
 * Initializes a quad buffer for image rendering.
 *
 * @param gl - The WebGL rendering context.
 * @returns The initialized WebGL buffer containing a single quad with vertex and texture coordinates.
 * @throws Error if the buffer creation or population fails.
 */
function initBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
	const quadBuffer = gl.createBuffer();
	if (!quadBuffer || checkError(gl)) {
		throw new Error('Failed to create buffer.');
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);

	// VertexX, VertexY, TexCoordX, TexCoordY
	// prettier-ignore
	const coordinates = [
        1.0,  1.0, 1.0, 0.0,
        -1.0,  1.0, 0.0, 0.0,
        1.0, -1.0, 1.0, 1.0,
        -1.0, -1.0, 0.0, 1.0];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordinates), gl.STATIC_DRAW);
	if (checkError(gl)) {
		throw new Error('Failed to populate buffer data.');
	}

	return quadBuffer;
}

/**
 * Initializes shader programs for WebGL rendering.
 *
 * @param gl - The WebGL2 rendering context.
 * @returns An object containing the initialized shader programs.
 * @throws Error if any shader program fails to initialize.
 */
function initShaderPrograms(gl: WebGL2RenderingContext): { [key: string]: WebGLProgram } {
	const shaderPrograms: { [key: string]: WebGLProgram } = {};
	for (const [programName, programSources] of Object.entries(shaderProgramSources)) {
		const shaderProgram = initShaderProgram(gl, programSources.vertex, programSources.fragment);
		if (!shaderProgram) {
			throw new Error(`Failed to initialize shader program ${programName}`);
		}
		shaderPrograms[programName] = shaderProgram;
	}
	return shaderPrograms;
}

/**
 * Initializes a shader program with the given vertex and fragment shader sources.
 *
 * @param gl - The WebGL2 rendering context.
 * @param vertexShaderSource - The source code of the vertex shader.
 * @param fragmentShaderSource - The source code of the fragment shader.
 * @returns The created shader program, or null if an error occurred.
 */
function initShaderProgram(
	gl: WebGL2RenderingContext,
	vertexShaderSource: string,
	fragmentShaderSource: string
): WebGLProgram | null {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	if (!vertexShader || checkError(gl)) {
		console.log('Failed to create vertex shader.');
		return null;
	}
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	if (!fragmentShader || checkError(gl)) {
		console.log('Failed to create fragment shader.');
		return null;
	}

	const shaderProgram = gl.createProgram();
	if (!shaderProgram || checkError(gl)) {
		console.log('Failed to create shader program.');
		return null;
	}

	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);

	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) || checkError(gl)) {
		console.log('Failed to link the shader program: ', gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

/**
 * Compiles a shader of the specified type with the given source code.
 * @param gl - The WebGL2 rendering context.
 * @param type - The type of the shader to compile (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @param source - The source code of the shader.
 * @returns The compiled shader, or null if compilation fails.
 */
function compileShader(
	gl: WebGL2RenderingContext,
	type: number,
	source: string
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (shader === null) {
		return null;
	}
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) || checkError(gl)) {
		console.error('Failed to compile the shader: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

export function initTextureForImage(
	gl: WebGL2RenderingContext,
	image: ImageBuffer
): WebGLTexture | null {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Check pixel buffer size
	if (image.pixels.length !== image.width * image.height * image.channels) {
		console.error(
			'Invalid pixel count ',
			image.pixels.length,
			' for ',
			image.width,
			'x',
			image.height,
			'x',
			image.channels,
			' image'
		);
		return null;
	}

	// Handle texture type depending on channel count
	let internalFormat: number;
	let format: number;
	switch (image.channels) {
		case 1:
			internalFormat = gl.R32F;
			format = gl.RED;
			break;

		case 3:
			internalFormat = gl.RGB32F;
			format = gl.RGB;
			break;

		case 4:
			internalFormat = gl.RGBA32F;
			format = gl.RGBA;
			break;

		default:
			console.error('unsupported number of channels: ', image.channels);
			return null;
	}

	// Convert to float, required by this table:
	// https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
	const textureBuffer = new Float32Array(image.pixels.length);
	for (let i = 0; i < image.pixels.length; i++) {
		textureBuffer[i] = image.pixels[i];
	}

	// Create the texture
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		internalFormat,
		image.width,
		image.height,
		0,
		format,
		gl.FLOAT,
		textureBuffer
	);
	if (checkError(gl)) {
		console.error('Failed to load image texture.');
		return null;
	}

	// No mipmapping, clamp to edge, nearest neighbor interpolation
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	if (checkError(gl)) {
		console.error('Failed to set texture parameters.');
		return null;
	}

	return texture;
}

/**
 * Converts WebGL error codes into human-readable error messages.
 * @param gl The WebGL2 rendering context.
 * @param error The error code.
 * @returns A string representing the error message.
 */
function getWebGLErrorString(gl: WebGL2RenderingContext, error: number): string {
	switch (error) {
		case gl.NO_ERROR:
			return 'No error';
		case gl.INVALID_ENUM:
			return 'Invalid enum';
		case gl.INVALID_VALUE:
			return 'Invalid value';
		case gl.INVALID_OPERATION:
			return 'Invalid operation';
		case gl.OUT_OF_MEMORY:
			return 'Out of memory';
		case gl.INVALID_FRAMEBUFFER_OPERATION:
			return 'Invalid framebuffer operation';
		case gl.CONTEXT_LOST_WEBGL:
			return 'Context lost';
		default:
			return `Unknown error code ${error}`;
	}
}

/**
 * Checks for WebGL errors and logs the error message if an error is found.
 * @param gl The WebGL2 rendering context.
 * @returns True if an error is found, false otherwise.
 */
function checkError(gl: WebGL2RenderingContext): boolean {
	const error = gl.getError();
	if (error !== gl.NO_ERROR) {
		console.error('WebGL Error: ', getWebGLErrorString(gl, error), ' (', error, ')');
	}
	return error !== gl.NO_ERROR;
}
