/* Shelf covers for /music come at 240, 480 and 720px
   (public/images/albums/shelf/<id>-240.webp, -480.webp and <id>.webp), so a
   sleeve about 230px wide never downloads the 720px file. SHELF_SIZES follows
   the sleeve widths in app/(main)/music/music.css. The page preloads the first
   cover with the same srcset and sizes. Kept out of components/Album.jsx
   (a client module) so the server page can import the plain values. */
export const SHELF_SIZES = "(min-width: 1024px) min(420px, 18vw), (min-width: 600px) min(420px, 38vw), min(300px, 62vw)";

export function shelfSrcSet(src) {
  const base = src.replace(/\.webp$/, "");
  return `${base}-240.webp 240w, ${base}-480.webp 480w, ${src} 720w`;
}
