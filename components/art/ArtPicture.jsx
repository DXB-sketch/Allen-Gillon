import { artFallbackSrc, artSrcSet } from "../../lib/art-catalog.mjs";

/*
 * One photograph of a painting as a responsive <picture>: AVIF, then WebP,
 * at 480/720/960/1600 (capped at the photograph's width), built by
 * scripts/build-art-images.mjs. width/height keep the true aspect ratio so
 * nothing shifts while it loads. `sizes` describes how wide it renders.
 */
export default function ArtPicture({ image, alt, sizes, loading = "lazy", fetchPriority, className }) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={artSrcSet(image, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={artSrcSet(image, "webp")} sizes={sizes} />
      <img
        src={artFallbackSrc(image)}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        draggable={false}
      />
    </picture>
  );
}
