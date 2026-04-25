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

const panels = [
  { id: '01', title: 'Vision', text: 'Экран остается на месте, а секции меняются по горизонтали.' },
  { id: '02', title: 'System', text: 'Переход управляется вертикальным скроллом, без резких прыжков.' },
  { id: '03', title: 'Motion', text: 'Каждый блок въезжает в кадр плавно и последовательно.' },
  { id: '04', title: 'Control', text: 'Идеально для продуктовых сторителлинговых секций.' }
];

const sectionStyle = {
  position: 'relative',
  background: darkTheme.colors.background
};

const stickyStyle = {
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflow: 'hidden'
};

const trackStyle = {
  display: 'flex',
  height: '100%',
  willChange: 'transform',
  transition: 'transform 420ms cubic-bezier(0.22, 0.8, 0.2, 1)'
};

const panelStyle = {
  width: '100vw',
  minWidth: '100vw',
  boxSizing: 'border-box',
  height: '100%',
  display: 'grid',
  alignItems: 'center',
  justifyItems: 'start',
  padding: '0 8vw',
  position: 'relative',
  overflow: 'hidden'
};

const orbWrapStyle = {
  position: 'absolute',
  right: '8vw',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 'clamp(180px, 24vw, 340px)',
  height: 'clamp(180px, 24vw, 340px)',
  pointerEvents: 'none'
};

const orbCoreStyle = {
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  background:
    'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3), rgba(130,130,130,0.14) 36%, rgba(35,35,35,0.5) 62%, rgba(10,10,10,0.95) 100%)',
  boxShadow:
    'inset -18px -30px 46px rgba(0,0,0,0.7), inset 16px 22px 34px rgba(255,255,255,0.08), 0 22px 60px rgba(0,0,0,0.65)'
};

const orbRingStyle = {
  position: 'absolute',
  inset: '-10%',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.22)',
  opacity: 0.6
};

const railStyle = {
  position: 'absolute',
  top: '26px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'min(78vw, 760px)',
  height: '2px',
  background: darkTheme.colors.divider,
  borderRadius: '999px',
  overflow: 'visible'
};

export const HorizontalScrollSection = () => {
  const sectionRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(
    () => window.innerWidth || 1
  );
  const [progress, setProgress] = useState(0);
  const scrollPerPanelVh = 22;

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const node = sectionRef.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const scrollable = node.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      const current = Math.min(Math.max(-rect.top, 0), scrollable);
      setProgress(current / scrollable);
    };

    const onScrollOrResize = () => {
      setViewportWidth(window.innerWidth || 1);
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  const translateX = useMemo(() => {
    const maxIndex = panels.length - 1;
    const snappedIndex = Math.min(maxIndex, Math.floor(progress * panels.length));
    return -snappedIndex * viewportWidth;
  }, [progress, viewportWidth]);

  const activePanelIndex = useMemo(() => {
    const maxIndex = panels.length - 1;
    return Math.min(maxIndex, Math.max(0, Math.floor(progress * panels.length)));
  }, [progress]);

  const railFillPercent = useMemo(() => {
    if (panels.length <= 1) {
      return 0;
    }
    return (activePanelIndex / (panels.length - 1)) * 100;
  }, [activePanelIndex]);

  return (
    <section
      ref={sectionRef}
      style={{
        ...sectionStyle,
        height: `calc(100vh + ${(panels.length - 1) * scrollPerPanelVh}vh)`
      }}
    >
      <div style={stickyStyle}>
        <div style={{ position: 'absolute', top: 24, right: 28, color: 'rgba(255,255,255,0.55)', fontSize: 12, letterSpacing: '0.2em' }}>
          HORIZONTAL FLOW
        </div>
        <div style={railStyle}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${railFillPercent}%`,
              height: '100%',
              borderRadius: '999px',
              background: `linear-gradient(90deg, ${darkTheme.colors.accent}, ${darkTheme.colors.accentHover})`,
              boxShadow: '0 0 16px rgba(16,163,127,0.32)'
            }}
          />
          {panels.map((panel, index) => {
            const leftPercent = (index / (panels.length - 1)) * 100;
            const isActive = index === activePanelIndex;
            return (
              <div
                key={panel.id}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div
                  style={{
                    width: isActive ? 12 : 9,
                    height: isActive ? 12 : 9,
                    borderRadius: '50%',
                    background: isActive ? darkTheme.colors.accent : darkTheme.colors.muted,
                    boxShadow: isActive ? '0 0 20px rgba(16,163,127,0.42)' : 'none',
                    transition: 'all 220ms ease'
                  }}
                />
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 16,
                      transform: 'translateX(-50%)',
                      fontSize: 14,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      color: darkTheme.colors.primary,
                      opacity: 1,
                      animation: 'panelLabelIn 240ms ease-out'
                    }}
                  >
                    {panel.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <style>
          {`
            @keyframes panelLabelIn {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(-4px);
                filter: blur(3px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
                filter: blur(0);
              }
            }
          `}
        </style>
        <div
          style={{
            ...trackStyle,
            width: `${panels.length * 100}vw`,
            transform: `translate3d(${translateX}px, 0, 0)`
          }}
        >
          {panels.map((panel, index) => (
            <article key={panel.id} style={panelStyle}>
              <div style={{ maxWidth: 760, width: '100%', marginLeft: '2vw' }}>
                <div style={{ fontSize: 12, color: darkTheme.colors.muted, letterSpacing: '0.24em', marginBottom: 14 }}>
                  {panel.id}
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 'clamp(30px, 6vw, 78px)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 300,
                    color: darkTheme.colors.primary
                  }}
                >
                  {panel.title}
                </h3>
                <p
                  style={{
                    margin: '18px 0 0',
                    maxWidth: 640,
                    fontSize: 'clamp(15px, 1.8vw, 21px)',
                    lineHeight: 1.7,
                    color: darkTheme.colors.secondary
                  }}
                >
                  {panel.text}
                </p>
              </div>
              <div style={orbWrapStyle}>
                <div
                  style={{
                    ...orbCoreStyle,
                    transform: `rotate(${index * 8}deg) scale(${1 - index * 0.03})`
                  }}
                />
                <div
                  style={{
                    ...orbRingStyle,
                    transform: `rotate(${index * 14}deg) scale(${1 + index * 0.04})`
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
