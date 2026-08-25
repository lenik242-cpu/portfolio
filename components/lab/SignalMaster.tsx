"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { SIMPLEX_3D, mulberry32, useLabInput, type LabInput } from "./rig";

/**
 * SIGNAL // MASTER — passe visuelle maximale.
 *
 * SPACE  : hiérarchie de profondeur réelle — deep background (poussière lente),
 *          champ principal (gravitationnel), foreground (bokeh de parallaxe) +
 *          fog volumétrique. Le viewport est une fenêtre vers plus grand.
 * MATTER : noyau à trois lectures — halo volumétrique, coque de verre fumé
 *          fracturée (fresnel + facettes), cœur de lumière interne.
 * SIGNAL : un événement — calme → tension (le cœur se contracte et charge) →
 *          onde de choc qui traverse le champ → retour au calme. Rare.
 * Chaîne : curseur → espace/champ → noyau → caméra ; scroll velocity → énergie
 *          du champ. Séquence d'arrivée cinématique. Bloom + vignette maîtrisés.
 */

type Sig = {
  input: LabInput;
  corePos: React.MutableRefObject<THREE.Vector3>;
  pulseR: React.MutableRefObject<number>;
  flash: React.MutableRefObject<number>;
  charge: React.MutableRefObject<number>; // tension avant l'onde (0..1)
  energy: React.MutableRefObject<number>; // énergie du champ (scroll)
  arrival: React.MutableRefObject<number>; // séquence d'arrivée (0..1)
};

/* --------------------------------------------------------------- Field */

const FIELD_VERT = /* glsl */ `
uniform float uTime, uSize, uEnergy;
uniform vec2 uPointer;
uniform vec3 uCore;
uniform float uLens, uSpin, uFlow;
uniform float uPulseR, uPulseK;
attribute float aSeed, aScale, aSpeed;
varying float vB, vSpec;
${SIMPLEX_3D}
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
void main(){
  vec3 p = position;
  float r0 = length(p);
  float ang = uTime * (0.10 + 0.45/(r0+0.8)) * aSpeed * uSpin * (1.0 + uEnergy);
  p.xz = rot(ang) * p.xz;
  p.y += sin(uTime*0.3 + aSeed*6.2831) * 0.06;
  vec3 sp = p*0.2 + vec3(0.0, uTime*0.05, aSeed*10.0);
  p += (uFlow + uEnergy*0.4) * vec3(snoise(sp), snoise(sp+11.0), snoise(sp+27.0)) * smoothstep(1.2, 7.0, r0);
  // puits du curseur
  vec2 pw = uPointer * 4.2;
  vec2 toP = pw - p.xy;
  float pd = length(toP) + 0.001;
  p.xy += normalize(toP) * (0.5/(pd*pd + 0.6)) * smoothstep(7.0, 0.0, r0);
  // lentille gravitationnelle autour du noyau
  vec3 toCore = p - uCore;
  float cd = length(toCore) + 0.001;
  float lens = uLens/(cd*cd + 0.18);
  p += normalize(toCore) * lens * 0.4;
  // SIGNAL : onde
  float dR = abs(r0 - uPulseR);
  float ring = exp(-dR*dR*uPulseK);
  p += normalize(p) * ring * 0.75;
  vB = 0.28 + ring*1.4 + lens*0.25 + uEnergy*0.3;
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
varying float vB, vSpec;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d); a *= a;
  vec3 col = mix(uPlat, uSpec, vSpec);
  gl_FragColor = vec4(col * vB, a * uOpacity * uArrival);
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
      const r = cfg.inner + Math.pow(rnd(), 1.4) * (cfg.outer - cfg.inner);
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3] = s * Math.cos(th) * r;
      positions[i * 3 + 1] = u * r * cfg.flat;
      positions[i * 3 + 2] = s * Math.sin(th) * r;
      seeds[i] = rnd();
      scales[i] = 0.5 + rnd() * 1.2;
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
      uPulseR: { value: 999 },
      uPulseK: { value: 1.3 },
      uOpacity: { value: cfg.opacity },
      uArrival: { value: 0 },
      uPlat: { value: new THREE.Color("#eaf0ff") },
      uSpec: { value: new THREE.Color("#9db4ff") },
    };
    return { geo, uniforms };
  }, [cfg]);

  useFrame((state) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uEnergy.value = sig.energy.current;
    u.uArrival.value = sig.arrival.current;
    u.uPulseR.value = sig.pulseR.current;
    (u.uPointer.value as THREE.Vector2).set(
      sig.input.pointer.current.x,
      -sig.input.pointer.current.y
    );
    (u.uCore.value as THREE.Vector3).copy(sig.corePos.current);
  });

  return (
    <points geometry={geo} rotation={[0.16, 0, 0.04]}>
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

/* ----------------------------------------------------------- Core parts */

const SHELL_VERT = /* glsl */ `
uniform float uTime, uAmp;
varying vec3 vWorld, vView;
${SIMPLEX_3D}
float fbm(vec3 p){ float f=0.0,a=0.5; for(int i=0;i<3;i++){ f+=a*snoise(p); p*=2.02; a*=0.5;} return f; }
void main(){
  float d = fbm(position*1.15 + vec3(0.0,0.0,uTime*0.09));
  vec3 tp = position + normal * d * uAmp;
  vec4 wp = modelMatrix * vec4(tp, 1.0);
  vWorld = wp.xyz; vView = cameraPosition - wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const SHELL_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uTint, uSpec;
uniform float uArrival;
varying vec3 vWorld, vView;
void main(){
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  vec3 v = normalize(vView);
  float fres = pow(1.0 - abs(dot(n, v)), 3.0);
  // verre fumé : un corps sombre + une arête lumineuse
  vec3 body = uTint * 0.10;
  vec3 col = body + mix(uTint, uSpec, fres*0.4) * fres;
  float a = (0.12 + fres * 0.7) * uArrival;
  gl_FragColor = vec4(col, a);
}
`;

function Shell({ sig, detail }: { sig: Sig; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.24 },
      uArrival: { value: 0 },
      uTint: { value: new THREE.Color("#c6d0e6") },
      uSpec: { value: new THREE.Color("#b8a6ff") },
    }),
    []
  );
  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uArrival.value = sig.arrival.current;
    }
    const m = ref.current;
    if (m) {
      m.position.copy(sig.corePos.current);
      const breathe =
        (1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04 - sig.charge.current * 0.1 + sig.flash.current * 0.14) *
        sig.arrival.current;
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, breathe, Math.min(1, delta * 4)));
      m.rotation.y += delta * 0.045;
      m.rotation.x += delta * 0.018;
    }
  });
  return (
    <mesh ref={ref} scale={0.001}>
      <icosahedronGeometry args={[1.35, detail]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={SHELL_VERT}
        fragmentShader={SHELL_FRAG}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

const GLOW_VERT = /* glsl */ `
varying vec3 vView; varying vec3 vNormal;
void main(){
  vec4 wp = modelMatrix * vec4(position,1.0);
  vView = cameraPosition - wp.xyz;
  vNormal = mat3(modelMatrix) * normal;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const GLOW_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor, uSpec;
uniform float uFlash, uArrival, uInner;
varying vec3 vView; varying vec3 vNormal;
void main(){
  vec3 v = normalize(vView); vec3 n = normalize(vNormal);
  float f = pow(1.0 - abs(dot(n, v)), uInner);
  float glow = (0.4 + f * 0.9 + uFlash * 1.7) * uArrival;
  vec3 col = mix(uColor, uSpec, clamp(f*0.35 + uFlash, 0.0, 1.0));
  gl_FragColor = vec4(col * glow, 1.0);
}
`;

function Glow({
  sig,
  radius,
  inner,
  color,
  spec,
}: {
  sig: Sig;
  radius: number;
  inner: number;
  color: string;
  spec: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uSpec: { value: new THREE.Color(spec) },
      uFlash: { value: 0 },
      uArrival: { value: 0 },
      uInner: { value: inner },
    }),
    [color, spec, inner]
  );
  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uFlash.value = sig.flash.current + sig.charge.current * 0.5;
      matRef.current.uniforms.uArrival.value = sig.arrival.current;
    }
    const m = ref.current;
    if (m) {
      m.position.copy(sig.corePos.current);
      const s = (radius + sig.flash.current * radius * 0.25 - sig.charge.current * radius * 0.15) * sig.arrival.current;
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, Math.max(0.001, s), Math.min(1, delta * 5)));
    }
  });
  return (
    <mesh ref={ref} scale={0.001}>
      <icosahedronGeometry args={[1, 3]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={GLOW_VERT}
        fragmentShader={GLOW_FRAG}
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
  const next = useRef(6);
  const firing = useRef(-1);
  const noiseT = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (startT.current < 0) startT.current = t;
    const life = t - startT.current;

    // Séquence d'arrivée : 0 → 1 sur ~4.5s (easing doux)
    const ap = Math.min(1, life / 4.5);
    sig.arrival.current = ap * ap * (3 - 2 * ap);

    // Énergie du champ depuis la vélocité de scroll (non-linéaire)
    sig.input.velocity.current *= 0.9;
    const target = Math.min(1, Math.pow(Math.abs(sig.input.velocity.current) * 1.2, 1.5));
    sig.energy.current += (target - sig.energy.current) * Math.min(1, delta * 2);

    // Noyau : cible indirecte (curseur + dérive), forte inertie, décentré à droite
    noiseT.current += delta;
    const tx = 0.9 + sig.input.pointer.current.x * 0.6 + Math.sin(noiseT.current * 0.12) * 0.22;
    const ty = -sig.input.pointer.current.y * 0.45 + Math.cos(noiseT.current * 0.1) * 0.18;
    sig.corePos.current.x += (tx - sig.corePos.current.x) * Math.min(1, delta * 0.8);
    sig.corePos.current.y += (ty - sig.corePos.current.y) * Math.min(1, delta * 0.8);

    // SIGNAL : calme → charge → onde → calme (rare)
    if (firing.current < 0) {
      const strong = Math.abs(sig.input.velocity.current) > 1.1;
      const ready = life > 5.5;
      // tension : monte doucement dans les ~1.2s avant le tir
      const toNext = next.current - t;
      sig.charge.current = ready ? THREE.MathUtils.clamp(1.0 - toNext / 1.3, 0.0, 1.0) : 0.0;
      if (ready && (t > next.current || strong)) {
        firing.current = t;
        next.current = t + 10 + Math.random() * 5;
        sig.charge.current = 0;
      }
      sig.pulseR.current = 999;
      sig.flash.current = THREE.MathUtils.lerp(sig.flash.current, 0, Math.min(1, delta * 3));
    } else {
      const e = t - firing.current;
      const dur = 3.0;
      if (e > dur) {
        firing.current = -1;
      } else {
        const k = e / dur;
        sig.pulseR.current = k * 10.0;
        sig.flash.current = Math.exp(-e * e * 4.5);
      }
    }
  });
  return null;
}

function MasterCamera({ sig }: { sig: Sig }) {
  useFrame((state, delta) => {
    const k = Math.min(1, delta * 1.6);
    const { pointer, depth, depthTarget } = sig.input;
    pointer.current.x += (pointer.current.tx - pointer.current.x) * Math.min(1, delta * 3);
    pointer.current.y += (pointer.current.ty - pointer.current.y) * Math.min(1, delta * 3);
    depth.current += (depthTarget.current - depth.current) * Math.min(1, delta * 1.5);

    const t = state.clock.elapsedTime;
    const cam = state.camera;
    // arrivée : la caméra vient de loin ; puis voyage (orbite lente + hauteur)
    const arrive = sig.arrival.current;
    const orbit = t * 0.045;
    const baseX = Math.sin(orbit) * 1.2 + pointer.current.x * 1.0;
    const baseY = Math.cos(orbit * 0.6) * 0.5 - pointer.current.y * 0.6 + Math.sin(t * 0.08) * 0.3;
    const baseZ = THREE.MathUtils.lerp(13.0, 6.4, arrive) - depth.current + sig.energy.current * 0.8;
    cam.position.x += (baseX - cam.position.x) * k;
    cam.position.y += (baseY - cam.position.y) * k;
    cam.position.z += (baseZ - cam.position.z) * k;
    // regarde légèrement à gauche du noyau (le noyau reste à droite → composition)
    cam.lookAt(
      sig.corePos.current.x - 0.7,
      sig.corePos.current.y,
      sig.corePos.current.z
    );
  });
  return null;
}

/* ---------------------------------------------------------------- Scene */

export default function SignalMaster() {
  const input = useLabInput();
  const sig: Sig = {
    input,
    corePos: useRef(new THREE.Vector3(0.9, 0, 0)),
    pulseR: useRef(999),
    flash: useRef(0),
    charge: useRef(0),
    energy: useRef(0),
    arrival: useRef(0),
  };
  const [showType, setShowType] = useState(false);

  const mobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  useEffect(() => {
    const id = window.setTimeout(() => setShowType(true), 4200);
    return () => window.clearTimeout(id);
  }, []);

  const layers: LayerCfg[] = mobile
    ? [
        { count: 2600, inner: 1.0, outer: 5.5, size: 1.5, speed: 1, opacity: 0.9, flow: 0.2, spin: 1, lens: 0.5, flat: 0.7, seed: 111 },
        { count: 900, inner: 8, outer: 22, size: 1.1, speed: 0.2, opacity: 0.45, flow: 0.05, spin: 0.3, lens: 0, flat: 1, seed: 222 },
      ]
    : [
        // champ principal (gravitationnel)
        { count: 8000, inner: 1.0, outer: 6.0, size: 1.6, speed: 1, opacity: 0.95, flow: 0.22, spin: 1, lens: 0.55, flat: 0.7, seed: 111 },
        // deep background (poussière lente et diffuse)
        { count: 3000, inner: 9, outer: 26, size: 1.2, speed: 0.18, opacity: 0.5, flow: 0.05, spin: 0.25, lens: 0, flat: 1, seed: 222 },
        // foreground (bokeh de parallaxe, rare et large)
        { count: 260, inner: 2.2, outer: 4.2, size: 5.5, speed: 0.6, opacity: 0.28, flow: 0.15, spin: 0.7, lens: 0.2, flat: 0.9, seed: 333 },
      ];

  return (
    <>
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0, 13], fov: 44 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor("#04060c", 1)}
      >
        <fog attach="fog" args={["#04060c", 6, 26]} />
        {layers.map((cfg) => (
          <Layer key={cfg.seed} sig={sig} cfg={cfg} />
        ))}
        {/* halo volumétrique → coque verre fumé → cœur de lumière */}
        <Glow sig={sig} radius={2.4} inner={2.4} color="#4a5a86" spec="#6a7bd0" />
        <Shell sig={sig} detail={mobile ? 2 : 3} />
        <Glow sig={sig} radius={0.6} inner={1.5} color="#eaf0ff" spec="#9db4ff" />

        <Driver sig={sig} />
        <MasterCamera sig={sig} />

        {!mobile && (
          <EffectComposer>
            <Bloom
              intensity={0.7}
              luminanceThreshold={0.18}
              luminanceSmoothing={0.5}
              mipmapBlur
              radius={0.7}
            />
            <Vignette offset={0.32} darkness={0.62} />
          </EffectComposer>
        )}
      </Canvas>

      {/* Composition éditoriale — apparaît après l'arrivée, décentrée à gauche */}
      <div
        className="pointer-events-none absolute bottom-[14%] left-[7%] max-w-xl transition-all duration-1000 ease-out"
        style={{
          opacity: showType ? 1 : 0,
          transform: showType ? "translateY(0)" : "translateY(24px)",
          filter: showType ? "blur(0)" : "blur(8px)",
        }}
      >
        <p className="mb-5 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-white/45">
          Nikita Resta
        </p>
        <h1
          className="text-5xl font-medium leading-[1.02] tracking-tight text-white sm:text-7xl"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Créateur d&apos;
          <span
            className="font-normal italic text-white/90"
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
