"use strict";

var e = require("@ralphschuler/screeps-memory"), t = function(e, r) {
return t = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
}, t(e, r);
};

function r(e, r) {
if ("function" != typeof r && null !== r) throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
function o() {
this.constructor = e;
}
t(e, r), e.prototype = null === r ? Object.create(r) : (o.prototype = r.prototype, 
new o);
}

var o = function() {
return o = Object.assign || function(e) {
for (var t, r = 1, o = arguments.length; r < o; r++) for (var n in t = arguments[r]) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
return e;
}, o.apply(this, arguments);
};

function n(e, t, r, o) {
var n, a = arguments.length, i = a < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, r) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, r, o); else for (var s = e.length - 1; s >= 0; s--) (n = e[s]) && (i = (a < 3 ? n(i) : a > 3 ? n(t, r, i) : n(t, r)) || i);
return a > 3 && i && Object.defineProperty(t, r, i), i;
}

function a(e) {
var t = "function" == typeof Symbol && Symbol.iterator, r = t && e[t], o = 0;
if (r) return r.call(e);
if (e && "number" == typeof e.length) return {
next: function() {
return e && o >= e.length && (e = void 0), {
value: e && e[o++],
done: !e
};
}
};
throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function i(e, t) {
var r = "function" == typeof Symbol && e[Symbol.iterator];
if (!r) return e;
var o, n, a = r.call(e), i = [];
try {
for (;(void 0 === t || t-- > 0) && !(o = a.next()).done; ) i.push(o.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
o && !o.done && (r = a.return) && r.call(a);
} finally {
if (n) throw n.error;
}
}
return i;
}

function s(e, t, r) {
if (r || 2 === arguments.length) for (var o, n = 0, a = t.length; n < a; n++) !o && n in t || (o || (o = Array.prototype.slice.call(t, 0, n)), 
o[n] = t[n]);
return e.concat(o || Array.prototype.slice.call(t));
}

"function" == typeof SuppressedError && SuppressedError;

var c = "#555555", l = "#AAAAAA", u = "#FFE87B", m = "#F53547", p = "#181818", d = "#8FBB93";

"undefined" != typeof RoomVisual && (RoomVisual.prototype.structure = function(e, t, r, n) {
void 0 === n && (n = {});
var a = o({
opacity: 1
}, n);
switch (r) {
case STRUCTURE_EXTENSION:
this.circle(e, t, {
radius: .5,
fill: p,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: c,
opacity: a.opacity
});
break;

case STRUCTURE_SPAWN:
this.circle(e, t, {
radius: .65,
fill: p,
stroke: "#CCCCCC",
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: u,
opacity: a.opacity
});
break;

case STRUCTURE_POWER_SPAWN:
this.circle(e, t, {
radius: .65,
fill: p,
stroke: m,
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: u,
opacity: a.opacity
});
break;

case STRUCTURE_TOWER:
this.circle(e, t, {
radius: .6,
fill: p,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: c,
opacity: a.opacity
}), this.rect(e - .2, t - .3, .4, .6, {
fill: l,
opacity: a.opacity
});
break;

case STRUCTURE_STORAGE:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: d,
strokeWidth: .05,
fill: p,
opacity: a.opacity
}), this.rect(e - .35, t - .45, .7, .9, {
fill: u,
opacity: .6 * a.opacity
});
break;

case STRUCTURE_TERMINAL:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: d,
strokeWidth: .05,
fill: p,
opacity: a.opacity
}), this.circle(e, t, {
radius: .3,
fill: l,
opacity: a.opacity
}), this.rect(e - .15, t - .15, .3, .3, {
fill: c,
opacity: a.opacity
});
break;

case STRUCTURE_LAB:
this.circle(e, t, {
radius: .55,
fill: p,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: c,
opacity: a.opacity
}), this.rect(e - .15, t + .1, .3, .25, {
fill: l,
opacity: a.opacity
});
break;

case STRUCTURE_LINK:
this.circle(e, t, {
radius: .5,
fill: p,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: l,
opacity: a.opacity
});
break;

case STRUCTURE_NUKER:
this.circle(e, t, {
radius: .65,
fill: p,
stroke: "#ff0000",
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: "#ff0000",
opacity: .6 * a.opacity
});
break;

case STRUCTURE_OBSERVER:
this.circle(e, t, {
radius: .6,
fill: p,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: "#00ffff",
opacity: .6 * a.opacity
});
break;

case STRUCTURE_CONTAINER:
this.rect(e - .45, t - .45, .9, .9, {
fill: p,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.rect(e - .35, t - .35, .7, .7, {
fill: "transparent",
stroke: c,
strokeWidth: .05,
opacity: a.opacity
});
break;

case STRUCTURE_ROAD:
this.circle(e, t, {
radius: .175,
fill: "#666",
opacity: a.opacity
});
break;

case STRUCTURE_RAMPART:
this.rect(e - .45, t - .45, .9, .9, {
fill: "transparent",
stroke: "#00ff00",
strokeWidth: .1,
opacity: a.opacity
});
break;

case STRUCTURE_WALL:
this.rect(e - .45, t - .45, .9, .9, {
fill: p,
stroke: l,
strokeWidth: .05,
opacity: a.opacity
});
break;

case STRUCTURE_EXTRACTOR:
this.circle(e, t, {
radius: .6,
fill: p,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: c,
opacity: a.opacity
});
break;

default:
this.circle(e, t, {
radius: .5,
fill: c,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
});
}
}, RoomVisual.prototype.speech = function(e, t, r, o) {
var n, a, i, s, c;
void 0 === o && (o = {});
var l = null !== (n = o.background) && void 0 !== n ? n : "#2ccf3b", u = null !== (a = o.textcolor) && void 0 !== a ? a : "#000000", m = null !== (i = o.textsize) && void 0 !== i ? i : .5, p = null !== (s = o.textfont) && void 0 !== s ? s : "Times New Roman", d = null !== (c = o.opacity) && void 0 !== c ? c : 1, f = m, y = e.length * f * .4 + .4, g = f + .4;
this.rect(t - y / 2, r - 1 - g, y, g, {
fill: l,
opacity: .9 * d
});
var h = [ [ t - .1, r - 1 ], [ t + .1, r - 1 ], [ t, r - .6 ] ];
this.poly(h, {
fill: l,
opacity: .9 * d,
stroke: "transparent"
}), this.text(e, t, r - 1 - g / 2 + .1, {
color: u,
font: "".concat(f, " ").concat(p),
opacity: d
});
}, RoomVisual.prototype.animatedPosition = function(e, t, r) {
var o, n, a, i;
void 0 === r && (r = {});
var s = null !== (o = r.color) && void 0 !== o ? o : "#ff0000", c = null !== (n = r.opacity) && void 0 !== n ? n : 1, l = null !== (a = r.radius) && void 0 !== a ? a : .75, u = null !== (i = r.frames) && void 0 !== i ? i : 6, m = Game.time % u, p = l * (1 - m / u), d = c * (m / u);
this.circle(e, t, {
radius: p,
fill: "transparent",
stroke: s,
strokeWidth: .1,
opacity: d
});
}, RoomVisual.prototype.resource = function(e, t, r, o) {
var n, a;
void 0 === o && (o = .25);
var i = null !== (a = ((n = {})[RESOURCE_ENERGY] = u, n[RESOURCE_POWER] = m, n[RESOURCE_HYDROGEN] = "#FFFFFF", 
n[RESOURCE_OXYGEN] = "#DDDDDD", n[RESOURCE_UTRIUM] = "#48C5E5", n[RESOURCE_LEMERGIUM] = "#24D490", 
n[RESOURCE_KEANIUM] = "#9269EC", n[RESOURCE_ZYNTHIUM] = "#D9B478", n[RESOURCE_CATALYST] = "#F26D6F", 
n[RESOURCE_GHODIUM] = "#FFFFFF", n)[e]) && void 0 !== a ? a : "#CCCCCC";
this.circle(t, r, {
radius: o,
fill: p,
opacity: .9
}), this.circle(t, r, {
radius: .8 * o,
fill: i,
opacity: .8
});
var s = e.length <= 2 ? e : e.substring(0, 2).toUpperCase();
this.text(s, t, r + .03, {
color: p,
font: "".concat(1.2 * o, " monospace"),
align: "center",
opacity: .9
});
});

var f = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

function y(e) {
if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
var t = e.default;
if ("function" == typeof t) {
var r = function e() {
var r = !1;
try {
r = this instanceof e;
} catch {}
return r ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
};
r.prototype = t.prototype;
} else r = {};
return Object.defineProperty(r, "__esModule", {
value: !0
}), Object.keys(e).forEach(function(t) {
var o = Object.getOwnPropertyDescriptor(e, t);
Object.defineProperty(r, t, o.get ? o : {
enumerable: !0,
get: function() {
return e[t];
}
});
}), r;
}

var g, h, v = {}, R = {}, E = {}, T = {};

function C() {
if (g) return T;
g = 1;
const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
return T.encode = function(t) {
if (0 <= t && t < e.length) return e[t];
throw new TypeError("Must be between 0 and 63: " + t);
}, T;
}

function S() {
if (h) return E;
h = 1;
const e = C();
return E.encode = function(t) {
let r, o = "", n = function(e) {
return e < 0 ? 1 + (-e << 1) : 0 + (e << 1);
}(t);
do {
r = 31 & n, n >>>= 5, n > 0 && (r |= 32), o += e.encode(r);
} while (n > 0);
return o;
}, E;
}

var _, O, b, w = {}, U = y(Object.freeze({
__proto__: null,
default: {}
}));

function x() {
return O ? _ : (O = 1, _ = "function" == typeof URL ? URL : U.URL);
}

function A() {
if (b) return w;
b = 1;
const e = x();
w.getArg = function(e, t, r) {
if (t in e) return e[t];
if (3 === arguments.length) return r;
throw new Error('"' + t + '" is a required argument.');
};
const t = !("__proto__" in Object.create(null));
function r(e) {
return e;
}
function o(e) {
if (!e) return !1;
const t = e.length;
if (t < 9) return !1;
if (95 !== e.charCodeAt(t - 1) || 95 !== e.charCodeAt(t - 2) || 111 !== e.charCodeAt(t - 3) || 116 !== e.charCodeAt(t - 4) || 111 !== e.charCodeAt(t - 5) || 114 !== e.charCodeAt(t - 6) || 112 !== e.charCodeAt(t - 7) || 95 !== e.charCodeAt(t - 8) || 95 !== e.charCodeAt(t - 9)) return !1;
for (let r = t - 10; r >= 0; r--) if (36 !== e.charCodeAt(r)) return !1;
return !0;
}
function n(e, t) {
return e === t ? 0 : null === e ? 1 : null === t ? -1 : e > t ? 1 : -1;
}
w.toSetString = t ? r : function(e) {
return o(e) ? "$" + e : e;
}, w.fromSetString = t ? r : function(e) {
return o(e) ? e.slice(1) : e;
}, w.compareByGeneratedPositionsInflated = function(e, t) {
let r = e.generatedLine - t.generatedLine;
return 0 !== r ? r : (r = e.generatedColumn - t.generatedColumn, 0 !== r ? r : (r = n(e.source, t.source), 
0 !== r ? r : (r = e.originalLine - t.originalLine, 0 !== r ? r : (r = e.originalColumn - t.originalColumn, 
0 !== r ? r : n(e.name, t.name)))));
}, w.parseSourceMapInput = function(e) {
return JSON.parse(e.replace(/^\)]}'[^\n]*\n/, ""));
};
const a = "http://host";
function i(t) {
return r => {
const o = u(r), n = c(r), a = new e(r, n);
t(a);
const i = a.toString();
return "absolute" === o ? i : "scheme-relative" === o ? i.slice(5) : "path-absolute" === o ? i.slice(11) : m(n, i);
};
}
function s(t, r) {
return new e(t, r).toString();
}
function c(e) {
const t = e.split("..").length - 1, r = function(e, t) {
let r = 0;
for (;;) {
const e = "p" + r++;
if (-1 === t.indexOf(e)) return e;
}
}(0, e);
let o = `${a}/`;
for (let e = 0; e < t; e++) o += `${r}/`;
return o;
}
const l = /^[A-Za-z0-9\+\-\.]+:/;
function u(e) {
return "/" === e[0] ? "/" === e[1] ? "scheme-relative" : "path-absolute" : l.test(e) ? "absolute" : "path-relative";
}
function m(t, r) {
"string" == typeof t && (t = new e(t)), "string" == typeof r && (r = new e(r));
const o = r.pathname.split("/"), n = t.pathname.split("/");
for (n.length > 0 && !n[n.length - 1] && n.pop(); o.length > 0 && n.length > 0 && o[0] === n[0]; ) o.shift(), 
n.shift();
return n.map(() => "..").concat(o).join("/") + r.search + r.hash;
}
const p = i(e => {
e.pathname = e.pathname.replace(/\/?$/, "/");
}), d = i(t => {
t.href = new e(".", t.toString()).toString();
}), f = i(e => {});
function y(e, t) {
const r = u(t), o = u(e);
if (e = p(e), "absolute" === r) return s(t, void 0);
if ("absolute" === o) return s(t, e);
if ("scheme-relative" === r) return f(t);
if ("scheme-relative" === o) return s(t, s(e, a)).slice(5);
if ("path-absolute" === r) return f(t);
if ("path-absolute" === o) return s(t, s(e, a)).slice(11);
const n = c(t + e);
return m(n, s(t, s(e, n)));
}
return w.normalize = f, w.join = y, w.relative = function(t, r) {
const o = function(t, r) {
if (u(t) !== u(r)) return null;
const o = c(t + r), n = new e(t, o), a = new e(r, o);
try {
new e("", a.toString());
} catch (e) {
return null;
}
return a.protocol !== n.protocol || a.user !== n.user || a.password !== n.password || a.hostname !== n.hostname || a.port !== n.port ? null : m(n, a);
}(t, r);
return "string" == typeof o ? o : f(r);
}, w.computeSourceURL = function(e, t, r) {
e && "path-absolute" === u(t) && (t = t.replace(/^\//, ""));
let o = f(t || "");
return e && (o = y(e, o)), r && (o = y(d(r), o)), o;
}, w;
}

var M, k = {};

function N() {
if (M) return k;
M = 1;
class e {
constructor() {
this._array = [], this._set = new Map;
}
static fromArray(t, r) {
const o = new e;
for (let e = 0, n = t.length; e < n; e++) o.add(t[e], r);
return o;
}
size() {
return this._set.size;
}
add(e, t) {
const r = this.has(e), o = this._array.length;
r && !t || this._array.push(e), r || this._set.set(e, o);
}
has(e) {
return this._set.has(e);
}
indexOf(e) {
const t = this._set.get(e);
if (t >= 0) return t;
throw new Error('"' + e + '" is not in the set.');
}
at(e) {
if (e >= 0 && e < this._array.length) return this._array[e];
throw new Error("No element indexed by " + e);
}
toArray() {
return this._array.slice();
}
}
return k.ArraySet = e, k;
}

var I, P, G = {};

function L() {
if (P) return R;
P = 1;
const e = S(), t = A(), r = N().ArraySet, o = function() {
if (I) return G;
I = 1;
const e = A();
return G.MappingList = class {
constructor() {
this._array = [], this._sorted = !0, this._last = {
generatedLine: -1,
generatedColumn: 0
};
}
unsortedForEach(e, t) {
this._array.forEach(e, t);
}
add(t) {
!function(t, r) {
const o = t.generatedLine, n = r.generatedLine, a = t.generatedColumn, i = r.generatedColumn;
return n > o || n == o && i >= a || e.compareByGeneratedPositionsInflated(t, r) <= 0;
}(this._last, t) ? (this._sorted = !1, this._array.push(t)) : (this._last = t, this._array.push(t));
}
toArray() {
return this._sorted || (this._array.sort(e.compareByGeneratedPositionsInflated), 
this._sorted = !0), this._array;
}
}, G;
}().MappingList;
class n {
constructor(e) {
e || (e = {}), this._file = t.getArg(e, "file", null), this._sourceRoot = t.getArg(e, "sourceRoot", null), 
this._skipValidation = t.getArg(e, "skipValidation", !1), this._sources = new r, 
this._names = new r, this._mappings = new o, this._sourcesContents = null;
}
static fromSourceMap(e) {
const r = e.sourceRoot, o = new n({
file: e.file,
sourceRoot: r
});
return e.eachMapping(function(e) {
const n = {
generated: {
line: e.generatedLine,
column: e.generatedColumn
}
};
null != e.source && (n.source = e.source, null != r && (n.source = t.relative(r, n.source)), 
n.original = {
line: e.originalLine,
column: e.originalColumn
}, null != e.name && (n.name = e.name)), o.addMapping(n);
}), e.sources.forEach(function(n) {
let a = n;
null != r && (a = t.relative(r, n)), o._sources.has(a) || o._sources.add(a);
const i = e.sourceContentFor(n);
null != i && o.setSourceContent(n, i);
}), o;
}
addMapping(e) {
const r = t.getArg(e, "generated"), o = t.getArg(e, "original", null);
let n = t.getArg(e, "source", null), a = t.getArg(e, "name", null);
this._skipValidation || this._validateMapping(r, o, n, a), null != n && (n = String(n), 
this._sources.has(n) || this._sources.add(n)), null != a && (a = String(a), this._names.has(a) || this._names.add(a)), 
this._mappings.add({
generatedLine: r.line,
generatedColumn: r.column,
originalLine: o && o.line,
originalColumn: o && o.column,
source: n,
name: a
});
}
setSourceContent(e, r) {
let o = e;
null != this._sourceRoot && (o = t.relative(this._sourceRoot, o)), null != r ? (this._sourcesContents || (this._sourcesContents = Object.create(null)), 
this._sourcesContents[t.toSetString(o)] = r) : this._sourcesContents && (delete this._sourcesContents[t.toSetString(o)], 
0 === Object.keys(this._sourcesContents).length && (this._sourcesContents = null));
}
applySourceMap(e, o, n) {
let a = o;
if (null == o) {
if (null == e.file) throw new Error('SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map\'s "file" property. Both were omitted.');
a = e.file;
}
const i = this._sourceRoot;
null != i && (a = t.relative(i, a));
const s = this._mappings.toArray().length > 0 ? new r : this._sources, c = new r;
this._mappings.unsortedForEach(function(r) {
if (r.source === a && null != r.originalLine) {
const o = e.originalPositionFor({
line: r.originalLine,
column: r.originalColumn
});
null != o.source && (r.source = o.source, null != n && (r.source = t.join(n, r.source)), 
null != i && (r.source = t.relative(i, r.source)), r.originalLine = o.line, r.originalColumn = o.column, 
null != o.name && (r.name = o.name));
}
const o = r.source;
null == o || s.has(o) || s.add(o);
const l = r.name;
null == l || c.has(l) || c.add(l);
}, this), this._sources = s, this._names = c, e.sources.forEach(function(r) {
const o = e.sourceContentFor(r);
null != o && (null != n && (r = t.join(n, r)), null != i && (r = t.relative(i, r)), 
this.setSourceContent(r, o));
}, this);
}
_validateMapping(e, t, r, o) {
if (t && "number" != typeof t.line && "number" != typeof t.column) throw new Error("original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values.");
if (e && "line" in e && "column" in e && e.line > 0 && e.column >= 0 && !t && !r && !o) ; else if (!(e && "line" in e && "column" in e && t && "line" in t && "column" in t && e.line > 0 && e.column >= 0 && t.line > 0 && t.column >= 0 && r)) throw new Error("Invalid mapping: " + JSON.stringify({
generated: e,
source: r,
original: t,
name: o
}));
}
_serializeMappings() {
let r, o, n, a, i = 0, s = 1, c = 0, l = 0, u = 0, m = 0, p = "";
const d = this._mappings.toArray();
for (let f = 0, y = d.length; f < y; f++) {
if (o = d[f], r = "", o.generatedLine !== s) for (i = 0; o.generatedLine !== s; ) r += ";", 
s++; else if (f > 0) {
if (!t.compareByGeneratedPositionsInflated(o, d[f - 1])) continue;
r += ",";
}
r += e.encode(o.generatedColumn - i), i = o.generatedColumn, null != o.source && (a = this._sources.indexOf(o.source), 
r += e.encode(a - m), m = a, r += e.encode(o.originalLine - 1 - l), l = o.originalLine - 1, 
r += e.encode(o.originalColumn - c), c = o.originalColumn, null != o.name && (n = this._names.indexOf(o.name), 
r += e.encode(n - u), u = n)), p += r;
}
return p;
}
_generateSourcesContent(e, r) {
return e.map(function(e) {
if (!this._sourcesContents) return null;
null != r && (e = t.relative(r, e));
const o = t.toSetString(e);
return Object.prototype.hasOwnProperty.call(this._sourcesContents, o) ? this._sourcesContents[o] : null;
}, this);
}
toJSON() {
const e = {
version: this._version,
sources: this._sources.toArray(),
names: this._names.toArray(),
mappings: this._serializeMappings()
};
return null != this._file && (e.file = this._file), null != this._sourceRoot && (e.sourceRoot = this._sourceRoot), 
this._sourcesContents && (e.sourcesContent = this._generateSourcesContent(e.sources, e.sourceRoot)), 
e;
}
toString() {
return JSON.stringify(this.toJSON());
}
}
return n.prototype._version = 3, R.SourceMapGenerator = n, R;
}

var D, F = {}, B = {};

function H() {
return D || (D = 1, function(e) {
function t(r, o, n, a, i, s) {
const c = Math.floor((o - r) / 2) + r, l = i(n, a[c], !0);
return 0 === l ? c : l > 0 ? o - c > 1 ? t(c, o, n, a, i, s) : s === e.LEAST_UPPER_BOUND ? o < a.length ? o : -1 : c : c - r > 1 ? t(r, c, n, a, i, s) : s == e.LEAST_UPPER_BOUND ? c : r < 0 ? -1 : r;
}
e.GREATEST_LOWER_BOUND = 1, e.LEAST_UPPER_BOUND = 2, e.search = function(r, o, n, a) {
if (0 === o.length) return -1;
let i = t(-1, o.length, r, o, n, a || e.GREATEST_LOWER_BOUND);
if (i < 0) return -1;
for (;i - 1 >= 0 && 0 === n(o[i], o[i - 1], !0); ) --i;
return i;
};
}(B)), B;
}

var W, Y, K, V, q = {
exports: {}
};

function j() {
if (W) return q.exports;
W = 1;
let e = null;
return q.exports = function() {
if ("string" == typeof e) return fetch(e).then(e => e.arrayBuffer());
if (e instanceof ArrayBuffer) return Promise.resolve(e);
throw new Error("You must provide the string URL or ArrayBuffer contents of lib/mappings.wasm by calling SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) before using SourceMapConsumer");
}, q.exports.initialize = t => {
e = t;
}, q.exports;
}

function z() {
if (K) return Y;
K = 1;
const e = j();
function t() {
this.generatedLine = 0, this.generatedColumn = 0, this.lastGeneratedColumn = null, 
this.source = null, this.originalLine = null, this.originalColumn = null, this.name = null;
}
let r = null;
return Y = function() {
if (r) return r;
const o = [];
return r = e().then(e => WebAssembly.instantiate(e, {
env: {
mapping_callback(e, r, n, a, i, s, c, l, u, m) {
const p = new t;
p.generatedLine = e + 1, p.generatedColumn = r, n && (p.lastGeneratedColumn = a - 1), 
i && (p.source = s, p.originalLine = c + 1, p.originalColumn = l, u && (p.name = m)), 
o[o.length - 1](p);
},
start_all_generated_locations_for() {
console.time("all_generated_locations_for");
},
end_all_generated_locations_for() {
console.timeEnd("all_generated_locations_for");
},
start_compute_column_spans() {
console.time("compute_column_spans");
},
end_compute_column_spans() {
console.timeEnd("compute_column_spans");
},
start_generated_location_for() {
console.time("generated_location_for");
},
end_generated_location_for() {
console.timeEnd("generated_location_for");
},
start_original_location_for() {
console.time("original_location_for");
},
end_original_location_for() {
console.timeEnd("original_location_for");
},
start_parse_mappings() {
console.time("parse_mappings");
},
end_parse_mappings() {
console.timeEnd("parse_mappings");
},
start_sort_by_generated_location() {
console.time("sort_by_generated_location");
},
end_sort_by_generated_location() {
console.timeEnd("sort_by_generated_location");
},
start_sort_by_original_location() {
console.time("sort_by_original_location");
},
end_sort_by_original_location() {
console.timeEnd("sort_by_original_location");
}
}
})).then(e => ({
exports: e.instance.exports,
withMappingCallback: (e, t) => {
o.push(e);
try {
t();
} finally {
o.pop();
}
}
})).then(null, e => {
throw r = null, e;
}), r;
};
}

var X, Q, Z = {}, J = (Q || (Q = 1, v.SourceMapGenerator = L().SourceMapGenerator, 
v.SourceMapConsumer = function() {
if (V) return F;
V = 1;
const e = A(), t = H(), r = N().ArraySet;
S();
const o = j(), n = z(), a = Symbol("smcInternal");
class i {
constructor(t, r) {
return t == a ? Promise.resolve(this) : function(t, r) {
let o = t;
"string" == typeof t && (o = e.parseSourceMapInput(t));
const n = null != o.sections ? new c(o, r) : new s(o, r);
return Promise.resolve(n);
}(t, r);
}
static initialize(e) {
o.initialize(e["lib/mappings.wasm"]);
}
static fromSourceMap(e, t) {
return function(e, t) {
return s.fromSourceMap(e, t);
}(e, t);
}
static async with(e, t, r) {
const o = await new i(e, t);
try {
return await r(o);
} finally {
o.destroy();
}
}
eachMapping(e, t, r) {
throw new Error("Subclasses must implement eachMapping");
}
allGeneratedPositionsFor(e) {
throw new Error("Subclasses must implement allGeneratedPositionsFor");
}
destroy() {
throw new Error("Subclasses must implement destroy");
}
}
i.prototype._version = 3, i.GENERATED_ORDER = 1, i.ORIGINAL_ORDER = 2, i.GREATEST_LOWER_BOUND = 1, 
i.LEAST_UPPER_BOUND = 2, F.SourceMapConsumer = i;
class s extends i {
constructor(t, o) {
return super(a).then(a => {
let i = t;
"string" == typeof t && (i = e.parseSourceMapInput(t));
const s = e.getArg(i, "version"), c = e.getArg(i, "sources").map(String), l = e.getArg(i, "names", []), u = e.getArg(i, "sourceRoot", null), m = e.getArg(i, "sourcesContent", null), p = e.getArg(i, "mappings"), d = e.getArg(i, "file", null), f = e.getArg(i, "x_google_ignoreList", null);
if (s != a._version) throw new Error("Unsupported version: " + s);
return a._sourceLookupCache = new Map, a._names = r.fromArray(l.map(String), !0), 
a._sources = r.fromArray(c, !0), a._absoluteSources = r.fromArray(a._sources.toArray().map(function(t) {
return e.computeSourceURL(u, t, o);
}), !0), a.sourceRoot = u, a.sourcesContent = m, a._mappings = p, a._sourceMapURL = o, 
a.file = d, a.x_google_ignoreList = f, a._computedColumnSpans = !1, a._mappingsPtr = 0, 
a._wasm = null, n().then(e => (a._wasm = e, a));
});
}
_findSourceIndex(t) {
const r = this._sourceLookupCache.get(t);
if ("number" == typeof r) return r;
const o = e.computeSourceURL(null, t, this._sourceMapURL);
if (this._absoluteSources.has(o)) {
const e = this._absoluteSources.indexOf(o);
return this._sourceLookupCache.set(t, e), e;
}
const n = e.computeSourceURL(this.sourceRoot, t, this._sourceMapURL);
if (this._absoluteSources.has(n)) {
const e = this._absoluteSources.indexOf(n);
return this._sourceLookupCache.set(t, e), e;
}
return -1;
}
static fromSourceMap(e, t) {
return new s(e.toString());
}
get sources() {
return this._absoluteSources.toArray();
}
_getMappingsPtr() {
return 0 === this._mappingsPtr && this._parseMappings(), this._mappingsPtr;
}
_parseMappings() {
const e = this._mappings, t = e.length, r = this._wasm.exports.allocate_mappings(t) >>> 0, o = new Uint8Array(this._wasm.exports.memory.buffer, r, t);
for (let r = 0; r < t; r++) o[r] = e.charCodeAt(r);
const n = this._wasm.exports.parse_mappings(r);
if (!n) {
const e = this._wasm.exports.get_last_error();
let t = `Error parsing mappings (code ${e}): `;
switch (e) {
case 1:
t += "the mappings contained a negative line, column, source index, or name index";
break;

case 2:
t += "the mappings contained a number larger than 2**32";
break;

case 3:
t += "reached EOF while in the middle of parsing a VLQ";
break;

case 4:
t += "invalid base 64 character while parsing a VLQ";
break;

default:
t += "unknown error code";
}
throw new Error(t);
}
this._mappingsPtr = n;
}
eachMapping(e, t, r) {
const o = t || null, n = r || i.GENERATED_ORDER;
this._wasm.withMappingCallback(t => {
null !== t.source && (t.source = this._absoluteSources.at(t.source), null !== t.name && (t.name = this._names.at(t.name))), 
this._computedColumnSpans && null === t.lastGeneratedColumn && (t.lastGeneratedColumn = 1 / 0), 
e.call(o, t);
}, () => {
switch (n) {
case i.GENERATED_ORDER:
this._wasm.exports.by_generated_location(this._getMappingsPtr());
break;

case i.ORIGINAL_ORDER:
this._wasm.exports.by_original_location(this._getMappingsPtr());
break;

default:
throw new Error("Unknown order of iteration.");
}
});
}
allGeneratedPositionsFor(t) {
let r = e.getArg(t, "source");
const o = e.getArg(t, "line"), n = t.column || 0;
if (r = this._findSourceIndex(r), r < 0) return [];
if (o < 1) throw new Error("Line numbers must be >= 1");
if (n < 0) throw new Error("Column numbers must be >= 0");
const a = [];
return this._wasm.withMappingCallback(e => {
let t = e.lastGeneratedColumn;
this._computedColumnSpans && null === t && (t = 1 / 0), a.push({
line: e.generatedLine,
column: e.generatedColumn,
lastColumn: t
});
}, () => {
this._wasm.exports.all_generated_locations_for(this._getMappingsPtr(), r, o - 1, "column" in t, n);
}), a;
}
destroy() {
0 !== this._mappingsPtr && (this._wasm.exports.free_mappings(this._mappingsPtr), 
this._mappingsPtr = 0);
}
computeColumnSpans() {
this._computedColumnSpans || (this._wasm.exports.compute_column_spans(this._getMappingsPtr()), 
this._computedColumnSpans = !0);
}
originalPositionFor(t) {
const r = {
generatedLine: e.getArg(t, "line"),
generatedColumn: e.getArg(t, "column")
};
if (r.generatedLine < 1) throw new Error("Line numbers must be >= 1");
if (r.generatedColumn < 0) throw new Error("Column numbers must be >= 0");
let o, n = e.getArg(t, "bias", i.GREATEST_LOWER_BOUND);
if (null == n && (n = i.GREATEST_LOWER_BOUND), this._wasm.withMappingCallback(e => o = e, () => {
this._wasm.exports.original_location_for(this._getMappingsPtr(), r.generatedLine - 1, r.generatedColumn, n);
}), o && o.generatedLine === r.generatedLine) {
let t = e.getArg(o, "source", null);
null !== t && (t = this._absoluteSources.at(t));
let r = e.getArg(o, "name", null);
return null !== r && (r = this._names.at(r)), {
source: t,
line: e.getArg(o, "originalLine", null),
column: e.getArg(o, "originalColumn", null),
name: r
};
}
return {
source: null,
line: null,
column: null,
name: null
};
}
hasContentsOfAllSources() {
return !!this.sourcesContent && this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(e) {
return null == e;
});
}
sourceContentFor(e, t) {
if (!this.sourcesContent) return null;
const r = this._findSourceIndex(e);
if (r >= 0) return this.sourcesContent[r];
if (t) return null;
throw new Error('"' + e + '" is not in the SourceMap.');
}
generatedPositionFor(t) {
let r = e.getArg(t, "source");
if (r = this._findSourceIndex(r), r < 0) return {
line: null,
column: null,
lastColumn: null
};
const o = {
source: r,
originalLine: e.getArg(t, "line"),
originalColumn: e.getArg(t, "column")
};
if (o.originalLine < 1) throw new Error("Line numbers must be >= 1");
if (o.originalColumn < 0) throw new Error("Column numbers must be >= 0");
let n, a = e.getArg(t, "bias", i.GREATEST_LOWER_BOUND);
if (null == a && (a = i.GREATEST_LOWER_BOUND), this._wasm.withMappingCallback(e => n = e, () => {
this._wasm.exports.generated_location_for(this._getMappingsPtr(), o.source, o.originalLine - 1, o.originalColumn, a);
}), n && n.source === o.source) {
let t = n.lastGeneratedColumn;
return this._computedColumnSpans && null === t && (t = 1 / 0), {
line: e.getArg(n, "generatedLine", null),
column: e.getArg(n, "generatedColumn", null),
lastColumn: t
};
}
return {
line: null,
column: null,
lastColumn: null
};
}
}
s.prototype.consumer = i, F.BasicSourceMapConsumer = s;
class c extends i {
constructor(t, r) {
return super(a).then(o => {
let n = t;
"string" == typeof t && (n = e.parseSourceMapInput(t));
const a = e.getArg(n, "version"), s = e.getArg(n, "sections");
if (a != o._version) throw new Error("Unsupported version: " + a);
let c = {
line: -1,
column: 0
};
return Promise.all(s.map(t => {
if (t.url) throw new Error("Support for url field in sections not implemented.");
const o = e.getArg(t, "offset"), n = e.getArg(o, "line"), a = e.getArg(o, "column");
if (n < c.line || n === c.line && a < c.column) throw new Error("Section offsets must be ordered and non-overlapping.");
return c = o, new i(e.getArg(t, "map"), r).then(e => ({
generatedOffset: {
generatedLine: n + 1,
generatedColumn: a + 1
},
consumer: e
}));
})).then(e => (o._sections = e, o));
});
}
get sources() {
const e = [];
for (let t = 0; t < this._sections.length; t++) for (let r = 0; r < this._sections[t].consumer.sources.length; r++) e.push(this._sections[t].consumer.sources[r]);
return e;
}
originalPositionFor(r) {
const o = {
generatedLine: e.getArg(r, "line"),
generatedColumn: e.getArg(r, "column")
}, n = t.search(o, this._sections, function(e, t) {
return e.generatedLine - t.generatedOffset.generatedLine || e.generatedColumn - (t.generatedOffset.generatedColumn - 1);
}), a = this._sections[n];
return a ? a.consumer.originalPositionFor({
line: o.generatedLine - (a.generatedOffset.generatedLine - 1),
column: o.generatedColumn - (a.generatedOffset.generatedLine === o.generatedLine ? a.generatedOffset.generatedColumn - 1 : 0),
bias: r.bias
}) : {
source: null,
line: null,
column: null,
name: null
};
}
hasContentsOfAllSources() {
return this._sections.every(function(e) {
return e.consumer.hasContentsOfAllSources();
});
}
sourceContentFor(e, t) {
for (let t = 0; t < this._sections.length; t++) {
const r = this._sections[t].consumer.sourceContentFor(e, !0);
if (r) return r;
}
if (t) return null;
throw new Error('"' + e + '" is not in the SourceMap.');
}
_findSectionIndex(e) {
for (let t = 0; t < this._sections.length; t++) {
const {consumer: r} = this._sections[t];
if (-1 !== r._findSourceIndex(e)) return t;
}
return -1;
}
generatedPositionFor(t) {
const r = this._findSectionIndex(e.getArg(t, "source")), o = r >= 0 ? this._sections[r] : null, n = r >= 0 && r + 1 < this._sections.length ? this._sections[r + 1] : null, a = o && o.consumer.generatedPositionFor(t);
if (a && null !== a.line) {
const e = o.generatedOffset.generatedLine - 1, t = o.generatedOffset.generatedColumn - 1;
return 1 === a.line && (a.column += t, "number" == typeof a.lastColumn && (a.lastColumn += t)), 
a.lastColumn === 1 / 0 && n && a.line === n.generatedOffset.generatedLine && (a.lastColumn = n.generatedOffset.generatedColumn - 2), 
a.line += e, a;
}
return {
line: null,
column: null,
lastColumn: null
};
}
allGeneratedPositionsFor(t) {
const r = this._findSectionIndex(e.getArg(t, "source")), o = r >= 0 ? this._sections[r] : null, n = r >= 0 && r + 1 < this._sections.length ? this._sections[r + 1] : null;
return o ? o.consumer.allGeneratedPositionsFor(t).map(e => {
const t = o.generatedOffset.generatedLine - 1, r = o.generatedOffset.generatedColumn - 1;
return 1 === e.line && (e.column += r, "number" == typeof e.lastColumn && (e.lastColumn += r)), 
e.lastColumn === 1 / 0 && n && e.line === n.generatedOffset.generatedLine && (e.lastColumn = n.generatedOffset.generatedColumn - 2), 
e.line += t, e;
}) : [];
}
eachMapping(e, t, r) {
this._sections.forEach((o, n) => {
const a = n + 1 < this._sections.length ? this._sections[n + 1] : null, {generatedOffset: i} = o, s = i.generatedLine - 1, c = i.generatedColumn - 1;
o.consumer.eachMapping(function(t) {
1 === t.generatedLine && (t.generatedColumn += c, "number" == typeof t.lastGeneratedColumn && (t.lastGeneratedColumn += c)), 
t.lastGeneratedColumn === 1 / 0 && a && t.generatedLine === a.generatedOffset.generatedLine && (t.lastGeneratedColumn = a.generatedOffset.generatedColumn - 2), 
t.generatedLine += s, e.call(this, t);
}, t, r);
});
}
computeColumnSpans() {
for (let e = 0; e < this._sections.length; e++) this._sections[e].consumer.computeColumnSpans();
}
destroy() {
for (let e = 0; e < this._sections.length; e++) this._sections[e].consumer.destroy();
}
}
return F.IndexedSourceMapConsumer = c, F;
}().SourceMapConsumer, v.SourceNode = function() {
if (X) return Z;
X = 1;
const e = L().SourceMapGenerator, t = A(), r = /(\r?\n)/, o = "$$$isSourceNode$$$";
class n {
constructor(e, t, r, n, a) {
this.children = [], this.sourceContents = {}, this.line = null == e ? null : e, 
this.column = null == t ? null : t, this.source = null == r ? null : r, this.name = null == a ? null : a, 
this[o] = !0, null != n && this.add(n);
}
static fromStringWithSourceMap(e, o, a) {
const i = new n, s = e.split(r);
let c = 0;
const l = function() {
return e() + (e() || "");
function e() {
return c < s.length ? s[c++] : void 0;
}
};
let u, m = 1, p = 0, d = null;
return o.eachMapping(function(e) {
if (null !== d) {
if (!(m < e.generatedLine)) {
u = s[c] || "";
const t = u.substr(0, e.generatedColumn - p);
return s[c] = u.substr(e.generatedColumn - p), p = e.generatedColumn, f(d, t), void (d = e);
}
f(d, l()), m++, p = 0;
}
for (;m < e.generatedLine; ) i.add(l()), m++;
p < e.generatedColumn && (u = s[c] || "", i.add(u.substr(0, e.generatedColumn)), 
s[c] = u.substr(e.generatedColumn), p = e.generatedColumn), d = e;
}, this), c < s.length && (d && f(d, l()), i.add(s.splice(c).join(""))), o.sources.forEach(function(e) {
const r = o.sourceContentFor(e);
null != r && (null != a && (e = t.join(a, e)), i.setSourceContent(e, r));
}), i;
function f(e, r) {
if (null === e || void 0 === e.source) i.add(r); else {
const o = a ? t.join(a, e.source) : e.source;
i.add(new n(e.originalLine, e.originalColumn, o, r, e.name));
}
}
}
add(e) {
if (Array.isArray(e)) e.forEach(function(e) {
this.add(e);
}, this); else {
if (!e[o] && "string" != typeof e) throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + e);
e && this.children.push(e);
}
return this;
}
prepend(e) {
if (Array.isArray(e)) for (let t = e.length - 1; t >= 0; t--) this.prepend(e[t]); else {
if (!e[o] && "string" != typeof e) throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + e);
this.children.unshift(e);
}
return this;
}
walk(e) {
let t;
for (let r = 0, n = this.children.length; r < n; r++) t = this.children[r], t[o] ? t.walk(e) : "" !== t && e(t, {
source: this.source,
line: this.line,
column: this.column,
name: this.name
});
}
join(e) {
let t, r;
const o = this.children.length;
if (o > 0) {
for (t = [], r = 0; r < o - 1; r++) t.push(this.children[r]), t.push(e);
t.push(this.children[r]), this.children = t;
}
return this;
}
replaceRight(e, t) {
const r = this.children[this.children.length - 1];
return r[o] ? r.replaceRight(e, t) : "string" == typeof r ? this.children[this.children.length - 1] = r.replace(e, t) : this.children.push("".replace(e, t)), 
this;
}
setSourceContent(e, r) {
this.sourceContents[t.toSetString(e)] = r;
}
walkSourceContents(e) {
for (let t = 0, r = this.children.length; t < r; t++) this.children[t][o] && this.children[t].walkSourceContents(e);
const r = Object.keys(this.sourceContents);
for (let o = 0, n = r.length; o < n; o++) e(t.fromSetString(r[o]), this.sourceContents[r[o]]);
}
toString() {
let e = "";
return this.walk(function(t) {
e += t;
}), e;
}
toStringWithSourceMap(t) {
const r = {
code: "",
line: 1,
column: 0
}, o = new e(t);
let n = !1, a = null, i = null, s = null, c = null;
return this.walk(function(e, t) {
r.code += e, null !== t.source && null !== t.line && null !== t.column ? (a === t.source && i === t.line && s === t.column && c === t.name || o.addMapping({
source: t.source,
original: {
line: t.line,
column: t.column
},
generated: {
line: r.line,
column: r.column
},
name: t.name
}), a = t.source, i = t.line, s = t.column, c = t.name, n = !0) : n && (o.addMapping({
generated: {
line: r.line,
column: r.column
}
}), a = null, n = !1);
for (let i = 0, s = e.length; i < s; i++) 10 === e.charCodeAt(i) ? (r.line++, r.column = 0, 
i + 1 === s ? (a = null, n = !1) : n && o.addMapping({
source: t.source,
original: {
line: t.line,
column: t.column
},
generated: {
line: r.line,
column: r.column
},
name: t.name
})) : r.column++;
}), this.walkSourceContents(function(e, t) {
o.setSourceContent(e, t);
}), {
code: r.code,
map: o
};
}
}
return Z.SourceNode = n, Z;
}().SourceNode), v), $ = "errorMapper_sourceMapAvailable";

function ee(e) {
return null == e ? "" : String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

var te, re = function() {
function t() {}
return Object.defineProperty(t, "consumer", {
get: function() {
var t;
if (void 0 === this._consumer) {
if (!1 === e.heapCache.get($)) return this._consumer = null, this._sourceMapAvailable = !1, 
null;
try {
var r = e.heapCache.get("errorMapper_sourceMapData");
if (!r) return this._consumer = null, this._sourceMapAvailable = !1, e.heapCache.set($, !1, 1 / 0), 
null;
try {
this._consumer = new J.SourceMapConsumer(r), this._sourceMapAvailable = !0, e.heapCache.set($, !0, 1 / 0);
} catch (t) {
console.log("SourceMapConsumer requires async initialization - source maps disabled"), 
this._consumer = null, this._sourceMapAvailable = !1, e.heapCache.set($, !1, 1 / 0);
}
} catch (t) {
this._consumer = null, this._sourceMapAvailable = !1, e.heapCache.set($, !1, 1 / 0);
}
}
return null !== (t = this._consumer) && void 0 !== t ? t : null;
},
enumerable: !1,
configurable: !0
}), t.sourceMappedStackTrace = function(e) {
var t = e instanceof Error ? e.stack : e;
if (Object.prototype.hasOwnProperty.call(this.cache, t)) return this.cache[t];
var r = this.consumer;
if (!r) {
var o = e.toString();
return this.cache[t] = o, o;
}
for (var n, a = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm, i = e.toString(); (n = a.exec(t)) && "main" === n[2]; ) {
var s = r.originalPositionFor({
column: parseInt(n[4], 10),
line: parseInt(n[3], 10)
});
if (null == s.line) break;
s.name ? i += "\n    at ".concat(s.name, " (").concat(s.source, ":").concat(s.line, ":").concat(s.column, ")") : n[1] ? i += "\n    at ".concat(n[1], " (").concat(s.source, ":").concat(s.line, ":").concat(s.column, ")") : i += "\n    at ".concat(s.source, ":").concat(s.line, ":").concat(s.column);
}
return this.cache[t] = i, i;
}, t.wrapLoop = function(e) {
var t = this;
return function() {
try {
e();
} catch (e) {
if (!(e instanceof Error)) throw e;
"sim" in Game.rooms ? console.log("<span style='color:red'>".concat("Source maps don't work in the simulator - displaying original error", "<br>").concat(ee(e.stack), "</span>")) : console.log("<span style='color:red'>".concat(ee(t.sourceMappedStackTrace(e)), "</span>"));
}
};
}, t.cache = {}, t;
}(), oe = {
pheromone: {
updateInterval: 5,
decayFactors: {
expand: .95,
harvest: .9,
build: .92,
upgrade: .93,
defense: .97,
war: .98,
siege: .99,
logistics: .91,
nukeTarget: .99
},
diffusionRates: {
expand: .3,
harvest: .1,
build: .15,
upgrade: .1,
defense: .4,
war: .5,
siege: .6,
logistics: .2,
nukeTarget: .1
},
maxValue: 100,
minValue: 0
},
war: {
dangerThresholds: {
level1HostileCount: 1,
level2HostileCount: 3,
level2DamageThreshold: 100,
level3DamageThreshold: 500
},
postureThresholds: {
defensivePosture: 30,
warPosture: 50,
expandPosture: 40
},
economyStabilityRatio: 1.2,
warSustainedTicks: 100
},
nuke: {
minEnemyRCL: 5,
minThreatLevel: 2,
minNukeScore: 35,
scoring: {
enemyRCLWeight: 2,
hostileStructuresWeight: 3,
warPheromoneWeight: 1.5,
distancePenalty: .5
},
evaluationInterval: 200
},
expansion: {
minEnergySurplus: 1e3,
minBucketForClaim: 8e3,
maxRemoteDistance: 2,
maxClaimDistance: 5,
scoring: {
sourcesWeight: 20,
mineralWeight: 10,
distancePenalty: 5,
hostilePenalty: 30,
terrainPenalty: 2,
highwayBonus: 15
}
},
cpu: {
bucketThresholds: {
lowMode: 2e3,
highMode: 9e3
},
budgets: {
rooms: .4,
creeps: .3,
strategic: .1,
market: .1,
visualization: .1
},
taskFrequencies: {
pheromoneUpdate: 5,
clusterLogic: 10,
strategicDecisions: 20,
marketScan: 100,
nukeEvaluation: 200,
memoryCleanup: 50
}
},
market: {
maxCreditsPerTick: 1e5,
minCreditReserve: 5e4,
safetyBuffer: {
energy: 5e4,
baseMinerals: 5e3
},
priceTolerance: {
buy: .1,
sell: .1,
emergency: .5
},
scanInterval: 100,
tradeCooldown: 10
},
spawn: {
bodyCosts: (te = {}, te[MOVE] = 50, te[WORK] = 100, te[CARRY] = 50, te[ATTACK] = 80, 
te[RANGED_ATTACK] = 150, te[HEAL] = 250, te[CLAIM] = 600, te[TOUGH] = 10, te),
minCreepCounts: {
harvester: 2,
hauler: 2,
upgrader: 1,
builder: 1
},
rolePriorities: {
harvester: 100,
hauler: 90,
queenCarrier: 85,
builder: 70,
upgrader: 60,
guard: 80,
healer: 75,
scout: 40,
claimer: 50
}
},
boost: {
roleBoosts: {
harvester: [ "UO" ],
upgrader: [ "GH", "GH2O", "XGH2O" ],
guard: [ "UH", "LO" ],
healer: [ "LO", "LHO2", "XLHO2" ],
soldier: [ "UH", "KO", "XZHO2" ]
},
boostPriority: [ "XLHO2", "XUH2O", "XZHO2", "XGH2O" ],
minBoostAmount: 30
},
debug: !1,
profiling: !0,
visualizations: !0,
lazyLoadConsoleCommands: !0
}, ne = o({}, oe);

function ae() {
return ne;
}

function ie(e) {
ne = o(o({}, ne), e);
}

var se = function() {
function e(e) {
void 0 === e && (e = "default"), this.namespace = e;
}
return e.prototype.getStore = function() {
var e = global, t = "_cacheHeap_".concat(this.namespace);
return e[t] && e[t].tick === Game.time || (e[t] ? e[t].tick = Game.time : e[t] = {
tick: Game.time,
entries: new Map
}), e[t];
}, e.prototype.get = function(e) {
return this.getStore().entries.get(e);
}, e.prototype.set = function(e, t) {
this.getStore().entries.set(e, t);
}, e.prototype.delete = function(e) {
return this.getStore().entries.delete(e);
}, e.prototype.has = function(e) {
return this.getStore().entries.has(e);
}, e.prototype.keys = function() {
var e = this.getStore();
return Array.from(e.entries.keys());
}, e.prototype.size = function() {
return this.getStore().entries.size;
}, e.prototype.clear = function() {
this.getStore().entries.clear();
}, e.prototype.cleanup = function() {
var e, t, r = this.getStore(), o = 0;
try {
for (var n = a(r.entries), s = n.next(); !s.done; s = n.next()) {
var c = i(s.value, 2), l = c[0], u = c[1];
void 0 !== u.ttl && -1 !== u.ttl && Game.time - u.cachedAt > u.ttl && (r.entries.delete(l), 
o++);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e;
}(), ce = function() {
function e(e, t) {
void 0 === e && (e = "default"), void 0 === t && (t = 10), this.lastPersistTick = 0, 
this.namespace = e, this.persistInterval = t;
}
return e.prototype.getHeap = function() {
var e = global, t = "_cacheMemoryHeap_".concat(this.namespace);
e[t] && e[t].tick === Game.time || (e[t] ? e[t].tick = Game.time : e[t] = {
tick: Game.time,
entries: new Map,
rehydrated: !1
});
var r = e[t];
return r.rehydrated || (this.rehydrate(r), r.rehydrated = !0), r;
}, e.prototype.getMemory = function() {
return Memory._cacheMemory || (Memory._cacheMemory = {}), Memory._cacheMemory[this.namespace] || (Memory._cacheMemory[this.namespace] = {
version: e.CACHE_VERSION,
lastSync: Game.time,
data: {}
}), Memory._cacheMemory[this.namespace];
}, e.prototype.rehydrate = function(e) {
var t, r, o, n, s = this.getMemory(), c = [];
try {
for (var l = a(Object.entries(s.data)), u = l.next(); !u.done; u = l.next()) {
var m = i(u.value, 2), p = m[0], d = m[1];
void 0 !== d.ttl && -1 !== d.ttl && Game.time - d.cachedAt > d.ttl ? c.push(p) : e.entries.set(p, {
value: d.value,
cachedAt: d.cachedAt,
lastAccessed: Game.time,
ttl: d.ttl,
hits: d.hits,
dirty: !1
});
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
try {
for (var f = a(c), y = f.next(); !y.done; y = f.next()) p = y.value, delete s.data[p];
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (n = f.return) && n.call(f);
} finally {
if (o) throw o.error;
}
}
}, e.prototype.get = function(e) {
var t = this.getHeap().entries.get(e);
if (t) return t.lastAccessed !== Game.time && (t.lastAccessed = Game.time, t.dirty = !0), 
t;
}, e.prototype.set = function(e, t) {
this.getHeap().entries.set(e, o(o({}, t), {
dirty: !0
}));
}, e.prototype.delete = function(e) {
var t = this.getHeap().entries.delete(e);
return delete this.getMemory().data[e], t;
}, e.prototype.has = function(e) {
return this.getHeap().entries.has(e);
}, e.prototype.keys = function() {
var e = this.getHeap();
return Array.from(e.entries.keys());
}, e.prototype.size = function() {
return this.getHeap().entries.size;
}, e.prototype.clear = function() {
this.getHeap().entries.clear(), this.getMemory().data = {};
}, e.prototype.cleanup = function() {
var e, t, r, o, n = this.getHeap(), s = this.getMemory(), c = 0;
try {
for (var l = a(n.entries), u = l.next(); !u.done; u = l.next()) {
var m = i(u.value, 2), p = m[0], d = m[1];
void 0 !== d.ttl && -1 !== d.ttl && Game.time - d.cachedAt > d.ttl && (n.entries.delete(p), 
c++);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = l.return) && t.call(l);
} finally {
if (e) throw e.error;
}
}
try {
for (var f = a(Object.entries(s.data)), y = f.next(); !y.done; y = f.next()) {
var g = i(y.value, 2), h = (p = g[0], g[1]);
void 0 !== h.ttl && -1 !== h.ttl && Game.time - h.cachedAt > h.ttl && (delete s.data[p], 
c++);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
return c;
}, e.prototype.persist = function() {
var e, t;
if (Game.time - this.lastPersistTick < this.persistInterval) return 0;
var r = this.getHeap(), o = this.getMemory(), n = 0;
try {
for (var s = a(r.entries), c = s.next(); !c.done; c = s.next()) {
var l = i(c.value, 2), u = l[0], m = l[1];
m.dirty && (o.data[u] = {
value: m.value,
cachedAt: m.cachedAt,
ttl: m.ttl,
hits: m.hits
}, m.dirty = !1, n++);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = s.return) && t.call(s);
} finally {
if (e) throw e.error;
}
}
return o.lastSync = Game.time, this.lastPersistTick = Game.time, n;
}, e.CACHE_VERSION = 1, e;
}();

function le(e, t) {
return !!(e.includes("path:") || e.includes(":path:") || e.includes("scan:") || e.includes("roomFind:") || e.includes("target:") || e.includes("role:"));
}

var ue, me, pe = function() {
function e(e, t) {
var r, o, n;
void 0 === e && (e = "default"), void 0 === t && (t = {}), this.lastPersistTick = 0, 
this.lastSizeCheck = 0, this.namespace = e, this.config = {
syncInterval: null !== (r = t.syncInterval) && void 0 !== r ? r : 10,
maxMemoryBytes: null !== (o = t.maxMemoryBytes) && void 0 !== o ? o : 102400,
persistenceFilter: null !== (n = t.persistenceFilter) && void 0 !== n ? n : le
};
}
return e.prototype.getHeap = function() {
var e = global, t = "_hybridCacheHeap_".concat(this.namespace);
e[t] && e[t].tick === Game.time || (e[t] ? e[t].tick = Game.time : e[t] = {
tick: Game.time,
entries: new Map,
rehydrated: !1,
dirtyKeys: new Set
});
var r = e[t];
return r.rehydrated || (this.rehydrate(r), r.rehydrated = !0), r;
}, e.prototype.getMemory = function() {
return Memory._hybridCache || (Memory._hybridCache = {}), Memory._hybridCache[this.namespace] || (Memory._hybridCache[this.namespace] = {
version: e.CACHE_VERSION,
lastSync: Game.time,
memoryUsageBytes: 0,
data: {}
}), Memory._hybridCache[this.namespace];
}, e.prototype.isExpirable = function(e) {
return void 0 !== e.ttl && -1 !== e.ttl;
}, e.prototype.rehydrate = function(e) {
var t, r, o, n, s = this.getMemory(), c = 0, l = [];
try {
for (var u = a(Object.entries(s.data)), m = u.next(); !m.done; m = u.next()) {
var p = i(m.value, 2), d = p[0], f = p[1];
this.isExpirable(f) && Game.time - f.cachedAt > f.ttl ? l.push(d) : (e.entries.set(d, {
value: f.value,
cachedAt: f.cachedAt,
lastAccessed: Game.time,
ttl: f.ttl,
hits: f.hits,
dirty: !1
}), c++);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
try {
for (var y = a(l), g = y.next(); !g.done; g = y.next()) d = g.value, delete s.data[d];
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (n = y.return) && n.call(y);
} finally {
if (o) throw o.error;
}
}
c > 0 && (s.memoryUsageBytes = this.estimateMemorySize(s.data));
}, e.prototype.get = function(e) {
var t = this.getHeap().entries.get(e);
if (t) return t.lastAccessed = Game.time, t;
}, e.prototype.set = function(e, t) {
var r = this.getHeap(), n = this.config.persistenceFilter(e, t);
r.entries.set(e, o(o({}, t), {
dirty: n
})), n && r.dirtyKeys.add(e);
}, e.prototype.delete = function(e) {
var t = this.getHeap(), r = t.entries.delete(e), o = this.getMemory();
return o.data[e] && (delete o.data[e], o.memoryUsageBytes = this.estimateMemorySize(o.data)), 
t.dirtyKeys.delete(e), r;
}, e.prototype.has = function(e) {
return this.getHeap().entries.has(e);
}, e.prototype.keys = function() {
var e = this.getHeap();
return Array.from(e.entries.keys());
}, e.prototype.size = function() {
return this.getHeap().entries.size;
}, e.prototype.clear = function() {
var e = this.getHeap();
e.entries.clear(), e.dirtyKeys.clear();
var t = this.getMemory();
t.data = {}, t.memoryUsageBytes = 0;
}, e.prototype.cleanup = function() {
var e, t, r, o, n = this.getHeap(), s = this.getMemory(), c = 0;
try {
for (var l = a(n.entries), u = l.next(); !u.done; u = l.next()) {
var m = i(u.value, 2), p = m[0], d = m[1];
this.isExpirable(d) && Game.time - d.cachedAt > d.ttl && (n.entries.delete(p), n.dirtyKeys.delete(p), 
c++);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = l.return) && t.call(l);
} finally {
if (e) throw e.error;
}
}
try {
for (var f = a(Object.entries(s.data)), y = f.next(); !y.done; y = f.next()) {
var g = i(y.value, 2), h = (p = g[0], g[1]);
this.isExpirable(h) && Game.time - h.cachedAt > h.ttl && (delete s.data[p], c++);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
return c > 0 && (s.memoryUsageBytes = this.estimateMemorySize(s.data)), c;
}, e.prototype.persist = function() {
var e, t;
if (Game.time - this.lastPersistTick < this.config.syncInterval) return 0;
var r = this.getHeap(), o = this.getMemory(), n = 0;
try {
for (var i = a(r.dirtyKeys), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = r.entries.get(c);
l && (o.data[c] = {
value: l.value,
cachedAt: l.cachedAt,
ttl: l.ttl,
hits: l.hits
}, l.dirty = !1, n++);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = i.return) && t.call(i);
} finally {
if (e) throw e.error;
}
}
return r.dirtyKeys.clear(), o.lastSync = Game.time, this.lastPersistTick = Game.time, 
o.memoryUsageBytes = this.estimateMemorySize(o.data), Game.time - this.lastSizeCheck >= 10 * this.config.syncInterval && (this.enforceMemoryBudget(), 
this.lastSizeCheck = Game.time), n;
}, e.prototype.estimateMemorySize = function(e) {
try {
return JSON.stringify(e).length;
} catch (t) {
return 1024 * Object.keys(e).length;
}
}, e.prototype.enforceMemoryBudget = function() {
var e, t, r = this.getMemory();
if (!(r.memoryUsageBytes <= this.config.maxMemoryBytes)) {
var o = this.getHeap(), n = Array.from(o.entries.entries()).filter(function(e) {
var t = i(e, 1)[0];
return void 0 !== r.data[t];
}).sort(function(e, t) {
return e[1].lastAccessed - t[1].lastAccessed;
});
try {
for (var s = a(n), c = s.next(); !c.done; c = s.next()) {
var l = i(c.value, 2), u = l[0];
if (l[1], r.memoryUsageBytes <= this.config.maxMemoryBytes) break;
delete r.data[u], r.memoryUsageBytes = this.estimateMemorySize(r.data);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = s.return) && t.call(s);
} finally {
if (e) throw e.error;
}
}
}
}, e.prototype.getRecoveryStats = function() {
var e = this.getMemory();
return {
rehydratedEntries: Object.keys(e.data).length,
memoryUsageBytes: e.memoryUsageBytes,
memoryBudgetBytes: this.config.maxMemoryBytes,
budgetUtilization: e.memoryUsageBytes / this.config.maxMemoryBytes
};
}, e.CACHE_VERSION = 1, e;
}(), de = function() {
function e(e) {
void 0 === e && (e = "heap"), this.stores = new Map, this.stats = new Map, this.defaultStore = e;
}
return e.prototype.getStore = function(e, t) {
var r = null != t ? t : this.defaultStore, o = "".concat(e, ":").concat(r), n = this.stores.get(o);
return n || (n = "memory" === r ? new ce(e) : "hybrid" === r ? new pe(e) : new se(e), 
this.stores.set(o, n)), n;
}, e.prototype.getStats = function(e) {
var t = this.stats.get(e);
return t || (t = {
hits: 0,
misses: 0,
evictions: 0
}, this.stats.set(e, t)), t;
}, e.prototype.makeKey = function(e, t) {
return "".concat(e, ":").concat(t);
}, e.prototype.get = function(e, t) {
var r, o = null !== (r = null == t ? void 0 : t.namespace) && void 0 !== r ? r : "default", n = this.getStore(o, null == t ? void 0 : t.store), a = this.getStats(o), i = this.makeKey(o, e), s = n.get(i);
if (s) return void 0 !== s.ttl && -1 !== s.ttl && Game.time - s.cachedAt > s.ttl ? (n.delete(i), 
a.evictions++, a.misses++, (null == t ? void 0 : t.compute) ? (c = t.compute(), 
this.set(e, c, t), c) : void 0) : (a.hits++, s.hits++, s.lastAccessed = Game.time, 
s.value);
if (a.misses++, null == t ? void 0 : t.compute) {
var c = t.compute();
return this.set(e, c, t), c;
}
}, e.prototype.set = function(e, t, r) {
var o, n = null !== (o = null == r ? void 0 : r.namespace) && void 0 !== o ? o : "default", a = this.getStore(n, null == r ? void 0 : r.store), i = this.makeKey(n, e);
if ((null == r ? void 0 : r.maxSize) && a.size() >= r.maxSize) {
for (var s = Math.max(1, Math.floor(.1 * r.maxSize)), c = 0; c < s; c++) this.evictLRU(n, a);
this.getStats(n).evictions += s;
}
var l = {
value: t,
cachedAt: Game.time,
lastAccessed: Game.time,
ttl: null == r ? void 0 : r.ttl,
hits: 0,
dirty: !0
};
a.set(i, l);
}, e.prototype.invalidate = function(e, t) {
void 0 === t && (t = "default");
var r = "".concat(t, ":heap"), o = "".concat(t, ":memory"), n = "".concat(t, ":hybrid"), a = this.makeKey(t, e), i = !1, s = this.stores.get(r);
s && (i = s.delete(a) || i);
var c = this.stores.get(o);
c && (i = c.delete(a) || i);
var l = this.stores.get(n);
return l && (i = l.delete(a) || i), i;
}, e.prototype.invalidatePattern = function(e, t) {
var r, o, n, i;
void 0 === t && (t = "default");
var s = "".concat(t, ":heap"), c = "".concat(t, ":memory"), l = "".concat(t, ":hybrid"), u = 0, m = [ this.stores.get(s), this.stores.get(c), this.stores.get(l) ].filter(Boolean);
try {
for (var p = a(m), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
if (f) {
var y = f.keys();
try {
for (var g = (n = void 0, a(y)), h = g.next(); !h.done; h = g.next()) {
var v = h.value, R = v.indexOf(":");
if (-1 !== R) {
var E = v.substring(R + 1);
e.test(E) && (f.delete(v), u++);
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (n) throw n.error;
}
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
return u;
}, e.prototype.clear = function(e) {
var t, r, o, n, i;
if (e) {
var s = "".concat(e, ":heap"), c = "".concat(e, ":memory"), l = "".concat(e, ":hybrid");
null === (o = this.stores.get(s)) || void 0 === o || o.clear(), null === (n = this.stores.get(c)) || void 0 === n || n.clear(), 
null === (i = this.stores.get(l)) || void 0 === i || i.clear(), this.stats.delete(e);
} else {
try {
for (var u = a(this.stores.values()), m = u.next(); !m.done; m = u.next()) m.value.clear();
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
this.stats.clear();
}
}, e.prototype.getCacheStats = function(e) {
var t, r, o, n, i, s, c, l, u, m;
if (e) {
var p = this.getStats(e), d = "".concat(e, ":heap"), f = "".concat(e, ":memory"), y = "".concat(e, ":hybrid"), g = null !== (s = null === (i = this.stores.get(d)) || void 0 === i ? void 0 : i.size()) && void 0 !== s ? s : 0, h = null !== (l = null === (c = this.stores.get(f)) || void 0 === c ? void 0 : c.size()) && void 0 !== l ? l : 0, v = null !== (m = null === (u = this.stores.get(y)) || void 0 === u ? void 0 : u.size()) && void 0 !== m ? m : 0, R = (E = p.hits + p.misses) > 0 ? p.hits / E : 0;
return {
hits: p.hits,
misses: p.misses,
hitRate: R,
size: g + h + v,
evictions: p.evictions
};
}
var E, T = 0, C = 0, S = 0, _ = 0;
try {
for (var O = a(this.stats.values()), b = O.next(); !b.done; b = O.next()) T += (p = b.value).hits, 
C += p.misses, S += p.evictions;
} catch (e) {
t = {
error: e
};
} finally {
try {
b && !b.done && (r = O.return) && r.call(O);
} finally {
if (t) throw t.error;
}
}
try {
for (var w = a(this.stores.values()), U = w.next(); !U.done; U = w.next()) _ += U.value.size();
} catch (e) {
o = {
error: e
};
} finally {
try {
U && !U.done && (n = w.return) && n.call(w);
} finally {
if (o) throw o.error;
}
}
return {
hits: T,
misses: C,
hitRate: R = (E = T + C) > 0 ? T / E : 0,
size: _,
evictions: S
};
}, e.prototype.evictLRU = function(e, t) {
var r, o, n = t.keys();
if (0 !== n.length) {
var i = null, s = 1 / 0;
try {
for (var c = a(n), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = t.get(u);
m && m.lastAccessed < s && (s = m.lastAccessed, i = u);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
i && t.delete(i);
}
}, e.prototype.cleanup = function() {
var e, t, r = 0;
try {
for (var o = a(this.stores.values()), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
i.cleanup && (r += i.cleanup());
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
return r;
}, e.prototype.persist = function() {
var e, t, r = 0;
try {
for (var o = a(this.stores.values()), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
i.persist && (r += i.persist());
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
return r;
}, e;
}(), fe = new de("heap");

!function(e) {
e.L1 = "L1", e.L2 = "L2", e.L3 = "L3";
}(ue || (ue = {})), function(e) {
e[e.DEBUG = 0] = "DEBUG", e[e.INFO = 1] = "INFO", e[e.WARN = 2] = "WARN", e[e.ERROR = 3] = "ERROR", 
e[e.NONE = 4] = "NONE";
}(me || (me = {}));

var ye = {
level: me.INFO,
cpuLogging: !1,
enableBatching: !0,
maxBatchSize: 50
}, ge = o({}, ye), he = [];

function ve(e) {
ge.enableBatching ? (he.push(e), he.length >= ge.maxBatchSize && Re()) : console.log(e);
}

function Re() {
0 !== he.length && (console.log(he.join("\n")), he = []);
}

var Ee = new Set([ "type", "level", "message", "tick", "subsystem", "room", "creep", "processId", "shard" ]);

function Te(e, t, r, o) {
void 0 === o && (o = "log");
var n = {
type: o,
level: e,
message: t,
tick: "undefined" != typeof Game ? Game.time : 0,
shard: "undefined" != typeof Game && Game.shard ? Game.shard.name : "shard0"
};
if (r && (r.shard && (n.shard = r.shard), r.subsystem && (n.subsystem = r.subsystem), 
r.room && (n.room = r.room), r.creep && (n.creep = r.creep), r.processId && (n.processId = r.processId), 
r.meta)) for (var a in r.meta) Ee.has(a) || (n[a] = r.meta[a]);
return JSON.stringify(n);
}

function Ce(e, t) {
ge.level <= me.DEBUG && ve(Te("DEBUG", e, t));
}

function Se(e, t) {
ge.level <= me.INFO && ve(Te("INFO", e, t));
}

function _e(e, t) {
ge.level <= me.WARN && ve(Te("WARN", e, t));
}

function Oe(e, t) {
ge.level <= me.ERROR && ve(Te("ERROR", e, t));
}

function be(e, t, r) {
if (!ge.cpuLogging) return t();
var o = Game.cpu.getUsed(), n = t(), a = Game.cpu.getUsed() - o;
return Ce("".concat(e, ": ").concat(a.toFixed(3), " CPU"), r), n;
}

var we = new Set([ "type", "key", "value", "tick", "unit", "subsystem", "room", "shard" ]);

function Ue(e, t, r, o) {
var n = {
type: "stat",
key: e,
value: t,
tick: "undefined" != typeof Game ? Game.time : 0,
shard: "undefined" != typeof Game && Game.shard ? Game.shard.name : "shard0"
};
if (r && (n.unit = r), o && (o.shard && (n.shard = o.shard), o.subsystem && (n.subsystem = o.subsystem), 
o.room && (n.room = o.room), o.meta)) for (var a in o.meta) we.has(a) || (n[a] = o.meta[a]);
ve(JSON.stringify(n));
}

function xe(e) {
return {
debug: function(t, r) {
Ce(t, "string" == typeof r ? {
subsystem: e,
room: r
} : o({
subsystem: e
}, r));
},
info: function(t, r) {
Se(t, "string" == typeof r ? {
subsystem: e,
room: r
} : o({
subsystem: e
}, r));
},
warn: function(t, r) {
_e(t, "string" == typeof r ? {
subsystem: e,
room: r
} : o({
subsystem: e
}, r));
},
error: function(t, r) {
Oe(t, "string" == typeof r ? {
subsystem: e,
room: r
} : o({
subsystem: e
}, r));
},
stat: function(t, r, n, a) {
Ue(t, r, n, "string" == typeof a ? {
subsystem: e,
room: a
} : o({
subsystem: e
}, a));
},
measureCpu: function(t, r, n) {
return be(t, r, "string" == typeof n ? {
subsystem: e,
room: n
} : o({
subsystem: e
}, n));
}
};
}

var Ae, Me = {
debug: Ce,
info: Se,
warn: _e,
error: Oe,
stat: Ue,
measureCpu: be,
configure: function(e) {
ge = o(o({}, ge), e);
},
getConfig: function() {
return o({}, ge);
},
createLogger: xe,
flush: Re
};

!function(e) {
e[e.CRITICAL = 100] = "CRITICAL", e[e.HIGH = 75] = "HIGH", e[e.NORMAL = 50] = "NORMAL", 
e[e.LOW = 25] = "LOW", e[e.BACKGROUND = 10] = "BACKGROUND";
}(Ae || (Ae = {}));

var ke = {
"hostile.detected": Ae.CRITICAL,
"nuke.detected": Ae.CRITICAL,
"safemode.activated": Ae.CRITICAL,
"structure.destroyed": Ae.HIGH,
"hostile.cleared": Ae.HIGH,
"creep.died": Ae.HIGH,
"energy.critical": Ae.HIGH,
"spawn.emergency": Ae.HIGH,
"posture.change": Ae.HIGH,
"spawn.completed": Ae.NORMAL,
"rcl.upgrade": Ae.NORMAL,
"construction.complete": Ae.NORMAL,
"remote.lost": Ae.NORMAL,
"squad.formed": Ae.NORMAL,
"squad.dissolved": Ae.NORMAL,
"market.transaction": Ae.LOW,
"pheromone.update": Ae.LOW,
"cluster.update": Ae.LOW,
"expansion.candidate": Ae.LOW,
"powerbank.discovered": Ae.LOW,
"cpu.spike": Ae.BACKGROUND,
"bucket.modeChange": Ae.BACKGROUND
}, Ne = {
maxEventsPerTick: 50,
maxQueueSize: 200,
lowBucketThreshold: 2e3,
criticalBucketThreshold: 1e3,
maxEventAge: 100,
enableLogging: !1,
statsLogInterval: 100,
enableCoalescing: !0
}, Ie = function() {
function e(e) {
void 0 === e && (e = {}), this.handlers = new Map, this.eventQueue = [], this.handlerIdCounter = 0, 
this.stats = {
eventsEmitted: 0,
eventsProcessed: 0,
eventsDeferred: 0,
eventsDropped: 0,
handlersInvoked: 0,
eventsCoalesced: 0
}, this.tickEvents = new Map, this.config = o(o({}, Ne), e);
}
return e.prototype.on = function(e, t, r) {
var o, n, a, i, s = this;
void 0 === r && (r = {});
var c = {
handler: t,
priority: null !== (o = r.priority) && void 0 !== o ? o : Ae.NORMAL,
minBucket: null !== (n = r.minBucket) && void 0 !== n ? n : 0,
once: null !== (a = r.once) && void 0 !== a && a,
id: "handler_".concat(++this.handlerIdCounter)
}, l = null !== (i = this.handlers.get(e)) && void 0 !== i ? i : [];
return l.push(c), l.sort(function(e, t) {
return t.priority - e.priority;
}), this.handlers.set(e, l), this.config.enableLogging && Me.debug('EventBus: Registered handler for "'.concat(e, '" (id: ').concat(c.id, ")"), {
subsystem: "EventBus"
}), function() {
return s.off(e, c.id);
};
}, e.prototype.once = function(e, t, r) {
return void 0 === r && (r = {}), this.on(e, t, o(o({}, r), {
once: !0
}));
}, e.prototype.off = function(e, t) {
var r = this.handlers.get(e);
if (r) {
var o = r.findIndex(function(e) {
return e.id === t;
});
-1 !== o && (r.splice(o, 1), this.config.enableLogging && Me.debug('EventBus: Unregistered handler "'.concat(t, '" from "').concat(e, '"'), {
subsystem: "EventBus"
}));
}
}, e.prototype.offAll = function(e) {
this.handlers.delete(e), this.config.enableLogging && Me.debug('EventBus: Removed all handlers for "'.concat(e, '"'), {
subsystem: "EventBus"
});
}, e.prototype.getCoalescingKey = function(e, t) {
var r = [ e ], o = function(e, t) {
return "object" == typeof e && null !== e && t in e;
};
return o(t, "roomName") && "string" == typeof t.roomName && r.push(t.roomName), 
o(t, "processId") && "string" == typeof t.processId && r.push(t.processId), o(t, "squadId") && "string" == typeof t.squadId && r.push(t.squadId), 
o(t, "clusterId") && "string" == typeof t.clusterId && r.push(t.clusterId), r.join(":");
}, e.prototype.emit = function(e, t, r) {
var n, a, i, s;
void 0 === r && (r = {});
var c = o(o({}, t), {
tick: Game.time
}), l = null !== (a = null !== (n = r.priority) && void 0 !== n ? n : ke[e]) && void 0 !== a ? a : Ae.NORMAL, u = null !== (i = r.immediate) && void 0 !== i ? i : l >= Ae.CRITICAL, m = null === (s = r.allowCoalescing) || void 0 === s || s;
if (this.config.enableCoalescing && m && !u) {
var p = this.getCoalescingKey(e, c), d = this.tickEvents.get(p);
if (d) return d.count++, this.stats.eventsCoalesced++, void (this.config.enableLogging && Me.debug('EventBus: Coalesced "'.concat(e, '" (count: ').concat(d.count, ")"), {
subsystem: "EventBus"
}));
this.tickEvents.set(p, {
name: e,
payload: c,
priority: l,
count: 1
});
}
this.stats.eventsEmitted++, this.config.enableLogging && Me.debug('EventBus: Emitting "'.concat(e, '" (priority: ').concat(l, ", immediate: ").concat(String(u), ")"), {
subsystem: "EventBus"
});
var f = Game.cpu.bucket;
u || f >= this.config.lowBucketThreshold ? this.processEvent(e, c) : f >= this.config.criticalBucketThreshold ? this.queueEvent(e, c, l) : l >= Ae.CRITICAL ? this.processEvent(e, c) : (this.stats.eventsDropped++, 
this.config.enableLogging && Me.warn('EventBus: Dropped event "'.concat(e, '" due to critical bucket'), {
subsystem: "EventBus"
}));
}, e.prototype.processEvent = function(e, t) {
var r, o, n, i, s = this.handlers.get(e);
if (s && 0 !== s.length) {
var c = Game.cpu.bucket, l = [];
try {
for (var u = a(s), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (!(c < p.minBucket)) try {
p.handler(t), this.stats.handlersInvoked++, p.once && l.push(p.id);
} catch (t) {
var d = t instanceof Error ? t.message : String(t);
Me.error('EventBus: Handler error for "'.concat(e, '": ').concat(d), {
subsystem: "EventBus"
});
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
try {
for (var f = a(l), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
this.off(e, g);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
y && !y.done && (i = f.return) && i.call(f);
} finally {
if (n) throw n.error;
}
}
this.stats.eventsProcessed++;
}
}, e.prototype.queueEvent = function(e, t, r) {
if (this.eventQueue.length >= this.config.maxQueueSize) {
var o = this.eventQueue.map(function(e, t) {
return {
event: e,
index: t
};
}).filter(function(e) {
return e.event.priority < Ae.HIGH;
}).sort(function(e, t) {
return e.event.queuedAt - t.event.queuedAt;
})[0];
if (!(o && o.event.priority < r)) return void this.stats.eventsDropped++;
this.eventQueue.splice(o.index, 1), this.stats.eventsDropped++;
}
var n = {
name: e,
payload: t,
priority: r,
queuedAt: Game.time
};
this.eventQueue.push(n), this.eventQueue.sort(function(e, t) {
return t.priority !== e.priority ? t.priority - e.priority : e.queuedAt - t.queuedAt;
}), this.stats.eventsDeferred++;
}, e.prototype.startTick = function() {
this.tickEvents.clear();
}, e.prototype.processQueue = function() {
var e = this, t = Game.cpu.bucket;
if (!(t < this.config.criticalBucketThreshold)) {
var r = this.config.maxEventsPerTick;
t < this.config.lowBucketThreshold && (r = Math.floor(r / 2));
var o = Game.time;
this.eventQueue = this.eventQueue.filter(function(t) {
return !(o - t.queuedAt > e.config.maxEventAge && (e.stats.eventsDropped++, 1));
});
for (var n = 0; this.eventQueue.length > 0 && n < r; ) {
var a = this.eventQueue.shift();
a && (this.processEvent(a.name, a.payload), n++);
}
}
}, e.prototype.getStats = function() {
var e, t, r = 0;
try {
for (var n = a(this.handlers.values()), i = n.next(); !i.done; i = n.next()) r += i.value.length;
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o(o({}, this.stats), {
queueSize: this.eventQueue.length,
handlerCount: r
});
}, e.prototype.resetStats = function() {
this.stats = {
eventsEmitted: 0,
eventsProcessed: 0,
eventsDeferred: 0,
eventsDropped: 0,
handlersInvoked: 0,
eventsCoalesced: 0
};
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = o(o({}, this.config), e);
}, e.prototype.clear = function() {
this.handlers.clear(), this.eventQueue = [], this.resetStats();
}, e.prototype.getHandlerCount = function(e) {
var t, r;
return null !== (r = null === (t = this.handlers.get(e)) || void 0 === t ? void 0 : t.length) && void 0 !== r ? r : 0;
}, e.prototype.hasHandlers = function(e) {
return this.getHandlerCount(e) > 0;
}, e.prototype.logStats = function() {
if (Game.time % this.config.statsLogInterval === 0) {
var e = this.getStats();
Me.debug("EventBus stats: ".concat(e.eventsEmitted, " emitted, ").concat(e.eventsProcessed, " processed, ") + "".concat(e.eventsDeferred, " deferred, ").concat(e.eventsDropped, " dropped, ") + "".concat(e.eventsCoalesced, " coalesced, ") + "".concat(e.queueSize, " queued, ").concat(e.handlerCount, " handlers"), {
subsystem: "EventBus"
});
}
}, e;
}(), Pe = new Ie, Ge = {
ecoRoomLimit: .1,
warRoomLimit: .25,
overmindLimit: 1,
strictMode: !1
}, Le = function() {
function e(e) {
void 0 === e && (e = {}), this.budgetViolations = new Map, this.config = o(o({}, Ge), e);
}
return e.prototype.checkBudget = function(e, t, r) {
var o, n = this.getBudgetLimit(t), a = r <= n;
if (!a) {
var i = (null !== (o = this.budgetViolations.get(e)) && void 0 !== o ? o : 0) + 1;
this.budgetViolations.set(e, i);
var s = ((r - n) / n * 100).toFixed(1);
this.config.strictMode ? Me.error("CPU budget violation: ".concat(e, " used ").concat(r.toFixed(3), " CPU (limit: ").concat(n, ", overage: ").concat(s, "%)"), {
subsystem: "CPUBudget"
}) : Me.warn("CPU budget exceeded: ".concat(e, " used ").concat(r.toFixed(3), " CPU (limit: ").concat(n, ", overage: ").concat(s, "%)"), {
subsystem: "CPUBudget"
});
}
return a;
}, e.prototype.getBudgetLimit = function(e) {
switch (e) {
case "ecoRoom":
return this.config.ecoRoomLimit;

case "warRoom":
return this.config.warRoomLimit;

case "overmind":
return this.config.overmindLimit;

default:
return .5;
}
}, e.prototype.executeWithBudget = function(e, t, r) {
var o = Game.cpu.getUsed();
try {
var n = r(), a = Game.cpu.getUsed() - o;
return this.checkBudget(e, t, a), n;
} catch (t) {
var i = t instanceof Error ? t.message : String(t);
return Me.error("Error in ".concat(e, ": ").concat(i), {
subsystem: "CPUBudget"
}), null;
}
}, e.prototype.executeRoomWithBudget = function(e, t, r) {
var o = t ? "warRoom" : "ecoRoom", n = Game.cpu.getUsed();
try {
r();
var a = Game.cpu.getUsed() - n;
!this.checkBudget(e, o, a) && this.config.strictMode && Me.warn("Skipping ".concat(e, " due to budget violation"), {
subsystem: "CPUBudget"
});
} catch (t) {
var i = t instanceof Error ? t.message : String(t);
Me.error("Error in room ".concat(e, ": ").concat(i), {
subsystem: "CPUBudget"
});
}
}, e.prototype.getViolationsSummary = function() {
return Array.from(this.budgetViolations.entries()).map(function(e) {
var t = i(e, 2);
return {
subsystem: t[0],
violations: t[1]
};
}).sort(function(e, t) {
return t.violations - e.violations;
});
}, e.prototype.resetViolations = function() {
this.budgetViolations.clear();
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = o(o({}, this.config), e);
}, e;
}();

new Le;

var De, Fe = "object", Be = "path";

function He(e, t) {
return "".concat(e.roomName, ":").concat(e.x, ",").concat(e.y, ":").concat(t.roomName, ":").concat(t.x, ",").concat(t.y);
}

function We(e, t, r, o) {
void 0 === o && (o = {});
var n = He(e, t), a = Room.serializePath(r);
fe.set(n, a, {
namespace: Be,
ttl: o.ttl,
maxSize: 1e3
});
}

var Ye = "roomFind", Ke = ((De = {})[FIND_SOURCES] = 5e3, De[FIND_MINERALS] = 5e3, 
De[FIND_DEPOSITS] = 100, De[FIND_STRUCTURES] = 50, De[FIND_MY_STRUCTURES] = 50, 
De[FIND_HOSTILE_STRUCTURES] = 20, De[FIND_MY_SPAWNS] = 100, De[FIND_MY_CONSTRUCTION_SITES] = 20, 
De[FIND_CONSTRUCTION_SITES] = 20, De[FIND_CREEPS] = 5, De[FIND_MY_CREEPS] = 5, De[FIND_HOSTILE_CREEPS] = 3, 
De[FIND_DROPPED_RESOURCES] = 5, De[FIND_TOMBSTONES] = 10, De[FIND_RUINS] = 10, De[FIND_FLAGS] = 50, 
De[FIND_NUKES] = 20, De[FIND_POWER_CREEPS] = 10, De[FIND_MY_POWER_CREEPS] = 10, 
De);

function Ve(e, t, r) {
var o, n, a = function(e, t, r) {
return r ? "".concat(e, ":").concat(t, ":").concat(r) : "".concat(e, ":").concat(t);
}(e.name, t, null == r ? void 0 : r.filterKey), i = fe.get(a, {
namespace: Ye,
ttl: null !== (n = null !== (o = null == r ? void 0 : r.ttl) && void 0 !== o ? o : Ke[t]) && void 0 !== n ? n : 20,
compute: function() {
return (null == r ? void 0 : r.filter) ? e.find(t, {
filter: r.filter
}) : e.find(t);
}
});
return null != i ? i : [];
}

function qe(e) {
return Ve(e, FIND_SOURCES);
}

function je(e, t) {
return t ? Ve(e, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === t;
},
filterKey: t
}) : Ve(e, FIND_MY_STRUCTURES);
}

function ze(e, t) {
return t ? Ve(e, FIND_DROPPED_RESOURCES, {
filter: function(e) {
return e.resourceType === t;
},
filterKey: t
}) : Ve(e, FIND_DROPPED_RESOURCES);
}

var Xe, Qe = "closest";

function Ze(e, t) {
return "".concat(e, ":").concat(t);
}

function Je(e, t, r, o) {
if (void 0 === o && (o = 10), 0 === t.length) return $e(e, r), null;
if (1 === t.length) return t[0];
var n = Ze(e.name, r), a = fe.get(n, {
namespace: Qe,
ttl: o
});
if (a) {
var i = Game.getObjectById(a);
if (i && t.some(function(e) {
return e.id === i.id;
}) && e.pos.getRangeTo(i.pos) <= 20) return i;
}
var s = e.pos.findClosestByRange(t);
return s ? fe.set(n, s.id, {
namespace: Qe,
ttl: o
}) : $e(e, r), s;
}

function $e(e, t) {
if (t) {
var r = Ze(e.name, t);
fe.invalidate(r, Qe);
} else {
var o = new RegExp("^".concat(e.name, ":"));
fe.invalidatePattern(o, Qe);
}
}

function et(e) {
$e(e);
}

function tt(e) {
try {
return JSON.stringify(e);
} catch (t) {
try {
return String(e);
} catch (e) {
return "[Unserializable]";
}
}
}

!function(e) {
e[e.None = 0] = "None", e[e.Pheromones = 1] = "Pheromones", e[e.Paths = 2] = "Paths", 
e[e.Traffic = 4] = "Traffic", e[e.Defense = 8] = "Defense", e[e.Economy = 16] = "Economy", 
e[e.Construction = 32] = "Construction", e[e.Performance = 64] = "Performance";
}(Xe || (Xe = {}));

var rt, ot = (rt = "VisualizationManager", {
info: function(e, t) {
t ? console.log("[".concat(rt, "] ").concat(e), tt(t)) : console.log("[".concat(rt, "] ").concat(e));
},
warn: function(e, t) {
t ? console.log("[".concat(rt, "] WARN: ").concat(e), tt(t)) : console.log("[".concat(rt, "] WARN: ").concat(e));
},
error: function(e, t) {
t ? console.log("[".concat(rt, "] ERROR: ").concat(e), tt(t)) : console.log("[".concat(rt, "] ERROR: ").concat(e));
},
debug: function(e, t) {
t ? console.log("[".concat(rt, "] DEBUG: ").concat(e), tt(t)) : console.log("[".concat(rt, "] DEBUG: ").concat(e));
}
}), nt = function() {
function e() {
this.perfSamples = {}, this.config = this.loadConfig();
}
return e.prototype.loadConfig = function() {
var e = Memory;
return e.visualConfig || (e.visualConfig = this.createDefaultConfig()), e.visualConfig;
}, e.prototype.saveConfig = function() {
Memory.visualConfig = this.config;
}, e.prototype.createDefaultConfig = function() {
return {
enabledLayers: Xe.Pheromones | Xe.Defense,
mode: "presentation",
layerCosts: {
pheromones: 0,
paths: 0,
traffic: 0,
defense: 0,
economy: 0,
construction: 0
},
totalCost: 0,
cache: {
terrain: {},
structures: {}
},
lastCacheClear: Game.time
};
}, e.prototype.isLayerEnabled = function(e) {
return 0 !== (this.config.enabledLayers & e);
}, e.prototype.enableLayer = function(e) {
this.config.enabledLayers |= e, this.saveConfig();
}, e.prototype.disableLayer = function(e) {
this.config.enabledLayers &= ~e, this.saveConfig();
}, e.prototype.toggleLayer = function(e) {
this.config.enabledLayers ^= e, this.saveConfig();
}, e.prototype.setMode = function(e) {
switch (this.config.mode = e, e) {
case "debug":
this.config.enabledLayers = Xe.Pheromones | Xe.Paths | Xe.Traffic | Xe.Defense | Xe.Economy | Xe.Construction | Xe.Performance;
break;

case "presentation":
this.config.enabledLayers = Xe.Pheromones | Xe.Defense | Xe.Economy;
break;

case "minimal":
this.config.enabledLayers = Xe.Defense;
break;

case "performance":
this.config.enabledLayers = Xe.None;
}
this.saveConfig(), ot.info("Visualization mode set to: ".concat(e));
}, e.prototype.updateFromFlags = function() {
var e, t, r = Game.flags, o = {
viz_pheromones: Xe.Pheromones,
viz_paths: Xe.Paths,
viz_traffic: Xe.Traffic,
viz_defense: Xe.Defense,
viz_economy: Xe.Economy,
viz_construction: Xe.Construction,
viz_performance: Xe.Performance
}, n = function(e, t) {
Object.values(r).some(function(t) {
return t.name === e;
}) && !s.isLayerEnabled(t) && (s.enableLayer(t), ot.info("Enabled layer ".concat(Xe[t], " via flag")));
}, s = this;
try {
for (var c = a(Object.entries(o)), l = c.next(); !l.done; l = c.next()) {
var u = i(l.value, 2);
n(u[0], u[1]);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.trackLayerCost = function(e, t) {
this.perfSamples[e] || (this.perfSamples[e] = []), this.perfSamples[e].push(t), 
this.perfSamples[e].length > 10 && this.perfSamples[e].shift();
var r = this.perfSamples[e], o = r.reduce(function(e, t) {
return e + t;
}, 0) / r.length;
this.config.layerCosts[e] = o, this.config.totalCost = Object.values(this.config.layerCosts).reduce(function(e, t) {
return e + t;
}, 0);
var n = Game.cpu.limit, a = this.config.totalCost / n * 100;
a > 10 && ot.warn("Visualization using ".concat(a.toFixed(1), "% of CPU budget"));
}, e.prototype.getCachedTerrain = function(e) {
var t = this.config.cache.terrain[e];
return !t || Game.time > t.ttl ? null : t.data;
}, e.prototype.cacheTerrain = function(e, t) {
this.config.cache.terrain[e] = {
data: t,
ttl: Game.time + 100
};
}, e.prototype.getCachedStructures = function(e) {
var t = this.config.cache.structures[e];
return !t || Game.time > t.ttl ? null : t.data;
}, e.prototype.cacheStructures = function(e, t) {
this.config.cache.structures[e] = {
data: t,
ttl: Game.time + 100
};
}, e.prototype.clearCache = function(e) {
e ? (delete this.config.cache.terrain[e], delete this.config.cache.structures[e]) : (this.config.cache = {
terrain: {},
structures: {}
}, this.config.lastCacheClear = Game.time), this.saveConfig();
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e.prototype.getPerformanceMetrics = function() {
var e = Game.cpu.limit;
return {
totalCost: this.config.totalCost,
layerCosts: o({}, this.config.layerCosts),
percentOfBudget: this.config.totalCost / e * 100
};
}, e.prototype.measureCost = function(e) {
var t = Game.cpu.getUsed();
return {
result: e(),
cost: Game.cpu.getUsed() - t
};
}, e;
}(), at = null, it = (null === at && (at = new nt), at), st = {
showPheromones: !0,
showPaths: !1,
showCombat: !0,
showResourceFlow: !1,
showSpawnQueue: !0,
showRoomStats: !0,
showStructures: !1,
opacity: .5
}, ct = {
expand: "#00ff00",
harvest: "#ffff00",
build: "#ff8800",
upgrade: "#0088ff",
defense: "#ff0000",
war: "#ff00ff",
siege: "#880000",
logistics: "#00ffff",
nukeTarget: "#ff0088"
}, lt = function() {
function e(e, t) {
void 0 === e && (e = {}), this.config = o(o({}, st), e), this.memoryManager = t;
}
return e.prototype.setMemoryManager = function(e) {
this.memoryManager = e;
}, e.prototype.draw = function(e) {
var t, r = this, o = new RoomVisual(e.name), n = null === (t = this.memoryManager) || void 0 === t ? void 0 : t.getOrInitSwarmState(e.name);
if (it.updateFromFlags(), this.config.showRoomStats && this.drawRoomStats(o, e, n), 
this.config.showPheromones && it.isLayerEnabled(Xe.Pheromones) && n) {
var a = it.measureCost(function() {
r.drawPheromoneBars(o, n), r.drawPheromoneHeatmap(o, n);
}).cost;
it.trackLayerCost("pheromones", a);
}
this.config.showCombat && it.isLayerEnabled(Xe.Defense) && (a = it.measureCost(function() {
r.drawCombatInfo(o, e);
}).cost, it.trackLayerCost("defense", a)), this.config.showSpawnQueue && this.drawSpawnQueue(o, e), 
this.config.showResourceFlow && it.isLayerEnabled(Xe.Economy) && (a = it.measureCost(function() {
r.drawResourceFlow(o, e);
}).cost, it.trackLayerCost("economy", a)), this.config.showPaths && it.isLayerEnabled(Xe.Paths) && (a = it.measureCost(function() {
r.drawTrafficPaths(o, e);
}).cost, it.trackLayerCost("paths", a)), this.config.showStructures && it.isLayerEnabled(Xe.Construction) && (a = it.measureCost(function() {
r.drawEnhancedStructures(o, e);
}).cost, it.trackLayerCost("construction", a)), (null == n ? void 0 : n.collectionPoint) && this.drawCollectionPoint(o, n), 
it.isLayerEnabled(Xe.Performance) && this.drawPerformanceMetrics(o);
}, e.prototype.drawRoomStats = function(e, t, r) {
var o, n, a, i, s, c, l = .5, u = .5, m = .6;
e.rect(0, 0, 8, 6.5, {
fill: "#000000",
opacity: .7,
stroke: "#ffffff",
strokeWidth: .05
});
var p = null !== (n = null === (o = t.controller) || void 0 === o ? void 0 : o.level) && void 0 !== n ? n : 0, d = t.controller ? "".concat(Math.round(t.controller.progress / t.controller.progressTotal * 100), "%") : "N/A";
e.text("".concat(t.name, " | RCL ").concat(p, " (").concat(d, ")"), l, u, {
align: "left",
font: "0.5 monospace",
color: "#ffffff"
}), u += m;
var f = t.energyAvailable, y = t.energyCapacityAvailable, g = y > 0 ? Math.round(f / y * 100) : 0;
if (e.text("Energy: ".concat(f, "/").concat(y, " (").concat(g, "%)"), l, u, {
align: "left",
font: "0.4 monospace",
color: "#ffff00"
}), u += m, t.storage) {
var h = t.storage.store.getUsedCapacity(RESOURCE_ENERGY);
e.text("Storage: ".concat(Math.round(h / 1e3), "k energy"), l, u, {
align: "left",
font: "0.4 monospace",
color: "#00ff00"
}), u += m;
}
r && (e.text("Stage: ".concat(r.colonyLevel), l, u, {
align: "left",
font: "0.4 monospace",
color: "#00ffff"
}), u += m, e.text("Posture: ".concat(null !== (a = r.posture) && void 0 !== a ? a : "eco", " | Danger: ").concat(null !== (i = r.danger) && void 0 !== i ? i : 0), l, u, {
align: "left",
font: "0.4 monospace",
color: null !== (c = [ "#00ff00", "#ffff00", "#ff8800", "#ff0000" ][null !== (s = r.danger) && void 0 !== s ? s : 0]) && void 0 !== c ? c : "#ffffff"
}), u += m);
var v = t.find(FIND_MY_CREEPS).length, R = t.find(FIND_HOSTILE_CREEPS).length;
e.text("Creeps: ".concat(v, " | Hostiles: ").concat(R), l, u, {
align: "left",
font: "0.4 monospace",
color: R > 0 ? "#ff0000" : "#ffffff"
}), u += m;
var E = Game.cpu.getUsed().toFixed(1), T = Game.cpu.bucket;
e.text("CPU: ".concat(E, " | Bucket: ").concat(T), l, u, {
align: "left",
font: "0.4 monospace",
color: T < 3e3 ? "#ff8800" : "#ffffff"
});
}, e.prototype.drawPheromoneBars = function(e, t) {
var r, o, n, s = .5;
if (e.rect(41.5, 0, 8, 5.5, {
fill: "#000000",
opacity: .7,
stroke: "#ffffff",
strokeWidth: .05
}), e.text("Pheromones", 45, s, {
align: "center",
font: "0.5 monospace",
color: "#ffffff"
}), s += .6, t.pheromones) try {
for (var c = a(Object.entries(t.pheromones)), l = c.next(); !l.done; l = c.next()) {
var u = i(l.value, 2), m = u[0], p = u[1], d = null !== (n = ct[m]) && void 0 !== n ? n : "#888888", f = 6 * Math.min(1, p / 100);
e.rect(42, s, 6, .4, {
fill: "#333333",
opacity: .8
}), f > 0 && e.rect(42, s, f, .4, {
fill: d,
opacity: this.config.opacity
}), e.text("".concat(m, ": ").concat(Math.round(p)), 41.8, s + .35, {
align: "right",
font: "0.35 monospace",
color: d
}), s += .5;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.drawPheromoneHeatmap = function(t, r) {
var o, n, s;
if (r.pheromones) {
var c = null, l = e.HEATMAP_MIN_THRESHOLD;
try {
for (var u = a(Object.entries(r.pheromones)), m = u.next(); !m.done; m = u.next()) {
var p = i(m.value, 2), d = p[0], f = p[1];
f > l && (l = f, c = d);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
m && !m.done && (n = u.return) && n.call(u);
} finally {
if (o) throw o.error;
}
}
if (c && !(l < e.HEATMAP_MIN_THRESHOLD)) {
var y = null !== (s = ct[c]) && void 0 !== s ? s : "#888888", g = .15 * Math.min(1, l / 100);
t.rect(40, 10, 8, 5, {
fill: y,
opacity: g
}), t.text("Dominant: ".concat(c), 44, 12.5, {
align: "center",
font: "0.5 monospace",
color: y
}), t.text("Intensity: ".concat(Math.round(l)), 44, 13.5, {
align: "center",
font: "0.4 monospace",
color: "#ffffff"
});
}
}
}, e.prototype.drawCombatInfo = function(e, t) {
var r, o, n, i, s = t.find(FIND_HOSTILE_CREEPS);
try {
for (var c = a(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = this.calculateCreepThreat(u), p = m > 30 ? "#ff0000" : m > 10 ? "#ff8800" : "#ffff00", d = .4 + m / 100, f = .2 + m / 100 * .3;
e.circle(u.pos, {
radius: d,
fill: p,
opacity: f,
stroke: p,
strokeWidth: .1
}), e.text("T:".concat(m), u.pos.x, u.pos.y - .8, {
font: "0.4 monospace",
color: p
}), m > 20 && e.animatedPosition(u.pos.x, u.pos.y, {
color: p,
opacity: .8,
radius: 1,
frames: 8
});
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
if (s.length > 0) {
var y = t.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER;
}
});
try {
for (var g = a(y), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
e.circle(v.pos, {
radius: 5,
fill: "#00ff00",
opacity: .15,
stroke: "#00ff00",
strokeWidth: .05
}), e.circle(v.pos, {
radius: 10,
fill: "#ffff00",
opacity: .08,
stroke: "#ffff00",
strokeWidth: .05
});
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (n) throw n.error;
}
}
}
}, e.prototype.calculateCreepThreat = function(e) {
var t, r, o = 0;
try {
for (var n = a(e.body), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
if (s.hits) switch (s.type) {
case ATTACK:
o += 5 * (s.boost ? 4 : 1);
break;

case RANGED_ATTACK:
o += 4 * (s.boost ? 4 : 1);
break;

case HEAL:
o += 6 * (s.boost ? 4 : 1);
break;

case TOUGH:
o += 1 * (s.boost ? 4 : 1);
break;

case WORK:
o += 2 * (s.boost ? 4 : 1);
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return o;
}, e.prototype.drawSpawnQueue = function(e, t) {
var r, o, n, i = t.find(FIND_MY_SPAWNS);
try {
for (var s = a(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (l.spawning) {
var u = Game.creeps[l.spawning.name], m = 1 - l.spawning.remainingTime / l.spawning.needTime, p = l.pos.x - 1, d = l.pos.y - 1.5;
e.rect(p, d, 2, .3, {
fill: "#333333",
opacity: .8
}), e.rect(p, d, 2 * m, .3, {
fill: "#00ff00",
opacity: .8
});
var f = null == u ? void 0 : u.memory, y = null !== (n = null == f ? void 0 : f.role) && void 0 !== n ? n : l.spawning.name;
e.speech(y, l.pos.x, l.pos.y, {
background: "#2ccf3b",
textcolor: "#000000",
textsize: .4,
opacity: .9
}), l.spawning.remainingTime > l.spawning.needTime - 5 && e.animatedPosition(l.pos.x, l.pos.y, {
color: "#00ff00",
opacity: .6,
radius: 1.2,
frames: 10
});
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
c && !c.done && (o = s.return) && o.call(s);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.drawResourceFlow = function(e, t) {
var r, o, n, i, s, c, l, u, m = t.storage;
if (m) {
var p = t.find(FIND_SOURCES);
try {
for (var d = a(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
this.drawFlowingArrow(e, y.pos, m.pos, "#ffff00", .3);
var g = (y.pos.x + m.pos.x) / 2, h = (y.pos.y + m.pos.y) / 2;
e.resource(RESOURCE_ENERGY, g, h, .2);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
var v = t.find(FIND_MY_SPAWNS);
try {
for (var R = a(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
T.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.drawFlowingArrow(e, m.pos, T.pos, "#00ff00", .3);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
E && !E.done && (i = R.return) && i.call(R);
} finally {
if (n) throw n.error;
}
}
var C = t.controller;
if (C && this.drawFlowingArrow(e, m.pos, C.pos, "#00ffff", .3), m.store.getUsedCapacity() > 0) {
var S = .8, _ = -.8, O = Object.keys(m.store).filter(function(e) {
return m.store[e] > 1e3;
}).sort(function(e, t) {
return m.store[t] - m.store[e];
}).slice(0, 3);
try {
for (var b = a(O), w = b.next(); !w.done; w = b.next()) {
var U = w.value;
e.resource(U, m.pos.x + S, m.pos.y + _, .3), S += .6;
}
} catch (e) {
s = {
error: e
};
} finally {
try {
w && !w.done && (c = b.return) && c.call(b);
} finally {
if (s) throw s.error;
}
}
}
var x = t.terminal;
if (x && x.store.getUsedCapacity() > 0) {
S = .8, _ = -.8, O = Object.keys(x.store).filter(function(e) {
return x.store[e] > 1e3;
}).sort(function(e, t) {
return x.store[t] - x.store[e];
}).slice(0, 3);
try {
for (var A = a(O), M = A.next(); !M.done; M = A.next()) U = M.value, e.resource(U, x.pos.x + S, x.pos.y + _, .3), 
S += .6;
} catch (e) {
l = {
error: e
};
} finally {
try {
M && !M.done && (u = A.return) && u.call(A);
} finally {
if (l) throw l.error;
}
}
}
}
}, e.prototype.drawFlowingArrow = function(e, t, r, o, n) {
e.line(t, r, {
color: o,
opacity: .5 * n,
width: .1,
lineStyle: "dashed"
});
var a = Game.time % 20 / 20, i = t.x + (r.x - t.x) * a, s = t.y + (r.y - t.y) * a;
e.circle(i, s, {
radius: .15,
fill: o,
opacity: n
});
}, e.prototype.drawArrow = function(e, t, r, o, n) {
e.line(t, r, {
color: o,
opacity: n,
width: .1,
lineStyle: "dashed"
});
}, e.prototype.drawEnhancedStructures = function(e, t) {
var r, o, n, i, s, c, l = it.getCachedStructures(t.name);
if (l) try {
for (var u = a(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = this.getStructureDepthOpacity(p.type);
e.structure(p.x, p.y, p.type, {
opacity: d
});
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
} else {
var f = t.find(FIND_STRUCTURES), y = [];
try {
for (var g = a(f), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
d = this.getStructureDepthOpacity(v.structureType), e.structure(v.pos.x, v.pos.y, v.structureType, {
opacity: d
}), y.push({
x: v.pos.x,
y: v.pos.y,
type: v.structureType
});
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (n) throw n.error;
}
}
it.cacheStructures(t.name, y);
}
var R = t.find(FIND_MY_CONSTRUCTION_SITES);
try {
for (var E = a(R), T = E.next(); !T.done; T = E.next()) {
var C = T.value;
e.structure(C.pos.x, C.pos.y, C.structureType, {
opacity: .3
});
}
} catch (e) {
s = {
error: e
};
} finally {
try {
T && !T.done && (c = E.return) && c.call(E);
} finally {
if (s) throw s.error;
}
}
}, e.prototype.getStructureDepthOpacity = function(e) {
switch (e) {
case STRUCTURE_RAMPART:
return .8;

case STRUCTURE_TOWER:
return .9;

case STRUCTURE_SPAWN:
case STRUCTURE_STORAGE:
case STRUCTURE_TERMINAL:
return .85;

case STRUCTURE_ROAD:
return .3;

case STRUCTURE_WALL:
return .9;

default:
return .7;
}
}, e.prototype.drawPerformanceMetrics = function(e) {
var t, r, o = it.getPerformanceMetrics(), n = .5, s = 7.5, c = .5;
e.rect(0, 7, 10, 5.5, {
fill: "#000000",
opacity: .8,
stroke: "#ffff00",
strokeWidth: .05
}), e.text("Visualization Performance", n, s, {
align: "left",
font: "0.5 monospace",
color: "#ffff00"
}), s += c;
var l = o.percentOfBudget > 10 ? "#ff0000" : "#00ff00";
e.text("Total: ".concat(o.totalCost.toFixed(3), " CPU"), n, s, {
align: "left",
font: "0.4 monospace",
color: l
}), s += c, e.text("(".concat(o.percentOfBudget.toFixed(1), "% of budget)"), n, s, {
align: "left",
font: "0.35 monospace",
color: l
}), s += c, e.text("Layer Costs:", n, s, {
align: "left",
font: "0.4 monospace",
color: "#ffffff"
}), s += c;
try {
for (var u = a(Object.entries(o.layerCosts)), m = u.next(); !m.done; m = u.next()) {
var p = i(m.value, 2), d = p[0], f = p[1];
f > 0 && (e.text("  ".concat(d, ": ").concat(f.toFixed(3)), n, s, {
align: "left",
font: "0.35 monospace",
color: "#aaaaaa"
}), s += .4);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawTrafficPaths = function(e, t) {
var r, o, n = t.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
});
try {
for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = c.hits / c.hitsMax, u = "hsl(".concat(120 - 120 * (1 - l), ", 100%, 50%)");
e.circle(c.pos, {
radius: .2,
fill: u,
opacity: .5
});
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.drawBlueprint = function(e, t) {
var r, o;
try {
for (var n = a(t), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
e.structure(s.pos.x, s.pos.y, s.type, {
opacity: .4
});
}
} catch (e) {
r = {
error: e
};
} finally {
try {
i && !i.done && (o = n.return) && o.call(n);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.setConfig = function(e) {
this.config = o(o({}, this.config), e);
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e.prototype.drawCollectionPoint = function(e, t) {
if (t.collectionPoint) {
var r = t.collectionPoint, o = r.x, n = r.y;
e.circle(o, n, {
radius: .5,
fill: "#00ff00",
opacity: .3,
stroke: "#00ff00",
strokeWidth: .1
}), e.text("⚓", o, n + .25, {
font: "0.6 monospace",
color: "#00ff00",
opacity: .8
});
}
}, e.prototype.toggle = function(e) {
"boolean" == typeof this.config[e] && (this.config[e] = !this.config[e]);
}, e.HEATMAP_MIN_THRESHOLD = 10, e;
}();

new lt;

var ut = {
showRoomStatus: !0,
showConnections: !0,
showThreats: !0,
showExpansion: !1,
showResourceFlow: !1,
showHighways: !1,
opacity: .6
}, mt = [ "#00ff00", "#ffff00", "#ff8800", "#ff0000" ], pt = {
eco: "#00ff00",
expand: "#00ffff",
defense: "#ffff00",
war: "#ff8800",
siege: "#ff0000",
evacuate: "#ff00ff"
}, dt = function() {
function e(e, t) {
void 0 === e && (e = {}), this.config = o(o({}, ut), e), this.memoryManager = t;
}
return e.prototype.setMemoryManager = function(e) {
this.memoryManager = e;
}, e.prototype.draw = function() {
var e = Game.map.visual;
this.config.showRoomStatus && this.drawRoomStatus(e), this.config.showConnections && this.drawConnections(e), 
this.config.showThreats && this.drawThreats(e), this.config.showExpansion && this.drawExpansionCandidates(e), 
this.config.showResourceFlow && this.drawResourceFlow(e), this.config.showHighways && this.drawHighways(e);
}, e.prototype.drawRoomStatus = function(e) {
var t, r, o, n, i, s;
try {
for (var c = a(Object.values(Game.rooms)), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (null === (o = u.controller) || void 0 === o ? void 0 : o.my) {
var m = null === (n = this.memoryManager) || void 0 === n ? void 0 : n.getOrInitSwarmState(u.name), p = u.controller.level, d = (null == m ? void 0 : m.danger) ? Math.min(Math.max(m.danger, 0), 3) : 0, f = null !== (i = mt[d]) && void 0 !== i ? i : "#ffffff", y = {
radius: 10,
fill: f,
opacity: .5 * this.config.opacity,
stroke: f,
strokeWidth: 1
};
if (e.circle(new RoomPosition(25, 25, u.name), y), e.text("RCL".concat(p), new RoomPosition(25, 25, u.name), {
color: "#ffffff",
fontSize: 8,
align: "center"
}), m && m.posture && "eco" !== m.posture) {
var g = null !== (s = pt[m.posture]) && void 0 !== s ? s : "#ffffff";
e.text(m.posture.toUpperCase(), new RoomPosition(25, 30, u.name), {
color: g,
fontSize: 6,
align: "center"
});
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawConnections = function(e) {
var t, r, o, n, i = function(t) {
var r, i, c, l;
if (!(null === (o = t.controller) || void 0 === o ? void 0 : o.my)) return "continue";
var u = null === (n = s.memoryManager) || void 0 === n ? void 0 : n.getOrInitSwarmState(t.name);
if (!u) return "continue";
if (u.remoteAssignments && u.remoteAssignments.length > 0) try {
for (var m = (r = void 0, a(u.remoteAssignments)), p = m.next(); !p.done; p = m.next()) {
var d = p.value, f = {
color: "#00ffff",
opacity: .8 * s.config.opacity,
width: .5
};
e.line(new RoomPosition(25, 25, t.name), new RoomPosition(25, 25, d), f);
var y = {
radius: 5,
fill: "#00ffff",
opacity: .3 * s.config.opacity
};
e.circle(new RoomPosition(25, 25, d), y);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
p && !p.done && (i = m.return) && i.call(m);
} finally {
if (r) throw r.error;
}
}
if (u && ("war" === u.posture || "siege" === u.posture)) {
var g = Object.values(Game.rooms).filter(function(e) {
return e.find(FIND_HOSTILE_CREEPS).length > 0 && Game.map.getRoomLinearDistance(t.name, e.name) <= 5;
});
try {
for (var h = (c = void 0, a(g)), v = h.next(); !v.done; v = h.next()) {
var R = v.value, E = {
color: "#ff0000",
opacity: s.config.opacity,
width: 1
};
e.line(new RoomPosition(25, 25, t.name), new RoomPosition(25, 25, R.name), E);
}
} catch (e) {
c = {
error: e
};
} finally {
try {
v && !v.done && (l = h.return) && l.call(h);
} finally {
if (c) throw c.error;
}
}
}
}, s = this;
try {
for (var c = a(Object.values(Game.rooms)), l = c.next(); !l.done; l = c.next()) i(l.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawThreats = function(e) {
var t, r;
try {
for (var o = a(Object.values(Game.rooms)), n = o.next(); !n.done; n = o.next()) {
var i = n.value, s = i.find(FIND_HOSTILE_CREEPS), c = i.find(FIND_HOSTILE_STRUCTURES);
if (s.length > 0 || c.length > 0) {
var l = s.length + 2 * c.length, u = l > 10 ? "#ff0000" : "#ff8800";
e.rect(new RoomPosition(20, 20, i.name), 10, 10, {
fill: u,
opacity: .5 * this.config.opacity,
stroke: u,
strokeWidth: 1
}), e.text("⚠".concat(l), new RoomPosition(25, 25, i.name), {
color: "#ffffff",
fontSize: 8,
align: "center"
});
}
if (i.find(FIND_NUKES).length > 0) {
var m = i.find(FIND_NUKES);
e.circle(new RoomPosition(25, 25, i.name), {
radius: 15,
fill: "#ff00ff",
opacity: .7 * this.config.opacity,
stroke: "#ff00ff",
strokeWidth: 2
}), e.text("☢".concat(m.length), new RoomPosition(25, 25, i.name), {
color: "#ffffff",
fontSize: 10,
align: "center",
backgroundColor: "#ff00ff",
backgroundPadding: 2
});
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
n && !n.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawExpansionCandidates = function(e) {
var t, r, o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), n = function(t) {
if (!t.controller || t.controller.my || t.controller.owner) return "continue";
o.some(function(e) {
return Game.map.getRoomLinearDistance(e.name, t.name) <= 3;
}) && (e.circle(new RoomPosition(25, 25, t.name), {
radius: 8,
fill: "#00ff00",
opacity: .3 * i.config.opacity,
stroke: "#00ff00",
strokeWidth: .5,
lineStyle: "dashed"
}), e.text("EXP", new RoomPosition(25, 25, t.name), {
color: "#00ff00",
fontSize: 6,
align: "center"
}));
}, i = this;
try {
for (var s = a(Object.values(Game.rooms)), c = s.next(); !c.done; c = s.next()) n(c.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawResourceFlow = function(e) {
var t, r, o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var n = a(o), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
if (s.terminal) {
var c = Game.market.orders;
for (var l in c) {
var u = c[l];
u.roomName === s.name && u.remainingAmount < u.amount && e.circle(new RoomPosition(25, 25, s.name), {
radius: 12,
fill: "#ffff00",
opacity: .2 * this.config.opacity,
stroke: "#ffff00",
strokeWidth: .5
});
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawHighways = function(e) {
var t, r;
try {
for (var o = a(Object.values(Game.rooms)), n = o.next(); !n.done; n = o.next()) {
var i = n.value, s = i.name.match(/[WE](\d+)[NS](\d+)/);
if (s) {
var c = parseInt(s[1], 10), l = parseInt(s[2], 10);
c % 10 != 0 && l % 10 != 0 || (e.rect(new RoomPosition(0, 0, i.name), 50, 50, {
fill: "#444444",
opacity: .2 * this.config.opacity
}), c % 10 == 0 && l % 10 == 0 && e.text("SK", new RoomPosition(25, 25, i.name), {
color: "#ff8800",
fontSize: 12,
align: "center"
}));
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
n && !n.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawRoomOverlay = function(e) {
var t = Game.map.visual;
Game.rooms[e] && (t.rect(new RoomPosition(0, 0, e), 50, 50, {
fill: "transparent",
opacity: 1,
stroke: "#00ffff",
strokeWidth: 2
}), t.text(e, new RoomPosition(25, 5, e), {
color: "#00ffff",
fontSize: 10,
align: "center",
backgroundColor: "#000000",
backgroundPadding: 2
}));
}, e.prototype.setConfig = function(e) {
this.config = o(o({}, this.config), e);
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e.prototype.toggle = function(e) {
var t = this.config[e];
"boolean" == typeof t && (this.config[e] = !t);
}, e;
}();

new dt;

var ft, yt = "#555555", gt = "#AAAAAA", ht = "#FFE87B", vt = "#F53547", Rt = "#181818", Et = "#8FBB93", Tt = !1;

"undefined" == typeof RoomVisual || Tt || (Tt = !0, RoomVisual.prototype.structure = function(e, t, r, n) {
void 0 === n && (n = {});
var a = o({
opacity: 1
}, n);
switch (r) {
case STRUCTURE_EXTENSION:
this.circle(e, t, {
radius: .5,
fill: Rt,
stroke: Et,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: yt,
opacity: a.opacity
});
break;

case STRUCTURE_SPAWN:
this.circle(e, t, {
radius: .65,
fill: Rt,
stroke: "#CCCCCC",
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: ht,
opacity: a.opacity
});
break;

case STRUCTURE_POWER_SPAWN:
this.circle(e, t, {
radius: .65,
fill: Rt,
stroke: vt,
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: ht,
opacity: a.opacity
});
break;

case STRUCTURE_TOWER:
this.circle(e, t, {
radius: .6,
fill: Rt,
stroke: Et,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: yt,
opacity: a.opacity
}), this.rect(e - .2, t - .3, .4, .6, {
fill: gt,
opacity: a.opacity
});
break;

case STRUCTURE_STORAGE:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: Et,
strokeWidth: .05,
fill: Rt,
opacity: a.opacity
}), this.rect(e - .35, t - .45, .7, .9, {
fill: ht,
opacity: .6 * a.opacity
});
break;

case STRUCTURE_TERMINAL:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: Et,
strokeWidth: .05,
fill: Rt,
opacity: a.opacity
}), this.circle(e, t, {
radius: .3,
fill: gt,
opacity: a.opacity
}), this.rect(e - .15, t - .15, .3, .3, {
fill: yt,
opacity: a.opacity
});
break;

case STRUCTURE_LAB:
this.circle(e, t, {
radius: .55,
fill: Rt,
stroke: Et,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: yt,
opacity: a.opacity
}), this.rect(e - .15, t + .1, .3, .25, {
fill: gt,
opacity: a.opacity
});
break;

case STRUCTURE_LINK:
this.circle(e, t, {
radius: .5,
fill: Rt,
stroke: Et,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: gt,
opacity: a.opacity
});
break;

case STRUCTURE_NUKER:
this.circle(e, t, {
radius: .65,
fill: Rt,
stroke: "#ff0000",
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: "#ff0000",
opacity: .6 * a.opacity
});
break;

case STRUCTURE_OBSERVER:
this.circle(e, t, {
radius: .6,
fill: Rt,
stroke: Et,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: "#00ffff",
opacity: .6 * a.opacity
});
break;

case STRUCTURE_CONTAINER:
this.rect(e - .45, t - .45, .9, .9, {
fill: Rt,
stroke: Et,
strokeWidth: .05,
opacity: a.opacity
}), this.rect(e - .35, t - .35, .7, .7, {
fill: "transparent",
stroke: yt,
strokeWidth: .05,
opacity: a.opacity
});
break;

case STRUCTURE_ROAD:
this.circle(e, t, {
radius: .175,
fill: "#666",
opacity: a.opacity
});
break;

case STRUCTURE_RAMPART:
this.rect(e - .45, t - .45, .9, .9, {
fill: "transparent",
stroke: "#00ff00",
strokeWidth: .1,
opacity: a.opacity
});
break;

case STRUCTURE_WALL:
this.rect(e - .45, t - .45, .9, .9, {
fill: Rt,
stroke: gt,
strokeWidth: .05,
opacity: a.opacity
});
break;

case STRUCTURE_EXTRACTOR:
this.circle(e, t, {
radius: .6,
fill: Rt,
stroke: Et,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: yt,
opacity: a.opacity
});
break;

default:
this.circle(e, t, {
radius: .5,
fill: yt,
stroke: Et,
strokeWidth: .05,
opacity: a.opacity
});
}
}, RoomVisual.prototype.speech = function(e, t, r, o) {
var n, a, i, s, c;
void 0 === o && (o = {});
var l = null !== (n = o.background) && void 0 !== n ? n : "#2ccf3b", u = null !== (a = o.textcolor) && void 0 !== a ? a : "#000000", m = null !== (i = o.textsize) && void 0 !== i ? i : .5, p = null !== (s = o.textfont) && void 0 !== s ? s : "Times New Roman", d = null !== (c = o.opacity) && void 0 !== c ? c : 1, f = m, y = e.length * f * .4 + .4, g = f + .4;
this.rect(t - y / 2, r - 1 - g, y, g, {
fill: l,
opacity: .9 * d
});
var h = [ [ t - .1, r - 1 ], [ t + .1, r - 1 ], [ t, r - .6 ] ];
this.poly(h, {
fill: l,
opacity: .9 * d,
stroke: "transparent"
}), this.text(e, t, r - 1 - g / 2 + .1, {
color: u,
font: "".concat(f, " ").concat(p),
opacity: d
});
}, RoomVisual.prototype.animatedPosition = function(e, t, r) {
var o, n, a, i;
void 0 === r && (r = {});
var s = null !== (o = r.color) && void 0 !== o ? o : "#ff0000", c = null !== (n = r.opacity) && void 0 !== n ? n : 1, l = null !== (a = r.radius) && void 0 !== a ? a : .75, u = null !== (i = r.frames) && void 0 !== i ? i : 6, m = Game.time % u, p = l * (1 - m / u), d = c * (m / u);
this.circle(e, t, {
radius: p,
fill: "transparent",
stroke: s,
strokeWidth: .1,
opacity: d
});
}, RoomVisual.prototype.resource = function(e, t, r, o) {
var n, a;
void 0 === o && (o = .25);
var i = null !== (a = ((n = {})[RESOURCE_ENERGY] = ht, n[RESOURCE_POWER] = vt, n[RESOURCE_HYDROGEN] = "#FFFFFF", 
n[RESOURCE_OXYGEN] = "#DDDDDD", n[RESOURCE_UTRIUM] = "#48C5E5", n[RESOURCE_LEMERGIUM] = "#24D490", 
n[RESOURCE_KEANIUM] = "#9269EC", n[RESOURCE_ZYNTHIUM] = "#D9B478", n[RESOURCE_CATALYST] = "#F26D6F", 
n[RESOURCE_GHODIUM] = "#FFFFFF", n)[e]) && void 0 !== a ? a : "#CCCCCC";
this.circle(t, r, {
radius: o,
fill: Rt,
opacity: .9
}), this.circle(t, r, {
radius: .8 * o,
fill: i,
opacity: .8
});
var s = e.length <= 2 ? e : e.substring(0, 2).toUpperCase();
this.text(s, t, r + .03, {
color: Rt,
font: "".concat(1.2 * o, " monospace"),
align: "center",
opacity: .9
});
}), function(e) {
e[e.DEBUG = 0] = "DEBUG", e[e.INFO = 1] = "INFO", e[e.WARN = 2] = "WARN", e[e.ERROR = 3] = "ERROR", 
e[e.NONE = 4] = "NONE";
}(ft || (ft = {}));

var Ct = {
level: ft.INFO,
cpuLogging: !1,
enableBatching: !0,
maxBatchSize: 50
}, St = o({}, Ct), _t = [];

function Ot(e) {
St = o(o({}, St), e);
}

function bt() {
return o({}, St);
}

function wt(e) {
St.enableBatching ? (_t.push(e), _t.length >= St.maxBatchSize && Ut()) : console.log(e);
}

function Ut() {
0 !== _t.length && (console.log(_t.join("\n")), _t = []);
}

var xt = new Set([ "type", "level", "message", "tick", "subsystem", "room", "creep", "processId", "shard" ]);

function At(e, t, r, o) {
void 0 === o && (o = "log");
var n = {
type: o,
level: e,
message: t,
tick: "undefined" != typeof Game ? Game.time : 0,
shard: "undefined" != typeof Game && Game.shard ? Game.shard.name : "shard0"
};
if (r && (r.shard && (n.shard = r.shard), r.subsystem && (n.subsystem = r.subsystem), 
r.room && (n.room = r.room), r.creep && (n.creep = r.creep), r.processId && (n.processId = r.processId), 
r.meta)) for (var a in r.meta) xt.has(a) || (n[a] = r.meta[a]);
return JSON.stringify(n);
}

function Mt(e, t) {
St.level <= ft.DEBUG && wt(At("DEBUG", e, t));
}

function kt(e, t) {
St.level <= ft.INFO && wt(At("INFO", e, t));
}

function Nt(e, t) {
St.level <= ft.WARN && wt(At("WARN", e, t));
}

function It(e, t) {
St.level <= ft.ERROR && wt(At("ERROR", e, t));
}

function Pt(e, t, r) {
if (!St.cpuLogging) return t();
var o = Game.cpu.getUsed(), n = t(), a = Game.cpu.getUsed() - o;
return Mt("".concat(e, ": ").concat(a.toFixed(3), " CPU"), r), n;
}

var Gt = new Set([ "type", "key", "value", "tick", "unit", "subsystem", "room", "shard" ]);

function Lt(e, t, r, o) {
var n = {
type: "stat",
key: e,
value: t,
tick: "undefined" != typeof Game ? Game.time : 0,
shard: "undefined" != typeof Game && Game.shard ? Game.shard.name : "shard0"
};
if (r && (n.unit = r), o && (o.shard && (n.shard = o.shard), o.subsystem && (n.subsystem = o.subsystem), 
o.room && (n.room = o.room), o.meta)) for (var a in o.meta) Gt.has(a) || (n[a] = o.meta[a]);
wt(JSON.stringify(n));
}

function Dt(e) {
return {
debug: function(t, r) {
Mt(t, "string" == typeof r ? {
subsystem: e,
room: r
} : o({
subsystem: e
}, r));
},
info: function(t, r) {
kt(t, "string" == typeof r ? {
subsystem: e,
room: r
} : o({
subsystem: e
}, r));
},
warn: function(t, r) {
Nt(t, "string" == typeof r ? {
subsystem: e,
room: r
} : o({
subsystem: e
}, r));
},
error: function(t, r) {
It(t, "string" == typeof r ? {
subsystem: e,
room: r
} : o({
subsystem: e
}, r));
},
stat: function(t, r, n, a) {
Lt(t, r, n, "string" == typeof a ? {
subsystem: e,
room: a
} : o({
subsystem: e
}, a));
},
measureCpu: function(t, r, n) {
return Pt(t, r, "string" == typeof n ? {
subsystem: e,
room: n
} : o({
subsystem: e
}, n));
}
};
}

var Ft = {
debug: Mt,
info: kt,
warn: Nt,
error: It,
stat: Lt,
measureCpu: Pt,
configure: Ot,
getConfig: bt,
createLogger: Dt,
flush: Ut
}, Bt = [], Ht = function() {
function e() {
this.commands = new Map, this.initialized = !1, this.lazyLoadEnabled = !1, this.commandsRegistered = !1, 
this.commandsExposed = !1;
}
return e.prototype.register = function(e, t) {
var r;
this.commands.has(e.name) && Ft.warn('Command "'.concat(e.name, '" is already registered, overwriting'), {
subsystem: "CommandRegistry"
}), this.commands.set(e.name, {
metadata: o(o({}, e), {
category: null !== (r = e.category) && void 0 !== r ? r : "General"
}),
handler: t
}), Ft.debug('Registered command "'.concat(e.name, '"'), {
subsystem: "CommandRegistry"
});
}, e.prototype.unregister = function(e) {
var t = this.commands.delete(e);
return t && Ft.debug('Unregistered command "'.concat(e, '"'), {
subsystem: "CommandRegistry"
}), t;
}, e.prototype.getCommand = function(e) {
return this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad(), 
this.commands.get(e);
}, e.prototype.getCommands = function() {
return this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad(), 
Array.from(this.commands.values());
}, e.prototype.getCommandsByCategory = function() {
var e, t, r, o, n, s;
this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad();
var c = new Map;
try {
for (var l = a(this.commands.values()), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = null !== (n = m.metadata.category) && void 0 !== n ? n : "General", d = null !== (s = c.get(p)) && void 0 !== s ? s : [];
d.push(m), c.set(p, d);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = l.return) && t.call(l);
} finally {
if (e) throw e.error;
}
}
try {
for (var f = a(c), y = f.next(); !y.done; y = f.next()) {
var g = i(y.value, 2), h = (p = g[0], g[1]);
c.set(p, h.sort(function(e, t) {
return e.metadata.name.localeCompare(t.metadata.name);
}));
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
return c;
}, e.prototype.execute = function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad();
var o = this.commands.get(e);
if (!o) return 'Command "'.concat(e, '" not found. Use help() to see available commands.');
try {
return o.handler.apply(o, s([], i(t), !1));
} catch (t) {
var n = t instanceof Error ? t.message : String(t);
return Ft.error('Error executing command "'.concat(e, '": ').concat(n), {
subsystem: "CommandRegistry"
}), "Error: ".concat(n);
}
}, e.prototype.generateHelp = function() {
var e, t, r, o, n, i, s, c = this.getCommandsByCategory(), l = [ "=== Available Console Commands ===", "" ], u = Array.from(c.keys()).sort(function(e, t) {
return "General" === e ? -1 : "General" === t ? 1 : e.localeCompare(t);
});
try {
for (var m = a(u), p = m.next(); !p.done; p = m.next()) {
var d = p.value, f = c.get(d);
if (f && 0 !== f.length) {
l.push("--- ".concat(d, " ---"));
try {
for (var y = (r = void 0, a(f)), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = null !== (s = h.metadata.usage) && void 0 !== s ? s : "".concat(h.metadata.name, "()");
if (l.push("  ".concat(v)), l.push("    ".concat(h.metadata.description)), h.metadata.examples && h.metadata.examples.length > 0) {
l.push("    Examples:");
try {
for (var R = (n = void 0, a(h.metadata.examples)), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
l.push("      ".concat(T));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
E && !E.done && (i = R.return) && i.call(R);
} finally {
if (n) throw n.error;
}
}
}
l.push("");
}
} catch (e) {
r = {
error: e
};
} finally {
try {
g && !g.done && (o = y.return) && o.call(y);
} finally {
if (r) throw r.error;
}
}
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
p && !p.done && (t = m.return) && t.call(m);
} finally {
if (e) throw e.error;
}
}
return l.join("\n");
}, e.prototype.generateCommandHelp = function(e) {
var t, r, o, n;
this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad();
var i = this.commands.get(e);
if (!i) return 'Command "'.concat(e, '" not found. Use help() to see available commands.');
var s = [ "=== ".concat(i.metadata.name, " ==="), "", "Description: ".concat(i.metadata.description), "Usage: ".concat(null !== (o = i.metadata.usage) && void 0 !== o ? o : "".concat(i.metadata.name, "()")), "Category: ".concat(null !== (n = i.metadata.category) && void 0 !== n ? n : "General") ];
if (i.metadata.examples && i.metadata.examples.length > 0) {
s.push(""), s.push("Examples:");
try {
for (var c = a(i.metadata.examples), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
s.push("  ".concat(u));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
}
return s.join("\n");
}, e.prototype.exposeToGlobal = function() {
var e, t, r = this, o = global;
if (!this.commandsExposed || this.lazyLoadEnabled && this.commandsRegistered) {
try {
for (var n = a(this.commands), s = n.next(); !s.done; s = n.next()) {
var c = i(s.value, 2), l = c[0], u = c[1];
o[l] = u.handler;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
this.commandsExposed = !0, Ft.debug("Exposed ".concat(this.commands.size, " commands to global scope"), {
subsystem: "CommandRegistry"
});
}
o.help = function(e) {
return r.lazyLoadEnabled && !r.commandsRegistered && r.triggerLazyLoad(), e ? r.generateCommandHelp(e) : r.generateHelp();
};
}, e.prototype.initialize = function() {
var e = this;
this.initialized || (this.register({
name: "help",
description: "Show available commands and their descriptions",
usage: "help() or help('commandName')",
examples: [ "help()", "help('setLogLevel')" ],
category: "System"
}, function() {
for (var t = [], r = 0; r < arguments.length; r++) t[r] = arguments[r];
var o = t[0];
return void 0 !== o ? e.generateCommandHelp(String(o)) : e.generateHelp();
}), this.initialized = !0, Ft.info("Command registry initialized", {
subsystem: "CommandRegistry"
}));
}, e.prototype.enableLazyLoading = function(e) {
this.lazyLoadEnabled = !0, this.registrationCallback = e, Ft.info("Console commands lazy loading enabled", {
subsystem: "CommandRegistry"
});
}, e.prototype.triggerLazyLoad = function() {
!this.commandsRegistered && this.registrationCallback && (Ft.debug("Lazy loading console commands on first access", {
subsystem: "CommandRegistry"
}), this.commandsRegistered = !0, this.registrationCallback(), this.exposeToGlobal());
}, e.prototype.getCommandCount = function() {
return this.commands.size;
}, e.prototype.isInitialized = function() {
return this.initialized;
}, e.prototype.reset = function() {
this.commands.clear(), this.initialized = !1, this.lazyLoadEnabled = !1, this.commandsRegistered = !1, 
this.commandsExposed = !1, this.registrationCallback = void 0;
}, e;
}(), Wt = new Ht;

function Yt(e) {
return function(t, r, o) {
Bt.push({
metadata: e,
methodName: String(r),
target: t
});
};
}

function Kt(e) {
var t, r, o = Object.getPrototypeOf(e);
try {
for (var n = a(Bt), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
if (Vt(s.target, o)) {
var c = e[s.methodName];
if ("function" == typeof c) {
var l = c.bind(e);
Wt.register(s.metadata, l), Ft.debug('Registered decorated command "'.concat(s.metadata.name, '"'), {
subsystem: "CommandRegistry"
});
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}

function Vt(e, t) {
return null !== t && (e === t || Object.getPrototypeOf(e) === t || e === Object.getPrototypeOf(t));
}

var qt, jt = {
maxPredictionTicks: 100,
safetyMargin: .9,
enableLogging: !1
}, zt = function() {
function e(e) {
void 0 === e && (e = {}), this.config = o(o({}, jt), e);
}
return e.prototype.predictEnergyInTicks = function(e, t) {
if (t < 0) throw new Error("Cannot predict negative ticks");
t > this.config.maxPredictionTicks && (Me.warn("Prediction horizon ".concat(t, " exceeds max ").concat(this.config.maxPredictionTicks, ", clamping"), {
subsystem: "EnergyFlowPredictor"
}), t = this.config.maxPredictionTicks);
var r = this.calculateEnergyIncome(e), o = this.calculateEnergyConsumption(e), n = e.energyAvailable, a = r.total * this.config.safetyMargin - o.total, i = Math.max(0, n + a * t), s = {
current: n,
predicted: i,
income: r,
consumption: o,
netFlow: a,
ticks: t
};
return this.config.enableLogging && Me.debug("Energy prediction for ".concat(e.name, ": ").concat(n, " → ").concat(i, " (").concat(t, " ticks, ").concat(a.toFixed(2), "/tick)"), {
subsystem: "EnergyFlowPredictor"
}), s;
}, e.prototype.calculateEnergyIncome = function(e) {
var t = this.calculateHarvesterIncome(e), r = this.calculateMinerIncome(e), o = this.calculateLinkIncome(e);
return {
harvesters: t,
miners: r,
links: o,
total: t + r + o
};
}, e.prototype.calculateEnergyConsumption = function(e) {
var t = this.calculateUpgraderConsumption(e), r = this.calculateBuilderConsumption(e), o = this.calculateTowerConsumption(e), n = this.calculateSpawningConsumption(e), a = this.calculateRepairConsumption(e);
return {
upgraders: t,
builders: r,
towers: o,
spawning: n,
repairs: a,
total: t + r + o + n + a
};
}, e.prototype.calculateHarvesterIncome = function(e) {
var t, r, o = e.find(FIND_MY_CREEPS, {
filter: function(e) {
return "harvester" === e.memory.role || "larvaWorker" === e.memory.role;
}
}), n = 0;
try {
for (var i = a(o), s = i.next(); !s.done; s = i.next()) n += s.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
return 2 * n * .5;
}, e.prototype.calculateMinerIncome = function(e) {
var t, r, o = e.find(FIND_MY_CREEPS, {
filter: function(e) {
return "staticMiner" === e.memory.role || "miner" === e.memory.role;
}
}), n = 0;
try {
for (var i = a(o), s = i.next(); !s.done; s = i.next()) n += s.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
return 2 * n * .9;
}, e.prototype.calculateLinkIncome = function(e) {
return 0;
}, e.prototype.calculateUpgraderConsumption = function(e) {
var t, r, o = e.find(FIND_MY_CREEPS, {
filter: function(e) {
return "upgrader" === e.memory.role;
}
}), n = 0;
try {
for (var i = a(o), s = i.next(); !s.done; s = i.next()) n += s.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
return 1 * n * .7;
}, e.prototype.calculateBuilderConsumption = function(e) {
var t, r, o = e.find(FIND_MY_CREEPS, {
filter: function(e) {
return "builder" === e.memory.role || "repairer" === e.memory.role;
}
});
if (0 === e.find(FIND_MY_CONSTRUCTION_SITES).length) return .1;
var n = 0;
try {
for (var i = a(o), s = i.next(); !s.done; s = i.next()) n += s.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
return 5 * n * .5;
}, e.prototype.calculateTowerConsumption = function(e) {
var t = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER;
}
});
return 0 === t.length ? 0 : .3 * t.length * 10 * 2;
}, e.prototype.calculateSpawningConsumption = function(e) {
var t = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_SPAWN;
}
});
if (0 === t.length) return 0;
var r = e.controller, o = 500;
if (r && r.my) {
var n = r.level;
o = n <= 3 ? 300 : n <= 6 ? 750 : 1500;
}
var a = o / 20;
return t.length * a * .8;
}, e.prototype.calculateRepairConsumption = function(e) {
return .5;
}, e.prototype.getRecommendedSpawnDelay = function(e, t) {
var r = e.energyAvailable;
if (r >= t) return 0;
var o = this.predictEnergyInTicks(e, 1);
if (o.netFlow <= 0) return 999;
var n = t - r, a = Math.ceil(n / o.netFlow);
return Math.min(a, this.config.maxPredictionTicks);
}, e.prototype.canAffordInTicks = function(e, t, r) {
return this.predictEnergyInTicks(e, r).predicted >= t;
}, e.prototype.getMaxAffordableInTicks = function(e, t) {
var r = this.predictEnergyInTicks(e, t);
return Math.min(r.predicted, e.energyCapacityAvailable);
}, e.prototype.setConfig = function(e) {
this.config = o(o({}, this.config), e);
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e;
}(), Xt = new zt, Qt = new (function() {
function e() {}
return e.prototype.predictEnergy = function(e, t) {
void 0 === t && (t = 50);
var r = Game.rooms[e];
if (!r) return "Room ".concat(e, " is not visible");
if (!r.controller || !r.controller.my) return "Room ".concat(e, " is not owned by you");
var o = Xt.predictEnergyInTicks(r, t), n = "=== Energy Prediction: ".concat(e, " ===\n");
return n += "Current Energy: ".concat(o.current, "\n"), n += "Predicted (".concat(t, " ticks): ").concat(Math.round(o.predicted), "\n"), 
n += "Net Flow: ".concat(o.netFlow.toFixed(2), " energy/tick\n\n"), n += "Income Breakdown (per tick):\n", 
n += "  Harvesters: ".concat(o.income.harvesters.toFixed(2), "\n"), n += "  Static Miners: ".concat(o.income.miners.toFixed(2), "\n"), 
n += "  Links: ".concat(o.income.links.toFixed(2), "\n"), n += "  Total: ".concat(o.income.total.toFixed(2), "\n\n"), 
n += "Consumption Breakdown (per tick):\n", n += "  Upgraders: ".concat(o.consumption.upgraders.toFixed(2), "\n"), 
n += "  Builders: ".concat(o.consumption.builders.toFixed(2), "\n"), n += "  Towers: ".concat(o.consumption.towers.toFixed(2), "\n"), 
n += "  Spawning: ".concat(o.consumption.spawning.toFixed(2), "\n"), (n += "  Repairs: ".concat(o.consumption.repairs.toFixed(2), "\n")) + "  Total: ".concat(o.consumption.total.toFixed(2), "\n");
}, e.prototype.showIncome = function(e) {
var t = Game.rooms[e];
if (!t) return "Room ".concat(e, " is not visible");
var r = Xt.calculateEnergyIncome(t), o = "=== Energy Income: ".concat(e, " ===\n");
return o += "Harvesters: ".concat(r.harvesters.toFixed(2), " energy/tick\n"), o += "Static Miners: ".concat(r.miners.toFixed(2), " energy/tick\n"), 
(o += "Links: ".concat(r.links.toFixed(2), " energy/tick\n")) + "Total: ".concat(r.total.toFixed(2), " energy/tick\n");
}, e.prototype.showConsumption = function(e) {
var t = Game.rooms[e];
if (!t) return "Room ".concat(e, " is not visible");
var r = Xt.calculateEnergyConsumption(t), o = "=== Energy Consumption: ".concat(e, " ===\n");
return o += "Upgraders: ".concat(r.upgraders.toFixed(2), " energy/tick\n"), o += "Builders: ".concat(r.builders.toFixed(2), " energy/tick\n"), 
o += "Towers: ".concat(r.towers.toFixed(2), " energy/tick\n"), o += "Spawning: ".concat(r.spawning.toFixed(2), " energy/tick\n"), 
(o += "Repairs: ".concat(r.repairs.toFixed(2), " energy/tick\n")) + "Total: ".concat(r.total.toFixed(2), " energy/tick\n");
}, e.prototype.canAfford = function(e, t, r) {
void 0 === r && (r = 50);
var o = Game.rooms[e];
if (!o) return "Room ".concat(e, " is not visible");
var n = Xt.canAffordInTicks(o, t, r), a = Xt.predictEnergyInTicks(o, r);
if (n) return "✓ Room ".concat(e, " CAN afford ").concat(t, " energy within ").concat(r, " ticks (predicted: ").concat(Math.round(a.predicted), ")");
var i = Xt.getRecommendedSpawnDelay(o, t);
return i >= 999 ? "✗ Room ".concat(e, " CANNOT afford ").concat(t, " energy (negative energy flow)") : "✗ Room ".concat(e, " CANNOT afford ").concat(t, " energy within ").concat(r, " ticks (would need ").concat(i, " ticks)");
}, e.prototype.getSpawnDelay = function(e, t) {
var r = Game.rooms[e];
if (!r) return "Room ".concat(e, " is not visible");
var o = Xt.getRecommendedSpawnDelay(r, t), n = r.energyAvailable;
if (0 === o) return "✓ Room ".concat(e, " can spawn ").concat(t, " energy body NOW (current: ").concat(n, ")");
if (o >= 999) return "✗ Room ".concat(e, " has negative energy flow, cannot spawn ").concat(t, " energy body");
var a = Xt.predictEnergyInTicks(r, o);
return "Room ".concat(e, " needs to wait ").concat(o, " ticks to spawn ").concat(t, " energy body (current: ").concat(n, ", predicted: ").concat(Math.round(a.predicted), ")");
}, n([ Yt({
name: "economy.energy.predict",
description: "Predict energy availability for a room in N ticks",
usage: "economy.energy.predict(roomName, ticks)",
examples: [ "economy.energy.predict('W1N1', 50)", "economy.energy.predict('E1S1', 100)" ],
category: "Economy"
}) ], e.prototype, "predictEnergy", null), n([ Yt({
name: "economy.energy.income",
description: "Show energy income breakdown for a room",
usage: "economy.energy.income(roomName)",
examples: [ "economy.energy.income('W1N1')" ],
category: "Economy"
}) ], e.prototype, "showIncome", null), n([ Yt({
name: "economy.energy.consumption",
description: "Show energy consumption breakdown for a room",
usage: "economy.energy.consumption(roomName)",
examples: [ "economy.energy.consumption('W1N1')" ],
category: "Economy"
}) ], e.prototype, "showConsumption", null), n([ Yt({
name: "economy.energy.canAfford",
description: "Check if a room can afford a certain energy cost within N ticks",
usage: "economy.energy.canAfford(roomName, cost, ticks)",
examples: [ "economy.energy.canAfford('W1N1', 1000, 50)", "economy.energy.canAfford('E1S1', 500, 25)" ],
category: "Economy"
}) ], e.prototype, "canAfford", null), n([ Yt({
name: "economy.energy.spawnDelay",
description: "Get recommended spawn delay for a body cost",
usage: "economy.energy.spawnDelay(roomName, cost)",
examples: [ "economy.energy.spawnDelay('W1N1', 1000)", "economy.energy.spawnDelay('E1S1', 500)" ],
category: "Economy"
}) ], e.prototype, "getSpawnDelay", null), e;
}());

!function(e) {
e[e.DEBUG = 0] = "DEBUG", e[e.INFO = 1] = "INFO", e[e.WARN = 2] = "WARN", e[e.ERROR = 3] = "ERROR", 
e[e.NONE = 4] = "NONE";
}(qt || (qt = {}));

var Zt, Jt = new (function() {
function e() {
this.level = qt.INFO;
}
return e.prototype.setLevel = function(e) {
this.level = e;
}, e.prototype.debug = function(e, t) {
this.level <= qt.DEBUG && console.log(JSON.stringify(o({
level: "DEBUG",
message: e,
tick: Game.time
}, t)));
}, e.prototype.info = function(e, t) {
this.level <= qt.INFO && console.log(JSON.stringify(o({
level: "INFO",
message: e,
tick: Game.time
}, t)));
}, e.prototype.warn = function(e, t) {
this.level <= qt.WARN && console.log(JSON.stringify(o({
level: "WARN",
message: e,
tick: Game.time
}, t)));
}, e.prototype.error = function(e, t) {
this.level <= qt.ERROR && console.log(JSON.stringify(o({
level: "ERROR",
message: e,
tick: Game.time
}, t)));
}, e;
}());

!function(e) {
e[e.CRITICAL = 100] = "CRITICAL", e[e.HIGH = 75] = "HIGH", e[e.NORMAL = 50] = "NORMAL", 
e[e.LOW = 25] = "LOW", e[e.BACKGROUND = 10] = "BACKGROUND";
}(Zt || (Zt = {}));

var $t, er = {
"hostile.detected": Zt.CRITICAL,
"nuke.detected": Zt.CRITICAL,
"safemode.activated": Zt.CRITICAL,
"structure.destroyed": Zt.HIGH,
"hostile.cleared": Zt.HIGH,
"creep.died": Zt.HIGH,
"energy.critical": Zt.HIGH,
"spawn.emergency": Zt.HIGH,
"posture.change": Zt.HIGH,
"spawn.completed": Zt.NORMAL,
"rcl.upgrade": Zt.NORMAL,
"construction.complete": Zt.NORMAL,
"remote.lost": Zt.NORMAL,
"squad.formed": Zt.NORMAL,
"squad.dissolved": Zt.NORMAL,
"market.transaction": Zt.LOW,
"pheromone.update": Zt.LOW,
"cluster.update": Zt.LOW,
"expansion.candidate": Zt.LOW,
"powerbank.discovered": Zt.LOW,
"cpu.spike": Zt.BACKGROUND,
"bucket.modeChange": Zt.BACKGROUND
}, tr = {
maxEventsPerTick: 50,
maxQueueSize: 200,
lowBucketThreshold: 2e3,
criticalBucketThreshold: 1e3,
maxEventAge: 100,
enableLogging: !1,
statsLogInterval: 100
}, rr = function() {
function e(e) {
void 0 === e && (e = {}), this.handlers = new Map, this.eventQueue = [], this.handlerIdCounter = 0, 
this.stats = {
eventsEmitted: 0,
eventsProcessed: 0,
eventsDeferred: 0,
eventsDropped: 0,
handlersInvoked: 0
}, this.config = o(o({}, tr), e);
}
return e.prototype.on = function(e, t, r) {
var o, n, a, i, s = this;
void 0 === r && (r = {});
var c = {
handler: t,
priority: null !== (o = r.priority) && void 0 !== o ? o : Zt.NORMAL,
minBucket: null !== (n = r.minBucket) && void 0 !== n ? n : 0,
once: null !== (a = r.once) && void 0 !== a && a,
id: "handler_".concat(++this.handlerIdCounter)
}, l = null !== (i = this.handlers.get(e)) && void 0 !== i ? i : [];
return l.push(c), l.sort(function(e, t) {
return t.priority - e.priority;
}), this.handlers.set(e, l), this.config.enableLogging && Jt.debug('EventBus: Registered handler for "'.concat(e, '" (id: ').concat(c.id, ")"), {
subsystem: "EventBus"
}), function() {
return s.off(e, c.id);
};
}, e.prototype.once = function(e, t, r) {
return void 0 === r && (r = {}), this.on(e, t, o(o({}, r), {
once: !0
}));
}, e.prototype.off = function(e, t) {
var r = this.handlers.get(e);
if (r) {
var o = r.findIndex(function(e) {
return e.id === t;
});
-1 !== o && (r.splice(o, 1), this.config.enableLogging && Jt.debug('EventBus: Unregistered handler "'.concat(t, '" from "').concat(e, '"'), {
subsystem: "EventBus"
}));
}
}, e.prototype.offAll = function(e) {
this.handlers.delete(e), this.config.enableLogging && Jt.debug('EventBus: Removed all handlers for "'.concat(e, '"'), {
subsystem: "EventBus"
});
}, e.prototype.emit = function(e, t, r) {
var n, a, i;
void 0 === r && (r = {});
var s = o(o({}, t), {
tick: Game.time
}), c = null !== (a = null !== (n = r.priority) && void 0 !== n ? n : er[e]) && void 0 !== a ? a : Zt.NORMAL, l = null !== (i = r.immediate) && void 0 !== i ? i : c >= Zt.CRITICAL;
this.stats.eventsEmitted++, this.config.enableLogging && Jt.debug('EventBus: Emitting "'.concat(e, '" (priority: ').concat(c, ", immediate: ").concat(String(l), ")"), {
subsystem: "EventBus"
});
var u = Game.cpu.bucket;
l || u >= this.config.lowBucketThreshold ? this.processEvent(e, s) : u >= this.config.criticalBucketThreshold ? this.queueEvent(e, s, c) : c >= Zt.CRITICAL ? this.processEvent(e, s) : (this.stats.eventsDropped++, 
this.config.enableLogging && Jt.warn('EventBus: Dropped event "'.concat(e, '" due to critical bucket'), {
subsystem: "EventBus"
}));
}, e.prototype.processEvent = function(e, t) {
var r, o, n, i, s = this.handlers.get(e);
if (s && 0 !== s.length) {
var c = Game.cpu.bucket, l = [];
try {
for (var u = a(s), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (!(c < p.minBucket)) try {
p.handler(t), this.stats.handlersInvoked++, p.once && l.push(p.id);
} catch (t) {
var d = t instanceof Error ? t.message : String(t);
Jt.error('EventBus: Handler error for "'.concat(e, '": ').concat(d), {
subsystem: "EventBus"
});
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
try {
for (var f = a(l), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
this.off(e, g);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
y && !y.done && (i = f.return) && i.call(f);
} finally {
if (n) throw n.error;
}
}
this.stats.eventsProcessed++;
}
}, e.prototype.queueEvent = function(e, t, r) {
if (this.eventQueue.length >= this.config.maxQueueSize) {
var o = this.eventQueue.map(function(e, t) {
return {
event: e,
index: t
};
}).filter(function(e) {
return e.event.priority < Zt.HIGH;
}).sort(function(e, t) {
return e.event.queuedAt - t.event.queuedAt;
})[0];
if (!(o && o.event.priority < r)) return void this.stats.eventsDropped++;
this.eventQueue.splice(o.index, 1), this.stats.eventsDropped++;
}
var n = {
name: e,
payload: t,
priority: r,
queuedAt: Game.time
};
this.eventQueue.push(n), this.eventQueue.sort(function(e, t) {
return t.priority !== e.priority ? t.priority - e.priority : e.queuedAt - t.queuedAt;
}), this.stats.eventsDeferred++;
}, e.prototype.startTick = function() {}, e.prototype.processQueue = function() {
var e = this, t = Game.cpu.bucket;
if (!(t < this.config.criticalBucketThreshold)) {
var r = this.config.maxEventsPerTick;
t < this.config.lowBucketThreshold && (r = Math.floor(r / 2));
var o = Game.time;
this.eventQueue = this.eventQueue.filter(function(t) {
return !(o - t.queuedAt > e.config.maxEventAge && (e.stats.eventsDropped++, 1));
});
for (var n = 0; this.eventQueue.length > 0 && n < r; ) {
var a = this.eventQueue.shift();
a && (this.processEvent(a.name, a.payload), n++);
}
}
}, e.prototype.getStats = function() {
var e, t, r = 0;
try {
for (var n = a(this.handlers.values()), i = n.next(); !i.done; i = n.next()) r += i.value.length;
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o(o({}, this.stats), {
queueSize: this.eventQueue.length,
handlerCount: r
});
}, e.prototype.resetStats = function() {
this.stats = {
eventsEmitted: 0,
eventsProcessed: 0,
eventsDeferred: 0,
eventsDropped: 0,
handlersInvoked: 0
};
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = o(o({}, this.config), e);
}, e.prototype.clear = function() {
this.handlers.clear(), this.eventQueue = [], this.resetStats();
}, e.prototype.getHandlerCount = function(e) {
var t, r;
return null !== (r = null === (t = this.handlers.get(e)) || void 0 === t ? void 0 : t.length) && void 0 !== r ? r : 0;
}, e.prototype.hasHandlers = function(e) {
return this.getHandlerCount(e) > 0;
}, e.prototype.logStats = function() {
if (Game.time % this.config.statsLogInterval === 0) {
var e = this.getStats();
Jt.debug("EventBus stats: ".concat(e.eventsEmitted, " emitted, ").concat(e.eventsProcessed, " processed, ") + "".concat(e.eventsDeferred, " deferred, ").concat(e.eventsDropped, " dropped, ") + "".concat(e.queueSize, " queued, ").concat(e.handlerCount, " handlers"), {
subsystem: "EventBus"
});
}
}, e;
}(), or = new rr, nr = o({}, {
enableAdaptiveBudgets: !0,
cpu: {
bucketThresholds: {
lowMode: 2e3,
highMode: 8e3
},
budgets: {
rooms: .6,
creeps: .25,
strategic: .1,
market: .03,
visualization: .02
},
taskFrequencies: {
pheromoneUpdate: 5,
clusterLogic: 10,
strategicDecisions: 20,
marketScan: 100,
nukeEvaluation: 100,
memoryCleanup: 500
},
ecoRoom: .1,
warRoom: .25,
overmind: 1
}
}), ar = {
baseFrequencyBudgets: {
high: .25,
medium: .06,
low: .05
},
roomScaling: {
minRooms: 1,
scaleFactor: 20,
maxMultiplier: 2.5
},
bucketMultipliers: {
highThreshold: 9e3,
lowThreshold: 2e3,
criticalThreshold: 500,
highMultiplier: 1.2,
lowMultiplier: .6,
criticalMultiplier: .3
}
};

function ir(e, t, r, o) {
void 0 === o && (o = ar);
var n = o.baseFrequencyBudgets[e], a = function(e, t) {
var r = t.roomScaling, o = r.minRooms, n = r.scaleFactor, a = r.maxMultiplier, i = Math.max(e, o), s = 1 + Math.log(i / o) / Math.log(n);
return Math.max(1, Math.min(a, s));
}(t, o), i = function(e, t) {
var r = t.bucketMultipliers, o = r.highThreshold, n = r.lowThreshold, a = r.criticalThreshold, i = r.highMultiplier, s = r.lowMultiplier, c = r.criticalMultiplier;
return e >= o ? i : e < a ? c : e < n ? s : 1;
}(r, o), s = n * a * i;
return Math.max(.01, Math.min(1, s));
}

!function(e) {
e[e.CRITICAL = 100] = "CRITICAL", e[e.HIGH = 75] = "HIGH", e[e.MEDIUM = 50] = "MEDIUM", 
e[e.LOW = 25] = "LOW", e[e.IDLE = 10] = "IDLE";
}($t || ($t = {}));

var sr = {
targetCpuUsage: .98,
reservedCpuFraction: .02,
enableStats: !0,
statsLogInterval: 100,
budgetWarningThreshold: 1.5,
budgetWarningInterval: 500,
enableAdaptiveBudgets: !0,
adaptiveBudgetConfig: ar,
enablePriorityDecay: !0,
priorityDecayRate: 1,
maxPriorityBoost: 50
};

function cr(e) {
var t, r, n = e.bucketThresholds.highMode, a = e.bucketThresholds.lowMode, i = function(e) {
return Math.max(0, Math.floor(e / 2));
}(a), s = (t = e.taskFrequencies, {
high: 1,
medium: Math.max(1, Math.min(t.clusterLogic, t.pheromoneUpdate)),
low: Math.max(t.marketScan, t.nukeEvaluation, t.memoryCleanup)
}), c = (e.bucketThresholds, {
high: 0,
medium: 0,
low: 0
}), l = {
high: (r = e.budgets).rooms,
medium: r.strategic,
low: Math.max(r.market, r.visualization)
};
return o(o({}, sr), {
lowBucketThreshold: a,
highBucketThreshold: n,
criticalBucketThreshold: i,
frequencyIntervals: s,
frequencyMinBucket: c,
frequencyCpuBudgets: l
});
}

var lr = function() {
function e(e) {
this.processes = new Map, this.bucketMode = "normal", this.tickCpuUsed = 0, this.initialized = !1, 
this.lastExecutedProcessId = null, this.lastExecutedIndex = -1, this.processQueue = [], 
this.queueDirty = !0, this.skippedProcessesThisTick = 0, this.config = o({}, e), 
this.validateConfig(), this.frequencyDefaults = this.buildFrequencyDefaults();
}
return e.prototype.registerProcess = function(e) {
var t, r, o, n, a, i = null !== (t = e.frequency) && void 0 !== t ? t : "medium", s = this.frequencyDefaults[i];
if (void 0 !== e.tickModulo) {
if (e.tickModulo < 0) throw Jt.error('Kernel: Cannot register process "'.concat(e.name, '" - tickModulo must be non-negative (got ').concat(e.tickModulo, ")"), {
subsystem: "Kernel"
}), new Error("Invalid tickModulo: ".concat(e.tickModulo, " (must be >= 0)"));
if (void 0 !== e.tickOffset && e.tickOffset >= e.tickModulo) throw Jt.error('Kernel: Cannot register process "'.concat(e.name, '" - tickOffset (').concat(e.tickOffset, ") must be less than tickModulo (").concat(e.tickModulo, ")"), {
subsystem: "Kernel"
}), new Error("Invalid tickOffset: ".concat(e.tickOffset, " (must be < tickModulo ").concat(e.tickModulo, ")"));
}
var c = {
id: e.id,
name: e.name,
priority: null !== (r = e.priority) && void 0 !== r ? r : $t.MEDIUM,
frequency: i,
minBucket: null !== (o = e.minBucket) && void 0 !== o ? o : s.minBucket,
cpuBudget: null !== (n = e.cpuBudget) && void 0 !== n ? n : s.cpuBudget,
interval: null !== (a = e.interval) && void 0 !== a ? a : s.interval,
tickModulo: e.tickModulo,
tickOffset: e.tickOffset,
execute: e.execute,
state: "idle",
stats: {
totalCpu: 0,
runCount: 0,
avgCpu: 0,
maxCpu: 0,
lastRunTick: 0,
skippedCount: 0,
errorCount: 0,
consecutiveErrors: 0,
lastSuccessfulRunTick: 0,
healthScore: 100,
suspendedUntil: null,
suspensionReason: null,
consecutiveCpuSkips: 0
}
};
this.processes.set(e.id, c), this.queueDirty = !0, Jt.debug('Kernel: Registered process "'.concat(c.name, '" (').concat(c.id, ")"), {
subsystem: "Kernel"
});
}, e.prototype.unregisterProcess = function(e) {
var t = this.processes.delete(e);
return t && (this.queueDirty = !0, Jt.debug("Kernel: Unregistered process ".concat(e), {
subsystem: "Kernel"
})), t;
}, e.prototype.getProcess = function(e) {
return this.processes.get(e);
}, e.prototype.getProcesses = function() {
return Array.from(this.processes.values());
}, e.prototype.initialize = function() {
this.initialized || (Jt.info("Kernel initialized with ".concat(this.processes.size, " processes"), {
subsystem: "Kernel"
}), this.initialized = !0);
}, e.prototype.updateBucketMode = function() {
var e, t = Game.cpu.bucket;
if ((e = t < this.config.criticalBucketThreshold ? "critical" : t < this.config.lowBucketThreshold ? "low" : t > this.config.highBucketThreshold ? "high" : "normal") !== this.bucketMode && (Jt.info("Kernel: Bucket mode changed from ".concat(this.bucketMode, " to ").concat(e, " (bucket: ").concat(t, ")"), {
subsystem: "Kernel"
}), this.bucketMode = e), Game.time % 100 == 0 && ("low" === this.bucketMode || "critical" === this.bucketMode)) {
var r = this.processes.size;
Jt.info("Bucket ".concat(this.bucketMode.toUpperCase(), " mode: ").concat(t, "/10000 bucket. ") + "Running all ".concat(r, " processes normally (bucket mode is informational only)"), {
subsystem: "Kernel"
});
}
}, e.prototype.validateConfig = function() {
this.config.criticalBucketThreshold >= this.config.lowBucketThreshold && (Jt.warn("Kernel: Adjusting critical bucket threshold ".concat(this.config.criticalBucketThreshold, " to stay below low threshold ").concat(this.config.lowBucketThreshold), {
subsystem: "Kernel"
}), this.config.criticalBucketThreshold = Math.max(0, this.config.lowBucketThreshold - 1)), 
this.config.lowBucketThreshold >= this.config.highBucketThreshold && (Jt.warn("Kernel: Adjusting high bucket threshold ".concat(this.config.highBucketThreshold, " to stay above low threshold ").concat(this.config.lowBucketThreshold), {
subsystem: "Kernel"
}), this.config.highBucketThreshold = this.config.lowBucketThreshold + 1);
}, e.prototype.buildFrequencyDefaults = function() {
return {
high: {
interval: this.config.frequencyIntervals.high,
minBucket: this.config.frequencyMinBucket.high,
cpuBudget: this.config.frequencyCpuBudgets.high
},
medium: {
interval: this.config.frequencyIntervals.medium,
minBucket: this.config.frequencyMinBucket.medium,
cpuBudget: this.config.frequencyCpuBudgets.medium
},
low: {
interval: this.config.frequencyIntervals.low,
minBucket: this.config.frequencyMinBucket.low,
cpuBudget: this.config.frequencyCpuBudgets.low
}
};
}, e.prototype.updateAdaptiveBudgets = function() {
if (this.config.enableAdaptiveBudgets) {
var e = function(e) {
return void 0 === e && (e = ar), function(e, t, r) {
return void 0 === r && (r = ar), {
high: ir("high", e, t, r),
medium: ir("medium", e, t, r),
low: ir("low", e, t, r)
};
}((t = Object.keys(Game.rooms).length, Math.max(1, t)), Game.cpu.bucket, e);
var t;
}(this.config.adaptiveBudgetConfig);
if (this.config.frequencyCpuBudgets = e, this.frequencyDefaults = this.buildFrequencyDefaults(), 
Game.time % 500 == 0) {
var t = Object.keys(Game.rooms).length, r = Game.cpu.bucket;
Jt.info("Adaptive budgets updated: rooms=".concat(t, ", bucket=").concat(r, ", ") + "high=".concat(e.high.toFixed(3), ", medium=").concat(e.medium.toFixed(3), ", low=").concat(e.low.toFixed(3)), {
subsystem: "Kernel"
});
}
}
}, e.prototype.getBucketMode = function() {
return this.updateBucketMode(), this.bucketMode;
}, e.prototype.getCpuLimit = function() {
return Game.cpu.limit * this.config.targetCpuUsage;
}, e.prototype.hasCpuBudget = function() {
var e = Game.cpu.getUsed(), t = this.getCpuLimit();
return t - e > t * this.config.reservedCpuFraction;
}, e.prototype.getRemainingCpu = function() {
var e = this.getCpuLimit(), t = e * this.config.reservedCpuFraction;
return Math.max(0, e - Game.cpu.getUsed() - t);
}, e.prototype.calculatePriorityBoost = function(e) {
return Math.min(e * this.config.priorityDecayRate, this.config.maxPriorityBoost);
}, e.prototype.getEffectivePriority = function(e) {
return this.config.enablePriorityDecay ? e.priority + this.calculatePriorityBoost(e.stats.consecutiveCpuSkips) : e.priority;
}, e.prototype.rebuildProcessQueue = function() {
var e = this;
this.processQueue = Array.from(this.processes.values()).sort(function(t, r) {
return e.getEffectivePriority(r) - e.getEffectivePriority(t);
}), this.queueDirty = !1, this.lastExecutedProcessId ? this.lastExecutedIndex = this.processQueue.findIndex(function(t) {
return t.id === e.lastExecutedProcessId;
}) : this.lastExecutedIndex = -1;
}, e.prototype.shouldRunProcess = function(e) {
var t;
if ("suspended" === e.state && null !== e.stats.suspendedUntil) {
if (!(Game.time >= e.stats.suspendedUntil)) {
if (Game.time % 100 == 0) {
var r = e.stats.suspendedUntil - Game.time;
Jt.debug('Kernel: Process "'.concat(e.name, '" suspended (').concat(r, " ticks remaining)"), {
subsystem: "Kernel"
});
}
return !1;
}
e.state = "idle", e.stats.suspendedUntil = null;
var o = e.stats.suspensionReason;
e.stats.suspensionReason = null, Jt.info('Kernel: Process "'.concat(e.name, '" automatically resumed after suspension. ') + "Previous reason: ".concat(o, ". Consecutive errors: ").concat(e.stats.consecutiveErrors), {
subsystem: "Kernel",
processId: e.id
}), this.emit("process.recovered", {
processId: e.id,
processName: e.name,
previousReason: o || "Unknown",
consecutiveErrors: e.stats.consecutiveErrors
}, {
priority: 50
});
}
if (void 0 !== e.tickModulo && e.tickModulo > 0) {
var n = null !== (t = e.tickOffset) && void 0 !== t ? t : 0;
if ((Game.time + n) % e.tickModulo !== 0) return !1;
}
if (e.stats.runCount > 0) {
var a = Game.time - e.stats.lastRunTick;
if (a < e.interval) return Game.time % 100 == 0 && e.priority >= $t.HIGH && Jt.debug('Kernel: Process "'.concat(e.name, '" skipped (interval: ').concat(a, "/").concat(e.interval, " ticks)"), {
subsystem: "Kernel"
}), !1;
}
return !0;
}, e.prototype.calculateHealthScore = function(e) {
if (0 === e.runCount) return 100;
var t = (e.runCount - e.errorCount) / e.runCount * 100;
return Game.time - e.lastSuccessfulRunTick < 100 && e.lastSuccessfulRunTick > 0 && (t += 20), 
t -= 15 * e.consecutiveErrors, Math.max(0, Math.min(100, t));
}, e.prototype.executeProcess = function(e) {
var t = Game.cpu.getUsed();
e.state = "running";
try {
e.execute(), e.state = "idle", e.stats.consecutiveErrors = 0, e.stats.consecutiveCpuSkips = 0, 
e.stats.lastSuccessfulRunTick = Game.time;
} catch (t) {
e.state = "error", e.stats.errorCount++, e.stats.consecutiveErrors++;
var r = t instanceof Error ? t.message : String(t);
Jt.error('Kernel: Process "'.concat(e.name, '" error: ').concat(r), {
subsystem: "Kernel"
}), t instanceof Error && t.stack && Jt.error(t.stack, {
subsystem: "Kernel"
});
var o = e.stats.consecutiveErrors;
if (o >= 10) e.stats.suspendedUntil = Number.MAX_SAFE_INTEGER, e.stats.suspensionReason = "Circuit breaker: ".concat(o, " consecutive failures (permanent)"), 
e.state = "suspended", Jt.error('Kernel: Process "'.concat(e.name, '" permanently suspended after ').concat(o, " consecutive failures"), {
subsystem: "Kernel",
processId: e.id
}), this.emit("process.suspended", {
processId: e.id,
processName: e.name,
reason: e.stats.suspensionReason,
consecutive: o,
permanent: !0
}, {
immediate: !0,
priority: 100
}); else if (o >= 3) {
var n = Math.min(1e3, Math.pow(2, o));
e.stats.suspendedUntil = Game.time + n, e.stats.suspensionReason = "".concat(o, " consecutive failures (auto-resume in ").concat(n, " ticks)"), 
e.state = "suspended", Jt.warn('Kernel: Process "'.concat(e.name, '" suspended for ').concat(n, " ticks after ").concat(o, " consecutive failures"), {
subsystem: "Kernel",
processId: e.id,
meta: {
errorCount: e.stats.errorCount,
resumeAt: e.stats.suspendedUntil
}
}), this.emit("process.suspended", {
processId: e.id,
processName: e.name,
reason: e.stats.suspensionReason,
consecutive: o,
permanent: !1,
resumeAt: e.stats.suspendedUntil
}, {
immediate: !0,
priority: 75
});
}
}
var a = Game.cpu.getUsed() - t;
this.config.enableStats && (e.stats.totalCpu += a, e.stats.runCount++, e.stats.avgCpu = e.stats.totalCpu / e.stats.runCount, 
e.stats.maxCpu = Math.max(e.stats.maxCpu, a), e.stats.lastRunTick = Game.time, e.stats.healthScore = this.calculateHealthScore(e.stats)), 
this.tickCpuUsed += a;
var i = this.getCpuLimit() * e.cpuBudget, s = a / i;
s > this.config.budgetWarningThreshold && Game.time % this.config.budgetWarningInterval === 0 && Jt.warn('Kernel: Process "'.concat(e.name, '" exceeded CPU budget: ').concat(a.toFixed(3), " > ").concat(i.toFixed(3), " (").concat((100 * s).toFixed(0), "%)"), {
subsystem: "Kernel"
});
}, e.prototype.run = function() {
if (this.updateBucketMode(), this.updateAdaptiveBudgets(), this.tickCpuUsed = 0, 
this.skippedProcessesThisTick = 0, or.processQueue(), this.queueDirty && (this.rebuildProcessQueue(), 
Jt.info("Kernel: Rebuilt process queue with ".concat(this.processQueue.length, " processes"), {
subsystem: "Kernel"
})), 0 !== this.processQueue.length) {
Game.time % 10 == 0 && Jt.info("Kernel: Running ".concat(this.processQueue.length, " registered processes"), {
subsystem: "Kernel"
});
for (var e = 0, t = 0, r = 0, o = 0, n = (this.lastExecutedIndex + 1) % this.processQueue.length, a = 0; a < this.processQueue.length; a++) {
var i = (n + a) % this.processQueue.length, s = this.processQueue[i];
if (this.shouldRunProcess(s)) {
if (!this.hasCpuBudget()) {
if (this.config.enablePriorityDecay) for (var c = a; c < this.processQueue.length; c++) {
var l = (n + c) % this.processQueue.length, u = this.processQueue[l];
this.shouldRunProcess(u) && u.stats.consecutiveCpuSkips++;
}
r = this.processQueue.length - e - t, Jt.warn("Kernel: CPU budget exhausted after ".concat(e, " processes. ").concat(r, " processes deferred to next tick. Used: ").concat(Game.cpu.getUsed().toFixed(2), "/").concat(this.getCpuLimit().toFixed(2)), {
subsystem: "Kernel"
}), this.config.enablePriorityDecay && r > 0 && (this.queueDirty = !0);
break;
}
this.executeProcess(s), e++, this.lastExecutedProcessId = s.id, this.lastExecutedIndex = i;
} else this.config.enableStats && s.stats.skippedCount++, t++, this.skippedProcessesThisTick++, 
s.stats.runCount > 0 && Game.time - s.stats.lastRunTick < s.interval && o++;
}
this.config.enableStats && Game.time % this.config.statsLogInterval === 0 && (this.logStats(e, t, o, r), 
or.logStats());
} else Jt.warn("Kernel: No processes registered in queue", {
subsystem: "Kernel"
});
}, e.prototype.logStats = function(e, t, r, o) {
var n = this, a = Game.cpu.bucket, i = (a / 1e4 * 100).toFixed(1), s = Game.cpu.getUsed(), c = this.getCpuLimit();
if (Jt.info("Kernel: ".concat(e, " ran, ").concat(t, " skipped (interval: ").concat(r, ", CPU: ").concat(o, "), ") + "CPU: ".concat(s.toFixed(2), "/").concat(c.toFixed(2), " (").concat((s / c * 100).toFixed(1), "%), bucket: ").concat(a, "/10000 (").concat(i, "%), mode: ").concat(this.bucketMode), {
subsystem: "Kernel"
}), this.config.enablePriorityDecay && o > 0) {
var l = this.processQueue.filter(function(e) {
return e.stats.consecutiveCpuSkips >= 5;
}).sort(function(e, t) {
return t.stats.consecutiveCpuSkips - e.stats.consecutiveCpuSkips;
}).slice(0, 3);
l.length > 0 && Jt.info("Kernel: Priority decay active: ".concat(l.map(function(e) {
return "".concat(e.name, "(base:").concat(e.priority, ", boost:+").concat(n.calculatePriorityBoost(e.stats.consecutiveCpuSkips), ", skips:").concat(e.stats.consecutiveCpuSkips, ")");
}).join(", ")), {
subsystem: "Kernel"
});
}
if (t > 10) {
var u = this.processQueue.filter(function(e) {
return e.stats.skippedCount > 100;
}).sort(function(e, t) {
return t.stats.skippedCount - e.stats.skippedCount;
}).slice(0, 5);
u.length > 0 && Jt.warn("Kernel: Top skipped processes: ".concat(u.map(function(e) {
return "".concat(e.name, "(").concat(e.stats.skippedCount, ", interval:").concat(e.interval, ")");
}).join(", ")), {
subsystem: "Kernel"
});
}
}, e.prototype.getTickCpuUsed = function() {
return this.tickCpuUsed;
}, e.prototype.getSkippedProcessesThisTick = function() {
return this.skippedProcessesThisTick;
}, e.prototype.suspendProcess = function(e) {
var t = this.processes.get(e);
return !!t && (t.state = "suspended", Jt.info('Kernel: Suspended process "'.concat(t.name, '"'), {
subsystem: "Kernel"
}), !0);
}, e.prototype.resumeProcess = function(e) {
var t = this.processes.get(e);
if (t && "suspended" === t.state) {
t.state = "idle", t.stats.suspendedUntil = null;
var r = t.stats.suspensionReason;
return t.stats.suspensionReason = null, Jt.info('Kernel: Manually resumed process "'.concat(t.name, '". ') + "Previous reason: ".concat(r, ". Consecutive errors: ").concat(t.stats.consecutiveErrors), {
subsystem: "Kernel",
processId: e
}), this.emit("process.recovered", {
processId: t.id,
processName: t.name,
previousReason: r || "Unknown",
consecutiveErrors: t.stats.consecutiveErrors,
manual: !0
}, {
priority: 50
}), !0;
}
return !1;
}, e.prototype.getStatsSummary = function() {
var e = Array.from(this.processes.values()), t = e.filter(function(e) {
return "suspended" !== e.state;
}), r = e.filter(function(e) {
return "suspended" === e.state;
}), o = e.reduce(function(e, t) {
return e + t.stats.totalCpu;
}, 0), n = e.length > 0 ? o / e.length : 0, a = s([], i(e), !1).sort(function(e, t) {
return t.stats.avgCpu - e.stats.avgCpu;
}).slice(0, 5).map(function(e) {
return {
name: e.name,
avgCpu: e.stats.avgCpu
};
}), c = s([], i(e), !1).filter(function(e) {
return e.stats.healthScore < 50;
}).sort(function(e, t) {
return e.stats.healthScore - t.stats.healthScore;
}).slice(0, 5).map(function(e) {
return {
name: e.name,
healthScore: e.stats.healthScore,
consecutiveErrors: e.stats.consecutiveErrors
};
}), l = e.reduce(function(e, t) {
return e + t.stats.healthScore;
}, 0), u = e.length > 0 ? l / e.length : 100;
return {
totalProcesses: e.length,
activeProcesses: t.length,
suspendedProcesses: r.length,
totalCpuUsed: o,
avgCpuPerProcess: n,
topCpuProcesses: a,
unhealthyProcesses: c,
avgHealthScore: u
};
}, e.prototype.resetStats = function() {
var e, t;
try {
for (var r = a(this.processes.values()), o = r.next(); !o.done; o = r.next()) o.value.stats = {
totalCpu: 0,
runCount: 0,
avgCpu: 0,
maxCpu: 0,
lastRunTick: 0,
skippedCount: 0,
errorCount: 0,
consecutiveErrors: 0,
lastSuccessfulRunTick: 0,
healthScore: 100,
suspendedUntil: null,
suspensionReason: null,
consecutiveCpuSkips: 0
};
} catch (t) {
e = {
error: t
};
} finally {
try {
o && !o.done && (t = r.return) && t.call(r);
} finally {
if (e) throw e.error;
}
}
Jt.info("Kernel: Reset all process statistics", {
subsystem: "Kernel"
});
}, e.prototype.getDistributionStats = function() {
var e, t, r = Array.from(this.processes.values()), o = r.filter(function(e) {
return void 0 !== e.tickModulo && e.tickModulo > 0;
}), n = r.filter(function(e) {
return !e.tickModulo || 0 === e.tickModulo;
}), i = {};
try {
for (var s = a(o), c = s.next(); !c.done; c = s.next()) {
var l = c.value.tickModulo;
i[l] = (i[l] || 0) + 1;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = s.return) && t.call(s);
} finally {
if (e) throw e.error;
}
}
var u = n.length + o.reduce(function(e, t) {
return e + 1 / (t.tickModulo || 1);
}, 0), m = r.length, p = m > 0 ? (m - u) / m * 100 : 0;
return {
totalProcesses: r.length,
distributedProcesses: o.length,
everyTickProcesses: n.length,
distributionRatio: r.length > 0 ? o.length / r.length : 0,
moduloCounts: i,
averageTickLoad: u,
estimatedCpuReduction: p
};
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e.prototype.getFrequencyDefaults = function(e) {
return o({}, this.frequencyDefaults[e]);
}, e.prototype.updateConfig = function(e) {
this.config = o(o({}, this.config), e), this.validateConfig(), this.frequencyDefaults = this.buildFrequencyDefaults();
}, e.prototype.updateFromCpuConfig = function(e) {
this.updateConfig(cr(e));
}, e.prototype.on = function(e, t, r) {
return void 0 === r && (r = {}), or.on(e, t, r);
}, e.prototype.once = function(e, t, r) {
return void 0 === r && (r = {}), or.once(e, t, r);
}, e.prototype.emit = function(e, t, r) {
void 0 === r && (r = {}), or.emit(e, t, r);
}, e.prototype.offAll = function(e) {
or.offAll(e);
}, e.prototype.processEvents = function() {
or.processQueue();
}, e.prototype.getEventStats = function() {
return or.getStats();
}, e.prototype.hasEventHandlers = function(e) {
return or.hasHandlers(e);
}, e.prototype.getEventBus = function() {
return or;
}, e;
}();

new lr(cr(o({}, nr).cpu));

var ur, mr = new Set;

function pr(e, t, r) {
return o({
id: e,
name: t,
priority: $t.MEDIUM,
frequency: "medium",
minBucket: 0,
cpuBudget: .15,
interval: 5
}, r), function(e, t, r) {};
}

function dr(e) {
var t = Math.floor(e.bucketThresholds.lowMode / 2), r = {
high: 1,
medium: Math.max(1, Math.min(e.taskFrequencies.clusterLogic, e.taskFrequencies.pheromoneUpdate)),
low: Math.max(e.taskFrequencies.marketScan, e.taskFrequencies.nukeEvaluation, e.taskFrequencies.memoryCleanup)
}, o = {
high: e.budgets.rooms,
medium: e.budgets.strategic,
low: Math.max(e.budgets.market, e.budgets.visualization)
};
return {
lowBucketThreshold: e.bucketThresholds.lowMode,
highBucketThreshold: e.bucketThresholds.highMode,
criticalBucketThreshold: t,
targetCpuUsage: .95,
reservedCpuFraction: .02,
enableStats: !0,
statsLogInterval: 100,
frequencyIntervals: r,
frequencyMinBucket: {
high: 0,
medium: 0,
low: 0
},
frequencyCpuBudgets: o,
budgetWarningThreshold: 1.5,
budgetWarningInterval: 100,
enableAdaptiveBudgets: !1,
adaptiveBudgetConfig: ar,
enablePriorityDecay: !0,
priorityDecayRate: 1,
maxPriorityBoost: 50
};
}

!function(e) {
e.RUNNING = "running", e.DEAD = "dead", e.SUSPENDED = "suspended";
}(ur || (ur = {}));

var fr = null, yr = new Proxy({}, {
get: function(e, t) {
return fr || (fr = new lr(dr(ae().cpu))), fr[t];
},
set: function(e, t, r) {
return fr || (fr = new lr(dr(ae().cpu))), fr[t] = r, !0;
}
}), gr = [], hr = new Set;

function vr(e) {
return function(t, r, o) {
gr.push({
options: e,
methodName: String(r),
target: t
});
};
}

function Rr(e, t, r) {
return vr(o({
id: e,
name: t,
priority: $t.MEDIUM,
frequency: "medium",
minBucket: 0,
cpuBudget: .15,
interval: 5
}, r));
}

function Er(e, t, r) {
return vr(o({
id: e,
name: t,
priority: $t.LOW,
frequency: "low",
minBucket: 0,
cpuBudget: .1,
interval: 20
}, r));
}

function Tr(e, t, r) {
return vr(o({
id: e,
name: t,
priority: $t.IDLE,
frequency: "low",
minBucket: 0,
cpuBudget: .05,
interval: 100
}, r));
}

function Cr() {
return function(e) {
return hr.add(e), e;
};
}

function Sr(e) {
var t = Math.floor(.1 * e), r = Math.floor(Math.random() * (2 * t + 1)) - t;
return {
interval: Math.max(1, e + r),
jitter: r
};
}

function _r(e) {
var t, r, o, n, i, s = Object.getPrototypeOf(e);
try {
for (var c = a(gr), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u.target === s || Object.getPrototypeOf(u.target) === s || u.target === Object.getPrototypeOf(s)) {
var m = e[u.methodName];
if ("function" == typeof m) {
var p = m.bind(e), d = null !== (o = u.options.interval) && void 0 !== o ? o : 5, f = Sr(d), y = f.interval, g = f.jitter;
yr.registerProcess({
id: u.options.id,
name: u.options.name,
priority: null !== (n = u.options.priority) && void 0 !== n ? n : $t.MEDIUM,
frequency: null !== (i = u.options.frequency) && void 0 !== i ? i : "medium",
minBucket: u.options.minBucket,
cpuBudget: u.options.cpuBudget,
interval: y,
execute: p
}), Ft.debug('Registered decorated process "'.concat(u.options.name, '" (').concat(u.options.id, ") with interval ").concat(y, " (base: ").concat(d, ", jitter: ").concat(g > 0 ? "+" : "").concat(g, ")"), {
subsystem: "ProcessDecorators"
});
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
}

function Or(e) {
var t;
return e ? null !== (t = {
X: 15,
Z: 12,
K: 12,
L: 10,
U: 10,
O: 8,
H: 8
}[e]) && void 0 !== t ? t : 5 : 0;
}

function br(t) {
var r, o, n = e.memoryManager.getEmpire(), i = 0, s = Mr(t);
try {
for (var c = a(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = n.knownRooms[u];
m && (m.owner && !Nr(m.owner) && (i += 30), m.threatLevel >= 2 && (i += 10 * m.threatLevel), 
m.towerCount && m.towerCount > 0 && (i += 5 * m.towerCount));
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
return i;
}

function wr(e) {
return "plains" === e ? 15 : "swamp" === e ? -10 : 0;
}

function Ur(e) {
var t, r, o = Mr(e);
try {
for (var n = a(o), i = n.next(); !i.done; i = n.next()) {
var s = kr(i.value);
if (s && (s.x % 10 == 0 || s.y % 10 == 0)) return !0;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return !1;
}

function xr(t) {
var r, o, n = e.memoryManager.getEmpire(), i = Mr(t);
try {
for (var s = a(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = n.knownRooms[l];
if (u && u.hasPortal) return 10;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
c && !c.done && (o = s.return) && o.call(s);
} finally {
if (r) throw r.error;
}
}
return 0;
}

function Ar(e, t, r) {
return 0 === t.length ? 0 : r <= 2 ? 25 : r <= 3 ? 15 : r <= 5 ? 5 : 0;
}

function Mr(e) {
var t = kr(e);
if (!t) return [];
for (var r = t.x, o = t.y, n = t.xDir, a = t.yDir, i = [], s = -1; s <= 1; s++) for (var c = -1; c <= 1; c++) if (0 !== s || 0 !== c) {
var l = r + s, u = o + c, m = n, p = a, d = l, f = u;
l < 0 && (m = "E" === n ? "W" : "E", d = Math.abs(l) - 1), u < 0 && (p = "N" === a ? "S" : "N", 
f = Math.abs(u) - 1), i.push("".concat(m).concat(d).concat(p).concat(f));
}
return i;
}

function kr(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
return t ? {
xDir: t[1],
x: parseInt(t[2], 10),
yDir: t[3],
y: parseInt(t[4], 10)
} : null;
}

function Nr(e) {
return !1;
}

function Ir(e, t) {
var r = [], o = kr(e);
if (!o) return [];
for (var n = o.x, a = o.y, i = o.xDir, s = o.yDir, c = -t; c <= t; c++) for (var l = -t; l <= t; l++) if (0 !== c || 0 !== l) {
var u = n + c, m = a + l, p = i, d = s, f = u, y = m;
u < 0 && (p = "E" === i ? "W" : "E", f = Math.abs(u) - 1), m < 0 && (d = "N" === s ? "S" : "N", 
y = Math.abs(m) - 1), r.push("".concat(p).concat(f).concat(d).concat(y));
}
return r;
}

function Pr(e, t, r, o) {
var n, a = Game.map.getRoomLinearDistance(t, e);
if (!Number.isFinite(a) || a <= 0) throw new Error("calculateRemoteProfitability: invalid distance ".concat(a, " between ").concat(t, " and ").concat(e));
if (r.sources <= 0) throw new Error("calculateRemoteProfitability: intel.sources must be positive, got ".concat(r.sources, " for ").concat(e));
if (void 0 !== r.threatLevel && null !== r.threatLevel && (r.threatLevel < 0 || r.threatLevel > 3)) throw new Error("calculateRemoteProfitability: intel.threatLevel must be in [0, 3], got ".concat(r.threatLevel, " for ").concat(e));
var i, s, c, l, u, m = 10 * r.sources, p = 50 * a * 2, d = (650 + 450 * r.sources) / (1500 / p) / p, f = 5e3 * r.sources + 50 * a * 300, y = f / 5e4, g = m * (null !== (n = [ 0, .1, .3, .6 ][r.threatLevel]) && void 0 !== n ? n : 0), h = m - d - y - g, v = d + y, R = v > 0 ? h / v : 0;
return {
roomName: e,
sourceId: o,
energyPerTick: m,
carrierCostPerTick: d,
pathDistance: a,
infrastructureCost: f,
threatCost: g,
netProfitPerTick: h,
roi: R,
profitabilityScore: (s = 2 * (i = {
distance: a,
threatCost: g,
roi: R,
netProfitPerTick: h
}).distance, c = i.netProfitPerTick / 10, l = i.threatCost > 0 ? 10 : 0, u = 5 * i.roi, 
Math.max(0, Math.min(100, 50 - s + c - l + u))),
isProfitable: R > 2 && h > 0
};
}

var Gr = {
updateInterval: 20,
minBucket: 0,
maxRemoteDistance: 2,
maxRemotesPerRoom: 4,
minRemoteSources: 1,
minRclForRemotes: 3,
minRclForClaiming: 4,
minGclProgressForClaim: .7,
clusterExpansionDistance: 5,
minStableRoomPercentage: .6
}, Lr = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.cachedUsername = "", this.usernameLastTick = 0, 
this.config = o(o({}, Gr), e);
}
return t.prototype.run = function() {
var t = e.memoryManager.getEmpire();
this.lastRun = Game.time, this.monitorExpansionProgress(t), this.updateRemoteAssignments(t), 
this.isExpansionReady(t) && this.assignClaimerTargets(t), this.assignReserverTargets();
}, t.prototype.updateRemoteAssignments = function(t) {
var r, o, n, i, s, c, l, u = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var m = a(u), p = m.next(); !p.done; p = m.next()) {
var d = p.value, f = e.memoryManager.getSwarmState(d.name);
if (f && !((null !== (c = null === (s = d.controller) || void 0 === s ? void 0 : s.level) && void 0 !== c ? c : 0) < this.config.minRclForRemotes)) {
var y = null !== (l = f.remoteAssignments) && void 0 !== l ? l : [], g = this.validateRemoteAssignments(y, t, d.name), h = this.calculateRemoteCapacity(d, f);
if (g.length < h) {
var v = this.findRemoteCandidates(d.name, t, g), R = h - g.length, E = v.slice(0, R);
try {
for (var T = (n = void 0, a(E)), C = T.next(); !C.done; C = T.next()) {
var S = C.value;
g.includes(S) || (g.push(S), Me.info("Assigned remote room ".concat(S, " to ").concat(d.name), {
subsystem: "Expansion"
}));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
C && !C.done && (i = T.return) && i.call(T);
} finally {
if (n) throw n.error;
}
}
}
JSON.stringify(g) !== JSON.stringify(f.remoteAssignments) && (f.remoteAssignments = g);
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
p && !p.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
}, t.prototype.calculateRemoteCapacity = function(e, t) {
var r, o, n = null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0;
if (t.danger >= 2) return Math.min(1, this.config.maxRemotesPerRoom);
var a = e.storage;
return a && a.store.getUsedCapacity(RESOURCE_ENERGY) < 1e4 || n < 4 ? Math.min(1, this.config.maxRemotesPerRoom) : 4 === n ? Math.min(2, this.config.maxRemotesPerRoom) : n < 7 ? Math.min(3, this.config.maxRemotesPerRoom) : this.config.maxRemotesPerRoom;
}, t.prototype.validateRemoteAssignments = function(e, t, r) {
var o = this;
return e.filter(function(e) {
var n = t.knownRooms[e];
if (!n) return !0;
var a = null;
n.owner && (Me.info("Removing remote ".concat(e, " - now owned by ").concat(n.owner), {
subsystem: "Expansion"
}), a = "claimed");
var i = o.getMyUsername();
if (!a && n.reserver && n.reserver !== i && (Me.info("Removing remote ".concat(e, " - reserved by ").concat(n.reserver), {
subsystem: "Expansion"
}), a = "hostile"), !a && n.threatLevel >= 3 && (Me.info("Removing remote ".concat(e, " - threat level ").concat(n.threatLevel), {
subsystem: "Expansion"
}), a = "hostile"), !a) {
var s = Game.map.getRoomLinearDistance(r, e);
s > o.config.maxRemoteDistance && (Me.info("Removing remote ".concat(e, " - too far (").concat(s, ")"), {
subsystem: "Expansion"
}), a = "unreachable");
}
return !a || (yr.emit("remote.lost", {
homeRoom: r,
remoteRoom: e,
reason: a,
source: r
}), !1);
});
}, t.prototype.findRemoteCandidates = function(e, t, r) {
var o = [], n = this.getMyUsername();
for (var a in t.knownRooms) if (!r.includes(a) && !this.isRemoteAssignedElsewhere(a, e)) {
var i = t.knownRooms[a];
if (i.scouted && !i.owner && !(i.reserver && i.reserver !== n || i.isHighway || i.isSK || i.sources < this.config.minRemoteSources || i.threatLevel >= 2)) {
var s = Game.map.getRoomLinearDistance(e, a);
if (!(s < 1 || s > this.config.maxRemoteDistance)) {
var c = Pr(a, e, i);
if (c.isProfitable) {
var l = this.scoreRemoteCandidate(i, s);
o.push({
roomName: a,
score: l
});
} else Game.time % 1e3 == 0 && Me.debug("Skipping remote ".concat(a, " - not profitable (ROI: ").concat(c.roi.toFixed(2), ")"), {
subsystem: "Expansion"
});
}
}
}
return o.sort(function(e, t) {
return t.score - e.score;
}), o.map(function(e) {
return e.roomName;
});
}, t.prototype.scoreRemoteCandidate = function(e, t) {
var r = 0;
return r += 50 * e.sources, r -= 20 * t, r -= 30 * e.threatLevel, "plains" === e.terrain ? r += 10 : "swamp" === e.terrain && (r -= 10), 
r;
}, t.prototype.scoreClaimCandidate = function(e, t, r) {
var o = 0;
return 2 === e.sources ? o += 40 : 1 === e.sources && (o += 20), o += Or(e.mineralType), 
o -= 5 * t, o -= br(e.name), o -= 15 * e.threatLevel, o += wr(e.terrain), Ur(e.name) && (o += 10), 
o += xr(e.name), e.controllerLevel > 0 && !e.owner && (o += 2 * e.controllerLevel), 
o + Ar(e.name, r, t);
}, t.prototype.isRemoteAssignedElsewhere = function(t, r) {
var o, n, i, s = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var c = a(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u.name !== r) {
var m = e.memoryManager.getSwarmState(u.name);
if (null === (i = null == m ? void 0 : m.remoteAssignments) || void 0 === i ? void 0 : i.includes(t)) return !0;
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
l && !l.done && (n = c.return) && n.call(c);
} finally {
if (o) throw o.error;
}
}
return !1;
}, t.prototype.assignClaimerTargets = function(e) {
var t, r, o = this.getNextExpansionTarget(e);
if (o) {
var n = Object.values(Game.creeps).some(function(e) {
var t = e.memory;
return "claimer" === t.role && t.targetRoom === o.roomName && "claim" === t.task;
});
if (!n) {
var i = !1;
try {
for (var s = a(Object.values(Game.creeps)), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = l.memory;
if ("claimer" === u.role && !u.targetRoom) {
u.targetRoom = o.roomName, u.task = "claim", Me.info("Assigned claim target ".concat(o.roomName, " to ").concat(l.name), {
subsystem: "Expansion"
}), o.claimed = !0, i = !0;
break;
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
i || this.requestClaimerSpawn(o.roomName, e);
}
}
}, t.prototype.requestClaimerSpawn = function(t, r) {
var o, n, i = this, s = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), c = s.filter(function(e) {
var t, r;
return (null !== (r = null === (t = e.controller) || void 0 === t ? void 0 : t.level) && void 0 !== r ? r : 0) >= i.config.minRclForClaiming;
});
if (0 !== c.length) {
var l = null, u = 999;
try {
for (var m = a(c), p = m.next(); !p.done; p = m.next()) {
var d = p.value, f = Game.map.getRoomLinearDistance(d.name, t);
f < u && (u = f, l = d);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
if (l) {
var y = e.memoryManager.getSwarmState(l.name);
y && "defensive" !== y.posture && "evacuate" !== y.posture && y.danger < 2 && "expand" !== y.posture && (y.posture = "expand", 
Me.info("Set ".concat(l.name, " to expand posture for claiming ").concat(t, " (distance: ").concat(u, ")"), {
subsystem: "Expansion"
}));
}
}
}, t.prototype.assignReserverTargets = function() {
var t, r, o, n, i;
try {
for (var s = a(Object.values(Game.creeps)), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = l.memory;
if ("claimer" === u.role && !u.targetRoom) {
var m = u.homeRoom;
if (m) {
var p = e.memoryManager.getSwarmState(m);
if (null === (i = null == p ? void 0 : p.remoteAssignments) || void 0 === i ? void 0 : i.length) try {
for (var d = (o = void 0, a(p.remoteAssignments)), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
if (!this.hasReserverAssigned(y)) {
u.targetRoom = y, u.task = "reserve", Me.info("Assigned reserve target ".concat(y, " to ").concat(l.name), {
subsystem: "Expansion"
});
break;
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
f && !f.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
}, t.prototype.hasReserverAssigned = function(e) {
var t, r;
try {
for (var o = a(Object.values(Game.creeps)), n = o.next(); !n.done; n = o.next()) {
var i = n.value.memory;
if ("claimer" === i.role && i.targetRoom === e && "reserve" === i.task) return !0;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
n && !n.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
return !1;
}, t.prototype.isExpansionReady = function(e) {
var t = this;
if (e.objectives.expansionPaused) return !1;
var r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (r.length >= Game.gcl.level) return !1;
var o = Game.gcl.progress / Game.gcl.progressTotal;
if (o < this.config.minGclProgressForClaim) return Game.time % 500 == 0 && Me.info("Waiting for GCL progress: ".concat((100 * o).toFixed(1), "% (need ").concat((100 * this.config.minGclProgressForClaim).toFixed(0), "%)"), {
subsystem: "Expansion"
}), !1;
var n = r.filter(function(e) {
var r, o;
return (null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0) >= t.config.minRclForClaiming;
}), a = n.length / r.length;
return !(a < this.config.minStableRoomPercentage && (Game.time % 500 == 0 && Me.info("Waiting for room stability: ".concat(n.length, "/").concat(r.length, " rooms stable (").concat((100 * a).toFixed(0), "%, need ").concat((100 * this.config.minStableRoomPercentage).toFixed(0), "%)"), {
subsystem: "Expansion"
}), 1));
}, t.prototype.getNextExpansionTarget = function(e) {
var t = this, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (r.length >= Game.gcl.level) return null;
var n = e.claimQueue.filter(function(e) {
return !e.claimed;
});
if (0 === n.length) return null;
var a = n.map(function(e) {
var n = t.getMinDistanceToOwned(e.roomName, r), a = n <= t.config.clusterExpansionDistance ? 100 : 0;
return o(o({}, e), {
clusterScore: e.score + a,
distanceToCluster: n
});
});
if (a.sort(function(e, t) {
return t.clusterScore - e.clusterScore;
}), Game.time % 100 == 0 && a.length > 0) {
var i = a[0];
Me.info("Next expansion target: ".concat(i.roomName, " (score: ").concat(i.score, ", cluster bonus: ").concat(i.clusterScore - i.score, ", distance: ").concat(i.distanceToCluster, ")"), {
subsystem: "Expansion"
});
}
return a[0];
}, t.prototype.getMinDistanceToOwned = function(e, t) {
var r, o;
if (0 === t.length) return 999;
var n = 999;
try {
for (var i = a(t), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(e, c.name);
l < n && (n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
return n;
}, t.prototype.getMyUsername = function() {
if (this.usernameLastTick !== Game.time || !this.cachedUsername) {
var e = Object.values(Game.spawns);
e.length > 0 && (this.cachedUsername = e[0].owner.username), this.usernameLastTick = Game.time;
}
return this.cachedUsername;
}, t.prototype.performSafetyAnalysis = function(t, r) {
var o, n, i = [], s = Ir(t, 2);
try {
for (var c = a(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = r.knownRooms[u];
m && (m.owner && !Nr(m.owner) && i.push("Hostile player ".concat(m.owner, " in ").concat(u)), 
m.towerCount && m.towerCount > 0 && i.push("".concat(m.towerCount, " towers in ").concat(u)), 
m.spawnCount && m.spawnCount > 0 && i.push("".concat(m.spawnCount, " spawns in ").concat(u)), 
m.threatLevel >= 2 && i.push("Threat level ".concat(m.threatLevel, " in ").concat(u)));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
l && !l.done && (n = c.return) && n.call(c);
} finally {
if (o) throw o.error;
}
}
return function(t) {
var r, o, n = e.memoryManager.getEmpire(), i = Mr(t), s = new Set;
try {
for (var c = a(i), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = n.knownRooms[u];
(null == m ? void 0 : m.owner) && !Nr(m.owner) && s.add(m.owner);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
return s.size >= 2;
}(t) && i.push("Room is in potential war zone between hostile players"), {
isSafe: 0 === i.length,
threatDescription: i.length > 0 ? i.join("; ") : "No threats detected"
};
}, t.prototype.monitorExpansionProgress = function(e) {
var t, r, o, n = Game.time, i = function(t) {
if (!t.claimed) return "continue";
var r = n - t.lastEvaluated;
if (r > 5e3) {
var a = Game.rooms[t.roomName];
return (null === (o = null == a ? void 0 : a.controller) || void 0 === o ? void 0 : o.my) ? (Me.info("Expansion to ".concat(t.roomName, " completed successfully"), {
subsystem: "Expansion"
}), s.removeFromClaimQueue(e, t.roomName), "continue") : (Me.warn("Expansion to ".concat(t.roomName, " timed out after ").concat(r, " ticks"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "timeout"), "continue");
}
if (!Object.values(Game.creeps).some(function(e) {
var r = e.memory;
return "claimer" === r.role && r.targetRoom === t.roomName && "claim" === r.task;
}) && r > 1e3) return Me.warn("No active claimer for ".concat(t.roomName, " expansion"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "claimer_died"), "continue";
var i = e.knownRooms[t.roomName];
if ((null == i ? void 0 : i.owner) && i.owner !== s.getMyUsername()) return Me.warn("".concat(t.roomName, " claimed by ").concat(i.owner, " before we could claim it"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "hostile_claim"), "continue";
var c = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), l = c.reduce(function(e, t) {
var r, o;
return e + (null !== (o = null === (r = t.storage) || void 0 === r ? void 0 : r.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== o ? o : 0);
}, 0), u = c.length > 0 ? l / c.length : 0;
return u < 2e4 ? (Me.warn("Cancelling expansion to ".concat(t.roomName, " due to low energy (avg: ").concat(u, ")"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "low_energy"), "continue") : void 0;
}, s = this;
try {
for (var c = a(e.claimQueue), l = c.next(); !l.done; l = c.next()) i(l.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
}, t.prototype.cancelExpansion = function(e, t, r) {
var o, n;
this.removeFromClaimQueue(e, t);
try {
for (var i = a(Object.values(Game.creeps)), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = c.memory;
"claimer" === l.role && l.targetRoom === t && "claim" === l.task && (l.targetRoom = void 0, 
l.task = void 0, Me.info("Cleared target for ".concat(c.name, " due to expansion cancellation"), {
subsystem: "Expansion"
}));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
s && !s.done && (n = i.return) && n.call(i);
} finally {
if (o) throw o.error;
}
}
Me.info("Cancelled expansion to ".concat(t, ", reason: ").concat(r), {
subsystem: "Expansion"
});
}, t.prototype.removeFromClaimQueue = function(e, t) {
var r = e.claimQueue.findIndex(function(e) {
return e.roomName === t;
});
-1 !== r && e.claimQueue.splice(r, 1);
}, t.prototype.addRemoteRoom = function(t, r) {
var o = e.memoryManager.getSwarmState(t);
return o ? (o.remoteAssignments || (o.remoteAssignments = []), o.remoteAssignments.includes(r) ? (Me.warn("Remote ".concat(r, " already assigned to ").concat(t), {
subsystem: "Expansion"
}), !1) : (o.remoteAssignments.push(r), Me.info("Manually added remote ".concat(r, " to ").concat(t), {
subsystem: "Expansion"
}), !0)) : (Me.error("Cannot add remote: ".concat(t, " not found"), {
subsystem: "Expansion"
}), !1);
}, t.prototype.removeRemoteRoom = function(t, r) {
var o = e.memoryManager.getSwarmState(t);
if (!(null == o ? void 0 : o.remoteAssignments)) return !1;
var n = o.remoteAssignments.indexOf(r);
return -1 !== n && (o.remoteAssignments.splice(n, 1), Me.info("Manually removed remote ".concat(r, " from ").concat(t), {
subsystem: "Expansion"
}), !0);
}, n([ Rr("expansion:manager", "Expansion Manager", {
priority: $t.LOW,
interval: 20,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(), Dr = new Lr, Fr = function() {
function t() {}
return t.prototype.status = function() {
var t, r, o, n, i, s, c, l, u, m, p = e.memoryManager.getEmpire(), d = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), f = (Game.gcl.progress / Game.gcl.progressTotal * 100).toFixed(1), y = Game.gcl.level - d.length, g = y > 0, h = p.objectives.expansionPaused, v = p.claimQueue.length, R = p.claimQueue.filter(function(e) {
return !e.claimed;
}).length, E = p.claimQueue.filter(function(e) {
return e.claimed;
}).length, T = Object.values(Game.creeps).filter(function(e) {
var t = e.memory;
return "claimer" === t.role && "claim" === t.task;
}), C = "=== Expansion System Status ===\n\nGCL: Level ".concat(Game.gcl.level, " (").concat(f, "% to next)\nOwned Rooms: ").concat(d.length, "/").concat(Game.gcl.level, "\nAvailable Room Slots: ").concat(y, "\n\nExpansion Status: ").concat(h ? "PAUSED ⚠" : g ? "READY ✓" : "AT GCL LIMIT", "\nClaim Queue: ").concat(v, " total (").concat(R, " unclaimed, ").concat(E, " in progress)\nActive Claimers: ").concat(T.length, "\n\n");
if (R > 0) {
C += "=== Top Expansion Candidates ===\n";
var S = p.claimQueue.filter(function(e) {
return !e.claimed;
}).slice(0, 5);
try {
for (var _ = a(S), O = _.next(); !O.done; O = _.next()) {
var b = O.value, w = Game.time - b.lastEvaluated;
C += "  ".concat(b.roomName, ": Score ").concat(b.score.toFixed(0), ", Distance ").concat(b.distance, ", Age ").concat(w, " ticks\n");
}
} catch (e) {
t = {
error: e
};
} finally {
try {
O && !O.done && (r = _.return) && r.call(_);
} finally {
if (t) throw t.error;
}
}
C += "\n";
}
if (E > 0) {
C += "=== Active Expansion Attempts ===\n";
var U = p.claimQueue.filter(function(e) {
return e.claimed;
}), x = function(e) {
var t = Game.time - e.lastEvaluated, r = T.find(function(t) {
return t.memory.targetRoom === e.roomName;
}), o = r ? "".concat(r.name, " en route") : "No claimer assigned";
C += "  ".concat(e.roomName, ": ").concat(o, ", Age ").concat(t, " ticks\n");
};
try {
for (var A = a(U), M = A.next(); !M.done; M = A.next()) x(b = M.value);
} catch (e) {
o = {
error: e
};
} finally {
try {
M && !M.done && (n = A.return) && n.call(A);
} finally {
if (o) throw o.error;
}
}
C += "\n";
}
C += "=== Owned Room Distribution ===\n";
var k = new Map;
try {
for (var N = a(d), I = N.next(); !I.done; I = N.next()) {
var P = null !== (l = null === (c = I.value.controller) || void 0 === c ? void 0 : c.level) && void 0 !== l ? l : 0;
k.set(P, (null !== (u = k.get(P)) && void 0 !== u ? u : 0) + 1);
}
} catch (e) {
i = {
error: e
};
} finally {
try {
I && !I.done && (s = N.return) && s.call(N);
} finally {
if (i) throw i.error;
}
}
for (P = 8; P >= 1; P--) {
var G = null !== (m = k.get(P)) && void 0 !== m ? m : 0;
if (G > 0) {
var L = "█".repeat(G);
C += "  RCL ".concat(P, ": ").concat(L, " (").concat(G, ")\n");
}
}
return C;
}, t.prototype.pause = function() {
return e.memoryManager.getEmpire().objectives.expansionPaused = !0, "Expansion paused. Use expansion.resume() to re-enable.";
}, t.prototype.resume = function() {
return e.memoryManager.getEmpire().objectives.expansionPaused = !1, "Expansion resumed.";
}, t.prototype.addRemote = function(e, t) {
return Dr.addRemoteRoom(e, t) ? "Added remote ".concat(t, " to ").concat(e) : "Failed to add remote (check logs for details)";
}, t.prototype.removeRemote = function(e, t) {
return Dr.removeRemoteRoom(e, t) ? "Removed remote ".concat(t, " from ").concat(e) : "Remote ".concat(t, " not found in ").concat(e);
}, t.prototype.clearQueue = function() {
var t = e.memoryManager.getEmpire(), r = t.claimQueue.length;
return t.claimQueue = [], "Cleared ".concat(r, " candidates from claim queue. Queue will repopulate on next empire tick.");
}, n([ Yt({
name: "expansion.status",
description: "Show expansion system status, GCL progress, and claim queue",
usage: "expansion.status()",
examples: [ "expansion.status()" ],
category: "Empire"
}) ], t.prototype, "status", null), n([ Yt({
name: "expansion.pause",
description: "Pause autonomous expansion",
usage: "expansion.pause()",
examples: [ "expansion.pause()" ],
category: "Empire"
}) ], t.prototype, "pause", null), n([ Yt({
name: "expansion.resume",
description: "Resume autonomous expansion",
usage: "expansion.resume()",
examples: [ "expansion.resume()" ],
category: "Empire"
}) ], t.prototype, "resume", null), n([ Yt({
name: "expansion.addRemote",
description: "Manually add a remote room assignment",
usage: "expansion.addRemote(homeRoom, remoteRoom)",
examples: [ "expansion.addRemote('W1N1', 'W2N1')" ],
category: "Empire"
}) ], t.prototype, "addRemote", null), n([ Yt({
name: "expansion.removeRemote",
description: "Manually remove a remote room assignment",
usage: "expansion.removeRemote(homeRoom, remoteRoom)",
examples: [ "expansion.removeRemote('W1N1', 'W2N1')" ],
category: "Empire"
}) ], t.prototype, "removeRemote", null), n([ Yt({
name: "expansion.clearQueue",
description: "Clear the expansion claim queue",
usage: "expansion.clearQueue()",
examples: [ "expansion.clearQueue()" ],
category: "Empire"
}) ], t.prototype, "clearQueue", null), t;
}(), Br = new Fr;

function Hr(e) {
var t;
if (!e.controller) return null;
var r = function(e) {
if (!e) return null;
try {
var t = JSON.parse(e);
if ("quest" === t.type && t.id && t.origin && "string" == typeof t.info) return t;
} catch (e) {}
return null;
}(null === (t = e.controller.sign) || void 0 === t ? void 0 : t.text);
if (!r) return null;
var o = e.terminal;
return {
roomName: e.name,
lastSeen: Game.time,
hasTerminal: void 0 !== o && !o.my,
availableQuests: [ r.id ]
};
}

function Wr() {
var e;
return (null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.npcRooms) || {};
}

function Yr(e) {
var t = Memory;
t.tooangel || (t.tooangel = {}), t.tooangel.npcRooms || (t.tooangel.npcRooms = {});
var r = t.tooangel.npcRooms[e.roomName];
if (r) {
var o = new Set(s(s([], i(r.availableQuests), !1), i(e.availableQuests), !1));
e.availableQuests = Array.from(o);
}
t.tooangel.npcRooms[e.roomName] = e;
}

function Kr() {
var e = Memory;
return e.tooangel || (e.tooangel = {
enabled: !0,
reputation: {
value: 0,
lastUpdated: 0
},
npcRooms: {},
activeQuests: {},
completedQuests: [],
lastProcessedTick: 0
}), e.tooangel.reputation || (e.tooangel.reputation = {
value: 0,
lastUpdated: 0
}), e.tooangel.npcRooms || (e.tooangel.npcRooms = {}), e.tooangel.activeQuests || (e.tooangel.activeQuests = {}), 
e.tooangel.completedQuests || (e.tooangel.completedQuests = []), e.tooangel;
}

var Vr = {
MAX_ACTIVE_QUESTS: 3,
MIN_APPLICATION_ENERGY: 100,
DEADLINE_BUFFER: 500,
SUPPORTED_TYPES: [ "buildcs" ]
};

function qr(e) {
try {
var t = JSON.parse(e);
if ("quest" === t.type && t.id && t.room && t.quest && "number" == typeof t.end) return !t.result && t.end <= Game.time ? (Me.debug("Ignoring quest ".concat(t.id, " with past deadline: ").concat(t.end, " (current: ").concat(Game.time, ")"), {
subsystem: "TooAngel"
}), null) : t;
} catch (e) {}
return null;
}

function jr() {
return Kr().activeQuests || {};
}

function zr() {
var e = jr();
return Object.values(e).filter(function(e) {
return "active" === e.status || "applied" === e.status;
}).length < Vr.MAX_ACTIVE_QUESTS;
}

function Xr(e) {
return Vr.SUPPORTED_TYPES.includes(e);
}

function Qr(e, t, r) {
var o, n;
if (!zr()) return Me.debug("Cannot accept more quests (at max capacity)", {
subsystem: "TooAngel"
}), !1;
if (r) n = Game.rooms[r]; else {
var a = 1 / 0;
for (var i in Game.rooms) {
var s = Game.rooms[i];
if ((null === (o = s.controller) || void 0 === o ? void 0 : o.my) && s.terminal && s.terminal.my) {
var c = Game.map.getRoomLinearDistance(i, t);
c < a && (a = c, n = s);
}
}
}
if (!n || !n.terminal || !n.terminal.my) return Me.warn("No terminal available to apply for quest", {
subsystem: "TooAngel"
}), !1;
var l = n.terminal, u = l.store[RESOURCE_ENERGY];
if (u < Vr.MIN_APPLICATION_ENERGY) return Me.warn("Insufficient energy for quest application: ".concat(u, " < ").concat(Vr.MIN_APPLICATION_ENERGY), {
subsystem: "TooAngel"
}), !1;
var m = {
type: "quest",
id: e,
action: "apply"
}, p = l.send(RESOURCE_ENERGY, Vr.MIN_APPLICATION_ENERGY, t, JSON.stringify(m));
return p === OK ? (Me.info("Applied for quest ".concat(e, " from ").concat(n.name, " to ").concat(t), {
subsystem: "TooAngel"
}), Kr().activeQuests[e] = {
id: e,
type: "buildcs",
status: "applied",
targetRoom: "",
originRoom: t,
deadline: 0,
appliedAt: Game.time
}, !0) : (Me.warn("Failed to apply for quest: ".concat(p), {
subsystem: "TooAngel"
}), !1);
}

function Zr(e) {
var t = Kr(), r = t.activeQuests[e.id];
r ? ("won" === e.result ? (Me.info("Quest ".concat(e.id, " completed successfully!"), {
subsystem: "TooAngel"
}), r.status = "completed") : (Me.warn("Quest ".concat(e.id, " failed"), {
subsystem: "TooAngel"
}), r.status = "failed"), r.completedAt = Game.time, t.completedQuests.includes(e.id) || t.completedQuests.push(e.id)) : Me.warn("Received completion for unknown quest: ".concat(e.id), {
subsystem: "TooAngel"
});
}

function Jr() {
var e;
return (null === (e = Kr().reputation) || void 0 === e ? void 0 : e.value) || 0;
}

function $r(e) {
try {
var t = JSON.parse(e);
if ("reputation" === t.type && "number" == typeof t.reputation) return t.reputation;
} catch (e) {}
return null;
}

function eo(e) {
var t, r, o, n = Kr(), a = (null === (t = n.reputation) || void 0 === t ? void 0 : t.lastRequestedAt) || 0;
if (Game.time - a < 1e3) return Me.debug("Reputation request on cooldown (".concat(1e3 - (Game.time - a), " ticks remaining)"), {
subsystem: "TooAngel"
}), !1;
if (e) o = Game.rooms[e]; else for (var i in Game.rooms) {
var s = Game.rooms[i];
if ((null === (r = s.controller) || void 0 === r ? void 0 : r.my) && s.terminal && s.terminal.my) {
o = s;
break;
}
}
if (!o || !o.terminal || !o.terminal.my) return Me.warn("No terminal available to request reputation", {
subsystem: "TooAngel"
}), !1;
var c = function(e) {
var t = Wr(), r = null, o = 1 / 0;
for (var n in t) {
var a = Game.map.getRoomLinearDistance(e, n);
a < o && (o = a, r = t[n]);
}
return r;
}(o.name);
if (!c || !c.hasTerminal) return Me.warn("No TooAngel NPC room with terminal found", {
subsystem: "TooAngel"
}), !1;
var l = o.terminal, u = l.store[RESOURCE_ENERGY];
if (u < 100) return Me.warn("Insufficient energy for reputation request: ".concat(u, " < ").concat(100), {
subsystem: "TooAngel"
}), !1;
var m = l.send(RESOURCE_ENERGY, 100, c.roomName, JSON.stringify({
type: "reputation"
}));
return m === OK ? (Me.info("Sent reputation request to ".concat(c.roomName, " from ").concat(o.name), {
subsystem: "TooAngel"
}), n.reputation.lastRequestedAt = Game.time, !0) : (Me.warn("Failed to send reputation request: ".concat(m), {
subsystem: "TooAngel"
}), !1);
}

function to(e) {
var t, r, o, n, i, s, c, l = Game.rooms[e.targetRoom];
if (l) {
if (function(e) {
var t = Game.rooms[e];
return !!t && 0 === t.find(FIND_CONSTRUCTION_SITES).length;
}(e.targetRoom)) return Me.info("Quest ".concat(e.id, " (buildcs) completed! All construction sites built in ").concat(e.targetRoom), {
subsystem: "TooAngel"
}), function(e) {
var t, r, o = function(e) {
return jr()[e] || null;
}(e);
if (!o) return Me.warn("Cannot notify completion for unknown quest: ".concat(e), {
subsystem: "TooAngel"
}), !1;
for (var n in Game.rooms) {
var a = Game.rooms[n];
if ((null === (t = a.controller) || void 0 === t ? void 0 : t.my) && a.terminal && a.terminal.my) {
r = a;
break;
}
}
if (!r || !r.terminal) return !1;
var i = {
type: "quest",
id: e,
room: o.targetRoom,
quest: o.type,
end: o.deadline,
result: "won"
};
r.terminal.send(RESOURCE_ENERGY, 100, o.originRoom, JSON.stringify(i)) === OK && Me.info("Notified quest completion: ".concat(e, " (").concat("won", ")"), {
subsystem: "TooAngel"
});
}(e.id), e.status = "completed", void (e.completedAt = Game.time);
var u = l.find(FIND_CONSTRUCTION_SITES);
Me.debug("Quest ".concat(e.id, " (buildcs): ").concat(u.length, " construction sites remaining in ").concat(e.targetRoom), {
subsystem: "TooAngel"
});
var m = e.assignedCreeps || [], p = [];
try {
for (var d = a(m), f = d.next(); !f.done; f = d.next()) {
var y = f.value, g = Game.creeps[y];
g && p.push(g);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
f && !f.done && (r = d.return) && r.call(d);
} finally {
if (t) throw t.error;
}
}
if (p.length < 3 && u.length > 0) for (var h in Game.rooms) {
var v = Game.rooms[h];
if (null === (c = v.controller) || void 0 === c ? void 0 : c.my) {
var R = v.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory, r = t.role;
return !("larvaWorker" !== r && "builder" !== r || t.questId || t.assistTarget);
}
});
try {
for (var E = (o = void 0, a(R)), T = E.next(); !(T.done || ((O = (_ = T.value).memory).questId = e.id, 
p.push(_), m.push(_.name), Me.info("Assigned ".concat(_.name, " to quest ").concat(e.id, " (buildcs)"), {
subsystem: "TooAngel"
}), p.length >= 3)); T = E.next()) ;
} catch (e) {
o = {
error: e
};
} finally {
try {
T && !T.done && (n = E.return) && n.call(E);
} finally {
if (o) throw o.error;
}
}
if (p.length >= 3) break;
}
}
e.assignedCreeps = m;
try {
for (var C = a(p), S = C.next(); !S.done; S = C.next()) {
var _, O;
(O = (_ = S.value).memory).questId = e.id, O.questTarget = e.targetRoom, O.questAction = "build";
}
} catch (e) {
i = {
error: e
};
} finally {
try {
S && !S.done && (s = C.return) && s.call(C);
} finally {
if (i) throw i.error;
}
}
} else Me.debug("Cannot execute buildcs quest ".concat(e.id, ": room ").concat(e.targetRoom, " not visible"), {
subsystem: "TooAngel"
});
}

var ro, oo, no = function() {
function e() {
this.lastScanTick = 0, this.lastReputationRequestTick = 0, this.lastQuestDiscoveryTick = 0;
}
return e.prototype.isEnabled = function() {
var e, t;
return null === (t = null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.enabled) || void 0 === t || t;
}, e.prototype.enable = function() {
var e = Memory;
e.tooangel || (e.tooangel = {}), e.tooangel.enabled = !0, Me.info("TooAngel integration enabled", {
subsystem: "TooAngel"
});
}, e.prototype.disable = function() {
var e = Memory;
e.tooangel || (e.tooangel = {}), e.tooangel.enabled = !1, Me.info("TooAngel integration disabled", {
subsystem: "TooAngel"
});
}, e.prototype.run = function() {
if (this.isEnabled() && !(Game.cpu.bucket < 2e3)) try {
!function() {
var e, t;
if (Game.market.incomingTransactions) {
var r = Kr();
try {
for (var o = a(Game.market.incomingTransactions), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
if (!i.order && i.description) {
var s = $r(i.description);
null !== s && (Me.info("Received reputation update from TooAngel: ".concat(s), {
subsystem: "TooAngel"
}), r.reputation = {
value: s,
lastUpdated: Game.time
});
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}
}(), function() {
var e, t;
if (Game.market.incomingTransactions) {
var r = Kr();
try {
for (var o = a(Game.market.incomingTransactions), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
if (!i.order && i.description) {
var s = qr(i.description);
if (s) {
if (Me.info("Received quest ".concat(s.id, ": ").concat(s.quest, " in ").concat(s.room, " (deadline: ").concat(s.end, ")"), {
subsystem: "TooAngel"
}), s.result) {
Zr(s);
continue;
}
var c = r.activeQuests[s.id];
r.activeQuests[s.id] = {
id: s.id,
type: s.quest,
status: "completed" === (null == c ? void 0 : c.status) || "failed" === (null == c ? void 0 : c.status) ? c.status : "active",
targetRoom: s.room,
originRoom: s.origin || i.from,
deadline: s.end,
appliedAt: null == c ? void 0 : c.appliedAt,
receivedAt: Game.time,
assignedCreeps: []
}, Xr(s.quest) || (Me.warn("Received unsupported quest type: ".concat(s.quest), {
subsystem: "TooAngel"
}), r.activeQuests[s.id].status = "failed");
}
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}
}(), function() {
var e, t = (null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.activeQuests) || {};
for (var r in t) {
var o = t[r];
o.assignedCreeps && (o.assignedCreeps = o.assignedCreeps.filter(function(e) {
return void 0 !== Game.creeps[e];
}));
}
}(), function() {
var e, t = (null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.activeQuests) || {};
for (var r in t) {
var o = t[r];
"active" === o.status && (o.deadline > 0 && Game.time > o.deadline ? (Me.warn("Quest ".concat(r, " missed deadline (").concat(o.deadline, ")"), {
subsystem: "TooAngel"
}), o.status = "failed", o.completedAt = Game.time) : "buildcs" === o.type ? to(o) : (Me.warn("Unsupported quest type for execution: ".concat(o.type), {
subsystem: "TooAngel"
}), o.status = "failed", o.completedAt = Game.time));
}
}(), function() {
var e = Kr().activeQuests || {};
for (var t in e) {
var r = e[t];
r.deadline > 0 && Game.time >= r.deadline - Vr.DEADLINE_BUFFER && ("active" !== r.status && "applied" !== r.status || (Me.warn("Quest ".concat(t, " expired (deadline: ").concat(r.deadline, ", current: ").concat(Game.time, ")"), {
subsystem: "TooAngel"
}), r.status = "failed", r.completedAt = Game.time)), ("completed" === r.status || "failed" === r.status) && r.completedAt && Game.time - r.completedAt > 1e4 && delete e[t];
}
}(), Game.time - this.lastScanTick >= 500 && (this.scanForNPCs(), this.lastScanTick = Game.time), 
Game.time - this.lastReputationRequestTick >= 2e3 && (this.updateReputation(), this.lastReputationRequestTick = Game.time), 
Game.time - this.lastQuestDiscoveryTick >= 1e3 && (this.discoverQuests(), this.lastQuestDiscoveryTick = Game.time);
} catch (t) {
var e = "tooangel_error_".concat(Game.time % 100);
Memory[e] || (Me.error("TooAngel manager error: ".concat(t), {
subsystem: "TooAngel"
}), Memory[e] = !0);
}
}, e.prototype.scanForNPCs = function() {
var e, t, r = function() {
var e = [];
for (var t in Game.rooms) {
var r = Hr(Game.rooms[t]);
r && (Me.info("Detected TooAngel NPC room: ".concat(t), {
subsystem: "TooAngel"
}), e.push(r));
}
return e;
}();
try {
for (var o = a(r), n = o.next(); !n.done; n = o.next()) Yr(n.value);
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
r.length > 0 && Me.info("Scanned ".concat(r.length, " TooAngel NPC rooms"), {
subsystem: "TooAngel"
});
}, e.prototype.updateReputation = function() {
eo();
}, e.prototype.discoverQuests = function() {
!function() {
var e, t;
if (zr()) {
var r = Wr(), o = jr();
for (var n in r) {
var i = r[n];
try {
for (var s = (e = void 0, a(i.availableQuests)), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (!o[l]) return Me.info("Auto-applying for quest ".concat(l, " from ").concat(n), {
subsystem: "TooAngel"
}), void Qr(l, n);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = s.return) && t.call(s);
} finally {
if (e) throw e.error;
}
}
}
}
}();
}, e.prototype.getReputation = function() {
return Jr();
}, e.prototype.getActiveQuests = function() {
return jr();
}, e.prototype.applyForQuest = function(e, t, r) {
return Qr(e, t, r);
}, e.prototype.getStatus = function() {
var e = this.getReputation(), t = this.getActiveQuests(), r = Object.values(t).filter(function(e) {
return "active" === e.status;
}).length, o = Object.values(t).filter(function(e) {
return "applied" === e.status;
}).length, n = [];
if (n.push("=== TooAngel Integration ==="), n.push("Enabled: ".concat(this.isEnabled())), 
n.push("Reputation: ".concat(e)), n.push("Active Quests: ".concat(r)), n.push("Applied Quests: ".concat(o)), 
n.push(""), Object.keys(t).length > 0) for (var a in n.push("Quests:"), t) {
var i = t[a], s = i.deadline - Game.time;
n.push("  ".concat(a, ": ").concat(i.type, " in ").concat(i.targetRoom, " (").concat(i.status, ", ").concat(s, " ticks left)"));
}
return n.join("\n");
}, n([ Er("empire:tooangel", "TooAngel Manager", {
priority: $t.LOW,
interval: 10
}) ], e.prototype, "run", null), n([ Cr() ], e);
}(), ao = new no, io = {
status: function() {
return ao.getStatus();
},
enable: function() {
return ao.enable(), "TooAngel integration enabled";
},
disable: function() {
return ao.disable(), "TooAngel integration disabled";
},
reputation: function() {
var e = Jr();
return "Current TooAngel reputation: ".concat(e);
},
requestReputation: function(e) {
return eo(e) ? "Reputation request sent".concat(e ? " from ".concat(e) : "") : "Failed to send reputation request (check logs for details)";
},
quests: function() {
var e, t = jr(), r = [ "Active Quests:" ];
if (0 === Object.keys(t).length) r.push("  No active quests"); else for (var o in t) {
var n = t[o], a = n.deadline - Game.time, i = (null === (e = n.assignedCreeps) || void 0 === e ? void 0 : e.length) || 0;
r.push("  ".concat(o, ":")), r.push("    Type: ".concat(n.type)), r.push("    Target: ".concat(n.targetRoom)), 
r.push("    Status: ".concat(n.status)), r.push("    Time left: ".concat(a, " ticks")), 
r.push("    Assigned creeps: ".concat(i));
}
return r.join("\n");
},
npcs: function() {
var e = Wr(), t = [ "TooAngel NPC Rooms:" ];
if (0 === Object.keys(e).length) t.push("  No NPC rooms discovered"); else for (var r in e) {
var o = e[r];
t.push("  ".concat(r, ":")), t.push("    Has terminal: ".concat(o.hasTerminal)), 
t.push("    Available quests: ".concat(o.availableQuests.length)), t.push("    Last seen: ".concat(Game.time - o.lastSeen, " ticks ago"));
}
return t.join("\n");
},
apply: function(e, t, r) {
return Qr(e, t, r) ? "Applied for quest ".concat(e).concat(r ? " from ".concat(r) : "") : "Failed to apply for quest (check logs for details)";
},
help: function() {
return [ "TooAngel Console Commands:", "", "  tooangel.status()                    - Show current status", "  tooangel.enable()                    - Enable integration", "  tooangel.disable()                   - Disable integration", "  tooangel.reputation()                - Get current reputation", "  tooangel.requestReputation(fromRoom) - Request reputation update", "  tooangel.quests()                    - List active quests", "  tooangel.npcs()                      - List discovered NPC rooms", "  tooangel.apply(id, origin, fromRoom) - Apply for a quest", "  tooangel.help()                      - Show this help" ].join("\n");
}
}, so = function() {
function t() {}
return t.prototype.status = function() {
var t = e.memoryMonitor.checkMemoryUsage(), r = t.breakdown, o = "Memory Status: ".concat(t.status.toUpperCase(), "\n");
return o += "Usage: ".concat(e.memoryMonitor.formatBytes(t.used), " / ").concat(e.memoryMonitor.formatBytes(t.limit), " (").concat((100 * t.percentage).toFixed(1), "%)\n\n"), 
o += "Breakdown:\n", o += "  Empire:        ".concat(e.memoryMonitor.formatBytes(r.empire), " (").concat((r.empire / r.total * 100).toFixed(1), "%)\n"), 
o += "  Rooms:         ".concat(e.memoryMonitor.formatBytes(r.rooms), " (").concat((r.rooms / r.total * 100).toFixed(1), "%)\n"), 
o += "  Creeps:        ".concat(e.memoryMonitor.formatBytes(r.creeps), " (").concat((r.creeps / r.total * 100).toFixed(1), "%)\n"), 
o += "  Clusters:      ".concat(e.memoryMonitor.formatBytes(r.clusters), " (").concat((r.clusters / r.total * 100).toFixed(1), "%)\n"), 
(o += "  SS2 Queue:     ".concat(e.memoryMonitor.formatBytes(r.ss2PacketQueue), " (").concat((r.ss2PacketQueue / r.total * 100).toFixed(1), "%)\n")) + "  Other:         ".concat(e.memoryMonitor.formatBytes(r.other), " (").concat((r.other / r.total * 100).toFixed(1), "%)\n");
}, t.prototype.analyze = function(t) {
void 0 === t && (t = 10);
var r = e.memoryMonitor.getLargestConsumers(t), o = e.memoryPruner.getRecommendations(), n = "Top ".concat(t, " Memory Consumers:\n");
return r.forEach(function(t, r) {
n += "".concat(r + 1, ". ").concat(t.type, ":").concat(t.name, " - ").concat(e.memoryMonitor.formatBytes(t.size), "\n");
}), o.length > 0 ? (n += "\nRecommendations:\n", o.forEach(function(e) {
n += "- ".concat(e, "\n");
})) : n += "\nNo recommendations at this time.\n", n;
}, t.prototype.prune = function() {
var t = e.memoryPruner.pruneAll(), r = "Memory Pruning Complete:\n";
return r += "  Dead creeps removed:        ".concat(t.deadCreeps, "\n"), r += "  Event log entries removed:  ".concat(t.eventLogs, "\n"), 
r += "  Stale intel removed:        ".concat(t.staleIntel, "\n"), (r += "  Market history removed:     ".concat(t.marketHistory, "\n")) + "  Total bytes saved:          ".concat(e.memoryMonitor.formatBytes(t.bytesSaved), "\n");
}, t.prototype.segments = function() {
var t, r, o = e.memorySegmentManager.getActiveSegments(), n = "Memory Segments:\n\n";
n += "Active segments: ".concat(o.length, "/10\n"), o.length > 0 && (n += "  Loaded: [".concat(o.join(", "), "]\n\n")), 
n += "Allocation Strategy:\n";
var s = function(t, r) {
n += "  ".concat(t.padEnd(20), " ").concat(r.start.toString().padStart(2), "-").concat(r.end.toString().padEnd(2));
var a = o.filter(function(e) {
return e >= r.start && e <= r.end;
});
if (a.length > 0) {
var i = a.map(function(t) {
var r = e.memorySegmentManager.getSegmentSize(t);
return "".concat(t, ":").concat(e.memoryMonitor.formatBytes(r));
});
n += " [".concat(i.join(", "), "]");
}
n += "\n";
};
try {
for (var c = a(Object.entries(e.SEGMENT_ALLOCATION)), l = c.next(); !l.done; l = c.next()) {
var u = i(l.value, 2);
s(u[0], u[1]);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
return n;
}, t.prototype.compress = function(t) {
var r, o, n = t.split("."), i = Memory;
try {
for (var s = a(n), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (!i || "object" != typeof i || !(l in i)) return "Path not found: ".concat(t);
i = i[l];
}
} catch (e) {
r = {
error: e
};
} finally {
try {
c && !c.done && (o = s.return) && o.call(s);
} finally {
if (r) throw r.error;
}
}
if (!i) return "No data at path: ".concat(t);
var u = e.memoryCompressor.getCompressionStats(i), m = "Compression Test for: ".concat(t, "\n");
return m += "  Original size:    ".concat(e.memoryMonitor.formatBytes(u.originalSize), "\n"), 
m += "  Compressed size:  ".concat(e.memoryMonitor.formatBytes(u.compressedSize), "\n"), 
m += "  Bytes saved:      ".concat(e.memoryMonitor.formatBytes(u.bytesSaved), "\n"), 
(m += "  Compression ratio: ".concat((100 * u.ratio).toFixed(1), "%\n")) + "  Worth compressing: ".concat(u.ratio < .9 ? "YES" : "NO", "\n");
}, t.prototype.migrations = function() {
var t = e.migrationRunner.getCurrentVersion(), r = e.migrationRunner.getLatestVersion(), o = e.migrationRunner.getPendingMigrations(), n = "Memory Migration Status:\n";
return n += "  Current version: ".concat(t, "\n"), n += "  Latest version:  ".concat(r, "\n"), 
n += "  Status: ".concat(o.length > 0 ? "PENDING" : "UP TO DATE", "\n\n"), o.length > 0 && (n += "Pending Migrations:\n", 
o.forEach(function(e) {
n += "  v".concat(e.version, ": ").concat(e.description, "\n");
}), n += "\nMigrations will run automatically on next tick.\n"), n;
}, t.prototype.migrate = function() {
var t = e.migrationRunner.getCurrentVersion();
e.migrationRunner.runMigrations();
var r = e.migrationRunner.getCurrentVersion();
return r > t ? "Migrated from v".concat(t, " to v").concat(r) : "No migrations needed (current: v".concat(r, ")");
}, t.prototype.reset = function(t) {
if ("CONFIRM" !== t) return "WARNING: This will clear ALL memory!\nTo confirm, use: memory.reset('CONFIRM')";
var r = Memory;
for (var o in r) delete r[o];
for (var n = 0; n < 100; n++) RawMemory.segments[n] = "";
return e.memoryManager.initialize(), "Memory reset complete. All data cleared (main memory + 100 segments).";
}, n([ Yt({
name: "memory.status",
description: "Show current memory usage and status",
usage: "memory.status()",
examples: [ "memory.status()" ],
category: "Memory"
}) ], t.prototype, "status", null), n([ Yt({
name: "memory.analyze",
description: "Analyze memory usage and show largest consumers",
usage: "memory.analyze([topN])",
examples: [ "memory.analyze()", "memory.analyze(20)" ],
category: "Memory"
}) ], t.prototype, "analyze", null), n([ Yt({
name: "memory.prune",
description: "Manually trigger memory pruning to clean stale data",
usage: "memory.prune()",
examples: [ "memory.prune()" ],
category: "Memory"
}) ], t.prototype, "prune", null), n([ Yt({
name: "memory.segments",
description: "Show memory segment allocation and usage",
usage: "memory.segments()",
examples: [ "memory.segments()" ],
category: "Memory"
}) ], t.prototype, "segments", null), n([ Yt({
name: "memory.compress",
description: "Test compression on a memory path",
usage: "memory.compress(path)",
examples: [ "memory.compress('empire.knownRooms')" ],
category: "Memory"
}) ], t.prototype, "compress", null), n([ Yt({
name: "memory.migrations",
description: "Show migration status and pending migrations",
usage: "memory.migrations()",
examples: [ "memory.migrations()" ],
category: "Memory"
}) ], t.prototype, "migrations", null), n([ Yt({
name: "memory.migrate",
description: "Manually trigger memory migrations",
usage: "memory.migrate()",
examples: [ "memory.migrate()" ],
category: "Memory"
}) ], t.prototype, "migrate", null), n([ Yt({
name: "memory.reset",
description: "Clear all memory (DANGEROUS - requires confirmation)",
usage: "memory.reset('CONFIRM')",
examples: [ "memory.reset('CONFIRM')" ],
category: "Memory"
}) ], t.prototype, "reset", null), t;
}(), co = new so, lo = {
minPower: 1e3,
maxDistance: 5,
minTicksRemaining: 3e3,
healerRatio: .5,
minBucket: 0,
maxConcurrentOps: 2
}, uo = function() {
function t(e) {
void 0 === e && (e = {}), this.operations = new Map, this.lastScan = 0, this.config = o(o({}, lo), e);
}
return t.prototype.run = function() {
Game.time - this.lastScan >= 50 && (this.scanForPowerBanks(), this.lastScan = Game.time), 
this.updateOperations(), this.evaluateOpportunities(), Game.time % 100 == 0 && this.operations.size > 0 && this.logStatus();
}, t.prototype.scanForPowerBanks = function() {
var t, r, o = e.memoryManager.getEmpire(), n = function(e) {
var n, s, c = Game.rooms[e], l = e.match(/^[WE](\d+)[NS](\d+)$/);
if (!l) return "continue";
var u = parseInt(l[1], 10), m = parseInt(l[2], 10);
if (u % 10 != 0 && m % 10 != 0) return "continue";
var p = c.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_BANK;
}
}), d = function(n) {
var a = o.powerBanks.find(function(t) {
return t.roomName === e && t.pos.x === n.pos.x && t.pos.y === n.pos.y;
});
if (a) a.power = n.power, a.decayTick = Game.time + (null !== (r = n.ticksToDecay) && void 0 !== r ? r : 5e3); else {
var s = {
roomName: e,
pos: {
x: n.pos.x,
y: n.pos.y
},
power: n.power,
decayTick: Game.time + (null !== (t = n.ticksToDecay) && void 0 !== t ? t : 5e3),
active: !1
};
o.powerBanks.push(s), n.power >= i.config.minPower && Me.info("Power bank discovered in ".concat(e, ": ").concat(n.power, " power"), {
subsystem: "PowerBank"
});
}
};
try {
for (var f = (n = void 0, a(p)), y = f.next(); !y.done; y = f.next()) d(y.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
y && !y.done && (s = f.return) && s.call(f);
} finally {
if (n) throw n.error;
}
}
}, i = this;
for (var s in Game.rooms) n(s);
o.powerBanks = o.powerBanks.filter(function(e) {
return e.decayTick > Game.time;
});
}, t.prototype.updateOperations = function() {
var e, t;
try {
for (var r = a(this.operations), o = r.next(); !o.done; o = r.next()) {
var n = i(o.value, 2), s = n[0], c = n[1];
switch (c.state) {
case "scouting":
this.updateScoutingOp(c);
break;

case "attacking":
this.updateAttackingOp(c);
break;

case "collecting":
this.updateCollectingOp(c);
break;

case "complete":
case "failed":
Game.time - c.startedAt > 1e4 && this.operations.delete(s);
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
o && !o.done && (t = r.return) && t.call(r);
} finally {
if (e) throw e.error;
}
}
}, t.prototype.updateScoutingOp = function(e) {
var t, r = Game.rooms[e.roomName];
if (r) {
var o = r.find(FIND_STRUCTURES, {
filter: function(t) {
return t.structureType === STRUCTURE_POWER_BANK && t.pos.x === e.pos.x && t.pos.y === e.pos.y;
}
})[0];
if (!o) return e.state = "failed", void Me.warn("Power bank in ".concat(e.roomName, " disappeared"), {
subsystem: "PowerBank"
});
e.power = o.power, e.decayTick = Game.time + (null !== (t = o.ticksToDecay) && void 0 !== t ? t : 0), 
e.assignedCreeps.attackers.length > 0 && (e.state = "attacking", Me.info("Starting attack on power bank in ".concat(e.roomName), {
subsystem: "PowerBank"
}));
}
}, t.prototype.updateAttackingOp = function(e) {
var t, r = Game.rooms[e.roomName];
if (e.assignedCreeps.attackers = e.assignedCreeps.attackers.filter(function(e) {
return Game.creeps[e];
}), e.assignedCreeps.healers = e.assignedCreeps.healers.filter(function(e) {
return Game.creeps[e];
}), r) {
var o = r.find(FIND_STRUCTURES, {
filter: function(t) {
return t.structureType === STRUCTURE_POWER_BANK && t.pos.x === e.pos.x && t.pos.y === e.pos.y;
}
})[0];
if (!o) return e.state = "collecting", void Me.info("Power bank destroyed in ".concat(e.roomName, ", collecting power"), {
subsystem: "PowerBank"
});
var n = null !== (t = e.lastHits) && void 0 !== t ? t : 2e6;
e.lastHits = o.hits, n > o.hits && (e.damageDealt += n - o.hits);
var a = e.decayTick - Game.time, i = e.damageDealt / Math.max(1, Game.time - e.startedAt), s = o.hits / Math.max(1, i);
s > .9 * a && Me.warn("Power bank in ".concat(e.roomName, " may decay before completion (").concat(Math.round(s), " > ").concat(a, ")"), {
subsystem: "PowerBank"
}), e.estimatedCompletion = Game.time + Math.round(s);
} else 0 === e.assignedCreeps.attackers.length && 0 === e.assignedCreeps.healers.length && (e.state = "failed");
}, t.prototype.updateCollectingOp = function(e) {
var t = Game.rooms[e.roomName];
if (e.assignedCreeps.carriers = e.assignedCreeps.carriers.filter(function(e) {
return Game.creeps[e];
}), t) {
var r = t.find(FIND_DROPPED_RESOURCES, {
filter: function(e) {
return e.resourceType === RESOURCE_POWER;
}
}), o = t.find(FIND_RUINS, {
filter: function(e) {
return e.store.getUsedCapacity(RESOURCE_POWER) > 0;
}
});
0 === r.length && 0 === o.length && (e.state = "complete", Me.info("Power bank operation complete in ".concat(e.roomName, ": ").concat(e.powerCollected, " power collected"), {
subsystem: "PowerBank"
}));
} else 0 === e.assignedCreeps.carriers.length && (e.state = "failed");
}, t.prototype.evaluateOpportunities = function() {
var t, r, o = this;
if (!(Array.from(this.operations.values()).filter(function(e) {
return "complete" !== e.state && "failed" !== e.state;
}).length >= this.config.maxConcurrentOps)) {
var n = e.memoryManager.getEmpire(), a = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.controller.level >= 7;
});
if (0 !== a.length) {
var i = n.powerBanks.filter(function(e) {
return !(e.active || o.operations.has(e.roomName) || e.power < o.config.minPower || e.decayTick - Game.time < o.config.minTicksRemaining || o.getMinDistanceToOwned(e.roomName, a) > o.config.maxDistance);
}).map(function(e) {
return {
entry: e,
score: o.scorePowerBank(e, a)
};
}).sort(function(e, t) {
return t.score - e.score;
});
if (i.length > 0 && (null !== (r = null === (t = i[0]) || void 0 === t ? void 0 : t.score) && void 0 !== r ? r : 0) > 0) {
var s = i[0];
this.startOperation(s.entry, a);
}
}
}
}, t.prototype.scorePowerBank = function(e, t) {
var r = 0;
r += .01 * e.power;
var o = e.decayTick - Game.time;
return o > 4e3 && (r += 50), o > 5e3 && (r += 30), r -= 20 * this.getMinDistanceToOwned(e.roomName, t), 
e.power >= 3e3 && (r += 50), e.power >= 5e3 && (r += 50), r;
}, t.prototype.getMinDistanceToOwned = function(e, t) {
var r, o, n = 1 / 0;
try {
for (var i = a(t), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(e, c.name);
l < n && (n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
return n;
}, t.prototype.startOperation = function(e, t) {
var r, o, n = null, i = 1 / 0;
try {
for (var s = a(t), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.map.getRoomLinearDistance(e.roomName, l.name);
u < i && (i = u, n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
c && !c.done && (o = s.return) && o.call(s);
} finally {
if (r) throw r.error;
}
}
if (n) {
var m = {
roomName: e.roomName,
pos: e.pos,
power: e.power,
decayTick: e.decayTick,
homeRoom: n.name,
state: "scouting",
assignedCreeps: {
attackers: [],
healers: [],
carriers: []
},
damageDealt: 0,
powerCollected: 0,
startedAt: Game.time,
estimatedCompletion: 0
};
this.operations.set(e.roomName, m), e.active = !0, Me.info("Started power bank operation in ".concat(e.roomName, " (").concat(e.power, " power, home: ").concat(n.name, ")"), {
subsystem: "PowerBank"
});
}
}, t.prototype.assignCreep = function(e, t, r) {
var o = this.operations.get(t);
if (!o) return !1;
switch (r) {
case "attacker":
o.assignedCreeps.attackers.includes(e) || o.assignedCreeps.attackers.push(e);
break;

case "healer":
o.assignedCreeps.healers.includes(e) || o.assignedCreeps.healers.push(e);
break;

case "carrier":
o.assignedCreeps.carriers.includes(e) || o.assignedCreeps.carriers.push(e);
}
return !0;
}, t.prototype.recordPowerCollected = function(e, t) {
var r = this.operations.get(e);
r && (r.powerCollected += t);
}, t.prototype.getActiveOperations = function() {
return Array.from(this.operations.values()).filter(function(e) {
return "complete" !== e.state && "failed" !== e.state;
});
}, t.prototype.getOperation = function(e) {
return this.operations.get(e);
}, t.prototype.getRequiredCreeps = function(e) {
var t = e.decayTick - Game.time, r = (2e6 - e.damageDealt) / (.8 * t), o = Math.ceil(r / 600), n = Math.ceil(o * this.config.healerRatio), a = Math.ceil(e.power / 2e3);
return {
attackers: Math.max(1, o),
healers: Math.max(1, n),
carriers: Math.max(1, a)
};
}, t.prototype.requestSpawns = function(e) {
var t, r, o = 0, n = 0, s = 0;
try {
for (var c = a(this.operations), l = c.next(); !l.done; l = c.next()) {
var u = i(l.value, 2), m = (u[0], u[1]);
if (m.homeRoom === e && "complete" !== m.state && "failed" !== m.state) {
var p = this.getRequiredCreeps(m), d = {
attackers: m.assignedCreeps.attackers.filter(function(e) {
return Game.creeps[e];
}).length,
healers: m.assignedCreeps.healers.filter(function(e) {
return Game.creeps[e];
}).length,
carriers: m.assignedCreeps.carriers.filter(function(e) {
return Game.creeps[e];
}).length
};
"attacking" !== m.state && "scouting" !== m.state || (o += Math.max(0, p.attackers - d.attackers), 
n += Math.max(0, p.healers - d.healers)), "collecting" !== m.state && "attacking" !== m.state || (s += Math.max(0, p.carriers - d.carriers));
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
return {
powerHarvesters: o,
healers: n,
powerCarriers: s
};
}, t.prototype.getProfitability = function(e, t) {
var r = Game.map.getRoomLinearDistance(e.roomName, t);
e.decayTick, Game.time;
var o = 50 * r + Math.ceil(2e6 / 1200), n = 7200 + .1 * o, a = 10 * e.power - n, i = o > 0 ? a / o : 0;
return {
power: e.power,
energyCost: n,
netProfit: a,
profitPerTick: i
};
}, t.prototype.logStatus = function() {
var e, t, r = Array.from(this.operations.values()).filter(function(e) {
return "complete" !== e.state && "failed" !== e.state;
});
try {
for (var o = a(r), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
Me.info("Power bank op ".concat(i.roomName, ": ").concat(i.state, ", ") + "".concat(i.assignedCreeps.attackers.length, "A/").concat(i.assignedCreeps.healers.length, "H/").concat(i.assignedCreeps.carriers.length, "C, ") + "".concat(Math.round(i.damageDealt / 1e3), "k damage, ").concat(i.powerCollected, " collected"), {
subsystem: "PowerBank"
});
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, n([ Er("empire:powerBank", "Power Bank Harvesting", {
priority: $t.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(), mo = new uo, po = {
minGPL: 1,
minPowerReserve: 1e4,
energyPerPower: 50,
minEnergyReserve: 1e5,
gplMilestones: [ 1, 2, 5, 10, 15, 20 ]
}, fo = [ PWR_GENERATE_OPS, PWR_OPERATE_SPAWN, PWR_OPERATE_EXTENSION, PWR_OPERATE_TOWER, PWR_OPERATE_LAB, PWR_OPERATE_STORAGE, PWR_REGEN_SOURCE, PWR_OPERATE_FACTORY ], yo = [ PWR_GENERATE_OPS, PWR_OPERATE_SPAWN, PWR_SHIELD, PWR_DISRUPT_SPAWN, PWR_DISRUPT_TOWER, PWR_FORTIFY, PWR_OPERATE_TOWER, PWR_DISRUPT_TERMINAL ], go = function() {
function t(e) {
void 0 === e && (e = {}), this.assignments = new Map, this.gplState = null, this.lastGPLUpdate = 0, 
this.config = o(o({}, po), e);
}
return t.prototype.run = function() {
this.updateGPLState(), this.managePowerProcessing(), this.manageAssignments(), this.checkPowerUpgrades(), 
this.checkRespawnNeeds(), Game.time % 100 == 0 && this.logStatus();
}, t.prototype.updateGPLState = function() {
var e, t, r, o, n;
if (Game.gpl) {
var a = Game.gpl.level, i = Game.gpl.progress, s = Game.gpl.progressTotal, c = 0;
this.gplState && this.gplState.currentProgress < i && (c = i - this.gplState.currentProgress);
var l = s - i, u = null !== (t = null === (e = this.gplState) || void 0 === e ? void 0 : e.powerProcessedThisTick) && void 0 !== t ? t : 1, m = u > 0 ? Math.ceil(l / u) : 1 / 0, p = null !== (r = this.config.gplMilestones.find(function(e) {
return e > a;
})) && void 0 !== r ? r : a + 1;
this.gplState = {
currentLevel: a,
currentProgress: i,
progressNeeded: s,
powerProcessedThisTick: c,
totalPowerProcessed: (null !== (n = null === (o = this.gplState) || void 0 === o ? void 0 : o.totalPowerProcessed) && void 0 !== n ? n : 0) + c,
ticksToNextLevel: m,
targetMilestone: p,
lastUpdate: Game.time
}, this.lastGPLUpdate !== a && a > 0 && (Me.info("GPL milestone reached: Level ".concat(a), {
subsystem: "PowerCreep"
}), this.lastGPLUpdate = a);
} else this.gplState = null;
}, t.prototype.managePowerProcessing = function() {
var e, t, r = this.evaluatePowerProcessing();
try {
for (var o = a(r), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
if (i.shouldProcess) {
var s = Game.rooms[i.roomName];
if (s) {
var c = s.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0];
if (c) {
var l = c.store.getUsedCapacity(RESOURCE_POWER) > 0, u = c.store.getUsedCapacity(RESOURCE_ENERGY) >= 50;
l && u && c.processPower() === OK && Me.debug("Processing power in ".concat(i.roomName, ": ").concat(i.reason), {
subsystem: "PowerCreep"
});
}
}
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, t.prototype.evaluatePowerProcessing = function() {
var e, t, r, o, n, i = [], s = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
}).length > 0;
});
try {
for (var c = a(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.storage, p = u.terminal;
if (m || p) {
var d = (null !== (r = null == m ? void 0 : m.store.getUsedCapacity(RESOURCE_POWER)) && void 0 !== r ? r : 0) + (null !== (o = null == p ? void 0 : p.store.getUsedCapacity(RESOURCE_POWER)) && void 0 !== o ? o : 0), f = null !== (n = null == m ? void 0 : m.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== n ? n : 0, y = !1, g = "", h = 0;
d < 100 ? (y = !1, g = "Insufficient power (<100)") : f < this.config.minEnergyReserve ? (y = !1, 
g = "Insufficient energy (<".concat(this.config.minEnergyReserve, ")")) : this.gplState && this.gplState.currentLevel < this.gplState.targetMilestone ? (y = !0, 
g = "GPL progression: ".concat(this.gplState.currentLevel, " → ").concat(this.gplState.targetMilestone), 
h = 100 - Math.abs(this.gplState.currentLevel - this.gplState.targetMilestone)) : d > this.config.minPowerReserve ? (y = !0, 
g = "Excess power (".concat(d, " > ").concat(this.config.minPowerReserve, ")"), 
h = 50) : (y = !1, g = "Power reserved for power banks"), i.push({
roomName: u.name,
shouldProcess: y,
reason: g,
powerAvailable: d,
energyAvailable: f,
priority: h
});
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
return i.sort(function(e, t) {
return t.priority - e.priority;
});
}, t.prototype.manageAssignments = function() {
for (var e in Game.powerCreeps) {
var t = Game.powerCreeps[e];
if (t) {
var r = this.assignments.get(e);
r ? (r.level = t.level, r.spawned = void 0 !== t.ticksToLive, r.spawned && !r.lastRespawnTick && (r.lastRespawnTick = Game.time)) : (r = this.createAssignment(t), 
this.assignments.set(e, r));
}
}
this.considerNewPowerCreeps();
}, t.prototype.createAssignment = function(t) {
var r, o;
t.powers[PWR_OPERATE_SPAWN];
var n = void 0 !== t.powers[PWR_DISRUPT_SPAWN] ? "powerWarrior" : "powerQueen", a = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), i = null !== (o = null === (r = a[0]) || void 0 === r ? void 0 : r.name) && void 0 !== o ? o : "";
if ("powerQueen" === n) {
var s = a.filter(function(e) {
return e.controller && e.controller.level >= 7;
}).sort(function(e, t) {
var r, o, n, a, i = 100 * (null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0) + e.find(FIND_MY_STRUCTURES).length;
return 100 * (null !== (a = null === (n = t.controller) || void 0 === n ? void 0 : n.level) && void 0 !== a ? a : 0) + t.find(FIND_MY_STRUCTURES).length - i;
})[0];
s && (i = s.name);
} else {
var c = a.map(function(t) {
return {
room: t,
swarm: e.memoryManager.getSwarmState(t.name)
};
}).filter(function(e) {
return null !== e.swarm;
}).sort(function(e, t) {
var r = 100 * e.swarm.danger + e.swarm.metrics.hostileCount;
return 100 * t.swarm.danger + t.swarm.metrics.hostileCount - r;
})[0];
c && (i = c.room.name);
}
var l = this.generatePowerPath(n), u = {
name: t.name,
className: t.className,
role: n,
assignedRoom: i,
level: t.level,
spawned: void 0 !== t.ticksToLive,
lastRespawnTick: void 0 !== t.ticksToLive ? Game.time : void 0,
priority: "powerQueen" === n ? 100 : 80,
powerPath: l
}, m = t.memory;
return m.homeRoom = i, m.role = n, Me.info("Power creep ".concat(t.name, " assigned as ").concat(n, " to ").concat(i), {
subsystem: "PowerCreep"
}), u;
}, t.prototype.generatePowerPath = function(e) {
var t = this, r = ("powerQueen" === e ? fo : yo).filter(function(e) {
var r, o, n = POWER_INFO[e];
return n && void 0 !== n.level && n.level[0] <= (null !== (o = null === (r = t.gplState) || void 0 === r ? void 0 : r.currentLevel) && void 0 !== o ? o : 0);
});
return r;
}, t.prototype.checkPowerUpgrades = function() {
var e, t;
if (this.gplState) try {
for (var r = a(this.assignments), o = r.next(); !o.done; o = r.next()) {
var n = i(o.value, 2), s = n[0], c = n[1], l = Game.powerCreeps[s];
if (l && !(l.level >= this.gplState.currentLevel)) {
var u = this.selectNextPower(l, c);
if (u) {
var m = l.upgrade(u);
m === OK ? (Me.info("Upgraded ".concat(l.name, " to level ").concat(l.level + 1, " with ").concat(u), {
subsystem: "PowerCreep"
}), c.level = l.level) : m !== ERR_NOT_ENOUGH_RESOURCES && Me.warn("Failed to upgrade ".concat(l.name, ": ").concat(m), {
subsystem: "PowerCreep"
});
}
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
o && !o.done && (t = r.return) && t.call(r);
} finally {
if (e) throw e.error;
}
}
}, t.prototype.selectNextPower = function(e, t) {
var r, o, n, i, s, c = null !== (n = t.powerPath) && void 0 !== n ? n : this.generatePowerPath(t.role);
try {
for (var l = a(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!e.powers[m]) {
var p = POWER_INFO[m];
if (p && void 0 !== p.level && p.level[0] <= (null !== (s = null === (i = this.gplState) || void 0 === i ? void 0 : i.currentLevel) && void 0 !== s ? s : 0)) return m;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
return null;
}, t.prototype.considerNewPowerCreeps = function() {
if (this.gplState && !(this.gplState.currentLevel < this.config.minGPL)) {
var e = Object.keys(Game.powerCreeps).length, t = this.gplState.currentLevel;
if (!(e >= t)) {
var r = Array.from(this.assignments.values()).filter(function(e) {
return "powerQueen" === e.role;
}).length, o = Array.from(this.assignments.values()).filter(function(e) {
return "powerWarrior" === e.role;
}).length, n = r < Math.ceil(.7 * t), a = o < Math.floor(.3 * t);
if (n || a) {
var i = "operator_".concat(Game.time), s = POWER_CLASS.OPERATOR, c = PowerCreep.create(i, s);
c === OK ? Me.info("Created new power creep: ".concat(i, " (").concat(s, ")"), {
subsystem: "PowerCreep"
}) : Me.warn("Failed to create power creep: ".concat(c), {
subsystem: "PowerCreep"
});
}
}
}
}, t.prototype.checkRespawnNeeds = function() {
var e, t;
try {
for (var r = a(this.assignments), o = r.next(); !o.done; o = r.next()) {
var n = i(o.value, 2), s = n[0], c = n[1], l = Game.powerCreeps[s];
if (l) if (void 0 === l.ticksToLive) {
if (!(u = Game.rooms[c.assignedRoom])) continue;
(m = u.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0]) && l.spawn(m) === OK && (Me.info("Power creep ".concat(s, " spawned at ").concat(u.name), {
subsystem: "PowerCreep"
}), c.spawned = !0, c.lastRespawnTick = Game.time);
} else if (l.ticksToLive < 500) {
var u, m;
if (!(u = l.room)) continue;
(m = u.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0]) && l.pos.getRangeTo(m) <= 1 && l.renew(m) === OK && Me.debug("Power creep ".concat(s, " renewed"), {
subsystem: "PowerCreep"
});
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
o && !o.done && (t = r.return) && t.call(r);
} finally {
if (e) throw e.error;
}
}
}, t.prototype.getGPLState = function() {
return this.gplState;
}, t.prototype.getAssignments = function() {
return Array.from(this.assignments.values());
}, t.prototype.getAssignment = function(e) {
return this.assignments.get(e);
}, t.prototype.reassignPowerCreep = function(e, t) {
var r = this.assignments.get(e);
if (!r) return !1;
r.assignedRoom = t;
var o = Game.powerCreeps[e];
return o && (o.memory.homeRoom = t), Me.info("Power creep ".concat(e, " reassigned to ").concat(t), {
subsystem: "PowerCreep"
}), !0;
}, t.prototype.logStatus = function() {
if (this.gplState) {
var e = Array.from(this.assignments.values()).filter(function(e) {
return e.spawned;
}), t = e.filter(function(e) {
return "powerQueen" === e.role;
}).length, r = e.filter(function(e) {
return "powerWarrior" === e.role;
}).length;
Me.info("Power System: GPL ".concat(this.gplState.currentLevel, " ") + "(".concat(this.gplState.currentProgress, "/").concat(this.gplState.progressNeeded, "), ") + "Operators: ".concat(e.length, "/").concat(this.gplState.currentLevel, " ") + "(".concat(t, " eco, ").concat(r, " combat)"), {
subsystem: "PowerCreep"
});
}
}, n([ Er("empire:powerCreep", "Power Creep Management", {
priority: $t.LOW,
interval: 20,
minBucket: 0,
cpuBudget: .03
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(), ho = new go, vo = {
info: function() {},
warn: function() {},
error: function() {},
debug: function() {}
}, Ro = ((ro = {})[RESOURCE_HYDROXIDE] = {
product: RESOURCE_HYDROXIDE,
input1: RESOURCE_HYDROGEN,
input2: RESOURCE_OXYGEN,
priority: 10
}, ro[RESOURCE_ZYNTHIUM_KEANITE] = {
product: RESOURCE_ZYNTHIUM_KEANITE,
input1: RESOURCE_ZYNTHIUM,
input2: RESOURCE_KEANIUM,
priority: 10
}, ro[RESOURCE_UTRIUM_LEMERGITE] = {
product: RESOURCE_UTRIUM_LEMERGITE,
input1: RESOURCE_UTRIUM,
input2: RESOURCE_LEMERGIUM,
priority: 10
}, ro[RESOURCE_GHODIUM] = {
product: RESOURCE_GHODIUM,
input1: RESOURCE_ZYNTHIUM_KEANITE,
input2: RESOURCE_UTRIUM_LEMERGITE,
priority: 15
}, ro[RESOURCE_UTRIUM_HYDRIDE] = {
product: RESOURCE_UTRIUM_HYDRIDE,
input1: RESOURCE_UTRIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, ro[RESOURCE_UTRIUM_OXIDE] = {
product: RESOURCE_UTRIUM_OXIDE,
input1: RESOURCE_UTRIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, ro[RESOURCE_KEANIUM_HYDRIDE] = {
product: RESOURCE_KEANIUM_HYDRIDE,
input1: RESOURCE_KEANIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, ro[RESOURCE_KEANIUM_OXIDE] = {
product: RESOURCE_KEANIUM_OXIDE,
input1: RESOURCE_KEANIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, ro[RESOURCE_LEMERGIUM_HYDRIDE] = {
product: RESOURCE_LEMERGIUM_HYDRIDE,
input1: RESOURCE_LEMERGIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, ro[RESOURCE_LEMERGIUM_OXIDE] = {
product: RESOURCE_LEMERGIUM_OXIDE,
input1: RESOURCE_LEMERGIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, ro[RESOURCE_ZYNTHIUM_HYDRIDE] = {
product: RESOURCE_ZYNTHIUM_HYDRIDE,
input1: RESOURCE_ZYNTHIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, ro[RESOURCE_ZYNTHIUM_OXIDE] = {
product: RESOURCE_ZYNTHIUM_OXIDE,
input1: RESOURCE_ZYNTHIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, ro[RESOURCE_GHODIUM_HYDRIDE] = {
product: RESOURCE_GHODIUM_HYDRIDE,
input1: RESOURCE_GHODIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, ro[RESOURCE_GHODIUM_OXIDE] = {
product: RESOURCE_GHODIUM_OXIDE,
input1: RESOURCE_GHODIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, ro[RESOURCE_UTRIUM_ACID] = {
product: RESOURCE_UTRIUM_ACID,
input1: RESOURCE_UTRIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_UTRIUM_ALKALIDE] = {
product: RESOURCE_UTRIUM_ALKALIDE,
input1: RESOURCE_UTRIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_KEANIUM_ACID] = {
product: RESOURCE_KEANIUM_ACID,
input1: RESOURCE_KEANIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_KEANIUM_ALKALIDE] = {
product: RESOURCE_KEANIUM_ALKALIDE,
input1: RESOURCE_KEANIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_LEMERGIUM_ACID] = {
product: RESOURCE_LEMERGIUM_ACID,
input1: RESOURCE_LEMERGIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_LEMERGIUM_ALKALIDE] = {
product: RESOURCE_LEMERGIUM_ALKALIDE,
input1: RESOURCE_LEMERGIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_ZYNTHIUM_ACID] = {
product: RESOURCE_ZYNTHIUM_ACID,
input1: RESOURCE_ZYNTHIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_ZYNTHIUM_ALKALIDE] = {
product: RESOURCE_ZYNTHIUM_ALKALIDE,
input1: RESOURCE_ZYNTHIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_GHODIUM_ACID] = {
product: RESOURCE_GHODIUM_ACID,
input1: RESOURCE_GHODIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_GHODIUM_ALKALIDE] = {
product: RESOURCE_GHODIUM_ALKALIDE,
input1: RESOURCE_GHODIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, ro[RESOURCE_CATALYZED_UTRIUM_ACID] = {
product: RESOURCE_CATALYZED_UTRIUM_ACID,
input1: RESOURCE_UTRIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, ro[RESOURCE_CATALYZED_UTRIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
input1: RESOURCE_UTRIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, ro[RESOURCE_CATALYZED_KEANIUM_ACID] = {
product: RESOURCE_CATALYZED_KEANIUM_ACID,
input1: RESOURCE_KEANIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, ro[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
input1: RESOURCE_KEANIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, ro[RESOURCE_CATALYZED_LEMERGIUM_ACID] = {
product: RESOURCE_CATALYZED_LEMERGIUM_ACID,
input1: RESOURCE_LEMERGIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, ro[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
input1: RESOURCE_LEMERGIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, ro[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = {
product: RESOURCE_CATALYZED_ZYNTHIUM_ACID,
input1: RESOURCE_ZYNTHIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, ro[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
input1: RESOURCE_ZYNTHIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, ro[RESOURCE_CATALYZED_GHODIUM_ACID] = {
product: RESOURCE_CATALYZED_GHODIUM_ACID,
input1: RESOURCE_GHODIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, ro[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
input1: RESOURCE_GHODIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, ro), Eo = ((oo = {})[RESOURCE_CATALYZED_UTRIUM_ACID] = 3e3, oo[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 3e3, 
oo[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 3e3, oo[RESOURCE_CATALYZED_GHODIUM_ACID] = 3e3, 
oo[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 2e3, oo[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = 2e3, 
oo[RESOURCE_GHODIUM] = 5e3, oo[RESOURCE_HYDROXIDE] = 5e3, oo);

function To(e, t) {
var r, o, n, a = null !== (r = Eo[e]) && void 0 !== r ? r : 1e3, i = null !== (o = t.pheromones.war) && void 0 !== o ? o : 0, s = null !== (n = t.pheromones.siege) && void 0 !== n ? n : 0, c = Math.max(i, s), l = c > 50 ? 1 + c / 100 * .5 : 1;
return !("war" === t.posture || "siege" === t.posture || c > 50) || e !== RESOURCE_CATALYZED_UTRIUM_ACID && e !== RESOURCE_CATALYZED_KEANIUM_ALKALIDE && e !== RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE && e !== RESOURCE_CATALYZED_GHODIUM_ACID ? "war" !== t.posture && "siege" !== t.posture || e !== RESOURCE_CATALYZED_GHODIUM_ALKALIDE && e !== RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE ? a : .5 * a : a * Math.min(1.5 * l, 1.75);
}

function Co(e) {
var t = [];
return t.push(RESOURCE_GHODIUM, RESOURCE_HYDROXIDE), "war" === e.posture || "siege" === e.posture || e.danger >= 2 ? t.push(RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, RESOURCE_CATALYZED_GHODIUM_ACID) : t.push(RESOURCE_CATALYZED_GHODIUM_ALKALIDE, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE), 
t;
}

var So = function() {
function e(e) {
var t;
void 0 === e && (e = {}), this.logger = null !== (t = e.logger) && void 0 !== t ? t : vo;
}
return e.prototype.getReaction = function(e) {
return Ro[e];
}, e.prototype.calculateReactionChain = function(e, t) {
return function(e, t) {
var r = [], o = new Set, n = function(e) {
var a, i, s;
if (o.has(e)) return !0;
o.add(e);
var c = Ro[e];
return c ? !((null !== (i = t[c.input1]) && void 0 !== i ? i : 0) < 100 && !n(c.input1) || (null !== (s = t[c.input2]) && void 0 !== s ? s : 0) < 100 && !n(c.input2) || (r.push(c), 
0)) : (null !== (a = t[e]) && void 0 !== a ? a : 0) > 0;
};
return n(e), r;
}(e, t);
}, e.prototype.hasResourcesForReaction = function(e, t, r) {
return void 0 === r && (r = 100), function(e, t, r) {
var o, n;
void 0 === r && (r = 100);
var a = null !== (o = e.store[t.input1]) && void 0 !== o ? o : 0, i = null !== (n = e.store[t.input2]) && void 0 !== n ? n : 0;
return a >= r && i >= r;
}(e, t, r);
}, e.prototype.planReactions = function(e, t) {
var r, o, n, s, c, l, u;
if (e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}).length < 3) return null;
var m = e.terminal;
if (!m) return null;
var p = Co(t);
try {
for (var d = a(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
if (Ro[y] && (null !== (u = m.store[y]) && void 0 !== u ? u : 0) < To(y, t)) {
var g = {};
try {
for (var h = (n = void 0, a(Object.entries(m.store))), v = h.next(); !v.done; v = h.next()) {
var R = i(v.value, 2), E = R[0], T = R[1];
g[E] = T;
}
} catch (e) {
n = {
error: e
};
} finally {
try {
v && !v.done && (s = h.return) && s.call(h);
} finally {
if (n) throw n.error;
}
}
var C = this.calculateReactionChain(y, g);
try {
for (var S = (c = void 0, a(C)), _ = S.next(); !_.done; _ = S.next()) {
var O = _.value;
if (this.hasResourcesForReaction(m, O, 1e3)) return O;
}
} catch (e) {
c = {
error: e
};
} finally {
try {
_ && !_.done && (l = S.return) && l.call(S);
} finally {
if (c) throw c.error;
}
}
C.length > 0 && this.logger.debug("Cannot produce ".concat(y, ": missing inputs in reaction chain"), {
subsystem: "Chemistry",
room: e.name
});
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
return null;
}, e.prototype.scheduleCompoundProduction = function(e, t) {
var r, o, n, s, c, l, u, m, p, d = [];
try {
for (var f = a(e), y = f.next(); !y.done; y = f.next()) {
var g = y.value, h = g.terminal;
if (h) {
var v = Co(t);
try {
for (var R = (n = void 0, a(v)), E = R.next(); !E.done; E = R.next()) {
var T = E.value, C = Ro[T];
if (C) {
var S = null !== (p = h.store[T]) && void 0 !== p ? p : 0, _ = To(T, t), O = _ - S;
if (O > 0) {
var b = O / _, w = C.priority * (1 + Math.min(b, .5)), U = {};
try {
for (var x = (c = void 0, a(Object.entries(h.store))), A = x.next(); !A.done; A = x.next()) {
var M = i(A.value, 2), k = M[0], N = M[1];
U[k] = N;
}
} catch (e) {
c = {
error: e
};
} finally {
try {
A && !A.done && (l = x.return) && l.call(x);
} finally {
if (c) throw c.error;
}
}
var I = this.calculateReactionChain(T, U);
try {
for (var P = (u = void 0, a(I)), G = P.next(); !G.done; G = P.next()) {
var L = G.value;
if (this.hasResourcesForReaction(h, L, 1e3)) {
d.push({
room: g,
reaction: L,
priority: w
});
break;
}
}
} catch (e) {
u = {
error: e
};
} finally {
try {
G && !G.done && (m = P.return) && m.call(P);
} finally {
if (u) throw u.error;
}
}
}
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
E && !E.done && (s = R.return) && s.call(R);
} finally {
if (n) throw n.error;
}
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
return d.sort(function(e, t) {
return t.priority - e.priority;
}), d;
}, e.prototype.executeReaction = function(e, t) {
var r, o, n = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (!(n.length < 3)) {
var i = n[0], s = n[1];
if (i && s) {
var c = n.slice(2);
(i.mineralType !== t.input1 || i.store[t.input1] < 500) && this.logger.debug("Lab ".concat(i.id, " needs ").concat(t.input1), {
subsystem: "Chemistry"
}), (s.mineralType !== t.input2 || s.store[t.input2] < 500) && this.logger.debug("Lab ".concat(s.id, " needs ").concat(t.input2), {
subsystem: "Chemistry"
});
try {
for (var l = a(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!(m.cooldown > 0)) {
var p = m.store.getFreeCapacity();
null !== p && p < 100 ? this.logger.debug("Lab ".concat(m.id, " is full, needs unloading"), {
subsystem: "Chemistry"
}) : m.runReaction(i, s) === OK && this.logger.debug("Produced ".concat(t.product, " in lab ").concat(m.id), {
subsystem: "Chemistry"
});
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
}
}
}, e;
}(), _o = [ {
role: "soldier",
boosts: [ RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE ],
minDanger: 2
}, {
role: "ranger",
boosts: [ RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE ],
minDanger: 2
}, {
role: "healer",
boosts: [ RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE ],
minDanger: 2
}, {
role: "siegeUnit",
boosts: [ RESOURCE_CATALYZED_GHODIUM_ACID, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE ],
minDanger: 1
} ];

function Oo(e) {
return _o.find(function(t) {
return t.role === e;
});
}

var bo, wo, Uo, xo, Ao = function() {
function e(e) {
var t;
void 0 === e && (e = {}), this.configs = new Map, this.logger = null !== (t = e.logger) && void 0 !== t ? t : vo;
}
return e.prototype.initialize = function(e) {
var t, r = Game.rooms[e];
if (r && (null === (t = r.controller) || void 0 === t ? void 0 : t.my)) {
var o = r.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (0 !== o.length) {
var n = this.configs.get(e);
n || (n = {
roomName: e,
labs: [],
lastUpdate: Game.time,
isValid: !1
}, this.configs.set(e, n)), this.updateLabEntries(n, o), n.isValid || this.autoAssignRoles(n, o);
} else this.configs.delete(e);
}
}, e.prototype.updateLabEntries = function(e, t) {
var r, o;
e.labs = e.labs.filter(function(e) {
return t.some(function(t) {
return t.id === e.labId;
});
});
var n = function(t) {
e.labs.find(function(e) {
return e.labId === t.id;
}) || e.labs.push({
labId: t.id,
role: "unassigned",
pos: {
x: t.pos.x,
y: t.pos.y
},
lastConfigured: Game.time
});
};
try {
for (var i = a(t), s = i.next(); !s.done; s = i.next()) n(s.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
e.lastUpdate = Game.time;
}, e.prototype.autoAssignRoles = function(e, t) {
var r, o, n, i, s, c, l, u, m, p;
if (t.length < 3) e.isValid = !1; else {
var d = new Map;
try {
for (var f = a(t), y = f.next(); !y.done; y = f.next()) {
var g = y.value, h = [];
try {
for (var v = (n = void 0, a(t)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
g.id !== E.id && g.pos.getRangeTo(E) <= 2 && h.push(E.id);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
R && !R.done && (i = v.return) && i.call(v);
} finally {
if (n) throw n.error;
}
}
d.set(g.id, h);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
var T = t.map(function(e) {
var t, r;
return {
lab: e,
reach: null !== (r = null === (t = d.get(e.id)) || void 0 === t ? void 0 : t.length) && void 0 !== r ? r : 0
};
}).sort(function(e, t) {
return t.reach - e.reach;
});
if (T.length < 3 || (null !== (u = null === (l = T[0]) || void 0 === l ? void 0 : l.reach) && void 0 !== u ? u : 0) < 2) return e.isValid = !1, 
void this.logger.warn("Lab layout in ".concat(e.roomName, " is not optimal for reactions"), {
subsystem: "Labs"
});
var C = null === (m = T[0]) || void 0 === m ? void 0 : m.lab, S = null === (p = T[1]) || void 0 === p ? void 0 : p.lab;
if (C && S) {
try {
for (var _ = a(e.labs), O = _.next(); !O.done; O = _.next()) {
var b = O.value;
if (b.labId === C.id) b.role = "input1", b.lastConfigured = Game.time; else if (b.labId === S.id) b.role = "input2", 
b.lastConfigured = Game.time; else {
var w = C.pos.getRangeTo(Game.getObjectById(b.labId)) <= 2, U = S.pos.getRangeTo(Game.getObjectById(b.labId)) <= 2;
b.role = w && U ? "output" : "boost", b.lastConfigured = Game.time;
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
O && !O.done && (c = _.return) && c.call(_);
} finally {
if (s) throw s.error;
}
}
e.isValid = !0, e.lastUpdate = Game.time, this.logger.info("Auto-assigned lab roles in ".concat(e.roomName, ": ") + "".concat(e.labs.filter(function(e) {
return "input1" === e.role;
}).length, " input1, ") + "".concat(e.labs.filter(function(e) {
return "input2" === e.role;
}).length, " input2, ") + "".concat(e.labs.filter(function(e) {
return "output" === e.role;
}).length, " output, ") + "".concat(e.labs.filter(function(e) {
return "boost" === e.role;
}).length, " boost"), {
subsystem: "Labs"
});
} else e.isValid = !1;
}
}, e.prototype.getConfig = function(e) {
return this.configs.get(e);
}, e.prototype.getLabsByRole = function(e, t) {
var r = this.configs.get(e);
return r ? r.labs.filter(function(e) {
return e.role === t;
}).map(function(e) {
return Game.getObjectById(e.labId);
}).filter(function(e) {
return null !== e;
}) : [];
}, e.prototype.getInputLabs = function(e) {
var t, r, o = this.configs.get(e);
if (!o) return {};
var n = o.labs.find(function(e) {
return "input1" === e.role;
}), a = o.labs.find(function(e) {
return "input2" === e.role;
});
return {
input1: n && null !== (t = Game.getObjectById(n.labId)) && void 0 !== t ? t : void 0,
input2: a && null !== (r = Game.getObjectById(a.labId)) && void 0 !== r ? r : void 0
};
}, e.prototype.getOutputLabs = function(e) {
return this.getLabsByRole(e, "output");
}, e.prototype.getBoostLabs = function(e) {
return this.getLabsByRole(e, "boost");
}, e.prototype.setActiveReaction = function(e, t, r, o) {
var n, i, s = this.configs.get(e);
if (!s || !s.isValid) return !1;
s.activeReaction = {
input1: t,
input2: r,
output: o
};
var c = s.labs.find(function(e) {
return "input1" === e.role;
}), l = s.labs.find(function(e) {
return "input2" === e.role;
});
c && (c.resourceType = t), l && (l.resourceType = r);
try {
for (var u = a(s.labs.filter(function(e) {
return "output" === e.role;
})), m = u.next(); !m.done; m = u.next()) m.value.resourceType = o;
} catch (e) {
n = {
error: e
};
} finally {
try {
m && !m.done && (i = u.return) && i.call(u);
} finally {
if (n) throw n.error;
}
}
return s.lastUpdate = Game.time, this.logger.info("Set active reaction in ".concat(e, ": ").concat(t, " + ").concat(r, " -> ").concat(o), {
subsystem: "Labs"
}), !0;
}, e.prototype.clearActiveReaction = function(e) {
var t, r, o = this.configs.get(e);
if (o) {
delete o.activeReaction;
try {
for (var n = a(o.labs), i = n.next(); !i.done; i = n.next()) delete i.value.resourceType;
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
o.lastUpdate = Game.time;
}
}, e.prototype.runReactions = function(e) {
var t, r, o = this.configs.get(e);
if (!o || !o.isValid || !o.activeReaction) return 0;
var n = this.getInputLabs(e), i = n.input1, s = n.input2;
if (!i || !s) return 0;
var c = this.getOutputLabs(e), l = 0;
try {
for (var u = a(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
0 === p.cooldown && p.runReaction(i, s) === OK && l++;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
return l;
}, e.prototype.hasValidConfig = function(e) {
var t, r = this.configs.get(e);
return null !== (t = null == r ? void 0 : r.isValid) && void 0 !== t && t;
}, e.prototype.exportConfig = function(e) {
return this.configs.get(e);
}, e.prototype.importConfig = function(e) {
this.configs.set(e.roomName, e);
}, e;
}(), Mo = function() {
function e() {}
return e.prototype.shouldBoost = function(e, t) {
var r, o = e.memory;
if (o.boosted) return !1;
var n = Oo(o.role);
if (!n) return !1;
var a = !0 === (null !== (r = Memory.boostDefensePriority) && void 0 !== r ? r : {})[e.room.name] ? Math.max(1, n.minDanger - 1) : n.minDanger;
return !(t.danger < a || t.missingStructures.labs);
}, e.prototype.boostCreep = function(e, t) {
var r, o, n = e.memory, i = Oo(n.role);
if (!i) return !1;
var s = t.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}), c = [], l = function(t) {
if (e.body.some(function(e) {
return e.boost === t;
})) return "continue";
c.push(t);
var r = s.find(function(e) {
return e.mineralType === t && e.store[t] >= 30;
});
if (!r) return Me.debug("Lab not ready with ".concat(t, " for ").concat(e.name), {
subsystem: "Boost"
}), {
value: !1
};
if (!e.pos.isNearTo(r)) return e.moveTo(r, {
visualizePathStyle: {
stroke: "#ffaa00"
}
}), {
value: !1
};
var o = r.boostCreep(e);
if (o === OK) Me.info("Boosted ".concat(e.name, " with ").concat(t), {
subsystem: "Boost"
}); else if (o !== ERR_NOT_FOUND) return Me.error("Failed to boost ".concat(e.name, ": ").concat(function(e) {
switch (e) {
case ERR_NOT_OWNER:
return "not owner of lab";

case ERR_NOT_FOUND:
return "no suitable body parts";

case ERR_NOT_ENOUGH_RESOURCES:
return "not enough compound";

case ERR_INVALID_TARGET:
return "invalid creep target";

case ERR_NOT_IN_RANGE:
return "creep not in range";

case ERR_RCL_NOT_ENOUGH:
return "RCL too low";

default:
return "error code ".concat(e);
}
}(o)), {
subsystem: "Boost"
}), {
value: !1
};
};
try {
for (var u = a(i.boosts), m = u.next(); !m.done; m = u.next()) {
var p = l(m.value);
if ("object" == typeof p) return p.value;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
return 0 === c.length && (n.boosted = !0, Me.info("".concat(e.name, " fully boosted (all ").concat(i.boosts.length, " boosts applied)"), {
subsystem: "Boost"
}), !0);
}, e.prototype.areBoostLabsReady = function(e, t) {
var r, o, n = Oo(t);
if (!n) return !0;
var i = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}), s = function(e) {
if (!i.find(function(t) {
return t.mineralType === e && t.store[e] >= 30;
})) return {
value: !1
};
};
try {
for (var c = a(n.boosts), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value);
if ("object" == typeof u) return u.value;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
return !0;
}, e.prototype.getMissingBoosts = function(e, t) {
var r, o, n = Oo(t);
if (!n) return [];
var i = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}), s = [], c = function(e) {
i.find(function(t) {
return t.mineralType === e && t.store[e] >= 30;
}) || s.push(e);
};
try {
for (var l = a(n.boosts), u = l.next(); !u.done; u = l.next()) c(u.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
return s;
}, e.prototype.prepareLabs = function(e, t) {
var r, o, n, i, s, c;
if (!(t.danger < 2)) {
var l = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (!(l.length < 3)) {
var u = l.slice(2), m = new Set, p = [ Oo("soldier"), Oo("ranger"), Oo("healer"), Oo("siegeUnit") ].filter(function(e) {
return void 0 !== e && t.danger >= e.minDanger;
});
try {
for (var d = a(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
try {
for (var g = (n = void 0, a(y.boosts)), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
m.add(v);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (n) throw n.error;
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
var R = 0;
try {
for (var E = a(m), T = E.next(); !(T.done || (v = T.value, R >= u.length)); T = E.next()) {
var C = u[R];
(C.mineralType !== v || C.store[v] < 1e3) && Me.debug("Lab ".concat(C.id, " needs ").concat(v, " for boosting"), {
subsystem: "Boost"
}), R++;
}
} catch (e) {
s = {
error: e
};
} finally {
try {
T && !T.done && (c = E.return) && c.call(E);
} finally {
if (s) throw s.error;
}
}
}
}
}, e.prototype.calculateBoostCost = function(e, t) {
return function(e, t) {
var r = Oo(e);
return r ? {
mineral: 30 * t * r.boosts.length,
energy: 20 * t * r.boosts.length
} : {
mineral: 0,
energy: 0
};
}(e, t);
}, e.prototype.analyzeBoostROI = function(e, t, r, o) {
if (!Oo(e)) return {
worthwhile: !1,
roi: 0,
reasoning: "No boost config for role"
};
var n = this.calculateBoostCost(e, t), a = n.mineral + .1 * n.energy, i = 0;
switch (e) {
case "soldier":
i = 30 * Math.floor(t / 3) * 4 * r;
break;

case "ranger":
i = 10 * Math.floor(t / 3) * 4 * r;
break;

case "healer":
i = 12 * Math.floor(t / 3) * 4 * r;
break;

case "siegeUnit":
i = 50 * Math.floor(t / 3) * 4 * r;
break;

default:
i = 10 * t * r;
}
var s = (i *= 1 + .5 * o) / a, c = s > 1.5, l = c ? "High ROI: ".concat(s.toFixed(2), "x (gain: ").concat(i.toFixed(0), ", cost: ").concat(a.toFixed(0), ")") : "Low ROI: ".concat(s.toFixed(2), "x (gain: ").concat(i.toFixed(0), ", cost: ").concat(a.toFixed(0), ")");
return {
worthwhile: c,
roi: s,
reasoning: l
};
}, e;
}(), ko = new Mo, No = {
info: function(e, t) {
return Me.info(e, t);
},
warn: function(e, t) {
return Me.warn(e, t);
},
error: function(e, t) {
return Me.error(e, t);
},
debug: function(e, t) {
return Me.debug(e, t);
}
}, Io = function() {
function t() {
this.manager = new Ao({
logger: No
});
}
return t.prototype.initialize = function(e) {
this.manager.initialize(e);
}, t.prototype.getConfig = function(e) {
return this.manager.exportConfig(e);
}, t.prototype.getLabsByRole = function(e, t) {
var r = this.manager.exportConfig(e);
return r ? r.labs.filter(function(e) {
return e.role === t;
}).map(function(e) {
return Game.getObjectById(e.labId);
}).filter(function(e) {
return null !== e;
}) : [];
}, t.prototype.getInputLabs = function(e) {
var t, r, o = this.manager.exportConfig(e);
if (!o) return {};
var n = o.labs.find(function(e) {
return "input1" === e.role;
}), a = o.labs.find(function(e) {
return "input2" === e.role;
});
return {
input1: n && null !== (t = Game.getObjectById(n.labId)) && void 0 !== t ? t : void 0,
input2: a && null !== (r = Game.getObjectById(a.labId)) && void 0 !== r ? r : void 0
};
}, t.prototype.getOutputLabs = function(e) {
return this.getLabsByRole(e, "output");
}, t.prototype.getBoostLabs = function(e) {
return this.getLabsByRole(e, "boost");
}, t.prototype.setActiveReaction = function(e, t, r, o) {
return this.manager.setActiveReaction(e, t, r, o);
}, t.prototype.clearActiveReaction = function(e) {
this.manager.clearActiveReaction(e);
}, t.prototype.setLabRole = function(e, t, r) {
var o = this.manager.exportConfig(e);
if (!o) return !1;
var n = o.labs.find(function(e) {
return e.labId === t;
});
return !!n && (n.role = r, n.lastConfigured = Game.time, o.lastUpdate = Game.time, 
this.manager.importConfig(o), Me.info("Set ".concat(t, " to role ").concat(r, " in ").concat(e), {
subsystem: "Labs"
}), !0);
}, t.prototype.runReactions = function(e) {
return this.manager.runReactions(e);
}, t.prototype.saveToMemory = function(t) {
var r = this.manager.exportConfig(t);
if (r) {
var o = Memory.rooms[t];
if (o) {
o.labConfig = r;
var n = "memory:room:".concat(t, ":labConfig");
e.heapCache.set(n, r, e.INFINITE_TTL);
}
}
}, t.prototype.loadFromMemory = function(t) {
var r = "memory:room:".concat(t, ":labConfig"), o = e.heapCache.get(r);
if (!o) {
var n = Memory.rooms[t], a = null == n ? void 0 : n.labConfig;
a && (e.heapCache.set(r, a, e.INFINITE_TTL), o = a);
}
o && this.manager.importConfig(o);
}, t.prototype.getConfiguredRooms = function() {
return Object.keys(Memory.rooms).filter(function(e) {
var t = Memory.rooms[e];
return void 0 !== (null == t ? void 0 : t.labConfig);
});
}, t.prototype.hasValidConfig = function(e) {
return this.manager.hasValidConfig(e);
}, t;
}(), Po = new Io, Go = function() {
function e() {}
return e.prototype.getLabResourceNeeds = function(e) {
var t, r, o, n, i;
if (!Game.rooms[e]) return [];
var s = Po.getConfig(e);
if (!s || !s.isValid) return [];
var c, l = [], u = Po.getInputLabs(e), m = u.input1, p = u.input2;
m && s.activeReaction && (c = null !== (o = m.store[s.activeReaction.input1]) && void 0 !== o ? o : 0) < 1e3 && l.push({
labId: m.id,
resourceType: s.activeReaction.input1,
amount: 2e3 - c,
priority: 10
}), p && s.activeReaction && (c = null !== (n = p.store[s.activeReaction.input2]) && void 0 !== n ? n : 0) < 1e3 && l.push({
labId: p.id,
resourceType: s.activeReaction.input2,
amount: 2e3 - c,
priority: 10
});
var d = Po.getBoostLabs(e), f = function(e) {
var t = s.labs.find(function(t) {
return t.labId === e.id;
});
if (null == t ? void 0 : t.resourceType) {
var r = null !== (i = e.store[t.resourceType]) && void 0 !== i ? i : 0;
r < 1e3 && l.push({
labId: e.id,
resourceType: t.resourceType,
amount: 1500 - r,
priority: 8
});
}
};
try {
for (var y = a(d), g = y.next(); !g.done; g = y.next()) f(g.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
g && !g.done && (r = y.return) && r.call(y);
} finally {
if (t) throw t.error;
}
}
return l;
}, e.prototype.getLabOverflow = function(e) {
var t, r, o, n, i, s;
if (!Game.rooms[e]) return [];
var c = Po.getConfig(e);
if (!c) return [];
var l = [], u = Po.getOutputLabs(e);
try {
for (var m = a(u), p = m.next(); !p.done; p = m.next()) {
var d = (T = p.value).mineralType;
if (d) {
var f = null !== (i = T.store[d]) && void 0 !== i ? i : 0, y = c.activeReaction && d !== c.activeReaction.output;
(f > 2e3 || y && f > 0) && l.push({
labId: T.id,
resourceType: d,
amount: f,
priority: y ? 10 : 5
});
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
p && !p.done && (r = m.return) && r.call(m);
} finally {
if (t) throw t.error;
}
}
var g = Po.getInputLabs(e), h = [ g.input1, g.input2 ].filter(function(e) {
return void 0 !== e;
}), v = function(e) {
var t = e.mineralType;
if (!t) return "continue";
var r = c.labs.find(function(t) {
return t.labId === e.id;
}), o = null == r ? void 0 : r.resourceType;
if (o && t !== o) {
var n = null !== (s = e.store[t]) && void 0 !== s ? s : 0;
n > 0 && l.push({
labId: e.id,
resourceType: t,
amount: n,
priority: 9
});
}
};
try {
for (var R = a(h), E = R.next(); !E.done; E = R.next()) {
var T;
v(T = E.value);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
E && !E.done && (n = R.return) && n.call(R);
} finally {
if (o) throw o.error;
}
}
return l;
}, e.prototype.areLabsReady = function(e, t) {
var r, o, n, i, s = Po.getConfig(e);
if (!s || !s.isValid) return !1;
var c = Po.getInputLabs(e), l = c.input1, u = c.input2;
if (!l || !u) return !1;
if ((null !== (n = l.store[t.input1]) && void 0 !== n ? n : 0) < 500) return !1;
if ((null !== (i = u.store[t.input2]) && void 0 !== i ? i : 0) < 500) return !1;
var m = Po.getOutputLabs(e);
if (0 === m.length) return !1;
try {
for (var p = a(m), d = p.next(); !d.done; d = p.next()) {
var f = d.value.store.getFreeCapacity();
if (null === f || f < 100) return !1;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
return !0;
}, e.prototype.clearReactions = function(e) {
Po.clearActiveReaction(e), Me.info("Cleared active reactions in ".concat(e), {
subsystem: "Labs"
});
}, e.prototype.setActiveReaction = function(e, t, r, o) {
var n = Po.setActiveReaction(e, t, r, o);
return n && Me.info("Set active reaction: ".concat(t, " + ").concat(r, " -> ").concat(o), {
subsystem: "Labs",
room: e
}), n;
}, e.prototype.runReactions = function(e) {
return Po.runReactions(e);
}, e.prototype.hasAvailableBoostLabs = function(e) {
return Po.getBoostLabs(e).length > 0;
}, e.prototype.prepareBoostLab = function(e, t) {
var r, o, n, i, s, c = Po.getConfig(e);
if (!c) return null;
var l = Po.getBoostLabs(e);
try {
for (var u = a(l), m = u.next(); !m.done; m = u.next()) if ((y = m.value).mineralType === t && (null !== (s = y.store[t]) && void 0 !== s ? s : 0) >= 30) return y.id;
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
var p = function(e) {
if (!e.mineralType) {
var r = c.labs.find(function(t) {
return t.labId === e.id;
});
return r && (r.resourceType = t, c.lastUpdate = Game.time), {
value: e.id
};
}
};
try {
for (var d = a(l), f = d.next(); !f.done; f = d.next()) {
var y, g = p(y = f.value);
if ("object" == typeof g) return g.value;
}
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (n) throw n.error;
}
}
return null;
}, e.prototype.scheduleBoostedCreepUnboost = function(e) {
var t, r, o = Game.rooms[e];
if (!o) return 0;
var n = o.find(FIND_MY_CREEPS, {
filter: function(e) {
return e.body.some(function(e) {
return e.boost;
}) && e.ticksToLive && e.ticksToLive <= 50;
}
}), i = 0;
try {
for (var s = a(n), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
this.handleUnboost(l, o) && i++;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
return i;
}, e.prototype.handleUnboost = function(e, t) {
var r, o;
if (!e.body.some(function(e) {
return e.boost;
})) return !1;
if (!e.ticksToLive || e.ticksToLive > 50) return !1;
var n = t.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (0 === n.length) return !1;
try {
for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = c.store.getFreeCapacity();
if (null !== l && l >= 50) {
if (!e.pos.isNearTo(c)) return e.moveTo(c), !1;
if (c.unboostCreep(e) === OK) return Me.info("Unboosted ".concat(e.name, ", recovered resources"), {
subsystem: "Labs",
room: t.name
}), !0;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
return !1;
}, e.prototype.getLabTaskStatus = function(e) {
var t = Po.getConfig(e);
return t && t.isValid ? t.activeReaction ? "reacting" : this.getLabResourceNeeds(e).length > 0 ? "loading" : this.getLabOverflow(e).length > 0 ? "unloading" : "idle" : "idle";
}, e.prototype.initialize = function(e) {
Po.initialize(e), Po.loadFromMemory(e);
}, e.prototype.save = function(e) {
Po.saveToMemory(e);
}, e;
}(), Lo = new Go, Do = function() {
function e() {}
return e.prototype.status = function(e) {
var t, r, o, n, i, s, c, l, u = Po.getConfig(e);
if (!u) return "No lab configuration for ".concat(e);
var m = "=== Lab Status: ".concat(e, " ===\n");
m += "Valid: ".concat(u.isValid, "\n"), m += "Labs: ".concat(u.labs.length, "\n"), 
m += "Last Update: ".concat(Game.time - u.lastUpdate, " ticks ago\n\n"), u.activeReaction && (m += "Active Reaction:\n", 
m += "  ".concat(u.activeReaction.input1, " + ").concat(u.activeReaction.input2, " → ").concat(u.activeReaction.output, "\n\n")), 
m += "Lab Assignments:\n";
try {
for (var p = a(u.labs), d = p.next(); !d.done; d = p.next()) {
var f = d.value, y = Game.getObjectById(f.labId), g = null !== (c = null == y ? void 0 : y.mineralType) && void 0 !== c ? c : "empty", h = null !== (l = null == y ? void 0 : y.store[g]) && void 0 !== l ? l : 0;
m += "  ".concat(f.role, ": ").concat(g, " (").concat(h, ") @ (").concat(f.pos.x, ",").concat(f.pos.y, ")\n");
}
} catch (e) {
t = {
error: e
};
} finally {
try {
d && !d.done && (r = p.return) && r.call(p);
} finally {
if (t) throw t.error;
}
}
var v = Lo.getLabResourceNeeds(e);
if (v.length > 0) {
m += "\nResource Needs:\n";
try {
for (var R = a(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
m += "  ".concat(T.resourceType, ": ").concat(T.amount, " (priority ").concat(T.priority, ")\n");
}
} catch (e) {
o = {
error: e
};
} finally {
try {
E && !E.done && (n = R.return) && n.call(R);
} finally {
if (o) throw o.error;
}
}
}
var C = Lo.getLabOverflow(e);
if (C.length > 0) {
m += "\nOverflow (needs emptying):\n";
try {
for (var S = a(C), _ = S.next(); !_.done; _ = S.next()) {
var O = _.value;
m += "  ".concat(O.resourceType, ": ").concat(O.amount, " (priority ").concat(O.priority, ")\n");
}
} catch (e) {
i = {
error: e
};
} finally {
try {
_ && !_.done && (s = S.return) && s.call(S);
} finally {
if (i) throw i.error;
}
}
}
return m;
}, e.prototype.setReaction = function(e, t, r, o) {
return Lo.setActiveReaction(e, t, r, o) ? "Set active reaction: ".concat(t, " + ").concat(r, " → ").concat(o) : "Failed to set reaction (check lab configuration)";
}, e.prototype.clear = function(e) {
return Lo.clearReactions(e), "Cleared active reactions in ".concat(e);
}, e.prototype.boost = function(e, t) {
var r, o, n = Game.rooms[e];
if (!n) return "Room ".concat(e, " not visible");
var i = ko.areBoostLabsReady(n, t), s = ko.getMissingBoosts(n, t), c = "=== Boost Status: ".concat(e, " / ").concat(t, " ===\n");
if (c += "Ready: ".concat(i, "\n"), s.length > 0) {
c += "\nMissing Boosts:\n";
try {
for (var l = a(s), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
c += "  - ".concat(m, "\n");
}
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
} else c += "\nAll boosts ready!";
return c;
}, n([ Yt({
name: "labs.status",
description: "Get lab status for a room",
usage: "labs.status(roomName)",
examples: [ "labs.status('E1S1')" ],
category: "Labs"
}) ], e.prototype, "status", null), n([ Yt({
name: "labs.setReaction",
description: "Set active reaction for a room",
usage: "labs.setReaction(roomName, input1, input2, output)",
examples: [ "labs.setReaction('E1S1', RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_HYDROXIDE)" ],
category: "Labs"
}) ], e.prototype, "setReaction", null), n([ Yt({
name: "labs.clear",
description: "Clear active reaction for a room",
usage: "labs.clear(roomName)",
examples: [ "labs.clear('E1S1')" ],
category: "Labs"
}) ], e.prototype, "clear", null), n([ Yt({
name: "labs.boost",
description: "Check boost lab readiness for a role",
usage: "labs.boost(roomName, role)",
examples: [ "labs.boost('E1S1', 'soldier')" ],
category: "Labs"
}) ], e.prototype, "boost", null), e;
}(), Fo = function() {
function e() {}
return e.prototype.data = function(e) {
var t = Game.market.getHistory(e);
if (!t || 0 === t.length) return "No market history for ".concat(e);
var r = t[t.length - 1], o = "=== Market Data: ".concat(e, " ===\n");
if (o += "Current Price: ".concat(r.avgPrice.toFixed(3), " credits\n"), o += "Volume: ".concat(r.volume, "\n"), 
o += "Transactions: ".concat(r.transactions, "\n"), o += "Date: ".concat(r.date, "\n"), 
t.length >= 5) {
var n = t[t.length - 5], a = (r.avgPrice - n.avgPrice) / n.avgPrice * 100;
o += "\nTrend (5 days): ".concat(a > 5 ? "📈 Rising" : a < -5 ? "📉 Falling" : "➡️ Stable", " (").concat(a >= 0 ? "+" : "").concat(a.toFixed(1), "%)\n");
}
return o;
}, e.prototype.orders = function() {
var e, t, r, o, n, i = Object.values(Game.market.orders);
if (0 === i.length) return "No active market orders";
var s = "=== Active Market Orders (".concat(i.length, ") ===\n");
s += "Type | Resource | Price | Remaining | Room\n", s += "-".repeat(70) + "\n";
try {
for (var c = a(i), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.type === ORDER_BUY ? "BUY " : "SELL", p = u.price.toFixed(3), d = null !== (o = null === (r = u.remainingAmount) || void 0 === r ? void 0 : r.toString()) && void 0 !== o ? o : "?";
s += "".concat(m, " | ").concat(u.resourceType, " | ").concat(p, " | ").concat(d, " | ").concat(null !== (n = u.roomName) && void 0 !== n ? n : "N/A", "\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
return s;
}, e.prototype.profit = function() {
var e = "=== Market Profit ===\n";
return (e += "Credits: ".concat(Game.market.credits.toLocaleString(), "\n")) + "\nNote: Detailed profit tracking requires memory access\n";
}, n([ Yt({
name: "market.data",
description: "Get market data for a resource",
usage: "market.data(resource)",
examples: [ "market.data(RESOURCE_ENERGY)", "market.data(RESOURCE_GHODIUM)" ],
category: "Market"
}) ], e.prototype, "data", null), n([ Yt({
name: "market.orders",
description: "List your active market orders",
usage: "market.orders()",
examples: [ "market.orders()" ],
category: "Market"
}) ], e.prototype, "orders", null), n([ Yt({
name: "market.profit",
description: "Show market trading profit statistics",
usage: "market.profit()",
examples: [ "market.profit()" ],
category: "Market"
}) ], e.prototype, "profit", null), e;
}(), Bo = function() {
function e() {}
return e.prototype.gpl = function() {
var e = ho.getGPLState();
if (!e) return "GPL tracking not available (no power unlocked)";
var t = "=== GPL Status ===\n";
t += "Level: ".concat(e.currentLevel, "\n"), t += "Progress: ".concat(e.currentProgress, " / ").concat(e.progressNeeded, "\n"), 
t += "Completion: ".concat((e.currentProgress / e.progressNeeded * 100).toFixed(1), "%\n"), 
t += "Target Milestone: ".concat(e.targetMilestone, "\n");
var r = e.ticksToNextLevel === 1 / 0 ? "N/A (no progress yet)" : "".concat(e.ticksToNextLevel.toLocaleString(), " ticks");
return (t += "Estimated Time: ".concat(r, "\n")) + "\nTotal Power Processed: ".concat(e.totalPowerProcessed.toLocaleString(), "\n");
}, e.prototype.creeps = function() {
var e, t, r = ho.getAssignments();
if (0 === r.length) return "No power creeps created yet";
var o = "=== Power Creeps (".concat(r.length, ") ===\n");
o += "Name | Role | Room | Level | Spawned\n", o += "-".repeat(70) + "\n";
try {
for (var n = a(r), i = n.next(); !i.done; i = n.next()) {
var s = i.value, c = s.spawned ? "✓" : "✗";
o += "".concat(s.name, " | ").concat(s.role, " | ").concat(s.assignedRoom, " | ").concat(s.level, " | ").concat(c, "\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.operations = function() {
var e, t, r = mo.getActiveOperations();
if (0 === r.length) return "No active power bank operations";
var o = "=== Power Bank Operations (".concat(r.length, ") ===\n");
try {
for (var n = a(r), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
o += "\nRoom: ".concat(s.roomName, "\n"), o += "Power: ".concat(s.power, "\n"), 
o += "State: ".concat(s.state, "\n"), o += "Home: ".concat(s.homeRoom, "\n"), o += "Attackers: ".concat(s.assignedCreeps.attackers.length, "\n"), 
o += "Healers: ".concat(s.assignedCreeps.healers.length, "\n"), o += "Carriers: ".concat(s.assignedCreeps.carriers.length, "\n"), 
o += "Damage: ".concat(Math.round(s.damageDealt / 1e3), "k / 2000k\n"), o += "Collected: ".concat(s.powerCollected, "\n"), 
o += "Decay: ".concat(s.decayTick - Game.time, " ticks\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.assign = function(e, t) {
return ho.reassignPowerCreep(e, t) ? "Reassigned ".concat(e, " to ").concat(t) : "Failed to reassign ".concat(e, " (not found)");
}, e.prototype.create = function(e, t) {
var r = "string" == typeof t && "operator" === t.toLowerCase() ? POWER_CLASS.OPERATOR : t;
if (Game.powerCreeps[e]) return 'Power creep "'.concat(e, '" already exists');
if (!Game.gpl || Game.gpl.level < 1) return "GPL level too low (need GPL 1+)";
var o = Object.keys(Game.powerCreeps).length;
if (o >= Game.gpl.level) return "Cannot create power creep: ".concat(o, "/").concat(Game.gpl.level, " already created");
var n = PowerCreep.create(e, r);
return n === OK ? 'Created power creep "'.concat(e, '" (').concat(r, ")") : "Failed to create power creep: ".concat(n);
}, e.prototype.spawn = function(e, t) {
var r, o = Game.powerCreeps[e];
if (!o) return 'Power creep "'.concat(e, '" not found');
if (void 0 !== o.ticksToLive) return 'Power creep "'.concat(e, '" is already spawned (TTL: ').concat(o.ticksToLive, ")");
var n = o.memory, a = null !== (r = null != t ? t : n.homeRoom) && void 0 !== r ? r : Object.keys(Game.rooms)[0], i = Game.rooms[a];
if (!i) return 'Room "'.concat(a, '" not visible');
var s = i.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0];
if (!s) return "No power spawn found in ".concat(a);
var c = o.spawn(s);
return c === OK ? 'Spawned power creep "'.concat(e, '" at ').concat(a) : "Failed to spawn power creep: ".concat(c);
}, e.prototype.upgrade = function(e, t) {
var r = Game.powerCreeps[e];
if (!r) return 'Power creep "'.concat(e, '" not found');
if (r.powers[t]) return 'Power creep "'.concat(e, '" already has ').concat(t);
if (!POWER_INFO[t]) return "Invalid power: ".concat(t);
if (r.level >= Game.gpl.level) return "Power creep is already at max level (".concat(r.level, "/").concat(Game.gpl.level, ")");
var o = r.upgrade(t);
return o === OK ? "Upgraded ".concat(e, " to level ").concat(r.level, " with ").concat(t) : "Failed to upgrade: ".concat(o);
}, n([ Yt({
name: "power.gpl",
description: "Show GPL (Global Power Level) status",
usage: "power.gpl()",
examples: [ "power.gpl()" ],
category: "Power"
}) ], e.prototype, "gpl", null), n([ Yt({
name: "power.creeps",
description: "List power creeps and their assignments",
usage: "power.creeps()",
examples: [ "power.creeps()" ],
category: "Power"
}) ], e.prototype, "creeps", null), n([ Yt({
name: "power.operations",
description: "List active power bank operations",
usage: "power.operations()",
examples: [ "power.operations()" ],
category: "Power"
}) ], e.prototype, "operations", null), n([ Yt({
name: "power.assign",
description: "Reassign a power creep to a different room",
usage: "power.assign(powerCreepName, roomName)",
examples: [ "power.assign('operator_eco', 'E2S2')" ],
category: "Power"
}) ], e.prototype, "assign", null), n([ Yt({
name: "power.create",
description: "Manually create a new power creep (automatic creation is also enabled)",
usage: "power.create(name, className)",
examples: [ "power.create('operator_eco', POWER_CLASS.OPERATOR)", "power.create('my_operator', 'operator')" ],
category: "Power"
}) ], e.prototype, "create", null), n([ Yt({
name: "power.spawn",
description: "Manually spawn a power creep at a power spawn",
usage: "power.spawn(powerCreepName, roomName?)",
examples: [ "power.spawn('operator_eco')", "power.spawn('operator_eco', 'E2S2')" ],
category: "Power"
}) ], e.prototype, "spawn", null), n([ Yt({
name: "power.upgrade",
description: "Manually upgrade a power creep with a specific power",
usage: "power.upgrade(powerCreepName, power)",
examples: [ "power.upgrade('operator_eco', PWR_OPERATE_SPAWN)", "power.upgrade('operator_eco', PWR_OPERATE_TOWER)" ],
category: "Power"
}) ], e.prototype, "upgrade", null), e;
}(), Ho = new Do, Wo = new Fo, Yo = new Bo, Ko = function() {
function e() {}
return e.prototype.showConfig = function() {
var e = ae(), t = bt();
return "=== SwarmBot Config ===\nDebug: ".concat(String(e.debug), "\nProfiling: ").concat(String(e.profiling), "\nVisualizations: ").concat(String(e.visualizations), "\nLogger Level: ").concat(ft[t.level], "\nCPU Logging: ").concat(String(t.cpuLogging));
}, n([ Yt({
name: "showConfig",
description: "Show current bot configuration",
usage: "showConfig()",
examples: [ "showConfig()" ],
category: "Configuration"
}) ], e.prototype, "showConfig", null), e;
}(), Vo = (bo = "stats", wo = function() {
for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
return e.map(function(e) {
if ("string" == typeof e || "number" == typeof e || "boolean" == typeof e || null == e) return e;
try {
return JSON.stringify(e);
} catch (e) {
return "[Unserializable Object]";
}
});
}, {
debug: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, s([ "[".concat(bo, "]"), e ], i(wo.apply(void 0, s([], i(t), !1))), !1));
},
info: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, s([ "[".concat(bo, "]"), e ], i(wo.apply(void 0, s([], i(t), !1))), !1));
},
warn: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, s([ "[".concat(bo, "] WARN:"), e ], i(wo.apply(void 0, s([], i(t), !1))), !1));
},
error: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, s([ "[".concat(bo, "] ERROR:"), e ], i(wo.apply(void 0, s([], i(t), !1))), !1));
}
}), qo = function(e) {
return {};
};

function jo(e, t) {
var r = t.roomScaling, o = r.minRooms, n = r.scaleFactor, a = r.maxMultiplier, i = Math.max(e, o), s = 1 + Math.log(i / o) / Math.log(n);
return Math.max(1, Math.min(a, s));
}

function zo(e, t) {
var r = t.bucketMultipliers, o = r.highThreshold, n = r.lowThreshold, a = r.criticalThreshold, i = r.highMultiplier, s = r.lowMultiplier, c = r.criticalMultiplier;
return e >= o ? i : e < a ? c : e < n ? s : 1;
}

!function(e) {
e.ACTIVE = "active", e.DECAY = "decay", e.INACTIVE = "inactive";
}(Uo || (Uo = {})), function(e) {
e.PHEROMONES = "pheromones", e.PATHS = "paths", e.TARGETS = "targets", e.DEBUG = "debug";
}(xo || (xo = {}));

var Xo, Qo, Zo, Jo = new (function() {
function e() {
this.metrics = {
totalCalls: 0,
cacheHits: 0,
cacheMisses: 0,
cacheHitRate: 0,
cpuUsed: 0,
avgCpuPerCall: 0,
cpuSaved: 0,
callsByType: {
moveTo: 0,
pathFinderSearch: 0,
findPath: 0,
moveByPath: 0
}
};
}
return e.prototype.recordCall = function(e, t, r) {
if (this.metrics.totalCalls++, this.metrics.callsByType[e]++, this.metrics.cpuUsed += r, 
t) {
this.metrics.cacheHits++;
var o = Math.max(.5 - r, 0);
this.metrics.cpuSaved += o;
} else this.metrics.cacheMisses++;
}, e.prototype.getMetrics = function() {
return this.metrics.cacheHitRate = this.metrics.totalCalls > 0 ? this.metrics.cacheHits / this.metrics.totalCalls : 0, 
this.metrics.avgCpuPerCall = this.metrics.totalCalls > 0 ? this.metrics.cpuUsed / this.metrics.totalCalls : 0, 
o({}, this.metrics);
}, e.prototype.reset = function() {
this.metrics = {
totalCalls: 0,
cacheHits: 0,
cacheMisses: 0,
cacheHitRate: 0,
cpuUsed: 0,
avgCpuPerCall: 0,
cpuSaved: 0,
callsByType: {
moveTo: 0,
pathFinderSearch: 0,
findPath: 0,
moveByPath: 0
}
};
}, e;
}()), $o = {
enabled: !0,
smoothingFactor: .1,
trackNativeCalls: !0,
logInterval: 100,
segmentUpdateInterval: 10,
segmentId: 90,
maxHistoryPoints: 1e3,
budgetLimits: {
ecoRoom: .1,
warRoom: .25,
overmind: 1
},
budgetAlertThresholds: {
warning: .8,
critical: 1
},
anomalyDetection: {
enabled: !0,
spikeThreshold: 2,
minSamples: 10
}
}, en = function() {
function e(e) {
void 0 === e && (e = {}), this.subsystemMeasurements = new Map, this.roomMeasurements = new Map, 
this.lastSegmentUpdate = 0, this.segmentRequested = !1, this.skippedProcessesThisTick = 0, 
this.config = o(o({}, $o), e), this.currentSnapshot = this.createEmptySnapshot(), 
this.nativeCallsThisTick = this.createEmptyNativeCalls();
}
return e.prototype.initialize = function() {
void 0 === RawMemory.segments[this.config.segmentId] && (RawMemory.setActiveSegments([ this.config.segmentId ]), 
this.segmentRequested = !0), Vo.info("Unified stats system initialized", {
subsystem: "Stats"
});
}, e.prototype.preserveRoomStats = function() {
var e, t = null === (e = this.currentSnapshot) || void 0 === e ? void 0 : e.rooms;
if (!t) return {};
var r = {};
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && Game.rooms[o] && (r[o] = t[o]);
return r;
}, e.prototype.startTick = function() {
if (this.config.enabled) {
RawMemory.setActiveSegments([ this.config.segmentId ]), this.segmentRequested = !0;
var e = this.preserveRoomStats();
this.currentSnapshot = this.createEmptySnapshot(), this.currentSnapshot.rooms = e, 
this.nativeCallsThisTick = this.createEmptyNativeCalls(), this.subsystemMeasurements.clear(), 
this.roomMeasurements.clear(), this.skippedProcessesThisTick = 0, Jo.reset();
}
}, e.prototype.finalizeTick = function() {
var e, t, r, n, a, i, s, c, l, u, m, p, d, f, y, g, h = this;
if (this.config.enabled) {
this.currentSnapshot.cpu = {
used: Game.cpu.getUsed(),
limit: Game.cpu.limit,
bucket: Game.cpu.bucket,
percent: Game.cpu.limit > 0 ? Game.cpu.getUsed() / Game.cpu.limit * 100 : 0,
heapUsed: (null !== (n = null === (r = null === (t = (e = Game.cpu).getHeapStatistics) || void 0 === t ? void 0 : t.call(e)) || void 0 === r ? void 0 : r.used_heap_size) && void 0 !== n ? n : 0) / 1024 / 1024
}, this.currentSnapshot.progression = {
gcl: {
level: Game.gcl.level,
progress: Game.gcl.progress,
progressTotal: Game.gcl.progressTotal,
progressPercent: Game.gcl.progressTotal > 0 ? Game.gcl.progress / Game.gcl.progressTotal * 100 : 0
},
gpl: {
level: null !== (i = null === (a = Game.gpl) || void 0 === a ? void 0 : a.level) && void 0 !== i ? i : 0,
progress: null !== (c = null === (s = Game.gpl) || void 0 === s ? void 0 : s.progress) && void 0 !== c ? c : 0,
progressTotal: null !== (u = null === (l = Game.gpl) || void 0 === l ? void 0 : l.progressTotal) && void 0 !== u ? u : 0,
progressPercent: (null !== (p = null === (m = Game.gpl) || void 0 === m ? void 0 : m.progressTotal) && void 0 !== p ? p : 0) > 0 ? (null !== (f = null === (d = Game.gpl) || void 0 === d ? void 0 : d.progress) && void 0 !== f ? f : 0) / (null !== (g = null === (y = Game.gpl) || void 0 === y ? void 0 : y.progressTotal) && void 0 !== g ? g : 0) * 100 : 0
}
}, this.finalizeEmpireStats(), this.finalizeSubsystemStats(), this.finalizeCacheStats(), 
this.finalizePathfindingStats(), this.currentSnapshot.native = o({}, this.nativeCallsThisTick), 
this.finalizeCreepStats(), this.currentSnapshot.tick = Game.time, this.currentSnapshot.timestamp = Date.now();
var v = this.validateBudgets(), R = this.detectAnomalies();
if (v.alerts.length > 0) {
var E = v.alerts.filter(function(e) {
return "critical" === e.severity;
}), T = v.alerts.filter(function(e) {
return "warning" === e.severity;
});
if (E.length > 0) {
var C = E.map(function(e) {
var t, r = "room:".concat(e.target), o = h.currentSnapshot.processes[r], n = null !== (t = null == o ? void 0 : o.tickModulo) && void 0 !== t ? t : 1, a = n > 1 ? " [runs every ".concat(n, " ticks]") : "";
return "".concat(e.target, ": ").concat((100 * e.percentUsed).toFixed(1), "% (").concat(e.cpuUsed.toFixed(3), "/").concat(e.budgetLimit.toFixed(3), " CPU)").concat(a);
}).join(", ");
Vo.error("CPU Budget: ".concat(E.length, " critical violations detected - ").concat(C), {
subsystem: "CPUBudget"
});
}
if (T.length > 0) {
var S = T.map(function(e) {
var t, r = "room:".concat(e.target), o = h.currentSnapshot.processes[r], n = null !== (t = null == o ? void 0 : o.tickModulo) && void 0 !== t ? t : 1, a = n > 1 ? " [runs every ".concat(n, " ticks]") : "";
return "".concat(e.target, ": ").concat((100 * e.percentUsed).toFixed(1), "%").concat(a);
}).join(", ");
Vo.warn("CPU Budget: ".concat(T.length, " warnings (≥80% of limit) - ").concat(S), {
subsystem: "CPUBudget"
});
}
}
if (R.length > 0) {
var _ = R.map(function(e) {
return "".concat(e.target, " (").concat(e.type, "): ").concat(e.current.toFixed(3), " CPU (").concat(e.multiplier.toFixed(1), "x baseline)").concat(e.context ? " - ".concat(e.context) : "");
}).join(", ");
Vo.warn("CPU Anomalies: ".concat(R.length, " detected - ").concat(_), {
subsystem: "CPUProfiler"
});
}
this.publishToMemory(), this.publishToConsole(), Game.time - this.lastSegmentUpdate >= this.config.segmentUpdateInterval && (this.updateSegment(), 
this.lastSegmentUpdate = Game.time), this.config.logInterval > 0 && Game.time % this.config.logInterval === 0 && this.logSummary();
}
}, e.prototype.startRoom = function(e) {
return this.config.enabled ? Game.cpu.getUsed() : 0;
}, e.prototype.endRoom = function(e, t) {
if (this.config.enabled) {
var r = Game.cpu.getUsed() - t;
this.roomMeasurements.set(e, r);
}
}, e.prototype.measureSubsystem = function(e, t) {
var r;
if (!this.config.enabled) return t();
var o = Game.cpu.getUsed(), n = t(), a = Game.cpu.getUsed() - o, i = null !== (r = this.subsystemMeasurements.get(e)) && void 0 !== r ? r : [];
return i.push(a), this.subsystemMeasurements.set(e, i), n;
}, e.prototype.recordNativeCall = function(e) {
this.config.enabled && this.config.trackNativeCalls && (this.nativeCallsThisTick[e]++, 
this.nativeCallsThisTick.total++);
}, e.prototype.recordProcess = function(e) {
this.config.enabled && (this.currentSnapshot.processes[e.id] = {
id: e.id,
name: e.name,
priority: e.priority,
frequency: e.frequency,
state: e.state,
totalCpu: e.stats.totalCpu,
runCount: e.stats.runCount,
avgCpu: e.stats.avgCpu,
maxCpu: e.stats.maxCpu,
lastRunTick: e.stats.lastRunTick,
skippedCount: e.stats.skippedCount,
errorCount: e.stats.errorCount,
cpuBudget: e.cpuBudget,
minBucket: e.minBucket,
tickModulo: e.tickModulo,
tickOffset: e.tickOffset
});
}, e.prototype.collectProcessStats = function(e) {
var t = this;
this.config.enabled && e.forEach(function(e) {
t.recordProcess(e);
});
}, e.prototype.setSkippedProcesses = function(e) {
this.config.enabled && (this.skippedProcessesThisTick = Math.max(0, e));
}, e.prototype.collectKernelBudgetStats = function(e) {
if (this.config.enabled) {
var t = e.getConfig();
if (t.enableAdaptiveBudgets) {
var r = Object.keys(Game.rooms).length, o = Game.cpu.bucket, n = e.getProcesses().reduce(function(e, t) {
return e + t.cpuBudget;
}, 0), a = e.getTickCpuUsed(), i = n > 0 ? a / n : 0;
this.currentSnapshot.kernelBudgets = {
adaptiveBudgetsEnabled: !0,
roomCount: r,
roomMultiplier: jo(r, t.adaptiveBudgetConfig),
bucketMultiplier: zo(o, t.adaptiveBudgetConfig),
budgets: {
high: t.frequencyCpuBudgets.high || 0,
medium: t.frequencyCpuBudgets.medium || 0,
low: t.frequencyCpuBudgets.low || 0
},
totalAllocated: n,
totalUsed: a,
utilizationRatio: i
};
} else n = e.getProcesses().reduce(function(e, t) {
return e + t.cpuBudget;
}, 0), a = e.getTickCpuUsed(), this.currentSnapshot.kernelBudgets = {
adaptiveBudgetsEnabled: !1,
roomCount: Object.keys(Game.rooms).length,
roomMultiplier: 1,
bucketMultiplier: 1,
budgets: {
high: t.frequencyCpuBudgets.high || 0,
medium: t.frequencyCpuBudgets.medium || 0,
low: t.frequencyCpuBudgets.low || 0
},
totalAllocated: n,
totalUsed: a,
utilizationRatio: n > 0 ? a / n : 0
};
}
}, e.prototype.recordCreep = function(e, t, r, o) {
var n, a, i;
if (void 0 === o && (o = 0), this.config.enabled) {
var s = e.memory;
this.currentSnapshot.creeps[e.name] = {
name: e.name,
role: null !== (n = s.role) && void 0 !== n ? n : "unknown",
homeRoom: null !== (a = s.homeRoom) && void 0 !== a ? a : e.room.name,
currentRoom: e.room.name,
cpu: t,
action: r,
ticksToLive: null !== (i = e.ticksToLive) && void 0 !== i ? i : 0,
hits: e.hits,
hitsMax: e.hitsMax,
bodyParts: e.body.length,
fatigue: e.fatigue,
actionsThisTick: o
};
}
}, e.prototype.recordRoom = function(e, t) {
var r, o, n, s, c, l, u, m, p, d, f, y, g, h, v;
if (this.config.enabled) {
var R = (e.name, {}), E = Object.values(Game.creeps).filter(function(t) {
return t.room.name === e.name;
}).length, T = e.find(FIND_HOSTILE_CREEPS), C = this.currentSnapshot.rooms[e.name];
if (C || (C = {
name: e.name,
rcl: null !== (s = null === (n = e.controller) || void 0 === n ? void 0 : n.level) && void 0 !== s ? s : 0,
energy: {
available: e.energyAvailable,
capacity: e.energyCapacityAvailable,
storage: null !== (l = null === (c = e.storage) || void 0 === c ? void 0 : c.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== l ? l : 0,
terminal: null !== (m = null === (u = e.terminal) || void 0 === u ? void 0 : u.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== m ? m : 0
},
controller: {
progress: null !== (d = null === (p = e.controller) || void 0 === p ? void 0 : p.progress) && void 0 !== d ? d : 0,
progressTotal: null !== (y = null === (f = e.controller) || void 0 === f ? void 0 : f.progressTotal) && void 0 !== y ? y : 1,
progressPercent: 0
},
creeps: E,
hostiles: T.length,
brain: {
danger: null !== (g = null == R ? void 0 : R.danger) && void 0 !== g ? g : 0,
postureCode: this.postureToCode(null !== (h = null == R ? void 0 : R.posture) && void 0 !== h ? h : "eco"),
colonyLevelCode: this.colonyLevelToCode(null !== (v = null == R ? void 0 : R.colonyLevel) && void 0 !== v ? v : "seedNest")
},
pheromones: {},
metrics: {
energyHarvested: 0,
energySpawning: 0,
energyConstruction: 0,
energyRepair: 0,
energyTower: 0,
energyAvailableForSharing: 0,
energyCapacityTotal: 0,
energyNeed: 0,
controllerProgress: 0,
hostileCount: T.length,
damageReceived: 0,
constructionSites: 0
},
profiler: {
avgCpu: t,
peakCpu: t,
samples: 1
}
}, this.currentSnapshot.rooms[e.name] = C), C.controller.progressPercent = C.controller.progressTotal > 0 ? C.controller.progress / C.controller.progressTotal * 100 : 0, 
R) {
if (R.pheromones && "object" == typeof R.pheromones) try {
for (var S = a(Object.entries(R.pheromones)), _ = S.next(); !_.done; _ = S.next()) {
var O = i(_.value, 2), b = O[0], w = O[1];
C.pheromones[b] = w;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
_ && !_.done && (o = S.return) && o.call(S);
} finally {
if (r) throw r.error;
}
}
R.metrics && "object" == typeof R.metrics && (C.metrics = {
energyHarvested: R.metrics.energyHarvested,
energySpawning: R.metrics.energySpawning,
energyConstruction: R.metrics.energyConstruction,
energyRepair: R.metrics.energyRepair,
energyTower: R.metrics.energyTower,
energyAvailableForSharing: R.metrics.energyAvailable,
energyCapacityTotal: R.metrics.energyCapacity,
energyNeed: R.metrics.energyNeed,
controllerProgress: R.metrics.controllerProgress,
hostileCount: R.metrics.hostileCount,
damageReceived: R.metrics.damageReceived,
constructionSites: R.metrics.constructionSites
});
}
var U = this.getProfilerMemory().rooms[e.name];
U && (C.profiler.avgCpu = U.avgCpu * (1 - this.config.smoothingFactor) + t * this.config.smoothingFactor, 
C.profiler.peakCpu = Math.max(U.peakCpu, t), C.profiler.samples = U.samples + 1), 
this.getProfilerMemory().rooms[e.name] = {
avgCpu: C.profiler.avgCpu,
peakCpu: C.profiler.peakCpu,
samples: C.profiler.samples,
lastTick: Game.time
};
}
}, e.prototype.isWarRoom = function(e) {
var t = {};
return !!t && ("war" === t.posture || "siege" === t.posture || t.danger >= 2);
}, e.prototype.validateBudgets = function() {
var e, t, r, o = {
roomsEvaluated: 0,
roomsWithinBudget: 0,
roomsOverBudget: 0,
alerts: [],
anomalies: [],
tick: Game.time
};
try {
for (var n = a(Object.entries(this.currentSnapshot.rooms)), s = n.next(); !s.done; s = n.next()) {
var c = i(s.value, 2), l = c[0], u = c[1];
o.roomsEvaluated++;
var m = this.isWarRoom(l) ? this.config.budgetLimits.warRoom : this.config.budgetLimits.ecoRoom, p = "room:".concat(l), d = this.currentSnapshot.processes[p], f = m * (null !== (r = null == d ? void 0 : d.tickModulo) && void 0 !== r ? r : 1), y = u.profiler.avgCpu, g = y / f;
g >= this.config.budgetAlertThresholds.critical ? (o.roomsOverBudget++, o.alerts.push({
severity: "critical",
target: l,
targetType: "room",
cpuUsed: y,
budgetLimit: f,
percentUsed: g,
tick: Game.time
})) : g >= this.config.budgetAlertThresholds.warning ? (o.alerts.push({
severity: "warning",
target: l,
targetType: "room",
cpuUsed: y,
budgetLimit: f,
percentUsed: g,
tick: Game.time
}), o.roomsWithinBudget++) : o.roomsWithinBudget++;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.detectAnomalies = function() {
var e, t, r, o, n, s, c, l;
if (!this.config.anomalyDetection.enabled) return [];
var u = [];
try {
for (var m = a(Object.entries(this.currentSnapshot.rooms)), p = m.next(); !p.done; p = m.next()) {
var d = i(p.value, 2), f = d[0], y = d[1];
if (!(y.profiler.samples < this.config.anomalyDetection.minSamples)) {
var g = null !== (n = this.roomMeasurements.get(f)) && void 0 !== n ? n : 0;
if (!((O = y.profiler.avgCpu) < .01)) {
var h = g / O;
if (h >= this.config.anomalyDetection.spikeThreshold) {
var v = qo(), R = v ? "RCL ".concat(null !== (l = null === (c = null === (s = Game.rooms[f]) || void 0 === s ? void 0 : s.controller) || void 0 === c ? void 0 : c.level) && void 0 !== l ? l : 0, ", posture: ").concat(v.posture, ", danger: ").concat(v.danger) : void 0;
u.push({
type: "spike",
target: f,
targetType: "room",
current: g,
baseline: O,
multiplier: h,
tick: Game.time,
context: R
});
}
}
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
p && !p.done && (t = m.return) && t.call(m);
} finally {
if (e) throw e.error;
}
}
try {
for (var E = a(Object.entries(this.currentSnapshot.processes)), T = E.next(); !T.done; T = E.next()) {
var C = i(T.value, 2), S = C[0], _ = C[1];
if (!(_.runCount < this.config.anomalyDetection.minSamples)) {
g = _.maxCpu;
var O = _.avgCpu;
if (!(Game.time - _.lastRunTick > 100 || O < .01) && (g >= O * this.config.anomalyDetection.spikeThreshold && u.push({
type: "spike",
target: S,
targetType: "process",
current: g,
baseline: O,
multiplier: g / O,
tick: Game.time,
context: "".concat(_.name, " (").concat(_.frequency, ")")
}), _.cpuBudget > 0)) {
var b = O / _.cpuBudget;
b >= 1.5 && u.push({
type: "sustained_high",
target: S,
targetType: "process",
current: O,
baseline: _.cpuBudget,
multiplier: b,
tick: Game.time,
context: "".concat(_.name, " (").concat(_.frequency, ")")
});
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
T && !T.done && (o = E.return) && o.call(E);
} finally {
if (r) throw r.error;
}
}
return u;
}, e.prototype.createEmptySnapshot = function() {
return {
tick: Game.time,
timestamp: Date.now(),
cpu: {
used: 0,
limit: 0,
bucket: 0,
percent: 0,
heapUsed: 0
},
progression: {
gcl: {
level: 0,
progress: 0,
progressTotal: 1,
progressPercent: 0
},
gpl: {
level: 0,
progress: 0,
progressTotal: 0,
progressPercent: 0
}
},
empire: {
rooms: 0,
creeps: 0,
powerCreeps: {
total: 0,
spawned: 0,
eco: 0,
combat: 0
},
energy: {
storage: 0,
terminal: 0,
available: 0,
capacity: 0
},
credits: 0,
skippedProcesses: 0
},
rooms: {},
subsystems: {},
roles: {},
native: this.createEmptyNativeCalls(),
processes: {},
creeps: {},
kernelBudgets: {
adaptiveBudgetsEnabled: !1,
roomCount: 0,
roomMultiplier: 1,
bucketMultiplier: 1,
budgets: {
high: 0,
medium: 0,
low: 0
},
totalAllocated: 0,
totalUsed: 0,
utilizationRatio: 0
},
cache: {
roomFind: {
rooms: 0,
totalEntries: 0,
hits: 0,
misses: 0,
invalidations: 0,
hitRate: 0
},
bodyPart: {
size: 0
},
object: {
size: 0
},
path: {
size: 0,
maxSize: 0,
hits: 0,
misses: 0,
evictions: 0,
hitRate: 0
},
role: {
totalEntries: 0
},
global: {
hits: 0,
misses: 0,
hitRate: 0,
size: 0,
evictions: 0
}
},
pathfinding: {
totalCalls: 0,
cacheHits: 0,
cacheMisses: 0,
cacheHitRate: 0,
cpuUsed: 0,
avgCpuPerCall: 0,
cpuSaved: 0,
callsByType: {
moveTo: 0,
pathFinderSearch: 0,
findPath: 0,
moveByPath: 0
}
}
};
}, e.prototype.createEmptyNativeCalls = function() {
return {
pathfinderSearch: 0,
moveTo: 0,
move: 0,
harvest: 0,
transfer: 0,
withdraw: 0,
build: 0,
repair: 0,
upgradeController: 0,
attack: 0,
rangedAttack: 0,
heal: 0,
dismantle: 0,
say: 0,
total: 0
};
}, e.prototype.finalizeEmpireStats = function() {
var e, t = Object.values(this.currentSnapshot.rooms || {}), r = Object.keys(Game.creeps).length, o = Object.values(Game.powerCreeps || {}), n = o.filter(function(e) {
return void 0 !== e.ticksToLive;
}), a = o.filter(function(e) {
return "powerQueen" === e.memory.role;
}), i = o.filter(function(e) {
return "powerWarrior" === e.memory.role;
});
try {
var s = {};
s && (e = {
name: s.name,
role: s.role,
cpuUsage: s.health.cpuUsage,
cpuCategory: s.health.cpuCategory,
bucketLevel: s.health.bucketLevel,
economyIndex: s.health.economyIndex,
warIndex: s.health.warIndex,
avgRCL: s.health.avgRCL,
portalsCount: s.portals.length,
activeTasksCount: s.activeTasks.length
});
} catch (e) {}
this.currentSnapshot.empire = {
rooms: t.length,
creeps: r,
powerCreeps: {
total: o.length,
spawned: n.length,
eco: a.length,
combat: i.length
},
energy: {
storage: t.reduce(function(e, t) {
return e + t.energy.storage;
}, 0),
terminal: t.reduce(function(e, t) {
return e + t.energy.terminal;
}, 0),
available: t.reduce(function(e, t) {
return e + t.energy.available;
}, 0),
capacity: t.reduce(function(e, t) {
return e + t.energy.capacity;
}, 0)
},
credits: Game.market.credits,
skippedProcesses: this.skippedProcessesThisTick,
shard: e
};
}, e.prototype.finalizeSubsystemStats = function() {
var e, t, r, o, n, s, c, l, u, m = this.getProfilerMemory(), p = function(e, t) {
var i, p, f = t.reduce(function(e, t) {
return e + t;
}, 0), y = e.startsWith("role:"), g = y ? e.substring(5) : e;
if (y) {
var h = Object.values(Game.creeps).filter(function(e) {
return e.memory.role === g;
}), v = h.length, R = 0, E = 0, T = 0, C = 0, S = 0;
try {
for (var _ = (i = void 0, a(h)), O = _.next(); !O.done; O = _.next()) {
var b = O.value, w = b.memory, U = null !== (o = null === (r = w.state) || void 0 === r ? void 0 : r.action) && void 0 !== o ? o : "idle", x = null !== (n = w.working) && void 0 !== n ? n : "idle" !== U;
S += b.body.length, C += null !== (s = b.ticksToLive) && void 0 !== s ? s : 0, b.spawning ? R++ : x && "idle" !== U ? T++ : E++;
}
} catch (e) {
i = {
error: e
};
} finally {
try {
O && !O.done && (p = _.return) && p.call(_);
} finally {
if (i) throw i.error;
}
}
var A = t.length > 0 ? f / t.length : 0, M = (N = null === (c = m.roles) || void 0 === c ? void 0 : c[g]) ? N.avgCpu * (1 - d.config.smoothingFactor) + A * d.config.smoothingFactor : A, k = N ? Math.max(N.peakCpu, A) : A;
d.currentSnapshot.roles[g] = {
name: g,
count: v,
avgCpu: M,
peakCpu: k,
calls: t.length,
samples: (null !== (l = null == N ? void 0 : N.samples) && void 0 !== l ? l : 0) + 1,
spawningCount: R,
idleCount: E,
activeCount: T,
avgTicksToLive: v > 0 ? C / v : 0,
totalBodyParts: S
}, m.roles || (m.roles = {}), m.roles[g] = {
avgCpu: M,
peakCpu: k,
samples: d.currentSnapshot.roles[g].samples,
callsThisTick: t.length
};
} else {
var N;
M = (N = m.subsystems[g]) ? N.avgCpu * (1 - d.config.smoothingFactor) + f * d.config.smoothingFactor : f, 
k = N ? Math.max(N.peakCpu, f) : f, d.currentSnapshot.subsystems[g] = {
name: g,
avgCpu: M,
peakCpu: k,
calls: t.length,
samples: (null !== (u = null == N ? void 0 : N.samples) && void 0 !== u ? u : 0) + 1
}, m.subsystems[g] = {
avgCpu: M,
peakCpu: k,
samples: d.currentSnapshot.subsystems[g].samples,
callsThisTick: t.length
};
}
}, d = this;
try {
for (var f = a(this.subsystemMeasurements), y = f.next(); !y.done; y = f.next()) {
var g = i(y.value, 2);
p(g[0], g[1]);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
y && !y.done && (t = f.return) && t.call(f);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.finalizeCreepStats = function() {
var e, t, r, o, n, i, s;
try {
for (var c = a(Object.values(Game.creeps)), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (!this.currentSnapshot.creeps[u.name]) {
var m = u.memory, p = null !== (o = null === (r = m.state) || void 0 === r ? void 0 : r.action) && void 0 !== o ? o : m.working ? "working" : "idle";
this.currentSnapshot.creeps[u.name] = {
name: u.name,
role: null !== (n = m.role) && void 0 !== n ? n : "unknown",
homeRoom: null !== (i = m.homeRoom) && void 0 !== i ? i : u.room.name,
currentRoom: u.room.name,
cpu: 0,
action: p,
ticksToLive: null !== (s = u.ticksToLive) && void 0 !== s ? s : 0,
hits: u.hits,
hitsMax: u.hitsMax,
bodyParts: u.body.length,
fatigue: u.fatigue,
actionsThisTick: 0
};
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.finalizeCacheStats = function() {
this.currentSnapshot.cache = {
roomFind: {
rooms: 0,
totalEntries: 0,
hits: 0,
misses: 0,
invalidations: 0,
size: 0,
hitRate: 0
},
bodyPart: {
size: 0
},
object: {
size: 0
},
path: {
hits: 0,
misses: 0,
size: 0,
maxSize: 0,
evictions: 0,
hitRate: 0
},
role: {
totalEntries: 0
},
global: {
hits: 0,
misses: 0,
hitRate: 0,
size: 0,
evictions: 0
}
};
}, e.prototype.finalizePathfindingStats = function() {
this.currentSnapshot.pathfinding = Jo.getMetrics();
}, e.prototype.publishToConsole = function() {
var e = Memory;
if (e.stats && "object" == typeof e.stats) {
var t = {
type: "stats",
tick: "undefined" != typeof Game ? Game.time : 0,
data: e.stats
};
console.log(JSON.stringify(t));
}
}, e.prototype.publishToMemory = function() {
var e, t, r, n, s, c, l, u, m, p, d = Memory, f = this.currentSnapshot;
d.stats = {
tick: f.tick,
timestamp: f.timestamp,
cpu: {
used: f.cpu.used,
limit: f.cpu.limit,
bucket: f.cpu.bucket,
percent: f.cpu.percent,
heap_mb: f.cpu.heapUsed
},
kernel: {
adaptive_budgets_enabled: f.kernelBudgets.adaptiveBudgetsEnabled,
room_count: f.kernelBudgets.roomCount,
room_multiplier: f.kernelBudgets.roomMultiplier,
bucket_multiplier: f.kernelBudgets.bucketMultiplier,
budget_high: f.kernelBudgets.budgets.high,
budget_medium: f.kernelBudgets.budgets.medium,
budget_low: f.kernelBudgets.budgets.low,
total_allocated: f.kernelBudgets.totalAllocated,
total_used: f.kernelBudgets.totalUsed,
utilization_ratio: f.kernelBudgets.utilizationRatio
},
gcl: {
level: f.progression.gcl.level,
progress: f.progression.gcl.progress,
progress_total: f.progression.gcl.progressTotal,
progress_percent: f.progression.gcl.progressPercent
},
gpl: {
level: f.progression.gpl.level,
progress: f.progression.gpl.progress,
progress_total: f.progression.gpl.progressTotal,
progress_percent: f.progression.gpl.progressPercent
},
empire: {
rooms: f.empire.rooms,
creeps: f.empire.creeps,
power_creeps: {
total: f.empire.powerCreeps.total,
spawned: f.empire.powerCreeps.spawned,
eco: f.empire.powerCreeps.eco,
combat: f.empire.powerCreeps.combat
},
energy: {
storage: f.empire.energy.storage,
terminal: f.empire.energy.terminal,
available: f.empire.energy.available,
capacity: f.empire.energy.capacity
},
credits: f.empire.credits,
skipped_processes: f.empire.skippedProcesses,
shard: f.empire.shard ? {
name: f.empire.shard.name,
role: f.empire.shard.role,
cpu_usage: f.empire.shard.cpuUsage,
cpu_category: f.empire.shard.cpuCategory,
bucket_level: f.empire.shard.bucketLevel,
economy_index: f.empire.shard.economyIndex,
war_index: f.empire.shard.warIndex,
avg_rcl: f.empire.shard.avgRCL,
portals_count: f.empire.shard.portalsCount,
active_tasks_count: f.empire.shard.activeTasksCount
} : void 0
},
rooms: {},
subsystems: {},
roles: {},
native: {
pathfinder_search: f.native.pathfinderSearch,
move_to: f.native.moveTo,
move: f.native.move,
harvest: f.native.harvest,
transfer: f.native.transfer,
withdraw: f.native.withdraw,
build: f.native.build,
repair: f.native.repair,
upgrade_controller: f.native.upgradeController,
attack: f.native.attack,
ranged_attack: f.native.rangedAttack,
heal: f.native.heal,
dismantle: f.native.dismantle,
say: f.native.say,
total: f.native.total
}
};
try {
for (var y = a(Object.entries(f.rooms)), g = y.next(); !g.done; g = y.next()) {
var h = i(g.value, 2), v = h[0], R = h[1];
d.stats.rooms[v] = {
rcl: R.rcl,
energy: {
available: R.energy.available,
capacity: R.energy.capacity,
storage: R.energy.storage,
terminal: R.energy.terminal
},
controller: {
progress: R.controller.progress,
progress_total: R.controller.progressTotal,
progress_percent: R.controller.progressPercent
},
creeps: R.creeps,
hostiles: R.hostiles,
brain: {
danger: R.brain.danger,
posture_code: R.brain.postureCode,
colony_level_code: R.brain.colonyLevelCode
},
pheromones: o({}, R.pheromones),
metrics: {
energy: {
harvested: R.metrics.energyHarvested,
spawning: R.metrics.energySpawning,
construction: R.metrics.energyConstruction,
repair: R.metrics.energyRepair,
tower: R.metrics.energyTower,
available_for_sharing: R.metrics.energyAvailableForSharing,
capacity_total: R.metrics.energyCapacityTotal,
need: R.metrics.energyNeed
},
controller_progress: R.metrics.controllerProgress,
hostile_count: R.metrics.hostileCount,
damage_received: R.metrics.damageReceived,
construction_sites: R.metrics.constructionSites
},
profiler: {
avg_cpu: R.profiler.avgCpu,
peak_cpu: R.profiler.peakCpu,
samples: R.profiler.samples
}
};
}
} catch (t) {
e = {
error: t
};
} finally {
try {
g && !g.done && (t = y.return) && t.call(y);
} finally {
if (e) throw e.error;
}
}
try {
for (var E = a(Object.entries(f.subsystems)), T = E.next(); !T.done; T = E.next()) {
var C = i(T.value, 2), S = C[0], _ = C[1];
d.stats.subsystems[S] = {
avg_cpu: _.avgCpu,
peak_cpu: _.peakCpu,
calls: _.calls,
samples: _.samples
};
}
} catch (e) {
r = {
error: e
};
} finally {
try {
T && !T.done && (n = E.return) && n.call(E);
} finally {
if (r) throw r.error;
}
}
try {
for (var O = a(Object.entries(f.roles)), b = O.next(); !b.done; b = O.next()) {
var w = i(b.value, 2), U = (S = w[0], w[1]);
d.stats.roles[S] = {
count: U.count,
avg_cpu: U.avgCpu,
peak_cpu: U.peakCpu,
calls: U.calls,
samples: U.samples,
spawning_count: U.spawningCount,
idle_count: U.idleCount,
active_count: U.activeCount,
avg_ticks_to_live: U.avgTicksToLive,
total_body_parts: U.totalBodyParts
};
}
} catch (e) {
s = {
error: e
};
} finally {
try {
b && !b.done && (c = O.return) && c.call(O);
} finally {
if (s) throw s.error;
}
}
d.stats.processes = {};
try {
for (var x = a(Object.entries(f.processes)), A = x.next(); !A.done; A = x.next()) {
var M = i(A.value, 2), k = M[0], N = M[1];
d.stats.processes[k] = {
name: N.name,
priority: N.priority,
frequency: N.frequency,
state: N.state,
total_cpu: N.totalCpu,
run_count: N.runCount,
avg_cpu: N.avgCpu,
max_cpu: N.maxCpu,
last_run_tick: N.lastRunTick,
skipped_count: N.skippedCount,
error_count: N.errorCount,
cpu_budget: N.cpuBudget,
min_bucket: N.minBucket
};
}
} catch (e) {
l = {
error: e
};
} finally {
try {
A && !A.done && (u = x.return) && u.call(x);
} finally {
if (l) throw l.error;
}
}
d.stats.creeps = {};
try {
for (var I = a(Object.entries(f.creeps)), P = I.next(); !P.done; P = I.next()) {
var G = i(P.value, 2), L = (S = G[0], G[1]);
d.stats.creeps[S] = {
role: L.role,
home_room: L.homeRoom,
current_room: L.currentRoom,
cpu: L.cpu,
action: L.action,
ticks_to_live: L.ticksToLive,
hits: L.hits,
hits_max: L.hitsMax,
body_parts: L.bodyParts,
fatigue: L.fatigue,
actions_this_tick: L.actionsThisTick
};
}
} catch (e) {
m = {
error: e
};
} finally {
try {
P && !P.done && (p = I.return) && p.call(I);
} finally {
if (m) throw m.error;
}
}
}, e.prototype.updateSegment = function() {
if (this.config.enabled) if (void 0 !== RawMemory.segments[this.config.segmentId]) {
this.segmentRequested = !1;
var e = 102400, t = [], r = RawMemory.segments[this.config.segmentId];
if (r) try {
var o = JSON.parse(r);
Array.isArray(o) && (t = o);
} catch (e) {
var n = e instanceof Error ? e.message : String(e);
Vo.error("Failed to parse stats segment: ".concat(n), {
subsystem: "Stats"
});
}
t.push(this.currentSnapshot), t.length > this.config.maxHistoryPoints && (t = t.slice(-this.config.maxHistoryPoints));
var a = JSON.stringify(t);
if (a.length > e) {
for (Vo.warn("Stats segment size ".concat(a.length, " exceeds ").concat(e, " bytes, trimming history"), {
subsystem: "Stats"
}); a.length > e && t.length > 1; ) t.shift(), a = JSON.stringify(t);
if (a.length > e) return void Vo.error("Failed to persist stats segment within ".concat(e, " bytes after trimming"), {
subsystem: "Stats"
});
}
try {
RawMemory.segments[this.config.segmentId] = a;
} catch (e) {
n = e instanceof Error ? e.message : String(e), Vo.error("Failed to save stats segment: ".concat(n), {
subsystem: "Stats"
});
}
} else this.segmentRequested || (RawMemory.setActiveSegments([ this.config.segmentId ]), 
this.segmentRequested = !0);
}, e.prototype.getProfilerMemory = function() {
var e = Memory;
return e.stats && "object" == typeof e.stats || (e.stats = {}), e.stats.profiler || (e.stats.profiler = {
rooms: {},
subsystems: {},
roles: {},
tickCount: 0,
lastUpdate: 0
}), e.stats.profiler;
}, e.prototype.logSummary = function() {
var e, t, r, o, n, i, s, c, l, u, m = this.currentSnapshot;
Vo.info("=== Unified Stats Summary ==="), Vo.info("CPU: ".concat(m.cpu.used.toFixed(2), "/").concat(m.cpu.limit, " (").concat(m.cpu.percent.toFixed(1), "%) | Bucket: ").concat(m.cpu.bucket)), 
Vo.info("Empire: ".concat(m.empire.rooms, " rooms, ").concat(m.empire.creeps, " creeps, ").concat(m.empire.credits, " credits"));
var p = Object.values(m.subsystems).sort(function(e, t) {
return t.avgCpu - e.avgCpu;
}).slice(0, 5);
if (p.length > 0) {
Vo.info("Top Subsystems:");
try {
for (var d = a(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
Vo.info("  ".concat(y.name, ": ").concat(y.avgCpu.toFixed(3), " CPU"));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
f && !f.done && (t = d.return) && t.call(d);
} finally {
if (e) throw e.error;
}
}
}
var g = Object.values(m.roles).sort(function(e, t) {
return t.avgCpu - e.avgCpu;
}).slice(0, 5);
if (g.length > 0) {
Vo.info("Top Roles:");
try {
for (var h = a(g), v = h.next(); !v.done; v = h.next()) {
var R = v.value;
Vo.info("  ".concat(R.name, ": ").concat(R.count, " creeps, ").concat(R.avgCpu.toFixed(3), " CPU"));
}
} catch (e) {
r = {
error: e
};
} finally {
try {
v && !v.done && (o = h.return) && o.call(h);
} finally {
if (r) throw r.error;
}
}
}
var E = Object.values(m.processes).sort(function(e, t) {
return t.avgCpu - e.avgCpu;
}).slice(0, 5);
if (E.length > 0) {
Vo.info("Top Processes:");
try {
for (var T = a(E), C = T.next(); !C.done; C = T.next()) {
var S = C.value;
Vo.info("  ".concat(S.name, ": ").concat(S.avgCpu.toFixed(3), " CPU (runs: ").concat(S.runCount, ", state: ").concat(S.state, ")"));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
C && !C.done && (i = T.return) && i.call(T);
} finally {
if (n) throw n.error;
}
}
}
var _ = Object.values(m.rooms).sort(function(e, t) {
return t.profiler.avgCpu - e.profiler.avgCpu;
}).slice(0, 5);
if (_.length > 0) {
Vo.info("Top Rooms by CPU:");
try {
for (var O = a(_), b = O.next(); !b.done; b = O.next()) {
var w = b.value;
Vo.info("  ".concat(w.name, ": ").concat(w.profiler.avgCpu.toFixed(3), " CPU (RCL ").concat(w.rcl, ")"));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
b && !b.done && (c = O.return) && c.call(O);
} finally {
if (s) throw s.error;
}
}
}
var U = Object.values(m.creeps).sort(function(e, t) {
return t.cpu - e.cpu;
}).slice(0, 5);
if (U.length > 0) {
Vo.info("Top Creeps by CPU:");
try {
for (var x = a(U), A = x.next(); !A.done; A = x.next()) {
var M = A.value;
Vo.info("  ".concat(M.name, " (").concat(M.role, "): ").concat(M.cpu.toFixed(3), " CPU in ").concat(M.currentRoom));
}
} catch (e) {
l = {
error: e
};
} finally {
try {
A && !A.done && (u = x.return) && u.call(x);
} finally {
if (l) throw l.error;
}
}
}
this.config.trackNativeCalls && Vo.info("Native calls: ".concat(m.native.total, " total"));
}, e.prototype.postureToCode = function(e) {
var t;
return null !== (t = {
eco: 0,
expand: 1,
defensive: 2,
war: 3,
siege: 4,
evacuate: 5,
nukePrep: 6
}[e]) && void 0 !== t ? t : -1;
}, e.prototype.postureCodeToName = function(t) {
var r;
return null !== (r = e.POSTURE_NAMES[t]) && void 0 !== r ? r : "eco";
}, e.prototype.colonyLevelToCode = function(e) {
var t;
return null !== (t = {
seedNest: 1,
foragingExpansion: 2,
matureColony: 3,
fortifiedHive: 4,
empireDominance: 5
}[e]) && void 0 !== t ? t : 0;
}, e.prototype.getSnapshot = function() {
return this.currentSnapshot;
}, e.prototype.setEnabled = function(e) {
this.config.enabled = e;
}, e.prototype.isEnabled = function() {
return this.config.enabled;
}, e.prototype.reset = function() {
var e;
this.currentSnapshot = this.createEmptySnapshot();
var t = Memory;
(null === (e = t.stats) || void 0 === e ? void 0 : e.profiler) && (t.stats.profiler = {
rooms: {},
subsystems: {},
roles: {},
tickCount: 0,
lastUpdate: 0
});
}, e.prototype.getCurrentSnapshot = function() {
return o({}, this.currentSnapshot);
}, e.POSTURE_NAMES = [ "eco", "expand", "defensive", "war", "siege", "evacuate", "nukePrep" ], 
e;
}(), tn = new en, rn = {
primarySegment: 90,
backupSegment: 91,
retentionPeriod: 1e4,
updateInterval: 50,
maxDataPoints: 1e3
}, on = function() {
function e(e) {
void 0 === e && (e = {}), this.statsData = null, this.segmentRequested = !1, this.lastUpdate = 0, 
this.config = o(o({}, rn), e);
}
return e.prototype.initialize = function() {
RawMemory.setActiveSegments([ this.config.primarySegment ]), this.segmentRequested = !0;
}, e.prototype.run = function() {
this.segmentRequested && void 0 !== RawMemory.segments[this.config.primarySegment] && (this.loadFromSegment(), 
this.segmentRequested = !1), Game.time - this.lastUpdate >= this.config.updateInterval && (this.updateStats(), 
this.lastUpdate = Game.time);
}, e.prototype.loadFromSegment = function() {
var e = RawMemory.segments[this.config.primarySegment];
if (e && 0 !== e.length) try {
this.statsData = JSON.parse(e), Vo.debug("Loaded stats from segment", {
subsystem: "Stats"
});
} catch (e) {
var t = e instanceof Error ? e.message : String(e);
Vo.error("Failed to parse stats segment: ".concat(t), {
subsystem: "Stats"
}), this.statsData = this.createDefaultStatsData();
} else this.statsData = this.createDefaultStatsData();
}, e.prototype.createDefaultStatsData = function() {
return {
version: 1,
lastUpdate: Game.time,
history: [],
series: {}
};
}, e.prototype.updateStats = function() {
this.statsData || (this.statsData = this.createDefaultStatsData());
var e = this.collectGlobalStats();
for (this.statsData.history.push(e); this.statsData.history.length > this.config.maxDataPoints; ) this.statsData.history.shift();
var t = Game.time - this.config.retentionPeriod;
this.statsData.history = this.statsData.history.filter(function(e) {
return e.tick >= t;
}), this.updateMetricSeries("cpu", e.cpuUsed), this.updateMetricSeries("bucket", e.cpuBucket), 
this.updateMetricSeries("creeps", e.totalCreeps), this.updateMetricSeries("rooms", e.totalRooms), 
this.publishStatsToMemory(e), this.saveToSegment();
}, e.prototype.publishStatsToMemory = function(e) {
var t, r, o, n, s = Memory;
s.stats && "object" == typeof s.stats || (s.stats = {});
var c = s.stats;
c["stats.cpu.used"] = e.cpuUsed, c["stats.cpu.limit"] = e.cpuLimit, c["stats.cpu.bucket"] = e.cpuBucket, 
c["stats.cpu.percent"] = e.cpuLimit > 0 ? e.cpuUsed / e.cpuLimit * 100 : 0, c["stats.gcl.level"] = e.gclLevel, 
c["stats.gcl.progress"] = e.gclProgress, c["stats.gcl.progress_total"] = e.gclProgressTotal, 
c["stats.gpl.level"] = e.gplLevel, c["stats.empire.creeps"] = e.totalCreeps, c["stats.empire.rooms"] = e.totalRooms;
var l = e.rooms.reduce(function(e, t) {
return {
storage: e.storage + t.storageEnergy,
terminal: e.terminal + t.terminalEnergy,
available: e.available + t.energyAvailable,
capacity: e.capacity + t.energyCapacity
};
}, {
storage: 0,
terminal: 0,
available: 0,
capacity: 0
});
c["stats.empire.energy.storage"] = l.storage, c["stats.empire.energy.terminal"] = l.terminal, 
c["stats.empire.energy.available"] = l.available, c["stats.empire.energy.capacity"] = l.capacity;
try {
for (var u = a(e.rooms), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = "stats.room.".concat(p.roomName);
c["".concat(d, ".rcl")] = p.rcl, c["".concat(d, ".energy.available")] = p.energyAvailable, 
c["".concat(d, ".energy.capacity")] = p.energyCapacity, c["".concat(d, ".storage.energy")] = p.storageEnergy, 
c["".concat(d, ".terminal.energy")] = p.terminalEnergy, c["".concat(d, ".creeps")] = p.creepCount, 
c["".concat(d, ".controller.progress")] = p.controllerProgress, c["".concat(d, ".controller.progress_total")] = p.controllerProgressTotal, 
c["".concat(d, ".controller.progress_percent")] = p.controllerProgressTotal > 0 ? p.controllerProgress / p.controllerProgressTotal * 100 : 0;
var f = qo(p.roomName);
if (f) {
if (c["".concat(d, ".brain.danger")] = f.danger, c["".concat(d, ".brain.posture_code")] = this.postureToCode(f.posture), 
c["".concat(d, ".brain.colony_level_code")] = this.colonyLevelToCode(f.colonyLevel), 
f.pheromones) try {
for (var y = (o = void 0, a(Object.entries(f.pheromones))), g = y.next(); !g.done; g = y.next()) {
var h = i(g.value, 2), v = h[0], R = h[1];
c["".concat(d, ".pheromone.").concat(v)] = R;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (n = y.return) && n.call(y);
} finally {
if (o) throw o.error;
}
}
var E = f.metrics;
E && (c["".concat(d, ".metrics.energy.harvested")] = E.energyHarvested, c["".concat(d, ".metrics.energy.spawning")] = E.energySpawning, 
c["".concat(d, ".metrics.energy.construction")] = E.energyConstruction, c["".concat(d, ".metrics.energy.repair")] = E.energyRepair, 
c["".concat(d, ".metrics.energy.tower")] = E.energyTower, c["".concat(d, ".metrics.energy.available_for_sharing")] = E.energyAvailable, 
c["".concat(d, ".metrics.energy.capacity_total")] = E.energyCapacity, c["".concat(d, ".metrics.energy.need")] = E.energyNeed, 
c["".concat(d, ".metrics.controller_progress")] = E.controllerProgress, c["".concat(d, ".metrics.hostile_count")] = E.hostileCount, 
c["".concat(d, ".metrics.damage_received")] = E.damageReceived, c["".concat(d, ".metrics.construction_sites")] = E.constructionSites);
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
c["stats.system.tick"] = e.tick, c["stats.system.timestamp"] = Date.now();
}, e.prototype.collectGlobalStats = function() {
var e, t, r, o, n = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), a = new Map;
for (var i in Game.creeps) {
var s = Game.creeps[i];
if (!s.spawning && (null === (e = s.room.controller) || void 0 === e ? void 0 : e.my)) {
var c = null !== (t = a.get(s.room.name)) && void 0 !== t ? t : 0;
a.set(s.room.name, c + 1);
}
}
var l = n.map(function(e) {
var t, r, o, n, i, s, c, l, u, m, p;
return {
roomName: e.name,
rcl: null !== (r = null === (t = e.controller) || void 0 === t ? void 0 : t.level) && void 0 !== r ? r : 0,
energyAvailable: e.energyAvailable,
energyCapacity: e.energyCapacityAvailable,
storageEnergy: null !== (n = null === (o = e.storage) || void 0 === o ? void 0 : o.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== n ? n : 0,
terminalEnergy: null !== (s = null === (i = e.terminal) || void 0 === i ? void 0 : i.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== s ? s : 0,
creepCount: null !== (c = a.get(e.name)) && void 0 !== c ? c : 0,
controllerProgress: null !== (u = null === (l = e.controller) || void 0 === l ? void 0 : l.progress) && void 0 !== u ? u : 0,
controllerProgressTotal: null !== (p = null === (m = e.controller) || void 0 === m ? void 0 : m.progressTotal) && void 0 !== p ? p : 1
};
});
return {
tick: Game.time,
cpuUsed: Game.cpu.getUsed(),
cpuLimit: Game.cpu.limit,
cpuBucket: Game.cpu.bucket,
gclLevel: Game.gcl.level,
gclProgress: Game.gcl.progress,
gclProgressTotal: Game.gcl.progressTotal,
gplLevel: null !== (o = null === (r = Game.gpl) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0,
totalCreeps: Object.keys(Game.creeps).length,
totalRooms: n.length,
rooms: l,
metrics: {}
};
}, e.prototype.updateMetricSeries = function(e, t) {
if (this.statsData) {
var r = this.statsData.series[e];
r || (r = {
name: e,
data: [],
lastUpdate: Game.time,
min: t,
max: t,
avg: t
}, this.statsData.series[e] = r), r.data.push({
tick: Game.time,
value: t
}), r.lastUpdate = Game.time;
var o = Game.time - this.config.retentionPeriod;
for (r.data = r.data.filter(function(e) {
return e.tick >= o;
}); r.data.length > this.config.maxDataPoints; ) r.data.shift();
r.data.length > 0 && (r.min = Math.min.apply(Math, s([], i(r.data.map(function(e) {
return e.value;
})), !1)), r.max = Math.max.apply(Math, s([], i(r.data.map(function(e) {
return e.value;
})), !1)), r.avg = r.data.reduce(function(e, t) {
return e + t.value;
}, 0) / r.data.length);
}
}, e.prototype.saveToSegment = function() {
var e, t, r, o;
if (this.statsData) {
var n = 102400;
try {
this.statsData.lastUpdate = Game.time;
var i = JSON.stringify(this.statsData);
if (i.length > n) {
for (Vo.warn("Stats data exceeds segment limit: ".concat(i.length, " bytes, trimming..."), {
subsystem: "Stats"
}); i.length > n && this.statsData.history.length > 10; ) this.statsData.history.shift(), 
i = JSON.stringify(this.statsData);
if (i.length > n) try {
for (var s = a(Object.keys(this.statsData.series)), c = s.next(); !c.done; c = s.next()) for (var l = c.value, u = this.statsData.series[l]; u.data.length > 10 && i.length > n; ) u.data.shift(), 
i = JSON.stringify(this.statsData);
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = s.return) && t.call(s);
} finally {
if (e) throw e.error;
}
}
if (i.length > n) {
Vo.warn("Stats data still exceeds limit after trimming, clearing history", {
subsystem: "Stats"
}), this.statsData.history = this.statsData.history.slice(-5);
try {
for (var m = a(Object.keys(this.statsData.series)), p = m.next(); !p.done; p = m.next()) l = p.value, 
this.statsData.series[l].data = this.statsData.series[l].data.slice(-5);
} catch (e) {
r = {
error: e
};
} finally {
try {
p && !p.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
i = JSON.stringify(this.statsData);
}
}
RawMemory.segments[this.config.primarySegment] = i;
} catch (e) {
var d = e instanceof Error ? e.message : String(e);
Vo.error("Failed to save stats segment: ".concat(d), {
subsystem: "Stats"
});
}
}
}, e.prototype.recordMetric = function(e, t) {
this.updateMetricSeries(e, t);
}, e.prototype.getLatestStats = function() {
var e;
return this.statsData && 0 !== this.statsData.history.length && null !== (e = this.statsData.history[this.statsData.history.length - 1]) && void 0 !== e ? e : null;
}, e.prototype.getMetricSeries = function(e) {
var t, r;
return null !== (r = null === (t = this.statsData) || void 0 === t ? void 0 : t.series[e]) && void 0 !== r ? r : null;
}, e.prototype.getMetricNames = function() {
var e, t;
return Object.keys(null !== (t = null === (e = this.statsData) || void 0 === e ? void 0 : e.series) && void 0 !== t ? t : {});
}, e.prototype.getHistory = function(e) {
if (!this.statsData) return [];
var t = this.statsData.history;
return e ? t.slice(-e) : t;
}, e.prototype.getRoomHistory = function(e, t) {
if (!this.statsData) return [];
var r = this.statsData.history.map(function(t) {
return t.rooms.find(function(t) {
return t.roomName === e;
});
}).filter(function(e) {
return void 0 !== e;
});
return t ? r.slice(-t) : r;
}, e.prototype.exportForGraphana = function() {
var e, t, r = this.getLatestStats();
if (!r) return "{}";
var o = {
timestamp: (new Date).toISOString(),
tick: r.tick,
cpu: {
used: r.cpuUsed,
limit: r.cpuLimit,
bucket: r.cpuBucket
},
gcl: {
level: r.gclLevel,
progress: r.gclProgress,
progressTotal: r.gclProgressTotal
},
gpl: {
level: r.gplLevel
},
empire: {
totalCreeps: r.totalCreeps,
totalRooms: r.totalRooms
},
rooms: {}
};
try {
for (var n = a(r.rooms), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
o.rooms[s.roomName] = {
rcl: s.rcl,
energyAvailable: s.energyAvailable,
energyCapacity: s.energyCapacity,
storageEnergy: s.storageEnergy,
terminalEnergy: s.terminalEnergy,
creepCount: s.creepCount,
controllerProgress: s.controllerProgress,
controllerProgressTotal: s.controllerProgressTotal
};
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return JSON.stringify(o, null, 2);
}, e.prototype.clear = function() {
this.statsData = this.createDefaultStatsData(), this.saveToSegment();
}, e.prototype.postureToCode = function(e) {
var t;
return null !== (t = {
eco: 0,
expand: 1,
defensive: 2,
war: 3,
siege: 4,
evacuate: 5,
nukePrep: 6
}[e]) && void 0 !== t ? t : -1;
}, e.prototype.colonyLevelToCode = function(e) {
var t;
return null !== (t = {
seedNest: 1,
foragingExpansion: 2,
matureColony: 3,
fortifiedHive: 4,
empireDominance: 5
}[e]) && void 0 !== t ? t : 0;
}, e;
}(), nn = new on;

function an(e) {
e._metrics || (e._metrics = {
tasksCompleted: 0,
energyTransferred: 0,
energyHarvested: 0,
buildProgress: 0,
repairProgress: 0,
upgradeProgress: 0,
damageDealt: 0,
healingDone: 0
});
}

function sn(e) {
return an(e), e._metrics;
}

function cn(e, t) {
sn(e).damageDealt += t;
}

function ln(e, t, r, o) {
var n = o instanceof Error ? o.message : String(o);
console.log("[SafeFind] WARN: SafeFind error in ".concat(e, "(").concat(String(t), ") at ").concat(r, ": ").concat(n));
}

function un(e, t, r) {
try {
return e.find(t, r);
} catch (r) {
return ln("room.find", t, e.name, r), [];
}
}

function mn(e, t, r) {
try {
return e.findClosestByRange(t, r);
} catch (r) {
return ln("pos.findClosestByRange", t, "".concat(e.roomName, ":").concat(String(e.x), ",").concat(String(e.y)), r), 
null;
}
}

(Xo = {})[FIND_SOURCES] = 5e3, Xo[FIND_MINERALS] = 5e3, Xo[FIND_DEPOSITS] = 100, 
Xo[FIND_STRUCTURES] = 50, Xo[FIND_MY_STRUCTURES] = 50, Xo[FIND_HOSTILE_STRUCTURES] = 20, 
Xo[FIND_MY_SPAWNS] = 100, Xo[FIND_MY_CONSTRUCTION_SITES] = 20, Xo[FIND_CONSTRUCTION_SITES] = 20, 
Xo[FIND_CREEPS] = 5, Xo[FIND_MY_CREEPS] = 5, Xo[FIND_HOSTILE_CREEPS] = 3, Xo[FIND_DROPPED_RESOURCES] = 5, 
Xo[FIND_TOMBSTONES] = 10, Xo[FIND_RUINS] = 10, Xo[FIND_FLAGS] = 50, Xo[FIND_NUKES] = 20, 
Xo[FIND_POWER_CREEPS] = 10, Xo[FIND_MY_POWER_CREEPS] = 10, function(e) {
e[e.CRITICAL = 0] = "CRITICAL", e[e.HIGH = 1] = "HIGH", e[e.MEDIUM = 2] = "MEDIUM", 
e[e.LOW = 3] = "LOW";
}(Zo || (Zo = {}));

var pn, dn = {
bucketThresholds: (Qo = {}, Qo[Zo.CRITICAL] = 0, Qo[Zo.HIGH] = 2e3, Qo[Zo.MEDIUM] = 5e3, 
Qo[Zo.LOW] = 8e3, Qo),
defaultMaxCpu: 5,
logExecution: !1
}, fn = function() {
function e(e) {
var t;
this.tasks = new Map, this.stats = {
totalTasks: 0,
tasksByPriority: (t = {}, t[Zo.CRITICAL] = 0, t[Zo.HIGH] = 0, t[Zo.MEDIUM] = 0, 
t[Zo.LOW] = 0, t),
executedThisTick: 0,
skippedThisTick: 0,
deferredThisTick: 0,
cpuUsed: 0
}, this.config = o(o({}, dn), e);
}
return e.prototype.register = function(e) {
var t, r, n = o(o({}, e), {
lastRun: Game.time - e.interval,
maxCpu: null !== (t = e.maxCpu) && void 0 !== t ? t : this.config.defaultMaxCpu,
skippable: null === (r = e.skippable) || void 0 === r || r
});
this.tasks.set(e.id, n), this.updateStats();
}, e.prototype.unregister = function(e) {
this.tasks.delete(e), this.updateStats();
}, e.prototype.run = function(e) {
var t, r, n, i = Game.cpu.getUsed(), s = Game.cpu.bucket, c = null != e ? e : 1 / 0;
this.stats.executedThisTick = 0, this.stats.skippedThisTick = 0, this.stats.deferredThisTick = 0;
var l = Array.from(this.tasks.values()).sort(function(e, t) {
return e.priority - t.priority;
}), u = 0;
try {
for (var m = a(l), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (!(Game.time - d.lastRun < d.interval)) {
if (d.priority !== Zo.CRITICAL && s < this.config.bucketThresholds[d.priority]) {
this.stats.skippedThisTick++;
continue;
}
var f = null !== (n = d.maxCpu) && void 0 !== n ? n : this.config.defaultMaxCpu;
if (u + f > c && d.skippable) this.stats.deferredThisTick++; else {
var y = Game.cpu.getUsed();
try {
d.execute(), d.lastRun = Game.time, this.stats.executedThisTick++;
var g = Game.cpu.getUsed() - y;
u += g, g > f && console.log("[Scheduler] WARN: Task ".concat(d.id, " exceeded CPU budget: ").concat(g.toFixed(2), " > ").concat(f));
} catch (e) {
console.log("[Scheduler] ERROR: Error executing task ".concat(d.id, ": ").concat(String(e))), 
d.lastRun = Game.time;
}
if (u > c) break;
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
p && !p.done && (r = m.return) && r.call(m);
} finally {
if (t) throw t.error;
}
}
return this.stats.cpuUsed = Game.cpu.getUsed() - i, o({}, this.stats);
}, e.prototype.forceRun = function(e) {
var t = this.tasks.get(e);
if (!t) return !1;
try {
return t.execute(), t.lastRun = Game.time, !0;
} catch (t) {
return console.log("[Scheduler] ERROR: Error force-executing task ".concat(e, ": ").concat(String(t))), 
!1;
}
}, e.prototype.resetTask = function(e) {
var t = this.tasks.get(e);
t && (t.lastRun = Game.time - t.interval);
}, e.prototype.getStats = function() {
return o({}, this.stats);
}, e.prototype.getTasks = function() {
return Array.from(this.tasks.values());
}, e.prototype.hasTask = function(e) {
return this.tasks.has(e);
}, e.prototype.clear = function() {
this.tasks.clear(), this.updateStats();
}, e.prototype.updateStats = function() {
var e, t, r;
this.stats.totalTasks = this.tasks.size, this.stats.tasksByPriority = ((e = {})[Zo.CRITICAL] = 0, 
e[Zo.HIGH] = 0, e[Zo.MEDIUM] = 0, e[Zo.LOW] = 0, e);
try {
for (var o = a(this.tasks.values()), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
this.stats.tasksByPriority[i.priority]++;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
n && !n.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
}, e;
}(), yn = ((pn = global)._computationScheduler || (pn._computationScheduler = new fn), 
pn._computationScheduler), gn = new Map;

function hn(e) {
var t = gn.get(e);
return t && t.tick === Game.time || (t = {
assignments: new Map,
tick: Game.time
}, gn.set(e, t)), t;
}

function vn(e, t, r) {
var o, n;
if (0 === t.length) return null;
if (1 === t.length) return Rn(e, t[0], r), t[0];
var i = hn(e.room.name), s = null, c = 1 / 0, l = 1 / 0;
try {
for (var u = a(t), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = "".concat(r, ":").concat(p.id), f = (i.assignments.get(d) || []).length, y = e.pos.getRangeTo(p.pos);
(f < c || f === c && y < l) && (s = p, c = f, l = y);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
m && !m.done && (n = u.return) && n.call(u);
} finally {
if (o) throw o.error;
}
}
return s && Rn(e, s, r), s;
}

function Rn(e, t, r) {
var o = hn(e.room.name), n = "".concat(r, ":").concat(t.id), a = o.assignments.get(n) || [];
a.includes(e.name) || (a.push(e.name), o.assignments.set(n, a));
}

var En = {
red: "#ef9a9a",
green: "#6b9955",
yellow: "#c5c599",
blue: "#8dc5e3"
};

function Tn(e, t, r) {
void 0 === t && (t = null), void 0 === r && (r = !1);
var o = t ? "color: ".concat(En[t], ";") : "";
return '<text style="'.concat([ o, r ? "font-weight: bolder;" : "" ].join(" "), '">').concat(e, "</text>");
}

var Cn = {
customStyle: function() {
return "<style>\n      input {\n        background-color: #2b2b2b;\n        border: none;\n        border-bottom: 1px solid #888;\n        padding: 3px;\n        color: #ccc;\n      }\n      select {\n        border: none;\n        background-color: #2b2b2b;\n        color: #ccc;\n      }\n      button {\n        border: 1px solid #888;\n        cursor: pointer;\n        background-color: #2b2b2b;\n        color: #ccc;\n      }\n    </style>".replace(/\n/g, "");
},
input: function(e) {
return "".concat(e.label || "", ' <input name="').concat(e.name, '" placeholder="').concat(e.placeholder || "", '"/>');
},
select: function(e) {
var t = [ "".concat(e.label || "", ' <select name="').concat(e.name, '">') ];
return t.push.apply(t, s([], i(e.options.map(function(e) {
return ' <option value="'.concat(e.value, '">').concat(e.label, "</option>");
})), !1)), t.push("</select>"), t.join("");
},
button: function(e) {
return '<button onclick="'.concat((t = e.command, "angular.element(document.body).injector().get('Console').sendCommand('(".concat(t, ")()', 1)")), '">').concat(e.content, "</button>");
var t;
},
form: function(e, t, r) {
var o = this, n = e + Game.time.toString(), a = [ this.customStyle(), "<form name='".concat(n, "'>") ];
a.push.apply(a, s([], i(t.map(function(e) {
switch (e.type) {
case "input":
return o.input(e) + "    ";

case "select":
return o.select(e) + "    ";
}
})), !1));
var c = "(() => {\n      const form = document.forms['".concat(n, "']\n      let formDatas = {}\n      [").concat(t.map(function(e) {
return "'".concat(e.name, "'");
}).toString(), "].map(eleName => formDatas[eleName] = form[eleName].value)\n      angular.element(document.body).injector().get('Console').sendCommand(`(").concat(r.command, ")(${JSON.stringify(formDatas)})`, 1)\n    })()");
return a.push('<button type="button" onclick="'.concat(c.replace(/\n/g, ";"), '">').concat(r.content, "</button>")), 
a.push("</form>"), a.join("");
}
};

function Sn() {
for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
return wn() + Un() + '<div class="module-help">'.concat(e.map(On).join(""), "</div>");
}

var _n, On = function(e) {
var t = e.api.map(bn).join("");
return '<div class="module-container">\n    <div class="module-info">\n      <span class="module-title">'.concat(Tn(e.name, "yellow"), '</span>\n      <span class="module-describe">').concat(Tn(e.describe, "green"), '</span>\n    </div>\n    <div class="module-api-list">').concat(t, "</div>\n  </div>").replace(/\n/g, "");
}, bn = function(e) {
var t = [];
e.describe && t.push(Tn(e.describe, "green")), e.params && t.push(e.params.map(function(e) {
return "  - ".concat(Tn(e.name, "blue"), ": ").concat(Tn(e.desc, "green"));
}).map(function(e) {
return '<div class="api-content-line">'.concat(e, "</div>");
}).join(""));
var r = e.params ? e.params.map(function(e) {
return Tn(e.name, "blue");
}).join(", ") : "", o = Tn(e.functionName, "yellow") + (e.commandType ? "" : "(".concat(r, ")"));
t.push(o);
var n = t.map(function(e) {
return '<div class="api-content-line">'.concat(e, "</div>");
}).join(""), a = "".concat(e.functionName).concat(Game.time);
return '\n  <div class="api-container">\n    <label for="'.concat(a, '">').concat(e.title, " ").concat(Tn(e.functionName, "yellow", !0), '</label>\n    <input id="').concat(a, '" type="checkbox" />\n    <div class="api-content">').concat(n, "</div>\n  </div>\n  ").replace(/\n/g, "");
}, wn = function() {
return "\n  <style>\n  .module-help {\n    display: flex;\n    flex-flow: column nowrap;\n  }\n  .module-container {\n    padding: 0px 10px 10px 10px;\n    display: flex;\n    flex-flow: column nowrap;\n  }\n  .module-info {\n    margin: 5px;\n    display: flex;\n    flex-flow: row nowrap;\n    align-items: baseline;\n  }\n  .module-title {\n    font-size: 19px;\n    font-weight: bolder;\n    margin-left: -15px;\n  }\n  .module-api-list {\n    display: flex;\n    flex-flow: row wrap;\n  }\n  </style>".replace(/\n/g, "");
}, Un = function() {
return "\n  <style>\n  .api-content-line {\n    width: max-content;\n    padding-right: 15px;\n  }\n  .api-container {\n    margin: 5px;\n    width: 250px;\n    background-color: #2b2b2b;\n    overflow: hidden;\n    display: flex;\n    flex-flow: column;\n  }\n\n  .api-container label {\n    transition: all 0.1s;\n    min-width: 300px;\n  }\n\n  /* Hide checkbox */\n  .api-container input {\n    display: none;\n  }\n\n  .api-container label {\n    cursor: pointer;\n    display: block;\n    padding: 10px;\n    background-color: #3b3b3b;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n\n  .api-container label:hover, label:focus {\n    background-color: #525252;\n  }\n\n  /* Collapsed state */\n  .api-container input + .api-content {\n    overflow: hidden;\n    transition: all 0.1s;\n    width: auto;\n    max-height: 0px;\n    padding: 0px 10px;\n  }\n\n  /* Expanded state when checkbox is checked */\n  .api-container input:checked + .api-content {\n    max-height: 200px;\n    padding: 10px;\n    background-color: #1c1c1c;\n    overflow-x: auto;\n  }\n  </style>".replace(/\n/g, "");
}, xn = xe("CreepContext"), An = ((_n = {})[STRUCTURE_SPAWN] = 100, _n[STRUCTURE_EXTENSION] = 90, 
_n[STRUCTURE_TOWER] = 80, _n[STRUCTURE_RAMPART] = 75, _n[STRUCTURE_WALL] = 70, _n[STRUCTURE_STORAGE] = 70, 
_n[STRUCTURE_CONTAINER] = 60, _n[STRUCTURE_ROAD] = 30, _n), Mn = new Map;

function kn(e) {
e._allStructuresLoaded || (e.allStructures = e.room.find(FIND_STRUCTURES), e._allStructuresLoaded = !0);
}

function Nn(e) {
return void 0 === e._prioritizedSites && (e._prioritizedSites = e.room.find(FIND_MY_CONSTRUCTION_SITES).sort(function(e, t) {
var r, o, n = null !== (r = An[e.structureType]) && void 0 !== r ? r : 50;
return (null !== (o = An[t.structureType]) && void 0 !== o ? o : 50) - n;
})), e._prioritizedSites;
}

function In(e) {
return void 0 === e._repairTargets && (kn(e), e._repairTargets = e.allStructures.filter(function(e) {
return e.hits < .75 * e.hitsMax && e.structureType !== STRUCTURE_WALL;
})), e._repairTargets;
}

function Pn(e) {
var t, r, o = e.room, n = e.memory, i = function(e) {
var t = Mn.get(e.name);
if (t && t.tick === Game.time) return t;
var r = {
tick: Game.time,
room: e,
hostiles: un(e, FIND_HOSTILE_CREEPS),
myStructures: e.find(FIND_MY_STRUCTURES),
allStructures: []
};
return Mn.set(e.name, r), r;
}(o);
void 0 === n.working && (n.working = e.store.getUsedCapacity() > 0, xn.debug("".concat(e.name, " initialized working=").concat(n.working, " from carry state"), {
creep: e.name
}));
var s = null !== (t = n.homeRoom) && void 0 !== t ? t : o.name;
return {
creep: e,
room: o,
memory: n,
get swarmState() {
return function(e) {
var t, r = null === (t = Memory.rooms) || void 0 === t ? void 0 : t[e];
return null == r ? void 0 : r.swarm;
}(o.name);
},
get squadMemory() {
return function(e) {
if (e) {
var t = Memory.squads;
return null == t ? void 0 : t[e];
}
}(n.squadId);
},
homeRoom: s,
isInHomeRoom: o.name === s,
isFull: 0 === e.store.getFreeCapacity(),
isEmpty: 0 === e.store.getUsedCapacity(),
isWorking: null !== (r = n.working) && void 0 !== r && r,
get assignedSource() {
return function(e) {
return e.sourceId ? Game.getObjectById(e.sourceId) : null;
}(n);
},
get assignedMineral() {
var e, t;
return null !== (e = (void 0 === (t = i)._minerals && (t._minerals = t.room.find(FIND_MINERALS)), 
t._minerals)[0]) && void 0 !== e ? e : null;
},
get energyAvailable() {
return (e = i, void 0 === e._activeSources && (e._activeSources = e.room.find(FIND_SOURCES_ACTIVE)), 
e._activeSources).length > 0;
var e;
},
get nearbyEnemies() {
return i.hostiles.length > 0 && function(e, t) {
var r, o;
try {
for (var n = a(t), i = n.next(); !i.done; i = n.next()) {
var s = i.value, c = Math.abs(e.x - s.pos.x), l = Math.abs(e.y - s.pos.y);
if (Math.max(c, l) <= 10) return !0;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
i && !i.done && (o = n.return) && o.call(n);
} finally {
if (r) throw r.error;
}
}
return !1;
}(e.pos, i.hostiles);
},
get constructionSiteCount() {
return Nn(i).length;
},
get damagedStructureCount() {
return In(i).length;
},
get droppedResources() {
return void 0 === (e = i)._droppedResources && (e._droppedResources = e.room.find(FIND_DROPPED_RESOURCES, {
filter: function(e) {
return e.resourceType === RESOURCE_ENERGY && e.amount > 50 || e.resourceType !== RESOURCE_ENERGY && e.amount > 0;
}
})), e._droppedResources;
var e;
},
get containers() {
return void 0 === (e = i)._containers && (kn(e), e._containers = e.allStructures.filter(function(e) {
return e.structureType === STRUCTURE_CONTAINER;
})), e._containers;
var e;
},
get depositContainers() {
return void 0 === (e = i)._depositContainers && (kn(e), e._depositContainers = e.allStructures.filter(function(e) {
return e.structureType === STRUCTURE_CONTAINER;
})), e._depositContainers;
var e;
},
get spawnStructures() {
return void 0 === (e = i)._spawnStructures && (e._spawnStructures = e.myStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_EXTENSION;
})), e._spawnStructures;
var e;
},
get towers() {
return void 0 === (e = i)._towers && (e._towers = e.myStructures.filter(function(e) {
return e.structureType === STRUCTURE_TOWER;
})), e._towers;
var e;
},
storage: o.storage,
terminal: o.terminal,
hostiles: i.hostiles,
get damagedAllies() {
return void 0 === (e = i)._damagedAllies && (e._damagedAllies = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
return e.hits < e.hitsMax;
}
})), e._damagedAllies;
var e;
},
get prioritizedSites() {
return Nn(i);
},
get repairTargets() {
return In(i);
},
get labs() {
return void 0 === (e = i)._labs && (e._labs = e.myStructures.filter(function(e) {
return e.structureType === STRUCTURE_LAB;
})), e._labs;
var e;
},
get factory() {
return (e = i)._factoryChecked || (e._factory = e.myStructures.find(function(e) {
return e.structureType === STRUCTURE_FACTORY;
}), e._factoryChecked = !0), e._factory;
var e;
},
get tombstones() {
return void 0 === (e = i)._tombstones && (e._tombstones = e.room.find(FIND_TOMBSTONES)), 
e._tombstones;
var e;
},
get mineralContainers() {
return void 0 === (e = i)._mineralContainers && (e._mineralContainers = e.room.find(FIND_STRUCTURES, {
filter: function(e) {
if (e.structureType !== STRUCTURE_CONTAINER) return !1;
var t = e;
return Object.keys(t.store).some(function(e) {
return e !== RESOURCE_ENERGY && t.store.getUsedCapacity(e) > 0;
});
}
})), e._mineralContainers;
var e;
}
};
}

var Gn, Ln = {}, Dn = function() {
if (Gn) return Ln;
Gn = 1, Object.defineProperty(Ln, "__esModule", {
value: !0
});
var e = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : void 0 !== f ? f : "undefined" != typeof self ? self : {}, t = function(e) {
return e && e.Math === Math && e;
}, r = t("object" == typeof globalThis && globalThis) || t("object" == typeof window && window) || t("object" == typeof self && self) || t("object" == typeof e && e) || t("object" == typeof e && e) || function() {
return this;
}() || Function("return this")(), o = {}, n = function(e) {
try {
return !!e();
} catch (e) {
return !0;
}
}, a = !n(function() {
return 7 !== Object.defineProperty({}, 1, {
get: function() {
return 7;
}
})[1];
}), i = !n(function() {
var e = function() {}.bind();
return "function" != typeof e || e.hasOwnProperty("prototype");
}), s = i, c = Function.prototype.call, l = s ? c.bind(c) : function() {
return c.apply(c, arguments);
}, u = {}, m = {}.propertyIsEnumerable, p = Object.getOwnPropertyDescriptor, d = p && !m.call({
1: 2
}, 1);
u.f = d ? function(e) {
var t = p(this, e);
return !!t && t.enumerable;
} : m;
var y, g, h = function(e, t) {
return {
enumerable: !(1 & e),
configurable: !(2 & e),
writable: !(4 & e),
value: t
};
}, v = i, R = Function.prototype, E = R.call, T = v && R.bind.bind(E, E), C = v ? T : function(e) {
return function() {
return E.apply(e, arguments);
};
}, S = C, _ = S({}.toString), O = S("".slice), b = function(e) {
return O(_(e), 8, -1);
}, w = n, U = b, x = Object, A = C("".split), M = w(function() {
return !x("z").propertyIsEnumerable(0);
}) ? function(e) {
return "String" === U(e) ? A(e, "") : x(e);
} : x, k = function(e) {
return null == e;
}, N = k, I = TypeError, P = function(e) {
if (N(e)) throw new I("Can't call method on " + e);
return e;
}, G = M, L = P, D = function(e) {
return G(L(e));
}, F = "object" == typeof document && document.all, B = void 0 === F && void 0 !== F ? function(e) {
return "function" == typeof e || e === F;
} : function(e) {
return "function" == typeof e;
}, H = B, W = function(e) {
return "object" == typeof e ? null !== e : H(e);
}, Y = r, K = B, V = function(e, t) {
return arguments.length < 2 ? (r = Y[e], K(r) ? r : void 0) : Y[e] && Y[e][t];
var r;
}, q = C({}.isPrototypeOf), j = r.navigator, z = j && j.userAgent, X = r, Q = z ? String(z) : "", Z = X.process, J = X.Deno, $ = Z && Z.versions || J && J.version, ee = $ && $.v8;
ee && (g = (y = ee.split("."))[0] > 0 && y[0] < 4 ? 1 : +(y[0] + y[1])), !g && Q && (!(y = Q.match(/Edge\/(\d+)/)) || y[1] >= 74) && (y = Q.match(/Chrome\/(\d+)/)) && (g = +y[1]);
var te = g, re = n, oe = r.String, ne = !!Object.getOwnPropertySymbols && !re(function() {
var e = Symbol("symbol detection");
return !oe(e) || !(Object(e) instanceof Symbol) || !Symbol.sham && te && te < 41;
}), ae = ne && !Symbol.sham && "symbol" == typeof Symbol.iterator, ie = V, se = B, ce = q, le = Object, ue = ae ? function(e) {
return "symbol" == typeof e;
} : function(e) {
var t = ie("Symbol");
return se(t) && ce(t.prototype, le(e));
}, me = String, pe = B, de = TypeError, fe = function(e) {
if (pe(e)) return e;
throw new de(function(e) {
try {
return me(e);
} catch (e) {
return "Object";
}
}(e) + " is not a function");
}, ye = fe, ge = k, he = l, ve = B, Re = W, Ee = TypeError, Te = {
exports: {}
}, Ce = r, Se = Object.defineProperty, _e = function(e, t) {
try {
Se(Ce, e, {
value: t,
configurable: !0,
writable: !0
});
} catch (r) {
Ce[e] = t;
}
return t;
}, Oe = r, be = _e, we = "__core-js_shared__", Ue = Te.exports = Oe[we] || be(we, {});
(Ue.versions || (Ue.versions = [])).push({
version: "3.42.0",
mode: "global",
copyright: "© 2014-2025 Denis Pushkarev (zloirock.ru)",
license: "https://github.com/zloirock/core-js/blob/v3.42.0/LICENSE",
source: "https://github.com/zloirock/core-js"
});
var xe = Te.exports, Ae = xe, Me = function(e, t) {
return Ae[e] || (Ae[e] = t || {});
}, ke = P, Ne = Object, Ie = function(e) {
return Ne(ke(e));
}, Pe = Ie, Ge = C({}.hasOwnProperty), Le = Object.hasOwn || function(e, t) {
return Ge(Pe(e), t);
}, De = C, Fe = 0, Be = Math.random(), He = De(1..toString), We = function(e) {
return "Symbol(" + (void 0 === e ? "" : e) + ")_" + He(++Fe + Be, 36);
}, Ye = Me, Ke = Le, Ve = We, qe = ne, je = ae, ze = r.Symbol, Xe = Ye("wks"), Qe = je ? ze.for || ze : ze && ze.withoutSetter || Ve, Ze = function(e) {
return Ke(Xe, e) || (Xe[e] = qe && Ke(ze, e) ? ze[e] : Qe("Symbol." + e)), Xe[e];
}, Je = l, $e = W, et = ue, tt = TypeError, rt = Ze("toPrimitive"), ot = ue, nt = function(e) {
var t = function(e, t) {
if (!$e(e) || et(e)) return e;
var r, o, n = (o = e[rt], ge(o) ? void 0 : ye(o));
if (n) {
if (void 0 === t && (t = "default"), r = Je(n, e, t), !$e(r) || et(r)) return r;
throw new tt("Can't convert object to primitive value");
}
return void 0 === t && (t = "number"), function(e, t) {
var r, o;
if ("string" === t && ve(r = e.toString) && !Re(o = he(r, e))) return o;
if (ve(r = e.valueOf) && !Re(o = he(r, e))) return o;
if ("string" !== t && ve(r = e.toString) && !Re(o = he(r, e))) return o;
throw new Ee("Can't convert object to primitive value");
}(e, t);
}(e, "string");
return ot(t) ? t : t + "";
}, at = W, it = r.document, st = at(it) && at(it.createElement), ct = function(e) {
return st ? it.createElement(e) : {};
}, lt = ct, ut = !a && !n(function() {
return 7 !== Object.defineProperty(lt("div"), "a", {
get: function() {
return 7;
}
}).a;
}), mt = a, pt = l, dt = u, ft = h, yt = D, gt = nt, ht = Le, vt = ut, Rt = Object.getOwnPropertyDescriptor;
o.f = mt ? Rt : function(e, t) {
if (e = yt(e), t = gt(t), vt) try {
return Rt(e, t);
} catch (e) {}
if (ht(e, t)) return ft(!pt(dt.f, e, t), e[t]);
};
var Et = {}, Tt = a && n(function() {
return 42 !== Object.defineProperty(function() {}, "prototype", {
value: 42,
writable: !1
}).prototype;
}), Ct = W, St = String, _t = TypeError, Ot = function(e) {
if (Ct(e)) return e;
throw new _t(St(e) + " is not an object");
}, bt = a, wt = ut, Ut = Tt, xt = Ot, At = nt, Mt = TypeError, kt = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, It = "enumerable", Pt = "configurable", Gt = "writable";
Et.f = bt ? Ut ? function(e, t, r) {
if (xt(e), t = At(t), xt(r), "function" == typeof e && "prototype" === t && "value" in r && Gt in r && !r[Gt]) {
var o = Nt(e, t);
o && o[Gt] && (e[t] = r.value, r = {
configurable: Pt in r ? r[Pt] : o[Pt],
enumerable: It in r ? r[It] : o[It],
writable: !1
});
}
return kt(e, t, r);
} : kt : function(e, t, r) {
if (xt(e), t = At(t), xt(r), wt) try {
return kt(e, t, r);
} catch (e) {}
if ("get" in r || "set" in r) throw new Mt("Accessors not supported");
return "value" in r && (e[t] = r.value), e;
};
var Lt = Et, Dt = h, Ft = a ? function(e, t, r) {
return Lt.f(e, t, Dt(1, r));
} : function(e, t, r) {
return e[t] = r, e;
}, Bt = {
exports: {}
}, Ht = a, Wt = Le, Yt = Function.prototype, Kt = Ht && Object.getOwnPropertyDescriptor, Vt = {
CONFIGURABLE: Wt(Yt, "name") && (!Ht || Ht && Kt(Yt, "name").configurable)
}, qt = B, jt = xe, zt = C(Function.toString);
qt(jt.inspectSource) || (jt.inspectSource = function(e) {
return zt(e);
});
var Xt, Qt, Zt, Jt = jt.inspectSource, $t = B, er = r.WeakMap, tr = $t(er) && /native code/.test(String(er)), rr = We, or = Me("keys"), nr = function(e) {
return or[e] || (or[e] = rr(e));
}, ar = {}, ir = tr, sr = r, cr = Ft, lr = Le, ur = xe, mr = nr, pr = ar, dr = "Object already initialized", fr = sr.TypeError, yr = sr.WeakMap;
if (ir || ur.state) {
var gr = ur.state || (ur.state = new yr);
gr.get = gr.get, gr.has = gr.has, gr.set = gr.set, Xt = function(e, t) {
if (gr.has(e)) throw new fr(dr);
return t.facade = e, gr.set(e, t), t;
}, Qt = function(e) {
return gr.get(e) || {};
}, Zt = function(e) {
return gr.has(e);
};
} else {
var hr = mr("state");
pr[hr] = !0, Xt = function(e, t) {
if (lr(e, hr)) throw new fr(dr);
return t.facade = e, cr(e, hr, t), t;
}, Qt = function(e) {
return lr(e, hr) ? e[hr] : {};
}, Zt = function(e) {
return lr(e, hr);
};
}
var vr = {
get: Qt,
enforce: function(e) {
return Zt(e) ? Qt(e) : Xt(e, {});
}
}, Rr = C, Er = n, Tr = B, Cr = Le, Sr = a, _r = Vt.CONFIGURABLE, Or = Jt, br = vr.enforce, wr = vr.get, Ur = String, xr = Object.defineProperty, Ar = Rr("".slice), Mr = Rr("".replace), kr = Rr([].join), Nr = Sr && !Er(function() {
return 8 !== xr(function() {}, "length", {
value: 8
}).length;
}), Ir = String(String).split("String"), Pr = Bt.exports = function(e, t, r) {
"Symbol(" === Ar(Ur(t), 0, 7) && (t = "[" + Mr(Ur(t), /^Symbol\(([^)]*)\).*$/, "$1") + "]"), 
r && r.getter && (t = "get " + t), r && r.setter && (t = "set " + t), (!Cr(e, "name") || _r && e.name !== t) && (Sr ? xr(e, "name", {
value: t,
configurable: !0
}) : e.name = t), Nr && r && Cr(r, "arity") && e.length !== r.arity && xr(e, "length", {
value: r.arity
});
try {
r && Cr(r, "constructor") && r.constructor ? Sr && xr(e, "prototype", {
writable: !1
}) : e.prototype && (e.prototype = void 0);
} catch (e) {}
var o = br(e);
return Cr(o, "source") || (o.source = kr(Ir, "string" == typeof t ? t : "")), e;
};
Function.prototype.toString = Pr(function() {
return Tr(this) && wr(this).source || Or(this);
}, "toString");
var Gr = Bt.exports, Lr = B, Dr = Et, Fr = Gr, Br = _e, Hr = {}, Wr = Math.ceil, Yr = Math.floor, Kr = Math.trunc || function(e) {
var t = +e;
return (t > 0 ? Yr : Wr)(t);
}, Vr = function(e) {
var t = +e;
return t != t || 0 === t ? 0 : Kr(t);
}, qr = Vr, jr = Math.max, zr = Math.min, Xr = Vr, Qr = Math.min, Zr = function(e) {
return t = e.length, (r = Xr(t)) > 0 ? Qr(r, 9007199254740991) : 0;
var t, r;
}, Jr = D, $r = Zr, eo = {
indexOf: function(e, t, r) {
var o = Jr(e), n = $r(o);
if (0 === n) return -1;
for (var a = function(e, t) {
var r = qr(e);
return r < 0 ? jr(r + t, 0) : zr(r, t);
}(r, n); n > a; a++) if (a in o && o[a] === t) return a || 0;
return -1;
}
}, to = Le, ro = D, oo = eo.indexOf, no = ar, ao = C([].push), io = function(e, t) {
var r, o = ro(e), n = 0, a = [];
for (r in o) !to(no, r) && to(o, r) && ao(a, r);
for (;t.length > n; ) to(o, r = t[n++]) && (~oo(a, r) || ao(a, r));
return a;
}, so = [ "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf" ], co = io, lo = so.concat("length", "prototype");
Hr.f = Object.getOwnPropertyNames || function(e) {
return co(e, lo);
};
var uo = {};
uo.f = Object.getOwnPropertySymbols;
var mo = V, po = Hr, fo = uo, yo = Ot, go = C([].concat), ho = mo("Reflect", "ownKeys") || function(e) {
var t = po.f(yo(e)), r = fo.f;
return r ? go(t, r(e)) : t;
}, vo = Le, Ro = ho, Eo = o, To = Et, Co = n, So = B, _o = /#|\.prototype\./, Oo = function(e, t) {
var r = wo[bo(e)];
return r === xo || r !== Uo && (So(t) ? Co(t) : !!t);
}, bo = Oo.normalize = function(e) {
return String(e).replace(_o, ".").toLowerCase();
}, wo = Oo.data = {}, Uo = Oo.NATIVE = "N", xo = Oo.POLYFILL = "P", Ao = Oo, Mo = r, ko = o.f, No = Ft, Io = function(e, t, r, o) {
o || (o = {});
var n = o.enumerable, a = void 0 !== o.name ? o.name : t;
if (Lr(r) && Fr(r, a, o), o.global) n ? e[t] = r : Br(t, r); else {
try {
o.unsafe ? e[t] && (n = !0) : delete e[t];
} catch (e) {}
n ? e[t] = r : Dr.f(e, t, {
value: r,
enumerable: !1,
configurable: !o.nonConfigurable,
writable: !o.nonWritable
});
}
return e;
}, Po = _e, Go = function(e, t, r) {
for (var o = Ro(t), n = To.f, a = Eo.f, i = 0; i < o.length; i++) {
var s = o[i];
vo(e, s) || r && vo(r, s) || n(e, s, a(t, s));
}
}, Lo = Ao, Do = function(e, t) {
var r, o, n, a, i, s = e.target, c = e.global, l = e.stat;
if (r = c ? Mo : l ? Mo[s] || Po(s, {}) : Mo[s] && Mo[s].prototype) for (o in t) {
if (a = t[o], n = e.dontCallGetSet ? (i = ko(r, o)) && i.value : r[o], !Lo(c ? o : s + (l ? "." : "#") + o, e.forced) && void 0 !== n) {
if (typeof a == typeof n) continue;
Go(a, n);
}
(e.sham || n && n.sham) && No(a, "sham", !0), Io(r, o, a, e);
}
}, Fo = b, Bo = Array.isArray || function(e) {
return "Array" === Fo(e);
}, Ho = TypeError, Wo = b, Yo = C, Ko = function(e) {
if ("Function" === Wo(e)) return Yo(e);
}, Vo = fe, qo = i, jo = Ko(Ko.bind), zo = Bo, Xo = Zr, Qo = function(e) {
if (e > 9007199254740991) throw Ho("Maximum allowed index exceeded");
return e;
}, Zo = function(e, t, r, o, n, a, i, s) {
for (var c, l, u = n, m = 0, p = !!i && function(e, t) {
return Vo(e), void 0 === t ? e : qo ? jo(e, t) : function() {
return e.apply(t, arguments);
};
}(i, s); m < o; ) m in r && (c = p ? p(r[m], m, t) : r[m], a > 0 && zo(c) ? (l = Xo(c), 
u = Zo(e, t, c, l, u, a - 1) - 1) : (Qo(u + 1), e[u] = c), u++), m++;
return u;
}, Jo = Zo, $o = {};
$o[Ze("toStringTag")] = "z";
var en = "[object z]" === String($o), tn = B, rn = b, on = Ze("toStringTag"), nn = Object, an = "Arguments" === rn(function() {
return arguments;
}()), sn = C, cn = n, ln = B, un = en ? rn : function(e) {
var t, r, o;
return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (r = function(e, t) {
try {
return e[t];
} catch (e) {}
}(t = nn(e), on)) ? r : an ? rn(t) : "Object" === (o = rn(t)) && tn(t.callee) ? "Arguments" : o;
}, mn = Jt, pn = function() {}, dn = V("Reflect", "construct"), fn = /^\s*(?:class|function)\b/, yn = sn(fn.exec), gn = !fn.test(pn), hn = function(e) {
if (!ln(e)) return !1;
try {
return dn(pn, [], e), !0;
} catch (e) {
return !1;
}
}, vn = function(e) {
if (!ln(e)) return !1;
switch (un(e)) {
case "AsyncFunction":
case "GeneratorFunction":
case "AsyncGeneratorFunction":
return !1;
}
try {
return gn || !!yn(fn, mn(e));
} catch (e) {
return !0;
}
};
vn.sham = !0;
var Rn = !dn || cn(function() {
var e;
return hn(hn.call) || !hn(Object) || !hn(function() {
e = !0;
}) || e;
}) ? vn : hn, En = Bo, Tn = Rn, Cn = W, Sn = Ze("species"), _n = Array, On = function(e, t) {
return new (function(e) {
var t;
return En(e) && (t = e.constructor, (Tn(t) && (t === _n || En(t.prototype)) || Cn(t) && null === (t = t[Sn])) && (t = void 0)), 
void 0 === t ? _n : t;
}(e))(0 === t ? 0 : t);
}, bn = Jo, wn = fe, Un = Ie, xn = Zr, An = On;
Do({
target: "Array",
proto: !0
}, {
flatMap: function(e) {
var t, r = Un(this), o = xn(r);
return wn(e), (t = An(r, 0)).length = bn(t, r, r, o, 0, 1, e, arguments.length > 1 ? arguments[1] : void 0), 
t;
}
});
var Mn = {}, kn = io, Nn = so, In = Object.keys || function(e) {
return kn(e, Nn);
}, Pn = a, Dn = Tt, Fn = Et, Bn = Ot, Hn = D, Wn = In;
Mn.f = Pn && !Dn ? Object.defineProperties : function(e, t) {
Bn(e);
for (var r, o = Hn(t), n = Wn(t), a = n.length, i = 0; a > i; ) Fn.f(e, r = n[i++], o[r]);
return e;
};
var Yn, Kn = V("document", "documentElement"), Vn = Ot, qn = Mn, jn = so, zn = ar, Xn = Kn, Qn = ct, Zn = "prototype", Jn = "script", $n = nr("IE_PROTO"), ea = function() {}, ta = function(e) {
return "<" + Jn + ">" + e + "</" + Jn + ">";
}, ra = function(e) {
e.write(ta("")), e.close();
var t = e.parentWindow.Object;
return e = null, t;
}, oa = function() {
try {
Yn = new ActiveXObject("htmlfile");
} catch (e) {}
var e, t, r;
oa = "undefined" != typeof document ? document.domain && Yn ? ra(Yn) : (t = Qn("iframe"), 
r = "java" + Jn + ":", t.style.display = "none", Xn.appendChild(t), t.src = String(r), 
(e = t.contentWindow.document).open(), e.write(ta("document.F=Object")), e.close(), 
e.F) : ra(Yn);
for (var o = jn.length; o--; ) delete oa[Zn][jn[o]];
return oa();
};
zn[$n] = !0;
var na = Ze, aa = Object.create || function(e, t) {
var r;
return null !== e ? (ea[Zn] = Vn(e), r = new ea, ea[Zn] = null, r[$n] = e) : r = oa(), 
void 0 === t ? r : qn.f(r, t);
}, ia = Et.f, sa = na("unscopables"), ca = Array.prototype;
void 0 === ca[sa] && ia(ca, sa, {
configurable: !0,
value: aa(null)
});
var la = function(e) {
ca[sa][e] = !0;
};
la("flatMap");
var ua = r, ma = C, pa = function(e, t) {
return ma(ua[e].prototype[t]);
};
pa("Array", "flatMap");
var da = Jo, fa = Ie, ya = Zr, ga = Vr, ha = On;
Do({
target: "Array",
proto: !0
}, {
flat: function() {
var e = arguments.length ? arguments[0] : void 0, t = fa(this), r = ya(t), o = ha(t, 0);
return o.length = da(o, t, t, r, 0, void 0 === e ? 1 : ga(e)), o;
}
}), la("flat"), pa("Array", "flat");
const va = {
DEFAULT_MOVE_OPTS: {
avoidCreeps: !1,
avoidObstacleStructures: !0,
avoidSourceKeepers: !0,
keepTargetInRoom: !0,
repathIfStuck: 3,
roadCost: 1,
plainCost: 2,
swampCost: 10,
priority: 1,
defaultRoomCost: 2,
highwayRoomCost: 1,
sourceKeeperRoomCost: 2,
maxRooms: 64,
maxOps: 1e5,
maxOpsPerRoom: 2e3
},
DEFAULT_VISUALIZE_OPTS: {
fill: "transparent",
stroke: "#fff",
lineStyle: "dashed",
strokeWidth: .15,
opacity: .1
},
MEMORY_CACHE_PATH: "_cg",
MEMORY_CACHE_EXPIRATION_PATH: "_cge",
MEMORY_PORTAL_PATH: "_cgp"
}, Ra = new Map, Ea = new Map, Ta = {
set(e, t, r) {
Ra.set(e, t), void 0 !== r && Ea.set(e, r);
},
get: e => Ra.get(e),
expires: e => Ea.get(e),
delete(e) {
Ra.delete(e);
},
with: () => Ta,
clean() {
for (const [e, t] of Ea) Game.time >= t && (Ta.delete(e), Ea.delete(e));
}
};
var Ca = (() => {
const e = 15, t = [ 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216, 33554432, 67108864, 134217728, 268435456, 536870912, 1073741824, 2147483648, 4294967296, 8589934592, 17179869184, 34359738368, 68719476736, 137438953472, 274877906944, 549755813888, 1099511627776, 2199023255552, 4398046511104, 8796093022208, 17592186044416, 35184372088832, 70368744177664, 0x800000000000, 281474976710656, 562949953421312, 0x4000000000000, 0x8000000000000, 4503599627370496, 9007199254740992 ], r = t[15];
class o extends RangeError {
constructor(e) {
super("[utf15][RangeError]: " + e);
}
}
class n extends TypeError {
constructor(e) {
super("[utf15][TypeError]: " + e);
}
}
const a = (e, t, ...r) => {
if (!e) throw new t(r.reduce((e, t) => e + t + " ", ""));
}, i = e => (a((e = +e) >= 0 && e < r, o, "x out of bounds:", e), e + 48), s = e => (a((e = +e) >= 0 && e <= 65535, o, "x out of bounds:", e), 
e - 48);
function c(r, o) {
const s = Array.isArray(this.depth), c = s ? 0 : this.depth, l = s ? this.depth : [];
a(c || l.length === o.length, n, "Wrong depths array length:", l, o), s || (r += String.fromCodePoint(i(o.length)));
let u = 0, m = 0;
for (let n = 0, a = o.length; n < a; ++n) {
const a = o[n], s = c || l[n];
for (let o = 0; o < s; ) {
const n = e - u, c = s - o, l = Math.min(n, c);
let p = Math.floor(a / t[o]);
p %= t[l], p *= t[u], m += p, o += l, u += l, u === e && (r += String.fromCodePoint(i(m)), 
u = m = 0);
}
}
return 0 !== u && (r += String.fromCodePoint(i(m))), r;
}
function l(r, o) {
a(!this.meta || o.depth > 0 || 0 === o.depth && Array.isArray(this.depth), n, "Array decoding error (check inputs and codec config)"), 
o.depth = o.depth || this.depth;
const i = Array.isArray(o.depth);
let c = 0, l = 0;
const u = i ? o.depth.length : s(r.codePointAt(c++)), m = i ? 0 : o.depth, p = i ? o.depth : [], d = new Array(u);
let f = 0, y = s(r.codePointAt(c++));
for (;l < u; ) {
const o = m || p[l];
let n = 0, a = 0;
for (;a < o; ) {
const i = e - f, m = o - a, p = Math.min(i, m);
let d = Math.floor(y / t[f]);
if (d %= t[p], d *= t[a], n += d, a += p, f += p, f === e) {
if (l + 1 === u && a === o) break;
y = s(r.codePointAt(c++)), f = 0;
}
}
a > 0 && (d[l++] = n);
}
return [ d, c ];
}
return {
Codec: class {
constructor(e) {
e = e || {}, this.meta = +!!e.meta, this.array = +!!e.array, this.depth = e.depth || 53, 
(e => {
let t = !1;
if (t = t || isNaN(e.meta) || 0 !== e.meta && 1 !== e.meta, t = t || isNaN(e.array) || 0 !== e.array && 1 !== e.array, 
t || (() => {
const r = Array.isArray(e.depth);
if (t = t || r && !e.array, t) return;
const o = e => isNaN(e) || e <= 0 || e > 53;
r ? e.depth.forEach((r, n) => {
e.depth[n] = +e.depth[n], t = t || o(r);
}) : (e.depth = +e.depth, t = t || o(e.depth));
})(), t) {
let t = "[JSON.stringify() ERROR]";
try {
t = JSON.stringify(e);
} finally {}
a(0, n, "Codec config is invalid:", t);
}
})(this);
}
encode(o) {
a((+Array.isArray(o) | +!!o.BYTES_PER_ELEMENT) ^ !this.array, n, "Incompatible codec (array <=> single value), arg =", o);
let s = "";
if (this.meta && (s = ((e, t) => {
const r = Array.isArray(t.depth) ? 0 : t.depth;
return e + String.fromCodePoint(i(t.array), i(r));
})(s, this)), this.array) s = c.call(this, s, o); else {
let n = +o % t[this.depth];
const a = Math.ceil(this.depth / e);
for (let e = 0; e < a; ++e) {
const e = i(n % r);
s += String.fromCodePoint(e), n = Math.floor(n / r);
}
}
return s;
}
decode(r, o) {
let i = null, c = 0;
if (this.meta ? [r, c] = ((e, t, r) => (r = r || 0, t.array = s(e.codePointAt(r)), 
t.depth = s(e.codePointAt(r + 1)), [ e.slice(r + 2), 2 ]))(r, i = {}) : i = this, 
a(i.array ^ !this.array, n, "Incompatible codec (array <=> single value), str =", r), 
this.array) {
const e = l.call(this, r, i);
return o && (o.length = c + e[1]), e[0];
}
let u = 0, m = 0;
const p = Math.ceil(i.depth / e);
for (let o = 0; o < p; ++o) u += s(r.codePointAt(o)) * t[m], m += e;
return o && (o.length = c + p), u;
}
},
MAX_DEPTH: 53
};
})();
const Sa = new Ca.Codec({
array: !1
}), _a = {
key: "ns",
serialize(e) {
if (void 0 !== e) return Sa.encode(e);
},
deserialize(e) {
if (void 0 !== e) return Sa.decode(e);
}
}, Oa = (e, t) => `cg_${e.key}_${t}`, ba = (e, t) => Object.assign(Object.assign({}, e), {
get(r) {
var o;
const n = e.get(r);
if (n) try {
const e = null !== (o = Ta.get(Oa(t, n))) && void 0 !== o ? o : t.deserialize(n);
return void 0 !== e && Ta.set(Oa(t, n), e, Game.time + CREEP_LIFE_TIME), e;
} catch (o) {
return e.delete(r), void Ta.delete(Oa(t, n));
}
},
set(r, o, n) {
const a = e.get(r);
a && Ta.delete(Oa(t, a));
const i = t.serialize(o);
i ? (e.set(r, i, n), Ta.set(Oa(t, i), o, Game.time + CREEP_LIFE_TIME)) : e.delete(r);
},
delete(r) {
const o = e.get(r);
o && Ta.delete(Oa(t, o)), e.delete(r);
},
with: t => ba(e, t)
});
function wa() {
var e, t;
return null !== (e = Memory[t = va.MEMORY_CACHE_PATH]) && void 0 !== e || (Memory[t] = {}), 
Memory[va.MEMORY_CACHE_PATH];
}
function Ua() {
var e, t;
return null !== (e = Memory[t = va.MEMORY_CACHE_EXPIRATION_PATH]) && void 0 !== e || (Memory[t] = {}), 
Memory[va.MEMORY_CACHE_EXPIRATION_PATH];
}
const xa = {
set(e, t, r) {
if (wa()[e] = t, void 0 !== r) {
const t = _a.serialize(r);
t && (Ua()[e] = t);
}
},
get: e => wa()[e],
expires: e => _a.deserialize(Ua()[e]),
delete(e) {
delete wa()[e];
},
with: e => ba(xa, e),
clean() {
const e = Ua();
for (const t in e) {
const r = _a.deserialize(e[t]);
void 0 !== r && Game.time >= r && (xa.delete(t), delete e[t]);
}
}
}, Aa = (e, t, r = 1 / 0) => {
let o = new Map, n = Game.time;
return (...a) => {
Game.time >= n + r && (n = Game.time, o = new Map);
const i = e(...a);
return o.has(i) || o.set(i, t(...a)), o.get(i);
};
}, Ma = (e, t) => Aa(e, t, 1), ka = Aa(e => e, e => {
for (let t = 2; t < e.length; t++) if ("N" === e[t] || "S" === e[t]) {
const r = e[0], o = e[t];
let n = parseInt(e.slice(1, t)), a = parseInt(e.slice(t + 1));
return "W" === r && (n = -n - 1), "N" === o && (a = -a - 1), n += 128, a += 128, 
n << 8 | a;
}
throw new Error(`Invalid room name ${e}`);
}), Na = (e, t, r) => {
const o = Object.create(RoomPosition.prototype);
return o.__packedPos = ka(r) << 16 | e << 8 | t, o;
}, Ia = (e, t, r) => {
const o = Object.create(RoomPosition.prototype);
return o.__packedPos = 4294901760 & e.__packedPos | t << 8 | r, o;
}, Pa = (e, t, r) => {
const o = e.__packedPos >> 8 & 255, n = 255 & e.__packedPos, a = Object.create(RoomPosition.prototype);
return a.__packedPos = 4294901760 & e.__packedPos | o + t << 8 | n + r, a;
}, Ga = new Ca.Codec({
array: !1,
depth: 28
}), La = new Ca.Codec({
array: !0,
depth: 12
}), Da = new Ca.Codec({
depth: 3,
array: !0
}), Fa = new Ca.Codec({
array: !0,
depth: 16
}), Ba = [ "WN", "EN", "WS", "ES" ], Ha = e => {
const t = (65280 & e.__packedPos) >> 8, r = 255 & e.__packedPos, o = e.__packedPos >>> 4 & 4294963200 | t << 6 | r;
return Ga.encode(o);
}, Wa = function(e) {
const t = Ga.decode(e), r = t << 4 & 4294901760 | (4032 & t) >> 6 << 8 | 63 & t, o = Object.create(RoomPosition.prototype);
if (o.__packedPos = r, o.x > 49 || o.y > 49) throw new Error("Invalid room position");
return o;
}, Ya = e => Va([ e ]), Ka = e => qa(e)[0], Va = e => La.encode(e.map(e => e.x << 6 | e.y)), qa = e => La.decode(e).map(e => {
const t = {
x: (4032 & e) >> 6,
y: 63 & e
};
if (t.x > 49 || t.y > 49) throw new Error("Invalid packed coord");
return t;
}), ja = e => e.map(e => Ha(e)).join(""), za = e => {
var t;
return null === (t = e.match(/.{1,2}/g)) || void 0 === t ? void 0 : t.map(e => Wa(e));
}, Xa = e => {
let t = e.match(/^([WE])([0-9]+)([NS])([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
let [, r, o, n, a] = t;
return {
wx: "W" == r ? ~Number(o) : Number(o),
wy: "N" == n ? ~Number(a) : Number(a)
};
}, Qa = (e, t) => `${e < 0 ? "W" : "E"}${e = e < 0 ? ~e : e}${t < 0 ? "N" : "S"}${t = t < 0 ? ~t : t}`, Za = e => {
let {x: t, y: r, roomName: o} = e;
if (t < 0 || t >= 50) throw new RangeError("x value " + t + " not in range");
if (r < 0 || r >= 50) throw new RangeError("y value " + r + " not in range");
if ("sim" == o) throw new RangeError("Sim room does not have world position");
let {wx: n, wy: a} = Xa(o);
return {
x: 50 * Number(n) + t,
y: 50 * Number(a) + r
};
}, Ja = e => {
let [t, r] = [ Math.floor(e.x / 50), e.x % 50 ], [o, n] = [ Math.floor(e.y / 50), e.y % 50 ];
t < 0 && r < 0 && (r = 49 - ~r), o < 0 && n < 0 && (n = 49 - ~n);
let a = Qa(t, o);
return Na(r, n, a);
}, $a = (e, t) => {
if (e.roomName === t.roomName) return e.getRangeTo(t);
let r = Za(e), o = Za(t);
return Math.max(Math.abs(r.x - o.x), Math.abs(r.y - o.y));
};
function ei(e, t) {
const r = [ {
x: 0,
y: -1
}, {
x: 1,
y: -1
}, {
x: 1,
y: 0
}, {
x: 1,
y: 1
}, {
x: 0,
y: 1
}, {
x: -1,
y: 1
}, {
x: -1,
y: 0
}, {
x: -1,
y: -1
} ][t - 1];
let o = e.x + r.x, n = e.y + r.y, a = e.roomName;
if (o < 0) {
const {wx: t, wy: r} = Xa(e.roomName);
a = Qa(t - 1, r), o = 49;
} else if (o > 49) {
const {wx: t, wy: r} = Xa(e.roomName);
a = Qa(t + 1, r), o = 0;
} else if (n < 0) {
const {wx: t, wy: r} = Xa(e.roomName);
a = Qa(t, r - 1), n = 49;
} else if (n > 49) {
const {wx: t, wy: r} = Xa(e.roomName);
a = Qa(t, r + 1), n = 0;
}
return a === e.roomName ? Ia(e, o, n) : Na(o, n, a);
}
const ti = e => Fa.encode(e.map(e => {
const [t, r, o, n, a] = e.split(/([A-Z])([0-9]+)([A-Z])([0-9]+)/);
return Ba.indexOf(r + n) << 14 | parseInt(o) << 7 | parseInt(a);
})), ri = e => Fa.decode(e).map(e => {
const t = e >> 14, r = e >> 7 & 127, o = 127 & e, [n, a] = Ba[t].split("");
return `${n}${r}${a}${o}`;
}), oi = e => ti([ e ]), ni = e => ri(e)[0], ai = new Ca.Codec({
array: !1,
depth: 15
}), ii = {
key: "mts",
serialize(e) {
if (void 0 !== e) return `${Ha(e.pos)}${ai.encode(e.range)}`;
},
deserialize(e) {
if (void 0 !== e) return {
pos: Wa(e.slice(0, 2)),
range: ai.decode(e.slice(2))
};
}
}, si = {
key: "mtls",
serialize(e) {
if (void 0 !== e) return e.map(e => ii.serialize(e)).join("");
},
deserialize(e) {
if (void 0 === e) return;
const t = [];
for (let r = 0; r < e.length; r += 3) {
const o = ii.deserialize(e.slice(r, r + 3));
o && t.push(o);
}
return t;
}
}, ci = {
key: "ps",
serialize(e) {
if (void 0 !== e) return Ha(e);
},
deserialize(e) {
if (void 0 !== e) return Wa(e);
}
}, li = {
key: "pls",
serialize(e) {
if (void 0 !== e) return ja(e);
},
deserialize(e) {
if (void 0 !== e) return za(e);
}
}, ui = {
key: "cs",
serialize(e) {
if (void 0 !== e) return Ya(e);
},
deserialize(e) {
if (void 0 !== e) return Ka(e);
}
}, mi = {
key: "cls",
serialize(e) {
if (void 0 !== e) return Va(e);
},
deserialize(e) {
if (void 0 !== e) return qa(e);
}
};
function pi() {
xa.clean(), Ta.clean();
}
const di = {
HeapCache: Ta,
MemoryCache: xa
};
class fi extends Set {
constructor() {
super(...arguments), this.map = new Map;
}
add(e) {
return this.map.set(e.__packedPos, e), this;
}
delete(e) {
return this.map.delete(e.__packedPos);
}
has(e) {
return this.map.has(e.__packedPos);
}
clear() {
this.map.clear();
}
* entries() {
for (const e of this.map.values()) yield [ e, e ];
}
values() {
return this.map.values();
}
keys() {
return this.map.values();
}
[Symbol.iterator]() {
return this.map.values();
}
get size() {
return this.map.size;
}
}
const yi = e => 0 === e.x || 0 === e.y || 49 === e.x || 49 === e.y, gi = Aa((e, t = !0, r = !1) => {
let o = `${t}${r}`;
return Array.isArray(e) ? e.length && "pos" in e[0] ? o += e.map(e => `${e.pos.__packedPos}_${e.range}`).join(",") : o += e.map(e => e.__packedPos).join(",") : o += "pos" in e ? "range" in e ? `${e.pos.__packedPos}_${e.range}` : `${e.pos.__packedPos}_1` : `${e.__packedPos}_1`, 
o;
}, (e, t = !0, r = !1) => {
let o = [];
if (Array.isArray(e) ? e.length && "pos" in e[0] ? o.push(...e) : o.push(...e.map(e => ({
pos: e,
range: 0
}))) : "pos" in e ? "range" in e ? o.push(e) : o.push({
pos: e.pos,
range: 1
}) : o.push({
pos: e,
range: 1
}), t && (o = o.flatMap(hi)), r) {
const e = new fi;
for (const {pos: r, range: n} of o) Ti(r, n + 1).filter(e => !!Si(e, !0, !1) && (!t || e.roomName === r.roomName && !yi(e))).forEach(t => e.add(t));
for (const t of e) o.some(e => e.pos.inRangeTo(t, e.range)) && e.delete(t);
o = [ ...e ].map(e => ({
pos: e,
range: 0
}));
}
return o;
});
function hi({pos: e, range: t}) {
if (0 === t || e.x > t && 49 - e.x > t && e.y > t && 49 - e.y > t) return [ {
pos: e,
range: t
} ];
const r = Math.max(1, e.x - t), o = Math.min(48, e.x + t), n = Math.max(1, e.y - t), a = Math.min(48, e.y + t), i = o - r + 1, s = a - n + 1, c = Math.floor((Math.min(i, s) - 1) / 2), l = Math.floor(i / (c + 1)), u = Math.floor(s / (c + 1)), m = new Set(Array(l).fill(0).map((e, t) => Math.min(o - c, r + c + t * (2 * c + 1)))), p = new Set(Array(u).fill(0).map((e, t) => Math.min(a - c, n + c + t * (2 * c + 1)))), d = [];
for (const t of m) for (const r of p) d.push({
pos: Ia(e, t, r),
range: c
});
return d;
}
const vi = (e = 1) => {
let t = new Array(2 * e + 1).fill(0).map((t, r) => r - e);
return t.flatMap(e => t.map(t => ({
x: e,
y: t
}))).filter(e => !(0 === e.x && 0 === e.y));
}, Ri = e => Ei(e, 1), Ei = (e, t, r = !1) => {
if (0 === t) return [ e ];
let o = [];
return o = vi(t).map(t => e.x + t.x < 0 || e.x + t.x > 49 || e.y + t.y < 0 || e.y + t.y > 49 ? null : Pa(e, t.x, t.y)).filter(e => null !== e), 
r && o.push(e), o;
}, Ti = (e, t) => {
const r = Za(e);
let o = [];
for (let e = r.x - t; e <= r.x + t; e++) o.push(Ja({
x: e,
y: r.y - t
})), o.push(Ja({
x: e,
y: r.y + t
}));
for (let e = r.y - t + 1; e <= r.y + t - 1; e++) o.push(Ja({
x: r.x - t,
y: e
})), o.push(Ja({
x: r.x + t,
y: e
}));
return o;
}, Ci = (e, t = !1) => Ri(e).filter(e => Si(e, t)), Si = (e, t = !1, r = !1) => {
let o;
try {
o = Game.map.getRoomTerrain(e.roomName);
} catch (e) {
return !1;
}
return !(o.get(e.x, e.y) === TERRAIN_MASK_WALL || Game.rooms[e.roomName] && e.look().some(e => !(t || e.type !== LOOK_CREEPS && e.type !== LOOK_POWER_CREEPS) || !(r || !e.constructionSite || !e.constructionSite.my || !OBSTACLE_OBJECT_TYPES.includes(e.constructionSite.structureType)) || !(r || !e.structure || !(OBSTACLE_OBJECT_TYPES.includes(e.structure.structureType) || e.structure instanceof StructureRampart && !e.structure.my))));
}, _i = e => {
let t = e.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
return Number(t[1]) % 10 == 0 || Number(t[2]) % 10 == 0;
}, Oi = e => {
let t = e.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
let r = Number(t[1]) % 10, o = Number(t[2]) % 10;
return !(5 === r && 5 === o) && r >= 4 && r <= 6 && o >= 4 && o <= 6;
}, bi = (e, t, r) => r ? e.slice(0, t) : e.slice(t + 1), wi = e => "_ck" + e;
function Ui(e) {
Oi(e) && !xa.get(wi(e)) && xa.with(li).set(wi(e), [ ...Game.rooms[e].find(FIND_SOURCES), ...Game.rooms[e].find(FIND_MINERALS) ].map(e => e.pos));
}
class xi extends Map {
get(e) {
return super.get(e.x << 6 | e.y);
}
set(e, t) {
return super.set(e.x << 6 | e.y, t), this;
}
delete(e) {
return super.delete(e.x << 6 | e.y);
}
has(e) {
return super.has(e.x << 6 | e.y);
}
* entries() {
for (const [e, t] of super.entries()) {
const r = {
x: e >> 6,
y: 63 & e
};
yield [ r, t ];
}
}
values() {
return super.values();
}
* keys() {
for (const e of super.keys()) {
const t = {
x: e >> 6,
y: 63 & e
};
yield t;
}
}
[Symbol.iterator]() {
return this.entries();
}
}
class Ai extends xi {
constructor() {
super(...arguments), this.reversed = new xi;
}
set(e, t) {
return this.reversed.set(t, e), super.set(e, t);
}
delete(e) {
const t = this.get(e);
return t && this.reversed.delete(t), super.delete(e);
}
clear() {
this.reversed.clear(), super.clear();
}
}
var Mi, ki, Ni, Ii;
const Pi = new Ca.Codec({
array: !1,
depth: 30
}), Gi = new Map;
null !== (Mi = Memory[Ii = va.MEMORY_PORTAL_PATH]) && void 0 !== Mi || (Memory[Ii] = []);
for (const e of Memory[va.MEMORY_PORTAL_PATH]) {
const t = Fi(e), r = null !== (ki = Gi.get(t.room1)) && void 0 !== ki ? ki : new Map;
r.set(t.room2, t), Gi.set(t.room1, r);
const o = null !== (Ni = Gi.get(t.room2)) && void 0 !== Ni ? Ni : new Map;
o.set(t.room1, t), Gi.set(t.room2, o);
}
function Li(e) {
var t, r, o, n, a;
if (!_i(e) && !(e => {
let t = e.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
return Number(t[1]) % 10 == 5 && Number(t[2]) % 10 == 5;
})(e)) return;
const i = new Set;
for (const o of function(e) {
var t;
if (!Game.rooms[e]) return [];
const r = new Map;
for (const o of Game.rooms[e].find(FIND_STRUCTURES, {
filter: {
structureType: STRUCTURE_PORTAL
}
})) {
if (!(o.destination instanceof RoomPosition)) continue;
const n = null !== (t = r.get(o.destination.roomName)) && void 0 !== t ? t : {
room1: e,
room2: o.destination.roomName,
portalMap: new Ai
};
r.set(o.destination.roomName, n), n.portalMap.set(o.pos, o.destination), o.ticksToDecay ? n.expires = Game.time + o.ticksToDecay : delete n.expires;
}
return [ ...r.values() ];
}(e)) (null !== (t = Gi.get(o.room1)) && void 0 !== t ? t : new Map).set(o.room2, o), 
(null !== (r = Gi.get(o.room2)) && void 0 !== r ? r : new Map).set(o.room1, o), 
i.add(o.room2);
const s = Gi.get(e);
for (const t of null !== (o = null == s ? void 0 : s.keys()) && void 0 !== o ? o : []) i.has(t) || (null === (n = Gi.get(e)) || void 0 === n || n.delete(t), 
null === (a = Gi.get(t)) || void 0 === a || a.delete(e));
}
function Di(e) {
var t;
let r = "";
return r += oi(e.room1), r += oi(e.room2), r += Pi.encode(null !== (t = e.expires) && void 0 !== t ? t : 0), 
r += Va([ ...e.portalMap.entries() ].flat()), r;
}
function Fi(e) {
const t = ni(e.slice(0, 3)), r = ni(e.slice(3, 6)), o = Pi.decode(e.slice(6, 8)), n = new Ai, a = qa(e.slice(8));
for (let e = 0; e < a.length; e += 2) n.set(a[e], a[e + 1]);
return {
room1: t,
room2: r,
expires: 0 !== o ? o : void 0,
portalMap: n
};
}
function Bi(e) {
var t;
const r = new Set(Object.values(null !== (t = Game.map.describeExits(e)) && void 0 !== t ? t : {})), o = Gi.get(e);
if (!o) return [ ...r ];
for (const e of o.values()) r.add(e.room2);
return [ ...r ];
}
const Hi = new Ca.Codec({
array: !1,
depth: 15
}), Wi = (e, t) => {
var r;
if (!e || !e.length) throw new Error("Empty id");
let o = e;
o.length % 3 != 0 && (o = o.padStart(3 * Math.ceil(o.length / 3), "0"));
let n = "";
for (let e = 0; e < o.length; e += 3) n += Hi.encode(parseInt(o.slice(e, e + 3), 16));
return null !== (r = n + t) && void 0 !== r ? r : "";
}, Yi = (e, t) => Wi(e.id, t);
var Ki = Object.freeze({
__proto__: null,
creepKey: Yi,
objectIdKey: Wi,
roomKey: (e, t) => oi(e) + (null != t ? t : "")
});
const Vi = (e, t) => r => {
var o;
if (t && !t.includes(r)) return !1;
let n = null === (o = e.roomCallback) || void 0 === o ? void 0 : o.call(e, r);
return !1 === n ? n : ((e, t, r) => {
var o, n, a, i, s, c, l;
if (r.avoidCreeps && (null === (o = Game.rooms[t]) || void 0 === o || o.find(FIND_CREEPS).forEach(t => e.set(t.pos.x, t.pos.y, 255)), 
null === (n = Game.rooms[t]) || void 0 === n || n.find(FIND_POWER_CREEPS).forEach(t => e.set(t.pos.x, t.pos.y, 255))), 
r.avoidSourceKeepers && function(e, t) {
var r;
const o = null !== (r = xa.with(li).get(wi(e))) && void 0 !== r ? r : [];
for (const e of o) Ei(e, 5, !0).forEach(e => t.set(e.x, e.y, 255));
}(t, e), (r.avoidObstacleStructures || r.roadCost) && (r.avoidObstacleStructures && (null === (a = Game.rooms[t]) || void 0 === a || a.find(FIND_MY_CONSTRUCTION_SITES).forEach(t => {
OBSTACLE_OBJECT_TYPES.includes(t.structureType) && e.set(t.pos.x, t.pos.y, 255);
})), null === (i = Game.rooms[t]) || void 0 === i || i.find(FIND_STRUCTURES).forEach(t => {
r.avoidObstacleStructures && (OBSTACLE_OBJECT_TYPES.includes(t.structureType) || t.structureType === STRUCTURE_RAMPART && !t.my && !t.isPublic) && e.set(t.pos.x, t.pos.y, 255), 
r.roadCost && t instanceof StructureRoad && 0 === e.get(t.pos.x, t.pos.y) && e.set(t.pos.x, t.pos.y, r.roadCost);
})), r.avoidTargets) {
const o = Game.map.getRoomTerrain(t);
for (const n of r.avoidTargets(t)) for (const t of Ei(n.pos, n.range, !0)) if (o.get(t.x, t.y) !== TERRAIN_MASK_WALL) {
const o = 254 - t.getRangeTo(n.pos) * (null !== (s = r.avoidTargetGradient) && void 0 !== s ? s : 0);
e.set(t.x, t.y, Math.max(e.get(t.x, t.y), o));
}
}
return r.ignorePortals || [ ...null !== (l = null === (c = Gi.get(t)) || void 0 === c ? void 0 : c.values()) && void 0 !== l ? l : [] ].flatMap(e => t === e.room1 ? [ ...e.portalMap.keys() ] : [ ...e.portalMap.reversed.keys() ]).forEach(t => e.set(t.x, t.y, 255)), 
e;
})(n instanceof PathFinder.CostMatrix ? n.clone() : new PathFinder.CostMatrix, r, e);
};
function qi(e, t) {
const r = Game.map.getRoomTerrain(e);
let o = !1;
for (let e = 0; e < 25; e++) {
const {x: n, y: a} = ji(t, e);
if (r.get(n, a) !== TERRAIN_MASK_WALL) {
o = !0;
break;
}
}
let n = !1;
for (let e = 25; e < 49; e++) {
const {x: o, y: a} = ji(t, e);
if (r.get(o, a) !== TERRAIN_MASK_WALL) {
n = !0;
break;
}
}
return [ o, n ];
}
function ji(e, t) {
return e === FIND_EXIT_TOP ? {
x: t,
y: 0
} : e === FIND_EXIT_BOTTOM ? {
x: t,
y: 49
} : e === FIND_EXIT_LEFT ? {
x: 0,
y: t
} : {
x: 49,
y: t
};
}
class zi {
constructor() {
this.queue = [];
}
put(e, t) {
let r = this.queue.findIndex(([e]) => e > t);
-1 === r && (r = this.queue.length), this.queue.splice(r, 0, [ t, e ]);
}
take() {
var e;
return null === (e = this.queue.shift()) || void 0 === e ? void 0 : e[1];
}
* [Symbol.iterator]() {
for (const [e, t] of this.queue) yield t;
}
}
const Xi = Ma((e, t) => e + t, (e, t) => {
const {wx: r, wy: o} = Xa(e), {wx: n, wy: a} = Xa(t);
return Math.abs(r - n) + Math.abs(o - a);
}), Qi = Ma(e => e, e => {
let t = 1 / 0;
for (const r of Gi.keys()) t = Math.min(t, Xi(e, r));
return t;
});
function Zi(e, t) {
return Math.min(Xi(e, t), Qi(e) + Qi(t));
}
function Ji(e, t, r) {
var o, n, a, i, s, c, l, u;
let m = Object.assign(Object.assign({}, va.DEFAULT_MOVE_OPTS), r);
(null == r ? void 0 : r.creepMovementInfo) && (m = Object.assign(Object.assign({}, m), function(e) {
const t = {
roadCost: va.DEFAULT_MOVE_OPTS.roadCost || 1,
plainCost: va.DEFAULT_MOVE_OPTS.plainCost || 2,
swampCost: va.DEFAULT_MOVE_OPTS.swampCost || 10
};
let r = e.usedCapacity, o = 0, n = 0, a = 0;
for (let t = e.body.length - 1; t >= 0; t--) {
const i = e.body[t];
if (i.type !== MOVE && i.type !== CARRY) a++; else {
if (i.hits <= 0) continue;
if (i.type === MOVE) {
let e = 1;
i.boost && (e = BOOSTS[MOVE][i.boost].fatigue), o += 1 * e;
} else if (r > 0 && i.type === CARRY) {
let e = 1;
i.boost && (e = BOOSTS[CARRY][i.boost].capacity), r -= CARRY_CAPACITY * e, n++;
}
}
}
if (o > 0) {
const e = n + a, r = 2 * o, i = Math.max(e / r, .1), s = Math.ceil(i), c = Math.ceil(2 * i), l = Math.ceil(10 * i), u = (...e) => [ ...e ].reduce((e, t) => {
return r = e, (o = t) ? u(o, r % o) : r;
var r, o;
}), m = u(s, c, l);
t.roadCost = s / m, t.plainCost = c / m, t.swampCost = l / m;
}
return t;
}(r.creepMovementInfo)));
const p = t.reduce((e, {pos: t}) => e.includes(t.roomName) ? e : [ t.roomName, ...e ], []);
let d = function(e, t, r) {
const o = Object.assign(Object.assign({}, va.DEFAULT_MOVE_OPTS), r), n = Aa((e, t) => e + t, (e, t) => {
var r;
const n = null === (r = o.routeCallback) || void 0 === r ? void 0 : r.call(o, e, t);
return void 0 !== n ? n : _i(e) ? o.highwayRoomCost : Oi(e) ? o.sourceKeeperRoomCost : o.defaultRoomCost;
}), a = function(e, t, r, o) {
var n, a;
if (t.includes(e)) return [];
const i = null !== (n = null == r ? void 0 : r.routeCallback) && void 0 !== n ? n : () => 1, s = new zi;
s.put(e, 0);
const c = new Map, l = new Map;
c.set(e, e), l.set(e, 0);
let u = s.take();
for (;u && !t.includes(u); ) {
for (const e of Bi(u)) {
const r = l.get(u) + i(u, e);
if (r !== 1 / 0 && (!l.has(e) || r < l.get(e))) {
l.set(e, r);
const o = r + Math.min(...t.map(t => Zi(e, t)));
s.put(e, o), c.set(e, u);
}
}
u = s.take();
}
if (u && t.includes(u)) {
const t = [];
let r = [ {
room: u
} ];
for (;u !== e; ) {
const e = c.get(u), n = null === (a = Gi.get(e)) || void 0 === a ? void 0 : a.get(u);
if (n && !o) t.unshift(r), r = [ {
room: e,
portalSet: n
} ]; else {
const t = Game.map.findExit(e, u);
r.unshift({
room: e,
exit: t === ERR_NO_PATH ? void 0 : t
});
}
u = e;
}
return t.unshift(r), t;
}
return ERR_NO_PATH;
}(e, t, {
routeCallback: n
}, o.avoidPortals);
if (a !== ERR_NO_PATH) return a.map(e => {
var t;
const r = function(e, t, r) {
var o;
let n = new Set(e.map(({room: e}) => e));
const a = r.maxRooms;
for (let i = 0; i < e.length - 1 && !(n.size >= a) && e[i].exit; i++) {
if (e[i].exit !== e[i + 1].exit) {
const r = Game.map.describeExits(e[i].room)[e[i + 1].exit];
r && Game.map.findExit(r, e[i + 1].room) > 0 && t(r, e[i].room) !== 1 / 0 && n.add(r);
}
if (!(e[i].exit !== e[i + 1].exit && e[i + 1].exit || (null === (o = e[i + 2]) || void 0 === o ? void 0 : o.exit) && e[i].exit !== e[i + 2].exit)) {
if (n.size >= r.maxRooms - 1) continue;
const o = qi(e[i].room, e[i].exit);
if (o.every(e => e)) continue;
let a;
if (o[0] || e[i].exit !== FIND_EXIT_TOP && e[i].exit !== FIND_EXIT_BOTTOM ? o[1] || e[i].exit !== FIND_EXIT_TOP && e[i].exit !== FIND_EXIT_BOTTOM ? o[0] || e[i].exit !== FIND_EXIT_LEFT && e[i].exit !== FIND_EXIT_RIGHT ? o[1] || e[i].exit !== FIND_EXIT_LEFT && e[i].exit !== FIND_EXIT_RIGHT || (a = FIND_EXIT_BOTTOM) : a = FIND_EXIT_TOP : a = FIND_EXIT_RIGHT : a = FIND_EXIT_LEFT, 
!a) throw new Error("Invalid exit tile state: " + e[i].exit + JSON.stringify(o));
const s = Game.map.describeExits(e[i].room)[a], c = Game.map.describeExits(e[i + 1].room)[a];
s && c && Game.map.findExit(s, c) > 0 && t(s, e[i].room) !== 1 / 0 && t(c, e[i + 1].room) !== 1 / 0 && (n.add(s), 
n.add(c));
}
}
const i = [ ...n ];
for (;n.size < a; ) {
const e = i.shift();
if (!e) break;
const r = Game.map.describeExits(e);
if (r) for (const o of Object.values(r)) n.has(o) || t(o, e) !== 1 / 0 && (n.add(o), 
i.push(o));
}
return [ ...n ];
}(e, n, o);
return {
rooms: r,
portalSet: null === (t = e[e.length - 1]) || void 0 === t ? void 0 : t.portalSet
};
});
}(e.roomName, p, m);
if ((null == d ? void 0 : d.length) && 1 !== d.length) {
let r = e;
const o = [];
for (const e of d) if (e.portalSet) {
const t = e.rooms.includes(e.portalSet.room1) ? e.portalSet.room1 : e.portalSet.room2, n = (t === e.portalSet.room1 ? [ ...e.portalSet.portalMap.keys() ] : [ ...e.portalSet.portalMap.values() ]).map(e => ({
pos: new RoomPosition(e.x, e.y, t),
range: 1
})), a = PathFinder.search(r, n, Object.assign(Object.assign({}, m), {
maxOps: Math.min(null !== (l = m.maxOps) && void 0 !== l ? l : 1e5, (null !== (u = m.maxOpsPerRoom) && void 0 !== u ? u : 2e3) * e.rooms.length),
roomCallback: Vi(m, e.rooms)
}));
if (!a.path.length || a.incomplete) return;
const i = n.find(e => e.pos.isNearTo(a.path[a.path.length - 1])).pos;
if (o.push(...a.path, i), e.portalSet.room1 === t) {
const t = e.portalSet.portalMap.get(i);
if (!t) throw new Error(`Portal ${i} not found in portalSet ${JSON.stringify(e.portalSet)}`);
r = new RoomPosition(t.x, t.y, e.portalSet.room2);
} else {
const t = e.portalSet.portalMap.reversed.get(i);
if (!t) throw new Error(`Portal ${i} not found in portalSet ${JSON.stringify(e.portalSet)}`);
r = new RoomPosition(t.x, t.y, e.portalSet.room1);
}
} else {
const n = PathFinder.search(r, t, Object.assign(Object.assign({}, m), {
maxOps: Math.min(null !== (s = m.maxOps) && void 0 !== s ? s : 1e5, (null !== (c = m.maxOpsPerRoom) && void 0 !== c ? c : 2e3) * e.rooms.length),
roomCallback: Vi(m, e.rooms)
}));
if (!n.path.length || n.incomplete) return;
o.push(...n.path);
}
return o;
}
{
const r = null === (o = null == d ? void 0 : d[0]) || void 0 === o ? void 0 : o.rooms, s = PathFinder.search(e, t, Object.assign(Object.assign({}, m), {
maxOps: Math.min(null !== (n = m.maxOps) && void 0 !== n ? n : 1e5, (null !== (a = m.maxOpsPerRoom) && void 0 !== a ? a : 2e3) * (null !== (i = null == r ? void 0 : r.length) && void 0 !== i ? i : 1)),
roomCallback: Vi(m, r)
}));
if (!s.path.length || s.incomplete) return;
return s.path;
}
}
let $i = new Map, es = 0;
function ts(e) {
var t;
return Game.time !== es && (es = Game.time, $i = new Map), $i.set(e, null !== (t = $i.get(e)) && void 0 !== t ? t : {
creep: new Map,
priority: new Map,
targets: new Map,
pullers: new Set,
pullees: new Set,
prefersToStay: new Set,
blockedSquares: new Set
}), $i.get(e);
}
function rs(e, t = !1) {
var r, o, n, a;
"fatigue" in e.creep && e.creep.fatigue && !t && (e.targets = [ e.creep.pos ]), 
null !== (r = e.targetCount) && void 0 !== r || (e.targetCount = e.targets.length);
const i = ts(e.creep.pos.roomName);
!function(e) {
var t, r, o, n;
if (!e) return;
null !== (t = e.targetCount) && void 0 !== t || (e.targetCount = e.targets.length);
const a = ts(e.creep.pos.roomName);
a.creep.delete(e.creep.id), null === (o = null === (r = a.priority.get(e.priority)) || void 0 === r ? void 0 : r.get(e.targets.length)) || void 0 === o || o.delete(e.creep.id);
for (const t of e.targets) {
const r = Ha(t);
null === (n = a.targets.get(r)) || void 0 === n || n.delete(e.creep.id);
}
}(i.creep.get(e.creep.id)), i.creep.set(e.creep.id, e);
const s = null !== (o = i.priority.get(e.priority)) && void 0 !== o ? o : new Map;
i.priority.set(e.priority, s);
const c = null !== (n = s.get(e.targets.length)) && void 0 !== n ? n : new Map;
s.set(e.targets.length, c), c.set(e.creep.id, e);
for (const t of e.targets) {
const r = Ha(t), o = null !== (a = i.targets.get(r)) && void 0 !== a ? a : new Map;
i.targets.set(r, o), o.set(e.creep.id, e);
}
e.targets.length && e.targets[0].isEqualTo(e.creep.pos) && i.prefersToStay.add(Ha(e.creep.pos));
}
function os(e, t, r) {
var o, n, a;
const i = ts(e.creep.pos.roomName), s = null !== (o = i.priority.get(e.priority)) && void 0 !== o ? o : new Map;
null === (n = s.get(t)) || void 0 === n || n.delete(e.creep.id), i.priority.set(e.priority, s);
const c = null !== (a = s.get(r)) && void 0 !== a ? a : new Map;
s.set(r, c), c.set(e.creep.id, e);
}
const ns = e => {
const t = Game.cpu.getUsed();
return e(), Math.max(0, Game.cpu.getUsed() - t);
}, as = "_crr";
function is() {
const e = xa.with(_a).get(as);
return Boolean(e && Game.time - 2 <= e);
}
let ss = [];
function cs(e, t) {
var r, o, n, a, i, s, c, l;
const u = Game.cpu.getUsed();
let m = 0;
const p = ts(e), d = p.blockedSquares;
if (null == t ? void 0 : t.visualize) for (const {creep: e, targets: t, priority: r} of p.creep.values()) t.forEach(t => {
t.isEqualTo(e.pos) ? Game.rooms[e.pos.roomName].visual.circle(e.pos, {
radius: .5,
stroke: "orange",
fill: "transparent"
}) : Game.rooms[e.pos.roomName].visual.line(e.pos, t, {
color: "orange"
});
});
for (const r of Game.rooms[e].find(FIND_MY_CREEPS).concat(Game.rooms[e].find(FIND_MY_POWER_CREEPS))) p.creep.has(r.id) || p.pullees.has(r.id) || p.pullers.has(r.id) || (rs({
creep: r,
priority: 0,
targets: [ r.pos, ...Ci(r.pos, !0) ]
}), (null == t ? void 0 : t.visualize) && Game.rooms[r.pos.roomName].visual.circle(r.pos, {
radius: 1,
stroke: "red",
fill: "transparent "
}));
for (const e of p.pullers) {
const t = Game.getObjectById(e);
if (!t) continue;
const a = Ha(t.pos);
d.add(a);
for (const t of null !== (o = null === (r = p.targets.get(a)) || void 0 === r ? void 0 : r.values()) && void 0 !== o ? o : []) {
if (t.creep.id === e) continue;
null !== (n = t.targetCount) && void 0 !== n || (t.targetCount = t.targets.length);
const r = t.targetCount;
t.targetCount -= 1, os(t, r, t.targetCount);
}
}
const f = [ ...p.priority.entries() ].sort((e, t) => t[0] - e[0]);
for (const [e, r] of f) for (;r.size; ) {
const e = Math.min(...r.keys()), o = r.get(e);
if (!o) break;
o.size || r.delete(e);
const n = [ ...o.values() ];
for (;n.length; ) {
const e = n.shift();
if (!e) break;
if (e.resolved) {
o.delete(e.creep.id);
continue;
}
let r;
(null == t ? void 0 : t.visualize) && e.targets.forEach(t => {
t.isEqualTo(e.creep.pos) ? Game.rooms[e.creep.pos.roomName].visual.circle(e.creep.pos, {
radius: .5,
stroke: "yellow",
strokeWidth: .2,
fill: "transparent",
opacity: .2
}) : Game.rooms[e.creep.pos.roomName].visual.line(e.creep.pos, t, {
color: "yellow",
width: .2
});
});
for (const t of e.targets) {
const o = Ha(t);
if (!d.has(o) || e.creep.pos.isEqualTo(t) && p.pullers.has(e.creep.id)) {
if (e.creep.pos.isEqualTo(t) || !p.prefersToStay.has(o)) {
r = t;
break;
}
null != r || (r = t);
}
}
if (o.delete(e.creep.id), !r) {
(null == t ? void 0 : t.visualize) && Game.rooms[e.creep.pos.roomName].visual.line(e.creep.pos.x - .5, e.creep.pos.y - .5, e.creep.pos.x + .5, e.creep.pos.y + .5, {
color: "red"
}).line(e.creep.pos.x - .5, e.creep.pos.y + .5, e.creep.pos.x + .5, e.creep.pos.y - .5, {
color: "red"
});
continue;
}
m += ns(() => e.creep.move(e.creep.pos.getDirectionTo(r))), e.resolved = !0, (null == t ? void 0 : t.visualize) && Game.rooms[e.creep.pos.roomName].visual.line(e.creep.pos, r, {
color: "green",
width: .5
});
const u = Ha(r);
d.add(u);
for (const e of null !== (i = null === (a = p.targets.get(u)) || void 0 === a ? void 0 : a.values()) && void 0 !== i ? i : []) {
if (e.resolved) continue;
null !== (s = e.targetCount) && void 0 !== s || (e.targetCount = e.targets.length);
const t = e.targetCount;
e.targetCount -= 1, os(e, t, e.targetCount);
}
if (!r.isEqualTo(e.creep.pos) && !p.pullers.has(e.creep.id)) {
const o = Ha(e.creep.pos), a = [ ...null !== (l = null === (c = p.targets.get(o)) || void 0 === c ? void 0 : c.values()) && void 0 !== l ? l : [] ].filter(t => t !== e && t.targets.length < 2), i = a.find(e => !e.resolved && (null == r ? void 0 : r.isEqualTo(e.creep.pos)) && !p.pullers.has(e.creep.id));
i && ((null == t ? void 0 : t.visualize) && Game.rooms[i.creep.pos.roomName].visual.circle(i.creep.pos, {
radius: .2,
fill: "green"
}), a.filter(e => e.resolved).forEach(e => {
(null == t ? void 0 : t.visualize) && Game.rooms[e.creep.pos.roomName].visual.circle(e.creep.pos, {
radius: .2,
fill: "red"
});
}), d.delete(o), n.unshift(i));
}
}
}
const y = Math.max(0, Game.cpu.getUsed() - u);
ss.push(m / y), ss.length > 1500 && (ss = ss.slice(-1500));
}
function ls(e, t, r = 1) {
return e.pos ? is() ? (rs({
creep: e,
targets: t,
priority: r
}), OK) : t[0].isEqualTo(e.pos) ? OK : e.move(e.pos.getDirectionTo(t[0])) : ERR_INVALID_ARGS;
}
const us = e => `_poi_${e}`, ms = "_cpi";
function ps(e, t, r, o) {
var n;
const a = Object.assign(Object.assign({}, va.DEFAULT_MOVE_OPTS), o), i = null !== (n = a.cache) && void 0 !== n ? n : xa, s = gi(r, null == o ? void 0 : o.keepTargetInRoom, null == o ? void 0 : o.flee);
if (null == o ? void 0 : o.visualizePathStyle) {
const e = Object.assign(Object.assign({}, va.DEFAULT_VISUALIZE_OPTS), o.visualizePathStyle);
for (const t of s) new RoomVisual(t.pos.roomName).rect(t.pos.x - t.range - .5, t.pos.y - t.range - .5, 2 * t.range + 1, 2 * t.range + 1, e);
}
const c = i.with(li).get(us(e));
if (c) return c;
const l = Ji(t, s, Object.assign(Object.assign({}, a), {
flee: !1
}));
if (l) {
const t = a.reusePath ? Game.time + a.reusePath + 1 : void 0;
i.with(li).set(us(e), l, t);
}
return l;
}
function ds(e, t) {
var r;
return (null !== (r = null == t ? void 0 : t.cache) && void 0 !== r ? r : xa).with(li).get(us(e));
}
function fs(e, t) {
var r;
(null !== (r = null == t ? void 0 : t.cache) && void 0 !== r ? r : xa).delete(us(e));
}
function ys(e, t, r) {
var o, n, a, i;
const s = (null !== (o = null == r ? void 0 : r.cache) && void 0 !== o ? o : xa).with(li).get(us(t));
if (!e.pos) return ERR_INVALID_ARGS;
if (!s) return ERR_NO_PATH;
if ((null == r ? void 0 : r.reverse) && e.pos.isEqualTo(s[0]) || !(null == r ? void 0 : r.reverse) && e.pos.isEqualTo(s[s.length - 1])) return OK;
let c = Ta.get(Yi(e, ms));
if (void 0 !== c) {
let t = Math.max(0, Math.min(s.length - 1, (null == r ? void 0 : r.reverse) ? c - 1 : c + 1));
(null === (n = s[t]) || void 0 === n ? void 0 : n.isEqualTo(e.pos)) ? c = t : (null === (a = s[c]) || void 0 === a ? void 0 : a.isEqualTo(e.pos)) || (c = void 0);
}
if (void 0 === c) {
const t = s.findIndex(t => t.isEqualTo(e.pos));
-1 !== t && (c = t);
}
if (void 0 === c && !(null == r ? void 0 : r.reverse) && $a(s[0], e.pos) <= 1 && (c = -1), 
void 0 === c && (null == r ? void 0 : r.reverse) && $a(s[s.length - 1], e.pos) <= 1 && (c = s.length), 
void 0 === c) return ERR_NOT_FOUND;
Ta.set(Yi(e, ms), c);
let l = Math.max(0, Math.min(s.length - 1, (null == r ? void 0 : r.reverse) ? c - 1 : c + 1));
if (null == r ? void 0 : r.visualizePathStyle) {
const t = Object.assign(Object.assign({}, va.DEFAULT_VISUALIZE_OPTS), r.visualizePathStyle), o = bi(s, c, null == r ? void 0 : r.reverse);
null === (i = e.room) || void 0 === i || i.visual.poly(o.filter(t => {
var r;
return t.roomName === (null === (r = e.room) || void 0 === r ? void 0 : r.name);
}), t);
}
return ls(e, [ s[l] ], null == r ? void 0 : r.priority);
}
const gs = (e, t) => 0 !== e.length && 0 !== t.length && e.some(e => t.some(t => e.inRangeTo(t.pos, t.range))), hs = "_csp", vs = "_cst", Rs = (e, t) => {
if (!e.pos) return !1;
if ("fatigue" in e && e.fatigue > 0) return !1;
const r = Ta.get(Yi(e, hs)), o = Ta.get(Yi(e, vs));
return Ta.set(Yi(e, hs), e.pos), r && o && e.pos.isEqualTo(r) ? o + t < Game.time : (Ta.set(Yi(e, vs), Game.time), 
!1);
}, Es = {
key: "js",
serialize(e) {
if (void 0 !== e) return JSON.stringify(e);
},
deserialize(e) {
if (void 0 !== e) return JSON.parse(e);
}
}, Ts = "_cp", Cs = "_ct", Ss = "_co", _s = [ "avoidCreeps", "avoidObstacleStructures", "flee", "plainCost", "swampCost", "roadCost" ];
function Os(e, t = di.HeapCache) {
fs(Yi(e, Ts), {
cache: t
}), t.delete(Yi(e, Cs)), t.delete(Yi(e, Ss));
}
const bs = (e, t, r, o = {
avoidCreeps: !0
}) => {
var n, a, i, s;
if (!e.pos) return ERR_INVALID_ARGS;
let c = Object.assign(Object.assign({}, va.DEFAULT_MOVE_OPTS), r);
const l = null !== (n = null == r ? void 0 : r.cache) && void 0 !== n ? n : di.HeapCache;
let u = gi(t, c.keepTargetInRoom, c.flee), m = !1, p = l.with(si).get(Yi(e, Cs));
for (const {pos: t, range: o} of u) {
if (!m && t.inRangeTo(e.pos, o) && e.pos.roomName === t.roomName) {
if (!(null == r ? void 0 : r.flee)) {
Os(e, l);
const t = Vi(c)(e.pos.roomName);
return ls(e, [ e.pos, ...Ci(e.pos, !0).filter(e => u.some(t => t.pos.inRangeTo(e, t.range)) && (!t || 255 !== t.get(e.x, e.y))) ], c.priority), 
OK;
}
m = !0;
}
p && !p.some(e => e && t.isEqualTo(e.pos) && o === e.range) && (Os(e, l), p = void 0);
}
const d = l.with(Es).get(Yi(e, Ss));
d && !_s.some(e => c[e] !== d[e]) || Os(e, l);
const f = [ null == r ? void 0 : r.roadCost, null == r ? void 0 : r.plainCost, null == r ? void 0 : r.swampCost ].some(e => void 0 !== e);
"body" in e && !f && (c = Object.assign(Object.assign({}, c), {
creepMovementInfo: {
usedCapacity: e.store.getUsedCapacity(),
body: e.body
}
}));
const y = c.reusePath ? Game.time + c.reusePath + 1 : void 0;
l.with(si).set(Yi(e, Cs), u, y), l.with(Es).set(Yi(e, Ss), _s.reduce((e, t) => (e[t] = c[t], 
e), {}), y);
const g = ds(Yi(e, Ts), {
cache: l
}), h = Ta.get(Yi(e, "_cpi")), v = g && bi(g, null != h ? h : 0), R = null !== (i = null === (a = c.avoidTargets) || void 0 === a ? void 0 : a.call(c, e.pos.roomName)) && void 0 !== i ? i : [];
if (c.repathIfStuck && g && Rs(e, c.repathIfStuck)) fs(Yi(e, Ts), {
cache: l
}), c = Object.assign(Object.assign({}, c), o); else if ((null == v ? void 0 : v.length) && gs(v, R)) {
let t = 0;
v.forEach((e, r) => {
R.some(t => t.pos.inRangeTo(e, t.range)) && (t = r);
});
const r = v.slice(t), o = Ji(e.pos, r.map(e => ({
pos: e,
range: 0
})), Object.assign(Object.assign({}, c), {
cache: l,
flee: !1
}));
if (o) {
let t;
for (let e = 0; e < r.length; e++) if (o[o.length - 1].inRangeTo(r[e], 1)) t = e; else if (void 0 !== t) break;
void 0 === t ? fs(Yi(e, Ts), {
cache: l
}) : l.with(li).set(us(Yi(e, Ts)), o.concat(r.slice(t)), y);
} else fs(Yi(e, Ts), {
cache: l
});
}
const E = ps(Yi(e, Ts), e.pos, t, Object.assign(Object.assign({}, c), {
cache: l
}));
if (!E) return ERR_NO_PATH;
if (E && (null === (s = E[E.length - 2]) || void 0 === s ? void 0 : s.isEqualTo(e.pos))) {
let t = Vi(c)(e.pos.roomName);
const o = t instanceof PathFinder.CostMatrix ? e => t.get(e.x, e.y) < 254 : () => !0, n = (null == r ? void 0 : r.flee) ? e => u.every(t => t.pos.getRangeTo(e) >= t.range) : e => u.some(t => t.pos.inRangeTo(e, t.range)), a = Ci(e.pos, !0).filter(e => n(e) && o(e));
if (a.length) return ls(e, a, c.priority), OK;
}
let T = ys(e, Yi(e, Ts), Object.assign(Object.assign({}, c), {
reverse: !1,
cache: l
}));
return T === ERR_NOT_FOUND && (Os(e, l), ps(Yi(e, Ts), e.pos, u, Object.assign(Object.assign({}, c), {
cache: l
})), T = ys(e, Yi(e, Ts), Object.assign(Object.assign({}, c), {
reverse: !1,
cache: l
}))), T;
}, ws = "_rsi";
return Ln.CachingStrategies = di, Ln.CoordListSerializer = mi, Ln.CoordSerializer = ui, 
Ln.Keys = Ki, Ln.MoveTargetListSerializer = si, Ln.MoveTargetSerializer = ii, Ln.NumberSerializer = _a, 
Ln.PositionListSerializer = li, Ln.PositionSerializer = ci, Ln.adjacentWalkablePositions = Ci, 
Ln.blockSquare = function(e) {
ts(e.roomName).blockedSquares.add(Ha(e));
}, Ln.cachePath = ps, Ln.cachedPathKey = us, Ln.calculateAdjacencyMatrix = vi, Ln.calculateAdjacentPositions = Ri, 
Ln.calculateNearbyPositions = Ei, Ln.calculatePositionsAtRange = Ti, Ln.cleanAllCaches = pi, 
Ln.clearCachedPath = Os, Ln.compressPath = e => {
const t = [], r = e[0];
if (!r) return "";
let o = r;
for (const r of e.slice(1)) {
if (1 !== $a(o, r)) throw new Error("Cannot compress path unless each RoomPosition is adjacent to the previous one");
t.push(o.getDirectionTo(r)), o = r;
}
return Ha(r) + Da.encode(t);
}, Ln.config = va, Ln.decompressPath = e => {
let t = Wa(e.slice(0, 2));
const r = [ t ], o = Da.decode(e.slice(2));
for (const e of o) t = ei(t, e), r.push(t);
return r;
}, Ln.fastRoomPosition = Na, Ln.fixEdgePosition = hi, Ln.follow = function(e, t) {
e.move(t), t.pull(e), function(e, t) {
const r = ts(e.pos.roomName);
r.pullers.add(e.id), r.pullees.add(t.id);
}(t, e);
}, Ln.followPath = ys, Ln.fromGlobalPosition = Ja, Ln.generatePath = Ji, Ln.getCachedPath = ds, 
Ln.getMoveIntents = ts, Ln.getRangeTo = $a, Ln.globalPosition = Za, Ln.isExit = yi, 
Ln.isPositionWalkable = Si, Ln.move = ls, Ln.moveByPath = function(e, t, r) {
var o, n, a, i;
const s = null !== (o = null == r ? void 0 : r.repathIfStuck) && void 0 !== o ? o : va.DEFAULT_MOVE_OPTS.repathIfStuck, c = null !== (i = null === (a = null !== (n = null == r ? void 0 : r.avoidTargets) && void 0 !== n ? n : va.DEFAULT_MOVE_OPTS.avoidTargets) || void 0 === a ? void 0 : a(e.pos.roomName)) && void 0 !== i ? i : [];
let l = Ta.get(Yi(e, ws));
const u = ds(t, r);
if ((s || c.length) && void 0 !== l) {
let t = null == u ? void 0 : u.findIndex(t => t.isEqualTo(e.pos));
-1 === t && (t = void 0), void 0 !== t && ((null == r ? void 0 : r.reverse) ? t <= l : t >= l) && (Ta.delete(Yi(e, ws)), 
l = void 0);
}
let m = ERR_NOT_FOUND;
if (void 0 === l && (m = ys(e, t, r)), m !== ERR_NOT_FOUND) {
const t = Ta.get(Yi(e, "_cpi"));
if (!(s && Rs(e, s) || u && gs(bi(u, null != t ? t : 0, null == r ? void 0 : r.reverse), c))) return m;
void 0 !== t && (l = (null == r ? void 0 : r.reverse) ? t - 1 : t + 2, Ta.set(Yi(e, ws), l));
}
let p = ds(t, r);
return p ? (void 0 !== l && (p = bi(p, l, null == r ? void 0 : r.reverse)), 0 === p.length ? ERR_NO_PATH : bs(e, p, r)) : ERR_NO_PATH;
}, Ln.moveTo = bs, Ln.normalizeTargets = gi, Ln.offsetRoomPosition = Pa, Ln.packCoord = Ya, 
Ln.packCoordList = Va, Ln.packPos = Ha, Ln.packPosList = ja, Ln.packRoomName = oi, 
Ln.packRoomNames = ti, Ln.posAtDirection = ei, Ln.preTick = function() {
pi(), function() {
for (const e in Game.rooms) Ui(e), Li(e);
!function() {
var e, t;
const r = new Set;
Memory[va.MEMORY_PORTAL_PATH] = [];
for (const o of Gi.values()) for (const n of o.values()) r.has(n) || (r.add(n), 
n.expires && n.expires < Game.time ? (null === (e = Gi.get(n.room1)) || void 0 === e || e.delete(n.room2), 
null === (t = Gi.get(n.room2)) || void 0 === t || t.delete(n.room1)) : Memory[va.MEMORY_PORTAL_PATH].push(Di(n)));
}();
}();
}, Ln.reconcileTraffic = function(e) {
for (const t of [ ...$i.keys() ]) Game.rooms[t] && cs(t, e);
xa.with(_a).set(as, Game.time);
}, Ln.reconciledRecently = is, Ln.resetCachedPath = fs, Ln.roomNameFromCoords = Qa, 
Ln.roomNameToCoords = Xa, Ln.sameRoomPosition = Ia, Ln.unpackCoord = Ka, Ln.unpackCoordList = qa, 
Ln.unpackPos = Wa, Ln.unpackPosList = za, Ln.unpackRoomName = ni, Ln.unpackRoomNames = ri, 
Ln;
}(), Fn = function() {
function e() {}
return e.prototype.getRoomIntel = function(e) {
var t, r = Memory;
if (null === (t = r.empire) || void 0 === t ? void 0 : t.knownRooms) return r.empire.knownRooms[e];
}, e.prototype.setRoomIntel = function(e, t) {
var r = Memory;
r.empire || (r.empire = {
knownRooms: {},
clusters: [],
warTargets: [],
ownedRooms: {},
claimQueue: [],
nukeCandidates: [],
powerBanks: [],
objectives: {
targetPowerLevel: 0,
targetRoomCount: 1,
warMode: !1,
expansionPaused: !1
},
lastUpdate: Game.time
}), r.empire.knownRooms || (r.empire.knownRooms = {}), r.empire.knownRooms[e] = t;
}, e.prototype.getSwarmState = function(e) {
var t = Memory.rooms[e];
return null == t ? void 0 : t.swarm;
}, e.prototype.getOrInitSwarmState = function(e) {
var t = Memory.rooms[e];
return t.swarm || (t.swarm = {
colonyLevel: 1,
posture: "peaceful",
danger: 0,
pheromones: {
expand: 0,
harvest: 0,
build: 0,
upgrade: 0,
defense: 0,
war: 0,
siege: 0,
logistics: 0,
nukeTarget: 0
},
nextUpdateTick: Game.time + 100,
eventLog: [],
missingStructures: {
spawn: !0,
storage: !0,
terminal: !0,
labs: !0,
nuker: !0,
factory: !0,
extractor: !0,
powerSpawn: !0,
observer: !0
},
role: "capital",
remoteAssignments: [],
metrics: {
energyHarvested: 0,
energySpawning: 0,
energyConstruction: 0,
energyRepair: 0,
energyTower: 0,
controllerProgress: 0,
hostileCount: 0,
damageReceived: 0,
constructionSites: 0,
energyAvailable: 0,
energyCapacity: 0,
energyNeed: 0
},
lastUpdate: Game.time
}), t.swarm;
}, e.prototype.getEmpire = function() {
var e = Memory;
return e.empire || (e.empire = {
knownRooms: {},
clusters: [],
warTargets: [],
ownedRooms: {},
claimQueue: [],
nukeCandidates: [],
powerBanks: [],
objectives: {
targetPowerLevel: 0,
targetRoomCount: 1,
warMode: !1,
expansionPaused: !1
},
lastUpdate: Game.time
}), e.empire;
}, e;
}(), Bn = new Fn;

function Hn(e) {
var t = Game.rooms[e];
if (!t) return null;
var r = t.find(FIND_MY_SPAWNS);
return r.length > 0 ? r[0].pos : new RoomPosition(25, 25, e);
}

var Wn = xe("ActionExecutor"), Yn = "#ffaa00", Kn = "#ffffff", Vn = "#ff0000", qn = "#00ff00", jn = "#0000ff";

function zn(e, t, r) {
var o, n;
if (!t || !t.type) return Wn.warn("".concat(e.name, " received invalid action, clearing state")), 
void delete r.memory.state;
var a = function(e, t) {
return t;
}(0, t);
t.type !== a.type && Wn.debug("".concat(e.name, " opportunistic action: ").concat(t.type, " → ").concat(a.type)), 
"idle" === a.type ? Wn.warn("".concat(e.name, " (").concat(r.memory.role, ") executing IDLE action")) : Wn.debug("".concat(e.name, " (").concat(r.memory.role, ") executing ").concat(a.type));
var i = !1;
switch (a.type) {
case "harvest":
i = Xn(e, function() {
return e.harvest(a.target);
}, a.target, Yn, a.type);
break;

case "harvestMineral":
i = Xn(e, function() {
return e.harvest(a.target);
}, a.target, "#00ff00", a.type);
break;

case "harvestDeposit":
i = Xn(e, function() {
return e.harvest(a.target);
}, a.target, "#00ffff", a.type);
break;

case "pickup":
i = Xn(e, function() {
return e.pickup(a.target);
}, a.target, Yn, a.type);
break;

case "withdraw":
i = Xn(e, function() {
return e.withdraw(a.target, a.resourceType);
}, a.target, Yn, a.type);
break;

case "transfer":
i = Xn(e, function() {
return e.transfer(a.target, a.resourceType);
}, a.target, Kn, a.type, {
resourceType: a.resourceType
});
break;

case "drop":
e.drop(a.resourceType);
break;

case "build":
i = Xn(e, function() {
return e.build(a.target);
}, a.target, "#ffffff", a.type);
break;

case "repair":
i = Xn(e, function() {
return e.repair(a.target);
}, a.target, "#ffff00", a.type);
break;

case "upgrade":
i = Xn(e, function() {
return e.upgradeController(a.target);
}, a.target, Kn, a.type);
break;

case "dismantle":
i = Xn(e, function() {
return e.dismantle(a.target);
}, a.target, Vn, a.type);
break;

case "attack":
Xn(e, function() {
return e.attack(a.target);
}, a.target, Vn, a.type);
break;

case "rangedAttack":
Xn(e, function() {
return e.rangedAttack(a.target);
}, a.target, Vn, a.type);
break;

case "heal":
Xn(e, function() {
return e.heal(a.target);
}, a.target, qn, a.type);
break;

case "rangedHeal":
e.rangedHeal(a.target), Dn.moveTo(e, a.target, {
visualizePathStyle: {
stroke: qn
}
}) === ERR_NO_PATH && (i = !0);
break;

case "claim":
Xn(e, function() {
return e.claimController(a.target);
}, a.target, qn, a.type);
break;

case "reserve":
Xn(e, function() {
return e.reserveController(a.target);
}, a.target, qn, a.type);
break;

case "attackController":
Xn(e, function() {
return e.attackController(a.target);
}, a.target, Vn, a.type);
break;

case "moveTo":
Dn.moveTo(e, a.target, {
visualizePathStyle: {
stroke: jn
}
}) === ERR_NO_PATH && (i = !0);
break;

case "moveToRoom":
var s = new RoomPosition(25, 25, a.roomName);
Dn.moveTo(e, {
pos: s,
range: 20
}, {
visualizePathStyle: {
stroke: jn
},
maxRooms: 16
}) === ERR_NO_PATH && (i = !0);
break;

case "flee":
var c = a.from.map(function(e) {
return {
pos: e,
range: 10
};
});
Dn.moveTo(e, c, {
flee: !0
}) === ERR_NO_PATH && (i = !0);
break;

case "wait":
if (Dn.isExit(e.pos)) {
var l = new RoomPosition(25, 25, e.pos.roomName);
Dn.moveTo(e, l, {
priority: 2
});
break;
}
e.pos.isEqualTo(a.position) || Dn.moveTo(e, a.position) === ERR_NO_PATH && (i = !0);
break;

case "requestMove":
Dn.moveTo(e, a.target, {
visualizePathStyle: {
stroke: jn
},
priority: 5
}) === ERR_NO_PATH && (i = !0);
break;

case "idle":
if (Dn.isExit(e.pos)) {
l = new RoomPosition(25, 25, e.pos.roomName), Dn.moveTo(e, l, {
priority: 2
});
break;
}
var u = Game.rooms[e.pos.roomName];
if (u && (null === (o = u.controller) || void 0 === o ? void 0 : o.my)) {
Bn.getOrInitSwarmState(u.name);
var m = Hn(u.name);
if (m && !e.pos.isEqualTo(m)) {
Dn.moveTo(e, m, {
visualizePathStyle: {
stroke: "#888888"
},
priority: 2
}) === ERR_NO_PATH && (i = !0);
break;
}
}
var p = ((null === (n = Game.rooms[e.pos.roomName]) || void 0 === n ? void 0 : n.find(FIND_MY_SPAWNS)) || []).find(function(t) {
return e.pos.inRangeTo(t.pos, 1);
});
p && Dn.moveTo(e, {
pos: p.pos,
range: 3
}, {
flee: !0,
priority: 2
});
}
i && (delete r.memory.state, Dn.clearCachedPath(e), $e(e)), function(e) {
var t = 0 === e.creep.store.getUsedCapacity(), r = 0 === e.creep.store.getFreeCapacity();
void 0 === e.memory.working && (e.memory.working = !t), t && (e.memory.working = !1), 
r && (e.memory.working = !0);
}(r);
}

function Xn(e, t, r, o, n, a) {
var i = t();
if (i === ERR_NOT_IN_RANGE) {
var s = Dn.moveTo(e, r, {
visualizePathStyle: {
stroke: o
}
});
return s !== OK && Wn.info("Movement attempt returned non-OK result", {
room: e.pos.roomName,
creep: e.name,
meta: {
action: null != n ? n : "rangeAction",
moveResult: s,
target: r.pos.toString()
}
}), s === ERR_NO_PATH;
}
return i === OK && n && function(e, t, r, o) {
var n, a, i, s, c, l;
switch (an(e.memory), t) {
case "harvest":
case "harvestMineral":
case "harvestDeposit":
s = 2 * (R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length), sn(e.memory).energyHarvested += s;
break;

case "transfer":
var u = null !== (n = null == o ? void 0 : o.resourceType) && void 0 !== n ? n : RESOURCE_ENERGY, m = Math.min(e.store.getUsedCapacity(u), null !== (i = null === (a = r.store) || void 0 === a ? void 0 : a.getFreeCapacity(u)) && void 0 !== i ? i : 0);
m > 0 && function(e, t) {
sn(e).energyTransferred += t;
}(e.memory, m);
break;

case "build":
var p = 5 * (R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length);
c = e.memory, l = p, sn(c).buildProgress += l;
break;

case "repair":
var d = 100 * (R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length);
!function(e, t) {
sn(e).repairProgress += t;
}(e.memory, d);
break;

case "attack":
var f = 30 * e.body.filter(function(e) {
return e.type === ATTACK && e.hits > 0;
}).length;
cn(e.memory, f);
break;

case "rangedAttack":
var y = e.body.filter(function(e) {
return e.type === RANGED_ATTACK && e.hits > 0;
}).length, g = e.pos.getRangeTo(r);
f = 0, g <= 1 ? f = 10 * y : g <= 2 ? f = 4 * y : g <= 3 && (f = 1 * y), cn(e.memory, f);
break;

case "heal":
case "rangedHeal":
var h = e.body.filter(function(e) {
return e.type === HEAL && e.hits > 0;
}).length, v = "heal" === t ? 12 * h : 4 * h;
!function(e, t) {
sn(e).healingDone += t;
}(e.memory, v);
break;

case "upgrade":
var R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
!function(e, t) {
sn(e).upgradeProgress += t;
}(e.memory, R);
}
}(e, n, r, a), (i === ERR_FULL || i === ERR_NOT_ENOUGH_RESOURCES || i === ERR_INVALID_TARGET) && (Wn.info("Clearing state after action error", {
room: e.pos.roomName,
creep: e.name,
meta: {
action: null != n ? n : "rangeAction",
result: i,
target: r.pos.toString()
}
}), !0);
}

var Qn = xe("StateMachine");

function Zn(e, t) {
var r, n = e.memory.state, a = function(e) {
if (!e) return {
valid: !1,
reason: "noState"
};
var t = Game.time - e.startTick;
return t > e.timeout ? {
valid: !1,
reason: "expired",
meta: {
age: t,
timeout: e.timeout
}
} : e.targetId && !Game.getObjectById(e.targetId) ? {
valid: !1,
reason: "missingTarget",
meta: {
targetId: e.targetId
}
} : {
valid: !0
};
}(n);
if (n && a.valid) if (function(e, t) {
if (!e) return !0;
switch (e.action) {
case "harvest":
case "harvestMineral":
case "pickup":
case "withdraw":
return !!t.isFull || !(!e.targetId || (r = Game.getObjectById(e.targetId)));

case "harvestDeposit":
if (t.isFull) return !0;
if (e.targetId) {
if (!(r = Game.getObjectById(e.targetId))) return !0;
if ("object" == typeof r && "cooldown" in r && r.cooldown > 100) return !0;
}
return !1;

case "transfer":
case "build":
return !!t.isEmpty || !(!e.targetId || (r = Game.getObjectById(e.targetId)));

case "repair":
if (t.isEmpty) return !0;
if (e.targetId) {
if (!(r = Game.getObjectById(e.targetId))) return !0;
if ("object" == typeof (a = r) && null !== a && "hits" in a && "hitsMax" in a && r.hits >= r.hitsMax) return !0;
}
return !1;

case "upgrade":
return t.isEmpty;

case "moveToRoom":
return void 0 !== e.targetRoom && t.room.name === e.targetRoom;

case "moveTo":
var r;
if (e.targetId && (r = Game.getObjectById(e.targetId)) && "object" == typeof r && "pos" in r) {
var o = r;
return t.creep.pos.inRangeTo(o.pos, 1);
}
if (e.targetPos) {
var n = new RoomPosition(e.targetPos.x, e.targetPos.y, e.targetPos.roomName);
return t.creep.pos.inRangeTo(n, 1);
}
return !1;

case "idle":
return !0;

default:
return !1;
}
var a;
}(n, e)) Qn.info("State completed, evaluating new action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: n.action,
role: e.memory.role
}
}), delete e.memory.state; else {
var i = function(e) {
var t, r, o = null;
if (e.targetId) {
var n = Game.getObjectById(e.targetId);
if (!n) return null;
if ("object" != typeof n || !("pos" in n) || !("room" in n)) return null;
o = n;
}
switch (e.action) {
case "harvest":
return o ? {
type: "harvest",
target: o
} : null;

case "harvestMineral":
return o ? {
type: "harvestMineral",
target: o
} : null;

case "harvestDeposit":
return o ? {
type: "harvestDeposit",
target: o
} : null;

case "pickup":
return o ? {
type: "pickup",
target: o
} : null;

case "withdraw":
return o && (null === (t = e.data) || void 0 === t ? void 0 : t.resourceType) ? {
type: "withdraw",
target: o,
resourceType: e.data.resourceType
} : null;

case "transfer":
return o && (null === (r = e.data) || void 0 === r ? void 0 : r.resourceType) ? {
type: "transfer",
target: o,
resourceType: e.data.resourceType
} : null;

case "build":
return o ? {
type: "build",
target: o
} : null;

case "repair":
return o ? {
type: "repair",
target: o
} : null;

case "upgrade":
return o ? {
type: "upgrade",
target: o
} : null;

case "moveTo":
return o ? {
type: "moveTo",
target: o
} : e.targetPos ? {
type: "moveTo",
target: new RoomPosition(e.targetPos.x, e.targetPos.y, e.targetPos.roomName)
} : null;

case "moveToRoom":
return e.targetRoom ? {
type: "moveToRoom",
roomName: e.targetRoom
} : null;

case "idle":
return {
type: "idle"
};

default:
return null;
}
}(n);
if (i) return i;
Qn.info("State reconstruction failed, re-evaluating behavior", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: n.action,
role: e.memory.role
}
}), delete e.memory.state;
} else n && (Qn.info("State invalid, re-evaluating behavior", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: o({
action: n.action,
role: e.memory.role,
invalidReason: a.reason
}, a.meta)
}), delete e.memory.state);
var s = t(e);
return s && s.type ? ("idle" !== s.type ? (e.memory.state = function(e) {
var t = {
action: e.type,
startTick: Game.time,
timeout: 25
};
if ("target" in e && e.target && "id" in e.target && (t.targetId = e.target.id), 
"moveToRoom" === e.type && (t.targetRoom = e.roomName), "moveTo" === e.type) {
var r = "pos" in e.target ? e.target.pos : e.target;
t.targetPos = {
x: r.x,
y: r.y,
roomName: r.roomName
};
}
return "withdraw" !== e.type && "transfer" !== e.type || (t.data = {
resourceType: e.resourceType
}), t;
}(s), Qn.info("Committed new state action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: s.type,
role: e.memory.role,
targetId: null === (r = e.memory.state) || void 0 === r ? void 0 : r.targetId
}
})) : Qn.info("Behavior returned idle action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
role: e.memory.role
}
}), s) : (Qn.warn("Behavior returned invalid action, defaulting to idle", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
role: e.memory.role
}
}), {
type: "idle"
});
}

function Jn(e) {
var t = 0 === e.creep.store.getUsedCapacity(), r = 0 === e.creep.store.getFreeCapacity();
void 0 === e.memory.working && (e.memory.working = !t);
var o = e.memory.working;
t ? e.memory.working = !1 : r && (e.memory.working = !0);
var n = e.memory.working;
return o !== n && et(e.creep), n;
}

function $n(e) {
e.memory.working = !1, et(e.creep);
}

var ea = xe("EnergyCollection");

function ta(e) {
if (e.droppedResources.length > 0) {
var t = Je(e.creep, e.droppedResources, "energy_drop", 5);
if (t) return ea.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting dropped resource at ").concat(t.pos)), 
{
type: "pickup",
target: t
};
}
var r = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (r.length > 0) {
var o = vn(e.creep, r, "energy_container");
if (o) return ea.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting container ").concat(o.id, " at ").concat(o.pos, " with ").concat(o.store.getUsedCapacity(RESOURCE_ENERGY), " energy")), 
{
type: "withdraw",
target: o,
resourceType: RESOURCE_ENERGY
};
if (ea.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") found ").concat(r.length, " containers but distribution returned null, falling back to closest")), 
a = e.creep.pos.findClosestByRange(r)) return ea.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") using fallback container ").concat(a.id, " at ").concat(a.pos)), 
{
type: "withdraw",
target: a,
resourceType: RESOURCE_ENERGY
};
}
if (e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return ea.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting storage at ").concat(e.storage.pos)), 
{
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var n = qe(e.room).filter(function(e) {
return e.energy > 0;
});
if (n.length > 0) {
var a, i = vn(e.creep, n, "energy_source");
if (i) return ea.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting source ").concat(i.id, " at ").concat(i.pos)), 
{
type: "harvest",
target: i
};
if (ea.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") found ").concat(n.length, " sources but distribution returned null, falling back to closest")), 
a = e.creep.pos.findClosestByRange(n)) return ea.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") using fallback source ").concat(a.id, " at ").concat(a.pos)), 
{
type: "harvest",
target: a
};
}
return ea.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") findEnergy returning idle - no energy sources available")), 
{
type: "idle"
};
}

function ra(e) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (n = Je(e.creep, t, "deliver_spawn", 5))) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (n = Je(e.creep, r, "deliver_ext", 5))) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var o = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (o.length > 0 && (n = Je(e.creep, o, "deliver_tower", 10))) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
if (e.storage && e.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) return {
type: "transfer",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var n, a = e.depositContainers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
return a.length > 0 && (n = Je(e.creep, a, "deliver_cont", 10)) ? {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
} : null;
}

var oa = xe("LarvaWorkerBehavior");

function na(e) {
if (Jn(e)) {
oa.debug("".concat(e.creep.name, " larvaWorker working with ").concat(e.creep.store.getUsedCapacity(RESOURCE_ENERGY), " energy"));
var t = ra(e);
if (t) return oa.debug("".concat(e.creep.name, " larvaWorker delivering via ").concat(t.type)), 
t;
var r = function(e) {
var t, r = Bn.getSwarmState(e.room.name);
return null !== (t = null == r ? void 0 : r.pheromones) && void 0 !== t ? t : null;
}(e.creep);
if (r) {
if (function(e) {
return e.build > 15;
}(r) && e.prioritizedSites.length > 0) return {
type: "build",
target: e.prioritizedSites[0]
};
if (function(e) {
return e.upgrade > 15;
}(r) && e.room.controller) return {
type: "upgrade",
target: e.room.controller
};
}
if (e.prioritizedSites.length > 0) return oa.debug("".concat(e.creep.name, " larvaWorker building site")), 
{
type: "build",
target: e.prioritizedSites[0]
};
if (e.room.controller) return {
type: "upgrade",
target: e.room.controller
};
if (e.isEmpty) return oa.warn("".concat(e.creep.name, " larvaWorker idle (empty, working=true, no targets) - this indicates a bug")), 
{
type: "idle"
};
oa.debug("".concat(e.creep.name, " larvaWorker has energy but no targets, switching to collection mode")), 
$n(e);
}
return ta(e);
}

var aa = xe("HarvesterBehavior"), ia = xe("HaulerBehavior"), sa = {
larvaWorker: na,
harvester: function(e) {
var t = function(e) {
if (!e.room) return null;
var t = e.memory;
if (t.sourceId) {
var r = Game.getObjectById(t.sourceId);
if (r) return r;
}
var o = e.room.find(FIND_SOURCES);
if (0 === o.length) return null;
var n = e.pos.findClosestByRange(o);
return n && (t.sourceId = n.id), n;
}(e.creep);
if (t || (t = e.assignedSource), t || (t = function(e) {
var t, r, o, n, i, s, c = qe(e.room);
if (0 === c.length) return null;
var l, u = "sourceCounts_".concat(e.room.name), m = "sourceCounts_tick_".concat(e.room.name), p = global, d = p[u], f = p[m];
if (d && f === Game.time) l = d; else {
l = new Map;
try {
for (var y = a(c), g = y.next(); !g.done; g = y.next()) {
var h = g.value;
l.set(h.id, 0);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
g && !g.done && (r = y.return) && r.call(y);
} finally {
if (t) throw t.error;
}
}
for (var v in Game.creeps) {
var R = Game.creeps[v].memory;
"harvester" === R.role && R.sourceId && l.has(R.sourceId) && l.set(R.sourceId, (null !== (i = l.get(R.sourceId)) && void 0 !== i ? i : 0) + 1);
}
p[u] = l, p[m] = Game.time;
}
var E = null, T = 1 / 0;
try {
for (var C = a(c), S = C.next(); !S.done; S = C.next()) {
h = S.value;
var _ = null !== (s = l.get(h.id)) && void 0 !== s ? s : 0;
_ < T && (T = _, E = h);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
S && !S.done && (n = C.return) && n.call(C);
} finally {
if (o) throw o.error;
}
}
return E && (e.memory.sourceId = E.id), E;
}(e), aa.debug("".concat(e.creep.name, " harvester assigned to source ").concat(null == t ? void 0 : t.id))), 
!t) return aa.warn("".concat(e.creep.name, " harvester has no source to harvest")), 
{
type: "idle"
};
if (!e.creep.pos.isNearTo(t)) return {
type: "moveTo",
target: t
};
var r = e.creep.store.getCapacity(), o = e.creep.store.getFreeCapacity() > 0;
if (null === r || 0 === r || o) return {
type: "harvest",
target: t
};
var n = function(e) {
var t, r = null !== (t = e.memory) && void 0 !== t ? t : {};
if (r.nearbyContainerId && r.nearbyContainerTick && Game.time - r.nearbyContainerTick < 50) {
var o = Game.getObjectById(r.nearbyContainerId);
if (o) return o.store.getFreeCapacity(RESOURCE_ENERGY) > 0 ? o : void 0;
delete r.nearbyContainerId, delete r.nearbyContainerTick;
}
var n = e.pos.findInRange(FIND_STRUCTURES, 1, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}
})[0];
return n ? (r.nearbyContainerId = n.id, r.nearbyContainerTick = Game.time, n.store.getFreeCapacity(RESOURCE_ENERGY) > 0 ? n : void 0) : (delete r.nearbyContainerId, 
void delete r.nearbyContainerTick);
}(e.creep);
if (n) return aa.debug("".concat(e.creep.name, " harvester transferring to container ").concat(n.id)), 
{
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var i = function(e) {
var t, r = null !== (t = e.memory) && void 0 !== t ? t : {};
if (r.nearbyLinkId && r.nearbyLinkTick && Game.time - r.nearbyLinkTick < 50) {
var o = Game.getObjectById(r.nearbyLinkId);
if (o) return o.store.getFreeCapacity(RESOURCE_ENERGY) > 0 ? o : void 0;
delete r.nearbyLinkId, delete r.nearbyLinkTick;
}
var n = e.pos.findInRange(FIND_MY_STRUCTURES, 1, {
filter: function(e) {
return e.structureType === STRUCTURE_LINK;
}
})[0];
return n ? (r.nearbyLinkId = n.id, r.nearbyLinkTick = Game.time, n.store.getFreeCapacity(RESOURCE_ENERGY) > 0 ? n : void 0) : (delete r.nearbyLinkId, 
void delete r.nearbyLinkTick);
}(e.creep);
return i ? (aa.debug("".concat(e.creep.name, " harvester transferring to link ").concat(i.id)), 
{
type: "transfer",
target: i,
resourceType: RESOURCE_ENERGY
}) : (aa.debug("".concat(e.creep.name, " harvester dropping energy on ground")), 
{
type: "drop",
resourceType: RESOURCE_ENERGY
});
},
hauler: function(e) {
var t, r = Jn(e);
if (ia.debug("".concat(e.creep.name, " hauler state: working=").concat(r, ", energy=").concat(e.creep.store.getUsedCapacity(RESOURCE_ENERGY), "/").concat(e.creep.store.getCapacity())), 
r) {
var o = Object.keys(e.creep.store)[0];
if (0 === e.creep.store.getUsedCapacity(RESOURCE_ENERGY) && o && o !== RESOURCE_ENERGY) {
var n = null !== (t = e.terminal) && void 0 !== t ? t : e.storage;
if (n) return {
type: "transfer",
target: n,
resourceType: o
};
}
var a = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (a.length > 0 && (c = Je(e.creep, a, "hauler_spawn", 10))) return ia.debug("".concat(e.creep.name, " hauler delivering to spawn ").concat(c.id)), 
{
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
var i = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (i.length > 0 && (c = Je(e.creep, i, "hauler_ext", 10))) return {
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
var s = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (s.length > 0 && (c = Je(e.creep, s, "hauler_tower", 15))) return {
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
if (e.storage && e.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) return {
type: "transfer",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var c, l = e.depositContainers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (l.length > 0 && (c = Je(e.creep, l, "hauler_cont", 15))) return {
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
if (e.isEmpty) return ia.warn("".concat(e.creep.name, " hauler idle (empty, working=true, no targets)")), 
{
type: "idle"
};
ia.debug("".concat(e.creep.name, " hauler has energy but no targets, switching to collection mode")), 
$n(e);
}
if (e.droppedResources.length > 0 && (c = Je(e.creep, e.droppedResources, "hauler_drop", 5))) return {
type: "pickup",
target: c
};
var u = e.tombstones.filter(function(e) {
return e.store.getUsedCapacity() > 0;
});
if (u.length > 0) {
var m = Je(e.creep, u, "hauler_tomb", 10);
if (m) {
if (m.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return {
type: "withdraw",
target: m,
resourceType: RESOURCE_ENERGY
};
var p = Object.keys(m.store).find(function(e) {
return e !== RESOURCE_ENERGY && m.store.getUsedCapacity(e) > 0;
});
if (p) return {
type: "withdraw",
target: m,
resourceType: p
};
}
}
var d = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (d.length > 0) {
var f = vn(e.creep, d, "energy_container");
if (f) return ia.debug("".concat(e.creep.name, " hauler withdrawing from container ").concat(f.id, " with ").concat(f.store.getUsedCapacity(RESOURCE_ENERGY), " energy")), 
{
type: "withdraw",
target: f,
resourceType: RESOURCE_ENERGY
};
ia.warn("".concat(e.creep.name, " hauler found ").concat(d.length, " containers but distribution returned null, falling back to closest"));
var y = e.creep.pos.findClosestByRange(d);
if (y) return ia.debug("".concat(e.creep.name, " hauler using fallback container ").concat(y.id)), 
{
type: "withdraw",
target: y,
resourceType: RESOURCE_ENERGY
};
}
if (e.mineralContainers.length > 0) {
var g = vn(e.creep, e.mineralContainers, "mineral_container");
if (g) {
if (h = Object.keys(g.store).find(function(e) {
return e !== RESOURCE_ENERGY && g.store.getUsedCapacity(e) > 0;
})) return {
type: "withdraw",
target: g,
resourceType: h
};
} else {
ia.warn("".concat(e.creep.name, " hauler found ").concat(e.mineralContainers.length, " mineral containers but distribution returned null, falling back to closest"));
var h, v = e.creep.pos.findClosestByRange(e.mineralContainers);
if (v && (h = Object.keys(v.store).find(function(e) {
return e !== RESOURCE_ENERGY && v.store.getUsedCapacity(e) > 0;
}))) return ia.debug("".concat(e.creep.name, " hauler using fallback mineral container ").concat(v.id)), 
{
type: "withdraw",
target: v,
resourceType: h
};
}
}
return e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0 ? (ia.debug("".concat(e.creep.name, " hauler withdrawing from storage")), 
{
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
}) : (ia.warn("".concat(e.creep.name, " hauler idle (no energy sources found)")), 
{
type: "idle"
});
},
builder: function(e) {
if (Jn(e)) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (o = Je(e.creep, t, "builder_spawn", 5))) return {
type: "transfer",
target: o,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (o = Je(e.creep, r, "builder_ext", 5))) return {
type: "transfer",
target: o,
resourceType: RESOURCE_ENERGY
};
var o, n = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (n.length > 0 && (o = Je(e.creep, n, "builder_tower", 10))) return {
type: "transfer",
target: o,
resourceType: RESOURCE_ENERGY
};
var a = function(e) {
if (!e.room) return null;
var t = e.memory;
if (t.targetId) {
var r = Game.getObjectById(t.targetId);
if (r) return r;
}
var o = e.room.find(FIND_MY_CONSTRUCTION_SITES);
if (0 === o.length) return null;
var n = e.pos.findClosestByRange(o);
return n && (t.targetId = n.id), n;
}(e.creep);
return a ? {
type: "build",
target: a
} : e.prioritizedSites.length > 0 ? {
type: "build",
target: e.prioritizedSites[0]
} : e.room.controller ? {
type: "upgrade",
target: e.room.controller
} : {
type: "idle"
};
}
return ta(e);
},
upgrader: function(e) {
if (Jn(e)) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (u = Je(e.creep, t, "upgrader_spawn", 5))) return {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (u = Je(e.creep, r, "upgrader_ext", 5))) return {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
var o = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
return o.length > 0 && (u = Je(e.creep, o, "upgrader_tower", 10)) ? {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
} : e.room.controller ? {
type: "upgrade",
target: e.room.controller
} : {
type: "idle"
};
}
var n = e.room.controller;
if (n) {
var a = n.pos.findInRange(FIND_MY_STRUCTURES, 2, {
filter: function(e) {
return e.structureType === STRUCTURE_LINK && e.store.getUsedCapacity(RESOURCE_ENERGY) > 50;
}
});
if (a.length > 0) return {
type: "withdraw",
target: a.reduce(function(e, t) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > t.store.getUsedCapacity(RESOURCE_ENERGY) ? e : t;
}),
resourceType: RESOURCE_ENERGY
};
}
var i = "upgrader_nearby_containers", s = e.creep.memory, c = s[i], l = [];
if (c && Game.time - c.tick < 30 ? l = c.ids.map(function(e) {
return Game.getObjectById(e);
}).filter(function(e) {
return null !== e;
}) : (l = e.creep.pos.findInRange(FIND_STRUCTURES, 3, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(RESOURCE_ENERGY) > 50;
}
}), s[i] = {
ids: l.map(function(e) {
return e.id;
}),
tick: Game.time
}), l.length > 0 && (u = Je(e.creep, l, "upgrader_nearby", 30))) return {
type: "withdraw",
target: u,
resourceType: RESOURCE_ENERGY
};
if (e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1e3) return {
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var u, m = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (m.length > 0 && (u = Je(e.creep, m, "upgrader_cont", 30))) return {
type: "withdraw",
target: u,
resourceType: RESOURCE_ENERGY
};
var p = qe(e.room).filter(function(e) {
return e.energy > 0;
});
if (p.length > 0) {
var d = Je(e.creep, p, "upgrader_source", 30);
if (d) return {
type: "harvest",
target: d
};
}
return {
type: "idle"
};
},
queenCarrier: function(e) {
return Jn(e) ? ra(e) || (e.storage ? {
type: "moveTo",
target: e.storage
} : {
type: "idle"
}) : e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0 ? {
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
} : e.terminal && e.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0 ? {
type: "withdraw",
target: e.terminal,
resourceType: RESOURCE_ENERGY
} : {
type: "idle"
};
},
mineralHarvester: function(e) {
var t, r = Ve(e.room, FIND_MINERALS)[0];
if (!r) return {
type: "idle"
};
if (!r.pos.lookFor(LOOK_STRUCTURES).find(function(e) {
return e.structureType === STRUCTURE_EXTRACTOR;
})) return {
type: "idle"
};
if (0 === r.mineralAmount) return e.storage ? {
type: "moveTo",
target: e.storage
} : {
type: "idle"
};
if (e.isFull) {
var o = Object.keys(e.creep.store)[0], n = e.creep.pos.findInRange(FIND_STRUCTURES, 1, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getFreeCapacity(o) > 0;
}
})[0];
if (n) return {
type: "transfer",
target: n,
resourceType: o
};
var a = null !== (t = e.terminal) && void 0 !== t ? t : e.storage;
if (a) return {
type: "transfer",
target: a,
resourceType: o
};
}
return {
type: "harvestMineral",
target: r
};
},
depositHarvester: function(e) {
var t;
if (!e.memory.targetId) {
var r = Ve(e.room, FIND_DEPOSITS);
if (r.length > 0) {
var o = r.reduce(function(e, t) {
return e.cooldown < t.cooldown ? e : t;
});
e.memory.targetId = o.id;
}
}
if (!e.memory.targetId) return {
type: "idle"
};
var n, a = Game.getObjectById(e.memory.targetId);
if (!a || null === (n = a) || "object" != typeof n || !("depositType" in n) || !("cooldown" in n) || "structureType" in n) return delete e.memory.targetId, 
{
type: "idle"
};
var i = a;
if (i.cooldown > 100) return delete e.memory.targetId, {
type: "idle"
};
if (e.isFull) {
var s = Game.rooms[e.homeRoom];
if (s) {
var c = null !== (t = s.terminal) && void 0 !== t ? t : s.storage;
if (c) return {
type: "transfer",
target: c,
resourceType: Object.keys(e.creep.store)[0]
};
}
return {
type: "moveToRoom",
roomName: e.homeRoom
};
}
return {
type: "harvestDeposit",
target: i
};
},
labTech: function(e) {
var t, r, o, n, i, s, c, l, u, m;
if (0 === e.labs.length) return {
type: "idle"
};
var p = e.labs.slice(0, 2), d = e.labs.slice(2);
if (e.creep.store.getUsedCapacity() > 0) {
var f = Object.keys(e.creep.store)[0], y = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
if (f !== RESOURCE_ENERGY && !y.includes(f)) {
var g = null !== (u = e.terminal) && void 0 !== u ? u : e.storage;
if (g) return {
type: "transfer",
target: g,
resourceType: f
};
}
try {
for (var h = a(p), v = h.next(); !v.done; v = h.next()) {
var R = (w = v.value).store.getFreeCapacity(f);
if (null !== R && R > 0) return {
type: "transfer",
target: w,
resourceType: f
};
}
} catch (e) {
t = {
error: e
};
} finally {
try {
v && !v.done && (r = h.return) && r.call(h);
} finally {
if (t) throw t.error;
}
}
}
try {
for (var E = a(d), T = E.next(); !T.done; T = E.next()) {
var C = (w = T.value).mineralType;
if (C && w.store.getUsedCapacity(C) > 100) return {
type: "withdraw",
target: w,
resourceType: C
};
}
} catch (e) {
o = {
error: e
};
} finally {
try {
T && !T.done && (n = E.return) && n.call(E);
} finally {
if (o) throw o.error;
}
}
var S = null !== (m = e.terminal) && void 0 !== m ? m : e.storage;
if (S) {
var _ = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
try {
for (var O = a(p), b = O.next(); !b.done; b = O.next()) {
var w = b.value;
try {
for (var U = (c = void 0, a(_)), x = U.next(); !x.done; x = U.next()) {
var A = x.value;
if (S.store.getUsedCapacity(A) > 0 && w.store.getFreeCapacity(A) > 0) return {
type: "withdraw",
target: S,
resourceType: A
};
}
} catch (e) {
c = {
error: e
};
} finally {
try {
x && !x.done && (l = U.return) && l.call(U);
} finally {
if (c) throw c.error;
}
}
}
} catch (e) {
i = {
error: e
};
} finally {
try {
b && !b.done && (s = O.return) && s.call(O);
} finally {
if (i) throw i.error;
}
}
}
return {
type: "idle"
};
},
labSupply: function(e) {
var t = function(e) {
var t, r, o = null !== (t = e.memory.working) && void 0 !== t && t;
e.isEmpty && (e.memory.working = !1), e.isFull && (e.memory.working = !0);
var n = null !== (r = e.memory.working) && void 0 !== r && r;
return o !== n && (et(e.creep), delete e.memory.targetId), n;
}(e);
return t ? function(e) {
if (e.memory.targetId) {
var t = Game.getObjectById(e.memory.targetId);
if (t && t.structureType === STRUCTURE_LAB) {
var r = t, o = Object.keys(e.creep.store).find(function(t) {
return e.creep.store[t] > 0;
});
if (o) return {
type: "transfer",
target: r,
resourceType: o
};
}
delete e.memory.targetId;
}
var n = (e.room.name, []);
if (0 === n.length) return {
type: "idle"
};
n.sort(function(e, t) {
return t.priority - e.priority;
});
var a = n[0];
if (!a) return {
type: "idle"
};
var i = Object.keys(e.creep.store).find(function(t) {
return e.creep.store[t] > 0;
});
if (i && i !== a.resourceType && e.terminal) return {
type: "transfer",
target: e.terminal,
resourceType: i
};
var s = Game.getObjectById(a.labId);
return s ? (e.memory.targetId = a.labId, {
type: "transfer",
target: s,
resourceType: a.resourceType
}) : {
type: "idle"
};
}(e) : function(e) {
var t, r = (e.room.name, []);
if (r.length > 0) {
r.sort(function(e, t) {
return t.priority - e.priority;
});
var o = r[0];
if (o) {
var n = Game.getObjectById(o.labId);
if (n) return {
type: "withdraw",
target: n,
resourceType: o.resourceType
};
}
}
var a = (e.room.name, []);
if (a.length > 0 && e.terminal) {
a.sort(function(e, t) {
return t.priority - e.priority;
});
var i = a[0];
if (i && (null !== (t = e.terminal.store[i.resourceType]) && void 0 !== t ? t : 0) > 0) return e.memory.targetId = i.labId, 
{
type: "withdraw",
target: e.terminal,
resourceType: i.resourceType
};
}
return {
type: "idle"
};
}(e);
},
factoryWorker: function(e) {
var t, r, o, n, i;
if (!e.factory) return {
type: "idle"
};
if (Jn(e)) {
var s = Object.keys(e.creep.store)[0];
return {
type: "transfer",
target: e.factory,
resourceType: s
};
}
var c = null !== (i = e.terminal) && void 0 !== i ? i : e.storage;
if (!c) return {
type: "idle"
};
var l = [ RESOURCE_UTRIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_KEANIUM_BAR, RESOURCE_ZYNTHIUM_BAR, RESOURCE_GHODIUM_MELT, RESOURCE_OXIDANT, RESOURCE_REDUCTANT, RESOURCE_PURIFIER, RESOURCE_BATTERY ];
try {
for (var u = a(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (e.factory.store.getUsedCapacity(p) > 100) return {
type: "withdraw",
target: e.factory,
resourceType: p
};
}
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
if (e.factory.store.getUsedCapacity(RESOURCE_ENERGY) < 5e3 && c.store.getUsedCapacity(RESOURCE_ENERGY) > 1e4) return {
type: "withdraw",
target: c,
resourceType: RESOURCE_ENERGY
};
var d = [ RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_OXYGEN, RESOURCE_HYDROGEN, RESOURCE_CATALYST, RESOURCE_GHODIUM ];
try {
for (var f = a(d), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
if (e.factory.store.getUsedCapacity(g) < 1e3 && c.store.getUsedCapacity(g) > 500) return {
type: "withdraw",
target: c,
resourceType: g
};
}
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (n = f.return) && n.call(f);
} finally {
if (o) throw o.error;
}
}
return {
type: "idle"
};
},
remoteHarvester: function(e) {
var t = e.memory.targetRoom;
if (!t || t === e.memory.homeRoom) return {
type: "idle"
};
if (e.nearbyEnemies && e.hostiles.length > 0) {
var r = e.hostiles.filter(function(t) {
return e.creep.pos.getRangeTo(t) <= 5 && (t.getActiveBodyparts(ATTACK) > 0 || t.getActiveBodyparts(RANGED_ATTACK) > 0);
});
if (r.length > 0) return e.room.name === t ? {
type: "moveToRoom",
roomName: e.memory.homeRoom
} : {
type: "flee",
from: r.map(function(e) {
return e.pos;
})
};
}
if (e.room.name !== t) return {
type: "moveToRoom",
roomName: t
};
var o = e.assignedSource;
if (o || (o = function(e) {
var t = qe(e.room);
if (0 === t.length) return null;
var r = t[0];
return r && (e.memory.sourceId = r.id), r;
}(e)), !o) return {
type: "idle"
};
if (!e.creep.pos.isNearTo(o)) return {
type: "moveTo",
target: o
};
var n = e.creep.store.getCapacity(), a = e.creep.store.getFreeCapacity() > 0;
if (null === n || 0 === n || a) return {
type: "harvest",
target: o
};
var i = function(e, t) {
var r = e.memory;
if (r.remoteContainerId && r.remoteContainerTick && Game.time - r.remoteContainerTick < 50) {
var o = Game.getObjectById(r.remoteContainerId);
if (o) return o;
delete r.remoteContainerId, delete r.remoteContainerTick;
}
var n = t.pos.findInRange(FIND_STRUCTURES, 2, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}
})[0];
return n ? (r.remoteContainerId = n.id, r.remoteContainerTick = Game.time) : (delete r.remoteContainerId, 
delete r.remoteContainerTick), n;
}(e.creep, o);
return i ? {
type: "transfer",
target: i,
resourceType: RESOURCE_ENERGY
} : {
type: "drop",
resourceType: RESOURCE_ENERGY
};
},
remoteHauler: function(e) {
var t = Jn(e), r = e.memory.targetRoom, o = e.memory.homeRoom;
if (!r || r === o) return {
type: "idle"
};
if (e.nearbyEnemies && e.hostiles.length > 0) {
var n = e.hostiles.filter(function(t) {
return e.creep.pos.getRangeTo(t) <= 5 && (t.getActiveBodyparts(ATTACK) > 0 || t.getActiveBodyparts(RANGED_ATTACK) > 0);
});
if (n.length > 0) return t && e.room.name !== o ? {
type: "moveToRoom",
roomName: o
} : {
type: "flee",
from: n.map(function(e) {
return e.pos;
})
};
}
if (t) {
if (e.room.name !== o) return {
type: "moveToRoom",
roomName: o
};
var a = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (a.length > 0 && (p = Je(e.creep, a, "remoteHauler_spawn", 5))) return {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
};
var i = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (i.length > 0 && (p = Je(e.creep, i, "remoteHauler_ext", 5))) return {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
};
var s = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (s.length > 0 && (p = Je(e.creep, s, "remoteHauler_tower", 10))) return {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
};
if (e.storage && e.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) return {
type: "transfer",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var c = e.depositContainers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
return c.length > 0 && (p = Je(e.creep, c, "remoteHauler_cont", 10)) ? {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
} : e.isEmpty || e.room.name !== o ? {
type: "idle"
} : ($n(e), {
type: "moveToRoom",
roomName: r
});
}
if (e.room.name !== r) return {
type: "moveToRoom",
roomName: r
};
var l = .3 * e.creep.store.getCapacity(RESOURCE_ENERGY), u = Ve(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(RESOURCE_ENERGY) >= l;
},
filterKey: "remoteContainers"
});
if (u.length > 0 && (p = Je(e.creep, u, "remoteHauler_remoteCont", 10))) return {
type: "withdraw",
target: p,
resourceType: RESOURCE_ENERGY
};
var m = ze(e.room, RESOURCE_ENERGY).filter(function(e) {
return e.amount > 50;
});
if (m.length > 0 && (p = Je(e.creep, m, "remoteHauler_remoteDrop", 3))) return {
type: "pickup",
target: p
};
if (0 === u.length) {
var p, d = Ve(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
},
filterKey: "containers"
});
if (d.length > 0 && (p = Je(e.creep, d, "remoteHauler_waitCont", 20)) && e.creep.pos.getRangeTo(p) > 2) return {
type: "moveTo",
target: p
};
}
return {
type: "idle"
};
},
interRoomCarrier: function(e) {
var t = e.memory;
if (!t.transferRequest) return {
type: "idle"
};
var r = t.transferRequest, o = r.fromRoom, n = r.toRoom, a = r.resourceType;
if (e.creep.store.getUsedCapacity(a) > 0) {
if (e.room.name !== n) return {
type: "moveToRoom",
roomName: n
};
var i, s, c;
if (!(i = Game.rooms[n])) return {
type: "moveToRoom",
roomName: n
};
if (i.storage) return {
type: "transfer",
target: i.storage,
resourceType: a
};
if ((s = Ve(i, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getFreeCapacity(a) > 0;
},
filterKey: "container_".concat(a)
})).length > 0 && (c = Je(e.creep, s, "interRoomCarrier_targetCont", 10))) return {
type: "transfer",
target: c,
resourceType: a
};
var l = je(i, STRUCTURE_SPAWN);
return l.length > 0 ? e.creep.pos.isNearTo(l[0]) ? {
type: "drop",
resourceType: a
} : {
type: "moveTo",
target: l[0].pos
} : {
type: "idle"
};
}
return e.room.name !== o ? {
type: "moveToRoom",
roomName: o
} : (i = Game.rooms[o]) ? i.storage && i.storage.store.getUsedCapacity(a) > 0 ? {
type: "withdraw",
target: i.storage,
resourceType: a
} : (s = Ve(i, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(a) > 0;
},
filterKey: "container_".concat(a)
})).length > 0 && (c = Je(e.creep, s, "interRoomCarrier_sourceCont", 10)) ? {
type: "withdraw",
target: c,
resourceType: a
} : {
type: "idle"
} : {
type: "moveToRoom",
roomName: o
};
}
};

function ca(e) {
var t;
return (null !== (t = sa[e.memory.role]) && void 0 !== t ? t : na)(e);
}

var la = [ "TooAngel", "TedRoastBeef" ];

function ua(e) {
var t, r = e.filter(function(e) {
return !function(e) {
return t = e.owner.username, la.includes(t);
var t;
}(e);
}), o = e.length - r.length;
return o > 0 && console.log("[Alliance] Filtered ".concat(o, " allied creeps from hostile detection in ").concat(null === (t = e[0]) || void 0 === t ? void 0 : t.room.name)), 
r;
}

function ma(e) {
var t, r = ((t = {})[MOVE] = 50, t[WORK] = 100, t[CARRY] = 50, t[ATTACK] = 80, t[RANGED_ATTACK] = 150, 
t[HEAL] = 250, t[CLAIM] = 600, t[TOUGH] = 10, t);
return e.reduce(function(e, t) {
return e + r[t];
}, 0);
}

function pa(e, t) {
return void 0 === t && (t = 0), {
parts: e,
cost: ma(e),
minCapacity: t || ma(e)
};
}

var da = {
larvaWorker: {
role: "larvaWorker",
family: "economy",
bodies: [ pa([ WORK, CARRY ], 150), pa([ WORK, CARRY, MOVE ], 200), pa([ WORK, WORK, CARRY, CARRY, MOVE, MOVE ], 400), pa([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ], 600), pa([ WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 800) ],
priority: 100,
maxPerRoom: 3,
remoteRole: !1
},
harvester: {
role: "harvester",
family: "economy",
bodies: [ pa([ WORK, WORK, MOVE ], 250), pa([ WORK, WORK, WORK, WORK, MOVE, MOVE ], 500), pa([ WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE ], 700), pa([ WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE ], 800), pa([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE ], 1e3) ],
priority: 95,
maxPerRoom: 2,
remoteRole: !1
},
hauler: {
role: "hauler",
family: "economy",
bodies: [ pa([ CARRY, CARRY, MOVE, MOVE ], 200), pa([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), pa([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800), pa(s(s([], i(Array(16).fill(CARRY)), !1), i(Array(16).fill(MOVE)), !1), 1600) ],
priority: 90,
maxPerRoom: 2,
remoteRole: !0
},
upgrader: {
role: "upgrader",
family: "economy",
bodies: [ pa([ WORK, CARRY, MOVE ], 200), pa([ WORK, WORK, WORK, CARRY, MOVE, MOVE ], 450), pa([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 1e3), pa([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1700) ],
priority: 60,
maxPerRoom: 2,
remoteRole: !1
},
builder: {
role: "builder",
family: "economy",
bodies: [ pa([ WORK, CARRY, MOVE, MOVE ], 250), pa([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 650), pa([ WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1400) ],
priority: 70,
maxPerRoom: 2,
remoteRole: !1
},
queenCarrier: {
role: "queenCarrier",
family: "economy",
bodies: [ pa([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE ], 300), pa([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ], 450), pa([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 85,
maxPerRoom: 1,
remoteRole: !1
},
mineralHarvester: {
role: "mineralHarvester",
family: "economy",
bodies: [ pa([ WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE ], 550), pa([ WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE ], 850) ],
priority: 40,
maxPerRoom: 1,
remoteRole: !1
},
labTech: {
role: "labTech",
family: "economy",
bodies: [ pa([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), pa([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 35,
maxPerRoom: 1,
remoteRole: !1
},
factoryWorker: {
role: "factoryWorker",
family: "economy",
bodies: [ pa([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), pa([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 35,
maxPerRoom: 1,
remoteRole: !1
},
remoteHarvester: {
role: "remoteHarvester",
family: "economy",
bodies: [ pa([ WORK, WORK, CARRY, MOVE, MOVE, MOVE ], 400), pa([ WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 750), pa([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1050), pa([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1600) ],
priority: 85,
maxPerRoom: 6,
remoteRole: !0
},
remoteHauler: {
role: "remoteHauler",
family: "economy",
bodies: [ pa([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), pa([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800), pa(s(s([], i(Array(16).fill(CARRY)), !1), i(Array(16).fill(MOVE)), !1), 1600) ],
priority: 80,
maxPerRoom: 6,
remoteRole: !0
},
interRoomCarrier: {
role: "interRoomCarrier",
family: "economy",
bodies: [ pa([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), pa([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600), pa([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800) ],
priority: 90,
maxPerRoom: 4,
remoteRole: !1
},
crossShardCarrier: {
role: "crossShardCarrier",
family: "economy",
bodies: [ pa(s(s([], i(Array(4).fill(CARRY)), !1), i(Array(4).fill(MOVE)), !1), 400), pa(s(s([], i(Array(8).fill(CARRY)), !1), i(Array(8).fill(MOVE)), !1), 800), pa(s(s([], i(Array(12).fill(CARRY)), !1), i(Array(12).fill(MOVE)), !1), 1200), pa(s(s([], i(Array(16).fill(CARRY)), !1), i(Array(16).fill(MOVE)), !1), 1600) ],
priority: 85,
maxPerRoom: 6,
remoteRole: !0
},
guard: {
role: "guard",
family: "military",
bodies: [ pa([ TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE ], 310), pa([ TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 620), pa([ TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1070), pa([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1740) ],
priority: 65,
maxPerRoom: 4,
remoteRole: !1
},
remoteGuard: {
role: "remoteGuard",
family: "military",
bodies: [ pa([ TOUGH, ATTACK, MOVE, MOVE ], 190), pa([ TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE ], 500), pa([ TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 880) ],
priority: 65,
maxPerRoom: 2,
remoteRole: !0
},
healer: {
role: "healer",
family: "military",
bodies: [ pa([ HEAL, MOVE, MOVE ], 350), pa([ TOUGH, HEAL, HEAL, MOVE, MOVE, MOVE ], 620), pa([ TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1240), pa([ TOUGH, TOUGH, TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 2640) ],
priority: 55,
maxPerRoom: 1,
remoteRole: !1
},
soldier: {
role: "soldier",
family: "military",
bodies: [ pa([ ATTACK, ATTACK, MOVE, MOVE ], 260), pa([ ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE ], 520), pa([ TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1340) ],
priority: 50,
maxPerRoom: 1,
remoteRole: !1
},
siegeUnit: {
role: "siegeUnit",
family: "military",
bodies: [ pa([ WORK, WORK, MOVE, MOVE ], 300), pa([ TOUGH, TOUGH, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 620), pa([ TOUGH, TOUGH, TOUGH, TOUGH, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1040) ],
priority: 30,
maxPerRoom: 1,
remoteRole: !1
},
ranger: {
role: "ranger",
family: "military",
bodies: [ pa([ TOUGH, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE ], 360), pa([ TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE ], 570), pa([ TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1040), pa([ TOUGH, TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1480) ],
priority: 60,
maxPerRoom: 4,
remoteRole: !1
},
harasser: {
role: "harasser",
family: "military",
bodies: [ pa([ TOUGH, ATTACK, RANGED_ATTACK, MOVE, MOVE ], 320), pa([ TOUGH, TOUGH, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE ], 640), pa([ TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1200) ],
priority: 40,
maxPerRoom: 1,
remoteRole: !1
},
scout: {
role: "scout",
family: "utility",
bodies: [ pa([ MOVE ], 50) ],
priority: 30,
maxPerRoom: 1,
remoteRole: !0
},
claimer: {
role: "claimer",
family: "utility",
bodies: [ pa([ CLAIM, MOVE ], 650), pa([ CLAIM, CLAIM, MOVE, MOVE ], 1300) ],
priority: 50,
maxPerRoom: 3,
remoteRole: !0
},
engineer: {
role: "engineer",
family: "utility",
bodies: [ pa([ WORK, CARRY, MOVE, MOVE ], 250), pa([ WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 500) ],
priority: 55,
maxPerRoom: 2,
remoteRole: !1
},
remoteWorker: {
role: "remoteWorker",
family: "utility",
bodies: [ pa([ WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 500), pa([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 750) ],
priority: 45,
maxPerRoom: 4,
remoteRole: !0
},
powerHarvester: {
role: "powerHarvester",
family: "power",
bodies: [ pa([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 2300), pa([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 3e3) ],
priority: 30,
maxPerRoom: 2,
remoteRole: !0
},
powerCarrier: {
role: "powerCarrier",
family: "power",
bodies: [ pa(s(s([], i(Array(20).fill(CARRY)), !1), i(Array(20).fill(MOVE)), !1), 2e3), pa(s(s([], i(Array(25).fill(CARRY)), !1), i(Array(25).fill(MOVE)), !1), 2500) ],
priority: 25,
maxPerRoom: 2,
remoteRole: !0
}
};

function fa(e) {
var t, r, o, n, i = ua(e.find(FIND_HOSTILE_CREEPS));
if (0 === i.length) return {
roomName: e.name,
dangerLevel: 0,
threatScore: 0,
hostileCount: 0,
totalHostileHitPoints: 0,
totalHostileDPS: 0,
healerCount: 0,
rangedCount: 0,
meleeCount: 0,
boostedCount: 0,
dismantlerCount: 0,
estimatedDefenderCost: 0,
assistanceRequired: !1,
assistancePriority: 0,
recommendedResponse: "monitor"
};
var s = 0, c = 0, l = 0, u = 0, m = 0, p = 0, d = 0, f = 0;
try {
for (var y = a(i), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = 0, R = 0, E = 0, T = 0;
try {
for (var C = (o = void 0, a(h.body)), S = C.next(); !S.done; S = C.next()) {
var _ = S.value;
if (0 !== _.hits) switch (_.type) {
case ATTACK:
v++;
break;

case RANGED_ATTACK:
R++;
break;

case HEAL:
E++;
break;

case WORK:
T++;
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
S && !S.done && (n = C.return) && n.call(C);
} finally {
if (o) throw o.error;
}
}
c += 30 * v + 10 * R, l += h.hits, h.body.some(function(e) {
return e.boost;
}) && (u++, s += 200), E > 0 && (m++, s += 100), R > 0 && p++, v > 0 && d++, T >= 5 && (f++, 
s += 150), s += 10 * (v + R);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
g && !g.done && (r = y.return) && r.call(y);
} finally {
if (t) throw t.error;
}
}
var O, b = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER;
}
}).reduce(function(e, t) {
if (t.store.getUsedCapacity(RESOURCE_ENERGY) < 10) return e;
var r, o = i.reduce(function(e, r) {
return e + t.pos.getRangeTo(r.pos);
}, 0);
return e + ((r = o / i.length) <= 5 ? 600 : r >= 20 ? 150 : 600 - 30 * (r - 5));
}, 0), w = c > 1.5 * b, U = Math.min(100, Math.max(0, (c - b) / 10)), x = function(e, t, r) {
if (void 0 === t || void 0 === r) {
var o = va("guard"), n = va("ranger"), a = Ra(o), i = Ra(n), s = (a.avgDps + i.avgDps) / 2, c = (a.avgCost + i.avgCost) / 2;
t = null != t ? t : s, r = null != r ? r : c;
}
return t <= 0 && (t = 300, r = 1300), Math.ceil(e / t) * r;
}(c), A = function(e) {
return 0 === e ? 0 : e < ya ? 1 : e < ga ? 2 : 3;
}(s);
return O = s < 100 ? "monitor" : s < 500 && !w ? "defend" : w && s < 1e3 ? "assist" : s > 1e3 || u > 3 ? "safemode" : "defend", 
e.find(FIND_NUKES).length > 0 && (s += 500, O = "safemode", A = 3), {
roomName: e.name,
dangerLevel: A,
threatScore: s,
hostileCount: i.length,
totalHostileHitPoints: l,
totalHostileDPS: c,
healerCount: m,
rangedCount: p,
meleeCount: d,
boostedCount: u,
dismantlerCount: f,
estimatedDefenderCost: x,
assistanceRequired: w,
assistancePriority: U,
recommendedResponse: O
};
}

var ya = 300, ga = 800;

function ha(e) {
var t, r, o = 0;
try {
for (var n = a(e), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
s === ATTACK ? o += 30 : s === RANGED_ATTACK && (o += 10);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return o;
}

function va(e) {
var t = da[e];
return t ? t.bodies.map(function(e) {
return {
parts: e.parts,
cost: e.cost,
dps: ha(e.parts)
};
}).sort(function(e, t) {
return e.cost - t.cost;
}) : [];
}

function Ra(e) {
if (0 === e.length) return {
dpsPerEnergy: 300 / 1300,
avgCost: 1300,
avgDps: 300
};
var t = e.reduce(function(e, t) {
return e + t.cost;
}, 0), r = e.reduce(function(e, t) {
return e + t.dps;
}, 0), o = t / e.length, n = r / e.length;
return {
dpsPerEnergy: n / o,
avgCost: o,
avgDps: n
};
}

function Ea(e) {
Ft.info("Threat Assessment for ".concat(e.roomName, ": ") + "Danger=".concat(e.dangerLevel, ", Score=").concat(e.threatScore, ", ") + "Hostiles=".concat(e.hostileCount, ", DPS=").concat(e.totalHostileDPS, ", ") + "Response=".concat(e.recommendedResponse), {
subsystem: "Defense",
room: e.roomName,
meta: {
threat: {
dangerLevel: e.dangerLevel,
threatScore: e.threatScore,
hostileCount: e.hostileCount,
boostedCount: e.boostedCount,
healerCount: e.healerCount,
dismantlerCount: e.dismantlerCount,
recommendedResponse: e.recommendedResponse
}
}
});
}

function Ta(e, t) {
var r, o, n = null !== (r = {
1: 0,
2: 3e5,
3: 1e6,
4: 3e6,
5: 1e7,
6: 3e7,
7: 1e8,
8: 3e8
}[e]) && void 0 !== r ? r : 0;
if (0 === n) return 0;
var a = null !== (o = {
0: .3,
1: .5,
2: .8,
3: 1
}[t]) && void 0 !== o ? o : 1;
return Math.floor(n * a);
}

var Ca = [ STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_TOWER, STRUCTURE_LAB, STRUCTURE_FACTORY, STRUCTURE_POWER_SPAWN, STRUCTURE_NUKER, STRUCTURE_OBSERVER ], Sa = [ STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE ], _a = {
recalculateInterval: 1e3,
maxPathOps: 2e3,
includeRemoteRoads: !0
}, Oa = new Map;

function ba(e, t, r) {
var n, i, s, c, l, u, m, p, d, f, y, g, h, v, R, E, T;
void 0 === r && (r = {});
var C = o(o({}, _a), r), S = Oa.get(e.name);
if (S && Game.time - S.lastCalculated < C.recalculateInterval) return S;
var _ = new Set, O = null !== (E = null === (R = e.controller) || void 0 === R ? void 0 : R.level) && void 0 !== E ? E : 0, b = e.find(FIND_SOURCES), w = e.controller, U = e.storage, x = e.find(FIND_MINERALS)[0], A = null !== (T = null == U ? void 0 : U.pos) && void 0 !== T ? T : t;
try {
for (var M = a(b), k = M.next(); !k.done; k = M.next()) {
var N = Ma(A, k.value.pos, e.name, C.maxPathOps);
try {
for (var I = (s = void 0, a(N)), P = I.next(); !P.done; P = I.next()) {
var G = P.value;
_.add("".concat(G.x, ",").concat(G.y));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
P && !P.done && (c = I.return) && c.call(I);
} finally {
if (s) throw s.error;
}
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
k && !k.done && (i = M.return) && i.call(M);
} finally {
if (n) throw n.error;
}
}
if (w) {
N = Ma(A, w.pos, e.name, C.maxPathOps);
try {
for (var L = a(N), D = L.next(); !D.done; D = L.next()) G = D.value, _.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
l = {
error: e
};
} finally {
try {
D && !D.done && (u = L.return) && u.call(L);
} finally {
if (l) throw l.error;
}
}
}
if (x && O >= 6) {
N = Ma(A, x.pos, e.name, C.maxPathOps);
try {
for (var F = a(N), B = F.next(); !B.done; B = F.next()) G = B.value, _.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
m = {
error: e
};
} finally {
try {
B && !B.done && (p = F.return) && p.call(F);
} finally {
if (m) throw m.error;
}
}
}
if (!U) {
try {
for (var H = a(b), W = H.next(); !W.done; W = H.next()) {
N = Ma(t, W.value.pos, e.name, C.maxPathOps);
try {
for (var Y = (y = void 0, a(N)), K = Y.next(); !K.done; K = Y.next()) G = K.value, 
_.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
y = {
error: e
};
} finally {
try {
K && !K.done && (g = Y.return) && g.call(Y);
} finally {
if (y) throw y.error;
}
}
}
} catch (e) {
d = {
error: e
};
} finally {
try {
W && !W.done && (f = H.return) && f.call(H);
} finally {
if (d) throw d.error;
}
}
if (w) {
N = Ma(t, w.pos, e.name, C.maxPathOps);
try {
for (var V = a(N), q = V.next(); !q.done; q = V.next()) G = q.value, _.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
h = {
error: e
};
} finally {
try {
q && !q.done && (v = V.return) && v.call(V);
} finally {
if (h) throw h.error;
}
}
}
}
var j = {
roomName: e.name,
positions: _,
lastCalculated: Game.time
};
return Oa.set(e.name, j), Me.debug("Calculated road network for ".concat(e.name, ": ").concat(_.size, " positions"), {
subsystem: "RoadNetwork"
}), j;
}

function wa(e, t) {
var r = function(e) {
var t = e.match(/([WE])(\d+)([NS])(\d+)/);
return t ? {
x: ("W" === t[1] ? -1 : 1) * parseInt(t[2], 10),
y: ("N" === t[3] ? 1 : -1) * parseInt(t[4], 10)
} : null;
}, o = r(e), n = r(t);
if (!o || !n) return null;
var a = n.x - o.x, i = n.y - o.y;
return a > 0 ? "right" : a < 0 ? "left" : i > 0 ? "top" : i < 0 ? "bottom" : null;
}

function Ua(e, t) {
var r = [], o = Game.map.getRoomTerrain(e);
switch (t) {
case "top":
for (var n = 0; n < 50; n++) o.get(n, 0) !== TERRAIN_MASK_WALL && r.push(new RoomPosition(n, 0, e));
break;

case "bottom":
for (n = 0; n < 50; n++) o.get(n, 49) !== TERRAIN_MASK_WALL && r.push(new RoomPosition(n, 49, e));
break;

case "left":
for (var a = 0; a < 50; a++) o.get(0, a) !== TERRAIN_MASK_WALL && r.push(new RoomPosition(0, a, e));
break;

case "right":
for (a = 0; a < 50; a++) o.get(49, a) !== TERRAIN_MASK_WALL && r.push(new RoomPosition(49, a, e));
}
return r;
}

function xa(e, t) {
var r, o;
if (0 === t.length) return null;
var n = t[0], i = e.getRangeTo(n);
try {
for (var s = a(t), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = e.getRangeTo(l);
u < i && (i = u, n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
c && !c.done && (o = s.return) && o.call(s);
} finally {
if (r) throw r.error;
}
}
return n;
}

function Aa(e, t, r) {
var n, i, s, c, l, u, m, p, d;
void 0 === r && (r = {});
var f = o(o({}, _a), r), y = new Map;
if (!f.includeRemoteRoads) return y;
var g = e.storage, h = e.find(FIND_MY_SPAWNS)[0], v = null !== (m = null == g ? void 0 : g.pos) && void 0 !== m ? m : null == h ? void 0 : h.pos;
if (!v) return y;
try {
for (var R = a(t), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
try {
var C = wa(e.name, T);
if (!C) {
Me.warn("Cannot determine exit direction from ".concat(e.name, " to ").concat(T), {
subsystem: "RoadNetwork"
});
continue;
}
var S = Ua(e.name, C);
if (0 === S.length) {
Me.warn("No valid exit positions found in ".concat(e.name, " towards ").concat(T), {
subsystem: "RoadNetwork"
});
continue;
}
var _ = xa(v, S);
if (!_) continue;
var O = PathFinder.search(v, {
pos: _,
range: 0
}, {
plainCost: 2,
swampCost: 10,
maxOps: f.maxPathOps,
roomCallback: function(t) {
return t === e.name && ka(t);
}
});
if (!O.incomplete) try {
for (var b = (s = void 0, a(O.path)), w = b.next(); !w.done; w = b.next()) {
var U = w.value;
y.has(U.roomName) || y.set(U.roomName, new Set), null === (p = y.get(U.roomName)) || void 0 === p || p.add("".concat(U.x, ",").concat(U.y));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
w && !w.done && (c = b.return) && c.call(b);
} finally {
if (s) throw s.error;
}
}
var x = new RoomPosition(25, 25, T), A = PathFinder.search(v, {
pos: x,
range: 20
}, {
plainCost: 2,
swampCost: 10,
maxOps: f.maxPathOps,
roomCallback: function(e) {
return ka(e);
}
});
if (!A.incomplete) try {
for (var M = (l = void 0, a(A.path)), k = M.next(); !k.done; k = M.next()) U = k.value, 
y.has(U.roomName) || y.set(U.roomName, new Set), null === (d = y.get(U.roomName)) || void 0 === d || d.add("".concat(U.x, ",").concat(U.y));
} catch (e) {
l = {
error: e
};
} finally {
try {
k && !k.done && (u = M.return) && u.call(M);
} finally {
if (l) throw l.error;
}
}
} catch (e) {
var N = e instanceof Error ? e.message : String(e);
Me.warn("Failed to calculate remote road to ".concat(T, ": ").concat(N), {
subsystem: "RoadNetwork"
});
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
E && !E.done && (i = R.return) && i.call(R);
} finally {
if (n) throw n.error;
}
}
return y;
}

function Ma(e, t, r, o) {
var n, i, s = [], c = PathFinder.search(e, {
pos: t,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxOps: o,
roomCallback: function(e) {
return e === r && ka(e);
}
});
if (!c.incomplete) try {
for (var l = a(c.path), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
m.roomName === r && s.push({
x: m.x,
y: m.y
});
}
} catch (e) {
n = {
error: e
};
} finally {
try {
u && !u.done && (i = l.return) && i.call(l);
} finally {
if (n) throw n.error;
}
}
return s;
}

function ka(e) {
var t, r, o, n, i = Game.rooms[e], s = new PathFinder.CostMatrix;
if (!i) return s;
var c = i.find(FIND_STRUCTURES);
try {
for (var l = a(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
m.structureType === STRUCTURE_ROAD ? s.set(m.pos.x, m.pos.y, 1) : m.structureType === STRUCTURE_CONTAINER || m.structureType === STRUCTURE_RAMPART && "my" in m && m.my || s.set(m.pos.x, m.pos.y, 255);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
var p = i.find(FIND_MY_CONSTRUCTION_SITES);
try {
for (var d = a(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
y.structureType === STRUCTURE_ROAD ? s.set(y.pos.x, y.pos.y, 1) : y.structureType !== STRUCTURE_CONTAINER && s.set(y.pos.x, y.pos.y, 255);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
f && !f.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
return s;
}

function Na(e, t) {
return e.x <= t || e.x >= 49 - t || e.y <= t || e.y >= 49 - t;
}

function Ia(e, t, r, n) {
var i, s, c, l, u, m, p, d, f, y, g;
void 0 === n && (n = []);
var h = new Set, v = e.getTerrain();
try {
for (var R = a(r), E = R.next(); !E.done; E = R.next()) {
var T = E.value, C = t.x + T.x, S = t.y + T.y;
C >= 1 && C <= 48 && S >= 1 && S <= 48 && v.get(C, S) !== TERRAIN_MASK_WALL && h.add("".concat(C, ",").concat(S));
}
} catch (e) {
i = {
error: e
};
} finally {
try {
E && !E.done && (s = R.return) && s.call(R);
} finally {
if (i) throw i.error;
}
}
var _ = ba(e, t);
try {
for (var O = a(_.positions), b = O.next(); !b.done; b = O.next()) {
var w = b.value;
h.add(w);
}
} catch (e) {
c = {
error: e
};
} finally {
try {
b && !b.done && (l = O.return) && l.call(O);
} finally {
if (c) throw c.error;
}
}
var U = e.storage, x = e.find(FIND_MY_SPAWNS)[0], A = null !== (g = null == U ? void 0 : U.pos) && void 0 !== g ? g : null == x ? void 0 : x.pos;
if (A) {
var M = function(e, t, r) {
var n, i, s, c;
void 0 === r && (r = {});
var l = o(o({}, _a), r), u = new Set;
try {
for (var m = a([ "top", "bottom", "left", "right" ]), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
try {
var f = Ua(e.name, d);
if (0 === f.length) continue;
var y = xa(t, f);
if (!y) continue;
var g = PathFinder.search(t, {
pos: y,
range: 0
}, {
plainCost: 2,
swampCost: 10,
maxOps: l.maxPathOps,
roomCallback: function(t) {
return t === e.name && ka(t);
}
});
if (g.incomplete) Me.warn("Incomplete path when calculating exit road for ".concat(d, " in ").concat(e.name, " (target exit: ").concat(y.x, ",").concat(y.y, "). Path length: ").concat(g.path.length), {
subsystem: "RoadNetwork"
}); else try {
for (var h = (s = void 0, a(g.path)), v = h.next(); !v.done; v = h.next()) {
var R = v.value;
R.roomName === e.name && u.add("".concat(R.x, ",").concat(R.y));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
v && !v.done && (c = h.return) && c.call(h);
} finally {
if (s) throw s.error;
}
}
} catch (t) {
var E = t instanceof Error ? t.message : String(t);
Me.warn("Failed to calculate exit road for ".concat(d, " in ").concat(e.name, ": ").concat(E), {
subsystem: "RoadNetwork"
});
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
p && !p.done && (i = m.return) && i.call(m);
} finally {
if (n) throw n.error;
}
}
return u;
}(e, A);
try {
for (var k = a(M), N = k.next(); !N.done; N = k.next()) w = N.value, h.add(w);
} catch (e) {
u = {
error: e
};
} finally {
try {
N && !N.done && (m = k.return) && m.call(k);
} finally {
if (u) throw u.error;
}
}
}
if (n.length > 0) {
var I = Aa(e, n).get(e.name);
if (I) try {
for (var P = a(I), G = P.next(); !G.done; G = P.next()) w = G.value, h.add(w);
} catch (e) {
p = {
error: e
};
} finally {
try {
G && !G.done && (d = P.return) && d.call(P);
} finally {
if (p) throw p.error;
}
}
}
var L = function(e, t) {
var r, o, n, i;
void 0 === t && (t = 10);
var s = new Set, c = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
}), l = e.find(FIND_CONSTRUCTION_SITES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
});
try {
for (var u = a(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
Na(p.pos, t) && s.add("".concat(p.pos.x, ",").concat(p.pos.y));
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
try {
for (var d = a(l), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
Na(y.pos, t) && s.add("".concat(y.pos.x, ",").concat(y.pos.y));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (n) throw n.error;
}
}
return s;
}(e);
try {
for (var D = a(L), F = D.next(); !F.done; F = D.next()) w = F.value, h.add(w);
} catch (e) {
f = {
error: e
};
} finally {
try {
F && !F.done && (y = D.return) && y.call(D);
} finally {
if (f) throw f.error;
}
}
return h;
}

var Pa = function() {
function e() {
this.assignments = new Map;
}
return e.prototype.getDefenseRequestsFromMemory = function() {
var e;
return null !== (e = Memory.defenseRequests) && void 0 !== e ? e : [];
}, e.prototype.setDefenseRequestsInMemory = function(e) {
Memory.defenseRequests = e;
}, e.prototype.run = function() {
var e, t, r = this.getDefenseRequestsFromMemory();
this.cleanupAssignments();
try {
for (var o = a(r), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
this.processDefenseRequest(i);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.processDefenseRequest = function(e) {
var t = Game.rooms[e.roomName];
if (t) {
var r = fa(t), o = Math.max(e.urgency, r.dangerLevel, r.assistanceRequired ? 3 : 0), n = this.getAssignedDefenders(e.roomName, "guard"), a = this.getAssignedDefenders(e.roomName, "ranger"), i = r.assistanceRequired ? Math.max(0, Math.ceil(r.totalHostileDPS / 300) - n.length) : 0, s = r.assistanceRequired ? Math.max(0, Math.ceil(r.totalHostileDPS / 300) - a.length) : 0, c = Math.max(0, e.guardsNeeded - n.length, i), l = Math.max(0, e.rangersNeeded - a.length, s);
0 === c && 0 === l || (c > 0 && this.assignDefenders(e.roomName, "guard", c, o), 
l > 0 && this.assignDefenders(e.roomName, "ranger", l, o));
}
}, e.prototype.assignDefenders = function(e, t, r, o) {
var n, i, s = this, c = this.findHelperRooms(e, o), l = 0;
try {
for (var u = a(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (l >= r) break;
for (var d = p.find(FIND_MY_CREEPS, {
filter: function(e) {
var r = e.memory;
return r.role === t && !r.assistTarget && !s.assignments.has(e.name);
}
}), f = Math.min(d.length, 2, r - l), y = 0; y < f; y++) {
var g = d[y];
if (g) {
var h = Game.map.getRoomLinearDistance(p.name, e), v = Game.time + 50 * h, R = {
creepName: g.name,
targetRoom: e,
assignedAt: Game.time,
eta: v
};
this.assignments.set(g.name, R), g.memory.assistTarget = e, l++, Ft.info("Assigned ".concat(t, " ").concat(g.name, " from ").concat(p.name, " to assist ").concat(e, " (ETA: ").concat(v - Game.time, " ticks)"), {
subsystem: "Defense"
});
}
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
m && !m.done && (i = u.return) && i.call(u);
} finally {
if (n) throw n.error;
}
}
l > 0 && Ft.info("Defense coordination: Assigned ".concat(l, "/").concat(r, " ").concat(t, "s to ").concat(e), {
subsystem: "Defense"
});
}, e.prototype.findHelperRooms = function(e, t) {
var r = Object.values(Game.rooms).filter(function(t) {
var r;
return (null === (r = t.controller) || void 0 === r ? void 0 : r.my) && t.name !== e;
});
return r.map(function(r) {
var o = 0;
o -= 10 * Game.map.getRoomLinearDistance(e, r.name), o += 20 * r.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory, r = t.role;
return ("guard" === r || "ranger" === r) && !t.assistTarget;
}
}).length;
var n = ua(r.find(FIND_HOSTILE_CREEPS));
return o -= 30 * n.length, n.length > 0 && t < 3 && (o -= 1e3), {
room: r,
score: o
};
}).filter(function(e) {
return e.score > -500;
}).sort(function(e, t) {
return t.score - e.score;
}).map(function(e) {
return e.room;
});
}, e.prototype.getAssignedDefenders = function(e, t) {
var r, o, n = [];
try {
for (var s = a(this.assignments.entries()), c = s.next(); !c.done; c = s.next()) {
var l = i(c.value, 2), u = l[0], m = l[1];
if (m.targetRoom === e) {
var p = Game.creeps[u];
if (p) {
if (t && p.memory.role !== t) continue;
n.push(m);
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
c && !c.done && (o = s.return) && o.call(s);
} finally {
if (r) throw r.error;
}
}
return n;
}, e.prototype.cleanupAssignments = function() {
var e, t, r, o, n = [];
try {
for (var s = a(this.assignments.entries()), c = s.next(); !c.done; c = s.next()) {
var l = i(c.value, 2), u = l[0], m = l[1], p = Game.creeps[u];
p ? (p.room.name === m.targetRoom && 0 === ua(p.room.find(FIND_HOSTILE_CREEPS)).length && (delete p.memory.assistTarget, 
n.push(u), Ft.debug("Released ".concat(u, " from defense assistance (no hostiles in ").concat(m.targetRoom, ")"), {
subsystem: "Defense"
})), Game.time - m.assignedAt > 1e3 && (delete p.memory.assistTarget, n.push(u), 
Ft.debug("Removed stale defense assignment for ".concat(u), {
subsystem: "Defense"
}))) : n.push(u);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = s.return) && t.call(s);
} finally {
if (e) throw e.error;
}
}
try {
for (var d = a(n), f = d.next(); !f.done; f = d.next()) u = f.value, this.assignments.delete(u);
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.getAssignmentsForRoom = function(e) {
return this.getAssignedDefenders(e);
}, e.prototype.getAllAssignments = function() {
return Array.from(this.assignments.values());
}, e.prototype.cancelAssignment = function(e) {
if (this.assignments.get(e)) {
var t = Game.creeps[e];
t && delete t.memory.assistTarget, this.assignments.delete(e), Ft.info("Cancelled defense assignment for ".concat(e), {
subsystem: "Defense"
});
}
}, n([ Rr("cluster:defense", "Defense Coordinator", {
priority: $t.HIGH,
interval: 3,
minBucket: 0,
cpuBudget: .05
}) ], e.prototype, "run", null), n([ Cr() ], e);
}(), Ga = new Pa;

function La(e) {
return !!function(e, t) {
if ("retreat" === t.recommendedResponse || "safemode" === t.recommendedResponse) return !0;
var r = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory;
return "defender" === t.role || "rangedDefender" === t.role || "guard" === t.role || "ranger" === t.role;
}
});
if (t.hostileCount > 3 * r.length) return Ft.info("Creep ".concat(e.name, " retreating: heavily outnumbered (").concat(t.hostileCount, " hostiles vs ").concat(r.length, " defenders)"), {
subsystem: "Defense",
room: e.room.name,
creep: e.name
}), !0;
var o = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
return "healer" === e.memory.role;
}
});
return e.hits < .3 * e.hitsMax && t.healerCount > 0 && 0 === o.length ? (Ft.info("Creep ".concat(e.name, " retreating: damaged (").concat(e.hits, "/").concat(e.hitsMax, ") facing ").concat(t.healerCount, " enemy healers without friendly healer support"), {
subsystem: "Defense",
room: e.room.name,
creep: e.name
}), !0) : t.boostedCount > 0 && r.length < 2 * t.boostedCount && (Ft.info("Creep ".concat(e.name, " retreating: facing ").concat(t.boostedCount, " boosted hostiles without sufficient support"), {
subsystem: "Defense",
room: e.room.name,
creep: e.name
}), !0);
}(e, fa(e.room)) && (function(e) {
var t, r, o, n, c = e.room.find(FIND_MY_SPAWNS)[0];
if (c) {
var l = e.moveTo(c, {
range: 3,
visualizePathStyle: {
stroke: "#ffaa00"
}
});
if (l === OK || l === ERR_TIRED) return;
}
var u = Game.map.describeExits(e.room.name);
if (u) {
var m = ((t = {})[TOP] = FIND_EXIT_TOP, t[BOTTOM] = FIND_EXIT_BOTTOM, t[LEFT] = FIND_EXIT_LEFT, 
t[RIGHT] = FIND_EXIT_RIGHT, t), p = [];
try {
for (var d = a(Object.entries(u)), f = d.next(); !f.done; f = d.next()) {
var y = i(f.value, 2), g = y[0], h = y[1], v = Number(g), R = Game.rooms[h];
if (null === (n = null == R ? void 0 : R.controller) || void 0 === n ? void 0 : n.my) {
var E = m[v];
if (E) {
var T = e.room.find(E);
T.length > 0 && p.push.apply(p, s([], i(T), !1));
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
if (p.length > 0) {
var C = e.pos.findClosestByPath(p);
if (C) return void e.moveTo(C, {
visualizePathStyle: {
stroke: "#ffaa00"
}
});
}
}
var S = e.pos.findClosestByPath(FIND_EXIT);
S && e.moveTo(S, {
visualizePathStyle: {
stroke: "#ff0000"
}
});
}(e), !0);
}

var Da, Fa = function() {
function t() {}
return t.prototype.coordinateDefense = function(t) {
var r, o, n, i, s = function(t) {
var r = e.memoryManager.getCluster(t);
return r ? r.memberRooms : [];
}(t);
if (0 !== s.length) {
var c = [];
try {
for (var l = a(s), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = Game.rooms[m];
if (p) {
var d = fa(p);
c.push(d), d.dangerLevel >= 2 && Ea(d);
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
var f = c.filter(function(e) {
return e.assistanceRequired;
}).sort(function(e, t) {
return t.assistancePriority - e.assistancePriority;
});
try {
for (var y = a(f), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = this.findAvailableDefenders(s, h.roomName);
v.length > 0 && (this.sendDefenders(v, h.roomName), Ft.info("Cluster Defense: Sending ".concat(v.length, " defenders to ").concat(h.roomName), {
subsystem: "Defense",
room: h.roomName,
meta: {
cluster: t,
targetRoom: h.roomName,
threatScore: h.threatScore,
priority: h.assistancePriority
}
}));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
g && !g.done && (i = y.return) && i.call(y);
} finally {
if (n) throw n.error;
}
}
this.coordinateSafeMode(c);
}
}, t.prototype.findAvailableDefenders = function(e, t) {
var r, o, n = [];
try {
for (var c = a(e), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u !== t) {
var m = Game.rooms[u];
if (m && 0 === fa(m).dangerLevel) {
var p = m.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory;
return ("defender" === t.role || "rangedDefender" === t.role || "guard" === t.role || "ranger" === t.role) && !t.assistTarget;
}
});
n.push.apply(n, s([], i(p), !1));
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
return n;
}, t.prototype.sendDefenders = function(e, t) {
var r, o;
try {
for (var n = a(e), i = n.next(); !i.done; i = n.next()) i.value.memory.assistTarget = t;
} catch (e) {
r = {
error: e
};
} finally {
try {
i && !i.done && (o = n.return) && o.call(n);
} finally {
if (r) throw r.error;
}
}
}, t.prototype.coordinateSafeMode = function(e) {
var t, r = e.filter(function(e) {
return "safemode" === e.recommendedResponse;
});
if (0 !== r.length) {
var o = r.reduce(function(e, t) {
return t.threatScore > e.threatScore ? t : e;
}), n = Game.rooms[o.roomName];
if ((null === (t = null == n ? void 0 : n.controller) || void 0 === t ? void 0 : t.my) && n.controller.safeModeAvailable > 0 && !n.controller.safeMode && !n.controller.safeModeCooldown) {
var a = n.controller.activateSafeMode();
a === OK ? Ft.warn("Activated safe mode in ".concat(o.roomName), {
subsystem: "Defense",
room: o.roomName,
meta: {
threatScore: o.threatScore,
hostiles: o.hostileCount,
dangerLevel: o.dangerLevel
}
}) : Ft.error("Failed to activate safe mode in ".concat(o.roomName, ": ").concat(a), {
subsystem: "Defense",
room: o.roomName,
meta: {
errorCode: a
}
});
}
}
}, t;
}(), Ba = new Fa;

function Ha(e) {
var t, r, o, n, i, s, c = {
guards: 0,
rangers: 0,
healers: 0,
urgency: 1,
reasons: []
}, l = null !== (s = null === (i = e.controller) || void 0 === i ? void 0 : i.level) && void 0 !== s ? s : 1;
l >= 3 && (c.guards = 1, c.rangers = 1, c.reasons.push("Baseline defense force for RCL ".concat(l)));
var u = e.find(FIND_HOSTILE_CREEPS);
if (0 === u.length) return c;
var m = 0, p = 0, d = 0, f = 0, y = 0;
try {
for (var g = a(u), h = g.next(); !h.done; h = g.next()) {
var v = h.value.body, R = v.some(function(e) {
return void 0 !== e.boost;
});
R && y++;
try {
for (var E = (o = void 0, a(v)), T = E.next(); !T.done; T = E.next()) {
var C = T.value;
C.type === ATTACK && m++, C.type === RANGED_ATTACK && p++, C.type === HEAL && d++, 
C.type === WORK && f++;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
T && !T.done && (n = E.return) && n.call(E);
} finally {
if (o) throw o.error;
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
h && !h.done && (r = g.return) && r.call(g);
} finally {
if (t) throw t.error;
}
}
return m > 0 && (c.guards = Math.max(1, Math.ceil(m / 4)), c.reasons.push("".concat(m, " melee parts detected"))), 
p > 0 && (c.rangers = Math.max(1, Math.ceil(p / 6)), c.reasons.push("".concat(p, " ranged parts detected"))), 
d > 0 && (c.healers = Math.max(1, Math.ceil(d / 8)), c.reasons.push("".concat(d, " heal parts detected"))), 
f > 0 && (c.guards += Math.ceil(f / 5), c.reasons.push("".concat(f, " work parts (dismantlers)"))), 
y > 0 && (c.guards = Math.ceil(1.5 * c.guards), c.rangers = Math.ceil(1.5 * c.rangers), 
c.healers = Math.ceil(1.5 * c.healers), c.urgency = 2, c.reasons.push("".concat(y, " boosted enemies (high threat)"))), 
u.length > 0 && (c.guards = Math.max(c.guards, 2), c.rangers = Math.max(c.rangers, 2)), 
u.length >= 3 && (c.healers = Math.max(c.healers, 1)), u.length >= 5 && (c.urgency = Math.max(c.urgency, 1.5), 
c.reasons.push("".concat(u.length, " hostiles (large attack)"))), e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_STORAGE || e.structureType === STRUCTURE_TERMINAL) && e.hits < .8 * e.hitsMax;
}
}).length > 0 && (c.urgency = 3, c.reasons.push("Critical structures under attack!")), 
Me.info("Defender analysis for ".concat(e.name, ": ").concat(c.guards, " guards, ").concat(c.rangers, " rangers, ").concat(c.healers, " healers (urgency: ").concat(c.urgency, "x) - ").concat(c.reasons.join(", ")), {
subsystem: "Defense"
}), c;
}

function Wa(e) {
var t = e.find(FIND_MY_CREEPS);
return {
guards: t.filter(function(e) {
return "guard" === e.memory.role;
}).length,
rangers: t.filter(function(e) {
return "ranger" === e.memory.role;
}).length,
healers: t.filter(function(e) {
return "healer" === e.memory.role;
}).length
};
}

function Ya(e, t) {
var r, o;
if (t.danger < 1) return !1;
var n = Ha(e), a = Wa(e), i = n.guards - a.guards + (n.rangers - a.rangers);
if (i <= 0) return !1;
var s = e.find(FIND_MY_SPAWNS);
if (0 === s.length) return !0;
if (0 === s.filter(function(e) {
return !e.spawning;
}).length && i >= 1) return !0;
if (e.energyAvailable < 250 && i >= 1) return !0;
if (n.urgency >= 2 && i >= 2) return !0;
if (t.danger >= 3 && i >= 1) return !0;
var c = null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 1;
return t.danger >= 2 && (i >= 2 || c <= 3);
}

!function(e) {
e[e.NONE = 0] = "NONE", e[e.LOW = 1] = "LOW", e[e.MEDIUM = 2] = "MEDIUM", e[e.HIGH = 3] = "HIGH", 
e[e.CRITICAL = 4] = "CRITICAL";
}(Da || (Da = {}));

var Ka = function() {
function e() {
this.emergencyStates = new Map;
}
return e.prototype.assess = function(e, t) {
var r, o = this.emergencyStates.get(e.name), n = this.calculateEmergencyLevel(e, t);
return n !== Da.NONE || o ? (o ? (r = o).level = n : (r = {
level: n,
startedAt: Game.time,
assistanceRequested: !1,
boostsAllocated: !1,
lastEscalation: 0
}, this.emergencyStates.set(e.name, r)), n === Da.NONE ? (o && (Ft.info("Emergency resolved in ".concat(e.name), {
subsystem: "Defense"
}), this.emergencyStates.delete(e.name)), r) : (o && n > o.level && (Ft.warn("Emergency escalated in ".concat(e.name, ": Level ").concat(o.level, " → ").concat(n), {
subsystem: "Defense"
}), r.lastEscalation = Game.time), this.executeEmergencyResponse(e, t, r), r)) : {
level: Da.NONE,
startedAt: Game.time,
assistanceRequested: !1,
boostsAllocated: !1,
lastEscalation: 0
};
}, e.prototype.calculateEmergencyLevel = function(e, t) {
if (0 === t.danger) return Da.NONE;
var r = ua(e.find(FIND_HOSTILE_CREEPS)), o = Ha(e), n = Wa(e);
if (e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_STORAGE || e.structureType === STRUCTURE_TERMINAL) && e.hits < .3 * e.hitsMax;
}
}).length > 0) return Da.CRITICAL;
var a = r.filter(function(e) {
return e.body.some(function(e) {
return e.boost;
});
}), i = o.guards - n.guards + (o.rangers - n.rangers);
return a.length > 0 && i >= 2 || r.length >= 5 && 0 === n.guards && 0 === n.rangers ? Da.HIGH : t.danger >= 2 && i >= 1 ? Da.MEDIUM : t.danger >= 1 ? Da.LOW : Da.NONE;
}, e.prototype.executeEmergencyResponse = function(e, t, r) {
r.level !== Da.HIGH && r.level !== Da.CRITICAL || r.assistanceRequested || this.requestDefenseAssistance(e, t) && (r.assistanceRequested = !0), 
r.level >= Da.MEDIUM && !r.boostsAllocated && e.controller && e.controller.level >= 6 && (this.allocateBoostsForDefense(e, t), 
r.boostsAllocated = !0), this.updateDefensePosture(e, t, r);
}, e.prototype.requestDefenseAssistance = function(e, t) {
var r;
if (!Ya(e, t)) return !1;
var o = function(e, t) {
if (!Ya(e, t)) return null;
var r = Ha(e), o = Wa(e), n = {
roomName: e.name,
guardsNeeded: Math.max(0, r.guards - o.guards),
rangersNeeded: Math.max(0, r.rangers - o.rangers),
healersNeeded: Math.max(0, r.healers - o.healers),
urgency: r.urgency,
createdAt: Game.time,
threat: r.reasons.join("; ")
};
return Me.warn("Defense assistance requested for ".concat(e.name, ": ").concat(n.guardsNeeded, " guards, ").concat(n.rangersNeeded, " rangers, ").concat(n.healersNeeded, " healers - ").concat(n.threat), {
subsystem: "Defense"
}), n;
}(e, t);
if (!o) return !1;
var n = Memory, a = (null !== (r = n.defenseRequests) && void 0 !== r ? r : []).filter(function(t) {
return t.roomName !== e.name || Game.time - t.createdAt < 500;
});
return a.push(o), n.defenseRequests = a, Ft.warn("Defense assistance requested for ".concat(e.name, ": ") + "".concat(o.guardsNeeded, " guards, ").concat(o.rangersNeeded, " rangers - ").concat(o.threat), {
subsystem: "Defense"
}), !0;
}, e.prototype.allocateBoostsForDefense = function(e, t) {
var r, o = Memory, n = null !== (r = o.boostDefensePriority) && void 0 !== r ? r : {};
n[e.name] = !0, o.boostDefensePriority = n, Ft.info("Allocated boost priority for defenders in ".concat(e.name), {
subsystem: "Defense"
});
}, e.prototype.updateDefensePosture = function(e, t, r) {
switch (r.level) {
case Da.CRITICAL:
"evacuate" !== t.posture && (t.posture = "war", t.pheromones.war = 100, t.pheromones.defense = 100, 
Ft.warn("".concat(e.name, " posture: CRITICAL DEFENSE"), {
subsystem: "Defense"
}));
break;

case Da.HIGH:
"war" !== t.posture && "evacuate" !== t.posture && (t.posture = "defensive", t.pheromones.defense = 80, 
t.pheromones.war = 40, Ft.info("".concat(e.name, " posture: HIGH DEFENSE"), {
subsystem: "Defense"
}));
break;

case Da.MEDIUM:
"eco" !== t.posture && "expand" !== t.posture || (t.posture = "defensive", t.pheromones.defense = 60, 
Ft.info("".concat(e.name, " posture: MEDIUM DEFENSE"), {
subsystem: "Defense"
}));
break;

case Da.LOW:
"eco" !== t.posture && "expand" !== t.posture || (t.pheromones.defense = 30, Ft.debug("".concat(e.name, ": LOW DEFENSE alert"), {
subsystem: "Defense"
}));
}
}, e.prototype.getDefenseRequests = function() {
var e, t = Memory, r = null !== (e = t.defenseRequests) && void 0 !== e ? e : [], o = r.filter(function(e) {
return Game.time - e.createdAt < 500;
});
return o.length !== r.length && (t.defenseRequests = o), o;
}, e.prototype.clearDefenseRequest = function(e) {
var t, r = Memory, o = (null !== (t = r.defenseRequests) && void 0 !== t ? t : []).filter(function(t) {
return t.roomName !== e;
});
r.defenseRequests = o;
}, e.prototype.getEmergencyState = function(e) {
return this.emergencyStates.get(e);
}, e.prototype.hasEmergency = function(e) {
var t = this.emergencyStates.get(e);
return void 0 !== t && t.level > Da.NONE;
}, e.prototype.getActiveEmergencies = function() {
var e, t, r = [];
try {
for (var o = a(this.emergencyStates.entries()), n = o.next(); !n.done; n = o.next()) {
var s = i(n.value, 2), c = s[0], l = s[1];
l.level > Da.NONE && r.push({
roomName: c,
state: l
});
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
return r.sort(function(e, t) {
return t.state.level - e.state.level;
});
}, e;
}(), Va = new Ka, qa = function() {
function e() {}
return e.prototype.checkSafeMode = function(e, t) {
var r, o, n, a, i;
if (!(null === (r = e.controller) || void 0 === r ? void 0 : r.safeMode) && !(null === (o = e.controller) || void 0 === o ? void 0 : o.safeModeCooldown) && 0 !== (null !== (a = null === (n = e.controller) || void 0 === n ? void 0 : n.safeModeAvailable) && void 0 !== a ? a : 0) && this.shouldTriggerSafeMode(e, t)) {
var s = null === (i = e.controller) || void 0 === i ? void 0 : i.activateSafeMode();
if (s === OK) Ft.warn("SAFE MODE ACTIVATED in ".concat(e.name), {
subsystem: "Defense"
}); else {
var c = void 0 !== s ? String(s) : "undefined";
Ft.error("Failed to activate safe mode in ".concat(e.name, ": ").concat(c), {
subsystem: "Defense"
});
}
}
}, e.prototype.shouldTriggerSafeMode = function(e, t) {
var r, o;
if (t.danger < 2) return !1;
var n = e.find(FIND_MY_SPAWNS);
try {
for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (c.hits < .2 * c.hitsMax) return Ft.warn("Spawn ".concat(c.name, " critical: ").concat(c.hits, "/").concat(c.hitsMax), {
subsystem: "Defense"
}), !0;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
if (e.storage && e.storage.hits < .2 * e.storage.hitsMax) return Ft.warn("Storage critical: ".concat(e.storage.hits, "/").concat(e.storage.hitsMax), {
subsystem: "Defense"
}), !0;
if (e.terminal && e.terminal.hits < .2 * e.terminal.hitsMax) return Ft.warn("Terminal critical: ".concat(e.terminal.hits, "/").concat(e.terminal.hitsMax), {
subsystem: "Defense"
}), !0;
var l = ua(e.find(FIND_HOSTILE_CREEPS)), u = e.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory.role;
return "guard" === t || "ranger" === t || "soldier" === t;
}
});
if (l.length > 3 * u.length) return Ft.warn("Overwhelmed: ".concat(l.length, " hostiles vs ").concat(u.length, " defenders"), {
subsystem: "Defense"
}), !0;
var m = l.filter(function(e) {
return e.body.some(function(e) {
return e.boost;
});
});
return m.length > 0 && u.length < 2 * m.length && (Ft.warn("Boosted hostiles detected: ".concat(m.length), {
subsystem: "Defense"
}), !0);
}, e;
}(), ja = new qa, za = {
triggerDangerLevel: 3,
nukeEvacuationLeadTime: 5e3,
minStorageEnergy: 5e4,
priorityResources: [ RESOURCE_ENERGY, RESOURCE_POWER, RESOURCE_GHODIUM, RESOURCE_CATALYZED_GHODIUM_ACID, RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_LEMERGIUM_ACID, RESOURCE_CATALYZED_KEANIUM_ACID, RESOURCE_CATALYZED_ZYNTHIUM_ACID, RESOURCE_OPS ],
maxTransfersPerTick: 2
}, Xa = function() {
function t(e) {
void 0 === e && (e = {}), this.evacuations = new Map, this.lastTransferTick = 0, 
this.transfersThisTick = 0, this.config = o(o({}, za), e);
}
return t.prototype.run = function() {
var e, t, r, o;
Game.time !== this.lastTransferTick && (this.transfersThisTick = 0, this.lastTransferTick = Game.time), 
this.checkEvacuationTriggers();
try {
for (var n = a(this.evacuations.values()), s = n.next(); !s.done; s = n.next()) (u = s.value).complete || this.processEvacuation(u);
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
try {
for (var c = a(this.evacuations.entries()), l = c.next(); !l.done; l = c.next()) {
var u, m = i(l.value, 2), p = m[0];
(u = m[1]).complete && Game.time - u.startedAt > 1e3 && this.evacuations.delete(p);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
}, t.prototype.checkEvacuationTriggers = function() {
var t, r, o, n;
for (var a in Game.rooms) {
var i = Game.rooms[a];
if ((null === (t = i.controller) || void 0 === t ? void 0 : t.my) && !this.evacuations.has(a)) {
var s = e.memoryManager.getSwarmState(a);
if (s) {
var c = i.find(FIND_NUKES);
if (c.length > 0) {
var l = c.reduce(function(e, t) {
var r, o;
return (null !== (r = e.timeToLand) && void 0 !== r ? r : 1 / 0) < (null !== (o = t.timeToLand) && void 0 !== o ? o : 1 / 0) ? e : t;
});
if ((null !== (r = l.timeToLand) && void 0 !== r ? r : 1 / 0) <= this.config.nukeEvacuationLeadTime) {
s.nukeDetected || (s.nukeDetected = !0);
var u = c.length;
Ft.warn("Triggering evacuation for ".concat(a, ": ").concat(u, " nuke(s) detected, impact in ").concat(null !== (o = l.timeToLand) && void 0 !== o ? o : 0, " ticks"), {
subsystem: "Evacuation"
}), this.startEvacuation(a, "nuke", Game.time + (null !== (n = l.timeToLand) && void 0 !== n ? n : 0));
continue;
}
}
if (s.danger >= this.config.triggerDangerLevel && "siege" === s.posture) {
var m = ua(i.find(FIND_HOSTILE_CREEPS)), p = i.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.body.map(function(e) {
return e.type;
});
return t.includes(ATTACK) || t.includes(RANGED_ATTACK);
}
});
if (m.length > 3 * p.length) {
this.startEvacuation(a, "siege");
continue;
}
}
}
}
}
}, t.prototype.startEvacuation = function(t, r, o) {
var n;
if (this.evacuations.has(t)) return !1;
var a = Game.rooms[t];
if (!a || !(null === (n = a.controller) || void 0 === n ? void 0 : n.my)) return !1;
var i = this.findEvacuationTarget(t);
if (!i) return Ft.error("Cannot evacuate ".concat(t, ": no valid target room found"), {
subsystem: "Evacuation"
}), !1;
var s = {
roomName: t,
reason: r,
startedAt: Game.time,
targetRoom: i,
resourcesEvacuated: [],
creepsRecalled: [],
progress: 0,
complete: !1,
deadline: o
};
this.evacuations.set(t, s);
var c = e.memoryManager.getSwarmState(t);
return c && (c.posture = "evacuate"), Ft.warn("Starting evacuation of ".concat(t, " (").concat(r, "), target: ").concat(i) + (o ? ", deadline: ".concat(o - Game.time, " ticks") : ""), {
subsystem: "Evacuation"
}), !0;
}, t.prototype.findEvacuationTarget = function(e) {
var t, r, o = Object.values(Game.rooms).filter(function(t) {
var r;
return (null === (r = t.controller) || void 0 === r ? void 0 : r.my) && t.name !== e;
});
if (0 === o.length) return null;
var n = o.map(function(t) {
var r, o, n = 0;
if (!t.terminal) return {
room: t,
score: -1e3
};
n -= 10 * Game.map.getRoomLinearDistance(e, t.name);
var a = t.terminal.store.getFreeCapacity();
if (n += 10 * Math.min(100, a / 1e4), n += 5 * (null !== (o = null === (r = t.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0), 
t.storage) {
n += 50;
var i = t.storage.store.getFreeCapacity();
n += 5 * Math.min(100, i / 5e4);
}
var s = ua(t.find(FIND_HOSTILE_CREEPS));
return s.length > 0 && (n -= 20 * s.length), {
room: t,
score: n
};
}).filter(function(e) {
return e.score > -500;
}).sort(function(e, t) {
return t.score - e.score;
});
return n.length > 0 && null !== (r = null === (t = n[0]) || void 0 === t ? void 0 : t.room.name) && void 0 !== r ? r : null;
}, t.prototype.processEvacuation = function(e) {
var t = Game.rooms[e.roomName], r = Game.rooms[e.targetRoom];
if (!t) return e.complete = !0, void Ft.error("Lost room ".concat(e.roomName, " during evacuation"), {
subsystem: "Evacuation"
});
this.transfersThisTick < this.config.maxTransfersPerTick && this.transferResources(e, t, r), 
this.recallCreeps(e, t), e.progress = this.calculateProgress(e, t), e.progress >= 100 && (e.complete = !0, 
Ft.info("Evacuation of ".concat(e.roomName, " complete: ") + "".concat(e.resourcesEvacuated.reduce(function(e, t) {
return e + t.amount;
}, 0), " resources, ") + "".concat(e.creepsRecalled.length, " creeps"), {
subsystem: "Evacuation"
})), e.deadline && Game.time >= e.deadline && (e.complete = !0, Ft.warn("Evacuation of ".concat(e.roomName, " reached deadline"), {
subsystem: "Evacuation"
}));
}, t.prototype.transferResources = function(e, t, r) {
var o, n, i, s, c = t.terminal, l = null == r ? void 0 : r.terminal;
if (c && l) {
var u = Game.map.getRoomLinearDistance(t.name, e.targetRoom), m = function(e) {
return Math.ceil(e * (1 - Math.exp(-u / 30)));
};
try {
for (var p = a(this.config.priorityResources), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
if (!((R = c.store.getUsedCapacity(f)) <= 0 || (E = l.store.getFreeCapacity(f)) <= 0)) {
var y = m(R), g = c.store.getUsedCapacity(RESOURCE_ENERGY);
if (!(f !== RESOURCE_ENERGY && y > g || (T = Math.min(R, E, 5e4)) <= 0 || c.send(f, T, e.targetRoom) !== OK)) return e.resourcesEvacuated.push({
resourceType: f,
amount: T
}), this.transfersThisTick++, void Ft.debug("Evacuated ".concat(T, " ").concat(f, " from ").concat(t.name, " to ").concat(e.targetRoom), {
subsystem: "Evacuation"
});
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
d && !d.done && (n = p.return) && n.call(p);
} finally {
if (o) throw o.error;
}
}
try {
for (var h = a(Object.keys(c.store)), v = h.next(); !v.done; v = h.next()) {
var R, E, T;
if (!(f = v.value, this.config.priorityResources.includes(f) || (R = c.store.getUsedCapacity(f)) <= 0 || (E = l.store.getFreeCapacity(f)) <= 0 || (y = m(R), 
g = c.store.getUsedCapacity(RESOURCE_ENERGY), f !== RESOURCE_ENERGY && y > g || (T = Math.min(R, E, 5e4)) <= 0 || c.send(f, T, e.targetRoom) !== OK))) return e.resourcesEvacuated.push({
resourceType: f,
amount: T
}), void this.transfersThisTick++;
}
} catch (e) {
i = {
error: e
};
} finally {
try {
v && !v.done && (s = h.return) && s.call(h);
} finally {
if (i) throw i.error;
}
}
}
}, t.prototype.recallCreeps = function(e, t) {
var r, o;
try {
for (var n = a(t.find(FIND_MY_CREEPS)), i = n.next(); !i.done; i = n.next()) {
var s = i.value, c = s.memory;
c.evacuating || (c.evacuating = !0, c.evacuationTarget = e.targetRoom, e.creepsRecalled.push(s.name));
}
} catch (e) {
r = {
error: e
};
} finally {
try {
i && !i.done && (o = n.return) && o.call(n);
} finally {
if (r) throw r.error;
}
}
}, t.prototype.calculateProgress = function(e, t) {
var r = t.terminal, o = t.storage, n = 0, a = 0;
r && (n += 1e5, a += r.store.getUsedCapacity()), o && (n += o.store.getCapacity(), 
a += o.store.getUsedCapacity());
var i = n > 0 ? Math.min(100, (n - a) / n * 100) : 100, s = t.find(FIND_MY_CREEPS).length, c = e.creepsRecalled.length > 0 ? Math.min(100, (e.creepsRecalled.length - s) / e.creepsRecalled.length * 100) : 100;
return Math.round((i + c) / 2);
}, t.prototype.cancelEvacuation = function(t) {
var r, o, n = this.evacuations.get(t);
if (n) {
this.evacuations.delete(t);
try {
for (var i = a(n.creepsRecalled), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.creeps[c];
if (l) {
var u = l.memory;
delete u.evacuating, delete u.evacuationTarget;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
var m = e.memoryManager.getSwarmState(t);
m && (m.posture = "eco"), Ft.info("Evacuation of ".concat(t, " cancelled"), {
subsystem: "Evacuation"
});
}
}, t.prototype.getEvacuationState = function(e) {
return this.evacuations.get(e);
}, t.prototype.isEvacuating = function(e) {
var t = this.evacuations.get(e);
return void 0 !== t && !t.complete;
}, t.prototype.getActiveEvacuations = function() {
return Array.from(this.evacuations.values()).filter(function(e) {
return !e.complete;
});
}, n([ Rr("cluster:evacuation", "Evacuation Manager", {
priority: $t.HIGH,
interval: 5,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(), Qa = new Xa, Za = xe("MilitaryBehaviors"), Ja = "patrol";

function $a(e) {
var t, r, o = e.find(FIND_MY_SPAWNS), n = o.length, i = e.name, s = fe.get(i, {
namespace: Ja
});
if (s && s.metadata.spawnCount === n) return s.waypoints.map(function(e) {
return new RoomPosition(e.x, e.y, e.roomName);
});
var c = e.name, l = [];
try {
for (var u = a(o), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
l.push(new RoomPosition(p.pos.x + 3, p.pos.y + 3, c)), l.push(new RoomPosition(p.pos.x - 3, p.pos.y - 3, c));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
l.push(new RoomPosition(10, 5, c)), l.push(new RoomPosition(25, 5, c)), l.push(new RoomPosition(39, 5, c)), 
l.push(new RoomPosition(10, 44, c)), l.push(new RoomPosition(25, 44, c)), l.push(new RoomPosition(39, 44, c)), 
l.push(new RoomPosition(5, 10, c)), l.push(new RoomPosition(5, 25, c)), l.push(new RoomPosition(5, 39, c)), 
l.push(new RoomPosition(44, 10, c)), l.push(new RoomPosition(44, 25, c)), l.push(new RoomPosition(44, 39, c)), 
l.push(new RoomPosition(10, 10, c)), l.push(new RoomPosition(39, 10, c)), l.push(new RoomPosition(10, 39, c)), 
l.push(new RoomPosition(39, 39, c)), l.push(new RoomPosition(25, 25, c));
var d = l.map(function(e) {
return {
x: Math.max(2, Math.min(47, e.x)),
y: Math.max(2, Math.min(47, e.y)),
roomName: c
};
}).filter(function(t) {
return e.getTerrain().get(t.x, t.y) !== TERRAIN_MASK_WALL;
}).map(function(e) {
return new RoomPosition(e.x, e.y, e.roomName);
}), f = {
waypoints: d.map(function(e) {
return {
x: e.x,
y: e.y,
roomName: e.roomName
};
}),
metadata: {
spawnCount: n
}
};
return fe.set(i, f, {
namespace: Ja,
ttl: 1e3
}), d;
}

function ei(e, t) {
var r;
if (0 === t.length) return null;
var o = e.memory;
void 0 === o.patrolIndex && (o.patrolIndex = 0);
var n = t[o.patrolIndex % t.length];
return n && e.pos.getRangeTo(n) <= 2 && (o.patrolIndex = (o.patrolIndex + 1) % t.length), 
null !== (r = t[o.patrolIndex % t.length]) && void 0 !== r ? r : null;
}

function ti(e) {
var t, r;
if (0 === e.hostiles.length) return null;
var o = e.hostiles.map(function(e) {
var t, r, o = 0;
if (o += 100 * e.getActiveBodyparts(HEAL), o += 50 * e.getActiveBodyparts(RANGED_ATTACK), 
o += 40 * e.getActiveBodyparts(ATTACK), o += 60 * e.getActiveBodyparts(CLAIM), (o += 30 * e.getActiveBodyparts(WORK)) > 0) try {
for (var n = a(e.body), i = n.next(); !i.done; i = n.next()) if (i.value.boost) {
o += 20;
break;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return {
hostile: e,
score: o
};
});
return o.sort(function(e, t) {
return t.score - e.score;
}), null !== (r = null === (t = o[0]) || void 0 === t ? void 0 : t.hostile) && void 0 !== r ? r : null;
}

function ri(e, t) {
return e.getActiveBodyparts(t) > 0;
}

function oi(e, t) {
if (!e.swarmState) return null;
var r = Hn(e.room.name);
return r && e.creep.pos.getRangeTo(r) > 2 ? (Za.debug("".concat(e.creep.name, " ").concat(t, " moving to collection point at ").concat(r.x, ",").concat(r.y)), 
{
type: "moveTo",
target: r
}) : null;
}

function ni(e) {
var t;
return null === (t = Memory.squads) || void 0 === t ? void 0 : t[e];
}

function ai(e) {
var t = e.creep.memory;
if (La(e.creep)) return {
type: "idle"
};
if (t.assistTarget) {
if (e.creep.room.name !== t.assistTarget) return {
type: "moveToRoom",
roomName: t.assistTarget
};
if (0 === e.hostiles.length) {
if (delete t.assistTarget, e.creep.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
} else {
var r = ti(e);
if (r) {
var o = e.creep.pos.getRangeTo(r), n = ri(e.creep, RANGED_ATTACK), a = ri(e.creep, ATTACK);
return n && o <= 3 ? {
type: "rangedAttack",
target: r
} : a && o <= 1 ? {
type: "attack",
target: r
} : {
type: "moveTo",
target: r
};
}
}
}
if (e.creep.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var i = ti(e);
if (i) return o = e.creep.pos.getRangeTo(i), n = ri(e.creep, RANGED_ATTACK), a = ri(e.creep, ATTACK), 
n && o <= 3 ? {
type: "rangedAttack",
target: i
} : a && o <= 1 ? {
type: "attack",
target: i
} : {
type: "moveTo",
target: i
};
var s = $a(e.room), c = ei(e.creep, s);
if (c) return {
type: "moveTo",
target: c
};
var l = e.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
return l && e.creep.pos.getRangeTo(l) > 5 ? {
type: "moveTo",
target: l
} : {
type: "idle"
};
}

function ii(e) {
var t = e.creep.memory;
if (e.creep.hits < .5 * e.creep.hitsMax) return {
type: "heal",
target: e.creep
};
if (t.targetRoom) {
if (e.room.name !== t.targetRoom) return {
type: "moveToRoom",
roomName: t.targetRoom
};
var r = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
var r = e.memory;
return "powerHarvester" === r.role && r.targetRoom === t.targetRoom;
}
});
if (r.length > 0) {
r.sort(function(e, t) {
return (e.hitsMax > 0 ? e.hits / e.hitsMax : 1) - (t.hitsMax > 0 ? t.hits / t.hitsMax : 1);
});
var o = r[0];
return (i = e.creep.pos.getRangeTo(o)) > 3 ? {
type: "moveTo",
target: o
} : i <= 1 ? {
type: "heal",
target: o
} : {
type: "rangedHeal",
target: o
};
}
var n = e.room.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_BANK;
}
})[0];
if (!n && 0 === r.length) return delete t.targetRoom, {
type: "moveToRoom",
roomName: e.homeRoom
};
if (n && e.creep.pos.getRangeTo(n) > 3) return {
type: "moveTo",
target: n
};
}
if (t.assistTarget) {
var a = Game.rooms[t.assistTarget];
if (!a) return {
type: "moveToRoom",
roomName: t.assistTarget
};
if (0 === a.find(FIND_HOSTILE_CREEPS).length) return delete t.assistTarget, {
type: "idle"
};
if (e.creep.room.name !== t.assistTarget) return {
type: "moveToRoom",
roomName: t.assistTarget
};
}
var i, s = e.creep.pos.findInRange(FIND_MY_CREEPS, 3, {
filter: function(e) {
return e.hits < e.hitsMax;
}
});
if (s.length > 0) return s.sort(function(e, t) {
return (e.hitsMax > 0 ? e.hits / e.hitsMax : 1) - (t.hitsMax > 0 ? t.hits / t.hitsMax : 1);
}), o = s[0], (i = e.creep.pos.getRangeTo(o)) <= 1 ? {
type: "heal",
target: o
} : {
type: "rangedHeal",
target: o
};
var c = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory;
return "military" === t.family && "healer" !== t.role;
}
});
if (c.length > 0) {
var l = Je(e.creep, c, "healer_follow", 5);
if (l) return {
type: "moveTo",
target: l
};
}
var u = $a(e.room), m = ei(e.creep, u);
return m ? {
type: "moveTo",
target: m
} : {
type: "idle"
};
}

function si(e) {
var t;
if (e.memory.squadId) {
var r = ni(e.memory.squadId);
if (r) return ui(e, r);
}
if (e.creep.hits / e.creep.hitsMax < .3) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var o = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
return o.length > 0 && e.creep.pos.getRangeTo(o[0]) > 3 ? {
type: "moveTo",
target: o[0]
} : {
type: "idle"
};
}
var n = null !== (t = e.memory.targetRoom) && void 0 !== t ? t : e.homeRoom;
if (e.room.name !== n) return {
type: "moveToRoom",
roomName: n
};
var a = ti(e);
if (a) {
var i = e.creep.pos.getRangeTo(a), s = ri(e.creep, RANGED_ATTACK), c = ri(e.creep, ATTACK);
return s && i <= 3 ? {
type: "rangedAttack",
target: a
} : c && i <= 1 ? {
type: "attack",
target: a
} : {
type: "moveTo",
target: a
};
}
var l = mn(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
if (l) return {
type: "attack",
target: l
};
var u = $a(e.room), m = ei(e.creep, u);
if (m) return {
type: "moveTo",
target: m
};
var p = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (p.length > 0) {
var d = Je(e.creep, p, "soldier_spawn", 20);
if (d && e.creep.pos.getRangeTo(d) > 5) return {
type: "moveTo",
target: d
};
}
return {
type: "idle"
};
}

function ci(e) {
var t;
if (e.memory.squadId) {
var r = ni(e.memory.squadId);
if (r) return ui(e, r);
}
if (e.creep.hits / e.creep.hitsMax < .3) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var o = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
return o.length > 0 && e.creep.pos.getRangeTo(o[0]) > 3 ? {
type: "moveTo",
target: o[0]
} : {
type: "idle"
};
}
var n = null !== (t = e.memory.targetRoom) && void 0 !== t ? t : e.homeRoom;
if (e.room.name !== n) return {
type: "moveToRoom",
roomName: n
};
var a = mn(e.creep.pos, FIND_HOSTILE_SPAWNS);
if (a) return {
type: "dismantle",
target: a
};
var i = mn(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER;
}
});
if (i) return {
type: "dismantle",
target: i
};
var s = e.room.find(FIND_STRUCTURES, {
filter: function(t) {
var r;
return t.structureType === STRUCTURE_WALL ? t.hits < 1e5 && !(null === (r = e.room.controller) || void 0 === r ? void 0 : r.my) : t.structureType === STRUCTURE_RAMPART && t.hits < 1e5 && !t.my;
}
});
if (s.length > 0) {
var c = Je(e.creep, s, "siege_wall", 10);
if (c) return {
type: "dismantle",
target: c
};
}
var l = mn(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
if (l) return {
type: "dismantle",
target: l
};
var u = oi(e, "siegeUnit");
if (u) return u;
var m = $a(e.room), p = ei(e.creep, m);
return p ? {
type: "moveTo",
target: p
} : {
type: "idle"
};
}

function li(e) {
var t = e.creep.memory;
if (La(e.creep)) return {
type: "idle"
};
if (e.creep.hits / e.creep.hitsMax < .3) {
if (t.assistTarget && delete t.assistTarget, e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
return r.length > 0 && e.creep.pos.getRangeTo(r[0]) > 3 ? {
type: "moveTo",
target: r[0]
} : {
type: "idle"
};
}
if (t.assistTarget) {
var o = Game.rooms[t.assistTarget];
if (!o) return {
type: "moveToRoom",
roomName: t.assistTarget
};
if (0 === o.find(FIND_HOSTILE_CREEPS).length) return delete t.assistTarget, {
type: "idle"
};
if (e.creep.room.name !== t.assistTarget) return {
type: "moveToRoom",
roomName: t.assistTarget
};
var n = ti(e);
if (n) return (i = e.creep.pos.getRangeTo(n)) < 3 ? {
type: "flee",
from: [ n.pos ]
} : i <= 3 ? {
type: "rangedAttack",
target: n
} : {
type: "moveTo",
target: n
};
}
if (e.memory.squadId) {
var a = ni(e.memory.squadId);
if (a) return ui(e, a);
}
var i, s = ti(e);
if (s) return (i = e.creep.pos.getRangeTo(s)) < 3 ? {
type: "flee",
from: [ s.pos ]
} : i <= 3 ? {
type: "rangedAttack",
target: s
} : {
type: "moveTo",
target: s
};
var c = $a(e.room), l = ei(e.creep, c);
if (l) return {
type: "moveTo",
target: l
};
var u = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (u.length > 0) {
var m = Je(e.creep, u, "harasser_home_spawn", 20);
if (m && e.creep.pos.getRangeTo(m) > 10) return {
type: "moveTo",
target: m
};
}
return {
type: "idle"
};
}

function ui(e, t) {
var r, o, n;
switch (t.state) {
case "gathering":
if (e.room.name !== t.rallyRoom) return {
type: "moveToRoom",
roomName: t.rallyRoom
};
var a = new RoomPosition(25, 25, t.rallyRoom);
return e.creep.pos.getRangeTo(a) > 3 ? {
type: "moveTo",
target: a
} : {
type: "idle"
};

case "moving":
var i = t.targetRooms[0];
return i && e.room.name !== i ? (o = t.members.filter(function(t) {
var r = Game.creeps[t];
return r && r.room.name === e.room.name;
}).length, n = t.members.length, o < Math.max(2, .5 * n) ? {
type: "idle"
} : {
type: "moveToRoom",
roomName: i
}) : {
type: "idle"
};

case "attacking":
if (e.creep.hits / e.creep.hitsMax < (null !== (r = t.retreatThreshold) && void 0 !== r ? r : .3) && e.room.name !== t.rallyRoom) return {
type: "moveToRoom",
roomName: t.rallyRoom
};
switch (e.memory.role) {
case "soldier":
case "guard":
default:
return si(e);

case "healer":
return ii(e);

case "siegeUnit":
return ci(e);

case "ranger":
return li(e);
}

case "retreating":
return e.room.name !== t.rallyRoom ? {
type: "moveToRoom",
roomName: t.rallyRoom
} : {
type: "moveTo",
target: new RoomPosition(25, 25, t.rallyRoom)
};

case "dissolving":
return e.room.name !== e.homeRoom ? {
type: "moveToRoom",
roomName: e.homeRoom
} : (delete e.memory.squadId, {
type: "idle"
});

default:
return {
type: "idle"
};
}
}

var mi = {
guard: ai,
remoteGuard: function(e) {
var t = e.creep.memory;
if (!t.targetRoom) {
if (e.creep.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = $a(e.room);
return (o = ei(e.creep, r)) ? {
type: "moveTo",
target: o
} : {
type: "idle"
};
}
if (e.creep.room.name !== t.targetRoom) return {
type: "moveToRoom",
roomName: t.targetRoom
};
var o, n = e.room.find(FIND_HOSTILE_CREEPS).filter(function(e) {
return e.body.some(function(e) {
return e.type === ATTACK || e.type === RANGED_ATTACK || e.type === WORK;
});
});
if (0 === n.length) return e.creep.room.name !== e.homeRoom ? {
type: "moveToRoom",
roomName: e.homeRoom
} : (r = $a(e.room), (o = ei(e.creep, r)) ? {
type: "moveTo",
target: o
} : {
type: "idle"
});
var i = function(e, t) {
var r, o;
if (0 === t.length) return null;
var n = [ t.filter(function(e) {
return e.body.some(function(e) {
return e.boost;
});
}), t.filter(function(e) {
return ri(e, HEAL);
}), t.filter(function(e) {
return ri(e, RANGED_ATTACK);
}), t.filter(function(e) {
return ri(e, ATTACK);
}), t ];
try {
for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (c.length > 0) return e.creep.pos.findClosestByRange(c);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
return null;
}(e, n);
if (i) {
var s = e.creep.pos.getRangeTo(i), c = ri(e.creep, RANGED_ATTACK), l = ri(e.creep, ATTACK);
return c && s <= 3 ? {
type: "rangedAttack",
target: i
} : l && s <= 1 ? {
type: "attack",
target: i
} : {
type: "moveTo",
target: i
};
}
var u = e.room.find(FIND_SOURCES);
if (u.length > 0) {
var m = e.creep.pos.findClosestByRange(u);
if (m && e.creep.pos.getRangeTo(m) > 3) return {
type: "moveTo",
target: m
};
}
return {
type: "idle"
};
},
healer: ii,
soldier: si,
siegeUnit: ci,
harasser: function(e) {
var t = e.memory.targetRoom;
if (e.creep.hits / e.creep.hitsMax < .4) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
return r.length > 0 && e.creep.pos.getRangeTo(r[0]) > 3 ? {
type: "moveTo",
target: r[0]
} : {
type: "idle"
};
}
if (!t) return oi(e, "harasser (no target)") || {
type: "idle"
};
if (e.room.name !== t) return {
type: "moveToRoom",
roomName: t
};
var o = e.hostiles.filter(function(t) {
return e.creep.pos.getRangeTo(t) < 5 && t.body.some(function(e) {
return e.type === ATTACK || e.type === RANGED_ATTACK;
});
});
if (o.length > 0) return {
type: "flee",
from: o.map(function(e) {
return e.pos;
})
};
var n = e.hostiles.filter(function(e) {
return e.body.some(function(e) {
return e.type === WORK || e.type === CARRY;
});
});
if (n.length > 0) {
var a = n.reduce(function(t, r) {
return e.creep.pos.getRangeTo(t) < e.creep.pos.getRangeTo(r) ? t : r;
}), i = e.creep.pos.getRangeTo(a);
return i <= 1 ? {
type: "attack",
target: a
} : i <= 3 ? {
type: "rangedAttack",
target: a
} : {
type: "moveTo",
target: a
};
}
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var s = oi(e, "harasser (no targets)");
if (s) return s;
var c = $a(e.room), l = ei(e.creep, c);
return l ? {
type: "moveTo",
target: l
} : {
type: "idle"
};
},
ranger: li
};

function pi(e) {
var t;
return (null !== (t = mi[e.memory.role]) && void 0 !== t ? t : ai)(e);
}

function di(e, t) {
var r = e.effects;
return void 0 !== r && Array.isArray(r) && r.some(function(e) {
return e.effect === t;
});
}

function fi(e) {
var t = e.memory.targetRoom;
if (!t) return {
type: "idle"
};
if (e.room.name !== t) return {
type: "moveToRoom",
roomName: t
};
var r = Ve(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_BANK;
},
filterKey: "powerBank"
})[0];
if (!r) return delete e.memory.targetRoom, {
type: "moveToRoom",
roomName: e.homeRoom
};
if (e.creep.hits < .5 * e.creep.hitsMax) {
var o = Ve(e.room, FIND_MY_CREEPS, {
filter: function(e) {
return "healer" === e.memory.role && e.memory.targetRoom === t;
},
filterKey: "healer_".concat(t)
});
if (o.length > 0) {
var n = e.creep.pos.findClosestByRange(o);
if (n && e.creep.pos.getRangeTo(n) > 1) return {
type: "moveTo",
target: n
};
}
}
return e.creep.attack(r) === ERR_NOT_IN_RANGE ? {
type: "moveTo",
target: r
} : {
type: "idle"
};
}

var yi = {
powerHarvester: fi,
powerCarrier: function(e) {
var t = e.memory.targetRoom;
if (e.creep.store.getUsedCapacity(RESOURCE_POWER) > 0) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = Game.rooms[e.homeRoom];
if (r) {
var o = je(r, STRUCTURE_POWER_SPAWN)[0];
if (o && o.store.getFreeCapacity(RESOURCE_POWER) > 0) return {
type: "transfer",
target: o,
resourceType: RESOURCE_POWER
};
if (e.storage) return {
type: "transfer",
target: e.storage,
resourceType: RESOURCE_POWER
};
}
return {
type: "idle"
};
}
if (!t) return {
type: "idle"
};
if (e.room.name !== t) return {
type: "moveToRoom",
roomName: t
};
var n = ze(e.room, RESOURCE_POWER)[0];
if (n) return {
type: "pickup",
target: n
};
var a = Ve(e.room, FIND_RUINS, {
filter: function(e) {
return e.store.getUsedCapacity(RESOURCE_POWER) > 0;
},
filterKey: "powerRuin"
})[0];
if (a) return {
type: "withdraw",
target: a,
resourceType: RESOURCE_POWER
};
var i = Ve(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_BANK;
},
filterKey: "powerBank"
})[0];
return i ? e.creep.pos.getRangeTo(i) > 3 ? {
type: "moveTo",
target: i
} : {
type: "idle"
} : (delete e.memory.targetRoom, {
type: "moveToRoom",
roomName: e.homeRoom
});
}
};

function gi(e) {
var t;
return (null !== (t = yi[e.memory.role]) && void 0 !== t ? t : fi)(e);
}

function hi(e, t) {
var r, o, n, a, i, s, c, l = t.knownRooms, u = l[e.name], m = null !== (r = null == u ? void 0 : u.lastSeen) && void 0 !== r ? r : 0, p = Game.time - m;
if (u && p < 2e3) {
u.lastSeen = Game.time;
var d = un(e, FIND_HOSTILE_CREEPS);
return u.threatLevel = d.length > 5 ? 3 : d.length > 2 ? 2 : d.length > 0 ? 1 : 0, 
void (e.controller && (u.controllerLevel = null !== (o = e.controller.level) && void 0 !== o ? o : 0, 
(null === (n = e.controller.owner) || void 0 === n ? void 0 : n.username) && (u.owner = e.controller.owner.username), 
(null === (a = e.controller.reservation) || void 0 === a ? void 0 : a.username) && (u.reserver = e.controller.reservation.username)));
}
for (var f = e.find(FIND_SOURCES), y = e.find(FIND_MINERALS)[0], g = e.controller, h = un(e, FIND_HOSTILE_CREEPS), v = e.getTerrain(), R = 0, E = 0, T = 5; T < 50; T += 10) for (var C = 5; C < 50; C += 10) {
var S = v.get(T, C);
S === TERRAIN_MASK_SWAMP ? R++ : 0 === S && E++;
}
var _ = R > 2 * E ? "swamp" : E > 2 * R ? "plains" : "mixed", O = e.name.match(/^[WE](\d+)[NS](\d+)$/), b = !!O && (parseInt(O[1], 10) % 10 == 0 || parseInt(O[2], 10) % 10 == 0), w = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_KEEPER_LAIR;
}
}).length > 0, U = {
name: e.name,
lastSeen: Game.time,
sources: f.length,
controllerLevel: null !== (i = null == g ? void 0 : g.level) && void 0 !== i ? i : 0,
threatLevel: h.length > 5 ? 3 : h.length > 2 ? 2 : h.length > 0 ? 1 : 0,
scouted: !0,
terrain: _,
isHighway: b,
isSK: w
};
(null === (s = null == g ? void 0 : g.owner) || void 0 === s ? void 0 : s.username) && (U.owner = g.owner.username), 
(null === (c = null == g ? void 0 : g.reservation) || void 0 === c ? void 0 : c.username) && (U.reserver = g.reservation.username), 
(null == y ? void 0 : y.mineralType) && (U.mineralType = y.mineralType), l[e.name] = U;
}

function vi(e) {
return {
type: "moveTo",
target: new RoomPosition(25, 25, e)
};
}

function Ri(e) {
var t = Bn.getEmpire();
if (Dn.isExit(e.creep.pos)) return vi(e.room.name);
var r = e.memory.lastExploredRoom, o = e.memory.targetRoom;
if (!o) {
if (o = function(e, t, r) {
var o, n, s, c, l, u = t.knownRooms, m = Game.map.describeExits(e);
if (m) {
var p = [];
try {
for (var d = a(Object.entries(m)), f = d.next(); !f.done; f = d.next()) {
var y = i(f.value, 2)[1];
if (!r || y !== r) {
var g = null !== (c = null === (s = u[y]) || void 0 === s ? void 0 : s.lastSeen) && void 0 !== c ? c : 0;
Game.time - g > 1e3 && p.push({
room: y,
lastSeen: g
});
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
f && !f.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
return p.sort(function(e, t) {
return e.lastSeen - t.lastSeen;
}), null === (l = p[0]) || void 0 === l ? void 0 : l.room;
}
}(e.room.name, t, r), !o) return delete e.memory.targetRoom, delete e.memory.lastExploredRoom, 
{
type: "idle"
};
e.memory.targetRoom = o;
}
if (o && e.room.name !== o) return {
type: "moveToRoom",
roomName: o
};
if (o && e.room.name === o) {
var n = function(e) {
var t, r, o = [ new RoomPosition(5, 5, e.name), new RoomPosition(44, 5, e.name), new RoomPosition(5, 44, e.name), new RoomPosition(44, 44, e.name), new RoomPosition(25, 25, e.name) ], n = e.getTerrain();
try {
for (var i = a(o), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (n.get(c.x, c.y) !== TERRAIN_MASK_WALL) return c;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
return null;
}(e.room);
return n ? e.creep.pos.getRangeTo(n) <= 3 ? (hi(e.room, t), e.memory.lastExploredRoom = e.room.name, 
delete e.memory.targetRoom, {
type: "idle"
}) : {
type: "moveTo",
target: n
} : (hi(e.room, t), e.memory.lastExploredRoom = e.room.name, delete e.memory.targetRoom, 
{
type: "idle"
});
}
return {
type: "idle"
};
}

var Ei = {
scout: Ri,
claimer: function(e) {
var t = e.memory.targetRoom;
if (!t) {
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (r.length > 0) {
var o = Je(e.creep, r, "claimer_spawn", 20);
if (o) return {
type: "moveTo",
target: o
};
}
return {
type: "idle"
};
}
if (Dn.isExit(e.creep.pos)) return vi(e.room.name);
if (e.room.name !== t) return {
type: "moveToRoom",
roomName: t
};
var n = e.room.controller;
if (!n) return {
type: "idle"
};
var a = e.memory.task;
return "claim" === a ? {
type: "claim",
target: n
} : "attack" === a ? {
type: "attackController",
target: n
} : {
type: "reserve",
target: n
};
},
engineer: function(e) {
var t, r;
if (e.isEmpty && (e.memory.working = !1), e.isFull && (e.memory.working = !0), e.memory.working) {
var o = e.repairTargets.filter(function(e) {
return (e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_TOWER || e.structureType === STRUCTURE_STORAGE) && e.hits < .5 * e.hitsMax;
});
if (o.length > 0) {
var n = Je(e.creep, o, "engineer_critical", 5);
if (n) return {
type: "repair",
target: n
};
}
var a = e.repairTargets.filter(function(e) {
return (e.structureType === STRUCTURE_ROAD || e.structureType === STRUCTURE_CONTAINER) && e.hits < .75 * e.hitsMax;
});
if (a.length > 0) {
var i = Je(e.creep, a, "engineer_infra", 5);
if (i) return {
type: "repair",
target: i
};
}
var s = null !== (r = null === (t = e.swarmState) || void 0 === t ? void 0 : t.danger) && void 0 !== r ? r : 0, c = 0 === s ? 1e5 : 1 === s ? 3e5 : 2 === s ? 5e6 : 5e7, l = e.repairTargets.filter(function(e) {
return e.structureType === STRUCTURE_RAMPART && e.hits < c;
});
if (l.length > 0) {
var u = Je(e.creep, l, "engineer_rampart", 5);
if (u) return {
type: "repair",
target: u
};
}
var m = e.repairTargets.filter(function(e) {
return e.structureType === STRUCTURE_WALL && e.hits < c;
});
if (m.length > 0) {
var p = Je(e.creep, m, "engineer_wall", 5);
if (p) return {
type: "repair",
target: p
};
}
return e.prioritizedSites.length > 0 ? {
type: "build",
target: e.prioritizedSites[0]
} : {
type: "idle"
};
}
if (e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return {
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var d = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (d.length > 0) {
var f = Je(e.creep, d, "engineer_cont", 15);
if (f) return {
type: "withdraw",
target: f,
resourceType: RESOURCE_ENERGY
};
}
return {
type: "idle"
};
},
remoteWorker: function(e) {
var t, r = null !== (t = e.memory.targetRoom) && void 0 !== t ? t : e.homeRoom;
if (e.isEmpty && (e.memory.working = !1), e.isFull && (e.memory.working = !0), e.memory.working) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
if (e.storage) return {
type: "transfer",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var o = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (o.length > 0) {
var n = Je(e.creep, o, "remoteWorker_spawn", 5);
if (n) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
}
return {
type: "idle"
};
}
if (e.room.name !== r) return {
type: "moveToRoom",
roomName: r
};
var a = e.creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
return a ? {
type: "harvest",
target: a
} : {
type: "idle"
};
},
linkManager: function(e) {
var t = e.room.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LINK;
}
});
if (t.length < 2 || !e.storage) return {
type: "idle"
};
var r = t.find(function(t) {
return t.pos.getRangeTo(e.storage) <= 2;
});
return r ? r.store.getUsedCapacity(RESOURCE_ENERGY) > 400 ? e.creep.store.getFreeCapacity() > 0 ? {
type: "withdraw",
target: r,
resourceType: RESOURCE_ENERGY
} : {
type: "transfer",
target: e.storage,
resourceType: RESOURCE_ENERGY
} : e.creep.pos.getRangeTo(e.storage) > 2 ? {
type: "moveTo",
target: e.storage
} : {
type: "idle"
} : {
type: "idle"
};
},
terminalManager: function(e) {
var t, r;
if (!e.terminal || !e.storage) return {
type: "idle"
};
var o = e.terminal.store.getUsedCapacity(RESOURCE_ENERGY), n = e.storage.store.getUsedCapacity(RESOURCE_ENERGY);
if (e.creep.store.getUsedCapacity() > 0) return (c = Object.keys(e.creep.store)[0]) === RESOURCE_ENERGY ? o < 5e4 ? {
type: "transfer",
target: e.terminal,
resourceType: RESOURCE_ENERGY
} : {
type: "transfer",
target: e.storage,
resourceType: RESOURCE_ENERGY
} : {
type: "transfer",
target: e.terminal,
resourceType: c
};
if (o < 4e4 && n > 2e4) return {
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
if (o > 6e4) return {
type: "withdraw",
target: e.terminal,
resourceType: RESOURCE_ENERGY
};
try {
for (var i = a(Object.keys(e.storage.store)), s = i.next(); !s.done; s = i.next()) {
var c;
if ((c = s.value) !== RESOURCE_ENERGY && e.storage.store.getUsedCapacity(c) > 5e3) return {
type: "withdraw",
target: e.storage,
resourceType: c
};
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
return e.creep.pos.getRangeTo(e.storage) > 2 ? {
type: "moveTo",
target: e.storage
} : {
type: "idle"
};
}
};

function Ti(e) {
var t;
return (null !== (t = Ei[e.memory.role]) && void 0 !== t ? t : Ri)(e);
}

function Ci(e) {
var t = function(e) {
var t, r, o;
if (!e.room) return null;
var n = e.room, i = null !== (o = e.memory.homeRoom) && void 0 !== o ? o : n.name, s = je(n, STRUCTURE_LAB), c = je(n, STRUCTURE_SPAWN), l = je(n, STRUCTURE_EXTENSION), u = je(n, STRUCTURE_FACTORY)[0], m = je(n, STRUCTURE_POWER_SPAWN)[0], p = [];
try {
for (var d = a(Object.keys(e.powers)), f = d.next(); !f.done; f = d.next()) {
var y = f.value, g = e.powers[y];
g && 0 === g.cooldown && p.push(y);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
f && !f.done && (r = d.return) && r.call(d);
} finally {
if (t) throw t.error;
}
}
return {
powerCreep: e,
room: n,
homeRoom: i,
isInHomeRoom: n.name === i,
storage: n.storage,
terminal: n.terminal,
factory: u,
labs: s,
spawns: c,
extensions: l,
powerSpawn: m,
availablePowers: p,
ops: e.store.getUsedCapacity(RESOURCE_OPS)
};
}(e);
t && function(e, t) {
var r;
switch (t.type) {
case "usePower":
(t.target ? e.usePower(t.power, t.target) : e.usePower(t.power)) === ERR_NOT_IN_RANGE && t.target && Dn.moveTo(e, t.target);
break;

case "moveTo":
Dn.moveTo(e, t.target);
break;

case "moveToRoom":
var o = new RoomPosition(25, 25, t.roomName);
Dn.moveTo(e, {
pos: o,
range: 20
}, {
maxRooms: 16
});
break;

case "renewSelf":
e.renew(t.spawn) === ERR_NOT_IN_RANGE && Dn.moveTo(e, t.spawn);
break;

case "enableRoom":
(null === (r = e.room) || void 0 === r ? void 0 : r.controller) && e.enableRoom(e.room.controller) === ERR_NOT_IN_RANGE && Dn.moveTo(e, e.room.controller);
}
}(e, function(e) {
return "powerWarrior" === e.powerCreep.memory.role ? function(e) {
var t, r;
if (void 0 !== e.powerCreep.ticksToLive && e.powerCreep.ticksToLive < 1e3 && e.powerSpawn) return {
type: "renewSelf",
spawn: e.powerSpawn
};
var o = e.availablePowers, n = un(e.room, FIND_HOSTILE_CREEPS), c = un(e.room, FIND_HOSTILE_STRUCTURES);
if (e.room.controller && !e.room.controller.isPowerEnabled) return {
type: "enableRoom"
};
if (o.includes(PWR_GENERATE_OPS) && e.ops < 20) return {
type: "usePower",
power: PWR_GENERATE_OPS
};
if (o.includes(PWR_SHIELD) && e.ops >= 10 && n.length > 0) {
var l = Ve(e.room, FIND_MY_CREEPS, {
filter: function(e) {
return "military" === e.memory.family && e.hits < .7 * e.hitsMax;
},
filterKey: "damagedMilitary"
})[0];
if (l) return {
type: "usePower",
power: PWR_SHIELD,
target: l
};
}
if (o.includes(PWR_DISRUPT_SPAWN) && e.ops >= 10) {
var u = un(e.room, FIND_HOSTILE_SPAWNS, {
filter: function(e) {
return !di(e, PWR_DISRUPT_SPAWN);
}
})[0];
if (u) return {
type: "usePower",
power: PWR_DISRUPT_SPAWN,
target: u
};
}
if (o.includes(PWR_DISRUPT_TOWER) && e.ops >= 10) {
var m = un(e.room, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !di(e, PWR_DISRUPT_TOWER);
}
})[0];
if (m) return {
type: "usePower",
power: PWR_DISRUPT_TOWER,
target: m
};
}
if (o.includes(PWR_OPERATE_TOWER) && e.ops >= 10 && n.length > 0) {
var p = Ve(e.room, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !di(e, PWR_OPERATE_TOWER);
},
filterKey: "towerNoEffect"
})[0];
if (p) return {
type: "usePower",
power: PWR_OPERATE_TOWER,
target: p
};
}
if (o.includes(PWR_FORTIFY) && e.ops >= 5 && n.length > 0) {
var d = s(s([], i(e.spawns), !1), [ e.storage, e.terminal ], !1).filter(function(e) {
return void 0 !== e;
});
try {
for (var f = a(d), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
if (g) {
var h = e.room.lookForAt(LOOK_STRUCTURES, g.pos).find(function(e) {
return e.structureType === STRUCTURE_RAMPART;
});
if (h && h.hits < .5 * h.hitsMax) return {
type: "usePower",
power: PWR_FORTIFY,
target: h
};
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
y && !y.done && (r = f.return) && r.call(f);
} finally {
if (t) throw t.error;
}
}
var v = Ve(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_RAMPART && e.hits < 5e5;
},
filterKey: "lowRampart"
})[0];
if (v) return {
type: "usePower",
power: PWR_FORTIFY,
target: v
};
}
if (o.includes(PWR_DISRUPT_TERMINAL) && e.ops >= 50) {
var R = c.find(function(e) {
return e.structureType === STRUCTURE_TERMINAL && !di(e, PWR_DISRUPT_TERMINAL);
});
if (R) return {
type: "usePower",
power: PWR_DISRUPT_TERMINAL,
target: R
};
}
if (o.includes(PWR_GENERATE_OPS) && e.ops < 100) return {
type: "usePower",
power: PWR_GENERATE_OPS
};
if (!e.isInHomeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
if (n.length > 0) {
var E = e.powerCreep.pos.findClosestByRange(n);
if (E && e.powerCreep.pos.getRangeTo(E) > 5) return {
type: "moveTo",
target: E
};
}
return {
type: "idle"
};
}(e) : function(e) {
if (void 0 !== e.powerCreep.ticksToLive && e.powerCreep.ticksToLive < 1e3 && e.powerSpawn) return {
type: "renewSelf",
spawn: e.powerSpawn
};
var t = e.availablePowers;
if (e.room.controller && !e.room.controller.isPowerEnabled) return {
type: "enableRoom"
};
if (t.includes(PWR_GENERATE_OPS) && e.ops < 20) return {
type: "usePower",
power: PWR_GENERATE_OPS
};
if (t.includes(PWR_OPERATE_SPAWN) && e.ops >= 100) {
var r = e.spawns.find(function(e) {
var t = e;
return null !== t.spawning && !di(t, PWR_OPERATE_SPAWN);
});
if (r) return {
type: "usePower",
power: PWR_OPERATE_SPAWN,
target: r
};
}
if (t.includes(PWR_OPERATE_EXTENSION) && e.ops >= 2 && e.extensions.reduce(function(e, t) {
return e + t.store.getFreeCapacity(RESOURCE_ENERGY);
}, 0) > 1e3 && e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1e4 && !di(e.storage, PWR_OPERATE_EXTENSION)) return {
type: "usePower",
power: PWR_OPERATE_EXTENSION,
target: e.storage
};
if (t.includes(PWR_OPERATE_TOWER) && e.ops >= 10 && Ve(e.room, FIND_HOSTILE_CREEPS).length > 0) {
var o = Ve(e.room, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !di(e, PWR_OPERATE_TOWER);
},
filterKey: "towerNoEffect"
});
if (o.length > 0) return {
type: "usePower",
power: PWR_OPERATE_TOWER,
target: o[0]
};
}
if (t.includes(PWR_OPERATE_LAB) && e.ops >= 10) {
var n = e.labs.find(function(e) {
return 0 === e.cooldown && e.mineralType && !di(e, PWR_OPERATE_LAB);
});
if (n) return {
type: "usePower",
power: PWR_OPERATE_LAB,
target: n
};
}
if (t.includes(PWR_OPERATE_FACTORY) && e.ops >= 100 && e.factory && 0 === e.factory.cooldown && !di(e.factory, PWR_OPERATE_FACTORY)) return {
type: "usePower",
power: PWR_OPERATE_FACTORY,
target: e.factory
};
if (t.includes(PWR_OPERATE_STORAGE) && e.ops >= 100 && e.storage && e.storage.store.getUsedCapacity() > .85 * e.storage.store.getCapacity() && !di(e.storage, PWR_OPERATE_STORAGE)) return {
type: "usePower",
power: PWR_OPERATE_STORAGE,
target: e.storage
};
if (t.includes(PWR_REGEN_SOURCE) && e.ops >= 100) {
var a = Ve(e.room, FIND_SOURCES, {
filter: function(e) {
return 0 === e.energy && e.ticksToRegeneration > 100;
},
filterKey: "depletedSource"
})[0];
if (a) return {
type: "usePower",
power: PWR_REGEN_SOURCE,
target: a
};
}
return t.includes(PWR_GENERATE_OPS) && e.ops < 100 ? {
type: "usePower",
power: PWR_GENERATE_OPS
} : e.isInHomeRoom ? e.storage && e.powerCreep.pos.getRangeTo(e.storage) > 3 ? {
type: "moveTo",
target: e.storage
} : {
type: "idle"
} : {
type: "moveToRoom",
roomName: e.homeRoom
};
}(e);
}(t));
}

function Si(e) {
return null !== e && "object" == typeof e && "pos" in e && e.pos instanceof RoomPosition && "room" in e && e.room instanceof Room;
}

var _i = new Set([ "harvester", "upgrader", "mineralHarvester", "depositHarvester", "factoryWorker", "labTech", "builder" ]), Oi = {
harvester: $t.CRITICAL,
queenCarrier: $t.CRITICAL,
hauler: $t.HIGH,
guard: $t.HIGH,
healer: $t.HIGH,
soldier: $t.HIGH,
ranger: $t.HIGH,
siegeUnit: $t.HIGH,
harasser: $t.HIGH,
powerQueen: $t.HIGH,
powerWarrior: $t.HIGH,
larvaWorker: $t.HIGH,
builder: $t.MEDIUM,
upgrader: $t.MEDIUM,
interRoomCarrier: $t.MEDIUM,
scout: $t.MEDIUM,
claimer: $t.MEDIUM,
engineer: $t.MEDIUM,
remoteHarvester: $t.MEDIUM,
powerHarvester: $t.MEDIUM,
powerCarrier: $t.MEDIUM,
remoteHauler: $t.LOW,
remoteWorker: $t.LOW,
linkManager: $t.LOW,
terminalManager: $t.LOW,
mineralHarvester: $t.LOW,
labTech: $t.IDLE,
factoryWorker: $t.IDLE
};

function bi(e) {
var t;
return null !== (t = Oi[e]) && void 0 !== t ? t : $t.MEDIUM;
}

var wi = function() {
function e() {
this.registeredCreeps = new Set, this.lastSyncTick = -1;
}
return e.prototype.syncCreepProcesses = function() {
var e, t;
if (this.lastSyncTick !== Game.time) {
this.lastSyncTick = Game.time;
var r = new Set, o = 0, n = 0, i = 0, s = Object.keys(Game.creeps).length;
for (var c in Game.creeps) {
var l = Game.creeps[c];
l.spawning ? i++ : (r.add(c), this.registeredCreeps.has(c) || (this.registerCreepProcess(l), 
o++));
}
try {
for (var u = a(this.registeredCreeps), m = u.next(); !m.done; m = u.next()) c = m.value, 
r.has(c) || (this.unregisterCreepProcess(c), n++);
} catch (t) {
e = {
error: t
};
} finally {
try {
m && !m.done && (t = u.return) && t.call(u);
} finally {
if (e) throw e.error;
}
}
var p = s < 5;
(o > 0 || n > 0 || Game.time % 10 == 0 || p) && Ft.info("CreepProcessManager: ".concat(r.size, " active, ").concat(i, " spawning, ").concat(s, " total (registered: ").concat(o, ", unregistered: ").concat(n, ")"), {
subsystem: "CreepProcessManager",
meta: {
activeCreeps: r.size,
spawningCreeps: i,
totalCreeps: s,
registeredThisTick: o,
unregisteredThisTick: n
}
});
}
}, e.prototype.registerCreepProcess = function(e) {
var t = e.memory.role, r = bi(t), o = "creep:".concat(e.name);
yr.registerProcess({
id: o,
name: "Creep ".concat(e.name, " (").concat(t, ")"),
priority: r,
frequency: "high",
interval: 1,
minBucket: this.getMinBucketForPriority(r),
cpuBudget: this.getCpuBudgetForPriority(r),
execute: function() {
var t = Game.creeps[e.name];
t && !t.spawning && function(e) {
var t = e.memory;
if (!(e.spawning || "military" !== t.family && void 0 !== e.ticksToLive && e.ticksToLive < 50 && 0 === e.store.getUsedCapacity())) {
var r = Game.rooms[t.homeRoom], o = r && function(e) {
return Object.values(Game.creeps).filter(function(t) {
return t.memory.homeRoom === e.name;
}).length < 5;
}(r);
if ((Game.time % 10 == 0 || o) && Ft.info("Executing role for creep ".concat(e.name, " (").concat(t.role, ")"), {
subsystem: "CreepProcessManager",
creep: e.name
}), function(e) {
var t = e.memory;
if (!_i.has(t.role)) return !1;
var r = t.state;
if (!r || !r.startTick) return !1;
if (Game.time - r.startTick < 3) return !1;
switch (t.role) {
case "harvester":
return function(e, t) {
if ("harvest" !== t.action && "transfer" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
if (!r || !Si(r)) return !1;
if (!e.pos.isNearTo(r.pos)) return !1;
if ("harvest" === t.action) {
var o = e.store.getCapacity();
if (null !== o && o > 0 && 0 === e.store.getFreeCapacity()) return !1;
}
return !("transfer" === t.action && e.store.getUsedCapacity(RESOURCE_ENERGY) < 40);
}(e, r);

case "upgrader":
return function(e, t) {
if ("upgrade" !== t.action && "withdraw" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
return !(!r || !Si(r) || !e.pos.inRangeTo(r.pos, 3) || "upgrade" === t.action && 0 === e.store.getUsedCapacity(RESOURCE_ENERGY) || "withdraw" === t.action && 0 === e.store.getFreeCapacity(RESOURCE_ENERGY));
}(e, r);

case "mineralHarvester":
return function(e, t) {
if ("harvestMineral" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
return !(!r || !Si(r) || !e.pos.isNearTo(r.pos) || 0 === e.store.getFreeCapacity());
}(e, r);

case "builder":
return function(e, t) {
if ("build" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
return !(!r || !Si(r) || !e.pos.inRangeTo(r.pos, 3) || 0 === e.store.getUsedCapacity(RESOURCE_ENERGY));
}(e, r);

case "depositHarvester":
case "factoryWorker":
case "labTech":
return !0;

default:
return !1;
}
}(e)) {
var n = function(e) {
var t = e.memory.state;
if (!t || !t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
if (!r || !Si(r)) return !1;
switch (t.action) {
case "harvest":
return "energy" in r && "energyCapacity" in r && "ticksToRegeneration" in r && e.harvest(r) === OK;

case "harvestMineral":
return "mineralType" in r && "mineralAmount" in r && "ticksToRegeneration" in r && e.harvest(r) === OK;

case "transfer":
return !(!("store" in r) || !r.store || "object" != typeof r.store) && e.transfer(r, RESOURCE_ENERGY) === OK;

case "withdraw":
return !(!("store" in r) || !r.store || "object" != typeof r.store) && e.withdraw(r, RESOURCE_ENERGY) === OK;

case "upgrade":
return "level" in r && "progress" in r && "my" in r && e.upgradeController(r) === OK;

case "build":
return "progressTotal" in r && "progress" in r && e.build(r) === OK;

case "repair":
return "hits" in r && "hitsMax" in r && e.repair(r) === OK;

default:
return !1;
}
}(e);
if (n) return;
delete t.state;
}
var a = function(e) {
var t;
return null !== (t = e.memory.family) && void 0 !== t ? t : "economy";
}(e), i = t.role;
try {
tn.measureSubsystem("role:".concat(i), function() {
switch (a) {
case "economy":
default:
!function(e) {
var t = Pn(e);
zn(e, Zn(t, ca), t);
}(e);
break;

case "military":
!function(e) {
var t = Pn(e);
zn(e, Zn(t, pi), t);
}(e);
break;

case "utility":
!function(e) {
var t = Pn(e);
zn(e, Zn(t, Ti), t);
}(e);
break;

case "power":
!function(e) {
var t = Pn(e);
zn(e, Zn(t, gi), t);
}(e);
}
});
} catch (t) {
Ft.error("EXCEPTION in role execution for ".concat(e.name, " (").concat(i, "/").concat(a, "): ").concat(t), {
subsystem: "CreepProcessManager",
creep: e.name,
meta: {
error: String(t),
stack: t instanceof Error ? t.stack : void 0,
role: i,
family: a,
pos: "".concat(e.pos.x, ",").concat(e.pos.y, " in ").concat(e.room.name)
}
});
}
}
}(t);
}
}), this.registeredCreeps.add(e.name), Ft.info("Registered creep process: ".concat(e.name, " (").concat(t, ") with priority ").concat(r), {
subsystem: "CreepProcessManager"
});
}, e.prototype.unregisterCreepProcess = function(e) {
var t = "creep:".concat(e);
yr.unregisterProcess(t), this.registeredCreeps.delete(e), Ft.info("Unregistered creep process: ".concat(e), {
subsystem: "CreepProcessManager"
});
}, e.prototype.getMinBucketForPriority = function(e) {
return 0;
}, e.prototype.getCpuBudgetForPriority = function(e) {
return e >= $t.CRITICAL ? .012 : e >= $t.HIGH ? .01 : e >= $t.MEDIUM ? .008 : .006;
}, e.prototype.getStats = function() {
var e, t, r, o, n = {};
try {
for (var i = a(this.registeredCreeps), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.creeps[c];
if (l) {
var u = bi(l.memory.role), m = null !== (r = $t[u]) && void 0 !== r ? r : "UNKNOWN";
n[m] = (null !== (o = n[m]) && void 0 !== o ? o : 0) + 1;
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = i.return) && t.call(i);
} finally {
if (e) throw e.error;
}
}
return {
totalCreeps: Object.keys(Game.creeps).length,
registeredCreeps: this.registeredCreeps.size,
creepsByPriority: n
};
}, e.prototype.forceResync = function() {
this.lastSyncTick = -1, this.syncCreepProcesses();
}, e.prototype.reset = function() {
this.registeredCreeps.clear(), this.lastSyncTick = -1;
}, e;
}(), Ui = new wi, xi = {
seedNest: {
rcl: 1
},
foragingExpansion: {
rcl: 3,
minRooms: 1,
minRemoteRooms: 1,
minTowerCount: 1
},
matureColony: {
rcl: 4,
requiresStorage: !0,
requiresTerminal: !0,
requiresLabs: !0,
minLabCount: 3,
minTowerCount: 2
},
fortifiedHive: {
rcl: 7,
requiresTerminal: !0,
requiresLabs: !0,
minLabCount: 6,
requiresFactory: !0,
requiresPowerSpawn: !0,
minTowerCount: 4
},
empireDominance: {
rcl: 8,
requiresNuker: !0,
requiresObserver: !0,
requiresTerminal: !0,
requiresLabs: !0,
minLabCount: 8,
requiresFactory: !0,
requiresPowerSpawn: !0,
minGcl: 10,
minRooms: 3,
minRemoteRooms: 2,
minTowerCount: 6
}
}, Ai = {
eco: {
economy: .75,
military: .05,
utility: .15,
power: .05
},
expand: {
economy: .55,
military: .15,
utility: .25,
power: .05
},
defensive: {
economy: .45,
military: .35,
utility: .15,
power: .05
},
war: {
economy: .3,
military: .5,
utility: .1,
power: .1
},
siege: {
economy: .2,
military: .6,
utility: .1,
power: .1
},
evacuate: {
economy: .1,
military: .1,
utility: .8,
power: 0
},
nukePrep: {
economy: .4,
military: .3,
utility: .2,
power: .1
}
}, Mi = {
eco: {
upgrade: 80,
build: 60,
repair: 40,
spawn: 70,
terminal: 50,
labs: 30
},
expand: {
upgrade: 60,
build: 80,
repair: 50,
spawn: 75,
terminal: 60,
labs: 40
},
defensive: {
upgrade: 30,
build: 50,
repair: 80,
spawn: 90,
terminal: 40,
labs: 60
},
war: {
upgrade: 10,
build: 30,
repair: 70,
spawn: 95,
terminal: 70,
labs: 80
},
siege: {
upgrade: 5,
build: 20,
repair: 90,
spawn: 100,
terminal: 50,
labs: 90
},
evacuate: {
upgrade: 0,
build: 5,
repair: 10,
spawn: 50,
terminal: 80,
labs: 10
},
nukePrep: {
upgrade: 20,
build: 40,
repair: 95,
spawn: 80,
terminal: 30,
labs: 70
}
}, ki = function() {
function e() {
this.STRUCTURE_CACHE_NAMESPACE = "evolution:structures", this.structureCacheTtl = 20;
}
return e.prototype.determineEvolutionStage = function(e, t, r) {
var o, n, a, i, s = null !== (n = null === (o = t.controller) || void 0 === o ? void 0 : o.level) && void 0 !== n ? n : 0, c = Game.gcl.level, l = this.getStructureCounts(t), u = null !== (i = null === (a = e.remoteAssignments) || void 0 === a ? void 0 : a.length) && void 0 !== i ? i : 0;
return this.meetsThreshold("empireDominance", s, r, c, l, u) ? "empireDominance" : this.meetsThreshold("fortifiedHive", s, r, c, l, u) ? "fortifiedHive" : this.meetsThreshold("matureColony", s, r, c, l, u) ? "matureColony" : this.meetsThreshold("foragingExpansion", s, r, c, l, u) ? "foragingExpansion" : "seedNest";
}, e.prototype.meetsThreshold = function(e, t, r, o, n, a) {
var i, s, c = xi[e], l = null !== (i = n[STRUCTURE_TOWER]) && void 0 !== i ? i : 0, u = null !== (s = n[STRUCTURE_LAB]) && void 0 !== s ? s : 0;
return !(t < c.rcl || c.minRooms && r < c.minRooms || c.minGcl && o < c.minGcl || c.minRemoteRooms && a < c.minRemoteRooms || c.minTowerCount && l < c.minTowerCount || c.requiresStorage && !n[STRUCTURE_STORAGE] || c.requiresTerminal && t >= 6 && !n[STRUCTURE_TERMINAL] || c.requiresLabs && 0 === u || c.minLabCount && t >= 6 && u < c.minLabCount || c.requiresFactory && t >= 7 && !n[STRUCTURE_FACTORY] || c.requiresPowerSpawn && t >= 7 && !n[STRUCTURE_POWER_SPAWN] || c.requiresObserver && t >= 8 && !n[STRUCTURE_OBSERVER] || c.requiresNuker && t >= 8 && !n[STRUCTURE_NUKER]);
}, e.prototype.getStructureCounts = function(e) {
var t, r, o, n = fe.get(e.name, {
namespace: this.STRUCTURE_CACHE_NAMESPACE,
ttl: this.structureCacheTtl
});
if (n) return n;
var i = {}, s = e.find(FIND_MY_STRUCTURES);
try {
for (var c = a(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value.structureType;
i[u] = (null !== (o = i[u]) && void 0 !== o ? o : 0) + 1;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
return fe.set(e.name, i, {
namespace: this.STRUCTURE_CACHE_NAMESPACE,
ttl: this.structureCacheTtl
}), i;
}, e.prototype.updateEvolutionStage = function(e, t, r) {
var o = this.determineEvolutionStage(e, t, r);
return o !== e.colonyLevel && (Me.info("Room evolution: ".concat(e.colonyLevel, " -> ").concat(o), {
room: t.name,
subsystem: "Evolution"
}), e.colonyLevel = o, !0);
}, e.prototype.updateMissingStructures = function(e, t) {
var r, o, n, a, i, s, c, l, u, m, p, d, f = this.getStructureCounts(t), y = null !== (o = null === (r = t.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0, g = xi[e.colonyLevel], h = g.requiresLabs && y >= 6, v = h ? null !== (n = g.minLabCount) && void 0 !== n ? n : 3 : 0, R = g.requiresFactory && y >= 7, E = g.requiresTerminal && y >= 6, T = g.requiresStorage && y >= 4, C = g.requiresPowerSpawn && y >= 7, S = g.requiresObserver && y >= 8, _ = g.requiresNuker && y >= 8;
e.missingStructures = {
spawn: 0 === (null !== (a = f[STRUCTURE_SPAWN]) && void 0 !== a ? a : 0),
storage: !!T && 0 === (null !== (i = f[STRUCTURE_STORAGE]) && void 0 !== i ? i : 0),
terminal: !!E && 0 === (null !== (s = f[STRUCTURE_TERMINAL]) && void 0 !== s ? s : 0),
labs: !!h && (null !== (c = f[STRUCTURE_LAB]) && void 0 !== c ? c : 0) < v,
nuker: !!_ && 0 === (null !== (l = f[STRUCTURE_NUKER]) && void 0 !== l ? l : 0),
factory: !!R && 0 === (null !== (u = f[STRUCTURE_FACTORY]) && void 0 !== u ? u : 0),
extractor: y >= 6 && 0 === (null !== (m = f[STRUCTURE_EXTRACTOR]) && void 0 !== m ? m : 0),
powerSpawn: !!C && 0 === (null !== (p = f[STRUCTURE_POWER_SPAWN]) && void 0 !== p ? p : 0),
observer: !!S && 0 === (null !== (d = f[STRUCTURE_OBSERVER]) && void 0 !== d ? d : 0)
};
}, e;
}(), Ni = function() {
function e() {}
return e.prototype.determinePosture = function(e, t) {
if (t) return t;
var r = e.pheromones, o = e.danger;
return o >= 3 ? "siege" : o >= 2 ? "war" : r.siege > 30 ? "siege" : r.war > 25 ? "war" : r.defense > 20 ? "defensive" : r.nukeTarget > 40 ? "nukePrep" : r.expand > 30 && 0 === o ? "expand" : o >= 1 ? "defensive" : "eco";
}, e.prototype.updatePosture = function(e, t, r) {
var o = this.determinePosture(e, t);
if (o !== e.posture) {
var n = e.posture, a = null != r ? r : e.role;
return Me.info("Posture change: ".concat(n, " -> ").concat(o), {
room: a,
subsystem: "Posture"
}), e.posture = o, yr.emit("posture.change", {
roomName: a,
oldPosture: n,
newPosture: o,
source: "PostureManager"
}), !0;
}
return !1;
}, e.prototype.getSpawnProfile = function(e) {
return Ai[e];
}, e.prototype.getResourcePriorities = function(e) {
return Mi[e];
}, e.prototype.allowsBuilding = function(e) {
return "evacuate" !== e && "siege" !== e;
}, e.prototype.allowsUpgrading = function(e) {
return "evacuate" !== e && "siege" !== e && "war" !== e;
}, e.prototype.isCombatPosture = function(e) {
return "defensive" === e || "war" === e || "siege" === e;
}, e.prototype.allowsExpansion = function(e) {
return "eco" === e || "expand" === e;
}, e;
}(), Ii = new ki, Pi = new Ni, Gi = {
updateInterval: 5,
decayFactors: {
expand: .95,
harvest: .9,
build: .92,
upgrade: .93,
defense: .97,
war: .98,
siege: .99,
logistics: .91,
nukeTarget: .99
},
diffusionRates: {
expand: .3,
harvest: .1,
build: .15,
upgrade: .1,
defense: .4,
war: .5,
siege: .6,
logistics: .2,
nukeTarget: .1
},
maxValue: 100,
minValue: 0
}, Li = function() {
function e(e) {
void 0 === e && (e = 10), this.maxSamples = e, this.values = [], this.sum = 0;
}
return e.prototype.add = function(e) {
if (this.values.push(e), this.sum += e, this.values.length > this.maxSamples) {
var t = this.values.shift();
this.sum -= null != t ? t : 0;
}
return this.get();
}, e.prototype.get = function() {
return this.values.length > 0 ? this.sum / this.values.length : 0;
}, e.prototype.reset = function() {
this.values = [], this.sum = 0;
}, e;
}(), Di = function() {
function e(e) {
void 0 === e && (e = {}), this.trackers = new Map, this.config = o(o({}, Gi), e);
}
return e.prototype.getTracker = function(e) {
var t = this.trackers.get(e);
return t || (t = {
energyHarvested: new Li(10),
energySpawning: new Li(10),
energyConstruction: new Li(10),
energyRepair: new Li(10),
energyTower: new Li(10),
controllerProgress: new Li(10),
hostileCount: new Li(5),
damageReceived: new Li(5),
idleWorkers: new Li(10),
lastControllerProgress: 0
}, this.trackers.set(e, t)), t;
}, e.prototype.updateMetrics = function(e, t) {
var r, o, n, i, s, c, l, u, m = this.getTracker(e.name), p = "sources_".concat(e.name), d = global[p];
d && d.tick === Game.time ? u = d.sources : (u = e.find(FIND_SOURCES), global[p] = {
sources: u,
tick: Game.time
});
var f = 0, y = 0;
try {
for (var g = a(u), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
f += v.energyCapacity, y += v.energy;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
h && !h.done && (o = g.return) && o.call(g);
} finally {
if (r) throw r.error;
}
}
var R = f - y;
if (m.energyHarvested.add(R), null === (l = e.controller) || void 0 === l ? void 0 : l.my) {
var E = e.controller.progress - m.lastControllerProgress;
E > 0 && E < 1e5 && m.controllerProgress.add(E), m.lastControllerProgress = e.controller.progress;
}
var T = un(e, FIND_HOSTILE_CREEPS);
m.hostileCount.add(T.length);
var C = 0;
try {
for (var S = a(T), _ = S.next(); !_.done; _ = S.next()) {
var O = _.value;
try {
for (var b = (s = void 0, a(O.body)), w = b.next(); !w.done; w = b.next()) {
var U = w.value;
U.hits > 0 && (U.type === ATTACK ? C += 30 : U.type === RANGED_ATTACK && (C += 10));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
w && !w.done && (c = b.return) && c.call(b);
} finally {
if (s) throw s.error;
}
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
_ && !_.done && (i = S.return) && i.call(S);
} finally {
if (n) throw n.error;
}
}
m.damageReceived.add(C), t.metrics.energyHarvested = m.energyHarvested.get(), t.metrics.controllerProgress = m.controllerProgress.get(), 
t.metrics.hostileCount = Math.round(m.hostileCount.get()), t.metrics.damageReceived = m.damageReceived.get();
}, e.prototype.updatePheromones = function(e, t) {
var r, o;
if (!(Game.time < e.nextUpdateTick)) {
var n = e.pheromones;
try {
for (var i = a(Object.keys(n)), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = this.config.decayFactors[c];
n[c] = this.clamp(n[c] * l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
this.calculateContributions(e, t), e.nextUpdateTick = Game.time + this.config.updateInterval, 
e.lastUpdate = Game.time;
}
}, e.prototype.calculateContributions = function(e, t) {
var r, o, n = e.pheromones, a = this.getTracker(t.name), i = "sources_".concat(t.name), s = global[i];
if (s && s.tick === Game.time ? o = s.sources : (o = t.find(FIND_SOURCES), global[i] = {
sources: o,
tick: Game.time
}), o.length > 0) {
var c = o.reduce(function(e, t) {
return e + t.energy;
}, 0) / o.length;
n.harvest = this.clamp(n.harvest + c / 3e3 * 10);
}
var l = t.find(FIND_MY_CONSTRUCTION_SITES);
if (l.length > 0 && (n.build = this.clamp(n.build + Math.min(2 * l.length, 20))), 
null === (r = t.controller) || void 0 === r ? void 0 : r.my) {
var u = t.controller.progress / t.controller.progressTotal;
u < .5 && (n.upgrade = this.clamp(n.upgrade + 15 * (1 - u)));
}
var m = a.hostileCount.get();
if (m > 0 && (n.defense = this.clamp(n.defense + 10 * m)), e.danger >= 2 && (n.war = this.clamp(n.war + 10 * e.danger)), 
e.danger >= 3 && (n.siege = this.clamp(n.siege + 20)), t.storage) {
var p = t.find(FIND_MY_SPAWNS);
p.reduce(function(e, t) {
return e + t.store.getUsedCapacity(RESOURCE_ENERGY);
}, 0) < 300 * p.length * .5 && (n.logistics = this.clamp(n.logistics + 10));
}
var d = a.energyHarvested.get() - e.metrics.energySpawning;
d > 0 && 0 === e.danger && (n.expand = this.clamp(n.expand + Math.min(d / 100, 10)));
}, e.prototype.clamp = function(e) {
return Math.max(this.config.minValue, Math.min(this.config.maxValue, e));
}, e.prototype.onHostileDetected = function(e, t, r) {
e.danger = r, e.pheromones.defense = this.clamp(e.pheromones.defense + 5 * t), r >= 2 && (e.pheromones.war = this.clamp(e.pheromones.war + 10 * r)), 
r >= 3 && (e.pheromones.siege = this.clamp(e.pheromones.siege + 20)), Me.info("Hostile detected: ".concat(t, " hostiles, danger=").concat(r), {
room: e.role,
subsystem: "Pheromone"
});
}, e.prototype.updateDangerFromThreat = function(e, t, r) {
e.danger = r, e.pheromones.defense = this.clamp(t / 10), r >= 2 && (e.pheromones.war = this.clamp(e.pheromones.war + 10 * r)), 
r >= 3 && (e.pheromones.siege = this.clamp(e.pheromones.siege + 20));
}, e.prototype.diffuseDangerToCluster = function(e, t, r) {
var o, n, i;
try {
for (var s = a(r), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (l !== e) {
var u = Game.rooms[l];
if (null === (i = null == u ? void 0 : u.controller) || void 0 === i ? void 0 : i.my) {
var m = u.memory.swarm;
if (m) {
var p = this.clamp(t / 10), d = m.pheromones.defense, f = .05 * Math.max(0, p - d);
m.pheromones.defense = this.clamp(d + f);
}
}
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
c && !c.done && (n = s.return) && n.call(s);
} finally {
if (o) throw o.error;
}
}
}, e.prototype.onStructureDestroyed = function(e, t) {
e.pheromones.defense = this.clamp(e.pheromones.defense + 5), e.pheromones.build = this.clamp(e.pheromones.build + 10), 
t !== STRUCTURE_SPAWN && t !== STRUCTURE_STORAGE && t !== STRUCTURE_TOWER || (e.danger = Math.min(3, e.danger + 1), 
e.pheromones.siege = this.clamp(e.pheromones.siege + 15));
}, e.prototype.onNukeDetected = function(e) {
e.danger = 3, e.pheromones.siege = this.clamp(e.pheromones.siege + 50), e.pheromones.defense = this.clamp(e.pheromones.defense + 30);
}, e.prototype.onRemoteSourceLost = function(e) {
e.pheromones.expand = this.clamp(e.pheromones.expand - 10), e.pheromones.defense = this.clamp(e.pheromones.defense + 5);
}, e.prototype.applyDiffusion = function(e) {
var t, r, o, n, s, c, l, u, m = [];
try {
for (var p = a(e), d = p.next(); !d.done; d = p.next()) {
var f = i(d.value, 2), y = f[0], g = f[1], h = this.getNeighborRoomNames(y);
try {
for (var v = (o = void 0, a(h)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
if (e.get(E)) try {
for (var T = (s = void 0, a([ "defense", "war", "expand", "siege" ])), C = T.next(); !C.done; C = T.next()) {
var S = C.value, _ = g.pheromones[S];
if (_ > 1) {
var O = this.config.diffusionRates[S];
m.push({
source: y,
target: E,
type: S,
amount: _ * O * .5,
sourceIntensity: _
});
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
C && !C.done && (c = T.return) && c.call(T);
} finally {
if (s) throw s.error;
}
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
R && !R.done && (n = v.return) && n.call(v);
} finally {
if (o) throw o.error;
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
d && !d.done && (r = p.return) && r.call(p);
} finally {
if (t) throw t.error;
}
}
try {
for (var b = a(m), w = b.next(); !w.done; w = b.next()) {
var U = w.value, x = e.get(U.target);
if (x) {
var A = x.pheromones[U.type] + U.amount;
x.pheromones[U.type] = this.clamp(Math.min(A, U.sourceIntensity));
}
}
} catch (e) {
l = {
error: e
};
} finally {
try {
w && !w.done && (u = b.return) && u.call(b);
} finally {
if (l) throw l.error;
}
}
}, e.prototype.getNeighborRoomNames = function(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
if (!t) return [];
var r = i(t, 5), o = r[1], n = r[2], a = r[3], s = r[4];
if (!(o && n && a && s)) return [];
var c = parseInt(n, 10), l = parseInt(s, 10), u = [];
return "N" === a ? u.push("".concat(o).concat(c, "N").concat(l + 1)) : l > 0 ? u.push("".concat(o).concat(c, "S").concat(l - 1)) : u.push("".concat(o).concat(c, "N0")), 
"S" === a ? u.push("".concat(o).concat(c, "S").concat(l + 1)) : l > 0 ? u.push("".concat(o).concat(c, "N").concat(l - 1)) : u.push("".concat(o).concat(c, "S0")), 
"E" === o ? u.push("E".concat(c + 1).concat(a).concat(l)) : c > 0 ? u.push("W".concat(c - 1).concat(a).concat(l)) : u.push("E0".concat(a).concat(l)), 
"W" === o ? u.push("W".concat(c + 1).concat(a).concat(l)) : c > 0 ? u.push("E".concat(c - 1).concat(a).concat(l)) : u.push("W0".concat(a).concat(l)), 
u;
}, e.prototype.getDominantPheromone = function(e) {
var t, r, o = null, n = 1;
try {
for (var i = a(Object.keys(e)), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
e[c] > n && (n = e[c], o = c);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
return o;
}, e;
}(), Fi = new Di, Bi = new Map, Hi = function() {
function t() {}
return t.prototype.updateThreatAssessment = function(t, r, o) {
var n, c, l, u, m, p;
if (Game.time % 5 == 0) {
var d = o.spawns.length + o.towers.length, f = Bi.get(t.name);
f && f.lastTick < Game.time && d < f.lastStructureCount && (o.spawns.length < f.lastSpawns.length && yr.emit("structure.destroyed", {
roomName: t.name,
structureType: STRUCTURE_SPAWN,
structureId: "unknown",
source: t.name
}), o.towers.length < f.lastTowers.length && yr.emit("structure.destroyed", {
roomName: t.name,
structureType: STRUCTURE_TOWER,
structureId: "unknown",
source: t.name
})), Bi.set(t.name, {
lastStructureCount: d,
lastSpawns: s([], i(o.spawns), !1),
lastTowers: s([], i(o.towers), !1),
lastTick: Game.time
});
}
var y = un(t, FIND_HOSTILE_CREEPS);
if (y.length > 0) {
var g = fa(t), h = g.dangerLevel;
if (h > r.danger) {
if (Fi.updateDangerFromThreat(r, g.threatScore, g.dangerLevel), r.clusterId) {
var v = e.memoryManager.getCluster(r.clusterId);
v && Fi.diffuseDangerToCluster(t.name, g.threatScore, v.memberRooms);
}
e.memoryManager.addRoomEvent(t.name, "hostileDetected", "".concat(y.length, " hostiles, danger=").concat(h, ", score=").concat(g.threatScore));
try {
for (var R = a(y), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
yr.emit("hostile.detected", {
roomName: t.name,
hostileId: T.id,
hostileOwner: T.owner.username,
bodyParts: T.body.length,
threatLevel: h,
source: t.name
});
}
} catch (e) {
n = {
error: e
};
} finally {
try {
E && !E.done && (c = R.return) && c.call(R);
} finally {
if (n) throw n.error;
}
}
}
r.danger = h;
} else r.danger > 0 && (yr.emit("hostile.cleared", {
roomName: t.name,
source: t.name
}), r.danger = 0);
if (Game.time % 10 == 0) {
var C = t.find(FIND_NUKES);
if (C.length > 0) {
if (!r.nukeDetected) {
Fi.onNukeDetected(r);
var S = null !== (p = null === (m = C[0]) || void 0 === m ? void 0 : m.launchRoomName) && void 0 !== p ? p : "unidentified source";
e.memoryManager.addRoomEvent(t.name, "nukeDetected", "".concat(C.length, " nuke(s) incoming from ").concat(S)), 
r.nukeDetected = !0;
try {
for (var _ = a(C), O = _.next(); !O.done; O = _.next()) {
var b = O.value;
yr.emit("nuke.detected", {
roomName: t.name,
nukeId: b.id,
landingTick: Game.time + b.timeToLand,
launchRoomName: b.launchRoomName,
source: t.name
});
}
} catch (e) {
l = {
error: e
};
} finally {
try {
O && !O.done && (u = _.return) && u.call(_);
} finally {
if (l) throw l.error;
}
}
}
} else r.nukeDetected = !1;
}
}, t.prototype.runTowerControl = function(e, t, r) {
var o, n, i, s;
if (0 !== r.length) {
var c = un(e, FIND_HOSTILE_CREEPS), l = c.length > 0 ? this.selectTowerTarget(c) : null, u = function(r) {
if (r.store.getUsedCapacity(RESOURCE_ENERGY) < 10) return "continue";
if (l) return r.attack(l), "continue";
var o;
if ("siege" !== t.posture && (o = r.pos.findClosestByRange(FIND_MY_CREEPS, {
filter: function(e) {
return e.hits < e.hitsMax;
}
}))) return r.heal(o), "continue";
if (!Pi.isCombatPosture(t.posture) && (o = r.pos.findClosestByRange(FIND_STRUCTURES, {
filter: function(e) {
return e.hits < .8 * e.hitsMax && e.structureType !== STRUCTURE_WALL && e.structureType !== STRUCTURE_RAMPART;
}
}))) return r.repair(o), "continue";
if (!Pi.isCombatPosture(t.posture) && 0 === c.length) {
var n = Ta(null !== (s = null === (i = e.controller) || void 0 === i ? void 0 : i.level) && void 0 !== s ? s : 1, t.danger), a = r.pos.findClosestByRange(FIND_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART) && e.hits < n;
}
});
a && r.repair(a);
}
};
try {
for (var m = a(r), p = m.next(); !p.done; p = m.next()) u(p.value);
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
}
}, t.prototype.selectTowerTarget = function(e) {
var t, r = this;
return null !== (t = e.sort(function(e, t) {
var o = r.getHostilePriority(e);
return r.getHostilePriority(t) - o;
})[0]) && void 0 !== t ? t : null;
}, t.prototype.getHostilePriority = function(e) {
var t, r, o = 0;
if (o += 100 * e.getActiveBodyparts(HEAL), o += 50 * e.getActiveBodyparts(RANGED_ATTACK), 
o += 40 * e.getActiveBodyparts(ATTACK), o += 60 * e.getActiveBodyparts(CLAIM), (o += 30 * e.getActiveBodyparts(WORK)) > 0) try {
for (var n = a(e.body), i = n.next(); !i.done; i = n.next()) if (i.value.boost) {
o += 20;
break;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return o;
}, t;
}(), Wi = new Hi;

function Yi(e) {
var t, r = {
1: {
spawn: 1,
extension: 0,
road: 2500,
constructedWall: 0
},
2: {
spawn: 1,
extension: 5,
road: 2500,
constructedWall: 2500,
rampart: 2500,
container: 5
},
3: {
spawn: 1,
extension: 10,
road: 2500,
constructedWall: 2500,
rampart: 2500,
container: 5,
tower: 1
},
4: {
spawn: 1,
extension: 20,
road: 2500,
constructedWall: 2500,
rampart: 2500,
container: 5,
tower: 1,
storage: 1
},
5: {
spawn: 1,
extension: 30,
road: 2500,
constructedWall: 2500,
rampart: 2500,
container: 5,
tower: 2,
storage: 1,
link: 2
},
6: {
spawn: 1,
extension: 40,
road: 2500,
constructedWall: 2500,
rampart: 2500,
container: 5,
tower: 2,
storage: 1,
link: 3,
terminal: 1,
extractor: 1,
lab: 3
},
7: {
spawn: 2,
extension: 50,
road: 2500,
constructedWall: 2500,
rampart: 2500,
container: 5,
tower: 3,
storage: 1,
link: 4,
terminal: 1,
extractor: 1,
lab: 6,
factory: 1
},
8: {
spawn: 3,
extension: 60,
road: 2500,
constructedWall: 2500,
rampart: 2500,
container: 5,
tower: 6,
storage: 1,
link: 6,
terminal: 1,
extractor: 1,
lab: 10,
factory: 1,
nuker: 1,
observer: 1,
powerSpawn: 1
}
};
return null !== (t = r[e]) && void 0 !== t ? t : r[1];
}

function Ki(e) {
return [ {
x: e.x - 1,
y: e.y - 1
}, {
x: e.x,
y: e.y - 1
}, {
x: e.x + 1,
y: e.y - 1
}, {
x: e.x - 1,
y: e.y
}, {
x: e.x + 1,
y: e.y
}, {
x: e.x - 1,
y: e.y + 1
}, {
x: e.x,
y: e.y + 1
}, {
x: e.x + 1,
y: e.y + 1
} ];
}

function Vi(e, t) {
return e.filter(function(e) {
return t.includes(e.structureType);
}).map(function(e) {
return {
x: e.x,
y: e.y
};
});
}

function qi(e, t, r) {
var o, n, i = [];
try {
for (var s = a(r), c = s.next(); !c.done; c = s.next()) for (var l = c.value, u = 1; u <= t; u++) switch (l) {
case "north":
i.push({
x: e.x,
y: e.y - u
});
break;

case "south":
i.push({
x: e.x,
y: e.y + u
});
break;

case "east":
i.push({
x: e.x + u,
y: e.y
});
break;

case "west":
i.push({
x: e.x - u,
y: e.y
});
}
} catch (e) {
o = {
error: e
};
} finally {
try {
c && !c.done && (n = s.return) && n.call(s);
} finally {
if (o) throw o.error;
}
}
return i;
}

var ji = {
x: 0,
y: 0
}, zi = {
name: "seedNest",
rcl: 1,
type: "spread",
minSpaceRadius: 3,
anchor: {
x: 25,
y: 25
},
structures: [ {
x: ji.x,
y: ji.y,
structureType: STRUCTURE_SPAWN
}, {
x: -2,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: -2,
structureType: STRUCTURE_EXTENSION
} ],
roads: s([], i(Ki(ji)), !1),
ramparts: []
}, Xi = {
x: 0,
y: 0
}, Qi = {
name: "foragingExpansion",
rcl: 3,
type: "spread",
minSpaceRadius: 4,
anchor: {
x: 25,
y: 25
},
structures: [ {
x: 0,
y: 0,
structureType: STRUCTURE_SPAWN
}, {
x: 0,
y: -4,
structureType: STRUCTURE_TOWER
}, {
x: 4,
y: 4,
structureType: STRUCTURE_STORAGE
}, {
x: -2,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 4,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: 4,
structureType: STRUCTURE_EXTENSION
}, {
x: -1,
y: -3,
structureType: STRUCTURE_EXTENSION
}, {
x: 1,
y: -3,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: -1,
structureType: STRUCTURE_EXTENSION
}, {
x: 3,
y: -1,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: 1,
structureType: STRUCTURE_EXTENSION
}, {
x: 3,
y: 1,
structureType: STRUCTURE_EXTENSION
}, {
x: -1,
y: 3,
structureType: STRUCTURE_EXTENSION
}, {
x: 1,
y: 3,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: -3,
structureType: STRUCTURE_EXTENSION
} ],
roads: s(s(s(s([], i(Ki(Xi)), !1), [ {
x: -2,
y: -1
}, {
x: 2,
y: -1
}, {
x: -2,
y: 1
}, {
x: 2,
y: 1
}, {
x: -1,
y: -2
}, {
x: 1,
y: -2
}, {
x: -1,
y: 2
}, {
x: 1,
y: 2
} ], !1), i(qi(Xi, 3, [ "north", "south", "east", "west" ])), !1), [ {
x: 3,
y: 3
}, {
x: 4,
y: 3
}, {
x: 3,
y: 4
} ], !1),
ramparts: []
}, Zi = {
x: 0,
y: 0
}, Ji = {
name: "matureColony",
rcl: 5,
type: "spread",
minSpaceRadius: 6,
anchor: {
x: 25,
y: 25
},
structures: [ {
x: 0,
y: 0,
structureType: STRUCTURE_SPAWN
}, {
x: 4,
y: 0,
structureType: STRUCTURE_SPAWN
}, {
x: 0,
y: 4,
structureType: STRUCTURE_STORAGE
}, {
x: 2,
y: 4,
structureType: STRUCTURE_TERMINAL
}, {
x: 0,
y: -4,
structureType: STRUCTURE_TOWER
}, {
x: -4,
y: 0,
structureType: STRUCTURE_TOWER
}, {
x: 4,
y: -4,
structureType: STRUCTURE_TOWER
}, {
x: -2,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -1,
y: -3,
structureType: STRUCTURE_EXTENSION
}, {
x: 1,
y: -3,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: -1,
structureType: STRUCTURE_EXTENSION
}, {
x: 3,
y: -1,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: 1,
structureType: STRUCTURE_EXTENSION
}, {
x: 3,
y: 1,
structureType: STRUCTURE_EXTENSION
}, {
x: -1,
y: 3,
structureType: STRUCTURE_EXTENSION
}, {
x: 1,
y: 3,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: -3,
structureType: STRUCTURE_EXTENSION
}, {
x: 3,
y: -3,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: 3,
structureType: STRUCTURE_EXTENSION
}, {
x: -6,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: -6,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 6,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 6,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: 4,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: 6,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: 5,
structureType: STRUCTURE_LAB
}, {
x: -4,
y: 4,
structureType: STRUCTURE_LAB
}, {
x: -5,
y: 5,
structureType: STRUCTURE_LAB
}, {
x: -2,
y: 4,
structureType: STRUCTURE_LINK
} ],
roads: s(s(s([], i(Ki(Zi)), !1), [ {
x: 3,
y: -1
}, {
x: 3,
y: 0
}, {
x: 3,
y: 1
}, {
x: 4,
y: -1
}, {
x: 4,
y: 1
}, {
x: 5,
y: -1
}, {
x: 5,
y: 0
}, {
x: 5,
y: 1
}, {
x: -2,
y: -1
}, {
x: 2,
y: -1
}, {
x: -2,
y: 1
}, {
x: 2,
y: 1
}, {
x: -1,
y: -2
}, {
x: 1,
y: -2
}, {
x: -1,
y: 2
}, {
x: 1,
y: 2
} ], !1), i(qi(Zi, 3, [ "north", "south", "east", "west" ])), !1),
ramparts: Vi([ {
x: 0,
y: 0,
structureType: STRUCTURE_SPAWN
}, {
x: 4,
y: 0,
structureType: STRUCTURE_SPAWN
}, {
x: 0,
y: 4,
structureType: STRUCTURE_STORAGE
}, {
x: 2,
y: 4,
structureType: STRUCTURE_TERMINAL
} ], [ STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL ])
}, $i = {
name: "fortifiedHive",
rcl: 7,
type: "spread",
minSpaceRadius: 7,
anchor: {
x: 25,
y: 25
},
structures: [ {
x: 0,
y: 0,
structureType: STRUCTURE_SPAWN
}, {
x: -5,
y: -1,
structureType: STRUCTURE_SPAWN
}, {
x: 5,
y: -1,
structureType: STRUCTURE_SPAWN
}, {
x: 0,
y: 4,
structureType: STRUCTURE_STORAGE
}, {
x: 2,
y: 4,
structureType: STRUCTURE_TERMINAL
}, {
x: 0,
y: -4,
structureType: STRUCTURE_TOWER
}, {
x: -4,
y: -2,
structureType: STRUCTURE_TOWER
}, {
x: 4,
y: -2,
structureType: STRUCTURE_TOWER
}, {
x: -4,
y: 2,
structureType: STRUCTURE_TOWER
}, {
x: 4,
y: 2,
structureType: STRUCTURE_TOWER
}, {
x: 0,
y: 6,
structureType: STRUCTURE_TOWER
}, {
x: -2,
y: 4,
structureType: STRUCTURE_FACTORY
}, {
x: -4,
y: 4,
structureType: STRUCTURE_LAB
}, {
x: -3,
y: 5,
structureType: STRUCTURE_LAB
}, {
x: -4,
y: 6,
structureType: STRUCTURE_LAB
}, {
x: -5,
y: 5,
structureType: STRUCTURE_LAB
}, {
x: -6,
y: 4,
structureType: STRUCTURE_LAB
}, {
x: -6,
y: 6,
structureType: STRUCTURE_LAB
}, {
x: -2,
y: 6,
structureType: STRUCTURE_LAB
}, {
x: -5,
y: 3,
structureType: STRUCTURE_LAB
}, {
x: -7,
y: 5,
structureType: STRUCTURE_LAB
}, {
x: -3,
y: 7,
structureType: STRUCTURE_LAB
}, {
x: 4,
y: 4,
structureType: STRUCTURE_NUKER
}, {
x: 6,
y: 0,
structureType: STRUCTURE_OBSERVER
}, {
x: -1,
y: 5,
structureType: STRUCTURE_POWER_SPAWN
}, {
x: 1,
y: 5,
structureType: STRUCTURE_LINK
}, {
x: 5,
y: -3,
structureType: STRUCTURE_LINK
}, {
x: -5,
y: -3,
structureType: STRUCTURE_LINK
}, {
x: -2,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: -1,
structureType: STRUCTURE_EXTENSION
}, {
x: 3,
y: -1,
structureType: STRUCTURE_EXTENSION
} ],
roads: s(s(s(s([], i(Ki({
x: 0,
y: 0
})), !1), i(Ki({
x: -5,
y: -1
})), !1), i(Ki({
x: 5,
y: -1
})), !1), [ {
x: -3,
y: 0
}, {
x: 3,
y: 0
}, {
x: 0,
y: -3
}, {
x: 0,
y: 3
}, {
x: -2,
y: -1
}, {
x: 2,
y: -1
}, {
x: -2,
y: 1
}, {
x: 2,
y: 1
}, {
x: -1,
y: -2
}, {
x: 1,
y: -2
}, {
x: -1,
y: 2
}, {
x: 1,
y: 2
} ], !1),
ramparts: Vi([ {
x: 0,
y: 0,
structureType: STRUCTURE_SPAWN
}, {
x: -5,
y: -1,
structureType: STRUCTURE_SPAWN
}, {
x: 5,
y: -1,
structureType: STRUCTURE_SPAWN
}, {
x: 0,
y: 4,
structureType: STRUCTURE_STORAGE
}, {
x: 2,
y: 4,
structureType: STRUCTURE_TERMINAL
}, {
x: 0,
y: -4,
structureType: STRUCTURE_TOWER
}, {
x: -4,
y: -2,
structureType: STRUCTURE_TOWER
}, {
x: 4,
y: -2,
structureType: STRUCTURE_TOWER
}, {
x: -4,
y: 2,
structureType: STRUCTURE_TOWER
}, {
x: 4,
y: 2,
structureType: STRUCTURE_TOWER
}, {
x: 0,
y: 6,
structureType: STRUCTURE_TOWER
}, {
x: 4,
y: 4,
structureType: STRUCTURE_NUKER
}, {
x: -1,
y: 5,
structureType: STRUCTURE_POWER_SPAWN
} ], [ STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_TOWER, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN ])
}, es = {
name: "compactBunker",
rcl: 8,
type: "bunker",
minSpaceRadius: 6,
anchor: {
x: 25,
y: 25
},
structures: [ {
x: 0,
y: 0,
structureType: STRUCTURE_STORAGE
}, {
x: -1,
y: 1,
structureType: STRUCTURE_TERMINAL
}, {
x: 1,
y: 1,
structureType: STRUCTURE_FACTORY
}, {
x: 0,
y: -2,
structureType: STRUCTURE_SPAWN
}, {
x: -2,
y: 1,
structureType: STRUCTURE_SPAWN
}, {
x: 2,
y: 1,
structureType: STRUCTURE_SPAWN
}, {
x: 0,
y: 2,
structureType: STRUCTURE_POWER_SPAWN
}, {
x: -2,
y: -1,
structureType: STRUCTURE_NUKER
}, {
x: -3,
y: -2,
structureType: STRUCTURE_TOWER
}, {
x: 3,
y: -2,
structureType: STRUCTURE_TOWER
}, {
x: -4,
y: 0,
structureType: STRUCTURE_TOWER
}, {
x: 4,
y: 0,
structureType: STRUCTURE_TOWER
}, {
x: -3,
y: 3,
structureType: STRUCTURE_TOWER
}, {
x: 3,
y: 3,
structureType: STRUCTURE_TOWER
}, {
x: -2,
y: 3,
structureType: STRUCTURE_LAB
}, {
x: -1,
y: 3,
structureType: STRUCTURE_LAB
}, {
x: -3,
y: 4,
structureType: STRUCTURE_LAB
}, {
x: -2,
y: 4,
structureType: STRUCTURE_LAB
}, {
x: -1,
y: 4,
structureType: STRUCTURE_LAB
}, {
x: 0,
y: 3,
structureType: STRUCTURE_LAB
}, {
x: 0,
y: 4,
structureType: STRUCTURE_LAB
}, {
x: 1,
y: 3,
structureType: STRUCTURE_LAB
}, {
x: 1,
y: 4,
structureType: STRUCTURE_LAB
}, {
x: 2,
y: 3,
structureType: STRUCTURE_LAB
}, {
x: 2,
y: -1,
structureType: STRUCTURE_OBSERVER
}, {
x: -1,
y: -1,
structureType: STRUCTURE_LINK
}, {
x: 1,
y: -1,
structureType: STRUCTURE_LINK
}, {
x: -3,
y: 1,
structureType: STRUCTURE_LINK
}, {
x: 3,
y: 1,
structureType: STRUCTURE_LINK
}, {
x: -1,
y: -3,
structureType: STRUCTURE_LINK
}, {
x: 1,
y: -3,
structureType: STRUCTURE_LINK
}, {
x: -2,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 4,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: 4,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: 4,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: -6,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: 6,
y: -2,
structureType: STRUCTURE_EXTENSION
}, {
x: -6,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: 6,
y: 0,
structureType: STRUCTURE_EXTENSION
}, {
x: -6,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: 6,
y: 2,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: 4,
structureType: STRUCTURE_EXTENSION
}, {
x: 4,
y: 4,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: 6,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: 6,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: 6,
structureType: STRUCTURE_EXTENSION
}, {
x: -6,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: -6,
structureType: STRUCTURE_EXTENSION
}, {
x: -2,
y: -6,
structureType: STRUCTURE_EXTENSION
}, {
x: 0,
y: -6,
structureType: STRUCTURE_EXTENSION
}, {
x: 2,
y: -6,
structureType: STRUCTURE_EXTENSION
}, {
x: 4,
y: -6,
structureType: STRUCTURE_EXTENSION
}, {
x: 6,
y: -4,
structureType: STRUCTURE_EXTENSION
}, {
x: -6,
y: 4,
structureType: STRUCTURE_EXTENSION
}, {
x: 6,
y: 4,
structureType: STRUCTURE_EXTENSION
}, {
x: -6,
y: 6,
structureType: STRUCTURE_EXTENSION
}, {
x: -4,
y: 6,
structureType: STRUCTURE_EXTENSION
}, {
x: 4,
y: 6,
structureType: STRUCTURE_EXTENSION
}, {
x: 6,
y: 6,
structureType: STRUCTURE_EXTENSION
}, {
x: -5,
y: -5,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: -5,
structureType: STRUCTURE_EXTENSION
}, {
x: -1,
y: -5,
structureType: STRUCTURE_EXTENSION
}, {
x: 1,
y: -5,
structureType: STRUCTURE_EXTENSION
}, {
x: 3,
y: -5,
structureType: STRUCTURE_EXTENSION
}, {
x: 5,
y: -5,
structureType: STRUCTURE_EXTENSION
}, {
x: -5,
y: -3,
structureType: STRUCTURE_EXTENSION
}, {
x: 5,
y: -3,
structureType: STRUCTURE_EXTENSION
}, {
x: -5,
y: -1,
structureType: STRUCTURE_EXTENSION
}, {
x: 5,
y: -1,
structureType: STRUCTURE_EXTENSION
}, {
x: -5,
y: 1,
structureType: STRUCTURE_EXTENSION
}, {
x: 5,
y: 1,
structureType: STRUCTURE_EXTENSION
}, {
x: -5,
y: 3,
structureType: STRUCTURE_EXTENSION
}, {
x: 5,
y: 3,
structureType: STRUCTURE_EXTENSION
}, {
x: -5,
y: 5,
structureType: STRUCTURE_EXTENSION
}, {
x: -3,
y: 5,
structureType: STRUCTURE_EXTENSION
}, {
x: -1,
y: 5,
structureType: STRUCTURE_EXTENSION
}, {
x: 1,
y: 5,
structureType: STRUCTURE_EXTENSION
}, {
x: 3,
y: 5,
structureType: STRUCTURE_EXTENSION
}, {
x: 5,
y: 5,
structureType: STRUCTURE_EXTENSION
} ],
roads: [ {
x: -1,
y: 0
}, {
x: 1,
y: 0
}, {
x: 0,
y: -1
}, {
x: 0,
y: 1
}, {
x: -1,
y: -2
}, {
x: 1,
y: -2
}, {
x: -2,
y: 0
}, {
x: 2,
y: 0
}, {
x: -2,
y: 2
}, {
x: 2,
y: 2
}, {
x: 0,
y: -3
}, {
x: 0,
y: 3
}, {
x: -3,
y: 0
}, {
x: 3,
y: 0
}, {
x: -1,
y: 2
}, {
x: 1,
y: 2
}, {
x: -3,
y: -1
}, {
x: 3,
y: -1
}, {
x: -4,
y: -1
}, {
x: 4,
y: -1
}, {
x: -4,
y: 1
}, {
x: 4,
y: 1
}, {
x: -3,
y: 2
}, {
x: 3,
y: 2
}, {
x: -3,
y: 3
}, {
x: 3,
y: 3
} ],
ramparts: [ {
x: 0,
y: 0
}, {
x: -1,
y: 1
}, {
x: 1,
y: 1
}, {
x: 0,
y: -2
}, {
x: -2,
y: 1
}, {
x: 2,
y: 1
}, {
x: 0,
y: 2
}, {
x: -2,
y: -1
}, {
x: 2,
y: -1
}, {
x: -3,
y: -2
}, {
x: 3,
y: -2
}, {
x: -4,
y: 0
}, {
x: 4,
y: 0
}, {
x: -3,
y: 3
}, {
x: 3,
y: 3
}, {
x: -2,
y: 3
}, {
x: -1,
y: 3
}, {
x: -4,
y: -2
}, {
x: 4,
y: -2
}, {
x: -4,
y: 2
}, {
x: 4,
y: 2
}, {
x: -2,
y: -2
}, {
x: 2,
y: -2
} ]
};

function ts(e, t, r) {
for (var o = e.getTerrain(), n = -1; n <= 1; n++) for (var a = -1; a <= 1; a++) {
var i = t + n, s = r + a;
if (i < 1 || i > 48 || s < 1 || s > 48) return !1;
if (o.get(i, s) === TERRAIN_MASK_WALL) return !1;
}
return !0;
}

function rs(e, t, r) {
var o, n, i, s, c, l = e.getTerrain(), u = null !== (c = r.minSpaceRadius) && void 0 !== c ? c : 7, m = 0, p = 0;
if (t.x < u || t.x > 49 - u || t.y < u || t.y > 49 - u) return {
fits: !1,
reason: "Anchor too close to room edge (needs ".concat(u, " tile margin)")
};
try {
for (var d = a(r.structures), f = d.next(); !f.done; f = d.next()) {
var y = f.value, g = t.x + y.x, h = t.y + y.y;
if (g < 1 || g > 48 || h < 1 || h > 48) return {
fits: !1,
reason: "Structure ".concat(y.structureType, " at (").concat(y.x, ",").concat(y.y, ") would be outside room bounds")
};
p++, l.get(g, h) === TERRAIN_MASK_WALL && m++;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
f && !f.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
try {
for (var v = a(r.roads), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
g = t.x + E.x, h = t.y + E.y, g < 1 || g > 48 || h < 1 || h > 48 || (p++, l.get(g, h) === TERRAIN_MASK_WALL && m++);
}
} catch (e) {
i = {
error: e
};
} finally {
try {
R && !R.done && (s = v.return) && s.call(v);
} finally {
if (i) throw i.error;
}
}
var T = p > 0 ? m / p * 100 : 0;
return "bunker" === r.type && T > 10 ? {
fits: !1,
reason: "Too many walls in blueprint area (".concat(T.toFixed(1), "% walls, max ").concat(10, "% for bunker)"),
wallCount: m,
totalTiles: p
} : "spread" === r.type && T > 25 ? {
fits: !1,
reason: "Too many walls in blueprint area (".concat(T.toFixed(1), "% walls, max ").concat(25, "% for spread layout)"),
wallCount: m,
totalTiles: p
} : {
fits: !0,
wallCount: m,
totalTiles: p
};
}

function os(e, t) {
var r, o, n, i, s, c = e.controller;
if (!c) return null;
var l = e.find(FIND_SOURCES), u = c.pos.x, m = c.pos.y;
try {
for (var p = a(l), d = p.next(); !d.done; d = p.next()) u += (A = d.value).pos.x, 
m += A.pos.y;
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
for (var f = Math.round(u / (l.length + 1)), y = Math.round(m / (l.length + 1)), g = null !== (s = t.minSpaceRadius) && void 0 !== s ? s : 7, h = [], v = 0; v <= 15; v++) {
for (var R = -v; R <= v; R++) for (var E = -v; E <= v; E++) if (!(Math.abs(R) !== v && Math.abs(E) !== v && v > 0)) {
var T = f + R, C = y + E;
if (!(T < g || T > 49 - g || C < g || C > 49 - g)) {
var S = new RoomPosition(T, C, e.name), _ = rs(e, S, t);
if (_.fits) {
var O = 1e3, b = S.getRangeTo(c);
b >= 4 && b <= 8 ? O += 100 : b < 4 ? O -= 50 : b > 12 && (O -= 30);
var w = 0;
try {
for (var U = (n = void 0, a(l)), x = U.next(); !x.done; x = U.next()) {
var A = x.value;
w += S.getRangeTo(A);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
x && !x.done && (i = U.return) && i.call(U);
} finally {
if (n) throw n.error;
}
}
var M = w / l.length;
M >= 5 && M <= 10 ? O += 80 : M < 5 && (O -= 20);
var k = Math.abs(T - 25) + Math.abs(C - 25);
if (k < 10 ? O += 50 : k > 20 && (O -= 30), void 0 !== _.wallCount && void 0 !== _.totalTiles) {
var N = _.wallCount / _.totalTiles * 100;
O += Math.max(0, 50 - 2 * N);
}
h.push({
pos: S,
score: O
});
}
}
}
if (h.length > 0) return h.sort(function(e, t) {
return t.score - e.score;
}), h[0].pos;
}
return null;
}

function ns(e, t) {
var r, o = Yi(t), n = {}, a = e.structures.filter(function(e) {
var t, r, a = e.structureType, i = null !== (t = o[a]) && void 0 !== t ? t : 0, s = null !== (r = n[a]) && void 0 !== r ? r : 0;
return !(s >= i || (n[a] = s + 1, 0));
}), c = null !== (r = o[STRUCTURE_EXTENSION]) && void 0 !== r ? r : 0;
return c > 0 && (a = function(e, t) {
var r = t - e.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION;
}).length;
if (r <= 0) return e;
var o = function() {
for (var e = [], t = [ {
x: -2,
y: 0
}, {
x: 2,
y: 0
}, {
x: 0,
y: -2
}, {
x: 0,
y: 2
}, {
x: -2,
y: -2
}, {
x: 2,
y: -2
}, {
x: -2,
y: 2
}, {
x: 2,
y: 2
}, {
x: -1,
y: -3
}, {
x: 1,
y: -3
}, {
x: -1,
y: 3
}, {
x: 1,
y: 3
}, {
x: -3,
y: -1
}, {
x: 3,
y: -1
}, {
x: -3,
y: 1
}, {
x: 3,
y: 1
}, {
x: -4,
y: 0
}, {
x: 4,
y: 0
}, {
x: 0,
y: -4
}, {
x: 0,
y: 4
}, {
x: -3,
y: -3
}, {
x: 3,
y: -3
}, {
x: -3,
y: 3
}, {
x: 3,
y: 3
}, {
x: -4,
y: -2
}, {
x: 4,
y: -2
}, {
x: -4,
y: 2
}, {
x: 4,
y: 2
}, {
x: -2,
y: -4
}, {
x: 2,
y: -4
}, {
x: -2,
y: 4
}, {
x: 2,
y: 4
}, {
x: -1,
y: -5
}, {
x: 1,
y: -5
}, {
x: -1,
y: 5
}, {
x: 1,
y: 5
}, {
x: -5,
y: -1
}, {
x: 5,
y: -1
}, {
x: -5,
y: 1
}, {
x: 5,
y: 1
}, {
x: -4,
y: -4
}, {
x: 4,
y: -4
}, {
x: -4,
y: 4
}, {
x: 4,
y: 4
}, {
x: -3,
y: -5
}, {
x: 3,
y: -5
}, {
x: -3,
y: 5
}, {
x: 3,
y: 5
}, {
x: -5,
y: -3
}, {
x: 5,
y: -3
}, {
x: -5,
y: 3
}, {
x: 5,
y: 3
}, {
x: -6,
y: 0
}, {
x: 6,
y: 0
}, {
x: 0,
y: -6
}, {
x: 0,
y: 6
}, {
x: -6,
y: -2
}, {
x: 6,
y: -2
}, {
x: -6,
y: 2
}, {
x: 6,
y: 2
}, {
x: -2,
y: -6
}, {
x: 2,
y: -6
}, {
x: -2,
y: 6
}, {
x: 2,
y: 6
}, {
x: -5,
y: -5
}, {
x: 5,
y: -5
}, {
x: -5,
y: 5
}, {
x: 5,
y: 5
}, {
x: -4,
y: -6
}, {
x: 4,
y: -6
}, {
x: -4,
y: 6
}, {
x: 4,
y: 6
}, {
x: -6,
y: -4
}, {
x: 6,
y: -4
}, {
x: -6,
y: 4
}, {
x: 6,
y: 4
} ], r = 0; r < Math.min(80, t.length); r++) e.push({
x: t[r].x,
y: t[r].y,
structureType: STRUCTURE_EXTENSION
});
return e;
}(), n = new Set(e.map(function(e) {
return "".concat(e.x, ",").concat(e.y);
})), a = o.filter(function(e) {
return !n.has("".concat(e.x, ",").concat(e.y));
}).slice(0, r);
return s(s([], i(e), !1), i(a), !1);
}(a, c)), a;
}

function as(e, t) {
if (t >= 8) {
var r = os(e, es);
if (r) return {
blueprint: es,
anchor: r
};
if (o = os(e, $i)) return {
blueprint: $i,
anchor: o
};
}
var o;
if (t >= 7 && (o = os(e, $i))) return {
blueprint: $i,
anchor: o
};
if (t >= 5) {
var n = os(e, Ji);
if (n) return {
blueprint: Ji,
anchor: n
};
}
if (t >= 3) {
var i = os(e, Qi);
if (i) return {
blueprint: Qi,
anchor: i
};
}
var s = os(e, zi);
if (s) return {
blueprint: zi,
anchor: s
};
var c = function(e) {
var t, r, o = e.controller;
if (!o) return null;
var n = e.find(FIND_SOURCES), i = e.getTerrain(), s = o.pos.x, c = o.pos.y;
try {
for (var l = a(n), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
s += m.pos.x, c += m.pos.y;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
for (var p = Math.round(s / (n.length + 1)), d = Math.round(c / (n.length + 1)), f = 0; f < 15; f++) for (var y = -f; y <= f; y++) for (var g = -f; g <= f; g++) if (Math.abs(y) === f || Math.abs(g) === f) {
var h = p + y, v = d + g;
if (!(h < 3 || h > 46 || v < 3 || v > 46) && ts(e, h, v)) {
if (Math.max(Math.abs(h - o.pos.x), Math.abs(v - o.pos.y)) > 20) continue;
if (i.get(h, v) === TERRAIN_MASK_WALL) continue;
return new RoomPosition(h, v, e.name);
}
}
return null;
}(e);
return c ? {
blueprint: zi,
anchor: c
} : null;
}

var is = [ STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_TOWER, STRUCTURE_LAB, STRUCTURE_LINK, STRUCTURE_FACTORY, STRUCTURE_OBSERVER, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN, STRUCTURE_EXTRACTOR ], ss = new Set(is);

function cs(e) {
return e >= 2 && e <= 3;
}

var ls = function() {
function t() {}
return t.prototype.getConstructionInterval = function(e) {
return cs(e) ? 5 : 10;
}, t.prototype.runConstruction = function(t, r, o, n) {
var c, l, u = o;
if (!(u.length >= 10)) {
var m = null !== (l = null === (c = t.controller) || void 0 === c ? void 0 : c.level) && void 0 !== l ? l : 1, p = n[0], d = null == p ? void 0 : p.pos;
if (p) {
var f, y = as(t, m);
if (y) d = y.anchor, f = y.blueprint; else {
if (!(f = function(e) {
return function(e) {
return e >= 7 ? $i : e >= 5 ? Ji : e >= 3 ? Qi : zi;
}(e);
}(m))) return;
d = p.pos;
}
if (f && d) {
if (!Pi.isCombatPosture(r.posture)) {
var g = function(e, t, r, o, n) {
var i, s;
void 0 === n && (n = []);
var c = function(e, t, r, o) {
var n, i, s, c, l, u, m;
void 0 === o && (o = []);
var p = null !== (u = null === (l = e.controller) || void 0 === l ? void 0 : l.level) && void 0 !== u ? u : 1, d = ns(r, p), f = e.getTerrain(), y = [], g = new Map;
try {
for (var h = a(d), v = h.next(); !v.done; v = h.next()) {
var R = v.value, E = t.x + R.x, T = t.y + R.y;
if (!(E < 1 || E > 48 || T < 1 || T > 48) && f.get(E, T) !== TERRAIN_MASK_WALL) {
var C = "".concat(E, ",").concat(T);
g.has(R.structureType) || g.set(R.structureType, new Set), null === (m = g.get(R.structureType)) || void 0 === m || m.add(C);
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
v && !v.done && (i = h.return) && i.call(h);
} finally {
if (n) throw n.error;
}
}
var S = Ia(e, t, r.roads, o);
if (g.set(STRUCTURE_ROAD, S), p >= 6) {
var _ = e.find(FIND_MINERALS);
if (_.length > 0) {
var O = _[0], b = new Set;
b.add("".concat(O.pos.x, ",").concat(O.pos.y)), g.set(STRUCTURE_EXTRACTOR, b);
}
}
var w = e.find(FIND_STRUCTURES, {
filter: function(e) {
return ss.has(e.structureType) && (!0 === e.my || e.structureType === STRUCTURE_ROAD);
}
});
try {
for (var U = a(w), x = U.next(); !x.done; x = U.next()) {
var A = x.value, M = (C = "".concat(A.pos.x, ",").concat(A.pos.y), A.structureType), k = g.get(M);
k && k.has(C) || y.push({
structure: A,
reason: "".concat(A.structureType, " at ").concat(C, " is not in blueprint")
});
}
} catch (e) {
s = {
error: e
};
} finally {
try {
x && !x.done && (c = U.return) && c.call(U);
} finally {
if (s) throw s.error;
}
}
return y;
}(e, t, r, n), l = 0;
try {
for (var u = a(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = p.structure, f = p.reason;
if (l >= 1) break;
d.destroy() === OK && (l++, Me.info("Destroyed misplaced structure: ".concat(f), {
subsystem: "Blueprint",
room: d.room.name,
meta: {
structureType: d.structureType,
pos: d.pos.toString(),
reason: f
}
}));
}
} catch (e) {
i = {
error: e
};
} finally {
try {
m && !m.done && (s = u.return) && s.call(u);
} finally {
if (i) throw i.error;
}
}
return l;
}(t, d, f, 0, r.remoteAssignments);
if (g > 0) {
var h = 1 === g ? "structure" : "structures";
e.memoryManager.addRoomEvent(t.name, "structureDestroyed", "".concat(g, " misplaced ").concat(h, " destroyed for blueprint compliance"));
}
}
var v = {
sitesPlaced: 0,
wallsRemoved: 0
};
if (m >= 2 && u.length < 8) {
var R = cs(m) ? 5 : 3;
(v = function(e, t, r, o, n, c) {
var l, u, m, p, d, f;
if (void 0 === n && (n = 3), void 0 === c && (c = []), o < 2) return {
sitesPlaced: 0,
wallsRemoved: 0
};
var y = function(e, t, r, o) {
var n, c, l, u;
void 0 === o && (o = []);
var m = Ia(e, t, r, o), p = function(e) {
var t, r, o, n, c, l, u, m = Game.map.getRoomTerrain(e), p = [], d = [], f = function(e) {
var t, r, o = [], n = Game.map.getRoomTerrain(e), i = Game.rooms[e], s = new Set;
if (i) {
var c = i.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART;
}
});
try {
for (var l = a(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
s.add("".concat(m.pos.x, ",").concat(m.pos.y));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
}
for (var p = 0; p < 50; p++) n.get(p, 0) === TERRAIN_MASK_WALL || s.has("".concat(p, ",0")) || o.push({
x: p,
y: 0,
exitDirection: "top",
isChokePoint: !1
});
for (p = 0; p < 50; p++) n.get(p, 49) === TERRAIN_MASK_WALL || s.has("".concat(p, ",49")) || o.push({
x: p,
y: 49,
exitDirection: "bottom",
isChokePoint: !1
});
for (var d = 1; d < 49; d++) n.get(0, d) === TERRAIN_MASK_WALL || s.has("0,".concat(d)) || o.push({
x: 0,
y: d,
exitDirection: "left",
isChokePoint: !1
});
for (d = 1; d < 49; d++) n.get(49, d) === TERRAIN_MASK_WALL || s.has("49,".concat(d)) || o.push({
x: 49,
y: d,
exitDirection: "right",
isChokePoint: !1
});
return o;
}(e), y = new Map;
try {
for (var g = a(f), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
(A = null !== (u = y.get(v.exitDirection)) && void 0 !== u ? u : []).push(v), y.set(v.exitDirection, A);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
h && !h.done && (r = g.return) && r.call(g);
} finally {
if (t) throw t.error;
}
}
try {
for (var R = a(y), E = R.next(); !E.done; E = R.next()) {
for (var T = i(E.value, 2), C = T[0], S = s([], i(T[1]), !1).sort(function(e, t) {
return e.x === t.x ? e.y - t.y : e.x - t.x;
}), _ = [], O = [], b = 0; b < S.length; b++) {
v = S[b];
var w = S[b - 1];
!(w && Math.abs(v.x - w.x) <= 1 && Math.abs(v.y - w.y) <= 1) && O.length > 0 && (_.push(O), 
O = []), O.push(v);
}
O.length > 0 && _.push(O);
try {
for (var U = (c = void 0, a(_)), x = U.next(); !x.done; x = U.next()) {
var A = x.value, M = Math.floor(A.length / 2);
for (b = 0; b < A.length; b++) {
var k = (v = A[b]).x, N = v.y;
switch (C) {
case "top":
N = 2;
break;

case "bottom":
N = 47;
break;

case "left":
k = 2;
break;

case "right":
k = 47;
}
m.get(k, N) !== TERRAIN_MASK_WALL && (A.length >= 4 && (b === M || b === M - 1) ? d.push({
x: k,
y: N,
exitDirection: C,
isChokePoint: !1
}) : p.push({
x: k,
y: N,
exitDirection: C,
isChokePoint: !1
}));
}
}
} catch (e) {
c = {
error: e
};
} finally {
try {
x && !x.done && (l = U.return) && l.call(U);
} finally {
if (c) throw c.error;
}
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
E && !E.done && (n = R.return) && n.call(R);
} finally {
if (o) throw o.error;
}
}
return {
walls: p,
ramparts: d
};
}(e.name), d = [], f = [], y = s([], i(p.ramparts), !1);
try {
for (var g = a(p.walls), h = g.next(); !h.done; h = g.next()) {
var v = h.value, R = "".concat(v.x, ",").concat(v.y);
m.has(R) ? (d.push(v), y.push(v)) : f.push(v);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (c = g.return) && c.call(g);
} finally {
if (n) throw n.error;
}
}
var E = [], T = e.find(FIND_STRUCTURES);
try {
for (var C = a(T), S = C.next(); !S.done; S = C.next()) {
var _ = S.value;
_.structureType === STRUCTURE_WALL && (R = "".concat(_.pos.x, ",").concat(_.pos.y), 
m.has(R) && E.push({
x: _.pos.x,
y: _.pos.y
}));
}
} catch (e) {
l = {
error: e
};
} finally {
try {
S && !S.done && (u = C.return) && u.call(C);
} finally {
if (l) throw l.error;
}
}
return {
walls: f,
ramparts: y,
roadCrossings: d,
wallsToRemove: E
};
}(e, t, r, c), g = e.find(FIND_MY_CONSTRUCTION_SITES), h = e.find(FIND_STRUCTURES);
if (g.length >= 10) return {
sitesPlaced: 0,
wallsRemoved: 0
};
var v = 0, R = 0, E = Math.min(n, 10 - g.length), T = h.filter(function(e) {
return e.structureType === STRUCTURE_WALL;
}).length + g.filter(function(e) {
return e.structureType === STRUCTURE_WALL;
}).length, C = h.filter(function(e) {
return e.structureType === STRUCTURE_RAMPART;
}).length + g.filter(function(e) {
return e.structureType === STRUCTURE_RAMPART;
}).length, S = o >= 2 ? 2500 : 0, _ = o >= 2 ? 2500 : 0;
if (o >= 3 && y.wallsToRemove.length > 0) {
var O = function(e) {
var t = h.find(function(t) {
return t.structureType === STRUCTURE_WALL && t.pos.x === e.x && t.pos.y === e.y;
});
if (t && !h.some(function(t) {
return t.structureType === STRUCTURE_RAMPART && t.pos.x === e.x && t.pos.y === e.y;
})) {
var r = t.destroy();
r === OK ? (R++, Ft.info("Removed wall at (".concat(e.x, ",").concat(e.y, ") to allow road passage"), {
subsystem: "Defense"
})) : Ft.warn("Failed to remove wall at (".concat(e.x, ",").concat(e.y, "): ").concat(r), {
subsystem: "Defense"
});
}
};
try {
for (var b = a(y.wallsToRemove), w = b.next(); !w.done; w = b.next()) O(w.value);
} catch (e) {
l = {
error: e
};
} finally {
try {
w && !w.done && (u = b.return) && u.call(b);
} finally {
if (l) throw l.error;
}
}
}
if (o >= 2 && v < E && T < S) {
var U = function(t) {
if (v >= E) return "break";
if (T + v >= S) return "break";
var r = h.some(function(e) {
return e.pos.x === t.x && e.pos.y === t.y && (e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART);
}), o = g.some(function(e) {
return e.pos.x === t.x && e.pos.y === t.y && (e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART);
});
r || o || e.createConstructionSite(t.x, t.y, STRUCTURE_WALL) === OK && (v++, Ft.debug("Placed perimeter wall at (".concat(t.x, ",").concat(t.y, ")"), {
subsystem: "Defense"
}));
};
try {
for (var x = a(y.walls), A = x.next(); !A.done && "break" !== U(A.value); A = x.next()) ;
} catch (e) {
m = {
error: e
};
} finally {
try {
A && !A.done && (p = x.return) && p.call(x);
} finally {
if (m) throw m.error;
}
}
}
if (o >= 3 && v < E && C < _) {
var M = function(t) {
if (v >= E) return "break";
if (C + v >= _) return "break";
var r = h.some(function(e) {
return e.pos.x === t.x && e.pos.y === t.y && e.structureType === STRUCTURE_RAMPART;
}), o = g.some(function(e) {
return e.pos.x === t.x && e.pos.y === t.y && e.structureType === STRUCTURE_RAMPART;
}), n = h.some(function(e) {
return e.pos.x === t.x && e.pos.y === t.y && e.structureType === STRUCTURE_WALL;
});
r || o || n || e.createConstructionSite(t.x, t.y, STRUCTURE_RAMPART) === OK && (v++, 
y.roadCrossings.some(function(e) {
return e.x === t.x && e.y === t.y;
}) ? Ft.debug("Placed rampart at road crossing (".concat(t.x, ",").concat(t.y, ")"), {
subsystem: "Defense"
}) : Ft.debug("Placed rampart gap at (".concat(t.x, ",").concat(t.y, ")"), {
subsystem: "Defense"
}));
};
try {
for (var k = a(y.ramparts), N = k.next(); !N.done && "break" !== M(N.value); N = k.next()) ;
} catch (e) {
d = {
error: e
};
} finally {
try {
N && !N.done && (f = k.return) && f.call(k);
} finally {
if (d) throw d.error;
}
}
}
return {
sitesPlaced: v,
wallsRemoved: R
};
}(t, d, f.roads, m, R, r.remoteAssignments)).wallsRemoved > 0 && e.memoryManager.addRoomEvent(t.name, "wallRemoved", "".concat(v.wallsRemoved, " wall(s) removed to allow road passage"));
}
var E = function(e, t, r) {
var o, n, c, l, u, m, p, d, f, y, g, h, v, R, E = null !== (y = null === (f = e.controller) || void 0 === f ? void 0 : f.level) && void 0 !== y ? y : 1, T = ns(r, E), C = e.getTerrain(), S = [];
if (E >= 6) {
var _ = e.find(FIND_MINERALS);
if (_.length > 0) {
var O = _[0];
S.push({
x: O.pos.x - t.x,
y: O.pos.y - t.y,
structureType: STRUCTURE_EXTRACTOR
});
}
}
var b = s(s([], i(T), !1), i(S), !1), w = 0, U = e.find(FIND_MY_CONSTRUCTION_SITES), x = e.find(FIND_STRUCTURES);
if (U.length >= 10) return 0;
var A = {};
try {
for (var M = a(x), k = M.next(); !k.done; k = M.next()) {
var N = k.value.structureType;
A[N] = (null !== (g = A[N]) && void 0 !== g ? g : 0) + 1;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
k && !k.done && (n = M.return) && n.call(M);
} finally {
if (o) throw o.error;
}
}
try {
for (var I = a(U), P = I.next(); !P.done; P = I.next()) N = P.value.structureType, 
A[N] = (null !== (h = A[N]) && void 0 !== h ? h : 0) + 1;
} catch (e) {
c = {
error: e
};
} finally {
try {
P && !P.done && (l = I.return) && l.call(I);
} finally {
if (c) throw c.error;
}
}
var G = Yi(E), L = function(r) {
var o = null !== (v = A[r.structureType]) && void 0 !== v ? v : 0;
if (o >= (null !== (R = G[r.structureType]) && void 0 !== R ? R : 0)) return "continue";
var n = t.x + r.x, a = t.y + r.y;
return n < 1 || n > 48 || a < 1 || a > 48 || C.get(n, a) === TERRAIN_MASK_WALL || x.some(function(e) {
return e.pos.x === n && e.pos.y === a && e.structureType === r.structureType;
}) || U.some(function(e) {
return e.pos.x === n && e.pos.y === a && e.structureType === r.structureType;
}) ? "continue" : e.createConstructionSite(n, a, r.structureType) === OK && (w++, 
A[r.structureType] = o + 1, w >= 3 || U.length + w >= 10) ? "break" : void 0;
};
try {
for (var D = a(b), F = D.next(); !F.done && "break" !== L(F.value); F = D.next()) ;
} catch (e) {
u = {
error: e
};
} finally {
try {
F && !F.done && (m = D.return) && m.call(D);
} finally {
if (u) throw u.error;
}
}
if (w < 3 && U.length + w < 10) {
var B = function(r) {
var o = t.x + r.x, n = t.y + r.y;
return o < 1 || o > 48 || n < 1 || n > 48 || C.get(o, n) === TERRAIN_MASK_WALL || x.some(function(e) {
return e.pos.x === o && e.pos.y === n && e.structureType === STRUCTURE_ROAD;
}) || U.some(function(e) {
return e.pos.x === o && e.pos.y === n && e.structureType === STRUCTURE_ROAD;
}) ? "continue" : e.createConstructionSite(o, n, STRUCTURE_ROAD) === OK && (++w >= 3 || U.length + w >= 10) ? "break" : void 0;
};
try {
for (var H = a(r.roads), W = H.next(); !W.done && "break" !== B(W.value); W = H.next()) ;
} catch (e) {
p = {
error: e
};
} finally {
try {
W && !W.done && (d = H.return) && d.call(H);
} finally {
if (p) throw p.error;
}
}
}
return w;
}(t, d, f), T = function(e, t) {
var r, o, n = e.find(FIND_MY_CONSTRUCTION_SITES);
if (n.length >= 10) return 0;
var s = ba(e, t), c = e.getTerrain(), l = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
}), u = new Set(l.map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), m = new Set(n.filter(function(e) {
return e.structureType === STRUCTURE_ROAD;
}).map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), p = 0;
try {
for (var d = a(s.positions), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
if (p >= 2) break;
if (n.length + p >= 10) break;
if (!u.has(y) && !m.has(y)) {
var g = i(y.split(","), 2), h = g[0], v = g[1], R = parseInt(h, 10), E = parseInt(v, 10);
c.get(R, E) !== TERRAIN_MASK_WALL && e.createConstructionSite(R, E, STRUCTURE_ROAD) === OK && p++;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
return p;
}(t, d), C = {
placed: 0
};
if (m >= 2 && u.length < 9) {
var S = r.danger >= 2 ? 3 : 2;
(C = function(e, t, r, o) {
var n, i, s, c;
void 0 === o && (o = 5);
var l = {
placed: 0,
needsRepair: 0,
totalCritical: 0,
protected: 0
};
if (t < 2) return l;
var u = function(e, t) {
var r = e.find(FIND_MY_STRUCTURES), o = t < 4 ? Sa : Ca;
return r.filter(function(e) {
return o.includes(e.structureType);
});
}(e, t);
if (l.totalCritical = u.length, 0 === u.length) return l;
var m = e.find(FIND_MY_CONSTRUCTION_SITES);
if (m.length >= 10) return l;
var p = Math.min(o, 10 - m.length), d = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_RAMPART;
}
}), f = Ta(t, r), y = [], g = function(t) {
var o = t.pos, n = o.x, a = o.y;
if (function(e, t, r) {
return e.lookForAt(LOOK_STRUCTURES, t, r).some(function(e) {
return e.structureType === STRUCTURE_RAMPART;
});
}(e, n, a)) {
l.protected++;
var i = d.find(function(e) {
return e.pos.x === n && e.pos.y === a;
});
i && i.hits < f && l.needsRepair++;
} else if (!function(e, t, r) {
return e.lookForAt(LOOK_CONSTRUCTION_SITES, t, r).some(function(e) {
return e.structureType === STRUCTURE_RAMPART;
});
}(e, n, a)) {
var s = 10;
t.structureType === STRUCTURE_SPAWN ? s = 100 : t.structureType === STRUCTURE_STORAGE ? s = 90 : t.structureType === STRUCTURE_TOWER ? s = 80 : t.structureType === STRUCTURE_TERMINAL ? s = 70 : t.structureType === STRUCTURE_LAB && (s = 60), 
r >= 2 && (s += 50), y.push({
structure: t,
priority: s
});
}
};
try {
for (var h = a(u), v = h.next(); !v.done; v = h.next()) g(T = v.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
v && !v.done && (i = h.return) && i.call(h);
} finally {
if (n) throw n.error;
}
}
y.sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var R = a(y), E = R.next(); !E.done; E = R.next()) {
var T = E.value.structure;
if (l.placed >= p) break;
var C = T.pos, S = C.x, _ = C.y, O = e.createConstructionSite(S, _, STRUCTURE_RAMPART);
if (O === OK) l.placed++, Ft.debug("Placed rampart on ".concat(T.structureType, " at (").concat(S, ",").concat(_, ")"), {
subsystem: "Defense"
}); else if (O === ERR_FULL) break;
}
} catch (e) {
s = {
error: e
};
} finally {
try {
E && !E.done && (c = R.return) && c.call(R);
} finally {
if (s) throw s.error;
}
}
return (l.placed > 0 || y.length > 0) && Ft.info("Rampart automation for ".concat(e.name, ": ") + "".concat(l.protected, "/").concat(l.totalCritical, " protected, ") + "".concat(l.placed, " placed, ") + "".concat(y.length - l.placed, " pending"), {
subsystem: "Defense"
}), l;
}(t, m, r.danger, S)).placed > 0 && e.memoryManager.addRoomEvent(t.name, "rampartPlaced", "".concat(C.placed, " rampart(s) placed on critical structures"));
}
r.metrics.constructionSites = u.length + E + T + v.sitesPlaced + C.placed;
}
} else if (1 === m && 0 === u.length) {
var _ = as(t, m);
_ && t.createConstructionSite(_.anchor.x, _.anchor.y, STRUCTURE_SPAWN);
}
}
}, t;
}(), us = new ls;

function ms(e) {
var t;
switch (e.posture) {
case "defensive":
case "nukePrep":
t = "defense";
break;

default:
t = e.posture;
}
return {
currentTick: Game.time,
danger: e.danger,
posture: t,
pheromones: {
war: e.pheromones.war,
siege: e.pheromones.siege
}
};
}

var ps = {
info: function(e, t) {
return Me.info(e, t);
},
warn: function(e, t) {
return Me.warn(e, t);
},
error: function(e, t) {
return Me.error(e, t);
},
debug: function(e, t) {
return Me.debug(e, t);
}
}, ds = new (function() {
function e() {
this.manager = new So({
logger: ps
});
}
return e.prototype.getReaction = function(e) {
return this.manager.getReaction(e);
}, e.prototype.calculateReactionChain = function(e, t) {
return this.manager.calculateReactionChain(e, t);
}, e.prototype.hasResourcesForReaction = function(e, t, r) {
return void 0 === r && (r = 100), this.manager.hasResourcesForReaction(e, t, r);
}, e.prototype.planReactions = function(e, t) {
var r = ms(t);
return this.manager.planReactions(e, r);
}, e.prototype.scheduleCompoundProduction = function(e, t) {
var r = ms(t);
return this.manager.scheduleCompoundProduction(e, r);
}, e.prototype.executeReaction = function(e, t) {
this.manager.executeReaction(e, t);
}, e;
}()), fs = function() {
function t() {}
return t.prototype.runResourceProcessing = function(e, t, r) {
var o, n, a = null !== (n = null === (o = e.controller) || void 0 === o ? void 0 : o.level) && void 0 !== n ? n : 0;
a >= 6 && this.runLabs(e), a >= 7 && this.runFactory(e, r.factory), a >= 8 && this.runPowerSpawn(e, r.powerSpawn), 
this.runLinks(e, r.links, r.sources);
}, t.prototype.runLabs = function(t) {
var r = e.memoryManager.getSwarmState(t.name);
if (r) {
Lo.initialize(t.name), ko.prepareLabs(t, r);
var o = ds.planReactions(t, r);
if (o) {
var n = {
product: o.product,
input1: o.input1,
input2: o.input2,
amountNeeded: 1e3,
priority: o.priority
};
if (Lo.areLabsReady(t.name, n)) {
var a = Po.getConfig(t.name), i = null == a ? void 0 : a.activeReaction;
i && i.input1 === o.input1 && i.input2 === o.input2 && i.output === o.product || Lo.setActiveReaction(t.name, o.input1, o.input2, o.product), 
ds.executeReaction(t, o);
} else Ft.debug("Labs not ready for reaction: ".concat(o.input1, " + ").concat(o.input2, " -> ").concat(o.product), {
subsystem: "Labs",
room: t.name
});
}
Lo.save(t.name);
}
}, t.prototype.runFactory = function(e, t) {
var r, o;
if (t && !(t.cooldown > 0)) {
var n = [ RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_HYDROGEN, RESOURCE_OXYGEN ];
try {
for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (t.store.getUsedCapacity(c) >= 500 && t.store.getUsedCapacity(RESOURCE_ENERGY) >= 200 && t.produce(RESOURCE_UTRIUM_BAR) === OK) break;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
}
}, t.prototype.runPowerSpawn = function(e, t) {
t && t.store.getUsedCapacity(RESOURCE_POWER) >= 1 && t.store.getUsedCapacity(RESOURCE_ENERGY) >= 50 && t.processPower();
}, t.prototype.runLinks = function(e, t, r) {
var o, n;
if (!(t.length < 2)) {
var i = e.storage;
if (i) {
var s = t.find(function(e) {
return e.pos.getRangeTo(i) <= 2;
});
if (s) {
var c = t.filter(function(e) {
return r.some(function(t) {
return e.pos.getRangeTo(t) <= 2;
});
}), l = e.controller, u = l ? t.find(function(e) {
return e.pos.getRangeTo(l) <= 3 && e.id !== s.id;
}) : void 0;
try {
for (var m = a(c), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (d.store.getUsedCapacity(RESOURCE_ENERGY) >= 400 && 0 === d.cooldown && s.store.getFreeCapacity(RESOURCE_ENERGY) >= 400) return void d.transferEnergy(s);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
if (u && 0 === s.cooldown) {
var f = u.store.getUsedCapacity(RESOURCE_ENERGY) < 400, y = s.store.getUsedCapacity(RESOURCE_ENERGY) >= 400;
f && y && s.transferEnergy(u);
}
}
}
}
}, t;
}(), ys = new fs, gs = {
enablePheromones: !0,
enableEvolution: !0,
enableSpawning: !0,
enableConstruction: !0,
enableTowers: !0,
enableProcessing: !0
}, hs = new Map, vs = function() {
function t(e, t) {
void 0 === t && (t = {}), this.roomName = e, this.config = o(o({}, gs), t);
}
return t.prototype.run = function(t) {
var r, o, n, i = tn.startRoom(this.roomName), s = Game.rooms[this.roomName];
if (s && (null === (r = s.controller) || void 0 === r ? void 0 : r.my)) {
!function(e) {
var t, r, o;
if (null === (o = e.controller) || void 0 === o ? void 0 : o.my) {
e.storage && fe.set(e.storage.id, e.storage, {
namespace: Fe,
ttl: 10
}), e.terminal && fe.set(e.terminal.id, e.terminal, {
namespace: Fe,
ttl: 10
}), e.controller && fe.set(e.controller.id, e.controller, {
namespace: Fe,
ttl: 10
});
var n = e.find(FIND_SOURCES);
try {
for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
fe.set(c.id, c, {
namespace: Fe,
ttl: 5
});
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
}
}(s);
var c = e.memoryManager.getOrInitSwarmState(this.roomName), l = function(e) {
var t = hs.get(e.name);
if (t && t.tick === Game.time) return t;
var r = e.find(FIND_MY_STRUCTURES), o = {
tick: Game.time,
towers: r.filter(function(e) {
return e.structureType === STRUCTURE_TOWER;
}),
spawns: r.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
}),
links: r.filter(function(e) {
return e.structureType === STRUCTURE_LINK;
}),
factory: r.find(function(e) {
return e.structureType === STRUCTURE_FACTORY;
}),
powerSpawn: r.find(function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}),
sources: e.find(FIND_SOURCES),
constructionSites: e.find(FIND_MY_CONSTRUCTION_SITES)
};
return hs.set(e.name, o), o;
}(s);
if (this.config.enablePheromones && Game.time % 5 == 0 && Fi.updateMetrics(s, c), 
Wi.updateThreatAssessment(s, c, {
spawns: l.spawns,
towers: l.towers
}), Va.assess(s, c), ja.checkSafeMode(s, c), this.config.enableEvolution && (Ii.updateEvolutionStage(c, s, t), 
Ii.updateMissingStructures(c, s)), Pi.updatePosture(c), this.config.enablePheromones && Fi.updatePheromones(c, s), 
this.config.enableTowers && Wi.runTowerControl(s, c, l.towers), this.config.enableConstruction && Pi.allowsBuilding(c.posture)) {
var u = null !== (n = null === (o = s.controller) || void 0 === o ? void 0 : o.level) && void 0 !== n ? n : 1, m = us.getConstructionInterval(u);
Game.time % m === 0 && us.runConstruction(s, c, l.constructionSites, l.spawns);
}
this.config.enableProcessing && Game.time % 5 == 0 && ys.runResourceProcessing(s, c, {
factory: l.factory,
powerSpawn: l.powerSpawn,
links: l.links,
sources: l.sources
});
var p = Game.cpu.getUsed() - i;
tn.recordRoom(s, p), tn.endRoom(this.roomName, i);
} else tn.endRoom(this.roomName, i);
}, t;
}(), Rs = function() {
function e() {
this.nodes = new Map;
}
return e.prototype.run = function() {
var e, t, r, o, n, s, c, l, u = global, m = u._ownedRooms, p = u._ownedRoomsTick;
l = m && p === Game.time ? m : Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
var d = l.length;
try {
for (var f = a(l), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
this.nodes.has(g.name) || this.nodes.set(g.name, new vs(g.name));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
y && !y.done && (t = f.return) && t.call(f);
} finally {
if (e) throw e.error;
}
}
try {
for (var h = a(this.nodes), v = h.next(); !v.done; v = h.next()) {
var R = i(v.value, 1)[0];
(g = Game.rooms[R]) && (null === (c = g.controller) || void 0 === c ? void 0 : c.my) || this.nodes.delete(R);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
v && !v.done && (o = h.return) && o.call(h);
} finally {
if (r) throw r.error;
}
}
try {
for (var E = a(this.nodes.values()), T = E.next(); !T.done; T = E.next()) {
var C = T.value;
try {
C.run(d);
} catch (e) {
var S = e instanceof Error ? e.message : String(e), _ = e instanceof Error && e.stack ? e.stack : void 0;
Ft.error("Error in room ".concat(C.roomName, ": ").concat(S), {
subsystem: "RoomManager",
room: C.roomName,
meta: {
stack: _
}
});
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
T && !T.done && (s = E.return) && s.call(E);
} finally {
if (n) throw n.error;
}
}
}, e.prototype.getNode = function(e) {
return this.nodes.get(e);
}, e.prototype.getAllNodes = function() {
return Array.from(this.nodes.values());
}, e.prototype.runRoom = function(e) {
var t;
if (null === (t = e.controller) || void 0 === t ? void 0 : t.my) {
this.nodes.has(e.name) || this.nodes.set(e.name, new vs(e.name));
var r, o = global, n = o._ownedRooms, a = o._ownedRoomsTick;
r = n && a === Game.time ? n.length : Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}).length;
var i = this.nodes.get(e.name);
try {
i.run(r);
} catch (t) {
var s = t instanceof Error ? t.message : String(t), c = t instanceof Error && t.stack ? t.stack : void 0;
Ft.error("Error in room ".concat(e.name, ": ").concat(s), {
subsystem: "RoomManager",
room: e.name,
meta: {
stack: c
}
});
}
}
}, e;
}(), Es = new Rs;

function Ts(e) {
var t, r, o;
return e.find(FIND_HOSTILE_CREEPS).length > 0 ? $t.CRITICAL : (null === (t = e.controller) || void 0 === t ? void 0 : t.my) ? $t.HIGH : "ralphschuler" === (null === (o = null === (r = e.controller) || void 0 === r ? void 0 : r.reservation) || void 0 === o ? void 0 : o.username) ? $t.MEDIUM : $t.LOW;
}

function Cs(e) {
var t;
if (!(null === (t = e.controller) || void 0 === t ? void 0 : t.my)) return .02;
var r = e.controller.level;
return e.find(FIND_HOSTILE_CREEPS).length > 0 ? .12 : r <= 3 ? .04 : r <= 6 ? .06 : .08;
}

function Ss(e, t, r) {
var o;
return t === $t.CRITICAL ? {
tickModulo: void 0,
tickOffset: void 0
} : t === $t.HIGH && (null === (o = e.controller) || void 0 === o ? void 0 : o.my) ? {
tickModulo: 5,
tickOffset: r % 5
} : t === $t.MEDIUM ? {
tickModulo: 10,
tickOffset: r % 10
} : t === $t.LOW ? {
tickModulo: 20,
tickOffset: r % 20
} : {
tickModulo: void 0,
tickOffset: void 0
};
}

var _s, Os = function() {
function e() {
this.registeredRooms = new Set, this.lastSyncTick = -1, this.roomIndices = new Map, 
this.nextRoomIndex = 0;
}
return e.prototype.getRoomIndex = function(e) {
var t = this.roomIndices.get(e);
return void 0 === t && (t = this.nextRoomIndex++, this.roomIndices.set(e, t)), t;
}, e.prototype.syncRoomProcesses = function() {
var e, t;
if (this.lastSyncTick !== Game.time) {
this.lastSyncTick = Game.time;
var r = new Set;
for (var o in Game.rooms) {
var n = Game.rooms[o];
r.add(o);
var i = "room:".concat(o), s = yr.getProcess(i), c = Ts(n), l = Cs(n);
this.registeredRooms.has(o) ? s && (s.priority !== c || Math.abs(s.cpuBudget - l) > 1e-4) && this.updateRoomProcess(n, c, l) : this.registerRoomProcess(n);
}
try {
for (var u = a(this.registeredRooms), m = u.next(); !m.done; m = u.next()) o = m.value, 
r.has(o) || this.unregisterRoomProcess(o);
} catch (t) {
e = {
error: t
};
} finally {
try {
m && !m.done && (t = u.return) && t.call(u);
} finally {
if (e) throw e.error;
}
}
}
}, e.prototype.registerRoomProcess = function(e) {
var t, r = Ts(e), o = Cs(e), n = "room:".concat(e.name), a = this.getRoomIndex(e.name), i = Ss(e, r, a);
yr.registerProcess({
id: n,
name: "Room ".concat(e.name).concat((null === (t = e.controller) || void 0 === t ? void 0 : t.my) ? " (owned)" : ""),
priority: r,
frequency: "high",
interval: 1,
tickModulo: i.tickModulo,
tickOffset: i.tickOffset,
minBucket: this.getMinBucketForPriority(r),
cpuBudget: o,
execute: function() {
var t = Game.rooms[e.name];
t && Es.runRoom(t);
}
}), this.registeredRooms.add(e.name);
var s = i.tickModulo ? "(mod=".concat(i.tickModulo, ", offset=").concat(i.tickOffset, ")") : "(every tick)";
Ft.debug("Registered room process: ".concat(e.name, " with priority ").concat(r, " ").concat(s), {
subsystem: "RoomProcessManager"
});
}, e.prototype.updateRoomProcess = function(e, t, r) {
var o, n = "room:".concat(e.name), a = this.getRoomIndex(e.name), i = Ss(e, t, a);
yr.unregisterProcess(n), yr.registerProcess({
id: n,
name: "Room ".concat(e.name).concat((null === (o = e.controller) || void 0 === o ? void 0 : o.my) ? " (owned)" : ""),
priority: t,
frequency: "high",
interval: 1,
tickModulo: i.tickModulo,
tickOffset: i.tickOffset,
minBucket: this.getMinBucketForPriority(t),
cpuBudget: r,
execute: function() {
var t = Game.rooms[e.name];
t && Es.runRoom(t);
}
});
var s = i.tickModulo ? "mod=".concat(i.tickModulo, ", offset=").concat(i.tickOffset) : "every tick";
Ft.debug("Updated room process: ".concat(e.name, " priority=").concat(t, " budget=").concat(r, " (").concat(s, ")"), {
subsystem: "RoomProcessManager"
});
}, e.prototype.unregisterRoomProcess = function(e) {
var t = "room:".concat(e);
yr.unregisterProcess(t), this.registeredRooms.delete(e), this.roomIndices.delete(e), 
Ft.debug("Unregistered room process: ".concat(e), {
subsystem: "RoomProcessManager"
});
}, e.prototype.getMinBucketForPriority = function(e) {
return 0;
}, e.prototype.getStats = function() {
var e, t, r, o, n, i = {}, s = 0;
try {
for (var c = a(this.registeredRooms), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = Game.rooms[u];
if (m) {
var p = Ts(m), d = null !== (r = $t[p]) && void 0 !== r ? r : "UNKNOWN";
i[d] = (null !== (o = i[d]) && void 0 !== o ? o : 0) + 1, (null === (n = m.controller) || void 0 === n ? void 0 : n.my) && s++;
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
return {
totalRooms: Object.keys(Game.rooms).length,
registeredRooms: this.registeredRooms.size,
roomsByPriority: i,
ownedRooms: s
};
}, e.prototype.forceResync = function() {
this.lastSyncTick = -1, this.syncRoomProcesses();
}, e.prototype.reset = function() {
this.registeredRooms.clear(), this.roomIndices.clear(), this.nextRoomIndex = 0, 
this.lastSyncTick = -1;
}, e;
}(), bs = new Os, ws = function() {
function e() {}
return e.prototype.showKernelStats = function() {
var e, t, r, o, n = yr.getStatsSummary(), i = yr.getConfig(), s = yr.getBucketMode(), c = "=== Kernel Stats ===\nBucket Mode: ".concat(s.toUpperCase(), "\nCPU Bucket: ").concat(Game.cpu.bucket, "\nCPU Limit: ").concat(yr.getCpuLimit().toFixed(2), " (").concat((100 * i.targetCpuUsage).toFixed(0), "% of ").concat(Game.cpu.limit, ")\nRemaining CPU: ").concat(yr.getRemainingCpu().toFixed(2), "\n\nProcesses: ").concat(n.totalProcesses, " total (").concat(n.activeProcesses, " active, ").concat(n.suspendedProcesses, " suspended)\nTotal CPU Used: ").concat(n.totalCpuUsed.toFixed(3), "\nAvg CPU/Process: ").concat(n.avgCpuPerProcess.toFixed(4), "\nAvg Health Score: ").concat(n.avgHealthScore.toFixed(1), "/100\n\nTop CPU Consumers:");
try {
for (var l = a(n.topCpuProcesses), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
c += "\n  ".concat(m.name, ": ").concat(m.avgCpu.toFixed(4), " avg CPU");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = l.return) && t.call(l);
} finally {
if (e) throw e.error;
}
}
if (n.unhealthyProcesses.length > 0) {
c += "\n\nUnhealthy Processes (Health < 50):";
try {
for (var p = a(n.unhealthyProcesses), d = p.next(); !d.done; d = p.next()) m = d.value, 
c += "\n  ".concat(m.name, ": ").concat(m.healthScore.toFixed(1), "/100 (").concat(m.consecutiveErrors, " consecutive errors)");
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
}
return c;
}, e.prototype.listProcesses = function() {
var e, t, r = yr.getProcesses();
if (0 === r.length) return "No processes registered with kernel.";
var o = "=== Registered Processes ===\n";
o += "ID | Name | Priority | Frequency | State | Runs | Avg CPU | Health | Errors\n", 
o += "-".repeat(100) + "\n";
var n = s([], i(r), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var c = a(n), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.stats.avgCpu.toFixed(4), p = u.stats.healthScore.toFixed(0), d = u.stats.healthScore >= 80 ? "✓" : u.stats.healthScore >= 50 ? "⚠" : "✗";
o += "".concat(u.id, " | ").concat(u.name, " | ").concat(u.priority, " | ").concat(u.frequency, " | ").concat(u.state, " | ").concat(u.stats.runCount, " | ").concat(m, " | ").concat(d).concat(p, " | ").concat(u.stats.errorCount, "(").concat(u.stats.consecutiveErrors, ")\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.suspendProcess = function(e) {
var t = yr.suspendProcess(e);
return 'Process "'.concat(e, t ? '" suspended.' : '" not found.');
}, e.prototype.resumeProcess = function(e) {
var t = yr.resumeProcess(e);
return 'Process "'.concat(e, t ? '" resumed.' : '" not found or not suspended.');
}, e.prototype.resetKernelStats = function() {
return yr.resetStats(), "Kernel statistics reset.";
}, e.prototype.showProcessHealth = function() {
var e, t, r = yr.getProcesses();
if (0 === r.length) return "No processes registered with kernel.";
var o = s([], i(r), !1).sort(function(e, t) {
return e.stats.healthScore - t.stats.healthScore;
}), n = "=== Process Health Status ===\n";
n += "Name | Health | Errors | Consecutive | Status | Last Success\n", n += "-".repeat(80) + "\n";
try {
for (var c = a(o), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.stats.healthScore.toFixed(0), p = u.stats.healthScore >= 80 ? "✓" : u.stats.healthScore >= 50 ? "⚠" : "✗", d = u.stats.lastSuccessfulRunTick > 0 ? Game.time - u.stats.lastSuccessfulRunTick : "never", f = "suspended" === u.state ? "SUSPENDED (".concat(u.stats.suspensionReason, ")") : u.state.toUpperCase();
n += "".concat(u.name, " | ").concat(p, " ").concat(m, "/100 | ").concat(u.stats.errorCount, " | ").concat(u.stats.consecutiveErrors, " | ").concat(f, " | ").concat(d, "\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
var y = yr.getStatsSummary();
return (n += "\nAverage Health: ".concat(y.avgHealthScore.toFixed(1), "/100")) + "\nSuspended Processes: ".concat(y.suspendedProcesses);
}, e.prototype.resumeAllProcesses = function() {
var e, t, r = yr.getProcesses().filter(function(e) {
return "suspended" === e.state;
});
if (0 === r.length) return "No suspended processes to resume.";
var o = 0;
try {
for (var n = a(r), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
yr.resumeProcess(s.id) && o++;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return "Resumed ".concat(o, " of ").concat(r.length, " suspended processes.");
}, e.prototype.showCreepStats = function() {
var e, t, r = Ui.getStats(), o = "=== Creep Process Stats ===\nTotal Creeps: ".concat(r.totalCreeps, "\nRegistered Processes: ").concat(r.registeredCreeps, "\n\nCreeps by Priority:");
try {
for (var n = a(Object.entries(r.creepsByPriority)), s = n.next(); !s.done; s = n.next()) {
var c = i(s.value, 2), l = c[0], u = c[1];
o += "\n  ".concat(l, ": ").concat(u);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.showRoomStats = function() {
var e, t, r = bs.getStats(), o = "=== Room Process Stats ===\nTotal Rooms: ".concat(r.totalRooms, "\nRegistered Processes: ").concat(r.registeredRooms, "\nOwned Rooms: ").concat(r.ownedRooms, "\n\nRooms by Priority:");
try {
for (var n = a(Object.entries(r.roomsByPriority)), s = n.next(); !s.done; s = n.next()) {
var c = i(s.value, 2), l = c[0], u = c[1];
o += "\n  ".concat(l, ": ").concat(u);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.listCreepProcesses = function(e) {
var t, r, o = yr.getProcesses().filter(function(e) {
return e.id.startsWith("creep:");
});
if (e && (o = o.filter(function(t) {
return t.name.includes("(".concat(e, ")"));
})), 0 === o.length) return e ? "No creep processes found with role: ".concat(e) : "No creep processes registered.";
var n = e ? "=== Creep Processes (Role: ".concat(e, ") ===\n") : "=== All Creep Processes ===\n";
n += "Name | Priority | Runs | Avg CPU | Errors\n", n += "-".repeat(70) + "\n";
var c = s([], i(o), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var l = a(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = m.stats.avgCpu.toFixed(4);
n += "".concat(m.name, " | ").concat(m.priority, " | ").concat(m.stats.runCount, " | ").concat(p, " | ").concat(m.stats.errorCount, "\n");
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
return n + "\nTotal: ".concat(o.length, " creep processes");
}, e.prototype.listRoomProcesses = function() {
var e, t, r = yr.getProcesses().filter(function(e) {
return e.id.startsWith("room:");
});
if (0 === r.length) return "No room processes registered.";
var o = "=== Room Processes ===\n";
o += "Name | Priority | Runs | Avg CPU | Errors\n", o += "-".repeat(70) + "\n";
var n = s([], i(r), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var c = a(n), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.stats.avgCpu.toFixed(4);
o += "".concat(u.name, " | ").concat(u.priority, " | ").concat(u.stats.runCount, " | ").concat(m, " | ").concat(u.stats.errorCount, "\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
return o + "\nTotal: ".concat(r.length, " room processes");
}, n([ Yt({
name: "showKernelStats",
description: "Show kernel statistics including CPU usage and process info",
usage: "showKernelStats()",
examples: [ "showKernelStats()" ],
category: "Kernel"
}) ], e.prototype, "showKernelStats", null), n([ Yt({
name: "listProcesses",
description: "List all registered kernel processes",
usage: "listProcesses()",
examples: [ "listProcesses()" ],
category: "Kernel"
}) ], e.prototype, "listProcesses", null), n([ Yt({
name: "suspendProcess",
description: "Suspend a kernel process by ID",
usage: "suspendProcess(processId)",
examples: [ "suspendProcess('empire:manager')", "suspendProcess('cluster:manager')" ],
category: "Kernel"
}) ], e.prototype, "suspendProcess", null), n([ Yt({
name: "resumeProcess",
description: "Resume a suspended kernel process",
usage: "resumeProcess(processId)",
examples: [ "resumeProcess('empire:manager')" ],
category: "Kernel"
}) ], e.prototype, "resumeProcess", null), n([ Yt({
name: "resetKernelStats",
description: "Reset all kernel process statistics",
usage: "resetKernelStats()",
examples: [ "resetKernelStats()" ],
category: "Kernel"
}) ], e.prototype, "resetKernelStats", null), n([ Yt({
name: "showProcessHealth",
description: "Show health status of all processes with detailed metrics",
usage: "showProcessHealth()",
examples: [ "showProcessHealth()" ],
category: "Kernel"
}) ], e.prototype, "showProcessHealth", null), n([ Yt({
name: "resumeAllProcesses",
description: "Resume all suspended processes (use with caution)",
usage: "resumeAllProcesses()",
examples: [ "resumeAllProcesses()" ],
category: "Kernel"
}) ], e.prototype, "resumeAllProcesses", null), n([ Yt({
name: "showCreepStats",
description: "Show statistics about creep processes managed by the kernel",
usage: "showCreepStats()",
examples: [ "showCreepStats()" ],
category: "Kernel"
}) ], e.prototype, "showCreepStats", null), n([ Yt({
name: "showRoomStats",
description: "Show statistics about room processes managed by the kernel",
usage: "showRoomStats()",
examples: [ "showRoomStats()" ],
category: "Kernel"
}) ], e.prototype, "showRoomStats", null), n([ Yt({
name: "listCreepProcesses",
description: "List all creep processes with their details",
usage: "listCreepProcesses(role?)",
examples: [ "listCreepProcesses()", "listCreepProcesses('harvester')" ],
category: "Kernel"
}) ], e.prototype, "listCreepProcesses", null), n([ Yt({
name: "listRoomProcesses",
description: "List all room processes with their details",
usage: "listRoomProcesses()",
examples: [ "listRoomProcesses()" ],
category: "Kernel"
}) ], e.prototype, "listRoomProcesses", null), e;
}(), Us = function() {
function e() {}
return e.prototype.setLogLevel = function(e) {
var t = {
debug: ft.DEBUG,
info: ft.INFO,
warn: ft.WARN,
error: ft.ERROR,
none: ft.NONE
}[e.toLowerCase()];
return void 0 === t ? "Invalid log level: ".concat(e, ". Valid levels: debug, info, warn, error, none") : (Ot({
level: t
}), "Log level set to: ".concat(e.toUpperCase()));
}, e.prototype.toggleDebug = function() {
var e = !ae().debug;
return ie({
debug: e
}), Ot({
level: e ? ft.DEBUG : ft.INFO
}), "Debug mode: ".concat(e ? "ENABLED" : "DISABLED", " (Log level: ").concat(e ? "DEBUG" : "INFO", ")");
}, n([ Yt({
name: "setLogLevel",
description: "Set the log level for the bot",
usage: "setLogLevel(level)",
examples: [ "setLogLevel('debug')", "setLogLevel('info')", "setLogLevel('warn')", "setLogLevel('error')", "setLogLevel('none')" ],
category: "Logging"
}) ], e.prototype, "setLogLevel", null), n([ Yt({
name: "toggleDebug",
description: "Toggle debug mode on/off (affects log level and debug features)",
usage: "toggleDebug()",
examples: [ "toggleDebug()" ],
category: "Logging"
}) ], e.prototype, "toggleDebug", null), e;
}(), xs = function() {
function t() {}
return t.prototype.showStats = function() {
var e = nn.getLatestStats();
return e ? "=== SwarmBot Stats (Tick ".concat(e.tick, ") ===\nCPU: ").concat(e.cpuUsed.toFixed(2), "/").concat(e.cpuLimit, " (Bucket: ").concat(e.cpuBucket, ")\nGCL: ").concat(e.gclLevel, " (").concat((100 * e.gclProgress).toFixed(1), "%)\nGPL: ").concat(e.gplLevel, "\nCreeps: ").concat(e.totalCreeps, "\nRooms: ").concat(e.totalRooms, "\n").concat(e.rooms.map(function(e) {
return "  ".concat(e.roomName, ": RCL").concat(e.rcl, " | ").concat(e.creepCount, " creeps | ").concat(e.storageEnergy, "E");
}).join("\n")) : "No stats available yet. Wait for a few ticks.";
}, t.prototype.cacheStats = function() {
var e, t = fe.getCacheStats(Fe);
return "=== Object Cache Statistics ===\nCache Size: ".concat(t.size, " entries\nCache Hits: ").concat(t.hits, "\nCache Misses: ").concat(t.misses, "\nHit Rate: ").concat(t.hitRate.toFixed(2), "%\nEstimated CPU Saved: ").concat((null !== (e = t.cpuSaved) && void 0 !== e ? e : 0).toFixed(3), " CPU\n\nPerformance: ").concat(t.hitRate >= 80 ? "Excellent" : t.hitRate >= 60 ? "Good" : t.hitRate >= 40 ? "Fair" : "Poor");
}, t.prototype.resetCacheStats = function() {
return fe.clear(Fe), "Cache statistics reset";
}, t.prototype.roomFindCacheStats = function() {
var e = function() {
var e = fe.getCacheStats(Ye);
return {
rooms: 0,
totalEntries: e.size,
hits: e.hits,
misses: e.misses,
invalidations: e.evictions,
hitRate: e.hitRate
};
}(), t = (100 * e.hitRate).toFixed(2), r = e.hits + e.misses, o = (.05 * e.hits).toFixed(3);
return "=== Room.find() Cache Statistics ===\nCached Rooms: ".concat(e.rooms, "\nTotal Entries: ").concat(e.totalEntries, "\nAvg Entries/Room: ").concat("0", "\n\nTotal Queries: ").concat(r, "\nCache Hits: ").concat(e.hits, "\nCache Misses: ").concat(e.misses, "\nHit Rate: ").concat(t, "%\n\nCache Invalidations: ").concat(e.invalidations, "\nEstimated CPU Saved: ~").concat(o, " CPU this tick\n\nPerformance: ").concat(e.hitRate >= .8 ? "Excellent ✓" : e.hitRate >= .6 ? "Good" : e.hitRate >= .5 ? "Fair" : "Poor - Consider more caching");
}, t.prototype.clearRoomFindCache = function() {
return fe.clear(Ye), "Room.find() cache cleared and statistics reset";
}, t.prototype.toggleProfiling = function() {
var e = !ae().profiling;
return ie({
profiling: e
}), tn.setEnabled(e), Ot({
cpuLogging: e
}), "Profiling: ".concat(e ? "ENABLED" : "DISABLED");
}, t.prototype.cpuBreakdown = function(e) {
var t, r, o, n, i, s, c, l, u = Memory.stats;
if (!u) return "No stats available. Stats collection may be disabled.";
var m = !e, p = [ "=== CPU Breakdown ===" ];
if (p.push("Tick: ".concat(u.tick)), p.push("Total CPU: ".concat(u.cpu.used.toFixed(2), "/").concat(u.cpu.limit, " (").concat(u.cpu.percent.toFixed(1), "%)")), 
p.push("Bucket: ".concat(u.cpu.bucket)), p.push(""), m || "process" === e) {
var d = u.processes || {}, f = Object.values(d);
if (f.length > 0) {
p.push("=== Process CPU Usage ===");
var y = f.sort(function(e, t) {
return t.avg_cpu - e.avg_cpu;
});
try {
for (var g = a(y.slice(0, 10)), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
p.push("  ".concat(v.name, ": ").concat(v.avg_cpu.toFixed(3), " CPU (runs: ").concat(v.run_count, ", max: ").concat(v.max_cpu.toFixed(3), ")"));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
h && !h.done && (r = g.return) && r.call(g);
} finally {
if (t) throw t.error;
}
}
p.push("");
}
}
if (m || "room" === e) {
var R = u.rooms || {}, E = Object.values(R);
if (E.length > 0) {
p.push("=== Room CPU Usage ==="), y = E.sort(function(e, t) {
return t.profiler.avg_cpu - e.profiler.avg_cpu;
});
try {
for (var T = a(y), C = T.next(); !C.done; C = T.next()) {
var S = C.value, _ = S.name || "unknown";
p.push("  ".concat(_, ": ").concat(S.profiler.avg_cpu.toFixed(3), " CPU (RCL ").concat(S.rcl, ")"));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
C && !C.done && (n = T.return) && n.call(T);
} finally {
if (o) throw o.error;
}
}
p.push("");
}
}
if (m || "subsystem" === e) {
var O = u.subsystems || {}, b = Object.values(O);
if (b.length > 0) {
p.push("=== Subsystem CPU Usage ==="), y = b.sort(function(e, t) {
return t.avg_cpu - e.avg_cpu;
});
try {
for (var w = a(y.slice(0, 10)), U = w.next(); !U.done; U = w.next()) {
var x = U.value, A = x.name || "unknown";
p.push("  ".concat(A, ": ").concat(x.avg_cpu.toFixed(3), " CPU (calls: ").concat(x.calls, ")"));
}
} catch (e) {
i = {
error: e
};
} finally {
try {
U && !U.done && (s = w.return) && s.call(w);
} finally {
if (i) throw i.error;
}
}
p.push("");
}
}
if (m || "creep" === e) {
var M = u.creeps || {}, k = Object.values(M);
if (k.length > 0) {
p.push("=== Top Creeps by CPU (Top 10) ==="), y = k.sort(function(e, t) {
return t.cpu - e.cpu;
});
try {
for (var N = a(y.slice(0, 10)), I = N.next(); !I.done; I = N.next()) {
var P = I.value;
if (P.cpu > 0) {
var G = P.name || "".concat(P.role, "_unknown");
p.push("  ".concat(G, " (").concat(P.role, "): ").concat(P.cpu.toFixed(3), " CPU in ").concat(P.current_room));
}
}
} catch (e) {
c = {
error: e
};
} finally {
try {
I && !I.done && (l = N.return) && l.call(N);
} finally {
if (c) throw c.error;
}
}
p.push("");
}
}
return p.join("\n");
}, t.prototype.cpuBudget = function() {
var e, t, r, o, n = tn.validateBudgets(), i = "=== CPU Budget Report (Tick ".concat(n.tick, ") ===\n");
if (i += "Rooms Evaluated: ".concat(n.roomsEvaluated, "\n"), i += "Within Budget: ".concat(n.roomsWithinBudget, "\n"), 
i += "Over Budget: ".concat(n.roomsOverBudget, "\n\n"), 0 === n.alerts.length) i += "✓ All rooms within budget!\n"; else {
i += "Alerts: ".concat(n.alerts.length, "\n");
var s = n.alerts.filter(function(e) {
return "critical" === e.severity;
}), c = n.alerts.filter(function(e) {
return "warning" === e.severity;
});
if (s.length > 0) {
i += "\n🔴 CRITICAL (≥100% of budget):\n";
try {
for (var l = a(s), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
i += "  ".concat(m.target, ": ").concat(m.cpuUsed.toFixed(3), " CPU / ").concat(m.budgetLimit.toFixed(3), " limit (").concat((100 * m.percentUsed).toFixed(1), "%)\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = l.return) && t.call(l);
} finally {
if (e) throw e.error;
}
}
}
if (c.length > 0) {
i += "\n⚠️  WARNING (≥80% of budget):\n";
try {
for (var p = a(c), d = p.next(); !d.done; d = p.next()) m = d.value, i += "  ".concat(m.target, ": ").concat(m.cpuUsed.toFixed(3), " CPU / ").concat(m.budgetLimit.toFixed(3), " limit (").concat((100 * m.percentUsed).toFixed(1), "%)\n");
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
}
}
return i;
}, t.prototype.cpuAnomalies = function() {
var e, t, r, o, n = tn.detectAnomalies();
if (0 === n.length) return "✓ No CPU anomalies detected";
var i = "=== CPU Anomalies Detected: ".concat(n.length, " ===\n\n"), s = n.filter(function(e) {
return "spike" === e.type;
}), c = n.filter(function(e) {
return "sustained_high" === e.type;
});
if (s.length > 0) {
i += "⚡ CPU Spikes (".concat(s.length, "):\n");
try {
for (var l = a(s), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
i += "  ".concat(m.target, ": ").concat(m.current.toFixed(3), " CPU (").concat(m.multiplier.toFixed(1), "x baseline ").concat(m.baseline.toFixed(3), ")\n"), 
m.context && (i += "    Context: ".concat(m.context, "\n"));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = l.return) && t.call(l);
} finally {
if (e) throw e.error;
}
}
i += "\n";
}
if (c.length > 0) {
i += "📊 Sustained High Usage (".concat(c.length, "):\n");
try {
for (var p = a(c), d = p.next(); !d.done; d = p.next()) m = d.value, i += "  ".concat(m.target, ": ").concat(m.current.toFixed(3), " CPU (").concat(m.multiplier.toFixed(1), "x budget ").concat(m.baseline.toFixed(3), ")\n"), 
m.context && (i += "    Context: ".concat(m.context, "\n"));
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
}
return i;
}, t.prototype.cpuProfile = function(e) {
var t, r, o, n;
void 0 === e && (e = !1);
var i = tn.getCurrentSnapshot(), s = "=== CPU Profile (Tick ".concat(i.tick, ") ===\n");
s += "Total: ".concat(i.cpu.used.toFixed(2), " / ").concat(i.cpu.limit, " (").concat(i.cpu.percent.toFixed(1), "%)\n"), 
s += "Bucket: ".concat(i.cpu.bucket, "\n"), s += "Heap: ".concat(i.cpu.heapUsed.toFixed(2), " MB\n\n");
var c = Object.values(i.rooms).sort(function(e, t) {
return t.profiler.avgCpu - e.profiler.avgCpu;
}), l = e ? c : c.slice(0, 10);
s += "Top ".concat(l.length, " Rooms by CPU:\n");
try {
for (var u = a(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = tn.postureCodeToName(p.brain.postureCode);
s += "  ".concat(p.name, " (RCL").concat(p.rcl, ", ").concat(d, "): avg ").concat(p.profiler.avgCpu.toFixed(3), " | peak ").concat(p.profiler.peakCpu.toFixed(3), " | samples ").concat(p.profiler.samples, "\n");
}
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
s += "\nTop Kernel Processes by CPU:\n";
var f = Object.values(i.processes).filter(function(e) {
return e.avgCpu > .001;
}).sort(function(e, t) {
return t.avgCpu - e.avgCpu;
}).slice(0, e ? 999 : 10);
try {
for (var y = a(f), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = h.cpuBudget > 0 ? (h.avgCpu / h.cpuBudget * 100).toFixed(0) : "N/A";
s += "  ".concat(h.name, " (").concat(h.frequency, "): avg ").concat(h.avgCpu.toFixed(3), " / budget ").concat(h.cpuBudget.toFixed(3), " (").concat(v, "%)\n");
}
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (n = y.return) && n.call(y);
} finally {
if (o) throw o.error;
}
}
return s;
}, t.prototype.diagnoseRoom = function(t) {
var r, o, n, s;
if (!t) return "Error: Room name required. Usage: diagnoseRoom('W16S52')";
if (!Game.rooms[t]) return "Error: Room ".concat(t, " not visible. Make sure you have vision in this room.");
var c = tn.getCurrentSnapshot(), l = c.rooms[t];
if (!l) return "Error: No stats available for ".concat(t, ". The room may not have been processed yet.");
var u = "room:".concat(t), m = c.processes[u], p = e.memoryManager.getSwarmState(t), d = p && ("war" === p.posture || "siege" === p.posture || p.danger >= 2), f = d ? .25 : .1, y = null !== (n = null == m ? void 0 : m.tickModulo) && void 0 !== n ? n : 1, g = f * y, h = "═══════════════════════════════════════════════\n";
h += "  Room Diagnostic: ".concat(t, "\n"), h += "═══════════════════════════════════════════════\n\n", 
h += "📊 Basic Info:\n", h += "  RCL: ".concat(l.rcl, "\n"), h += "  Controller Progress: ".concat(l.controller.progressPercent.toFixed(1), "%\n"), 
h += "  Posture: ".concat(tn.postureCodeToName(l.brain.postureCode), "\n"), h += "  Danger Level: ".concat(l.brain.dangerLevel, "\n"), 
h += "  Hostiles: ".concat(l.metrics.hostileCount, "\n\n"), h += "⚡ CPU Analysis:\n", 
h += "  Average CPU: ".concat(l.profiler.avgCpu.toFixed(3), "\n"), h += "  Peak CPU: ".concat(l.profiler.peakCpu.toFixed(3), "\n"), 
h += "  Samples: ".concat(l.profiler.samples, "\n"), h += "  Budget: ".concat(g.toFixed(3), " (base ").concat(f, ", modulo ").concat(y, ")\n");
var v = l.profiler.avgCpu / g * 100;
h += "  Status: ".concat(v >= 100 ? "🔴 CRITICAL" : v >= 80 ? "⚠️  WARNING" : "✅ OK", " (").concat(v.toFixed(1), "% of budget)\n"), 
y > 1 && (h += "  Note: Room runs every ".concat(y, " ticks (distributed execution)\n")), 
h += "\n", m && (h += "🔧 Process Info:\n", h += "  Process ID: ".concat(m.id, "\n"), 
h += "  State: ".concat(m.state, "\n"), h += "  Priority: ".concat(m.priority, "\n"), 
h += "  Run Count: ".concat(m.runCount, "\n"), h += "  Skipped: ".concat(m.skippedCount, "\n"), 
h += "  Errors: ".concat(m.errorCount, "\n"), h += "  Last Run: Tick ".concat(m.lastRunTick, " (").concat(Game.time - m.lastRunTick, " ticks ago)\n\n"));
var R = Object.values(Game.creeps).filter(function(e) {
return e.room.name === t;
});
h += "👥 Creeps: ".concat(R.length, " total\n");
var E = {};
try {
for (var T = a(R), C = T.next(); !C.done; C = T.next()) {
var S = null !== (s = C.value.memory.role) && void 0 !== s ? s : "unknown";
E[S] = (E[S] || 0) + 1;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
C && !C.done && (o = T.return) && o.call(T);
} finally {
if (r) throw r.error;
}
}
var _ = Object.entries(E).sort(function(e, t) {
return t[1] - e[1];
}).map(function(e) {
var t = i(e, 2), r = t[0], o = t[1];
return "".concat(r, ": ").concat(o);
}).join(", ");
return h += "  By Role: ".concat(_, "\n\n"), h += "📈 Metrics:\n", h += "  Energy Harvested: ".concat(l.metrics.energyHarvested, "\n"), 
h += "  Energy in Storage: ".concat(l.energy.storage, "\n"), h += "  Energy Capacity: ".concat(l.metrics.energyCapacityTotal, "\n"), 
h += "  Construction Sites: ".concat(l.metrics.constructionSites, "\n\n"), h += "💡 Recommendations:\n", 
v >= 150 ? (h += "  ⚠️  CRITICAL: CPU usage is ".concat(v.toFixed(0), "% of budget!\n"), 
h += "     - Check for infinite loops or stuck creeps\n", h += "     - Review construction sites (".concat(l.metrics.constructionSites, " active)\n"), 
h += "     - Consider reducing creep count (".concat(R.length, " creeps)\n")) : v >= 100 ? (h += "  ⚠️  Room is over budget. Consider optimizations:\n", 
h += "     - Reduce creep count if excessive (currently ".concat(R.length, ")\n"), 
h += "     - Limit construction sites (currently ".concat(l.metrics.constructionSites, ")\n"), 
h += "     - Review pathfinding (check for recalculation issues)\n") : v >= 80 ? (h += "  ℹ️  Room is nearing budget limit (".concat(v.toFixed(1), "%)\n"), 
h += "     - Monitor for increases in CPU usage\n") : h += "  ✅ Room is performing well within budget\n", 
l.metrics.hostileCount > 0 && (h += "  ⚠️  ".concat(l.metrics.hostileCount, " hostiles detected - defense active\n"), 
h += "     - War mode increases CPU budget to ".concat(d ? g.toFixed(3) : (.25 * y).toFixed(3), "\n")), 
h += "\n", (h += "Use cpuBreakdown('room') to see all rooms\n") + "Use cpuProfile() for detailed profiling";
}, n([ Yt({
name: "showStats",
description: "Show current bot statistics from memory segment",
usage: "showStats()",
examples: [ "showStats()" ],
category: "Statistics"
}) ], t.prototype, "showStats", null), n([ Yt({
name: "cacheStats",
description: "Show object cache statistics (hits, misses, hit rate, CPU savings)",
usage: "cacheStats()",
examples: [ "cacheStats()" ],
category: "Statistics"
}) ], t.prototype, "cacheStats", null), n([ Yt({
name: "resetCacheStats",
description: "Reset cache statistics counters (for benchmarking)",
usage: "resetCacheStats()",
examples: [ "resetCacheStats()" ],
category: "Statistics"
}) ], t.prototype, "resetCacheStats", null), n([ Yt({
name: "roomFindCacheStats",
description: "Show room.find() cache statistics (hits, misses, hit rate)",
usage: "roomFindCacheStats()",
examples: [ "roomFindCacheStats()" ],
category: "Statistics"
}) ], t.prototype, "roomFindCacheStats", null), n([ Yt({
name: "clearRoomFindCache",
description: "Clear all room.find() cache entries and reset stats",
usage: "clearRoomFindCache()",
examples: [ "clearRoomFindCache()" ],
category: "Statistics"
}) ], t.prototype, "clearRoomFindCache", null), n([ Yt({
name: "toggleProfiling",
description: "Toggle CPU profiling on/off",
usage: "toggleProfiling()",
examples: [ "toggleProfiling()" ],
category: "Statistics"
}) ], t.prototype, "toggleProfiling", null), n([ Yt({
name: "cpuBreakdown",
description: "Show detailed CPU breakdown by process, room, creep, and subsystem",
usage: "cpuBreakdown(type?)",
examples: [ "cpuBreakdown() // Show all breakdowns", "cpuBreakdown('process') // Show only process breakdown", "cpuBreakdown('room') // Show only room breakdown", "cpuBreakdown('creep') // Show only creep breakdown", "cpuBreakdown('subsystem') // Show only subsystem breakdown" ],
category: "Statistics"
}) ], t.prototype, "cpuBreakdown", null), n([ Yt({
name: "cpuBudget",
description: "Show CPU budget status and violations for all rooms",
usage: "cpuBudget()",
examples: [ "cpuBudget()" ],
category: "Statistics"
}) ], t.prototype, "cpuBudget", null), n([ Yt({
name: "cpuAnomalies",
description: "Detect and show CPU usage anomalies (spikes and sustained high usage)",
usage: "cpuAnomalies()",
examples: [ "cpuAnomalies()" ],
category: "Statistics"
}) ], t.prototype, "cpuAnomalies", null), n([ Yt({
name: "cpuProfile",
description: "Show comprehensive CPU profiling breakdown by room and subsystem",
usage: "cpuProfile(showAll?)",
examples: [ "cpuProfile()", "cpuProfile(true)" ],
category: "Statistics"
}) ], t.prototype, "cpuProfile", null), n([ Yt({
name: "diagnoseRoom",
description: "Comprehensive diagnostic for a specific room showing CPU usage, budget status, and potential issues",
usage: "diagnoseRoom(roomName)",
examples: [ "diagnoseRoom('W16S52')", "diagnoseRoom('E1S1')" ],
category: "Statistics"
}) ], t.prototype, "diagnoseRoom", null), t;
}(), As = function() {
function e() {}
return e.prototype.listCommands = function() {
return Wt.generateHelp();
}, e.prototype.commandHelp = function(e) {
return Wt.generateCommandHelp(e);
}, n([ Yt({
name: "listCommands",
description: "List all available commands (alias for help)",
usage: "listCommands()",
examples: [ "listCommands()" ],
category: "System"
}) ], e.prototype, "listCommands", null), n([ Yt({
name: "commandHelp",
description: "Get detailed help for a specific command",
usage: "commandHelp(commandName)",
examples: [ "commandHelp('setLogLevel')", "commandHelp('suspendProcess')" ],
category: "System"
}) ], e.prototype, "commandHelp", null), e;
}(), Ms = xe("SS2TerminalComms"), ks = function() {
function e() {}
return e.loadStateFromMemory = function() {
if (!this._stateInitialized) {
Memory.ss2TerminalComms || (Memory.ss2TerminalComms = {});
var e = Memory.ss2TerminalComms, t = new Map;
if (e.messageBuffers) for (var r in e.messageBuffers) {
var o = e.messageBuffers[r], n = new Map;
for (var a in o.packets) n.set(parseInt(a, 10), o.packets[a]);
t.set(r, {
msgId: o.msgId,
sender: o.sender,
finalPacket: o.finalPacket,
packets: n,
receivedAt: o.receivedAt
});
}
this._messageBuffers = t, this._nextMessageId = "number" == typeof e.nextMessageId ? e.nextMessageId : 0, 
this._stateInitialized = !0;
}
}, e.saveStateToMemory = function() {
var e;
this._stateInitialized || this.loadStateFromMemory(), Memory.ss2TerminalComms || (Memory.ss2TerminalComms = {});
var t = {};
this._messageBuffers && this._messageBuffers.forEach(function(e, r) {
var o = {};
e.packets.forEach(function(e, t) {
o[t] = e;
}), t[r] = {
msgId: e.msgId,
sender: e.sender,
finalPacket: e.finalPacket,
packets: o,
receivedAt: e.receivedAt
};
}), Memory.ss2TerminalComms.messageBuffers = t, Memory.ss2TerminalComms.nextMessageId = null !== (e = this._nextMessageId) && void 0 !== e ? e : 0;
}, Object.defineProperty(e, "messageBuffers", {
get: function() {
return this._stateInitialized || this.loadStateFromMemory(), this._messageBuffers || (this._messageBuffers = new Map), 
this._messageBuffers;
},
set: function(e) {
this._messageBuffers = e, this._stateInitialized = !0, this.saveStateToMemory();
},
enumerable: !1,
configurable: !0
}), Object.defineProperty(e, "nextMessageId", {
get: function() {
return this._stateInitialized || this.loadStateFromMemory(), null === this._nextMessageId && (this._nextMessageId = 0), 
this._nextMessageId;
},
set: function(e) {
this._nextMessageId = e, this._stateInitialized = !0, this.saveStateToMemory();
},
enumerable: !1,
configurable: !0
}), e.parseTransaction = function(e) {
var t = e.match(/^([\da-zA-Z]{1,3})\|([\d]{1,2})\|(.+)$/);
if (!t) return null;
var r, o = t[1], n = parseInt(t[2], 10), a = t[3];
if (0 === n) {
var i = a.match(/^(\d{1,2})\|(.+)$/);
i && (r = parseInt(i[1], 10), a = i[2]);
}
return {
msgId: o,
packetId: n,
finalPacket: r,
messageChunk: a
};
}, e.processIncomingTransactions = function() {
var e, t, r = [];
if (this.cleanupExpiredBuffers(), !Game.market.incomingTransactions) return r;
try {
for (var o = a(Game.market.incomingTransactions), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
if (!i.order && i.description && i.sender) {
var s = this.parseTransaction(i.description);
if (s) {
var c = "".concat(i.sender.username, ":").concat(s.msgId), l = this.messageBuffers.get(c);
if (!l) {
if (void 0 === s.finalPacket) continue;
l = {
msgId: s.msgId,
sender: i.sender.username,
finalPacket: s.finalPacket,
packets: new Map,
receivedAt: Game.time
}, this.messageBuffers.set(c, l), this.saveStateToMemory();
}
if (l.packets.set(s.packetId, s.messageChunk), this.saveStateToMemory(), l.packets.size === l.finalPacket + 1) {
for (var u = [], m = 0; m <= l.finalPacket; m++) {
var p = l.packets.get(m);
if (!p) {
Ms.warn("Missing packet in multi-packet message", {
meta: {
packetId: m,
messageId: s.msgId,
sender: i.sender.username
}
});
break;
}
u.push(p);
}
if (u.length === l.finalPacket + 1) {
var d = u.join("");
r.push({
sender: i.sender.username,
message: d
}), this.messageBuffers.delete(c), this.saveStateToMemory(), Ms.info("Received complete multi-packet message from ".concat(i.sender.username), {
meta: {
messageId: s.msgId,
packets: u.length,
totalSize: d.length,
sender: i.sender.username
}
});
}
}
}
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
return r.length > 0 && Ms.debug("Processed ".concat(Game.market.incomingTransactions.length, " terminal transactions, completed ").concat(r.length, " messages")), 
r;
}, e.splitMessage = function(e) {
if (e.length <= this.MAX_DESCRIPTION_LENGTH) return [ e ];
for (var t = this.generateMessageId(), r = [], o = this.chunkMessage(e, this.MESSAGE_CHUNK_SIZE), n = o.length - 1, a = 0; a < o.length; a++) {
var i;
i = 0 === a ? "".concat(t, "|").concat(a, "|").concat(n, "|").concat(o[a]) : "".concat(t, "|").concat(a, "|").concat(o[a]), 
r.push(i);
}
return r;
}, e.sendMessage = function(e, t, r, o, n) {
var a = this.splitMessage(n);
if (1 === a.length) return e.send(r, o, t, a[0]);
var i = this.extractMessageId(a[0]);
return i ? (this.queuePackets(e.id, t, r, o, a, i), Ms.info("Queued ".concat(a.length, " packets for multi-packet message"), {
meta: {
terminalId: e.id,
messageId: i,
packets: a.length,
targetRoom: t
}
}), OK) : (Ms.error("Failed to extract message ID from first packet"), ERR_INVALID_ARGS);
}, e.extractMessageId = function(e) {
var t = e.match(/^([\da-zA-Z]{1,3})\|/);
return t ? t[1] : null;
}, e.queuePackets = function(e, t, r, o, n, a) {
Memory.ss2PacketQueue || (Memory.ss2PacketQueue = {});
var i = "".concat(e, ":").concat(a);
Memory.ss2PacketQueue[i] = {
terminalId: e,
targetRoom: t,
resourceType: r,
amount: o,
packets: n,
nextPacketIndex: 0,
queuedAt: Game.time
};
}, e.processQueue = function() {
var e, t, r, o;
if (!Memory.ss2PacketQueue) return 0;
this.cleanupExpiredQueue();
var n = 0, s = [], c = Game.cpu.getUsed();
try {
for (var l = a(Object.entries(Memory.ss2PacketQueue)), u = l.next(); !u.done; u = l.next()) {
var m = i(u.value, 2), p = m[0], d = m[1];
if (Game.cpu.getUsed() - c > 5) {
Ms.debug("Queue processing stopped due to CPU budget limit (".concat(5, " CPU)"));
break;
}
var f = Game.getObjectById(d.terminalId);
if (f) {
if (!(f.cooldown > 0)) {
var y = d.packets[d.nextPacketIndex];
if (y) {
var g = f.send(d.resourceType, d.amount, d.targetRoom, y);
if (g === OK) {
if (Memory.ss2PacketQueue[p].nextPacketIndex = d.nextPacketIndex + 1, n++, Memory.ss2PacketQueue[p].nextPacketIndex >= d.packets.length) {
var h = this.extractMessageId(y);
Ms.info("Completed sending multi-packet message", {
meta: {
messageId: h,
packets: d.packets.length,
targetRoom: d.targetRoom
}
}), s.push(p);
}
} else g === ERR_NOT_ENOUGH_RESOURCES ? Ms.warn("Not enough resources to send packet, will retry next tick", {
meta: {
queueKey: p,
resource: d.resourceType,
amount: d.amount
}
}) : (Ms.error("Failed to send packet: ".concat(g, ", removing queue item"), {
meta: {
queueKey: p,
result: g
}
}), s.push(p));
} else Ms.warn("No packet at index ".concat(d.nextPacketIndex, ", removing queue item"), {
meta: {
queueKey: p
}
}), s.push(p);
}
} else Ms.warn("Terminal not found for queue item, removing from queue", {
meta: {
queueKey: p,
terminalId: d.terminalId
}
}), s.push(p);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = l.return) && t.call(l);
} finally {
if (e) throw e.error;
}
}
try {
for (var v = a(s), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
delete Memory.ss2PacketQueue[E];
}
} catch (e) {
r = {
error: e
};
} finally {
try {
R && !R.done && (o = v.return) && o.call(v);
} finally {
if (r) throw r.error;
}
}
return n > 0 && Ms.debug("Sent ".concat(n, " queued packets this tick")), n;
}, e.cleanupExpiredQueue = function() {
var e, t, r, o;
if (Memory.ss2PacketQueue) {
var n = Game.time, s = [];
try {
for (var c = a(Object.entries(Memory.ss2PacketQueue)), l = c.next(); !l.done; l = c.next()) {
var u = i(l.value, 2), m = u[0], p = u[1];
if (n - p.queuedAt > this.QUEUE_TIMEOUT) {
var d = this.extractMessageId(p.packets[0]);
Ms.warn("Queue item timed out after ".concat(n - p.queuedAt, " ticks"), {
meta: {
messageId: d,
queueKey: m,
sentPackets: p.nextPacketIndex,
totalPackets: p.packets.length
}
}), s.push(m);
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
try {
for (var f = a(s), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
delete Memory.ss2PacketQueue[g];
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
}
}, e.generateMessageId = function() {
var e = this.MESSAGE_ID_CHARS, t = "", r = this.nextMessageId++;
this.nextMessageId >= Math.pow(e.length, 3) && (this.nextMessageId = 0);
for (var o = 0; o < 3; o++) t = e[r % e.length] + t, r = Math.floor(r / e.length);
return t;
}, e.chunkMessage = function(e, t) {
for (var r = [], o = 0; o < e.length; o += t) r.push(e.substring(o, o + t));
return r;
}, e.cleanupExpiredBuffers = function() {
var e, t, r = Game.time;
try {
for (var o = a(this.messageBuffers.entries()), n = o.next(); !n.done; n = o.next()) {
var s = i(n.value, 2), c = s[0], l = s[1];
r - l.receivedAt > this.MESSAGE_TIMEOUT && (Ms.warn("Message timed out", {
meta: {
messageId: l.msgId,
sender: l.sender
}
}), this.messageBuffers.delete(c), this.saveStateToMemory());
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, e.parseJSON = function(e) {
try {
return e.startsWith("{") || e.startsWith("[") ? JSON.parse(e) : null;
} catch (e) {
return Ms.error("Error parsing JSON", {
meta: {
error: String(e)
}
}), null;
}
}, e.formatJSON = function(e) {
return JSON.stringify(e);
}, e.MAX_DESCRIPTION_LENGTH = 100, e.MESSAGE_CHUNK_SIZE = 91, e.MESSAGE_TIMEOUT = 1e3, 
e.QUEUE_TIMEOUT = 1e3, e.MESSAGE_ID_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 
e._messageBuffers = null, e._nextMessageId = null, e._stateInitialized = !1, e;
}(), Ns = Dt("NativeCallsTracker");

function Is(e, t, r) {
var o = e[t];
if (o && !o.__nativeCallsTrackerWrapped) {
var n = Object.getOwnPropertyDescriptor(e, t);
if (n && !1 === n.configurable) Ns.warn("Cannot wrap method - property is not configurable", {
meta: {
methodName: t
}
}); else try {
var a = function() {
for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
return tn.recordNativeCall(r), o.apply(this, e);
};
a.__nativeCallsTrackerWrapped = !0, Object.defineProperty(e, t, {
value: a,
writable: !0,
enumerable: !0,
configurable: !0
});
} catch (e) {
Ns.warn("Failed to wrap method", {
meta: {
methodName: t,
error: String(e)
}
});
}
}
}

!function(e) {
e[e.EMERGENCY = 1e3] = "EMERGENCY", e[e.HIGH = 500] = "HIGH", e[e.NORMAL = 100] = "NORMAL", 
e[e.LOW = 50] = "LOW";
}(_s || (_s = {}));

var Ps = new (function() {
function e() {}
return e.prototype.getEmpire = function() {
return Memory.empire || (Memory.empire = {
clusters: {}
}), Memory.empire;
}, e.prototype.getClusters = function() {
return this.getEmpire().clusters;
}, e.prototype.getCluster = function(e, t) {
var r = this.getClusters();
if (!r[e]) {
if (!t) throw new Error("Cluster ".concat(e, " not found and no coreRoom provided"));
r[e] = function(e, t) {
return {
id: e,
coreRoom: t,
memberRooms: [ t ],
remoteRooms: [],
forwardBases: [],
role: "economic",
metrics: {
energyIncome: 0,
energyConsumption: 0,
energyBalance: 0,
warIndex: 0,
economyIndex: 100
},
squads: [],
rallyPoints: [],
defenseRequests: [],
resourceRequests: [],
lastUpdate: Game.time
};
}(e, t);
}
return r[e];
}, e.prototype.getSwarmState = function(e) {
if (Game.rooms[e]) return Memory.rooms[e] || (Memory.rooms[e] = {}), Memory.rooms[e].swarm;
}, e;
}());

function Gs(e, t) {
if (!t || t.danger < 1) return !1;
var r = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER;
}
});
return t.danger >= 2 && 0 === r.length;
}

function Ls(e, t) {
if (!Gs(e, t)) return null;
var r = (null == t ? void 0 : t.danger) || 0;
return {
roomName: e.name,
guardsNeeded: r >= 2 ? 2 : 1,
rangersNeeded: r >= 3 ? 2 : 1,
healersNeeded: r >= 3 ? 1 : 0,
urgency: r,
createdAt: Game.time,
threat: "Danger level ".concat(r)
};
}

var Ds, Fs, Bs, Hs = {
minBucket: 0,
criticalEnergyThreshold: 300,
mediumEnergyThreshold: 1e3,
lowEnergyThreshold: 3e3,
surplusEnergyThreshold: 1e4,
minTransferAmount: 500,
maxRequestsPerRoom: 3,
requestTimeout: 500,
focusRoomMediumThreshold: 5e3,
focusRoomLowThreshold: 15e3
}, Ws = function() {
function e(e) {
void 0 === e && (e = {}), this.config = o(o({}, Hs), e);
}
return e.prototype.processCluster = function(e) {
if (!(Game.cpu.bucket < this.config.minBucket)) {
this.cleanupRequests(e);
var t = this.getRoomStatuses(e).filter(function(e) {
return !e.hasTerminal;
});
t.length < 2 || this.createTransferRequests(e, t);
}
}, e.prototype.cleanupRequests = function(e) {
var t = this;
e.resourceRequests = e.resourceRequests.filter(function(r) {
var o;
if (Game.time - r.createdAt > t.config.requestTimeout) return Me.debug("Resource request from ".concat(r.fromRoom, " to ").concat(r.toRoom, " expired"), {
subsystem: "ResourceSharing"
}), !1;
if (r.delivered >= r.amount) return Me.info("Resource transfer completed: ".concat(r.delivered, " ").concat(r.resourceType, " from ").concat(r.fromRoom, " to ").concat(r.toRoom), {
subsystem: "ResourceSharing"
}), !1;
if (!e.memberRooms.includes(r.toRoom) || !e.memberRooms.includes(r.fromRoom)) return !1;
if (Game.rooms[r.toRoom]) {
var n = Ps.getSwarmState(r.toRoom);
if (n && 0 === ((null === (o = n.metrics) || void 0 === o ? void 0 : o.energyNeed) || 0)) return Me.debug("Resource request from ".concat(r.fromRoom, " to ").concat(r.toRoom, " no longer needed"), {
subsystem: "ResourceSharing"
}), !1;
}
return !0;
});
}, e.prototype.getRoomStatuses = function(e) {
var t, r, o, n = [];
try {
for (var i = a(e.memberRooms), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.rooms[c];
if (l && (null === (o = l.controller) || void 0 === o ? void 0 : o.my)) {
var u = Ps.getSwarmState(c);
if (u) {
var m = e.focusRoom === c, p = this.calculateRoomEnergy(l), d = p.energyAvailable, f = p.energyCapacity, y = this.calculateEnergyNeed(l, d, u, m), g = 0;
m ? g = 0 : d > this.config.surplusEnergyThreshold && (g = d - this.config.mediumEnergyThreshold);
var h = 0;
3 === y ? h = this.config.criticalEnergyThreshold - d : 2 === y ? h = this.config.mediumEnergyThreshold - d : 1 === y && (h = this.config.lowEnergyThreshold - d), 
h = m && y > 0 ? Math.max(h, 2 * this.config.minTransferAmount) : Math.max(h, this.config.minTransferAmount), 
n.push({
roomName: c,
hasTerminal: void 0 !== l.terminal && l.terminal.my,
energyAvailable: d,
energyCapacity: f,
energyNeed: y,
canProvide: g,
needsAmount: h
}), u.metrics && (u.metrics.energyAvailable = d, u.metrics.energyCapacity = f, u.metrics.energyNeed = y);
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
return n;
}, e.prototype.calculateRoomEnergy = function(e) {
var t, r, o = 0, n = 0;
e.storage && (o += e.storage.store.getUsedCapacity(RESOURCE_ENERGY), n += e.storage.store.getCapacity());
var i = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}
});
try {
for (var s = a(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
o += l.store.getUsedCapacity(RESOURCE_ENERGY), n += l.store.getCapacity();
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
return {
energyAvailable: o,
energyCapacity: n
};
}, e.prototype.calculateEnergyNeed = function(e, t, r, o) {
return void 0 === o && (o = !1), t < this.config.criticalEnergyThreshold ? (e.find(FIND_MY_SPAWNS).length > 0 && e.energyAvailable, 
3) : o ? t < this.config.focusRoomMediumThreshold ? 2 : t < this.config.focusRoomLowThreshold ? 1 : 0 : t < this.config.mediumEnergyThreshold ? 2 : t < this.config.lowEnergyThreshold ? 1 : 0;
}, e.prototype.createTransferRequests = function(e, t) {
var r, o, n = t.filter(function(e) {
return e.energyNeed > 0;
}).sort(function(e, t) {
return t.energyNeed - e.energyNeed;
}), i = t.filter(function(e) {
return e.canProvide > 0;
}).sort(function(e, t) {
return t.canProvide - e.canProvide;
});
if (0 !== n.length && 0 !== i.length) {
var s = function(t) {
var r, o;
if (e.resourceRequests.filter(function(e) {
return e.toRoom === t.roomName;
}).length >= c.config.maxRequestsPerRoom) return "continue";
var n = null, s = 1 / 0, l = function(r) {
if (r.roomName === t.roomName) return "continue";
if (e.resourceRequests.some(function(e) {
return e.fromRoom === r.roomName && e.toRoom === t.roomName;
})) return "continue";
var o = Game.map.getRoomLinearDistance(r.roomName, t.roomName);
o < s && r.canProvide >= c.config.minTransferAmount && (s = o, n = r);
};
try {
for (var u = (r = void 0, a(i)), m = u.next(); !m.done; m = u.next()) l(m.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
if (n && s <= 3) {
var p = Math.min(t.needsAmount, n.canProvide), d = {
toRoom: t.roomName,
fromRoom: n.roomName,
resourceType: RESOURCE_ENERGY,
amount: p,
priority: t.energyNeed,
createdAt: Game.time,
assignedCreeps: [],
delivered: 0
};
e.resourceRequests.push(d), Me.info("Created resource transfer: ".concat(p, " energy from ").concat(n.roomName, " to ").concat(t.roomName, " (priority ").concat(d.priority, ", distance ").concat(s, ")"), {
subsystem: "ResourceSharing"
}), n.canProvide -= p;
}
}, c = this;
try {
for (var l = a(n), u = l.next(); !u.done; u = l.next()) s(u.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
}
}, e.prototype.getRequestsForRoom = function(e, t) {
return e.resourceRequests.filter(function(e) {
return e.toRoom === t || e.fromRoom === t;
});
}, e.prototype.updateRequestProgress = function(e, t, r) {
if (t >= 0 && t < e.resourceRequests.length) {
var o = e.resourceRequests[t];
o.delivered += r, Me.debug("Updated transfer progress: ".concat(o.delivered, "/").concat(o.amount, " from ").concat(o.fromRoom, " to ").concat(o.toRoom), {
subsystem: "ResourceSharing"
});
}
}, e;
}(), Ys = new Ws, Ks = {
1: {
guards: 1,
rangers: 1,
healers: 0,
siegeUnits: 0
},
2: {
guards: 2,
rangers: 2,
healers: 1,
siegeUnits: 0
},
3: {
guards: 3,
rangers: 3,
healers: 2,
siegeUnits: 1
}
};

function Vs(e, t) {
var r, o, n = e.coreRoom, i = 1 / 0;
try {
for (var s = a(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.map.getRoomLinearDistance(l, t);
u < i && (i = u, n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
c && !c.done && (o = s.return) && o.call(s);
} finally {
if (r) throw r.error;
}
}
return n;
}

function qs(e, t) {
var r = function(e) {
var t, r = Math.min(3, Math.max(1, e.urgency)), o = null !== (t = Ks[r]) && void 0 !== t ? t : Ks[2];
return {
guards: Math.max(o.guards, e.guardsNeeded),
rangers: Math.max(o.rangers, e.rangersNeeded),
healers: Math.max(o.healers, e.healersNeeded),
siegeUnits: o.siegeUnits
};
}(t), o = "defense_".concat(t.roomName, "_").concat(Game.time), n = Vs(e, t.roomName), a = {
id: o,
type: "defense",
members: [],
rallyRoom: n,
targetRooms: [ t.roomName ],
state: "gathering",
createdAt: Game.time
};
return Me.info("Created defense squad ".concat(o, " for ").concat(t.roomName, ": ") + "".concat(r.guards, "G/").concat(r.rangers, "R/").concat(r.healers, "H rally at ").concat(n), {
subsystem: "Squad"
}), a;
}

function js(e) {
var t = Game.time - e.createdAt;
if ("gathering" === e.state && t > 300) return Me.warn("Squad ".concat(e.id, " timed out during formation (").concat(t, " ticks)"), {
subsystem: "Squad"
}), !0;
if (0 === e.members.length && t > 50) return Me.info("Squad ".concat(e.id, " has no members, dissolving"), {
subsystem: "Squad"
}), !0;
if ("attacking" === e.state) {
var r = e.targetRooms[0];
if (r) {
var o = Game.rooms[r];
if (o && 0 === o.find(FIND_HOSTILE_CREEPS).length && t > 100) return Me.info("Squad ".concat(e.id, " mission complete, no more hostiles"), {
subsystem: "Squad"
}), !0;
}
}
return !1;
}

function zs(e) {
var t = e.members.length;
e.members = e.members.filter(function(e) {
return Game.creeps[e];
}), e.members.length < t && Me.debug("Squad ".concat(e.id, " lost ").concat(t - e.members.length, " members"), {
subsystem: "Squad"
});
var r = e.members.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return !!e;
});
if (0 !== r.length) {
var o = e.targetRooms[0];
if (o) switch (e.state) {
case "gathering":
r.every(function(t) {
return t.room.name === e.rallyRoom;
}) && (e.state = "moving", Me.info("Squad ".concat(e.id, " gathered, moving to ").concat(o), {
subsystem: "Squad"
}));
break;

case "moving":
r.some(function(e) {
return e.room.name === o;
}) && (e.state = "attacking", Me.info("Squad ".concat(e.id, " reached ").concat(o, ", engaging"), {
subsystem: "Squad"
}));
break;

case "attacking":
Game.time - e.createdAt > 50 && r.length < 3 && (e.state = "retreating", Me.warn("Squad ".concat(e.id, " retreating - heavy casualties"), {
subsystem: "Squad"
}));
break;

case "retreating":
r.every(function(t) {
return t.room.name === e.rallyRoom;
}) && (e.state = "dissolving", Me.info("Squad ".concat(e.id, " retreated to ").concat(e.rallyRoom, ", dissolving"), {
subsystem: "Squad"
}));
}
}
}

(Ds = {})[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 300, Ds[RESOURCE_CATALYZED_UTRIUM_ACID] = 300, 
Ds[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 300, (Fs = {})[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 600, 
Fs[RESOURCE_CATALYZED_UTRIUM_ACID] = 600, Fs[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 300, 
Fs[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 600, (Bs = {})[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 900, 
Bs[RESOURCE_CATALYZED_UTRIUM_ACID] = 600, Bs[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = 900, 
Bs[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 600, Bs[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 900;

var Xs = {
0: 0,
1: 5e3,
2: 15e3,
3: 5e4
};

function Qs(e, t) {
var r = Xs[t], o = Ps.getClusters();
for (var n in o) o[n].defenseRequests.some(function(t) {
return t.roomName === e && t.urgency >= 2;
}) && (r += 1e4);
return r;
}

function Zs(e, t, r) {
var o, n, i, s = 0;
try {
for (var c = a(e.memberRooms), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u !== t) {
var m = Game.rooms[u];
if (m && m.storage) {
var p = Ps.getSwarmState(u);
if (p) {
var d = m.storage.store.getUsedCapacity(RESOURCE_ENERGY) - Qs(u, p.danger);
d > r && d > s && (s = d, i = u);
}
}
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
l && !l.done && (n = c.return) && n.call(c);
} finally {
if (o) throw o.error;
}
}
if (!i) return Me.warn("No available energy source for emergency routing to ".concat(t, " (need ").concat(r, ")"), {
subsystem: "MilitaryPool"
}), {
success: !1
};
var f = Game.rooms[i], y = Game.rooms[t];
return (null == f ? void 0 : f.terminal) && (null == y ? void 0 : y.terminal) ? f.terminal.send(RESOURCE_ENERGY, r, t) === OK ? (Me.info("Emergency energy routed: ".concat(r, " from ").concat(i, " to ").concat(t), {
subsystem: "MilitaryPool"
}), {
success: !0,
sourceRoom: i
}) : {
success: !1
} : (Me.info("Creating hauler transfer request: ".concat(r, " energy from ").concat(i, " to ").concat(t), {
subsystem: "MilitaryPool"
}), e.resourceRequests.push({
toRoom: t,
fromRoom: i,
resourceType: RESOURCE_ENERGY,
amount: r,
priority: 5,
createdAt: Game.time,
assignedCreeps: [],
delivered: 0
}), {
success: !0,
sourceRoom: i
});
}

var Js = {
harassment: {
composition: {
harassers: 3,
soldiers: 0,
rangers: 1,
healers: 0,
siegeUnits: 0
},
targetPriority: {
workers: 100,
military: 50,
spawns: 20,
towers: 10,
extensions: 15,
storage: 10,
defenses: 5,
labs: 5
},
minEnergy: 5e4,
useBoosts: !1,
retreatThreshold: .5,
creepSize: "small",
engagement: {
engageTowers: !1,
maxTowers: 0,
prioritizeDefenses: !1
}
},
raid: {
composition: {
harassers: 1,
soldiers: 2,
rangers: 3,
healers: 2,
siegeUnits: 0
},
targetPriority: {
military: 100,
towers: 80,
spawns: 90,
workers: 60,
extensions: 50,
storage: 40,
labs: 30,
defenses: 20
},
minEnergy: 1e5,
useBoosts: !1,
retreatThreshold: .4,
creepSize: "medium",
engagement: {
engageTowers: !0,
maxTowers: 2,
prioritizeDefenses: !1
}
},
siege: {
composition: {
harassers: 0,
soldiers: 2,
rangers: 4,
healers: 3,
siegeUnits: 2
},
targetPriority: {
towers: 100,
spawns: 100,
military: 90,
defenses: 80,
storage: 70,
labs: 60,
extensions: 50,
workers: 40
},
minEnergy: 2e5,
useBoosts: !0,
retreatThreshold: .3,
creepSize: "large",
engagement: {
engageTowers: !0,
maxTowers: 6,
prioritizeDefenses: !0
}
}
};

function $s(e, t) {
var r, o, n, a;
if (!t) return Me.debug("No intel for ".concat(e, ", defaulting to harassment"), {
subsystem: "Doctrine"
}), "harassment";
var i = null !== (r = t.towerCount) && void 0 !== r ? r : 0, s = null !== (o = t.spawnCount) && void 0 !== o ? o : 0, c = null !== (n = t.rcl) && void 0 !== n ? n : 0, l = 3 * i + 2 * s + 1.5 * (null !== (a = t.militaryPresence) && void 0 !== a ? a : 0) + .5 * c;
return l >= 20 || c >= 7 ? (Me.info("Selected SIEGE doctrine for ".concat(e, " (threat: ").concat(l, ")"), {
subsystem: "Doctrine"
}), "siege") : l >= 10 || c >= 5 ? (Me.info("Selected RAID doctrine for ".concat(e, " (threat: ").concat(l, ")"), {
subsystem: "Doctrine"
}), "raid") : (Me.info("Selected HARASSMENT doctrine for ".concat(e, " (threat: ").concat(l, ")"), {
subsystem: "Doctrine"
}), "harassment");
}

function ec(e, t) {
var r, o, n, i = Js[t], s = 0;
try {
for (var c = a(e.memberRooms), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = Game.rooms[u];
if (m && (null === (n = m.controller) || void 0 === n ? void 0 : n.my)) {
var p = m.storage, d = m.terminal;
p && (s += p.store.energy), d && (s += d.store.energy);
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
var f = s >= i.minEnergy;
return f || Me.debug("Cannot launch ".concat(t, ": insufficient energy (").concat(s, "/").concat(i.minEnergy, ")"), {
subsystem: "Doctrine"
}), f;
}

var tc = {
rclWeight: 10,
resourceWeight: 5,
strategicWeight: 3,
distancePenalty: 2,
weakDefenseBonus: 20,
strongDefensePenalty: 15,
warTargetBonus: 50
};

function rc(e, t, r, o) {
var n, a, i = 0;
i += e.controllerLevel * o.rclWeight, e.controllerLevel >= 6 ? i += 5 * o.resourceWeight : e.controllerLevel >= 4 && (i += 2 * o.resourceWeight), 
i += e.sources * o.strategicWeight, i -= t * o.distancePenalty;
var s = null !== (n = e.towerCount) && void 0 !== n ? n : 0, c = null !== (a = e.spawnCount) && void 0 !== a ? a : 0;
return 0 === s && c <= 1 ? i += o.weakDefenseBonus : (s >= 4 || s >= 2 && c >= 2) && (i -= o.strongDefensePenalty), 
r && (i += o.warTargetBonus), e.threatLevel >= 2 && !r && (i -= 10 * e.threatLevel), 
Math.max(0, i);
}

function oc(e, t) {
var r, o, n = 1 / 0;
try {
for (var i = a(e.memberRooms), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(c, t);
l < n && (n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
return n;
}

var nc = new (function() {
function e() {}
return e.prototype.addRequest = function(e) {}, e.prototype.getPendingRequests = function(e) {
return [];
}, e.prototype.hasEmergency = function(e) {
return !1;
}, e;
}()), ac = {
move: 50,
work: 100,
carry: 50,
attack: 80,
ranged_attack: 150,
heal: 250,
claim: 600,
tough: 10
}, ic = new Map;

function sc(e, t, r) {
var o = Math.min(r, 3e3);
switch (e) {
case "harasser":
return cc([ MOVE, ATTACK ], o, [ MOVE, ATTACK ]);

case "soldier":
return cc([ TOUGH, MOVE, ATTACK, MOVE, ATTACK ], o, [ TOUGH, MOVE, ATTACK ]);

case "ranger":
return cc([ TOUGH, MOVE, RANGED_ATTACK ], o, [ MOVE, RANGED_ATTACK ]);

case "healer":
return cc([ TOUGH, MOVE, HEAL ], o, [ MOVE, HEAL ]);

case "siegeUnit":
return cc([ TOUGH, MOVE, WORK ], o, [ TOUGH, MOVE, WORK ]);

default:
return [ MOVE, ATTACK ];
}
}

function cc(e, t, r) {
for (var o = s([], i(e), !1), n = e.reduce(function(e, t) {
return e + ac[t];
}, 0), a = r.reduce(function(e, t) {
return e + ac[t];
}, 0); n + a <= t && o.length < 50; ) o.push.apply(o, s([], i(r), !1)), n += a;
return o.slice(0, 50);
}

function lc(e) {
switch (e) {
case "soldier":
return [ {
compound: RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
parts: [ ATTACK ]
} ];

case "ranger":
return [ {
compound: RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
parts: [ RANGED_ATTACK ]
} ];

case "healer":
return [ {
compound: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
parts: [ HEAL ]
} ];

case "siegeUnit":
return [ {
compound: RESOURCE_CATALYZED_ZYNTHIUM_ACID,
parts: [ WORK ]
} ];

default:
return [];
}
}

var uc = new Map;

function mc(e) {
e.lastUpdate = Game.time;
var t = Ps.getCluster(e.clusterId);
if (!t) return e.state = "failed", void Me.error("Cluster ".concat(e.clusterId, " not found for operation ").concat(e.id), {
subsystem: "Offensive"
});
switch (e.state) {
case "forming":
!function(e) {
e.squadIds.every(function(e) {
return !function(e) {
return ic.has(e);
}(e);
}) && (e.state = "executing", Me.info("Operation ".concat(e.id, " entering execution phase"), {
subsystem: "Offensive"
})), Game.time - e.createdAt > 1e3 && (e.state = "failed", Me.warn("Operation ".concat(e.id, " formation timed out"), {
subsystem: "Offensive"
}));
}(e);
break;

case "executing":
!function(e, t) {
var r, o, n = function(r) {
var o = t.squads.find(function(e) {
return e.id === r;
});
if (!o) return "continue";
if (zs(o), js(o)) {
Me.info("Squad ".concat(r, " dissolving, operation ").concat(e.id, " may complete"), {
subsystem: "Offensive"
});
var n = t.squads.findIndex(function(e) {
return e.id === r;
});
n >= 0 && t.squads.splice(n, 1);
}
};
try {
for (var i = a(e.squadIds), s = i.next(); !s.done; s = i.next()) n(s.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
0 === e.squadIds.filter(function(e) {
return t.squads.some(function(t) {
return t.id === e;
});
}).length && (e.state = "complete", Me.info("Operation ".concat(e.id, " complete"), {
subsystem: "Offensive"
}));
}(e, t);
}
}

function pc(e, t, r) {
var o, n, a, c = 0, l = 0, u = e.getTerrain().get(t.x, t.y);
if (u === TERRAIN_MASK_WALL) return {
position: t,
score: 0,
terrain: 0,
safety: 0,
centrality: 0,
exitAccess: 0
};
if (c += o = 0 === u ? 10 : 5, e.lookForAt(LOOK_STRUCTURES, t).some(function(e) {
return e.structureType !== STRUCTURE_ROAD && e.structureType !== STRUCTURE_RAMPART;
})) return {
position: t,
score: 0,
terrain: 0,
safety: 0,
centrality: 0,
exitAccess: 0
};
var m = e.find(FIND_HOSTILE_CREEPS);
if (m.length > 0) {
var p = Math.min.apply(Math, s([], i(m.map(function(e) {
return t.getRangeTo(e);
})), !1));
l = Math.min(10, p);
} else l = 10;
c += 2 * l;
var d = Math.sqrt(Math.pow(t.x - 25, 2) + Math.pow(t.y - 25, 2));
c += n = "defense" === r || "retreat" === r ? Math.max(0, 10 - d / 2) : Math.max(0, 5 - Math.abs(d - 15) / 2);
var f = Math.min(t.x, t.y, 49 - t.x, 49 - t.y);
return a = "offense" === r || "staging" === r ? Math.max(0, 10 - f / 2) : Math.min(10, f / 2.5), 
{
position: t,
score: c += a,
terrain: o,
safety: l,
centrality: n,
exitAccess: a
};
}

var dc, fc = {
updateInterval: 10,
minBucket: 0,
resourceBalanceThreshold: 1e4,
minTerminalEnergy: 5e4
}, yc = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = new Map, this.config = o(o({}, fc), e);
}
return t.prototype.run = function() {
var e = Ps.getClusters();
for (var t in e) {
var r = e[t];
if (this.shouldRunCluster(t)) try {
this.runCluster(r), this.lastRun.set(t, Game.time);
} catch (e) {
var o = e instanceof Error ? e.message : String(e);
Me.error("Cluster ".concat(t, " error: ").concat(o), {
subsystem: "Cluster"
});
}
}
}, t.prototype.shouldRunCluster = function(e) {
var t, r = null !== (t = this.lastRun.get(e)) && void 0 !== t ? t : 0;
return Game.time - r >= this.config.updateInterval;
}, t.prototype.runCluster = function(t) {
var r = this, o = Game.cpu.getUsed();
tn.measureSubsystem("cluster:".concat(t.id, ":metrics"), function() {
r.updateClusterMetrics(t);
}), tn.measureSubsystem("cluster:".concat(t.id, ":defense"), function() {
var o;
r.processDefenseRequests(t), (o = function(t) {
return e.memoryManager.getOrInitSwarmState(t).clusterId;
}(t.id)) && Ba.coordinateDefense(o);
}), tn.measureSubsystem("cluster:".concat(t.id, ":terminals"), function() {
r.balanceTerminalResources(t);
}), tn.measureSubsystem("cluster:".concat(t.id, ":resourceSharing"), function() {
Ys.processCluster(t);
}), tn.measureSubsystem("cluster:".concat(t.id, ":squads"), function() {
r.updateSquads(t);
}), tn.measureSubsystem("cluster:".concat(t.id, ":offensive"), function() {
r.updateOffensiveOperations(t);
}), tn.measureSubsystem("cluster:".concat(t.id, ":rallyPoints"), function() {
!function(e) {
var t, r;
e.rallyPoints = e.rallyPoints.filter(function(t) {
return !!(t.lastUsed && Game.time - t.lastUsed < 1e3) || !!e.squads.some(function(e) {
return e.rallyRoom === t.roomName && "dissolving" !== e.state;
}) || "defense" === t.purpose;
});
var o = function(t) {
var r = Game.rooms[t];
if (!r) return "continue";
if (!e.rallyPoints.find(function(e) {
return e.roomName === t && "defense" === e.purpose;
})) {
var o = function(e) {
return e ? function(e) {
var t = e.find(FIND_MY_SPAWNS), r = e.storage;
if (0 === t.length) return null;
for (var o = r ? r.pos : t[0].pos, n = [], a = -5; a <= 5; a++) for (var i = -5; i <= 5; i++) {
var s = o.x + a, c = o.y + i;
if (!(s < 2 || s > 47 || c < 2 || c > 47)) {
var l = pc(e, new RoomPosition(s, c, e.name), "defense");
l.score > 0 && n.push(l);
}
}
if (n.sort(function(e, t) {
return t.score - e.score;
}), 0 === n.length) return {
roomName: e.name,
x: 25,
y: 25,
purpose: "defense",
createdAt: Game.time
};
var u = n[0];
return {
roomName: e.name,
x: u.position.x,
y: u.position.y,
purpose: "defense",
createdAt: Game.time
};
}(e) : null;
}(r);
o && (e.rallyPoints.push(o), Me.debug("Created defense rally point for ".concat(t, " at ").concat(o.x, ",").concat(o.y), {
subsystem: "RallyPoint"
}));
}
};
try {
for (var n = a(e.memberRooms), i = n.next(); !i.done; i = n.next()) o(i.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}(t);
}), tn.measureSubsystem("cluster:".concat(t.id, ":militaryResources"), function() {
!function(e) {
var t, r;
try {
for (var o = a(e.memberRooms), n = o.next(); !n.done; n = o.next()) {
var i = n.value, s = Ps.getSwarmState(i);
if (s) {
var c = Qs(i, s.danger);
c > 0 && Game.time % 100 == 0 && Me.debug("Military energy reservation for ".concat(i, ": ").concat(c, " (danger ").concat(s.danger, ")"), {
subsystem: "MilitaryPool"
});
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
n && !n.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
}(t);
}), tn.measureSubsystem("cluster:".concat(t.id, ":role"), function() {
r.updateClusterRole(t);
}), tn.measureSubsystem("cluster:".concat(t.id, ":focusRoom"), function() {
r.updateFocusRoom(t);
}), t.lastUpdate = Game.time;
var n = Game.cpu.getUsed() - o;
n > 1 && Game.time % 50 == 0 && Me.debug("Cluster ".concat(t.id, " tick: ").concat(n.toFixed(2), " CPU"), {
subsystem: "Cluster"
});
}, t.prototype.updateClusterMetrics = function(e) {
var t, r, o = 0, n = 0, i = 0, s = 0, c = 0;
try {
for (var l = a(e.memberRooms), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = Ps.getSwarmState(m);
if (p && p.metrics) {
o += p.metrics.energyHarvested || 0, n += (p.metrics.energySpawning || 0) + (p.metrics.energyConstruction || 0) + (p.metrics.energyRepair || 0), 
i += 25 * p.danger;
var d = Game.rooms[m];
(null == d ? void 0 : d.storage) ? s += d.storage.store.getUsedCapacity(RESOURCE_ENERGY) / d.storage.store.getCapacity() * 100 : s += (p.metrics.energyHarvested || 0) > 0 ? 50 : 0, 
c++;
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
c > 0 && (e.metrics.energyIncome = o / c, e.metrics.energyConsumption = n / c, e.metrics.energyBalance = e.metrics.energyIncome - e.metrics.energyConsumption, 
e.metrics.warIndex = Math.min(100, i / c), e.metrics.economyIndex = Math.min(100, s / c)), 
e.metrics.militaryReadiness = this.calculateMilitaryReadiness(e);
}, t.prototype.calculateMilitaryReadiness = function(e) {
var t, r, o, n = 0, i = 0;
try {
for (var s = a(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
if (u && (null === (o = u.controller) || void 0 === o ? void 0 : o.my)) {
n += u.find(FIND_MY_CREEPS, {
filter: function(e) {
return "military" === e.memory.family;
}
}).length;
var m = u.controller.level;
i += Math.max(2, Math.floor(m / 2));
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
return 0 === i ? 0 : Math.min(100, Math.round(n / i * 100));
}, t.prototype.balanceTerminalResources = function(e) {
var t, r, o, n, i = [];
try {
for (var s = a(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
(null == u ? void 0 : u.terminal) && u.terminal.my && i.push({
room: u,
terminal: u.terminal
});
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
if (!(i.length < 2) && (this.balanceResource(i, RESOURCE_ENERGY), Game.time % 50 == 0)) {
var m = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
try {
for (var p = a(m), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
this.balanceResource(i, f);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
d && !d.done && (n = p.return) && n.call(p);
} finally {
if (o) throw o.error;
}
}
}
}, t.prototype.balanceResource = function(e, t) {
var r, o, n, i, s, c, l = this, u = 0;
try {
for (var m = a(e), p = m.next(); !p.done; p = m.next()) u += p.value.terminal.store.getUsedCapacity(t);
} catch (e) {
r = {
error: e
};
} finally {
try {
p && !p.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
var d = u / e.length, f = e.filter(function(e) {
return e.terminal.store.getUsedCapacity(t) > d + l.config.resourceBalanceThreshold;
}), y = e.filter(function(e) {
return e.terminal.store.getUsedCapacity(t) < d - l.config.resourceBalanceThreshold;
});
if (0 !== f.length && 0 !== y.length) try {
for (var g = a(f), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
if (!(v.terminal.cooldown > 0 || t === RESOURCE_ENERGY && v.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.minTerminalEnergy + this.config.resourceBalanceThreshold)) try {
for (var R = (s = void 0, a(y)), E = R.next(); !E.done; E = R.next()) {
var T = E.value, C = Math.min(v.terminal.store.getUsedCapacity(t) - d, d - T.terminal.store.getUsedCapacity(t), 1e4);
if (C > 1e3 && v.terminal.send(t, C, T.room.name) === OK) {
Me.debug("Transferred ".concat(C, " ").concat(t, " from ").concat(v.room.name, " to ").concat(T.room.name), {
subsystem: "Cluster"
});
break;
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
E && !E.done && (c = R.return) && c.call(R);
} finally {
if (s) throw s.error;
}
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (n) throw n.error;
}
}
}, t.prototype.updateSquads = function(e) {
var t, r;
try {
for (var o = a(e.squads), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
zs(i), js(i) && (i.state = "dissolving");
}
} catch (e) {
t = {
error: e
};
} finally {
try {
n && !n.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
e.squads = e.squads.filter(function(e) {
return "dissolving" !== e.state;
}), this.autoCreateDefenseSquads(e);
}, t.prototype.autoCreateDefenseSquads = function(e) {
var t, r, o = e.defenseRequests.filter(function(t) {
var r = e.squads.some(function(e) {
return "defense" === e.type && e.targetRooms.includes(t.roomName);
});
return !r && t.urgency >= 2;
});
try {
for (var n = a(o), i = n.next(); !i.done; i = n.next()) {
var s = i.value, c = qs(e, s);
e.squads.push(c);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}, t.prototype.updateOffensiveOperations = function(e) {
Game.time % 100 == 0 && function(e) {
if ("war" === e.role || "mixed" === e.role) {
var t = Array.from(uc.values()).filter(function(t) {
return t.clusterId === e.id && "complete" !== t.state && "failed" !== t.state;
});
if (t.length >= 2) Me.debug("Cluster ".concat(e.id, " at max operations (").concat(t.length, ")"), {
subsystem: "Offensive"
}); else {
var r = function(e, t, r, n) {
var a, i;
void 0 === n && (n = {});
var s = o(o({}, tc), n), c = [], l = Ps.getEmpire(), u = l.knownRooms || {}, m = new Set(l.warTargets || []);
for (var p in u) {
var d = u[p];
if (d.scouted && "self" !== d.owner && !d.isHighway && !d.isSK) {
var f = oc(e, p);
if (!(f > 10)) {
var y = null !== (i = null === (a = Memory.lastAttacked) || void 0 === a ? void 0 : a[p]) && void 0 !== i ? i : 0;
if (!(Game.time - y < 5e3)) {
var g = rc(d, f, m.has(p), s), h = "neutral";
d.owner && (h = m.has(d.owner) || m.has(p) ? "enemy" : "hostile");
var v = $s(p, {
towerCount: d.towerCount,
spawnCount: d.spawnCount,
rcl: d.controllerLevel,
owner: d.owner
});
c.push({
roomName: p,
score: g,
distance: f,
doctrine: v,
type: h,
intel: d
});
}
}
}
}
c.sort(function(e, t) {
return t.score - e.score;
});
var R = c.slice(0, 3);
return R.length > 0 && Me.info("Found ".concat(R.length, " attack targets for cluster ").concat(e.id, ": ") + R.map(function(e) {
return "".concat(e.roomName, "(").concat(e.score.toFixed(0), ")");
}).join(", "), {
subsystem: "AttackTarget"
}), R;
}(e);
if (0 !== r.length) {
var n = r[0];
ec(e, n.doctrine) ? function(e, t, r) {
if (!function(e) {
var t = (Ps.getEmpire().knownRooms || {})[e];
return t ? !(Game.time - t.lastSeen > 5e3 && (Me.warn("Intel for ".concat(e, " is stale (").concat(Game.time - t.lastSeen, " ticks old)"), {
subsystem: "AttackTarget"
}), 1)) : (Me.warn("No intel for target ".concat(e), {
subsystem: "AttackTarget"
}), !1);
}(t)) return Me.warn("Invalid target ".concat(t), {
subsystem: "Offensive"
}), null;
var o = (Ps.getEmpire().knownRooms || {})[t], n = null != r ? r : $s(t, {
towerCount: null == o ? void 0 : o.towerCount,
spawnCount: null == o ? void 0 : o.spawnCount,
rcl: null == o ? void 0 : o.controllerLevel,
owner: null == o ? void 0 : o.owner
});
if (!ec(e, n)) return Me.warn("Cannot launch ".concat(n, " operation on ").concat(t, " - insufficient resources"), {
subsystem: "Offensive"
}), null;
var a = "op_".concat(e.id, "_").concat(t, "_").concat(Game.time), i = {
id: a,
clusterId: e.id,
targetRoom: t,
doctrine: n,
squadIds: [],
state: "planning",
createdAt: Game.time,
lastUpdate: Game.time
};
uc.set(a, i);
var s, c = function(e, t, r, o) {
var n = function(e, t) {
var r, o, n = {
guards: 2,
rangers: 3,
healers: 2,
siegeUnits: 1
};
if (t) {
var a = null !== (r = t.towerCount) && void 0 !== r ? r : 0, i = null !== (o = t.spawnCount) && void 0 !== o ? o : 0;
a >= 3 && (n.healers += 1), a >= 2 && i >= 2 && (n.siegeUnits += 1), i >= 2 && (n.guards += 1);
}
return n;
}(0, o), a = "".concat(r, "_").concat(t, "_").concat(Game.time), i = Vs(e, t), s = .3;
"harass" === r ? s = .5 : "raid" === r ? s = .4 : "siege" === r && (s = .3);
var c = {
id: a,
type: r,
members: [],
rallyRoom: i,
targetRooms: [ t ],
state: "gathering",
createdAt: Game.time,
retreatThreshold: s
};
return Me.info("Created ".concat(r, " squad ").concat(a, " for ").concat(t, ": ") + "".concat(n.guards, "G/").concat(n.rangers, "R/").concat(n.healers, "H/").concat(n.siegeUnits, "S rally at ").concat(i), {
subsystem: "Squad"
}), c;
}(e, t, "harassment" === n ? "harass" : n, {
towerCount: null == o ? void 0 : o.towerCount,
spawnCount: null == o ? void 0 : o.spawnCount
});
e.squads.push(c), i.squadIds.push(c.id), function(e, t) {
var r = t.id;
if (ic.has(r)) Me.debug("Squad ".concat(r, " already forming"), {
subsystem: "SquadFormation"
}); else {
var o;
if ("defense" === t.type) o = {
harassers: 0,
soldiers: 2,
rangers: 2,
healers: 1,
siegeUnits: 0
}; else {
var n = "harass" === t.type ? "harassment" : t.type;
o = Js[n].composition;
}
var a = {};
o.harassers > 0 && (a.harasser = o.harassers), o.soldiers > 0 && (a.soldier = o.soldiers), 
o.rangers > 0 && (a.ranger = o.rangers), o.healers > 0 && (a.healer = o.healers), 
o.siegeUnits > 0 && (a.siegeUnit = o.siegeUnits);
var i = {
squadId: r,
targetComposition: a,
currentComposition: {},
spawnRequests: new Set,
formationStarted: Game.time
};
ic.set(r, i);
var s = Game.rooms[t.rallyRoom];
s ? (function(e, t, r, o) {
var n = !1;
if ("defense" !== t.type) {
var a = "harass" === t.type ? "harassment" : t.type;
n = Js[a].useBoosts;
}
var i = _s.NORMAL;
"siege" === t.type ? i = _s.HIGH : "defense" === t.type && (i = _s.EMERGENCY);
var s = function(r, a) {
for (var s = 0; s < a; s++) {
var c = sc(r, 0, e.energyCapacityAvailable);
c.reduce(function(e, t) {
return e + ac[t];
}, 0), !n || lc(r);
var l = {
id: "".concat(t.id, "_").concat(r, "_").concat(s, "_").concat(Game.time),
roomName: e.name,
role: r,
body: c,
priority: i,
targetRoom: t.targetRooms[0],
createdAt: Game.time,
additionalMemory: {
squadId: t.id
}
};
nc.addRequest(l), o.spawnRequests.add(l.id);
}
};
r.harassers > 0 && s("harasser", r.harassers), r.soldiers > 0 && s("soldier", r.soldiers), 
r.rangers > 0 && s("ranger", r.rangers), r.healers > 0 && s("healer", r.healers), 
r.siegeUnits > 0 && s("siegeUnit", r.siegeUnits);
}(s, t, o, i), Me.info("Started forming squad ".concat(r, ": ").concat(JSON.stringify(a)), {
subsystem: "SquadFormation"
})) : Me.warn("Rally room ".concat(t.rallyRoom, " not visible for squad ").concat(r), {
subsystem: "SquadFormation"
});
}
}(0, c), i.state = "forming", s = t, Memory.lastAttacked || (Memory.lastAttacked = {}), 
Memory.lastAttacked[s] = Game.time, Me.info("Marked ".concat(s, " as attacked at tick ").concat(Game.time), {
subsystem: "AttackTarget"
}), Me.info("Launched ".concat(n, " operation ").concat(a, " on ").concat(t, " with squad ").concat(c.id), {
subsystem: "Offensive"
});
}(e, n.roomName, n.doctrine) : Me.info("Cluster ".concat(e.id, " cannot launch ").concat(n.doctrine, " doctrine (insufficient resources)"), {
subsystem: "Offensive"
});
} else Me.debug("No attack targets found for cluster ".concat(e.id), {
subsystem: "Offensive"
});
}
}
}(e), function() {
var e, t;
!function() {
var e, t, r = Game.time;
try {
for (var o = a(ic.entries()), n = o.next(); !n.done; n = o.next()) {
var s = i(n.value, 2), c = s[0], l = r - s[1].formationStarted;
l > 500 && (Me.warn("Squad ".concat(c, " formation timed out after ").concat(l, " ticks"), {
subsystem: "SquadFormation"
}), ic.delete(c));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}();
try {
for (var r = a(uc.entries()), o = r.next(); !o.done; o = r.next()) {
var n = i(o.value, 2);
n[0], mc(n[1]);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
o && !o.done && (t = r.return) && t.call(r);
} finally {
if (e) throw e.error;
}
}
!function() {
var e, t;
try {
for (var r = a(uc.entries()), o = r.next(); !o.done; o = r.next()) {
var n = i(o.value, 2), s = n[0], c = n[1], l = Game.time - c.createdAt;
("complete" === c.state || "failed" === c.state) && l > 5e3 && (uc.delete(s), Me.debug("Cleaned up operation ".concat(s), {
subsystem: "Offensive"
}));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
o && !o.done && (t = r.return) && t.call(r);
} finally {
if (e) throw e.error;
}
}
}();
}();
}, t.prototype.updateClusterRole = function(e) {
var t = e.metrics, r = t.warIndex, o = t.economyIndex;
e.role = r > 50 ? "war" : o > 70 && r < 20 ? "economic" : o < 40 ? "frontier" : "mixed";
}, t.prototype.updateFocusRoom = function(e) {
var t, r, o, n, i = [];
try {
for (var s = a(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
u && (null === (o = u.controller) || void 0 === o ? void 0 : o.my) && i.push({
roomName: l,
rcl: u.controller.level
});
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
if (0 !== i.length) {
if (e.focusRoom) {
var m = Game.rooms[e.focusRoom];
8 === (null === (n = null == m ? void 0 : m.controller) || void 0 === n ? void 0 : n.level) && (Me.info("Focus room ".concat(e.focusRoom, " reached RCL 8, selecting next room"), {
subsystem: "Cluster"
}), e.focusRoom = void 0), m || (Me.warn("Focus room ".concat(e.focusRoom, " no longer valid, selecting new focus"), {
subsystem: "Cluster"
}), e.focusRoom = void 0);
}
if (!e.focusRoom) {
var p = i.filter(function(e) {
return e.rcl < 8;
});
if (0 === p.length) return;
p.sort(function(e, t) {
return e.rcl !== t.rcl ? e.rcl - t.rcl : e.roomName.localeCompare(t.roomName);
}), e.focusRoom = p[0].roomName, Me.info("Selected ".concat(e.focusRoom, " (RCL ").concat(p[0].rcl, ") as focus room for upgrading"), {
subsystem: "Cluster"
});
}
}
}, t.prototype.createCluster = function(e) {
var t = "cluster_".concat(e), r = Ps.getCluster(t, e);
if (!r) throw new Error("Failed to create cluster for ".concat(e));
return Me.info("Created cluster ".concat(t, " with core room ").concat(e), {
subsystem: "Cluster"
}), r;
}, t.prototype.addRoomToCluster = function(e, t, r) {
void 0 === r && (r = !1);
var o = Ps.getCluster(e);
o ? r ? o.remoteRooms.includes(t) || (o.remoteRooms.push(t), Me.info("Added remote room ".concat(t, " to cluster ").concat(e), {
subsystem: "Cluster"
})) : o.memberRooms.includes(t) || (o.memberRooms.push(t), Me.info("Added member room ".concat(t, " to cluster ").concat(e), {
subsystem: "Cluster"
})) : Me.error("Cluster ".concat(e, " not found"), {
subsystem: "Cluster"
});
}, t.prototype.processDefenseRequests = function(e) {
var t, r, n, i, s;
e.defenseRequests = e.defenseRequests.filter(function(e) {
var t = Game.time - e.createdAt;
if (t > 500) return Me.debug("Defense request for ".concat(e.roomName, " expired (").concat(t, " ticks old)"), {
subsystem: "Cluster"
}), !1;
var r = Game.rooms[e.roomName];
return !(!r || 0 === r.find(FIND_HOSTILE_CREEPS).length && (Me.info("Defense request for ".concat(e.roomName, " resolved - no more hostiles"), {
subsystem: "Cluster"
}), 1));
});
try {
for (var c = a(e.defenseRequests), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u.urgency >= 3) {
var m = Game.rooms[u.roomName];
m && m.storage && m.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 1e4 && Zs(e, u.roomName, 2e4);
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
var p = function(t) {
var r = Game.rooms[t];
if (!r || !(null === (s = r.controller) || void 0 === s ? void 0 : s.my)) return "continue";
var n = Ps.getSwarmState(t);
if (!n) return "continue";
if (Gs(r, n)) {
var a = e.defenseRequests.find(function(e) {
return e.roomName === t;
});
if (a) {
var i = Ls(r, n);
i && i.urgency > a.urgency && (a.urgency = i.urgency, a.guardsNeeded = i.guardsNeeded, 
a.rangersNeeded = i.rangersNeeded, a.healersNeeded = i.healersNeeded, a.threat = i.threat);
} else {
var c = Ls(r, n);
c && e.defenseRequests.push(o(o({}, c), {
assignedCreeps: []
}));
}
}
};
try {
for (var d = a(e.memberRooms), f = d.next(); !f.done; f = d.next()) p(f.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (n) throw n.error;
}
}
this.assignDefendersToRequests(e);
}, t.prototype.assignDefendersToRequests = function(e) {
var t, r, o, n, c, l;
if (0 !== e.defenseRequests.length) {
var u = s([], i(e.defenseRequests), !1).sort(function(e, t) {
return t.urgency - e.urgency;
}), m = [];
try {
for (var p = a(u), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
if (Game.rooms[f.roomName]) {
try {
for (var y = (o = void 0, a(e.memberRooms)), g = y.next(); !g.done; g = y.next()) {
var h = g.value;
if (h !== f.roomName) {
var v = Game.rooms[h];
if (v) {
var R = v.find(FIND_MY_CREEPS);
try {
for (var E = (c = void 0, a(R)), T = E.next(); !T.done; T = E.next()) {
var C = T.value, S = C.memory;
if ("military" === S.family && !S.assistTarget && !f.assignedCreeps.includes(C.name)) {
var _ = f.guardsNeeded > 0, O = f.rangersNeeded > 0, b = f.healersNeeded > 0, w = "guard" === S.role, U = "ranger" === S.role, x = "healer" === S.role;
if (_ && w || O && U || b && x) {
var A = Game.map.getRoomLinearDistance(h, f.roomName);
m.push({
creep: C,
room: v,
distance: A,
targetRoom: f.roomName
});
}
}
}
} catch (e) {
c = {
error: e
};
} finally {
try {
T && !T.done && (l = E.return) && l.call(E);
} finally {
if (c) throw c.error;
}
}
}
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (n = y.return) && n.call(y);
} finally {
if (o) throw o.error;
}
}
m.sort(function(e, t) {
return e.distance - t.distance;
});
for (var M = f.guardsNeeded + f.rangersNeeded + f.healersNeeded, k = Math.min(M, m.length), N = 0; N < k; N++) {
var I = m[N];
I && (I.creep.memory.assistTarget = f.roomName, f.assignedCreeps.push(I.creep.name), 
Me.info("Assigned ".concat(I.creep.name, " (").concat(I.creep.memory.role, ") from ").concat(I.room.name, " to assist ").concat(f.roomName, " (distance: ").concat(I.distance, ")"), {
subsystem: "Cluster"
}), "guard" === I.creep.memory.role && f.guardsNeeded--, "ranger" === I.creep.memory.role && f.rangersNeeded--, 
"healer" === I.creep.memory.role && f.healersNeeded--);
}
for (N = m.length - 1; N >= 0; N--) f.assignedCreeps.includes(m[N].creep.name) && m.splice(N, 1);
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
d && !d.done && (r = p.return) && r.call(p);
} finally {
if (t) throw t.error;
}
}
}
}, n([ pr("cluster:manager", "Cluster Manager", {
priority: $t.MEDIUM,
interval: 10,
minBucket: 0,
cpuBudget: .03
}) ], t.prototype, "run", null), n([ function(e) {
return mr.add(e), e;
} ], t);
}(), gc = new yc, hc = {
minBucket: 0,
minSourceLinkEnergy: 400,
controllerLinkMaxEnergy: 700,
transferThreshold: 100,
storageLinkReserve: 100
};

!function(e) {
e.SOURCE = "source", e.CONTROLLER = "controller", e.STORAGE = "storage", e.UNKNOWN = "unknown";
}(dc || (dc = {}));

var vc, Rc, Ec, Tc, Cc, Sc, _c, Oc, bc, wc, Uc, xc, Ac, Mc = function() {
function e(e) {
void 0 === e && (e = {}), this.config = o(o({}, hc), e);
}
return e.prototype.run = function() {
var e, t;
if (!(Game.cpu.bucket < this.config.minBucket)) {
var r = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.controller.level >= 5;
});
try {
for (var o = a(r), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
this.processRoomLinks(i);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}
}, e.prototype.processRoomLinks = function(e) {
var t = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LINK;
}
});
if (!(t.length < 2)) {
var r = this.classifyLinks(e, t), o = r.filter(function(e) {
return e.role === dc.SOURCE;
}), n = r.filter(function(e) {
return e.role === dc.CONTROLLER;
}), a = r.filter(function(e) {
return e.role === dc.STORAGE;
});
this.executeTransfers(e, o, n, a);
}
}, e.prototype.classifyLinks = function(e, t) {
var r = e.controller, o = e.storage, n = e.find(FIND_SOURCES);
return t.map(function(e) {
var t, i;
if (r && e.pos.getRangeTo(r) <= 2) return {
link: e,
role: dc.CONTROLLER,
priority: 100
};
if (o && e.pos.getRangeTo(o) <= 2) return {
link: e,
role: dc.STORAGE,
priority: 50
};
try {
for (var s = a(n), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (e.pos.getRangeTo(l) <= 2) return {
link: e,
role: dc.SOURCE,
priority: 10
};
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (i = s.return) && i.call(s);
} finally {
if (t) throw t.error;
}
}
return {
link: e,
role: dc.UNKNOWN,
priority: 25
};
});
}, e.prototype.executeTransfers = function(e, t, r, o) {
var n, c, l, u, m = this, p = t.filter(function(e) {
return e.link.store.getUsedCapacity(RESOURCE_ENERGY) >= m.config.minSourceLinkEnergy && 0 === e.link.cooldown;
}).sort(function(e, t) {
return t.link.store.getUsedCapacity(RESOURCE_ENERGY) - e.link.store.getUsedCapacity(RESOURCE_ENERGY);
});
if (0 !== p.length) {
var d = s(s([], i(r), !1), i(o), !1).filter(function(e) {
return e.link.store.getFreeCapacity(RESOURCE_ENERGY) > m.config.transferThreshold;
}).sort(function(e, t) {
return t.priority - e.priority;
});
if (0 !== d.length) try {
for (var f = a(p), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
if (!(g.link.cooldown > 0)) {
var h = null;
try {
for (var v = (l = void 0, a(d)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
if (!(E.link.store.getFreeCapacity(RESOURCE_ENERGY) < this.config.transferThreshold)) {
if (E.role === dc.CONTROLLER && E.link.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.controllerLinkMaxEnergy) {
h = E;
break;
}
if (E.role !== dc.STORAGE) !h && E.link.store.getFreeCapacity(RESOURCE_ENERGY) > this.config.transferThreshold && (h = E); else if (E.link.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.storageLinkReserve) {
h = E;
break;
}
}
}
} catch (e) {
l = {
error: e
};
} finally {
try {
R && !R.done && (u = v.return) && u.call(v);
} finally {
if (l) throw l.error;
}
}
if (h) {
var T = g.link.store.getUsedCapacity(RESOURCE_ENERGY), C = g.link.transferEnergy(h.link, T);
C === OK ? Ft.debug("Link transfer: ".concat(T, " energy from ").concat(g.link.pos, " to ").concat(h.link.pos, " (").concat(h.role, ")"), {
subsystem: "Link",
room: e.name
}) : C !== ERR_TIRED && C !== ERR_FULL && Ft.warn("Link transfer failed: ".concat(C, " from ").concat(g.link.pos, " to ").concat(h.link.pos), {
subsystem: "Link",
room: e.name
});
}
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
y && !y.done && (c = f.return) && c.call(f);
} finally {
if (n) throw n.error;
}
}
}
}, e.prototype.getLinkRole = function(e) {
var t, r, o = e.room, n = o.controller, i = o.storage, s = o.find(FIND_SOURCES);
if (n && e.pos.getRangeTo(n) <= 2) return dc.CONTROLLER;
if (i && e.pos.getRangeTo(i) <= 2) return dc.STORAGE;
try {
for (var c = a(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (e.pos.getRangeTo(u) <= 2) return dc.SOURCE;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
return dc.UNKNOWN;
}, e.prototype.hasLinkNetwork = function(e) {
var t;
if (!(null === (t = e.controller) || void 0 === t ? void 0 : t.my) || e.controller.level < 5) return !1;
var r = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LINK;
}
});
if (r.length < 2) return !1;
var o = this.classifyLinks(e, r), n = o.some(function(e) {
return e.role === dc.SOURCE;
}), a = o.some(function(e) {
return e.role === dc.CONTROLLER || e.role === dc.STORAGE;
});
return n && a;
}, n([ Rr("link:manager", "Link Manager", {
priority: $t.MEDIUM,
interval: 5,
minBucket: 0,
cpuBudget: .05
}) ], e.prototype, "run", null), n([ Cr() ], e);
}(), kc = new Mc, Nc = {
updateInterval: 100,
priceUpdateInterval: 500,
minBucket: 0,
minCredits: 1e4,
emergencyCredits: 5e3,
tradingCredits: 5e4,
warPriceMultiplier: 2,
buyPriceThreshold: .85,
sellPriceThreshold: 1.15,
maxPriceHistory: 30,
rollingAverageWindow: 10,
lowPriceMultiplier: .9,
highPriceMultiplier: 1.1,
trendChangeThreshold: .05,
buyOpportunityAdjustment: 1.02,
sellOpportunityAdjustment: .98,
sellThresholds: (vc = {}, vc[RESOURCE_ENERGY] = 5e5, vc[RESOURCE_HYDROGEN] = 2e4, 
vc[RESOURCE_OXYGEN] = 2e4, vc[RESOURCE_UTRIUM] = 2e4, vc[RESOURCE_LEMERGIUM] = 2e4, 
vc[RESOURCE_KEANIUM] = 2e4, vc[RESOURCE_ZYNTHIUM] = 2e4, vc[RESOURCE_CATALYST] = 2e4, 
vc),
buyThresholds: (Rc = {}, Rc[RESOURCE_ENERGY] = 1e5, Rc[RESOURCE_HYDROGEN] = 5e3, 
Rc[RESOURCE_OXYGEN] = 5e3, Rc[RESOURCE_UTRIUM] = 5e3, Rc[RESOURCE_LEMERGIUM] = 5e3, 
Rc[RESOURCE_KEANIUM] = 5e3, Rc[RESOURCE_ZYNTHIUM] = 5e3, Rc[RESOURCE_CATALYST] = 5e3, 
Rc),
trackedResources: [ RESOURCE_ENERGY, RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_GHODIUM, RESOURCE_POWER ],
criticalResources: [ RESOURCE_ENERGY, RESOURCE_GHODIUM ],
emergencyBuyThreshold: 5e3,
orderExtensionAge: 5e3,
maxTransportCostRatio: .3
}, Ic = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = o(o({}, Nc), e);
}
return t.prototype.run = function() {
this.lastRun = Game.time, this.ensureMarketMemory(), Game.time % this.config.priceUpdateInterval === 0 && this.updatePriceTracking(), 
this.updateOrderStats(), this.reconcilePendingArbitrage(), this.handleEmergencyBuying(), 
this.cancelOldOrders(), this.manageExistingOrders(), this.updateBuyOrders(), this.updateSellOrders(), 
this.checkArbitrageOpportunities(), this.executeDeal(), Game.time % 200 == 0 && this.balanceResourcesAcrossRooms();
}, t.prototype.ensureMarketMemory = function() {
var t = e.memoryManager.getEmpire();
t.market || (t.market = e.createDefaultMarketMemory()), t.market.orders || (t.market.orders = {}), 
void 0 === t.market.totalProfit && (t.market.totalProfit = 0), t.market.lastBalance || (t.market.lastBalance = 0), 
t.market.pendingArbitrage || (t.market.pendingArbitrage = []), void 0 === t.market.completedArbitrage && (t.market.completedArbitrage = 0), 
void 0 === t.market.arbitrageProfit && (t.market.arbitrageProfit = 0);
}, t.prototype.updatePriceTracking = function() {
var t, r, o = e.memoryManager.getEmpire();
if (o.market) {
try {
for (var n = a(this.config.trackedResources), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
this.updateResourcePrice(s);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
o.market.lastScan = Game.time, Ft.debug("Updated market prices for ".concat(this.config.trackedResources.length, " resources"), {
subsystem: "Market"
});
}
}, t.prototype.updateResourcePrice = function(t) {
var r = e.memoryManager.getEmpire();
if (r.market) {
var o = Game.market.getHistory(t);
if (0 !== o.length) {
var n = o[o.length - 1], a = r.market.resources[t];
a || (a = {
resource: t,
priceHistory: [],
avgPrice: n.avgPrice,
trend: 0,
lastUpdate: Game.time
}, r.market.resources[t] = a);
var i = {
tick: Game.time,
avgPrice: n.avgPrice,
lowPrice: n.avgPrice * this.config.lowPriceMultiplier,
highPrice: n.avgPrice * this.config.highPriceMultiplier
};
a.priceHistory.push(i), a.priceHistory.length > this.config.maxPriceHistory && a.priceHistory.shift();
var s = a.priceHistory.slice(-this.config.rollingAverageWindow);
if (a.avgPrice = s.reduce(function(e, t) {
return e + t.avgPrice;
}, 0) / s.length, a.priceHistory.length >= 5) {
var c = a.priceHistory.slice(-5, -2).reduce(function(e, t) {
return e + t.avgPrice;
}, 0) / 3, l = (a.priceHistory.slice(-3).reduce(function(e, t) {
return e + t.avgPrice;
}, 0) / 3 - c) / c;
l > this.config.trendChangeThreshold ? a.trend = 1 : l < -this.config.trendChangeThreshold ? a.trend = -1 : a.trend = 0;
}
if (s.length >= 5) {
var u = a.avgPrice, m = s.reduce(function(e, t) {
return e + Math.pow(t.avgPrice - u, 2);
}, 0) / s.length, p = Math.sqrt(m);
a.volatility = p / u;
}
if (a.priceHistory.length >= 3) {
var d = a.priceHistory.slice(-3), f = (d[2].avgPrice - d[0].avgPrice) / 2;
a.predictedPrice = d[2].avgPrice + f;
}
a.lastUpdate = Game.time;
}
}
}, t.prototype.getMarketData = function(t) {
var r;
return null === (r = e.memoryManager.getEmpire().market) || void 0 === r ? void 0 : r.resources[t];
}, t.prototype.isBuyOpportunity = function(e) {
var t = this.getMarketData(e);
if (!t) return !1;
var r = Game.market.getHistory(e);
return 0 !== r.length && r[r.length - 1].avgPrice <= t.avgPrice * this.config.buyPriceThreshold;
}, t.prototype.isSellOpportunity = function(e) {
var t = this.getMarketData(e);
if (!t) return !1;
var r = Game.market.getHistory(e);
return 0 !== r.length && r[r.length - 1].avgPrice >= t.avgPrice * this.config.sellPriceThreshold;
}, t.prototype.cancelOldOrders = function() {
var e = Game.market.orders;
for (var t in e) {
var r = e[t];
Game.time - r.created > 1e4 && (Game.market.cancelOrder(t), Ft.info("Cancelled old order: ".concat(r.type, " ").concat(r.resourceType), {
subsystem: "Market"
})), r.remainingAmount < 100 && Game.market.cancelOrder(t);
}
}, t.prototype.updateBuyOrders = function() {
var t, r, o, n = e.memoryManager.getEmpire().objectives.warMode, a = {};
for (var i in Game.rooms) {
var s = Game.rooms[i];
if (s.terminal && (null === (t = s.controller) || void 0 === t ? void 0 : t.my)) for (var c in s.terminal.store) a[c] = (null !== (r = a[c]) && void 0 !== r ? r : 0) + s.terminal.store[c];
}
for (var c in this.config.buyThresholds) {
var l = this.config.buyThresholds[c], u = null !== (o = a[c]) && void 0 !== o ? o : 0;
if (u < l) {
var m = this.isBuyOpportunity(c);
n || m ? this.createBuyOrder(c, l - u, n, m) : Ft.debug("Skipping buy for ".concat(c, ": waiting for better price"), {
subsystem: "Market"
});
}
}
}, t.prototype.createBuyOrder = function(e, t, r, o) {
var n;
if (!(Object.values(Game.market.orders).filter(function(t) {
return t.type === ORDER_BUY && t.resourceType === e;
}).length > 0)) {
var a = Game.market.getHistory(e);
if (0 !== a.length) {
var i, s = a[a.length - 1].avgPrice, c = this.getMarketData(e);
if (i = r ? s * this.config.warPriceMultiplier : o && c ? s * this.config.buyOpportunityAdjustment : null !== (n = null == c ? void 0 : c.avgPrice) && void 0 !== n ? n : s * this.config.highPriceMultiplier, 
!(Game.market.credits < this.config.minCredits)) {
var l = Object.values(Game.rooms).find(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my);
});
if ((null == l ? void 0 : l.terminal) && Game.market.createOrder({
type: ORDER_BUY,
resourceType: e,
price: i,
totalAmount: Math.min(t, 1e4),
roomName: l.name
}) === OK) {
var u = o ? " (LOW PRICE!)" : r ? " (WAR MODE)" : "";
Ft.info("Created buy order: ".concat(t, " ").concat(e, " at ").concat(i.toFixed(3), " credits").concat(u), {
subsystem: "Market"
});
}
}
}
}
}, t.prototype.sellSurplusFromTerminal = function(t, r, o) {
var n, a = Game.rooms[t];
if (!(null == a ? void 0 : a.terminal) || !(null === (n = a.controller) || void 0 === n ? void 0 : n.my)) return Ft.warn("Cannot sell from ".concat(t, ": no terminal or not owned"), {
subsystem: "Market"
}), !1;
var i = a.terminal.store.getUsedCapacity(r);
if (i < o) return Ft.debug("Cannot sell ".concat(o, " ").concat(r, " from ").concat(t, ": only ").concat(i, " available"), {
subsystem: "Market"
}), !1;
var s = e.memoryManager.getEmpire();
if (!s.market) return Game.market.createOrder({
type: ORDER_SELL,
resourceType: r,
price: .5,
totalAmount: o,
roomName: t
}) === OK;
var c = s.market.resources[r], l = .5;
if (null == c ? void 0 : c.avgPrice) l = .95 * c.avgPrice; else {
var u = Game.market.getAllOrders({
type: ORDER_BUY,
resourceType: r
});
u.length > 0 && (u.sort(function(e, t) {
return t.price - e.price;
}), l = u[0].price);
}
var m = Game.market.createOrder({
type: ORDER_SELL,
resourceType: r,
price: l,
totalAmount: o,
roomName: t
});
return m === OK ? (Ft.info("Created surplus sell order: ".concat(o, " ").concat(r, " from ").concat(t, " at ").concat(l.toFixed(3), " credits/unit"), {
subsystem: "Market"
}), !0) : (Ft.warn("Failed to create sell order: ".concat(m, " for ").concat(o, " ").concat(r, " from ").concat(t), {
subsystem: "Market"
}), !1);
}, t.prototype.updateSellOrders = function() {
var e, t, r, o = {};
for (var n in Game.rooms) {
var a = Game.rooms[n];
if (a.terminal && (null === (e = a.controller) || void 0 === e ? void 0 : e.my)) for (var i in a.terminal.store) o[i] = (null !== (t = o[i]) && void 0 !== t ? t : 0) + a.terminal.store[i];
}
for (var i in this.config.sellThresholds) {
var s = this.config.sellThresholds[i], c = null !== (r = o[i]) && void 0 !== r ? r : 0;
if (c > s) {
var l = this.isSellOpportunity(i);
l ? this.createSellOrder(i, c - s, l) : Ft.debug("Holding ".concat(i, " surplus: waiting for better price"), {
subsystem: "Market"
});
}
}
}, t.prototype.createSellOrder = function(e, t, r) {
var o;
if (!(Object.values(Game.market.orders).filter(function(t) {
return t.type === ORDER_SELL && t.resourceType === e;
}).length > 0)) {
var n = Game.market.getHistory(e);
if (0 !== n.length) {
var a, i = n[n.length - 1].avgPrice, s = this.getMarketData(e);
a = r && s ? i * this.config.sellOpportunityAdjustment : null !== (o = null == s ? void 0 : s.avgPrice) && void 0 !== o ? o : i * this.config.lowPriceMultiplier;
var c = Object.values(Game.rooms).find(function(t) {
var r;
return t.terminal && (null === (r = t.controller) || void 0 === r ? void 0 : r.my) && t.terminal.store[e] > 1e3;
});
if ((null == c ? void 0 : c.terminal) && Game.market.createOrder({
type: ORDER_SELL,
resourceType: e,
price: a,
totalAmount: Math.min(t, 1e4),
roomName: c.name
}) === OK) {
var l = r ? " (HIGH PRICE!)" : "";
Ft.info("Created sell order: ".concat(t, " ").concat(e, " at ").concat(a.toFixed(3), " credits").concat(l), {
subsystem: "Market"
});
}
}
}
}, t.prototype.updateOrderStats = function() {
var t, r, o = e.memoryManager.getEmpire();
if (null === (t = o.market) || void 0 === t ? void 0 : t.orders) {
var n = Game.market.orders;
for (var a in o.market.orders) {
var i = o.market.orders[a], s = n[a];
if (s) {
if (void 0 !== s.totalAmount) {
var c = s.totalAmount - s.remainingAmount, l = c - i.totalTraded;
l > 0 && (i.totalTraded = c, i.totalValue += l * s.price);
}
} else {
if (i.totalTraded > 0) {
var u = "sell" === i.type ? i.totalValue : -i.totalValue;
o.market.totalProfit = (null !== (r = o.market.totalProfit) && void 0 !== r ? r : 0) + u, 
Ft.info("Order completed: ".concat(i.resource, " ").concat(i.type, " - Traded: ").concat(i.totalTraded, ", Value: ").concat(i.totalValue.toFixed(0), ", Profit: ").concat(u.toFixed(0)), {
subsystem: "Market"
});
}
delete o.market.orders[a];
}
}
}
}, t.prototype.executeDeal = function() {
var t, r;
if (Game.time % 50 == 0 && e.memoryManager.getEmpire().objectives.warMode) {
var o = [ RESOURCE_CATALYZED_GHODIUM_ACID, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, RESOURCE_CATALYZED_KEANIUM_ALKALIDE ];
try {
for (var n = a(o), i = n.next(); !i.done; i = n.next()) {
var s = i.value, c = Game.market.getAllOrders({
type: ORDER_SELL,
resourceType: s
});
if (c.length > 0) {
c.sort(function(e, t) {
return e.price - t.price;
});
var l = c[0], u = Object.values(Game.rooms).find(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my);
});
if (u && l.price < 10) {
var m = Math.min(l.amount, 1e3);
Game.market.deal(l.id, m, u.name) === OK && Ft.info("Bought ".concat(m, " ").concat(s, " for ").concat(l.price.toFixed(3), " credits/unit"), {
subsystem: "Market"
});
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}
}, t.prototype.handleEmergencyBuying = function() {
var e, t, r, o, n;
if (!(Game.market.credits < this.config.emergencyCredits)) {
var i = {};
for (var s in Game.rooms) {
var c = Game.rooms[s];
if (c.terminal && (null === (r = c.controller) || void 0 === r ? void 0 : r.my)) for (var l in c.terminal.store) i[l] = (null !== (o = i[l]) && void 0 !== o ? o : 0) + c.terminal.store[l];
}
try {
for (var u = a(this.config.criticalResources), m = u.next(); !m.done; m = u.next()) {
var p = null !== (n = i[l = m.value]) && void 0 !== n ? n : 0;
p < this.config.emergencyBuyThreshold && this.executeEmergencyBuy(l, this.config.emergencyBuyThreshold - p);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
m && !m.done && (t = u.return) && t.call(u);
} finally {
if (e) throw e.error;
}
}
}
}, t.prototype.executeEmergencyBuy = function(e, t) {
var r = Game.market.getAllOrders({
type: ORDER_SELL,
resourceType: e
});
if (0 !== r.length) {
var o = Object.values(Game.rooms).find(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my);
});
if (null == o ? void 0 : o.terminal) {
r.sort(function(e, t) {
return (e.roomName ? e.price + Game.market.calcTransactionCost(1e3, o.name, e.roomName) / 1e3 : e.price) - (t.roomName ? t.price + Game.market.calcTransactionCost(1e3, o.name, t.roomName) / 1e3 : t.price);
});
var n = r[0], a = Math.min(t, n.amount, 1e4);
Game.market.deal(n.id, a, o.name) === OK && Ft.warn("EMERGENCY BUY: ".concat(a, " ").concat(e, " at ").concat(n.price.toFixed(3), " credits/unit"), {
subsystem: "Market"
});
}
}
}, t.prototype.manageExistingOrders = function() {
var e = Game.market.orders;
for (var t in e) {
var r = e[t];
if (!(Game.time - r.created < this.config.orderExtensionAge)) {
var o = r.resourceType;
if ("token" !== o && this.config.trackedResources.includes(o) && this.getMarketData(o)) {
var n = Game.market.getHistory(o);
if (0 !== n.length) {
var a = n[n.length - 1].avgPrice;
if (r.type === ORDER_BUY) {
var i = a * this.config.buyOpportunityAdjustment;
r.price < .9 * i && r.remainingAmount > 1e3 && (Game.market.extendOrder(t, Math.min(5e3, r.remainingAmount)), 
Ft.debug("Extended buy order for ".concat(r.resourceType, ": +").concat(r.remainingAmount, " at ").concat(r.price.toFixed(3)), {
subsystem: "Market"
}));
}
r.type === ORDER_SELL && (i = a * this.config.sellOpportunityAdjustment, r.price > 1.1 * i && r.remainingAmount > 1e3 && (Game.market.extendOrder(t, Math.min(5e3, r.remainingAmount)), 
Ft.debug("Extended sell order for ".concat(r.resourceType, ": +").concat(r.remainingAmount, " at ").concat(r.price.toFixed(3)), {
subsystem: "Market"
})));
}
}
}
}
}, t.prototype.reconcilePendingArbitrage = function() {
var t, r, o, n, i, s, c, l = e.memoryManager.getEmpire().market;
if ((null == l ? void 0 : l.pendingArbitrage) && 0 !== l.pendingArbitrage.length) {
var u = [];
try {
for (var m = a(l.pendingArbitrage), p = m.next(); !p.done; p = m.next()) {
var d = p.value, f = Game.rooms[d.destinationRoom], y = null == f ? void 0 : f.terminal;
if (y && (null === (o = null == f ? void 0 : f.controller) || void 0 === o ? void 0 : o.my)) if (Game.time < d.expectedArrival || y.cooldown > 0) u.push(d); else {
var g = null !== (n = y.store[d.resource]) && void 0 !== n ? n : 0;
if (g < d.amount) u.push(d); else {
var h = !1;
if (d.sellOrderId) {
var v = Game.market.getOrderById(d.sellOrderId);
if (v && v.remainingAmount > 0 && v.roomName) {
var R = Math.min(d.amount, v.remainingAmount, g), E = Game.market.calcTransactionCost(R, y.room.name, v.roomName);
if (y.store[RESOURCE_ENERGY] >= E && Game.market.deal(v.id, R, y.room.name) === OK) {
var T = (v.price - d.buyPrice) * R;
l.totalProfit = (null !== (i = l.totalProfit) && void 0 !== i ? i : 0) + T, l.arbitrageProfit = (null !== (s = l.arbitrageProfit) && void 0 !== s ? s : 0) + T, 
l.completedArbitrage = (null !== (c = l.completedArbitrage) && void 0 !== c ? c : 0) + 1, 
Ft.info("Arbitrage complete: sold ".concat(R, " ").concat(d.resource, " from ").concat(y.room.name, " at ").concat(v.price.toFixed(3), ", profit ").concat(T.toFixed(2)), {
subsystem: "Market"
}), h = !0;
}
}
}
h || Game.market.createOrder({
type: ORDER_SELL,
resourceType: d.resource,
price: d.targetSellPrice,
totalAmount: d.amount,
roomName: y.room.name
}) === OK && (Ft.info("Arbitrage posted sell order: ".concat(d.amount, " ").concat(d.resource, " at ").concat(d.targetSellPrice.toFixed(3), " from ").concat(y.room.name), {
subsystem: "Market"
}), h = !0), h || u.push(d);
}
} else u.push(d);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
p && !p.done && (r = m.return) && r.call(m);
} finally {
if (t) throw t.error;
}
}
l.pendingArbitrage = u;
}
}, t.prototype.checkArbitrageOpportunities = function() {
var t, r, o, n, i, s;
if (!(Game.cpu.bucket < this.config.minBucket || Game.market.credits < this.config.tradingCredits)) {
var c = e.memoryManager.getEmpire().market, l = Object.values(Game.rooms).filter(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my);
});
if (c && 0 !== l.length) {
var u = function(e) {
var t, r;
return null !== (r = null !== (t = e.remainingAmount) && void 0 !== t ? t : e.amount) && void 0 !== r ? r : 0;
}, m = function(e) {
var t, r, m = Game.market.getAllOrders({
type: ORDER_BUY,
resourceType: e
}).filter(function(e) {
return e.remainingAmount > 0 && e.roomName;
}), d = Game.market.getAllOrders({
type: ORDER_SELL,
resourceType: e
}).filter(function(e) {
return e.remainingAmount > 0 && e.roomName;
});
if (0 === m.length || 0 === d.length) return "continue";
m.sort(function(e, t) {
return t.price - e.price;
}), d.sort(function(e, t) {
return e.price - t.price;
});
var f = m[0], y = d[0];
if (!f.roomName || !y.roomName) return "continue";
if (null === (o = c.pendingArbitrage) || void 0 === o ? void 0 : o.some(function(e) {
return e.buyOrderId === y.id || e.sellOrderId === f.id;
})) return "continue";
var g = Math.min(u(f), u(y), 5e3);
if (g <= 0) return "continue";
try {
for (var h = (t = void 0, a(l)), v = h.next(); !v.done; v = h.next()) {
var R = v.value, E = R.terminal;
if (!((null !== (n = E.store.getFreeCapacity(e)) && void 0 !== n ? n : 0) < g)) {
var T = Game.market.calcTransactionCost(g, R.name, y.roomName), C = (T + Game.market.calcTransactionCost(g, R.name, f.roomName)) / g, S = f.price - y.price - C;
if (!(S <= 0 || C / y.price > p.config.maxTransportCostRatio || E.store[RESOURCE_ENERGY] < T)) {
var _ = y.price * g;
if (!(Game.market.credits - _ < p.config.minCredits) && Game.market.deal(y.id, g, R.name) === OK) {
var O = {
id: "".concat(e, "-").concat(Game.time, "-").concat(y.id),
resource: e,
amount: g,
buyOrderId: y.id,
sellOrderId: f.id,
targetSellPrice: f.price,
destinationRoom: R.name,
expectedArrival: Game.time + (null !== (i = E.cooldown) && void 0 !== i ? i : 0) + 1,
buyPrice: y.price,
transportCost: T
};
null === (s = c.pendingArbitrage) || void 0 === s || s.push(O), Ft.info("Arbitrage started: bought ".concat(g, " ").concat(e, " at ").concat(y.price.toFixed(3), " to sell @ ").concat(f.price.toFixed(3), " (profit/unit ~").concat(S.toFixed(2), ")"), {
subsystem: "Market"
});
break;
}
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
v && !v.done && (r = h.return) && r.call(h);
} finally {
if (t) throw t.error;
}
}
}, p = this;
try {
for (var d = a(this.config.trackedResources), f = d.next(); !f.done; f = d.next()) m(f.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
f && !f.done && (r = d.return) && r.call(d);
} finally {
if (t) throw t.error;
}
}
}
}
}, t.prototype.balanceResourcesAcrossRooms = function() {
var e, t, r, o, n, i = Object.values(Game.rooms).filter(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my);
});
if (!(i.length < 2)) try {
for (var s = a(this.config.trackedResources), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = [];
try {
for (var m = (r = void 0, a(i)), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (d.terminal) {
var f = null !== (n = d.terminal.store[l]) && void 0 !== n ? n : 0;
u.push({
room: d,
amount: f
});
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
p && !p.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
if (!(u.length < 2)) {
var y = u.reduce(function(e, t) {
return e + t.amount;
}, 0) / u.length;
u.sort(function(e, t) {
return t.amount - e.amount;
});
var g = u[0], h = u[u.length - 1], v = g.amount - h.amount;
if (v > .5 * y && g.amount > 5e3 && g.room.terminal && h.room.terminal) {
var R = Math.min(Math.floor(v / 2), 1e4), E = Game.market.calcTransactionCost(R, g.room.name, h.room.name);
(l === RESOURCE_ENERGY && E < .1 * R || l !== RESOURCE_ENERGY && E < 1e3) && g.room.terminal.send(l, R, h.room.name) === OK && Ft.info("Balanced ".concat(R, " ").concat(l, ": ").concat(g.room.name, " -> ").concat(h.room.name, " (cost: ").concat(E, " energy)"), {
subsystem: "Market"
});
}
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = s.return) && t.call(s);
} finally {
if (e) throw e.error;
}
}
}, n([ Er("empire:market", "Market Manager", {
priority: $t.LOW,
interval: 100,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(), Pc = new Ic, Gc = function() {
function e() {
this.costCache = new Map, this.COST_CACHE_TTL = 100, this.MAX_HOPS = 3;
}
return e.prototype.buildTerminalGraph = function() {
var e, t = [];
for (var r in Game.rooms) {
var o = Game.rooms[r];
o && (null === (e = o.controller) || void 0 === e ? void 0 : e.my) && o.terminal && o.terminal.my && o.terminal.isActive() && t.push({
roomName: r,
terminal: o.terminal
});
}
return t;
}, e.prototype.calculateTransferCost = function(e, t, r) {
var o = "".concat(t, ":").concat(r, ":").concat(e), n = this.costCache.get(o);
if (n && Game.time - n.timestamp < this.COST_CACHE_TTL) return n.cost;
var a = Game.market.calcTransactionCost(e, t, r);
return this.costCache.set(o, {
cost: a,
timestamp: Game.time
}), a;
}, e.prototype.findOptimalRoute = function(e, t, r) {
var o, n, i, s, c, l, u, m, p, d = this.calculateTransferCost(r, e, t), f = {
path: [ e, t ],
cost: d,
isDirect: !0
}, y = this.buildTerminalGraph();
if (y.length < 3) return f;
var g = new Map, h = new Map, v = new Set;
try {
for (var R = a(y), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
g.set(T.roomName, 1 / 0), v.add(T.roomName);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
E && !E.done && (n = R.return) && n.call(R);
} finally {
if (o) throw o.error;
}
}
for (g.set(e, 0); v.size > 0; ) {
var C = null, S = 1 / 0;
try {
for (var _ = (i = void 0, a(v)), O = _.next(); !O.done; O = _.next()) {
var b = O.value, w = null !== (u = g.get(b)) && void 0 !== u ? u : 1 / 0;
w < S && (S = w, C = b);
}
} catch (e) {
i = {
error: e
};
} finally {
try {
O && !O.done && (s = _.return) && s.call(_);
} finally {
if (i) throw i.error;
}
}
if (!C || S === 1 / 0) break;
if (C === t) break;
if (v.delete(C), !(this.getPathLength(C, h) >= this.MAX_HOPS)) try {
for (var U = (c = void 0, a(y)), x = U.next(); !x.done; x = U.next()) {
var A = x.value;
if (v.has(A.roomName) && A.roomName !== C) {
var M = this.calculateTransferCost(r, C, A.roomName), k = (null !== (m = g.get(C)) && void 0 !== m ? m : 1 / 0) + M;
k < (null !== (p = g.get(A.roomName)) && void 0 !== p ? p : 1 / 0) && (g.set(A.roomName, k), 
h.set(A.roomName, C));
}
}
} catch (e) {
c = {
error: e
};
} finally {
try {
x && !x.done && (l = U.return) && l.call(U);
} finally {
if (c) throw c.error;
}
}
}
var N = g.get(t);
if (void 0 !== N && N < d) {
var I = this.reconstructPath(t, h);
I.length > 0 && I[0] === e && (f = {
path: I,
cost: N,
isDirect: !1
}, Ft.debug("Multi-hop route found: ".concat(I.join(" -> "), " (cost: ").concat(N, " vs direct: ").concat(d, ")"), {
subsystem: "TerminalRouter"
}));
}
return f;
}, e.prototype.getPathLength = function(e, t) {
for (var r = 0, o = e; void 0 !== o && t.has(o) && (r++, o = t.get(o), !(r > this.MAX_HOPS)); ) ;
return r;
}, e.prototype.reconstructPath = function(e, t) {
for (var r = [], o = e; void 0 !== o; ) r.unshift(o), o = t.get(o);
return r;
}, e.prototype.clearOldCache = function() {
var e, t, r = Game.time - this.COST_CACHE_TTL;
try {
for (var o = a(this.costCache.entries()), n = o.next(); !n.done; n = o.next()) {
var s = i(n.value, 2), c = s[0];
s[1].timestamp < r && this.costCache.delete(c);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.getNextHop = function(e, t) {
var r = e.path.indexOf(t);
return -1 === r || r === e.path.length - 1 ? null : e.path[r + 1] || null;
}, e;
}(), Lc = new Gc, Dc = {
minBucket: 0,
minStorageEnergy: 5e4,
terminalEnergyTarget: 2e4,
terminalEnergyMax: 5e4,
energySendThreshold: 1e5,
energyRequestThreshold: 3e4,
minTransferAmount: 5e3,
maxTransferCostRatio: .1,
capacityWarningThreshold: .8,
capacityClearanceThreshold: .9,
emergencyDangerThreshold: 2,
emergencyEnergyAmount: 2e4,
energySurplusThreshold: 5e4,
mineralSurplusThreshold: 5e3
}, Fc = function() {
function t(e) {
void 0 === e && (e = {}), this.transferQueue = [], this.config = o(o({}, Dc), e);
}
return t.prototype.requestTransfer = function(e, t, r, o, n) {
if (void 0 === n && (n = 3), this.transferQueue.some(function(o) {
return o.fromRoom === e && o.toRoom === t && o.resourceType === r;
})) return Ft.debug("Transfer already queued: ".concat(o, " ").concat(r, " from ").concat(e, " to ").concat(t), {
subsystem: "Terminal"
}), !1;
var a = Game.rooms[e], i = Game.rooms[t];
return a && i && a.terminal && i.terminal ? (this.transferQueue.push({
fromRoom: e,
toRoom: t,
resourceType: r,
amount: o,
priority: n
}), Ft.info("Queued transfer request: ".concat(o, " ").concat(r, " from ").concat(e, " to ").concat(t, " (priority: ").concat(n, ")"), {
subsystem: "Terminal"
}), !0) : (Ft.warn("Cannot queue transfer: rooms or terminals not available", {
subsystem: "Terminal"
}), !1);
}, t.prototype.run = function() {
if (!(Game.cpu.bucket < this.config.minBucket)) {
var e = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.terminal && e.terminal.my && e.terminal.isActive();
});
e.length < 2 || (Lc.clearOldCache(), this.cleanTransferQueue(), this.checkEmergencyTransfers(e), 
this.monitorTerminalCapacity(e), this.balanceEnergy(e), this.balanceMinerals(e), 
this.executeTransfers(e));
}
}, t.prototype.cleanTransferQueue = function() {
this.transferQueue = this.transferQueue.filter(function(e) {
var t = Game.rooms[e.fromRoom], r = Game.rooms[e.toRoom];
return !!(t && r && t.terminal && r.terminal);
});
}, t.prototype.checkEmergencyTransfers = function(t) {
var r, o, n, i, s = this, c = function(r) {
if (!(null === (n = r.controller) || void 0 === n ? void 0 : n.my)) return "continue";
var o = e.memoryManager.getSwarmState(r.name);
if (!o) return "continue";
if (o.danger >= l.config.emergencyDangerThreshold) {
var a = r.storage, c = r.terminal;
if ((null !== (i = null == a ? void 0 : a.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== i ? i : 0) + c.store.getUsedCapacity(RESOURCE_ENERGY) < l.config.energyRequestThreshold / 2) {
var u = t.filter(function(e) {
var t;
return e.name !== r.name && (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > s.config.energySendThreshold;
}).sort(function(e, t) {
return Game.map.getRoomLinearDistance(r.name, e.name) - Game.map.getRoomLinearDistance(r.name, t.name);
});
if (u.length > 0 && u[0]) {
var m = u[0];
if (!l.transferQueue.some(function(e) {
return e.toRoom === r.name && e.resourceType === RESOURCE_ENERGY && e.isEmergency;
})) {
var p = Lc.findOptimalRoute(m.name, r.name, l.config.emergencyEnergyAmount);
p && (l.transferQueue.push({
fromRoom: m.name,
toRoom: r.name,
resourceType: RESOURCE_ENERGY,
amount: l.config.emergencyEnergyAmount,
priority: 10,
route: p,
isEmergency: !0
}), Ft.warn("Emergency energy transfer queued: ".concat(l.config.emergencyEnergyAmount, " from ").concat(m.name, " to ").concat(r.name, " (danger: ").concat(o.danger, ")"), {
subsystem: "Terminal"
}));
}
}
}
}
}, l = this;
try {
for (var u = a(t), m = u.next(); !m.done; m = u.next()) c(m.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
}, t.prototype.monitorTerminalCapacity = function(e) {
var t, r;
try {
for (var o = a(e), n = o.next(); !n.done; n = o.next()) {
var i = n.value, s = i.terminal, c = s.store.getCapacity(), l = s.store.getUsedCapacity(), u = l / c;
u >= this.config.capacityWarningThreshold && u < this.config.capacityClearanceThreshold && Game.time % 100 == 0 && Ft.warn("Terminal ".concat(i.name, " at ").concat((100 * u).toFixed(1), "% capacity (").concat(l, "/").concat(c, ")"), {
subsystem: "Terminal"
}), u >= this.config.capacityClearanceThreshold && this.clearExcessTerminalResources(i, s);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
n && !n.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
}, t.prototype.clearExcessTerminalResources = function(t, r) {
var o, n, i, s, c, l;
Ft.info("Auto-clearing terminal ".concat(t.name, " (").concat((r.store.getUsedCapacity() / r.store.getCapacity() * 100).toFixed(1), "% full)"), {
subsystem: "Terminal"
});
var u, m = e.memoryManager.getClusters();
for (var p in m) {
var d = m[p];
if (d.memberRooms.includes(t.name)) {
var f = 0;
try {
for (var y = (o = void 0, a(d.memberRooms)), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = Game.rooms[h];
(null === (c = null == v ? void 0 : v.controller) || void 0 === c ? void 0 : c.my) && v.controller.level > f && (f = v.controller.level, 
u = h);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (n = y.return) && n.call(y);
} finally {
if (o) throw o.error;
}
}
break;
}
}
var R = Object.keys(r.store);
try {
for (var E = a(R), T = E.next(); !T.done; T = E.next()) {
var C = T.value, S = r.store.getUsedCapacity(C);
if (0 !== S) {
var _ = C === RESOURCE_ENERGY ? this.config.energySurplusThreshold : this.config.mineralSurplusThreshold;
if (S > _) {
var O = S - _;
if (u && u !== t.name) {
var b = null === (l = Game.rooms[u]) || void 0 === l ? void 0 : l.terminal;
if (b && b.store.getFreeCapacity() > O) {
var w = Lc.findOptimalRoute(t.name, u, O);
if (w) {
this.transferQueue.push({
fromRoom: t.name,
toRoom: u,
resourceType: C,
amount: O,
priority: 5,
route: w
}), Ft.info("Queued clearance transfer: ".concat(O, " ").concat(C, " from ").concat(t.name, " to hub ").concat(u), {
subsystem: "Terminal"
});
continue;
}
}
}
Game.time % 10 == 0 && Pc.sellSurplusFromTerminal(t.name, C, O) && Ft.info("Sold ".concat(O, " ").concat(C, " from ").concat(t.name, " terminal via market"), {
subsystem: "Terminal"
});
}
}
}
} catch (e) {
i = {
error: e
};
} finally {
try {
T && !T.done && (s = E.return) && s.call(E);
} finally {
if (i) throw i.error;
}
}
}, t.prototype.balanceEnergy = function(e) {
var t, r, o = this, n = e.map(function(e) {
var t, r = e.storage, n = e.terminal, a = null !== (t = null == r ? void 0 : r.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== t ? t : 0, i = n.store.getUsedCapacity(RESOURCE_ENERGY), s = a + i;
return {
room: e,
terminal: n,
totalEnergy: s,
storageEnergy: a,
terminalEnergy: i,
needsEnergy: s < o.config.energyRequestThreshold,
hasExcess: s > o.config.energySendThreshold && a > o.config.minStorageEnergy
};
}), i = n.filter(function(e) {
return e.needsEnergy;
}).sort(function(e, t) {
return e.totalEnergy - t.totalEnergy;
}), s = n.filter(function(e) {
return e.hasExcess;
}).sort(function(e, t) {
return t.totalEnergy - e.totalEnergy;
}), c = function(e) {
var t, r, o = function(t) {
if (t.room.name === e.room.name) return "continue";
if (l.transferQueue.some(function(r) {
return r.fromRoom === t.room.name && r.toRoom === e.room.name && r.resourceType === RESOURCE_ENERGY;
})) return "continue";
var r = Math.min(Math.floor((t.totalEnergy - l.config.energySendThreshold) / 2), l.config.energyRequestThreshold - e.totalEnergy, t.terminal.store.getUsedCapacity(RESOURCE_ENERGY));
if (r < l.config.minTransferAmount) return "continue";
var o = Lc.findOptimalRoute(t.room.name, e.room.name, r);
if (!o) return "continue";
var n = o.cost / r;
if (n > l.config.maxTransferCostRatio) return Ft.debug("Skipping terminal transfer from ".concat(t.room.name, " to ").concat(e.room.name, ": cost ratio ").concat(n.toFixed(2), " too high"), {
subsystem: "Terminal"
}), "continue";
l.transferQueue.push({
fromRoom: t.room.name,
toRoom: e.room.name,
resourceType: RESOURCE_ENERGY,
amount: r,
priority: 2,
route: o
});
var a = o.isDirect ? "direct" : "multi-hop (".concat(o.path.length, " hops)");
return Ft.info("Queued energy transfer: ".concat(r, " from ").concat(t.room.name, " to ").concat(e.room.name, " (").concat(a, ", cost: ").concat(o.cost, ")"), {
subsystem: "Terminal"
}), "break";
};
try {
for (var n = (t = void 0, a(s)), i = n.next(); !i.done && "break" !== o(i.value); i = n.next()) ;
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}, l = this;
try {
for (var u = a(i), m = u.next(); !m.done; m = u.next()) c(m.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
}, t.prototype.balanceMinerals = function(e) {
var t, r, o, n, s, c, l = new Map;
try {
for (var u = a(e), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = p.terminal, f = Object.keys(d.store);
try {
for (var y = (o = void 0, a(f)), g = y.next(); !g.done; g = y.next()) {
var h = g.value;
if (h !== RESOURCE_ENERGY) {
var v = d.store.getUsedCapacity(h);
0 !== v && (l.has(h) || l.set(h, []), l.get(h).push({
room: p,
amount: v
}));
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (n = y.return) && n.call(y);
} finally {
if (o) throw o.error;
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
var R = function(e, t) {
if (t.length < 2) return "continue";
t.sort(function(e, t) {
return t.amount - e.amount;
});
var r = t[0], o = t[t.length - 1], n = r.amount - o.amount;
if (n < 5e3) return "continue";
if (E.transferQueue.some(function(t) {
return t.fromRoom === r.room.name && t.toRoom === o.room.name && t.resourceType === e;
})) return "continue";
var a = Math.min(Math.floor(n / 2), r.amount - 1e3);
if (a < 1e3) return "continue";
E.transferQueue.push({
fromRoom: r.room.name,
toRoom: o.room.name,
resourceType: e,
amount: a,
priority: 1
}), Ft.info("Queued mineral transfer: ".concat(a, " ").concat(e, " from ").concat(r.room.name, " to ").concat(o.room.name), {
subsystem: "Terminal"
});
}, E = this;
try {
for (var T = a(l.entries()), C = T.next(); !C.done; C = T.next()) {
var S = i(C.value, 2);
R(S[0], S[1]);
}
} catch (e) {
s = {
error: e
};
} finally {
try {
C && !C.done && (c = T.return) && c.call(T);
} finally {
if (s) throw s.error;
}
}
}, t.prototype.executeTransfers = function(e) {
var t, r;
this.transferQueue.sort(function(e, t) {
return t.priority - e.priority;
});
var o = new Set, n = function(t) {
if (o.has(t.fromRoom)) return "continue";
var r = e.find(function(e) {
return e.name === t.fromRoom;
});
if (!r || !r.terminal) return "continue";
var n = r.terminal;
if (n.cooldown > 0) return "continue";
var a = n.store.getUsedCapacity(t.resourceType);
if (a < t.amount) return Ft.debug("Terminal transfer cancelled: insufficient ".concat(t.resourceType, " in ").concat(t.fromRoom, " (need ").concat(t.amount, ", have ").concat(a, ")"), {
subsystem: "Terminal"
}), i.transferQueue = i.transferQueue.filter(function(e) {
return e !== t;
}), "continue";
var s = t.toRoom;
if (t.route && !t.route.isDirect) {
var c = Lc.getNextHop(t.route, t.fromRoom);
c && (s = c);
}
var l = n.send(t.resourceType, t.amount, s, "Terminal auto-balance".concat(t.isEmergency ? " [EMERGENCY]" : ""));
if (l === OK) {
var u = t.route && !t.route.isDirect, m = s === t.toRoom;
Ft.info("Terminal transfer executed: ".concat(t.amount, " ").concat(t.resourceType, " from ").concat(t.fromRoom, " to ").concat(s).concat(u && !m ? " (hop to ".concat(t.toRoom, ")") : "").concat(t.isEmergency ? " [EMERGENCY]" : ""), {
subsystem: "Terminal"
}), o.add(t.fromRoom), u && !m ? t.fromRoom = s : i.transferQueue = i.transferQueue.filter(function(e) {
return e !== t;
});
} else Ft.warn("Terminal transfer failed: ".concat(l, " for ").concat(t.amount, " ").concat(t.resourceType, " from ").concat(t.fromRoom, " to ").concat(s), {
subsystem: "Terminal"
}), i.transferQueue = i.transferQueue.filter(function(e) {
return e !== t;
});
}, i = this;
try {
for (var s = a(this.transferQueue), c = s.next(); !c.done; c = s.next()) n(c.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
}, t.prototype.queueTransfer = function(e, t, r, o, n) {
void 0 === n && (n = 1), this.transferQueue.push({
fromRoom: e,
toRoom: t,
resourceType: r,
amount: o,
priority: n
});
}, t.prototype.balanceCompoundsAcrossCluster = function(e, t) {
var r, o, n, s, c, l, u, m = new Map;
try {
for (var p = a(e), d = p.next(); !d.done; d = p.next()) {
var f = d.value, y = Game.rooms[f];
if (null == y ? void 0 : y.terminal) try {
for (var g = (n = void 0, a(t)), h = g.next(); !h.done; h = g.next()) {
var v = h.value, R = null !== (u = y.terminal.store[v]) && void 0 !== u ? u : 0;
m.has(v) || m.set(v, []), m.get(v).push({
roomName: f,
amount: R,
terminal: y.terminal
});
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (s = g.return) && s.call(g);
} finally {
if (n) throw n.error;
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
var E = function(e, t) {
var r, o, n, i;
if (t.length < 2) return "continue";
var s = t.reduce(function(e, t) {
return e + t.amount;
}, 0) / t.length;
t.sort(function(e, t) {
return e.amount - t.amount;
});
var c = t.filter(function(e) {
return e.amount < .7 * s;
}), l = t.filter(function(e) {
return e.amount > 1.3 * s;
});
try {
for (var u = (r = void 0, a(l)), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
try {
for (var d = (n = void 0, a(c)), f = d.next(); !f.done; f = d.next()) {
var y = f.value, g = Math.min(Math.floor((p.amount - s) / 2), Math.floor((s - y.amount) / 2), 3e3), h = e === RESOURCE_CATALYZED_UTRIUM_ACID || e === RESOURCE_CATALYZED_KEANIUM_ALKALIDE || e === RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE || e === RESOURCE_CATALYZED_GHODIUM_ACID || e === RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE || e === RESOURCE_CATALYZED_GHODIUM_ALKALIDE;
g >= (h ? 300 : 500) && (T.queueTransfer(p.roomName, y.roomName, e, g, h ? 8 : 5), 
Ft.info("Queued compound balance: ".concat(g, " ").concat(e, " from ").concat(p.roomName, " to ").concat(y.roomName), {
subsystem: "Terminal"
}), p.amount -= g, y.amount += g);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (n) throw n.error;
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
}, T = this;
try {
for (var C = a(m.entries()), S = C.next(); !S.done; S = C.next()) {
var _ = i(S.value, 2);
E(v = _[0], _[1]);
}
} catch (e) {
c = {
error: e
};
} finally {
try {
S && !S.done && (l = C.return) && l.call(C);
} finally {
if (c) throw c.error;
}
}
}, n([ Rr("terminal:manager", "Terminal Manager", {
priority: $t.MEDIUM,
interval: 20,
minBucket: 0,
cpuBudget: .1
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(), Bc = new Fc, Hc = {
minBucket: 0,
minStorageEnergy: 8e4,
inputBufferAmount: 2e3,
outputBufferAmount: 5e3
}, Wc = ((Ec = {})[RESOURCE_UTRIUM_BAR] = ((Tc = {})[RESOURCE_UTRIUM] = 500, Tc[RESOURCE_ENERGY] = 200, 
Tc), Ec[RESOURCE_LEMERGIUM_BAR] = ((Cc = {})[RESOURCE_LEMERGIUM] = 500, Cc[RESOURCE_ENERGY] = 200, 
Cc), Ec[RESOURCE_ZYNTHIUM_BAR] = ((Sc = {})[RESOURCE_ZYNTHIUM] = 500, Sc[RESOURCE_ENERGY] = 200, 
Sc), Ec[RESOURCE_KEANIUM_BAR] = ((_c = {})[RESOURCE_KEANIUM] = 500, _c[RESOURCE_ENERGY] = 200, 
_c), Ec[RESOURCE_GHODIUM_MELT] = ((Oc = {})[RESOURCE_GHODIUM] = 500, Oc[RESOURCE_ENERGY] = 200, 
Oc), Ec[RESOURCE_OXIDANT] = ((bc = {})[RESOURCE_OXYGEN] = 500, bc[RESOURCE_ENERGY] = 200, 
bc), Ec[RESOURCE_REDUCTANT] = ((wc = {})[RESOURCE_HYDROGEN] = 500, wc[RESOURCE_ENERGY] = 200, 
wc), Ec[RESOURCE_PURIFIER] = ((Uc = {})[RESOURCE_CATALYST] = 500, Uc[RESOURCE_ENERGY] = 200, 
Uc), Ec[RESOURCE_BATTERY] = ((xc = {})[RESOURCE_ENERGY] = 600, xc), Ec), Yc = ((Ac = {})[RESOURCE_BATTERY] = 10, 
Ac[RESOURCE_UTRIUM_BAR] = 5, Ac[RESOURCE_LEMERGIUM_BAR] = 5, Ac[RESOURCE_ZYNTHIUM_BAR] = 5, 
Ac[RESOURCE_KEANIUM_BAR] = 5, Ac[RESOURCE_GHODIUM_MELT] = 4, Ac[RESOURCE_OXIDANT] = 3, 
Ac[RESOURCE_REDUCTANT] = 3, Ac[RESOURCE_PURIFIER] = 3, Ac), Kc = function() {
function e(e) {
void 0 === e && (e = {}), this.config = o(o({}, Hc), e);
}
return e.prototype.run = function() {
var e, t;
if (!(Game.cpu.bucket < this.config.minBucket)) {
var r = Object.values(Game.rooms).filter(function(e) {
var t;
return !!(null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_FACTORY;
}
}).length > 0;
});
try {
for (var o = a(r), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
this.processFactory(i);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}
}, e.prototype.processFactory = function(e) {
var t, r, o = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_FACTORY;
}
});
if (0 !== o.length) {
var n = o[0];
if (n && !(n.cooldown > 0)) {
var s = e.storage;
if (s && !(s.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.minStorageEnergy)) {
var c = this.selectProduction(e, n, s);
if (c) {
var l = Wc[c];
if (l) {
var u = !0;
try {
for (var m = a(Object.entries(l)), p = m.next(); !p.done; p = m.next()) {
var d = i(p.value, 2), f = d[0], y = d[1];
if (n.store.getUsedCapacity(f) < y) {
u = !1;
break;
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
p && !p.done && (r = m.return) && r.call(m);
} finally {
if (t) throw t.error;
}
}
if (u) {
var g = n.produce(c);
g === OK ? Ft.info("Factory in ".concat(e.name, " producing ").concat(c), {
subsystem: "Factory"
}) : g !== ERR_TIRED && Ft.debug("Factory production failed in ".concat(e.name, ": ").concat(g), {
subsystem: "Factory"
});
}
}
}
}
}
}
}, e.prototype.selectProduction = function(e, t, r) {
var o, n, s, c, l, u = [];
try {
for (var m = a(Object.entries(Wc)), p = m.next(); !p.done; p = m.next()) {
var d = i(p.value, 2), f = d[0], y = d[1], g = f, h = !0, v = 0;
try {
for (var R = (s = void 0, a(Object.entries(y))), E = R.next(); !E.done; E = R.next()) {
var T = i(E.value, 2), C = T[0], S = T[1], _ = C, O = r.store.getUsedCapacity(_);
if (O < 2 * S) {
h = !1;
break;
}
v += O / (10 * S);
}
} catch (e) {
s = {
error: e
};
} finally {
try {
E && !E.done && (c = R.return) && c.call(R);
} finally {
if (s) throw s.error;
}
}
if (h) {
var b = t.store.getUsedCapacity(g) + r.store.getUsedCapacity(g);
if (!(b > this.config.outputBufferAmount)) {
var w = null !== (l = Yc[g]) && void 0 !== l ? l : 1, U = w * v * (1 - b / this.config.outputBufferAmount);
u.push({
commodity: g,
priority: w,
score: U
});
}
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
return 0 === u.length ? null : (u.sort(function(e, t) {
return t.score - e.score;
}), u[0].commodity);
}, e.prototype.getRequiredInputs = function(e, t) {
var r, o, n = t.storage;
if (!n) return [];
var s = this.selectProduction(t, e, n);
if (!s) return [];
var c = Wc[s];
if (!c) return [];
var l = [];
try {
for (var u = a(Object.entries(c)), m = u.next(); !m.done; m = u.next()) {
var p = i(m.value, 2), d = p[0], f = p[1], y = d, g = e.store.getUsedCapacity(y), h = Math.max(0, this.config.inputBufferAmount - g);
h > 0 && l.push({
resource: y,
amount: Math.min(h, 2 * f)
});
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
return l;
}, e.prototype.hasOutputsToRemove = function(e) {
var t, r;
try {
for (var o = a(Object.keys(Wc)), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
if (e.store.getUsedCapacity(i) > 0) return !0;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
n && !n.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
return !1;
}, e.prototype.canOperateWithoutLabConflict = function(e) {
if (!e.terminal) return !1;
var t = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
return t.filter(function(e) {
return e.cooldown > 0;
}).length < t.length / 2 || 0 === t.length;
}, n([ Rr("factory:manager", "Factory Manager", {
priority: $t.LOW,
interval: 30,
minBucket: 0,
cpuBudget: .05
}) ], e.prototype, "run", null), n([ Cr() ], e);
}(), Vc = new Kc, qc = {
updateInterval: 500,
minBucket: 0,
maxCpuBudget: .02,
trackedResources: [ RESOURCE_ENERGY, RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_GHODIUM ],
highVolatilityThreshold: .3,
opportunityConfidenceThreshold: .7
};

function jc(e) {
return {
name: e,
role: "core",
health: {
cpuCategory: "low",
cpuUsage: 0,
bucketLevel: 1e4,
economyIndex: 50,
warIndex: 0,
commodityIndex: 0,
roomCount: 0,
avgRCL: 0,
creepCount: 0,
lastUpdate: 0
},
activeTasks: [],
portals: [],
cpuHistory: [],
cpuLimit: 0
};
}

function zc(e) {
for (var t = 0, r = 0; r < e.length; r++) t = (t << 5) - t + e.charCodeAt(r), t &= t;
return Math.abs(t);
}

function Xc(e) {
var t, r = {
v: e.version,
s: Object.entries(e.shards).map(function(e) {
var t, r = i(e, 2), o = r[0], n = r[1];
return {
n: o,
r: n.role[0],
h: {
c: n.health.cpuCategory[0],
cu: Math.round(100 * n.health.cpuUsage) / 100,
b: n.health.bucketLevel,
e: Math.round(n.health.economyIndex),
w: Math.round(n.health.warIndex),
m: Math.round(n.health.commodityIndex),
rc: n.health.roomCount,
rl: Math.round(10 * n.health.avgRCL) / 10,
cc: n.health.creepCount,
u: n.health.lastUpdate
},
t: n.activeTasks,
p: n.portals.map(function(e) {
var t;
return {
sr: e.sourceRoom,
sp: "".concat(e.sourcePos.x, ",").concat(e.sourcePos.y),
ts: e.targetShard,
tr: e.targetRoom,
th: e.threatRating,
s: e.isStable ? 1 : 0,
tc: null !== (t = e.traversalCount) && void 0 !== t ? t : 0
};
}),
cl: n.cpuLimit,
ch: (null !== (t = n.cpuHistory) && void 0 !== t ? t : []).slice(-5).map(function(e) {
return {
t: e.tick,
l: e.cpuLimit,
u: Math.round(100 * e.cpuUsed) / 100,
b: e.bucketLevel
};
})
};
}),
g: {
pl: e.globalTargets.targetPowerLevel,
ws: e.globalTargets.mainWarShard,
es: e.globalTargets.primaryEcoShard,
ct: e.globalTargets.colonizationTarget,
en: (null !== (t = e.globalTargets.enemies) && void 0 !== t ? t : []).map(function(e) {
return {
u: e.username,
r: e.rooms,
t: e.threatLevel,
s: e.lastSeen,
a: e.isAlly ? 1 : 0
};
})
},
k: e.tasks.map(function(e) {
return {
i: e.id,
y: e.type[0],
ss: e.sourceShard,
ts: e.targetShard,
tr: e.targetRoom,
rt: e.resourceType,
ra: e.resourceAmount,
p: e.priority,
st: e.status[0],
pr: e.progress
};
}),
ls: e.lastSync
}, o = zc(JSON.stringify(r));
return JSON.stringify({
d: r,
c: o
});
}

function Qc(e) {
var t, r, o, n, s, c, l;
try {
var u = JSON.parse(e), m = zc(JSON.stringify(u.d));
if (u.c !== m) return Jt.warn("InterShardMemory checksum mismatch", {
subsystem: "InterShard",
meta: {
expected: m,
actual: u.c
}
}), null;
var p = u.d, d = {
c: "core",
f: "frontier",
r: "resource",
b: "backup",
w: "war"
}, f = {
l: "low",
m: "medium",
h: "high",
c: "critical"
}, y = {
c: "colonize",
r: "reinforce",
t: "transfer",
e: "evacuate"
}, g = {
p: "pending",
a: "active",
c: "complete",
f: "failed"
}, h = {}, v = p.s;
try {
for (var R = a(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
h[T.n] = {
name: T.n,
role: null !== (o = d[T.r]) && void 0 !== o ? o : "core",
health: {
cpuCategory: null !== (n = f[T.h.c]) && void 0 !== n ? n : "low",
cpuUsage: null !== (s = T.h.cu) && void 0 !== s ? s : 0,
bucketLevel: null !== (c = T.h.b) && void 0 !== c ? c : 1e4,
economyIndex: T.h.e,
warIndex: T.h.w,
commodityIndex: T.h.m,
roomCount: T.h.rc,
avgRCL: T.h.rl,
creepCount: T.h.cc,
lastUpdate: T.h.u
},
activeTasks: T.t,
portals: T.p.map(function(e) {
var t, r = i(e.sp.split(","), 2), o = r[0], n = r[1];
return {
sourceRoom: e.sr,
sourcePos: {
x: parseInt(null != o ? o : "0", 10),
y: parseInt(null != n ? n : "0", 10)
},
targetShard: e.ts,
targetRoom: e.tr,
threatRating: e.th,
lastScouted: 0,
isStable: 1 === e.s,
traversalCount: null !== (t = e.tc) && void 0 !== t ? t : 0
};
}),
cpuLimit: T.cl,
cpuHistory: (null !== (l = T.ch) && void 0 !== l ? l : []).map(function(e) {
return {
tick: e.t,
cpuLimit: e.l,
cpuUsed: e.u,
bucketLevel: e.b
};
})
};
}
} catch (e) {
t = {
error: e
};
} finally {
try {
E && !E.done && (r = R.return) && r.call(R);
} finally {
if (t) throw t.error;
}
}
var C = p.g, S = p.k, _ = {
targetPowerLevel: C.pl
};
return C.ws && (_.mainWarShard = C.ws), C.es && (_.primaryEcoShard = C.es), C.ct && (_.colonizationTarget = C.ct), 
C.en && (_.enemies = C.en.map(function(e) {
return {
username: e.u,
rooms: e.r,
threatLevel: e.t,
lastSeen: e.s,
isAlly: 1 === e.a
};
})), {
version: p.v,
shards: h,
globalTargets: _,
tasks: S.map(function(e) {
var t, r, o = {
id: e.i,
type: null !== (t = y[e.y]) && void 0 !== t ? t : "colonize",
sourceShard: e.ss,
targetShard: e.ts,
priority: e.p,
status: null !== (r = g[e.st]) && void 0 !== r ? r : "pending",
createdAt: 0
};
return e.tr && (o.targetRoom = e.tr), e.rt && (o.resourceType = e.rt), void 0 !== e.ra && (o.resourceAmount = e.ra), 
void 0 !== e.pr && (o.progress = e.pr), o;
}),
lastSync: p.ls,
checksum: u.c
};
} catch (e) {
return Jt.error("Failed to deserialize InterShardMemory: ".concat(String(e)), {
subsystem: "InterShard"
}), null;
}
}

!function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.supplyDemandCache = new Map, this.opportunities = [], 
this.config = o(o({}, qc), e);
}
t.prototype.run = function() {
var e, t, r = Game.cpu.getUsed();
this.lastRun = Game.time;
try {
for (var o = a(this.config.trackedResources), n = o.next(); !n.done; n = o.next()) {
var i = n.value, s = this.analyzeSupplyDemand(i);
s && this.supplyDemandCache.set(i, s);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
this.detectTradingOpportunities();
var c = Game.cpu.getUsed() - r;
Game.time % 1e3 == 0 && Ft.info("Market trend analysis completed in ".concat(c.toFixed(2), " CPU, ").concat(this.opportunities.length, " opportunities detected"), {
subsystem: "MarketTrends"
});
}, t.prototype.analyzeSupplyDemand = function(e) {
var t = Game.market.getAllOrders({
resourceType: e
});
if (0 === t.length) return null;
var r = t.filter(function(e) {
return e.type === ORDER_BUY;
}), o = t.filter(function(e) {
return e.type === ORDER_SELL;
}), n = r.reduce(function(e, t) {
return e + t.amount;
}, 0), a = o.reduce(function(e, t) {
return e + t.amount;
}, 0), i = r.length > 0 ? r.reduce(function(e, t) {
return e + t.price;
}, 0) / r.length : 0, s = o.length > 0 ? o.reduce(function(e, t) {
return e + t.price;
}, 0) / o.length : 0, c = Math.min(100, a / (n + a) * 100), l = Math.min(100, n / (n + a) * 100), u = n + a, m = s > 0 ? (s - i) / s : 0;
return {
resource: e,
supplyScore: c,
demandScore: l,
sentiment: (l - c) / 100,
tightness: 1 - Math.min(1, u / 1e6) * (1 - Math.min(1, 10 * m)),
lastUpdate: Game.time
};
}, t.prototype.detectTradingOpportunities = function() {
var t, r, o, n, i, s, c, l, u, m, p, d = e.memoryManager.getEmpire(), f = [];
try {
for (var y = a(this.config.trackedResources), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = null === (i = d.market) || void 0 === i ? void 0 : i.resources[h];
if (v) {
var R = this.supplyDemandCache.get(h);
if (R) {
-1 === v.trend && R.sentiment < -.3 && (_ = Math.abs(R.sentiment) * (1 - (null !== (s = v.volatility) && void 0 !== s ? s : .5))) >= this.config.opportunityConfidenceThreshold && f.push({
resource: h,
type: "buy",
expectedValue: 1e4 * (v.avgPrice - (null !== (c = v.predictedPrice) && void 0 !== c ? c : v.avgPrice)),
confidence: _,
action: "Buy ".concat(h, " at current price (falling trend, oversupply)"),
urgency: this.calculateUrgency(_, Math.abs(R.sentiment)),
createdAt: Game.time
}), 1 === v.trend && R.sentiment > .3 && (_ = R.sentiment * (1 - (null !== (l = v.volatility) && void 0 !== l ? l : .5))) >= this.config.opportunityConfidenceThreshold && f.push({
resource: h,
type: "sell",
expectedValue: 1e4 * ((null !== (u = v.predictedPrice) && void 0 !== u ? u : v.avgPrice) - v.avgPrice),
confidence: _,
action: "Sell ".concat(h, " at current price (rising trend, high demand)"),
urgency: this.calculateUrgency(_, R.sentiment),
createdAt: Game.time
});
var E = Game.market.getAllOrders({
resourceType: h
}), T = E.filter(function(e) {
return e.type === ORDER_BUY;
}).sort(function(e, t) {
return t.price - e.price;
})[0], C = E.filter(function(e) {
return e.type === ORDER_SELL;
}).sort(function(e, t) {
return e.price - t.price;
})[0];
if (T && C && T.price > 1.1 * C.price) {
var S = (T.price - C.price) * Math.min(T.amount, C.amount), _ = .9;
f.push({
resource: h,
type: "arbitrage",
expectedValue: S,
confidence: _,
action: "Arbitrage ".concat(h, ": buy at ").concat(C.price.toFixed(3), ", sell at ").concat(T.price.toFixed(3)),
urgency: 3,
createdAt: Game.time
});
}
(null !== (m = v.volatility) && void 0 !== m ? m : 0) >= this.config.highVolatilityThreshold && Ft.warn("High volatility detected for ".concat(h, ": ").concat((100 * (null !== (p = v.volatility) && void 0 !== p ? p : 0)).toFixed(1), "%"), {
subsystem: "MarketTrends"
});
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
g && !g.done && (r = y.return) && r.call(y);
} finally {
if (t) throw t.error;
}
}
this.opportunities = f;
try {
for (var O = a(f), b = O.next(); !b.done; b = O.next()) {
var w = b.value;
w.urgency >= 2 && Ft.info("Trading opportunity: ".concat(w.action, ", expected value: ").concat(w.expectedValue.toFixed(0), " credits, confidence: ").concat((100 * w.confidence).toFixed(0), "%"), {
subsystem: "MarketTrends"
});
}
} catch (e) {
o = {
error: e
};
} finally {
try {
b && !b.done && (n = O.return) && n.call(O);
} finally {
if (o) throw o.error;
}
}
}, t.prototype.calculateUrgency = function(e, t) {
var r = e * Math.abs(t);
return r >= .8 ? 3 : r >= .6 ? 2 : r >= .4 ? 1 : 0;
}, t.prototype.getSupplyDemand = function(e) {
return this.supplyDemandCache.get(e);
}, t.prototype.getOpportunities = function() {
return this.opportunities;
}, t.prototype.getOpportunitiesForResource = function(e) {
return this.opportunities.filter(function(t) {
return t.resource === e;
});
}, t.prototype.getUrgentOpportunities = function() {
return this.opportunities.filter(function(e) {
return e.urgency >= 2;
});
}, t.prototype.getMarketSentiment = function(e) {
var t, r = this.supplyDemandCache.get(e);
return null !== (t = null == r ? void 0 : r.sentiment) && void 0 !== t ? t : 0;
}, t.prototype.isMarketTight = function(e) {
var t, r = this.supplyDemandCache.get(e);
return (null !== (t = null == r ? void 0 : r.tightness) && void 0 !== t ? t : 0) > .7;
}, n([ Er("empire:marketTrends", "Market Trend Analyzer", {
priority: $t.LOW,
interval: 500,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), t = n([ Cr() ], t);
}();

var Zc, Jc, $c = 102400;

!function(e) {
e[e.LOW = 0] = "LOW", e[e.MEDIUM = 1] = "MEDIUM", e[e.HIGH = 2] = "HIGH", e[e.CRITICAL = 3] = "CRITICAL";
}(Zc || (Zc = {})), function(e) {
e[e.LOW = 0] = "LOW", e[e.NORMAL = 1] = "NORMAL", e[e.MEDIUM = 2] = "MEDIUM", e[e.HIGH = 3] = "HIGH", 
e[e.CRITICAL = 4] = "CRITICAL", e[e.EMERGENCY = 5] = "EMERGENCY";
}(Jc || (Jc = {}));

var el, tl, rl = {
updateInterval: 100,
minBucket: 0,
maxCpuBudget: .02,
defaultCpuLimit: 20
}, ol = {
core: 1.5,
frontier: .8,
resource: 1,
backup: .5,
war: 1.2
}, nl = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = o(o({}, rl), e), this.interShardMemory = {
version: 1,
shards: {},
globalTargets: {
targetPowerLevel: 0
},
tasks: [],
lastSync: 0,
checksum: 0
};
}
return e.prototype.initialize = function() {
var e, t;
try {
var r = InterShardMemory.getLocal();
if (r) {
var o = Qc(r);
o && (this.interShardMemory = o, Jt.debug("Loaded InterShardMemory", {
subsystem: "Shard"
}));
}
} catch (e) {
var n = e instanceof Error ? e.message : String(e);
Jt.error("Failed to load InterShardMemory: ".concat(n), {
subsystem: "Shard"
});
}
var a = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0";
this.interShardMemory.shards[a] || (this.interShardMemory.shards[a] = jc(a));
}, e.prototype.run = function() {
this.lastRun = Game.time, this.updateCurrentShardHealth(), this.processInterShardTasks(), 
this.scanForPortals(), this.autoAssignShardRole(), Object.keys(this.interShardMemory.shards).length > 1 && this.distributeCpuLimits(), 
this.syncInterShardMemory(), Game.time % 500 == 0 && this.logShardStatus();
}, e.prototype.calculateCommodityIndex = function(e) {
var t, r, o, n, i, s = 0, c = 0;
try {
for (var l = a(e), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = m.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_FACTORY;
}
})[0];
if (p) {
c++, s += 5 * (null !== (i = p.level) && void 0 !== i ? i : 0), p.store.getUsedCapacity() > 0 && (s += 10);
var d = m.storage;
if (d) {
var f = [ RESOURCE_COMPOSITE, RESOURCE_CRYSTAL, RESOURCE_LIQUID, RESOURCE_GHODIUM_MELT, RESOURCE_OXIDANT, RESOURCE_REDUCTANT, RESOURCE_PURIFIER ];
try {
for (var y = (o = void 0, a(f)), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = d.store.getUsedCapacity(h);
v > 0 && (s += Math.min(10, v / 1e3));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (n = y.return) && n.call(y);
} finally {
if (o) throw o.error;
}
}
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
if (0 === c) return 0;
var R = 105 * c;
return s = Math.min(100, s / R * 100), Math.round(s);
}, e.prototype.updateCurrentShardHealth = function() {
var e, t, r, o, n, i, s, c = null !== (i = null === (n = Game.shard) || void 0 === n ? void 0 : n.name) && void 0 !== i ? i : "shard0", l = this.interShardMemory.shards[c];
if (l) {
var u = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), m = Game.cpu.getUsed() / Game.cpu.limit, p = m < .5 ? "low" : m < .75 ? "medium" : m < .9 ? "high" : "critical", d = u.length > 0 ? u.reduce(function(e, t) {
var r, o;
return e + (null !== (o = null === (r = t.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0);
}, 0) / u.length : 0, f = 0;
try {
for (var y = a(u), g = y.next(); !g.done; g = y.next()) {
var h = g.value.storage;
if (h) {
var v = h.store.getUsedCapacity(RESOURCE_ENERGY);
f += Math.min(100, v / 5e3);
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
g && !g.done && (t = y.return) && t.call(y);
} finally {
if (e) throw e.error;
}
}
f = u.length > 0 ? f / u.length : 0;
var R = 0;
try {
for (var E = a(u), T = E.next(); !T.done; T = E.next()) {
var C = T.value.find(FIND_HOSTILE_CREEPS).length;
R += Math.min(100, 10 * C);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
T && !T.done && (o = E.return) && o.call(E);
} finally {
if (r) throw r.error;
}
}
R = u.length > 0 ? R / u.length : 0, l.health = {
cpuCategory: p,
cpuUsage: Math.round(100 * m) / 100,
bucketLevel: Game.cpu.bucket,
economyIndex: Math.round(f),
warIndex: Math.round(R),
commodityIndex: this.calculateCommodityIndex(u),
roomCount: u.length,
avgRCL: Math.round(10 * d) / 10,
creepCount: Object.keys(Game.creeps).length,
lastUpdate: Game.time
};
var S = null !== (s = l.cpuHistory) && void 0 !== s ? s : [];
S.push({
tick: Game.time,
cpuLimit: Game.cpu.limit,
cpuUsed: Game.cpu.getUsed(),
bucketLevel: Game.cpu.bucket
}), l.cpuHistory = S.slice(-10), Game.cpu.shardLimits && (l.cpuLimit = Game.cpu.shardLimits[c]);
}
}, e.prototype.processInterShardTasks = function() {
var e, t, r, o, n = null !== (o = null === (r = Game.shard) || void 0 === r ? void 0 : r.name) && void 0 !== o ? o : "shard0", i = this.interShardMemory.tasks.filter(function(e) {
return e.targetShard === n && "pending" === e.status;
});
try {
for (var s = a(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
switch (l.type) {
case "colonize":
this.handleColonizeTask(l);
break;

case "reinforce":
this.handleReinforceTask(l);
break;

case "transfer":
this.handleTransferTask(l);
break;

case "evacuate":
this.handleEvacuateTask(l);
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = s.return) && t.call(s);
} finally {
if (e) throw e.error;
}
}
this.interShardMemory.tasks = this.interShardMemory.tasks.filter(function(e) {
return "pending" === e.status || "active" === e.status || Game.time - e.createdAt < 5e3;
});
}, e.prototype.handleColonizeTask = function(e) {
var t;
e.status = "active";
var r = null !== (t = e.targetRoom) && void 0 !== t ? t : "unknown";
Jt.info("Processing colonize task: ".concat(r, " from ").concat(e.sourceShard), {
subsystem: "Shard"
});
}, e.prototype.handleReinforceTask = function(e) {
var t;
e.status = "active";
var r = null !== (t = e.targetRoom) && void 0 !== t ? t : "unknown";
Jt.info("Processing reinforce task: ".concat(r, " from ").concat(e.sourceShard), {
subsystem: "Shard"
});
}, e.prototype.handleTransferTask = function(e) {
e.status = "active", Jt.info("Processing transfer task from ".concat(e.sourceShard), {
subsystem: "Shard"
});
}, e.prototype.handleEvacuateTask = function(e) {
var t;
e.status = "active";
var r = null !== (t = e.targetRoom) && void 0 !== t ? t : "unknown";
Jt.info("Processing evacuate task: ".concat(r, " to ").concat(e.targetShard), {
subsystem: "Shard"
});
}, e.prototype.scanForPortals = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = this.interShardMemory.shards[r];
if (o) {
var n = function(e) {
var t, r, n = Game.rooms[e].find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_PORTAL;
}
}), i = function(t) {
var r = t.destination;
if (!r) return "continue";
if ("shard" in r) {
var n = r.shard, a = r.room, i = o.portals.find(function(t) {
return t.sourceRoom === e && t.targetShard === n;
});
if (i) i.lastScouted = Game.time, i.isStable = void 0 === t.ticksToDecay, void 0 !== t.ticksToDecay && (i.decayTick = Game.time + t.ticksToDecay); else {
var s = {
sourceRoom: e,
sourcePos: {
x: t.pos.x,
y: t.pos.y
},
targetShard: n,
targetRoom: a,
threatRating: 0,
lastScouted: Game.time,
isStable: void 0 === t.ticksToDecay,
traversalCount: 0
};
void 0 !== t.ticksToDecay && (s.decayTick = Game.time + t.ticksToDecay), o.portals.push(s), 
Jt.info("Discovered portal in ".concat(e, " to ").concat(n, "/").concat(a), {
subsystem: "Shard"
});
}
}
};
try {
for (var s = (t = void 0, a(n)), c = s.next(); !c.done; c = s.next()) i(c.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
};
for (var i in Game.rooms) n(i);
o.portals = o.portals.filter(function(e) {
return !e.decayTick || e.decayTick > Game.time;
});
}
}, e.prototype.autoAssignShardRole = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = this.interShardMemory.shards[r];
if (o) {
var n = o.health, a = Object.values(this.interShardMemory.shards), i = o.role;
n.warIndex > 50 ? i = "war" : n.roomCount < 3 && n.avgRCL < 4 ? i = "frontier" : n.economyIndex > 70 && n.roomCount >= 3 && n.avgRCL >= 6 ? i = "resource" : a.length > 1 && n.roomCount < 2 && n.avgRCL < 3 ? i = "backup" : n.roomCount >= 2 && n.avgRCL >= 4 && (i = "core"), 
"frontier" === o.role && n.roomCount >= 3 && n.avgRCL >= 5 && (i = "core", Jt.info("Transitioning from frontier to core shard", {
subsystem: "Shard"
})), "war" === o.role && n.warIndex < 20 && (i = n.economyIndex > 70 && n.roomCount >= 3 ? "resource" : n.roomCount >= 2 ? "core" : "frontier", 
Jt.info("War ended, transitioning to ".concat(i), {
subsystem: "Shard"
})), i !== o.role && (o.role = i, Jt.info("Auto-assigned shard role: ".concat(i), {
subsystem: "Shard"
}));
}
}, e.prototype.calculateCpuEfficiency = function(e) {
var t, r;
if (!e.cpuHistory || 0 === e.cpuHistory.length) return 1;
var o = 0;
try {
for (var n = a(e.cpuHistory), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
s.cpuLimit > 0 && (o += s.cpuUsed / s.cpuLimit);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return o / e.cpuHistory.length;
}, e.prototype.calculateShardWeight = function(e, t, r) {
var o = ol[e.role], n = t === r ? Game.cpu.bucket : e.health.bucketLevel;
n < 2e3 ? o *= .8 : n < 5e3 ? o *= .9 : n > 9e3 && (o *= 1.1);
var a = this.calculateCpuEfficiency(e);
return a > .95 ? o *= 1.15 : a < .6 && (o *= .85), "war" === e.role && e.health.warIndex > 50 && (o *= 1.2), 
o;
}, e.prototype.distributeCpuLimits = function() {
var e, t, r, o, n, i;
try {
var s = this.interShardMemory.shards, c = Object.keys(s), l = Game.cpu.shardLimits ? Object.values(Game.cpu.shardLimits).reduce(function(e, t) {
return e + t;
}, 0) : this.config.defaultCpuLimit * c.length, u = null !== (i = null === (n = Game.shard) || void 0 === n ? void 0 : n.name) && void 0 !== i ? i : "shard0", m = {}, p = 0;
try {
for (var d = a(c), f = d.next(); !f.done; f = d.next()) {
var y = s[E = f.value];
if (y) {
var g = this.calculateShardWeight(y, E, u);
m[E] = g, p += g;
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
f && !f.done && (t = d.return) && t.call(d);
} finally {
if (e) throw e.error;
}
}
var h = {};
try {
for (var v = a(c), R = v.next(); !R.done; R = v.next()) {
var E;
m[E = R.value] && (h[E] = Math.max(5, Math.round(m[E] / p * l)));
}
} catch (e) {
r = {
error: e
};
} finally {
try {
R && !R.done && (o = v.return) && o.call(v);
} finally {
if (r) throw r.error;
}
}
if (Game.cpu.shardLimits) {
var T = Game.cpu.shardLimits, C = c.some(function(e) {
var t, r;
return Math.abs((null !== (t = T[e]) && void 0 !== t ? t : 0) - (null !== (r = h[e]) && void 0 !== r ? r : 0)) > 1;
});
C && Game.cpu.setShardLimits(h) === OK && Jt.info("Updated shard CPU limits: ".concat(JSON.stringify(h)), {
subsystem: "Shard"
});
}
} catch (e) {
var S = e instanceof Error ? e.message : String(e);
Jt.debug("Could not set shard limits: ".concat(S), {
subsystem: "Shard"
});
}
}, e.prototype.syncInterShardMemory = function() {
try {
this.interShardMemory.lastSync = Game.time;
var e = this.validateInterShardMemory();
e.valid || (Jt.warn("InterShardMemory validation failed: ".concat(e.errors.join(", ")), {
subsystem: "Shard"
}), this.repairInterShardMemory());
var t = Xc(this.interShardMemory);
if (t.length > $c) {
Jt.warn("InterShardMemory size exceeds limit: ".concat(t.length, "/").concat($c), {
subsystem: "Shard"
}), this.trimInterShardMemory();
var r = Xc(this.interShardMemory);
return r.length > $c ? (Jt.error("InterShardMemory still too large after trim: ".concat(r.length, "/").concat($c), {
subsystem: "Shard"
}), void this.emergencyTrim()) : void InterShardMemory.setLocal(r);
}
InterShardMemory.setLocal(t), Game.time % 50 == 0 && this.verifySyncIntegrity();
} catch (e) {
var o = e instanceof Error ? e.message : String(e);
Jt.error("Failed to sync InterShardMemory: ".concat(o), {
subsystem: "Shard"
}), this.attemptSyncRecovery();
}
}, e.prototype.validateInterShardMemory = function() {
var e, t, r = [];
if ("number" != typeof this.interShardMemory.version && r.push("Invalid version"), 
"object" != typeof this.interShardMemory.shards) r.push("Invalid shards object"); else try {
for (var o = a(Object.entries(this.interShardMemory.shards)), n = o.next(); !n.done; n = o.next()) {
var s = i(n.value, 2), c = s[0], l = s[1];
l.health && "number" == typeof l.health.lastUpdate || r.push("Shard ".concat(c, " has invalid health data")), 
Array.isArray(l.portals) || r.push("Shard ".concat(c, " has invalid portals array")), 
Array.isArray(l.activeTasks) || r.push("Shard ".concat(c, " has invalid activeTasks array"));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
return Array.isArray(this.interShardMemory.tasks) || r.push("Invalid tasks array"), 
"number" != typeof this.interShardMemory.lastSync && r.push("Invalid lastSync"), 
{
valid: 0 === r.length,
errors: r
};
}, e.prototype.repairInterShardMemory = function() {
var e, t;
"number" != typeof this.interShardMemory.version && (this.interShardMemory.version = 1), 
"object" != typeof this.interShardMemory.shards && (this.interShardMemory.shards = {});
try {
for (var r = a(Object.entries(this.interShardMemory.shards)), o = r.next(); !o.done; o = r.next()) {
var n = i(o.value, 2), s = n[0], c = n[1];
c.health && "number" == typeof c.health.lastUpdate || (this.interShardMemory.shards[s] = jc(s)), 
Array.isArray(c.portals) || (c.portals = []), Array.isArray(c.activeTasks) || (c.activeTasks = []);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
o && !o.done && (t = r.return) && t.call(r);
} finally {
if (e) throw e.error;
}
}
Array.isArray(this.interShardMemory.tasks) || (this.interShardMemory.tasks = []), 
this.interShardMemory.globalTargets || (this.interShardMemory.globalTargets = {
targetPowerLevel: 0
}), "number" != typeof this.interShardMemory.lastSync && (this.interShardMemory.lastSync = Game.time), 
Jt.info("Repaired InterShardMemory structure", {
subsystem: "Shard"
});
}, e.prototype.verifySyncIntegrity = function() {
var e, t;
try {
var r = InterShardMemory.getLocal();
if (!r) return void Jt.warn("InterShardMemory verification failed: no data present", {
subsystem: "Shard"
});
var o = Qc(r);
if (!o) return void Jt.warn("InterShardMemory verification failed: deserialization failed", {
subsystem: "Shard"
});
var n = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0";
o.shards[n] || Jt.warn("InterShardMemory verification failed: current shard ".concat(n, " not found"), {
subsystem: "Shard"
});
} catch (e) {
var a = e instanceof Error ? e.message : String(e);
Jt.warn("InterShardMemory verification failed: ".concat(a), {
subsystem: "Shard"
});
}
}, e.prototype.attemptSyncRecovery = function() {
var e, t;
try {
Jt.info("Attempting InterShardMemory recovery", {
subsystem: "Shard"
});
var r = InterShardMemory.getLocal();
if (r) {
var o = Qc(r);
if (o) return this.interShardMemory = o, void Jt.info("Recovered InterShardMemory from storage", {
subsystem: "Shard"
});
}
var n = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0";
this.interShardMemory = {
version: 1,
shards: {},
globalTargets: {
targetPowerLevel: 0
},
tasks: [],
lastSync: 0,
checksum: 0
}, this.interShardMemory.shards[n] = jc(n), Jt.info("Recreated InterShardMemory with current shard only", {
subsystem: "Shard"
});
} catch (e) {
var a = e instanceof Error ? e.message : String(e);
Jt.error("InterShardMemory recovery failed: ".concat(a), {
subsystem: "Shard"
});
}
}, e.prototype.emergencyTrim = function() {
var e, t, r, o = null !== (r = null === (t = Game.shard) || void 0 === t ? void 0 : t.name) && void 0 !== r ? r : "shard0", n = this.interShardMemory.shards[o];
n && (this.interShardMemory.shards = ((e = {})[o] = n, e), this.interShardMemory.tasks = this.interShardMemory.tasks.filter(function(e) {
return e.sourceShard === o || e.targetShard === o;
}), n.portals = n.portals.sort(function(e, t) {
return t.lastScouted - e.lastScouted;
}).slice(0, 10), Jt.warn("Emergency trim applied to InterShardMemory", {
subsystem: "Shard"
}));
}, e.prototype.trimInterShardMemory = function() {
for (var e in this.interShardMemory.tasks = this.interShardMemory.tasks.filter(function(e) {
return "pending" === e.status || "active" === e.status || Game.time - e.createdAt < 1e3;
}), this.interShardMemory.shards) {
var t = this.interShardMemory.shards[e];
t && (t.portals = t.portals.filter(function(e) {
return Game.time - e.lastScouted < 1e4;
}));
}
}, e.prototype.logShardStatus = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = this.interShardMemory.shards[r];
if (o) {
var n = o.health;
Jt.info("Shard ".concat(r, " (").concat(o.role, "): ") + "".concat(n.roomCount, " rooms, RCL ").concat(n.avgRCL, ", ") + "CPU: ".concat(n.cpuCategory, ", Eco: ").concat(n.economyIndex, "%, War: ").concat(n.warIndex, "%"), {
subsystem: "Shard"
});
}
}, e.prototype.createTask = function(e, t, r, o) {
var n, a;
void 0 === o && (o = 50);
var i = null !== (a = null === (n = Game.shard) || void 0 === n ? void 0 : n.name) && void 0 !== a ? a : "shard0", s = {
id: "".concat(Game.time, "-").concat(Math.random().toString(36).substring(2, 11)),
type: e,
sourceShard: i,
targetShard: t,
priority: o,
status: "pending",
createdAt: Game.time
};
r && (s.targetRoom = r), this.interShardMemory.tasks.push(s), Jt.info("Created inter-shard task: ".concat(e, " to ").concat(t), {
subsystem: "Shard"
});
}, e.prototype.getCurrentShardState = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0";
return this.interShardMemory.shards[r];
}, e.prototype.getAllShards = function() {
return Object.values(this.interShardMemory.shards);
}, e.prototype.getPortalsToShard = function(e) {
var t, r, o = null !== (r = null === (t = Game.shard) || void 0 === t ? void 0 : t.name) && void 0 !== r ? r : "shard0", n = this.interShardMemory.shards[o];
return n ? n.portals.filter(function(t) {
return t.targetShard === e;
}) : [];
}, e.prototype.setShardRole = function(e) {
var t, r, o = null !== (r = null === (t = Game.shard) || void 0 === t ? void 0 : t.name) && void 0 !== r ? r : "shard0", n = this.interShardMemory.shards[o];
n && (n.role = e, Jt.info("Set shard role to: ".concat(e), {
subsystem: "Shard"
}));
}, e.prototype.createResourceTransferTask = function(e, t, r, o, n) {
var a, i;
void 0 === n && (n = 50);
var s = null !== (i = null === (a = Game.shard) || void 0 === a ? void 0 : a.name) && void 0 !== i ? i : "shard0", c = {
id: "".concat(Game.time, "-transfer-").concat(Math.random().toString(36).substring(2, 11)),
type: "transfer",
sourceShard: s,
targetShard: e,
targetRoom: t,
resourceType: r,
resourceAmount: o,
priority: n,
status: "pending",
createdAt: Game.time,
progress: 0
};
this.interShardMemory.tasks.push(c), Jt.info("Created resource transfer task: ".concat(o, " ").concat(r, " to ").concat(e, "/").concat(t), {
subsystem: "Shard"
});
}, e.prototype.getOptimalPortalRoute = function(e, t) {
var r, o, n, a, i = null !== (o = null === (r = Game.shard) || void 0 === r ? void 0 : r.name) && void 0 !== o ? o : "shard0", s = this.interShardMemory.shards[i];
if (!s) return null;
var c = s.portals.filter(function(t) {
return t.targetShard === e;
});
if (0 === c.length) return null;
var l = c.map(function(e) {
var r, o = 100;
e.isStable && (o += 50), o -= 15 * e.threatRating, o += Math.min(2 * (null !== (r = e.traversalCount) && void 0 !== r ? r : 0), 20), 
t && (o -= 2 * Game.map.getRoomLinearDistance(t, e.sourceRoom));
var n = Game.time - e.lastScouted;
return n < 1e3 ? o += 10 : n > 5e3 && (o -= 10), {
portal: e,
score: o
};
});
return l.sort(function(e, t) {
return t.score - e.score;
}), null !== (a = null === (n = l[0]) || void 0 === n ? void 0 : n.portal) && void 0 !== a ? a : null;
}, e.prototype.recordPortalTraversal = function(e, t, r) {
var o, n, a, i = null !== (n = null === (o = Game.shard) || void 0 === o ? void 0 : o.name) && void 0 !== n ? n : "shard0", s = this.interShardMemory.shards[i];
if (s) {
var c = s.portals.find(function(r) {
return r.sourceRoom === e && r.targetShard === t;
});
c && (r ? (c.traversalCount = (null !== (a = c.traversalCount) && void 0 !== a ? a : 0) + 1, 
c.threatRating = Math.max(0, c.threatRating - .1)) : c.threatRating = Math.min(3, c.threatRating + .5));
}
}, e.prototype.updateTaskProgress = function(e, t, r) {
var o = this.interShardMemory.tasks.find(function(t) {
return t.id === e;
});
o && (o.progress = Math.min(100, Math.max(0, t)), o.updatedAt = Game.time, r && (o.status = r));
}, e.prototype.getActiveTransferTasks = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0";
return this.interShardMemory.tasks.filter(function(e) {
return !("transfer" !== e.type || e.sourceShard !== r && e.targetShard !== r || "pending" !== e.status && "active" !== e.status);
});
}, e.prototype.cancelTask = function(e) {
var t = this.interShardMemory.tasks.find(function(t) {
return t.id === e;
});
t && (t.status = "failed", t.updatedAt = Game.time, Jt.info("Cancelled task ".concat(e), {
subsystem: "Shard"
}));
}, e.prototype.getSyncStatus = function() {
var e, t, r = Xc(this.interShardMemory).length, o = r / $c * 100, n = Game.time - this.interShardMemory.lastSync, i = r < 92160 && n < 500, s = 0;
try {
for (var c = a(Object.values(this.interShardMemory.shards)), l = c.next(); !l.done; l = c.next()) s += l.value.portals.length;
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
return {
lastSync: this.interShardMemory.lastSync,
ticksSinceSync: n,
memorySize: r,
sizePercent: Math.round(100 * o) / 100,
shardsTracked: Object.keys(this.interShardMemory.shards).length,
activeTasks: this.interShardMemory.tasks.filter(function(e) {
return "pending" === e.status || "active" === e.status;
}).length,
totalPortals: s,
isHealthy: i
};
}, e.prototype.forceSync = function() {
Jt.info("Forcing InterShardMemory sync with validation", {
subsystem: "Shard"
}), this.syncInterShardMemory();
}, e.prototype.getMemoryStats = function() {
var e, t, r = Xc(this.interShardMemory).length, n = Xc(o(o({}, this.interShardMemory), {
tasks: [],
globalTargets: {
targetPowerLevel: 0
}
})).length, i = JSON.stringify(this.interShardMemory.tasks).length, s = 0;
try {
for (var c = a(Object.values(this.interShardMemory.shards)), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
s += JSON.stringify(u.portals).length;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
return {
size: r,
limit: $c,
percent: Math.round(r / $c * 1e4) / 100,
breakdown: {
shards: n,
tasks: i,
portals: s,
other: r - n - i
}
};
}, n([ (Zc.LOW, function(e, t, r) {}) ], e.prototype, "run", null), n([ function(e) {
return e;
} ], e);
}(), al = new nl, il = function() {
function e() {
Memory.crossShardTransfers || (Memory.crossShardTransfers = {
requests: {},
lastUpdate: Game.time
}), this.memory = Memory.crossShardTransfers;
}
return e.prototype.run = function() {
var e, t, r, o;
this.cleanupOldRequests();
var n = al.getActiveTransferTasks();
try {
for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if ("transfer" === c.type && c.resourceType && c.resourceAmount && !this.memory.requests[c.id]) {
var l = null !== (o = null === (r = Game.shard) || void 0 === r ? void 0 : r.name) && void 0 !== o ? o : "shard0";
c.sourceShard === l && this.createTransferRequest(c);
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = i.return) && t.call(i);
} finally {
if (e) throw e.error;
}
}
for (var u in this.memory.requests) {
var m = this.memory.requests[u];
m && this.processTransferRequest(m);
}
this.memory.lastUpdate = Game.time;
}, e.prototype.createTransferRequest = function(e) {
if (e.resourceType && e.resourceAmount && e.targetRoom) {
var t = al.getOptimalPortalRoute(e.targetShard);
if (t) {
var r = this.findSourceRoom(e.resourceType, e.resourceAmount);
if (r) {
var o = {
taskId: e.id,
resourceType: e.resourceType,
amount: e.resourceAmount,
sourceRoom: r,
targetShard: e.targetShard,
targetRoom: e.targetRoom,
portalRoom: t.sourceRoom,
priority: e.priority,
status: "queued",
assignedCreeps: [],
transferred: 0
};
this.memory.requests[e.id] = o, Jt.info("Created transfer request: ".concat(e.resourceAmount, " ").concat(e.resourceType, " from ").concat(r, " to ").concat(e.targetShard, "/").concat(e.targetRoom), {
subsystem: "CrossShardTransfer"
});
} else Jt.warn("No room with sufficient ".concat(e.resourceType, " for transfer"), {
subsystem: "CrossShardTransfer"
});
} else Jt.warn("No portal found to ".concat(e.targetShard, ", cannot create transfer request"), {
subsystem: "CrossShardTransfer"
});
}
}, e.prototype.findSourceRoom = function(e, t) {
var r, o, n = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.terminal && e.storage;
});
try {
for (var i = a(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = c.terminal, u = c.storage;
if (l && l.store.getUsedCapacity(e) >= t) return c.name;
if (u && u.store.getUsedCapacity(e) >= t) return c.name;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
return null;
}, e.prototype.processTransferRequest = function(e) {
switch (e.status) {
case "queued":
this.handleQueuedRequest(e);
break;

case "gathering":
this.handleGatheringRequest(e);
break;

case "moving":
this.handleMovingRequest(e);
break;

case "transferring":
this.handleTransferringRequest(e);
}
var t = Math.round(e.transferred / e.amount * 100);
al.updateTaskProgress(e.taskId, t);
}, e.prototype.handleQueuedRequest = function(e) {
var t, r = e.amount - e.transferred, o = e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
}), n = o.reduce(function(e, t) {
return e + t.carryCapacity;
}, 0);
if (n >= r) return e.status = "gathering", void Jt.info("Transfer request ".concat(e.taskId, " moving to gathering phase"), {
subsystem: "CrossShardTransfer"
});
var a = Game.rooms[e.sourceRoom];
if (a && (null === (t = a.controller) || void 0 === t ? void 0 : t.my)) {
var i, s = r - n;
a.energyCapacityAvailable;
try {
i = {
parts: [ WORK, CARRY, MOVE ]
};
} catch (e) {
return void Jt.error("Failed to optimize body for crossShardCarrier: ".concat(String(e)), {
subsystem: "CrossShardTransfer"
});
}
var c = 50 * i.parts.filter(function(e) {
return e === CARRY;
}).length, l = Math.ceil(s / c), u = Math.min(l, 3);
e.priority >= 80 ? Jc.HIGH : e.priority >= 50 ? Jc.NORMAL : Jc.LOW;
for (var m = 0; m < u; m++) e.taskId, e.portalRoom, e.targetShard, "crossShardCarrier_".concat(e.taskId, "_").concat(m, "_").concat(Game.time), 
e.sourceRoom, Game.time, e.targetRoom, Jt.info("Requested spawn of crossShardCarrier for transfer ".concat(e.taskId, " (").concat(m + 1, "/").concat(u, ")"), {
subsystem: "CrossShardTransfer"
});
Jt.debug("Transfer request ".concat(e.taskId, " needs ").concat(s, " carry capacity, requested ").concat(u, " carriers"), {
subsystem: "CrossShardTransfer"
});
} else Jt.warn("Source room ".concat(e.sourceRoom, " not available for spawning carriers"), {
subsystem: "CrossShardTransfer"
});
}, e.prototype.handleGatheringRequest = function(e) {
var t = e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
});
0 !== t.length ? t.every(function(t) {
return t.store.getUsedCapacity(e.resourceType) > 0;
}) && (e.status = "moving", Jt.info("Transfer request ".concat(e.taskId, " moving to portal"), {
subsystem: "CrossShardTransfer"
})) : e.status = "queued";
}, e.prototype.handleMovingRequest = function(e) {
var t = e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
});
if (0 === t.length) return e.status = "failed", void al.updateTaskProgress(e.taskId, e.transferred, "failed");
t.filter(function(t) {
return t.room.name === e.portalRoom;
}).length > 0 && (e.status = "transferring", Jt.info("Transfer request ".concat(e.taskId, " reached portal, transferring"), {
subsystem: "CrossShardTransfer"
}));
}, e.prototype.handleTransferringRequest = function(e) {
var t = e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
});
0 === t.length && (e.status = "complete", e.transferred = e.amount, al.updateTaskProgress(e.taskId, 100, "complete"), 
al.recordPortalTraversal(e.portalRoom, e.targetShard, !0), Jt.info("Transfer request ".concat(e.taskId, " completed"), {
subsystem: "CrossShardTransfer"
}));
}, e.prototype.cleanupOldRequests = function() {
for (var e in this.memory.requests) {
var t = this.memory.requests[e];
t && ("complete" === t.status || "failed" === t.status) && Game.time - this.memory.lastUpdate > 5e3 && delete this.memory.requests[e];
}
}, e.prototype.getCreepRequest = function(e) {
for (var t in this.memory.requests) {
var r = this.memory.requests[t];
if (r && r.assignedCreeps.includes(e)) return r;
}
return null;
}, e.prototype.assignCreep = function(e, t) {
var r = this.memory.requests[e];
r && !r.assignedCreeps.includes(t) && (r.assignedCreeps.push(t), Jt.info("Assigned creep ".concat(t, " to transfer request ").concat(e), {
subsystem: "CrossShardTransfer"
}));
}, e.prototype.getActiveRequests = function() {
return Object.values(this.memory.requests).filter(function(e) {
return "complete" !== e.status && "failed" !== e.status;
});
}, e.prototype.getPrioritizedRequests = function() {
return this.getActiveRequests().filter(function(e) {
return "queued" === e.status;
}).sort(function(e, t) {
return t.priority - e.priority;
});
}, e;
}(), sl = new il, cl = {
updateInterval: 50,
minBucket: 0,
maxCpuBudget: .01
}, ll = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = o(o({}, cl), e);
}
return t.prototype.run = function() {
this.lastRun = Game.time;
var e = InterShardMemory.getLocal();
if (e) {
var t = Qc(e);
if (t) {
this.updateEnemyIntelligence(t);
var r = Xc(t);
InterShardMemory.setLocal(r);
}
}
}, t.prototype.updateEnemyIntelligence = function(t) {
var r, o, n, i;
if (t) {
var s = e.memoryManager.getEmpire(), c = new Map;
if (t.globalTargets.enemies) try {
for (var l = a(t.globalTargets.enemies), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
c.set(m.username, m);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
if (s.warTargets) try {
for (var p = a(s.warTargets), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
(g = c.get(f)) ? (g.lastSeen = Game.time, g.threatLevel = Math.max(g.threatLevel, 1)) : c.set(f, {
username: f,
rooms: [],
threatLevel: 1,
lastSeen: Game.time,
isAlly: !1
});
}
} catch (e) {
n = {
error: e
};
} finally {
try {
d && !d.done && (i = p.return) && i.call(p);
} finally {
if (n) throw n.error;
}
}
if (s.knownRooms) for (var y in s.knownRooms) {
var g, h = s.knownRooms[y];
h && h.owner && !h.owner.includes("Source Keeper") && ((g = c.get(h.owner)) ? (g.rooms.includes(y) || g.rooms.push(y), 
g.lastSeen = Math.max(g.lastSeen, h.lastSeen), g.threatLevel = Math.max(g.threatLevel, h.threatLevel)) : c.set(h.owner, {
username: h.owner,
rooms: [ y ],
threatLevel: h.threatLevel,
lastSeen: h.lastSeen,
isAlly: !1
}));
}
if (t.globalTargets.enemies = Array.from(c.values()), Game.time % 500 == 0) {
var v = t.globalTargets.enemies.length, R = t.globalTargets.enemies.filter(function(e) {
return e.threatLevel >= 2;
}).length;
Me.info("Cross-shard intel: ".concat(v, " enemies tracked, ").concat(R, " high threat"), {
subsystem: "CrossShardIntel"
});
}
}
}, t.prototype.getGlobalEnemies = function() {
var e = InterShardMemory.getLocal();
if (!e) return [];
var t = Qc(e);
return t && t.globalTargets.enemies || [];
}, n([ Er("empire:crossShardIntel", "Cross-Shard Intel", {
priority: $t.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .01
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(), ul = new ll, ml = {
updateInterval: 30,
minBucket: 0,
maxCpuBudget: .05,
minGclForExpansion: 2,
maxExpansionDistance: 10,
minExpansionScore: 50,
intelRefreshInterval: 100,
minStableRcl: 4,
gclNotifyThreshold: 90,
roomDiscoveryInterval: 100,
maxRoomDiscoveryDistance: 5,
maxRoomsToDiscoverPerTick: 50
}, pl = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = o(o({}, ml), e);
}
return t.prototype.run = function() {
var t = this, r = Game.cpu.getUsed(), o = e.memoryManager.getEmpire();
this.lastRun = Game.time, o.lastUpdate = Game.time, tn.measureSubsystem("empire:expansion", function() {
t.updateExpansionQueue(o);
}), tn.measureSubsystem("empire:powerBanks", function() {
t.updatePowerBanks(o);
}), tn.measureSubsystem("empire:warTargets", function() {
t.updateWarTargets(o);
}), tn.measureSubsystem("empire:objectives", function() {
t.updateObjectives(o);
}), tn.measureSubsystem("empire:intelRefresh", function() {
t.refreshRoomIntel(o);
}), tn.measureSubsystem("empire:roomDiscovery", function() {
t.discoverNearbyRooms(o);
}), tn.measureSubsystem("empire:gclTracking", function() {
t.trackGCLProgress(o);
}), tn.measureSubsystem("empire:expansionReadiness", function() {
t.checkExpansionReadiness(o);
}), tn.measureSubsystem("empire:nukeCandidates", function() {
t.refreshNukeCandidates(o);
}), tn.measureSubsystem("empire:clusterHealth", function() {
t.monitorClusterHealth();
}), tn.measureSubsystem("empire:powerBankProfitability", function() {
t.assessPowerBankProfitability(o);
});
var n = Game.cpu.getUsed() - r;
Game.time % 100 == 0 && Me.info("Empire tick completed in ".concat(n.toFixed(2), " CPU"), {
subsystem: "Empire"
});
}, t.prototype.cleanupClaimQueue = function(e, t) {
var r = e.claimQueue.length;
e.claimQueue = e.claimQueue.filter(function(e) {
return !t.has(e.roomName) || (Me.info("Removing ".concat(e.roomName, " from claim queue - now owned"), {
subsystem: "Empire"
}), !1);
}), e.claimQueue.length < r && Me.info("Cleaned up claim queue: removed ".concat(r - e.claimQueue.length, " owned room(s)"), {
subsystem: "Empire"
});
}, t.prototype.updateExpansionQueue = function(e) {
var t, r, o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), n = new Set(o.map(function(e) {
return e.name;
})), i = Game.gcl.level, s = Object.values(Game.spawns);
if (s.length > 0 && s[0].owner) {
var c = s[0].owner.username;
try {
for (var l = a(o), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
(f = e.knownRooms[m.name]) && f.owner !== c && (f.owner = c, Me.info("Updated room intel for ".concat(m.name, " - now owned by ").concat(c), {
subsystem: "Empire"
}));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
}
if (this.cleanupClaimQueue(e, n), !(o.length >= i || i < this.config.minGclForExpansion || e.objectives.expansionPaused)) {
var p = [];
for (var d in e.knownRooms) {
var f;
if (!(f = e.knownRooms[d]).owner && !f.reserver && f.scouted) {
var y = this.scoreExpansionCandidate(f, o);
y >= this.config.minExpansionScore && p.push({
roomName: f.name,
score: y,
distance: this.getMinDistanceToOwned(f.name, o),
claimed: !1,
lastEvaluated: Game.time
});
}
}
p.sort(function(e, t) {
return t.score - e.score;
}), e.claimQueue = p.slice(0, 10), p.length > 0 && Game.time % 100 == 0 && Me.info("Expansion queue updated: ".concat(p.length, " candidates, top score: ").concat(p[0].score), {
subsystem: "Empire"
});
}
}, t.prototype.scoreExpansionCandidate = function(e, t) {
var r = 0;
2 === e.sources ? r += 40 : 1 === e.sources && (r += 20), r += Or(e.mineralType);
var o = this.getMinDistanceToOwned(e.name, t);
return o > this.config.maxExpansionDistance ? 0 : (r -= 5 * o, r -= br(e.name), 
r -= 15 * e.threatLevel, r += wr(e.terrain), Ur(e.name) && (r += 10), r += xr(e.name), 
e.controllerLevel > 0 && !e.owner && (r += 2 * e.controllerLevel), r += Ar(e.name, t, o), 
e.isHighway ? 0 : (e.isSK && (r -= 50), Math.max(0, r)));
}, t.prototype.getMinDistanceToOwned = function(e, t) {
var r, o, n = 1 / 0;
try {
for (var i = a(t), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(e, c.name);
l < n && (n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
return n;
}, t.prototype.updatePowerBanks = function(e) {
var t;
e.powerBanks = e.powerBanks.filter(function(e) {
return e.decayTick > Game.time;
});
var r = function(r) {
var o, n, i = Game.rooms[r].find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_BANK;
}
}), s = function(o) {
e.powerBanks.find(function(e) {
return e.roomName === r && e.pos.x === o.pos.x && e.pos.y === o.pos.y;
}) || (e.powerBanks.push({
roomName: r,
pos: {
x: o.pos.x,
y: o.pos.y
},
power: o.power,
decayTick: Game.time + (null !== (t = o.ticksToDecay) && void 0 !== t ? t : 5e3),
active: !1
}), Me.info("Power bank discovered in ".concat(r, ": ").concat(o.power, " power"), {
subsystem: "Empire"
}));
};
try {
for (var c = (o = void 0, a(i)), l = c.next(); !l.done; l = c.next()) s(l.value);
} catch (e) {
o = {
error: e
};
} finally {
try {
l && !l.done && (n = c.return) && n.call(c);
} finally {
if (o) throw o.error;
}
}
};
for (var o in Game.rooms) r(o);
}, t.prototype.updateWarTargets = function(e) {
if (e.warTargets = e.warTargets.filter(function(t) {
var r, o, n = e.knownRooms[t];
return !!n && n.owner !== (null !== (o = null === (r = Object.values(Game.spawns)[0]) || void 0 === r ? void 0 : r.owner.username) && void 0 !== o ? o : "");
}), e.objectives.warMode) for (var t in e.knownRooms) {
var r = e.knownRooms[t];
r.threatLevel >= 2 && !e.warTargets.includes(t) && (e.warTargets.push(t), Me.warn("Added war target: ".concat(t, " (threat level ").concat(r.threatLevel, ")"), {
subsystem: "Empire"
}));
}
}, t.prototype.updateObjectives = function(e) {
var t = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
e.objectives.targetRoomCount = Game.gcl.level, e.objectives.targetPowerLevel = Math.min(25, 3 * t.length), 
e.warTargets.length > 0 && !e.objectives.warMode && (e.objectives.warMode = !0, 
Me.warn("War mode enabled due to active war targets", {
subsystem: "Empire"
})), 0 === e.warTargets.length && e.objectives.warMode && (e.objectives.warMode = !1, 
Me.info("War mode disabled - no active war targets", {
subsystem: "Empire"
}));
}, t.prototype.getNextExpansionTarget = function() {
var t = e.memoryManager.getEmpire().claimQueue.filter(function(e) {
return !e.claimed;
});
return t.length > 0 ? t[0] : null;
}, t.prototype.markExpansionClaimed = function(t) {
var r = e.memoryManager.getEmpire().claimQueue.find(function(e) {
return e.roomName === t;
});
r && (r.claimed = !0, Me.info("Marked expansion target as claimed: ".concat(t), {
subsystem: "Empire"
}));
}, t.prototype.refreshRoomIntel = function(e) {
if (Game.time % this.config.intelRefreshInterval === 0) {
var t = 0;
for (var r in Game.rooms) {
var o = Game.rooms[r];
e.knownRooms[r] ? (this.updateRoomIntel(e.knownRooms[r], o), t++) : (e.knownRooms[r] = this.createRoomIntel(o), 
t++);
}
t > 0 && Game.time % 500 == 0 && Me.info("Refreshed intel for ".concat(t, " rooms"), {
subsystem: "Empire"
});
}
}, t.prototype.discoverNearbyRooms = function(e) {
var t, r, o, n;
if (Game.time % this.config.roomDiscoveryInterval === 0) {
var i = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (0 !== i.length) {
var s = 0;
try {
for (var c = a(i), l = c.next(); !l.done; l = c.next()) {
var u = Ir(l.value.name, this.config.maxRoomDiscoveryDistance);
try {
for (var m = (o = void 0, a(u)), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (s >= this.config.maxRoomsToDiscoverPerTick) return void Me.debug("Reached discovery limit of ".concat(this.config.maxRoomsToDiscoverPerTick, " rooms per tick"), {
subsystem: "Empire"
});
e.knownRooms[d] || (e.knownRooms[d] = this.createStubIntel(d), s++);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
s > 0 && Me.info("Discovered ".concat(s, " nearby rooms for scouting"), {
subsystem: "Empire"
});
}
}
}, t.prototype.createStubIntel = function(e) {
var t = kr(e);
return {
name: e,
lastSeen: 0,
sources: 0,
controllerLevel: 0,
threatLevel: 0,
scouted: !1,
terrain: "mixed",
isHighway: !!t && (t.x % 10 == 0 || t.y % 10 == 0),
isSK: !!t && !(t.x % 10 != 4 && t.x % 10 != 5 && t.x % 10 != 6 || t.y % 10 != 4 && t.y % 10 != 5 && t.y % 10 != 6)
};
}, t.prototype.createRoomIntel = function(e) {
for (var t, r, o, n = e.find(FIND_SOURCES), a = e.find(FIND_MINERALS)[0], i = e.controller, s = 0, c = 0, l = new Room.Terrain(e.name), u = 0; u < 50; u++) for (var m = 0; m < 50; m++) {
var p = l.get(u, m);
p === TERRAIN_MASK_SWAMP ? c++ : 0 === p && s++;
}
var d = c > s ? "swamp" : s > c ? "plains" : "mixed";
return {
name: e.name,
lastSeen: Game.time,
sources: n.length,
controllerLevel: null !== (t = null == i ? void 0 : i.level) && void 0 !== t ? t : 0,
owner: null === (r = null == i ? void 0 : i.owner) || void 0 === r ? void 0 : r.username,
reserver: null === (o = null == i ? void 0 : i.reservation) || void 0 === o ? void 0 : o.username,
mineralType: null == a ? void 0 : a.mineralType,
threatLevel: 0,
scouted: !0,
terrain: d,
isHighway: !1,
isSK: !1,
towerCount: e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER;
}
}).length,
spawnCount: e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_SPAWN;
}
}).length
};
}, t.prototype.updateRoomIntel = function(e, t) {
var r, o, n;
e.lastSeen = Game.time;
var a = t.controller;
a && (e.controllerLevel = null !== (r = a.level) && void 0 !== r ? r : 0, e.owner = null === (o = a.owner) || void 0 === o ? void 0 : o.username, 
e.reserver = null === (n = a.reservation) || void 0 === n ? void 0 : n.username);
var i = t.find(FIND_HOSTILE_CREEPS).filter(function(e) {
return e.body.some(function(e) {
return e.type === ATTACK || e.type === RANGED_ATTACK || e.type === WORK;
});
});
i.length >= 5 ? e.threatLevel = 3 : i.length >= 2 ? e.threatLevel = 2 : i.length > 0 ? e.threatLevel = 1 : e.threatLevel = 0, 
e.towerCount = t.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER;
}
}).length, e.spawnCount = t.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_SPAWN;
}
}).length;
}, t.prototype.trackGCLProgress = function(e) {
var t = Game.gcl.progress / Game.gcl.progressTotal * 100;
t >= this.config.gclNotifyThreshold && Game.time % 500 == 0 && Me.info("GCL ".concat(Game.gcl.level, " progress: ").concat(t.toFixed(1), "% (").concat(Game.gcl.progress, "/").concat(Game.gcl.progressTotal, ")"), {
subsystem: "Empire"
}), e.objectives.targetRoomCount = Game.gcl.level;
}, t.prototype.checkExpansionReadiness = function(e) {
var t = this, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (!(r.length >= Game.gcl.level)) {
var o = r.filter(function(e) {
var r, o, n = null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0, a = void 0 !== e.storage;
return n >= t.config.minStableRcl && a;
});
if (0 !== o.length) {
var n = o.reduce(function(e, t) {
var r, o;
return e + (null !== (o = null === (r = t.storage) || void 0 === r ? void 0 : r.store[RESOURCE_ENERGY]) && void 0 !== o ? o : 0);
}, 0), a = n / o.length;
a < 5e4 ? e.objectives.expansionPaused || (e.objectives.expansionPaused = !0, Me.info("Expansion paused: insufficient energy reserves (".concat(a.toFixed(0), " < ").concat(5e4, ")"), {
subsystem: "Empire"
})) : e.objectives.expansionPaused && (e.objectives.expansionPaused = !1, Me.info("Expansion resumed: ".concat(o.length, " stable rooms with ").concat(a.toFixed(0), " avg energy"), {
subsystem: "Empire"
}));
} else e.objectives.expansionPaused || (e.objectives.expansionPaused = !0, Me.info("Expansion paused: waiting for stable room (RCL >= 4 with storage)", {
subsystem: "Empire"
}));
}
}, t.prototype.refreshNukeCandidates = function(e) {
var t, r;
if (Game.time % 500 == 0 && (e.nukeCandidates = e.nukeCandidates.filter(function(e) {
return !(e.launched && Game.time - e.launchTick > 5e4);
}), e.objectives.warMode && 0 !== e.warTargets.length)) {
var o = function(t) {
var r = e.knownRooms[t];
if (!r || !r.scouted) return "continue";
var o = e.nukeCandidates.find(function(e) {
return e.roomName === t;
});
if (o && !o.launched) return "continue";
var a = n.scoreNukeCandidate(r);
a >= 50 && (e.nukeCandidates.push({
roomName: t,
score: a,
launched: !1,
launchTick: 0
}), Me.info("Added nuke candidate: ".concat(t, " (score: ").concat(a, ")"), {
subsystem: "Empire"
}));
}, n = this;
try {
for (var i = a(e.warTargets), s = i.next(); !s.done; s = i.next()) o(s.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
e.nukeCandidates.sort(function(e, t) {
return t.score - e.score;
}), e.nukeCandidates = e.nukeCandidates.slice(0, 10);
}
}, t.prototype.scoreNukeCandidate = function(e) {
var t, r, o = 0;
return o += 10 * e.controllerLevel, o += 15 * (null !== (t = e.towerCount) && void 0 !== t ? t : 0), 
o += 20 * (null !== (r = e.spawnCount) && void 0 !== r ? r : 0), e.isSK || e.isHighway ? 0 : o;
}, t.prototype.monitorClusterHealth = function() {
if (Game.time % 50 == 0) {
var t = e.memoryManager.getClusters(), r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), o = function(e) {
var o = t[e], n = r.filter(function(e) {
return o.memberRooms.includes(e.name);
});
if (0 === n.length) return "continue";
var a = n.reduce(function(e, t) {
var r, o, n, a;
return e + (null !== (o = null === (r = t.storage) || void 0 === r ? void 0 : r.store[RESOURCE_ENERGY]) && void 0 !== o ? o : 0) + (null !== (a = null === (n = t.terminal) || void 0 === n ? void 0 : n.store[RESOURCE_ENERGY]) && void 0 !== a ? a : 0);
}, 0), i = a / n.length, s = Game.cpu.getUsed() / r.length, c = s > 2;
i < 3e4 && Game.time % 500 == 0 && Me.warn("Cluster ".concat(e, " has low energy: ").concat(i.toFixed(0), " avg (threshold: 30000)"), {
subsystem: "Empire"
}), c && Game.time % 500 == 0 && Me.warn("Cluster ".concat(e, " has high CPU usage: ").concat(s.toFixed(2), " per room"), {
subsystem: "Empire"
}), o.metrics || (o.metrics = {
energyIncome: 0,
energyConsumption: 0,
energyBalance: 0,
warIndex: 0,
economyIndex: 0
});
var l = Math.min(100, i / 1e5 * 100), u = n.length / o.memberRooms.length * 100;
o.metrics.economyIndex = Math.round((l + u) / 2), o.metrics.economyIndex < 40 && Game.time % 500 == 0 && Me.warn("Cluster ".concat(e, " economy index low: ").concat(o.metrics.economyIndex, " - consider rebalancing"), {
subsystem: "Empire"
});
};
for (var n in t) o(n);
}
}, t.prototype.assessPowerBankProfitability = function(e) {
var t, r, o, n, i, s;
if (Game.time % 100 == 0) {
var c = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (0 !== c.length) try {
for (var l = a(e.powerBanks), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!m.active) {
var p = 1 / 0, d = null;
try {
for (var f = (o = void 0, a(c)), y = f.next(); !y.done; y = f.next()) {
var g = y.value, h = Game.map.getRoomLinearDistance(g.name, m.roomName);
h < p && (p = h, d = g);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (n = f.return) && n.call(f);
} finally {
if (o) throw o.error;
}
}
if (d) {
var v = m.decayTick - Game.time, R = 50 * p * 2 + m.power / 2, E = v > 1.5 * R && p <= 5 && m.power >= 1e3 && (null !== (s = null === (i = d.controller) || void 0 === i ? void 0 : i.level) && void 0 !== s ? s : 0) >= 7;
E || Game.time % 500 != 0 ? E && Game.time % 500 == 0 && Me.info("Profitable power bank in ".concat(m.roomName, ": ") + "power=".concat(m.power, ", distance=").concat(p, ", timeRemaining=").concat(v), {
subsystem: "Empire"
}) : Me.debug("Power bank in ".concat(m.roomName, " not profitable: ") + "power=".concat(m.power, ", distance=").concat(p, ", timeRemaining=").concat(v, ", ") + "requiredTime=".concat(R.toFixed(0)), {
subsystem: "Empire"
});
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
}
}, n([ Er("empire:manager", "Empire Manager", {
priority: $t.MEDIUM,
interval: 30,
minBucket: 0,
cpuBudget: .05
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(), dl = new pl, fl = {
updateInterval: 200,
minBucket: 0,
minCreditsForPixels: 5e5,
creditReserve: 1e5,
minEnergySurplus: 5e5,
energyThresholdPerRoom: 1e5,
maxPixelPrice: 5e3,
targetPixelPrice: 2e3,
maxPixelsPerTransaction: 10,
purchaseCooldown: 1e3,
minBaseMineralReserve: 1e4,
criticalResourceThresholds: (el = {}, el[RESOURCE_GHODIUM] = 5e3, el),
enabled: !0
}, yl = function() {
function e(e, t) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = o(o({}, fl), e), this.memoryAccessor = t;
}
return e.prototype.setMemoryAccessor = function(e) {
this.memoryAccessor = e;
}, e.prototype.run = function() {
this.config.enabled && (this.lastRun = Game.time, this.memoryAccessor && this.memoryAccessor.ensurePixelBuyingMemory(), 
this.isPurchaseCooldownComplete() && (this.hasSurplusResources() ? this.hasEnoughCredits() ? (this.attemptPixelPurchase(), 
this.updateMemory()) : Me.debug("Pixel buying skipped: insufficient credits", {
subsystem: "PixelBuying"
}) : Me.debug("Pixel buying skipped: no resource surplus", {
subsystem: "PixelBuying"
})));
}, e.prototype.getPixelBuyingMemory = function() {
var e;
return null === (e = this.memoryAccessor) || void 0 === e ? void 0 : e.getPixelBuyingMemory();
}, e.prototype.isPurchaseCooldownComplete = function() {
var e = this.getPixelBuyingMemory();
return !e || Game.time - e.lastPurchaseTick >= this.config.purchaseCooldown;
}, e.prototype.hasSurplusResources = function() {
var e, t, r, o, n, s, c = this.calculateTotalResources(), l = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}).length, u = l * this.config.energyThresholdPerRoom;
if (c.energy < u + this.config.minEnergySurplus) return Me.debug("Pixel buying: energy below surplus (".concat(c.energy, " < ").concat(u + this.config.minEnergySurplus, ")"), {
subsystem: "PixelBuying"
}), !1;
try {
for (var m = a(Object.entries(this.config.criticalResourceThresholds)), p = m.next(); !p.done; p = m.next()) {
var d = i(p.value, 2), f = d[0], y = d[1];
if ((R = null !== (n = c[f]) && void 0 !== n ? n : 0) < y) return Me.debug("Pixel buying: ".concat(f, " below threshold (").concat(R, " < ").concat(y, ")"), {
subsystem: "PixelBuying"
}), !1;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
p && !p.done && (t = m.return) && t.call(m);
} finally {
if (e) throw e.error;
}
}
var g = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
try {
for (var h = a(g), v = h.next(); !v.done; v = h.next()) {
var R, E = v.value;
if ((R = null !== (s = c[E]) && void 0 !== s ? s : 0) < this.config.minBaseMineralReserve) return Me.debug("Pixel buying: ".concat(E, " below reserve (").concat(R, " < ").concat(this.config.minBaseMineralReserve, ")"), {
subsystem: "PixelBuying"
}), !1;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
v && !v.done && (o = h.return) && o.call(h);
} finally {
if (r) throw r.error;
}
}
return !0;
}, e.prototype.hasEnoughCredits = function() {
return Game.market.credits - this.config.creditReserve >= this.config.minCreditsForPixels;
}, e.prototype.calculateTotalResources = function() {
var e, t, r, o, n, a = {};
for (var i in Game.rooms) {
var s = Game.rooms[i];
if (null === (e = s.controller) || void 0 === e ? void 0 : e.my) {
if (s.terminal) for (var c in s.terminal.store) a[l = c] = (null !== (t = a[l]) && void 0 !== t ? t : 0) + (null !== (r = s.terminal.store[l]) && void 0 !== r ? r : 0);
if (s.storage) for (var c in s.storage.store) {
var l;
a[l = c] = (null !== (o = a[l]) && void 0 !== o ? o : 0) + (null !== (n = s.storage.store[l]) && void 0 !== n ? n : 0);
}
}
}
return a;
}, e.prototype.attemptPixelPurchase = function() {
var e = this, t = Game.market.getAllOrders({
type: ORDER_SELL,
resourceType: PIXEL
});
if (0 !== t.length) {
var r = t.filter(function(t) {
return t.price <= e.config.maxPixelPrice && t.amount > 0;
}).sort(function(e, t) {
return e.price - t.price;
});
if (0 !== r.length) {
var o = r[0], n = o.price <= this.config.targetPixelPrice;
if (n || Game.time % 1e3 == 0) {
var a = Object.values(Game.rooms).find(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && !e.terminal.cooldown;
});
if (null == a ? void 0 : a.terminal) {
var i = Game.market.credits - this.config.creditReserve, s = Math.floor(i / o.price), c = Math.min(this.config.maxPixelsPerTransaction, o.amount, s);
if (c <= 0) Me.debug("Cannot afford any pixels after reserve", {
subsystem: "PixelBuying"
}); else {
var l = o.roomName ? Game.market.calcTransactionCost(c, a.name, o.roomName) : 0;
if (a.terminal.store[RESOURCE_ENERGY] < l) Me.debug("Not enough energy for pixel transaction (need ".concat(l, ")"), {
subsystem: "PixelBuying"
}); else {
var u = Game.market.deal(o.id, c, a.name);
if (u === OK) {
var m = c * o.price;
this.recordPurchase({
tick: Game.time,
amount: c,
pricePerUnit: o.price,
totalCost: m,
orderId: o.id,
fromRoom: a.name
}), Me.info("Purchased ".concat(c, " pixels at ").concat(o.price.toFixed(2), " credits each ") + "(total: ".concat(m.toFixed(0), " credits)").concat(n ? " (GOOD PRICE!)" : ""), {
subsystem: "PixelBuying"
});
} else Me.warn("Failed to purchase pixels: error code ".concat(u), {
subsystem: "PixelBuying"
});
}
}
} else Me.debug("No terminal available for pixel purchase", {
subsystem: "PixelBuying"
});
} else Me.debug("Pixel price (".concat(o.price, ") above target (").concat(this.config.targetPixelPrice, "), waiting"), {
subsystem: "PixelBuying"
});
} else Me.debug("No pixel orders below max price (".concat(this.config.maxPixelPrice, ")"), {
subsystem: "PixelBuying"
});
} else Me.debug("No pixel sell orders available", {
subsystem: "PixelBuying"
});
}, e.prototype.recordPurchase = function(e) {
var t = this.getPixelBuyingMemory();
if (t) for (t.lastPurchaseTick = e.tick, t.totalPixelsPurchased += e.amount, t.totalCreditsSpent += e.totalCost, 
t.purchaseHistory.push(e); t.purchaseHistory.length > 50; ) t.purchaseHistory.shift();
}, e.prototype.updateMemory = function() {
var e = this.getPixelBuyingMemory();
e && (e.lastScan = Game.time);
}, e.prototype.getStats = function() {
var e = this.getPixelBuyingMemory();
if (e) return {
totalPurchased: e.totalPixelsPurchased,
totalSpent: e.totalCreditsSpent,
averagePrice: e.totalPixelsPurchased > 0 ? e.totalCreditsSpent / e.totalPixelsPurchased : 0,
lastPurchaseTick: e.lastPurchaseTick,
recentPurchases: e.purchaseHistory.slice(-10)
};
}, e.prototype.canBuyPixels = function() {
var e = [];
if (this.config.enabled || e.push("Pixel buying is disabled"), !this.isPurchaseCooldownComplete()) {
var t = this.getPixelBuyingMemory(), r = t ? this.config.purchaseCooldown - (Game.time - t.lastPurchaseTick) : 0;
e.push("On cooldown (".concat(r, " ticks remaining)"));
}
return this.hasSurplusResources() || e.push("No resource surplus"), this.hasEnoughCredits() || e.push("Insufficient credits (need ".concat(this.config.minCreditsForPixels, " above ").concat(this.config.creditReserve, " reserve)")), 
{
canBuy: 0 === e.length,
reasons: e
};
}, e.prototype.updateConfig = function(e) {
this.config = o(o({}, this.config), e);
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e.prototype.enable = function() {
this.config.enabled = !0, Me.info("Pixel buying enabled", {
subsystem: "PixelBuying"
});
}, e.prototype.disable = function() {
this.config.enabled = !1, Me.info("Pixel buying disabled", {
subsystem: "PixelBuying"
});
}, e;
}(), gl = {
enabled: !0,
fullBucketTicksRequired: 25,
bucketMax: 1e4,
cpuCostPerPixel: 1e4,
minBucketAfterGeneration: 0
}, hl = function() {
function e(e, t) {
void 0 === e && (e = {}), this.config = o(o({}, gl), e), this.memoryAccessor = t;
}
return e.prototype.setMemoryAccessor = function(e) {
this.memoryAccessor = e;
}, e.prototype.run = function() {
if (this.config.enabled) {
this.memoryAccessor && this.memoryAccessor.ensurePixelGenerationMemory();
var e = this.getPixelGenerationMemory();
e && (Game.cpu.bucket >= this.config.bucketMax ? (0 === e.consecutiveFullTicks && (e.bucketFullSince = Game.time), 
e.consecutiveFullTicks++) : (e.consecutiveFullTicks = 0, e.bucketFullSince = 0), 
this.shouldGeneratePixel(e) && this.generatePixel(e));
}
}, e.prototype.getPixelGenerationMemory = function() {
var e;
return null === (e = this.memoryAccessor) || void 0 === e ? void 0 : e.getPixelGenerationMemory();
}, e.prototype.shouldGeneratePixel = function(e) {
return !(e.consecutiveFullTicks < this.config.fullBucketTicksRequired || Game.cpu.bucket < this.config.bucketMax || Game.cpu.bucket < this.config.cpuCostPerPixel);
}, e.prototype.generatePixel = function(e) {
var t = Game.cpu.generatePixel();
if (t === OK) {
e.totalPixelsGenerated++, e.lastGenerationTick = Game.time;
var r = e.bucketFullSince > 0 ? Game.time - e.bucketFullSince : e.consecutiveFullTicks;
e.consecutiveFullTicks = 0, e.bucketFullSince = 0, Me.info("Generated pixel from CPU bucket (total generated: ".concat(e.totalPixelsGenerated, ")"), {
subsystem: "PixelGeneration",
meta: {
bucket: Game.cpu.bucket,
ticksWaited: r
}
});
} else Me.warn("Failed to generate pixel: error code ".concat(t), {
subsystem: "PixelGeneration",
meta: {
bucket: Game.cpu.bucket,
result: t
}
});
}, e.prototype.getStats = function() {
var e, t, r, o, n = this.getPixelGenerationMemory(), a = !!n && this.shouldGeneratePixel(n), i = n ? Math.max(0, this.config.fullBucketTicksRequired - n.consecutiveFullTicks) : this.config.fullBucketTicksRequired;
return {
enabled: this.config.enabled,
totalGenerated: null !== (e = null == n ? void 0 : n.totalPixelsGenerated) && void 0 !== e ? e : 0,
lastGenerationTick: null !== (t = null == n ? void 0 : n.lastGenerationTick) && void 0 !== t ? t : 0,
bucketFullSince: null !== (r = null == n ? void 0 : n.bucketFullSince) && void 0 !== r ? r : 0,
consecutiveFullTicks: null !== (o = null == n ? void 0 : n.consecutiveFullTicks) && void 0 !== o ? o : 0,
canGenerate: a,
ticksUntilGeneration: i
};
}, e.prototype.enable = function() {
this.config.enabled = !0, Me.info("Pixel generation enabled", {
subsystem: "PixelGeneration"
});
}, e.prototype.disable = function() {
this.config.enabled = !1, Me.info("Pixel generation disabled", {
subsystem: "PixelGeneration"
});
}, e.prototype.updateConfig = function(e) {
this.config = o(o({}, this.config), e);
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e;
}(), vl = {
updateInterval: 500,
minGhodium: 5e3,
minEnergy: 3e5,
minScore: 35,
siegeCoordinationWindow: 1e3,
nukeFlightTime: 5e4,
terminalPriority: 5,
donorRoomBuffer: 1e3,
salvoSyncWindow: 10,
roiThreshold: 2,
counterNukeWarThreshold: 60
}, Rl = 1e7, El = 5e6, Tl = ((tl = {})[STRUCTURE_SPAWN] = 15e3, tl[STRUCTURE_TOWER] = 5e3, 
tl[STRUCTURE_STORAGE] = 3e4, tl[STRUCTURE_TERMINAL] = 1e5, tl[STRUCTURE_LAB] = 5e4, 
tl[STRUCTURE_NUKER] = 1e5, tl[STRUCTURE_POWER_SPAWN] = 1e5, tl[STRUCTURE_OBSERVER] = 8e3, 
tl[STRUCTURE_EXTENSION] = 3e3, tl[STRUCTURE_LINK] = 5e3, tl);

function Cl(e) {
return !!e.threatenedStructures && e.threatenedStructures.some(function(e) {
return e.includes(STRUCTURE_SPAWN) || e.includes(STRUCTURE_STORAGE) || e.includes(STRUCTURE_TERMINAL);
});
}

function Sl(e, t, r) {
t.timeToLand < 5e3 ? (r.posture = "evacuate", Me.warn("EVACUATION TRIGGERED for ".concat(e.name, ": Critical structures threatened by nuke!"), {
subsystem: "Nuke"
})) : ("war" !== r.posture && "evacuate" !== r.posture && (r.posture = "defensive"), 
Me.warn("NUKE DEFENSE PREPARATION in ".concat(e.name, ": Critical structures in blast radius"), {
subsystem: "Nuke"
})), r.pheromones.defense = 100;
}

function _l() {
var e, t = 0, r = 0;
for (var o in Game.rooms) {
var n = Game.rooms[o];
(null === (e = n.controller) || void 0 === e ? void 0 : e.my) && (n.storage && (t += n.storage.store.getUsedCapacity(RESOURCE_ENERGY) || 0), 
n.terminal && (t += n.terminal.store.getUsedCapacity(RESOURCE_ENERGY) || 0, r += n.terminal.store.getUsedCapacity(RESOURCE_GHODIUM) || 0));
}
return t >= 6e5 && r >= 1e4;
}

function Ol(e, t, r, o) {
var n = 0, a = [], c = t.knownRooms[e];
if (!c) return {
roomName: e,
score: 0,
reasons: [ "No intel" ]
};
c.controllerLevel && (n += 3 * c.controllerLevel, a.push("RCL ".concat(c.controllerLevel))), 
c.towerCount && (n += 5 * c.towerCount, a.push("".concat(c.towerCount, " towers"))), 
c.spawnCount && (n += 10 * c.spawnCount, a.push("".concat(c.spawnCount, " spawns"))), 
c.owner && "" !== c.owner && (n += 30, a.push("Owned room"));
var l = o(e);
if (l) {
var u = Math.floor(l.pheromones.war / 10);
u > 0 && (n += u, a.push("War intensity: ".concat(l.pheromones.war)));
}
c.isHighway && (n += 10, a.push("Highway (strategic)")), c.threatLevel >= 2 && (n += 20, 
a.push("High threat"));
var m = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (m.length > 0) {
var p = Math.min.apply(Math, s([], i(m.map(function(t) {
return Game.map.getRoomLinearDistance(e, t.name);
})), !1));
n -= 2 * p, a.push("".concat(p, " rooms away"));
}
t.warTargets.includes(e) && (n += 15, a.push("War target"));
var d = new RoomPosition(25, 25, e), f = wl(e, d, t);
return f >= r.roiThreshold ? (n += Math.min(20, Math.floor(5 * f)), a.push("ROI: ".concat(f.toFixed(1), "x"))) : (n -= 20, 
a.push("Low ROI: ".concat(f.toFixed(1), "x"))), {
roomName: e,
score: n,
reasons: a
};
}

function bl(e, t, r) {
var o, n, i = {
estimatedDamage: 0,
estimatedValue: 0,
threatenedStructures: []
}, s = Game.rooms[e];
if (!s) {
var c = r.knownRooms[e];
if (c) {
var l = 5 * (c.towerCount || 0) + 10 * (c.spawnCount || 0) + 5;
i.estimatedDamage = Rl + El * l, i.estimatedValue = .01 * i.estimatedDamage;
}
return i;
}
var u = s.lookForAtArea(LOOK_STRUCTURES, Math.max(0, t.y - 2), Math.max(0, t.x - 2), Math.min(49, t.y + 2), Math.min(49, t.x + 2), !0);
try {
for (var m = a(u), p = m.next(); !p.done; p = m.next()) {
var d = p.value.structure, f = Math.abs(d.pos.x - t.x), y = Math.abs(d.pos.y - t.y), g = 0 === Math.max(f, y) ? Rl : El;
d.hits <= g ? (i.estimatedDamage += d.hits, i.threatenedStructures.push("".concat(d.structureType, "-").concat(d.pos.x, ",").concat(d.pos.y)), 
i.estimatedValue += Ul(d)) : i.estimatedDamage += g;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
return i;
}

function wl(e, t, r) {
var o = bl(e, t, r);
return 0 === o.estimatedValue ? 0 : o.estimatedValue / 305e3;
}

function Ul(e) {
return Tl[e.structureType] || 1e3;
}

function xl(e, t, r) {
var o, n, i, s = null;
try {
for (var c = a(Object.values(t)), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = Game.map.getRoomLinearDistance(u.coreRoom, e.targetRoom);
(!s || m < s.distance) && (s = {
id: u.id,
distance: m
});
}
} catch (e) {
o = {
error: e
};
} finally {
try {
l && !l.done && (n = c.return) && n.call(c);
} finally {
if (o) throw o.error;
}
}
if (!s) return Me.warn("Cannot deploy siege squad for nuke on ".concat(e.targetRoom, ": No clusters available"), {
subsystem: "Nuke"
}), !1;
var p = t[s.id];
if (!p) return !1;
var d = null === (i = p.squads) || void 0 === i ? void 0 : i.find(function(t) {
return "siege" === t.type && t.targetRooms.includes(e.targetRoom);
});
if (d) return e.siegeSquadId = d.id, !0;
var f = r(e.targetRoom);
f && (f.pheromones.siege = Math.min(100, f.pheromones.siege + 80), f.pheromones.war = Math.min(100, f.pheromones.war + 60), 
Me.info("Siege pheromones increased for ".concat(e.targetRoom, " to coordinate with nuke strike"), {
subsystem: "Nuke"
}));
var y = "siege-nuke-".concat(e.targetRoom, "-").concat(Game.time), g = {
id: y,
type: "siege",
members: [],
rallyRoom: p.coreRoom,
targetRooms: [ e.targetRoom ],
state: "gathering",
createdAt: Game.time,
retreatThreshold: .3
};
return p.squads || (p.squads = []), p.squads.push(g), e.siegeSquadId = y, Me.warn("SIEGE SQUAD DEPLOYED: Squad ".concat(y, " will coordinate with nuke on ").concat(e.targetRoom), {
subsystem: "Nuke"
}), !0;
}

var Al = function() {
function e(e, t) {
void 0 === e && (e = {}), this.nukerReadyLogged = new Set, this.config = o(o({}, vl), e), 
this.getEmpire = t.getEmpire, this.getSwarmState = t.getSwarmState, this.getClusters = t.getClusters;
}
return e.prototype.run = function() {
var e = this, t = this.getEmpire();
!function(e) {
e.nukesInFlight || (e.nukesInFlight = []), e.incomingNukes || (e.incomingNukes = []), 
e.nukeEconomics || (e.nukeEconomics = {
nukesLaunched: 0,
totalEnergyCost: 0,
totalGhodiumCost: 0,
totalDamageDealt: 0,
totalValueDestroyed: 0
});
}(t), function(e, t) {
var r;
e.incomingNukes || (e.incomingNukes = []);
var o = function(o) {
var n, i, s = Game.rooms[o];
if (!(null === (r = s.controller) || void 0 === r ? void 0 : r.my)) return "continue";
var c = t(o);
if (!c) return "continue";
var l = s.find(FIND_NUKES);
if (l.length > 0) {
var u = function(t) {
var r = e.incomingNukes.find(function(e) {
return e.roomName === o && e.landingPos.x === t.pos.x && e.landingPos.y === t.pos.y;
});
if (r) r.timeToLand = t.timeToLand || 0; else {
var n = {
roomName: o,
landingPos: {
x: t.pos.x,
y: t.pos.y
},
impactTick: Game.time + (t.timeToLand || 0),
timeToLand: t.timeToLand || 0,
detectedAt: Game.time,
evacuationTriggered: !1,
sourceRoom: t.launchRoomName
}, i = function(e, t) {
var r, o, n = [], i = e.lookForAtArea(LOOK_STRUCTURES, Math.max(0, t.y - 2), Math.max(0, t.x - 2), Math.min(49, t.y + 2), Math.min(49, t.x + 2), !0);
try {
for (var s = a(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value.structure, u = Math.abs(l.pos.x - t.x), m = Math.abs(l.pos.y - t.y), p = Math.max(u, m);
if (p <= 2) {
var d = 0 === p ? Rl : El;
l.hits <= d && n.push("".concat(l.structureType, "-").concat(l.pos.x, ",").concat(l.pos.y));
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
c && !c.done && (o = s.return) && o.call(s);
} finally {
if (r) throw r.error;
}
}
return n;
}(s, t.pos);
n.threatenedStructures = i, e.incomingNukes.push(n), c.nukeDetected || (c.nukeDetected = !0, 
c.pheromones.defense = Math.min(100, c.pheromones.defense + 50), c.pheromones.siege = Math.min(100, c.pheromones.siege + 30), 
c.danger = 3, Me.warn("INCOMING NUKE DETECTED in ".concat(o, "! ") + "Landing at (".concat(t.pos.x, ", ").concat(t.pos.y, "), impact in ").concat(t.timeToLand, " ticks. ") + "Source: ".concat(t.launchRoomName || "unknown", ". ") + "Threatened structures: ".concat(i.length), {
subsystem: "Nuke"
}), c.eventLog.push({
type: "nuke_incoming",
time: Game.time,
details: "Impact in ".concat(t.timeToLand, " ticks at (").concat(t.pos.x, ",").concat(t.pos.y, ")")
}), c.eventLog.length > 20 && c.eventLog.shift());
}
};
try {
for (var m = (n = void 0, a(l)), p = m.next(); !p.done; p = m.next()) u(p.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
p && !p.done && (i = m.return) && i.call(m);
} finally {
if (n) throw n.error;
}
}
} else c.nukeDetected && (c.nukeDetected = !1, Me.info("Nuke threat cleared in ".concat(o), {
subsystem: "Nuke"
}));
};
for (var n in Game.rooms) o(n);
}(t, this.getSwarmState), this.handleEvacuations(t), function(e, t, r, o) {
var n, i, s;
if (e.incomingNukes && 0 !== e.incomingNukes.length) try {
for (var c = a(e.incomingNukes), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u.sourceRoom && !e.warTargets.includes(u.sourceRoom)) {
var m = e.knownRooms[u.sourceRoom];
if (m && !(m.controllerLevel < 8)) {
var p = r(u.roomName);
if (p && !(p.pheromones.war < t.counterNukeWarThreshold)) if (o()) {
if (!e.warTargets.includes(u.sourceRoom)) for (var d in e.warTargets.push(u.sourceRoom), 
Me.warn("COUNTER-NUKE AUTHORIZED: ".concat(u.sourceRoom, " added to war targets for nuke retaliation"), {
subsystem: "Nuke"
}), Game.rooms) if (null === (s = Game.rooms[d].controller) || void 0 === s ? void 0 : s.my) {
var f = r(d);
f && (f.pheromones.war = Math.min(100, f.pheromones.war + 30));
}
} else Me.warn("Counter-nuke desired against ".concat(u.sourceRoom, " but insufficient resources"), {
subsystem: "Nuke"
});
}
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
l && !l.done && (i = c.return) && i.call(c);
} finally {
if (n) throw n.error;
}
}
}(t, this.config, this.getSwarmState, _l), function(e, t, r, o) {
var n, a;
if (e.objectives.warMode) for (var i in Game.rooms) {
var s = Game.rooms[i];
if (null === (n = s.controller) || void 0 === n ? void 0 : n.my) {
var c = s.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_NUKER;
}
})[0];
if (c) {
var l = s.terminal;
if (l && l.my) {
var u = c.store.getFreeCapacity(RESOURCE_ENERGY), m = c.store.getFreeCapacity(RESOURCE_GHODIUM);
if (m > 0) {
var p = null !== (a = l.store.getUsedCapacity(RESOURCE_GHODIUM)) && void 0 !== a ? a : 0;
p < m && o(i, RESOURCE_GHODIUM, m - p);
}
var d = "".concat(i, "-nuker");
0 === u && 0 === m ? r.has(d) || (Me.info("Nuker in ".concat(i, " is fully loaded and ready to launch"), {
subsystem: "Nuke"
}), r.add(d)) : r.delete(d);
}
}
}
}
}(t, this.config, this.nukerReadyLogged, function(t, r, o) {
return e.requestResourceTransfer(t, r, o);
}), function() {
var e;
for (var t in Game.rooms) {
var r = Game.rooms[t];
if (null === (e = r.controller) || void 0 === e ? void 0 : e.my) {
var o = r.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_NUKER;
}
})[0];
if (o) {
var n = o.store.getFreeCapacity(RESOURCE_ENERGY), a = o.store.getFreeCapacity(RESOURCE_GHODIUM);
(n > 0 || a > 0) && Me.debug("Nuker in ".concat(t, " needs ").concat(n, " energy, ").concat(a, " ghodium"), {
subsystem: "Nuke"
});
}
}
}
}(), function(e, t, r) {
var o, n;
if (e.nukeCandidates = [], e.objectives.warMode) {
try {
for (var i = a(e.warTargets), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Ol(c, e, t, r);
l.score >= t.minScore && (e.nukeCandidates.push({
roomName: c,
score: l.score,
launched: !1,
launchTick: 0
}), Me.info("Nuke candidate: ".concat(c, " (score: ").concat(l.score, ") - ").concat(l.reasons.join(", ")), {
subsystem: "Nuke"
}));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
s && !s.done && (n = i.return) && n.call(i);
} finally {
if (o) throw o.error;
}
}
e.nukeCandidates.sort(function(e, t) {
return t.score - e.score;
});
}
}(t, this.config, this.getSwarmState), function(e) {
var t;
if (e.nukeEconomics) {
var r = e.nukeEconomics, o = r.totalEnergyCost + r.totalGhodiumCost;
if (o > 0) {
var n = r.totalValueDestroyed;
r.lastROI = n / o, r.nukesLaunched > 0 && r.nukesLaunched % 5 == 0 && Me.info("Nuke economics: ".concat(r.nukesLaunched, " nukes, ROI: ").concat(null === (t = r.lastROI) || void 0 === t ? void 0 : t.toFixed(2), "x, ") + "Value destroyed: ".concat((r.totalValueDestroyed / 1e3).toFixed(0), "k"), {
subsystem: "Nuke"
});
}
}
}(t), function(e, t, r, o) {
var n, i, s, c, l, u, m;
if (e.objectives.warMode && e.nukesInFlight && 0 !== e.nukesInFlight.length) {
var p = r();
try {
for (var d = a(e.nukesInFlight), f = d.next(); !f.done; f = d.next()) {
var y = f.value, g = y.impactTick - Game.time;
y.siegeSquadId || g <= t.siegeCoordinationWindow && g > 0 && xl(y, p, o) && Me.info("Siege squad deployment coordinated with nuke on ".concat(y.targetRoom, ", ") + "impact in ".concat(g, " ticks"), {
subsystem: "Nuke"
});
}
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (n) throw n.error;
}
}
try {
for (var h = a(Object.values(p)), v = h.next(); !v.done; v = h.next()) {
var R = v.value;
if (R.squads && 0 !== R.squads.length) {
var E = R.squads.filter(function(e) {
return "siege" === e.type;
}), T = function(t) {
if ("moving" !== t.state && "attacking" !== t.state) return "continue";
var r = t.targetRooms[0];
if (!r) return "continue";
var o = null === (m = e.nukesInFlight) || void 0 === m ? void 0 : m.find(function(e) {
return e.targetRoom === r;
});
o && !o.siegeSquadId && (o.siegeSquadId = t.id, Me.info("Linked siege squad ".concat(t.id, " with nuke on ").concat(r), {
subsystem: "Nuke"
}));
};
try {
for (var C = (l = void 0, a(E)), S = C.next(); !S.done; S = C.next()) T(S.value);
} catch (e) {
l = {
error: e
};
} finally {
try {
S && !S.done && (u = C.return) && u.call(C);
} finally {
if (l) throw l.error;
}
}
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
v && !v.done && (c = h.return) && c.call(h);
} finally {
if (s) throw s.error;
}
}
}
}(t, this.config, this.getClusters, this.getSwarmState), function(e, t) {
var r, o, n, c, l, u;
if (e.nukesInFlight && 0 !== e.nukesInFlight.length) {
var m = new Map;
try {
for (var p = a(e.nukesInFlight), d = p.next(); !d.done; d = p.next()) {
var f = d.value, y = m.get(f.targetRoom) || [];
y.push(f), m.set(f.targetRoom, y);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
try {
for (var g = a(m.entries()), h = g.next(); !h.done; h = g.next()) {
var v = i(h.value, 2), R = v[0], E = v[1];
if (!(E.length < 2)) {
var T = E.map(function(e) {
return e.impactTick;
}), C = Math.min.apply(Math, s([], i(T), !1)), S = Math.max.apply(Math, s([], i(T), !1)) - C;
if (S <= t.salvoSyncWindow) {
var _ = E[0].salvoId || "salvo-".concat(R, "-").concat(C);
try {
for (var O = (l = void 0, a(E)), b = O.next(); !b.done; b = O.next()) (f = b.value).salvoId = _;
} catch (e) {
l = {
error: e
};
} finally {
try {
b && !b.done && (u = O.return) && u.call(O);
} finally {
if (l) throw l.error;
}
}
Me.info("Nuke salvo ".concat(_, " coordinated: ").concat(E.length, " nukes on ").concat(R, ", impact spread: ").concat(S, " ticks"), {
subsystem: "Nuke"
});
} else Me.warn("Nukes on ".concat(R, " not synchronized (spread: ").concat(S, " ticks > ").concat(t.salvoSyncWindow, ")"), {
subsystem: "Nuke"
});
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (c = g.return) && c.call(g);
} finally {
if (n) throw n.error;
}
}
}
}(t, this.config), function(e, t) {
var r, o, n, i, s;
if (e.objectives.warMode) {
var c = [];
for (var l in Game.rooms) {
var u = Game.rooms[l];
(null === (s = u.controller) || void 0 === s ? void 0 : s.my) && (g = u.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_NUKER;
}
})[0]) && g.store.getUsedCapacity(RESOURCE_ENERGY) >= t.minEnergy && g.store.getUsedCapacity(RESOURCE_GHODIUM) >= t.minGhodium && c.push(g);
}
if (0 !== c.length) try {
for (var m = a(e.nukeCandidates), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (!d.launched) {
try {
for (var f = (n = void 0, a(c)), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
if (!(Game.map.getRoomLinearDistance(g.room.name, d.roomName) > 10)) {
var h = new RoomPosition(25, 25, d.roomName), v = bl(d.roomName, h, e), R = wl(d.roomName, h, e);
if (R < t.roiThreshold) Me.warn("Skipping nuke launch on ".concat(d.roomName, ": ROI ").concat(R.toFixed(2), "x below threshold ").concat(t.roiThreshold, "x"), {
subsystem: "Nuke"
}); else {
var E = g.launchNuke(h);
if (E === OK) {
d.launched = !0, d.launchTick = Game.time;
var T = {
id: "".concat(g.room.name, "-").concat(d.roomName, "-").concat(Game.time),
sourceRoom: g.room.name,
targetRoom: d.roomName,
targetPos: {
x: h.x,
y: h.y
},
launchTick: Game.time,
impactTick: Game.time + t.nukeFlightTime,
estimatedDamage: v.estimatedDamage,
estimatedValue: v.estimatedValue
};
e.nukesInFlight || (e.nukesInFlight = []), e.nukesInFlight.push(T), e.nukeEconomics || (e.nukeEconomics = {
nukesLaunched: 0,
totalEnergyCost: 0,
totalGhodiumCost: 0,
totalDamageDealt: 0,
totalValueDestroyed: 0
}), e.nukeEconomics.nukesLaunched++, e.nukeEconomics.totalEnergyCost += 3e5, e.nukeEconomics.totalGhodiumCost += 5e3, 
e.nukeEconomics.totalDamageDealt += v.estimatedDamage, e.nukeEconomics.totalValueDestroyed += v.estimatedValue, 
e.nukeEconomics.lastLaunchTick = Game.time, Me.warn("NUKE LAUNCHED from ".concat(g.room.name, " to ").concat(d.roomName, "! ") + "Impact in ".concat(t.nukeFlightTime, " ticks. ") + "Predicted damage: ".concat((v.estimatedDamage / 1e6).toFixed(1), "M hits, ") + "value: ".concat((v.estimatedValue / 1e3).toFixed(0), "k, ROI: ").concat(R.toFixed(2), "x"), {
subsystem: "Nuke"
});
var C = c.indexOf(g);
C > -1 && c.splice(C, 1);
break;
}
Me.error("Failed to launch nuke: ".concat(E), {
subsystem: "Nuke"
});
}
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
y && !y.done && (i = f.return) && i.call(f);
} finally {
if (n) throw n.error;
}
}
if (0 === c.length) break;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
p && !p.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
}
}(t, this.config), function(e) {
if (e.nukesInFlight && (e.nukesInFlight = e.nukesInFlight.filter(function(e) {
return e.impactTick > Game.time;
})), e.incomingNukes) {
var t = e.incomingNukes.length;
e.incomingNukes = e.incomingNukes.filter(function(e) {
return e.impactTick > Game.time;
});
var r = t - e.incomingNukes.length;
r > 0 && Me.info("Cleaned up ".concat(r, " impacted nuke alert(s)"), {
subsystem: "Nuke"
});
}
}(t);
}, e.prototype.handleEvacuations = function(e) {
var t, r;
if (e.incomingNukes) try {
for (var o = a(e.incomingNukes), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
if (!i.evacuationTriggered && Cl(i)) {
var s = Game.rooms[i.roomName];
if (s) {
var c = this.getSwarmState(i.roomName);
c && (Sl(s, i, c), i.evacuationTriggered = !0);
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
n && !n.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.requestResourceTransfer = function(e, t, r) {
!function(e, t, r, o, n) {
var a = function(e, t, r, o) {
var n, a, i, s, c = [];
for (var l in Game.rooms) {
var u = Game.rooms[l];
if ((null === (n = u.controller) || void 0 === n ? void 0 : n.my) && l !== e) {
var m = u.terminal;
if (m && m.my) {
var p = null !== (a = m.store.getUsedCapacity(t)) && void 0 !== a ? a : 0;
if (!(p < r + o.donorRoomBuffer)) {
var d = Game.map.getRoomLinearDistance(l, e);
c.push({
room: l,
amount: p,
distance: d
});
}
}
}
}
return 0 === c.length ? null : (c.sort(function(e, t) {
return e.distance - t.distance;
}), null !== (s = null === (i = c[0]) || void 0 === i ? void 0 : i.room) && void 0 !== s ? s : null);
}(e, t, r, o);
a ? n.requestTransfer(a, e, t, r, o.terminalPriority) && Me.info("Requested ".concat(r, " ").concat(t, " transfer from ").concat(a, " to ").concat(e, " for nuker"), {
subsystem: "Nuke"
}) : Me.debug("No donor room found for ".concat(r, " ").concat(t, " to ").concat(e), {
subsystem: "Nuke"
});
}(e, t, r, this.config, Bc);
}, e.prototype.getConfig = function() {
return o({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = o(o({}, this.config), e);
}, e;
}(), Ml = [ {
carryParts: 4,
capacity: 200,
moveParts: 4,
cost: 400
}, {
carryParts: 8,
capacity: 400,
moveParts: 8,
cost: 800
}, {
carryParts: 16,
capacity: 800,
moveParts: 16,
cost: 1600
}, {
carryParts: 24,
capacity: 1200,
moveParts: 24,
cost: 2400
} ];

function kl(e, t, r, o) {
var n, i, s, c, l, u, m = (s = t, l = (c = function(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
return t ? {
x: "W" === t[1] ? -parseInt(t[2], 10) : parseInt(t[2], 10),
y: "N" === t[3] ? parseInt(t[4], 10) : -parseInt(t[4], 10)
} : {
x: 0,
y: 0
};
})(e), u = c(s), Math.abs(u.x - l.x) + Math.abs(u.y - l.y)), p = function(e, t) {
void 0 === t && (t = 1.2);
var r = 50 * e * t;
return Math.ceil(2 * r);
}(m), d = 10 * r, f = Ml[0];
try {
for (var y = a(Ml), g = y.next(); !g.done; g = y.next()) {
var h = g.value;
if (!(h.cost <= o)) break;
f = h;
}
} catch (e) {
n = {
error: e
};
} finally {
try {
g && !g.done && (i = y.return) && i.call(y);
} finally {
if (n) throw n.error;
}
}
var v = d * p, R = Math.max(1, Math.ceil(v / f.capacity * 1.2)), E = Math.min(2 * r, R + 1);
return Me.debug("Remote hauler calculation: ".concat(e, " -> ").concat(t, " (").concat(r, " sources, ").concat(m, " rooms away) - RT: ").concat(p, " ticks, E/tick: ").concat(d, ", Min: ").concat(R, ", Rec: ").concat(E, ", Cap: ").concat(f.capacity), {
subsystem: "HaulerDimensioning"
}), {
minHaulers: R,
recommendedHaulers: E,
haulerConfig: f,
distance: m,
roundTripTicks: p,
energyPerTick: d
};
}

var Nl = {
updateInterval: 500,
minGhodium: 5e3,
minEnergy: 3e5,
minScore: 35,
siegeCoordinationWindow: 1e3,
nukeFlightTime: 5e4,
terminalPriority: 5,
donorRoomBuffer: 1e3,
salvoSyncWindow: 10,
roiThreshold: 2,
counterNukeWarThreshold: 60
}, Il = new (function() {
function t(t) {
void 0 === t && (t = {}), this.coordinator = new Al(o(o({}, Nl), t), {
getEmpire: function() {
return e.memoryManager.getEmpire();
},
getSwarmState: function(t) {
return e.memoryManager.getSwarmState(t);
},
getClusters: function() {
return e.memoryManager.getClusters();
}
});
}
return t.prototype.run = function() {
this.coordinator.run();
}, t.prototype.getConfig = function() {
return this.coordinator.getConfig();
}, t.prototype.updateConfig = function(e) {
this.coordinator.updateConfig(e);
}, n([ Er("empire:nuke", "Nuke Manager", {
priority: $t.LOW,
interval: 500,
minBucket: 0,
cpuBudget: .01
}) ], t.prototype, "run", null), n([ Cr() ], t);
}()), Pl = function() {
function t() {}
return t.prototype.ensurePixelBuyingMemory = function() {
var t = e.memoryManager.getEmpire();
if (t.market) {
var r = t.market;
r.pixelBuying || (r.pixelBuying = {
lastPurchaseTick: 0,
totalPixelsPurchased: 0,
totalCreditsSpent: 0,
purchaseHistory: [],
lastScan: 0
});
}
}, t.prototype.getPixelBuyingMemory = function() {
var t = e.memoryManager.getEmpire();
if (t.market) return t.market.pixelBuying;
}, t;
}(), Gl = new (function(e) {
function t(t) {
return void 0 === t && (t = {}), e.call(this, t, new Pl) || this;
}
return r(t, e), t.prototype.run = function() {
e.prototype.run.call(this);
}, n([ Er("empire:pixelBuying", "Pixel Buying Manager", {
priority: $t.IDLE,
interval: 200,
minBucket: 0,
cpuBudget: .01
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(yl)), Ll = function() {
function e() {}
return e.prototype.ensurePixelGenerationMemory = function() {
var e = global;
e._pixelGenerationMemory || (e._pixelGenerationMemory = {
bucketFullSince: 0,
consecutiveFullTicks: 0,
totalPixelsGenerated: 0,
lastGenerationTick: 0
});
}, e.prototype.getPixelGenerationMemory = function() {
return global._pixelGenerationMemory;
}, e;
}(), Dl = new (function(e) {
function t(t) {
return void 0 === t && (t = {}), e.call(this, t, new Ll) || this;
}
return r(t, e), t.prototype.run = function() {
e.prototype.run.call(this);
}, n([ Er("empire:pixelGeneration", "Pixel Generation Manager", {
priority: $t.IDLE,
interval: 1,
minBucket: 0,
cpuBudget: .01
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(hl));

function Fl(e, t) {
var r, o;
if ((null === (r = e.controller) || void 0 === r ? void 0 : r.owner) && !e.controller.my) return {
lost: !0,
reason: "enemyOwned"
};
var n, a = (n = Object.values(Game.spawns)).length > 0 ? n[0].owner.username : "";
return (null === (o = e.controller) || void 0 === o ? void 0 : o.reservation) && e.controller.reservation.username !== a ? {
lost: !0,
reason: "enemyReserved"
} : e.find(FIND_HOSTILE_CREEPS).filter(function(e) {
return e.body.some(function(e) {
return e.type === ATTACK || e.type === RANGED_ATTACK || e.type === WORK;
});
}).length >= 2 ? {
lost: !0,
reason: "hostile"
} : {
lost: !1
};
}

function Bl(t, r, o) {
var n, a = e.memoryManager.getSwarmState(t);
if (a) {
var i = null !== (n = a.remoteAssignments) && void 0 !== n ? n : [], s = i.indexOf(r);
if (-1 !== s) {
i.splice(s, 1), a.remoteAssignments = i;
var c = e.memoryManager.getEmpire().knownRooms[r];
c && (c.threatLevel = 3, c.lastSeen = Game.time), Me.warn("Removed remote room ".concat(r, " from ").concat(t, " due to: ").concat(o), {
subsystem: "RemoteRoomManager"
});
}
}
}

function Hl(t) {
var r, o, n, i = e.memoryManager.getSwarmState(t);
if (i) {
var s = null !== (n = i.remoteAssignments) && void 0 !== n ? n : [];
if (0 !== s.length) try {
for (var c = a(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = Game.rooms[u];
if (m) {
var p = Fl(m);
p.lost && p.reason && Bl(t, u, p.reason);
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
}
}

var Wl = {
updateInterval: 50,
minBucket: 0,
maxSitesPerRemotePerTick: 2
}, Yl = function() {
function t(e) {
void 0 === e && (e = {}), this.config = o(o({}, Wl), e);
}
return t.prototype.run = function() {
var t, r, o, n, i, s = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var c = a(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = e.memoryManager.getSwarmState(u.name);
if (m) {
Hl(u.name);
var p = null !== (i = m.remoteAssignments) && void 0 !== i ? i : [];
if (0 !== p.length) {
try {
for (var d = (o = void 0, a(p)), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
this.planRemoteInfrastructure(u, y);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
f && !f.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
this.placeRemoteRoads(u, p);
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
}, t.prototype.planRemoteInfrastructure = function(e, t) {
var r, o, n = Game.rooms[t];
if (n) {
var i = n.controller, s = this.getMyUsername();
if (i) {
if (i.owner && i.owner.username !== s) return;
if (i.reservation && i.reservation.username !== s) return;
}
var c = n.find(FIND_SOURCES), l = 0;
try {
for (var u = a(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (l >= this.config.maxSitesPerRemotePerTick) break;
this.placeSourceContainer(n, p) && l++;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
}
}, t.prototype.placeSourceContainer = function(e, t) {
if (t.pos.findInRange(FIND_STRUCTURES, 1, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}
}).length > 0) return !1;
if (t.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}
}).length > 0) return !1;
var r = this.findBestContainerPosition(t);
if (!r) return Me.warn("Could not find valid position for container at source ".concat(t.id, " in ").concat(e.name), {
subsystem: "RemoteInfra"
}), !1;
if (e.find(FIND_CONSTRUCTION_SITES).length >= 5) return !1;
var o = e.createConstructionSite(r.x, r.y, STRUCTURE_CONTAINER);
return o === OK ? (Me.info("Placed container construction site at source ".concat(t.id, " in ").concat(e.name), {
subsystem: "RemoteInfra"
}), !0) : (Me.debug("Failed to place container at source ".concat(t.id, " in ").concat(e.name, ": ").concat(o), {
subsystem: "RemoteInfra"
}), !1);
}, t.prototype.findBestContainerPosition = function(e) {
for (var t = e.room, r = t.getTerrain(), o = [], n = -1; n <= 1; n++) for (var a = -1; a <= 1; a++) if (0 !== n || 0 !== a) {
var i = e.pos.x + n, s = e.pos.y + a;
if (!(i < 1 || i > 48 || s < 1 || s > 48 || r.get(i, s) === TERRAIN_MASK_WALL || new RoomPosition(i, s, t.name).lookFor(LOOK_STRUCTURES).length > 0)) {
for (var c = 0, l = -1; l <= 1; l++) for (var u = -1; u <= 1; u++) if (0 !== l || 0 !== u) {
var m = i + l, p = s + u;
m >= 1 && m <= 48 && p >= 1 && p <= 48 && r.get(m, p) !== TERRAIN_MASK_WALL && c++;
}
o.push({
x: i,
y: s,
score: c
});
}
}
return 0 === o.length ? null : (o.sort(function(e, t) {
return t.score - e.score;
}), o[0]);
}, t.prototype.placeRemoteRoads = function(e, t) {
var r, o, n = Aa(e, t), i = n.get(e.name);
i && this.placeRoadsInRoom(e, i);
try {
for (var s = a(t), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
if (u) {
var m = n.get(l);
m && this.placeRoadsInRoom(u, m);
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
c && !c.done && (o = s.return) && o.call(s);
} finally {
if (r) throw r.error;
}
}
}, t.prototype.placeRoadsInRoom = function(e, t) {
var r, o, n = e.find(FIND_CONSTRUCTION_SITES), s = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
});
if (!(n.length >= 5)) {
var c = new Set(s.map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), l = new Set(n.filter(function(e) {
return e.structureType === STRUCTURE_ROAD;
}).map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), u = e.getTerrain(), m = 0;
try {
for (var p = a(t), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
if (m >= 3) break;
if (n.length + m >= 5) break;
if (!c.has(f) && !l.has(f)) {
var y = i(f.split(","), 2), g = y[0], h = y[1], v = parseInt(g, 10), R = parseInt(h, 10);
u.get(v, R) !== TERRAIN_MASK_WALL && e.createConstructionSite(v, R, STRUCTURE_ROAD) === OK && m++;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
m > 0 && Me.debug("Placed ".concat(m, " remote road construction sites in ").concat(e.name), {
subsystem: "RemoteInfra"
});
}
}, t.prototype.getMyUsername = function() {
var e = Object.values(Game.spawns);
return e.length > 0 ? e[0].owner.username : "";
}, n([ Rr("remote:infrastructure", "Remote Infrastructure Manager", {
priority: $t.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .05
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(), Kl = new Yl, Vl = new (function(e) {
function t(t) {
return void 0 === t && (t = {}), e.call(this, t) || this;
}
return r(t, e), t.prototype.run = function() {
e.prototype.run.call(this);
}, n([ Er("empire:shard", "Shard Manager", {
priority: $t.LOW,
interval: 100,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), n([ Cr() ], t);
}(nl)), ql = function() {
function t() {}
return t.prototype.cleanupMemory = function() {
for (var e in Memory.creeps) Game.creeps[e] || delete Memory.creeps[e];
}, t.prototype.checkMemorySize = function() {
var e = RawMemory.get().length, t = 2097152, r = e / t * 100;
r > 90 ? Ft.error("Memory usage critical: ".concat(r.toFixed(1), "% (").concat(e, "/").concat(t, " bytes)"), {
subsystem: "Memory"
}) : r > 75 && Ft.warn("Memory usage high: ".concat(r.toFixed(1), "% (").concat(e, "/").concat(t, " bytes)"), {
subsystem: "Memory"
});
}, t.prototype.updateMemorySegmentStats = function() {
nn.run();
}, t.prototype.runPheromoneDiffusion = function() {
var t, r, o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), n = new Map;
try {
for (var i = a(o), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = e.memoryManager.getSwarmState(c.name);
l && n.set(c.name, l);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
Fi.applyDiffusion(n);
}, t.prototype.initializeLabConfigs = function() {
var e, t, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var o = a(r), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
Po.initialize(i.name);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, t.prototype.precacheRoomPaths = function() {}, n([ Er("core:memoryCleanup", "Memory Cleanup", {
priority: $t.LOW,
interval: 50,
cpuBudget: .01
}) ], t.prototype, "cleanupMemory", null), n([ Tr("core:memorySizeCheck", "Memory Size Check", {
interval: 100,
cpuBudget: .005
}) ], t.prototype, "checkMemorySize", null), n([ Rr("core:memorySegmentStats", "Memory Segment Stats", {
priority: $t.IDLE,
interval: 10,
cpuBudget: .01
}) ], t.prototype, "updateMemorySegmentStats", null), n([ Rr("cluster:pheromoneDiffusion", "Pheromone Diffusion", {
priority: $t.MEDIUM,
interval: 10,
cpuBudget: .02
}) ], t.prototype, "runPheromoneDiffusion", null), n([ Er("room:labConfig", "Lab Config Manager", {
priority: $t.LOW,
interval: 200,
cpuBudget: .01
}) ], t.prototype, "initializeLabConfigs", null), n([ Tr("room:pathCachePrecache", "Path Cache Precache (Disabled)", {
interval: 1e3,
cpuBudget: .01
}) ], t.prototype, "precacheRoomPaths", null), n([ Cr() ], t);
}(), jl = new ql, zl = new Map;

function Xl(t, r, o) {
var n = 0;
if ("guard" !== o && "ranger" !== o && "healer" !== o || (n += function(e, t, r) {
var o = Ha(e), n = Wa(e);
if (0 === o.guards && 0 === o.rangers && 0 === o.healers) return 0;
var a = 0;
return ("guard" === r && n.guards < o.guards || "ranger" === r && n.rangers < o.rangers || "healer" === r && n.healers < o.healers) && (a = 100 * o.urgency), 
a;
}(t, 0, o)), "upgrader" === o && r.clusterId) {
var a = e.memoryManager.getCluster(r.clusterId);
(null == a ? void 0 : a.focusRoom) === t.name && (n += 40);
}
return n;
}

function Ql(e, t) {
var r, o = {
harvester: "harvest",
hauler: "logistics",
upgrader: "upgrade",
builder: "build",
guard: "defense",
remoteGuard: "defense",
healer: "defense",
soldier: "war",
siegeUnit: "siege",
ranger: "war",
scout: "expand",
claimer: "expand",
remoteWorker: "expand",
engineer: "build",
remoteHarvester: "harvest",
remoteHauler: "logistics",
interRoomCarrier: "logistics"
}[e];
return o ? .5 + (null !== (r = t[o]) && void 0 !== r ? r : 0) / 100 * 1.5 : 1;
}

var Zl = new Map, Jl = -1, $l = null;

function eu(e, t) {
var r, o;
void 0 === t && (t = !1), Jl === Game.time && $l === Game.creeps || (Zl.clear(), 
Jl = Game.time, $l = Game.creeps);
var n = t ? "".concat(e, "_active") : e, a = Zl.get(n);
if (a && a instanceof Map) return a;
var i = new Map;
for (var s in Game.creeps) {
var c = Game.creeps[s], l = c.memory;
if (l.homeRoom === e) {
if (t && c.spawning) continue;
var u = null !== (r = l.role) && void 0 !== r ? r : "unknown";
i.set(u, (null !== (o = i.get(u)) && void 0 !== o ? o : 0) + 1);
}
}
return Zl.set(n, i), i;
}

function tu(e, t, r) {
var o, n, i = 0;
try {
for (var s = a(Object.values(Game.creeps)), c = s.next(); !c.done; c = s.next()) {
var l = c.value.memory;
l.homeRoom === e && l.role === t && l.targetRoom === r && i++;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
c && !c.done && (n = s.return) && n.call(s);
} finally {
if (o) throw o.error;
}
}
return i;
}

function ru(e, t, r) {
var o, n, i, s, c, l = null !== (i = r.remoteAssignments) && void 0 !== i ? i : [];
if (0 === l.length) return null;
try {
for (var u = a(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = tu(e, t, p), f = Game.rooms[p];
if (d < ("remoteHarvester" === t ? f ? qe(f).length : 2 : "remoteHauler" === t && f ? kl(e, p, qe(f).length, null !== (c = null === (s = Game.rooms[e]) || void 0 === s ? void 0 : s.energyCapacityAvailable) && void 0 !== c ? c : 800).recommendedHaulers : 2)) return p;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
m && !m.done && (n = u.return) && n.call(u);
} finally {
if (o) throw o.error;
}
}
return null;
}

function ou(e, t, r, o) {
var n, i, s;
if ("remoteHarvester" === e || "remoteHauler" === e) {
var c = ru(o, e, r);
return !!c && (t.targetRoom = c, !0);
}
if ("remoteWorker" === e) {
var l = null !== (s = r.remoteAssignments) && void 0 !== s ? s : [];
if (l.length > 0) {
var u = 1 / 0, m = [];
try {
for (var p = a(l), d = p.next(); !d.done; d = p.next()) {
var f = d.value, y = tu(o, e, f);
y < u ? (u = y, m = [ f ]) : y === u && m.push(f);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
d && !d.done && (i = p.return) && i.call(p);
} finally {
if (n) throw n.error;
}
}
var g = m.length > 1 ? m[Game.time % m.length] : m[0];
return t.targetRoom = g, !0;
}
return !1;
}
return !0;
}

function nu(t, r, o, n) {
var i, s, c, l, u;
void 0 === n && (n = !1);
var m = da[r];
if (!m) return !1;
if ("larvaWorker" === r && !n) return !1;
if ("remoteHarvester" === r || "remoteHauler" === r) return null !== ru(t, r, o);
if ("remoteWorker" === r) {
if (0 === (d = null !== (c = o.remoteAssignments) && void 0 !== c ? c : []).length) return !1;
var p = function(e, t) {
Jl === Game.time && $l === Game.creeps || (Zl.clear(), Jl = Game.time, $l = Game.creeps);
var r = "".concat(e, ":").concat(t), o = Zl.get(r);
if ("number" == typeof o) return o;
var n = 0;
for (var a in Game.creeps) {
var i = Game.creeps[a].memory;
i.homeRoom === e && i.role === t && n++;
}
return Zl.set(r, n), n;
}(t, "remoteWorker");
return p < m.maxPerRoom;
}
if ("remoteGuard" === r) {
var d;
if (0 === (d = null !== (l = o.remoteAssignments) && void 0 !== l ? l : []).length) return !1;
try {
for (var f = a(d), y = f.next(); !y.done; y = f.next()) {
var g = y.value, h = Game.rooms[g];
if (h) {
var v = Ve(h, FIND_HOSTILE_CREEPS).filter(function(e) {
return e.body.some(function(e) {
return e.type === ATTACK || e.type === RANGED_ATTACK || e.type === WORK;
});
});
if (v.length > 0 && tu(t, r, g) < Math.min(m.maxPerRoom, Math.ceil(v.length / 2))) return !0;
}
}
} catch (e) {
i = {
error: e
};
} finally {
try {
y && !y.done && (s = f.return) && s.call(f);
} finally {
if (i) throw i.error;
}
}
return !1;
}
var R = null !== (u = eu(t).get(r)) && void 0 !== u ? u : 0, E = m.maxPerRoom;
if ("upgrader" === r && o.clusterId && (null == (x = e.memoryManager.getCluster(o.clusterId)) ? void 0 : x.focusRoom) === t) {
var T = Game.rooms[t];
(null == T ? void 0 : T.controller) && (E = T.controller.level <= 3 ? 2 : T.controller.level <= 6 ? 4 : 6);
}
if (R >= E) return !1;
var C = Game.rooms[t];
if (!C) return !1;
if ("scout" === r) return !(o.danger >= 1) && "defensive" !== o.posture && "war" !== o.posture && "siege" !== o.posture && (0 === R || "expand" === o.posture && R < m.maxPerRoom);
if ("claimer" === r) {
var S = e.memoryManager.getEmpire(), _ = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), O = _.length < Game.gcl.level, b = S.claimQueue.some(function(e) {
return !e.claimed;
}), w = function(e, t) {
var r, o, n, i, s, c, l = null !== (n = t.remoteAssignments) && void 0 !== n ? n : [];
if (0 === l.length) return !1;
var u, m = (u = Object.values(Game.spawns)).length > 0 ? u[0].owner.username : "", p = function(e) {
var t = Game.rooms[e];
if (null == t ? void 0 : t.controller) {
var r = t.controller;
if (r.owner) return "continue";
var o = (null === (i = r.reservation) || void 0 === i ? void 0 : i.username) === m, n = null !== (c = null === (s = r.reservation) || void 0 === s ? void 0 : s.ticksToEnd) && void 0 !== c ? c : 0;
if ((!o || n < 3e3) && !Object.values(Game.creeps).some(function(t) {
var r = t.memory;
return "claimer" === r.role && r.targetRoom === e && "reserve" === r.task;
})) return {
value: !0
};
} else if (!Object.values(Game.creeps).some(function(t) {
var r = t.memory;
return "claimer" === r.role && r.targetRoom === e && "reserve" === r.task;
})) return {
value: !0
};
};
try {
for (var d = a(l), f = d.next(); !f.done; f = d.next()) {
var y = p(f.value);
if ("object" == typeof y) return y.value;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
return !1;
}(0, o);
return !(!O || !b) || !!w;
}
if ("mineralHarvester" === r) {
var U = C.find(FIND_MINERALS)[0];
if (!U) return !1;
if (!U.pos.lookFor(LOOK_STRUCTURES).find(function(e) {
return e.structureType === STRUCTURE_EXTRACTOR;
})) return !1;
if (0 === U.mineralAmount) return !1;
}
if ("labTech" === r && C.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}).length < 3) return !1;
if ("factoryWorker" === r && 0 === C.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_FACTORY;
}
}).length) return !1;
if ("queenCarrier" === r && !C.storage) return !1;
if ("builder" === r && 0 === C.find(FIND_MY_CONSTRUCTION_SITES).length && R > 0) return !1;
if ("interRoomCarrier" === r) {
if (!o.clusterId) return !1;
var x;
if (!(x = e.memoryManager.getCluster(o.clusterId)) || !x.resourceRequests || 0 === x.resourceRequests.length) return !1;
var A = x.resourceRequests.some(function(e) {
if (e.fromRoom !== C.name) return !1;
var t = e.assignedCreeps.filter(function(e) {
return Game.creeps[e];
}).length;
return e.amount - e.delivered > 500 && t < 2;
});
if (!A) return !1;
}
if ("crossShardCarrier" === r) {
var M = sl.getActiveRequests();
if (0 === M.length) return !1;
if (A = M.some(function(e) {
var t, r;
if (e.sourceRoom !== C.name) return !1;
var o = e.assignedCreeps || [], n = e.amount - e.transferred, i = 0, s = 0;
try {
for (var c = a(o), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = Game.creeps[u];
m && (i += m.carryCapacity, s++);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
return i < n && s < 3;
}), !A) return !1;
}
return !0;
}

function au(e) {
var t, r;
return (null !== (t = e.get("harvester")) && void 0 !== t ? t : 0) + (null !== (r = e.get("larvaWorker")) && void 0 !== r ? r : 0);
}

function iu(e) {
var t = qe(e);
return [ {
role: "larvaWorker",
minCount: 1
}, {
role: "harvester",
minCount: 1
}, {
role: "hauler",
minCount: 1
}, {
role: "harvester",
minCount: Math.max(t.length, 1)
}, {
role: "queenCarrier",
minCount: 1,
condition: function(e) {
return Boolean(e.storage);
}
}, {
role: "upgrader",
minCount: 1
} ];
}

function su(e, t) {
var r, o, n, i, s = eu(e, !0);
if (0 === au(s)) return !0;
if (0 === function(e) {
var t, r;
return (null !== (t = e.get("hauler")) && void 0 !== t ? t : 0) + (null !== (r = e.get("larvaWorker")) && void 0 !== r ? r : 0);
}(s) && (null !== (n = s.get("harvester")) && void 0 !== n ? n : 0) > 0) return !0;
var c = eu(e, !1), l = iu(t);
try {
for (var u = a(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if ((!p.condition || p.condition(t)) && (null !== (i = c.get(p.role)) && void 0 !== i ? i : 0) < p.minCount) return !0;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
return !1;
}

function cu(e, t) {
var r, o, n = null;
try {
for (var i = a(e.bodies), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
c.cost <= t && (!n || c.cost > n.cost) && (n = c);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = i.return) && o.call(i);
} finally {
if (r) throw r.error;
}
}
return n;
}

function lu(e) {
return "".concat(e, "_").concat(Game.time, "_").concat(Math.floor(1e3 * Math.random()));
}

function uu(t, r) {
var o, n, s, c, l, u, m = je(t, STRUCTURE_SPAWN).find(function(e) {
return !e.spawning;
});
if (m) {
var p = t.energyCapacityAvailable, d = t.energyAvailable, f = 0 === au(eu(t.name, !0)), y = f ? d : p;
if (f && d < 150 && (Me.warn("WORKFORCE COLLAPSE: ".concat(d, " energy available, need 150 to spawn minimal larvaWorker. ") + "Room will recover once energy reaches 150.", {
subsystem: "spawn",
room: t.name
}), yr.emit("spawn.emergency", {
roomName: t.name,
energyAvailable: d,
message: "Critical workforce collapse - waiting for energy to spawn minimal creep",
source: "SpawnManager"
})), su(t.name, t) && Game.time % 10 == 0) {
var g = eu(t.name, !0), h = eu(t.name, !1), v = null !== (s = g.get("larvaWorker")) && void 0 !== s ? s : 0, R = null !== (c = g.get("harvester")) && void 0 !== c ? c : 0;
Me.info("BOOTSTRAP MODE: ".concat(au(g), " active energy producers ") + "(".concat(v, " larva, ").concat(R, " harvest), ").concat(au(h), " total. ") + "Energy: ".concat(d, "/").concat(p), {
subsystem: "spawn",
room: t.name
});
}
if (su(t.name, t)) {
var E = function(e, t, r) {
var o, n, i;
if (0 === au(eu(e, !0))) return Me.info("Bootstrap: Spawning larvaWorker (emergency - no active energy producers)", {
subsystem: "spawn",
room: e
}), "larvaWorker";
var s = eu(e, !1), c = iu(t);
Me.info("Bootstrap: Checking ".concat(c.length, " roles in order"), {
subsystem: "spawn",
room: e,
meta: {
totalCreeps: s.size,
creepCounts: Array.from(s.entries())
}
});
try {
for (var l = a(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!m.condition || m.condition(t)) {
var p = null !== (i = s.get(m.role)) && void 0 !== i ? i : 0;
if (p < m.minCount) {
var d = nu(e, m.role, r, !0);
if (Me.info("Bootstrap: Role ".concat(m.role, " needs spawning (current: ").concat(p, ", min: ").concat(m.minCount, ", needsRole: ").concat(d, ")"), {
subsystem: "spawn",
room: e
}), d) return m.role;
Me.warn("Bootstrap: Role ".concat(m.role, " blocked by needsRole check (current: ").concat(p, "/").concat(m.minCount, ")"), {
subsystem: "spawn",
room: e
});
}
} else Me.info("Bootstrap: Skipping ".concat(m.role, " (condition not met)"), {
subsystem: "spawn",
room: e
});
}
} catch (e) {
o = {
error: e
};
} finally {
try {
u && !u.done && (n = l.return) && n.call(l);
} finally {
if (o) throw o.error;
}
}
return Me.info("Bootstrap: No role needs spawning", {
subsystem: "spawn",
room: e
}), null;
}(t.name, t, r);
if (!E) return;
if (!(U = da[E])) return;
var T = cu(U, y);
if (T && d >= T.cost) ; else if (!(T = cu(U, d))) return void Me.info("Bootstrap: No affordable body for ".concat(E, " (available: ").concat(d, ", min needed: ").concat(null !== (u = null === (l = U.bodies[0]) || void 0 === l ? void 0 : l.cost) && void 0 !== u ? u : "unknown", ")"), {
subsystem: "spawn",
room: t.name
});
var C = lu(E);
if (!ou(E, x = {
role: U.role,
family: U.family,
homeRoom: t.name,
version: 1
}, r, t.name)) return;
var S = void 0;
try {
S = m.spawnCreep(T.parts, C, {
memory: x
});
} catch (e) {
return void Me.error("EXCEPTION during spawn attempt for ".concat(E, ": ").concat(e), {
subsystem: "spawn",
room: t.name,
meta: {
error: String(e),
role: E,
bodyCost: T.cost,
bodyParts: T.parts.length
}
});
}
if (S === OK) Me.info("BOOTSTRAP SPAWN: ".concat(E, " (").concat(C, ") with ").concat(T.parts.length, " parts, cost ").concat(T.cost, ". Recovery in progress."), {
subsystem: "spawn",
room: t.name
}), yr.emit("spawn.completed", {
roomName: t.name,
creepName: C,
role: E,
cost: T.cost,
source: "SpawnManager"
}); else {
var _ = S === ERR_NOT_ENOUGH_ENERGY ? "ERR_NOT_ENOUGH_ENERGY" : S === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" : S === ERR_BUSY ? "ERR_BUSY" : S === ERR_NOT_OWNER ? "ERR_NOT_OWNER" : S === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" : S === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" : "UNKNOWN(".concat(S, ")");
Me.warn("BOOTSTRAP SPAWN FAILED: ".concat(E, " (").concat(C, ") - ").concat(_, ". Body: ").concat(T.parts.length, " parts, cost: ").concat(T.cost, ", available: ").concat(d), {
subsystem: "spawn",
room: t.name,
meta: {
errorCode: S,
errorName: _,
role: E,
bodyCost: T.cost,
energyAvailable: d,
energyCapacity: p
}
});
}
} else {
var O = function(e, t) {
var r, o, n, s, c = eu(e.name), l = function(e) {
switch (e) {
case "eco":
return {
harvester: 1.5,
hauler: 1.2,
upgrader: 1.3,
builder: 1,
queenCarrier: 1,
guard: .3,
remoteGuard: .8,
healer: .1,
scout: 1,
claimer: .8,
engineer: .8,
remoteHarvester: 1.2,
remoteHauler: 1.2,
interRoomCarrier: 1
};

case "expand":
return {
harvester: 1.2,
hauler: 1,
upgrader: .8,
builder: 1,
queenCarrier: .8,
guard: .3,
remoteGuard: 1,
scout: 1.5,
claimer: 1.5,
remoteWorker: 1.5,
engineer: .5,
remoteHarvester: 1.5,
remoteHauler: 1.5,
interRoomCarrier: 1.2
};

case "defensive":
return {
harvester: 1,
hauler: 1,
upgrader: .5,
builder: .5,
queenCarrier: 1,
guard: 2,
remoteGuard: 1.8,
healer: 1.5,
ranger: 1,
scout: 0,
engineer: 1.2,
remoteHarvester: .5,
remoteHauler: .5,
interRoomCarrier: 1.5
};

case "war":
return {
harvester: .8,
hauler: .8,
upgrader: .3,
builder: .3,
queenCarrier: 1,
guard: 2.5,
healer: 2,
soldier: 2,
ranger: 1.5,
scout: 0,
engineer: .5,
remoteHarvester: .3,
remoteHauler: .3,
interRoomCarrier: .5
};

case "siege":
return {
harvester: .5,
hauler: .5,
upgrader: .1,
builder: .1,
queenCarrier: 1,
guard: 3,
healer: 2.5,
soldier: 2.5,
siegeUnit: 2,
ranger: 1,
scout: 0,
engineer: .2,
remoteHarvester: .1,
remoteHauler: .1
};

case "evacuate":
return {
hauler: 2,
queenCarrier: 1.5
};

case "nukePrep":
return {
harvester: 1,
hauler: 1,
upgrader: .5,
builder: .5,
queenCarrier: 1,
guard: 1.5,
scout: .5,
engineer: 2,
remoteHarvester: .5,
remoteHauler: .5
};

default:
return {
harvester: 1,
hauler: 1,
upgrader: 1,
builder: 1,
queenCarrier: 1,
scout: 1,
remoteHarvester: 1,
remoteHauler: 1
};
}
}(t.posture), u = [];
try {
for (var m = a(Object.entries(da)), p = m.next(); !p.done; p = m.next()) {
var d = i(p.value, 2), f = d[0], y = d[1];
if (nu(e.name, f, t)) {
var g = y.priority, h = null !== (n = l[f]) && void 0 !== n ? n : .5, v = Ql(f, t.pheromones), R = Xl(e, t, f), E = null !== (s = c.get(f)) && void 0 !== s ? s : 0, T = (g + R) * h * v * (y.maxPerRoom > 0 ? Math.max(.1, 1 - E / y.maxPerRoom) : .1);
u.push({
role: f,
score: T
});
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
p && !p.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
return u.sort(function(e, t) {
return t.score - e.score;
}), u.map(function(e) {
return e.role;
});
}(t, r);
try {
for (var b = a(O), w = b.next(); !w.done; w = b.next()) {
var U;
if (E = w.value, U = da[E]) {
var x, A = cu(U, y);
if (A && !(d < A.cost) && (C = lu(E), ou(E, x = {
role: U.role,
family: U.family,
homeRoom: t.name,
version: 1
}, r, t.name))) {
if ("interRoomCarrier" === E && r.clusterId) {
var M = e.memoryManager.getCluster(r.clusterId);
if (M) {
var k = M.resourceRequests.find(function(e) {
if (e.fromRoom !== t.name) return !1;
var r = e.assignedCreeps.filter(function(e) {
return Game.creeps[e];
}).length;
return e.amount - e.delivered > 500 && r < 2;
});
k && (x.transferRequest = {
fromRoom: k.fromRoom,
toRoom: k.toRoom,
resourceType: k.resourceType,
amount: k.amount
}, k.assignedCreeps.push(C));
}
}
if ((S = m.spawnCreep(A.parts, C, {
memory: x
})) === OK) return void yr.emit("spawn.completed", {
roomName: t.name,
creepName: C,
role: E,
cost: A.cost,
source: "SpawnManager"
});
if (S !== ERR_NOT_ENOUGH_ENERGY) return _ = S === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" : S === ERR_BUSY ? "ERR_BUSY" : S === ERR_NOT_OWNER ? "ERR_NOT_OWNER" : S === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" : S === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" : "UNKNOWN(".concat(S, ")"), 
void Me.warn("Spawn failed for ".concat(E, ": ").concat(_, ". Body: ").concat(A.parts.length, " parts, cost: ").concat(A.cost), {
subsystem: "spawn",
room: t.name,
meta: {
errorCode: S,
errorName: _,
role: E,
bodyCost: A.cost
}
});
}
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
w && !w.done && (n = b.return) && n.call(b);
} finally {
if (o) throw o.error;
}
}
O.length > 0 && Game.time % 20 == 0 ? Me.info("Waiting for energy: ".concat(O.length, " roles need spawning, waiting for optimal bodies. ") + "Energy: ".concat(d, "/").concat(p), {
subsystem: "spawn",
room: t.name,
meta: {
topRoles: O.slice(0, 3).join(", "),
energyAvailable: d,
energyCapacity: p
}
}) : 0 === O.length && Game.time % 100 == 0 && Me.info("No spawns needed: All roles fully staffed. Energy: ".concat(d, "/").concat(p), {
subsystem: "spawn",
room: t.name,
meta: {
energyAvailable: d,
energyCapacity: p,
activeCreeps: eu(t.name, !0).size
}
});
}
}
}

var mu, pu = function() {
function e(e, t, r, o) {
this.initialized = !1, this.logger = e, this.eventBus = t, this.pathCache = r, this.remoteMining = o;
}
return e.prototype.initializePathCacheEvents = function() {
var e = this;
this.initialized ? this.logger.warn("Path cache event handlers already initialized", {
subsystem: "PathCacheEvents"
}) : (this.eventBus.on("construction.complete", function(t) {
var r = t.roomName, o = t.structureType;
if (e.logger.debug("Construction completed in ".concat(r, ": ").concat(o), {
room: r,
meta: {
structureType: o
}
}), e.pathCache.invalidateRoom(r), o === STRUCTURE_STORAGE) {
var n = Game.rooms[r];
if (n) {
e.pathCache.cacheCommonRoutes(n);
var a = e.remoteMining.getRemoteRoomsForRoom(n);
a.length > 0 && (e.remoteMining.precacheRemoteRoutes(n, a), e.logger.info("Cached remote routes after storage construction in ".concat(r), {
room: r,
meta: {
remoteRooms: a.length
}
})), e.logger.info("Cached common routes after storage construction in ".concat(r), {
room: r
});
}
}
}), this.eventBus.on("structure.destroyed", function(t) {
var r = t.roomName, o = t.structureType;
e.logger.debug("Structure destroyed in ".concat(r, ": ").concat(o), {
room: r,
meta: {
structureType: o
}
}), e.pathCache.invalidateRoom(r);
}), this.initialized = !0, this.logger.info("Path cache event handlers initialized", {
subsystem: "PathCacheEvents"
}));
}, e;
}();

function du(e) {
var t, r, o = new Set;
try {
for (var n = a(Object.values(Game.creeps)), i = n.next(); !i.done; i = n.next()) {
var s = i.value.memory;
"remoteHarvester" !== s.role && "remoteHauler" !== s.role || s.homeRoom !== e.name || !s.targetRoom || s.targetRoom === e.name || o.add(s.targetRoom);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return Array.from(o);
}

function fu(e, t) {
var r, o, n, i, s = Game.rooms[e];
if (!s) return !0;
var c = e.match(/\d+/g);
if (!/^[WE]\d+[NS]\d+$/.test(e) || null === c || 2 !== c.length || parseInt(c[0], 10) % 10 != 0 && parseInt(c[1], 10) % 10 != 0) {
var l = s.find(FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER && e.structureType !== STRUCTURE_KEEPER_LAIR;
}
});
if (l.length > 0) return t && t.debug("Avoiding room ".concat(e, " with hostile structures"), {
meta: {
hostileCount: l.length
}
}), !1;
}
var u = new PathFinder.CostMatrix, m = s.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
});
try {
for (var p = a(m), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
u.set(f.pos.x, f.pos.y, 1);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
var y = s.find(FIND_CREEPS);
try {
for (var g = a(y), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
u.set(v.pos.x, v.pos.y, 255);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (n) throw n.error;
}
}
return u;
}

!function(e) {
e[e.CRITICAL = 0] = "CRITICAL", e[e.HIGH = 1] = "HIGH", e[e.MEDIUM = 2] = "MEDIUM", 
e[e.LOW = 3] = "LOW";
}(mu || (mu = {}));

var yu, gu = function() {
function e(e, t) {
this.pathCache = e, this.logger = t;
}
return e.prototype.getRemoteMiningPath = function(e, t, r) {
var o = this.pathCache.getCachedPath(e, t);
return o ? this.logger.debug("Remote path cache hit: ".concat(e.roomName, " → ").concat(t.roomName, " (").concat(r, ")"), {
meta: {
pathLength: o.length
}
}) : this.logger.debug("Remote path cache miss: ".concat(e.roomName, " → ").concat(t.roomName, " (").concat(r, ")")), 
o;
}, e.prototype.cacheRemoteMiningPath = function(e, t, r, o) {
this.pathCache.cachePath(e, t, r, {
ttl: 500
}), this.logger.info("Cached remote path: ".concat(e.roomName, " → ").concat(t.roomName, " (").concat(o, ")"), {
meta: {
pathLength: r.length,
ttl: 500
}
});
}, e.prototype.precacheRemoteRoutes = function(e, t) {
var r, o, n, i, s, c, l = this, u = e.storage, m = e.find(FIND_MY_SPAWNS);
if (u || 0 !== m.length) {
var p = 0;
try {
for (var d = a(t), f = d.next(); !f.done; f = d.next()) {
var y = f.value, g = Game.rooms[y];
if (g) {
var h = g.find(FIND_SOURCES), v = g.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}
});
if (m.length > 0) {
var R = m[0];
try {
for (var E = (n = void 0, a(h)), T = E.next(); !T.done; T = E.next()) {
var C = T.value, S = PathFinder.search(R.pos, {
pos: C.pos,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxRooms: 16,
roomCallback: function(e) {
return fu(e, l.logger);
}
});
if (!S.incomplete && S.path.length > 0) {
var _ = this.pathCache.convertRoomPositionsToPathSteps(S.path);
this.cacheRemoteMiningPath(R.pos, C.pos, _, "harvester"), p++;
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
T && !T.done && (i = E.return) && i.call(E);
} finally {
if (n) throw n.error;
}
}
}
if (u) {
var O = v.filter(function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}), b = O.length > 0 ? O.map(function(e) {
return e.pos;
}) : h.map(function(e) {
return e.pos;
});
try {
for (var w = (s = void 0, a(b)), U = w.next(); !U.done; U = w.next()) {
var x = U.value, A = PathFinder.search(x, {
pos: u.pos,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxRooms: 16,
roomCallback: function(e) {
return fu(e, l.logger);
}
});
!A.incomplete && A.path.length > 0 && (_ = this.pathCache.convertRoomPositionsToPathSteps(A.path), 
this.cacheRemoteMiningPath(x, u.pos, _, "hauler"), p++);
}
} catch (e) {
s = {
error: e
};
} finally {
try {
U && !U.done && (c = w.return) && c.call(w);
} finally {
if (s) throw s.error;
}
}
}
} else this.logger.debug("Cannot precache routes to ".concat(y, ": room not visible"));
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
p > 0 && this.logger.info("Precached ".concat(p, " remote mining routes for ").concat(e.name), {
room: e.name,
meta: {
remoteRooms: t.length,
routesCached: p
}
});
} else this.logger.warn("Cannot precache remote routes for ".concat(e.name, ": no storage or spawns"));
}, e.prototype.getOrCalculateRemotePath = function(e, t, r) {
var o = this, n = this.getRemoteMiningPath(e, t, r);
if (n) return n;
var a = PathFinder.search(e, {
pos: t,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxRooms: 16,
roomCallback: function(e) {
return fu(e, o.logger);
}
});
if (!a.incomplete && a.path.length > 0) {
var i = this.pathCache.convertRoomPositionsToPathSteps(a.path);
return this.cacheRemoteMiningPath(e, t, i, r), i;
}
return this.logger.warn("Failed to calculate remote path: ".concat(e.roomName, " → ").concat(t.roomName), {
meta: {
incomplete: a.incomplete
}
}), null;
}, e;
}(), hu = function() {
function e(e, t, r) {
this.logger = e, this.scheduler = t, this.pathCache = r;
}
return e.prototype.precacheAllRemoteRoutes = function() {
var e, t, r, o = 0;
try {
for (var n = a(Object.values(Game.rooms)), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
if ((null === (r = s.controller) || void 0 === r ? void 0 : r.my) && (s.storage || 0 !== s.find(FIND_MY_SPAWNS).length)) {
var c = du(s);
0 !== c.length && (this.pathCache.precacheRemoteRoutes(s, c), o += c.length);
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
o > 0 && this.logger.info("Precached remote routes for ".concat(o, " remote rooms"), {
meta: {
routesCached: o
}
});
}, e.prototype.initialize = function(e) {
var t = this;
void 0 === e && (e = 2), this.scheduler.scheduleTask("precache-remote-paths", 500, function() {
return t.precacheAllRemoteRoutes();
}, e, 5), this.logger.info("Remote path cache scheduler initialized");
}, e;
}(), vu = {
debug: function(e, t) {
return xe("RemoteMining").debug(e, t);
},
info: function(e, t) {
return xe("RemoteMining").info(e, t);
},
warn: function(e, t) {
return xe("RemoteMining").warn(e, t);
},
error: function(e, t) {
return xe("RemoteMining").error(e, t);
}
}, Ru = {
scheduleTask: function(e, t, r, o, n) {
!function(e, t, r, o, n) {
void 0 === o && (o = Zo.MEDIUM), yn.register({
id: e,
interval: t,
execute: r,
priority: o,
maxCpu: n,
skippable: o !== Zo.CRITICAL
});
}(e, t, r, o, n);
}
}, Eu = new gu({
getCachedPath: function(e, t) {
var r = He(e, t), o = fe.get(r, {
namespace: Be
});
if (!o) return null;
try {
return Room.deserializePath(o);
} catch (e) {
return fe.invalidate(r, Be), null;
}
},
cachePath: We,
convertRoomPositionsToPathSteps: function(e) {
for (var t = [], r = 0; r < e.length; r++) {
var o = e[r], n = r > 0 ? e[r - 1] : null, a = TOP, i = 0, s = 0;
n && n.roomName === o.roomName && (i = o.x - n.x, -1 === (s = o.y - n.y) && 0 === i ? a = TOP : -1 === s && 1 === i ? a = TOP_RIGHT : 0 === s && 1 === i ? a = RIGHT : 1 === s && 1 === i ? a = BOTTOM_RIGHT : 1 === s && 0 === i ? a = BOTTOM : 1 === s && -1 === i ? a = BOTTOM_LEFT : 0 === s && -1 === i ? a = LEFT : -1 === s && -1 === i && (a = TOP_LEFT)), 
t.push({
x: o.x,
y: o.y,
dx: i,
dy: s,
direction: a
});
}
return t;
}
}, vu), Tu = new hu(vu, Ru, Eu), Cu = function() {
function e() {
this.logger = xe("Pathfinding");
}
return e.prototype.debug = function(e, t) {
this.logger.debug(e, t);
}, e.prototype.info = function(e, t) {
this.logger.info(e, t);
}, e.prototype.warn = function(e, t) {
this.logger.warn(e, t);
}, e.prototype.error = function(e, t) {
this.logger.error(e, t);
}, e;
}(), Su = function() {
function e() {}
return e.prototype.on = function(e, t) {
Pe.on(e, t);
}, e;
}(), _u = function() {
function e() {}
return e.prototype.invalidateRoom = function(e) {
!function(e) {
var t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), r = new RegExp("^".concat(t, ":|:").concat(t, ":|:").concat(t, "$"));
fe.invalidatePattern(r, Be);
}(e);
}, e.prototype.cacheCommonRoutes = function(e) {
!function(e) {
var t, r, o;
if (null === (o = e.controller) || void 0 === o ? void 0 : o.my) {
var n = e.storage;
if (n) {
var i = e.find(FIND_SOURCES);
try {
for (var s = a(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = e.findPath(n.pos, l.pos, {
ignoreCreeps: !0,
serialize: !1
});
u.length > 0 && (We(n.pos, l.pos, u), We(l.pos, n.pos, u));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
if (e.controller) {
var m = e.findPath(n.pos, e.controller.pos, {
ignoreCreeps: !0,
range: 3,
serialize: !1
});
m.length > 0 && We(n.pos, e.controller.pos, m);
}
}
}
}(e);
}, e;
}(), Ou = function() {
function e() {}
return e.prototype.getRemoteRoomsForRoom = function(e) {
return function(e) {
return du(e);
}(e);
}, e.prototype.precacheRemoteRoutes = function(e, t) {
!function(e, t) {
Eu.precacheRemoteRoutes(e, t);
}(e, t);
}, e;
}(), bu = new pu(new Cu, new Su, new _u, new Ou), wu = {
lowBucketThreshold: 2e3,
highBucketThreshold: 9e3,
targetCpuUsage: .8,
highFrequencyInterval: 1,
mediumFrequencyInterval: 5,
lowFrequencyInterval: 20
}, Uu = function() {
function e(e) {
void 0 === e && (e = {}), this.tasks = new Map, this.currentMode = "normal", this.tickCpuUsed = 0, 
this.config = o(o({}, wu), e);
}
return e.prototype.registerTask = function(e) {
this.tasks.set(e.name, o(o({}, e), {
lastRun: 0
}));
}, e.prototype.unregisterTask = function(e) {
this.tasks.delete(e);
}, e.prototype.getBucketMode = function() {
var e = yr.getBucketMode();
return "critical" === e || "low" === e ? "low" : "high" === e ? "high" : "normal";
}, e.prototype.updateBucketMode = function() {
var e = this.getBucketMode();
e !== this.currentMode && (Ft.info("Bucket mode changed: ".concat(this.currentMode, " -> ").concat(e), {
subsystem: "Scheduler"
}), this.currentMode = e);
}, e.prototype.getCpuLimit = function() {
var e = Game.cpu.limit;
return "low" === this.currentMode ? .5 * e : e * this.config.targetCpuUsage;
}, e.prototype.hasCpuBudget = function() {
return Game.cpu.getUsed() < this.getCpuLimit();
}, e.prototype.getRemainingCpu = function() {
return Math.max(0, this.getCpuLimit() - Game.cpu.getUsed());
}, e.prototype.shouldRunTask = function(e) {
return !(Game.time - e.lastRun < this.getIntervalForFrequency(e.frequency) || "low" === this.currentMode && "high" !== e.frequency);
}, e.prototype.getIntervalForFrequency = function(e) {
switch (e) {
case "high":
return this.config.highFrequencyInterval;

case "medium":
return this.config.mediumFrequencyInterval;

case "low":
return this.config.lowFrequencyInterval;
}
}, e.prototype.run = function() {
var e, t;
this.updateBucketMode(), this.tickCpuUsed = 0;
var r = Array.from(this.tasks.values()).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var o = a(r), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
if (this.shouldRunTask(i)) {
var s = Game.cpu.getUsed();
if (!(s + this.getCpuLimit() * i.cpuBudget > this.getCpuLimit() && "high" !== i.frequency)) {
try {
i.execute(), i.lastRun = Game.time;
} catch (e) {
var c = e instanceof Error ? e.message : String(e);
Ft.error("Task ".concat(i.name, " failed: ").concat(c), {
subsystem: "Scheduler"
});
}
var l = Game.cpu.getUsed() - s;
if (this.tickCpuUsed += l, !this.hasCpuBudget()) {
Ft.warn("CPU budget exhausted, skipping remaining tasks", {
subsystem: "Scheduler"
});
break;
}
}
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.getTickCpuUsed = function() {
return this.tickCpuUsed;
}, e.prototype.getCurrentMode = function() {
return this.currentMode;
}, e.prototype.getTasks = function() {
return Array.from(this.tasks.values());
}, e;
}();

new Uu, (yu = {})[FIND_STRUCTURES] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, yu[FIND_MY_STRUCTURES] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, yu[FIND_HOSTILE_STRUCTURES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, yu[FIND_SOURCES_ACTIVE] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, yu[FIND_SOURCES] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, yu[FIND_MINERALS] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, yu[FIND_DEPOSITS] = {
lowBucket: 200,
normal: 100,
highBucket: 50
}, yu[FIND_MY_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, yu[FIND_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, yu[FIND_CREEPS] = {
lowBucket: 10,
normal: 5,
highBucket: 3
}, yu[FIND_MY_CREEPS] = {
lowBucket: 10,
normal: 5,
highBucket: 3
}, yu[FIND_HOSTILE_CREEPS] = {
lowBucket: 10,
normal: 3,
highBucket: 1
}, yu[FIND_DROPPED_RESOURCES] = {
lowBucket: 20,
normal: 5,
highBucket: 3
}, yu[FIND_TOMBSTONES] = {
lowBucket: 30,
normal: 10,
highBucket: 5
}, yu[FIND_RUINS] = {
lowBucket: 30,
normal: 10,
highBucket: 5
}, yu[FIND_FLAGS] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, yu[FIND_MY_SPAWNS] = {
lowBucket: 200,
normal: 100,
highBucket: 50
}, yu[FIND_HOSTILE_SPAWNS] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, yu[FIND_HOSTILE_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, yu[FIND_NUKES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, yu[FIND_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, yu[FIND_MY_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, yu[FIND_HOSTILE_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, yu[FIND_EXIT_TOP] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, yu[FIND_EXIT_RIGHT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, yu[FIND_EXIT_BOTTOM] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, yu[FIND_EXIT_LEFT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, yu[FIND_EXIT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
};

var xu = new lt({}, e.memoryManager), Au = new dt({}, e.memoryManager), Mu = !1, ku = !1;

function Nu() {
var t, r;
ku && Game.time % 10 != 0 || Ft.info("SwarmBot loop executing at tick ".concat(Game.time), {
subsystem: "SwarmBot",
meta: {
systemsInitialized: ku
}
}), ku || (Ot({
level: (r = ae()).debug ? ft.DEBUG : ft.INFO,
cpuLogging: r.profiling,
enableBatching: !0,
maxBatchSize: 50
}), Ft.info("Bot initialized", {
subsystem: "SwarmBot",
meta: {
debug: r.debug,
profiling: r.profiling
}
}), tn.initialize(), r.profiling && (function() {
if (PathFinder.search && !PathFinder.search.__nativeCallsTrackerWrapped) {
var e = Object.getOwnPropertyDescriptor(PathFinder, "search");
if (e && !1 === e.configurable) Ns.warn("Cannot wrap PathFinder.search - property is not configurable"); else {
var t = PathFinder.search;
try {
var r = function() {
for (var e = [], r = 0; r < arguments.length; r++) e[r] = arguments[r];
return tn.recordNativeCall("pathfinderSearch"), t.apply(PathFinder, e);
};
r.__nativeCallsTrackerWrapped = !0, Object.defineProperty(PathFinder, "search", {
value: r,
writable: !0,
enumerable: !0,
configurable: !0
});
} catch (e) {
Ns.warn("Failed to wrap PathFinder.search", {
meta: {
error: String(e)
}
});
}
}
}
}(), Is(t = Creep.prototype, "moveTo", "moveTo"), Is(t, "move", "move"), Is(t, "harvest", "harvest"), 
Is(t, "transfer", "transfer"), Is(t, "withdraw", "withdraw"), Is(t, "build", "build"), 
Is(t, "repair", "repair"), Is(t, "upgradeController", "upgradeController"), Is(t, "attack", "attack"), 
Is(t, "rangedAttack", "rangedAttack"), Is(t, "heal", "heal"), Is(t, "dismantle", "dismantle"), 
Is(t, "say", "say")), yr.on("structure.destroyed", function(t) {
var r = e.memoryManager.getSwarmState(t.roomName);
r && (Fi.onStructureDestroyed(r, t.structureType), Me.debug("Pheromone update: structure destroyed in ".concat(t.roomName), {
subsystem: "Pheromone",
room: t.roomName
}));
}), yr.on("remote.lost", function(t) {
var r = e.memoryManager.getSwarmState(t.homeRoom);
r && (Fi.onRemoteSourceLost(r), Me.info("Pheromone update: remote source lost for ".concat(t.homeRoom), {
subsystem: "Pheromone",
room: t.homeRoom
}));
}), Me.info("Pheromone event handlers initialized", {
subsystem: "Pheromone"
}), bu.initializePathCacheEvents(), Tu.initialize(Zo.MEDIUM), e.heapCache.initialize(), 
Vl.initialize(), ku = !0), yr.updateFromCpuConfig(ae().cpu), Mu || (Ft.info("Registering all processes with kernel...", {
subsystem: "ProcessRegistry"
}), function() {
for (var e, t, r = [], o = 0; o < arguments.length; o++) r[o] = arguments[o];
try {
for (var n = a(r), i = n.next(); !i.done; i = n.next()) _r(i.value);
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
Ft.info("Registered decorated processes from ".concat(r.length, " instance(s)"), {
subsystem: "ProcessDecorators"
});
}(jl, Bc, Vc, kc, dl, Dr, Kl, Pc, Gl, Dl, Il, mo, ho, Vl, ul, ao, gc, Qa, Ga), Ft.info("Registered ".concat(yr.getProcesses().length, " processes with kernel"), {
subsystem: "ProcessRegistry"
}), yr.initialize(), Mu = !0), tn.startTick(), "critical" === yr.getBucketMode() && Game.time % 10 == 0 && Ft.warn("CRITICAL: CPU bucket at ".concat(Game.cpu.bucket, ", continuing normal processing"), {
subsystem: "SwarmBot"
}), zl.clear(), Mn.clear(), or.startTick();
var o, n = "_ownedRooms", i = "_ownedRoomsTick", s = global, c = s[n], l = s[i];
c && l === Game.time ? o = c : (o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), s[n] = o, s[i] = Game.time), Dn.preTick(), e.memoryManager.initialize(), tn.measureSubsystem("processSync", function() {
Ui.syncCreepProcesses(), bs.syncRoomProcesses();
}), tn.measureSubsystem("kernel", function() {
yr.run();
}), tn.measureSubsystem("eventQueue", function() {
or.processQueue();
}), tn.measureSubsystem("spawns", function() {
!function() {
var t, r, o;
try {
for (var n = a(Object.values(Game.rooms)), i = n.next(); !i.done; i = n.next()) {
var s = i.value;
(null === (o = s.controller) || void 0 === o ? void 0 : o.my) && uu(s, e.memoryManager.getOrInitSwarmState(s.name));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}();
}), tn.measureSubsystem("ss2PacketQueue", function() {
ks.processQueue();
}), yr.hasCpuBudget() && tn.measureSubsystem("powerCreeps", function() {
!function() {
var e, t;
try {
for (var r = a(Object.values(Game.powerCreeps)), o = r.next(); !o.done; o = r.next()) {
var n = o.value;
void 0 !== n.ticksToLive && Ci(n);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
o && !o.done && (t = r.return) && t.call(r);
} finally {
if (e) throw e.error;
}
}
}();
}), yr.hasCpuBudget() && tn.measureSubsystem("visualizations", function() {
!function() {
var e, t;
if (ae().visualizations) {
var r = function() {
var e;
return null !== (e = fe.get("ownedRooms", {
namespace: "game",
ttl: 1,
compute: function() {
return Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
}
})) && void 0 !== e ? e : [];
}();
try {
for (var o = a(r), n = o.next(); !n.done; n = o.next()) {
var i = n.value;
try {
xu.draw(i);
} catch (e) {
var s = e instanceof Error ? e.message : String(e);
Ft.error("Visualization error in ".concat(i.name, ": ").concat(s), {
subsystem: "visualizations",
room: i.name
});
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
try {
Au.draw();
} catch (e) {
s = e instanceof Error ? e.message : String(e), Ft.error("Map visualization error: ".concat(s), {
subsystem: "visualizations"
});
}
}
}();
}), Dn.reconcileTraffic(), yr.hasCpuBudget() && tn.measureSubsystem("scheduledTasks", function() {
var e;
e = Math.max(0, Game.cpu.limit - Game.cpu.getUsed()), yn.run(e);
}), e.memoryManager.persistHeapCache(), tn.collectProcessStats(yr.getProcesses().reduce(function(e, t) {
return e.set(t.id, t), e;
}, new Map)), tn.collectKernelBudgetStats(yr), tn.setSkippedProcesses(yr.getSkippedProcessesThisTick()), 
tn.finalizeTick(), Ft.flush();
}

var Iu = function() {
function t() {}
return t.prototype.toggleVisualizations = function() {
var e = !ae().visualizations;
return ie({
visualizations: e
}), "Visualizations: ".concat(e ? "ENABLED" : "DISABLED");
}, t.prototype.toggleVisualization = function(e) {
var t = xu.getConfig(), r = Object.keys(t).filter(function(e) {
return e.startsWith("show") && "boolean" == typeof t[e];
});
if (!r.includes(e)) return "Invalid key: ".concat(e, ". Valid keys: ").concat(r.join(", "));
var o = e;
xu.toggle(o);
var n = xu.getConfig()[o];
return "Room visualization '".concat(e, "': ").concat(n ? "ENABLED" : "DISABLED");
}, t.prototype.toggleMapVisualization = function(e) {
var t = Au.getConfig(), r = Object.keys(t).filter(function(e) {
return e.startsWith("show") && "boolean" == typeof t[e];
});
if (!r.includes(e)) return "Invalid key: ".concat(e, ". Valid keys: ").concat(r.join(", "));
var o = e;
Au.toggle(o);
var n = Au.getConfig()[o];
return "Map visualization '".concat(e, "': ").concat(n ? "ENABLED" : "DISABLED");
}, t.prototype.showMapConfig = function() {
var e = Au.getConfig();
return Object.entries(e).map(function(e) {
var t = i(e, 2), r = t[0], o = t[1];
return "".concat(r, ": ").concat(String(o));
}).join("\n");
}, t.prototype.setVisMode = function(e) {
var t = [ "debug", "presentation", "minimal", "performance" ];
return t.includes(e) ? (it.setMode(e), "Visualization mode set to: ".concat(e)) : "Invalid mode: ".concat(e, ". Valid modes: ").concat(t.join(", "));
}, t.prototype.toggleVisLayer = function(t) {
var r = {
pheromones: e.VisualizationLayer.Pheromones,
paths: e.VisualizationLayer.Paths,
traffic: e.VisualizationLayer.Traffic,
defense: e.VisualizationLayer.Defense,
economy: e.VisualizationLayer.Economy,
construction: e.VisualizationLayer.Construction,
performance: e.VisualizationLayer.Performance
}, o = r[t.toLowerCase()];
if (!o) return "Unknown layer: ".concat(t, ". Valid layers: ").concat(Object.keys(r).join(", "));
it.toggleLayer(o);
var n = it.isLayerEnabled(o);
return "Layer ".concat(t, ": ").concat(n ? "enabled" : "disabled");
}, t.prototype.showVisPerf = function() {
var e, t, r = it.getPerformanceMetrics(), o = "=== Visualization Performance ===\n";
o += "Total CPU: ".concat(r.totalCost.toFixed(3), "\n"), o += "% of Budget: ".concat(r.percentOfBudget.toFixed(2), "%\n"), 
o += "\nPer-Layer Costs:\n";
try {
for (var n = a(Object.entries(r.layerCosts)), s = n.next(); !s.done; s = n.next()) {
var c = i(s.value, 2), l = c[0], u = c[1];
u > 0 && (o += "  ".concat(l, ": ").concat(u.toFixed(3), " CPU\n"));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, t.prototype.showVisConfig = function() {
var t, r, o, n = it.getConfig(), s = "=== Visualization Configuration ===\n";
s += "Mode: ".concat(n.mode, "\n"), s += "\nEnabled Layers:\n";
var c = ((t = {})[e.VisualizationLayer.Pheromones] = "Pheromones", t[e.VisualizationLayer.Paths] = "Paths", 
t[e.VisualizationLayer.Traffic] = "Traffic", t[e.VisualizationLayer.Defense] = "Defense", 
t[e.VisualizationLayer.Economy] = "Economy", t[e.VisualizationLayer.Construction] = "Construction", 
t[e.VisualizationLayer.Performance] = "Performance", t);
try {
for (var l = a(Object.entries(c)), u = l.next(); !u.done; u = l.next()) {
var m = i(u.value, 2), p = m[0], d = m[1], f = parseInt(p, 10), y = 0 !== (n.enabledLayers & f);
s += "  ".concat(d, ": ").concat(y ? "✓" : "✗", "\n");
}
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
return s;
}, t.prototype.clearVisCache = function(e) {
return it.clearCache(e), e ? "Visualization cache cleared for room: ".concat(e) : "All visualization caches cleared";
}, n([ Yt({
name: "toggleVisualizations",
description: "Toggle all visualizations on/off",
usage: "toggleVisualizations()",
examples: [ "toggleVisualizations()" ],
category: "Visualization"
}) ], t.prototype, "toggleVisualizations", null), n([ Yt({
name: "toggleVisualization",
description: "Toggle a specific room visualization feature",
usage: "toggleVisualization(key)",
examples: [ "toggleVisualization('showPheromones')", "toggleVisualization('showPaths')", "toggleVisualization('showCombat')" ],
category: "Visualization"
}) ], t.prototype, "toggleVisualization", null), n([ Yt({
name: "toggleMapVisualization",
description: "Toggle a specific map visualization feature",
usage: "toggleMapVisualization(key)",
examples: [ "toggleMapVisualization('showRoomStatus')", "toggleMapVisualization('showConnections')", "toggleMapVisualization('showThreats')", "toggleMapVisualization('showExpansion')" ],
category: "Visualization"
}) ], t.prototype, "toggleMapVisualization", null), n([ Yt({
name: "showMapConfig",
description: "Show current map visualization configuration",
usage: "showMapConfig()",
examples: [ "showMapConfig()" ],
category: "Visualization"
}) ], t.prototype, "showMapConfig", null), n([ Yt({
name: "setVisMode",
description: "Set visualization mode preset (debug, presentation, minimal, performance)",
usage: "setVisMode(mode)",
examples: [ "setVisMode('debug')", "setVisMode('presentation')", "setVisMode('minimal')", "setVisMode('performance')" ],
category: "Visualization"
}) ], t.prototype, "setVisMode", null), n([ Yt({
name: "toggleVisLayer",
description: "Toggle a specific visualization layer",
usage: "toggleVisLayer(layer)",
examples: [ "toggleVisLayer('pheromones')", "toggleVisLayer('paths')", "toggleVisLayer('defense')", "toggleVisLayer('economy')", "toggleVisLayer('performance')" ],
category: "Visualization"
}) ], t.prototype, "toggleVisLayer", null), n([ Yt({
name: "showVisPerf",
description: "Show visualization performance metrics",
usage: "showVisPerf()",
examples: [ "showVisPerf()" ],
category: "Visualization"
}) ], t.prototype, "showVisPerf", null), n([ Yt({
name: "showVisConfig",
description: "Show current visualization configuration",
usage: "showVisConfig()",
examples: [ "showVisConfig()" ],
category: "Visualization"
}) ], t.prototype, "showVisConfig", null), n([ Yt({
name: "clearVisCache",
description: "Clear visualization cache",
usage: "clearVisCache(roomName?)",
examples: [ "clearVisCache()", "clearVisCache('W1N1')" ],
category: "Visualization"
}) ], t.prototype, "clearVisCache", null), t;
}(), Pu = function() {
function e() {}
return e.prototype.status = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = Vl.getCurrentShardState();
if (!o) return "No shard state found for ".concat(r);
var n = o.health, a = [ "=== Shard Status: ".concat(r, " ==="), "Role: ".concat(o.role.toUpperCase()), "Rooms: ".concat(n.roomCount, " (Avg RCL: ").concat(n.avgRCL, ")"), "Creeps: ".concat(n.creepCount), "CPU: ".concat(n.cpuCategory.toUpperCase(), " (").concat(Math.round(100 * n.cpuUsage), "%)"), "Bucket: ".concat(n.bucketLevel), "Economy Index: ".concat(n.economyIndex, "%"), "War Index: ".concat(n.warIndex, "%"), "Portals: ".concat(o.portals.length), "Active Tasks: ".concat(o.activeTasks.length), "Last Update: ".concat(n.lastUpdate) ];
return o.cpuLimit && a.push("CPU Limit: ".concat(o.cpuLimit)), a.join("\n");
}, e.prototype.all = function() {
var e, t, r = Vl.getAllShards();
if (0 === r.length) return "No shards tracked yet";
var o = [ "=== All Shards ===" ];
try {
for (var n = a(r), i = n.next(); !i.done; i = n.next()) {
var s = i.value, c = s.health;
o.push("".concat(s.name, " [").concat(s.role, "]: ").concat(c.roomCount, " rooms, RCL ").concat(c.avgRCL, ", ") + "CPU ".concat(c.cpuCategory, " (").concat(Math.round(100 * c.cpuUsage), "%), ") + "Eco ".concat(c.economyIndex, "%, War ").concat(c.warIndex, "%"));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o.join("\n");
}, e.prototype.setRole = function(e) {
var t = [ "core", "frontier", "resource", "backup", "war" ];
return t.includes(e) ? (Vl.setShardRole(e), "Shard role set to: ".concat(e.toUpperCase())) : "Invalid role: ".concat(e, ". Valid roles: ").concat(t.join(", "));
}, e.prototype.portals = function(e) {
var t, r, o, n, i, s = null !== (n = null === (o = Game.shard) || void 0 === o ? void 0 : o.name) && void 0 !== n ? n : "shard0", c = Vl.getCurrentShardState();
if (!c) return "No shard state found for ".concat(s);
var l = c.portals;
if (e && (l = l.filter(function(t) {
return t.targetShard === e;
})), 0 === l.length) return e ? "No portals to ".concat(e) : "No portals discovered yet";
var u = [ e ? "=== Portals to ".concat(e, " ===") : "=== All Portals ===" ];
try {
for (var m = a(l), p = m.next(); !p.done; p = m.next()) {
var d = p.value, f = d.isStable ? "✓" : "✗", y = "⚠".repeat(d.threatRating), g = null !== (i = d.traversalCount) && void 0 !== i ? i : 0, h = Game.time - d.lastScouted;
u.push("".concat(d.sourceRoom, " → ").concat(d.targetShard, "/").concat(d.targetRoom, " ") + "[".concat(f, "] ").concat(y || "○", " (").concat(g, " uses, ").concat(h, "t ago)"));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
p && !p.done && (r = m.return) && r.call(m);
} finally {
if (t) throw t.error;
}
}
return u.join("\n");
}, e.prototype.bestPortal = function(e, t) {
var r, o = Vl.getOptimalPortalRoute(e, t);
if (!o) return "No portal found to ".concat(e);
var n = o.isStable ? "Stable" : "Unstable", a = o.threatRating > 0 ? " (Threat: ".concat(o.threatRating, ")") : "";
return "Best portal to ".concat(e, ":\n") + "  Source: ".concat(o.sourceRoom, " (").concat(o.sourcePos.x, ",").concat(o.sourcePos.y, ")\n") + "  Target: ".concat(o.targetShard, "/").concat(o.targetRoom, "\n") + "  Status: ".concat(n).concat(a, "\n") + "  Traversals: ".concat(null !== (r = o.traversalCount) && void 0 !== r ? r : 0, "\n") + "  Last Scouted: ".concat(Game.time - o.lastScouted, " ticks ago");
}, e.prototype.createTask = function(e, t, r, o) {
void 0 === o && (o = 50);
var n = [ "colonize", "reinforce", "transfer", "evacuate" ];
return n.includes(e) ? (Vl.createTask(e, t, r, o), "Created ".concat(e, " task to ").concat(t).concat(r ? "/".concat(r) : "", " (priority: ").concat(o, ")")) : "Invalid task type: ".concat(e, ". Valid types: ").concat(n.join(", "));
}, e.prototype.transferResource = function(e, t, r, o, n) {
return void 0 === n && (n = 50), Vl.createResourceTransferTask(e, t, r, o, n), "Created resource transfer task:\n" + "  ".concat(o, " ").concat(r, " → ").concat(e, "/").concat(t, "\n") + "  Priority: ".concat(n);
}, e.prototype.transfers = function() {
var e, t, r = sl.getActiveRequests();
if (0 === r.length) return "No active resource transfers";
var o = [ "=== Active Resource Transfers ===" ];
try {
for (var n = a(r), i = n.next(); !i.done; i = n.next()) {
var s = i.value, c = Math.round(s.transferred / s.amount * 100), l = s.assignedCreeps.length;
o.push("".concat(s.taskId, ": ").concat(s.amount, " ").concat(s.resourceType, "\n") + "  ".concat(s.sourceRoom, " → ").concat(s.targetShard, "/").concat(s.targetRoom, "\n") + "  Status: ".concat(s.status.toUpperCase(), " (").concat(c, "%)\n") + "  Creeps: ".concat(l, ", Priority: ").concat(s.priority));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o.join("\n");
}, e.prototype.cpuHistory = function() {
var e, t, r = Vl.getCurrentShardState();
if (!r || !r.cpuHistory || 0 === r.cpuHistory.length) return "No CPU history available";
var o = [ "=== CPU Allocation History ===" ];
try {
for (var n = a(r.cpuHistory.slice(-10)), i = n.next(); !i.done; i = n.next()) {
var s = i.value, c = Math.round(s.cpuUsed / s.cpuLimit * 100);
o.push("Tick ".concat(s.tick, ": ").concat(s.cpuUsed.toFixed(2), "/").concat(s.cpuLimit, " (").concat(c, "%) ") + "Bucket: ".concat(s.bucketLevel));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o.join("\n");
}, e.prototype.tasks = function() {
var e, t, r, o = Vl.getActiveTransferTasks();
if (0 === o.length) return "No active inter-shard tasks";
var n = [ "=== Inter-Shard Tasks ===" ];
try {
for (var i = a(o), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = null !== (r = c.progress) && void 0 !== r ? r : 0;
n.push("".concat(c.id, " [").concat(c.type.toUpperCase(), "]\n") + "  ".concat(c.sourceShard, " → ").concat(c.targetShard).concat(c.targetRoom ? "/".concat(c.targetRoom) : "", "\n") + "  Status: ".concat(c.status.toUpperCase(), " (").concat(l, "%)\n") + "  Priority: ".concat(c.priority));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = i.return) && t.call(i);
} finally {
if (e) throw e.error;
}
}
return n.join("\n");
}, e.prototype.syncStatus = function() {
var e = Vl.getSyncStatus(), t = e.isHealthy ? "✓ HEALTHY" : "⚠ DEGRADED";
return "=== InterShardMemory Sync Status ===\n" + "Status: ".concat(t, "\n") + "Last Sync: ".concat(e.lastSync, " (").concat(e.ticksSinceSync, " ticks ago)\n") + "Memory Usage: ".concat(e.memorySize, " / ").concat($c, " bytes (").concat(e.sizePercent, "%)\n") + "Shards Tracked: ".concat(e.shardsTracked, "\n") + "Active Tasks: ".concat(e.activeTasks, "\n") + "Total Portals: ".concat(e.totalPortals);
}, e.prototype.memoryStats = function() {
var e = Vl.getMemoryStats();
return "=== InterShardMemory Usage ===\n" + "Total: ".concat(e.size, " / ").concat(e.limit, " bytes (").concat(e.percent, "%)\n") + "\nBreakdown:\n" + "  Shards: ".concat(e.breakdown.shards, " bytes\n") + "  Tasks: ".concat(e.breakdown.tasks, " bytes\n") + "  Portals: ".concat(e.breakdown.portals, " bytes\n") + "  Other: ".concat(e.breakdown.other, " bytes");
}, e.prototype.forceSync = function() {
return Vl.forceSync(), "InterShardMemory sync forced. Check logs for results.";
}, n([ Yt({
name: "shard.status",
description: "Display current shard status and metrics",
usage: "shard.status()",
examples: [ "shard.status()" ],
category: "Shard"
}) ], e.prototype, "status", null), n([ Yt({
name: "shard.all",
description: "List all known shards with summary info",
usage: "shard.all()",
examples: [ "shard.all()" ],
category: "Shard"
}) ], e.prototype, "all", null), n([ Yt({
name: "shard.setRole",
description: "Manually set the role for the current shard",
usage: "shard.setRole(role)",
examples: [ "shard.setRole('core')", "shard.setRole('frontier')", "shard.setRole('resource')", "shard.setRole('backup')", "shard.setRole('war')" ],
category: "Shard"
}) ], e.prototype, "setRole", null), n([ Yt({
name: "shard.portals",
description: "List all known portals from the current shard",
usage: "shard.portals(targetShard?)",
examples: [ "shard.portals()", "shard.portals('shard1')" ],
category: "Shard"
}) ], e.prototype, "portals", null), n([ Yt({
name: "shard.bestPortal",
description: "Find the optimal portal route to a target shard",
usage: "shard.bestPortal(targetShard, fromRoom?)",
examples: [ "shard.bestPortal('shard1')", "shard.bestPortal('shard2', 'E1N1')" ],
category: "Shard"
}) ], e.prototype, "bestPortal", null), n([ Yt({
name: "shard.createTask",
description: "Create a cross-shard task",
usage: "shard.createTask(type, targetShard, targetRoom?, priority?)",
examples: [ "shard.createTask('colonize', 'shard1', 'E5N5', 80)", "shard.createTask('reinforce', 'shard2', 'W1N1', 90)", "shard.createTask('evacuate', 'shard0', 'E1N1', 100)" ],
category: "Shard"
}) ], e.prototype, "createTask", null), n([ Yt({
name: "shard.transferResource",
description: "Create a cross-shard resource transfer task",
usage: "shard.transferResource(targetShard, targetRoom, resourceType, amount, priority?)",
examples: [ "shard.transferResource('shard1', 'E5N5', 'energy', 50000, 70)", "shard.transferResource('shard2', 'W1N1', 'U', 5000, 80)" ],
category: "Shard"
}) ], e.prototype, "transferResource", null), n([ Yt({
name: "shard.transfers",
description: "List active cross-shard resource transfers",
usage: "shard.transfers()",
examples: [ "shard.transfers()" ],
category: "Shard"
}) ], e.prototype, "transfers", null), n([ Yt({
name: "shard.cpuHistory",
description: "Display CPU allocation history for the current shard",
usage: "shard.cpuHistory()",
examples: [ "shard.cpuHistory()" ],
category: "Shard"
}) ], e.prototype, "cpuHistory", null), n([ Yt({
name: "shard.tasks",
description: "List all inter-shard tasks",
usage: "shard.tasks()",
examples: [ "shard.tasks()" ],
category: "Shard"
}) ], e.prototype, "tasks", null), n([ Yt({
name: "shard.syncStatus",
description: "Display InterShardMemory sync status and health",
usage: "shard.syncStatus()",
examples: [ "shard.syncStatus()" ],
category: "Shard"
}) ], e.prototype, "syncStatus", null), n([ Yt({
name: "shard.memoryStats",
description: "Display InterShardMemory size breakdown",
usage: "shard.memoryStats()",
examples: [ "shard.memoryStats()" ],
category: "Shard"
}) ], e.prototype, "memoryStats", null), n([ Yt({
name: "shard.forceSync",
description: "Force a full InterShardMemory sync with validation",
usage: "shard.forceSync()",
examples: [ "shard.forceSync()" ],
category: "Shard"
}) ], e.prototype, "forceSync", null), e;
}(), Gu = new Pu;

function Lu(e) {
var t = e.match(/\((.*?)\)/);
if (t && t[1]) {
var r = t[1].split(",").map(function(e) {
return e.trim();
}).filter(function(e) {
return e;
});
if (0 !== r.length) return r.map(function(e) {
return {
name: e,
desc: "Parameter: ".concat(e)
};
});
}
}

!function() {
function e() {}
e.prototype.uiHelp = function(e) {
return e ? function(e) {
var t = Wt.getCommandsByCategory(), r = t.get(e);
if (!r || 0 === r.length) return 'Category "'.concat(e, '" not found. Available categories: ').concat(Array.from(t.keys()).join(", "));
var o = r.map(function(e) {
var t, r;
return {
title: e.metadata.description,
describe: null === (t = e.metadata.examples) || void 0 === t ? void 0 : t[0],
functionName: e.metadata.name,
commandType: !(null === (r = e.metadata.usage) || void 0 === r ? void 0 : r.includes("(")),
params: e.metadata.usage ? Lu(e.metadata.usage) : void 0
};
});
return Sn({
name: e,
describe: "".concat(e, " commands"),
api: o
});
}(e) : function() {
var e, t, r = Wt.getCommandsByCategory(), o = [];
try {
for (var n = a(r), c = n.next(); !c.done; c = n.next()) {
var l = i(c.value, 2), u = l[0], m = l[1].map(function(e) {
var t, r = {
title: e.metadata.description,
functionName: e.metadata.name,
commandType: !(null === (t = e.metadata.usage) || void 0 === t ? void 0 : t.includes("("))
};
if (e.metadata.examples && e.metadata.examples.length > 0 && (r.describe = e.metadata.examples[0]), 
e.metadata.usage) {
var o = e.metadata.usage.match(/\((.*?)\)/);
if (o && o[1]) {
var n = o[1].split(",").map(function(e) {
return e.trim();
}).filter(function(e) {
return e;
});
n.length > 0 && (r.params = n.map(function(e) {
return {
name: e,
desc: "Parameter: ".concat(e)
};
}));
}
}
return r;
});
o.push({
name: u,
describe: "".concat(u, " commands for bot management"),
api: m
});
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return Sn.apply(void 0, s([], i(o), !1));
}();
}, e.prototype.spawnForm = function(e) {
return Game.rooms[e] ? Cn.form("spawnCreep", [ {
type: "select",
name: "role",
label: "Role:",
options: [ {
value: "harvester",
label: "Harvester"
}, {
value: "upgrader",
label: "Upgrader"
}, {
value: "builder",
label: "Builder"
}, {
value: "hauler",
label: "Hauler"
}, {
value: "repairer",
label: "Repairer"
}, {
value: "defender",
label: "Defender"
} ]
}, {
type: "input",
name: "name",
label: "Name (optional):",
placeholder: "Auto-generated if empty"
} ], {
content: "Spawn Creep",
command: "({role, name}) => {\n        const room = Game.rooms['".concat(e, "'];\n        if (!room) return 'Room not found';\n        const spawns = room.find(FIND_MY_SPAWNS);\n        if (spawns.length === 0) return 'No spawns found';\n        const spawn = spawns[0];\n        const body = [WORK, CARRY, MOVE]; // Basic body\n        const creepName = name || role + '_' + Game.time;\n        const result = spawn.spawnCreep(body, creepName, {memory: {role: role}});\n        return result === OK ? 'Spawning ' + creepName : 'Error: ' + result;\n      }")
}) : Tn("Room ".concat(e, " not found or not visible"), "red", !0);
}, e.prototype.roomControl = function(e) {
var t = Game.rooms[e];
if (!t) return Tn("Room ".concat(e, " not found or not visible"), "red", !0);
var r = '<div style="background: #2b2b2b; padding: 10px; margin: 5px;">';
return r += '<h3 style="color: #c5c599; margin: 0 0 10px 0;">Room Control: '.concat(e, "</h3>"), 
r += '<div style="margin-bottom: 10px;">', r += Tn("Energy: ".concat(t.energyAvailable, "/").concat(t.energyCapacityAvailable), "green") + "<br>", 
t.controller && (r += Tn("Controller Level: ".concat(t.controller.level, " (").concat(t.controller.progress, "/").concat(t.controller.progressTotal, ")"), "blue") + "<br>"), 
r += "</div>", r += Cn.button({
content: "🔄 Toggle Visualizations",
command: "() => {\n        const config = global.botConfig.getConfig();\n        global.botConfig.updateConfig({visualizations: !config.visualizations});\n        return 'Visualizations: ' + (!config.visualizations ? 'ON' : 'OFF');\n      }"
}), r += " ", (r += Cn.button({
content: "📊 Room Stats",
command: "() => {\n        const room = Game.rooms['".concat(e, "'];\n        if (!room) return 'Room not found';\n        let stats = '=== Room Stats ===\\n';\n        stats += 'Energy: ' + room.energyAvailable + '/' + room.energyCapacityAvailable + '\\n';\n        stats += 'Creeps: ' + Object.values(Game.creeps).filter(c => c.room.name === '").concat(e, "').length + '\\n';\n        if (room.controller) {\n          stats += 'RCL: ' + room.controller.level + '\\n';\n          stats += 'Progress: ' + room.controller.progress + '/' + room.controller.progressTotal + '\\n';\n        }\n        return stats;\n      }")
})) + "</div>";
}, e.prototype.logForm = function() {
return Cn.form("configureLogging", [ {
type: "select",
name: "level",
label: "Log Level:",
options: [ {
value: "debug",
label: "Debug (Verbose)"
}, {
value: "info",
label: "Info (Normal)"
}, {
value: "warn",
label: "Warning (Important)"
}, {
value: "error",
label: "Error (Critical Only)"
}, {
value: "none",
label: "None (Disabled)"
} ]
} ], {
content: "Set Log Level",
command: "({level}) => {\n        const levelMap = {\n          debug: 0,\n          info: 1,\n          warn: 2,\n          error: 3,\n          none: 4\n        };\n        const logLevel = levelMap[level];\n        global.botLogger.configureLogger({level: logLevel});\n        return 'Log level set to: ' + level.toUpperCase();\n      }"
});
}, e.prototype.visForm = function() {
return Cn.form("configureVisualization", [ {
type: "select",
name: "mode",
label: "Visualization Mode:",
options: [ {
value: "debug",
label: "Debug (All layers)"
}, {
value: "presentation",
label: "Presentation (Clean)"
}, {
value: "minimal",
label: "Minimal (Basic only)"
}, {
value: "performance",
label: "Performance (Disabled)"
} ]
} ], {
content: "Set Visualization Mode",
command: "({mode}) => {\n        global.botVisualizationManager.setMode(mode);\n        return 'Visualization mode set to: ' + mode;\n      }"
});
}, e.prototype.quickActions = function() {
var e = '<div style="background: #2b2b2b; padding: 10px; margin: 5px;">';
return e += '<h3 style="color: #c5c599; margin: 0 0 10px 0;">Quick Actions</h3>', 
e += Cn.button({
content: "🚨 Emergency Mode",
command: "() => {\n        const config = global.botConfig.getConfig();\n        global.botConfig.updateConfig({emergencyMode: !config.emergencyMode});\n        return 'Emergency Mode: ' + (!config.emergencyMode ? 'ON' : 'OFF');\n      }"
}), e += " ", e += Cn.button({
content: "🐛 Toggle Debug",
command: "() => {\n        const config = global.botConfig.getConfig();\n        const newValue = !config.debug;\n        global.botConfig.updateConfig({debug: newValue});\n        global.botLogger.configureLogger({level: newValue ? 0 : 1});\n        return 'Debug mode: ' + (newValue ? 'ON' : 'OFF');\n      }"
}), e += " ", (e += Cn.button({
content: "🗑️ Clear Cache",
command: "() => {\n        global.botCacheManager.clear();\n        return 'Cache cleared successfully';\n      }"
})) + "</div>";
}, e.prototype.colorDemo = function() {
var e = "=== Console Color Demo ===\n\n";
return e += Tn("✓ Success message", "green", !0) + "\n", e += Tn("⚠ Warning message", "yellow", !0) + "\n", 
e += Tn("✗ Error message", "red", !0) + "\n", e += Tn("ℹ Info message", "blue", !0) + "\n", 
(e += "\nNormal text: " + Tn("colored text", "green") + " normal text\n") + "Bold text: " + Tn("important", null, !0) + "\n";
}, n([ Yt({
name: "uiHelp",
description: "Show interactive help interface with expandable sections",
usage: "uiHelp()",
examples: [ "uiHelp()", 'uiHelp("Logging")', 'uiHelp("Visualization")' ],
category: "System"
}) ], e.prototype, "uiHelp", null), n([ Yt({
name: "spawnForm",
description: "Show interactive form for spawning creeps",
usage: "spawnForm(roomName)",
examples: [ 'spawnForm("W1N1")', 'spawnForm("E2S3")' ],
category: "Spawning"
}) ], e.prototype, "spawnForm", null), n([ Yt({
name: "roomControl",
description: "Show interactive room control panel",
usage: "roomControl(roomName)",
examples: [ 'roomControl("W1N1")' ],
category: "Room Management"
}) ], e.prototype, "roomControl", null), n([ Yt({
name: "logForm",
description: "Show interactive form for configuring logging",
usage: "logForm()",
examples: [ "logForm()" ],
category: "Logging"
}) ], e.prototype, "logForm", null), n([ Yt({
name: "visForm",
description: "Show interactive form for visualization settings",
usage: "visForm()",
examples: [ "visForm()" ],
category: "Visualization"
}) ], e.prototype, "visForm", null), n([ Yt({
name: "quickActions",
description: "Show quick action buttons for common operations",
usage: "quickActions()",
examples: [ "quickActions()" ],
category: "System"
}) ], e.prototype, "quickActions", null), n([ Yt({
name: "colorDemo",
description: "Show color demonstration for console output",
usage: "colorDemo()",
examples: [ "colorDemo()" ],
category: "System"
}) ], e.prototype, "colorDemo", null);
}();

var Du = new Us, Fu = new Iu, Bu = new xs, Hu = new Ko, Wu = new ws, Yu = new As, Ku = Dt("Main");

!function(e) {
void 0 === e && (e = !1);
var t = function() {
Wt.initialize(), Kt(Du), Kt(Fu), Kt(Bu), Kt(Hu), Kt(Wu), Kt(Yu), Kt(Ho), Kt(Wo), 
Kt(Yo), Kt(Gu), Kt(Qt), Kt(Br), Kt(co), global.tooangel = io;
var e = global;
e.botConfig = {
getConfig: ae,
updateConfig: ie
}, e.botLogger = {
configureLogger: Ot
}, e.botVisualizationManager = it, e.botCacheManager = fe, Wt.exposeToGlobal();
};
e ? (Wt.initialize(), Wt.enableLazyLoading(t), Wt.exposeToGlobal()) : t();
}(ae().lazyLoadConsoleCommands);

var Vu = re.wrapLoop(function() {
try {
Nu();
} catch (e) {
throw Ku.error("Critical error in main loop: ".concat(String(e)), {
meta: {
stack: e instanceof Error ? e.stack : void 0,
tick: Game.time
}
}), e;
}
});

exports.loop = Vu;
