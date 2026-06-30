import { expect } from 'chai';
import {
  buildTerrainSetupCommand,
  createServerControlPlane,
  isLoopbackHost,
  parseTickRate,
  validateLocalServerCredentials
} from '../../scripts/server-control-plane.js';

describe('server-control-plane module', () => {
  it('validates tick-rate and local credential policy', () => {
    expect(parseTickRate('10')).to.equal(10);
    expect(() => parseTickRate('0')).to.throw('positive integer');
    expect(isLoopbackHost('127.0.0.1')).to.equal(true);
    expect(isLoopbackHost('0.0.0.0')).to.equal(false);
    expect(() => validateLocalServerCredentials({
      host: '0.0.0.0',
      serverPassword: 'ci-password',
      password: 'ci-password'
    })).to.throw('Refusing to bind');
  });

  it('builds terrain setup that repairs missing normal-room terrain before refreshing map caches', () => {
    const command = buildTerrainSetupCommand({ shardName: 'shard0', tickRate: 10 });

    expect(command).to.contain("storage.env.set('shardName'");
    expect(command).to.contain('MAIN_LOOP_MIN_DURATION');
    expect(command).to.contain('setTickRate');
    expect(command).to.contain("storage.db.rooms.find({status:'normal'})");
    expect(command).to.contain('storage.env.smembers(storage.env.keys.ACTIVE_ROOMS)');
    expect(command).to.contain("storage.db.rooms.insert({_id:roomName,status:'normal',sourceKeepers:false})");
    expect(command).to.contain("storage.db['rooms.terrain'].insert({room:roomName,terrain:plainTerrain})");
    expect(command).to.contain("storage.env.set(storage.env.keys.ACCESSIBLE_ROOMS,JSON.stringify(Array.from(roomNames)))");
    expect(command.indexOf('ensureNormalRoomTerrainData()')).to.be.lessThan(
      command.indexOf('map.updateTerrainData()'),
    );
  });

  it('executes terrain setup through an injected CLI transport', async () => {
    const commands: string[] = [];
    const plane = createServerControlPlane({
      apiHost: '127.0.0.1',
      serverPort: 21025,
      cliPort: 21026,
      shardName: 'shard0',
      tickRate: 10,
      cliTransport: async command => {
        commands.push(command);
        return '__PI_CLI_DONE_OK__';
      }
    });

    await plane.ensureTerrainData();

    expect(commands).to.have.length(1);
    expect(commands[0]).to.equal(buildTerrainSetupCommand({ shardName: 'shard0', tickRate: 10 }));
  });

  it('fails terrain setup when CLI reports an error', async () => {
    const plane = createServerControlPlane({
      apiHost: '127.0.0.1',
      serverPort: 21025,
      cliPort: 21026,
      shardName: 'shard0',
      tickRate: 10,
      cliTransport: async () => '__PI_CLI_DONE_ERR__ boom'
    });

    let error: Error | null = null;
    try {
      await plane.ensureTerrainData();
    } catch (caught) {
      error = caught as Error;
    }

    expect(error?.message).to.contain('Failed to ensure world terrain cache');
  });

  it('waits for HTTP readiness through an injected fetch transport', async () => {
    let attempts = 0;
    const plane = createServerControlPlane({
      apiHost: '127.0.0.1',
      serverPort: 21025,
      cliPort: 21026,
      shardName: 'shard0',
      tickRate: 10,
      fetchTransport: async () => ({ ok: ++attempts === 2, status: attempts === 1 ? 503 : 200 }),
      sleep: async () => undefined
    });

    await plane.waitForHttpReady(1000);

    expect(attempts).to.equal(2);
  });
});
