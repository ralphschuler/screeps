"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBackendRuntimeAssertions = runBackendRuntimeAssertions;
var ALLY_NAMES = ['TooAngel', 'TedRoastBeef'];
var DEFAULT_SCENARIO_REMOTE_ROOM = 'W1N2';
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function toArray(result) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (Array.isArray(result))
                return [2 /*return*/, result];
            if (result === null || result === void 0 ? void 0 : result.toArray)
                return [2 /*return*/, result.toArray()];
            return [2 /*return*/, []];
        });
    });
}
function values(obj) {
    return isObject(obj) ? Object.keys(obj).map(function (key) { return obj[key]; }) : [];
}
function hasAllyName(value) {
    if (value === undefined || value === null)
        return false;
    if (typeof value === 'string')
        return ALLY_NAMES.indexOf(value) >= 0;
    if (Array.isArray(value))
        return value.some(hasAllyName);
    if (typeof value === 'object')
        return Object.keys(value).some(function (key) { return hasAllyName(value[key]); });
    return false;
}
function taskBoardRooms(memory) {
    var _a, _b;
    return values((_b = (_a = memory.creepTaskBoard) === null || _a === void 0 ? void 0 : _a.rooms) !== null && _b !== void 0 ? _b : {});
}
function taskBoardTasks(memory) {
    var e_1, _a;
    var _b;
    var tasks = [];
    try {
        for (var _c = __values(taskBoardRooms(memory)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var board = _d.value;
            tasks.push.apply(tasks, __spreadArray([], __read(values((_b = board === null || board === void 0 ? void 0 : board.tasks) !== null && _b !== void 0 ? _b : {})), false));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return tasks;
}
function hasTaskBoardActivity(memory) {
    return taskBoardRooms(memory).some(function (board) {
        var _a, _b, _c, _d;
        if (values((_a = board === null || board === void 0 ? void 0 : board.tasks) !== null && _a !== void 0 ? _a : {}).length > 0)
            return true;
        if (((_b = board === null || board === void 0 ? void 0 : board.lastGeneratedTick) !== null && _b !== void 0 ? _b : 0) > 0 || ((_c = board === null || board === void 0 ? void 0 : board.lastCleanedTick) !== null && _c !== void 0 ? _c : 0) > 0)
            return true;
        return values((_d = board === null || board === void 0 ? void 0 : board.stats) !== null && _d !== void 0 ? _d : {}).some(function (value) { return typeof value === 'number' && value > 0; });
    });
}
function hasTaskType(memory, type) {
    return taskBoardTasks(memory).some(function (task) { return (task === null || task === void 0 ? void 0 : task.type) === type; });
}
function hasStatsRoomField(memory, fieldName) {
    var _a, _b;
    var rooms = (_b = (_a = memory.stats) === null || _a === void 0 ? void 0 : _a.rooms) !== null && _b !== void 0 ? _b : {};
    return Object.keys(rooms).some(function (roomName) { var _a; return Boolean((_a = rooms[roomName]) === null || _a === void 0 ? void 0 : _a[fieldName]); });
}
function hasDefenseSignal(memory) {
    var _a, _b, _c, _d, _e;
    if (values((_a = memory.defenseRequests) !== null && _a !== void 0 ? _a : {}).length > 0)
        return true;
    if (hasTaskType(memory, 'defend'))
        return true;
    if (values((_d = (_c = (_b = memory.empire) === null || _b === void 0 ? void 0 : _b.playerPostures) === null || _c === void 0 ? void 0 : _c.players) !== null && _d !== void 0 ? _d : {}).some(function (player) { var _a, _b; return ((_a = player === null || player === void 0 ? void 0 : player.attackCount) !== null && _a !== void 0 ? _a : 0) > 0 || ((_b = player === null || player === void 0 ? void 0 : player.lastIncidentTick) !== null && _b !== void 0 ? _b : 0) > 0; }))
        return true;
    var rooms = (_e = memory.rooms) !== null && _e !== void 0 ? _e : {};
    return Object.keys(rooms).some(function (roomName) {
        var _a, _b, _c, _d, _e, _f;
        var swarm = (_b = (_a = rooms[roomName]) === null || _a === void 0 ? void 0 : _a.swarm) !== null && _b !== void 0 ? _b : {};
        var pheromones = (_c = swarm.pheromones) !== null && _c !== void 0 ? _c : {};
        return ((_d = swarm.danger) !== null && _d !== void 0 ? _d : 0) > 0 || ((_e = pheromones.defense) !== null && _e !== void 0 ? _e : 0) > 0 || ((_f = pheromones.war) !== null && _f !== void 0 ? _f : 0) > 0;
    });
}
function hasRemoteSignal(memory) {
    var _a, _b, _c;
    var rooms = (_a = memory.rooms) !== null && _a !== void 0 ? _a : {};
    if (Object.keys(rooms).some(function (roomName) { var _a, _b, _c; return ((_c = (_b = (_a = rooms[roomName]) === null || _a === void 0 ? void 0 : _a.swarm) === null || _b === void 0 ? void 0 : _b.remoteAssignments) !== null && _c !== void 0 ? _c : []).length > 0; }))
        return true;
    var statsRooms = (_c = (_b = memory.stats) === null || _b === void 0 ? void 0 : _b.rooms) !== null && _c !== void 0 ? _c : {};
    return Object.keys(statsRooms).some(function (roomName) { var _a, _b, _c; return ((_c = (_b = (_a = statsRooms[roomName]) === null || _a === void 0 ? void 0 : _a.remote) === null || _b === void 0 ? void 0 : _b.assigned) !== null && _c !== void 0 ? _c : 0) > 0; });
}
function creepTargetsAllies(memory) {
    var _a;
    return values((_a = memory.creeps) !== null && _a !== void 0 ? _a : {}).some(function (creepMemory) {
        if (!isObject(creepMemory))
            return false;
        return hasAllyName(creepMemory.targetOwner)
            || hasAllyName(creepMemory.hostileOwner)
            || hasAllyName(creepMemory.attackTargetOwner)
            || hasAllyName(creepMemory.targetPlayer);
    });
}
function countCreepRoles(memory) {
    var e_2, _a;
    var _b, _c;
    var counts = {};
    try {
        for (var _d = __values(values((_b = memory.creeps) !== null && _b !== void 0 ? _b : {})), _e = _d.next(); !_e.done; _e = _d.next()) {
            var creepMemory = _e.value;
            var role = isObject(creepMemory) && typeof creepMemory.role === 'string' ? creepMemory.role : 'unknown';
            counts[role] = ((_c = counts[role]) !== null && _c !== void 0 ? _c : 0) + 1;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return counts;
}
function hardDefenseCreepsAreNotTiny(memory, creeps) {
    return creeps.every(function (creep) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        var name = String((_a = creep === null || creep === void 0 ? void 0 : creep.name) !== null && _a !== void 0 ? _a : '');
        var memoryRole = (_c = (_b = memory.creeps) === null || _b === void 0 ? void 0 : _b[name]) === null || _c === void 0 ? void 0 : _c.role;
        var role = (_e = (_d = creep === null || creep === void 0 ? void 0 : creep.memory) === null || _d === void 0 ? void 0 : _d.role) !== null && _e !== void 0 ? _e : memoryRole;
        if (role !== 'ranger')
            return true;
        var targetRoom = (_g = (_f = creep === null || creep === void 0 ? void 0 : creep.memory) === null || _f === void 0 ? void 0 : _f.targetRoom) !== null && _g !== void 0 ? _g : (_j = (_h = memory.creeps) === null || _h === void 0 ? void 0 : _h[name]) === null || _j === void 0 ? void 0 : _j.targetRoom;
        var task = (_l = (_k = creep === null || creep === void 0 ? void 0 : creep.memory) === null || _k === void 0 ? void 0 : _k.task) !== null && _l !== void 0 ? _l : (_o = (_m = memory.creeps) === null || _m === void 0 ? void 0 : _m[name]) === null || _o === void 0 ? void 0 : _o.task;
        if (task !== 'defenseAssist' && !targetRoom)
            return true;
        return ((_p = creep === null || creep === void 0 ? void 0 : creep.body) !== null && _p !== void 0 ? _p : []).length >= 6;
    });
}
function summarizeHardInvaderCreep(creep) {
    var body = Array.isArray(creep === null || creep === void 0 ? void 0 : creep.body) ? creep.body : [];
    return {
        objectId: (creep === null || creep === void 0 ? void 0 : creep._id) ? String(creep._id) : undefined,
        name: creep === null || creep === void 0 ? void 0 : creep.name,
        room: creep === null || creep === void 0 ? void 0 : creep.room,
        user: (creep === null || creep === void 0 ? void 0 : creep.user) ? String(creep.user) : undefined,
        bodyParts: body.length,
        bodyTypes: body.map(function (part) { var _a; return (_a = part === null || part === void 0 ? void 0 : part.type) !== null && _a !== void 0 ? _a : part; }),
        hits: creep === null || creep === void 0 ? void 0 : creep.hits,
        hitsMax: creep === null || creep === void 0 ? void 0 : creep.hitsMax,
        ticksToLive: creep === null || creep === void 0 ? void 0 : creep.ticksToLive,
        x: creep === null || creep === void 0 ? void 0 : creep.x,
        y: creep === null || creep === void 0 ? void 0 : creep.y,
        spawning: Boolean(creep === null || creep === void 0 ? void 0 : creep.spawning),
    };
}
function hasConfirmedHardInvaderSeed(hardInvaders, hardInvaderSeed) {
    var _a;
    if (hardInvaders.some(function (creep) { var _a; return ((_a = creep === null || creep === void 0 ? void 0 : creep.body) !== null && _a !== void 0 ? _a : []).length >= 50; }))
        return true;
    return ((_a = hardInvaderSeed === null || hardInvaderSeed === void 0 ? void 0 : hardInvaderSeed.bodyParts) !== null && _a !== void 0 ? _a : 0) >= 50
        && typeof (hardInvaderSeed === null || hardInvaderSeed === void 0 ? void 0 : hardInvaderSeed.objectId) === 'string'
        && hardInvaderSeed.objectId.length > 0;
}
function collectRemoteAssignments(memory) {
    var e_3, _a;
    var _b, _c, _d;
    var assignments = {};
    var rooms = (_b = memory.rooms) !== null && _b !== void 0 ? _b : {};
    try {
        for (var _e = __values(Object.keys(rooms)), _f = _e.next(); !_f.done; _f = _e.next()) {
            var roomName = _f.value;
            var remotes = (_d = (_c = rooms[roomName]) === null || _c === void 0 ? void 0 : _c.swarm) === null || _d === void 0 ? void 0 : _d.remoteAssignments;
            if (Array.isArray(remotes))
                assignments[roomName] = remotes.filter(function (remote) { return typeof remote === 'string'; });
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return assignments;
}
function collectKnownRoomIntel(memory) {
    var e_4, _a;
    var _b, _c, _d, _e, _f, _g;
    var knownRooms = (_c = (_b = memory.empire) === null || _b === void 0 ? void 0 : _b.knownRooms) !== null && _c !== void 0 ? _c : {};
    var summary = {};
    try {
        for (var _h = __values(Object.keys(knownRooms).sort().slice(0, 20)), _j = _h.next(); !_j.done; _j = _h.next()) {
            var roomName = _j.value;
            var intel = (_d = knownRooms[roomName]) !== null && _d !== void 0 ? _d : {};
            summary[roomName] = {
                scouted: intel.scouted === true,
                lastSeen: Number((_e = intel.lastSeen) !== null && _e !== void 0 ? _e : 0),
                sources: Number((_f = intel.sources) !== null && _f !== void 0 ? _f : 0),
                threatLevel: Number((_g = intel.threatLevel) !== null && _g !== void 0 ? _g : 0)
            };
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_j && !_j.done && (_a = _h.return)) _a.call(_h);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return summary;
}
function collectSpawnQueueTelemetry(memory) {
    var e_5, _a;
    var _b, _c, _d;
    var statsRooms = (_c = (_b = memory.stats) === null || _b === void 0 ? void 0 : _b.rooms) !== null && _c !== void 0 ? _c : {};
    var queues = {};
    try {
        for (var _e = __values(Object.keys(statsRooms)), _f = _e.next(); !_f.done; _f = _e.next()) {
            var roomName = _f.value;
            if ((_d = statsRooms[roomName]) === null || _d === void 0 ? void 0 : _d.spawn_queue)
                queues[roomName] = statsRooms[roomName].spawn_queue;
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
        }
        finally { if (e_5) throw e_5.error; }
    }
    return queues;
}
function assertCounter(counters, name, tags, predicate, message) {
    try {
        if (predicate())
            counters.passed += 1;
        else
            counters.failures.push({ name: name, message: message, tags: tags, source: 'screepsmod-testing-backend-cronjob' });
    }
    catch (error) {
        counters.failures.push({ name: name, message: (error === null || error === void 0 ? void 0 : error.stack) || (error === null || error === void 0 ? void 0 : error.message) || String(error), tags: tags, source: 'screepsmod-testing-backend-cronjob' });
    }
}
function runtimeAssertCounter(counters, warmed, name, tags, predicate, message) {
    if (!warmed) {
        counters.skipped += 1;
        return;
    }
    assertCounter(counters, name, tags, predicate, message);
}
function runtimeAssertCounterAfter(counters, input, minTick, name, tags, predicate, message) {
    if (!input.botRuntimeWarmed) {
        counters.skipped += 1;
        return;
    }
    if (input.tick < minTick) {
        counters.passed += 1;
        return;
    }
    assertCounter(counters, name, tags, predicate, message);
}
function ensureScenarioMemory(memory, scenarios, ownedRoomNames, tick, scenarioSeedConfirmation) {
    var _a, _b, _c, _d, _e, _f;
    if (scenarios.length === 0)
        return;
    var homeRoom = ownedRoomNames[0];
    var existingScenarioMemory = (_a = memory.screepsmodTestingScenarios) !== null && _a !== void 0 ? _a : {};
    var hardInvaderSeed = (_b = existingScenarioMemory.hardInvader) !== null && _b !== void 0 ? _b : scenarioSeedConfirmation === null || scenarioSeedConfirmation === void 0 ? void 0 : scenarioSeedConfirmation.hardInvader;
    memory.screepsmodTestingScenarios = __assign(__assign({}, existingScenarioMemory), { names: scenarios, checkedAt: tick, rooms: __assign(__assign({}, ((_c = existingScenarioMemory.rooms) !== null && _c !== void 0 ? _c : {})), { home: homeRoom, remote: DEFAULT_SCENARIO_REMOTE_ROOM, economy: (_e = (_d = existingScenarioMemory.rooms) === null || _d === void 0 ? void 0 : _d.economy) !== null && _e !== void 0 ? _e : 'W2N1' }) });
    if (scenarios.indexOf('defense-hard-invader') >= 0 && hardInvaderSeed) {
        memory.screepsmodTestingScenarios.hardInvader = hardInvaderSeed;
    }
    if (homeRoom && scenarios.indexOf('remote-mining') >= 0) {
        var roomMemory = (_f = memory.rooms) === null || _f === void 0 ? void 0 : _f[homeRoom];
        var swarm = roomMemory === null || roomMemory === void 0 ? void 0 : roomMemory.swarm;
        if (swarm && Array.isArray(swarm.remoteAssignments) && swarm.remoteAssignments.indexOf(DEFAULT_SCENARIO_REMOTE_ROOM) < 0) {
            swarm.remoteAssignments.push(DEFAULT_SCENARIO_REMOTE_ROOM);
        }
    }
}
function assertBaselineRuntime(counters, input, ownedRoomNames) {
    var memory = input.memory;
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend creep population exists after warmup', ['runtime', 'population'], function () { return input.creeps.length > 0; }, 'no creeps after warmup');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend CPU bucket is not chronically empty', ['runtime', 'cpu'], function () { var _a; return ((_a = input.user.cpuAvailable) !== null && _a !== void 0 ? _a : 10000) > 1000; }, 'CPU bucket below 1000');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend task board memory tracks room tasks', ['runtime', 'task-board'], function () { var _a, _b; return Object.keys((_b = (_a = memory.creepTaskBoard) === null || _a === void 0 ? void 0 : _a.rooms) !== null && _b !== void 0 ? _b : {}).length > 0; }, 'Memory.creepTaskBoard.rooms is empty');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend task board records activity', ['runtime', 'task-board'], function () { return hasTaskBoardActivity(memory); }, 'Memory.creepTaskBoard has no task activity');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend empire memory has initialized roadmap shape', ['runtime', 'memory', 'empire'], function () {
        var _a;
        var empire = (_a = memory.empire) !== null && _a !== void 0 ? _a : {};
        return isObject(empire.knownRooms) && Array.isArray(empire.clusters) && isObject(empire.ownedRooms) && Array.isArray(empire.claimQueue) && isObject(empire.objectives);
    }, 'Memory.empire schema incomplete');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend clusters memory is initialized', ['runtime', 'memory', 'clusters'], function () { var _a; return isObject((_a = memory.clusters) !== null && _a !== void 0 ? _a : {}); }, 'Memory.clusters missing');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend owned room swarm memory is initialized', ['runtime', 'memory', 'rooms'], function () { return ownedRoomNames.some(function (roomName) { var _a, _b; return isObject((_b = (_a = memory.rooms) === null || _a === void 0 ? void 0 : _a[roomName]) === null || _b === void 0 ? void 0 : _b.swarm); }); }, 'owned room swarm memory missing');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend unified stats are exported', ['runtime', 'stats'], function () { var _a, _b, _c; return typeof ((_a = memory.stats) === null || _a === void 0 ? void 0 : _a.tick) === 'number' && isObject((_b = memory.stats) === null || _b === void 0 ? void 0 : _b.cpu) && isObject((_c = memory.stats) === null || _c === void 0 ? void 0 : _c.rooms); }, 'Memory.stats schema incomplete');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend unified stats include spawn queue telemetry', ['runtime', 'stats', 'spawn'], function () { return hasStatsRoomField(memory, 'spawn_queue'); }, 'Memory.stats.rooms.*.spawn_queue missing');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend permanent allies are not war targets', ['runtime', 'alliance-safety'], function () { var _a, _b, _c; return !hasAllyName((_b = (_a = memory.empire) === null || _a === void 0 ? void 0 : _a.warTargets) !== null && _b !== void 0 ? _b : []) && !hasAllyName((_c = memory.warTargets) !== null && _c !== void 0 ? _c : []); }, 'permanent ally appears in war target memory');
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend creep memory does not target permanent allies', ['runtime', 'alliance-safety'], function () { return !creepTargetsAllies(memory); }, 'creep memory targets permanent ally');
}
function assertScenarios(counters, input) {
    return __awaiter(this, void 0, void 0, function () {
        var diagnostics, objects, constructionSites, _a, _b, linkStructures, _c, _d, extensionStructures, _e, _f, storageStructures, _g, _h, terminalStructures, _j, _k, labStructures, _l, _m, hardInvaders, _o, _p, hardInvaderSeed, linkSites, siteTypes, constructionSites_1, constructionSites_1_1, site, type, hardInvaderDiagnostics, hasOHReactionMemory_1, hasOHLabProduct_1, economyRoom_1, hasTerminalMovement;
        var e_6, _q;
        var _r, _s, _t, _u, _v, _w, _x;
        return __generator(this, function (_y) {
            switch (_y.label) {
                case 0:
                    diagnostics = {};
                    if (input.scenarios.length === 0)
                        return [2 /*return*/, diagnostics];
                    objects = input.storage.db['rooms.objects'];
                    if (!(objects === null || objects === void 0 ? void 0 : objects.find)) return [3 /*break*/, 3];
                    _b = toArray;
                    return [4 /*yield*/, objects.find(__assign({ type: 'constructionSite' }, input.userIdFilter))];
                case 1: return [4 /*yield*/, _b.apply(void 0, [_y.sent()])];
                case 2:
                    _a = _y.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = [];
                    _y.label = 4;
                case 4:
                    constructionSites = _a;
                    if (!(objects === null || objects === void 0 ? void 0 : objects.find)) return [3 /*break*/, 7];
                    _d = toArray;
                    return [4 /*yield*/, objects.find(__assign({ type: 'link' }, input.userIdFilter))];
                case 5: return [4 /*yield*/, _d.apply(void 0, [_y.sent()])];
                case 6:
                    _c = _y.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _c = [];
                    _y.label = 8;
                case 8:
                    linkStructures = _c;
                    if (!(objects === null || objects === void 0 ? void 0 : objects.find)) return [3 /*break*/, 11];
                    _f = toArray;
                    return [4 /*yield*/, objects.find(__assign({ type: 'extension' }, input.userIdFilter))];
                case 9: return [4 /*yield*/, _f.apply(void 0, [_y.sent()])];
                case 10:
                    _e = _y.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _e = [];
                    _y.label = 12;
                case 12:
                    extensionStructures = _e;
                    if (!(objects === null || objects === void 0 ? void 0 : objects.find)) return [3 /*break*/, 15];
                    _h = toArray;
                    return [4 /*yield*/, objects.find(__assign({ type: 'storage' }, input.userIdFilter))];
                case 13: return [4 /*yield*/, _h.apply(void 0, [_y.sent()])];
                case 14:
                    _g = _y.sent();
                    return [3 /*break*/, 16];
                case 15:
                    _g = [];
                    _y.label = 16;
                case 16:
                    storageStructures = _g;
                    if (!(objects === null || objects === void 0 ? void 0 : objects.find)) return [3 /*break*/, 19];
                    _k = toArray;
                    return [4 /*yield*/, objects.find(__assign({ type: 'terminal' }, input.userIdFilter))];
                case 17: return [4 /*yield*/, _k.apply(void 0, [_y.sent()])];
                case 18:
                    _j = _y.sent();
                    return [3 /*break*/, 20];
                case 19:
                    _j = [];
                    _y.label = 20;
                case 20:
                    terminalStructures = _j;
                    if (!(objects === null || objects === void 0 ? void 0 : objects.find)) return [3 /*break*/, 23];
                    _m = toArray;
                    return [4 /*yield*/, objects.find(__assign({ type: 'lab' }, input.userIdFilter))];
                case 21: return [4 /*yield*/, _m.apply(void 0, [_y.sent()])];
                case 22:
                    _l = _y.sent();
                    return [3 /*break*/, 24];
                case 23:
                    _l = [];
                    _y.label = 24;
                case 24:
                    labStructures = _l;
                    if (!(objects === null || objects === void 0 ? void 0 : objects.find)) return [3 /*break*/, 27];
                    _p = toArray;
                    return [4 /*yield*/, objects.find({ type: 'creep', name: 'ScenarioHardInvader' })];
                case 25: return [4 /*yield*/, _p.apply(void 0, [_y.sent()])];
                case 26:
                    _o = _y.sent();
                    return [3 /*break*/, 28];
                case 27:
                    _o = [];
                    _y.label = 28;
                case 28:
                    hardInvaders = _o;
                    hardInvaderSeed = (_s = (_r = input.memory.screepsmodTestingScenarios) === null || _r === void 0 ? void 0 : _r.hardInvader) !== null && _s !== void 0 ? _s : (_t = input.scenarioSeedConfirmation) === null || _t === void 0 ? void 0 : _t.hardInvader;
                    linkSites = constructionSites.filter(function (site) { return (site === null || site === void 0 ? void 0 : site.structureType) === 'link'; });
                    siteTypes = {};
                    try {
                        for (constructionSites_1 = __values(constructionSites), constructionSites_1_1 = constructionSites_1.next(); !constructionSites_1_1.done; constructionSites_1_1 = constructionSites_1.next()) {
                            site = constructionSites_1_1.value;
                            type = String((_u = site === null || site === void 0 ? void 0 : site.structureType) !== null && _u !== void 0 ? _u : 'unknown');
                            siteTypes[type] = ((_v = siteTypes[type]) !== null && _v !== void 0 ? _v : 0) + 1;
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (constructionSites_1_1 && !constructionSites_1_1.done && (_q = constructionSites_1.return)) _q.call(constructionSites_1);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                    diagnostics.constructionSites = constructionSites.length;
                    diagnostics.constructionCompletedExtensions = extensionStructures.length;
                    diagnostics.linkNetwork = {
                        links: linkStructures.length,
                        linkSites: linkSites.length,
                        extensions: extensionStructures.length,
                        extensionEnergy: extensionStructures.reduce(function (total, extension) { var _a, _b, _c; return total + Number((_c = (_a = extension === null || extension === void 0 ? void 0 : extension.energy) !== null && _a !== void 0 ? _a : (_b = extension === null || extension === void 0 ? void 0 : extension.store) === null || _b === void 0 ? void 0 : _b.energy) !== null && _c !== void 0 ? _c : 0); }, 0),
                        storages: storageStructures.length,
                        ownedControllers: input.ownedControllers.map(function (controller) { return ({ room: controller.room, level: controller.level }); }),
                        siteTypes: siteTypes
                    };
                    diagnostics.terminalMarketLab = {
                        terminals: terminalStructures.length,
                        labs: labStructures.length,
                        terminalRooms: terminalStructures.map(function (terminal) { return terminal.room; }),
                        labRooms: labStructures.map(function (lab) { return lab.room; })
                    };
                    hardInvaderDiagnostics = {
                        count: hardInvaders.length,
                        bodyParts: hardInvaders.map(function (creep) { var _a; return ((_a = creep === null || creep === void 0 ? void 0 : creep.body) !== null && _a !== void 0 ? _a : []).length; }),
                        rooms: hardInvaders.map(function (creep) { return creep === null || creep === void 0 ? void 0 : creep.room; }),
                        creeps: hardInvaders.map(summarizeHardInvaderCreep),
                        seed: hardInvaderSeed !== null && hardInvaderSeed !== void 0 ? hardInvaderSeed : null
                    };
                    diagnostics.defenseHardInvader = hardInvaderDiagnostics;
                    if (input.scenarios.indexOf('default-bootstrap') >= 0) {
                        runtimeAssertCounter(counters, input.botRuntimeWarmed, 'scenario default-bootstrap has owned controller and spawn', ['scenario', 'default-bootstrap'], function () { return input.ownedControllers.length > 0 && input.spawns.length > 0; }, 'default bootstrap scenario lacks owned controller or spawn');
                    }
                    if (input.scenarios.indexOf('construction-economy') >= 0) {
                        runtimeAssertCounterAfter(counters, input, 1200, 'scenario construction-economy creates build demand or completion signal', ['scenario', 'construction-economy'], function () { var _a; return constructionSites.length > 0 || extensionStructures.length > 0 || hasTaskType(input.memory, 'build') || hasTaskType(input.memory, 'repair') || hasStatsRoomField(input.memory, 'construction_sites') || ((_a = countCreepRoles(input.memory).builder) !== null && _a !== void 0 ? _a : 0) > 0; }, 'construction scenario did not create build/repair demand or completion signal');
                    }
                    if (input.scenarios.indexOf('remote-mining') >= 0) {
                        runtimeAssertCounter(counters, input.botRuntimeWarmed, 'scenario remote-mining exposes remote assignment telemetry', ['scenario', 'remote-mining'], function () { return hasRemoteSignal(input.memory); }, 'remote mining scenario has no remote assignment signal');
                    }
                    if (input.scenarios.indexOf('defense-hostile') >= 0) {
                        runtimeAssertCounterAfter(counters, input, 1200, 'scenario defense-hostile emits defensive runtime signal', ['scenario', 'defense-hostile'], function () { return hasDefenseSignal(input.memory); }, 'defense scenario has no danger, defense task, or defense request signal');
                    }
                    if (input.scenarios.indexOf('defense-hard-invader') >= 0) {
                        runtimeAssertCounter(counters, input.botRuntimeWarmed, 'scenario defense-hard-invader seeds a 50-part hostile', ['scenario', 'defense-hard-invader', 'seed'], function () { return hasConfirmedHardInvaderSeed(hardInvaders, hardInvaderSeed); }, "hard invader scenario did not seed a 50-part hostile; diagnostics=".concat(JSON.stringify(hardInvaderDiagnostics)));
                        runtimeAssertCounterAfter(counters, input, 1200, 'scenario defense-hard-invader emits defensive runtime signal', ['scenario', 'defense-hard-invader'], function () { return hasDefenseSignal(input.memory); }, 'hard invader scenario has no danger, defense task, or defense request signal');
                        runtimeAssertCounterAfter(counters, input, 1200, 'scenario defense-hard-invader avoids tiny ranger defenders', ['scenario', 'defense-hard-invader', 'body'], function () { return hardDefenseCreepsAreNotTiny(input.memory, input.creeps); }, 'hard invader scenario spawned a tiny ranger defender');
                    }
                    if (input.scenarios.indexOf('alliance-safety') >= 0) {
                        runtimeAssertCounter(counters, input.botRuntimeWarmed, 'scenario alliance-safety keeps permanent allies untargeted', ['scenario', 'alliance-safety'], function () { var _a, _b; return !creepTargetsAllies(input.memory) && !hasAllyName((_b = (_a = input.memory.empire) === null || _a === void 0 ? void 0 : _a.warTargets) !== null && _b !== void 0 ? _b : []); }, 'alliance scenario found ally targeting');
                    }
                    if (input.scenarios.indexOf('link-network') >= 0) {
                        runtimeAssertCounterAfter(counters, input, 800, 'scenario link-network creates link structures or sites', ['scenario', 'link-network'], function () { return linkStructures.length + linkSites.length >= 2; }, 'link-network scenario has fewer than two link structures/sites');
                    }
                    if (input.scenarios.indexOf('terminal-market-lab-economy') >= 0) {
                        hasOHReactionMemory_1 = function () {
                            var _a;
                            return Object.keys((_a = input.memory.rooms) !== null && _a !== void 0 ? _a : {}).some(function (roomName) {
                                var _a, _b, _c;
                                var reaction = (_c = (_b = (_a = input.memory.rooms) === null || _a === void 0 ? void 0 : _a[roomName]) === null || _b === void 0 ? void 0 : _b.labConfig) === null || _c === void 0 ? void 0 : _c.activeReaction;
                                return (reaction === null || reaction === void 0 ? void 0 : reaction.input1) === 'H' && (reaction === null || reaction === void 0 ? void 0 : reaction.input2) === 'O' && (reaction === null || reaction === void 0 ? void 0 : reaction.output) === 'OH';
                            });
                        };
                        hasOHLabProduct_1 = function () { return labStructures.some(function (lab) { var _a, _b, _c; return (lab === null || lab === void 0 ? void 0 : lab.mineralType) === 'OH' || ((_b = (_a = lab === null || lab === void 0 ? void 0 : lab.store) === null || _a === void 0 ? void 0 : _a.OH) !== null && _b !== void 0 ? _b : 0) > 0 || ((_c = lab === null || lab === void 0 ? void 0 : lab.cooldown) !== null && _c !== void 0 ? _c : 0) > 0; }); };
                        economyRoom_1 = (_x = (_w = input.memory.screepsmodTestingScenarios) === null || _w === void 0 ? void 0 : _w.rooms) === null || _x === void 0 ? void 0 : _x.economy;
                        hasTerminalMovement = function () { return terminalStructures.some(function (terminal) {
                            var _a, _b, _c, _d, _e, _f, _g, _h;
                            if (economyRoom_1 && (terminal === null || terminal === void 0 ? void 0 : terminal.room) === economyRoom_1 && ((_b = (_a = terminal === null || terminal === void 0 ? void 0 : terminal.store) === null || _a === void 0 ? void 0 : _a.energy) !== null && _b !== void 0 ? _b : 0) > 5000)
                                return true;
                            return ((_d = (_c = terminal === null || terminal === void 0 ? void 0 : terminal.store) === null || _c === void 0 ? void 0 : _c.energy) !== null && _d !== void 0 ? _d : 0) > 30000 || ((_f = (_e = terminal === null || terminal === void 0 ? void 0 : terminal.store) === null || _e === void 0 ? void 0 : _e.H) !== null && _f !== void 0 ? _f : 0) > 6000 || ((_h = (_g = terminal === null || terminal === void 0 ? void 0 : terminal.store) === null || _g === void 0 ? void 0 : _g.O) !== null && _h !== void 0 ? _h : 0) > 6000;
                        }); };
                        runtimeAssertCounterAfter(counters, input, 600, 'scenario terminal-market-lab has multiple owned terminals', ['scenario', 'terminal-market-lab-economy', 'terminal'], function () { return terminalStructures.length >= 2; }, 'terminal-market-lab scenario has fewer than two owned terminals');
                        runtimeAssertCounterAfter(counters, input, 600, 'scenario terminal-market-lab has reaction labs', ['scenario', 'terminal-market-lab-economy', 'labs'], function () { return labStructures.length >= 3; }, 'terminal-market-lab scenario has fewer than three owned labs');
                        runtimeAssertCounterAfter(counters, input, 1200, 'scenario terminal-market-lab activates OH reaction', ['scenario', 'terminal-market-lab-economy', 'labs'], function () { return hasOHReactionMemory_1() || hasOHLabProduct_1(); }, 'terminal-market-lab scenario has no OH reaction signal');
                        runtimeAssertCounterAfter(counters, input, 1600, 'scenario terminal-market-lab moves terminal resources', ['scenario', 'terminal-market-lab-economy', 'terminal'], hasTerminalMovement, 'terminal-market-lab scenario has no terminal movement signal');
                        runtimeAssertCounterAfter(counters, input, 1000, 'scenario terminal-market-lab records market telemetry', ['scenario', 'terminal-market-lab-economy', 'market'], function () { var _a, _b, _c, _d, _e, _f; return isObject((_a = input.memory.empire) === null || _a === void 0 ? void 0 : _a.market) && isObject((_d = (_c = (_b = input.memory.empire) === null || _b === void 0 ? void 0 : _b.market) === null || _c === void 0 ? void 0 : _c.orders) !== null && _d !== void 0 ? _d : {}) && Array.isArray((_f = (_e = input.memory.empire) === null || _e === void 0 ? void 0 : _e.market) === null || _f === void 0 ? void 0 : _f.pendingArbitrage); }, 'terminal-market-lab scenario has no market telemetry');
                    }
                    return [2 /*return*/, diagnostics];
            }
        });
    });
}
function runBackendRuntimeAssertions(input) {
    return __awaiter(this, void 0, void 0, function () {
        var counters, ownedRoomNames, scenarioDiagnostics;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    counters = { passed: 0, skipped: 0, failures: [] };
                    ownedRoomNames = input.ownedControllers.map(function (controller) { return String(controller.room); }).filter(Boolean);
                    ensureScenarioMemory(input.memory, input.scenarios, ownedRoomNames, input.tick, input.scenarioSeedConfirmation);
                    assertCounter(counters, 'server exposes storage and advances ticks', ['smoke', 'server'], function () { return input.tick > 0; }, 'gameTime did not advance');
                    assertCounter(counters, 'our bot has at least one owned room controller', ['smoke', 'bot'], function () { return input.ownedControllers.length > 0; }, 'no owned controllers');
                    assertCounter(counters, 'owned room has a spawn after initialization', ['smoke', 'spawn'], function () { return input.spawns.length > 0; }, 'no owned spawns');
                    assertCounter(counters, 'global reset loop is not detected', ['runtime', 'stability'], function () { return (input.memory.__globalResetCount || 0) < 5; }, 'too many global resets');
                    assertCounter(counters, 'critical console error counter stays below threshold', ['runtime', 'errors'], function () { return (input.memory.ciCriticalConsoleErrors || 0) < 10; }, 'critical console errors above threshold');
                    assertBaselineRuntime(counters, input, ownedRoomNames);
                    return [4 /*yield*/, assertScenarios(counters, input)];
                case 1:
                    scenarioDiagnostics = _f.sent();
                    return [2 /*return*/, {
                            source: 'screepsmod-testing-backend-cronjob',
                            total: counters.passed + counters.failures.length + counters.skipped,
                            passed: counters.passed,
                            failed: counters.failures.length,
                            skipped: counters.skipped,
                            failures: counters.failures,
                            runtimeWarmed: input.botRuntimeWarmed,
                            runtimeWarmupTicks: input.runtimeWarmupTicks,
                            scenarios: input.scenarios,
                            tick: input.tick,
                            duration: Date.now() - input.startedAt,
                            diagnostics: {
                                botRuntimeWarmed: input.botRuntimeWarmed,
                                ownedControllers: input.ownedControllers.length,
                                ownedControllerDetails: input.ownedControllers.map(function (controller) {
                                    var _a;
                                    return ({
                                        room: controller.room,
                                        user: controller.user,
                                        level: (_a = controller.level) !== null && _a !== void 0 ? _a : null,
                                    });
                                }),
                                spawns: input.spawns.length,
                                spawnDetails: input.spawns.map(function (spawn) {
                                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                                    return ({
                                        room: spawn.room,
                                        user: spawn.user,
                                        off: (_a = spawn.off) !== null && _a !== void 0 ? _a : null,
                                        energy: (_d = (_b = spawn.energy) !== null && _b !== void 0 ? _b : (_c = spawn.store) === null || _c === void 0 ? void 0 : _c.energy) !== null && _d !== void 0 ? _d : null,
                                        energyCapacity: (_g = (_e = spawn.energyCapacity) !== null && _e !== void 0 ? _e : (_f = spawn.storeCapacityResource) === null || _f === void 0 ? void 0 : _f.energy) !== null && _g !== void 0 ? _g : null,
                                        store: (_h = spawn.store) !== null && _h !== void 0 ? _h : null,
                                        storeCapacityResource: (_j = spawn.storeCapacityResource) !== null && _j !== void 0 ? _j : null,
                                        spawning: (_k = spawn.spawning) !== null && _k !== void 0 ? _k : null,
                                    });
                                }),
                                creeps: input.creeps.length,
                                taskBoardRooms: Object.keys((_b = (_a = input.memory.creepTaskBoard) === null || _a === void 0 ? void 0 : _a.rooms) !== null && _b !== void 0 ? _b : {}).length,
                                roomEnergy: Object.fromEntries(Object.entries((_d = (_c = input.memory.stats) === null || _c === void 0 ? void 0 : _c.rooms) !== null && _d !== void 0 ? _d : {}).map(function (_a) {
                                    var _b;
                                    var _c = __read(_a, 2), roomName = _c[0], stats = _c[1];
                                    return [
                                        roomName,
                                        (_b = stats === null || stats === void 0 ? void 0 : stats.energy) !== null && _b !== void 0 ? _b : null,
                                    ];
                                })),
                                hasPlayerSandboxSummary: ((_e = input.memory.screepsmodTestingPlayer) === null || _e === void 0 ? void 0 : _e.source) === 'screepsmod-testing-player-sandbox',
                                errorNotifications: input.errorSamples.length,
                                errorSamples: input.errorSamples,
                                scenarios: scenarioDiagnostics,
                                creepRoles: countCreepRoles(input.memory),
                                remoteAssignments: collectRemoteAssignments(input.memory),
                                knownRooms: collectKnownRoomIntel(input.memory),
                                spawnQueues: collectSpawnQueueTelemetry(input.memory)
                            }
                        }];
            }
        });
    });
}
//# sourceMappingURL=backendAssertions.js.map