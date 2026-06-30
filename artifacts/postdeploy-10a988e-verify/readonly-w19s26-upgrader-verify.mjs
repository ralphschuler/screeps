#!/usr/bin/env node
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {ScreepsAPI}=require('screeps-api');
const api=new ScreepsAPI({token:process.env.SCREEPS_TOKEN,hostname:process.env.SCREEPS_HOSTNAME||'screeps.com',protocol:'https',port:443,path:'/'});
const shard='shard1', room='W19S26';
async function sample(){
  const [time, objs, mem, stats]=await Promise.all([api.time(shard), api.raw.game.roomObjects(room, shard), api.memory.get('creeps', shard), api.memory.get('stats', shard)]);
  const ctrl=objs.objects.find(o=>o.type==='controller');
  const spawn=objs.objects.find(o=>o.type==='spawn');
  const creeps=objs.objects.filter(o=>o.type==='creep').map(c=>({name:c.name,x:c.x,y:c.y,store:c.store,mem:mem.data?.[c.name],stats:stats.data?.creeps?.[c.name]}));
  const upgraders=creeps.filter(c=>c.mem?.role==='upgrader').map(c=>({name:c.name,pos:[c.x,c.y],store:c.store,working:c.mem.working,state:c.mem.state,upgradeProgress:c.mem._metrics?.upgradeProgress,stats:c.stats}));
  const haulers=creeps.filter(c=>c.mem?.role==='hauler').map(c=>({name:c.name,pos:[c.x,c.y],store:c.store,working:c.mem.working,state:c.mem.state,stats:c.stats}));
  return {time:time.time, controller:{progress:ctrl?.progress, progressTotal:ctrl?.progressTotal, ticksToDowngrade:ctrl?.ticksToDowngrade}, spawn:{energy:spawn?.store?.energy, spawning:spawn?.spawning?.name||null}, upgraders, haulers};
}
(async()=>{
  const samples=[];
  samples.push(await sample());
  await new Promise(r=>setTimeout(r,30000));
  samples.push(await sample());
  const output={generatedAt:new Date().toISOString(), hostname:'screeps.com', shard, room, commit:'10a988e', consoleCheck:{called:false, reason:'Read-only roomObjects/memory endpoints only; no /api/user/console.'}, samples};
  fs.mkdirSync('artifacts/postdeploy-10a988e-verify',{recursive:true});
  const out=path.join('artifacts/postdeploy-10a988e-verify',`readonly-w19s26-upgraders-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
  fs.writeFileSync(out, JSON.stringify(output, null, 2));
  console.log(out);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
