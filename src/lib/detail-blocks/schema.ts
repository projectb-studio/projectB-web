import { z } from "zod";

const Uuid = z.string().uuid();

const ImageRef = z.object({
  url: z.string().url(),
  alt: z.string().default(""),
});

export const ImageBlock = z.object({
  id: Uuid,
  type: z.literal("image"),
  data: z.object({
    url: z.string().url(),
    alt: z.string().default(""),
    caption: z.string().optional(),
    width: z.enum(["full", "narrow"]),
  }),
});

export const GalleryBlock = z.object({
  id: Uuid,
  type: z.literal("gallery"),
  data: z.object({
    images: z.array(ImageRef).min(1).max(20),
    columns: z.union([z.literal(2), z.literal(3)]),
  }),
});

export const RichTextBlock = z.object({
  id: Uuid,
  type: z.literal("richtext"),
  data: z.object({ html: z.string().max(100_000) }),
});

export const TwoColBlock = z.object({
  id: Uuid,
  type: z.literal("twocol"),
  data: z.object({
    image: ImageRef,
    text: z.object({ html: z.string().max(50_000) }),
    imageSide: z.enum(["left", "right"]),
  }),
});

export const SpecBlock = z.object({
  id: Uuid,
  type: z.literal("spec"),
  data: z.object({
    title: z.string().optional(),
    rows: z.array(z.object({ label: z.string(), value: z.string() })).max(30),
  }),
});

export const CareBlock = z.object({
  id: Uuid,
  type: z.literal("care"),
  data: z.object({
    items: z
      .array(
        z.object({
          icon: z.enum(["wash", "dry", "iron", "bleach", "custom"]),
          text: z.string(),
        })
      )
      .max(10),
  }),
});

export const BannerBlock = z.object({
  id: Uuid,
  type: z.literal("banner"),
  data: z.object({
    text: z.string().max(200),
    bgColor: z.enum(["black", "offwhite", "sale"]),
    align: z.enum(["left", "center"]),
  }),
});

export const YoutubeBlock = z.object({
  id: Uuid,
  type: z.literal("youtube"),
  data: z.object({
    videoId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/),
    caption: z.string().optional(),
  }),
});

export const BlockSchema = z.discriminatedUnion("type", [
  ImageBlock,
  GalleryBlock,
  RichTextBlock,
  TwoColBlock,
  SpecBlock,
  CareBlock,
  BannerBlock,
  YoutubeBlock,
]);

export const BlocksSchema = z.array(BlockSchema).max(50);

export type Block = z.infer<typeof BlockSchema>;
export type Blocks = z.infer<typeof BlocksSchema>;
