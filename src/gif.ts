import { ConvertInputType, validateInput } from "./handleBuffers";
// @ts-expect-error gifenc has no @types
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { getFrames } from "./frames";

/**
 * Configuration for the converter.
 */
export interface convertToGIFInput extends ConvertInputType {
  /**
   * Override the frame delays in the mcmeta file, in milliseconds.
   */
  frameDelayOverride?: number;
  /**
   * The tick rate used to calculate the frame delays. Defaults to Minecraft's default tick rate of 20.
   */
  minecraftTickSpeed?: number;
}

/**
 * Converts a Minecraft sprite sheet (texture + mcmeta) into a GIF.
 *
 * Gifs are good for universal support, but APNGs are supported by the majority of modern browsers and are the recommended format.
 *
 * @param png - The sprite sheet image as a Buffer.
 * @param mcmeta - The .mcmeta JSON file as a Buffer.
 * @param frameDelayOverride - Optional override for the duration of each frame in ms, acts as the base duration and will not override the frametime property in the mcmeta file. (default 1)
 * @param minecraftTickSpeed - Optional tick speed override (default 20).
 *
 * @returns A promise resolving to a ConvertOutputType object containing the exported Buffer.
 * @throws {Error} If dimensions are invalid, frames are missing, or buffer data is corrupted.
 */
export async function convertToGIF({
  png,
  mcmeta,
  frameDelayOverride = 1,
  minecraftTickSpeed = 20,
}: convertToGIFInput): Promise<Buffer> {
  const validatedInput = validateInput({
    png: png,
    mcmeta: mcmeta,
  });

  const { frames, size } = await getFrames({
    png: validatedInput.png,
    mcmetaJson: validatedInput.mcmetaJson,
    frameDelayOverride,
    minecraftTickSpeed,
  });

  const rawFrames = frames.map((frame) => new Uint8Array(frame.buffer));
  const gif = GIFEncoder();
  const allPixels = new Uint8Array(rawFrames.length * rawFrames[0].length);
  rawFrames.forEach((frame, i) => allPixels.set(frame, i * frame.length));
  const palette = quantize(allPixels, 256, { format: "rgba4444" });
  for (const frame of frames) {
    const rawFrame = new Uint8Array(frame.buffer);
    const thisFrameDuration = frame.delay;
    const index = applyPalette(rawFrame, palette, "rgba4444");

    gif.writeFrame(index, size, size, {
      palette,
      delay: thisFrameDuration,
      transparent: true,
      transparentIndex: Math.max(
        0,
        palette.findIndex((p: number[]) => p[3] === 0)
      ),
    });
  }

  gif.finish();

  return Buffer.from(gif.bytes());
}
