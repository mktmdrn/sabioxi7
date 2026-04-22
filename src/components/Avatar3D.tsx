"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
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
  blue: "#1e1b4b",
  green: "#14532d",
  red: "#7f1d1d",
  gold: "#78350f",
  purple: "#3b0764",
  pink: "#831843",
};

const SKIN = "#f0c8a0";
const SKIN_SHADOW = "#dbb08a";
const HAIR_COLOR = "#1a1a1a";

/* ── Reusable clay material props ── */
const useClay = (color: string, opts?: { roughness?: number; metalness?: number }) => ({
  color,
  roughness: opts?.roughness ?? 0.5,
  metalness: opts?.metalness ?? 0.0,
});

function CharacterBody({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const [blinking, setBlinking] = useState(false);
  const blinkTimer = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.02;
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.06;
    blinkTimer.current += state.clock.getDelta();
    if (blinkTimer.current > 3 + Math.random() * 2) {
      setBlinking(true);
      blinkTimer.current = 0;
      setTimeout(() => setBlinking(false), 120);
    }
  });

  const expression = (config.mouth as string) || "neutral";
  const eyeStyle = (config.eyes as string) || "neutral";
  const accentColor = OUTFIT_COLOR[config.color] || OUTFIT_COLOR.blue;

  const skinClay = useClay(SKIN, { roughness: 0.6 });
  const hairClay = useClay(HAIR_COLOR, { roughness: 0.7 });
  const outfitClay = useClay(accentColor, { roughness: 0.75 });

  return (
    <group ref={groupRef}>
      {/* ══════ BODY / TORSO ══════ */}
      <group position={[0, -0.7, 0]}>
        <mesh position={[0, 0.15, 0]} scale={[1.05, 1, 1]}>
          <capsuleGeometry args={[0.32, 0.4, 12, 16]} />
          <meshStandardMaterial {...outfitClay} />
        </mesh>
        <mesh position={[0, 0.42, 0]} scale={[1.2, 0.5, 0.95]}>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial {...outfitClay} />
        </mesh>
      </group>

      {/* ══════ NECK ══════ */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.18, 12]} />
        <meshStandardMaterial {...skinClay} />
      </mesh>

      {/* ══════ HEAD ══════ */}
      <group position={[0, 0.32, 0]}>
        {/* Main skull */}
        <mesh scale={[1, 1, 1]}>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial {...skinClay} />
        </mesh>

        {/* ── EARS ── */}
        {[-1, 1].map((s) => (
          <group key={`ear${s}`} position={[s * 0.38, 0.0, -0.02]}>
            <mesh scale={[0.35, 0.5, 0.55]} rotation={[0, s * 0.25, 0]}>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial {...skinClay} />
            </mesh>
          </group>
        ))}

        {/* ── HAIR ── */}
        <group>
          <mesh position={[0, 0.1, -0.06]} rotation={[-0.25, 0, 0]} scale={[1.08, 0.8, 1.1]}>
            <sphereGeometry args={[0.39, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            <meshStandardMaterial {...hairClay} />
          </mesh>

          <mesh position={[0, 0.28, 0.12]} rotation={[0.4, 0, 0]} scale={[0.9, 0.45, 0.7]}>
            <sphereGeometry args={[0.32, 16, 12]} />
            <meshStandardMaterial {...hairClay} />
          </mesh>
          
          {/* Spike variant (integrated with swept base) */}
          {config.hair === "spike" && (
            <group position={[0, 0.4, 0]}>
              {[[-0.12, 0.15, 0.1], [0, 0.25, 0.15], [0.12, 0.15, 0.1]].map((p, i) => (
                <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[p[2] * 1.5, 0, 0]}>
                  <coneGeometry args={[0.07, 0.25, 12]} />
                  <meshPhysicalMaterial {...hairClay} />
                </mesh>
              ))}
            </group>
          )}
          {/* Long variant (simplified) */}
          {config.hair === "long" && (
            <mesh position={[0, -0.15, -0.22]} scale={[1.05, 1.2, 0.7]}>
              <sphereGeometry args={[0.34, 32, 24, 0, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.85]} />
              <meshPhysicalMaterial {...hairClay} />
            </mesh>
          )}
        </group>

        {/* ── EYES (simple black dots) ── */}
        {[-1, 1].map((s) => (
          <group key={`eye${s}`} position={[s * 0.13, 0.04, 0.32]}>
            <mesh scale={[1, blinking ? 0.08 : 1, 0.15]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            <mesh
              scale={[1, blinking ? 0.08 : (
                eyeStyle === "wide" ? 1.3 :
                eyeStyle === "squint" ? 0.55 :
                eyeStyle === "happy" ? 0.7 :
                eyeStyle === "closed" ? 0.08 : 1
              ), 1]}
              position={[0, 0, 0.015]}
            >
              {eyeStyle === "happy" ? (
                <torusGeometry args={[0.038, 0.012, 8, 16, Math.PI]} />
              ) : (
                <sphereGeometry args={[0.038, 12, 12]} />
              )}
              <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* ── EYEBROWS ── */}
        {[-1, 1].map((s) => (
          <mesh
            key={`brow${s}`}
            position={[s * 0.13, 0.16, 0.34]}
            rotation={[0, 0,
              (expression === "anger" ? s * -0.4 :
               expression === "surprise" ? s * 0.2 :
               s * -0.1) + Math.PI / 2
            ]}
          >
            <capsuleGeometry args={[0.016, 0.065, 4, 8]} />
            <meshStandardMaterial {...hairClay} />
          </mesh>
        ))}

        {/* ── NOSE ── */}
        <mesh position={[0, -0.04, 0.35]} rotation={[0.3, 0, 0]} scale={[0.7, 0.8, 0.6]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial {...useClay(SKIN_SHADOW, { roughness: 0.6 })} />
        </mesh>

        {/* ── MOUTH ── */}
        <group position={[0, -0.15, 0.34]} rotation={[0.1, 0, 0]}>
          {(expression === "neutral" || expression === "cool") && (
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.008, expression === "cool" ? 0.1 : 0.06, 4, 8]} />
              <meshStandardMaterial color="#b5696e" roughness={0.5} />
            </mesh>
          )}
          {(expression === "smile" || expression === "smileWide") && (
            <mesh rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[expression === "smileWide" ? 0.06 : 0.045, 0.01, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#b5696e" roughness={0.5} />
            </mesh>
          )}
          {expression === "surprise" && (
            <mesh>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#8b4547" roughness={0.5} />
            </mesh>
          )}
          {expression === "anger" && (
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.008, 0.08, 4, 8]} />
              <meshStandardMaterial color="#8b4547" roughness={0.5} />
            </mesh>
          )}
          {expression === "grin" && (
            <mesh rotation={[0, 0, Math.PI]} position={[0.02, 0, 0]}>
              <torusGeometry args={[0.04, 0.008, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#b5696e" roughness={0.5} />
            </mesh>
          )}
        </group>
      </group>

      {/* ══════ ARMS ══════ */}
      {[-1, 1].map((s) => (
        <group key={`arm${s}`} position={[s * 0.5, -0.38, 0]} rotation={[0, 0, s * 0.18]}>
          <mesh position={[0, -0.02, 0]} scale={[1.15, 1, 1.05]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial {...outfitClay} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.09, 0.2, 8, 12]} />
            <meshStandardMaterial {...outfitClay} />
          </mesh>
          <mesh position={[0, -0.48, 0]}>
            <capsuleGeometry args={[0.07, 0.22, 8, 12]} />
            <meshStandardMaterial {...skinClay} />
          </mesh>
          <mesh position={[0, -0.68, 0]} scale={[1.1, 1.2, 0.7]}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial {...skinClay} />
          </mesh>
        </group>
      ))}

      {/* Hat */}
      <Hat type={config.hat} />
      {/* Accessory */}
      <Accessory type={config.accessory} />
    </group>
  );
}

function Hat({ type }: { type: string }) {
  const headY = 0.3;
  const hatMat = (color: string) => ({
    color, roughness: 0.6, metalness: 0,
  });

  if (type === "cap") return (
    <group position={[0, headY + 0.35, 0]}>
      <mesh>
        <sphereGeometry args={[0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...hatMat("#e63946")} />
      </mesh>
      <mesh position={[0, -0.02, 0.32]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.48, 0.04, 0.32]} />
        <meshStandardMaterial {...hatMat("#c1121f")} />
      </mesh>
    </group>
  );

  if (type === "crown") return (
    <group position={[0, headY + 0.42, 0]}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.35, 0.22, 12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.29, 0.18, Math.sin(a) * 0.29]}>
            <coneGeometry args={[0.04, 0.14, 6]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );

  if (type === "wizard") return (
    <group position={[0, headY + 0.35, 0]}>
      <mesh position={[0, 0.38, 0]}>
        <coneGeometry args={[0.35, 0.85, 16]} />
        <meshStandardMaterial {...hatMat("#4338ca")} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.52, 24]} />
        <meshStandardMaterial {...hatMat("#3730a3")} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );

  if (type === "tophat") return (
    <group position={[0, headY + 0.38, 0]}>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.45, 16]} />
        <meshStandardMaterial {...hatMat("#1e293b")} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.23, 0.42, 24]} />
        <meshStandardMaterial {...hatMat("#1e293b")} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );

  return null;
}

function Accessory({ type }: { type: string }) {
  const headY = 0.3;

  if (type === "glasses") return (
    <group position={[0, headY + 0.01, 0.34]}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.13, 0, 0]}>
            <torusGeometry args={[0.065, 0.014, 8, 16]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.009, 0.009, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  );

  if (type === "monocle") return (
    <group position={[0.13, headY + 0.02, 0.35]}>
      <mesh>
        <torusGeometry args={[0.065, 0.01, 8, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );

  if (type === "cape") return (
    <group position={[0, -0.25, -0.35]}>
      <mesh rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.75, 1.2, 0.04]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );

  if (type === "scarf") return (
    <group position={[0, -0.08, 0]}>
      <mesh>
        <torusGeometry args={[0.22, 0.06, 8, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.7} />
      </mesh>
    </group>
  );

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
        camera={{ position: [0, 0, isSmall ? 3.0 : 2.4], fov: 40 }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ background: "transparent" }}
      >
        {/* Premium lighting setup */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#a5b4fc" />
        <directionalLight position={[0, -3, 4]} intensity={0.3} color="#fef3c7" />
        <hemisphereLight args={["#e0e7ff", "#fef3c7", 0.3]} />

        {/* Environment for reflections (key for the glossy clay look) */}
        <Environment preset="city" />

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
