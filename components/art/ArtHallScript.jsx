"use client";
import { useState } from "react";
import { ART_HALL_SCRIPT, ART_HALL_SCRIPT_ID } from "../../lib/art-catalog.mjs";

/*
 * The inline script that lays the wall out as the hallway before first paint
 * on a full page load (see ART_HALL_SCRIPT in lib/art-catalog.mjs).
 *
 * It is written into the server HTML and kept when that HTML hydrates. On a
 * client-side visit (a nav link) a script React creates would never run, and
 * React warns about it, so nothing is rendered then: ArtWall makes the same
 * choice in a layout effect instead. Telling the two apart: while hydrating,
 * the server's script element is already in the document.
 */
export default function ArtHallScript() {
  const [render] = useState(() => typeof document === "undefined" || Boolean(document.getElementById(ART_HALL_SCRIPT_ID)));
  if (!render) return null;
  return <script id={ART_HALL_SCRIPT_ID} dangerouslySetInnerHTML={{ __html: ART_HALL_SCRIPT }} />;
}
