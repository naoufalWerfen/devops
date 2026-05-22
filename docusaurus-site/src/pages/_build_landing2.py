#!/usr/bin/env python3
"""Rewrite landing2.js with framer-motion + GSAP."""
import os

JS = r'''import React, { useRef } from 'react';
import Layout from '@theme/Layout';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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
  { icon: '\u2702\uFE0F', title: 'Degradados', desc: 'Desde básicos hasta técnicas avanzadas de fade con máquina y navaja.' },
  { icon: '\uD83D\uDC88', title: 'Corte de Pelo', desc: 'Técnicas clásicas y modernas con tijera, máquina y navaja barbera.' },
  { icon: '\uD83D\uDC64', title: 'Visagismo', desc: 'Análisis facial y diseño de imagen masculina personalizada.' },
  { icon: '\uD83C\uDFA8', title: 'Colorimetría', desc: 'Fundamentos del color, decoloración y técnicas de aplicación.' },
  { icon: '\uD83D\uDCF1', title: 'Redes Sociales', desc: 'Marketing personal y cómo captar clientes a través de Instagram.' },
  { icon: '\uD83E\uDDD4', title: 'Barba & Afeitado', desc: 'Perfilado de barba, afeitado a navaja y cuidado facial completo.' },
];

const reasons = [
  { icon: '\uD83C\uDFAF', title: 'Enfoque Práctico', desc: 'Cortarás pelo desde el primer día' },
  { icon: '\uD83D\uDC68\u200D\uD83C\uDFEB', title: 'Profesores en Activo', desc: 'Barberos con experiencia real' },
  { icon: '\uD83C\uDFC6', title: 'Bolsa de Trabajo', desc: 'Conectamos con las mejores barberías' },
  { icon: '\uD83D\uDCF8', title: 'Portfolio Pro', desc: 'Sesiones fotográficas incluidas' },
  { icon: '\uD83D\uDC65', title: 'Grupos Reducidos', desc: 'Atención 100% personalizada' },
  { icon: '\uD83E\uDD1D', title: 'Comunidad Alumni', desc: 'Red de antiguos alumnos activa' },
];

const details = [
  { icon: '\uD83D\uDCC5', label: 'Duración', value: '4 meses' },
  { icon: '\u23F0', label: 'Horarios', value: 'L-J 10-14h / 15-19h' },
  { icon: '\uD83C\uDF92', label: 'Material', value: 'Kit profesional incluido' },
  { icon: '\uD83D\uDCDC', label: 'Certificación', value: 'Diploma acreditativo' },
];

/* ── Framer Motion Variants ───────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── Reusable Components ──────────────────────────────────────────────────── */

function MotionSection({ children, className, id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      className={className}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
    >
      {children}
    </motion.section>
  );
}

function ParallaxImage({ src, alt, className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.img src={src} alt={alt} style={{ y, scale: 1.15 }} />
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export default function Landing2Page() {
  const mainRef = useRef(null);

  useGSAP(() => {
    // ── Hero timeline (GSAP for sequenced entrance)
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.lp2-hero__badge', { autoAlpha: 0, y: 20, duration: 0.6 })
      .from('.lp2-hero__title', { autoAlpha: 0, y: 40, duration: 0.8 }, '-=0.3')
      .from('.lp2-hero__subtitle', { autoAlpha: 0, y: 30, duration: 0.6 }, '-=0.4')
      .from('.lp2-hero__actions', { autoAlpha: 0, y: 20, duration: 0.5 }, '-=0.3');

    // ── Stats counter (GSAP snap animation for numbers)
    gsap.from('.lp2-stat__number', {
      textContent: 0,
      duration: 2,
      ease: 'power1.out',
      snap: { textContent: 1 },
      scrollTrigger: { trigger: '.lp2-stats', start: 'top 80%' },
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
              <motion.a
                href="#curso"
                className="lp2-btn lp2-btn--gold"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(201,168,76,0.4)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                Ver Programas
              </motion.a>
              <motion.a
                href="#contacto"
                className="lp2-btn lp2-btn--outline"
                whileHover={{ scale: 1.05, borderColor: '#C9A84C' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                Contactar
              </motion.a>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <MotionSection className="lp2-stats">
          <div className="lp2-container">
            <div className="lp2-stats__grid">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="lp2-stat"
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="lp2-stat__number">{s.value}{s.suffix}</div>
                  <div className="lp2-stat__label">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </MotionSection>

        {/* ── Training Split ────────────────────────────────────────────── */}
        <MotionSection className="lp2-split">
          <div className="lp2-container">
            <div className="lp2-split__inner">
              <motion.div className="lp2-split__image" variants={slideFromLeft}>
                <ParallaxImage
                  src="/img/landing2/training.png"
                  alt="Clase de formación en barbería"
                  className="lp2-split__image-wrap"
                />
              </motion.div>
              <motion.div className="lp2-split__content" variants={slideFromRight}>
                <span className="lp2-section-tag">Sobre Nosotros</span>
                <h2 className="lp2-section-title">
                  Donde la pasión se<br />convierte en <strong>profesión</strong>
                </h2>
                <p className="lp2-section-desc">
                  Somos más que una academia: somos una comunidad de estilo, formación
                  y actitud. Ubicados en Molins de Rei, transformamos la barbería
                  tradicional en una experiencia contemporánea y profesional.
                </p>
                <motion.ul
                  className="lp2-features"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.li variants={fadeUp} custom={0}>Formación personalizada desde el día uno</motion.li>
                  <motion.li variants={fadeUp} custom={1}>Enfoque 100% práctico con clientes reales</motion.li>
                  <motion.li variants={fadeUp} custom={2}>Equipo docente con trayectoria reconocida</motion.li>
                  <motion.li variants={fadeUp} custom={3}>Apoyo constante antes, durante y después</motion.li>
                </motion.ul>
              </motion.div>
            </div>
          </div>
        </MotionSection>

        {/* ── Course Modules ────────────────────────────────────────────── */}
        <MotionSection className="lp2-course" id="curso">
          <div className="lp2-container">
            <motion.div className="lp2-course__header" variants={fadeUp}>
              <span className="lp2-section-tag">Programa de Formación</span>
              <h2 className="lp2-section-title">
                Curso de Iniciación a la<br /><strong>Barbería Profesional</strong>
              </h2>
              <p className="lp2-section-desc">
                320 horas de formación práctica y presencial. Aprende con expertos
                desde el primer día y lánzate al mundo profesional.
              </p>
            </motion.div>
            <motion.div
              className="lp2-course__grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {courseModules.map((m, i) => (
                <motion.div
                  key={m.title}
                  className="lp2-course-card"
                  variants={scaleIn}
                  custom={i}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                    boxShadow: '0 20px 40px rgba(201,168,76,0.15)',
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="lp2-course-card__icon"
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                  >
                    {m.icon}
                  </motion.div>
                  <h3 className="lp2-course-card__title">{m.title}</h3>
                  <p className="lp2-course-card__desc">{m.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </MotionSection>

        {/* ── Gallery ───────────────────────────────────────────────────── */}
        <MotionSection className="lp2-gallery">
          <div className="lp2-container">
            <motion.div className="lp2-gallery__header" variants={fadeUp}>
              <span className="lp2-section-tag">Nuestro Trabajo</span>
              <h2 className="lp2-section-title">
                Resultados que <strong>hablan</strong>
              </h2>
            </motion.div>
            <motion.div
              className="lp2-gallery__grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <motion.div
                className="lp2-gallery__item lp2-gallery__item--wide"
                variants={scaleIn}
                custom={0}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              >
                <img src="/img/landing2/interior.png" alt="Interior de la academia" />
              </motion.div>
              <motion.div
                className="lp2-gallery__item"
                variants={scaleIn}
                custom={1}
                whileHover={{ scale: 1.05, zIndex: 2, transition: { duration: 0.3 } }}
              >
                <img src="/img/landing2/result.png" alt="Resultado de corte profesional" />
              </motion.div>
              <motion.div
                className="lp2-gallery__item"
                variants={scaleIn}
                custom={2}
                whileHover={{ scale: 1.05, zIndex: 2, transition: { duration: 0.3 } }}
              >
                <img src="/img/landing2/tools.png" alt="Herramientas profesionales" />
              </motion.div>
              <motion.div
                className="lp2-gallery__item"
                variants={scaleIn}
                custom={3}
                whileHover={{ scale: 1.05, zIndex: 2, transition: { duration: 0.3 } }}
              >
                <img src="/img/landing2/training.png" alt="Formación práctica" />
              </motion.div>
            </motion.div>
          </div>
        </MotionSection>

        {/* ── Reasons ───────────────────────────────────────────────────── */}
        <MotionSection className="lp2-reasons">
          <div className="lp2-container">
            <div className="lp2-reasons__inner">
              <motion.div variants={slideFromLeft}>
                <span className="lp2-section-tag">¿Por qué elegirnos?</span>
                <h2 className="lp2-section-title">
                  10 razones para<br />elegir <strong>Santa Cruz</strong>
                </h2>
                <p className="lp2-section-desc">
                  No solo enseñamos técnica: formamos barberos completos con
                  visión de negocio, marca personal y una red profesional
                  que les acompaña toda la carrera.
                </p>
              </motion.div>
              <motion.div
                className="lp2-reasons__list"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {reasons.map((r, i) => (
                  <motion.div
                    key={r.title}
                    className="lp2-reason"
                    variants={fadeUp}
                    custom={i}
                    whileHover={{
                      y: -6,
                      backgroundColor: 'rgba(201,168,76,0.08)',
                      borderColor: 'rgba(201,168,76,0.3)',
                      transition: { duration: 0.2 },
                    }}
                  >
                    <motion.div
                      className="lp2-reason__icon"
                      whileHover={{ scale: 1.3, rotate: 5 }}
                    >
                      {r.icon}
                    </motion.div>
                    <h4 className="lp2-reason__title">{r.title}</h4>
                    <p className="lp2-reason__desc">{r.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </MotionSection>

        {/* ── Details Bar ───────────────────────────────────────────────── */}
        <MotionSection className="lp2-details">
          <div className="lp2-container">
            <motion.div className="lp2-details__grid" variants={staggerContainer}>
              {details.map((d, i) => (
                <motion.div
                  key={d.label}
                  className="lp2-detail"
                  variants={fadeUp}
                  custom={i}
                  whileHover={{
                    y: -4,
                    scale: 1.05,
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                >
                  <motion.div
                    className="lp2-detail__icon"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  >
                    {d.icon}
                  </motion.div>
                  <div className="lp2-detail__label">{d.label}</div>
                  <div className="lp2-detail__value">{d.value}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </MotionSection>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <MotionSection className="lp2-cta" id="contacto">
          <div className="lp2-container">
            <motion.div className="lp2-cta__content" variants={fadeUp}>
              <h2 className="lp2-cta__title">
                ¿Listo para<br /><strong>empezar</strong>?
              </h2>
              <p className="lp2-cta__desc">
                Reserva tu plaza ahora y transforma tu pasión en profesión.
                Plazas limitadas — grupos reducidos para máxima atención.
              </p>
              <div className="lp2-cta__actions">
                <motion.a
                  href="https://academiasantacruz.com/cursos/"
                  className="lp2-btn lp2-btn--gold"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(201,168,76,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  Reservar Plaza
                </motion.a>
                <motion.a
                  href="https://academiasantacruz.com/contacto/"
                  className="lp2-btn lp2-btn--outline"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.06, borderColor: '#C9A84C', color: '#C9A84C' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  Contactar
                </motion.a>
              </div>
              <motion.p
                className="lp2-cta__phone"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                viewport={{ once: true }}
              >
                También puedes llamarnos: <a href="tel:+34613404071">+34 613 40 40 71</a>
              </motion.p>
            </motion.div>
          </div>
        </MotionSection>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <motion.footer
          className="lp2-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="lp2-container">
            <p className="lp2-footer__text">
              © {new Date().getFullYear()} Academia Santa Cruz — Av. de Barcelona, 118, Molins de Rei, Barcelona
            </p>
            <div className="lp2-footer__socials">
              {['Instagram', 'TikTok', 'Facebook', 'YouTube'].map((name) => {
                const urls = {
                  Instagram: 'https://www.instagram.com/academia_santacruz/',
                  TikTok: 'https://www.tiktok.com/@academia_santacruz',
                  Facebook: 'https://www.facebook.com/Santacruz.academia/',
                  YouTube: 'https://www.youtube.com/@AcademiaSantaCruz-ie6tu',
                };
                return (
                  <motion.a
                    key={name}
                    href={urls[name]}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3, color: '#C9A84C' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {name}
                  </motion.a>
                );
              })}
            </div>
          </div>
        </motion.footer>
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
