import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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

const containerStyle = {
  width: '100%',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: darkTheme.colors.background
};

const canvasStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  // Needed for raycasting / hover on the 3D scene (HTML overlays are pointer-events: none)
  pointerEvents: 'auto',
  touchAction: 'none'
};

const vignetteStyle = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  background: 'rgba(13, 13, 13, 0.2)',
  boxShadow: 'inset 0 0 180px rgba(13, 13, 13, 0.95)'
};

const grainStyle = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 0.18,
  backgroundImage:
    'radial-gradient(rgba(255,255,255,0.3) 0.6px, transparent 0.6px)',
  backgroundSize: '2px 2px'
};

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingBottom: '11vh',
  color: darkTheme.colors.primary,
  fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
  pointerEvents: 'none'
};

const anchorNavWrapStyle = {
  position: 'fixed',
  top: '50%',
  left: '28px',
  transform: 'translateY(-50%)',
  display: 'block',
  pointerEvents: 'auto',
  zIndex: 30,
  padding: '0',
  border: 'none',
  background: 'transparent',
  backdropFilter: 'none',
  clipPath: 'none'
};

const anchorRailStyle = {
  position: 'relative',
  width: '2px',
  height: '360px',
  marginLeft: '10px',
  background: darkTheme.colors.divider,
  borderRadius: '999px'
};

const titleStyle = {
  position: 'absolute',
  top: '52%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  margin: 0,
  fontSize: 'clamp(30px, 8.5vw, 92px)',
  fontWeight: 300,
  letterSpacing: '0.36em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  opacity: 0.86
};

const subtitleStyle = {
  margin: 0,
  marginBottom: '18px',
  fontSize: '10px',
  fontWeight: 300,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  opacity: 0.7
};

const buttonStyle = {
  border: `1px solid ${darkTheme.colors.border}`,
  borderRadius: '0',
  background: `linear-gradient(135deg, ${darkTheme.colors.hover}, ${darkTheme.colors.surface})`,
  color: darkTheme.colors.primary,
  padding: '10px 28px',
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  pointerEvents: 'auto',
  position: 'relative',
  clipPath: 'polygon(9% 0, 100% 0, 91% 100%, 0 100%)',
  overflow: 'hidden',
  transition: 'transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease, background 300ms ease'
};

const satelliteLabelTexts = ['Chatbot', 'CallBot', 'PaymentBot', 'QABot'];

const satelliteLabelBaseStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  margin: 0,
  fontWeight: 300,
  letterSpacing: '0.36em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  color: darkTheme.colors.primary,
  opacity: 0,
  fontSize: 'clamp(10px, 1.2vw, 20px)',
  textShadow: '0 0 18px rgba(0,0,0,0.7)',
  pointerEvents: 'none',
  willChange: 'transform, opacity'
};

const labelLayerStyle = {
  position: 'absolute',
  inset: 0,
  zIndex: 4,
  pointerEvents: 'none',
  fontFamily: "Inter, 'Segoe UI', Arial, sans-serif"
};

const anchors = [
  { id: 'hero-main', label: 'Hero' },
  { id: 'reveal-blocks', label: 'Blocks' },
  { id: 'horizontal-flow', label: 'Flow' },
  { id: 'automation-stats', label: 'Stats' },
  { id: 'story-steps', label: 'Story' }
];

export const LiquidHeroScene = () => {
  const mountRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const [activeAnchor, setActiveAnchor] = useState('hero-main');
  const [hoveredAnchor, setHoveredAnchor] = useState('');
  const [isButtonHover, setIsButtonHover] = useState(false);

  useEffect(() => {
    const updateActiveAnchor = () => {
      const viewportHeight = window.innerHeight || 1;
      const checkpoint = viewportHeight * 0.5;
      let intersectedId = '';
      let fallbackId = anchors[0].id;
      let fallbackDistance = Number.POSITIVE_INFINITY;

      anchors.forEach((anchor) => {
        const node = document.getElementById(anchor.id);
        if (!node) {
          return;
        }
        const rect = node.getBoundingClientRect();
        const intersectsCheckpoint = rect.top <= checkpoint && rect.bottom > checkpoint;

        if (intersectsCheckpoint) {
          intersectedId = anchor.id;
        }

        const distance = Math.abs(rect.top - checkpoint);
        if (distance < fallbackDistance) {
          fallbackDistance = distance;
          fallbackId = anchor.id;
        }
      });

      setActiveAnchor(intersectedId || fallbackId);
    };

    updateActiveAnchor();
    window.addEventListener('scroll', updateActiveAnchor, { passive: true });
    window.addEventListener('resize', updateActiveAnchor);
    return () => {
      window.removeEventListener('scroll', updateActiveAnchor);
      window.removeEventListener('resize', updateActiveAnchor);
    };
  }, []);

  const scrollToAnchor = (targetId) => {
    const node = document.getElementById(targetId);
    if (!node) {
      return;
    }
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.05, 4.35);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'low-power'
    });
    renderer.setClearColor(0x0d0d0d, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    mountNode.appendChild(renderer.domElement);

    const lightA = new THREE.DirectionalLight(0xffffff, 1.35);
    lightA.position.set(0, 6, 0);
    lightA.target.position.set(0, 0.2, 0);
    scene.add(lightA.target);
    scene.add(lightA);

    const lightB = new THREE.PointLight(0xffffff, 0.22, 10);
    lightB.position.set(0.8, 1.1, 1.8);
    scene.add(lightB);

    const lightC = new THREE.PointLight(0xffffff, 0.15, 10);
    lightC.position.set(-0.9, 0.9, 1.6);
    scene.add(lightC);

    const ambient = new THREE.AmbientLight(0x2d2d2d, 0.2);
    scene.add(ambient);

    const geometry = new THREE.IcosahedronGeometry(1.2, 6);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x8e8e8e,
      metalness: 0,
      roughness: 0.92,
      clearcoat: 0,
      clearcoatRoughness: 1,
      sheen: 0,
      sheenColor: new THREE.Color(0x0d0d0d),
      transparent: true,
      opacity: 0
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.06;
    scene.add(mesh);

    const satelliteConfigs = [
      { x: -1.82, yOffset: 0.55, timePhase: 0.9, rotSign: 1 },
      { x: -1.82, yOffset: -0.55, timePhase: 1.4, rotSign: -1 },
      { x: 1.82, yOffset: 0.55, timePhase: 1.1, rotSign: -1 },
      { x: 1.82, yOffset: -0.55, timePhase: 1.6, rotSign: 1 }
    ];

    const satelliteMeshes = [];
    const satelliteData = [];

    const labelWorld = new THREE.Vector3();

    satelliteConfigs.forEach((cfg) => {
      const satGeometry = new THREE.IcosahedronGeometry(0.48, 4);
      const satMesh = new THREE.Mesh(satGeometry, material);
      satMesh.position.set(cfg.x, 0.06 + cfg.yOffset, 0.04);
      scene.add(satMesh);
      satelliteMeshes.push(satMesh);

      const satPosAttr = satGeometry.attributes.position;
      const satBase = satPosAttr.array.slice();
      satelliteData.push({
        geometry: satGeometry,
        positionAttr: satPosAttr,
        basePositions: satBase,
        vertexCount: satPosAttr.count,
        timePhase: cfg.timePhase,
        rotSign: cfg.rotSign
      });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const satHover = new Float32Array(satelliteMeshes.length).fill(0);
    const satHoverTarget = new Float32Array(satelliteMeshes.length).fill(0);

    const lerpTowardBase = (attr, base, count, t) => {
      if (t <= 0.000001) {
        return;
      }
      for (let i = 0; i < count; i += 1) {
        const stride = i * 3;
        attr.array[stride] = THREE.MathUtils.lerp(attr.array[stride], base[stride], t);
        attr.array[stride + 1] = THREE.MathUtils.lerp(attr.array[stride + 1], base[stride + 1], t);
        attr.array[stride + 2] = THREE.MathUtils.lerp(attr.array[stride + 2], base[stride + 2], t);
      }
      attr.needsUpdate = true;
    };

    const domElement = renderer.domElement;
    const setPointerFromEvent = (event) => {
      const rect = domElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pointer.x = x * 2 - 1;
      pointer.y = -(y * 2 - 1);
    };

    const updateSatelliteHoverTargets = (event) => {
      setPointerFromEvent(event);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(satelliteMeshes, false);
      for (let i = 0; i < satHoverTarget.length; i += 1) {
        satHoverTarget[i] = 0;
      }
      if (hits.length > 0) {
        const idx = satelliteMeshes.indexOf(hits[0].object);
        if (idx >= 0) {
          satHoverTarget[idx] = 1;
        }
      }
      domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    };

    const clearSatelliteHoverTargets = () => {
      for (let i = 0; i < satHoverTarget.length; i += 1) {
        satHoverTarget[i] = 0;
      }
      domElement.style.cursor = 'default';
    };

    domElement.addEventListener('pointermove', updateSatelliteHoverTargets);
    domElement.addEventListener('pointerleave', clearSatelliteHoverTargets);
    domElement.addEventListener('pointercancel', clearSatelliteHoverTargets);

    const positionAttr = geometry.attributes.position;
    const basePositions = positionAttr.array.slice();
    const vertexCount = positionAttr.count;

    let rafId = 0;
    const startTime = performance.now();
    let lastTime = performance.now();
    let hidden = document.hidden;

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const applyVertexWobble = (attr, base, count, t, phase) => {
      for (let i = 0; i < count; i += 1) {
        const stride = i * 3;
        const bx = base[stride];
        const by = base[stride + 1];
        const bz = base[stride + 2];
        const len = Math.hypot(bx, by, bz) || 1;
        const nx = bx / len;
        const ny = by / len;
        const nz = bz / len;

        const waveA = Math.sin(t * 0.00105 + phase + nx * 4.2 + ny * 2.6) * 0.05;
        const waveB = Math.sin(t * 0.00078 + phase * 0.6 + ny * 5.1 + nz * 3.4) * 0.032;
        const sharpA =
          Math.pow(
            Math.max(0, Math.sin(t * 0.0016 + phase * 0.4 + nx * 8.8 + nz * 5.5)),
            3
          ) * 0.11;
        const sharpB =
          Math.pow(
            Math.max(0, Math.sin(t * 0.0012 + phase * 0.5 + ny * 9.2 + nx * 6.4)),
            4
          ) * 0.08;
        const wobble = 1 + waveA + waveB + sharpA + sharpB;

        attr.array[stride] = bx * wobble;
        attr.array[stride + 1] = by * wobble;
        attr.array[stride + 2] = bz * wobble;
      }
      attr.needsUpdate = true;
    };

    const revealCenteredTitle = (element, progress, maxBlur = 10) => {
      if (!element) {
        return;
      }
      const clamped = THREE.MathUtils.clamp(progress, 0, 1);
      const eased = easeOutCubic(clamped);
      const shift = (1 - eased) * 26;
      const blur = (1 - eased) * maxBlur;
      element.style.opacity = String(eased);
      element.style.transform = `translate(-50%, calc(-50% + ${shift}px))`;
      element.style.filter = `blur(${blur}px)`;
    };
    const revealFlowElement = (element, progress, startY = 24, maxBlur = 8) => {
      if (!element) {
        return;
      }
      const clamped = THREE.MathUtils.clamp(progress, 0, 1);
      const eased = easeOutCubic(clamped);
      const shift = (1 - eased) * startY;
      const blur = (1 - eased) * maxBlur;
      element.style.opacity = String(eased);
      element.style.transform = `translateY(${shift}px)`;
      element.style.filter = `blur(${blur}px)`;
    };

    const onVisibility = () => {
      hidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const resize = () => {
      const width = mountNode.clientWidth || window.innerWidth;
      const height = mountNode.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (time) => {
      rafId = requestAnimationFrame(animate);
      if (hidden) {
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const pulse = 1 + Math.sin(time * 0.00045) * 0.01;
      const introRaw = THREE.MathUtils.clamp((time - startTime) / 1800, 0, 1);
      const intro = easeOutCubic(introRaw);
      const mainY = -0.26 + intro * 0.32 + Math.sin(time * 0.00028) * 0.03;

      const smoothSpeed = 22;
      const smoothAlpha = 1 - Math.exp(-smoothSpeed * dt);
      for (let i = 0; i < satHover.length; i += 1) {
        const delta = satHoverTarget[i] - satHover[i];
        if (Math.abs(delta) < 0.0005) {
          satHover[i] = satHoverTarget[i];
        } else {
          satHover[i] += delta * smoothAlpha;
        }
      }

      applyVertexWobble(positionAttr, basePositions, vertexCount, time, 0);
      geometry.computeVertexNormals();

      satelliteData.forEach((sat, index) => {
        applyVertexWobble(
          sat.positionAttr,
          sat.basePositions,
          sat.vertexCount,
          time,
          sat.timePhase
        );
        lerpTowardBase(sat.positionAttr, sat.basePositions, sat.vertexCount, satHover[index]);
        sat.geometry.computeVertexNormals();

        const satMesh = satelliteMeshes[index];
        const extraDriftY = Math.sin(time * 0.0003 + sat.timePhase) * 0.018;
        const driftZ = Math.cos(time * 0.00026 + sat.timePhase * 0.8) * 0.04;
        const verticalOffset = satelliteConfigs[index].yOffset;
        satMesh.position.x = satelliteConfigs[index].x + Math.sin(time * 0.00018 + index) * 0.02;
        satMesh.position.y = mainY + verticalOffset + extraDriftY;
        satMesh.position.z = 0.04 + driftZ;
        satMesh.rotation.y += dt * 0.12 * sat.rotSign;
        satMesh.rotation.x += dt * 0.06;
        satMesh.scale.setScalar((0.72 + intro * 0.28) * 0.42 * pulse);
      });

      const labelPad = mountNode.getBoundingClientRect();
      for (let i = 0; i < satelliteMeshes.length; i += 1) {
        const labelEl = document.getElementById(`hero-sat-label-${i}`);
        if (!labelEl) {
          continue;
        }

        const satMesh = satelliteMeshes[i];
        // Anchor directly on the satellite center (like QODEQ on the main orb),
        // with a hair forward in camera space to reduce "edge" jitter in projection.
        labelWorld.set(satMesh.position.x, satMesh.position.y, satMesh.position.z + 0.02);
        labelWorld.project(camera);

        const isBehind = labelWorld.z > 1;
        const x = labelPad.left + (labelWorld.x * 0.5 + 0.5) * labelPad.width;
        const y = labelPad.top + (-labelWorld.y * 0.5 + 0.5) * labelPad.height;

        labelEl.style.opacity = isBehind ? '0' : String(intro * 0.86);
        if (isBehind) {
          continue;
        }

        labelEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }

      mesh.rotation.y += dt * 0.1;
      mesh.rotation.x += dt * 0.05;
      mesh.position.x = Math.sin(time * 0.00022) * 0.03;
      mesh.position.y = mainY;
      mesh.scale.setScalar((0.76 + intro * 0.24) * pulse);
      material.opacity = intro;

      revealCenteredTitle(titleRef.current, (introRaw - 0.2) / 0.8);
      revealFlowElement(subtitleRef.current, (introRaw - 0.42) / 0.58, 24, 8);
      revealFlowElement(buttonRef.current, (introRaw - 0.55) / 0.45, 42, 6);

      renderer.render(scene, camera);
    };
    animate(lastTime);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      domElement.removeEventListener('pointermove', updateSatelliteHoverTargets);
      domElement.removeEventListener('pointerleave', clearSatelliteHoverTargets);
      domElement.removeEventListener('pointercancel', clearSatelliteHoverTargets);
      geometry.dispose();
      satelliteData.forEach((sat) => {
        sat.geometry.dispose();
      });
      material.dispose();
      renderer.dispose();
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <main id="hero-main" style={containerStyle}>
      <div ref={mountRef} style={canvasStyle} />
      <div style={vignetteStyle} />
      <div style={grainStyle} />
      <div style={labelLayerStyle} aria-hidden="true">
        {satelliteLabelTexts.map((text, index) => (
          <div key={text} id={`hero-sat-label-${index}`} style={satelliteLabelBaseStyle}>
            {text}
          </div>
        ))}
      </div>
      <nav style={anchorNavWrapStyle}>
        <div style={anchorRailStyle}>
          {anchors.map((anchor, index) => {
            const isActive = activeAnchor === anchor.id;
            const isHovered = hoveredAnchor === anchor.id;
            const topPercent = anchors.length > 1 ? (index / (anchors.length - 1)) * 100 : 0;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => scrollToAnchor(anchor.id)}
                onMouseEnter={() => setHoveredAnchor(anchor.id)}
                onMouseLeave={() => setHoveredAnchor('')}
                style={{
                  position: 'absolute',
                  top: `${topPercent}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isActive ? 14 : 10,
                  height: isActive ? 14 : 10,
                  borderRadius: '50%',
                  border: `1px solid ${darkTheme.colors.border}`,
                  background: isActive ? darkTheme.colors.accent : isHovered ? darkTheme.colors.secondary : darkTheme.colors.muted,
                  boxShadow:
                    isActive || isHovered ? '0 0 16px rgba(255,255,255,0.35)' : '0 0 0 rgba(0,0,0,0)',
                  cursor: 'pointer',
                  transition: 'all 220ms ease',
                  padding: 0
                }}
                aria-label={anchor.label}
              >
                {(isActive || isHovered) && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '24px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: darkTheme.colors.primary,
                      fontSize: '14px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      opacity: 0.95
                    }}
                  >
                    {anchor.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
      <div style={overlayStyle}>
        <h1 ref={titleRef} style={{ ...titleStyle, opacity: 0 }}>
          QODEQ
        </h1>
        <p
          ref={subtitleRef}
          style={{
            ...subtitleStyle,
            opacity: 0,
            position: 'relative',
            transform: 'translateY(24px)',
            filter: 'blur(8px)'
          }}
        >
          Qodeq - AI platform automating operations in iGaming
        </p>
        <button
          ref={buttonRef}
          onMouseEnter={() => setIsButtonHover(true)}
          onMouseLeave={() => setIsButtonHover(false)}
          style={{
            ...buttonStyle,
            opacity: 0,
            position: 'relative',
            transform: 'translateY(42px)',
            filter: 'blur(6px)',
            boxShadow: isButtonHover ? '0 0 24px rgba(16,163,127,0.28)' : '0 0 0 rgba(0,0,0,0)',
            borderColor: isButtonHover ? darkTheme.colors.accentHover : darkTheme.colors.border,
            background: isButtonHover
              ? `linear-gradient(135deg, ${darkTheme.colors.accentHover}, ${darkTheme.colors.hover})`
              : `linear-gradient(135deg, ${darkTheme.colors.hover}, ${darkTheme.colors.surface})`
          }}
          type="button"
        >
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 14,
              height: 14,
              borderTop: `1px solid ${darkTheme.colors.secondary}`,
              borderLeft: `1px solid ${darkTheme.colors.secondary}`,
              opacity: 0.8,
              pointerEvents: 'none'
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 14,
              height: 14,
              borderRight: `1px solid ${darkTheme.colors.secondary}`,
              borderBottom: `1px solid ${darkTheme.colors.secondary}`,
              opacity: 0.8,
              pointerEvents: 'none'
            }}
          />
          Join the abyss
        </button>
      </div>
    </main>
  );
};
