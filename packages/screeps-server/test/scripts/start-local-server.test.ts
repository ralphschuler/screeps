import { expect } from 'chai';
import {
  isLoopbackHost,
  validateLocalServerCredentials
} from '../../scripts/start-local-server.js';

describe('start-local-server credential validation', () => {
  it('allows loopback hosts with default local credentials', () => {
    expect(() => validateLocalServerCredentials({
      host: '127.0.0.1',
      serverPassword: 'ci-password',
      password: 'ci-password'
    })).not.to.throw();
    expect(() => validateLocalServerCredentials({
      host: 'localhost',
      serverPassword: 'ci-password',
      password: 'ci-password'
    })).not.to.throw();
    expect(() => validateLocalServerCredentials({
      host: '::1',
      serverPassword: 'ci-password',
      password: 'ci-password'
    })).not.to.throw();
  });

  it('rejects LAN binds when server or bot password still uses the default', () => {
    expect(() => validateLocalServerCredentials({
      host: '0.0.0.0',
      serverPassword: 'ci-password',
      password: 'bot-secret'
    })).to.throw(/default credentials/i);

    expect(() => validateLocalServerCredentials({
      host: '192.168.1.20',
      serverPassword: 'server-secret',
      password: 'ci-password'
    })).to.throw(/default credentials/i);
  });

  it('allows LAN binds with explicit non-default server and bot passwords', () => {
    expect(() => validateLocalServerCredentials({
      host: '0.0.0.0',
      serverPassword: 'server-secret',
      password: 'bot-secret'
    })).not.to.throw();
  });

  it('classifies non-loopback bind hosts as shared-network hosts', () => {
    expect(isLoopbackHost('127.0.0.1')).to.equal(true);
    expect(isLoopbackHost('127.12.34.56')).to.equal(true);
    expect(isLoopbackHost('0.0.0.0')).to.equal(false);
    expect(isLoopbackHost('192.168.1.20')).to.equal(false);
    expect(isLoopbackHost('screeps.local')).to.equal(false);
  });
});
