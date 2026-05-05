import { strict as assert } from 'node:assert';
import test from 'node:test';
import { SS2TerminalComms } from '../dist/index.js';

test('parseTransaction parses first packet with final packet marker', () => {
  assert.deepEqual(SS2TerminalComms.parseTransaction('abc|0|2|hello'), {
    msgId: 'abc',
    packetId: 0,
    finalPacket: 2,
    messageChunk: 'hello'
  });
});

test('parseTransaction parses continuation packet', () => {
  assert.deepEqual(SS2TerminalComms.parseTransaction('abc|1|world'), {
    msgId: 'abc',
    packetId: 1,
    finalPacket: undefined,
    messageChunk: 'world'
  });
});

test('parseTransaction rejects malformed descriptions', () => {
  assert.equal(SS2TerminalComms.parseTransaction(''), null);
  assert.equal(SS2TerminalComms.parseTransaction('toolong|0|message'), null);
  assert.equal(SS2TerminalComms.parseTransaction('abc|100|message'), null);
  assert.equal(SS2TerminalComms.parseTransaction('abc|0|'), null);
});
