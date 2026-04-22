"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import RunningAvatar from "./RunningAvatar";

const FINISH_LINE = 50;

// Simple crowd spectator figure
function Spectator({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    // Subtle idle bounce
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + offset) * 0.05;
  });

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.12, 0.25, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#f5d0a9" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Generate crowd on bleachers
function Crowd({ side }: { side: number }) {
  const spectators = useMemo(() => {
    const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4"];
    const specs = [];
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 25; i++) {
        specs.push({
          pos: [
            i * 2.2 - 5,
            1 + row * 0.6,
            side * (3.5 + row * 0.8),
          ] as [number, number, number],
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
    return specs;
  }, [side]);

  return (
    <>
      {/* Bleacher structure */}
      {[0, 1, 2].map((row) => (
        <mesh key={row} position={[22, 0.5 + row * 0.55, side * (3.5 + row * 0.8)]}>
          <boxGeometry args={[56, 0.2, 1.2]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
      ))}
      {spectators.map((s, i) => (
        <Spectator key={i} position={s.pos} color={s.color} />
      ))}
    </>
  );
}

// Track
function Track() {
  return (
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, -0.01, 0]}>
        <planeGeometry args={[70, 12]} />
        <meshStandardMaterial color="#d97706" roughness={0.9} />
      </mesh>
      {/* Track surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, 0, 0]}>
        <planeGeometry args={[56, 5]} />
        <meshStandardMaterial color="#dc6b40" roughness={0.7} />
      </mesh>
      {/* Lane lines */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[25, 0.01, i * 2]}>
          <planeGeometry args={[56, 0.05]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Start line */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.02, 0]}>
        <planeGeometry args={[5, 0.15]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Finish line */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[FINISH_LINE, 0.02, 0]}>
        <planeGeometry args={[5, 0.3]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      {/* Finish banner poles */}
      <mesh position={[FINISH_LINE, 1.5, -2.5]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[FINISH_LINE, 1.5, 2.5]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Finish banner */}
      <mesh position={[FINISH_LINE, 2.8, 0]}>
        <boxGeometry args={[0.1, 0.6, 5]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* "META" text placeholder - checkerboard pattern */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[FINISH_LINE, 0.025, -2 + i * 0.45]}>
          <planeGeometry args={[0.4, 0.15]} />
          <meshStandardMaterial color={i % 2 === 0 ? "white" : "#1e293b"} />
        </mesh>
      ))}
    </>
  );
}

function CameraRig({ p1Pos, p2Pos }: { p1Pos: number; p2Pos: number }) {
  useFrame((state) => {
    const maxPos = Math.max(p1Pos, p2Pos);
    const targetX = Math.max(maxPos, 3);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.5, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 5.5, 0.05);
    state.camera.lookAt(targetX, 0.5, 0);
  });
  return null;
}

export default function RaceScene({
  player1Config,
  player2Config,
  player1Pos,
  player2Pos,
  player1Speed,
  player2Speed,
  player1Boosting,
  player2Boosting,
}: {
  player1Config: { color: string; hat: string; accessory: string };
  player2Config: { color: string; hat: string; accessory: string };
  player1Pos: number;
  player2Pos: number;
  player1Speed: number;
  player2Speed: number;
  player1Boosting: boolean;
  player2Boosting: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [3, 1.5, 5.5], fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: "linear-gradient(180deg, #0ea5e9 0%, #7dd3fc 40%, #bae6fd 100%)" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#fde68a" />

        <Track />
        {/* Only background crowd to not block camera */}
        <Crowd side={-1} />

        <RunningAvatar
          config={player1Config}
          position={player1Pos}
          speed={player1Speed}
          boosting={player1Boosting}
          lane={0}
        />
        <RunningAvatar
          config={player2Config}
          position={player2Pos}
          speed={player2Speed}
          boosting={player2Boosting}
          lane={1}
        />

        <CameraRig p1Pos={player1Pos} p2Pos={player2Pos} />
      </Canvas>
    </div>
  );
}
