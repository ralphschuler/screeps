#!/usr/bin/env node
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { ScreepsAPI } = require('screeps-api');

const shard = process.env.SCREEPS_SHARD || 'shard1';
const roomsToInspect = (process.env.SCREEPS_VERIFY_ROOMS || 'W19S26,W17S29,W18S28,W18S29,W19S25,W19S27')
  .split(',')
  .map(room => room.trim())
  .filter(Boolean);
const allies = new Set(['TooAngel', 'TedRoastBeef']);

const api = new ScreepsAPI({
  token: process.env.SCREEPS_TOKEN,
  protocol: process.env.SCREEPS_PROTOCOL || 'https',
  hostname: process.env.SCREEPS_HOSTNAME || 'screeps.com',
  port: Number(process.env.SCREEPS_PORT || 443),
  path: process.env.SCREEPS_PATH || '/'
});

function countBody(body = []) {
  return body.reduce((counts, part) => {
    const type = part.type || part;
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
}

function ownerName(obj, users = {}) {
  const owner = users[obj.user] || users[String(obj.user)] || obj.owner;
  return owner?.username || owner?.name || obj.owner?.username || obj.user || obj.owner?.user || 'unknown';
}

function isActualHostile(creep, users) {
  const owner = ownerName(creep, users);
  return !(creep.my || owner === 'TedRoastBeef' || allies.has(owner));
}

function summarizeRoom(roomName, resp) {
  const users = resp.users || {};
  const objects = resp.objects || [];
  const creeps = objects.filter(obj => obj.type === 'creep');
  const myCreeps = creeps.filter(creep => creep.my || ownerName(creep, users) === 'TedRoastBeef');
  const hostiles = creeps.filter(creep => isActualHostile(creep, users));
  const alliesVisible = creeps.filter(creep => allies.has(ownerName(creep, users)));
  const controller = objects.find(obj => obj.type === 'controller');

  return {
    objectCount: objects.length,
    controller: controller && {
      level: controller.level,
      my: !!controller.my,
      owner: ownerName(controller, users),
      safeMode: controller.safeMode,
      ticksToDowngrade: controller.ticksToDowngrade
    },
    creeps: {
      my: myCreeps.length,
      actualHostile: hostiles.length,
      allied: alliesVisible.length
    },
    hostiles: hostiles.map(creep => ({
      name: creep.name,
      owner: ownerName(creep, users),
      x: creep.x,
      y: creep.y,
      hits: creep.hits,
      body: countBody(creep.body)
    })),
    myMilitary: myCreeps
      .filter(creep => ['guard', 'ranger', 'healer'].includes(creep.memory?.role) || creep.memory?.task === 'defenseAssist' || creep.memory?.targetRoom === 'W19S26')
      .map(creep => ({
        name: creep.name,
        role: creep.memory?.role,
        task: creep.memory?.task,
        targetRoom: creep.memory?.targetRoom,
        assistTarget: creep.memory?.assistTarget,
        squadId: creep.memory?.squadId,
        defenseSquadId: creep.memory?.defenseSquadId,
        x: creep.x,
        y: creep.y,
        body: countBody(creep.body)
      })),
    structures: {
      spawns: objects.filter(obj => obj.type === 'spawn').map(spawn => ({ id: spawn._id, name: spawn.name, my: spawn.my, spawning: spawn.spawning })),
      towers: objects.filter(obj => obj.type === 'tower').map(tower => ({ id: tower._id, my: tower.my, energy: tower.energy, hits: tower.hits })),
      ramparts: objects.filter(obj => obj.type === 'rampart' && obj.my).length
    }
  };
}

function memoryValues(obj) {
  return obj && typeof obj === 'object' ? Object.values(obj) : [];
}

function extractAssignedDefenders(creepsMemory = {}) {
  return Object.entries(creepsMemory)
    .filter(([, memory]) => {
      if (!memory || typeof memory !== 'object') return false;
      return memory.targetRoom === 'W19S26' || memory.assistTarget === 'W19S26' || memory.task === 'defenseAssist';
    })
    .map(([name, memory]) => ({
      name,
      role: memory.role,
      task: memory.task,
      targetRoom: memory.targetRoom,
      assistTarget: memory.assistTarget,
      state: memory.state,
      action: memory.action,
      squadId: memory.squadId,
      defenseSquadId: memory.defenseSquadId,
      defenseSquadSize: memory.defenseSquadSize,
      stagingStartedAt: memory.stagingStartedAt,
      stagingTimeoutAt: memory.stagingTimeoutAt
    }));
}

function hasAllyTarget(memory) {
  if (!memory || typeof memory !== 'object') return false;
  return ['targetOwner', 'hostileOwner', 'attackTargetOwner', 'targetPlayer'].some(key => allies.has(memory[key]));
}

function hasRangedAttackRegression(memory) {
  if (!memory || typeof memory !== 'object') return false;
  const assignedToDefense = memory.targetRoom === 'W19S26' || memory.assistTarget === 'W19S26' || memory.task === 'defenseAssist';
  const rangedRole = memory.role === 'ranger' || memory.role === 'rangedDefender';
  const action = memory.state?.action || memory.action;
  return assignedToDefense && rangedRole && action === 'attack';
}

(async () => {
  const [me, timeResp, statsResp, creepsResp, defenseResp, clustersResp] = await Promise.all([
    api.me(),
    api.time(shard),
    api.memory.get('stats', shard).catch(error => ({ error: String(error) })),
    api.memory.get('creeps', shard).catch(error => ({ error: String(error) })),
    api.memory.get('defenseRequests', shard).catch(error => ({ error: String(error) })),
    api.memory.get('clusters', shard).catch(error => ({ error: String(error) }))
  ]);

  const rooms = {};
  for (const roomName of roomsToInspect) {
    rooms[roomName] = summarizeRoom(roomName, await api.raw.game.roomObjects(roomName, shard));
  }

  const creepsMemory = creepsResp.data || {};
  const assignedDefenders = extractAssignedDefenders(creepsMemory);
  const allyTargetViolations = Object.entries(creepsMemory)
    .filter(([, memory]) => hasAllyTarget(memory))
    .map(([name, memory]) => ({ name, role: memory.role, targetOwner: memory.targetOwner, hostileOwner: memory.hostileOwner, attackTargetOwner: memory.attackTargetOwner, targetPlayer: memory.targetPlayer }));
  const rangedAttackRegressions = Object.entries(creepsMemory)
    .filter(([, memory]) => hasRangedAttackRegression(memory))
    .map(([name, memory]) => ({ name, role: memory.role, action: memory.state?.action || memory.action, targetRoom: memory.targetRoom, assistTarget: memory.assistTarget, task: memory.task }));

  const clusters = clustersResp.data || {};
  const defenseSquads = Object.fromEntries(Object.entries(clusters).map(([clusterName, cluster]) => [clusterName, {
    defenseRequests: (cluster.defenseRequests || []).filter(request => request.roomName === 'W19S26'),
    squads: Object.entries(cluster.squads || {})
      .filter(([, squad]) => squad.targetRoom === 'W19S26' || squad.homeRoom === 'W19S26')
      .map(([id, squad]) => ({
        id,
        type: squad.type,
        status: squad.status,
        homeRoom: squad.homeRoom,
        targetRoom: squad.targetRoom,
        members: squad.members?.length || 0,
        targetComposition: squad.targetComposition,
        stagingTimeoutAt: squad.stagingTimeoutAt
      }))
  }]));

  const output = {
    generatedAt: new Date().toISOString(),
    hostname: process.env.SCREEPS_HOSTNAME || 'screeps.com',
    shard,
    authenticatedUser: { id: me._id || me.id, username: me.username || me.name },
    time: timeResp.time,
    rooms,
    memory: {
      stats: {
        tick: statsResp.data?.tick,
        cpu: statsResp.data?.cpu,
        w19s26: statsResp.data?.rooms?.W19S26 || null
      },
      defenseRequests: defenseResp.data,
      assignedDefenders,
      defenseSquads
    },
    safety: {
      allyTargetViolations,
      rangedAttackRegressions,
      consoleCalled: false,
      memoryWritten: false
    }
  };

  fs.mkdirSync('artifacts/postdeploy-w19s26-hard-defense-verify', { recursive: true });
  const out = path.join('artifacts/postdeploy-w19s26-hard-defense-verify', `readonly-verify-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(out, JSON.stringify(output, null, 2));

  const w19 = rooms.W19S26;
  console.log(JSON.stringify({
    out,
    time: output.time,
    w19s26: w19?.creeps,
    hostiles: w19?.hostiles,
    visibleMilitary: w19?.myMilitary,
    assignedDefenders,
    allyTargetViolations,
    rangedAttackRegressions,
    defenseRequestKeys: output.memory.defenseRequests && typeof output.memory.defenseRequests === 'object' ? Object.keys(output.memory.defenseRequests) : []
  }, null, 2));
})();
