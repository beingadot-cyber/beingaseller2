"use client";

import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import type { Group } from "three";

/** Mouse-parallax rig — eases the whole scene toward the cursor */
function Rig({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const { x, y } = state.pointer;
    ref.current.rotation.y += (x * 0.28 - ref.current.rotation.y) * 0.045;
    ref.current.rotation.x += (-y * 0.18 - ref.current.rotation.x) * 0.045;
  });

  return <group ref={ref}>{children}</group>;
}

/** Slow autonomous spin for the hero blob */
function Spinner({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.18;
    ref.current.rotation.z += delta * 0.05;
  });
  return <group ref={ref}>{children}</group>;
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.2], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} />
      <pointLight position={[-4.5, -2, 2.5]} intensity={7} color="#7c3aed" />
      <pointLight position={[4.5, 3, 2.5]} intensity={5} color="#c8ff00" />

      <Rig>
        {/* Hero distorted blob — right side */}
        <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.3}>
          <group position={[2.4, 0.2, 0]}>
            <Spinner>
              <mesh>
                <icosahedronGeometry args={[1.45, 48]} />
                <MeshDistortMaterial
                  color="#7c3aed"
                  emissive="#2a0f63"
                  emissiveIntensity={0.7}
                  roughness={0.12}
                  metalness={0.85}
                  distort={0.42}
                  speed={2.1}
                />
              </mesh>
            </Spinner>
            {/* Orbit ring */}
            <mesh rotation={[Math.PI / 2.4, 0.3, 0]}>
              <torusGeometry args={[2.15, 0.012, 12, 120]} />
              <meshStandardMaterial
                color="#c8ff00"
                emissive="#c8ff00"
                emissiveIntensity={0.9}
              />
            </mesh>
          </group>
        </Float>

        {/* Acid wireframe torus knot — upper left */}
        <Float speed={2.1} rotationIntensity={1.1} floatIntensity={1.8}>
          <mesh position={[-2.9, 1.4, -1.6]} rotation={[0.6, 0.2, 0.3]}>
            <torusKnotGeometry args={[0.55, 0.17, 140, 20]} />
            <meshStandardMaterial
              color="#c8ff00"
              emissive="#3a4d00"
              emissiveIntensity={0.8}
              wireframe
            />
          </mesh>
        </Float>

        {/* Neon octahedron — lower left */}
        <Float speed={1.9} rotationIntensity={0.9} floatIntensity={2.2}>
          <mesh position={[-1.9, -1.9, -0.6]}>
            <octahedronGeometry args={[0.5]} />
            <meshStandardMaterial
              color="#a78bfa"
              emissive="#3b2a7a"
              emissiveIntensity={0.6}
              metalness={0.9}
              roughness={0.08}
            />
          </mesh>
        </Float>

        {/* Particle fields */}
        <Sparkles
          count={90}
          scale={[11, 7, 4]}
          size={2.2}
          speed={0.35}
          color="#c8ff00"
          opacity={0.6}
        />
        <Sparkles
          count={55}
          scale={[10, 6, 3]}
          size={3}
          speed={0.28}
          color="#a78bfa"
          opacity={0.5}
        />
      </Rig>
    </Canvas>
  );
}
