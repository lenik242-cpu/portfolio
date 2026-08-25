"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Entrées partagées du /lab : pointeur (avec cible lissée), vélocité (molette,
 * décroissance), et profondeur (dolly caméra piloté à la molette, avec inertie).
 * Le mouvement doit donner l'impression que la matière a sa propre physique :
 * tout est lissé, rien n'est mécanique.
 */
export type LabInput = {
  pointer: MutableRefObject<{ x: number; y: number; tx: number; ty: number }>;
  velocity: MutableRefObject<number>;
  depth: MutableRefObject<number>;
  depthTarget: MutableRefObject<number>;
};

export function useLabInput(): LabInput {
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const velocity = useRef(0);
  const depth = useRef(0);
  const depthTarget = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = e.clientX / window.innerWidth - 0.5;
      pointer.current.ty = e.clientY / window.innerHeight - 0.5;
    };
    const onWheel = (e: WheelEvent) => {
      velocity.current += e.deltaY * 0.0012;
      depthTarget.current = Math.max(
        -1.5,
        Math.min(4, depthTarget.current + e.deltaY * 0.0009)
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  return { pointer, velocity, depth, depthTarget };
}

/** Caméra : dolly molette + parallaxe curseur, tout en inertie douce. */
export function CameraRig({ input }: { input: LabInput }) {
  useFrame((state, delta) => {
    const k = Math.min(1, delta * 2);
    const kp = Math.min(1, delta * 3);
    const { pointer, depth, depthTarget } = input;

    pointer.current.x += (pointer.current.tx - pointer.current.x) * kp;
    pointer.current.y += (pointer.current.ty - pointer.current.y) * kp;
    depth.current += (depthTarget.current - depth.current) * Math.min(1, delta * 1.6);

    const cam = state.camera;
    const targetX = pointer.current.x * 0.8;
    const targetY = -pointer.current.y * 0.55;
    const targetZ = 6 - depth.current;
    cam.position.x += (targetX - cam.position.x) * k;
    cam.position.y += (targetY - cam.position.y) * k;
    cam.position.z += (targetZ - cam.position.z) * k;
    cam.lookAt(0, 0, 0);
  });
  return null;
}

/** Bruit simplex 3D (Ashima / webgl-noise) — utilisé par les shaders du lab. */
export const SIMPLEX_3D = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

/** PRNG déterministe (mulberry32) pour distribuer les particules. */
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
