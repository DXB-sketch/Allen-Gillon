import assert from "node:assert/strict";
import test from "node:test";
import {
  PLAYER_STATUSES,
  isPreviewTrack,
  nextTrackAfterEnd,
  nowBarLabel,
  statusForAudioEvent,
  timeText,
} from "../lib/player-state.mjs";

const misty = [
  { src: "/audio/misty/07-autumn-leaves.mp3", name: "Autumn Leaves", time: "2:42" },
  { src: "/audio/misty/08-misty.mp3", name: "Misty", time: "2:40" },
];
const previews = [
  { src: "/audio/ma5-chandler-theatre/01-i-will-always-love-you.mp3", name: "I Will Always Love You", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/02-brazil.mp3", name: "Brazil", time: "0:30", preview: true },
];

test("the bar says what is happening in words", () => {
  const track = { name: "Misty" };
  assert.equal(nowBarLabel("loading", track), "Loading: Misty");
  assert.equal(nowBarLabel("playing", track), "Playing: Misty");
  assert.equal(nowBarLabel("paused", track), "Paused: Misty");
  assert.equal(nowBarLabel("ended", track), "Finished: Misty");
  assert.equal(nowBarLabel("error", track), "Couldn't play Misty");
  assert.equal(nowBarLabel("idle", track), "");
  assert.equal(nowBarLabel("playing", null), "");
  assert.deepEqual(PLAYER_STATUSES, ["idle", "loading", "playing", "paused", "ended", "error"]);
});

test("30-second previews are recognised", () => {
  assert.ok(isPreviewTrack(previews[0]));
  assert.ok(isPreviewTrack({ src: "/audio/ma5-chandler-theatre/05-saltwater.mp3" }));
  assert.ok(isPreviewTrack({ src: "/audio/dedicated-to-tim-hughes/11-misty.mp3" }));
  assert.ok(!isPreviewTrack(misty[1]));
  assert.ok(!isPreviewTrack(null));
});

test("previews never auto-advance", () => {
  assert.equal(nextTrackAfterEnd(previews[0], previews), null);
});

test("an album moves on only within the list the listener chose", () => {
  assert.equal(nextTrackAfterEnd(misty[0], misty), misty[1]);
  assert.equal(nextTrackAfterEnd(misty[1], misty), null);
  assert.equal(nextTrackAfterEnd(misty[0], [misty[0]]), null);
  assert.equal(nextTrackAfterEnd(misty[0], null), null);
  assert.equal(nextTrackAfterEnd({ src: "/elsewhere.mp3", name: "Other" }, misty), null);
  assert.equal(nextTrackAfterEnd(misty[0], [misty[0], previews[0]]), null);
});

test("audio events drive the status", () => {
  assert.equal(statusForAudioEvent("playing", {}, "loading"), "playing");
  assert.equal(statusForAudioEvent("pause", { ended: false }, "playing"), "paused");
  assert.equal(statusForAudioEvent("pause", { ended: true }, "playing"), "ended");
  assert.equal(statusForAudioEvent("ended", {}, "paused"), "ended");
  assert.equal(statusForAudioEvent("error", {}, "loading"), "error");
  assert.equal(statusForAudioEvent("timeupdate", {}, "playing"), "playing");
});

test("time text uses the real duration once known", () => {
  assert.equal(timeText(0, NaN, "0:30"), "0:00 / 0:30");
  assert.equal(timeText(12.4, 30), "0:12 / 0:30");
  assert.equal(timeText(65, 160.2), "1:05 / 2:40");
  assert.equal(timeText(0, NaN), "0:00 / 0:00");
});
