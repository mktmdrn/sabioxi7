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
      {/* ===== LEGS (Athletic Tapered) ===== */}
      {/* Left leg */}
      <group position={[-0.22, -1.2, 0]}>
        {/* Upper leg (Thigh) */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.13, 0.1, 0.45, 24]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        
        {/* SHORTS (Real Geometry) */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.15, 0.14, 0.25, 24]} />
          <meshStandardMaterial {...pantsFabricMat} />
        </mesh>

        {/* Knee */}
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        
        {/* Lower leg (Calf) */}
        <group position={[0, -0.65, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.08, 0.45, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          <mesh position={[0, 0.05, -0.02]} scale={[1, 1, 1.2]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
        </group>

        {/* SNEAKER (Improved Geometry) */}
        <group position={[0, -0.92, 0.08]}>
          {/* Main Body */}
          <mesh scale={[1.1, 1.1, 1.35]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.16, 12, 24]} />
            <meshStandardMaterial {...rubberMat} />
          </mesh>
          {/* Tongue/Front detail */}
          <mesh position={[0, 0.06, 0.05]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.12, 0.02, 0.1]} />
            <meshStandardMaterial {...accentFabricMat} />
          </mesh>
          {/* Sole (Distinct definition) */}
          <group position={[0, -0.1, 0]}>
            <mesh scale={[1.15, 0.28, 1.4]}>
              <boxGeometry args={[0.2, 0.1, 0.3]} />
              <meshStandardMaterial {...soleMat} />
            </mesh>
            {[0, 0.08, -0.08].map((z, i) => (
              <mesh key={i} position={[0, -0.04, z]}>
                <boxGeometry args={[0.23, 0.03, 0.02]} />
                <meshStandardMaterial color="#000000" opacity={0.4} transparent />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* Right leg */}
      <group position={[0.22, -1.2, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.13, 0.1, 0.45, 24]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        
        {/* SHORTS */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.15, 0.14, 0.25, 24]} />
          <meshStandardMaterial {...pantsFabricMat} />
        </mesh>

        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        
        <group position={[0, -0.65, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.08, 0.45, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          <mesh position={[0, 0.05, -0.02]} scale={[1, 1, 1.2]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
        </group>

        {/* SNEAKER */}
        <group position={[0, -0.92, 0.08]}>
          <mesh scale={[1.1, 1.1, 1.35]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.16, 12, 24]} />
            <meshStandardMaterial {...rubberMat} />
          </mesh>
          <mesh position={[0, 0.06, 0.05]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.12, 0.02, 0.1]} />
            <meshStandardMaterial {...accentFabricMat} />
          </mesh>
          <group position={[0, -0.1, 0]}>
            <mesh scale={[1.15, 0.28, 1.4]}>
              <boxGeometry args={[0.2, 0.1, 0.3]} />
              <meshStandardMaterial {...soleMat} />
            </mesh>
            {[0, 0.08, -0.08].map((z, i) => (
              <mesh key={i} position={[0, -0.04, z]}>
                <boxGeometry args={[0.23, 0.03, 0.02]} />
                <meshStandardMaterial color="#000000" opacity={0.4} transparent />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* ===== ATHLETIC TORSO (V-Shape fitted shirt) ===== */}
      <group position={[0, -0.6, 0]}>
        {/* Upper Chest (Broad Shoulders) */}
        <mesh position={[0, 0.32, 0]} scale={[1.25, 1, 1]}>
          <capsuleGeometry args={[0.25, 0.25, 20, 40]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        
        {/* Middle Torso (Tapered) */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.29, 0.21, 0.42, 32]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        
        {/* Sporty Stripe Accent */}
        <mesh position={[0, 0.32, 0.02]} scale={[1.27, 0.35, 1.05]}>
          <capsuleGeometry args={[0.25, 0.1, 16, 32]} />
          <meshStandardMaterial {...accentFabricMat} />
        </mesh>

        {/* Waist & Hips (Pants geometry) */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.21, 0.25, 0.25, 32]} />
          <meshStandardMaterial {...pantsFabricMat} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.26, 32, 16]} />
          <meshStandardMaterial {...pantsFabricMat} />
        </mesh>
      </group>

      {/* Collar Accent */}
      <mesh position={[0, -0.16, 0.26]} rotation={[0.4, 0, 0]}>
        <planeGeometry args={[0.22, 0.12]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* ===== ARMS (Tapered & Muscular) ===== */}
      {/* Left arm */}
      <group position={[-0.48, -0.34, 0]} rotation={[0, 0, 0.26]}>
        {/* Deltoid / Sleeve */}
        <mesh position={[0, -0.05, 0]} scale={[1.25, 1.1, 1.15]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.11, 0.09, 0.32, 16]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.42, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {/* Hand */}
        <group position={[0, -0.84, 0]}>
          <mesh scale={[1.15, 1.25, 0.65]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          {[-0.05, -0.02, 0.02, 0.05].map((x, i) => (
            <mesh key={i} position={[x, -0.1, 0]} rotation={[0.1, 0, 0]}>
              <capsuleGeometry args={[0.015, 0.05, 4, 8]} />
              <meshStandardMaterial {...skinMat} />
            </mesh>
          ))}
          <mesh position={[0.08, -0.04, 0.02]} rotation={[0, 0, -0.8]}>
            <capsuleGeometry args={[0.02, 0.045, 4, 8]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
        </group>
      </group>

      {/* Right arm */}
      <group position={[0.48, -0.34, 0]} rotation={[0, 0, -0.26]}>
        <mesh position={[0, -0.05, 0]} scale={[1.25, 1.1, 1.15]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.11, 0.09, 0.32, 16]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.42, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <group position={[0, -0.84, 0]}>
          <mesh scale={[1.15, 1.25, 0.65]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          {[-0.05, -0.02, 0.02, 0.05].map((x, i) => (
            <mesh key={i} position={[x, -0.1, 0]} rotation={[0.1, 0, 0]}>
              <capsuleGeometry args={[0.015, 0.05, 4, 8]} />
              <meshStandardMaterial {...skinMat} />
            </mesh>
          ))}
          <mesh position={[-0.08, -0.04, 0.02]} rotation={[0, 0, 0.8]}>
            <capsuleGeometry args={[0.02, 0.045, 4, 8]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
        </group>
      </group>



      {/* ===== NECK ===== */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.15, 12]} />
        <meshStandardMaterial {...skinMat} />
      </mesh>

      {/* ===== HEAD (Improved Anatomical Shape) ===== */}
      <group position={[0, 0.32, 0]}>
        {/* Main Skull */}
        <mesh scale={[1, 1.15, 1]}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {/* Jawline & Chin definition */}
        <group position={[0, -0.18, 0.05]}>
          <mesh scale={[1, 0.6, 0.9]} rotation={[0.2, 0, 0]}>
            <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          <mesh position={[0, -0.1, 0.15]} scale={[0.4, 0.3, 0.3]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
        </group>
        {/* Cheekbones */}
        <mesh position={[-0.22, -0.05, 0.18]} scale={[0.85, 0.8, 0.55]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0.22, -0.05, 0.18]} scale={[0.85, 0.8, 0.55]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>

        {/* ===== STYLIZED HAIR (Solid Mesh Volume) ===== */}
        <group>
          {/* Base Hair Volume */}
          <mesh position={[0, 0.15, -0.05]} scale={[1.12, config.hair === "short" ? 0.75 : 0.95, 1.1]}>
            <sphereGeometry args={[0.33, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
            <meshStandardMaterial color={HAIR_COLOR} roughness={0.7} />
          </mesh>
          
          {/* Styled Layers / Strands */}
          <group>
            {/* Top Volume */}
            <mesh position={[0, 0.38, 0]} scale={[1, 0.5, 1.2]} rotation={[0.2, 0, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={HAIR_COLOR} roughness={0.7} />
            </mesh>
            {/* Front strands / Bangs */}
            <mesh position={[0, 0.22, 0.24]} rotation={[0.45, 0, 0]} scale={[1.15, 0.3, 0.6]}>
              <capsuleGeometry args={[0.2, 0.1, 8, 16]} />
              <meshStandardMaterial color={HAIR_COLOR} roughness={0.7} />
            </mesh>
            {/* Side burns */}
            <mesh position={[-0.32, 0, 0.05]} rotation={[0, 0, 0.1]} scale={[0.4, 0.8, 0.8]}>
              <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
              <meshStandardMaterial color={HAIR_COLOR} roughness={0.7} />
            </mesh>
            <mesh position={[0.32, 0, 0.05]} rotation={[0, 0, -0.1]} scale={[0.4, 0.8, 0.8]}>
              <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
              <meshStandardMaterial color={HAIR_COLOR} roughness={0.7} />
            </mesh>
          </group>

          {/* Spike Variant Details */}
          {config.hair === "spike" && (
            <group position={[0, 0.38, 0]}>
              {[[-0.15, 0.1, 0.3], [0, 0.2, 0.4], [0.15, 0.1, 0.3]].map((p, i) => (
                <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[p[2], 0, 0]}>
                  <coneGeometry args={[0.08, 0.3, 8]} />
                  <meshStandardMaterial color={HAIR_COLOR} roughness={0.7} />
                </mesh>
              ))}
            </group>
          )}

          {/* Long Hair Variant Details */}
          {config.hair === "long" && (
            <group position={[0, -0.1, -0.25]}>
              <mesh scale={[1.1, 1.6, 0.8]}>
                <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, Math.PI * 0.2, Math.PI * 0.8]} />
                <meshStandardMaterial color={HAIR_COLOR} roughness={0.7} />
              </mesh>
            </group>
          )}
        </group>

        {/* ===== EYES (Stylized with Eyelids) ===== */}
        {[[-0.13, 1], [0.13, -1]].map((side, i) => (
          <group key={i} position={[side[0], 0.06, 0.28]}>
            {/* Eye Background / Sclera (Subtle) */}
            <mesh scale={[1, blinking ? 0.1 : 1, 0.2]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>
            {/* Stylized Pupil / Iris */}
            <mesh 
              scale={[
                1, 
                blinking ? 0.1 : (
                  eyeStyle === "wide" ? 1.3 : 
                  eyeStyle === "squint" ? 0.6 : 
                  eyeStyle === "happy" ? 0.8 : 
                  eyeStyle === "closed" ? 0.1 : 1
                ), 
                1
              ]}
              rotation={[0, 0, eyeStyle === "happy" ? Math.PI : 0]}
              position={[0, 0, 0.01]}
            >
              {eyeStyle === "happy" ? (
                <torusGeometry args={[0.042, 0.012, 8, 16, Math.PI]} />
              ) : (
                <sphereGeometry args={[0.042, 16, 16]} />
              )}
              <meshStandardMaterial color="#1a1a1a" roughness={0.15} />
            </mesh>
            {/* Upper Eyelid (Shadow/Line) */}
            <mesh position={[0, 0.05, 0.02]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.1, 0.01, 0.01]} />
              <meshStandardMaterial color="#000000" opacity={0.3} transparent />
            </mesh>
          </group>
        ))}

        {/* ===== EYEBROWS (Animated) ===== */}
        <mesh 
          position={[-0.13, 0.18, 0.3]} 
          rotation={[0, 0, (expression === "anger" ? 0.45 : expression === "surprise" ? -0.25 : 0.12) + Math.PI / 2]}
        >
          <capsuleGeometry args={[0.012, 0.07, 4, 8]} />
          <meshStandardMaterial color={HAIR_COLOR} />
        </mesh>
        <mesh 
          position={[0.13, 0.18, 0.3]} 
          rotation={[0, 0, (expression === "anger" ? -0.45 : expression === "surprise" ? 0.25 : -0.12) + Math.PI / 2]}
        >
          <capsuleGeometry args={[0.012, 0.07, 4, 8]} />
          <meshStandardMaterial color={HAIR_COLOR} />
        </mesh>

        {/* ===== NOSE & MOUTH ===== */}
        <mesh position={[0, -0.02, 0.32]} rotation={[Math.PI / 2.2, 0, 0]}>
          <capsuleGeometry args={[0.022, 0.045, 4, 8]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.6} />
        </mesh>

        <group position={[0, -0.15, 0.32]} rotation={[0.1, 0, 0]}>
          {(expression === "neutral" || expression === "cool") && (
            <mesh>
              <capsuleGeometry args={[0.008, expression === "cool" ? 0.12 : 0.08, 4, 8]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#c47a7a" />
            </mesh>
          )}
          {(expression === "smile" || expression === "smileWide") && (
            <mesh rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[expression === "smileWide" ? 0.065 : 0.055, 0.012, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#c47a7a" />
            </mesh>
          )}
          {/* ... other expressions ... */}
        </group>

        {/* Ears */}
        <mesh position={[-0.32, 0.02, -0.05]} scale={[0.4, 0.6, 0.7]} rotation={[0, 0.2, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0.32, 0.02, -0.05]} scale={[0.4, 0.6, 0.7]} rotation={[0, -0.2, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial {...skinMat} />
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
