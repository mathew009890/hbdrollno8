/* ============================================================
   ALFIYA'S BIRTHDAY WEBSITE — script.js
   All interactions, animations, chapters, Easter eggs
   ============================================================ */

"use strict";

const IS_MOBILE =
  window.matchMedia("(max-width: 700px)").matches ||
  (navigator.hardwareConcurrency || 8) <= 4;

// ===================== STATE =====================
const FLW=['flower_1.webp','flower_2.webp','flower_3.webp','flower_4.webp','flower_5.webp','flower_6.webp'],ICO=[...FLW,"teddy_2.webp","balloon.webp","balloon_3.webp"];
const ico=(c="fx-ico")=>`<img class="${c}"src="${ICO[Math.floor(Math.random()*ICO.length)]}"alt="">`;
const STATE = {
  currentChapter: 1,
  unlockedChapters: new Set([1]),
  candleLit: false,
  candleBlown: false,
  cakeKnifeDragging: false,
  giftRibbonRemoved: false,
  giftOpened: false,
  letterTyped: false,
  duaTyped: false,
  finalLetterTyped: false,
  touchStartY: 0,
};

// ===================== UTILS =====================
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function $(id) {
  return document.getElementById(id);
}

function showToast(msg, duration = 2800) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), duration);
}

function closeOverlay() {
  $("overlayPopup").classList.remove("show");
}

function showOverlay(html) {
  $("overlayContent").innerHTML = html;
  $("overlayPopup").classList.add("show");
}

function restartJourney() {
  // ---- Reset state flags ----
  STATE.currentChapter = 1;
  STATE.unlockedChapters = new Set([1]);
  STATE.candleLit = false;
  STATE.candleBlown = false;
  STATE.cakeKnifeDragging = false;
  STATE.giftRibbonRemoved = false;
  STATE.giftOpened = false;
  STATE.letterTyped = false;
  STATE.duaTyped = false;
  STATE.finalLetterTyped = false;

  // ---- Landing screen: clear the leftover inline style that was blocking it ----
  const landing = $("landing");
  landing.style.display ="";
  landing.classList.add("active");
  $("storybook").classList.remove("active");

  const beginBtn = $("beginBtn");
  if (beginBtn) {
    beginBtn.disabled = false;
    beginBtn.innerHTML =
'<span class="btn-sparkle"></span> Begin The Journey <span class="btn-sparkle"></span>';
  }

  // ---- Chapters: show only chapter 1 ----
  document
.querySelectorAll(".chapter")
.forEach((ch) => ch.classList.add("hidden"));
  $("ch1").classList.remove("hidden");

  // ---- Nav dots ----
  document.querySelectorAll(".ch-dot").forEach((dot) => {
    dot.classList.remove("done");
    dot.classList.toggle("locked", dot.dataset.ch !== "1");
    dot.classList.toggle("active", dot.dataset.ch ==="1");
  });

  // ---- Chapter 1: envelope & letter ----
  const envelope = $("envelope");
  envelope.classList.remove("open");
  envelope.style.display ="";
  const envHint = $("envHint");
  envHint.style.display ="";
  envHint.textContent ="Tap to open";
  const letterWrapperReset = $("letterWrapper");
  if (typeof gsap!=="undefined") {
    gsap.killTweensOf(letterWrapperReset);
    gsap.set(letterWrapperReset, { clearProps:"all"});
  }
  letterWrapperReset.style.display ="none";
  $("ch1Next").style.display ="none";

  // ---- Chapter 2 ----
  if (typeof resetStory === "function") resetStory();

  // ---- Chapter 3 ----
  $("duaText").innerHTML ="";
  $("firefliesLayer").innerHTML ="";
  $("lanternsLayer").innerHTML ="";

  // ---- Chapter 4 ----
  STATE.cakeCut = false;
  const cakeContainer = $("cakeContainer");
  if (typeof gsap!=="undefined") {
    gsap.killTweensOf(cakeContainer);
    gsap.set(cakeContainer, { clearProps:"all"});
  }
  cakeContainer.style.transition ="";
  cakeContainer.style.opacity ="";
  cakeContainer.style.transform ="";
  cakeContainer.style.animation ="";
  cakeContainer.style.display ="";
  $("candleContainer").classList.remove("blown");
  const cakeSvgReset = $("cakeSvg");
  if (cakeSvgReset) cakeSvgReset.classList.remove("knife-in", "knife-out", "sliced", "served");
  $("cakeStage").classList.remove("cut");
  $("cakeReveal").classList.remove("show");
  document
.querySelectorAll(".cake-cut-flash,.cake-impact-ring,.cake-crumb")
.forEach((el) => el.remove());
  const candleAreaReset = $("candleArea");
  candleAreaReset.style.display = "";
  candleAreaReset.style.opacity = "";
  candleAreaReset.style.transition = "";
  $("candleFlame").classList.remove("lit");
  $("candleHint").textContent ="Tap to light • Swipe up to blow out";
  $("cakeSmile").style.display ="none";
  $("knifeArea").style.display ="none";
  const cakeKnife = $("cakeKnife");
  cakeKnife.style.transition ="";
  cakeKnife.style.transform ="";
  cakeKnife.style.opacity ="";
  cakeKnife.style.animation ="";
  $("goldenMessage").style.display ="none";
  $("ch4Next").style.display ="none";
  $("balloonPopup").style.display ="none";
  $("confettiLayer").innerHTML =""; // rebuilt fresh next time chapter 4 is visited

  // ---- Chapter 5 ----
  const giftBoxReset = $("giftBox");
  if (typeof gsap!=="undefined") {
    gsap.killTweensOf(giftBoxReset);
    gsap.set(giftBoxReset, { clearProps:"all"});
  } else {
    giftBoxReset.style.transform ="";
  }
  $("giftBow").classList.remove("removed");
  $("ribbonH").classList.remove("removed");
  $("ribbonV").classList.remove("removed");
  $("giftLid").classList.remove("open");
  const giftHint = $("giftHint");
  giftHint.style.display ="";
  giftHint.textContent ="Drag the ribbon to untie it, then tap the box";
  $("giftExplosion").style.display ="none";
  $("explosionContent").innerHTML ="";
  $("giftPlaceholder").style.display ="none";
  $("finalLetter").style.display ="none";
  $("finalLetterText").innerHTML ="";
  $("closingSection").style.display ="none";
  $("fadeMessage").style.display ="none";
  $("madeWith").style.display ="none";

  window.scrollTo({ top: 0, behavior:"instant"});
  $("gamesModal").classList.remove("active");
  showToast("Back to the beginning!");
}

// ===================== COUNTDOWN & AGE =====================
const BIRTH_YEAR = 2007,
  BIRTH_MONTH = 1,
  BIRTH_DAY = 20; // Feb 20, 2007

function initBirthdayCycle() {
  const now = new Date();
  let year = now.getFullYear();
  let target = new Date(year, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    year += 1;
    target = new Date(year, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0);
  }
  STATE.birthdayTarget = target;
  STATE.turningAge = year - BIRTH_YEAR;
  STATE.fireworksFiredFor = null;
}

function ordinal(n) {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return n +"th";
  switch (n % 10) {
    case 1:
      return n +"st";
    case 2:
      return n +"nd";
    case 3:
      return n +"rd";
    default:
      return n +"th";
  }
}

function applyAgeText(age) {
  const nice = ordinal(age);
  const cakeNum = $("cakeNum");
  if (cakeNum) cakeNum.textContent = age;

  const ageIntro = $("ageYearsText");
  if (ageIntro) ageIntro.textContent = age;

  const goldenTitle = document.querySelector(".golden-title");
  if (goldenTitle)
    goldenTitle.textContent =`Happy ${nice} Birthday, Alfiii!`;

  const goldenText = document.querySelector(".golden-text");
  if (goldenText) {
    goldenText.textContent =`Today celebrates ${age} beautiful years of you: ${age} years of kindness, laughter and light. May this new year be your softest, happiest and most beautiful yet.`;
  }

  const closingLine = document.querySelector(".closing-line");
  if (closingLine) closingLine.textContent =`Happy ${nice} Birthday, Alfiya.`;

  const ageBalloon = $("ageBalloon");
  if (ageBalloon)
    ageBalloon.setAttribute(
"data-joke",
`Alfiya is officially ${age} and THAT is everyone's problem now`,
    );

  // Landing page: her current age, right now (one less than the age she's counting down to)
  const ageBadgeNum = $("ageBadgeNum");
  if (ageBadgeNum) ageBadgeNum.textContent = Math.max(0, age - 1);

  const countdownLabel = $("countdownLabel");
  if (countdownLabel)
    countdownLabel.textContent = "Until your golden birthday";
}

function updateCountdown() {
  if (!STATE.birthdayTarget) initBirthdayCycle();
  applyAgeText(STATE.turningAge);

  const now = Date.now();
  const diff = STATE.birthdayTarget.getTime() - now;

  if (diff <= 0) {
    $("cd-days").textContent ="000";
    $("cd-hours").textContent ="00";
    $("cd-mins").textContent ="00";
    $("cd-secs").textContent ="00";

    if (STATE.fireworksFiredFor!== STATE.birthdayTarget.getTime()) {
      STATE.fireworksFiredFor = STATE.birthdayTarget.getTime();
      launchFireworks(15000, 450);
      showToast("Happy Birthday, Alfiii!!");
    }

    // Roll the countdown forward to next year's birthday
    const nextYear = STATE.birthdayTarget.getFullYear() + 1;
    STATE.birthdayTarget = new Date(nextYear, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0);
    STATE.turningAge += 1;
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  $("cd-days").textContent = String(days).padStart(3,"0");
  $("cd-hours").textContent = String(hours).padStart(2,"0");
  $("cd-mins").textContent = String(mins).padStart(2,"0");
  $("cd-secs").textContent = String(secs).padStart(2,"0");
  const secEl = $("cd-secs");
  secEl.classList.remove("tick");
  void secEl.offsetWidth;
  secEl.classList.add("tick");
}

// ===================== LANDING STARS =====================
function buildStars() {
  const layer = $("starsLayer");
  for (let i = 0; i < (IS_MOBILE ? 55 : 120); i++) {
    const s = document.createElement("div");
    s.className ="star-dot";
    const size = rand(1, 3.5);
    s.style.cssText =`
      width:${size}px; height:${size}px;
      top:${rand(0, 100)}%; left:${rand(0, 100)}%;
      --dur:${rand(2, 5)}s; --delay:${rand(0, 4)}s;
`;
    layer.appendChild(s);
  }
}

function buildClouds() {
  const layer = $("cloudsLayer");
  const emojis = ["","",""];
  for (let i = 0; i < 5; i++) {
    const c = document.createElement("div");
    c.className ="cloud";
    c.innerHTML ="<i></i><i></i><i></i>";
    c.style.cssText =`--dur:${rand(22, 45)}s; --delay:${rand(0, 20)}s; --top:${rand(5, 50)}%;`;
    layer.appendChild(c);
  }
}

function buildPetals() {
  const layer = $("petalsLayer");
  const flowers = [
"flower_1.webp",
"flower_2.webp",
"flower_3.webp",
"flower_4.webp",
"flower_5.webp",
"flower_6.webp",
  ];
  const TOTAL_PETALS = IS_MOBILE ? 12 : 18; // ~75% of before, still a clean multiple of 6 for equal representation

  // Build a deck that repeats all 6 flowers evenly, then shuffle it —
  // this guarantees every type is on screen at once instead of leaving
  // it to chance, which could streak toward just 1-2 types.
  const deck = [];
  for (let i = 0; i < TOTAL_PETALS; i++) deck.push(flowers[i % flowers.length]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  deck.forEach((src) => {
    const p = document.createElement("img");
    p.className ="petal";
    p.src = src;
    p.alt ="";
    const size = rand(0.95, 1.75);
    p.style.cssText =`
      --size:${size}rem;
      --dur:${rand(6, 14)}s;
      --delay:${rand(0, 12)}s;
      --left:${rand(0, 100)}%;
      --drift:${rand(-60, 60)}px;
`;
    layer.appendChild(p);
  });
}

function buildBalloonsFloat() {
  const layer = $("balloonsFloatLayer");
  if (!layer) return;
  const balloons = [
"balloon.webp",
"balloon_2.webp",
"balloon_3.webp",
"balloon_4.webp",
"balloon_5.webp",
  ];
  for (let i = 0; i < 4; i++) {
    const b = document.createElement("img");
    b.className ="floating-balloon";
    b.src = balloons[randInt(0, balloons.length - 1)];
    b.alt ="";
    const size = rand(1.1, 1.7);
    b.style.cssText =`
      --size:${size}rem;
      --dur:${rand(14, 26)}s;
      --delay:${rand(0, 20)}s;
      --left:${rand(0, 100)}%;
      --drift:${rand(-50, 50)}px;
      --sway:${rand(-15, 15)}deg;
`;
    layer.appendChild(b);
  }
}

// Teddy click hearts
$("teddyMain").addEventListener("click", function () {
  const hearts = ["","","","",""];
  for (let i = 0; i < 5; i++) {
    const h = document.createElement("div");
    h.className ="mini-heart";
    h.innerHTML = ico();
    h.style.cssText =`left:${rand(-30, 60)}px; top:${rand(-20, 10)}px; animation-delay:${i * 0.12}s;`;
    $("teddyHearts").appendChild(h);
    setTimeout(() => h.remove(), 2200);
  }
  showToast("The teddy says hi!");
});

// ===================== BEGIN JOURNEY =====================
$("beginBtn").addEventListener("click", function () {
  this.disabled = true;
  this.textContent ="Opening the book...";

  // Page turn effect
  const overlay = $("pageTurn");
  const inner = $("pageTurnInner");
  overlay.style.display ="block";
  inner.style.animation ="none";
  void inner.offsetWidth;
  inner.style.animation =
"pageTurnAnim 0.6s cubic-bezier(.77,0,.18,1) forwards";

  setTimeout(() => {
    $("landing").classList.remove("active");
    $("landing").style.display ="none";
    $("storybook").classList.add("active");
    overlay.style.display ="none";
    this.disabled = false;
    this.innerHTML =
'<span class="btn-sparkle"></span> Begin The Journey <span class="btn-sparkle"></span>';

    // Build chapter 1 assets
    buildChapter1();
  }, 640);
});

// ===================== CHAPTER NAVIGATION =====================
function goToChapter(num) {
  if (!STATE.unlockedChapters.has(num) && num!== STATE.currentChapter + 1) {
    showToast("Complete the current chapter first!");
    return;
  }
  if (num === STATE.currentChapter) return;

  // Page turn
  const overlay = $("pageTurn");
  const inner = $("pageTurnInner");
  overlay.style.display ="block";
  inner.style.animation ="none";
  void inner.offsetWidth;
  inner.style.animation =
"pageTurnAnim 0.6s cubic-bezier(.77,0,.18,1) forwards";

  setTimeout(() => {
    // Hide current
    const old = document.querySelector(".chapter:not(.hidden)");
    if (old) old.classList.add("hidden");

    // Show new
    const next = $("ch"+ num);
    if (next) {
      next.classList.remove("hidden");
      next.scrollIntoView({ behavior:"instant"});
    }

    STATE.currentChapter = num;
    STATE.unlockedChapters.add(num);

    // Update nav dots
    document.querySelectorAll(".ch-dot").forEach((dot) => {
      const ch = parseInt(dot.dataset.ch);
      dot.classList.toggle("active", ch === num);
      if (STATE.unlockedChapters.has(ch)) dot.classList.remove("locked");
      if (ch < num) dot.classList.add("done");
    });

    overlay.style.display ="none";

    // Initialize chapter
    if (num === 2) buildChapter2();
    if (num === 3) buildChapter3();
    if (num === 4) buildChapter4();
    if (num === 5) buildChapter5();

    window.scrollTo({ top: 0, behavior:"instant"});
  }, 640);
}

// Nav dot clicks
document.querySelectorAll(".ch-dot").forEach((dot) => {
  dot.addEventListener("click", function () {
    const ch = parseInt(this.dataset.ch);
    if (STATE.unlockedChapters.has(ch)) {
      goToChapter(ch);
    } else {
      showToast("Unlock this chapter by completing the previous one");
    }
  });
});

// ===================== CHAPTER 1: LETTER =====================

// A tiny helper: if an image file is missing, show a friendly placeholder
function attachImageFallbacks() {
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    const fail = () => {
      if (img.dataset.failed) return;
      img.dataset.failed = "1";
      const box = document.createElement("div");
      box.className = "img-missing";
      box.innerHTML = `Put <b>${img.dataset.fallback}</b><br>next to index.html`;
      img.replaceWith(box);
    };
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });
}

function buildChapter1() {
  const envelope = $("envelope");
  const hint = $("envHint");
  const letterWrapper = $("letterWrapper");

  envelope.addEventListener(
    "click",
    function () {
      if (this.classList.contains("open")) return;
      this.classList.add("open");
      hint.textContent = "";

      setTimeout(() => {
        envelope.style.display = "none";
        hint.style.display = "none";
        letterWrapper.style.display = "block";

        if (typeof gsap !== "undefined") {
          gsap.fromTo(
            letterWrapper,
            { opacity: 0, y: 60, scale: 0.7 },
            { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.4)" },
          );
        } else {
          letterWrapper.style.animation =
            "letterUnfold 0.9s cubic-bezier(.19,1,.22,1) forwards";
        }
        launchLetterSparkles();

        setTimeout(() => {
          $("ch1Next").style.display = "block";
          $("ch1Next").style.animation = "fadeIn 0.6s ease";
          showToast("Turn the page when you're ready");
        }, 1400);
      }, 650);
    },
    { once: true },
  );
}

function launchLetterSparkles() {
  const emojis = ["","","","",""];
  for (let i = 0; i < 16; i++) {
    const s = document.createElement("div");
    s.style.cssText =`
      position:fixed;
      left:${rand(20, 80)}vw;
      top:${rand(25, 55)}vh;
      font-size:${rand(1, 1.8)}rem;
      pointer-events:none;
      z-index:9999;
      opacity:0;
      animation:floatHeart ${rand(1.3, 2)}s ease-out forwards;
      animation-delay:${i * 0.05}s;
`;
    s.innerHTML = ico();
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 2400);
  }
}

function typewriterEffect(elementId, text, speed, callback) {
  const el = $(elementId);
  el.innerHTML = "";
  const chunk = text.length > 600 ? 3 : 1; // fewer DOM writes = smoother on phones
  let i = 0;
  let done = false;
  const cursor = document.createElement("span");
  cursor.className = "letter-cursor";
  cursor.textContent = "|";
  el.appendChild(cursor);

  function finish() {
    if (done) return;
    done = true;
    el.removeEventListener("click", skip);
    el.textContent = text;
    if (callback) callback();
  }
  function skip() {
    i = text.length;
    finish();
  }
  el.addEventListener("click", skip);

  function type() {
    if (done) return;
    if (cursor.parentNode !== el) return; // element was reset (e.g. restart)
    if (i < text.length) {
      const piece = text.slice(i, i + chunk);
      i += piece.length;
      el.insertBefore(document.createTextNode(piece), cursor);
      const last = piece[piece.length - 1];
      const delay =
        last === "\n" ? speed * 6 : last === "," || last === "." ? speed * 3 : speed;
      setTimeout(type, delay);
    } else {
      finish();
    }
  }
  type();
}

// ===================== CHAPTER 2: MEME STORY (shuffled card stack) =====================
const MEME_MAX = 20; // looks for 1st.jpg ... 20th.jpg, uses whatever exists
let MEMES = [];
const STORY = { idx: 0, built: false, ready: false };

function probeMemes() {
  const names = Array.from({ length: MEME_MAX }, (_, i) => `${ordinal(i + 1)}.jpg`);
  return Promise.all(
    names.map(
      (src) =>
        new Promise((res) => {
          const im = new Image();
          im.onload = () => res(src);
          im.onerror = () => res(null);
          im.src = src;
        }),
    ),
  ).then((list) => list.filter(Boolean));
}

function buildChapter2() {
  if (STORY.built) return;
  STORY.built = true;
  probeMemes().then((list) => {
    MEMES = list.length
      ? list
      : Array.from({ length: 12 }, (_, i) => `${ordinal(i + 1)}.jpg`); // placeholders
    initDeck();
  });
}

function initDeck() {
  const deck = $("storyDeck");
  deck.innerHTML = MEMES.map(
    (src, i) =>
      `<div class="deck-card" data-i="${i}"><img src="${src}" alt="" draggable="false" decoding="async"></div>`,
  ).join("");

  deck.querySelectorAll(".deck-card img").forEach((img, i) => {
    const fail = () => {
      img.replaceWith(
        Object.assign(document.createElement("div"), {
          className: "deck-missing",
          innerHTML: `Put <b>${MEMES[i]}</b><br>next to index.html`,
        }),
      );
    };
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  const stage = $("storyStage");
  let sx = 0, sy = 0, moved = false, swiped = false;
  stage.addEventListener("pointerdown", (e) => {
    sx = e.clientX; sy = e.clientY; moved = false; swiped = false;
  });
  stage.addEventListener("pointermove", (e) => {
    if (Math.abs(e.clientX - sx) > 12) moved = true;
  });
  stage.addEventListener("pointerup", (e) => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      swiped = true;
      storyGo(dx < 0 ? 1 : -1);
    }
  });
  stage.addEventListener("click", (e) => {
    if (swiped || moved) return;
    const r = stage.getBoundingClientRect();
    storyGo((e.clientX - r.left) / r.width < 0.25 ? -1 : 1);
  });
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); storyGo(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); storyGo(-1); }
  });
  $("storyPrev").addEventListener("click", () => storyGo(-1));
  $("storyNext").addEventListener("click", () => storyGo(1));

  STORY.ready = true;
  layoutDeck(false);
}

function storyGo(dir) {
  if (!STORY.ready) return;
  const next = STORY.idx + dir;
  if (next < 0) return;
  if (next >= MEMES.length) {
    // last picture: it stays put (nothing is left to reveal) - just a little nudge
    const stage = $("storyStage");
    stage.classList.remove("nudge");
    void stage.offsetWidth;
    stage.classList.add("nudge");
    $("ch2Next").style.display = "block";
    $("ch2Next").style.animation = "fadeIn 0.6s ease";
    return;
  }
  STORY.idx = next;
  layoutDeck(true);
  $("storyHint").classList.add("faded");
}

// already-seen cards fly off, upcoming cards sit in a slightly messy pile
function layoutDeck(animate) {
  const cards = document.querySelectorAll("#storyDeck .deck-card");
  const idx = STORY.idx;
  cards.forEach((card, i) => {
    const d = i - idx;
    const tilt = ((i * 37) % 9) - 4;
    let t, o = 1;
    if (d < 0) {
      const side = i % 2 ? 1 : -1;
      t = `translate3d(${side * 125}%, -6%, 0) rotate(${side * 22}deg)`;
      o = 0;
    } else if (d === 0) {
      t = "translate3d(0,0,0) rotate(0deg)";
    } else if (d <= 3) {
      t = `translate3d(0, ${d * 14}px, 0) rotate(${tilt}deg) scale(${1 - d * 0.045})`;
      o = 1 - d * 0.12;
    } else {
      t = `translate3d(0, ${3 * 14}px, 0) rotate(${tilt}deg) scale(${1 - 3 * 0.045})`;
      o = 0;
    }
    card.style.transition = animate
      ? "transform .55s cubic-bezier(.22,.85,.3,1), opacity .45s ease"
      : "none";
    card.style.transform = t;
    card.style.opacity = o;
    card.style.zIndex = d < 0 ? 100 + i : 100 - d;
    card.style.pointerEvents = "none";
  });
  $("storyCount").textContent = `${idx + 1} / ${MEMES.length}`;
  $("storyPrev").disabled = idx === 0;
  if (idx >= MEMES.length - 1) $("ch2Next").style.display = "block";
}

function resetStory() {
  STORY.idx = 0;
  if (STORY.ready) layoutDeck(false);
  $("ch2Next").style.display = "none";
  $("storyHint").classList.remove("faded");
}

// ===================== CHAPTER 3: DUA =====================
const DUA_TEXT =`A Prayer for Alfiya 

O Allah, the Most Merciful, the Most Loving,

Today I raise my hands for Alfiya, knowing that You know her heart better than anyone ever could. You know the dreams she has never spoken aloud, the worries she keeps to herself, the silent tears no one has seen, and every hope she carries into tomorrow. Ya Allah, let her always find comfort in knowing that You are with her through every moment of her life. 

Fill her heart with a peace that cannot be shaken by this world, and let her smile always come from contentment with what You have written for her. If there is goodness waiting for her, bring it closer. If there is harm hidden in what she desires, gently turn her heart away from it and replace it with something far more beautiful than she could ever imagine.

Ya Allah, place barakah in her life—in her time, her health, her family, her studies, her work, her friendships, and in every small step she takes. Let every sunrise bring new hope, every sunset leave her with gratitude, and every tomorrow become better than yesterday.

Surround her with people who sincerely love her for Your sake, who protect her heart instead of hurting it, who remind her of You, celebrate her happiness without envy, and stand beside her when life becomes difficult. Keep away those who wish her harm, whether they show it openly or hide it behind smiles.

Whenever life becomes heavy, be the One who lightens her burden. Whenever she feels lost, be the light that guides her. Whenever she feels weak, remind her that Your strength is always enough. Never let loneliness settle in her heart, for Your nearness is greater than the absence of anyone else. 

Ya Allah, accept every dua she has whispered in the quiet of the night, every tear she has shed only for You, and every hope she has entrusted to You. You are Al-Mujeeb, the One Who answers. Answer her prayers in the way that is best for her, at the time that is most perfect, and with blessings beyond what she could ever ask for.

As she begins another year of life, let it be a year that brings her closer to You than ever before. Fill it with beautiful memories, sincere laughter, meaningful moments, doors of opportunity, unexpected blessings, and countless reasons to say Alhamdulillah. 

Grant her a life filled with halal happiness, beneficial knowledge, righteous companionship, and unwavering faith. Bless her with strength in times of hardship, humility in times of success, patience in times of waiting, and gratitude in every blessing You bestow upon her.

And if one day she looks back on this chapter of her life, let her smile and realize that even the delays, the hardships, and the unanswered questions were all pieces of Your perfect plan. Protect her heart, preserve her beautiful smile, increase her in faith, forgive her shortcomings, grant her goodness in this world and the Hereafter, and keep her under Your infinite mercy always.

Ameen Ya Rabbal-'Alameen. 
`;

function buildChapter3() {
  if (STATE.duaTyped) return;

  // Build fireflies
  const fireLayer = $("firefliesLayer");
  for (let i = 0; i < (IS_MOBILE ? 16 : 30); i++) {
    const f = document.createElement("div");
    f.className ="firefly";
    f.style.cssText =`
      left:${rand(5, 95)}%;
      top:${rand(5, 95)}%;
      --fd:${rand(4, 10)}s;
      --fdd:${rand(0, 5)}s;
      --fx:${rand(-60, 60)}px;
      --fy:${rand(-60, 60)}px;
      --fx2:${rand(-60, 60)}px;
      --fy2:${rand(-60, 60)}px;
      --fx3:${rand(-60, 60)}px;
      --fy3:${rand(-60, 60)}px;
`;
    fireLayer.appendChild(f);
  }

  // Build lanterns
  const lanternLayer = $("lanternsLayer");
  for (let i = 0; i < 8; i++) {
    const l = document.createElement("div");
    l.className ="lantern";
    l.innerHTML ="<i></i>";
    l.style.cssText =`
      --ls:${rand(1.5, 3)}rem;
      --ld:${rand(10, 18)}s;
      --ldd:${i * 1.5}s;
      --ll:${rand(5, 90)}%;
`;
    lanternLayer.appendChild(l);
  }

  STATE.duaTyped = true;
  setTimeout(() => {
    typewriterEffect("duaText", DUA_TEXT, 12, () => {
      showToast("Ameen");
    });
  }, 600);
}

// ===================== CHAPTER 4: BIRTHDAY =====================
function buildChapter4() {
  const candleContainer = $("candleContainer");
  const flame = $("candleFlame");
  const candleHint = $("candleHint");
  const knifeArea = $("knifeArea");
  const cakeSmile = $("cakeSmile");
  const goldenMsg = $("goldenMessage");
  const ch4Next = $("ch4Next");
  const confettiLayer = $("confettiLayer");

  // Build confetti
  const colors = [
"#FFB3C6",
"#C8B8E8",
"#FFDAB9",
"#B8D8F8",
"#F5C842",
"#FFE4B5",
  ];
  for (let i = 0; i < 30; i++) {
    const c = document.createElement("div");
    c.className ="conf";
    c.style.cssText =`
      --cd:${rand(3, 7)}s;
      --cdd:${rand(0, 5)}s;
      --cl:${rand(5, 95)}%;
      --cc:${colors[randInt(0, 5)]};
      transform:rotate(${rand(0, 360)}deg);
`;
    confettiLayer.appendChild(c);
  }

  // Candle tap
  if (!STATE.candleLit) {
    candleContainer.addEventListener("click", function () {
      if (!STATE.candleLit) {
        STATE.candleLit = true;
        flame.classList.add("lit");
        candleHint.textContent ="Now swipe up on the flame to blow it out!";
        showToast("Candle lit! Swipe up to blow it out");
      }
    });
  }

  // Swipe up to blow candle
  candleContainer.addEventListener("touchstart", (e) => {
    STATE.touchStartY = e.touches[0].clientY;
  });
  candleContainer.addEventListener("touchend", (e) => {
    if (!STATE.candleLit || STATE.candleBlown) return;
    const deltaY = STATE.touchStartY - e.changedTouches[0].clientY;
    if (deltaY > 40) blowCandle();
  });
  // Mouse for desktop
  candleContainer.addEventListener("mousedown", (e) => {
    STATE.touchStartY = e.clientY;
  });
  candleContainer.addEventListener("mouseup", (e) => {
    if (!STATE.candleLit || STATE.candleBlown) return;
    if (STATE.touchStartY - e.clientY > 40) blowCandle();
  });

  function blowCandle() {
    STATE.candleBlown = true;
    flame.classList.remove("lit");
    candleContainer.classList.add("blown");
    candleHint.textContent ="You blew it out! Make a wish, Alfiya!";
    showToast("Yay! Make a wish!");

    // Cheer emoji burst
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("div");
      s.style.cssText =`
        position:fixed;
        left:${rand(15, 85)}vw;
        top:${rand(20, 70)}vh;
        font-size:${rand(1.5, 2.5)}rem;
        pointer-events:none;
        z-index:9999;
        animation:floatHeart 1.8s ease-out forwards;
        animation-delay:${i * 0.1}s;
`;
      s.innerHTML = ico();
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 2000);
    }

    cakeSmile.style.display ="block";
    cakeSmile.style.animation ="fadeIn 0.5s ease";

    setTimeout(() => {
      knifeArea.style.display ="block";
      knifeArea.style.animation ="fadeIn 0.6s ease";
      showToast("Now drag the knife to cut the cake!");
      setupKnife();
    }, 1000);
  }

  function setupKnife() {
    const knife = $("cakeKnife");
    let startX = 0,
      startY = 0,
      dragging = false;

    function onStart(e) {
      if (STATE.cakeCut) return;
      startX = e.touches? e.touches[0].clientX : e.clientX;
      startY = e.touches? e.touches[0].clientY : e.clientY;
      dragging = true;
      knife.style.animation ="none";
      knife.style.transition ="none";
    }
    function onMove(e) {
      if (!dragging) return;
      const cx = e.touches? e.touches[0].clientX : e.clientX;
      const cy = e.touches? e.touches[0].clientY : e.clientY;
      const dx = cx - startX;
      const dy = Math.max(0, cy - startY);
      knife.style.transform =`translate(${dx * 0.35}px, ${dy * 0.35}px) rotate(${dx * 0.15}deg)`;
    }
    function onEnd(e) {
      if (!dragging) return;
      dragging = false;
      const point = e.changedTouches? e.changedTouches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 45) {
        plungeKnife();
      } else {
        knife.style.transition ="transform 0.3s ease";
        knife.style.transform ="";
        knife.style.animation ="knifeWiggle 1.6s ease-in-out infinite";
      }
    }

    function plungeKnife() {
      // the hand-held knife steps aside, the real one slices the cake
      knife.style.transition = "transform 0.25s ease, opacity 0.25s ease";
      knife.style.transform = "translate(0px, -24px) scale(0.9)";
      knife.style.opacity = "0";
      setTimeout(() => {
        cutCake();
        setTimeout(() => {
          knifeArea.style.display = "none";
        }, 300);
      }, 220);
    }

    knife.addEventListener("touchstart", onStart, { passive: true });
    knife.addEventListener("touchmove", onMove, { passive: true });
    knife.addEventListener("touchend", onEnd);
    knife.addEventListener("mousedown", onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
  }

  function cutCake() {
    if (STATE.cakeCut) return;
    STATE.cakeCut = true;

    const stage = $("cakeContainer");

    const afterWobble = () => {
      playRealCut(stage);

      // The cut cake stays on screen: the slice is served and a little bite is taken
      setTimeout(() => {
        $("knifeArea").style.display = "none";
        $("cakeSvg").classList.add("served");
        $("cakeStage").classList.add("cut");
        showToast("The cake is cut!");
        startFloatingHearts();
      }, 1800);

      setTimeout(() => {
        goldenMsg.style.display = "block";
        goldenMsg.style.animation = "fadeIn 0.6s ease";
        launchFireworks();
        setTimeout(() => {
          ch4Next.style.display = "block";
          ch4Next.style.animation = "fadeIn 0.5s ease";
        }, 1000);
      }, 3800);
    };

    afterWobble();
  }

  // Knife slides down through the cake, then a slice slides out and shows the layers
  function playRealCut(stage) {
    const svg = $("cakeSvg");
    const candleArea = $("candleArea");
    if (candleArea) {
      candleArea.style.transition = "opacity .35s ease";
      candleArea.style.opacity = "0";
    }
    if (!svg) {
      spawnCakeCrumbs(stage);
      launchConfettiBurst(stage);
      return;
    }
    svg.classList.remove("knife-out", "sliced");
    svg.classList.add("knife-in");

    setTimeout(() => {
      // impact
      const flash = document.createElement("div");
      flash.className = "cake-cut-flash";
      stage.appendChild(flash);
      setTimeout(() => flash.remove(), 550);
      spawnCakeCrumbs(stage);
    }, 520);

    setTimeout(() => {
      svg.classList.remove("knife-in");
      svg.classList.add("knife-out", "sliced");
      launchConfettiBurst(stage);
    }, 760);
  }

  function spawnCakeCrumbs(container) {
    const colors = ["#fffdf6","#ffd9a0","#ff9fc0","#ffe27a","#ffcf4d"];
    const frag = document.createDocumentFragment();
    const crumbs = [];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("div");
      p.className ="cake-crumb";
      const size = rand(4, 9);
      p.style.width = size +"px";
      p.style.height = size +"px";
      p.style.background = colors[randInt(0, colors.length - 1)];
      p.style.setProperty("--cx", rand(-80, 80) +"px");
      p.style.setProperty("--cy", rand(-90, 15) +"px");
      p.style.animationDelay = rand(0, 0.12) +"s";
      frag.appendChild(p);
      crumbs.push(p);
    }
    container.appendChild(frag);
    setTimeout(() => crumbs.forEach((p) => p.remove()), 1100);
  }

  // Balloons
  document.querySelectorAll(".balloon").forEach((b) => {
    b.addEventListener("click", function () {
      const joke = this.dataset.joke;
      const popup = $("balloonPopup");
      popup.textContent =""+ joke;
      popup.style.display ="block";
      popup.style.animation ="none";
      void popup.offsetWidth;
      popup.style.animation ="fadeIn 0.4s ease";
      this.style.transform ="scale(0)";
      this.style.transition ="transform 0.2s";
      showToast("Pop!"+ joke);
      setTimeout(() => {
        this.style.transform ="";
        this.style.transition ="";
      }, 1500);
    });
  });
}

// ===================== FIREWORKS =====================
function launchFireworks(durationMs = 4000, burstInterval = 400) {
  // Prefer canvas-confetti for real gravity/decay physics; fall back to the
  // original hand-rolled version if the CDN failed to load for any reason.
  if (typeof confetti ==="undefined") {
    launchFireworksFallback(durationMs, burstInterval);
    return;
  }

  const canvas = $("fireworksCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
  const colors = [
"#FFB3C6",
"#C8B8E8",
"#FFDAB9",
"#B8D8F8",
"#F5C842",
"#ffffff",
"#FFE680",
  ];

  let fired = 0;
  const burstCount = Math.max(1, Math.round(durationMs / burstInterval));

  const interval = setInterval(() => {
    myConfetti({
      particleCount: 45,
      startVelocity: 32,
      spread: 360,
      ticks: 90,
      gravity: 0.9,
      scalar: 0.9,
      colors,
      origin: { x: rand(0.15, 0.85), y: rand(0.15, 0.5) },
    });
    fired++;
    if (fired >= burstCount) clearInterval(interval);
  }, burstInterval);
}

function launchFireworksFallback(durationMs = 4000, burstInterval = 400) {
  const canvas = $("fireworksCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = [
"#FFB3C6",
"#C8B8E8",
"#FFDAB9",
"#B8D8F8",
"#F5C842",
"#ffffff",
"#FFE680",
  ];

  function createBurst(x, y) {
    for (let i = 0; i < 60; i++) {
      const angle = ((Math.PI * 2) / 60) * i;
      const speed = rand(2, 8);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[randInt(0, colors.length - 1)],
        size: rand(2, 5),
      });
    }
  }

  let fwCount = 0;
  const maxBursts = Math.max(1, Math.round(durationMs / burstInterval));

  const interval = setInterval(() => {
    createBurst(
      rand(0.15, 0.85) * canvas.width,
      rand(0.1, 0.6) * canvas.height,
    );
    fwCount++;
    if (fwCount >= maxBursts) clearInterval(interval);
  }, burstInterval);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.alpha -= 0.018;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (particles.length > 0 || fwCount < maxBursts)
      requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

// ===================== CHAPTER 5: GIFT =====================
const FINAL_LETTER_TEXT =`Alfiya,

If you're reading this, you made it to the end. Every page was made with you in mind.

It was never effort. It was a way to say what's hard to say out loud: you are deeply, truly appreciated.

Come back anytime. On quiet days, on heavy days, on days you simply want to smile. This little corner will always be waiting.

I pray your twenties bring peace that stays, joy that's real, and dreams that come true one by one.

You are worth celebrating. Never forget it.

Happy Birthday, Alfiya.

With sincere prayers and warm wishes,
Someone who genuinely cares`;

function buildChapter5() {
  buildSunriseRays();
  setupGiftInteraction();
}

function buildSunriseRays() {
  const layer = $("sunriseRays");
  if (layer.children.length > 0) return;
  for (let i = 0; i < 16; i++) {
    const r = document.createElement("div");
    r.className ="ray";
    const angle = (i - 8) * 12;
    const height = rand(200, 500);
    r.style.cssText =`
      --rr:${angle}deg;
      --rd:${rand(3, 6)}s;
      --rdd:${i * 0.25}s;
      height:${height}px;
      transform:rotate(${angle}deg);
`;
    layer.appendChild(r);
  }
}

function setupGiftInteraction() {
  const giftBow = $("giftBow");
  const ribbonH = $("ribbonH");
  const ribbonV = $("ribbonV");
  const giftLid = $("giftLid");
  const giftHint = $("giftHint");
  const giftBox = $("giftBox");
  const explosion = $("giftExplosion");
  const placeholder = $("giftPlaceholder");
  const finalLetter = $("finalLetter");
  const closingSection = $("closingSection");

  // Step 1: Tap bow to untie ribbon
  giftBow.addEventListener("click", function () {
    if (STATE.giftRibbonRemoved) return;
    STATE.giftRibbonRemoved = true;
    giftBow.classList.add("removed");
    ribbonH.classList.add("removed");
    ribbonV.classList.add("removed");
    giftHint.textContent ="Now tap the box to open it!";
    showToast("Ribbon untied! Now tap the box");
  });

  // Step 2: Tap box to open
  giftBox.addEventListener("click", function () {
    if (!STATE.giftRibbonRemoved) {
      showToast("Untie the ribbon first! Tap the bow");
      return;
    }
    if (STATE.giftOpened) return;
    STATE.giftOpened = true;

    giftHint.style.display ="none";

    const openLid = () => {
      giftLid.classList.add("open");
      showToast("Opening...");

      setTimeout(() => {
        explosion.style.display ="block";
        launchGiftExplosion();
        launchConfettiBurst(giftBox);

        setTimeout(() => {
          placeholder.style.display ="block";
          placeholder.style.animation ="fadeIn 0.8s ease";

          setTimeout(() => {
            finalLetter.style.display ="block";
            finalLetter.style.animation ="fadeIn 0.8s ease";
            if (!STATE.finalLetterTyped) {
              STATE.finalLetterTyped = true;
              typewriterEffect("finalLetterText", FINAL_LETTER_TEXT, 14, () => {
                revealClosing(closingSection);
              });
            }
          }, 1500);
        }, 2000);
      }, 600);
    };

    // A little anticipation shake before it pops open — GSAP if available,
    // otherwise the lid just opens right away (still works fine either way).
    if (typeof gsap!=="undefined") {
      gsap
.timeline()
.to(giftBox, { x: -4, duration: 0.06, ease:"power1.inOut"})
.to(giftBox, { x: 4, duration: 0.06, ease:"power1.inOut"})
.to(giftBox, { x: -3, duration: 0.06, ease:"power1.inOut"})
.to(giftBox, {
          x: 0,
          duration: 0.06,
          ease:"power1.inOut",
          onComplete: openLid,
        });
    } else {
      openLid();
    }
  });
}

// A confetti burst that originates from wherever a given element sits on screen
function launchConfettiBurst(el) {
  if (typeof confetti ==="undefined") return;
  const rect = el.getBoundingClientRect();
  confetti({
    particleCount: 80,
    spread: 100,
    startVelocity: 38,
    gravity: 1,
    colors: ["#FFB3C6","#C8B8E8","#FFDAB9","#F5C842","#ffffff"],
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
  });
}

function launchGiftExplosion() {
  const container = $("explosionContent");
  const emojis = [
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
  ];
  container.style.position ="relative";
  container.style.height ="120px";

  for (let i = 0; i < 40; i++) {
    const e = document.createElement("div");
    e.className ="explosion-emoji";
    e.innerHTML = ico();
    e.style.cssText =`
      --ex:${rand(-200, 200)}px;
      --ey:${rand(-200, -50)}px;
      --ed:${rand(0.8, 2)}s;
      --edd:${rand(0, 0.8)}s;
      left:50%; top:50%;
`;
    container.appendChild(e);
  }

  // Also rain emojis from top
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const rain = document.createElement("div");
      rain.style.cssText =`
        position:fixed;
        left:${rand(5, 95)}vw;
        top:-2rem;
        font-size:${rand(1.2, 2.5)}rem;
        pointer-events:none;
        z-index:9998;
        animation:fallPetal ${rand(2, 4)}s linear forwards;
        --drift:${rand(-60, 60)}px;
`;
      rain.innerHTML = ico();
      document.body.appendChild(rain);
      setTimeout(() => rain.remove(), 4500);
    }, i * 120);
  }
}

function revealClosing(closingSection) {
  closingSection.style.display ="block";
  closingSection.style.animation ="fadeIn 1s ease";
  showToast("Happy Birthday, Alfiii");

  // Fade in final message after 5 seconds
  setTimeout(() => {
    const fadeMsg = $("fadeMessage");
    fadeMsg.style.display ="block";
    fadeMsg.style.animation ="fadeIn 1.5s ease";

    // Made with after another 4s
    setTimeout(() => {
      const madeWith = $("madeWith");
      madeWith.style.display ="block";
      madeWith.style.animation ="fadeIn 1.5s ease";
      launchFinaleCelebration();
    }, 4000);
  }, 5000);
}

function launchFinaleCelebration() {
  // A bigger, longer fireworks show for the grand finale
  launchFireworks(9000, 350);

  // A gentle confetti fall across the whole screen
  const pieces = ["","","","","","",""];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement("div");
    c.style.cssText =`
      position:fixed;
      left:${rand(0, 100)}vw;
      top:-40px;
      font-size:${rand(1, 1.8)}rem;
      z-index:9998;
      pointer-events:none;
      animation: finaleConfettiFall ${rand(2.8, 4.5)}s ease-in forwards;
      animation-delay:${rand(0, 1.3)}s;
`;
    c.innerHTML = ico();
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 7000);
  }

  // A warm glow pulse on the closing card, like it's glowing with love
  const wishes = document.querySelector(".closing-wishes");
  if (wishes) wishes.style.animation ="goldenGlow 1.2s ease-in-out 3";
}

// ===================== EASTER EGGS =====================
// Hidden bookmark easter egg — long press on chapter title
document.querySelectorAll(".chapter-title").forEach((title) => {
  let pressTimer;
  title.addEventListener("touchstart", () => {
    pressTimer = setTimeout(() => {
      const msgs = [
"Hidden bookmark found!'May this chapter of life be your favourite.'",
"Secret unlocked: Alfiya is literally the main character",
"Hidden message: You are appreciated more than you know, Alfiya.",
"Secret teddy hug delivered!",
"Hidden letter:'Dear Alfiii, you deserve the whole world.'",
      ];
      showOverlay(msgs[randInt(0, msgs.length - 1)]);
    }, 800);
  });
  title.addEventListener("touchend", () => clearTimeout(pressTimer));
});

// Triple tap on landing teddy reveals easter egg
let teddyTaps = 0;
$("teddyMain").addEventListener("click", () => {
  teddyTaps++;
  if (teddyTaps === 3) {
    teddyTaps = 0;
    showOverlay(
'<br><br>The teddy has a secret message:<br><br>"Alfiya is one of those rare people who makes the world genuinely kinder just by being in it. This website could never be enough. But it\'s made with so much care. Happy Birthday, Alfiya."',
    );
  }
});

// Stars on chapter 3 — tap fireflies for blessings
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("firefly")) {
    const blessings = [
"A blessing just landed on you",
"May Allah bless your nights with peace",
"A star carries a dua for Alfiya",
"May your path always be lit",
    ];
    showToast(blessings[randInt(0, blessings.length - 1)]);
  }
});

// ===================== PARTICLE CANVAS (bg ambient) =====================
function initParticleCanvas() {
  const canvas = $("particleCanvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const particles = [];
  for (let i = 0; i < (IS_MOBILE ? 20 : 40); i++) {
    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(1, 3),
      speed: rand(0.2, 0.7),
      alpha: rand(0.2, 0.6),
      color: ["#FFB3C6","#C8B8E8","#F5C842","#B8D8F8","#ffffff"][
        randInt(0, 4)
      ],
      dx: rand(-0.4, 0.4),
    });
  }

  function draw() {
    if (document.hidden) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += p.dx;
      p.alpha += rand(-0.01, 0.01);
      p.alpha = Math.max(0.1, Math.min(0.7, p.alpha));
      if (p.y < -5) {
        p.y = canvas.height + 5;
        p.x = rand(0, canvas.width);
      }
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ===================== GAMES MODAL =====================
function initGamesModal() {
  const modal = $("gamesModal");
  const launcher = $("gamesLauncher");
  const closeBtn = $("gamesClose");

  launcher.addEventListener("click", () => {
    modal.classList.add("active");
  });
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  document.querySelectorAll(".game-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
.querySelectorAll(".game-tab")
.forEach((t) => t.classList.remove("active"));
      document
.querySelectorAll(".game-panel")
.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const panelId =
"game"+
        tab.dataset.game.charAt(0).toUpperCase() +
        tab.dataset.game.slice(1);
      $(panelId).classList.add("active");
    });
  });

  initMemoryGame();
  initPuzzleGame();
  initBalloonsGame();
}

// ---- Game 3: Memory Match ----
function initMemoryGame() {
  const grid = $("memoryGrid");
  const movesEl = $("memoryMoves");
  const resultEl = $("memoryResult");
  const resetBtn = $("memoryResetBtn");

  const symbols = Array.from({ length: 8 }, (_, i) => `${i + 1}.webp`);
  let cards = [],
    flipped = [],
    matchedCount = 0,
    moves = 0,
    locked = false;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function build() {
    grid.innerHTML ="";
    flipped = [];
    matchedCount = 0;
    moves = 0;
    locked = false;
    movesEl.textContent ="0";
    resultEl.textContent ="";

    cards = shuffle([...symbols,...symbols]);

    cards.forEach((symbol, i) => {
      const card = document.createElement("div");
      card.className ="memory-card";
      card.dataset.symbol = symbol;
      card.dataset.index = i;
      card.innerHTML =`
        <div class="memory-card-inner">
          <div class="memory-face memory-front"><img src="front.webp" alt=""></div>
          <div class="memory-face memory-back"><img src="${symbol}"alt=""></div>
        </div>`;
      card.addEventListener("click", () => handleFlip(card));
      grid.appendChild(card);
    });
  }

  function handleFlip(card) {
    if (locked) return;
    if (
      card.classList.contains("flipped") ||
      card.classList.contains("matched")
    )
      return;
    if (flipped.length === 2) return;

    card.classList.add("flipped");
    flipped.push(card);

    if (flipped.length === 2) {
      moves++;
      movesEl.textContent = moves;
      const [a, b] = flipped;

      if (a.dataset.symbol === b.dataset.symbol) {
        a.classList.add("matched");
        b.classList.add("matched");
        flipped = [];
        matchedCount++;
        if (matchedCount === symbols.length) {
          resultEl.textContent =`Cleared in ${moves} moves! Your memory is as sweet as you are.`;
        }
      } else {
        locked = true;
        setTimeout(() => {
          a.classList.remove("flipped");
          b.classList.remove("flipped");
          flipped = [];
          locked = false;
        }, 800);
      }
    }
  }

  resetBtn.addEventListener("click", build);
  build();
}

// ---- Game 4: Puzzle Piece Reveal ----
function initPuzzleGame() {
  const grid = $("puzzleGrid");
  const resultEl = $("puzzleResult");
  const resetBtn = $("puzzleResetBtn");
  const nextBtn = $("puzzleNextBtn");
  const prevBtn = $("puzzlePrevBtn");
  const levelLabel = $("puzzleLevelLabel");
  const dotsWrap = $("puzzleDots");
  const SIZE = 3;
  const LEVELS = ["photo3.webp","photo4.webp"];

  let level = 0;
  let pieces = [];
  let selected = null;
  const solvedLevels = new Set();

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function isSolved() {
    return pieces.every((correctIndex, slot) => correctIndex === slot);
  }

  function renderDots() {
    dotsWrap.innerHTML ="";
    LEVELS.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className ="puzzle-dot";
      if (i === level) dot.classList.add("active");
      if (solvedLevels.has(i)) dot.classList.add("solved");
      dot.addEventListener("click", () => goToLevel(i));
      dotsWrap.appendChild(dot);
    });
  }

  function render() {
    grid.innerHTML ="";
    selected = null;
    const src = LEVELS[level];

    pieces.forEach((correctIndex, slotIndex) => {
      const row = Math.floor(correctIndex / SIZE);
      const col = correctIndex % SIZE;
      const posX = (col * 100) / (SIZE - 1);
      const posY = (row * 100) / (SIZE - 1);

      const piece = document.createElement("div");
      piece.className ="puzzle-piece";
      piece.style.backgroundImage =`url(${src})`;
      piece.style.backgroundSize =`${SIZE * 100}% ${SIZE * 100}%`;
      piece.style.backgroundPosition =`${posX}% ${posY}%`;
      piece.addEventListener("click", () => handleTap(piece, slotIndex));
      grid.appendChild(piece);
    });

    if (solvedLevels.has(level)) {
      document
.querySelectorAll("#puzzleGrid.puzzle-piece")
.forEach((p) => p.classList.add("puzzle-locked"));
      grid.classList.add("solved");
    } else {
      grid.classList.remove("solved");
    }
  }

  function handleTap(piece, slotIndex) {
    if (piece.classList.contains("puzzle-locked")) return;

    if (selected === null) {
      selected = slotIndex;
      piece.classList.add("puzzle-selected");
    } else if (selected === slotIndex) {
      piece.classList.remove("puzzle-selected");
      selected = null;
    } else {
      [pieces[selected], pieces[slotIndex]] = [
        pieces[slotIndex],
        pieces[selected],
      ];
      render();
      if (isSolved()) {
        setTimeout(() => {
          document
.querySelectorAll("#puzzleGrid.puzzle-piece")
.forEach((p) => p.classList.add("puzzle-locked"));
          grid.classList.add("solved");
          solvedLevels.add(level);
          renderDots();
          if (level < LEVELS.length - 1) {
            resultEl.textContent ="There she is! Ready for the next one?";
          } else {
            resultEl.textContent =
"Every piece of her, complete. Just like she is.";
          }
          launchLetterSparkles();
        }, 150);
      }
    }
  }

  function goToLevel(i) {
    level = ((i % LEVELS.length) + LEVELS.length) % LEVELS.length;
    resultEl.textContent ="";
    levelLabel.textContent =`Level ${level + 1} of ${LEVELS.length}`;
    renderDots();

    if (solvedLevels.has(level)) {
      pieces = [...Array(SIZE * SIZE).keys()]; // show it solved already
    } else {
      pieces = shuffle([...Array(SIZE * SIZE).keys()]);
      if (isSolved()) pieces.reverse(); // guard against an already-solved shuffle
    }
    render();
  }

  function shuffleLevel() {
    resultEl.textContent ="";
    solvedLevels.delete(level);
    pieces = shuffle([...Array(SIZE * SIZE).keys()]);
    if (isSolved()) pieces.reverse();
    renderDots();
    render();
  }

  resetBtn.addEventListener("click", shuffleLevel);
  nextBtn.addEventListener("click", () => goToLevel(level + 1));
  prevBtn.addEventListener("click", () => goToLevel(level - 1));

  goToLevel(0);
}

// ---- Game 5: Balloon Pop ----
function initBalloonsGame() {
  const field = $("balloonsField");
  const overlay = $("balloonsStartOverlay");
  const startBtn = $("balloonsStartBtn");
  const scoreEl = $("balloonsScore");
  const timerEl = $("balloonsTimer");
  const resultEl = $("balloonsResult");

  let score = 0,
    timeLeft = 30,
    spawnInterval = null,
    timerInterval = null,
    running = false;
  const colorPairs = [
    ["#FFB3C6","#C88AA8"],
    ["#C8B8E8","#8E78C0"],
    ["#FFDAB9","#E0A868"],
    ["#B8E8C8","#78B090"],
  ];
  const goldenMessages = [
"Golden balloon! You are so deeply loved, Alfiya.",
"You found the golden one — here's to your best year yet!",
"Golden balloon caught! Never forget how special you are.",
  ];

  function spawnBalloon() {
    const isGolden = Math.random() < 0.12;
    const b = document.createElement("div");
    b.className ="balloon-game-item"+ (isGolden?"golden":"");
    if (!isGolden) {
      const pair = colorPairs[randInt(0, colorPairs.length - 1)];
      b.style.setProperty("--bc", pair[0]);
      b.style.setProperty("--bc2", pair[1]);
    }
    b.style.left = rand(5, 78) +"%";
    b.style.animationDuration = rand(3.2, 4.8) +"s";
    b.addEventListener("click", () => {
      if (!running) return;
      score += isGolden? 5 : 1;
      scoreEl.textContent = score;
      if (isGolden) {
        resultEl.textContent =
          goldenMessages[randInt(0, goldenMessages.length - 1)];
        showToast("Golden balloon caught!");
      }
      const rect = b.getBoundingClientRect();
      const fieldRect = field.getBoundingClientRect();
      const pop = document.createElement("div");
      pop.className ="heart-pop";
      pop.textContent = isGolden?"":"+1";
      pop.style.left = rect.left - fieldRect.left +"px";
      pop.style.top = rect.top - fieldRect.top +"px";
      field.appendChild(pop);
      setTimeout(() => pop.remove(), 500);
      b.remove();
    });
    b.addEventListener("animationend", () => b.remove());
    field.appendChild(b);
  }

  function endGame() {
    running = false;
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    field.querySelectorAll(".balloon-game-item").forEach((b) => b.remove());

    let msg;
    if (score >= 25)
      msg =`${score} points! You caught almost every one, Alfiya!`;
    else if (score >= 12) msg =`${score} points — lovely round!`;
    else msg =`${score} points. Go again?`;
    resultEl.textContent = msg;

    overlay.style.display ="flex";
    startBtn.textContent ="Play Again";
  }

  function startGame(e) {
    e.stopPropagation();
    score = 0;
    timeLeft = 30;
    scoreEl.textContent ="0";
    timerEl.textContent ="30s";
    resultEl.textContent ="";
    overlay.style.display ="none";
    running = true;

    spawnInterval = setInterval(spawnBalloon, 600);
    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft +"s";
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  startBtn.addEventListener("click", startGame);
}
// ===================== INIT =====================
document.addEventListener("DOMContentLoaded", () => {
  buildStars();
  buildClouds();
  buildPetals();
  buildBalloonsFloat();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  initParticleCanvas();
  initGamesModal();
  attachImageFallbacks();
  initNavAutoHide();
  initPerfGuards();

  // Prevent default touch scroll on interactive elements
  document
.querySelectorAll(".envelope,.cake-container, #cakeKnife,.gift-box")
.forEach((el) => {
      el.addEventListener("touchmove", (e) => e.preventDefault(), {
        passive: false,
      });
    });

  // Show welcome toast
  setTimeout(
    () => showToast("Welcome! Something special awaits you..."),
    1200,
  );
});

// Handle resize
window.addEventListener("resize", () => {
  const fw = $("fireworksCanvas");
  fw.width = window.innerWidth;
  fw.height = window.innerHeight;
});


// ---- Smart nav: hide while scrolling down, show when scrolling up ----
function initNavAutoHide() {
  const nav = $("bookNav");
  if (!nav) return;
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY);
        const dy = y - lastY;
        if (y < 60) nav.classList.remove("nav-hidden");
        else if (dy > 8) nav.classList.add("nav-hidden");
        else if (dy < -8) nav.classList.remove("nav-hidden");
        lastY = y;
        ticking = false;
      });
    },
    { passive: true },
  );
}

// ---- Pause every animation while the tab/app is in the background ----
function initPerfGuards() {
  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("tab-hidden", document.hidden);
  });
}


// little hearts drifting up from the served slice
function startFloatingHearts() {
  const box = $("cakeContainer");
  let n = 0;
  const timer = setInterval(() => {
    if (n++ >= 14) { clearInterval(timer); return; }
    const h = document.createElement("span");
    h.className = "cake-heart";
    h.textContent = "\u2665";
    h.style.left = 64 + Math.random() * 28 + "%";
    h.style.fontSize = 0.8 + Math.random() * 0.5 + "rem";
    h.style.animationDuration = 2 + Math.random() * 1.2 + "s";
    h.style.setProperty("--dx", Math.round(Math.random() * 50 - 25) + "px");
    box.appendChild(h);
    setTimeout(() => h.remove(), 3500);
  }, 420);
}
