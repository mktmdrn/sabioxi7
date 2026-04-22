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
      {/* ===== LEGS (Athletic & Defined) ===== */}
      {/* Left leg */}
      <group position={[-0.22, -1.2, 0]}>
        {/* Thigh (Muscular) */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.135, 0.1, 0.5, 24]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        
        {/* SHORTS (Athletic with Side Stripe) */}
        <group position={[0, -0.02, 0]}>
          <mesh>
            <cylinderGeometry args={[0.155, 0.145, 0.3, 24]} />
            <meshStandardMaterial {...pantsFabricMat} />
          </mesh>
          {/* Side Stripe */}
          <mesh position={[-0.14, 0, 0]} scale={[0.1, 1, 0.5]}>
            <boxGeometry args={[0.04, 0.3, 0.1]} />
            <meshStandardMaterial {...accentFabricMat} />
          </mesh>
        </group>

        {/* Knee */}
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.095, 16, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        
        {/* Lower leg (Muscular Calf + Sock) */}
        <group position={[0, -0.7, 0]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.08, 0.55, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          {/* Calf Muscle */}
          <mesh position={[0, 0.1, -0.03]} scale={[1, 1.1, 1.3]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          {/* SOCK (Mid-calf) */}
          <group position={[0, -0.15, 0]}>
            <mesh>
              <cylinderGeometry args={[0.085, 0.082, 0.28, 16]} />
              <meshStandardMaterial {...fabricMat} />
            </mesh>
            {/* Sock Trim (Blue) */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.088, 0.088, 0.04, 16]} />
              <meshStandardMaterial {...accentFabricMat} />
            </mesh>
          </group>
        </group>

        {/* SNEAKER (Athletic Blue/White) */}
        <group position={[0, -0.98, 0.08]}>
          {/* Main Body */}
          <mesh scale={[1.15, 1.15, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.16, 12, 24]} />
            <meshStandardMaterial {...fabricMat} />
          </mesh>
          {/* Blue Overlays */}
          <mesh position={[0, 0, 0]} scale={[1.18, 1.1, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.05, 12, 24]} />
            <meshStandardMaterial {...accentFabricMat} transparent opacity={0.8} />
          </mesh>
          {/* Sole */}
          <group position={[0, -0.1, 0]}>
            <mesh scale={[1.2, 0.3, 1.45]}>
              <boxGeometry args={[0.2, 0.1, 0.3]} />
              <meshStandardMaterial {...soleMat} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Right leg */}
      <group position={[0.22, -1.2, 0]}>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.135, 0.1, 0.5, 24]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        
        {/* SHORTS */}
        <group position={[0, -0.02, 0]}>
          <mesh>
            <cylinderGeometry args={[0.155, 0.145, 0.3, 24]} />
            <meshStandardMaterial {...pantsFabricMat} />
          </mesh>
          <mesh position={[0.14, 0, 0]} scale={[0.1, 1, 0.5]}>
            <boxGeometry args={[0.04, 0.3, 0.1]} />
            <meshStandardMaterial {...accentFabricMat} />
          </mesh>
        </group>

        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.095, 16, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        
        <group position={[0, -0.7, 0]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.08, 0.55, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          <mesh position={[0, 0.1, -0.03]} scale={[1, 1.1, 1.3]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          <group position={[0, -0.15, 0]}>
            <mesh>
              <cylinderGeometry args={[0.085, 0.082, 0.28, 16]} />
              <meshStandardMaterial {...fabricMat} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.088, 0.088, 0.04, 16]} />
              <meshStandardMaterial {...accentFabricMat} />
            </mesh>
          </group>
        </group>

        {/* SNEAKER */}
        <group position={[0, -0.98, 0.08]}>
          <mesh scale={[1.15, 1.15, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.16, 12, 24]} />
            <meshStandardMaterial {...fabricMat} />
          </mesh>
          <mesh position={[0, 0, 0]} scale={[1.18, 1.1, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.05, 12, 24]} />
            <meshStandardMaterial {...accentFabricMat} transparent opacity={0.8} />
          </mesh>
          <group position={[0, -0.1, 0]}>
            <mesh scale={[1.2, 0.3, 1.45]}>
              <boxGeometry args={[0.2, 0.1, 0.3]} />
              <meshStandardMaterial {...soleMat} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ===== TANK TOP (Broad Shoulders + Defined Physique) ===== */}
      <group position={[0, -0.6, 0]}>
        {/* Chest/Upper Torso */}
        <mesh position={[0, 0.35, 0]} scale={[1.28, 1.05, 1]}>
          <capsuleGeometry args={[0.24, 0.22, 20, 40]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        {/* Mid Section (Tapered) */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.3, 0.22, 0.45, 32]} />
          <meshStandardMaterial {...fabricMat} />
        </mesh>
        
        {/* Tank Top Straps (Accents) */}
        <group position={[0, 0.35, 0]}>
          {/* Neckline Trim */}
          <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.015, 8, 32]} />
            <meshStandardMaterial {...accentFabricMat} />
          </mesh>
          {/* Armhole Trim */}
          <mesh position={[-0.26, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.22, 0.015, 8, 32]} />
            <meshStandardMaterial {...accentFabricMat} />
          </mesh>
          <mesh position={[0.26, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.22, 0.015, 8, 32]} />
            <meshStandardMaterial {...accentFabricMat} />
          </mesh>
        </group>

        {/* Waist & Hips */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.25, 32]} />
          <meshStandardMaterial {...pantsFabricMat} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.27, 32, 16]} />
          <meshStandardMaterial {...pantsFabricMat} />
        </mesh>
      </group>

      {/* Collar Accent/Logo Placeholder */}
      <mesh position={[0, -0.22, 0.26]} rotation={[0.4, 0, 0]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} transparent opacity={0.9} />
      </mesh>

      {/* ===== ARMS (Exposed Muscle) ===== */}
      {/* Left arm */}
      <group position={[-0.5, -0.32, 0]} rotation={[0, 0, 0.28]}>
        {/* Shoulder / Deltoid */}
        <mesh position={[0, 0.02, 0]} scale={[1.3, 1.2, 1.25]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.115, 0.095, 0.35, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.085, 16, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.085, 0.065, 0.45, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {/* WRISTBAND (Blue) */}
        <mesh position={[0, -0.72, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.08, 16]} />
          <meshStandardMaterial {...accentFabricMat} />
        </mesh>
        {/* Hand */}
        <group position={[0, -0.86, 0]}>
          <mesh scale={[1.15, 1.25, 0.65]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          {[-0.05, -0.02, 0.02, 0.05].map((x, i) => (
            <mesh key={i} position={[x, -0.1, 0]} rotation={[0.1, 0, 0]}>
              <capsuleGeometry args={[0.015, 0.055, 4, 8]} />
              <meshStandardMaterial {...skinMat} />
            </mesh>
          ))}
          <mesh position={[0.08, -0.04, 0.02]} rotation={[0, 0, -0.8]}>
            <capsuleGeometry args={[0.02, 0.05, 4, 8]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
        </group>
      </group>

      {/* Right arm */}
      <group position={[0.5, -0.32, 0]} rotation={[0, 0, -0.28]}>
        <mesh position={[0, 0.02, 0]} scale={[1.3, 1.2, 1.25]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.115, 0.095, 0.35, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.085, 16, 12]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.085, 0.065, 0.45, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {/* WRISTBAND */}
        <mesh position={[0, -0.72, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.08, 16]} />
          <meshStandardMaterial {...accentFabricMat} />
        </mesh>
        <group position={[0, -0.86, 0]}>
          <mesh scale={[1.15, 1.25, 0.65]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          {[-0.05, -0.02, 0.02, 0.05].map((x, i) => (
            <mesh key={i} position={[x, -0.1, 0]} rotation={[0.1, 0, 0]}>
              <capsuleGeometry args={[0.015, 0.055, 4, 8]} />
              <meshStandardMaterial {...skinMat} />
            </mesh>
          ))}
          <mesh position={[-0.08, -0.04, 0.02]} rotation={[0, 0, 0.8]}>
            <capsuleGeometry args={[0.02, 0.05, 4, 8]} />
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
        <mesh scale={[1, 1.18, 1.05]}>
          <sphereGeometry args={[0.31, 32, 32]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        {/* Sharp Jawline & Chin */}
        <group position={[0, -0.16, 0.08]}>
          <mesh scale={[1, 0.55, 0.95]} rotation={[0.15, 0, 0]}>
            <sphereGeometry args={[0.29, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
          <mesh position={[0, -0.12, 0.16]} scale={[0.35, 0.28, 0.25]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial {...skinMat} />
          </mesh>
        </group>
        {/* Defined Cheekbones */}
        <mesh position={[-0.23, -0.04, 0.2]} scale={[0.9, 0.85, 0.6]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
        <mesh position={[0.23, -0.04, 0.2]} scale={[0.9, 0.85, 0.6]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>

        {/* ===== STYLIZED MESSY HAIR (Layered Strands) ===== */}
        <group>
          {/* Base Volume */}
          <mesh position={[0, 0.18, -0.06]} scale={[1.15, 0.98, 1.12]}>
            <sphereGeometry args={[0.32, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#1a120b" roughness={0.9} />
          </mesh>
          
          {/* Messy Strands Layer 1 */}
          <group position={[0, 0.2, 0.1]}>
            {[-0.2, -0.1, 0, 0.1, 0.2].map((x, i) => (
              <mesh key={i} position={[x, 0.18, 0.1]} rotation={[0.5, 0, x * 2]} scale={[0.8, 1, 1]}>
                <capsuleGeometry args={[0.06, 0.15, 4, 8]} />
                <meshStandardMaterial color="#241a11" roughness={0.8} />
              </mesh>
            ))}
          </group>
          
          {/* Top Messy Volume */}
          <group position={[0, 0.38, 0]}>
            {[[-0.1, 0.1], [0.05, 0.15], [-0.02, 0.05], [0.12, 0.08]].map((p, i) => (
              <mesh key={i} position={[p[0], 0, p[1]]} rotation={[0.2, 0, p[0] * 3]}>
                <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
                <meshStandardMaterial color="#241a11" roughness={0.8} />
              </mesh>
            ))}
          </group>

          {/* Long variant (back volume) */}
          {config.hair === "long" && (
            <group position={[0, -0.05, -0.28]}>
              <mesh scale={[1.15, 1.65, 0.85]}>
                <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, Math.PI * 0.2, Math.PI * 0.8]} />
                <meshStandardMaterial color="#1a120b" roughness={0.9} />
              </mesh>
            </group>
          )}
        </group>

        {/* HEADBAND (If active) */}
        {config.hat === "headband" && (
          <mesh position={[0, 0.15, 0.05]} rotation={[0.1, 0, 0]}>
            <cylinderGeometry args={[0.325, 0.325, 0.08, 32]} />
            <meshStandardMaterial {...accentFabricMat} />
          </mesh>
        )}

        {/* ===== EYES (Stylized Focus) ===== */}
        {[[-0.13, 1], [0.13, -1]].map((side, i) => (
          <group key={side[0]} position={[side[0], 0.08, 0.3]}>
            {/* Sclera */}
            <mesh scale={[1, blinking ? 0.1 : 1, 0.2]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>
            {/* Iris/Pupil */}
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
              position={[0, 0, 0.012]}
            >
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
            </mesh>
            {/* Upper Eyelid Focus */}
            <mesh position={[0, 0.06, 0.025]} rotation={[0.25, 0, 0]}>
              <boxGeometry args={[0.11, 0.012, 0.01]} />
              <meshStandardMaterial color="#000000" opacity={0.4} transparent />
            </mesh>
          </group>
        ))}

        {/* ===== EYEBROWS (Groomed) ===== */}
        <mesh 
          position={[-0.14, 0.2, 0.32]} 
          rotation={[0, 0, (expression === "anger" ? 0.45 : expression === "surprise" ? -0.25 : 0.15) + Math.PI / 2]}
        >
          <capsuleGeometry args={[0.014, 0.08, 4, 8]} />
          <meshStandardMaterial color="#241a11" />
        </mesh>
        <mesh 
          position={[0.14, 0.2, 0.32]} 
          rotation={[0, 0, (expression === "anger" ? -0.45 : expression === "surprise" ? 0.25 : -0.15) + Math.PI / 2]}
        >
          <capsuleGeometry args={[0.014, 0.08, 4, 8]} />
          <meshStandardMaterial color="#241a11" />
        </mesh>

        {/* ===== SHARP NOSE & MOUTH ===== */}
        <mesh position={[0, -0.01, 0.34]} rotation={[Math.PI / 2.1, 0, 0]}>
          <capsuleGeometry args={[0.024, 0.05, 4, 8]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.5} />
        </mesh>

        <group position={[0, -0.15, 0.34]} rotation={[0.1, 0, 0]}>
          {(expression === "neutral" || expression === "cool") && (
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.009, expression === "cool" ? 0.13 : 0.09, 4, 8]} />
              <meshStandardMaterial color="#b36d6d" />
            </mesh>
          )}
          {(expression === "smile" || expression === "smileWide") && (
            <mesh rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[expression === "smileWide" ? 0.07 : 0.06, 0.014, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#b36d6d" />
            </mesh>
          )}
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
