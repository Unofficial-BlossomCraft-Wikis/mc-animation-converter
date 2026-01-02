import { ConvertInputType, validateInput } from "./handleBuffers";
import Sharp from "sharp";
import UPNG from "./dep/UPNG.js/UPNG.js";
// @ts-expect-error gifenc has no @types
import { GIFEncoder, quantize, applyPalette } from "gifenc";

/**
 * Supported formats for animation export.
 */
export type AllowedExportTypes = "apng" | "gif";

/**
 * The resulting buffer and metadata of the converted animation.
 */
export type ConvertOutputType = {
  export: Buffer;
  exportType: AllowedExportTypes;
};

/**
 * Configuration for the converter.
 */
export interface ConvertInput extends ConvertInputType {
  /**
   * The type of export to return. Defaults to "apng". Supports "apng" and "gif".
   */
  exportType?: AllowedExportTypes;
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
 * Converts a Minecraft sprite sheet (texture + mcmeta) into an animation.
 *
 * APNG export is recommended for most use cases, as it is lossless and supports transparency better than GIFs.
 *
 * @param png - The sprite sheet image as a Buffer.
 * @param mcmeta - The .mcmeta JSON file as a Buffer.
 * @param exportType - The desired output format ("apng" or "gif"). Defaults to "apng".
 * @param frameDelayOverride - Optional override for the duration of each frame in ms.
 * @param minecraftTickSpeed - Optional tick speed override (default 20).
 *
 * @returns A promise resolving to a ConvertOutputType object containing the exported Buffer.
 * @throws {Error} If dimensions are invalid, frames are missing, or buffer data is corrupted.
 */
export async function convert({
  png,
  mcmeta,
  exportType = "apng",
  frameDelayOverride,
  minecraftTickSpeed = 20,
}: ConvertInput): Promise<ConvertOutputType | void> {
  const validatedInput = validateInput({
    png: png,
    mcmeta: mcmeta,
  });

  const sharp = Sharp(validatedInput.png, { limitInputPixels: false });
  // Get image metadata
  const metadata = await sharp.metadata();

  const height = metadata.height;
  const width = metadata.width;
  // frame data
  const frameCount = height / width;
  // ensure that the frame count is an integer
  if (frameCount % 1 !== 0) {
    throw new Error(
      `Invalid sprite sheet dimensions: height (${height}) must be a multiple of width (${width}).`
    );
  }
  /**
   * frame duration in ms
   */
  const frameDurationBase =
    frameDelayOverride ?? validatedInput.mcmetaJson.animation.frametime;
  const minecraftFrameDuration = 1000 / minecraftTickSpeed;
  const frameDuration = minecraftFrameDuration * frameDurationBase;
  const frames: ArrayBuffer[] = [];
  for (let i = 0; i < frameCount; i++) {
    const top = i * width;
    const frame = await sharp
      .clone()
      .extract({
        left: 0,
        top,
        width: width,
        height: width,
      })
      .raw()
      .ensureAlpha()
      .toBuffer();
    // convert frame to an ArrayBuffer
    const copy = new Uint8Array(frame.length);
    copy.set(frame);
    frames.push(copy.buffer);
  }

  if (frames.length === 0) {
    throw new Error("No frames found");
  }

  for (let i = 0; i < frames.length; i++) {
    console.log(frames[i].byteLength);
    const is_multiple_of_four = frames[i].byteLength % 4 === 0;
    if (!is_multiple_of_four) {
      throw new Error("Frame data is not a multiple of four");
    }
  }

  const frameDelay: number[] = [];

  for (let i = 0; i < frameCount; i++) {
    frameDelay.push(frameDuration);
  }

  if (exportType === "apng") {
    const apng = UPNG.encodeLL(frames, width, width, 3, 1, 8, frameDelay);

    const exportBuffer = Buffer.from(apng);

    return {
      export: exportBuffer,
      exportType: exportType,
    };
  } else if (exportType === "gif") {
    const rawFrames = frames.map((frame) => new Uint8Array(frame));
    const gif = GIFEncoder();
    const allPixels = new Uint8Array(rawFrames.length * rawFrames[0].length);
    rawFrames.forEach((frame, i) => allPixels.set(frame, i * frame.length));
    const palette = quantize(allPixels, 256, { format: "rgba4444" });
    for (const frame of rawFrames) {
      const index = applyPalette(frame, palette, "rgba4444");

      gif.writeFrame(index, width, width, {
        palette,
        delay: frameDuration,
        transparent: true,
        transparentIndex: Math.max(
          0,
          palette.findIndex((p: number[]) => p[3] === 0)
        ),
      });
    }

    gif.finish();

    return {
      export: Buffer.from(gif.bytes()),
      exportType: exportType,
    };
  }
}
