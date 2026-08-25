"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { CameraRig, useLabInput } from "./rig";
import { Field } from "./NebulaCore";
import { Heart } from "./LiquidMetalHeart";

/**
 * SIGNAL (proposition CD) — la synthèse MATTER + SPACE de la Design Bible.
 * Le cœur de métal liquide n'est plus posé sur un fond : il est SUSPENDU dans
 * un champ de particules profond qui l'entoure et respire avec lui. Un objet
 * qui vit dans un monde. C'est le candidat le plus proche d'une signature qui
 * peut accompagner tout le site (le cœur devient l'identité, le champ devient
 * la profondeur qui relie les sections).
 */
export default function CoreSignal() {
  const input = useLabInput();
  const mobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 6], fov: 44 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#05070e", 1)}
    >
      <fog attach="fog" args={["#05070e", 7, 20]} />
      <ambientLight intensity={0.2} />
      <Environment resolution={512} frames={1}>
        <Lightformer intensity={3.2} position={[0, 4, 3]} scale={[10, 5, 1]} color="#ffffff" />
        <Lightformer intensity={2.1} position={[-6, 1, 1]} scale={[2.5, 9, 1]} color="#cfe0ff" />
        <Lightformer intensity={1.7} position={[6, 0, 1]} scale={[2.5, 9, 1]} color="#b8a6ff" />
        <Lightformer intensity={0.9} position={[0, -5, 2]} scale={[8, 3, 1]} color="#9fb0cc" />
      </Environment>

      {/* Le monde : champ de particules profond, plus discret que le Nebula pur */}
      <group scale={0.9}>
        <Field input={input} count={mobile ? 2600 : 7000} />
      </group>

      {/* L'identité : le cœur de métal liquide au centre */}
      <group scale={0.82}>
        <Heart input={input} detail={mobile ? 16 : 26} />
      </group>

      <CameraRig input={input} />
    </Canvas>
  );
}
