"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";

type AvatarConfig = {
  color: string;
  hat: string;
  accessory: string;
  mouth: string;
  eyes: string;
  hair: string;
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

  // Animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.02;
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.06;

    // Blinking
    blinkTimer.current += state.clock.getDelta();
    if (blinkTimer.current > 3 + Math.random() * 2) {
      setBlinking(true);
      blinkTimer.current = 0;
      setTimeout(() => setBlinking(false), 120);
    }
  });

  const expression = (config.mouth as any) || "neutral";
  const eyeStyle = (config.eyes as any) || "neutral";

  const accentColor = OUTFIT_COLOR[config.color] || OUTFIT_COLOR.blue;
  const outfitDark = useMemo(() => {
    const c = new THREE.Color(accentColor);
    c.multiplyScalar(0.7);
    return "#" + c.getHexString();
  }, [accentColor]);

  // ===== PREMIUM PBR MATERIALS =====
  const skinMat = { 
    color: SKIN, 
    roughness: 0.62, 
    metalness: 0.05,
    flatShading: false 
  };
  const fabricMat = { 
    color: "#ffffff", 
    roughness: 0.85, 
    metalness: 0 
  };
  const accentFabricMat = { 
    color: accentColor, 
    roughness: 0.8, 
    metalness: 0 
  };
  const pantsFabricMat = { 
    color: "#334155", 
    roughness: 0.9, 
    metalness: 0 
  };
  const rubberMat = { 
    color: "#f8fafc", 
    roughness: 0.35, 
    metalness: 0.1 
  };
  const soleMat = { 
    color: "#1e293b", 
    roughness: 0.5, 
    metalness: 0.05 
  };

  return (
    <group ref={groupRef}>
      {/* ===== LEGS (Simple Capsules) ===== */}
      <group position={[-0.2, -1.2, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial {...pantsFabricMat} />
        </mesh>
        <group position={[0, -0.55, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          {/* Simple Shoe */}
          <mesh position={[0, -0.45, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.09, 0.15, 8, 16]} />
            <meshStandardMaterial {...rubberMat} />
          </mesh>
        </group>
      </group>

      <group position={[0.2, -1.2, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial {...pantsFabricMat} />
        </mesh>
        <group position={[0, -0.55, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          <mesh position={[0, -0.45, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.09, 0.15, 8, 16]} />
            <meshStandardMaterial {...rubberMat} />
          </mesh>
        </group>
      </group>

      {/* ===== TORSO (Clean V-Shape) ===== */}
      <group position={[0, -0.6, 0]}>
        <mesh position={[0, 0.25, 0]} scale={[1.2, 1, 1]}>
          <capsuleGeometry args={[0.22, 0.3, 16, 32]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        <mesh position={[0, 0.25, 0.01]} scale={[1.22, 0.3, 1.05]}>
          <capsuleGeometry args={[0.22, 0.1, 16, 32]} />
          <meshStandardMaterial {...accentFabricMat} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.25, 24]} />
          <meshStandardMaterial {...pantsFabricMat} />
        </mesh>
      </group>

      {/* ===== ARMS (Simple Capsules) ===== */}
      <group position={[-0.42, -0.35, 0]} rotation={[0, 0, 0.2]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.08, 0.35, 8, 16]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
      </group>

      <group position={[0.42, -0.35, 0]} rotation={[0, 0, -0.2]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.08, 0.35, 8, 16]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
      </group>

      {/* ===== NECK & HEAD (Spherical & Clean) ===== */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 12]} />
        <meshStandardMaterial {...skinMat} />
      </mesh>

      <group position={[0, 0.3, 0]}>
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>

        {/* EYES (Simple Dots) */}
        <group position={[0, 0.05, 0.28]}>
          <mesh position={[-0.12, 0, 0]} scale={[1, blinking ? 0.1 : 1, 1]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
          </mesh>
          <mesh position={[0.12, 0, 0]} scale={[1, blinking ? 0.1 : 1, 1]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
          </mesh>
        </group>

        {/* NOSE & MOUTH (Minimalist) */}
        <mesh position={[0, -0.02, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.02, 0.04, 4, 8]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.6} />
        </mesh>

        <group position={[0, -0.12, 0.3]}>
          {(expression === "neutral" || expression === "cool") && (
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.005, 0.08, 4, 8]} />
              <meshStandardMaterial color="#c47a7a" />
            </mesh>
          )}
          {(expression === "smile" || expression === "smileWide") && (
            <mesh rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.05, 0.01, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#c47a7a" />
            </mesh>
          )}
        </group>

        {/* HAIR (Simple Solid Shapes) */}
        <group>
          <mesh position={[0, 0.15, -0.05]} scale={[1.1, config.hair === "short" ? 0.7 : 0.9, 1.05]}>
            <sphereGeometry args={[0.31, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color={HAIR_COLOR} roughness={0.8} />
          </mesh>
          {config.hair === "long" && (
            <mesh position={[0, -0.1, -0.2]} scale={[1, 1.5, 0.7]}>
              <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.7]} />
              <meshStandardMaterial color={HAIR_COLOR} roughness={0.8} />
            </mesh>
          )}
          {config.hair === "spike" && (
            <group position={[0, 0.3, 0.1]}>
              {[[-0.1, 0], [0, 0.1], [0.1, 0]].map((p, i) => (
                <mesh key={i} position={[p[0], 0, p[1]]}>
                  <coneGeometry args={[0.08, 0.2, 8]} />
                  <meshStandardMaterial color={HAIR_COLOR} roughness={0.8} />
                </mesh>
              ))}
            </group>
          )}
        </group>
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
