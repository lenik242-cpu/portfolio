"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SIMPLEX_3D, mulberry32, useLabInput, type LabInput } from "./rig";

/**
 * SIGNAL — REFINED. SPACE + MATTER + SIGNAL, pas « objet + particules ».
 *
 *  MATTER  : un noyau fracturé — coque translucide facettée (fresnel, morphing
 *            lent) laissant voir une matière interne lumineuse. Pas une boule.
 *  SPACE   : un champ gravitationnel — les particules orbitent, sont déviées
 *            par le curseur, et sont COURBÉES autour du noyau (l'espace lui-même
 *            réfracte : lentille gravitationnelle, pas un objet de verre posé).
 *  SIGNAL  : un seul langage — une onde de choc qui naît du noyau et traverse le
 *            champ (réutilisable plus tard dans les transitions du site).
 *
 * Physique indirecte : curseur → champ → noyau (inertie). Le mouvement est
 * subtil au repos, spectaculaire à l'interaction.
 */

// État partagé de la scène (refs, mis à jour par <Driver />).
type Sig = {
  input: LabInput;
  corePos: React.MutableRefObject<THREE.Vector3>;
  pulseR: React.MutableRefObject<number>; // rayon de l'onde (grand = au repos)
  flash: React.MutableRefObject<number>; // éclat du noyau (0..1)
};

/* ------------------------------------------------------------------ Field */

const FIELD_VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uVel;
uniform vec2 uPointer;
uniform vec3 uCore;
uniform float uPulseR;
uniform float uPulseK;
attribute float aSeed;
attribute float aScale;
attribute float aSpeed;
varying float vB;
varying float vSpec;
${SIMPLEX_3D}
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

void main(){
  vec3 p = position;
  float r0 = length(p);

  // Orbite : plus rapide près du centre (sensation képlérienne)
  float ang = uTime * (0.12 + 0.5/(r0+0.7)) * aSpeed;
  p.xz = rot(ang) * p.xz;
  p.y += sin(uTime*0.3 + aSeed*6.2831) * 0.08;

  // Flux organique subtil (surtout sur le halo lointain)
  vec3 sp = p*0.2 + vec3(0.0, uTime*0.05, aSeed*10.0);
  p += 0.22 * vec3(snoise(sp), snoise(sp+11.0), snoise(sp+27.0)) * smoothstep(1.2, 6.0, r0);

  // Puits gravitationnel du curseur (plan xy, plus fort au centre)
  vec2 pw = uPointer * 4.2;
  vec2 toP = pw - p.xy;
  float pd = length(toP) + 0.001;
  p.xy += normalize(toP) * (0.5/(pd*pd + 0.6)) * smoothstep(6.0, 0.0, r0);

  // Lentille gravitationnelle : les particules se courbent autour du noyau
  vec3 toCore = p - uCore;
  float cd = length(toCore) + 0.001;
  float lens = 0.55/(cd*cd + 0.18);
  p += normalize(toCore) * lens * 0.4;

  // SIGNAL : onde de choc gaussienne qui voyage vers l'extérieur
  float dR = abs(r0 - uPulseR);
  float ring = exp(-dR*dR*uPulseK);
  p += normalize(p) * ring * 0.7;

  vB = 0.32 + ring*1.3 + lens*0.25;
  vSpec = clamp(ring, 0.0, 1.0);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.001, -mv.z);
  gl_PointSize = uSize * aScale * (240.0/dist);
}
`;

const FIELD_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uPlat;
uniform vec3 uSpec;
varying float vB;
varying float vSpec;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  vec3 col = mix(uPlat, uSpec, vSpec);
  gl_FragColor = vec4(col * vB, a * 0.9);
}
`;

function Field({ sig, count }: { sig: Sig; count: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { geo, uniforms } = useMemo(() => {
    const rnd = mulberry32(424242);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const halo = rnd() > 0.72;
      const maxR = halo ? 9.5 : 4.4;
      const r = 0.8 + Math.pow(rnd(), halo ? 1.1 : 1.9) * maxR;
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3] = s * Math.cos(th) * r;
      positions[i * 3 + 1] = u * r * 0.7;
      positions[i * 3 + 2] = s * Math.sin(th) * r;
      seeds[i] = rnd();
      scales[i] = halo ? 0.45 + rnd() * 0.5 : 0.75 + rnd() * 1.3;
      speeds[i] = (rnd() > 0.5 ? 1 : -1) * (0.5 + rnd() * 0.9);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: 1.5 },
      uVel: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uCore: { value: new THREE.Vector3() },
      uPulseR: { value: 999 },
      uPulseK: { value: 1.3 },
      uPlat: { value: new THREE.Color("#eaf0ff") },
      uSpec: { value: new THREE.Color("#9db4ff") },
    };
    return { geo, uniforms };
  }, [count]);

  useFrame((state) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    (u.uPointer.value as THREE.Vector2).set(
      sig.input.pointer.current.x,
      -sig.input.pointer.current.y
    );
    (u.uCore.value as THREE.Vector3).copy(sig.corePos.current);
    u.uPulseR.value = sig.pulseR.current;
  });

  return (
    <points geometry={geo} rotation={[0.18, 0, 0.05]}>
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

/* --------------------------------------------------------- Core : shell */

const SHELL_VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying vec3 vWorld;
varying vec3 vView;
${SIMPLEX_3D}
float fbm(vec3 p){ float f=0.0,a=0.5; for(int i=0;i<3;i++){ f+=a*snoise(p); p*=2.02; a*=0.5;} return f; }
void main(){
  float d = fbm(position*1.15 + vec3(0.0,0.0,uTime*0.1));
  vec3 tp = position + normal * d * uAmp;
  vec4 wp = modelMatrix * vec4(tp, 1.0);
  vWorld = wp.xyz;
  vView = cameraPosition - wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const SHELL_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uTint;
uniform vec3 uSpec;
varying vec3 vWorld;
varying vec3 vView;
void main(){
  // normale de facette via dérivées (aspect fracturé, quelle que soit la densité)
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  vec3 v = normalize(vView);
  float fres = pow(1.0 - abs(dot(n, v)), 3.0);
  vec3 col = mix(uTint, uSpec, fres * 0.35);
  float a = 0.05 + fres * 0.62;
  gl_FragColor = vec4(col, a);
}
`;

function CoreShell({ sig, detail }: { sig: Sig; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.22 },
      uTint: { value: new THREE.Color("#cfd8ea") },
      uSpec: { value: new THREE.Color("#b8a6ff") },
    }),
    []
  );
  useFrame((state, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    const m = ref.current;
    if (m) {
      m.position.copy(sig.corePos.current);
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04 + sig.flash.current * 0.12;
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, breathe, Math.min(1, delta * 4)));
      m.rotation.y += delta * 0.05;
      m.rotation.x += delta * 0.02;
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.35, detail]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={SHELL_VERT}
        fragmentShader={SHELL_FRAG}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

/* ---------------------------------------------------------- Core : inner */

const INNER_VERT = /* glsl */ `
uniform float uTime;
varying vec3 vView;
varying vec3 vNormal;
${SIMPLEX_3D}
void main(){
  float d = snoise(position*1.6 + vec3(0.0, uTime*0.2, 0.0)) * 0.12;
  vec3 tp = position + normal * d;
  vec4 wp = modelMatrix * vec4(tp, 1.0);
  vView = cameraPosition - wp.xyz;
  vNormal = mat3(modelMatrix) * normal;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const INNER_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform vec3 uSpec;
uniform float uFlash;
varying vec3 vView;
varying vec3 vNormal;
void main(){
  vec3 v = normalize(vView);
  vec3 n = normalize(vNormal);
  float f = pow(1.0 - abs(dot(n, v)), 1.6);
  float glow = 0.45 + f * 0.9 + uFlash * 1.6;
  vec3 col = mix(uColor, uSpec, clamp(f*0.4 + uFlash, 0.0, 1.0));
  gl_FragColor = vec4(col * glow, 1.0);
}
`;

function CoreInner({ sig }: { sig: Sig }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#eaf0ff") },
      uSpec: { value: new THREE.Color("#9db4ff") },
      uFlash: { value: 0 },
    }),
    []
  );
  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uFlash.value = sig.flash.current;
    }
    const m = ref.current;
    if (m) {
      m.position.copy(sig.corePos.current);
      const s = 0.52 + sig.flash.current * 0.14;
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, s, Math.min(1, delta * 5)));
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.55, 3]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={INNER_VERT}
        fragmentShader={INNER_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------------------------------------------- Driver + Camera */

function Driver({ sig }: { sig: Sig }) {
  const next = useRef(3.5);
  const firing = useRef(-1); // temps de départ du pulse, -1 = repos
  const noiseT = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    sig.input.velocity.current *= 0.9;

    // Noyau : cible dérivée du curseur (indirecte) + dérive lente ; forte inertie
    noiseT.current += delta;
    const tx = sig.input.pointer.current.x * 0.7 + Math.sin(noiseT.current * 0.13) * 0.25;
    const ty = -sig.input.pointer.current.y * 0.5 + Math.cos(noiseT.current * 0.11) * 0.2;
    sig.corePos.current.x += (tx - sig.corePos.current.x) * Math.min(1, delta * 0.8);
    sig.corePos.current.y += (ty - sig.corePos.current.y) * Math.min(1, delta * 0.8);

    // SIGNAL : déclenchement auto régulier + sur scroll fort
    if (firing.current < 0) {
      const strongScroll = Math.abs(sig.input.velocity.current) > 0.9;
      if (t > next.current || strongScroll) {
        firing.current = t;
        next.current = t + 6.5 + Math.random() * 3;
      }
      sig.pulseR.current = 999;
      sig.flash.current = THREE.MathUtils.lerp(sig.flash.current, 0, Math.min(1, delta * 3));
    } else {
      const e = t - firing.current;
      const dur = 2.8;
      if (e > dur) {
        firing.current = -1;
      } else {
        const k = e / dur;
        sig.pulseR.current = k * 9.5; // l'onde voyage vers l'extérieur
        sig.flash.current = Math.exp(-e * e * 5.0); // éclat bref à l'émission
      }
    }
  });
  return null;
}

function SignalCamera({ sig }: { sig: Sig }) {
  useFrame((state, delta) => {
    const k = Math.min(1, delta * 1.8);
    const { pointer, depth, depthTarget } = sig.input;
    pointer.current.x += (pointer.current.tx - pointer.current.x) * Math.min(1, delta * 3);
    pointer.current.y += (pointer.current.ty - pointer.current.y) * Math.min(1, delta * 3);
    depth.current += (depthTarget.current - depth.current) * Math.min(1, delta * 1.5);

    const t = state.clock.elapsedTime;
    const cam = state.camera;
    // orbite autonome très lente → le monde est plus grand que le viewport
    const orbit = t * 0.05;
    const baseX = Math.sin(orbit) * 1.1 + pointer.current.x * 1.0;
    const baseY = Math.cos(orbit * 0.7) * 0.6 - pointer.current.y * 0.7;
    const baseZ = 6.2 - depth.current;
    cam.position.x += (baseX - cam.position.x) * k;
    cam.position.y += (baseY - cam.position.y) * k;
    cam.position.z += (baseZ - cam.position.z) * k;
    cam.lookAt(sig.corePos.current);
  });
  return null;
}

/* ---------------------------------------------------------------- Scene */

export default function SignalRefined() {
  const input = useLabInput();
  const corePos = useRef(new THREE.Vector3());
  const pulseR = useRef(999);
  const flash = useRef(0);
  const sig: Sig = { input, corePos, pulseR, flash };

  const mobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 6.2], fov: 44 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#05070e", 1)}
    >
      <fog attach="fog" args={["#05070e", 7, 20]} />
      <Field sig={sig} count={mobile ? 3200 : 9000} />
      <CoreShell sig={sig} detail={mobile ? 2 : 3} />
      <CoreInner sig={sig} />
      <Driver sig={sig} />
      <SignalCamera sig={sig} />
    </Canvas>
  );
}
