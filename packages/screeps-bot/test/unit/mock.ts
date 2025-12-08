export const Game: {
  creeps: { [name: string]: any };
  rooms: any;
  spawns: any;
  time: any;
  cpu: any;
  powerCreeps: any;
  gcl: any;
  gpl: any;
  market: any;
} = {
  creeps: {},
  rooms: {},
  spawns: {},
  time: 12345,
  cpu: {
    getUsed: () => 0,
    limit: 20,
    tickLimit: 500,
    bucket: 10000,
    shardLimits: {},
    unlocked: false,
    unlockedTime: 0
  },
  powerCreeps: {},
  gcl: {
    level: 1,
    progress: 0,
    progressTotal: 1000000
  },
  gpl: {
    level: 0,
    progress: 0,
    progressTotal: 1000000
  },
  market: {
    credits: 0,
    incomingTransactions: [],
    outgoingTransactions: [],
    orders: {}
  }
};

export const Memory: {
  creeps: { [name: string]: any };
  rooms?: { [name: string]: any };
} = {
  creeps: {},
  rooms: {}
};
