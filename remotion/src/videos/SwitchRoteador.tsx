import { AbsoluteFill, Freeze, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { recortarTimeline, type Timeline } from "../tipos";
import roteiro from "../../../scratchpad/switch-roteador.json";

const pasta = "videos/switch-vs-roteador-por-onde-seus-dados-p-mwdhmy6y/";
const amarelo = "#ffd23f";
const azul = "#83caff";
const creme = "#f2ead8";
const verde = "#9adb83";
const vermelho = "#ff8475";
const mono = "Consolas, monospace";

type Cartao = { rotulo: string; valor: string; detalhe: string; cor: string };
const local = (valor: string, detalhe: string, rotulo = "REDE LOCAL"): Cartao => ({ rotulo, valor, detalhe, cor: amarelo });
const remoto = (valor: string, detalhe: string, rotulo = "ENTRE REDES"): Cartao => ({ rotulo, valor, detalhe, cor: azul });
const estado = (valor: string, detalhe: string, rotulo = "VERIFICAÇÃO", cor = verde): Cartao => ({ rotulo, valor, detalhe, cor });
const comparacao = [
  local("Switch", "Encaminha quadros na rede local pelo MAC de destino.", "MAC"),
  remoto("Roteador", "Encaminha pacotes entre redes pelo IP de destino.", "IP"),
];
const cartoes: Record<number, Cartao[]> = {
  1: [local("Imprimir", "Computador → switch → impressora"), remoto("Abrir um site", "Computador → switch → roteador → servidor")],
  5: comparacao,
  9: [local("MAC de destino", "O switch consulta a porta associada ao destino.", "QUADRO ETHERNET")],
  10: [local("Etiqueta do enlace", "Identifica a interface que recebe o quadro naquele trecho.", "MAC")],
  11: [local("MAC de origem → porta", "Exemplo: o computador apareceu na porta 1.", "APRENDIZADO")],
  12: [local("Impressora → porta 2", "Destino conhecido: encaminha só para essa porta.", "TABELA MAC")],
  13: [local("Destino desconhecido", "Replica nas outras portas da rede local. A porta de entrada fica de fora.", "TABELA MAC")],
  17: [local("Impressão direta", "Pode funcionar com a internet fora."), remoto("Impressão pela nuvem", "Depende do acesso ao serviço remoto.")],
  20: [remoto("IP de destino", "O roteador consulta a tabela de rotas para decidir a saída.", "PACOTE IP")],
  21: [local("MAC do roteador", "Destino do quadro neste enlace.", "QUADRO"), remoto("IP do servidor", "Destino do pacote entre redes.", "PACOTE")],
  22: [remoto("Próximo passo", "Interface de saída e, se necessário, próximo roteador.", "TABELA DE ROTAS")],
  23: [remoto("Gateway padrão", "Saída usada quando o destino está fora da LAN e não há rota mais específica.")],
  26: comparacao,
  27: [local("Wi-Fi", "O dispositivo entra na rede sem usar um cabo."), remoto("Ponto de acesso", "Conecta o equipamento sem fio à rede.", "ACESSO")],
  28: [estado("Uma caixa, três funções", "Roteador + switch + ponto de acesso", "EQUIPAMENTO DOMÉSTICO")],
  29: [local("LAN", "Equipamentos da casa ou escritório.", "PORTAS"), remoto("WAN", "Conexão com o provedor ou outro equipamento.", "PORTA")],
  30: [local("Porta LAN → switch", "O switch oferece mais portas para os equipamentos locais.", "EXPANSÃO")],
  31: [local("Mais portas", "O switch amplia as conexões por cabo."), remoto("Saída da rede", "O roteador continua ligando redes diferentes.")],
  32: [estado("Impressora funciona", "O trecho local usado para imprimir responde."), estado("Nenhum site abre", "O que você verificaria primeiro?", "DIAGNÓSTICO", vermelho)],
  35: [estado("Só um computador", "Os outros aparelhos continuam imprimindo e acessando sites.", "DIAGNÓSTICO")],
  36: [local("Cabo e porta", "Confira a conexão entre o computador e o switch."), remoto("Configuração", "Compare com um computador que funciona.", "DIAGNÓSTICO")],
  37: [estado("Luz da porta", "Indica conexão física. O acesso à internet precisa de outro teste.", "LINK ATIVO")],
  38: [estado("Computador A → computador B", "Quem encaminha os quadros se os dois estão na mesma rede local?", "DESAFIO", amarelo)],
  39: comparacao,
  41: comparacao,
  42: [remoto("Endereço IP", "Como o computador identifica se o destino é local?", "PRÓXIMA AULA")],
  43: [local("Redes de computadores do zero", "Salve o vídeo e acompanhe as próximas aulas.", "DEV SOBREVIVENTE")],
};

const arquivos = { local: "local", internet: "internet", volta: "retorno", queda: "sem-internet", mapa: "internet" };
type ModoTrajeto = keyof typeof arquivos;
const temTrajeto = (visual: string): visual is ModoTrajeto => Object.prototype.hasOwnProperty.call(arquivos, visual);
const trajetosVerticais = new Set<ModoTrajeto>(["local", "internet", "queda", "mapa"]);
const midiaRede = "switch-roteador/";

const Trajeto: React.FC<{ modo: ModoTrajeto; chegada: number; vertical: boolean }> = ({ modo, chegada, vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const velocidade = 1.65 / chegada;
  const ultimoQuadro = Math.floor(2.92 * fps / velocidade);
  const sufixo = vertical && trajetosVerticais.has(modo) ? "-vertical" : "";
  const estilo = { display: "block", width: "100%", borderRadius: 25 };
  if (modo === "mapa") return <Img src={staticFile(midiaRede + "equipamentos.png")} style={estilo} />;
  return (
    <Freeze frame={Math.min(frame, ultimoQuadro)}>
      <OffthreadVideo
        src={staticFile(`${midiaRede}3d-${arquivos[modo]}${sufixo}.mp4`)}
        playbackRate={velocidade}
        muted
        style={estilo}
      />
    </Freeze>
  );
};

const Ficha: React.FC<{ cartao: Cartao; entrada: number; vertical: boolean }> = ({ cartao, entrada, vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - Math.round(entrada * fps), fps, config: { damping: 22, stiffness: 118 } });
  return (
    <div style={{
      flex: 1, minWidth: 0, border: `2px solid ${cartao.cor}65`, borderLeft: `9px solid ${cartao.cor}`,
      borderRadius: 24, background: "linear-gradient(145deg,#283525,#172016)", padding: vertical ? "24px 38px" : "38px 42px",
      opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 70}px)`,
    }}>
      <div style={{ fontFamily: mono, fontWeight: 700, fontSize: vertical ? 28 : 29, letterSpacing: 2, color: cartao.cor }}>
        {cartao.rotulo}
      </div>
      <div style={{ fontSize: vertical ? 50 : 59, lineHeight: 1.13, marginTop: 11, fontWeight: 900, color: creme }}>{cartao.valor}</div>
      <div style={{ fontSize: vertical ? 35 : 39, lineHeight: 1.3, marginTop: 14, color: "#cfdbbd" }}>{cartao.detalhe}</div>
    </div>
  );
};

const cenaDeRede = (origem: number): CenaEspecial => ({ cena }) => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const vertical = height > width;
  const spec = roteiro.cenas[origem];
  const visual = spec.visual;
  const temAnimacao = temTrajeto(visual);
  const chegada = Math.max(1.2, Math.min(3.8, cena.dur - .72, em(cena, spec.palavra) || 2.1));
  const entrada = spring({ frame, fps, config: { damping: 23, stiffness: 112 } });
  const t = frame / fps;
  const deslocamento = interpolate(entrada, [0, 1], [58, 0]);
  const painelTop = vertical ? 390 : 224;
  const painelWidth = vertical ? 952 : 1280;
  const lista = cartoes[origem] ?? comparacao;
  const pose = cena.mascote ?? spec.mascote;
  const titulo = cena.titulo ?? spec.titulo;
  const imagem = ["mac", "tabela"].includes(visual) ? "equipamento-switch.png"
    : ["rotas", "wifi", "portas"].includes(visual) ? "equipamento-roteador.png"
      : "equipamentos.png";
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 38% 42%,#35472c 0%,#1b271b 55%,#0c130e 100%)", fontFamily: "Poppins, Arial", overflow: "hidden" }}>
      <AbsoluteFill style={{
        backgroundImage: "linear-gradient(#a2b78c17 1px,transparent 1px),linear-gradient(90deg,#a2b78c17 1px,transparent 1px)",
        backgroundSize: "72px 72px", backgroundPosition: `${frame * .34}px 0px`,
      }} />
      <div style={{ position: "absolute", top: vertical ? 108 : 58, left: 65, right: 65, transform: `translateY(${-deslocamento}px)` }}>
        <div style={{ width: 128, height: 6, background: amarelo, marginBottom: 20 }} />
        <div style={{ color: "#c4d3ac", fontFamily: mono, fontWeight: 700, fontSize: vertical ? 28 : 25, letterSpacing: 3 }}>DEV SOBREVIVENTE / REDES</div>
        <div style={{ color: creme, fontSize: vertical ? 72 : 78, fontWeight: 900, lineHeight: 1.1, marginTop: 12 }}>{titulo}</div>
      </div>
      <div style={{
        position: "absolute", left: 64, top: painelTop, width: painelWidth,
        transform: `translateY(${deslocamento}px)`, opacity: Math.min(1, entrada),
        filter: "drop-shadow(0 16px 26px #080c08a0)",
      }}>
        {temAnimacao ? (
          <Trajeto modo={visual} chegada={chegada} vertical={vertical} />
        ) : (
          <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: vertical ? 22 : 30 }}>
            {lista.map((cartao, i) => <Ficha key={cartao.valor} cartao={cartao} entrada={i === 0 ? .12 : Math.max(.55, Math.min(chegada, 2.2))} vertical={vertical} />)}
          </div>
        )}
      </div>
      {!temAnimacao && (
        <Img src={staticFile(midiaRede + imagem)} style={{
          position: "absolute",
          ...(vertical ? { left: 64, top: 1015, width: 566 } : { right: 74, top: 225, width: 420 }),
          borderRadius: 20, border: "2px solid #829b635d",
          opacity: Math.min(1, entrada), transform: `translateY(${deslocamento}px)`,
        }} />
      )}
      <Img
        src={staticFile(`mascote/${pose}.png`)}
        style={{
          position: "absolute",
          width: vertical && temAnimacao ? 210 : vertical ? 315 : 380,
          height: vertical && temAnimacao ? 246 : vertical ? 395 : temAnimacao ? 486 : 366,
          objectFit: "contain",
          ...(vertical && temAnimacao ? { left: 64, bottom: 84 } : { right: 74, bottom: vertical ? 495 : 241 }),
          transform: `translateX(${(1 - entrada) * 110}px) translateY(${Math.sin(t * 3.1) * 6}px)`,
          filter: "drop-shadow(0 14px 18px #080b06b0)",
        }}
      />
      <Sons efeitos={temAnimacao && visual !== "mapa" ? [{ t: chegada, tipo: "plim" }] : []} />
    </AbsoluteFill>
  );
};

const especiais = Object.fromEntries(roteiro.cenas.map((_, i) => [i, cenaDeRede(i)]));
const corte = [0, 1, 3, 15, 16, 4, 19, 24, 26, 28, 41, 43];
const especiaisShort = Object.fromEntries(corte.map((origem, i) => [i, especiais[origem]]));

export const timelineShortSwitchRoteador = (tl: Timeline) =>
  recortarTimeline(tl, corte, { largura: 1080, altura: 1920, legenda: { ...tl.legenda, pos: 77 } });
export const SwitchRoteador: React.FC<Timeline> = (tl) =>
  <Video {...tl} legenda={{ ...tl.legenda, pos: 86 }} pasta={pasta} especiais={especiais} />;
export const SwitchRoteadorShort: React.FC<Timeline> = (tl) => <Video {...tl} pasta={pasta} especiais={especiaisShort} />;
