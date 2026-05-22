# Guía de Instalación: Skills de Animación y Diseño UI/UX

Esta guía documenta la instalación de los 3 skills/paquetes de diseño y animación configurados en este proyecto.

---

## 1. UI UX Pro Max (uipro-cli v2.2.3+)

**¿Qué es?** Un skill de IA que proporciona inteligencia de diseño: 67 estilos UI, 161 paletas de colores, 57 combinaciones tipográficas, patrones de landing pages y guías UX.

**Repositorio:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill  
**Web:** https://uupm.cc/

### Instalación

```bash
# 1. Instalar el CLI globalmente
npm install -g uipro-cli

# 2. Inicializar para GitHub Copilot (en el directorio del proyecto)
cd /var/www/devops
uipro init --ai copilot

# Otros editores/agentes disponibles:
# uipro init --ai claude      # Claude Code
# uipro init --ai cursor      # Cursor
# uipro init --ai windsurf    # Windsurf
# uipro init --ai codex       # Codex CLI
# uipro init --ai all         # Todos los agentes
```

### Archivos instalados

```
.github/prompts/ui-ux-pro-max/
├── PROMPT.md           # Prompt principal del skill
├── data/               # Base de datos de estilos, colores, tipografías
└── scripts/            # Motor de búsqueda y generador de design systems
```

### Uso

En GitHub Copilot, usar el comando slash:
```
/ui-ux-pro-max Build a landing page for my SaaS product
```

### Comandos útiles del CLI

```bash
uipro versions              # Listar versiones disponibles
uipro update                # Actualizar a la última versión
uipro uninstall             # Desinstalar skill
uipro uninstall --ai copilot # Desinstalar de plataforma específica
```

### Requisitos

- Node.js (para el CLI)
- Python 3.x (para el script de búsqueda de design system)

---

## 2. GSAP Skills (8 skills)

**¿Qué es?** Skills oficiales de IA para GSAP (GreenSock Animation Platform). Enseñan a los agentes de IA el uso correcto de GSAP: API core, timelines, ScrollTrigger, plugins, React/Vue/Svelte y rendimiento.

**Repositorio:** https://github.com/greensock/gsap-skills

### Instalación para GitHub Copilot

Para Copilot, los skills de GSAP se configuran mediante archivos `.github/copilot-instructions.md` e `.github/instructions/`:

```bash
# Los paquetes npm ya están instalados:
npm install gsap @gsap/react
```

### Archivos configurados

```
.github/
├── copilot-instructions.md                    # Instrucciones globales de GSAP + Motion
└── instructions/
    ├── react.instructions.md                  # Instrucciones específicas para React (*.tsx, *.jsx)
    └── scrolltrigger.instructions.md          # Instrucciones específicas para ScrollTrigger
```

### Los 8 Skills incluidos

| Skill | Descripción |
|-------|-------------|
| `gsap-core` | API Core: `gsap.to()` / `from()` / `fromTo()`, easing, duration, stagger, defaults |
| `gsap-timeline` | Timelines: secuenciación, position parameter, labels, nesting, playback |
| `gsap-scrolltrigger` | ScrollTrigger: animaciones scroll-linked, pinning, scrub, triggers, refresh & cleanup |
| `gsap-plugins` | Plugins: ScrollToPlugin, ScrollSmoother, Flip, Draggable, Inertia, Observer, SplitText, etc. |
| `gsap-utils` | gsap.utils: clamp, mapRange, normalize, interpolate, random, snap, toArray, etc. |
| `gsap-react` | React: useGSAP hook, refs, gsap.context(), cleanup, SSR |
| `gsap-performance` | Performance: transforms sobre layout props, will-change, batching, tips de ScrollTrigger |
| `gsap-frameworks` | Vue, Svelte, etc.: lifecycle, scoping selectors, cleanup on unmount |

### Uso rápido

```javascript
// 1. Imports y registro de plugins (una vez por app)
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// 2. Tween simple — usar alias de transform y autoAlpha
gsap.to(".box", { x: 100, autoAlpha: 1, duration: 0.6, ease: "power2.inOut" });

// 3. Timeline para secuenciación (preferir sobre delay encadenados)
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2" } });
tl.to(".a", { x: 100 })
  .to(".b", { y: 50 }, "+=0.2")
  .to(".c", { opacity: 0 }, "-=0.1");

// 4. ScrollTrigger — adjuntar a timeline o tween de nivel superior
const tl2 = gsap.timeline({
  scrollTrigger: {
    trigger: ".section",
    start: "top center",
    end: "bottom center",
    scrub: true
  }
});

// 5. React: useGSAP + scope + cleanup
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);
useGSAP(() => { gsap.to(ref.current, { x: 100 }); }, { scope: containerRef });
```

> **Nota:** GSAP es 100% gratis — incluyendo todos los plugins. Tras la adquisición de GSAP por Webflow, todos los plugins anteriormente de Club GSAP (SplitText, MorphSVG, etc.) son gratis para todos, incluido uso comercial.

---

## 3. Motion (antes Framer Motion)

**¿Qué es?** Librería de animación open source para React, JavaScript y Vue. Usa Web Animations API y ScrollTimeline para animaciones a 120fps aceleradas por hardware.

**Repositorio:** https://github.com/motiondivision/motion  
**Web:** https://motion.dev  
**npm:** https://www.npmjs.com/package/motion

### Instalación

```bash
# Instalar el paquete
npm install motion
```

### Paquete instalado

- `motion@12.39.0` — La librería principal (antes `framer-motion`)

### Uso rápido

```jsx
// Importar — usar "motion/react", NO "framer-motion"
import { motion, AnimatePresence } from "motion/react";

// Componente animado básico
function Component() {
  return <motion.div animate={{ x: 100 }} />;
}

// Animación de entrada
<motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} />

// Gestos (hover, tap)
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
/>

// Animación al hacer scroll
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
/>

// Animación de layout
<motion.div layout />

// Animación de salida
<AnimatePresence>
  {show && <motion.div key="box" exit={{ opacity: 0 }} />}
</AnimatePresence>
```

### Características principales

- **`<motion.*>`** — Componentes animados (div, button, svg, etc.)
- **`animate`** — Prop para valores de animación objetivo
- **`initial` / `exit`** — Animaciones de entrada y salida
- **`whileHover` / `whileTap` / `whileDrag`** — Gestos
- **`whileInView`** — Animación por scroll
- **`layout` / `layoutId`** — Animación de layout y transiciones compartidas
- **`useScroll`** — Hook para valores vinculados al scroll
- **`<AnimatePresence>`** — Wrapper para animaciones de salida

---

## Versiones instaladas

| Paquete | Versión |
|---------|---------|
| `uipro-cli` | 2.2.3+ (global) |
| `gsap` | 3.15.0 |
| `@gsap/react` | 2.1.2 |
| `motion` | 12.39.0 |

## Estructura de archivos del proyecto

```
.github/
├── copilot-instructions.md                    # Instrucciones GSAP + Motion para Copilot
├── instructions/
│   ├── react.instructions.md                  # GSAP React (auto-aplica a *.tsx, *.jsx)
│   └── scrolltrigger.instructions.md          # GSAP ScrollTrigger (auto-aplica a *scroll*)
└── prompts/
    └── ui-ux-pro-max/                         # Skill UI UX Pro Max
        ├── PROMPT.md
        ├── data/
        └── scripts/
```
