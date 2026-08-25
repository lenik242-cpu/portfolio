"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig, mulberry32, useLabInput, type LabInput } from "./rig";

/**
 * REFRACTION ANOMALY — une faille dans l'espace. Une matière de verre presque
 * invisible qui RÉFRACTE un champ d'étoiles derrière elle : on ne voit pas
 * l'objet, on voit la distorsion. « Qu'est-ce que je regarde ? ». Le curseur
 * module la réfraction, la molette rapproche la caméra de l'anomalie. Mouvement
 * extrêmement lent (dérive), jamais mécanique.
 */

function StarField({ count }: { count: number }) {
  const geo = useMemo(() => {
    const rnd = mulberry32(770077);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const platinum = new THREE.Color("#dfe6f2");
    const blue = new THREE.Color("#7c9cff");
    const violet = new THREE.Color("#b8a6ff");
    for (let i = 0; i < count; i++) {
      // volume sphérique, majoritairement derrière l'anomalie
      const r = 5 + Math.pow(rnd(), 0.6) * 9;
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3] = s * Math.cos(th) * r;
      positions[i * 3 + 1] = u * r;
      positions[i * 3 + 2] = s * Math.sin(th) * r - 3;
      // platine dominant, éclats spectraux très rares
      const roll = rnd();
      const c = roll > 0.94 ? blue : roll > 0.88 ? violet : platinum;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);

  return (
    <points geometry={geo}>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Anomaly({ input, samples }: { input: LabInput; samples: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    input.velocity.current *= 0.9;
    const g = group.current;
    if (!g) return;
    // dérive très lente + légère réponse au curseur (la faille respire)
    g.rotation.y += delta * 0.04;
    g.rotation.x += delta * 0.015;
    const tx = input.pointer.current.x * 0.6;
    const ty = -input.pointer.current.y * 0.4;
    g.position.x += (tx - g.position.x) * Math.min(1, delta * 1.4);
    g.position.y += (ty - g.position.y) * Math.min(1, delta * 1.4);
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.7, 8]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={2.4}
          roughness={0.05}
          ior={1.5}
          chromaticAberration={0.55}
          anisotropicBlur={0.4}
          distortion={0.65}
          distortionScale={0.6}
          temporalDistortion={0.15}
          color="#eef2fb"
          attenuationColor="#9fb0e0"
          attenuationDistance={3}
          samples={samples}
          resolution={512}
          backside
        />
      </mesh>
    </group>
  );
}

export default function RefractionAnomaly() {
  const input = useLabInput();
  const mobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#05070e", 1)}
    >
      <fog attach="fog" args={["#05070e", 8, 22]} />
      <ambientLight intensity={0.4} />
      <StarField count={mobile ? 1400 : 3200} />
      <Anomaly input={input} samples={mobile ? 4 : 8} />
      <CameraRig input={input} />
    </Canvas>
  );
}
