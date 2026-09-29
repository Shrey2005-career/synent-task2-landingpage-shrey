# NOCTRA R1 — Electric Hypercar Landing Page

A responsive concept landing page for the fictional NOCTRA R1 electric hypercar. Built with semantic HTML, CSS, and dependency-free JavaScript for Synent Technologies Task 2.

## Features

- Responsive layout for mobile, tablet, and desktop
- Full-screen product hero and sticky navigation
- Performance statistics and four feature highlights
- Engineering, craftsmanship, and specification sections
- Accessible markup, keyboard-friendly navigation, and reduced-motion support
- Viewport-triggered text reveals, including left-to-right craft copy
- Performance and specification counters that run once when visible
- Craft image zoom-out ending at the complete, uncropped image
- Eased mouse-wheel scrolling with native touch and keyboard scrolling

## Motion behavior

Animations play once per page load. IntersectionObserver starts each reveal or counter only when its element enters the viewport. Values retain their final accessible reading while the visual count changes. Reduced-motion preferences disable reveals, counters, zoom and wheel easing, including when the preference changes while the page is open. Without JavaScript, the final content and full craft image remain visible.

Wheel easing uses a short requestAnimationFrame loop that stops after settling. Pointer, keyboard, touch, resize and anchor navigation cancel it. Small trackpad deltas, zoom gestures and nested scroll containers use native scrolling; wheel-event hardware detection is heuristic, so large trackpad deltas can also be eased.

## Project structure

```text
.
|-- assets/
|-- index.html
|-- script.js
|-- styles.css
|-- README.md
`-- .gitignore
```

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static development server.

## Attribution

This is an educational concept project. NOCTRA Motors and the R1 are fictional. The vehicle images were generated with AI tools and supplied by Shrey for this project.

