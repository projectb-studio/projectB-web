import { BlocksSchema, type Block } from "@/lib/detail-blocks/schema";
import { sanitizeRichText } from "@/lib/detail-blocks/sanitize";

const R2_PREFIX = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
// Supabase Storage URL도 허용 (현재 업로드 경로)
const SUPABASE_PREFIX =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "") + "/storage/v1/object/public/";

export function isAllowedImageUrl(url: string): boolean {
  if (R2_PREFIX && url.startsWith(R2_PREFIX)) return true;
  if (SUPABASE_PREFIX && url.startsWith(SUPABASE_PREFIX)) return true;
  return false;
}

/**
 * Validate + sanitize a block array.
 *
 * This is the single trust boundary for detail blocks. It runs on:
 *   1. Manual operator saves  (PUT /detail-blocks)
 *   2. AI draft publishing     (POST /drafts/[id]/approve)
 *
 * Because AI-generated drafts also pass through here at publish time,
 * any HTML or image URL produced by the model is re-validated against
 * the Zod schema, DOMPurify, and the image-origin allowlist — the model
 * never gets a path to inject markup or off-origin assets into the live page.
 */
export function sanitizeBlocks(input: unknown): Block[] {
  const parsed = BlocksSchema.parse(input);
  return parsed.map((b) => {
    if (b.type === "richtext") {
      return { ...b, data: { html: sanitizeRichText(b.data.html) } };
    }
    if (b.type === "twocol") {
      if (!isAllowedImageUrl(b.data.image.url) && b.data.image.url !== "") {
        throw new Error("twocol image must be on R2 or Supabase Storage");
      }
      return {
        ...b,
        data: { ...b.data, text: { html: sanitizeRichText(b.data.text.html) } },
      };
    }
    if (b.type === "image" && b.data.url !== "" && !isAllowedImageUrl(b.data.url)) {
      throw new Error("image url must be on R2 or Supabase Storage");
    }
    if (b.type === "gallery") {
      b.data.images.forEach((im) => {
        if (im.url !== "" && !isAllowedImageUrl(im.url)) {
          throw new Error("gallery url must be on R2 or Supabase Storage");
        }
      });
    }
    return b;
  });
}
