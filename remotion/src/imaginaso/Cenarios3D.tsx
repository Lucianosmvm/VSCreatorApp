import React, { useMemo } from "react";
import * as THREE from "three";
import { C3, Caixa } from "./Bloco3D";

// Cenários e veículos extras do Imagina Só (#04 em diante): rua que corre, veículos,
// céu com nuvens, Terra, Lua, estrelas e efeitos de velocidade. Tudo genérico, sem marcas.
type V3 = [number, number, number];
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Rua ao longo de x que "anda" com `desloc` (o personagem fica parado e o mundo passa).
 *  `quebrado` troca os vidros das janelas por buracos escuros. */
export const Rua3D: React.FC<{ desloc: number; quebrado?: boolean }> = ({ desloc, quebrado = false }) => {
  const CORES = ["#ffd9a6", "#bde4ff", "#ffc2d6", "#d4f5c4", "#fff1a8"];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[400, 200]} /><meshToonMaterial color={C3.grama} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow><planeGeometry args={[400, 4.4]} /><meshToonMaterial color="#5b5f6b" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3.2]} receiveShadow><planeGeometry args={[400, 2]} /><meshToonMaterial color="#d9d3c6" /></mesh>
      {Array.from({ length: 30 }).map((_, i) => (
        <Caixa key={i} p={[-45 + i * 3 - mod(desloc, 3), 0.03, 0]} s={[1.4, 0.02, 0.18]} cor="#ffffff" contorno={0} sombra={false} />
      ))}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = -45 + i * 9 - mod(desloc, 9);
        const cor = CORES[mod(i + Math.floor(desloc / 9), CORES.length)];
        return (
          <group key={i} position={[x, 0, -7]}>
            <Caixa p={[0, 2.5, 0]} s={[6.4, 5, 3]} cor={cor} contorno={0.07} />
            <Caixa p={[0, 5.3, 0]} s={[6.8, 0.6, 3.4]} cor={C3.telhado} contorno={0.07} />
            <Caixa p={[0, 1.4, 1.52]} s={[1.2, 2.8, 0.1]} cor={C3.porta} contorno={0.05} />
            {[-2, 2].map((wx) => (
              <Caixa key={wx} p={[wx, 3.3, 1.52]} s={[1.6, 1.4, 0.1]} cor={quebrado ? "#2a2f3a" : C3.janela} contorno={0.06} />
            ))}
            <Caixa p={[4.5, 1.2, 3.6]} s={[0.4, 2.4, 0.4]} cor={C3.tronco} contorno={0.04} />
            <Caixa p={[4.5, 3.0, 3.6]} s={[1.8, 1.6, 1.8]} cor={C3.folha} contorno={0.05} />
          </group>
        );
      })}
    </group>
  );
};

/** Nuvens que passam (céu aberto); `desloc` move para trás. */
export const Nuvens3D: React.FC<{ desloc: number; y?: number }> = ({ desloc, y = 0 }) => (
  <group>
    {Array.from({ length: 14 }).map((_, i) => {
      const x = -40 + mod(i * 9.7 - desloc, 80);
      const yy = y - 6 + ((i * 37) % 12);
      const z = -4 - ((i * 53) % 18);
      return (
        <group key={i} position={[x, yy, z]}>
          <Caixa s={[4, 1.4, 1.6]} cor="#ffffff" contorno={0.08} sombra={false} />
          <Caixa p={[-1.1, 0.7, 0]} s={[1.8, 1.4, 1.4]} cor="#ffffff" contorno={0.08} sombra={false} />
          <Caixa p={[0.9, 0.9, 0]} s={[2.2, 1.6, 1.4]} cor="#ffffff" contorno={0.08} sombra={false} />
        </group>
      );
    })}
  </group>
);

/** Ônibus escolar amarelo (frente para +x). */
export const Onibus3D: React.FC<{ pos?: V3; rodas?: number }> = ({ pos = [0, 0, 0], rodas = 0 }) => (
  <group position={pos}>
    <Caixa p={[0, 1.7, 0]} s={[6.5, 2.6, 2.2]} cor="#ffc928" contorno={0.07} />
    <Caixa p={[0, 1.05, 0]} s={[6.6, 0.25, 2.25]} cor={C3.linha} contorno={0} />
    {[-2.4, -1.2, 0, 1.2].map((x) => <Caixa key={x} p={[x, 2.3, 1.12]} s={[0.95, 0.8, 0.05]} cor={C3.janela} contorno={0.03} />)}
    <Caixa p={[3.27, 2.2, 0]} s={[0.05, 1.0, 1.8]} cor={C3.janela} contorno={0.03} />
    {[-2.2, 2.2].map((x) => [-1.1, 1.1].map((zz) => (
      <group key={`${x}${zz}`} position={[x, 0.5, zz]} rotation={[0, 0, -rodas]}>
        <Caixa s={[0.9, 0.9, 0.3]} cor="#222" contorno={0.03} />
        <Caixa s={[0.3, 0.3, 0.32]} cor="#aaa" contorno={0} />
      </group>
    )))}
  </group>
);

/** Guepardo de blocos (frente para +x); `passo` anima as pernas. */
export const Guepardo3D: React.FC<{ pos?: V3; passo?: number; esc?: number }> = ({ pos = [0, 0, 0], passo = 0, esc = 1 }) => (
  <group position={pos} scale={esc}>
    <Caixa p={[0, 1.1, 0]} s={[2.2, 0.7, 0.7]} cor="#f2b632" contorno={0.05} />
    <Caixa p={[1.35, 1.35, 0]} s={[0.7, 0.6, 0.6]} cor="#f2b632" contorno={0.05} />
    <Caixa p={[1.72, 1.3, 0]} s={[0.12, 0.2, 0.3]} cor={C3.linha} contorno={0} />
    {[-0.15, 0.15].map((zz) => <Caixa key={zz} p={[1.55, 1.45, zz]} s={[0.12, 0.12, 0.08]} cor={C3.linha} contorno={0} />)}
    {[-0.7, -0.2, 0.3, 0.8].map((x, i) => <Caixa key={x} p={[x, 1.46, (i % 2 ? 0.2 : -0.2)]} s={[0.16, 0.04, 0.16]} cor={C3.linha} contorno={0} />)}
    {[[-0.8, -0.25], [-0.8, 0.25], [0.8, -0.25], [0.8, 0.25]].map(([x, zz], i) => (
      <group key={i} position={[x, 0.85, zz]} rotation={[0, 0, Math.sin(passo + i * 1.6) * 0.7]}>
        <Caixa p={[0, -0.4, 0]} s={[0.2, 0.8, 0.2]} cor="#f2b632" contorno={0.03} />
      </group>
    ))}
    <group position={[-1.1, 1.3, 0]} rotation={[0, 0, 0.5 + Math.sin(passo) * 0.2]}><Caixa p={[-0.5, 0, 0]} s={[1.0, 0.14, 0.14]} cor="#f2b632" contorno={0.03} /></group>
  </group>
);

/** Carro de corrida vermelho (frente para +x). */
export const CarroCorrida3D: React.FC<{ pos?: V3; rodas?: number }> = ({ pos = [0, 0, 0], rodas = 0 }) => (
  <group position={pos}>
    <Caixa p={[0, 0.55, 0]} s={[4.2, 0.5, 1.2]} cor="#e0283c" contorno={0.05} />
    <Caixa p={[-0.2, 0.95, 0]} s={[1.2, 0.4, 0.8]} cor="#e0283c" contorno={0.05} />
    <Caixa p={[0.2, 1.05, 0]} s={[0.5, 0.3, 0.6]} cor={C3.linha} contorno={0.02} />
    <Caixa p={[2.2, 0.35, 0]} s={[0.4, 0.1, 2.0]} cor="#e0283c" contorno={0.03} />
    <Caixa p={[-2.0, 1.2, 0]} s={[0.5, 0.1, 1.8]} cor="#e0283c" contorno={0.03} />
    <Caixa p={[-2.0, 0.85, 0]} s={[0.1, 0.6, 0.1]} cor={C3.linha} contorno={0} />
    <Caixa p={[0.6, 0.6, 0.61]} s={[0.7, 0.3, 0.02]} cor="#ffffff" contorno={0} />
    {[-1.4, 1.4].map((x) => [-0.8, 0.8].map((zz) => (
      <group key={`${x}${zz}`} position={[x, 0.42, zz]} rotation={[0, 0, -rodas]}>
        <Caixa s={[0.84, 0.84, 0.45]} cor="#222" contorno={0.03} />
      </group>
    )))}
  </group>
);

/** Avião de passageiros branco (frente para +x). */
export const Aviao3D: React.FC<{ pos?: V3; esc?: number }> = ({ pos = [0, 0, 0], esc = 1 }) => (
  <group position={pos} scale={esc}>
    <Caixa s={[8, 1.3, 1.3]} cor="#f4f6fa" contorno={0.07} />
    <Caixa p={[4.3, -0.1, 0]} s={[0.8, 1.0, 1.0]} cor="#f4f6fa" contorno={0.06} />
    <Caixa p={[0.3, -0.2, 0]} s={[1.8, 0.16, 9]} cor="#dfe4ec" contorno={0.06} />
    <Caixa p={[-3.6, 1.2, 0]} s={[1.2, 1.6, 0.16]} cor="#3f8cff" contorno={0.05} />
    <Caixa p={[-3.6, 0.1, 0]} s={[0.9, 0.12, 3.2]} cor="#dfe4ec" contorno={0.04} />
    {[-2, -1, 0, 1, 2, 3].map((x) => <Caixa key={x} p={[x, 0.2, 0.66]} s={[0.3, 0.3, 0.02]} cor={C3.janela} contorno={0} />)}
    {[-2.4, 2.4].map((zz) => <Caixa key={zz} p={[0.6, -0.65, zz]} s={[1.2, 0.5, 0.5]} cor="#aab3c0" contorno={0.04} />)}
  </group>
);

/** Estrelas fixas numa esfera grande. */
export const Estrelas3D: React.FC<{ n?: number }> = ({ n = 260 }) => {
  const pos = useMemo(() => Array.from({ length: n }).map((_, i) => {
    const u = ((i * 7919) % 1000) / 1000, v = ((i * 104729) % 1000) / 1000;
    const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1);
    return [Math.sin(ph) * Math.cos(th) * 90, Math.cos(ph) * 90, Math.sin(ph) * Math.sin(th) * 90] as V3;
  }), [n]);
  return (
    <group>
      {pos.map((p, i) => (
        <mesh key={i} position={p}><boxGeometry args={[0.35 + (i % 3) * 0.15, 0.35 + (i % 3) * 0.15, 0.35]} /><meshBasicMaterial color={i % 7 === 0 ? "#ffe9a8" : "#ffffff"} /></mesh>
      ))}
    </group>
  );
};

/** Terra de blocos: oceano azul com continentes verdes; `giro` em rad. */
export const Terra3D: React.FC<{ pos?: V3; raio?: number; giro?: number; brasil?: boolean }> = ({ pos = [0, 0, 0], raio = 3, giro = 0, brasil = false }) => {
  const blocos = useMemo(() => Array.from({ length: 70 }).map((_, i) => {
    const u = ((i * 7919) % 997) / 997, v = ((i * 6007) % 991) / 991;
    const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1);
    return { th, ph, s: 0.14 + ((i * 13) % 5) * 0.04 };
  }).filter((b) => Math.sin(b.th * 2) + Math.cos(b.ph * 3) > 0.2), []);
  return (
    <group position={pos} rotation={[0.3, giro, 0]}>
      <mesh><sphereGeometry args={[raio, 32, 24]} /><meshToonMaterial color="#2f7de1" /></mesh>
      <mesh scale={1.03}><sphereGeometry args={[raio, 32, 24]} /><meshBasicMaterial color={C3.linha} side={THREE.BackSide} /></mesh>
      {blocos.map((b, i) => {
        const r = raio * 1.0;
        const p: V3 = [Math.sin(b.ph) * Math.cos(b.th) * r, Math.cos(b.ph) * r, Math.sin(b.ph) * Math.sin(b.th) * r];
        return <Caixa key={i} p={p} s={[raio * b.s, raio * b.s, raio * b.s]} rot={[b.ph, b.th, 0]} cor={C3.folha} contorno={0.02} sombra={false} />;
      })}
      {brasil && <Caixa p={[raio * 0.35, -raio * 0.25, raio * 0.92]} s={[raio * 0.42, raio * 0.5, raio * 0.2]} cor="#2fbf4a" contorno={0.03} brilho="#ffd23f" forca={0.25} />}
    </group>
  );
};

/** Lua cinza com crateras. */
export const Lua3D: React.FC<{ pos?: V3; raio?: number }> = ({ pos = [0, 0, 0], raio = 5 }) => (
  <group position={pos}>
    <mesh><sphereGeometry args={[raio, 32, 24]} /><meshToonMaterial color="#c9ccd4" /></mesh>
    <mesh scale={1.02}><sphereGeometry args={[raio, 32, 24]} /><meshBasicMaterial color={C3.linha} side={THREE.BackSide} /></mesh>
    {[[0.3, 0.9, 0.3], [-0.5, 0.8, 0.2], [0.6, 0.6, -0.5], [-0.2, 0.7, -0.7], [0.1, 0.95, -0.2]].map(([x, y, z], i) => {
      const n = Math.hypot(x, y, z);
      return <Caixa key={i} p={[(x / n) * raio, (y / n) * raio, (z / n) * raio]} s={[0.9 + i * 0.15, 0.12, 0.9 + i * 0.15]} rot={[Math.atan2(z, y), 0, -Math.atan2(x, y)]} cor="#9da1ab" contorno={0.03} />;
    })}
  </group>
);

/** Riscos de estrelas vindo na direção +z (efeito "mais rápido que a luz"). */
export const Riscos3D: React.FC<{ t: number; vel?: number; n?: number }> = ({ t, vel = 40, n = 90 }) => (
  <group>
    {Array.from({ length: n }).map((_, i) => {
      const a = i * 2.39, r = 2 + ((i * 37) % 60) / 6;
      const z = -80 + mod(i * 7.3 + t * vel, 90);
      return (
        <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, z]}>
          <boxGeometry args={[0.08, 0.08, 4 + (i % 4) * 2]} />
          <meshBasicMaterial color={i % 5 === 0 ? "#bfe9ff" : "#ffffff"} />
        </mesh>
      );
    })}
  </group>
);

/** Cone de vapor da barreira do som, aberto para trás (−x). */
export const ConeSom3D: React.FC<{ pos?: V3; forca: number; t: number }> = ({ pos = [0, 0, 0], forca, t }) => {
  if (forca <= 0) return null;
  return (
    <group position={pos} rotation={[0, 0, Math.PI / 2]}>
      <mesh position={[0, 1.2, 0]} scale={[1 + Math.sin(t * 30) * 0.03, 1, 1]}>
        <coneGeometry args={[2.0, 3.2, 28, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.45 * forca} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Anel de choque que cresce a partir de `t0` (plano YZ, perpendicular a x). */
export const Anel3D: React.FC<{ t: number; t0: number; pos?: V3; dur?: number; cor?: string }> = ({ t, t0, pos = [0, 0, 0], dur = 0.6, cor = "#ffffff" }) => {
  const d = t - t0;
  if (d < 0 || d > dur) return null;
  const s = 0.5 + (d / dur) * 6;
  return (
    <mesh position={pos} rotation={[0, Math.PI / 2, 0]} scale={s}>
      <torusGeometry args={[1, 0.08, 8, 40]} />
      <meshBasicMaterial color={cor} transparent opacity={1 - d / dur} />
    </mesh>
  );
};

/** Rastro de velocidade: caixas esticadas atrás de um ponto (direção −x). */
export const Rastro3D: React.FC<{ pos: V3; comp?: number; cor?: string; op?: number }> = ({ pos, comp = 6, cor = "#bfe9ff", op = 0.6 }) => (
  <group position={pos}>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[-comp / 2 - 0.3, 0.6 + i * 0.9, 0]}>
        <boxGeometry args={[comp * (1 - i * 0.2), 0.35 - i * 0.05, 0.35]} />
        <meshBasicMaterial color={cor} transparent opacity={op * (1 - i * 0.25)} depthWrite={false} />
      </mesh>
    ))}
  </group>
);

/** Cacos de vidro voando (azul-claro). */
export const Cacos3D: React.FC<{ t: number; t0: number; pos: V3 }> = ({ t, t0, pos }) => {
  const d = t - t0;
  if (d < 0 || d > 0.9) return null;
  return (
    <group position={pos}>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = i * 2.39;
        return (
          <mesh key={i} position={[Math.cos(a) * d * 2.2, Math.sin(a * 1.3) * d * 1.5 - d * d * 4, 0.5 + d * 3]} rotation={[d * 9 + i, d * 7, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.04]} />
            <meshBasicMaterial color="#bfe9ff" transparent opacity={0.9} />
          </mesh>
        );
      })}
    </group>
  );
};
