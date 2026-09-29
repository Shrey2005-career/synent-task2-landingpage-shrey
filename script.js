const menuToggle = document.querySelector("#nav-toggle");
const menuLinks = document.querySelectorAll(".nav-menu nav a");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

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
        const progress = Math.min(1, (now - start) / 1600);
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
    const text = group.textContent;
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
    document.querySelector(".nav-trigger").focus();
  }
});
