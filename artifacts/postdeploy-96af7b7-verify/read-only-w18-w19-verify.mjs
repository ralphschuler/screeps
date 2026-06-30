#!/usr/bin/env node
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { ScreepsAPI } = require('screeps-api');
const ROOMS = ['W18S28','W19S26','W18S29','W17S29'];
const shard = 'shard1';
const commit = '96af7b7';
const api = new ScreepsAPI({ token: process.env.SCREEPS_TOKEN, protocol: process.env.SCREEPS_PROTOCOL || 'https', hostname: process.env.SCREEPS_HOSTNAME || 'screeps.com', port: Number(process.env.SCREEPS_PORT || 443), path: process.env.SCREEPS_PATH || '/' });
const countBody = body => (body || []).reduce((m,p)=>{ const t=p.type || p; m[t]=(m[t]||0)+1; return m; },{});
const ownerName = (obj, users={}) => users[obj.user]?.username || users[obj.user]?.name || obj.owner?.username || obj.user || obj.owner?.user;
function summarizeRoom(resp){
  const users = resp.users || {};
  const objects = resp.objects || [];
  const creeps = objects.filter(o=>o.type === 'creep');
  const mine = creeps.filter(c=>c.my || ownerName(c, users) === 'TedRoastBeef');
  const hostile = creeps.filter(c=>!(c.my || ownerName(c, users) === 'TedRoastBeef'));
  const defenseAssists = mine.filter(c=>c.memory?.task === 'defenseAssist' || c.memory?.targetRoom === 'W18S28' || c.memory?.defenseSquadId);
  const controller = objects.find(o=>o.type === 'controller');
  const structures = objects.filter(o=>['spawn','tower','rampart'].includes(o.type));
  const sites = objects.filter(o=>o.type === 'constructionSite');
  return {
    objectCount: objects.length,
    controller: controller && { level: controller.level, my: !!controller.my, owner: ownerName(controller, users), reservation: controller.reservation, safeMode: controller.safeMode, safeModeAvailable: controller.safeModeAvailable, ticksToDowngrade: controller.ticksToDowngrade },
    creeps: { my: mine.length, hostile: hostile.length, defenseAssists: defenseAssists.length },
    defenseAssists: defenseAssists.map(c=>({ name:c.name, role:c.memory?.role, task:c.memory?.task, targetRoom:c.memory?.targetRoom, squadId:c.memory?.squadId, defenseSquadId:c.memory?.defenseSquadId, defenseSquadSize:c.memory?.defenseSquadSize, x:c.x, y:c.y, body:countBody(c.body) })),
    hostiles: hostile.map(c=>({ name:c.name, owner: ownerName(c, users), x:c.x, y:c.y, hits:c.hits, body:countBody(c.body) })),
    structures: { spawns: structures.filter(s=>s.type==='spawn').map(s=>({id:s._id,x:s.x,y:s.y,spawning:s.spawning})), towers: structures.filter(s=>s.type==='tower').map(s=>({id:s._id,x:s.x,y:s.y,energy:s.energy})), ramparts: structures.filter(s=>s.type==='rampart').length },
    sites: { total: sites.length, spawns: sites.filter(s=>s.structureType==='spawn').map(s=>({id:s._id,x:s.x,y:s.y,progress:s.progress,progressTotal:s.progressTotal})), towers: sites.filter(s=>s.structureType==='tower').map(s=>({id:s._id,x:s.x,y:s.y,progress:s.progress,progressTotal:s.progressTotal})) }
  };
}
(async()=>{
  const [me, worldStatus, time, statsResp, defenseResp, clustersResp, empireResp] = await Promise.all([
    api.me(), api.raw.game.roomStatus('W18S28', shard).catch(e=>({error:String(e)})), api.time(shard), api.memory.get('stats', shard).catch(e=>({error:String(e)})), api.memory.get('defenseRequests', shard).catch(e=>({error:String(e)})), api.memory.get('clusters', shard).catch(e=>({error:String(e)})), api.memory.get('empire', shard).catch(e=>({error:String(e)}))
  ]);
  const rooms = {};
  for (const room of ROOMS) rooms[room] = summarizeRoom(await api.raw.game.roomObjects(room, shard));
  const clusters = clustersResp.data || {};
  const clusterSummary = Object.fromEntries(Object.entries(clusters).map(([name,c])=>[name,{ defenseRequests:(c.defenseRequests||[]).filter(r=>ROOMS.includes(r.roomName)), squads:Object.entries(c.squads||{}).filter(([,s])=>ROOMS.includes(s.targetRoom)||ROOMS.includes(s.homeRoom)).map(([id,s])=>({id,type:s.type,status:s.status,homeRoom:s.homeRoom,targetRoom:s.targetRoom,members:s.members?.length,targetComposition:s.targetComposition,stagingTimeoutAt:s.stagingTimeoutAt})) }]));
  const output = { generatedAt:new Date().toISOString(), hostname:'screeps.com', shard, commit, authenticatedUser:{ id:me._id||me.id, username:me.username||me.name }, time:time.time, worldStatus, rooms, memory:{ stats:{ tick:statsResp.data?.tick, cpu:statsResp.data?.cpu, rooms:Object.fromEntries(ROOMS.map(r=>[r, statsResp.data?.rooms?.[r] || null])) }, defenseRequests:defenseResp.data, clusters:clusterSummary, empireRecoveryRooms: empireResp.data?.recoveryRooms || {} }, consoleCheck:{ called:false, reason:'Skipped /api/user/console; screeps-api uses POST and queues console expressions. Read-only endpoints only.' } };
  fs.mkdirSync('artifacts/postdeploy-96af7b7-verify',{recursive:true});
  const out = path.join('artifacts/postdeploy-96af7b7-verify',`readonly-verify-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
  fs.writeFileSync(out, JSON.stringify(output,null,2));
  console.log(JSON.stringify({out, time:output.time, W18S28:rooms.W18S28.creeps, W19S26:rooms.W19S26.creeps, defenseRequests:output.memory.defenseRequests, recoveryRooms:output.memory.empireRecoveryRooms}, null, 2));
})();
