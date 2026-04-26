import { useEffect, useMemo, useRef, useState } from 'react';

const darkTheme = {
  colors: {
    background: '#0D0D0D',
    surface: '#1A1A1A',
    primary: '#ECECEC',
    secondary: '#ACACAC',
    muted: '#8E8E8E',
    border: '#2D2D2D',
    divider: '#363636',
    hover: '#2A2A2A',
    accent: '#10A37F',
    accentHover: '#0E8C6F'
  }
};

const sectionStyle = {
  minHeight: '100vh',
  background: darkTheme.colors.background,
  color: darkTheme.colors.primary,
  padding: '10vh 7vw 8vh',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center'
};

const contentWrapStyle = {
  width: '100%'
};

const headingStyle = {
  margin: 0,
  marginBottom: '14px',
  fontSize: 'clamp(32px, 4.4vw, 64px)',
  letterSpacing: '0.08em',
  fontWeight: 300,
  textTransform: 'uppercase'
};

const subtitleStyle = {
  margin: 0,
  marginBottom: '56px',
  maxWidth: '820px',
  color: darkTheme.colors.secondary,
  fontSize: '16px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  lineHeight: 1.8
};

const gridStyle = {
  display: 'grid',
  gap: '22px',
  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))'
};

const cardBaseStyle = {
  border: `1px solid ${darkTheme.colors.border}`,
  background: darkTheme.colors.surface,
  borderRadius: '20px',
  minHeight: '200px',
  padding: '26px',
  backdropFilter: 'blur(1.5px)',
  transition: 'transform 650ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 650ms ease, border-color 520ms ease, box-shadow 700ms ease'
};

const cards = [
  {
    title: 'Automation',
    text: 'Automation of up to 70% of chats, calls and inquiries.',
    metric: '01'
  },
  {
    title: 'Savings',
    text: 'Savings of up to $50,000 per month on support.',
    metric: '02'
  },
  {
    title: 'Languages',
    text: 'Support for up to 15 languages.',
    metric: '03'
  },
  {
    title: 'Integrations',
    text: 'Integration with CRM, payment systems and gaming platforms.',
    metric: '04'
  },
  {
    title: 'Analytics',
    text: 'Analytics and quality control.',
    metric: '05'
  }
];

export const ScrollRevealBlocks = () => {
  const [visibleMap, setVisibleMap] = useState(() => cards.map(() => false));
  const [introVisible, setIntroVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const refs = useRef([]);
  const introRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleMap((prev) => {
          const next = [...prev];
          let changed = false;
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = Number(entry.target.getAttribute('data-card-idx'));
              if (!next[idx]) {
                next[idx] = true;
                changed = true;
              }
            }
          });
          return changed ? next : prev;
        });
      },
      { threshold: 0.24, rootMargin: '0px 0px -12% 0px' }
    );

    refs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = introRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntroVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const renderedCards = useMemo(
    () =>
      cards.map((card, index) => {
        const isVisible = visibleMap[index];
        const isActive = activeIndex === index;
        const transitionEnter = isVisible
          ? 'transform 220ms ease, border-color 520ms ease, box-shadow 700ms ease'
          : 'transform 650ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 650ms ease, border-color 520ms ease, box-shadow 700ms ease';
        const transitionOpacity = isVisible
          ? 'opacity 650ms ease'
          : 'opacity 650ms ease';
        const centeredSecondRowPlacement =
          cards.length === 5
            ? index < 3
              ? 'span 2'
              : index === 3
                ? '2 / span 2'
                : '4 / span 2'
            : 'span 2';
        return (
          <article
            key={card.title}
            ref={(el) => {
              refs.current[index] = el;
            }}
            data-card-idx={index}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
            style={{
              ...cardBaseStyle,
              opacity: isVisible ? 1 : 0,
              transform: isVisible
                ? `translateY(0px) scale(${isActive ? 1.015 : 1})`
                : 'translateY(52px) scale(0.985)',
              transition: `${transitionOpacity}, ${transitionEnter}`,
              transitionDelay: isVisible ? '0ms' : `${index * 130}ms`,
              borderColor: isActive
                ? darkTheme.colors.accent
                : darkTheme.colors.border,
              boxShadow: isActive
                ? '0 16px 50px rgba(16,163,127,0.22)'
                : '0 10px 28px rgba(0,0,0,0.35)',
              gridColumn: centeredSecondRowPlacement
            }}
          >
            <div style={{ fontSize: '12px', color: darkTheme.colors.muted, letterSpacing: '0.22em' }}>
              {card.metric}
            </div>
            <h3
              style={{
                margin: '12px 0 10px',
                fontSize: 'clamp(24px, 2.6vw, 36px)',
                fontWeight: 300,
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                margin: 0,
                color: darkTheme.colors.secondary,
                lineHeight: 1.65,
                fontSize: 'clamp(16px, 1.4vw, 20px)'
              }}
            >
              {card.text}
            </p>
          </article>
        );
      }),
    [activeIndex, visibleMap]
  );

  return (
    <section style={sectionStyle}>
      <div style={contentWrapStyle}>
        <h2
          ref={introRef}
          style={{
            ...headingStyle,
            opacity: introVisible ? 1 : 0,
            transform: introVisible ? 'translateY(0px)' : 'translateY(42px)',
            filter: introVisible ? 'blur(0px)' : 'blur(8px)',
            transition: 'opacity 700ms ease, transform 800ms cubic-bezier(0.2, 0.9, 0.2, 1), filter 700ms ease'
          }}
        >
          Why Qodeq
        </h2>
        <p
          style={{
            ...subtitleStyle,
            opacity: introVisible ? 1 : 0,
            transform: introVisible ? 'translateY(0px)' : 'translateY(34px)',
            filter: introVisible ? 'blur(0px)' : 'blur(6px)',
            transition:
              'opacity 700ms ease 120ms, transform 820ms cubic-bezier(0.2, 0.9, 0.2, 1) 120ms, filter 700ms ease 120ms'
          }}
        >
          Key outcomes from deploying Qodeq across support and operations.
        </p>
        <div style={gridStyle}>{renderedCards}</div>
      </div>
    </section>
  );
};
