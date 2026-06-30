// Screeps constants needed by package tests before source modules are loaded.
(globalThis as any).OK = 0;
(globalThis as any).ERR_NOT_FOUND = -5;
(globalThis as any).ERR_NOT_ENOUGH_RESOURCES = -6;
(globalThis as any).ERR_INVALID_TARGET = -7;

(globalThis as any).MOVE = "move" as BodyPartConstant;
(globalThis as any).WORK = "work" as BodyPartConstant;
(globalThis as any).CARRY = "carry" as BodyPartConstant;
(globalThis as any).ATTACK = "attack" as BodyPartConstant;
(globalThis as any).RANGED_ATTACK = "ranged_attack" as BodyPartConstant;
(globalThis as any).HEAL = "heal" as BodyPartConstant;
(globalThis as any).CLAIM = "claim" as BodyPartConstant;
(globalThis as any).TOUGH = "tough" as BodyPartConstant;

(globalThis as any).FIND_MY_SPAWNS = 103;
(globalThis as any).FIND_MY_CREEPS = 101;
(globalThis as any).FIND_STRUCTURES = 109;
(globalThis as any).FIND_EXIT = 10;

(globalThis as any).STRUCTURE_CONTAINER = "container";
(globalThis as any).STRUCTURE_CONTROLLER = "controller";
(globalThis as any).STRUCTURE_RAMPART = "rampart";
(globalThis as any).STRUCTURE_ROAD = "road";

(globalThis as any).RESOURCE_ENERGY = "energy";
(globalThis as any).RESOURCE_HYDROGEN = "H";
(globalThis as any).RESOURCE_OXYGEN = "O";
(globalThis as any).RESOURCE_UTRIUM = "U";
(globalThis as any).RESOURCE_LEMERGIUM = "L";
(globalThis as any).RESOURCE_KEANIUM = "K";
(globalThis as any).RESOURCE_ZYNTHIUM = "Z";
(globalThis as any).RESOURCE_CATALYST = "X";
(globalThis as any).RESOURCE_CATALYZED_GHODIUM_ALKALIDE = "XGHO2";
(globalThis as any).RESOURCE_CATALYZED_GHODIUM_ACID = "XGH2O";
(globalThis as any).RESOURCE_CATALYZED_UTRIUM_ACID = "XUH2O";
(globalThis as any).RESOURCE_CATALYZED_UTRIUM_ALKALIDE = "XUHO2";
(globalThis as any).RESOURCE_CATALYZED_KEANIUM_ALKALIDE = "XKHO2";
(globalThis as any).RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE = "XLHO2";
(globalThis as any).RESOURCE_CATALYZED_ZYNTHIUM_ACID = "XZH2O";

(globalThis as any).Game ??= { time: 0, rooms: {}, creeps: {}, spawns: {} };
(globalThis as any).Memory ??= { rooms: {}, creeps: {}, spawns: {}, flags: {} };
