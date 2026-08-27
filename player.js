/* Site-wide track player: one shared <audio>, play buttons on each track row,
   and a sticky now-playing bar with a seek control. No accounts, no autoplay. */
(function () {
  "use strict";

  var audio = new Audio();
  var current = null; /* the .tplay button now loaded */

  var bar = document.getElementById("nowbar");
  var barPlay = document.getElementById("nowplay");
  var barName = document.getElementById("nowname");
  var barSeek = document.getElementById("nowseek");
  var barTime = document.getElementById("nowtime");

  function fmt(s) {
    if (!isFinite(s)) return "0:00";
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function setButton(btn, playing) {
    btn.classList.toggle("playing", playing);
    btn.textContent = playing ? "❚❚" : "▶";
    btn.setAttribute("aria-label", (playing ? "Pause " : "Play ") + btn.getAttribute("data-name"));
  }

  function load(btn) {
    if (current) setButton(current, false);
    current = btn;
    audio.src = btn.getAttribute("data-src");
    barName.textContent = btn.getAttribute("data-name");
    bar.classList.add("on");
  }

  function toggle(btn) {
    if (current === btn) {
      if (audio.paused) audio.play(); else audio.pause();
      return;
    }
    load(btn);
    audio.play();
  }

  audio.addEventListener("play", function () {
    if (current) setButton(current, true);
    barPlay.textContent = "❚❚";
    barPlay.setAttribute("aria-label", "Pause");
  });
  audio.addEventListener("pause", function () {
    if (current) setButton(current, false);
    barPlay.textContent = "▶";
    barPlay.setAttribute("aria-label", "Play");
  });
  audio.addEventListener("timeupdate", function () {
    if (audio.duration) barSeek.value = (audio.currentTime / audio.duration) * 1000;
    barTime.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
  });
  audio.addEventListener("ended", function () {
    /* step to the next track in the same list, if there is one */
    if (!current) return;
    var rows = current.closest(".trklist").querySelectorAll(".tplay");
    for (var i = 0; i < rows.length; i++) {
      if (rows[i] === current && rows[i + 1]) { toggle(rows[i + 1]); return; }
    }
  });

  barSeek.addEventListener("input", function () {
    if (audio.duration) audio.currentTime = (barSeek.value / 1000) * audio.duration;
  });
  barPlay.addEventListener("click", function () {
    if (!current) return;
    if (audio.paused) audio.play(); else audio.pause();
  });

  document.querySelectorAll(".tplay").forEach(function (btn) {
    setButton(btn, false);
    btn.addEventListener("click", function () { toggle(btn); });
  });
})();
