"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

type AvatarConfig = {
  color: string;
  hat: string;
  accessory: string;
};

const COLOR_MAP: Record<string, string> = {
  blue: "#4f8fff",
  green: "#34d399",
  red: "#f87171",
  gold: "#fbbf24",
  purple: "#a78bfa",
  pink: "#f472b6",
};

function CharacterBody({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const [blinking, setBlinking] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Idle bounce
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.08;
    // Slight rotation
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

    // Blinking
    if (Math.random() < 0.005 && !blinking) {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }
  });

  const bodyColor = COLOR_MAP[config.color] || COLOR_MAP.blue;

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.5, 0.6, 16, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Left Eye White */}
      <mesh position={[-0.2, 0.95, 0.42]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Left Pupil */}
      <mesh position={[-0.2, 0.95, 0.53]}>
        <sphereGeometry args={[blinking ? 0.01 : 0.07, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Right Eye White */}
      <mesh position={[0.2, 0.95, 0.42]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Right Pupil */}
      <mesh position={[0.2, 0.95, 0.53]}>
        <sphereGeometry args={[blinking ? 0.01 : 0.07, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Mouth - happy smile */}
      <mesh position={[0, 0.72, 0.48]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Left Arm */}
      <group position={[-0.6, -0.15, 0]} rotation={[0, 0, 0.4]}>
        <mesh>
          <capsuleGeometry args={[0.1, 0.4, 8, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.6, -0.15, 0]} rotation={[0, 0, -0.4]}>
        <mesh>
          <capsuleGeometry args={[0.1, 0.4, 8, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {/* Left Leg */}
      <mesh position={[-0.2, -0.95, 0]}>
        <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Left Foot */}
      <mesh position={[-0.2, -1.2, 0.08]}>
        <boxGeometry args={[0.2, 0.1, 0.28]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.2, -0.95, 0]}>
        <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Right Foot */}
      <mesh position={[0.2, -1.2, 0.08]}>
        <boxGeometry args={[0.2, 0.1, 0.28]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Hat */}
      <Hat type={config.hat} />

      {/* Accessory */}
      <Accessory type={config.accessory} />
    </group>
  );
}

function Hat({ type }: { type: string }) {
  if (type === "cap") {
    return (
      <group position={[0, 1.35, 0]}>
        {/* Cap dome */}
        <mesh>
          <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e63946" roughness={0.5} />
        </mesh>
        {/* Visor */}
        <mesh position={[0, -0.02, 0.3]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.35]} />
          <meshStandardMaterial color="#c1121f" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  if (type === "crown") {
    return (
      <group position={[0, 1.4, 0]}>
        {/* Crown base */}
        <mesh>
          <cylinderGeometry args={[0.35, 0.4, 0.25, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Crown points */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.33, 0.2, Math.sin(angle) * 0.33]}>
              <coneGeometry args={[0.06, 0.15, 4]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
            </mesh>
          );
        })}
        {/* Gem on front */}
        <mesh position={[0, 0.05, 0.38]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  if (type === "wizard") {
    return (
      <group position={[0, 1.35, 0]}>
        {/* Wizard hat cone */}
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.4, 0.9, 16]} />
          <meshStandardMaterial color="#4338ca" roughness={0.6} />
        </mesh>
        {/* Brim */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.6, 32]} />
          <meshStandardMaterial color="#3730a3" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Star decoration */}
        <mesh position={[0, 0.5, 0.35]}>
          <octahedronGeometry args={[0.08]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.1} emissive="#fbbf24" emissiveIntensity={0.3} />
        </mesh>
      </group>
    );
  }

  if (type === "tophat") {
    return (
      <group position={[0, 1.38, 0]}>
        {/* Top hat cylinder */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.5, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} />
        </mesh>
        {/* Brim */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.27, 0.48, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* Band */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.29, 0.29, 0.06, 32]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  return null;
}

function Accessory({ type }: { type: string }) {
  if (type === "glasses") {
    return (
      <group position={[0, 0.93, 0.5]}>
        {/* Left lens */}
        <mesh position={[-0.18, 0, 0]}>
          <torusGeometry args={[0.1, 0.015, 8, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
        </mesh>
        {/* Right lens */}
        <mesh position={[0.18, 0, 0]}>
          <torusGeometry args={[0.1, 0.015, 8, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
        </mesh>
        {/* Bridge */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
        </mesh>
        {/* Dark lenses */}
        <mesh position={[-0.18, 0, 0.01]}>
          <circleGeometry args={[0.09, 16]} />
          <meshStandardMaterial color="#1a1a2e" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.18, 0, 0.01]}>
          <circleGeometry args={[0.09, 16]} />
          <meshStandardMaterial color="#1a1a2e" transparent opacity={0.7} />
        </mesh>
      </group>
    );
  }

  if (type === "monocle") {
    return (
      <group position={[0.2, 0.95, 0.52]}>
        {/* Monocle ring */}
        <mesh>
          <torusGeometry args={[0.1, 0.012, 8, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Glass */}
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.09, 16]} />
          <meshStandardMaterial color="#93c5fd" transparent opacity={0.3} />
        </mesh>
        {/* Chain */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0.05 + i * 0.03, -0.1 - i * 0.08, 0]}>
            <sphereGeometry args={[0.01, 4, 4]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === "cape") {
    return (
      <group position={[0, 0.3, -0.45]}>
        {/* Cape */}
        <mesh rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.9, 1.4, 0.05]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Cape clasp */}
        <mesh position={[0, 0.65, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (type === "scarf") {
    return (
      <group position={[0, 0.35, 0]}>
        {/* Scarf wrapped around neck */}
        <mesh>
          <torusGeometry args={[0.42, 0.08, 8, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.7} />
        </mesh>
        {/* Hanging piece */}
        <mesh position={[0.35, -0.15, 0.2]} rotation={[0.3, 0, 0.2]}>
          <boxGeometry args={[0.12, 0.4, 0.05]} />
          <meshStandardMaterial color="#ef4444" roughness={0.7} />
        </mesh>
      </group>
    );
  }

  return null;
}

export default function Avatar3D({
  config,
  size = "large",
}: {
  config: AvatarConfig;
  size?: "large" | "small";
}) {
  const isSmall = size === "small";

  return (
    <div style={{ width: "100%", height: isSmall ? "180px" : "400px" }}>
      <Canvas
        camera={{ position: [0, 0.3, isSmall ? 3.5 : 3], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#93c5fd" />
        <CharacterBody config={config} />
        {!isSmall && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.8}
          />
        )}
      </Canvas>
    </div>
  );
}
