import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, ContactShadows } from "@react-three/drei";
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
  gold: "#f59e0b",
  purple: "#a855f7",
  pink: "#ec4899",
};

const SKIN = "#ffdbac";
const HAIR_COLOR = "#2d2d2d";

/* ── Premium Toy Material ── */
const ToyMaterial = ({ color, roughness = 0.3, metalness = 0.1, ...props }: any) => (
  <meshStandardMaterial 
    color={color} 
    roughness={roughness} 
    metalness={metalness}
    envMapIntensity={1}
    {...props} 
  />
);

function PremiumCharacter({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const [blinking, setBlinking] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    
    // Subtle breathing
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.02;
    
    // Smooth head follow
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
      headRef.current.rotation.x = Math.cos(t * 0.3) * 0.03;
    }

    // Blink logic
    if (Math.random() < 0.005) {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }
  });

  const outfitColor = OUTFIT_COLOR[config.color] || OUTFIT_COLOR.blue;

  return (
    <group ref={groupRef}>
      {/* ── TORSO (Soft Bean Shape) ── */}
      <mesh position={[0, -0.4, 0]}>
        <capsuleGeometry args={[0.28, 0.5, 32, 32]} />
        <ToyMaterial color={outfitColor} roughness={0.4} />
      </mesh>

      {/* ── HEAD (Smooth Rounded Square/Sphere) ── */}
      <group ref={headRef} position={[0, 0.38, 0]}>
        {/* Face Base */}
        <mesh>
          <sphereGeometry args={[0.38, 64, 64]} />
          <ToyMaterial color={SKIN} />
        </mesh>

        {/* Hair (Smooth & Thick) */}
        <group position={[0, 0.1, -0.05]}>
          <mesh rotation={[-0.2, 0, 0]}>
            <sphereGeometry args={[0.4, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <ToyMaterial color={HAIR_COLOR} roughness={0.5} />
          </mesh>
          {config.hair === "spike" && (
            <mesh position={[0, 0.35, 0.1]}>
              <sphereGeometry args={[0.15, 32, 32]} scale={[1, 1.8, 1]} />
              <ToyMaterial color={HAIR_COLOR} />
            </mesh>
          )}
          {config.hair === "long" && (
            <mesh position={[0, -0.1, -0.2]}>
              <sphereGeometry args={[0.35, 48, 48]} scale={[1.1, 1, 0.8]} />
              <ToyMaterial color={HAIR_COLOR} />
            </mesh>
          )}
        </group>

        {/* Eyes (Glossy Button Eyes) */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.14, 0.05, 0.34]} scale={[1, blinking ? 0.1 : 1, 1]}>
            <sphereGeometry args={[0.045, 32, 32]} />
            <ToyMaterial color="#111" roughness={0.1} metalness={0.5} />
          </mesh>
        ))}

        {/* Blushes (Cute detail) */}
        {[-1, 1].map((s) => (
          <mesh key={`blush-${s}`} position={[s * 0.24, -0.05, 0.3]} rotation={[0, s * 0.2, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} scale={[1, 0.4, 0.1]} />
            <ToyMaterial color="#ff9999" transparent opacity={0.4} />
          </mesh>
        ))}

        {/* Mouth */}
        <mesh position={[0, -0.12, 0.35]} rotation={[0.1, 0, 0]}>
          <torusGeometry args={[0.04, 0.008, 16, 32, Math.PI]} rotation={[0, 0, Math.PI]} />
          <ToyMaterial color="#8b4513" />
        </mesh>

        <Hat type={config.hat} />
      </group>

      {/* ── ARMS (Soft & Rounded) ── */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.42, -0.25, 0]} rotation={[0, 0, s * 0.15]}>
          {/* Shoulder */}
          <mesh>
            <sphereGeometry args={[0.1, 32, 32]} />
            <ToyMaterial color={outfitColor} />
          </mesh>
          {/* Sleeve */}
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.08, 0.15, 32, 32]} />
            <ToyMaterial color={outfitColor} />
          </mesh>
          {/* Arm & Hand */}
          <mesh position={[0, -0.35, 0]}>
            <capsuleGeometry args={[0.07, 0.2, 32, 32]} />
            <ToyMaterial color={SKIN} />
          </mesh>
        </group>
      ))}

      {/* ── LEGS (Clean Boots) ── */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.16, -0.9, 0]}>
          <mesh>
            <capsuleGeometry args={[0.1, 0.3, 32, 32]} />
            <ToyMaterial color={outfitColor} />
          </mesh>
          <mesh position={[0, -0.25, 0.06]}>
            <boxGeometry args={[0.16, 0.12, 0.28]} />
            <ToyMaterial color="#1f2937" roughness={0.8} />
          </mesh>
        </group>
      ))}

      <Accessory type={config.accessory} />
    </group>
  );
}

function Hat({ type }: { type: string }) {
  if (type === "cap") return (
    <group position={[0, 0.3, 0]}>
      <mesh>
        <sphereGeometry args={[0.39, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <ToyMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0, 0.3]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.45, 0.04, 0.3]} />
        <ToyMaterial color="#b91c1c" />
      </mesh>
    </group>
  );
  if (type === "crown") return (
    <group position={[0, 0.42, 0]}>
      <mesh>
        <cylinderGeometry args={[0.22, 0.25, 0.15, 32]} />
        <ToyMaterial color="#fcd34d" metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
  if (type === "wizard") return (
    <group position={[0, 0.4, 0]}>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.3, 0.7, 32]} />
        <ToyMaterial color="#6366f1" />
      </mesh>
    </group>
  );
  return null;
}

function Accessory({ type }: { type: string }) {
  if (type === "glasses") return (
    <group position={[0, 0.43, 0.35]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.14, 0, 0]}>
          <torusGeometry args={[0.07, 0.01, 16, 32]} />
          <ToyMaterial color="#111" roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
  if (type === "cape") return (
    <mesh position={[0, -0.4, -0.35]} rotation={[0.1, 0, 0]}>
      <boxGeometry args={[0.7, 1.1, 0.02]} />
      <ToyMaterial color="#8b5cf6" roughness={0.8} />
    </mesh>
  );
  return null;
}

export default function Avatar3D({
  config,
  size = "large",
  zoom = 1,
}: {
  config: AvatarConfig;
  size?: "large" | "small";
  zoom?: number;
}) {
  const isSmall = size === "small";
  const cameraDist = isSmall ? 3.0 : 2.5;

  return (
    <div style={{ width: "100%", height: isSmall ? "200px" : "450px" }}>
      <Canvas
        camera={{ position: [0, 0, cameraDist / zoom], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#fff" />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#bbf" />
        <pointLight position={[0, 1, 3]} intensity={1.2} />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <PremiumCharacter config={config} />
        </Float>

        <ContactShadows 
          position={[0, -1.3, 0]} 
          opacity={0.4} 
          scale={5} 
          blur={2.5} 
          far={2} 
        />
        
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
