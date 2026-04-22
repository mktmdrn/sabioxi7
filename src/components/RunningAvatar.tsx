"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const OUTFIT_COLOR: Record<string, string> = {
  blue: "#3b82f6", green: "#22c55e", red: "#ef4444",
  gold: "#eab308", purple: "#8b5cf6", pink: "#ec4899",
};
const SKIN = "#f5d0a9";
const HAIR = "#2d1b0e";

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
  const outfitDark = new THREE.Color(outfit).multiplyScalar(0.7);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta * (speed > 0 ? speed * 8 : 1);
    const t = timeRef.current;
    const running = speed > 0.01;
    const runCycle = running ? Math.sin(t * 2) : 0;
    const bounce = running ? Math.abs(Math.sin(t * 2)) * 0.06 : Math.sin(t * 0.8) * 0.015;

    groupRef.current.position.set(position, 1.05 + bounce, lane * 1.5);
    groupRef.current.rotation.y = 0;

    // Lean forward when running
    if (running) {
      groupRef.current.rotation.x = -0.1;
    } else {
      groupRef.current.rotation.x = 0;
    }
  });

  const running = speed > 0.01;
  const t = timeRef.current;

  return (
    <group ref={groupRef}>
      {/* Scale down for race */}
      <group scale={[0.75, 0.75, 0.75]}>
        {/* LEGS with running animation */}
        <AnimatedLeg side={-1} outfit="#374151" speed={speed} timeRef={timeRef} />
        <AnimatedLeg side={1} outfit="#374151" speed={speed} timeRef={timeRef} />

        {/* TORSO */}
        <mesh position={[0, -0.55, 0]}>
          <capsuleGeometry args={[0.28, 0.55, 12, 24]} />
          <meshStandardMaterial color={outfit} roughness={0.5} />
        </mesh>

        {/* ARMS with running animation */}
        <AnimatedArm side={-1} outfit={outfit} skin={SKIN} speed={speed} timeRef={timeRef} />
        <AnimatedArm side={1} outfit={outfit} skin={SKIN} speed={speed} timeRef={timeRef} />

        {/* NECK */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.15, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>

        {/* HEAD */}
        <group position={[0, 0.3, 0]}>
          <mesh scale={[1, 1.12, 0.95]}>
            <sphereGeometry args={[0.32, 24, 24]} />
            <meshStandardMaterial color={SKIN} roughness={0.5} />
          </mesh>
          {/* Hair */}
          <mesh position={[0, 0.15, -0.02]} scale={[1.08, 0.9, 1.05]}>
            <sphereGeometry args={[0.32, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color={HAIR} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0.22]} rotation={[0.4, 0, 0]} scale={[1.1, 0.4, 0.5]}>
            <sphereGeometry args={[0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color={HAIR} roughness={0.8} />
          </mesh>
          {/* Eyes */}
          <Eye side={-1} />
          <Eye side={1} />
          {/* Mouth */}
          <mesh position={[0, -0.11, 0.29]} rotation={[0.15, 0, 0]}>
            <torusGeometry args={[0.04, 0.008, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#c47a7a" />
          </mesh>
        </group>

        {/* HAT */}
        <HatItem type={config.hat} />
        {/* ACCESSORY */}
        <AccessoryItem type={config.accessory} />

        {/* Booster trail effect */}
        {boosting && (
          <group position={[0, -0.5, -0.5]}>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[-0.3 - i * 0.15, -0.2 + Math.random() * 0.4, 0]}>
                <sphereGeometry args={[0.08 + i * 0.03, 8, 8]} />
                <meshStandardMaterial color="#fbbf24" transparent opacity={0.6 - i * 0.1} emissive="#fbbf24" emissiveIntensity={1} />
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
    <group ref={legRef} position={[side * 0.15, -1.15, 0]}>
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
        <meshStandardMaterial color={outfit} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.4, 0.06]}>
        <boxGeometry args={[0.18, 0.12, 0.28]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} />
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
    // Arms swing opposite to legs
    const swing = running ? Math.sin(t * 2 * -side) * 0.7 : 0;
    armRef.current.rotation.x = swing;
    armRef.current.rotation.z = side * (running ? 0.05 : 0.15);
  });

  return (
    <group ref={armRef} position={[side * 0.4, -0.35, 0]}>
      <mesh>
        <capsuleGeometry args={[0.08, 0.28, 8, 16]} />
        <meshStandardMaterial color={outfit} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.065, 0.2, 8, 16]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.48, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Eye({ side }: { side: number }) {
  return (
    <group position={[side * 0.12, 0.02, 0.27]}>
      <mesh scale={[1, 1.2, 0.5]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, -0.005, 0.025]} scale={[1, 1.2, 0.5]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      <mesh position={[0, -0.005, 0.035]} scale={[1, 1.2, 0.5]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[side * 0.015, 0.015, 0.038]} scale={[1, 1, 0.5]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function HatItem({ type }: { type: string }) {
  const y = 0.3;
  if (type === "cap") return (
    <group position={[0, y + 0.32, 0]}>
      <mesh><sphereGeometry args={[0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#e63946" /></mesh>
      <mesh position={[0, -0.02, 0.28]} rotation={[-0.3, 0, 0]}><boxGeometry args={[0.42, 0.035, 0.3]} /><meshStandardMaterial color="#c1121f" /></mesh>
    </group>
  );
  if (type === "crown") return (
    <group position={[0, y + 0.38, 0]}>
      <mesh><cylinderGeometry args={[0.28, 0.32, 0.2, 8]} /><meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} /></mesh>
      {[0,1,2,3,4,5,6,7].map(i => {const a=(i/8)*Math.PI*2; return <mesh key={i} position={[Math.cos(a)*0.27,0.16,Math.sin(a)*0.27]}><coneGeometry args={[0.04,0.12,4]}/><meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2}/></mesh>})}
    </group>
  );
  if (type === "wizard") return (
    <group position={[0, y + 0.32, 0]}>
      <mesh position={[0,0.35,0]}><coneGeometry args={[0.32,0.8,16]}/><meshStandardMaterial color="#4338ca"/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[0.25,0.48,32]}/><meshStandardMaterial color="#3730a3" side={THREE.DoubleSide}/></mesh>
    </group>
  );
  if (type === "tophat") return (
    <group position={[0, y + 0.35, 0]}>
      <mesh position={[0,0.22,0]}><cylinderGeometry args={[0.22,0.22,0.42,24]}/><meshStandardMaterial color="#1e293b"/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[0.21,0.38,24]}/><meshStandardMaterial color="#1e293b" side={THREE.DoubleSide}/></mesh>
    </group>
  );
  return null;
}

function AccessoryItem({ type }: { type: string }) {
  const y = 0.3;
  if (type === "glasses") return (
    <group position={[0, y + 0.01, 0.3]}>
      <mesh position={[-0.12,0,0]}><torusGeometry args={[0.065,0.012,8,16]}/><meshStandardMaterial color="#1a1a2e" metalness={0.8}/></mesh>
      <mesh position={[0.12,0,0]}><torusGeometry args={[0.065,0.012,8,16]}/><meshStandardMaterial color="#1a1a2e" metalness={0.8}/></mesh>
      <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.008,0.008,0.1,8]}/><meshStandardMaterial color="#1a1a2e" metalness={0.8}/></mesh>
    </group>
  );
  if (type === "cape") return (
    <group position={[0, -0.2, -0.32]}>
      <mesh rotation={[0.1,0,0]}><boxGeometry args={[0.7,1.2,0.04]}/><meshStandardMaterial color="#7c3aed" side={THREE.DoubleSide}/></mesh>
    </group>
  );
  if (type === "scarf") return (
    <group position={[0, -0.05, 0]}>
      <mesh><torusGeometry args={[0.2,0.055,8,32]}/><meshStandardMaterial color="#ef4444"/></mesh>
    </group>
  );
  if (type === "monocle") return (
    <group position={[0.12, y + 0.02, 0.31]}>
      <mesh><torusGeometry args={[0.06,0.008,8,16]}/><meshStandardMaterial color="#fbbf24" metalness={0.9}/></mesh>
    </group>
  );
  return null;
}
