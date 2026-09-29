const menuToggle = document.querySelector("#nav-toggle");
const menuLinks = document.querySelectorAll(".nav-menu nav a");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const imageFrame = document.querySelector(".craft-image-frame");
if (imageFrame && "IntersectionObserver" in window && !motionPreference.matches) {
  imageFrame.classList.add("zoom-ready");
  const imageObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    imageFrame.classList.add("is-visible");
    imageObserver.disconnect();
  }, { threshold: 0.2 });
  imageObserver.observe(imageFrame);
  motionPreference.addEventListener("change", ({ matches }) => {
    if (matches) {
      imageFrame.classList.add("is-visible");
      imageObserver.disconnect();
    }
  });
}

// Ease discrete wheel steps using native document scrolling. Touch, trackpad
// deltas, zoom gestures, nested scrollers and keyboard input stay native.
let wheelFrame = 0;
let wheelTarget = 0;
let previousWheelTime = 0;
function stopWheel() {
  cancelAnimationFrame(wheelFrame);
  wheelFrame = 0;
}
function stepWheel(now) {
  const elapsed = Math.min(64, now - previousWheelTime);
  previousWheelTime = now;
  const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  wheelTarget = Math.max(0, Math.min(wheelTarget, max));
  const distance = wheelTarget - scrollY;
  if (Math.abs(distance) < 1) {
    window.scrollTo({ top: wheelTarget, behavior: "instant" });
    wheelFrame = 0;
    return;
  }
  window.scrollTo({ top: scrollY + distance * (1 - Math.exp(-elapsed / 65)), behavior: "instant" });
  wheelFrame = requestAnimationFrame(stepWheel);
}
window.addEventListener("wheel", (event) => {
  if (motionPreference.matches || event.ctrlKey || event.metaKey || event.shiftKey ||
      !event.cancelable || Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
      (event.deltaMode === 0 && Math.abs(event.deltaY) < 50)) {
    stopWheel();
    return;
  }
  for (let node = event.target; node instanceof Element && node !== document.body; node = node.parentElement) {
    if (node.matches("input, textarea, select, [contenteditable=true]") ||
        (/auto|scroll/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight)) {
      stopWheel();
      return;
    }
  }
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
  if (!wheelFrame || Math.sign(delta) !== Math.sign(wheelTarget - scrollY)) wheelTarget = scrollY;
  wheelTarget += delta;
  event.preventDefault();
  if (!wheelFrame) {
    previousWheelTime = performance.now();
    wheelFrame = requestAnimationFrame(stepWheel);
  }
}, { passive: false });
["pointerdown", "touchstart", "keydown", "resize", "hashchange"].forEach((type) => {
  window.addEventListener(type, stopWheel, { passive: true });
});
motionPreference.addEventListener("change", stopWheel);

// Animate values, never model names, section numbers, or measurement labels.
const counterGroups = document.querySelectorAll(".stat dd, .spec-list dd");
const runningCounters = new Map();
let counterObserver;
function finishCounters() {
  counterObserver?.disconnect();
  runningCounters.forEach((frame) => cancelAnimationFrame(frame));
  runningCounters.clear();
  document.querySelectorAll("[data-count-final]").forEach((node) => {
    node.textContent = node.dataset.countFinal;
  });
}

if ("IntersectionObserver" in window && !motionPreference.matches) {
  counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      counterObserver.unobserve(target);
      const values = [...target.querySelectorAll("[data-count-final]")];
      const start = performance.now();
      function tick(now) {
        const progress = Math.max(0, Math.min(1, (now - start) / 1600));
        const eased = 1 - Math.pow(1 - progress, 3);
        values.forEach((node) => {
          const final = node.dataset.countFinal;
          const decimals = final.split(".")[1]?.length || 0;
          node.textContent = progress === 1 ? final :
            (Number(final.replaceAll(",", "")) * eased).toLocaleString("en-US", {
              minimumFractionDigits: decimals, maximumFractionDigits: decimals
            });
        });
        if (progress < 1) runningCounters.set(target, requestAnimationFrame(tick));
        else runningCounters.delete(target);
      }
      runningCounters.set(target, requestAnimationFrame(tick));
    });
  }, { threshold: 0.25 });

  counterGroups.forEach((group) => {
    const text = group.closest(".stat")
      ? [...group.children].map((node) => node.textContent).join(" ")
      : group.textContent;
    if (!/\d/.test(text)) return;
    // Preserve the final reading for assistive technology throughout the count.
    const accessible = document.createElement("span");
    accessible.className = "sr-only";
    accessible.textContent = text;
    const visual = document.createElement("span");
    visual.className = "counter-visual";
    visual.setAttribute("aria-hidden", "true");
    visual.append(...group.childNodes);
    const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\d[\d,]*(?:\.\d+)?)/g).forEach((part, index) => {
        if (index % 2 === 0) fragment.append(document.createTextNode(part));
        else {
          const number = document.createElement("span");
          number.dataset.countFinal = part;
          number.textContent = "0";
          fragment.append(number);
        }
      });
      node.replaceWith(fragment);
    });
    group.append(accessible, visual);
    counterObserver.observe(group);
  });
}

// Content is visible by default. Only a working observer enables reveals.
const revealTargets = document.querySelectorAll(
  ".section-intro > *, .feature-card, .craft-copy > *, .spec-heading > *, .reserve-content > *"
);
let revealObserver;
if ("IntersectionObserver" in window && !motionPreference.matches) {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add("is-visible");
      revealObserver.unobserve(target);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });

  revealTargets.forEach((target) => {
    target.classList.add("reveal");
    if (target.closest(".craft-copy")) target.classList.add("reveal-left");
    revealObserver.observe(target);
  });
}

motionPreference.addEventListener("change", ({ matches }) => {
  if (!matches) return;
  finishCounters();
  revealObserver?.disconnect();
  revealTargets.forEach((target) => target.classList.add("is-visible"));
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.checked = false;
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.checked) {
    menuToggle.checked = false;
    menuToggle.focus();
  }
});
