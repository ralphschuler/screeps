"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var assertions_1 = require("../assertions");
function game(ctx) {
    if (!(ctx === null || ctx === void 0 ? void 0 : ctx.Game))
        throw new Error('Game context missing');
    return ctx.Game;
}
function memory(ctx) {
    var _a;
    return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.Memory) !== null && _a !== void 0 ? _a : {};
}
function ownedRooms(ctx) {
    var _a;
    return Object.values((_a = game(ctx).rooms) !== null && _a !== void 0 ? _a : {}).filter(function (room) { var _a; return (_a = room.controller) === null || _a === void 0 ? void 0 : _a.my; });
}
(0, index_1.describe)('CI private-server state', function () {
    (0, index_1.it)('server exposes Game and advances ticks', function (ctx) {
        (0, assertions_1.expect)(game(ctx).time).toBeGreaterThan(0);
    }, ['smoke', 'server']);
    (0, index_1.it)('our bot has at least one owned visible room', function (ctx) {
        (0, assertions_1.expect)(ownedRooms(ctx).length).toBeGreaterThan(0);
    }, ['smoke', 'bot']);
    (0, index_1.it)('owned room has a spawn after initialization', function (ctx) {
        var _a;
        var spawns = Object.values((_a = game(ctx).spawns) !== null && _a !== void 0 ? _a : {});
        (0, assertions_1.expect)(spawns.length).toBeGreaterThan(0);
    }, ['smoke', 'spawn']);
    (0, index_1.it)('global reset loop is not detected', function (ctx) {
        var _a;
        var mem = memory(ctx);
        var resetCount = (_a = mem.__globalResetCount) !== null && _a !== void 0 ? _a : 0;
        (0, assertions_1.expect)(resetCount).toBeLessThan(5);
    }, ['runtime', 'stability']);
    (0, index_1.it)('creep population exists after warmup', function (ctx) {
        var _a, _b;
        if (((_a = ctx === null || ctx === void 0 ? void 0 : ctx.tick) !== null && _a !== void 0 ? _a : 0) < 100)
            return;
        (0, assertions_1.expect)(Object.keys((_b = game(ctx).creeps) !== null && _b !== void 0 ? _b : {}).length).toBeGreaterThan(0);
    }, ['runtime', 'population']);
    (0, index_1.it)('CPU bucket is not chronically empty', function (ctx) {
        var _a, _b, _c;
        if (((_a = ctx === null || ctx === void 0 ? void 0 : ctx.tick) !== null && _a !== void 0 ? _a : 0) < 100)
            return;
        var bucket = (_c = (_b = game(ctx).cpu) === null || _b === void 0 ? void 0 : _b.bucket) !== null && _c !== void 0 ? _c : 10000;
        (0, assertions_1.expect)(bucket).toBeGreaterThan(1000);
    }, ['runtime', 'cpu']);
    (0, index_1.it)('task board memory exists and can track room tasks', function (ctx) {
        var _a, _b, _c;
        var mem = memory(ctx);
        if (((_a = ctx === null || ctx === void 0 ? void 0 : ctx.tick) !== null && _a !== void 0 ? _a : 0) < 100)
            return;
        (0, assertions_1.expect)(Boolean(mem.creepTaskBoard)).toBe(true);
        (0, assertions_1.expect)(Object.keys((_c = (_b = mem.creepTaskBoard) === null || _b === void 0 ? void 0 : _b.rooms) !== null && _c !== void 0 ? _c : {}).length).toBeGreaterThan(0);
    }, ['runtime', 'task-board']);
    (0, index_1.it)('critical console error counter stays below threshold', function (ctx) {
        var _a;
        var mem = memory(ctx);
        (0, assertions_1.expect)((_a = mem.ciCriticalConsoleErrors) !== null && _a !== void 0 ? _a : 0).toBeLessThan(10);
    }, ['runtime', 'errors']);
});
//# sourceMappingURL=ci-state-tests.js.map