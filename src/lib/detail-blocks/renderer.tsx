import Image from "next/image";
import type { Block } from "./schema";

export default function DetailBlocksRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-10">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "image": {
      const { url, alt, caption, width } = block.data;
      if (!url) return null;
      return (
        <figure className={width === "full" ? "" : "max-w-2xl mx-auto"}>
          <div className="relative aspect-[4/3] w-full">
            <Image src={url} alt={alt} fill className="object-cover" sizes="100vw" />
          </div>
          {caption && (
            <figcaption className="text-xs text-[var(--pb-gray)] mt-2 text-center uppercase tracking-wider">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "gallery": {
      const { images, columns } = block.data;
      if (images.length === 0) return null;
      return (
        <div className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {images.map((im, i) => (
            <div key={i} className="relative aspect-square">
              <Image src={im.url} alt={im.alt} fill className="object-cover" sizes="50vw" />
            </div>
          ))}
        </div>
      );
    }
    case "richtext":
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: block.data.html }}
        />
      );
    case "twocol": {
      const { image, text, imageSide } = block.data;
      const imgEl = (
        <div className="relative aspect-square">
          <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="50vw" />
        </div>
      );
      const txtEl = (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: text.html }}
        />
      );
      return (
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {imageSide === "left" ? (
            <>
              {imgEl}
              {txtEl}
            </>
          ) : (
            <>
              {txtEl}
              {imgEl}
            </>
          )}
        </div>
      );
    }
    case "spec":
      return (
        <div>
          {block.data.title && (
            <h3 className="font-heading uppercase tracking-wider text-sm mb-3">
              {block.data.title}
            </h3>
          )}
          <dl className="border-t border-[var(--pb-light-gray)]">
            {block.data.rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-4 py-3 border-b border-[var(--pb-light-gray)] text-sm"
              >
                <dt className="text-[var(--pb-gray)] uppercase text-xs tracking-wider">
                  {r.label}
                </dt>
                <dd className="col-span-2">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "care":
      return (
        <ul className="space-y-2">
          {block.data.items.map((it, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="text-xs uppercase tracking-wider border border-[var(--pb-jet-black)] px-2 py-0.5 min-w-[3.5rem] text-center">
                {it.icon === "wash"
                  ? "세탁"
                  : it.icon === "dry"
                    ? "건조"
                    : it.icon === "iron"
                      ? "다림질"
                      : it.icon === "bleach"
                        ? "표백"
                        : "기타"}
              </span>
              <span>{it.text}</span>
            </li>
          ))}
        </ul>
      );
    case "banner": {
      const bg =
        block.data.bgColor === "black"
          ? "bg-[var(--pb-jet-black)] text-white"
          : block.data.bgColor === "sale"
            ? "bg-[var(--accent-sale)] text-white"
            : "bg-[var(--pb-off-white)] text-[var(--pb-jet-black)]";
      const align = block.data.align === "left" ? "text-left" : "text-center";
      return (
        <div className={`${bg} ${align} px-6 py-12`}>
          <p className="font-heading uppercase tracking-[0.25em] text-base md:text-lg">
            {block.data.text}
          </p>
        </div>
      );
    }
    case "youtube":
      return (
        <figure>
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${block.data.videoId}`}
              className="w-full h-full"
              allowFullScreen
              title={block.data.caption ?? "유튜브 영상"}
            />
          </div>
          {block.data.caption && (
            <figcaption className="text-xs text-[var(--pb-gray)] mt-2 text-center uppercase tracking-wider">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}
