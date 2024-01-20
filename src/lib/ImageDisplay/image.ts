
export type PixelData = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Float32Array;

export type ImageBuffer = {
    pixels: PixelData;
    width: number;
    height: number;
    channels: number;
}