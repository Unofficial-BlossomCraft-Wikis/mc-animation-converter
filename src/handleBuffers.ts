import z from "zod";

const BufferLikeSchema = z.union([
  z.instanceof(Buffer),
  z.instanceof(ArrayBuffer),
]);

const convertInputSchema = z.object({
  png: BufferLikeSchema,
  mcmeta: BufferLikeSchema,
});

export type ConvertInputType = z.infer<typeof convertInputSchema>;

const McmetaAnimationSchema = z.object({
  frametime: z.number(),
  frames: z
    .array(
      z.union([
        z.number(),
        z.object({
          index: z.number(),
          time: z.number().optional(),
        }),
      ])
    )
    .optional(),
});

const McmetaSchema = z.object({
  animation: McmetaAnimationSchema,
});

export type McmetaType = z.infer<typeof McmetaSchema>;

export const ValidatedInputSchema = convertInputSchema.superRefine(
  (data, ctx) => {
    // normalize
    const pngBuf = toBuffer(data.png);
    const mcmetaBuf = toBuffer(data.mcmeta);

    // 1) PNG validation
    if (!isPng(pngBuf)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["png"],
        message: "File is not a valid PNG (incorrect signature).",
      });
    }

    // 2) mcmeta JSON validation
    const text = mcmetaBuf.toString("utf8");

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mcmeta"],
        message: "mcmeta is not valid JSON.",
      });
      return; // stop here; no point in further checks
    }

    const parseResult = McmetaSchema.safeParse(json);
    if (!parseResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mcmeta"],
        message: "mcmeta JSON does not match the expected structure.",
      });
    }
  }
);

function toBuffer(data: Buffer | ArrayBuffer): Buffer {
  if (Buffer.isBuffer(data)) return data;
  return Buffer.from(data as ArrayBuffer);
}

function isPng(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;

  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < sig.length; i++) {
    if (buffer[i] !== sig[i]) return false;
  }
  return true;
}

export interface ValidatedInput {
  png: Buffer;
  mcmetaJson: McmetaType;
}

export function validateInput(input: ConvertInputType): ValidatedInput {
  // First, run Zod's schema checks + refinements
  ValidatedInputSchema.parse(input);

  // If we got here, we know png / mcmeta are valid.
  const pngBuf = toBuffer(input.png);
  const mcmetaBuf = toBuffer(input.mcmeta);
  const mcmetaJson = McmetaSchema.parse(
    JSON.parse(mcmetaBuf.toString("utf8"))
  );

  return {
    png: pngBuf,
    mcmetaJson,
  };
}