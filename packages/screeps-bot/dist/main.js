"use strict";

var e = function(t, r) {
return e = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
}, e(t, r);
};

function t(t, r) {
if ("function" != typeof r && null !== r) throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
function o() {
this.constructor = t;
}
e(t, r), t.prototype = null === r ? Object.create(r) : (o.prototype = r.prototype, 
new o);
}

var r = function() {
return r = Object.assign || function(e) {
for (var t, r = 1, o = arguments.length; r < o; r++) for (var n in t = arguments[r]) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
return e;
}, r.apply(this, arguments);
};

function o(e, t, r, o) {
var n, a = arguments.length, i = a < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, r) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, r, o); else for (var s = e.length - 1; s >= 0; s--) (n = e[s]) && (i = (a < 3 ? n(i) : a > 3 ? n(t, r, i) : n(t, r)) || i);
return a > 3 && i && Object.defineProperty(t, r, i), i;
}

function n(e) {
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

function a(e, t) {
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

function i(e, t, r) {
if (r || 2 === arguments.length) for (var o, n = 0, a = t.length; n < a; n++) !o && n in t || (o || (o = Array.prototype.slice.call(t, 0, n)), 
o[n] = t[n]);
return e.concat(o || Array.prototype.slice.call(t));
}

"function" == typeof SuppressedError && SuppressedError;

var s = "#555555", c = "#AAAAAA", l = "#FFE87B", u = "#F53547", m = "#181818", p = "#8FBB93";

"undefined" != typeof RoomVisual && (RoomVisual.prototype.structure = function(e, t, o, n) {
void 0 === n && (n = {});
var a = r({
opacity: 1
}, n);
switch (o) {
case STRUCTURE_EXTENSION:
this.circle(e, t, {
radius: .5,
fill: m,
stroke: p,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: s,
opacity: a.opacity
});
break;

case STRUCTURE_SPAWN:
this.circle(e, t, {
radius: .65,
fill: m,
stroke: "#CCCCCC",
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: l,
opacity: a.opacity
});
break;

case STRUCTURE_POWER_SPAWN:
this.circle(e, t, {
radius: .65,
fill: m,
stroke: u,
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: l,
opacity: a.opacity
});
break;

case STRUCTURE_TOWER:
this.circle(e, t, {
radius: .6,
fill: m,
stroke: p,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: s,
opacity: a.opacity
}), this.rect(e - .2, t - .3, .4, .6, {
fill: c,
opacity: a.opacity
});
break;

case STRUCTURE_STORAGE:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: p,
strokeWidth: .05,
fill: m,
opacity: a.opacity
}), this.rect(e - .35, t - .45, .7, .9, {
fill: l,
opacity: .6 * a.opacity
});
break;

case STRUCTURE_TERMINAL:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: p,
strokeWidth: .05,
fill: m,
opacity: a.opacity
}), this.circle(e, t, {
radius: .3,
fill: c,
opacity: a.opacity
}), this.rect(e - .15, t - .15, .3, .3, {
fill: s,
opacity: a.opacity
});
break;

case STRUCTURE_LAB:
this.circle(e, t, {
radius: .55,
fill: m,
stroke: p,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: s,
opacity: a.opacity
}), this.rect(e - .15, t + .1, .3, .25, {
fill: c,
opacity: a.opacity
});
break;

case STRUCTURE_LINK:
this.circle(e, t, {
radius: .5,
fill: m,
stroke: p,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: c,
opacity: a.opacity
});
break;

case STRUCTURE_NUKER:
this.circle(e, t, {
radius: .65,
fill: m,
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
fill: m,
stroke: p,
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
fill: m,
stroke: p,
strokeWidth: .05,
opacity: a.opacity
}), this.rect(e - .35, t - .35, .7, .7, {
fill: "transparent",
stroke: s,
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
fill: m,
stroke: c,
strokeWidth: .05,
opacity: a.opacity
});
break;

case STRUCTURE_EXTRACTOR:
this.circle(e, t, {
radius: .6,
fill: m,
stroke: p,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: s,
opacity: a.opacity
});
break;

default:
this.circle(e, t, {
radius: .5,
fill: s,
stroke: p,
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
var i = null !== (a = ((n = {})[RESOURCE_ENERGY] = l, n[RESOURCE_POWER] = u, n[RESOURCE_HYDROGEN] = "#FFFFFF", 
n[RESOURCE_OXYGEN] = "#DDDDDD", n[RESOURCE_UTRIUM] = "#48C5E5", n[RESOURCE_LEMERGIUM] = "#24D490", 
n[RESOURCE_KEANIUM] = "#9269EC", n[RESOURCE_ZYNTHIUM] = "#D9B478", n[RESOURCE_CATALYST] = "#F26D6F", 
n[RESOURCE_GHODIUM] = "#FFFFFF", n)[e]) && void 0 !== a ? a : "#CCCCCC";
this.circle(t, r, {
radius: o,
fill: m,
opacity: .9
}), this.circle(t, r, {
radius: .8 * o,
fill: i,
opacity: .8
});
var s = e.length <= 2 ? e : e.substring(0, 2).toUpperCase();
this.text(s, t, r + .03, {
color: m,
font: "".concat(1.2 * o, " monospace"),
align: "center",
opacity: .9
});
});

var d = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

function f(e) {
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

var y, g, h = {}, v = {}, R = {}, E = {};

function T() {
if (y) return E;
y = 1;
const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
return E.encode = function(t) {
if (0 <= t && t < e.length) return e[t];
throw new TypeError("Must be between 0 and 63: " + t);
}, E;
}

function C() {
if (g) return R;
g = 1;
const e = T();
return R.encode = function(t) {
let r, o = "", n = function(e) {
return e < 0 ? 1 + (-e << 1) : 0 + (e << 1);
}(t);
do {
r = 31 & n, n >>>= 5, n > 0 && (r |= 32), o += e.encode(r);
} while (n > 0);
return o;
}, R;
}

var S, w, O, b = {}, _ = f(Object.freeze({
__proto__: null,
default: {}
}));

function x() {
return w ? S : (w = 1, S = "function" == typeof URL ? URL : _.URL);
}

function U() {
if (O) return b;
O = 1;
const e = x();
b.getArg = function(e, t, r) {
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
b.toSetString = t ? r : function(e) {
return o(e) ? "$" + e : e;
}, b.fromSetString = t ? r : function(e) {
return o(e) ? e.slice(1) : e;
}, b.compareByGeneratedPositionsInflated = function(e, t) {
let r = e.generatedLine - t.generatedLine;
return 0 !== r ? r : (r = e.generatedColumn - t.generatedColumn, 0 !== r ? r : (r = n(e.source, t.source), 
0 !== r ? r : (r = e.originalLine - t.originalLine, 0 !== r ? r : (r = e.originalColumn - t.originalColumn, 
0 !== r ? r : n(e.name, t.name)))));
}, b.parseSourceMapInput = function(e) {
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
return b.normalize = f, b.join = y, b.relative = function(t, r) {
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
}, b.computeSourceURL = function(e, t, r) {
e && "path-absolute" === u(t) && (t = t.replace(/^\//, ""));
let o = f(t || "");
return e && (o = y(e, o)), r && (o = y(d(r), o)), o;
}, b;
}

var k, M = {};

function A() {
if (k) return M;
k = 1;
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
return M.ArraySet = e, M;
}

var N, I, P = {};

function G() {
if (I) return v;
I = 1;
const e = C(), t = U(), r = A().ArraySet, o = function() {
if (N) return P;
N = 1;
const e = U();
return P.MappingList = class {
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
}, P;
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
return n.prototype._version = 3, v.SourceMapGenerator = n, v;
}

var L, D = {}, F = {};

function B() {
return L || (L = 1, function(e) {
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
}(F)), F;
}

var H, W, Y, K, V = {
exports: {}
};

function j() {
if (H) return V.exports;
H = 1;
let e = null;
return V.exports = function() {
if ("string" == typeof e) return fetch(e).then(e => e.arrayBuffer());
if (e instanceof ArrayBuffer) return Promise.resolve(e);
throw new Error("You must provide the string URL or ArrayBuffer contents of lib/mappings.wasm by calling SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) before using SourceMapConsumer");
}, V.exports.initialize = t => {
e = t;
}, V.exports;
}

function z() {
if (Y) return W;
Y = 1;
const e = j();
function t() {
this.generatedLine = 0, this.generatedColumn = 0, this.lastGeneratedColumn = null, 
this.source = null, this.originalLine = null, this.originalColumn = null, this.name = null;
}
let r = null;
return W = function() {
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

var q, X, Q, Z = {}, J = (X || (X = 1, h.SourceMapGenerator = G().SourceMapGenerator, 
h.SourceMapConsumer = function() {
if (K) return D;
K = 1;
const e = U(), t = B(), r = A().ArraySet;
C();
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
i.LEAST_UPPER_BOUND = 2, D.SourceMapConsumer = i;
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
s.prototype.consumer = i, D.BasicSourceMapConsumer = s;
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
return D.IndexedSourceMapConsumer = c, D;
}().SourceMapConsumer, h.SourceNode = function() {
if (q) return Z;
q = 1;
const e = G().SourceMapGenerator, t = U(), r = /(\r?\n)/, o = "$$$isSourceNode$$$";
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
}().SourceNode), h);

!function(e) {
e[e.DEBUG = 0] = "DEBUG", e[e.INFO = 1] = "INFO", e[e.WARN = 2] = "WARN", e[e.ERROR = 3] = "ERROR", 
e[e.NONE = 4] = "NONE";
}(Q || (Q = {}));

var $ = {
level: Q.INFO,
cpuLogging: !1,
enableBatching: !0,
maxBatchSize: 50
}, ee = r({}, $), te = [];

function re(e) {
ee.enableBatching ? (te.push(e), te.length >= ee.maxBatchSize && oe()) : console.log(e);
}

function oe() {
0 !== te.length && (console.log(te.join("\n")), te = []);
}

var ne = new Set([ "type", "level", "message", "tick", "subsystem", "room", "creep", "processId", "shard" ]);

function ae(e, t, r, o) {
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
r.meta)) for (var a in r.meta) ne.has(a) || (n[a] = r.meta[a]);
return JSON.stringify(n);
}

function ie(e, t) {
ee.level <= Q.DEBUG && re(ae("DEBUG", e, t));
}

function se(e, t) {
ee.level <= Q.INFO && re(ae("INFO", e, t));
}

function ce(e, t) {
ee.level <= Q.WARN && re(ae("WARN", e, t));
}

function le(e, t) {
ee.level <= Q.ERROR && re(ae("ERROR", e, t));
}

function ue(e, t, r) {
if (!ee.cpuLogging) return t();
var o = Game.cpu.getUsed(), n = t(), a = Game.cpu.getUsed() - o;
return ie("".concat(e, ": ").concat(a.toFixed(3), " CPU"), r), n;
}

var me = new Set([ "type", "key", "value", "tick", "unit", "subsystem", "room", "shard" ]);

function pe(e, t, r, o) {
var n = {
type: "stat",
key: e,
value: t,
tick: "undefined" != typeof Game ? Game.time : 0,
shard: "undefined" != typeof Game && Game.shard ? Game.shard.name : "shard0"
};
if (r && (n.unit = r), o && (o.shard && (n.shard = o.shard), o.subsystem && (n.subsystem = o.subsystem), 
o.room && (n.room = o.room), o.meta)) for (var a in o.meta) me.has(a) || (n[a] = o.meta[a]);
re(JSON.stringify(n));
}

function de(e) {
return {
debug: function(t, o) {
ie(t, "string" == typeof o ? {
subsystem: e,
room: o
} : r({
subsystem: e
}, o));
},
info: function(t, o) {
se(t, "string" == typeof o ? {
subsystem: e,
room: o
} : r({
subsystem: e
}, o));
},
warn: function(t, o) {
ce(t, "string" == typeof o ? {
subsystem: e,
room: o
} : r({
subsystem: e
}, o));
},
error: function(t, o) {
le(t, "string" == typeof o ? {
subsystem: e,
room: o
} : r({
subsystem: e
}, o));
},
stat: function(t, o, n, a) {
pe(t, o, n, "string" == typeof a ? {
subsystem: e,
room: a
} : r({
subsystem: e
}, a));
},
measureCpu: function(t, o, n) {
return ue(t, o, "string" == typeof n ? {
subsystem: e,
room: n
} : r({
subsystem: e
}, n));
}
};
}

var fe, ye = {
debug: ie,
info: se,
warn: ce,
error: le,
stat: pe,
measureCpu: ue,
configure: function(e) {
ee = r(r({}, ee), e);
},
getConfig: function() {
return r({}, ee);
},
createLogger: de,
flush: oe
};

!function(e) {
e[e.CRITICAL = 100] = "CRITICAL", e[e.HIGH = 75] = "HIGH", e[e.NORMAL = 50] = "NORMAL", 
e[e.LOW = 25] = "LOW", e[e.BACKGROUND = 10] = "BACKGROUND";
}(fe || (fe = {}));

var ge = {
"hostile.detected": fe.CRITICAL,
"nuke.detected": fe.CRITICAL,
"safemode.activated": fe.CRITICAL,
"structure.destroyed": fe.HIGH,
"hostile.cleared": fe.HIGH,
"creep.died": fe.HIGH,
"energy.critical": fe.HIGH,
"spawn.emergency": fe.HIGH,
"posture.change": fe.HIGH,
"spawn.completed": fe.NORMAL,
"rcl.upgrade": fe.NORMAL,
"construction.complete": fe.NORMAL,
"remote.lost": fe.NORMAL,
"squad.formed": fe.NORMAL,
"squad.dissolved": fe.NORMAL,
"market.transaction": fe.LOW,
"pheromone.update": fe.LOW,
"cluster.update": fe.LOW,
"expansion.candidate": fe.LOW,
"powerbank.discovered": fe.LOW,
"cpu.spike": fe.BACKGROUND,
"bucket.modeChange": fe.BACKGROUND
}, he = {
maxEventsPerTick: 50,
maxQueueSize: 200,
lowBucketThreshold: 2e3,
criticalBucketThreshold: 1e3,
maxEventAge: 100,
enableLogging: !1,
statsLogInterval: 100,
enableCoalescing: !0
}, ve = function() {
function e(e) {
void 0 === e && (e = {}), this.handlers = new Map, this.eventQueue = [], this.handlerIdCounter = 0, 
this.stats = {
eventsEmitted: 0,
eventsProcessed: 0,
eventsDeferred: 0,
eventsDropped: 0,
handlersInvoked: 0,
eventsCoalesced: 0
}, this.tickEvents = new Map, this.config = r(r({}, he), e);
}
return e.prototype.on = function(e, t, r) {
var o, n, a, i, s = this;
void 0 === r && (r = {});
var c = {
handler: t,
priority: null !== (o = r.priority) && void 0 !== o ? o : fe.NORMAL,
minBucket: null !== (n = r.minBucket) && void 0 !== n ? n : 0,
once: null !== (a = r.once) && void 0 !== a && a,
id: "handler_".concat(++this.handlerIdCounter)
}, l = null !== (i = this.handlers.get(e)) && void 0 !== i ? i : [];
return l.push(c), l.sort(function(e, t) {
return t.priority - e.priority;
}), this.handlers.set(e, l), this.config.enableLogging && ye.debug('EventBus: Registered handler for "'.concat(e, '" (id: ').concat(c.id, ")"), {
subsystem: "EventBus"
}), function() {
return s.off(e, c.id);
};
}, e.prototype.once = function(e, t, o) {
return void 0 === o && (o = {}), this.on(e, t, r(r({}, o), {
once: !0
}));
}, e.prototype.off = function(e, t) {
var r = this.handlers.get(e);
if (r) {
var o = r.findIndex(function(e) {
return e.id === t;
});
-1 !== o && (r.splice(o, 1), this.config.enableLogging && ye.debug('EventBus: Unregistered handler "'.concat(t, '" from "').concat(e, '"'), {
subsystem: "EventBus"
}));
}
}, e.prototype.offAll = function(e) {
this.handlers.delete(e), this.config.enableLogging && ye.debug('EventBus: Removed all handlers for "'.concat(e, '"'), {
subsystem: "EventBus"
});
}, e.prototype.getCoalescingKey = function(e, t) {
var r = [ e ], o = function(e, t) {
return "object" == typeof e && null !== e && t in e;
};
return o(t, "roomName") && "string" == typeof t.roomName && r.push(t.roomName), 
o(t, "processId") && "string" == typeof t.processId && r.push(t.processId), o(t, "squadId") && "string" == typeof t.squadId && r.push(t.squadId), 
o(t, "clusterId") && "string" == typeof t.clusterId && r.push(t.clusterId), r.join(":");
}, e.prototype.emit = function(e, t, o) {
var n, a, i, s;
void 0 === o && (o = {});
var c = r(r({}, t), {
tick: Game.time
}), l = null !== (a = null !== (n = o.priority) && void 0 !== n ? n : ge[e]) && void 0 !== a ? a : fe.NORMAL, u = null !== (i = o.immediate) && void 0 !== i ? i : l >= fe.CRITICAL, m = null === (s = o.allowCoalescing) || void 0 === s || s;
if (this.config.enableCoalescing && m && !u) {
var p = this.getCoalescingKey(e, c), d = this.tickEvents.get(p);
if (d) return d.count++, this.stats.eventsCoalesced++, void (this.config.enableLogging && ye.debug('EventBus: Coalesced "'.concat(e, '" (count: ').concat(d.count, ")"), {
subsystem: "EventBus"
}));
this.tickEvents.set(p, {
name: e,
payload: c,
priority: l,
count: 1
});
}
this.stats.eventsEmitted++, this.config.enableLogging && ye.debug('EventBus: Emitting "'.concat(e, '" (priority: ').concat(l, ", immediate: ").concat(String(u), ")"), {
subsystem: "EventBus"
});
var f = Game.cpu.bucket;
u || f >= this.config.lowBucketThreshold ? this.processEvent(e, c) : f >= this.config.criticalBucketThreshold ? this.queueEvent(e, c, l) : l >= fe.CRITICAL ? this.processEvent(e, c) : (this.stats.eventsDropped++, 
this.config.enableLogging && ye.warn('EventBus: Dropped event "'.concat(e, '" due to critical bucket'), {
subsystem: "EventBus"
}));
}, e.prototype.processEvent = function(e, t) {
var r, o, a, i, s = this.handlers.get(e);
if (s && 0 !== s.length) {
var c = Game.cpu.bucket, l = [];
try {
for (var u = n(s), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (!(c < p.minBucket)) try {
p.handler(t), this.stats.handlersInvoked++, p.once && l.push(p.id);
} catch (t) {
var d = t instanceof Error ? t.message : String(t);
ye.error('EventBus: Handler error for "'.concat(e, '": ').concat(d), {
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
for (var f = n(l), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
this.off(e, g);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
y && !y.done && (i = f.return) && i.call(f);
} finally {
if (a) throw a.error;
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
return e.event.priority < fe.HIGH;
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
var e, t, o = 0;
try {
for (var a = n(this.handlers.values()), i = a.next(); !i.done; i = a.next()) o += i.value.length;
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return r(r({}, this.stats), {
queueSize: this.eventQueue.length,
handlerCount: o
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
return r({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = r(r({}, this.config), e);
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
ye.debug("EventBus stats: ".concat(e.eventsEmitted, " emitted, ").concat(e.eventsProcessed, " processed, ") + "".concat(e.eventsDeferred, " deferred, ").concat(e.eventsDropped, " dropped, ") + "".concat(e.eventsCoalesced, " coalesced, ") + "".concat(e.queueSize, " queued, ").concat(e.handlerCount, " handlers"), {
subsystem: "EventBus"
});
}
}, e;
}(), Re = new ve, Ee = {
ecoRoomLimit: .1,
warRoomLimit: .25,
overmindLimit: 1,
strictMode: !1
}, Te = function() {
function e(e) {
void 0 === e && (e = {}), this.budgetViolations = new Map, this.config = r(r({}, Ee), e);
}
return e.prototype.checkBudget = function(e, t, r) {
var o, n = this.getBudgetLimit(t), a = r <= n;
if (!a) {
var i = (null !== (o = this.budgetViolations.get(e)) && void 0 !== o ? o : 0) + 1;
this.budgetViolations.set(e, i);
var s = ((r - n) / n * 100).toFixed(1);
this.config.strictMode ? ye.error("CPU budget violation: ".concat(e, " used ").concat(r.toFixed(3), " CPU (limit: ").concat(n, ", overage: ").concat(s, "%)"), {
subsystem: "CPUBudget"
}) : ye.warn("CPU budget exceeded: ".concat(e, " used ").concat(r.toFixed(3), " CPU (limit: ").concat(n, ", overage: ").concat(s, "%)"), {
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
return ye.error("Error in ".concat(e, ": ").concat(i), {
subsystem: "CPUBudget"
}), null;
}
}, e.prototype.executeRoomWithBudget = function(e, t, r) {
var o = t ? "warRoom" : "ecoRoom", n = Game.cpu.getUsed();
try {
r();
var a = Game.cpu.getUsed() - n;
!this.checkBudget(e, o, a) && this.config.strictMode && ye.warn("Skipping ".concat(e, " due to budget violation"), {
subsystem: "CPUBudget"
});
} catch (t) {
var i = t instanceof Error ? t.message : String(t);
ye.error("Error in room ".concat(e, ": ").concat(i), {
subsystem: "CPUBudget"
});
}
}, e.prototype.getViolationsSummary = function() {
return Array.from(this.budgetViolations.entries()).map(function(e) {
var t = a(e, 2);
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
return r({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = r(r({}, this.config), e);
}, e;
}();

new Te;

var Ce = -1;

function Se() {
var e = global;
return e._heapCache && e._heapCache.tick === Game.time || (e._heapCache ? e._heapCache.tick = Game.time : e._heapCache = {
tick: Game.time,
entries: new Map,
rehydrated: !1
}), e._heapCache;
}

function we() {
return Memory._heapCache || (Memory._heapCache = {
version: 1,
lastSync: Game.time,
data: {}
}), Memory._heapCache;
}

var Oe = function() {
function e() {
this.lastPersistenceTick = 0;
}
return e.prototype.initialize = function() {
var e = Se();
e.rehydrated || (this.rehydrateFromMemory(), e.rehydrated = !0);
}, e.prototype.rehydrateFromMemory = function() {
var e, t, r = Se(), o = we(), i = 0, s = 0;
try {
for (var c = n(Object.entries(o.data)), l = c.next(); !l.done; l = c.next()) {
var u = a(l.value, 2), m = u[0], p = u[1];
void 0 !== p.ttl && p.ttl !== Ce && Game.time - p.lastModified > p.ttl ? s++ : (r.entries.set(m, {
value: p.value,
lastModified: p.lastModified,
dirty: !1,
ttl: p.ttl
}), i++);
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
i > 0 && Game.time % 100 == 0 && ye.info("Rehydrated ".concat(i, " entries from Memory"), {
subsystem: "HeapCache",
meta: {
rehydratedCount: i,
expiredCount: s
}
});
}, e.prototype.get = function(e) {
var t = Se(), r = t.entries.get(e);
if (r) return void 0 !== r.ttl && r.ttl !== Ce && Game.time - r.lastModified > r.ttl ? void t.entries.delete(e) : r.value;
var o = we(), n = o.data[e];
return n ? void 0 !== n.ttl && n.ttl !== Ce && Game.time - n.lastModified > n.ttl ? void delete o.data[e] : (t.entries.set(e, {
value: n.value,
lastModified: n.lastModified,
dirty: !1,
ttl: n.ttl
}), n.value) : void 0;
}, e.prototype.set = function(e, t, r) {
Se().entries.set(e, {
value: t,
lastModified: Game.time,
dirty: !0,
ttl: null != r ? r : 1e3
});
}, e.prototype.delete = function(e) {
Se().entries.delete(e), delete we().data[e];
}, e.prototype.has = function(e) {
return void 0 !== this.get(e);
}, e.prototype.clear = function() {
Se().entries.clear(), we().data = {};
}, e.prototype.persist = function(e) {
var t, r;
if (void 0 === e && (e = !1), !e && Game.time - this.lastPersistenceTick < 10) return 0;
var o = Se(), i = we(), s = 0;
try {
for (var c = n(o.entries), l = c.next(); !l.done; l = c.next()) {
var u = a(l.value, 2), m = u[0], p = u[1];
p.dirty && (i.data[m] = {
value: p.value,
lastModified: p.lastModified,
ttl: p.ttl
}, p.dirty = !1, s++);
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
return i.lastSync = Game.time, this.lastPersistenceTick = Game.time, s;
}, e.prototype.getStats = function() {
var e, t, r = Se(), o = we(), a = 0;
try {
for (var i = n(r.entries.values()), s = i.next(); !s.done; s = i.next()) s.value.dirty && a++;
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
heapSize: r.entries.size,
memorySize: Object.keys(o.data).length,
dirtyEntries: a,
lastSync: o.lastSync
};
}, e.prototype.keys = function() {
var e = Se();
return Array.from(e.entries.keys());
}, e.prototype.values = function() {
var e = Se();
return Array.from(e.entries.values()).map(function(e) {
return e.value;
});
}, e.prototype.cleanExpired = function() {
var e, t, r, o, i = Se(), s = we(), c = 0;
try {
for (var l = n(i.entries), u = l.next(); !u.done; u = l.next()) {
var m = a(u.value, 2), p = m[0], d = m[1];
void 0 !== d.ttl && d.ttl !== Ce && Game.time - d.lastModified > d.ttl && (i.entries.delete(p), 
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
for (var f = n(Object.entries(s.data)), y = f.next(); !y.done; y = f.next()) {
var g = a(y.value, 2), h = (p = g[0], g[1]);
void 0 !== h.ttl && h.ttl !== Ce && Game.time - h.lastModified > h.ttl && (delete s.data[p], 
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
}, e;
}(), be = new Oe, _e = "errorMapper_sourceMapAvailable";

function xe(e) {
return null == e ? "" : String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

var Ue, ke = function() {
function e() {}
return Object.defineProperty(e, "consumer", {
get: function() {
var e;
if (void 0 === this._consumer) {
if (!1 === be.get(_e)) return this._consumer = null, this._sourceMapAvailable = !1, 
null;
try {
var t = be.get("errorMapper_sourceMapData");
if (!t) return this._consumer = null, this._sourceMapAvailable = !1, be.set(_e, !1, 1 / 0), 
null;
try {
this._consumer = new J.SourceMapConsumer(t), this._sourceMapAvailable = !0, be.set(_e, !0, 1 / 0);
} catch (e) {
console.log("SourceMapConsumer requires async initialization - source maps disabled"), 
this._consumer = null, this._sourceMapAvailable = !1, be.set(_e, !1, 1 / 0);
}
} catch (e) {
this._consumer = null, this._sourceMapAvailable = !1, be.set(_e, !1, 1 / 0);
}
}
return null !== (e = this._consumer) && void 0 !== e ? e : null;
},
enumerable: !1,
configurable: !0
}), e.sourceMappedStackTrace = function(e) {
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
}, e.wrapLoop = function(e) {
var t = this;
return function() {
try {
e();
} catch (e) {
if (!(e instanceof Error)) throw e;
"sim" in Game.rooms ? console.log("<span style='color:red'>".concat("Source maps don't work in the simulator - displaying original error", "<br>").concat(xe(e.stack), "</span>")) : console.log("<span style='color:red'>".concat(xe(t.sourceMappedStackTrace(e)), "</span>"));
}
};
}, e.cache = {}, e;
}();

!function(e) {
e[e.DEBUG = 0] = "DEBUG", e[e.INFO = 1] = "INFO", e[e.WARN = 2] = "WARN", e[e.ERROR = 3] = "ERROR", 
e[e.NONE = 4] = "NONE";
}(Ue || (Ue = {}));

var Me = {
level: Ue.INFO,
cpuLogging: !1,
enableBatching: !0,
maxBatchSize: 50
}, Ae = r({}, Me), Ne = [];

function Ie(e) {
Ae = r(r({}, Ae), e);
}

function Pe() {
return r({}, Ae);
}

function Ge(e) {
Ae.enableBatching ? (Ne.push(e), Ne.length >= Ae.maxBatchSize && Le()) : console.log(e);
}

function Le() {
0 !== Ne.length && (console.log(Ne.join("\n")), Ne = []);
}

var De = new Set([ "type", "level", "message", "tick", "subsystem", "room", "creep", "processId", "shard" ]);

function Fe(e, t, r, o) {
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
r.meta)) for (var a in r.meta) De.has(a) || (n[a] = r.meta[a]);
return JSON.stringify(n);
}

function Be(e, t) {
Ae.level <= Ue.DEBUG && Ge(Fe("DEBUG", e, t));
}

function He(e, t) {
Ae.level <= Ue.INFO && Ge(Fe("INFO", e, t));
}

function We(e, t) {
Ae.level <= Ue.WARN && Ge(Fe("WARN", e, t));
}

function Ye(e, t) {
Ae.level <= Ue.ERROR && Ge(Fe("ERROR", e, t));
}

function Ke(e, t, r) {
if (!Ae.cpuLogging) return t();
var o = Game.cpu.getUsed(), n = t(), a = Game.cpu.getUsed() - o;
return Be("".concat(e, ": ").concat(a.toFixed(3), " CPU"), r), n;
}

var Ve = new Set([ "type", "key", "value", "tick", "unit", "subsystem", "room", "shard" ]);

function je(e, t, r, o) {
var n = {
type: "stat",
key: e,
value: t,
tick: "undefined" != typeof Game ? Game.time : 0,
shard: "undefined" != typeof Game && Game.shard ? Game.shard.name : "shard0"
};
if (r && (n.unit = r), o && (o.shard && (n.shard = o.shard), o.subsystem && (n.subsystem = o.subsystem), 
o.room && (n.room = o.room), o.meta)) for (var a in o.meta) Ve.has(a) || (n[a] = o.meta[a]);
Ge(JSON.stringify(n));
}

function ze(e) {
return {
debug: function(t, o) {
Be(t, "string" == typeof o ? {
subsystem: e,
room: o
} : r({
subsystem: e
}, o));
},
info: function(t, o) {
He(t, "string" == typeof o ? {
subsystem: e,
room: o
} : r({
subsystem: e
}, o));
},
warn: function(t, o) {
We(t, "string" == typeof o ? {
subsystem: e,
room: o
} : r({
subsystem: e
}, o));
},
error: function(t, o) {
Ye(t, "string" == typeof o ? {
subsystem: e,
room: o
} : r({
subsystem: e
}, o));
},
stat: function(t, o, n, a) {
je(t, o, n, "string" == typeof a ? {
subsystem: e,
room: a
} : r({
subsystem: e
}, a));
},
measureCpu: function(t, o, n) {
return Ke(t, o, "string" == typeof n ? {
subsystem: e,
room: n
} : r({
subsystem: e
}, n));
}
};
}

var qe = {
debug: Be,
info: He,
warn: We,
error: Ye,
stat: je,
measureCpu: Ke,
configure: Ie,
getConfig: Pe,
createLogger: ze,
flush: Le
}, Xe = [], Qe = function() {
function e() {
this.commands = new Map, this.initialized = !1, this.lazyLoadEnabled = !1, this.commandsRegistered = !1, 
this.commandsExposed = !1;
}
return e.prototype.register = function(e, t) {
var o;
this.commands.has(e.name) && qe.warn('Command "'.concat(e.name, '" is already registered, overwriting'), {
subsystem: "CommandRegistry"
}), this.commands.set(e.name, {
metadata: r(r({}, e), {
category: null !== (o = e.category) && void 0 !== o ? o : "General"
}),
handler: t
}), qe.debug('Registered command "'.concat(e.name, '"'), {
subsystem: "CommandRegistry"
});
}, e.prototype.unregister = function(e) {
var t = this.commands.delete(e);
return t && qe.debug('Unregistered command "'.concat(e, '"'), {
subsystem: "CommandRegistry"
}), t;
}, e.prototype.getCommand = function(e) {
return this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad(), 
this.commands.get(e);
}, e.prototype.getCommands = function() {
return this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad(), 
Array.from(this.commands.values());
}, e.prototype.getCommandsByCategory = function() {
var e, t, r, o, i, s;
this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad();
var c = new Map;
try {
for (var l = n(this.commands.values()), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = null !== (i = m.metadata.category) && void 0 !== i ? i : "General", d = null !== (s = c.get(p)) && void 0 !== s ? s : [];
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
for (var f = n(c), y = f.next(); !y.done; y = f.next()) {
var g = a(y.value, 2), h = (p = g[0], g[1]);
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
return o.handler.apply(o, i([], a(t), !1));
} catch (t) {
var n = t instanceof Error ? t.message : String(t);
return qe.error('Error executing command "'.concat(e, '": ').concat(n), {
subsystem: "CommandRegistry"
}), "Error: ".concat(n);
}
}, e.prototype.generateHelp = function() {
var e, t, r, o, a, i, s, c = this.getCommandsByCategory(), l = [ "=== Available Console Commands ===", "" ], u = Array.from(c.keys()).sort(function(e, t) {
return "General" === e ? -1 : "General" === t ? 1 : e.localeCompare(t);
});
try {
for (var m = n(u), p = m.next(); !p.done; p = m.next()) {
var d = p.value, f = c.get(d);
if (f && 0 !== f.length) {
l.push("--- ".concat(d, " ---"));
try {
for (var y = (r = void 0, n(f)), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = null !== (s = h.metadata.usage) && void 0 !== s ? s : "".concat(h.metadata.name, "()");
if (l.push("  ".concat(v)), l.push("    ".concat(h.metadata.description)), h.metadata.examples && h.metadata.examples.length > 0) {
l.push("    Examples:");
try {
for (var R = (a = void 0, n(h.metadata.examples)), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
l.push("      ".concat(T));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
E && !E.done && (i = R.return) && i.call(R);
} finally {
if (a) throw a.error;
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
var t, r, o, a;
this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad();
var i = this.commands.get(e);
if (!i) return 'Command "'.concat(e, '" not found. Use help() to see available commands.');
var s = [ "=== ".concat(i.metadata.name, " ==="), "", "Description: ".concat(i.metadata.description), "Usage: ".concat(null !== (o = i.metadata.usage) && void 0 !== o ? o : "".concat(i.metadata.name, "()")), "Category: ".concat(null !== (a = i.metadata.category) && void 0 !== a ? a : "General") ];
if (i.metadata.examples && i.metadata.examples.length > 0) {
s.push(""), s.push("Examples:");
try {
for (var c = n(i.metadata.examples), l = c.next(); !l.done; l = c.next()) {
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
for (var i = n(this.commands), s = i.next(); !s.done; s = i.next()) {
var c = a(s.value, 2), l = c[0], u = c[1];
o[l] = u.handler;
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
this.commandsExposed = !0, qe.debug("Exposed ".concat(this.commands.size, " commands to global scope"), {
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
}), this.initialized = !0, qe.info("Command registry initialized", {
subsystem: "CommandRegistry"
}));
}, e.prototype.enableLazyLoading = function(e) {
this.lazyLoadEnabled = !0, this.registrationCallback = e, qe.info("Console commands lazy loading enabled", {
subsystem: "CommandRegistry"
});
}, e.prototype.triggerLazyLoad = function() {
!this.commandsRegistered && this.registrationCallback && (qe.debug("Lazy loading console commands on first access", {
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
}(), Ze = new Qe;

function Je(e) {
return function(t, r, o) {
Xe.push({
metadata: e,
methodName: String(r),
target: t
});
};
}

function $e(e) {
var t, r, o = Object.getPrototypeOf(e);
try {
for (var a = n(Xe), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
if (et(s.target, o)) {
var c = e[s.methodName];
if ("function" == typeof c) {
var l = c.bind(e);
Ze.register(s.metadata, l), qe.debug('Registered decorated command "'.concat(s.metadata.name, '"'), {
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
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
}

function et(e, t) {
return null !== t && (e === t || Object.getPrototypeOf(e) === t || e === Object.getPrototypeOf(t));
}

var tt, rt, ot = {
info: function() {},
warn: function() {},
error: function() {},
debug: function() {}
}, nt = ((tt = {})[RESOURCE_HYDROXIDE] = {
product: RESOURCE_HYDROXIDE,
input1: RESOURCE_HYDROGEN,
input2: RESOURCE_OXYGEN,
priority: 10
}, tt[RESOURCE_ZYNTHIUM_KEANITE] = {
product: RESOURCE_ZYNTHIUM_KEANITE,
input1: RESOURCE_ZYNTHIUM,
input2: RESOURCE_KEANIUM,
priority: 10
}, tt[RESOURCE_UTRIUM_LEMERGITE] = {
product: RESOURCE_UTRIUM_LEMERGITE,
input1: RESOURCE_UTRIUM,
input2: RESOURCE_LEMERGIUM,
priority: 10
}, tt[RESOURCE_GHODIUM] = {
product: RESOURCE_GHODIUM,
input1: RESOURCE_ZYNTHIUM_KEANITE,
input2: RESOURCE_UTRIUM_LEMERGITE,
priority: 15
}, tt[RESOURCE_UTRIUM_HYDRIDE] = {
product: RESOURCE_UTRIUM_HYDRIDE,
input1: RESOURCE_UTRIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, tt[RESOURCE_UTRIUM_OXIDE] = {
product: RESOURCE_UTRIUM_OXIDE,
input1: RESOURCE_UTRIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, tt[RESOURCE_KEANIUM_HYDRIDE] = {
product: RESOURCE_KEANIUM_HYDRIDE,
input1: RESOURCE_KEANIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, tt[RESOURCE_KEANIUM_OXIDE] = {
product: RESOURCE_KEANIUM_OXIDE,
input1: RESOURCE_KEANIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, tt[RESOURCE_LEMERGIUM_HYDRIDE] = {
product: RESOURCE_LEMERGIUM_HYDRIDE,
input1: RESOURCE_LEMERGIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, tt[RESOURCE_LEMERGIUM_OXIDE] = {
product: RESOURCE_LEMERGIUM_OXIDE,
input1: RESOURCE_LEMERGIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, tt[RESOURCE_ZYNTHIUM_HYDRIDE] = {
product: RESOURCE_ZYNTHIUM_HYDRIDE,
input1: RESOURCE_ZYNTHIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, tt[RESOURCE_ZYNTHIUM_OXIDE] = {
product: RESOURCE_ZYNTHIUM_OXIDE,
input1: RESOURCE_ZYNTHIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, tt[RESOURCE_GHODIUM_HYDRIDE] = {
product: RESOURCE_GHODIUM_HYDRIDE,
input1: RESOURCE_GHODIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, tt[RESOURCE_GHODIUM_OXIDE] = {
product: RESOURCE_GHODIUM_OXIDE,
input1: RESOURCE_GHODIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, tt[RESOURCE_UTRIUM_ACID] = {
product: RESOURCE_UTRIUM_ACID,
input1: RESOURCE_UTRIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_UTRIUM_ALKALIDE] = {
product: RESOURCE_UTRIUM_ALKALIDE,
input1: RESOURCE_UTRIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_KEANIUM_ACID] = {
product: RESOURCE_KEANIUM_ACID,
input1: RESOURCE_KEANIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_KEANIUM_ALKALIDE] = {
product: RESOURCE_KEANIUM_ALKALIDE,
input1: RESOURCE_KEANIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_LEMERGIUM_ACID] = {
product: RESOURCE_LEMERGIUM_ACID,
input1: RESOURCE_LEMERGIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_LEMERGIUM_ALKALIDE] = {
product: RESOURCE_LEMERGIUM_ALKALIDE,
input1: RESOURCE_LEMERGIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_ZYNTHIUM_ACID] = {
product: RESOURCE_ZYNTHIUM_ACID,
input1: RESOURCE_ZYNTHIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_ZYNTHIUM_ALKALIDE] = {
product: RESOURCE_ZYNTHIUM_ALKALIDE,
input1: RESOURCE_ZYNTHIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_GHODIUM_ACID] = {
product: RESOURCE_GHODIUM_ACID,
input1: RESOURCE_GHODIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_GHODIUM_ALKALIDE] = {
product: RESOURCE_GHODIUM_ALKALIDE,
input1: RESOURCE_GHODIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, tt[RESOURCE_CATALYZED_UTRIUM_ACID] = {
product: RESOURCE_CATALYZED_UTRIUM_ACID,
input1: RESOURCE_UTRIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, tt[RESOURCE_CATALYZED_UTRIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
input1: RESOURCE_UTRIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, tt[RESOURCE_CATALYZED_KEANIUM_ACID] = {
product: RESOURCE_CATALYZED_KEANIUM_ACID,
input1: RESOURCE_KEANIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, tt[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
input1: RESOURCE_KEANIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, tt[RESOURCE_CATALYZED_LEMERGIUM_ACID] = {
product: RESOURCE_CATALYZED_LEMERGIUM_ACID,
input1: RESOURCE_LEMERGIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, tt[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
input1: RESOURCE_LEMERGIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, tt[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = {
product: RESOURCE_CATALYZED_ZYNTHIUM_ACID,
input1: RESOURCE_ZYNTHIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, tt[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
input1: RESOURCE_ZYNTHIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, tt[RESOURCE_CATALYZED_GHODIUM_ACID] = {
product: RESOURCE_CATALYZED_GHODIUM_ACID,
input1: RESOURCE_GHODIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, tt[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
input1: RESOURCE_GHODIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, tt), at = ((rt = {})[RESOURCE_CATALYZED_UTRIUM_ACID] = 3e3, rt[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 3e3, 
rt[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 3e3, rt[RESOURCE_CATALYZED_GHODIUM_ACID] = 3e3, 
rt[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 2e3, rt[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = 2e3, 
rt[RESOURCE_GHODIUM] = 5e3, rt[RESOURCE_HYDROXIDE] = 5e3, rt);

function it(e, t) {
var r, o, n, a = null !== (r = at[e]) && void 0 !== r ? r : 1e3, i = null !== (o = t.pheromones.war) && void 0 !== o ? o : 0, s = null !== (n = t.pheromones.siege) && void 0 !== n ? n : 0, c = Math.max(i, s), l = c > 50 ? 1 + c / 100 * .5 : 1;
return !("war" === t.posture || "siege" === t.posture || c > 50) || e !== RESOURCE_CATALYZED_UTRIUM_ACID && e !== RESOURCE_CATALYZED_KEANIUM_ALKALIDE && e !== RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE && e !== RESOURCE_CATALYZED_GHODIUM_ACID ? "war" !== t.posture && "siege" !== t.posture || e !== RESOURCE_CATALYZED_GHODIUM_ALKALIDE && e !== RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE ? a : .5 * a : a * Math.min(1.5 * l, 1.75);
}

function st(e) {
var t = [];
return t.push(RESOURCE_GHODIUM, RESOURCE_HYDROXIDE), "war" === e.posture || "siege" === e.posture || e.danger >= 2 ? t.push(RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, RESOURCE_CATALYZED_GHODIUM_ACID) : t.push(RESOURCE_CATALYZED_GHODIUM_ALKALIDE, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE), 
t;
}

var ct = function() {
function e(e) {
var t;
void 0 === e && (e = {}), this.logger = null !== (t = e.logger) && void 0 !== t ? t : ot;
}
return e.prototype.getReaction = function(e) {
return nt[e];
}, e.prototype.calculateReactionChain = function(e, t) {
return function(e, t) {
var r = [], o = new Set, n = function(e) {
var a, i, s;
if (o.has(e)) return !0;
o.add(e);
var c = nt[e];
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
var r, o, i, s, c, l, u;
if (e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}).length < 3) return null;
var m = e.terminal;
if (!m) return null;
var p = st(t);
try {
for (var d = n(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
if (nt[y] && (null !== (u = m.store[y]) && void 0 !== u ? u : 0) < it(y, t)) {
var g = {};
try {
for (var h = (i = void 0, n(Object.entries(m.store))), v = h.next(); !v.done; v = h.next()) {
var R = a(v.value, 2), E = R[0], T = R[1];
g[E] = T;
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
var C = this.calculateReactionChain(y, g);
try {
for (var S = (c = void 0, n(C)), w = S.next(); !w.done; w = S.next()) {
var O = w.value;
if (this.hasResourcesForReaction(m, O, 1e3)) return O;
}
} catch (e) {
c = {
error: e
};
} finally {
try {
w && !w.done && (l = S.return) && l.call(S);
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
var r, o, i, s, c, l, u, m, p, d = [];
try {
for (var f = n(e), y = f.next(); !y.done; y = f.next()) {
var g = y.value, h = g.terminal;
if (h) {
var v = st(t);
try {
for (var R = (i = void 0, n(v)), E = R.next(); !E.done; E = R.next()) {
var T = E.value, C = nt[T];
if (C) {
var S = null !== (p = h.store[T]) && void 0 !== p ? p : 0, w = it(T, t), O = w - S;
if (O > 0) {
var b = O / w, _ = C.priority * (1 + Math.min(b, .5)), x = {};
try {
for (var U = (c = void 0, n(Object.entries(h.store))), k = U.next(); !k.done; k = U.next()) {
var M = a(k.value, 2), A = M[0], N = M[1];
x[A] = N;
}
} catch (e) {
c = {
error: e
};
} finally {
try {
k && !k.done && (l = U.return) && l.call(U);
} finally {
if (c) throw c.error;
}
}
var I = this.calculateReactionChain(T, x);
try {
for (var P = (u = void 0, n(I)), G = P.next(); !G.done; G = P.next()) {
var L = G.value;
if (this.hasResourcesForReaction(h, L, 1e3)) {
d.push({
room: g,
reaction: L,
priority: _
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
var r, o, a = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (!(a.length < 3)) {
var i = a[0], s = a[1];
if (i && s) {
var c = a.slice(2);
(i.mineralType !== t.input1 || i.store[t.input1] < 500) && this.logger.debug("Lab ".concat(i.id, " needs ").concat(t.input1), {
subsystem: "Chemistry"
}), (s.mineralType !== t.input2 || s.store[t.input2] < 500) && this.logger.debug("Lab ".concat(s.id, " needs ").concat(t.input2), {
subsystem: "Chemistry"
});
try {
for (var l = n(c), u = l.next(); !u.done; u = l.next()) {
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
}(), lt = [ {
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

function ut(e) {
return lt.find(function(t) {
return t.role === e;
});
}

var mt, pt = function() {
function e(e) {
var t;
void 0 === e && (e = {}), this.configs = new Map, this.logger = null !== (t = e.logger) && void 0 !== t ? t : ot;
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
var a = function(t) {
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
for (var i = n(t), s = i.next(); !s.done; s = i.next()) a(s.value);
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
var r, o, a, i, s, c, l, u, m, p;
if (t.length < 3) e.isValid = !1; else {
var d = new Map;
try {
for (var f = n(t), y = f.next(); !y.done; y = f.next()) {
var g = y.value, h = [];
try {
for (var v = (a = void 0, n(t)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
g.id !== E.id && g.pos.getRangeTo(E) <= 2 && h.push(E.id);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
R && !R.done && (i = v.return) && i.call(v);
} finally {
if (a) throw a.error;
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
for (var w = n(e.labs), O = w.next(); !O.done; O = w.next()) {
var b = O.value;
if (b.labId === C.id) b.role = "input1", b.lastConfigured = Game.time; else if (b.labId === S.id) b.role = "input2", 
b.lastConfigured = Game.time; else {
var _ = C.pos.getRangeTo(Game.getObjectById(b.labId)) <= 2, x = S.pos.getRangeTo(Game.getObjectById(b.labId)) <= 2;
b.role = _ && x ? "output" : "boost", b.lastConfigured = Game.time;
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
O && !O.done && (c = w.return) && c.call(w);
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
var a, i, s = this.configs.get(e);
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
for (var u = n(s.labs.filter(function(e) {
return "output" === e.role;
})), m = u.next(); !m.done; m = u.next()) m.value.resourceType = o;
} catch (e) {
a = {
error: e
};
} finally {
try {
m && !m.done && (i = u.return) && i.call(u);
} finally {
if (a) throw a.error;
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
for (var a = n(o.labs), i = a.next(); !i.done; i = a.next()) delete i.value.resourceType;
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
o.lastUpdate = Game.time;
}
}, e.prototype.runReactions = function(e) {
var t, r, o = this.configs.get(e);
if (!o || !o.isValid || !o.activeReaction) return 0;
var a = this.getInputLabs(e), i = a.input1, s = a.input2;
if (!i || !s) return 0;
var c = this.getOutputLabs(e), l = 0;
try {
for (var u = n(c), m = u.next(); !m.done; m = u.next()) {
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
}(), dt = {
info: function(e, t) {
return ye.info(e, t);
},
warn: function(e, t) {
return ye.warn(e, t);
},
error: function(e, t) {
return ye.error(e, t);
},
debug: function(e, t) {
return ye.debug(e, t);
}
}, ft = function() {
function e() {
this.manager = new pt({
logger: dt
});
}
return e.prototype.initialize = function(e) {
this.manager.initialize(e);
}, e.prototype.getConfig = function(e) {
return this.manager.exportConfig(e);
}, e.prototype.getLabsByRole = function(e, t) {
var r = this.manager.exportConfig(e);
return r ? r.labs.filter(function(e) {
return e.role === t;
}).map(function(e) {
return Game.getObjectById(e.labId);
}).filter(function(e) {
return null !== e;
}) : [];
}, e.prototype.getInputLabs = function(e) {
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
}, e.prototype.getOutputLabs = function(e) {
return this.getLabsByRole(e, "output");
}, e.prototype.getBoostLabs = function(e) {
return this.getLabsByRole(e, "boost");
}, e.prototype.setActiveReaction = function(e, t, r, o) {
return this.manager.setActiveReaction(e, t, r, o);
}, e.prototype.clearActiveReaction = function(e) {
this.manager.clearActiveReaction(e);
}, e.prototype.setLabRole = function(e, t, r) {
var o = this.manager.exportConfig(e);
if (!o) return !1;
var n = o.labs.find(function(e) {
return e.labId === t;
});
return !!n && (n.role = r, n.lastConfigured = Game.time, o.lastUpdate = Game.time, 
this.manager.importConfig(o), ye.info("Set ".concat(t, " to role ").concat(r, " in ").concat(e), {
subsystem: "Labs"
}), !0);
}, e.prototype.runReactions = function(e) {
return this.manager.runReactions(e);
}, e.prototype.saveToMemory = function(e) {
var t = this.manager.exportConfig(e);
if (t) {
var r = Memory.rooms[e];
if (r) {
r.labConfig = t;
var o = "memory:room:".concat(e, ":labConfig");
be.set(o, t, Ce);
}
}
}, e.prototype.loadFromMemory = function(e) {
var t = "memory:room:".concat(e, ":labConfig"), r = be.get(t);
if (!r) {
var o = Memory.rooms[e], n = null == o ? void 0 : o.labConfig;
n && (be.set(t, n, Ce), r = n);
}
r && this.manager.importConfig(r);
}, e.prototype.getConfiguredRooms = function() {
return Object.keys(Memory.rooms).filter(function(e) {
var t = Memory.rooms[e];
return void 0 !== (null == t ? void 0 : t.labConfig);
});
}, e.prototype.hasValidConfig = function(e) {
return this.manager.hasValidConfig(e);
}, e;
}(), yt = new ft, gt = function() {
function e() {}
return e.prototype.getLabResourceNeeds = function(e) {
var t, r, o, a, i;
if (!Game.rooms[e]) return [];
var s = yt.getConfig(e);
if (!s || !s.isValid) return [];
var c, l = [], u = yt.getInputLabs(e), m = u.input1, p = u.input2;
m && s.activeReaction && (c = null !== (o = m.store[s.activeReaction.input1]) && void 0 !== o ? o : 0) < 1e3 && l.push({
labId: m.id,
resourceType: s.activeReaction.input1,
amount: 2e3 - c,
priority: 10
}), p && s.activeReaction && (c = null !== (a = p.store[s.activeReaction.input2]) && void 0 !== a ? a : 0) < 1e3 && l.push({
labId: p.id,
resourceType: s.activeReaction.input2,
amount: 2e3 - c,
priority: 10
});
var d = yt.getBoostLabs(e), f = function(e) {
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
for (var y = n(d), g = y.next(); !g.done; g = y.next()) f(g.value);
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
var t, r, o, a, i, s;
if (!Game.rooms[e]) return [];
var c = yt.getConfig(e);
if (!c) return [];
var l = [], u = yt.getOutputLabs(e);
try {
for (var m = n(u), p = m.next(); !p.done; p = m.next()) {
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
var g = yt.getInputLabs(e), h = [ g.input1, g.input2 ].filter(function(e) {
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
for (var R = n(h), E = R.next(); !E.done; E = R.next()) {
var T;
v(T = E.value);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
E && !E.done && (a = R.return) && a.call(R);
} finally {
if (o) throw o.error;
}
}
return l;
}, e.prototype.areLabsReady = function(e, t) {
var r, o, a, i, s = yt.getConfig(e);
if (!s || !s.isValid) return !1;
var c = yt.getInputLabs(e), l = c.input1, u = c.input2;
if (!l || !u) return !1;
if ((null !== (a = l.store[t.input1]) && void 0 !== a ? a : 0) < 500) return !1;
if ((null !== (i = u.store[t.input2]) && void 0 !== i ? i : 0) < 500) return !1;
var m = yt.getOutputLabs(e);
if (0 === m.length) return !1;
try {
for (var p = n(m), d = p.next(); !d.done; d = p.next()) {
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
yt.clearActiveReaction(e), ye.info("Cleared active reactions in ".concat(e), {
subsystem: "Labs"
});
}, e.prototype.setActiveReaction = function(e, t, r, o) {
var n = yt.setActiveReaction(e, t, r, o);
return n && ye.info("Set active reaction: ".concat(t, " + ").concat(r, " -> ").concat(o), {
subsystem: "Labs",
room: e
}), n;
}, e.prototype.runReactions = function(e) {
return yt.runReactions(e);
}, e.prototype.hasAvailableBoostLabs = function(e) {
return yt.getBoostLabs(e).length > 0;
}, e.prototype.prepareBoostLab = function(e, t) {
var r, o, a, i, s, c = yt.getConfig(e);
if (!c) return null;
var l = yt.getBoostLabs(e);
try {
for (var u = n(l), m = u.next(); !m.done; m = u.next()) if ((y = m.value).mineralType === t && (null !== (s = y.store[t]) && void 0 !== s ? s : 0) >= 30) return y.id;
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
for (var d = n(l), f = d.next(); !f.done; f = d.next()) {
var y, g = p(y = f.value);
if ("object" == typeof g) return g.value;
}
} catch (e) {
a = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (a) throw a.error;
}
}
return null;
}, e.prototype.scheduleBoostedCreepUnboost = function(e) {
var t, r, o = Game.rooms[e];
if (!o) return 0;
var a = o.find(FIND_MY_CREEPS, {
filter: function(e) {
return e.body.some(function(e) {
return e.boost;
}) && e.ticksToLive && e.ticksToLive <= 50;
}
}), i = 0;
try {
for (var s = n(a), c = s.next(); !c.done; c = s.next()) {
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
var a = t.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (0 === a.length) return !1;
try {
for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = c.store.getFreeCapacity();
if (null !== l && l >= 50) {
if (!e.pos.isNearTo(c)) return e.moveTo(c), !1;
if (c.unboostCreep(e) === OK) return ye.info("Unboosted ".concat(e.name, ", recovered resources"), {
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
var t = yt.getConfig(e);
return t && t.isValid ? t.activeReaction ? "reacting" : this.getLabResourceNeeds(e).length > 0 ? "loading" : this.getLabOverflow(e).length > 0 ? "unloading" : "idle" : "idle";
}, e.prototype.initialize = function(e) {
yt.initialize(e), yt.loadFromMemory(e);
}, e.prototype.save = function(e) {
yt.saveToMemory(e);
}, e;
}(), ht = new gt, vt = function() {
function e() {}
return e.prototype.shouldBoost = function(e, t) {
var r, o = e.memory;
if (o.boosted) return !1;
var n = ut(o.role);
if (!n) return !1;
var a = !0 === (null !== (r = Memory.boostDefensePriority) && void 0 !== r ? r : {})[e.room.name] ? Math.max(1, n.minDanger - 1) : n.minDanger;
return !(t.danger < a || t.missingStructures.labs);
}, e.prototype.boostCreep = function(e, t) {
var r, o, a = e.memory, i = ut(a.role);
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
if (!r) return ye.debug("Lab not ready with ".concat(t, " for ").concat(e.name), {
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
if (o === OK) ye.info("Boosted ".concat(e.name, " with ").concat(t), {
subsystem: "Boost"
}); else if (o !== ERR_NOT_FOUND) return ye.error("Failed to boost ".concat(e.name, ": ").concat(function(e) {
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
for (var u = n(i.boosts), m = u.next(); !m.done; m = u.next()) {
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
return 0 === c.length && (a.boosted = !0, ye.info("".concat(e.name, " fully boosted (all ").concat(i.boosts.length, " boosts applied)"), {
subsystem: "Boost"
}), !0);
}, e.prototype.areBoostLabsReady = function(e, t) {
var r, o, a = ut(t);
if (!a) return !0;
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
for (var c = n(a.boosts), l = c.next(); !l.done; l = c.next()) {
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
var r, o, a = ut(t);
if (!a) return [];
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
for (var l = n(a.boosts), u = l.next(); !u.done; u = l.next()) c(u.value);
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
var r, o, a, i, s, c;
if (!(t.danger < 2)) {
var l = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (!(l.length < 3)) {
var u = l.slice(2), m = new Set, p = [ ut("soldier"), ut("ranger"), ut("healer"), ut("siegeUnit") ].filter(function(e) {
return void 0 !== e && t.danger >= e.minDanger;
});
try {
for (var d = n(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
try {
for (var g = (a = void 0, n(y.boosts)), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
m.add(v);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (a) throw a.error;
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
for (var E = n(m), T = E.next(); !(T.done || (v = T.value, R >= u.length)); T = E.next()) {
var C = u[R];
(C.mineralType !== v || C.store[v] < 1e3) && ye.debug("Lab ".concat(C.id, " needs ").concat(v, " for boosting"), {
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
var r = ut(e);
return r ? {
mineral: 30 * t * r.boosts.length,
energy: 20 * t * r.boosts.length
} : {
mineral: 0,
energy: 0
};
}(e, t);
}, e.prototype.analyzeBoostROI = function(e, t, r, o) {
if (!ut(e)) return {
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
}(), Rt = new vt;

!function(e) {
e[e.None = 0] = "None", e[e.Pheromones = 1] = "Pheromones", e[e.Paths = 2] = "Paths", 
e[e.Traffic = 4] = "Traffic", e[e.Defense = 8] = "Defense", e[e.Economy = 16] = "Economy", 
e[e.Construction = 32] = "Construction", e[e.Performance = 64] = "Performance";
}(mt || (mt = {}));

var Et, Tt, Ct, St, wt = de("MemoryMonitor"), Ot = 2097152, bt = new (function() {
function e() {
this.lastCheckTick = 0, this.lastStatus = "normal";
}
return e.prototype.checkMemoryUsage = function() {
var e = RawMemory.get().length, t = e / Ot, r = "normal";
t >= .9 ? r = "critical" : t >= .8 && (r = "warning"), r !== this.lastStatus && ("critical" === r ? (Game.notify("CRITICAL: Memory at ".concat((100 * t).toFixed(1), "% (").concat(this.formatBytes(e), "/").concat(this.formatBytes(Ot), ")")), 
wt.error("Memory usage critical", {
meta: {
used: e,
limit: Ot,
percentage: t
}
})) : "warning" === r ? wt.warn("Memory usage warning", {
meta: {
used: e,
limit: Ot,
percentage: t
}
}) : wt.info("Memory usage normal", {
meta: {
used: e,
limit: Ot,
percentage: t
}
}), this.lastStatus = r);
var o = this.getMemoryBreakdown();
return {
used: e,
limit: Ot,
percentage: t,
status: r,
breakdown: o
};
}, e.prototype.getMemoryBreakdown = function() {
var e = Memory, t = this.getObjectSize(e.empire), r = this.getObjectSize(Memory.rooms), o = this.getObjectSize(Memory.creeps), n = this.getObjectSize(e.clusters), a = this.getObjectSize(e.ss2PacketQueue), i = RawMemory.get().length, s = t + r + o + n + a;
return {
empire: t,
rooms: r,
creeps: o,
clusters: n,
ss2PacketQueue: a,
other: Math.max(0, i - s),
total: i
};
}, e.prototype.getObjectSize = function(e) {
return null == e ? 0 : JSON.stringify(e).length;
}, e.prototype.formatBytes = function(e) {
return e < 1024 ? "".concat(e, "B") : e < 1048576 ? "".concat((e / 1024).toFixed(1), "KB") : "".concat((e / 1048576).toFixed(2), "MB");
}, e.prototype.logBreakdown = function() {
var e = this.getMemoryBreakdown(), t = this.checkMemoryUsage();
wt.info("Memory Usage", {
meta: {
used: this.formatBytes(t.used),
limit: this.formatBytes(t.limit),
percentage: "".concat((100 * t.percentage).toFixed(1), "%"),
status: t.status.toUpperCase()
}
}), wt.info("Memory Breakdown", {
meta: {
empire: "".concat(this.formatBytes(e.empire), " (").concat((e.empire / e.total * 100).toFixed(1), "%)"),
rooms: "".concat(this.formatBytes(e.rooms), " (").concat((e.rooms / e.total * 100).toFixed(1), "%)"),
creeps: "".concat(this.formatBytes(e.creeps), " (").concat((e.creeps / e.total * 100).toFixed(1), "%)"),
clusters: "".concat(this.formatBytes(e.clusters), " (").concat((e.clusters / e.total * 100).toFixed(1), "%)"),
ss2Queue: "".concat(this.formatBytes(e.ss2PacketQueue), " (").concat((e.ss2PacketQueue / e.total * 100).toFixed(1), "%)"),
other: "".concat(this.formatBytes(e.other), " (").concat((e.other / e.total * 100).toFixed(1), "%)")
}
});
}, e.prototype.getLargestConsumers = function(e) {
void 0 === e && (e = 10);
var t = [];
if (Memory.rooms) for (var r in Memory.rooms) t.push({
type: "room",
name: r,
size: this.getObjectSize(Memory.rooms[r])
});
var o = Memory.clusters;
if (o) for (var n in o) t.push({
type: "cluster",
name: n,
size: this.getObjectSize(o[n])
});
return t.sort(function(e, t) {
return t.size - e.size;
}).slice(0, e);
}, e;
}()), _t = 1e4, xt = function() {
function e() {}
return e.prototype.pruneAll = function() {
var e = RawMemory.get().length, t = {
deadCreeps: 0,
eventLogs: 0,
staleIntel: 0,
marketHistory: 0,
bytesSaved: 0
};
t.deadCreeps = this.pruneDeadCreeps(), t.eventLogs = this.pruneEventLogs(20), t.staleIntel = this.pruneStaleIntel(_t), 
t.marketHistory = this.pruneMarketHistory(5e3);
var r = RawMemory.get().length;
return t.bytesSaved = Math.max(0, e - r), t.bytesSaved > 0 && ye.info("Memory pruning complete", {
subsystem: "MemoryPruner",
meta: t
}), t;
}, e.prototype.pruneDeadCreeps = function() {
var e = 0;
for (var t in Memory.creeps) t in Game.creeps || (delete Memory.creeps[t], e++);
return e;
}, e.prototype.pruneEventLogs = function(e) {
var t = 0;
if (!Memory.rooms) return 0;
for (var r in Memory.rooms) {
var o = Memory.rooms[r], n = null == o ? void 0 : o.swarm;
if ((null == n ? void 0 : n.eventLog) && n.eventLog.length > e) {
var a = n.eventLog.length - e;
n.eventLog.splice(0, a), t += a;
}
}
return t;
}, e.prototype.pruneStaleIntel = function(e) {
var t, r = Memory.empire;
if (!(null == r ? void 0 : r.knownRooms)) return 0;
var o = 0, n = Game.time - e;
for (var a in r.knownRooms) {
var i = r.knownRooms[a], s = Game.rooms[a];
(null === (t = null == s ? void 0 : s.controller) || void 0 === t ? void 0 : t.my) || i.lastSeen < n && !i.isHighway && !i.hasPortal && (delete r.knownRooms[a], 
o++);
}
return o;
}, e.prototype.pruneMarketHistory = function(e) {
var t = Memory.empire;
if (!(null == t ? void 0 : t.market)) return 0;
var r = t.market.priceHistory;
if (!r) return 0;
var o = 0, n = Game.time - e;
for (var a in r) {
var i = r[a];
if (i) {
var s = i.length;
r[a] = i.filter(function(e) {
return e.time >= n;
}), o += s - r[a].length;
}
}
return o;
}, e.prototype.pruneCompletedConstruction = function() {
var e, t = 0;
if (!Memory.rooms) return 0;
for (var r in Memory.rooms) if (Game.rooms[r]) {
var o = Memory.rooms[r];
if (null === (e = o.construction) || void 0 === e ? void 0 : e.sites) {
var n = o.construction.sites.length;
o.construction.sites = o.construction.sites.filter(function(e) {
return null !== Game.getObjectById(e);
}), t += n - o.construction.sites.length;
}
}
return t;
}, e.prototype.prunePowerBanks = function() {
var e = Memory.empire;
if (!(null == e ? void 0 : e.powerBanks)) return 0;
var t = e.powerBanks.length;
return e.powerBanks = e.powerBanks.filter(function(e) {
return e.decayTick > Game.time;
}), t - e.powerBanks.length;
}, e.prototype.pruneOldNukes = function() {
var e = Memory.empire;
if (!e) return 0;
var t = 0;
if (e.nukesInFlight) for (var r in e.nukesInFlight) e.nukesInFlight[r].impactTick < Game.time && (delete e.nukesInFlight[r], 
t++);
if (e.incomingNukes) {
var o = e.incomingNukes.length;
e.incomingNukes = e.incomingNukes.filter(function(e) {
return e.impactTick >= Game.time;
}), t += o - e.incomingNukes.length;
}
return t;
}, e.prototype.getRecommendations = function() {
var e = [], t = Memory.empire;
if (Memory.rooms) for (var r in Memory.rooms) {
var o = Memory.rooms[r], n = null == o ? void 0 : o.swarm;
(null == n ? void 0 : n.eventLog) && n.eventLog.length > 40 && e.push("Room ".concat(r, " has ").concat(n.eventLog.length, " event log entries (recommended max: ").concat(20, ")"));
}
if (null == t ? void 0 : t.knownRooms) {
var a = 0, i = Game.time - _t;
for (var r in t.knownRooms) {
var s = t.knownRooms[r];
s.lastSeen < i && !s.isHighway && !s.hasPortal && a++;
}
a > 50 && e.push("".concat(a, " stale intel entries (older than ").concat(_t, " ticks)"));
}
var c = 0;
for (var l in Memory.creeps) l in Game.creeps || c++;
return c > 10 && e.push("".concat(c, " dead creeps in memory")), e;
}, e;
}(), Ut = new xt, kt = {
ACTIVE_ROOMS: {
start: 0,
end: 9
},
HISTORICAL_INTEL: {
start: 10,
end: 19
},
MARKET_HISTORY: {
start: 20,
end: 29
},
STANDARDS_DATA: {
start: 30,
end: 39
},
ARCHIVED_EMPIRE: {
start: 40,
end: 49
},
RESERVED: {
start: 50,
end: 89
},
STATS: {
start: 90,
end: 99
}
}, Mt = function() {
function e() {
this.activeSegments = new Set, this.segmentCache = new Map;
}
return e.prototype.requestSegment = function(e) {
if (e < 0 || e > 99) throw new Error("Invalid segment ID: ".concat(e, ". Must be 0-99."));
this.activeSegments.add(e);
var t = Array.from(this.activeSegments);
if (t.length > 10) throw ye.error("Cannot have more than 10 active segments", {
subsystem: "MemorySegmentManager",
meta: {
requested: e,
currentCount: t.length,
activeSegments: t
}
}), this.activeSegments.delete(e), new Error("Segment limit exceeded: Cannot load segment ".concat(e, ". Already have ").concat(t.length - 1, " active segments (limit: 10). Release a segment first."));
RawMemory.setActiveSegments(t);
}, e.prototype.releaseSegment = function(e) {
this.activeSegments.delete(e), this.segmentCache.delete(e), RawMemory.setActiveSegments(Array.from(this.activeSegments));
}, e.prototype.isSegmentLoaded = function(e) {
return void 0 !== RawMemory.segments[e];
}, e.prototype.writeSegment = function(e, t, r, o) {
if (void 0 === o && (o = 1), !this.isSegmentLoaded(e)) return ye.warn("Attempted to write to unloaded segment", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e,
key: t
}
}), !1;
try {
var n = RawMemory.segments[e], a = n ? JSON.parse(n) : {}, i = {
data: r,
lastUpdate: Game.time,
version: o
};
a[t] = i;
var s = JSON.stringify(a);
return s.length > 102400 ? (ye.error("Segment data exceeds 100KB limit", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e,
key: t,
size: s.length
}
}), !1) : (RawMemory.segments[e] = s, this.segmentCache.set(e, a), !0);
} catch (r) {
return ye.error("Failed to write segment data", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e,
key: t,
error: String(r)
}
}), !1;
}
}, e.prototype.readSegment = function(e, t) {
if (!this.isSegmentLoaded(e)) return ye.warn("Attempted to read from unloaded segment", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e,
key: t
}
}), null;
try {
var r = this.segmentCache.get(e);
if (!r) {
var o = RawMemory.segments[e];
if (!o) return null;
if (null == (r = JSON.parse(o))) return null;
this.segmentCache.set(e, r);
}
var n = r[t];
return n ? n.data : null;
} catch (r) {
return ye.error("Failed to read segment data", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e,
key: t,
error: String(r)
}
}), null;
}
}, e.prototype.getSegmentMetadata = function(e, t) {
if (!this.isSegmentLoaded(e)) return null;
try {
var r = RawMemory.segments[e];
if (!r) return null;
var o = JSON.parse(r)[t];
return o ? {
lastUpdate: o.lastUpdate,
version: o.version
} : null;
} catch (e) {
return null;
}
}, e.prototype.deleteSegmentKey = function(e, t) {
if (!this.isSegmentLoaded(e)) return !1;
try {
var r = RawMemory.segments[e];
if (!r) return !1;
var o = JSON.parse(r);
return delete o[t], RawMemory.segments[e] = JSON.stringify(o), this.segmentCache.set(e, o), 
!0;
} catch (e) {
return !1;
}
}, e.prototype.clearSegment = function(e) {
this.isSegmentLoaded(e) ? (RawMemory.segments[e] = "", this.segmentCache.delete(e)) : ye.warn("Attempted to clear unloaded segment", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e
}
});
}, e.prototype.getSegmentKeys = function(e) {
if (!this.isSegmentLoaded(e)) return [];
try {
var t = RawMemory.segments[e];
if (!t) return [];
var r = JSON.parse(t);
return Object.keys(r);
} catch (e) {
return [];
}
}, e.prototype.getSegmentSize = function(e) {
if (!this.isSegmentLoaded(e)) return 0;
var t = RawMemory.segments[e];
return t ? t.length : 0;
}, e.prototype.getActiveSegments = function() {
return Array.from(this.activeSegments);
}, e.prototype.suggestSegmentForType = function(e) {
for (var t = kt[e], r = t.start; r <= t.end; r++) if (!this.isSegmentLoaded(r) || this.getSegmentSize(r) < 92160) return r;
return t.start;
}, e.prototype.migrateToSegment = function(e, t, r) {
var o, a, i = e.split("."), s = Memory;
try {
for (var c = n(i), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (!s || "object" != typeof s || !(u in s)) return ye.warn("Memory path not found for migration", {
subsystem: "MemorySegmentManager",
meta: {
memoryPath: e,
segmentId: t,
key: r
}
}), !1;
s = s[u];
}
} catch (e) {
o = {
error: e
};
} finally {
try {
l && !l.done && (a = c.return) && a.call(c);
} finally {
if (o) throw o.error;
}
}
if (!this.isSegmentLoaded(t)) return this.requestSegment(t), ye.info("Segment not loaded, will migrate next tick", {
subsystem: "MemorySegmentManager",
meta: {
memoryPath: e,
segmentId: t,
key: r
}
}), !1;
var m = this.writeSegment(t, r, s);
return m && ye.info("Successfully migrated data to segment", {
subsystem: "MemorySegmentManager",
meta: {
memoryPath: e,
segmentId: t,
key: r,
dataSize: JSON.stringify(s).length
}
}), m;
}, e;
}(), At = new Mt, Nt = {
exports: {}
}, It = (Et || (Et = 1, Tt = Nt, Ct = function() {
var e = String.fromCharCode, t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", o = {};
function n(e, t) {
if (!o[e]) {
o[e] = {};
for (var r = 0; r < e.length; r++) o[e][e.charAt(r)] = r;
}
return o[e][t];
}
var a = {
compressToBase64: function(e) {
if (null == e) return "";
var r = a._compress(e, 6, function(e) {
return t.charAt(e);
});
switch (r.length % 4) {
default:
case 0:
return r;

case 1:
return r + "===";

case 2:
return r + "==";

case 3:
return r + "=";
}
},
decompressFromBase64: function(e) {
return null == e ? "" : "" == e ? null : a._decompress(e.length, 32, function(r) {
return n(t, e.charAt(r));
});
},
compressToUTF16: function(t) {
return null == t ? "" : a._compress(t, 15, function(t) {
return e(t + 32);
}) + " ";
},
decompressFromUTF16: function(e) {
return null == e ? "" : "" == e ? null : a._decompress(e.length, 16384, function(t) {
return e.charCodeAt(t) - 32;
});
},
compressToUint8Array: function(e) {
for (var t = a.compress(e), r = new Uint8Array(2 * t.length), o = 0, n = t.length; o < n; o++) {
var i = t.charCodeAt(o);
r[2 * o] = i >>> 8, r[2 * o + 1] = i % 256;
}
return r;
},
decompressFromUint8Array: function(t) {
if (null == t) return a.decompress(t);
for (var r = new Array(t.length / 2), o = 0, n = r.length; o < n; o++) r[o] = 256 * t[2 * o] + t[2 * o + 1];
var i = [];
return r.forEach(function(t) {
i.push(e(t));
}), a.decompress(i.join(""));
},
compressToEncodedURIComponent: function(e) {
return null == e ? "" : a._compress(e, 6, function(e) {
return r.charAt(e);
});
},
decompressFromEncodedURIComponent: function(e) {
return null == e ? "" : "" == e ? null : (e = e.replace(/ /g, "+"), a._decompress(e.length, 32, function(t) {
return n(r, e.charAt(t));
}));
},
compress: function(t) {
return a._compress(t, 16, function(t) {
return e(t);
});
},
_compress: function(e, t, r) {
if (null == e) return "";
var o, n, a, i = {}, s = {}, c = "", l = "", u = "", m = 2, p = 3, d = 2, f = [], y = 0, g = 0;
for (a = 0; a < e.length; a += 1) if (c = e.charAt(a), Object.prototype.hasOwnProperty.call(i, c) || (i[c] = p++, 
s[c] = !0), l = u + c, Object.prototype.hasOwnProperty.call(i, l)) u = l; else {
if (Object.prototype.hasOwnProperty.call(s, u)) {
if (u.charCodeAt(0) < 256) {
for (o = 0; o < d; o++) y <<= 1, g == t - 1 ? (g = 0, f.push(r(y)), y = 0) : g++;
for (n = u.charCodeAt(0), o = 0; o < 8; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
f.push(r(y)), y = 0) : g++, n >>= 1;
} else {
for (n = 1, o = 0; o < d; o++) y = y << 1 | n, g == t - 1 ? (g = 0, f.push(r(y)), 
y = 0) : g++, n = 0;
for (n = u.charCodeAt(0), o = 0; o < 16; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
f.push(r(y)), y = 0) : g++, n >>= 1;
}
0 == --m && (m = Math.pow(2, d), d++), delete s[u];
} else for (n = i[u], o = 0; o < d; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
f.push(r(y)), y = 0) : g++, n >>= 1;
0 == --m && (m = Math.pow(2, d), d++), i[l] = p++, u = String(c);
}
if ("" !== u) {
if (Object.prototype.hasOwnProperty.call(s, u)) {
if (u.charCodeAt(0) < 256) {
for (o = 0; o < d; o++) y <<= 1, g == t - 1 ? (g = 0, f.push(r(y)), y = 0) : g++;
for (n = u.charCodeAt(0), o = 0; o < 8; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
f.push(r(y)), y = 0) : g++, n >>= 1;
} else {
for (n = 1, o = 0; o < d; o++) y = y << 1 | n, g == t - 1 ? (g = 0, f.push(r(y)), 
y = 0) : g++, n = 0;
for (n = u.charCodeAt(0), o = 0; o < 16; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
f.push(r(y)), y = 0) : g++, n >>= 1;
}
0 == --m && (m = Math.pow(2, d), d++), delete s[u];
} else for (n = i[u], o = 0; o < d; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
f.push(r(y)), y = 0) : g++, n >>= 1;
0 == --m && (m = Math.pow(2, d), d++);
}
for (n = 2, o = 0; o < d; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, f.push(r(y)), 
y = 0) : g++, n >>= 1;
for (;;) {
if (y <<= 1, g == t - 1) {
f.push(r(y));
break;
}
g++;
}
return f.join("");
},
decompress: function(e) {
return null == e ? "" : "" == e ? null : a._decompress(e.length, 32768, function(t) {
return e.charCodeAt(t);
});
},
_decompress: function(t, r, o) {
var n, a, i, s, c, l, u, m = [], p = 4, d = 4, f = 3, y = "", g = [], h = {
val: o(0),
position: r,
index: 1
};
for (n = 0; n < 3; n += 1) m[n] = n;
for (i = 0, c = Math.pow(2, 2), l = 1; l != c; ) s = h.val & h.position, h.position >>= 1, 
0 == h.position && (h.position = r, h.val = o(h.index++)), i |= (s > 0 ? 1 : 0) * l, 
l <<= 1;
switch (i) {
case 0:
for (i = 0, c = Math.pow(2, 8), l = 1; l != c; ) s = h.val & h.position, h.position >>= 1, 
0 == h.position && (h.position = r, h.val = o(h.index++)), i |= (s > 0 ? 1 : 0) * l, 
l <<= 1;
u = e(i);
break;

case 1:
for (i = 0, c = Math.pow(2, 16), l = 1; l != c; ) s = h.val & h.position, h.position >>= 1, 
0 == h.position && (h.position = r, h.val = o(h.index++)), i |= (s > 0 ? 1 : 0) * l, 
l <<= 1;
u = e(i);
break;

case 2:
return "";
}
for (m[3] = u, a = u, g.push(u); ;) {
if (h.index > t) return "";
for (i = 0, c = Math.pow(2, f), l = 1; l != c; ) s = h.val & h.position, h.position >>= 1, 
0 == h.position && (h.position = r, h.val = o(h.index++)), i |= (s > 0 ? 1 : 0) * l, 
l <<= 1;
switch (u = i) {
case 0:
for (i = 0, c = Math.pow(2, 8), l = 1; l != c; ) s = h.val & h.position, h.position >>= 1, 
0 == h.position && (h.position = r, h.val = o(h.index++)), i |= (s > 0 ? 1 : 0) * l, 
l <<= 1;
m[d++] = e(i), u = d - 1, p--;
break;

case 1:
for (i = 0, c = Math.pow(2, 16), l = 1; l != c; ) s = h.val & h.position, h.position >>= 1, 
0 == h.position && (h.position = r, h.val = o(h.index++)), i |= (s > 0 ? 1 : 0) * l, 
l <<= 1;
m[d++] = e(i), u = d - 1, p--;
break;

case 2:
return g.join("");
}
if (0 == p && (p = Math.pow(2, f), f++), m[u]) y = m[u]; else {
if (u !== d) return null;
y = a + a.charAt(0);
}
g.push(y), m[d++] = a + y.charAt(0), a = y, 0 == --p && (p = Math.pow(2, f), f++);
}
}
};
return a;
}(), null != Tt ? Tt.exports = Ct : "undefined" != typeof angular && null != angular && angular.module("LZString", []).factory("LZString", function() {
return Ct;
})), Nt.exports), Pt = function() {
function e() {}
return e.prototype.compress = function(e, t) {
void 0 === t && (t = 1);
var r = JSON.stringify(e), o = r.length, n = It.compressToUTF16(r);
return {
compressed: n,
originalSize: o,
compressedSize: n.length,
timestamp: Game.time,
version: t
};
}, e.prototype.decompress = function(e) {
try {
var t = "string" == typeof e ? e : e.compressed, r = It.decompressFromUTF16(t);
return r ? JSON.parse(r) : (ye.error("Decompression returned null", {
subsystem: "MemoryCompressor"
}), null);
} catch (e) {
return ye.error("Failed to decompress data", {
subsystem: "MemoryCompressor",
meta: {
error: String(e)
}
}), null;
}
}, e.prototype.compressIntel = function(e) {
return this.compress(e);
}, e.prototype.decompressIntel = function(e) {
return this.decompress(e);
}, e.prototype.compressPortalMap = function(e) {
return this.compress(e);
}, e.prototype.decompressPortalMap = function(e) {
return this.decompress(e);
}, e.prototype.compressMarketHistory = function(e) {
return this.compress(e);
}, e.prototype.decompressMarketHistory = function(e) {
return this.decompress(e);
}, e.prototype.getCompressionStats = function(e) {
var t = this.compress(e), r = t.originalSize, o = t.compressedSize;
return {
originalSize: r,
compressedSize: o,
bytesSaved: r - o,
ratio: o / r
};
}, e.prototype.shouldCompress = function(e, t, r) {
if (void 0 === t && (t = 1e3), void 0 === r && (r = .9), JSON.stringify(e).length < t) return !1;
var o = this.compress(e);
return o.compressedSize / o.originalSize < r;
}, e.prototype.compressIfBeneficial = function(e, t, r) {
return void 0 === t && (t = 1e3), void 0 === r && (r = .9), this.shouldCompress(e, t, r) ? this.compress(e) : e;
}, e.prototype.isCompressed = function(e) {
return "object" == typeof e && null !== e && "compressed" in e && "originalSize" in e && "compressedSize" in e;
}, e.prototype.getOrDecompress = function(e) {
return this.isCompressed(e) ? this.decompress(e) : e;
}, e.prototype.batchCompress = function(e) {
var t = {};
for (var r in e) t[r] = this.compress(e[r]);
return t;
}, e.prototype.batchDecompress = function(e) {
var t = {};
for (var r in e) t[r] = this.decompress(e[r]);
return t;
}, e.prototype.formatStats = function(e) {
var t = (100 * (1 - e.ratio)).toFixed(1);
return "".concat(this.formatBytes(e.originalSize), " → ").concat(this.formatBytes(e.compressedSize), " (").concat(t, "% saved)");
}, e.prototype.formatBytes = function(e) {
return e < 1024 ? "".concat(e, "B") : e < 1048576 ? "".concat((e / 1024).toFixed(1), "KB") : "".concat((e / 1048576).toFixed(2), "MB");
}, e;
}(), Gt = new Pt, Lt = [ {
version: 4,
description: "Move historical intel to memory segments",
migrate: function(e) {
var t, r, o = e.empire;
if (null == o ? void 0 : o.knownRooms) {
var n = {}, a = {}, i = Game.time - 5e3;
for (var s in o.knownRooms) {
var c = o.knownRooms[s];
c.lastSeen >= i || (null === (r = null === (t = Game.rooms[s]) || void 0 === t ? void 0 : t.controller) || void 0 === r ? void 0 : r.my) || c.isHighway || c.hasPortal ? n[s] = c : a[s] = c;
}
if (Object.keys(a).length > 0) {
var l = At.suggestSegmentForType("HISTORICAL_INTEL");
if (!At.isSegmentLoaded(l)) return At.requestSegment(l), void ye.info("Segment not loaded, migration will continue next tick", {
subsystem: "MemoryMigrations",
meta: {
segmentId: l
}
});
if (!At.writeSegment(l, "historicalIntel", a)) return void ye.error("Failed to write historical intel to segment", {
subsystem: "MemoryMigrations",
meta: {
segmentId: l
}
});
o.knownRooms = n, ye.info("Migrated historical intel to segments", {
subsystem: "MemoryMigrations",
meta: {
historicalCount: Object.keys(a).length,
activeCount: Object.keys(n).length,
segmentId: l
}
});
}
}
}
}, {
version: 5,
description: "Compress portal map data",
migrate: function(e) {
var t = e.empire;
if (t) {
var r = t, o = r.portals;
if (o && !Gt.isCompressed(o)) {
var n = Gt.compressPortalMap(o);
r.compressedPortals = n, delete r.portals, ye.info("Compressed portal map data", {
subsystem: "MemoryMigrations",
meta: {
originalSize: n.originalSize,
compressedSize: n.compressedSize,
ratio: (n.compressedSize / n.originalSize * 100).toFixed(1) + "%"
}
});
}
}
}
}, {
version: 6,
description: "Move market history to segments with compression",
migrate: function(e) {
var t = e.empire;
if (null == t ? void 0 : t.market) {
var r = t.market, o = r.priceHistory;
if (o) {
var n = Gt.compressMarketHistory(o), a = At.suggestSegmentForType("MARKET_HISTORY");
if (!At.isSegmentLoaded(a)) return At.requestSegment(a), void ye.info("Segment not loaded, migration will continue next tick", {
subsystem: "MemoryMigrations",
meta: {
segmentId: a
}
});
At.writeSegment(a, "priceHistory", n) ? (delete r.priceHistory, ye.info("Migrated market history to segments", {
subsystem: "MemoryMigrations",
meta: {
originalSize: n.originalSize,
compressedSize: n.compressedSize,
segmentId: a
}
})) : ye.error("Failed to write market history to segment", {
subsystem: "MemoryMigrations",
meta: {
segmentId: a
}
});
}
}
}
}, {
version: 7,
description: "Ensure all clusters have required array properties",
migrate: function(e) {
var t = e.clusters;
if (t) {
var r = 0;
for (var o in t) {
var n = t[o];
n.squads || (n.squads = [], r++), n.defenseRequests || (n.defenseRequests = [], 
r++), n.resourceRequests || (n.resourceRequests = [], r++), n.rallyPoints || (n.rallyPoints = [], 
r++);
}
r > 0 && ye.info("Migrated ".concat(r, " cluster array properties"), {
subsystem: "MemoryMigrations",
meta: {
clustersProcessed: Object.keys(t).length
}
});
}
}
} ], Dt = function() {
function e() {}
return e.prototype.runMigrations = function() {
var e, t, r, o = Memory, a = null !== (r = o.memoryVersion) && void 0 !== r ? r : 0, i = Lt.filter(function(e) {
return e.version > a;
});
if (0 !== i.length) {
ye.info("Running ".concat(i.length, " memory migration(s)"), {
subsystem: "MigrationRunner",
meta: {
fromVersion: a,
toVersion: i[i.length - 1].version
}
});
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
try {
ye.info("Running migration v".concat(l.version, ": ").concat(l.description), {
subsystem: "MigrationRunner"
}), l.migrate(Memory), o.memoryVersion = l.version, ye.info("Migration v".concat(l.version, " complete"), {
subsystem: "MigrationRunner"
});
} catch (e) {
ye.error("Migration v".concat(l.version, " failed"), {
subsystem: "MigrationRunner",
meta: {
error: String(e)
}
}), Game.notify("Migration v".concat(l.version, " failed: ").concat(String(e)));
break;
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
}
}, e.prototype.getCurrentVersion = function() {
var e;
return null !== (e = Memory.memoryVersion) && void 0 !== e ? e : 0;
}, e.prototype.getLatestVersion = function() {
return 0 === Lt.length ? 0 : Math.max.apply(Math, i([], a(Lt.map(function(e) {
return e.version;
})), !1));
}, e.prototype.hasPendingMigrations = function() {
return this.getCurrentVersion() < this.getLatestVersion();
}, e.prototype.getPendingMigrations = function() {
var e = this.getCurrentVersion();
return Lt.filter(function(t) {
return t.version > e;
});
}, e.prototype.rollbackToVersion = function(e) {
var t = Memory;
ye.warn("Rolling back memory version to ".concat(e), {
subsystem: "MigrationRunner",
meta: {
fromVersion: this.getCurrentVersion(),
toVersion: e
}
}), t.memoryVersion = e, Game.notify("Memory version rolled back to ".concat(e, ". Data may be inconsistent!"));
}, e;
}(), Ft = new Dt, Bt = "empire", Ht = "clusters", Wt = function() {
function e() {
this.lastInitializeTick = null, this.lastCleanupTick = 0, this.lastPruningTick = 0, 
this.lastMonitoringTick = 0;
}
return e.prototype.initialize = function() {
this.lastInitializeTick !== Game.time && (this.lastInitializeTick = Game.time, be.initialize(), 
Ft.runMigrations(), this.ensureEmpireMemory(), this.ensureClustersMemory(), Game.time - this.lastCleanupTick >= 10 && (this.cleanDeadCreeps(), 
this.lastCleanupTick = Game.time), Game.time - this.lastPruningTick >= 100 && (Ut.pruneAll(), 
this.lastPruningTick = Game.time), Game.time - this.lastMonitoringTick >= 50 && (bt.checkMemoryUsage(), 
this.lastMonitoringTick = Game.time));
}, e.prototype.ensureEmpireMemory = function() {
var e = Memory;
e[Bt] || (e[Bt] = {
knownRooms: {},
clusters: [],
warTargets: [],
ownedRooms: {},
claimQueue: [],
nukeCandidates: [],
powerBanks: [],
market: {
resources: {},
lastScan: 0,
pendingArbitrage: [],
completedArbitrage: 0,
arbitrageProfit: 0
},
objectives: {
targetPowerLevel: 0,
targetRoomCount: 1,
warMode: !1,
expansionPaused: !1
},
lastUpdate: 0
});
}, e.prototype.ensureClustersMemory = function() {
var e = Memory;
e[Ht] || (e[Ht] = {});
}, e.prototype.getEmpire = function() {
var e = "memory:".concat(Bt), t = be.get(e);
if (!t) {
this.ensureEmpireMemory();
var r = Memory;
be.set(e, r[Bt], Ce), t = r[Bt];
}
return t;
}, e.prototype.getClusters = function() {
var e = "memory:".concat(Ht), t = be.get(e);
if (!t) {
this.ensureClustersMemory();
var r = Memory;
be.set(e, r[Ht], Ce), t = r[Ht];
}
return t;
}, e.prototype.getCluster = function(e, t) {
var r = this.getClusters();
return !r[e] && t && (r[e] = function(e, t) {
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
economyIndex: 50
},
squads: [],
rallyPoints: [],
defenseRequests: [],
resourceRequests: [],
lastUpdate: 0
};
}(e, t)), r[e];
}, e.prototype.getSwarmState = function(e) {
var t, r = "memory:room:".concat(e, ":swarm"), o = be.get(r);
if (!o) {
var n = null === (t = Memory.rooms) || void 0 === t ? void 0 : t[e];
if (!n) return;
var a = n.swarm;
a && (be.set(r, a, Ce), o = a);
}
return o;
}, e.prototype.initSwarmState = function(e) {
var t = "memory:room:".concat(e, ":swarm");
Memory.rooms || (Memory.rooms = {}), Memory.rooms[e] || (Memory.rooms[e] = {});
var r = Memory.rooms[e];
return r.swarm || (r.swarm = {
colonyLevel: "seedNest",
posture: "eco",
danger: 0,
pheromones: {
expand: 0,
harvest: 10,
build: 5,
upgrade: 5,
defense: 0,
war: 0,
siege: 0,
logistics: 5,
nukeTarget: 0
},
nextUpdateTick: 0,
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
role: "secondaryCore",
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
lastUpdate: 0
}), be.set(t, r.swarm, Ce), r.swarm;
}, e.prototype.getOrInitSwarmState = function(e) {
var t;
return null !== (t = this.getSwarmState(e)) && void 0 !== t ? t : this.initSwarmState(e);
}, e.prototype.getCreepMemory = function(e) {
var t = Game.creeps[e];
if (t) return t.memory;
}, e.prototype.cleanDeadCreeps = function() {
var e = 0;
for (var t in Memory.creeps) t in Game.creeps || (delete Memory.creeps[t], e++);
return e;
}, e.prototype.recordRoomSeen = function(e) {
var t = this.getEmpire();
t.knownRooms[e] ? t.knownRooms[e].lastSeen = Game.time : t.knownRooms[e] = {
name: e,
lastSeen: Game.time,
sources: 0,
controllerLevel: 0,
threatLevel: 0,
scouted: !1,
terrain: "mixed",
isHighway: !1,
isSK: !1
};
}, e.prototype.addRoomEvent = function(e, t, r) {
var o = this.getSwarmState(e);
if (o) {
var n = {
type: t,
time: Game.time
};
for (void 0 !== r && (n.details = r), o.eventLog.push(n); o.eventLog.length > 20; ) o.eventLog.shift();
}
}, e.prototype.getMemorySize = function() {
return JSON.stringify(Memory).length;
}, e.prototype.isMemoryNearLimit = function() {
return this.getMemorySize() > 1887436.8;
}, e.prototype.persistHeapCache = function() {
be.persist();
}, e.prototype.getHeapCache = function() {
return be;
}, e.prototype.isRoomHostile = function(e) {
var t, r, o, n = "memory:room:".concat(e, ":hostile"), a = be.get(n);
if (void 0 !== a) return !0 === a;
var i = null !== (o = null === (r = null === (t = Memory.rooms) || void 0 === t ? void 0 : t[e]) || void 0 === r ? void 0 : r.hostile) && void 0 !== o && o;
return be.set(n, !!i || null, 100), i;
}, e.prototype.setRoomHostile = function(e, t) {
Memory.rooms || (Memory.rooms = {}), Memory.rooms[e] || (Memory.rooms[e] = {}), 
Memory.rooms[e].hostile = t;
var r = "memory:room:".concat(e, ":hostile");
be.set(r, !!t || null, 100);
}, e;
}(), Yt = new Wt;

!function(e) {
e[e.DEBUG = 0] = "DEBUG", e[e.INFO = 1] = "INFO", e[e.WARN = 2] = "WARN", e[e.ERROR = 3] = "ERROR", 
e[e.NONE = 4] = "NONE";
}(St || (St = {}));

var Kt, Vt = new (function() {
function e() {
this.level = St.INFO;
}
return e.prototype.setLevel = function(e) {
this.level = e;
}, e.prototype.debug = function(e, t) {
this.level <= St.DEBUG && console.log(JSON.stringify(r({
level: "DEBUG",
message: e,
tick: Game.time
}, t)));
}, e.prototype.info = function(e, t) {
this.level <= St.INFO && console.log(JSON.stringify(r({
level: "INFO",
message: e,
tick: Game.time
}, t)));
}, e.prototype.warn = function(e, t) {
this.level <= St.WARN && console.log(JSON.stringify(r({
level: "WARN",
message: e,
tick: Game.time
}, t)));
}, e.prototype.error = function(e, t) {
this.level <= St.ERROR && console.log(JSON.stringify(r({
level: "ERROR",
message: e,
tick: Game.time
}, t)));
}, e;
}());

!function(e) {
e[e.CRITICAL = 100] = "CRITICAL", e[e.HIGH = 75] = "HIGH", e[e.NORMAL = 50] = "NORMAL", 
e[e.LOW = 25] = "LOW", e[e.BACKGROUND = 10] = "BACKGROUND";
}(Kt || (Kt = {}));

var jt, zt = {
"hostile.detected": Kt.CRITICAL,
"nuke.detected": Kt.CRITICAL,
"safemode.activated": Kt.CRITICAL,
"structure.destroyed": Kt.HIGH,
"hostile.cleared": Kt.HIGH,
"creep.died": Kt.HIGH,
"energy.critical": Kt.HIGH,
"spawn.emergency": Kt.HIGH,
"posture.change": Kt.HIGH,
"spawn.completed": Kt.NORMAL,
"rcl.upgrade": Kt.NORMAL,
"construction.complete": Kt.NORMAL,
"remote.lost": Kt.NORMAL,
"squad.formed": Kt.NORMAL,
"squad.dissolved": Kt.NORMAL,
"market.transaction": Kt.LOW,
"pheromone.update": Kt.LOW,
"cluster.update": Kt.LOW,
"expansion.candidate": Kt.LOW,
"powerbank.discovered": Kt.LOW,
"cpu.spike": Kt.BACKGROUND,
"bucket.modeChange": Kt.BACKGROUND
}, qt = {
maxEventsPerTick: 50,
maxQueueSize: 200,
lowBucketThreshold: 2e3,
criticalBucketThreshold: 1e3,
maxEventAge: 100,
enableLogging: !1,
statsLogInterval: 100
}, Xt = function() {
function e(e) {
void 0 === e && (e = {}), this.handlers = new Map, this.eventQueue = [], this.handlerIdCounter = 0, 
this.stats = {
eventsEmitted: 0,
eventsProcessed: 0,
eventsDeferred: 0,
eventsDropped: 0,
handlersInvoked: 0
}, this.config = r(r({}, qt), e);
}
return e.prototype.on = function(e, t, r) {
var o, n, a, i, s = this;
void 0 === r && (r = {});
var c = {
handler: t,
priority: null !== (o = r.priority) && void 0 !== o ? o : Kt.NORMAL,
minBucket: null !== (n = r.minBucket) && void 0 !== n ? n : 0,
once: null !== (a = r.once) && void 0 !== a && a,
id: "handler_".concat(++this.handlerIdCounter)
}, l = null !== (i = this.handlers.get(e)) && void 0 !== i ? i : [];
return l.push(c), l.sort(function(e, t) {
return t.priority - e.priority;
}), this.handlers.set(e, l), this.config.enableLogging && Vt.debug('EventBus: Registered handler for "'.concat(e, '" (id: ').concat(c.id, ")"), {
subsystem: "EventBus"
}), function() {
return s.off(e, c.id);
};
}, e.prototype.once = function(e, t, o) {
return void 0 === o && (o = {}), this.on(e, t, r(r({}, o), {
once: !0
}));
}, e.prototype.off = function(e, t) {
var r = this.handlers.get(e);
if (r) {
var o = r.findIndex(function(e) {
return e.id === t;
});
-1 !== o && (r.splice(o, 1), this.config.enableLogging && Vt.debug('EventBus: Unregistered handler "'.concat(t, '" from "').concat(e, '"'), {
subsystem: "EventBus"
}));
}
}, e.prototype.offAll = function(e) {
this.handlers.delete(e), this.config.enableLogging && Vt.debug('EventBus: Removed all handlers for "'.concat(e, '"'), {
subsystem: "EventBus"
});
}, e.prototype.emit = function(e, t, o) {
var n, a, i;
void 0 === o && (o = {});
var s = r(r({}, t), {
tick: Game.time
}), c = null !== (a = null !== (n = o.priority) && void 0 !== n ? n : zt[e]) && void 0 !== a ? a : Kt.NORMAL, l = null !== (i = o.immediate) && void 0 !== i ? i : c >= Kt.CRITICAL;
this.stats.eventsEmitted++, this.config.enableLogging && Vt.debug('EventBus: Emitting "'.concat(e, '" (priority: ').concat(c, ", immediate: ").concat(String(l), ")"), {
subsystem: "EventBus"
});
var u = Game.cpu.bucket;
l || u >= this.config.lowBucketThreshold ? this.processEvent(e, s) : u >= this.config.criticalBucketThreshold ? this.queueEvent(e, s, c) : c >= Kt.CRITICAL ? this.processEvent(e, s) : (this.stats.eventsDropped++, 
this.config.enableLogging && Vt.warn('EventBus: Dropped event "'.concat(e, '" due to critical bucket'), {
subsystem: "EventBus"
}));
}, e.prototype.processEvent = function(e, t) {
var r, o, a, i, s = this.handlers.get(e);
if (s && 0 !== s.length) {
var c = Game.cpu.bucket, l = [];
try {
for (var u = n(s), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (!(c < p.minBucket)) try {
p.handler(t), this.stats.handlersInvoked++, p.once && l.push(p.id);
} catch (t) {
var d = t instanceof Error ? t.message : String(t);
Vt.error('EventBus: Handler error for "'.concat(e, '": ').concat(d), {
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
for (var f = n(l), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
this.off(e, g);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
y && !y.done && (i = f.return) && i.call(f);
} finally {
if (a) throw a.error;
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
return e.event.priority < Kt.HIGH;
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
var e, t, o = 0;
try {
for (var a = n(this.handlers.values()), i = a.next(); !i.done; i = a.next()) o += i.value.length;
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return r(r({}, this.stats), {
queueSize: this.eventQueue.length,
handlerCount: o
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
return r({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = r(r({}, this.config), e);
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
Vt.debug("EventBus stats: ".concat(e.eventsEmitted, " emitted, ").concat(e.eventsProcessed, " processed, ") + "".concat(e.eventsDeferred, " deferred, ").concat(e.eventsDropped, " dropped, ") + "".concat(e.queueSize, " queued, ").concat(e.handlerCount, " handlers"), {
subsystem: "EventBus"
});
}
}, e;
}(), Qt = new Xt, Zt = r({}, {
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
}), Jt = {
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

function $t(e, t, r, o) {
void 0 === o && (o = Jt);
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
}(jt || (jt = {}));

var er = {
targetCpuUsage: .98,
reservedCpuFraction: .02,
enableStats: !0,
statsLogInterval: 100,
budgetWarningThreshold: 1.5,
budgetWarningInterval: 500,
enableAdaptiveBudgets: !0,
adaptiveBudgetConfig: Jt,
enablePriorityDecay: !0,
priorityDecayRate: 1,
maxPriorityBoost: 50
};

function tr(e) {
var t, o, n = e.bucketThresholds.highMode, a = e.bucketThresholds.lowMode, i = function(e) {
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
high: (o = e.budgets).rooms,
medium: o.strategic,
low: Math.max(o.market, o.visualization)
};
return r(r({}, er), {
lowBucketThreshold: a,
highBucketThreshold: n,
criticalBucketThreshold: i,
frequencyIntervals: s,
frequencyMinBucket: c,
frequencyCpuBudgets: l
});
}

var rr, or, nr = function() {
function e(e) {
this.processes = new Map, this.bucketMode = "normal", this.tickCpuUsed = 0, this.initialized = !1, 
this.lastExecutedProcessId = null, this.lastExecutedIndex = -1, this.processQueue = [], 
this.queueDirty = !0, this.skippedProcessesThisTick = 0, this.config = r({}, e), 
this.validateConfig(), this.frequencyDefaults = this.buildFrequencyDefaults();
}
return e.prototype.registerProcess = function(e) {
var t, r, o, n, a, i = null !== (t = e.frequency) && void 0 !== t ? t : "medium", s = this.frequencyDefaults[i];
if (void 0 !== e.tickModulo) {
if (e.tickModulo < 0) throw Vt.error('Kernel: Cannot register process "'.concat(e.name, '" - tickModulo must be non-negative (got ').concat(e.tickModulo, ")"), {
subsystem: "Kernel"
}), new Error("Invalid tickModulo: ".concat(e.tickModulo, " (must be >= 0)"));
if (void 0 !== e.tickOffset && e.tickOffset >= e.tickModulo) throw Vt.error('Kernel: Cannot register process "'.concat(e.name, '" - tickOffset (').concat(e.tickOffset, ") must be less than tickModulo (").concat(e.tickModulo, ")"), {
subsystem: "Kernel"
}), new Error("Invalid tickOffset: ".concat(e.tickOffset, " (must be < tickModulo ").concat(e.tickModulo, ")"));
}
var c = {
id: e.id,
name: e.name,
priority: null !== (r = e.priority) && void 0 !== r ? r : jt.MEDIUM,
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
this.processes.set(e.id, c), this.queueDirty = !0, Vt.debug('Kernel: Registered process "'.concat(c.name, '" (').concat(c.id, ")"), {
subsystem: "Kernel"
});
}, e.prototype.unregisterProcess = function(e) {
var t = this.processes.delete(e);
return t && (this.queueDirty = !0, Vt.debug("Kernel: Unregistered process ".concat(e), {
subsystem: "Kernel"
})), t;
}, e.prototype.getProcess = function(e) {
return this.processes.get(e);
}, e.prototype.getProcesses = function() {
return Array.from(this.processes.values());
}, e.prototype.initialize = function() {
this.initialized || (Vt.info("Kernel initialized with ".concat(this.processes.size, " processes"), {
subsystem: "Kernel"
}), this.initialized = !0);
}, e.prototype.updateBucketMode = function() {
var e, t = Game.cpu.bucket;
if ((e = t < this.config.criticalBucketThreshold ? "critical" : t < this.config.lowBucketThreshold ? "low" : t > this.config.highBucketThreshold ? "high" : "normal") !== this.bucketMode && (Vt.info("Kernel: Bucket mode changed from ".concat(this.bucketMode, " to ").concat(e, " (bucket: ").concat(t, ")"), {
subsystem: "Kernel"
}), this.bucketMode = e), Game.time % 100 == 0 && ("low" === this.bucketMode || "critical" === this.bucketMode)) {
var r = this.processes.size;
Vt.info("Bucket ".concat(this.bucketMode.toUpperCase(), " mode: ").concat(t, "/10000 bucket. ") + "Running all ".concat(r, " processes normally (bucket mode is informational only)"), {
subsystem: "Kernel"
});
}
}, e.prototype.validateConfig = function() {
this.config.criticalBucketThreshold >= this.config.lowBucketThreshold && (Vt.warn("Kernel: Adjusting critical bucket threshold ".concat(this.config.criticalBucketThreshold, " to stay below low threshold ").concat(this.config.lowBucketThreshold), {
subsystem: "Kernel"
}), this.config.criticalBucketThreshold = Math.max(0, this.config.lowBucketThreshold - 1)), 
this.config.lowBucketThreshold >= this.config.highBucketThreshold && (Vt.warn("Kernel: Adjusting high bucket threshold ".concat(this.config.highBucketThreshold, " to stay above low threshold ").concat(this.config.lowBucketThreshold), {
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
return void 0 === e && (e = Jt), function(e, t, r) {
return void 0 === r && (r = Jt), {
high: $t("high", e, t, r),
medium: $t("medium", e, t, r),
low: $t("low", e, t, r)
};
}((t = Object.keys(Game.rooms).length, Math.max(1, t)), Game.cpu.bucket, e);
var t;
}(this.config.adaptiveBudgetConfig);
if (this.config.frequencyCpuBudgets = e, this.frequencyDefaults = this.buildFrequencyDefaults(), 
Game.time % 500 == 0) {
var t = Object.keys(Game.rooms).length, r = Game.cpu.bucket;
Vt.info("Adaptive budgets updated: rooms=".concat(t, ", bucket=").concat(r, ", ") + "high=".concat(e.high.toFixed(3), ", medium=").concat(e.medium.toFixed(3), ", low=").concat(e.low.toFixed(3)), {
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
Vt.debug('Kernel: Process "'.concat(e.name, '" suspended (').concat(r, " ticks remaining)"), {
subsystem: "Kernel"
});
}
return !1;
}
e.state = "idle", e.stats.suspendedUntil = null;
var o = e.stats.suspensionReason;
e.stats.suspensionReason = null, Vt.info('Kernel: Process "'.concat(e.name, '" automatically resumed after suspension. ') + "Previous reason: ".concat(o, ". Consecutive errors: ").concat(e.stats.consecutiveErrors), {
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
if (a < e.interval) return Game.time % 100 == 0 && e.priority >= jt.HIGH && Vt.debug('Kernel: Process "'.concat(e.name, '" skipped (interval: ').concat(a, "/").concat(e.interval, " ticks)"), {
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
Vt.error('Kernel: Process "'.concat(e.name, '" error: ').concat(r), {
subsystem: "Kernel"
}), t instanceof Error && t.stack && Vt.error(t.stack, {
subsystem: "Kernel"
});
var o = e.stats.consecutiveErrors;
if (o >= 10) e.stats.suspendedUntil = Number.MAX_SAFE_INTEGER, e.stats.suspensionReason = "Circuit breaker: ".concat(o, " consecutive failures (permanent)"), 
e.state = "suspended", Vt.error('Kernel: Process "'.concat(e.name, '" permanently suspended after ').concat(o, " consecutive failures"), {
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
e.state = "suspended", Vt.warn('Kernel: Process "'.concat(e.name, '" suspended for ').concat(n, " ticks after ").concat(o, " consecutive failures"), {
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
s > this.config.budgetWarningThreshold && Game.time % this.config.budgetWarningInterval === 0 && Vt.warn('Kernel: Process "'.concat(e.name, '" exceeded CPU budget: ').concat(a.toFixed(3), " > ").concat(i.toFixed(3), " (").concat((100 * s).toFixed(0), "%)"), {
subsystem: "Kernel"
});
}, e.prototype.run = function() {
if (this.updateBucketMode(), this.updateAdaptiveBudgets(), this.tickCpuUsed = 0, 
this.skippedProcessesThisTick = 0, Qt.processQueue(), this.queueDirty && (this.rebuildProcessQueue(), 
Vt.info("Kernel: Rebuilt process queue with ".concat(this.processQueue.length, " processes"), {
subsystem: "Kernel"
})), 0 !== this.processQueue.length) {
Game.time % 10 == 0 && Vt.info("Kernel: Running ".concat(this.processQueue.length, " registered processes"), {
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
r = this.processQueue.length - e - t, Vt.warn("Kernel: CPU budget exhausted after ".concat(e, " processes. ").concat(r, " processes deferred to next tick. Used: ").concat(Game.cpu.getUsed().toFixed(2), "/").concat(this.getCpuLimit().toFixed(2)), {
subsystem: "Kernel"
}), this.config.enablePriorityDecay && r > 0 && (this.queueDirty = !0);
break;
}
this.executeProcess(s), e++, this.lastExecutedProcessId = s.id, this.lastExecutedIndex = i;
} else this.config.enableStats && s.stats.skippedCount++, t++, this.skippedProcessesThisTick++, 
s.stats.runCount > 0 && Game.time - s.stats.lastRunTick < s.interval && o++;
}
this.config.enableStats && Game.time % this.config.statsLogInterval === 0 && (this.logStats(e, t, o, r), 
Qt.logStats());
} else Vt.warn("Kernel: No processes registered in queue", {
subsystem: "Kernel"
});
}, e.prototype.logStats = function(e, t, r, o) {
var n = this, a = Game.cpu.bucket, i = (a / 1e4 * 100).toFixed(1), s = Game.cpu.getUsed(), c = this.getCpuLimit();
if (Vt.info("Kernel: ".concat(e, " ran, ").concat(t, " skipped (interval: ").concat(r, ", CPU: ").concat(o, "), ") + "CPU: ".concat(s.toFixed(2), "/").concat(c.toFixed(2), " (").concat((s / c * 100).toFixed(1), "%), bucket: ").concat(a, "/10000 (").concat(i, "%), mode: ").concat(this.bucketMode), {
subsystem: "Kernel"
}), this.config.enablePriorityDecay && o > 0) {
var l = this.processQueue.filter(function(e) {
return e.stats.consecutiveCpuSkips >= 5;
}).sort(function(e, t) {
return t.stats.consecutiveCpuSkips - e.stats.consecutiveCpuSkips;
}).slice(0, 3);
l.length > 0 && Vt.info("Kernel: Priority decay active: ".concat(l.map(function(e) {
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
u.length > 0 && Vt.warn("Kernel: Top skipped processes: ".concat(u.map(function(e) {
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
return !!t && (t.state = "suspended", Vt.info('Kernel: Suspended process "'.concat(t.name, '"'), {
subsystem: "Kernel"
}), !0);
}, e.prototype.resumeProcess = function(e) {
var t = this.processes.get(e);
if (t && "suspended" === t.state) {
t.state = "idle", t.stats.suspendedUntil = null;
var r = t.stats.suspensionReason;
return t.stats.suspensionReason = null, Vt.info('Kernel: Manually resumed process "'.concat(t.name, '". ') + "Previous reason: ".concat(r, ". Consecutive errors: ").concat(t.stats.consecutiveErrors), {
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
}, 0), n = e.length > 0 ? o / e.length : 0, s = i([], a(e), !1).sort(function(e, t) {
return t.stats.avgCpu - e.stats.avgCpu;
}).slice(0, 5).map(function(e) {
return {
name: e.name,
avgCpu: e.stats.avgCpu
};
}), c = i([], a(e), !1).filter(function(e) {
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
topCpuProcesses: s,
unhealthyProcesses: c,
avgHealthScore: u
};
}, e.prototype.resetStats = function() {
var e, t;
try {
for (var r = n(this.processes.values()), o = r.next(); !o.done; o = r.next()) o.value.stats = {
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
Vt.info("Kernel: Reset all process statistics", {
subsystem: "Kernel"
});
}, e.prototype.getDistributionStats = function() {
var e, t, r = Array.from(this.processes.values()), o = r.filter(function(e) {
return void 0 !== e.tickModulo && e.tickModulo > 0;
}), a = r.filter(function(e) {
return !e.tickModulo || 0 === e.tickModulo;
}), i = {};
try {
for (var s = n(o), c = s.next(); !c.done; c = s.next()) {
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
var u = a.length + o.reduce(function(e, t) {
return e + 1 / (t.tickModulo || 1);
}, 0), m = r.length, p = m > 0 ? (m - u) / m * 100 : 0;
return {
totalProcesses: r.length,
distributedProcesses: o.length,
everyTickProcesses: a.length,
distributionRatio: r.length > 0 ? o.length / r.length : 0,
moduloCounts: i,
averageTickLoad: u,
estimatedCpuReduction: p
};
}, e.prototype.getConfig = function() {
return r({}, this.config);
}, e.prototype.getFrequencyDefaults = function(e) {
return r({}, this.frequencyDefaults[e]);
}, e.prototype.updateConfig = function(e) {
this.config = r(r({}, this.config), e), this.validateConfig(), this.frequencyDefaults = this.buildFrequencyDefaults();
}, e.prototype.updateFromCpuConfig = function(e) {
this.updateConfig(tr(e));
}, e.prototype.on = function(e, t, r) {
return void 0 === r && (r = {}), Qt.on(e, t, r);
}, e.prototype.once = function(e, t, r) {
return void 0 === r && (r = {}), Qt.once(e, t, r);
}, e.prototype.emit = function(e, t, r) {
void 0 === r && (r = {}), Qt.emit(e, t, r);
}, e.prototype.offAll = function(e) {
Qt.offAll(e);
}, e.prototype.processEvents = function() {
Qt.processQueue();
}, e.prototype.getEventStats = function() {
return Qt.getStats();
}, e.prototype.hasEventHandlers = function(e) {
return Qt.hasHandlers(e);
}, e.prototype.getEventBus = function() {
return Qt;
}, e;
}();

new nr(tr(r({}, Zt).cpu)), function(e) {
e.RUNNING = "running", e.DEAD = "dead", e.SUSPENDED = "suspended";
}(rr || (rr = {}));

var ar = {
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
bodyCosts: (or = {}, or[MOVE] = 50, or[WORK] = 100, or[CARRY] = 50, or[ATTACK] = 80, 
or[RANGED_ATTACK] = 150, or[HEAL] = 250, or[CLAIM] = 600, or[TOUGH] = 10, or),
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
}, ir = r({}, ar);

function sr() {
return ir;
}

function cr(e) {
ir = r(r({}, ir), e);
}

function lr(e) {
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
adaptiveBudgetConfig: Jt,
enablePriorityDecay: !0,
priorityDecayRate: 1,
maxPriorityBoost: 50
};
}

var ur = null, mr = new Proxy({}, {
get: function(e, t) {
return ur || (ur = new nr(lr(sr().cpu))), ur[t];
},
set: function(e, t, r) {
return ur || (ur = new nr(lr(sr().cpu))), ur[t] = r, !0;
}
}), pr = [], dr = new Set;

function fr(e) {
return function(t, r, o) {
pr.push({
options: e,
methodName: String(r),
target: t
});
};
}

function yr(e, t, o) {
return fr(r({
id: e,
name: t,
priority: jt.MEDIUM,
frequency: "medium",
minBucket: 0,
cpuBudget: .15,
interval: 5
}, o));
}

function gr(e, t, o) {
return fr(r({
id: e,
name: t,
priority: jt.LOW,
frequency: "low",
minBucket: 0,
cpuBudget: .1,
interval: 20
}, o));
}

function hr(e, t, o) {
return fr(r({
id: e,
name: t,
priority: jt.IDLE,
frequency: "low",
minBucket: 0,
cpuBudget: .05,
interval: 100
}, o));
}

function vr() {
return function(e) {
return dr.add(e), e;
};
}

function Rr(e) {
var t = Math.floor(.1 * e), r = Math.floor(Math.random() * (2 * t + 1)) - t;
return {
interval: Math.max(1, e + r),
jitter: r
};
}

function Er(e) {
var t, r, o, a, i, s = Object.getPrototypeOf(e);
try {
for (var c = n(pr), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u.target === s || Object.getPrototypeOf(u.target) === s || u.target === Object.getPrototypeOf(s)) {
var m = e[u.methodName];
if ("function" == typeof m) {
var p = m.bind(e), d = null !== (o = u.options.interval) && void 0 !== o ? o : 5, f = Rr(d), y = f.interval, g = f.jitter;
mr.registerProcess({
id: u.options.id,
name: u.options.name,
priority: null !== (a = u.options.priority) && void 0 !== a ? a : jt.MEDIUM,
frequency: null !== (i = u.options.frequency) && void 0 !== i ? i : "medium",
minBucket: u.options.minBucket,
cpuBudget: u.options.cpuBudget,
interval: y,
execute: p
}), qe.debug('Registered decorated process "'.concat(u.options.name, '" (').concat(u.options.id, ") with interval ").concat(y, " (base: ").concat(d, ", jitter: ").concat(g > 0 ? "+" : "").concat(g, ")"), {
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

var Tr = {
minGPL: 1,
minPowerReserve: 1e4,
energyPerPower: 50,
minEnergyReserve: 1e5,
gplMilestones: [ 1, 2, 5, 10, 15, 20 ]
}, Cr = [ PWR_GENERATE_OPS, PWR_OPERATE_SPAWN, PWR_OPERATE_EXTENSION, PWR_OPERATE_TOWER, PWR_OPERATE_LAB, PWR_OPERATE_STORAGE, PWR_REGEN_SOURCE, PWR_OPERATE_FACTORY ], Sr = [ PWR_GENERATE_OPS, PWR_OPERATE_SPAWN, PWR_SHIELD, PWR_DISRUPT_SPAWN, PWR_DISRUPT_TOWER, PWR_FORTIFY, PWR_OPERATE_TOWER, PWR_DISRUPT_TERMINAL ], wr = function() {
function e(e) {
void 0 === e && (e = {}), this.assignments = new Map, this.gplState = null, this.lastGPLUpdate = 0, 
this.config = r(r({}, Tr), e);
}
return e.prototype.run = function() {
this.updateGPLState(), this.managePowerProcessing(), this.manageAssignments(), this.checkPowerUpgrades(), 
this.checkRespawnNeeds(), Game.time % 100 == 0 && this.logStatus();
}, e.prototype.updateGPLState = function() {
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
}, this.lastGPLUpdate !== a && a > 0 && (ye.info("GPL milestone reached: Level ".concat(a), {
subsystem: "PowerCreep"
}), this.lastGPLUpdate = a);
} else this.gplState = null;
}, e.prototype.managePowerProcessing = function() {
var e, t, r = this.evaluatePowerProcessing();
try {
for (var o = n(r), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
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
l && u && c.processPower() === OK && ye.debug("Processing power in ".concat(i.roomName, ": ").concat(i.reason), {
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
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.evaluatePowerProcessing = function() {
var e, t, r, o, a, i = [], s = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
}).length > 0;
});
try {
for (var c = n(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.storage, p = u.terminal;
if (m || p) {
var d = (null !== (r = null == m ? void 0 : m.store.getUsedCapacity(RESOURCE_POWER)) && void 0 !== r ? r : 0) + (null !== (o = null == p ? void 0 : p.store.getUsedCapacity(RESOURCE_POWER)) && void 0 !== o ? o : 0), f = null !== (a = null == m ? void 0 : m.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== a ? a : 0, y = !1, g = "", h = 0;
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
}, e.prototype.manageAssignments = function() {
for (var e in Game.powerCreeps) {
var t = Game.powerCreeps[e];
if (t) {
var r = this.assignments.get(e);
r ? (r.level = t.level, r.spawned = void 0 !== t.ticksToLive, r.spawned && !r.lastRespawnTick && (r.lastRespawnTick = Game.time)) : (r = this.createAssignment(t), 
this.assignments.set(e, r));
}
}
this.considerNewPowerCreeps();
}, e.prototype.createAssignment = function(e) {
var t, r;
e.powers[PWR_OPERATE_SPAWN];
var o = void 0 !== e.powers[PWR_DISRUPT_SPAWN] ? "powerWarrior" : "powerQueen", n = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), a = null !== (r = null === (t = n[0]) || void 0 === t ? void 0 : t.name) && void 0 !== r ? r : "";
if ("powerQueen" === o) {
var i = n.filter(function(e) {
return e.controller && e.controller.level >= 7;
}).sort(function(e, t) {
var r, o, n, a, i = 100 * (null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0) + e.find(FIND_MY_STRUCTURES).length;
return 100 * (null !== (a = null === (n = t.controller) || void 0 === n ? void 0 : n.level) && void 0 !== a ? a : 0) + t.find(FIND_MY_STRUCTURES).length - i;
})[0];
i && (a = i.name);
} else {
var s = n.map(function(e) {
return {
room: e,
swarm: Yt.getSwarmState(e.name)
};
}).filter(function(e) {
return null !== e.swarm;
}).sort(function(e, t) {
var r = 100 * e.swarm.danger + e.swarm.metrics.hostileCount;
return 100 * t.swarm.danger + t.swarm.metrics.hostileCount - r;
})[0];
s && (a = s.room.name);
}
var c = this.generatePowerPath(o), l = {
name: e.name,
className: e.className,
role: o,
assignedRoom: a,
level: e.level,
spawned: void 0 !== e.ticksToLive,
lastRespawnTick: void 0 !== e.ticksToLive ? Game.time : void 0,
priority: "powerQueen" === o ? 100 : 80,
powerPath: c
}, u = e.memory;
return u.homeRoom = a, u.role = o, ye.info("Power creep ".concat(e.name, " assigned as ").concat(o, " to ").concat(a), {
subsystem: "PowerCreep"
}), l;
}, e.prototype.generatePowerPath = function(e) {
var t = this, r = ("powerQueen" === e ? Cr : Sr).filter(function(e) {
var r, o, n = POWER_INFO[e];
return n && void 0 !== n.level && n.level[0] <= (null !== (o = null === (r = t.gplState) || void 0 === r ? void 0 : r.currentLevel) && void 0 !== o ? o : 0);
});
return r;
}, e.prototype.checkPowerUpgrades = function() {
var e, t;
if (this.gplState) try {
for (var r = n(this.assignments), o = r.next(); !o.done; o = r.next()) {
var i = a(o.value, 2), s = i[0], c = i[1], l = Game.powerCreeps[s];
if (l && !(l.level >= this.gplState.currentLevel)) {
var u = this.selectNextPower(l, c);
if (u) {
var m = l.upgrade(u);
m === OK ? (ye.info("Upgraded ".concat(l.name, " to level ").concat(l.level + 1, " with ").concat(u), {
subsystem: "PowerCreep"
}), c.level = l.level) : m !== ERR_NOT_ENOUGH_RESOURCES && ye.warn("Failed to upgrade ".concat(l.name, ": ").concat(m), {
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
}, e.prototype.selectNextPower = function(e, t) {
var r, o, a, i, s, c = null !== (a = t.powerPath) && void 0 !== a ? a : this.generatePowerPath(t.role);
try {
for (var l = n(c), u = l.next(); !u.done; u = l.next()) {
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
}, e.prototype.considerNewPowerCreeps = function() {
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
c === OK ? ye.info("Created new power creep: ".concat(i, " (").concat(s, ")"), {
subsystem: "PowerCreep"
}) : ye.warn("Failed to create power creep: ".concat(c), {
subsystem: "PowerCreep"
});
}
}
}
}, e.prototype.checkRespawnNeeds = function() {
var e, t;
try {
for (var r = n(this.assignments), o = r.next(); !o.done; o = r.next()) {
var i = a(o.value, 2), s = i[0], c = i[1], l = Game.powerCreeps[s];
if (l) if (void 0 === l.ticksToLive) {
if (!(u = Game.rooms[c.assignedRoom])) continue;
(m = u.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0]) && l.spawn(m) === OK && (ye.info("Power creep ".concat(s, " spawned at ").concat(u.name), {
subsystem: "PowerCreep"
}), c.spawned = !0, c.lastRespawnTick = Game.time);
} else if (l.ticksToLive < 500) {
var u, m;
if (!(u = l.room)) continue;
(m = u.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0]) && l.pos.getRangeTo(m) <= 1 && l.renew(m) === OK && ye.debug("Power creep ".concat(s, " renewed"), {
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
}, e.prototype.getGPLState = function() {
return this.gplState;
}, e.prototype.getAssignments = function() {
return Array.from(this.assignments.values());
}, e.prototype.getAssignment = function(e) {
return this.assignments.get(e);
}, e.prototype.reassignPowerCreep = function(e, t) {
var r = this.assignments.get(e);
if (!r) return !1;
r.assignedRoom = t;
var o = Game.powerCreeps[e];
return o && (o.memory.homeRoom = t), ye.info("Power creep ".concat(e, " reassigned to ").concat(t), {
subsystem: "PowerCreep"
}), !0;
}, e.prototype.logStatus = function() {
if (this.gplState) {
var e = Array.from(this.assignments.values()).filter(function(e) {
return e.spawned;
}), t = e.filter(function(e) {
return "powerQueen" === e.role;
}).length, r = e.filter(function(e) {
return "powerWarrior" === e.role;
}).length;
ye.info("Power System: GPL ".concat(this.gplState.currentLevel, " ") + "(".concat(this.gplState.currentProgress, "/").concat(this.gplState.progressNeeded, "), ") + "Operators: ".concat(e.length, "/").concat(this.gplState.currentLevel, " ") + "(".concat(t, " eco, ").concat(r, " combat)"), {
subsystem: "PowerCreep"
});
}
}, o([ gr("empire:powerCreep", "Power Creep Management", {
priority: jt.LOW,
interval: 20,
minBucket: 0,
cpuBudget: .03
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), Or = new wr, br = {
minPower: 1e3,
maxDistance: 5,
minTicksRemaining: 3e3,
healerRatio: .5,
minBucket: 0,
maxConcurrentOps: 2
}, _r = function() {
function e(e) {
void 0 === e && (e = {}), this.operations = new Map, this.lastScan = 0, this.config = r(r({}, br), e);
}
return e.prototype.run = function() {
Game.time - this.lastScan >= 50 && (this.scanForPowerBanks(), this.lastScan = Game.time), 
this.updateOperations(), this.evaluateOpportunities(), Game.time % 100 == 0 && this.operations.size > 0 && this.logStatus();
}, e.prototype.scanForPowerBanks = function() {
var e, t, r = Yt.getEmpire(), o = function(o) {
var i, s, c = Game.rooms[o], l = o.match(/^[WE](\d+)[NS](\d+)$/);
if (!l) return "continue";
var u = parseInt(l[1], 10), m = parseInt(l[2], 10);
if (u % 10 != 0 && m % 10 != 0) return "continue";
var p = c.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_BANK;
}
}), d = function(n) {
var i = r.powerBanks.find(function(e) {
return e.roomName === o && e.pos.x === n.pos.x && e.pos.y === n.pos.y;
});
if (i) i.power = n.power, i.decayTick = Game.time + (null !== (t = n.ticksToDecay) && void 0 !== t ? t : 5e3); else {
var s = {
roomName: o,
pos: {
x: n.pos.x,
y: n.pos.y
},
power: n.power,
decayTick: Game.time + (null !== (e = n.ticksToDecay) && void 0 !== e ? e : 5e3),
active: !1
};
r.powerBanks.push(s), n.power >= a.config.minPower && ye.info("Power bank discovered in ".concat(o, ": ").concat(n.power, " power"), {
subsystem: "PowerBank"
});
}
};
try {
for (var f = (i = void 0, n(p)), y = f.next(); !y.done; y = f.next()) d(y.value);
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
}, a = this;
for (var i in Game.rooms) o(i);
r.powerBanks = r.powerBanks.filter(function(e) {
return e.decayTick > Game.time;
});
}, e.prototype.updateOperations = function() {
var e, t;
try {
for (var r = n(this.operations), o = r.next(); !o.done; o = r.next()) {
var i = a(o.value, 2), s = i[0], c = i[1];
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
}, e.prototype.updateScoutingOp = function(e) {
var t, r = Game.rooms[e.roomName];
if (r) {
var o = r.find(FIND_STRUCTURES, {
filter: function(t) {
return t.structureType === STRUCTURE_POWER_BANK && t.pos.x === e.pos.x && t.pos.y === e.pos.y;
}
})[0];
if (!o) return e.state = "failed", void ye.warn("Power bank in ".concat(e.roomName, " disappeared"), {
subsystem: "PowerBank"
});
e.power = o.power, e.decayTick = Game.time + (null !== (t = o.ticksToDecay) && void 0 !== t ? t : 0), 
e.assignedCreeps.attackers.length > 0 && (e.state = "attacking", ye.info("Starting attack on power bank in ".concat(e.roomName), {
subsystem: "PowerBank"
}));
}
}, e.prototype.updateAttackingOp = function(e) {
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
if (!o) return e.state = "collecting", void ye.info("Power bank destroyed in ".concat(e.roomName, ", collecting power"), {
subsystem: "PowerBank"
});
var n = null !== (t = e.lastHits) && void 0 !== t ? t : 2e6;
e.lastHits = o.hits, n > o.hits && (e.damageDealt += n - o.hits);
var a = e.decayTick - Game.time, i = e.damageDealt / Math.max(1, Game.time - e.startedAt), s = o.hits / Math.max(1, i);
s > .9 * a && ye.warn("Power bank in ".concat(e.roomName, " may decay before completion (").concat(Math.round(s), " > ").concat(a, ")"), {
subsystem: "PowerBank"
}), e.estimatedCompletion = Game.time + Math.round(s);
} else 0 === e.assignedCreeps.attackers.length && 0 === e.assignedCreeps.healers.length && (e.state = "failed");
}, e.prototype.updateCollectingOp = function(e) {
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
0 === r.length && 0 === o.length && (e.state = "complete", ye.info("Power bank operation complete in ".concat(e.roomName, ": ").concat(e.powerCollected, " power collected"), {
subsystem: "PowerBank"
}));
} else 0 === e.assignedCreeps.carriers.length && (e.state = "failed");
}, e.prototype.evaluateOpportunities = function() {
var e, t, r = this;
if (!(Array.from(this.operations.values()).filter(function(e) {
return "complete" !== e.state && "failed" !== e.state;
}).length >= this.config.maxConcurrentOps)) {
var o = Yt.getEmpire(), n = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.controller.level >= 7;
});
if (0 !== n.length) {
var a = o.powerBanks.filter(function(e) {
return !(e.active || r.operations.has(e.roomName) || e.power < r.config.minPower || e.decayTick - Game.time < r.config.minTicksRemaining || r.getMinDistanceToOwned(e.roomName, n) > r.config.maxDistance);
}).map(function(e) {
return {
entry: e,
score: r.scorePowerBank(e, n)
};
}).sort(function(e, t) {
return t.score - e.score;
});
if (a.length > 0 && (null !== (t = null === (e = a[0]) || void 0 === e ? void 0 : e.score) && void 0 !== t ? t : 0) > 0) {
var i = a[0];
this.startOperation(i.entry, n);
}
}
}
}, e.prototype.scorePowerBank = function(e, t) {
var r = 0;
r += .01 * e.power;
var o = e.decayTick - Game.time;
return o > 4e3 && (r += 50), o > 5e3 && (r += 30), r -= 20 * this.getMinDistanceToOwned(e.roomName, t), 
e.power >= 3e3 && (r += 50), e.power >= 5e3 && (r += 50), r;
}, e.prototype.getMinDistanceToOwned = function(e, t) {
var r, o, a = 1 / 0;
try {
for (var i = n(t), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(e, c.name);
l < a && (a = l);
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
return a;
}, e.prototype.startOperation = function(e, t) {
var r, o, a = null, i = 1 / 0;
try {
for (var s = n(t), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.map.getRoomLinearDistance(e.roomName, l.name);
u < i && (i = u, a = l);
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
if (a) {
var m = {
roomName: e.roomName,
pos: e.pos,
power: e.power,
decayTick: e.decayTick,
homeRoom: a.name,
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
this.operations.set(e.roomName, m), e.active = !0, ye.info("Started power bank operation in ".concat(e.roomName, " (").concat(e.power, " power, home: ").concat(a.name, ")"), {
subsystem: "PowerBank"
});
}
}, e.prototype.assignCreep = function(e, t, r) {
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
}, e.prototype.recordPowerCollected = function(e, t) {
var r = this.operations.get(e);
r && (r.powerCollected += t);
}, e.prototype.getActiveOperations = function() {
return Array.from(this.operations.values()).filter(function(e) {
return "complete" !== e.state && "failed" !== e.state;
});
}, e.prototype.getOperation = function(e) {
return this.operations.get(e);
}, e.prototype.getRequiredCreeps = function(e) {
var t = e.decayTick - Game.time, r = (2e6 - e.damageDealt) / (.8 * t), o = Math.ceil(r / 600), n = Math.ceil(o * this.config.healerRatio), a = Math.ceil(e.power / 2e3);
return {
attackers: Math.max(1, o),
healers: Math.max(1, n),
carriers: Math.max(1, a)
};
}, e.prototype.requestSpawns = function(e) {
var t, r, o = 0, i = 0, s = 0;
try {
for (var c = n(this.operations), l = c.next(); !l.done; l = c.next()) {
var u = a(l.value, 2), m = (u[0], u[1]);
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
i += Math.max(0, p.healers - d.healers)), "collecting" !== m.state && "attacking" !== m.state || (s += Math.max(0, p.carriers - d.carriers));
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
healers: i,
powerCarriers: s
};
}, e.prototype.getProfitability = function(e, t) {
var r = Game.map.getRoomLinearDistance(e.roomName, t);
e.decayTick, Game.time;
var o = 50 * r + Math.ceil(2e6 / 1200), n = 7200 + .1 * o, a = 10 * e.power - n, i = o > 0 ? a / o : 0;
return {
power: e.power,
energyCost: n,
netProfit: a,
profitPerTick: i
};
}, e.prototype.logStatus = function() {
var e, t, r = Array.from(this.operations.values()).filter(function(e) {
return "complete" !== e.state && "failed" !== e.state;
});
try {
for (var o = n(r), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
ye.info("Power bank op ".concat(i.roomName, ": ").concat(i.state, ", ") + "".concat(i.assignedCreeps.attackers.length, "A/").concat(i.assignedCreeps.healers.length, "H/").concat(i.assignedCreeps.carriers.length, "C, ") + "".concat(Math.round(i.damageDealt / 1e3), "k damage, ").concat(i.powerCollected, " collected"), {
subsystem: "PowerBank"
});
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, o([ gr("empire:powerBank", "Power Bank Harvesting", {
priority: jt.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .02
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), xr = new _r, Ur = function() {
function e() {}
return e.prototype.status = function(e) {
var t, r, o, a, i, s, c, l, u = yt.getConfig(e);
if (!u) return "No lab configuration for ".concat(e);
var m = "=== Lab Status: ".concat(e, " ===\n");
m += "Valid: ".concat(u.isValid, "\n"), m += "Labs: ".concat(u.labs.length, "\n"), 
m += "Last Update: ".concat(Game.time - u.lastUpdate, " ticks ago\n\n"), u.activeReaction && (m += "Active Reaction:\n", 
m += "  ".concat(u.activeReaction.input1, " + ").concat(u.activeReaction.input2, " → ").concat(u.activeReaction.output, "\n\n")), 
m += "Lab Assignments:\n";
try {
for (var p = n(u.labs), d = p.next(); !d.done; d = p.next()) {
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
var v = ht.getLabResourceNeeds(e);
if (v.length > 0) {
m += "\nResource Needs:\n";
try {
for (var R = n(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
m += "  ".concat(T.resourceType, ": ").concat(T.amount, " (priority ").concat(T.priority, ")\n");
}
} catch (e) {
o = {
error: e
};
} finally {
try {
E && !E.done && (a = R.return) && a.call(R);
} finally {
if (o) throw o.error;
}
}
}
var C = ht.getLabOverflow(e);
if (C.length > 0) {
m += "\nOverflow (needs emptying):\n";
try {
for (var S = n(C), w = S.next(); !w.done; w = S.next()) {
var O = w.value;
m += "  ".concat(O.resourceType, ": ").concat(O.amount, " (priority ").concat(O.priority, ")\n");
}
} catch (e) {
i = {
error: e
};
} finally {
try {
w && !w.done && (s = S.return) && s.call(S);
} finally {
if (i) throw i.error;
}
}
}
return m;
}, e.prototype.setReaction = function(e, t, r, o) {
return ht.setActiveReaction(e, t, r, o) ? "Set active reaction: ".concat(t, " + ").concat(r, " → ").concat(o) : "Failed to set reaction (check lab configuration)";
}, e.prototype.clear = function(e) {
return ht.clearReactions(e), "Cleared active reactions in ".concat(e);
}, e.prototype.boost = function(e, t) {
var r, o, a = Game.rooms[e];
if (!a) return "Room ".concat(e, " not visible");
var i = Rt.areBoostLabsReady(a, t), s = Rt.getMissingBoosts(a, t), c = "=== Boost Status: ".concat(e, " / ").concat(t, " ===\n");
if (c += "Ready: ".concat(i, "\n"), s.length > 0) {
c += "\nMissing Boosts:\n";
try {
for (var l = n(s), u = l.next(); !u.done; u = l.next()) {
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
}, o([ Je({
name: "labs.status",
description: "Get lab status for a room",
usage: "labs.status(roomName)",
examples: [ "labs.status('E1S1')" ],
category: "Labs"
}) ], e.prototype, "status", null), o([ Je({
name: "labs.setReaction",
description: "Set active reaction for a room",
usage: "labs.setReaction(roomName, input1, input2, output)",
examples: [ "labs.setReaction('E1S1', RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_HYDROXIDE)" ],
category: "Labs"
}) ], e.prototype, "setReaction", null), o([ Je({
name: "labs.clear",
description: "Clear active reaction for a room",
usage: "labs.clear(roomName)",
examples: [ "labs.clear('E1S1')" ],
category: "Labs"
}) ], e.prototype, "clear", null), o([ Je({
name: "labs.boost",
description: "Check boost lab readiness for a role",
usage: "labs.boost(roomName, role)",
examples: [ "labs.boost('E1S1', 'soldier')" ],
category: "Labs"
}) ], e.prototype, "boost", null), e;
}(), kr = function() {
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
var e, t, r, o, a, i = Object.values(Game.market.orders);
if (0 === i.length) return "No active market orders";
var s = "=== Active Market Orders (".concat(i.length, ") ===\n");
s += "Type | Resource | Price | Remaining | Room\n", s += "-".repeat(70) + "\n";
try {
for (var c = n(i), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.type === ORDER_BUY ? "BUY " : "SELL", p = u.price.toFixed(3), d = null !== (o = null === (r = u.remainingAmount) || void 0 === r ? void 0 : r.toString()) && void 0 !== o ? o : "?";
s += "".concat(m, " | ").concat(u.resourceType, " | ").concat(p, " | ").concat(d, " | ").concat(null !== (a = u.roomName) && void 0 !== a ? a : "N/A", "\n");
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
}, o([ Je({
name: "market.data",
description: "Get market data for a resource",
usage: "market.data(resource)",
examples: [ "market.data(RESOURCE_ENERGY)", "market.data(RESOURCE_GHODIUM)" ],
category: "Market"
}) ], e.prototype, "data", null), o([ Je({
name: "market.orders",
description: "List your active market orders",
usage: "market.orders()",
examples: [ "market.orders()" ],
category: "Market"
}) ], e.prototype, "orders", null), o([ Je({
name: "market.profit",
description: "Show market trading profit statistics",
usage: "market.profit()",
examples: [ "market.profit()" ],
category: "Market"
}) ], e.prototype, "profit", null), e;
}(), Mr = function() {
function e() {}
return e.prototype.gpl = function() {
var e = Or.getGPLState();
if (!e) return "GPL tracking not available (no power unlocked)";
var t = "=== GPL Status ===\n";
t += "Level: ".concat(e.currentLevel, "\n"), t += "Progress: ".concat(e.currentProgress, " / ").concat(e.progressNeeded, "\n"), 
t += "Completion: ".concat((e.currentProgress / e.progressNeeded * 100).toFixed(1), "%\n"), 
t += "Target Milestone: ".concat(e.targetMilestone, "\n");
var r = e.ticksToNextLevel === 1 / 0 ? "N/A (no progress yet)" : "".concat(e.ticksToNextLevel.toLocaleString(), " ticks");
return (t += "Estimated Time: ".concat(r, "\n")) + "\nTotal Power Processed: ".concat(e.totalPowerProcessed.toLocaleString(), "\n");
}, e.prototype.creeps = function() {
var e, t, r = Or.getAssignments();
if (0 === r.length) return "No power creeps created yet";
var o = "=== Power Creeps (".concat(r.length, ") ===\n");
o += "Name | Role | Room | Level | Spawned\n", o += "-".repeat(70) + "\n";
try {
for (var a = n(r), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.spawned ? "✓" : "✗";
o += "".concat(s.name, " | ").concat(s.role, " | ").concat(s.assignedRoom, " | ").concat(s.level, " | ").concat(c, "\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.operations = function() {
var e, t, r = xr.getActiveOperations();
if (0 === r.length) return "No active power bank operations";
var o = "=== Power Bank Operations (".concat(r.length, ") ===\n");
try {
for (var a = n(r), i = a.next(); !i.done; i = a.next()) {
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
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.assign = function(e, t) {
return Or.reassignPowerCreep(e, t) ? "Reassigned ".concat(e, " to ").concat(t) : "Failed to reassign ".concat(e, " (not found)");
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
}, o([ Je({
name: "power.gpl",
description: "Show GPL (Global Power Level) status",
usage: "power.gpl()",
examples: [ "power.gpl()" ],
category: "Power"
}) ], e.prototype, "gpl", null), o([ Je({
name: "power.creeps",
description: "List power creeps and their assignments",
usage: "power.creeps()",
examples: [ "power.creeps()" ],
category: "Power"
}) ], e.prototype, "creeps", null), o([ Je({
name: "power.operations",
description: "List active power bank operations",
usage: "power.operations()",
examples: [ "power.operations()" ],
category: "Power"
}) ], e.prototype, "operations", null), o([ Je({
name: "power.assign",
description: "Reassign a power creep to a different room",
usage: "power.assign(powerCreepName, roomName)",
examples: [ "power.assign('operator_eco', 'E2S2')" ],
category: "Power"
}) ], e.prototype, "assign", null), o([ Je({
name: "power.create",
description: "Manually create a new power creep (automatic creation is also enabled)",
usage: "power.create(name, className)",
examples: [ "power.create('operator_eco', POWER_CLASS.OPERATOR)", "power.create('my_operator', 'operator')" ],
category: "Power"
}) ], e.prototype, "create", null), o([ Je({
name: "power.spawn",
description: "Manually spawn a power creep at a power spawn",
usage: "power.spawn(powerCreepName, roomName?)",
examples: [ "power.spawn('operator_eco')", "power.spawn('operator_eco', 'E2S2')" ],
category: "Power"
}) ], e.prototype, "spawn", null), o([ Je({
name: "power.upgrade",
description: "Manually upgrade a power creep with a specific power",
usage: "power.upgrade(powerCreepName, power)",
examples: [ "power.upgrade('operator_eco', PWR_OPERATE_SPAWN)", "power.upgrade('operator_eco', PWR_OPERATE_TOWER)" ],
category: "Power"
}) ], e.prototype, "upgrade", null), e;
}(), Ar = new Ur, Nr = new kr, Ir = new Mr;

function Pr(e) {
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

function Gr(e) {
for (var t = 0, r = 0; r < e.length; r++) t = (t << 5) - t + e.charCodeAt(r), t &= t;
return Math.abs(t);
}

function Lr(e) {
var t, r = {
v: e.version,
s: Object.entries(e.shards).map(function(e) {
var t, r = a(e, 2), o = r[0], n = r[1];
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
}, o = Gr(JSON.stringify(r));
return JSON.stringify({
d: r,
c: o
});
}

function Dr(e) {
var t, r, o, i, s, c, l;
try {
var u = JSON.parse(e), m = Gr(JSON.stringify(u.d));
if (u.c !== m) return Vt.warn("InterShardMemory checksum mismatch", {
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
for (var R = n(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
h[T.n] = {
name: T.n,
role: null !== (o = d[T.r]) && void 0 !== o ? o : "core",
health: {
cpuCategory: null !== (i = f[T.h.c]) && void 0 !== i ? i : "low",
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
var t, r = a(e.sp.split(","), 2), o = r[0], n = r[1];
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
var C = p.g, S = p.k, w = {
targetPowerLevel: C.pl
};
return C.ws && (w.mainWarShard = C.ws), C.es && (w.primaryEcoShard = C.es), C.ct && (w.colonizationTarget = C.ct), 
C.en && (w.enemies = C.en.map(function(e) {
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
globalTargets: w,
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
return Vt.error("Failed to deserialize InterShardMemory: ".concat(String(e)), {
subsystem: "InterShard"
}), null;
}
}

var Fr, Br, Hr = 102400;

!function(e) {
e[e.LOW = 0] = "LOW", e[e.MEDIUM = 1] = "MEDIUM", e[e.HIGH = 2] = "HIGH", e[e.CRITICAL = 3] = "CRITICAL";
}(Fr || (Fr = {})), function(e) {
e[e.LOW = 0] = "LOW", e[e.NORMAL = 1] = "NORMAL", e[e.MEDIUM = 2] = "MEDIUM", e[e.HIGH = 3] = "HIGH", 
e[e.CRITICAL = 4] = "CRITICAL", e[e.EMERGENCY = 5] = "EMERGENCY";
}(Br || (Br = {}));

var Wr = {
updateInterval: 100,
minBucket: 0,
maxCpuBudget: .02,
defaultCpuLimit: 20
}, Yr = {
core: 1.5,
frontier: .8,
resource: 1,
backup: .5,
war: 1.2
}, Kr = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = r(r({}, Wr), e), this.interShardMemory = {
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
var o = Dr(r);
o && (this.interShardMemory = o, Vt.debug("Loaded InterShardMemory", {
subsystem: "Shard"
}));
}
} catch (e) {
var n = e instanceof Error ? e.message : String(e);
Vt.error("Failed to load InterShardMemory: ".concat(n), {
subsystem: "Shard"
});
}
var a = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0";
this.interShardMemory.shards[a] || (this.interShardMemory.shards[a] = Pr(a));
}, e.prototype.run = function() {
this.lastRun = Game.time, this.updateCurrentShardHealth(), this.processInterShardTasks(), 
this.scanForPortals(), this.autoAssignShardRole(), Object.keys(this.interShardMemory.shards).length > 1 && this.distributeCpuLimits(), 
this.syncInterShardMemory(), Game.time % 500 == 0 && this.logShardStatus();
}, e.prototype.calculateCommodityIndex = function(e) {
var t, r, o, a, i, s = 0, c = 0;
try {
for (var l = n(e), u = l.next(); !u.done; u = l.next()) {
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
for (var y = (o = void 0, n(f)), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = d.store.getUsedCapacity(h);
v > 0 && (s += Math.min(10, v / 1e3));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (a = y.return) && a.call(y);
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
var e, t, r, o, a, i, s, c = null !== (i = null === (a = Game.shard) || void 0 === a ? void 0 : a.name) && void 0 !== i ? i : "shard0", l = this.interShardMemory.shards[c];
if (l) {
var u = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), m = Game.cpu.getUsed() / Game.cpu.limit, p = m < .5 ? "low" : m < .75 ? "medium" : m < .9 ? "high" : "critical", d = u.length > 0 ? u.reduce(function(e, t) {
var r, o;
return e + (null !== (o = null === (r = t.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0);
}, 0) / u.length : 0, f = 0;
try {
for (var y = n(u), g = y.next(); !g.done; g = y.next()) {
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
for (var E = n(u), T = E.next(); !T.done; T = E.next()) {
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
var e, t, r, o, a = null !== (o = null === (r = Game.shard) || void 0 === r ? void 0 : r.name) && void 0 !== o ? o : "shard0", i = this.interShardMemory.tasks.filter(function(e) {
return e.targetShard === a && "pending" === e.status;
});
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
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
Vt.info("Processing colonize task: ".concat(r, " from ").concat(e.sourceShard), {
subsystem: "Shard"
});
}, e.prototype.handleReinforceTask = function(e) {
var t;
e.status = "active";
var r = null !== (t = e.targetRoom) && void 0 !== t ? t : "unknown";
Vt.info("Processing reinforce task: ".concat(r, " from ").concat(e.sourceShard), {
subsystem: "Shard"
});
}, e.prototype.handleTransferTask = function(e) {
e.status = "active", Vt.info("Processing transfer task from ".concat(e.sourceShard), {
subsystem: "Shard"
});
}, e.prototype.handleEvacuateTask = function(e) {
var t;
e.status = "active";
var r = null !== (t = e.targetRoom) && void 0 !== t ? t : "unknown";
Vt.info("Processing evacuate task: ".concat(r, " to ").concat(e.targetShard), {
subsystem: "Shard"
});
}, e.prototype.scanForPortals = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = this.interShardMemory.shards[r];
if (o) {
var a = function(e) {
var t, r, a = Game.rooms[e].find(FIND_STRUCTURES, {
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
Vt.info("Discovered portal in ".concat(e, " to ").concat(n, "/").concat(a), {
subsystem: "Shard"
});
}
}
};
try {
for (var s = (t = void 0, n(a)), c = s.next(); !c.done; c = s.next()) i(c.value);
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
for (var i in Game.rooms) a(i);
o.portals = o.portals.filter(function(e) {
return !e.decayTick || e.decayTick > Game.time;
});
}
}, e.prototype.autoAssignShardRole = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = this.interShardMemory.shards[r];
if (o) {
var n = o.health, a = Object.values(this.interShardMemory.shards), i = o.role;
n.warIndex > 50 ? i = "war" : n.roomCount < 3 && n.avgRCL < 4 ? i = "frontier" : n.economyIndex > 70 && n.roomCount >= 3 && n.avgRCL >= 6 ? i = "resource" : a.length > 1 && n.roomCount < 2 && n.avgRCL < 3 ? i = "backup" : n.roomCount >= 2 && n.avgRCL >= 4 && (i = "core"), 
"frontier" === o.role && n.roomCount >= 3 && n.avgRCL >= 5 && (i = "core", Vt.info("Transitioning from frontier to core shard", {
subsystem: "Shard"
})), "war" === o.role && n.warIndex < 20 && (i = n.economyIndex > 70 && n.roomCount >= 3 ? "resource" : n.roomCount >= 2 ? "core" : "frontier", 
Vt.info("War ended, transitioning to ".concat(i), {
subsystem: "Shard"
})), i !== o.role && (o.role = i, Vt.info("Auto-assigned shard role: ".concat(i), {
subsystem: "Shard"
}));
}
}, e.prototype.calculateCpuEfficiency = function(e) {
var t, r;
if (!e.cpuHistory || 0 === e.cpuHistory.length) return 1;
var o = 0;
try {
for (var a = n(e.cpuHistory), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
s.cpuLimit > 0 && (o += s.cpuUsed / s.cpuLimit);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
return o / e.cpuHistory.length;
}, e.prototype.calculateShardWeight = function(e, t, r) {
var o = Yr[e.role], n = t === r ? Game.cpu.bucket : e.health.bucketLevel;
n < 2e3 ? o *= .8 : n < 5e3 ? o *= .9 : n > 9e3 && (o *= 1.1);
var a = this.calculateCpuEfficiency(e);
return a > .95 ? o *= 1.15 : a < .6 && (o *= .85), "war" === e.role && e.health.warIndex > 50 && (o *= 1.2), 
o;
}, e.prototype.distributeCpuLimits = function() {
var e, t, r, o, a, i;
try {
var s = this.interShardMemory.shards, c = Object.keys(s), l = Game.cpu.shardLimits ? Object.values(Game.cpu.shardLimits).reduce(function(e, t) {
return e + t;
}, 0) : this.config.defaultCpuLimit * c.length, u = null !== (i = null === (a = Game.shard) || void 0 === a ? void 0 : a.name) && void 0 !== i ? i : "shard0", m = {}, p = 0;
try {
for (var d = n(c), f = d.next(); !f.done; f = d.next()) {
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
for (var v = n(c), R = v.next(); !R.done; R = v.next()) {
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
C && Game.cpu.setShardLimits(h) === OK && Vt.info("Updated shard CPU limits: ".concat(JSON.stringify(h)), {
subsystem: "Shard"
});
}
} catch (e) {
var S = e instanceof Error ? e.message : String(e);
Vt.debug("Could not set shard limits: ".concat(S), {
subsystem: "Shard"
});
}
}, e.prototype.syncInterShardMemory = function() {
try {
this.interShardMemory.lastSync = Game.time;
var e = this.validateInterShardMemory();
e.valid || (Vt.warn("InterShardMemory validation failed: ".concat(e.errors.join(", ")), {
subsystem: "Shard"
}), this.repairInterShardMemory());
var t = Lr(this.interShardMemory);
if (t.length > Hr) {
Vt.warn("InterShardMemory size exceeds limit: ".concat(t.length, "/").concat(Hr), {
subsystem: "Shard"
}), this.trimInterShardMemory();
var r = Lr(this.interShardMemory);
return r.length > Hr ? (Vt.error("InterShardMemory still too large after trim: ".concat(r.length, "/").concat(Hr), {
subsystem: "Shard"
}), void this.emergencyTrim()) : void InterShardMemory.setLocal(r);
}
InterShardMemory.setLocal(t), Game.time % 50 == 0 && this.verifySyncIntegrity();
} catch (e) {
var o = e instanceof Error ? e.message : String(e);
Vt.error("Failed to sync InterShardMemory: ".concat(o), {
subsystem: "Shard"
}), this.attemptSyncRecovery();
}
}, e.prototype.validateInterShardMemory = function() {
var e, t, r = [];
if ("number" != typeof this.interShardMemory.version && r.push("Invalid version"), 
"object" != typeof this.interShardMemory.shards) r.push("Invalid shards object"); else try {
for (var o = n(Object.entries(this.interShardMemory.shards)), i = o.next(); !i.done; i = o.next()) {
var s = a(i.value, 2), c = s[0], l = s[1];
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
i && !i.done && (t = o.return) && t.call(o);
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
for (var r = n(Object.entries(this.interShardMemory.shards)), o = r.next(); !o.done; o = r.next()) {
var i = a(o.value, 2), s = i[0], c = i[1];
c.health && "number" == typeof c.health.lastUpdate || (this.interShardMemory.shards[s] = Pr(s)), 
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
Vt.info("Repaired InterShardMemory structure", {
subsystem: "Shard"
});
}, e.prototype.verifySyncIntegrity = function() {
var e, t;
try {
var r = InterShardMemory.getLocal();
if (!r) return void Vt.warn("InterShardMemory verification failed: no data present", {
subsystem: "Shard"
});
var o = Dr(r);
if (!o) return void Vt.warn("InterShardMemory verification failed: deserialization failed", {
subsystem: "Shard"
});
var n = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0";
o.shards[n] || Vt.warn("InterShardMemory verification failed: current shard ".concat(n, " not found"), {
subsystem: "Shard"
});
} catch (e) {
var a = e instanceof Error ? e.message : String(e);
Vt.warn("InterShardMemory verification failed: ".concat(a), {
subsystem: "Shard"
});
}
}, e.prototype.attemptSyncRecovery = function() {
var e, t;
try {
Vt.info("Attempting InterShardMemory recovery", {
subsystem: "Shard"
});
var r = InterShardMemory.getLocal();
if (r) {
var o = Dr(r);
if (o) return this.interShardMemory = o, void Vt.info("Recovered InterShardMemory from storage", {
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
}, this.interShardMemory.shards[n] = Pr(n), Vt.info("Recreated InterShardMemory with current shard only", {
subsystem: "Shard"
});
} catch (e) {
var a = e instanceof Error ? e.message : String(e);
Vt.error("InterShardMemory recovery failed: ".concat(a), {
subsystem: "Shard"
});
}
}, e.prototype.emergencyTrim = function() {
var e, t, r, o = null !== (r = null === (t = Game.shard) || void 0 === t ? void 0 : t.name) && void 0 !== r ? r : "shard0", n = this.interShardMemory.shards[o];
n && (this.interShardMemory.shards = ((e = {})[o] = n, e), this.interShardMemory.tasks = this.interShardMemory.tasks.filter(function(e) {
return e.sourceShard === o || e.targetShard === o;
}), n.portals = n.portals.sort(function(e, t) {
return t.lastScouted - e.lastScouted;
}).slice(0, 10), Vt.warn("Emergency trim applied to InterShardMemory", {
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
Vt.info("Shard ".concat(r, " (").concat(o.role, "): ") + "".concat(n.roomCount, " rooms, RCL ").concat(n.avgRCL, ", ") + "CPU: ".concat(n.cpuCategory, ", Eco: ").concat(n.economyIndex, "%, War: ").concat(n.warIndex, "%"), {
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
r && (s.targetRoom = r), this.interShardMemory.tasks.push(s), Vt.info("Created inter-shard task: ".concat(e, " to ").concat(t), {
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
n && (n.role = e, Vt.info("Set shard role to: ".concat(e), {
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
this.interShardMemory.tasks.push(c), Vt.info("Created resource transfer task: ".concat(o, " ").concat(r, " to ").concat(e, "/").concat(t), {
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
t && (t.status = "failed", t.updatedAt = Game.time, Vt.info("Cancelled task ".concat(e), {
subsystem: "Shard"
}));
}, e.prototype.getSyncStatus = function() {
var e, t, r = Lr(this.interShardMemory).length, o = r / Hr * 100, a = Game.time - this.interShardMemory.lastSync, i = r < 92160 && a < 500, s = 0;
try {
for (var c = n(Object.values(this.interShardMemory.shards)), l = c.next(); !l.done; l = c.next()) s += l.value.portals.length;
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
ticksSinceSync: a,
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
Vt.info("Forcing InterShardMemory sync with validation", {
subsystem: "Shard"
}), this.syncInterShardMemory();
}, e.prototype.getMemoryStats = function() {
var e, t, o = Lr(this.interShardMemory).length, a = Lr(r(r({}, this.interShardMemory), {
tasks: [],
globalTargets: {
targetPowerLevel: 0
}
})).length, i = JSON.stringify(this.interShardMemory.tasks).length, s = 0;
try {
for (var c = n(Object.values(this.interShardMemory.shards)), l = c.next(); !l.done; l = c.next()) {
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
size: o,
limit: Hr,
percent: Math.round(o / Hr * 1e4) / 100,
breakdown: {
shards: a,
tasks: i,
portals: s,
other: o - a - i
}
};
}, o([ (Fr.LOW, function(e, t, r) {}) ], e.prototype, "run", null), o([ function(e) {
return e;
} ], e);
}(), Vr = new Kr, jr = function() {
function e() {
Memory.crossShardTransfers || (Memory.crossShardTransfers = {
requests: {},
lastUpdate: Game.time
}), this.memory = Memory.crossShardTransfers;
}
return e.prototype.run = function() {
var e, t, r, o;
this.cleanupOldRequests();
var a = Vr.getActiveTransferTasks();
try {
for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
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
var t = Vr.getOptimalPortalRoute(e.targetShard);
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
this.memory.requests[e.id] = o, Vt.info("Created transfer request: ".concat(e.resourceAmount, " ").concat(e.resourceType, " from ").concat(r, " to ").concat(e.targetShard, "/").concat(e.targetRoom), {
subsystem: "CrossShardTransfer"
});
} else Vt.warn("No room with sufficient ".concat(e.resourceType, " for transfer"), {
subsystem: "CrossShardTransfer"
});
} else Vt.warn("No portal found to ".concat(e.targetShard, ", cannot create transfer request"), {
subsystem: "CrossShardTransfer"
});
}
}, e.prototype.findSourceRoom = function(e, t) {
var r, o, a = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.terminal && e.storage;
});
try {
for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
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
Vr.updateTaskProgress(e.taskId, t);
}, e.prototype.handleQueuedRequest = function(e) {
var t, r = e.amount - e.transferred, o = e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
}).reduce(function(e, t) {
return e + t.carryCapacity;
}, 0);
if (o >= r) return e.status = "gathering", void Vt.info("Transfer request ".concat(e.taskId, " moving to gathering phase"), {
subsystem: "CrossShardTransfer"
});
var n = Game.rooms[e.sourceRoom];
if (n && (null === (t = n.controller) || void 0 === t ? void 0 : t.my)) {
var a, i = r - o;
n.energyCapacityAvailable;
try {
a = {
parts: [ WORK, CARRY, MOVE ]
};
} catch (e) {
return void Vt.error("Failed to optimize body for crossShardCarrier: ".concat(String(e)), {
subsystem: "CrossShardTransfer"
});
}
var s = 50 * a.parts.filter(function(e) {
return e === CARRY;
}).length, c = Math.ceil(i / s), l = Math.min(c, 3);
e.priority >= 80 ? Br.HIGH : e.priority >= 50 ? Br.NORMAL : Br.LOW;
for (var u = 0; u < l; u++) e.taskId, e.portalRoom, e.targetShard, "crossShardCarrier_".concat(e.taskId, "_").concat(u, "_").concat(Game.time), 
e.sourceRoom, Game.time, e.targetRoom, Vt.info("Requested spawn of crossShardCarrier for transfer ".concat(e.taskId, " (").concat(u + 1, "/").concat(l, ")"), {
subsystem: "CrossShardTransfer"
});
Vt.debug("Transfer request ".concat(e.taskId, " needs ").concat(i, " carry capacity, requested ").concat(l, " carriers"), {
subsystem: "CrossShardTransfer"
});
} else Vt.warn("Source room ".concat(e.sourceRoom, " not available for spawning carriers"), {
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
}) && (e.status = "moving", Vt.info("Transfer request ".concat(e.taskId, " moving to portal"), {
subsystem: "CrossShardTransfer"
})) : e.status = "queued";
}, e.prototype.handleMovingRequest = function(e) {
var t = e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
});
if (0 === t.length) return e.status = "failed", void Vr.updateTaskProgress(e.taskId, e.transferred, "failed");
t.filter(function(t) {
return t.room.name === e.portalRoom;
}).length > 0 && (e.status = "transferring", Vt.info("Transfer request ".concat(e.taskId, " reached portal, transferring"), {
subsystem: "CrossShardTransfer"
}));
}, e.prototype.handleTransferringRequest = function(e) {
0 === e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
}).length && (e.status = "complete", e.transferred = e.amount, Vr.updateTaskProgress(e.taskId, 100, "complete"), 
Vr.recordPortalTraversal(e.portalRoom, e.targetShard, !0), Vt.info("Transfer request ".concat(e.taskId, " completed"), {
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
r && !r.assignedCreeps.includes(t) && (r.assignedCreeps.push(t), Vt.info("Assigned creep ".concat(t, " to transfer request ").concat(e), {
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
}(), zr = new jr, qr = new (function(e) {
function r(t) {
return void 0 === t && (t = {}), e.call(this, t) || this;
}
return t(r, e), r.prototype.run = function() {
e.prototype.run.call(this);
}, o([ gr("empire:shard", "Shard Manager", {
priority: jt.LOW,
interval: 100,
minBucket: 0,
cpuBudget: .02
}) ], r.prototype, "run", null), o([ vr() ], r);
}(Kr)), Xr = function() {
function e() {}
return e.prototype.status = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = qr.getCurrentShardState();
if (!o) return "No shard state found for ".concat(r);
var n = o.health, a = [ "=== Shard Status: ".concat(r, " ==="), "Role: ".concat(o.role.toUpperCase()), "Rooms: ".concat(n.roomCount, " (Avg RCL: ").concat(n.avgRCL, ")"), "Creeps: ".concat(n.creepCount), "CPU: ".concat(n.cpuCategory.toUpperCase(), " (").concat(Math.round(100 * n.cpuUsage), "%)"), "Bucket: ".concat(n.bucketLevel), "Economy Index: ".concat(n.economyIndex, "%"), "War Index: ".concat(n.warIndex, "%"), "Portals: ".concat(o.portals.length), "Active Tasks: ".concat(o.activeTasks.length), "Last Update: ".concat(n.lastUpdate) ];
return o.cpuLimit && a.push("CPU Limit: ".concat(o.cpuLimit)), a.join("\n");
}, e.prototype.all = function() {
var e, t, r = qr.getAllShards();
if (0 === r.length) return "No shards tracked yet";
var o = [ "=== All Shards ===" ];
try {
for (var a = n(r), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.health;
o.push("".concat(s.name, " [").concat(s.role, "]: ").concat(c.roomCount, " rooms, RCL ").concat(c.avgRCL, ", ") + "CPU ".concat(c.cpuCategory, " (").concat(Math.round(100 * c.cpuUsage), "%), ") + "Eco ".concat(c.economyIndex, "%, War ").concat(c.warIndex, "%"));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o.join("\n");
}, e.prototype.setRole = function(e) {
var t = [ "core", "frontier", "resource", "backup", "war" ];
return t.includes(e) ? (qr.setShardRole(e), "Shard role set to: ".concat(e.toUpperCase())) : "Invalid role: ".concat(e, ". Valid roles: ").concat(t.join(", "));
}, e.prototype.portals = function(e) {
var t, r, o, a, i, s = null !== (a = null === (o = Game.shard) || void 0 === o ? void 0 : o.name) && void 0 !== a ? a : "shard0", c = qr.getCurrentShardState();
if (!c) return "No shard state found for ".concat(s);
var l = c.portals;
if (e && (l = l.filter(function(t) {
return t.targetShard === e;
})), 0 === l.length) return e ? "No portals to ".concat(e) : "No portals discovered yet";
var u = [ e ? "=== Portals to ".concat(e, " ===") : "=== All Portals ===" ];
try {
for (var m = n(l), p = m.next(); !p.done; p = m.next()) {
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
var r, o = qr.getOptimalPortalRoute(e, t);
if (!o) return "No portal found to ".concat(e);
var n = o.isStable ? "Stable" : "Unstable", a = o.threatRating > 0 ? " (Threat: ".concat(o.threatRating, ")") : "";
return "Best portal to ".concat(e, ":\n") + "  Source: ".concat(o.sourceRoom, " (").concat(o.sourcePos.x, ",").concat(o.sourcePos.y, ")\n") + "  Target: ".concat(o.targetShard, "/").concat(o.targetRoom, "\n") + "  Status: ".concat(n).concat(a, "\n") + "  Traversals: ".concat(null !== (r = o.traversalCount) && void 0 !== r ? r : 0, "\n") + "  Last Scouted: ".concat(Game.time - o.lastScouted, " ticks ago");
}, e.prototype.createTask = function(e, t, r, o) {
void 0 === o && (o = 50);
var n = [ "colonize", "reinforce", "transfer", "evacuate" ];
return n.includes(e) ? (qr.createTask(e, t, r, o), "Created ".concat(e, " task to ").concat(t).concat(r ? "/".concat(r) : "", " (priority: ").concat(o, ")")) : "Invalid task type: ".concat(e, ". Valid types: ").concat(n.join(", "));
}, e.prototype.transferResource = function(e, t, r, o, n) {
return void 0 === n && (n = 50), qr.createResourceTransferTask(e, t, r, o, n), "Created resource transfer task:\n" + "  ".concat(o, " ").concat(r, " → ").concat(e, "/").concat(t, "\n") + "  Priority: ".concat(n);
}, e.prototype.transfers = function() {
var e, t, r = zr.getActiveRequests();
if (0 === r.length) return "No active resource transfers";
var o = [ "=== Active Resource Transfers ===" ];
try {
for (var a = n(r), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Math.round(s.transferred / s.amount * 100), l = s.assignedCreeps.length;
o.push("".concat(s.taskId, ": ").concat(s.amount, " ").concat(s.resourceType, "\n") + "  ".concat(s.sourceRoom, " → ").concat(s.targetShard, "/").concat(s.targetRoom, "\n") + "  Status: ".concat(s.status.toUpperCase(), " (").concat(c, "%)\n") + "  Creeps: ".concat(l, ", Priority: ").concat(s.priority));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o.join("\n");
}, e.prototype.cpuHistory = function() {
var e, t, r = qr.getCurrentShardState();
if (!r || !r.cpuHistory || 0 === r.cpuHistory.length) return "No CPU history available";
var o = [ "=== CPU Allocation History ===" ];
try {
for (var a = n(r.cpuHistory.slice(-10)), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Math.round(s.cpuUsed / s.cpuLimit * 100);
o.push("Tick ".concat(s.tick, ": ").concat(s.cpuUsed.toFixed(2), "/").concat(s.cpuLimit, " (").concat(c, "%) ") + "Bucket: ".concat(s.bucketLevel));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o.join("\n");
}, e.prototype.tasks = function() {
var e, t, r, o = qr.getActiveTransferTasks();
if (0 === o.length) return "No active inter-shard tasks";
var a = [ "=== Inter-Shard Tasks ===" ];
try {
for (var i = n(o), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = null !== (r = c.progress) && void 0 !== r ? r : 0;
a.push("".concat(c.id, " [").concat(c.type.toUpperCase(), "]\n") + "  ".concat(c.sourceShard, " → ").concat(c.targetShard).concat(c.targetRoom ? "/".concat(c.targetRoom) : "", "\n") + "  Status: ".concat(c.status.toUpperCase(), " (").concat(l, "%)\n") + "  Priority: ".concat(c.priority));
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
return a.join("\n");
}, e.prototype.syncStatus = function() {
var e = qr.getSyncStatus(), t = e.isHealthy ? "✓ HEALTHY" : "⚠ DEGRADED";
return "=== InterShardMemory Sync Status ===\n" + "Status: ".concat(t, "\n") + "Last Sync: ".concat(e.lastSync, " (").concat(e.ticksSinceSync, " ticks ago)\n") + "Memory Usage: ".concat(e.memorySize, " / ").concat(Hr, " bytes (").concat(e.sizePercent, "%)\n") + "Shards Tracked: ".concat(e.shardsTracked, "\n") + "Active Tasks: ".concat(e.activeTasks, "\n") + "Total Portals: ".concat(e.totalPortals);
}, e.prototype.memoryStats = function() {
var e = qr.getMemoryStats();
return "=== InterShardMemory Usage ===\n" + "Total: ".concat(e.size, " / ").concat(e.limit, " bytes (").concat(e.percent, "%)\n") + "\nBreakdown:\n" + "  Shards: ".concat(e.breakdown.shards, " bytes\n") + "  Tasks: ".concat(e.breakdown.tasks, " bytes\n") + "  Portals: ".concat(e.breakdown.portals, " bytes\n") + "  Other: ".concat(e.breakdown.other, " bytes");
}, e.prototype.forceSync = function() {
return qr.forceSync(), "InterShardMemory sync forced. Check logs for results.";
}, o([ Je({
name: "shard.status",
description: "Display current shard status and metrics",
usage: "shard.status()",
examples: [ "shard.status()" ],
category: "Shard"
}) ], e.prototype, "status", null), o([ Je({
name: "shard.all",
description: "List all known shards with summary info",
usage: "shard.all()",
examples: [ "shard.all()" ],
category: "Shard"
}) ], e.prototype, "all", null), o([ Je({
name: "shard.setRole",
description: "Manually set the role for the current shard",
usage: "shard.setRole(role)",
examples: [ "shard.setRole('core')", "shard.setRole('frontier')", "shard.setRole('resource')", "shard.setRole('backup')", "shard.setRole('war')" ],
category: "Shard"
}) ], e.prototype, "setRole", null), o([ Je({
name: "shard.portals",
description: "List all known portals from the current shard",
usage: "shard.portals(targetShard?)",
examples: [ "shard.portals()", "shard.portals('shard1')" ],
category: "Shard"
}) ], e.prototype, "portals", null), o([ Je({
name: "shard.bestPortal",
description: "Find the optimal portal route to a target shard",
usage: "shard.bestPortal(targetShard, fromRoom?)",
examples: [ "shard.bestPortal('shard1')", "shard.bestPortal('shard2', 'E1N1')" ],
category: "Shard"
}) ], e.prototype, "bestPortal", null), o([ Je({
name: "shard.createTask",
description: "Create a cross-shard task",
usage: "shard.createTask(type, targetShard, targetRoom?, priority?)",
examples: [ "shard.createTask('colonize', 'shard1', 'E5N5', 80)", "shard.createTask('reinforce', 'shard2', 'W1N1', 90)", "shard.createTask('evacuate', 'shard0', 'E1N1', 100)" ],
category: "Shard"
}) ], e.prototype, "createTask", null), o([ Je({
name: "shard.transferResource",
description: "Create a cross-shard resource transfer task",
usage: "shard.transferResource(targetShard, targetRoom, resourceType, amount, priority?)",
examples: [ "shard.transferResource('shard1', 'E5N5', 'energy', 50000, 70)", "shard.transferResource('shard2', 'W1N1', 'U', 5000, 80)" ],
category: "Shard"
}) ], e.prototype, "transferResource", null), o([ Je({
name: "shard.transfers",
description: "List active cross-shard resource transfers",
usage: "shard.transfers()",
examples: [ "shard.transfers()" ],
category: "Shard"
}) ], e.prototype, "transfers", null), o([ Je({
name: "shard.cpuHistory",
description: "Display CPU allocation history for the current shard",
usage: "shard.cpuHistory()",
examples: [ "shard.cpuHistory()" ],
category: "Shard"
}) ], e.prototype, "cpuHistory", null), o([ Je({
name: "shard.tasks",
description: "List all inter-shard tasks",
usage: "shard.tasks()",
examples: [ "shard.tasks()" ],
category: "Shard"
}) ], e.prototype, "tasks", null), o([ Je({
name: "shard.syncStatus",
description: "Display InterShardMemory sync status and health",
usage: "shard.syncStatus()",
examples: [ "shard.syncStatus()" ],
category: "Shard"
}) ], e.prototype, "syncStatus", null), o([ Je({
name: "shard.memoryStats",
description: "Display InterShardMemory size breakdown",
usage: "shard.memoryStats()",
examples: [ "shard.memoryStats()" ],
category: "Shard"
}) ], e.prototype, "memoryStats", null), o([ Je({
name: "shard.forceSync",
description: "Force a full InterShardMemory sync with validation",
usage: "shard.forceSync()",
examples: [ "shard.forceSync()" ],
category: "Shard"
}) ], e.prototype, "forceSync", null), e;
}(), Qr = new Xr, Zr = {
maxPredictionTicks: 100,
safetyMargin: .9,
enableLogging: !1
}, Jr = function() {
function e(e) {
void 0 === e && (e = {}), this.config = r(r({}, Zr), e);
}
return e.prototype.predictEnergyInTicks = function(e, t) {
if (t < 0) throw new Error("Cannot predict negative ticks");
t > this.config.maxPredictionTicks && (ye.warn("Prediction horizon ".concat(t, " exceeds max ").concat(this.config.maxPredictionTicks, ", clamping"), {
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
return this.config.enableLogging && ye.debug("Energy prediction for ".concat(e.name, ": ").concat(n, " → ").concat(i, " (").concat(t, " ticks, ").concat(a.toFixed(2), "/tick)"), {
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
}), a = 0;
try {
for (var i = n(o), s = i.next(); !s.done; s = i.next()) a += s.value.body.filter(function(e) {
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
return 2 * a * .5;
}, e.prototype.calculateMinerIncome = function(e) {
var t, r, o = e.find(FIND_MY_CREEPS, {
filter: function(e) {
return "staticMiner" === e.memory.role || "miner" === e.memory.role;
}
}), a = 0;
try {
for (var i = n(o), s = i.next(); !s.done; s = i.next()) a += s.value.body.filter(function(e) {
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
return 2 * a * .9;
}, e.prototype.calculateLinkIncome = function(e) {
return 0;
}, e.prototype.calculateUpgraderConsumption = function(e) {
var t, r, o = e.find(FIND_MY_CREEPS, {
filter: function(e) {
return "upgrader" === e.memory.role;
}
}), a = 0;
try {
for (var i = n(o), s = i.next(); !s.done; s = i.next()) a += s.value.body.filter(function(e) {
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
return 1 * a * .7;
}, e.prototype.calculateBuilderConsumption = function(e) {
var t, r, o = e.find(FIND_MY_CREEPS, {
filter: function(e) {
return "builder" === e.memory.role || "repairer" === e.memory.role;
}
});
if (0 === e.find(FIND_MY_CONSTRUCTION_SITES).length) return .1;
var a = 0;
try {
for (var i = n(o), s = i.next(); !s.done; s = i.next()) a += s.value.body.filter(function(e) {
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
return 5 * a * .5;
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
this.config = r(r({}, this.config), e);
}, e.prototype.getConfig = function() {
return r({}, this.config);
}, e;
}(), $r = new Jr, eo = new (function() {
function e() {}
return e.prototype.predictEnergy = function(e, t) {
void 0 === t && (t = 50);
var r = Game.rooms[e];
if (!r) return "Room ".concat(e, " is not visible");
if (!r.controller || !r.controller.my) return "Room ".concat(e, " is not owned by you");
var o = $r.predictEnergyInTicks(r, t), n = "=== Energy Prediction: ".concat(e, " ===\n");
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
var r = $r.calculateEnergyIncome(t), o = "=== Energy Income: ".concat(e, " ===\n");
return o += "Harvesters: ".concat(r.harvesters.toFixed(2), " energy/tick\n"), o += "Static Miners: ".concat(r.miners.toFixed(2), " energy/tick\n"), 
(o += "Links: ".concat(r.links.toFixed(2), " energy/tick\n")) + "Total: ".concat(r.total.toFixed(2), " energy/tick\n");
}, e.prototype.showConsumption = function(e) {
var t = Game.rooms[e];
if (!t) return "Room ".concat(e, " is not visible");
var r = $r.calculateEnergyConsumption(t), o = "=== Energy Consumption: ".concat(e, " ===\n");
return o += "Upgraders: ".concat(r.upgraders.toFixed(2), " energy/tick\n"), o += "Builders: ".concat(r.builders.toFixed(2), " energy/tick\n"), 
o += "Towers: ".concat(r.towers.toFixed(2), " energy/tick\n"), o += "Spawning: ".concat(r.spawning.toFixed(2), " energy/tick\n"), 
(o += "Repairs: ".concat(r.repairs.toFixed(2), " energy/tick\n")) + "Total: ".concat(r.total.toFixed(2), " energy/tick\n");
}, e.prototype.canAfford = function(e, t, r) {
void 0 === r && (r = 50);
var o = Game.rooms[e];
if (!o) return "Room ".concat(e, " is not visible");
var n = $r.canAffordInTicks(o, t, r), a = $r.predictEnergyInTicks(o, r);
if (n) return "✓ Room ".concat(e, " CAN afford ").concat(t, " energy within ").concat(r, " ticks (predicted: ").concat(Math.round(a.predicted), ")");
var i = $r.getRecommendedSpawnDelay(o, t);
return i >= 999 ? "✗ Room ".concat(e, " CANNOT afford ").concat(t, " energy (negative energy flow)") : "✗ Room ".concat(e, " CANNOT afford ").concat(t, " energy within ").concat(r, " ticks (would need ").concat(i, " ticks)");
}, e.prototype.getSpawnDelay = function(e, t) {
var r = Game.rooms[e];
if (!r) return "Room ".concat(e, " is not visible");
var o = $r.getRecommendedSpawnDelay(r, t), n = r.energyAvailable;
if (0 === o) return "✓ Room ".concat(e, " can spawn ").concat(t, " energy body NOW (current: ").concat(n, ")");
if (o >= 999) return "✗ Room ".concat(e, " has negative energy flow, cannot spawn ").concat(t, " energy body");
var a = $r.predictEnergyInTicks(r, o);
return "Room ".concat(e, " needs to wait ").concat(o, " ticks to spawn ").concat(t, " energy body (current: ").concat(n, ", predicted: ").concat(Math.round(a.predicted), ")");
}, o([ Je({
name: "economy.energy.predict",
description: "Predict energy availability for a room in N ticks",
usage: "economy.energy.predict(roomName, ticks)",
examples: [ "economy.energy.predict('W1N1', 50)", "economy.energy.predict('E1S1', 100)" ],
category: "Economy"
}) ], e.prototype, "predictEnergy", null), o([ Je({
name: "economy.energy.income",
description: "Show energy income breakdown for a room",
usage: "economy.energy.income(roomName)",
examples: [ "economy.energy.income('W1N1')" ],
category: "Economy"
}) ], e.prototype, "showIncome", null), o([ Je({
name: "economy.energy.consumption",
description: "Show energy consumption breakdown for a room",
usage: "economy.energy.consumption(roomName)",
examples: [ "economy.energy.consumption('W1N1')" ],
category: "Economy"
}) ], e.prototype, "showConsumption", null), o([ Je({
name: "economy.energy.canAfford",
description: "Check if a room can afford a certain energy cost within N ticks",
usage: "economy.energy.canAfford(roomName, cost, ticks)",
examples: [ "economy.energy.canAfford('W1N1', 1000, 50)", "economy.energy.canAfford('E1S1', 500, 25)" ],
category: "Economy"
}) ], e.prototype, "canAfford", null), o([ Je({
name: "economy.energy.spawnDelay",
description: "Get recommended spawn delay for a body cost",
usage: "economy.energy.spawnDelay(roomName, cost)",
examples: [ "economy.energy.spawnDelay('W1N1', 1000)", "economy.energy.spawnDelay('E1S1', 500)" ],
category: "Economy"
}) ], e.prototype, "getSpawnDelay", null), e;
}());

function to(e) {
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

function ro(e) {
var t, r, o = Yt.getEmpire(), a = 0, i = so(e);
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = o.knownRooms[l];
u && (u.owner && !lo(u.owner) && (a += 30), u.threatLevel >= 2 && (a += 10 * u.threatLevel), 
u.towerCount && u.towerCount > 0 && (a += 5 * u.towerCount));
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
return a;
}

function oo(e) {
return "plains" === e ? 15 : "swamp" === e ? -10 : 0;
}

function no(e) {
var t, r, o = so(e);
try {
for (var a = n(o), i = a.next(); !i.done; i = a.next()) {
var s = co(i.value);
if (s && (s.x % 10 == 0 || s.y % 10 == 0)) return !0;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
return !1;
}

function ao(e) {
var t, r, o = Yt.getEmpire(), a = so(e);
try {
for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = o.knownRooms[c];
if (l && l.hasPortal) return 10;
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
return 0;
}

function io(e, t, r) {
return 0 === t.length ? 0 : r <= 2 ? 25 : r <= 3 ? 15 : r <= 5 ? 5 : 0;
}

function so(e) {
var t = co(e);
if (!t) return [];
for (var r = t.x, o = t.y, n = t.xDir, a = t.yDir, i = [], s = -1; s <= 1; s++) for (var c = -1; c <= 1; c++) if (0 !== s || 0 !== c) {
var l = r + s, u = o + c, m = n, p = a, d = l, f = u;
l < 0 && (m = "E" === n ? "W" : "E", d = Math.abs(l) - 1), u < 0 && (p = "N" === a ? "S" : "N", 
f = Math.abs(u) - 1), i.push("".concat(m).concat(d).concat(p).concat(f));
}
return i;
}

function co(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
return t ? {
xDir: t[1],
x: parseInt(t[2], 10),
yDir: t[3],
y: parseInt(t[4], 10)
} : null;
}

function lo(e) {
return !1;
}

function uo(e, t) {
var r = [], o = co(e);
if (!o) return [];
for (var n = o.x, a = o.y, i = o.xDir, s = o.yDir, c = -t; c <= t; c++) for (var l = -t; l <= t; l++) if (0 !== c || 0 !== l) {
var u = n + c, m = a + l, p = i, d = s, f = u, y = m;
u < 0 && (p = "E" === i ? "W" : "E", f = Math.abs(u) - 1), m < 0 && (d = "N" === s ? "S" : "N", 
y = Math.abs(m) - 1), r.push("".concat(p).concat(f).concat(d).concat(y));
}
return r;
}

function mo(e, t, r, o) {
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

var po = {
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
}, fo = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.cachedUsername = "", this.usernameLastTick = 0, 
this.config = r(r({}, po), e);
}
return e.prototype.run = function() {
var e = Yt.getEmpire();
this.lastRun = Game.time, this.monitorExpansionProgress(e), this.updateRemoteAssignments(e), 
this.isExpansionReady(e) && this.assignClaimerTargets(e), this.assignReserverTargets();
}, e.prototype.updateRemoteAssignments = function(e) {
var t, r, o, a, i, s, c, l = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var u = n(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = Yt.getSwarmState(p.name);
if (d && !((null !== (s = null === (i = p.controller) || void 0 === i ? void 0 : i.level) && void 0 !== s ? s : 0) < this.config.minRclForRemotes)) {
var f = null !== (c = d.remoteAssignments) && void 0 !== c ? c : [], y = this.validateRemoteAssignments(f, e, p.name), g = this.calculateRemoteCapacity(p, d);
if (y.length < g) {
var h = this.findRemoteCandidates(p.name, e, y), v = g - y.length, R = h.slice(0, v);
try {
for (var E = (o = void 0, n(R)), T = E.next(); !T.done; T = E.next()) {
var C = T.value;
y.includes(C) || (y.push(C), ye.info("Assigned remote room ".concat(C, " to ").concat(p.name), {
subsystem: "Expansion"
}));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
T && !T.done && (a = E.return) && a.call(E);
} finally {
if (o) throw o.error;
}
}
}
JSON.stringify(y) !== JSON.stringify(d.remoteAssignments) && (d.remoteAssignments = y);
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
}, e.prototype.calculateRemoteCapacity = function(e, t) {
var r, o, n = null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0;
if (t.danger >= 2) return Math.min(1, this.config.maxRemotesPerRoom);
var a = e.storage;
return a && a.store.getUsedCapacity(RESOURCE_ENERGY) < 1e4 || n < 4 ? Math.min(1, this.config.maxRemotesPerRoom) : 4 === n ? Math.min(2, this.config.maxRemotesPerRoom) : n < 7 ? Math.min(3, this.config.maxRemotesPerRoom) : this.config.maxRemotesPerRoom;
}, e.prototype.validateRemoteAssignments = function(e, t, r) {
var o = this;
return e.filter(function(e) {
var n = t.knownRooms[e];
if (!n) return !0;
var a = null;
n.owner && (ye.info("Removing remote ".concat(e, " - now owned by ").concat(n.owner), {
subsystem: "Expansion"
}), a = "claimed");
var i = o.getMyUsername();
if (!a && n.reserver && n.reserver !== i && (ye.info("Removing remote ".concat(e, " - reserved by ").concat(n.reserver), {
subsystem: "Expansion"
}), a = "hostile"), !a && n.threatLevel >= 3 && (ye.info("Removing remote ".concat(e, " - threat level ").concat(n.threatLevel), {
subsystem: "Expansion"
}), a = "hostile"), !a) {
var s = Game.map.getRoomLinearDistance(r, e);
s > o.config.maxRemoteDistance && (ye.info("Removing remote ".concat(e, " - too far (").concat(s, ")"), {
subsystem: "Expansion"
}), a = "unreachable");
}
return !a || (mr.emit("remote.lost", {
homeRoom: r,
remoteRoom: e,
reason: a,
source: r
}), !1);
});
}, e.prototype.findRemoteCandidates = function(e, t, r) {
var o = [], n = this.getMyUsername();
for (var a in t.knownRooms) if (!r.includes(a) && !this.isRemoteAssignedElsewhere(a, e)) {
var i = t.knownRooms[a];
if (i.scouted && !i.owner && !(i.reserver && i.reserver !== n || i.isHighway || i.isSK || i.sources < this.config.minRemoteSources || i.threatLevel >= 2)) {
var s = Game.map.getRoomLinearDistance(e, a);
if (!(s < 1 || s > this.config.maxRemoteDistance)) {
var c = mo(a, e, i);
if (c.isProfitable) {
var l = this.scoreRemoteCandidate(i, s);
o.push({
roomName: a,
score: l
});
} else Game.time % 1e3 == 0 && ye.debug("Skipping remote ".concat(a, " - not profitable (ROI: ").concat(c.roi.toFixed(2), ")"), {
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
}, e.prototype.scoreRemoteCandidate = function(e, t) {
var r = 0;
return r += 50 * e.sources, r -= 20 * t, r -= 30 * e.threatLevel, "plains" === e.terrain ? r += 10 : "swamp" === e.terrain && (r -= 10), 
r;
}, e.prototype.scoreClaimCandidate = function(e, t, r) {
var o = 0;
return 2 === e.sources ? o += 40 : 1 === e.sources && (o += 20), o += to(e.mineralType), 
o -= 5 * t, o -= ro(e.name), o -= 15 * e.threatLevel, o += oo(e.terrain), no(e.name) && (o += 10), 
o += ao(e.name), e.controllerLevel > 0 && !e.owner && (o += 2 * e.controllerLevel), 
o + io(e.name, r, t);
}, e.prototype.isRemoteAssignedElsewhere = function(e, t) {
var r, o, a, i = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (l.name !== t) {
var u = Yt.getSwarmState(l.name);
if (null === (a = null == u ? void 0 : u.remoteAssignments) || void 0 === a ? void 0 : a.includes(e)) return !0;
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
return !1;
}, e.prototype.assignClaimerTargets = function(e) {
var t, r, o = this.getNextExpansionTarget(e);
if (o) {
var a = Object.values(Game.creeps).some(function(e) {
var t = e.memory;
return "claimer" === t.role && t.targetRoom === o.roomName && "claim" === t.task;
});
if (!a) {
var i = !1;
try {
for (var s = n(Object.values(Game.creeps)), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = l.memory;
if ("claimer" === u.role && !u.targetRoom) {
u.targetRoom = o.roomName, u.task = "claim", ye.info("Assigned claim target ".concat(o.roomName, " to ").concat(l.name), {
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
}, e.prototype.requestClaimerSpawn = function(e, t) {
var r, o, a = this, i = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), s = i.filter(function(e) {
var t, r;
return (null !== (r = null === (t = e.controller) || void 0 === t ? void 0 : t.level) && void 0 !== r ? r : 0) >= a.config.minRclForClaiming;
});
if (0 !== s.length) {
var c = null, l = 999;
try {
for (var u = n(s), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = Game.map.getRoomLinearDistance(p.name, e);
d < l && (l = d, c = p);
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
if (c) {
var f = Yt.getSwarmState(c.name);
f && "defensive" !== f.posture && "evacuate" !== f.posture && f.danger < 2 && "expand" !== f.posture && (f.posture = "expand", 
ye.info("Set ".concat(c.name, " to expand posture for claiming ").concat(e, " (distance: ").concat(l, ")"), {
subsystem: "Expansion"
}));
}
}
}, e.prototype.assignReserverTargets = function() {
var e, t, r, o, a;
try {
for (var i = n(Object.values(Game.creeps)), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = c.memory;
if ("claimer" === l.role && !l.targetRoom) {
var u = l.homeRoom;
if (u) {
var m = Yt.getSwarmState(u);
if (null === (a = null == m ? void 0 : m.remoteAssignments) || void 0 === a ? void 0 : a.length) try {
for (var p = (r = void 0, n(m.remoteAssignments)), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
if (!this.hasReserverAssigned(f)) {
l.targetRoom = f, l.task = "reserve", ye.info("Assigned reserve target ".concat(f, " to ").concat(c.name), {
subsystem: "Expansion"
});
break;
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
}
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
}, e.prototype.hasReserverAssigned = function(e) {
var t, r;
try {
for (var o = n(Object.values(Game.creeps)), a = o.next(); !a.done; a = o.next()) {
var i = a.value.memory;
if ("claimer" === i.role && i.targetRoom === e && "reserve" === i.task) return !0;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
return !1;
}, e.prototype.isExpansionReady = function(e) {
var t = this;
if (e.objectives.expansionPaused) return !1;
var r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (r.length >= Game.gcl.level) return !1;
var o = Game.gcl.progress / Game.gcl.progressTotal;
if (o < this.config.minGclProgressForClaim) return Game.time % 500 == 0 && ye.info("Waiting for GCL progress: ".concat((100 * o).toFixed(1), "% (need ").concat((100 * this.config.minGclProgressForClaim).toFixed(0), "%)"), {
subsystem: "Expansion"
}), !1;
var n = r.filter(function(e) {
var r, o;
return (null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0) >= t.config.minRclForClaiming;
}), a = n.length / r.length;
return !(a < this.config.minStableRoomPercentage && (Game.time % 500 == 0 && ye.info("Waiting for room stability: ".concat(n.length, "/").concat(r.length, " rooms stable (").concat((100 * a).toFixed(0), "%, need ").concat((100 * this.config.minStableRoomPercentage).toFixed(0), "%)"), {
subsystem: "Expansion"
}), 1));
}, e.prototype.getNextExpansionTarget = function(e) {
var t = this, o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (o.length >= Game.gcl.level) return null;
var n = e.claimQueue.filter(function(e) {
return !e.claimed;
});
if (0 === n.length) return null;
var a = n.map(function(e) {
var n = t.getMinDistanceToOwned(e.roomName, o), a = n <= t.config.clusterExpansionDistance ? 100 : 0;
return r(r({}, e), {
clusterScore: e.score + a,
distanceToCluster: n
});
});
if (a.sort(function(e, t) {
return t.clusterScore - e.clusterScore;
}), Game.time % 100 == 0 && a.length > 0) {
var i = a[0];
ye.info("Next expansion target: ".concat(i.roomName, " (score: ").concat(i.score, ", cluster bonus: ").concat(i.clusterScore - i.score, ", distance: ").concat(i.distanceToCluster, ")"), {
subsystem: "Expansion"
});
}
return a[0];
}, e.prototype.getMinDistanceToOwned = function(e, t) {
var r, o;
if (0 === t.length) return 999;
var a = 999;
try {
for (var i = n(t), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(e, c.name);
l < a && (a = l);
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
return a;
}, e.prototype.getMyUsername = function() {
if (this.usernameLastTick !== Game.time || !this.cachedUsername) {
var e = Object.values(Game.spawns);
e.length > 0 && (this.cachedUsername = e[0].owner.username), this.usernameLastTick = Game.time;
}
return this.cachedUsername;
}, e.prototype.performSafetyAnalysis = function(e, t) {
var r, o, a = [], i = uo(e, 2);
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = t.knownRooms[l];
u && (u.owner && !lo(u.owner) && a.push("Hostile player ".concat(u.owner, " in ").concat(l)), 
u.towerCount && u.towerCount > 0 && a.push("".concat(u.towerCount, " towers in ").concat(l)), 
u.spawnCount && u.spawnCount > 0 && a.push("".concat(u.spawnCount, " spawns in ").concat(l)), 
u.threatLevel >= 2 && a.push("Threat level ".concat(u.threatLevel, " in ").concat(l)));
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
return function(e) {
var t, r, o = Yt.getEmpire(), a = so(e), i = new Set;
try {
for (var s = n(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = o.knownRooms[l];
(null == u ? void 0 : u.owner) && !lo(u.owner) && i.add(u.owner);
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
return i.size >= 2;
}(e) && a.push("Room is in potential war zone between hostile players"), {
isSafe: 0 === a.length,
threatDescription: a.length > 0 ? a.join("; ") : "No threats detected"
};
}, e.prototype.monitorExpansionProgress = function(e) {
var t, r, o, a = Game.time, i = function(t) {
if (!t.claimed) return "continue";
var r = a - t.lastEvaluated;
if (r > 5e3) {
var n = Game.rooms[t.roomName];
return (null === (o = null == n ? void 0 : n.controller) || void 0 === o ? void 0 : o.my) ? (ye.info("Expansion to ".concat(t.roomName, " completed successfully"), {
subsystem: "Expansion"
}), s.removeFromClaimQueue(e, t.roomName), "continue") : (ye.warn("Expansion to ".concat(t.roomName, " timed out after ").concat(r, " ticks"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "timeout"), "continue");
}
if (!Object.values(Game.creeps).some(function(e) {
var r = e.memory;
return "claimer" === r.role && r.targetRoom === t.roomName && "claim" === r.task;
}) && r > 1e3) return ye.warn("No active claimer for ".concat(t.roomName, " expansion"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "claimer_died"), "continue";
var i = e.knownRooms[t.roomName];
if ((null == i ? void 0 : i.owner) && i.owner !== s.getMyUsername()) return ye.warn("".concat(t.roomName, " claimed by ").concat(i.owner, " before we could claim it"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "hostile_claim"), "continue";
var c = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), l = c.reduce(function(e, t) {
var r, o;
return e + (null !== (o = null === (r = t.storage) || void 0 === r ? void 0 : r.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== o ? o : 0);
}, 0), u = c.length > 0 ? l / c.length : 0;
return u < 2e4 ? (ye.warn("Cancelling expansion to ".concat(t.roomName, " due to low energy (avg: ").concat(u, ")"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "low_energy"), "continue") : void 0;
}, s = this;
try {
for (var c = n(e.claimQueue), l = c.next(); !l.done; l = c.next()) i(l.value);
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
}, e.prototype.cancelExpansion = function(e, t, r) {
var o, a;
this.removeFromClaimQueue(e, t);
try {
for (var i = n(Object.values(Game.creeps)), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = c.memory;
"claimer" === l.role && l.targetRoom === t && "claim" === l.task && (l.targetRoom = void 0, 
l.task = void 0, ye.info("Cleared target for ".concat(c.name, " due to expansion cancellation"), {
subsystem: "Expansion"
}));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
s && !s.done && (a = i.return) && a.call(i);
} finally {
if (o) throw o.error;
}
}
ye.info("Cancelled expansion to ".concat(t, ", reason: ").concat(r), {
subsystem: "Expansion"
});
}, e.prototype.removeFromClaimQueue = function(e, t) {
var r = e.claimQueue.findIndex(function(e) {
return e.roomName === t;
});
-1 !== r && e.claimQueue.splice(r, 1);
}, e.prototype.addRemoteRoom = function(e, t) {
var r = Yt.getSwarmState(e);
return r ? (r.remoteAssignments || (r.remoteAssignments = []), r.remoteAssignments.includes(t) ? (ye.warn("Remote ".concat(t, " already assigned to ").concat(e), {
subsystem: "Expansion"
}), !1) : (r.remoteAssignments.push(t), ye.info("Manually added remote ".concat(t, " to ").concat(e), {
subsystem: "Expansion"
}), !0)) : (ye.error("Cannot add remote: ".concat(e, " not found"), {
subsystem: "Expansion"
}), !1);
}, e.prototype.removeRemoteRoom = function(e, t) {
var r = Yt.getSwarmState(e);
if (!(null == r ? void 0 : r.remoteAssignments)) return !1;
var o = r.remoteAssignments.indexOf(t);
return -1 !== o && (r.remoteAssignments.splice(o, 1), ye.info("Manually removed remote ".concat(t, " from ").concat(e), {
subsystem: "Expansion"
}), !0);
}, o([ yr("expansion:manager", "Expansion Manager", {
priority: jt.LOW,
interval: 20,
minBucket: 0,
cpuBudget: .02
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), yo = new fo, go = function() {
function e() {}
return e.prototype.status = function() {
var e, t, r, o, a, i, s, c, l, u, m = Yt.getEmpire(), p = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), d = (Game.gcl.progress / Game.gcl.progressTotal * 100).toFixed(1), f = Game.gcl.level - p.length, y = f > 0, g = m.objectives.expansionPaused, h = m.claimQueue.length, v = m.claimQueue.filter(function(e) {
return !e.claimed;
}).length, R = m.claimQueue.filter(function(e) {
return e.claimed;
}).length, E = Object.values(Game.creeps).filter(function(e) {
var t = e.memory;
return "claimer" === t.role && "claim" === t.task;
}), T = "=== Expansion System Status ===\n\nGCL: Level ".concat(Game.gcl.level, " (").concat(d, "% to next)\nOwned Rooms: ").concat(p.length, "/").concat(Game.gcl.level, "\nAvailable Room Slots: ").concat(f, "\n\nExpansion Status: ").concat(g ? "PAUSED ⚠" : y ? "READY ✓" : "AT GCL LIMIT", "\nClaim Queue: ").concat(h, " total (").concat(v, " unclaimed, ").concat(R, " in progress)\nActive Claimers: ").concat(E.length, "\n\n");
if (v > 0) {
T += "=== Top Expansion Candidates ===\n";
var C = m.claimQueue.filter(function(e) {
return !e.claimed;
}).slice(0, 5);
try {
for (var S = n(C), w = S.next(); !w.done; w = S.next()) {
var O = w.value, b = Game.time - O.lastEvaluated;
T += "  ".concat(O.roomName, ": Score ").concat(O.score.toFixed(0), ", Distance ").concat(O.distance, ", Age ").concat(b, " ticks\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
w && !w.done && (t = S.return) && t.call(S);
} finally {
if (e) throw e.error;
}
}
T += "\n";
}
if (R > 0) {
T += "=== Active Expansion Attempts ===\n";
var _ = m.claimQueue.filter(function(e) {
return e.claimed;
}), x = function(e) {
var t = Game.time - e.lastEvaluated, r = E.find(function(t) {
return t.memory.targetRoom === e.roomName;
}), o = r ? "".concat(r.name, " en route") : "No claimer assigned";
T += "  ".concat(e.roomName, ": ").concat(o, ", Age ").concat(t, " ticks\n");
};
try {
for (var U = n(_), k = U.next(); !k.done; k = U.next()) x(O = k.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
k && !k.done && (o = U.return) && o.call(U);
} finally {
if (r) throw r.error;
}
}
T += "\n";
}
T += "=== Owned Room Distribution ===\n";
var M = new Map;
try {
for (var A = n(p), N = A.next(); !N.done; N = A.next()) {
var I = null !== (c = null === (s = N.value.controller) || void 0 === s ? void 0 : s.level) && void 0 !== c ? c : 0;
M.set(I, (null !== (l = M.get(I)) && void 0 !== l ? l : 0) + 1);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
N && !N.done && (i = A.return) && i.call(A);
} finally {
if (a) throw a.error;
}
}
for (I = 8; I >= 1; I--) {
var P = null !== (u = M.get(I)) && void 0 !== u ? u : 0;
if (P > 0) {
var G = "█".repeat(P);
T += "  RCL ".concat(I, ": ").concat(G, " (").concat(P, ")\n");
}
}
return T;
}, e.prototype.pause = function() {
return Yt.getEmpire().objectives.expansionPaused = !0, "Expansion paused. Use expansion.resume() to re-enable.";
}, e.prototype.resume = function() {
return Yt.getEmpire().objectives.expansionPaused = !1, "Expansion resumed.";
}, e.prototype.addRemote = function(e, t) {
return yo.addRemoteRoom(e, t) ? "Added remote ".concat(t, " to ").concat(e) : "Failed to add remote (check logs for details)";
}, e.prototype.removeRemote = function(e, t) {
return yo.removeRemoteRoom(e, t) ? "Removed remote ".concat(t, " from ").concat(e) : "Remote ".concat(t, " not found in ").concat(e);
}, e.prototype.clearQueue = function() {
var e = Yt.getEmpire(), t = e.claimQueue.length;
return e.claimQueue = [], "Cleared ".concat(t, " candidates from claim queue. Queue will repopulate on next empire tick.");
}, o([ Je({
name: "expansion.status",
description: "Show expansion system status, GCL progress, and claim queue",
usage: "expansion.status()",
examples: [ "expansion.status()" ],
category: "Empire"
}) ], e.prototype, "status", null), o([ Je({
name: "expansion.pause",
description: "Pause autonomous expansion",
usage: "expansion.pause()",
examples: [ "expansion.pause()" ],
category: "Empire"
}) ], e.prototype, "pause", null), o([ Je({
name: "expansion.resume",
description: "Resume autonomous expansion",
usage: "expansion.resume()",
examples: [ "expansion.resume()" ],
category: "Empire"
}) ], e.prototype, "resume", null), o([ Je({
name: "expansion.addRemote",
description: "Manually add a remote room assignment",
usage: "expansion.addRemote(homeRoom, remoteRoom)",
examples: [ "expansion.addRemote('W1N1', 'W2N1')" ],
category: "Empire"
}) ], e.prototype, "addRemote", null), o([ Je({
name: "expansion.removeRemote",
description: "Manually remove a remote room assignment",
usage: "expansion.removeRemote(homeRoom, remoteRoom)",
examples: [ "expansion.removeRemote('W1N1', 'W2N1')" ],
category: "Empire"
}) ], e.prototype, "removeRemote", null), o([ Je({
name: "expansion.clearQueue",
description: "Clear the expansion claim queue",
usage: "expansion.clearQueue()",
examples: [ "expansion.clearQueue()" ],
category: "Empire"
}) ], e.prototype, "clearQueue", null), e;
}(), ho = new go;

function vo(e) {
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

function Ro() {
var e;
return (null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.npcRooms) || {};
}

function Eo(e) {
var t = Memory;
t.tooangel || (t.tooangel = {}), t.tooangel.npcRooms || (t.tooangel.npcRooms = {});
var r = t.tooangel.npcRooms[e.roomName];
if (r) {
var o = new Set(i(i([], a(r.availableQuests), !1), a(e.availableQuests), !1));
e.availableQuests = Array.from(o);
}
t.tooangel.npcRooms[e.roomName] = e;
}

function To() {
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

function Co() {
var e;
return (null === (e = To().reputation) || void 0 === e ? void 0 : e.value) || 0;
}

function So(e) {
try {
var t = JSON.parse(e);
if ("reputation" === t.type && "number" == typeof t.reputation) return t.reputation;
} catch (e) {}
return null;
}

function wo(e) {
var t, r, o, n = To(), a = (null === (t = n.reputation) || void 0 === t ? void 0 : t.lastRequestedAt) || 0;
if (Game.time - a < 1e3) return ye.debug("Reputation request on cooldown (".concat(1e3 - (Game.time - a), " ticks remaining)"), {
subsystem: "TooAngel"
}), !1;
if (e) o = Game.rooms[e]; else for (var i in Game.rooms) {
var s = Game.rooms[i];
if ((null === (r = s.controller) || void 0 === r ? void 0 : r.my) && s.terminal && s.terminal.my) {
o = s;
break;
}
}
if (!o || !o.terminal || !o.terminal.my) return ye.warn("No terminal available to request reputation", {
subsystem: "TooAngel"
}), !1;
var c = function(e) {
var t = Ro(), r = null, o = 1 / 0;
for (var n in t) {
var a = Game.map.getRoomLinearDistance(e, n);
a < o && (o = a, r = t[n]);
}
return r;
}(o.name);
if (!c || !c.hasTerminal) return ye.warn("No TooAngel NPC room with terminal found", {
subsystem: "TooAngel"
}), !1;
var l = o.terminal, u = l.store[RESOURCE_ENERGY];
if (u < 100) return ye.warn("Insufficient energy for reputation request: ".concat(u, " < ").concat(100), {
subsystem: "TooAngel"
}), !1;
var m = l.send(RESOURCE_ENERGY, 100, c.roomName, JSON.stringify({
type: "reputation"
}));
return m === OK ? (ye.info("Sent reputation request to ".concat(c.roomName, " from ").concat(o.name), {
subsystem: "TooAngel"
}), n.reputation.lastRequestedAt = Game.time, !0) : (ye.warn("Failed to send reputation request: ".concat(m), {
subsystem: "TooAngel"
}), !1);
}

var Oo = {
MAX_ACTIVE_QUESTS: 3,
MIN_APPLICATION_ENERGY: 100,
DEADLINE_BUFFER: 500,
SUPPORTED_TYPES: [ "buildcs" ]
};

function bo(e) {
try {
var t = JSON.parse(e);
if ("quest" === t.type && t.id && t.room && t.quest && "number" == typeof t.end) return !t.result && t.end <= Game.time ? (ye.debug("Ignoring quest ".concat(t.id, " with past deadline: ").concat(t.end, " (current: ").concat(Game.time, ")"), {
subsystem: "TooAngel"
}), null) : t;
} catch (e) {}
return null;
}

function _o() {
return To().activeQuests || {};
}

function xo() {
var e = _o();
return Object.values(e).filter(function(e) {
return "active" === e.status || "applied" === e.status;
}).length < Oo.MAX_ACTIVE_QUESTS;
}

function Uo(e) {
return Oo.SUPPORTED_TYPES.includes(e);
}

function ko(e, t, r) {
var o, n;
if (!xo()) return ye.debug("Cannot accept more quests (at max capacity)", {
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
if (!n || !n.terminal || !n.terminal.my) return ye.warn("No terminal available to apply for quest", {
subsystem: "TooAngel"
}), !1;
var l = n.terminal, u = l.store[RESOURCE_ENERGY];
if (u < Oo.MIN_APPLICATION_ENERGY) return ye.warn("Insufficient energy for quest application: ".concat(u, " < ").concat(Oo.MIN_APPLICATION_ENERGY), {
subsystem: "TooAngel"
}), !1;
var m = {
type: "quest",
id: e,
action: "apply"
}, p = l.send(RESOURCE_ENERGY, Oo.MIN_APPLICATION_ENERGY, t, JSON.stringify(m));
return p === OK ? (ye.info("Applied for quest ".concat(e, " from ").concat(n.name, " to ").concat(t), {
subsystem: "TooAngel"
}), To().activeQuests[e] = {
id: e,
type: "buildcs",
status: "applied",
targetRoom: "",
originRoom: t,
deadline: 0,
appliedAt: Game.time
}, !0) : (ye.warn("Failed to apply for quest: ".concat(p), {
subsystem: "TooAngel"
}), !1);
}

function Mo(e) {
var t = To(), r = t.activeQuests[e.id];
r ? ("won" === e.result ? (ye.info("Quest ".concat(e.id, " completed successfully!"), {
subsystem: "TooAngel"
}), r.status = "completed") : (ye.warn("Quest ".concat(e.id, " failed"), {
subsystem: "TooAngel"
}), r.status = "failed"), r.completedAt = Game.time, t.completedQuests.includes(e.id) || t.completedQuests.push(e.id)) : ye.warn("Received completion for unknown quest: ".concat(e.id), {
subsystem: "TooAngel"
});
}

function Ao(e) {
var t, r, o, a, i, s, c, l = Game.rooms[e.targetRoom];
if (l) {
if (function(e) {
var t = Game.rooms[e];
return !!t && 0 === t.find(FIND_CONSTRUCTION_SITES).length;
}(e.targetRoom)) return ye.info("Quest ".concat(e.id, " (buildcs) completed! All construction sites built in ").concat(e.targetRoom), {
subsystem: "TooAngel"
}), function(e) {
var t, r, o = function(e) {
return _o()[e] || null;
}(e);
if (!o) return ye.warn("Cannot notify completion for unknown quest: ".concat(e), {
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
r.terminal.send(RESOURCE_ENERGY, 100, o.originRoom, JSON.stringify(i)) === OK && ye.info("Notified quest completion: ".concat(e, " (").concat("won", ")"), {
subsystem: "TooAngel"
});
}(e.id), e.status = "completed", void (e.completedAt = Game.time);
var u = l.find(FIND_CONSTRUCTION_SITES);
ye.debug("Quest ".concat(e.id, " (buildcs): ").concat(u.length, " construction sites remaining in ").concat(e.targetRoom), {
subsystem: "TooAngel"
});
var m = e.assignedCreeps || [], p = [];
try {
for (var d = n(m), f = d.next(); !f.done; f = d.next()) {
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
for (var E = (o = void 0, n(R)), T = E.next(); !(T.done || ((O = (w = T.value).memory).questId = e.id, 
p.push(w), m.push(w.name), ye.info("Assigned ".concat(w.name, " to quest ").concat(e.id, " (buildcs)"), {
subsystem: "TooAngel"
}), p.length >= 3)); T = E.next()) ;
} catch (e) {
o = {
error: e
};
} finally {
try {
T && !T.done && (a = E.return) && a.call(E);
} finally {
if (o) throw o.error;
}
}
if (p.length >= 3) break;
}
}
e.assignedCreeps = m;
try {
for (var C = n(p), S = C.next(); !S.done; S = C.next()) {
var w, O;
(O = (w = S.value).memory).questId = e.id, O.questTarget = e.targetRoom, O.questAction = "build";
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
} else ye.debug("Cannot execute buildcs quest ".concat(e.id, ": room ").concat(e.targetRoom, " not visible"), {
subsystem: "TooAngel"
});
}

var No, Io, Po, Go = function() {
function e() {
this.lastScanTick = 0, this.lastReputationRequestTick = 0, this.lastQuestDiscoveryTick = 0;
}
return e.prototype.isEnabled = function() {
var e, t;
return null === (t = null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.enabled) || void 0 === t || t;
}, e.prototype.enable = function() {
var e = Memory;
e.tooangel || (e.tooangel = {}), e.tooangel.enabled = !0, ye.info("TooAngel integration enabled", {
subsystem: "TooAngel"
});
}, e.prototype.disable = function() {
var e = Memory;
e.tooangel || (e.tooangel = {}), e.tooangel.enabled = !1, ye.info("TooAngel integration disabled", {
subsystem: "TooAngel"
});
}, e.prototype.run = function() {
if (this.isEnabled() && !(Game.cpu.bucket < 2e3)) try {
!function() {
var e, t;
if (Game.market.incomingTransactions) {
var r = To();
try {
for (var o = n(Game.market.incomingTransactions), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
if (!i.order && i.description) {
var s = So(i.description);
null !== s && (ye.info("Received reputation update from TooAngel: ".concat(s), {
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
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}
}(), function() {
var e, t;
if (Game.market.incomingTransactions) {
var r = To();
try {
for (var o = n(Game.market.incomingTransactions), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
if (!i.order && i.description) {
var s = bo(i.description);
if (s) {
if (ye.info("Received quest ".concat(s.id, ": ").concat(s.quest, " in ").concat(s.room, " (deadline: ").concat(s.end, ")"), {
subsystem: "TooAngel"
}), s.result) {
Mo(s);
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
}, Uo(s.quest) || (ye.warn("Received unsupported quest type: ".concat(s.quest), {
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
a && !a.done && (t = o.return) && t.call(o);
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
"active" === o.status && (o.deadline > 0 && Game.time > o.deadline ? (ye.warn("Quest ".concat(r, " missed deadline (").concat(o.deadline, ")"), {
subsystem: "TooAngel"
}), o.status = "failed", o.completedAt = Game.time) : "buildcs" === o.type ? Ao(o) : (ye.warn("Unsupported quest type for execution: ".concat(o.type), {
subsystem: "TooAngel"
}), o.status = "failed", o.completedAt = Game.time));
}
}(), function() {
var e = To().activeQuests || {};
for (var t in e) {
var r = e[t];
r.deadline > 0 && Game.time >= r.deadline - Oo.DEADLINE_BUFFER && ("active" !== r.status && "applied" !== r.status || (ye.warn("Quest ".concat(t, " expired (deadline: ").concat(r.deadline, ", current: ").concat(Game.time, ")"), {
subsystem: "TooAngel"
}), r.status = "failed", r.completedAt = Game.time)), ("completed" === r.status || "failed" === r.status) && r.completedAt && Game.time - r.completedAt > 1e4 && delete e[t];
}
}(), Game.time - this.lastScanTick >= 500 && (this.scanForNPCs(), this.lastScanTick = Game.time), 
Game.time - this.lastReputationRequestTick >= 2e3 && (this.updateReputation(), this.lastReputationRequestTick = Game.time), 
Game.time - this.lastQuestDiscoveryTick >= 1e3 && (this.discoverQuests(), this.lastQuestDiscoveryTick = Game.time);
} catch (t) {
var e = "tooangel_error_".concat(Game.time % 100);
Memory[e] || (ye.error("TooAngel manager error: ".concat(t), {
subsystem: "TooAngel"
}), Memory[e] = !0);
}
}, e.prototype.scanForNPCs = function() {
var e, t, r = function() {
var e = [];
for (var t in Game.rooms) {
var r = vo(Game.rooms[t]);
r && (ye.info("Detected TooAngel NPC room: ".concat(t), {
subsystem: "TooAngel"
}), e.push(r));
}
return e;
}();
try {
for (var o = n(r), a = o.next(); !a.done; a = o.next()) Eo(a.value);
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
r.length > 0 && ye.info("Scanned ".concat(r.length, " TooAngel NPC rooms"), {
subsystem: "TooAngel"
});
}, e.prototype.updateReputation = function() {
wo();
}, e.prototype.discoverQuests = function() {
!function() {
var e, t;
if (xo()) {
var r = Ro(), o = _o();
for (var a in r) {
var i = r[a];
try {
for (var s = (e = void 0, n(i.availableQuests)), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (!o[l]) return ye.info("Auto-applying for quest ".concat(l, " from ").concat(a), {
subsystem: "TooAngel"
}), void ko(l, a);
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
return Co();
}, e.prototype.getActiveQuests = function() {
return _o();
}, e.prototype.applyForQuest = function(e, t, r) {
return ko(e, t, r);
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
}, o([ gr("empire:tooangel", "TooAngel Manager", {
priority: jt.LOW,
interval: 10
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), Lo = new Go, Do = {
status: function() {
return Lo.getStatus();
},
enable: function() {
return Lo.enable(), "TooAngel integration enabled";
},
disable: function() {
return Lo.disable(), "TooAngel integration disabled";
},
reputation: function() {
var e = Co();
return "Current TooAngel reputation: ".concat(e);
},
requestReputation: function(e) {
return wo(e) ? "Reputation request sent".concat(e ? " from ".concat(e) : "") : "Failed to send reputation request (check logs for details)";
},
quests: function() {
var e, t = _o(), r = [ "Active Quests:" ];
if (0 === Object.keys(t).length) r.push("  No active quests"); else for (var o in t) {
var n = t[o], a = n.deadline - Game.time, i = (null === (e = n.assignedCreeps) || void 0 === e ? void 0 : e.length) || 0;
r.push("  ".concat(o, ":")), r.push("    Type: ".concat(n.type)), r.push("    Target: ".concat(n.targetRoom)), 
r.push("    Status: ".concat(n.status)), r.push("    Time left: ".concat(a, " ticks")), 
r.push("    Assigned creeps: ".concat(i));
}
return r.join("\n");
},
npcs: function() {
var e = Ro(), t = [ "TooAngel NPC Rooms:" ];
if (0 === Object.keys(e).length) t.push("  No NPC rooms discovered"); else for (var r in e) {
var o = e[r];
t.push("  ".concat(r, ":")), t.push("    Has terminal: ".concat(o.hasTerminal)), 
t.push("    Available quests: ".concat(o.availableQuests.length)), t.push("    Last seen: ".concat(Game.time - o.lastSeen, " ticks ago"));
}
return t.join("\n");
},
apply: function(e, t, r) {
return ko(e, t, r) ? "Applied for quest ".concat(e).concat(r ? " from ".concat(r) : "") : "Failed to apply for quest (check logs for details)";
},
help: function() {
return [ "TooAngel Console Commands:", "", "  tooangel.status()                    - Show current status", "  tooangel.enable()                    - Enable integration", "  tooangel.disable()                   - Disable integration", "  tooangel.reputation()                - Get current reputation", "  tooangel.requestReputation(fromRoom) - Request reputation update", "  tooangel.quests()                    - List active quests", "  tooangel.npcs()                      - List discovered NPC rooms", "  tooangel.apply(id, origin, fromRoom) - Apply for a quest", "  tooangel.help()                      - Show this help" ].join("\n");
}
}, Fo = function() {
function e() {}
return e.prototype.status = function() {
var e = bt.checkMemoryUsage(), t = e.breakdown, r = "Memory Status: ".concat(e.status.toUpperCase(), "\n");
return r += "Usage: ".concat(bt.formatBytes(e.used), " / ").concat(bt.formatBytes(e.limit), " (").concat((100 * e.percentage).toFixed(1), "%)\n\n"), 
r += "Breakdown:\n", r += "  Empire:        ".concat(bt.formatBytes(t.empire), " (").concat((t.empire / t.total * 100).toFixed(1), "%)\n"), 
r += "  Rooms:         ".concat(bt.formatBytes(t.rooms), " (").concat((t.rooms / t.total * 100).toFixed(1), "%)\n"), 
r += "  Creeps:        ".concat(bt.formatBytes(t.creeps), " (").concat((t.creeps / t.total * 100).toFixed(1), "%)\n"), 
r += "  Clusters:      ".concat(bt.formatBytes(t.clusters), " (").concat((t.clusters / t.total * 100).toFixed(1), "%)\n"), 
(r += "  SS2 Queue:     ".concat(bt.formatBytes(t.ss2PacketQueue), " (").concat((t.ss2PacketQueue / t.total * 100).toFixed(1), "%)\n")) + "  Other:         ".concat(bt.formatBytes(t.other), " (").concat((t.other / t.total * 100).toFixed(1), "%)\n");
}, e.prototype.analyze = function(e) {
void 0 === e && (e = 10);
var t = bt.getLargestConsumers(e), r = Ut.getRecommendations(), o = "Top ".concat(e, " Memory Consumers:\n");
return t.forEach(function(e, t) {
o += "".concat(t + 1, ". ").concat(e.type, ":").concat(e.name, " - ").concat(bt.formatBytes(e.size), "\n");
}), r.length > 0 ? (o += "\nRecommendations:\n", r.forEach(function(e) {
o += "- ".concat(e, "\n");
})) : o += "\nNo recommendations at this time.\n", o;
}, e.prototype.prune = function() {
var e = Ut.pruneAll(), t = "Memory Pruning Complete:\n";
return t += "  Dead creeps removed:        ".concat(e.deadCreeps, "\n"), t += "  Event log entries removed:  ".concat(e.eventLogs, "\n"), 
t += "  Stale intel removed:        ".concat(e.staleIntel, "\n"), (t += "  Market history removed:     ".concat(e.marketHistory, "\n")) + "  Total bytes saved:          ".concat(bt.formatBytes(e.bytesSaved), "\n");
}, e.prototype.segments = function() {
var e, t, r = At.getActiveSegments(), o = "Memory Segments:\n\n";
o += "Active segments: ".concat(r.length, "/10\n"), r.length > 0 && (o += "  Loaded: [".concat(r.join(", "), "]\n\n")), 
o += "Allocation Strategy:\n";
var i = function(e, t) {
o += "  ".concat(e.padEnd(20), " ").concat(t.start.toString().padStart(2), "-").concat(t.end.toString().padEnd(2));
var n = r.filter(function(e) {
return e >= t.start && e <= t.end;
});
if (n.length > 0) {
var a = n.map(function(e) {
var t = At.getSegmentSize(e);
return "".concat(e, ":").concat(bt.formatBytes(t));
});
o += " [".concat(a.join(", "), "]");
}
o += "\n";
};
try {
for (var s = n(Object.entries(kt)), c = s.next(); !c.done; c = s.next()) {
var l = a(c.value, 2);
i(l[0], l[1]);
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
return o;
}, e.prototype.compress = function(e) {
var t, r, o = e.split("."), a = Memory;
try {
for (var i = n(o), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (!a || "object" != typeof a || !(c in a)) return "Path not found: ".concat(e);
a = a[c];
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
if (!a) return "No data at path: ".concat(e);
var l = Gt.getCompressionStats(a), u = "Compression Test for: ".concat(e, "\n");
return u += "  Original size:    ".concat(bt.formatBytes(l.originalSize), "\n"), 
u += "  Compressed size:  ".concat(bt.formatBytes(l.compressedSize), "\n"), u += "  Bytes saved:      ".concat(bt.formatBytes(l.bytesSaved), "\n"), 
(u += "  Compression ratio: ".concat((100 * l.ratio).toFixed(1), "%\n")) + "  Worth compressing: ".concat(l.ratio < .9 ? "YES" : "NO", "\n");
}, e.prototype.migrations = function() {
var e = Ft.getCurrentVersion(), t = Ft.getLatestVersion(), r = Ft.getPendingMigrations(), o = "Memory Migration Status:\n";
return o += "  Current version: ".concat(e, "\n"), o += "  Latest version:  ".concat(t, "\n"), 
o += "  Status: ".concat(r.length > 0 ? "PENDING" : "UP TO DATE", "\n\n"), r.length > 0 && (o += "Pending Migrations:\n", 
r.forEach(function(e) {
o += "  v".concat(e.version, ": ").concat(e.description, "\n");
}), o += "\nMigrations will run automatically on next tick.\n"), o;
}, e.prototype.migrate = function() {
var e = Ft.getCurrentVersion();
Ft.runMigrations();
var t = Ft.getCurrentVersion();
return t > e ? "Migrated from v".concat(e, " to v").concat(t) : "No migrations needed (current: v".concat(t, ")");
}, e.prototype.reset = function(e) {
if ("CONFIRM" !== e) return "WARNING: This will clear ALL memory!\nTo confirm, use: memory.reset('CONFIRM')";
var t = Memory;
for (var r in t) delete t[r];
for (var o = 0; o < 100; o++) RawMemory.segments[o] = "";
return Yt.initialize(), "Memory reset complete. All data cleared (main memory + 100 segments).";
}, o([ Je({
name: "memory.status",
description: "Show current memory usage and status",
usage: "memory.status()",
examples: [ "memory.status()" ],
category: "Memory"
}) ], e.prototype, "status", null), o([ Je({
name: "memory.analyze",
description: "Analyze memory usage and show largest consumers",
usage: "memory.analyze([topN])",
examples: [ "memory.analyze()", "memory.analyze(20)" ],
category: "Memory"
}) ], e.prototype, "analyze", null), o([ Je({
name: "memory.prune",
description: "Manually trigger memory pruning to clean stale data",
usage: "memory.prune()",
examples: [ "memory.prune()" ],
category: "Memory"
}) ], e.prototype, "prune", null), o([ Je({
name: "memory.segments",
description: "Show memory segment allocation and usage",
usage: "memory.segments()",
examples: [ "memory.segments()" ],
category: "Memory"
}) ], e.prototype, "segments", null), o([ Je({
name: "memory.compress",
description: "Test compression on a memory path",
usage: "memory.compress(path)",
examples: [ "memory.compress('empire.knownRooms')" ],
category: "Memory"
}) ], e.prototype, "compress", null), o([ Je({
name: "memory.migrations",
description: "Show migration status and pending migrations",
usage: "memory.migrations()",
examples: [ "memory.migrations()" ],
category: "Memory"
}) ], e.prototype, "migrations", null), o([ Je({
name: "memory.migrate",
description: "Manually trigger memory migrations",
usage: "memory.migrate()",
examples: [ "memory.migrate()" ],
category: "Memory"
}) ], e.prototype, "migrate", null), o([ Je({
name: "memory.reset",
description: "Clear all memory (DANGEROUS - requires confirmation)",
usage: "memory.reset('CONFIRM')",
examples: [ "memory.reset('CONFIRM')" ],
category: "Memory"
}) ], e.prototype, "reset", null), e;
}(), Bo = new Fo;

function Ho(e, t, r, o) {
var n = o instanceof Error ? o.message : String(o);
console.log("[SafeFind] WARN: SafeFind error in ".concat(e, "(").concat(String(t), ") at ").concat(r, ": ").concat(n));
}

function Wo(e, t, r) {
try {
return e.find(t, r);
} catch (r) {
return Ho("room.find", t, e.name, r), [];
}
}

function Yo(e, t, r) {
try {
return e.findClosestByRange(t, r);
} catch (r) {
return Ho("pos.findClosestByRange", t, "".concat(e.roomName, ":").concat(String(e.x), ",").concat(String(e.y)), r), 
null;
}
}

(No = {})[FIND_SOURCES] = 5e3, No[FIND_MINERALS] = 5e3, No[FIND_DEPOSITS] = 100, 
No[FIND_STRUCTURES] = 50, No[FIND_MY_STRUCTURES] = 50, No[FIND_HOSTILE_STRUCTURES] = 20, 
No[FIND_MY_SPAWNS] = 100, No[FIND_MY_CONSTRUCTION_SITES] = 20, No[FIND_CONSTRUCTION_SITES] = 20, 
No[FIND_CREEPS] = 5, No[FIND_MY_CREEPS] = 5, No[FIND_HOSTILE_CREEPS] = 3, No[FIND_DROPPED_RESOURCES] = 5, 
No[FIND_TOMBSTONES] = 10, No[FIND_RUINS] = 10, No[FIND_FLAGS] = 50, No[FIND_NUKES] = 20, 
No[FIND_POWER_CREEPS] = 10, No[FIND_MY_POWER_CREEPS] = 10, function(e) {
e[e.CRITICAL = 0] = "CRITICAL", e[e.HIGH = 1] = "HIGH", e[e.MEDIUM = 2] = "MEDIUM", 
e[e.LOW = 3] = "LOW";
}(Po || (Po = {}));

var Ko, Vo = {
bucketThresholds: (Io = {}, Io[Po.CRITICAL] = 0, Io[Po.HIGH] = 2e3, Io[Po.MEDIUM] = 5e3, 
Io[Po.LOW] = 8e3, Io),
defaultMaxCpu: 5,
logExecution: !1
}, jo = function() {
function e(e) {
var t;
this.tasks = new Map, this.stats = {
totalTasks: 0,
tasksByPriority: (t = {}, t[Po.CRITICAL] = 0, t[Po.HIGH] = 0, t[Po.MEDIUM] = 0, 
t[Po.LOW] = 0, t),
executedThisTick: 0,
skippedThisTick: 0,
deferredThisTick: 0,
cpuUsed: 0
}, this.config = r(r({}, Vo), e);
}
return e.prototype.register = function(e) {
var t, o, n = r(r({}, e), {
lastRun: Game.time - e.interval,
maxCpu: null !== (t = e.maxCpu) && void 0 !== t ? t : this.config.defaultMaxCpu,
skippable: null === (o = e.skippable) || void 0 === o || o
});
this.tasks.set(e.id, n), this.updateStats();
}, e.prototype.unregister = function(e) {
this.tasks.delete(e), this.updateStats();
}, e.prototype.run = function(e) {
var t, o, a, i = Game.cpu.getUsed(), s = Game.cpu.bucket, c = null != e ? e : 1 / 0;
this.stats.executedThisTick = 0, this.stats.skippedThisTick = 0, this.stats.deferredThisTick = 0;
var l = Array.from(this.tasks.values()).sort(function(e, t) {
return e.priority - t.priority;
}), u = 0;
try {
for (var m = n(l), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (!(Game.time - d.lastRun < d.interval)) {
if (d.priority !== Po.CRITICAL && s < this.config.bucketThresholds[d.priority]) {
this.stats.skippedThisTick++;
continue;
}
var f = null !== (a = d.maxCpu) && void 0 !== a ? a : this.config.defaultMaxCpu;
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
p && !p.done && (o = m.return) && o.call(m);
} finally {
if (t) throw t.error;
}
}
return this.stats.cpuUsed = Game.cpu.getUsed() - i, r({}, this.stats);
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
return r({}, this.stats);
}, e.prototype.getTasks = function() {
return Array.from(this.tasks.values());
}, e.prototype.hasTask = function(e) {
return this.tasks.has(e);
}, e.prototype.clear = function() {
this.tasks.clear(), this.updateStats();
}, e.prototype.updateStats = function() {
var e, t, r;
this.stats.totalTasks = this.tasks.size, this.stats.tasksByPriority = ((e = {})[Po.CRITICAL] = 0, 
e[Po.HIGH] = 0, e[Po.MEDIUM] = 0, e[Po.LOW] = 0, e);
try {
for (var o = n(this.tasks.values()), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
this.stats.tasksByPriority[i.priority]++;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
}, e;
}(), zo = ((Ko = global)._computationScheduler || (Ko._computationScheduler = new jo), 
Ko._computationScheduler), qo = new Map;

function Xo(e) {
var t = qo.get(e);
return t && t.tick === Game.time || (t = {
assignments: new Map,
tick: Game.time
}, qo.set(e, t)), t;
}

function Qo(e, t, r) {
var o, a;
if (0 === t.length) return null;
if (1 === t.length) return Zo(e, t[0], r), t[0];
var i = Xo(e.room.name), s = null, c = 1 / 0, l = 1 / 0;
try {
for (var u = n(t), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = "".concat(r, ":").concat(p.id), f = (i.assignments.get(d) || []).length, y = e.pos.getRangeTo(p.pos);
(f < c || f === c && y < l) && (s = p, c = f, l = y);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
m && !m.done && (a = u.return) && a.call(u);
} finally {
if (o) throw o.error;
}
}
return s && Zo(e, s, r), s;
}

function Zo(e, t, r) {
var o = Xo(e.room.name), n = "".concat(r, ":").concat(t.id), a = o.assignments.get(n) || [];
a.includes(e.name) || (a.push(e.name), o.assignments.set(n, a));
}

var Jo = {
red: "#ef9a9a",
green: "#6b9955",
yellow: "#c5c599",
blue: "#8dc5e3"
};

function $o(e, t, r) {
void 0 === t && (t = null), void 0 === r && (r = !1);
var o = t ? "color: ".concat(Jo[t], ";") : "";
return '<text style="'.concat([ o, r ? "font-weight: bolder;" : "" ].join(" "), '">').concat(e, "</text>");
}

var en = {
customStyle: function() {
return "<style>\n      input {\n        background-color: #2b2b2b;\n        border: none;\n        border-bottom: 1px solid #888;\n        padding: 3px;\n        color: #ccc;\n      }\n      select {\n        border: none;\n        background-color: #2b2b2b;\n        color: #ccc;\n      }\n      button {\n        border: 1px solid #888;\n        cursor: pointer;\n        background-color: #2b2b2b;\n        color: #ccc;\n      }\n    </style>".replace(/\n/g, "");
},
input: function(e) {
return "".concat(e.label || "", ' <input name="').concat(e.name, '" placeholder="').concat(e.placeholder || "", '"/>');
},
select: function(e) {
var t = [ "".concat(e.label || "", ' <select name="').concat(e.name, '">') ];
return t.push.apply(t, i([], a(e.options.map(function(e) {
return ' <option value="'.concat(e.value, '">').concat(e.label, "</option>");
})), !1)), t.push("</select>"), t.join("");
},
button: function(e) {
return '<button onclick="'.concat((t = e.command, "angular.element(document.body).injector().get('Console').sendCommand('(".concat(t, ")()', 1)")), '">').concat(e.content, "</button>");
var t;
},
form: function(e, t, r) {
var o = this, n = e + Game.time.toString(), s = [ this.customStyle(), "<form name='".concat(n, "'>") ];
s.push.apply(s, i([], a(t.map(function(e) {
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
return s.push('<button type="button" onclick="'.concat(c.replace(/\n/g, ";"), '">').concat(r.content, "</button>")), 
s.push("</form>"), s.join("");
}
};

function tn() {
for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
return nn() + an() + '<div class="module-help">'.concat(e.map(rn).join(""), "</div>");
}

var rn = function(e) {
var t = e.api.map(on).join("");
return '<div class="module-container">\n    <div class="module-info">\n      <span class="module-title">'.concat($o(e.name, "yellow"), '</span>\n      <span class="module-describe">').concat($o(e.describe, "green"), '</span>\n    </div>\n    <div class="module-api-list">').concat(t, "</div>\n  </div>").replace(/\n/g, "");
}, on = function(e) {
var t = [];
e.describe && t.push($o(e.describe, "green")), e.params && t.push(e.params.map(function(e) {
return "  - ".concat($o(e.name, "blue"), ": ").concat($o(e.desc, "green"));
}).map(function(e) {
return '<div class="api-content-line">'.concat(e, "</div>");
}).join(""));
var r = e.params ? e.params.map(function(e) {
return $o(e.name, "blue");
}).join(", ") : "", o = $o(e.functionName, "yellow") + (e.commandType ? "" : "(".concat(r, ")"));
t.push(o);
var n = t.map(function(e) {
return '<div class="api-content-line">'.concat(e, "</div>");
}).join(""), a = "".concat(e.functionName).concat(Game.time);
return '\n  <div class="api-container">\n    <label for="'.concat(a, '">').concat(e.title, " ").concat($o(e.functionName, "yellow", !0), '</label>\n    <input id="').concat(a, '" type="checkbox" />\n    <div class="api-content">').concat(n, "</div>\n  </div>\n  ").replace(/\n/g, "");
}, nn = function() {
return "\n  <style>\n  .module-help {\n    display: flex;\n    flex-flow: column nowrap;\n  }\n  .module-container {\n    padding: 0px 10px 10px 10px;\n    display: flex;\n    flex-flow: column nowrap;\n  }\n  .module-info {\n    margin: 5px;\n    display: flex;\n    flex-flow: row nowrap;\n    align-items: baseline;\n  }\n  .module-title {\n    font-size: 19px;\n    font-weight: bolder;\n    margin-left: -15px;\n  }\n  .module-api-list {\n    display: flex;\n    flex-flow: row wrap;\n  }\n  </style>".replace(/\n/g, "");
}, an = function() {
return "\n  <style>\n  .api-content-line {\n    width: max-content;\n    padding-right: 15px;\n  }\n  .api-container {\n    margin: 5px;\n    width: 250px;\n    background-color: #2b2b2b;\n    overflow: hidden;\n    display: flex;\n    flex-flow: column;\n  }\n\n  .api-container label {\n    transition: all 0.1s;\n    min-width: 300px;\n  }\n\n  /* Hide checkbox */\n  .api-container input {\n    display: none;\n  }\n\n  .api-container label {\n    cursor: pointer;\n    display: block;\n    padding: 10px;\n    background-color: #3b3b3b;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n\n  .api-container label:hover, label:focus {\n    background-color: #525252;\n  }\n\n  /* Collapsed state */\n  .api-container input + .api-content {\n    overflow: hidden;\n    transition: all 0.1s;\n    width: auto;\n    max-height: 0px;\n    padding: 0px 10px;\n  }\n\n  /* Expanded state when checkbox is checked */\n  .api-container input:checked + .api-content {\n    max-height: 200px;\n    padding: 10px;\n    background-color: #1c1c1c;\n    overflow-x: auto;\n  }\n  </style>".replace(/\n/g, "");
};

function sn(e) {
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
var t = Ze.getCommandsByCategory(), r = t.get(e);
if (!r || 0 === r.length) return 'Category "'.concat(e, '" not found. Available categories: ').concat(Array.from(t.keys()).join(", "));
var o = r.map(function(e) {
var t, r;
return {
title: e.metadata.description,
describe: null === (t = e.metadata.examples) || void 0 === t ? void 0 : t[0],
functionName: e.metadata.name,
commandType: !(null === (r = e.metadata.usage) || void 0 === r ? void 0 : r.includes("(")),
params: e.metadata.usage ? sn(e.metadata.usage) : void 0
};
});
return tn({
name: e,
describe: "".concat(e, " commands"),
api: o
});
}(e) : function() {
var e, t, r = Ze.getCommandsByCategory(), o = [];
try {
for (var s = n(r), c = s.next(); !c.done; c = s.next()) {
var l = a(c.value, 2), u = l[0], m = l[1].map(function(e) {
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
c && !c.done && (t = s.return) && t.call(s);
} finally {
if (e) throw e.error;
}
}
return tn.apply(void 0, i([], a(o), !1));
}();
}, e.prototype.spawnForm = function(e) {
return Game.rooms[e] ? en.form("spawnCreep", [ {
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
}) : $o("Room ".concat(e, " not found or not visible"), "red", !0);
}, e.prototype.roomControl = function(e) {
var t = Game.rooms[e];
if (!t) return $o("Room ".concat(e, " not found or not visible"), "red", !0);
var r = '<div style="background: #2b2b2b; padding: 10px; margin: 5px;">';
return r += '<h3 style="color: #c5c599; margin: 0 0 10px 0;">Room Control: '.concat(e, "</h3>"), 
r += '<div style="margin-bottom: 10px;">', r += $o("Energy: ".concat(t.energyAvailable, "/").concat(t.energyCapacityAvailable), "green") + "<br>", 
t.controller && (r += $o("Controller Level: ".concat(t.controller.level, " (").concat(t.controller.progress, "/").concat(t.controller.progressTotal, ")"), "blue") + "<br>"), 
r += "</div>", r += en.button({
content: "🔄 Toggle Visualizations",
command: "() => {\n        const config = global.botConfig.getConfig();\n        global.botConfig.updateConfig({visualizations: !config.visualizations});\n        return 'Visualizations: ' + (!config.visualizations ? 'ON' : 'OFF');\n      }"
}), r += " ", (r += en.button({
content: "📊 Room Stats",
command: "() => {\n        const room = Game.rooms['".concat(e, "'];\n        if (!room) return 'Room not found';\n        let stats = '=== Room Stats ===\\n';\n        stats += 'Energy: ' + room.energyAvailable + '/' + room.energyCapacityAvailable + '\\n';\n        stats += 'Creeps: ' + Object.values(Game.creeps).filter(c => c.room.name === '").concat(e, "').length + '\\n';\n        if (room.controller) {\n          stats += 'RCL: ' + room.controller.level + '\\n';\n          stats += 'Progress: ' + room.controller.progress + '/' + room.controller.progressTotal + '\\n';\n        }\n        return stats;\n      }")
})) + "</div>";
}, e.prototype.logForm = function() {
return en.form("configureLogging", [ {
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
return en.form("configureVisualization", [ {
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
e += en.button({
content: "🚨 Emergency Mode",
command: "() => {\n        const config = global.botConfig.getConfig();\n        global.botConfig.updateConfig({emergencyMode: !config.emergencyMode});\n        return 'Emergency Mode: ' + (!config.emergencyMode ? 'ON' : 'OFF');\n      }"
}), e += " ", e += en.button({
content: "🐛 Toggle Debug",
command: "() => {\n        const config = global.botConfig.getConfig();\n        const newValue = !config.debug;\n        global.botConfig.updateConfig({debug: newValue});\n        global.botLogger.configureLogger({level: newValue ? 0 : 1});\n        return 'Debug mode: ' + (newValue ? 'ON' : 'OFF');\n      }"
}), e += " ", (e += en.button({
content: "🗑️ Clear Cache",
command: "() => {\n        global.botCacheManager.clear();\n        return 'Cache cleared successfully';\n      }"
})) + "</div>";
}, e.prototype.colorDemo = function() {
var e = "=== Console Color Demo ===\n\n";
return e += $o("✓ Success message", "green", !0) + "\n", e += $o("⚠ Warning message", "yellow", !0) + "\n", 
e += $o("✗ Error message", "red", !0) + "\n", e += $o("ℹ Info message", "blue", !0) + "\n", 
(e += "\nNormal text: " + $o("colored text", "green") + " normal text\n") + "Bold text: " + $o("important", null, !0) + "\n";
}, o([ Je({
name: "uiHelp",
description: "Show interactive help interface with expandable sections",
usage: "uiHelp()",
examples: [ "uiHelp()", 'uiHelp("Logging")', 'uiHelp("Visualization")' ],
category: "System"
}) ], e.prototype, "uiHelp", null), o([ Je({
name: "spawnForm",
description: "Show interactive form for spawning creeps",
usage: "spawnForm(roomName)",
examples: [ 'spawnForm("W1N1")', 'spawnForm("E2S3")' ],
category: "Spawning"
}) ], e.prototype, "spawnForm", null), o([ Je({
name: "roomControl",
description: "Show interactive room control panel",
usage: "roomControl(roomName)",
examples: [ 'roomControl("W1N1")' ],
category: "Room Management"
}) ], e.prototype, "roomControl", null), o([ Je({
name: "logForm",
description: "Show interactive form for configuring logging",
usage: "logForm()",
examples: [ "logForm()" ],
category: "Logging"
}) ], e.prototype, "logForm", null), o([ Je({
name: "visForm",
description: "Show interactive form for visualization settings",
usage: "visForm()",
examples: [ "visForm()" ],
category: "Visualization"
}) ], e.prototype, "visForm", null), o([ Je({
name: "quickActions",
description: "Show quick action buttons for common operations",
usage: "quickActions()",
examples: [ "quickActions()" ],
category: "System"
}) ], e.prototype, "quickActions", null), o([ Je({
name: "colorDemo",
description: "Show color demonstration for console output",
usage: "colorDemo()",
examples: [ "colorDemo()" ],
category: "System"
}) ], e.prototype, "colorDemo", null);
}();

var cn = function() {
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
for (var i = n(r.entries), s = i.next(); !s.done; s = i.next()) {
var c = a(s.value, 2), l = c[0], u = c[1];
void 0 !== u.ttl && -1 !== u.ttl && Game.time - u.cachedAt > u.ttl && (r.entries.delete(l), 
o++);
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
return o;
}, e;
}(), ln = function() {
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
var t, r, o, i, s = this.getMemory(), c = [];
try {
for (var l = n(Object.entries(s.data)), u = l.next(); !u.done; u = l.next()) {
var m = a(u.value, 2), p = m[0], d = m[1];
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
for (var f = n(c), y = f.next(); !y.done; y = f.next()) p = y.value, delete s.data[p];
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (i = f.return) && i.call(f);
} finally {
if (o) throw o.error;
}
}
}, e.prototype.get = function(e) {
var t = this.getHeap().entries.get(e);
if (t) return t.lastAccessed !== Game.time && (t.lastAccessed = Game.time, t.dirty = !0), 
t;
}, e.prototype.set = function(e, t) {
this.getHeap().entries.set(e, r(r({}, t), {
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
var e, t, r, o, i = this.getHeap(), s = this.getMemory(), c = 0;
try {
for (var l = n(i.entries), u = l.next(); !u.done; u = l.next()) {
var m = a(u.value, 2), p = m[0], d = m[1];
void 0 !== d.ttl && -1 !== d.ttl && Game.time - d.cachedAt > d.ttl && (i.entries.delete(p), 
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
for (var f = n(Object.entries(s.data)), y = f.next(); !y.done; y = f.next()) {
var g = a(y.value, 2), h = (p = g[0], g[1]);
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
var r = this.getHeap(), o = this.getMemory(), i = 0;
try {
for (var s = n(r.entries), c = s.next(); !c.done; c = s.next()) {
var l = a(c.value, 2), u = l[0], m = l[1];
m.dirty && (o.data[u] = {
value: m.value,
cachedAt: m.cachedAt,
ttl: m.ttl,
hits: m.hits
}, m.dirty = !1, i++);
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
return o.lastSync = Game.time, this.lastPersistTick = Game.time, i;
}, e.CACHE_VERSION = 1, e;
}();

function un(e, t) {
return !!(e.includes("path:") || e.includes(":path:") || e.includes("scan:") || e.includes("roomFind:") || e.includes("target:") || e.includes("role:"));
}

var mn, pn = function() {
function e(e, t) {
var r, o, n;
void 0 === e && (e = "default"), void 0 === t && (t = {}), this.lastPersistTick = 0, 
this.lastSizeCheck = 0, this.namespace = e, this.config = {
syncInterval: null !== (r = t.syncInterval) && void 0 !== r ? r : 10,
maxMemoryBytes: null !== (o = t.maxMemoryBytes) && void 0 !== o ? o : 102400,
persistenceFilter: null !== (n = t.persistenceFilter) && void 0 !== n ? n : un
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
var t, r, o, i, s = this.getMemory(), c = 0, l = [];
try {
for (var u = n(Object.entries(s.data)), m = u.next(); !m.done; m = u.next()) {
var p = a(m.value, 2), d = p[0], f = p[1];
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
for (var y = n(l), g = y.next(); !g.done; g = y.next()) d = g.value, delete s.data[d];
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (i = y.return) && i.call(y);
} finally {
if (o) throw o.error;
}
}
c > 0 && (s.memoryUsageBytes = this.estimateMemorySize(s.data));
}, e.prototype.get = function(e) {
var t = this.getHeap().entries.get(e);
if (t) return t.lastAccessed = Game.time, t;
}, e.prototype.set = function(e, t) {
var o = this.getHeap(), n = this.config.persistenceFilter(e, t);
o.entries.set(e, r(r({}, t), {
dirty: n
})), n && o.dirtyKeys.add(e);
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
var e, t, r, o, i = this.getHeap(), s = this.getMemory(), c = 0;
try {
for (var l = n(i.entries), u = l.next(); !u.done; u = l.next()) {
var m = a(u.value, 2), p = m[0], d = m[1];
this.isExpirable(d) && Game.time - d.cachedAt > d.ttl && (i.entries.delete(p), i.dirtyKeys.delete(p), 
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
for (var f = n(Object.entries(s.data)), y = f.next(); !y.done; y = f.next()) {
var g = a(y.value, 2), h = (p = g[0], g[1]);
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
var r = this.getHeap(), o = this.getMemory(), a = 0;
try {
for (var i = n(r.dirtyKeys), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = r.entries.get(c);
l && (o.data[c] = {
value: l.value,
cachedAt: l.cachedAt,
ttl: l.ttl,
hits: l.hits
}, l.dirty = !1, a++);
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
this.lastSizeCheck = Game.time), a;
}, e.prototype.estimateMemorySize = function(e) {
try {
return JSON.stringify(e).length;
} catch (t) {
return 1024 * Object.keys(e).length;
}
}, e.prototype.enforceMemoryBudget = function() {
var e, t, r = this.getMemory();
if (!(r.memoryUsageBytes <= this.config.maxMemoryBytes)) {
var o = this.getHeap(), i = Array.from(o.entries.entries()).filter(function(e) {
var t = a(e, 1)[0];
return void 0 !== r.data[t];
}).sort(function(e, t) {
return e[1].lastAccessed - t[1].lastAccessed;
});
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
var l = a(c.value, 2), u = l[0];
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
}(), dn = function() {
function e(e) {
void 0 === e && (e = "heap"), this.stores = new Map, this.stats = new Map, this.defaultStore = e;
}
return e.prototype.getStore = function(e, t) {
var r = null != t ? t : this.defaultStore, o = "".concat(e, ":").concat(r), n = this.stores.get(o);
return n || (n = "memory" === r ? new ln(e) : "hybrid" === r ? new pn(e) : new cn(e), 
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
var r, o, a, i;
void 0 === t && (t = "default");
var s = "".concat(t, ":heap"), c = "".concat(t, ":memory"), l = "".concat(t, ":hybrid"), u = 0, m = [ this.stores.get(s), this.stores.get(c), this.stores.get(l) ].filter(Boolean);
try {
for (var p = n(m), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
if (f) {
var y = f.keys();
try {
for (var g = (a = void 0, n(y)), h = g.next(); !h.done; h = g.next()) {
var v = h.value, R = v.indexOf(":");
if (-1 !== R) {
var E = v.substring(R + 1);
e.test(E) && (f.delete(v), u++);
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (a) throw a.error;
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
var t, r, o, a, i;
if (e) {
var s = "".concat(e, ":heap"), c = "".concat(e, ":memory"), l = "".concat(e, ":hybrid");
null === (o = this.stores.get(s)) || void 0 === o || o.clear(), null === (a = this.stores.get(c)) || void 0 === a || a.clear(), 
null === (i = this.stores.get(l)) || void 0 === i || i.clear(), this.stats.delete(e);
} else {
try {
for (var u = n(this.stores.values()), m = u.next(); !m.done; m = u.next()) m.value.clear();
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
var t, r, o, a, i, s, c, l, u, m;
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
var E, T = 0, C = 0, S = 0, w = 0;
try {
for (var O = n(this.stats.values()), b = O.next(); !b.done; b = O.next()) T += (p = b.value).hits, 
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
for (var _ = n(this.stores.values()), x = _.next(); !x.done; x = _.next()) w += x.value.size();
} catch (e) {
o = {
error: e
};
} finally {
try {
x && !x.done && (a = _.return) && a.call(_);
} finally {
if (o) throw o.error;
}
}
return {
hits: T,
misses: C,
hitRate: R = (E = T + C) > 0 ? T / E : 0,
size: w,
evictions: S
};
}, e.prototype.evictLRU = function(e, t) {
var r, o, a = t.keys();
if (0 !== a.length) {
var i = null, s = 1 / 0;
try {
for (var c = n(a), l = c.next(); !l.done; l = c.next()) {
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
for (var o = n(this.stores.values()), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
i.cleanup && (r += i.cleanup());
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
return r;
}, e.prototype.persist = function() {
var e, t, r = 0;
try {
for (var o = n(this.stores.values()), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
i.persist && (r += i.persist());
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
return r;
}, e;
}(), fn = new dn("heap");

!function(e) {
e.L1 = "L1", e.L2 = "L2", e.L3 = "L3";
}(mn || (mn = {}));

var yn, gn = "object", hn = "path";

function vn(e, t) {
return "".concat(e.roomName, ":").concat(e.x, ",").concat(e.y, ":").concat(t.roomName, ":").concat(t.x, ",").concat(t.y);
}

function Rn(e, t, r, o) {
void 0 === o && (o = {});
var n = vn(e, t), a = Room.serializePath(r);
fn.set(n, a, {
namespace: hn,
ttl: o.ttl,
maxSize: 1e3
});
}

var En = "roomFind", Tn = ((yn = {})[FIND_SOURCES] = 5e3, yn[FIND_MINERALS] = 5e3, 
yn[FIND_DEPOSITS] = 100, yn[FIND_STRUCTURES] = 50, yn[FIND_MY_STRUCTURES] = 50, 
yn[FIND_HOSTILE_STRUCTURES] = 20, yn[FIND_MY_SPAWNS] = 100, yn[FIND_MY_CONSTRUCTION_SITES] = 20, 
yn[FIND_CONSTRUCTION_SITES] = 20, yn[FIND_CREEPS] = 5, yn[FIND_MY_CREEPS] = 5, yn[FIND_HOSTILE_CREEPS] = 3, 
yn[FIND_DROPPED_RESOURCES] = 5, yn[FIND_TOMBSTONES] = 10, yn[FIND_RUINS] = 10, yn[FIND_FLAGS] = 50, 
yn[FIND_NUKES] = 20, yn[FIND_POWER_CREEPS] = 10, yn[FIND_MY_POWER_CREEPS] = 10, 
yn);

function Cn(e, t, r) {
var o, n, a = function(e, t, r) {
return r ? "".concat(e, ":").concat(t, ":").concat(r) : "".concat(e, ":").concat(t);
}(e.name, t, null == r ? void 0 : r.filterKey), i = fn.get(a, {
namespace: En,
ttl: null !== (n = null !== (o = null == r ? void 0 : r.ttl) && void 0 !== o ? o : Tn[t]) && void 0 !== n ? n : 20,
compute: function() {
return (null == r ? void 0 : r.filter) ? e.find(t, {
filter: r.filter
}) : e.find(t);
}
});
return null != i ? i : [];
}

function Sn(e) {
return Cn(e, FIND_SOURCES);
}

function wn(e, t) {
return t ? Cn(e, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === t;
},
filterKey: t
}) : Cn(e, FIND_MY_STRUCTURES);
}

function On(e, t) {
return t ? Cn(e, FIND_DROPPED_RESOURCES, {
filter: function(e) {
return e.resourceType === t;
},
filterKey: t
}) : Cn(e, FIND_DROPPED_RESOURCES);
}

var bn = "closest";

function _n(e, t) {
return "".concat(e, ":").concat(t);
}

function xn(e, t, r, o) {
if (void 0 === o && (o = 10), 0 === t.length) return Un(e, r), null;
if (1 === t.length) return t[0];
var n = _n(e.name, r), a = fn.get(n, {
namespace: bn,
ttl: o
});
if (a) {
var i = Game.getObjectById(a);
if (i && t.some(function(e) {
return e.id === i.id;
}) && e.pos.getRangeTo(i.pos) <= 20) return i;
}
var s = e.pos.findClosestByRange(t);
return s ? fn.set(n, s.id, {
namespace: bn,
ttl: o
}) : Un(e, r), s;
}

function Un(e, t) {
if (t) {
var r = _n(e.name, t);
fn.invalidate(r, bn);
} else {
var o = new RegExp("^".concat(e.name, ":"));
fn.invalidatePattern(o, bn);
}
}

function kn(e) {
Un(e);
}

var Mn, An, Nn, In, Pn = function() {
function e() {}
return e.prototype.setLogLevel = function(e) {
var t = {
debug: Ue.DEBUG,
info: Ue.INFO,
warn: Ue.WARN,
error: Ue.ERROR,
none: Ue.NONE
}[e.toLowerCase()];
return void 0 === t ? "Invalid log level: ".concat(e, ". Valid levels: debug, info, warn, error, none") : (Ie({
level: t
}), "Log level set to: ".concat(e.toUpperCase()));
}, e.prototype.toggleDebug = function() {
var e = !sr().debug;
return cr({
debug: e
}), Ie({
level: e ? Ue.DEBUG : Ue.INFO
}), "Debug mode: ".concat(e ? "ENABLED" : "DISABLED", " (Log level: ").concat(e ? "DEBUG" : "INFO", ")");
}, o([ Je({
name: "setLogLevel",
description: "Set the log level for the bot",
usage: "setLogLevel(level)",
examples: [ "setLogLevel('debug')", "setLogLevel('info')", "setLogLevel('warn')", "setLogLevel('error')", "setLogLevel('none')" ],
category: "Logging"
}) ], e.prototype, "setLogLevel", null), o([ Je({
name: "toggleDebug",
description: "Toggle debug mode on/off (affects log level and debug features)",
usage: "toggleDebug()",
examples: [ "toggleDebug()" ],
category: "Logging"
}) ], e.prototype, "toggleDebug", null), e;
}(), Gn = function() {
function e() {}
return e.prototype.listCommands = function() {
return Ze.generateHelp();
}, e.prototype.commandHelp = function(e) {
return Ze.generateCommandHelp(e);
}, o([ Je({
name: "listCommands",
description: "List all available commands (alias for help)",
usage: "listCommands()",
examples: [ "listCommands()" ],
category: "System"
}) ], e.prototype, "listCommands", null), o([ Je({
name: "commandHelp",
description: "Get detailed help for a specific command",
usage: "commandHelp(commandName)",
examples: [ "commandHelp('setLogLevel')", "commandHelp('suspendProcess')" ],
category: "System"
}) ], e.prototype, "commandHelp", null), e;
}(), Ln = function() {
function e() {}
return e.prototype.showConfig = function() {
var e = sr(), t = Pe();
return "=== SwarmBot Config ===\nDebug: ".concat(String(e.debug), "\nProfiling: ").concat(String(e.profiling), "\nVisualizations: ").concat(String(e.visualizations), "\nLogger Level: ").concat(Ue[t.level], "\nCPU Logging: ").concat(String(t.cpuLogging));
}, o([ Je({
name: "showConfig",
description: "Show current bot configuration",
usage: "showConfig()",
examples: [ "showConfig()" ],
category: "Configuration"
}) ], e.prototype, "showConfig", null), e;
}(), Dn = (Mn = "stats", An = function() {
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
return console.log.apply(console, i([ "[".concat(Mn, "]"), e ], a(An.apply(void 0, i([], a(t), !1))), !1));
},
info: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, i([ "[".concat(Mn, "]"), e ], a(An.apply(void 0, i([], a(t), !1))), !1));
},
warn: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, i([ "[".concat(Mn, "] WARN:"), e ], a(An.apply(void 0, i([], a(t), !1))), !1));
},
error: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, i([ "[".concat(Mn, "] ERROR:"), e ], a(An.apply(void 0, i([], a(t), !1))), !1));
}
}), Fn = function(e) {
return {};
};

function Bn(e, t) {
var r = t.roomScaling, o = r.minRooms, n = r.scaleFactor, a = r.maxMultiplier, i = Math.max(e, o), s = 1 + Math.log(i / o) / Math.log(n);
return Math.max(1, Math.min(a, s));
}

function Hn(e, t) {
var r = t.bucketMultipliers, o = r.highThreshold, n = r.lowThreshold, a = r.criticalThreshold, i = r.highMultiplier, s = r.lowMultiplier, c = r.criticalMultiplier;
return e >= o ? i : e < a ? c : e < n ? s : 1;
}

!function(e) {
e.ACTIVE = "active", e.DECAY = "decay", e.INACTIVE = "inactive";
}(Nn || (Nn = {})), function(e) {
e.PHEROMONES = "pheromones", e.PATHS = "paths", e.TARGETS = "targets", e.DEBUG = "debug";
}(In || (In = {}));

var Wn, Yn = new (function() {
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
r({}, this.metrics);
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
}()), Kn = {
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
}, Vn = function() {
function e(e) {
void 0 === e && (e = {}), this.subsystemMeasurements = new Map, this.roomMeasurements = new Map, 
this.lastSegmentUpdate = 0, this.segmentRequested = !1, this.skippedProcessesThisTick = 0, 
this.config = r(r({}, Kn), e), this.currentSnapshot = this.createEmptySnapshot(), 
this.nativeCallsThisTick = this.createEmptyNativeCalls();
}
return e.prototype.initialize = function() {
void 0 === RawMemory.segments[this.config.segmentId] && (RawMemory.setActiveSegments([ this.config.segmentId ]), 
this.segmentRequested = !0), Dn.info("Unified stats system initialized", {
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
this.roomMeasurements.clear(), this.skippedProcessesThisTick = 0, Yn.reset();
}
}, e.prototype.finalizeTick = function() {
var e, t, o, n, a, i, s, c, l, u, m, p, d, f, y, g, h = this;
if (this.config.enabled) {
this.currentSnapshot.cpu = {
used: Game.cpu.getUsed(),
limit: Game.cpu.limit,
bucket: Game.cpu.bucket,
percent: Game.cpu.limit > 0 ? Game.cpu.getUsed() / Game.cpu.limit * 100 : 0,
heapUsed: (null !== (n = null === (o = null === (t = (e = Game.cpu).getHeapStatistics) || void 0 === t ? void 0 : t.call(e)) || void 0 === o ? void 0 : o.used_heap_size) && void 0 !== n ? n : 0) / 1024 / 1024
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
this.finalizePathfindingStats(), this.currentSnapshot.native = r({}, this.nativeCallsThisTick), 
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
Dn.error("CPU Budget: ".concat(E.length, " critical violations detected - ").concat(C), {
subsystem: "CPUBudget"
});
}
if (T.length > 0) {
var S = T.map(function(e) {
var t, r = "room:".concat(e.target), o = h.currentSnapshot.processes[r], n = null !== (t = null == o ? void 0 : o.tickModulo) && void 0 !== t ? t : 1, a = n > 1 ? " [runs every ".concat(n, " ticks]") : "";
return "".concat(e.target, ": ").concat((100 * e.percentUsed).toFixed(1), "%").concat(a);
}).join(", ");
Dn.warn("CPU Budget: ".concat(T.length, " warnings (≥80% of limit) - ").concat(S), {
subsystem: "CPUBudget"
});
}
}
if (R.length > 0) {
var w = R.map(function(e) {
return "".concat(e.target, " (").concat(e.type, "): ").concat(e.current.toFixed(3), " CPU (").concat(e.multiplier.toFixed(1), "x baseline)").concat(e.context ? " - ".concat(e.context) : "");
}).join(", ");
Dn.warn("CPU Anomalies: ".concat(R.length, " detected - ").concat(w), {
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
roomMultiplier: Bn(r, t.adaptiveBudgetConfig),
bucketMultiplier: Hn(o, t.adaptiveBudgetConfig),
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
var r, o, i, s, c, l, u, m, p, d, f, y, g, h, v;
if (this.config.enabled) {
var R = (e.name, {}), E = Object.values(Game.creeps).filter(function(t) {
return t.room.name === e.name;
}).length, T = e.find(FIND_HOSTILE_CREEPS), C = this.currentSnapshot.rooms[e.name];
if (C || (C = {
name: e.name,
rcl: null !== (s = null === (i = e.controller) || void 0 === i ? void 0 : i.level) && void 0 !== s ? s : 0,
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
for (var S = n(Object.entries(R.pheromones)), w = S.next(); !w.done; w = S.next()) {
var O = a(w.value, 2), b = O[0], _ = O[1];
C.pheromones[b] = _;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
w && !w.done && (o = S.return) && o.call(S);
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
var x = this.getProfilerMemory().rooms[e.name];
x && (C.profiler.avgCpu = x.avgCpu * (1 - this.config.smoothingFactor) + t * this.config.smoothingFactor, 
C.profiler.peakCpu = Math.max(x.peakCpu, t), C.profiler.samples = x.samples + 1), 
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
for (var i = n(Object.entries(this.currentSnapshot.rooms)), s = i.next(); !s.done; s = i.next()) {
var c = a(s.value, 2), l = c[0], u = c[1];
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
s && !s.done && (t = i.return) && t.call(i);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.detectAnomalies = function() {
var e, t, r, o, i, s, c, l;
if (!this.config.anomalyDetection.enabled) return [];
var u = [];
try {
for (var m = n(Object.entries(this.currentSnapshot.rooms)), p = m.next(); !p.done; p = m.next()) {
var d = a(p.value, 2), f = d[0], y = d[1];
if (!(y.profiler.samples < this.config.anomalyDetection.minSamples)) {
var g = null !== (i = this.roomMeasurements.get(f)) && void 0 !== i ? i : 0;
if (!((O = y.profiler.avgCpu) < .01)) {
var h = g / O;
if (h >= this.config.anomalyDetection.spikeThreshold) {
var v = Fn(), R = v ? "RCL ".concat(null !== (l = null === (c = null === (s = Game.rooms[f]) || void 0 === s ? void 0 : s.controller) || void 0 === c ? void 0 : c.level) && void 0 !== l ? l : 0, ", posture: ").concat(v.posture, ", danger: ").concat(v.danger) : void 0;
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
for (var E = n(Object.entries(this.currentSnapshot.processes)), T = E.next(); !T.done; T = E.next()) {
var C = a(T.value, 2), S = C[0], w = C[1];
if (!(w.runCount < this.config.anomalyDetection.minSamples)) {
g = w.maxCpu;
var O = w.avgCpu;
if (!(Game.time - w.lastRunTick > 100 || O < .01) && (g >= O * this.config.anomalyDetection.spikeThreshold && u.push({
type: "spike",
target: S,
targetType: "process",
current: g,
baseline: O,
multiplier: g / O,
tick: Game.time,
context: "".concat(w.name, " (").concat(w.frequency, ")")
}), w.cpuBudget > 0)) {
var b = O / w.cpuBudget;
b >= 1.5 && u.push({
type: "sustained_high",
target: S,
targetType: "process",
current: O,
baseline: w.cpuBudget,
multiplier: b,
tick: Game.time,
context: "".concat(w.name, " (").concat(w.frequency, ")")
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
var e, t, r, o, i, s, c, l, u, m = this.getProfilerMemory(), p = function(e, t) {
var a, p, f = t.reduce(function(e, t) {
return e + t;
}, 0), y = e.startsWith("role:"), g = y ? e.substring(5) : e;
if (y) {
var h = Object.values(Game.creeps).filter(function(e) {
return e.memory.role === g;
}), v = h.length, R = 0, E = 0, T = 0, C = 0, S = 0;
try {
for (var w = (a = void 0, n(h)), O = w.next(); !O.done; O = w.next()) {
var b = O.value, _ = b.memory, x = null !== (o = null === (r = _.state) || void 0 === r ? void 0 : r.action) && void 0 !== o ? o : "idle", U = null !== (i = _.working) && void 0 !== i ? i : "idle" !== x;
S += b.body.length, C += null !== (s = b.ticksToLive) && void 0 !== s ? s : 0, b.spawning ? R++ : U && "idle" !== x ? T++ : E++;
}
} catch (e) {
a = {
error: e
};
} finally {
try {
O && !O.done && (p = w.return) && p.call(w);
} finally {
if (a) throw a.error;
}
}
var k = t.length > 0 ? f / t.length : 0, M = (N = null === (c = m.roles) || void 0 === c ? void 0 : c[g]) ? N.avgCpu * (1 - d.config.smoothingFactor) + k * d.config.smoothingFactor : k, A = N ? Math.max(N.peakCpu, k) : k;
d.currentSnapshot.roles[g] = {
name: g,
count: v,
avgCpu: M,
peakCpu: A,
calls: t.length,
samples: (null !== (l = null == N ? void 0 : N.samples) && void 0 !== l ? l : 0) + 1,
spawningCount: R,
idleCount: E,
activeCount: T,
avgTicksToLive: v > 0 ? C / v : 0,
totalBodyParts: S
}, m.roles || (m.roles = {}), m.roles[g] = {
avgCpu: M,
peakCpu: A,
samples: d.currentSnapshot.roles[g].samples,
callsThisTick: t.length
};
} else {
var N;
M = (N = m.subsystems[g]) ? N.avgCpu * (1 - d.config.smoothingFactor) + f * d.config.smoothingFactor : f, 
A = N ? Math.max(N.peakCpu, f) : f, d.currentSnapshot.subsystems[g] = {
name: g,
avgCpu: M,
peakCpu: A,
calls: t.length,
samples: (null !== (u = null == N ? void 0 : N.samples) && void 0 !== u ? u : 0) + 1
}, m.subsystems[g] = {
avgCpu: M,
peakCpu: A,
samples: d.currentSnapshot.subsystems[g].samples,
callsThisTick: t.length
};
}
}, d = this;
try {
for (var f = n(this.subsystemMeasurements), y = f.next(); !y.done; y = f.next()) {
var g = a(y.value, 2);
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
var e, t, r, o, a, i, s;
try {
for (var c = n(Object.values(Game.creeps)), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (!this.currentSnapshot.creeps[u.name]) {
var m = u.memory, p = null !== (o = null === (r = m.state) || void 0 === r ? void 0 : r.action) && void 0 !== o ? o : m.working ? "working" : "idle";
this.currentSnapshot.creeps[u.name] = {
name: u.name,
role: null !== (a = m.role) && void 0 !== a ? a : "unknown",
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
this.currentSnapshot.pathfinding = Yn.getMetrics();
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
var e, t, o, i, s, c, l, u, m, p, d = Memory, f = this.currentSnapshot;
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
for (var y = n(Object.entries(f.rooms)), g = y.next(); !g.done; g = y.next()) {
var h = a(g.value, 2), v = h[0], R = h[1];
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
pheromones: r({}, R.pheromones),
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
for (var E = n(Object.entries(f.subsystems)), T = E.next(); !T.done; T = E.next()) {
var C = a(T.value, 2), S = C[0], w = C[1];
d.stats.subsystems[S] = {
avg_cpu: w.avgCpu,
peak_cpu: w.peakCpu,
calls: w.calls,
samples: w.samples
};
}
} catch (e) {
o = {
error: e
};
} finally {
try {
T && !T.done && (i = E.return) && i.call(E);
} finally {
if (o) throw o.error;
}
}
try {
for (var O = n(Object.entries(f.roles)), b = O.next(); !b.done; b = O.next()) {
var _ = a(b.value, 2), x = (S = _[0], _[1]);
d.stats.roles[S] = {
count: x.count,
avg_cpu: x.avgCpu,
peak_cpu: x.peakCpu,
calls: x.calls,
samples: x.samples,
spawning_count: x.spawningCount,
idle_count: x.idleCount,
active_count: x.activeCount,
avg_ticks_to_live: x.avgTicksToLive,
total_body_parts: x.totalBodyParts
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
for (var U = n(Object.entries(f.processes)), k = U.next(); !k.done; k = U.next()) {
var M = a(k.value, 2), A = M[0], N = M[1];
d.stats.processes[A] = {
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
k && !k.done && (u = U.return) && u.call(U);
} finally {
if (l) throw l.error;
}
}
d.stats.creeps = {};
try {
for (var I = n(Object.entries(f.creeps)), P = I.next(); !P.done; P = I.next()) {
var G = a(P.value, 2), L = (S = G[0], G[1]);
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
Dn.error("Failed to parse stats segment: ".concat(n), {
subsystem: "Stats"
});
}
t.push(this.currentSnapshot), t.length > this.config.maxHistoryPoints && (t = t.slice(-this.config.maxHistoryPoints));
var a = JSON.stringify(t);
if (a.length > e) {
for (Dn.warn("Stats segment size ".concat(a.length, " exceeds ").concat(e, " bytes, trimming history"), {
subsystem: "Stats"
}); a.length > e && t.length > 1; ) t.shift(), a = JSON.stringify(t);
if (a.length > e) return void Dn.error("Failed to persist stats segment within ".concat(e, " bytes after trimming"), {
subsystem: "Stats"
});
}
try {
RawMemory.segments[this.config.segmentId] = a;
} catch (e) {
n = e instanceof Error ? e.message : String(e), Dn.error("Failed to save stats segment: ".concat(n), {
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
var e, t, r, o, a, i, s, c, l, u, m = this.currentSnapshot;
Dn.info("=== Unified Stats Summary ==="), Dn.info("CPU: ".concat(m.cpu.used.toFixed(2), "/").concat(m.cpu.limit, " (").concat(m.cpu.percent.toFixed(1), "%) | Bucket: ").concat(m.cpu.bucket)), 
Dn.info("Empire: ".concat(m.empire.rooms, " rooms, ").concat(m.empire.creeps, " creeps, ").concat(m.empire.credits, " credits"));
var p = Object.values(m.subsystems).sort(function(e, t) {
return t.avgCpu - e.avgCpu;
}).slice(0, 5);
if (p.length > 0) {
Dn.info("Top Subsystems:");
try {
for (var d = n(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
Dn.info("  ".concat(y.name, ": ").concat(y.avgCpu.toFixed(3), " CPU"));
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
Dn.info("Top Roles:");
try {
for (var h = n(g), v = h.next(); !v.done; v = h.next()) {
var R = v.value;
Dn.info("  ".concat(R.name, ": ").concat(R.count, " creeps, ").concat(R.avgCpu.toFixed(3), " CPU"));
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
Dn.info("Top Processes:");
try {
for (var T = n(E), C = T.next(); !C.done; C = T.next()) {
var S = C.value;
Dn.info("  ".concat(S.name, ": ").concat(S.avgCpu.toFixed(3), " CPU (runs: ").concat(S.runCount, ", state: ").concat(S.state, ")"));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
C && !C.done && (i = T.return) && i.call(T);
} finally {
if (a) throw a.error;
}
}
}
var w = Object.values(m.rooms).sort(function(e, t) {
return t.profiler.avgCpu - e.profiler.avgCpu;
}).slice(0, 5);
if (w.length > 0) {
Dn.info("Top Rooms by CPU:");
try {
for (var O = n(w), b = O.next(); !b.done; b = O.next()) {
var _ = b.value;
Dn.info("  ".concat(_.name, ": ").concat(_.profiler.avgCpu.toFixed(3), " CPU (RCL ").concat(_.rcl, ")"));
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
var x = Object.values(m.creeps).sort(function(e, t) {
return t.cpu - e.cpu;
}).slice(0, 5);
if (x.length > 0) {
Dn.info("Top Creeps by CPU:");
try {
for (var U = n(x), k = U.next(); !k.done; k = U.next()) {
var M = k.value;
Dn.info("  ".concat(M.name, " (").concat(M.role, "): ").concat(M.cpu.toFixed(3), " CPU in ").concat(M.currentRoom));
}
} catch (e) {
l = {
error: e
};
} finally {
try {
k && !k.done && (u = U.return) && u.call(U);
} finally {
if (l) throw l.error;
}
}
}
this.config.trackNativeCalls && Dn.info("Native calls: ".concat(m.native.total, " total"));
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
return r({}, this.currentSnapshot);
}, e.POSTURE_NAMES = [ "eco", "expand", "defensive", "war", "siege", "evacuate", "nukePrep" ], 
e;
}(), jn = new Vn, zn = {
primarySegment: 90,
backupSegment: 91,
retentionPeriod: 1e4,
updateInterval: 50,
maxDataPoints: 1e3
}, qn = function() {
function e(e) {
void 0 === e && (e = {}), this.statsData = null, this.segmentRequested = !1, this.lastUpdate = 0, 
this.config = r(r({}, zn), e);
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
this.statsData = JSON.parse(e), Dn.debug("Loaded stats from segment", {
subsystem: "Stats"
});
} catch (e) {
var t = e instanceof Error ? e.message : String(e);
Dn.error("Failed to parse stats segment: ".concat(t), {
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
var t, r, o, i, s = Memory;
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
for (var u = n(e.rooms), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = "stats.room.".concat(p.roomName);
c["".concat(d, ".rcl")] = p.rcl, c["".concat(d, ".energy.available")] = p.energyAvailable, 
c["".concat(d, ".energy.capacity")] = p.energyCapacity, c["".concat(d, ".storage.energy")] = p.storageEnergy, 
c["".concat(d, ".terminal.energy")] = p.terminalEnergy, c["".concat(d, ".creeps")] = p.creepCount, 
c["".concat(d, ".controller.progress")] = p.controllerProgress, c["".concat(d, ".controller.progress_total")] = p.controllerProgressTotal, 
c["".concat(d, ".controller.progress_percent")] = p.controllerProgressTotal > 0 ? p.controllerProgress / p.controllerProgressTotal * 100 : 0;
var f = Fn(p.roomName);
if (f) {
if (c["".concat(d, ".brain.danger")] = f.danger, c["".concat(d, ".brain.posture_code")] = this.postureToCode(f.posture), 
c["".concat(d, ".brain.colony_level_code")] = this.colonyLevelToCode(f.colonyLevel), 
f.pheromones) try {
for (var y = (o = void 0, n(Object.entries(f.pheromones))), g = y.next(); !g.done; g = y.next()) {
var h = a(g.value, 2), v = h[0], R = h[1];
c["".concat(d, ".pheromone.").concat(v)] = R;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (i = y.return) && i.call(y);
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
r.data.length > 0 && (r.min = Math.min.apply(Math, i([], a(r.data.map(function(e) {
return e.value;
})), !1)), r.max = Math.max.apply(Math, i([], a(r.data.map(function(e) {
return e.value;
})), !1)), r.avg = r.data.reduce(function(e, t) {
return e + t.value;
}, 0) / r.data.length);
}
}, e.prototype.saveToSegment = function() {
var e, t, r, o;
if (this.statsData) {
var a = 102400;
try {
this.statsData.lastUpdate = Game.time;
var i = JSON.stringify(this.statsData);
if (i.length > a) {
for (Dn.warn("Stats data exceeds segment limit: ".concat(i.length, " bytes, trimming..."), {
subsystem: "Stats"
}); i.length > a && this.statsData.history.length > 10; ) this.statsData.history.shift(), 
i = JSON.stringify(this.statsData);
if (i.length > a) try {
for (var s = n(Object.keys(this.statsData.series)), c = s.next(); !c.done; c = s.next()) for (var l = c.value, u = this.statsData.series[l]; u.data.length > 10 && i.length > a; ) u.data.shift(), 
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
if (i.length > a) {
Dn.warn("Stats data still exceeds limit after trimming, clearing history", {
subsystem: "Stats"
}), this.statsData.history = this.statsData.history.slice(-5);
try {
for (var m = n(Object.keys(this.statsData.series)), p = m.next(); !p.done; p = m.next()) l = p.value, 
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
Dn.error("Failed to save stats segment: ".concat(d), {
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
for (var a = n(r.rooms), i = a.next(); !i.done; i = a.next()) {
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
i && !i.done && (t = a.return) && t.call(a);
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
}(), Xn = new qn;

function Qn(e) {
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

function Zn(e) {
return Qn(e), e._metrics;
}

function Jn(e, t) {
Zn(e).damageDealt += t;
}

function $n(e) {
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
}(Wn || (Wn = {}));

var ea, ta = (ea = "VisualizationManager", {
info: function(e, t) {
t ? console.log("[".concat(ea, "] ").concat(e), $n(t)) : console.log("[".concat(ea, "] ").concat(e));
},
warn: function(e, t) {
t ? console.log("[".concat(ea, "] WARN: ").concat(e), $n(t)) : console.log("[".concat(ea, "] WARN: ").concat(e));
},
error: function(e, t) {
t ? console.log("[".concat(ea, "] ERROR: ").concat(e), $n(t)) : console.log("[".concat(ea, "] ERROR: ").concat(e));
},
debug: function(e, t) {
t ? console.log("[".concat(ea, "] DEBUG: ").concat(e), $n(t)) : console.log("[".concat(ea, "] DEBUG: ").concat(e));
}
}), ra = function() {
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
enabledLayers: Wn.Pheromones | Wn.Defense,
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
this.config.enabledLayers = Wn.Pheromones | Wn.Paths | Wn.Traffic | Wn.Defense | Wn.Economy | Wn.Construction | Wn.Performance;
break;

case "presentation":
this.config.enabledLayers = Wn.Pheromones | Wn.Defense | Wn.Economy;
break;

case "minimal":
this.config.enabledLayers = Wn.Defense;
break;

case "performance":
this.config.enabledLayers = Wn.None;
}
this.saveConfig(), ta.info("Visualization mode set to: ".concat(e));
}, e.prototype.updateFromFlags = function() {
var e, t, r = Game.flags, o = {
viz_pheromones: Wn.Pheromones,
viz_paths: Wn.Paths,
viz_traffic: Wn.Traffic,
viz_defense: Wn.Defense,
viz_economy: Wn.Economy,
viz_construction: Wn.Construction,
viz_performance: Wn.Performance
}, i = function(e, t) {
Object.values(r).some(function(t) {
return t.name === e;
}) && !s.isLayerEnabled(t) && (s.enableLayer(t), ta.info("Enabled layer ".concat(Wn[t], " via flag")));
}, s = this;
try {
for (var c = n(Object.entries(o)), l = c.next(); !l.done; l = c.next()) {
var u = a(l.value, 2);
i(u[0], u[1]);
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
a > 10 && ta.warn("Visualization using ".concat(a.toFixed(1), "% of CPU budget"));
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
return r({}, this.config);
}, e.prototype.getPerformanceMetrics = function() {
var e = Game.cpu.limit;
return {
totalCost: this.config.totalCost,
layerCosts: r({}, this.config.layerCosts),
percentOfBudget: this.config.totalCost / e * 100
};
}, e.prototype.measureCost = function(e) {
var t = Game.cpu.getUsed();
return {
result: e(),
cost: Game.cpu.getUsed() - t
};
}, e;
}(), oa = null, na = (null === oa && (oa = new ra), oa), aa = {
showPheromones: !0,
showPaths: !1,
showCombat: !0,
showResourceFlow: !1,
showSpawnQueue: !0,
showRoomStats: !0,
showStructures: !1,
opacity: .5
}, ia = {
expand: "#00ff00",
harvest: "#ffff00",
build: "#ff8800",
upgrade: "#0088ff",
defense: "#ff0000",
war: "#ff00ff",
siege: "#880000",
logistics: "#00ffff",
nukeTarget: "#ff0088"
}, sa = function() {
function e(e, t) {
void 0 === e && (e = {}), this.config = r(r({}, aa), e), this.memoryManager = t;
}
return e.prototype.setMemoryManager = function(e) {
this.memoryManager = e;
}, e.prototype.draw = function(e) {
var t, r = this, o = new RoomVisual(e.name), n = null === (t = this.memoryManager) || void 0 === t ? void 0 : t.getOrInitSwarmState(e.name);
if (na.updateFromFlags(), this.config.showRoomStats && this.drawRoomStats(o, e, n), 
this.config.showPheromones && na.isLayerEnabled(Wn.Pheromones) && n) {
var a = na.measureCost(function() {
r.drawPheromoneBars(o, n), r.drawPheromoneHeatmap(o, n);
}).cost;
na.trackLayerCost("pheromones", a);
}
this.config.showCombat && na.isLayerEnabled(Wn.Defense) && (a = na.measureCost(function() {
r.drawCombatInfo(o, e);
}).cost, na.trackLayerCost("defense", a)), this.config.showSpawnQueue && this.drawSpawnQueue(o, e), 
this.config.showResourceFlow && na.isLayerEnabled(Wn.Economy) && (a = na.measureCost(function() {
r.drawResourceFlow(o, e);
}).cost, na.trackLayerCost("economy", a)), this.config.showPaths && na.isLayerEnabled(Wn.Paths) && (a = na.measureCost(function() {
r.drawTrafficPaths(o, e);
}).cost, na.trackLayerCost("paths", a)), this.config.showStructures && na.isLayerEnabled(Wn.Construction) && (a = na.measureCost(function() {
r.drawEnhancedStructures(o, e);
}).cost, na.trackLayerCost("construction", a)), (null == n ? void 0 : n.collectionPoint) && this.drawCollectionPoint(o, n), 
na.isLayerEnabled(Wn.Performance) && this.drawPerformanceMetrics(o);
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
var r, o, i, s = .5;
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
for (var c = n(Object.entries(t.pheromones)), l = c.next(); !l.done; l = c.next()) {
var u = a(l.value, 2), m = u[0], p = u[1], d = null !== (i = ia[m]) && void 0 !== i ? i : "#888888", f = 6 * Math.min(1, p / 100);
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
var o, i, s;
if (r.pheromones) {
var c = null, l = e.HEATMAP_MIN_THRESHOLD;
try {
for (var u = n(Object.entries(r.pheromones)), m = u.next(); !m.done; m = u.next()) {
var p = a(m.value, 2), d = p[0], f = p[1];
f > l && (l = f, c = d);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
m && !m.done && (i = u.return) && i.call(u);
} finally {
if (o) throw o.error;
}
}
if (c && !(l < e.HEATMAP_MIN_THRESHOLD)) {
var y = null !== (s = ia[c]) && void 0 !== s ? s : "#888888", g = .15 * Math.min(1, l / 100);
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
var r, o, a, i, s = t.find(FIND_HOSTILE_CREEPS);
try {
for (var c = n(s), l = c.next(); !l.done; l = c.next()) {
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
for (var g = n(y), h = g.next(); !h.done; h = g.next()) {
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
a = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (a) throw a.error;
}
}
}
}, e.prototype.calculateCreepThreat = function(e) {
var t, r, o = 0;
try {
for (var a = n(e.body), i = a.next(); !i.done; i = a.next()) {
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
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
return o;
}, e.prototype.drawSpawnQueue = function(e, t) {
var r, o, a, i = t.find(FIND_MY_SPAWNS);
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
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
var f = null == u ? void 0 : u.memory, y = null !== (a = null == f ? void 0 : f.role) && void 0 !== a ? a : l.spawning.name;
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
var r, o, a, i, s, c, l, u, m = t.storage;
if (m) {
var p = t.find(FIND_SOURCES);
try {
for (var d = n(p), f = d.next(); !f.done; f = d.next()) {
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
for (var R = n(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
T.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.drawFlowingArrow(e, m.pos, T.pos, "#00ff00", .3);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
E && !E.done && (i = R.return) && i.call(R);
} finally {
if (a) throw a.error;
}
}
var C = t.controller;
if (C && this.drawFlowingArrow(e, m.pos, C.pos, "#00ffff", .3), m.store.getUsedCapacity() > 0) {
var S = .8, w = -.8, O = Object.keys(m.store).filter(function(e) {
return m.store[e] > 1e3;
}).sort(function(e, t) {
return m.store[t] - m.store[e];
}).slice(0, 3);
try {
for (var b = n(O), _ = b.next(); !_.done; _ = b.next()) {
var x = _.value;
e.resource(x, m.pos.x + S, m.pos.y + w, .3), S += .6;
}
} catch (e) {
s = {
error: e
};
} finally {
try {
_ && !_.done && (c = b.return) && c.call(b);
} finally {
if (s) throw s.error;
}
}
}
var U = t.terminal;
if (U && U.store.getUsedCapacity() > 0) {
S = .8, w = -.8, O = Object.keys(U.store).filter(function(e) {
return U.store[e] > 1e3;
}).sort(function(e, t) {
return U.store[t] - U.store[e];
}).slice(0, 3);
try {
for (var k = n(O), M = k.next(); !M.done; M = k.next()) x = M.value, e.resource(x, U.pos.x + S, U.pos.y + w, .3), 
S += .6;
} catch (e) {
l = {
error: e
};
} finally {
try {
M && !M.done && (u = k.return) && u.call(k);
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
var r, o, a, i, s, c, l = na.getCachedStructures(t.name);
if (l) try {
for (var u = n(l), m = u.next(); !m.done; m = u.next()) {
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
for (var g = n(f), h = g.next(); !h.done; h = g.next()) {
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
a = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (a) throw a.error;
}
}
na.cacheStructures(t.name, y);
}
var R = t.find(FIND_MY_CONSTRUCTION_SITES);
try {
for (var E = n(R), T = E.next(); !T.done; T = E.next()) {
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
var t, r, o = na.getPerformanceMetrics(), i = .5, s = 7.5, c = .5;
e.rect(0, 7, 10, 5.5, {
fill: "#000000",
opacity: .8,
stroke: "#ffff00",
strokeWidth: .05
}), e.text("Visualization Performance", i, s, {
align: "left",
font: "0.5 monospace",
color: "#ffff00"
}), s += c;
var l = o.percentOfBudget > 10 ? "#ff0000" : "#00ff00";
e.text("Total: ".concat(o.totalCost.toFixed(3), " CPU"), i, s, {
align: "left",
font: "0.4 monospace",
color: l
}), s += c, e.text("(".concat(o.percentOfBudget.toFixed(1), "% of budget)"), i, s, {
align: "left",
font: "0.35 monospace",
color: l
}), s += c, e.text("Layer Costs:", i, s, {
align: "left",
font: "0.4 monospace",
color: "#ffffff"
}), s += c;
try {
for (var u = n(Object.entries(o.layerCosts)), m = u.next(); !m.done; m = u.next()) {
var p = a(m.value, 2), d = p[0], f = p[1];
f > 0 && (e.text("  ".concat(d, ": ").concat(f.toFixed(3)), i, s, {
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
var r, o, a = t.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
});
try {
for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
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
for (var a = n(t), i = a.next(); !i.done; i = a.next()) {
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
i && !i.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.setConfig = function(e) {
this.config = r(r({}, this.config), e);
}, e.prototype.getConfig = function() {
return r({}, this.config);
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

new sa;

var ca = {
showRoomStatus: !0,
showConnections: !0,
showThreats: !0,
showExpansion: !1,
showResourceFlow: !1,
showHighways: !1,
opacity: .6
}, la = [ "#00ff00", "#ffff00", "#ff8800", "#ff0000" ], ua = {
eco: "#00ff00",
expand: "#00ffff",
defense: "#ffff00",
war: "#ff8800",
siege: "#ff0000",
evacuate: "#ff00ff"
}, ma = function() {
function e(e, t) {
void 0 === e && (e = {}), this.config = r(r({}, ca), e), this.memoryManager = t;
}
return e.prototype.setMemoryManager = function(e) {
this.memoryManager = e;
}, e.prototype.draw = function() {
var e = Game.map.visual;
this.config.showRoomStatus && this.drawRoomStatus(e), this.config.showConnections && this.drawConnections(e), 
this.config.showThreats && this.drawThreats(e), this.config.showExpansion && this.drawExpansionCandidates(e), 
this.config.showResourceFlow && this.drawResourceFlow(e), this.config.showHighways && this.drawHighways(e);
}, e.prototype.drawRoomStatus = function(e) {
var t, r, o, a, i, s;
try {
for (var c = n(Object.values(Game.rooms)), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (null === (o = u.controller) || void 0 === o ? void 0 : o.my) {
var m = null === (a = this.memoryManager) || void 0 === a ? void 0 : a.getOrInitSwarmState(u.name), p = u.controller.level, d = (null == m ? void 0 : m.danger) ? Math.min(Math.max(m.danger, 0), 3) : 0, f = null !== (i = la[d]) && void 0 !== i ? i : "#ffffff", y = {
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
var g = null !== (s = ua[m.posture]) && void 0 !== s ? s : "#ffffff";
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
var t, r, o, a, i = function(t) {
var r, i, c, l;
if (!(null === (o = t.controller) || void 0 === o ? void 0 : o.my)) return "continue";
var u = null === (a = s.memoryManager) || void 0 === a ? void 0 : a.getOrInitSwarmState(t.name);
if (!u) return "continue";
if (u.remoteAssignments && u.remoteAssignments.length > 0) try {
for (var m = (r = void 0, n(u.remoteAssignments)), p = m.next(); !p.done; p = m.next()) {
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
for (var h = (c = void 0, n(g)), v = h.next(); !v.done; v = h.next()) {
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
for (var c = n(Object.values(Game.rooms)), l = c.next(); !l.done; l = c.next()) i(l.value);
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
for (var o = n(Object.values(Game.rooms)), a = o.next(); !a.done; a = o.next()) {
var i = a.value, s = i.find(FIND_HOSTILE_CREEPS), c = i.find(FIND_HOSTILE_STRUCTURES);
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
a && !a.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawExpansionCandidates = function(e) {
var t, r, o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), a = function(t) {
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
for (var s = n(Object.values(Game.rooms)), c = s.next(); !c.done; c = s.next()) a(c.value);
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
for (var a = n(o), i = a.next(); !i.done; i = a.next()) {
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
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawHighways = function(e) {
var t, r;
try {
for (var o = n(Object.values(Game.rooms)), a = o.next(); !a.done; a = o.next()) {
var i = a.value, s = i.name.match(/[WE](\d+)[NS](\d+)/);
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
a && !a.done && (r = o.return) && r.call(o);
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
this.config = r(r({}, this.config), e);
}, e.prototype.getConfig = function() {
return r({}, this.config);
}, e.prototype.toggle = function(e) {
var t = this.config[e];
"boolean" == typeof t && (this.config[e] = !t);
}, e;
}();

new ma;

var pa, da = "#555555", fa = "#AAAAAA", ya = "#FFE87B", ga = "#F53547", ha = "#181818", va = "#8FBB93", Ra = !1;

"undefined" == typeof RoomVisual || Ra || (Ra = !0, RoomVisual.prototype.structure = function(e, t, o, n) {
void 0 === n && (n = {});
var a = r({
opacity: 1
}, n);
switch (o) {
case STRUCTURE_EXTENSION:
this.circle(e, t, {
radius: .5,
fill: ha,
stroke: va,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: da,
opacity: a.opacity
});
break;

case STRUCTURE_SPAWN:
this.circle(e, t, {
radius: .65,
fill: ha,
stroke: "#CCCCCC",
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: ya,
opacity: a.opacity
});
break;

case STRUCTURE_POWER_SPAWN:
this.circle(e, t, {
radius: .65,
fill: ha,
stroke: ga,
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: ya,
opacity: a.opacity
});
break;

case STRUCTURE_TOWER:
this.circle(e, t, {
radius: .6,
fill: ha,
stroke: va,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: da,
opacity: a.opacity
}), this.rect(e - .2, t - .3, .4, .6, {
fill: fa,
opacity: a.opacity
});
break;

case STRUCTURE_STORAGE:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: va,
strokeWidth: .05,
fill: ha,
opacity: a.opacity
}), this.rect(e - .35, t - .45, .7, .9, {
fill: ya,
opacity: .6 * a.opacity
});
break;

case STRUCTURE_TERMINAL:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: va,
strokeWidth: .05,
fill: ha,
opacity: a.opacity
}), this.circle(e, t, {
radius: .3,
fill: fa,
opacity: a.opacity
}), this.rect(e - .15, t - .15, .3, .3, {
fill: da,
opacity: a.opacity
});
break;

case STRUCTURE_LAB:
this.circle(e, t, {
radius: .55,
fill: ha,
stroke: va,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: da,
opacity: a.opacity
}), this.rect(e - .15, t + .1, .3, .25, {
fill: fa,
opacity: a.opacity
});
break;

case STRUCTURE_LINK:
this.circle(e, t, {
radius: .5,
fill: ha,
stroke: va,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: fa,
opacity: a.opacity
});
break;

case STRUCTURE_NUKER:
this.circle(e, t, {
radius: .65,
fill: ha,
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
fill: ha,
stroke: va,
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
fill: ha,
stroke: va,
strokeWidth: .05,
opacity: a.opacity
}), this.rect(e - .35, t - .35, .7, .7, {
fill: "transparent",
stroke: da,
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
fill: ha,
stroke: fa,
strokeWidth: .05,
opacity: a.opacity
});
break;

case STRUCTURE_EXTRACTOR:
this.circle(e, t, {
radius: .6,
fill: ha,
stroke: va,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: da,
opacity: a.opacity
});
break;

default:
this.circle(e, t, {
radius: .5,
fill: da,
stroke: va,
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
var i = null !== (a = ((n = {})[RESOURCE_ENERGY] = ya, n[RESOURCE_POWER] = ga, n[RESOURCE_HYDROGEN] = "#FFFFFF", 
n[RESOURCE_OXYGEN] = "#DDDDDD", n[RESOURCE_UTRIUM] = "#48C5E5", n[RESOURCE_LEMERGIUM] = "#24D490", 
n[RESOURCE_KEANIUM] = "#9269EC", n[RESOURCE_ZYNTHIUM] = "#D9B478", n[RESOURCE_CATALYST] = "#F26D6F", 
n[RESOURCE_GHODIUM] = "#FFFFFF", n)[e]) && void 0 !== a ? a : "#CCCCCC";
this.circle(t, r, {
radius: o,
fill: ha,
opacity: .9
}), this.circle(t, r, {
radius: .8 * o,
fill: i,
opacity: .8
});
var s = e.length <= 2 ? e : e.substring(0, 2).toUpperCase();
this.text(s, t, r + .03, {
color: ha,
font: "".concat(1.2 * o, " monospace"),
align: "center",
opacity: .9
});
});

var Ea = de("CreepContext"), Ta = ((pa = {})[STRUCTURE_SPAWN] = 100, pa[STRUCTURE_EXTENSION] = 90, 
pa[STRUCTURE_TOWER] = 80, pa[STRUCTURE_RAMPART] = 75, pa[STRUCTURE_WALL] = 70, pa[STRUCTURE_STORAGE] = 70, 
pa[STRUCTURE_CONTAINER] = 60, pa[STRUCTURE_ROAD] = 30, pa), Ca = new Map;

function Sa(e) {
e._allStructuresLoaded || (e.allStructures = e.room.find(FIND_STRUCTURES), e._allStructuresLoaded = !0);
}

function wa(e) {
return void 0 === e._prioritizedSites && (e._prioritizedSites = e.room.find(FIND_MY_CONSTRUCTION_SITES).sort(function(e, t) {
var r, o, n = null !== (r = Ta[e.structureType]) && void 0 !== r ? r : 50;
return (null !== (o = Ta[t.structureType]) && void 0 !== o ? o : 50) - n;
})), e._prioritizedSites;
}

function Oa(e) {
return void 0 === e._repairTargets && (Sa(e), e._repairTargets = e.allStructures.filter(function(e) {
return e.hits < .75 * e.hitsMax && e.structureType !== STRUCTURE_WALL;
})), e._repairTargets;
}

function ba(e) {
var t, r, o = e.room, a = e.memory, i = function(e) {
var t = Ca.get(e.name);
if (t && t.tick === Game.time) return t;
var r = {
tick: Game.time,
room: e,
hostiles: Wo(e, FIND_HOSTILE_CREEPS),
myStructures: e.find(FIND_MY_STRUCTURES),
allStructures: []
};
return Ca.set(e.name, r), r;
}(o);
void 0 === a.working && (a.working = e.store.getUsedCapacity() > 0, Ea.debug("".concat(e.name, " initialized working=").concat(a.working, " from carry state"), {
creep: e.name
}));
var s = null !== (t = a.homeRoom) && void 0 !== t ? t : o.name;
return {
creep: e,
room: o,
memory: a,
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
}(a.squadId);
},
homeRoom: s,
isInHomeRoom: o.name === s,
isFull: 0 === e.store.getFreeCapacity(),
isEmpty: 0 === e.store.getUsedCapacity(),
isWorking: null !== (r = a.working) && void 0 !== r && r,
get assignedSource() {
return function(e) {
return e.sourceId ? Game.getObjectById(e.sourceId) : null;
}(a);
},
get assignedMineral() {
var e;
return null !== (e = function(e) {
return void 0 === e._minerals && (e._minerals = e.room.find(FIND_MINERALS)), e._minerals;
}(i)[0]) && void 0 !== e ? e : null;
},
get energyAvailable() {
return function(e) {
return void 0 === e._activeSources && (e._activeSources = e.room.find(FIND_SOURCES_ACTIVE)), 
e._activeSources;
}(i).length > 0;
},
get nearbyEnemies() {
return i.hostiles.length > 0 && function(e, t) {
var r, o;
try {
for (var a = n(t), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Math.abs(e.x - s.pos.x), l = Math.abs(e.y - s.pos.y);
if (Math.max(c, l) <= 10) return !0;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
i && !i.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
return !1;
}(e.pos, i.hostiles);
},
get constructionSiteCount() {
return wa(i).length;
},
get damagedStructureCount() {
return Oa(i).length;
},
get droppedResources() {
return function(e) {
return void 0 === e._droppedResources && (e._droppedResources = e.room.find(FIND_DROPPED_RESOURCES, {
filter: function(e) {
return e.resourceType === RESOURCE_ENERGY && e.amount > 50 || e.resourceType !== RESOURCE_ENERGY && e.amount > 0;
}
})), e._droppedResources;
}(i);
},
get containers() {
return function(e) {
return void 0 === e._containers && (Sa(e), e._containers = e.allStructures.filter(function(e) {
return e.structureType === STRUCTURE_CONTAINER;
})), e._containers;
}(i);
},
get depositContainers() {
return function(e) {
return void 0 === e._depositContainers && (Sa(e), e._depositContainers = e.allStructures.filter(function(e) {
return e.structureType === STRUCTURE_CONTAINER;
})), e._depositContainers;
}(i);
},
get spawnStructures() {
return function(e) {
return void 0 === e._spawnStructures && (e._spawnStructures = e.myStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_EXTENSION;
})), e._spawnStructures;
}(i);
},
get towers() {
return function(e) {
return void 0 === e._towers && (e._towers = e.myStructures.filter(function(e) {
return e.structureType === STRUCTURE_TOWER;
})), e._towers;
}(i);
},
storage: o.storage,
terminal: o.terminal,
hostiles: i.hostiles,
get damagedAllies() {
return function(e) {
return void 0 === e._damagedAllies && (e._damagedAllies = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
return e.hits < e.hitsMax;
}
})), e._damagedAllies;
}(i);
},
get prioritizedSites() {
return wa(i);
},
get repairTargets() {
return Oa(i);
},
get labs() {
return function(e) {
return void 0 === e._labs && (e._labs = e.myStructures.filter(function(e) {
return e.structureType === STRUCTURE_LAB;
})), e._labs;
}(i);
},
get factory() {
return function(e) {
return e._factoryChecked || (e._factory = e.myStructures.find(function(e) {
return e.structureType === STRUCTURE_FACTORY;
}), e._factoryChecked = !0), e._factory;
}(i);
},
get tombstones() {
return function(e) {
return void 0 === e._tombstones && (e._tombstones = e.room.find(FIND_TOMBSTONES)), 
e._tombstones;
}(i);
},
get mineralContainers() {
return function(e) {
return void 0 === e._mineralContainers && (e._mineralContainers = e.room.find(FIND_STRUCTURES, {
filter: function(e) {
if (e.structureType !== STRUCTURE_CONTAINER) return !1;
var t = e;
return Object.keys(t.store).some(function(e) {
return e !== RESOURCE_ENERGY && t.store.getUsedCapacity(e) > 0;
});
}
})), e._mineralContainers;
}(i);
}
};
}

var _a, xa = {}, Ua = function() {
if (_a) return xa;
_a = 1, Object.defineProperty(xa, "__esModule", {
value: !0
});
var e = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : void 0 !== d ? d : "undefined" != typeof self ? self : {}, t = function(e) {
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
}, u = {}, m = {}.propertyIsEnumerable, p = Object.getOwnPropertyDescriptor, f = p && !m.call({
1: 2
}, 1);
u.f = f ? function(e) {
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
}, S = C, w = S({}.toString), O = S("".slice), b = function(e) {
return O(w(e), 8, -1);
}, _ = n, x = b, U = Object, k = C("".split), M = _(function() {
return !U("z").propertyIsEnumerable(0);
}) ? function(e) {
return "String" === x(e) ? k(e, "") : U(e);
} : U, A = function(e) {
return null == e;
}, N = A, I = TypeError, P = function(e) {
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
}, j = C({}.isPrototypeOf), z = r.navigator, q = z && z.userAgent, X = r, Q = q ? String(q) : "", Z = X.process, J = X.Deno, $ = Z && Z.versions || J && J.version, ee = $ && $.v8;
ee && (g = (y = ee.split("."))[0] > 0 && y[0] < 4 ? 1 : +(y[0] + y[1])), !g && Q && (!(y = Q.match(/Edge\/(\d+)/)) || y[1] >= 74) && (y = Q.match(/Chrome\/(\d+)/)) && (g = +y[1]);
var te = g, re = n, oe = r.String, ne = !!Object.getOwnPropertySymbols && !re(function() {
var e = Symbol("symbol detection");
return !oe(e) || !(Object(e) instanceof Symbol) || !Symbol.sham && te && te < 41;
}), ae = ne && !Symbol.sham && "symbol" == typeof Symbol.iterator, ie = V, se = B, ce = j, le = Object, ue = ae ? function(e) {
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
}, ye = fe, ge = A, he = l, ve = B, Re = W, Ee = TypeError, Te = {
exports: {}
}, Ce = r, Se = Object.defineProperty, we = function(e, t) {
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
}, Oe = r, be = we, _e = "__core-js_shared__", xe = Te.exports = Oe[_e] || be(_e, {});
(xe.versions || (xe.versions = [])).push({
version: "3.42.0",
mode: "global",
copyright: "© 2014-2025 Denis Pushkarev (zloirock.ru)",
license: "https://github.com/zloirock/core-js/blob/v3.42.0/LICENSE",
source: "https://github.com/zloirock/core-js"
});
var Ue = Te.exports, ke = Ue, Me = function(e, t) {
return ke[e] || (ke[e] = t || {});
}, Ae = P, Ne = Object, Ie = function(e) {
return Ne(Ae(e));
}, Pe = Ie, Ge = C({}.hasOwnProperty), Le = Object.hasOwn || function(e, t) {
return Ge(Pe(e), t);
}, De = C, Fe = 0, Be = Math.random(), He = De(1..toString), We = function(e) {
return "Symbol(" + (void 0 === e ? "" : e) + ")_" + He(++Fe + Be, 36);
}, Ye = Me, Ke = Le, Ve = We, je = ne, ze = ae, qe = r.Symbol, Xe = Ye("wks"), Qe = ze ? qe.for || qe : qe && qe.withoutSetter || Ve, Ze = function(e) {
return Ke(Xe, e) || (Xe[e] = je && Ke(qe, e) ? qe[e] : Qe("Symbol." + e)), Xe[e];
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
}), Ct = W, St = String, wt = TypeError, Ot = function(e) {
if (Ct(e)) return e;
throw new wt(St(e) + " is not an object");
}, bt = a, _t = ut, xt = Tt, Ut = Ot, kt = nt, Mt = TypeError, At = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, It = "enumerable", Pt = "configurable", Gt = "writable";
Et.f = bt ? xt ? function(e, t, r) {
if (Ut(e), t = kt(t), Ut(r), "function" == typeof e && "prototype" === t && "value" in r && Gt in r && !r[Gt]) {
var o = Nt(e, t);
o && o[Gt] && (e[t] = r.value, r = {
configurable: Pt in r ? r[Pt] : o[Pt],
enumerable: It in r ? r[It] : o[It],
writable: !1
});
}
return At(e, t, r);
} : At : function(e, t, r) {
if (Ut(e), t = kt(t), Ut(r), _t) try {
return At(e, t, r);
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
}, jt = B, zt = Ue, qt = C(Function.toString);
jt(zt.inspectSource) || (zt.inspectSource = function(e) {
return qt(e);
});
var Xt, Qt, Zt, Jt = zt.inspectSource, $t = B, er = r.WeakMap, tr = $t(er) && /native code/.test(String(er)), rr = We, or = Me("keys"), nr = function(e) {
return or[e] || (or[e] = rr(e));
}, ar = {}, ir = tr, sr = r, cr = Ft, lr = Le, ur = Ue, mr = nr, pr = ar, dr = "Object already initialized", fr = sr.TypeError, yr = sr.WeakMap;
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
}, Rr = C, Er = n, Tr = B, Cr = Le, Sr = a, wr = Vt.CONFIGURABLE, Or = Jt, br = vr.enforce, _r = vr.get, xr = String, Ur = Object.defineProperty, kr = Rr("".slice), Mr = Rr("".replace), Ar = Rr([].join), Nr = Sr && !Er(function() {
return 8 !== Ur(function() {}, "length", {
value: 8
}).length;
}), Ir = String(String).split("String"), Pr = Bt.exports = function(e, t, r) {
"Symbol(" === kr(xr(t), 0, 7) && (t = "[" + Mr(xr(t), /^Symbol\(([^)]*)\).*$/, "$1") + "]"), 
r && r.getter && (t = "get " + t), r && r.setter && (t = "set " + t), (!Cr(e, "name") || wr && e.name !== t) && (Sr ? Ur(e, "name", {
value: t,
configurable: !0
}) : e.name = t), Nr && r && Cr(r, "arity") && e.length !== r.arity && Ur(e, "length", {
value: r.arity
});
try {
r && Cr(r, "constructor") && r.constructor ? Sr && Ur(e, "prototype", {
writable: !1
}) : e.prototype && (e.prototype = void 0);
} catch (e) {}
var o = br(e);
return Cr(o, "source") || (o.source = Ar(Ir, "string" == typeof t ? t : "")), e;
};
Function.prototype.toString = Pr(function() {
return Tr(this) && _r(this).source || Or(this);
}, "toString");
var Gr = Bt.exports, Lr = B, Dr = Et, Fr = Gr, Br = we, Hr = {}, Wr = Math.ceil, Yr = Math.floor, Kr = Math.trunc || function(e) {
var t = +e;
return (t > 0 ? Yr : Wr)(t);
}, Vr = function(e) {
var t = +e;
return t != t || 0 === t ? 0 : Kr(t);
}, jr = Vr, zr = Math.max, qr = Math.min, Xr = Vr, Qr = Math.min, Zr = function(e) {
return t = e.length, (r = Xr(t)) > 0 ? Qr(r, 9007199254740991) : 0;
var t, r;
}, Jr = D, $r = Zr, eo = {
indexOf: function(e, t, r) {
var o = Jr(e), n = $r(o);
if (0 === n) return -1;
for (var a = function(e, t) {
var r = jr(e);
return r < 0 ? zr(r + t, 0) : qr(r, t);
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
}, vo = Le, Ro = ho, Eo = o, To = Et, Co = n, So = B, wo = /#|\.prototype\./, Oo = function(e, t) {
var r = _o[bo(e)];
return r === Uo || r !== xo && (So(t) ? Co(t) : !!t);
}, bo = Oo.normalize = function(e) {
return String(e).replace(wo, ".").toLowerCase();
}, _o = Oo.data = {}, xo = Oo.NATIVE = "N", Uo = Oo.POLYFILL = "P", ko = Oo, Mo = r, Ao = o.f, No = Ft, Io = function(e, t, r, o) {
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
}, Po = we, Go = function(e, t, r) {
for (var o = Ro(t), n = To.f, a = Eo.f, i = 0; i < o.length; i++) {
var s = o[i];
vo(e, s) || r && vo(r, s) || n(e, s, a(t, s));
}
}, Lo = ko, Do = function(e, t) {
var r, o, n, a, i, s = e.target, c = e.global, l = e.stat;
if (r = c ? Mo : l ? Mo[s] || Po(s, {}) : Mo[s] && Mo[s].prototype) for (o in t) {
if (a = t[o], n = e.dontCallGetSet ? (i = Ao(r, o)) && i.value : r[o], !Lo(c ? o : s + (l ? "." : "#") + o, e.forced) && void 0 !== n) {
if (typeof a == typeof n) continue;
Go(a, n);
}
(e.sham || n && n.sham) && No(a, "sham", !0), Io(r, o, a, e);
}
}, Fo = b, Bo = Array.isArray || function(e) {
return "Array" === Fo(e);
}, Ho = TypeError, Wo = b, Yo = C, Ko = function(e) {
if ("Function" === Wo(e)) return Yo(e);
}, Vo = fe, jo = i, zo = Ko(Ko.bind), qo = Bo, Xo = Zr, Qo = function(e) {
if (e > 9007199254740991) throw Ho("Maximum allowed index exceeded");
return e;
}, Zo = function(e, t, r, o, n, a, i, s) {
for (var c, l, u = n, m = 0, p = !!i && function(e, t) {
return Vo(e), void 0 === t ? e : jo ? zo(e, t) : function() {
return e.apply(t, arguments);
};
}(i, s); m < o; ) m in r && (c = p ? p(r[m], m, t) : r[m], a > 0 && qo(c) ? (l = Xo(c), 
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
}) ? vn : hn, En = Bo, Tn = Rn, Cn = W, Sn = Ze("species"), wn = Array, On = function(e, t) {
return new (function(e) {
var t;
return En(e) && (t = e.constructor, (Tn(t) && (t === wn || En(t.prototype)) || Cn(t) && null === (t = t[Sn])) && (t = void 0)), 
void 0 === t ? wn : t;
}(e))(0 === t ? 0 : t);
}, bn = Jo, _n = fe, xn = Ie, Un = Zr, kn = On;
Do({
target: "Array",
proto: !0
}, {
flatMap: function(e) {
var t, r = xn(this), o = Un(r);
return _n(e), (t = kn(r, 0)).length = bn(t, r, r, o, 0, 1, e, arguments.length > 1 ? arguments[1] : void 0), 
t;
}
});
var Mn = {}, An = io, Nn = so, In = Object.keys || function(e) {
return An(e, Nn);
}, Pn = a, Gn = Tt, Ln = Et, Dn = Ot, Fn = D, Bn = In;
Mn.f = Pn && !Gn ? Object.defineProperties : function(e, t) {
Dn(e);
for (var r, o = Fn(t), n = Bn(t), a = n.length, i = 0; a > i; ) Ln.f(e, r = n[i++], o[r]);
return e;
};
var Hn, Wn = V("document", "documentElement"), Yn = Ot, Kn = Mn, Vn = so, jn = ar, zn = Wn, qn = ct, Xn = "prototype", Qn = "script", Zn = nr("IE_PROTO"), Jn = function() {}, $n = function(e) {
return "<" + Qn + ">" + e + "</" + Qn + ">";
}, ea = function(e) {
e.write($n("")), e.close();
var t = e.parentWindow.Object;
return e = null, t;
}, ta = function() {
try {
Hn = new ActiveXObject("htmlfile");
} catch (e) {}
var e, t, r;
ta = "undefined" != typeof document ? document.domain && Hn ? ea(Hn) : (t = qn("iframe"), 
r = "java" + Qn + ":", t.style.display = "none", zn.appendChild(t), t.src = String(r), 
(e = t.contentWindow.document).open(), e.write($n("document.F=Object")), e.close(), 
e.F) : ea(Hn);
for (var o = Vn.length; o--; ) delete ta[Xn][Vn[o]];
return ta();
};
jn[Zn] = !0;
var ra = Ze, oa = Object.create || function(e, t) {
var r;
return null !== e ? (Jn[Xn] = Yn(e), r = new Jn, Jn[Xn] = null, r[Zn] = e) : r = ta(), 
void 0 === t ? r : Kn.f(r, t);
}, na = Et.f, aa = ra("unscopables"), ia = Array.prototype;
void 0 === ia[aa] && na(ia, aa, {
configurable: !0,
value: oa(null)
});
var sa = function(e) {
ia[aa][e] = !0;
};
sa("flatMap");
var ca = r, la = C, ua = function(e, t) {
return la(ca[e].prototype[t]);
};
ua("Array", "flatMap");
var ma = Jo, pa = Ie, da = Zr, fa = Vr, ya = On;
Do({
target: "Array",
proto: !0
}, {
flat: function() {
var e = arguments.length ? arguments[0] : void 0, t = pa(this), r = da(t), o = ya(t, 0);
return o.length = ma(o, t, t, r, 0, void 0 === e ? 1 : fa(e)), o;
}
}), sa("flat"), ua("Array", "flat");
const ga = {
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
}, ha = new Map, va = new Map, Ra = {
set(e, t, r) {
ha.set(e, t), void 0 !== r && va.set(e, r);
},
get: e => ha.get(e),
expires: e => va.get(e),
delete(e) {
ha.delete(e);
},
with: () => Ra,
clean() {
for (const [e, t] of va) Game.time >= t && (Ra.delete(e), va.delete(e));
}
};
var Ea = (() => {
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
const Ta = new Ea.Codec({
array: !1
}), Ca = {
key: "ns",
serialize(e) {
if (void 0 !== e) return Ta.encode(e);
},
deserialize(e) {
if (void 0 !== e) return Ta.decode(e);
}
}, Sa = (e, t) => `cg_${e.key}_${t}`, wa = (e, t) => Object.assign(Object.assign({}, e), {
get(r) {
var o;
const n = e.get(r);
if (n) try {
const e = null !== (o = Ra.get(Sa(t, n))) && void 0 !== o ? o : t.deserialize(n);
return void 0 !== e && Ra.set(Sa(t, n), e, Game.time + CREEP_LIFE_TIME), e;
} catch (o) {
return e.delete(r), void Ra.delete(Sa(t, n));
}
},
set(r, o, n) {
const a = e.get(r);
a && Ra.delete(Sa(t, a));
const i = t.serialize(o);
i ? (e.set(r, i, n), Ra.set(Sa(t, i), o, Game.time + CREEP_LIFE_TIME)) : e.delete(r);
},
delete(r) {
const o = e.get(r);
o && Ra.delete(Sa(t, o)), e.delete(r);
},
with: t => wa(e, t)
});
function Oa() {
var e, t;
return null !== (e = Memory[t = ga.MEMORY_CACHE_PATH]) && void 0 !== e || (Memory[t] = {}), 
Memory[ga.MEMORY_CACHE_PATH];
}
function ba() {
var e, t;
return null !== (e = Memory[t = ga.MEMORY_CACHE_EXPIRATION_PATH]) && void 0 !== e || (Memory[t] = {}), 
Memory[ga.MEMORY_CACHE_EXPIRATION_PATH];
}
const Ua = {
set(e, t, r) {
if (Oa()[e] = t, void 0 !== r) {
const t = Ca.serialize(r);
t && (ba()[e] = t);
}
},
get: e => Oa()[e],
expires: e => Ca.deserialize(ba()[e]),
delete(e) {
delete Oa()[e];
},
with: e => wa(Ua, e),
clean() {
const e = ba();
for (const t in e) {
const r = Ca.deserialize(e[t]);
void 0 !== r && Game.time >= r && (Ua.delete(t), delete e[t]);
}
}
}, ka = (e, t, r = 1 / 0) => {
let o = new Map, n = Game.time;
return (...a) => {
Game.time >= n + r && (n = Game.time, o = new Map);
const i = e(...a);
return o.has(i) || o.set(i, t(...a)), o.get(i);
};
}, Ma = (e, t) => ka(e, t, 1), Aa = ka(e => e, e => {
for (let t = 2; t < e.length; t++) if ("N" === e[t] || "S" === e[t]) {
const r = e[0], o = e[t];
let n = parseInt(e.slice(1, t)), a = parseInt(e.slice(t + 1));
return "W" === r && (n = -n - 1), "N" === o && (a = -a - 1), n += 128, a += 128, 
n << 8 | a;
}
throw new Error(`Invalid room name ${e}`);
}), Na = (e, t, r) => {
const o = Object.create(RoomPosition.prototype);
return o.__packedPos = Aa(r) << 16 | e << 8 | t, o;
}, Ia = (e, t, r) => {
const o = Object.create(RoomPosition.prototype);
return o.__packedPos = 4294901760 & e.__packedPos | t << 8 | r, o;
}, Pa = (e, t, r) => {
const o = e.__packedPos >> 8 & 255, n = 255 & e.__packedPos, a = Object.create(RoomPosition.prototype);
return a.__packedPos = 4294901760 & e.__packedPos | o + t << 8 | n + r, a;
}, Ga = new Ea.Codec({
array: !1,
depth: 28
}), La = new Ea.Codec({
array: !0,
depth: 12
}), Da = new Ea.Codec({
depth: 3,
array: !0
}), Fa = new Ea.Codec({
array: !0,
depth: 16
}), Ba = [ "WN", "EN", "WS", "ES" ], Ha = e => {
const t = (65280 & e.__packedPos) >> 8, r = 255 & e.__packedPos, o = e.__packedPos >>> 4 & 4294963200 | t << 6 | r;
return Ga.encode(o);
}, Wa = function(e) {
const t = Ga.decode(e), r = t << 4 & 4294901760 | (4032 & t) >> 6 << 8 | 63 & t, o = Object.create(RoomPosition.prototype);
if (o.__packedPos = r, o.x > 49 || o.y > 49) throw new Error("Invalid room position");
return o;
}, Ya = e => Va([ e ]), Ka = e => ja(e)[0], Va = e => La.encode(e.map(e => e.x << 6 | e.y)), ja = e => La.decode(e).map(e => {
const t = {
x: (4032 & e) >> 6,
y: 63 & e
};
if (t.x > 49 || t.y > 49) throw new Error("Invalid packed coord");
return t;
}), za = e => e.map(e => Ha(e)).join(""), qa = e => {
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
}), oi = e => ti([ e ]), ni = e => ri(e)[0], ai = new Ea.Codec({
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
if (void 0 !== e) return za(e);
},
deserialize(e) {
if (void 0 !== e) return qa(e);
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
if (void 0 !== e) return ja(e);
}
};
function pi() {
Ua.clean(), Ra.clean();
}
const di = {
HeapCache: Ra,
MemoryCache: Ua
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
const yi = e => 0 === e.x || 0 === e.y || 49 === e.x || 49 === e.y, gi = ka((e, t = !0, r = !1) => {
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
}, wi = e => {
let t = e.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
return Number(t[1]) % 10 == 0 || Number(t[2]) % 10 == 0;
}, Oi = e => {
let t = e.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
let r = Number(t[1]) % 10, o = Number(t[2]) % 10;
return !(5 === r && 5 === o) && r >= 4 && r <= 6 && o >= 4 && o <= 6;
}, bi = (e, t, r) => r ? e.slice(0, t) : e.slice(t + 1), _i = e => "_ck" + e;
function xi(e) {
Oi(e) && !Ua.get(_i(e)) && Ua.with(li).set(_i(e), [ ...Game.rooms[e].find(FIND_SOURCES), ...Game.rooms[e].find(FIND_MINERALS) ].map(e => e.pos));
}
class Ui extends Map {
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
class ki extends Ui {
constructor() {
super(...arguments), this.reversed = new Ui;
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
var Mi, Ai, Ni, Ii;
const Pi = new Ea.Codec({
array: !1,
depth: 30
}), Gi = new Map;
null !== (Mi = Memory[Ii = ga.MEMORY_PORTAL_PATH]) && void 0 !== Mi || (Memory[Ii] = []);
for (const e of Memory[ga.MEMORY_PORTAL_PATH]) {
const t = Fi(e), r = null !== (Ai = Gi.get(t.room1)) && void 0 !== Ai ? Ai : new Map;
r.set(t.room2, t), Gi.set(t.room1, r);
const o = null !== (Ni = Gi.get(t.room2)) && void 0 !== Ni ? Ni : new Map;
o.set(t.room1, t), Gi.set(t.room2, o);
}
function Li(e) {
var t, r, o, n, a;
if (!wi(e) && !(e => {
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
portalMap: new ki
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
const t = ni(e.slice(0, 3)), r = ni(e.slice(3, 6)), o = Pi.decode(e.slice(6, 8)), n = new ki, a = ja(e.slice(8));
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
const Hi = new Ea.Codec({
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
const o = null !== (r = Ua.with(li).get(_i(e))) && void 0 !== r ? r : [];
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
function ji(e, t) {
const r = Game.map.getRoomTerrain(e);
let o = !1;
for (let e = 0; e < 25; e++) {
const {x: n, y: a} = zi(t, e);
if (r.get(n, a) !== TERRAIN_MASK_WALL) {
o = !0;
break;
}
}
let n = !1;
for (let e = 25; e < 49; e++) {
const {x: o, y: a} = zi(t, e);
if (r.get(o, a) !== TERRAIN_MASK_WALL) {
n = !0;
break;
}
}
return [ o, n ];
}
function zi(e, t) {
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
class qi {
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
let m = Object.assign(Object.assign({}, ga.DEFAULT_MOVE_OPTS), r);
(null == r ? void 0 : r.creepMovementInfo) && (m = Object.assign(Object.assign({}, m), function(e) {
const t = {
roadCost: ga.DEFAULT_MOVE_OPTS.roadCost || 1,
plainCost: ga.DEFAULT_MOVE_OPTS.plainCost || 2,
swampCost: ga.DEFAULT_MOVE_OPTS.swampCost || 10
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
const o = Object.assign(Object.assign({}, ga.DEFAULT_MOVE_OPTS), r), n = ka((e, t) => e + t, (e, t) => {
var r;
const n = null === (r = o.routeCallback) || void 0 === r ? void 0 : r.call(o, e, t);
return void 0 !== n ? n : wi(e) ? o.highwayRoomCost : Oi(e) ? o.sourceKeeperRoomCost : o.defaultRoomCost;
}), a = function(e, t, r, o) {
var n, a;
if (t.includes(e)) return [];
const i = null !== (n = null == r ? void 0 : r.routeCallback) && void 0 !== n ? n : () => 1, s = new qi;
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
const o = ji(e[i].room, e[i].exit);
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
const e = Ua.with(Ca).get(as);
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
const a = Object.assign(Object.assign({}, ga.DEFAULT_MOVE_OPTS), o), i = null !== (n = a.cache) && void 0 !== n ? n : Ua, s = gi(r, null == o ? void 0 : o.keepTargetInRoom, null == o ? void 0 : o.flee);
if (null == o ? void 0 : o.visualizePathStyle) {
const e = Object.assign(Object.assign({}, ga.DEFAULT_VISUALIZE_OPTS), o.visualizePathStyle);
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
return (null !== (r = null == t ? void 0 : t.cache) && void 0 !== r ? r : Ua).with(li).get(us(e));
}
function fs(e, t) {
var r;
(null !== (r = null == t ? void 0 : t.cache) && void 0 !== r ? r : Ua).delete(us(e));
}
function ys(e, t, r) {
var o, n, a, i;
const s = (null !== (o = null == r ? void 0 : r.cache) && void 0 !== o ? o : Ua).with(li).get(us(t));
if (!e.pos) return ERR_INVALID_ARGS;
if (!s) return ERR_NO_PATH;
if ((null == r ? void 0 : r.reverse) && e.pos.isEqualTo(s[0]) || !(null == r ? void 0 : r.reverse) && e.pos.isEqualTo(s[s.length - 1])) return OK;
let c = Ra.get(Yi(e, ms));
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
Ra.set(Yi(e, ms), c);
let l = Math.max(0, Math.min(s.length - 1, (null == r ? void 0 : r.reverse) ? c - 1 : c + 1));
if (null == r ? void 0 : r.visualizePathStyle) {
const t = Object.assign(Object.assign({}, ga.DEFAULT_VISUALIZE_OPTS), r.visualizePathStyle), o = bi(s, c, null == r ? void 0 : r.reverse);
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
const r = Ra.get(Yi(e, hs)), o = Ra.get(Yi(e, vs));
return Ra.set(Yi(e, hs), e.pos), r && o && e.pos.isEqualTo(r) ? o + t < Game.time : (Ra.set(Yi(e, vs), Game.time), 
!1);
}, Es = {
key: "js",
serialize(e) {
if (void 0 !== e) return JSON.stringify(e);
},
deserialize(e) {
if (void 0 !== e) return JSON.parse(e);
}
}, Ts = "_cp", Cs = "_ct", Ss = "_co", ws = [ "avoidCreeps", "avoidObstacleStructures", "flee", "plainCost", "swampCost", "roadCost" ];
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
let c = Object.assign(Object.assign({}, ga.DEFAULT_MOVE_OPTS), r);
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
d && !ws.some(e => c[e] !== d[e]) || Os(e, l);
const f = [ null == r ? void 0 : r.roadCost, null == r ? void 0 : r.plainCost, null == r ? void 0 : r.swampCost ].some(e => void 0 !== e);
"body" in e && !f && (c = Object.assign(Object.assign({}, c), {
creepMovementInfo: {
usedCapacity: e.store.getUsedCapacity(),
body: e.body
}
}));
const y = c.reusePath ? Game.time + c.reusePath + 1 : void 0;
l.with(si).set(Yi(e, Cs), u, y), l.with(Es).set(Yi(e, Ss), ws.reduce((e, t) => (e[t] = c[t], 
e), {}), y);
const g = ds(Yi(e, Ts), {
cache: l
}), h = Ra.get(Yi(e, "_cpi")), v = g && bi(g, null != h ? h : 0), R = null !== (i = null === (a = c.avoidTargets) || void 0 === a ? void 0 : a.call(c, e.pos.roomName)) && void 0 !== i ? i : [];
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
}, _s = "_rsi";
return xa.CachingStrategies = di, xa.CoordListSerializer = mi, xa.CoordSerializer = ui, 
xa.Keys = Ki, xa.MoveTargetListSerializer = si, xa.MoveTargetSerializer = ii, xa.NumberSerializer = Ca, 
xa.PositionListSerializer = li, xa.PositionSerializer = ci, xa.adjacentWalkablePositions = Ci, 
xa.blockSquare = function(e) {
ts(e.roomName).blockedSquares.add(Ha(e));
}, xa.cachePath = ps, xa.cachedPathKey = us, xa.calculateAdjacencyMatrix = vi, xa.calculateAdjacentPositions = Ri, 
xa.calculateNearbyPositions = Ei, xa.calculatePositionsAtRange = Ti, xa.cleanAllCaches = pi, 
xa.clearCachedPath = Os, xa.compressPath = e => {
const t = [], r = e[0];
if (!r) return "";
let o = r;
for (const r of e.slice(1)) {
if (1 !== $a(o, r)) throw new Error("Cannot compress path unless each RoomPosition is adjacent to the previous one");
t.push(o.getDirectionTo(r)), o = r;
}
return Ha(r) + Da.encode(t);
}, xa.config = ga, xa.decompressPath = e => {
let t = Wa(e.slice(0, 2));
const r = [ t ], o = Da.decode(e.slice(2));
for (const e of o) t = ei(t, e), r.push(t);
return r;
}, xa.fastRoomPosition = Na, xa.fixEdgePosition = hi, xa.follow = function(e, t) {
e.move(t), t.pull(e), function(e, t) {
const r = ts(e.pos.roomName);
r.pullers.add(e.id), r.pullees.add(t.id);
}(t, e);
}, xa.followPath = ys, xa.fromGlobalPosition = Ja, xa.generatePath = Ji, xa.getCachedPath = ds, 
xa.getMoveIntents = ts, xa.getRangeTo = $a, xa.globalPosition = Za, xa.isExit = yi, 
xa.isPositionWalkable = Si, xa.move = ls, xa.moveByPath = function(e, t, r) {
var o, n, a, i;
const s = null !== (o = null == r ? void 0 : r.repathIfStuck) && void 0 !== o ? o : ga.DEFAULT_MOVE_OPTS.repathIfStuck, c = null !== (i = null === (a = null !== (n = null == r ? void 0 : r.avoidTargets) && void 0 !== n ? n : ga.DEFAULT_MOVE_OPTS.avoidTargets) || void 0 === a ? void 0 : a(e.pos.roomName)) && void 0 !== i ? i : [];
let l = Ra.get(Yi(e, _s));
const u = ds(t, r);
if ((s || c.length) && void 0 !== l) {
let t = null == u ? void 0 : u.findIndex(t => t.isEqualTo(e.pos));
-1 === t && (t = void 0), void 0 !== t && ((null == r ? void 0 : r.reverse) ? t <= l : t >= l) && (Ra.delete(Yi(e, _s)), 
l = void 0);
}
let m = ERR_NOT_FOUND;
if (void 0 === l && (m = ys(e, t, r)), m !== ERR_NOT_FOUND) {
const t = Ra.get(Yi(e, "_cpi"));
if (!(s && Rs(e, s) || u && gs(bi(u, null != t ? t : 0, null == r ? void 0 : r.reverse), c))) return m;
void 0 !== t && (l = (null == r ? void 0 : r.reverse) ? t - 1 : t + 2, Ra.set(Yi(e, _s), l));
}
let p = ds(t, r);
return p ? (void 0 !== l && (p = bi(p, l, null == r ? void 0 : r.reverse)), 0 === p.length ? ERR_NO_PATH : bs(e, p, r)) : ERR_NO_PATH;
}, xa.moveTo = bs, xa.normalizeTargets = gi, xa.offsetRoomPosition = Pa, xa.packCoord = Ya, 
xa.packCoordList = Va, xa.packPos = Ha, xa.packPosList = za, xa.packRoomName = oi, 
xa.packRoomNames = ti, xa.posAtDirection = ei, xa.preTick = function() {
pi(), function() {
for (const e in Game.rooms) xi(e), Li(e);
!function() {
var e, t;
const r = new Set;
Memory[ga.MEMORY_PORTAL_PATH] = [];
for (const o of Gi.values()) for (const n of o.values()) r.has(n) || (r.add(n), 
n.expires && n.expires < Game.time ? (null === (e = Gi.get(n.room1)) || void 0 === e || e.delete(n.room2), 
null === (t = Gi.get(n.room2)) || void 0 === t || t.delete(n.room1)) : Memory[ga.MEMORY_PORTAL_PATH].push(Di(n)));
}();
}();
}, xa.reconcileTraffic = function(e) {
for (const t of [ ...$i.keys() ]) Game.rooms[t] && cs(t, e);
Ua.with(Ca).set(as, Game.time);
}, xa.reconciledRecently = is, xa.resetCachedPath = fs, xa.roomNameFromCoords = Qa, 
xa.roomNameToCoords = Xa, xa.sameRoomPosition = Ia, xa.unpackCoord = Ka, xa.unpackCoordList = ja, 
xa.unpackPos = Wa, xa.unpackPosList = qa, xa.unpackRoomName = ni, xa.unpackRoomNames = ri, 
xa;
}(), ka = function() {
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
}(), Ma = new ka;

function Aa(e) {
var t = Game.rooms[e];
if (!t) return null;
var r = t.find(FIND_MY_SPAWNS);
return r.length > 0 ? r[0].pos : new RoomPosition(25, 25, e);
}

var Na = de("ActionExecutor"), Ia = "#ffaa00", Pa = "#ffffff", Ga = "#ff0000", La = "#00ff00", Da = "#0000ff";

function Fa(e, t, r) {
var o, n;
if (!t || !t.type) return Na.warn("".concat(e.name, " received invalid action, clearing state")), 
void delete r.memory.state;
var a = function(e, t) {
return t;
}(0, t);
t.type !== a.type && Na.debug("".concat(e.name, " opportunistic action: ").concat(t.type, " → ").concat(a.type)), 
"idle" === a.type ? Na.warn("".concat(e.name, " (").concat(r.memory.role, ") executing IDLE action")) : Na.debug("".concat(e.name, " (").concat(r.memory.role, ") executing ").concat(a.type));
var i = !1;
switch (a.type) {
case "harvest":
i = Ba(e, function() {
return e.harvest(a.target);
}, a.target, Ia, a.type);
break;

case "harvestMineral":
i = Ba(e, function() {
return e.harvest(a.target);
}, a.target, "#00ff00", a.type);
break;

case "harvestDeposit":
i = Ba(e, function() {
return e.harvest(a.target);
}, a.target, "#00ffff", a.type);
break;

case "pickup":
i = Ba(e, function() {
return e.pickup(a.target);
}, a.target, Ia, a.type);
break;

case "withdraw":
i = Ba(e, function() {
return e.withdraw(a.target, a.resourceType);
}, a.target, Ia, a.type);
break;

case "transfer":
i = Ba(e, function() {
return e.transfer(a.target, a.resourceType);
}, a.target, Pa, a.type, {
resourceType: a.resourceType
});
break;

case "drop":
e.drop(a.resourceType);
break;

case "build":
i = Ba(e, function() {
return e.build(a.target);
}, a.target, "#ffffff", a.type);
break;

case "repair":
i = Ba(e, function() {
return e.repair(a.target);
}, a.target, "#ffff00", a.type);
break;

case "upgrade":
i = Ba(e, function() {
return e.upgradeController(a.target);
}, a.target, Pa, a.type);
break;

case "dismantle":
i = Ba(e, function() {
return e.dismantle(a.target);
}, a.target, Ga, a.type);
break;

case "attack":
Ba(e, function() {
return e.attack(a.target);
}, a.target, Ga, a.type);
break;

case "rangedAttack":
Ba(e, function() {
return e.rangedAttack(a.target);
}, a.target, Ga, a.type);
break;

case "heal":
Ba(e, function() {
return e.heal(a.target);
}, a.target, La, a.type);
break;

case "rangedHeal":
e.rangedHeal(a.target), Ua.moveTo(e, a.target, {
visualizePathStyle: {
stroke: La
}
}) === ERR_NO_PATH && (i = !0);
break;

case "claim":
Ba(e, function() {
return e.claimController(a.target);
}, a.target, La, a.type);
break;

case "reserve":
Ba(e, function() {
return e.reserveController(a.target);
}, a.target, La, a.type);
break;

case "attackController":
Ba(e, function() {
return e.attackController(a.target);
}, a.target, Ga, a.type);
break;

case "moveTo":
Ua.moveTo(e, a.target, {
visualizePathStyle: {
stroke: Da
}
}) === ERR_NO_PATH && (i = !0);
break;

case "moveToRoom":
var s = new RoomPosition(25, 25, a.roomName);
Ua.moveTo(e, {
pos: s,
range: 20
}, {
visualizePathStyle: {
stroke: Da
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
Ua.moveTo(e, c, {
flee: !0
}) === ERR_NO_PATH && (i = !0);
break;

case "wait":
if (Ua.isExit(e.pos)) {
var l = new RoomPosition(25, 25, e.pos.roomName);
Ua.moveTo(e, l, {
priority: 2
});
break;
}
e.pos.isEqualTo(a.position) || Ua.moveTo(e, a.position) === ERR_NO_PATH && (i = !0);
break;

case "requestMove":
Ua.moveTo(e, a.target, {
visualizePathStyle: {
stroke: Da
},
priority: 5
}) === ERR_NO_PATH && (i = !0);
break;

case "idle":
if (Ua.isExit(e.pos)) {
l = new RoomPosition(25, 25, e.pos.roomName), Ua.moveTo(e, l, {
priority: 2
});
break;
}
var u = Game.rooms[e.pos.roomName];
if (u && (null === (o = u.controller) || void 0 === o ? void 0 : o.my)) {
Ma.getOrInitSwarmState(u.name);
var m = Aa(u.name);
if (m && !e.pos.isEqualTo(m)) {
Ua.moveTo(e, m, {
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
p && Ua.moveTo(e, {
pos: p.pos,
range: 3
}, {
flee: !0,
priority: 2
});
}
i && (delete r.memory.state, Ua.clearCachedPath(e), Un(e)), function(e) {
var t = 0 === e.creep.store.getUsedCapacity(), r = 0 === e.creep.store.getFreeCapacity();
void 0 === e.memory.working && (e.memory.working = !t), t && (e.memory.working = !1), 
r && (e.memory.working = !0);
}(r);
}

function Ba(e, t, r, o, n, a) {
var i = t();
if (i === ERR_NOT_IN_RANGE) {
var s = Ua.moveTo(e, r, {
visualizePathStyle: {
stroke: o
}
});
return s !== OK && Na.info("Movement attempt returned non-OK result", {
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
switch (Qn(e.memory), t) {
case "harvest":
case "harvestMineral":
case "harvestDeposit":
s = 2 * (R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length), Zn(e.memory).energyHarvested += s;
break;

case "transfer":
var u = null !== (n = null == o ? void 0 : o.resourceType) && void 0 !== n ? n : RESOURCE_ENERGY, m = Math.min(e.store.getUsedCapacity(u), null !== (i = null === (a = r.store) || void 0 === a ? void 0 : a.getFreeCapacity(u)) && void 0 !== i ? i : 0);
m > 0 && function(e, t) {
Zn(e).energyTransferred += t;
}(e.memory, m);
break;

case "build":
var p = 5 * (R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length);
c = e.memory, l = p, Zn(c).buildProgress += l;
break;

case "repair":
var d = 100 * (R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length);
!function(e, t) {
Zn(e).repairProgress += t;
}(e.memory, d);
break;

case "attack":
var f = 30 * e.body.filter(function(e) {
return e.type === ATTACK && e.hits > 0;
}).length;
Jn(e.memory, f);
break;

case "rangedAttack":
var y = e.body.filter(function(e) {
return e.type === RANGED_ATTACK && e.hits > 0;
}).length, g = e.pos.getRangeTo(r);
f = 0, g <= 1 ? f = 10 * y : g <= 2 ? f = 4 * y : g <= 3 && (f = 1 * y), Jn(e.memory, f);
break;

case "heal":
case "rangedHeal":
var h = e.body.filter(function(e) {
return e.type === HEAL && e.hits > 0;
}).length, v = "heal" === t ? 12 * h : 4 * h;
!function(e, t) {
Zn(e).healingDone += t;
}(e.memory, v);
break;

case "upgrade":
var R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
!function(e, t) {
Zn(e).upgradeProgress += t;
}(e.memory, R);
}
}(e, n, r, a), (i === ERR_FULL || i === ERR_NOT_ENOUGH_RESOURCES || i === ERR_INVALID_TARGET) && (Na.info("Clearing state after action error", {
room: e.pos.roomName,
creep: e.name,
meta: {
action: null != n ? n : "rangeAction",
result: i,
target: r.pos.toString()
}
}), !0);
}

var Ha = de("StateMachine");

function Wa(e, t) {
var o, n = e.memory.state, a = function(e) {
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
}(n, e)) Ha.info("State completed, evaluating new action", {
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
Ha.info("State reconstruction failed, re-evaluating behavior", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: n.action,
role: e.memory.role
}
}), delete e.memory.state;
} else n && (Ha.info("State invalid, re-evaluating behavior", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: r({
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
}(s), Ha.info("Committed new state action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: s.type,
role: e.memory.role,
targetId: null === (o = e.memory.state) || void 0 === o ? void 0 : o.targetId
}
})) : Ha.info("Behavior returned idle action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
role: e.memory.role
}
}), s) : (Ha.warn("Behavior returned invalid action, defaulting to idle", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
role: e.memory.role
}
}), {
type: "idle"
});
}

function Ya(e) {
var t = 0 === e.creep.store.getUsedCapacity(), r = 0 === e.creep.store.getFreeCapacity();
void 0 === e.memory.working && (e.memory.working = !t);
var o = e.memory.working;
t ? e.memory.working = !1 : r && (e.memory.working = !0);
var n = e.memory.working;
return o !== n && kn(e.creep), n;
}

function Ka(e) {
e.memory.working = !1, kn(e.creep);
}

var Va = de("EnergyCollection");

function ja(e) {
if (e.droppedResources.length > 0) {
var t = xn(e.creep, e.droppedResources, "energy_drop", 5);
if (t) return Va.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting dropped resource at ").concat(t.pos)), 
{
type: "pickup",
target: t
};
}
var r = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (r.length > 0) {
var o = Qo(e.creep, r, "energy_container");
if (o) return Va.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting container ").concat(o.id, " at ").concat(o.pos, " with ").concat(o.store.getUsedCapacity(RESOURCE_ENERGY), " energy")), 
{
type: "withdraw",
target: o,
resourceType: RESOURCE_ENERGY
};
if (Va.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") found ").concat(r.length, " containers but distribution returned null, falling back to closest")), 
a = e.creep.pos.findClosestByRange(r)) return Va.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") using fallback container ").concat(a.id, " at ").concat(a.pos)), 
{
type: "withdraw",
target: a,
resourceType: RESOURCE_ENERGY
};
}
if (e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return Va.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting storage at ").concat(e.storage.pos)), 
{
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var n = Sn(e.room).filter(function(e) {
return e.energy > 0;
});
if (n.length > 0) {
var a, i = Qo(e.creep, n, "energy_source");
if (i) return Va.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting source ").concat(i.id, " at ").concat(i.pos)), 
{
type: "harvest",
target: i
};
if (Va.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") found ").concat(n.length, " sources but distribution returned null, falling back to closest")), 
a = e.creep.pos.findClosestByRange(n)) return Va.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") using fallback source ").concat(a.id, " at ").concat(a.pos)), 
{
type: "harvest",
target: a
};
}
return Va.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") findEnergy returning idle - no energy sources available")), 
{
type: "idle"
};
}

function za(e) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (n = xn(e.creep, t, "deliver_spawn", 5))) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (n = xn(e.creep, r, "deliver_ext", 5))) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var o = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (o.length > 0 && (n = xn(e.creep, o, "deliver_tower", 10))) return {
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
return a.length > 0 && (n = xn(e.creep, a, "deliver_cont", 10)) ? {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
} : null;
}

var qa = de("LarvaWorkerBehavior");

function Xa(e) {
if (Ya(e)) {
qa.debug("".concat(e.creep.name, " larvaWorker working with ").concat(e.creep.store.getUsedCapacity(RESOURCE_ENERGY), " energy"));
var t = za(e);
if (t) return qa.debug("".concat(e.creep.name, " larvaWorker delivering via ").concat(t.type)), 
t;
var r = function(e) {
var t, r = Ma.getSwarmState(e.room.name);
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
if (e.prioritizedSites.length > 0) return qa.debug("".concat(e.creep.name, " larvaWorker building site")), 
{
type: "build",
target: e.prioritizedSites[0]
};
if (e.room.controller) return {
type: "upgrade",
target: e.room.controller
};
if (e.isEmpty) return qa.warn("".concat(e.creep.name, " larvaWorker idle (empty, working=true, no targets) - this indicates a bug")), 
{
type: "idle"
};
qa.debug("".concat(e.creep.name, " larvaWorker has energy but no targets, switching to collection mode")), 
Ka(e);
}
return ja(e);
}

var Qa = de("HarvesterBehavior"), Za = de("HaulerBehavior"), Ja = {
larvaWorker: Xa,
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
var t, r, o, a, i, s, c = Sn(e.room);
if (0 === c.length) return null;
var l, u = "sourceCounts_".concat(e.room.name), m = "sourceCounts_tick_".concat(e.room.name), p = global, d = p[u], f = p[m];
if (d && f === Game.time) l = d; else {
l = new Map;
try {
for (var y = n(c), g = y.next(); !g.done; g = y.next()) {
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
for (var C = n(c), S = C.next(); !S.done; S = C.next()) {
h = S.value;
var w = null !== (s = l.get(h.id)) && void 0 !== s ? s : 0;
w < T && (T = w, E = h);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
S && !S.done && (a = C.return) && a.call(C);
} finally {
if (o) throw o.error;
}
}
return E && (e.memory.sourceId = E.id), E;
}(e), Qa.debug("".concat(e.creep.name, " harvester assigned to source ").concat(null == t ? void 0 : t.id))), 
!t) return Qa.warn("".concat(e.creep.name, " harvester has no source to harvest")), 
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
var a = function(e) {
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
if (a) return Qa.debug("".concat(e.creep.name, " harvester transferring to container ").concat(a.id)), 
{
type: "transfer",
target: a,
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
return i ? (Qa.debug("".concat(e.creep.name, " harvester transferring to link ").concat(i.id)), 
{
type: "transfer",
target: i,
resourceType: RESOURCE_ENERGY
}) : (Qa.debug("".concat(e.creep.name, " harvester dropping energy on ground")), 
{
type: "drop",
resourceType: RESOURCE_ENERGY
});
},
hauler: function(e) {
var t, r = Ya(e);
if (Za.debug("".concat(e.creep.name, " hauler state: working=").concat(r, ", energy=").concat(e.creep.store.getUsedCapacity(RESOURCE_ENERGY), "/").concat(e.creep.store.getCapacity())), 
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
if (a.length > 0 && (c = xn(e.creep, a, "hauler_spawn", 10))) return Za.debug("".concat(e.creep.name, " hauler delivering to spawn ").concat(c.id)), 
{
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
var i = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (i.length > 0 && (c = xn(e.creep, i, "hauler_ext", 10))) return {
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
var s = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (s.length > 0 && (c = xn(e.creep, s, "hauler_tower", 15))) return {
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
if (l.length > 0 && (c = xn(e.creep, l, "hauler_cont", 15))) return {
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
if (e.isEmpty) return Za.warn("".concat(e.creep.name, " hauler idle (empty, working=true, no targets)")), 
{
type: "idle"
};
Za.debug("".concat(e.creep.name, " hauler has energy but no targets, switching to collection mode")), 
Ka(e);
}
if (e.droppedResources.length > 0 && (c = xn(e.creep, e.droppedResources, "hauler_drop", 5))) return {
type: "pickup",
target: c
};
var u = e.tombstones.filter(function(e) {
return e.store.getUsedCapacity() > 0;
});
if (u.length > 0) {
var m = xn(e.creep, u, "hauler_tomb", 10);
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
var f = Qo(e.creep, d, "energy_container");
if (f) return Za.debug("".concat(e.creep.name, " hauler withdrawing from container ").concat(f.id, " with ").concat(f.store.getUsedCapacity(RESOURCE_ENERGY), " energy")), 
{
type: "withdraw",
target: f,
resourceType: RESOURCE_ENERGY
};
Za.warn("".concat(e.creep.name, " hauler found ").concat(d.length, " containers but distribution returned null, falling back to closest"));
var y = e.creep.pos.findClosestByRange(d);
if (y) return Za.debug("".concat(e.creep.name, " hauler using fallback container ").concat(y.id)), 
{
type: "withdraw",
target: y,
resourceType: RESOURCE_ENERGY
};
}
if (e.mineralContainers.length > 0) {
var g = Qo(e.creep, e.mineralContainers, "mineral_container");
if (g) {
if (h = Object.keys(g.store).find(function(e) {
return e !== RESOURCE_ENERGY && g.store.getUsedCapacity(e) > 0;
})) return {
type: "withdraw",
target: g,
resourceType: h
};
} else {
Za.warn("".concat(e.creep.name, " hauler found ").concat(e.mineralContainers.length, " mineral containers but distribution returned null, falling back to closest"));
var h, v = e.creep.pos.findClosestByRange(e.mineralContainers);
if (v && (h = Object.keys(v.store).find(function(e) {
return e !== RESOURCE_ENERGY && v.store.getUsedCapacity(e) > 0;
}))) return Za.debug("".concat(e.creep.name, " hauler using fallback mineral container ").concat(v.id)), 
{
type: "withdraw",
target: v,
resourceType: h
};
}
}
return e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0 ? (Za.debug("".concat(e.creep.name, " hauler withdrawing from storage")), 
{
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
}) : (Za.warn("".concat(e.creep.name, " hauler idle (no energy sources found)")), 
{
type: "idle"
});
},
builder: function(e) {
if (Ya(e)) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (o = xn(e.creep, t, "builder_spawn", 5))) return {
type: "transfer",
target: o,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (o = xn(e.creep, r, "builder_ext", 5))) return {
type: "transfer",
target: o,
resourceType: RESOURCE_ENERGY
};
var o, n = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (n.length > 0 && (o = xn(e.creep, n, "builder_tower", 10))) return {
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
return ja(e);
},
upgrader: function(e) {
if (Ya(e)) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (u = xn(e.creep, t, "upgrader_spawn", 5))) return {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (u = xn(e.creep, r, "upgrader_ext", 5))) return {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
var o = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
return o.length > 0 && (u = xn(e.creep, o, "upgrader_tower", 10)) ? {
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
}), l.length > 0 && (u = xn(e.creep, l, "upgrader_nearby", 30))) return {
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
if (m.length > 0 && (u = xn(e.creep, m, "upgrader_cont", 30))) return {
type: "withdraw",
target: u,
resourceType: RESOURCE_ENERGY
};
var p = Sn(e.room).filter(function(e) {
return e.energy > 0;
});
if (p.length > 0) {
var d = xn(e.creep, p, "upgrader_source", 30);
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
return Ya(e) ? za(e) || (e.storage ? {
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
var t, r = Cn(e.room, FIND_MINERALS)[0];
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
var r = Cn(e.room, FIND_DEPOSITS);
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
var t, r, o, a, i, s, c, l, u, m;
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
for (var h = n(p), v = h.next(); !v.done; v = h.next()) {
var R = (_ = v.value).store.getFreeCapacity(f);
if (null !== R && R > 0) return {
type: "transfer",
target: _,
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
for (var E = n(d), T = E.next(); !T.done; T = E.next()) {
var C = (_ = T.value).mineralType;
if (C && _.store.getUsedCapacity(C) > 100) return {
type: "withdraw",
target: _,
resourceType: C
};
}
} catch (e) {
o = {
error: e
};
} finally {
try {
T && !T.done && (a = E.return) && a.call(E);
} finally {
if (o) throw o.error;
}
}
var S = null !== (m = e.terminal) && void 0 !== m ? m : e.storage;
if (S) {
var w = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
try {
for (var O = n(p), b = O.next(); !b.done; b = O.next()) {
var _ = b.value;
try {
for (var x = (c = void 0, n(w)), U = x.next(); !U.done; U = x.next()) {
var k = U.value;
if (S.store.getUsedCapacity(k) > 0 && _.store.getFreeCapacity(k) > 0) return {
type: "withdraw",
target: S,
resourceType: k
};
}
} catch (e) {
c = {
error: e
};
} finally {
try {
U && !U.done && (l = x.return) && l.call(x);
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
return o !== n && (kn(e.creep), delete e.memory.targetId), n;
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
var t, r, o, a, i;
if (!e.factory) return {
type: "idle"
};
if (Ya(e)) {
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
for (var u = n(l), m = u.next(); !m.done; m = u.next()) {
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
for (var f = n(d), y = f.next(); !y.done; y = f.next()) {
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
y && !y.done && (a = f.return) && a.call(f);
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
var t = Sn(e.room);
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
var t = Ya(e), r = e.memory.targetRoom, o = e.memory.homeRoom;
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
if (a.length > 0 && (p = xn(e.creep, a, "remoteHauler_spawn", 5))) return {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
};
var i = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (i.length > 0 && (p = xn(e.creep, i, "remoteHauler_ext", 5))) return {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
};
var s = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (s.length > 0 && (p = xn(e.creep, s, "remoteHauler_tower", 10))) return {
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
return c.length > 0 && (p = xn(e.creep, c, "remoteHauler_cont", 10)) ? {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
} : e.isEmpty || e.room.name !== o ? {
type: "idle"
} : (Ka(e), {
type: "moveToRoom",
roomName: r
});
}
if (e.room.name !== r) return {
type: "moveToRoom",
roomName: r
};
var l = .3 * e.creep.store.getCapacity(RESOURCE_ENERGY), u = Cn(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(RESOURCE_ENERGY) >= l;
},
filterKey: "remoteContainers"
});
if (u.length > 0 && (p = xn(e.creep, u, "remoteHauler_remoteCont", 10))) return {
type: "withdraw",
target: p,
resourceType: RESOURCE_ENERGY
};
var m = On(e.room, RESOURCE_ENERGY).filter(function(e) {
return e.amount > 50;
});
if (m.length > 0 && (p = xn(e.creep, m, "remoteHauler_remoteDrop", 3))) return {
type: "pickup",
target: p
};
if (0 === u.length) {
var p, d = Cn(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
},
filterKey: "containers"
});
if (d.length > 0 && (p = xn(e.creep, d, "remoteHauler_waitCont", 20)) && e.creep.pos.getRangeTo(p) > 2) return {
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
if ((s = Cn(i, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getFreeCapacity(a) > 0;
},
filterKey: "container_".concat(a)
})).length > 0 && (c = xn(e.creep, s, "interRoomCarrier_targetCont", 10))) return {
type: "transfer",
target: c,
resourceType: a
};
var l = wn(i, STRUCTURE_SPAWN);
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
} : (s = Cn(i, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(a) > 0;
},
filterKey: "container_".concat(a)
})).length > 0 && (c = xn(e.creep, s, "interRoomCarrier_sourceCont", 10)) ? {
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

function $a(e) {
var t;
return (null !== (t = Ja[e.memory.role]) && void 0 !== t ? t : Xa)(e);
}

var ei = [ "TooAngel", "TedRoastBeef" ];

function ti(e) {
var t, r = e.filter(function(e) {
return !function(e) {
return t = e.owner.username, ei.includes(t);
var t;
}(e);
}), o = e.length - r.length;
return o > 0 && console.log("[Alliance] Filtered ".concat(o, " allied creeps from hostile detection in ").concat(null === (t = e[0]) || void 0 === t ? void 0 : t.room.name)), 
r;
}

function ri(e) {
var t, r = ((t = {})[MOVE] = 50, t[WORK] = 100, t[CARRY] = 50, t[ATTACK] = 80, t[RANGED_ATTACK] = 150, 
t[HEAL] = 250, t[CLAIM] = 600, t[TOUGH] = 10, t);
return e.reduce(function(e, t) {
return e + r[t];
}, 0);
}

function oi(e, t) {
return void 0 === t && (t = 0), {
parts: e,
cost: ri(e),
minCapacity: t || ri(e)
};
}

var ni = {
larvaWorker: {
role: "larvaWorker",
family: "economy",
bodies: [ oi([ WORK, CARRY ], 150), oi([ WORK, CARRY, MOVE ], 200), oi([ WORK, WORK, CARRY, CARRY, MOVE, MOVE ], 400), oi([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ], 600), oi([ WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 800) ],
priority: 100,
maxPerRoom: 3,
remoteRole: !1
},
harvester: {
role: "harvester",
family: "economy",
bodies: [ oi([ WORK, WORK, MOVE ], 250), oi([ WORK, WORK, WORK, WORK, MOVE, MOVE ], 500), oi([ WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE ], 700), oi([ WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE ], 800), oi([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE ], 1e3) ],
priority: 95,
maxPerRoom: 2,
remoteRole: !1
},
hauler: {
role: "hauler",
family: "economy",
bodies: [ oi([ CARRY, CARRY, MOVE, MOVE ], 200), oi([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), oi([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800), oi(i(i([], a(Array(16).fill(CARRY)), !1), a(Array(16).fill(MOVE)), !1), 1600) ],
priority: 90,
maxPerRoom: 2,
remoteRole: !0
},
upgrader: {
role: "upgrader",
family: "economy",
bodies: [ oi([ WORK, CARRY, MOVE ], 200), oi([ WORK, WORK, WORK, CARRY, MOVE, MOVE ], 450), oi([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 1e3), oi([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1700) ],
priority: 60,
maxPerRoom: 2,
remoteRole: !1
},
builder: {
role: "builder",
family: "economy",
bodies: [ oi([ WORK, CARRY, MOVE, MOVE ], 250), oi([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 650), oi([ WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1400) ],
priority: 70,
maxPerRoom: 2,
remoteRole: !1
},
queenCarrier: {
role: "queenCarrier",
family: "economy",
bodies: [ oi([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE ], 300), oi([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ], 450), oi([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 85,
maxPerRoom: 1,
remoteRole: !1
},
mineralHarvester: {
role: "mineralHarvester",
family: "economy",
bodies: [ oi([ WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE ], 550), oi([ WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE ], 850) ],
priority: 40,
maxPerRoom: 1,
remoteRole: !1
},
labTech: {
role: "labTech",
family: "economy",
bodies: [ oi([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), oi([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 35,
maxPerRoom: 1,
remoteRole: !1
},
factoryWorker: {
role: "factoryWorker",
family: "economy",
bodies: [ oi([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), oi([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 35,
maxPerRoom: 1,
remoteRole: !1
},
remoteHarvester: {
role: "remoteHarvester",
family: "economy",
bodies: [ oi([ WORK, WORK, CARRY, MOVE, MOVE, MOVE ], 400), oi([ WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 750), oi([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1050), oi([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1600) ],
priority: 85,
maxPerRoom: 6,
remoteRole: !0
},
remoteHauler: {
role: "remoteHauler",
family: "economy",
bodies: [ oi([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), oi([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800), oi(i(i([], a(Array(16).fill(CARRY)), !1), a(Array(16).fill(MOVE)), !1), 1600) ],
priority: 80,
maxPerRoom: 6,
remoteRole: !0
},
interRoomCarrier: {
role: "interRoomCarrier",
family: "economy",
bodies: [ oi([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), oi([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600), oi([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800) ],
priority: 90,
maxPerRoom: 4,
remoteRole: !1
},
crossShardCarrier: {
role: "crossShardCarrier",
family: "economy",
bodies: [ oi(i(i([], a(Array(4).fill(CARRY)), !1), a(Array(4).fill(MOVE)), !1), 400), oi(i(i([], a(Array(8).fill(CARRY)), !1), a(Array(8).fill(MOVE)), !1), 800), oi(i(i([], a(Array(12).fill(CARRY)), !1), a(Array(12).fill(MOVE)), !1), 1200), oi(i(i([], a(Array(16).fill(CARRY)), !1), a(Array(16).fill(MOVE)), !1), 1600) ],
priority: 85,
maxPerRoom: 6,
remoteRole: !0
},
guard: {
role: "guard",
family: "military",
bodies: [ oi([ TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE ], 310), oi([ TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 620), oi([ TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1070), oi([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1740) ],
priority: 65,
maxPerRoom: 4,
remoteRole: !1
},
remoteGuard: {
role: "remoteGuard",
family: "military",
bodies: [ oi([ TOUGH, ATTACK, MOVE, MOVE ], 190), oi([ TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE ], 500), oi([ TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 880) ],
priority: 65,
maxPerRoom: 2,
remoteRole: !0
},
healer: {
role: "healer",
family: "military",
bodies: [ oi([ HEAL, MOVE, MOVE ], 350), oi([ TOUGH, HEAL, HEAL, MOVE, MOVE, MOVE ], 620), oi([ TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1240), oi([ TOUGH, TOUGH, TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 2640) ],
priority: 55,
maxPerRoom: 1,
remoteRole: !1
},
soldier: {
role: "soldier",
family: "military",
bodies: [ oi([ ATTACK, ATTACK, MOVE, MOVE ], 260), oi([ ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE ], 520), oi([ TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1340) ],
priority: 50,
maxPerRoom: 1,
remoteRole: !1
},
siegeUnit: {
role: "siegeUnit",
family: "military",
bodies: [ oi([ WORK, WORK, MOVE, MOVE ], 300), oi([ TOUGH, TOUGH, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 620), oi([ TOUGH, TOUGH, TOUGH, TOUGH, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1040) ],
priority: 30,
maxPerRoom: 1,
remoteRole: !1
},
ranger: {
role: "ranger",
family: "military",
bodies: [ oi([ TOUGH, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE ], 360), oi([ TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE ], 570), oi([ TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1040), oi([ TOUGH, TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1480) ],
priority: 60,
maxPerRoom: 4,
remoteRole: !1
},
harasser: {
role: "harasser",
family: "military",
bodies: [ oi([ TOUGH, ATTACK, RANGED_ATTACK, MOVE, MOVE ], 320), oi([ TOUGH, TOUGH, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE ], 640), oi([ TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1200) ],
priority: 40,
maxPerRoom: 1,
remoteRole: !1
},
scout: {
role: "scout",
family: "utility",
bodies: [ oi([ MOVE ], 50) ],
priority: 30,
maxPerRoom: 1,
remoteRole: !0
},
claimer: {
role: "claimer",
family: "utility",
bodies: [ oi([ CLAIM, MOVE ], 650), oi([ CLAIM, CLAIM, MOVE, MOVE ], 1300) ],
priority: 50,
maxPerRoom: 3,
remoteRole: !0
},
engineer: {
role: "engineer",
family: "utility",
bodies: [ oi([ WORK, CARRY, MOVE, MOVE ], 250), oi([ WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 500) ],
priority: 55,
maxPerRoom: 2,
remoteRole: !1
},
remoteWorker: {
role: "remoteWorker",
family: "utility",
bodies: [ oi([ WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 500), oi([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 750) ],
priority: 45,
maxPerRoom: 4,
remoteRole: !0
},
powerHarvester: {
role: "powerHarvester",
family: "power",
bodies: [ oi([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 2300), oi([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 3e3) ],
priority: 30,
maxPerRoom: 2,
remoteRole: !0
},
powerCarrier: {
role: "powerCarrier",
family: "power",
bodies: [ oi(i(i([], a(Array(20).fill(CARRY)), !1), a(Array(20).fill(MOVE)), !1), 2e3), oi(i(i([], a(Array(25).fill(CARRY)), !1), a(Array(25).fill(MOVE)), !1), 2500) ],
priority: 25,
maxPerRoom: 2,
remoteRole: !0
}
};

function ai(e) {
var t, r, o, a, i = ti(e.find(FIND_HOSTILE_CREEPS));
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
for (var y = n(i), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = 0, R = 0, E = 0, T = 0;
try {
for (var C = (o = void 0, n(h.body)), S = C.next(); !S.done; S = C.next()) {
var w = S.value;
if (0 !== w.hits) switch (w.type) {
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
S && !S.done && (a = C.return) && a.call(C);
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
}, 0), _ = c > 1.5 * b, x = Math.min(100, Math.max(0, (c - b) / 10)), U = function(e, t, r) {
if (void 0 === t || void 0 === r) {
var o = li("guard"), n = li("ranger"), a = ui(o), i = ui(n), s = (a.avgDps + i.avgDps) / 2, c = (a.avgCost + i.avgCost) / 2;
t = null != t ? t : s, r = null != r ? r : c;
}
return t <= 0 && (t = 300, r = 1300), Math.ceil(e / t) * r;
}(c), k = function(e) {
return 0 === e ? 0 : e < ii ? 1 : e < si ? 2 : 3;
}(s);
return O = s < 100 ? "monitor" : s < 500 && !_ ? "defend" : _ && s < 1e3 ? "assist" : s > 1e3 || u > 3 ? "safemode" : "defend", 
e.find(FIND_NUKES).length > 0 && (s += 500, O = "safemode", k = 3), {
roomName: e.name,
dangerLevel: k,
threatScore: s,
hostileCount: i.length,
totalHostileHitPoints: l,
totalHostileDPS: c,
healerCount: m,
rangedCount: p,
meleeCount: d,
boostedCount: u,
dismantlerCount: f,
estimatedDefenderCost: U,
assistanceRequired: _,
assistancePriority: x,
recommendedResponse: O
};
}

var ii = 300, si = 800;

function ci(e) {
var t, r, o = 0;
try {
for (var a = n(e), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
s === ATTACK ? o += 30 : s === RANGED_ATTACK && (o += 10);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
return o;
}

function li(e) {
var t = ni[e];
return t ? t.bodies.map(function(e) {
return {
parts: e.parts,
cost: e.cost,
dps: ci(e.parts)
};
}).sort(function(e, t) {
return e.cost - t.cost;
}) : [];
}

function ui(e) {
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

function mi(e, t) {
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

var pi = [ STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_TOWER, STRUCTURE_LAB, STRUCTURE_FACTORY, STRUCTURE_POWER_SPAWN, STRUCTURE_NUKER, STRUCTURE_OBSERVER ], di = [ STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE ], fi = {
recalculateInterval: 1e3,
maxPathOps: 2e3,
includeRemoteRoads: !0
}, yi = new Map;

function gi(e, t, o) {
var a, i, s, c, l, u, m, p, d, f, y, g, h, v, R, E, T;
void 0 === o && (o = {});
var C = r(r({}, fi), o), S = yi.get(e.name);
if (S && Game.time - S.lastCalculated < C.recalculateInterval) return S;
var w = new Set, O = null !== (E = null === (R = e.controller) || void 0 === R ? void 0 : R.level) && void 0 !== E ? E : 0, b = e.find(FIND_SOURCES), _ = e.controller, x = e.storage, U = e.find(FIND_MINERALS)[0], k = null !== (T = null == x ? void 0 : x.pos) && void 0 !== T ? T : t;
try {
for (var M = n(b), A = M.next(); !A.done; A = M.next()) {
var N = Ti(k, A.value.pos, e.name, C.maxPathOps);
try {
for (var I = (s = void 0, n(N)), P = I.next(); !P.done; P = I.next()) {
var G = P.value;
w.add("".concat(G.x, ",").concat(G.y));
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
a = {
error: e
};
} finally {
try {
A && !A.done && (i = M.return) && i.call(M);
} finally {
if (a) throw a.error;
}
}
if (_) {
N = Ti(k, _.pos, e.name, C.maxPathOps);
try {
for (var L = n(N), D = L.next(); !D.done; D = L.next()) G = D.value, w.add("".concat(G.x, ",").concat(G.y));
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
if (U && O >= 6) {
N = Ti(k, U.pos, e.name, C.maxPathOps);
try {
for (var F = n(N), B = F.next(); !B.done; B = F.next()) G = B.value, w.add("".concat(G.x, ",").concat(G.y));
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
if (!x) {
try {
for (var H = n(b), W = H.next(); !W.done; W = H.next()) {
N = Ti(t, W.value.pos, e.name, C.maxPathOps);
try {
for (var Y = (y = void 0, n(N)), K = Y.next(); !K.done; K = Y.next()) G = K.value, 
w.add("".concat(G.x, ",").concat(G.y));
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
if (_) {
N = Ti(t, _.pos, e.name, C.maxPathOps);
try {
for (var V = n(N), j = V.next(); !j.done; j = V.next()) G = j.value, w.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
h = {
error: e
};
} finally {
try {
j && !j.done && (v = V.return) && v.call(V);
} finally {
if (h) throw h.error;
}
}
}
}
var z = {
roomName: e.name,
positions: w,
lastCalculated: Game.time
};
return yi.set(e.name, z), ye.debug("Calculated road network for ".concat(e.name, ": ").concat(w.size, " positions"), {
subsystem: "RoadNetwork"
}), z;
}

function hi(e, t) {
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

function vi(e, t) {
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

function Ri(e, t) {
var r, o;
if (0 === t.length) return null;
var a = t[0], i = e.getRangeTo(a);
try {
for (var s = n(t), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = e.getRangeTo(l);
u < i && (i = u, a = l);
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
return a;
}

function Ei(e, t, o) {
var a, i, s, c, l, u, m, p, d;
void 0 === o && (o = {});
var f = r(r({}, fi), o), y = new Map;
if (!f.includeRemoteRoads) return y;
var g = e.storage, h = e.find(FIND_MY_SPAWNS)[0], v = null !== (m = null == g ? void 0 : g.pos) && void 0 !== m ? m : null == h ? void 0 : h.pos;
if (!v) return y;
try {
for (var R = n(t), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
try {
var C = hi(e.name, T);
if (!C) {
ye.warn("Cannot determine exit direction from ".concat(e.name, " to ").concat(T), {
subsystem: "RoadNetwork"
});
continue;
}
var S = vi(e.name, C);
if (0 === S.length) {
ye.warn("No valid exit positions found in ".concat(e.name, " towards ").concat(T), {
subsystem: "RoadNetwork"
});
continue;
}
var w = Ri(v, S);
if (!w) continue;
var O = PathFinder.search(v, {
pos: w,
range: 0
}, {
plainCost: 2,
swampCost: 10,
maxOps: f.maxPathOps,
roomCallback: function(t) {
return t === e.name && Ci(t);
}
});
if (!O.incomplete) try {
for (var b = (s = void 0, n(O.path)), _ = b.next(); !_.done; _ = b.next()) {
var x = _.value;
y.has(x.roomName) || y.set(x.roomName, new Set), null === (p = y.get(x.roomName)) || void 0 === p || p.add("".concat(x.x, ",").concat(x.y));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
_ && !_.done && (c = b.return) && c.call(b);
} finally {
if (s) throw s.error;
}
}
var U = new RoomPosition(25, 25, T), k = PathFinder.search(v, {
pos: U,
range: 20
}, {
plainCost: 2,
swampCost: 10,
maxOps: f.maxPathOps,
roomCallback: function(e) {
return Ci(e);
}
});
if (!k.incomplete) try {
for (var M = (l = void 0, n(k.path)), A = M.next(); !A.done; A = M.next()) x = A.value, 
y.has(x.roomName) || y.set(x.roomName, new Set), null === (d = y.get(x.roomName)) || void 0 === d || d.add("".concat(x.x, ",").concat(x.y));
} catch (e) {
l = {
error: e
};
} finally {
try {
A && !A.done && (u = M.return) && u.call(M);
} finally {
if (l) throw l.error;
}
}
} catch (e) {
var N = e instanceof Error ? e.message : String(e);
ye.warn("Failed to calculate remote road to ".concat(T, ": ").concat(N), {
subsystem: "RoadNetwork"
});
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
E && !E.done && (i = R.return) && i.call(R);
} finally {
if (a) throw a.error;
}
}
return y;
}

function Ti(e, t, r, o) {
var a, i, s = [], c = PathFinder.search(e, {
pos: t,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxOps: o,
roomCallback: function(e) {
return e === r && Ci(e);
}
});
if (!c.incomplete) try {
for (var l = n(c.path), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
m.roomName === r && s.push({
x: m.x,
y: m.y
});
}
} catch (e) {
a = {
error: e
};
} finally {
try {
u && !u.done && (i = l.return) && i.call(l);
} finally {
if (a) throw a.error;
}
}
return s;
}

function Ci(e) {
var t, r, o, a, i = Game.rooms[e], s = new PathFinder.CostMatrix;
if (!i) return s;
var c = i.find(FIND_STRUCTURES);
try {
for (var l = n(c), u = l.next(); !u.done; u = l.next()) {
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
for (var d = n(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
y.structureType === STRUCTURE_ROAD ? s.set(y.pos.x, y.pos.y, 1) : y.structureType !== STRUCTURE_CONTAINER && s.set(y.pos.x, y.pos.y, 255);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
f && !f.done && (a = d.return) && a.call(d);
} finally {
if (o) throw o.error;
}
}
return s;
}

function Si(e, t) {
return e.x <= t || e.x >= 49 - t || e.y <= t || e.y >= 49 - t;
}

function wi(e, t, o, a) {
var i, s, c, l, u, m, p, d, f, y, g;
void 0 === a && (a = []);
var h = new Set, v = e.getTerrain();
try {
for (var R = n(o), E = R.next(); !E.done; E = R.next()) {
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
var w = gi(e, t);
try {
for (var O = n(w.positions), b = O.next(); !b.done; b = O.next()) {
var _ = b.value;
h.add(_);
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
var x = e.storage, U = e.find(FIND_MY_SPAWNS)[0], k = null !== (g = null == x ? void 0 : x.pos) && void 0 !== g ? g : null == U ? void 0 : U.pos;
if (k) {
var M = function(e, t, o) {
var a, i, s, c;
void 0 === o && (o = {});
var l = r(r({}, fi), o), u = new Set;
try {
for (var m = n([ "top", "bottom", "left", "right" ]), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
try {
var f = vi(e.name, d);
if (0 === f.length) continue;
var y = Ri(t, f);
if (!y) continue;
var g = PathFinder.search(t, {
pos: y,
range: 0
}, {
plainCost: 2,
swampCost: 10,
maxOps: l.maxPathOps,
roomCallback: function(t) {
return t === e.name && Ci(t);
}
});
if (g.incomplete) ye.warn("Incomplete path when calculating exit road for ".concat(d, " in ").concat(e.name, " (target exit: ").concat(y.x, ",").concat(y.y, "). Path length: ").concat(g.path.length), {
subsystem: "RoadNetwork"
}); else try {
for (var h = (s = void 0, n(g.path)), v = h.next(); !v.done; v = h.next()) {
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
ye.warn("Failed to calculate exit road for ".concat(d, " in ").concat(e.name, ": ").concat(E), {
subsystem: "RoadNetwork"
});
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
p && !p.done && (i = m.return) && i.call(m);
} finally {
if (a) throw a.error;
}
}
return u;
}(e, k);
try {
for (var A = n(M), N = A.next(); !N.done; N = A.next()) _ = N.value, h.add(_);
} catch (e) {
u = {
error: e
};
} finally {
try {
N && !N.done && (m = A.return) && m.call(A);
} finally {
if (u) throw u.error;
}
}
}
if (a.length > 0) {
var I = Ei(e, a).get(e.name);
if (I) try {
for (var P = n(I), G = P.next(); !G.done; G = P.next()) _ = G.value, h.add(_);
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
var r, o, a, i;
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
for (var u = n(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
Si(p.pos, t) && s.add("".concat(p.pos.x, ",").concat(p.pos.y));
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
for (var d = n(l), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
Si(y.pos, t) && s.add("".concat(y.pos.x, ",").concat(y.pos.y));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (a) throw a.error;
}
}
return s;
}(e);
try {
for (var D = n(L), F = D.next(); !F.done; F = D.next()) _ = F.value, h.add(_);
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

var Oi, bi = function() {
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
for (var o = n(r), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
this.processDefenseRequest(i);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.processDefenseRequest = function(e) {
var t = Game.rooms[e.roomName];
if (t) {
var r = ai(t), o = Math.max(e.urgency, r.dangerLevel, r.assistanceRequired ? 3 : 0), n = this.getAssignedDefenders(e.roomName, "guard"), a = this.getAssignedDefenders(e.roomName, "ranger"), i = r.assistanceRequired ? Math.max(0, Math.ceil(r.totalHostileDPS / 300) - n.length) : 0, s = r.assistanceRequired ? Math.max(0, Math.ceil(r.totalHostileDPS / 300) - a.length) : 0, c = Math.max(0, e.guardsNeeded - n.length, i), l = Math.max(0, e.rangersNeeded - a.length, s);
0 === c && 0 === l || (c > 0 && this.assignDefenders(e.roomName, "guard", c, o), 
l > 0 && this.assignDefenders(e.roomName, "ranger", l, o));
}
}, e.prototype.assignDefenders = function(e, t, r, o) {
var a, i, s = this, c = this.findHelperRooms(e, o), l = 0;
try {
for (var u = n(c), m = u.next(); !m.done; m = u.next()) {
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
this.assignments.set(g.name, R), g.memory.assistTarget = e, l++, qe.info("Assigned ".concat(t, " ").concat(g.name, " from ").concat(p.name, " to assist ").concat(e, " (ETA: ").concat(v - Game.time, " ticks)"), {
subsystem: "Defense"
});
}
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
m && !m.done && (i = u.return) && i.call(u);
} finally {
if (a) throw a.error;
}
}
l > 0 && qe.info("Defense coordination: Assigned ".concat(l, "/").concat(r, " ").concat(t, "s to ").concat(e), {
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
var n = ti(r.find(FIND_HOSTILE_CREEPS));
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
var r, o, i = [];
try {
for (var s = n(this.assignments.entries()), c = s.next(); !c.done; c = s.next()) {
var l = a(c.value, 2), u = l[0], m = l[1];
if (m.targetRoom === e) {
var p = Game.creeps[u];
if (p) {
if (t && p.memory.role !== t) continue;
i.push(m);
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
return i;
}, e.prototype.cleanupAssignments = function() {
var e, t, r, o, i = [];
try {
for (var s = n(this.assignments.entries()), c = s.next(); !c.done; c = s.next()) {
var l = a(c.value, 2), u = l[0], m = l[1], p = Game.creeps[u];
p ? (p.room.name === m.targetRoom && 0 === ti(p.room.find(FIND_HOSTILE_CREEPS)).length && (delete p.memory.assistTarget, 
i.push(u), qe.debug("Released ".concat(u, " from defense assistance (no hostiles in ").concat(m.targetRoom, ")"), {
subsystem: "Defense"
})), Game.time - m.assignedAt > 1e3 && (delete p.memory.assistTarget, i.push(u), 
qe.debug("Removed stale defense assignment for ".concat(u), {
subsystem: "Defense"
}))) : i.push(u);
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
for (var d = n(i), f = d.next(); !f.done; f = d.next()) u = f.value, this.assignments.delete(u);
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
t && delete t.memory.assistTarget, this.assignments.delete(e), qe.info("Cancelled defense assignment for ".concat(e), {
subsystem: "Defense"
});
}
}, o([ yr("cluster:defense", "Defense Coordinator", {
priority: jt.HIGH,
interval: 3,
minBucket: 0,
cpuBudget: .05
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), _i = new bi;

function xi(e) {
return !!function(e, t) {
if ("retreat" === t.recommendedResponse || "safemode" === t.recommendedResponse) return !0;
var r = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory;
return "defender" === t.role || "rangedDefender" === t.role || "guard" === t.role || "ranger" === t.role;
}
});
if (t.hostileCount > 3 * r.length) return qe.info("Creep ".concat(e.name, " retreating: heavily outnumbered (").concat(t.hostileCount, " hostiles vs ").concat(r.length, " defenders)"), {
subsystem: "Defense",
room: e.room.name,
creep: e.name
}), !0;
var o = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
return "healer" === e.memory.role;
}
});
return e.hits < .3 * e.hitsMax && t.healerCount > 0 && 0 === o.length ? (qe.info("Creep ".concat(e.name, " retreating: damaged (").concat(e.hits, "/").concat(e.hitsMax, ") facing ").concat(t.healerCount, " enemy healers without friendly healer support"), {
subsystem: "Defense",
room: e.room.name,
creep: e.name
}), !0) : t.boostedCount > 0 && r.length < 2 * t.boostedCount && (qe.info("Creep ".concat(e.name, " retreating: facing ").concat(t.boostedCount, " boosted hostiles without sufficient support"), {
subsystem: "Defense",
room: e.room.name,
creep: e.name
}), !0);
}(e, ai(e.room)) && (function(e) {
var t, r, o, s, c = e.room.find(FIND_MY_SPAWNS)[0];
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
for (var d = n(Object.entries(u)), f = d.next(); !f.done; f = d.next()) {
var y = a(f.value, 2), g = y[0], h = y[1], v = Number(g), R = Game.rooms[h];
if (null === (s = null == R ? void 0 : R.controller) || void 0 === s ? void 0 : s.my) {
var E = m[v];
if (E) {
var T = e.room.find(E);
T.length > 0 && p.push.apply(p, i([], a(T), !1));
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

function Ui(e) {
var t, r, o, a, i, s, c = {
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
for (var g = n(u), h = g.next(); !h.done; h = g.next()) {
var v = h.value.body, R = v.some(function(e) {
return void 0 !== e.boost;
});
R && y++;
try {
for (var E = (o = void 0, n(v)), T = E.next(); !T.done; T = E.next()) {
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
T && !T.done && (a = E.return) && a.call(E);
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
ye.info("Defender analysis for ".concat(e.name, ": ").concat(c.guards, " guards, ").concat(c.rangers, " rangers, ").concat(c.healers, " healers (urgency: ").concat(c.urgency, "x) - ").concat(c.reasons.join(", ")), {
subsystem: "Defense"
}), c;
}

function ki(e) {
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

function Mi(e, t) {
var r, o;
if (t.danger < 1) return !1;
var n = Ui(e), a = ki(e), i = n.guards - a.guards + (n.rangers - a.rangers);
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
}(Oi || (Oi = {}));

var Ai = function() {
function e() {
this.emergencyStates = new Map;
}
return e.prototype.assess = function(e, t) {
var r, o = this.emergencyStates.get(e.name), n = this.calculateEmergencyLevel(e, t);
return n !== Oi.NONE || o ? (o ? (r = o).level = n : (r = {
level: n,
startedAt: Game.time,
assistanceRequested: !1,
boostsAllocated: !1,
lastEscalation: 0
}, this.emergencyStates.set(e.name, r)), n === Oi.NONE ? (o && (qe.info("Emergency resolved in ".concat(e.name), {
subsystem: "Defense"
}), this.emergencyStates.delete(e.name)), r) : (o && n > o.level && (qe.warn("Emergency escalated in ".concat(e.name, ": Level ").concat(o.level, " → ").concat(n), {
subsystem: "Defense"
}), r.lastEscalation = Game.time), this.executeEmergencyResponse(e, t, r), r)) : {
level: Oi.NONE,
startedAt: Game.time,
assistanceRequested: !1,
boostsAllocated: !1,
lastEscalation: 0
};
}, e.prototype.calculateEmergencyLevel = function(e, t) {
if (0 === t.danger) return Oi.NONE;
var r = ti(e.find(FIND_HOSTILE_CREEPS)), o = Ui(e), n = ki(e);
if (e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_STORAGE || e.structureType === STRUCTURE_TERMINAL) && e.hits < .3 * e.hitsMax;
}
}).length > 0) return Oi.CRITICAL;
var a = r.filter(function(e) {
return e.body.some(function(e) {
return e.boost;
});
}), i = o.guards - n.guards + (o.rangers - n.rangers);
return a.length > 0 && i >= 2 || r.length >= 5 && 0 === n.guards && 0 === n.rangers ? Oi.HIGH : t.danger >= 2 && i >= 1 ? Oi.MEDIUM : t.danger >= 1 ? Oi.LOW : Oi.NONE;
}, e.prototype.executeEmergencyResponse = function(e, t, r) {
r.level !== Oi.HIGH && r.level !== Oi.CRITICAL || r.assistanceRequested || this.requestDefenseAssistance(e, t) && (r.assistanceRequested = !0), 
r.level >= Oi.MEDIUM && !r.boostsAllocated && e.controller && e.controller.level >= 6 && (this.allocateBoostsForDefense(e, t), 
r.boostsAllocated = !0), this.updateDefensePosture(e, t, r);
}, e.prototype.requestDefenseAssistance = function(e, t) {
var r;
if (!Mi(e, t)) return !1;
var o = function(e, t) {
if (!Mi(e, t)) return null;
var r = Ui(e), o = ki(e), n = {
roomName: e.name,
guardsNeeded: Math.max(0, r.guards - o.guards),
rangersNeeded: Math.max(0, r.rangers - o.rangers),
healersNeeded: Math.max(0, r.healers - o.healers),
urgency: r.urgency,
createdAt: Game.time,
threat: r.reasons.join("; ")
};
return ye.warn("Defense assistance requested for ".concat(e.name, ": ").concat(n.guardsNeeded, " guards, ").concat(n.rangersNeeded, " rangers, ").concat(n.healersNeeded, " healers - ").concat(n.threat), {
subsystem: "Defense"
}), n;
}(e, t);
if (!o) return !1;
var n = Memory, a = (null !== (r = n.defenseRequests) && void 0 !== r ? r : []).filter(function(t) {
return t.roomName !== e.name || Game.time - t.createdAt < 500;
});
return a.push(o), n.defenseRequests = a, qe.warn("Defense assistance requested for ".concat(e.name, ": ") + "".concat(o.guardsNeeded, " guards, ").concat(o.rangersNeeded, " rangers - ").concat(o.threat), {
subsystem: "Defense"
}), !0;
}, e.prototype.allocateBoostsForDefense = function(e, t) {
var r, o = Memory, n = null !== (r = o.boostDefensePriority) && void 0 !== r ? r : {};
n[e.name] = !0, o.boostDefensePriority = n, qe.info("Allocated boost priority for defenders in ".concat(e.name), {
subsystem: "Defense"
});
}, e.prototype.updateDefensePosture = function(e, t, r) {
switch (r.level) {
case Oi.CRITICAL:
"evacuate" !== t.posture && (t.posture = "war", t.pheromones.war = 100, t.pheromones.defense = 100, 
qe.warn("".concat(e.name, " posture: CRITICAL DEFENSE"), {
subsystem: "Defense"
}));
break;

case Oi.HIGH:
"war" !== t.posture && "evacuate" !== t.posture && (t.posture = "defensive", t.pheromones.defense = 80, 
t.pheromones.war = 40, qe.info("".concat(e.name, " posture: HIGH DEFENSE"), {
subsystem: "Defense"
}));
break;

case Oi.MEDIUM:
"eco" !== t.posture && "expand" !== t.posture || (t.posture = "defensive", t.pheromones.defense = 60, 
qe.info("".concat(e.name, " posture: MEDIUM DEFENSE"), {
subsystem: "Defense"
}));
break;

case Oi.LOW:
"eco" !== t.posture && "expand" !== t.posture || (t.pheromones.defense = 30, qe.debug("".concat(e.name, ": LOW DEFENSE alert"), {
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
return void 0 !== t && t.level > Oi.NONE;
}, e.prototype.getActiveEmergencies = function() {
var e, t, r = [];
try {
for (var o = n(this.emergencyStates.entries()), i = o.next(); !i.done; i = o.next()) {
var s = a(i.value, 2), c = s[0], l = s[1];
l.level > Oi.NONE && r.push({
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
i && !i.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
return r.sort(function(e, t) {
return t.state.level - e.state.level;
});
}, e;
}(), Ni = new Ai, Ii = function() {
function e() {}
return e.prototype.checkSafeMode = function(e, t) {
var r, o, n, a, i;
if (!(null === (r = e.controller) || void 0 === r ? void 0 : r.safeMode) && !(null === (o = e.controller) || void 0 === o ? void 0 : o.safeModeCooldown) && 0 !== (null !== (a = null === (n = e.controller) || void 0 === n ? void 0 : n.safeModeAvailable) && void 0 !== a ? a : 0) && this.shouldTriggerSafeMode(e, t)) {
var s = null === (i = e.controller) || void 0 === i ? void 0 : i.activateSafeMode();
if (s === OK) qe.warn("SAFE MODE ACTIVATED in ".concat(e.name), {
subsystem: "Defense"
}); else {
var c = void 0 !== s ? String(s) : "undefined";
qe.error("Failed to activate safe mode in ".concat(e.name, ": ").concat(c), {
subsystem: "Defense"
});
}
}
}, e.prototype.shouldTriggerSafeMode = function(e, t) {
var r, o;
if (t.danger < 2) return !1;
var a = e.find(FIND_MY_SPAWNS);
try {
for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (c.hits < .2 * c.hitsMax) return qe.warn("Spawn ".concat(c.name, " critical: ").concat(c.hits, "/").concat(c.hitsMax), {
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
if (e.storage && e.storage.hits < .2 * e.storage.hitsMax) return qe.warn("Storage critical: ".concat(e.storage.hits, "/").concat(e.storage.hitsMax), {
subsystem: "Defense"
}), !0;
if (e.terminal && e.terminal.hits < .2 * e.terminal.hitsMax) return qe.warn("Terminal critical: ".concat(e.terminal.hits, "/").concat(e.terminal.hitsMax), {
subsystem: "Defense"
}), !0;
var l = ti(e.find(FIND_HOSTILE_CREEPS)), u = e.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory.role;
return "guard" === t || "ranger" === t || "soldier" === t;
}
});
if (l.length > 3 * u.length) return qe.warn("Overwhelmed: ".concat(l.length, " hostiles vs ").concat(u.length, " defenders"), {
subsystem: "Defense"
}), !0;
var m = l.filter(function(e) {
return e.body.some(function(e) {
return e.boost;
});
});
return m.length > 0 && u.length < 2 * m.length && (qe.warn("Boosted hostiles detected: ".concat(m.length), {
subsystem: "Defense"
}), !0);
}, e;
}(), Pi = new Ii, Gi = {
triggerDangerLevel: 3,
nukeEvacuationLeadTime: 5e3,
minStorageEnergy: 5e4,
priorityResources: [ RESOURCE_ENERGY, RESOURCE_POWER, RESOURCE_GHODIUM, RESOURCE_CATALYZED_GHODIUM_ACID, RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_LEMERGIUM_ACID, RESOURCE_CATALYZED_KEANIUM_ACID, RESOURCE_CATALYZED_ZYNTHIUM_ACID, RESOURCE_OPS ],
maxTransfersPerTick: 2
}, Li = function() {
function e(e) {
void 0 === e && (e = {}), this.evacuations = new Map, this.lastTransferTick = 0, 
this.transfersThisTick = 0, this.config = r(r({}, Gi), e);
}
return e.prototype.run = function() {
var e, t, r, o;
Game.time !== this.lastTransferTick && (this.transfersThisTick = 0, this.lastTransferTick = Game.time), 
this.checkEvacuationTriggers();
try {
for (var i = n(this.evacuations.values()), s = i.next(); !s.done; s = i.next()) (u = s.value).complete || this.processEvacuation(u);
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
try {
for (var c = n(this.evacuations.entries()), l = c.next(); !l.done; l = c.next()) {
var u, m = a(l.value, 2), p = m[0];
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
}, e.prototype.checkEvacuationTriggers = function() {
var e, t, r, o;
for (var n in Game.rooms) {
var a = Game.rooms[n];
if ((null === (e = a.controller) || void 0 === e ? void 0 : e.my) && !this.evacuations.has(n)) {
var i = Yt.getSwarmState(n);
if (i) {
var s = a.find(FIND_NUKES);
if (s.length > 0) {
var c = s.reduce(function(e, t) {
var r, o;
return (null !== (r = e.timeToLand) && void 0 !== r ? r : 1 / 0) < (null !== (o = t.timeToLand) && void 0 !== o ? o : 1 / 0) ? e : t;
});
if ((null !== (t = c.timeToLand) && void 0 !== t ? t : 1 / 0) <= this.config.nukeEvacuationLeadTime) {
i.nukeDetected || (i.nukeDetected = !0);
var l = s.length;
qe.warn("Triggering evacuation for ".concat(n, ": ").concat(l, " nuke(s) detected, impact in ").concat(null !== (r = c.timeToLand) && void 0 !== r ? r : 0, " ticks"), {
subsystem: "Evacuation"
}), this.startEvacuation(n, "nuke", Game.time + (null !== (o = c.timeToLand) && void 0 !== o ? o : 0));
continue;
}
}
if (i.danger >= this.config.triggerDangerLevel && "siege" === i.posture) {
var u = ti(a.find(FIND_HOSTILE_CREEPS)), m = a.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.body.map(function(e) {
return e.type;
});
return t.includes(ATTACK) || t.includes(RANGED_ATTACK);
}
});
if (u.length > 3 * m.length) {
this.startEvacuation(n, "siege");
continue;
}
}
}
}
}
}, e.prototype.startEvacuation = function(e, t, r) {
var o;
if (this.evacuations.has(e)) return !1;
var n = Game.rooms[e];
if (!n || !(null === (o = n.controller) || void 0 === o ? void 0 : o.my)) return !1;
var a = this.findEvacuationTarget(e);
if (!a) return qe.error("Cannot evacuate ".concat(e, ": no valid target room found"), {
subsystem: "Evacuation"
}), !1;
var i = {
roomName: e,
reason: t,
startedAt: Game.time,
targetRoom: a,
resourcesEvacuated: [],
creepsRecalled: [],
progress: 0,
complete: !1,
deadline: r
};
this.evacuations.set(e, i);
var s = Yt.getSwarmState(e);
return s && (s.posture = "evacuate"), qe.warn("Starting evacuation of ".concat(e, " (").concat(t, "), target: ").concat(a) + (r ? ", deadline: ".concat(r - Game.time, " ticks") : ""), {
subsystem: "Evacuation"
}), !0;
}, e.prototype.findEvacuationTarget = function(e) {
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
var s = ti(t.find(FIND_HOSTILE_CREEPS));
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
}, e.prototype.processEvacuation = function(e) {
var t = Game.rooms[e.roomName], r = Game.rooms[e.targetRoom];
if (!t) return e.complete = !0, void qe.error("Lost room ".concat(e.roomName, " during evacuation"), {
subsystem: "Evacuation"
});
this.transfersThisTick < this.config.maxTransfersPerTick && this.transferResources(e, t, r), 
this.recallCreeps(e, t), e.progress = this.calculateProgress(e, t), e.progress >= 100 && (e.complete = !0, 
qe.info("Evacuation of ".concat(e.roomName, " complete: ") + "".concat(e.resourcesEvacuated.reduce(function(e, t) {
return e + t.amount;
}, 0), " resources, ") + "".concat(e.creepsRecalled.length, " creeps"), {
subsystem: "Evacuation"
})), e.deadline && Game.time >= e.deadline && (e.complete = !0, qe.warn("Evacuation of ".concat(e.roomName, " reached deadline"), {
subsystem: "Evacuation"
}));
}, e.prototype.transferResources = function(e, t, r) {
var o, a, i, s, c = t.terminal, l = null == r ? void 0 : r.terminal;
if (c && l) {
var u = Game.map.getRoomLinearDistance(t.name, e.targetRoom), m = function(e) {
return Math.ceil(e * (1 - Math.exp(-u / 30)));
};
try {
for (var p = n(this.config.priorityResources), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
if (!((R = c.store.getUsedCapacity(f)) <= 0 || (E = l.store.getFreeCapacity(f)) <= 0)) {
var y = m(R), g = c.store.getUsedCapacity(RESOURCE_ENERGY);
if (!(f !== RESOURCE_ENERGY && y > g || (T = Math.min(R, E, 5e4)) <= 0 || c.send(f, T, e.targetRoom) !== OK)) return e.resourcesEvacuated.push({
resourceType: f,
amount: T
}), this.transfersThisTick++, void qe.debug("Evacuated ".concat(T, " ").concat(f, " from ").concat(t.name, " to ").concat(e.targetRoom), {
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
d && !d.done && (a = p.return) && a.call(p);
} finally {
if (o) throw o.error;
}
}
try {
for (var h = n(Object.keys(c.store)), v = h.next(); !v.done; v = h.next()) {
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
}, e.prototype.recallCreeps = function(e, t) {
var r, o;
try {
for (var a = n(t.find(FIND_MY_CREEPS)), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.memory;
c.evacuating || (c.evacuating = !0, c.evacuationTarget = e.targetRoom, e.creepsRecalled.push(s.name));
}
} catch (e) {
r = {
error: e
};
} finally {
try {
i && !i.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.calculateProgress = function(e, t) {
var r = t.terminal, o = t.storage, n = 0, a = 0;
r && (n += 1e5, a += r.store.getUsedCapacity()), o && (n += o.store.getCapacity(), 
a += o.store.getUsedCapacity());
var i = n > 0 ? Math.min(100, (n - a) / n * 100) : 100, s = t.find(FIND_MY_CREEPS).length, c = e.creepsRecalled.length > 0 ? Math.min(100, (e.creepsRecalled.length - s) / e.creepsRecalled.length * 100) : 100;
return Math.round((i + c) / 2);
}, e.prototype.cancelEvacuation = function(e) {
var t, r, o = this.evacuations.get(e);
if (o) {
this.evacuations.delete(e);
try {
for (var a = n(o.creepsRecalled), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Game.creeps[s];
if (c) {
var l = c.memory;
delete l.evacuating, delete l.evacuationTarget;
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
var u = Yt.getSwarmState(e);
u && (u.posture = "eco"), qe.info("Evacuation of ".concat(e, " cancelled"), {
subsystem: "Evacuation"
});
}
}, e.prototype.getEvacuationState = function(e) {
return this.evacuations.get(e);
}, e.prototype.isEvacuating = function(e) {
var t = this.evacuations.get(e);
return void 0 !== t && !t.complete;
}, e.prototype.getActiveEvacuations = function() {
return Array.from(this.evacuations.values()).filter(function(e) {
return !e.complete;
});
}, o([ yr("cluster:evacuation", "Evacuation Manager", {
priority: jt.HIGH,
interval: 5,
minBucket: 0,
cpuBudget: .02
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), Di = new Li, Fi = de("MilitaryBehaviors"), Bi = "patrol";

function Hi(e) {
var t, r, o = e.find(FIND_MY_SPAWNS), a = o.length, i = e.name, s = fn.get(i, {
namespace: Bi
});
if (s && s.metadata.spawnCount === a) return s.waypoints.map(function(e) {
return new RoomPosition(e.x, e.y, e.roomName);
});
var c = e.name, l = [];
try {
for (var u = n(o), m = u.next(); !m.done; m = u.next()) {
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
spawnCount: a
}
};
return fn.set(i, f, {
namespace: Bi,
ttl: 1e3
}), d;
}

function Wi(e, t) {
var r;
if (0 === t.length) return null;
var o = e.memory;
void 0 === o.patrolIndex && (o.patrolIndex = 0);
var n = t[o.patrolIndex % t.length];
return n && e.pos.getRangeTo(n) <= 2 && (o.patrolIndex = (o.patrolIndex + 1) % t.length), 
null !== (r = t[o.patrolIndex % t.length]) && void 0 !== r ? r : null;
}

function Yi(e) {
var t, r;
if (0 === e.hostiles.length) return null;
var o = e.hostiles.map(function(e) {
var t, r, o = 0;
if (o += 100 * e.getActiveBodyparts(HEAL), o += 50 * e.getActiveBodyparts(RANGED_ATTACK), 
o += 40 * e.getActiveBodyparts(ATTACK), o += 60 * e.getActiveBodyparts(CLAIM), (o += 30 * e.getActiveBodyparts(WORK)) > 0) try {
for (var a = n(e.body), i = a.next(); !i.done; i = a.next()) if (i.value.boost) {
o += 20;
break;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
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

function Ki(e, t) {
return e.getActiveBodyparts(t) > 0;
}

function Vi(e, t) {
if (!e.swarmState) return null;
var r = Aa(e.room.name);
return r && e.creep.pos.getRangeTo(r) > 2 ? (Fi.debug("".concat(e.creep.name, " ").concat(t, " moving to collection point at ").concat(r.x, ",").concat(r.y)), 
{
type: "moveTo",
target: r
}) : null;
}

function ji(e) {
var t;
return null === (t = Memory.squads) || void 0 === t ? void 0 : t[e];
}

function zi(e) {
var t = e.creep.memory;
if (xi(e.creep)) return {
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
var r = Yi(e);
if (r) {
var o = e.creep.pos.getRangeTo(r), n = Ki(e.creep, RANGED_ATTACK), a = Ki(e.creep, ATTACK);
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
var i = Yi(e);
if (i) return o = e.creep.pos.getRangeTo(i), n = Ki(e.creep, RANGED_ATTACK), a = Ki(e.creep, ATTACK), 
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
var s = Hi(e.room), c = Wi(e.creep, s);
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

function qi(e) {
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
var l = xn(e.creep, c, "healer_follow", 5);
if (l) return {
type: "moveTo",
target: l
};
}
var u = Hi(e.room), m = Wi(e.creep, u);
return m ? {
type: "moveTo",
target: m
} : {
type: "idle"
};
}

function Xi(e) {
var t;
if (e.memory.squadId) {
var r = ji(e.memory.squadId);
if (r) return Ji(e, r);
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
var a = Yi(e);
if (a) {
var i = e.creep.pos.getRangeTo(a), s = Ki(e.creep, RANGED_ATTACK), c = Ki(e.creep, ATTACK);
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
var l = Yo(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
if (l) return {
type: "attack",
target: l
};
var u = Hi(e.room), m = Wi(e.creep, u);
if (m) return {
type: "moveTo",
target: m
};
var p = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (p.length > 0) {
var d = xn(e.creep, p, "soldier_spawn", 20);
if (d && e.creep.pos.getRangeTo(d) > 5) return {
type: "moveTo",
target: d
};
}
return {
type: "idle"
};
}

function Qi(e) {
var t;
if (e.memory.squadId) {
var r = ji(e.memory.squadId);
if (r) return Ji(e, r);
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
var a = Yo(e.creep.pos, FIND_HOSTILE_SPAWNS);
if (a) return {
type: "dismantle",
target: a
};
var i = Yo(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
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
var c = xn(e.creep, s, "siege_wall", 10);
if (c) return {
type: "dismantle",
target: c
};
}
var l = Yo(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
if (l) return {
type: "dismantle",
target: l
};
var u = Vi(e, "siegeUnit");
if (u) return u;
var m = Hi(e.room), p = Wi(e.creep, m);
return p ? {
type: "moveTo",
target: p
} : {
type: "idle"
};
}

function Zi(e) {
var t = e.creep.memory;
if (xi(e.creep)) return {
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
var n = Yi(e);
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
var a = ji(e.memory.squadId);
if (a) return Ji(e, a);
}
var i, s = Yi(e);
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
var c = Hi(e.room), l = Wi(e.creep, c);
if (l) return {
type: "moveTo",
target: l
};
var u = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (u.length > 0) {
var m = xn(e.creep, u, "harasser_home_spawn", 20);
if (m && e.creep.pos.getRangeTo(m) > 10) return {
type: "moveTo",
target: m
};
}
return {
type: "idle"
};
}

function Ji(e, t) {
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
return Xi(e);

case "healer":
return qi(e);

case "siegeUnit":
return Qi(e);

case "ranger":
return Zi(e);
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

var $i = {
guard: zi,
remoteGuard: function(e) {
var t = e.creep.memory;
if (!t.targetRoom) {
if (e.creep.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = Hi(e.room);
return (o = Wi(e.creep, r)) ? {
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
var o, a = e.room.find(FIND_HOSTILE_CREEPS).filter(function(e) {
return e.body.some(function(e) {
return e.type === ATTACK || e.type === RANGED_ATTACK || e.type === WORK;
});
});
if (0 === a.length) return e.creep.room.name !== e.homeRoom ? {
type: "moveToRoom",
roomName: e.homeRoom
} : (r = Hi(e.room), (o = Wi(e.creep, r)) ? {
type: "moveTo",
target: o
} : {
type: "idle"
});
var i = function(e, t) {
var r, o;
if (0 === t.length) return null;
var a = [ t.filter(function(e) {
return e.body.some(function(e) {
return e.boost;
});
}), t.filter(function(e) {
return Ki(e, HEAL);
}), t.filter(function(e) {
return Ki(e, RANGED_ATTACK);
}), t.filter(function(e) {
return Ki(e, ATTACK);
}), t ];
try {
for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
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
}(e, a);
if (i) {
var s = e.creep.pos.getRangeTo(i), c = Ki(e.creep, RANGED_ATTACK), l = Ki(e.creep, ATTACK);
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
healer: qi,
soldier: Xi,
siegeUnit: Qi,
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
if (!t) return Vi(e, "harasser (no target)") || {
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
var s = Vi(e, "harasser (no targets)");
if (s) return s;
var c = Hi(e.room), l = Wi(e.creep, c);
return l ? {
type: "moveTo",
target: l
} : {
type: "idle"
};
},
ranger: Zi
};

function es(e) {
var t;
return (null !== (t = $i[e.memory.role]) && void 0 !== t ? t : zi)(e);
}

function ts(e, t) {
var r = e.effects;
return void 0 !== r && Array.isArray(r) && r.some(function(e) {
return e.effect === t;
});
}

function rs(e) {
var t = e.memory.targetRoom;
if (!t) return {
type: "idle"
};
if (e.room.name !== t) return {
type: "moveToRoom",
roomName: t
};
var r = Cn(e.room, FIND_STRUCTURES, {
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
var o = Cn(e.room, FIND_MY_CREEPS, {
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

var os = {
powerHarvester: rs,
powerCarrier: function(e) {
var t = e.memory.targetRoom;
if (e.creep.store.getUsedCapacity(RESOURCE_POWER) > 0) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = Game.rooms[e.homeRoom];
if (r) {
var o = wn(r, STRUCTURE_POWER_SPAWN)[0];
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
var n = On(e.room, RESOURCE_POWER)[0];
if (n) return {
type: "pickup",
target: n
};
var a = Cn(e.room, FIND_RUINS, {
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
var i = Cn(e.room, FIND_STRUCTURES, {
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

function ns(e) {
var t;
return (null !== (t = os[e.memory.role]) && void 0 !== t ? t : rs)(e);
}

function as(e, t) {
var r, o, n, a, i, s, c, l = t.knownRooms, u = l[e.name], m = null !== (r = null == u ? void 0 : u.lastSeen) && void 0 !== r ? r : 0, p = Game.time - m;
if (u && p < 2e3) {
u.lastSeen = Game.time;
var d = Wo(e, FIND_HOSTILE_CREEPS);
return u.threatLevel = d.length > 5 ? 3 : d.length > 2 ? 2 : d.length > 0 ? 1 : 0, 
void (e.controller && (u.controllerLevel = null !== (o = e.controller.level) && void 0 !== o ? o : 0, 
(null === (n = e.controller.owner) || void 0 === n ? void 0 : n.username) && (u.owner = e.controller.owner.username), 
(null === (a = e.controller.reservation) || void 0 === a ? void 0 : a.username) && (u.reserver = e.controller.reservation.username)));
}
for (var f = e.find(FIND_SOURCES), y = e.find(FIND_MINERALS)[0], g = e.controller, h = Wo(e, FIND_HOSTILE_CREEPS), v = e.getTerrain(), R = 0, E = 0, T = 5; T < 50; T += 10) for (var C = 5; C < 50; C += 10) {
var S = v.get(T, C);
S === TERRAIN_MASK_SWAMP ? R++ : 0 === S && E++;
}
var w = R > 2 * E ? "swamp" : E > 2 * R ? "plains" : "mixed", O = e.name.match(/^[WE](\d+)[NS](\d+)$/), b = !!O && (parseInt(O[1], 10) % 10 == 0 || parseInt(O[2], 10) % 10 == 0), _ = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_KEEPER_LAIR;
}
}).length > 0, x = {
name: e.name,
lastSeen: Game.time,
sources: f.length,
controllerLevel: null !== (i = null == g ? void 0 : g.level) && void 0 !== i ? i : 0,
threatLevel: h.length > 5 ? 3 : h.length > 2 ? 2 : h.length > 0 ? 1 : 0,
scouted: !0,
terrain: w,
isHighway: b,
isSK: _
};
(null === (s = null == g ? void 0 : g.owner) || void 0 === s ? void 0 : s.username) && (x.owner = g.owner.username), 
(null === (c = null == g ? void 0 : g.reservation) || void 0 === c ? void 0 : c.username) && (x.reserver = g.reservation.username), 
(null == y ? void 0 : y.mineralType) && (x.mineralType = y.mineralType), l[e.name] = x;
}

function is(e) {
return {
type: "moveTo",
target: new RoomPosition(25, 25, e)
};
}

function ss(e) {
var t = Ma.getEmpire();
if (Ua.isExit(e.creep.pos)) return is(e.room.name);
var r = e.memory.lastExploredRoom, o = e.memory.targetRoom;
if (!o) {
if (o = function(e, t, r) {
var o, i, s, c, l, u = t.knownRooms, m = Game.map.describeExits(e);
if (m) {
var p = [];
try {
for (var d = n(Object.entries(m)), f = d.next(); !f.done; f = d.next()) {
var y = a(f.value, 2)[1];
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
f && !f.done && (i = d.return) && i.call(d);
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
var i = function(e) {
var t, r, o = [ new RoomPosition(5, 5, e.name), new RoomPosition(44, 5, e.name), new RoomPosition(5, 44, e.name), new RoomPosition(44, 44, e.name), new RoomPosition(25, 25, e.name) ], a = e.getTerrain();
try {
for (var i = n(o), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (a.get(c.x, c.y) !== TERRAIN_MASK_WALL) return c;
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
return i ? e.creep.pos.getRangeTo(i) <= 3 ? (as(e.room, t), e.memory.lastExploredRoom = e.room.name, 
delete e.memory.targetRoom, {
type: "idle"
}) : {
type: "moveTo",
target: i
} : (as(e.room, t), e.memory.lastExploredRoom = e.room.name, delete e.memory.targetRoom, 
{
type: "idle"
});
}
return {
type: "idle"
};
}

var cs, ls = {
scout: ss,
claimer: function(e) {
var t = e.memory.targetRoom;
if (!t) {
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (r.length > 0) {
var o = xn(e.creep, r, "claimer_spawn", 20);
if (o) return {
type: "moveTo",
target: o
};
}
return {
type: "idle"
};
}
if (Ua.isExit(e.creep.pos)) return is(e.room.name);
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
var n = xn(e.creep, o, "engineer_critical", 5);
if (n) return {
type: "repair",
target: n
};
}
var a = e.repairTargets.filter(function(e) {
return (e.structureType === STRUCTURE_ROAD || e.structureType === STRUCTURE_CONTAINER) && e.hits < .75 * e.hitsMax;
});
if (a.length > 0) {
var i = xn(e.creep, a, "engineer_infra", 5);
if (i) return {
type: "repair",
target: i
};
}
var s = null !== (r = null === (t = e.swarmState) || void 0 === t ? void 0 : t.danger) && void 0 !== r ? r : 0, c = 0 === s ? 1e5 : 1 === s ? 3e5 : 2 === s ? 5e6 : 5e7, l = e.repairTargets.filter(function(e) {
return e.structureType === STRUCTURE_RAMPART && e.hits < c;
});
if (l.length > 0) {
var u = xn(e.creep, l, "engineer_rampart", 5);
if (u) return {
type: "repair",
target: u
};
}
var m = e.repairTargets.filter(function(e) {
return e.structureType === STRUCTURE_WALL && e.hits < c;
});
if (m.length > 0) {
var p = xn(e.creep, m, "engineer_wall", 5);
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
var f = xn(e.creep, d, "engineer_cont", 15);
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
var n = xn(e.creep, o, "remoteWorker_spawn", 5);
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
var o = e.terminal.store.getUsedCapacity(RESOURCE_ENERGY), a = e.storage.store.getUsedCapacity(RESOURCE_ENERGY);
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
if (o < 4e4 && a > 2e4) return {
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
for (var i = n(Object.keys(e.storage.store)), s = i.next(); !s.done; s = i.next()) {
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

function us(e) {
var t;
return (null !== (t = ls[e.memory.role]) && void 0 !== t ? t : ss)(e);
}

function ms(e) {
var t = function(e) {
var t, r, o;
if (!e.room) return null;
var a = e.room, i = null !== (o = e.memory.homeRoom) && void 0 !== o ? o : a.name, s = wn(a, STRUCTURE_LAB), c = wn(a, STRUCTURE_SPAWN), l = wn(a, STRUCTURE_EXTENSION), u = wn(a, STRUCTURE_FACTORY)[0], m = wn(a, STRUCTURE_POWER_SPAWN)[0], p = [];
try {
for (var d = n(Object.keys(e.powers)), f = d.next(); !f.done; f = d.next()) {
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
room: a,
homeRoom: i,
isInHomeRoom: a.name === i,
storage: a.storage,
terminal: a.terminal,
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
(t.target ? e.usePower(t.power, t.target) : e.usePower(t.power)) === ERR_NOT_IN_RANGE && t.target && Ua.moveTo(e, t.target);
break;

case "moveTo":
Ua.moveTo(e, t.target);
break;

case "moveToRoom":
var o = new RoomPosition(25, 25, t.roomName);
Ua.moveTo(e, {
pos: o,
range: 20
}, {
maxRooms: 16
});
break;

case "renewSelf":
e.renew(t.spawn) === ERR_NOT_IN_RANGE && Ua.moveTo(e, t.spawn);
break;

case "enableRoom":
(null === (r = e.room) || void 0 === r ? void 0 : r.controller) && e.enableRoom(e.room.controller) === ERR_NOT_IN_RANGE && Ua.moveTo(e, e.room.controller);
}
}(e, function(e) {
return "powerWarrior" === e.powerCreep.memory.role ? function(e) {
var t, r;
if (void 0 !== e.powerCreep.ticksToLive && e.powerCreep.ticksToLive < 1e3 && e.powerSpawn) return {
type: "renewSelf",
spawn: e.powerSpawn
};
var o = e.availablePowers, s = Wo(e.room, FIND_HOSTILE_CREEPS), c = Wo(e.room, FIND_HOSTILE_STRUCTURES);
if (e.room.controller && !e.room.controller.isPowerEnabled) return {
type: "enableRoom"
};
if (o.includes(PWR_GENERATE_OPS) && e.ops < 20) return {
type: "usePower",
power: PWR_GENERATE_OPS
};
if (o.includes(PWR_SHIELD) && e.ops >= 10 && s.length > 0) {
var l = Cn(e.room, FIND_MY_CREEPS, {
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
var u = Wo(e.room, FIND_HOSTILE_SPAWNS, {
filter: function(e) {
return !ts(e, PWR_DISRUPT_SPAWN);
}
})[0];
if (u) return {
type: "usePower",
power: PWR_DISRUPT_SPAWN,
target: u
};
}
if (o.includes(PWR_DISRUPT_TOWER) && e.ops >= 10) {
var m = Wo(e.room, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !ts(e, PWR_DISRUPT_TOWER);
}
})[0];
if (m) return {
type: "usePower",
power: PWR_DISRUPT_TOWER,
target: m
};
}
if (o.includes(PWR_OPERATE_TOWER) && e.ops >= 10 && s.length > 0) {
var p = Cn(e.room, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !ts(e, PWR_OPERATE_TOWER);
},
filterKey: "towerNoEffect"
})[0];
if (p) return {
type: "usePower",
power: PWR_OPERATE_TOWER,
target: p
};
}
if (o.includes(PWR_FORTIFY) && e.ops >= 5 && s.length > 0) {
var d = i(i([], a(e.spawns), !1), [ e.storage, e.terminal ], !1).filter(function(e) {
return void 0 !== e;
});
try {
for (var f = n(d), y = f.next(); !y.done; y = f.next()) {
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
var v = Cn(e.room, FIND_STRUCTURES, {
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
return e.structureType === STRUCTURE_TERMINAL && !ts(e, PWR_DISRUPT_TERMINAL);
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
if (s.length > 0) {
var E = e.powerCreep.pos.findClosestByRange(s);
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
return null !== t.spawning && !ts(t, PWR_OPERATE_SPAWN);
});
if (r) return {
type: "usePower",
power: PWR_OPERATE_SPAWN,
target: r
};
}
if (t.includes(PWR_OPERATE_EXTENSION) && e.ops >= 2 && e.extensions.reduce(function(e, t) {
return e + t.store.getFreeCapacity(RESOURCE_ENERGY);
}, 0) > 1e3 && e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1e4 && !ts(e.storage, PWR_OPERATE_EXTENSION)) return {
type: "usePower",
power: PWR_OPERATE_EXTENSION,
target: e.storage
};
if (t.includes(PWR_OPERATE_TOWER) && e.ops >= 10 && Cn(e.room, FIND_HOSTILE_CREEPS).length > 0) {
var o = Cn(e.room, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !ts(e, PWR_OPERATE_TOWER);
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
return 0 === e.cooldown && e.mineralType && !ts(e, PWR_OPERATE_LAB);
});
if (n) return {
type: "usePower",
power: PWR_OPERATE_LAB,
target: n
};
}
if (t.includes(PWR_OPERATE_FACTORY) && e.ops >= 100 && e.factory && 0 === e.factory.cooldown && !ts(e.factory, PWR_OPERATE_FACTORY)) return {
type: "usePower",
power: PWR_OPERATE_FACTORY,
target: e.factory
};
if (t.includes(PWR_OPERATE_STORAGE) && e.ops >= 100 && e.storage && e.storage.store.getUsedCapacity() > .85 * e.storage.store.getCapacity() && !ts(e.storage, PWR_OPERATE_STORAGE)) return {
type: "usePower",
power: PWR_OPERATE_STORAGE,
target: e.storage
};
if (t.includes(PWR_REGEN_SOURCE) && e.ops >= 100) {
var a = Cn(e.room, FIND_SOURCES, {
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

function ps(e, t, r) {
var o = 0;
if ("guard" !== r && "ranger" !== r && "healer" !== r || (o += function(e, t, r) {
var o = Ui(e), n = ki(e);
if (0 === o.guards && 0 === o.rangers && 0 === o.healers) return 0;
var a = 0;
return ("guard" === r && n.guards < o.guards || "ranger" === r && n.rangers < o.rangers || "healer" === r && n.healers < o.healers) && (a = 100 * o.urgency), 
a;
}(e, 0, r)), "upgrader" === r && t.clusterId) {
var n = Yt.getCluster(t.clusterId);
(null == n ? void 0 : n.focusRoom) === e.name && (o += 40);
}
return o;
}

function ds(e, t) {
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

var fs, ys = {
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
criticalResourceThresholds: (cs = {}, cs[RESOURCE_GHODIUM] = 5e3, cs),
enabled: !0
}, gs = function() {
function e(e, t) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = r(r({}, ys), e), this.memoryAccessor = t;
}
return e.prototype.setMemoryAccessor = function(e) {
this.memoryAccessor = e;
}, e.prototype.run = function() {
this.config.enabled && (this.lastRun = Game.time, this.memoryAccessor && this.memoryAccessor.ensurePixelBuyingMemory(), 
this.isPurchaseCooldownComplete() && (this.hasSurplusResources() ? this.hasEnoughCredits() ? (this.attemptPixelPurchase(), 
this.updateMemory()) : ye.debug("Pixel buying skipped: insufficient credits", {
subsystem: "PixelBuying"
}) : ye.debug("Pixel buying skipped: no resource surplus", {
subsystem: "PixelBuying"
})));
}, e.prototype.getPixelBuyingMemory = function() {
var e;
return null === (e = this.memoryAccessor) || void 0 === e ? void 0 : e.getPixelBuyingMemory();
}, e.prototype.isPurchaseCooldownComplete = function() {
var e = this.getPixelBuyingMemory();
return !e || Game.time - e.lastPurchaseTick >= this.config.purchaseCooldown;
}, e.prototype.hasSurplusResources = function() {
var e, t, r, o, i, s, c = this.calculateTotalResources(), l = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}).length, u = l * this.config.energyThresholdPerRoom;
if (c.energy < u + this.config.minEnergySurplus) return ye.debug("Pixel buying: energy below surplus (".concat(c.energy, " < ").concat(u + this.config.minEnergySurplus, ")"), {
subsystem: "PixelBuying"
}), !1;
try {
for (var m = n(Object.entries(this.config.criticalResourceThresholds)), p = m.next(); !p.done; p = m.next()) {
var d = a(p.value, 2), f = d[0], y = d[1];
if ((R = null !== (i = c[f]) && void 0 !== i ? i : 0) < y) return ye.debug("Pixel buying: ".concat(f, " below threshold (").concat(R, " < ").concat(y, ")"), {
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
for (var h = n(g), v = h.next(); !v.done; v = h.next()) {
var R, E = v.value;
if ((R = null !== (s = c[E]) && void 0 !== s ? s : 0) < this.config.minBaseMineralReserve) return ye.debug("Pixel buying: ".concat(E, " below reserve (").concat(R, " < ").concat(this.config.minBaseMineralReserve, ")"), {
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
if (c <= 0) ye.debug("Cannot afford any pixels after reserve", {
subsystem: "PixelBuying"
}); else {
var l = o.roomName ? Game.market.calcTransactionCost(c, a.name, o.roomName) : 0;
if (a.terminal.store[RESOURCE_ENERGY] < l) ye.debug("Not enough energy for pixel transaction (need ".concat(l, ")"), {
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
}), ye.info("Purchased ".concat(c, " pixels at ").concat(o.price.toFixed(2), " credits each ") + "(total: ".concat(m.toFixed(0), " credits)").concat(n ? " (GOOD PRICE!)" : ""), {
subsystem: "PixelBuying"
});
} else ye.warn("Failed to purchase pixels: error code ".concat(u), {
subsystem: "PixelBuying"
});
}
}
} else ye.debug("No terminal available for pixel purchase", {
subsystem: "PixelBuying"
});
} else ye.debug("Pixel price (".concat(o.price, ") above target (").concat(this.config.targetPixelPrice, "), waiting"), {
subsystem: "PixelBuying"
});
} else ye.debug("No pixel orders below max price (".concat(this.config.maxPixelPrice, ")"), {
subsystem: "PixelBuying"
});
} else ye.debug("No pixel sell orders available", {
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
this.config = r(r({}, this.config), e);
}, e.prototype.getConfig = function() {
return r({}, this.config);
}, e.prototype.enable = function() {
this.config.enabled = !0, ye.info("Pixel buying enabled", {
subsystem: "PixelBuying"
});
}, e.prototype.disable = function() {
this.config.enabled = !1, ye.info("Pixel buying disabled", {
subsystem: "PixelBuying"
});
}, e;
}(), hs = {
enabled: !0,
fullBucketTicksRequired: 25,
bucketMax: 1e4,
cpuCostPerPixel: 1e4,
minBucketAfterGeneration: 0
}, vs = function() {
function e(e, t) {
void 0 === e && (e = {}), this.config = r(r({}, hs), e), this.memoryAccessor = t;
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
e.consecutiveFullTicks = 0, e.bucketFullSince = 0, ye.info("Generated pixel from CPU bucket (total generated: ".concat(e.totalPixelsGenerated, ")"), {
subsystem: "PixelGeneration",
meta: {
bucket: Game.cpu.bucket,
ticksWaited: r
}
});
} else ye.warn("Failed to generate pixel: error code ".concat(t), {
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
this.config.enabled = !0, ye.info("Pixel generation enabled", {
subsystem: "PixelGeneration"
});
}, e.prototype.disable = function() {
this.config.enabled = !1, ye.info("Pixel generation disabled", {
subsystem: "PixelGeneration"
});
}, e.prototype.updateConfig = function(e) {
this.config = r(r({}, this.config), e);
}, e.prototype.getConfig = function() {
return r({}, this.config);
}, e;
}(), Rs = {
minBucket: 0,
minSourceLinkEnergy: 400,
controllerLinkMaxEnergy: 700,
transferThreshold: 100,
storageLinkReserve: 100
};

!function(e) {
e.SOURCE = "source", e.CONTROLLER = "controller", e.STORAGE = "storage", e.UNKNOWN = "unknown";
}(fs || (fs = {}));

var Es, Ts, Cs, Ss, ws, Os, bs, _s, xs, Us, ks, Ms, As, Ns, Is = function() {
function e(e) {
void 0 === e && (e = {}), this.config = r(r({}, Rs), e);
}
return e.prototype.run = function() {
var e, t;
if (!(Game.cpu.bucket < this.config.minBucket)) {
var r = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.controller.level >= 5;
});
try {
for (var o = n(r), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
this.processRoomLinks(i);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
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
return e.role === fs.SOURCE;
}), n = r.filter(function(e) {
return e.role === fs.CONTROLLER;
}), a = r.filter(function(e) {
return e.role === fs.STORAGE;
});
this.executeTransfers(e, o, n, a);
}
}, e.prototype.classifyLinks = function(e, t) {
var r = e.controller, o = e.storage, a = e.find(FIND_SOURCES);
return t.map(function(e) {
var t, i;
if (r && e.pos.getRangeTo(r) <= 2) return {
link: e,
role: fs.CONTROLLER,
priority: 100
};
if (o && e.pos.getRangeTo(o) <= 2) return {
link: e,
role: fs.STORAGE,
priority: 50
};
try {
for (var s = n(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (e.pos.getRangeTo(l) <= 2) return {
link: e,
role: fs.SOURCE,
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
role: fs.UNKNOWN,
priority: 25
};
});
}, e.prototype.executeTransfers = function(e, t, r, o) {
var s, c, l, u, m = this, p = t.filter(function(e) {
return e.link.store.getUsedCapacity(RESOURCE_ENERGY) >= m.config.minSourceLinkEnergy && 0 === e.link.cooldown;
}).sort(function(e, t) {
return t.link.store.getUsedCapacity(RESOURCE_ENERGY) - e.link.store.getUsedCapacity(RESOURCE_ENERGY);
});
if (0 !== p.length) {
var d = i(i([], a(r), !1), a(o), !1).filter(function(e) {
return e.link.store.getFreeCapacity(RESOURCE_ENERGY) > m.config.transferThreshold;
}).sort(function(e, t) {
return t.priority - e.priority;
});
if (0 !== d.length) try {
for (var f = n(p), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
if (!(g.link.cooldown > 0)) {
var h = null;
try {
for (var v = (l = void 0, n(d)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
if (!(E.link.store.getFreeCapacity(RESOURCE_ENERGY) < this.config.transferThreshold)) {
if (E.role === fs.CONTROLLER && E.link.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.controllerLinkMaxEnergy) {
h = E;
break;
}
if (E.role !== fs.STORAGE) !h && E.link.store.getFreeCapacity(RESOURCE_ENERGY) > this.config.transferThreshold && (h = E); else if (E.link.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.storageLinkReserve) {
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
C === OK ? qe.debug("Link transfer: ".concat(T, " energy from ").concat(g.link.pos, " to ").concat(h.link.pos, " (").concat(h.role, ")"), {
subsystem: "Link",
room: e.name
}) : C !== ERR_TIRED && C !== ERR_FULL && qe.warn("Link transfer failed: ".concat(C, " from ").concat(g.link.pos, " to ").concat(h.link.pos), {
subsystem: "Link",
room: e.name
});
}
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
y && !y.done && (c = f.return) && c.call(f);
} finally {
if (s) throw s.error;
}
}
}
}, e.prototype.getLinkRole = function(e) {
var t, r, o = e.room, a = o.controller, i = o.storage, s = o.find(FIND_SOURCES);
if (a && e.pos.getRangeTo(a) <= 2) return fs.CONTROLLER;
if (i && e.pos.getRangeTo(i) <= 2) return fs.STORAGE;
try {
for (var c = n(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (e.pos.getRangeTo(u) <= 2) return fs.SOURCE;
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
return fs.UNKNOWN;
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
return e.role === fs.SOURCE;
}), a = o.some(function(e) {
return e.role === fs.CONTROLLER || e.role === fs.STORAGE;
});
return n && a;
}, o([ yr("link:manager", "Link Manager", {
priority: jt.MEDIUM,
interval: 5,
minBucket: 0,
cpuBudget: .05
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), Ps = new Is, Gs = {
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
sellThresholds: (Es = {}, Es[RESOURCE_ENERGY] = 5e5, Es[RESOURCE_HYDROGEN] = 2e4, 
Es[RESOURCE_OXYGEN] = 2e4, Es[RESOURCE_UTRIUM] = 2e4, Es[RESOURCE_LEMERGIUM] = 2e4, 
Es[RESOURCE_KEANIUM] = 2e4, Es[RESOURCE_ZYNTHIUM] = 2e4, Es[RESOURCE_CATALYST] = 2e4, 
Es),
buyThresholds: (Ts = {}, Ts[RESOURCE_ENERGY] = 1e5, Ts[RESOURCE_HYDROGEN] = 5e3, 
Ts[RESOURCE_OXYGEN] = 5e3, Ts[RESOURCE_UTRIUM] = 5e3, Ts[RESOURCE_LEMERGIUM] = 5e3, 
Ts[RESOURCE_KEANIUM] = 5e3, Ts[RESOURCE_ZYNTHIUM] = 5e3, Ts[RESOURCE_CATALYST] = 5e3, 
Ts),
trackedResources: [ RESOURCE_ENERGY, RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_GHODIUM, RESOURCE_POWER ],
criticalResources: [ RESOURCE_ENERGY, RESOURCE_GHODIUM ],
emergencyBuyThreshold: 5e3,
orderExtensionAge: 5e3,
maxTransportCostRatio: .3
}, Ls = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = r(r({}, Gs), e);
}
return e.prototype.run = function() {
this.lastRun = Game.time, this.ensureMarketMemory(), Game.time % this.config.priceUpdateInterval === 0 && this.updatePriceTracking(), 
this.updateOrderStats(), this.reconcilePendingArbitrage(), this.handleEmergencyBuying(), 
this.cancelOldOrders(), this.manageExistingOrders(), this.updateBuyOrders(), this.updateSellOrders(), 
this.checkArbitrageOpportunities(), this.executeDeal(), Game.time % 200 == 0 && this.balanceResourcesAcrossRooms();
}, e.prototype.ensureMarketMemory = function() {
var e = Yt.getEmpire();
e.market || (e.market = {
resources: {},
lastScan: 0,
pendingArbitrage: [],
completedArbitrage: 0,
arbitrageProfit: 0
}), e.market.orders || (e.market.orders = {}), void 0 === e.market.totalProfit && (e.market.totalProfit = 0), 
e.market.lastBalance || (e.market.lastBalance = 0), e.market.pendingArbitrage || (e.market.pendingArbitrage = []), 
void 0 === e.market.completedArbitrage && (e.market.completedArbitrage = 0), void 0 === e.market.arbitrageProfit && (e.market.arbitrageProfit = 0);
}, e.prototype.updatePriceTracking = function() {
var e, t, r = Yt.getEmpire();
if (r.market) {
try {
for (var o = n(this.config.trackedResources), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
this.updateResourcePrice(i);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
r.market.lastScan = Game.time, qe.debug("Updated market prices for ".concat(this.config.trackedResources.length, " resources"), {
subsystem: "Market"
});
}
}, e.prototype.updateResourcePrice = function(e) {
var t = Yt.getEmpire();
if (t.market) {
var r = Game.market.getHistory(e);
if (0 !== r.length) {
var o = r[r.length - 1], n = t.market.resources[e];
n || (n = {
resource: e,
priceHistory: [],
avgPrice: o.avgPrice,
trend: 0,
lastUpdate: Game.time
}, t.market.resources[e] = n);
var a = {
tick: Game.time,
avgPrice: o.avgPrice,
lowPrice: o.avgPrice * this.config.lowPriceMultiplier,
highPrice: o.avgPrice * this.config.highPriceMultiplier
};
n.priceHistory.push(a), n.priceHistory.length > this.config.maxPriceHistory && n.priceHistory.shift();
var i = n.priceHistory.slice(-this.config.rollingAverageWindow);
if (n.avgPrice = i.reduce(function(e, t) {
return e + t.avgPrice;
}, 0) / i.length, n.priceHistory.length >= 5) {
var s = n.priceHistory.slice(-5, -2).reduce(function(e, t) {
return e + t.avgPrice;
}, 0) / 3, c = (n.priceHistory.slice(-3).reduce(function(e, t) {
return e + t.avgPrice;
}, 0) / 3 - s) / s;
c > this.config.trendChangeThreshold ? n.trend = 1 : c < -this.config.trendChangeThreshold ? n.trend = -1 : n.trend = 0;
}
if (i.length >= 5) {
var l = n.avgPrice, u = i.reduce(function(e, t) {
return e + Math.pow(t.avgPrice - l, 2);
}, 0) / i.length, m = Math.sqrt(u);
n.volatility = m / l;
}
if (n.priceHistory.length >= 3) {
var p = n.priceHistory.slice(-3), d = (p[2].avgPrice - p[0].avgPrice) / 2;
n.predictedPrice = p[2].avgPrice + d;
}
n.lastUpdate = Game.time;
}
}
}, e.prototype.getMarketData = function(e) {
var t;
return null === (t = Yt.getEmpire().market) || void 0 === t ? void 0 : t.resources[e];
}, e.prototype.isBuyOpportunity = function(e) {
var t = this.getMarketData(e);
if (!t) return !1;
var r = Game.market.getHistory(e);
return 0 !== r.length && r[r.length - 1].avgPrice <= t.avgPrice * this.config.buyPriceThreshold;
}, e.prototype.isSellOpportunity = function(e) {
var t = this.getMarketData(e);
if (!t) return !1;
var r = Game.market.getHistory(e);
return 0 !== r.length && r[r.length - 1].avgPrice >= t.avgPrice * this.config.sellPriceThreshold;
}, e.prototype.cancelOldOrders = function() {
var e = Game.market.orders;
for (var t in e) {
var r = e[t];
Game.time - r.created > 1e4 && (Game.market.cancelOrder(t), qe.info("Cancelled old order: ".concat(r.type, " ").concat(r.resourceType), {
subsystem: "Market"
})), r.remainingAmount < 100 && Game.market.cancelOrder(t);
}
}, e.prototype.updateBuyOrders = function() {
var e, t, r, o = Yt.getEmpire().objectives.warMode, n = {};
for (var a in Game.rooms) {
var i = Game.rooms[a];
if (i.terminal && (null === (e = i.controller) || void 0 === e ? void 0 : e.my)) for (var s in i.terminal.store) n[s] = (null !== (t = n[s]) && void 0 !== t ? t : 0) + i.terminal.store[s];
}
for (var s in this.config.buyThresholds) {
var c = this.config.buyThresholds[s], l = null !== (r = n[s]) && void 0 !== r ? r : 0;
if (l < c) {
var u = this.isBuyOpportunity(s);
o || u ? this.createBuyOrder(s, c - l, o, u) : qe.debug("Skipping buy for ".concat(s, ": waiting for better price"), {
subsystem: "Market"
});
}
}
}, e.prototype.createBuyOrder = function(e, t, r, o) {
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
qe.info("Created buy order: ".concat(t, " ").concat(e, " at ").concat(i.toFixed(3), " credits").concat(u), {
subsystem: "Market"
});
}
}
}
}
}, e.prototype.sellSurplusFromTerminal = function(e, t, r) {
var o, n = Game.rooms[e];
if (!(null == n ? void 0 : n.terminal) || !(null === (o = n.controller) || void 0 === o ? void 0 : o.my)) return qe.warn("Cannot sell from ".concat(e, ": no terminal or not owned"), {
subsystem: "Market"
}), !1;
var a = n.terminal.store.getUsedCapacity(t);
if (a < r) return qe.debug("Cannot sell ".concat(r, " ").concat(t, " from ").concat(e, ": only ").concat(a, " available"), {
subsystem: "Market"
}), !1;
var i = Yt.getEmpire();
if (!i.market) return Game.market.createOrder({
type: ORDER_SELL,
resourceType: t,
price: .5,
totalAmount: r,
roomName: e
}) === OK;
var s = i.market.resources[t], c = .5;
if (null == s ? void 0 : s.avgPrice) c = .95 * s.avgPrice; else {
var l = Game.market.getAllOrders({
type: ORDER_BUY,
resourceType: t
});
l.length > 0 && (l.sort(function(e, t) {
return t.price - e.price;
}), c = l[0].price);
}
var u = Game.market.createOrder({
type: ORDER_SELL,
resourceType: t,
price: c,
totalAmount: r,
roomName: e
});
return u === OK ? (qe.info("Created surplus sell order: ".concat(r, " ").concat(t, " from ").concat(e, " at ").concat(c.toFixed(3), " credits/unit"), {
subsystem: "Market"
}), !0) : (qe.warn("Failed to create sell order: ".concat(u, " for ").concat(r, " ").concat(t, " from ").concat(e), {
subsystem: "Market"
}), !1);
}, e.prototype.updateSellOrders = function() {
var e, t, r, o = {};
for (var n in Game.rooms) {
var a = Game.rooms[n];
if (a.terminal && (null === (e = a.controller) || void 0 === e ? void 0 : e.my)) for (var i in a.terminal.store) o[i] = (null !== (t = o[i]) && void 0 !== t ? t : 0) + a.terminal.store[i];
}
for (var i in this.config.sellThresholds) {
var s = this.config.sellThresholds[i], c = null !== (r = o[i]) && void 0 !== r ? r : 0;
if (c > s) {
var l = this.isSellOpportunity(i);
l ? this.createSellOrder(i, c - s, l) : qe.debug("Holding ".concat(i, " surplus: waiting for better price"), {
subsystem: "Market"
});
}
}
}, e.prototype.createSellOrder = function(e, t, r) {
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
qe.info("Created sell order: ".concat(t, " ").concat(e, " at ").concat(a.toFixed(3), " credits").concat(l), {
subsystem: "Market"
});
}
}
}
}, e.prototype.updateOrderStats = function() {
var e, t, r = Yt.getEmpire();
if (null === (e = r.market) || void 0 === e ? void 0 : e.orders) {
var o = Game.market.orders;
for (var n in r.market.orders) {
var a = r.market.orders[n], i = o[n];
if (i) {
if (void 0 !== i.totalAmount) {
var s = i.totalAmount - i.remainingAmount, c = s - a.totalTraded;
c > 0 && (a.totalTraded = s, a.totalValue += c * i.price);
}
} else {
if (a.totalTraded > 0) {
var l = "sell" === a.type ? a.totalValue : -a.totalValue;
r.market.totalProfit = (null !== (t = r.market.totalProfit) && void 0 !== t ? t : 0) + l, 
qe.info("Order completed: ".concat(a.resource, " ").concat(a.type, " - Traded: ").concat(a.totalTraded, ", Value: ").concat(a.totalValue.toFixed(0), ", Profit: ").concat(l.toFixed(0)), {
subsystem: "Market"
});
}
delete r.market.orders[n];
}
}
}
}, e.prototype.executeDeal = function() {
var e, t;
if (Game.time % 50 == 0 && Yt.getEmpire().objectives.warMode) {
var r = [ RESOURCE_CATALYZED_GHODIUM_ACID, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, RESOURCE_CATALYZED_KEANIUM_ALKALIDE ];
try {
for (var o = n(r), a = o.next(); !a.done; a = o.next()) {
var i = a.value, s = Game.market.getAllOrders({
type: ORDER_SELL,
resourceType: i
});
if (s.length > 0) {
s.sort(function(e, t) {
return e.price - t.price;
});
var c = s[0], l = Object.values(Game.rooms).find(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my);
});
if (l && c.price < 10) {
var u = Math.min(c.amount, 1e3);
Game.market.deal(c.id, u, l.name) === OK && qe.info("Bought ".concat(u, " ").concat(i, " for ").concat(c.price.toFixed(3), " credits/unit"), {
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
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}
}, e.prototype.handleEmergencyBuying = function() {
var e, t, r, o, a;
if (!(Game.market.credits < this.config.emergencyCredits)) {
var i = {};
for (var s in Game.rooms) {
var c = Game.rooms[s];
if (c.terminal && (null === (r = c.controller) || void 0 === r ? void 0 : r.my)) for (var l in c.terminal.store) i[l] = (null !== (o = i[l]) && void 0 !== o ? o : 0) + c.terminal.store[l];
}
try {
for (var u = n(this.config.criticalResources), m = u.next(); !m.done; m = u.next()) {
var p = null !== (a = i[l = m.value]) && void 0 !== a ? a : 0;
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
}, e.prototype.executeEmergencyBuy = function(e, t) {
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
Game.market.deal(n.id, a, o.name) === OK && qe.warn("EMERGENCY BUY: ".concat(a, " ").concat(e, " at ").concat(n.price.toFixed(3), " credits/unit"), {
subsystem: "Market"
});
}
}
}, e.prototype.manageExistingOrders = function() {
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
qe.debug("Extended buy order for ".concat(r.resourceType, ": +").concat(r.remainingAmount, " at ").concat(r.price.toFixed(3)), {
subsystem: "Market"
}));
}
r.type === ORDER_SELL && (i = a * this.config.sellOpportunityAdjustment, r.price > 1.1 * i && r.remainingAmount > 1e3 && (Game.market.extendOrder(t, Math.min(5e3, r.remainingAmount)), 
qe.debug("Extended sell order for ".concat(r.resourceType, ": +").concat(r.remainingAmount, " at ").concat(r.price.toFixed(3)), {
subsystem: "Market"
})));
}
}
}
}
}, e.prototype.reconcilePendingArbitrage = function() {
var e, t, r, o, a, i, s, c = Yt.getEmpire().market;
if ((null == c ? void 0 : c.pendingArbitrage) && 0 !== c.pendingArbitrage.length) {
var l = [];
try {
for (var u = n(c.pendingArbitrage), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = Game.rooms[p.destinationRoom], f = null == d ? void 0 : d.terminal;
if (f && (null === (r = null == d ? void 0 : d.controller) || void 0 === r ? void 0 : r.my)) if (Game.time < p.expectedArrival || f.cooldown > 0) l.push(p); else {
var y = null !== (o = f.store[p.resource]) && void 0 !== o ? o : 0;
if (y < p.amount) l.push(p); else {
var g = !1;
if (p.sellOrderId) {
var h = Game.market.getOrderById(p.sellOrderId);
if (h && h.remainingAmount > 0 && h.roomName) {
var v = Math.min(p.amount, h.remainingAmount, y), R = Game.market.calcTransactionCost(v, f.room.name, h.roomName);
if (f.store[RESOURCE_ENERGY] >= R && Game.market.deal(h.id, v, f.room.name) === OK) {
var E = (h.price - p.buyPrice) * v;
c.totalProfit = (null !== (a = c.totalProfit) && void 0 !== a ? a : 0) + E, c.arbitrageProfit = (null !== (i = c.arbitrageProfit) && void 0 !== i ? i : 0) + E, 
c.completedArbitrage = (null !== (s = c.completedArbitrage) && void 0 !== s ? s : 0) + 1, 
qe.info("Arbitrage complete: sold ".concat(v, " ").concat(p.resource, " from ").concat(f.room.name, " at ").concat(h.price.toFixed(3), ", profit ").concat(E.toFixed(2)), {
subsystem: "Market"
}), g = !0;
}
}
}
g || Game.market.createOrder({
type: ORDER_SELL,
resourceType: p.resource,
price: p.targetSellPrice,
totalAmount: p.amount,
roomName: f.room.name
}) === OK && (qe.info("Arbitrage posted sell order: ".concat(p.amount, " ").concat(p.resource, " at ").concat(p.targetSellPrice.toFixed(3), " from ").concat(f.room.name), {
subsystem: "Market"
}), g = !0), g || l.push(p);
}
} else l.push(p);
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
c.pendingArbitrage = l;
}
}, e.prototype.checkArbitrageOpportunities = function() {
var e, t, r, o, a, i;
if (!(Game.cpu.bucket < this.config.minBucket || Game.market.credits < this.config.tradingCredits)) {
var s = Yt.getEmpire().market, c = Object.values(Game.rooms).filter(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my);
});
if (s && 0 !== c.length) {
var l = function(e) {
var t, r;
return null !== (r = null !== (t = e.remainingAmount) && void 0 !== t ? t : e.amount) && void 0 !== r ? r : 0;
}, u = function(e) {
var t, u, p = Game.market.getAllOrders({
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
if (0 === p.length || 0 === d.length) return "continue";
p.sort(function(e, t) {
return t.price - e.price;
}), d.sort(function(e, t) {
return e.price - t.price;
});
var f = p[0], y = d[0];
if (!f.roomName || !y.roomName) return "continue";
if (null === (r = s.pendingArbitrage) || void 0 === r ? void 0 : r.some(function(e) {
return e.buyOrderId === y.id || e.sellOrderId === f.id;
})) return "continue";
var g = Math.min(l(f), l(y), 5e3);
if (g <= 0) return "continue";
try {
for (var h = (t = void 0, n(c)), v = h.next(); !v.done; v = h.next()) {
var R = v.value, E = R.terminal;
if (!((null !== (o = E.store.getFreeCapacity(e)) && void 0 !== o ? o : 0) < g)) {
var T = Game.market.calcTransactionCost(g, R.name, y.roomName), C = (T + Game.market.calcTransactionCost(g, R.name, f.roomName)) / g, S = f.price - y.price - C;
if (!(S <= 0 || C / y.price > m.config.maxTransportCostRatio || E.store[RESOURCE_ENERGY] < T)) {
var w = y.price * g;
if (!(Game.market.credits - w < m.config.minCredits) && Game.market.deal(y.id, g, R.name) === OK) {
var O = {
id: "".concat(e, "-").concat(Game.time, "-").concat(y.id),
resource: e,
amount: g,
buyOrderId: y.id,
sellOrderId: f.id,
targetSellPrice: f.price,
destinationRoom: R.name,
expectedArrival: Game.time + (null !== (a = E.cooldown) && void 0 !== a ? a : 0) + 1,
buyPrice: y.price,
transportCost: T
};
null === (i = s.pendingArbitrage) || void 0 === i || i.push(O), qe.info("Arbitrage started: bought ".concat(g, " ").concat(e, " at ").concat(y.price.toFixed(3), " to sell @ ").concat(f.price.toFixed(3), " (profit/unit ~").concat(S.toFixed(2), ")"), {
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
v && !v.done && (u = h.return) && u.call(h);
} finally {
if (t) throw t.error;
}
}
}, m = this;
try {
for (var p = n(this.config.trackedResources), d = p.next(); !d.done; d = p.next()) u(d.value);
} catch (t) {
e = {
error: t
};
} finally {
try {
d && !d.done && (t = p.return) && t.call(p);
} finally {
if (e) throw e.error;
}
}
}
}
}, e.prototype.balanceResourcesAcrossRooms = function() {
var e, t, r, o, a, i = Object.values(Game.rooms).filter(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my);
});
if (!(i.length < 2)) try {
for (var s = n(this.config.trackedResources), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = [];
try {
for (var m = (r = void 0, n(i)), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (d.terminal) {
var f = null !== (a = d.terminal.store[l]) && void 0 !== a ? a : 0;
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
(l === RESOURCE_ENERGY && E < .1 * R || l !== RESOURCE_ENERGY && E < 1e3) && g.room.terminal.send(l, R, h.room.name) === OK && qe.info("Balanced ".concat(R, " ").concat(l, ": ").concat(g.room.name, " -> ").concat(h.room.name, " (cost: ").concat(E, " energy)"), {
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
}, o([ gr("empire:market", "Market Manager", {
priority: jt.LOW,
interval: 100,
minBucket: 0,
cpuBudget: .02
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), Ds = new Ls, Fs = function() {
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
var o, a, i, s, c, l, u, m, p, d = this.calculateTransferCost(r, e, t), f = {
path: [ e, t ],
cost: d,
isDirect: !0
}, y = this.buildTerminalGraph();
if (y.length < 3) return f;
var g = new Map, h = new Map, v = new Set;
try {
for (var R = n(y), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
g.set(T.roomName, 1 / 0), v.add(T.roomName);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
E && !E.done && (a = R.return) && a.call(R);
} finally {
if (o) throw o.error;
}
}
for (g.set(e, 0); v.size > 0; ) {
var C = null, S = 1 / 0;
try {
for (var w = (i = void 0, n(v)), O = w.next(); !O.done; O = w.next()) {
var b = O.value, _ = null !== (u = g.get(b)) && void 0 !== u ? u : 1 / 0;
_ < S && (S = _, C = b);
}
} catch (e) {
i = {
error: e
};
} finally {
try {
O && !O.done && (s = w.return) && s.call(w);
} finally {
if (i) throw i.error;
}
}
if (!C || S === 1 / 0) break;
if (C === t) break;
if (v.delete(C), !(this.getPathLength(C, h) >= this.MAX_HOPS)) try {
for (var x = (c = void 0, n(y)), U = x.next(); !U.done; U = x.next()) {
var k = U.value;
if (v.has(k.roomName) && k.roomName !== C) {
var M = this.calculateTransferCost(r, C, k.roomName), A = (null !== (m = g.get(C)) && void 0 !== m ? m : 1 / 0) + M;
A < (null !== (p = g.get(k.roomName)) && void 0 !== p ? p : 1 / 0) && (g.set(k.roomName, A), 
h.set(k.roomName, C));
}
}
} catch (e) {
c = {
error: e
};
} finally {
try {
U && !U.done && (l = x.return) && l.call(x);
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
}, qe.debug("Multi-hop route found: ".concat(I.join(" -> "), " (cost: ").concat(N, " vs direct: ").concat(d, ")"), {
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
for (var o = n(this.costCache.entries()), i = o.next(); !i.done; i = o.next()) {
var s = a(i.value, 2), c = s[0];
s[1].timestamp < r && this.costCache.delete(c);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.getNextHop = function(e, t) {
var r = e.path.indexOf(t);
return -1 === r || r === e.path.length - 1 ? null : e.path[r + 1] || null;
}, e;
}(), Bs = new Fs, Hs = {
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
}, Ws = function() {
function e(e) {
void 0 === e && (e = {}), this.transferQueue = [], this.config = r(r({}, Hs), e);
}
return e.prototype.requestTransfer = function(e, t, r, o, n) {
if (void 0 === n && (n = 3), this.transferQueue.some(function(o) {
return o.fromRoom === e && o.toRoom === t && o.resourceType === r;
})) return qe.debug("Transfer already queued: ".concat(o, " ").concat(r, " from ").concat(e, " to ").concat(t), {
subsystem: "Terminal"
}), !1;
var a = Game.rooms[e], i = Game.rooms[t];
return a && i && a.terminal && i.terminal ? (this.transferQueue.push({
fromRoom: e,
toRoom: t,
resourceType: r,
amount: o,
priority: n
}), qe.info("Queued transfer request: ".concat(o, " ").concat(r, " from ").concat(e, " to ").concat(t, " (priority: ").concat(n, ")"), {
subsystem: "Terminal"
}), !0) : (qe.warn("Cannot queue transfer: rooms or terminals not available", {
subsystem: "Terminal"
}), !1);
}, e.prototype.run = function() {
if (!(Game.cpu.bucket < this.config.minBucket)) {
var e = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.terminal && e.terminal.my && e.terminal.isActive();
});
e.length < 2 || (Bs.clearOldCache(), this.cleanTransferQueue(), this.checkEmergencyTransfers(e), 
this.monitorTerminalCapacity(e), this.balanceEnergy(e), this.balanceMinerals(e), 
this.executeTransfers(e));
}
}, e.prototype.cleanTransferQueue = function() {
this.transferQueue = this.transferQueue.filter(function(e) {
var t = Game.rooms[e.fromRoom], r = Game.rooms[e.toRoom];
return !!(t && r && t.terminal && r.terminal);
});
}, e.prototype.checkEmergencyTransfers = function(e) {
var t, r, o, a, i = this, s = function(t) {
if (!(null === (o = t.controller) || void 0 === o ? void 0 : o.my)) return "continue";
var r = Yt.getSwarmState(t.name);
if (!r) return "continue";
if (r.danger >= c.config.emergencyDangerThreshold) {
var n = t.storage, s = t.terminal;
if ((null !== (a = null == n ? void 0 : n.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== a ? a : 0) + s.store.getUsedCapacity(RESOURCE_ENERGY) < c.config.energyRequestThreshold / 2) {
var l = e.filter(function(e) {
var r;
return e.name !== t.name && (null === (r = e.controller) || void 0 === r ? void 0 : r.my) && e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > i.config.energySendThreshold;
}).sort(function(e, r) {
return Game.map.getRoomLinearDistance(t.name, e.name) - Game.map.getRoomLinearDistance(t.name, r.name);
});
if (l.length > 0 && l[0]) {
var u = l[0];
if (!c.transferQueue.some(function(e) {
return e.toRoom === t.name && e.resourceType === RESOURCE_ENERGY && e.isEmergency;
})) {
var m = Bs.findOptimalRoute(u.name, t.name, c.config.emergencyEnergyAmount);
m && (c.transferQueue.push({
fromRoom: u.name,
toRoom: t.name,
resourceType: RESOURCE_ENERGY,
amount: c.config.emergencyEnergyAmount,
priority: 10,
route: m,
isEmergency: !0
}), qe.warn("Emergency energy transfer queued: ".concat(c.config.emergencyEnergyAmount, " from ").concat(u.name, " to ").concat(t.name, " (danger: ").concat(r.danger, ")"), {
subsystem: "Terminal"
}));
}
}
}
}
}, c = this;
try {
for (var l = n(e), u = l.next(); !u.done; u = l.next()) s(u.value);
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
}, e.prototype.monitorTerminalCapacity = function(e) {
var t, r;
try {
for (var o = n(e), a = o.next(); !a.done; a = o.next()) {
var i = a.value, s = i.terminal, c = s.store.getCapacity(), l = s.store.getUsedCapacity(), u = l / c;
u >= this.config.capacityWarningThreshold && u < this.config.capacityClearanceThreshold && Game.time % 100 == 0 && qe.warn("Terminal ".concat(i.name, " at ").concat((100 * u).toFixed(1), "% capacity (").concat(l, "/").concat(c, ")"), {
subsystem: "Terminal"
}), u >= this.config.capacityClearanceThreshold && this.clearExcessTerminalResources(i, s);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = o.return) && r.call(o);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.clearExcessTerminalResources = function(e, t) {
var r, o, a, i, s, c;
qe.info("Auto-clearing terminal ".concat(e.name, " (").concat((t.store.getUsedCapacity() / t.store.getCapacity() * 100).toFixed(1), "% full)"), {
subsystem: "Terminal"
});
var l, u = Yt.getClusters();
for (var m in u) {
var p = u[m];
if (p.memberRooms.includes(e.name)) {
var d = 0;
try {
for (var f = (r = void 0, n(p.memberRooms)), y = f.next(); !y.done; y = f.next()) {
var g = y.value, h = Game.rooms[g];
(null === (s = null == h ? void 0 : h.controller) || void 0 === s ? void 0 : s.my) && h.controller.level > d && (d = h.controller.level, 
l = g);
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
break;
}
}
var v = Object.keys(t.store);
try {
for (var R = n(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value, C = t.store.getUsedCapacity(T);
if (0 !== C) {
var S = T === RESOURCE_ENERGY ? this.config.energySurplusThreshold : this.config.mineralSurplusThreshold;
if (C > S) {
var w = C - S;
if (l && l !== e.name) {
var O = null === (c = Game.rooms[l]) || void 0 === c ? void 0 : c.terminal;
if (O && O.store.getFreeCapacity() > w) {
var b = Bs.findOptimalRoute(e.name, l, w);
if (b) {
this.transferQueue.push({
fromRoom: e.name,
toRoom: l,
resourceType: T,
amount: w,
priority: 5,
route: b
}), qe.info("Queued clearance transfer: ".concat(w, " ").concat(T, " from ").concat(e.name, " to hub ").concat(l), {
subsystem: "Terminal"
});
continue;
}
}
}
Game.time % 10 == 0 && Ds.sellSurplusFromTerminal(e.name, T, w) && qe.info("Sold ".concat(w, " ").concat(T, " from ").concat(e.name, " terminal via market"), {
subsystem: "Terminal"
});
}
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
E && !E.done && (i = R.return) && i.call(R);
} finally {
if (a) throw a.error;
}
}
}, e.prototype.balanceEnergy = function(e) {
var t, r, o = this, a = e.map(function(e) {
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
}), i = a.filter(function(e) {
return e.needsEnergy;
}).sort(function(e, t) {
return e.totalEnergy - t.totalEnergy;
}), s = a.filter(function(e) {
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
var o = Bs.findOptimalRoute(t.room.name, e.room.name, r);
if (!o) return "continue";
var n = o.cost / r;
if (n > l.config.maxTransferCostRatio) return qe.debug("Skipping terminal transfer from ".concat(t.room.name, " to ").concat(e.room.name, ": cost ratio ").concat(n.toFixed(2), " too high"), {
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
return qe.info("Queued energy transfer: ".concat(r, " from ").concat(t.room.name, " to ").concat(e.room.name, " (").concat(a, ", cost: ").concat(o.cost, ")"), {
subsystem: "Terminal"
}), "break";
};
try {
for (var a = (t = void 0, n(s)), i = a.next(); !i.done && "break" !== o(i.value); i = a.next()) ;
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
}, l = this;
try {
for (var u = n(i), m = u.next(); !m.done; m = u.next()) c(m.value);
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
}, e.prototype.balanceMinerals = function(e) {
var t, r, o, i, s, c, l = new Map;
try {
for (var u = n(e), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = p.terminal, f = Object.keys(d.store);
try {
for (var y = (o = void 0, n(f)), g = y.next(); !g.done; g = y.next()) {
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
g && !g.done && (i = y.return) && i.call(y);
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
}), qe.info("Queued mineral transfer: ".concat(a, " ").concat(e, " from ").concat(r.room.name, " to ").concat(o.room.name), {
subsystem: "Terminal"
});
}, E = this;
try {
for (var T = n(l.entries()), C = T.next(); !C.done; C = T.next()) {
var S = a(C.value, 2);
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
}, e.prototype.executeTransfers = function(e) {
var t, r;
this.transferQueue.sort(function(e, t) {
return t.priority - e.priority;
});
var o = new Set, a = function(t) {
if (o.has(t.fromRoom)) return "continue";
var r = e.find(function(e) {
return e.name === t.fromRoom;
});
if (!r || !r.terminal) return "continue";
var n = r.terminal;
if (n.cooldown > 0) return "continue";
var a = n.store.getUsedCapacity(t.resourceType);
if (a < t.amount) return qe.debug("Terminal transfer cancelled: insufficient ".concat(t.resourceType, " in ").concat(t.fromRoom, " (need ").concat(t.amount, ", have ").concat(a, ")"), {
subsystem: "Terminal"
}), i.transferQueue = i.transferQueue.filter(function(e) {
return e !== t;
}), "continue";
var s = t.toRoom;
if (t.route && !t.route.isDirect) {
var c = Bs.getNextHop(t.route, t.fromRoom);
c && (s = c);
}
var l = n.send(t.resourceType, t.amount, s, "Terminal auto-balance".concat(t.isEmergency ? " [EMERGENCY]" : ""));
if (l === OK) {
var u = t.route && !t.route.isDirect, m = s === t.toRoom;
qe.info("Terminal transfer executed: ".concat(t.amount, " ").concat(t.resourceType, " from ").concat(t.fromRoom, " to ").concat(s).concat(u && !m ? " (hop to ".concat(t.toRoom, ")") : "").concat(t.isEmergency ? " [EMERGENCY]" : ""), {
subsystem: "Terminal"
}), o.add(t.fromRoom), u && !m ? t.fromRoom = s : i.transferQueue = i.transferQueue.filter(function(e) {
return e !== t;
});
} else qe.warn("Terminal transfer failed: ".concat(l, " for ").concat(t.amount, " ").concat(t.resourceType, " from ").concat(t.fromRoom, " to ").concat(s), {
subsystem: "Terminal"
}), i.transferQueue = i.transferQueue.filter(function(e) {
return e !== t;
});
}, i = this;
try {
for (var s = n(this.transferQueue), c = s.next(); !c.done; c = s.next()) a(c.value);
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
}, e.prototype.queueTransfer = function(e, t, r, o, n) {
void 0 === n && (n = 1), this.transferQueue.push({
fromRoom: e,
toRoom: t,
resourceType: r,
amount: o,
priority: n
});
}, e.prototype.balanceCompoundsAcrossCluster = function(e, t) {
var r, o, i, s, c, l, u, m = new Map;
try {
for (var p = n(e), d = p.next(); !d.done; d = p.next()) {
var f = d.value, y = Game.rooms[f];
if (null == y ? void 0 : y.terminal) try {
for (var g = (i = void 0, n(t)), h = g.next(); !h.done; h = g.next()) {
var v = h.value, R = null !== (u = y.terminal.store[v]) && void 0 !== u ? u : 0;
m.has(v) || m.set(v, []), m.get(v).push({
roomName: f,
amount: R,
terminal: y.terminal
});
}
} catch (e) {
i = {
error: e
};
} finally {
try {
h && !h.done && (s = g.return) && s.call(g);
} finally {
if (i) throw i.error;
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
var r, o, a, i;
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
for (var u = (r = void 0, n(l)), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
try {
for (var d = (a = void 0, n(c)), f = d.next(); !f.done; f = d.next()) {
var y = f.value, g = Math.min(Math.floor((p.amount - s) / 2), Math.floor((s - y.amount) / 2), 3e3), h = e === RESOURCE_CATALYZED_UTRIUM_ACID || e === RESOURCE_CATALYZED_KEANIUM_ALKALIDE || e === RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE || e === RESOURCE_CATALYZED_GHODIUM_ACID || e === RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE || e === RESOURCE_CATALYZED_GHODIUM_ALKALIDE;
g >= (h ? 300 : 500) && (T.queueTransfer(p.roomName, y.roomName, e, g, h ? 8 : 5), 
qe.info("Queued compound balance: ".concat(g, " ").concat(e, " from ").concat(p.roomName, " to ").concat(y.roomName), {
subsystem: "Terminal"
}), p.amount -= g, y.amount += g);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (a) throw a.error;
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
for (var C = n(m.entries()), S = C.next(); !S.done; S = C.next()) {
var w = a(S.value, 2);
E(v = w[0], w[1]);
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
}, o([ yr("terminal:manager", "Terminal Manager", {
priority: jt.MEDIUM,
interval: 20,
minBucket: 0,
cpuBudget: .1
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), Ys = new Ws, Ks = {
minBucket: 0,
minStorageEnergy: 8e4,
inputBufferAmount: 2e3,
outputBufferAmount: 5e3
}, Vs = ((Cs = {})[RESOURCE_UTRIUM_BAR] = ((Ss = {})[RESOURCE_UTRIUM] = 500, Ss[RESOURCE_ENERGY] = 200, 
Ss), Cs[RESOURCE_LEMERGIUM_BAR] = ((ws = {})[RESOURCE_LEMERGIUM] = 500, ws[RESOURCE_ENERGY] = 200, 
ws), Cs[RESOURCE_ZYNTHIUM_BAR] = ((Os = {})[RESOURCE_ZYNTHIUM] = 500, Os[RESOURCE_ENERGY] = 200, 
Os), Cs[RESOURCE_KEANIUM_BAR] = ((bs = {})[RESOURCE_KEANIUM] = 500, bs[RESOURCE_ENERGY] = 200, 
bs), Cs[RESOURCE_GHODIUM_MELT] = ((_s = {})[RESOURCE_GHODIUM] = 500, _s[RESOURCE_ENERGY] = 200, 
_s), Cs[RESOURCE_OXIDANT] = ((xs = {})[RESOURCE_OXYGEN] = 500, xs[RESOURCE_ENERGY] = 200, 
xs), Cs[RESOURCE_REDUCTANT] = ((Us = {})[RESOURCE_HYDROGEN] = 500, Us[RESOURCE_ENERGY] = 200, 
Us), Cs[RESOURCE_PURIFIER] = ((ks = {})[RESOURCE_CATALYST] = 500, ks[RESOURCE_ENERGY] = 200, 
ks), Cs[RESOURCE_BATTERY] = ((Ms = {})[RESOURCE_ENERGY] = 600, Ms), Cs), js = ((As = {})[RESOURCE_BATTERY] = 10, 
As[RESOURCE_UTRIUM_BAR] = 5, As[RESOURCE_LEMERGIUM_BAR] = 5, As[RESOURCE_ZYNTHIUM_BAR] = 5, 
As[RESOURCE_KEANIUM_BAR] = 5, As[RESOURCE_GHODIUM_MELT] = 4, As[RESOURCE_OXIDANT] = 3, 
As[RESOURCE_REDUCTANT] = 3, As[RESOURCE_PURIFIER] = 3, As), zs = function() {
function e(e) {
void 0 === e && (e = {}), this.config = r(r({}, Ks), e);
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
for (var o = n(r), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
this.processFactory(i);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
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
var i = o[0];
if (i && !(i.cooldown > 0)) {
var s = e.storage;
if (s && !(s.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.minStorageEnergy)) {
var c = this.selectProduction(e, i, s);
if (c) {
var l = Vs[c];
if (l) {
var u = !0;
try {
for (var m = n(Object.entries(l)), p = m.next(); !p.done; p = m.next()) {
var d = a(p.value, 2), f = d[0], y = d[1];
if (i.store.getUsedCapacity(f) < y) {
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
var g = i.produce(c);
g === OK ? qe.info("Factory in ".concat(e.name, " producing ").concat(c), {
subsystem: "Factory"
}) : g !== ERR_TIRED && qe.debug("Factory production failed in ".concat(e.name, ": ").concat(g), {
subsystem: "Factory"
});
}
}
}
}
}
}
}, e.prototype.selectProduction = function(e, t, r) {
var o, i, s, c, l, u = [];
try {
for (var m = n(Object.entries(Vs)), p = m.next(); !p.done; p = m.next()) {
var d = a(p.value, 2), f = d[0], y = d[1], g = f, h = !0, v = 0;
try {
for (var R = (s = void 0, n(Object.entries(y))), E = R.next(); !E.done; E = R.next()) {
var T = a(E.value, 2), C = T[0], S = T[1], w = C, O = r.store.getUsedCapacity(w);
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
var _ = null !== (l = js[g]) && void 0 !== l ? l : 1, x = _ * v * (1 - b / this.config.outputBufferAmount);
u.push({
commodity: g,
priority: _,
score: x
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
p && !p.done && (i = m.return) && i.call(m);
} finally {
if (o) throw o.error;
}
}
return 0 === u.length ? null : (u.sort(function(e, t) {
return t.score - e.score;
}), u[0].commodity);
}, e.prototype.getRequiredInputs = function(e, t) {
var r, o, i = t.storage;
if (!i) return [];
var s = this.selectProduction(t, e, i);
if (!s) return [];
var c = Vs[s];
if (!c) return [];
var l = [];
try {
for (var u = n(Object.entries(c)), m = u.next(); !m.done; m = u.next()) {
var p = a(m.value, 2), d = p[0], f = p[1], y = d, g = e.store.getUsedCapacity(y), h = Math.max(0, this.config.inputBufferAmount - g);
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
for (var o = n(Object.keys(Vs)), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
if (e.store.getUsedCapacity(i) > 0) return !0;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = o.return) && r.call(o);
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
}, o([ yr("factory:manager", "Factory Manager", {
priority: jt.LOW,
interval: 30,
minBucket: 0,
cpuBudget: .05
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), qs = new zs, Xs = {
updateInterval: 500,
minBucket: 0,
maxCpuBudget: .02,
trackedResources: [ RESOURCE_ENERGY, RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_GHODIUM ],
highVolatilityThreshold: .3,
opportunityConfidenceThreshold: .7
};

!function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.supplyDemandCache = new Map, this.opportunities = [], 
this.config = r(r({}, Xs), e);
}
e.prototype.run = function() {
var e, t, r = Game.cpu.getUsed();
this.lastRun = Game.time;
try {
for (var o = n(this.config.trackedResources), a = o.next(); !a.done; a = o.next()) {
var i = a.value, s = this.analyzeSupplyDemand(i);
s && this.supplyDemandCache.set(i, s);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
this.detectTradingOpportunities();
var c = Game.cpu.getUsed() - r;
Game.time % 1e3 == 0 && qe.info("Market trend analysis completed in ".concat(c.toFixed(2), " CPU, ").concat(this.opportunities.length, " opportunities detected"), {
subsystem: "MarketTrends"
});
}, e.prototype.analyzeSupplyDemand = function(e) {
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
}, e.prototype.detectTradingOpportunities = function() {
var e, t, r, o, a, i, s, c, l, u, m, p = Yt.getEmpire(), d = [];
try {
for (var f = n(this.config.trackedResources), y = f.next(); !y.done; y = f.next()) {
var g = y.value, h = null === (a = p.market) || void 0 === a ? void 0 : a.resources[g];
if (h) {
var v = this.supplyDemandCache.get(g);
if (v) {
-1 === h.trend && v.sentiment < -.3 && (S = Math.abs(v.sentiment) * (1 - (null !== (i = h.volatility) && void 0 !== i ? i : .5))) >= this.config.opportunityConfidenceThreshold && d.push({
resource: g,
type: "buy",
expectedValue: 1e4 * (h.avgPrice - (null !== (s = h.predictedPrice) && void 0 !== s ? s : h.avgPrice)),
confidence: S,
action: "Buy ".concat(g, " at current price (falling trend, oversupply)"),
urgency: this.calculateUrgency(S, Math.abs(v.sentiment)),
createdAt: Game.time
}), 1 === h.trend && v.sentiment > .3 && (S = v.sentiment * (1 - (null !== (c = h.volatility) && void 0 !== c ? c : .5))) >= this.config.opportunityConfidenceThreshold && d.push({
resource: g,
type: "sell",
expectedValue: 1e4 * ((null !== (l = h.predictedPrice) && void 0 !== l ? l : h.avgPrice) - h.avgPrice),
confidence: S,
action: "Sell ".concat(g, " at current price (rising trend, high demand)"),
urgency: this.calculateUrgency(S, v.sentiment),
createdAt: Game.time
});
var R = Game.market.getAllOrders({
resourceType: g
}), E = R.filter(function(e) {
return e.type === ORDER_BUY;
}).sort(function(e, t) {
return t.price - e.price;
})[0], T = R.filter(function(e) {
return e.type === ORDER_SELL;
}).sort(function(e, t) {
return e.price - t.price;
})[0];
if (E && T && E.price > 1.1 * T.price) {
var C = (E.price - T.price) * Math.min(E.amount, T.amount), S = .9;
d.push({
resource: g,
type: "arbitrage",
expectedValue: C,
confidence: S,
action: "Arbitrage ".concat(g, ": buy at ").concat(T.price.toFixed(3), ", sell at ").concat(E.price.toFixed(3)),
urgency: 3,
createdAt: Game.time
});
}
(null !== (u = h.volatility) && void 0 !== u ? u : 0) >= this.config.highVolatilityThreshold && qe.warn("High volatility detected for ".concat(g, ": ").concat((100 * (null !== (m = h.volatility) && void 0 !== m ? m : 0)).toFixed(1), "%"), {
subsystem: "MarketTrends"
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
y && !y.done && (t = f.return) && t.call(f);
} finally {
if (e) throw e.error;
}
}
this.opportunities = d;
try {
for (var w = n(d), O = w.next(); !O.done; O = w.next()) {
var b = O.value;
b.urgency >= 2 && qe.info("Trading opportunity: ".concat(b.action, ", expected value: ").concat(b.expectedValue.toFixed(0), " credits, confidence: ").concat((100 * b.confidence).toFixed(0), "%"), {
subsystem: "MarketTrends"
});
}
} catch (e) {
r = {
error: e
};
} finally {
try {
O && !O.done && (o = w.return) && o.call(w);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.calculateUrgency = function(e, t) {
var r = e * Math.abs(t);
return r >= .8 ? 3 : r >= .6 ? 2 : r >= .4 ? 1 : 0;
}, e.prototype.getSupplyDemand = function(e) {
return this.supplyDemandCache.get(e);
}, e.prototype.getOpportunities = function() {
return this.opportunities;
}, e.prototype.getOpportunitiesForResource = function(e) {
return this.opportunities.filter(function(t) {
return t.resource === e;
});
}, e.prototype.getUrgentOpportunities = function() {
return this.opportunities.filter(function(e) {
return e.urgency >= 2;
});
}, e.prototype.getMarketSentiment = function(e) {
var t, r = this.supplyDemandCache.get(e);
return null !== (t = null == r ? void 0 : r.sentiment) && void 0 !== t ? t : 0;
}, e.prototype.isMarketTight = function(e) {
var t, r = this.supplyDemandCache.get(e);
return (null !== (t = null == r ? void 0 : r.tightness) && void 0 !== t ? t : 0) > .7;
}, o([ gr("empire:marketTrends", "Market Trend Analyzer", {
priority: jt.LOW,
interval: 500,
minBucket: 0,
cpuBudget: .02
}) ], e.prototype, "run", null), e = o([ vr() ], e);
}();

var Qs = {
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
}, Zs = 1e7, Js = 5e6, $s = ((Ns = {})[STRUCTURE_SPAWN] = 15e3, Ns[STRUCTURE_TOWER] = 5e3, 
Ns[STRUCTURE_STORAGE] = 3e4, Ns[STRUCTURE_TERMINAL] = 1e5, Ns[STRUCTURE_LAB] = 5e4, 
Ns[STRUCTURE_NUKER] = 1e5, Ns[STRUCTURE_POWER_SPAWN] = 1e5, Ns[STRUCTURE_OBSERVER] = 8e3, 
Ns[STRUCTURE_EXTENSION] = 3e3, Ns[STRUCTURE_LINK] = 5e3, Ns);

function ec(e) {
return !!e.threatenedStructures && e.threatenedStructures.some(function(e) {
return e.includes(STRUCTURE_SPAWN) || e.includes(STRUCTURE_STORAGE) || e.includes(STRUCTURE_TERMINAL);
});
}

function tc(e, t, r) {
t.timeToLand < 5e3 ? (r.posture = "evacuate", ye.warn("EVACUATION TRIGGERED for ".concat(e.name, ": Critical structures threatened by nuke!"), {
subsystem: "Nuke"
})) : ("war" !== r.posture && "evacuate" !== r.posture && (r.posture = "defensive"), 
ye.warn("NUKE DEFENSE PREPARATION in ".concat(e.name, ": Critical structures in blast radius"), {
subsystem: "Nuke"
})), r.pheromones.defense = 100;
}

function rc() {
var e, t = 0, r = 0;
for (var o in Game.rooms) {
var n = Game.rooms[o];
(null === (e = n.controller) || void 0 === e ? void 0 : e.my) && (n.storage && (t += n.storage.store.getUsedCapacity(RESOURCE_ENERGY) || 0), 
n.terminal && (t += n.terminal.store.getUsedCapacity(RESOURCE_ENERGY) || 0, r += n.terminal.store.getUsedCapacity(RESOURCE_GHODIUM) || 0));
}
return t >= 6e5 && r >= 1e4;
}

function oc(e, t, r, o) {
var n = 0, s = [], c = t.knownRooms[e];
if (!c) return {
roomName: e,
score: 0,
reasons: [ "No intel" ]
};
c.controllerLevel && (n += 3 * c.controllerLevel, s.push("RCL ".concat(c.controllerLevel))), 
c.towerCount && (n += 5 * c.towerCount, s.push("".concat(c.towerCount, " towers"))), 
c.spawnCount && (n += 10 * c.spawnCount, s.push("".concat(c.spawnCount, " spawns"))), 
c.owner && "" !== c.owner && (n += 30, s.push("Owned room"));
var l = o(e);
if (l) {
var u = Math.floor(l.pheromones.war / 10);
u > 0 && (n += u, s.push("War intensity: ".concat(l.pheromones.war)));
}
c.isHighway && (n += 10, s.push("Highway (strategic)")), c.threatLevel >= 2 && (n += 20, 
s.push("High threat"));
var m = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (m.length > 0) {
var p = Math.min.apply(Math, i([], a(m.map(function(t) {
return Game.map.getRoomLinearDistance(e, t.name);
})), !1));
n -= 2 * p, s.push("".concat(p, " rooms away"));
}
t.warTargets.includes(e) && (n += 15, s.push("War target"));
var d = new RoomPosition(25, 25, e), f = ac(e, d, t);
return f >= r.roiThreshold ? (n += Math.min(20, Math.floor(5 * f)), s.push("ROI: ".concat(f.toFixed(1), "x"))) : (n -= 20, 
s.push("Low ROI: ".concat(f.toFixed(1), "x"))), {
roomName: e,
score: n,
reasons: s
};
}

function nc(e, t, r) {
var o, a, i = {
estimatedDamage: 0,
estimatedValue: 0,
threatenedStructures: []
}, s = Game.rooms[e];
if (!s) {
var c = r.knownRooms[e];
if (c) {
var l = 5 * (c.towerCount || 0) + 10 * (c.spawnCount || 0) + 5;
i.estimatedDamage = Zs + Js * l, i.estimatedValue = .01 * i.estimatedDamage;
}
return i;
}
var u = s.lookForAtArea(LOOK_STRUCTURES, Math.max(0, t.y - 2), Math.max(0, t.x - 2), Math.min(49, t.y + 2), Math.min(49, t.x + 2), !0);
try {
for (var m = n(u), p = m.next(); !p.done; p = m.next()) {
var d = p.value.structure, f = Math.abs(d.pos.x - t.x), y = Math.abs(d.pos.y - t.y), g = 0 === Math.max(f, y) ? Zs : Js;
d.hits <= g ? (i.estimatedDamage += d.hits, i.threatenedStructures.push("".concat(d.structureType, "-").concat(d.pos.x, ",").concat(d.pos.y)), 
i.estimatedValue += ic(d)) : i.estimatedDamage += g;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (a = m.return) && a.call(m);
} finally {
if (o) throw o.error;
}
}
return i;
}

function ac(e, t, r) {
var o = nc(e, t, r);
return 0 === o.estimatedValue ? 0 : o.estimatedValue / 305e3;
}

function ic(e) {
return $s[e.structureType] || 1e3;
}

function sc(e, t, r) {
var o, a, i, s = null;
try {
for (var c = n(Object.values(t)), l = c.next(); !l.done; l = c.next()) {
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
l && !l.done && (a = c.return) && a.call(c);
} finally {
if (o) throw o.error;
}
}
if (!s) return ye.warn("Cannot deploy siege squad for nuke on ".concat(e.targetRoom, ": No clusters available"), {
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
ye.info("Siege pheromones increased for ".concat(e.targetRoom, " to coordinate with nuke strike"), {
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
return p.squads || (p.squads = []), p.squads.push(g), e.siegeSquadId = y, ye.warn("SIEGE SQUAD DEPLOYED: Squad ".concat(y, " will coordinate with nuke on ").concat(e.targetRoom), {
subsystem: "Nuke"
}), !0;
}

var cc = function() {
function e(e, t) {
void 0 === e && (e = {}), this.nukerReadyLogged = new Set, this.config = r(r({}, Qs), e), 
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
var a, i, s = Game.rooms[o];
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
var a = {
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
var r, o, a = [], i = e.lookForAtArea(LOOK_STRUCTURES, Math.max(0, t.y - 2), Math.max(0, t.x - 2), Math.min(49, t.y + 2), Math.min(49, t.x + 2), !0);
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value.structure, u = Math.abs(l.pos.x - t.x), m = Math.abs(l.pos.y - t.y), p = Math.max(u, m);
if (p <= 2) {
var d = 0 === p ? Zs : Js;
l.hits <= d && a.push("".concat(l.structureType, "-").concat(l.pos.x, ",").concat(l.pos.y));
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
return a;
}(s, t.pos);
a.threatenedStructures = i, e.incomingNukes.push(a), c.nukeDetected || (c.nukeDetected = !0, 
c.pheromones.defense = Math.min(100, c.pheromones.defense + 50), c.pheromones.siege = Math.min(100, c.pheromones.siege + 30), 
c.danger = 3, ye.warn("INCOMING NUKE DETECTED in ".concat(o, "! ") + "Landing at (".concat(t.pos.x, ", ").concat(t.pos.y, "), impact in ").concat(t.timeToLand, " ticks. ") + "Source: ".concat(t.launchRoomName || "unknown", ". ") + "Threatened structures: ".concat(i.length), {
subsystem: "Nuke"
}), c.eventLog.push({
type: "nuke_incoming",
time: Game.time,
details: "Impact in ".concat(t.timeToLand, " ticks at (").concat(t.pos.x, ",").concat(t.pos.y, ")")
}), c.eventLog.length > 20 && c.eventLog.shift());
}
};
try {
for (var m = (a = void 0, n(l)), p = m.next(); !p.done; p = m.next()) u(p.value);
} catch (e) {
a = {
error: e
};
} finally {
try {
p && !p.done && (i = m.return) && i.call(m);
} finally {
if (a) throw a.error;
}
}
} else c.nukeDetected && (c.nukeDetected = !1, ye.info("Nuke threat cleared in ".concat(o), {
subsystem: "Nuke"
}));
};
for (var a in Game.rooms) o(a);
}(t, this.getSwarmState), this.handleEvacuations(t), function(e, t, r, o) {
var a, i, s;
if (e.incomingNukes && 0 !== e.incomingNukes.length) try {
for (var c = n(e.incomingNukes), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u.sourceRoom && !e.warTargets.includes(u.sourceRoom)) {
var m = e.knownRooms[u.sourceRoom];
if (m && !(m.controllerLevel < 8)) {
var p = r(u.roomName);
if (p && !(p.pheromones.war < t.counterNukeWarThreshold)) if (o()) {
if (!e.warTargets.includes(u.sourceRoom)) for (var d in e.warTargets.push(u.sourceRoom), 
ye.warn("COUNTER-NUKE AUTHORIZED: ".concat(u.sourceRoom, " added to war targets for nuke retaliation"), {
subsystem: "Nuke"
}), Game.rooms) if (null === (s = Game.rooms[d].controller) || void 0 === s ? void 0 : s.my) {
var f = r(d);
f && (f.pheromones.war = Math.min(100, f.pheromones.war + 30));
}
} else ye.warn("Counter-nuke desired against ".concat(u.sourceRoom, " but insufficient resources"), {
subsystem: "Nuke"
});
}
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
l && !l.done && (i = c.return) && i.call(c);
} finally {
if (a) throw a.error;
}
}
}(t, this.config, this.getSwarmState, rc), function(e, t, r, o) {
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
0 === u && 0 === m ? r.has(d) || (ye.info("Nuker in ".concat(i, " is fully loaded and ready to launch"), {
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
(n > 0 || a > 0) && ye.debug("Nuker in ".concat(t, " needs ").concat(n, " energy, ").concat(a, " ghodium"), {
subsystem: "Nuke"
});
}
}
}
}(), function(e, t, r) {
var o, a;
if (e.nukeCandidates = [], e.objectives.warMode) {
try {
for (var i = n(e.warTargets), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = oc(c, e, t, r);
l.score >= t.minScore && (e.nukeCandidates.push({
roomName: c,
score: l.score,
launched: !1,
launchTick: 0
}), ye.info("Nuke candidate: ".concat(c, " (score: ").concat(l.score, ") - ").concat(l.reasons.join(", ")), {
subsystem: "Nuke"
}));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
s && !s.done && (a = i.return) && a.call(i);
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
r.lastROI = n / o, r.nukesLaunched > 0 && r.nukesLaunched % 5 == 0 && ye.info("Nuke economics: ".concat(r.nukesLaunched, " nukes, ROI: ").concat(null === (t = r.lastROI) || void 0 === t ? void 0 : t.toFixed(2), "x, ") + "Value destroyed: ".concat((r.totalValueDestroyed / 1e3).toFixed(0), "k"), {
subsystem: "Nuke"
});
}
}
}(t), function(e, t, r, o) {
var a, i, s, c, l, u, m;
if (e.objectives.warMode && e.nukesInFlight && 0 !== e.nukesInFlight.length) {
var p = r();
try {
for (var d = n(e.nukesInFlight), f = d.next(); !f.done; f = d.next()) {
var y = f.value, g = y.impactTick - Game.time;
y.siegeSquadId || g <= t.siegeCoordinationWindow && g > 0 && sc(y, p, o) && ye.info("Siege squad deployment coordinated with nuke on ".concat(y.targetRoom, ", ") + "impact in ".concat(g, " ticks"), {
subsystem: "Nuke"
});
}
} catch (e) {
a = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (a) throw a.error;
}
}
try {
for (var h = n(Object.values(p)), v = h.next(); !v.done; v = h.next()) {
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
o && !o.siegeSquadId && (o.siegeSquadId = t.id, ye.info("Linked siege squad ".concat(t.id, " with nuke on ").concat(r), {
subsystem: "Nuke"
}));
};
try {
for (var C = (l = void 0, n(E)), S = C.next(); !S.done; S = C.next()) T(S.value);
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
var r, o, s, c, l, u;
if (e.nukesInFlight && 0 !== e.nukesInFlight.length) {
var m = new Map;
try {
for (var p = n(e.nukesInFlight), d = p.next(); !d.done; d = p.next()) {
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
for (var g = n(m.entries()), h = g.next(); !h.done; h = g.next()) {
var v = a(h.value, 2), R = v[0], E = v[1];
if (!(E.length < 2)) {
var T = E.map(function(e) {
return e.impactTick;
}), C = Math.min.apply(Math, i([], a(T), !1)), S = Math.max.apply(Math, i([], a(T), !1)) - C;
if (S <= t.salvoSyncWindow) {
var w = E[0].salvoId || "salvo-".concat(R, "-").concat(C);
try {
for (var O = (l = void 0, n(E)), b = O.next(); !b.done; b = O.next()) (f = b.value).salvoId = w;
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
ye.info("Nuke salvo ".concat(w, " coordinated: ").concat(E.length, " nukes on ").concat(R, ", impact spread: ").concat(S, " ticks"), {
subsystem: "Nuke"
});
} else ye.warn("Nukes on ".concat(R, " not synchronized (spread: ").concat(S, " ticks > ").concat(t.salvoSyncWindow, ")"), {
subsystem: "Nuke"
});
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
h && !h.done && (c = g.return) && c.call(g);
} finally {
if (s) throw s.error;
}
}
}
}(t, this.config), function(e, t) {
var r, o, a, i, s;
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
for (var m = n(e.nukeCandidates), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (!d.launched) {
try {
for (var f = (a = void 0, n(c)), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
if (!(Game.map.getRoomLinearDistance(g.room.name, d.roomName) > 10)) {
var h = new RoomPosition(25, 25, d.roomName), v = nc(d.roomName, h, e), R = ac(d.roomName, h, e);
if (R < t.roiThreshold) ye.warn("Skipping nuke launch on ".concat(d.roomName, ": ROI ").concat(R.toFixed(2), "x below threshold ").concat(t.roiThreshold, "x"), {
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
e.nukeEconomics.lastLaunchTick = Game.time, ye.warn("NUKE LAUNCHED from ".concat(g.room.name, " to ").concat(d.roomName, "! ") + "Impact in ".concat(t.nukeFlightTime, " ticks. ") + "Predicted damage: ".concat((v.estimatedDamage / 1e6).toFixed(1), "M hits, ") + "value: ".concat((v.estimatedValue / 1e3).toFixed(0), "k, ROI: ").concat(R.toFixed(2), "x"), {
subsystem: "Nuke"
});
var C = c.indexOf(g);
C > -1 && c.splice(C, 1);
break;
}
ye.error("Failed to launch nuke: ".concat(E), {
subsystem: "Nuke"
});
}
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
y && !y.done && (i = f.return) && i.call(f);
} finally {
if (a) throw a.error;
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
r > 0 && ye.info("Cleaned up ".concat(r, " impacted nuke alert(s)"), {
subsystem: "Nuke"
});
}
}(t);
}, e.prototype.handleEvacuations = function(e) {
var t, r;
if (e.incomingNukes) try {
for (var o = n(e.incomingNukes), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
if (!i.evacuationTriggered && ec(i)) {
var s = Game.rooms[i.roomName];
if (s) {
var c = this.getSwarmState(i.roomName);
c && (tc(s, i, c), i.evacuationTriggered = !0);
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = o.return) && r.call(o);
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
a ? n.requestTransfer(a, e, t, r, o.terminalPriority) && ye.info("Requested ".concat(r, " ").concat(t, " transfer from ").concat(a, " to ").concat(e, " for nuker"), {
subsystem: "Nuke"
}) : ye.debug("No donor room found for ".concat(r, " ").concat(t, " to ").concat(e), {
subsystem: "Nuke"
});
}(e, t, r, this.config, Ys);
}, e.prototype.getConfig = function() {
return r({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = r(r({}, this.config), e);
}, e;
}(), lc = [ {
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

function uc(e, t, r, o) {
var a, i, s, c, l, u, m = (s = t, l = (c = function(e) {
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
}(m), d = 10 * r, f = lc[0];
try {
for (var y = n(lc), g = y.next(); !g.done; g = y.next()) {
var h = g.value;
if (!(h.cost <= o)) break;
f = h;
}
} catch (e) {
a = {
error: e
};
} finally {
try {
g && !g.done && (i = y.return) && i.call(y);
} finally {
if (a) throw a.error;
}
}
var v = d * p, R = Math.max(1, Math.ceil(v / f.capacity * 1.2)), E = Math.min(2 * r, R + 1);
return ye.debug("Remote hauler calculation: ".concat(e, " -> ").concat(t, " (").concat(r, " sources, ").concat(m, " rooms away) - RT: ").concat(p, " ticks, E/tick: ").concat(d, ", Min: ").concat(R, ", Rec: ").concat(E, ", Cap: ").concat(f.capacity), {
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

var mc = new Map, pc = -1, dc = null;

function fc(e, t) {
var r, o;
void 0 === t && (t = !1), pc === Game.time && dc === Game.creeps || (mc.clear(), 
pc = Game.time, dc = Game.creeps);
var n = t ? "".concat(e, "_active") : e, a = mc.get(n);
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
return mc.set(n, i), i;
}

function yc(e, t, r) {
var o, a, i = 0;
try {
for (var s = n(Object.values(Game.creeps)), c = s.next(); !c.done; c = s.next()) {
var l = c.value.memory;
l.homeRoom === e && l.role === t && l.targetRoom === r && i++;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
c && !c.done && (a = s.return) && a.call(s);
} finally {
if (o) throw o.error;
}
}
return i;
}

function gc(e, t, r) {
var o, a, i, s, c, l = null !== (i = r.remoteAssignments) && void 0 !== i ? i : [];
if (0 === l.length) return null;
try {
for (var u = n(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = yc(e, t, p), f = Game.rooms[p];
if (d < ("remoteHarvester" === t ? f ? Sn(f).length : 2 : "remoteHauler" === t && f ? uc(e, p, Sn(f).length, null !== (c = null === (s = Game.rooms[e]) || void 0 === s ? void 0 : s.energyCapacityAvailable) && void 0 !== c ? c : 800).recommendedHaulers : 2)) return p;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
m && !m.done && (a = u.return) && a.call(u);
} finally {
if (o) throw o.error;
}
}
return null;
}

function hc(e, t, r, o) {
var a, i, s;
if ("remoteHarvester" === e || "remoteHauler" === e) {
var c = gc(o, e, r);
return !!c && (t.targetRoom = c, !0);
}
if ("remoteWorker" === e) {
var l = null !== (s = r.remoteAssignments) && void 0 !== s ? s : [];
if (l.length > 0) {
var u = 1 / 0, m = [];
try {
for (var p = n(l), d = p.next(); !d.done; d = p.next()) {
var f = d.value, y = yc(o, e, f);
y < u ? (u = y, m = [ f ]) : y === u && m.push(f);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
d && !d.done && (i = p.return) && i.call(p);
} finally {
if (a) throw a.error;
}
}
var g = m.length > 1 ? m[Game.time % m.length] : m[0];
return t.targetRoom = g, !0;
}
return !1;
}
return !0;
}

function vc(e, t, r, o) {
var a, i, s, c, l;
void 0 === o && (o = !1);
var u = ni[t];
if (!u) return !1;
if ("larvaWorker" === t && !o) return !1;
if ("remoteHarvester" === t || "remoteHauler" === t) return null !== gc(e, t, r);
if ("remoteWorker" === t) {
if (0 === (p = null !== (s = r.remoteAssignments) && void 0 !== s ? s : []).length) return !1;
var m = function(e, t) {
pc === Game.time && dc === Game.creeps || (mc.clear(), pc = Game.time, dc = Game.creeps);
var r = "".concat(e, ":").concat(t), o = mc.get(r);
if ("number" == typeof o) return o;
var n = 0;
for (var a in Game.creeps) {
var i = Game.creeps[a].memory;
i.homeRoom === e && i.role === t && n++;
}
return mc.set(r, n), n;
}(e, "remoteWorker");
return m < u.maxPerRoom;
}
if ("remoteGuard" === t) {
var p;
if (0 === (p = null !== (c = r.remoteAssignments) && void 0 !== c ? c : []).length) return !1;
try {
for (var d = n(p), f = d.next(); !f.done; f = d.next()) {
var y = f.value, g = Game.rooms[y];
if (g) {
var h = Cn(g, FIND_HOSTILE_CREEPS).filter(function(e) {
return e.body.some(function(e) {
return e.type === ATTACK || e.type === RANGED_ATTACK || e.type === WORK;
});
});
if (h.length > 0 && yc(e, t, y) < Math.min(u.maxPerRoom, Math.ceil(h.length / 2))) return !0;
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
f && !f.done && (i = d.return) && i.call(d);
} finally {
if (a) throw a.error;
}
}
return !1;
}
var v = null !== (l = fc(e).get(t)) && void 0 !== l ? l : 0, R = u.maxPerRoom;
if ("upgrader" === t && r.clusterId && (null == (x = Yt.getCluster(r.clusterId)) ? void 0 : x.focusRoom) === e) {
var E = Game.rooms[e];
(null == E ? void 0 : E.controller) && (R = E.controller.level <= 3 ? 2 : E.controller.level <= 6 ? 4 : 6);
}
if (v >= R) return !1;
var T = Game.rooms[e];
if (!T) return !1;
if ("scout" === t) return !(r.danger >= 1) && "defensive" !== r.posture && "war" !== r.posture && "siege" !== r.posture && (0 === v || "expand" === r.posture && v < u.maxPerRoom);
if ("claimer" === t) {
var C = Yt.getEmpire(), S = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), w = S.length < Game.gcl.level, O = C.claimQueue.some(function(e) {
return !e.claimed;
}), b = function(e, t) {
var r, o, a, i, s, c, l = null !== (a = t.remoteAssignments) && void 0 !== a ? a : [];
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
for (var d = n(l), f = d.next(); !f.done; f = d.next()) {
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
}(0, r);
return !(!w || !O) || !!b;
}
if ("mineralHarvester" === t) {
var _ = T.find(FIND_MINERALS)[0];
if (!_) return !1;
if (!_.pos.lookFor(LOOK_STRUCTURES).find(function(e) {
return e.structureType === STRUCTURE_EXTRACTOR;
})) return !1;
if (0 === _.mineralAmount) return !1;
}
if ("labTech" === t && T.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}).length < 3) return !1;
if ("factoryWorker" === t && 0 === T.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_FACTORY;
}
}).length) return !1;
if ("queenCarrier" === t && !T.storage) return !1;
if ("builder" === t && 0 === T.find(FIND_MY_CONSTRUCTION_SITES).length && v > 0) return !1;
if ("interRoomCarrier" === t) {
if (!r.clusterId) return !1;
var x;
if (!(x = Yt.getCluster(r.clusterId)) || !x.resourceRequests || 0 === x.resourceRequests.length) return !1;
var U = x.resourceRequests.some(function(e) {
if (e.fromRoom !== T.name) return !1;
var t = e.assignedCreeps.filter(function(e) {
return Game.creeps[e];
}).length;
return e.amount - e.delivered > 500 && t < 2;
});
if (!U) return !1;
}
if ("crossShardCarrier" === t) {
var k = zr.getActiveRequests();
if (0 === k.length) return !1;
if (U = k.some(function(e) {
var t, r;
if (e.sourceRoom !== T.name) return !1;
var o = e.assignedCreeps || [], a = e.amount - e.transferred, i = 0, s = 0;
try {
for (var c = n(o), l = c.next(); !l.done; l = c.next()) {
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
return i < a && s < 3;
}), !U) return !1;
}
return !0;
}

function Rc(e) {
var t, r;
return (null !== (t = e.get("harvester")) && void 0 !== t ? t : 0) + (null !== (r = e.get("larvaWorker")) && void 0 !== r ? r : 0);
}

function Ec(e) {
var t = Sn(e);
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

function Tc(e, t) {
var r, o, a, i, s = fc(e, !0);
if (0 === Rc(s)) return !0;
if (0 === function(e) {
var t, r;
return (null !== (t = e.get("hauler")) && void 0 !== t ? t : 0) + (null !== (r = e.get("larvaWorker")) && void 0 !== r ? r : 0);
}(s) && (null !== (a = s.get("harvester")) && void 0 !== a ? a : 0) > 0) return !0;
var c = fc(e, !1), l = Ec(t);
try {
for (var u = n(l), m = u.next(); !m.done; m = u.next()) {
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

function Cc(e, t) {
var r, o, a = null;
try {
for (var i = n(e.bodies), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
c.cost <= t && (!a || c.cost > a.cost) && (a = c);
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
return a;
}

function Sc(e) {
return "".concat(e, "_").concat(Game.time, "_").concat(Math.floor(1e3 * Math.random()));
}

function wc(e, t) {
var r, o, i, s, c, l, u = wn(e, STRUCTURE_SPAWN).find(function(e) {
return !e.spawning;
});
if (u) {
var m = e.energyCapacityAvailable, p = e.energyAvailable, d = 0 === Rc(fc(e.name, !0)), f = d ? p : m;
if (d && p < 150 && (ye.warn("WORKFORCE COLLAPSE: ".concat(p, " energy available, need 150 to spawn minimal larvaWorker. ") + "Room will recover once energy reaches 150.", {
subsystem: "spawn",
room: e.name
}), mr.emit("spawn.emergency", {
roomName: e.name,
energyAvailable: p,
message: "Critical workforce collapse - waiting for energy to spawn minimal creep",
source: "SpawnManager"
})), Tc(e.name, e) && Game.time % 10 == 0) {
var y = fc(e.name, !0), g = fc(e.name, !1), h = null !== (i = y.get("larvaWorker")) && void 0 !== i ? i : 0, v = null !== (s = y.get("harvester")) && void 0 !== s ? s : 0;
ye.info("BOOTSTRAP MODE: ".concat(Rc(y), " active energy producers ") + "(".concat(h, " larva, ").concat(v, " harvest), ").concat(Rc(g), " total. ") + "Energy: ".concat(p, "/").concat(m), {
subsystem: "spawn",
room: e.name
});
}
if (Tc(e.name, e)) {
var R = function(e, t, r) {
var o, a, i;
if (0 === Rc(fc(e, !0))) return ye.info("Bootstrap: Spawning larvaWorker (emergency - no active energy producers)", {
subsystem: "spawn",
room: e
}), "larvaWorker";
var s = fc(e, !1), c = Ec(t);
ye.info("Bootstrap: Checking ".concat(c.length, " roles in order"), {
subsystem: "spawn",
room: e,
meta: {
totalCreeps: s.size,
creepCounts: Array.from(s.entries())
}
});
try {
for (var l = n(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!m.condition || m.condition(t)) {
var p = null !== (i = s.get(m.role)) && void 0 !== i ? i : 0;
if (p < m.minCount) {
var d = vc(e, m.role, r, !0);
if (ye.info("Bootstrap: Role ".concat(m.role, " needs spawning (current: ").concat(p, ", min: ").concat(m.minCount, ", needsRole: ").concat(d, ")"), {
subsystem: "spawn",
room: e
}), d) return m.role;
ye.warn("Bootstrap: Role ".concat(m.role, " blocked by needsRole check (current: ").concat(p, "/").concat(m.minCount, ")"), {
subsystem: "spawn",
room: e
});
}
} else ye.info("Bootstrap: Skipping ".concat(m.role, " (condition not met)"), {
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
u && !u.done && (a = l.return) && a.call(l);
} finally {
if (o) throw o.error;
}
}
return ye.info("Bootstrap: No role needs spawning", {
subsystem: "spawn",
room: e
}), null;
}(e.name, e, t);
if (!R) return;
if (!(_ = ni[R])) return;
var E = Cc(_, f);
if (E && p >= E.cost) ; else if (!(E = Cc(_, p))) return void ye.info("Bootstrap: No affordable body for ".concat(R, " (available: ").concat(p, ", min needed: ").concat(null !== (l = null === (c = _.bodies[0]) || void 0 === c ? void 0 : c.cost) && void 0 !== l ? l : "unknown", ")"), {
subsystem: "spawn",
room: e.name
});
var T = Sc(R);
if (!hc(R, x = {
role: _.role,
family: _.family,
homeRoom: e.name,
version: 1
}, t, e.name)) return;
var C = void 0;
try {
C = u.spawnCreep(E.parts, T, {
memory: x
});
} catch (t) {
return void ye.error("EXCEPTION during spawn attempt for ".concat(R, ": ").concat(t), {
subsystem: "spawn",
room: e.name,
meta: {
error: String(t),
role: R,
bodyCost: E.cost,
bodyParts: E.parts.length
}
});
}
if (C === OK) ye.info("BOOTSTRAP SPAWN: ".concat(R, " (").concat(T, ") with ").concat(E.parts.length, " parts, cost ").concat(E.cost, ". Recovery in progress."), {
subsystem: "spawn",
room: e.name
}), mr.emit("spawn.completed", {
roomName: e.name,
creepName: T,
role: R,
cost: E.cost,
source: "SpawnManager"
}); else {
var S = C === ERR_NOT_ENOUGH_ENERGY ? "ERR_NOT_ENOUGH_ENERGY" : C === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" : C === ERR_BUSY ? "ERR_BUSY" : C === ERR_NOT_OWNER ? "ERR_NOT_OWNER" : C === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" : C === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" : "UNKNOWN(".concat(C, ")");
ye.warn("BOOTSTRAP SPAWN FAILED: ".concat(R, " (").concat(T, ") - ").concat(S, ". Body: ").concat(E.parts.length, " parts, cost: ").concat(E.cost, ", available: ").concat(p), {
subsystem: "spawn",
room: e.name,
meta: {
errorCode: C,
errorName: S,
role: R,
bodyCost: E.cost,
energyAvailable: p,
energyCapacity: m
}
});
}
} else {
var w = function(e, t) {
var r, o, i, s, c = fc(e.name), l = function(e) {
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
for (var m = n(Object.entries(ni)), p = m.next(); !p.done; p = m.next()) {
var d = a(p.value, 2), f = d[0], y = d[1];
if (vc(e.name, f, t)) {
var g = y.priority, h = null !== (i = l[f]) && void 0 !== i ? i : .5, v = ds(f, t.pheromones), R = ps(e, t, f), E = null !== (s = c.get(f)) && void 0 !== s ? s : 0, T = (g + R) * h * v * (y.maxPerRoom > 0 ? Math.max(.1, 1 - E / y.maxPerRoom) : .1);
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
}(e, t);
try {
for (var O = n(w), b = O.next(); !b.done; b = O.next()) {
var _;
if (R = b.value, _ = ni[R]) {
var x, U = Cc(_, f);
if (U && !(p < U.cost) && (T = Sc(R), hc(R, x = {
role: _.role,
family: _.family,
homeRoom: e.name,
version: 1
}, t, e.name))) {
if ("interRoomCarrier" === R && t.clusterId) {
var k = Yt.getCluster(t.clusterId);
if (k) {
var M = k.resourceRequests.find(function(t) {
if (t.fromRoom !== e.name) return !1;
var r = t.assignedCreeps.filter(function(e) {
return Game.creeps[e];
}).length;
return t.amount - t.delivered > 500 && r < 2;
});
M && (x.transferRequest = {
fromRoom: M.fromRoom,
toRoom: M.toRoom,
resourceType: M.resourceType,
amount: M.amount
}, M.assignedCreeps.push(T));
}
}
if ((C = u.spawnCreep(U.parts, T, {
memory: x
})) === OK) return void mr.emit("spawn.completed", {
roomName: e.name,
creepName: T,
role: R,
cost: U.cost,
source: "SpawnManager"
});
if (C !== ERR_NOT_ENOUGH_ENERGY) return S = C === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" : C === ERR_BUSY ? "ERR_BUSY" : C === ERR_NOT_OWNER ? "ERR_NOT_OWNER" : C === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" : C === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" : "UNKNOWN(".concat(C, ")"), 
void ye.warn("Spawn failed for ".concat(R, ": ").concat(S, ". Body: ").concat(U.parts.length, " parts, cost: ").concat(U.cost), {
subsystem: "spawn",
room: e.name,
meta: {
errorCode: C,
errorName: S,
role: R,
bodyCost: U.cost
}
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
b && !b.done && (o = O.return) && o.call(O);
} finally {
if (r) throw r.error;
}
}
w.length > 0 && Game.time % 20 == 0 ? ye.info("Waiting for energy: ".concat(w.length, " roles need spawning, waiting for optimal bodies. ") + "Energy: ".concat(p, "/").concat(m), {
subsystem: "spawn",
room: e.name,
meta: {
topRoles: w.slice(0, 3).join(", "),
energyAvailable: p,
energyCapacity: m
}
}) : 0 === w.length && Game.time % 100 == 0 && ye.info("No spawns needed: All roles fully staffed. Energy: ".concat(p, "/").concat(m), {
subsystem: "spawn",
room: e.name,
meta: {
energyAvailable: p,
energyCapacity: m,
activeCreeps: fc(e.name, !0).size
}
});
}
}
}

var Oc = new Map, bc = {
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
}, _c = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = r(r({}, bc), e);
}
return e.prototype.run = function() {
var e = this, t = Game.cpu.getUsed(), r = Yt.getEmpire();
this.lastRun = Game.time, r.lastUpdate = Game.time, jn.measureSubsystem("empire:expansion", function() {
e.updateExpansionQueue(r);
}), jn.measureSubsystem("empire:powerBanks", function() {
e.updatePowerBanks(r);
}), jn.measureSubsystem("empire:warTargets", function() {
e.updateWarTargets(r);
}), jn.measureSubsystem("empire:objectives", function() {
e.updateObjectives(r);
}), jn.measureSubsystem("empire:intelRefresh", function() {
e.refreshRoomIntel(r);
}), jn.measureSubsystem("empire:roomDiscovery", function() {
e.discoverNearbyRooms(r);
}), jn.measureSubsystem("empire:gclTracking", function() {
e.trackGCLProgress(r);
}), jn.measureSubsystem("empire:expansionReadiness", function() {
e.checkExpansionReadiness(r);
}), jn.measureSubsystem("empire:nukeCandidates", function() {
e.refreshNukeCandidates(r);
}), jn.measureSubsystem("empire:clusterHealth", function() {
e.monitorClusterHealth();
}), jn.measureSubsystem("empire:powerBankProfitability", function() {
e.assessPowerBankProfitability(r);
});
var o = Game.cpu.getUsed() - t;
Game.time % 100 == 0 && ye.info("Empire tick completed in ".concat(o.toFixed(2), " CPU"), {
subsystem: "Empire"
});
}, e.prototype.cleanupClaimQueue = function(e, t) {
var r = e.claimQueue.length;
e.claimQueue = e.claimQueue.filter(function(e) {
return !t.has(e.roomName) || (ye.info("Removing ".concat(e.roomName, " from claim queue - now owned"), {
subsystem: "Empire"
}), !1);
}), e.claimQueue.length < r && ye.info("Cleaned up claim queue: removed ".concat(r - e.claimQueue.length, " owned room(s)"), {
subsystem: "Empire"
});
}, e.prototype.updateExpansionQueue = function(e) {
var t, r, o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), a = new Set(o.map(function(e) {
return e.name;
})), i = Game.gcl.level, s = Object.values(Game.spawns);
if (s.length > 0 && s[0].owner) {
var c = s[0].owner.username;
try {
for (var l = n(o), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
(f = e.knownRooms[m.name]) && f.owner !== c && (f.owner = c, ye.info("Updated room intel for ".concat(m.name, " - now owned by ").concat(c), {
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
if (this.cleanupClaimQueue(e, a), !(o.length >= i || i < this.config.minGclForExpansion || e.objectives.expansionPaused)) {
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
}), e.claimQueue = p.slice(0, 10), p.length > 0 && Game.time % 100 == 0 && ye.info("Expansion queue updated: ".concat(p.length, " candidates, top score: ").concat(p[0].score), {
subsystem: "Empire"
});
}
}, e.prototype.scoreExpansionCandidate = function(e, t) {
var r = 0;
2 === e.sources ? r += 40 : 1 === e.sources && (r += 20), r += to(e.mineralType);
var o = this.getMinDistanceToOwned(e.name, t);
return o > this.config.maxExpansionDistance ? 0 : (r -= 5 * o, r -= ro(e.name), 
r -= 15 * e.threatLevel, r += oo(e.terrain), no(e.name) && (r += 10), r += ao(e.name), 
e.controllerLevel > 0 && !e.owner && (r += 2 * e.controllerLevel), r += io(e.name, t, o), 
e.isHighway ? 0 : (e.isSK && (r -= 50), Math.max(0, r)));
}, e.prototype.getMinDistanceToOwned = function(e, t) {
var r, o, a = 1 / 0;
try {
for (var i = n(t), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(e, c.name);
l < a && (a = l);
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
return a;
}, e.prototype.updatePowerBanks = function(e) {
var t;
e.powerBanks = e.powerBanks.filter(function(e) {
return e.decayTick > Game.time;
});
var r = function(r) {
var o, a, i = Game.rooms[r].find(FIND_STRUCTURES, {
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
}), ye.info("Power bank discovered in ".concat(r, ": ").concat(o.power, " power"), {
subsystem: "Empire"
}));
};
try {
for (var c = (o = void 0, n(i)), l = c.next(); !l.done; l = c.next()) s(l.value);
} catch (e) {
o = {
error: e
};
} finally {
try {
l && !l.done && (a = c.return) && a.call(c);
} finally {
if (o) throw o.error;
}
}
};
for (var o in Game.rooms) r(o);
}, e.prototype.updateWarTargets = function(e) {
if (e.warTargets = e.warTargets.filter(function(t) {
var r, o, n = e.knownRooms[t];
return !!n && n.owner !== (null !== (o = null === (r = Object.values(Game.spawns)[0]) || void 0 === r ? void 0 : r.owner.username) && void 0 !== o ? o : "");
}), e.objectives.warMode) for (var t in e.knownRooms) {
var r = e.knownRooms[t];
r.threatLevel >= 2 && !e.warTargets.includes(t) && (e.warTargets.push(t), ye.warn("Added war target: ".concat(t, " (threat level ").concat(r.threatLevel, ")"), {
subsystem: "Empire"
}));
}
}, e.prototype.updateObjectives = function(e) {
var t = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
e.objectives.targetRoomCount = Game.gcl.level, e.objectives.targetPowerLevel = Math.min(25, 3 * t.length), 
e.warTargets.length > 0 && !e.objectives.warMode && (e.objectives.warMode = !0, 
ye.warn("War mode enabled due to active war targets", {
subsystem: "Empire"
})), 0 === e.warTargets.length && e.objectives.warMode && (e.objectives.warMode = !1, 
ye.info("War mode disabled - no active war targets", {
subsystem: "Empire"
}));
}, e.prototype.getNextExpansionTarget = function() {
var e = Yt.getEmpire().claimQueue.filter(function(e) {
return !e.claimed;
});
return e.length > 0 ? e[0] : null;
}, e.prototype.markExpansionClaimed = function(e) {
var t = Yt.getEmpire().claimQueue.find(function(t) {
return t.roomName === e;
});
t && (t.claimed = !0, ye.info("Marked expansion target as claimed: ".concat(e), {
subsystem: "Empire"
}));
}, e.prototype.refreshRoomIntel = function(e) {
if (Game.time % this.config.intelRefreshInterval === 0) {
var t = 0;
for (var r in Game.rooms) {
var o = Game.rooms[r];
e.knownRooms[r] ? (this.updateRoomIntel(e.knownRooms[r], o), t++) : (e.knownRooms[r] = this.createRoomIntel(o), 
t++);
}
t > 0 && Game.time % 500 == 0 && ye.info("Refreshed intel for ".concat(t, " rooms"), {
subsystem: "Empire"
});
}
}, e.prototype.discoverNearbyRooms = function(e) {
var t, r, o, a;
if (Game.time % this.config.roomDiscoveryInterval === 0) {
var i = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (0 !== i.length) {
var s = 0;
try {
for (var c = n(i), l = c.next(); !l.done; l = c.next()) {
var u = uo(l.value.name, this.config.maxRoomDiscoveryDistance);
try {
for (var m = (o = void 0, n(u)), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (s >= this.config.maxRoomsToDiscoverPerTick) return void ye.debug("Reached discovery limit of ".concat(this.config.maxRoomsToDiscoverPerTick, " rooms per tick"), {
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
p && !p.done && (a = m.return) && a.call(m);
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
s > 0 && ye.info("Discovered ".concat(s, " nearby rooms for scouting"), {
subsystem: "Empire"
});
}
}
}, e.prototype.createStubIntel = function(e) {
var t = co(e);
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
}, e.prototype.createRoomIntel = function(e) {
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
}, e.prototype.updateRoomIntel = function(e, t) {
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
}, e.prototype.trackGCLProgress = function(e) {
var t = Game.gcl.progress / Game.gcl.progressTotal * 100;
t >= this.config.gclNotifyThreshold && Game.time % 500 == 0 && ye.info("GCL ".concat(Game.gcl.level, " progress: ").concat(t.toFixed(1), "% (").concat(Game.gcl.progress, "/").concat(Game.gcl.progressTotal, ")"), {
subsystem: "Empire"
}), e.objectives.targetRoomCount = Game.gcl.level;
}, e.prototype.checkExpansionReadiness = function(e) {
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
a < 5e4 ? e.objectives.expansionPaused || (e.objectives.expansionPaused = !0, ye.info("Expansion paused: insufficient energy reserves (".concat(a.toFixed(0), " < ").concat(5e4, ")"), {
subsystem: "Empire"
})) : e.objectives.expansionPaused && (e.objectives.expansionPaused = !1, ye.info("Expansion resumed: ".concat(o.length, " stable rooms with ").concat(a.toFixed(0), " avg energy"), {
subsystem: "Empire"
}));
} else e.objectives.expansionPaused || (e.objectives.expansionPaused = !0, ye.info("Expansion paused: waiting for stable room (RCL >= 4 with storage)", {
subsystem: "Empire"
}));
}
}, e.prototype.refreshNukeCandidates = function(e) {
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
var n = a.scoreNukeCandidate(r);
n >= 50 && (e.nukeCandidates.push({
roomName: t,
score: n,
launched: !1,
launchTick: 0
}), ye.info("Added nuke candidate: ".concat(t, " (score: ").concat(n, ")"), {
subsystem: "Empire"
}));
}, a = this;
try {
for (var i = n(e.warTargets), s = i.next(); !s.done; s = i.next()) o(s.value);
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
}, e.prototype.scoreNukeCandidate = function(e) {
var t, r, o = 0;
return o += 10 * e.controllerLevel, o += 15 * (null !== (t = e.towerCount) && void 0 !== t ? t : 0), 
o += 20 * (null !== (r = e.spawnCount) && void 0 !== r ? r : 0), e.isSK || e.isHighway ? 0 : o;
}, e.prototype.monitorClusterHealth = function() {
if (Game.time % 50 == 0) {
var e = Yt.getClusters(), t = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), r = function(r) {
var o = e[r], n = t.filter(function(e) {
return o.memberRooms.includes(e.name);
});
if (0 === n.length) return "continue";
var a = n.reduce(function(e, t) {
var r, o, n, a;
return e + (null !== (o = null === (r = t.storage) || void 0 === r ? void 0 : r.store[RESOURCE_ENERGY]) && void 0 !== o ? o : 0) + (null !== (a = null === (n = t.terminal) || void 0 === n ? void 0 : n.store[RESOURCE_ENERGY]) && void 0 !== a ? a : 0);
}, 0), i = a / n.length, s = Game.cpu.getUsed() / t.length, c = s > 2;
i < 3e4 && Game.time % 500 == 0 && ye.warn("Cluster ".concat(r, " has low energy: ").concat(i.toFixed(0), " avg (threshold: 30000)"), {
subsystem: "Empire"
}), c && Game.time % 500 == 0 && ye.warn("Cluster ".concat(r, " has high CPU usage: ").concat(s.toFixed(2), " per room"), {
subsystem: "Empire"
}), o.metrics || (o.metrics = {
energyIncome: 0,
energyConsumption: 0,
energyBalance: 0,
warIndex: 0,
economyIndex: 0
});
var l = Math.min(100, i / 1e5 * 100), u = n.length / o.memberRooms.length * 100;
o.metrics.economyIndex = Math.round((l + u) / 2), o.metrics.economyIndex < 40 && Game.time % 500 == 0 && ye.warn("Cluster ".concat(r, " economy index low: ").concat(o.metrics.economyIndex, " - consider rebalancing"), {
subsystem: "Empire"
});
};
for (var o in e) r(o);
}
}, e.prototype.assessPowerBankProfitability = function(e) {
var t, r, o, a, i, s;
if (Game.time % 100 == 0) {
var c = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (0 !== c.length) try {
for (var l = n(e.powerBanks), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!m.active) {
var p = 1 / 0, d = null;
try {
for (var f = (o = void 0, n(c)), y = f.next(); !y.done; y = f.next()) {
var g = y.value, h = Game.map.getRoomLinearDistance(g.name, m.roomName);
h < p && (p = h, d = g);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (a = f.return) && a.call(f);
} finally {
if (o) throw o.error;
}
}
if (d) {
var v = m.decayTick - Game.time, R = 50 * p * 2 + m.power / 2, E = v > 1.5 * R && p <= 5 && m.power >= 1e3 && (null !== (s = null === (i = d.controller) || void 0 === i ? void 0 : i.level) && void 0 !== s ? s : 0) >= 7;
E || Game.time % 500 != 0 ? E && Game.time % 500 == 0 && ye.info("Profitable power bank in ".concat(m.roomName, ": ") + "power=".concat(m.power, ", distance=").concat(p, ", timeRemaining=").concat(v), {
subsystem: "Empire"
}) : ye.debug("Power bank in ".concat(m.roomName, " not profitable: ") + "power=".concat(m.power, ", distance=").concat(p, ", timeRemaining=").concat(v, ", ") + "requiredTime=".concat(R.toFixed(0)), {
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
}, o([ gr("empire:manager", "Empire Manager", {
priority: jt.MEDIUM,
interval: 30,
minBucket: 0,
cpuBudget: .05
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), xc = new _c, Uc = {
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
}, kc = new (function() {
function e(e) {
void 0 === e && (e = {}), this.coordinator = new cc(r(r({}, Uc), e), {
getEmpire: function() {
return Yt.getEmpire();
},
getSwarmState: function(e) {
return Yt.getSwarmState(e);
},
getClusters: function() {
return Yt.getClusters();
}
});
}
return e.prototype.run = function() {
this.coordinator.run();
}, e.prototype.getConfig = function() {
return this.coordinator.getConfig();
}, e.prototype.updateConfig = function(e) {
this.coordinator.updateConfig(e);
}, o([ gr("empire:nuke", "Nuke Manager", {
priority: jt.LOW,
interval: 500,
minBucket: 0,
cpuBudget: .01
}) ], e.prototype, "run", null), o([ vr() ], e);
}()), Mc = function() {
function e() {}
return e.prototype.ensurePixelBuyingMemory = function() {
var e = Yt.getEmpire();
if (e.market) {
var t = e.market;
t.pixelBuying || (t.pixelBuying = {
lastPurchaseTick: 0,
totalPixelsPurchased: 0,
totalCreditsSpent: 0,
purchaseHistory: [],
lastScan: 0
});
}
}, e.prototype.getPixelBuyingMemory = function() {
var e = Yt.getEmpire();
if (e.market) return e.market.pixelBuying;
}, e;
}(), Ac = new (function(e) {
function r(t) {
return void 0 === t && (t = {}), e.call(this, t, new Mc) || this;
}
return t(r, e), r.prototype.run = function() {
e.prototype.run.call(this);
}, o([ gr("empire:pixelBuying", "Pixel Buying Manager", {
priority: jt.IDLE,
interval: 200,
minBucket: 0,
cpuBudget: .01
}) ], r.prototype, "run", null), o([ vr() ], r);
}(gs)), Nc = function() {
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
}(), Ic = new (function(e) {
function r(t) {
return void 0 === t && (t = {}), e.call(this, t, new Nc) || this;
}
return t(r, e), r.prototype.run = function() {
e.prototype.run.call(this);
}, o([ gr("empire:pixelGeneration", "Pixel Generation Manager", {
priority: jt.IDLE,
interval: 1,
minBucket: 0,
cpuBudget: .01
}) ], r.prototype, "run", null), o([ vr() ], r);
}(vs));

function Pc(e, t) {
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

function Gc(e, t, r) {
var o, n = Yt.getSwarmState(e);
if (n) {
var a = null !== (o = n.remoteAssignments) && void 0 !== o ? o : [], i = a.indexOf(t);
if (-1 !== i) {
a.splice(i, 1), n.remoteAssignments = a;
var s = Yt.getEmpire().knownRooms[t];
s && (s.threatLevel = 3, s.lastSeen = Game.time), ye.warn("Removed remote room ".concat(t, " from ").concat(e, " due to: ").concat(r), {
subsystem: "RemoteRoomManager"
});
}
}
}

function Lc(e) {
var t, r, o, a = Yt.getSwarmState(e);
if (a) {
var i = null !== (o = a.remoteAssignments) && void 0 !== o ? o : [];
if (0 !== i.length) try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
if (u) {
var m = Pc(u);
m.lost && m.reason && Gc(e, l, m.reason);
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
}
}

var Dc = {
updateInterval: 50,
minBucket: 0,
maxSitesPerRemotePerTick: 2
}, Fc = function() {
function e(e) {
void 0 === e && (e = {}), this.config = r(r({}, Dc), e);
}
return e.prototype.run = function() {
var e, t, r, o, a, i = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Yt.getSwarmState(l.name);
if (u) {
Lc(l.name);
var m = null !== (a = u.remoteAssignments) && void 0 !== a ? a : [];
if (0 !== m.length) {
try {
for (var p = (r = void 0, n(m)), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
this.planRemoteInfrastructure(l, f);
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
this.placeRemoteRoads(l, m);
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
}, e.prototype.planRemoteInfrastructure = function(e, t) {
var r, o, a = Game.rooms[t];
if (a) {
var i = a.controller, s = this.getMyUsername();
if (i) {
if (i.owner && i.owner.username !== s) return;
if (i.reservation && i.reservation.username !== s) return;
}
var c = a.find(FIND_SOURCES), l = 0;
try {
for (var u = n(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (l >= this.config.maxSitesPerRemotePerTick) break;
this.placeSourceContainer(a, p) && l++;
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
}, e.prototype.placeSourceContainer = function(e, t) {
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
if (!r) return ye.warn("Could not find valid position for container at source ".concat(t.id, " in ").concat(e.name), {
subsystem: "RemoteInfra"
}), !1;
if (e.find(FIND_CONSTRUCTION_SITES).length >= 5) return !1;
var o = e.createConstructionSite(r.x, r.y, STRUCTURE_CONTAINER);
return o === OK ? (ye.info("Placed container construction site at source ".concat(t.id, " in ").concat(e.name), {
subsystem: "RemoteInfra"
}), !0) : (ye.debug("Failed to place container at source ".concat(t.id, " in ").concat(e.name, ": ").concat(o), {
subsystem: "RemoteInfra"
}), !1);
}, e.prototype.findBestContainerPosition = function(e) {
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
}, e.prototype.placeRemoteRoads = function(e, t) {
var r, o, a = Ei(e, t), i = a.get(e.name);
i && this.placeRoadsInRoom(e, i);
try {
for (var s = n(t), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
if (u) {
var m = a.get(l);
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
}, e.prototype.placeRoadsInRoom = function(e, t) {
var r, o, i = e.find(FIND_CONSTRUCTION_SITES), s = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
});
if (!(i.length >= 5)) {
var c = new Set(s.map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), l = new Set(i.filter(function(e) {
return e.structureType === STRUCTURE_ROAD;
}).map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), u = e.getTerrain(), m = 0;
try {
for (var p = n(t), d = p.next(); !d.done; d = p.next()) {
var f = d.value;
if (m >= 3) break;
if (i.length + m >= 5) break;
if (!c.has(f) && !l.has(f)) {
var y = a(f.split(","), 2), g = y[0], h = y[1], v = parseInt(g, 10), R = parseInt(h, 10);
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
m > 0 && ye.debug("Placed ".concat(m, " remote road construction sites in ").concat(e.name), {
subsystem: "RemoteInfra"
});
}
}, e.prototype.getMyUsername = function() {
var e = Object.values(Game.spawns);
return e.length > 0 ? e[0].owner.username : "";
}, o([ yr("remote:infrastructure", "Remote Infrastructure Manager", {
priority: jt.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .05
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), Bc = new Fc, Hc = {
updateInterval: 50,
minBucket: 0,
maxCpuBudget: .01
}, Wc = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = r(r({}, Hc), e);
}
return e.prototype.run = function() {
this.lastRun = Game.time;
var e = InterShardMemory.getLocal();
if (e) {
var t = Dr(e);
if (t) {
this.updateEnemyIntelligence(t);
var r = Lr(t);
InterShardMemory.setLocal(r);
}
}
}, e.prototype.updateEnemyIntelligence = function(e) {
var t, r, o, a;
if (e) {
var i = Yt.getEmpire(), s = new Map;
if (e.globalTargets.enemies) try {
for (var c = n(e.globalTargets.enemies), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
s.set(u.username, u);
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
if (i.warTargets) try {
for (var m = n(i.warTargets), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
(y = s.get(d)) ? (y.lastSeen = Game.time, y.threatLevel = Math.max(y.threatLevel, 1)) : s.set(d, {
username: d,
rooms: [],
threatLevel: 1,
lastSeen: Game.time,
isAlly: !1
});
}
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (a = m.return) && a.call(m);
} finally {
if (o) throw o.error;
}
}
if (i.knownRooms) for (var f in i.knownRooms) {
var y, g = i.knownRooms[f];
g && g.owner && !g.owner.includes("Source Keeper") && ((y = s.get(g.owner)) ? (y.rooms.includes(f) || y.rooms.push(f), 
y.lastSeen = Math.max(y.lastSeen, g.lastSeen), y.threatLevel = Math.max(y.threatLevel, g.threatLevel)) : s.set(g.owner, {
username: g.owner,
rooms: [ f ],
threatLevel: g.threatLevel,
lastSeen: g.lastSeen,
isAlly: !1
}));
}
if (e.globalTargets.enemies = Array.from(s.values()), Game.time % 500 == 0) {
var h = e.globalTargets.enemies.length, v = e.globalTargets.enemies.filter(function(e) {
return e.threatLevel >= 2;
}).length;
ye.info("Cross-shard intel: ".concat(h, " enemies tracked, ").concat(v, " high threat"), {
subsystem: "CrossShardIntel"
});
}
}
}, e.prototype.getGlobalEnemies = function() {
var e = InterShardMemory.getLocal();
if (!e) return [];
var t = Dr(e);
return t && t.globalTargets.enemies || [];
}, o([ gr("empire:crossShardIntel", "Cross-Shard Intel", {
priority: jt.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .01
}) ], e.prototype, "run", null), o([ vr() ], e);
}(), Yc = new Wc, Kc = {
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
}, Vc = function() {
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
}(), jc = function() {
function e(e) {
void 0 === e && (e = {}), this.trackers = new Map, this.config = r(r({}, Kc), e);
}
return e.prototype.getTracker = function(e) {
var t = this.trackers.get(e);
return t || (t = {
energyHarvested: new Vc(10),
energySpawning: new Vc(10),
energyConstruction: new Vc(10),
energyRepair: new Vc(10),
energyTower: new Vc(10),
controllerProgress: new Vc(10),
hostileCount: new Vc(5),
damageReceived: new Vc(5),
idleWorkers: new Vc(10),
lastControllerProgress: 0
}, this.trackers.set(e, t)), t;
}, e.prototype.updateMetrics = function(e, t) {
var r, o, a, i, s, c, l, u, m = this.getTracker(e.name), p = "sources_".concat(e.name), d = global[p];
d && d.tick === Game.time ? u = d.sources : (u = e.find(FIND_SOURCES), global[p] = {
sources: u,
tick: Game.time
});
var f = 0, y = 0;
try {
for (var g = n(u), h = g.next(); !h.done; h = g.next()) {
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
var T = Wo(e, FIND_HOSTILE_CREEPS);
m.hostileCount.add(T.length);
var C = 0;
try {
for (var S = n(T), w = S.next(); !w.done; w = S.next()) {
var O = w.value;
try {
for (var b = (s = void 0, n(O.body)), _ = b.next(); !_.done; _ = b.next()) {
var x = _.value;
x.hits > 0 && (x.type === ATTACK ? C += 30 : x.type === RANGED_ATTACK && (C += 10));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
_ && !_.done && (c = b.return) && c.call(b);
} finally {
if (s) throw s.error;
}
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
w && !w.done && (i = S.return) && i.call(S);
} finally {
if (a) throw a.error;
}
}
m.damageReceived.add(C), t.metrics.energyHarvested = m.energyHarvested.get(), t.metrics.controllerProgress = m.controllerProgress.get(), 
t.metrics.hostileCount = Math.round(m.hostileCount.get()), t.metrics.damageReceived = m.damageReceived.get();
}, e.prototype.updatePheromones = function(e, t) {
var r, o;
if (!(Game.time < e.nextUpdateTick)) {
var a = e.pheromones;
try {
for (var i = n(Object.keys(a)), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = this.config.decayFactors[c];
a[c] = this.clamp(a[c] * l);
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
r >= 3 && (e.pheromones.siege = this.clamp(e.pheromones.siege + 20)), ye.info("Hostile detected: ".concat(t, " hostiles, danger=").concat(r), {
room: e.role,
subsystem: "Pheromone"
});
}, e.prototype.updateDangerFromThreat = function(e, t, r) {
e.danger = r, e.pheromones.defense = this.clamp(t / 10), r >= 2 && (e.pheromones.war = this.clamp(e.pheromones.war + 10 * r)), 
r >= 3 && (e.pheromones.siege = this.clamp(e.pheromones.siege + 20));
}, e.prototype.diffuseDangerToCluster = function(e, t, r) {
var o, a, i;
try {
for (var s = n(r), c = s.next(); !c.done; c = s.next()) {
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
c && !c.done && (a = s.return) && a.call(s);
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
var t, r, o, i, s, c, l, u, m = [];
try {
for (var p = n(e), d = p.next(); !d.done; d = p.next()) {
var f = a(d.value, 2), y = f[0], g = f[1], h = this.getNeighborRoomNames(y);
try {
for (var v = (o = void 0, n(h)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
if (e.get(E)) try {
for (var T = (s = void 0, n([ "defense", "war", "expand", "siege" ])), C = T.next(); !C.done; C = T.next()) {
var S = C.value, w = g.pheromones[S];
if (w > 1) {
var O = this.config.diffusionRates[S];
m.push({
source: y,
target: E,
type: S,
amount: w * O * .5,
sourceIntensity: w
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
R && !R.done && (i = v.return) && i.call(v);
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
for (var b = n(m), _ = b.next(); !_.done; _ = b.next()) {
var x = _.value, U = e.get(x.target);
if (U) {
var k = U.pheromones[x.type] + x.amount;
U.pheromones[x.type] = this.clamp(Math.min(k, x.sourceIntensity));
}
}
} catch (e) {
l = {
error: e
};
} finally {
try {
_ && !_.done && (u = b.return) && u.call(b);
} finally {
if (l) throw l.error;
}
}
}, e.prototype.getNeighborRoomNames = function(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
if (!t) return [];
var r = a(t, 5), o = r[1], n = r[2], i = r[3], s = r[4];
if (!(o && n && i && s)) return [];
var c = parseInt(n, 10), l = parseInt(s, 10), u = [];
return "N" === i ? u.push("".concat(o).concat(c, "N").concat(l + 1)) : l > 0 ? u.push("".concat(o).concat(c, "S").concat(l - 1)) : u.push("".concat(o).concat(c, "N0")), 
"S" === i ? u.push("".concat(o).concat(c, "S").concat(l + 1)) : l > 0 ? u.push("".concat(o).concat(c, "N").concat(l - 1)) : u.push("".concat(o).concat(c, "S0")), 
"E" === o ? u.push("E".concat(c + 1).concat(i).concat(l)) : c > 0 ? u.push("W".concat(c - 1).concat(i).concat(l)) : u.push("E0".concat(i).concat(l)), 
"W" === o ? u.push("W".concat(c + 1).concat(i).concat(l)) : c > 0 ? u.push("E".concat(c - 1).concat(i).concat(l)) : u.push("W0".concat(i).concat(l)), 
u;
}, e.prototype.getDominantPheromone = function(e) {
var t, r, o = null, a = 1;
try {
for (var i = n(Object.keys(e)), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
e[c] > a && (a = e[c], o = c);
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
}(), zc = new jc, qc = function() {
function e() {}
return e.prototype.cleanupMemory = function() {
for (var e in Memory.creeps) Game.creeps[e] || delete Memory.creeps[e];
}, e.prototype.checkMemorySize = function() {
var e = RawMemory.get().length, t = 2097152, r = e / t * 100;
r > 90 ? qe.error("Memory usage critical: ".concat(r.toFixed(1), "% (").concat(e, "/").concat(t, " bytes)"), {
subsystem: "Memory"
}) : r > 75 && qe.warn("Memory usage high: ".concat(r.toFixed(1), "% (").concat(e, "/").concat(t, " bytes)"), {
subsystem: "Memory"
});
}, e.prototype.updateMemorySegmentStats = function() {
Xn.run();
}, e.prototype.runPheromoneDiffusion = function() {
var e, t, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), o = new Map;
try {
for (var a = n(r), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Yt.getSwarmState(s.name);
c && o.set(s.name, c);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
zc.applyDiffusion(o);
}, e.prototype.initializeLabConfigs = function() {
var e, t, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var o = n(r), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
yt.initialize(i.name);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.precacheRoomPaths = function() {}, o([ gr("core:memoryCleanup", "Memory Cleanup", {
priority: jt.LOW,
interval: 50,
cpuBudget: .01
}) ], e.prototype, "cleanupMemory", null), o([ hr("core:memorySizeCheck", "Memory Size Check", {
interval: 100,
cpuBudget: .005
}) ], e.prototype, "checkMemorySize", null), o([ yr("core:memorySegmentStats", "Memory Segment Stats", {
priority: jt.IDLE,
interval: 10,
cpuBudget: .01
}) ], e.prototype, "updateMemorySegmentStats", null), o([ yr("cluster:pheromoneDiffusion", "Pheromone Diffusion", {
priority: jt.MEDIUM,
interval: 10,
cpuBudget: .02
}) ], e.prototype, "runPheromoneDiffusion", null), o([ gr("room:labConfig", "Lab Config Manager", {
priority: jt.LOW,
interval: 200,
cpuBudget: .01
}) ], e.prototype, "initializeLabConfigs", null), o([ hr("room:pathCachePrecache", "Path Cache Precache (Disabled)", {
interval: 1e3,
cpuBudget: .01
}) ], e.prototype, "precacheRoomPaths", null), o([ vr() ], e);
}(), Xc = new qc, Qc = ze("NativeCallsTracker");

function Zc(e, t, r) {
var o = e[t];
if (o && !o.__nativeCallsTrackerWrapped) {
var n = Object.getOwnPropertyDescriptor(e, t);
if (n && !1 === n.configurable) Qc.warn("Cannot wrap method - property is not configurable", {
meta: {
methodName: t
}
}); else try {
var a = function() {
for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
return jn.recordNativeCall(r), o.apply(this, e);
};
a.__nativeCallsTrackerWrapped = !0, Object.defineProperty(e, t, {
value: a,
writable: !0,
enumerable: !0,
configurable: !0
});
} catch (e) {
Qc.warn("Failed to wrap method", {
meta: {
methodName: t,
error: String(e)
}
});
}
}
}

function Jc(e) {
return null !== e && "object" == typeof e && "pos" in e && e.pos instanceof RoomPosition && "room" in e && e.room instanceof Room;
}

var $c = new Set([ "harvester", "upgrader", "mineralHarvester", "depositHarvester", "factoryWorker", "labTech", "builder" ]), el = {
harvester: jt.CRITICAL,
queenCarrier: jt.CRITICAL,
hauler: jt.HIGH,
guard: jt.HIGH,
healer: jt.HIGH,
soldier: jt.HIGH,
ranger: jt.HIGH,
siegeUnit: jt.HIGH,
harasser: jt.HIGH,
powerQueen: jt.HIGH,
powerWarrior: jt.HIGH,
larvaWorker: jt.HIGH,
builder: jt.MEDIUM,
upgrader: jt.MEDIUM,
interRoomCarrier: jt.MEDIUM,
scout: jt.MEDIUM,
claimer: jt.MEDIUM,
engineer: jt.MEDIUM,
remoteHarvester: jt.MEDIUM,
powerHarvester: jt.MEDIUM,
powerCarrier: jt.MEDIUM,
remoteHauler: jt.LOW,
remoteWorker: jt.LOW,
linkManager: jt.LOW,
terminalManager: jt.LOW,
mineralHarvester: jt.LOW,
labTech: jt.IDLE,
factoryWorker: jt.IDLE
};

function tl(e) {
var t;
return null !== (t = el[e]) && void 0 !== t ? t : jt.MEDIUM;
}

var rl = function() {
function e() {
this.registeredCreeps = new Set, this.lastSyncTick = -1;
}
return e.prototype.syncCreepProcesses = function() {
var e, t;
if (this.lastSyncTick !== Game.time) {
this.lastSyncTick = Game.time;
var r = new Set, o = 0, a = 0, i = 0, s = Object.keys(Game.creeps).length;
for (var c in Game.creeps) {
var l = Game.creeps[c];
l.spawning ? i++ : (r.add(c), this.registeredCreeps.has(c) || (this.registerCreepProcess(l), 
o++));
}
try {
for (var u = n(this.registeredCreeps), m = u.next(); !m.done; m = u.next()) c = m.value, 
r.has(c) || (this.unregisterCreepProcess(c), a++);
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
(o > 0 || a > 0 || Game.time % 10 == 0 || p) && qe.info("CreepProcessManager: ".concat(r.size, " active, ").concat(i, " spawning, ").concat(s, " total (registered: ").concat(o, ", unregistered: ").concat(a, ")"), {
subsystem: "CreepProcessManager",
meta: {
activeCreeps: r.size,
spawningCreeps: i,
totalCreeps: s,
registeredThisTick: o,
unregisteredThisTick: a
}
});
}
}, e.prototype.registerCreepProcess = function(e) {
var t = e.memory.role, r = tl(t), o = "creep:".concat(e.name);
mr.registerProcess({
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
if ((Game.time % 10 == 0 || o) && qe.info("Executing role for creep ".concat(e.name, " (").concat(t.role, ")"), {
subsystem: "CreepProcessManager",
creep: e.name
}), function(e) {
var t = e.memory;
if (!$c.has(t.role)) return !1;
var r = t.state;
if (!r || !r.startTick) return !1;
if (Game.time - r.startTick < 3) return !1;
switch (t.role) {
case "harvester":
return function(e, t) {
if ("harvest" !== t.action && "transfer" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
if (!r || !Jc(r)) return !1;
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
return !(!r || !Jc(r) || !e.pos.inRangeTo(r.pos, 3) || "upgrade" === t.action && 0 === e.store.getUsedCapacity(RESOURCE_ENERGY) || "withdraw" === t.action && 0 === e.store.getFreeCapacity(RESOURCE_ENERGY));
}(e, r);

case "mineralHarvester":
return function(e, t) {
if ("harvestMineral" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
return !(!r || !Jc(r) || !e.pos.isNearTo(r.pos) || 0 === e.store.getFreeCapacity());
}(e, r);

case "builder":
return function(e, t) {
if ("build" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
return !(!r || !Jc(r) || !e.pos.inRangeTo(r.pos, 3) || 0 === e.store.getUsedCapacity(RESOURCE_ENERGY));
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
if (!r || !Jc(r)) return !1;
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
jn.measureSubsystem("role:".concat(i), function() {
switch (a) {
case "economy":
default:
!function(e) {
var t = ba(e);
Fa(e, Wa(t, $a), t);
}(e);
break;

case "military":
!function(e) {
var t = ba(e);
Fa(e, Wa(t, es), t);
}(e);
break;

case "utility":
!function(e) {
var t = ba(e);
Fa(e, Wa(t, us), t);
}(e);
break;

case "power":
!function(e) {
var t = ba(e);
Fa(e, Wa(t, ns), t);
}(e);
}
});
} catch (t) {
qe.error("EXCEPTION in role execution for ".concat(e.name, " (").concat(i, "/").concat(a, "): ").concat(t), {
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
}), this.registeredCreeps.add(e.name), qe.info("Registered creep process: ".concat(e.name, " (").concat(t, ") with priority ").concat(r), {
subsystem: "CreepProcessManager"
});
}, e.prototype.unregisterCreepProcess = function(e) {
var t = "creep:".concat(e);
mr.unregisterProcess(t), this.registeredCreeps.delete(e), qe.info("Unregistered creep process: ".concat(e), {
subsystem: "CreepProcessManager"
});
}, e.prototype.getMinBucketForPriority = function(e) {
return 0;
}, e.prototype.getCpuBudgetForPriority = function(e) {
return e >= jt.CRITICAL ? .012 : e >= jt.HIGH ? .01 : e >= jt.MEDIUM ? .008 : .006;
}, e.prototype.getStats = function() {
var e, t, r, o, a = {};
try {
for (var i = n(this.registeredCreeps), s = i.next(); !s.done; s = i.next()) {
var c = s.value, l = Game.creeps[c];
if (l) {
var u = tl(l.memory.role), m = null !== (r = jt[u]) && void 0 !== r ? r : "UNKNOWN";
a[m] = (null !== (o = a[m]) && void 0 !== o ? o : 0) + 1;
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
creepsByPriority: a
};
}, e.prototype.forceResync = function() {
this.lastSyncTick = -1, this.syncCreepProcesses();
}, e.prototype.reset = function() {
this.registeredCreeps.clear(), this.lastSyncTick = -1;
}, e;
}(), ol = new rl, nl = {
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
}, al = {
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
}, il = {
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
}, sl = function() {
function e() {
this.STRUCTURE_CACHE_NAMESPACE = "evolution:structures", this.structureCacheTtl = 20;
}
return e.prototype.determineEvolutionStage = function(e, t, r) {
var o, n, a, i, s = null !== (n = null === (o = t.controller) || void 0 === o ? void 0 : o.level) && void 0 !== n ? n : 0, c = Game.gcl.level, l = this.getStructureCounts(t), u = null !== (i = null === (a = e.remoteAssignments) || void 0 === a ? void 0 : a.length) && void 0 !== i ? i : 0;
return this.meetsThreshold("empireDominance", s, r, c, l, u) ? "empireDominance" : this.meetsThreshold("fortifiedHive", s, r, c, l, u) ? "fortifiedHive" : this.meetsThreshold("matureColony", s, r, c, l, u) ? "matureColony" : this.meetsThreshold("foragingExpansion", s, r, c, l, u) ? "foragingExpansion" : "seedNest";
}, e.prototype.meetsThreshold = function(e, t, r, o, n, a) {
var i, s, c = nl[e], l = null !== (i = n[STRUCTURE_TOWER]) && void 0 !== i ? i : 0, u = null !== (s = n[STRUCTURE_LAB]) && void 0 !== s ? s : 0;
return !(t < c.rcl || c.minRooms && r < c.minRooms || c.minGcl && o < c.minGcl || c.minRemoteRooms && a < c.minRemoteRooms || c.minTowerCount && l < c.minTowerCount || c.requiresStorage && !n[STRUCTURE_STORAGE] || c.requiresTerminal && t >= 6 && !n[STRUCTURE_TERMINAL] || c.requiresLabs && 0 === u || c.minLabCount && t >= 6 && u < c.minLabCount || c.requiresFactory && t >= 7 && !n[STRUCTURE_FACTORY] || c.requiresPowerSpawn && t >= 7 && !n[STRUCTURE_POWER_SPAWN] || c.requiresObserver && t >= 8 && !n[STRUCTURE_OBSERVER] || c.requiresNuker && t >= 8 && !n[STRUCTURE_NUKER]);
}, e.prototype.getStructureCounts = function(e) {
var t, r, o, a = fn.get(e.name, {
namespace: this.STRUCTURE_CACHE_NAMESPACE,
ttl: this.structureCacheTtl
});
if (a) return a;
var i = {}, s = e.find(FIND_MY_STRUCTURES);
try {
for (var c = n(s), l = c.next(); !l.done; l = c.next()) {
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
return fn.set(e.name, i, {
namespace: this.STRUCTURE_CACHE_NAMESPACE,
ttl: this.structureCacheTtl
}), i;
}, e.prototype.updateEvolutionStage = function(e, t, r) {
var o = this.determineEvolutionStage(e, t, r);
return o !== e.colonyLevel && (ye.info("Room evolution: ".concat(e.colonyLevel, " -> ").concat(o), {
room: t.name,
subsystem: "Evolution"
}), e.colonyLevel = o, !0);
}, e.prototype.updateMissingStructures = function(e, t) {
var r, o, n, a, i, s, c, l, u, m, p, d, f = this.getStructureCounts(t), y = null !== (o = null === (r = t.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0, g = nl[e.colonyLevel], h = g.requiresLabs && y >= 6, v = h ? null !== (n = g.minLabCount) && void 0 !== n ? n : 3 : 0, R = g.requiresFactory && y >= 7, E = g.requiresTerminal && y >= 6, T = g.requiresStorage && y >= 4, C = g.requiresPowerSpawn && y >= 7, S = g.requiresObserver && y >= 8, w = g.requiresNuker && y >= 8;
e.missingStructures = {
spawn: 0 === (null !== (a = f[STRUCTURE_SPAWN]) && void 0 !== a ? a : 0),
storage: !!T && 0 === (null !== (i = f[STRUCTURE_STORAGE]) && void 0 !== i ? i : 0),
terminal: !!E && 0 === (null !== (s = f[STRUCTURE_TERMINAL]) && void 0 !== s ? s : 0),
labs: !!h && (null !== (c = f[STRUCTURE_LAB]) && void 0 !== c ? c : 0) < v,
nuker: !!w && 0 === (null !== (l = f[STRUCTURE_NUKER]) && void 0 !== l ? l : 0),
factory: !!R && 0 === (null !== (u = f[STRUCTURE_FACTORY]) && void 0 !== u ? u : 0),
extractor: y >= 6 && 0 === (null !== (m = f[STRUCTURE_EXTRACTOR]) && void 0 !== m ? m : 0),
powerSpawn: !!C && 0 === (null !== (p = f[STRUCTURE_POWER_SPAWN]) && void 0 !== p ? p : 0),
observer: !!S && 0 === (null !== (d = f[STRUCTURE_OBSERVER]) && void 0 !== d ? d : 0)
};
}, e;
}(), cl = function() {
function e() {}
return e.prototype.determinePosture = function(e, t) {
if (t) return t;
var r = e.pheromones, o = e.danger;
return o >= 3 ? "siege" : o >= 2 ? "war" : r.siege > 30 ? "siege" : r.war > 25 ? "war" : r.defense > 20 ? "defensive" : r.nukeTarget > 40 ? "nukePrep" : r.expand > 30 && 0 === o ? "expand" : o >= 1 ? "defensive" : "eco";
}, e.prototype.updatePosture = function(e, t, r) {
var o = this.determinePosture(e, t);
if (o !== e.posture) {
var n = e.posture, a = null != r ? r : e.role;
return ye.info("Posture change: ".concat(n, " -> ").concat(o), {
room: a,
subsystem: "Posture"
}), e.posture = o, mr.emit("posture.change", {
roomName: a,
oldPosture: n,
newPosture: o,
source: "PostureManager"
}), !0;
}
return !1;
}, e.prototype.getSpawnProfile = function(e) {
return al[e];
}, e.prototype.getResourcePriorities = function(e) {
return il[e];
}, e.prototype.allowsBuilding = function(e) {
return "evacuate" !== e && "siege" !== e;
}, e.prototype.allowsUpgrading = function(e) {
return "evacuate" !== e && "siege" !== e && "war" !== e;
}, e.prototype.isCombatPosture = function(e) {
return "defensive" === e || "war" === e || "siege" === e;
}, e.prototype.allowsExpansion = function(e) {
return "eco" === e || "expand" === e;
}, e;
}(), ll = new sl, ul = new cl, ml = new Map, pl = function() {
function e() {}
return e.prototype.updateThreatAssessment = function(e, t, r) {
var o, s, c, l, u, m;
if (Game.time % 5 == 0) {
var p = r.spawns.length + r.towers.length, d = ml.get(e.name);
d && d.lastTick < Game.time && p < d.lastStructureCount && (r.spawns.length < d.lastSpawns.length && mr.emit("structure.destroyed", {
roomName: e.name,
structureType: STRUCTURE_SPAWN,
structureId: "unknown",
source: e.name
}), r.towers.length < d.lastTowers.length && mr.emit("structure.destroyed", {
roomName: e.name,
structureType: STRUCTURE_TOWER,
structureId: "unknown",
source: e.name
})), ml.set(e.name, {
lastStructureCount: p,
lastSpawns: i([], a(r.spawns), !1),
lastTowers: i([], a(r.towers), !1),
lastTick: Game.time
});
}
var f = Wo(e, FIND_HOSTILE_CREEPS);
if (f.length > 0) {
var y = ai(e), g = y.dangerLevel;
if (g > t.danger) {
if (zc.updateDangerFromThreat(t, y.threatScore, y.dangerLevel), t.clusterId) {
var h = Yt.getCluster(t.clusterId);
h && zc.diffuseDangerToCluster(e.name, y.threatScore, h.memberRooms);
}
Yt.addRoomEvent(e.name, "hostileDetected", "".concat(f.length, " hostiles, danger=").concat(g, ", score=").concat(y.threatScore));
try {
for (var v = n(f), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
mr.emit("hostile.detected", {
roomName: e.name,
hostileId: E.id,
hostileOwner: E.owner.username,
bodyParts: E.body.length,
threatLevel: g,
source: e.name
});
}
} catch (e) {
o = {
error: e
};
} finally {
try {
R && !R.done && (s = v.return) && s.call(v);
} finally {
if (o) throw o.error;
}
}
}
t.danger = g;
} else t.danger > 0 && (mr.emit("hostile.cleared", {
roomName: e.name,
source: e.name
}), t.danger = 0);
if (Game.time % 10 == 0) {
var T = e.find(FIND_NUKES);
if (T.length > 0) {
if (!t.nukeDetected) {
zc.onNukeDetected(t);
var C = null !== (m = null === (u = T[0]) || void 0 === u ? void 0 : u.launchRoomName) && void 0 !== m ? m : "unidentified source";
Yt.addRoomEvent(e.name, "nukeDetected", "".concat(T.length, " nuke(s) incoming from ").concat(C)), 
t.nukeDetected = !0;
try {
for (var S = n(T), w = S.next(); !w.done; w = S.next()) {
var O = w.value;
mr.emit("nuke.detected", {
roomName: e.name,
nukeId: O.id,
landingTick: Game.time + O.timeToLand,
launchRoomName: O.launchRoomName,
source: e.name
});
}
} catch (e) {
c = {
error: e
};
} finally {
try {
w && !w.done && (l = S.return) && l.call(S);
} finally {
if (c) throw c.error;
}
}
}
} else t.nukeDetected = !1;
}
}, e.prototype.runTowerControl = function(e, t, r) {
var o, a, i, s;
if (0 !== r.length) {
var c = Wo(e, FIND_HOSTILE_CREEPS), l = c.length > 0 ? this.selectTowerTarget(c) : null, u = function(r) {
if (r.store.getUsedCapacity(RESOURCE_ENERGY) < 10) return "continue";
if (l) return r.attack(l), "continue";
var o;
if ("siege" !== t.posture && (o = r.pos.findClosestByRange(FIND_MY_CREEPS, {
filter: function(e) {
return e.hits < e.hitsMax;
}
}))) return r.heal(o), "continue";
if (!ul.isCombatPosture(t.posture) && (o = r.pos.findClosestByRange(FIND_STRUCTURES, {
filter: function(e) {
return e.hits < .8 * e.hitsMax && e.structureType !== STRUCTURE_WALL && e.structureType !== STRUCTURE_RAMPART;
}
}))) return r.repair(o), "continue";
if (!ul.isCombatPosture(t.posture) && 0 === c.length) {
var n = mi(null !== (s = null === (i = e.controller) || void 0 === i ? void 0 : i.level) && void 0 !== s ? s : 1, t.danger), a = r.pos.findClosestByRange(FIND_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART) && e.hits < n;
}
});
a && r.repair(a);
}
};
try {
for (var m = n(r), p = m.next(); !p.done; p = m.next()) u(p.value);
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (a = m.return) && a.call(m);
} finally {
if (o) throw o.error;
}
}
}
}, e.prototype.selectTowerTarget = function(e) {
var t, r = this;
return null !== (t = e.sort(function(e, t) {
var o = r.getHostilePriority(e);
return r.getHostilePriority(t) - o;
})[0]) && void 0 !== t ? t : null;
}, e.prototype.getHostilePriority = function(e) {
var t, r, o = 0;
if (o += 100 * e.getActiveBodyparts(HEAL), o += 50 * e.getActiveBodyparts(RANGED_ATTACK), 
o += 40 * e.getActiveBodyparts(ATTACK), o += 60 * e.getActiveBodyparts(CLAIM), (o += 30 * e.getActiveBodyparts(WORK)) > 0) try {
for (var a = n(e.body), i = a.next(); !i.done; i = a.next()) if (i.value.boost) {
o += 20;
break;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
return o;
}, e;
}(), dl = new pl;

function fl(e) {
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

var yl = {
name: "seedNest",
rcl: 1,
type: "spread",
minSpaceRadius: 3,
anchor: {
x: 25,
y: 25
},
structures: [ {
x: 0,
y: 0,
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
roads: [ {
x: -1,
y: -1
}, {
x: 0,
y: -1
}, {
x: 1,
y: -1
}, {
x: -1,
y: 0
}, {
x: 1,
y: 0
}, {
x: -1,
y: 1
}, {
x: 0,
y: 1
}, {
x: 1,
y: 1
} ],
ramparts: []
}, gl = {
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
roads: [ {
x: -1,
y: -1
}, {
x: 0,
y: -1
}, {
x: 1,
y: -1
}, {
x: -1,
y: 0
}, {
x: 1,
y: 0
}, {
x: -1,
y: 1
}, {
x: 0,
y: 1
}, {
x: 1,
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
x: 3,
y: 3
}, {
x: 4,
y: 3
}, {
x: 3,
y: 4
} ],
ramparts: []
}, hl = {
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
roads: [ {
x: -1,
y: -1
}, {
x: 0,
y: -1
}, {
x: 1,
y: -1
}, {
x: -1,
y: 0
}, {
x: 1,
y: 0
}, {
x: -1,
y: 1
}, {
x: 0,
y: 1
}, {
x: 1,
y: 1
}, {
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
} ],
ramparts: [ {
x: 0,
y: 0
}, {
x: 4,
y: 0
}, {
x: 0,
y: 4
}, {
x: 1,
y: 4
} ]
}, vl = {
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
roads: [ {
x: -1,
y: -1
}, {
x: 0,
y: -1
}, {
x: 1,
y: -1
}, {
x: -1,
y: 0
}, {
x: 1,
y: 0
}, {
x: -1,
y: 1
}, {
x: 0,
y: 1
}, {
x: 1,
y: 1
}, {
x: -6,
y: -2
}, {
x: -5,
y: -2
}, {
x: -4,
y: -2
}, {
x: -6,
y: -1
}, {
x: -4,
y: -1
}, {
x: -6,
y: 0
}, {
x: -5,
y: 0
}, {
x: -4,
y: 0
}, {
x: 4,
y: -2
}, {
x: 5,
y: -2
}, {
x: 6,
y: -2
}, {
x: 4,
y: -1
}, {
x: 6,
y: -1
}, {
x: 4,
y: 0
}, {
x: 5,
y: 0
}, {
x: 6,
y: 0
}, {
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
} ],
ramparts: [ {
x: 0,
y: 0
}, {
x: -5,
y: -1
}, {
x: 5,
y: -1
}, {
x: 0,
y: 4
}, {
x: 2,
y: 4
}, {
x: 0,
y: -4
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
x: 0,
y: 6
}, {
x: 4,
y: 4
}, {
x: -1,
y: 5
} ]
}, Rl = {
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

function El(e, t, r) {
for (var o = e.getTerrain(), n = -1; n <= 1; n++) for (var a = -1; a <= 1; a++) {
var i = t + n, s = r + a;
if (i < 1 || i > 48 || s < 1 || s > 48) return !1;
if (o.get(i, s) === TERRAIN_MASK_WALL) return !1;
}
return !0;
}

function Tl(e, t, r) {
var o, a, i, s, c, l = e.getTerrain(), u = null !== (c = r.minSpaceRadius) && void 0 !== c ? c : 7, m = 0, p = 0;
if (t.x < u || t.x > 49 - u || t.y < u || t.y > 49 - u) return {
fits: !1,
reason: "Anchor too close to room edge (needs ".concat(u, " tile margin)")
};
try {
for (var d = n(r.structures), f = d.next(); !f.done; f = d.next()) {
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
f && !f.done && (a = d.return) && a.call(d);
} finally {
if (o) throw o.error;
}
}
try {
for (var v = n(r.roads), R = v.next(); !R.done; R = v.next()) {
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

function Cl(e, t) {
var r, o, a, i, s, c = e.controller;
if (!c) return null;
var l = e.find(FIND_SOURCES), u = c.pos.x, m = c.pos.y;
try {
for (var p = n(l), d = p.next(); !d.done; d = p.next()) u += (k = d.value).pos.x, 
m += k.pos.y;
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
var S = new RoomPosition(T, C, e.name), w = Tl(e, S, t);
if (w.fits) {
var O = 1e3, b = S.getRangeTo(c);
b >= 4 && b <= 8 ? O += 100 : b < 4 ? O -= 50 : b > 12 && (O -= 30);
var _ = 0;
try {
for (var x = (a = void 0, n(l)), U = x.next(); !U.done; U = x.next()) {
var k = U.value;
_ += S.getRangeTo(k);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
U && !U.done && (i = x.return) && i.call(x);
} finally {
if (a) throw a.error;
}
}
var M = _ / l.length;
M >= 5 && M <= 10 ? O += 80 : M < 5 && (O -= 20);
var A = Math.abs(T - 25) + Math.abs(C - 25);
if (A < 10 ? O += 50 : A > 20 && (O -= 30), void 0 !== w.wallCount && void 0 !== w.totalTiles) {
var N = w.wallCount / w.totalTiles * 100;
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

function Sl(e, t) {
var r, o = fl(t), n = {}, s = e.structures.filter(function(e) {
var t, r, a = e.structureType, i = null !== (t = o[a]) && void 0 !== t ? t : 0, s = null !== (r = n[a]) && void 0 !== r ? r : 0;
return !(s >= i || (n[a] = s + 1, 0));
}), c = null !== (r = o[STRUCTURE_EXTENSION]) && void 0 !== r ? r : 0;
return c > 0 && (s = function(e, t) {
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
})), s = o.filter(function(e) {
return !n.has("".concat(e.x, ",").concat(e.y));
}).slice(0, r);
return i(i([], a(e), !1), a(s), !1);
}(s, c)), s;
}

function wl(e, t) {
if (t >= 8) {
var r = Cl(e, Rl);
if (r) return {
blueprint: Rl,
anchor: r
};
if (o = Cl(e, vl)) return {
blueprint: vl,
anchor: o
};
}
var o;
if (t >= 7 && (o = Cl(e, vl))) return {
blueprint: vl,
anchor: o
};
if (t >= 5) {
var a = Cl(e, hl);
if (a) return {
blueprint: hl,
anchor: a
};
}
if (t >= 3) {
var i = Cl(e, gl);
if (i) return {
blueprint: gl,
anchor: i
};
}
var s = Cl(e, yl);
if (s) return {
blueprint: yl,
anchor: s
};
var c = function(e) {
var t, r, o = e.controller;
if (!o) return null;
var a = e.find(FIND_SOURCES), i = e.getTerrain(), s = o.pos.x, c = o.pos.y;
try {
for (var l = n(a), u = l.next(); !u.done; u = l.next()) {
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
for (var p = Math.round(s / (a.length + 1)), d = Math.round(c / (a.length + 1)), f = 0; f < 15; f++) for (var y = -f; y <= f; y++) for (var g = -f; g <= f; g++) if (Math.abs(y) === f || Math.abs(g) === f) {
var h = p + y, v = d + g;
if (!(h < 3 || h > 46 || v < 3 || v > 46) && El(e, h, v)) {
if (Math.max(Math.abs(h - o.pos.x), Math.abs(v - o.pos.y)) > 20) continue;
if (i.get(h, v) === TERRAIN_MASK_WALL) continue;
return new RoomPosition(h, v, e.name);
}
}
return null;
}(e);
return c ? {
blueprint: yl,
anchor: c
} : null;
}

var Ol = [ STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_TOWER, STRUCTURE_LAB, STRUCTURE_LINK, STRUCTURE_FACTORY, STRUCTURE_OBSERVER, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN, STRUCTURE_EXTRACTOR ], bl = new Set(Ol);

function _l(e) {
return e >= 2 && e <= 3;
}

var xl = function() {
function e() {}
return e.prototype.getConstructionInterval = function(e) {
return _l(e) ? 5 : 10;
}, e.prototype.runConstruction = function(e, t, r, o) {
var s, c, l = r;
if (!(l.length >= 10)) {
var u = null !== (c = null === (s = e.controller) || void 0 === s ? void 0 : s.level) && void 0 !== c ? c : 1, m = o[0], p = null == m ? void 0 : m.pos;
if (m) {
var d, f = wl(e, u);
if (f) p = f.anchor, d = f.blueprint; else {
if (!(d = function(e) {
return function(e) {
return e >= 7 ? vl : e >= 5 ? hl : e >= 3 ? gl : yl;
}(e);
}(u))) return;
p = m.pos;
}
if (d && p) {
if (!ul.isCombatPosture(t.posture)) {
var y = function(e, t, r, o, a) {
var i, s;
void 0 === a && (a = []);
var c = function(e, t, r, o) {
var a, i, s, c, l, u, m;
void 0 === o && (o = []);
var p = null !== (u = null === (l = e.controller) || void 0 === l ? void 0 : l.level) && void 0 !== u ? u : 1, d = Sl(r, p), f = e.getTerrain(), y = [], g = new Map;
try {
for (var h = n(d), v = h.next(); !v.done; v = h.next()) {
var R = v.value, E = t.x + R.x, T = t.y + R.y;
if (!(E < 1 || E > 48 || T < 1 || T > 48) && f.get(E, T) !== TERRAIN_MASK_WALL) {
var C = "".concat(E, ",").concat(T);
g.has(R.structureType) || g.set(R.structureType, new Set), null === (m = g.get(R.structureType)) || void 0 === m || m.add(C);
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
v && !v.done && (i = h.return) && i.call(h);
} finally {
if (a) throw a.error;
}
}
var S = wi(e, t, r.roads, o);
if (g.set(STRUCTURE_ROAD, S), p >= 6) {
var w = e.find(FIND_MINERALS);
if (w.length > 0) {
var O = w[0], b = new Set;
b.add("".concat(O.pos.x, ",").concat(O.pos.y)), g.set(STRUCTURE_EXTRACTOR, b);
}
}
var _ = e.find(FIND_STRUCTURES, {
filter: function(e) {
return bl.has(e.structureType) && (!0 === e.my || e.structureType === STRUCTURE_ROAD);
}
});
try {
for (var x = n(_), U = x.next(); !U.done; U = x.next()) {
var k = U.value, M = (C = "".concat(k.pos.x, ",").concat(k.pos.y), k.structureType), A = g.get(M);
A && A.has(C) || y.push({
structure: k,
reason: "".concat(k.structureType, " at ").concat(C, " is not in blueprint")
});
}
} catch (e) {
s = {
error: e
};
} finally {
try {
U && !U.done && (c = x.return) && c.call(x);
} finally {
if (s) throw s.error;
}
}
return y;
}(e, t, r, a), l = 0;
try {
for (var u = n(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = p.structure, f = p.reason;
if (l >= 1) break;
d.destroy() === OK && (l++, ye.info("Destroyed misplaced structure: ".concat(f), {
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
}(e, p, d, 0, t.remoteAssignments);
if (y > 0) {
var g = 1 === y ? "structure" : "structures";
Yt.addRoomEvent(e.name, "structureDestroyed", "".concat(y, " misplaced ").concat(g, " destroyed for blueprint compliance"));
}
}
var h = {
sitesPlaced: 0,
wallsRemoved: 0
};
if (u >= 2 && l.length < 8) {
var v = _l(u) ? 5 : 3;
(h = function(e, t, r, o, s, c) {
var l, u, m, p, d, f;
if (void 0 === s && (s = 3), void 0 === c && (c = []), o < 2) return {
sitesPlaced: 0,
wallsRemoved: 0
};
var y = function(e, t, r, o) {
var s, c, l, u;
void 0 === o && (o = []);
var m = wi(e, t, r, o), p = function(e) {
var t, r, o, s, c, l, u, m = Game.map.getRoomTerrain(e), p = [], d = [], f = function(e) {
var t, r, o = [], a = Game.map.getRoomTerrain(e), i = Game.rooms[e], s = new Set;
if (i) {
var c = i.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART;
}
});
try {
for (var l = n(c), u = l.next(); !u.done; u = l.next()) {
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
for (var p = 0; p < 50; p++) a.get(p, 0) === TERRAIN_MASK_WALL || s.has("".concat(p, ",0")) || o.push({
x: p,
y: 0,
exitDirection: "top",
isChokePoint: !1
});
for (p = 0; p < 50; p++) a.get(p, 49) === TERRAIN_MASK_WALL || s.has("".concat(p, ",49")) || o.push({
x: p,
y: 49,
exitDirection: "bottom",
isChokePoint: !1
});
for (var d = 1; d < 49; d++) a.get(0, d) === TERRAIN_MASK_WALL || s.has("0,".concat(d)) || o.push({
x: 0,
y: d,
exitDirection: "left",
isChokePoint: !1
});
for (d = 1; d < 49; d++) a.get(49, d) === TERRAIN_MASK_WALL || s.has("49,".concat(d)) || o.push({
x: 49,
y: d,
exitDirection: "right",
isChokePoint: !1
});
return o;
}(e), y = new Map;
try {
for (var g = n(f), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
(k = null !== (u = y.get(v.exitDirection)) && void 0 !== u ? u : []).push(v), y.set(v.exitDirection, k);
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
for (var R = n(y), E = R.next(); !E.done; E = R.next()) {
for (var T = a(E.value, 2), C = T[0], S = i([], a(T[1]), !1).sort(function(e, t) {
return e.x === t.x ? e.y - t.y : e.x - t.x;
}), w = [], O = [], b = 0; b < S.length; b++) {
v = S[b];
var _ = S[b - 1];
!(_ && Math.abs(v.x - _.x) <= 1 && Math.abs(v.y - _.y) <= 1) && O.length > 0 && (w.push(O), 
O = []), O.push(v);
}
O.length > 0 && w.push(O);
try {
for (var x = (c = void 0, n(w)), U = x.next(); !U.done; U = x.next()) {
var k = U.value, M = Math.floor(k.length / 2);
for (b = 0; b < k.length; b++) {
var A = (v = k[b]).x, N = v.y;
switch (C) {
case "top":
N = 2;
break;

case "bottom":
N = 47;
break;

case "left":
A = 2;
break;

case "right":
A = 47;
}
m.get(A, N) !== TERRAIN_MASK_WALL && (k.length >= 4 && (b === M || b === M - 1) ? d.push({
x: A,
y: N,
exitDirection: C,
isChokePoint: !1
}) : p.push({
x: A,
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
U && !U.done && (l = x.return) && l.call(x);
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
E && !E.done && (s = R.return) && s.call(R);
} finally {
if (o) throw o.error;
}
}
return {
walls: p,
ramparts: d
};
}(e.name), d = [], f = [], y = i([], a(p.ramparts), !1);
try {
for (var g = n(p.walls), h = g.next(); !h.done; h = g.next()) {
var v = h.value, R = "".concat(v.x, ",").concat(v.y);
m.has(R) ? (d.push(v), y.push(v)) : f.push(v);
}
} catch (e) {
s = {
error: e
};
} finally {
try {
h && !h.done && (c = g.return) && c.call(g);
} finally {
if (s) throw s.error;
}
}
var E = [], T = e.find(FIND_STRUCTURES);
try {
for (var C = n(T), S = C.next(); !S.done; S = C.next()) {
var w = S.value;
w.structureType === STRUCTURE_WALL && (R = "".concat(w.pos.x, ",").concat(w.pos.y), 
m.has(R) && E.push({
x: w.pos.x,
y: w.pos.y
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
var v = 0, R = 0, E = Math.min(s, 10 - g.length), T = h.filter(function(e) {
return e.structureType === STRUCTURE_WALL;
}).length + g.filter(function(e) {
return e.structureType === STRUCTURE_WALL;
}).length, C = h.filter(function(e) {
return e.structureType === STRUCTURE_RAMPART;
}).length + g.filter(function(e) {
return e.structureType === STRUCTURE_RAMPART;
}).length, S = o >= 2 ? 2500 : 0, w = o >= 2 ? 2500 : 0;
if (o >= 3 && y.wallsToRemove.length > 0) {
var O = function(e) {
var t = h.find(function(t) {
return t.structureType === STRUCTURE_WALL && t.pos.x === e.x && t.pos.y === e.y;
});
if (t && !h.some(function(t) {
return t.structureType === STRUCTURE_RAMPART && t.pos.x === e.x && t.pos.y === e.y;
})) {
var r = t.destroy();
r === OK ? (R++, qe.info("Removed wall at (".concat(e.x, ",").concat(e.y, ") to allow road passage"), {
subsystem: "Defense"
})) : qe.warn("Failed to remove wall at (".concat(e.x, ",").concat(e.y, "): ").concat(r), {
subsystem: "Defense"
});
}
};
try {
for (var b = n(y.wallsToRemove), _ = b.next(); !_.done; _ = b.next()) O(_.value);
} catch (e) {
l = {
error: e
};
} finally {
try {
_ && !_.done && (u = b.return) && u.call(b);
} finally {
if (l) throw l.error;
}
}
}
if (o >= 2 && v < E && T < S) {
var x = function(t) {
if (v >= E) return "break";
if (T + v >= S) return "break";
var r = h.some(function(e) {
return e.pos.x === t.x && e.pos.y === t.y && (e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART);
}), o = g.some(function(e) {
return e.pos.x === t.x && e.pos.y === t.y && (e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART);
});
r || o || e.createConstructionSite(t.x, t.y, STRUCTURE_WALL) === OK && (v++, qe.debug("Placed perimeter wall at (".concat(t.x, ",").concat(t.y, ")"), {
subsystem: "Defense"
}));
};
try {
for (var U = n(y.walls), k = U.next(); !k.done && "break" !== x(k.value); k = U.next()) ;
} catch (e) {
m = {
error: e
};
} finally {
try {
k && !k.done && (p = U.return) && p.call(U);
} finally {
if (m) throw m.error;
}
}
}
if (o >= 3 && v < E && C < w) {
var M = function(t) {
if (v >= E) return "break";
if (C + v >= w) return "break";
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
}) ? qe.debug("Placed rampart at road crossing (".concat(t.x, ",").concat(t.y, ")"), {
subsystem: "Defense"
}) : qe.debug("Placed rampart gap at (".concat(t.x, ",").concat(t.y, ")"), {
subsystem: "Defense"
}));
};
try {
for (var A = n(y.ramparts), N = A.next(); !N.done && "break" !== M(N.value); N = A.next()) ;
} catch (e) {
d = {
error: e
};
} finally {
try {
N && !N.done && (f = A.return) && f.call(A);
} finally {
if (d) throw d.error;
}
}
}
return {
sitesPlaced: v,
wallsRemoved: R
};
}(e, p, d.roads, u, v, t.remoteAssignments)).wallsRemoved > 0 && Yt.addRoomEvent(e.name, "wallRemoved", "".concat(h.wallsRemoved, " wall(s) removed to allow road passage"));
}
var R = function(e, t, r) {
var o, s, c, l, u, m, p, d, f, y, g, h, v, R, E = null !== (y = null === (f = e.controller) || void 0 === f ? void 0 : f.level) && void 0 !== y ? y : 1, T = Sl(r, E), C = e.getTerrain(), S = [];
if (E >= 6) {
var w = e.find(FIND_MINERALS);
if (w.length > 0) {
var O = w[0];
S.push({
x: O.pos.x - t.x,
y: O.pos.y - t.y,
structureType: STRUCTURE_EXTRACTOR
});
}
}
var b = i(i([], a(T), !1), a(S), !1), _ = 0, x = e.find(FIND_MY_CONSTRUCTION_SITES), U = e.find(FIND_STRUCTURES);
if (x.length >= 10) return 0;
var k = {};
try {
for (var M = n(U), A = M.next(); !A.done; A = M.next()) {
var N = A.value.structureType;
k[N] = (null !== (g = k[N]) && void 0 !== g ? g : 0) + 1;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
A && !A.done && (s = M.return) && s.call(M);
} finally {
if (o) throw o.error;
}
}
try {
for (var I = n(x), P = I.next(); !P.done; P = I.next()) N = P.value.structureType, 
k[N] = (null !== (h = k[N]) && void 0 !== h ? h : 0) + 1;
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
var G = fl(E), L = function(r) {
var o = null !== (v = k[r.structureType]) && void 0 !== v ? v : 0;
if (o >= (null !== (R = G[r.structureType]) && void 0 !== R ? R : 0)) return "continue";
var n = t.x + r.x, a = t.y + r.y;
return n < 1 || n > 48 || a < 1 || a > 48 || C.get(n, a) === TERRAIN_MASK_WALL || U.some(function(e) {
return e.pos.x === n && e.pos.y === a && e.structureType === r.structureType;
}) || x.some(function(e) {
return e.pos.x === n && e.pos.y === a && e.structureType === r.structureType;
}) ? "continue" : e.createConstructionSite(n, a, r.structureType) === OK && (_++, 
k[r.structureType] = o + 1, _ >= 3 || x.length + _ >= 10) ? "break" : void 0;
};
try {
for (var D = n(b), F = D.next(); !F.done && "break" !== L(F.value); F = D.next()) ;
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
if (_ < 3 && x.length + _ < 10) {
var B = function(r) {
var o = t.x + r.x, n = t.y + r.y;
return o < 1 || o > 48 || n < 1 || n > 48 || C.get(o, n) === TERRAIN_MASK_WALL || U.some(function(e) {
return e.pos.x === o && e.pos.y === n && e.structureType === STRUCTURE_ROAD;
}) || x.some(function(e) {
return e.pos.x === o && e.pos.y === n && e.structureType === STRUCTURE_ROAD;
}) ? "continue" : e.createConstructionSite(o, n, STRUCTURE_ROAD) === OK && (++_ >= 3 || x.length + _ >= 10) ? "break" : void 0;
};
try {
for (var H = n(r.roads), W = H.next(); !W.done && "break" !== B(W.value); W = H.next()) ;
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
return _;
}(e, p, d), E = function(e, t) {
var r, o, i = e.find(FIND_MY_CONSTRUCTION_SITES);
if (i.length >= 10) return 0;
var s = gi(e, t), c = e.getTerrain(), l = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
}), u = new Set(l.map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), m = new Set(i.filter(function(e) {
return e.structureType === STRUCTURE_ROAD;
}).map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), p = 0;
try {
for (var d = n(s.positions), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
if (p >= 2) break;
if (i.length + p >= 10) break;
if (!u.has(y) && !m.has(y)) {
var g = a(y.split(","), 2), h = g[0], v = g[1], R = parseInt(h, 10), E = parseInt(v, 10);
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
}(e, p), T = {
placed: 0
};
if (u >= 2 && l.length < 9) {
var C = t.danger >= 2 ? 3 : 2;
(T = function(e, t, r, o) {
var a, i, s, c;
void 0 === o && (o = 5);
var l = {
placed: 0,
needsRepair: 0,
totalCritical: 0,
protected: 0
};
if (t < 2) return l;
var u = function(e, t) {
var r = e.find(FIND_MY_STRUCTURES), o = t < 4 ? di : pi;
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
}), f = mi(t, r), y = [], g = function(t) {
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
for (var h = n(u), v = h.next(); !v.done; v = h.next()) g(T = v.value);
} catch (e) {
a = {
error: e
};
} finally {
try {
v && !v.done && (i = h.return) && i.call(h);
} finally {
if (a) throw a.error;
}
}
y.sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var R = n(y), E = R.next(); !E.done; E = R.next()) {
var T = E.value.structure;
if (l.placed >= p) break;
var C = T.pos, S = C.x, w = C.y, O = e.createConstructionSite(S, w, STRUCTURE_RAMPART);
if (O === OK) l.placed++, qe.debug("Placed rampart on ".concat(T.structureType, " at (").concat(S, ",").concat(w, ")"), {
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
return (l.placed > 0 || y.length > 0) && qe.info("Rampart automation for ".concat(e.name, ": ") + "".concat(l.protected, "/").concat(l.totalCritical, " protected, ") + "".concat(l.placed, " placed, ") + "".concat(y.length - l.placed, " pending"), {
subsystem: "Defense"
}), l;
}(e, u, t.danger, C)).placed > 0 && Yt.addRoomEvent(e.name, "rampartPlaced", "".concat(T.placed, " rampart(s) placed on critical structures"));
}
t.metrics.constructionSites = l.length + R + E + h.sitesPlaced + T.placed;
}
} else if (1 === u && 0 === l.length) {
var S = wl(e, u);
S && e.createConstructionSite(S.anchor.x, S.anchor.y, STRUCTURE_SPAWN);
}
}
}, e;
}(), Ul = new xl;

function kl(e) {
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

var Ml = {
info: function(e, t) {
return ye.info(e, t);
},
warn: function(e, t) {
return ye.warn(e, t);
},
error: function(e, t) {
return ye.error(e, t);
},
debug: function(e, t) {
return ye.debug(e, t);
}
}, Al = new (function() {
function e() {
this.manager = new ct({
logger: Ml
});
}
return e.prototype.getReaction = function(e) {
return this.manager.getReaction(e);
}, e.prototype.calculateReactionChain = function(e, t) {
return this.manager.calculateReactionChain(e, t);
}, e.prototype.hasResourcesForReaction = function(e, t, r) {
return void 0 === r && (r = 100), this.manager.hasResourcesForReaction(e, t, r);
}, e.prototype.planReactions = function(e, t) {
var r = kl(t);
return this.manager.planReactions(e, r);
}, e.prototype.scheduleCompoundProduction = function(e, t) {
var r = kl(t);
return this.manager.scheduleCompoundProduction(e, r);
}, e.prototype.executeReaction = function(e, t) {
this.manager.executeReaction(e, t);
}, e;
}()), Nl = function() {
function e() {}
return e.prototype.runResourceProcessing = function(e, t, r) {
var o, n, a = null !== (n = null === (o = e.controller) || void 0 === o ? void 0 : o.level) && void 0 !== n ? n : 0;
a >= 6 && this.runLabs(e), a >= 7 && this.runFactory(e, r.factory), a >= 8 && this.runPowerSpawn(e, r.powerSpawn), 
this.runLinks(e, r.links, r.sources);
}, e.prototype.runLabs = function(e) {
var t = Yt.getSwarmState(e.name);
if (t) {
ht.initialize(e.name), Rt.prepareLabs(e, t);
var r = Al.planReactions(e, t);
if (r) {
var o = {
product: r.product,
input1: r.input1,
input2: r.input2,
amountNeeded: 1e3,
priority: r.priority
};
if (ht.areLabsReady(e.name, o)) {
var n = yt.getConfig(e.name), a = null == n ? void 0 : n.activeReaction;
a && a.input1 === r.input1 && a.input2 === r.input2 && a.output === r.product || ht.setActiveReaction(e.name, r.input1, r.input2, r.product), 
Al.executeReaction(e, r);
} else qe.debug("Labs not ready for reaction: ".concat(r.input1, " + ").concat(r.input2, " -> ").concat(r.product), {
subsystem: "Labs",
room: e.name
});
}
ht.save(e.name);
}
}, e.prototype.runFactory = function(e, t) {
var r, o;
if (t && !(t.cooldown > 0)) {
var a = [ RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_HYDROGEN, RESOURCE_OXYGEN ];
try {
for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
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
}, e.prototype.runPowerSpawn = function(e, t) {
t && t.store.getUsedCapacity(RESOURCE_POWER) >= 1 && t.store.getUsedCapacity(RESOURCE_ENERGY) >= 50 && t.processPower();
}, e.prototype.runLinks = function(e, t, r) {
var o, a;
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
for (var m = n(c), p = m.next(); !p.done; p = m.next()) {
var d = p.value;
if (d.store.getUsedCapacity(RESOURCE_ENERGY) >= 400 && 0 === d.cooldown && s.store.getFreeCapacity(RESOURCE_ENERGY) >= 400) return void d.transferEnergy(s);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
p && !p.done && (a = m.return) && a.call(m);
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
}, e;
}(), Il = new Nl, Pl = {
enablePheromones: !0,
enableEvolution: !0,
enableSpawning: !0,
enableConstruction: !0,
enableTowers: !0,
enableProcessing: !0
}, Gl = function() {
function e(e, t) {
void 0 === t && (t = {}), this.roomName = e, this.config = r(r({}, Pl), t);
}
return e.prototype.run = function(e) {
var t, r, o, a = jn.startRoom(this.roomName), i = Game.rooms[this.roomName];
if (i && (null === (t = i.controller) || void 0 === t ? void 0 : t.my)) {
!function(e) {
var t, r, o;
if (null === (o = e.controller) || void 0 === o ? void 0 : o.my) {
e.storage && fn.set(e.storage.id, e.storage, {
namespace: gn,
ttl: 10
}), e.terminal && fn.set(e.terminal.id, e.terminal, {
namespace: gn,
ttl: 10
}), e.controller && fn.set(e.controller.id, e.controller, {
namespace: gn,
ttl: 10
});
var a = e.find(FIND_SOURCES);
try {
for (var i = n(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
fn.set(c.id, c, {
namespace: gn,
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
}(i);
var s = Yt.getOrInitSwarmState(this.roomName);
if (this.config.enablePheromones && Game.time % 5 == 0 && zc.updateMetrics(i, s), 
dl.updateThreatAssessment(i, s, {
spawns: cache.spawns,
towers: cache.towers
}), Ni.assess(i, s), Pi.checkSafeMode(i, s), this.config.enableEvolution && (ll.updateEvolutionStage(s, i, e), 
ll.updateMissingStructures(s, i)), ul.updatePosture(s), this.config.enablePheromones && zc.updatePheromones(s, i), 
this.config.enableTowers && dl.runTowerControl(i, s, cache.towers), this.config.enableConstruction && ul.allowsBuilding(s.posture)) {
var c = null !== (o = null === (r = i.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 1, l = Ul.getConstructionInterval(c);
Game.time % l === 0 && Ul.runConstruction(i, s, cache.constructionSites, cache.spawns);
}
this.config.enableProcessing && Game.time % 5 == 0 && Il.runResourceProcessing(i, s, {
factory: cache.factory,
powerSpawn: cache.powerSpawn,
links: cache.links,
sources: cache.sources
});
var u = Game.cpu.getUsed() - a;
jn.recordRoom(i, u), jn.endRoom(this.roomName, a);
} else jn.endRoom(this.roomName, a);
}, e;
}(), Ll = function() {
function e() {
this.nodes = new Map;
}
return e.prototype.run = function() {
var e, t, r, o, i, s, c, l, u = global, m = u._ownedRooms, p = u._ownedRoomsTick;
l = m && p === Game.time ? m : Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
var d = l.length;
try {
for (var f = n(l), y = f.next(); !y.done; y = f.next()) {
var g = y.value;
this.nodes.has(g.name) || this.nodes.set(g.name, new Gl(g.name));
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
for (var h = n(this.nodes), v = h.next(); !v.done; v = h.next()) {
var R = a(v.value, 1)[0];
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
for (var E = n(this.nodes.values()), T = E.next(); !T.done; T = E.next()) {
var C = T.value;
try {
C.run(d);
} catch (e) {
var S = e instanceof Error ? e.message : String(e), w = e instanceof Error && e.stack ? e.stack : void 0;
qe.error("Error in room ".concat(C.roomName, ": ").concat(S), {
subsystem: "RoomManager",
room: C.roomName,
meta: {
stack: w
}
});
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
}, e.prototype.getNode = function(e) {
return this.nodes.get(e);
}, e.prototype.getAllNodes = function() {
return Array.from(this.nodes.values());
}, e.prototype.runRoom = function(e) {
var t;
if (null === (t = e.controller) || void 0 === t ? void 0 : t.my) {
this.nodes.has(e.name) || this.nodes.set(e.name, new Gl(e.name));
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
qe.error("Error in room ".concat(e.name, ": ").concat(s), {
subsystem: "RoomManager",
room: e.name,
meta: {
stack: c
}
});
}
}
}, e;
}(), Dl = new Ll;

function Fl(e) {
var t, r, o;
return e.find(FIND_HOSTILE_CREEPS).length > 0 ? jt.CRITICAL : (null === (t = e.controller) || void 0 === t ? void 0 : t.my) ? jt.HIGH : "ralphschuler" === (null === (o = null === (r = e.controller) || void 0 === r ? void 0 : r.reservation) || void 0 === o ? void 0 : o.username) ? jt.MEDIUM : jt.LOW;
}

function Bl(e) {
var t;
if (!(null === (t = e.controller) || void 0 === t ? void 0 : t.my)) return .02;
var r = e.controller.level;
return e.find(FIND_HOSTILE_CREEPS).length > 0 ? .12 : r <= 3 ? .04 : r <= 6 ? .06 : .08;
}

function Hl(e, t, r) {
var o;
return t === jt.CRITICAL ? {
tickModulo: void 0,
tickOffset: void 0
} : t === jt.HIGH && (null === (o = e.controller) || void 0 === o ? void 0 : o.my) ? {
tickModulo: 5,
tickOffset: r % 5
} : t === jt.MEDIUM ? {
tickModulo: 10,
tickOffset: r % 10
} : t === jt.LOW ? {
tickModulo: 20,
tickOffset: r % 20
} : {
tickModulo: void 0,
tickOffset: void 0
};
}

var Wl, Yl = function() {
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
var a = Game.rooms[o];
r.add(o);
var i = "room:".concat(o), s = mr.getProcess(i), c = Fl(a), l = Bl(a);
this.registeredRooms.has(o) ? s && (s.priority !== c || Math.abs(s.cpuBudget - l) > 1e-4) && this.updateRoomProcess(a, c, l) : this.registerRoomProcess(a);
}
try {
for (var u = n(this.registeredRooms), m = u.next(); !m.done; m = u.next()) o = m.value, 
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
var t, r = Fl(e), o = Bl(e), n = "room:".concat(e.name), a = this.getRoomIndex(e.name), i = Hl(e, r, a);
mr.registerProcess({
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
t && Dl.runRoom(t);
}
}), this.registeredRooms.add(e.name);
var s = i.tickModulo ? "(mod=".concat(i.tickModulo, ", offset=").concat(i.tickOffset, ")") : "(every tick)";
qe.debug("Registered room process: ".concat(e.name, " with priority ").concat(r, " ").concat(s), {
subsystem: "RoomProcessManager"
});
}, e.prototype.updateRoomProcess = function(e, t, r) {
var o, n = "room:".concat(e.name), a = this.getRoomIndex(e.name), i = Hl(e, t, a);
mr.unregisterProcess(n), mr.registerProcess({
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
t && Dl.runRoom(t);
}
});
var s = i.tickModulo ? "mod=".concat(i.tickModulo, ", offset=").concat(i.tickOffset) : "every tick";
qe.debug("Updated room process: ".concat(e.name, " priority=").concat(t, " budget=").concat(r, " (").concat(s, ")"), {
subsystem: "RoomProcessManager"
});
}, e.prototype.unregisterRoomProcess = function(e) {
var t = "room:".concat(e);
mr.unregisterProcess(t), this.registeredRooms.delete(e), this.roomIndices.delete(e), 
qe.debug("Unregistered room process: ".concat(e), {
subsystem: "RoomProcessManager"
});
}, e.prototype.getMinBucketForPriority = function(e) {
return 0;
}, e.prototype.getStats = function() {
var e, t, r, o, a, i = {}, s = 0;
try {
for (var c = n(this.registeredRooms), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = Game.rooms[u];
if (m) {
var p = Fl(m), d = null !== (r = jt[p]) && void 0 !== r ? r : "UNKNOWN";
i[d] = (null !== (o = i[d]) && void 0 !== o ? o : 0) + 1, (null === (a = m.controller) || void 0 === a ? void 0 : a.my) && s++;
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
}(), Kl = new Yl, Vl = function() {
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

function jl(e) {
var t, r, o = new Set;
try {
for (var a = n(Object.values(Game.creeps)), i = a.next(); !i.done; i = a.next()) {
var s = i.value.memory;
"remoteHarvester" !== s.role && "remoteHauler" !== s.role || s.homeRoom !== e.name || !s.targetRoom || s.targetRoom === e.name || o.add(s.targetRoom);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
return Array.from(o);
}

function zl(e, t) {
var r, o, a, i, s = Game.rooms[e];
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
for (var p = n(m), d = p.next(); !d.done; d = p.next()) {
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
for (var g = n(y), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
u.set(v.pos.x, v.pos.y, 255);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
h && !h.done && (i = g.return) && i.call(g);
} finally {
if (a) throw a.error;
}
}
return u;
}

!function(e) {
e[e.CRITICAL = 0] = "CRITICAL", e[e.HIGH = 1] = "HIGH", e[e.MEDIUM = 2] = "MEDIUM", 
e[e.LOW = 3] = "LOW";
}(Wl || (Wl = {}));

var ql, Xl = function() {
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
var r, o, a, i, s, c, l = this, u = e.storage, m = e.find(FIND_MY_SPAWNS);
if (u || 0 !== m.length) {
var p = 0;
try {
for (var d = n(t), f = d.next(); !f.done; f = d.next()) {
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
for (var E = (a = void 0, n(h)), T = E.next(); !T.done; T = E.next()) {
var C = T.value, S = PathFinder.search(R.pos, {
pos: C.pos,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxRooms: 16,
roomCallback: function(e) {
return zl(e, l.logger);
}
});
if (!S.incomplete && S.path.length > 0) {
var w = this.pathCache.convertRoomPositionsToPathSteps(S.path);
this.cacheRemoteMiningPath(R.pos, C.pos, w, "harvester"), p++;
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
T && !T.done && (i = E.return) && i.call(E);
} finally {
if (a) throw a.error;
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
for (var _ = (s = void 0, n(b)), x = _.next(); !x.done; x = _.next()) {
var U = x.value, k = PathFinder.search(U, {
pos: u.pos,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxRooms: 16,
roomCallback: function(e) {
return zl(e, l.logger);
}
});
!k.incomplete && k.path.length > 0 && (w = this.pathCache.convertRoomPositionsToPathSteps(k.path), 
this.cacheRemoteMiningPath(U, u.pos, w, "hauler"), p++);
}
} catch (e) {
s = {
error: e
};
} finally {
try {
x && !x.done && (c = _.return) && c.call(_);
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
return zl(e, o.logger);
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
}(), Ql = function() {
function e(e, t, r) {
this.logger = e, this.scheduler = t, this.pathCache = r;
}
return e.prototype.precacheAllRemoteRoutes = function() {
var e, t, r, o = 0;
try {
for (var a = n(Object.values(Game.rooms)), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
if ((null === (r = s.controller) || void 0 === r ? void 0 : r.my) && (s.storage || 0 !== s.find(FIND_MY_SPAWNS).length)) {
var c = jl(s);
0 !== c.length && (this.pathCache.precacheRemoteRoutes(s, c), o += c.length);
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
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
}(), Zl = {
debug: function(e, t) {
return de("RemoteMining").debug(e, t);
},
info: function(e, t) {
return de("RemoteMining").info(e, t);
},
warn: function(e, t) {
return de("RemoteMining").warn(e, t);
},
error: function(e, t) {
return de("RemoteMining").error(e, t);
}
}, Jl = {
scheduleTask: function(e, t, r, o, n) {
!function(e, t, r, o, n) {
void 0 === o && (o = Po.MEDIUM), zo.register({
id: e,
interval: t,
execute: r,
priority: o,
maxCpu: n,
skippable: o !== Po.CRITICAL
});
}(e, t, r, o, n);
}
}, $l = new Xl({
getCachedPath: function(e, t) {
var r = vn(e, t), o = fn.get(r, {
namespace: hn
});
if (!o) return null;
try {
return Room.deserializePath(o);
} catch (e) {
return fn.invalidate(r, hn), null;
}
},
cachePath: Rn,
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
}, Zl), eu = new Ql(Zl, Jl, $l), tu = function() {
function e() {
this.logger = de("Pathfinding");
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
}(), ru = function() {
function e() {}
return e.prototype.on = function(e, t) {
Re.on(e, t);
}, e;
}(), ou = function() {
function e() {}
return e.prototype.invalidateRoom = function(e) {
!function(e) {
var t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), r = new RegExp("^".concat(t, ":|:").concat(t, ":|:").concat(t, "$"));
fn.invalidatePattern(r, hn);
}(e);
}, e.prototype.cacheCommonRoutes = function(e) {
!function(e) {
var t, r, o;
if (null === (o = e.controller) || void 0 === o ? void 0 : o.my) {
var a = e.storage;
if (a) {
var i = e.find(FIND_SOURCES);
try {
for (var s = n(i), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = e.findPath(a.pos, l.pos, {
ignoreCreeps: !0,
serialize: !1
});
u.length > 0 && (Rn(a.pos, l.pos, u), Rn(l.pos, a.pos, u));
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
var m = e.findPath(a.pos, e.controller.pos, {
ignoreCreeps: !0,
range: 3,
serialize: !1
});
m.length > 0 && Rn(a.pos, e.controller.pos, m);
}
}
}
}(e);
}, e;
}(), nu = function() {
function e() {}
return e.prototype.getRemoteRoomsForRoom = function(e) {
return function(e) {
return jl(e);
}(e);
}, e.prototype.precacheRemoteRoutes = function(e, t) {
!function(e, t) {
$l.precacheRemoteRoutes(e, t);
}(e, t);
}, e;
}(), au = new Vl(new tu, new ru, new ou, new nu), iu = de("SS2TerminalComms"), su = function() {
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
for (var o = n(Game.market.incomingTransactions), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
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
iu.warn("Missing packet in multi-packet message", {
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
}), this.messageBuffers.delete(c), this.saveStateToMemory(), iu.info("Received complete multi-packet message from ".concat(i.sender.username), {
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
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
return r.length > 0 && iu.debug("Processed ".concat(Game.market.incomingTransactions.length, " terminal transactions, completed ").concat(r.length, " messages")), 
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
return i ? (this.queuePackets(e.id, t, r, o, a, i), iu.info("Queued ".concat(a.length, " packets for multi-packet message"), {
meta: {
terminalId: e.id,
messageId: i,
packets: a.length,
targetRoom: t
}
}), OK) : (iu.error("Failed to extract message ID from first packet"), ERR_INVALID_ARGS);
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
var i = 0, s = [], c = Game.cpu.getUsed();
try {
for (var l = n(Object.entries(Memory.ss2PacketQueue)), u = l.next(); !u.done; u = l.next()) {
var m = a(u.value, 2), p = m[0], d = m[1];
if (Game.cpu.getUsed() - c > 5) {
iu.debug("Queue processing stopped due to CPU budget limit (".concat(5, " CPU)"));
break;
}
var f = Game.getObjectById(d.terminalId);
if (f) {
if (!(f.cooldown > 0)) {
var y = d.packets[d.nextPacketIndex];
if (y) {
var g = f.send(d.resourceType, d.amount, d.targetRoom, y);
if (g === OK) {
if (Memory.ss2PacketQueue[p].nextPacketIndex = d.nextPacketIndex + 1, i++, Memory.ss2PacketQueue[p].nextPacketIndex >= d.packets.length) {
var h = this.extractMessageId(y);
iu.info("Completed sending multi-packet message", {
meta: {
messageId: h,
packets: d.packets.length,
targetRoom: d.targetRoom
}
}), s.push(p);
}
} else g === ERR_NOT_ENOUGH_RESOURCES ? iu.warn("Not enough resources to send packet, will retry next tick", {
meta: {
queueKey: p,
resource: d.resourceType,
amount: d.amount
}
}) : (iu.error("Failed to send packet: ".concat(g, ", removing queue item"), {
meta: {
queueKey: p,
result: g
}
}), s.push(p));
} else iu.warn("No packet at index ".concat(d.nextPacketIndex, ", removing queue item"), {
meta: {
queueKey: p
}
}), s.push(p);
}
} else iu.warn("Terminal not found for queue item, removing from queue", {
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
for (var v = n(s), R = v.next(); !R.done; R = v.next()) {
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
return i > 0 && iu.debug("Sent ".concat(i, " queued packets this tick")), i;
}, e.cleanupExpiredQueue = function() {
var e, t, r, o;
if (Memory.ss2PacketQueue) {
var i = Game.time, s = [];
try {
for (var c = n(Object.entries(Memory.ss2PacketQueue)), l = c.next(); !l.done; l = c.next()) {
var u = a(l.value, 2), m = u[0], p = u[1];
if (i - p.queuedAt > this.QUEUE_TIMEOUT) {
var d = this.extractMessageId(p.packets[0]);
iu.warn("Queue item timed out after ".concat(i - p.queuedAt, " ticks"), {
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
for (var f = n(s), y = f.next(); !y.done; y = f.next()) {
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
for (var o = n(this.messageBuffers.entries()), i = o.next(); !i.done; i = o.next()) {
var s = a(i.value, 2), c = s[0], l = s[1];
r - l.receivedAt > this.MESSAGE_TIMEOUT && (iu.warn("Message timed out", {
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
i && !i.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}, e.parseJSON = function(e) {
try {
return e.startsWith("{") || e.startsWith("[") ? JSON.parse(e) : null;
} catch (e) {
return iu.error("Error parsing JSON", {
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
}(), cu = {
lowBucketThreshold: 2e3,
highBucketThreshold: 9e3,
targetCpuUsage: .8,
highFrequencyInterval: 1,
mediumFrequencyInterval: 5,
lowFrequencyInterval: 20
}, lu = function() {
function e(e) {
void 0 === e && (e = {}), this.tasks = new Map, this.currentMode = "normal", this.tickCpuUsed = 0, 
this.config = r(r({}, cu), e);
}
return e.prototype.registerTask = function(e) {
this.tasks.set(e.name, r(r({}, e), {
lastRun: 0
}));
}, e.prototype.unregisterTask = function(e) {
this.tasks.delete(e);
}, e.prototype.getBucketMode = function() {
var e = mr.getBucketMode();
return "critical" === e || "low" === e ? "low" : "high" === e ? "high" : "normal";
}, e.prototype.updateBucketMode = function() {
var e = this.getBucketMode();
e !== this.currentMode && (qe.info("Bucket mode changed: ".concat(this.currentMode, " -> ").concat(e), {
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
for (var o = n(r), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
if (this.shouldRunTask(i)) {
var s = Game.cpu.getUsed();
if (!(s + this.getCpuLimit() * i.cpuBudget > this.getCpuLimit() && "high" !== i.frequency)) {
try {
i.execute(), i.lastRun = Game.time;
} catch (e) {
var c = e instanceof Error ? e.message : String(e);
qe.error("Task ".concat(i.name, " failed: ").concat(c), {
subsystem: "Scheduler"
});
}
var l = Game.cpu.getUsed() - s;
if (this.tickCpuUsed += l, !this.hasCpuBudget()) {
qe.warn("CPU budget exhausted, skipping remaining tasks", {
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
a && !a.done && (t = o.return) && t.call(o);
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

new lu, (ql = {})[FIND_STRUCTURES] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, ql[FIND_MY_STRUCTURES] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, ql[FIND_HOSTILE_STRUCTURES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, ql[FIND_SOURCES_ACTIVE] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, ql[FIND_SOURCES] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, ql[FIND_MINERALS] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, ql[FIND_DEPOSITS] = {
lowBucket: 200,
normal: 100,
highBucket: 50
}, ql[FIND_MY_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, ql[FIND_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, ql[FIND_CREEPS] = {
lowBucket: 10,
normal: 5,
highBucket: 3
}, ql[FIND_MY_CREEPS] = {
lowBucket: 10,
normal: 5,
highBucket: 3
}, ql[FIND_HOSTILE_CREEPS] = {
lowBucket: 10,
normal: 3,
highBucket: 1
}, ql[FIND_DROPPED_RESOURCES] = {
lowBucket: 20,
normal: 5,
highBucket: 3
}, ql[FIND_TOMBSTONES] = {
lowBucket: 30,
normal: 10,
highBucket: 5
}, ql[FIND_RUINS] = {
lowBucket: 30,
normal: 10,
highBucket: 5
}, ql[FIND_FLAGS] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, ql[FIND_MY_SPAWNS] = {
lowBucket: 200,
normal: 100,
highBucket: 50
}, ql[FIND_HOSTILE_SPAWNS] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, ql[FIND_HOSTILE_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, ql[FIND_NUKES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, ql[FIND_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, ql[FIND_MY_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, ql[FIND_HOSTILE_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, ql[FIND_EXIT_TOP] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, ql[FIND_EXIT_RIGHT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, ql[FIND_EXIT_BOTTOM] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, ql[FIND_EXIT_LEFT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, ql[FIND_EXIT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
};

var uu = new sa({}, Yt), mu = new ma({}, Yt), pu = !1, du = !1;

function fu() {
var e, t;
du && Game.time % 10 != 0 || qe.info("SwarmBot loop executing at tick ".concat(Game.time), {
subsystem: "SwarmBot",
meta: {
systemsInitialized: du
}
}), du || (Ie({
level: (t = sr()).debug ? Ue.DEBUG : Ue.INFO,
cpuLogging: t.profiling,
enableBatching: !0,
maxBatchSize: 50
}), qe.info("Bot initialized", {
subsystem: "SwarmBot",
meta: {
debug: t.debug,
profiling: t.profiling
}
}), jn.initialize(), t.profiling && (function() {
if (PathFinder.search && !PathFinder.search.__nativeCallsTrackerWrapped) {
var e = Object.getOwnPropertyDescriptor(PathFinder, "search");
if (e && !1 === e.configurable) Qc.warn("Cannot wrap PathFinder.search - property is not configurable"); else {
var t = PathFinder.search;
try {
var r = function() {
for (var e = [], r = 0; r < arguments.length; r++) e[r] = arguments[r];
return jn.recordNativeCall("pathfinderSearch"), t.apply(PathFinder, e);
};
r.__nativeCallsTrackerWrapped = !0, Object.defineProperty(PathFinder, "search", {
value: r,
writable: !0,
enumerable: !0,
configurable: !0
});
} catch (e) {
Qc.warn("Failed to wrap PathFinder.search", {
meta: {
error: String(e)
}
});
}
}
}
}(), Zc(e = Creep.prototype, "moveTo", "moveTo"), Zc(e, "move", "move"), Zc(e, "harvest", "harvest"), 
Zc(e, "transfer", "transfer"), Zc(e, "withdraw", "withdraw"), Zc(e, "build", "build"), 
Zc(e, "repair", "repair"), Zc(e, "upgradeController", "upgradeController"), Zc(e, "attack", "attack"), 
Zc(e, "rangedAttack", "rangedAttack"), Zc(e, "heal", "heal"), Zc(e, "dismantle", "dismantle"), 
Zc(e, "say", "say")), mr.on("structure.destroyed", function(e) {
var t = Yt.getSwarmState(e.roomName);
t && (zc.onStructureDestroyed(t, e.structureType), ye.debug("Pheromone update: structure destroyed in ".concat(e.roomName), {
subsystem: "Pheromone",
room: e.roomName
}));
}), mr.on("remote.lost", function(e) {
var t = Yt.getSwarmState(e.homeRoom);
t && (zc.onRemoteSourceLost(t), ye.info("Pheromone update: remote source lost for ".concat(e.homeRoom), {
subsystem: "Pheromone",
room: e.homeRoom
}));
}), ye.info("Pheromone event handlers initialized", {
subsystem: "Pheromone"
}), au.initializePathCacheEvents(), eu.initialize(Po.MEDIUM), be.initialize(), qr.initialize(), 
du = !0), mr.updateFromCpuConfig(sr().cpu), pu || (qe.info("Registering all processes with kernel...", {
subsystem: "ProcessRegistry"
}), function() {
for (var e, t, r = [], o = 0; o < arguments.length; o++) r[o] = arguments[o];
try {
for (var a = n(r), i = a.next(); !i.done; i = a.next()) Er(i.value);
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
qe.info("Registered decorated processes from ".concat(r.length, " instance(s)"), {
subsystem: "ProcessDecorators"
});
}(Xc, Ys, qs, Ps, xc, yo, Bc, Ds, Ac, Ic, kc, xr, Or, qr, Yc, Lo, Di, _i), qe.info("Registered ".concat(mr.getProcesses().length, " processes with kernel"), {
subsystem: "ProcessRegistry"
}), mr.initialize(), pu = !0), jn.startTick(), "critical" === mr.getBucketMode() && Game.time % 10 == 0 && qe.warn("CRITICAL: CPU bucket at ".concat(Game.cpu.bucket, ", continuing normal processing"), {
subsystem: "SwarmBot"
}), Oc.clear(), Ca.clear(), Qt.startTick();
var r, o = "_ownedRooms", a = "_ownedRoomsTick", i = global, s = i[o], c = i[a];
s && c === Game.time ? r = s : (r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), i[o] = r, i[a] = Game.time), Ua.preTick(), Yt.initialize(), jn.measureSubsystem("processSync", function() {
ol.syncCreepProcesses(), Kl.syncRoomProcesses();
}), jn.measureSubsystem("kernel", function() {
mr.run();
}), jn.measureSubsystem("eventQueue", function() {
Qt.processQueue();
}), jn.measureSubsystem("spawns", function() {
!function() {
var e, t, r;
try {
for (var o = n(Object.values(Game.rooms)), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
(null === (r = i.controller) || void 0 === r ? void 0 : r.my) && wc(i, Yt.getOrInitSwarmState(i.name));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}();
}), jn.measureSubsystem("ss2PacketQueue", function() {
su.processQueue();
}), mr.hasCpuBudget() && jn.measureSubsystem("powerCreeps", function() {
!function() {
var e, t;
try {
for (var r = n(Object.values(Game.powerCreeps)), o = r.next(); !o.done; o = r.next()) {
var a = o.value;
void 0 !== a.ticksToLive && ms(a);
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
}), mr.hasCpuBudget() && jn.measureSubsystem("visualizations", function() {
!function() {
var e, t;
if (sr().visualizations) {
var r = function() {
var e;
return null !== (e = fn.get("ownedRooms", {
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
for (var o = n(r), a = o.next(); !a.done; a = o.next()) {
var i = a.value;
try {
uu.draw(i);
} catch (e) {
var s = e instanceof Error ? e.message : String(e);
qe.error("Visualization error in ".concat(i.name, ": ").concat(s), {
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
a && !a.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
try {
mu.draw();
} catch (e) {
s = e instanceof Error ? e.message : String(e), qe.error("Map visualization error: ".concat(s), {
subsystem: "visualizations"
});
}
}
}();
}), Ua.reconcileTraffic(), mr.hasCpuBudget() && jn.measureSubsystem("scheduledTasks", function() {
var e;
e = Math.max(0, Game.cpu.limit - Game.cpu.getUsed()), zo.run(e);
}), Yt.persistHeapCache(), jn.collectProcessStats(mr.getProcesses().reduce(function(e, t) {
return e.set(t.id, t), e;
}, new Map)), jn.collectKernelBudgetStats(mr), jn.setSkippedProcesses(mr.getSkippedProcessesThisTick()), 
jn.finalizeTick(), qe.flush();
}

var yu = function() {
function e() {}
return e.prototype.toggleVisualizations = function() {
var e = !sr().visualizations;
return cr({
visualizations: e
}), "Visualizations: ".concat(e ? "ENABLED" : "DISABLED");
}, e.prototype.toggleVisualization = function(e) {
var t = uu.getConfig(), r = Object.keys(t).filter(function(e) {
return e.startsWith("show") && "boolean" == typeof t[e];
});
if (!r.includes(e)) return "Invalid key: ".concat(e, ". Valid keys: ").concat(r.join(", "));
var o = e;
uu.toggle(o);
var n = uu.getConfig()[o];
return "Room visualization '".concat(e, "': ").concat(n ? "ENABLED" : "DISABLED");
}, e.prototype.toggleMapVisualization = function(e) {
var t = mu.getConfig(), r = Object.keys(t).filter(function(e) {
return e.startsWith("show") && "boolean" == typeof t[e];
});
if (!r.includes(e)) return "Invalid key: ".concat(e, ". Valid keys: ").concat(r.join(", "));
var o = e;
mu.toggle(o);
var n = mu.getConfig()[o];
return "Map visualization '".concat(e, "': ").concat(n ? "ENABLED" : "DISABLED");
}, e.prototype.showMapConfig = function() {
var e = mu.getConfig();
return Object.entries(e).map(function(e) {
var t = a(e, 2), r = t[0], o = t[1];
return "".concat(r, ": ").concat(String(o));
}).join("\n");
}, e.prototype.setVisMode = function(e) {
var t = [ "debug", "presentation", "minimal", "performance" ];
return t.includes(e) ? (na.setMode(e), "Visualization mode set to: ".concat(e)) : "Invalid mode: ".concat(e, ". Valid modes: ").concat(t.join(", "));
}, e.prototype.toggleVisLayer = function(e) {
var t = {
pheromones: mt.Pheromones,
paths: mt.Paths,
traffic: mt.Traffic,
defense: mt.Defense,
economy: mt.Economy,
construction: mt.Construction,
performance: mt.Performance
}, r = t[e.toLowerCase()];
if (!r) return "Unknown layer: ".concat(e, ". Valid layers: ").concat(Object.keys(t).join(", "));
na.toggleLayer(r);
var o = na.isLayerEnabled(r);
return "Layer ".concat(e, ": ").concat(o ? "enabled" : "disabled");
}, e.prototype.showVisPerf = function() {
var e, t, r = na.getPerformanceMetrics(), o = "=== Visualization Performance ===\n";
o += "Total CPU: ".concat(r.totalCost.toFixed(3), "\n"), o += "% of Budget: ".concat(r.percentOfBudget.toFixed(2), "%\n"), 
o += "\nPer-Layer Costs:\n";
try {
for (var i = n(Object.entries(r.layerCosts)), s = i.next(); !s.done; s = i.next()) {
var c = a(s.value, 2), l = c[0], u = c[1];
u > 0 && (o += "  ".concat(l, ": ").concat(u.toFixed(3), " CPU\n"));
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
return o;
}, e.prototype.showVisConfig = function() {
var e, t, r, o = na.getConfig(), i = "=== Visualization Configuration ===\n";
i += "Mode: ".concat(o.mode, "\n"), i += "\nEnabled Layers:\n";
var s = ((e = {})[mt.Pheromones] = "Pheromones", e[mt.Paths] = "Paths", e[mt.Traffic] = "Traffic", 
e[mt.Defense] = "Defense", e[mt.Economy] = "Economy", e[mt.Construction] = "Construction", 
e[mt.Performance] = "Performance", e);
try {
for (var c = n(Object.entries(s)), l = c.next(); !l.done; l = c.next()) {
var u = a(l.value, 2), m = u[0], p = u[1], d = parseInt(m, 10), f = 0 !== (o.enabledLayers & d);
i += "  ".concat(p, ": ").concat(f ? "✓" : "✗", "\n");
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
return i;
}, e.prototype.clearVisCache = function(e) {
return na.clearCache(e), e ? "Visualization cache cleared for room: ".concat(e) : "All visualization caches cleared";
}, o([ Je({
name: "toggleVisualizations",
description: "Toggle all visualizations on/off",
usage: "toggleVisualizations()",
examples: [ "toggleVisualizations()" ],
category: "Visualization"
}) ], e.prototype, "toggleVisualizations", null), o([ Je({
name: "toggleVisualization",
description: "Toggle a specific room visualization feature",
usage: "toggleVisualization(key)",
examples: [ "toggleVisualization('showPheromones')", "toggleVisualization('showPaths')", "toggleVisualization('showCombat')" ],
category: "Visualization"
}) ], e.prototype, "toggleVisualization", null), o([ Je({
name: "toggleMapVisualization",
description: "Toggle a specific map visualization feature",
usage: "toggleMapVisualization(key)",
examples: [ "toggleMapVisualization('showRoomStatus')", "toggleMapVisualization('showConnections')", "toggleMapVisualization('showThreats')", "toggleMapVisualization('showExpansion')" ],
category: "Visualization"
}) ], e.prototype, "toggleMapVisualization", null), o([ Je({
name: "showMapConfig",
description: "Show current map visualization configuration",
usage: "showMapConfig()",
examples: [ "showMapConfig()" ],
category: "Visualization"
}) ], e.prototype, "showMapConfig", null), o([ Je({
name: "setVisMode",
description: "Set visualization mode preset (debug, presentation, minimal, performance)",
usage: "setVisMode(mode)",
examples: [ "setVisMode('debug')", "setVisMode('presentation')", "setVisMode('minimal')", "setVisMode('performance')" ],
category: "Visualization"
}) ], e.prototype, "setVisMode", null), o([ Je({
name: "toggleVisLayer",
description: "Toggle a specific visualization layer",
usage: "toggleVisLayer(layer)",
examples: [ "toggleVisLayer('pheromones')", "toggleVisLayer('paths')", "toggleVisLayer('defense')", "toggleVisLayer('economy')", "toggleVisLayer('performance')" ],
category: "Visualization"
}) ], e.prototype, "toggleVisLayer", null), o([ Je({
name: "showVisPerf",
description: "Show visualization performance metrics",
usage: "showVisPerf()",
examples: [ "showVisPerf()" ],
category: "Visualization"
}) ], e.prototype, "showVisPerf", null), o([ Je({
name: "showVisConfig",
description: "Show current visualization configuration",
usage: "showVisConfig()",
examples: [ "showVisConfig()" ],
category: "Visualization"
}) ], e.prototype, "showVisConfig", null), o([ Je({
name: "clearVisCache",
description: "Clear visualization cache",
usage: "clearVisCache(roomName?)",
examples: [ "clearVisCache()", "clearVisCache('W1N1')" ],
category: "Visualization"
}) ], e.prototype, "clearVisCache", null), e;
}(), gu = function() {
function e() {}
return e.prototype.showStats = function() {
var e = Xn.getLatestStats();
return e ? "=== SwarmBot Stats (Tick ".concat(e.tick, ") ===\nCPU: ").concat(e.cpuUsed.toFixed(2), "/").concat(e.cpuLimit, " (Bucket: ").concat(e.cpuBucket, ")\nGCL: ").concat(e.gclLevel, " (").concat((100 * e.gclProgress).toFixed(1), "%)\nGPL: ").concat(e.gplLevel, "\nCreeps: ").concat(e.totalCreeps, "\nRooms: ").concat(e.totalRooms, "\n").concat(e.rooms.map(function(e) {
return "  ".concat(e.roomName, ": RCL").concat(e.rcl, " | ").concat(e.creepCount, " creeps | ").concat(e.storageEnergy, "E");
}).join("\n")) : "No stats available yet. Wait for a few ticks.";
}, e.prototype.cacheStats = function() {
var e, t = fn.getCacheStats(gn);
return "=== Object Cache Statistics ===\nCache Size: ".concat(t.size, " entries\nCache Hits: ").concat(t.hits, "\nCache Misses: ").concat(t.misses, "\nHit Rate: ").concat(t.hitRate.toFixed(2), "%\nEstimated CPU Saved: ").concat((null !== (e = t.cpuSaved) && void 0 !== e ? e : 0).toFixed(3), " CPU\n\nPerformance: ").concat(t.hitRate >= 80 ? "Excellent" : t.hitRate >= 60 ? "Good" : t.hitRate >= 40 ? "Fair" : "Poor");
}, e.prototype.resetCacheStats = function() {
return fn.clear(gn), "Cache statistics reset";
}, e.prototype.roomFindCacheStats = function() {
var e = function() {
var e = fn.getCacheStats(En);
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
}, e.prototype.clearRoomFindCache = function() {
return fn.clear(En), "Room.find() cache cleared and statistics reset";
}, e.prototype.toggleProfiling = function() {
var e = !sr().profiling;
return cr({
profiling: e
}), jn.setEnabled(e), Ie({
cpuLogging: e
}), "Profiling: ".concat(e ? "ENABLED" : "DISABLED");
}, e.prototype.cpuBreakdown = function(e) {
var t, r, o, a, i, s, c, l, u = Memory.stats;
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
for (var g = n(y.slice(0, 10)), h = g.next(); !h.done; h = g.next()) {
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
for (var T = n(y), C = T.next(); !C.done; C = T.next()) {
var S = C.value, w = S.name || "unknown";
p.push("  ".concat(w, ": ").concat(S.profiler.avg_cpu.toFixed(3), " CPU (RCL ").concat(S.rcl, ")"));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
C && !C.done && (a = T.return) && a.call(T);
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
for (var _ = n(y.slice(0, 10)), x = _.next(); !x.done; x = _.next()) {
var U = x.value, k = U.name || "unknown";
p.push("  ".concat(k, ": ").concat(U.avg_cpu.toFixed(3), " CPU (calls: ").concat(U.calls, ")"));
}
} catch (e) {
i = {
error: e
};
} finally {
try {
x && !x.done && (s = _.return) && s.call(_);
} finally {
if (i) throw i.error;
}
}
p.push("");
}
}
if (m || "creep" === e) {
var M = u.creeps || {}, A = Object.values(M);
if (A.length > 0) {
p.push("=== Top Creeps by CPU (Top 10) ==="), y = A.sort(function(e, t) {
return t.cpu - e.cpu;
});
try {
for (var N = n(y.slice(0, 10)), I = N.next(); !I.done; I = N.next()) {
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
}, e.prototype.cpuBudget = function() {
var e, t, r, o, a = jn.validateBudgets(), i = "=== CPU Budget Report (Tick ".concat(a.tick, ") ===\n");
if (i += "Rooms Evaluated: ".concat(a.roomsEvaluated, "\n"), i += "Within Budget: ".concat(a.roomsWithinBudget, "\n"), 
i += "Over Budget: ".concat(a.roomsOverBudget, "\n\n"), 0 === a.alerts.length) i += "✓ All rooms within budget!\n"; else {
i += "Alerts: ".concat(a.alerts.length, "\n");
var s = a.alerts.filter(function(e) {
return "critical" === e.severity;
}), c = a.alerts.filter(function(e) {
return "warning" === e.severity;
});
if (s.length > 0) {
i += "\n🔴 CRITICAL (≥100% of budget):\n";
try {
for (var l = n(s), u = l.next(); !u.done; u = l.next()) {
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
for (var p = n(c), d = p.next(); !d.done; d = p.next()) m = d.value, i += "  ".concat(m.target, ": ").concat(m.cpuUsed.toFixed(3), " CPU / ").concat(m.budgetLimit.toFixed(3), " limit (").concat((100 * m.percentUsed).toFixed(1), "%)\n");
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
}, e.prototype.cpuAnomalies = function() {
var e, t, r, o, a = jn.detectAnomalies();
if (0 === a.length) return "✓ No CPU anomalies detected";
var i = "=== CPU Anomalies Detected: ".concat(a.length, " ===\n\n"), s = a.filter(function(e) {
return "spike" === e.type;
}), c = a.filter(function(e) {
return "sustained_high" === e.type;
});
if (s.length > 0) {
i += "⚡ CPU Spikes (".concat(s.length, "):\n");
try {
for (var l = n(s), u = l.next(); !u.done; u = l.next()) {
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
for (var p = n(c), d = p.next(); !d.done; d = p.next()) m = d.value, i += "  ".concat(m.target, ": ").concat(m.current.toFixed(3), " CPU (").concat(m.multiplier.toFixed(1), "x budget ").concat(m.baseline.toFixed(3), ")\n"), 
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
}, e.prototype.cpuProfile = function(e) {
var t, r, o, a;
void 0 === e && (e = !1);
var i = jn.getCurrentSnapshot(), s = "=== CPU Profile (Tick ".concat(i.tick, ") ===\n");
s += "Total: ".concat(i.cpu.used.toFixed(2), " / ").concat(i.cpu.limit, " (").concat(i.cpu.percent.toFixed(1), "%)\n"), 
s += "Bucket: ".concat(i.cpu.bucket, "\n"), s += "Heap: ".concat(i.cpu.heapUsed.toFixed(2), " MB\n\n");
var c = Object.values(i.rooms).sort(function(e, t) {
return t.profiler.avgCpu - e.profiler.avgCpu;
}), l = e ? c : c.slice(0, 10);
s += "Top ".concat(l.length, " Rooms by CPU:\n");
try {
for (var u = n(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, d = jn.postureCodeToName(p.brain.postureCode);
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
for (var y = n(f), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = h.cpuBudget > 0 ? (h.avgCpu / h.cpuBudget * 100).toFixed(0) : "N/A";
s += "  ".concat(h.name, " (").concat(h.frequency, "): avg ").concat(h.avgCpu.toFixed(3), " / budget ").concat(h.cpuBudget.toFixed(3), " (").concat(v, "%)\n");
}
} catch (e) {
o = {
error: e
};
} finally {
try {
g && !g.done && (a = y.return) && a.call(y);
} finally {
if (o) throw o.error;
}
}
return s;
}, e.prototype.diagnoseRoom = function(e) {
var t, r, o, i;
if (!e) return "Error: Room name required. Usage: diagnoseRoom('W16S52')";
if (!Game.rooms[e]) return "Error: Room ".concat(e, " not visible. Make sure you have vision in this room.");
var s = jn.getCurrentSnapshot(), c = s.rooms[e];
if (!c) return "Error: No stats available for ".concat(e, ". The room may not have been processed yet.");
var l = "room:".concat(e), u = s.processes[l], m = Yt.getSwarmState(e), p = m && ("war" === m.posture || "siege" === m.posture || m.danger >= 2), d = p ? .25 : .1, f = null !== (o = null == u ? void 0 : u.tickModulo) && void 0 !== o ? o : 1, y = d * f, g = "═══════════════════════════════════════════════\n";
g += "  Room Diagnostic: ".concat(e, "\n"), g += "═══════════════════════════════════════════════\n\n", 
g += "📊 Basic Info:\n", g += "  RCL: ".concat(c.rcl, "\n"), g += "  Controller Progress: ".concat(c.controller.progressPercent.toFixed(1), "%\n"), 
g += "  Posture: ".concat(jn.postureCodeToName(c.brain.postureCode), "\n"), g += "  Danger Level: ".concat(c.brain.dangerLevel, "\n"), 
g += "  Hostiles: ".concat(c.metrics.hostileCount, "\n\n"), g += "⚡ CPU Analysis:\n", 
g += "  Average CPU: ".concat(c.profiler.avgCpu.toFixed(3), "\n"), g += "  Peak CPU: ".concat(c.profiler.peakCpu.toFixed(3), "\n"), 
g += "  Samples: ".concat(c.profiler.samples, "\n"), g += "  Budget: ".concat(y.toFixed(3), " (base ").concat(d, ", modulo ").concat(f, ")\n");
var h = c.profiler.avgCpu / y * 100;
g += "  Status: ".concat(h >= 100 ? "🔴 CRITICAL" : h >= 80 ? "⚠️  WARNING" : "✅ OK", " (").concat(h.toFixed(1), "% of budget)\n"), 
f > 1 && (g += "  Note: Room runs every ".concat(f, " ticks (distributed execution)\n")), 
g += "\n", u && (g += "🔧 Process Info:\n", g += "  Process ID: ".concat(u.id, "\n"), 
g += "  State: ".concat(u.state, "\n"), g += "  Priority: ".concat(u.priority, "\n"), 
g += "  Run Count: ".concat(u.runCount, "\n"), g += "  Skipped: ".concat(u.skippedCount, "\n"), 
g += "  Errors: ".concat(u.errorCount, "\n"), g += "  Last Run: Tick ".concat(u.lastRunTick, " (").concat(Game.time - u.lastRunTick, " ticks ago)\n\n"));
var v = Object.values(Game.creeps).filter(function(t) {
return t.room.name === e;
});
g += "👥 Creeps: ".concat(v.length, " total\n");
var R = {};
try {
for (var E = n(v), T = E.next(); !T.done; T = E.next()) {
var C = null !== (i = T.value.memory.role) && void 0 !== i ? i : "unknown";
R[C] = (R[C] || 0) + 1;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
T && !T.done && (r = E.return) && r.call(E);
} finally {
if (t) throw t.error;
}
}
var S = Object.entries(R).sort(function(e, t) {
return t[1] - e[1];
}).map(function(e) {
var t = a(e, 2), r = t[0], o = t[1];
return "".concat(r, ": ").concat(o);
}).join(", ");
return g += "  By Role: ".concat(S, "\n\n"), g += "📈 Metrics:\n", g += "  Energy Harvested: ".concat(c.metrics.energyHarvested, "\n"), 
g += "  Energy in Storage: ".concat(c.energy.storage, "\n"), g += "  Energy Capacity: ".concat(c.metrics.energyCapacityTotal, "\n"), 
g += "  Construction Sites: ".concat(c.metrics.constructionSites, "\n\n"), g += "💡 Recommendations:\n", 
h >= 150 ? (g += "  ⚠️  CRITICAL: CPU usage is ".concat(h.toFixed(0), "% of budget!\n"), 
g += "     - Check for infinite loops or stuck creeps\n", g += "     - Review construction sites (".concat(c.metrics.constructionSites, " active)\n"), 
g += "     - Consider reducing creep count (".concat(v.length, " creeps)\n")) : h >= 100 ? (g += "  ⚠️  Room is over budget. Consider optimizations:\n", 
g += "     - Reduce creep count if excessive (currently ".concat(v.length, ")\n"), 
g += "     - Limit construction sites (currently ".concat(c.metrics.constructionSites, ")\n"), 
g += "     - Review pathfinding (check for recalculation issues)\n") : h >= 80 ? (g += "  ℹ️  Room is nearing budget limit (".concat(h.toFixed(1), "%)\n"), 
g += "     - Monitor for increases in CPU usage\n") : g += "  ✅ Room is performing well within budget\n", 
c.metrics.hostileCount > 0 && (g += "  ⚠️  ".concat(c.metrics.hostileCount, " hostiles detected - defense active\n"), 
g += "     - War mode increases CPU budget to ".concat(p ? y.toFixed(3) : (.25 * f).toFixed(3), "\n")), 
g += "\n", (g += "Use cpuBreakdown('room') to see all rooms\n") + "Use cpuProfile() for detailed profiling";
}, o([ Je({
name: "showStats",
description: "Show current bot statistics from memory segment",
usage: "showStats()",
examples: [ "showStats()" ],
category: "Statistics"
}) ], e.prototype, "showStats", null), o([ Je({
name: "cacheStats",
description: "Show object cache statistics (hits, misses, hit rate, CPU savings)",
usage: "cacheStats()",
examples: [ "cacheStats()" ],
category: "Statistics"
}) ], e.prototype, "cacheStats", null), o([ Je({
name: "resetCacheStats",
description: "Reset cache statistics counters (for benchmarking)",
usage: "resetCacheStats()",
examples: [ "resetCacheStats()" ],
category: "Statistics"
}) ], e.prototype, "resetCacheStats", null), o([ Je({
name: "roomFindCacheStats",
description: "Show room.find() cache statistics (hits, misses, hit rate)",
usage: "roomFindCacheStats()",
examples: [ "roomFindCacheStats()" ],
category: "Statistics"
}) ], e.prototype, "roomFindCacheStats", null), o([ Je({
name: "clearRoomFindCache",
description: "Clear all room.find() cache entries and reset stats",
usage: "clearRoomFindCache()",
examples: [ "clearRoomFindCache()" ],
category: "Statistics"
}) ], e.prototype, "clearRoomFindCache", null), o([ Je({
name: "toggleProfiling",
description: "Toggle CPU profiling on/off",
usage: "toggleProfiling()",
examples: [ "toggleProfiling()" ],
category: "Statistics"
}) ], e.prototype, "toggleProfiling", null), o([ Je({
name: "cpuBreakdown",
description: "Show detailed CPU breakdown by process, room, creep, and subsystem",
usage: "cpuBreakdown(type?)",
examples: [ "cpuBreakdown() // Show all breakdowns", "cpuBreakdown('process') // Show only process breakdown", "cpuBreakdown('room') // Show only room breakdown", "cpuBreakdown('creep') // Show only creep breakdown", "cpuBreakdown('subsystem') // Show only subsystem breakdown" ],
category: "Statistics"
}) ], e.prototype, "cpuBreakdown", null), o([ Je({
name: "cpuBudget",
description: "Show CPU budget status and violations for all rooms",
usage: "cpuBudget()",
examples: [ "cpuBudget()" ],
category: "Statistics"
}) ], e.prototype, "cpuBudget", null), o([ Je({
name: "cpuAnomalies",
description: "Detect and show CPU usage anomalies (spikes and sustained high usage)",
usage: "cpuAnomalies()",
examples: [ "cpuAnomalies()" ],
category: "Statistics"
}) ], e.prototype, "cpuAnomalies", null), o([ Je({
name: "cpuProfile",
description: "Show comprehensive CPU profiling breakdown by room and subsystem",
usage: "cpuProfile(showAll?)",
examples: [ "cpuProfile()", "cpuProfile(true)" ],
category: "Statistics"
}) ], e.prototype, "cpuProfile", null), o([ Je({
name: "diagnoseRoom",
description: "Comprehensive diagnostic for a specific room showing CPU usage, budget status, and potential issues",
usage: "diagnoseRoom(roomName)",
examples: [ "diagnoseRoom('W16S52')", "diagnoseRoom('E1S1')" ],
category: "Statistics"
}) ], e.prototype, "diagnoseRoom", null), e;
}(), hu = function() {
function e() {}
return e.prototype.showKernelStats = function() {
var e, t, r, o, a = mr.getStatsSummary(), i = mr.getConfig(), s = mr.getBucketMode(), c = "=== Kernel Stats ===\nBucket Mode: ".concat(s.toUpperCase(), "\nCPU Bucket: ").concat(Game.cpu.bucket, "\nCPU Limit: ").concat(mr.getCpuLimit().toFixed(2), " (").concat((100 * i.targetCpuUsage).toFixed(0), "% of ").concat(Game.cpu.limit, ")\nRemaining CPU: ").concat(mr.getRemainingCpu().toFixed(2), "\n\nProcesses: ").concat(a.totalProcesses, " total (").concat(a.activeProcesses, " active, ").concat(a.suspendedProcesses, " suspended)\nTotal CPU Used: ").concat(a.totalCpuUsed.toFixed(3), "\nAvg CPU/Process: ").concat(a.avgCpuPerProcess.toFixed(4), "\nAvg Health Score: ").concat(a.avgHealthScore.toFixed(1), "/100\n\nTop CPU Consumers:");
try {
for (var l = n(a.topCpuProcesses), u = l.next(); !u.done; u = l.next()) {
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
if (a.unhealthyProcesses.length > 0) {
c += "\n\nUnhealthy Processes (Health < 50):";
try {
for (var p = n(a.unhealthyProcesses), d = p.next(); !d.done; d = p.next()) m = d.value, 
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
var e, t, r = mr.getProcesses();
if (0 === r.length) return "No processes registered with kernel.";
var o = "=== Registered Processes ===\n";
o += "ID | Name | Priority | Frequency | State | Runs | Avg CPU | Health | Errors\n", 
o += "-".repeat(100) + "\n";
var s = i([], a(r), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var c = n(s), l = c.next(); !l.done; l = c.next()) {
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
var t = mr.suspendProcess(e);
return 'Process "'.concat(e, t ? '" suspended.' : '" not found.');
}, e.prototype.resumeProcess = function(e) {
var t = mr.resumeProcess(e);
return 'Process "'.concat(e, t ? '" resumed.' : '" not found or not suspended.');
}, e.prototype.resetKernelStats = function() {
return mr.resetStats(), "Kernel statistics reset.";
}, e.prototype.showProcessHealth = function() {
var e, t, r = mr.getProcesses();
if (0 === r.length) return "No processes registered with kernel.";
var o = i([], a(r), !1).sort(function(e, t) {
return e.stats.healthScore - t.stats.healthScore;
}), s = "=== Process Health Status ===\n";
s += "Name | Health | Errors | Consecutive | Status | Last Success\n", s += "-".repeat(80) + "\n";
try {
for (var c = n(o), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.stats.healthScore.toFixed(0), p = u.stats.healthScore >= 80 ? "✓" : u.stats.healthScore >= 50 ? "⚠" : "✗", d = u.stats.lastSuccessfulRunTick > 0 ? Game.time - u.stats.lastSuccessfulRunTick : "never", f = "suspended" === u.state ? "SUSPENDED (".concat(u.stats.suspensionReason, ")") : u.state.toUpperCase();
s += "".concat(u.name, " | ").concat(p, " ").concat(m, "/100 | ").concat(u.stats.errorCount, " | ").concat(u.stats.consecutiveErrors, " | ").concat(f, " | ").concat(d, "\n");
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
var y = mr.getStatsSummary();
return (s += "\nAverage Health: ".concat(y.avgHealthScore.toFixed(1), "/100")) + "\nSuspended Processes: ".concat(y.suspendedProcesses);
}, e.prototype.resumeAllProcesses = function() {
var e, t, r = mr.getProcesses().filter(function(e) {
return "suspended" === e.state;
});
if (0 === r.length) return "No suspended processes to resume.";
var o = 0;
try {
for (var a = n(r), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
mr.resumeProcess(s.id) && o++;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return "Resumed ".concat(o, " of ").concat(r.length, " suspended processes.");
}, e.prototype.showCreepStats = function() {
var e, t, r = ol.getStats(), o = "=== Creep Process Stats ===\nTotal Creeps: ".concat(r.totalCreeps, "\nRegistered Processes: ").concat(r.registeredCreeps, "\n\nCreeps by Priority:");
try {
for (var i = n(Object.entries(r.creepsByPriority)), s = i.next(); !s.done; s = i.next()) {
var c = a(s.value, 2), l = c[0], u = c[1];
o += "\n  ".concat(l, ": ").concat(u);
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
return o;
}, e.prototype.showRoomStats = function() {
var e, t, r = Kl.getStats(), o = "=== Room Process Stats ===\nTotal Rooms: ".concat(r.totalRooms, "\nRegistered Processes: ").concat(r.registeredRooms, "\nOwned Rooms: ").concat(r.ownedRooms, "\n\nRooms by Priority:");
try {
for (var i = n(Object.entries(r.roomsByPriority)), s = i.next(); !s.done; s = i.next()) {
var c = a(s.value, 2), l = c[0], u = c[1];
o += "\n  ".concat(l, ": ").concat(u);
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
return o;
}, e.prototype.listCreepProcesses = function(e) {
var t, r, o = mr.getProcesses().filter(function(e) {
return e.id.startsWith("creep:");
});
if (e && (o = o.filter(function(t) {
return t.name.includes("(".concat(e, ")"));
})), 0 === o.length) return e ? "No creep processes found with role: ".concat(e) : "No creep processes registered.";
var s = e ? "=== Creep Processes (Role: ".concat(e, ") ===\n") : "=== All Creep Processes ===\n";
s += "Name | Priority | Runs | Avg CPU | Errors\n", s += "-".repeat(70) + "\n";
var c = i([], a(o), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var l = n(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = m.stats.avgCpu.toFixed(4);
s += "".concat(m.name, " | ").concat(m.priority, " | ").concat(m.stats.runCount, " | ").concat(p, " | ").concat(m.stats.errorCount, "\n");
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
return s + "\nTotal: ".concat(o.length, " creep processes");
}, e.prototype.listRoomProcesses = function() {
var e, t, r = mr.getProcesses().filter(function(e) {
return e.id.startsWith("room:");
});
if (0 === r.length) return "No room processes registered.";
var o = "=== Room Processes ===\n";
o += "Name | Priority | Runs | Avg CPU | Errors\n", o += "-".repeat(70) + "\n";
var s = i([], a(r), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var c = n(s), l = c.next(); !l.done; l = c.next()) {
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
}, o([ Je({
name: "showKernelStats",
description: "Show kernel statistics including CPU usage and process info",
usage: "showKernelStats()",
examples: [ "showKernelStats()" ],
category: "Kernel"
}) ], e.prototype, "showKernelStats", null), o([ Je({
name: "listProcesses",
description: "List all registered kernel processes",
usage: "listProcesses()",
examples: [ "listProcesses()" ],
category: "Kernel"
}) ], e.prototype, "listProcesses", null), o([ Je({
name: "suspendProcess",
description: "Suspend a kernel process by ID",
usage: "suspendProcess(processId)",
examples: [ "suspendProcess('empire:manager')", "suspendProcess('cluster:manager')" ],
category: "Kernel"
}) ], e.prototype, "suspendProcess", null), o([ Je({
name: "resumeProcess",
description: "Resume a suspended kernel process",
usage: "resumeProcess(processId)",
examples: [ "resumeProcess('empire:manager')" ],
category: "Kernel"
}) ], e.prototype, "resumeProcess", null), o([ Je({
name: "resetKernelStats",
description: "Reset all kernel process statistics",
usage: "resetKernelStats()",
examples: [ "resetKernelStats()" ],
category: "Kernel"
}) ], e.prototype, "resetKernelStats", null), o([ Je({
name: "showProcessHealth",
description: "Show health status of all processes with detailed metrics",
usage: "showProcessHealth()",
examples: [ "showProcessHealth()" ],
category: "Kernel"
}) ], e.prototype, "showProcessHealth", null), o([ Je({
name: "resumeAllProcesses",
description: "Resume all suspended processes (use with caution)",
usage: "resumeAllProcesses()",
examples: [ "resumeAllProcesses()" ],
category: "Kernel"
}) ], e.prototype, "resumeAllProcesses", null), o([ Je({
name: "showCreepStats",
description: "Show statistics about creep processes managed by the kernel",
usage: "showCreepStats()",
examples: [ "showCreepStats()" ],
category: "Kernel"
}) ], e.prototype, "showCreepStats", null), o([ Je({
name: "showRoomStats",
description: "Show statistics about room processes managed by the kernel",
usage: "showRoomStats()",
examples: [ "showRoomStats()" ],
category: "Kernel"
}) ], e.prototype, "showRoomStats", null), o([ Je({
name: "listCreepProcesses",
description: "List all creep processes with their details",
usage: "listCreepProcesses(role?)",
examples: [ "listCreepProcesses()", "listCreepProcesses('harvester')" ],
category: "Kernel"
}) ], e.prototype, "listCreepProcesses", null), o([ Je({
name: "listRoomProcesses",
description: "List all room processes with their details",
usage: "listRoomProcesses()",
examples: [ "listRoomProcesses()" ],
category: "Kernel"
}) ], e.prototype, "listRoomProcesses", null), e;
}(), vu = new Pn, Ru = new yu, Eu = new gu, Tu = new Ln, Cu = new hu, Su = new Gn, wu = ze("Main");

!function(e) {
void 0 === e && (e = !1);
var t = function() {
Ze.initialize(), $e(vu), $e(Ru), $e(Eu), $e(Tu), $e(Cu), $e(Su), $e(Ar), $e(Nr), 
$e(Ir), $e(Qr), $e(eo), $e(ho), $e(Bo), global.tooangel = Do;
var e = global;
e.botConfig = {
getConfig: sr,
updateConfig: cr
}, e.botLogger = {
configureLogger: Ie
}, e.botVisualizationManager = na, e.botCacheManager = fn, Ze.exposeToGlobal();
};
e ? (Ze.initialize(), Ze.enableLazyLoading(t), Ze.exposeToGlobal()) : t();
}(sr().lazyLoadConsoleCommands);

var Ou = ke.wrapLoop(function() {
try {
fu();
} catch (e) {
throw wu.error("Critical error in main loop: ".concat(String(e)), {
meta: {
stack: e instanceof Error ? e.stack : void 0,
tick: Game.time
}
}), e;
}
});

exports.loop = Ou;
