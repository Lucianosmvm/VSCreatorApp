import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

// Kit 3D "Bloco" do Imagina Só: bonecos de cubo com contorno grosso (casco invertido),
// sombreamento toon em 3 degraus e cenário de pátio. Unidades: 1 = ~meio boneco.

export const C3 = {
  linha: "#1b1530", pele: "#ffcf9f", rosa: "#ff5fa2", rosaEsc: "#c2185b", azul: "#3f8cff", azulEsc: "#24408f",
  bone: "#2f6fe0", cabelo: "#6b3f22", amarelo: "#ffd23f", vermelho: "#ff4d5e", grama: "#8fd16a",
  parede: "#ffd9a6", telhado: "#ff8a3d", janela: "#8fd3ff", porta: "#8a5a3c", folha: "#4caf50", tronco: "#7a4a2a",
};

const degrau = (() => {
  const d = new Uint8Array([110, 185, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

type V3 = [number, number, number];

/** Caixa toon com contorno preto. `contorno` em unidades de mundo (0 = sem). */
export const Caixa: React.FC<{
  p?: V3; s: V3; cor: string; rot?: V3; contorno?: number; brilho?: string; forca?: number; sombra?: boolean; opacidade?: number;
}> = ({ p = [0, 0, 0], s, cor, rot = [0, 0, 0], contorno = 0.045, brilho, forca = 1, sombra = true, opacidade = 1 }) => (
  <group position={p} rotation={rot}>
    <mesh castShadow={sombra} receiveShadow={sombra}>
      <boxGeometry args={s} />
      <meshToonMaterial color={cor} gradientMap={degrau} emissive={brilho ?? "#000000"} emissiveIntensity={brilho ? forca : 0}
        transparent={opacidade < 1} opacity={opacidade} />
    </mesh>
    {contorno > 0 && (
      <mesh>
        <boxGeometry args={[s[0] + 2 * contorno, s[1] + 2 * contorno, s[2] + 2 * contorno]} />
        <meshBasicMaterial color={C3.linha} side={THREE.BackSide} transparent={opacidade < 1} opacity={opacidade} />
      </mesh>
    )}
  </group>
);

/** Câmera controlada pelo quadro: posição, alvo, fov e inclinação (roll). */
export const Camera: React.FC<{ pos: V3; alvo: V3; fov?: number; roll?: number }> = ({ pos, alvo, fov = 50, roll = 0 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(...alvo);
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

export type Expr = "feliz" | "brava" | "medo" | "sono";

/** Boneco de bloco. Pés em y=0, cabeça até ~y=3.
 *  pai: cabelo curto, bigode e barriga; `social` = camisa social, gravata, bermuda e meia; `avental` de churrasco.
 *  camisaCor/calcaCor/boneCor trocam as cores (figurantes). */
export const Boneco3D: React.FC<{
  tipo: "mae" | "filho" | "pai" | "avo"; pos?: V3; rotY?: number; esc?: number; expr?: Expr;
  social?: boolean; avental?: boolean; camisaCor?: string; calcaCor?: string; boneCor?: string; trico?: boolean;
  bracoE?: [number, number]; bracoD?: [number, number]; // [rotX, rotZ]
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; // [inclina, gira]
  olhosBrilho?: number; segura?: React.ReactNode; seguraE?: React.ReactNode;
  gelo?: boolean; pele?: string; boca?: number; // boca: 0 fechada .. 1 aberta (fala)
  coroa?: boolean; casaco?: boolean; disfarce?: boolean;
}> = ({ tipo, pos = [0, 0, 0], rotY = 0, esc = 1, expr = "feliz", bracoE = [0, -0.12], bracoD = [0, 0.12], pernaE = 0, pernaD = 0,
  cabeca = [0, 0], olhosBrilho = 0, segura, seguraE, gelo = false, pele: peleCor, boca = 0, coroa = false, casaco = false, disfarce = false,
  social = false, avental = false, camisaCor, calcaCor, boneCor, trico = false }) => {
  const avo = tipo === "avo";
  const mae = tipo === "mae";
  const pai = tipo === "pai";
  const fem = mae || avo;
  const G = (c: string) => (gelo ? "#bfe9ff" : c);
  const camisa = G(camisaCor ?? (trico ? "#ff9f43" : casaco ? "#c9a46b" : social ? "#f4f4f4" : mae ? C3.rosa : avo ? "#9b6fc6" : pai ? "#3a9d5d" : C3.azul));
  const calca = G(calcaCor ?? (mae ? C3.rosaEsc : avo ? "#6d4c9f" : pai ? "#3b5a8f" : C3.azulEsc));
  const pele = G(peleCor ?? C3.pele);
  const cabelo = G(C3.cabelo);
  const bone = G(boneCor ?? C3.bone);
  const ombro = pai ? 0.9 : 0.8;
  const olho = olhosBrilho > 0 ? "#ff2030" : C3.linha;
  const z = 0.51;
  const sobr = expr === "brava" ? 0.38 : expr === "medo" ? -0.3 : 0;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={esc}>
      {/* pernas */}
      {([[-0.28, pernaE], [0.28, pernaD]] as const).map(([x, r]) => (
        <group key={x} position={[x, 0.9, 0]} rotation={[r, 0, 0]}>
          {social ? (
            <group>
              <Caixa p={[0, -0.22, 0]} s={[0.5, 0.46, 0.54]} cor="#d8c3a0" />
              <Caixa p={[0, -0.58, 0]} s={[0.4, 0.3, 0.44]} cor={pele} />
              <Caixa p={[0, -0.82, 0]} s={[0.42, 0.18, 0.46]} cor="#ffffff" />
              <Caixa p={[0, -0.88, 0.08]} s={[0.46, 0.06, 0.66]} cor={C3.amarelo} contorno={0.02} />
            </group>
          ) : <Caixa p={[0, -0.45, 0]} s={[0.48, 0.9, 0.52]} cor={calca} />}
        </group>
      ))}
      {/* tronco (o pai tem barriga) */}
      <Caixa p={[0, pai ? 1.44 : 1.42, 0]} s={pai ? [1.32, 1.12, 0.82] : [1.12, 1.05, 0.6]} cor={camisa} />
      {social && <Caixa p={[0, 1.6, 0.43]} s={[0.16, 0.6, 0.04]} cor={C3.vermelho} contorno={0.02} />}
      {avental && <Caixa p={[0, 1.3, 0.43]} s={[0.95, 1.0, 0.05]} cor="#e0364f" contorno={0.03} />}
      {mae && <Caixa p={[0, 1.5, 0.31]} s={[0.5, 0.6, 0.04]} cor="#ffffff" contorno={0.02} />}
      {avo && <Caixa p={[0, 1.78, 0]} s={[1.3, 0.42, 0.74]} cor={G("#e7b6d6")} contorno={0.035} />}
      {avo && <Caixa p={[0, 1.5, 0.33]} s={[0.36, 0.4, 0.06]} cor={G("#e7b6d6")} contorno={0.02} rot={[0, 0, Math.PI / 4]} />}
      {trico && ["#ffd23f", "#e0364f", "#5ad35a"].map((c, i) => (
        <Caixa key={c} p={[0, 1.2 + i * 0.25, 0.31]} s={[1.13, 0.1, 0.03]} cor={c} contorno={0} sombra={false} />
      ))}
      {!mae && !pai && !avo && !casaco && !trico && <Caixa p={[0, 1.6, 0.31]} s={[0.22, 0.22, 0.04]} cor={C3.amarelo} contorno={0.02} rot={[0, 0, Math.PI / 4]} />}
      {casaco && (
        <group>
          <Caixa p={[0, 1.98, 0]} s={[1.2, 0.26, 0.72]} cor="#e0364f" contorno={0.035} />
          <Caixa p={[0.3, 1.55, 0.38]} s={[0.24, 0.7, 0.1]} cor="#e0364f" contorno={0.03} />
          {[0, 1, 2].map((i) => <Caixa key={i} p={[0.3, 1.35 + i * 0.2, 0.44]} s={[0.25, 0.05, 0.02]} cor="#ffffff" contorno={0} sombra={false} />)}
          {[1.2, 1.45, 1.7].map((y) => <Caixa key={y} p={[-0.05, y, 0.31]} s={[0.1, 0.1, 0.04]} cor="#7a4a2a" contorno={0.015} />)}
        </group>
      )}
      {/* braços (pivô no ombro) */}
      {([[-ombro, bracoE], [ombro, bracoD]] as const).map(([x, b], i) => (
        <group key={i} position={[x, 1.88, 0]} rotation={[b[0], 0, b[1]]}>
          <Caixa p={[0, -0.42, 0]} s={[0.42, 0.88, 0.44]} cor={camisa} />
          <Caixa p={[0, -0.98, 0]} s={[0.4, 0.26, 0.42]} cor={pele} />
          {i === 1 && segura ? <group position={[0, -1.1, 0.1]}>{segura}</group> : null}
          {i === 0 && seguraE ? <group position={[0, -1.1, 0.1]}>{seguraE}</group> : null}
        </group>
      ))}
      {/* cabeça */}
      <group position={[0, 2.5, 0]} rotation={[cabeca[0], cabeca[1], 0]}>
        <Caixa s={[1.1, 1.0, 1.0]} cor={pele} />
        {/* olhos */}
        {[-1, 1].map((l) => (
          <group key={l}>
            <Caixa p={[l * 0.22, expr === "sono" ? -0.02 : 0.04, z]} s={[expr === "sono" ? 0.2 : 0.14, expr === "medo" ? 0.26 : expr === "sono" ? 0.05 : 0.22, 0.03]}
              cor={olho} contorno={0} brilho={olhosBrilho > 0 ? "#ff1020" : undefined} forca={olhosBrilho * 3} sombra={false} />
            {olhosBrilho === 0 && expr !== "sono" && <Caixa p={[l * 0.22 + 0.03, 0.1, z + 0.02]} s={[0.05, 0.06, 0.02]} cor="#ffffff" contorno={0} sombra={false} />}
            <Caixa p={[l * 0.22, expr === "medo" ? 0.3 : 0.25, z]} s={[0.26, 0.06, 0.03]} cor={mae ? cabelo : avo ? "#b5b5b5" : C3.linha} contorno={0}
              rot={[0, 0, l * sobr]} sombra={false} />
            {mae && <Caixa p={[l * 0.33, 0.15, z]} s={[0.07, 0.06, 0.03]} cor={C3.linha} contorno={0} rot={[0, 0, l * 0.5]} sombra={false} />}
            {fem && <Caixa p={[l * 0.36, -0.13, z]} s={[0.18, 0.09, 0.02]} cor="#ff8fb0" contorno={0} sombra={false} />}
            {avo && (
              <group>
                <Caixa p={[l * 0.22, 0.17, z + 0.04]} s={[0.34, 0.05, 0.03]} cor="#7a4a2a" contorno={0} sombra={false} />
                <Caixa p={[l * 0.22, -0.09, z + 0.04]} s={[0.34, 0.05, 0.03]} cor="#7a4a2a" contorno={0} sombra={false} />
                <Caixa p={[l * 0.06, 0.04, z + 0.04]} s={[0.05, 0.3, 0.03]} cor="#7a4a2a" contorno={0} sombra={false} />
                <Caixa p={[l * 0.38, 0.04, z + 0.04]} s={[0.05, 0.3, 0.03]} cor="#7a4a2a" contorno={0} sombra={false} />
              </group>
            )}
          </group>
        ))}
        {/* boca */}
        {boca > 0 && <Caixa p={[0, -0.27, z]} s={[0.26, 0.06 + 0.16 * boca, 0.03]} cor="#5a1020" contorno={0} sombra={false} />}
        {boca === 0 && expr === "feliz" && (
          <group>
            <Caixa p={[0, -0.26, z]} s={[0.36, 0.08, 0.03]} cor={mae ? "#e0364f" : avo ? "#d0607a" : C3.linha} contorno={0} sombra={false} />
            {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.2, -0.2, z]} s={[0.08, 0.1, 0.03]} cor={mae ? "#e0364f" : avo ? "#d0607a" : C3.linha} contorno={0} sombra={false} />)}
          </group>
        )}
        {boca === 0 && expr === "brava" && <Caixa p={[0, -0.27, z]} s={[0.32, 0.07, 0.03]} cor={mae ? "#e0364f" : C3.linha} contorno={0} sombra={false} />}
        {boca === 0 && expr === "medo" && <Caixa p={[0, -0.27, z]} s={[0.22, 0.2, 0.03]} cor="#5a1020" contorno={0} sombra={false} />}
        {boca === 0 && expr === "sono" && <Caixa p={[0, -0.28, z]} s={[0.16, 0.05, 0.03]} cor={C3.linha} contorno={0} sombra={false} />}
        {/* cabelo da mãe / cabelo e bigode do pai / boné do filho */}
        {avo ? (
          <group>
            <Caixa p={[0, 0.56, -0.02]} s={[1.22, 0.22, 1.1]} cor={G("#d9d9d9")} />
            <Caixa p={[0, 0.1, -0.56]} s={[1.22, 0.9, 0.16]} cor={G("#d9d9d9")} />
            {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.63, 0.2, -0.1]} s={[0.16, 0.6, 0.85]} cor={G("#d9d9d9")} />)}
            <Caixa p={[0, 0.85, -0.3]} s={[0.55, 0.45, 0.5]} cor={G("#cfcfcf")} contorno={0.04} />
          </group>
        ) : pai ? (
          <group>
            <Caixa p={[0, 0.55, -0.02]} s={[1.16, 0.2, 1.06]} cor="#3a2414" />
            <Caixa p={[0, 0.15, -0.55]} s={[1.16, 0.6, 0.14]} cor="#3a2414" />
            {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.58, 0.25, -0.1]} s={[0.1, 0.4, 0.7]} cor="#3a2414" />)}
            <Caixa p={[0, -0.14, z + 0.01]} s={[0.46, 0.11, 0.05]} cor="#3a2414" contorno={0.015} />
          </group>
        ) : mae ? (
          <group>
            <Caixa p={[0, 0.56, -0.02]} s={[1.24, 0.24, 1.14]} cor={cabelo} />
            <Caixa p={[0, -0.25, -0.58]} s={[1.24, 1.7, 0.22]} cor={cabelo} />
            {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.66, -0.15, -0.07]} s={[0.2, 1.4, 0.95]} cor={cabelo} />)}
            <Caixa p={[0, 0.41, 0.53]} s={[1.24, 0.2, 0.14]} cor={cabelo} />
          </group>
        ) : (
          <group>
            <Caixa p={[0, 0.62, 0]} s={[1.18, 0.28, 1.08]} cor={bone} />
            <Caixa p={[0, 0.52, 0.72]} s={[1.0, 0.08, 0.52]} cor={bone} />
            <Caixa p={[0, 0.64, 0.55]} s={[0.2, 0.16, 0.03]} cor={C3.amarelo} contorno={0.015} />
          </group>
        )}
        {coroa && (
          <group position={[0, 0.85, 0]}>
            <Caixa s={[1.0, 0.3, 0.9]} cor={C3.amarelo} brilho="#ffb000" forca={0.35} contorno={0.04} />
            {[-0.38, 0, 0.38].map((x) => <Caixa key={x} p={[x, 0.28, 0]} s={[0.2, 0.3, 0.2]} cor={C3.amarelo} brilho="#ffb000" forca={0.35} contorno={0.035} />)}
            <Caixa p={[0, 0.02, 0.46]} s={[0.18, 0.14, 0.03]} cor={C3.vermelho} contorno={0.015} />
          </group>
        )}
        {disfarce && (
          <group>
            {[-1, 1].map((l) => <Caixa key={l} p={[l * 0.24, 0.05, z + 0.04]} s={[0.34, 0.24, 0.05]} cor="#111111" contorno={0.02} />)}
            <Caixa p={[0, 0.1, z + 0.04]} s={[0.16, 0.05, 0.04]} cor="#111111" contorno={0} />
            <Caixa p={[0, -0.14, z + 0.03]} s={[0.4, 0.09, 0.05]} cor="#3a2414" contorno={0.015} />
          </group>
        )}
      </group>
    </group>
  );
};

/** Chinelo lendário: sola dourada e tira vermelha em V. */
export const Chinelo3D: React.FC<{ pos?: V3; rot?: V3; esc?: number; brilho?: number }> = ({ pos = [0, 0, 0], rot = [0, 0, 0], esc = 1, brilho = 0 }) => (
  <group position={pos} rotation={rot} scale={esc}>
    <Caixa s={[0.6, 0.14, 1.35]} cor={C3.amarelo} brilho={brilho > 0 ? "#ffb000" : undefined} forca={brilho} />
    <Caixa p={[-0.15, 0.16, 0.12]} s={[0.1, 0.12, 0.62]} rot={[0, 0.45, 0]} cor={C3.vermelho} contorno={0.03} />
    <Caixa p={[0.15, 0.16, 0.12]} s={[0.1, 0.12, 0.62]} rot={[0, -0.45, 0]} cor={C3.vermelho} contorno={0.03} />
  </group>
);

const xadrez = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    g.fillStyle = (i + j) % 2 ? "#e4d3b6" : "#f4e9d4";
    g.fillRect(i * 64, j * 64, 64, 64);
  }
  g.strokeStyle = "#cbb894";
  g.lineWidth = 3;
  g.strokeRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 5);
  t.magFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Pátio na frente da casa, árvore, nuvens e sol. `t` em segundos. */
export const Mundo3D: React.FC<{ t: number }> = ({ t }) => {
  const piso = useMemo(xadrez, []);
  const nuvem = (x: number, y: number, z: number, k: number) => (
    <group position={[x + t * 0.4 * k, y, z]}>
      <Caixa s={[4, 1.4, 1.5]} cor="#ffffff" contorno={0.08} sombra={false} />
      <Caixa p={[-1.1, 0.7, 0]} s={[1.8, 1.4, 1.4]} cor="#ffffff" contorno={0.08} sombra={false} />
      <Caixa p={[0.9, 0.9, 0]} s={[2.2, 1.6, 1.4]} cor="#ffffff" contorno={0.08} sombra={false} />
    </group>
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshToonMaterial color={C3.grama} gradientMap={degrau} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -1.5]} receiveShadow>
        <planeGeometry args={[14, 11]} />
        <meshToonMaterial map={piso} gradientMap={degrau} />
      </mesh>
      {/* casa */}
      <Caixa p={[0, 3.5, -7.5]} s={[18, 7, 1]} cor={C3.parede} contorno={0.08} />
      <Caixa p={[0, 7.25, -7.3]} s={[18.6, 0.7, 1.6]} cor={C3.telhado} contorno={0.08} />
      <Caixa p={[0, 1.7, -6.95]} s={[1.8, 3.4, 0.2]} cor={C3.porta} contorno={0.07} />
      <Caixa p={[0.6, 1.7, -6.8]} s={[0.16, 0.16, 0.12]} cor={C3.amarelo} contorno={0.03} />
      {[-5.5, -2.8, 2.8, 5.5].map((x) => (
        <group key={x}>
          <Caixa p={[x, 4.2, -6.95]} s={[1.8, 1.6, 0.2]} cor={C3.janela} contorno={0.08} />
          <Caixa p={[x, 4.2, -6.82]} s={[0.1, 1.6, 0.06]} cor="#ffffff" contorno={0} />
          <Caixa p={[x, 4.2, -6.82]} s={[1.8, 0.1, 0.06]} cor="#ffffff" contorno={0} />
        </group>
      ))}
      {/* árvore */}
      <Caixa p={[7.5, 1.3, -4.5]} s={[0.7, 2.6, 0.7]} cor={C3.tronco} />
      <Caixa p={[7.5, 3.6, -4.5]} s={[3, 2.6, 3]} cor={C3.folha} contorno={0.07} />
      <Caixa p={[-8, 1.0, -3]} s={[2.4, 2, 2.4]} cor={C3.folha} contorno={0.07} />
      {/* céu */}
      {nuvem(-9, 13, -26, 1)}
      {nuvem(8, 16, -32, 0.7)}
      {nuvem(-2, 19, -40, 0.5)}
      <group position={[12, 20, -45]} rotation={[0, 0, t * 0.6]}>
        <Caixa s={[4, 4, 0.5]} cor="#ffe14d" brilho="#ffd000" forca={0.8} contorno={0.12} sombra={false} />
      </group>
    </group>
  );
};

/** Aura de poder: dois anéis dourados girando e cubinhos subindo. */
export const Aura: React.FC<{ t: number; forca: number; pos?: V3 }> = ({ t, forca, pos = [0, 0, 0] }) => {
  if (forca <= 0) return null;
  return (
    <group position={pos}>
      {[0, 1].map((k) => (
        <mesh key={k} position={[0, 0.6 + k * 1.5 + Math.sin(t * 3 + k) * 0.2, 0]} rotation={[Math.PI / 2, 0, t * (k ? -2 : 2)]} scale={forca}>
          <torusGeometry args={[1.5, 0.07, 8, 40]} />
          <meshBasicMaterial color="#ffd23f" transparent opacity={0.9 * forca} />
        </mesh>
      ))}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = i * 2.39;
        const y = (t * 1.6 + i * 0.37) % 3.6;
        const r = 1.2 + (i % 3) * 0.25;
        const s = 0.16 * forca * (1 - y / 3.6);
        return (
          <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} rotation={[t * 2, t * 3, 0]}>
            <boxGeometry args={[s, s, s]} />
            <meshBasicMaterial color={i % 2 ? "#ffd23f" : "#fff6c2"} />
          </mesh>
        );
      })}
      <pointLight position={[0, 2.5, 1.5]} color="#ffc400" intensity={1.2 * forca} distance={4} />
    </group>
  );
};

/** Poeira de pouso: cubinhos saindo em anel a partir de `t0`. */
export const Poeira: React.FC<{ t: number; t0: number; pos?: V3 }> = ({ t, t0, pos = [0, 0, 0] }) => {
  const d = t - t0;
  if (d < 0 || d > 0.9) return null;
  return (
    <group position={pos}>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 0.8 + d * 4;
        const s = 0.45 * (1 - d / 0.9);
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.25 + d * 0.8, Math.sin(a) * r]} rotation={[d * 4, a, 0]}>
            <boxGeometry args={[s, s, s]} />
            <meshToonMaterial color="#f4e9d4" gradientMap={degrau} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Tremor determinístico (câmera ou tela) que decai depois de `t0`. */
export const tremor = (t: number, t0: number, dur: number, amp: number): V3 => {
  const d = t - t0;
  if (d < 0 || d > dur) return [0, 0, 0];
  const k = amp * (1 - d / dur);
  return [Math.sin(d * 71) * k, Math.cos(d * 53) * k, Math.sin(d * 37) * k * 0.5];
};

/** Controle de videogame (roxo, botões coloridos). */
export const Controle3D: React.FC<{ pos?: V3; rot?: V3; esc?: number; brilho?: number }> = ({ pos = [0, 0, 0], rot = [0, 0, 0], esc = 1, brilho = 0 }) => (
  <group position={pos} rotation={rot} scale={esc}>
    <Caixa s={[1.0, 0.36, 0.5]} cor="#7b4bd6" brilho={brilho > 0 ? "#ffcc33" : undefined} forca={brilho} />
    <Caixa p={[-0.42, -0.12, 0.05]} s={[0.32, 0.42, 0.42]} cor="#7b4bd6" />
    <Caixa p={[0.42, -0.12, 0.05]} s={[0.32, 0.42, 0.42]} cor="#7b4bd6" />
    <Caixa p={[-0.25, 0.2, 0]} s={[0.24, 0.06, 0.08]} cor={C3.linha} contorno={0} />
    <Caixa p={[-0.25, 0.2, 0]} s={[0.08, 0.06, 0.24]} cor={C3.linha} contorno={0} />
    <Caixa p={[0.2, 0.2, -0.06]} s={[0.1, 0.06, 0.1]} cor={C3.amarelo} contorno={0.015} />
    <Caixa p={[0.33, 0.2, 0.06]} s={[0.1, 0.06, 0.1]} cor={C3.vermelho} contorno={0.015} />
  </group>
);

/** Tigela de sopa com vapor subindo. */
export const Tigela3D: React.FC<{ t: number; pos?: V3; rot?: V3; esc?: number }> = ({ t, pos = [0, 0, 0], rot = [0, 0, 0], esc = 1 }) => (
  <group position={pos} rotation={rot} scale={esc}>
    <Caixa s={[0.9, 0.4, 0.9]} cor="#c0563a" />
    <Caixa p={[0, 0.21, 0]} s={[0.74, 0.04, 0.74]} cor="#ffb347" contorno={0} />
    {[0, 1, 2].map((i) => {
      const y = 0.4 + ((t * 1.2 + i * 0.4) % 1.2);
      return <Caixa key={i} p={[(i - 1) * 0.22, y, 0]} s={[0.14, 0.14, 0.14]} cor="#ffffff" contorno={0} opacidade={1 - (y - 0.4) / 1.2} sombra={false} />;
    })}
  </group>
);

/** Coração de blocos. */
export const Coracao3D: React.FC<{ pos?: V3; esc?: number; rotY?: number }> = ({ pos = [0, 0, 0], esc = 1, rotY = 0 }) => (
  <group position={pos} scale={esc} rotation={[0, rotY, 0]}>
    <Caixa s={[0.5, 0.5, 0.25]} rot={[0, 0, Math.PI / 4]} cor="#ff3b6b" contorno={0.04} brilho="#ff3b6b" forca={0.4} />
    <Caixa p={[-0.18, 0.2, 0]} s={[0.36, 0.36, 0.25]} rot={[0, 0, Math.PI / 4]} cor="#ff3b6b" contorno={0} brilho="#ff3b6b" forca={0.4} />
    <Caixa p={[0.18, 0.2, 0]} s={[0.36, 0.36, 0.25]} rot={[0, 0, Math.PI / 4]} cor="#ff3b6b" contorno={0} brilho="#ff3b6b" forca={0.4} />
  </group>
);

/** Pia/bancada com pilha de pratos e bolhas. */
export const Pia3D: React.FC<{ t: number; pos?: V3; pratos?: number }> = ({ t, pos = [0, 0, 0], pratos = 6 }) => (
  <group position={pos}>
    <Caixa p={[0, 0.6, 0]} s={[1.2, 1.2, 2.6]} cor="#e9eef2" contorno={0.06} />
    <Caixa p={[0.05, 1.22, 0.4]} s={[0.9, 0.06, 1.0]} cor="#9fb3c2" contorno={0.03} />
    <Caixa p={[-0.45, 1.7, 0.4]} s={[0.12, 0.9, 0.12]} cor="#b8c4cc" contorno={0.03} />
    {Array.from({ length: pratos }).map((_, i) => (
      <Caixa key={i} p={[0.05, 1.3 + i * 0.09, -0.75]} s={[0.7, 0.06, 0.7]} cor={i % 2 ? "#ffffff" : "#d6f0ff"} contorno={0.02} />
    ))}
    {Array.from({ length: 10 }).map((_, i) => {
      const y = 1.3 + ((t * 0.9 + i * 0.23) % 2.2);
      const s = 0.12 + (i % 3) * 0.05;
      return (
        <mesh key={i} position={[0.15 + Math.sin(i * 2.1 + t * 2) * 0.35, y, 0.4 + Math.cos(i * 1.7) * 0.4]}>
          <sphereGeometry args={[s, 12, 10]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85 * (1 - (y - 1.3) / 2.2)} />
        </mesh>
      );
    })}
  </group>
);

/** Feixe reto entre dois pontos (laser do olhar). */
export const Laser: React.FC<{ a: V3; b: V3; cor?: string; esp?: number; op?: number }> = ({ a, b, cor = "#ff2030", esp = 0.05, op = 1 }) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const d = vb.clone().sub(va);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  const meio = va.clone().add(vb).multiplyScalar(0.5);
  return (
    <group position={meio} quaternion={q}>
      <mesh><cylinderGeometry args={[esp * 2.4, esp * 2.4, d.length(), 10]} /><meshBasicMaterial color={cor} transparent opacity={0.35 * op} /></mesh>
      <mesh><cylinderGeometry args={[esp, esp, d.length(), 10]} /><meshBasicMaterial color="#fff0f0" transparent opacity={op} /></mesh>
    </group>
  );
};

/** Brilhos (cubinhos girando) em volta de um ponto. */
export const Brilhos: React.FC<{ t: number; pos: V3; raio?: number; n?: number; cor?: string }> = ({ t, pos, raio = 0.9, n = 8, cor = "#fff6c2" }) => (
  <group position={pos}>
    {Array.from({ length: n }).map((_, i) => {
      const a = (i / n) * Math.PI * 2 + t * 2;
      const s = 0.1 + 0.06 * Math.sin(t * 8 + i);
      return (
        <mesh key={i} position={[Math.cos(a) * raio, Math.sin(a * 1.3) * 0.4, Math.sin(a) * raio]} rotation={[t * 3, t * 2, Math.PI / 4]}>
          <boxGeometry args={[s, s, s]} />
          <meshBasicMaterial color={cor} />
        </mesh>
      );
    })}
  </group>
);
