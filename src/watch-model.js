import * as THREE from 'three';

const TAU = Math.PI * 2;

function ring(outer, inner, depth, material) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, TAU, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, TAU, true);
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSegments: 3, steps: 1,
    bevelSize: Math.min(.025, depth / 4), bevelThickness: Math.min(.025, depth / 4), curveSegments: 64,
  });
  geometry.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geometry, material);
}

function disk(radius, depth, material, z = 0) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 80), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.z = z;
  return mesh;
}

function roundedBox(width, height, depth, material, radius = .04) {
  const x = -width / 2;
  const y = -height / 2;
  const s = new THREE.Shape();
  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius);
  s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height);
  s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2, steps: 1 });
  geo.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geo, material);
}

function gear(radius, teeth, material) {
  const shape = new THREE.Shape();
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * TAU;
    const r = i % 4 === 1 || i % 4 === 2 ? radius : radius * .87;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, radius * .17, 0, TAU, true);
  shape.holes.push(hole);
  for (let i = 0; i < 5; i++) {
    const a = i * TAU / 5;
    const h = new THREE.Path();
    h.absarc(Math.cos(a) * radius * .53, Math.sin(a) * radius * .53, radius * .18, 0, TAU, true);
    shape.holes.push(h);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: .045, bevelEnabled: true, bevelSize: .008, bevelThickness: .008, bevelSegments: 1, curveSegments: 16 });
  return new THREE.Mesh(geometry, material);
}

function dialTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(450, 420, 0, 512, 512, 600);
  gradient.addColorStop(0, '#3b463b');
  gradient.addColorStop(.5, '#29382d');
  gradient.addColorStop(1, '#13201c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);
  // A fine, deterministic sunburst finish rather than a downloaded dial image.
  for (let i = 0; i < 1600; i++) {
    const a = i * TAU / 1600;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(205,213,185,0.038)' : 'rgba(0,0,0,0.045)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(512, 512);
    ctx.lineTo(512 + Math.cos(a) * 725, 512 + Math.sin(a) * 725);
    ctx.stroke();
  }
  ctx.strokeStyle = '#9ba285';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(512, 512, 454, 0, TAU); ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU - Math.PI / 2;
    const isHour = i % 5 === 0;
    ctx.strokeStyle = isHour ? '#d1c8a7' : '#90987e';
    ctx.lineWidth = isHour ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(512 + Math.cos(a) * 438, 512 + Math.sin(a) * 438);
    ctx.lineTo(512 + Math.cos(a) * (isHour ? 417 : 425), 512 + Math.sin(a) * (isHour ? 417 : 425));
    ctx.stroke();
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d6d6c5';
  ctx.font = '500 45px Arial';
  ctx.fillText('A R G O S', 512, 305);
  ctx.fillStyle = '#a8b095';
  ctx.font = '14px Arial';
  ctx.fillText('M E C H A N I C A L', 512, 341);
  ctx.font = 'italic 25px Georgia';
  ctx.fillStyle = '#bec3ad';
  ctx.fillText('Continuum', 512, 678);
  ctx.font = '12px Arial';
  ctx.fillStyle = '#8d997e';
  ctx.fillText('A U T O M A T I C', 512, 710);
  ctx.font = '10px Arial';
  ctx.fillText('A  C O N C E P T U A L  S T U D Y', 512, 862);
  // Framed date aperture.
  ctx.fillStyle = '#abb39b'; ctx.fillRect(758, 482, 75, 60);
  ctx.fillStyle = '#dedecb'; ctx.fillRect(762, 486, 67, 52);
  ctx.fillStyle = '#283527'; ctx.font = '29px Georgia'; ctx.fillText('22', 795, 523);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function hand(length, width, material) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -.14);
  shape.lineTo(-width / 2, length * .77);
  shape.lineTo(0, length);
  shape.lineTo(width / 2, length * .77);
  shape.lineTo(width / 2, -.14);
  shape.closePath();
  return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .018, bevelEnabled: true, bevelSize: .005, bevelThickness: .004, bevelSegments: 1 }), material);
}

export function createWatch({ compact = false } = {}) {
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: '#d0d4cb', metalness: 1, roughness: .22 });
  const brushed = new THREE.MeshStandardMaterial({ color: '#9da99f', metalness: .92, roughness: .4 });
  const polished = new THREE.MeshStandardMaterial({ color: '#e0e3d9', metalness: 1, roughness: .12 });
  const brass = new THREE.MeshStandardMaterial({ color: '#b69a57', metalness: .9, roughness: .31 });
  const gold = new THREE.MeshStandardMaterial({ color: '#d5c291', metalness: .93, roughness: .19 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: '#69776b', metalness: .9, roughness: .38 });
  const ruby = new THREE.MeshStandardMaterial({ color: '#7c2544', metalness: .3, roughness: .15 });

  const layers = {};
  for (const name of ['caseback', 'case', 'movement', 'dial', 'hands', 'bezel', 'crystal', 'topBracelet', 'bottomBracelet']) {
    layers[name] = new THREE.Group();
    layers[name].name = name;
    group.add(layers[name]);
  }

  // The case is open all the way through, so the mechanism really is revealed.
  const caseBody = ring(1.56, 1.34, .28, brushed);
  layers.case.add(caseBody);
  const edge = ring(1.565, 1.45, .07, polished);
  edge.position.z = -.13;
  layers.case.add(edge);
  for (const side of [-1, 1]) {
    for (const x of [-.76, .76]) {
      const lug = roundedBox(.23, .82, .21, steel, .06);
      lug.position.set(x, side * 1.57, -.01);
      lug.rotation.x = side * -.12;
      layers.case.add(lug);
    }
  }
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .25, 48), steel);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(1.69, 0, .01);
  layers.case.add(crown);
  for (let i = 0; i < 40; i++) {
    const a = i * TAU / 40;
    const groove = new THREE.Mesh(new THREE.BoxGeometry(.24, .018, .018), polished);
    groove.position.set(1.69, Math.cos(a) * .19, .01 + Math.sin(a) * .19);
    groove.rotation.x = a;
    layers.case.add(groove);
  }
  const crownCap = new THREE.Mesh(new THREE.CylinderGeometry(.145, .145, .012, 40), darkSteel);
  crownCap.rotation.z = Math.PI / 2;
  crownCap.position.set(1.82, 0, .01);
  layers.case.add(crownCap);

  const back = disk(1.37, .07, brushed, -.22);
  layers.caseback.add(back);
  const backRing = ring(1.46, 1.24, .05, steel);
  backRing.position.z = -.26;
  layers.caseback.add(backRing);
  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6;
    const screw = disk(.045, .018, polished, -.265);
    screw.position.x = Math.cos(a) * 1.34;
    screw.position.y = Math.sin(a) * 1.34;
    layers.caseback.add(screw);
  }

  // Main plate, wheels, bridges, screws, jewel bearings and winding rotor.
  layers.movement.add(disk(1.28, .06, brushed, -.06));
  const movementRing = ring(1.27, 1.18, .065, brass);
  layers.movement.add(movementRing);
  const gears = [];
  const specs = [
    [-.57, .49, .42, 36], [.36, .61, .28, 26], [.57, .05, .37, 32],
    [.17, -.44, .32, 30], [-.49, -.33, .39, 32], [-.03, .04, .24, 24],
  ];
  specs.forEach(([x, y, r, teeth], index) => {
    const wheel = gear(r, teeth, index % 2 ? brass : gold);
    wheel.position.set(x, y, .03 + index % 2 * .04);
    layers.movement.add(wheel);
    gears.push(wheel);
    const axle = disk(.035, .11, polished, .1);
    axle.position.set(x, y, .1);
    layers.movement.add(axle);
    const jewel = disk(.045, .025, ruby, .155);
    jewel.position.set(x, y, .155);
    layers.movement.add(jewel);
  });
  const balance = ring(.33, .29, .035, gold);
  balance.position.set(-.74, -.66, .13);
  layers.movement.add(balance);
  const spiralPoints = [];
  for (let i = 0; i <= 160; i++) {
    const a = i / 160 * Math.PI * 12;
    const r = .045 + i / 160 * .21;
    spiralPoints.push(new THREE.Vector3(-.74 + Math.cos(a) * r, -.66 + Math.sin(a) * r, .155));
  }
  const hairspring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(spiralPoints), new THREE.LineBasicMaterial({ color: '#a6bfc0' }));
  layers.movement.add(hairspring);
  const bridge1 = roundedBox(1.45, .23, .07, brushed, .09);
  bridge1.position.set(.14, .27, .16);
  bridge1.rotation.z = -.5;
  layers.movement.add(bridge1);
  const bridge2 = roundedBox(.98, .17, .06, steel, .06);
  bridge2.position.set(-.4, -.31, .17);
  bridge2.rotation.z = .55;
  layers.movement.add(bridge2);
  const screws = [];
  for (const [x, y] of [[-.8, .96], [.77, .91], [.93, -.65], [-.96, -.64], [-.46, .55], [.7, .04], [-.78, -.54]]) {
    const screw = new THREE.Group();
    screw.add(disk(.053, .024, polished));
    const slot = new THREE.Mesh(new THREE.BoxGeometry(.067, .012, .004), darkSteel);
    slot.position.z = .015;
    slot.rotation.z = x;
    screw.add(slot);
    screw.position.set(x, y, .22);
    layers.movement.add(screw);
    screws.push(screw);
  }
  const rotorShape = new THREE.Shape();
  rotorShape.absarc(0, 0, 1.13, Math.PI, TAU, false);
  rotorShape.absarc(0, 0, .79, TAU, Math.PI, true);
  rotorShape.closePath();
  const rotor = new THREE.Mesh(new THREE.ExtrudeGeometry(rotorShape, { depth: .04, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2, curveSegments: 50 }), brass);
  rotor.position.z = .18;
  layers.movement.add(rotor);

  // Printed sunburst dial plus applied indices, rather than a flat watch image.
  const texture = dialTexture();
  const dialMaterial = new THREE.MeshStandardMaterial({ map: texture, metalness: .38, roughness: .44 });
  const dialFace = new THREE.Mesh(new THREE.CircleGeometry(1.31, 96), dialMaterial);
  dialFace.position.z = .295;
  layers.dial.add(dialFace);
  const dialEdge = ring(1.32, 1.29, .035, darkSteel);
  dialEdge.position.z = .27;
  layers.dial.add(dialEdge);
  for (let i = 0; i < 12; i++) {
    if (i === 3) continue;
    const a = -i * TAU / 12;
    const index = roundedBox(i === 0 ? .072 : .045, .16, .026, gold, .007);
    index.position.set(-Math.sin(a) * 1.04, Math.cos(a) * 1.04, .322);
    index.rotation.z = a;
    layers.dial.add(index);
    if (i === 0) {
      const secondIndex = index.clone();
      secondIndex.position.x += .10;
      index.position.x -= .05;
      layers.dial.add(secondIndex);
    }
  }
  const hour = hand(.76, .085, polished);
  hour.rotation.z = 55 * Math.PI / 180;
  hour.position.z = .36;
  layers.hands.add(hour);
  const minute = hand(1.03, .055, polished);
  minute.rotation.z = -60 * Math.PI / 180;
  minute.position.z = .391;
  layers.hands.add(minute);
  const seconds = hand(1.14, .012, gold);
  seconds.position.z = .422;
  layers.hands.add(seconds);
  layers.hands.add(disk(.07, .042, gold, .447));

  const bezel = ring(1.55, 1.33, .1, polished);
  bezel.position.z = .31;
  layers.bezel.add(bezel);
  const innerBezel = ring(1.35, 1.30, .055, gold);
  innerBezel.position.z = .347;
  layers.bezel.add(innerBezel);
  const glass = disk(1.32, .045, new THREE.MeshPhysicalMaterial({
    color: '#c6e0dc', metalness: .05, roughness: .03,
    transparent: true, opacity: .065, depthWrite: false, clearcoat: 1, clearcoatRoughness: .05,
    side: THREE.DoubleSide,
  }), .40);
  layers.crystal.add(glass);
  const crystalEdge = ring(1.325, 1.31, .025, new THREE.MeshStandardMaterial({ color: '#b8d5cb', metalness: .55, roughness: .12, transparent: true, opacity: .32 }));
  crystalEdge.position.z = .425;
  layers.crystal.add(crystalEdge);

  // Articulated, individually machined five-link steel bracelet.
  const links = compact ? 3 : 8;
  for (const side of [-1, 1]) {
    const bracelet = side > 0 ? layers.topBracelet : layers.bottomBracelet;
    for (let i = 0; i < links; i++) {
      const linkGroup = new THREE.Group();
      const width = 1.49 - i * .026;
      for (let j = 0; j < 5; j++) {
        const isCenter = j > 0 && j < 4;
        const segment = roundedBox(width * (isCenter ? .155 : .252), .29, isCenter ? .15 : .17, isCenter ? polished : brushed, .045);
        const positions = [-.377, -.155, 0, .155, .377];
        segment.position.x = positions[j] * width;
        segment.position.z = isCenter ? .035 : 0;
        linkGroup.add(segment);
      }
      linkGroup.position.set(0, side * (1.70 + i * .31), -.08 - Math.pow(i / links, 2) * .48);
      linkGroup.rotation.x = side * (i / links) * -.30;
      bracelet.add(linkGroup);
    }
  }

  let explosion = 0;
  function setExplosion(value) {
    explosion = THREE.MathUtils.clamp(value, 0, 1);
    layers.crystal.position.set(0, .10 * explosion, 2.4 * explosion);
    layers.bezel.position.set(0, .06 * explosion, 1.85 * explosion);
    layers.hands.position.set(0, 0, 1.28 * explosion);
    layers.dial.position.set(0, 0, .9 * explosion);
    layers.movement.position.set(0, 0, -.08 * explosion);
    layers.case.position.set(0, 0, -.70 * explosion);
    layers.caseback.position.set(0, 0, -1.65 * explosion);
    layers.topBracelet.position.set(0, .3 * explosion, -.70 * explosion);
    layers.bottomBracelet.position.set(0, -.3 * explosion, -.70 * explosion);
    gears.forEach((g, i) => { g.position.z = .03 + i % 2 * .04 + explosion * (i % 2 ? .15 : .04); });
    screws.forEach(s => { s.position.z = .22 + explosion * .28; });
  }

  function tick(time, reducedMotion) {
    if (reducedMotion) return;
    seconds.rotation.z = -time * .105;
    gears.forEach((g, i) => { g.rotation.z = time * (i % 2 ? -.04 : .035) * (i + 1); });
    balance.rotation.z = Math.sin(time * 7) * .13;
    rotor.rotation.z = Math.sin(time * .35) * .10 * explosion;
  }

  function dispose() {
    const geometries = new Set();
    const materials = new Set();
    group.traverse(obj => {
      if (obj.geometry) geometries.add(obj.geometry);
      if (obj.material) {
        const list = Array.isArray(obj.material) ? obj.material : [obj.material];
        list.forEach(m => materials.add(m));
      }
    });
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    texture.dispose();
  }

  return { group, layers, setExplosion, tick, dispose };
}
