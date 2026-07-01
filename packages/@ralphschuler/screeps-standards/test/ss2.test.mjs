import { strict as assert } from 'node:assert';
import test from 'node:test';
import { SS2TerminalComms } from '../dist/index.js';

function resetScreepsState(incomingTransactions = []) {
  globalThis.Memory = {};
  globalThis.Game = {
    time: 1000,
    market: { incomingTransactions }
  };
  simulateGlobalReset();
}

function simulateGlobalReset() {
  SS2TerminalComms._messageBuffers = null;
  SS2TerminalComms._nextMessageId = null;
  SS2TerminalComms._stateInitialized = false;
}

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

test('processIncomingTransactions completes packet-zero messages without final marker', () => {
  resetScreepsState([
    {
      transactionId: 'tx-single-unmarked',
      time: 1000,
      description: 'abc|0|Hello World',
      sender: { username: 'ally' }
    }
  ]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'Hello World' }
  ]);
});

test('processIncomingTransactions does not emit the same transaction twice', () => {
  resetScreepsState([
    {
      transactionId: 'tx-single-repeat',
      time: 1000,
      description: 'abc|0|0|Hello World',
      sender: { username: 'ally' }
    }
  ]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'Hello World' }
  ]);
  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);
});

test('processIncomingTransactions keeps partial packets available until packet zero arrives', () => {
  resetScreepsState([
    {
      transactionId: 'tx-continuation-first',
      time: 1002,
      description: 'abc|1|World',
      sender: { username: 'ally' }
    }
  ]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);

  Game.time = 1002;
  Game.market.incomingTransactions = [
    {
      transactionId: 'tx-continuation-first',
      time: 1002,
      description: 'abc|1|World',
      sender: { username: 'ally' }
    },
    {
      transactionId: 'tx-first-late',
      time: 1001,
      description: 'abc|0|1|Hello ',
      sender: { username: 'ally' }
    }
  ];

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);
  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'Hello World' }
  ]);
  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);
});

test('processIncomingTransactions keeps processed ids while transactions remain in history', () => {
  resetScreepsState([
    {
      transactionId: 'tx-old-still-visible',
      time: 1000,
      description: 'abc|0|0|Hello World',
      sender: { username: 'ally' }
    }
  ]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'Hello World' }
  ]);

  Game.time = 2001;
  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);
});

test('processIncomingTransactions keeps processed ids across global resets', () => {
  resetScreepsState([
    {
      transactionId: 'tx-processed-before-reset',
      time: 1000,
      description: 'abc|0|0|Hello World',
      sender: { username: 'ally' }
    }
  ]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'Hello World' }
  ]);
  assert.equal(Memory.ss2TerminalComms.processedTransactions['tx-processed-before-reset'], 1000);

  simulateGlobalReset();

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);
});

test('processIncomingTransactions restores partial buffers across global resets', () => {
  const firstPacket = {
    transactionId: 'tx-buffer-before-reset-first',
    time: 1000,
    description: 'abc|0|1|Hello ',
    sender: { username: 'ally' }
  };
  resetScreepsState([firstPacket]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);
  assert.deepEqual(Memory.ss2TerminalComms.messageBuffers['ally:abc'], {
    msgId: 'abc',
    sender: 'ally',
    finalPacket: 1,
    packets: { 0: 'Hello ' },
    receivedAt: 1000,
    firstPacketTime: 1000
  });

  simulateGlobalReset();
  Game.time = 1001;
  Game.market.incomingTransactions = [
    firstPacket,
    {
      transactionId: 'tx-buffer-after-reset-continuation',
      time: 1001,
      description: 'abc|1|World',
      sender: { username: 'ally' }
    }
  ];

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'Hello World' }
  ]);
  assert.deepEqual(Memory.ss2TerminalComms.messageBuffers, {});
});

test('processIncomingTransactions ignores stale continuations from the packet-zero tick', () => {
  const staleContinuation = {
    transactionId: 'tx-same-tick-stale-continuation',
    time: 1005,
    description: 'abc|1|Stale',
    sender: { username: 'ally' }
  };
  resetScreepsState([staleContinuation]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);

  Game.time = 1005;
  Game.market.incomingTransactions = [
    staleContinuation,
    {
      transactionId: 'tx-same-tick-first',
      time: 1005,
      description: 'abc|0|1|Fresh ',
      sender: { username: 'ally' }
    }
  ];

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);
  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);

  Game.time = 1006;
  Game.market.incomingTransactions = [
    ...Game.market.incomingTransactions,
    {
      transactionId: 'tx-same-tick-fresh-continuation',
      time: 1006,
      description: 'abc|1|World',
      sender: { username: 'ally' }
    }
  ];

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'Fresh World' }
  ]);
});

test('processIncomingTransactions ignores stale continuations older than packet zero', () => {
  const staleContinuation = {
    transactionId: 'tx-stale-continuation',
    time: 1000,
    description: 'abc|1|Stale',
    sender: { username: 'ally' }
  };
  resetScreepsState([staleContinuation]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);

  Game.time = 1005;
  Game.market.incomingTransactions = [
    staleContinuation,
    {
      transactionId: 'tx-fresh-first',
      time: 1005,
      description: 'abc|0|1|Fresh ',
      sender: { username: 'ally' }
    }
  ];

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);
  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);

  Game.time = 1006;
  Game.market.incomingTransactions = [
    ...Game.market.incomingTransactions,
    {
      transactionId: 'tx-fresh-continuation',
      time: 1006,
      description: 'abc|1|World',
      sender: { username: 'ally' }
    }
  ];

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'Fresh World' }
  ]);
});

test('processIncomingTransactions restarts buffers when packet zero collides with an incomplete message', () => {
  resetScreepsState([
    {
      transactionId: 'tx-old-first',
      time: 1000,
      description: 'abc|0|1|Old ',
      sender: { username: 'ally' }
    }
  ]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);

  Game.time = 1001;
  Game.market.incomingTransactions = [
    ...Game.market.incomingTransactions,
    {
      transactionId: 'tx-new-first',
      time: 1001,
      description: 'abc|0|0|New',
      sender: { username: 'ally' }
    }
  ];

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'New' }
  ]);

  Game.time = 1002;
  Game.market.incomingTransactions = [
    ...Game.market.incomingTransactions,
    {
      transactionId: 'tx-old-continuation',
      time: 1002,
      description: 'abc|1|Message',
      sender: { username: 'ally' }
    }
  ];

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);
});

test('processIncomingTransactions completes after an out-of-range packet arrives', () => {
  resetScreepsState([
    {
      transactionId: 'tx-first-packet',
      time: 1000,
      description: 'abc|0|1|Hello ',
      sender: { username: 'ally' }
    },
    {
      transactionId: 'tx-out-of-range-packet',
      time: 1000,
      description: 'abc|2|ignored',
      sender: { username: 'ally' }
    }
  ]);

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), []);

  Game.market.incomingTransactions = [
    ...Game.market.incomingTransactions,
    {
      transactionId: 'tx-second-packet',
      time: 1001,
      description: 'abc|1|World',
      sender: { username: 'ally' }
    }
  ];

  assert.deepEqual(SS2TerminalComms.processIncomingTransactions(), [
    { sender: 'ally', message: 'Hello World' }
  ]);
});

test('splitMessage emits parseable SS2 framing for short messages', () => {
  resetScreepsState();

  const packets = SS2TerminalComms.splitMessage('Short message');

  assert.equal(packets.length, 1);
  assert.equal(packets[0].length <= 100, true);
  assert.deepEqual(SS2TerminalComms.parseTransaction(packets[0]), {
    msgId: '000',
    packetId: 0,
    finalPacket: 0,
    messageChunk: 'Short message'
  });
});

test('splitMessage keeps framed packet descriptions within terminal length limit', () => {
  resetScreepsState();

  const packets = SS2TerminalComms.splitMessage('A'.repeat(100));
  const chunks = packets.map(packet => SS2TerminalComms.parseTransaction(packet));

  assert.equal(packets.length, 2);
  assert.equal(packets.every(packet => packet.length <= 100), true);
  assert.equal(chunks.every(Boolean), true);
  assert.equal(chunks.map(chunk => chunk.messageChunk).join(''), 'A'.repeat(100));
});

test('splitMessage supports the largest valid 100-packet SS2 message', () => {
  resetScreepsState();

  const packets = SS2TerminalComms.splitMessage('A'.repeat(9100));
  const chunks = packets.map(packet => SS2TerminalComms.parseTransaction(packet));

  assert.equal(packets.length, 100);
  assert.equal(packets.every(packet => packet.length <= 100), true);
  assert.equal(chunks.every(Boolean), true);
  assert.equal(chunks[0].finalPacket, 99);
  assert.equal(chunks[99].packetId, 99);
  assert.equal(chunks.map(chunk => chunk.messageChunk).join(''), 'A'.repeat(9100));
});

test('splitMessage rejects empty messages', () => {
  resetScreepsState();

  assert.deepEqual(SS2TerminalComms.splitMessage(''), []);
});

test('splitMessage rejects messages that need more than 100 SS2 packets', () => {
  resetScreepsState();

  assert.deepEqual(SS2TerminalComms.splitMessage('A'.repeat(9101)), []);
});

test('sendMessage rejects empty messages', () => {
  resetScreepsState();
  globalThis.RESOURCE_ENERGY = 'energy';
  globalThis.ERR_INVALID_ARGS = -10;
  let sendCalled = false;
  const terminal = {
    id: 'terminal1',
    send: () => {
      sendCalled = true;
      return 0;
    }
  };

  const result = SS2TerminalComms.sendMessage(
    terminal,
    'W1N1',
    globalThis.RESOURCE_ENERGY,
    100,
    ''
  );

  assert.equal(result, globalThis.ERR_INVALID_ARGS);
  assert.equal(sendCalled, false);
  assert.equal(globalThis.Memory.ss2PacketQueue, undefined);
});

test('sendMessage rejects messages that exceed the SS2 packet limit', () => {
  resetScreepsState();
  globalThis.RESOURCE_ENERGY = 'energy';
  globalThis.ERR_INVALID_ARGS = -10;
  let sendCalled = false;
  const terminal = {
    id: 'terminal1',
    send: () => {
      sendCalled = true;
      return 0;
    }
  };

  const result = SS2TerminalComms.sendMessage(
    terminal,
    'W1N1',
    globalThis.RESOURCE_ENERGY,
    100,
    'A'.repeat(9101)
  );

  assert.equal(result, globalThis.ERR_INVALID_ARGS);
  assert.equal(sendCalled, false);
  assert.equal(globalThis.Memory.ss2PacketQueue, undefined);
});

test('sendMessage sends short messages as parseable SS2 packets', () => {
  resetScreepsState();
  globalThis.RESOURCE_ENERGY = 'energy';
  globalThis.OK = 0;
  let sentDescription = '';
  const terminal = {
    id: 'terminal1',
    send: (_resourceType, _amount, _targetRoom, description) => {
      sentDescription = description;
      return globalThis.OK;
    }
  };

  const result = SS2TerminalComms.sendMessage(
    terminal,
    'W1N1',
    globalThis.RESOURCE_ENERGY,
    100,
    'Short message'
  );

  assert.equal(result, globalThis.OK);
  assert.deepEqual(SS2TerminalComms.parseTransaction(sentDescription), {
    msgId: '000',
    packetId: 0,
    finalPacket: 0,
    messageChunk: 'Short message'
  });
});
