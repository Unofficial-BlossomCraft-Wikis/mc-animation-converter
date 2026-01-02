import { ConvertInputType, validateInput } from "./handleBuffers";
import UPNG from "./dep/UPNG.js/UPNG.js";
import { getFrames } from "./frames";

/**
 * Configuration for the converter.
 */
export interface convertToAPNGInput extends ConvertInputType {
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
 * Converts a Minecraft sprite sheet (texture + mcmeta) into an APNG.
 *
 * APNG export is recommended for most use cases, as it is lossless and supports transparency better than GIFs.
 *
 * @param png - The sprite sheet image as a Buffer.
 * @param mcmeta - The .mcmeta JSON file as a Buffer.
 * @param frameDelayOverride - Optional override for the duration of each frame in ms, acts as the base duration and will not override the frametime property in the mcmeta file. (default 1)
 * @param minecraftTickSpeed - Optional tick speed override (default 20).
 *
 * @returns A promise resolving to a ConvertOutputType object containing the exported Buffer.
 * @throws {Error} If dimensions are invalid, frames are missing, or buffer data is corrupted.
 */
export async function convertToAPNG({
  png,
  mcmeta,
  frameDelayOverride = 1,
  minecraftTickSpeed = 20,
}: convertToAPNGInput): Promise<Buffer> {
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

  const finalFrames = frames.map((frame) => frame.buffer);
  const finalDelays = frames.map((frame) => frame.delay);
  const output = UPNG.encodeLL(finalFrames, size, size, 3, 1, 8, finalDelays);

  return Buffer.from(output);
}
