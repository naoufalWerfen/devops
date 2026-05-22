#!/usr/bin/env python3
"""Write the updated landing.css for photo-driven layout."""
import os

CSS = r'''/* ========================================================================== */
/* WERFEN LANDING PAGE — Corporate Photo-Driven Design                        */
/* ========================================================================== */

/* ── Design Tokens ────────────────────────────────────────────────────────── */

.lp-main {
  --lp-navy: #06038D;
  --lp-navy-dark: #020156;
  --lp-orange: #E87722;
  --lp-orange-hover: #D4681D;
  --lp-text: #1A1A2E;
  --lp-text-muted: #5A6175;
  --lp-bg: #FFFFFF;
  --lp-bg-alt: #F5F7FA;
  --lp-card: #FFFFFF;
  --lp-border: #E5E7EB;
  --lp-section-py: 5.5rem;
  --lp-container-max: 1200px;
  --lp-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --lp-duration: 700ms;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
  color: var(--lp-text);
  background: var(--lp-bg);
}

[data-theme='dark'] .lp-main {
  --lp-text: #F1F5F9;
  --lp-text-muted: #94A3B8;
  --lp-bg: #0B0E1A;
  --lp-bg-alt: #111827;
  --lp-card: #1E293B;
  --lp-border: #334155;
}

/* ── Container & Section Base ─────────────────────────────────────────────── */

.lp-container {
  max-width: var(--lp-container-max);
  margin: 0 auto;
  padding: 0 2rem;
}

.lp-section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.lp-section-tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-orange);
  margin-bottom: 0.75rem;
}

.lp-section-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 300;
  line-height: 1.2;
  color: var(--lp-navy);
  margin: 0;
}

[data-theme='dark'] .lp-section-title {
  color: #F1F5F9;
}

.lp-section-desc {
  font-size: 1.05rem;
  color: var(--lp-text-muted);
  max-width: 600px;
  margin: 1rem auto 0;
  line-height: 1.6;
}

/* ── Animations ───────────────────────────────────────────────────────────── */

@keyframes lp-fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes lp-fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes lp-fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes lp-scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.lp-animate-in {
  animation: lp-fadeInUp var(--lp-duration) var(--lp-ease) forwards;
  animation-delay: var(--delay, 0ms);
}

/* ── Hero — Full-bleed Photo Background ───────────────────────────────────── */

.lp-hero {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.lp-hero__bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.lp-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    rgba(6, 3, 141, 0.88) 0%,
    rgba(6, 3, 141, 0.65) 45%,
    rgba(6, 3, 141, 0.2) 100%
  );
  z-index: 1;
}

.lp-hero__inner {
  position: relative;
  z-index: 2;
  padding: 4rem 2rem;
}

.lp-hero__content {
  max-width: 600px;
  opacity: 0;
}

.lp-hero__content.lp-animate-in {
  animation: lp-fadeInLeft var(--lp-duration) var(--lp-ease) forwards;
}

.lp-hero__tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--lp-orange);
  margin-bottom: 1.25rem;
  padding-left: 2rem;
  position: relative;
}

.lp-hero__tag::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 1.5rem;
  height: 2px;
  background: var(--lp-orange);
  transform: translateY(-50%);
}

.lp-hero__title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 300;
  line-height: 1.05;
  color: #FFFFFF;
  margin: 0 0 1.25rem;
}

.lp-hero__subtitle {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 2rem;
}

.lp-hero__actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* ── Buttons ──────────────────────────────────────────────────────────────── */

.lp-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.75rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.25s var(--lp-ease);
  cursor: pointer;
  border: 2px solid transparent;
}

.lp-btn--primary {
  background: var(--lp-orange);
  color: #FFFFFF;
  border-color: var(--lp-orange);
}

.lp-btn--primary:hover {
  background: var(--lp-orange-hover);
  border-color: var(--lp-orange-hover);
  color: #FFFFFF;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(232, 119, 34, 0.3);
  text-decoration: none;
}

.lp-btn--outline-white {
  background: transparent;
  color: #FFFFFF;
  border-color: rgba(255, 255, 255, 0.5);
}

.lp-btn--outline-white:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #FFFFFF;
  color: #FFFFFF;
  text-decoration: none;
}

.lp-btn--outline {
  background: transparent;
  color: var(--lp-navy);
  border-color: var(--lp-navy);
}

.lp-btn--outline:hover {
  background: var(--lp-navy);
  color: #FFFFFF;
  text-decoration: none;
}

[data-theme='dark'] .lp-btn--outline {
  color: #F1F5F9;
  border-color: #F1F5F9;
}

[data-theme='dark'] .lp-btn--outline:hover {
  background: #F1F5F9;
  color: var(--lp-navy);
}

.lp-btn--large {
  padding: 1rem 2.25rem;
  font-size: 1rem;
}

/* ── Announcement Bar ─────────────────────────────────────────────────────── */

.lp-announce {
  background: var(--lp-navy);
  padding: 1rem 0;
}

.lp-announce__text {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.lp-announce__text strong {
  color: var(--lp-orange);
}

.lp-announce__link {
  color: var(--lp-orange);
  margin-left: 0.5rem;
  font-weight: 600;
  text-decoration: none;
}

.lp-announce__link:hover {
  text-decoration: underline;
  color: var(--lp-orange);
}

/* ── Stats ────────────────────────────────────────────────────────────────── */

.lp-stats {
  padding: 4rem 0;
  background: var(--lp-bg-alt);
  border-bottom: 1px solid var(--lp-border);
}

.lp-stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  text-align: center;
}

.lp-stat__number {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  color: var(--lp-navy);
  opacity: 0;
}

[data-theme='dark'] .lp-stat__number {
  color: var(--lp-orange);
}

.lp-stat__number.lp-animate-in {
  animation: lp-fadeInUp 0.6s var(--lp-ease) forwards;
}

.lp-stat__label {
  font-size: 0.9rem;
  color: var(--lp-text-muted);
  margin-top: 0.25rem;
}

/* ── Solutions Cards ──────────────────────────────────────────────────────── */

.lp-solutions {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg);
}

.lp-solutions__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.lp-solution-card {
  background: var(--lp-card);
  border: 1px solid var(--lp-border);
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transition: transform 0.3s var(--lp-ease), box-shadow 0.3s var(--lp-ease);
}

.lp-solution-card.lp-animate-in {
  animation: lp-fadeInUp var(--lp-duration) var(--lp-ease) forwards;
  animation-delay: var(--delay, 0ms);
}

.lp-solution-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.lp-solution-card__icon {
  font-size: 2.25rem;
  margin-bottom: 1rem;
}

.lp-solution-card__title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--lp-text);
  margin: 0 0 0.5rem;
}

.lp-solution-card__desc {
  font-size: 0.9rem;
  color: var(--lp-text-muted);
  line-height: 1.6;
  margin: 0;
}

.lp-solution-card__line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--accent, var(--lp-navy));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--lp-ease);
}

.lp-solution-card:hover .lp-solution-card__line {
  transform: scaleX(1);
}

/* ── Split Sections (Innovation & Global) ─────────────────────────────────── */

.lp-split {
  padding: var(--lp-section-py) 0;
}

.lp-split:nth-child(even) {
  background: var(--lp-bg-alt);
}

.lp-split__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.lp-split__image {
  border-radius: 12px;
  overflow: hidden;
  opacity: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.lp-split--img-left .lp-split__image.lp-animate-in {
  animation: lp-fadeInLeft var(--lp-duration) var(--lp-ease) forwards;
}

.lp-split--img-right .lp-split__image.lp-animate-in {
  animation: lp-fadeInRight var(--lp-duration) var(--lp-ease) forwards;
}

.lp-split__content {
  opacity: 0;
}

.lp-split--img-left .lp-split__content.lp-animate-in {
  animation: lp-fadeInRight var(--lp-duration) var(--lp-ease) forwards;
  animation-delay: 150ms;
}

.lp-split--img-right .lp-split__content.lp-animate-in {
  animation: lp-fadeInLeft var(--lp-duration) var(--lp-ease) forwards;
  animation-delay: 150ms;
}

.lp-split__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  aspect-ratio: 3 / 2;
}

.lp-split__content .lp-section-tag {
  text-align: left;
}

.lp-split__content .lp-section-title {
  text-align: left;
  margin-bottom: 1rem;
}

.lp-split__text {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--lp-text-muted);
  margin: 0 0 1.5rem;
}

.lp-split__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lp-split__list li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: var(--lp-text);
}

.lp-split__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--lp-orange);
}

.lp-split__stats-row {
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
}

.lp-split__mini-stat {
  display: flex;
  flex-direction: column;
}

.lp-split__mini-stat strong {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--lp-navy);
}

[data-theme='dark'] .lp-split__mini-stat strong {
  color: var(--lp-orange);
}

.lp-split__mini-stat span {
  font-size: 0.8rem;
  color: var(--lp-text-muted);
  margin-top: 0.15rem;
}

/* ── Products Showcase ────────────────────────────────────────────────────── */

.lp-products {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg);
}

.lp-products__showcase {
  max-width: 900px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(6, 3, 141, 0.12);
  opacity: 0;
}

.lp-products__showcase.lp-animate-in {
  animation: lp-scaleIn 0.8s var(--lp-ease) forwards;
}

.lp-products__showcase img {
  width: 100%;
  display: block;
}

/* ── Timeline ─────────────────────────────────────────────────────────────── */

.lp-timeline {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg-alt);
}

.lp-timeline__track {
  position: relative;
  padding-left: 2rem;
}

.lp-timeline__line {
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--lp-orange), var(--lp-navy));
  border-radius: 1px;
}

.lp-timeline__item {
  position: relative;
  padding: 0 0 2.5rem 2rem;
  opacity: 0;
}

.lp-timeline__item.lp-animate-in {
  animation: lp-fadeInUp var(--lp-duration) var(--lp-ease) forwards;
  animation-delay: var(--delay, 0ms);
}

.lp-timeline__dot {
  position: absolute;
  left: -2rem;
  top: 0.25rem;
  width: 14px;
  height: 14px;
  background: var(--lp-orange);
  border-radius: 50%;
  border: 3px solid var(--lp-bg-alt);
  box-shadow: 0 0 0 2px var(--lp-orange);
}

.lp-timeline__year {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--lp-navy);
}

[data-theme='dark'] .lp-timeline__year {
  color: var(--lp-orange);
}

.lp-timeline__event {
  margin: 0.25rem 0 0;
  color: var(--lp-text-muted);
  font-size: 0.95rem;
}

/* ── Certifications ───────────────────────────────────────────────────────── */

.lp-certs {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg);
}

.lp-certs__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
}

.lp-cert-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  border: 1px solid var(--lp-border);
  border-radius: 10px;
  opacity: 0;
  transition: transform 0.3s var(--lp-ease), box-shadow 0.3s var(--lp-ease);
}

.lp-cert-badge.lp-animate-in {
  animation: lp-fadeInUp 0.5s var(--lp-ease) forwards;
  animation-delay: var(--delay, 0ms);
}

.lp-cert-badge:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.lp-cert-badge__shield {
  font-size: 1.75rem;
}

.lp-cert-badge__text {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--lp-text);
  text-align: center;
  letter-spacing: 0.02em;
}

/* ── CTA Section ──────────────────────────────────────────────────────────── */

.lp-cta-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, var(--lp-navy) 0%, var(--lp-navy-dark) 100%);
  text-align: center;
}

.lp-cta-section__content h2 {
  font-size: clamp(1.6rem, 3.5vw, 2.25rem);
  font-weight: 300;
  color: #FFFFFF;
  margin: 0 0 1rem;
}

.lp-cta-section__content p {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 2rem;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
}

.lp-cta-section__actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.lp-cta-section .lp-btn--outline {
  color: #FFFFFF;
  border-color: rgba(255, 255, 255, 0.5);
}

.lp-cta-section .lp-btn--outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #FFFFFF;
  color: #FFFFFF;
}

/* ── Responsive ───────────────────────────────────────────────────────────── */

@media (max-width: 1024px) {
  .lp-split__inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .lp-split--img-right .lp-split__content {
    order: -1;
  }
}

@media (max-width: 768px) {
  .lp-hero {
    min-height: 70vh;
  }

  .lp-hero__title {
    font-size: 2.25rem;
  }

  .lp-stats__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .lp-solutions__grid {
    grid-template-columns: 1fr;
  }

  .lp-split__stats-row {
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .lp-hero__actions {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .lp-hero__inner {
    padding: 3rem 1.25rem;
  }

  .lp-container {
    padding: 0 1.25rem;
  }

  :root {
    --lp-section-py: 3.5rem;
  }
}

/* ── Reduced Motion ───────────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .lp-animate-in,
  .lp-hero__content.lp-animate-in,
  .lp-split__image.lp-animate-in,
  .lp-split__content.lp-animate-in,
  .lp-products__showcase.lp-animate-in {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
'''

target = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'landing.css')
with open(target, 'w') as f:
    f.write(CSS.lstrip('\n'))
print(f'Written: {target} ({os.path.getsize(target)} bytes)')
os.remove(os.path.abspath(__file__))
