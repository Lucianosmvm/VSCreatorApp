---
name: refugio-13
description: Produz episódios de Refúgio 13, série interativa de sobrevivência zumbi em pixel art vista de cima, a partir do número do episódio.
---

# Refúgio 13

Ao receber `$refugio-13 01`, produza o episódio 01 do Refúgio 13. Aceite números com ou sem zero à esquerda. Sem número, retome o próximo episódio registrado. Leia [o guia e o ponto de retomada](references/serie.md) antes de escrever.

1. Confira os episódios e estados salvos em `projetos/refugio-13-NN/`. Use o estado do episódio imediatamente anterior para uma continuação. Se houver uma lacuna, explique qual capítulo falta e siga com o primeiro episódio pendente somente se o usuário tiver pedido para continuar, sem inventar o resultado de capítulos que ainda não existem.
2. Escreva um acontecimento principal e uma decisão A/B, com custos claros para ambas as escolhas. Para a continuação, use a apuração fornecida ou confirmada. Se estiver ausente, siga a regra do guia. Abra com a consequência da decisão anterior e dê um papel na ação a quem entrou no elenco.
3. Faça Shorts verticais em pixel art, com tomadas do próprio mundo e duração de até 3 minutos. Escolha a duração pelo que o episódio precisa mostrar. Use o tempo extra para revelar consequências do voto, mostrar a chegada de sobreviventes em grupos ou acompanhar uma construção decidida pelo público. Termine com uma decisão A/B clara e, quando couber, convide a entrar no elenco e a curtir e se inscrever. Procure primeiro o cenário reutilizável de Refúgio 13. Na estreia, se ainda faltar o mundo, implemente apenas os locais e ações do piloto como uma cena 2D reutilizável e determinística no Remotion. Guarde os arquivos visuais e de montagem no espaço da série. O universo, o elenco, o mapa e o estado pertencem ao Refúgio 13.
4. Entregue a prévia visual sem narração e aguarde aprovação antes de gerar áudio novo. Siga o `AGENTS.md` e use a voz da ElevenLabs já configurada, reaproveitando o áudio quando a fala servir à versão aprovada. Use a duração real da fala para sincronizar as cenas. Guarde `plano.json` (ordem, falas, legendas, ações e escolha apresentada) e `estado.json` (dia, elenco, suprimentos e escolha pendente ou resolvida) na pasta do episódio.
5. Confira quadros em `remotion/jobs/refugio-13-NN/`, exporte e verifique o MP4 em `remotion/out/refugio-13-NN.mp4`. Entregue o link, título, descrição, tags e o comentário de votação pronto para fixar. Atualize o ponto de retomada depois de exportar e mantenha a publicação no YouTube como um estado separado.
