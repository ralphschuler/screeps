#!/usr/bin/env node
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { ScreepsAPI } = require('screeps-api');
const shard = 'shard1';
const roomName = 'W19S26';
const api = new ScreepsAPI({ token: process.env.SCREEPS_TOKEN, protocol: process.env.SCREEPS_PROTOCOL || 'https', hostname: process.env.SCREEPS_HOSTNAME || 'screeps.com', port: Number(process.env.SCREEPS_PORT || 443), path: process.env.SCREEPS_PATH || '/' });
const ownerName = (obj, users={}) => users[obj.user]?.username || users[obj.user]?.name || obj.owner?.username || obj.user || obj.owner?.user;
const countBody = body => (body || []).reduce((m,p)=>{ const t=p.type || p; m[t]=(m[t]||0)+1; return m; },{});
const sumStore = store => store ? Object.fromEntries(Object.entries(store).filter(([,v]) => typeof v === 'number' && v !== 0)) : {};
function summarize(resp, memoryResp, statsResp){
  const users = resp.users || {};
  const objects = resp.objects || [];
  const controller = objects.find(o => o.type === 'controller');
  const creeps = objects.filter(o => o.type === 'creep');
  const mine = creeps.filter(c => c.my || ownerName(c, users) === 'TedRoastBeef');
  const hostiles = creeps.filter(c => !(c.my || ownerName(c, users) === 'TedRoastBeef'));
  const structures = objects.filter(o => ['spawn','extension','tower','storage','container','link','constructedWall','rampart'].includes(o.type));
  const sites = objects.filter(o => o.type === 'constructionSite');
  const byRole = {};
  for (const c of mine) {
    const role = c.memory?.role || 'unknown';
    byRole[role] = (byRole[role] || 0) + 1;
  }
  const upgraders = mine.filter(c => c.memory?.role === 'upgrader').map(c => ({
    name: c.name, x: c.x, y: c.y, hits: c.hits, fatigue: c.fatigue,
    store: sumStore(c.store), body: countBody(c.body),
    memory: {
      role: c.memory?.role, working: c.memory?.working, state: c.memory?.state,
      targetId: c.memory?.targetId, sourceId: c.memory?.sourceId,
      homeRoom: c.memory?.homeRoom, task: c.memory?.task,
      upgrader_nearby_containers: c.memory?.upgrader_nearby_containers,
      _metrics: c.memory?._metrics
    },
    stats: statsResp.data?.creeps?.[c.name] || null
  }));
  return {
    time: null,
    controller: controller && { id: controller._id, x: controller.x, y: controller.y, level: controller.level, owner: ownerName(controller, users), my: !!controller.my, progress: controller.progress, progressTotal: controller.progressTotal, ticksToDowngrade: controller.ticksToDowngrade, safeMode: controller.safeMode },
    creeps: { mine: mine.length, hostiles: hostiles.length, byRole },
    upgraders,
    structures: structures.map(s => ({ id:s._id, type:s.type, x:s.x, y:s.y, hits:s.hits, hitsMax:s.hitsMax, store:sumStore(s.store), energy:s.energy, energyCapacity:s.energyCapacity, spawning:s.spawning })),
    sites: sites.map(s => ({ id:s._id, type:s.structureType, x:s.x, y:s.y, progress:s.progress, progressTotal:s.progressTotal, owner: ownerName(s, users) })),
    memory: { room: memoryResp.data?.rooms?.[roomName] || null, statsRoom: statsResp.data?.rooms?.[roomName] || null }
  };
}
async function sample(){
  const [time, objects, mem, stats] = await Promise.all([
    api.time(shard),
    api.raw.game.roomObjects(roomName, shard),
    api.memory.get('', shard).catch(e => ({error:String(e)})),
    api.memory.get('stats', shard).catch(e => ({error:String(e)}))
  ]);
  const summary = summarize(objects, mem, stats);
  summary.time = time.time;
  return summary;
}
(async()=>{
  const samples = [];
  samples.push(await sample());
  await new Promise(resolve => setTimeout(resolve, 15000));
  samples.push(await sample());
  const output = { generatedAt:new Date().toISOString(), hostname:'screeps.com', shard, roomName, consoleCheck:{called:false, reason:'Read-only roomObjects/memory endpoints only; no /api/user/console.'}, samples };
  fs.mkdirSync('artifacts/w19s26-upgrader-diagnosis',{recursive:true});
  const out = path.join('artifacts/w19s26-upgrader-diagnosis',`readonly-w19s26-upgraders-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
  fs.writeFileSync(out, JSON.stringify(output,null,2));
  const s0=samples[0], s1=samples[1];
  console.log(JSON.stringify({out, times:samples.map(s=>s.time), controllerProgress:samples.map(s=>s.controller?.progress), byRole:s1.creeps.byRole, upgraders:s1.upgraders.map(u=>({name:u.name,pos:[u.x,u.y],store:u.store,working:u.memory.working,state:u.memory.state,stats:u.stats})), structures:s1.structures.filter(s=>['spawn','extension','tower','storage','container','link'].includes(s.type)), sites:s1.sites}, null, 2));
})();
