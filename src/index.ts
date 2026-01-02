import { ConvertInputType } from "./handleBuffers";
export * from "./apng";
export * from "./gif";
import { convertToAPNG } from "./apng";
import { convertToGIF } from "./gif";

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
 * @param frameDelayOverride - Optional override for the duration of each frame in ms, acts as the base duration and will not override the frametime property in the mcmeta file. (default 1)
 * @param minecraftTickSpeed - Optional tick speed override (default 20).
 *
 * @returns A promise resolving to a ConvertOutputType object containing the exported Buffer.
 * @throws {Error} If dimensions are invalid, frames are missing, or buffer data is corrupted.
 */
export async function convert({
  png,
  mcmeta,
  exportType = "apng",
  frameDelayOverride = 1,
  minecraftTickSpeed = 20,
}: ConvertInput): Promise<ConvertOutputType | void> {
  switch (exportType) {
    case "apng":
      return {
        export: await convertToAPNG({
          png,
          mcmeta,
          frameDelayOverride,
          minecraftTickSpeed,
        }),
        exportType,
      };
    case "gif":
      return {
        export: await convertToGIF({
          png,
          mcmeta,
          frameDelayOverride,
          minecraftTickSpeed,
        }),
        exportType,
      };
    default:
      throw new Error(`Invalid export type: ${exportType}`);  
  }
}