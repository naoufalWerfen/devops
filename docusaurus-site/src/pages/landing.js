import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Layout from '@theme/Layout';
import './landing.css';

/* ── Data ─────────────────────────────────────────────────────────────────── */

const stats = [
  { number: '5,000+', label: 'Hospitales' },
  { number: '30,000+', label: 'Laboratorios' },
  { number: '120+', label: 'Países' },
  { number: '7,000+', label: 'Empleados' },
];

const solutions = [
  {
    icon: '🧬',
    title: 'Hemostasia',
    desc: 'Líder mundial en diagnóstico de la coagulación y hemostasia con tecnología de vanguardia.',
    color: '#06038D',
  },
  {
    icon: '🔬',
    title: 'Diagnóstico In Vitro',
    desc: 'Soluciones integrales de análisis clínico con automatización de laboratorio avanzada.',
    color: '#E87722',
  },
  {
    icon: '🏥',
    title: 'Atención al Paciente',
    desc: 'Dispositivos de point-of-care para decisiones clínicas rápidas y precisas.',
    color: '#059669',
  },
  {
    icon: '🤖',
    title: 'Automatización',
    desc: 'Sistemas robóticos y middleware para flujos de trabajo de laboratorio eficientes.',
    color: '#7C3AED',
  },
];

const values = [
  { icon: '🎯', title: 'Innovación', desc: 'Inversión continua en I+D para avanzar el diagnóstico' },
  { icon: '🌍', title: 'Global', desc: 'Presencia en más de 120 países con soporte local' },
  { icon: '⚡', title: 'Precisión', desc: 'Estándares de calidad superiores en cada producto' },
  { icon: '🤝', title: 'Compromiso', desc: 'Dedicados a mejorar la vida de los pacientes' },
];

const partners = [
  'ISO 13485', 'CE Mark', 'FDA Cleared', 'GMP Certified',
  'ISO 9001', 'IVDR Compliant',
];

const timeline = [
  { year: '1966', event: 'Fundación en Barcelona, España' },
  { year: '1981', event: 'Adquisición de Instrumentation Laboratory' },
  { year: '2003', event: 'Expansión global en 100+ países' },
  { year: '2015', event: 'Líder mundial en Hemostasia' },
  { year: '2024', event: 'Transformación digital e IA en diagnóstico' },
];

/* ── Framer Motion Variants ───────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerContainerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Animated Counter ─────────────────────────────────────────────────────── */

function AnimatedStat({ number, label, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayed, setDisplayed] = useState('0');

  useEffect(() => {
    if (!isInView) return;
    const numericPart = number.replace(/[^0-9]/g, '');
    const target = parseInt(numericPart, 10);
    const prefix = number.match(/^[^0-9]*/)[0];
    const suffix = number.match(/[^0-9]*$/)[0];
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.min(Math.round(increment * step), target);
      setDisplayed(prefix + current.toLocaleString() + suffix);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, number]);

  return (
    <motion.div
      className="lp-stat"
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="lp-stat__number" style={{ opacity: 1 }}>
        {isInView ? displayed : '0'}
      </div>
      <div className="lp-stat__label">{label}</div>
    </motion.div>
  );
}

/* ── Parallax Image ───────────────────────────────────────────────────────── */

function ParallaxImage({ src, alt }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <div ref={ref} style={{ overflow: 'hidden', borderRadius: '12px' }}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

/* ── Components ───────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="lp-hero">
      <img
        className="lp-hero__bg-image"
        src="/img/landing/hero.png"
        alt="Werfen laboratorio"
      />
      <div className="lp-hero__overlay"></div>
      <div className="lp-hero__inner">
        <motion.div
          className="lp-hero__content"
          style={{ opacity: 1 }}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span
            className="lp-hero__tag"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            Diagnóstico Especializado
          </motion.span>
          <motion.h1
            className="lp-hero__title"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Avanzando la ciencia del diagnóstico
          </motion.h1>
          <motion.p
            className="lp-hero__subtitle"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            Werfen es líder mundial en diagnóstico especializado &mdash; hemostasia, cuidado crítico
            y autoinmunidad &mdash; impulsando decisiones clínicas que salvan vidas.
          </motion.p>
          <motion.div
            className="lp-hero__actions"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <motion.a
              href="#solutions"
              className="lp-btn lp-btn--primary"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              Explorar Soluciones
            </motion.a>
            <motion.a
              href="#about"
              className="lp-btn lp-btn--outline-white"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              Conocer más
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="lp-stats">
      <div className="lp-container">
        <div className="lp-stats__grid">
          {stats.map((s, i) => (
            <AnimatedStat key={s.label} number={s.number} label={s.label} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="lp-solutions" id="solutions" ref={ref}>
      <div className="lp-container">
        <motion.div
          className="lp-section-header"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="lp-section-tag">Nuestras Soluciones</span>
          <h2 className="lp-section-title">{'Tecnología que transforma'}<br />{'el diagnóstico clínico'}</h2>
          <p className="lp-section-desc">
            Soluciones especializadas en hemostasia, cuidado crítico y autoinmunidad
            para laboratorios y centros de salud en todo el mundo.
          </p>
        </motion.div>
        <motion.div
          className="lp-solutions__grid"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          {solutions.map((sol) => (
            <motion.div
              key={sol.title}
              className="lp-solution-card"
              style={{ '--accent': sol.color }}
              variants={scaleIn}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
            >
              <motion.div
                className="lp-solution-card__icon"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                {sol.icon}
              </motion.div>
              <h3 className="lp-solution-card__title">{sol.title}</h3>
              <p className="lp-solution-card__desc">{sol.desc}</p>
              <div className="lp-solution-card__line"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function InnovationSplit() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="lp-split lp-split--img-left" id="about" ref={ref}>
      <div className="lp-container">
        <div className="lp-split__inner">
          <motion.div
            className="lp-split__image"
            style={{ opacity: 1 }}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={slideFromLeft}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ParallaxImage src="/img/landing/innovation.png" alt="Innovación Werfen" />
          </motion.div>
          <motion.div
            className="lp-split__content"
            style={{ opacity: 1 }}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={slideFromRight}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="lp-section-tag">{'Innovación & I+D'}</span>
            <h2 className="lp-section-title">Impulsamos el futuro del diagnóstico</h2>
            <p className="lp-split__text">
              Con más de 50 años de experiencia, Werfen invierte continuamente en investigación
              y desarrollo para crear soluciones que mejoran los resultados clínicos y la
              eficiencia de los laboratorios.
            </p>
            <ul className="lp-split__list">
              <li>Más de 1,200 patentes activas en diagnóstico</li>
              <li>Centros de I+D en EE.UU., Europa y Asia</li>
              <li>Colaboraciones con hospitales líderes mundiales</li>
            </ul>
            <div className="lp-split__stats-row">
              <div className="lp-split__mini-stat">
                <strong>{'€350M+'}</strong>
                <span>Inversión anual en I+D</span>
              </div>
              <div className="lp-split__mini-stat">
                <strong>1,200+</strong>
                <span>Patentes activas</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function GlobalSplit() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="lp-split lp-split--img-right" ref={ref}>
      <div className="lp-container">
        <div className="lp-split__inner">
          <motion.div
            className="lp-split__content"
            style={{ opacity: 1 }}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={slideFromLeft}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="lp-section-tag">Presencia Global</span>
            <h2 className="lp-section-title">Más de 120 países confían en nosotros</h2>
            <p className="lp-split__text">
              Desde nuestras oficinas centrales en Barcelona, llevamos soluciones de diagnóstico
              de clase mundial a hospitales y laboratorios en todos los continentes.
            </p>
            <ul className="lp-split__list">
              <li>Soporte técnico local en cada región</li>
              <li>Red de distribución en 120+ países</li>
              <li>Formación continua para profesionales</li>
            </ul>
            <div className="lp-split__stats-row">
              <div className="lp-split__mini-stat">
                <strong>7,000+</strong>
                <span>Empleados globales</span>
              </div>
              <div className="lp-split__mini-stat">
                <strong>30+</strong>
                <span>Oficinas internacionales</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="lp-split__image"
            style={{ opacity: 1 }}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={slideFromRight}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ParallaxImage src="/img/landing/global.png" alt="Presencia global Werfen" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProductsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="lp-products" ref={ref}>
      <div className="lp-container">
        <motion.div
          className="lp-section-header"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="lp-section-tag">Nuestros Productos</span>
          <h2 className="lp-section-title">Tecnología de precisión</h2>
          <p className="lp-section-desc">
            Equipos de diagnóstico de última generación diseñados para máxima fiabilidad y eficiencia.
          </p>
        </motion.div>
        <motion.div
          className="lp-products__showcase"
          style={{ opacity: 1 }}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={scaleIn}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02 }}
        >
          <img src="/img/landing/products.png" alt="Productos Werfen" />
        </motion.div>
      </div>
    </section>
  );
}

function ValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="lp-values" ref={ref}>
      <div className="lp-container">
        <motion.div
          className="lp-section-header"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="lp-section-tag">Nuestros Valores</span>
          <h2 className="lp-section-title">Comprometidos con la excelencia</h2>
        </motion.div>
        <motion.div
          className="lp-values__grid"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          {values.map((v) => (
            <motion.div
              key={v.title}
              className="lp-value-card"
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.03 }}
            >
              <motion.span
                className="lp-value-card__icon"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {v.icon}
              </motion.span>
              <h4 className="lp-value-card__title">{v.title}</h4>
              <p className="lp-value-card__desc">{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TimelineSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section className="lp-timeline" ref={ref}>
      <div className="lp-container" ref={containerRef}>
        <motion.div
          className="lp-section-header"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="lp-section-tag">Nuestra Historia</span>
          <h2 className="lp-section-title">60 años de innovación</h2>
        </motion.div>
        <div className="lp-timeline__track">
          <motion.div className="lp-timeline__line" style={{ height: lineHeight }} />
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            style={{ position: 'relative' }}
          >
            {timeline.map((t, i) => (
              <motion.div
                key={t.year}
                className="lp-timeline__item"
                style={{ opacity: 1 }}
                variants={i % 2 === 0 ? slideFromLeft : fadeUp}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="lp-timeline__dot"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.12, type: 'spring', stiffness: 300 }}
                />
                <div className="lp-timeline__content">
                  <span className="lp-timeline__year">{t.year}</span>
                  <p className="lp-timeline__event">{t.event}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CertificationsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="lp-certs" ref={ref}>
      <div className="lp-container">
        <motion.div
          className="lp-section-header"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="lp-section-tag">Certificaciones</span>
          <h2 className="lp-section-title">Calidad garantizada</h2>
          <p className="lp-section-desc">
            Cumplimos con los estándares más exigentes de la industria del diagnóstico in vitro.
          </p>
        </motion.div>
        <motion.div
          className="lp-certs__grid"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainerFast}
        >
          {partners.map((p) => (
            <motion.div
              key={p}
              className="lp-cert-badge"
              style={{ opacity: 1 }}
              variants={scaleIn}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="lp-cert-badge__shield"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                {'🛡️'}
              </motion.div>
              <span className="lp-cert-badge__text">{p}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="lp-cta-section" ref={ref}>
      <div className="lp-container">
        <motion.div
          className="lp-cta-section__content"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2>{'¿Listo para transformar su laboratorio?'}</h2>
          <p>Descubra cómo Werfen puede ayudar a mejorar los resultados clínicos de su institución.</p>
          <motion.div
            className="lp-cta-section__actions"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.a
              href="https://www.werfen.com"
              className="lp-btn lp-btn--primary lp-btn--large"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              Contactar con Ventas
            </motion.a>
            <motion.a
              href="/"
              className="lp-btn lp-btn--outline lp-btn--large"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              Ver Dashboard DevOps
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <Layout
      title="Werfen — Diagnóstico Especializado"
      description="Werfen es líder mundial en diagnóstico especializado, hemostasia, cuidado crítico y autoinmunidad."
    >
      <main className="lp-main">
        <HeroSection />
        <StatsSection />
        <SolutionsSection />
        <InnovationSplit />
        <GlobalSplit />
        <ProductsSection />
        <ValuesSection />
        <TimelineSection />
        <CertificationsSection />
        <CTASection />
      </main>
    </Layout>
  );
}
