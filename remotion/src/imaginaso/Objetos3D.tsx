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

/** Porquinho (cofrinho) gigante cor-de-rosa com fenda de moeda. */
export const Porquinho3D: React.FC<{ pos?: V3; esc?: number; rotY?: number }> = ({ pos = [0, 0, 0], esc = 1, rotY = 0 }) => (
  <group position={pos} scale={esc} rotation={[0, rotY, 0]}>
    <Caixa p={[0, 1.0, 0]} s={[1.6, 1.2, 1.2]} cor="#ff9ec4" contorno={0.06} />
    <Caixa p={[0, 0.95, 0.68]} s={[0.6, 0.45, 0.2]} cor="#ff7fb0" contorno={0.04} />
    {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.12, 0.95, 0.79]} s={[0.1, 0.16, 0.03]} cor="#c2185b" contorno={0} />)}
    {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.35, 1.3, 0.61]} s={[0.12, 0.16, 0.03]} cor={C3.linha} contorno={0} />)}
    {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.5, 1.72, 0.25]} s={[0.3, 0.3, 0.15]} rot={[0, 0, l * 0.4]} cor="#ff7fb0" contorno={0.04} />)}
    {[[-0.5, -0.35], [0.5, -0.35], [-0.5, 0.35], [0.5, 0.35]].map(([x, zz], i) => <Caixa key={i} p={[x, 0.22, zz]} s={[0.3, 0.44, 0.3]} cor="#ff7fb0" contorno={0.04} />)}
    <Caixa p={[0, 1.62, 0]} s={[0.5, 0.04, 0.1]} cor={C3.linha} contorno={0} />
  </group>
);

/** Pergaminho que desenrola para a frente (+z) até `comp` unidades. */
export const Pergaminho3D: React.FC<{ pos?: V3; comp: number; rotY?: number }> = ({ pos = [0, 0, 0], comp, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Caixa p={[0, 0, 0]} s={[1.4, 0.24, 0.24]} cor="#c9a46b" contorno={0.04} />
    {comp > 0.05 && <Caixa p={[0, -0.02, comp / 2]} s={[1.2, 0.04, comp]} cor="#f6ecd2" contorno={0.03} />}
    {Array.from({ length: Math.floor(comp / 0.35) }).map((_, i) => (
      <Caixa key={i} p={[-0.1 + ((i * 37) % 5) * 0.05, 0.01, 0.3 + i * 0.35]} s={[0.8 - ((i * 13) % 4) * 0.1, 0.01, 0.06]} cor="#8a7a5a" contorno={0} sombra={false} />
    ))}
    <Caixa p={[0, 0, comp]} s={[1.4, 0.24, 0.24]} cor="#c9a46b" contorno={0.04} />
  </group>
);

/** Churrasqueira com brasa, carne e fumaça; `dourada` vira a "melhor do servidor". */
export const Churrasqueira3D: React.FC<{ t: number; pos?: V3; esc?: number; dourada?: number }> = ({ t, pos = [0, 0, 0], esc = 1, dourada = 0 }) => {
  const corpo = dourada > 0 ? C3.amarelo : "#2b2b33";
  return (
    <group position={pos} scale={esc}>
      {[[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.4], [0.8, 0.4]].map(([x, zz], i) => <Caixa key={i} p={[x, 0.45, zz]} s={[0.14, 0.9, 0.14]} cor="#555560" contorno={0.03} />)}
      <Caixa p={[0, 1.15, 0]} s={[2.0, 0.5, 1.1]} cor={corpo} contorno={0.06} brilho={dourada > 0 ? "#ffb000" : undefined} forca={0.4 * dourada} />
      <Caixa p={[0, 1.41, 0]} s={[1.8, 0.04, 0.9]} cor="#ff6a1a" contorno={0} brilho="#ff4000" forca={0.8} />
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <Caixa key={x} p={[x, 1.52, (i % 2) * 0.2 - 0.1]} s={[0.3, 0.16, 0.55]} cor={i % 2 ? "#8b3a1a" : "#b5532a"} contorno={0.025} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const y = 1.7 + ((t * 1.1 + i * 0.3) % 2.4);
        const s = 0.2 + (y - 1.7) * 0.12;
        return <Caixa key={i} p={[Math.sin(i * 2.3 + t) * 0.5, y, Math.cos(i * 1.7) * 0.3]} s={[s, s, s]} cor="#e8e8e8" contorno={0} opacidade={0.8 * (1 - (y - 1.7) / 2.4)} sombra={false} />;
      })}
    </group>
  );
};

/** Troféu dourado. */
export const Trofeu3D: React.FC<{ pos?: V3; esc?: number; rotY?: number }> = ({ pos = [0, 0, 0], esc = 1, rotY = 0 }) => (
  <group position={pos} scale={esc} rotation={[0, rotY, 0]}>
    <Caixa p={[0, 0.15, 0]} s={[0.9, 0.3, 0.9]} cor="#7a4a2a" contorno={0.04} />
    <Caixa p={[0, 0.5, 0]} s={[0.2, 0.4, 0.2]} cor={C3.amarelo} contorno={0.03} />
    <Caixa p={[0, 1.05, 0]} s={[0.9, 0.75, 0.9]} cor={C3.amarelo} brilho="#ffb000" forca={0.4} contorno={0.05} />
    {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.6, 1.1, 0]} s={[0.2, 0.45, 0.15]} cor={C3.amarelo} contorno={0.03} />)}
  </group>
);

/** Explosão de blocos (laranja/amarelo) a partir de `t0`. */
export const Explosao3D: React.FC<{ t: number; t0: number; pos: V3; esc?: number }> = ({ t, t0, pos, esc = 1 }) => {
  const d = t - t0;
  if (d < 0 || d > 0.6) return null;
  return (
    <group position={pos} scale={esc}>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = i * 2.39, b = ((i % 5) - 2) * 0.5;
        const r = 0.3 + d * 4;
        const s = 0.6 * (1 - d / 0.6);
        return (
          <mesh key={i} position={[Math.cos(a) * r, b * r * 0.6, Math.sin(a) * r * 0.6]} rotation={[d * 5, a, 0]}>
            <boxGeometry args={[s, s, s]} />
            <meshBasicMaterial color={i % 3 === 0 ? "#fff2a0" : i % 3 === 1 ? "#ffb000" : "#ff5a1a"} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Cone de luz de holofote (de cima para baixo). */
export const Holofote3D: React.FC<{ pos: V3; altura?: number; raio?: number; op?: number }> = ({ pos, altura = 8, raio = 1.6, op = 0.25 }) => (
  <mesh position={[pos[0], pos[1] + altura / 2, pos[2]]}>
    <coneGeometry args={[raio, altura, 24, 1, true]} />
    <meshBasicMaterial color="#fff6c2" transparent opacity={op} side={THREE.DoubleSide} depthWrite={false} />
  </mesh>
);

/** Sofá de blocos (frente para +z). */
export const Sofa3D: React.FC<{ pos?: V3; esc?: number }> = ({ pos = [0, 0, 0], esc = 1 }) => (
  <group position={pos} scale={esc}>
    <Caixa p={[0, 0.45, 0]} s={[3.6, 0.9, 1.4]} cor="#6d4c9f" contorno={0.06} />
    <Caixa p={[0, 1.3, -0.55]} s={[3.6, 1.0, 0.35]} cor="#6d4c9f" contorno={0.06} />
    {[-1, 1].map((l) => <Caixa key={l} p={[l * 1.95, 0.85, 0]} s={[0.35, 0.9, 1.4]} cor="#5a3d86" contorno={0.05} />)}
  </group>
);

/** Espeto de churrasco (para voar na câmera). */
export const Espeto3D: React.FC<{ pos?: V3; rot?: V3; esc?: number }> = ({ pos = [0, 0, 0], rot = [0, 0, 0], esc = 1 }) => (
  <group position={pos} rotation={rot} scale={esc}>
    <Caixa s={[0.08, 2.4, 0.08]} cor="#c0c0c8" contorno={0.02} />
    {[0.6, 0.15, -0.3].map((y, i) => <Caixa key={y} p={[0, y, 0]} s={[0.4, 0.36, 0.4]} cor={i === 1 ? "#d0603a" : "#8b3a1a"} contorno={0.03} />)}
  </group>
);
