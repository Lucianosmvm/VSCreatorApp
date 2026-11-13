import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import type { Timeline } from "../tipos";
import { Caixa, Etiqueta, Faixa, Fundo, Heroi, Painel, RPG, Tela, TextoPixel, rampa, useT } from "./Kit";

export const pastaRpg06 = "videos/rpg-code-06-a-cerca-parou-o-artur-mwfawv18/";

const passos = [
  { titulo: "AS SETAS FUNCIONAM", detalhe: "→ Mover Artur", palavra: "setas" },
  { titulo: "ATRAVESSOU A CERCA!", detalhe: "transform.Translate(...)", palavra: "atravessou" },
  { titulo: "CERCA", detalhe: "BoxCollider2D · Is Trigger ☐", palavra: "collider" },
  { titulo: "ARTUR", detalhe: "Collider2D no personagem", palavra: "collider" },
  { titulo: "RIGIDBODY2D", detalhe: "Dynamic · Gravity Scale = 0", palavra: "rigidbody" },
  { titulo: "UPDATE()", detalhe: "Setas → direção", palavra: "direção" },
  { titulo: "FIXEDUPDATE()", detalhe: "Direção → velocidade", palavra: "velocidade" },
  { titulo: "UNIDADES POR SEGUNDO", detalhe: "linearVelocity · sem deltaTime", palavra: "segundo" },
  { titulo: "A CERCA BLOQUEOU!", detalhe: "→ Pressionada", palavra: "bate" },
  { titulo: "COLLIDER + RIGIDBODY", detalhe: "Forma + movimento físico", palavra: "colisão" },
  { titulo: "ALGO BRILHOU...", detalhe: "EP. 07 ▶", palavra: "brilhando" },
];

const Mapa: React.FC<{ cena: number; acao: number }> = ({ cena, acao }) => {
  const { t, f } = useT();
  const antesDaCerca = 104;
  const movendo = cena === 0 || cena === 1 || cena === 8;
  const inicio = cena === 0 ? 34 : 66;
  const destino = cena === 0 ? 66 : cena === 1 ? 125 : antesDaCerca;
  const progresso = movendo ? rampa(t, Math.max(.15, acao - 1.2), Math.max(.8, acao)) : 0;
  const x = movendo ? inicio + (destino - inicio) * progresso : cena >= 9 ? antesDaCerca : 66;
  const pulo = progresso > 0 && progresso < 1 ? Math.abs(Math.sin(f * .4)) : 0;
  const impacto = cena === 8 && t >= acao && t < acao + .55;
  const cercaContorno = cena >= 2 && (cena !== 2 || t >= acao) && cena !== 10;
  const arturContorno = cena >= 3 && (cena !== 3 || t >= acao) && cena !== 10;
  return (
    <Tela y={275} treme={impacto ? Math.sin(f * 2) * 5 : 0}>
      <rect width={135} height={95} fill="#3fa34d" />
      {Array.from({ length: 47 }, (_, i) => <rect key={i} x={(i * 23) % 135} y={(i * 13) % 94} width={2} height={1} fill="#59ba60" />)}
      <path d="M0 78h135v6H0z" fill="#c9a46a" />
      <path d="M110 12h2v71h-2z" fill="#986237" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x={112} y={6 + i * 9} width={3} height={8} fill="#8b5a2b" />
          <rect x={110} y={8 + i * 9} width={7} height={1.4} fill="#a8743a" />
        </g>
      ))}
      {cercaContorno && <rect x={110} y={5} width={7} height={82} fill="none" stroke={impacto ? RPG.amarelo : RPG.azul} strokeWidth={1} />}
      {cena === 10 && t >= acao && (
        <g>
          <rect x={78} y={43} width={4} height={6} fill={RPG.amarelo} />
          <path d="M80 38v16m-8-8h16" stroke={RPG.amarelo} opacity={.6 + Math.sin(f * .3) * .35} />
        </g>
      )}
      <Heroi x={x - 6} y={59 - 15 - pulo} flip={cena === 10} />
      {arturContorno && <rect x={x - 5} y={47} width={10} height={12} fill="none" stroke={RPG.verde} strokeWidth={1} />}
      {movendo && (
        <Caixa x={9} y={64} w={12} h={11}>
          <TextoPixel x={15} y={71.5} txt="→" tam={5} cor={RPG.amarelo} meio />
        </Caixa>
      )}
      {impacto && <TextoPixel x={101} y={38} txt="PÁ!" tam={6} cor={RPG.amarelo} meio />}
    </Tela>
  );
};

const especial = (i: number): CenaEspecial => ({ cena }) => {
  const passo = passos[i];
  const acao = em(cena, passo.palavra);
  return (
    <AbsoluteFill>
      <Fundo />
      <Faixa ep="EP. 06" acao="Cerca:" destaque="Colisão 2D" />
      <Mapa cena={i} acao={acao} />
      {i === 6 || i === 7 ? (
        <Painel titulo="Movimento.cs · Unity 6" y={1080} altura={475} linhas={[
          { txt: "void FixedUpdate()" },
          { txt: "{" },
          { txt: "    rb.linearVelocity = dir * velocidade;", marca: acao },
          { txt: "}" },
        ]} />
      ) : (
        <Etiqueta t={acao} x={540} y={1180} txt={passo.titulo} tam={34} cor={i === 1 ? RPG.vermelho : RPG.amarelo} />
      )}
      <Etiqueta t={acao + .15} x={540} y={i === 6 || i === 7 ? 1595 : 1360} txt={passo.detalhe} tam={24} cor={RPG.branco} />
      <Sons efeitos={[{ t: acao, tipo: i === 1 || i === 8 ? "erro" : i === 10 ? "plim" : "pop" }]} />
    </AbsoluteFill>
  );
};

const especiais = Object.fromEntries(passos.map((_, i) => [i, especial(i)]));

export const RpgEp06: React.FC<Timeline> = (tl) => (
  <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={pastaRpg06} especiais={especiais} />
);
