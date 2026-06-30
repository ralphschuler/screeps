import { readJson, safeObject } from "./cpu-benchmark-model.js";

function compactSnapshotForCli(snapshot) {
  return {
    schemaVersion: snapshot.schemaVersion,
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
    roomCount: snapshot.roomCount,
    roomMapping: snapshot.roomMapping,
    rooms: (snapshot.rooms ?? []).map((room) => ({
      sourceName: room.sourceName,
      benchmarkName: room.benchmarkName,
      controller: room.controller,
      structureCounts: room.structureCounts,
      sources: room.sources,
      minerals: room.minerals,
      majorStructures: room.majorStructures,
      creeps: room.creeps,
    })),
    memorySummary: snapshot.memorySummary,
  };
}

export function loadLiveCloneSnapshot(snapshotPath) {
  const snapshot = readJson(snapshotPath);
  if (!snapshot || typeof snapshot !== "object") throw new Error(`Invalid live clone snapshot: ${snapshotPath}`);
  if (!Array.isArray(snapshot.rooms) || snapshot.rooms.length === 0) throw new Error(`Live clone snapshot has no rooms: ${snapshotPath}`);
  return snapshot;
}

function buildCliCommand(body) {
  return `Promise.resolve().then(async()=>{${body}}).then(()=>print('__PI_CLI_DONE_OK__')).catch(error=>print('__PI_CLI_DONE_ERR__',error.stack||error.message||String(error)))`.replace(/\s*\n\s*/g, " ");
}

export function buildEnsureLiveCloneAuthCommand(options) {
  const username = options.username ?? "swarm-bot";
  const password = options.password ?? "ci-password";
  return buildCliCommand(`
    const username=${JSON.stringify(username)};
    const password=${JSON.stringify(password)};
    const sanitizeName=(value,fallback)=>String(value||fallback).replace(/[^A-Za-z0-9_.-]/g,'_').slice(0,80);
    const userIdForName=name=>sanitizeName(name,name)||'benchmark-user';
    const toArray=async(result)=>Array.isArray(result)?result:(result&&result.toArray?await result.toArray():[]);
    const findUserByNameOrId=async(name)=>await storage.db.users.findOne({username:name})||await storage.db.users.findOne({_id:userIdForName(name)});
    const normalizeUser=async(user, fallbackName)=>{
      if(!user||!user._id) return null;
      const patch={active:10000,cpu:Number(user.cpu)||100,cpuAvailable:Number(user.cpuAvailable)||10000,rooms:Array.isArray(user.rooms)?user.rooms:[]};
      if(!user.username&&fallbackName) patch.username=fallbackName;
      const name=patch.username||user.username||fallbackName;
      if(name) patch.usernameLower=String(name).toLowerCase();
      await storage.db.users.update({_id:user._id},{$set:patch});
      return storage.db.users.findOne({_id:user._id});
    };
    let user=await findUserByNameOrId(username);
    if(!user){ await storage.db.users.insert({_id:userIdForName(username),username,usernameLower:String(username).toLowerCase(),cpu:100,gcl:1,active:10000,cpuAvailable:10000,bot:username,rooms:[]}); user=await findUserByNameOrId(username); }
    user=await normalizeUser(user, username);
    if(!user||!user._id) throw new Error('Unable to ensure benchmark auth user '+username);
    await setPassword(username,password);
    user=await storage.db.users.findOne({_id:user._id});
    if(!user.password||!user.salt) throw new Error('Password hash missing for benchmark auth user '+username);
    const codeQuery={user:''+user._id,activeWorld:true};
    const code=await storage.db['users.code'].findOne(codeQuery);
    const emptyModules={main:''};
    if(!code){ await storage.db['users.code'].insert({...codeQuery,modules:emptyModules,branch:'default',activeSim:true}); }
    else if(!code.modules||typeof code.modules.main!=='string'){ await storage.db['users.code'].update({_id:code._id},{$set:{modules:emptyModules,branch:code.branch||'default',activeSim:true}}); }
    const memoryKey=storage.env.keys.MEMORY+user._id;
    const rawMemory=await storage.env.get(memoryKey);
    if(!rawMemory||rawMemory==='undefined') await storage.env.set(memoryKey,'{}');
    else { try{ JSON.parse(rawMemory); } catch(error){ await storage.env.set(memoryKey,'{}'); } }
    const controllers=await toArray(await storage.db['rooms.objects'].find({type:'controller'}));
    for(const controller of controllers){
      if(!controller||!controller.user||controller.user==='2') continue;
      let owner=await storage.db.users.findOne({_id:controller.user});
      if(!owner){ const ownerName='BenchmarkUser_'+sanitizeName(controller.user,'unknown'); await storage.db.users.insert({_id:''+controller.user,username:ownerName,usernameLower:ownerName.toLowerCase(),cpu:100,gcl:1,active:10000,cpuAvailable:10000,rooms:[]}); owner=await storage.db.users.findOne({_id:controller.user}); }
      await normalizeUser(owner, owner&&owner.username?owner.username:undefined);
    }
  `);
}

export function buildSeedLiveCloneCommand(options, snapshotInput) {
  const snapshot = compactSnapshotForCli(snapshotInput);
  const username = options.username ?? "swarm-bot";
  const password = options.password ?? "ci-password";

  const body = `
    const snapshot=${JSON.stringify(snapshot)};
    const username=${JSON.stringify(username)};
    const password=${JSON.stringify(password)};
    const sourceUser=(snapshot.source&&snapshot.source.user)||username;
    const SOURCE_ENERGY=1500;
    const ENERGY_REGEN_TIME=300;
    const plainTerrain='0'.repeat(2500);
    const toArray=async(result)=>Array.isArray(result)?result:(result&&result.toArray?await result.toArray():[]);
    const isRoomName=value=>typeof value==='string'&&/^[WE]\\d+[NS]\\d+$/.test(value);
    const roomMap=snapshot.roomMapping||{};
    const mapRoom=room=>roomMap[room]||room;
    const sanitizeName=(value,fallback)=>String(value||fallback).replace(/[^A-Za-z0-9_.-]/g,'_').slice(0,80);
    const userIdForName=name=>sanitizeName(name,name)||'benchmark-user';
    const findUserByNameOrId=async(name)=>await storage.db.users.findOne({username:name})||await storage.db.users.findOne({_id:userIdForName(name)});
    const supportedStructureTypes=new Set(['constructedWall','road','container','spawn','extension','rampart','storage','terminal','extractor','tower','lab','link','observer','powerSpawn']);
    const skippedUnsupportedStructureTypes={};
    const structureCapacity=type=>({spawn:300,extension:50,tower:1000,storage:1000000,terminal:300000,link:800,lab:3000,container:2000,powerSpawn:5000}[type]||0);
    const bodyObjects=parts=>(Array.isArray(parts)&&parts.length?parts:['move','carry','work']).slice(0,50).map(part=>{ const pieces=String(part).split(':'); const obj={type:pieces[0],hits:100}; if(pieces[1]) obj.boost=pieces[1]; return obj; });
    const ensureUser=async(name)=>{ let user=await findUserByNameOrId(name); if(!user){ await storage.db.users.insert({_id:userIdForName(name),username:name,usernameLower:String(name).toLowerCase(),cpu:100,gcl:Math.max(1,Number(snapshot.roomCount)||1),active:10000,cpuAvailable:10000,bot:name,rooms:[]}); user=await findUserByNameOrId(name); } if(!user||!user._id) throw new Error('Unable to create benchmark user '+name); await storage.db.users.update({_id:user._id},{$set:{username:name,usernameLower:String(name).toLowerCase(),active:10000,cpu:100,cpuAvailable:10000,bot:name,gcl:Math.max(1,Number(snapshot.roomCount)||1),rooms:Array.isArray(user.rooms)?user.rooms:[]}}); return (await findUserByNameOrId(name))||user; };
    const externalUsers={};
    const ensureExternalUser=async(name)=>{ if(!name) return null; if(name===sourceUser) return botUser; if(externalUsers[name]) return externalUsers[name]; let user=await findUserByNameOrId(name); if(!user){ await storage.db.users.insert({_id:userIdForName(name),username:name,usernameLower:String(name).toLowerCase(),cpu:100,gcl:1,active:10000,cpuAvailable:10000,bot:name,rooms:[]}); user=await findUserByNameOrId(name); } if(!user||!user._id) throw new Error('Unable to create benchmark external user '+name); await storage.db.users.update({_id:user._id},{$set:{username:name,usernameLower:String(name).toLowerCase(),rooms:Array.isArray(user.rooms)?user.rooms:[],active:10000,cpu:Number(user.cpu)||100,cpuAvailable:Number(user.cpuAvailable)||10000}}); externalUsers[name]=(await findUserByNameOrId(name))||user; return externalUsers[name]; };
    const upsertObject=async(query,doc)=>{ const existing=await storage.db['rooms.objects'].findOne(query); if(existing&&existing._id){ await storage.db['rooms.objects'].update({_id:existing._id},{$set:doc}); return existing._id; } await storage.db['rooms.objects'].insert(doc); const created=await storage.db['rooms.objects'].findOne(query); return created&&created._id; };
    const ensureRoom=async(roomName)=>{ let room=await storage.db.rooms.findOne({_id:roomName}); if(!room) await storage.db.rooms.insert({_id:roomName,status:'normal',sourceKeepers:false}); else await storage.db.rooms.update({_id:roomName},{$set:{status:'normal',sourceKeepers:false}}); const terrain=await storage.db['rooms.terrain'].findOne({room:roomName}); if(!terrain) await storage.db['rooms.terrain'].insert({room:roomName,terrain:plainTerrain}); else await storage.db['rooms.terrain'].update({room:roomName},{$set:{terrain:plainTerrain}}); await map.openRoom(roomName); };
    const ownerId=async(owner)=>{ if(!owner) return undefined; const user=owner===sourceUser?botUser:await ensureExternalUser(owner); return user&&user._id?''+user._id:undefined; };
    const botUser=await ensureUser(username);
    await setPassword(username,password);
    const activeCode=await storage.db['users.code'].findOne({user:''+botUser._id,activeWorld:true});
    if(!activeCode){ await storage.db['users.code'].insert({user:''+botUser._id,modules:{main:''},branch:'default',activeWorld:true,activeSim:true}); }
    else if(!activeCode.modules||typeof activeCode.modules.main!=='string'){ await storage.db['users.code'].update({_id:activeCode._id},{$set:{modules:{main:''},branch:activeCode.branch||'default',activeSim:true}}); }
    let spawnIndex=1;
    let creepIndex=1;
    for(const sourceRoom of snapshot.rooms||[]){
      const roomName=sourceRoom.benchmarkName;
      if(!isRoomName(roomName)) continue;
      await ensureRoom(roomName);
      const sourceOwned=(sourceRoom.controller&&sourceRoom.controller.owner===sourceUser)||((sourceRoom.majorStructures||[]).some(s=>s&&s.owner===sourceUser&&s.type==='spawn'));
      const controllerUser=sourceOwned?''+botUser._id:await ownerId(sourceRoom.controller&&sourceRoom.controller.owner);
      const controllerLevel=Math.max(sourceOwned?1:0, Number(sourceRoom.controller&&sourceRoom.controller.level)||0);
      await upsertObject({type:'controller',room:roomName},{type:'controller',room:roomName,x:Number(sourceRoom.controller&&sourceRoom.controller.x)||25,y:Number(sourceRoom.controller&&sourceRoom.controller.y)||40,level:controllerLevel,user:controllerUser,progress:0,downgradeTime:null,safeMode:sourceOwned?20000:undefined});
      const sources=Array.isArray(sourceRoom.sources)&&sourceRoom.sources.length?sourceRoom.sources:[{x:10,y:10},{x:40,y:10}];
      for(let i=0;i<sources.length;i++){ const src=sources[i]; await upsertObject({type:'source',room:roomName,x:Number(src.x)||10+i*20,y:Number(src.y)||10},{type:'source',room:roomName,x:Number(src.x)||10+i*20,y:Number(src.y)||10,energy:Number(src.energy)||SOURCE_ENERGY,energyCapacity:Number(src.energyCapacity)||SOURCE_ENERGY,ticksToRegeneration:ENERGY_REGEN_TIME}); }
      for(let i=0;i<(sourceRoom.minerals||[]).length;i++){ const mineral=sourceRoom.minerals[i]; await upsertObject({type:'mineral',room:roomName,x:Number(mineral.x)||20,y:Number(mineral.y)||20},{type:'mineral',room:roomName,x:Number(mineral.x)||20,y:Number(mineral.y)||20,mineralType:mineral.mineralType||'H',mineralAmount:3000,density:2,ticksToRegeneration:0}); }
      for(const structure of sourceRoom.majorStructures||[]){
        const type=structure.type==='wall'?'constructedWall':structure.type;
        if(!type||type==='controller') continue;
        if(!supportedStructureTypes.has(type)){ skippedUnsupportedStructureTypes[type]=(skippedUnsupportedStructureTypes[type]||0)+1; continue; }
        const user=await ownerId(structure.owner);
        const capacity=structureCapacity(type);
        const store=structure.store&&typeof structure.store==='object'?structure.store:{};
        const energy=Number(store.energy??structure.energy??(type==='spawn'||type==='extension'?capacity:0))||0;
        const doc={type,room:roomName,x:Number(structure.x)||25,y:Number(structure.y)||25,user,energy,energyCapacity:capacity||undefined,store:{...store, ...(capacity?{energy}: {})},storeCapacityResource:capacity?{energy:capacity}:undefined,hits:Number(structure.hits)||1000,hitsMax:Number(structure.hitsMax)||1000,notifyWhenAttacked:false,cooldown:Number(structure.cooldown)||0};
        if(type==='spawn') doc.name=sanitizeName(structure.name, 'Spawn'+(spawnIndex++));
        if(type==='lab'&&structure.mineralType) doc.mineralType=structure.mineralType;
        await upsertObject({type,room:roomName,x:doc.x,y:doc.y},doc);
      }
      const creepGroups=[...(sourceRoom.creeps&&sourceRoom.creeps.mine||[]),...(sourceRoom.creeps&&sourceRoom.creeps.allies||[]),...(sourceRoom.creeps&&sourceRoom.creeps.hostiles||[])];
      for(const creep of creepGroups){
        const owner=creep.mine?sourceUser:creep.owner;
        const user=await ownerId(owner);
        if(!user) continue;
        const body=bodyObjects(creep.bodyParts);
        const hitsMax=body.length*100;
        const memory=creep.mine?{role:creep.role||'harvester',homeRoom:roomName,home_room:roomName,current_room:roomName,targetRoom:isRoomName(creep.targetRoom)?mapRoom(creep.targetRoom):undefined,benchmarkClone:true}:{};
        const name=sanitizeName(creep.name, 'BenchmarkCreep'+(creepIndex++));
        await upsertObject({type:'creep',room:roomName,name},{type:'creep',room:roomName,name,x:Number(creep.x)||25,y:Number(creep.y)||25,user,body,hits:Math.min(Number(creep.hits)||hitsMax,hitsMax),hitsMax,fatigue:0,spawning:false,ticksToLive:Number(creep.ttl)||1500,notifyWhenAttacked:false,memory});
      }
    }
    const gameTime=typeof common!=='undefined'&&common.getGametime?await common.getGametime():0;
    const memoryKey=storage.env.keys.MEMORY+botUser._id;
    const seededRooms={};
    for(const sourceRoom of snapshot.rooms||[]){ if(!isRoomName(sourceRoom.benchmarkName)) continue; seededRooms[sourceRoom.benchmarkName]={swarm:{posture:'eco',danger:(sourceRoom.creeps&&sourceRoom.creeps.hostileCount>0)?2:0}}; }
    const memory={rooms:seededRooms,screepsBenchmark:{mode:'live-structural-clone',schemaVersion:snapshot.schemaVersion,source:snapshot.source,roomMapping:snapshot.roomMapping,roomCount:snapshot.roomCount,seededAt:gameTime,unsupportedStructureTypesSkipped:skippedUnsupportedStructureTypes},screepsmodTestingScenarios:{names:['live-structural-clone'],seededAt:gameTime,rooms:{home:(snapshot.rooms||[]).find(r=>r.benchmarkName)?.benchmarkName}}};
    await storage.env.set(memoryKey,JSON.stringify(memory));
    const controllers=await toArray(await storage.db['rooms.objects'].find({type:'controller'}));
    for(const controller of controllers){ if(!controller||!controller.user||controller.user==='2') continue; let owner=await storage.db.users.findOne({_id:controller.user}); if(!owner){ const ownerName='BenchmarkUser_'+sanitizeName(controller.user,'unknown'); await storage.db.users.insert({_id:''+controller.user,username:ownerName,usernameLower:ownerName.toLowerCase(),cpu:100,gcl:1,active:10000,cpuAvailable:10000,rooms:[]}); owner=await storage.db.users.findOne({_id:controller.user}); } if(owner&&!Array.isArray(owner.rooms)) await storage.db.users.update({_id:owner._id},{$set:{rooms:[],active:10000,cpu:Number(owner.cpu)||100,cpuAvailable:Number(owner.cpuAvailable)||10000}}); }
    await map.updateTerrainData();
  `;
  return buildCliCommand(body);
}

export async function ensureLiveCloneAuth(options, summary, cliEval) {
  if (!options.liveCloneSnapshot) return;
  const output = await cliEval(options, buildEnsureLiveCloneAuthCommand(options), 60000);
  if (!output.includes("__PI_CLI_DONE_OK__") || output.includes("__PI_CLI_DONE_ERR__")) {
    throw new Error(`Failed to ensure live clone benchmark auth. CLI output:\n${output}`);
  }
  summary.checks.liveCloneAuthReady = true;
}

export async function seedLiveCloneSnapshot(options, summary, cliEval) {
  if (!options.liveCloneSnapshot) {
    summary.checks.liveCloneSeeded = false;
    return;
  }
  const snapshot = loadLiveCloneSnapshot(options.liveCloneSnapshot);
  const output = await cliEval(options, buildSeedLiveCloneCommand(options, snapshot), 120000);
  if (!output.includes("__PI_CLI_DONE_OK__") || output.includes("__PI_CLI_DONE_ERR__")) {
    throw new Error(`Failed to seed live structural clone. CLI output:\n${output}`);
  }
  summary.checks.liveCloneSeeded = true;
  summary.metrics.liveClone = {
    snapshotPath: options.liveCloneSnapshot,
    source: safeObject(snapshot.source),
    roomCount: snapshot.roomCount ?? snapshot.rooms.length,
    roomMapping: snapshot.roomMapping ?? {},
  };
}
