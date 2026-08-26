/* Shared image swapper for the Allen Gillon homepage mockups.
   Any element with data-pool becomes a swap slot:
     <div class="gx-sm" data-pool="personal" data-start="duo-live-on-stage.jpg"></div>
   Pools are "personal", "albums", or "all" (both combined) - change a slot's
   data-pool attribute to swap its pool. State is in-memory only. */
(function () {
  "use strict";

  var PERSONAL = [
    ["album-misty-PHOTO-of-ann.jpg", "Ann, from the Misty cover"],
    ["allen-playing-red-gibson-waterfront.jpg", "Allen on the waterfront"],
    ["current-allen-and-ann-bribie-cap.jpg", "Allen and Ann at Bribie"],
    ["current-portrait-allen-and-ann-dressed-up.jpg", "Allen and Ann, portrait"],
    ["duo-live-on-stage.jpg", "The duo live on stage"],
    ["gig-poster-italia-on-marina.jpg", "Italia on the Marina poster"],
    ["matthew-allen-5-band-photo.jpg", "The band"],
    ["performance-ann-and-allen-onstage.jpg", "Ann and Allen performing"],
    ["promo-allen-gillon-guitarist-gibson.jpg", "Allen with his Gibson"]
  ].map(function (e) { return { src: "images/personal/" + e[0], label: e[1] }; });

  var ALBUMS = [
    ["album-dedicated-to-tim-hughes.jpg", "Dedicated to Tim Hughes"],
    ["album-i-just-called.jpg", "I Just Called"],
    ["album-originals.jpg", "Originals"],
    ["album-thats-the-time.jpg", "That's the Time"],
    ["album-wonderful-world-PHOTO-of-allen.png", "Wonderful World"]
  ].map(function (e) { return { src: "images/albums/" + e[0], label: e[1] }; });

  var POOLS = {
    personal: PERSONAL,
    albums: ALBUMS,
    all: PERSONAL.concat(ALBUMS)
  };

  function buildSlot(slot) {
    var pool = POOLS[slot.getAttribute("data-pool")];
    if (!pool || !pool.length) {
      slot.classList.add("gx");
      slot.innerHTML = '<div class="gx-missing">no images found</div>';
      return;
    }
    var start = slot.getAttribute("data-start") || "";
    var i = 0;
    pool.forEach(function (p, n) {
      if (start && p.src.slice(-start.length) === start) { i = n; }
    });

    slot.classList.add("gx");
    slot.innerHTML =
      '<img class="gx-img" src="' + pool[i].src + '" alt="' + pool[i].label + '">' +
      '<div class="gx-missing" hidden></div>' +
      '<button type="button" class="gx-btn gx-prev" aria-label="Previous picture">‹</button>' +
      '<button type="button" class="gx-btn gx-next" aria-label="Next picture">›</button>' +
      '<div class="gx-cap"><span class="gx-count"></span><span class="gx-label"></span></div>';

    var img = slot.querySelector(".gx-img");
    var missing = slot.querySelector(".gx-missing");
    var count = slot.querySelector(".gx-count");
    var label = slot.querySelector(".gx-label");

    img.addEventListener("error", function () {
      img.style.visibility = "hidden";
      missing.hidden = false;
      missing.textContent = pool[i].label + " (image not found)";
    });
    img.addEventListener("load", function () {
      img.style.visibility = "";
      missing.hidden = true;
    });

    function render() {
      var p = pool[i];
      img.src = p.src;
      img.alt = p.label;
      count.textContent = (i + 1) + " / " + pool.length;
      label.textContent = p.label;
    }
    slot.querySelector(".gx-prev").addEventListener("click", function () {
      i = (i - 1 + pool.length) % pool.length; render();
    });
    slot.querySelector(".gx-next").addEventListener("click", function () {
      i = (i + 1) % pool.length; render();
    });
    render();
  }

  function init() {
    var slots = document.querySelectorAll("[data-pool]");
    Array.prototype.forEach.call(slots, buildSlot);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
