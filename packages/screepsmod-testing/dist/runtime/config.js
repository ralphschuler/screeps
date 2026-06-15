"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguredScenarios = getConfiguredScenarios;
exports.getDefaultScenarioList = getDefaultScenarioList;
var DEFAULT_SCENARIOS = ['default-bootstrap', 'construction-economy', 'remote-mining', 'defense-hostile', 'alliance-safety'];
function splitScenarioList(value) {
    if (Array.isArray(value))
        return value.map(String).map(function (s) { return s.trim(); }).filter(Boolean);
    if (typeof value !== 'string')
        return [];
    if (value.trim().toLowerCase() === 'none')
        return [];
    return value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}
function getConfiguredScenarios(config) {
    var _a, _b, _c, _d, _e;
    var env = ((_b = (_a = globalThis.process) === null || _a === void 0 ? void 0 : _a.env) !== null && _b !== void 0 ? _b : {});
    var envScenarios = splitScenarioList(env.SCREEPS_TEST_SCENARIOS);
    if (envScenarios.length > 0 || ((_c = env.SCREEPS_TEST_SCENARIOS) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === 'none')
        return envScenarios;
    var explicit = splitScenarioList((_e = (_d = config.screepsmod) === null || _d === void 0 ? void 0 : _d.testing) === null || _e === void 0 ? void 0 : _e.scenarios);
    if (explicit.length > 0)
        return explicit;
    return [];
}
function getDefaultScenarioList() {
    return DEFAULT_SCENARIOS.slice();
}
//# sourceMappingURL=config.js.map