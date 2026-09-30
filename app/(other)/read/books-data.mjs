// Everything the /read routes need, as static imports: the Workers runtime has
// no filesystem, so nothing here is read at request time.
// - public/books/<slug>/manifest.json  (scripts/build-books.mjs)
// - content/book-text/<slug>.pages.json (scripts/extract-text.mjs; plays hold
//   only their preview pages)
// - content/story-cues/<slug>.json      (the narration cue files)

import bookIndex from "../../../public/books/index.json";

import breakout from "../../../public/books/breakout/manifest.json";
import funnyFah from "../../../public/books/funny-fah-learns-when-to-stop/manifest.json";
import imaginativeMee from "../../../public/books/imaginative-little-mee/manifest.json";
import hiDoh from "../../../public/books/little-hi-doh/manifest.json";
import littleRay from "../../../public/books/little-ray/manifest.json";
import meltingPot from "../../../public/books/melting-pot/manifest.json";
import otherMansGrass from "../../../public/books/the-other-mans-grass/manifest.json";
import sherwood from "../../../public/books/three-heroes-of-sherwood/manifest.json";
import calamityJane from "../../../public/books/tribute-to-calamity-jane/manifest.json";
import pic1 from "../../../public/books/practice-in-communication-book-1/manifest.json";
import pic2 from "../../../public/books/practice-in-communication-book-2/manifest.json";
import riddled from "../../../public/books/riddled-with-language/manifest.json";

import breakoutText from "../../../content/book-text/breakout.pages.json";
import funnyFahText from "../../../content/book-text/funny-fah-learns-when-to-stop.pages.json";
import imaginativeMeeText from "../../../content/book-text/imaginative-little-mee.pages.json";
import hiDohText from "../../../content/book-text/little-hi-doh.pages.json";
import littleRayText from "../../../content/book-text/little-ray.pages.json";
import meltingPotText from "../../../content/book-text/melting-pot.pages.json";
import otherMansGrassText from "../../../content/book-text/the-other-mans-grass.pages.json";
import sherwoodText from "../../../content/book-text/three-heroes-of-sherwood.pages.json";
import calamityJaneText from "../../../content/book-text/tribute-to-calamity-jane.pages.json";
import pic1Text from "../../../content/book-text/practice-in-communication-book-1.pages.json";
import pic2Text from "../../../content/book-text/practice-in-communication-book-2.pages.json";
import riddledText from "../../../content/book-text/riddled-with-language.pages.json";

import funnyFahCues from "../../../content/story-cues/funny-fah-learns-when-to-stop.json";
import imaginativeMeeCues from "../../../content/story-cues/imaginative-little-mee.json";
import hiDohCues from "../../../content/story-cues/little-hi-doh.json";
import littleRayCues from "../../../content/story-cues/little-ray.json";

export { bookIndex };

export const manifests = {
  breakout,
  "funny-fah-learns-when-to-stop": funnyFah,
  "imaginative-little-mee": imaginativeMee,
  "little-hi-doh": hiDoh,
  "little-ray": littleRay,
  "melting-pot": meltingPot,
  "the-other-mans-grass": otherMansGrass,
  "three-heroes-of-sherwood": sherwood,
  "tribute-to-calamity-jane": calamityJane,
  "practice-in-communication-book-1": pic1,
  "practice-in-communication-book-2": pic2,
  "riddled-with-language": riddled,
};

export const pageTexts = {
  breakout: breakoutText,
  "funny-fah-learns-when-to-stop": funnyFahText,
  "imaginative-little-mee": imaginativeMeeText,
  "little-hi-doh": hiDohText,
  "little-ray": littleRayText,
  "melting-pot": meltingPotText,
  "the-other-mans-grass": otherMansGrassText,
  "three-heroes-of-sherwood": sherwoodText,
  "tribute-to-calamity-jane": calamityJaneText,
  "practice-in-communication-book-1": pic1Text,
  "practice-in-communication-book-2": pic2Text,
  "riddled-with-language": riddledText,
};

export const cueFiles = {
  "funny-fah-learns-when-to-stop": funnyFahCues,
  "imaginative-little-mee": imaginativeMeeCues,
  "little-hi-doh": hiDohCues,
  "little-ray": littleRayCues,
};

/** The readable titles: built, with at least one page. */
export const readableSlugs = Object.keys(manifests).filter((slug) => manifests[slug].shownPages > 0);

/** Titles with a full-text route: stories and textbooks, never plays. */
export const textSlugs = readableSlugs.filter((slug) => Boolean(manifests[slug].textRoute));

export const SECTION_BACK = {
  plays: { href: "/books#school-plays", label: "Back to the plays" },
  childrens: { href: "/books#stories", label: "Back to the stories" },
  teaching: { href: "/books#classroom-texts", label: "Back to the textbooks" },
};
