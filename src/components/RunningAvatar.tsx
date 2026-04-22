"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const OUTFIT_COLOR: Record<string, string> = {
  blue: "#1e1b4b", green: "#14532d", red: "#7f1d1d",
  gold: "#78350f", purple: "#3b0764", pink: "#831843",
};
const SKIN = "#f0c8a0";
const SKIN_SHADOW = "#dbb08a";
const HAIR = "#1a1a1a";

/* --- Reusable clay material props for Running Avatar --- */
const clayMat = (color: string, roughness = 0.4, clearcoat = 0.3) => ({
  color,
  roughness,
  metalness: 0,
  clearcoat,
  clearcoatRoughness: 0.25,
});

export default function RunningAvatar({
  config,
  position,
  speed = 0,
  boosting = false,
  lane = 0,
}: {
  config: { color: string; hat: string; accessory: string };
  position: number;
  speed: number;
  boosting: boolean;
  lane: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const outfit = OUTFIT_COLOR[config.color] || OUTFIT_COLOR.blue;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta * (speed > 0 ? speed * 8 : 1);
    const t = timeRef.current;
    const running = speed > 0.01;
    const bounce = running ? Math.abs(Math.sin(t * 2)) * 0.06 : Math.sin(t * 0.8) * 0.015;

    groupRef.current.position.set(position, 1.05 + bounce, lane * 1.5);
    groupRef.current.rotation.y = 0;

    if (running) {
      groupRef.current.rotation.x = -0.1;
    } else {
      groupRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={groupRef}>
      <group scale={[0.7, 0.7, 0.7]}>
        {/* LEGS */}
        <AnimatedLeg side={-1} outfit="#334155" speed={speed} timeRef={timeRef} />
        <AnimatedLeg side={1} outfit="#334155" speed={speed} timeRef={timeRef} />

        {/* TORSO (Chibi style) */}
        <mesh position={[0, -0.5, 0]}>
          <capsuleGeometry args={[0.28, 0.45, 12, 24]} />
          <meshPhysicalMaterial {...clayMat(outfit, 0.5, 0.15)} />
        </mesh>

        {/* ARMS */}
        <AnimatedArm side={-1} outfit={outfit} skin={SKIN} speed={speed} timeRef={timeRef} />
        <AnimatedArm side={1} outfit={outfit} skin={SKIN} speed={speed} timeRef={timeRef} />

        {/* NECK */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.15, 12]} />
          <meshPhysicalMaterial {...clayMat(SKIN, 0.45, 0.2)} />
        </mesh>

        {/* HEAD (Clean Sphere) */}
        <group position={[0, 0.32, 0]}>
          <mesh scale={[1, 1, 1]}>
            <sphereGeometry args={[0.38, 24, 24]} />
            <meshPhysicalMaterial {...clayMat(SKIN, 0.4, 0.3)} />
          </mesh>
          {/* Hair Cap */}
          <mesh position={[0, 0.1, -0.02]} scale={[1.08, 0.8, 1.05]}>
            <sphereGeometry args={[0.39, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshPhysicalMaterial {...clayMat(HAIR, 0.5, 0.5)} />
          </mesh>
          {/* Eyes (Simple Dots) */}
          <Eye side={-1} />
          <Eye side={1} />
          {/* Mouth */}
          <mesh position={[0, -0.15, 0.34]} rotation={[0.1, 0, 0]}>
            <torusGeometry args={[0.045, 0.008, 8, 16, Math.PI]} />
            <meshPhysicalMaterial color="#b5696e" />
          </mesh>
        </group>

        {/* ITEMS */}
        <HatItem type={config.hat} />
        <AccessoryItem type={config.accessory} />

        {/* Booster Effect */}
        {boosting && (
          <group position={[0, -0.5, -0.5]}>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[-0.3 - i * 0.15, -0.2 + Math.random() * 0.4, 0]}>
                <sphereGeometry args={[0.08 + i * 0.03, 8, 8]} />
                <meshPhysicalMaterial color="#fbbf24" transparent opacity={0.6 - i * 0.1} emissive="#fbbf24" emissiveIntensity={1} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </group>
  );
}

function AnimatedLeg({ side, outfit, speed, timeRef }: { side: number; outfit: string; speed: number; timeRef: React.MutableRefObject<number> }) {
  const legRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!legRef.current) return;
    const running = speed > 0.01;
    const t = timeRef.current;
    const swing = running ? Math.sin(t * 2 * side) * 0.8 : 0;
    legRef.current.rotation.x = swing;
  });
  return (
    <group ref={legRef} position={[side * 0.18, -1.05, 0]}>
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.12, 0.4, 8, 16]} />
        <meshPhysicalMaterial color={outfit} roughness={0.6} />
      </mesh>
      {/* Sneaker */}
      <mesh position={[0, -0.35, 0.08]}>
        <boxGeometry args={[0.2, 0.14, 0.32]} />
        <meshPhysicalMaterial color="#f8fafc" roughness={0.4} clearcoat={0.3} />
      </mesh>
    </group>
  );
}

function AnimatedArm({ side, outfit, skin, speed, timeRef }: { side: number; outfit: string; skin: string; speed: number; timeRef: React.MutableRefObject<number> }) {
  const armRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!armRef.current) return;
    const running = speed > 0.01;
    const t = timeRef.current;
    const swing = running ? Math.sin(t * 2 * -side) * 0.7 : 0;
    armRef.current.rotation.x = swing;
    armRef.current.rotation.z = side * (running ? 0.05 : 0.2);
  });
  return (
    <group ref={armRef} position={[side * 0.45, -0.3, 0]}>
      <mesh><capsuleGeometry args={[0.1, 0.25, 8, 16]} /><meshPhysicalMaterial color={outfit} roughness={0.5} /></mesh>
      <mesh position={[0, -0.32, 0]}><capsuleGeometry args={[0.08, 0.2, 8, 16]} /><meshPhysicalMaterial color={skin} roughness={0.6} /></mesh>
      <mesh position={[0, -0.5, 0]}><sphereGeometry args={[0.085, 12, 12]} /><meshPhysicalMaterial color={skin} roughness={0.6} /></mesh>
    </group>
  );
}

function Eye({ side }: { side: number }) {
  return (
    <group position={[side * 0.13, 0.04, 0.32]}>
      <mesh scale={[1, 1, 0.15]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshPhysicalMaterial color="white" roughness={0.1} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.015]} scale={[1, 1, 1]}>
        <sphereGeometry args={[0.038, 16, 16]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.2} clearcoat={0.8} />
      </mesh>
    </group>
  );
}

function HatItem({ type }: { type: string }) {
  const y = 0.32;
  const hatMat = (c: string) => <meshPhysicalMaterial color={c} roughness={0.4} clearcoat={0.3} />;
  
  if (type === "cap") return (
    <group position={[0, y + 0.35, 0]}>
      <mesh><sphereGeometry args={[0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />{hatMat("#e63946")}</mesh>
      <mesh position={[0, -0.02, 0.3]} rotation={[-0.3, 0, 0]}><boxGeometry args={[0.48, 0.04, 0.32]} />{hatMat("#c1121f")}</mesh>
    </group>
  );
  if (type === "crown") return (
    <group position={[0, y + 0.42, 0]}>
      <mesh><cylinderGeometry args={[0.3, 0.35, 0.22, 8]} /><meshPhysicalMaterial color="#fbbf24" metalness={0.8} roughness={0.2} clearcoat={0.5} /></mesh>
      {[0,1,2,3,4,5,6,7].map(i => {const a=(i/8)*Math.PI*2; return <mesh key={i} position={[Math.cos(a)*0.29,0.18,Math.sin(a)*0.29]}><coneGeometry args={[0.04,0.14,4]}/><meshPhysicalMaterial color="#f59e0b" metalness={0.8} /></mesh>})}
    </group>
  );
  if (type === "wizard") return (
    <group position={[0, y + 0.35, 0]}>
      <mesh position={[0,0.38,0]}><coneGeometry args={[0.35,0.85,16]} />{hatMat("#4338ca")}</mesh>
      <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[0.28,0.52,32]} />{hatMat("#3730a3")}</mesh>
    </group>
  );
  if (type === "tophat") return (
    <group position={[0, y + 0.38, 0]}>
      <mesh position={[0,0.24,0]}><cylinderGeometry args={[0.24,0.24,0.45,24]} />{hatMat("#1e293b")}</mesh>
      <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[0.23,0.42,24]} />{hatMat("#1e293b")}</mesh>
    </group>
  );
  return null;
}

function AccessoryItem({ type }: { type: string }) {
  const y = 0.32;
  if (type === "glasses") return (
    <group position={[0, y + 0.01, 0.34]}>
      <mesh position={[-0.13,0,0]}><torusGeometry args={[0.065,0.014,8,16]} /><meshPhysicalMaterial color="#1a1a2e" metalness={0.8} clearcoat={1} /></mesh>
      <mesh position={[0.13,0,0]}><torusGeometry args={[0.065,0.014,8,16]} /><meshPhysicalMaterial color="#1a1a2e" metalness={0.8} clearcoat={1} /></mesh>
      <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.009,0.009,0.1,8]} /><meshPhysicalMaterial color="#1a1a2e" metalness={0.8} /></mesh>
    </group>
  );
  if (type === "cape") return (
    <group position={[0, -0.25, -0.35]}>
      <mesh rotation={[0.1,0,0]}><boxGeometry args={[0.75,1.2,0.04]} /><meshPhysicalMaterial color="#7c3aed" roughness={0.6} side={THREE.DoubleSide} /></mesh>
    </group>
  );
  if (type === "scarf") return (
    <group position={[0, -0.08, 0]}>
      <mesh><torusGeometry args={[0.22,0.06,8,32]} /><meshPhysicalMaterial color="#ef4444" roughness={0.7} /></mesh>
    </group>
  );
  if (type === "monocle") return (
    <group position={[0.13, y + 0.02, 0.35]}>
      <mesh><torusGeometry args={[0.065,0.01,8,16]} /><meshPhysicalMaterial color="#fbbf24" metalness={0.9} clearcoat={1} /></mesh>
    </group>
  );
  return null;
}
