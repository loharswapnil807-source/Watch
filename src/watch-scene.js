import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createWatch } from './watch-model.js';

export function createWatchScene(container, { anatomy = false, reducedMotion = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    container.classList.add('no-webgl');
    return { setExplosion: v => container.style.setProperty('--explosion', v), dispose() {}, available: false };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 560 ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(anatomy ? 36 : 33, 1, .1, 50);
  camera.position.set(0, 0, anatomy ? 11 : 12.4);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04, .1, 100, { size: 128 });
  scene.environment = environment.texture;
  scene.environmentIntensity = .85;
  room.dispose();
  pmrem.dispose();

  scene.add(new THREE.AmbientLight('#e5ead6', .35));
  const key = new THREE.DirectionalLight('#fff6dc', 2.3);
  key.position.set(-4, 5, 7); scene.add(key);
  const fill = new THREE.DirectionalLight('#b8d1c9', 1.4);
  fill.position.set(5, -2, 5); scene.add(fill);
  const rim = new THREE.DirectionalLight('#c4b28b', 1.6);
  rim.position.set(-3, 1, -5); scene.add(rim);

  const watch = createWatch({ compact: anatomy });
  scene.add(watch.group);
  watch.group.rotation.set(anatomy ? -.46 : .15, anatomy ? .76 : -.35, anatomy ? -.18 : -.36);
  let width = 0;
  let height = 0;
  let targetExplosion = 0;
  let currentExplosion = 0;
  let pointerX = 0;
  let pointerY = 0;
  let visible = true;
  let paused = document.hidden;
  let frame = 0;
  let lastFrame = 0;
  const started = performance.now();

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const mobile = window.innerWidth <= 560;
    camera.position.z = anatomy ? (mobile ? 11.2 : 11) : (mobile ? 12.7 : 12.4);
    watch.group.scale.setScalar(anatomy ? (mobile ? .82 : 1) : 1);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestRender();
  }, { rootMargin: '100px' });
  observer.observe(container);

  function pointer(event) {
    if (reducedMotion || event.pointerType === 'touch') return;
    const r = container.getBoundingClientRect();
    pointerX = ((event.clientX - r.left) / r.width - .5) * .16;
    pointerY = ((event.clientY - r.top) / r.height - .5) * .12;
    requestRender();
  }
  function resetPointer() { pointerX = 0; pointerY = 0; }
  function visibility() { paused = document.hidden; if (!paused) requestRender(); }
  container.addEventListener('pointermove', pointer);
  container.addEventListener('pointerleave', resetPointer);
  document.addEventListener('visibilitychange', visibility);

  function requestRender() {
    if (!frame && visible && !paused) frame = requestAnimationFrame(render);
  }

  function render(now) {
    frame = 0;
    if (!visible || paused) return;
    // Cap to 30 FPS on small screens, with all off-screen rendering suspended.
    if (window.innerWidth <= 560 && now - lastFrame < 30) { requestRender(); return; }
    const elapsed = (now - started) / 1000;
    const delta = Math.min((now - lastFrame) / 1000 || .016, .1);
    lastFrame = now;
    currentExplosion = reducedMotion ? targetExplosion : THREE.MathUtils.damp(currentExplosion, targetExplosion, 7, delta);
    if (Math.abs(targetExplosion - currentExplosion) < .0001) currentExplosion = targetExplosion;
    watch.setExplosion(currentExplosion);
    if (anatomy) container.dataset.layerSeparation = (watch.layers.crystal.position.z - watch.layers.caseback.position.z).toFixed(3);
    if (anatomy) {
      watch.group.rotation.x = -.46 + currentExplosion * .09;
      watch.group.rotation.y = .76 + currentExplosion * .13 + pointerX;
      watch.group.rotation.z = -.18;
    } else {
      watch.group.rotation.x = .15 + pointerY + (reducedMotion ? 0 : Math.sin(elapsed * .4) * .025);
      watch.group.rotation.y = -.35 + pointerX + (reducedMotion ? 0 : Math.sin(elapsed * .25) * .045);
      watch.group.position.y = reducedMotion ? 0 : Math.sin(elapsed * .6) * .055;
    }
    watch.tick(elapsed, reducedMotion);
    renderer.render(scene, camera);
    container.classList.add('has-webgl');
    // Reduced motion renders on demand; normal mode keeps the second hand alive.
    if (!reducedMotion || currentExplosion !== targetExplosion) requestRender();
  }
  resize();
  requestRender();

  return {
    available: true,
    setExplosion(value) { targetExplosion = THREE.MathUtils.clamp(value, 0, 1); requestRender(); },
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect(); observer.disconnect();
      container.removeEventListener('pointermove', pointer);
      container.removeEventListener('pointerleave', resetPointer);
      document.removeEventListener('visibilitychange', visibility);
      watch.dispose(); environment.dispose(); renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
