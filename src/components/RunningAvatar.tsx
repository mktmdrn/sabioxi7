"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const OUTFIT_COLOR: Record<string, string> = {
  blue: "#3b82f6", green: "#22c55e", red: "#ef4444",
  gold: "#f59e0b", purple: "#a855f7", pink: "#ec4899",
};
const SKIN = "#ffdbac";
const HAIR = "#2d2d2d";

const ToyMaterial = ({ color, roughness = 0.3, metalness = 0.1, ...props }: any) => (
  <meshStandardMaterial 
    color={color} 
    roughness={roughness} 
    metalness={metalness}
    {...props} 
  />
);

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
        <AnimatedLeg side={-1} outfit="#1f2937" speed={speed} timeRef={timeRef} />
        <AnimatedLeg side={1} outfit="#1f2937" speed={speed} timeRef={timeRef} />

        {/* TORSO (Smooth Bean) */}
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.28, 0.5, 32, 32]} />
          <ToyMaterial color={outfit} />
        </mesh>

        {/* ARMS */}
        <AnimatedArm side={-1} outfit={outfit} skin={SKIN} speed={speed} timeRef={timeRef} />
        <AnimatedArm side={1} outfit={outfit} skin={SKIN} speed={speed} timeRef={timeRef} />

        {/* HEAD (Smooth Sphere) */}
        <group position={[0, 0.38, 0]}>
          <mesh>
            <sphereGeometry args={[0.38, 48, 48]} />
            <ToyMaterial color={SKIN} />
          </mesh>
          {/* Hair base (Smooth) */}
          <group position={[0, 0.1, -0.05]}>
            <mesh rotation={[-0.2, 0, 0]}>
              <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <ToyMaterial color={HAIR} />
            </mesh>
          </group>
          {/* Eyes (Simple Glossy Dots) */}
          <Eye side={-1} />
          <Eye side={1} />
        </group>

        {/* ITEMS */}
        <HatItem type={config.hat} />
        <AccessoryItem type={config.accessory} />

        {/* Booster Effect (Soft Clouds) */}
        {boosting && (
          <group position={[0, -0.5, -0.5]}>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[-0.3 - i * 0.15, -0.2 + Math.random() * 0.4, 0]}>
                <sphereGeometry args={[0.08 + i * 0.03, 16, 16]} />
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
    <group ref={legRef} position={[side * 0.18, -1.05, 0]}>
      <mesh>
        <capsuleGeometry args={[0.1, 0.3, 32, 32]} />
        <ToyMaterial color={outfit} />
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
    <group ref={armRef} position={[side * 0.42, -0.3, 0]}>
      <mesh><capsuleGeometry args={[0.08, 0.2, 32, 32]} /><ToyMaterial color={outfit} /></mesh>
      <mesh position={[0, -0.3, 0]}><capsuleGeometry args={[0.07, 0.15, 32, 32]} /><ToyMaterial color={skin} /></mesh>
    </group>
  );
}

function Eye({ side }: { side: number }) {
  return (
    <mesh position={[side * 0.14, 0.05, 0.34]}>
      <sphereGeometry args={[0.045, 16, 16]} />
      <ToyMaterial color="#111" roughness={0.1} />
    </mesh>
  );
}

function HatItem({ type }: { type: string }) {
  const y = 0.38;
  if (type === "cap") return (
    <group position={[0, y + 0.3, 0]}>
      <mesh><sphereGeometry args={[0.39, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /><ToyMaterial color="#ef4444" /></mesh>
      <mesh position={[0, 0, 0.3]} rotation={[-0.2, 0, 0]}><boxGeometry args={[0.45, 0.04, 0.3]} /><ToyMaterial color="#b91c1c" /></mesh>
    </group>
  );
  if (type === "crown") return (
    <group position={[0, y + 0.42, 0]}>
      <mesh><cylinderGeometry args={[0.22, 0.25, 0.15, 32]} /><ToyMaterial color="#fcd34d" metalness={0.6} /></mesh>
    </group>
  );
  if (type === "wizard") return (
    <group position={[0, y + 0.4, 0]}>
      <mesh position={[0, 0.3, 0]}><coneGeometry args={[0.3, 0.7, 32]} /><ToyMaterial color="#6366f1" /></mesh>
    </group>
  );
  return null;
}

function AccessoryItem({ type }: { type: string }) {
  if (type === "glasses") return (
    <group position={[0, 0.43, 0.35]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.14, 0, 0]}>
          <torusGeometry args={[0.07, 0.01, 16, 32]} /><ToyMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
  if (type === "cape") return (
    <mesh position={[0, -0.4, -0.35]} rotation={[0.1, 0, 0]}>
      <boxGeometry args={[0.7, 1.1, 0.02]} /><ToyMaterial color="#8b5cf6" />
    </mesh>
  );
  return null;
}
