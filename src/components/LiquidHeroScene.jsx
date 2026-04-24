import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const containerStyle = {
  width: '100%',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: '#000000'
};

const canvasStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block'
};

const vignetteStyle = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  background: 'rgba(0, 0, 0, 0.2)',
  boxShadow: 'inset 0 0 180px rgba(0, 0, 0, 0.95)'
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
  color: '#ffffff',
  fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
  pointerEvents: 'none'
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
  border: '1px solid rgba(255, 255, 255, 0.7)',
  borderRadius: '999px',
  background: 'transparent',
  color: '#ffffff',
  padding: '9px 22px',
  fontSize: '10px',
  fontWeight: 400,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  pointerEvents: 'auto'
};

export const LiquidHeroScene = () => {
  const mountRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);

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
    renderer.setClearColor(0x000000, 0);
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

    const ambient = new THREE.AmbientLight(0x222222, 0.2);
    scene.add(ambient);

    const geometry = new THREE.IcosahedronGeometry(1.2, 6);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x6f6f6f,
      metalness: 0,
      roughness: 0.92,
      clearcoat: 0,
      clearcoatRoughness: 1,
      sheen: 0,
      sheenColor: new THREE.Color(0x000000),
      transparent: true,
      opacity: 0
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.06;
    scene.add(mesh);

    const positionAttr = geometry.attributes.position;
    const basePositions = positionAttr.array.slice();
    const vertexCount = positionAttr.count;

    let rafId = 0;
    const startTime = performance.now();
    let lastTime = performance.now();
    let hidden = document.hidden;

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
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

      for (let i = 0; i < vertexCount; i += 1) {
        const stride = i * 3;
        const bx = basePositions[stride];
        const by = basePositions[stride + 1];
        const bz = basePositions[stride + 2];
        const len = Math.hypot(bx, by, bz) || 1;
        const nx = bx / len;
        const ny = by / len;
        const nz = bz / len;

        const waveA = Math.sin(time * 0.00105 + nx * 4.2 + ny * 2.6) * 0.05;
        const waveB = Math.sin(time * 0.00078 + ny * 5.1 + nz * 3.4) * 0.032;
        const sharpA =
          Math.pow(
            Math.max(0, Math.sin(time * 0.0016 + nx * 8.8 + nz * 5.5)),
            3
          ) * 0.11;
        const sharpB =
          Math.pow(
            Math.max(0, Math.sin(time * 0.0012 + ny * 9.2 + nx * 6.4)),
            4
          ) * 0.08;
        const wobble = 1 + waveA + waveB + sharpA + sharpB;

        positionAttr.array[stride] = bx * wobble;
        positionAttr.array[stride + 1] = by * wobble;
        positionAttr.array[stride + 2] = bz * wobble;
      }
      positionAttr.needsUpdate = true;
      geometry.computeVertexNormals();

      mesh.rotation.y += dt * 0.1;
      mesh.rotation.x += dt * 0.05;
      mesh.position.x = Math.sin(time * 0.00022) * 0.03;
      mesh.position.y = -0.26 + intro * 0.32 + Math.sin(time * 0.00028) * 0.03;
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
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <main style={containerStyle}>
      <div ref={mountRef} style={canvasStyle} />
      <div style={vignetteStyle} />
      <div style={grainStyle} />
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
          Form follows no origin unknown
        </p>
        <button
          ref={buttonRef}
          style={{
            ...buttonStyle,
            opacity: 0,
            position: 'relative',
            transform: 'translateY(42px)',
            filter: 'blur(6px)'
          }}
          type="button"
        >
          Join the abyss
        </button>
      </div>
    </main>
  );
};
