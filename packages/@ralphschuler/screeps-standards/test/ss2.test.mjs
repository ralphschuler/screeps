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

test('parseTransaction keeps pipe characters inside payload chunks', () => {
  assert.deepEqual(SS2TerminalComms.parseTransaction('a9Z|12|payload|with|pipes'), {
    msgId: 'a9Z',
    packetId: 12,
    finalPacket: undefined,
    messageChunk: 'payload|with|pipes'
  });
});

test('parseTransaction only reads the final packet marker from packet zero', () => {
  assert.deepEqual(SS2TerminalComms.parseTransaction('abc|1|2|world'), {
    msgId: 'abc',
    packetId: 1,
    finalPacket: undefined,
    messageChunk: '2|world'
  });
});

test('parseTransaction keeps pipe characters after a packet-zero final marker', () => {
  assert.deepEqual(SS2TerminalComms.parseTransaction('abc|0|2|hello|with|pipes'), {
    msgId: 'abc',
    packetId: 0,
    finalPacket: 2,
    messageChunk: 'hello|with|pipes'
  });
});

test('parseTransaction treats an incomplete packet-zero marker as payload', () => {
  assert.deepEqual(SS2TerminalComms.parseTransaction('abc|0|2|'), {
    msgId: 'abc',
    packetId: 0,
    finalPacket: undefined,
    messageChunk: '2|'
  });
});

test('parseTransaction rejects malformed descriptions', () => {
  assert.equal(SS2TerminalComms.parseTransaction(''), null);
  assert.equal(SS2TerminalComms.parseTransaction('toolong|0|message'), null);
  assert.equal(SS2TerminalComms.parseTransaction('abc|100|message'), null);
  assert.equal(SS2TerminalComms.parseTransaction('abc|0|'), null);
});
