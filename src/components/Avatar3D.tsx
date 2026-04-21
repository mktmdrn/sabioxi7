"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";

type AvatarConfig = {
  color: string;
  hat: string;
  accessory: string;
};

const OUTFIT_COLOR: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  gold: "#eab308",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

const SKIN = "#f5d0a9";
const SKIN_SHADOW = "#e8b88a";
const HAIR_COLOR = "#2d1b0e";
const EYE_COLOR = "#1e3a5f";

function CharacterBody({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const [blinking, setBlinking] = useState(false);
  const blinkTimer = useRef(0);

  // Breathing / idle animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Gentle breathing
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.02;
    // Very slight sway
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.06;

    // Blinking logic
    blinkTimer.current += state.clock.getDelta();
    if (blinkTimer.current > 3 + Math.random() * 2) {
      setBlinking(true);
      blinkTimer.current = 0;
      setTimeout(() => setBlinking(false), 120);
    }
  });

  const outfitColor = OUTFIT_COLOR[config.color] || OUTFIT_COLOR.blue;
  const outfitDark = useMemo(() => {
    const c = new THREE.Color(outfitColor);
    c.multiplyScalar(0.7);
    return "#" + c.getHexString();
  }, [outfitColor]);

  return (
    <group ref={groupRef}>
      {/* ===== LEGS ===== */}
      {/* Left leg */}
      <group position={[-0.15, -1.55, 0]}>
        {/* Upper leg */}
        <mesh position={[0, 0.2, 0]}>
          <capsuleGeometry args={[0.1, 0.4, 8, 16]} />
          <meshStandardMaterial color="#374151" roughness={0.7} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.09, 0.35, 8, 16]} />
          <meshStandardMaterial color="#374151" roughness={0.7} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.62, 0.06]}>
          <boxGeometry args={[0.18, 0.12, 0.28]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
      </group>
      {/* Right leg */}
      <group position={[0.15, -1.55, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <capsuleGeometry args={[0.1, 0.4, 8, 16]} />
          <meshStandardMaterial color="#374151" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.09, 0.35, 8, 16]} />
          <meshStandardMaterial color="#374151" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.62, 0.06]}>
          <boxGeometry args={[0.18, 0.12, 0.28]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
      </group>

      {/* ===== TORSO ===== */}
      {/* Main torso */}
      <mesh position={[0, -0.55, 0]}>
        <capsuleGeometry args={[0.28, 0.55, 12, 24]} />
        <meshStandardMaterial color={outfitColor} roughness={0.5} />
      </mesh>
      {/* Collar / neckline detail */}
      <mesh position={[0, -0.15, 0.18]} rotation={[0.5, 0, 0]}>
        <planeGeometry args={[0.22, 0.12]} />
        <meshStandardMaterial color={outfitDark} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* ===== ARMS ===== */}
      {/* Left arm */}
      <group position={[-0.4, -0.45, 0]} rotation={[0, 0, 0.15]}>
        {/* Upper arm (shirt sleeve) */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.28, 8, 16]} />
          <meshStandardMaterial color={outfitColor} roughness={0.5} />
        </mesh>
        {/* Forearm (skin) */}
        <mesh position={[-0.02, -0.32, 0]}>
          <capsuleGeometry args={[0.065, 0.25, 8, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        {/* Hand */}
        <mesh position={[-0.02, -0.55, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>
      {/* Right arm */}
      <group position={[0.4, -0.45, 0]} rotation={[0, 0, -0.15]}>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.28, 8, 16]} />
          <meshStandardMaterial color={outfitColor} roughness={0.5} />
        </mesh>
        <mesh position={[0.02, -0.32, 0]}>
          <capsuleGeometry args={[0.065, 0.25, 8, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        <mesh position={[0.02, -0.55, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>

      {/* ===== NECK ===== */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.15, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.6} />
      </mesh>

      {/* ===== HEAD ===== */}
      <group position={[0, 0.3, 0]}>
        {/* Head shape - slightly oval */}
        <mesh scale={[1, 1.12, 0.95]}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>

        {/* ===== HAIR ===== */}
        {/* Top hair volume */}
        <mesh position={[0, 0.15, -0.02]} scale={[1.08, 0.9, 1.05]}>
          <sphereGeometry args={[0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={HAIR_COLOR} roughness={0.8} />
        </mesh>
        {/* Side hair left */}
        <mesh position={[-0.28, -0.02, -0.05]} scale={[0.6, 1, 0.8]}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color={HAIR_COLOR} roughness={0.8} />
        </mesh>
        {/* Side hair right */}
        <mesh position={[0.28, -0.02, -0.05]} scale={[0.6, 1, 0.8]}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color={HAIR_COLOR} roughness={0.8} />
        </mesh>
        {/* Back hair */}
        <mesh position={[0, -0.05, -0.18]} scale={[1, 1.1, 0.7]}>
          <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.7]} />
          <meshStandardMaterial color={HAIR_COLOR} roughness={0.8} />
        </mesh>
        {/* Fringe / bangs */}
        <mesh position={[0, 0.18, 0.22]} rotation={[0.4, 0, 0]} scale={[1.1, 0.4, 0.5]}>
          <sphereGeometry args={[0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={HAIR_COLOR} roughness={0.8} />
        </mesh>

        {/* ===== ANIME EYES ===== */}
        {/* Left eye */}
        <group position={[-0.12, 0.02, 0.27]}>
          {/* Eye white */}
          <mesh scale={[1, 1.2, 0.5]}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
          {/* Iris */}
          <mesh position={[0, -0.005, 0.025]} scale={[1, 1.2, 0.5]}>
            <sphereGeometry args={[blinking ? 0.005 : 0.045, 16, 16]} />
            <meshStandardMaterial color={EYE_COLOR} />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, -0.005, 0.035]} scale={[1, 1.2, 0.5]}>
            <sphereGeometry args={[blinking ? 0.003 : 0.025, 12, 12]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          {/* Eye shine */}
          <mesh position={[0.015, 0.015, 0.038]} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
          {/* Upper eyelid line */}
          <mesh position={[0, 0.045, 0.025]} rotation={[0, 0, 0]} scale={[1.1, 0.15, 0.5]}>
            <sphereGeometry args={[0.06, 12, 4]} />
            <meshStandardMaterial color={SKIN_SHADOW} />
          </mesh>
        </group>

        {/* Right eye */}
        <group position={[0.12, 0.02, 0.27]}>
          <mesh scale={[1, 1.2, 0.5]}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0, -0.005, 0.025]} scale={[1, 1.2, 0.5]}>
            <sphereGeometry args={[blinking ? 0.005 : 0.045, 16, 16]} />
            <meshStandardMaterial color={EYE_COLOR} />
          </mesh>
          <mesh position={[0, -0.005, 0.035]} scale={[1, 1.2, 0.5]}>
            <sphereGeometry args={[blinking ? 0.003 : 0.025, 12, 12]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[-0.015, 0.015, 0.038]} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.045, 0.025]} rotation={[0, 0, 0]} scale={[1.1, 0.15, 0.5]}>
            <sphereGeometry args={[0.06, 12, 4]} />
            <meshStandardMaterial color={SKIN_SHADOW} />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh position={[-0.12, 0.1, 0.28]} rotation={[0, 0, 0.1]} scale={[1, 0.3, 0.3]}>
          <capsuleGeometry args={[0.025, 0.04, 4, 8]} />
          <meshStandardMaterial color={HAIR_COLOR} />
        </mesh>
        <mesh position={[0.12, 0.1, 0.28]} rotation={[0, 0, -0.1]} scale={[1, 0.3, 0.3]}>
          <capsuleGeometry args={[0.025, 0.04, 4, 8]} />
          <meshStandardMaterial color={HAIR_COLOR} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.04, 0.31]} scale={[0.5, 0.7, 0.5]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.6} />
        </mesh>

        {/* Mouth - small anime smile */}
        <mesh position={[0, -0.11, 0.29]} rotation={[0.15, 0, 0]}>
          <torusGeometry args={[0.04, 0.008, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#c47a7a" />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.31, 0, 0]} scale={[0.35, 0.5, 0.6]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        <mesh position={[0.31, 0, 0]} scale={[0.35, 0.5, 0.6]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>

      {/* Hat */}
      <Hat type={config.hat} />

      {/* Accessory */}
      <Accessory type={config.accessory} />
    </group>
  );
}

function Hat({ type }: { type: string }) {
  const headY = 0.3;

  if (type === "cap") {
    return (
      <group position={[0, headY + 0.32, 0]}>
        <mesh>
          <sphereGeometry args={[0.34, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e63946" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.02, 0.28]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.42, 0.035, 0.3]} />
          <meshStandardMaterial color="#c1121f" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  if (type === "crown") {
    return (
      <group position={[0, headY + 0.38, 0]}>
        <mesh>
          <cylinderGeometry args={[0.28, 0.32, 0.2, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.27, 0.16, Math.sin(angle) * 0.27]}>
              <coneGeometry args={[0.04, 0.12, 4]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.04, 0.3]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  if (type === "wizard") {
    return (
      <group position={[0, headY + 0.32, 0]}>
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.32, 0.8, 16]} />
          <meshStandardMaterial color="#4338ca" roughness={0.6} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.48, 32]} />
          <meshStandardMaterial color="#3730a3" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.45, 0.28]}>
          <octahedronGeometry args={[0.06]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.1} emissive="#fbbf24" emissiveIntensity={0.3} />
        </mesh>
      </group>
    );
  }

  if (type === "tophat") {
    return (
      <group position={[0, headY + 0.35, 0]}>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.42, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.21, 0.38, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.05, 32]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  return null;
}

function Accessory({ type }: { type: string }) {
  const headY = 0.3;

  if (type === "glasses") {
    return (
      <group position={[0, headY + 0.01, 0.3]}>
        <mesh position={[-0.12, 0, 0]}>
          <torusGeometry args={[0.065, 0.012, 8, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
        </mesh>
        <mesh position={[0.12, 0, 0]}>
          <torusGeometry args={[0.065, 0.012, 8, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.1, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
        </mesh>
        {/* Dark lenses */}
        <mesh position={[-0.12, 0, 0.008]}>
          <circleGeometry args={[0.055, 16]} />
          <meshStandardMaterial color="#1a1a2e" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.12, 0, 0.008]}>
          <circleGeometry args={[0.055, 16]} />
          <meshStandardMaterial color="#1a1a2e" transparent opacity={0.7} />
        </mesh>
      </group>
    );
  }

  if (type === "monocle") {
    return (
      <group position={[0.12, headY + 0.02, 0.31]}>
        <mesh>
          <torusGeometry args={[0.06, 0.008, 8, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.008]}>
          <circleGeometry args={[0.055, 16]} />
          <meshStandardMaterial color="#93c5fd" transparent opacity={0.25} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0.03 + i * 0.02, -0.06 - i * 0.06, 0]}>
            <sphereGeometry args={[0.006, 4, 4]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === "cape") {
    return (
      <group position={[0, -0.2, -0.32]}>
        <mesh rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.7, 1.2, 0.04]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Inner lining */}
        <mesh rotation={[0.1, 0, 0]} position={[0, 0, 0.025]}>
          <boxGeometry args={[0.66, 1.16, 0.01]} />
          <meshStandardMaterial color="#4c1d95" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.55, 0.08]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (type === "scarf") {
    return (
      <group position={[0, -0.05, 0]}>
        <mesh>
          <torusGeometry args={[0.2, 0.055, 8, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.7} />
        </mesh>
        <mesh position={[0.18, -0.15, 0.12]} rotation={[0.3, 0, 0.3]}>
          <boxGeometry args={[0.09, 0.35, 0.04]} />
          <meshStandardMaterial color="#ef4444" roughness={0.7} />
        </mesh>
        {/* Stripe detail */}
        <mesh position={[0.18, -0.08, 0.14]} rotation={[0.3, 0, 0.3]}>
          <boxGeometry args={[0.092, 0.04, 0.042]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.7} />
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
    <div style={{ width: "100%", height: isSmall ? "200px" : "450px" }}>
      <Canvas
        camera={{ position: [0, -0.2, isSmall ? 3.2 : 2.8], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#93c5fd" />
        <directionalLight position={[0, -2, 3]} intensity={0.2} color="#fde68a" />
        <CharacterBody config={config} />
        {!isSmall && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.6}
          />
        )}
      </Canvas>
    </div>
  );
}
