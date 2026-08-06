const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  nav?.classList.toggle("is-open", !isOpen);
});

nav?.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return;
  menuButton?.setAttribute("aria-expanded", "false");
  nav.classList.remove("is-open");
});

const timelineViewport = document.querySelector("[data-timeline-viewport]");
const timelineBack = document.querySelector("[data-timeline-back]");
const timelineForward = document.querySelector("[data-timeline-forward]");

const moveTimeline = (direction) => {
  timelineViewport?.scrollBy({ left: timelineViewport.clientWidth * 0.72 * direction, behavior: "smooth" });
};

timelineBack?.addEventListener("click", () => moveTimeline(-1));
timelineForward?.addEventListener("click", () => moveTimeline(1));

timelineViewport?.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

  const maxScroll = timelineViewport.scrollWidth - timelineViewport.clientWidth;
  const canMove = (event.deltaY > 0 && timelineViewport.scrollLeft < maxScroll)
    || (event.deltaY < 0 && timelineViewport.scrollLeft > 0);

  if (!canMove) return;
  event.preventDefault();
  timelineViewport.scrollLeft += event.deltaY;
}, { passive: false });

let dragStartX = 0;
let dragStartScroll = 0;
let isDraggingTimeline = false;

timelineViewport?.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (event.target.closest("a, button, summary, .timeline-card, .prelude-card")) return;
  isDraggingTimeline = true;
  dragStartX = event.clientX;
  dragStartScroll = timelineViewport.scrollLeft;
  timelineViewport.setPointerCapture(event.pointerId);
});

timelineViewport?.addEventListener("pointermove", (event) => {
  if (!isDraggingTimeline) return;
  timelineViewport.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
});

const stopTimelineDrag = () => { isDraggingTimeline = false; };
timelineViewport?.addEventListener("pointerup", stopTimelineDrag);
timelineViewport?.addEventListener("pointercancel", stopTimelineDrag);

const soundToggle = document.querySelector("[data-sound-toggle]");
let soundEnabled = Boolean(soundToggle);
let audioContext;

const getAudioContext = () => {
  if (!soundEnabled) return null;
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
};

const playInterfaceSound = (frequency, duration, volume = 0.018) => {
  const context = getAudioContext();
  if (!context || context.state !== "running") return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.82, context.currentTime + duration);
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
};

document.addEventListener("pointerdown", () => getAudioContext(), { once: true });

soundToggle?.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.lastChild.textContent = soundEnabled ? " Sound on" : " Sound off";
  if (soundEnabled) playInterfaceSound(620, 0.07, 0.022);
});

document.addEventListener("click", (event) => {
  if (!soundEnabled || event.target.closest("[data-sound-toggle]")) return;
  if (event.target.closest("a, button, summary")) playInterfaceSound(480, 0.055, 0.021);
});

document.querySelectorAll(".timeline-video, .prelude-card, .timeline-control, .episode-summary summary").forEach((element) => {
  element.addEventListener("pointerenter", () => {
    if (soundEnabled && audioContext?.state === "running") playInterfaceSound(760, 0.035, 0.009);
  });
});

const previewCards = document.querySelectorAll(".timeline-video[data-video-id]");
const canPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches
  && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  && !navigator.connection?.saveData;

if (canPreview) {
  const previewTimers = new WeakMap();

  const stopPreview = (card) => {
    const timers = previewTimers.get(card);
    if (timers) {
      window.clearTimeout(timers.start);
      window.clearTimeout(timers.stop);
    }
    card.querySelector(".timeline-preview")?.replaceChildren();
    card.classList.remove("is-previewing");
    previewTimers.delete(card);
  };

  previewCards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      if (previewTimers.has(card)) return;

      const timers = { start: 0, stop: 0 };
      timers.start = window.setTimeout(() => {
        const preview = card.querySelector(".timeline-preview");
        if (!preview) return;

        const start = Number.parseInt(card.dataset.previewStart || "0", 10);
        const iframe = document.createElement("iframe");
        iframe.title = "Muted episode preview";
        iframe.allow = "autoplay; encrypted-media; picture-in-picture";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.src = `https://www.youtube-nocookie.com/embed/${card.dataset.videoId}?autoplay=1&mute=1&controls=0&disablekb=1&playsinline=1&rel=0&start=${start}&end=${start + 8}`;
        preview.replaceChildren(iframe);
        card.classList.add("is-previewing");
        timers.stop = window.setTimeout(() => stopPreview(card), 8200);
      }, 450);

      previewTimers.set(card, timers);
    });

    card.addEventListener("pointerleave", () => stopPreview(card));
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
