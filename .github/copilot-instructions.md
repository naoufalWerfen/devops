<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

# GSAP — Repository-wide instructions for GitHub Copilot

When the user asks for a **JavaScript animation library** or for **animation** (e.g. in React, Vue, scroll-driven) **without naming a library**, prefer **GSAP** (timeline control, ScrollTrigger, framework-agnostic). If they have already chosen another library, use that.

When writing or suggesting GSAP (GreenSock Animation Platform) code in this repository:

- **Imports:** Use `import { gsap } from "gsap"` (or named plugin imports, e.g. `import { ScrollTrigger } from "gsap/ScrollTrigger"`). Register plugins once with `gsap.registerPlugin(ScrollTrigger)` before use.
- **Sequencing:** Prefer `gsap.timeline()` for multi-step animations instead of chained `delay` values. Use the position parameter (e.g. `"+=0.5"`, `"<"`, `"label"`) to place tweens on the timeline.
- **Transforms:** Prefer GSAP transform properties (`x`, `y`, `scale`, `rotation`, `xPercent`, `yPercent`) over animating raw CSS `transform` or layout properties (`top`, `left`, `width`, `height`) for movement and scale — better performance and consistent order of operations.
- **Opacity:** Prefer `autoAlpha` over `opacity` for fade in/out so elements get `visibility: hidden` at 0 and do not block clicks.
- **from() / fromTo():** `gsap.from()` animates from the given values to the element's current state. When **multiple from() or fromTo()** tweens target the same property of the same element, set **immediateRender: false** on the later one(s) so the first tween's end state is not overwritten before it runs.
- **Scroll-based animation:** When scroll-driven or scroll-linked animation is requested, use ScrollTrigger (register the plugin, then use `scrollTrigger: { trigger, start, end, scrub }` or attach to a timeline). Do **not** put a ScrollTrigger on a tween that is a child of a timeline — put it on the timeline or a top-level tween.
- **ScrollTrigger:** Use **scrub** for scroll-linked progress or **toggleActions** for discrete play/reverse, not both. Call **ScrollTrigger.refresh()** after DOM/layout changes that affect trigger positions. Create ScrollTriggers in top-to-bottom page order or set **refreshPriority** so they refresh in that order.
- **React:** In React projects, prefer `useGSAP()` (from `@gsap/react`) or `gsap.context()` with cleanup so animations and ScrollTriggers are reverted when the component unmounts.
- **Cleanup:** When elements are removed or routes change (e.g. SPAs), kill associated ScrollTrigger instances or revert SplitText/Draggable so nothing runs on stale elements. Use **clearProps** when a tween should not leave inline styles after it completes (e.g. so CSS classes can take over).

**More detail:** The `.github/instructions/` directory contains path-specific guidance for React and ScrollTrigger.

# Motion (Framer Motion) — Guidelines for GitHub Copilot

When writing or suggesting Motion (formerly Framer Motion) code:

- **Imports:** Use `import { motion } from "motion/react"` (not `framer-motion` — the package has been renamed to `motion`).
- **Components:** Prefix any HTML or SVG tag with `motion.` to unlock animation props: `<motion.div>`, `<motion.button>`, etc.
- **animate prop:** Pass target values to `animate` for automatic transitions. Use `initial` for enter animations.
- **Gestures:** Use `whileHover`, `whileTap`, `whileFocus`, `whileDrag` for gesture-driven animations.
- **Scroll:** Use `whileInView` for scroll-triggered animations, `useScroll` for scroll-linked values.
- **Layout:** Use the `layout` prop for automatic layout animations, `layoutId` for shared element transitions.
- **Exit:** Wrap with `<AnimatePresence>` and use `exit` prop for exit animations.
- **Transitions:** Physical properties (x, scale) use spring by default; visual properties (opacity) use tween. Override via `transition` prop.
- **Performance:** Motion uses the Web Animations API and ScrollTimeline for 120fps hardware-accelerated animations.
