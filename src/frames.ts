import { type ValidatedInput } from "./handleBuffers";
import Sharp from "sharp";

export interface getFramesInput extends ValidatedInput {
  frameDelayOverride: number;
  minecraftTickSpeed: number;
}

export async function getFrames(input: getFramesInput): Promise<{
  frames: {
    buffer: ArrayBuffer;
    delay: number;
  }[];
  size: number;
}> {
  // Remap input to match the old code
  const validatedInput = {
    png: input.png,
    mcmetaJson: input.mcmetaJson,
  };
  const frameDelayOverride = input.frameDelayOverride;
  const minecraftTickSpeed = input.minecraftTickSpeed;

  // Set up Sharp
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
    validatedInput.mcmetaJson.animation.frametime ?? frameDelayOverride;
  const minecraftTickSpeedMS = 1000 / minecraftTickSpeed;
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
    const is_multiple_of_four = frames[i].byteLength % 4 === 0;
    if (!is_multiple_of_four) {
      throw new Error("Frame data is not a multiple of four");
    }
  }

  const finalFrameOrder: {
    buffer: ArrayBuffer;
    delay: number;
  }[] = [];
  if (validatedInput.mcmetaJson.animation.frames) {
    for (const frame of validatedInput.mcmetaJson.animation.frames) {
      if (typeof frame === "number") {
        finalFrameOrder.push({
          buffer: frames[frame],
          delay: frameDurationBase * minecraftTickSpeedMS,
        });
      } else {
        const index = frame.index;
        let delay = frame.time ?? frameDurationBase;
        if (delay <= 0) {
          delay = 1;
        }
        finalFrameOrder.push({
          buffer: frames[index],
          delay: delay * minecraftTickSpeedMS,
        });
      }
    }
  } else {
    frames.forEach((buffer) => {
      finalFrameOrder.push({
        buffer,
        delay: frameDurationBase * minecraftTickSpeedMS,
      });
    });
  }

  if (finalFrameOrder.length === 0) {
    throw new Error("No frames found");
  }

  return {
    frames: finalFrameOrder,
    size: width,
  };
}
