const menuToggle = document.querySelector("#nav-toggle");
const menuLinks = document.querySelectorAll(".nav-menu nav a");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

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
