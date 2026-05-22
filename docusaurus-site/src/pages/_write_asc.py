#!/usr/bin/env python3
"""Write the academiasantacruz.js file safely (avoids shell escaping issues)."""
import os

content = '''import React, { useRef, useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import './academiasantacruz.css';

gsap.registerPlugin(ScrollTrigger);

/* \\u2500\\u2500 Data \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */

const stats = [
  { value: \'320\', suffix: \'h\', label: \'Formaci\\u00f3n\' },
  { value: \'100\', suffix: \'%\', label: \'Pr\\u00e1ctico\' },
  { value: \'4\', suffix: \' meses\', label: \'Duraci\\u00f3n\' },
  { value: \'10\', suffix: \'+\', label: \'A\\u00f1os Exp.\' },
];

const courseModules = [
  { icon: \'\\u2702\\ufe0f\', title: \'Degradados\', desc: \'Desde b\\u00e1sicos hasta t\\u00e9cnicas avanzadas de fade con m\\u00e1quina y navaja.\' },
  { icon: \'\\ud83d\\udc88\', title: \'Corte de Pelo\', desc: \'T\\u00e9cnicas cl\\u00e1sicas y modernas con tijera, m\\u00e1quina y navaja barbera.\' },
  { icon: \'\\ud83d\\udc64\', title: \'Visagismo\', desc: \'An\\u00e1lisis facial y dise\\u00f1o de imagen masculina personalizada.\' },
  { icon: \'\\ud83c\\udfa8\', title: \'Colorimetr\\u00eda\', desc: \'Fundamentos del color, decoloraci\\u00f3n y t\\u00e9cnicas de aplicaci\\u00f3n.\' },
  { icon: \'\\ud83d\\udcf1\', title: \'Redes Sociales\', desc: \'Marketing personal y c\\u00f3mo captar clientes a trav\\u00e9s de Instagram.\' },
  { icon: \'\\ud83e\\uddd4\', title: \'Barba & Afeitado\', desc: \'Perfilado de barba, afeitado a navaja y cuidado facial completo.\' },
];

const reasons = [
  { icon: \'\\ud83c\\udfaf\', title: \'Enfoque Pr\\u00e1ctico\', desc: \'Cortar\\u00e1s pelo desde el primer d\\u00eda con modelos reales\' },
  { icon: \'\\ud83d\\udc68\\u200d\\ud83c\\udfeb\', title: \'Profesores en Activo\', desc: \'Barberos profesionales con a\\u00f1os de experiencia real\' },
  { icon: \'\\ud83c\\udfc6\', title: \'Bolsa de Trabajo\', desc: \'Conectamos con las mejores barber\\u00edas de Barcelona\' },
  { icon: \'\\ud83d\\udcf8\', title: \'Portfolio Profesional\', desc: \'Sesiones fotogr\\u00e1ficas para crear tu marca personal\' },
  { icon: \'\\ud83d\\udc65\', title: \'Grupos Reducidos\', desc: \'M\\u00e1ximo 8 alumnos por clase para atenci\\u00f3n personalizada\' },
  { icon: \'\\ud83e\\udd1d\', title: \'Comunidad Alumni\', desc: \'Red activa de antiguos alumnos y eventos sectoriales\' },
  { icon: \'\\ud83c\\udf93\', title: \'Certificaci\\u00f3n Oficial\', desc: \'Diploma acreditativo con reconocimiento sectorial\' },
  { icon: \'\\ud83d\\udcda\', title: \'Material Incluido\', desc: \'Kit profesional completo con herramientas de calidad\' },
  { icon: \'\\ud83d\\ude80\', title: \'Soporte Post-Curso\', desc: \'Resoluci\\u00f3n de dudas y mentoring despu\\u00e9s de finalizar\' },
  { icon: \'\\ud83c\\udf1f\', title: \'Workshops Exclusivos\', desc: \'Acceso a eventos, demos y formaci\\u00f3n continua\' },
];

const details = [
  { icon: \'\\ud83d\\udcc5\', label: \'Duraci\\u00f3n\', value: \'4 meses\' },
  { icon: \'\\u23f0\', label: \'Horarios\', value: \'L-J 10-14h / 15-19h\' },
  { icon: \'\\ud83c\\udf92\', label: \'Material\', value: \'Kit profesional incluido\' },
  { icon: \'\\ud83d\\udcdc\', label: \'Certificaci\\u00f3n\', value: \'Diploma acreditativo\' },
];

const testimonials = [
  {
    text: \'La mejor decisi\\u00f3n que he tomado. En 4 meses pas\\u00e9 de no saber nada a trabajar en una barber\\u00eda top de Barcelona.\',
    name: \'Miguel \\u00c1ngel R.\',
    role: \'Alumno promoci\\u00f3n 2024\',
    initial: \'M\',
  },
  {
    text: \'Los profesores son incre\\u00edbles, te ense\\u00f1an con pasi\\u00f3n y paciencia. El enfoque pr\\u00e1ctico hace toda la diferencia.\',
    name: \'Carlos P.\',
    role: \'Alumno promoci\\u00f3n 2024\',
    initial: \'C\',
  },
  {
    text: \'No solo aprend\\u00ed t\\u00e9cnica, tambi\\u00e9n aprend\\u00ed a gestionar mi marca personal y a captar clientes. Formaci\\u00f3n integral.\',
    name: \'David L.\',
    role: \'Alumno promoci\\u00f3n 2023\',
    initial: \'D\',
  },
];

const navLinks = [
  { label: \'Inicio\', href: \'#\' },
  { label: \'Curso\', href: \'#curso\' },
  { label: \'Galer\\u00eda\', href: \'#galeria\' },
  { label: \'Nosotros\', href: \'#nosotros\' },
  { label: \'Contacto\', href: \'#contacto\' },
];

/* \\u2500\\u2500 Framer Motion Variants \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */

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

/* \\u2500\\u2500 Reusable Components \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */

function MotionSection({ children, className, id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: \'-80px\' });
  return (
    <motion.section
      ref={ref}
      className={className}
      id={id}
      initial="hidden"
      animate={inView ? \'visible\' : \'hidden\'}
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
    offset: [\'start end\', \'end start\'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [\'-8%\', \'8%\']);
  return (
    <div ref={ref} className={className} style={{ overflow: \'hidden\' }}>
      <motion.img src={src} alt={alt} style={{ y, scale: 1.15 }} />
    </div>
  );
}

/* \\u2500\\u2500 Navbar Component \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener(\'scroll\', onScroll);
    return () => window.removeEventListener(\'scroll\', onScroll);
  }, []);

  return (
    <>
      <div className="asc-topbar">
        <div className="asc-container asc-topbar__inner">
          <div className="asc-topbar__contact">
            <a href="tel:+34613404071">\\ud83d\\udcde (+34) 613 40 40 71</a>
            <a href="mailto:info@academiasantacruz.com">\\u2709\\ufe0f info@academiasantacruz.com</a>
            <span>\\ud83d\\udccd Molins de Rei, Barcelona</span>
          </div>
          <div className="asc-topbar__socials">
            <a href="https://www.instagram.com/academia_santacruz/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@academia_santacruz" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="https://www.facebook.com/Santacruz.academia/" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.youtube.com/@AcademiaSantaCruz-ie6tu" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>
      </div>
      <nav className={`asc-navbar ${scrolled ? \'asc-navbar--scrolled\' : \'\'}`}>
        <div className="asc-container asc-navbar__inner">
          <a href="#" className="asc-navbar__brand">
            Academia <em>Santa Cruz</em>
          </a>
          <ul className="asc-navbar__links">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
            <li>
              <a href="#contacto" className="asc-navbar__cta">Hazte Alumno</a>
            </li>
          </ul>
          <button className="asc-navbar__mobile-toggle" aria-label="Menu">
            \\u2630
          </button>
        </div>
      </nav>
    </>
  );
}

/* \\u2500\\u2500 Main Component \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */

export default function AcademiaSantaCruzPage() {
  const mainRef = useRef(null);

  useGSAP(() => {
    // Hero entrance timeline
    const heroTl = gsap.timeline({ defaults: { ease: \'power3.out\' } });
    heroTl
      .from(\'.asc-hero__badge\', { autoAlpha: 0, y: 20, duration: 0.6 })
      .from(\'.asc-hero__title\', { autoAlpha: 0, y: 40, duration: 0.8 }, \'-=0.3\')
      .from(\'.asc-hero__subtitle\', { autoAlpha: 0, y: 30, duration: 0.6 }, \'-=0.4\')
      .from(\'.asc-hero__actions\', { autoAlpha: 0, y: 20, duration: 0.5 }, \'-=0.3\');

    // Stats number animation
    gsap.from(\'.asc-stat__number\', {
      textContent: 0,
      duration: 2,
      ease: \'power1.out\',
      snap: { textContent: 1 },
      scrollTrigger: { trigger: \'.asc-stats\', start: \'top 80%\' },
    });

    // Gallery items reveal
    ScrollTrigger.batch(\'.asc-gallery__item\', {
      onEnter: (elements) => {
        gsap.to(elements, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: \'power2.out\' });
      },
      start: \'top 85%\',
    });

  }, { scope: mainRef });

  return (
    <Layout
      title="Academia Santa Cruz \\u2014 Barber\\u00eda Profesional"
      description="Formaci\\u00f3n pr\\u00e1ctica en barber\\u00eda profesional en Barcelona. Convi\\u00e9rtete en barbero experto con la Academia Santa Cruz."
    >
      <main className="asc" ref={mainRef}>
        <Navbar />

        {/* \\u2500\\u2500 Hero \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <section className="asc-hero">
          <div className="asc-hero__bg">
            <img src="/img/academiasantacruz/hero.jpg" alt="Barbero profesional" />
          </div>
          <div className="asc-hero__overlay"></div>
          <div className="asc-hero__grain"></div>
          <div className="asc-container asc-hero__content">
            <div className="asc-hero__badge">
              <span className="asc-hero__badge-dot"></span>
              Molins de Rei, Barcelona
            </div>
            <h1 className="asc-hero__title">
              Convi\\u00e9rtete en un<br /><em>Barbero Profesional</em>
            </h1>
            <p className="asc-hero__subtitle">
              En la Academia Santa Cruz te ofrecemos formaci\\u00f3n 100% pr\\u00e1ctica con
              instructores expertos, t\\u00e9cnicas modernas y certificaci\\u00f3n profesional.
              Aprende con los mejores y lanza tu carrera en la barber\\u00eda.
            </p>
            <div className="asc-hero__actions">
              <motion.a
                href="#curso"
                className="asc-btn asc-btn--gold"
                whileHover={{ scale: 1.05, boxShadow: \'0 0 30px rgba(201,168,76,0.4)\' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: \'spring\', stiffness: 400, damping: 17 }}
              >
                Ver Programas
              </motion.a>
              <motion.a
                href="#contacto"
                className="asc-btn asc-btn--outline"
                whileHover={{ scale: 1.05, borderColor: \'#C9A84C\' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: \'spring\', stiffness: 400, damping: 17 }}
              >
                Contactar
              </motion.a>
            </div>
          </div>
        </section>

        {/* \\u2500\\u2500 Stats \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-stats">
          <div className="asc-container">
            <div className="asc-stats__grid">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="asc-stat"
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="asc-stat__number">{s.value}{s.suffix}</div>
                  <div className="asc-stat__label">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 About \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-about" id="nosotros">
          <div className="asc-container">
            <div className="asc-about__inner">
              <motion.div className="asc-about__image" variants={slideFromLeft}>
                <ParallaxImage
                  src="/img/academiasantacruz/about.jpg"
                  alt="Interior de la academia"
                  className="asc-about__image"
                />
              </motion.div>
              <motion.div variants={slideFromRight}>
                <span className="asc-section-tag">Sobre Nosotros</span>
                <h2 className="asc-section-title">
                  Donde la pasi\\u00f3n se<br />convierte en <strong>profesi\\u00f3n</strong>
                </h2>
                <p className="asc-section-desc">
                  Bienvenido a SantaCruz Barber\\u00eda, mucho m\\u00e1s que una academia: somos una
                  comunidad de estilo, formaci\\u00f3n y actitud. Ubicados en el coraz\\u00f3n de
                  Molins de Rei, nos dedicamos a transformar la barber\\u00eda tradicional
                  en una experiencia contempor\\u00e1nea y profesional.
                </p>
                <motion.ul
                  className="asc-features"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.li variants={fadeUp} custom={0}>Formaci\\u00f3n personalizada desde el d\\u00eda uno</motion.li>
                  <motion.li variants={fadeUp} custom={1}>Enfoque 100% pr\\u00e1ctico con clientes reales</motion.li>
                  <motion.li variants={fadeUp} custom={2}>Equipo docente con trayectoria reconocida</motion.li>
                  <motion.li variants={fadeUp} custom={3}>Ubicaci\\u00f3n estrat\\u00e9gica en Molins de Rei</motion.li>
                  <motion.li variants={fadeUp} custom={4}>Apoyo constante antes, durante y despu\\u00e9s</motion.li>
                </motion.ul>
              </motion.div>
            </div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 Course \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-course" id="curso">
          <div className="asc-container">
            <motion.div className="asc-course__header" variants={fadeUp}>
              <span className="asc-section-tag">Programa de Formaci\\u00f3n</span>
              <h2 className="asc-section-title">
                Curso de Iniciaci\\u00f3n a la<br /><strong>Barber\\u00eda Profesional</strong>
              </h2>
              <p className="asc-section-desc">
                320 horas de formaci\\u00f3n pr\\u00e1ctica y presencial en Molins de Rei.
                Aprende con expertos desde el primer d\\u00eda y l\\u00e1nzate al mundo profesional.
              </p>
            </motion.div>
            <motion.div
              className="asc-course__grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: \'-50px\' }}
            >
              {courseModules.map((m, i) => (
                <motion.div
                  key={m.title}
                  className="asc-course-card"
                  variants={scaleIn}
                  custom={i}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                    boxShadow: \'0 20px 40px rgba(201,168,76,0.15)\',
                    transition: { type: \'spring\', stiffness: 300, damping: 20 },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="asc-course-card__icon"
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                  >
                    {m.icon}
                  </motion.div>
                  <h3 className="asc-course-card__title">{m.title}</h3>
                  <p className="asc-course-card__desc">{m.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 Details Bar \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-details">
          <div className="asc-container">
            <motion.div className="asc-details__grid" variants={staggerContainer}>
              {details.map((d, i) => (
                <motion.div
                  key={d.label}
                  className="asc-detail"
                  variants={fadeUp}
                  custom={i}
                  whileHover={{
                    y: -4,
                    scale: 1.05,
                    transition: { type: \'spring\', stiffness: 300, damping: 20 },
                  }}
                >
                  <motion.div
                    className="asc-detail__icon"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  >
                    {d.icon}
                  </motion.div>
                  <div className="asc-detail__label">{d.label}</div>
                  <div className="asc-detail__value">{d.value}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 Gallery \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-gallery" id="galeria">
          <div className="asc-container">
            <motion.div className="asc-gallery__header" variants={fadeUp}>
              <span className="asc-section-tag">Nuestro Trabajo</span>
              <h2 className="asc-section-title">
                Resultados que <strong>hablan</strong>
              </h2>
            </motion.div>
            <motion.div
              className="asc-gallery__grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: \'-50px\' }}
            >
              <motion.div
                className="asc-gallery__item asc-gallery__item--wide"
                variants={scaleIn}
                custom={0}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              >
                <img src="/img/academiasantacruz/gallery-1.jpg" alt="Interior de la academia" />
              </motion.div>
              <motion.div
                className="asc-gallery__item"
                variants={scaleIn}
                custom={1}
                whileHover={{ scale: 1.05, zIndex: 2, transition: { duration: 0.3 } }}
              >
                <img src="/img/academiasantacruz/gallery-2.jpg" alt="Corte profesional" />
              </motion.div>
              <motion.div
                className="asc-gallery__item"
                variants={scaleIn}
                custom={2}
                whileHover={{ scale: 1.05, zIndex: 2, transition: { duration: 0.3 } }}
              >
                <img src="/img/academiasantacruz/gallery-3.jpg" alt="Herramientas profesionales" />
              </motion.div>
              <motion.div
                className="asc-gallery__item"
                variants={scaleIn}
                custom={3}
                whileHover={{ scale: 1.05, zIndex: 2, transition: { duration: 0.3 } }}
              >
                <img src="/img/academiasantacruz/gallery-4.jpg" alt="Clase pr\\u00e1ctica" />
              </motion.div>
              <motion.div
                className="asc-gallery__item asc-gallery__item--wide"
                variants={scaleIn}
                custom={4}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              >
                <img src="/img/academiasantacruz/gallery-5.jpg" alt="Resultado final" />
              </motion.div>
            </motion.div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 Reasons \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-reasons">
          <div className="asc-container">
            <div className="asc-reasons__inner">
              <motion.div variants={slideFromLeft}>
                <span className="asc-section-tag">\\u00bfPor qu\\u00e9 elegirnos?</span>
                <h2 className="asc-section-title">
                  10 razones para<br />elegir <strong>Santa Cruz</strong>
                </h2>
                <p className="asc-section-desc">
                  No solo ense\\u00f1amos t\\u00e9cnica: formamos barberos completos con
                  visi\\u00f3n de negocio, marca personal y una red profesional
                  que les acompa\\u00f1a toda la carrera.
                </p>
              </motion.div>
              <motion.div
                className="asc-reasons__list"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {reasons.map((r, i) => (
                  <motion.div
                    key={r.title}
                    className="asc-reason"
                    variants={fadeUp}
                    custom={i}
                    whileHover={{
                      y: -6,
                      backgroundColor: \'rgba(201,168,76,0.08)\',
                      borderColor: \'rgba(201,168,76,0.3)\',
                      transition: { duration: 0.2 },
                    }}
                  >
                    <motion.div
                      className="asc-reason__icon"
                      whileHover={{ scale: 1.3, rotate: 5 }}
                    >
                      {r.icon}
                    </motion.div>
                    <h4 className="asc-reason__title">{r.title}</h4>
                    <p className="asc-reason__desc">{r.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 Testimonials \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-testimonials">
          <div className="asc-container">
            <motion.div className="asc-testimonials__header" variants={fadeUp}>
              <span className="asc-section-tag">Testimonios</span>
              <h2 className="asc-section-title">
                Lo que dicen nuestros <strong>alumnos</strong>
              </h2>
            </motion.div>
            <motion.div
              className="asc-testimonials__grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  className="asc-testimonial"
                  variants={scaleIn}
                  custom={i}
                  whileHover={{ y: -8, boxShadow: \'0 20px 40px rgba(0,0,0,0.3)\' }}
                >
                  <p className="asc-testimonial__text">{t.text}</p>
                  <div className="asc-testimonial__author">
                    <div className="asc-testimonial__avatar">{t.initial}</div>
                    <div>
                      <div className="asc-testimonial__name">{t.name}</div>
                      <div className="asc-testimonial__role">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 Location \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-location">
          <div className="asc-container">
            <div className="asc-location__inner">
              <motion.div className="asc-location__map" variants={slideFromLeft}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.123!2d2.0128!3d41.4125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDI0JzQ1LjAiTiAywrAwMCc0Ni4xIkU!5e0!3m2!1ses!2ses!4v1234567890"
                  allowFullScreen=""
                  loading="lazy"
                  title="Ubicaci\\u00f3n Academia Santa Cruz"
                ></iframe>
              </motion.div>
              <motion.div variants={slideFromRight}>
                <span className="asc-section-tag">\\u00bfC\\u00f3mo llegar?</span>
                <h2 className="asc-section-title">
                  Enc\\u00faentranos en<br /><strong>Molins de Rei</strong>
                </h2>
                <div className="asc-location__detail">
                  <span className="asc-location__detail-icon">\\ud83d\\udccd</span>
                  <div className="asc-location__detail-text">
                    <strong>Direcci\\u00f3n</strong>
                    Av. de Barcelona, 118, 08750 Molins de Rei, Barcelona
                  </div>
                </div>
                <div className="asc-location__detail">
                  <span className="asc-location__detail-icon">\\ud83d\\udcc5</span>
                  <div className="asc-location__detail-text">
                    <strong>Horario</strong>
                    Lunes a Viernes de 9:00h a 20:00h
                  </div>
                </div>
                <div className="asc-location__detail">
                  <span className="asc-location__detail-icon">\\ud83d\\udcde</span>
                  <div className="asc-location__detail-text">
                    <strong>Tel\\u00e9fono</strong>
                    <a href="tel:+34613404071" style={{ color: \'var(--sc-gold)\' }}>+34 613 40 40 71</a>
                  </div>
                </div>
                <div className="asc-location__detail">
                  <span className="asc-location__detail-icon">\\u2709\\ufe0f</span>
                  <div className="asc-location__detail-text">
                    <strong>Email</strong>
                    <a href="mailto:info@academiasantacruz.com" style={{ color: \'var(--sc-gold)\' }}>info@academiasantacruz.com</a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 Contact Form \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-contact" id="contacto">
          <div className="asc-container">
            <div className="asc-contact__inner">
              <motion.div variants={slideFromLeft}>
                <span className="asc-section-tag">Reserva tu Plaza</span>
                <h2 className="asc-section-title">
                  Da el primer paso<br />hacia tu <strong>futuro</strong>
                </h2>
                <p className="asc-section-desc">
                  Rellena el formulario y nos pondremos en contacto contigo
                  para resolver todas tus dudas y reservar tu plaza.
                  Plazas limitadas por promoci\\u00f3n.
                </p>
                <motion.p
                  className="asc-cta__phone"
                  style={{ marginTop: \'2rem\' }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  Tambi\\u00e9n puedes llamarnos: <a href="tel:+34613404071">+34 613 40 40 71</a>
                </motion.p>
              </motion.div>
              <motion.form
                className="asc-contact__form"
                variants={slideFromRight}
                onSubmit={(e) => e.preventDefault()}
              >
                <input className="asc-input" type="text" placeholder="Tu nombre" required />
                <input className="asc-input" type="email" placeholder="Tu correo electr\\u00f3nico" required />
                <input className="asc-input" type="tel" placeholder="Tel\\u00e9fono o WhatsApp" />
                <select className="asc-input asc-input--select">
                  <option value="">Curso de inter\\u00e9s</option>
                  <option value="iniciacion">Curso de Iniciaci\\u00f3n a la Barber\\u00eda Profesional</option>
                  <option value="avanzado">Curso Avanzado (pr\\u00f3ximamente)</option>
                </select>
                <textarea
                  className="asc-input asc-input--textarea"
                  placeholder="\\u00bfTienes alguna duda o mensaje adicional? (opcional)"
                  rows={4}
                ></textarea>
                <motion.button
                  type="submit"
                  className="asc-btn asc-btn--gold asc-btn--large"
                  style={{ width: \'100%\', justifyContent: \'center\' }}
                  whileHover={{ scale: 1.03, boxShadow: \'0 0 30px rgba(201,168,76,0.4)\' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: \'spring\', stiffness: 400, damping: 17 }}
                >
                  Enviar Solicitud
                </motion.button>
              </motion.form>
            </div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 CTA \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <MotionSection className="asc-cta">
          <div className="asc-container">
            <motion.div className="asc-cta__content" variants={fadeUp}>
              <h2 className="asc-cta__title">
                \\u00bfListo para<br /><strong>empezar</strong>?
              </h2>
              <p className="asc-cta__desc">
                Reserva tu plaza ahora y transforma tu pasi\\u00f3n en profesi\\u00f3n.
                Plazas limitadas \\u2014 grupos reducidos para m\\u00e1xima atenci\\u00f3n personalizada.
              </p>
              <div className="asc-cta__actions">
                <motion.a
                  href="#contacto"
                  className="asc-btn asc-btn--gold asc-btn--large"
                  whileHover={{ scale: 1.06, boxShadow: \'0 0 40px rgba(201,168,76,0.5)\' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: \'spring\', stiffness: 400, damping: 15 }}
                >
                  Reservar Plaza
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/academia_santacruz/"
                  className="asc-btn asc-btn--outline asc-btn--large"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.06, borderColor: \'#C9A84C\', color: \'#C9A84C\' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: \'spring\', stiffness: 400, damping: 15 }}
                >
                  Ver Instagram
                </motion.a>
              </div>
            </motion.div>
          </div>
        </MotionSection>

        {/* \\u2500\\u2500 Footer \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500 */}
        <motion.footer
          className="asc-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="asc-container">
            <div className="asc-footer__inner">
              <div>
                <div className="asc-footer__brand">Academia <em>Santa Cruz</em></div>
                <p className="asc-footer__brand-desc">
                  Formaci\\u00f3n profesional en barber\\u00eda. Aprende con los mejores
                  en Molins de Rei, Barcelona. Tu pasi\\u00f3n, tu profesi\\u00f3n.
                </p>
              </div>
              <div>
                <div className="asc-footer__heading">Navegaci\\u00f3n</div>
                <ul className="asc-footer__links">
                  <li><a href="#">Inicio</a></li>
                  <li><a href="#curso">Cursos</a></li>
                  <li><a href="#galeria">Galer\\u00eda</a></li>
                  <li><a href="#nosotros">Sobre Nosotros</a></li>
                  <li><a href="#contacto">Contacto</a></li>
                </ul>
              </div>
              <div>
                <div className="asc-footer__heading">Legal</div>
                <ul className="asc-footer__links">
                  <li><a href="https://academiasantacruz.com/aviso-legal/" target="_blank" rel="noopener noreferrer">Aviso Legal</a></li>
                  <li><a href="https://academiasantacruz.com/reembolso-devoluciones/" target="_blank" rel="noopener noreferrer">Reembolso y Devoluciones</a></li>
                </ul>
              </div>
              <div>
                <div className="asc-footer__heading">Contacto</div>
                <ul className="asc-footer__links">
                  <li><a href="tel:+34613404071">+34 613 40 40 71</a></li>
                  <li><a href="mailto:info@academiasantacruz.com">info@academiasantacruz.com</a></li>
                  <li>Av. de Barcelona, 118</li>
                  <li>Molins de Rei, Barcelona</li>
                </ul>
              </div>
            </div>
            <div className="asc-footer__bottom">
              <p className="asc-footer__copy">
                \\u00a9 {new Date().getFullYear()} Academia Santa Cruz. All rights reserved.
              </p>
              <div className="asc-footer__socials">
                {[\'Instagram\', \'TikTok\', \'Facebook\', \'YouTube\'].map((name) => {
                  const urls = {
                    Instagram: \'https://www.instagram.com/academia_santacruz/\',
                    TikTok: \'https://www.tiktok.com/@academia_santacruz\',
                    Facebook: \'https://www.facebook.com/Santacruz.academia/\',
                    YouTube: \'https://www.youtube.com/@AcademiaSantaCruz-ie6tu\',
                  };
                  return (
                    <motion.a
                      key={name}
                      href={urls[name]}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3, color: \'#C9A84C\' }}
                      transition={{ type: \'spring\', stiffness: 300 }}
                    >
                      {name}
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.footer>
      </main>
    </Layout>
  );
}
'''

target = '/var/www/devops/docusaurus-site/src/pages/academiasantacruz.js'
with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

import os
print(f'Written {os.path.getsize(target)} bytes to {target}')
