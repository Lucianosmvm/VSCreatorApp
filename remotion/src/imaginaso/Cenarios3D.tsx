import React, { useMemo } from "react";
import * as THREE from "three";
import { C3, Caixa } from "./Bloco3D";

// Cenários e veículos extras do Imagina Só (#04 em diante): rua que corre, veículos,
// céu com nuvens, Terra, Lua, estrelas e efeitos de velocidade. Tudo genérico, sem marcas.
type V3 = [number, number, number];
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Escola sem marcas, com terreno que permanece depois do desaparecimento. */
export const Escola3D:React.FC<{pos?:V3;sumindo?:number}>=({pos=[0,0,0],sumindo=0})=><group position={pos}>
 <Caixa p={[0,.02,0]} s={[7.2,.04,3.6]} cor="#c8c3b8" contorno={0}/>
 {sumindo<.995&&<group scale={[1,Math.max(.001,1-sumindo),1]}>
  <Caixa p={[0,1.7,0]} s={[6.4,3.4,2.5]} cor="#ffe090" contorno={.06}/><Caixa p={[0,3.6,0]} s={[6.8,.4,2.8]} cor="#3f8cff" contorno={.06}/>
  <Caixa p={[0,1.2,1.28]} s={[1.1,2.4,.1]} cor="#6a9fc2" contorno={.035}/>
  {[-2.2,-1.1,1.1,2.2].map(x=><Caixa key={x} p={[x,2.15,1.28]} s={[.65,.85,.07]} cor="#a4e6ff" contorno={.03}/>)}
  <Caixa p={[0,3.05,1.3]} s={[2.5,.5,.08]} cor="#eaf7ff" contorno={.03}/>
  <Caixa p={[0,3.08,1.36]} s={[.3,.3,.035]} rot={[0,0,Math.PI/4]} cor="#3f8cff" contorno={0}/>
 </group>}
</group>;

/** Piscina rasa de brinquedo: borda da frente cede e a água escoa. */
export const Piscina3D:React.FC<{pos?:V3;rompimento?:number;agua?:number}>=({pos=[0,0,0],rompimento=0,agua=1})=><group position={pos}>
 <Caixa p={[0,.08,0]} s={[4.8,.16,3.4]} cor="#badfeb" contorno={.04}/>
 <Caixa p={[0,.48,0]} s={[4.4,.05,2.9]} cor="#57cfea" contorno={0} opacidade={1-rompimento*.6}/>
 <Caixa p={[0,.48,-1.65]} s={[4.8,.8,.18]} cor="#e6f8ff" contorno={.04}/>
 {[-1,1].map(l=><React.Fragment key={l}><Caixa p={[l*2.33,.48,0]} s={[.18,.8,3.4]} cor="#e6f8ff" contorno={.04}/><group position={[l*1.2,.1+(.38*(1-rompimento)),1.65+rompimento*.6]} rotation={[rompimento*1.25,0,l*rompimento*.15]}><Caixa s={[2.35,.8,.18]} cor="#e6f8ff" contorno={.04}/></group></React.Fragment>)}
 {rompimento>0&&agua>0&&<Caixa p={[0,.04,2.2+rompimento]} s={[(3.5+rompimento*2)*agua,.045,(1.4+rompimento*2)*agua]} cor="#6fdaf1" contorno={0} opacidade={.8}/>}
</group>;

/** Onda curta e respingos determinísticos; viaja para +z. */
export const Onda3D:React.FC<{pos?:V3;t:number;forca?:number}>=({pos=[0,0,0],t,forca=1})=><group position={pos}>
 <Caixa p={[0,.18,0]} s={[3.4,.35*forca,1.1]} cor="#67d9f4" contorno={.025} opacidade={.85}/>
 {Array.from({length:12},(_,i)=><Caixa key={i} p={[(i%5-2)*.55,.4+Math.abs(Math.sin(t*8+i*2))*.8*forca,(Math.sin(i*3+t*5))*.7]} s={[.13,.16,.13]} cor={i%2?'#ffffff':'#9decff'} contorno={0}/>)}
</group>;

/** Tiranossauro de blocos original. Pés em y=0; rosto para +z. */
export const Dinossauro3D:React.FC<{t:number;pos?:V3;esc?:number;rotY?:number;andando?:number;boca?:number;pisao?:number}>=({t,pos=[0,0,0],esc=1,rotY=0,andando=0,boca=.15,pisao=0})=><group position={pos} rotation={[0,rotY,0]} scale={esc}>
 <Caixa p={[0,2.35,0]} s={[1.8,2,2.3]} cor="#5aa65b" contorno={.06}/><Caixa p={[0,2.2,1.17]} s={[1.25,1.6,.08]} cor="#b8cf79" contorno={.03}/>
 <Caixa p={[0,3.6,.7]} s={[1.2,1.15,1.2]} cor="#5aa65b" contorno={.05}/>
 <Caixa p={[0,4.5,1.3]} s={[1.6,1,1.8]} cor="#5aa65b" contorno={.06}/>
 <Caixa p={[0,4.25,2.25]} s={[1.4,.32,.55]} cor="#4c8a51" contorno={.04}/>
 <group position={[0,4.1,1.6]} rotation={[boca*.65,0,0]}><Caixa p={[0,-.12,.35]} s={[1.45,.25,1.6]} cor="#58874b" contorno={.04}/><Caixa p={[0,.03,.5]} s={[1.2,.07,1.2]} cor="#b86c76" contorno={0}/></group>
 {[-1,1].map(l=><React.Fragment key={l}>
  <Caixa p={[l*.58,4.66,2.22]} s={[.38,.3,.08]} cor="#fff6cf" contorno={.025}/><Caixa p={[l*.58,4.65,2.27]} s={[.12,.2,.04]} cor={C3.linha} contorno={0}/>
  <Caixa p={[l*.78,4.7,1.65]} s={[.04,.3,.32]} cor="#fff6cf" contorno={.02}/>
  <group position={[l*.65,1.4,-.1]} rotation={[Math.sin(t*7+l)*andando*.4-(l===1?pisao*.8:0),0,0]}><Caixa p={[0,-.56,0]} s={[.62,1.3,.75]} cor="#3d7d49" contorno={.04}/><Caixa p={[0,-1.25,.3]} s={[.7,.25,1.3]} cor="#4c8a51" contorno={.04}/></group>
  <Caixa p={[l*1.02,2.9,1]} s={[.3,.65,.3]} rot={[-.8,0,l*.2]} cor="#4c8a51" contorno={.03}/>
  {[0,1,2].map(i=><Caixa key={i} p={[l*(.28+i*.22),4.02,2.25]} s={[.13,.2,.14]} cor="#fff6cf" contorno={.015}/>)}
 </React.Fragment>)}
 <group position={[0,2,-1.3]} rotation={[.25,Math.sin(t*3)*.12,0]}><Caixa p={[0,0,-.6]} s={[1.05,.85,1.5]} cor="#4c8a51"/><Caixa p={[0,-.1,-1.6]} s={[.6,.5,1.0]} cor="#4c8a51" contorno={.035}/></group>
</group>;

/** Rua ao longo de x que "anda" com `desloc` (o personagem fica parado e o mundo passa).
 *  `quebrado` troca os vidros das janelas por buracos escuros. */
export const Rua3D: React.FC<{ desloc: number; quebrado?: boolean; casas?:boolean }> = ({ desloc, quebrado = false, casas=true }) => {
  const CORES = ["#ffd9a6", "#bde4ff", "#ffc2d6", "#d4f5c4", "#fff1a8"];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[400, 200]} /><meshToonMaterial color={C3.grama} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow><planeGeometry args={[400, 4.4]} /><meshToonMaterial color="#5b5f6b" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3.2]} receiveShadow><planeGeometry args={[400, 2]} /><meshToonMaterial color="#d9d3c6" /></mesh>
      {Array.from({ length: 30 }).map((_, i) => (
        <Caixa key={i} p={[-45 + i * 3 - mod(desloc, 3), 0.03, 0]} s={[1.4, 0.02, 0.18]} cor="#ffffff" contorno={0} sombra={false} />
      ))}
      {casas&&Array.from({ length: 12 }).map((_, i) => {
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

/** Carro de família em blocos (frente para +x), com vidros transparentes para ver quem está dentro.
 *  Banco do motorista em x≈0.75, z=-0.5; banco de trás em x≈-1.0. `janela` 0..1 sobe o vidro do lado +z. */
export const CarroFamilia3D: React.FC<{ pos?: V3; rotY?: number; rodas?: number; janela?: number; cor?: string; luz?: boolean }> = ({ pos = [0, 0, 0], rotY = 0, rodas = 0, janela = 0, cor = "#2bb3a3", luz = false }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Caixa p={[0, 0.95, 0]} s={[5.0, 1.0, 2.4]} cor={cor} contorno={0.07} />
    <Caixa p={[2.2, 1.5, 0]} s={[0.7, 0.14, 2.3]} cor={cor} contorno={0.04} />
    <Caixa p={[-2.3, 1.55, 0]} s={[0.5, 0.2, 2.3]} cor={cor} contorno={0.04} />
    {[[1.6, -1.12], [1.6, 1.12], [-1.9, -1.12], [-1.9, 1.12]].map(([x, z], i) => <Caixa key={i} p={[x, 2.4, z]} s={[0.16, 1.8, 0.16]} cor={cor} contorno={0.03} />)}
    <Caixa p={[-0.15, 3.35, 0]} s={[3.8, 0.2, 2.42]} cor={cor} contorno={0.06} />
    <Caixa p={[1.62, 2.4, 0]} s={[0.04, 1.7, 2.1]} cor="#bfe9ff" contorno={0} opacidade={0.18} sombra={false} />
    {janela > 0.02 && <Caixa p={[-0.15, 1.45 + 0.85 * janela, 1.17]} s={[3.3, 1.7 * janela, 0.04]} cor="#bfe9ff" contorno={0} opacidade={0.3} sombra={false} />}
    <Caixa p={[0.15, 1.7, -0.5]} s={[0.25, 1.4, 0.9]} cor="#3a3f4b" contorno={0.03} />
    <Caixa p={[-1.55, 1.7, 0]} s={[0.25, 1.4, 2.1]} cor="#3a3f4b" contorno={0.03} />
    <mesh position={[1.4, 1.62, -0.5]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.26, 0.06, 8, 20]} /><meshBasicMaterial color={C3.linha} /></mesh>
    {[-0.75, 0.75].map((z) => <Caixa key={z} p={[2.52, 1.15, z]} s={[0.06, 0.3, 0.45]} cor="#fff6c2" contorno={0.02} brilho={luz ? "#fff6c2" : undefined} forca={0.8} />)}
    {[-0.8, 0.8].map((z) => <Caixa key={z} p={[-2.52, 1.15, z]} s={[0.06, 0.25, 0.4]} cor={C3.vermelho} contorno={0.02} />)}
    <Caixa p={[2.55, 0.6, 0]} s={[0.15, 0.25, 2.3]} cor="#9aa5b1" contorno={0.03} />
    <Caixa p={[-2.55, 0.6, 0]} s={[0.15, 0.25, 2.3]} cor="#9aa5b1" contorno={0.03} />
    {[1.6, -1.7].map((x) => [-1.2, 1.2].map((z) => (
      <group key={`${x}${z}`} position={[x, 0.45, z]} rotation={[0, 0, -rodas]}>
        <Caixa s={[0.9, 0.9, 0.36]} cor="#222" contorno={0.03} />
        <Caixa s={[0.34, 0.34, 0.38]} cor="#aab3c0" contorno={0} />
      </group>
    )))}
  </group>
);

/** Fachada de mercado (frente para +z): toldo listrado, vitrines com prateleiras e porta. */
export const Mercado3D: React.FC<{ pos?: V3 }> = ({ pos = [0, 0, 0] }) => (
  <group position={pos}>
    <Caixa p={[0, 2.3, 0]} s={[9, 4.6, 1.2]} cor="#fff1d6" contorno={0.07} />
    <Caixa p={[0, 4.9, 0.1]} s={[9.4, 0.7, 1.4]} cor={C3.amarelo} contorno={0.06} />
    {Array.from({ length: 9 }).map((_, i) => (
      <Caixa key={i} p={[-4 + i, 3.85, 1.0]} s={[1, 0.25, 1.1]} rot={[0.35, 0, 0]} cor={i % 2 ? "#ffffff" : C3.vermelho} contorno={0.02} />
    ))}
    <Caixa p={[0, 1.5, 0.62]} s={[1.6, 3.0, 0.1]} cor="#bfe9ff" contorno={0.05} opacidade={0.6} />
    {[-2.9, 2.9].map((x) => (
      <group key={x} position={[x, 2.0, 0.62]}>
        <Caixa s={[2.6, 2.4, 0.08]} cor="#bfe9ff" contorno={0.05} opacidade={0.5} />
        {[-0.6, 0.2].map((y, j) => (
          <group key={y}>
            <Caixa p={[0, y, -0.2]} s={[2.4, 0.08, 0.3]} cor="#8a5a3c" contorno={0} />
            {[-0.9, -0.45, 0, 0.45, 0.9].map((px, k) => <Caixa key={px} p={[px, y + 0.22, -0.2]} s={[0.3, 0.36, 0.22]} cor={["#e0364f", "#5ad35a", "#3f8cff", "#ffd23f", "#ff8a3d"][(k + j) % 5]} contorno={0.015} />)}
          </group>
        ))}
      </group>
    ))}
    {[-1, 1].map((l) => <Caixa key={l} p={[l * 4.2, 0.6, 2.0]} s={[0.6, 1.2, 1.0]} cor="#9aa5b1" contorno={0.03} />)}
  </group>
);

/** Dinossauro de pescoço comprido (frente para +x), costas planas para levar passageiros (topo ≈ y 3.4). */
export const PescocoLongo3D: React.FC<{ t: number; pos?: V3; esc?: number; rotY?: number; andando?: number }> = ({ t, pos = [0, 0, 0], esc = 1, rotY = 0, andando = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={esc}>
    <Caixa p={[0, 2.6, 0]} s={[4.6, 1.6, 2.2]} cor="#8fb0d8" contorno={0.07} />
    <Caixa p={[0, 3.45, 0]} s={[4.2, 0.12, 2.0]} cor="#e8d9b0" contorno={0.03} />
    {[[1.6, -0.8], [1.6, 0.8], [-1.6, -0.8], [-1.6, 0.8]].map(([x, z], i) => (
      <group key={i} position={[x, 1.9, z]} rotation={[0, 0, Math.sin(t * 5 + i * 1.6) * 0.25 * andando]}>
        <Caixa p={[0, -0.95, 0]} s={[0.6, 1.9, 0.6]} cor="#7a9cc4" contorno={0.04} />
      </group>
    ))}
    <group position={[2.2, 3.1, 0]} rotation={[0, 0, -0.75 + Math.sin(t * 1.5) * 0.05]}>
      <Caixa p={[0, 2.2, 0]} s={[0.6, 4.4, 0.6]} cor="#8fb0d8" contorno={0.05} />
      <group position={[0, 4.5, 0]} rotation={[0, 0, 0.75]}>
        <Caixa p={[0.35, 0, 0]} s={[1.1, 0.6, 0.65]} cor="#8fb0d8" contorno={0.04} />
        {[-1, 1].map((l) => <Caixa key={l} p={[0.55, 0.15, l * 0.33]} s={[0.12, 0.14, 0.03]} cor={C3.linha} contorno={0} />)}
        <Caixa p={[0.85, -0.12, 0]} s={[0.25, 0.05, 0.4]} cor="#5a7aa4" contorno={0} />
      </group>
    </group>
    <group position={[-2.3, 2.5, 0]} rotation={[0, Math.sin(t * 2) * 0.2, 0.3]}>
      <Caixa p={[-1.4, 0, 0]} s={[2.8, 0.5, 0.5]} cor="#8fb0d8" contorno={0.04} />
    </group>
  </group>
);

/** Velociraptor pequeno (frente para +z), rabo que abana; `boca` abre. */
export const Raptor3D: React.FC<{ t: number; pos?: V3; esc?: number; rotY?: number; boca?: number; pulando?: number }> = ({ t, pos = [0, 0, 0], esc = 1, rotY = 0, boca = 0, pulando = 0 }) => (
  <group position={[pos[0], pos[1] + Math.abs(Math.sin(t * 10)) * 0.3 * pulando, pos[2]]} rotation={[0, rotY, 0]} scale={esc}>
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 0.25, 0.9, 0]} rotation={[Math.sin(t * 12 + l) * 0.4 * pulando, 0, 0]}>
        <Caixa p={[0, -0.45, 0]} s={[0.22, 0.9, 0.3]} cor="#c98a3a" contorno={0.03} />
        <Caixa p={[0, -0.88, 0.18]} s={[0.24, 0.1, 0.45]} cor="#a86a2a" contorno={0.02} />
        <Caixa p={[0, -0.75, 0.42]} s={[0.06, 0.22, 0.06]} rot={[0.6, 0, 0]} cor="#fff6cf" contorno={0.01} />
      </group>
    ))}
    <Caixa p={[0, 1.2, 0]} s={[0.8, 0.7, 1.2]} cor="#d9984a" contorno={0.04} />
    {[0, 1, 2].map((i) => <Caixa key={i} p={[0, 1.6, -0.3 + i * 0.3]} s={[0.12, 0.2, 0.12]} cor="#7a4a2a" contorno={0} />)}
    <group position={[0, 1.6, 0.6]}>
      <Caixa p={[0, 0.2, 0.25]} s={[0.55, 0.45, 0.7]} cor="#d9984a" contorno={0.035} />
      <group position={[0, 0.05, 0.4]} rotation={[boca * 0.6, 0, 0]}><Caixa p={[0, -0.06, 0.22]} s={[0.5, 0.12, 0.5]} cor="#c98a3a" contorno={0.02} /></group>
      {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.2, 0.32, 0.52]} s={[0.1, 0.1, 0.03]} cor={C3.linha} contorno={0} sombra={false} />)}
    </group>
    {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.42, 1.25, 0.45]} s={[0.12, 0.35, 0.12]} rot={[-0.8, 0, 0]} cor="#c98a3a" contorno={0.02} />)}
    <group position={[0, 1.25, -0.6]} rotation={[0.2, Math.sin(t * 16) * 0.5, 0]}><Caixa p={[0, 0, -0.6]} s={[0.25, 0.25, 1.2]} cor="#d9984a" contorno={0.025} /></group>
  </group>
);

/** Pterodátilo (frente para +z), asas batendo. */
export const Pterodatilo3D: React.FC<{ t: number; pos?: V3; esc?: number; rotY?: number }> = ({ t, pos = [0, 0, 0], esc = 1, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={esc}>
    <Caixa s={[0.45, 0.4, 1.0]} cor="#b5736a" contorno={0.03} />
    <group position={[0, 0.25, 0.55]}>
      <Caixa s={[0.35, 0.35, 0.4]} cor="#b5736a" contorno={0.03} />
      <Caixa p={[0, -0.05, 0.45]} s={[0.12, 0.1, 0.6]} cor="#e0c070" contorno={0.02} />
      <Caixa p={[0, 0.2, -0.3]} s={[0.08, 0.12, 0.5]} rot={[-0.5, 0, 0]} cor="#b5736a" contorno={0.02} />
      {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.16, 0.06, 0.1]} s={[0.04, 0.08, 0.08]} cor={C3.linha} contorno={0} sombra={false} />)}
    </group>
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 0.22, 0.1, 0]} rotation={[0, 0, l * Math.sin(t * 9) * 0.6]}>
        <Caixa p={[l * 0.9, 0, 0]} s={[1.8, 0.05, 0.8]} cor="#d08a7a" contorno={0.025} />
      </group>
    ))}
  </group>
);

/** Asteroide de blocos com rastro de fogo (indo para +x). */
export const Asteroide3D: React.FC<{ t: number; pos?: V3; esc?: number }> = ({ t, pos = [0, 0, 0], esc = 1 }) => (
  <group position={pos} scale={esc}>
    <group rotation={[t * 2, t * 3, 0]}>
      <Caixa s={[1.6, 1.4, 1.5]} cor="#6b5a4a" contorno={0.06} />
      <Caixa p={[0.5, 0.5, 0.4]} s={[0.7, 0.6, 0.7]} cor="#7d6a58" contorno={0.04} />
      <Caixa p={[-0.5, -0.4, 0.5]} s={[0.5, 0.5, 0.5]} cor="#594a3c" contorno={0.03} />
    </group>
    {[0, 1, 2, 3, 4].map((i) => {
      const s = 1.3 - i * 0.2;
      return (
        <mesh key={i} position={[-1.1 - i * 0.7, Math.sin(t * 20 + i) * 0.1, 0]}>
          <boxGeometry args={[s, s, s]} />
          <meshBasicMaterial color={["#fff2a0", "#ffd000", "#ffb000", "#ff7a1a", "#e0402a"][i]} transparent opacity={0.9 - i * 0.12} />
        </mesh>
      );
    })}
  </group>
);
