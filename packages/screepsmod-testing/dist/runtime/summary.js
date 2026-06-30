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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeRuntimeSummaries = mergeRuntimeSummaries;
function mergeRuntimeSummaries(sources, tick, startedAt, runtimeWarmupTicks, scenarios) {
    var e_1, _a, e_2, _b;
    var _c, _d, _e, _f, _g;
    if (scenarios === void 0) { scenarios = []; }
    function cloneSource(summary) {
        if (!summary)
            return undefined;
        var copy = __assign(__assign({}, summary), { failures: Array.isArray(summary.failures) ? summary.failures.slice() : [] });
        delete copy.sources;
        return copy;
    }
    var active = [];
    if (sources.player)
        active.push(sources.player);
    if (sources.backend)
        active.push(sources.backend);
    if (sources.legacy)
        active.push(sources.legacy);
    var total = 0;
    var passed = 0;
    var failed = 0;
    var skipped = 0;
    var failures = [];
    var runtimeWarmed = active.length > 0;
    try {
        for (var active_1 = __values(active), active_1_1 = active_1.next(); !active_1_1.done; active_1_1 = active_1.next()) {
            var summary = active_1_1.value;
            total += Number((_c = summary.total) !== null && _c !== void 0 ? _c : 0);
            passed += Number((_d = summary.passed) !== null && _d !== void 0 ? _d : 0);
            failed += Number((_e = summary.failed) !== null && _e !== void 0 ? _e : 0);
            skipped += Number((_f = summary.skipped) !== null && _f !== void 0 ? _f : 0);
            if (summary.runtimeWarmed === false)
                runtimeWarmed = false;
            var sourceFailures = Array.isArray(summary.failures) ? summary.failures : [];
            try {
                for (var sourceFailures_1 = (e_2 = void 0, __values(sourceFailures)), sourceFailures_1_1 = sourceFailures_1.next(); !sourceFailures_1_1.done; sourceFailures_1_1 = sourceFailures_1.next()) {
                    var failure = sourceFailures_1_1.value;
                    failures.push(__assign(__assign({}, failure), { source: (_g = failure.source) !== null && _g !== void 0 ? _g : summary.source }));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (sourceFailures_1_1 && !sourceFailures_1_1.done && (_b = sourceFailures_1.return)) _b.call(sourceFailures_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (active_1_1 && !active_1_1.done && (_a = active_1.return)) _a.call(active_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return {
        source: 'screepsmod-testing-merged',
        total: total,
        passed: passed,
        failed: failed,
        skipped: skipped,
        failures: failures,
        runtimeWarmed: runtimeWarmed,
        runtimeWarmupTicks: runtimeWarmupTicks,
        scenarios: scenarios,
        sources: {
            player: cloneSource(sources.player),
            backend: cloneSource(sources.backend),
            legacy: cloneSource(sources.legacy)
        },
        tick: tick,
        duration: Date.now() - startedAt
    };
}
//# sourceMappingURL=summary.js.map