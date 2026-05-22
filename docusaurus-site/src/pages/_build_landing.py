#!/usr/bin/env python3
"""Generate landing.js and landing.css with Werfen corporate style + GSAP."""
import os

BASE = '/var/www/devops/docusaurus-site/src/pages'

# ─── landing.js ─────────────────────────────────────────────────────────────

js_content = r'''import React, { useRef } from "react";
import Layout from "@theme/Layout";
import "./landing.css";

/* -- GSAP ----------------------------------------------------------------- */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* -- SVG Illustrations ---------------------------------------------------- */

function IllustrationLab() {
  return (
    <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-illustration">
      {/* Background */}
      <rect width="600" height="500" rx="16" fill="#F1F5F9"/>
      {/* Lab desk */}
      <rect x="50" y="340" width="500" height="8" rx="4" fill="#CBD5E1"/>
      {/* Monitor */}
      <rect x="320" y="120" width="220" height="160" rx="8" fill="#1E293B"/>
      <rect x="330" y="130" width="200" height="135" rx="4" fill="#059669"/>
      {/* Monitor screen content */}
      <rect x="340" y="140" width="55" height="40" rx="3" fill="#34D399"/>
      <rect x="400" y="140" width="55" height="40" rx="3" fill="#34D399"/>
      <rect x="460" y="140" width="55" height="40" rx="3" fill="#34D399"/>
      <rect x="340" y="190" width="55" height="40" rx="3" fill="#6EE7B7"/>
      <rect x="400" y="190" width="55" height="40" rx="3" fill="#6EE7B7"/>
      <rect x="460" y="190" width="55" height="40" rx="3" fill="#6EE7B7"/>
      <rect x="340" y="240" width="175" height="15" rx="3" fill="#A7F3D0"/>
      {/* Monitor stand */}
      <rect x="405" y="280" width="50" height="60" rx="4" fill="#64748B"/>
      <rect x="380" y="335" width="100" height="8" rx="4" fill="#64748B"/>
      {/* Person - lab coat */}
      <circle cx="200" cy="160" r="45" fill="#FCD9B6"/>
      <path d="M155 200 C155 200 145 220 140 280 L140 340 L260 340 L260 280 C255 220 245 200 245 200" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
      {/* Hair */}
      <path d="M160 155 C160 120 185 100 200 100 C215 100 240 120 240 155 C240 140 230 130 200 130 C170 130 160 140 160 155Z" fill="#1E293B"/>
      {/* Lab coat details */}
      <rect x="170" y="220" width="60" height="4" rx="2" fill="#E2E8F0"/>
      <rect x="170" y="240" width="40" height="4" rx="2" fill="#E2E8F0"/>
      {/* ID badge */}
      <rect x="220" y="210" width="25" height="35" rx="3" fill="#06038D"/>
      <rect x="225" y="215" width="15" height="10" rx="2" fill="white"/>
      {/* Flask */}
      <path d="M100 260 L100 320 C100 335 115 340 120 340 C125 340 140 335 140 320 L140 260 Z" fill="white" stroke="#06038D" strokeWidth="2"/>
      <rect x="105" y="290" width="30" height="30" rx="2" fill="#E87722" opacity="0.3"/>
      <rect x="108" y="250" width="24" height="15" rx="2" fill="#94A3B8"/>
      {/* Test tubes */}
      <rect x="280" y="280" width="10" height="60" rx="5" fill="white" stroke="#06038D" strokeWidth="1.5"/>
      <rect x="283" y="310" width="4" height="25" rx="2" fill="#E87722" opacity="0.5"/>
      <rect x="295" y="290" width="10" height="50" rx="5" fill="white" stroke="#06038D" strokeWidth="1.5"/>
      <rect x="298" y="315" width="4" height="20" rx="2" fill="#7C3AED" opacity="0.5"/>
      {/* Decorative molecules */}
      <circle cx="80" cy="80" r="8" fill="#E87722" opacity="0.2"/>
      <circle cx="100" cy="65" r="5" fill="#06038D" opacity="0.2"/>
      <line x1="80" y1="80" x2="100" y2="65" stroke="#94A3B8" strokeWidth="1" opacity="0.3"/>
      <circle cx="520" cy="60" r="6" fill="#7C3AED" opacity="0.2"/>
      <circle cx="540" cy="80" r="4" fill="#E87722" opacity="0.2"/>
      <line x1="520" y1="60" x2="540" y2="80" stroke="#94A3B8" strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}

function IllustrationDevice() {
  return (
    <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-illustration">
      <rect width="500" height="400" rx="16" fill="#F1F5F9"/>
      {/* Main analyzer body */}
      <rect x="100" y="80" width="300" height="240" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
      {/* Screen */}
      <rect x="130" y="100" width="160" height="100" rx="6" fill="#06038D"/>
      <rect x="140" y="110" width="60" height="30" rx="3" fill="#1E40AF"/>
      <rect x="210" y="110" width="60" height="30" rx="3" fill="#1E40AF"/>
      <rect x="140" y="150" width="130" height="8" rx="2" fill="#3B82F6"/>
      <rect x="140" y="165" width="90" height="8" rx="2" fill="#60A5FA"/>
      <rect x="140" y="180" width="110" height="8" rx="2" fill="#3B82F6"/>
      {/* Control panel */}
      <circle cx="340" cy="130" r="15" fill="#E87722"/>
      <circle cx="340" cy="130" r="8" fill="#F59E0B"/>
      <rect x="320" y="160" width="40" height="10" rx="5" fill="#94A3B8"/>
      <rect x="320" y="180" width="40" height="10" rx="5" fill="#94A3B8"/>
      {/* Sample tray */}
      <rect x="130" y="220" width="240" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5"/>
      {/* Sample vials */}
      <rect x="150" y="230" width="12" height="40" rx="6" fill="#E87722" opacity="0.7"/>
      <rect x="170" y="230" width="12" height="40" rx="6" fill="#06038D" opacity="0.7"/>
      <rect x="190" y="230" width="12" height="40" rx="6" fill="#7C3AED" opacity="0.7"/>
      <rect x="210" y="230" width="12" height="40" rx="6" fill="#059669" opacity="0.7"/>
      <rect x="230" y="230" width="12" height="40" rx="6" fill="#E87722" opacity="0.5"/>
      <rect x="250" y="230" width="12" height="40" rx="6" fill="#06038D" opacity="0.5"/>
      <rect x="270" y="230" width="12" height="40" rx="6" fill="#7C3AED" opacity="0.5"/>
      <rect x="290" y="230" width="12" height="40" rx="6" fill="#059669" opacity="0.5"/>
      {/* Base */}
      <rect x="80" y="320" width="340" height="15" rx="4" fill="#CBD5E1"/>
      {/* Status LED */}
      <circle cx="155" cy="340" r="4" fill="#059669"/>
      <text x="165" y="344" fontSize="10" fill="#64748B" fontFamily="sans-serif">Ready</text>
    </svg>
  );
}

function IllustrationGlobe() {
  return (
    <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-illustration">
      <rect width="500" height="400" rx="16" fill="#F1F5F9"/>
      {/* Globe */}
      <circle cx="250" cy="200" r="130" fill="#06038D" opacity="0.05"/>
      <circle cx="250" cy="200" r="130" stroke="#06038D" strokeWidth="2" fill="none"/>
      {/* Latitude lines */}
      <ellipse cx="250" cy="200" rx="130" ry="40" stroke="#06038D" strokeWidth="1" opacity="0.3" fill="none"/>
      <ellipse cx="250" cy="200" rx="130" ry="80" stroke="#06038D" strokeWidth="1" opacity="0.3" fill="none"/>
      {/* Longitude lines */}
      <ellipse cx="250" cy="200" rx="40" ry="130" stroke="#06038D" strokeWidth="1" opacity="0.3" fill="none"/>
      <ellipse cx="250" cy="200" rx="80" ry="130" stroke="#06038D" strokeWidth="1" opacity="0.3" fill="none"/>
      <line x1="120" y1="200" x2="380" y2="200" stroke="#06038D" strokeWidth="1" opacity="0.3"/>
      <line x1="250" y1="70" x2="250" y2="330" stroke="#06038D" strokeWidth="1" opacity="0.3"/>
      {/* Location pins */}
      <circle cx="200" cy="160" r="8" fill="#E87722"/>
      <circle cx="200" cy="160" r="4" fill="white"/>
      <circle cx="290" cy="180" r="8" fill="#E87722"/>
      <circle cx="290" cy="180" r="4" fill="white"/>
      <circle cx="320" cy="220" r="8" fill="#E87722"/>
      <circle cx="320" cy="220" r="4" fill="white"/>
      <circle cx="180" cy="230" r="8" fill="#E87722"/>
      <circle cx="180" cy="230" r="4" fill="white"/>
      <circle cx="260" cy="140" r="8" fill="#E87722"/>
      <circle cx="260" cy="140" r="4" fill="white"/>
      <circle cx="220" cy="260" r="6" fill="#7C3AED"/>
      <circle cx="220" cy="260" r="3" fill="white"/>
      <circle cx="310" cy="150" r="6" fill="#7C3AED"/>
      <circle cx="310" cy="150" r="3" fill="white"/>
      {/* Connection lines */}
      <line x1="200" y1="160" x2="290" y2="180" stroke="#E87722" strokeWidth="1" opacity="0.4" strokeDasharray="4"/>
      <line x1="290" y1="180" x2="320" y2="220" stroke="#E87722" strokeWidth="1" opacity="0.4" strokeDasharray="4"/>
      <line x1="200" y1="160" x2="180" y2="230" stroke="#E87722" strokeWidth="1" opacity="0.4" strokeDasharray="4"/>
      <line x1="260" y1="140" x2="290" y2="180" stroke="#E87722" strokeWidth="1" opacity="0.4" strokeDasharray="4"/>
      {/* 120+ countries text */}
      <text x="250" y="370" textAnchor="middle" fontSize="14" fill="#06038D" fontWeight="bold" fontFamily="sans-serif">120+ Countries</text>
    </svg>
  );
}

function IllustrationInnovation() {
  return (
    <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-illustration">
      <rect width="500" height="400" rx="16" fill="#F1F5F9"/>
      {/* DNA Double Helix */}
      <path d="M150 80 C200 120 200 160 150 200 C100 240 100 280 150 320" stroke="#06038D" strokeWidth="3" fill="none"/>
      <path d="M200 80 C150 120 150 160 200 200 C250 240 250 280 200 320" stroke="#E87722" strokeWidth="3" fill="none"/>
      {/* Helix connectors */}
      <line x1="157" y1="100" x2="193" y2="100" stroke="#94A3B8" strokeWidth="2"/>
      <line x1="150" y1="140" x2="200" y2="140" stroke="#94A3B8" strokeWidth="2"/>
      <line x1="152" y1="180" x2="198" y2="180" stroke="#94A3B8" strokeWidth="2"/>
      <line x1="150" y1="220" x2="200" y2="220" stroke="#94A3B8" strokeWidth="2"/>
      <line x1="155" y1="260" x2="195" y2="260" stroke="#94A3B8" strokeWidth="2"/>
      <line x1="152" y1="300" x2="198" y2="300" stroke="#94A3B8" strokeWidth="2"/>
      {/* Microscope */}
      <rect x="320" y="250" width="80" height="12" rx="6" fill="#1E293B"/>
      <rect x="345" y="150" width="30" height="100" rx="4" fill="#64748B"/>
      <rect x="340" y="140" width="40" height="20" rx="4" fill="#1E293B"/>
      <circle cx="360" cy="135" r="20" stroke="#06038D" strokeWidth="3" fill="none"/>
      <circle cx="360" cy="135" r="12" fill="#06038D" opacity="0.1"/>
      <rect x="350" y="262" width="20" height="50" rx="3" fill="#475569"/>
      <rect x="330" y="310" width="60" height="8" rx="4" fill="#1E293B"/>
      {/* Data chart */}
      <rect x="280" y="50" width="180" height="80" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
      <rect x="295" y="100" width="15" height="20" rx="2" fill="#06038D" opacity="0.6" transform="rotate(180 302 110)"/>
      <rect x="320" y="85" width="15" height="35" rx="2" fill="#06038D" opacity="0.8" transform="rotate(180 327 102)"/>
      <rect x="345" y="75" width="15" height="45" rx="2" fill="#E87722" transform="rotate(180 352 97)"/>
      <rect x="370" y="80" width="15" height="40" rx="2" fill="#06038D" opacity="0.8" transform="rotate(180 377 100)"/>
      <rect x="395" y="70" width="15" height="50" rx="2" fill="#059669" transform="rotate(180 402 95)"/>
      {/* Floating atoms */}
      <circle cx="80" cy="100" r="12" stroke="#7C3AED" strokeWidth="2" fill="none" opacity="0.5"/>
      <circle cx="80" cy="100" r="3" fill="#7C3AED" opacity="0.5"/>
      <circle cx="440" cy="300" r="10" stroke="#E87722" strokeWidth="2" fill="none" opacity="0.5"/>
      <circle cx="440" cy="300" r="3" fill="#E87722" opacity="0.5"/>
    </svg>
  );
}

/* -- Data ----------------------------------------------------------------- */

const stats = [
  { value: 5000, suffix: "+", label: "Hospitales" },
  { value: 30000, suffix: "+", label: "Laboratorios" },
  { value: 120, suffix: "+", label: "Pa\u00edses" },
  { value: 7000, suffix: "+", label: "Empleados" },
];

const solutions = [
  {
    icon: "\ud83e\uddec",
    title: "Hemostasia",
    desc: "L\u00edder mundial en diagn\u00f3stico de la coagulaci\u00f3n y hemostasia con tecnolog\u00eda de vanguardia.",
    color: "#06038D",
  },
  {
    icon: "\ud83d\udd2c",
    title: "Diagn\u00f3stico In Vitro",
    desc: "Soluciones integrales de an\u00e1lisis cl\u00ednico con automatizaci\u00f3n de laboratorio avanzada.",
    color: "#E87722",
  },
  {
    icon: "\ud83c\udfe5",
    title: "Atenci\u00f3n al Paciente",
    desc: "Dispositivos de point-of-care para decisiones cl\u00ednicas r\u00e1pidas y precisas.",
    color: "#059669",
  },
  {
    icon: "\ud83e\udd16",
    title: "Automatizaci\u00f3n",
    desc: "Sistemas rob\u00f3ticos y middleware para flujos de trabajo de laboratorio eficientes.",
    color: "#7C3AED",
  },
];

const values = [
  { icon: "\ud83c\udfaf", title: "Innovaci\u00f3n", desc: "Inversi\u00f3n continua en I+D para avanzar el diagn\u00f3stico" },
  { icon: "\ud83c\udf0d", title: "Global", desc: "Presencia en m\u00e1s de 120 pa\u00edses con soporte local" },
  { icon: "\u26a1", title: "Precisi\u00f3n", desc: "Est\u00e1ndares de calidad superiores en cada producto" },
  { icon: "\ud83e\udd1d", title: "Compromiso", desc: "Dedicados a mejorar la vida de los pacientes" },
];

const certifications = [
  "ISO 13485", "CE Mark", "FDA Cleared", "GMP Certified", "ISO 9001", "IVDR Compliant",
];

const timelineData = [
  { year: "1966", event: "Fundaci\u00f3n en Barcelona, Espa\u00f1a" },
  { year: "1981", event: "Adquisici\u00f3n de Instrumentation Laboratory" },
  { year: "2003", event: "Expansi\u00f3n global en 100+ pa\u00edses" },
  { year: "2015", event: "L\u00edder mundial en Hemostasia" },
  { year: "2024", event: "Transformaci\u00f3n digital e IA en diagn\u00f3stico" },
];

/* -- Hero Section --------------------------------------------------------- */

function HeroSection() {
  const heroRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { reduceMotion } = context.conditions;
        if (reduceMotion) {
          gsap.set(".lp-hero__text > *", { autoAlpha: 1 });
          return;
        }

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".lp-hero__tag", { autoAlpha: 0, x: -30, duration: 0.6 })
          .from(".lp-hero__heading", { autoAlpha: 0, y: 40, duration: 0.8 }, "-=0.3")
          .from(".lp-hero__desc", { autoAlpha: 0, y: 20, duration: 0.6 }, "-=0.4")
          .from(".lp-hero__cta-btn", { autoAlpha: 0, y: 20, scale: 0.9, duration: 0.5, ease: "back.out(2)" }, "-=0.3")
          .from(".lp-hero__image", { autoAlpha: 0, x: 60, duration: 1, ease: "power2.out" }, "-=0.8");
      }
    );
  }, { scope: heroRef });

  return (
    <section className="lp-hero" ref={heroRef}>
      <div className="lp-hero__accent-line"></div>
      <div className="lp-container lp-hero__inner">
        <div className="lp-hero__text">
          <span className="lp-hero__tag">ABOUT WERFEN</span>
          <h1 className="lp-hero__heading">Powering Patient<br />Care</h1>
          <div className="lp-hero__divider"></div>
          <p className="lp-hero__desc">
            In everything we do, we use our passion and long-term vision to develop meaningful
            innovations that truly enhance patient care and help create healthier societies worldwide.
          </p>
          <a href="#solutions" className="lp-hero__cta-btn">ABOUT WERFEN</a>
        </div>
        <div className="lp-hero__image">
          <IllustrationLab />
          <div className="lp-hero__image-overlay"></div>
        </div>
      </div>
    </section>
  );
}

/* -- Announcement Bar ----------------------------------------------------- */

function AnnouncementBar() {
  const barRef = useRef(null);

  useGSAP(() => {
    gsap.from(".lp-announce__content", {
      autoAlpha: 0, y: 30, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: barRef.current, start: "top 85%", once: true },
    });
  }, { scope: barRef });

  return (
    <section className="lp-announce" ref={barRef}>
      <div className="lp-container">
        <div className="lp-announce__content">
          <h2 className="lp-announce__title">Omixon is now part of Werfen.</h2>
          <p className="lp-announce__text">
            On October 16, 2024, Werfen completed the acquisition of Omixon, a privately held company
            based in Budapest, Hungary, focused on the development and commercialization of Next Generation
            Sequencing (NGS) technologies in transplant diagnostics.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -- Stats Section -------------------------------------------------------- */

function StatsSection() {
  const statsRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const counters = gsap.utils.toArray(".lp-stat__number");
      counters.forEach((el) => {
        const target = parseInt(el.dataset.value, 10);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 2, ease: "power2.out",
          snap: { val: 1 },
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => { el.textContent = obj.val.toLocaleString() + (el.dataset.suffix || ""); },
        });
      });

      gsap.from(".lp-stat", {
        autoAlpha: 0, y: 30, stagger: 0.15, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: statsRef.current, start: "top 85%", once: true },
      });
    });
  }, { scope: statsRef });

  return (
    <section className="lp-stats" ref={statsRef}>
      <div className="lp-container">
        <div className="lp-stats__grid">
          {stats.map((s) => (
            <div className="lp-stat" key={s.label}>
              <div className="lp-stat__number" data-value={s.value} data-suffix={s.suffix}>0</div>
              <div className="lp-stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- Solutions Section ---------------------------------------------------- */

function SolutionsSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".lp-solutions__header > *", {
        autoAlpha: 0, y: 30, stagger: 0.15, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });

      ScrollTrigger.batch(".lp-solution-card", {
        onEnter: (batch) => {
          gsap.from(batch, {
            autoAlpha: 0, y: 50, scale: 0.95,
            stagger: 0.12, duration: 0.7, ease: "back.out(1.4)",
          });
        },
        start: "top 85%", once: true,
      });
    });
  }, { scope: sectionRef });

  return (
    <section className="lp-solutions" id="solutions" ref={sectionRef}>
      <div className="lp-container">
        <div className="lp-solutions__header">
          <span className="lp-section-tag">OUR SOLUTIONS</span>
          <h2 className="lp-section-title">Specialized Diagnostic<br />Solutions</h2>
          <p className="lp-section-desc">
            World-leading solutions in hemostasis, acute care, and autoimmunity for
            laboratories and healthcare centers worldwide.
          </p>
        </div>
        <div className="lp-solutions__grid">
          {solutions.map((sol) => (
            <div key={sol.title} className="lp-solution-card" style={{ "--accent": sol.color }}>
              <div className="lp-solution-card__icon">{sol.icon}</div>
              <h3 className="lp-solution-card__title">{sol.title}</h3>
              <p className="lp-solution-card__desc">{sol.desc}</p>
              <div className="lp-solution-card__line"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- Innovation Section (Image + Text Split) ------------------------------ */

function InnovationSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".lp-innovation__image", {
        autoAlpha: 0, x: -50, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });
      gsap.from(".lp-innovation__text > *", {
        autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });
    });
  }, { scope: sectionRef });

  return (
    <section className="lp-innovation" ref={sectionRef}>
      <div className="lp-container lp-innovation__inner">
        <div className="lp-innovation__image">
          <IllustrationInnovation />
        </div>
        <div className="lp-innovation__text">
          <span className="lp-section-tag">INNOVATION & R&D</span>
          <h2 className="lp-section-title">Advancing Diagnostic Science</h2>
          <p className="lp-section-desc">
            With over 50 years of experience, Werfen continues to invest in cutting-edge research
            and development to push the boundaries of diagnostic technology.
          </p>
          <ul className="lp-innovation__list">
            <li>Continuous investment in R&D</li>
            <li>Next-generation diagnostic platforms</li>
            <li>AI-powered clinical analytics</li>
            <li>Integrated workflow solutions</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -- Global Presence Section ---------------------------------------------- */

function GlobalSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".lp-global__text > *", {
        autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });
      gsap.from(".lp-global__image", {
        autoAlpha: 0, x: 50, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });
    });
  }, { scope: sectionRef });

  return (
    <section className="lp-global" ref={sectionRef}>
      <div className="lp-container lp-global__inner">
        <div className="lp-global__text">
          <span className="lp-section-tag">GLOBAL PRESENCE</span>
          <h2 className="lp-section-title">Worldwide Impact</h2>
          <p className="lp-section-desc">
            With direct operations in more than 30 countries and a presence in over 120,
            Werfen provides local support with global expertise to healthcare professionals everywhere.
          </p>
        </div>
        <div className="lp-global__image">
          <IllustrationGlobe />
        </div>
      </div>
    </section>
  );
}

/* -- Products Section ----------------------------------------------------- */

function ProductsSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".lp-products__header > *", {
        autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });
      gsap.from(".lp-products__image", {
        autoAlpha: 0, scale: 0.9, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: ".lp-products__image", start: "top 80%", once: true },
      });
    });
  }, { scope: sectionRef });

  return (
    <section className="lp-products" ref={sectionRef}>
      <div className="lp-container">
        <div className="lp-products__header">
          <span className="lp-section-tag">OUR PRODUCTS</span>
          <h2 className="lp-section-title">State-of-the-Art Analyzers</h2>
          <p className="lp-section-desc">
            Our comprehensive portfolio of diagnostic analyzers delivers accurate, reliable
            results that healthcare professionals trust every day.
          </p>
        </div>
        <div className="lp-products__image">
          <IllustrationDevice />
        </div>
      </div>
    </section>
  );
}

/* -- Timeline Section ----------------------------------------------------- */

function TimelineSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".lp-timeline__line", {
        scaleY: 0, transformOrigin: "top center", ease: "none",
        scrollTrigger: {
          trigger: ".lp-timeline__track",
          start: "top 80%", end: "bottom 60%", scrub: 1,
        },
      });

      gsap.utils.toArray(".lp-timeline__item").forEach((item) => {
        gsap.from(item, {
          autoAlpha: 0, x: -30, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: item, start: "top 85%", once: true },
        });
        const dot = item.querySelector(".lp-timeline__dot");
        if (dot) {
          gsap.from(dot, {
            scale: 0, duration: 0.4, ease: "back.out(3)",
            scrollTrigger: { trigger: item, start: "top 85%", once: true },
          });
        }
      });
    });
  }, { scope: sectionRef });

  return (
    <section className="lp-timeline" ref={sectionRef}>
      <div className="lp-container">
        <div className="lp-timeline__header">
          <span className="lp-section-tag">OUR HISTORY</span>
          <h2 className="lp-section-title">60 Years of Innovation</h2>
        </div>
        <div className="lp-timeline__track">
          <div className="lp-timeline__line"></div>
          {timelineData.map((t) => (
            <div key={t.year} className="lp-timeline__item">
              <div className="lp-timeline__dot"></div>
              <div className="lp-timeline__content">
                <span className="lp-timeline__year">{t.year}</span>
                <p className="lp-timeline__event">{t.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- Certifications Section ----------------------------------------------- */

function CertificationsSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.batch(".lp-cert-badge", {
        onEnter: (batch) => {
          gsap.from(batch, {
            autoAlpha: 0, scale: 0.8, y: 20,
            stagger: 0.08, duration: 0.5, ease: "back.out(2)",
          });
        },
        start: "top 88%", once: true,
      });
    });
  }, { scope: sectionRef });

  return (
    <section className="lp-certs" ref={sectionRef}>
      <div className="lp-container">
        <div className="lp-certs__header">
          <span className="lp-section-tag">CERTIFICATIONS</span>
          <h2 className="lp-section-title">Quality Assured</h2>
        </div>
        <div className="lp-certs__grid">
          {certifications.map((c) => (
            <div key={c} className="lp-cert-badge">
              <div className="lp-cert-badge__shield">{"\ud83d\udee1\ufe0f"}</div>
              <span className="lp-cert-badge__text">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- CTA Section ---------------------------------------------------------- */

function CTASection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".lp-cta__content > *", {
        autoAlpha: 0, y: 30, stagger: 0.15, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });
    });
  }, { scope: sectionRef });

  return (
    <section className="lp-cta" ref={sectionRef}>
      <div className="lp-container">
        <div className="lp-cta__content">
          <h2>Ready to transform your laboratory?</h2>
          <p>Discover how Werfen can help improve clinical outcomes at your institution.</p>
          <div className="lp-cta__buttons">
            <a href="https://www.werfen.com" className="lp-btn lp-btn--primary" target="_blank" rel="noopener noreferrer">
              CONTACT SALES
            </a>
            <a href="/" className="lp-btn lp-btn--outline">
              VIEW DEVOPS DASHBOARD
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -- Main Page ------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <Layout
      title="Werfen \u2014 Powering Patient Care"
      description="Werfen is a global leader in specialized diagnostics: hemostasis, acute care, and autoimmunity."
    >
      <main className="lp-main">
        <HeroSection />
        <AnnouncementBar />
        <StatsSection />
        <SolutionsSection />
        <InnovationSection />
        <GlobalSection />
        <ProductsSection />
        <TimelineSection />
        <CertificationsSection />
        <CTASection />
      </main>
    </Layout>
  );
}
'''

with open(os.path.join(BASE, 'landing.js'), 'w', encoding='utf-8') as f:
    f.write(js_content.lstrip('\n'))
print(f"[OK] landing.js written ({os.path.getsize(os.path.join(BASE, 'landing.js'))} bytes)")

# ─── landing.css ────────────────────────────────────────────────────────────

css_content = r'''/* ========================================================================== */
/* WERFEN LANDING PAGE — Corporate Style (matches werfen.com)                 */
/* Navy + Orange, clean layout, professional imagery                          */
/* ========================================================================== */

/* -- Design Tokens -------------------------------------------------------- */

.lp-main {
  --lp-navy: #06038D;
  --lp-navy-dark: #020156;
  --lp-navy-light: #1A0FC0;
  --lp-orange: #E87722;
  --lp-orange-hover: #D06010;
  --lp-accent: #7C3AED;
  --lp-success: #059669;
  --lp-text: #1E293B;
  --lp-text-muted: #64748B;
  --lp-text-light: #94A3B8;
  --lp-bg: #FFFFFF;
  --lp-bg-alt: #F8FAFC;
  --lp-card: #FFFFFF;
  --lp-border: #E2E8F0;

  --lp-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --lp-duration: 300ms;
  --lp-section-py: 5rem;
  --lp-container-max: 1200px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
  color: var(--lp-text);
  background: var(--lp-bg);
}

[data-theme='dark'] .lp-main {
  --lp-text: #F1F5F9;
  --lp-text-muted: #94A3B8;
  --lp-bg: #0F172A;
  --lp-bg-alt: #1E293B;
  --lp-card: #1E293B;
  --lp-border: #334155;
}

/* -- Container ------------------------------------------------------------ */

.lp-container {
  max-width: var(--lp-container-max);
  margin: 0 auto;
  padding: 0 2rem;
}

/* -- Buttons -------------------------------------------------------------- */

.lp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  transition: all var(--lp-duration) var(--lp-ease);
  cursor: pointer;
  border: 2px solid transparent;
}

.lp-btn--primary {
  background: var(--lp-orange);
  color: #fff;
  border-color: var(--lp-orange);
}

.lp-btn--primary:hover {
  background: var(--lp-orange-hover);
  border-color: var(--lp-orange-hover);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 119, 34, 0.3);
}

.lp-btn--outline {
  background: transparent;
  color: var(--lp-navy);
  border-color: var(--lp-navy);
}

.lp-btn--outline:hover {
  background: var(--lp-navy);
  color: #fff;
  transform: translateY(-2px);
}

[data-theme='dark'] .lp-btn--outline {
  color: #fff;
  border-color: #fff;
}

[data-theme='dark'] .lp-btn--outline:hover {
  background: #fff;
  color: var(--lp-navy);
}

/* -- Section Tag & Title -------------------------------------------------- */

.lp-section-tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--lp-orange);
  margin-bottom: 0.75rem;
}

.lp-section-title {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  font-weight: 300;
  color: var(--lp-navy);
  line-height: 1.2;
  margin: 0 0 1rem 0;
  letter-spacing: -0.01em;
}

[data-theme='dark'] .lp-section-title {
  color: #fff;
}

.lp-section-desc {
  font-size: 1rem;
  color: var(--lp-text-muted);
  max-width: 550px;
  line-height: 1.7;
  margin: 0;
}

/* -- HERO SECTION --------------------------------------------------------- */

.lp-hero {
  position: relative;
  background: var(--lp-bg);
  overflow: hidden;
}

.lp-hero__accent-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--lp-orange);
}

.lp-hero__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  min-height: 85vh;
  gap: 3rem;
}

.lp-hero__text {
  padding: 4rem 0;
}

.lp-hero__tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--lp-orange);
  margin-bottom: 1.5rem;
  visibility: hidden;
}

.lp-hero__heading {
  font-size: clamp(2.5rem, 5vw, 3.8rem);
  font-weight: 300;
  color: var(--lp-navy);
  line-height: 1.1;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.02em;
  visibility: hidden;
}

[data-theme='dark'] .lp-hero__heading {
  color: #fff;
}

.lp-hero__divider {
  width: 60px;
  height: 3px;
  background: var(--lp-navy);
  margin-bottom: 1.5rem;
}

[data-theme='dark'] .lp-hero__divider {
  background: var(--lp-orange);
}

.lp-hero__desc {
  font-size: 1.05rem;
  color: var(--lp-text-muted);
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 480px;
  visibility: hidden;
}

.lp-hero__cta-btn {
  display: inline-block;
  padding: 14px 32px;
  background: var(--lp-orange);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-decoration: none;
  border-radius: 4px;
  transition: all var(--lp-duration) var(--lp-ease);
  visibility: hidden;
}

.lp-hero__cta-btn:hover {
  background: var(--lp-orange-hover);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 119, 34, 0.3);
}

.lp-hero__image {
  position: relative;
  visibility: hidden;
}

.lp-hero__image .lp-illustration {
  width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

.lp-hero__image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
  border-radius: 16px;
  pointer-events: none;
}

/* -- ANNOUNCEMENT BAR ----------------------------------------------------- */

.lp-announce {
  background: var(--lp-navy);
  padding: 3.5rem 2rem;
  text-align: center;
}

.lp-announce__content {
  max-width: 800px;
  margin: 0 auto;
}

.lp-announce__title {
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  font-weight: 300;
  color: #fff;
  margin: 0 0 1rem;
}

.lp-announce__text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  font-style: italic;
  margin: 0;
}

/* -- STATS SECTION -------------------------------------------------------- */

.lp-stats {
  padding: 3rem 0;
  background: var(--lp-bg-alt);
  border-top: 1px solid var(--lp-border);
  border-bottom: 1px solid var(--lp-border);
}

.lp-stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  text-align: center;
}

.lp-stat { padding: 1rem; }

.lp-stat__number {
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--lp-navy);
  line-height: 1;
  margin-bottom: 0.5rem;
}

[data-theme='dark'] .lp-stat__number {
  color: var(--lp-orange);
}

.lp-stat__label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--lp-text-muted);
}

/* -- SOLUTIONS SECTION ---------------------------------------------------- */

.lp-solutions {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg);
}

.lp-solutions__header {
  text-align: center;
  margin-bottom: 3rem;
}

.lp-solutions__header .lp-section-desc {
  margin: 0 auto;
}

.lp-solutions__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.lp-solution-card {
  position: relative;
  background: var(--lp-card);
  border: 1px solid var(--lp-border);
  border-radius: 8px;
  padding: 2rem;
  transition: all var(--lp-duration) var(--lp-ease);
  overflow: hidden;
}

.lp-solution-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent, var(--lp-orange));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--lp-duration) var(--lp-ease);
}

.lp-solution-card:hover::before { transform: scaleX(1); }

.lp-solution-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(6, 3, 141, 0.08);
  border-color: transparent;
}

.lp-solution-card__icon {
  font-size: 2.2rem;
  margin-bottom: 1rem;
}

.lp-solution-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--lp-text);
  margin: 0 0 0.5rem 0;
}

.lp-solution-card__desc {
  font-size: 0.88rem;
  color: var(--lp-text-muted);
  line-height: 1.6;
  margin: 0;
}

.lp-solution-card__line {
  position: absolute;
  bottom: 0;
  left: 2rem;
  right: 2rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent, var(--lp-orange)), transparent);
  opacity: 0;
  transition: opacity var(--lp-duration);
}

.lp-solution-card:hover .lp-solution-card__line { opacity: 1; }

/* -- INNOVATION SECTION --------------------------------------------------- */

.lp-innovation {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg-alt);
}

.lp-innovation__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.lp-innovation__image .lp-illustration {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.lp-innovation__list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
}

.lp-innovation__list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: var(--lp-text-muted);
  font-size: 0.95rem;
}

.lp-innovation__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--lp-orange);
  transform: translateY(-50%);
}

/* -- GLOBAL SECTION ------------------------------------------------------- */

.lp-global {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg);
}

.lp-global__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.lp-global__image .lp-illustration {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

/* -- PRODUCTS SECTION ----------------------------------------------------- */

.lp-products {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg-alt);
}

.lp-products__header {
  text-align: center;
  margin-bottom: 3rem;
}

.lp-products__header .lp-section-desc {
  margin: 0 auto;
}

.lp-products__image {
  max-width: 700px;
  margin: 0 auto;
}

.lp-products__image .lp-illustration {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
}

/* -- TIMELINE SECTION ----------------------------------------------------- */

.lp-timeline {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg);
}

.lp-timeline__header {
  text-align: center;
  margin-bottom: 3rem;
}

.lp-timeline__track {
  position: relative;
  max-width: 700px;
  margin: 0 auto;
  padding-left: 40px;
}

.lp-timeline__line {
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--lp-navy), var(--lp-orange));
  border-radius: 1px;
  will-change: transform;
}

.lp-timeline__item {
  position: relative;
  padding: 1.5rem 0 1.5rem 2rem;
}

.lp-timeline__dot {
  position: absolute;
  left: -33px;
  top: 1.8rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--lp-orange);
  border: 3px solid var(--lp-bg);
  box-shadow: 0 0 0 2px var(--lp-orange);
  will-change: transform;
}

.lp-timeline__content {
  background: var(--lp-card);
  border: 1px solid var(--lp-border);
  border-radius: 8px;
  padding: 1.2rem 1.5rem;
  transition: all var(--lp-duration) var(--lp-ease);
}

.lp-timeline__item:hover .lp-timeline__content {
  box-shadow: 0 4px 12px rgba(6, 3, 141, 0.06);
  transform: translateX(4px);
}

.lp-timeline__year {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--lp-orange);
}

.lp-timeline__event {
  font-size: 0.95rem;
  color: var(--lp-text);
  margin: 0.3rem 0 0;
  font-weight: 500;
}

/* -- CERTIFICATIONS SECTION ----------------------------------------------- */

.lp-certs {
  padding: var(--lp-section-py) 0;
  background: var(--lp-bg-alt);
}

.lp-certs__header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.lp-certs__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.lp-cert-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  border-radius: 8px;
  background: var(--lp-card);
  border: 1px solid var(--lp-border);
  transition: all var(--lp-duration) var(--lp-ease);
  text-align: center;
}

.lp-cert-badge:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(6, 3, 141, 0.06);
  border-color: var(--lp-orange);
}

.lp-cert-badge__shield { font-size: 1.8rem; }

.lp-cert-badge__text {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--lp-text);
  letter-spacing: 0.02em;
}

/* -- CTA SECTION ---------------------------------------------------------- */

.lp-cta {
  padding: 4rem 2rem;
  background: var(--lp-navy);
  text-align: center;
}

.lp-cta__content {
  max-width: 600px;
  margin: 0 auto;
}

.lp-cta__content h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 300;
  color: #fff;
  margin: 0 0 1rem;
}

.lp-cta__content p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.lp-cta__buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.lp-cta .lp-btn--outline {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
}

.lp-cta .lp-btn--outline:hover {
  background: #fff;
  color: var(--lp-navy);
  border-color: #fff;
}

/* -- Illustrations -------------------------------------------------------- */

.lp-illustration {
  display: block;
}

/* -- RESPONSIVE ----------------------------------------------------------- */

@media (max-width: 1024px) {
  .lp-hero__inner {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  .lp-hero__image { display: none; }
  .lp-hero__text { padding: 6rem 0 4rem; }
  .lp-innovation__inner,
  .lp-global__inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .lp-main { --lp-section-py: 3.5rem; }
  .lp-stats__grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  .lp-hero__text { padding: 4rem 0 3rem; }
  .lp-hero__heading { font-size: 2.2rem; }
  .lp-solutions__grid { grid-template-columns: 1fr; }
  .lp-certs__grid { grid-template-columns: repeat(2, 1fr); }
  .lp-timeline__track { padding-left: 30px; }
  .lp-cta__buttons { flex-direction: column; align-items: center; }
}

@media (max-width: 480px) {
  .lp-stats__grid { grid-template-columns: repeat(2, 1fr); }
  .lp-certs__grid { grid-template-columns: 1fr 1fr; }
}

/* -- Reduced motion ------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .lp-hero__tag,
  .lp-hero__heading,
  .lp-hero__desc,
  .lp-hero__cta-btn,
  .lp-hero__image {
    visibility: visible !important;
  }
  * {
    transition-duration: 0.01ms !important;
  }
}
'''

with open(os.path.join(BASE, 'landing.css'), 'w', encoding='utf-8') as f:
    f.write(css_content.lstrip('\n'))
print(f"[OK] landing.css written ({os.path.getsize(os.path.join(BASE, 'landing.css'))} bytes)")

# Cleanup self
os.remove(os.path.join(BASE, '_build_landing.py'))
print("[OK] Temp script removed")
