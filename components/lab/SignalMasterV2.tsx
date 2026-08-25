"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { SIMPLEX_3D, mulberry32, useLabInput, type LabInput } from "./rig";

/**
 * SIGNAL // MASTER v2 — la passe de la RETENUE.
 *
 * Règle : 90 % obscurité / 10 % lumière. La lumière est précieuse.
 *  - Le Core est une masse minérale sombre, quasi invisible au repos ; sa
 *    lumière interne ne suinte que par de fines veines (fissures) — masquée le
 *    reste du temps. Silhouette organique, jamais « une boule ».
 *  - Le champ est vidé en son centre (aucune masse blanche) : dense autour du
 *    Core puis s'éteint dans le vide. Hiérarchie de visibilité, pas de galaxie.
 *  - Le Signal est un ÉVÉNEMENT rare : calme → contraction/tension (les veines
 *    s'allument) → onde très rapide → dispersion → silence.
 *  - Bloom = accent (seuil haut), jamais matière. Beaucoup de vide, assumé.
 */

type Sig = {
  input: LabInput;
  corePos: React.MutableRefObject<THREE.Vector3>;
  pulseR: React.MutableRefObject<number>;
  flash: React.MutableRefObject<number>;
  charge: React.MutableRefObject<number>;
  energy: React.MutableRefObject<number>;
  camArr: React.MutableRefObject<number>; // arrivée caméra (0..1)
  partArr: React.MutableRefObject<number>; // révélation particules
  coreArr: React.MutableRefObject<number>; // révélation Core
};

/* ---------------------------------------------------------------- Field */

const FIELD_VERT = /* glsl */ `
uniform float uTime, uSize, uEnergy;
uniform vec2 uPointer;
uniform vec3 uCore;
uniform float uLens, uSpin, uFlow, uFadeNear, uFadeFar;
uniform float uPulseR, uPulseK;
attribute float aSeed, aScale, aSpeed;
varying float vB, vSpec, vFade;
${SIMPLEX_3D}
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
void main(){
  vec3 p = position;
  float r0 = length(p);
  float ang = uTime * (0.08 + 0.4/(r0+1.0)) * aSpeed * uSpin * (1.0 + uEnergy);
  p.xz = rot(ang) * p.xz;
  p.y += sin(uTime*0.28 + aSeed*6.2831) * 0.05;
  vec3 sp = p*0.2 + vec3(0.0, uTime*0.045, aSeed*10.0);
  p += (uFlow + uEnergy*0.35) * vec3(snoise(sp), snoise(sp+11.0), snoise(sp+27.0)) * smoothstep(1.5, 8.0, r0);
  vec2 pw = uPointer * 4.0;
  vec2 toP = pw - p.xy;
  float pd = length(toP) + 0.001;
  p.xy += normalize(toP) * (0.45/(pd*pd + 0.7)) * smoothstep(8.0, 0.0, r0);
  vec3 toCore = p - uCore;
  float cd = length(toCore) + 0.001;
  float lens = uLens/(cd*cd + 0.2);
  p += normalize(toCore) * lens * 0.35;
  float dR = abs(r0 - uPulseR);
  float ring = exp(-dR*dR*uPulseK);
  p += normalize(p) * ring * 0.8;
  // le champ s'éteint dans le vide (dense près du Core, diffus au loin)
  vFade = 1.0 - smoothstep(uFadeNear, uFadeFar, r0);
  vB = 0.11 + ring*1.5 + lens*0.18 + uEnergy*0.22;
  vSpec = clamp(ring, 0.0, 1.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.001, -mv.z);
  gl_PointSize = uSize * aScale * (240.0/dist);
}
`;

const FIELD_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uPlat, uSpec;
uniform float uArrival, uOpacity;
varying float vB, vSpec, vFade;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d); a *= a;
  vec3 col = mix(uPlat, uSpec, vSpec);
  gl_FragColor = vec4(col * vB, a * uOpacity * uArrival * vFade);
}
`;

type LayerCfg = {
  count: number;
  inner: number;
  outer: number;
  size: number;
  speed: number;
  opacity: number;
  flow: number;
  spin: number;
  lens: number;
  flat: number;
  fadeNear: number;
  fadeFar: number;
  seed: number;
};

function Layer({ sig, cfg }: { sig: Sig; cfg: LayerCfg }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { geo, uniforms } = useMemo(() => {
    const rnd = mulberry32(cfg.seed);
    const positions = new Float32Array(cfg.count * 3);
    const seeds = new Float32Array(cfg.count);
    const scales = new Float32Array(cfg.count);
    const speeds = new Float32Array(cfg.count);
    for (let i = 0; i < cfg.count; i++) {
      const r = cfg.inner + Math.pow(rnd(), 1.5) * (cfg.outer - cfg.inner);
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3] = s * Math.cos(th) * r;
      positions[i * 3 + 1] = u * r * cfg.flat;
      positions[i * 3 + 2] = s * Math.sin(th) * r;
      seeds[i] = rnd();
      scales[i] = 0.5 + rnd() * 1.1;
      speeds[i] = (rnd() > 0.5 ? 1 : -1) * (0.5 + rnd() * 0.8);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: cfg.size },
      uEnergy: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uCore: { value: new THREE.Vector3() },
      uLens: { value: cfg.lens },
      uSpin: { value: cfg.speed },
      uFlow: { value: cfg.flow },
      uFadeNear: { value: cfg.fadeNear },
      uFadeFar: { value: cfg.fadeFar },
      uPulseR: { value: 999 },
      uPulseK: { value: 1.2 },
      uOpacity: { value: cfg.opacity },
      uArrival: { value: 0 },
      uPlat: { value: new THREE.Color("#dbe4f5") },
      uSpec: { value: new THREE.Color("#93a6e6") },
    };
    return { geo, uniforms };
  }, [cfg]);

  useFrame((state) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uEnergy.value = sig.energy.current;
    u.uArrival.value = sig.partArr.current;
    u.uPulseR.value = sig.pulseR.current;
    (u.uPointer.value as THREE.Vector2).set(
      sig.input.pointer.current.x,
      -sig.input.pointer.current.y
    );
    (u.uCore.value as THREE.Vector3).copy(sig.corePos.current);
  });

  return (
    <points geometry={geo} rotation={[0.14, 0, 0.03]}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={FIELD_VERT}
        fragmentShader={FIELD_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------- Core : minéral fissuré */

const CORE_VERT = /* glsl */ `
uniform float uTime;
varying vec3 vWorld, vView, vObj;
${SIMPLEX_3D}
float fbm(vec3 p){ float f=0.0,a=0.5; for(int i=0;i<4;i++){ f+=a*snoise(p); p*=2.03; a*=0.5;} return f; }
void main(){
  // silhouette organique / minérale : déformation forte et asymétrique
  float d = fbm(position*0.9 + vec3(0.0,0.0,uTime*0.05)) * 0.5;
  d += 0.22 * snoise(position*0.5 + 3.0);
  d += 0.12 * fbm(position*2.2);
  vec3 tp = position + normal * d;
  vObj = tp;
  vec4 wp = modelMatrix * vec4(tp, 1.0);
  vWorld = wp.xyz; vView = cameraPosition - wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const CORE_FRAG = /* glsl */ `
precision highp float;
uniform float uTime, uCharge, uFlash, uArrival;
uniform vec3 uBody, uEdge, uVein, uSpec;
varying vec3 vWorld, vView, vObj;
${SIMPLEX_3D}
float fbm(vec3 p){ float f=0.0,a=0.5; for(int i=0;i<3;i++){ f+=a*snoise(p); p*=2.05; a*=0.5;} return f; }
void main(){
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  vec3 v = normalize(vView);
  float fres = pow(1.0 - abs(dot(n, v)), 3.0);

  // corps de verre fumé très sombre (le Core disparaît presque au repos)
  vec3 body = uBody * 0.045;
  // arête précieuse (le seul reflet net au repos)
  vec3 edge = mix(uBody, uEdge, fres*0.4) * fres * 0.55;

  // veines : la lumière interne suinte par de fines fissures, sinon masquée
  float veinN = fbm(vObj * 2.3 + uTime * 0.05);
  float vein = smoothstep(0.045, 0.0, abs(veinN));
  float veinLight = vein * (0.10 + uCharge * 1.1 + uFlash * 1.8);
  vec3 veinCol = mix(uVein, uSpec, clamp(uFlash*0.8 + uCharge*0.4, 0.0, 1.0)) * veinLight;

  vec3 col = body + edge + veinCol;
  float a = (0.34 + fres * 0.5 + veinLight) * uArrival;
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}
`;

function Core({ sig, detail }: { sig: Sig; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCharge: { value: 0 },
      uFlash: { value: 0 },
      uArrival: { value: 0 },
      uBody: { value: new THREE.Color("#8595b8") },
      uEdge: { value: new THREE.Color("#dfe6f5") },
      uVein: { value: new THREE.Color("#cdd9f5") },
      uSpec: { value: new THREE.Color("#9db4ff") },
    }),
    []
  );
  useFrame((state, delta) => {
    const u = matRef.current?.uniforms;
    if (u) {
      u.uTime.value = state.clock.elapsedTime;
      u.uCharge.value = sig.charge.current;
      u.uFlash.value = sig.flash.current;
      u.uArrival.value = sig.coreArr.current;
    }
    const m = ref.current;
    if (m) {
      m.position.copy(sig.corePos.current);
      const breathe =
        (1 + Math.sin(state.clock.elapsedTime * 0.45) * 0.03 - sig.charge.current * 0.12 + sig.flash.current * 0.1) *
        (0.6 + 0.4 * sig.coreArr.current);
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, breathe, Math.min(1, delta * 3)));
      // dérive lente, jamais une rotation évidente
      m.rotation.y += delta * 0.03;
      m.rotation.x += delta * 0.012;
    }
  });
  return (
    <mesh ref={ref} scale={0.001}>
      <icosahedronGeometry args={[1.3, detail]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={CORE_VERT}
        fragmentShader={CORE_FRAG}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* Halo volumétrique — quasi nul au repos, ne respire QUE pendant l'événement */
const HALO_VERT = /* glsl */ `
varying vec3 vView; varying vec3 vNormal;
void main(){
  vec4 wp = modelMatrix * vec4(position,1.0);
  vView = cameraPosition - wp.xyz;
  vNormal = mat3(modelMatrix) * normal;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const HALO_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor, uSpec;
uniform float uEvent, uArrival;
varying vec3 vView; varying vec3 vNormal;
void main(){
  vec3 v = normalize(vView); vec3 n = normalize(vNormal);
  float f = pow(1.0 - abs(dot(n, v)), 2.2);
  float glow = f * uEvent * uArrival;
  vec3 col = mix(uColor, uSpec, clamp(uEvent, 0.0, 1.0));
  gl_FragColor = vec4(col * glow, glow);
}
`;

function Halo({ sig }: { sig: Sig }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#3d4d78") },
      uSpec: { value: new THREE.Color("#8fa4e6") },
      uEvent: { value: 0 },
      uArrival: { value: 0 },
    }),
    []
  );
  useFrame((_, delta) => {
    const u = matRef.current?.uniforms;
    if (u) {
      // événement = charge + flash (près de 0 au calme → halo invisible)
      const ev = sig.charge.current * 0.5 + sig.flash.current;
      u.uEvent.value += (ev - u.uEvent.value) * Math.min(1, delta * 6);
      u.uArrival.value = sig.coreArr.current;
    }
    const m = ref.current;
    if (m) {
      m.position.copy(sig.corePos.current);
      const s = 2.6 * (0.6 + 0.4 * sig.coreArr.current);
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, s, Math.min(1, delta * 4)));
    }
  });
  return (
    <mesh ref={ref} scale={0.001}>
      <icosahedronGeometry args={[1, 3]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={HALO_VERT}
        fragmentShader={HALO_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------------------------------------------- Driver + Camera */

function Driver({ sig }: { sig: Sig }) {
  const startT = useRef(-1);
  const next = useRef(12);
  const firing = useRef(-1);
  const noiseT = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (startT.current < 0) {
      startT.current = t;
      next.current = t + 14;
    }
    const life = t - startT.current;

    // ---- Séquence d'arrivée (0-7s), en couches
    const ss = (a: number, b: number) => {
      const k = THREE.MathUtils.clamp((life - a) / (b - a), 0, 1);
      return k * k * (3 - 2 * k);
    };
    sig.camArr.current = ss(0.2, 6.0); // la caméra avance
    sig.partArr.current = ss(2.0, 3.8); // les particules apparaissent
    sig.coreArr.current = ss(3.2, 5.8); // la matière devient lisible
    // bref éclat de découverte (une lumière interne apparaît ~6-7s) puis calme
    const discover = Math.exp(-Math.pow(life - 6.4, 2.0) * 3.0);

    // ---- Énergie du champ (scroll, non-linéaire)
    sig.input.velocity.current *= 0.9;
    const target = Math.min(1, Math.pow(Math.abs(sig.input.velocity.current) * 1.1, 1.5));
    sig.energy.current += (target - sig.energy.current) * Math.min(1, delta * 2);

    // ---- Core : cible indirecte (curseur + dérive), position varie, décentré
    noiseT.current += delta;
    const driftX = Math.sin(noiseT.current * 0.09) * 0.7 + Math.sin(noiseT.current * 0.031) * 0.5;
    const driftY = Math.cos(noiseT.current * 0.075) * 0.35;
    const tx = driftX + sig.input.pointer.current.x * 0.5;
    const ty = driftY - sig.input.pointer.current.y * 0.4;
    sig.corePos.current.x += (tx - sig.corePos.current.x) * Math.min(1, delta * 0.7);
    sig.corePos.current.y += (ty - sig.corePos.current.y) * Math.min(1, delta * 0.7);

    // ---- SIGNAL : événement rare (calme → charge → onde rapide → silence)
    if (firing.current < 0) {
      const strong = Math.abs(sig.input.velocity.current) > 1.4;
      const ready = life > 9.0;
      const toNext = next.current - t;
      // tension : monte dans les ~2s avant le tir
      sig.charge.current = ready ? THREE.MathUtils.clamp(1.0 - toNext / 2.0, 0.0, 1.0) : 0.0;
      if (ready && (t > next.current || strong)) {
        firing.current = t;
        next.current = t + 18 + Math.random() * 10;
        sig.charge.current = 0;
      }
      sig.pulseR.current = 999;
      // au calme : seulement le petit éclat de découverte de l'arrivée
      sig.flash.current = THREE.MathUtils.lerp(sig.flash.current, discover * 0.6, Math.min(1, delta * 4));
    } else {
      const e = t - firing.current;
      const wave = 1.8; // onde TRÈS rapide
      const total = 2.6;
      if (e > total) {
        firing.current = -1;
      } else {
        sig.pulseR.current = e < wave ? (e / wave) * 10.0 : 999;
        sig.flash.current = Math.exp(-e * e * 6.0); // éclat bref à l'émission
      }
    }
  });
  return null;
}

function Camera({ sig }: { sig: Sig }) {
  useFrame((state, delta) => {
    const k = Math.min(1, delta * 1.4);
    const { pointer, depth, depthTarget } = sig.input;
    pointer.current.x += (pointer.current.tx - pointer.current.x) * Math.min(1, delta * 2.6);
    pointer.current.y += (pointer.current.ty - pointer.current.y) * Math.min(1, delta * 2.6);
    depth.current += (depthTarget.current - depth.current) * Math.min(1, delta * 1.4);

    const t = state.clock.elapsedTime;
    const cam = state.camera;
    const arrive = sig.camArr.current;
    // mouvement ressenti, pas remarqué : orbit minuscule + dérive lente
    const baseX = Math.sin(t * 0.03) * 0.35 + pointer.current.x * 0.8;
    const baseY = Math.sin(t * 0.05) * 0.15 - pointer.current.y * 0.5;
    const baseZ = THREE.MathUtils.lerp(16.0, 7.2, arrive) - depth.current + sig.energy.current * 0.7;
    cam.position.x += (baseX - cam.position.x) * k;
    cam.position.y += (baseY - cam.position.y) * k;
    cam.position.z += (baseZ - cam.position.z) * k;
    cam.lookAt(
      sig.corePos.current.x - 0.5,
      sig.corePos.current.y,
      sig.corePos.current.z
    );
  });
  return null;
}

/* ---------------------------------------------------------------- Scene */

export default function SignalMasterV2() {
  const input = useLabInput();
  const sig: Sig = {
    input,
    corePos: useRef(new THREE.Vector3(0.6, 0, 0)),
    pulseR: useRef(999),
    flash: useRef(0),
    charge: useRef(0),
    energy: useRef(0),
    camArr: useRef(0),
    partArr: useRef(0),
    coreArr: useRef(0),
  };
  const [showType, setShowType] = useState(false);
  const mobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  useEffect(() => {
    const id = window.setTimeout(() => setShowType(true), 7000);
    return () => window.clearTimeout(id);
  }, []);

  // Hiérarchie de VISIBILITÉ : micro (nombreuses, presque invisibles),
  // moyennes (limitées), foreground (rares). Centre vidé (inner ≥ 2).
  const layers: LayerCfg[] = mobile
    ? [
        { count: 3000, inner: 2.0, outer: 8, size: 0.9, speed: 1, opacity: 0.5, flow: 0.16, spin: 1, lens: 0.45, flat: 0.7, fadeNear: 3.5, fadeFar: 8, seed: 11 },
        { count: 1200, inner: 10, outer: 26, size: 1.0, speed: 0.15, opacity: 0.3, flow: 0.04, spin: 0.2, lens: 0, flat: 1, fadeNear: 40, fadeFar: 60, seed: 22 },
      ]
    : [
        // micro — nombreuses mais très discrètes, denses près du Core
        { count: 7000, inner: 2.0, outer: 9, size: 0.85, speed: 1, opacity: 0.55, flow: 0.16, spin: 1, lens: 0.5, flat: 0.7, fadeNear: 4, fadeFar: 9, seed: 11 },
        // moyennes — nombre limité, mi-distance
        { count: 1400, inner: 3.5, outer: 15, size: 1.3, speed: 0.5, opacity: 0.32, flow: 0.1, spin: 0.5, lens: 0.15, flat: 0.85, fadeNear: 6, fadeFar: 16, seed: 22 },
        // deep field — poussière lointaine, uniformément faible
        { count: 2600, inner: 14, outer: 34, size: 1.0, speed: 0.12, opacity: 0.26, flow: 0.03, spin: 0.18, lens: 0, flat: 1, fadeNear: 50, fadeFar: 80, seed: 33 },
        // foreground — très rares, parallaxe (jamais remplir le viewport)
        { count: 26, inner: 2.6, outer: 4.4, size: 3.4, speed: 0.5, opacity: 0.12, flow: 0.1, spin: 0.6, lens: 0.15, flat: 0.9, fadeNear: 4, fadeFar: 6, seed: 44 },
      ];

  return (
    <>
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0, 16], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#03050b", 1);
          gl.toneMappingExposure = 0.82; // exposition plus basse → obscurité
        }}
      >
        <fog attach="fog" args={["#03050b", 6, 30]} />
        {layers.map((cfg) => (
          <Layer key={cfg.seed} sig={sig} cfg={cfg} />
        ))}
        <Halo sig={sig} />
        <Core sig={sig} detail={mobile ? 3 : 4} />
        <Driver sig={sig} />
        <Camera sig={sig} />

        {!mobile && (
          <EffectComposer>
            {/* BLOOM = ACCENT : seuil haut, intensité basse → jamais toute la scène */}
            <Bloom
              intensity={0.38}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.25}
              mipmapBlur
              radius={0.5}
            />
            <Vignette offset={0.24} darkness={0.82} />
          </EffectComposer>
        )}
      </Canvas>

      {/* Composition éditoriale — apparaît dans le silence, après la découverte */}
      <div
        className="pointer-events-none absolute bottom-[15%] left-[7%] max-w-xl transition-all duration-1000 ease-out"
        style={{
          opacity: showType ? 1 : 0,
          transform: showType ? "translateY(0)" : "translateY(24px)",
          filter: showType ? "blur(0)" : "blur(8px)",
        }}
      >
        <p className="mb-5 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-white/40">
          Nikita Resta
        </p>
        <h1
          className="text-5xl font-medium leading-[1.02] tracking-tight text-white/90 sm:text-7xl"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Créateur d&apos;
          <span
            className="font-normal italic text-white"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            expériences
          </span>
          <br />
          numériques.
        </h1>
      </div>
    </>
  );
}
