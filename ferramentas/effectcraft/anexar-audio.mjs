import {connect} from './mcp-client.mjs';
import {resolve} from 'node:path';
const dir=resolve('exportacoes/heranca-csharp');
for(const kind of ['short','long']){
 const c=await connect(`${dir}/${kind}.ecproj`);
 const parse=r=>JSON.parse(r.content.find(c=>c.type==='text').text);
 const exec=async(command,params)=>parse(await c.call('execute_command',{command,params}));
 try{
  await exec('comp.open',{comp:kind==='long'?'Heranca-CSharp-Longo':'Heranca-CSharp-Short'});
  const comp=parse(await c.call('get_comp',{}));
  if(!comp.layers.some(l=>l.name===`${kind}-audio.wav`)){
   const imp=await exec('file.import',{paths:[`${dir}/${kind}-audio.wav`]});
   await exec('layer.addItem',{item:imp.items[0],time:0,in:0,out:kind==='long'?240:50});
   await c.call('save_project',{path:`${dir}/${kind}.ecproj`});
  }
  console.log('Narração anexada ao projeto',kind);
 }finally{c.close()}
}
