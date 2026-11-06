import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {resolve} from 'node:path';
export async function connect(project) {
 const exe=resolve(import.meta.dirname,'bin/effectcraft-0.21.1-windows-x64-portable/effectcraft-cli.exe');
 const child=spawn(exe,['mcp',...(project?['--project',resolve(project)]:['--empty'])],{stdio:['pipe','pipe','inherit'],windowsHide:true});
 let id=0; const pending=new Map();
 createInterface({input:child.stdout}).on('line',line=>{let r;try{r=JSON.parse(line)}catch{return} const p=pending.get(r.id);if(p){pending.delete(r.id);r.error?p.reject(Error(JSON.stringify(r.error))):p.resolve(r.result)}});
 child.on('exit',code=>{for(const p of pending.values())p.reject(Error('MCP encerrou: '+code));pending.clear()});
 const rpc=(method,params)=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:n,method,params})+'\n')});
 await rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'dev-sobrevivente',version:'1.0'}});
 child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
 return {rpc,async call(name,args={}){const r=await rpc('tools/call',{name,arguments:args});if(r.isError)throw Error(JSON.stringify(r));return r},close(){child.stdin.end()}};
}
