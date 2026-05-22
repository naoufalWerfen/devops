#!/usr/bin/env python3
"""Write landing2.js - Academia Santa Cruz with GSAP ScrollTrigger."""
import os

JS = r'''import React, { useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './landing2.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Data ─────────────────────────────────────────────────────────────────── */

const stats = [
  { value: '320', suffix: 'h', label: 'Formación' },
  { value: '100', suffix: '%', label: 'Práctico' },
  { value: '4', suffix: ' meses', label: 'Duración' },
  { value: '10', suffix: '+', label: 'Años Exp.' },
];

const courseModules = [
  {
    icon: '✂️',
    title: 'Degradados',
    desc: 'Desde básicos hasta técnicas avanzadas de fade con máquina y navaja.',
  },
  {
    icon: '💈',
    title: 'Corte de Pelo',
    desc: 'Técnicas clásicas y modernas con tijera, máquina y navaja barbera.',
  },
  {
    icon: '👤',
    title: 'Visagismo',
    desc: 'Análisis facial y diseño de imagen masculina personalizada.',
  },
  {
    icon: '🎨',
    title: 'Colorimetría',
    desc: 'Fundamentos del color, decoloración y técnicas de aplicación.',
  },
  {
    icon: '📱',
    title: 'Redes Sociales',
    desc: 'Marketing personal y cómo captar clientes a través de Instagram.',
  },
  {
    icon: '🧔',
    title: 'Barba & Afeitado',
    desc: 'Perfilado de barba, afeitado a navaja y cuidado facial completo.',
  },
];

const reasons = [
  { icon: '🎯', title: 'Enfoque Práctico', desc: 'Cortarás pelo desde el primer día' },
  { icon: '👨‍🏫', title: 'Profesores en Activo', desc: 'Barberos con experiencia real' },
  { icon: '🏆', title: 'Bolsa de Trabajo', desc: 'Conectamos con las mejores barberías' },
  { icon: '📸', title: 'Portfolio Pro', desc: 'Sesiones fotográficas incluidas' },
  { icon: '👥', title: 'Grupos Reducidos', desc: 'Atención 100% personalizada' },
  { icon: '🤝', title: 'Comunidad Alumni', desc: 'Red de antiguos alumnos activa' },
];

const details = [
  { icon: '📅', label: 'Duración', value: '4 meses' },
  { icon: '⏰', label: 'Horarios', value: 'L-J 10-14h / 15-19h' },
  { icon: '🎒', label: 'Material', value: 'Kit profesional incluido' },
  { icon: '📜', label: 'Certificación', value: 'Diploma acreditativo' },
];

/* ── Main Component ───────────────────────────────────────────────────────── */

export default function Landing2Page() {
  const mainRef = useRef(null);

  useGSAP(() => {
    // ── Hero timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.lp2-hero__badge', { autoAlpha: 0, y: 20, duration: 0.6 })
      .from('.lp2-hero__title', { autoAlpha: 0, y: 40, duration: 0.8 }, '-=0.3')
      .from('.lp2-hero__subtitle', { autoAlpha: 0, y: 30, duration: 0.6 }, '-=0.4')
      .from('.lp2-hero__actions', { autoAlpha: 0, y: 20, duration: 0.5 }, '-=0.3');

    // ── Stats counter animation
    gsap.from('.lp2-stat__number', {
      textContent: 0,
      duration: 2,
      ease: 'power1.out',
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: '.lp2-stats',
        start: 'top 80%',
      },
    });

    // ── Reveal animations with ScrollTrigger.batch
    const reveals = gsap.utils.toArray('.lp2-reveal');
    reveals.forEach((el) => {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        }
      );
    });

    // ── Split image parallax
    gsap.utils.toArray('.lp2-split__image img').forEach((img) => {
      gsap.fromTo(img,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    });

    // ── Course cards stagger
    ScrollTrigger.batch('.lp2-course-card', {
      onEnter: (batch) => gsap.fromTo(batch,
        { autoAlpha: 0, y: 40, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.4)' }
      ),
      start: 'top 85%',
    });

    // ── Gallery items
    ScrollTrigger.batch('.lp2-gallery__item', {
      onEnter: (batch) => gsap.fromTo(batch,
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, stagger: 0.15, duration: 0.7, ease: 'power3.out' }
      ),
      start: 'top 85%',
    });

    // ── Reason cards
    ScrollTrigger.batch('.lp2-reason', {
      onEnter: (batch) => gsap.fromTo(batch,
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }
      ),
      start: 'top 85%',
    });

    // ── CTA section
    gsap.from('.lp2-cta__content', {
      autoAlpha: 0,
      y: 60,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.lp2-cta',
        start: 'top 75%',
      },
    });

  }, { scope: mainRef });

  return (
    <Layout
      title="Academia Santa Cruz — Barbería Profesional"
      description="Formación práctica en barbería profesional en Barcelona. Conviértete en barbero experto con la Academia Santa Cruz."
    >
      <main className="lp2" ref={mainRef}>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="lp2-hero">
          <div className="lp2-hero__bg">
            <img src="/img/landing2/hero.png" alt="Barbero profesional realizando un corte" />
          </div>
          <div className="lp2-hero__overlay"></div>
          <div className="lp2-hero__grain"></div>
          <div className="lp2-container lp2-hero__content">
            <div className="lp2-hero__badge">
              <span className="lp2-hero__badge-dot"></span>
              Molins de Rei, Barcelona
            </div>
            <h1 className="lp2-hero__title">
              Sé el <em>Barbero</em><br />que quieres ser
            </h1>
            <p className="lp2-hero__subtitle">
              En la Academia Santa Cruz te ofrecemos formación 100% práctica con 
              instructores expertos, técnicas modernas y certificación profesional. 
              Da el primer paso hacia tu futuro.
            </p>
            <div className="lp2-hero__actions">
              <a href="#curso" className="lp2-btn lp2-btn--gold">Ver Programas</a>
              <a href="#contacto" className="lp2-btn lp2-btn--outline">Contactar</a>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <section className="lp2-stats">
          <div className="lp2-container">
            <div className="lp2-stats__grid">
              {stats.map((s) => (
                <div key={s.label} className="lp2-stat">
                  <div className="lp2-stat__number">{s.value}{s.suffix}</div>
                  <div className="lp2-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Training Split ────────────────────────────────────────────── */}
        <section className="lp2-split">
          <div className="lp2-container">
            <div className="lp2-split__inner">
              <div className="lp2-split__image lp2-reveal">
                <img src="/img/landing2/training.png" alt="Clase de formación en barbería" />
              </div>
              <div className="lp2-split__content lp2-reveal">
                <span className="lp2-section-tag">Sobre Nosotros</span>
                <h2 className="lp2-section-title">
                  Donde la pasión se<br />convierte en <strong>profesión</strong>
                </h2>
                <p className="lp2-section-desc">
                  Somos más que una academia: somos una comunidad de estilo, formación 
                  y actitud. Ubicados en Molins de Rei, transformamos la barbería 
                  tradicional en una experiencia contemporánea y profesional.
                </p>
                <ul className="lp2-features">
                  <li>Formación personalizada desde el día uno</li>
                  <li>Enfoque 100% práctico con clientes reales</li>
                  <li>Equipo docente con trayectoria reconocida</li>
                  <li>Apoyo constante antes, durante y después</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Course Modules ────────────────────────────────────────────── */}
        <section className="lp2-course" id="curso">
          <div className="lp2-container">
            <div className="lp2-course__header">
              <span className="lp2-section-tag">Programa de Formación</span>
              <h2 className="lp2-section-title">
                Curso de Iniciación a la<br /><strong>Barbería Profesional</strong>
              </h2>
              <p className="lp2-section-desc">
                320 horas de formación práctica y presencial. Aprende con expertos 
                desde el primer día y lánzate al mundo profesional.
              </p>
            </div>
            <div className="lp2-course__grid">
              {courseModules.map((m) => (
                <div key={m.title} className="lp2-course-card">
                  <div className="lp2-course-card__icon">{m.icon}</div>
                  <h3 className="lp2-course-card__title">{m.title}</h3>
                  <p className="lp2-course-card__desc">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gallery ───────────────────────────────────────────────────── */}
        <section className="lp2-gallery">
          <div className="lp2-container">
            <div className="lp2-gallery__header">
              <span className="lp2-section-tag">Nuestro Trabajo</span>
              <h2 className="lp2-section-title">
                Resultados que <strong>hablan</strong>
              </h2>
            </div>
            <div className="lp2-gallery__grid">
              <div className="lp2-gallery__item lp2-gallery__item--wide">
                <img src="/img/landing2/interior.png" alt="Interior de la academia" />
              </div>
              <div className="lp2-gallery__item">
                <img src="/img/landing2/result.png" alt="Resultado de corte profesional" />
              </div>
              <div className="lp2-gallery__item">
                <img src="/img/landing2/tools.png" alt="Herramientas profesionales" />
              </div>
              <div className="lp2-gallery__item">
                <img src="/img/landing2/training.png" alt="Formación práctica" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Reasons ───────────────────────────────────────────────────── */}
        <section className="lp2-reasons">
          <div className="lp2-container">
            <div className="lp2-reasons__inner">
              <div className="lp2-reveal">
                <span className="lp2-section-tag">¿Por qué elegirnos?</span>
                <h2 className="lp2-section-title">
                  10 razones para<br />elegir <strong>Santa Cruz</strong>
                </h2>
                <p className="lp2-section-desc">
                  No solo enseñamos técnica: formamos barberos completos con 
                  visión de negocio, marca personal y una red profesional 
                  que les acompaña toda la carrera.
                </p>
              </div>
              <div className="lp2-reasons__list">
                {reasons.map((r) => (
                  <div key={r.title} className="lp2-reason">
                    <div className="lp2-reason__icon">{r.icon}</div>
                    <h4 className="lp2-reason__title">{r.title}</h4>
                    <p className="lp2-reason__desc">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Details Bar ───────────────────────────────────────────────── */}
        <section className="lp2-details">
          <div className="lp2-container">
            <div className="lp2-details__grid">
              {details.map((d) => (
                <div key={d.label} className="lp2-detail lp2-reveal">
                  <div className="lp2-detail__icon">{d.icon}</div>
                  <div className="lp2-detail__label">{d.label}</div>
                  <div className="lp2-detail__value">{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="lp2-cta" id="contacto">
          <div className="lp2-container">
            <div className="lp2-cta__content">
              <h2 className="lp2-cta__title">
                ¿Listo para<br /><strong>empezar</strong>?
              </h2>
              <p className="lp2-cta__desc">
                Reserva tu plaza ahora y transforma tu pasión en profesión. 
                Plazas limitadas — grupos reducidos para máxima atención.
              </p>
              <div className="lp2-cta__actions">
                <a href="https://academiasantacruz.com/cursos/" className="lp2-btn lp2-btn--gold" target="_blank" rel="noopener noreferrer">
                  Reservar Plaza
                </a>
                <a href="https://academiasantacruz.com/contacto/" className="lp2-btn lp2-btn--outline" target="_blank" rel="noopener noreferrer">
                  Contactar
                </a>
              </div>
              <p className="lp2-cta__phone">
                También puedes llamarnos: <a href="tel:+34613404071">+34 613 40 40 71</a>
              </p>
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="lp2-footer">
          <div className="lp2-container">
            <p className="lp2-footer__text">
              © {new Date().getFullYear()} Academia Santa Cruz — Av. de Barcelona, 118, Molins de Rei, Barcelona
            </p>
            <div className="lp2-footer__socials">
              <a href="https://www.instagram.com/academia_santacruz/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.tiktok.com/@academia_santacruz" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a href="https://www.facebook.com/Santacruz.academia/" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.youtube.com/@AcademiaSantaCruz-ie6tu" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
          </div>
        </footer>
      </main>
    </Layout>
  );
}
'''

target = '/var/www/devops/docusaurus-site/src/pages/landing2.js'
with open(target, 'w') as f:
    f.write(JS.lstrip('\n'))
print(f'Written: {target} ({os.path.getsize(target)} bytes)')
os.remove(os.path.abspath(__file__))
