import net from 'node:net';

export const DEFAULT_LOCAL_PASSWORD = 'ci-password';

export function parseTickRate(value, name = 'tickRate') {
  const tickRate = Number(value);
  if (!Number.isInteger(tickRate) || tickRate <= 0 || tickRate > 1000) {
    throw new Error(`${name} must be a positive integer between 1 and 1000 ms`);
  }
  return tickRate;
}

export function isLoopbackHost(host) {
  const normalizedHost = String(host ?? '').trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (normalizedHost === 'localhost') return true;
  if (normalizedHost === '::1') return true;

  if (net.isIP(normalizedHost) === 4) {
    return normalizedHost.startsWith('127.');
  }

  return false;
}

export function validateLocalServerCredentials({ host, serverPassword: configuredServerPassword, password: configuredPassword }) {
  if (isLoopbackHost(host)) return;

  const defaultCredentialNames = [];
  if (configuredServerPassword === DEFAULT_LOCAL_PASSWORD) defaultCredentialNames.push('serverPassword');
  if (configuredPassword === DEFAULT_LOCAL_PASSWORD) defaultCredentialNames.push('password');
  if (defaultCredentialNames.length === 0) return;

  throw new Error([
    'Refusing to bind the local Screeps server to a shared-network interface with default credentials.',
    `Host: ${host}`,
    `Default credentials still in use: ${defaultCredentialNames.join(', ')}`,
    'Loopback development remains allowed with defaults: npm run server:local:up',
    'Safe LAN opt-in requires explicit non-default passwords:',
    '  npm run server:local:up -- --serverHost=0.0.0.0 --serverPassword=<strong-server-password> --password=<strong-bot-password>',
    'Shared-network risk: anyone who can reach this host/port may access the local Screeps server.'
  ].join('\n'));
}

function defaultSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function executeCliOverSocket({ apiHost, cliPort }, command, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: apiHost, port: cliPort });
    let output = '';
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Timed out waiting for CLI command result. Output:\n${output}`));
    }, timeoutMs);

    socket.on('data', chunk => {
      output += chunk.toString();
      if (output.includes('__PI_CLI_DONE_')) {
        clearTimeout(timeout);
        socket.end();
        resolve(output);
      }
    });
    socket.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });
    socket.on('connect', () => {
      socket.write(`${command}\n`);
    });
  });
}

export function buildTerrainSetupCommand({ shardName, tickRate }) {
  return `Promise.resolve().then(async () => { await storage.env.set('shardName', ${JSON.stringify(shardName)}); await storage.env.set(storage.env.keys.MAIN_LOOP_MIN_DURATION, ${JSON.stringify(tickRate)}); await storage.env.set('tickRate', ${JSON.stringify(tickRate)}); if (storage.pubsub) storage.pubsub.publish('setTickRate', ${JSON.stringify(tickRate)}); const plainTerrain='0'.repeat(2500); const toArray=async(result)=>Array.isArray(result)?result:(result&&result.toArray?await result.toArray():[]); const hasUsableTerrain=terrain=>typeof terrain==='string'&&terrain.length===2500; const ensureNormalRoomTerrainData=async()=>{ const rooms=await toArray(await storage.db.rooms.find({status:'normal'})); const activeRooms=storage.env&&storage.env.smembers&&storage.env.keys&&storage.env.keys.ACTIVE_ROOMS?await toArray(await storage.env.smembers(storage.env.keys.ACTIVE_ROOMS)):[]; const roomNames=new Set(); for (const room of rooms) { if(room&&room._id) roomNames.add(room._id); } for (const activeRoomName of activeRooms) { if(typeof activeRoomName==='string'&&/^[WE]\\d+[NS]\\d+$/.test(activeRoomName)) roomNames.add(activeRoomName); } for (const roomName of roomNames) { const room=await storage.db.rooms.findOne({_id:roomName}); if(!room){ await storage.db.rooms.insert({_id:roomName,status:'normal',sourceKeepers:false}); } else if(room.status!=='normal'){ await storage.db.rooms.update({_id:roomName},{$set:{status:'normal'}}); } const terrainRecord=await storage.db['rooms.terrain'].findOne({room:roomName}); if(!terrainRecord){ await storage.db['rooms.terrain'].insert({room:roomName,terrain:plainTerrain}); } else if(!hasUsableTerrain(terrainRecord.terrain)){ await storage.db['rooms.terrain'].update({room:roomName},{$set:{terrain:plainTerrain}}); } } if(storage.env&&storage.env.keys&&storage.env.keys.ACCESSIBLE_ROOMS){ await storage.env.set(storage.env.keys.ACCESSIBLE_ROOMS,JSON.stringify(Array.from(roomNames))); } }; await ensureNormalRoomTerrainData(); await map.updateTerrainData(); }).then(() => print('__PI_CLI_DONE_OK__')).catch(error => print('__PI_CLI_DONE_ERR__', error.stack || error.message || String(error)))`;
}

export function createServerControlPlane(options) {
  const apiHost = options.apiHost ?? '127.0.0.1';
  const serverPort = options.serverPort ?? 21025;
  const cliPort = options.cliPort ?? 21026;
  const shardName = options.shardName ?? 'shard0';
  const tickRate = parseTickRate(options.tickRate ?? 20);
  const sleep = options.sleep ?? defaultSleep;
  const fetchTransport = options.fetchTransport ?? fetch;
  const cliTransport = options.cliTransport ?? ((command, timeoutMs) => executeCliOverSocket({ apiHost, cliPort }, command, timeoutMs));

  return {
    async waitForHttpReady(timeoutMs = 180000) {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        try {
          const res = await fetchTransport(`http://${apiHost}:${serverPort}/`);
          if (res.ok || res.status < 500) return;
        } catch {}
        await sleep(5000);
      }
      throw new Error('Timed out waiting for Screeps HTTP server readiness');
    },

    executeCli(command, timeoutMs = 30000) {
      return cliTransport(command, timeoutMs);
    },

    async ensureTerrainData() {
      const output = await cliTransport(buildTerrainSetupCommand({ shardName, tickRate }), 60000);
      if (!output.includes('__PI_CLI_DONE_OK__') || output.includes('__PI_CLI_DONE_ERR__')) {
        throw new Error(`Failed to ensure world terrain cache. CLI output:\n${output}`);
      }
    }
  };
}
