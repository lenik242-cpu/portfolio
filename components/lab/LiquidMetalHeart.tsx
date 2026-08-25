"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig, SIMPLEX_3D, useLabInput, type LabInput } from "./rig";

/**
 * LIQUID METAL HEART — une sculpture de métal liquide (argent/platine poli),
 * qui coule et se replie très lentement. Reflets studio froids + iridescence
 * spectrale rare (bleu/violet). Déformation organique injectée dans le vertex
 * shader du MeshPhysicalMaterial (garde le PBR, les reflets et l'iridescence).
 * Mouvement extrêmement lent : sensation de produit de luxe futuriste, pas un
 * objet 3D random. Réagit au curseur (inclinaison) et à la vélocité (amplitude).
 */

export function Heart({ input, detail }: { input: LabInput; detail: number }) {
  const group = useRef<THREE.Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shaderRef = useRef<any>(null);
  const amp = useRef(0.16);

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#dfe6f2"),
      metalness: 1,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      iridescence: 1,
      iridescenceIOR: 1.3,
      envMapIntensity: 1.6,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uAmp = { value: 0.16 };
      shader.vertexShader =
        `uniform float uTime;\nuniform float uAmp;\n${SIMPLEX_3D}\n` +
        `float fbm(vec3 p){float f=0.0,a=0.5;for(int i=0;i<3;i++){f+=a*snoise(p);p*=2.03;a*=0.5;}return f;}\n` +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `
          float d = fbm(position * 1.15 + vec3(0.0, 0.0, uTime * 0.12));
          d += 0.4 * fbm(position * 2.6 - vec3(0.0, uTime * 0.08, 0.0));
          vec3 transformed = position + normal * d * uAmp;
          `
        );
      shaderRef.current = shader;
    };
    return m;
  }, []);

  useFrame((state, delta) => {
    input.velocity.current *= 0.9;
    const g = group.current;
    if (g) {
      // inclinaison douce vers le curseur (pas de rotation mécanique permanente)
      const tx = input.pointer.current.y * 0.3;
      const ty = input.pointer.current.x * 0.5;
      g.rotation.x += (tx - g.rotation.x) * Math.min(1, delta * 1.5);
      g.rotation.y += (ty + state.clock.elapsedTime * 0.03 - g.rotation.y) *
        Math.min(1, delta * 1.2);
    }
    // l'amplitude respire et enfle avec la vélocité de scroll
    const targetAmp =
      0.16 + Math.min(0.16, Math.abs(input.velocity.current) * 0.05);
    amp.current += (targetAmp - amp.current) * Math.min(1, delta * 3);
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      shaderRef.current.uniforms.uAmp.value = amp.current;
    }
  });

  return (
    <group ref={group}>
      <mesh material={material} scale={[1, 1.14, 1]}>
        <icosahedronGeometry args={[1.3, detail]} />
      </mesh>
    </group>
  );
}

export default function LiquidMetalHeart() {
  const input = useLabInput();
  const mobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#05070e", 1)}
    >
      <fog attach="fog" args={["#05070e", 7, 20]} />
      <ambientLight intensity={0.2} />
      <Environment resolution={512} frames={1}>
        {/* Studio froid : softbox + rails spectraux (reflets bleu/violet rares) */}
        <Lightformer intensity={3.4} position={[0, 4, 3]} scale={[10, 5, 1]} color="#ffffff" />
        <Lightformer intensity={2.2} position={[-6, 1, 1]} scale={[2.5, 9, 1]} color="#cfe0ff" />
        <Lightformer intensity={1.7} position={[6, 0, 1]} scale={[2.5, 9, 1]} color="#b8a6ff" />
        <Lightformer intensity={0.9} position={[0, -5, 2]} scale={[8, 3, 1]} color="#9fb0cc" />
        <Lightformer intensity={0.5} position={[3, 2, -5]} scale={[5, 5, 1]} color="#ffe6c8" />
      </Environment>
      <Heart input={input} detail={mobile ? 16 : 28} />
      <CameraRig input={input} />
    </Canvas>
  );
}
