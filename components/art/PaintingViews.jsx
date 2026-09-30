"use client";
import { useEffect, useRef, useState } from "react";
import ArtPicture from "./ArtPicture";
import ArtArrow from "../illustrations/ArtArrow";

/*
 * The large photograph of one painting, with its other views.
 * - Previous and next view arrows sit over the picture. On a mouse or
 *   trackpad they fade in while the pointer is over the picture; on touch
 *   screens (hover:none) they are always shown; they are ordinary buttons,
 *   so Tab reaches them and they show whenever one has keyboard focus.
 * - Views also change by swipe and by the left and right arrow keys (keys
 *   anywhere inside `keyScope`, which defaults to this block).
 * - "View 2 of 3" and a row of dots say where you are.
 * A painting with one photograph shows just the picture.
 */
export default function PaintingViews({ art, sizes, priority = false, keyScope }) {
  const images = art.images;
  const count = images.length;
  const [index, setIndex] = useState(0);
  const rootRef = useRef(null);
  const swipe = useRef(null);

  const step = (delta) => setIndex((i) => (i + delta + count) % count);

  useEffect(() => {
    if (count < 2) return undefined;
    const scope = keyScope?.current || rootRef.current;
    if (!scope) return undefined;
    const onKey = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    };
    scope.addEventListener("keydown", onKey);
    return () => scope.removeEventListener("keydown", onKey);
  }, [count, keyScope]);

  const onPointerDown = (event) => {
    if (count < 2 || event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
  };

  const image = images[index];
  const alt = index === 0
    ? `${art.title}, a painting by Ann Gillon`
    : `${art.title}, another photograph of the same painting`;

  return (
    <div className={count > 1 ? "views views--multi" : "views"} ref={rootRef}>
      <div
        className="views-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { swipe.current = null; }}
      >
        <span className="views-frame" style={{ "--ar": image.width / image.height }}>
          <ArtPicture
            key={image.src}
            image={image}
            alt={alt}
            sizes={sizes}
            loading={priority || index > 0 ? "eager" : "lazy"}
            fetchPriority={priority && index === 0 ? "high" : undefined}
          />
        </span>
        {count > 1 ? (
          <>
            <button type="button" className="view-arrow view-prev" aria-label="Previous view" onClick={() => step(-1)}>
              <ArtArrow className="arrow-glyph arrow-back" />
            </button>
            <button type="button" className="view-arrow view-next" aria-label="Next view" onClick={() => step(1)}>
              <ArtArrow className="arrow-glyph" />
            </button>
          </>
        ) : null}
      </div>
      {count > 1 ? (
        <div className="views-nav">
          <p className="views-count" aria-live="polite">View {index + 1} of {count}</p>
          <div className="views-dots">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                className="views-dot"
                aria-label={`View ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
