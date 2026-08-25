"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CameraRig,
  SIMPLEX_3D,
  mulberry32,
  useLabInput,
  type LabInput,
} from "./rig";

/**
 * NEBULA CORE — un phénomène vivant dans un espace profond. Champ de particules
 * GPU déplacées par un champ de flux (bruit simplex), cœur dense + halo lointain
 * pour la profondeur. Lumière interne par accumulation additive (glow maîtrisé,
 * pas de bloom). Le curseur courbe le flux, la vélocité de scroll l'étire, la
 * caméra peut avancer dans le champ. Abstrait et design, pas « galaxy wallpaper ».
 */

const VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uVel;
uniform vec2 uPointer;
attribute float aSeed;
attribute float aScale;
varying float vRad;
varying float vDepth;

${SIMPLEX_3D}

void main() {
  vec3 p = position;
  float t = uTime * 0.06;

  // Champ de flux organique (3 échantillons décalés = vecteur de déplacement)
  vec3 sp = p * 0.28 + vec3(0.0, t, aSeed * 12.0);
  vec3 flow = vec3(
    snoise(sp),
    snoise(sp + 19.3),
    snoise(sp + 43.7)
  );
  float rad = length(p);
  // le cœur bouge peu, le halo s'écoule davantage
  float amp = mix(0.15, 0.9, smoothstep(0.0, 4.0, rad));
  vec3 pos = p + flow * amp;

  // Gravité douce du curseur (surtout sur les couches proches du centre)
  pos.xy += uPointer * 1.1 * (1.0 - smoothstep(0.0, 5.0, rad));

  // La vélocité de scroll étire le champ en profondeur
  pos.z += uVel * (0.4 + aSeed);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float dist = max(0.001, -mv.z);
  gl_PointSize = uSize * aScale * (240.0 / dist);
  vRad = clamp(rad / 4.5, 0.0, 1.0);
  vDepth = clamp(1.6 - dist * 0.07, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uCore;
uniform vec3 uEdge;
varying float vRad;
varying float vDepth;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  // disque doux (falloff gaussien)
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  vec3 col = mix(uCore, uEdge, vRad);
  gl_FragColor = vec4(col, a * vDepth * 0.9);
}
`;

export function Field({ input, count }: { input: LabInput; count: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { geo, uniforms } = useMemo(() => {
    const rnd = mulberry32(20260820);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // 70% cœur dense (concentré), 30% halo lointain (profondeur)
      const halo = rnd() > 0.7;
      const maxR = halo ? 9 : 4.2;
      const r = Math.pow(rnd(), halo ? 1.1 : 2.0) * maxR;
      // direction sphérique uniforme
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3] = s * Math.cos(th) * r;
      positions[i * 3 + 1] = u * r * 0.75; // léger aplatissement vertical
      positions[i * 3 + 2] = s * Math.sin(th) * r;
      seeds[i] = rnd();
      scales[i] = halo ? 0.5 + rnd() * 0.6 : 0.8 + rnd() * 1.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: 1.5 },
      uVel: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uCore: { value: new THREE.Color("#eaf0ff") },
      uEdge: { value: new THREE.Color("#5566a8") },
    };
    return { geo, uniforms };
  }, [count]);

  useFrame((state, delta) => {
    input.velocity.current *= 0.9;
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uVel.value += (input.velocity.current - u.uVel.value) * Math.min(1, delta * 4);
    (u.uPointer.value as THREE.Vector2).set(
      input.pointer.current.x,
      -input.pointer.current.y
    );
  });

  return (
    <points geometry={geo} rotation={[0.2, 0, 0]}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function NebulaCore() {
  const input = useLabInput();
  const mobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;
  const count = mobile ? 3500 : 11000;

  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#05070e", 1)}
    >
      <fog attach="fog" args={["#05070e", 6, 18]} />
      <Field input={input} count={count} />
      <CameraRig input={input} />
    </Canvas>
  );
}
