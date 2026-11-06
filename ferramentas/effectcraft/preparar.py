"""Ajusta a narração existente às durações finais, preservando pitch e originais."""
import json, pathlib, subprocess, shutil, wave, math, array
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'exportacoes'/'heranca-csharp'; OUT.mkdir(parents=True,exist_ok=True)
FF=shutil.which('ffmpeg')
PAIRS=[('long','heranca-em-c-com-resident-evil-4-complet-mw3tgfr5',240),('short','heranca-em-c-com-resident-evil-4-short-mw3tgfyp',50)]
for kind,pid,target in PAIRS:
    folder=ROOT/'remotion'/'public'/'videos'/pid
    tl=json.loads((folder/'timeline.json').read_text(encoding='utf-8'))
    script=json.loads((ROOT/'scratchpad'/'heranca-csharp'/f'{kind}.json').read_text(encoding='utf-8'))
    ratio=target/tl['duracao']
    pcm=b''; rate=channels=None
    for c in tl['cenas']:
        with wave.open(str(folder/c['audio']),'rb') as w:
            rate=w.getframerate();channels=w.getnchannels();pcm+=w.readframes(w.getnframes())
    raw=OUT/f'{kind}-voz-original.wav'
    with wave.open(str(raw),'wb') as w:
        w.setnchannels(channels);w.setsampwidth(2);w.setframerate(rate);w.writeframes(pcm)
    voice=OUT/f'{kind}-voz.wav'
    subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-i',str(raw),'-af',f'atempo={1/ratio:.10f},apad,atrim=duration={target},loudnorm=I=-16:TP=-1.5:LRA=9','-ar','48000','-ac','2',str(voice)],check=True)
    for i,c in enumerate(tl['cenas']):
        start=round(c['inicio']*ratio*30)/30
        end=round(tl['cenas'][i+1]['inicio']*ratio*30)/30 if i+1<len(tl['cenas']) else target
        c.update(inicio=start,dur=round(end-start,8),visual=script['cenas'][i]['visual'])
        for p in c['palavras']:p['t']=round(p['t']*ratio,5)
    tl.update(fps=30,duracao=target,audio=str(voice),fatorRitmo=round(1/ratio,6))
    (OUT/f'{kind}-timeline.json').write_text(json.dumps(tl,ensure_ascii=False,indent=2),encoding='utf-8')
    # Efeitos discretos: entradas de cena e confirmação de conceitos.
    sr=48000;sfx=array.array('h',[0])*int(target*sr)
    for i,c in enumerate(tl['cenas']):
        if not i:continue
        at=int(c['inicio']*sr);freq=420 if i%3 else 660
        for j in range(int(.13*sr)):
            if at+j>=len(sfx):break
            env=math.exp(-j/sr*35)*min(1,j/180)
            v=int(700*env*math.sin(2*math.pi*(freq*j/sr+120*(j/sr)**2)))
            sfx[at+j]=max(-32768,min(32767,sfx[at+j]+v))
    snd=OUT/f'{kind}-sfx.wav'
    with wave.open(str(snd),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(sfx.tobytes())
    mix=OUT/f'{kind}-audio.wav'
    subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-i',str(voice),'-i',str(snd),'-filter_complex','[0:a][1:a]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95','-t',str(target),'-ac','2',str(mix)],check=True)
    print(kind,target,'segundos, ritmo',round(1/ratio,3),flush=True)
    # Capítulos calculados a partir da timeline final.
    chapters=[]
    if kind=='long':
        for idx,title in [(0,'Herança com Resident Evil 4'),(5,'Classe base e classe derivada'),(15,'virtual e override'),(19,'Polimorfismo'),(24,'Construtores e base'),(28,'private e protected'),(30,'abstract'),(33,'Herança e interfaces'),(35,'Herança ou composição?'),(44,'Desafio prático')]:
            secs=int(tl['cenas'][idx]['inicio']);chapters.append(f'{secs//60:02}:{secs%60:02} {title}')
    title='Herança em C# com Resident Evil 4: virtual, override e polimorfismo' if kind=='long' else 'Herança em C# em 50 segundos | Resident Evil 4 #Shorts'
    description=('Aprenda herança em C# com o Dev Sobrevivente e uma analogia de Resident Evil 4. Entenda classe base, classe derivada, virtual, override e polimorfismo com exemplos visuais de inimigos e ataques.\n\n'+('Neste vídeo completo: construtores com base, acesso private e protected, classes abstract, interfaces e quando usar composição em vez de herança.\n\n'+ '\n'.join(chapters) if kind=='long' else 'Resumo prático: Ganado É UM Inimigo; Leon TEM UM Inventário. Veja o vídeo completo no canal para aprofundar. Este é um exemplo didático inspirado no jogo, não uma descrição do seu código interno.')+'\n\nSua missão: crie GanadoEscudo, reaproveite ReceberDano e implemente um ataque com override.\n\nInscreva-se no Dev Sobrevivente para aprender programação com analogias de games.\n\nExemplo educacional inspirado em Resident Evil 4; não descreve a implementação original do jogo.\n\n#CSharp #Programacao #OrientacaoAObjetos'+(' #Shorts' if kind=='short' else ''))
    tags=['herança em C#','heranca csharp','C#','C sharp','orientação a objetos','programação orientada a objetos','POO','classe base','classe derivada','virtual override C#','polimorfismo C#','abstract C#','composição vs herança','Resident Evil 4','aprender programação com jogos','Dev Sobrevivente','C# para iniciantes']
    meta={'titulo':title,'descricao':description,'tags':tags,'visibilidade':'private','idioma':'pt-BR','categoria':'Educação','duracao':target}
    (OUT/f'{kind}-youtube.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/f'{kind}-youtube.txt').write_text(title+'\n\n'+description+'\n\nTAGS\n'+', '.join(tags),encoding='utf-8')
images=pathlib.Path.home()/'.codex'/'generated_images'/'01a1acb6-20d0-7940-a7ed-ebbbff1792bb'
if images.exists():
    files=list(images.glob('*.png'))
    if files:shutil.copy2(max(files,key=lambda x:x.stat().st_mtime),OUT/'capa-long.png')
