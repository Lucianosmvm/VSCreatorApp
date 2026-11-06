"""Finalização e provas técnicas dos MP4 renderizados pelo EffectCraft."""
import json, pathlib, subprocess, shutil, sys
ROOT=pathlib.Path(__file__).resolve().parents[2]; OUT=ROOT/'exportacoes'/'heranca-csharp'
FF=shutil.which('ffmpeg'); FP=shutil.which('ffprobe')
def run(args):subprocess.run(args,check=True)
def stamp(t):
    ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
for kind in (sys.argv[1:] or ['short','long']):
    tl=json.loads((OUT/f'{kind}-timeline.json').read_text(encoding='utf-8'))
    srt=[]
    for i,c in enumerate(tl['cenas']):
        srt.append(f'{i+1}\n{stamp(c["inicio"])} --> {stamp(c["inicio"]+c["dur"])}\n{c["texto"].replace("C sharp","C#")}\n')
    (OUT/f'{kind}.srt').write_text('\n'.join(srt),encoding='utf-8')
    if (OUT/f'capa-{kind}.png').exists():
        size='1280:720' if kind=='long' else '1080:1920'
        run([FF,'-hide_banner','-loglevel','error','-y','-i',str(OUT/f'capa-{kind}.png'),'-vf',f'scale={size}:force_original_aspect_ratio=increase,crop={size}','-frames:v','1','-q:v','2',str(OUT/f'capa-{kind}.jpg')])
    src=OUT/f'{kind}-visual.mp4'
    if not src.exists() or not src.stat().st_size:continue
    name='heranca-csharp-short-50s.mp4' if kind=='short' else 'heranca-csharp-longo-4min.mp4'
    dest=OUT/name
    run([FF,'-hide_banner','-loglevel','error','-y','-i',str(src),'-i',str(OUT/f'{kind}-audio.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t',str(tl['duracao']),'-movflags','+faststart',str(dest)])
    info=json.loads(subprocess.check_output([FP,'-v','error','-show_entries','format=duration,size:stream=index,codec_type,codec_name,width,height,r_frame_rate,duration,nb_frames','-of','json',str(dest)],text=True))
    video=next(s for s in info['streams'] if s['codec_type']=='video'); audio=next(s for s in info['streams'] if s['codec_type']=='audio')
    assert abs(float(info['format']['duration'])-tl['duracao'])<.05,info
    assert (video['width'],video['height'])==(tl['largura'],tl['altura']),info
    assert video['r_frame_rate']=='30/1',info
    assert int(video['nb_frames'])==tl['duracao']*30,info
    # Uma passagem de decodificação detecta arquivos truncados ou codecs inválidos.
    run([FF,'-hide_banner','-loglevel','error','-i',str(dest),'-f','null','-'])
    (OUT/f'{kind}-verificacao.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf-8')
    run([FF,'-hide_banner','-loglevel','error','-y','-ss','1.8','-i',str(dest),'-frames:v','1','-update','1',str(OUT/'stills'/f'{kind}-mp4-inicio.png')])
    print('EXPORTADO E VERIFICADO:',dest,flush=True)
