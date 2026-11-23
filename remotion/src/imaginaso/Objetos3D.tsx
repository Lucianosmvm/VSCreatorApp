import React from "react";
import * as THREE from "three";
import { C3, Caixa } from "./Bloco3D";

// Objetos 3D extras do Imagina Só (#02 em diante). Paleta C3, contorno pela Caixa, sem marcas.
type V3 = [number, number, number];

/** Trono de blocos vermelho e dourado (frente para +z). */
export const Trono3D: React.FC<{ pos?: V3; rotY?: number; esc?: number }> = ({ pos = [0, 0, 0], rotY = 0, esc = 1 }) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={esc}>
    <Caixa p={[0, 0.5, 0]} s={[2.0, 1.0, 1.6]} cor="#c0392b" contorno={0.06} />
    <Caixa p={[0, 1.04, 0.1]} s={[1.7, 0.1, 1.3]} cor="#e74c3c" contorno={0.03} />
    <Caixa p={[0, 2.4, -0.7]} s={[2.0, 2.8, 0.3]} cor="#c0392b" contorno={0.06} />
    {[-1, 0, 1].map((x) => <Caixa key={x} p={[x * 0.75, 4.0, -0.7]} s={[0.4, 0.5, 0.3]} cor={C3.amarelo} brilho="#ffb000" forca={0.3} contorno={0.04} />)}
    {[-1, 1].map((l) => <Caixa key={l} p={[l * 1.05, 1.3, 0]} s={[0.3, 0.6, 1.6]} cor={C3.amarelo} contorno={0.05} />)}
  </group>
);

/** Relógio de parede gigante; `h` em horas decimais (22 = 10 em ponto). */
export const Relogio3D: React.FC<{ pos?: V3; esc?: number; h: number }> = ({ pos = [0, 0, 0], esc = 1, h }) => {
  const ah = -((h % 12) / 12) * Math.PI * 2;
  const am = -(h % 1) * Math.PI * 2;
  return (
    <group position={pos} scale={esc}>
      <Caixa s={[3, 3, 0.4]} cor="#ffffff" contorno={0.12} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <Caixa key={i} p={[Math.sin(a) * 1.2, Math.cos(a) * 1.2, 0.22]} s={[0.14, 0.24, 0.04]} rot={[0, 0, -a]} cor={C3.linha} contorno={0} />;
      })}
      <group position={[0, 0, 0.26]} rotation={[0, 0, ah]}><Caixa p={[0, 0.4, 0]} s={[0.16, 0.8, 0.05]} cor={C3.linha} contorno={0} /></group>
      <group position={[0, 0, 0.3]} rotation={[0, 0, am]}><Caixa p={[0, 0.55, 0]} s={[0.1, 1.1, 0.05]} cor={C3.vermelho} contorno={0} /></group>
      <Caixa p={[0, 0, 0.32]} s={[0.2, 0.2, 0.05]} cor={C3.linha} contorno={0} />
    </group>
  );
};

/** Prato com brócolis; `resto` 0..1 (quanto ainda falta comer). */
export const Brocolis3D: React.FC<{ pos?: V3; esc?: number; resto?: number }> = ({ pos = [0, 0, 0], esc = 1, resto = 1 }) => (
  <group position={pos} scale={esc}>
    <Caixa s={[1.6, 0.12, 1.6]} cor="#ffffff" contorno={0.04} />
    {Array.from({ length: 7 }).map((_, i) => {
      if (i / 7 >= resto) return null;
      const a = i * 2.2;
      const r = i === 0 ? 0 : 0.45;
      return (
        <group key={i} position={[Math.cos(a) * r, 0.1, Math.sin(a) * r]}>
          <Caixa p={[0, 0.15, 0]} s={[0.12, 0.3, 0.12]} cor="#9ccc65" contorno={0.02} />
          <Caixa p={[0, 0.42, 0]} s={[0.42, 0.3, 0.42]} cor="#2e7d32" contorno={0.03} />
        </group>
      );
    })}
  </group>
);

/** Cadeado gigante. */
export const Cadeado3D: React.FC<{ pos?: V3; esc?: number; rot?: V3 }> = ({ pos = [0, 0, 0], esc = 1, rot = [0, 0, 0] }) => (
  <group position={pos} scale={esc} rotation={rot}>
    <Caixa s={[1.6, 1.3, 0.6]} cor={C3.amarelo} contorno={0.07} brilho="#ffb000" forca={0.2} />
    <Caixa p={[0, 0.05, 0.31]} s={[0.22, 0.4, 0.04]} cor={C3.linha} contorno={0} />
    {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.5, 1.0, 0]} s={[0.2, 0.75, 0.25]} cor="#9aa5b1" contorno={0.04} />)}
    <Caixa p={[0, 1.42, 0]} s={[1.2, 0.2, 0.25]} cor="#9aa5b1" contorno={0.04} />
  </group>
);

/** Lupa gigante (lente virada para +z). */
export const Lupa3D: React.FC<{ pos?: V3; esc?: number; rot?: V3 }> = ({ pos = [0, 0, 0], esc = 1, rot = [0, 0, 0] }) => (
  <group position={pos} scale={esc} rotation={rot}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.8, 0.14, 10, 32]} /><meshBasicMaterial color="#7a4a2a" /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.72, 0.72, 0.05, 32]} /><meshBasicMaterial color="#bfe9ff" transparent opacity={0.45} /></mesh>
    <Caixa p={[0.85, -0.85, 0]} s={[0.25, 1.2, 0.25]} rot={[0, 0, Math.PI / 4]} cor="#7a4a2a" contorno={0.04} />
  </group>
);

/** Livro (capa colorida, páginas brancas). */
export const Livro3D: React.FC<{ pos?: V3; rot?: V3; esc?: number; cor?: string }> = ({ pos = [0, 0, 0], rot = [0, 0, 0], esc = 1, cor = C3.azul }) => (
  <group position={pos} rotation={rot} scale={esc}>
    <Caixa s={[0.9, 0.22, 1.2]} cor={cor} contorno={0.035} />
    <Caixa p={[0.06, 0, 0]} s={[0.82, 0.16, 1.12]} cor="#fffaf0" contorno={0} />
  </group>
);

/** Moeda dourada genérica com estrela. */
export const Moeda3D: React.FC<{ pos?: V3; rot?: V3; esc?: number }> = ({ pos = [0, 0, 0], rot = [0, 0, 0], esc = 1 }) => (
  <group position={pos} rotation={rot} scale={esc}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 0.14, 20]} />
      <meshToonMaterial color={C3.amarelo} emissive="#ffb000" emissiveIntensity={0.3} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.56, 0.56, 0.1, 20]} />
      <meshBasicMaterial color={C3.linha} side={THREE.BackSide} />
    </mesh>
    <Caixa p={[0, 0, 0.08]} s={[0.26, 0.26, 0.03]} rot={[0, 0, Math.PI / 4]} cor="#fff6c2" contorno={0} />
  </group>
);

/** Fumaça de "poof": cubos brancos saindo em todas as direções a partir de `t0`. */
export const Poof3D: React.FC<{ t: number; t0: number; pos: V3 }> = ({ t, t0, pos }) => {
  const d = t - t0;
  if (d < 0 || d > 0.7) return null;
  return (
    <group position={pos}>
      {Array.from({ length: 16 }).map((_, i) => {
        const a = i * 2.39;
        const b = (i % 4) * 0.5 - 0.6;
        const r = 0.6 + d * 3;
        const s = 0.7 * (1 - d / 0.7);
        return (
          <mesh key={i} position={[Math.cos(a) * r, 1.5 + b * r, Math.sin(a) * r * 0.6]}>
            <boxGeometry args={[s, s, s]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
        );
      })}
    </group>
  );
};
