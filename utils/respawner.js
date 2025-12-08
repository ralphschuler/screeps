const https = require('https');

// Configuration constants
const SPAWN_SEARCH_RADIUS = 3; // Rooms to search in each direction from starting room
const SHARD_SCORE_TICK_DIVISOR = 1000; // Divisor for normalizing tick count in shard scoring

/**
 * Get authentication headers for Screeps API
 * When using a token, it serves as both X-Token and X-Username
 *
 * @return {object}
 */
function getAuthHeaders() {
  const token = process.env.SCREEPS_TOKEN;
  if (token) {
    return {
      'X-Token': token,
      'X-Username': token,
    };
  }
  // Fallback to username/password if no token
  return {
    'X-Username': process.env.SCREEPS_USER || '',
    'X-Password': process.env.SCREEPS_PASS || '',
  };
}

/**
 * getWorldStatus
 *
 * @return {object}
 */
function getWorldStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.SCREEPS_HOSTNAME || 'screeps.com',
      port: 443,
      path: '/api/user/world-status',
      method: 'GET',
      headers: getAuthHeaders(),
    };
    https.get(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse world status: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Error fetching world status: ${err.message}`));
    });
  });
}

/**
 * respawn
 *
 * @return {object}
 */
function respawn() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.SCREEPS_HOSTNAME || 'screeps.com',
      port: 443,
      path: '/api/user/respawn',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': 0,
        ...getAuthHeaders(),
      },
    };
    const req = https.request(options, (resp) => {
      console.log(`Respawn STATUS: ${resp.statusCode}`);
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse respawn response: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Error during respawn: ${err.message}`));
    });
    req.write('');
    req.end();
  });
}

/**
 * getShards
 *
 * @return {object}
 */
function getShards() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.SCREEPS_HOSTNAME || 'screeps.com',
      port: 443,
      path: '/api/game/shards/info',
      method: 'GET',
      headers: getAuthHeaders(),
    };
    https.get(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse shards info: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Error fetching shards: ${err.message}`));
    });
  });
}

/**
 * getWorldStartRooms
 *
 * @param {string} shardName
 * @return {object}
 */
function getWorldStartRooms(shardName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.SCREEPS_HOSTNAME || 'screeps.com',
      port: 443,
      path: `/api/user/world-start-room?shard=${shardName}`,
      method: 'GET',
      headers: getAuthHeaders(),
    };
    https.get(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log(`Start rooms for ${shardName}:`, data);
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse start rooms: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Error fetching start rooms: ${err.message}`));
    });
  });
}

/**
 * placeSpawn
 *
 * @param {string} room
 * @param {string} shard
 * @return {object}
 */
function placeSpawn(room, shard) {
  return new Promise((resolve, reject) => {
    const dataObject = {
      room: room,
      name: 'Spawn1',
      x: 25,
      y: 25,
      shard: shard,
    };
    console.log('Attempting to place spawn:', dataObject);
    const data = JSON.stringify(dataObject);
    const options = {
      hostname: process.env.SCREEPS_HOSTNAME || 'screeps.com',
      port: 443,
      path: '/api/game/place-spawn',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        ...getAuthHeaders(),
      },
    };
    const req = https.request(options, (resp) => {
      console.log(`Place spawn STATUS: ${resp.statusCode}`);
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`Response: ${data}`);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse place spawn response: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Error placing spawn: ${err.message}`));
    });
    req.write(data);
    req.end();
  });
}

/**
 * findRoomAndSpawn
 *
 * @param {Array} shardsReduced
 * @return {Promise<boolean>}
 */
async function findRoomAndSpawn(shardsReduced) {
  for (const shard of shardsReduced) {
    console.log(`Trying shard ${shard.name} (score: ${shard.value.toFixed(4)})`);
    const rooms = await getWorldStartRooms(shard.name);
    for (const roomCenter of rooms.room) {
      const matcher = /(\D+)(\d+)(\D+)(\d+)/;
      const result = roomCenter.match(matcher);
      if (!result) {
        console.log(`✗ Failed to parse room name: ${roomCenter}`);
        continue;
      }
      for (let x = -SPAWN_SEARCH_RADIUS; x < SPAWN_SEARCH_RADIUS; x++) {
        for (let y = -SPAWN_SEARCH_RADIUS; y < SPAWN_SEARCH_RADIUS; y++) {
          const xValue = x + parseInt(result[2], 10);
          const yValue = y + parseInt(result[4], 10);
          const room = `${result[1]}${xValue}${result[3]}${yValue}`;
          const response = await placeSpawn(room, shard.name);
          if (!response.error) {
            console.log(`✓ Successfully placed spawn in ${room} on ${shard.name}`);
            return true;
          } else {
            console.log(`✗ Failed to place spawn in ${room}: ${response.error}`);
          }
        }
      }
    }
  }
  console.log('✗ Failed to place spawn in any available room');
  return false;
}

/**
 * main
 *
 * @return {void}
 */
async function main() {
  console.log('=== Screeps Auto-Respawner ===');
  console.log(`Server: ${process.env.SCREEPS_HOSTNAME || 'screeps.com'}`);
  
  // Validate environment variables
  if (!process.env.SCREEPS_TOKEN && !process.env.SCREEPS_USER) {
    console.error('✗ Error: SCREEPS_TOKEN or SCREEPS_USER must be set');
    process.exit(1);
  }

  try {
    const worldStatus = await getWorldStatus();
    console.log('World status:', JSON.stringify(worldStatus));
    
    if (!['empty', 'lost'].includes(worldStatus.status)) {
      console.log(`✓ Not respawning, world status is: ${worldStatus.status}`);
      console.log('✓ Respawner check completed - no action needed');
      return;
    }

    console.log(`⚠ World status is ${worldStatus.status}, initiating respawn...`);
    const response = await respawn();
    console.log('Respawn response:', JSON.stringify(response));

    if (response.error) {
      throw new Error(`Respawn API returned error: ${response.error}`);
    }

    console.log('Fetching available shards...');
    const shardsInfo = await getShards();
    const shards = shardsInfo.shards.filter((shard) => shard.cpuLimit === 0);
    
    if (shards.length === 0) {
      throw new Error('No available shards found');
    }

    const shardsReduced = shards.map((shard) => {
      return {
        name: shard.name,
        rooms: shard.rooms,
        user: shard.users,
        tick: shard.tick,
        // Score calculation: higher score = more rooms, fewer users, older shard (more established)
        value: shard.rooms / shard.users / (shard.tick / SHARD_SCORE_TICK_DIVISOR),
      };
    });
    shardsReduced.sort((a, b) => b.value - a.value);

    console.log(`Found ${shardsReduced.length} candidate shard(s)`);
    const success = await findRoomAndSpawn(shardsReduced);

    if (!success) {
      throw new Error('Failed to place spawn in any available room');
    }

    console.log('✓ Respawner completed successfully');
  } catch (error) {
    console.error('✗ Respawner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, getWorldStatus, respawn, getShards, placeSpawn };
