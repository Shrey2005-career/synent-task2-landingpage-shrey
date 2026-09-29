const menuToggle = document.querySelector("#nav-toggle");
const menuLinks = document.querySelectorAll(".nav-menu nav a");

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
