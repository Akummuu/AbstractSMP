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

let dragStartX = 0;
let dragStartScroll = 0;
let isDraggingTimeline = false;
let timelineDragDistance = 0;
let suppressTimelineClick = false;

timelineViewport?.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  if (event.target.closest("button, summary")) return;
  isDraggingTimeline = true;
  timelineDragDistance = 0;
  dragStartX = event.clientX;
  dragStartScroll = timelineViewport.scrollLeft;
});

timelineViewport?.addEventListener("pointermove", (event) => {
  if (!isDraggingTimeline) return;
  const distance = event.clientX - dragStartX;
  timelineDragDistance = Math.max(timelineDragDistance, Math.abs(distance));
  if (timelineDragDistance > 6 && !timelineViewport.hasPointerCapture(event.pointerId)) {
    timelineViewport.setPointerCapture(event.pointerId);
    timelineViewport.classList.add("is-dragging");
  }
  timelineViewport.scrollLeft = dragStartScroll - distance;
});

const stopTimelineDrag = () => {
  if (!isDraggingTimeline) return;
  suppressTimelineClick = timelineDragDistance > 6;
  isDraggingTimeline = false;
  timelineViewport?.classList.remove("is-dragging");
  window.setTimeout(() => { suppressTimelineClick = false; }, 0);
};
timelineViewport?.addEventListener("pointerup", stopTimelineDrag);
timelineViewport?.addEventListener("pointercancel", stopTimelineDrag);
timelineViewport?.addEventListener("dragstart", (event) => event.preventDefault());
timelineViewport?.addEventListener("click", (event) => {
  if (!suppressTimelineClick) return;
  event.preventDefault();
  event.stopPropagation();
  suppressTimelineClick = false;
}, true);

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
