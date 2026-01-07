"use strict";

var e = require("@ralphschuler/screeps-stats"), t = require("@ralphschuler/screeps-utils"), r = require("@ralphschuler/screeps-visuals"), o = require("@ralphschuler/screeps-defense"), n = require("@ralphschuler/screeps-economy"), a = require("@ralphschuler/screeps-chemistry"), i = require("@ralphschuler/screeps-pathfinding"), s = require("@ralphschuler/screeps-remote-mining");

function c(e) {
var t = Object.create(null);
return e && Object.keys(e).forEach(function(r) {
if ("default" !== r) {
var o = Object.getOwnPropertyDescriptor(e, r);
Object.defineProperty(t, r, o.get ? o : {
enumerable: !0,
get: function() {
return e[r];
}
});
}
}), t.default = e, Object.freeze(t);
}

var u = c(e), l = function() {
return l = Object.assign || function(e) {
for (var t, r = 1, o = arguments.length; r < o; r++) for (var n in t = arguments[r]) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
return e;
}, l.apply(this, arguments);
};

function m(e, t, r, o) {
var n, a = arguments.length, i = a < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, r) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, r, o); else for (var s = e.length - 1; s >= 0; s--) (n = e[s]) && (i = (a < 3 ? n(i) : a > 3 ? n(t, r, i) : n(t, r)) || i);
return a > 3 && i && Object.defineProperty(t, r, i), i;
}

function p(e) {
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

function d(e, t) {
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

function f(e, t, r) {
if (r || 2 === arguments.length) for (var o, n = 0, a = t.length; n < a; n++) !o && n in t || (o || (o = Array.prototype.slice.call(t, 0, n)), 
o[n] = t[n]);
return e.concat(o || Array.prototype.slice.call(t));
}

"function" == typeof SuppressedError && SuppressedError;

var y = "#555555", h = "#AAAAAA", g = "#FFE87B", v = "#F53547", R = "#181818", E = "#8FBB93";

"undefined" != typeof RoomVisual && (RoomVisual.prototype.structure = function(e, t, r, o) {
void 0 === o && (o = {});
var n = l({
opacity: 1
}, o);
switch (r) {
case STRUCTURE_EXTENSION:
this.circle(e, t, {
radius: .5,
fill: R,
stroke: E,
strokeWidth: .05,
opacity: n.opacity
}), this.circle(e, t, {
radius: .35,
fill: y,
opacity: n.opacity
});
break;

case STRUCTURE_SPAWN:
this.circle(e, t, {
radius: .65,
fill: R,
stroke: "#CCCCCC",
strokeWidth: .1,
opacity: n.opacity
}), this.circle(e, t, {
radius: .4,
fill: g,
opacity: n.opacity
});
break;

case STRUCTURE_POWER_SPAWN:
this.circle(e, t, {
radius: .65,
fill: R,
stroke: v,
strokeWidth: .1,
opacity: n.opacity
}), this.circle(e, t, {
radius: .4,
fill: g,
opacity: n.opacity
});
break;

case STRUCTURE_TOWER:
this.circle(e, t, {
radius: .6,
fill: R,
stroke: E,
strokeWidth: .05,
opacity: n.opacity
}), this.circle(e, t, {
radius: .45,
fill: y,
opacity: n.opacity
}), this.rect(e - .2, t - .3, .4, .6, {
fill: h,
opacity: n.opacity
});
break;

case STRUCTURE_STORAGE:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: E,
strokeWidth: .05,
fill: R,
opacity: n.opacity
}), this.rect(e - .35, t - .45, .7, .9, {
fill: g,
opacity: .6 * n.opacity
});
break;

case STRUCTURE_TERMINAL:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: E,
strokeWidth: .05,
fill: R,
opacity: n.opacity
}), this.circle(e, t, {
radius: .3,
fill: h,
opacity: n.opacity
}), this.rect(e - .15, t - .15, .3, .3, {
fill: y,
opacity: n.opacity
});
break;

case STRUCTURE_LAB:
this.circle(e, t, {
radius: .55,
fill: R,
stroke: E,
strokeWidth: .05,
opacity: n.opacity
}), this.circle(e, t, {
radius: .4,
fill: y,
opacity: n.opacity
}), this.rect(e - .15, t + .1, .3, .25, {
fill: h,
opacity: n.opacity
});
break;

case STRUCTURE_LINK:
this.circle(e, t, {
radius: .5,
fill: R,
stroke: E,
strokeWidth: .05,
opacity: n.opacity
}), this.circle(e, t, {
radius: .35,
fill: h,
opacity: n.opacity
});
break;

case STRUCTURE_NUKER:
this.circle(e, t, {
radius: .65,
fill: R,
stroke: "#ff0000",
strokeWidth: .1,
opacity: n.opacity
}), this.circle(e, t, {
radius: .4,
fill: "#ff0000",
opacity: .6 * n.opacity
});
break;

case STRUCTURE_OBSERVER:
this.circle(e, t, {
radius: .6,
fill: R,
stroke: E,
strokeWidth: .05,
opacity: n.opacity
}), this.circle(e, t, {
radius: .4,
fill: "#00ffff",
opacity: .6 * n.opacity
});
break;

case STRUCTURE_CONTAINER:
this.rect(e - .45, t - .45, .9, .9, {
fill: R,
stroke: E,
strokeWidth: .05,
opacity: n.opacity
}), this.rect(e - .35, t - .35, .7, .7, {
fill: "transparent",
stroke: y,
strokeWidth: .05,
opacity: n.opacity
});
break;

case STRUCTURE_ROAD:
this.circle(e, t, {
radius: .175,
fill: "#666",
opacity: n.opacity
});
break;

case STRUCTURE_RAMPART:
this.rect(e - .45, t - .45, .9, .9, {
fill: "transparent",
stroke: "#00ff00",
strokeWidth: .1,
opacity: n.opacity
});
break;

case STRUCTURE_WALL:
this.rect(e - .45, t - .45, .9, .9, {
fill: R,
stroke: h,
strokeWidth: .05,
opacity: n.opacity
});
break;

case STRUCTURE_EXTRACTOR:
this.circle(e, t, {
radius: .6,
fill: R,
stroke: E,
strokeWidth: .05,
opacity: n.opacity
}), this.circle(e, t, {
radius: .45,
fill: y,
opacity: n.opacity
});
break;

default:
this.circle(e, t, {
radius: .5,
fill: y,
stroke: E,
strokeWidth: .05,
opacity: n.opacity
});
}
}, RoomVisual.prototype.speech = function(e, t, r, o) {
var n, a, i, s, c;
void 0 === o && (o = {});
var u = null !== (n = o.background) && void 0 !== n ? n : "#2ccf3b", l = null !== (a = o.textcolor) && void 0 !== a ? a : "#000000", m = null !== (i = o.textsize) && void 0 !== i ? i : .5, p = null !== (s = o.textfont) && void 0 !== s ? s : "Times New Roman", d = null !== (c = o.opacity) && void 0 !== c ? c : 1, f = m, y = e.length * f * .4 + .4, h = f + .4;
this.rect(t - y / 2, r - 1 - h, y, h, {
fill: u,
opacity: .9 * d
});
var g = [ [ t - .1, r - 1 ], [ t + .1, r - 1 ], [ t, r - .6 ] ];
this.poly(g, {
fill: u,
opacity: .9 * d,
stroke: "transparent"
}), this.text(e, t, r - 1 - h / 2 + .1, {
color: l,
font: "".concat(f, " ").concat(p),
opacity: d
});
}, RoomVisual.prototype.animatedPosition = function(e, t, r) {
var o, n, a, i;
void 0 === r && (r = {});
var s = null !== (o = r.color) && void 0 !== o ? o : "#ff0000", c = null !== (n = r.opacity) && void 0 !== n ? n : 1, u = null !== (a = r.radius) && void 0 !== a ? a : .75, l = null !== (i = r.frames) && void 0 !== i ? i : 6, m = Game.time % l, p = u * (1 - m / l), d = c * (m / l);
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
var i = null !== (a = ((n = {})[RESOURCE_ENERGY] = g, n[RESOURCE_POWER] = v, n[RESOURCE_HYDROGEN] = "#FFFFFF", 
n[RESOURCE_OXYGEN] = "#DDDDDD", n[RESOURCE_UTRIUM] = "#48C5E5", n[RESOURCE_LEMERGIUM] = "#24D490", 
n[RESOURCE_KEANIUM] = "#9269EC", n[RESOURCE_ZYNTHIUM] = "#D9B478", n[RESOURCE_CATALYST] = "#F26D6F", 
n[RESOURCE_GHODIUM] = "#FFFFFF", n)[e]) && void 0 !== a ? a : "#CCCCCC";
this.circle(t, r, {
radius: o,
fill: R,
opacity: .9
}), this.circle(t, r, {
radius: .8 * o,
fill: i,
opacity: .8
});
var s = e.length <= 2 ? e : e.substring(0, 2).toUpperCase();
this.text(s, t, r + .03, {
color: R,
font: "".concat(1.2 * o, " monospace"),
align: "center",
opacity: .9
});
});

var T = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

function S(e) {
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

var C, w, b = {}, x = {}, O = {}, _ = {};

function A() {
if (C) return _;
C = 1;
const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
return _.encode = function(t) {
if (0 <= t && t < e.length) return e[t];
throw new TypeError("Must be between 0 and 63: " + t);
}, _;
}

function U() {
if (w) return O;
w = 1;
const e = A();
return O.encode = function(t) {
let r, o = "", n = function(e) {
return e < 0 ? 1 + (-e << 1) : 0 + (e << 1);
}(t);
do {
r = 31 & n, n >>>= 5, n > 0 && (r |= 32), o += e.encode(r);
} while (n > 0);
return o;
}, O;
}

var N, M, k, P = {}, I = {}, G = {
exports: {}
}, L = G.exports;

function D() {
return N || (N = 1, e = G, t = G.exports, function(r) {
var o = t && !t.nodeType && t, n = e && !e.nodeType && e, a = "object" == typeof T && T;
a.global !== a && a.window !== a && a.self !== a || (r = a);
var i, s, c = 2147483647, u = 36, l = /^xn--/, m = /[^\x20-\x7E]/, p = /[\x2E\u3002\uFF0E\uFF61]/g, d = {
overflow: "Overflow: input needs wider integers to process",
"not-basic": "Illegal input >= 0x80 (not a basic code point)",
"invalid-input": "Invalid input"
}, f = Math.floor, y = String.fromCharCode;
function h(e) {
throw new RangeError(d[e]);
}
function g(e, t) {
for (var r = e.length, o = []; r--; ) o[r] = t(e[r]);
return o;
}
function v(e, t) {
var r = e.split("@"), o = "";
return r.length > 1 && (o = r[0] + "@", e = r[1]), o + g((e = e.replace(p, ".")).split("."), t).join(".");
}
function R(e) {
for (var t, r, o = [], n = 0, a = e.length; n < a; ) (t = e.charCodeAt(n++)) >= 55296 && t <= 56319 && n < a ? 56320 == (64512 & (r = e.charCodeAt(n++))) ? o.push(((1023 & t) << 10) + (1023 & r) + 65536) : (o.push(t), 
n--) : o.push(t);
return o;
}
function E(e) {
return g(e, function(e) {
var t = "";
return e > 65535 && (t += y((e -= 65536) >>> 10 & 1023 | 55296), e = 56320 | 1023 & e), 
t + y(e);
}).join("");
}
function S(e) {
return e - 48 < 10 ? e - 22 : e - 65 < 26 ? e - 65 : e - 97 < 26 ? e - 97 : u;
}
function C(e, t) {
return e + 22 + 75 * (e < 26) - ((0 != t) << 5);
}
function w(e, t, r) {
var o = 0;
for (e = r ? f(e / 700) : e >> 1, e += f(e / t); e > 455; o += u) e = f(e / 35);
return f(o + 36 * e / (e + 38));
}
function b(e) {
var t, r, o, n, a, i, s, l, m, p, d = [], y = e.length, g = 0, v = 128, R = 72;
for ((r = e.lastIndexOf("-")) < 0 && (r = 0), o = 0; o < r; ++o) e.charCodeAt(o) >= 128 && h("not-basic"), 
d.push(e.charCodeAt(o));
for (n = r > 0 ? r + 1 : 0; n < y; ) {
for (a = g, i = 1, s = u; n >= y && h("invalid-input"), ((l = S(e.charCodeAt(n++))) >= u || l > f((c - g) / i)) && h("overflow"), 
g += l * i, !(l < (m = s <= R ? 1 : s >= R + 26 ? 26 : s - R)); s += u) i > f(c / (p = u - m)) && h("overflow"), 
i *= p;
R = w(g - a, t = d.length + 1, 0 == a), f(g / t) > c - v && h("overflow"), v += f(g / t), 
g %= t, d.splice(g++, 0, v);
}
return E(d);
}
function x(e) {
var t, r, o, n, a, i, s, l, m, p, d, g, v, E, T, S = [];
for (g = (e = R(e)).length, t = 128, r = 0, a = 72, i = 0; i < g; ++i) (d = e[i]) < 128 && S.push(y(d));
for (o = n = S.length, n && S.push("-"); o < g; ) {
for (s = c, i = 0; i < g; ++i) (d = e[i]) >= t && d < s && (s = d);
for (s - t > f((c - r) / (v = o + 1)) && h("overflow"), r += (s - t) * v, t = s, 
i = 0; i < g; ++i) if ((d = e[i]) < t && ++r > c && h("overflow"), d == t) {
for (l = r, m = u; !(l < (p = m <= a ? 1 : m >= a + 26 ? 26 : m - a)); m += u) T = l - p, 
E = u - p, S.push(y(C(p + T % E, 0))), l = f(T / E);
S.push(y(C(l, 0))), a = w(r, v, o == n), r = 0, ++o;
}
++r, ++t;
}
return S.join("");
}
if (i = {
version: "1.4.1",
ucs2: {
decode: R,
encode: E
},
decode: b,
encode: x,
toASCII: function(e) {
return v(e, function(e) {
return m.test(e) ? "xn--" + x(e) : e;
});
},
toUnicode: function(e) {
return v(e, function(e) {
return l.test(e) ? b(e.slice(4).toLowerCase()) : e;
});
}
}, o && n) if (e.exports == o) n.exports = i; else for (s in i) i.hasOwnProperty(s) && (o[s] = i[s]); else r.punycode = i;
}(L)), G.exports;
var e, t;
}

function F() {
return k ? M : (k = 1, M = TypeError);
}

var B, W, V, K, H, j, Y, q, z, X, Q, $, J, Z, ee, te, re, oe, ne, ae, ie, se, ce, ue, le, me, pe, de, fe, ye, he, ge, ve, Re, Ee, Te, Se, Ce, we, be, xe, Oe, _e, Ae, Ue, Ne, Me, ke, Pe, Ie, Ge, Le, De, Fe, Be, We, Ve, Ke, He, je, Ye, qe, ze, Xe, Qe, $e, Je, Ze, et, tt, rt, ot, nt, at, it, st, ct, ut, lt, mt, pt, dt, ft, yt, ht, gt, vt, Rt, Et, Tt, St, Ct, wt = S(Object.freeze({
__proto__: null,
default: {}
}));

function bt() {
if (W) return B;
W = 1;
var e = "function" == typeof Map && Map.prototype, t = Object.getOwnPropertyDescriptor && e ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null, r = e && t && "function" == typeof t.get ? t.get : null, o = e && Map.prototype.forEach, n = "function" == typeof Set && Set.prototype, a = Object.getOwnPropertyDescriptor && n ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null, i = n && a && "function" == typeof a.get ? a.get : null, s = n && Set.prototype.forEach, c = "function" == typeof WeakMap && WeakMap.prototype ? WeakMap.prototype.has : null, u = "function" == typeof WeakSet && WeakSet.prototype ? WeakSet.prototype.has : null, l = "function" == typeof WeakRef && WeakRef.prototype ? WeakRef.prototype.deref : null, m = Boolean.prototype.valueOf, p = Object.prototype.toString, d = Function.prototype.toString, f = String.prototype.match, y = String.prototype.slice, h = String.prototype.replace, g = String.prototype.toUpperCase, v = String.prototype.toLowerCase, R = RegExp.prototype.test, E = Array.prototype.concat, S = Array.prototype.join, C = Array.prototype.slice, w = Math.floor, b = "function" == typeof BigInt ? BigInt.prototype.valueOf : null, x = Object.getOwnPropertySymbols, O = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? Symbol.prototype.toString : null, _ = "function" == typeof Symbol && "object" == typeof Symbol.iterator, A = "function" == typeof Symbol && Symbol.toStringTag && (Symbol.toStringTag, 
1) ? Symbol.toStringTag : null, U = Object.prototype.propertyIsEnumerable, N = ("function" == typeof Reflect ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(e) {
return e.__proto__;
} : null);
function M(e, t) {
if (e === 1 / 0 || e === -1 / 0 || e != e || e && e > -1e3 && e < 1e3 || R.call(/e/, t)) return t;
var r = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
if ("number" == typeof e) {
var o = e < 0 ? -w(-e) : w(e);
if (o !== e) {
var n = String(o), a = y.call(t, n.length + 1);
return h.call(n, r, "$&_") + "." + h.call(h.call(a, /([0-9]{3})/g, "$&_"), /_$/, "");
}
}
return h.call(t, r, "$&_");
}
var k = wt, P = k.custom, I = j(P) ? P : null, G = {
__proto__: null,
double: '"',
single: "'"
}, L = {
__proto__: null,
double: /(["\\])/g,
single: /(['\\])/g
};
function D(e, t, r) {
var o = r.quoteStyle || t, n = G[o];
return n + e + n;
}
function F(e) {
return h.call(String(e), /"/g, "&quot;");
}
function V(e) {
return !A || !("object" == typeof e && (A in e || void 0 !== e[A]));
}
function K(e) {
return "[object Array]" === z(e) && V(e);
}
function H(e) {
return "[object RegExp]" === z(e) && V(e);
}
function j(e) {
if (_) return e && "object" == typeof e && e instanceof Symbol;
if ("symbol" == typeof e) return !0;
if (!e || "object" != typeof e || !O) return !1;
try {
return O.call(e), !0;
} catch (e) {}
return !1;
}
B = function e(t, n, a, p) {
var g = n || {};
if (q(g, "quoteStyle") && !q(G, g.quoteStyle)) throw new TypeError('option "quoteStyle" must be "single" or "double"');
if (q(g, "maxStringLength") && ("number" == typeof g.maxStringLength ? g.maxStringLength < 0 && g.maxStringLength !== 1 / 0 : null !== g.maxStringLength)) throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
var R = !q(g, "customInspect") || g.customInspect;
if ("boolean" != typeof R && "symbol" !== R) throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
if (q(g, "indent") && null !== g.indent && "\t" !== g.indent && !(parseInt(g.indent, 10) === g.indent && g.indent > 0)) throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
if (q(g, "numericSeparator") && "boolean" != typeof g.numericSeparator) throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
var w = g.numericSeparator;
if (void 0 === t) return "undefined";
if (null === t) return "null";
if ("boolean" == typeof t) return t ? "true" : "false";
if ("string" == typeof t) return Q(t, g);
if ("number" == typeof t) {
if (0 === t) return 1 / 0 / t > 0 ? "0" : "-0";
var x = String(t);
return w ? M(t, x) : x;
}
if ("bigint" == typeof t) {
var P = String(t) + "n";
return w ? M(t, P) : P;
}
var L = void 0 === g.depth ? 5 : g.depth;
if (void 0 === a && (a = 0), a >= L && L > 0 && "object" == typeof t) return K(t) ? "[Array]" : "[Object]";
var B, W = function(e, t) {
var r;
if ("\t" === e.indent) r = "\t"; else {
if (!("number" == typeof e.indent && e.indent > 0)) return null;
r = S.call(Array(e.indent + 1), " ");
}
return {
base: r,
prev: S.call(Array(t + 1), r)
};
}(g, a);
if (void 0 === p) p = []; else if (X(p, t) >= 0) return "[Circular]";
function Y(t, r, o) {
if (r && (p = C.call(p)).push(r), o) {
var n = {
depth: g.depth
};
return q(g, "quoteStyle") && (n.quoteStyle = g.quoteStyle), e(t, n, a + 1, p);
}
return e(t, g, a + 1, p);
}
if ("function" == typeof t && !H(t)) {
var $ = function(e) {
if (e.name) return e.name;
var t = f.call(d.call(e), /^function\s*([\w$]+)/);
return t ? t[1] : null;
}(t), oe = re(t, Y);
return "[Function" + ($ ? ": " + $ : " (anonymous)") + "]" + (oe.length > 0 ? " { " + S.call(oe, ", ") + " }" : "");
}
if (j(t)) {
var ne = _ ? h.call(String(t), /^(Symbol\(.*\))_[^)]*$/, "$1") : O.call(t);
return "object" != typeof t || _ ? ne : J(ne);
}
if ((B = t) && "object" == typeof B && ("undefined" != typeof HTMLElement && B instanceof HTMLElement || "string" == typeof B.nodeName && "function" == typeof B.getAttribute)) {
for (var ae = "<" + v.call(String(t.nodeName)), ie = t.attributes || [], se = 0; se < ie.length; se++) ae += " " + ie[se].name + "=" + D(F(ie[se].value), "double", g);
return ae += ">", t.childNodes && t.childNodes.length && (ae += "..."), ae + "</" + v.call(String(t.nodeName)) + ">";
}
if (K(t)) {
if (0 === t.length) return "[]";
var ce = re(t, Y);
return W && !function(e) {
for (var t = 0; t < e.length; t++) if (X(e[t], "\n") >= 0) return !1;
return !0;
}(ce) ? "[" + te(ce, W) + "]" : "[ " + S.call(ce, ", ") + " ]";
}
if (function(e) {
return "[object Error]" === z(e) && V(e);
}(t)) {
var ue = re(t, Y);
return "cause" in Error.prototype || !("cause" in t) || U.call(t, "cause") ? 0 === ue.length ? "[" + String(t) + "]" : "{ [" + String(t) + "] " + S.call(ue, ", ") + " }" : "{ [" + String(t) + "] " + S.call(E.call("[cause]: " + Y(t.cause), ue), ", ") + " }";
}
if ("object" == typeof t && R) {
if (I && "function" == typeof t[I] && k) return k(t, {
depth: L - a
});
if ("symbol" !== R && "function" == typeof t.inspect) return t.inspect();
}
if (function(e) {
if (!r || !e || "object" != typeof e) return !1;
try {
r.call(e);
try {
i.call(e);
} catch (e) {
return !0;
}
return e instanceof Map;
} catch (e) {}
return !1;
}(t)) {
var le = [];
return o && o.call(t, function(e, r) {
le.push(Y(r, t, !0) + " => " + Y(e, t));
}), ee("Map", r.call(t), le, W);
}
if (function(e) {
if (!i || !e || "object" != typeof e) return !1;
try {
i.call(e);
try {
r.call(e);
} catch (e) {
return !0;
}
return e instanceof Set;
} catch (e) {}
return !1;
}(t)) {
var me = [];
return s && s.call(t, function(e) {
me.push(Y(e, t));
}), ee("Set", i.call(t), me, W);
}
if (function(e) {
if (!c || !e || "object" != typeof e) return !1;
try {
c.call(e, c);
try {
u.call(e, u);
} catch (e) {
return !0;
}
return e instanceof WeakMap;
} catch (e) {}
return !1;
}(t)) return Z("WeakMap");
if (function(e) {
if (!u || !e || "object" != typeof e) return !1;
try {
u.call(e, u);
try {
c.call(e, c);
} catch (e) {
return !0;
}
return e instanceof WeakSet;
} catch (e) {}
return !1;
}(t)) return Z("WeakSet");
if (function(e) {
if (!l || !e || "object" != typeof e) return !1;
try {
return l.call(e), !0;
} catch (e) {}
return !1;
}(t)) return Z("WeakRef");
if (function(e) {
return "[object Number]" === z(e) && V(e);
}(t)) return J(Y(Number(t)));
if (function(e) {
if (!e || "object" != typeof e || !b) return !1;
try {
return b.call(e), !0;
} catch (e) {}
return !1;
}(t)) return J(Y(b.call(t)));
if (function(e) {
return "[object Boolean]" === z(e) && V(e);
}(t)) return J(m.call(t));
if (function(e) {
return "[object String]" === z(e) && V(e);
}(t)) return J(Y(String(t)));
if ("undefined" != typeof window && t === window) return "{ [object Window] }";
if ("undefined" != typeof globalThis && t === globalThis || void 0 !== T && t === T) return "{ [object globalThis] }";
if (!function(e) {
return "[object Date]" === z(e) && V(e);
}(t) && !H(t)) {
var pe = re(t, Y), de = N ? N(t) === Object.prototype : t instanceof Object || t.constructor === Object, fe = t instanceof Object ? "" : "null prototype", ye = !de && A && Object(t) === t && A in t ? y.call(z(t), 8, -1) : fe ? "Object" : "", he = (de || "function" != typeof t.constructor ? "" : t.constructor.name ? t.constructor.name + " " : "") + (ye || fe ? "[" + S.call(E.call([], ye || [], fe || []), ": ") + "] " : "");
return 0 === pe.length ? he + "{}" : W ? he + "{" + te(pe, W) + "}" : he + "{ " + S.call(pe, ", ") + " }";
}
return String(t);
};
var Y = Object.prototype.hasOwnProperty || function(e) {
return e in this;
};
function q(e, t) {
return Y.call(e, t);
}
function z(e) {
return p.call(e);
}
function X(e, t) {
if (e.indexOf) return e.indexOf(t);
for (var r = 0, o = e.length; r < o; r++) if (e[r] === t) return r;
return -1;
}
function Q(e, t) {
if (e.length > t.maxStringLength) {
var r = e.length - t.maxStringLength, o = "... " + r + " more character" + (r > 1 ? "s" : "");
return Q(y.call(e, 0, t.maxStringLength), t) + o;
}
var n = L[t.quoteStyle || "single"];
return n.lastIndex = 0, D(h.call(h.call(e, n, "\\$1"), /[\x00-\x1f]/g, $), "single", t);
}
function $(e) {
var t = e.charCodeAt(0), r = {
8: "b",
9: "t",
10: "n",
12: "f",
13: "r"
}[t];
return r ? "\\" + r : "\\x" + (t < 16 ? "0" : "") + g.call(t.toString(16));
}
function J(e) {
return "Object(" + e + ")";
}
function Z(e) {
return e + " { ? }";
}
function ee(e, t, r, o) {
return e + " (" + t + ") {" + (o ? te(r, o) : S.call(r, ", ")) + "}";
}
function te(e, t) {
if (0 === e.length) return "";
var r = "\n" + t.prev + t.base;
return r + S.call(e, "," + r) + "\n" + t.prev;
}
function re(e, t) {
var r = K(e), o = [];
if (r) {
o.length = e.length;
for (var n = 0; n < e.length; n++) o[n] = q(e, n) ? t(e[n], e) : "";
}
var a, i = "function" == typeof x ? x(e) : [];
if (_) {
a = {};
for (var s = 0; s < i.length; s++) a["$" + i[s]] = i[s];
}
for (var c in e) q(e, c) && (r && String(Number(c)) === c && c < e.length || _ && a["$" + c] instanceof Symbol || (R.call(/[^\w$]/, c) ? o.push(t(c, e) + ": " + t(e[c], e)) : o.push(c + ": " + t(e[c], e))));
if ("function" == typeof x) for (var u = 0; u < i.length; u++) U.call(e, i[u]) && o.push("[" + t(i[u]) + "]: " + t(e[i[u]], e));
return o;
}
return B;
}

function xt() {
return j ? H : (j = 1, H = Object);
}

function Ot() {
return q ? Y : (q = 1, Y = Error);
}

function _t() {
return X ? z : (X = 1, z = EvalError);
}

function At() {
return $ ? Q : ($ = 1, Q = RangeError);
}

function Ut() {
return Z ? J : (Z = 1, J = ReferenceError);
}

function Nt() {
return te ? ee : (te = 1, ee = SyntaxError);
}

function Mt() {
return oe ? re : (oe = 1, re = URIError);
}

function kt() {
return ae ? ne : (ae = 1, ne = Math.abs);
}

function Pt() {
return se ? ie : (se = 1, ie = Math.floor);
}

function It() {
return ue ? ce : (ue = 1, ce = Math.max);
}

function Gt() {
return me ? le : (me = 1, le = Math.min);
}

function Lt() {
return de ? pe : (de = 1, pe = Math.pow);
}

function Dt() {
return ye ? fe : (ye = 1, fe = Math.round);
}

function Ft() {
return ge ? he : (ge = 1, he = Number.isNaN || function(e) {
return e != e;
});
}

function Bt() {
if (Re) return ve;
Re = 1;
var e = Ft();
return ve = function(t) {
return e(t) || 0 === t ? t : t < 0 ? -1 : 1;
};
}

function Wt() {
return Te ? Ee : (Te = 1, Ee = Object.getOwnPropertyDescriptor);
}

function Vt() {
if (Ce) return Se;
Ce = 1;
var e = Wt();
if (e) try {
e([], "length");
} catch (t) {
e = null;
}
return Se = e;
}

function Kt() {
if (be) return we;
be = 1;
var e = Object.defineProperty || !1;
if (e) try {
e({}, "a", {
value: 1
});
} catch (t) {
e = !1;
}
return we = e;
}

function Ht() {
if (Ae) return _e;
Ae = 1;
var e = "undefined" != typeof Symbol && Symbol, t = Oe ? xe : (Oe = 1, xe = function() {
if ("function" != typeof Symbol || "function" != typeof Object.getOwnPropertySymbols) return !1;
if ("symbol" == typeof Symbol.iterator) return !0;
var e = {}, t = Symbol("test"), r = Object(t);
if ("string" == typeof t) return !1;
if ("[object Symbol]" !== Object.prototype.toString.call(t)) return !1;
if ("[object Symbol]" !== Object.prototype.toString.call(r)) return !1;
for (var o in e[t] = 42, e) return !1;
if ("function" == typeof Object.keys && 0 !== Object.keys(e).length) return !1;
if ("function" == typeof Object.getOwnPropertyNames && 0 !== Object.getOwnPropertyNames(e).length) return !1;
var n = Object.getOwnPropertySymbols(e);
if (1 !== n.length || n[0] !== t) return !1;
if (!Object.prototype.propertyIsEnumerable.call(e, t)) return !1;
if ("function" == typeof Object.getOwnPropertyDescriptor) {
var a = Object.getOwnPropertyDescriptor(e, t);
if (42 !== a.value || !0 !== a.enumerable) return !1;
}
return !0;
});
return _e = function() {
return "function" == typeof e && "function" == typeof Symbol && "symbol" == typeof e("foo") && "symbol" == typeof Symbol("bar") && t();
};
}

function jt() {
return Ne ? Ue : (Ne = 1, Ue = "undefined" != typeof Reflect && Reflect.getPrototypeOf || null);
}

function Yt() {
return ke ? Me : (ke = 1, Me = xt().getPrototypeOf || null);
}

function qt() {
if (Ie) return Pe;
Ie = 1;
var e = Object.prototype.toString, t = Math.max, r = function(e, t) {
for (var r = [], o = 0; o < e.length; o += 1) r[o] = e[o];
for (var n = 0; n < t.length; n += 1) r[n + e.length] = t[n];
return r;
};
return Pe = function(o) {
var n = this;
if ("function" != typeof n || "[object Function]" !== e.apply(n)) throw new TypeError("Function.prototype.bind called on incompatible " + n);
for (var a, i = function(e) {
for (var t = [], r = 1, o = 0; r < e.length; r += 1, o += 1) t[o] = e[r];
return t;
}(arguments), s = t(0, n.length - i.length), c = [], u = 0; u < s; u++) c[u] = "$" + u;
if (a = Function("binder", "return function (" + function(e) {
for (var t = "", r = 0; r < e.length; r += 1) t += e[r], r + 1 < e.length && (t += ",");
return t;
}(c) + "){ return binder.apply(this,arguments); }")(function() {
if (this instanceof a) {
var e = n.apply(this, r(i, arguments));
return Object(e) === e ? e : this;
}
return n.apply(o, r(i, arguments));
}), n.prototype) {
var l = function() {};
l.prototype = n.prototype, a.prototype = new l, l.prototype = null;
}
return a;
}, Pe;
}

function zt() {
if (Le) return Ge;
Le = 1;
var e = qt();
return Ge = Function.prototype.bind || e;
}

function Xt() {
return Fe ? De : (Fe = 1, De = Function.prototype.call);
}

function Qt() {
return We ? Be : (We = 1, Be = Function.prototype.apply);
}

function $t() {
if (qe) return Ye;
qe = 1;
var e = zt(), t = F(), r = Xt(), o = function() {
if (je) return He;
je = 1;
var e = zt(), t = Qt(), r = Xt(), o = Ke ? Ve : (Ke = 1, Ve = "undefined" != typeof Reflect && Reflect && Reflect.apply);
return He = o || e.call(r, t);
}();
return Ye = function(n) {
if (n.length < 1 || "function" != typeof n[0]) throw new t("a function is required");
return o(e, r, n);
};
}

function Jt() {
if (Xe) return ze;
Xe = 1;
var e, t = $t(), r = Vt();
try {
e = [].__proto__ === Array.prototype;
} catch (e) {
if (!e || "object" != typeof e || !("code" in e) || "ERR_PROTO_ACCESS" !== e.code) throw e;
}
var o = !!e && r && r(Object.prototype, "__proto__"), n = Object, a = n.getPrototypeOf;
return ze = o && "function" == typeof o.get ? t([ o.get ]) : "function" == typeof a && function(e) {
return a(null == e ? e : n(e));
};
}

function Zt() {
if ($e) return Qe;
$e = 1;
var e = jt(), t = Yt(), r = Jt();
return Qe = e ? function(t) {
return e(t);
} : t ? function(e) {
if (!e || "object" != typeof e && "function" != typeof e) throw new TypeError("getProto: not an object");
return t(e);
} : r ? function(e) {
return r(e);
} : null;
}

function er() {
if (Ze) return Je;
Ze = 1;
var e = Function.prototype.call, t = Object.prototype.hasOwnProperty, r = zt();
return Je = r.call(e, t);
}

function tr() {
if (tt) return et;
var e;
tt = 1;
var t = xt(), r = Ot(), o = _t(), n = At(), a = Ut(), i = Nt(), s = F(), c = Mt(), u = kt(), l = Pt(), m = It(), p = Gt(), d = Lt(), f = Dt(), y = Bt(), h = Function, g = function(e) {
try {
return h('"use strict"; return (' + e + ").constructor;")();
} catch (e) {}
}, v = Vt(), R = Kt(), E = function() {
throw new s;
}, T = v ? function() {
try {
return E;
} catch (e) {
try {
return v(arguments, "callee").get;
} catch (e) {
return E;
}
}
}() : E, S = Ht()(), C = Zt(), w = Yt(), b = jt(), x = Qt(), O = Xt(), _ = {}, A = "undefined" != typeof Uint8Array && C ? C(Uint8Array) : e, U = {
__proto__: null,
"%AggregateError%": "undefined" == typeof AggregateError ? e : AggregateError,
"%Array%": Array,
"%ArrayBuffer%": "undefined" == typeof ArrayBuffer ? e : ArrayBuffer,
"%ArrayIteratorPrototype%": S && C ? C([][Symbol.iterator]()) : e,
"%AsyncFromSyncIteratorPrototype%": e,
"%AsyncFunction%": _,
"%AsyncGenerator%": _,
"%AsyncGeneratorFunction%": _,
"%AsyncIteratorPrototype%": _,
"%Atomics%": "undefined" == typeof Atomics ? e : Atomics,
"%BigInt%": "undefined" == typeof BigInt ? e : BigInt,
"%BigInt64Array%": "undefined" == typeof BigInt64Array ? e : BigInt64Array,
"%BigUint64Array%": "undefined" == typeof BigUint64Array ? e : BigUint64Array,
"%Boolean%": Boolean,
"%DataView%": "undefined" == typeof DataView ? e : DataView,
"%Date%": Date,
"%decodeURI%": decodeURI,
"%decodeURIComponent%": decodeURIComponent,
"%encodeURI%": encodeURI,
"%encodeURIComponent%": encodeURIComponent,
"%Error%": r,
"%eval%": eval,
"%EvalError%": o,
"%Float16Array%": "undefined" == typeof Float16Array ? e : Float16Array,
"%Float32Array%": "undefined" == typeof Float32Array ? e : Float32Array,
"%Float64Array%": "undefined" == typeof Float64Array ? e : Float64Array,
"%FinalizationRegistry%": "undefined" == typeof FinalizationRegistry ? e : FinalizationRegistry,
"%Function%": h,
"%GeneratorFunction%": _,
"%Int8Array%": "undefined" == typeof Int8Array ? e : Int8Array,
"%Int16Array%": "undefined" == typeof Int16Array ? e : Int16Array,
"%Int32Array%": "undefined" == typeof Int32Array ? e : Int32Array,
"%isFinite%": isFinite,
"%isNaN%": isNaN,
"%IteratorPrototype%": S && C ? C(C([][Symbol.iterator]())) : e,
"%JSON%": "object" == typeof JSON ? JSON : e,
"%Map%": "undefined" == typeof Map ? e : Map,
"%MapIteratorPrototype%": "undefined" != typeof Map && S && C ? C((new Map)[Symbol.iterator]()) : e,
"%Math%": Math,
"%Number%": Number,
"%Object%": t,
"%Object.getOwnPropertyDescriptor%": v,
"%parseFloat%": parseFloat,
"%parseInt%": parseInt,
"%Promise%": "undefined" == typeof Promise ? e : Promise,
"%Proxy%": "undefined" == typeof Proxy ? e : Proxy,
"%RangeError%": n,
"%ReferenceError%": a,
"%Reflect%": "undefined" == typeof Reflect ? e : Reflect,
"%RegExp%": RegExp,
"%Set%": "undefined" == typeof Set ? e : Set,
"%SetIteratorPrototype%": "undefined" != typeof Set && S && C ? C((new Set)[Symbol.iterator]()) : e,
"%SharedArrayBuffer%": "undefined" == typeof SharedArrayBuffer ? e : SharedArrayBuffer,
"%String%": String,
"%StringIteratorPrototype%": S && C ? C(""[Symbol.iterator]()) : e,
"%Symbol%": S ? Symbol : e,
"%SyntaxError%": i,
"%ThrowTypeError%": T,
"%TypedArray%": A,
"%TypeError%": s,
"%Uint8Array%": "undefined" == typeof Uint8Array ? e : Uint8Array,
"%Uint8ClampedArray%": "undefined" == typeof Uint8ClampedArray ? e : Uint8ClampedArray,
"%Uint16Array%": "undefined" == typeof Uint16Array ? e : Uint16Array,
"%Uint32Array%": "undefined" == typeof Uint32Array ? e : Uint32Array,
"%URIError%": c,
"%WeakMap%": "undefined" == typeof WeakMap ? e : WeakMap,
"%WeakRef%": "undefined" == typeof WeakRef ? e : WeakRef,
"%WeakSet%": "undefined" == typeof WeakSet ? e : WeakSet,
"%Function.prototype.call%": O,
"%Function.prototype.apply%": x,
"%Object.defineProperty%": R,
"%Object.getPrototypeOf%": w,
"%Math.abs%": u,
"%Math.floor%": l,
"%Math.max%": m,
"%Math.min%": p,
"%Math.pow%": d,
"%Math.round%": f,
"%Math.sign%": y,
"%Reflect.getPrototypeOf%": b
};
if (C) try {
null.error;
} catch (e) {
var N = C(C(e));
U["%Error.prototype%"] = N;
}
var M = function e(t) {
var r;
if ("%AsyncFunction%" === t) r = g("async function () {}"); else if ("%GeneratorFunction%" === t) r = g("function* () {}"); else if ("%AsyncGeneratorFunction%" === t) r = g("async function* () {}"); else if ("%AsyncGenerator%" === t) {
var o = e("%AsyncGeneratorFunction%");
o && (r = o.prototype);
} else if ("%AsyncIteratorPrototype%" === t) {
var n = e("%AsyncGenerator%");
n && C && (r = C(n.prototype));
}
return U[t] = r, r;
}, k = {
__proto__: null,
"%ArrayBufferPrototype%": [ "ArrayBuffer", "prototype" ],
"%ArrayPrototype%": [ "Array", "prototype" ],
"%ArrayProto_entries%": [ "Array", "prototype", "entries" ],
"%ArrayProto_forEach%": [ "Array", "prototype", "forEach" ],
"%ArrayProto_keys%": [ "Array", "prototype", "keys" ],
"%ArrayProto_values%": [ "Array", "prototype", "values" ],
"%AsyncFunctionPrototype%": [ "AsyncFunction", "prototype" ],
"%AsyncGenerator%": [ "AsyncGeneratorFunction", "prototype" ],
"%AsyncGeneratorPrototype%": [ "AsyncGeneratorFunction", "prototype", "prototype" ],
"%BooleanPrototype%": [ "Boolean", "prototype" ],
"%DataViewPrototype%": [ "DataView", "prototype" ],
"%DatePrototype%": [ "Date", "prototype" ],
"%ErrorPrototype%": [ "Error", "prototype" ],
"%EvalErrorPrototype%": [ "EvalError", "prototype" ],
"%Float32ArrayPrototype%": [ "Float32Array", "prototype" ],
"%Float64ArrayPrototype%": [ "Float64Array", "prototype" ],
"%FunctionPrototype%": [ "Function", "prototype" ],
"%Generator%": [ "GeneratorFunction", "prototype" ],
"%GeneratorPrototype%": [ "GeneratorFunction", "prototype", "prototype" ],
"%Int8ArrayPrototype%": [ "Int8Array", "prototype" ],
"%Int16ArrayPrototype%": [ "Int16Array", "prototype" ],
"%Int32ArrayPrototype%": [ "Int32Array", "prototype" ],
"%JSONParse%": [ "JSON", "parse" ],
"%JSONStringify%": [ "JSON", "stringify" ],
"%MapPrototype%": [ "Map", "prototype" ],
"%NumberPrototype%": [ "Number", "prototype" ],
"%ObjectPrototype%": [ "Object", "prototype" ],
"%ObjProto_toString%": [ "Object", "prototype", "toString" ],
"%ObjProto_valueOf%": [ "Object", "prototype", "valueOf" ],
"%PromisePrototype%": [ "Promise", "prototype" ],
"%PromiseProto_then%": [ "Promise", "prototype", "then" ],
"%Promise_all%": [ "Promise", "all" ],
"%Promise_reject%": [ "Promise", "reject" ],
"%Promise_resolve%": [ "Promise", "resolve" ],
"%RangeErrorPrototype%": [ "RangeError", "prototype" ],
"%ReferenceErrorPrototype%": [ "ReferenceError", "prototype" ],
"%RegExpPrototype%": [ "RegExp", "prototype" ],
"%SetPrototype%": [ "Set", "prototype" ],
"%SharedArrayBufferPrototype%": [ "SharedArrayBuffer", "prototype" ],
"%StringPrototype%": [ "String", "prototype" ],
"%SymbolPrototype%": [ "Symbol", "prototype" ],
"%SyntaxErrorPrototype%": [ "SyntaxError", "prototype" ],
"%TypedArrayPrototype%": [ "TypedArray", "prototype" ],
"%TypeErrorPrototype%": [ "TypeError", "prototype" ],
"%Uint8ArrayPrototype%": [ "Uint8Array", "prototype" ],
"%Uint8ClampedArrayPrototype%": [ "Uint8ClampedArray", "prototype" ],
"%Uint16ArrayPrototype%": [ "Uint16Array", "prototype" ],
"%Uint32ArrayPrototype%": [ "Uint32Array", "prototype" ],
"%URIErrorPrototype%": [ "URIError", "prototype" ],
"%WeakMapPrototype%": [ "WeakMap", "prototype" ],
"%WeakSetPrototype%": [ "WeakSet", "prototype" ]
}, P = zt(), I = er(), G = P.call(O, Array.prototype.concat), L = P.call(x, Array.prototype.splice), D = P.call(O, String.prototype.replace), B = P.call(O, String.prototype.slice), W = P.call(O, RegExp.prototype.exec), V = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, K = /\\(\\)?/g, H = function(e, t) {
var r, o = e;
if (I(k, o) && (o = "%" + (r = k[o])[0] + "%"), I(U, o)) {
var n = U[o];
if (n === _ && (n = M(o)), void 0 === n && !t) throw new s("intrinsic " + e + " exists, but is not available. Please file an issue!");
return {
alias: r,
name: o,
value: n
};
}
throw new i("intrinsic " + e + " does not exist!");
};
return et = function(e, t) {
if ("string" != typeof e || 0 === e.length) throw new s("intrinsic name must be a non-empty string");
if (arguments.length > 1 && "boolean" != typeof t) throw new s('"allowMissing" argument must be a boolean');
if (null === W(/^%?[^%]*%?$/, e)) throw new i("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
var r = function(e) {
var t = B(e, 0, 1), r = B(e, -1);
if ("%" === t && "%" !== r) throw new i("invalid intrinsic syntax, expected closing `%`");
if ("%" === r && "%" !== t) throw new i("invalid intrinsic syntax, expected opening `%`");
var o = [];
return D(e, V, function(e, t, r, n) {
o[o.length] = r ? D(n, K, "$1") : t || e;
}), o;
}(e), o = r.length > 0 ? r[0] : "", n = H("%" + o + "%", t), a = n.name, c = n.value, u = !1, l = n.alias;
l && (o = l[0], L(r, G([ 0, 1 ], l)));
for (var m = 1, p = !0; m < r.length; m += 1) {
var d = r[m], f = B(d, 0, 1), y = B(d, -1);
if (('"' === f || "'" === f || "`" === f || '"' === y || "'" === y || "`" === y) && f !== y) throw new i("property names with quotes must have matching quotes");
if ("constructor" !== d && p || (u = !0), I(U, a = "%" + (o += "." + d) + "%")) c = U[a]; else if (null != c) {
if (!(d in c)) {
if (!t) throw new s("base intrinsic for " + e + " exists, but the property is not available.");
return;
}
if (v && m + 1 >= r.length) {
var h = v(c, d);
c = (p = !!h) && "get" in h && !("originalValue" in h.get) ? h.get : c[d];
} else p = I(c, d), c = c[d];
p && !u && (U[a] = c);
}
}
return c;
}, et;
}

function rr() {
if (ot) return rt;
ot = 1;
var e = tr(), t = $t(), r = t([ e("%String.prototype.indexOf%") ]);
return rt = function(o, n) {
var a = e(o, !!n);
return "function" == typeof a && r(o, ".prototype.") > -1 ? t([ a ]) : a;
};
}

function or() {
if (at) return nt;
at = 1;
var e = tr(), t = rr(), r = bt(), o = F(), n = e("%Map%", !0), a = t("Map.prototype.get", !0), i = t("Map.prototype.set", !0), s = t("Map.prototype.has", !0), c = t("Map.prototype.delete", !0), u = t("Map.prototype.size", !0);
return nt = !!n && function() {
var e, t = {
assert: function(e) {
if (!t.has(e)) throw new o("Side channel does not contain " + r(e));
},
delete: function(t) {
if (e) {
var r = c(e, t);
return 0 === u(e) && (e = void 0), r;
}
return !1;
},
get: function(t) {
if (e) return a(e, t);
},
has: function(t) {
return !!e && s(e, t);
},
set: function(t, r) {
e || (e = new n), i(e, t, r);
}
};
return t;
};
}

function nr() {
if (mt) return lt;
mt = 1;
var e = String.prototype.replace, t = /%20/g, r = "RFC3986";
return lt = {
default: r,
formatters: {
RFC1738: function(r) {
return e.call(r, t, "+");
},
RFC3986: function(e) {
return String(e);
}
},
RFC1738: "RFC1738",
RFC3986: r
};
}

function ar() {
if (dt) return pt;
dt = 1;
var e = nr(), t = Object.prototype.hasOwnProperty, r = Array.isArray, o = function() {
for (var e = [], t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
return e;
}(), n = function(e, t) {
for (var r = t && t.plainObjects ? {
__proto__: null
} : {}, o = 0; o < e.length; ++o) void 0 !== e[o] && (r[o] = e[o]);
return r;
}, a = 1024;
return pt = {
arrayToObject: n,
assign: function(e, t) {
return Object.keys(t).reduce(function(e, r) {
return e[r] = t[r], e;
}, e);
},
combine: function(e, t) {
return [].concat(e, t);
},
compact: function(e) {
for (var t = [ {
obj: {
o: e
},
prop: "o"
} ], o = [], n = 0; n < t.length; ++n) for (var a = t[n], i = a.obj[a.prop], s = Object.keys(i), c = 0; c < s.length; ++c) {
var u = s[c], l = i[u];
"object" == typeof l && null !== l && -1 === o.indexOf(l) && (t.push({
obj: i,
prop: u
}), o.push(l));
}
return function(e) {
for (;e.length > 1; ) {
var t = e.pop(), o = t.obj[t.prop];
if (r(o)) {
for (var n = [], a = 0; a < o.length; ++a) void 0 !== o[a] && n.push(o[a]);
t.obj[t.prop] = n;
}
}
}(t), e;
},
decode: function(e, t, r) {
var o = e.replace(/\+/g, " ");
if ("iso-8859-1" === r) return o.replace(/%[0-9a-f]{2}/gi, unescape);
try {
return decodeURIComponent(o);
} catch (e) {
return o;
}
},
encode: function(t, r, n, i, s) {
if (0 === t.length) return t;
var c = t;
if ("symbol" == typeof t ? c = Symbol.prototype.toString.call(t) : "string" != typeof t && (c = String(t)), 
"iso-8859-1" === n) return escape(c).replace(/%u[0-9a-f]{4}/gi, function(e) {
return "%26%23" + parseInt(e.slice(2), 16) + "%3B";
});
for (var u = "", l = 0; l < c.length; l += a) {
for (var m = c.length >= a ? c.slice(l, l + a) : c, p = [], d = 0; d < m.length; ++d) {
var f = m.charCodeAt(d);
45 === f || 46 === f || 95 === f || 126 === f || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || s === e.RFC1738 && (40 === f || 41 === f) ? p[p.length] = m.charAt(d) : f < 128 ? p[p.length] = o[f] : f < 2048 ? p[p.length] = o[192 | f >> 6] + o[128 | 63 & f] : f < 55296 || f >= 57344 ? p[p.length] = o[224 | f >> 12] + o[128 | f >> 6 & 63] + o[128 | 63 & f] : (d += 1, 
f = 65536 + ((1023 & f) << 10 | 1023 & m.charCodeAt(d)), p[p.length] = o[240 | f >> 18] + o[128 | f >> 12 & 63] + o[128 | f >> 6 & 63] + o[128 | 63 & f]);
}
u += p.join("");
}
return u;
},
isBuffer: function(e) {
return !(!e || "object" != typeof e || !(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e)));
},
isRegExp: function(e) {
return "[object RegExp]" === Object.prototype.toString.call(e);
},
maybeMap: function(e, t) {
if (r(e)) {
for (var o = [], n = 0; n < e.length; n += 1) o.push(t(e[n]));
return o;
}
return t(e);
},
merge: function e(o, a, i) {
if (!a) return o;
if ("object" != typeof a && "function" != typeof a) {
if (r(o)) o.push(a); else {
if (!o || "object" != typeof o) return [ o, a ];
(i && (i.plainObjects || i.allowPrototypes) || !t.call(Object.prototype, a)) && (o[a] = !0);
}
return o;
}
if (!o || "object" != typeof o) return [ o ].concat(a);
var s = o;
return r(o) && !r(a) && (s = n(o, i)), r(o) && r(a) ? (a.forEach(function(r, n) {
if (t.call(o, n)) {
var a = o[n];
a && "object" == typeof a && r && "object" == typeof r ? o[n] = e(a, r, i) : o.push(r);
} else o[n] = r;
}), o) : Object.keys(a).reduce(function(r, o) {
var n = a[o];
return t.call(r, o) ? r[o] = e(r[o], n, i) : r[o] = n, r;
}, s);
}
};
}

function ir() {
if (yt) return ft;
yt = 1;
var e = function() {
if (ut) return ct;
ut = 1;
var e = F(), t = bt(), r = function() {
if (K) return V;
K = 1;
var e = bt(), t = F(), r = function(e, t, r) {
for (var o, n = e; null != (o = n.next); n = o) if (o.key === t) return n.next = o.next, 
r || (o.next = e.next, e.next = o), o;
};
return V = function() {
var o, n = {
assert: function(r) {
if (!n.has(r)) throw new t("Side channel does not contain " + e(r));
},
delete: function(e) {
var t = o && o.next, n = function(e, t) {
if (e) return r(e, t, !0);
}(o, e);
return n && t && t === n && (o = void 0), !!n;
},
get: function(e) {
return function(e, t) {
if (e) {
var o = r(e, t);
return o && o.value;
}
}(o, e);
},
has: function(e) {
return function(e, t) {
return !!e && !!r(e, t);
}(o, e);
},
set: function(e, t) {
o || (o = {
next: void 0
}), function(e, t, o) {
var n = r(e, t);
n ? n.value = o : e.next = {
key: t,
next: e.next,
value: o
};
}(o, e, t);
}
};
return n;
};
}(), o = or(), n = function() {
if (st) return it;
st = 1;
var e = tr(), t = rr(), r = bt(), o = or(), n = F(), a = e("%WeakMap%", !0), i = t("WeakMap.prototype.get", !0), s = t("WeakMap.prototype.set", !0), c = t("WeakMap.prototype.has", !0), u = t("WeakMap.prototype.delete", !0);
return it = a ? function() {
var e, t, l = {
assert: function(e) {
if (!l.has(e)) throw new n("Side channel does not contain " + r(e));
},
delete: function(r) {
if (a && r && ("object" == typeof r || "function" == typeof r)) {
if (e) return u(e, r);
} else if (o && t) return t.delete(r);
return !1;
},
get: function(r) {
return a && r && ("object" == typeof r || "function" == typeof r) && e ? i(e, r) : t && t.get(r);
},
has: function(r) {
return a && r && ("object" == typeof r || "function" == typeof r) && e ? c(e, r) : !!t && t.has(r);
},
set: function(r, n) {
a && r && ("object" == typeof r || "function" == typeof r) ? (e || (e = new a), 
s(e, r, n)) : o && (t || (t = o()), t.set(r, n));
}
};
return l;
} : o;
}(), a = n || o || r;
return ct = function() {
var r, o = {
assert: function(r) {
if (!o.has(r)) throw new e("Side channel does not contain " + t(r));
},
delete: function(e) {
return !!r && r.delete(e);
},
get: function(e) {
return r && r.get(e);
},
has: function(e) {
return !!r && r.has(e);
},
set: function(e, t) {
r || (r = a()), r.set(e, t);
}
};
return o;
};
}(), t = ar(), r = nr(), o = Object.prototype.hasOwnProperty, n = {
brackets: function(e) {
return e + "[]";
},
comma: "comma",
indices: function(e, t) {
return e + "[" + t + "]";
},
repeat: function(e) {
return e;
}
}, a = Array.isArray, i = Array.prototype.push, s = function(e, t) {
i.apply(e, a(t) ? t : [ t ]);
}, c = Date.prototype.toISOString, u = r.default, l = {
addQueryPrefix: !1,
allowDots: !1,
allowEmptyArrays: !1,
arrayFormat: "indices",
charset: "utf-8",
charsetSentinel: !1,
commaRoundTrip: !1,
delimiter: "&",
encode: !0,
encodeDotInKeys: !1,
encoder: t.encode,
encodeValuesOnly: !1,
filter: void 0,
format: u,
formatter: r.formatters[u],
indices: !1,
serializeDate: function(e) {
return c.call(e);
},
skipNulls: !1,
strictNullHandling: !1
}, m = {}, p = function r(o, n, i, c, u, p, d, f, y, h, g, v, R, E, T, S, C, w) {
for (var b, x = o, O = w, _ = 0, A = !1; void 0 !== (O = O.get(m)) && !A; ) {
var U = O.get(o);
if (_ += 1, void 0 !== U) {
if (U === _) throw new RangeError("Cyclic object value");
A = !0;
}
void 0 === O.get(m) && (_ = 0);
}
if ("function" == typeof h ? x = h(n, x) : x instanceof Date ? x = R(x) : "comma" === i && a(x) && (x = t.maybeMap(x, function(e) {
return e instanceof Date ? R(e) : e;
})), null === x) {
if (p) return y && !S ? y(n, l.encoder, C, "key", E) : n;
x = "";
}
if ("string" == typeof (b = x) || "number" == typeof b || "boolean" == typeof b || "symbol" == typeof b || "bigint" == typeof b || t.isBuffer(x)) return y ? [ T(S ? n : y(n, l.encoder, C, "key", E)) + "=" + T(y(x, l.encoder, C, "value", E)) ] : [ T(n) + "=" + T(String(x)) ];
var N, M = [];
if (void 0 === x) return M;
if ("comma" === i && a(x)) S && y && (x = t.maybeMap(x, y)), N = [ {
value: x.length > 0 ? x.join(",") || null : void 0
} ]; else if (a(h)) N = h; else {
var k = Object.keys(x);
N = g ? k.sort(g) : k;
}
var P = f ? String(n).replace(/\./g, "%2E") : String(n), I = c && a(x) && 1 === x.length ? P + "[]" : P;
if (u && a(x) && 0 === x.length) return I + "[]";
for (var G = 0; G < N.length; ++G) {
var L = N[G], D = "object" == typeof L && L && void 0 !== L.value ? L.value : x[L];
if (!d || null !== D) {
var F = v && f ? String(L).replace(/\./g, "%2E") : String(L), B = a(x) ? "function" == typeof i ? i(I, F) : I : I + (v ? "." + F : "[" + F + "]");
w.set(o, _);
var W = e();
W.set(m, w), s(M, r(D, B, i, c, u, p, d, f, "comma" === i && S && a(x) ? null : y, h, g, v, R, E, T, S, C, W));
}
}
return M;
};
return ft = function(t, i) {
var c, u = t, m = function(e) {
if (!e) return l;
if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
var t = e.charset || l.charset;
if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
var i = r.default;
if (void 0 !== e.format) {
if (!o.call(r.formatters, e.format)) throw new TypeError("Unknown format option provided.");
i = e.format;
}
var s, c = r.formatters[i], u = l.filter;
if (("function" == typeof e.filter || a(e.filter)) && (u = e.filter), s = e.arrayFormat in n ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : l.arrayFormat, 
"commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
var m = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || l.allowDots : !!e.allowDots;
return {
addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : l.addQueryPrefix,
allowDots: m,
allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : l.allowEmptyArrays,
arrayFormat: s,
charset: t,
charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : l.charsetSentinel,
commaRoundTrip: !!e.commaRoundTrip,
delimiter: void 0 === e.delimiter ? l.delimiter : e.delimiter,
encode: "boolean" == typeof e.encode ? e.encode : l.encode,
encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : l.encodeDotInKeys,
encoder: "function" == typeof e.encoder ? e.encoder : l.encoder,
encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : l.encodeValuesOnly,
filter: u,
format: i,
formatter: c,
serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : l.serializeDate,
skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : l.skipNulls,
sort: "function" == typeof e.sort ? e.sort : null,
strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : l.strictNullHandling
};
}(i);
"function" == typeof m.filter ? u = (0, m.filter)("", u) : a(m.filter) && (c = m.filter);
var d = [];
if ("object" != typeof u || null === u) return "";
var f = n[m.arrayFormat], y = "comma" === f && m.commaRoundTrip;
c || (c = Object.keys(u)), m.sort && c.sort(m.sort);
for (var h = e(), g = 0; g < c.length; ++g) {
var v = c[g], R = u[v];
m.skipNulls && null === R || s(d, p(R, v, f, y, m.allowEmptyArrays, m.strictNullHandling, m.skipNulls, m.encodeDotInKeys, m.encode ? m.encoder : null, m.filter, m.sort, m.allowDots, m.serializeDate, m.format, m.formatter, m.encodeValuesOnly, m.charset, h));
}
var E = d.join(m.delimiter), T = !0 === m.addQueryPrefix ? "?" : "";
return m.charsetSentinel && ("iso-8859-1" === m.charset ? T += "utf8=%26%2310003%3B&" : T += "utf8=%E2%9C%93&"), 
E.length > 0 ? T + E : "";
}, ft;
}

function sr() {
if (gt) return ht;
gt = 1;
var e = ar(), t = Object.prototype.hasOwnProperty, r = Array.isArray, o = {
allowDots: !1,
allowEmptyArrays: !1,
allowPrototypes: !1,
allowSparse: !1,
arrayLimit: 20,
charset: "utf-8",
charsetSentinel: !1,
comma: !1,
decodeDotInKeys: !1,
decoder: e.decode,
delimiter: "&",
depth: 5,
duplicates: "combine",
ignoreQueryPrefix: !1,
interpretNumericEntities: !1,
parameterLimit: 1e3,
parseArrays: !0,
plainObjects: !1,
strictDepth: !1,
strictNullHandling: !1,
throwOnLimitExceeded: !1
}, n = function(e) {
return e.replace(/&#(\d+);/g, function(e, t) {
return String.fromCharCode(parseInt(t, 10));
});
}, a = function(e, t, r) {
if (e && "string" == typeof e && t.comma && e.indexOf(",") > -1) return e.split(",");
if (t.throwOnLimitExceeded && r >= t.arrayLimit) throw new RangeError("Array limit exceeded. Only " + t.arrayLimit + " element" + (1 === t.arrayLimit ? "" : "s") + " allowed in an array.");
return e;
}, i = function(r, o, n, i) {
if (r) {
var s = n.allowDots ? r.replace(/\.([^.[]+)/g, "[$1]") : r, c = /(\[[^[\]]*])/g, u = n.depth > 0 && /(\[[^[\]]*])/.exec(s), l = u ? s.slice(0, u.index) : s, m = [];
if (l) {
if (!n.plainObjects && t.call(Object.prototype, l) && !n.allowPrototypes) return;
m.push(l);
}
for (var p = 0; n.depth > 0 && null !== (u = c.exec(s)) && p < n.depth; ) {
if (p += 1, !n.plainObjects && t.call(Object.prototype, u[1].slice(1, -1)) && !n.allowPrototypes) return;
m.push(u[1]);
}
if (u) {
if (!0 === n.strictDepth) throw new RangeError("Input depth exceeded depth option of " + n.depth + " and strictDepth is true");
m.push("[" + s.slice(u.index) + "]");
}
return function(t, r, o, n) {
var i = 0;
if (t.length > 0 && "[]" === t[t.length - 1]) {
var s = t.slice(0, -1).join("");
i = Array.isArray(r) && r[s] ? r[s].length : 0;
}
for (var c = n ? r : a(r, o, i), u = t.length - 1; u >= 0; --u) {
var l, m = t[u];
if ("[]" === m && o.parseArrays) l = o.allowEmptyArrays && ("" === c || o.strictNullHandling && null === c) ? [] : e.combine([], c); else {
l = o.plainObjects ? {
__proto__: null
} : {};
var p = "[" === m.charAt(0) && "]" === m.charAt(m.length - 1) ? m.slice(1, -1) : m, d = o.decodeDotInKeys ? p.replace(/%2E/g, ".") : p, f = parseInt(d, 10);
o.parseArrays || "" !== d ? !isNaN(f) && m !== d && String(f) === d && f >= 0 && o.parseArrays && f <= o.arrayLimit ? (l = [])[f] = c : "__proto__" !== d && (l[d] = c) : l = {
0: c
};
}
c = l;
}
return c;
}(m, o, n, i);
}
};
return ht = function(s, c) {
var u = function(t) {
if (!t) return o;
if (void 0 !== t.allowEmptyArrays && "boolean" != typeof t.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
if (void 0 !== t.decodeDotInKeys && "boolean" != typeof t.decodeDotInKeys) throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
if (null !== t.decoder && void 0 !== t.decoder && "function" != typeof t.decoder) throw new TypeError("Decoder has to be a function.");
if (void 0 !== t.charset && "utf-8" !== t.charset && "iso-8859-1" !== t.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
if (void 0 !== t.throwOnLimitExceeded && "boolean" != typeof t.throwOnLimitExceeded) throw new TypeError("`throwOnLimitExceeded` option must be a boolean");
var r = void 0 === t.charset ? o.charset : t.charset, n = void 0 === t.duplicates ? o.duplicates : t.duplicates;
if ("combine" !== n && "first" !== n && "last" !== n) throw new TypeError("The duplicates option must be either combine, first, or last");
return {
allowDots: void 0 === t.allowDots ? !0 === t.decodeDotInKeys || o.allowDots : !!t.allowDots,
allowEmptyArrays: "boolean" == typeof t.allowEmptyArrays ? !!t.allowEmptyArrays : o.allowEmptyArrays,
allowPrototypes: "boolean" == typeof t.allowPrototypes ? t.allowPrototypes : o.allowPrototypes,
allowSparse: "boolean" == typeof t.allowSparse ? t.allowSparse : o.allowSparse,
arrayLimit: "number" == typeof t.arrayLimit ? t.arrayLimit : o.arrayLimit,
charset: r,
charsetSentinel: "boolean" == typeof t.charsetSentinel ? t.charsetSentinel : o.charsetSentinel,
comma: "boolean" == typeof t.comma ? t.comma : o.comma,
decodeDotInKeys: "boolean" == typeof t.decodeDotInKeys ? t.decodeDotInKeys : o.decodeDotInKeys,
decoder: "function" == typeof t.decoder ? t.decoder : o.decoder,
delimiter: "string" == typeof t.delimiter || e.isRegExp(t.delimiter) ? t.delimiter : o.delimiter,
depth: "number" == typeof t.depth || !1 === t.depth ? +t.depth : o.depth,
duplicates: n,
ignoreQueryPrefix: !0 === t.ignoreQueryPrefix,
interpretNumericEntities: "boolean" == typeof t.interpretNumericEntities ? t.interpretNumericEntities : o.interpretNumericEntities,
parameterLimit: "number" == typeof t.parameterLimit ? t.parameterLimit : o.parameterLimit,
parseArrays: !1 !== t.parseArrays,
plainObjects: "boolean" == typeof t.plainObjects ? t.plainObjects : o.plainObjects,
strictDepth: "boolean" == typeof t.strictDepth ? !!t.strictDepth : o.strictDepth,
strictNullHandling: "boolean" == typeof t.strictNullHandling ? t.strictNullHandling : o.strictNullHandling,
throwOnLimitExceeded: "boolean" == typeof t.throwOnLimitExceeded && t.throwOnLimitExceeded
};
}(c);
if ("" === s || null == s) return u.plainObjects ? {
__proto__: null
} : {};
for (var l = "string" == typeof s ? function(i, s) {
var c = {
__proto__: null
}, u = s.ignoreQueryPrefix ? i.replace(/^\?/, "") : i;
u = u.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
var l = s.parameterLimit === 1 / 0 ? void 0 : s.parameterLimit, m = u.split(s.delimiter, s.throwOnLimitExceeded ? l + 1 : l);
if (s.throwOnLimitExceeded && m.length > l) throw new RangeError("Parameter limit exceeded. Only " + l + " parameter" + (1 === l ? "" : "s") + " allowed.");
var p, d = -1, f = s.charset;
if (s.charsetSentinel) for (p = 0; p < m.length; ++p) 0 === m[p].indexOf("utf8=") && ("utf8=%E2%9C%93" === m[p] ? f = "utf-8" : "utf8=%26%2310003%3B" === m[p] && (f = "iso-8859-1"), 
d = p, p = m.length);
for (p = 0; p < m.length; ++p) if (p !== d) {
var y, h, g = m[p], v = g.indexOf("]="), R = -1 === v ? g.indexOf("=") : v + 1;
-1 === R ? (y = s.decoder(g, o.decoder, f, "key"), h = s.strictNullHandling ? null : "") : (y = s.decoder(g.slice(0, R), o.decoder, f, "key"), 
h = e.maybeMap(a(g.slice(R + 1), s, r(c[y]) ? c[y].length : 0), function(e) {
return s.decoder(e, o.decoder, f, "value");
})), h && s.interpretNumericEntities && "iso-8859-1" === f && (h = n(String(h))), 
g.indexOf("[]=") > -1 && (h = r(h) ? [ h ] : h);
var E = t.call(c, y);
E && "combine" === s.duplicates ? c[y] = e.combine(c[y], h) : E && "last" !== s.duplicates || (c[y] = h);
}
return c;
}(s, u) : s, m = u.plainObjects ? {
__proto__: null
} : {}, p = Object.keys(l), d = 0; d < p.length; ++d) {
var f = p[d], y = i(f, l[f], u, "string" == typeof s);
m = e.merge(m, y, u);
}
return !0 === u.allowSparse ? m : e.compact(m);
};
}

function cr() {
if (Rt) return vt;
Rt = 1;
var e = ir(), t = sr();
return vt = {
formats: nr(),
parse: t,
stringify: e
};
}

function ur() {
return St || (St = 1, Tt = "function" == typeof URL ? URL : function() {
if (Et) return I;
Et = 1;
var e = D();
function t() {
this.protocol = null, this.slashes = null, this.auth = null, this.host = null, this.port = null, 
this.hostname = null, this.hash = null, this.search = null, this.query = null, this.pathname = null, 
this.path = null, this.href = null;
}
var r = /^([a-z0-9.+-]+:)/i, o = /:[0-9]*$/, n = /^(\/\/?(?!\/)[^?\s]*)(\?[^\s]*)?$/, a = [ "{", "}", "|", "\\", "^", "`" ].concat([ "<", ">", '"', "`", " ", "\r", "\n", "\t" ]), i = [ "'" ].concat(a), s = [ "%", "/", "?", ";", "#" ].concat(i), c = [ "/", "?", "#" ], u = /^[+a-z0-9A-Z_-]{0,63}$/, l = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, m = {
javascript: !0,
"javascript:": !0
}, p = {
javascript: !0,
"javascript:": !0
}, d = {
http: !0,
https: !0,
ftp: !0,
gopher: !0,
file: !0,
"http:": !0,
"https:": !0,
"ftp:": !0,
"gopher:": !0,
"file:": !0
}, f = cr();
function y(e, r, o) {
if (e && "object" == typeof e && e instanceof t) return e;
var n = new t;
return n.parse(e, r, o), n;
}
return t.prototype.parse = function(t, o, a) {
if ("string" != typeof t) throw new TypeError("Parameter 'url' must be a string, not " + typeof t);
var y = t.indexOf("?"), h = -1 !== y && y < t.indexOf("#") ? "?" : "#", g = t.split(h);
g[0] = g[0].replace(/\\/g, "/");
var v = t = g.join(h);
if (v = v.trim(), !a && 1 === t.split("#").length) {
var R = n.exec(v);
if (R) return this.path = v, this.href = v, this.pathname = R[1], R[2] ? (this.search = R[2], 
this.query = o ? f.parse(this.search.substr(1)) : this.search.substr(1)) : o && (this.search = "", 
this.query = {}), this;
}
var E = r.exec(v);
if (E) {
var T = (E = E[0]).toLowerCase();
this.protocol = T, v = v.substr(E.length);
}
if (a || E || v.match(/^\/\/[^@/]+@[^@/]+/)) {
var S = "//" === v.substr(0, 2);
!S || E && p[E] || (v = v.substr(2), this.slashes = !0);
}
if (!p[E] && (S || E && !d[E])) {
for (var C, w, b = -1, x = 0; x < c.length; x++) -1 !== (O = v.indexOf(c[x])) && (-1 === b || O < b) && (b = O);
for (-1 !== (w = -1 === b ? v.lastIndexOf("@") : v.lastIndexOf("@", b)) && (C = v.slice(0, w), 
v = v.slice(w + 1), this.auth = decodeURIComponent(C)), b = -1, x = 0; x < s.length; x++) {
var O;
-1 !== (O = v.indexOf(s[x])) && (-1 === b || O < b) && (b = O);
}
-1 === b && (b = v.length), this.host = v.slice(0, b), v = v.slice(b), this.parseHost(), 
this.hostname = this.hostname || "";
var _ = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];
if (!_) for (var A = this.hostname.split(/\./), U = (x = 0, A.length); x < U; x++) {
var N = A[x];
if (N && !N.match(u)) {
for (var M = "", k = 0, P = N.length; k < P; k++) N.charCodeAt(k) > 127 ? M += "x" : M += N[k];
if (!M.match(u)) {
var I = A.slice(0, x), G = A.slice(x + 1), L = N.match(l);
L && (I.push(L[1]), G.unshift(L[2])), G.length && (v = "/" + G.join(".") + v), this.hostname = I.join(".");
break;
}
}
}
this.hostname.length > 255 ? this.hostname = "" : this.hostname = this.hostname.toLowerCase(), 
_ || (this.hostname = e.toASCII(this.hostname));
var D = this.port ? ":" + this.port : "", F = this.hostname || "";
this.host = F + D, this.href += this.host, _ && (this.hostname = this.hostname.substr(1, this.hostname.length - 2), 
"/" !== v[0] && (v = "/" + v));
}
if (!m[T]) for (x = 0, U = i.length; x < U; x++) {
var B = i[x];
if (-1 !== v.indexOf(B)) {
var W = encodeURIComponent(B);
W === B && (W = escape(B)), v = v.split(B).join(W);
}
}
var V = v.indexOf("#");
-1 !== V && (this.hash = v.substr(V), v = v.slice(0, V));
var K = v.indexOf("?");
if (-1 !== K ? (this.search = v.substr(K), this.query = v.substr(K + 1), o && (this.query = f.parse(this.query)), 
v = v.slice(0, K)) : o && (this.search = "", this.query = {}), v && (this.pathname = v), 
d[T] && this.hostname && !this.pathname && (this.pathname = "/"), this.pathname || this.search) {
D = this.pathname || "";
var H = this.search || "";
this.path = D + H;
}
return this.href = this.format(), this;
}, t.prototype.format = function() {
var e = this.auth || "";
e && (e = (e = encodeURIComponent(e)).replace(/%3A/i, ":"), e += "@");
var t = this.protocol || "", r = this.pathname || "", o = this.hash || "", n = !1, a = "";
this.host ? n = e + this.host : this.hostname && (n = e + (-1 === this.hostname.indexOf(":") ? this.hostname : "[" + this.hostname + "]"), 
this.port && (n += ":" + this.port)), this.query && "object" == typeof this.query && Object.keys(this.query).length && (a = f.stringify(this.query, {
arrayFormat: "repeat",
addQueryPrefix: !1
}));
var i = this.search || a && "?" + a || "";
return t && ":" !== t.substr(-1) && (t += ":"), this.slashes || (!t || d[t]) && !1 !== n ? (n = "//" + (n || ""), 
r && "/" !== r.charAt(0) && (r = "/" + r)) : n || (n = ""), o && "#" !== o.charAt(0) && (o = "#" + o), 
i && "?" !== i.charAt(0) && (i = "?" + i), t + n + (r = r.replace(/[?#]/g, function(e) {
return encodeURIComponent(e);
})) + (i = i.replace("#", "%23")) + o;
}, t.prototype.resolve = function(e) {
return this.resolveObject(y(e, !1, !0)).format();
}, t.prototype.resolveObject = function(e) {
if ("string" == typeof e) {
var r = new t;
r.parse(e, !1, !0), e = r;
}
for (var o = new t, n = Object.keys(this), a = 0; a < n.length; a++) {
var i = n[a];
o[i] = this[i];
}
if (o.hash = e.hash, "" === e.href) return o.href = o.format(), o;
if (e.slashes && !e.protocol) {
for (var s = Object.keys(e), c = 0; c < s.length; c++) {
var u = s[c];
"protocol" !== u && (o[u] = e[u]);
}
return d[o.protocol] && o.hostname && !o.pathname && (o.pathname = "/", o.path = o.pathname), 
o.href = o.format(), o;
}
if (e.protocol && e.protocol !== o.protocol) {
if (!d[e.protocol]) {
for (var l = Object.keys(e), m = 0; m < l.length; m++) {
var f = l[m];
o[f] = e[f];
}
return o.href = o.format(), o;
}
if (o.protocol = e.protocol, e.host || p[e.protocol]) o.pathname = e.pathname; else {
for (var y = (e.pathname || "").split("/"); y.length && !(e.host = y.shift()); ) ;
e.host || (e.host = ""), e.hostname || (e.hostname = ""), "" !== y[0] && y.unshift(""), 
y.length < 2 && y.unshift(""), o.pathname = y.join("/");
}
if (o.search = e.search, o.query = e.query, o.host = e.host || "", o.auth = e.auth, 
o.hostname = e.hostname || e.host, o.port = e.port, o.pathname || o.search) {
var h = o.pathname || "", g = o.search || "";
o.path = h + g;
}
return o.slashes = o.slashes || e.slashes, o.href = o.format(), o;
}
var v = o.pathname && "/" === o.pathname.charAt(0), R = e.host || e.pathname && "/" === e.pathname.charAt(0), E = R || v || o.host && e.pathname, T = E, S = o.pathname && o.pathname.split("/") || [], C = (y = e.pathname && e.pathname.split("/") || [], 
o.protocol && !d[o.protocol]);
if (C && (o.hostname = "", o.port = null, o.host && ("" === S[0] ? S[0] = o.host : S.unshift(o.host)), 
o.host = "", e.protocol && (e.hostname = null, e.port = null, e.host && ("" === y[0] ? y[0] = e.host : y.unshift(e.host)), 
e.host = null), E = E && ("" === y[0] || "" === S[0])), R) o.host = e.host || "" === e.host ? e.host : o.host, 
o.hostname = e.hostname || "" === e.hostname ? e.hostname : o.hostname, o.search = e.search, 
o.query = e.query, S = y; else if (y.length) S || (S = []), S.pop(), S = S.concat(y), 
o.search = e.search, o.query = e.query; else if (null != e.search) return C && (o.host = S.shift(), 
o.hostname = o.host, (_ = !!(o.host && o.host.indexOf("@") > 0) && o.host.split("@")) && (o.auth = _.shift(), 
o.hostname = _.shift(), o.host = o.hostname)), o.search = e.search, o.query = e.query, 
null === o.pathname && null === o.search || (o.path = (o.pathname ? o.pathname : "") + (o.search ? o.search : "")), 
o.href = o.format(), o;
if (!S.length) return o.pathname = null, o.search ? o.path = "/" + o.search : o.path = null, 
o.href = o.format(), o;
for (var w = S.slice(-1)[0], b = (o.host || e.host || S.length > 1) && ("." === w || ".." === w) || "" === w, x = 0, O = S.length; O >= 0; O--) "." === (w = S[O]) ? S.splice(O, 1) : ".." === w ? (S.splice(O, 1), 
x++) : x && (S.splice(O, 1), x--);
if (!E && !T) for (;x--; x) S.unshift("..");
!E || "" === S[0] || S[0] && "/" === S[0].charAt(0) || S.unshift(""), b && "/" !== S.join("/").substr(-1) && S.push("");
var _, A = "" === S[0] || S[0] && "/" === S[0].charAt(0);
return C && (o.hostname = A ? "" : S.length ? S.shift() : "", o.host = o.hostname, 
(_ = !!(o.host && o.host.indexOf("@") > 0) && o.host.split("@")) && (o.auth = _.shift(), 
o.hostname = _.shift(), o.host = o.hostname)), (E = E || o.host && S.length) && !A && S.unshift(""), 
S.length > 0 ? o.pathname = S.join("/") : (o.pathname = null, o.path = null), null === o.pathname && null === o.search || (o.path = (o.pathname ? o.pathname : "") + (o.search ? o.search : "")), 
o.auth = e.auth || o.auth, o.slashes = o.slashes || e.slashes, o.href = o.format(), 
o;
}, t.prototype.parseHost = function() {
var e = this.host, t = o.exec(e);
t && (":" !== (t = t[0]) && (this.port = t.substr(1)), e = e.substr(0, e.length - t.length)), 
e && (this.hostname = e);
}, I.parse = y, I.resolve = function(e, t) {
return y(e, !1, !0).resolve(t);
}, I.resolveObject = function(e, t) {
return e ? y(e, !1, !0).resolveObject(t) : t;
}, I.format = function(e) {
return "string" == typeof e && (e = y(e)), e instanceof t ? e.format() : t.prototype.format.call(e);
}, I.Url = t, I;
}().URL), Tt;
}

function lr() {
if (Ct) return P;
Ct = 1;
const e = ur();
P.getArg = function(e, t, r) {
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
P.toSetString = t ? r : function(e) {
return o(e) ? "$" + e : e;
}, P.fromSetString = t ? r : function(e) {
return o(e) ? e.slice(1) : e;
}, P.compareByGeneratedPositionsInflated = function(e, t) {
let r = e.generatedLine - t.generatedLine;
return 0 !== r ? r : (r = e.generatedColumn - t.generatedColumn, 0 !== r ? r : (r = n(e.source, t.source), 
0 !== r ? r : (r = e.originalLine - t.originalLine, 0 !== r ? r : (r = e.originalColumn - t.originalColumn, 
0 !== r ? r : n(e.name, t.name)))));
}, P.parseSourceMapInput = function(e) {
return JSON.parse(e.replace(/^\)]}'[^\n]*\n/, ""));
};
const a = "http://host";
function i(t) {
return r => {
const o = l(r), n = c(r), a = new e(r, n);
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
const u = /^[A-Za-z0-9\+\-\.]+:/;
function l(e) {
return "/" === e[0] ? "/" === e[1] ? "scheme-relative" : "path-absolute" : u.test(e) ? "absolute" : "path-relative";
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
const r = l(t), o = l(e);
if (e = p(e), "absolute" === r) return s(t, void 0);
if ("absolute" === o) return s(t, e);
if ("scheme-relative" === r) return f(t);
if ("scheme-relative" === o) return s(t, s(e, a)).slice(5);
if ("path-absolute" === r) return f(t);
if ("path-absolute" === o) return s(t, s(e, a)).slice(11);
const n = c(t + e);
return m(n, s(t, s(e, n)));
}
return P.normalize = f, P.join = y, P.relative = function(t, r) {
const o = function(t, r) {
if (l(t) !== l(r)) return null;
const o = c(t + r), n = new e(t, o), a = new e(r, o);
try {
new e("", a.toString());
} catch (e) {
return null;
}
return a.protocol !== n.protocol || a.user !== n.user || a.password !== n.password || a.hostname !== n.hostname || a.port !== n.port ? null : m(n, a);
}(t, r);
return "string" == typeof o ? o : f(r);
}, P.computeSourceURL = function(e, t, r) {
e && "path-absolute" === l(t) && (t = t.replace(/^\//, ""));
let o = f(t || "");
return e && (o = y(e, o)), r && (o = y(d(r), o)), o;
}, P;
}

var mr, pr = {};

function dr() {
if (mr) return pr;
mr = 1;
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
return pr.ArraySet = e, pr;
}

var fr, yr, hr = {};

function gr() {
if (yr) return x;
yr = 1;
const e = U(), t = lr(), r = dr().ArraySet, o = function() {
if (fr) return hr;
fr = 1;
const e = lr();
return hr.MappingList = class {
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
}, hr;
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
const u = r.name;
null == u || c.has(u) || c.add(u);
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
let r, o, n, a, i = 0, s = 1, c = 0, u = 0, l = 0, m = 0, p = "";
const d = this._mappings.toArray();
for (let f = 0, y = d.length; f < y; f++) {
if (o = d[f], r = "", o.generatedLine !== s) for (i = 0; o.generatedLine !== s; ) r += ";", 
s++; else if (f > 0) {
if (!t.compareByGeneratedPositionsInflated(o, d[f - 1])) continue;
r += ",";
}
r += e.encode(o.generatedColumn - i), i = o.generatedColumn, null != o.source && (a = this._sources.indexOf(o.source), 
r += e.encode(a - m), m = a, r += e.encode(o.originalLine - 1 - u), u = o.originalLine - 1, 
r += e.encode(o.originalColumn - c), c = o.originalColumn, null != o.name && (n = this._names.indexOf(o.name), 
r += e.encode(n - l), l = n)), p += r;
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
return n.prototype._version = 3, x.SourceMapGenerator = n, x;
}

var vr, Rr = {}, Er = {};

function Tr() {
return vr || (vr = 1, function(e) {
function t(r, o, n, a, i, s) {
const c = Math.floor((o - r) / 2) + r, u = i(n, a[c], !0);
return 0 === u ? c : u > 0 ? o - c > 1 ? t(c, o, n, a, i, s) : s === e.LEAST_UPPER_BOUND ? o < a.length ? o : -1 : c : c - r > 1 ? t(r, c, n, a, i, s) : s == e.LEAST_UPPER_BOUND ? c : r < 0 ? -1 : r;
}
e.GREATEST_LOWER_BOUND = 1, e.LEAST_UPPER_BOUND = 2, e.search = function(r, o, n, a) {
if (0 === o.length) return -1;
let i = t(-1, o.length, r, o, n, a || e.GREATEST_LOWER_BOUND);
if (i < 0) return -1;
for (;i - 1 >= 0 && 0 === n(o[i], o[i - 1], !0); ) --i;
return i;
};
}(Er)), Er;
}

var Sr, Cr, wr, br, xr = {
exports: {}
};

function Or() {
if (Sr) return xr.exports;
Sr = 1;
let e = null;
return xr.exports = function() {
if ("string" == typeof e) return fetch(e).then(e => e.arrayBuffer());
if (e instanceof ArrayBuffer) return Promise.resolve(e);
throw new Error("You must provide the string URL or ArrayBuffer contents of lib/mappings.wasm by calling SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) before using SourceMapConsumer");
}, xr.exports.initialize = t => {
e = t;
}, xr.exports;
}

function _r() {
if (wr) return Cr;
wr = 1;
const e = Or();
function t() {
this.generatedLine = 0, this.generatedColumn = 0, this.lastGeneratedColumn = null, 
this.source = null, this.originalLine = null, this.originalColumn = null, this.name = null;
}
let r = null;
return Cr = function() {
if (r) return r;
const o = [];
return r = e().then(e => WebAssembly.instantiate(e, {
env: {
mapping_callback(e, r, n, a, i, s, c, u, l, m) {
const p = new t;
p.generatedLine = e + 1, p.generatedColumn = r, n && (p.lastGeneratedColumn = a - 1), 
i && (p.source = s, p.originalLine = c + 1, p.originalColumn = u, l && (p.name = m)), 
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

var Ar, Ur, Nr, Mr = {}, kr = (Ur || (Ur = 1, b.SourceMapGenerator = gr().SourceMapGenerator, 
b.SourceMapConsumer = function() {
if (br) return Rr;
br = 1;
const e = lr(), t = Tr(), r = dr().ArraySet;
U();
const o = Or(), n = _r(), a = Symbol("smcInternal");
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
i.LEAST_UPPER_BOUND = 2, Rr.SourceMapConsumer = i;
class s extends i {
constructor(t, o) {
return super(a).then(a => {
let i = t;
"string" == typeof t && (i = e.parseSourceMapInput(t));
const s = e.getArg(i, "version"), c = e.getArg(i, "sources").map(String), u = e.getArg(i, "names", []), l = e.getArg(i, "sourceRoot", null), m = e.getArg(i, "sourcesContent", null), p = e.getArg(i, "mappings"), d = e.getArg(i, "file", null), f = e.getArg(i, "x_google_ignoreList", null);
if (s != a._version) throw new Error("Unsupported version: " + s);
return a._sourceLookupCache = new Map, a._names = r.fromArray(u.map(String), !0), 
a._sources = r.fromArray(c, !0), a._absoluteSources = r.fromArray(a._sources.toArray().map(function(t) {
return e.computeSourceURL(l, t, o);
}), !0), a.sourceRoot = l, a.sourcesContent = m, a._mappings = p, a._sourceMapURL = o, 
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
s.prototype.consumer = i, Rr.BasicSourceMapConsumer = s;
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
return Rr.IndexedSourceMapConsumer = c, Rr;
}().SourceMapConsumer, b.SourceNode = function() {
if (Ar) return Mr;
Ar = 1;
const e = gr().SourceMapGenerator, t = lr(), r = /(\r?\n)/, o = "$$$isSourceNode$$$";
class n {
constructor(e, t, r, n, a) {
this.children = [], this.sourceContents = {}, this.line = null == e ? null : e, 
this.column = null == t ? null : t, this.source = null == r ? null : r, this.name = null == a ? null : a, 
this[o] = !0, null != n && this.add(n);
}
static fromStringWithSourceMap(e, o, a) {
const i = new n, s = e.split(r);
let c = 0;
const u = function() {
return e() + (e() || "");
function e() {
return c < s.length ? s[c++] : void 0;
}
};
let l, m = 1, p = 0, d = null;
return o.eachMapping(function(e) {
if (null !== d) {
if (!(m < e.generatedLine)) {
l = s[c] || "";
const t = l.substr(0, e.generatedColumn - p);
return s[c] = l.substr(e.generatedColumn - p), p = e.generatedColumn, f(d, t), void (d = e);
}
f(d, u()), m++, p = 0;
}
for (;m < e.generatedLine; ) i.add(u()), m++;
p < e.generatedColumn && (l = s[c] || "", i.add(l.substr(0, e.generatedColumn)), 
s[c] = l.substr(e.generatedColumn), p = e.generatedColumn), d = e;
}, this), c < s.length && (d && f(d, u()), i.add(s.splice(c).join(""))), o.sources.forEach(function(e) {
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
return Mr.SourceNode = n, Mr;
}().SourceNode), b);

!function(e) {
e[e.DEBUG = 0] = "DEBUG", e[e.INFO = 1] = "INFO", e[e.WARN = 2] = "WARN", e[e.ERROR = 3] = "ERROR", 
e[e.NONE = 4] = "NONE";
}(Nr || (Nr = {}));

var Pr = {
level: Nr.INFO,
cpuLogging: !1,
enableBatching: !0,
maxBatchSize: 50
}, Ir = l({}, Pr), Gr = [];

function Lr(e) {
Ir = l(l({}, Ir), e);
}

function Dr() {
return l({}, Ir);
}

function Fr(e) {
Ir.enableBatching ? (Gr.push(e), Gr.length >= Ir.maxBatchSize && Br()) : console.log(e);
}

function Br() {
0 !== Gr.length && (console.log(Gr.join("\n")), Gr = []);
}

var Wr = new Set([ "type", "level", "message", "tick", "subsystem", "room", "creep", "processId", "shard" ]);

function Vr(e, t, r, o) {
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
r.meta)) for (var a in r.meta) Wr.has(a) || (n[a] = r.meta[a]);
return JSON.stringify(n);
}

function Kr(e, t) {
Ir.level <= Nr.DEBUG && Fr(Vr("DEBUG", e, t));
}

function Hr(e, t) {
Ir.level <= Nr.INFO && Fr(Vr("INFO", e, t));
}

function jr(e, t) {
Ir.level <= Nr.WARN && Fr(Vr("WARN", e, t));
}

function Yr(e, t) {
Ir.level <= Nr.ERROR && Fr(Vr("ERROR", e, t));
}

function qr(e, t, r) {
if (!Ir.cpuLogging) return t();
var o = Game.cpu.getUsed(), n = t(), a = Game.cpu.getUsed() - o;
return Kr("".concat(e, ": ").concat(a.toFixed(3), " CPU"), r), n;
}

var zr = new Set([ "type", "key", "value", "tick", "unit", "subsystem", "room", "shard" ]);

function Xr(e, t, r, o) {
var n = {
type: "stat",
key: e,
value: t,
tick: "undefined" != typeof Game ? Game.time : 0,
shard: "undefined" != typeof Game && Game.shard ? Game.shard.name : "shard0"
};
if (r && (n.unit = r), o && (o.shard && (n.shard = o.shard), o.subsystem && (n.subsystem = o.subsystem), 
o.room && (n.room = o.room), o.meta)) for (var a in o.meta) zr.has(a) || (n[a] = o.meta[a]);
Fr(JSON.stringify(n));
}

function Qr(e) {
return {
debug: function(t, r) {
Kr(t, "string" == typeof r ? {
subsystem: e,
room: r
} : l({
subsystem: e
}, r));
},
info: function(t, r) {
Hr(t, "string" == typeof r ? {
subsystem: e,
room: r
} : l({
subsystem: e
}, r));
},
warn: function(t, r) {
jr(t, "string" == typeof r ? {
subsystem: e,
room: r
} : l({
subsystem: e
}, r));
},
error: function(t, r) {
Yr(t, "string" == typeof r ? {
subsystem: e,
room: r
} : l({
subsystem: e
}, r));
},
stat: function(t, r, o, n) {
Xr(t, r, o, "string" == typeof n ? {
subsystem: e,
room: n
} : l({
subsystem: e
}, n));
},
measureCpu: function(t, r, o) {
return qr(t, r, "string" == typeof o ? {
subsystem: e,
room: o
} : l({
subsystem: e
}, o));
}
};
}

var $r = {
debug: Kr,
info: Hr,
warn: jr,
error: Yr,
stat: Xr,
measureCpu: qr,
configure: Lr,
getConfig: Dr,
createLogger: Qr,
flush: Br
}, Jr = -1;

function Zr() {
var e = global;
return e._heapCache && e._heapCache.tick === Game.time || (e._heapCache ? e._heapCache.tick = Game.time : e._heapCache = {
tick: Game.time,
entries: new Map,
rehydrated: !1
}), e._heapCache;
}

function eo() {
return Memory._heapCache || (Memory._heapCache = {
version: 1,
lastSync: Game.time,
data: {}
}), Memory._heapCache;
}

var to = function() {
function e() {
this.lastPersistenceTick = 0;
}
return e.prototype.initialize = function() {
var e = Zr();
e.rehydrated || (this.rehydrateFromMemory(), e.rehydrated = !0);
}, e.prototype.rehydrateFromMemory = function() {
var e, t, r = Zr(), o = eo(), n = 0, a = 0;
try {
for (var i = p(Object.entries(o.data)), s = i.next(); !s.done; s = i.next()) {
var c = d(s.value, 2), u = c[0], l = c[1];
void 0 !== l.ttl && l.ttl !== Jr && Game.time - l.lastModified > l.ttl ? a++ : (r.entries.set(u, {
value: l.value,
lastModified: l.lastModified,
dirty: !1,
ttl: l.ttl
}), n++);
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
n > 0 && Game.time % 100 == 0 && $r.info("Rehydrated ".concat(n, " entries from Memory"), {
subsystem: "HeapCache",
meta: {
rehydratedCount: n,
expiredCount: a
}
});
}, e.prototype.get = function(e) {
var t = Zr(), r = t.entries.get(e);
if (r) return void 0 !== r.ttl && r.ttl !== Jr && Game.time - r.lastModified > r.ttl ? void t.entries.delete(e) : r.value;
var o = eo(), n = o.data[e];
return n ? void 0 !== n.ttl && n.ttl !== Jr && Game.time - n.lastModified > n.ttl ? void delete o.data[e] : (t.entries.set(e, {
value: n.value,
lastModified: n.lastModified,
dirty: !1,
ttl: n.ttl
}), n.value) : void 0;
}, e.prototype.set = function(e, t, r) {
Zr().entries.set(e, {
value: t,
lastModified: Game.time,
dirty: !0,
ttl: null != r ? r : 1e3
});
}, e.prototype.delete = function(e) {
Zr().entries.delete(e), delete eo().data[e];
}, e.prototype.has = function(e) {
return void 0 !== this.get(e);
}, e.prototype.clear = function() {
Zr().entries.clear(), eo().data = {};
}, e.prototype.persist = function(e) {
var t, r;
if (void 0 === e && (e = !1), !e && Game.time - this.lastPersistenceTick < 10) return 0;
var o = Zr(), n = eo(), a = 0;
try {
for (var i = p(o.entries), s = i.next(); !s.done; s = i.next()) {
var c = d(s.value, 2), u = c[0], l = c[1];
l.dirty && (n.data[u] = {
value: l.value,
lastModified: l.lastModified,
ttl: l.ttl
}, l.dirty = !1, a++);
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
return n.lastSync = Game.time, this.lastPersistenceTick = Game.time, a;
}, e.prototype.getStats = function() {
var e, t, r = Zr(), o = eo(), n = 0;
try {
for (var a = p(r.entries.values()), i = a.next(); !i.done; i = a.next()) i.value.dirty && n++;
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
return {
heapSize: r.entries.size,
memorySize: Object.keys(o.data).length,
dirtyEntries: n,
lastSync: o.lastSync
};
}, e.prototype.keys = function() {
var e = Zr();
return Array.from(e.entries.keys());
}, e.prototype.values = function() {
var e = Zr();
return Array.from(e.entries.values()).map(function(e) {
return e.value;
});
}, e.prototype.cleanExpired = function() {
var e, t, r, o, n = Zr(), a = eo(), i = 0;
try {
for (var s = p(n.entries), c = s.next(); !c.done; c = s.next()) {
var u = d(c.value, 2), l = u[0], m = u[1];
void 0 !== m.ttl && m.ttl !== Jr && Game.time - m.lastModified > m.ttl && (n.entries.delete(l), 
i++);
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
for (var f = p(Object.entries(a.data)), y = f.next(); !y.done; y = f.next()) {
var h = d(y.value, 2), g = (l = h[0], h[1]);
void 0 !== g.ttl && g.ttl !== Jr && Game.time - g.lastModified > g.ttl && (delete a.data[l], 
i++);
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
return i;
}, e;
}(), ro = new to, oo = "errorMapper_sourceMapAvailable";

function no(e) {
return null == e ? "" : String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

var ao, io = function() {
function e() {}
return Object.defineProperty(e, "consumer", {
get: function() {
var e;
if (void 0 === this._consumer) {
if (!1 === ro.get(oo)) return this._consumer = null, this._sourceMapAvailable = !1, 
null;
try {
var t = ro.get("errorMapper_sourceMapData");
if (!t) return this._consumer = null, this._sourceMapAvailable = !1, ro.set(oo, !1, 1 / 0), 
null;
try {
this._consumer = new kr.SourceMapConsumer(t), this._sourceMapAvailable = !0, ro.set(oo, !0, 1 / 0);
} catch (e) {
console.log("SourceMapConsumer requires async initialization - source maps disabled"), 
this._consumer = null, this._sourceMapAvailable = !1, ro.set(oo, !1, 1 / 0);
}
} catch (e) {
this._consumer = null, this._sourceMapAvailable = !1, ro.set(oo, !1, 1 / 0);
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
"sim" in Game.rooms ? console.log("<span style='color:red'>".concat("Source maps don't work in the simulator - displaying original error", "<br>").concat(no(e.stack), "</span>")) : console.log("<span style='color:red'>".concat(no(t.sourceMappedStackTrace(e)), "</span>"));
}
};
}, e.cache = {}, e;
}(), so = [], co = function() {
function e() {
this.commands = new Map, this.initialized = !1, this.lazyLoadEnabled = !1, this.commandsRegistered = !1, 
this.commandsExposed = !1;
}
return e.prototype.register = function(e, t) {
var r;
this.commands.has(e.name) && $r.warn('Command "'.concat(e.name, '" is already registered, overwriting'), {
subsystem: "CommandRegistry"
}), this.commands.set(e.name, {
metadata: l(l({}, e), {
category: null !== (r = e.category) && void 0 !== r ? r : "General"
}),
handler: t
}), $r.debug('Registered command "'.concat(e.name, '"'), {
subsystem: "CommandRegistry"
});
}, e.prototype.unregister = function(e) {
var t = this.commands.delete(e);
return t && $r.debug('Unregistered command "'.concat(e, '"'), {
subsystem: "CommandRegistry"
}), t;
}, e.prototype.getCommand = function(e) {
return this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad(), 
this.commands.get(e);
}, e.prototype.getCommands = function() {
return this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad(), 
Array.from(this.commands.values());
}, e.prototype.getCommandsByCategory = function() {
var e, t, r, o, n, a;
this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad();
var i = new Map;
try {
for (var s = p(this.commands.values()), c = s.next(); !c.done; c = s.next()) {
var u = c.value, l = null !== (n = u.metadata.category) && void 0 !== n ? n : "General", m = null !== (a = i.get(l)) && void 0 !== a ? a : [];
m.push(u), i.set(l, m);
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
for (var f = p(i), y = f.next(); !y.done; y = f.next()) {
var h = d(y.value, 2), g = (l = h[0], h[1]);
i.set(l, g.sort(function(e, t) {
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
return i;
}, e.prototype.execute = function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad();
var o = this.commands.get(e);
if (!o) return 'Command "'.concat(e, '" not found. Use help() to see available commands.');
try {
return o.handler.apply(o, f([], d(t), !1));
} catch (t) {
var n = t instanceof Error ? t.message : String(t);
return $r.error('Error executing command "'.concat(e, '": ').concat(n), {
subsystem: "CommandRegistry"
}), "Error: ".concat(n);
}
}, e.prototype.generateHelp = function() {
var e, t, r, o, n, a, i, s = this.getCommandsByCategory(), c = [ "=== Available Console Commands ===", "" ], u = Array.from(s.keys()).sort(function(e, t) {
return "General" === e ? -1 : "General" === t ? 1 : e.localeCompare(t);
});
try {
for (var l = p(u), m = l.next(); !m.done; m = l.next()) {
var d = m.value, f = s.get(d);
if (f && 0 !== f.length) {
c.push("--- ".concat(d, " ---"));
try {
for (var y = (r = void 0, p(f)), h = y.next(); !h.done; h = y.next()) {
var g = h.value, v = null !== (i = g.metadata.usage) && void 0 !== i ? i : "".concat(g.metadata.name, "()");
if (c.push("  ".concat(v)), c.push("    ".concat(g.metadata.description)), g.metadata.examples && g.metadata.examples.length > 0) {
c.push("    Examples:");
try {
for (var R = (n = void 0, p(g.metadata.examples)), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
c.push("      ".concat(T));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
E && !E.done && (a = R.return) && a.call(R);
} finally {
if (n) throw n.error;
}
}
}
c.push("");
}
} catch (e) {
r = {
error: e
};
} finally {
try {
h && !h.done && (o = y.return) && o.call(y);
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
m && !m.done && (t = l.return) && t.call(l);
} finally {
if (e) throw e.error;
}
}
return c.join("\n");
}, e.prototype.generateCommandHelp = function(e) {
var t, r, o, n;
this.lazyLoadEnabled && !this.commandsRegistered && this.triggerLazyLoad();
var a = this.commands.get(e);
if (!a) return 'Command "'.concat(e, '" not found. Use help() to see available commands.');
var i = [ "=== ".concat(a.metadata.name, " ==="), "", "Description: ".concat(a.metadata.description), "Usage: ".concat(null !== (o = a.metadata.usage) && void 0 !== o ? o : "".concat(a.metadata.name, "()")), "Category: ".concat(null !== (n = a.metadata.category) && void 0 !== n ? n : "General") ];
if (a.metadata.examples && a.metadata.examples.length > 0) {
i.push(""), i.push("Examples:");
try {
for (var s = p(a.metadata.examples), c = s.next(); !c.done; c = s.next()) {
var u = c.value;
i.push("  ".concat(u));
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
return i.join("\n");
}, e.prototype.exposeToGlobal = function() {
var e, t, r = this, o = global;
if (!this.commandsExposed || this.lazyLoadEnabled && this.commandsRegistered) {
try {
for (var n = p(this.commands), a = n.next(); !a.done; a = n.next()) {
var i = d(a.value, 2), s = i[0], c = i[1];
o[s] = c.handler;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
this.commandsExposed = !0, $r.debug("Exposed ".concat(this.commands.size, " commands to global scope"), {
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
}), this.initialized = !0, $r.info("Command registry initialized", {
subsystem: "CommandRegistry"
}));
}, e.prototype.enableLazyLoading = function(e) {
this.lazyLoadEnabled = !0, this.registrationCallback = e, $r.info("Console commands lazy loading enabled", {
subsystem: "CommandRegistry"
});
}, e.prototype.triggerLazyLoad = function() {
!this.commandsRegistered && this.registrationCallback && ($r.debug("Lazy loading console commands on first access", {
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
}(), uo = new co;

function lo(e) {
return function(t, r, o) {
so.push({
metadata: e,
methodName: String(r),
target: t
});
};
}

function mo(e) {
var t, r, o = Object.getPrototypeOf(e);
try {
for (var n = p(so), a = n.next(); !a.done; a = n.next()) {
var i = a.value;
if (po(i.target, o)) {
var s = e[i.methodName];
if ("function" == typeof s) {
var c = s.bind(e);
uo.register(i.metadata, c), $r.debug('Registered decorated command "'.concat(i.metadata.name, '"'), {
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
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}

function po(e, t) {
return null !== t && (e === t || Object.getPrototypeOf(e) === t || e === Object.getPrototypeOf(t));
}

!function(e) {
e[e.CRITICAL = 100] = "CRITICAL", e[e.HIGH = 75] = "HIGH", e[e.NORMAL = 50] = "NORMAL", 
e[e.LOW = 25] = "LOW", e[e.BACKGROUND = 10] = "BACKGROUND";
}(ao || (ao = {}));

var fo, yo, ho = {
"hostile.detected": ao.CRITICAL,
"nuke.detected": ao.CRITICAL,
"safemode.activated": ao.CRITICAL,
"structure.destroyed": ao.HIGH,
"hostile.cleared": ao.HIGH,
"creep.died": ao.HIGH,
"energy.critical": ao.HIGH,
"spawn.emergency": ao.HIGH,
"posture.change": ao.HIGH,
"spawn.completed": ao.NORMAL,
"rcl.upgrade": ao.NORMAL,
"construction.complete": ao.NORMAL,
"remote.lost": ao.NORMAL,
"squad.formed": ao.NORMAL,
"squad.dissolved": ao.NORMAL,
"market.transaction": ao.LOW,
"pheromone.update": ao.LOW,
"cluster.update": ao.LOW,
"expansion.candidate": ao.LOW,
"powerbank.discovered": ao.LOW,
"cpu.spike": ao.BACKGROUND,
"bucket.modeChange": ao.BACKGROUND
}, go = {
maxEventsPerTick: 50,
maxQueueSize: 200,
lowBucketThreshold: 2e3,
criticalBucketThreshold: 1e3,
maxEventAge: 100,
enableLogging: !1,
statsLogInterval: 100,
enableCoalescing: !0
}, vo = function() {
function e(e) {
void 0 === e && (e = {}), this.handlers = new Map, this.eventQueue = [], this.handlerIdCounter = 0, 
this.stats = {
eventsEmitted: 0,
eventsProcessed: 0,
eventsDeferred: 0,
eventsDropped: 0,
handlersInvoked: 0,
eventsCoalesced: 0
}, this.tickEvents = new Map, this.config = l(l({}, go), e);
}
return e.prototype.on = function(e, t, r) {
var o, n, a, i, s = this;
void 0 === r && (r = {});
var c = {
handler: t,
priority: null !== (o = r.priority) && void 0 !== o ? o : ao.NORMAL,
minBucket: null !== (n = r.minBucket) && void 0 !== n ? n : 0,
once: null !== (a = r.once) && void 0 !== a && a,
id: "handler_".concat(++this.handlerIdCounter)
}, u = null !== (i = this.handlers.get(e)) && void 0 !== i ? i : [];
return u.push(c), u.sort(function(e, t) {
return t.priority - e.priority;
}), this.handlers.set(e, u), this.config.enableLogging && $r.debug('EventBus: Registered handler for "'.concat(e, '" (id: ').concat(c.id, ")"), {
subsystem: "EventBus"
}), function() {
return s.off(e, c.id);
};
}, e.prototype.once = function(e, t, r) {
return void 0 === r && (r = {}), this.on(e, t, l(l({}, r), {
once: !0
}));
}, e.prototype.off = function(e, t) {
var r = this.handlers.get(e);
if (r) {
var o = r.findIndex(function(e) {
return e.id === t;
});
-1 !== o && (r.splice(o, 1), this.config.enableLogging && $r.debug('EventBus: Unregistered handler "'.concat(t, '" from "').concat(e, '"'), {
subsystem: "EventBus"
}));
}
}, e.prototype.offAll = function(e) {
this.handlers.delete(e), this.config.enableLogging && $r.debug('EventBus: Removed all handlers for "'.concat(e, '"'), {
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
var o, n, a, i;
void 0 === r && (r = {});
var s = l(l({}, t), {
tick: Game.time
}), c = null !== (n = null !== (o = r.priority) && void 0 !== o ? o : ho[e]) && void 0 !== n ? n : ao.NORMAL, u = null !== (a = r.immediate) && void 0 !== a ? a : c >= ao.CRITICAL, m = null === (i = r.allowCoalescing) || void 0 === i || i;
if (this.config.enableCoalescing && m && !u) {
var p = this.getCoalescingKey(e, s), d = this.tickEvents.get(p);
if (d) return d.count++, this.stats.eventsCoalesced++, void (this.config.enableLogging && $r.debug('EventBus: Coalesced "'.concat(e, '" (count: ').concat(d.count, ")"), {
subsystem: "EventBus"
}));
this.tickEvents.set(p, {
name: e,
payload: s,
priority: c,
count: 1
});
}
this.stats.eventsEmitted++, this.config.enableLogging && $r.debug('EventBus: Emitting "'.concat(e, '" (priority: ').concat(c, ", immediate: ").concat(String(u), ")"), {
subsystem: "EventBus"
});
var f = Game.cpu.bucket;
u || f >= this.config.lowBucketThreshold ? this.processEvent(e, s) : f >= this.config.criticalBucketThreshold ? this.queueEvent(e, s, c) : c >= ao.CRITICAL ? this.processEvent(e, s) : (this.stats.eventsDropped++, 
this.config.enableLogging && $r.warn('EventBus: Dropped event "'.concat(e, '" due to critical bucket'), {
subsystem: "EventBus"
}));
}, e.prototype.processEvent = function(e, t) {
var r, o, n, a, i = this.handlers.get(e);
if (i && 0 !== i.length) {
var s = Game.cpu.bucket, c = [];
try {
for (var u = p(i), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
if (!(s < m.minBucket)) try {
m.handler(t), this.stats.handlersInvoked++, m.once && c.push(m.id);
} catch (t) {
var d = t instanceof Error ? t.message : String(t);
$r.error('EventBus: Handler error for "'.concat(e, '": ').concat(d), {
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
l && !l.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
try {
for (var f = p(c), y = f.next(); !y.done; y = f.next()) {
var h = y.value;
this.off(e, h);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
y && !y.done && (a = f.return) && a.call(f);
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
return e.event.priority < ao.HIGH;
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
for (var o = p(this.handlers.values()), n = o.next(); !n.done; n = o.next()) r += n.value.length;
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
return l(l({}, this.stats), {
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
return l({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = l(l({}, this.config), e);
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
$r.debug("EventBus stats: ".concat(e.eventsEmitted, " emitted, ").concat(e.eventsProcessed, " processed, ") + "".concat(e.eventsDeferred, " deferred, ").concat(e.eventsDropped, " dropped, ") + "".concat(e.eventsCoalesced, " coalesced, ") + "".concat(e.queueSize, " queued, ").concat(e.handlerCount, " handlers"), {
subsystem: "EventBus"
});
}
}, e;
}(), Ro = new vo, Eo = {
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
bodyCosts: (fo = {}, fo[MOVE] = 50, fo[WORK] = 100, fo[CARRY] = 50, fo[ATTACK] = 80, 
fo[RANGED_ATTACK] = 150, fo[HEAL] = 250, fo[CLAIM] = 600, fo[TOUGH] = 10, fo),
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
}, To = l({}, Eo);

function So() {
return To;
}

function Co(e) {
To = l(l({}, To), e);
}

!function(e) {
e[e.CRITICAL = 100] = "CRITICAL", e[e.HIGH = 75] = "HIGH", e[e.MEDIUM = 50] = "MEDIUM", 
e[e.LOW = 25] = "LOW", e[e.IDLE = 10] = "IDLE";
}(yo || (yo = {}));

var wo = {
targetCpuUsage: .98,
reservedCpuFraction: .02,
enableStats: !0,
statsLogInterval: 100,
budgetWarningThreshold: 1.5,
budgetWarningInterval: 500,
enableAdaptiveBudgets: !0,
adaptiveBudgetConfig: e.DEFAULT_ADAPTIVE_CONFIG
};

function bo(e) {
var t, r, o = e.bucketThresholds.highMode, n = e.bucketThresholds.lowMode, a = function(e) {
return Math.max(0, Math.floor(e / 2));
}(n), i = (t = e.taskFrequencies, {
high: 1,
medium: Math.max(1, Math.min(t.clusterLogic, t.pheromoneUpdate)),
low: Math.max(t.marketScan, t.nukeEvaluation, t.memoryCleanup)
}), s = (e.bucketThresholds, {
high: 0,
medium: 0,
low: 0
}), c = {
high: (r = e.budgets).rooms,
medium: r.strategic,
low: Math.max(r.market, r.visualization)
};
return l(l({}, wo), {
lowBucketThreshold: n,
highBucketThreshold: o,
criticalBucketThreshold: a,
frequencyIntervals: i,
frequencyMinBucket: s,
frequencyCpuBudgets: c
});
}

var xo, Oo = function() {
function t(e) {
this.processes = new Map, this.bucketMode = "normal", this.tickCpuUsed = 0, this.initialized = !1, 
this.lastExecutedProcessId = null, this.lastExecutedIndex = -1, this.processQueue = [], 
this.queueDirty = !0, this.skippedProcessesThisTick = 0, this.config = l({}, e), 
this.validateConfig(), this.frequencyDefaults = this.buildFrequencyDefaults();
}
return t.prototype.registerProcess = function(e) {
var t, r, o, n, a, i = null !== (t = e.frequency) && void 0 !== t ? t : "medium", s = this.frequencyDefaults[i];
if (void 0 !== e.tickModulo) {
if (e.tickModulo < 0) throw $r.error('Kernel: Cannot register process "'.concat(e.name, '" - tickModulo must be non-negative (got ').concat(e.tickModulo, ")"), {
subsystem: "Kernel"
}), new Error("Invalid tickModulo: ".concat(e.tickModulo, " (must be >= 0)"));
if (void 0 !== e.tickOffset && e.tickOffset >= e.tickModulo) throw $r.error('Kernel: Cannot register process "'.concat(e.name, '" - tickOffset (').concat(e.tickOffset, ") must be less than tickModulo (").concat(e.tickModulo, ")"), {
subsystem: "Kernel"
}), new Error("Invalid tickOffset: ".concat(e.tickOffset, " (must be < tickModulo ").concat(e.tickModulo, ")"));
}
var c = null !== (r = e.interval) && void 0 !== r ? r : s.interval, u = Math.floor(.1 * c), l = Math.floor(Math.random() * (2 * u + 1)) - u, m = Math.max(1, c + l), p = {
id: e.id,
name: e.name,
priority: null !== (o = e.priority) && void 0 !== o ? o : yo.MEDIUM,
frequency: i,
minBucket: null !== (n = e.minBucket) && void 0 !== n ? n : s.minBucket,
cpuBudget: null !== (a = e.cpuBudget) && void 0 !== a ? a : s.cpuBudget,
interval: m,
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
suspensionReason: null
}
};
this.processes.set(e.id, p), this.queueDirty = !0, $r.debug('Kernel: Registered process "'.concat(p.name, '" (').concat(p.id, ") with interval ").concat(m, " (base: ").concat(c, ", jitter: ").concat(l > 0 ? "+" : "").concat(l, ")"), {
subsystem: "Kernel"
});
}, t.prototype.unregisterProcess = function(e) {
var t = this.processes.delete(e);
return t && (this.queueDirty = !0, $r.debug("Kernel: Unregistered process ".concat(e), {
subsystem: "Kernel"
})), t;
}, t.prototype.getProcess = function(e) {
return this.processes.get(e);
}, t.prototype.getProcesses = function() {
return Array.from(this.processes.values());
}, t.prototype.initialize = function() {
this.initialized || ($r.info("Kernel initialized with ".concat(this.processes.size, " processes"), {
subsystem: "Kernel"
}), this.initialized = !0);
}, t.prototype.updateBucketMode = function() {
var e, t = Game.cpu.bucket;
if ((e = t < this.config.criticalBucketThreshold ? "critical" : t < this.config.lowBucketThreshold ? "low" : t > this.config.highBucketThreshold ? "high" : "normal") !== this.bucketMode && ($r.info("Kernel: Bucket mode changed from ".concat(this.bucketMode, " to ").concat(e, " (bucket: ").concat(t, ")"), {
subsystem: "Kernel"
}), this.bucketMode = e), Game.time % 100 == 0 && ("low" === this.bucketMode || "critical" === this.bucketMode)) {
var r = this.processes.size;
$r.info("Bucket ".concat(this.bucketMode.toUpperCase(), " mode: ").concat(t, "/10000 bucket. ") + "Running all ".concat(r, " processes normally (bucket mode is informational only)"), {
subsystem: "Kernel"
});
}
}, t.prototype.validateConfig = function() {
this.config.criticalBucketThreshold >= this.config.lowBucketThreshold && ($r.warn("Kernel: Adjusting critical bucket threshold ".concat(this.config.criticalBucketThreshold, " to stay below low threshold ").concat(this.config.lowBucketThreshold), {
subsystem: "Kernel"
}), this.config.criticalBucketThreshold = Math.max(0, this.config.lowBucketThreshold - 1)), 
this.config.lowBucketThreshold >= this.config.highBucketThreshold && ($r.warn("Kernel: Adjusting high bucket threshold ".concat(this.config.highBucketThreshold, " to stay above low threshold ").concat(this.config.lowBucketThreshold), {
subsystem: "Kernel"
}), this.config.highBucketThreshold = this.config.lowBucketThreshold + 1);
}, t.prototype.buildFrequencyDefaults = function() {
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
}, t.prototype.updateAdaptiveBudgets = function() {
if (this.config.enableAdaptiveBudgets) {
var t = e.getAdaptiveBudgets(this.config.adaptiveBudgetConfig);
if (this.config.frequencyCpuBudgets = t, this.frequencyDefaults = this.buildFrequencyDefaults(), 
Game.time % 500 == 0) {
var r = Object.keys(Game.rooms).length, o = Game.cpu.bucket;
$r.info("Adaptive budgets updated: rooms=".concat(r, ", bucket=").concat(o, ", ") + "high=".concat(t.high.toFixed(3), ", medium=").concat(t.medium.toFixed(3), ", low=").concat(t.low.toFixed(3)), {
subsystem: "Kernel"
});
}
}
}, t.prototype.getBucketMode = function() {
return this.updateBucketMode(), this.bucketMode;
}, t.prototype.getCpuLimit = function() {
return Game.cpu.limit * this.config.targetCpuUsage;
}, t.prototype.hasCpuBudget = function() {
var e = Game.cpu.getUsed(), t = this.getCpuLimit();
return t - e > t * this.config.reservedCpuFraction;
}, t.prototype.getRemainingCpu = function() {
var e = this.getCpuLimit(), t = e * this.config.reservedCpuFraction;
return Math.max(0, e - Game.cpu.getUsed() - t);
}, t.prototype.rebuildProcessQueue = function() {
var e = this;
this.processQueue = Array.from(this.processes.values()).sort(function(e, t) {
return t.priority - e.priority;
}), this.queueDirty = !1, this.lastExecutedProcessId ? this.lastExecutedIndex = this.processQueue.findIndex(function(t) {
return t.id === e.lastExecutedProcessId;
}) : this.lastExecutedIndex = -1;
}, t.prototype.shouldRunProcess = function(e) {
var t;
if ("suspended" === e.state && null !== e.stats.suspendedUntil) {
if (!(Game.time >= e.stats.suspendedUntil)) {
if (Game.time % 100 == 0) {
var r = e.stats.suspendedUntil - Game.time;
$r.debug('Kernel: Process "'.concat(e.name, '" suspended (').concat(r, " ticks remaining)"), {
subsystem: "Kernel"
});
}
return !1;
}
e.state = "idle", e.stats.suspendedUntil = null;
var o = e.stats.suspensionReason;
e.stats.suspensionReason = null, $r.info('Kernel: Process "'.concat(e.name, '" automatically resumed after suspension. ') + "Previous reason: ".concat(o, ". Consecutive errors: ").concat(e.stats.consecutiveErrors), {
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
if (a < e.interval) return Game.time % 100 == 0 && e.priority >= yo.HIGH && $r.debug('Kernel: Process "'.concat(e.name, '" skipped (interval: ').concat(a, "/").concat(e.interval, " ticks)"), {
subsystem: "Kernel"
}), !1;
}
return !0;
}, t.prototype.calculateHealthScore = function(e) {
if (0 === e.runCount) return 100;
var t = (e.runCount - e.errorCount) / e.runCount * 100;
return Game.time - e.lastSuccessfulRunTick < 100 && e.lastSuccessfulRunTick > 0 && (t += 20), 
t -= 15 * e.consecutiveErrors, Math.max(0, Math.min(100, t));
}, t.prototype.executeProcess = function(e) {
var t = Game.cpu.getUsed();
e.state = "running";
try {
e.execute(), e.state = "idle", e.stats.consecutiveErrors = 0, e.stats.lastSuccessfulRunTick = Game.time;
} catch (t) {
e.state = "error", e.stats.errorCount++, e.stats.consecutiveErrors++;
var r = t instanceof Error ? t.message : String(t);
$r.error('Kernel: Process "'.concat(e.name, '" error: ').concat(r), {
subsystem: "Kernel"
}), t instanceof Error && t.stack && $r.error(t.stack, {
subsystem: "Kernel"
});
var o = e.stats.consecutiveErrors;
if (o >= 10) e.stats.suspendedUntil = Number.MAX_SAFE_INTEGER, e.stats.suspensionReason = "Circuit breaker: ".concat(o, " consecutive failures (permanent)"), 
e.state = "suspended", $r.error('Kernel: Process "'.concat(e.name, '" permanently suspended after ').concat(o, " consecutive failures"), {
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
e.state = "suspended", $r.warn('Kernel: Process "'.concat(e.name, '" suspended for ').concat(n, " ticks after ").concat(o, " consecutive failures"), {
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
s > this.config.budgetWarningThreshold && Game.time % this.config.budgetWarningInterval === 0 && $r.warn('Kernel: Process "'.concat(e.name, '" exceeded CPU budget: ').concat(a.toFixed(3), " > ").concat(i.toFixed(3), " (").concat((100 * s).toFixed(0), "%)"), {
subsystem: "Kernel"
});
}, t.prototype.run = function() {
if (this.updateBucketMode(), this.updateAdaptiveBudgets(), this.tickCpuUsed = 0, 
this.skippedProcessesThisTick = 0, Ro.processQueue(), this.queueDirty && (this.rebuildProcessQueue(), 
$r.info("Kernel: Rebuilt process queue with ".concat(this.processQueue.length, " processes"), {
subsystem: "Kernel"
})), 0 !== this.processQueue.length) {
Game.time % 10 == 0 && $r.info("Kernel: Running ".concat(this.processQueue.length, " registered processes"), {
subsystem: "Kernel"
});
for (var e = 0, t = 0, r = 0, o = 0, n = (this.lastExecutedIndex + 1) % this.processQueue.length, a = 0; a < this.processQueue.length; a++) {
var i = (n + a) % this.processQueue.length, s = this.processQueue[i];
if (this.shouldRunProcess(s)) {
if (!this.hasCpuBudget()) {
r = this.processQueue.length - e - t, $r.warn("Kernel: CPU budget exhausted after ".concat(e, " processes. ").concat(r, " processes deferred to next tick. Used: ").concat(Game.cpu.getUsed().toFixed(2), "/").concat(this.getCpuLimit().toFixed(2)), {
subsystem: "Kernel"
});
break;
}
this.executeProcess(s), e++, this.lastExecutedProcessId = s.id, this.lastExecutedIndex = i;
} else this.config.enableStats && s.stats.skippedCount++, t++, this.skippedProcessesThisTick++, 
s.stats.runCount > 0 && Game.time - s.stats.lastRunTick < s.interval && o++;
}
this.config.enableStats && Game.time % this.config.statsLogInterval === 0 && (this.logStats(e, t, o, r), 
Ro.logStats());
} else $r.warn("Kernel: No processes registered in queue", {
subsystem: "Kernel"
});
}, t.prototype.logStats = function(e, t, r, o) {
var n = Game.cpu.bucket, a = (n / 1e4 * 100).toFixed(1), i = Game.cpu.getUsed(), s = this.getCpuLimit();
if ($r.info("Kernel: ".concat(e, " ran, ").concat(t, " skipped (interval: ").concat(r, ", CPU: ").concat(o, "), ") + "CPU: ".concat(i.toFixed(2), "/").concat(s.toFixed(2), " (").concat((i / s * 100).toFixed(1), "%), bucket: ").concat(n, "/10000 (").concat(a, "%), mode: ").concat(this.bucketMode), {
subsystem: "Kernel"
}), t > 10) {
var c = this.processQueue.filter(function(e) {
return e.stats.skippedCount > 100;
}).sort(function(e, t) {
return t.stats.skippedCount - e.stats.skippedCount;
}).slice(0, 5);
c.length > 0 && $r.warn("Kernel: Top skipped processes: ".concat(c.map(function(e) {
return "".concat(e.name, "(").concat(e.stats.skippedCount, ", interval:").concat(e.interval, ")");
}).join(", ")), {
subsystem: "Kernel"
});
}
}, t.prototype.getTickCpuUsed = function() {
return this.tickCpuUsed;
}, t.prototype.getSkippedProcessesThisTick = function() {
return this.skippedProcessesThisTick;
}, t.prototype.suspendProcess = function(e) {
var t = this.processes.get(e);
return !!t && (t.state = "suspended", $r.info('Kernel: Suspended process "'.concat(t.name, '"'), {
subsystem: "Kernel"
}), !0);
}, t.prototype.resumeProcess = function(e) {
var t = this.processes.get(e);
if (t && "suspended" === t.state) {
t.state = "idle", t.stats.suspendedUntil = null;
var r = t.stats.suspensionReason;
return t.stats.suspensionReason = null, $r.info('Kernel: Manually resumed process "'.concat(t.name, '". ') + "Previous reason: ".concat(r, ". Consecutive errors: ").concat(t.stats.consecutiveErrors), {
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
}, t.prototype.getStatsSummary = function() {
var e = Array.from(this.processes.values()), t = e.filter(function(e) {
return "suspended" !== e.state;
}), r = e.filter(function(e) {
return "suspended" === e.state;
}), o = e.reduce(function(e, t) {
return e + t.stats.totalCpu;
}, 0), n = e.length > 0 ? o / e.length : 0, a = f([], d(e), !1).sort(function(e, t) {
return t.stats.avgCpu - e.stats.avgCpu;
}).slice(0, 5).map(function(e) {
return {
name: e.name,
avgCpu: e.stats.avgCpu
};
}), i = f([], d(e), !1).filter(function(e) {
return e.stats.healthScore < 50;
}).sort(function(e, t) {
return e.stats.healthScore - t.stats.healthScore;
}).slice(0, 5).map(function(e) {
return {
name: e.name,
healthScore: e.stats.healthScore,
consecutiveErrors: e.stats.consecutiveErrors
};
}), s = e.reduce(function(e, t) {
return e + t.stats.healthScore;
}, 0), c = e.length > 0 ? s / e.length : 100;
return {
totalProcesses: e.length,
activeProcesses: t.length,
suspendedProcesses: r.length,
totalCpuUsed: o,
avgCpuPerProcess: n,
topCpuProcesses: a,
unhealthyProcesses: i,
avgHealthScore: c
};
}, t.prototype.resetStats = function() {
var e, t;
try {
for (var r = p(this.processes.values()), o = r.next(); !o.done; o = r.next()) o.value.stats = {
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
suspensionReason: null
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
$r.info("Kernel: Reset all process statistics", {
subsystem: "Kernel"
});
}, t.prototype.getDistributionStats = function() {
var e, t, r = Array.from(this.processes.values()), o = r.filter(function(e) {
return void 0 !== e.tickModulo && e.tickModulo > 0;
}), n = r.filter(function(e) {
return !e.tickModulo || 0 === e.tickModulo;
}), a = {};
try {
for (var i = p(o), s = i.next(); !s.done; s = i.next()) {
var c = s.value.tickModulo;
a[c] = (a[c] || 0) + 1;
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
var u = n.length + o.reduce(function(e, t) {
return e + 1 / (t.tickModulo || 1);
}, 0), l = r.length, m = l > 0 ? (l - u) / l * 100 : 0;
return {
totalProcesses: r.length,
distributedProcesses: o.length,
everyTickProcesses: n.length,
distributionRatio: r.length > 0 ? o.length / r.length : 0,
moduloCounts: a,
averageTickLoad: u,
estimatedCpuReduction: m
};
}, t.prototype.getConfig = function() {
return l({}, this.config);
}, t.prototype.getFrequencyDefaults = function(e) {
return l({}, this.frequencyDefaults[e]);
}, t.prototype.updateConfig = function(e) {
this.config = l(l({}, this.config), e), this.validateConfig(), this.frequencyDefaults = this.buildFrequencyDefaults();
}, t.prototype.updateFromCpuConfig = function(e) {
this.updateConfig(bo(e));
}, t.prototype.on = function(e, t, r) {
return void 0 === r && (r = {}), Ro.on(e, t, r);
}, t.prototype.once = function(e, t, r) {
return void 0 === r && (r = {}), Ro.once(e, t, r);
}, t.prototype.emit = function(e, t, r) {
void 0 === r && (r = {}), Ro.emit(e, t, r);
}, t.prototype.offAll = function(e) {
Ro.offAll(e);
}, t.prototype.processEvents = function() {
Ro.processQueue();
}, t.prototype.getEventStats = function() {
return Ro.getStats();
}, t.prototype.hasEventHandlers = function(e) {
return Ro.hasHandlers(e);
}, t.prototype.getEventBus = function() {
return Ro;
}, t;
}(), _o = new Oo(bo(So().cpu)), Ao = function() {
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
for (var n = p(r.entries), a = n.next(); !a.done; a = n.next()) {
var i = d(a.value, 2), s = i[0], c = i[1];
void 0 !== c.ttl && -1 !== c.ttl && Game.time - c.cachedAt > c.ttl && (r.entries.delete(s), 
o++);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e;
}(), Uo = function() {
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
var t, r, o, n, a = this.getMemory(), i = [];
try {
for (var s = p(Object.entries(a.data)), c = s.next(); !c.done; c = s.next()) {
var u = d(c.value, 2), l = u[0], m = u[1];
void 0 !== m.ttl && -1 !== m.ttl && Game.time - m.cachedAt > m.ttl ? i.push(l) : e.entries.set(l, {
value: m.value,
cachedAt: m.cachedAt,
lastAccessed: Game.time,
ttl: m.ttl,
hits: m.hits,
dirty: !1
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
try {
for (var f = p(i), y = f.next(); !y.done; y = f.next()) l = y.value, delete a.data[l];
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
this.getHeap().entries.set(e, l(l({}, t), {
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
var e, t, r, o, n = this.getHeap(), a = this.getMemory(), i = 0;
try {
for (var s = p(n.entries), c = s.next(); !c.done; c = s.next()) {
var u = d(c.value, 2), l = u[0], m = u[1];
void 0 !== m.ttl && -1 !== m.ttl && Game.time - m.cachedAt > m.ttl && (n.entries.delete(l), 
i++);
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
for (var f = p(Object.entries(a.data)), y = f.next(); !y.done; y = f.next()) {
var h = d(y.value, 2), g = (l = h[0], h[1]);
void 0 !== g.ttl && -1 !== g.ttl && Game.time - g.cachedAt > g.ttl && (delete a.data[l], 
i++);
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
return i;
}, e.prototype.persist = function() {
var e, t;
if (Game.time - this.lastPersistTick < this.persistInterval) return 0;
var r = this.getHeap(), o = this.getMemory(), n = 0;
try {
for (var a = p(r.entries), i = a.next(); !i.done; i = a.next()) {
var s = d(i.value, 2), c = s[0], u = s[1];
u.dirty && (o.data[c] = {
value: u.value,
cachedAt: u.cachedAt,
ttl: u.ttl,
hits: u.hits
}, u.dirty = !1, n++);
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
return o.lastSync = Game.time, this.lastPersistTick = Game.time, n;
}, e.CACHE_VERSION = 1, e;
}(), No = function() {
function e(e) {
void 0 === e && (e = "heap"), this.stores = new Map, this.stats = new Map, this.defaultStore = e;
}
return e.prototype.getStore = function(e, t) {
var r = null != t ? t : this.defaultStore, o = "".concat(e, ":").concat(r), n = this.stores.get(o);
return n || (n = "memory" === r ? new Uo(e) : new Ao(e), this.stores.set(o, n)), 
n;
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
var u = {
value: t,
cachedAt: Game.time,
lastAccessed: Game.time,
ttl: null == r ? void 0 : r.ttl,
hits: 0,
dirty: !0
};
a.set(i, u);
}, e.prototype.invalidate = function(e, t) {
void 0 === t && (t = "default");
var r = "".concat(t, ":heap"), o = "".concat(t, ":memory"), n = this.makeKey(t, e), a = !1, i = this.stores.get(r);
i && (a = i.delete(n) || a);
var s = this.stores.get(o);
return s && (a = s.delete(n) || a), a;
}, e.prototype.invalidatePattern = function(e, t) {
var r, o, n, a;
void 0 === t && (t = "default");
var i = "".concat(t, ":heap"), s = "".concat(t, ":memory"), c = 0, u = [ this.stores.get(i), this.stores.get(s) ].filter(Boolean);
try {
for (var l = p(u), m = l.next(); !m.done; m = l.next()) {
var d = m.value;
if (d) {
var f = d.keys();
try {
for (var y = (n = void 0, p(f)), h = y.next(); !h.done; h = y.next()) {
var g = h.value, v = g.indexOf(":");
if (-1 !== v) {
var R = g.substring(v + 1);
e.test(R) && (d.delete(g), c++);
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (a = y.return) && a.call(y);
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
m && !m.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
return c;
}, e.prototype.clear = function(e) {
var t, r, o, n;
if (e) {
var a = "".concat(e, ":heap"), i = "".concat(e, ":memory");
null === (o = this.stores.get(a)) || void 0 === o || o.clear(), null === (n = this.stores.get(i)) || void 0 === n || n.clear(), 
this.stats.delete(e);
} else {
try {
for (var s = p(this.stores.values()), c = s.next(); !c.done; c = s.next()) c.value.clear();
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
this.stats.clear();
}
}, e.prototype.getCacheStats = function(e) {
var t, r, o, n, a, i, s, c;
if (e) {
var u = this.getStats(e), l = "".concat(e, ":heap"), m = "".concat(e, ":memory"), d = null !== (i = null === (a = this.stores.get(l)) || void 0 === a ? void 0 : a.size()) && void 0 !== i ? i : 0, f = null !== (c = null === (s = this.stores.get(m)) || void 0 === s ? void 0 : s.size()) && void 0 !== c ? c : 0, y = (h = u.hits + u.misses) > 0 ? u.hits / h : 0;
return {
hits: u.hits,
misses: u.misses,
hitRate: y,
size: d + f,
evictions: u.evictions
};
}
var h, g = 0, v = 0, R = 0, E = 0;
try {
for (var T = p(this.stats.values()), S = T.next(); !S.done; S = T.next()) g += (u = S.value).hits, 
v += u.misses, R += u.evictions;
} catch (e) {
t = {
error: e
};
} finally {
try {
S && !S.done && (r = T.return) && r.call(T);
} finally {
if (t) throw t.error;
}
}
try {
for (var C = p(this.stores.values()), w = C.next(); !w.done; w = C.next()) E += w.value.size();
} catch (e) {
o = {
error: e
};
} finally {
try {
w && !w.done && (n = C.return) && n.call(C);
} finally {
if (o) throw o.error;
}
}
return {
hits: g,
misses: v,
hitRate: y = (h = g + v) > 0 ? g / h : 0,
size: E,
evictions: R
};
}, e.prototype.evictLRU = function(e, t) {
var r, o, n = t.keys();
if (0 !== n.length) {
var a = null, i = 1 / 0;
try {
for (var s = p(n), c = s.next(); !c.done; c = s.next()) {
var u = c.value, l = t.get(u);
l && l.lastAccessed < i && (i = l.lastAccessed, a = u);
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
a && t.delete(a);
}
}, e.prototype.cleanup = function() {
var e, t, r = 0;
try {
for (var o = p(this.stores.values()), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
a.cleanup && (r += a.cleanup());
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
for (var o = p(this.stores.values()), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
a.persist && (r += a.persist());
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
}(), Mo = new No("heap");

!function(e) {
e.L1 = "L1", e.L2 = "L2", e.L3 = "L3";
}(xo || (xo = {}));

var ko, Po = "object", Io = "path";

function Go(e, t) {
return "".concat(e.roomName, ":").concat(e.x, ",").concat(e.y, ":").concat(t.roomName, ":").concat(t.x, ",").concat(t.y);
}

function Lo(e, t, r, o) {
void 0 === o && (o = {});
var n = Go(e, t), a = Room.serializePath(r);
Mo.set(n, a, {
namespace: Io,
ttl: o.ttl,
maxSize: 1e3
});
}

var Do = "roomFind", Fo = ((ko = {})[FIND_SOURCES] = 5e3, ko[FIND_MINERALS] = 5e3, 
ko[FIND_DEPOSITS] = 100, ko[FIND_STRUCTURES] = 50, ko[FIND_MY_STRUCTURES] = 50, 
ko[FIND_HOSTILE_STRUCTURES] = 20, ko[FIND_MY_SPAWNS] = 100, ko[FIND_MY_CONSTRUCTION_SITES] = 20, 
ko[FIND_CONSTRUCTION_SITES] = 20, ko[FIND_CREEPS] = 5, ko[FIND_MY_CREEPS] = 5, ko[FIND_HOSTILE_CREEPS] = 3, 
ko[FIND_DROPPED_RESOURCES] = 5, ko[FIND_TOMBSTONES] = 10, ko[FIND_RUINS] = 10, ko[FIND_FLAGS] = 50, 
ko[FIND_NUKES] = 20, ko[FIND_POWER_CREEPS] = 10, ko[FIND_MY_POWER_CREEPS] = 10, 
ko);

function Bo(e, t, r) {
var o, n, a = function(e, t, r) {
return r ? "".concat(e, ":").concat(t, ":").concat(r) : "".concat(e, ":").concat(t);
}(e.name, t, null == r ? void 0 : r.filterKey), i = Mo.get(a, {
namespace: Do,
ttl: null !== (n = null !== (o = null == r ? void 0 : r.ttl) && void 0 !== o ? o : Fo[t]) && void 0 !== n ? n : 20,
compute: function() {
return (null == r ? void 0 : r.filter) ? e.find(t, {
filter: r.filter
}) : e.find(t);
}
});
return null != i ? i : [];
}

function Wo(e) {
return Bo(e, FIND_SOURCES);
}

function Vo(e, t) {
return t ? Bo(e, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === t;
},
filterKey: t
}) : Bo(e, FIND_MY_STRUCTURES);
}

function Ko(e, t) {
return void 0 === t && (t = !0), Bo(e, t ? FIND_MY_CONSTRUCTION_SITES : FIND_CONSTRUCTION_SITES);
}

function Ho(e, t) {
return t ? Bo(e, FIND_DROPPED_RESOURCES, {
filter: function(e) {
return e.resourceType === t;
},
filterKey: t
}) : Bo(e, FIND_DROPPED_RESOURCES);
}

var jo = "closest";

function Yo(e, t) {
return "".concat(e, ":").concat(t);
}

function qo(e, t, r, o) {
if (void 0 === o && (o = 10), 0 === t.length) return zo(e, r), null;
if (1 === t.length) return t[0];
var n = Yo(e.name, r), a = Mo.get(n, {
namespace: jo,
ttl: o
});
if (a) {
var i = Game.getObjectById(a);
if (i && t.some(function(e) {
return e.id === i.id;
}) && e.pos.getRangeTo(i.pos) <= 20) return i;
}
var s = e.pos.findClosestByRange(t);
return s ? Mo.set(n, s.id, {
namespace: jo,
ttl: o
}) : zo(e, r), s;
}

function zo(e, t) {
if (t) {
var r = Yo(e.name, t);
Mo.invalidate(r, jo);
} else {
var o = new RegExp("^".concat(e.name, ":"));
Mo.invalidatePattern(o, jo);
}
}

function Xo(e) {
zo(e);
}

function Qo(e) {
var t, r = ((t = {})[MOVE] = 50, t[WORK] = 100, t[CARRY] = 50, t[ATTACK] = 80, t[RANGED_ATTACK] = 150, 
t[HEAL] = 250, t[CLAIM] = 600, t[TOUGH] = 10, t);
return e.reduce(function(e, t) {
return e + r[t];
}, 0);
}

function $o(e, t) {
return void 0 === t && (t = 0), {
parts: e,
cost: Qo(e),
minCapacity: t || Qo(e)
};
}

var Jo, Zo = {
larvaWorker: {
role: "larvaWorker",
family: "economy",
bodies: [ $o([ WORK, CARRY ], 150), $o([ WORK, CARRY, MOVE ], 200), $o([ WORK, WORK, CARRY, CARRY, MOVE, MOVE ], 400), $o([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ], 600), $o([ WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 800) ],
priority: 100,
maxPerRoom: 3,
remoteRole: !1
},
harvester: {
role: "harvester",
family: "economy",
bodies: [ $o([ WORK, WORK, MOVE ], 250), $o([ WORK, WORK, WORK, WORK, MOVE, MOVE ], 500), $o([ WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE ], 700), $o([ WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE ], 800), $o([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE ], 1e3) ],
priority: 95,
maxPerRoom: 2,
remoteRole: !1
},
hauler: {
role: "hauler",
family: "economy",
bodies: [ $o([ CARRY, CARRY, MOVE, MOVE ], 200), $o([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), $o([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800), $o(f(f([], d(Array(16).fill(CARRY)), !1), d(Array(16).fill(MOVE)), !1), 1600) ],
priority: 90,
maxPerRoom: 2,
remoteRole: !0
},
upgrader: {
role: "upgrader",
family: "economy",
bodies: [ $o([ WORK, CARRY, MOVE ], 200), $o([ WORK, WORK, WORK, CARRY, MOVE, MOVE ], 450), $o([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 1e3), $o([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1700) ],
priority: 60,
maxPerRoom: 2,
remoteRole: !1
},
builder: {
role: "builder",
family: "economy",
bodies: [ $o([ WORK, CARRY, MOVE, MOVE ], 250), $o([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 650), $o([ WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1400) ],
priority: 70,
maxPerRoom: 2,
remoteRole: !1
},
queenCarrier: {
role: "queenCarrier",
family: "economy",
bodies: [ $o([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE ], 300), $o([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ], 450), $o([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 85,
maxPerRoom: 1,
remoteRole: !1
},
mineralHarvester: {
role: "mineralHarvester",
family: "economy",
bodies: [ $o([ WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE ], 550), $o([ WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE ], 850) ],
priority: 40,
maxPerRoom: 1,
remoteRole: !1
},
labTech: {
role: "labTech",
family: "economy",
bodies: [ $o([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), $o([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 35,
maxPerRoom: 1,
remoteRole: !1
},
factoryWorker: {
role: "factoryWorker",
family: "economy",
bodies: [ $o([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), $o([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 35,
maxPerRoom: 1,
remoteRole: !1
},
remoteHarvester: {
role: "remoteHarvester",
family: "economy",
bodies: [ $o([ WORK, WORK, CARRY, MOVE, MOVE, MOVE ], 400), $o([ WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 750), $o([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1050), $o([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1600) ],
priority: 85,
maxPerRoom: 6,
remoteRole: !0
},
remoteHauler: {
role: "remoteHauler",
family: "economy",
bodies: [ $o([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), $o([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800), $o(f(f([], d(Array(16).fill(CARRY)), !1), d(Array(16).fill(MOVE)), !1), 1600) ],
priority: 80,
maxPerRoom: 6,
remoteRole: !0
},
interRoomCarrier: {
role: "interRoomCarrier",
family: "economy",
bodies: [ $o([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), $o([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600), $o([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800) ],
priority: 90,
maxPerRoom: 4,
remoteRole: !1
},
crossShardCarrier: {
role: "crossShardCarrier",
family: "economy",
bodies: [ $o(f(f([], d(Array(4).fill(CARRY)), !1), d(Array(4).fill(MOVE)), !1), 400), $o(f(f([], d(Array(8).fill(CARRY)), !1), d(Array(8).fill(MOVE)), !1), 800), $o(f(f([], d(Array(12).fill(CARRY)), !1), d(Array(12).fill(MOVE)), !1), 1200), $o(f(f([], d(Array(16).fill(CARRY)), !1), d(Array(16).fill(MOVE)), !1), 1600) ],
priority: 85,
maxPerRoom: 6,
remoteRole: !0
},
guard: {
role: "guard",
family: "military",
bodies: [ $o([ TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE ], 310), $o([ TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 620), $o([ TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1070), $o([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1740) ],
priority: 65,
maxPerRoom: 4,
remoteRole: !1
},
remoteGuard: {
role: "remoteGuard",
family: "military",
bodies: [ $o([ TOUGH, ATTACK, MOVE, MOVE ], 190), $o([ TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE ], 500), $o([ TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 880) ],
priority: 65,
maxPerRoom: 2,
remoteRole: !0
},
healer: {
role: "healer",
family: "military",
bodies: [ $o([ HEAL, MOVE, MOVE ], 350), $o([ TOUGH, HEAL, HEAL, MOVE, MOVE, MOVE ], 620), $o([ TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1240), $o([ TOUGH, TOUGH, TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 2640) ],
priority: 55,
maxPerRoom: 1,
remoteRole: !1
},
soldier: {
role: "soldier",
family: "military",
bodies: [ $o([ ATTACK, ATTACK, MOVE, MOVE ], 260), $o([ ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE ], 520), $o([ TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1340) ],
priority: 50,
maxPerRoom: 1,
remoteRole: !1
},
siegeUnit: {
role: "siegeUnit",
family: "military",
bodies: [ $o([ WORK, WORK, MOVE, MOVE ], 300), $o([ TOUGH, TOUGH, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 620), $o([ TOUGH, TOUGH, TOUGH, TOUGH, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1040) ],
priority: 30,
maxPerRoom: 1,
remoteRole: !1
},
ranger: {
role: "ranger",
family: "military",
bodies: [ $o([ TOUGH, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE ], 360), $o([ TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE ], 570), $o([ TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1040), $o([ TOUGH, TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1480) ],
priority: 60,
maxPerRoom: 4,
remoteRole: !1
},
harasser: {
role: "harasser",
family: "military",
bodies: [ $o([ TOUGH, ATTACK, RANGED_ATTACK, MOVE, MOVE ], 320), $o([ TOUGH, TOUGH, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE ], 640), $o([ TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1200) ],
priority: 40,
maxPerRoom: 1,
remoteRole: !1
},
scout: {
role: "scout",
family: "utility",
bodies: [ $o([ MOVE ], 50) ],
priority: 30,
maxPerRoom: 1,
remoteRole: !0
},
claimer: {
role: "claimer",
family: "utility",
bodies: [ $o([ CLAIM, MOVE ], 650), $o([ CLAIM, CLAIM, MOVE, MOVE ], 1300) ],
priority: 50,
maxPerRoom: 3,
remoteRole: !0
},
engineer: {
role: "engineer",
family: "utility",
bodies: [ $o([ WORK, CARRY, MOVE, MOVE ], 250), $o([ WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 500) ],
priority: 55,
maxPerRoom: 2,
remoteRole: !1
},
remoteWorker: {
role: "remoteWorker",
family: "utility",
bodies: [ $o([ WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 500), $o([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 750) ],
priority: 45,
maxPerRoom: 4,
remoteRole: !0
},
powerHarvester: {
role: "powerHarvester",
family: "power",
bodies: [ $o([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 2300), $o([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 3e3) ],
priority: 30,
maxPerRoom: 2,
remoteRole: !0
},
powerCarrier: {
role: "powerCarrier",
family: "power",
bodies: [ $o(f(f([], d(Array(20).fill(CARRY)), !1), d(Array(20).fill(MOVE)), !1), 2e3), $o(f(f([], d(Array(25).fill(CARRY)), !1), d(Array(25).fill(MOVE)), !1), 2500) ],
priority: 25,
maxPerRoom: 2,
remoteRole: !0
}
};

!function(e) {
e[e.None = 0] = "None", e[e.Pheromones = 1] = "Pheromones", e[e.Paths = 2] = "Paths", 
e[e.Traffic = 4] = "Traffic", e[e.Defense = 8] = "Defense", e[e.Economy = 16] = "Economy", 
e[e.Construction = 32] = "Construction", e[e.Performance = 64] = "Performance";
}(Jo || (Jo = {}));

var en, tn, rn, on = Qr("MemoryMonitor"), nn = 2097152, an = new (function() {
function e() {
this.lastCheckTick = 0, this.lastStatus = "normal";
}
return e.prototype.checkMemoryUsage = function() {
var e = RawMemory.get().length, t = e / nn, r = "normal";
t >= .9 ? r = "critical" : t >= .8 && (r = "warning"), r !== this.lastStatus && ("critical" === r ? (Game.notify("CRITICAL: Memory at ".concat((100 * t).toFixed(1), "% (").concat(this.formatBytes(e), "/").concat(this.formatBytes(nn), ")")), 
on.error("Memory usage critical", {
meta: {
used: e,
limit: nn,
percentage: t
}
})) : "warning" === r ? on.warn("Memory usage warning", {
meta: {
used: e,
limit: nn,
percentage: t
}
}) : on.info("Memory usage normal", {
meta: {
used: e,
limit: nn,
percentage: t
}
}), this.lastStatus = r);
var o = this.getMemoryBreakdown();
return {
used: e,
limit: nn,
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
on.info("Memory Usage", {
meta: {
used: this.formatBytes(t.used),
limit: this.formatBytes(t.limit),
percentage: "".concat((100 * t.percentage).toFixed(1), "%"),
status: t.status.toUpperCase()
}
}), on.info("Memory Breakdown", {
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
}()), sn = 1e4, cn = function() {
function e() {}
return e.prototype.pruneAll = function() {
var e = RawMemory.get().length, t = {
deadCreeps: 0,
eventLogs: 0,
staleIntel: 0,
marketHistory: 0,
bytesSaved: 0
};
t.deadCreeps = this.pruneDeadCreeps(), t.eventLogs = this.pruneEventLogs(20), t.staleIntel = this.pruneStaleIntel(sn), 
t.marketHistory = this.pruneMarketHistory(5e3);
var r = RawMemory.get().length;
return t.bytesSaved = Math.max(0, e - r), t.bytesSaved > 0 && $r.info("Memory pruning complete", {
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
var a = 0, i = Game.time - sn;
for (var r in t.knownRooms) {
var s = t.knownRooms[r];
s.lastSeen < i && !s.isHighway && !s.hasPortal && a++;
}
a > 50 && e.push("".concat(a, " stale intel entries (older than ").concat(sn, " ticks)"));
}
var c = 0;
for (var u in Memory.creeps) u in Game.creeps || c++;
return c > 10 && e.push("".concat(c, " dead creeps in memory")), e;
}, e;
}(), un = new cn, ln = {
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
}, mn = function() {
function e() {
this.activeSegments = new Set, this.segmentCache = new Map;
}
return e.prototype.requestSegment = function(e) {
if (e < 0 || e > 99) throw new Error("Invalid segment ID: ".concat(e, ". Must be 0-99."));
this.activeSegments.add(e);
var t = Array.from(this.activeSegments);
if (t.length > 10) throw $r.error("Cannot have more than 10 active segments", {
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
if (void 0 === o && (o = 1), !this.isSegmentLoaded(e)) return $r.warn("Attempted to write to unloaded segment", {
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
return s.length > 102400 ? ($r.error("Segment data exceeds 100KB limit", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e,
key: t,
size: s.length
}
}), !1) : (RawMemory.segments[e] = s, this.segmentCache.set(e, a), !0);
} catch (r) {
return $r.error("Failed to write segment data", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e,
key: t,
error: String(r)
}
}), !1;
}
}, e.prototype.readSegment = function(e, t) {
if (!this.isSegmentLoaded(e)) return $r.warn("Attempted to read from unloaded segment", {
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
return $r.error("Failed to read segment data", {
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
this.isSegmentLoaded(e) ? (RawMemory.segments[e] = "", this.segmentCache.delete(e)) : $r.warn("Attempted to clear unloaded segment", {
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
for (var t = ln[e], r = t.start; r <= t.end; r++) if (!this.isSegmentLoaded(r) || this.getSegmentSize(r) < 92160) return r;
return t.start;
}, e.prototype.migrateToSegment = function(e, t, r) {
var o, n, a = e.split("."), i = Memory;
try {
for (var s = p(a), c = s.next(); !c.done; c = s.next()) {
var u = c.value;
if (!i || "object" != typeof i || !(u in i)) return $r.warn("Memory path not found for migration", {
subsystem: "MemorySegmentManager",
meta: {
memoryPath: e,
segmentId: t,
key: r
}
}), !1;
i = i[u];
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
if (!this.isSegmentLoaded(t)) return this.requestSegment(t), $r.info("Segment not loaded, will migrate next tick", {
subsystem: "MemorySegmentManager",
meta: {
memoryPath: e,
segmentId: t,
key: r
}
}), !1;
var l = this.writeSegment(t, r, i);
return l && $r.info("Successfully migrated data to segment", {
subsystem: "MemorySegmentManager",
meta: {
memoryPath: e,
segmentId: t,
key: r,
dataSize: JSON.stringify(i).length
}
}), l;
}, e;
}(), pn = new mn, dn = {
exports: {}
}, fn = (en || (en = 1, tn = dn, rn = function() {
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
var o, n, a, i = {}, s = {}, c = "", u = "", l = "", m = 2, p = 3, d = 2, f = [], y = 0, h = 0;
for (a = 0; a < e.length; a += 1) if (c = e.charAt(a), Object.prototype.hasOwnProperty.call(i, c) || (i[c] = p++, 
s[c] = !0), u = l + c, Object.prototype.hasOwnProperty.call(i, u)) l = u; else {
if (Object.prototype.hasOwnProperty.call(s, l)) {
if (l.charCodeAt(0) < 256) {
for (o = 0; o < d; o++) y <<= 1, h == t - 1 ? (h = 0, f.push(r(y)), y = 0) : h++;
for (n = l.charCodeAt(0), o = 0; o < 8; o++) y = y << 1 | 1 & n, h == t - 1 ? (h = 0, 
f.push(r(y)), y = 0) : h++, n >>= 1;
} else {
for (n = 1, o = 0; o < d; o++) y = y << 1 | n, h == t - 1 ? (h = 0, f.push(r(y)), 
y = 0) : h++, n = 0;
for (n = l.charCodeAt(0), o = 0; o < 16; o++) y = y << 1 | 1 & n, h == t - 1 ? (h = 0, 
f.push(r(y)), y = 0) : h++, n >>= 1;
}
0 == --m && (m = Math.pow(2, d), d++), delete s[l];
} else for (n = i[l], o = 0; o < d; o++) y = y << 1 | 1 & n, h == t - 1 ? (h = 0, 
f.push(r(y)), y = 0) : h++, n >>= 1;
0 == --m && (m = Math.pow(2, d), d++), i[u] = p++, l = String(c);
}
if ("" !== l) {
if (Object.prototype.hasOwnProperty.call(s, l)) {
if (l.charCodeAt(0) < 256) {
for (o = 0; o < d; o++) y <<= 1, h == t - 1 ? (h = 0, f.push(r(y)), y = 0) : h++;
for (n = l.charCodeAt(0), o = 0; o < 8; o++) y = y << 1 | 1 & n, h == t - 1 ? (h = 0, 
f.push(r(y)), y = 0) : h++, n >>= 1;
} else {
for (n = 1, o = 0; o < d; o++) y = y << 1 | n, h == t - 1 ? (h = 0, f.push(r(y)), 
y = 0) : h++, n = 0;
for (n = l.charCodeAt(0), o = 0; o < 16; o++) y = y << 1 | 1 & n, h == t - 1 ? (h = 0, 
f.push(r(y)), y = 0) : h++, n >>= 1;
}
0 == --m && (m = Math.pow(2, d), d++), delete s[l];
} else for (n = i[l], o = 0; o < d; o++) y = y << 1 | 1 & n, h == t - 1 ? (h = 0, 
f.push(r(y)), y = 0) : h++, n >>= 1;
0 == --m && (m = Math.pow(2, d), d++);
}
for (n = 2, o = 0; o < d; o++) y = y << 1 | 1 & n, h == t - 1 ? (h = 0, f.push(r(y)), 
y = 0) : h++, n >>= 1;
for (;;) {
if (y <<= 1, h == t - 1) {
f.push(r(y));
break;
}
h++;
}
return f.join("");
},
decompress: function(e) {
return null == e ? "" : "" == e ? null : a._decompress(e.length, 32768, function(t) {
return e.charCodeAt(t);
});
},
_decompress: function(t, r, o) {
var n, a, i, s, c, u, l, m = [], p = 4, d = 4, f = 3, y = "", h = [], g = {
val: o(0),
position: r,
index: 1
};
for (n = 0; n < 3; n += 1) m[n] = n;
for (i = 0, c = Math.pow(2, 2), u = 1; u != c; ) s = g.val & g.position, g.position >>= 1, 
0 == g.position && (g.position = r, g.val = o(g.index++)), i |= (s > 0 ? 1 : 0) * u, 
u <<= 1;
switch (i) {
case 0:
for (i = 0, c = Math.pow(2, 8), u = 1; u != c; ) s = g.val & g.position, g.position >>= 1, 
0 == g.position && (g.position = r, g.val = o(g.index++)), i |= (s > 0 ? 1 : 0) * u, 
u <<= 1;
l = e(i);
break;

case 1:
for (i = 0, c = Math.pow(2, 16), u = 1; u != c; ) s = g.val & g.position, g.position >>= 1, 
0 == g.position && (g.position = r, g.val = o(g.index++)), i |= (s > 0 ? 1 : 0) * u, 
u <<= 1;
l = e(i);
break;

case 2:
return "";
}
for (m[3] = l, a = l, h.push(l); ;) {
if (g.index > t) return "";
for (i = 0, c = Math.pow(2, f), u = 1; u != c; ) s = g.val & g.position, g.position >>= 1, 
0 == g.position && (g.position = r, g.val = o(g.index++)), i |= (s > 0 ? 1 : 0) * u, 
u <<= 1;
switch (l = i) {
case 0:
for (i = 0, c = Math.pow(2, 8), u = 1; u != c; ) s = g.val & g.position, g.position >>= 1, 
0 == g.position && (g.position = r, g.val = o(g.index++)), i |= (s > 0 ? 1 : 0) * u, 
u <<= 1;
m[d++] = e(i), l = d - 1, p--;
break;

case 1:
for (i = 0, c = Math.pow(2, 16), u = 1; u != c; ) s = g.val & g.position, g.position >>= 1, 
0 == g.position && (g.position = r, g.val = o(g.index++)), i |= (s > 0 ? 1 : 0) * u, 
u <<= 1;
m[d++] = e(i), l = d - 1, p--;
break;

case 2:
return h.join("");
}
if (0 == p && (p = Math.pow(2, f), f++), m[l]) y = m[l]; else {
if (l !== d) return null;
y = a + a.charAt(0);
}
h.push(y), m[d++] = a + y.charAt(0), a = y, 0 == --p && (p = Math.pow(2, f), f++);
}
}
};
return a;
}(), null != tn ? tn.exports = rn : "undefined" != typeof angular && null != angular && angular.module("LZString", []).factory("LZString", function() {
return rn;
})), dn.exports), yn = function() {
function e() {}
return e.prototype.compress = function(e, t) {
void 0 === t && (t = 1);
var r = JSON.stringify(e), o = r.length, n = fn.compressToUTF16(r);
return {
compressed: n,
originalSize: o,
compressedSize: n.length,
timestamp: Game.time,
version: t
};
}, e.prototype.decompress = function(e) {
try {
var t = "string" == typeof e ? e : e.compressed, r = fn.decompressFromUTF16(t);
return r ? JSON.parse(r) : ($r.error("Decompression returned null", {
subsystem: "MemoryCompressor"
}), null);
} catch (e) {
return $r.error("Failed to decompress data", {
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
}(), hn = new yn, gn = [ {
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
var u = pn.suggestSegmentForType("HISTORICAL_INTEL");
if (!pn.isSegmentLoaded(u)) return pn.requestSegment(u), void $r.info("Segment not loaded, migration will continue next tick", {
subsystem: "MemoryMigrations",
meta: {
segmentId: u
}
});
if (!pn.writeSegment(u, "historicalIntel", a)) return void $r.error("Failed to write historical intel to segment", {
subsystem: "MemoryMigrations",
meta: {
segmentId: u
}
});
o.knownRooms = n, $r.info("Migrated historical intel to segments", {
subsystem: "MemoryMigrations",
meta: {
historicalCount: Object.keys(a).length,
activeCount: Object.keys(n).length,
segmentId: u
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
if (o && !hn.isCompressed(o)) {
var n = hn.compressPortalMap(o);
r.compressedPortals = n, delete r.portals, $r.info("Compressed portal map data", {
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
var n = hn.compressMarketHistory(o), a = pn.suggestSegmentForType("MARKET_HISTORY");
if (!pn.isSegmentLoaded(a)) return pn.requestSegment(a), void $r.info("Segment not loaded, migration will continue next tick", {
subsystem: "MemoryMigrations",
meta: {
segmentId: a
}
});
pn.writeSegment(a, "priceHistory", n) ? (delete r.priceHistory, $r.info("Migrated market history to segments", {
subsystem: "MemoryMigrations",
meta: {
originalSize: n.originalSize,
compressedSize: n.compressedSize,
segmentId: a
}
})) : $r.error("Failed to write market history to segment", {
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
r > 0 && $r.info("Migrated ".concat(r, " cluster array properties"), {
subsystem: "MemoryMigrations",
meta: {
clustersProcessed: Object.keys(t).length
}
});
}
}
} ], vn = function() {
function e() {}
return e.prototype.runMigrations = function() {
var e, t, r, o = Memory, n = null !== (r = o.memoryVersion) && void 0 !== r ? r : 0, a = gn.filter(function(e) {
return e.version > n;
});
if (0 !== a.length) {
$r.info("Running ".concat(a.length, " memory migration(s)"), {
subsystem: "MigrationRunner",
meta: {
fromVersion: n,
toVersion: a[a.length - 1].version
}
});
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
try {
$r.info("Running migration v".concat(c.version, ": ").concat(c.description), {
subsystem: "MigrationRunner"
}), c.migrate(Memory), o.memoryVersion = c.version, $r.info("Migration v".concat(c.version, " complete"), {
subsystem: "MigrationRunner"
});
} catch (e) {
$r.error("Migration v".concat(c.version, " failed"), {
subsystem: "MigrationRunner",
meta: {
error: String(e)
}
}), Game.notify("Migration v".concat(c.version, " failed: ").concat(String(e)));
break;
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
}
}, e.prototype.getCurrentVersion = function() {
var e;
return null !== (e = Memory.memoryVersion) && void 0 !== e ? e : 0;
}, e.prototype.getLatestVersion = function() {
return 0 === gn.length ? 0 : Math.max.apply(Math, f([], d(gn.map(function(e) {
return e.version;
})), !1));
}, e.prototype.hasPendingMigrations = function() {
return this.getCurrentVersion() < this.getLatestVersion();
}, e.prototype.getPendingMigrations = function() {
var e = this.getCurrentVersion();
return gn.filter(function(t) {
return t.version > e;
});
}, e.prototype.rollbackToVersion = function(e) {
var t = Memory;
$r.warn("Rolling back memory version to ".concat(e), {
subsystem: "MigrationRunner",
meta: {
fromVersion: this.getCurrentVersion(),
toVersion: e
}
}), t.memoryVersion = e, Game.notify("Memory version rolled back to ".concat(e, ". Data may be inconsistent!"));
}, e;
}(), Rn = new vn, En = "empire", Tn = "clusters", Sn = function() {
function e() {
this.lastInitializeTick = null, this.lastCleanupTick = 0, this.lastPruningTick = 0, 
this.lastMonitoringTick = 0;
}
return e.prototype.initialize = function() {
this.lastInitializeTick !== Game.time && (this.lastInitializeTick = Game.time, ro.initialize(), 
Rn.runMigrations(), this.ensureEmpireMemory(), this.ensureClustersMemory(), Game.time - this.lastCleanupTick >= 10 && (this.cleanDeadCreeps(), 
this.lastCleanupTick = Game.time), Game.time - this.lastPruningTick >= 100 && (un.pruneAll(), 
this.lastPruningTick = Game.time), Game.time - this.lastMonitoringTick >= 50 && (an.checkMemoryUsage(), 
this.lastMonitoringTick = Game.time));
}, e.prototype.ensureEmpireMemory = function() {
var e = Memory;
e[En] || (e[En] = {
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
e[Tn] || (e[Tn] = {});
}, e.prototype.getEmpire = function() {
var e = "memory:".concat(En), t = ro.get(e);
if (!t) {
this.ensureEmpireMemory();
var r = Memory;
ro.set(e, r[En], Jr), t = r[En];
}
return t;
}, e.prototype.getClusters = function() {
var e = "memory:".concat(Tn), t = ro.get(e);
if (!t) {
this.ensureClustersMemory();
var r = Memory;
ro.set(e, r[Tn], Jr), t = r[Tn];
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
var t, r = "memory:room:".concat(e, ":swarm"), o = ro.get(r);
if (!o) {
var n = null === (t = Memory.rooms) || void 0 === t ? void 0 : t[e];
if (!n) return;
var a = n.swarm;
a && (ro.set(r, a, Jr), o = a);
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
}), ro.set(t, r.swarm, Jr), r.swarm;
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
ro.persist();
}, e.prototype.getHeapCache = function() {
return ro;
}, e.prototype.isRoomHostile = function(e) {
var t, r, o, n = "memory:room:".concat(e, ":hostile"), a = ro.get(n);
if (void 0 !== a) return !0 === a;
var i = null !== (o = null === (r = null === (t = Memory.rooms) || void 0 === t ? void 0 : t[e]) || void 0 === r ? void 0 : r.hostile) && void 0 !== o && o;
return ro.set(n, !!i || null, 100), i;
}, e.prototype.setRoomHostile = function(e, t) {
Memory.rooms || (Memory.rooms = {}), Memory.rooms[e] || (Memory.rooms[e] = {}), 
Memory.rooms[e].hostile = t;
var r = "memory:room:".concat(e, ":hostile");
ro.set(r, !!t || null, 100);
}, e;
}(), Cn = new Sn;

function wn(e) {
var t, r, o, n, a, i, s = {
guards: 0,
rangers: 0,
healers: 0,
urgency: 1,
reasons: []
}, c = null !== (i = null === (a = e.controller) || void 0 === a ? void 0 : a.level) && void 0 !== i ? i : 1;
c >= 3 && (s.guards = 1, s.rangers = 1, s.reasons.push("Baseline defense force for RCL ".concat(c)));
var u = e.find(FIND_HOSTILE_CREEPS);
if (0 === u.length) return s;
var l = 0, m = 0, d = 0, f = 0, y = 0;
try {
for (var h = p(u), g = h.next(); !g.done; g = h.next()) {
var v = g.value.body, R = v.some(function(e) {
return void 0 !== e.boost;
});
R && y++;
try {
for (var E = (o = void 0, p(v)), T = E.next(); !T.done; T = E.next()) {
var S = T.value;
S.type === ATTACK && l++, S.type === RANGED_ATTACK && m++, S.type === HEAL && d++, 
S.type === WORK && f++;
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
g && !g.done && (r = h.return) && r.call(h);
} finally {
if (t) throw t.error;
}
}
return l > 0 && (s.guards = Math.max(1, Math.ceil(l / 4)), s.reasons.push("".concat(l, " melee parts detected"))), 
m > 0 && (s.rangers = Math.max(1, Math.ceil(m / 6)), s.reasons.push("".concat(m, " ranged parts detected"))), 
d > 0 && (s.healers = Math.max(1, Math.ceil(d / 8)), s.reasons.push("".concat(d, " heal parts detected"))), 
f > 0 && (s.guards += Math.ceil(f / 5), s.reasons.push("".concat(f, " work parts (dismantlers)"))), 
y > 0 && (s.guards = Math.ceil(1.5 * s.guards), s.rangers = Math.ceil(1.5 * s.rangers), 
s.healers = Math.ceil(1.5 * s.healers), s.urgency = 2, s.reasons.push("".concat(y, " boosted enemies (high threat)"))), 
u.length > 0 && (s.guards = Math.max(s.guards, 2), s.rangers = Math.max(s.rangers, 2)), 
u.length >= 3 && (s.healers = Math.max(s.healers, 1)), u.length >= 5 && (s.urgency = Math.max(s.urgency, 1.5), 
s.reasons.push("".concat(u.length, " hostiles (large attack)"))), e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_STORAGE || e.structureType === STRUCTURE_TERMINAL) && e.hits < .8 * e.hitsMax;
}
}).length > 0 && (s.urgency = 3, s.reasons.push("Critical structures under attack!")), 
$r.info("Defender analysis for ".concat(e.name, ": ").concat(s.guards, " guards, ").concat(s.rangers, " rangers, ").concat(s.healers, " healers (urgency: ").concat(s.urgency, "x) - ").concat(s.reasons.join(", ")), {
subsystem: "Defense"
}), s;
}

function bn(e) {
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

function xn(e, t) {
var r, o;
if (t.danger < 1) return !1;
var n = wn(e), a = bn(e), i = n.guards - a.guards + (n.rangers - a.rangers);
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

function On(e, t) {
if (!xn(e, t)) return null;
var r = wn(e), o = bn(e), n = {
roomName: e.name,
guardsNeeded: Math.max(0, r.guards - o.guards),
rangersNeeded: Math.max(0, r.rangers - o.rangers),
healersNeeded: Math.max(0, r.healers - o.healers),
urgency: r.urgency,
createdAt: Game.time,
threat: r.reasons.join("; ")
};
return $r.warn("Defense assistance requested for ".concat(e.name, ": ").concat(n.guardsNeeded, " guards, ").concat(n.rangersNeeded, " rangers, ").concat(n.healersNeeded, " healers - ").concat(n.threat), {
subsystem: "Defense"
}), n;
}

function _n(e, t, r) {
var o = 0;
if ("guard" !== r && "ranger" !== r && "healer" !== r || (o += function(e, t, r) {
var o = wn(e), n = bn(e);
if (0 === o.guards && 0 === o.rangers && 0 === o.healers) return 0;
var a = 0;
return ("guard" === r && n.guards < o.guards || "ranger" === r && n.rangers < o.rangers || "healer" === r && n.healers < o.healers) && (a = 100 * o.urgency), 
a;
}(e, 0, r)), "upgrader" === r && t.clusterId) {
var n = Cn.getCluster(t.clusterId);
(null == n ? void 0 : n.focusRoom) === e.name && (o += 40);
}
return o;
}

function An(e, t) {
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

var Un, Nn = [ {
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

function Mn(e, t, r, o) {
var n, a, i, s, c, u, l = (i = t, c = (s = function(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
return t ? {
x: "W" === t[1] ? -parseInt(t[2], 10) : parseInt(t[2], 10),
y: "N" === t[3] ? parseInt(t[4], 10) : -parseInt(t[4], 10)
} : {
x: 0,
y: 0
};
})(e), u = s(i), Math.abs(u.x - c.x) + Math.abs(u.y - c.y)), m = function(e, t) {
void 0 === t && (t = 1.2);
var r = 50 * e * t;
return Math.ceil(2 * r);
}(l), d = 10 * r, f = Nn[0];
try {
for (var y = p(Nn), h = y.next(); !h.done; h = y.next()) {
var g = h.value;
if (!(g.cost <= o)) break;
f = g;
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (a = y.return) && a.call(y);
} finally {
if (n) throw n.error;
}
}
var v = d * m, R = Math.max(1, Math.ceil(v / f.capacity * 1.2)), E = Math.min(2 * r, R + 1);
return $r.debug("Remote hauler calculation: ".concat(e, " -> ").concat(t, " (").concat(r, " sources, ").concat(l, " rooms away) - RT: ").concat(m, " ticks, E/tick: ").concat(d, ", Min: ").concat(R, ", Rec: ").concat(E, ", Cap: ").concat(f.capacity), {
subsystem: "HaulerDimensioning"
}), {
minHaulers: R,
recommendedHaulers: E,
haulerConfig: f,
distance: l,
roundTripTicks: m,
energyPerTick: d
};
}

var kn, Pn = ((Un = {})[MOVE] = 50, Un[WORK] = 100, Un[CARRY] = 50, Un[ATTACK] = 80, 
Un[RANGED_ATTACK] = 150, Un[HEAL] = 250, Un[CLAIM] = 600, Un[TOUGH] = 10, Un);

function In(e) {
return e.reduce(function(e, t) {
return e + Pn[t];
}, 0);
}

!function(e) {
e[e.EMERGENCY = 1e3] = "EMERGENCY", e[e.HIGH = 500] = "HIGH", e[e.NORMAL = 100] = "NORMAL", 
e[e.LOW = 50] = "LOW";
}(kn || (kn = {}));

var Gn = function() {
function e() {
this.queues = new Map;
}
return e.prototype.getQueue = function(e) {
return this.queues.has(e) || this.queues.set(e, {
requests: [],
inProgress: new Map,
lastUpdate: Game.time
}), this.queues.get(e);
}, e.prototype.addRequest = function(e) {
var t = this.getQueue(e.roomName);
e.id || (e.id = "".concat(e.role, "_").concat(Game.time, "_").concat(Math.random().toString(36).substring(2, 11))), 
t.requests.push(e), t.requests.sort(function(e, t) {
return t.priority - e.priority;
}), $r.debug("Added spawn request: ".concat(e.role, " (priority: ").concat(e.priority, ") for room ").concat(e.roomName), {
subsystem: "SpawnQueue"
});
}, e.prototype.getNextRequest = function(e, t) {
var r = this.getQueue(e);
this.cleanupInProgress(r);
for (var o = 0; o < r.requests.length; o++) {
var n = r.requests[o];
if (!this.isRequestInProgress(r, n.id) && n.body.cost <= t) return n;
}
return null;
}, e.prototype.removeRequest = function(e, t) {
var r = this.getQueue(e);
r.requests = r.requests.filter(function(e) {
return e.id !== t;
});
}, e.prototype.markInProgress = function(e, t, r) {
this.getQueue(e).inProgress.set(t, {
spawnId: r,
requestId: t
});
}, e.prototype.isRequestInProgress = function(e, t) {
return e.inProgress.has(t);
}, e.prototype.cleanupInProgress = function(e) {
var t, r, o, n, a = [];
try {
for (var i = p(e.inProgress), s = i.next(); !s.done; s = i.next()) {
var c = d(s.value, 2), u = c[0], l = c[1].spawnId, m = Game.getObjectById(l);
m && m.spawning || a.push(u);
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
try {
for (var f = p(a), y = f.next(); !y.done; y = f.next()) u = y.value, e.inProgress.delete(u);
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
}, e.prototype.getPendingRequests = function(e) {
return f([], d(this.getQueue(e).requests), !1);
}, e.prototype.getQueueSize = function(e) {
return this.getQueue(e).requests.length;
}, e.prototype.clearQueue = function(e) {
this.getQueue(e).requests = [], $r.debug("Cleared spawn queue for room ".concat(e), {
subsystem: "SpawnQueue"
});
}, e.prototype.getAvailableSpawns = function(e) {
var t = Game.rooms[e];
return t ? t.find(FIND_MY_SPAWNS).filter(function(e) {
return !e.spawning;
}) : [];
}, e.prototype.processQueue = function(e) {
var t, r, o = Game.rooms[e];
if (!o) return 0;
var n = this.getAvailableSpawns(e);
if (0 === n.length) return 0;
this.getQueue(e);
var a = 0;
try {
for (var i = p(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = this.getNextRequest(e, o.energyAvailable);
if (!u) break;
var l = this.executeSpawn(c, u);
l === OK ? (a++, this.markInProgress(e, u.id, c.id), this.removeRequest(e, u.id)) : l !== ERR_NOT_ENOUGH_ENERGY && (this.removeRequest(e, u.id), 
$r.warn("Spawn request failed: ".concat(u.role, " in ").concat(e, " (error: ").concat(l, ")"), {
subsystem: "SpawnQueue"
}));
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
return a;
}, e.prototype.executeSpawn = function(e, t) {
var r = this.generateCreepName(t.role), o = l({
role: t.role,
family: t.family,
homeRoom: t.roomName,
version: 1
}, t.additionalMemory);
return t.targetRoom && (o.targetRoom = t.targetRoom), t.sourceId && (o.sourceId = t.sourceId), 
t.boostRequirements && (o.boostRequirements = t.boostRequirements), e.spawnCreep(t.body.parts, r, {
memory: o
});
}, e.prototype.generateCreepName = function(e) {
return "".concat(e, "_").concat(Game.time, "_").concat(Math.random().toString(36).substring(2, 11));
}, e.prototype.hasEmergencySpawns = function(e) {
return this.getQueue(e).requests.some(function(e) {
return e.priority >= kn.EMERGENCY;
});
}, e.prototype.countByPriority = function(e, t) {
return this.getQueue(e).requests.filter(function(e) {
return e.priority >= t;
}).length;
}, e.prototype.getQueueStats = function(e) {
var t = this.getQueue(e);
return {
total: t.requests.length,
emergency: t.requests.filter(function(e) {
return e.priority >= kn.EMERGENCY;
}).length,
high: t.requests.filter(function(e) {
return e.priority >= kn.HIGH && e.priority < kn.EMERGENCY;
}).length,
normal: t.requests.filter(function(e) {
return e.priority >= kn.NORMAL && e.priority < kn.HIGH;
}).length,
low: t.requests.filter(function(e) {
return e.priority < kn.NORMAL;
}).length,
inProgress: t.inProgress.size
};
}, e;
}(), Ln = new Gn;

function Dn(e) {
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

function Fn(e) {
for (var t = 0, r = 0; r < e.length; r++) t = (t << 5) - t + e.charCodeAt(r), t &= t;
return Math.abs(t);
}

function Bn(e) {
var t, r = {
v: e.version,
s: Object.entries(e.shards).map(function(e) {
var t, r = d(e, 2), o = r[0], n = r[1];
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
}, o = Fn(JSON.stringify(r));
return JSON.stringify({
d: r,
c: o
});
}

function Wn(e) {
var t, r, o, n, a, i, s;
try {
var c = JSON.parse(e), u = Fn(JSON.stringify(c.d));
if (c.c !== u) return $r.warn("InterShardMemory checksum mismatch", {
subsystem: "InterShard",
meta: {
expected: u,
actual: c.c
}
}), null;
var l = c.d, m = {
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
}, h = {
p: "pending",
a: "active",
c: "complete",
f: "failed"
}, g = {}, v = l.s;
try {
for (var R = p(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
g[T.n] = {
name: T.n,
role: null !== (o = m[T.r]) && void 0 !== o ? o : "core",
health: {
cpuCategory: null !== (n = f[T.h.c]) && void 0 !== n ? n : "low",
cpuUsage: null !== (a = T.h.cu) && void 0 !== a ? a : 0,
bucketLevel: null !== (i = T.h.b) && void 0 !== i ? i : 1e4,
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
var t, r = d(e.sp.split(","), 2), o = r[0], n = r[1];
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
cpuHistory: (null !== (s = T.ch) && void 0 !== s ? s : []).map(function(e) {
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
var S = l.g, C = l.k, w = {
targetPowerLevel: S.pl
};
return S.ws && (w.mainWarShard = S.ws), S.es && (w.primaryEcoShard = S.es), S.ct && (w.colonizationTarget = S.ct), 
S.en && (w.enemies = S.en.map(function(e) {
return {
username: e.u,
rooms: e.r,
threatLevel: e.t,
lastSeen: e.s,
isAlly: 1 === e.a
};
})), {
version: l.v,
shards: g,
globalTargets: w,
tasks: C.map(function(e) {
var t, r, o = {
id: e.i,
type: null !== (t = y[e.y]) && void 0 !== t ? t : "colonize",
sourceShard: e.ss,
targetShard: e.ts,
priority: e.p,
status: null !== (r = h[e.st]) && void 0 !== r ? r : "pending",
createdAt: 0
};
return e.tr && (o.targetRoom = e.tr), e.rt && (o.resourceType = e.rt), void 0 !== e.ra && (o.resourceAmount = e.ra), 
void 0 !== e.pr && (o.progress = e.pr), o;
}),
lastSync: l.ls,
checksum: c.c
};
} catch (e) {
return $r.error("Failed to deserialize InterShardMemory: ".concat(String(e)), {
subsystem: "InterShard"
}), null;
}
}

var Vn = 102400, Kn = [], Hn = new Set;

function jn(e) {
return function(t, r, o) {
Kn.push({
options: e,
methodName: String(r),
target: t
});
};
}

function Yn(e, t, r) {
return jn(l({
id: e,
name: t,
priority: yo.MEDIUM,
frequency: "medium",
minBucket: 0,
cpuBudget: .15,
interval: 5
}, r));
}

function qn(e, t, r) {
return jn(l({
id: e,
name: t,
priority: yo.LOW,
frequency: "low",
minBucket: 0,
cpuBudget: .1,
interval: 20
}, r));
}

function zn(e, t, r) {
return jn(l({
id: e,
name: t,
priority: yo.IDLE,
frequency: "low",
minBucket: 0,
cpuBudget: .05,
interval: 100
}, r));
}

function Xn() {
return function(e) {
return Hn.add(e), e;
};
}

function Qn(e) {
var t, r, o, n, a = Object.getPrototypeOf(e);
try {
for (var i = p(Kn), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (c.target === a || Object.getPrototypeOf(c.target) === a || c.target === Object.getPrototypeOf(a)) {
var u = e[c.methodName];
if ("function" == typeof u) {
var l = u.bind(e);
_o.registerProcess({
id: c.options.id,
name: c.options.name,
priority: null !== (o = c.options.priority) && void 0 !== o ? o : yo.MEDIUM,
frequency: null !== (n = c.options.frequency) && void 0 !== n ? n : "medium",
minBucket: c.options.minBucket,
cpuBudget: c.options.cpuBudget,
interval: c.options.interval,
execute: l
}), $r.debug('Registered decorated process "'.concat(c.options.name, '" (').concat(c.options.id, ")"), {
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
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
}

var $n, Jn = {
updateInterval: 100,
minBucket: 0,
maxCpuBudget: .02,
defaultCpuLimit: 20
}, Zn = {
core: 1.5,
frontier: .8,
resource: 1,
backup: .5,
war: 1.2
}, ea = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = l(l({}, Jn), e), this.interShardMemory = {
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
var o = Wn(r);
o && (this.interShardMemory = o, $r.debug("Loaded InterShardMemory", {
subsystem: "Shard"
}));
}
} catch (e) {
var n = e instanceof Error ? e.message : String(e);
$r.error("Failed to load InterShardMemory: ".concat(n), {
subsystem: "Shard"
});
}
var a = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0";
this.interShardMemory.shards[a] || (this.interShardMemory.shards[a] = Dn(a));
}, e.prototype.run = function() {
this.lastRun = Game.time, this.updateCurrentShardHealth(), this.processInterShardTasks(), 
this.scanForPortals(), this.autoAssignShardRole(), Object.keys(this.interShardMemory.shards).length > 1 && this.distributeCpuLimits(), 
this.syncInterShardMemory(), Game.time % 500 == 0 && this.logShardStatus();
}, e.prototype.calculateCommodityIndex = function(e) {
var t, r, o, n, a, i = 0, s = 0;
try {
for (var c = p(e), u = c.next(); !u.done; u = c.next()) {
var l = u.value, m = l.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_FACTORY;
}
})[0];
if (m) {
s++, i += 5 * (null !== (a = m.level) && void 0 !== a ? a : 0), m.store.getUsedCapacity() > 0 && (i += 10);
var d = l.storage;
if (d) {
var f = [ RESOURCE_COMPOSITE, RESOURCE_CRYSTAL, RESOURCE_LIQUID, RESOURCE_GHODIUM_MELT, RESOURCE_OXIDANT, RESOURCE_REDUCTANT, RESOURCE_PURIFIER ];
try {
for (var y = (o = void 0, p(f)), h = y.next(); !h.done; h = y.next()) {
var g = h.value, v = d.store.getUsedCapacity(g);
v > 0 && (i += Math.min(10, v / 1e3));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
h && !h.done && (n = y.return) && n.call(y);
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
u && !u.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
if (0 === s) return 0;
var R = 105 * s;
return i = Math.min(100, i / R * 100), Math.round(i);
}, e.prototype.updateCurrentShardHealth = function() {
var e, t, r, o, n, a, i, s = null !== (a = null === (n = Game.shard) || void 0 === n ? void 0 : n.name) && void 0 !== a ? a : "shard0", c = this.interShardMemory.shards[s];
if (c) {
var u = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), l = Game.cpu.getUsed() / Game.cpu.limit, m = l < .5 ? "low" : l < .75 ? "medium" : l < .9 ? "high" : "critical", d = u.length > 0 ? u.reduce(function(e, t) {
var r, o;
return e + (null !== (o = null === (r = t.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0);
}, 0) / u.length : 0, f = 0;
try {
for (var y = p(u), h = y.next(); !h.done; h = y.next()) {
var g = h.value.storage;
if (g) {
var v = g.store.getUsedCapacity(RESOURCE_ENERGY);
f += Math.min(100, v / 5e3);
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
h && !h.done && (t = y.return) && t.call(y);
} finally {
if (e) throw e.error;
}
}
f = u.length > 0 ? f / u.length : 0;
var R = 0;
try {
for (var E = p(u), T = E.next(); !T.done; T = E.next()) {
var S = T.value.find(FIND_HOSTILE_CREEPS).length;
R += Math.min(100, 10 * S);
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
R = u.length > 0 ? R / u.length : 0, c.health = {
cpuCategory: m,
cpuUsage: Math.round(100 * l) / 100,
bucketLevel: Game.cpu.bucket,
economyIndex: Math.round(f),
warIndex: Math.round(R),
commodityIndex: this.calculateCommodityIndex(u),
roomCount: u.length,
avgRCL: Math.round(10 * d) / 10,
creepCount: Object.keys(Game.creeps).length,
lastUpdate: Game.time
};
var C = null !== (i = c.cpuHistory) && void 0 !== i ? i : [];
C.push({
tick: Game.time,
cpuLimit: Game.cpu.limit,
cpuUsed: Game.cpu.getUsed(),
bucketLevel: Game.cpu.bucket
}), c.cpuHistory = C.slice(-10), Game.cpu.shardLimits && (c.cpuLimit = Game.cpu.shardLimits[s]);
}
}, e.prototype.processInterShardTasks = function() {
var e, t, r, o, n = null !== (o = null === (r = Game.shard) || void 0 === r ? void 0 : r.name) && void 0 !== o ? o : "shard0", a = this.interShardMemory.tasks.filter(function(e) {
return e.targetShard === n && "pending" === e.status;
});
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
switch (c.type) {
case "colonize":
this.handleColonizeTask(c);
break;

case "reinforce":
this.handleReinforceTask(c);
break;

case "transfer":
this.handleTransferTask(c);
break;

case "evacuate":
this.handleEvacuateTask(c);
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
this.interShardMemory.tasks = this.interShardMemory.tasks.filter(function(e) {
return "pending" === e.status || "active" === e.status || Game.time - e.createdAt < 5e3;
});
}, e.prototype.handleColonizeTask = function(e) {
var t;
e.status = "active";
var r = null !== (t = e.targetRoom) && void 0 !== t ? t : "unknown";
$r.info("Processing colonize task: ".concat(r, " from ").concat(e.sourceShard), {
subsystem: "Shard"
});
}, e.prototype.handleReinforceTask = function(e) {
var t;
e.status = "active";
var r = null !== (t = e.targetRoom) && void 0 !== t ? t : "unknown";
$r.info("Processing reinforce task: ".concat(r, " from ").concat(e.sourceShard), {
subsystem: "Shard"
});
}, e.prototype.handleTransferTask = function(e) {
e.status = "active", $r.info("Processing transfer task from ".concat(e.sourceShard), {
subsystem: "Shard"
});
}, e.prototype.handleEvacuateTask = function(e) {
var t;
e.status = "active";
var r = null !== (t = e.targetRoom) && void 0 !== t ? t : "unknown";
$r.info("Processing evacuate task: ".concat(r, " to ").concat(e.targetShard), {
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
}), a = function(t) {
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
$r.info("Discovered portal in ".concat(e, " to ").concat(n, "/").concat(a), {
subsystem: "Shard"
});
}
}
};
try {
for (var i = (t = void 0, p(n)), s = i.next(); !s.done; s = i.next()) a(s.value);
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
};
for (var a in Game.rooms) n(a);
o.portals = o.portals.filter(function(e) {
return !e.decayTick || e.decayTick > Game.time;
});
}
}, e.prototype.autoAssignShardRole = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = this.interShardMemory.shards[r];
if (o) {
var n = o.health, a = Object.values(this.interShardMemory.shards), i = o.role;
n.warIndex > 50 ? i = "war" : n.roomCount < 3 && n.avgRCL < 4 ? i = "frontier" : n.economyIndex > 70 && n.roomCount >= 3 && n.avgRCL >= 6 ? i = "resource" : a.length > 1 && n.roomCount < 2 && n.avgRCL < 3 ? i = "backup" : n.roomCount >= 2 && n.avgRCL >= 4 && (i = "core"), 
"frontier" === o.role && n.roomCount >= 3 && n.avgRCL >= 5 && (i = "core", $r.info("Transitioning from frontier to core shard", {
subsystem: "Shard"
})), "war" === o.role && n.warIndex < 20 && (i = n.economyIndex > 70 && n.roomCount >= 3 ? "resource" : n.roomCount >= 2 ? "core" : "frontier", 
$r.info("War ended, transitioning to ".concat(i), {
subsystem: "Shard"
})), i !== o.role && (o.role = i, $r.info("Auto-assigned shard role: ".concat(i), {
subsystem: "Shard"
}));
}
}, e.prototype.calculateCpuEfficiency = function(e) {
var t, r;
if (!e.cpuHistory || 0 === e.cpuHistory.length) return 1;
var o = 0;
try {
for (var n = p(e.cpuHistory), a = n.next(); !a.done; a = n.next()) {
var i = a.value;
i.cpuLimit > 0 && (o += i.cpuUsed / i.cpuLimit);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return o / e.cpuHistory.length;
}, e.prototype.calculateShardWeight = function(e, t, r) {
var o = Zn[e.role], n = t === r ? Game.cpu.bucket : e.health.bucketLevel;
n < 2e3 ? o *= .8 : n < 5e3 ? o *= .9 : n > 9e3 && (o *= 1.1);
var a = this.calculateCpuEfficiency(e);
return a > .95 ? o *= 1.15 : a < .6 && (o *= .85), "war" === e.role && e.health.warIndex > 50 && (o *= 1.2), 
o;
}, e.prototype.distributeCpuLimits = function() {
var e, t, r, o, n, a;
try {
var i = this.interShardMemory.shards, s = Object.keys(i), c = Game.cpu.shardLimits ? Object.values(Game.cpu.shardLimits).reduce(function(e, t) {
return e + t;
}, 0) : this.config.defaultCpuLimit * s.length, u = null !== (a = null === (n = Game.shard) || void 0 === n ? void 0 : n.name) && void 0 !== a ? a : "shard0", l = {}, m = 0;
try {
for (var d = p(s), f = d.next(); !f.done; f = d.next()) {
var y = i[E = f.value];
if (y) {
var h = this.calculateShardWeight(y, E, u);
l[E] = h, m += h;
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
var g = {};
try {
for (var v = p(s), R = v.next(); !R.done; R = v.next()) {
var E;
l[E = R.value] && (g[E] = Math.max(5, Math.round(l[E] / m * c)));
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
var T = Game.cpu.shardLimits, S = s.some(function(e) {
var t, r;
return Math.abs((null !== (t = T[e]) && void 0 !== t ? t : 0) - (null !== (r = g[e]) && void 0 !== r ? r : 0)) > 1;
});
S && Game.cpu.setShardLimits(g) === OK && $r.info("Updated shard CPU limits: ".concat(JSON.stringify(g)), {
subsystem: "Shard"
});
}
} catch (e) {
var C = e instanceof Error ? e.message : String(e);
$r.debug("Could not set shard limits: ".concat(C), {
subsystem: "Shard"
});
}
}, e.prototype.syncInterShardMemory = function() {
try {
this.interShardMemory.lastSync = Game.time;
var e = this.validateInterShardMemory();
e.valid || ($r.warn("InterShardMemory validation failed: ".concat(e.errors.join(", ")), {
subsystem: "Shard"
}), this.repairInterShardMemory());
var t = Bn(this.interShardMemory);
if (t.length > Vn) {
$r.warn("InterShardMemory size exceeds limit: ".concat(t.length, "/").concat(Vn), {
subsystem: "Shard"
}), this.trimInterShardMemory();
var r = Bn(this.interShardMemory);
return r.length > Vn ? ($r.error("InterShardMemory still too large after trim: ".concat(r.length, "/").concat(Vn), {
subsystem: "Shard"
}), void this.emergencyTrim()) : void InterShardMemory.setLocal(r);
}
InterShardMemory.setLocal(t), Game.time % 50 == 0 && this.verifySyncIntegrity();
} catch (e) {
var o = e instanceof Error ? e.message : String(e);
$r.error("Failed to sync InterShardMemory: ".concat(o), {
subsystem: "Shard"
}), this.attemptSyncRecovery();
}
}, e.prototype.validateInterShardMemory = function() {
var e, t, r = [];
if ("number" != typeof this.interShardMemory.version && r.push("Invalid version"), 
"object" != typeof this.interShardMemory.shards) r.push("Invalid shards object"); else try {
for (var o = p(Object.entries(this.interShardMemory.shards)), n = o.next(); !n.done; n = o.next()) {
var a = d(n.value, 2), i = a[0], s = a[1];
s.health && "number" == typeof s.health.lastUpdate || r.push("Shard ".concat(i, " has invalid health data")), 
Array.isArray(s.portals) || r.push("Shard ".concat(i, " has invalid portals array")), 
Array.isArray(s.activeTasks) || r.push("Shard ".concat(i, " has invalid activeTasks array"));
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
for (var r = p(Object.entries(this.interShardMemory.shards)), o = r.next(); !o.done; o = r.next()) {
var n = d(o.value, 2), a = n[0], i = n[1];
i.health && "number" == typeof i.health.lastUpdate || (this.interShardMemory.shards[a] = Dn(a)), 
Array.isArray(i.portals) || (i.portals = []), Array.isArray(i.activeTasks) || (i.activeTasks = []);
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
$r.info("Repaired InterShardMemory structure", {
subsystem: "Shard"
});
}, e.prototype.verifySyncIntegrity = function() {
var e, t;
try {
var r = InterShardMemory.getLocal();
if (!r) return void $r.warn("InterShardMemory verification failed: no data present", {
subsystem: "Shard"
});
var o = Wn(r);
if (!o) return void $r.warn("InterShardMemory verification failed: deserialization failed", {
subsystem: "Shard"
});
var n = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0";
o.shards[n] || $r.warn("InterShardMemory verification failed: current shard ".concat(n, " not found"), {
subsystem: "Shard"
});
} catch (e) {
var a = e instanceof Error ? e.message : String(e);
$r.warn("InterShardMemory verification failed: ".concat(a), {
subsystem: "Shard"
});
}
}, e.prototype.attemptSyncRecovery = function() {
var e, t;
try {
$r.info("Attempting InterShardMemory recovery", {
subsystem: "Shard"
});
var r = InterShardMemory.getLocal();
if (r) {
var o = Wn(r);
if (o) return this.interShardMemory = o, void $r.info("Recovered InterShardMemory from storage", {
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
}, this.interShardMemory.shards[n] = Dn(n), $r.info("Recreated InterShardMemory with current shard only", {
subsystem: "Shard"
});
} catch (e) {
var a = e instanceof Error ? e.message : String(e);
$r.error("InterShardMemory recovery failed: ".concat(a), {
subsystem: "Shard"
});
}
}, e.prototype.emergencyTrim = function() {
var e, t, r, o = null !== (r = null === (t = Game.shard) || void 0 === t ? void 0 : t.name) && void 0 !== r ? r : "shard0", n = this.interShardMemory.shards[o];
n && (this.interShardMemory.shards = ((e = {})[o] = n, e), this.interShardMemory.tasks = this.interShardMemory.tasks.filter(function(e) {
return e.sourceShard === o || e.targetShard === o;
}), n.portals = n.portals.sort(function(e, t) {
return t.lastScouted - e.lastScouted;
}).slice(0, 10), $r.warn("Emergency trim applied to InterShardMemory", {
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
$r.info("Shard ".concat(r, " (").concat(o.role, "): ") + "".concat(n.roomCount, " rooms, RCL ").concat(n.avgRCL, ", ") + "CPU: ".concat(n.cpuCategory, ", Eco: ").concat(n.economyIndex, "%, War: ").concat(n.warIndex, "%"), {
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
r && (s.targetRoom = r), this.interShardMemory.tasks.push(s), $r.info("Created inter-shard task: ".concat(e, " to ").concat(t), {
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
n && (n.role = e, $r.info("Set shard role to: ".concat(e), {
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
this.interShardMemory.tasks.push(c), $r.info("Created resource transfer task: ".concat(o, " ").concat(r, " to ").concat(e, "/").concat(t), {
subsystem: "Shard"
});
}, e.prototype.getOptimalPortalRoute = function(e, t) {
var r, o, n, a, i = null !== (o = null === (r = Game.shard) || void 0 === r ? void 0 : r.name) && void 0 !== o ? o : "shard0", s = this.interShardMemory.shards[i];
if (!s) return null;
var c = s.portals.filter(function(t) {
return t.targetShard === e;
});
if (0 === c.length) return null;
var u = c.map(function(e) {
var r, o = 100;
e.isStable && (o += 50), o -= 15 * e.threatRating, o += Math.min(2 * (null !== (r = e.traversalCount) && void 0 !== r ? r : 0), 20), 
t && (o -= 2 * Game.map.getRoomLinearDistance(t, e.sourceRoom));
var n = Game.time - e.lastScouted;
return n < 1e3 ? o += 10 : n > 5e3 && (o -= 10), {
portal: e,
score: o
};
});
return u.sort(function(e, t) {
return t.score - e.score;
}), null !== (a = null === (n = u[0]) || void 0 === n ? void 0 : n.portal) && void 0 !== a ? a : null;
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
t && (t.status = "failed", t.updatedAt = Game.time, $r.info("Cancelled task ".concat(e), {
subsystem: "Shard"
}));
}, e.prototype.getSyncStatus = function() {
var e, t, r = Bn(this.interShardMemory).length, o = r / Vn * 100, n = Game.time - this.interShardMemory.lastSync, a = r < 92160 && n < 500, i = 0;
try {
for (var s = p(Object.values(this.interShardMemory.shards)), c = s.next(); !c.done; c = s.next()) i += c.value.portals.length;
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
return {
lastSync: this.interShardMemory.lastSync,
ticksSinceSync: n,
memorySize: r,
sizePercent: Math.round(100 * o) / 100,
shardsTracked: Object.keys(this.interShardMemory.shards).length,
activeTasks: this.interShardMemory.tasks.filter(function(e) {
return "pending" === e.status || "active" === e.status;
}).length,
totalPortals: i,
isHealthy: a
};
}, e.prototype.forceSync = function() {
$r.info("Forcing InterShardMemory sync with validation", {
subsystem: "Shard"
}), this.syncInterShardMemory();
}, e.prototype.getMemoryStats = function() {
var e, t, r = Bn(this.interShardMemory).length, o = Bn(l(l({}, this.interShardMemory), {
tasks: [],
globalTargets: {
targetPowerLevel: 0
}
})).length, n = JSON.stringify(this.interShardMemory.tasks).length, a = 0;
try {
for (var i = p(Object.values(this.interShardMemory.shards)), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
a += JSON.stringify(c.portals).length;
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
size: r,
limit: Vn,
percent: Math.round(r / Vn * 1e4) / 100,
breakdown: {
shards: o,
tasks: n,
portals: a,
other: r - o - n
}
};
}, m([ qn("empire:shard", "Shard Manager", {
priority: yo.LOW,
interval: 100,
minBucket: 0,
cpuBudget: .02
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), ta = new ea, ra = function() {
function e() {
Memory.crossShardTransfers || (Memory.crossShardTransfers = {
requests: {},
lastUpdate: Game.time
}), this.memory = Memory.crossShardTransfers;
}
return e.prototype.run = function() {
var e, t, r, o;
this.cleanupOldRequests();
var n = ta.getActiveTransferTasks();
try {
for (var a = p(n), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
if ("transfer" === s.type && s.resourceType && s.resourceAmount && !this.memory.requests[s.id]) {
var c = null !== (o = null === (r = Game.shard) || void 0 === r ? void 0 : r.name) && void 0 !== o ? o : "shard0";
s.sourceShard === c && this.createTransferRequest(s);
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
for (var u in this.memory.requests) {
var l = this.memory.requests[u];
l && this.processTransferRequest(l);
}
this.memory.lastUpdate = Game.time;
}, e.prototype.createTransferRequest = function(e) {
if (e.resourceType && e.resourceAmount && e.targetRoom) {
var t = ta.getOptimalPortalRoute(e.targetShard);
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
this.memory.requests[e.id] = o, $r.info("Created transfer request: ".concat(e.resourceAmount, " ").concat(e.resourceType, " from ").concat(r, " to ").concat(e.targetShard, "/").concat(e.targetRoom), {
subsystem: "CrossShardTransfer"
});
} else $r.warn("No room with sufficient ".concat(e.resourceType, " for transfer"), {
subsystem: "CrossShardTransfer"
});
} else $r.warn("No portal found to ".concat(e.targetShard, ", cannot create transfer request"), {
subsystem: "CrossShardTransfer"
});
}
}, e.prototype.findSourceRoom = function(e, t) {
var r, o, n = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.terminal && e.storage;
});
try {
for (var a = p(n), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.terminal, u = s.storage;
if (c && c.store.getUsedCapacity(e) >= t) return s.name;
if (u && u.store.getUsedCapacity(e) >= t) return s.name;
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
ta.updateTaskProgress(e.taskId, t);
}, e.prototype.handleQueuedRequest = function(e) {
var t, r = e.amount - e.transferred, o = e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
}).reduce(function(e, t) {
return e + t.carryCapacity;
}, 0);
if (o >= r) return e.status = "gathering", void $r.info("Transfer request ".concat(e.taskId, " moving to gathering phase"), {
subsystem: "CrossShardTransfer"
});
var n = Game.rooms[e.sourceRoom];
if (n && (null === (t = n.controller) || void 0 === t ? void 0 : t.my)) {
var a, i = r - o, s = n.energyCapacityAvailable;
try {
a = function(e) {
switch (e.role) {
case "harvester":
case "staticMiner":
case "mineralHarvester":
case "remoteHarvester":
return function(e) {
var t = e.maxEnergy, r = Math.min(10, Math.floor(t / 100));
r = Math.max(2, r);
for (var o = Math.max(1, Math.ceil((r + 1) / 2)), n = 100 * r + 50 + 50 * o; n > t && r > 2; ) n = 100 * --r + 50 + 50 * (o = Math.max(1, Math.ceil((r + 1) / 2)));
if (n > t) for (;o > 1 && n > t; ) n = 100 * r + 50 + 50 * --o;
for (var a = [], i = 0; i < r; i++) a.push(WORK);
for (i = 0; i < 1; i++) a.push(CARRY);
for (i = 0; i < o; i++) a.push(MOVE);
var s = In(a);
return {
parts: a,
cost: s,
minCapacity: s
};
}(e);

case "hauler":
case "carrier":
case "queenCarrier":
case "remoteHauler":
case "interRoomCarrier":
case "crossShardCarrier":
return function(e) {
var t = e.maxEnergy, r = e.distance, o = void 0 === r ? 10 : r, n = e.hasRoads, a = void 0 !== n && n, i = e.energyPerTick, s = a ? 2 : 1, c = (void 0 === i ? 10 : i) * (2 * o), u = Math.ceil(c / 50), l = Math.ceil(u / s), m = 50 * u + 50 * l;
if (m > t) {
var p = t / m;
m = 50 * (u = Math.max(2, Math.floor(u * p))) + 50 * (l = Math.ceil(u / s));
}
u = Math.max(2, Math.min(25, u)), l = Math.max(1, Math.min(25, l));
for (var d = [], f = 0; f < u; f++) d.push(CARRY);
for (f = 0; f < l; f++) d.push(MOVE);
return {
parts: d,
cost: In(d),
minCapacity: In(d)
};
}(e);

case "upgrader":
return function(e) {
for (var t = e.maxEnergy, r = Math.floor(t / 450), o = Math.max(1, Math.min(15, 3 * r)), n = Math.max(1, Math.ceil(o / 3)), a = Math.max(1, Math.ceil((o + n) / 2)), i = [], s = 0; s < o; s++) i.push(WORK);
for (s = 0; s < n; s++) i.push(CARRY);
for (s = 0; s < a; s++) i.push(MOVE);
return {
parts: i,
cost: In(i),
minCapacity: In(i)
};
}(e);

case "builder":
case "engineer":
case "remoteWorker":
default:
return function(e) {
for (var t = e.maxEnergy, r = Math.floor(t / 200), o = Math.max(1, Math.min(16, r)), n = o, a = o, i = [], s = 0; s < o; s++) i.push(WORK);
for (s = 0; s < n; s++) i.push(CARRY);
for (s = 0; s < a; s++) i.push(MOVE);
return {
parts: i,
cost: In(i),
minCapacity: In(i)
};
}(e);

case "guard":
case "soldier":
return function(e) {
var t, r, o, n = e.maxEnergy, a = e.willBoost;
if (void 0 !== a && a) {
var i = 580, s = Math.max(1, Math.floor(n / i));
t = Math.min(10, s), r = Math.min(20, 4 * s), o = Math.min(30, 5 * s);
} else i = 580, s = Math.max(1, Math.floor(n / i)), t = Math.max(1, s), r = Math.max(1, 4 * s), 
o = Math.max(1, 5 * s);
for (var c = [], u = 0; u < t; u++) c.push(TOUGH);
for (u = 0; u < r; u++) c.push(ATTACK);
for (u = 0; u < o; u++) c.push(MOVE);
return {
parts: c,
cost: In(c),
minCapacity: In(c)
};
}(e);

case "ranger":
return function(e) {
var t, r, o, n = e.maxEnergy, a = e.willBoost;
if (void 0 !== a && a) {
var i = 210, s = Math.floor(n / i);
t = Math.min(5, Math.floor(.1 * s)), r = Math.min(25, Math.floor(.6 * s)), o = Math.min(20, Math.ceil(.3 * s));
} else i = 210, s = Math.floor(n / i), t = Math.max(1, Math.min(5, Math.floor(.1 * s))), 
r = Math.max(1, Math.min(20, Math.floor(.5 * s))), o = Math.max(1, Math.min(20, Math.ceil(.4 * s)));
for (var c = [], u = 0; u < t; u++) c.push(TOUGH);
for (u = 0; u < r; u++) c.push(RANGED_ATTACK);
for (u = 0; u < o; u++) c.push(MOVE);
return {
parts: c,
cost: In(c),
minCapacity: In(c)
};
}(e);

case "healer":
return function(e) {
for (var t = e.maxEnergy, r = Math.floor(t / 300), o = Math.max(1, Math.min(25, r)), n = o, a = [], i = 0; i < o; i++) a.push(HEAL);
for (i = 0; i < n; i++) a.push(MOVE);
return {
parts: a,
cost: In(a),
minCapacity: In(a)
};
}(e);
}
}({
maxEnergy: s,
role: "crossShardCarrier"
});
} catch (e) {
return void $r.error("Failed to optimize body for crossShardCarrier: ".concat(String(e)), {
subsystem: "CrossShardTransfer"
});
}
var c = 50 * a.parts.filter(function(e) {
return e === CARRY;
}).length, u = Math.ceil(i / c), l = Math.min(u, 3), m = kn.NORMAL;
m = e.priority >= 80 ? kn.HIGH : e.priority >= 50 ? kn.NORMAL : kn.LOW;
for (var p = 0; p < l; p++) {
var d = {
transferRequestId: e.taskId,
portalRoom: e.portalRoom,
targetShard: e.targetShard,
workflowState: "gathering"
}, f = {
id: "crossShardCarrier_".concat(e.taskId, "_").concat(p, "_").concat(Game.time),
roomName: e.sourceRoom,
role: "crossShardCarrier",
family: "economy",
body: a,
priority: m,
createdAt: Game.time,
targetRoom: e.targetRoom,
additionalMemory: d
};
Ln.addRequest(f), $r.info("Requested spawn of crossShardCarrier for transfer ".concat(e.taskId, " (").concat(p + 1, "/").concat(l, ")"), {
subsystem: "CrossShardTransfer"
});
}
$r.debug("Transfer request ".concat(e.taskId, " needs ").concat(i, " carry capacity, requested ").concat(l, " carriers"), {
subsystem: "CrossShardTransfer"
});
} else $r.warn("Source room ".concat(e.sourceRoom, " not available for spawning carriers"), {
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
}) && (e.status = "moving", $r.info("Transfer request ".concat(e.taskId, " moving to portal"), {
subsystem: "CrossShardTransfer"
})) : e.status = "queued";
}, e.prototype.handleMovingRequest = function(e) {
var t = e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
});
if (0 === t.length) return e.status = "failed", void ta.updateTaskProgress(e.taskId, e.transferred, "failed");
t.filter(function(t) {
return t.room.name === e.portalRoom;
}).length > 0 && (e.status = "transferring", $r.info("Transfer request ".concat(e.taskId, " reached portal, transferring"), {
subsystem: "CrossShardTransfer"
}));
}, e.prototype.handleTransferringRequest = function(e) {
0 === e.assignedCreeps.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return void 0 !== e;
}).length && (e.status = "complete", e.transferred = e.amount, ta.updateTaskProgress(e.taskId, 100, "complete"), 
ta.recordPortalTraversal(e.portalRoom, e.targetShard, !0), $r.info("Transfer request ".concat(e.taskId, " completed"), {
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
r && !r.assignedCreeps.includes(t) && (r.assignedCreeps.push(t), $r.info("Assigned creep ".concat(t, " to transfer request ").concat(e), {
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
}(), oa = new ra, na = new Map, aa = -1, ia = null;

function sa(e, t) {
var r, o;
void 0 === t && (t = !1), aa === Game.time && ia === Game.creeps || (na.clear(), 
aa = Game.time, ia = Game.creeps);
var n = t ? "".concat(e, "_active") : e, a = na.get(n);
if (a && a instanceof Map) return a;
var i = new Map;
for (var s in Game.creeps) {
var c = Game.creeps[s], u = c.memory;
if (u.homeRoom === e) {
if (t && c.spawning) continue;
var l = null !== (r = u.role) && void 0 !== r ? r : "unknown";
i.set(l, (null !== (o = i.get(l)) && void 0 !== o ? o : 0) + 1);
}
}
return na.set(n, i), i;
}

function ca(e, t, r) {
var o, n, a = 0;
try {
for (var i = p(Object.values(Game.creeps)), s = i.next(); !s.done; s = i.next()) {
var c = s.value.memory;
c.homeRoom === e && c.role === t && c.targetRoom === r && a++;
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
return a;
}

function ua(e, t, r) {
var o, n, a, i, s, c = null !== (a = r.remoteAssignments) && void 0 !== a ? a : [];
if (0 === c.length) return null;
try {
for (var u = p(c), l = u.next(); !l.done; l = u.next()) {
var m = l.value, d = ca(e, t, m), f = Game.rooms[m];
if (d < ("remoteHarvester" === t ? f ? Wo(f).length : 2 : "remoteHauler" === t && f ? Mn(e, m, Wo(f).length, null !== (s = null === (i = Game.rooms[e]) || void 0 === i ? void 0 : i.energyCapacityAvailable) && void 0 !== s ? s : 800).recommendedHaulers : 2)) return m;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
l && !l.done && (n = u.return) && n.call(u);
} finally {
if (o) throw o.error;
}
}
return null;
}

function la(e, t, r, o) {
var n, a, i;
if ("remoteHarvester" === e || "remoteHauler" === e) {
var s = ua(o, e, r);
return !!s && (t.targetRoom = s, !0);
}
if ("remoteWorker" === e) {
var c = null !== (i = r.remoteAssignments) && void 0 !== i ? i : [];
if (c.length > 0) {
var u = 1 / 0, l = [];
try {
for (var m = p(c), d = m.next(); !d.done; d = m.next()) {
var f = d.value, y = ca(o, e, f);
y < u ? (u = y, l = [ f ]) : y === u && l.push(f);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
d && !d.done && (a = m.return) && a.call(m);
} finally {
if (n) throw n.error;
}
}
var h = l.length > 1 ? l[Game.time % l.length] : l[0];
return t.targetRoom = h, !0;
}
return !1;
}
return !0;
}

function ma(e, t, r, o) {
var n, a, i, s, c;
void 0 === o && (o = !1);
var u = Zo[t];
if (!u) return !1;
if ("larvaWorker" === t && !o) return !1;
if ("remoteHarvester" === t || "remoteHauler" === t) return null !== ua(e, t, r);
if ("remoteWorker" === t) {
if (0 === (m = null !== (i = r.remoteAssignments) && void 0 !== i ? i : []).length) return !1;
var l = function(e, t) {
aa === Game.time && ia === Game.creeps || (na.clear(), aa = Game.time, ia = Game.creeps);
var r = "".concat(e, ":").concat(t), o = na.get(r);
if ("number" == typeof o) return o;
var n = 0;
for (var a in Game.creeps) {
var i = Game.creeps[a].memory;
i.homeRoom === e && i.role === t && n++;
}
return na.set(r, n), n;
}(e, "remoteWorker");
return l < u.maxPerRoom;
}
if ("remoteGuard" === t) {
var m;
if (0 === (m = null !== (s = r.remoteAssignments) && void 0 !== s ? s : []).length) return !1;
try {
for (var d = p(m), f = d.next(); !f.done; f = d.next()) {
var y = f.value, h = Game.rooms[y];
if (h) {
var g = Bo(h, FIND_HOSTILE_CREEPS).filter(function(e) {
return e.body.some(function(e) {
return e.type === ATTACK || e.type === RANGED_ATTACK || e.type === WORK;
});
});
if (g.length > 0 && ca(e, t, y) < Math.min(u.maxPerRoom, Math.ceil(g.length / 2))) return !0;
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (a = d.return) && a.call(d);
} finally {
if (n) throw n.error;
}
}
return !1;
}
var v = null !== (c = sa(e).get(t)) && void 0 !== c ? c : 0, R = u.maxPerRoom;
if ("upgrader" === t && r.clusterId && (null == (_ = Cn.getCluster(r.clusterId)) ? void 0 : _.focusRoom) === e) {
var E = Game.rooms[e];
(null == E ? void 0 : E.controller) && (R = E.controller.level <= 3 ? 2 : E.controller.level <= 6 ? 4 : 6);
}
if (v >= R) return !1;
var T = Game.rooms[e];
if (!T) return !1;
if ("scout" === t) return !(r.danger >= 1) && "defensive" !== r.posture && "war" !== r.posture && "siege" !== r.posture && (0 === v || "expand" === r.posture && v < u.maxPerRoom);
if ("claimer" === t) {
var S = Cn.getEmpire(), C = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), w = C.length < Game.gcl.level, b = S.claimQueue.some(function(e) {
return !e.claimed;
}), x = function(e, t) {
var r, o, n, a, i, s, c = null !== (n = t.remoteAssignments) && void 0 !== n ? n : [];
if (0 === c.length) return !1;
var u, l = (u = Object.values(Game.spawns)).length > 0 ? u[0].owner.username : "", m = function(e) {
var t = Game.rooms[e];
if (null == t ? void 0 : t.controller) {
var r = t.controller;
if (r.owner) return "continue";
var o = (null === (a = r.reservation) || void 0 === a ? void 0 : a.username) === l, n = null !== (s = null === (i = r.reservation) || void 0 === i ? void 0 : i.ticksToEnd) && void 0 !== s ? s : 0;
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
for (var d = p(c), f = d.next(); !f.done; f = d.next()) {
var y = m(f.value);
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
return !(!w || !b) || !!x;
}
if ("mineralHarvester" === t) {
var O = T.find(FIND_MINERALS)[0];
if (!O) return !1;
if (!O.pos.lookFor(LOOK_STRUCTURES).find(function(e) {
return e.structureType === STRUCTURE_EXTRACTOR;
})) return !1;
if (0 === O.mineralAmount) return !1;
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
var _;
if (!(_ = Cn.getCluster(r.clusterId)) || !_.resourceRequests || 0 === _.resourceRequests.length) return !1;
if (!(U = _.resourceRequests.some(function(e) {
if (e.fromRoom !== T.name) return !1;
var t = e.assignedCreeps.filter(function(e) {
return Game.creeps[e];
}).length;
return e.amount - e.delivered > 500 && t < 2;
}))) return !1;
}
if ("crossShardCarrier" === t) {
var A = oa.getActiveRequests();
if (0 === A.length) return !1;
var U = A.some(function(e) {
var t, r;
if (e.sourceRoom !== T.name) return !1;
var o = e.assignedCreeps || [], n = e.amount - e.transferred, a = 0, i = 0;
try {
for (var s = p(o), c = s.next(); !c.done; c = s.next()) {
var u = c.value, l = Game.creeps[u];
l && (a += l.carryCapacity, i++);
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
return a < n && i < 3;
});
if (!U) return !1;
}
return !0;
}

function pa(e) {
var t, r;
return (null !== (t = e.get("harvester")) && void 0 !== t ? t : 0) + (null !== (r = e.get("larvaWorker")) && void 0 !== r ? r : 0);
}

function da(e) {
var t = Wo(e);
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

function fa(e, t) {
var r, o, n, a, i = sa(e, !0);
if (0 === pa(i)) return !0;
if (0 === function(e) {
var t, r;
return (null !== (t = e.get("hauler")) && void 0 !== t ? t : 0) + (null !== (r = e.get("larvaWorker")) && void 0 !== r ? r : 0);
}(i) && (null !== (n = i.get("harvester")) && void 0 !== n ? n : 0) > 0) return !0;
var s = sa(e, !1), c = da(t);
try {
for (var u = p(c), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
if ((!m.condition || m.condition(t)) && (null !== (a = s.get(m.role)) && void 0 !== a ? a : 0) < m.minCount) return !0;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
return !1;
}

function ya(e, t) {
var r, o, n = null;
try {
for (var a = p(e.bodies), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
s.cost <= t && (!n || s.cost > n.cost) && (n = s);
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
return n;
}

function ha(e) {
return "".concat(e, "_").concat(Game.time, "_").concat(Math.floor(1e3 * Math.random()));
}

function ga(e, t) {
var r, o, n, a, i, s, c = Vo(e, STRUCTURE_SPAWN).find(function(e) {
return !e.spawning;
});
if (c) {
var u = e.energyCapacityAvailable, l = e.energyAvailable, m = 0 === pa(sa(e.name, !0)), f = m ? l : u;
if (m && l < 150 && ($r.warn("WORKFORCE COLLAPSE: ".concat(l, " energy available, need 150 to spawn minimal larvaWorker. ") + "Room will recover once energy reaches 150.", {
subsystem: "spawn",
room: e.name
}), _o.emit("spawn.emergency", {
roomName: e.name,
energyAvailable: l,
message: "Critical workforce collapse - waiting for energy to spawn minimal creep",
source: "SpawnManager"
})), fa(e.name, e) && Game.time % 10 == 0) {
var y = sa(e.name, !0), h = sa(e.name, !1), g = null !== (n = y.get("larvaWorker")) && void 0 !== n ? n : 0, v = null !== (a = y.get("harvester")) && void 0 !== a ? a : 0;
$r.info("BOOTSTRAP MODE: ".concat(pa(y), " active energy producers ") + "(".concat(g, " larva, ").concat(v, " harvest), ").concat(pa(h), " total. ") + "Energy: ".concat(l, "/").concat(u), {
subsystem: "spawn",
room: e.name
});
}
if (fa(e.name, e)) {
var R = function(e, t, r) {
var o, n, a;
if (0 === pa(sa(e, !0))) return $r.info("Bootstrap: Spawning larvaWorker (emergency - no active energy producers)", {
subsystem: "spawn",
room: e
}), "larvaWorker";
var i = sa(e, !1), s = da(t);
$r.info("Bootstrap: Checking ".concat(s.length, " roles in order"), {
subsystem: "spawn",
room: e,
meta: {
totalCreeps: i.size,
creepCounts: Array.from(i.entries())
}
});
try {
for (var c = p(s), u = c.next(); !u.done; u = c.next()) {
var l = u.value;
if (!l.condition || l.condition(t)) {
var m = null !== (a = i.get(l.role)) && void 0 !== a ? a : 0;
if (m < l.minCount) {
var d = ma(e, l.role, r, !0);
if ($r.info("Bootstrap: Role ".concat(l.role, " needs spawning (current: ").concat(m, ", min: ").concat(l.minCount, ", needsRole: ").concat(d, ")"), {
subsystem: "spawn",
room: e
}), d) return l.role;
$r.warn("Bootstrap: Role ".concat(l.role, " blocked by needsRole check (current: ").concat(m, "/").concat(l.minCount, ")"), {
subsystem: "spawn",
room: e
});
}
} else $r.info("Bootstrap: Skipping ".concat(l.role, " (condition not met)"), {
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
u && !u.done && (n = c.return) && n.call(c);
} finally {
if (o) throw o.error;
}
}
return $r.info("Bootstrap: No role needs spawning", {
subsystem: "spawn",
room: e
}), null;
}(e.name, e, t);
if (!R) return;
if (!(O = Zo[R])) return;
var E = ya(O, f);
if (E && l >= E.cost) ; else if (!(E = ya(O, l))) return void $r.info("Bootstrap: No affordable body for ".concat(R, " (available: ").concat(l, ", min needed: ").concat(null !== (s = null === (i = O.bodies[0]) || void 0 === i ? void 0 : i.cost) && void 0 !== s ? s : "unknown", ")"), {
subsystem: "spawn",
room: e.name
});
var T = ha(R);
if (!la(R, _ = {
role: O.role,
family: O.family,
homeRoom: e.name,
version: 1
}, t, e.name)) return;
var S = void 0;
try {
S = c.spawnCreep(E.parts, T, {
memory: _
});
} catch (t) {
return void $r.error("EXCEPTION during spawn attempt for ".concat(R, ": ").concat(t), {
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
if (S === OK) $r.info("BOOTSTRAP SPAWN: ".concat(R, " (").concat(T, ") with ").concat(E.parts.length, " parts, cost ").concat(E.cost, ". Recovery in progress."), {
subsystem: "spawn",
room: e.name
}), _o.emit("spawn.completed", {
roomName: e.name,
creepName: T,
role: R,
cost: E.cost,
source: "SpawnManager"
}); else {
var C = S === ERR_NOT_ENOUGH_ENERGY ? "ERR_NOT_ENOUGH_ENERGY" : S === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" : S === ERR_BUSY ? "ERR_BUSY" : S === ERR_NOT_OWNER ? "ERR_NOT_OWNER" : S === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" : S === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" : "UNKNOWN(".concat(S, ")");
$r.warn("BOOTSTRAP SPAWN FAILED: ".concat(R, " (").concat(T, ") - ").concat(C, ". Body: ").concat(E.parts.length, " parts, cost: ").concat(E.cost, ", available: ").concat(l), {
subsystem: "spawn",
room: e.name,
meta: {
errorCode: S,
errorName: C,
role: R,
bodyCost: E.cost,
energyAvailable: l,
energyCapacity: u
}
});
}
} else {
var w = function(e, t) {
var r, o, n, a, i = sa(e.name), s = function(e) {
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
}(t.posture), c = [];
try {
for (var u = p(Object.entries(Zo)), l = u.next(); !l.done; l = u.next()) {
var m = d(l.value, 2), f = m[0], y = m[1];
if (ma(e.name, f, t)) {
var h = y.priority, g = null !== (n = s[f]) && void 0 !== n ? n : .5, v = An(f, t.pheromones), R = _n(e, t, f), E = null !== (a = i.get(f)) && void 0 !== a ? a : 0, T = (h + R) * g * v * (y.maxPerRoom > 0 ? Math.max(.1, 1 - E / y.maxPerRoom) : .1);
c.push({
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
l && !l.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
return c.sort(function(e, t) {
return t.score - e.score;
}), c.map(function(e) {
return e.role;
});
}(e, t);
try {
for (var b = p(w), x = b.next(); !x.done; x = b.next()) {
var O;
if (R = x.value, O = Zo[R]) {
var _, A = ya(O, f);
if (A && !(l < A.cost) && (T = ha(R), la(R, _ = {
role: O.role,
family: O.family,
homeRoom: e.name,
version: 1
}, t, e.name))) {
if ("interRoomCarrier" === R && t.clusterId) {
var U = Cn.getCluster(t.clusterId);
if (U) {
var N = U.resourceRequests.find(function(t) {
if (t.fromRoom !== e.name) return !1;
var r = t.assignedCreeps.filter(function(e) {
return Game.creeps[e];
}).length;
return t.amount - t.delivered > 500 && r < 2;
});
N && (_.transferRequest = {
fromRoom: N.fromRoom,
toRoom: N.toRoom,
resourceType: N.resourceType,
amount: N.amount
}, N.assignedCreeps.push(T));
}
}
if ((S = c.spawnCreep(A.parts, T, {
memory: _
})) === OK) return void _o.emit("spawn.completed", {
roomName: e.name,
creepName: T,
role: R,
cost: A.cost,
source: "SpawnManager"
});
if (S !== ERR_NOT_ENOUGH_ENERGY) return C = S === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" : S === ERR_BUSY ? "ERR_BUSY" : S === ERR_NOT_OWNER ? "ERR_NOT_OWNER" : S === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" : S === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" : "UNKNOWN(".concat(S, ")"), 
void $r.warn("Spawn failed for ".concat(R, ": ").concat(C, ". Body: ").concat(A.parts.length, " parts, cost: ").concat(A.cost), {
subsystem: "spawn",
room: e.name,
meta: {
errorCode: S,
errorName: C,
role: R,
bodyCost: A.cost
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
x && !x.done && (o = b.return) && o.call(b);
} finally {
if (r) throw r.error;
}
}
w.length > 0 && Game.time % 20 == 0 ? $r.info("Waiting for energy: ".concat(w.length, " roles need spawning, waiting for optimal bodies. ") + "Energy: ".concat(l, "/").concat(u), {
subsystem: "spawn",
room: e.name,
meta: {
topRoles: w.slice(0, 3).join(", "),
energyAvailable: l,
energyCapacity: u
}
}) : 0 === w.length && Game.time % 100 == 0 && $r.info("No spawns needed: All roles fully staffed. Energy: ".concat(l, "/").concat(u), {
subsystem: "spawn",
room: e.name,
meta: {
energyAvailable: l,
energyCapacity: u,
activeCreeps: sa(e.name, !0).size
}
});
}
}
}

var va = Qr("CreepContext"), Ra = (($n = {})[STRUCTURE_SPAWN] = 100, $n[STRUCTURE_EXTENSION] = 90, 
$n[STRUCTURE_TOWER] = 80, $n[STRUCTURE_RAMPART] = 75, $n[STRUCTURE_WALL] = 70, $n[STRUCTURE_STORAGE] = 70, 
$n[STRUCTURE_CONTAINER] = 60, $n[STRUCTURE_ROAD] = 30, $n), Ea = new Map;

function Ta(e) {
e._allStructuresLoaded || (e.allStructures = e.room.find(FIND_STRUCTURES), e._allStructuresLoaded = !0);
}

function Sa(e) {
return void 0 === e._prioritizedSites && (e._prioritizedSites = e.room.find(FIND_MY_CONSTRUCTION_SITES).sort(function(e, t) {
var r, o, n = null !== (r = Ra[e.structureType]) && void 0 !== r ? r : 50;
return (null !== (o = Ra[t.structureType]) && void 0 !== o ? o : 50) - n;
})), e._prioritizedSites;
}

function Ca(e) {
return void 0 === e._repairTargets && (Ta(e), e._repairTargets = e.allStructures.filter(function(e) {
return e.hits < .75 * e.hitsMax && e.structureType !== STRUCTURE_WALL;
})), e._repairTargets;
}

function wa(e) {
var r, o, n = e.room, a = e.memory, i = function(e) {
var r = Ea.get(e.name);
if (r && r.tick === Game.time) return r;
var o = {
tick: Game.time,
room: e,
hostiles: t.safeFind(e, FIND_HOSTILE_CREEPS),
myStructures: e.find(FIND_MY_STRUCTURES),
allStructures: []
};
return Ea.set(e.name, o), o;
}(n);
void 0 === a.working && (a.working = e.store.getUsedCapacity() > 0, va.debug("".concat(e.name, " initialized working=").concat(a.working, " from carry state"), {
creep: e.name
}));
var s = null !== (r = a.homeRoom) && void 0 !== r ? r : n.name;
return {
creep: e,
room: n,
memory: a,
get swarmState() {
return function(e) {
var t, r = null === (t = Memory.rooms) || void 0 === t ? void 0 : t[e];
return null == r ? void 0 : r.swarm;
}(n.name);
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
isInHomeRoom: n.name === s,
isFull: 0 === e.store.getFreeCapacity(),
isEmpty: 0 === e.store.getUsedCapacity(),
isWorking: null !== (o = a.working) && void 0 !== o && o,
get assignedSource() {
return function(e) {
return e.sourceId ? Game.getObjectById(e.sourceId) : null;
}(a);
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
for (var n = p(t), a = n.next(); !a.done; a = n.next()) {
var i = a.value, s = Math.abs(e.x - i.pos.x), c = Math.abs(e.y - i.pos.y);
if (Math.max(s, c) <= 10) return !0;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
a && !a.done && (o = n.return) && o.call(n);
} finally {
if (r) throw r.error;
}
}
return !1;
}(e.pos, i.hostiles);
},
get constructionSiteCount() {
return Sa(i).length;
},
get damagedStructureCount() {
return Ca(i).length;
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
return void 0 === (e = i)._containers && (Ta(e), e._containers = e.allStructures.filter(function(e) {
return e.structureType === STRUCTURE_CONTAINER;
})), e._containers;
var e;
},
get depositContainers() {
return void 0 === (e = i)._depositContainers && (Ta(e), e._depositContainers = e.allStructures.filter(function(e) {
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
storage: n.storage,
terminal: n.terminal,
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
return Sa(i);
},
get repairTargets() {
return Ca(i);
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

var ba, xa = {}, Oa = function() {
if (ba) return xa;
ba = 1, Object.defineProperty(xa, "__esModule", {
value: !0
});
var e = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : void 0 !== T ? T : "undefined" != typeof self ? self : {}, t = function(e) {
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
}), s = i, c = Function.prototype.call, u = s ? c.bind(c) : function() {
return c.apply(c, arguments);
}, l = {}, m = {}.propertyIsEnumerable, p = Object.getOwnPropertyDescriptor, d = p && !m.call({
1: 2
}, 1);
l.f = d ? function(e) {
var t = p(this, e);
return !!t && t.enumerable;
} : m;
var f, y, h = function(e, t) {
return {
enumerable: !(1 & e),
configurable: !(2 & e),
writable: !(4 & e),
value: t
};
}, g = i, v = Function.prototype, R = v.call, E = g && v.bind.bind(R, R), S = g ? E : function(e) {
return function() {
return R.apply(e, arguments);
};
}, C = S, w = C({}.toString), b = C("".slice), x = function(e) {
return b(w(e), 8, -1);
}, O = n, _ = x, A = Object, U = S("".split), N = O(function() {
return !A("z").propertyIsEnumerable(0);
}) ? function(e) {
return "String" === _(e) ? U(e, "") : A(e);
} : A, M = function(e) {
return null == e;
}, k = M, P = TypeError, I = function(e) {
if (k(e)) throw new P("Can't call method on " + e);
return e;
}, G = N, L = I, D = function(e) {
return G(L(e));
}, F = "object" == typeof document && document.all, B = void 0 === F && void 0 !== F ? function(e) {
return "function" == typeof e || e === F;
} : function(e) {
return "function" == typeof e;
}, W = B, V = function(e) {
return "object" == typeof e ? null !== e : W(e);
}, K = r, H = B, j = function(e, t) {
return arguments.length < 2 ? (r = K[e], H(r) ? r : void 0) : K[e] && K[e][t];
var r;
}, Y = S({}.isPrototypeOf), q = r.navigator, z = q && q.userAgent, X = r, Q = z ? String(z) : "", $ = X.process, J = X.Deno, Z = $ && $.versions || J && J.version, ee = Z && Z.v8;
ee && (y = (f = ee.split("."))[0] > 0 && f[0] < 4 ? 1 : +(f[0] + f[1])), !y && Q && (!(f = Q.match(/Edge\/(\d+)/)) || f[1] >= 74) && (f = Q.match(/Chrome\/(\d+)/)) && (y = +f[1]);
var te = y, re = n, oe = r.String, ne = !!Object.getOwnPropertySymbols && !re(function() {
var e = Symbol("symbol detection");
return !oe(e) || !(Object(e) instanceof Symbol) || !Symbol.sham && te && te < 41;
}), ae = ne && !Symbol.sham && "symbol" == typeof Symbol.iterator, ie = j, se = B, ce = Y, ue = Object, le = ae ? function(e) {
return "symbol" == typeof e;
} : function(e) {
var t = ie("Symbol");
return se(t) && ce(t.prototype, ue(e));
}, me = String, pe = B, de = TypeError, fe = function(e) {
if (pe(e)) return e;
throw new de(function(e) {
try {
return me(e);
} catch (e) {
return "Object";
}
}(e) + " is not a function");
}, ye = fe, he = M, ge = u, ve = B, Re = V, Ee = TypeError, Te = {
exports: {}
}, Se = r, Ce = Object.defineProperty, we = function(e, t) {
try {
Ce(Se, e, {
value: t,
configurable: !0,
writable: !0
});
} catch (r) {
Se[e] = t;
}
return t;
}, be = r, xe = we, Oe = "__core-js_shared__", _e = Te.exports = be[Oe] || xe(Oe, {});
(_e.versions || (_e.versions = [])).push({
version: "3.42.0",
mode: "global",
copyright: "© 2014-2025 Denis Pushkarev (zloirock.ru)",
license: "https://github.com/zloirock/core-js/blob/v3.42.0/LICENSE",
source: "https://github.com/zloirock/core-js"
});
var Ae = Te.exports, Ue = Ae, Ne = function(e, t) {
return Ue[e] || (Ue[e] = t || {});
}, Me = I, ke = Object, Pe = function(e) {
return ke(Me(e));
}, Ie = Pe, Ge = S({}.hasOwnProperty), Le = Object.hasOwn || function(e, t) {
return Ge(Ie(e), t);
}, De = S, Fe = 0, Be = Math.random(), We = De(1..toString), Ve = function(e) {
return "Symbol(" + (void 0 === e ? "" : e) + ")_" + We(++Fe + Be, 36);
}, Ke = Ne, He = Le, je = Ve, Ye = ne, qe = ae, ze = r.Symbol, Xe = Ke("wks"), Qe = qe ? ze.for || ze : ze && ze.withoutSetter || je, $e = function(e) {
return He(Xe, e) || (Xe[e] = Ye && He(ze, e) ? ze[e] : Qe("Symbol." + e)), Xe[e];
}, Je = u, Ze = V, et = le, tt = TypeError, rt = $e("toPrimitive"), ot = le, nt = function(e) {
var t = function(e, t) {
if (!Ze(e) || et(e)) return e;
var r, o, n = (o = e[rt], he(o) ? void 0 : ye(o));
if (n) {
if (void 0 === t && (t = "default"), r = Je(n, e, t), !Ze(r) || et(r)) return r;
throw new tt("Can't convert object to primitive value");
}
return void 0 === t && (t = "number"), function(e, t) {
var r, o;
if ("string" === t && ve(r = e.toString) && !Re(o = ge(r, e))) return o;
if (ve(r = e.valueOf) && !Re(o = ge(r, e))) return o;
if ("string" !== t && ve(r = e.toString) && !Re(o = ge(r, e))) return o;
throw new Ee("Can't convert object to primitive value");
}(e, t);
}(e, "string");
return ot(t) ? t : t + "";
}, at = V, it = r.document, st = at(it) && at(it.createElement), ct = function(e) {
return st ? it.createElement(e) : {};
}, ut = ct, lt = !a && !n(function() {
return 7 !== Object.defineProperty(ut("div"), "a", {
get: function() {
return 7;
}
}).a;
}), mt = a, pt = u, dt = l, ft = h, yt = D, ht = nt, gt = Le, vt = lt, Rt = Object.getOwnPropertyDescriptor;
o.f = mt ? Rt : function(e, t) {
if (e = yt(e), t = ht(t), vt) try {
return Rt(e, t);
} catch (e) {}
if (gt(e, t)) return ft(!pt(dt.f, e, t), e[t]);
};
var Et = {}, Tt = a && n(function() {
return 42 !== Object.defineProperty(function() {}, "prototype", {
value: 42,
writable: !1
}).prototype;
}), St = V, Ct = String, wt = TypeError, bt = function(e) {
if (St(e)) return e;
throw new wt(Ct(e) + " is not an object");
}, xt = a, Ot = lt, _t = Tt, At = bt, Ut = nt, Nt = TypeError, Mt = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, Pt = "enumerable", It = "configurable", Gt = "writable";
Et.f = xt ? _t ? function(e, t, r) {
if (At(e), t = Ut(t), At(r), "function" == typeof e && "prototype" === t && "value" in r && Gt in r && !r[Gt]) {
var o = kt(e, t);
o && o[Gt] && (e[t] = r.value, r = {
configurable: It in r ? r[It] : o[It],
enumerable: Pt in r ? r[Pt] : o[Pt],
writable: !1
});
}
return Mt(e, t, r);
} : Mt : function(e, t, r) {
if (At(e), t = Ut(t), At(r), Ot) try {
return Mt(e, t, r);
} catch (e) {}
if ("get" in r || "set" in r) throw new Nt("Accessors not supported");
return "value" in r && (e[t] = r.value), e;
};
var Lt = Et, Dt = h, Ft = a ? function(e, t, r) {
return Lt.f(e, t, Dt(1, r));
} : function(e, t, r) {
return e[t] = r, e;
}, Bt = {
exports: {}
}, Wt = a, Vt = Le, Kt = Function.prototype, Ht = Wt && Object.getOwnPropertyDescriptor, jt = {
CONFIGURABLE: Vt(Kt, "name") && (!Wt || Wt && Ht(Kt, "name").configurable)
}, Yt = B, qt = Ae, zt = S(Function.toString);
Yt(qt.inspectSource) || (qt.inspectSource = function(e) {
return zt(e);
});
var Xt, Qt, $t, Jt = qt.inspectSource, Zt = B, er = r.WeakMap, tr = Zt(er) && /native code/.test(String(er)), rr = Ve, or = Ne("keys"), nr = function(e) {
return or[e] || (or[e] = rr(e));
}, ar = {}, ir = tr, sr = r, cr = Ft, ur = Le, lr = Ae, mr = nr, pr = ar, dr = "Object already initialized", fr = sr.TypeError, yr = sr.WeakMap;
if (ir || lr.state) {
var hr = lr.state || (lr.state = new yr);
hr.get = hr.get, hr.has = hr.has, hr.set = hr.set, Xt = function(e, t) {
if (hr.has(e)) throw new fr(dr);
return t.facade = e, hr.set(e, t), t;
}, Qt = function(e) {
return hr.get(e) || {};
}, $t = function(e) {
return hr.has(e);
};
} else {
var gr = mr("state");
pr[gr] = !0, Xt = function(e, t) {
if (ur(e, gr)) throw new fr(dr);
return t.facade = e, cr(e, gr, t), t;
}, Qt = function(e) {
return ur(e, gr) ? e[gr] : {};
}, $t = function(e) {
return ur(e, gr);
};
}
var vr = {
get: Qt,
enforce: function(e) {
return $t(e) ? Qt(e) : Xt(e, {});
}
}, Rr = S, Er = n, Tr = B, Sr = Le, Cr = a, wr = jt.CONFIGURABLE, br = Jt, xr = vr.enforce, Or = vr.get, _r = String, Ar = Object.defineProperty, Ur = Rr("".slice), Nr = Rr("".replace), Mr = Rr([].join), kr = Cr && !Er(function() {
return 8 !== Ar(function() {}, "length", {
value: 8
}).length;
}), Pr = String(String).split("String"), Ir = Bt.exports = function(e, t, r) {
"Symbol(" === Ur(_r(t), 0, 7) && (t = "[" + Nr(_r(t), /^Symbol\(([^)]*)\).*$/, "$1") + "]"), 
r && r.getter && (t = "get " + t), r && r.setter && (t = "set " + t), (!Sr(e, "name") || wr && e.name !== t) && (Cr ? Ar(e, "name", {
value: t,
configurable: !0
}) : e.name = t), kr && r && Sr(r, "arity") && e.length !== r.arity && Ar(e, "length", {
value: r.arity
});
try {
r && Sr(r, "constructor") && r.constructor ? Cr && Ar(e, "prototype", {
writable: !1
}) : e.prototype && (e.prototype = void 0);
} catch (e) {}
var o = xr(e);
return Sr(o, "source") || (o.source = Mr(Pr, "string" == typeof t ? t : "")), e;
};
Function.prototype.toString = Ir(function() {
return Tr(this) && Or(this).source || br(this);
}, "toString");
var Gr = Bt.exports, Lr = B, Dr = Et, Fr = Gr, Br = we, Wr = {}, Vr = Math.ceil, Kr = Math.floor, Hr = Math.trunc || function(e) {
var t = +e;
return (t > 0 ? Kr : Vr)(t);
}, jr = function(e) {
var t = +e;
return t != t || 0 === t ? 0 : Hr(t);
}, Yr = jr, qr = Math.max, zr = Math.min, Xr = jr, Qr = Math.min, $r = function(e) {
return t = e.length, (r = Xr(t)) > 0 ? Qr(r, 9007199254740991) : 0;
var t, r;
}, Jr = D, Zr = $r, eo = {
indexOf: function(e, t, r) {
var o = Jr(e), n = Zr(o);
if (0 === n) return -1;
for (var a = function(e, t) {
var r = Yr(e);
return r < 0 ? qr(r + t, 0) : zr(r, t);
}(r, n); n > a; a++) if (a in o && o[a] === t) return a || 0;
return -1;
}
}, to = Le, ro = D, oo = eo.indexOf, no = ar, ao = S([].push), io = function(e, t) {
var r, o = ro(e), n = 0, a = [];
for (r in o) !to(no, r) && to(o, r) && ao(a, r);
for (;t.length > n; ) to(o, r = t[n++]) && (~oo(a, r) || ao(a, r));
return a;
}, so = [ "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf" ], co = io, uo = so.concat("length", "prototype");
Wr.f = Object.getOwnPropertyNames || function(e) {
return co(e, uo);
};
var lo = {};
lo.f = Object.getOwnPropertySymbols;
var mo = j, po = Wr, fo = lo, yo = bt, ho = S([].concat), go = mo("Reflect", "ownKeys") || function(e) {
var t = po.f(yo(e)), r = fo.f;
return r ? ho(t, r(e)) : t;
}, vo = Le, Ro = go, Eo = o, To = Et, So = n, Co = B, wo = /#|\.prototype\./, bo = function(e, t) {
var r = Oo[xo(e)];
return r === Ao || r !== _o && (Co(t) ? So(t) : !!t);
}, xo = bo.normalize = function(e) {
return String(e).replace(wo, ".").toLowerCase();
}, Oo = bo.data = {}, _o = bo.NATIVE = "N", Ao = bo.POLYFILL = "P", Uo = bo, No = r, Mo = o.f, ko = Ft, Po = function(e, t, r, o) {
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
}, Io = we, Go = function(e, t, r) {
for (var o = Ro(t), n = To.f, a = Eo.f, i = 0; i < o.length; i++) {
var s = o[i];
vo(e, s) || r && vo(r, s) || n(e, s, a(t, s));
}
}, Lo = Uo, Do = function(e, t) {
var r, o, n, a, i, s = e.target, c = e.global, u = e.stat;
if (r = c ? No : u ? No[s] || Io(s, {}) : No[s] && No[s].prototype) for (o in t) {
if (a = t[o], n = e.dontCallGetSet ? (i = Mo(r, o)) && i.value : r[o], !Lo(c ? o : s + (u ? "." : "#") + o, e.forced) && void 0 !== n) {
if (typeof a == typeof n) continue;
Go(a, n);
}
(e.sham || n && n.sham) && ko(a, "sham", !0), Po(r, o, a, e);
}
}, Fo = x, Bo = Array.isArray || function(e) {
return "Array" === Fo(e);
}, Wo = TypeError, Vo = x, Ko = S, Ho = function(e) {
if ("Function" === Vo(e)) return Ko(e);
}, jo = fe, Yo = i, qo = Ho(Ho.bind), zo = Bo, Xo = $r, Qo = function(e) {
if (e > 9007199254740991) throw Wo("Maximum allowed index exceeded");
return e;
}, $o = function(e, t, r, o, n, a, i, s) {
for (var c, u, l = n, m = 0, p = !!i && function(e, t) {
return jo(e), void 0 === t ? e : Yo ? qo(e, t) : function() {
return e.apply(t, arguments);
};
}(i, s); m < o; ) m in r && (c = p ? p(r[m], m, t) : r[m], a > 0 && zo(c) ? (u = Xo(c), 
l = $o(e, t, c, u, l, a - 1) - 1) : (Qo(l + 1), e[l] = c), l++), m++;
return l;
}, Jo = $o, Zo = {};
Zo[$e("toStringTag")] = "z";
var en = "[object z]" === String(Zo), tn = B, rn = x, on = $e("toStringTag"), nn = Object, an = "Arguments" === rn(function() {
return arguments;
}()), sn = S, cn = n, un = B, ln = en ? rn : function(e) {
var t, r, o;
return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (r = function(e, t) {
try {
return e[t];
} catch (e) {}
}(t = nn(e), on)) ? r : an ? rn(t) : "Object" === (o = rn(t)) && tn(t.callee) ? "Arguments" : o;
}, mn = Jt, pn = function() {}, dn = j("Reflect", "construct"), fn = /^\s*(?:class|function)\b/, yn = sn(fn.exec), hn = !fn.test(pn), gn = function(e) {
if (!un(e)) return !1;
try {
return dn(pn, [], e), !0;
} catch (e) {
return !1;
}
}, vn = function(e) {
if (!un(e)) return !1;
switch (ln(e)) {
case "AsyncFunction":
case "GeneratorFunction":
case "AsyncGeneratorFunction":
return !1;
}
try {
return hn || !!yn(fn, mn(e));
} catch (e) {
return !0;
}
};
vn.sham = !0;
var Rn = !dn || cn(function() {
var e;
return gn(gn.call) || !gn(Object) || !gn(function() {
e = !0;
}) || e;
}) ? vn : gn, En = Bo, Tn = Rn, Sn = V, Cn = $e("species"), wn = Array, bn = function(e, t) {
return new (function(e) {
var t;
return En(e) && (t = e.constructor, (Tn(t) && (t === wn || En(t.prototype)) || Sn(t) && null === (t = t[Cn])) && (t = void 0)), 
void 0 === t ? wn : t;
}(e))(0 === t ? 0 : t);
}, xn = Jo, On = fe, _n = Pe, An = $r, Un = bn;
Do({
target: "Array",
proto: !0
}, {
flatMap: function(e) {
var t, r = _n(this), o = An(r);
return On(e), (t = Un(r, 0)).length = xn(t, r, r, o, 0, 1, e, arguments.length > 1 ? arguments[1] : void 0), 
t;
}
});
var Nn = {}, Mn = io, kn = so, Pn = Object.keys || function(e) {
return Mn(e, kn);
}, In = a, Gn = Tt, Ln = Et, Dn = bt, Fn = D, Bn = Pn;
Nn.f = In && !Gn ? Object.defineProperties : function(e, t) {
Dn(e);
for (var r, o = Fn(t), n = Bn(t), a = n.length, i = 0; a > i; ) Ln.f(e, r = n[i++], o[r]);
return e;
};
var Wn, Vn = j("document", "documentElement"), Kn = bt, Hn = Nn, jn = so, Yn = ar, qn = Vn, zn = ct, Xn = "prototype", Qn = "script", $n = nr("IE_PROTO"), Jn = function() {}, Zn = function(e) {
return "<" + Qn + ">" + e + "</" + Qn + ">";
}, ea = function(e) {
e.write(Zn("")), e.close();
var t = e.parentWindow.Object;
return e = null, t;
}, ta = function() {
try {
Wn = new ActiveXObject("htmlfile");
} catch (e) {}
var e, t, r;
ta = "undefined" != typeof document ? document.domain && Wn ? ea(Wn) : (t = zn("iframe"), 
r = "java" + Qn + ":", t.style.display = "none", qn.appendChild(t), t.src = String(r), 
(e = t.contentWindow.document).open(), e.write(Zn("document.F=Object")), e.close(), 
e.F) : ea(Wn);
for (var o = jn.length; o--; ) delete ta[Xn][jn[o]];
return ta();
};
Yn[$n] = !0;
var ra = $e, oa = Object.create || function(e, t) {
var r;
return null !== e ? (Jn[Xn] = Kn(e), r = new Jn, Jn[Xn] = null, r[$n] = e) : r = ta(), 
void 0 === t ? r : Hn.f(r, t);
}, na = Et.f, aa = ra("unscopables"), ia = Array.prototype;
void 0 === ia[aa] && na(ia, aa, {
configurable: !0,
value: oa(null)
});
var sa = function(e) {
ia[aa][e] = !0;
};
sa("flatMap");
var ca = r, ua = S, la = function(e, t) {
return ua(ca[e].prototype[t]);
};
la("Array", "flatMap");
var ma = Jo, pa = Pe, da = $r, fa = jr, ya = bn;
Do({
target: "Array",
proto: !0
}, {
flat: function() {
var e = arguments.length ? arguments[0] : void 0, t = pa(this), r = da(t), o = ya(t, 0);
return o.length = ma(o, t, t, r, 0, void 0 === e ? 1 : fa(e)), o;
}
}), sa("flat"), la("Array", "flat");
const ha = {
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
}, ga = new Map, va = new Map, Ra = {
set(e, t, r) {
ga.set(e, t), void 0 !== r && va.set(e, r);
},
get: e => ga.get(e),
expires: e => va.get(e),
delete(e) {
ga.delete(e);
},
with: () => Ra,
clean() {
for (const [e, t] of va) Game.time >= t && (Ra.delete(e), va.delete(e));
}
}, Ea = (() => {
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
const s = Array.isArray(this.depth), c = s ? 0 : this.depth, u = s ? this.depth : [];
a(c || u.length === o.length, n, "Wrong depths array length:", u, o), s || (r += String.fromCodePoint(i(o.length)));
let l = 0, m = 0;
for (let n = 0, a = o.length; n < a; ++n) {
const a = o[n], s = c || u[n];
for (let o = 0; o < s; ) {
const n = e - l, c = s - o, u = Math.min(n, c);
let p = Math.floor(a / t[o]);
p %= t[u], p *= t[l], m += p, o += u, l += u, l === e && (r += String.fromCodePoint(i(m)), 
l = m = 0);
}
}
return 0 !== l && (r += String.fromCodePoint(i(m))), r;
}
function u(r, o) {
a(!this.meta || o.depth > 0 || 0 === o.depth && Array.isArray(this.depth), n, "Array decoding error (check inputs and codec config)"), 
o.depth = o.depth || this.depth;
const i = Array.isArray(o.depth);
let c = 0, u = 0;
const l = i ? o.depth.length : s(r.codePointAt(c++)), m = i ? 0 : o.depth, p = i ? o.depth : [], d = new Array(l);
let f = 0, y = s(r.codePointAt(c++));
for (;u < l; ) {
const o = m || p[u];
let n = 0, a = 0;
for (;a < o; ) {
const i = e - f, m = o - a, p = Math.min(i, m);
let d = Math.floor(y / t[f]);
if (d %= t[p], d *= t[a], n += d, a += p, f += p, f === e) {
if (u + 1 === l && a === o) break;
y = s(r.codePointAt(c++)), f = 0;
}
}
a > 0 && (d[u++] = n);
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
const e = u.call(this, r, i);
return o && (o.length = c + e[1]), e[0];
}
let l = 0, m = 0;
const p = Math.ceil(i.depth / e);
for (let o = 0; o < p; ++o) l += s(r.codePointAt(o)) * t[m], m += e;
return o && (o.length = c + p), l;
}
},
MAX_DEPTH: 53
};
})();
var Ta = Ea;
const Sa = new Ta.Codec({
array: !1
}), Ca = {
key: "ns",
serialize(e) {
if (void 0 !== e) return Sa.encode(e);
},
deserialize(e) {
if (void 0 !== e) return Sa.decode(e);
}
}, wa = (e, t) => `cg_${e.key}_${t}`, Oa = (e, t) => Object.assign(Object.assign({}, e), {
get(r) {
var o;
const n = e.get(r);
if (n) try {
const e = null !== (o = Ra.get(wa(t, n))) && void 0 !== o ? o : t.deserialize(n);
return void 0 !== e && Ra.set(wa(t, n), e, Game.time + CREEP_LIFE_TIME), e;
} catch (o) {
return e.delete(r), void Ra.delete(wa(t, n));
}
},
set(r, o, n) {
const a = e.get(r);
a && Ra.delete(wa(t, a));
const i = t.serialize(o);
i ? (e.set(r, i, n), Ra.set(wa(t, i), o, Game.time + CREEP_LIFE_TIME)) : e.delete(r);
},
delete(r) {
const o = e.get(r);
o && Ra.delete(wa(t, o)), e.delete(r);
},
with: t => Oa(e, t)
});
function _a() {
var e, t;
return null !== (e = Memory[t = ha.MEMORY_CACHE_PATH]) && void 0 !== e || (Memory[t] = {}), 
Memory[ha.MEMORY_CACHE_PATH];
}
function Aa() {
var e, t;
return null !== (e = Memory[t = ha.MEMORY_CACHE_EXPIRATION_PATH]) && void 0 !== e || (Memory[t] = {}), 
Memory[ha.MEMORY_CACHE_EXPIRATION_PATH];
}
const Ua = {
set(e, t, r) {
if (_a()[e] = t, void 0 !== r) {
const t = Ca.serialize(r);
t && (Aa()[e] = t);
}
},
get: e => _a()[e],
expires: e => Ca.deserialize(Aa()[e]),
delete(e) {
delete _a()[e];
},
with: e => Oa(Ua, e),
clean() {
const e = Aa();
for (const t in e) {
const r = Ca.deserialize(e[t]);
void 0 !== r && Game.time >= r && (Ua.delete(t), delete e[t]);
}
}
}, Na = (e, t, r = 1 / 0) => {
let o = new Map, n = Game.time;
return (...a) => {
Game.time >= n + r && (n = Game.time, o = new Map);
const i = e(...a);
return o.has(i) || o.set(i, t(...a)), o.get(i);
};
}, Ma = (e, t) => Na(e, t, 1), ka = Na(e => e, e => {
for (let t = 2; t < e.length; t++) if ("N" === e[t] || "S" === e[t]) {
const r = e[0], o = e[t];
let n = parseInt(e.slice(1, t)), a = parseInt(e.slice(t + 1));
return "W" === r && (n = -n - 1), "N" === o && (a = -a - 1), n += 128, a += 128, 
n << 8 | a;
}
throw new Error(`Invalid room name ${e}`);
}), Pa = (e, t, r) => {
const o = Object.create(RoomPosition.prototype);
return o.__packedPos = ka(r) << 16 | e << 8 | t, o;
}, Ia = (e, t, r) => {
const o = Object.create(RoomPosition.prototype);
return o.__packedPos = 4294901760 & e.__packedPos | t << 8 | r, o;
}, Ga = (e, t, r) => {
const o = e.__packedPos >> 8 & 255, n = 255 & e.__packedPos, a = Object.create(RoomPosition.prototype);
return a.__packedPos = 4294901760 & e.__packedPos | o + t << 8 | n + r, a;
}, La = new Ta.Codec({
array: !1,
depth: 28
}), Da = new Ta.Codec({
array: !0,
depth: 12
}), Fa = new Ta.Codec({
depth: 3,
array: !0
}), Ba = new Ta.Codec({
array: !0,
depth: 16
}), Wa = [ "WN", "EN", "WS", "ES" ], Va = e => {
const t = (65280 & e.__packedPos) >> 8, r = 255 & e.__packedPos, o = e.__packedPos >>> 4 & 4294963200 | t << 6 | r;
return La.encode(o);
}, Ka = function(e) {
const t = La.decode(e), r = t << 4 & 4294901760 | (4032 & t) >> 6 << 8 | 63 & t, o = Object.create(RoomPosition.prototype);
if (o.__packedPos = r, o.x > 49 || o.y > 49) throw new Error("Invalid room position");
return o;
}, Ha = e => Ya([ e ]), ja = e => qa(e)[0], Ya = e => Da.encode(e.map(e => e.x << 6 | e.y)), qa = e => Da.decode(e).map(e => {
const t = {
x: (4032 & e) >> 6,
y: 63 & e
};
if (t.x > 49 || t.y > 49) throw new Error("Invalid packed coord");
return t;
}), za = e => e.map(e => Va(e)).join(""), Xa = e => {
var t;
return null === (t = e.match(/.{1,2}/g)) || void 0 === t ? void 0 : t.map(e => Ka(e));
}, Qa = e => {
let t = e.match(/^([WE])([0-9]+)([NS])([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
let [, r, o, n, a] = t;
return {
wx: "W" == r ? ~Number(o) : Number(o),
wy: "N" == n ? ~Number(a) : Number(a)
};
}, $a = (e, t) => `${e < 0 ? "W" : "E"}${e = e < 0 ? ~e : e}${t < 0 ? "N" : "S"}${t = t < 0 ? ~t : t}`, Ja = e => {
let {x: t, y: r, roomName: o} = e;
if (t < 0 || t >= 50) throw new RangeError("x value " + t + " not in range");
if (r < 0 || r >= 50) throw new RangeError("y value " + r + " not in range");
if ("sim" == o) throw new RangeError("Sim room does not have world position");
let {wx: n, wy: a} = Qa(o);
return {
x: 50 * Number(n) + t,
y: 50 * Number(a) + r
};
}, Za = e => {
let [t, r] = [ Math.floor(e.x / 50), e.x % 50 ], [o, n] = [ Math.floor(e.y / 50), e.y % 50 ];
t < 0 && r < 0 && (r = 49 - ~r), o < 0 && n < 0 && (n = 49 - ~n);
let a = $a(t, o);
return Pa(r, n, a);
}, ei = (e, t) => {
if (e.roomName === t.roomName) return e.getRangeTo(t);
let r = Ja(e), o = Ja(t);
return Math.max(Math.abs(r.x - o.x), Math.abs(r.y - o.y));
};
function ti(e, t) {
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
const {wx: t, wy: r} = Qa(e.roomName);
a = $a(t - 1, r), o = 49;
} else if (o > 49) {
const {wx: t, wy: r} = Qa(e.roomName);
a = $a(t + 1, r), o = 0;
} else if (n < 0) {
const {wx: t, wy: r} = Qa(e.roomName);
a = $a(t, r - 1), n = 49;
} else if (n > 49) {
const {wx: t, wy: r} = Qa(e.roomName);
a = $a(t, r + 1), n = 0;
}
return a === e.roomName ? Ia(e, o, n) : Pa(o, n, a);
}
const ri = e => Ba.encode(e.map(e => {
const [t, r, o, n, a] = e.split(/([A-Z])([0-9]+)([A-Z])([0-9]+)/);
return Wa.indexOf(r + n) << 14 | parseInt(o) << 7 | parseInt(a);
})), oi = e => Ba.decode(e).map(e => {
const t = e >> 14, r = e >> 7 & 127, o = 127 & e, [n, a] = Wa[t].split("");
return `${n}${r}${a}${o}`;
}), ni = e => ri([ e ]), ai = e => oi(e)[0], ii = new Ta.Codec({
array: !1,
depth: 15
}), si = {
key: "mts",
serialize(e) {
if (void 0 !== e) return `${Va(e.pos)}${ii.encode(e.range)}`;
},
deserialize(e) {
if (void 0 !== e) return {
pos: Ka(e.slice(0, 2)),
range: ii.decode(e.slice(2))
};
}
}, ci = {
key: "mtls",
serialize(e) {
if (void 0 !== e) return e.map(e => si.serialize(e)).join("");
},
deserialize(e) {
if (void 0 === e) return;
const t = [];
for (let r = 0; r < e.length; r += 3) {
const o = si.deserialize(e.slice(r, r + 3));
o && t.push(o);
}
return t;
}
}, ui = {
key: "ps",
serialize(e) {
if (void 0 !== e) return Va(e);
},
deserialize(e) {
if (void 0 !== e) return Ka(e);
}
}, li = {
key: "pls",
serialize(e) {
if (void 0 !== e) return za(e);
},
deserialize(e) {
if (void 0 !== e) return Xa(e);
}
}, mi = {
key: "cs",
serialize(e) {
if (void 0 !== e) return Ha(e);
},
deserialize(e) {
if (void 0 !== e) return ja(e);
}
}, pi = {
key: "cls",
serialize(e) {
if (void 0 !== e) return Ya(e);
},
deserialize(e) {
if (void 0 !== e) return qa(e);
}
};
function di() {
Ua.clean(), Ra.clean();
}
const fi = {
HeapCache: Ra,
MemoryCache: Ua
};
class yi extends Set {
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
const hi = e => 0 === e.x || 0 === e.y || 49 === e.x || 49 === e.y, gi = Na((e, t = !0, r = !1) => {
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
}), t && (o = o.flatMap(vi)), r) {
const e = new yi;
for (const {pos: r, range: n} of o) Si(r, n + 1).filter(e => !!wi(e, !0, !1) && (!t || e.roomName === r.roomName && !hi(e))).forEach(t => e.add(t));
for (const t of e) o.some(e => e.pos.inRangeTo(t, e.range)) && e.delete(t);
o = [ ...e ].map(e => ({
pos: e,
range: 0
}));
}
return o;
});
function vi({pos: e, range: t}) {
if (0 === t || e.x > t && 49 - e.x > t && e.y > t && 49 - e.y > t) return [ {
pos: e,
range: t
} ];
const r = Math.max(1, e.x - t), o = Math.min(48, e.x + t), n = Math.max(1, e.y - t), a = Math.min(48, e.y + t), i = o - r + 1, s = a - n + 1, c = Math.floor((Math.min(i, s) - 1) / 2), u = Math.floor(i / (c + 1)), l = Math.floor(s / (c + 1)), m = new Set(Array(u).fill(0).map((e, t) => Math.min(o - c, r + c + t * (2 * c + 1)))), p = new Set(Array(l).fill(0).map((e, t) => Math.min(a - c, n + c + t * (2 * c + 1)))), d = [];
for (const t of m) for (const r of p) d.push({
pos: Ia(e, t, r),
range: c
});
return d;
}
const Ri = (e = 1) => {
let t = new Array(2 * e + 1).fill(0).map((t, r) => r - e);
return t.flatMap(e => t.map(t => ({
x: e,
y: t
}))).filter(e => !(0 === e.x && 0 === e.y));
}, Ei = e => Ti(e, 1), Ti = (e, t, r = !1) => {
if (0 === t) return [ e ];
let o = [];
return o = Ri(t).map(t => e.x + t.x < 0 || e.x + t.x > 49 || e.y + t.y < 0 || e.y + t.y > 49 ? null : Ga(e, t.x, t.y)).filter(e => null !== e), 
r && o.push(e), o;
}, Si = (e, t) => {
const r = Ja(e);
let o = [];
for (let e = r.x - t; e <= r.x + t; e++) o.push(Za({
x: e,
y: r.y - t
})), o.push(Za({
x: e,
y: r.y + t
}));
for (let e = r.y - t + 1; e <= r.y + t - 1; e++) o.push(Za({
x: r.x - t,
y: e
})), o.push(Za({
x: r.x + t,
y: e
}));
return o;
}, Ci = (e, t = !1) => Ei(e).filter(e => wi(e, t)), wi = (e, t = !1, r = !1) => {
let o;
try {
o = Game.map.getRoomTerrain(e.roomName);
} catch (e) {
return !1;
}
return !(o.get(e.x, e.y) === TERRAIN_MASK_WALL || Game.rooms[e.roomName] && e.look().some(e => !(t || e.type !== LOOK_CREEPS && e.type !== LOOK_POWER_CREEPS) || !(r || !e.constructionSite || !e.constructionSite.my || !OBSTACLE_OBJECT_TYPES.includes(e.constructionSite.structureType)) || !(r || !e.structure || !(OBSTACLE_OBJECT_TYPES.includes(e.structure.structureType) || e.structure instanceof StructureRampart && !e.structure.my))));
}, bi = e => {
let t = e.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
return Number(t[1]) % 10 == 0 || Number(t[2]) % 10 == 0;
}, xi = e => {
let t = e.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
let r = Number(t[1]) % 10, o = Number(t[2]) % 10;
return !(5 === r && 5 === o) && r >= 4 && r <= 6 && o >= 4 && o <= 6;
}, Oi = (e, t, r) => r ? e.slice(0, t) : e.slice(t + 1), _i = e => "_ck" + e;
function Ai(e) {
xi(e) && !Ua.get(_i(e)) && Ua.with(li).set(_i(e), [ ...Game.rooms[e].find(FIND_SOURCES), ...Game.rooms[e].find(FIND_MINERALS) ].map(e => e.pos));
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
class Ni extends Ui {
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
var Mi, ki, Pi, Ii;
const Gi = new Ta.Codec({
array: !1,
depth: 30
}), Li = new Map;
null !== (Mi = Memory[Ii = ha.MEMORY_PORTAL_PATH]) && void 0 !== Mi || (Memory[Ii] = []);
for (const e of Memory[ha.MEMORY_PORTAL_PATH]) {
const t = Bi(e), r = null !== (ki = Li.get(t.room1)) && void 0 !== ki ? ki : new Map;
r.set(t.room2, t), Li.set(t.room1, r);
const o = null !== (Pi = Li.get(t.room2)) && void 0 !== Pi ? Pi : new Map;
o.set(t.room1, t), Li.set(t.room2, o);
}
function Di(e) {
var t, r, o, n, a;
if (!bi(e) && !(e => {
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
portalMap: new Ni
};
r.set(o.destination.roomName, n), n.portalMap.set(o.pos, o.destination), o.ticksToDecay ? n.expires = Game.time + o.ticksToDecay : delete n.expires;
}
return [ ...r.values() ];
}(e)) (null !== (t = Li.get(o.room1)) && void 0 !== t ? t : new Map).set(o.room2, o), 
(null !== (r = Li.get(o.room2)) && void 0 !== r ? r : new Map).set(o.room1, o), 
i.add(o.room2);
const s = Li.get(e);
for (const t of null !== (o = null == s ? void 0 : s.keys()) && void 0 !== o ? o : []) i.has(t) || (null === (n = Li.get(e)) || void 0 === n || n.delete(t), 
null === (a = Li.get(t)) || void 0 === a || a.delete(e));
}
function Fi(e) {
var t;
let r = "";
return r += ni(e.room1), r += ni(e.room2), r += Gi.encode(null !== (t = e.expires) && void 0 !== t ? t : 0), 
r += Ya([ ...e.portalMap.entries() ].flat()), r;
}
function Bi(e) {
const t = ai(e.slice(0, 3)), r = ai(e.slice(3, 6)), o = Gi.decode(e.slice(6, 8)), n = new Ni, a = qa(e.slice(8));
for (let e = 0; e < a.length; e += 2) n.set(a[e], a[e + 1]);
return {
room1: t,
room2: r,
expires: 0 !== o ? o : void 0,
portalMap: n
};
}
function Wi(e) {
var t;
const r = new Set(Object.values(null !== (t = Game.map.describeExits(e)) && void 0 !== t ? t : {})), o = Li.get(e);
if (!o) return [ ...r ];
for (const e of o.values()) r.add(e.room2);
return [ ...r ];
}
const Vi = new Ta.Codec({
array: !1,
depth: 15
}), Ki = (e, t) => {
var r;
if (!e || !e.length) throw new Error("Empty id");
let o = e;
o.length % 3 != 0 && (o = o.padStart(3 * Math.ceil(o.length / 3), "0"));
let n = "";
for (let e = 0; e < o.length; e += 3) n += Vi.encode(parseInt(o.slice(e, e + 3), 16));
return null !== (r = n + t) && void 0 !== r ? r : "";
}, Hi = (e, t) => Ki(e.id, t);
var ji = Object.freeze({
__proto__: null,
creepKey: Hi,
objectIdKey: Ki,
roomKey: (e, t) => ni(e) + (null != t ? t : "")
});
const Yi = (e, t) => r => {
var o;
if (t && !t.includes(r)) return !1;
let n = null === (o = e.roomCallback) || void 0 === o ? void 0 : o.call(e, r);
return !1 === n ? n : ((e, t, r) => {
var o, n, a, i, s, c, u;
if (r.avoidCreeps && (null === (o = Game.rooms[t]) || void 0 === o || o.find(FIND_CREEPS).forEach(t => e.set(t.pos.x, t.pos.y, 255)), 
null === (n = Game.rooms[t]) || void 0 === n || n.find(FIND_POWER_CREEPS).forEach(t => e.set(t.pos.x, t.pos.y, 255))), 
r.avoidSourceKeepers && function(e, t) {
var r;
const o = null !== (r = Ua.with(li).get(_i(e))) && void 0 !== r ? r : [];
for (const e of o) Ti(e, 5, !0).forEach(e => t.set(e.x, e.y, 255));
}(t, e), (r.avoidObstacleStructures || r.roadCost) && (r.avoidObstacleStructures && (null === (a = Game.rooms[t]) || void 0 === a || a.find(FIND_MY_CONSTRUCTION_SITES).forEach(t => {
OBSTACLE_OBJECT_TYPES.includes(t.structureType) && e.set(t.pos.x, t.pos.y, 255);
})), null === (i = Game.rooms[t]) || void 0 === i || i.find(FIND_STRUCTURES).forEach(t => {
r.avoidObstacleStructures && (OBSTACLE_OBJECT_TYPES.includes(t.structureType) || t.structureType === STRUCTURE_RAMPART && !t.my && !t.isPublic) && e.set(t.pos.x, t.pos.y, 255), 
r.roadCost && t instanceof StructureRoad && 0 === e.get(t.pos.x, t.pos.y) && e.set(t.pos.x, t.pos.y, r.roadCost);
})), r.avoidTargets) {
const o = Game.map.getRoomTerrain(t);
for (const n of r.avoidTargets(t)) for (const t of Ti(n.pos, n.range, !0)) if (o.get(t.x, t.y) !== TERRAIN_MASK_WALL) {
const o = 254 - t.getRangeTo(n.pos) * (null !== (s = r.avoidTargetGradient) && void 0 !== s ? s : 0);
e.set(t.x, t.y, Math.max(e.get(t.x, t.y), o));
}
}
return r.ignorePortals || [ ...null !== (u = null === (c = Li.get(t)) || void 0 === c ? void 0 : c.values()) && void 0 !== u ? u : [] ].flatMap(e => t === e.room1 ? [ ...e.portalMap.keys() ] : [ ...e.portalMap.reversed.keys() ]).forEach(t => e.set(t.x, t.y, 255)), 
e;
})(n instanceof PathFinder.CostMatrix ? n.clone() : new PathFinder.CostMatrix, r, e);
};
function qi(e, t) {
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
class Xi {
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
const Qi = Ma((e, t) => e + t, (e, t) => {
const {wx: r, wy: o} = Qa(e), {wx: n, wy: a} = Qa(t);
return Math.abs(r - n) + Math.abs(o - a);
}), $i = Ma(e => e, e => {
let t = 1 / 0;
for (const r of Li.keys()) t = Math.min(t, Qi(e, r));
return t;
});
function Ji(e, t) {
return Math.min(Qi(e, t), $i(e) + $i(t));
}
function Zi(e, t, r) {
var o, n, a, i, s, c, u, l;
let m = Object.assign(Object.assign({}, ha.DEFAULT_MOVE_OPTS), r);
(null == r ? void 0 : r.creepMovementInfo) && (m = Object.assign(Object.assign({}, m), function(e) {
const t = {
roadCost: ha.DEFAULT_MOVE_OPTS.roadCost || 1,
plainCost: ha.DEFAULT_MOVE_OPTS.plainCost || 2,
swampCost: ha.DEFAULT_MOVE_OPTS.swampCost || 10
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
const e = n + a, r = 2 * o, i = Math.max(e / r, .1), s = Math.ceil(i), c = Math.ceil(2 * i), u = Math.ceil(10 * i), l = (...e) => [ ...e ].reduce((e, t) => {
return r = e, (o = t) ? l(o, r % o) : r;
var r, o;
}), m = l(s, c, u);
t.roadCost = s / m, t.plainCost = c / m, t.swampCost = u / m;
}
return t;
}(r.creepMovementInfo)));
const p = t.reduce((e, {pos: t}) => e.includes(t.roomName) ? e : [ t.roomName, ...e ], []);
let d = function(e, t, r) {
const o = Object.assign(Object.assign({}, ha.DEFAULT_MOVE_OPTS), r), n = Na((e, t) => e + t, (e, t) => {
var r;
const n = null === (r = o.routeCallback) || void 0 === r ? void 0 : r.call(o, e, t);
return void 0 !== n ? n : bi(e) ? o.highwayRoomCost : xi(e) ? o.sourceKeeperRoomCost : o.defaultRoomCost;
}), a = function(e, t, r, o) {
var n, a;
if (t.includes(e)) return [];
const i = null !== (n = null == r ? void 0 : r.routeCallback) && void 0 !== n ? n : () => 1, s = new Xi;
s.put(e, 0);
const c = new Map, u = new Map;
c.set(e, e), u.set(e, 0);
let l = s.take();
for (;l && !t.includes(l); ) {
for (const e of Wi(l)) {
const r = u.get(l) + i(l, e);
if (r !== 1 / 0 && (!u.has(e) || r < u.get(e))) {
u.set(e, r);
const o = r + Math.min(...t.map(t => Ji(e, t)));
s.put(e, o), c.set(e, l);
}
}
l = s.take();
}
if (l && t.includes(l)) {
const t = [];
let r = [ {
room: l
} ];
for (;l !== e; ) {
const e = c.get(l), n = null === (a = Li.get(e)) || void 0 === a ? void 0 : a.get(l);
if (n && !o) t.unshift(r), r = [ {
room: e,
portalSet: n
} ]; else {
const t = Game.map.findExit(e, l);
r.unshift({
room: e,
exit: t === ERR_NO_PATH ? void 0 : t
});
}
l = e;
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
maxOps: Math.min(null !== (u = m.maxOps) && void 0 !== u ? u : 1e5, (null !== (l = m.maxOpsPerRoom) && void 0 !== l ? l : 2e3) * e.rooms.length),
roomCallback: Yi(m, e.rooms)
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
roomCallback: Yi(m, e.rooms)
}));
if (!n.path.length || n.incomplete) return;
o.push(...n.path);
}
return o;
}
{
const r = null === (o = null == d ? void 0 : d[0]) || void 0 === o ? void 0 : o.rooms, s = PathFinder.search(e, t, Object.assign(Object.assign({}, m), {
maxOps: Math.min(null !== (n = m.maxOps) && void 0 !== n ? n : 1e5, (null !== (a = m.maxOpsPerRoom) && void 0 !== a ? a : 2e3) * (null !== (i = null == r ? void 0 : r.length) && void 0 !== i ? i : 1)),
roomCallback: Yi(m, r)
}));
if (!s.path.length || s.incomplete) return;
return s.path;
}
}
let es = new Map, ts = 0;
function rs(e) {
var t;
return Game.time !== ts && (ts = Game.time, es = new Map), es.set(e, null !== (t = es.get(e)) && void 0 !== t ? t : {
creep: new Map,
priority: new Map,
targets: new Map,
pullers: new Set,
pullees: new Set,
prefersToStay: new Set,
blockedSquares: new Set
}), es.get(e);
}
function os(e, t = !1) {
var r, o, n, a;
"fatigue" in e.creep && e.creep.fatigue && !t && (e.targets = [ e.creep.pos ]), 
null !== (r = e.targetCount) && void 0 !== r || (e.targetCount = e.targets.length);
const i = rs(e.creep.pos.roomName);
!function(e) {
var t, r, o, n;
if (!e) return;
null !== (t = e.targetCount) && void 0 !== t || (e.targetCount = e.targets.length);
const a = rs(e.creep.pos.roomName);
a.creep.delete(e.creep.id), null === (o = null === (r = a.priority.get(e.priority)) || void 0 === r ? void 0 : r.get(e.targets.length)) || void 0 === o || o.delete(e.creep.id);
for (const t of e.targets) {
const r = Va(t);
null === (n = a.targets.get(r)) || void 0 === n || n.delete(e.creep.id);
}
}(i.creep.get(e.creep.id)), i.creep.set(e.creep.id, e);
const s = null !== (o = i.priority.get(e.priority)) && void 0 !== o ? o : new Map;
i.priority.set(e.priority, s);
const c = null !== (n = s.get(e.targets.length)) && void 0 !== n ? n : new Map;
s.set(e.targets.length, c), c.set(e.creep.id, e);
for (const t of e.targets) {
const r = Va(t), o = null !== (a = i.targets.get(r)) && void 0 !== a ? a : new Map;
i.targets.set(r, o), o.set(e.creep.id, e);
}
e.targets.length && e.targets[0].isEqualTo(e.creep.pos) && i.prefersToStay.add(Va(e.creep.pos));
}
function ns(e, t, r) {
var o, n, a;
const i = rs(e.creep.pos.roomName), s = null !== (o = i.priority.get(e.priority)) && void 0 !== o ? o : new Map;
null === (n = s.get(t)) || void 0 === n || n.delete(e.creep.id), i.priority.set(e.priority, s);
const c = null !== (a = s.get(r)) && void 0 !== a ? a : new Map;
s.set(r, c), c.set(e.creep.id, e);
}
const as = e => {
const t = Game.cpu.getUsed();
return e(), Math.max(0, Game.cpu.getUsed() - t);
}, is = "_crr";
function ss() {
const e = Ua.with(Ca).get(is);
return Boolean(e && Game.time - 2 <= e);
}
let cs = [];
function us(e, t) {
var r, o, n, a, i, s, c, u;
const l = Game.cpu.getUsed();
let m = 0;
const p = rs(e), d = p.blockedSquares;
if (null == t ? void 0 : t.visualize) for (const {creep: e, targets: t, priority: r} of p.creep.values()) t.forEach(t => {
t.isEqualTo(e.pos) ? Game.rooms[e.pos.roomName].visual.circle(e.pos, {
radius: .5,
stroke: "orange",
fill: "transparent"
}) : Game.rooms[e.pos.roomName].visual.line(e.pos, t, {
color: "orange"
});
});
for (const r of Game.rooms[e].find(FIND_MY_CREEPS).concat(Game.rooms[e].find(FIND_MY_POWER_CREEPS))) p.creep.has(r.id) || p.pullees.has(r.id) || p.pullers.has(r.id) || (os({
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
const a = Va(t.pos);
d.add(a);
for (const t of null !== (o = null === (r = p.targets.get(a)) || void 0 === r ? void 0 : r.values()) && void 0 !== o ? o : []) {
if (t.creep.id === e) continue;
null !== (n = t.targetCount) && void 0 !== n || (t.targetCount = t.targets.length);
const r = t.targetCount;
t.targetCount -= 1, ns(t, r, t.targetCount);
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
const o = Va(t);
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
m += as(() => e.creep.move(e.creep.pos.getDirectionTo(r))), e.resolved = !0, (null == t ? void 0 : t.visualize) && Game.rooms[e.creep.pos.roomName].visual.line(e.creep.pos, r, {
color: "green",
width: .5
});
const l = Va(r);
d.add(l);
for (const e of null !== (i = null === (a = p.targets.get(l)) || void 0 === a ? void 0 : a.values()) && void 0 !== i ? i : []) {
if (e.resolved) continue;
null !== (s = e.targetCount) && void 0 !== s || (e.targetCount = e.targets.length);
const t = e.targetCount;
e.targetCount -= 1, ns(e, t, e.targetCount);
}
if (!r.isEqualTo(e.creep.pos) && !p.pullers.has(e.creep.id)) {
const o = Va(e.creep.pos), a = [ ...null !== (u = null === (c = p.targets.get(o)) || void 0 === c ? void 0 : c.values()) && void 0 !== u ? u : [] ].filter(t => t !== e && t.targets.length < 2), i = a.find(e => !e.resolved && (null == r ? void 0 : r.isEqualTo(e.creep.pos)) && !p.pullers.has(e.creep.id));
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
const y = Math.max(0, Game.cpu.getUsed() - l);
cs.push(m / y), cs.length > 1500 && (cs = cs.slice(-1500));
}
function ls(e, t, r = 1) {
return e.pos ? ss() ? (os({
creep: e,
targets: t,
priority: r
}), OK) : t[0].isEqualTo(e.pos) ? OK : e.move(e.pos.getDirectionTo(t[0])) : ERR_INVALID_ARGS;
}
const ms = e => `_poi_${e}`, ps = "_cpi";
function ds(e, t, r, o) {
var n;
const a = Object.assign(Object.assign({}, ha.DEFAULT_MOVE_OPTS), o), i = null !== (n = a.cache) && void 0 !== n ? n : Ua, s = gi(r, null == o ? void 0 : o.keepTargetInRoom, null == o ? void 0 : o.flee);
if (null == o ? void 0 : o.visualizePathStyle) {
const e = Object.assign(Object.assign({}, ha.DEFAULT_VISUALIZE_OPTS), o.visualizePathStyle);
for (const t of s) new RoomVisual(t.pos.roomName).rect(t.pos.x - t.range - .5, t.pos.y - t.range - .5, 2 * t.range + 1, 2 * t.range + 1, e);
}
const c = i.with(li).get(ms(e));
if (c) return c;
const u = Zi(t, s, Object.assign(Object.assign({}, a), {
flee: !1
}));
if (u) {
const t = a.reusePath ? Game.time + a.reusePath + 1 : void 0;
i.with(li).set(ms(e), u, t);
}
return u;
}
function fs(e, t) {
var r;
return (null !== (r = null == t ? void 0 : t.cache) && void 0 !== r ? r : Ua).with(li).get(ms(e));
}
function ys(e, t) {
var r;
(null !== (r = null == t ? void 0 : t.cache) && void 0 !== r ? r : Ua).delete(ms(e));
}
function hs(e, t, r) {
var o, n, a, i;
const s = (null !== (o = null == r ? void 0 : r.cache) && void 0 !== o ? o : Ua).with(li).get(ms(t));
if (!e.pos) return ERR_INVALID_ARGS;
if (!s) return ERR_NO_PATH;
if ((null == r ? void 0 : r.reverse) && e.pos.isEqualTo(s[0]) || !(null == r ? void 0 : r.reverse) && e.pos.isEqualTo(s[s.length - 1])) return OK;
let c = Ra.get(Hi(e, ps));
if (void 0 !== c) {
let t = Math.max(0, Math.min(s.length - 1, (null == r ? void 0 : r.reverse) ? c - 1 : c + 1));
(null === (n = s[t]) || void 0 === n ? void 0 : n.isEqualTo(e.pos)) ? c = t : (null === (a = s[c]) || void 0 === a ? void 0 : a.isEqualTo(e.pos)) || (c = void 0);
}
if (void 0 === c) {
const t = s.findIndex(t => t.isEqualTo(e.pos));
-1 !== t && (c = t);
}
if (void 0 === c && !(null == r ? void 0 : r.reverse) && ei(s[0], e.pos) <= 1 && (c = -1), 
void 0 === c && (null == r ? void 0 : r.reverse) && ei(s[s.length - 1], e.pos) <= 1 && (c = s.length), 
void 0 === c) return ERR_NOT_FOUND;
Ra.set(Hi(e, ps), c);
let u = Math.max(0, Math.min(s.length - 1, (null == r ? void 0 : r.reverse) ? c - 1 : c + 1));
if (null == r ? void 0 : r.visualizePathStyle) {
const t = Object.assign(Object.assign({}, ha.DEFAULT_VISUALIZE_OPTS), r.visualizePathStyle), o = Oi(s, c, null == r ? void 0 : r.reverse);
null === (i = e.room) || void 0 === i || i.visual.poly(o.filter(t => {
var r;
return t.roomName === (null === (r = e.room) || void 0 === r ? void 0 : r.name);
}), t);
}
return ls(e, [ s[u] ], null == r ? void 0 : r.priority);
}
const gs = (e, t) => 0 !== e.length && 0 !== t.length && e.some(e => t.some(t => e.inRangeTo(t.pos, t.range))), vs = "_csp", Rs = "_cst", Es = (e, t) => {
if (!e.pos) return !1;
if ("fatigue" in e && e.fatigue > 0) return !1;
const r = Ra.get(Hi(e, vs)), o = Ra.get(Hi(e, Rs));
return Ra.set(Hi(e, vs), e.pos), r && o && e.pos.isEqualTo(r) ? o + t < Game.time : (Ra.set(Hi(e, Rs), Game.time), 
!1);
}, Ts = {
key: "js",
serialize(e) {
if (void 0 !== e) return JSON.stringify(e);
},
deserialize(e) {
if (void 0 !== e) return JSON.parse(e);
}
}, Ss = "_cp", Cs = "_ct", ws = "_co", bs = [ "avoidCreeps", "avoidObstacleStructures", "flee", "plainCost", "swampCost", "roadCost" ];
function xs(e, t = fi.HeapCache) {
ys(Hi(e, Ss), {
cache: t
}), t.delete(Hi(e, Cs)), t.delete(Hi(e, ws));
}
const Os = (e, t, r, o = {
avoidCreeps: !0
}) => {
var n, a, i, s;
if (!e.pos) return ERR_INVALID_ARGS;
let c = Object.assign(Object.assign({}, ha.DEFAULT_MOVE_OPTS), r);
const u = null !== (n = null == r ? void 0 : r.cache) && void 0 !== n ? n : fi.HeapCache;
let l = gi(t, c.keepTargetInRoom, c.flee), m = !1, p = u.with(ci).get(Hi(e, Cs));
for (const {pos: t, range: o} of l) {
if (!m && t.inRangeTo(e.pos, o) && e.pos.roomName === t.roomName) {
if (!(null == r ? void 0 : r.flee)) {
xs(e, u);
const t = Yi(c)(e.pos.roomName);
return ls(e, [ e.pos, ...Ci(e.pos, !0).filter(e => l.some(t => t.pos.inRangeTo(e, t.range)) && (!t || 255 !== t.get(e.x, e.y))) ], c.priority), 
OK;
}
m = !0;
}
p && !p.some(e => e && t.isEqualTo(e.pos) && o === e.range) && (xs(e, u), p = void 0);
}
const d = u.with(Ts).get(Hi(e, ws));
d && !bs.some(e => c[e] !== d[e]) || xs(e, u);
const f = [ null == r ? void 0 : r.roadCost, null == r ? void 0 : r.plainCost, null == r ? void 0 : r.swampCost ].some(e => void 0 !== e);
"body" in e && !f && (c = Object.assign(Object.assign({}, c), {
creepMovementInfo: {
usedCapacity: e.store.getUsedCapacity(),
body: e.body
}
}));
const y = c.reusePath ? Game.time + c.reusePath + 1 : void 0;
u.with(ci).set(Hi(e, Cs), l, y), u.with(Ts).set(Hi(e, ws), bs.reduce((e, t) => (e[t] = c[t], 
e), {}), y);
const h = fs(Hi(e, Ss), {
cache: u
}), g = Ra.get(Hi(e, "_cpi")), v = h && Oi(h, null != g ? g : 0), R = null !== (i = null === (a = c.avoidTargets) || void 0 === a ? void 0 : a.call(c, e.pos.roomName)) && void 0 !== i ? i : [];
if (c.repathIfStuck && h && Es(e, c.repathIfStuck)) ys(Hi(e, Ss), {
cache: u
}), c = Object.assign(Object.assign({}, c), o); else if ((null == v ? void 0 : v.length) && gs(v, R)) {
let t = 0;
v.forEach((e, r) => {
R.some(t => t.pos.inRangeTo(e, t.range)) && (t = r);
});
const r = v.slice(t), o = Zi(e.pos, r.map(e => ({
pos: e,
range: 0
})), Object.assign(Object.assign({}, c), {
cache: u,
flee: !1
}));
if (o) {
let t;
for (let e = 0; e < r.length; e++) if (o[o.length - 1].inRangeTo(r[e], 1)) t = e; else if (void 0 !== t) break;
void 0 === t ? ys(Hi(e, Ss), {
cache: u
}) : u.with(li).set(ms(Hi(e, Ss)), o.concat(r.slice(t)), y);
} else ys(Hi(e, Ss), {
cache: u
});
}
const E = ds(Hi(e, Ss), e.pos, t, Object.assign(Object.assign({}, c), {
cache: u
}));
if (!E) return ERR_NO_PATH;
if (E && (null === (s = E[E.length - 2]) || void 0 === s ? void 0 : s.isEqualTo(e.pos))) {
let t = Yi(c)(e.pos.roomName);
const o = t instanceof PathFinder.CostMatrix ? e => t.get(e.x, e.y) < 254 : () => !0, n = (null == r ? void 0 : r.flee) ? e => l.every(t => t.pos.getRangeTo(e) >= t.range) : e => l.some(t => t.pos.inRangeTo(e, t.range)), a = Ci(e.pos, !0).filter(e => n(e) && o(e));
if (a.length) return ls(e, a, c.priority), OK;
}
let T = hs(e, Hi(e, Ss), Object.assign(Object.assign({}, c), {
reverse: !1,
cache: u
}));
return T === ERR_NOT_FOUND && (xs(e, u), ds(Hi(e, Ss), e.pos, l, Object.assign(Object.assign({}, c), {
cache: u
})), T = hs(e, Hi(e, Ss), Object.assign(Object.assign({}, c), {
reverse: !1,
cache: u
}))), T;
}, _s = "_rsi";
return xa.CachingStrategies = fi, xa.CoordListSerializer = pi, xa.CoordSerializer = mi, 
xa.Keys = ji, xa.MoveTargetListSerializer = ci, xa.MoveTargetSerializer = si, xa.NumberSerializer = Ca, 
xa.PositionListSerializer = li, xa.PositionSerializer = ui, xa.adjacentWalkablePositions = Ci, 
xa.blockSquare = function(e) {
rs(e.roomName).blockedSquares.add(Va(e));
}, xa.cachePath = ds, xa.cachedPathKey = ms, xa.calculateAdjacencyMatrix = Ri, xa.calculateAdjacentPositions = Ei, 
xa.calculateNearbyPositions = Ti, xa.calculatePositionsAtRange = Si, xa.cleanAllCaches = di, 
xa.clearCachedPath = xs, xa.compressPath = e => {
const t = [], r = e[0];
if (!r) return "";
let o = r;
for (const r of e.slice(1)) {
if (1 !== ei(o, r)) throw new Error("Cannot compress path unless each RoomPosition is adjacent to the previous one");
t.push(o.getDirectionTo(r)), o = r;
}
return Va(r) + Fa.encode(t);
}, xa.config = ha, xa.decompressPath = e => {
let t = Ka(e.slice(0, 2));
const r = [ t ], o = Fa.decode(e.slice(2));
for (const e of o) t = ti(t, e), r.push(t);
return r;
}, xa.fastRoomPosition = Pa, xa.fixEdgePosition = vi, xa.follow = function(e, t) {
e.move(t), t.pull(e), function(e, t) {
const r = rs(e.pos.roomName);
r.pullers.add(e.id), r.pullees.add(t.id);
}(t, e);
}, xa.followPath = hs, xa.fromGlobalPosition = Za, xa.generatePath = Zi, xa.getCachedPath = fs, 
xa.getMoveIntents = rs, xa.getRangeTo = ei, xa.globalPosition = Ja, xa.isExit = hi, 
xa.isPositionWalkable = wi, xa.move = ls, xa.moveByPath = function(e, t, r) {
var o, n, a, i;
const s = null !== (o = null == r ? void 0 : r.repathIfStuck) && void 0 !== o ? o : ha.DEFAULT_MOVE_OPTS.repathIfStuck, c = null !== (i = null === (a = null !== (n = null == r ? void 0 : r.avoidTargets) && void 0 !== n ? n : ha.DEFAULT_MOVE_OPTS.avoidTargets) || void 0 === a ? void 0 : a(e.pos.roomName)) && void 0 !== i ? i : [];
let u = Ra.get(Hi(e, _s));
const l = fs(t, r);
if ((s || c.length) && void 0 !== u) {
let t = null == l ? void 0 : l.findIndex(t => t.isEqualTo(e.pos));
-1 === t && (t = void 0), void 0 !== t && ((null == r ? void 0 : r.reverse) ? t <= u : t >= u) && (Ra.delete(Hi(e, _s)), 
u = void 0);
}
let m = ERR_NOT_FOUND;
if (void 0 === u && (m = hs(e, t, r)), m !== ERR_NOT_FOUND) {
const t = Ra.get(Hi(e, "_cpi"));
if (!(s && Es(e, s) || l && gs(Oi(l, null != t ? t : 0, null == r ? void 0 : r.reverse), c))) return m;
void 0 !== t && (u = (null == r ? void 0 : r.reverse) ? t - 1 : t + 2, Ra.set(Hi(e, _s), u));
}
let p = fs(t, r);
return p ? (void 0 !== u && (p = Oi(p, u, null == r ? void 0 : r.reverse)), 0 === p.length ? ERR_NO_PATH : Os(e, p, r)) : ERR_NO_PATH;
}, xa.moveTo = Os, xa.normalizeTargets = gi, xa.offsetRoomPosition = Ga, xa.packCoord = Ha, 
xa.packCoordList = Ya, xa.packPos = Va, xa.packPosList = za, xa.packRoomName = ni, 
xa.packRoomNames = ri, xa.posAtDirection = ti, xa.preTick = function() {
di(), function() {
for (const e in Game.rooms) Ai(e), Di(e);
!function() {
var e, t;
const r = new Set;
Memory[ha.MEMORY_PORTAL_PATH] = [];
for (const o of Li.values()) for (const n of o.values()) r.has(n) || (r.add(n), 
n.expires && n.expires < Game.time ? (null === (e = Li.get(n.room1)) || void 0 === e || e.delete(n.room2), 
null === (t = Li.get(n.room2)) || void 0 === t || t.delete(n.room1)) : Memory[ha.MEMORY_PORTAL_PATH].push(Fi(n)));
}();
}();
}, xa.reconcileTraffic = function(e) {
for (const t of [ ...es.keys() ]) Game.rooms[t] && us(t, e);
Ua.with(Ca).set(is, Game.time);
}, xa.reconciledRecently = ss, xa.resetCachedPath = ys, xa.roomNameFromCoords = $a, 
xa.roomNameToCoords = Qa, xa.sameRoomPosition = Ia, xa.unpackCoord = ja, xa.unpackCoordList = qa, 
xa.unpackPos = Ka, xa.unpackPosList = Xa, xa.unpackRoomName = ai, xa.unpackRoomNames = oi, 
xa;
}(), _a = Qr("TargetAssignmentManager"), Aa = new Map;

function Ua(e) {
var t = Aa.get(e.name);
if (t && Game.time - t.tick < 10) return t;
var r = function(e) {
var t, r, o = {
tick: Game.time,
sources: new Map,
harvesterToSource: new Map,
buildTargets: [],
builderToTarget: new Map,
upgraders: new Set
}, n = e.find(FIND_MY_CREEPS), a = [], i = [], s = [];
try {
for (var c = p(n), u = c.next(); !u.done; u = c.next()) {
var l = u.value, m = l.memory.role;
"harvester" === m || "staticMiner" === m ? a.push(l) : "builder" === m ? i.push(l) : "upgrader" === m && (s.push(l), 
o.upgraders.add(l.id));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
return function(e, t, r) {
var o, n, a, i, s, c, u, l, m = Wo(e);
if (0 !== m.length) {
try {
for (var d = p(m), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
r.sources.set(y.id, {
sourceId: y.id,
assignedHarvesters: [],
maxHarvesters: 2
});
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
var h = [];
try {
for (var g = p(t), v = g.next(); !v.done; v = g.next()) {
var R = v.value, E = R.memory.targetId;
h.push({
creep: R,
currentSource: null != E ? E : null
});
}
} catch (e) {
a = {
error: e
};
} finally {
try {
v && !v.done && (i = g.return) && i.call(g);
} finally {
if (a) throw a.error;
}
}
try {
for (var T = p(h), S = T.next(); !S.done; S = T.next()) {
var C = S.value, w = C.creep, b = C.currentSource;
if (b && (U = r.sources.get(b)) && U.assignedHarvesters.length < U.maxHarvesters) U.assignedHarvesters.push(w.id), 
r.harvesterToSource.set(w.id, b); else {
var x = null, O = 1 / 0;
try {
for (var _ = (u = void 0, p(r.sources.values())), A = _.next(); !A.done; A = _.next()) {
var U, N = (U = A.value).assignedHarvesters.length;
N < U.maxHarvesters && N < O && (x = U, O = N);
}
} catch (e) {
u = {
error: e
};
} finally {
try {
A && !A.done && (l = _.return) && l.call(_);
} finally {
if (u) throw u.error;
}
}
x && (x.assignedHarvesters.push(w.id), r.harvesterToSource.set(w.id, x.sourceId));
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
S && !S.done && (c = T.return) && c.call(T);
} finally {
if (s) throw s.error;
}
}
}
}(e, a, o), function(e, t, r) {
var o, n, a, i, s = Ko(e), c = function(e) {
var t, r, o, n = Cn.getSwarmState(e.name);
if (!n || !n.remoteAssignments || 0 === n.remoteAssignments.length) return [];
var a = [];
try {
for (var i = p(n.remoteAssignments), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Game.rooms[c];
if (u && (!(null === (o = u.controller) || void 0 === o ? void 0 : o.owner) || u.controller.my)) {
var l = Ko(u);
a.push.apply(a, f([], d(l), !1));
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
return a;
}(e), u = f(f([], d(s), !1), d(c), !1);
if (0 !== u.length) {
var l = u.map(function(t) {
return {
site: t,
priority: Na(t, e.name)
};
}).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var m = p(l), y = m.next(); !y.done; y = m.next()) {
var h = y.value, g = h.site, v = h.priority;
r.buildTargets.push({
targetId: g.id,
assignedBuilders: [],
priority: v
});
}
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
var R = 0;
try {
for (var E = p(t), T = E.next(); !T.done; T = E.next()) {
var S = T.value;
if (0 === r.buildTargets.length) break;
var C = r.buildTargets[R];
C.assignedBuilders.push(S.id), r.builderToTarget.set(S.id, C.targetId), R = (R + 1) % r.buildTargets.length;
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
}(e, i, o), o;
}(e);
return Aa.set(e.name, r), _a.debug("Calculated fresh assignments for ".concat(e.name), {
meta: {
sources: r.sources.size,
buildTargets: r.buildTargets.length,
upgraders: r.upgraders.size
}
}), r;
}

function Na(e, t) {
var r;
if ((null === (r = e.room) || void 0 === r ? void 0 : r.name) !== t) switch (e.structureType) {
case STRUCTURE_CONTAINER:
return 100;

case STRUCTURE_ROAD:
return 80;

case STRUCTURE_RAMPART:
return 40;

case STRUCTURE_WALL:
return 30;

default:
return 60;
}
switch (e.structureType) {
case STRUCTURE_SPAWN:
return 95;

case STRUCTURE_EXTENSION:
return 90;

case STRUCTURE_TOWER:
return 85;

case STRUCTURE_STORAGE:
return 75;

case STRUCTURE_LINK:
return 70;

case STRUCTURE_CONTAINER:
return 65;

case STRUCTURE_ROAD:
return 50;

case STRUCTURE_RAMPART:
return 40;

case STRUCTURE_WALL:
return 30;

default:
return 60;
}
}

var Ma, ka, Pa, Ia = {
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
}, Ga = function() {
function e(e) {
void 0 === e && (e = {}), this.config = l(l({}, Ia), e);
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
if (Game.time - r.createdAt > t.config.requestTimeout) return $r.debug("Resource request from ".concat(r.fromRoom, " to ").concat(r.toRoom, " expired"), {
subsystem: "ResourceSharing"
}), !1;
if (r.delivered >= r.amount) return $r.info("Resource transfer completed: ".concat(r.delivered, " ").concat(r.resourceType, " from ").concat(r.fromRoom, " to ").concat(r.toRoom), {
subsystem: "ResourceSharing"
}), !1;
if (!e.memberRooms.includes(r.toRoom) || !e.memberRooms.includes(r.fromRoom)) return !1;
if (Game.rooms[r.toRoom]) {
var o = Cn.getSwarmState(r.toRoom);
if (o && 0 === o.metrics.energyNeed) return $r.debug("Resource request from ".concat(r.fromRoom, " to ").concat(r.toRoom, " no longer needed"), {
subsystem: "ResourceSharing"
}), !1;
}
return !0;
});
}, e.prototype.getRoomStatuses = function(e) {
var t, r, o, n = [];
try {
for (var a = p(e.memberRooms), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Game.rooms[s];
if (c && (null === (o = c.controller) || void 0 === o ? void 0 : o.my)) {
var u = Cn.getSwarmState(s);
if (u) {
var l = e.focusRoom === s, m = this.calculateRoomEnergy(c), d = m.energyAvailable, f = m.energyCapacity, y = this.calculateEnergyNeed(c, d, u, l), h = 0;
l ? h = 0 : d > this.config.surplusEnergyThreshold && (h = d - this.config.mediumEnergyThreshold);
var g = 0;
3 === y ? g = this.config.criticalEnergyThreshold - d : 2 === y ? g = this.config.mediumEnergyThreshold - d : 1 === y && (g = this.config.lowEnergyThreshold - d), 
g = l && y > 0 ? Math.max(g, 2 * this.config.minTransferAmount) : Math.max(g, this.config.minTransferAmount), 
n.push({
roomName: s,
hasTerminal: void 0 !== c.terminal && c.terminal.my,
energyAvailable: d,
energyCapacity: f,
energyNeed: y,
canProvide: h,
needsAmount: g
}), u.metrics.energyAvailable = d, u.metrics.energyCapacity = f, u.metrics.energyNeed = y;
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
return n;
}, e.prototype.calculateRoomEnergy = function(e) {
var t, r, o = 0, n = 0;
e.storage && (o += e.storage.store.getUsedCapacity(RESOURCE_ENERGY), n += e.storage.store.getCapacity());
var a = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}
});
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
o += c.store.getUsedCapacity(RESOURCE_ENERGY), n += c.store.getCapacity();
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
}), a = t.filter(function(e) {
return e.canProvide > 0;
}).sort(function(e, t) {
return t.canProvide - e.canProvide;
});
if (0 !== n.length && 0 !== a.length) {
var i = function(t) {
var r, o;
if (e.resourceRequests.filter(function(e) {
return e.toRoom === t.roomName;
}).length >= s.config.maxRequestsPerRoom) return "continue";
var n = null, i = 1 / 0, c = function(r) {
if (r.roomName === t.roomName) return "continue";
if (e.resourceRequests.some(function(e) {
return e.fromRoom === r.roomName && e.toRoom === t.roomName;
})) return "continue";
var o = Game.map.getRoomLinearDistance(r.roomName, t.roomName);
o < i && r.canProvide >= s.config.minTransferAmount && (i = o, n = r);
};
try {
for (var u = (r = void 0, p(a)), l = u.next(); !l.done; l = u.next()) c(l.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
if (n && i <= 3) {
var m = Math.min(t.needsAmount, n.canProvide), d = {
toRoom: t.roomName,
fromRoom: n.roomName,
resourceType: RESOURCE_ENERGY,
amount: m,
priority: t.energyNeed,
createdAt: Game.time,
assignedCreeps: [],
delivered: 0
};
e.resourceRequests.push(d), $r.info("Created resource transfer: ".concat(m, " energy from ").concat(n.roomName, " to ").concat(t.roomName, " (priority ").concat(d.priority, ", distance ").concat(i, ")"), {
subsystem: "ResourceSharing"
}), n.canProvide -= m;
}
}, s = this;
try {
for (var c = p(n), u = c.next(); !u.done; u = c.next()) i(u.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = c.return) && o.call(c);
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
o.delivered += r, $r.debug("Updated transfer progress: ".concat(o.delivered, "/").concat(o.amount, " from ").concat(o.fromRoom, " to ").concat(o.toRoom), {
subsystem: "ResourceSharing"
});
}
}, e;
}(), La = new Ga, Da = {
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

function Fa(e, t) {
var r, o, n = e.coreRoom, a = 1 / 0;
try {
for (var i = p(e.memberRooms), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Game.map.getRoomLinearDistance(c, t);
u < a && (a = u, n = c);
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

function Ba(e, t) {
var r = function(e) {
var t, r = Math.min(3, Math.max(1, e.urgency)), o = null !== (t = Da[r]) && void 0 !== t ? t : Da[2];
return {
guards: Math.max(o.guards, e.guardsNeeded),
rangers: Math.max(o.rangers, e.rangersNeeded),
healers: Math.max(o.healers, e.healersNeeded),
siegeUnits: o.siegeUnits
};
}(t), o = "defense_".concat(t.roomName, "_").concat(Game.time), n = Fa(e, t.roomName), a = {
id: o,
type: "defense",
members: [],
rallyRoom: n,
targetRooms: [ t.roomName ],
state: "gathering",
createdAt: Game.time
};
return $r.info("Created defense squad ".concat(o, " for ").concat(t.roomName, ": ") + "".concat(r.guards, "G/").concat(r.rangers, "R/").concat(r.healers, "H rally at ").concat(n), {
subsystem: "Squad"
}), a;
}

function Wa(e) {
var t = Game.time - e.createdAt;
if ("gathering" === e.state && t > 300) return $r.warn("Squad ".concat(e.id, " timed out during formation (").concat(t, " ticks)"), {
subsystem: "Squad"
}), !0;
if (0 === e.members.length && t > 50) return $r.info("Squad ".concat(e.id, " has no members, dissolving"), {
subsystem: "Squad"
}), !0;
if ("attacking" === e.state) {
var r = e.targetRooms[0];
if (r) {
var o = Game.rooms[r];
if (o && 0 === o.find(FIND_HOSTILE_CREEPS).length && t > 100) return $r.info("Squad ".concat(e.id, " mission complete, no more hostiles"), {
subsystem: "Squad"
}), !0;
}
}
return !1;
}

function Va(e) {
var t = e.members.length;
e.members = e.members.filter(function(e) {
return Game.creeps[e];
}), e.members.length < t && $r.debug("Squad ".concat(e.id, " lost ").concat(t - e.members.length, " members"), {
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
}) && (e.state = "moving", $r.info("Squad ".concat(e.id, " gathered, moving to ").concat(o), {
subsystem: "Squad"
}));
break;

case "moving":
r.some(function(e) {
return e.room.name === o;
}) && (e.state = "attacking", $r.info("Squad ".concat(e.id, " reached ").concat(o, ", engaging"), {
subsystem: "Squad"
}));
break;

case "attacking":
Game.time - e.createdAt > 50 && r.length < 3 && (e.state = "retreating", $r.warn("Squad ".concat(e.id, " retreating - heavy casualties"), {
subsystem: "Squad"
}));
break;

case "retreating":
r.every(function(t) {
return t.room.name === e.rallyRoom;
}) && (e.state = "dissolving", $r.info("Squad ".concat(e.id, " retreated to ").concat(e.rallyRoom, ", dissolving"), {
subsystem: "Squad"
}));
}
}
}

(Ma = {})[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 300, Ma[RESOURCE_CATALYZED_UTRIUM_ACID] = 300, 
Ma[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 300, (ka = {})[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 600, 
ka[RESOURCE_CATALYZED_UTRIUM_ACID] = 600, ka[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 300, 
ka[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 600, (Pa = {})[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 900, 
Pa[RESOURCE_CATALYZED_UTRIUM_ACID] = 600, Pa[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = 900, 
Pa[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 600, Pa[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 900;

var Ka = {
0: 0,
1: 5e3,
2: 15e3,
3: 5e4
};

function Ha(e, t) {
var r = Ka[t], o = Cn.getClusters();
for (var n in o) o[n].defenseRequests.some(function(t) {
return t.roomName === e && t.urgency >= 2;
}) && (r += 1e4);
return r;
}

function ja(e, t, r) {
var o, n, a, i = 0;
try {
for (var s = p(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var u = c.value;
if (u !== t) {
var l = Game.rooms[u];
if (l && l.storage) {
var m = Cn.getSwarmState(u);
if (m) {
var d = l.storage.store.getUsedCapacity(RESOURCE_ENERGY) - Ha(u, m.danger);
d > r && d > i && (i = d, a = u);
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
if (!a) return $r.warn("No available energy source for emergency routing to ".concat(t, " (need ").concat(r, ")"), {
subsystem: "MilitaryPool"
}), {
success: !1
};
var f = Game.rooms[a], y = Game.rooms[t];
return (null == f ? void 0 : f.terminal) && (null == y ? void 0 : y.terminal) ? f.terminal.send(RESOURCE_ENERGY, r, t) === OK ? ($r.info("Emergency energy routed: ".concat(r, " from ").concat(a, " to ").concat(t), {
subsystem: "MilitaryPool"
}), {
success: !0,
sourceRoom: a
}) : {
success: !1
} : ($r.info("Creating hauler transfer request: ".concat(r, " energy from ").concat(a, " to ").concat(t), {
subsystem: "MilitaryPool"
}), e.resourceRequests.push({
toRoom: t,
fromRoom: a,
resourceType: RESOURCE_ENERGY,
amount: r,
priority: 5,
createdAt: Game.time,
assignedCreeps: [],
delivered: 0
}), {
success: !0,
sourceRoom: a
});
}

var Ya = {
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

function qa(e, t) {
var r, o, n, a;
if (!t) return $r.debug("No intel for ".concat(e, ", defaulting to harassment"), {
subsystem: "Doctrine"
}), "harassment";
var i = null !== (r = t.towerCount) && void 0 !== r ? r : 0, s = null !== (o = t.spawnCount) && void 0 !== o ? o : 0, c = null !== (n = t.rcl) && void 0 !== n ? n : 0, u = 3 * i + 2 * s + 1.5 * (null !== (a = t.militaryPresence) && void 0 !== a ? a : 0) + .5 * c;
return u >= 20 || c >= 7 ? ($r.info("Selected SIEGE doctrine for ".concat(e, " (threat: ").concat(u, ")"), {
subsystem: "Doctrine"
}), "siege") : u >= 10 || c >= 5 ? ($r.info("Selected RAID doctrine for ".concat(e, " (threat: ").concat(u, ")"), {
subsystem: "Doctrine"
}), "raid") : ($r.info("Selected HARASSMENT doctrine for ".concat(e, " (threat: ").concat(u, ")"), {
subsystem: "Doctrine"
}), "harassment");
}

function za(e, t) {
var r, o, n, a = Ya[t], i = 0;
try {
for (var s = p(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var u = c.value, l = Game.rooms[u];
if (l && (null === (n = l.controller) || void 0 === n ? void 0 : n.my)) {
var m = l.storage, d = l.terminal;
m && (i += m.store.energy), d && (i += d.store.energy);
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
var f = i >= a.minEnergy;
return f || $r.debug("Cannot launch ".concat(t, ": insufficient energy (").concat(i, "/").concat(a.minEnergy, ")"), {
subsystem: "Doctrine"
}), f;
}

var Xa = {
rclWeight: 10,
resourceWeight: 5,
strategicWeight: 3,
distancePenalty: 2,
weakDefenseBonus: 20,
strongDefensePenalty: 15,
warTargetBonus: 50
};

function Qa(e, t, r, o) {
var n, a, i = 0;
i += e.controllerLevel * o.rclWeight, e.controllerLevel >= 6 ? i += 5 * o.resourceWeight : e.controllerLevel >= 4 && (i += 2 * o.resourceWeight), 
i += e.sources * o.strategicWeight, i -= t * o.distancePenalty;
var s = null !== (n = e.towerCount) && void 0 !== n ? n : 0, c = null !== (a = e.spawnCount) && void 0 !== a ? a : 0;
return 0 === s && c <= 1 ? i += o.weakDefenseBonus : (s >= 4 || s >= 2 && c >= 2) && (i -= o.strongDefensePenalty), 
r && (i += o.warTargetBonus), e.threatLevel >= 2 && !r && (i -= 10 * e.threatLevel), 
Math.max(0, i);
}

function $a(e, t) {
var r, o, n = 1 / 0;
try {
for (var a = p(e.memberRooms), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Game.map.getRoomLinearDistance(s, t);
c < n && (n = c);
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
return n;
}

var Ja = {
move: 50,
work: 100,
carry: 50,
attack: 80,
ranged_attack: 150,
heal: 250,
claim: 600,
tough: 10
}, Za = new Map;

function ei(e, t, r) {
for (var o = f([], d(e), !1), n = e.reduce(function(e, t) {
return e + Ja[t];
}, 0), a = r.reduce(function(e, t) {
return e + Ja[t];
}, 0); n + a <= t && o.length < 50; ) o.push.apply(o, f([], d(r), !1)), n += a;
return o.slice(0, 50);
}

var ti = new Map;

function ri(e) {
e.lastUpdate = Game.time;
var t = Cn.getCluster(e.clusterId);
if (!t) return e.state = "failed", void $r.error("Cluster ".concat(e.clusterId, " not found for operation ").concat(e.id), {
subsystem: "Offensive"
});
switch (e.state) {
case "forming":
!function(e) {
e.squadIds.every(function(e) {
return !function(e) {
return Za.has(e);
}(e);
}) && (e.state = "executing", $r.info("Operation ".concat(e.id, " entering execution phase"), {
subsystem: "Offensive"
})), Game.time - e.createdAt > 1e3 && (e.state = "failed", $r.warn("Operation ".concat(e.id, " formation timed out"), {
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
if (Va(o), Wa(o)) {
$r.info("Squad ".concat(r, " dissolving, operation ").concat(e.id, " may complete"), {
subsystem: "Offensive"
});
var n = t.squads.findIndex(function(e) {
return e.id === r;
});
n >= 0 && t.squads.splice(n, 1);
}
};
try {
for (var a = p(e.squadIds), i = a.next(); !i.done; i = a.next()) n(i.value);
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
0 === e.squadIds.filter(function(e) {
return t.squads.some(function(t) {
return t.id === e;
});
}).length && (e.state = "complete", $r.info("Operation ".concat(e.id, " complete"), {
subsystem: "Offensive"
}));
}(e, t);
}
}

function oi(e, t, r) {
var o, n, a, i = 0, s = 0, c = e.getTerrain().get(t.x, t.y);
if (c === TERRAIN_MASK_WALL) return {
position: t,
score: 0,
terrain: 0,
safety: 0,
centrality: 0,
exitAccess: 0
};
if (i += o = 0 === c ? 10 : 5, e.lookForAt(LOOK_STRUCTURES, t).some(function(e) {
return e.structureType !== STRUCTURE_ROAD && e.structureType !== STRUCTURE_RAMPART;
})) return {
position: t,
score: 0,
terrain: 0,
safety: 0,
centrality: 0,
exitAccess: 0
};
var u = e.find(FIND_HOSTILE_CREEPS);
if (u.length > 0) {
var l = Math.min.apply(Math, f([], d(u.map(function(e) {
return t.getRangeTo(e);
})), !1));
s = Math.min(10, l);
} else s = 10;
i += 2 * s;
var m = Math.sqrt(Math.pow(t.x - 25, 2) + Math.pow(t.y - 25, 2));
i += n = "defense" === r || "retreat" === r ? Math.max(0, 10 - m / 2) : Math.max(0, 5 - Math.abs(m - 15) / 2);
var p = Math.min(t.x, t.y, 49 - t.x, 49 - t.y);
return a = "offense" === r || "staging" === r ? Math.max(0, 10 - p / 2) : Math.min(10, p / 2.5), 
{
position: t,
score: i += a,
terrain: o,
safety: s,
centrality: n,
exitAccess: a
};
}

var ni = {
updateInterval: 10,
minBucket: 0,
resourceBalanceThreshold: 1e4,
minTerminalEnergy: 5e4
}, ai = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = new Map, this.config = l(l({}, ni), e);
}
return t.prototype.run = function() {
var e = Cn.getClusters();
for (var t in e) {
var r = e[t];
if (this.shouldRunCluster(t)) try {
this.runCluster(r), this.lastRun.set(t, Game.time);
} catch (e) {
var o = e instanceof Error ? e.message : String(e);
$r.error("Cluster ".concat(t, " error: ").concat(o), {
subsystem: "Cluster"
});
}
}
}, t.prototype.shouldRunCluster = function(e) {
var t, r = null !== (t = this.lastRun.get(e)) && void 0 !== t ? t : 0;
return Game.time - r >= this.config.updateInterval;
}, t.prototype.runCluster = function(t) {
var r = this, n = Game.cpu.getUsed();
e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":metrics"), function() {
r.updateClusterMetrics(t);
}), e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":defense"), function() {
r.processDefenseRequests(t), o.coordinateClusterDefense(t.id);
}), e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":terminals"), function() {
r.balanceTerminalResources(t);
}), e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":resourceSharing"), function() {
La.processCluster(t);
}), e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":squads"), function() {
r.updateSquads(t);
}), e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":offensive"), function() {
r.updateOffensiveOperations(t);
}), e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":rallyPoints"), function() {
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
var u = oi(e, new RoomPosition(s, c, e.name), "defense");
u.score > 0 && n.push(u);
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
var l = n[0];
return {
roomName: e.name,
x: l.position.x,
y: l.position.y,
purpose: "defense",
createdAt: Game.time
};
}(e) : null;
}(r);
o && (e.rallyPoints.push(o), $r.debug("Created defense rally point for ".concat(t, " at ").concat(o.x, ",").concat(o.y), {
subsystem: "RallyPoint"
}));
}
};
try {
for (var n = p(e.memberRooms), a = n.next(); !a.done; a = n.next()) o(a.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}(t);
}), e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":militaryResources"), function() {
!function(e) {
var t, r;
try {
for (var o = p(e.memberRooms), n = o.next(); !n.done; n = o.next()) {
var a = n.value, i = Cn.getSwarmState(a);
if (i) {
var s = Ha(a, i.danger);
s > 0 && Game.time % 100 == 0 && $r.debug("Military energy reservation for ".concat(a, ": ").concat(s, " (danger ").concat(i.danger, ")"), {
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
}), e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":role"), function() {
r.updateClusterRole(t);
}), e.unifiedStats.measureSubsystem("cluster:".concat(t.id, ":focusRoom"), function() {
r.updateFocusRoom(t);
}), t.lastUpdate = Game.time;
var a = Game.cpu.getUsed() - n;
a > 1 && Game.time % 50 == 0 && $r.debug("Cluster ".concat(t.id, " tick: ").concat(a.toFixed(2), " CPU"), {
subsystem: "Cluster"
});
}, t.prototype.updateClusterMetrics = function(e) {
var t, r, o = 0, n = 0, a = 0, i = 0, s = 0;
try {
for (var c = p(e.memberRooms), u = c.next(); !u.done; u = c.next()) {
var l = u.value, m = Cn.getSwarmState(l);
if (m) {
o += m.metrics.energyHarvested, n += m.metrics.energySpawning + m.metrics.energyConstruction + m.metrics.energyRepair, 
a += 25 * m.danger;
var d = Game.rooms[l];
(null == d ? void 0 : d.storage) ? i += d.storage.store.getUsedCapacity(RESOURCE_ENERGY) / d.storage.store.getCapacity() * 100 : i += m.metrics.energyHarvested > 0 ? 50 : 0, 
s++;
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
s > 0 && (e.metrics.energyIncome = o / s, e.metrics.energyConsumption = n / s, e.metrics.energyBalance = e.metrics.energyIncome - e.metrics.energyConsumption, 
e.metrics.warIndex = Math.min(100, a / s), e.metrics.economyIndex = Math.min(100, i / s)), 
e.metrics.militaryReadiness = this.calculateMilitaryReadiness(e);
}, t.prototype.calculateMilitaryReadiness = function(e) {
var t, r, o, n = 0, a = 0;
try {
for (var i = p(e.memberRooms), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Game.rooms[c];
if (u && (null === (o = u.controller) || void 0 === o ? void 0 : o.my)) {
n += u.find(FIND_MY_CREEPS, {
filter: function(e) {
return "military" === e.memory.family;
}
}).length;
var l = u.controller.level;
a += Math.max(2, Math.floor(l / 2));
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
return 0 === a ? 0 : Math.min(100, Math.round(n / a * 100));
}, t.prototype.balanceTerminalResources = function(e) {
var t, r, o, n, a = [];
try {
for (var i = p(e.memberRooms), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Game.rooms[c];
(null == u ? void 0 : u.terminal) && u.terminal.my && a.push({
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
s && !s.done && (r = i.return) && r.call(i);
} finally {
if (t) throw t.error;
}
}
if (!(a.length < 2) && (this.balanceResource(a, RESOURCE_ENERGY), Game.time % 50 == 0)) {
var l = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
try {
for (var m = p(l), d = m.next(); !d.done; d = m.next()) {
var f = d.value;
this.balanceResource(a, f);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
d && !d.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
}
}, t.prototype.balanceResource = function(e, t) {
var r, o, n, a, i, s, c = this, u = 0;
try {
for (var l = p(e), m = l.next(); !m.done; m = l.next()) u += m.value.terminal.store.getUsedCapacity(t);
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
var d = u / e.length, f = e.filter(function(e) {
return e.terminal.store.getUsedCapacity(t) > d + c.config.resourceBalanceThreshold;
}), y = e.filter(function(e) {
return e.terminal.store.getUsedCapacity(t) < d - c.config.resourceBalanceThreshold;
});
if (0 !== f.length && 0 !== y.length) try {
for (var h = p(f), g = h.next(); !g.done; g = h.next()) {
var v = g.value;
if (!(v.terminal.cooldown > 0 || t === RESOURCE_ENERGY && v.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.minTerminalEnergy + this.config.resourceBalanceThreshold)) try {
for (var R = (i = void 0, p(y)), E = R.next(); !E.done; E = R.next()) {
var T = E.value, S = Math.min(v.terminal.store.getUsedCapacity(t) - d, d - T.terminal.store.getUsedCapacity(t), 1e4);
if (S > 1e3 && v.terminal.send(t, S, T.room.name) === OK) {
$r.debug("Transferred ".concat(S, " ").concat(t, " from ").concat(v.room.name, " to ").concat(T.room.name), {
subsystem: "Cluster"
});
break;
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
} catch (e) {
n = {
error: e
};
} finally {
try {
g && !g.done && (a = h.return) && a.call(h);
} finally {
if (n) throw n.error;
}
}
}, t.prototype.updateSquads = function(e) {
var t, r;
try {
for (var o = p(e.squads), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
Va(a), Wa(a) && (a.state = "dissolving");
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
for (var n = p(o), a = n.next(); !a.done; a = n.next()) {
var i = a.value, s = Ba(e, i);
e.squads.push(s);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}, t.prototype.updateOffensiveOperations = function(e) {
Game.time % 100 == 0 && function(e) {
if ("war" === e.role || "mixed" === e.role) {
var t = Array.from(ti.values()).filter(function(t) {
return t.clusterId === e.id && "complete" !== t.state && "failed" !== t.state;
});
if (t.length >= 2) $r.debug("Cluster ".concat(e.id, " at max operations (").concat(t.length, ")"), {
subsystem: "Offensive"
}); else {
var r = function(e, t, r, o) {
var n, a;
void 0 === o && (o = {});
var i = l(l({}, Xa), o), s = [], c = Cn.getEmpire(), u = c.knownRooms, m = new Set(c.warTargets);
for (var p in u) {
var d = u[p];
if (d.scouted && "self" !== d.owner && !d.isHighway && !d.isSK) {
var f = $a(e, p);
if (!(f > 10)) {
var y = null !== (a = null === (n = Memory.lastAttacked) || void 0 === n ? void 0 : n[p]) && void 0 !== a ? a : 0;
if (!(Game.time - y < 5e3)) {
var h = Qa(d, f, m.has(p), i), g = "neutral";
d.owner && (g = m.has(d.owner) || m.has(p) ? "enemy" : "hostile");
var v = qa(p, {
towerCount: d.towerCount,
spawnCount: d.spawnCount,
rcl: d.controllerLevel,
owner: d.owner
});
s.push({
roomName: p,
score: h,
distance: f,
doctrine: v,
type: g,
intel: d
});
}
}
}
}
s.sort(function(e, t) {
return t.score - e.score;
});
var R = s.slice(0, 3);
return R.length > 0 && $r.info("Found ".concat(R.length, " attack targets for cluster ").concat(e.id, ": ") + R.map(function(e) {
return "".concat(e.roomName, "(").concat(e.score.toFixed(0), ")");
}).join(", "), {
subsystem: "AttackTarget"
}), R;
}(e);
if (0 !== r.length) {
var o = r[0];
za(e, o.doctrine) ? function(e, t, r) {
if (!function(e) {
var t = Cn.getEmpire().knownRooms[e];
return t ? !(Game.time - t.lastSeen > 5e3 && ($r.warn("Intel for ".concat(e, " is stale (").concat(Game.time - t.lastSeen, " ticks old)"), {
subsystem: "AttackTarget"
}), 1)) : ($r.warn("No intel for target ".concat(e), {
subsystem: "AttackTarget"
}), !1);
}(t)) return $r.warn("Invalid target ".concat(t), {
subsystem: "Offensive"
}), null;
var o = Cn.getEmpire().knownRooms[t], n = null != r ? r : qa(t, {
towerCount: null == o ? void 0 : o.towerCount,
spawnCount: null == o ? void 0 : o.spawnCount,
rcl: null == o ? void 0 : o.controllerLevel,
owner: null == o ? void 0 : o.owner
});
if (!za(e, n)) return $r.warn("Cannot launch ".concat(n, " operation on ").concat(t, " - insufficient resources"), {
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
ti.set(a, i);
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
}(0, o), a = "".concat(r, "_").concat(t, "_").concat(Game.time), i = Fa(e, t), s = .3;
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
return $r.info("Created ".concat(r, " squad ").concat(a, " for ").concat(t, ": ") + "".concat(n.guards, "G/").concat(n.rangers, "R/").concat(n.healers, "H/").concat(n.siegeUnits, "S rally at ").concat(i), {
subsystem: "Squad"
}), c;
}(e, t, "harassment" === n ? "harass" : n, {
towerCount: null == o ? void 0 : o.towerCount,
spawnCount: null == o ? void 0 : o.spawnCount
});
e.squads.push(c), i.squadIds.push(c.id), function(e, t) {
var r = t.id;
if (Za.has(r)) $r.debug("Squad ".concat(r, " already forming"), {
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
o = Ya[n].composition;
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
Za.set(r, i);
var s = Game.rooms[t.rallyRoom];
s ? (function(e, t, r, o) {
var n = !1;
if ("defense" !== t.type) {
var a = "harass" === t.type ? "harassment" : t.type;
n = Ya[a].useBoosts;
}
var i = kn.NORMAL;
"siege" === t.type ? i = kn.HIGH : "defense" === t.type && (i = kn.EMERGENCY);
var s = function(r, a) {
for (var s = function(a) {
var s = function(e, t, r) {
var o = Math.min(r, 3e3);
switch (e) {
case "harasser":
return ei([ MOVE, ATTACK ], o, [ MOVE, ATTACK ]);

case "soldier":
return ei([ TOUGH, MOVE, ATTACK, MOVE, ATTACK ], o, [ TOUGH, MOVE, ATTACK ]);

case "ranger":
return ei([ TOUGH, MOVE, RANGED_ATTACK ], o, [ MOVE, RANGED_ATTACK ]);

case "healer":
return ei([ TOUGH, MOVE, HEAL ], o, [ MOVE, HEAL ]);

case "siegeUnit":
return ei([ TOUGH, MOVE, WORK ], o, [ TOUGH, MOVE, WORK ]);

default:
return [ MOVE, ATTACK ];
}
}(r, 0, e.energyCapacityAvailable), c = s.reduce(function(e, t) {
return e + Ja[t];
}, 0), u = n ? function(e) {
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
}(r) : [], l = {
id: "".concat(t.id, "_").concat(r, "_").concat(a, "_").concat(Game.time),
roomName: e.name,
role: r,
family: "military",
body: {
parts: s,
cost: c,
minCapacity: c
},
priority: i,
targetRoom: t.targetRooms[0],
boostRequirements: u.length > 0 ? u.map(function(e) {
return {
resourceType: e.compound,
bodyParts: s.filter(function(t) {
return e.parts.includes(t);
})
};
}) : void 0,
createdAt: Game.time,
additionalMemory: {
squadId: t.id
}
};
Ln.addRequest(l), o.spawnRequests.add(l.id);
}, c = 0; c < a; c++) s(c);
};
r.harassers > 0 && s("harasser", r.harassers), r.soldiers > 0 && s("soldier", r.soldiers), 
r.rangers > 0 && s("ranger", r.rangers), r.healers > 0 && s("healer", r.healers), 
r.siegeUnits > 0 && s("siegeUnit", r.siegeUnits);
}(s, t, o, i), $r.info("Started forming squad ".concat(r, ": ").concat(JSON.stringify(a)), {
subsystem: "SquadFormation"
})) : $r.warn("Rally room ".concat(t.rallyRoom, " not visible for squad ").concat(r), {
subsystem: "SquadFormation"
});
}
}(0, c), i.state = "forming", s = t, Memory.lastAttacked || (Memory.lastAttacked = {}), 
Memory.lastAttacked[s] = Game.time, $r.info("Marked ".concat(s, " as attacked at tick ").concat(Game.time), {
subsystem: "AttackTarget"
}), $r.info("Launched ".concat(n, " operation ").concat(a, " on ").concat(t, " with squad ").concat(c.id), {
subsystem: "Offensive"
});
}(e, o.roomName, o.doctrine) : $r.info("Cluster ".concat(e.id, " cannot launch ").concat(o.doctrine, " doctrine (insufficient resources)"), {
subsystem: "Offensive"
});
} else $r.debug("No attack targets found for cluster ".concat(e.id), {
subsystem: "Offensive"
});
}
}
}(e), function() {
var e, t;
!function() {
var e, t, r = Game.time;
try {
for (var o = p(Za.entries()), n = o.next(); !n.done; n = o.next()) {
var a = d(n.value, 2), i = a[0], s = r - a[1].formationStarted;
s > 500 && ($r.warn("Squad ".concat(i, " formation timed out after ").concat(s, " ticks"), {
subsystem: "SquadFormation"
}), Za.delete(i));
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
for (var r = p(ti.entries()), o = r.next(); !o.done; o = r.next()) {
var n = d(o.value, 2);
n[0], ri(n[1]);
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
for (var r = p(ti.entries()), o = r.next(); !o.done; o = r.next()) {
var n = d(o.value, 2), a = n[0], i = n[1], s = Game.time - i.createdAt;
("complete" === i.state || "failed" === i.state) && s > 5e3 && (ti.delete(a), $r.debug("Cleaned up operation ".concat(a), {
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
var t, r, o, n, a = [];
try {
for (var i = p(e.memberRooms), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Game.rooms[c];
u && (null === (o = u.controller) || void 0 === o ? void 0 : o.my) && a.push({
roomName: c,
rcl: u.controller.level
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
if (0 !== a.length) {
if (e.focusRoom) {
var l = Game.rooms[e.focusRoom];
8 === (null === (n = null == l ? void 0 : l.controller) || void 0 === n ? void 0 : n.level) && ($r.info("Focus room ".concat(e.focusRoom, " reached RCL 8, selecting next room"), {
subsystem: "Cluster"
}), e.focusRoom = void 0), l || ($r.warn("Focus room ".concat(e.focusRoom, " no longer valid, selecting new focus"), {
subsystem: "Cluster"
}), e.focusRoom = void 0);
}
if (!e.focusRoom) {
var m = a.filter(function(e) {
return e.rcl < 8;
});
if (0 === m.length) return;
m.sort(function(e, t) {
return e.rcl !== t.rcl ? e.rcl - t.rcl : e.roomName.localeCompare(t.roomName);
}), e.focusRoom = m[0].roomName, $r.info("Selected ".concat(e.focusRoom, " (RCL ").concat(m[0].rcl, ") as focus room for upgrading"), {
subsystem: "Cluster"
});
}
}
}, t.prototype.createCluster = function(e) {
var t = "cluster_".concat(e), r = Cn.getCluster(t, e);
if (!r) throw new Error("Failed to create cluster for ".concat(e));
return $r.info("Created cluster ".concat(t, " with core room ").concat(e), {
subsystem: "Cluster"
}), r;
}, t.prototype.addRoomToCluster = function(e, t, r) {
void 0 === r && (r = !1);
var o = Cn.getCluster(e);
o ? r ? o.remoteRooms.includes(t) || (o.remoteRooms.push(t), $r.info("Added remote room ".concat(t, " to cluster ").concat(e), {
subsystem: "Cluster"
})) : o.memberRooms.includes(t) || (o.memberRooms.push(t), $r.info("Added member room ".concat(t, " to cluster ").concat(e), {
subsystem: "Cluster"
})) : $r.error("Cluster ".concat(e, " not found"), {
subsystem: "Cluster"
});
}, t.prototype.processDefenseRequests = function(e) {
var t, r, o, n, a;
e.defenseRequests = e.defenseRequests.filter(function(e) {
var t = Game.time - e.createdAt;
if (t > 500) return $r.debug("Defense request for ".concat(e.roomName, " expired (").concat(t, " ticks old)"), {
subsystem: "Cluster"
}), !1;
var r = Game.rooms[e.roomName];
return !(!r || 0 === r.find(FIND_HOSTILE_CREEPS).length && ($r.info("Defense request for ".concat(e.roomName, " resolved - no more hostiles"), {
subsystem: "Cluster"
}), 1));
});
try {
for (var i = p(e.defenseRequests), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (c.urgency >= 3) {
var u = Game.rooms[c.roomName];
u && u.storage && u.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 1e4 && ja(e, c.roomName, 2e4);
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
var m = function(t) {
var r = Game.rooms[t];
if (!r || !(null === (a = r.controller) || void 0 === a ? void 0 : a.my)) return "continue";
var o = Cn.getSwarmState(t);
if (!o) return "continue";
if (xn(r, o)) {
var n = e.defenseRequests.find(function(e) {
return e.roomName === t;
});
if (n) {
var i = On(r, o);
i && i.urgency > n.urgency && (n.urgency = i.urgency, n.guardsNeeded = i.guardsNeeded, 
n.rangersNeeded = i.rangersNeeded, n.healersNeeded = i.healersNeeded, n.threat = i.threat);
} else {
var s = On(r, o);
s && e.defenseRequests.push(l(l({}, s), {
assignedCreeps: []
}));
}
}
};
try {
for (var d = p(e.memberRooms), f = d.next(); !f.done; f = d.next()) m(f.value);
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
this.assignDefendersToRequests(e);
}, t.prototype.assignDefendersToRequests = function(e) {
var t, r, o, n, a, i;
if (0 !== e.defenseRequests.length) {
var s = f([], d(e.defenseRequests), !1).sort(function(e, t) {
return t.urgency - e.urgency;
}), c = [];
try {
for (var u = p(s), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
if (Game.rooms[m.roomName]) {
try {
for (var y = (o = void 0, p(e.memberRooms)), h = y.next(); !h.done; h = y.next()) {
var g = h.value;
if (g !== m.roomName) {
var v = Game.rooms[g];
if (v) {
var R = v.find(FIND_MY_CREEPS);
try {
for (var E = (a = void 0, p(R)), T = E.next(); !T.done; T = E.next()) {
var S = T.value, C = S.memory;
if ("military" === C.family && !C.assistTarget && !m.assignedCreeps.includes(S.name)) {
var w = m.guardsNeeded > 0, b = m.rangersNeeded > 0, x = m.healersNeeded > 0, O = "guard" === C.role, _ = "ranger" === C.role, A = "healer" === C.role;
if (w && O || b && _ || x && A) {
var U = Game.map.getRoomLinearDistance(g, m.roomName);
c.push({
creep: S,
room: v,
distance: U,
targetRoom: m.roomName
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
T && !T.done && (i = E.return) && i.call(E);
} finally {
if (a) throw a.error;
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
h && !h.done && (n = y.return) && n.call(y);
} finally {
if (o) throw o.error;
}
}
c.sort(function(e, t) {
return e.distance - t.distance;
});
for (var N = m.guardsNeeded + m.rangersNeeded + m.healersNeeded, M = Math.min(N, c.length), k = 0; k < M; k++) {
var P = c[k];
P && (P.creep.memory.assistTarget = m.roomName, m.assignedCreeps.push(P.creep.name), 
$r.info("Assigned ".concat(P.creep.name, " (").concat(P.creep.memory.role, ") from ").concat(P.room.name, " to assist ").concat(m.roomName, " (distance: ").concat(P.distance, ")"), {
subsystem: "Cluster"
}), "guard" === P.creep.memory.role && m.guardsNeeded--, "ranger" === P.creep.memory.role && m.rangersNeeded--, 
"healer" === P.creep.memory.role && m.healersNeeded--);
}
for (k = c.length - 1; k >= 0; k--) m.assignedCreeps.includes(c[k].creep.name) && c.splice(k, 1);
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
}
}, m([ Yn("cluster:manager", "Cluster Manager", {
priority: yo.MEDIUM,
interval: 10,
minBucket: 0,
cpuBudget: .03
}) ], t.prototype, "run", null), m([ Xn() ], t);
}(), ii = new ai;

function si(e) {
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

function ci(e) {
var t, r, o = Cn.getEmpire(), n = 0, a = di(e);
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = o.knownRooms[c];
u && (u.owner && !yi(u.owner) && (n += 30), u.threatLevel >= 2 && (n += 10 * u.threatLevel), 
u.towerCount && u.towerCount > 0 && (n += 5 * u.towerCount));
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
}

function ui(e) {
return "plains" === e ? 15 : "swamp" === e ? -10 : 0;
}

function li(e) {
var t, r, o = di(e);
try {
for (var n = p(o), a = n.next(); !a.done; a = n.next()) {
var i = fi(a.value);
if (i && (i.x % 10 == 0 || i.y % 10 == 0)) return !0;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return !1;
}

function mi(e) {
var t, r, o = Cn.getEmpire(), n = di(e);
try {
for (var a = p(n), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = o.knownRooms[s];
if (c && c.hasPortal) return 10;
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
return 0;
}

function pi(e, t, r) {
return 0 === t.length ? 0 : r <= 2 ? 25 : r <= 3 ? 15 : r <= 5 ? 5 : 0;
}

function di(e) {
var t = fi(e);
if (!t) return [];
for (var r = t.x, o = t.y, n = t.xDir, a = t.yDir, i = [], s = -1; s <= 1; s++) for (var c = -1; c <= 1; c++) if (0 !== s || 0 !== c) {
var u = r + s, l = o + c, m = n, p = a, d = u, f = l;
u < 0 && (m = "E" === n ? "W" : "E", d = Math.abs(u) - 1), l < 0 && (p = "N" === a ? "S" : "N", 
f = Math.abs(l) - 1), i.push("".concat(m).concat(d).concat(p).concat(f));
}
return i;
}

function fi(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
return t ? {
xDir: t[1],
x: parseInt(t[2], 10),
yDir: t[3],
y: parseInt(t[4], 10)
} : null;
}

function yi(e) {
return !1;
}

function hi(e, t) {
var r = [], o = fi(e);
if (!o) return [];
for (var n = o.x, a = o.y, i = o.xDir, s = o.yDir, c = -t; c <= t; c++) for (var u = -t; u <= t; u++) if (0 !== c || 0 !== u) {
var l = n + c, m = a + u, p = i, d = s, f = l, y = m;
l < 0 && (p = "E" === i ? "W" : "E", f = Math.abs(l) - 1), m < 0 && (d = "N" === s ? "S" : "N", 
y = Math.abs(m) - 1), r.push("".concat(p).concat(f).concat(d).concat(y));
}
return r;
}

function gi(e, t, r, o) {
var n, a = Game.map.getRoomLinearDistance(t, e);
if (!Number.isFinite(a) || a <= 0) throw new Error("calculateRemoteProfitability: invalid distance ".concat(a, " between ").concat(t, " and ").concat(e));
if (r.sources <= 0) throw new Error("calculateRemoteProfitability: intel.sources must be positive, got ".concat(r.sources, " for ").concat(e));
if (void 0 !== r.threatLevel && null !== r.threatLevel && (r.threatLevel < 0 || r.threatLevel > 3)) throw new Error("calculateRemoteProfitability: intel.threatLevel must be in [0, 3], got ".concat(r.threatLevel, " for ").concat(e));
var i = 10 * r.sources, s = 50 * a * 2, c = (650 + 450 * r.sources) / (1500 / s) / s, u = 5e3 * r.sources + 50 * a * 300, l = u / 5e4, m = i * (null !== (n = [ 0, .1, .3, .6 ][r.threatLevel]) && void 0 !== n ? n : 0), p = i - c - l - m, d = c + l, f = d > 0 ? p / d : 0, y = function(e) {
var t = 2 * e.distance, r = e.netProfitPerTick / 10, o = e.threatCost > 0 ? 10 : 0, n = 5 * e.roi;
return Math.max(0, Math.min(100, 50 - t + r - o + n));
}({
distance: a,
threatCost: m,
roi: f,
netProfitPerTick: p
});
return {
roomName: e,
sourceId: o,
energyPerTick: i,
carrierCostPerTick: c,
pathDistance: a,
infrastructureCost: u,
threatCost: m,
netProfitPerTick: p,
roi: f,
profitabilityScore: y,
isProfitable: f > 2 && p > 0
};
}

var vi, Ri, Ei = {
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
}, Ti = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = l(l({}, Ei), e);
}
return t.prototype.run = function() {
var t = this, r = Game.cpu.getUsed(), o = Cn.getEmpire();
this.lastRun = Game.time, o.lastUpdate = Game.time, e.unifiedStats.measureSubsystem("empire:expansion", function() {
t.updateExpansionQueue(o);
}), e.unifiedStats.measureSubsystem("empire:powerBanks", function() {
t.updatePowerBanks(o);
}), e.unifiedStats.measureSubsystem("empire:warTargets", function() {
t.updateWarTargets(o);
}), e.unifiedStats.measureSubsystem("empire:objectives", function() {
t.updateObjectives(o);
}), e.unifiedStats.measureSubsystem("empire:intelRefresh", function() {
t.refreshRoomIntel(o);
}), e.unifiedStats.measureSubsystem("empire:roomDiscovery", function() {
t.discoverNearbyRooms(o);
}), e.unifiedStats.measureSubsystem("empire:gclTracking", function() {
t.trackGCLProgress(o);
}), e.unifiedStats.measureSubsystem("empire:expansionReadiness", function() {
t.checkExpansionReadiness(o);
}), e.unifiedStats.measureSubsystem("empire:nukeCandidates", function() {
t.refreshNukeCandidates(o);
}), e.unifiedStats.measureSubsystem("empire:clusterHealth", function() {
t.monitorClusterHealth();
}), e.unifiedStats.measureSubsystem("empire:powerBankProfitability", function() {
t.assessPowerBankProfitability(o);
});
var n = Game.cpu.getUsed() - r;
Game.time % 100 == 0 && $r.info("Empire tick completed in ".concat(n.toFixed(2), " CPU"), {
subsystem: "Empire"
});
}, t.prototype.cleanupClaimQueue = function(e, t) {
var r = e.claimQueue.length;
e.claimQueue = e.claimQueue.filter(function(e) {
return !t.has(e.roomName) || ($r.info("Removing ".concat(e.roomName, " from claim queue - now owned"), {
subsystem: "Empire"
}), !1);
}), e.claimQueue.length < r && $r.info("Cleaned up claim queue: removed ".concat(r - e.claimQueue.length, " owned room(s)"), {
subsystem: "Empire"
});
}, t.prototype.updateExpansionQueue = function(e) {
var t, r, o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), n = new Set(o.map(function(e) {
return e.name;
})), a = Game.gcl.level, i = Object.values(Game.spawns);
if (i.length > 0 && i[0].owner) {
var s = i[0].owner.username;
try {
for (var c = p(o), u = c.next(); !u.done; u = c.next()) {
var l = u.value;
(f = e.knownRooms[l.name]) && f.owner !== s && (f.owner = s, $r.info("Updated room intel for ".concat(l.name, " - now owned by ").concat(s), {
subsystem: "Empire"
}));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
}
if (this.cleanupClaimQueue(e, n), !(o.length >= a || a < this.config.minGclForExpansion || e.objectives.expansionPaused)) {
var m = [];
for (var d in e.knownRooms) {
var f;
if (!(f = e.knownRooms[d]).owner && !f.reserver && f.scouted) {
var y = this.scoreExpansionCandidate(f, o);
y >= this.config.minExpansionScore && m.push({
roomName: f.name,
score: y,
distance: this.getMinDistanceToOwned(f.name, o),
claimed: !1,
lastEvaluated: Game.time
});
}
}
m.sort(function(e, t) {
return t.score - e.score;
}), e.claimQueue = m.slice(0, 10), m.length > 0 && Game.time % 100 == 0 && $r.info("Expansion queue updated: ".concat(m.length, " candidates, top score: ").concat(m[0].score), {
subsystem: "Empire"
});
}
}, t.prototype.scoreExpansionCandidate = function(e, t) {
var r = 0;
2 === e.sources ? r += 40 : 1 === e.sources && (r += 20), r += si(e.mineralType);
var o = this.getMinDistanceToOwned(e.name, t);
return o > this.config.maxExpansionDistance ? 0 : (r -= 5 * o, r -= ci(e.name), 
r -= 15 * e.threatLevel, r += ui(e.terrain), li(e.name) && (r += 10), r += mi(e.name), 
e.controllerLevel > 0 && !e.owner && (r += 2 * e.controllerLevel), r += pi(e.name, t, o), 
e.isHighway ? 0 : (e.isSK && (r -= 50), Math.max(0, r)));
}, t.prototype.getMinDistanceToOwned = function(e, t) {
var r, o, n = 1 / 0;
try {
for (var a = p(t), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Game.map.getRoomLinearDistance(e, s.name);
c < n && (n = c);
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
return n;
}, t.prototype.updatePowerBanks = function(e) {
var t;
e.powerBanks = e.powerBanks.filter(function(e) {
return e.decayTick > Game.time;
});
var r = function(r) {
var o, n, a = Game.rooms[r].find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_BANK;
}
}), i = function(o) {
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
}), $r.info("Power bank discovered in ".concat(r, ": ").concat(o.power, " power"), {
subsystem: "Empire"
}));
};
try {
for (var s = (o = void 0, p(a)), c = s.next(); !c.done; c = s.next()) i(c.value);
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
};
for (var o in Game.rooms) r(o);
}, t.prototype.updateWarTargets = function(e) {
if (e.warTargets = e.warTargets.filter(function(t) {
var r, o, n = e.knownRooms[t];
return !!n && n.owner !== (null !== (o = null === (r = Object.values(Game.spawns)[0]) || void 0 === r ? void 0 : r.owner.username) && void 0 !== o ? o : "");
}), e.objectives.warMode) for (var t in e.knownRooms) {
var r = e.knownRooms[t];
r.threatLevel >= 2 && !e.warTargets.includes(t) && (e.warTargets.push(t), $r.warn("Added war target: ".concat(t, " (threat level ").concat(r.threatLevel, ")"), {
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
$r.warn("War mode enabled due to active war targets", {
subsystem: "Empire"
})), 0 === e.warTargets.length && e.objectives.warMode && (e.objectives.warMode = !1, 
$r.info("War mode disabled - no active war targets", {
subsystem: "Empire"
}));
}, t.prototype.getNextExpansionTarget = function() {
var e = Cn.getEmpire().claimQueue.filter(function(e) {
return !e.claimed;
});
return e.length > 0 ? e[0] : null;
}, t.prototype.markExpansionClaimed = function(e) {
var t = Cn.getEmpire().claimQueue.find(function(t) {
return t.roomName === e;
});
t && (t.claimed = !0, $r.info("Marked expansion target as claimed: ".concat(e), {
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
t > 0 && Game.time % 500 == 0 && $r.info("Refreshed intel for ".concat(t, " rooms"), {
subsystem: "Empire"
});
}
}, t.prototype.discoverNearbyRooms = function(e) {
var t, r, o, n;
if (Game.time % this.config.roomDiscoveryInterval === 0) {
var a = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (0 !== a.length) {
var i = 0;
try {
for (var s = p(a), c = s.next(); !c.done; c = s.next()) {
var u = hi(c.value.name, this.config.maxRoomDiscoveryDistance);
try {
for (var l = (o = void 0, p(u)), m = l.next(); !m.done; m = l.next()) {
var d = m.value;
if (i >= this.config.maxRoomsToDiscoverPerTick) return void $r.debug("Reached discovery limit of ".concat(this.config.maxRoomsToDiscoverPerTick, " rooms per tick"), {
subsystem: "Empire"
});
e.knownRooms[d] || (e.knownRooms[d] = this.createStubIntel(d), i++);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
m && !m.done && (n = l.return) && n.call(l);
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
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
i > 0 && $r.info("Discovered ".concat(i, " nearby rooms for scouting"), {
subsystem: "Empire"
});
}
}
}, t.prototype.createStubIntel = function(e) {
var t = fi(e);
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
for (var t, r, o, n = e.find(FIND_SOURCES), a = e.find(FIND_MINERALS)[0], i = e.controller, s = 0, c = 0, u = new Room.Terrain(e.name), l = 0; l < 50; l++) for (var m = 0; m < 50; m++) {
var p = u.get(l, m);
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
t >= this.config.gclNotifyThreshold && Game.time % 500 == 0 && $r.info("GCL ".concat(Game.gcl.level, " progress: ").concat(t.toFixed(1), "% (").concat(Game.gcl.progress, "/").concat(Game.gcl.progressTotal, ")"), {
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
a < 5e4 ? e.objectives.expansionPaused || (e.objectives.expansionPaused = !0, $r.info("Expansion paused: insufficient energy reserves (".concat(a.toFixed(0), " < ").concat(5e4, ")"), {
subsystem: "Empire"
})) : e.objectives.expansionPaused && (e.objectives.expansionPaused = !1, $r.info("Expansion resumed: ".concat(o.length, " stable rooms with ").concat(a.toFixed(0), " avg energy"), {
subsystem: "Empire"
}));
} else e.objectives.expansionPaused || (e.objectives.expansionPaused = !0, $r.info("Expansion paused: waiting for stable room (RCL >= 4 with storage)", {
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
}), $r.info("Added nuke candidate: ".concat(t, " (score: ").concat(a, ")"), {
subsystem: "Empire"
}));
}, n = this;
try {
for (var a = p(e.warTargets), i = a.next(); !i.done; i = a.next()) o(i.value);
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
var e = Cn.getClusters(), t = Object.values(Game.rooms).filter(function(e) {
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
i < 3e4 && Game.time % 500 == 0 && $r.warn("Cluster ".concat(r, " has low energy: ").concat(i.toFixed(0), " avg (threshold: 30000)"), {
subsystem: "Empire"
}), c && Game.time % 500 == 0 && $r.warn("Cluster ".concat(r, " has high CPU usage: ").concat(s.toFixed(2), " per room"), {
subsystem: "Empire"
}), o.metrics || (o.metrics = {
energyIncome: 0,
energyConsumption: 0,
energyBalance: 0,
warIndex: 0,
economyIndex: 0
});
var u = Math.min(100, i / 1e5 * 100), l = n.length / o.memberRooms.length * 100;
o.metrics.economyIndex = Math.round((u + l) / 2), o.metrics.economyIndex < 40 && Game.time % 500 == 0 && $r.warn("Cluster ".concat(r, " economy index low: ").concat(o.metrics.economyIndex, " - consider rebalancing"), {
subsystem: "Empire"
});
};
for (var o in e) r(o);
}
}, t.prototype.assessPowerBankProfitability = function(e) {
var t, r, o, n, a, i;
if (Game.time % 100 == 0) {
var s = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (0 !== s.length) try {
for (var c = p(e.powerBanks), u = c.next(); !u.done; u = c.next()) {
var l = u.value;
if (!l.active) {
var m = 1 / 0, d = null;
try {
for (var f = (o = void 0, p(s)), y = f.next(); !y.done; y = f.next()) {
var h = y.value, g = Game.map.getRoomLinearDistance(h.name, l.roomName);
g < m && (m = g, d = h);
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
var v = l.decayTick - Game.time, R = 50 * m * 2 + l.power / 2, E = v > 1.5 * R && m <= 5 && l.power >= 1e3 && (null !== (i = null === (a = d.controller) || void 0 === a ? void 0 : a.level) && void 0 !== i ? i : 0) >= 7;
E || Game.time % 500 != 0 ? E && Game.time % 500 == 0 && $r.info("Profitable power bank in ".concat(l.roomName, ": ") + "power=".concat(l.power, ", distance=").concat(m, ", timeRemaining=").concat(v), {
subsystem: "Empire"
}) : $r.debug("Power bank in ".concat(l.roomName, " not profitable: ") + "power=".concat(l.power, ", distance=").concat(m, ", timeRemaining=").concat(v, ", ") + "requiredTime=".concat(R.toFixed(0)), {
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
u && !u.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
}
}, m([ qn("empire:manager", "Empire Manager", {
priority: yo.MEDIUM,
interval: 30,
minBucket: 0,
cpuBudget: .05
}) ], t.prototype, "run", null), m([ Xn() ], t);
}(), Si = new Ti, Ci = {
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
}, wi = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.cachedUsername = "", this.usernameLastTick = 0, 
this.config = l(l({}, Ci), e);
}
return e.prototype.run = function() {
var e = Cn.getEmpire();
this.lastRun = Game.time, this.monitorExpansionProgress(e), this.updateRemoteAssignments(e), 
this.isExpansionReady(e) && this.assignClaimerTargets(e), this.assignReserverTargets();
}, e.prototype.updateRemoteAssignments = function(e) {
var t, r, o, n, a, i, s, c = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var u = p(c), l = u.next(); !l.done; l = u.next()) {
var m = l.value, d = Cn.getSwarmState(m.name);
if (d && !((null !== (i = null === (a = m.controller) || void 0 === a ? void 0 : a.level) && void 0 !== i ? i : 0) < this.config.minRclForRemotes)) {
var f = null !== (s = d.remoteAssignments) && void 0 !== s ? s : [], y = this.validateRemoteAssignments(f, e, m.name), h = this.calculateRemoteCapacity(m, d);
if (y.length < h) {
var g = this.findRemoteCandidates(m.name, e, y), v = h - y.length, R = g.slice(0, v);
try {
for (var E = (o = void 0, p(R)), T = E.next(); !T.done; T = E.next()) {
var S = T.value;
y.includes(S) || (y.push(S), $r.info("Assigned remote room ".concat(S, " to ").concat(m.name), {
subsystem: "Expansion"
}));
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
JSON.stringify(y) !== JSON.stringify(d.remoteAssignments) && (d.remoteAssignments = y);
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = u.return) && r.call(u);
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
n.owner && ($r.info("Removing remote ".concat(e, " - now owned by ").concat(n.owner), {
subsystem: "Expansion"
}), a = "claimed");
var i = o.getMyUsername();
if (!a && n.reserver && n.reserver !== i && ($r.info("Removing remote ".concat(e, " - reserved by ").concat(n.reserver), {
subsystem: "Expansion"
}), a = "hostile"), !a && n.threatLevel >= 3 && ($r.info("Removing remote ".concat(e, " - threat level ").concat(n.threatLevel), {
subsystem: "Expansion"
}), a = "hostile"), !a) {
var s = Game.map.getRoomLinearDistance(r, e);
s > o.config.maxRemoteDistance && ($r.info("Removing remote ".concat(e, " - too far (").concat(s, ")"), {
subsystem: "Expansion"
}), a = "unreachable");
}
return !a || (_o.emit("remote.lost", {
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
var c = gi(a, e, i);
if (c.isProfitable) {
var u = this.scoreRemoteCandidate(i, s);
o.push({
roomName: a,
score: u
});
} else Game.time % 1e3 == 0 && $r.debug("Skipping remote ".concat(a, " - not profitable (ROI: ").concat(c.roi.toFixed(2), ")"), {
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
return 2 === e.sources ? o += 40 : 1 === e.sources && (o += 20), o += si(e.mineralType), 
o -= 5 * t, o -= ci(e.name), o -= 15 * e.threatLevel, o += ui(e.terrain), li(e.name) && (o += 10), 
o += mi(e.name), e.controllerLevel > 0 && !e.owner && (o += 2 * e.controllerLevel), 
o + pi(e.name, r, t);
}, e.prototype.isRemoteAssignedElsewhere = function(e, t) {
var r, o, n, a = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (c.name !== t) {
var u = Cn.getSwarmState(c.name);
if (null === (n = null == u ? void 0 : u.remoteAssignments) || void 0 === n ? void 0 : n.includes(e)) return !0;
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
}, e.prototype.assignClaimerTargets = function(e) {
var t, r, o = this.getNextExpansionTarget(e);
if (o) {
var n = Object.values(Game.creeps).some(function(e) {
var t = e.memory;
return "claimer" === t.role && t.targetRoom === o.roomName && "claim" === t.task;
});
if (!n) {
var a = !1;
try {
for (var i = p(Object.values(Game.creeps)), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = c.memory;
if ("claimer" === u.role && !u.targetRoom) {
u.targetRoom = o.roomName, u.task = "claim", $r.info("Assigned claim target ".concat(o.roomName, " to ").concat(c.name), {
subsystem: "Expansion"
}), o.claimed = !0, a = !0;
break;
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
a || this.requestClaimerSpawn(o.roomName, e);
}
}
}, e.prototype.requestClaimerSpawn = function(e, t) {
var r, o, n = this, a = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), i = a.filter(function(e) {
var t, r;
return (null !== (r = null === (t = e.controller) || void 0 === t ? void 0 : t.level) && void 0 !== r ? r : 0) >= n.config.minRclForClaiming;
});
if (0 !== i.length) {
var s = null, c = 999;
try {
for (var u = p(i), l = u.next(); !l.done; l = u.next()) {
var m = l.value, d = Game.map.getRoomLinearDistance(m.name, e);
d < c && (c = d, s = m);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
if (s) {
var f = Cn.getSwarmState(s.name);
f && "defensive" !== f.posture && "evacuate" !== f.posture && f.danger < 2 && "expand" !== f.posture && (f.posture = "expand", 
$r.info("Set ".concat(s.name, " to expand posture for claiming ").concat(e, " (distance: ").concat(c, ")"), {
subsystem: "Expansion"
}));
}
}
}, e.prototype.assignReserverTargets = function() {
var e, t, r, o, n;
try {
for (var a = p(Object.values(Game.creeps)), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.memory;
if ("claimer" === c.role && !c.targetRoom) {
var u = c.homeRoom;
if (u) {
var l = Cn.getSwarmState(u);
if (null === (n = null == l ? void 0 : l.remoteAssignments) || void 0 === n ? void 0 : n.length) try {
for (var m = (r = void 0, p(l.remoteAssignments)), d = m.next(); !d.done; d = m.next()) {
var f = d.value;
if (!this.hasReserverAssigned(f)) {
c.targetRoom = f, c.task = "reserve", $r.info("Assigned reserve target ".concat(f, " to ").concat(s.name), {
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
d && !d.done && (o = m.return) && o.call(m);
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
i && !i.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.hasReserverAssigned = function(e) {
var t, r;
try {
for (var o = p(Object.values(Game.creeps)), n = o.next(); !n.done; n = o.next()) {
var a = n.value.memory;
if ("claimer" === a.role && a.targetRoom === e && "reserve" === a.task) return !0;
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
}, e.prototype.isExpansionReady = function(e) {
var t = this;
if (e.objectives.expansionPaused) return !1;
var r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (r.length >= Game.gcl.level) return !1;
var o = Game.gcl.progress / Game.gcl.progressTotal;
if (o < this.config.minGclProgressForClaim) return Game.time % 500 == 0 && $r.info("Waiting for GCL progress: ".concat((100 * o).toFixed(1), "% (need ").concat((100 * this.config.minGclProgressForClaim).toFixed(0), "%)"), {
subsystem: "Expansion"
}), !1;
var n = r.filter(function(e) {
var r, o;
return (null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0) >= t.config.minRclForClaiming;
}), a = n.length / r.length;
return !(a < this.config.minStableRoomPercentage && (Game.time % 500 == 0 && $r.info("Waiting for room stability: ".concat(n.length, "/").concat(r.length, " rooms stable (").concat((100 * a).toFixed(0), "%, need ").concat((100 * this.config.minStableRoomPercentage).toFixed(0), "%)"), {
subsystem: "Expansion"
}), 1));
}, e.prototype.getNextExpansionTarget = function(e) {
var t = this, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (r.length >= Game.gcl.level) return null;
var o = e.claimQueue.filter(function(e) {
return !e.claimed;
});
if (0 === o.length) return null;
var n = o.map(function(e) {
var o = t.getMinDistanceToOwned(e.roomName, r), n = o <= t.config.clusterExpansionDistance ? 100 : 0;
return l(l({}, e), {
clusterScore: e.score + n,
distanceToCluster: o
});
});
if (n.sort(function(e, t) {
return t.clusterScore - e.clusterScore;
}), Game.time % 100 == 0 && n.length > 0) {
var a = n[0];
$r.info("Next expansion target: ".concat(a.roomName, " (score: ").concat(a.score, ", cluster bonus: ").concat(a.clusterScore - a.score, ", distance: ").concat(a.distanceToCluster, ")"), {
subsystem: "Expansion"
});
}
return n[0];
}, e.prototype.getMinDistanceToOwned = function(e, t) {
var r, o;
if (0 === t.length) return 999;
var n = 999;
try {
for (var a = p(t), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Game.map.getRoomLinearDistance(e, s.name);
c < n && (n = c);
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
return n;
}, e.prototype.getMyUsername = function() {
if (this.usernameLastTick !== Game.time || !this.cachedUsername) {
var e = Object.values(Game.spawns);
e.length > 0 && (this.cachedUsername = e[0].owner.username), this.usernameLastTick = Game.time;
}
return this.cachedUsername;
}, e.prototype.performSafetyAnalysis = function(e, t) {
var r, o, n = [], a = hi(e, 2);
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = t.knownRooms[c];
u && (u.owner && !yi(u.owner) && n.push("Hostile player ".concat(u.owner, " in ").concat(c)), 
u.towerCount && u.towerCount > 0 && n.push("".concat(u.towerCount, " towers in ").concat(c)), 
u.spawnCount && u.spawnCount > 0 && n.push("".concat(u.spawnCount, " spawns in ").concat(c)), 
u.threatLevel >= 2 && n.push("Threat level ".concat(u.threatLevel, " in ").concat(c)));
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
return function(e) {
var t, r, o = Cn.getEmpire(), n = di(e), a = new Set;
try {
for (var i = p(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = o.knownRooms[c];
(null == u ? void 0 : u.owner) && !yi(u.owner) && a.add(u.owner);
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
return a.size >= 2;
}(e) && n.push("Room is in potential war zone between hostile players"), {
isSafe: 0 === n.length,
threatDescription: n.length > 0 ? n.join("; ") : "No threats detected"
};
}, e.prototype.monitorExpansionProgress = function(e) {
var t, r, o, n = Game.time, a = function(t) {
if (!t.claimed) return "continue";
var r = n - t.lastEvaluated;
if (r > 5e3) {
var a = Game.rooms[t.roomName];
return (null === (o = null == a ? void 0 : a.controller) || void 0 === o ? void 0 : o.my) ? ($r.info("Expansion to ".concat(t.roomName, " completed successfully"), {
subsystem: "Expansion"
}), i.removeFromClaimQueue(e, t.roomName), "continue") : ($r.warn("Expansion to ".concat(t.roomName, " timed out after ").concat(r, " ticks"), {
subsystem: "Expansion"
}), i.cancelExpansion(e, t.roomName, "timeout"), "continue");
}
if (!Object.values(Game.creeps).some(function(e) {
var r = e.memory;
return "claimer" === r.role && r.targetRoom === t.roomName && "claim" === r.task;
}) && r > 1e3) return $r.warn("No active claimer for ".concat(t.roomName, " expansion"), {
subsystem: "Expansion"
}), i.cancelExpansion(e, t.roomName, "claimer_died"), "continue";
var s = e.knownRooms[t.roomName];
if ((null == s ? void 0 : s.owner) && s.owner !== i.getMyUsername()) return $r.warn("".concat(t.roomName, " claimed by ").concat(s.owner, " before we could claim it"), {
subsystem: "Expansion"
}), i.cancelExpansion(e, t.roomName, "hostile_claim"), "continue";
var c = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), u = c.reduce(function(e, t) {
var r, o;
return e + (null !== (o = null === (r = t.storage) || void 0 === r ? void 0 : r.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== o ? o : 0);
}, 0), l = c.length > 0 ? u / c.length : 0;
return l < 2e4 ? ($r.warn("Cancelling expansion to ".concat(t.roomName, " due to low energy (avg: ").concat(l, ")"), {
subsystem: "Expansion"
}), i.cancelExpansion(e, t.roomName, "low_energy"), "continue") : void 0;
}, i = this;
try {
for (var s = p(e.claimQueue), c = s.next(); !c.done; c = s.next()) a(c.value);
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
}, e.prototype.cancelExpansion = function(e, t, r) {
var o, n;
this.removeFromClaimQueue(e, t);
try {
for (var a = p(Object.values(Game.creeps)), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.memory;
"claimer" === c.role && c.targetRoom === t && "claim" === c.task && (c.targetRoom = void 0, 
c.task = void 0, $r.info("Cleared target for ".concat(s.name, " due to expansion cancellation"), {
subsystem: "Expansion"
}));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
i && !i.done && (n = a.return) && n.call(a);
} finally {
if (o) throw o.error;
}
}
$r.info("Cancelled expansion to ".concat(t, ", reason: ").concat(r), {
subsystem: "Expansion"
});
}, e.prototype.removeFromClaimQueue = function(e, t) {
var r = e.claimQueue.findIndex(function(e) {
return e.roomName === t;
});
-1 !== r && e.claimQueue.splice(r, 1);
}, e.prototype.addRemoteRoom = function(e, t) {
var r = Cn.getSwarmState(e);
return r ? (r.remoteAssignments || (r.remoteAssignments = []), r.remoteAssignments.includes(t) ? ($r.warn("Remote ".concat(t, " already assigned to ").concat(e), {
subsystem: "Expansion"
}), !1) : (r.remoteAssignments.push(t), $r.info("Manually added remote ".concat(t, " to ").concat(e), {
subsystem: "Expansion"
}), !0)) : ($r.error("Cannot add remote: ".concat(e, " not found"), {
subsystem: "Expansion"
}), !1);
}, e.prototype.removeRemoteRoom = function(e, t) {
var r = Cn.getSwarmState(e);
if (!(null == r ? void 0 : r.remoteAssignments)) return !1;
var o = r.remoteAssignments.indexOf(t);
return -1 !== o && (r.remoteAssignments.splice(o, 1), $r.info("Manually removed remote ".concat(t, " from ").concat(e), {
subsystem: "Expansion"
}), !0);
}, m([ Yn("expansion:manager", "Expansion Manager", {
priority: yo.LOW,
interval: 20,
minBucket: 0,
cpuBudget: .02
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), bi = new wi, xi = {
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
}, Oi = 1e7, _i = 5e6, Ai = ((vi = {})[STRUCTURE_SPAWN] = 15e3, vi[STRUCTURE_TOWER] = 5e3, 
vi[STRUCTURE_STORAGE] = 3e4, vi[STRUCTURE_TERMINAL] = 1e5, vi[STRUCTURE_LAB] = 5e4, 
vi[STRUCTURE_NUKER] = 1e5, vi[STRUCTURE_POWER_SPAWN] = 1e5, vi[STRUCTURE_OBSERVER] = 8e3, 
vi[STRUCTURE_EXTENSION] = 3e3, vi[STRUCTURE_LINK] = 5e3, vi), Ui = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.nukerReadyLogged = new Set, this.config = l(l({}, xi), e);
}
return e.prototype.run = function() {
this.lastRun = Game.time, this.initializeNukeTracking(), this.detectIncomingNukes(), 
this.processCounterNukeStrategies(), this.manageNukeResources(), this.loadNukers(), 
this.evaluateNukeCandidates(), this.updateNukeEconomics(), this.coordinateWithSieges(), 
this.coordinateNukeSalvos(), this.launchNukes(), this.cleanupNukeTracking();
}, e.prototype.loadNukers = function() {
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
(n > 0 || a > 0) && $r.debug("Nuker in ".concat(t, " needs ").concat(n, " energy, ").concat(a, " ghodium"), {
subsystem: "Nuke"
});
}
}
}
}, e.prototype.evaluateNukeCandidates = function() {
var e, t, r = Cn.getEmpire();
if (r.nukeCandidates = [], r.objectives.warMode) {
try {
for (var o = p(r.warTargets), n = o.next(); !n.done; n = o.next()) {
var a = n.value, i = this.scoreNukeCandidate(a);
i.score >= this.config.minScore && (r.nukeCandidates.push({
roomName: a,
score: i.score,
launched: !1,
launchTick: 0
}), $r.info("Nuke candidate: ".concat(a, " (score: ").concat(i.score, ") - ").concat(i.reasons.join(", ")), {
subsystem: "Nuke"
}));
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
r.nukeCandidates.sort(function(e, t) {
return t.score - e.score;
});
}
}, e.prototype.scoreNukeCandidate = function(e) {
var t = 0, r = [], o = Cn.getEmpire().knownRooms[e];
if (!o) return {
roomName: e,
score: 0,
reasons: [ "No intel" ]
};
o.controllerLevel && (t += 3 * o.controllerLevel, r.push("RCL ".concat(o.controllerLevel))), 
o.towerCount && (t += 5 * o.towerCount, r.push("".concat(o.towerCount, " towers"))), 
o.spawnCount && (t += 10 * o.spawnCount, r.push("".concat(o.spawnCount, " spawns"))), 
o.owner && "" !== o.owner && (t += 30, r.push("Owned room"));
var n = Cn.getSwarmState(e);
if (n) {
var a = Math.floor(n.pheromones.war / 10);
a > 0 && (t += a, r.push("War intensity: ".concat(n.pheromones.war)));
}
o.isHighway && (t += 10, r.push("Highway (strategic)")), o.threatLevel >= 2 && (t += 20, 
r.push("High threat"));
var i = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (i.length > 0) {
var s = Math.min.apply(Math, f([], d(i.map(function(t) {
return Game.map.getRoomLinearDistance(e, t.name);
})), !1));
t -= 2 * s, r.push("".concat(s, " rooms away"));
}
Cn.getEmpire().warTargets.includes(e) && (t += 15, r.push("War target"));
var c = new RoomPosition(25, 25, e), u = this.calculateNukeROI(e, c);
return u >= this.config.roiThreshold ? (t += Math.min(20, Math.floor(5 * u)), r.push("ROI: ".concat(u.toFixed(1), "x"))) : (t -= 20, 
r.push("Low ROI: ".concat(u.toFixed(1), "x"))), {
roomName: e,
score: t,
reasons: r
};
}, e.prototype.launchNukes = function() {
var e, t, r, o, n, a = Cn.getEmpire();
if (a.objectives.warMode) {
var i = [];
for (var s in Game.rooms) {
var c = Game.rooms[s];
(null === (n = c.controller) || void 0 === n ? void 0 : n.my) && (y = c.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_NUKER;
}
})[0]) && y.store.getUsedCapacity(RESOURCE_ENERGY) >= this.config.minEnergy && y.store.getUsedCapacity(RESOURCE_GHODIUM) >= this.config.minGhodium && i.push(y);
}
if (0 !== i.length) try {
for (var u = p(a.nukeCandidates), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
if (!m.launched) {
try {
for (var d = (r = void 0, p(i)), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
if (!(Game.map.getRoomLinearDistance(y.room.name, m.roomName) > 10)) {
var h = new RoomPosition(25, 25, m.roomName), g = this.predictNukeImpact(m.roomName, h), v = this.calculateNukeROI(m.roomName, h);
if (v < this.config.roiThreshold) $r.warn("Skipping nuke launch on ".concat(m.roomName, ": ROI ").concat(v.toFixed(2), "x below threshold ").concat(this.config.roiThreshold, "x"), {
subsystem: "Nuke"
}); else {
var R = y.launchNuke(h);
if (R === OK) {
m.launched = !0, m.launchTick = Game.time;
var E = {
id: "".concat(y.room.name, "-").concat(m.roomName, "-").concat(Game.time),
sourceRoom: y.room.name,
targetRoom: m.roomName,
targetPos: {
x: h.x,
y: h.y
},
launchTick: Game.time,
impactTick: Game.time + this.config.nukeFlightTime,
estimatedDamage: g.estimatedDamage,
estimatedValue: g.estimatedValue
};
a.nukesInFlight || (a.nukesInFlight = []), a.nukesInFlight.push(E), a.nukeEconomics || (a.nukeEconomics = {
nukesLaunched: 0,
totalEnergyCost: 0,
totalGhodiumCost: 0,
totalDamageDealt: 0,
totalValueDestroyed: 0
}), a.nukeEconomics.nukesLaunched++, a.nukeEconomics.totalEnergyCost += 3e5, a.nukeEconomics.totalGhodiumCost += 5e3, 
a.nukeEconomics.totalDamageDealt += g.estimatedDamage, a.nukeEconomics.totalValueDestroyed += g.estimatedValue, 
a.nukeEconomics.lastLaunchTick = Game.time, $r.warn("NUKE LAUNCHED from ".concat(y.room.name, " to ").concat(m.roomName, "! ") + "Impact in ".concat(this.config.nukeFlightTime, " ticks. ") + "Predicted damage: ".concat((g.estimatedDamage / 1e6).toFixed(1), "M hits, ") + "value: ".concat((g.estimatedValue / 1e3).toFixed(0), "k, ROI: ").concat(v.toFixed(2), "x"), {
subsystem: "Nuke"
});
var T = i.indexOf(y);
T > -1 && i.splice(T, 1);
break;
}
$r.error("Failed to launch nuke: ".concat(R), {
subsystem: "Nuke"
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
f && !f.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
if (0 === i.length) break;
}
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = u.return) && t.call(u);
} finally {
if (e) throw e.error;
}
}
}
}, e.prototype.detectIncomingNukes = function() {
var e, t = Cn.getEmpire();
t.incomingNukes || (t.incomingNukes = []);
var r = function(r) {
var n, a, i = Game.rooms[r];
if (!(null === (e = i.controller) || void 0 === e ? void 0 : e.my)) return "continue";
var s = Cn.getSwarmState(r);
if (!s) return "continue";
var c = i.find(FIND_NUKES);
if (c.length > 0) {
var u = function(e) {
"".concat(r, "-").concat(e.pos.x, "-").concat(e.pos.y, "-").concat(e.launchRoomName || "unknown");
var n = t.incomingNukes.find(function(t) {
return t.roomName === r && t.landingPos.x === e.pos.x && t.landingPos.y === e.pos.y;
});
if (n) n.timeToLand = e.timeToLand || 0; else {
var a = {
roomName: r,
landingPos: {
x: e.pos.x,
y: e.pos.y
},
impactTick: Game.time + (e.timeToLand || 0),
timeToLand: e.timeToLand || 0,
detectedAt: Game.time,
evacuationTriggered: !1,
sourceRoom: e.launchRoomName
}, c = o.identifyThreatenedStructures(i, e.pos);
a.threatenedStructures = c, t.incomingNukes.push(a), s.nukeDetected || (s.nukeDetected = !0, 
s.pheromones.defense = Math.min(100, s.pheromones.defense + 50), s.pheromones.siege = Math.min(100, s.pheromones.siege + 30), 
s.danger = 3, $r.warn("INCOMING NUKE DETECTED in ".concat(r, "! ") + "Landing at (".concat(e.pos.x, ", ").concat(e.pos.y, "), impact in ").concat(e.timeToLand, " ticks. ") + "Source: ".concat(e.launchRoomName || "unknown", ". ") + "Threatened structures: ".concat(c.length), {
subsystem: "Nuke"
}), s.eventLog.push({
type: "nuke_incoming",
time: Game.time,
details: "Impact in ".concat(e.timeToLand, " ticks at (").concat(e.pos.x, ",").concat(e.pos.y, ")")
}), s.eventLog.length > 20 && s.eventLog.shift()), c.some(function(e) {
return e.includes(STRUCTURE_SPAWN) || e.includes(STRUCTURE_STORAGE) || e.includes(STRUCTURE_TERMINAL);
}) && !a.evacuationTriggered && (o.triggerEvacuation(i, a), a.evacuationTriggered = !0);
}
};
try {
for (var l = (n = void 0, p(c)), m = l.next(); !m.done; m = l.next()) u(m.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
m && !m.done && (a = l.return) && a.call(l);
} finally {
if (n) throw n.error;
}
}
} else s.nukeDetected && (s.nukeDetected = !1, $r.info("Nuke threat cleared in ".concat(r), {
subsystem: "Nuke"
}));
}, o = this;
for (var n in Game.rooms) r(n);
}, e.prototype.identifyThreatenedStructures = function(e, t) {
var r, o, n = [], a = e.lookForAtArea(LOOK_STRUCTURES, Math.max(0, t.y - 2), Math.max(0, t.x - 2), Math.min(49, t.y + 2), Math.min(49, t.x + 2), !0);
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value.structure, u = Math.abs(c.pos.x - t.x), l = Math.abs(c.pos.y - t.y), m = Math.max(u, l);
if (m <= 2) {
var d = 0 === m ? Oi : _i;
c.hits <= d && n.push("".concat(c.structureType, "-").concat(c.pos.x, ",").concat(c.pos.y));
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
return n;
}, e.prototype.triggerEvacuation = function(e, t) {
var r = Cn.getSwarmState(e.name);
r && (t.timeToLand < 5e3 ? (r.posture = "evacuate", $r.warn("EVACUATION TRIGGERED for ".concat(e.name, ": Critical structures threatened by nuke!"), {
subsystem: "Nuke"
})) : ("war" !== r.posture && "evacuate" !== r.posture && (r.posture = "defensive"), 
$r.warn("NUKE DEFENSE PREPARATION in ".concat(e.name, ": Critical structures in blast radius"), {
subsystem: "Nuke"
})), r.pheromones.defense = 100);
}, e.prototype.manageNukeResources = function() {
var e, t;
if (Cn.getEmpire().objectives.warMode) for (var r in Game.rooms) {
var o = Game.rooms[r];
if (null === (e = o.controller) || void 0 === e ? void 0 : e.my) {
var n = o.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_NUKER;
}
})[0];
if (n) {
var a = o.terminal;
if (a && a.my) {
var i = n.store.getFreeCapacity(RESOURCE_ENERGY), s = n.store.getFreeCapacity(RESOURCE_GHODIUM);
if (s > 0) {
var c = null !== (t = a.store.getUsedCapacity(RESOURCE_GHODIUM)) && void 0 !== t ? t : 0;
c < s && this.requestResourceTransfer(r, RESOURCE_GHODIUM, s - c);
}
var u = "".concat(r, "-nuker");
0 === i && 0 === s ? this.nukerReadyLogged.has(u) || ($r.info("Nuker in ".concat(r, " is fully loaded and ready to launch"), {
subsystem: "Nuke"
}), this.nukerReadyLogged.add(u)) : this.nukerReadyLogged.delete(u);
}
}
}
}
}, e.prototype.requestResourceTransfer = function(e, t, r) {
var o = this.findDonorRoom(e, t, r);
o ? n.terminalManager.requestTransfer(o, e, t, r, this.config.terminalPriority) && $r.info("Requested ".concat(r, " ").concat(t, " transfer from ").concat(o, " to ").concat(e, " for nuker"), {
subsystem: "Nuke"
}) : $r.debug("No donor room found for ".concat(r, " ").concat(t, " to ").concat(e), {
subsystem: "Nuke"
});
}, e.prototype.findDonorRoom = function(e, t, r) {
var o, n, a, i, s = [];
for (var c in Game.rooms) {
var u = Game.rooms[c];
if ((null === (o = u.controller) || void 0 === o ? void 0 : o.my) && c !== e) {
var l = u.terminal;
if (l && l.my) {
var m = null !== (n = l.store.getUsedCapacity(t)) && void 0 !== n ? n : 0;
if (!(m < r + this.config.donorRoomBuffer)) {
var p = Game.map.getRoomLinearDistance(c, e);
s.push({
room: c,
amount: m,
distance: p
});
}
}
}
}
return 0 === s.length ? null : (s.sort(function(e, t) {
return e.distance - t.distance;
}), null !== (i = null === (a = s[0]) || void 0 === a ? void 0 : a.room) && void 0 !== i ? i : null);
}, e.prototype.coordinateWithSieges = function() {
var e, t, r, o, n, a, i, s = Cn.getEmpire();
if (s.objectives.warMode && s.nukesInFlight && 0 !== s.nukesInFlight.length) {
try {
for (var c = p(s.nukesInFlight), u = c.next(); !u.done; u = c.next()) {
var l = u.value, m = l.impactTick - Game.time;
l.siegeSquadId || m <= this.config.siegeCoordinationWindow && m > 0 && this.deploySiegeSquadForNuke(l) && $r.info("Siege squad deployment coordinated with nuke on ".concat(l.targetRoom, ", ") + "impact in ".concat(m, " ticks"), {
subsystem: "Nuke"
});
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
var d = Cn.getClusters();
try {
for (var f = p(Object.values(d)), y = f.next(); !y.done; y = f.next()) {
var h = y.value;
if (h.squads && 0 !== h.squads.length) {
var g = h.squads.filter(function(e) {
return "siege" === e.type;
}), v = function(e) {
if ("moving" !== e.state && "attacking" !== e.state) return "continue";
var t = e.targetRooms[0];
if (!t) return "continue";
var r = null === (i = s.nukesInFlight) || void 0 === i ? void 0 : i.find(function(e) {
return e.targetRoom === t;
});
r && !r.siegeSquadId && (r.siegeSquadId = e.id, $r.info("Linked siege squad ".concat(e.id, " with nuke on ").concat(t), {
subsystem: "Nuke"
}));
};
try {
for (var R = (n = void 0, p(g)), E = R.next(); !E.done; E = R.next()) v(E.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
E && !E.done && (a = R.return) && a.call(R);
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
}
}, e.prototype.deploySiegeSquadForNuke = function(e) {
var t, r, o, n = Cn.getClusters(), a = null;
try {
for (var i = p(Object.values(n)), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Game.map.getRoomLinearDistance(c.coreRoom, e.targetRoom);
(!a || u < a.distance) && (a = {
id: c.id,
distance: u
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
if (!a) return $r.warn("Cannot deploy siege squad for nuke on ".concat(e.targetRoom, ": No clusters available"), {
subsystem: "Nuke"
}), !1;
var l = n[a.id];
if (!l) return !1;
var m = null === (o = l.squads) || void 0 === o ? void 0 : o.find(function(t) {
return "siege" === t.type && t.targetRooms.includes(e.targetRoom);
});
if (m) return e.siegeSquadId = m.id, !0;
var d = Cn.getSwarmState(e.targetRoom);
d && (d.pheromones.siege = Math.min(100, d.pheromones.siege + 80), d.pheromones.war = Math.min(100, d.pheromones.war + 60), 
$r.info("Siege pheromones increased for ".concat(e.targetRoom, " to coordinate with nuke strike"), {
subsystem: "Nuke"
}));
var f = "siege-nuke-".concat(e.targetRoom, "-").concat(Game.time), y = {
id: f,
type: "siege",
members: [],
rallyRoom: l.coreRoom,
targetRooms: [ e.targetRoom ],
state: "gathering",
createdAt: Game.time,
retreatThreshold: .3
};
return l.squads || (l.squads = []), l.squads.push(y), e.siegeSquadId = f, $r.warn("SIEGE SQUAD DEPLOYED: Squad ".concat(f, " will coordinate with nuke on ").concat(e.targetRoom), {
subsystem: "Nuke"
}), !0;
}, e.prototype.estimateSquadEta = function(e, t) {
var r = e.members.map(function(e) {
return Game.creeps[e];
}).filter(function(e) {
return null != e;
});
if (0 === r.length) return 50 * Game.map.getRoomLinearDistance(e.rallyRoom, t);
var o = r.map(function(e) {
return 50 * Game.map.getRoomLinearDistance(e.room.name, t);
});
return Math.min.apply(Math, f([], d(o), !1));
}, e.prototype.initializeNukeTracking = function() {
var e = Cn.getEmpire();
e.nukesInFlight || (e.nukesInFlight = []), e.incomingNukes || (e.incomingNukes = []), 
e.nukeEconomics || (e.nukeEconomics = {
nukesLaunched: 0,
totalEnergyCost: 0,
totalGhodiumCost: 0,
totalDamageDealt: 0,
totalValueDestroyed: 0
});
}, e.prototype.coordinateNukeSalvos = function() {
var e, t, r, o, n, a, i = Cn.getEmpire();
if (i.nukesInFlight && 0 !== i.nukesInFlight.length) {
var s = new Map;
try {
for (var c = p(i.nukesInFlight), u = c.next(); !u.done; u = c.next()) {
var l = u.value, m = s.get(l.targetRoom) || [];
m.push(l), s.set(l.targetRoom, m);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
try {
for (var y = p(s.entries()), h = y.next(); !h.done; h = y.next()) {
var g = d(h.value, 2), v = g[0], R = g[1];
if (!(R.length < 2)) {
var E = R.map(function(e) {
return e.impactTick;
}), T = Math.min.apply(Math, f([], d(E), !1)), S = Math.max.apply(Math, f([], d(E), !1)) - T;
if (S <= this.config.salvoSyncWindow) {
var C = R[0].salvoId || "salvo-".concat(v, "-").concat(T);
try {
for (var w = (n = void 0, p(R)), b = w.next(); !b.done; b = w.next()) (l = b.value).salvoId = C;
} catch (e) {
n = {
error: e
};
} finally {
try {
b && !b.done && (a = w.return) && a.call(w);
} finally {
if (n) throw n.error;
}
}
$r.info("Nuke salvo ".concat(C, " coordinated: ").concat(R.length, " nukes on ").concat(v, ", impact spread: ").concat(S, " ticks"), {
subsystem: "Nuke"
});
} else $r.warn("Nukes on ".concat(v, " not synchronized (spread: ").concat(S, " ticks > ").concat(this.config.salvoSyncWindow, ")"), {
subsystem: "Nuke"
});
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
h && !h.done && (o = y.return) && o.call(y);
} finally {
if (r) throw r.error;
}
}
}
}, e.prototype.predictNukeImpact = function(e, t) {
var r, o, n = {
estimatedDamage: 0,
estimatedValue: 0,
threatenedStructures: []
}, a = Game.rooms[e];
if (!a) {
var i = Cn.getEmpire().knownRooms[e];
if (i) {
var s = 5 * (i.towerCount || 0) + 10 * (i.spawnCount || 0) + 5;
n.estimatedDamage = Oi + _i * s, n.estimatedValue = .01 * n.estimatedDamage;
}
return n;
}
var c = a.lookForAtArea(LOOK_STRUCTURES, Math.max(0, t.y - 2), Math.max(0, t.x - 2), Math.min(49, t.y + 2), Math.min(49, t.x + 2), !0);
try {
for (var u = p(c), l = u.next(); !l.done; l = u.next()) {
var m = l.value.structure, d = Math.abs(m.pos.x - t.x), f = Math.abs(m.pos.y - t.y), y = 0 === Math.max(d, f) ? Oi : _i;
m.hits <= y ? (n.estimatedDamage += m.hits, n.threatenedStructures.push("".concat(m.structureType, "-").concat(m.pos.x, ",").concat(m.pos.y)), 
n.estimatedValue += this.estimateStructureValue(m)) : n.estimatedDamage += y;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
return n;
}, e.prototype.estimateStructureValue = function(e) {
return Ai[e.structureType] || 1e3;
}, e.prototype.processCounterNukeStrategies = function() {
var e, t, r, o = Cn.getEmpire();
if (o.incomingNukes && 0 !== o.incomingNukes.length) try {
for (var n = p(o.incomingNukes), a = n.next(); !a.done; a = n.next()) {
var i = a.value;
if (i.sourceRoom && !o.warTargets.includes(i.sourceRoom)) {
var s = o.knownRooms[i.sourceRoom];
if (s && !(s.controllerLevel < 8)) {
var c = Cn.getSwarmState(i.roomName);
if (c && !(c.pheromones.war < this.config.counterNukeWarThreshold)) if (this.canAffordNuke()) {
if (!o.warTargets.includes(i.sourceRoom)) for (var u in o.warTargets.push(i.sourceRoom), 
$r.warn("COUNTER-NUKE AUTHORIZED: ".concat(i.sourceRoom, " added to war targets for nuke retaliation"), {
subsystem: "Nuke"
}), Game.rooms) if (null === (r = Game.rooms[u].controller) || void 0 === r ? void 0 : r.my) {
var l = Cn.getSwarmState(u);
l && (l.pheromones.war = Math.min(100, l.pheromones.war + 30));
}
} else $r.warn("Counter-nuke desired against ".concat(i.sourceRoom, " but insufficient resources"), {
subsystem: "Nuke"
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
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.canAffordNuke = function() {
var e, t = 0, r = 0;
for (var o in Game.rooms) {
var n = Game.rooms[o];
(null === (e = n.controller) || void 0 === e ? void 0 : e.my) && (n.storage && (t += n.storage.store.getUsedCapacity(RESOURCE_ENERGY) || 0), 
n.terminal && (t += n.terminal.store.getUsedCapacity(RESOURCE_ENERGY) || 0, r += n.terminal.store.getUsedCapacity(RESOURCE_GHODIUM) || 0));
}
return t >= 6e5 && r >= 1e4;
}, e.prototype.updateNukeEconomics = function() {
var e, t = Cn.getEmpire();
if (t.nukeEconomics) {
var r = t.nukeEconomics, o = r.totalEnergyCost + r.totalGhodiumCost;
if (o > 0) {
var n = r.totalValueDestroyed;
r.lastROI = n / o, r.nukesLaunched > 0 && r.nukesLaunched % 5 == 0 && $r.info("Nuke economics: ".concat(r.nukesLaunched, " nukes, ROI: ").concat(null === (e = r.lastROI) || void 0 === e ? void 0 : e.toFixed(2), "x, ") + "Value destroyed: ".concat((r.totalValueDestroyed / 1e3).toFixed(0), "k"), {
subsystem: "Nuke"
});
}
}
}, e.prototype.cleanupNukeTracking = function() {
var e = Cn.getEmpire();
if (e.nukesInFlight && (e.nukesInFlight = e.nukesInFlight.filter(function(e) {
return e.impactTick > Game.time;
})), e.incomingNukes) {
var t = e.incomingNukes.length;
e.incomingNukes = e.incomingNukes.filter(function(e) {
return e.impactTick > Game.time;
});
var r = t - e.incomingNukes.length;
r > 0 && $r.info("Cleaned up ".concat(r, " impacted nuke alert(s)"), {
subsystem: "Nuke"
});
}
}, e.prototype.calculateNukeROI = function(e, t) {
var r = this.predictNukeImpact(e, t);
return 0 === r.estimatedValue ? 0 : r.estimatedValue / 305e3;
}, m([ qn("empire:nuke", "Nuke Manager", {
priority: yo.LOW,
interval: 500,
minBucket: 0,
cpuBudget: .01
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), Ni = new Ui, Mi = {
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
criticalResourceThresholds: (Ri = {}, Ri[RESOURCE_GHODIUM] = 5e3, Ri),
enabled: !0
}, ki = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = l(l({}, Mi), e);
}
return e.prototype.run = function() {
this.config.enabled && (this.lastRun = Game.time, this.ensurePixelBuyingMemory(), 
this.isPurchaseCooldownComplete() && (this.hasSurplusResources() ? this.hasEnoughCredits() ? (this.attemptPixelPurchase(), 
this.updateMemory()) : $r.debug("Pixel buying skipped: insufficient credits", {
subsystem: "PixelBuying"
}) : $r.debug("Pixel buying skipped: no resource surplus", {
subsystem: "PixelBuying"
})));
}, e.prototype.ensurePixelBuyingMemory = function() {
var e = Cn.getEmpire();
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
var e = Cn.getEmpire();
if (e.market) return e.market.pixelBuying;
}, e.prototype.isPurchaseCooldownComplete = function() {
var e = this.getPixelBuyingMemory();
return !e || Game.time - e.lastPurchaseTick >= this.config.purchaseCooldown;
}, e.prototype.hasSurplusResources = function() {
var e, t, r, o, n, a, i = this.calculateTotalResources(), s = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}).length, c = s * this.config.energyThresholdPerRoom;
if (i.energy < c + this.config.minEnergySurplus) return $r.debug("Pixel buying: energy below surplus (".concat(i.energy, " < ").concat(c + this.config.minEnergySurplus, ")"), {
subsystem: "PixelBuying"
}), !1;
try {
for (var u = p(Object.entries(this.config.criticalResourceThresholds)), l = u.next(); !l.done; l = u.next()) {
var m = d(l.value, 2), f = m[0], y = m[1];
if ((R = null !== (n = i[f]) && void 0 !== n ? n : 0) < y) return $r.debug("Pixel buying: ".concat(f, " below threshold (").concat(R, " < ").concat(y, ")"), {
subsystem: "PixelBuying"
}), !1;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = u.return) && t.call(u);
} finally {
if (e) throw e.error;
}
}
var h = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
try {
for (var g = p(h), v = g.next(); !v.done; v = g.next()) {
var R, E = v.value;
if ((R = null !== (a = i[E]) && void 0 !== a ? a : 0) < this.config.minBaseMineralReserve) return $r.debug("Pixel buying: ".concat(E, " below reserve (").concat(R, " < ").concat(this.config.minBaseMineralReserve, ")"), {
subsystem: "PixelBuying"
}), !1;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
v && !v.done && (o = g.return) && o.call(g);
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
if (s.terminal) for (var c in s.terminal.store) a[u = c] = (null !== (t = a[u]) && void 0 !== t ? t : 0) + (null !== (r = s.terminal.store[u]) && void 0 !== r ? r : 0);
if (s.storage) for (var c in s.storage.store) {
var u;
a[u = c] = (null !== (o = a[u]) && void 0 !== o ? o : 0) + (null !== (n = s.storage.store[u]) && void 0 !== n ? n : 0);
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
if (c <= 0) $r.debug("Cannot afford any pixels after reserve", {
subsystem: "PixelBuying"
}); else {
var u = o.roomName ? Game.market.calcTransactionCost(c, a.name, o.roomName) : 0;
if (a.terminal.store[RESOURCE_ENERGY] < u) $r.debug("Not enough energy for pixel transaction (need ".concat(u, ")"), {
subsystem: "PixelBuying"
}); else {
var l = Game.market.deal(o.id, c, a.name);
if (l === OK) {
var m = c * o.price;
this.recordPurchase({
tick: Game.time,
amount: c,
pricePerUnit: o.price,
totalCost: m,
orderId: o.id,
fromRoom: a.name
}), $r.info("Purchased ".concat(c, " pixels at ").concat(o.price.toFixed(2), " credits each ") + "(total: ".concat(m.toFixed(0), " credits)").concat(n ? " (GOOD PRICE!)" : ""), {
subsystem: "PixelBuying"
});
} else $r.warn("Failed to purchase pixels: error code ".concat(l), {
subsystem: "PixelBuying"
});
}
}
} else $r.debug("No terminal available for pixel purchase", {
subsystem: "PixelBuying"
});
} else $r.debug("Pixel price (".concat(o.price, ") above target (").concat(this.config.targetPixelPrice, "), waiting"), {
subsystem: "PixelBuying"
});
} else $r.debug("No pixel orders below max price (".concat(this.config.maxPixelPrice, ")"), {
subsystem: "PixelBuying"
});
} else $r.debug("No pixel sell orders available", {
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
this.config = l(l({}, this.config), e);
}, e.prototype.getConfig = function() {
return l({}, this.config);
}, e.prototype.enable = function() {
this.config.enabled = !0, $r.info("Pixel buying enabled", {
subsystem: "PixelBuying"
});
}, e.prototype.disable = function() {
this.config.enabled = !1, $r.info("Pixel buying disabled", {
subsystem: "PixelBuying"
});
}, m([ qn("empire:pixelBuying", "Pixel Buying Manager", {
priority: yo.IDLE,
interval: 200,
minBucket: 0,
cpuBudget: .01
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), Pi = new ki, Ii = {
enabled: !0,
fullBucketTicksRequired: 25,
bucketMax: 1e4,
cpuCostPerPixel: 1e4,
minBucketAfterGeneration: 0
}, Gi = function() {
function e(e) {
void 0 === e && (e = {}), this.config = l(l({}, Ii), e);
}
return e.prototype.run = function() {
if (this.config.enabled) {
this.ensurePixelGenerationMemory();
var e = this.getPixelGenerationMemory();
e && (Game.cpu.bucket >= this.config.bucketMax ? (0 === e.consecutiveFullTicks && (e.bucketFullSince = Game.time), 
e.consecutiveFullTicks++) : (e.consecutiveFullTicks = 0, e.bucketFullSince = 0), 
this.shouldGeneratePixel(e) && this.generatePixel(e));
}
}, e.prototype.ensurePixelGenerationMemory = function() {
var e = global;
e._pixelGenerationMemory || (e._pixelGenerationMemory = {
bucketFullSince: 0,
consecutiveFullTicks: 0,
totalPixelsGenerated: 0,
lastGenerationTick: 0
});
}, e.prototype.getPixelGenerationMemory = function() {
return global._pixelGenerationMemory;
}, e.prototype.shouldGeneratePixel = function(e) {
return !(e.consecutiveFullTicks < this.config.fullBucketTicksRequired || Game.cpu.bucket < this.config.bucketMax || Game.cpu.bucket < this.config.cpuCostPerPixel);
}, e.prototype.generatePixel = function(e) {
var t = Game.cpu.generatePixel();
if (t === OK) {
e.totalPixelsGenerated++, e.lastGenerationTick = Game.time;
var r = e.bucketFullSince > 0 ? Game.time - e.bucketFullSince : e.consecutiveFullTicks;
e.consecutiveFullTicks = 0, e.bucketFullSince = 0, $r.info("Generated pixel from CPU bucket (total generated: ".concat(e.totalPixelsGenerated, ")"), {
subsystem: "PixelGeneration",
meta: {
bucket: Game.cpu.bucket,
ticksWaited: r
}
});
} else $r.warn("Failed to generate pixel: error code ".concat(t), {
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
this.config.enabled = !0, $r.info("Pixel generation enabled", {
subsystem: "PixelGeneration"
});
}, e.prototype.disable = function() {
this.config.enabled = !1, $r.info("Pixel generation disabled", {
subsystem: "PixelGeneration"
});
}, e.prototype.updateConfig = function(e) {
this.config = l(l({}, this.config), e);
}, e.prototype.getConfig = function() {
return l({}, this.config);
}, m([ qn("empire:pixelGeneration", "Pixel Generation Manager", {
priority: yo.IDLE,
interval: 1,
minBucket: 0,
cpuBudget: .01
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), Li = new Gi, Di = {
minPower: 1e3,
maxDistance: 5,
minTicksRemaining: 3e3,
healerRatio: .5,
minBucket: 0,
maxConcurrentOps: 2
}, Fi = function() {
function e(e) {
void 0 === e && (e = {}), this.operations = new Map, this.lastScan = 0, this.config = l(l({}, Di), e);
}
return e.prototype.run = function() {
Game.time - this.lastScan >= 50 && (this.scanForPowerBanks(), this.lastScan = Game.time), 
this.updateOperations(), this.evaluateOpportunities(), Game.time % 100 == 0 && this.operations.size > 0 && this.logStatus();
}, e.prototype.scanForPowerBanks = function() {
var e, t, r = Cn.getEmpire(), o = function(o) {
var a, i, s = Game.rooms[o], c = o.match(/^[WE](\d+)[NS](\d+)$/);
if (!c) return "continue";
var u = parseInt(c[1], 10), l = parseInt(c[2], 10);
if (u % 10 != 0 && l % 10 != 0) return "continue";
var m = s.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_BANK;
}
}), d = function(a) {
var i = r.powerBanks.find(function(e) {
return e.roomName === o && e.pos.x === a.pos.x && e.pos.y === a.pos.y;
});
if (i) i.power = a.power, i.decayTick = Game.time + (null !== (t = a.ticksToDecay) && void 0 !== t ? t : 5e3); else {
var s = {
roomName: o,
pos: {
x: a.pos.x,
y: a.pos.y
},
power: a.power,
decayTick: Game.time + (null !== (e = a.ticksToDecay) && void 0 !== e ? e : 5e3),
active: !1
};
r.powerBanks.push(s), a.power >= n.config.minPower && $r.info("Power bank discovered in ".concat(o, ": ").concat(a.power, " power"), {
subsystem: "PowerBank"
});
}
};
try {
for (var f = (a = void 0, p(m)), y = f.next(); !y.done; y = f.next()) d(y.value);
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
}, n = this;
for (var a in Game.rooms) o(a);
r.powerBanks = r.powerBanks.filter(function(e) {
return e.decayTick > Game.time;
});
}, e.prototype.updateOperations = function() {
var e, t;
try {
for (var r = p(this.operations), o = r.next(); !o.done; o = r.next()) {
var n = d(o.value, 2), a = n[0], i = n[1];
switch (i.state) {
case "scouting":
this.updateScoutingOp(i);
break;

case "attacking":
this.updateAttackingOp(i);
break;

case "collecting":
this.updateCollectingOp(i);
break;

case "complete":
case "failed":
Game.time - i.startedAt > 1e4 && this.operations.delete(a);
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
if (!o) return e.state = "failed", void $r.warn("Power bank in ".concat(e.roomName, " disappeared"), {
subsystem: "PowerBank"
});
e.power = o.power, e.decayTick = Game.time + (null !== (t = o.ticksToDecay) && void 0 !== t ? t : 0), 
e.assignedCreeps.attackers.length > 0 && (e.state = "attacking", $r.info("Starting attack on power bank in ".concat(e.roomName), {
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
if (!o) return e.state = "collecting", void $r.info("Power bank destroyed in ".concat(e.roomName, ", collecting power"), {
subsystem: "PowerBank"
});
var n = null !== (t = e.lastHits) && void 0 !== t ? t : 2e6;
e.lastHits = o.hits, n > o.hits && (e.damageDealt += n - o.hits);
var a = e.decayTick - Game.time, i = e.damageDealt / Math.max(1, Game.time - e.startedAt), s = o.hits / Math.max(1, i);
s > .9 * a && $r.warn("Power bank in ".concat(e.roomName, " may decay before completion (").concat(Math.round(s), " > ").concat(a, ")"), {
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
0 === r.length && 0 === o.length && (e.state = "complete", $r.info("Power bank operation complete in ".concat(e.roomName, ": ").concat(e.powerCollected, " power collected"), {
subsystem: "PowerBank"
}));
} else 0 === e.assignedCreeps.carriers.length && (e.state = "failed");
}, e.prototype.evaluateOpportunities = function() {
var e, t, r = this;
if (!(Array.from(this.operations.values()).filter(function(e) {
return "complete" !== e.state && "failed" !== e.state;
}).length >= this.config.maxConcurrentOps)) {
var o = Cn.getEmpire(), n = Object.values(Game.rooms).filter(function(e) {
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
var r, o, n = 1 / 0;
try {
for (var a = p(t), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Game.map.getRoomLinearDistance(e, s.name);
c < n && (n = c);
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
return n;
}, e.prototype.startOperation = function(e, t) {
var r, o, n = null, a = 1 / 0;
try {
for (var i = p(t), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Game.map.getRoomLinearDistance(e.roomName, c.name);
u < a && (a = u, n = c);
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
if (n) {
var l = {
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
this.operations.set(e.roomName, l), e.active = !0, $r.info("Started power bank operation in ".concat(e.roomName, " (").concat(e.power, " power, home: ").concat(n.name, ")"), {
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
var t, r, o = 0, n = 0, a = 0;
try {
for (var i = p(this.operations), s = i.next(); !s.done; s = i.next()) {
var c = d(s.value, 2), u = (c[0], c[1]);
if (u.homeRoom === e && "complete" !== u.state && "failed" !== u.state) {
var l = this.getRequiredCreeps(u), m = {
attackers: u.assignedCreeps.attackers.filter(function(e) {
return Game.creeps[e];
}).length,
healers: u.assignedCreeps.healers.filter(function(e) {
return Game.creeps[e];
}).length,
carriers: u.assignedCreeps.carriers.filter(function(e) {
return Game.creeps[e];
}).length
};
"attacking" !== u.state && "scouting" !== u.state || (o += Math.max(0, l.attackers - m.attackers), 
n += Math.max(0, l.healers - m.healers)), "collecting" !== u.state && "attacking" !== u.state || (a += Math.max(0, l.carriers - m.carriers));
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
return {
powerHarvesters: o,
healers: n,
powerCarriers: a
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
for (var o = p(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
$r.info("Power bank op ".concat(a.roomName, ": ").concat(a.state, ", ") + "".concat(a.assignedCreeps.attackers.length, "A/").concat(a.assignedCreeps.healers.length, "H/").concat(a.assignedCreeps.carriers.length, "C, ") + "".concat(Math.round(a.damageDealt / 1e3), "k damage, ").concat(a.powerCollected, " collected"), {
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
}, m([ qn("empire:powerBank", "Power Bank Harvesting", {
priority: yo.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .02
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), Bi = new Fi, Wi = {
minGPL: 1,
minPowerReserve: 1e4,
energyPerPower: 50,
minEnergyReserve: 1e5,
gplMilestones: [ 1, 2, 5, 10, 15, 20 ]
}, Vi = [ PWR_GENERATE_OPS, PWR_OPERATE_SPAWN, PWR_OPERATE_EXTENSION, PWR_OPERATE_TOWER, PWR_OPERATE_LAB, PWR_OPERATE_STORAGE, PWR_REGEN_SOURCE, PWR_OPERATE_FACTORY ], Ki = [ PWR_GENERATE_OPS, PWR_OPERATE_SPAWN, PWR_SHIELD, PWR_DISRUPT_SPAWN, PWR_DISRUPT_TOWER, PWR_FORTIFY, PWR_OPERATE_TOWER, PWR_DISRUPT_TERMINAL ], Hi = function() {
function e(e) {
void 0 === e && (e = {}), this.assignments = new Map, this.gplState = null, this.lastGPLUpdate = 0, 
this.config = l(l({}, Wi), e);
}
return e.prototype.run = function() {
this.updateGPLState(), this.managePowerProcessing(), this.manageAssignments(), this.checkPowerUpgrades(), 
this.checkRespawnNeeds(), Game.time % 100 == 0 && this.logStatus();
}, e.prototype.updateGPLState = function() {
var e, t, r, o, n;
if (Game.gpl) {
var a = Game.gpl.level, i = Game.gpl.progress, s = Game.gpl.progressTotal, c = 0;
this.gplState && this.gplState.currentProgress < i && (c = i - this.gplState.currentProgress);
var u = s - i, l = null !== (t = null === (e = this.gplState) || void 0 === e ? void 0 : e.powerProcessedThisTick) && void 0 !== t ? t : 1, m = l > 0 ? Math.ceil(u / l) : 1 / 0, p = null !== (r = this.config.gplMilestones.find(function(e) {
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
}, this.lastGPLUpdate !== a && a > 0 && ($r.info("GPL milestone reached: Level ".concat(a), {
subsystem: "PowerCreep"
}), this.lastGPLUpdate = a);
} else this.gplState = null;
}, e.prototype.managePowerProcessing = function() {
var e, t, r = this.evaluatePowerProcessing();
try {
for (var o = p(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (a.shouldProcess) {
var i = Game.rooms[a.roomName];
if (i) {
var s = i.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0];
if (s) {
var c = s.store.getUsedCapacity(RESOURCE_POWER) > 0, u = s.store.getUsedCapacity(RESOURCE_ENERGY) >= 50;
c && u && s.processPower() === OK && $r.debug("Processing power in ".concat(a.roomName, ": ").concat(a.reason), {
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
}, e.prototype.evaluatePowerProcessing = function() {
var e, t, r, o, n, a = [], i = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
}).length > 0;
});
try {
for (var s = p(i), c = s.next(); !c.done; c = s.next()) {
var u = c.value, l = u.storage, m = u.terminal;
if (l || m) {
var d = (null !== (r = null == l ? void 0 : l.store.getUsedCapacity(RESOURCE_POWER)) && void 0 !== r ? r : 0) + (null !== (o = null == m ? void 0 : m.store.getUsedCapacity(RESOURCE_POWER)) && void 0 !== o ? o : 0), f = null !== (n = null == l ? void 0 : l.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== n ? n : 0, y = !1, h = "", g = 0;
d < 100 ? (y = !1, h = "Insufficient power (<100)") : f < this.config.minEnergyReserve ? (y = !1, 
h = "Insufficient energy (<".concat(this.config.minEnergyReserve, ")")) : this.gplState && this.gplState.currentLevel < this.gplState.targetMilestone ? (y = !0, 
h = "GPL progression: ".concat(this.gplState.currentLevel, " → ").concat(this.gplState.targetMilestone), 
g = 100 - Math.abs(this.gplState.currentLevel - this.gplState.targetMilestone)) : d > this.config.minPowerReserve ? (y = !0, 
h = "Excess power (".concat(d, " > ").concat(this.config.minPowerReserve, ")"), 
g = 50) : (y = !1, h = "Power reserved for power banks"), a.push({
roomName: u.name,
shouldProcess: y,
reason: h,
powerAvailable: d,
energyAvailable: f,
priority: g
});
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
return a.sort(function(e, t) {
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
swarm: Cn.getSwarmState(e.name)
};
}).filter(function(e) {
return null !== e.swarm;
}).sort(function(e, t) {
var r = 100 * e.swarm.danger + e.swarm.metrics.hostileCount;
return 100 * t.swarm.danger + t.swarm.metrics.hostileCount - r;
})[0];
s && (a = s.room.name);
}
var c = this.generatePowerPath(o), u = {
name: e.name,
className: e.className,
role: o,
assignedRoom: a,
level: e.level,
spawned: void 0 !== e.ticksToLive,
lastRespawnTick: void 0 !== e.ticksToLive ? Game.time : void 0,
priority: "powerQueen" === o ? 100 : 80,
powerPath: c
}, l = e.memory;
return l.homeRoom = a, l.role = o, $r.info("Power creep ".concat(e.name, " assigned as ").concat(o, " to ").concat(a), {
subsystem: "PowerCreep"
}), u;
}, e.prototype.generatePowerPath = function(e) {
var t = this, r = ("powerQueen" === e ? Vi : Ki).filter(function(e) {
var r, o, n = POWER_INFO[e];
return n && void 0 !== n.level && n.level[0] <= (null !== (o = null === (r = t.gplState) || void 0 === r ? void 0 : r.currentLevel) && void 0 !== o ? o : 0);
});
return r;
}, e.prototype.checkPowerUpgrades = function() {
var e, t;
if (this.gplState) try {
for (var r = p(this.assignments), o = r.next(); !o.done; o = r.next()) {
var n = d(o.value, 2), a = n[0], i = n[1], s = Game.powerCreeps[a];
if (s && !(s.level >= this.gplState.currentLevel)) {
var c = this.selectNextPower(s, i);
if (c) {
var u = s.upgrade(c);
u === OK ? ($r.info("Upgraded ".concat(s.name, " to level ").concat(s.level + 1, " with ").concat(c), {
subsystem: "PowerCreep"
}), i.level = s.level) : u !== ERR_NOT_ENOUGH_RESOURCES && $r.warn("Failed to upgrade ".concat(s.name, ": ").concat(u), {
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
var r, o, n, a, i, s = null !== (n = t.powerPath) && void 0 !== n ? n : this.generatePowerPath(t.role);
try {
for (var c = p(s), u = c.next(); !u.done; u = c.next()) {
var l = u.value;
if (!e.powers[l]) {
var m = POWER_INFO[l];
if (m && void 0 !== m.level && m.level[0] <= (null !== (i = null === (a = this.gplState) || void 0 === a ? void 0 : a.currentLevel) && void 0 !== i ? i : 0)) return l;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = c.return) && o.call(c);
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
c === OK ? $r.info("Created new power creep: ".concat(i, " (").concat(s, ")"), {
subsystem: "PowerCreep"
}) : $r.warn("Failed to create power creep: ".concat(c), {
subsystem: "PowerCreep"
});
}
}
}
}, e.prototype.checkRespawnNeeds = function() {
var e, t;
try {
for (var r = p(this.assignments), o = r.next(); !o.done; o = r.next()) {
var n = d(o.value, 2), a = n[0], i = n[1], s = Game.powerCreeps[a];
if (s) if (void 0 === s.ticksToLive) {
if (!(c = Game.rooms[i.assignedRoom])) continue;
(u = c.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0]) && s.spawn(u) === OK && ($r.info("Power creep ".concat(a, " spawned at ").concat(c.name), {
subsystem: "PowerCreep"
}), i.spawned = !0, i.lastRespawnTick = Game.time);
} else if (s.ticksToLive < 500) {
var c, u;
if (!(c = s.room)) continue;
(u = c.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0]) && s.pos.getRangeTo(u) <= 1 && s.renew(u) === OK && $r.debug("Power creep ".concat(a, " renewed"), {
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
return o && (o.memory.homeRoom = t), $r.info("Power creep ".concat(e, " reassigned to ").concat(t), {
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
$r.info("Power System: GPL ".concat(this.gplState.currentLevel, " ") + "(".concat(this.gplState.currentProgress, "/").concat(this.gplState.progressNeeded, "), ") + "Operators: ".concat(e.length, "/").concat(this.gplState.currentLevel, " ") + "(".concat(t, " eco, ").concat(r, " combat)"), {
subsystem: "PowerCreep"
});
}
}, m([ qn("empire:powerCreep", "Power Creep Management", {
priority: yo.LOW,
interval: 20,
minBucket: 0,
cpuBudget: .03
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), ji = new Hi, Yi = {
recalculateInterval: 1e3,
maxPathOps: 2e3,
includeRemoteRoads: !0
}, qi = new Map;

function zi(e, t, r) {
var o, n, a, i, s, c, u, m, d, f, y, h, g, v, R, E, T;
void 0 === r && (r = {});
var S = l(l({}, Yi), r), C = qi.get(e.name);
if (C && Game.time - C.lastCalculated < S.recalculateInterval) return C;
var w = new Set, b = null !== (E = null === (R = e.controller) || void 0 === R ? void 0 : R.level) && void 0 !== E ? E : 0, x = e.find(FIND_SOURCES), O = e.controller, _ = e.storage, A = e.find(FIND_MINERALS)[0], U = null !== (T = null == _ ? void 0 : _.pos) && void 0 !== T ? T : t;
try {
for (var N = p(x), M = N.next(); !M.done; M = N.next()) {
var k = Zi(U, M.value.pos, e.name, S.maxPathOps);
try {
for (var P = (a = void 0, p(k)), I = P.next(); !I.done; I = P.next()) {
var G = I.value;
w.add("".concat(G.x, ",").concat(G.y));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
I && !I.done && (i = P.return) && i.call(P);
} finally {
if (a) throw a.error;
}
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
M && !M.done && (n = N.return) && n.call(N);
} finally {
if (o) throw o.error;
}
}
if (O) {
k = Zi(U, O.pos, e.name, S.maxPathOps);
try {
for (var L = p(k), D = L.next(); !D.done; D = L.next()) G = D.value, w.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
s = {
error: e
};
} finally {
try {
D && !D.done && (c = L.return) && c.call(L);
} finally {
if (s) throw s.error;
}
}
}
if (A && b >= 6) {
k = Zi(U, A.pos, e.name, S.maxPathOps);
try {
for (var F = p(k), B = F.next(); !B.done; B = F.next()) G = B.value, w.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
u = {
error: e
};
} finally {
try {
B && !B.done && (m = F.return) && m.call(F);
} finally {
if (u) throw u.error;
}
}
}
if (!_) {
try {
for (var W = p(x), V = W.next(); !V.done; V = W.next()) {
k = Zi(t, V.value.pos, e.name, S.maxPathOps);
try {
for (var K = (y = void 0, p(k)), H = K.next(); !H.done; H = K.next()) G = H.value, 
w.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
y = {
error: e
};
} finally {
try {
H && !H.done && (h = K.return) && h.call(K);
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
V && !V.done && (f = W.return) && f.call(W);
} finally {
if (d) throw d.error;
}
}
if (O) {
k = Zi(t, O.pos, e.name, S.maxPathOps);
try {
for (var j = p(k), Y = j.next(); !Y.done; Y = j.next()) G = Y.value, w.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
g = {
error: e
};
} finally {
try {
Y && !Y.done && (v = j.return) && v.call(j);
} finally {
if (g) throw g.error;
}
}
}
}
var q = {
roomName: e.name,
positions: w,
lastCalculated: Game.time
};
return qi.set(e.name, q), $r.debug("Calculated road network for ".concat(e.name, ": ").concat(w.size, " positions"), {
subsystem: "RoadNetwork"
}), q;
}

function Xi(e, t) {
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

function Qi(e, t) {
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

function $i(e, t) {
var r, o;
if (0 === t.length) return null;
var n = t[0], a = e.getRangeTo(n);
try {
for (var i = p(t), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = e.getRangeTo(c);
u < a && (a = u, n = c);
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

function Ji(e, t, r) {
var o, n, a, i, s, c, u, m, d;
void 0 === r && (r = {});
var f = l(l({}, Yi), r), y = new Map;
if (!f.includeRemoteRoads) return y;
var h = e.storage, g = e.find(FIND_MY_SPAWNS)[0], v = null !== (u = null == h ? void 0 : h.pos) && void 0 !== u ? u : null == g ? void 0 : g.pos;
if (!v) return y;
try {
for (var R = p(t), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
try {
var S = Xi(e.name, T);
if (!S) {
$r.warn("Cannot determine exit direction from ".concat(e.name, " to ").concat(T), {
subsystem: "RoadNetwork"
});
continue;
}
var C = Qi(e.name, S);
if (0 === C.length) {
$r.warn("No valid exit positions found in ".concat(e.name, " towards ").concat(T), {
subsystem: "RoadNetwork"
});
continue;
}
var w = $i(v, C);
if (!w) continue;
var b = PathFinder.search(v, {
pos: w,
range: 0
}, {
plainCost: 2,
swampCost: 10,
maxOps: f.maxPathOps,
roomCallback: function(t) {
return t === e.name && es(t);
}
});
if (!b.incomplete) try {
for (var x = (a = void 0, p(b.path)), O = x.next(); !O.done; O = x.next()) {
var _ = O.value;
y.has(_.roomName) || y.set(_.roomName, new Set), null === (m = y.get(_.roomName)) || void 0 === m || m.add("".concat(_.x, ",").concat(_.y));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
O && !O.done && (i = x.return) && i.call(x);
} finally {
if (a) throw a.error;
}
}
var A = new RoomPosition(25, 25, T), U = PathFinder.search(v, {
pos: A,
range: 20
}, {
plainCost: 2,
swampCost: 10,
maxOps: f.maxPathOps,
roomCallback: function(e) {
return es(e);
}
});
if (!U.incomplete) try {
for (var N = (s = void 0, p(U.path)), M = N.next(); !M.done; M = N.next()) _ = M.value, 
y.has(_.roomName) || y.set(_.roomName, new Set), null === (d = y.get(_.roomName)) || void 0 === d || d.add("".concat(_.x, ",").concat(_.y));
} catch (e) {
s = {
error: e
};
} finally {
try {
M && !M.done && (c = N.return) && c.call(N);
} finally {
if (s) throw s.error;
}
}
} catch (e) {
var k = e instanceof Error ? e.message : String(e);
$r.warn("Failed to calculate remote road to ".concat(T, ": ").concat(k), {
subsystem: "RoadNetwork"
});
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
return y;
}

function Zi(e, t, r, o) {
var n, a, i = [], s = PathFinder.search(e, {
pos: t,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxOps: o,
roomCallback: function(e) {
return e === r && es(e);
}
});
if (!s.incomplete) try {
for (var c = p(s.path), u = c.next(); !u.done; u = c.next()) {
var l = u.value;
l.roomName === r && i.push({
x: l.x,
y: l.y
});
}
} catch (e) {
n = {
error: e
};
} finally {
try {
u && !u.done && (a = c.return) && a.call(c);
} finally {
if (n) throw n.error;
}
}
return i;
}

function es(e) {
var t, r, o, n, a = Game.rooms[e], i = new PathFinder.CostMatrix;
if (!a) return i;
var s = a.find(FIND_STRUCTURES);
try {
for (var c = p(s), u = c.next(); !u.done; u = c.next()) {
var l = u.value;
l.structureType === STRUCTURE_ROAD ? i.set(l.pos.x, l.pos.y, 1) : l.structureType === STRUCTURE_CONTAINER || l.structureType === STRUCTURE_RAMPART && "my" in l && l.my || i.set(l.pos.x, l.pos.y, 255);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
var m = a.find(FIND_MY_CONSTRUCTION_SITES);
try {
for (var d = p(m), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
y.structureType === STRUCTURE_ROAD ? i.set(y.pos.x, y.pos.y, 1) : y.structureType !== STRUCTURE_CONTAINER && i.set(y.pos.x, y.pos.y, 255);
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
return i;
}

function ts(e, t) {
return e.x <= t || e.x >= 49 - t || e.y <= t || e.y >= 49 - t;
}

function rs(e, t) {
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

function os(e, t, r) {
var o, n = Cn.getSwarmState(e);
if (n) {
var a = null !== (o = n.remoteAssignments) && void 0 !== o ? o : [], i = a.indexOf(t);
if (-1 !== i) {
a.splice(i, 1), n.remoteAssignments = a;
var s = Cn.getEmpire().knownRooms[t];
s && (s.threatLevel = 3, s.lastSeen = Game.time), $r.warn("Removed remote room ".concat(t, " from ").concat(e, " due to: ").concat(r), {
subsystem: "RemoteRoomManager"
});
}
}
}

function ns(e) {
var t, r, o, n = Cn.getSwarmState(e);
if (n) {
var a = null !== (o = n.remoteAssignments) && void 0 !== o ? o : [];
if (0 !== a.length) try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Game.rooms[c];
if (u) {
var l = rs(u);
l.lost && l.reason && os(e, c, l.reason);
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
}
}

var as = {
updateInterval: 50,
minBucket: 0,
maxSitesPerRemotePerTick: 2
}, is = function() {
function e(e) {
void 0 === e && (e = {}), this.config = l(l({}, as), e);
}
return e.prototype.run = function() {
var e, t, r, o, n, a = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Cn.getSwarmState(c.name);
if (u) {
ns(c.name);
var l = null !== (n = u.remoteAssignments) && void 0 !== n ? n : [];
if (0 !== l.length) {
try {
for (var m = (r = void 0, p(l)), d = m.next(); !d.done; d = m.next()) {
var f = d.value;
this.planRemoteInfrastructure(c, f);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
this.placeRemoteRoads(c, l);
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
}, e.prototype.planRemoteInfrastructure = function(e, t) {
var r, o, n = Game.rooms[t];
if (n) {
var a = n.controller, i = this.getMyUsername();
if (a) {
if (a.owner && a.owner.username !== i) return;
if (a.reservation && a.reservation.username !== i) return;
}
var s = n.find(FIND_SOURCES), c = 0;
try {
for (var u = p(s), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
if (c >= this.config.maxSitesPerRemotePerTick) break;
this.placeSourceContainer(n, m) && c++;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = u.return) && o.call(u);
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
if (!r) return $r.warn("Could not find valid position for container at source ".concat(t.id, " in ").concat(e.name), {
subsystem: "RemoteInfra"
}), !1;
if (e.find(FIND_CONSTRUCTION_SITES).length >= 5) return !1;
var o = e.createConstructionSite(r.x, r.y, STRUCTURE_CONTAINER);
return o === OK ? ($r.info("Placed container construction site at source ".concat(t.id, " in ").concat(e.name), {
subsystem: "RemoteInfra"
}), !0) : ($r.debug("Failed to place container at source ".concat(t.id, " in ").concat(e.name, ": ").concat(o), {
subsystem: "RemoteInfra"
}), !1);
}, e.prototype.findBestContainerPosition = function(e) {
for (var t = e.room, r = t.getTerrain(), o = [], n = -1; n <= 1; n++) for (var a = -1; a <= 1; a++) if (0 !== n || 0 !== a) {
var i = e.pos.x + n, s = e.pos.y + a;
if (!(i < 1 || i > 48 || s < 1 || s > 48 || r.get(i, s) === TERRAIN_MASK_WALL || new RoomPosition(i, s, t.name).lookFor(LOOK_STRUCTURES).length > 0)) {
for (var c = 0, u = -1; u <= 1; u++) for (var l = -1; l <= 1; l++) if (0 !== u || 0 !== l) {
var m = i + u, p = s + l;
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
var r, o, n = Ji(e, t), a = n.get(e.name);
a && this.placeRoadsInRoom(e, a);
try {
for (var i = p(t), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = Game.rooms[c];
if (u) {
var l = n.get(c);
l && this.placeRoadsInRoom(u, l);
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
}, e.prototype.placeRoadsInRoom = function(e, t) {
var r, o, n = e.find(FIND_CONSTRUCTION_SITES), a = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
});
if (!(n.length >= 5)) {
var i = new Set(a.map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), s = new Set(n.filter(function(e) {
return e.structureType === STRUCTURE_ROAD;
}).map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), c = e.getTerrain(), u = 0;
try {
for (var l = p(t), m = l.next(); !m.done; m = l.next()) {
var f = m.value;
if (u >= 3) break;
if (n.length + u >= 5) break;
if (!i.has(f) && !s.has(f)) {
var y = d(f.split(","), 2), h = y[0], g = y[1], v = parseInt(h, 10), R = parseInt(g, 10);
c.get(v, R) !== TERRAIN_MASK_WALL && e.createConstructionSite(v, R, STRUCTURE_ROAD) === OK && u++;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
u > 0 && $r.debug("Placed ".concat(u, " remote road construction sites in ").concat(e.name), {
subsystem: "RemoteInfra"
});
}
}, e.prototype.getMyUsername = function() {
var e = Object.values(Game.spawns);
return e.length > 0 ? e[0].owner.username : "";
}, m([ Yn("remote:infrastructure", "Remote Infrastructure Manager", {
priority: yo.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .05
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), ss = new is, cs = {
updateInterval: 50,
minBucket: 0,
maxCpuBudget: .01
}, us = function() {
function e(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = l(l({}, cs), e);
}
return e.prototype.run = function() {
this.lastRun = Game.time;
var e = InterShardMemory.getLocal();
if (e) {
var t = Wn(e);
if (t) {
this.updateEnemyIntelligence(t);
var r = Bn(t);
InterShardMemory.setLocal(r);
}
}
}, e.prototype.updateEnemyIntelligence = function(e) {
var t, r, o, n;
if (e) {
var a = Cn.getEmpire(), i = new Map;
if (e.globalTargets.enemies) try {
for (var s = p(e.globalTargets.enemies), c = s.next(); !c.done; c = s.next()) {
var u = c.value;
i.set(u.username, u);
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
if (a.warTargets) try {
for (var l = p(a.warTargets), m = l.next(); !m.done; m = l.next()) {
var d = m.value;
(y = i.get(d)) ? (y.lastSeen = Game.time, y.threatLevel = Math.max(y.threatLevel, 1)) : i.set(d, {
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
m && !m.done && (n = l.return) && n.call(l);
} finally {
if (o) throw o.error;
}
}
if (a.knownRooms) for (var f in a.knownRooms) {
var y, h = a.knownRooms[f];
h && h.owner && !h.owner.includes("Source Keeper") && ((y = i.get(h.owner)) ? (y.rooms.includes(f) || y.rooms.push(f), 
y.lastSeen = Math.max(y.lastSeen, h.lastSeen), y.threatLevel = Math.max(y.threatLevel, h.threatLevel)) : i.set(h.owner, {
username: h.owner,
rooms: [ f ],
threatLevel: h.threatLevel,
lastSeen: h.lastSeen,
isAlly: !1
}));
}
if (e.globalTargets.enemies = Array.from(i.values()), Game.time % 500 == 0) {
var g = e.globalTargets.enemies.length, v = e.globalTargets.enemies.filter(function(e) {
return e.threatLevel >= 2;
}).length;
$r.info("Cross-shard intel: ".concat(g, " enemies tracked, ").concat(v, " high threat"), {
subsystem: "CrossShardIntel"
});
}
}
}, e.prototype.getGlobalEnemies = function() {
var e = InterShardMemory.getLocal();
if (!e) return [];
var t = Wn(e);
return t && t.globalTargets.enemies || [];
}, m([ qn("empire:crossShardIntel", "Cross-Shard Intel", {
priority: yo.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .01
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), ls = new us;

function ms(e) {
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

function ps() {
var e;
return (null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.npcRooms) || {};
}

function ds(e) {
var t = Memory;
t.tooangel || (t.tooangel = {}), t.tooangel.npcRooms || (t.tooangel.npcRooms = {});
var r = t.tooangel.npcRooms[e.roomName];
if (r) {
var o = new Set(f(f([], d(r.availableQuests), !1), d(e.availableQuests), !1));
e.availableQuests = Array.from(o);
}
t.tooangel.npcRooms[e.roomName] = e;
}

function fs() {
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

function ys() {
var e;
return (null === (e = fs().reputation) || void 0 === e ? void 0 : e.value) || 0;
}

function hs(e) {
try {
var t = JSON.parse(e);
if ("reputation" === t.type && "number" == typeof t.reputation) return t.reputation;
} catch (e) {}
return null;
}

function gs(e) {
var t, r, o, n = fs(), a = (null === (t = n.reputation) || void 0 === t ? void 0 : t.lastRequestedAt) || 0;
if (Game.time - a < 1e3) return $r.debug("Reputation request on cooldown (".concat(1e3 - (Game.time - a), " ticks remaining)"), {
subsystem: "TooAngel"
}), !1;
if (e) o = Game.rooms[e]; else for (var i in Game.rooms) {
var s = Game.rooms[i];
if ((null === (r = s.controller) || void 0 === r ? void 0 : r.my) && s.terminal && s.terminal.my) {
o = s;
break;
}
}
if (!o || !o.terminal || !o.terminal.my) return $r.warn("No terminal available to request reputation", {
subsystem: "TooAngel"
}), !1;
var c = function(e) {
var t = ps(), r = null, o = 1 / 0;
for (var n in t) {
var a = Game.map.getRoomLinearDistance(e, n);
a < o && (o = a, r = t[n]);
}
return r;
}(o.name);
if (!c || !c.hasTerminal) return $r.warn("No TooAngel NPC room with terminal found", {
subsystem: "TooAngel"
}), !1;
var u = o.terminal, l = u.store[RESOURCE_ENERGY];
if (l < 100) return $r.warn("Insufficient energy for reputation request: ".concat(l, " < ").concat(100), {
subsystem: "TooAngel"
}), !1;
var m = u.send(RESOURCE_ENERGY, 100, c.roomName, JSON.stringify({
type: "reputation"
}));
return m === OK ? ($r.info("Sent reputation request to ".concat(c.roomName, " from ").concat(o.name), {
subsystem: "TooAngel"
}), n.reputation.lastRequestedAt = Game.time, !0) : ($r.warn("Failed to send reputation request: ".concat(m), {
subsystem: "TooAngel"
}), !1);
}

var vs = {
MAX_ACTIVE_QUESTS: 3,
MIN_APPLICATION_ENERGY: 100,
DEADLINE_BUFFER: 500,
SUPPORTED_TYPES: [ "buildcs" ]
};

function Rs(e) {
try {
var t = JSON.parse(e);
if ("quest" === t.type && t.id && t.room && t.quest && "number" == typeof t.end) return !t.result && t.end <= Game.time ? ($r.debug("Ignoring quest ".concat(t.id, " with past deadline: ").concat(t.end, " (current: ").concat(Game.time, ")"), {
subsystem: "TooAngel"
}), null) : t;
} catch (e) {}
return null;
}

function Es() {
return fs().activeQuests || {};
}

function Ts() {
var e = Es();
return Object.values(e).filter(function(e) {
return "active" === e.status || "applied" === e.status;
}).length < vs.MAX_ACTIVE_QUESTS;
}

function Ss(e) {
return vs.SUPPORTED_TYPES.includes(e);
}

function Cs(e, t, r) {
var o, n;
if (!Ts()) return $r.debug("Cannot accept more quests (at max capacity)", {
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
if (!n || !n.terminal || !n.terminal.my) return $r.warn("No terminal available to apply for quest", {
subsystem: "TooAngel"
}), !1;
var u = n.terminal, l = u.store[RESOURCE_ENERGY];
if (l < vs.MIN_APPLICATION_ENERGY) return $r.warn("Insufficient energy for quest application: ".concat(l, " < ").concat(vs.MIN_APPLICATION_ENERGY), {
subsystem: "TooAngel"
}), !1;
var m = {
type: "quest",
id: e,
action: "apply"
}, p = u.send(RESOURCE_ENERGY, vs.MIN_APPLICATION_ENERGY, t, JSON.stringify(m));
return p === OK ? ($r.info("Applied for quest ".concat(e, " from ").concat(n.name, " to ").concat(t), {
subsystem: "TooAngel"
}), fs().activeQuests[e] = {
id: e,
type: "buildcs",
status: "applied",
targetRoom: "",
originRoom: t,
deadline: 0,
appliedAt: Game.time
}, !0) : ($r.warn("Failed to apply for quest: ".concat(p), {
subsystem: "TooAngel"
}), !1);
}

function ws(e) {
var t = fs(), r = t.activeQuests[e.id];
r ? ("won" === e.result ? ($r.info("Quest ".concat(e.id, " completed successfully!"), {
subsystem: "TooAngel"
}), r.status = "completed") : ($r.warn("Quest ".concat(e.id, " failed"), {
subsystem: "TooAngel"
}), r.status = "failed"), r.completedAt = Game.time, t.completedQuests.includes(e.id) || t.completedQuests.push(e.id)) : $r.warn("Received completion for unknown quest: ".concat(e.id), {
subsystem: "TooAngel"
});
}

function bs(e) {
var t, r, o, n, a, i, s, c = Game.rooms[e.targetRoom];
if (c) {
if (function(e) {
var t = Game.rooms[e];
return !!t && 0 === t.find(FIND_CONSTRUCTION_SITES).length;
}(e.targetRoom)) return $r.info("Quest ".concat(e.id, " (buildcs) completed! All construction sites built in ").concat(e.targetRoom), {
subsystem: "TooAngel"
}), function(e) {
var t, r, o = function(e) {
return Es()[e] || null;
}(e);
if (!o) return $r.warn("Cannot notify completion for unknown quest: ".concat(e), {
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
r.terminal.send(RESOURCE_ENERGY, 100, o.originRoom, JSON.stringify(i)) === OK && $r.info("Notified quest completion: ".concat(e, " (").concat("won", ")"), {
subsystem: "TooAngel"
});
}(e.id), e.status = "completed", void (e.completedAt = Game.time);
var u = c.find(FIND_CONSTRUCTION_SITES);
$r.debug("Quest ".concat(e.id, " (buildcs): ").concat(u.length, " construction sites remaining in ").concat(e.targetRoom), {
subsystem: "TooAngel"
});
var l = e.assignedCreeps || [], m = [];
try {
for (var d = p(l), f = d.next(); !f.done; f = d.next()) {
var y = f.value, h = Game.creeps[y];
h && m.push(h);
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
if (m.length < 3 && u.length > 0) for (var g in Game.rooms) {
var v = Game.rooms[g];
if (null === (s = v.controller) || void 0 === s ? void 0 : s.my) {
var R = v.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory, r = t.role;
return !("larvaWorker" !== r && "builder" !== r || t.questId || t.assistTarget);
}
});
try {
for (var E = (o = void 0, p(R)), T = E.next(); !(T.done || ((b = (w = T.value).memory).questId = e.id, 
m.push(w), l.push(w.name), $r.info("Assigned ".concat(w.name, " to quest ").concat(e.id, " (buildcs)"), {
subsystem: "TooAngel"
}), m.length >= 3)); T = E.next()) ;
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
if (m.length >= 3) break;
}
}
e.assignedCreeps = l;
try {
for (var S = p(m), C = S.next(); !C.done; C = S.next()) {
var w, b;
(b = (w = C.value).memory).questId = e.id, b.questTarget = e.targetRoom, b.questAction = "build";
}
} catch (e) {
a = {
error: e
};
} finally {
try {
C && !C.done && (i = S.return) && i.call(S);
} finally {
if (a) throw a.error;
}
}
} else $r.debug("Cannot execute buildcs quest ".concat(e.id, ": room ").concat(e.targetRoom, " not visible"), {
subsystem: "TooAngel"
});
}

var xs = function() {
function e() {
this.lastScanTick = 0, this.lastReputationRequestTick = 0, this.lastQuestDiscoveryTick = 0;
}
return e.prototype.isEnabled = function() {
var e, t;
return null === (t = null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.enabled) || void 0 === t || t;
}, e.prototype.enable = function() {
var e = Memory;
e.tooangel || (e.tooangel = {}), e.tooangel.enabled = !0, $r.info("TooAngel integration enabled", {
subsystem: "TooAngel"
});
}, e.prototype.disable = function() {
var e = Memory;
e.tooangel || (e.tooangel = {}), e.tooangel.enabled = !1, $r.info("TooAngel integration disabled", {
subsystem: "TooAngel"
});
}, e.prototype.run = function() {
if (this.isEnabled() && !(Game.cpu.bucket < 2e3)) try {
!function() {
var e, t;
if (Game.market.incomingTransactions) {
var r = fs();
try {
for (var o = p(Game.market.incomingTransactions), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (!a.order && a.description) {
var i = hs(a.description);
null !== i && ($r.info("Received reputation update from TooAngel: ".concat(i), {
subsystem: "TooAngel"
}), r.reputation = {
value: i,
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
var r = fs();
try {
for (var o = p(Game.market.incomingTransactions), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (!a.order && a.description) {
var i = Rs(a.description);
if (i) {
if ($r.info("Received quest ".concat(i.id, ": ").concat(i.quest, " in ").concat(i.room, " (deadline: ").concat(i.end, ")"), {
subsystem: "TooAngel"
}), i.result) {
ws(i);
continue;
}
var s = r.activeQuests[i.id];
r.activeQuests[i.id] = {
id: i.id,
type: i.quest,
status: "completed" === (null == s ? void 0 : s.status) || "failed" === (null == s ? void 0 : s.status) ? s.status : "active",
targetRoom: i.room,
originRoom: i.origin || a.from,
deadline: i.end,
appliedAt: null == s ? void 0 : s.appliedAt,
receivedAt: Game.time,
assignedCreeps: []
}, Ss(i.quest) || ($r.warn("Received unsupported quest type: ".concat(i.quest), {
subsystem: "TooAngel"
}), r.activeQuests[i.id].status = "failed");
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
"active" === o.status && (o.deadline > 0 && Game.time > o.deadline ? ($r.warn("Quest ".concat(r, " missed deadline (").concat(o.deadline, ")"), {
subsystem: "TooAngel"
}), o.status = "failed", o.completedAt = Game.time) : "buildcs" === o.type ? bs(o) : ($r.warn("Unsupported quest type for execution: ".concat(o.type), {
subsystem: "TooAngel"
}), o.status = "failed", o.completedAt = Game.time));
}
}(), function() {
var e = fs().activeQuests || {};
for (var t in e) {
var r = e[t];
r.deadline > 0 && Game.time >= r.deadline - vs.DEADLINE_BUFFER && ("active" !== r.status && "applied" !== r.status || ($r.warn("Quest ".concat(t, " expired (deadline: ").concat(r.deadline, ", current: ").concat(Game.time, ")"), {
subsystem: "TooAngel"
}), r.status = "failed", r.completedAt = Game.time)), ("completed" === r.status || "failed" === r.status) && r.completedAt && Game.time - r.completedAt > 1e4 && delete e[t];
}
}(), Game.time - this.lastScanTick >= 500 && (this.scanForNPCs(), this.lastScanTick = Game.time), 
Game.time - this.lastReputationRequestTick >= 2e3 && (this.updateReputation(), this.lastReputationRequestTick = Game.time), 
Game.time - this.lastQuestDiscoveryTick >= 1e3 && (this.discoverQuests(), this.lastQuestDiscoveryTick = Game.time);
} catch (t) {
var e = "tooangel_error_".concat(Game.time % 100);
Memory[e] || ($r.error("TooAngel manager error: ".concat(t), {
subsystem: "TooAngel"
}), Memory[e] = !0);
}
}, e.prototype.scanForNPCs = function() {
var e, t, r = function() {
var e = [];
for (var t in Game.rooms) {
var r = ms(Game.rooms[t]);
r && ($r.info("Detected TooAngel NPC room: ".concat(t), {
subsystem: "TooAngel"
}), e.push(r));
}
return e;
}();
try {
for (var o = p(r), n = o.next(); !n.done; n = o.next()) ds(n.value);
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
r.length > 0 && $r.info("Scanned ".concat(r.length, " TooAngel NPC rooms"), {
subsystem: "TooAngel"
});
}, e.prototype.updateReputation = function() {
gs();
}, e.prototype.discoverQuests = function() {
!function() {
var e, t;
if (Ts()) {
var r = ps(), o = Es();
for (var n in r) {
var a = r[n];
try {
for (var i = (e = void 0, p(a.availableQuests)), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (!o[c]) return $r.info("Auto-applying for quest ".concat(c, " from ").concat(n), {
subsystem: "TooAngel"
}), void Cs(c, n);
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
}
}
}();
}, e.prototype.getReputation = function() {
return ys();
}, e.prototype.getActiveQuests = function() {
return Es();
}, e.prototype.applyForQuest = function(e, t, r) {
return Cs(e, t, r);
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
}, m([ qn("empire:tooangel", "TooAngel Manager", {
priority: yo.LOW,
interval: 10
}) ], e.prototype, "run", null), m([ Xn() ], e);
}(), Os = new xs, _s = {
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
}, As = function() {
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
}(), Us = function() {
function e(e) {
void 0 === e && (e = {}), this.trackers = new Map, this.config = l(l({}, _s), e);
}
return e.prototype.getTracker = function(e) {
var t = this.trackers.get(e);
return t || (t = {
energyHarvested: new As(10),
energySpawning: new As(10),
energyConstruction: new As(10),
energyRepair: new As(10),
energyTower: new As(10),
controllerProgress: new As(10),
hostileCount: new As(5),
damageReceived: new As(5),
idleWorkers: new As(10),
lastControllerProgress: 0
}, this.trackers.set(e, t)), t;
}, e.prototype.updateMetrics = function(e, r) {
var o, n, a, i, s, c, u, l, m = this.getTracker(e.name), d = "sources_".concat(e.name), f = global[d];
f && f.tick === Game.time ? l = f.sources : (l = e.find(FIND_SOURCES), global[d] = {
sources: l,
tick: Game.time
});
var y = 0, h = 0;
try {
for (var g = p(l), v = g.next(); !v.done; v = g.next()) {
var R = v.value;
y += R.energyCapacity, h += R.energy;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
v && !v.done && (n = g.return) && n.call(g);
} finally {
if (o) throw o.error;
}
}
var E = y - h;
if (m.energyHarvested.add(E), null === (u = e.controller) || void 0 === u ? void 0 : u.my) {
var T = e.controller.progress - m.lastControllerProgress;
T > 0 && T < 1e5 && m.controllerProgress.add(T), m.lastControllerProgress = e.controller.progress;
}
var S = t.safeFind(e, FIND_HOSTILE_CREEPS);
m.hostileCount.add(S.length);
var C = 0;
try {
for (var w = p(S), b = w.next(); !b.done; b = w.next()) {
var x = b.value;
try {
for (var O = (s = void 0, p(x.body)), _ = O.next(); !_.done; _ = O.next()) {
var A = _.value;
A.hits > 0 && (A.type === ATTACK ? C += 30 : A.type === RANGED_ATTACK && (C += 10));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
_ && !_.done && (c = O.return) && c.call(O);
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
b && !b.done && (i = w.return) && i.call(w);
} finally {
if (a) throw a.error;
}
}
m.damageReceived.add(C), r.metrics.energyHarvested = m.energyHarvested.get(), r.metrics.controllerProgress = m.controllerProgress.get(), 
r.metrics.hostileCount = Math.round(m.hostileCount.get()), r.metrics.damageReceived = m.damageReceived.get();
}, e.prototype.updatePheromones = function(e, t) {
var r, o;
if (!(Game.time < e.nextUpdateTick)) {
var n = e.pheromones;
try {
for (var a = p(Object.keys(n)), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = this.config.decayFactors[s];
n[s] = this.clamp(n[s] * c);
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
var u = t.find(FIND_MY_CONSTRUCTION_SITES);
if (u.length > 0 && (n.build = this.clamp(n.build + Math.min(2 * u.length, 20))), 
null === (r = t.controller) || void 0 === r ? void 0 : r.my) {
var l = t.controller.progress / t.controller.progressTotal;
l < .5 && (n.upgrade = this.clamp(n.upgrade + 15 * (1 - l)));
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
r >= 3 && (e.pheromones.siege = this.clamp(e.pheromones.siege + 20)), $r.info("Hostile detected: ".concat(t, " hostiles, danger=").concat(r), {
room: e.role,
subsystem: "Pheromone"
});
}, e.prototype.updateDangerFromThreat = function(e, t, r) {
e.danger = r, e.pheromones.defense = this.clamp(t / 10), r >= 2 && (e.pheromones.war = this.clamp(e.pheromones.war + 10 * r)), 
r >= 3 && (e.pheromones.siege = this.clamp(e.pheromones.siege + 20));
}, e.prototype.diffuseDangerToCluster = function(e, t, r) {
var o, n, a;
try {
for (var i = p(r), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
if (c !== e) {
var u = Game.rooms[c];
if (null === (a = null == u ? void 0 : u.controller) || void 0 === a ? void 0 : a.my) {
var l = u.memory.swarm;
if (l) {
var m = this.clamp(t / 10), d = l.pheromones.defense, f = .05 * Math.max(0, m - d);
l.pheromones.defense = this.clamp(d + f);
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
s && !s.done && (n = i.return) && n.call(i);
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
var t, r, o, n, a, i, s, c, u = [];
try {
for (var l = p(e), m = l.next(); !m.done; m = l.next()) {
var f = d(m.value, 2), y = f[0], h = f[1], g = this.getNeighborRoomNames(y);
try {
for (var v = (o = void 0, p(g)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
if (e.get(E)) try {
for (var T = (a = void 0, p([ "defense", "war", "expand", "siege" ])), S = T.next(); !S.done; S = T.next()) {
var C = S.value, w = h.pheromones[C];
if (w > 1) {
var b = this.config.diffusionRates[C];
u.push({
source: y,
target: E,
type: C,
amount: w * b * .5,
sourceIntensity: w
});
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
S && !S.done && (i = T.return) && i.call(T);
} finally {
if (a) throw a.error;
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
m && !m.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
try {
for (var x = p(u), O = x.next(); !O.done; O = x.next()) {
var _ = O.value, A = e.get(_.target);
if (A) {
var U = A.pheromones[_.type] + _.amount;
A.pheromones[_.type] = this.clamp(Math.min(U, _.sourceIntensity));
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
O && !O.done && (c = x.return) && c.call(x);
} finally {
if (s) throw s.error;
}
}
}, e.prototype.getNeighborRoomNames = function(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
if (!t) return [];
var r = d(t, 5), o = r[1], n = r[2], a = r[3], i = r[4];
if (!(o && n && a && i)) return [];
var s = parseInt(n, 10), c = parseInt(i, 10), u = [];
return "N" === a ? u.push("".concat(o).concat(s, "N").concat(c + 1)) : c > 0 ? u.push("".concat(o).concat(s, "S").concat(c - 1)) : u.push("".concat(o).concat(s, "N0")), 
"S" === a ? u.push("".concat(o).concat(s, "S").concat(c + 1)) : c > 0 ? u.push("".concat(o).concat(s, "N").concat(c - 1)) : u.push("".concat(o).concat(s, "S0")), 
"E" === o ? u.push("E".concat(s + 1).concat(a).concat(c)) : s > 0 ? u.push("W".concat(s - 1).concat(a).concat(c)) : u.push("E0".concat(a).concat(c)), 
"W" === o ? u.push("W".concat(s + 1).concat(a).concat(c)) : s > 0 ? u.push("E".concat(s - 1).concat(a).concat(c)) : u.push("W0".concat(a).concat(c)), 
u;
}, e.prototype.getDominantPheromone = function(e) {
var t, r, o = null, n = 1;
try {
for (var a = p(Object.keys(e)), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
e[s] > n && (n = e[s], o = s);
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
}(), Ns = new Us, Ms = function() {
function e() {
this.configs = new Map;
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
for (var a = p(t), i = a.next(); !i.done; i = a.next()) n(i.value);
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
e.lastUpdate = Game.time;
}, e.prototype.autoAssignRoles = function(e, t) {
var r, o, n, a, i, s, c, u, l, m;
if (t.length < 3) e.isValid = !1; else {
var d = new Map;
try {
for (var f = p(t), y = f.next(); !y.done; y = f.next()) {
var h = y.value, g = [];
try {
for (var v = (n = void 0, p(t)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
h.id !== E.id && h.pos.getRangeTo(E) <= 2 && g.push(E.id);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
R && !R.done && (a = v.return) && a.call(v);
} finally {
if (n) throw n.error;
}
}
d.set(h.id, g);
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
if (T.length < 3 || (null !== (u = null === (c = T[0]) || void 0 === c ? void 0 : c.reach) && void 0 !== u ? u : 0) < 2) return e.isValid = !1, 
void $r.warn("Lab layout in ".concat(e.roomName, " is not optimal for reactions"), {
subsystem: "Labs"
});
var S = null === (l = T[0]) || void 0 === l ? void 0 : l.lab, C = null === (m = T[1]) || void 0 === m ? void 0 : m.lab;
if (S && C) {
try {
for (var w = p(e.labs), b = w.next(); !b.done; b = w.next()) {
var x = b.value;
if (x.labId === S.id) x.role = "input1", x.lastConfigured = Game.time; else if (x.labId === C.id) x.role = "input2", 
x.lastConfigured = Game.time; else {
var O = S.pos.getRangeTo(Game.getObjectById(x.labId)) <= 2, _ = C.pos.getRangeTo(Game.getObjectById(x.labId)) <= 2;
x.role = O && _ ? "output" : "boost", x.lastConfigured = Game.time;
}
}
} catch (e) {
i = {
error: e
};
} finally {
try {
b && !b.done && (s = w.return) && s.call(w);
} finally {
if (i) throw i.error;
}
}
e.isValid = !0, e.lastUpdate = Game.time, $r.info("Auto-assigned lab roles in ".concat(e.roomName, ": ") + "".concat(e.labs.filter(function(e) {
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
var n, a, i = this.configs.get(e);
if (!i || !i.isValid) return !1;
i.activeReaction = {
input1: t,
input2: r,
output: o
};
var s = i.labs.find(function(e) {
return "input1" === e.role;
}), c = i.labs.find(function(e) {
return "input2" === e.role;
});
s && (s.resourceType = t), c && (c.resourceType = r);
try {
for (var u = p(i.labs.filter(function(e) {
return "output" === e.role;
})), l = u.next(); !l.done; l = u.next()) l.value.resourceType = o;
} catch (e) {
n = {
error: e
};
} finally {
try {
l && !l.done && (a = u.return) && a.call(u);
} finally {
if (n) throw n.error;
}
}
return i.lastUpdate = Game.time, $r.info("Set active reaction in ".concat(e, ": ").concat(t, " + ").concat(r, " -> ").concat(o), {
subsystem: "Labs"
}), !0;
}, e.prototype.clearActiveReaction = function(e) {
var t, r, o = this.configs.get(e);
if (o) {
delete o.activeReaction;
try {
for (var n = p(o.labs), a = n.next(); !a.done; a = n.next()) delete a.value.resourceType;
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
o.lastUpdate = Game.time;
}
}, e.prototype.setLabRole = function(e, t, r, o) {
var n = this.configs.get(e);
if (!n) return !1;
var a = n.labs.find(function(e) {
return e.labId === t;
});
return !!a && (a.role = r, a.resourceType = o, a.lastConfigured = Game.time, this.validateConfig(n), 
!0);
}, e.prototype.validateConfig = function(e) {
var t = e.labs.some(function(e) {
return "input1" === e.role;
}), r = e.labs.some(function(e) {
return "input2" === e.role;
}), o = e.labs.some(function(e) {
return "output" === e.role;
});
if (e.isValid = t && r && o, e.isValid) {
var n = e.labs.find(function(e) {
return "input1" === e.role;
}), a = e.labs.find(function(e) {
return "input2" === e.role;
}), i = e.labs.filter(function(e) {
return "output" === e.role;
});
if (n && a && i.length > 0) {
var s = Game.getObjectById(n.labId), c = Game.getObjectById(a.labId);
if (s && c) {
var u = i.some(function(e) {
var t = Game.getObjectById(e.labId);
return t && s.pos.getRangeTo(t) <= 2 && c.pos.getRangeTo(t) <= 2;
});
e.isValid = u;
} else e.isValid = !1;
}
}
}, e.prototype.runReactions = function(e) {
var t, r, o = this.configs.get(e);
if (!o || !o.isValid || !o.activeReaction) return 0;
var n = this.getInputLabs(e), a = n.input1, i = n.input2;
if (!a || !i) return 0;
var s = this.getOutputLabs(e), c = 0;
try {
for (var u = p(s), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
0 === m.cooldown && m.runReaction(a, i) === OK && c++;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
return c;
}, e.prototype.saveToMemory = function(e) {
var t = this.configs.get(e);
if (t) {
var r = Memory.rooms[e];
if (r) {
r.labConfig = t;
var o = "memory:room:".concat(e, ":labConfig");
ro.set(o, t, Jr);
}
}
}, e.prototype.loadFromMemory = function(e) {
var t = "memory:room:".concat(e, ":labConfig"), r = ro.get(t);
if (!r) {
var o = Memory.rooms[e], n = null == o ? void 0 : o.labConfig;
n && (ro.set(t, n, Jr), r = n);
}
r && this.configs.set(e, r);
}, e.prototype.getConfiguredRooms = function() {
return Array.from(this.configs.keys());
}, e.prototype.hasValidConfig = function(e) {
var t, r = this.configs.get(e);
return null !== (t = null == r ? void 0 : r.isValid) && void 0 !== t && t;
}, e;
}(), ks = new Ms, Ps = function() {
function t() {}
return t.prototype.cleanupMemory = function() {
for (var e in Memory.creeps) Game.creeps[e] || delete Memory.creeps[e];
}, t.prototype.checkMemorySize = function() {
var e = RawMemory.get().length, t = 2097152, r = e / t * 100;
r > 90 ? $r.error("Memory usage critical: ".concat(r.toFixed(1), "% (").concat(e, "/").concat(t, " bytes)"), {
subsystem: "Memory"
}) : r > 75 && $r.warn("Memory usage high: ".concat(r.toFixed(1), "% (").concat(e, "/").concat(t, " bytes)"), {
subsystem: "Memory"
});
}, t.prototype.updateMemorySegmentStats = function() {
e.memorySegmentStats.run();
}, t.prototype.runPheromoneDiffusion = function() {
var e, t, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), o = new Map;
try {
for (var n = p(r), a = n.next(); !a.done; a = n.next()) {
var i = a.value, s = Cn.getSwarmState(i.name);
s && o.set(i.name, s);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
Ns.applyDiffusion(o);
}, t.prototype.initializeLabConfigs = function() {
var e, t, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var o = p(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
ks.initialize(a.name);
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
}, t.prototype.precacheRoomPaths = function() {}, m([ qn("core:memoryCleanup", "Memory Cleanup", {
priority: yo.LOW,
interval: 50,
cpuBudget: .01
}) ], t.prototype, "cleanupMemory", null), m([ zn("core:memorySizeCheck", "Memory Size Check", {
interval: 100,
cpuBudget: .005
}) ], t.prototype, "checkMemorySize", null), m([ Yn("core:memorySegmentStats", "Memory Segment Stats", {
priority: yo.IDLE,
interval: 10,
cpuBudget: .01
}) ], t.prototype, "updateMemorySegmentStats", null), m([ Yn("cluster:pheromoneDiffusion", "Pheromone Diffusion", {
priority: yo.MEDIUM,
interval: 10,
cpuBudget: .02
}) ], t.prototype, "runPheromoneDiffusion", null), m([ qn("room:labConfig", "Lab Config Manager", {
priority: yo.LOW,
interval: 200,
cpuBudget: .01
}) ], t.prototype, "initializeLabConfigs", null), m([ zn("room:pathCachePrecache", "Path Cache Precache (Disabled)", {
interval: 1e3,
cpuBudget: .01
}) ], t.prototype, "precacheRoomPaths", null), m([ Xn() ], t);
}(), Is = new Ps, Gs = Qr("NativeCallsTracker");

function Ls(t, r, o) {
var n = t[r];
if (n && !n.__nativeCallsTrackerWrapped) {
var a = Object.getOwnPropertyDescriptor(t, r);
if (a && !1 === a.configurable) Gs.warn("Cannot wrap method - property is not configurable", {
meta: {
methodName: r
}
}); else try {
var i = function() {
for (var t = [], r = 0; r < arguments.length; r++) t[r] = arguments[r];
return e.unifiedStats.recordNativeCall(o), n.apply(this, t);
};
i.__nativeCallsTrackerWrapped = !0, Object.defineProperty(t, r, {
value: i,
writable: !0,
enumerable: !0,
configurable: !0
});
} catch (e) {
Gs.warn("Failed to wrap method", {
meta: {
methodName: r,
error: String(e)
}
});
}
}
}

var Ds = Qr("OpportunisticActions");

function Fs() {
return Game.cpu.bucket >= 2e3;
}

var Bs = Qr("CollectionPoint"), Ws = "collectionPoint";

function Vs(e, t) {
var r = Mo.get(e.name, {
namespace: Ws,
ttl: 500
});
if (r) return new RoomPosition(r.x, r.y, e.name);
if (t.collectionPoint) {
var o = t.collectionPoint.x, n = t.collectionPoint.y;
if ("number" == typeof o && "number" == typeof n && !isNaN(o) && !isNaN(n) && o >= 0 && o < 50 && n >= 0 && n < 50) {
var a = new RoomPosition(o, n, e.name);
if (function(e, t) {
var r = e.getTerrain();
if (!function(e, t, r) {
return r.get(t.x, t.y) !== TERRAIN_MASK_WALL && !e.lookForAt(LOOK_STRUCTURES, t.x, t.y).some(function(e) {
return e.structureType !== STRUCTURE_ROAD && e.structureType !== STRUCTURE_CONTAINER && (e.structureType !== STRUCTURE_RAMPART || !e.my);
});
}(e, t, r)) return !1;
var o = e.find(FIND_MY_SPAWNS);
if (0 === o.length) return !1;
var n = t.getRangeTo(o[0].pos);
return !(n < 5 || n > 15);
}(e, a)) return Mo.set(e.name, {
x: o,
y: n
}, {
namespace: Ws,
ttl: 500
}), a;
}
}
var i = function(e) {
var t, r, o, n = e.find(FIND_MY_SPAWNS);
if (0 === n.length) return null;
var a = n[0], i = e.storage, s = e.controller, c = new Map, u = new Map, l = e.find(FIND_STRUCTURES);
try {
for (var m = p(l), d = m.next(); !d.done; d = m.next()) {
var f = d.value, y = "".concat(f.pos.x, ",").concat(f.pos.y);
f.structureType === STRUCTURE_ROAD && c.set(y, !0), f.structureType !== STRUCTURE_ROAD && f.structureType !== STRUCTURE_CONTAINER && (f.structureType !== STRUCTURE_RAMPART || !f.my) && u.set(y, !0);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
d && !d.done && (r = m.return) && r.call(m);
} finally {
if (t) throw t.error;
}
}
for (var h = [], g = e.getTerrain(), v = 5; v <= 15; v++) {
for (var R = a.pos.x, E = a.pos.y, T = -v; T <= v; T++) {
for (var S = -v; S <= v; S++) if (Math.max(Math.abs(T), Math.abs(S)) === v) {
var C = R + T, w = E + S;
if (!(C < 3 || C > 46 || w < 3 || w > 46)) {
var b = new RoomPosition(C, w, e.name);
if (Hs(b, g, u)) {
var x = 0;
if (x -= Math.abs(v - 8), i && (x -= .5 * b.getRangeTo(i.pos)), s && (x -= .3 * b.getRangeTo(s.pos)), 
null !== (o = c.get("".concat(C, ",").concat(w))) && void 0 !== o && o && (x -= 5), 
h.push({
pos: b,
score: x
}), Ks(h.length, v)) break;
}
}
}
if (Ks(h.length, v)) break;
}
if (Ks(h.length, v)) break;
}
return h.sort(function(e, t) {
return t.score - e.score;
}), h.length > 0 ? h[0].pos : null;
}(e);
return i ? (t.collectionPoint = {
x: i.x,
y: i.y
}, Mo.set(e.name, {
x: i.x,
y: i.y
}, {
namespace: Ws,
ttl: 500
}), Bs.info("Calculated new collection point at ".concat(i.x, ",").concat(i.y), e.name)) : (t.collectionPoint = void 0, 
Mo.invalidate(e.name, Ws), Bs.warn("Failed to calculate collection point for room", e.name)), 
i;
}

function Ks(e, t) {
return e >= 50 && t >= 8;
}

function Hs(e, t, r) {
var o;
if (t.get(e.x, e.y) === TERRAIN_MASK_WALL) return !1;
var n = "".concat(e.x, ",").concat(e.y);
return !(null !== (o = r.get(n)) && void 0 !== o && o);
}

var js = Qr("ActionExecutor"), Ys = "#ffaa00", qs = "#ffffff", zs = "#ff0000", Xs = "#00ff00", Qs = "#0000ff";

function $s(e, t, r) {
var o, n;
if (!t || !t.type) return js.warn("".concat(e.name, " received invalid action, clearing state")), 
void delete r.memory.state;
var a = function(e, t) {
if ("idle" === t.type) return t;
var r = function(e, t) {
if (!Fs()) return t;
if (e.store.getFreeCapacity() < 50) return t;
if ("pickup" === t.type || "withdraw" === t.type) return t;
var r = e.pos.findInRange(FIND_DROPPED_RESOURCES, 3, {
filter: function(e) {
return e.resourceType === RESOURCE_ENERGY && e.amount >= 50;
}
});
if (r.length > 0) {
var o = r.reduce(function(t, r) {
return e.pos.getRangeTo(r) < e.pos.getRangeTo(t) ? r : t;
});
if (e.pos.isNearTo(o)) return Ds.debug("".concat(e.name, " opportunistically picking up ").concat(o.amount, " energy at ").concat(o.pos)), 
{
type: "pickup",
target: o
};
}
return t;
}(e, t);
return r.type !== t.type || (r = function(e, t) {
if (!Fs()) return t;
if (0 === e.store.getUsedCapacity(RESOURCE_ENERGY)) return t;
if ("transfer" === t.type) return t;
var r = e.pos.findInRange(FIND_MY_STRUCTURES, 1, {
filter: function(e) {
return e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_EXTENSION ? e.store.getFreeCapacity(RESOURCE_ENERGY) > 0 : e.structureType === STRUCTURE_TOWER && e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
}
});
if (r.length > 0) {
var o = r.sort(function(e, t) {
var r = e.structureType === STRUCTURE_SPAWN ? 3 : e.structureType === STRUCTURE_EXTENSION ? 2 : 1;
return (t.structureType === STRUCTURE_SPAWN ? 3 : t.structureType === STRUCTURE_EXTENSION ? 2 : 1) - r;
})[0];
return Ds.debug("".concat(e.name, " opportunistically transferring to ").concat(o.structureType, " at ").concat(o.pos)), 
{
type: "transfer",
target: o,
resourceType: RESOURCE_ENERGY
};
}
return t;
}(e, r), r.type !== t.type || (r = function(e, t) {
if (!Fs()) return t;
if (0 === e.getActiveBodyparts(WORK)) return t;
if (0 === e.store.getUsedCapacity(RESOURCE_ENERGY)) return t;
if ("repair" === t.type) return t;
var r = e.pos.findInRange(FIND_STRUCTURES, 3, {
filter: function(e) {
return e.hits < .5 * e.hitsMax && e.structureType !== STRUCTURE_WALL && e.structureType !== STRUCTURE_RAMPART;
}
});
if (r.length > 0) {
var o = r.reduce(function(t, r) {
return e.pos.getRangeTo(r) < e.pos.getRangeTo(t) ? r : t;
});
if (e.pos.isNearTo(o) && o.hits < .3 * o.hitsMax) return Ds.debug("".concat(e.name, " opportunistically repairing ").concat(o.structureType, " at ").concat(o.pos, " (").concat(o.hits, "/").concat(o.hitsMax, ")")), 
{
type: "repair",
target: o
};
}
return t;
}(e, r))), r;
}(e, t);
t.type !== a.type && js.debug("".concat(e.name, " opportunistic action: ").concat(t.type, " → ").concat(a.type)), 
"idle" === a.type ? js.warn("".concat(e.name, " (").concat(r.memory.role, ") executing IDLE action")) : js.debug("".concat(e.name, " (").concat(r.memory.role, ") executing ").concat(a.type));
var i = !1;
switch (a.type) {
case "harvest":
i = Js(e, function() {
return e.harvest(a.target);
}, a.target, Ys, a.type);
break;

case "harvestMineral":
i = Js(e, function() {
return e.harvest(a.target);
}, a.target, "#00ff00", a.type);
break;

case "harvestDeposit":
i = Js(e, function() {
return e.harvest(a.target);
}, a.target, "#00ffff", a.type);
break;

case "pickup":
i = Js(e, function() {
return e.pickup(a.target);
}, a.target, Ys, a.type);
break;

case "withdraw":
i = Js(e, function() {
return e.withdraw(a.target, a.resourceType);
}, a.target, Ys, a.type);
break;

case "transfer":
i = Js(e, function() {
return e.transfer(a.target, a.resourceType);
}, a.target, qs, a.type, {
resourceType: a.resourceType
});
break;

case "drop":
e.drop(a.resourceType);
break;

case "build":
i = Js(e, function() {
return e.build(a.target);
}, a.target, "#ffffff", a.type);
break;

case "repair":
i = Js(e, function() {
return e.repair(a.target);
}, a.target, "#ffff00", a.type);
break;

case "upgrade":
i = Js(e, function() {
return e.upgradeController(a.target);
}, a.target, qs, a.type);
break;

case "dismantle":
i = Js(e, function() {
return e.dismantle(a.target);
}, a.target, zs, a.type);
break;

case "attack":
Js(e, function() {
return e.attack(a.target);
}, a.target, zs, a.type);
break;

case "rangedAttack":
Js(e, function() {
return e.rangedAttack(a.target);
}, a.target, zs, a.type);
break;

case "heal":
Js(e, function() {
return e.heal(a.target);
}, a.target, Xs, a.type);
break;

case "rangedHeal":
e.rangedHeal(a.target), Oa.moveTo(e, a.target, {
visualizePathStyle: {
stroke: Xs
}
}) === ERR_NO_PATH && (i = !0);
break;

case "claim":
Js(e, function() {
return e.claimController(a.target);
}, a.target, Xs, a.type);
break;

case "reserve":
Js(e, function() {
return e.reserveController(a.target);
}, a.target, Xs, a.type);
break;

case "attackController":
Js(e, function() {
return e.attackController(a.target);
}, a.target, zs, a.type);
break;

case "moveTo":
Oa.moveTo(e, a.target, {
visualizePathStyle: {
stroke: Qs
}
}) === ERR_NO_PATH && (i = !0);
break;

case "moveToRoom":
var s = new RoomPosition(25, 25, a.roomName);
Oa.moveTo(e, {
pos: s,
range: 20
}, {
visualizePathStyle: {
stroke: Qs
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
Oa.moveTo(e, c, {
flee: !0
}) === ERR_NO_PATH && (i = !0);
break;

case "wait":
if (Oa.isExit(e.pos)) {
var u = new RoomPosition(25, 25, e.pos.roomName);
Oa.moveTo(e, u, {
priority: 2
});
break;
}
e.pos.isEqualTo(a.position) || Oa.moveTo(e, a.position) === ERR_NO_PATH && (i = !0);
break;

case "requestMove":
Oa.moveTo(e, a.target, {
visualizePathStyle: {
stroke: Qs
},
priority: 5
}) === ERR_NO_PATH && (i = !0);
break;

case "idle":
if (Oa.isExit(e.pos)) {
u = new RoomPosition(25, 25, e.pos.roomName), Oa.moveTo(e, u, {
priority: 2
});
break;
}
var l = Game.rooms[e.pos.roomName];
if (l && (null === (o = l.controller) || void 0 === o ? void 0 : o.my)) {
var m = Vs(l, Cn.getOrInitSwarmState(l.name));
if (m && !e.pos.isEqualTo(m)) {
Oa.moveTo(e, m, {
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
p && Oa.moveTo(e, {
pos: p.pos,
range: 3
}, {
flee: !0,
priority: 2
});
}
i && (delete r.memory.state, Oa.clearCachedPath(e), zo(e)), function(e) {
var t = 0 === e.creep.store.getUsedCapacity(), r = 0 === e.creep.store.getFreeCapacity();
void 0 === e.memory.working && (e.memory.working = !t), t && (e.memory.working = !1), 
r && (e.memory.working = !0);
}(r);
}

function Js(e, t, r, o, n, a) {
var i = t();
if (i === ERR_NOT_IN_RANGE) {
var s = Oa.moveTo(e, r, {
visualizePathStyle: {
stroke: o
}
});
return s !== OK && js.info("Movement attempt returned non-OK result", {
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
var n, a, i;
switch (u.initializeMetrics(e.memory), t) {
case "harvest":
case "harvestMineral":
case "harvestDeposit":
var s = 2 * (v = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length);
u.recordHarvest(e.memory, s);
break;

case "transfer":
var c = null !== (n = null == o ? void 0 : o.resourceType) && void 0 !== n ? n : RESOURCE_ENERGY, l = Math.min(e.store.getUsedCapacity(c), null !== (i = null === (a = r.store) || void 0 === a ? void 0 : a.getFreeCapacity(c)) && void 0 !== i ? i : 0);
l > 0 && u.recordTransfer(e.memory, l);
break;

case "build":
var m = 5 * (v = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length);
u.recordBuild(e.memory, m);
break;

case "repair":
var p = 100 * (v = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length);
u.recordRepair(e.memory, p);
break;

case "attack":
var d = 30 * e.body.filter(function(e) {
return e.type === ATTACK && e.hits > 0;
}).length;
u.recordDamage(e.memory, d);
break;

case "rangedAttack":
var f = e.body.filter(function(e) {
return e.type === RANGED_ATTACK && e.hits > 0;
}).length, y = e.pos.getRangeTo(r);
d = 0, y <= 1 ? d = 10 * f : y <= 2 ? d = 4 * f : y <= 3 && (d = 1 * f), u.recordDamage(e.memory, d);
break;

case "heal":
case "rangedHeal":
var h = e.body.filter(function(e) {
return e.type === HEAL && e.hits > 0;
}).length, g = "heal" === t ? 12 * h : 4 * h;
u.recordHealing(e.memory, g);
break;

case "upgrade":
var v = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
u.recordUpgrade(e.memory, v);
}
}(e, n, r, a), (i === ERR_FULL || i === ERR_NOT_ENOUGH_RESOURCES || i === ERR_INVALID_TARGET) && (js.info("Clearing state after action error", {
room: e.pos.roomName,
creep: e.name,
meta: {
action: null != n ? n : "rangeAction",
result: i,
target: r.pos.toString()
}
}), !0);
}

function Zs(e) {
var t = 0 === e.creep.store.getUsedCapacity(), r = 0 === e.creep.store.getFreeCapacity();
void 0 === e.memory.working && (e.memory.working = !t);
var o = e.memory.working;
t ? e.memory.working = !1 : r && (e.memory.working = !0);
var n = e.memory.working;
return o !== n && Xo(e.creep), n;
}

function ec(e) {
e.memory.working = !1, Xo(e.creep);
}

var tc = Qr("EnergyCollection");

function rc(e) {
if (e.droppedResources.length > 0) {
var r = qo(e.creep, e.droppedResources, "energy_drop", 5);
if (r) return tc.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting dropped resource at ").concat(r.pos)), 
{
type: "pickup",
target: r
};
}
var o = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (o.length > 0) {
var n = t.findDistributedTarget(e.creep, o, "energy_container");
if (n) return tc.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting container ").concat(n.id, " at ").concat(n.pos, " with ").concat(n.store.getUsedCapacity(RESOURCE_ENERGY), " energy")), 
{
type: "withdraw",
target: n,
resourceType: RESOURCE_ENERGY
};
if (tc.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") found ").concat(o.length, " containers but distribution returned null, falling back to closest")), 
i = e.creep.pos.findClosestByRange(o)) return tc.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") using fallback container ").concat(i.id, " at ").concat(i.pos)), 
{
type: "withdraw",
target: i,
resourceType: RESOURCE_ENERGY
};
}
if (e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return tc.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting storage at ").concat(e.storage.pos)), 
{
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var a = Wo(e.room).filter(function(e) {
return e.energy > 0;
});
if (a.length > 0) {
var i, s = t.findDistributedTarget(e.creep, a, "energy_source");
if (s) return tc.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting source ").concat(s.id, " at ").concat(s.pos)), 
{
type: "harvest",
target: s
};
if (tc.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") found ").concat(a.length, " sources but distribution returned null, falling back to closest")), 
i = e.creep.pos.findClosestByRange(a)) return tc.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") using fallback source ").concat(i.id, " at ").concat(i.pos)), 
{
type: "harvest",
target: i
};
}
return tc.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") findEnergy returning idle - no energy sources available")), 
{
type: "idle"
};
}

function oc(e) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (n = qo(e.creep, t, "deliver_spawn", 5))) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (n = qo(e.creep, r, "deliver_ext", 5))) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var o = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (o.length > 0 && (n = qo(e.creep, o, "deliver_tower", 10))) return {
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
return a.length > 0 && (n = qo(e.creep, a, "deliver_cont", 10)) ? {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
} : null;
}

var nc = Qr("LarvaWorkerBehavior");

function ac(e) {
if (Zs(e)) {
nc.debug("".concat(e.creep.name, " larvaWorker working with ").concat(e.creep.store.getUsedCapacity(RESOURCE_ENERGY), " energy"));
var t = oc(e);
if (t) return nc.debug("".concat(e.creep.name, " larvaWorker delivering via ").concat(t.type)), 
t;
var r = function(e) {
var t, r = Cn.getSwarmState(e.room.name);
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
if (e.prioritizedSites.length > 0) return nc.debug("".concat(e.creep.name, " larvaWorker building site")), 
{
type: "build",
target: e.prioritizedSites[0]
};
if (e.room.controller) return {
type: "upgrade",
target: e.room.controller
};
if (e.isEmpty) return nc.warn("".concat(e.creep.name, " larvaWorker idle (empty, working=true, no targets) - this indicates a bug")), 
{
type: "idle"
};
nc.debug("".concat(e.creep.name, " larvaWorker has energy but no targets, switching to collection mode")), 
ec(e);
}
return rc(e);
}

var ic = Qr("HarvesterBehavior"), sc = Qr("HaulerBehavior"), cc = function() {
function e() {}
return e.prototype.getLabResourceNeeds = function(e) {
var t, r, o, n, a;
if (!Game.rooms[e]) return [];
var i = ks.getConfig(e);
if (!i || !i.isValid) return [];
var s, c = [], u = ks.getInputLabs(e), l = u.input1, m = u.input2;
l && i.activeReaction && (s = null !== (o = l.store[i.activeReaction.input1]) && void 0 !== o ? o : 0) < 1e3 && c.push({
labId: l.id,
resourceType: i.activeReaction.input1,
amount: 2e3 - s,
priority: 10
}), m && i.activeReaction && (s = null !== (n = m.store[i.activeReaction.input2]) && void 0 !== n ? n : 0) < 1e3 && c.push({
labId: m.id,
resourceType: i.activeReaction.input2,
amount: 2e3 - s,
priority: 10
});
var d = ks.getBoostLabs(e), f = function(e) {
var t = i.labs.find(function(t) {
return t.labId === e.id;
});
if (null == t ? void 0 : t.resourceType) {
var r = null !== (a = e.store[t.resourceType]) && void 0 !== a ? a : 0;
r < 1e3 && c.push({
labId: e.id,
resourceType: t.resourceType,
amount: 1500 - r,
priority: 8
});
}
};
try {
for (var y = p(d), h = y.next(); !h.done; h = y.next()) f(h.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
h && !h.done && (r = y.return) && r.call(y);
} finally {
if (t) throw t.error;
}
}
return c;
}, e.prototype.getLabOverflow = function(e) {
var t, r, o, n, a, i;
if (!Game.rooms[e]) return [];
var s = ks.getConfig(e);
if (!s) return [];
var c = [], u = ks.getOutputLabs(e);
try {
for (var l = p(u), m = l.next(); !m.done; m = l.next()) {
var d = (T = m.value).mineralType;
if (d) {
var f = null !== (a = T.store[d]) && void 0 !== a ? a : 0, y = s.activeReaction && d !== s.activeReaction.output;
(f > 2e3 || y && f > 0) && c.push({
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
m && !m.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
var h = ks.getInputLabs(e), g = [ h.input1, h.input2 ].filter(function(e) {
return void 0 !== e;
}), v = function(e) {
var t = e.mineralType;
if (!t) return "continue";
var r = s.labs.find(function(t) {
return t.labId === e.id;
}), o = null == r ? void 0 : r.resourceType;
if (o && t !== o) {
var n = null !== (i = e.store[t]) && void 0 !== i ? i : 0;
n > 0 && c.push({
labId: e.id,
resourceType: t,
amount: n,
priority: 9
});
}
};
try {
for (var R = p(g), E = R.next(); !E.done; E = R.next()) {
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
return c;
}, e.prototype.areLabsReady = function(e, t) {
var r, o, n, a, i = ks.getConfig(e);
if (!i || !i.isValid) return !1;
var s = ks.getInputLabs(e), c = s.input1, u = s.input2;
if (!c || !u) return !1;
if ((null !== (n = c.store[t.input1]) && void 0 !== n ? n : 0) < 500) return !1;
if ((null !== (a = u.store[t.input2]) && void 0 !== a ? a : 0) < 500) return !1;
var l = ks.getOutputLabs(e);
if (0 === l.length) return !1;
try {
for (var m = p(l), d = m.next(); !d.done; d = m.next()) {
var f = d.value.store.getFreeCapacity();
if (null === f || f < 100) return !1;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
return !0;
}, e.prototype.clearReactions = function(e) {
ks.clearActiveReaction(e), $r.info("Cleared active reactions in ".concat(e), {
subsystem: "Labs"
});
}, e.prototype.setActiveReaction = function(e, t, r, o) {
var n = ks.setActiveReaction(e, t, r, o);
return n && $r.info("Set active reaction: ".concat(t, " + ").concat(r, " -> ").concat(o), {
subsystem: "Labs",
room: e
}), n;
}, e.prototype.runReactions = function(e) {
return ks.runReactions(e);
}, e.prototype.hasAvailableBoostLabs = function(e) {
return ks.getBoostLabs(e).length > 0;
}, e.prototype.prepareBoostLab = function(e, t) {
var r, o, n, a, i, s = ks.getConfig(e);
if (!s) return null;
var c = ks.getBoostLabs(e);
try {
for (var u = p(c), l = u.next(); !l.done; l = u.next()) if ((y = l.value).mineralType === t && (null !== (i = y.store[t]) && void 0 !== i ? i : 0) >= 30) return y.id;
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
var m = function(e) {
if (!e.mineralType) {
var r = s.labs.find(function(t) {
return t.labId === e.id;
});
return r && (r.resourceType = t, s.lastUpdate = Game.time), {
value: e.id
};
}
};
try {
for (var d = p(c), f = d.next(); !f.done; f = d.next()) {
var y, h = m(y = f.value);
if ("object" == typeof h) return h.value;
}
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (a = d.return) && a.call(d);
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
}), a = 0;
try {
for (var i = p(n), s = i.next(); !s.done; s = i.next()) {
var c = s.value;
this.handleUnboost(c, o) && a++;
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
return a;
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
for (var a = p(n), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.store.getFreeCapacity();
if (null !== c && c >= 50) {
if (!e.pos.isNearTo(s)) return e.moveTo(s), !1;
if (s.unboostCreep(e) === OK) return $r.info("Unboosted ".concat(e.name, ", recovered resources"), {
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
i && !i.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
return !1;
}, e.prototype.getLabTaskStatus = function(e) {
var t = ks.getConfig(e);
return t && t.isValid ? t.activeReaction ? "reacting" : this.getLabResourceNeeds(e).length > 0 ? "loading" : this.getLabOverflow(e).length > 0 ? "unloading" : "idle" : "idle";
}, e.prototype.initialize = function(e) {
ks.initialize(e), ks.loadFromMemory(e);
}, e.prototype.save = function(e) {
ks.saveToMemory(e);
}, e;
}(), uc = new cc, lc = {
larvaWorker: ac,
harvester: function(e) {
var t, r, o = (r = Ua((t = e.creep).room).harvesterToSource.get(t.id)) ? Game.getObjectById(r) : null;
if (o || (o = e.assignedSource), o || (o = function(e) {
var t, r, o, n, a, i, s = Wo(e.room);
if (0 === s.length) return null;
var c, u = "sourceCounts_".concat(e.room.name), l = "sourceCounts_tick_".concat(e.room.name), m = global, d = m[u], f = m[l];
if (d && f === Game.time) c = d; else {
c = new Map;
try {
for (var y = p(s), h = y.next(); !h.done; h = y.next()) {
var g = h.value;
c.set(g.id, 0);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
h && !h.done && (r = y.return) && r.call(y);
} finally {
if (t) throw t.error;
}
}
for (var v in Game.creeps) {
var R = Game.creeps[v].memory;
"harvester" === R.role && R.sourceId && c.has(R.sourceId) && c.set(R.sourceId, (null !== (a = c.get(R.sourceId)) && void 0 !== a ? a : 0) + 1);
}
m[u] = c, m[l] = Game.time;
}
var E = null, T = 1 / 0;
try {
for (var S = p(s), C = S.next(); !C.done; C = S.next()) {
g = C.value;
var w = null !== (i = c.get(g.id)) && void 0 !== i ? i : 0;
w < T && (T = w, E = g);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
C && !C.done && (n = S.return) && n.call(S);
} finally {
if (o) throw o.error;
}
}
return E && (e.memory.sourceId = E.id), E;
}(e), ic.debug("".concat(e.creep.name, " harvester assigned to source ").concat(null == o ? void 0 : o.id))), 
!o) return ic.warn("".concat(e.creep.name, " harvester has no source to harvest")), 
{
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
var i = function(e) {
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
if (i) return ic.debug("".concat(e.creep.name, " harvester transferring to container ").concat(i.id)), 
{
type: "transfer",
target: i,
resourceType: RESOURCE_ENERGY
};
var s = function(e) {
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
return s ? (ic.debug("".concat(e.creep.name, " harvester transferring to link ").concat(s.id)), 
{
type: "transfer",
target: s,
resourceType: RESOURCE_ENERGY
}) : (ic.debug("".concat(e.creep.name, " harvester dropping energy on ground")), 
{
type: "drop",
resourceType: RESOURCE_ENERGY
});
},
hauler: function(e) {
var r, o = Zs(e);
if (sc.debug("".concat(e.creep.name, " hauler state: working=").concat(o, ", energy=").concat(e.creep.store.getUsedCapacity(RESOURCE_ENERGY), "/").concat(e.creep.store.getCapacity())), 
o) {
var n = Object.keys(e.creep.store)[0];
if (0 === e.creep.store.getUsedCapacity(RESOURCE_ENERGY) && n && n !== RESOURCE_ENERGY) {
var a = null !== (r = e.terminal) && void 0 !== r ? r : e.storage;
if (a) return {
type: "transfer",
target: a,
resourceType: n
};
}
var i = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (i.length > 0 && (u = qo(e.creep, i, "hauler_spawn", 10))) return sc.debug("".concat(e.creep.name, " hauler delivering to spawn ").concat(u.id)), 
{
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
var s = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (s.length > 0 && (u = qo(e.creep, s, "hauler_ext", 10))) return {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
var c = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (c.length > 0 && (u = qo(e.creep, c, "hauler_tower", 15))) return {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
if (e.storage && e.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) return {
type: "transfer",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var u, l = e.depositContainers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (l.length > 0 && (u = qo(e.creep, l, "hauler_cont", 15))) return {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
if (e.isEmpty) return sc.warn("".concat(e.creep.name, " hauler idle (empty, working=true, no targets)")), 
{
type: "idle"
};
sc.debug("".concat(e.creep.name, " hauler has energy but no targets, switching to collection mode")), 
ec(e);
}
if (e.droppedResources.length > 0 && (u = qo(e.creep, e.droppedResources, "hauler_drop", 5))) return {
type: "pickup",
target: u
};
var m = e.tombstones.filter(function(e) {
return e.store.getUsedCapacity() > 0;
});
if (m.length > 0) {
var p = qo(e.creep, m, "hauler_tomb", 10);
if (p) {
if (p.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return {
type: "withdraw",
target: p,
resourceType: RESOURCE_ENERGY
};
var d = Object.keys(p.store).find(function(e) {
return e !== RESOURCE_ENERGY && p.store.getUsedCapacity(e) > 0;
});
if (d) return {
type: "withdraw",
target: p,
resourceType: d
};
}
}
var f = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (f.length > 0) {
var y = t.findDistributedTarget(e.creep, f, "energy_container");
if (y) return sc.debug("".concat(e.creep.name, " hauler withdrawing from container ").concat(y.id, " with ").concat(y.store.getUsedCapacity(RESOURCE_ENERGY), " energy")), 
{
type: "withdraw",
target: y,
resourceType: RESOURCE_ENERGY
};
sc.warn("".concat(e.creep.name, " hauler found ").concat(f.length, " containers but distribution returned null, falling back to closest"));
var h = e.creep.pos.findClosestByRange(f);
if (h) return sc.debug("".concat(e.creep.name, " hauler using fallback container ").concat(h.id)), 
{
type: "withdraw",
target: h,
resourceType: RESOURCE_ENERGY
};
}
if (e.mineralContainers.length > 0) {
var g = t.findDistributedTarget(e.creep, e.mineralContainers, "mineral_container");
if (g) {
if (v = Object.keys(g.store).find(function(e) {
return e !== RESOURCE_ENERGY && g.store.getUsedCapacity(e) > 0;
})) return {
type: "withdraw",
target: g,
resourceType: v
};
} else {
sc.warn("".concat(e.creep.name, " hauler found ").concat(e.mineralContainers.length, " mineral containers but distribution returned null, falling back to closest"));
var v, R = e.creep.pos.findClosestByRange(e.mineralContainers);
if (R && (v = Object.keys(R.store).find(function(e) {
return e !== RESOURCE_ENERGY && R.store.getUsedCapacity(e) > 0;
}))) return sc.debug("".concat(e.creep.name, " hauler using fallback mineral container ").concat(R.id)), 
{
type: "withdraw",
target: R,
resourceType: v
};
}
}
return e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0 ? (sc.debug("".concat(e.creep.name, " hauler withdrawing from storage")), 
{
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
}) : (sc.warn("".concat(e.creep.name, " hauler idle (no energy sources found)")), 
{
type: "idle"
});
},
builder: function(e) {
var t, r;
if (Zs(e)) {
var o = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (o.length > 0 && (a = qo(e.creep, o, "builder_spawn", 5))) return {
type: "transfer",
target: a,
resourceType: RESOURCE_ENERGY
};
var n = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (n.length > 0 && (a = qo(e.creep, n, "builder_ext", 5))) return {
type: "transfer",
target: a,
resourceType: RESOURCE_ENERGY
};
var a, i = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (i.length > 0 && (a = qo(e.creep, i, "builder_tower", 10))) return {
type: "transfer",
target: a,
resourceType: RESOURCE_ENERGY
};
var s = (r = Ua((t = e.creep).room).builderToTarget.get(t.id)) ? Game.getObjectById(r) : null;
return s ? {
type: "build",
target: s
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
return rc(e);
},
upgrader: function(e) {
if (Zs(e)) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (l = qo(e.creep, t, "upgrader_spawn", 5))) return {
type: "transfer",
target: l,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (l = qo(e.creep, r, "upgrader_ext", 5))) return {
type: "transfer",
target: l,
resourceType: RESOURCE_ENERGY
};
var o = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
return o.length > 0 && (l = qo(e.creep, o, "upgrader_tower", 10)) ? {
type: "transfer",
target: l,
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
var i = "upgrader_nearby_containers", s = e.creep.memory, c = s[i], u = [];
if (c && Game.time - c.tick < 30 ? u = c.ids.map(function(e) {
return Game.getObjectById(e);
}).filter(function(e) {
return null !== e;
}) : (u = e.creep.pos.findInRange(FIND_STRUCTURES, 3, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(RESOURCE_ENERGY) > 50;
}
}), s[i] = {
ids: u.map(function(e) {
return e.id;
}),
tick: Game.time
}), u.length > 0 && (l = qo(e.creep, u, "upgrader_nearby", 30))) return {
type: "withdraw",
target: l,
resourceType: RESOURCE_ENERGY
};
if (e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1e3) return {
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var l, m = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (m.length > 0 && (l = qo(e.creep, m, "upgrader_cont", 30))) return {
type: "withdraw",
target: l,
resourceType: RESOURCE_ENERGY
};
var p = Wo(e.room).filter(function(e) {
return e.energy > 0;
});
if (p.length > 0) {
var d = qo(e.creep, p, "upgrader_source", 30);
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
return Zs(e) ? oc(e) || (e.storage ? {
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
var t, r = Bo(e.room, FIND_MINERALS)[0];
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
var r = Bo(e.room, FIND_DEPOSITS);
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
var t, r, o, n, a, i, s, c, u, l;
if (0 === e.labs.length) return {
type: "idle"
};
var m = e.labs.slice(0, 2), d = e.labs.slice(2);
if (e.creep.store.getUsedCapacity() > 0) {
var f = Object.keys(e.creep.store)[0], y = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
if (f !== RESOURCE_ENERGY && !y.includes(f)) {
var h = null !== (u = e.terminal) && void 0 !== u ? u : e.storage;
if (h) return {
type: "transfer",
target: h,
resourceType: f
};
}
try {
for (var g = p(m), v = g.next(); !v.done; v = g.next()) {
var R = (O = v.value).store.getFreeCapacity(f);
if (null !== R && R > 0) return {
type: "transfer",
target: O,
resourceType: f
};
}
} catch (e) {
t = {
error: e
};
} finally {
try {
v && !v.done && (r = g.return) && r.call(g);
} finally {
if (t) throw t.error;
}
}
}
try {
for (var E = p(d), T = E.next(); !T.done; T = E.next()) {
var S = (O = T.value).mineralType;
if (S && O.store.getUsedCapacity(S) > 100) return {
type: "withdraw",
target: O,
resourceType: S
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
var C = null !== (l = e.terminal) && void 0 !== l ? l : e.storage;
if (C) {
var w = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
try {
for (var b = p(m), x = b.next(); !x.done; x = b.next()) {
var O = x.value;
try {
for (var _ = (s = void 0, p(w)), A = _.next(); !A.done; A = _.next()) {
var U = A.value;
if (C.store.getUsedCapacity(U) > 0 && O.store.getFreeCapacity(U) > 0) return {
type: "withdraw",
target: C,
resourceType: U
};
}
} catch (e) {
s = {
error: e
};
} finally {
try {
A && !A.done && (c = _.return) && c.call(_);
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
x && !x.done && (i = b.return) && i.call(b);
} finally {
if (a) throw a.error;
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
return o !== n && (Xo(e.creep), delete e.memory.targetId), n;
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
var n = uc.getLabResourceNeeds(e.room.name);
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
var t, r = uc.getLabOverflow(e.room.name);
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
var a = uc.getLabResourceNeeds(e.room.name);
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
var t, r, o, n, a;
if (!e.factory) return {
type: "idle"
};
if (Zs(e)) {
var i = Object.keys(e.creep.store)[0];
return {
type: "transfer",
target: e.factory,
resourceType: i
};
}
var s = null !== (a = e.terminal) && void 0 !== a ? a : e.storage;
if (!s) return {
type: "idle"
};
var c = [ RESOURCE_UTRIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_KEANIUM_BAR, RESOURCE_ZYNTHIUM_BAR, RESOURCE_GHODIUM_MELT, RESOURCE_OXIDANT, RESOURCE_REDUCTANT, RESOURCE_PURIFIER, RESOURCE_BATTERY ];
try {
for (var u = p(c), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
if (e.factory.store.getUsedCapacity(m) > 100) return {
type: "withdraw",
target: e.factory,
resourceType: m
};
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
if (e.factory.store.getUsedCapacity(RESOURCE_ENERGY) < 5e3 && s.store.getUsedCapacity(RESOURCE_ENERGY) > 1e4) return {
type: "withdraw",
target: s,
resourceType: RESOURCE_ENERGY
};
var d = [ RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_OXYGEN, RESOURCE_HYDROGEN, RESOURCE_CATALYST, RESOURCE_GHODIUM ];
try {
for (var f = p(d), y = f.next(); !y.done; y = f.next()) {
var h = y.value;
if (e.factory.store.getUsedCapacity(h) < 1e3 && s.store.getUsedCapacity(h) > 500) return {
type: "withdraw",
target: s,
resourceType: h
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
var t = Wo(e.room);
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
var t = Zs(e), r = e.memory.targetRoom, o = e.memory.homeRoom;
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
if (a.length > 0 && (p = qo(e.creep, a, "remoteHauler_spawn", 5))) return {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
};
var i = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (i.length > 0 && (p = qo(e.creep, i, "remoteHauler_ext", 5))) return {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
};
var s = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (s.length > 0 && (p = qo(e.creep, s, "remoteHauler_tower", 10))) return {
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
return c.length > 0 && (p = qo(e.creep, c, "remoteHauler_cont", 10)) ? {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
} : e.isEmpty || e.room.name !== o ? {
type: "idle"
} : (ec(e), {
type: "moveToRoom",
roomName: r
});
}
if (e.room.name !== r) return {
type: "moveToRoom",
roomName: r
};
var u = .3 * e.creep.store.getCapacity(RESOURCE_ENERGY), l = Bo(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(RESOURCE_ENERGY) >= u;
},
filterKey: "remoteContainers"
});
if (l.length > 0 && (p = qo(e.creep, l, "remoteHauler_remoteCont", 10))) return {
type: "withdraw",
target: p,
resourceType: RESOURCE_ENERGY
};
var m = Ho(e.room, RESOURCE_ENERGY).filter(function(e) {
return e.amount > 50;
});
if (m.length > 0 && (p = qo(e.creep, m, "remoteHauler_remoteDrop", 3))) return {
type: "pickup",
target: p
};
if (0 === l.length) {
var p, d = Bo(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
},
filterKey: "containers"
});
if (d.length > 0 && (p = qo(e.creep, d, "remoteHauler_waitCont", 20)) && e.creep.pos.getRangeTo(p) > 2) return {
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
if ((s = Bo(i, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getFreeCapacity(a) > 0;
},
filterKey: "container_".concat(a)
})).length > 0 && (c = qo(e.creep, s, "interRoomCarrier_targetCont", 10))) return {
type: "transfer",
target: c,
resourceType: a
};
var u = Vo(i, STRUCTURE_SPAWN);
return u.length > 0 ? e.creep.pos.isNearTo(u[0]) ? {
type: "drop",
resourceType: a
} : {
type: "moveTo",
target: u[0].pos
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
} : (s = Bo(i, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(a) > 0;
},
filterKey: "container_".concat(a)
})).length > 0 && (c = qo(e.creep, s, "interRoomCarrier_sourceCont", 10)) ? {
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

function mc(e) {
var t;
return (null !== (t = lc[e.memory.role]) && void 0 !== t ? t : ac)(e);
}

var pc = Qr("MilitaryBehaviors"), dc = "patrol";

function fc(e) {
var t, r, o = e.find(FIND_MY_SPAWNS), n = o.length, a = e.name, i = Mo.get(a, {
namespace: dc
});
if (i && i.metadata.spawnCount === n) return i.waypoints.map(function(e) {
return new RoomPosition(e.x, e.y, e.roomName);
});
var s = e.name, c = [];
try {
for (var u = p(o), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
c.push(new RoomPosition(m.pos.x + 3, m.pos.y + 3, s)), c.push(new RoomPosition(m.pos.x - 3, m.pos.y - 3, s));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
c.push(new RoomPosition(10, 5, s)), c.push(new RoomPosition(25, 5, s)), c.push(new RoomPosition(39, 5, s)), 
c.push(new RoomPosition(10, 44, s)), c.push(new RoomPosition(25, 44, s)), c.push(new RoomPosition(39, 44, s)), 
c.push(new RoomPosition(5, 10, s)), c.push(new RoomPosition(5, 25, s)), c.push(new RoomPosition(5, 39, s)), 
c.push(new RoomPosition(44, 10, s)), c.push(new RoomPosition(44, 25, s)), c.push(new RoomPosition(44, 39, s)), 
c.push(new RoomPosition(10, 10, s)), c.push(new RoomPosition(39, 10, s)), c.push(new RoomPosition(10, 39, s)), 
c.push(new RoomPosition(39, 39, s)), c.push(new RoomPosition(25, 25, s));
var d = c.map(function(e) {
return {
x: Math.max(2, Math.min(47, e.x)),
y: Math.max(2, Math.min(47, e.y)),
roomName: s
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
return Mo.set(a, f, {
namespace: dc,
ttl: 1e3
}), d;
}

function yc(e, t) {
var r;
if (0 === t.length) return null;
var o = e.memory;
void 0 === o.patrolIndex && (o.patrolIndex = 0);
var n = t[o.patrolIndex % t.length];
return n && e.pos.getRangeTo(n) <= 2 && (o.patrolIndex = (o.patrolIndex + 1) % t.length), 
null !== (r = t[o.patrolIndex % t.length]) && void 0 !== r ? r : null;
}

function hc(e) {
var t, r;
if (0 === e.hostiles.length) return null;
var o = e.hostiles.map(function(e) {
var t, r, o = 0;
if (o += 100 * e.getActiveBodyparts(HEAL), o += 50 * e.getActiveBodyparts(RANGED_ATTACK), 
o += 40 * e.getActiveBodyparts(ATTACK), o += 60 * e.getActiveBodyparts(CLAIM), (o += 30 * e.getActiveBodyparts(WORK)) > 0) try {
for (var n = p(e.body), a = n.next(); !a.done; a = n.next()) if (a.value.boost) {
o += 20;
break;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = n.return) && r.call(n);
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

function gc(e, t) {
return e.getActiveBodyparts(t) > 0;
}

function vc(e, t) {
if (!e.swarmState) return null;
var r = Vs(e.room, e.swarmState);
return r && e.creep.pos.getRangeTo(r) > 2 ? (pc.debug("".concat(e.creep.name, " ").concat(t, " moving to collection point at ").concat(r.x, ",").concat(r.y)), 
{
type: "moveTo",
target: r
}) : null;
}

function Rc(e) {
var t;
return null === (t = Memory.squads) || void 0 === t ? void 0 : t[e];
}

function Ec(e) {
var t = e.creep.memory;
if (o.checkAndExecuteRetreat(e.creep)) return {
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
var r = hc(e);
if (r) {
var n = e.creep.pos.getRangeTo(r), a = gc(e.creep, RANGED_ATTACK), i = gc(e.creep, ATTACK);
return a && n <= 3 ? {
type: "rangedAttack",
target: r
} : i && n <= 1 ? {
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
var s = hc(e);
if (s) return n = e.creep.pos.getRangeTo(s), a = gc(e.creep, RANGED_ATTACK), i = gc(e.creep, ATTACK), 
a && n <= 3 ? {
type: "rangedAttack",
target: s
} : i && n <= 1 ? {
type: "attack",
target: s
} : {
type: "moveTo",
target: s
};
var c = fc(e.room), u = yc(e.creep, c);
if (u) return {
type: "moveTo",
target: u
};
var l = e.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
return l && e.creep.pos.getRangeTo(l) > 5 ? {
type: "moveTo",
target: l
} : {
type: "idle"
};
}

function Tc(e) {
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
var u = qo(e.creep, c, "healer_follow", 5);
if (u) return {
type: "moveTo",
target: u
};
}
var l = fc(e.room), m = yc(e.creep, l);
return m ? {
type: "moveTo",
target: m
} : {
type: "idle"
};
}

function Sc(e) {
var r;
if (e.memory.squadId) {
var o = Rc(e.memory.squadId);
if (o) return bc(e, o);
}
if (e.creep.hits / e.creep.hitsMax < .3) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var n = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
return n.length > 0 && e.creep.pos.getRangeTo(n[0]) > 3 ? {
type: "moveTo",
target: n[0]
} : {
type: "idle"
};
}
var a = null !== (r = e.memory.targetRoom) && void 0 !== r ? r : e.homeRoom;
if (e.room.name !== a) return {
type: "moveToRoom",
roomName: a
};
var i = hc(e);
if (i) {
var s = e.creep.pos.getRangeTo(i), c = gc(e.creep, RANGED_ATTACK), u = gc(e.creep, ATTACK);
return c && s <= 3 ? {
type: "rangedAttack",
target: i
} : u && s <= 1 ? {
type: "attack",
target: i
} : {
type: "moveTo",
target: i
};
}
var l = t.safeFindClosestByRange(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
if (l) return {
type: "attack",
target: l
};
var m = fc(e.room), p = yc(e.creep, m);
if (p) return {
type: "moveTo",
target: p
};
var d = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (d.length > 0) {
var f = qo(e.creep, d, "soldier_spawn", 20);
if (f && e.creep.pos.getRangeTo(f) > 5) return {
type: "moveTo",
target: f
};
}
return {
type: "idle"
};
}

function Cc(e) {
var r;
if (e.memory.squadId) {
var o = Rc(e.memory.squadId);
if (o) return bc(e, o);
}
if (e.creep.hits / e.creep.hitsMax < .3) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var n = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
return n.length > 0 && e.creep.pos.getRangeTo(n[0]) > 3 ? {
type: "moveTo",
target: n[0]
} : {
type: "idle"
};
}
var a = null !== (r = e.memory.targetRoom) && void 0 !== r ? r : e.homeRoom;
if (e.room.name !== a) return {
type: "moveToRoom",
roomName: a
};
var i = t.safeFindClosestByRange(e.creep.pos, FIND_HOSTILE_SPAWNS);
if (i) return {
type: "dismantle",
target: i
};
var s = t.safeFindClosestByRange(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER;
}
});
if (s) return {
type: "dismantle",
target: s
};
var c = e.room.find(FIND_STRUCTURES, {
filter: function(t) {
var r;
return t.structureType === STRUCTURE_WALL ? t.hits < 1e5 && !(null === (r = e.room.controller) || void 0 === r ? void 0 : r.my) : t.structureType === STRUCTURE_RAMPART && t.hits < 1e5 && !t.my;
}
});
if (c.length > 0) {
var u = qo(e.creep, c, "siege_wall", 10);
if (u) return {
type: "dismantle",
target: u
};
}
var l = t.safeFindClosestByRange(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
if (l) return {
type: "dismantle",
target: l
};
var m = vc(e, "siegeUnit");
if (m) return m;
var p = fc(e.room), d = yc(e.creep, p);
return d ? {
type: "moveTo",
target: d
} : {
type: "idle"
};
}

function wc(e) {
var t = e.creep.memory;
if (o.checkAndExecuteRetreat(e.creep)) return {
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
var n = Game.rooms[t.assistTarget];
if (!n) return {
type: "moveToRoom",
roomName: t.assistTarget
};
if (0 === n.find(FIND_HOSTILE_CREEPS).length) return delete t.assistTarget, {
type: "idle"
};
if (e.creep.room.name !== t.assistTarget) return {
type: "moveToRoom",
roomName: t.assistTarget
};
var a = hc(e);
if (a) return (s = e.creep.pos.getRangeTo(a)) < 3 ? {
type: "flee",
from: [ a.pos ]
} : s <= 3 ? {
type: "rangedAttack",
target: a
} : {
type: "moveTo",
target: a
};
}
if (e.memory.squadId) {
var i = Rc(e.memory.squadId);
if (i) return bc(e, i);
}
var s, c = hc(e);
if (c) return (s = e.creep.pos.getRangeTo(c)) < 3 ? {
type: "flee",
from: [ c.pos ]
} : s <= 3 ? {
type: "rangedAttack",
target: c
} : {
type: "moveTo",
target: c
};
var u = fc(e.room), l = yc(e.creep, u);
if (l) return {
type: "moveTo",
target: l
};
var m = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (m.length > 0) {
var p = qo(e.creep, m, "harasser_home_spawn", 20);
if (p && e.creep.pos.getRangeTo(p) > 10) return {
type: "moveTo",
target: p
};
}
return {
type: "idle"
};
}

function bc(e, t) {
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
return Sc(e);

case "healer":
return Tc(e);

case "siegeUnit":
return Cc(e);

case "ranger":
return wc(e);
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

var xc = {
guard: Ec,
remoteGuard: function(e) {
var t = e.creep.memory;
if (!t.targetRoom) {
if (e.creep.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = fc(e.room);
return (o = yc(e.creep, r)) ? {
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
} : (r = fc(e.room), (o = yc(e.creep, r)) ? {
type: "moveTo",
target: o
} : {
type: "idle"
});
var a = function(e, t) {
var r, o;
if (0 === t.length) return null;
var n = [ t.filter(function(e) {
return e.body.some(function(e) {
return e.boost;
});
}), t.filter(function(e) {
return gc(e, HEAL);
}), t.filter(function(e) {
return gc(e, RANGED_ATTACK);
}), t.filter(function(e) {
return gc(e, ATTACK);
}), t ];
try {
for (var a = p(n), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
if (s.length > 0) return e.creep.pos.findClosestByRange(s);
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
return null;
}(e, n);
if (a) {
var i = e.creep.pos.getRangeTo(a), s = gc(e.creep, RANGED_ATTACK), c = gc(e.creep, ATTACK);
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
var u = e.room.find(FIND_SOURCES);
if (u.length > 0) {
var l = e.creep.pos.findClosestByRange(u);
if (l && e.creep.pos.getRangeTo(l) > 3) return {
type: "moveTo",
target: l
};
}
return {
type: "idle"
};
},
healer: Tc,
soldier: Sc,
siegeUnit: Cc,
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
if (!t) return vc(e, "harasser (no target)") || {
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
var s = vc(e, "harasser (no targets)");
if (s) return s;
var c = fc(e.room), u = yc(e.creep, c);
return u ? {
type: "moveTo",
target: u
} : {
type: "idle"
};
},
ranger: wc
};

function Oc(e) {
var t;
return (null !== (t = xc[e.memory.role]) && void 0 !== t ? t : Ec)(e);
}

function _c(e, r) {
var o, n, a, i, s, c, u, l = r.knownRooms, m = l[e.name], p = null !== (o = null == m ? void 0 : m.lastSeen) && void 0 !== o ? o : 0, d = Game.time - p;
if (m && d < 2e3) {
m.lastSeen = Game.time;
var f = t.safeFind(e, FIND_HOSTILE_CREEPS);
return m.threatLevel = f.length > 5 ? 3 : f.length > 2 ? 2 : f.length > 0 ? 1 : 0, 
void (e.controller && (m.controllerLevel = null !== (n = e.controller.level) && void 0 !== n ? n : 0, 
(null === (a = e.controller.owner) || void 0 === a ? void 0 : a.username) && (m.owner = e.controller.owner.username), 
(null === (i = e.controller.reservation) || void 0 === i ? void 0 : i.username) && (m.reserver = e.controller.reservation.username)));
}
for (var y = e.find(FIND_SOURCES), h = e.find(FIND_MINERALS)[0], g = e.controller, v = t.safeFind(e, FIND_HOSTILE_CREEPS), R = e.getTerrain(), E = 0, T = 0, S = 5; S < 50; S += 10) for (var C = 5; C < 50; C += 10) {
var w = R.get(S, C);
w === TERRAIN_MASK_SWAMP ? E++ : 0 === w && T++;
}
var b = E > 2 * T ? "swamp" : T > 2 * E ? "plains" : "mixed", x = e.name.match(/^[WE](\d+)[NS](\d+)$/), O = !!x && (parseInt(x[1], 10) % 10 == 0 || parseInt(x[2], 10) % 10 == 0), _ = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_KEEPER_LAIR;
}
}).length > 0, A = {
name: e.name,
lastSeen: Game.time,
sources: y.length,
controllerLevel: null !== (s = null == g ? void 0 : g.level) && void 0 !== s ? s : 0,
threatLevel: v.length > 5 ? 3 : v.length > 2 ? 2 : v.length > 0 ? 1 : 0,
scouted: !0,
terrain: b,
isHighway: O,
isSK: _
};
(null === (c = null == g ? void 0 : g.owner) || void 0 === c ? void 0 : c.username) && (A.owner = g.owner.username), 
(null === (u = null == g ? void 0 : g.reservation) || void 0 === u ? void 0 : u.username) && (A.reserver = g.reservation.username), 
(null == h ? void 0 : h.mineralType) && (A.mineralType = h.mineralType), l[e.name] = A;
}

function Ac(e) {
return {
type: "moveTo",
target: new RoomPosition(25, 25, e)
};
}

function Uc(e) {
var t = Cn.getEmpire();
if (Oa.isExit(e.creep.pos)) return Ac(e.room.name);
var r = e.memory.lastExploredRoom, o = e.memory.targetRoom;
if (!o) {
if (o = function(e, t, r) {
var o, n, a, i, s, c = t.knownRooms, u = Game.map.describeExits(e);
if (u) {
var l = [];
try {
for (var m = p(Object.entries(u)), f = m.next(); !f.done; f = m.next()) {
var y = d(f.value, 2)[1];
if (!r || y !== r) {
var h = null !== (i = null === (a = c[y]) || void 0 === a ? void 0 : a.lastSeen) && void 0 !== i ? i : 0;
Game.time - h > 1e3 && l.push({
room: y,
lastSeen: h
});
}
}
} catch (e) {
o = {
error: e
};
} finally {
try {
f && !f.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
return l.sort(function(e, t) {
return e.lastSeen - t.lastSeen;
}), null === (s = l[0]) || void 0 === s ? void 0 : s.room;
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
for (var a = p(o), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
if (n.get(s.x, s.y) !== TERRAIN_MASK_WALL) return s;
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
return null;
}(e.room);
return n ? e.creep.pos.getRangeTo(n) <= 3 ? (_c(e.room, t), e.memory.lastExploredRoom = e.room.name, 
delete e.memory.targetRoom, {
type: "idle"
}) : {
type: "moveTo",
target: n
} : (_c(e.room, t), e.memory.lastExploredRoom = e.room.name, delete e.memory.targetRoom, 
{
type: "idle"
});
}
return {
type: "idle"
};
}

var Nc = {
scout: Uc,
claimer: function(e) {
var t = e.memory.targetRoom;
if (!t) {
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (r.length > 0) {
var o = qo(e.creep, r, "claimer_spawn", 20);
if (o) return {
type: "moveTo",
target: o
};
}
return {
type: "idle"
};
}
if (Oa.isExit(e.creep.pos)) return Ac(e.room.name);
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
var n = qo(e.creep, o, "engineer_critical", 5);
if (n) return {
type: "repair",
target: n
};
}
var a = e.repairTargets.filter(function(e) {
return (e.structureType === STRUCTURE_ROAD || e.structureType === STRUCTURE_CONTAINER) && e.hits < .75 * e.hitsMax;
});
if (a.length > 0) {
var i = qo(e.creep, a, "engineer_infra", 5);
if (i) return {
type: "repair",
target: i
};
}
var s = null !== (r = null === (t = e.swarmState) || void 0 === t ? void 0 : t.danger) && void 0 !== r ? r : 0, c = 0 === s ? 1e5 : 1 === s ? 3e5 : 2 === s ? 5e6 : 5e7, u = e.repairTargets.filter(function(e) {
return e.structureType === STRUCTURE_RAMPART && e.hits < c;
});
if (u.length > 0) {
var l = qo(e.creep, u, "engineer_rampart", 5);
if (l) return {
type: "repair",
target: l
};
}
var m = e.repairTargets.filter(function(e) {
return e.structureType === STRUCTURE_WALL && e.hits < c;
});
if (m.length > 0) {
var p = qo(e.creep, m, "engineer_wall", 5);
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
var f = qo(e.creep, d, "engineer_cont", 15);
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
var n = qo(e.creep, o, "remoteWorker_spawn", 5);
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
if (e.creep.store.getUsedCapacity() > 0) return (s = Object.keys(e.creep.store)[0]) === RESOURCE_ENERGY ? o < 5e4 ? {
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
resourceType: s
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
for (var a = p(Object.keys(e.storage.store)), i = a.next(); !i.done; i = a.next()) {
var s;
if ((s = i.value) !== RESOURCE_ENERGY && e.storage.store.getUsedCapacity(s) > 5e3) return {
type: "withdraw",
target: e.storage,
resourceType: s
};
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
return e.creep.pos.getRangeTo(e.storage) > 2 ? {
type: "moveTo",
target: e.storage
} : {
type: "idle"
};
}
};

function Mc(e) {
var t;
return (null !== (t = Nc[e.memory.role]) && void 0 !== t ? t : Uc)(e);
}

function kc(e, t) {
var r = e.effects;
return void 0 !== r && Array.isArray(r) && r.some(function(e) {
return e.effect === t;
});
}

function Pc(e) {
var t = e.memory.targetRoom;
if (!t) return {
type: "idle"
};
if (e.room.name !== t) return {
type: "moveToRoom",
roomName: t
};
var r = Bo(e.room, FIND_STRUCTURES, {
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
var o = Bo(e.room, FIND_MY_CREEPS, {
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

var Ic = {
powerHarvester: Pc,
powerCarrier: function(e) {
var t = e.memory.targetRoom;
if (e.creep.store.getUsedCapacity(RESOURCE_POWER) > 0) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = Game.rooms[e.homeRoom];
if (r) {
var o = Vo(r, STRUCTURE_POWER_SPAWN)[0];
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
var n = Ho(e.room, RESOURCE_POWER)[0];
if (n) return {
type: "pickup",
target: n
};
var a = Bo(e.room, FIND_RUINS, {
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
var i = Bo(e.room, FIND_STRUCTURES, {
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

function Gc(e) {
var t;
return (null !== (t = Ic[e.memory.role]) && void 0 !== t ? t : Pc)(e);
}

var Lc = Qr("StateMachine");

function Dc(e, t) {
var r, o = e.memory.state, n = function(e) {
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
}(o);
if (o && n.valid) if (function(e, t) {
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
}(o, e)) Lc.info("State completed, evaluating new action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: o.action,
role: e.memory.role
}
}), delete e.memory.state; else {
var a = function(e) {
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
}(o);
if (a) return a;
Lc.info("State reconstruction failed, re-evaluating behavior", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: o.action,
role: e.memory.role
}
}), delete e.memory.state;
} else o && (Lc.info("State invalid, re-evaluating behavior", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: l({
action: o.action,
role: e.memory.role,
invalidReason: n.reason
}, n.meta)
}), delete e.memory.state);
var i = t(e);
return i && i.type ? ("idle" !== i.type ? (e.memory.state = function(e) {
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
}(i), Lc.info("Committed new state action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: i.type,
role: e.memory.role,
targetId: null === (r = e.memory.state) || void 0 === r ? void 0 : r.targetId
}
})) : Lc.info("Behavior returned idle action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
role: e.memory.role
}
}), i) : (Lc.warn("Behavior returned invalid action, defaulting to idle", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
role: e.memory.role
}
}), {
type: "idle"
});
}

function Fc(e) {
var r = function(e) {
var t, r, o;
if (!e.room) return null;
var n = e.room, a = null !== (o = e.memory.homeRoom) && void 0 !== o ? o : n.name, i = Vo(n, STRUCTURE_LAB), s = Vo(n, STRUCTURE_SPAWN), c = Vo(n, STRUCTURE_EXTENSION), u = Vo(n, STRUCTURE_FACTORY)[0], l = Vo(n, STRUCTURE_POWER_SPAWN)[0], m = [];
try {
for (var d = p(Object.keys(e.powers)), f = d.next(); !f.done; f = d.next()) {
var y = f.value, h = e.powers[y];
h && 0 === h.cooldown && m.push(y);
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
homeRoom: a,
isInHomeRoom: n.name === a,
storage: n.storage,
terminal: n.terminal,
factory: u,
labs: i,
spawns: s,
extensions: c,
powerSpawn: l,
availablePowers: m,
ops: e.store.getUsedCapacity(RESOURCE_OPS)
};
}(e);
r && function(e, t) {
var r;
switch (t.type) {
case "usePower":
(t.target ? e.usePower(t.power, t.target) : e.usePower(t.power)) === ERR_NOT_IN_RANGE && t.target && Oa.moveTo(e, t.target);
break;

case "moveTo":
Oa.moveTo(e, t.target);
break;

case "moveToRoom":
var o = new RoomPosition(25, 25, t.roomName);
Oa.moveTo(e, {
pos: o,
range: 20
}, {
maxRooms: 16
});
break;

case "renewSelf":
e.renew(t.spawn) === ERR_NOT_IN_RANGE && Oa.moveTo(e, t.spawn);
break;

case "enableRoom":
(null === (r = e.room) || void 0 === r ? void 0 : r.controller) && e.enableRoom(e.room.controller) === ERR_NOT_IN_RANGE && Oa.moveTo(e, e.room.controller);
}
}(e, function(e) {
return "powerWarrior" === e.powerCreep.memory.role ? function(e) {
var r, o;
if (void 0 !== e.powerCreep.ticksToLive && e.powerCreep.ticksToLive < 1e3 && e.powerSpawn) return {
type: "renewSelf",
spawn: e.powerSpawn
};
var n = e.availablePowers, a = t.safeFind(e.room, FIND_HOSTILE_CREEPS), i = t.safeFind(e.room, FIND_HOSTILE_STRUCTURES);
if (e.room.controller && !e.room.controller.isPowerEnabled) return {
type: "enableRoom"
};
if (n.includes(PWR_GENERATE_OPS) && e.ops < 20) return {
type: "usePower",
power: PWR_GENERATE_OPS
};
if (n.includes(PWR_SHIELD) && e.ops >= 10 && a.length > 0) {
var s = Bo(e.room, FIND_MY_CREEPS, {
filter: function(e) {
return "military" === e.memory.family && e.hits < .7 * e.hitsMax;
},
filterKey: "damagedMilitary"
})[0];
if (s) return {
type: "usePower",
power: PWR_SHIELD,
target: s
};
}
if (n.includes(PWR_DISRUPT_SPAWN) && e.ops >= 10) {
var c = t.safeFind(e.room, FIND_HOSTILE_SPAWNS, {
filter: function(e) {
return !kc(e, PWR_DISRUPT_SPAWN);
}
})[0];
if (c) return {
type: "usePower",
power: PWR_DISRUPT_SPAWN,
target: c
};
}
if (n.includes(PWR_DISRUPT_TOWER) && e.ops >= 10) {
var u = t.safeFind(e.room, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !kc(e, PWR_DISRUPT_TOWER);
}
})[0];
if (u) return {
type: "usePower",
power: PWR_DISRUPT_TOWER,
target: u
};
}
if (n.includes(PWR_OPERATE_TOWER) && e.ops >= 10 && a.length > 0) {
var l = Bo(e.room, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !kc(e, PWR_OPERATE_TOWER);
},
filterKey: "towerNoEffect"
})[0];
if (l) return {
type: "usePower",
power: PWR_OPERATE_TOWER,
target: l
};
}
if (n.includes(PWR_FORTIFY) && e.ops >= 5 && a.length > 0) {
var m = f(f([], d(e.spawns), !1), [ e.storage, e.terminal ], !1).filter(function(e) {
return void 0 !== e;
});
try {
for (var y = p(m), h = y.next(); !h.done; h = y.next()) {
var g = h.value;
if (g) {
var v = e.room.lookForAt(LOOK_STRUCTURES, g.pos).find(function(e) {
return e.structureType === STRUCTURE_RAMPART;
});
if (v && v.hits < .5 * v.hitsMax) return {
type: "usePower",
power: PWR_FORTIFY,
target: v
};
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
h && !h.done && (o = y.return) && o.call(y);
} finally {
if (r) throw r.error;
}
}
var R = Bo(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_RAMPART && e.hits < 5e5;
},
filterKey: "lowRampart"
})[0];
if (R) return {
type: "usePower",
power: PWR_FORTIFY,
target: R
};
}
if (n.includes(PWR_DISRUPT_TERMINAL) && e.ops >= 50) {
var E = i.find(function(e) {
return e.structureType === STRUCTURE_TERMINAL && !kc(e, PWR_DISRUPT_TERMINAL);
});
if (E) return {
type: "usePower",
power: PWR_DISRUPT_TERMINAL,
target: E
};
}
if (n.includes(PWR_GENERATE_OPS) && e.ops < 100) return {
type: "usePower",
power: PWR_GENERATE_OPS
};
if (!e.isInHomeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
if (a.length > 0) {
var T = e.powerCreep.pos.findClosestByRange(a);
if (T && e.powerCreep.pos.getRangeTo(T) > 5) return {
type: "moveTo",
target: T
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
return null !== t.spawning && !kc(t, PWR_OPERATE_SPAWN);
});
if (r) return {
type: "usePower",
power: PWR_OPERATE_SPAWN,
target: r
};
}
if (t.includes(PWR_OPERATE_EXTENSION) && e.ops >= 2 && e.extensions.reduce(function(e, t) {
return e + t.store.getFreeCapacity(RESOURCE_ENERGY);
}, 0) > 1e3 && e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1e4 && !kc(e.storage, PWR_OPERATE_EXTENSION)) return {
type: "usePower",
power: PWR_OPERATE_EXTENSION,
target: e.storage
};
if (t.includes(PWR_OPERATE_TOWER) && e.ops >= 10 && Bo(e.room, FIND_HOSTILE_CREEPS).length > 0) {
var o = Bo(e.room, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !kc(e, PWR_OPERATE_TOWER);
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
return 0 === e.cooldown && e.mineralType && !kc(e, PWR_OPERATE_LAB);
});
if (n) return {
type: "usePower",
power: PWR_OPERATE_LAB,
target: n
};
}
if (t.includes(PWR_OPERATE_FACTORY) && e.ops >= 100 && e.factory && 0 === e.factory.cooldown && !kc(e.factory, PWR_OPERATE_FACTORY)) return {
type: "usePower",
power: PWR_OPERATE_FACTORY,
target: e.factory
};
if (t.includes(PWR_OPERATE_STORAGE) && e.ops >= 100 && e.storage && e.storage.store.getUsedCapacity() > .85 * e.storage.store.getCapacity() && !kc(e.storage, PWR_OPERATE_STORAGE)) return {
type: "usePower",
power: PWR_OPERATE_STORAGE,
target: e.storage
};
if (t.includes(PWR_REGEN_SOURCE) && e.ops >= 100) {
var a = Bo(e.room, FIND_SOURCES, {
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
}(r));
}

function Bc(e) {
return null !== e && "object" == typeof e && "pos" in e && e.pos instanceof RoomPosition && "room" in e && e.room instanceof Room;
}

var Wc = new Set([ "harvester", "upgrader", "mineralHarvester", "depositHarvester", "factoryWorker", "labTech", "builder" ]), Vc = {
harvester: yo.CRITICAL,
queenCarrier: yo.CRITICAL,
hauler: yo.HIGH,
guard: yo.HIGH,
healer: yo.HIGH,
soldier: yo.HIGH,
ranger: yo.HIGH,
siegeUnit: yo.HIGH,
harasser: yo.HIGH,
powerQueen: yo.HIGH,
powerWarrior: yo.HIGH,
larvaWorker: yo.HIGH,
builder: yo.MEDIUM,
upgrader: yo.MEDIUM,
interRoomCarrier: yo.MEDIUM,
scout: yo.MEDIUM,
claimer: yo.MEDIUM,
engineer: yo.MEDIUM,
remoteHarvester: yo.MEDIUM,
powerHarvester: yo.MEDIUM,
powerCarrier: yo.MEDIUM,
remoteHauler: yo.LOW,
remoteWorker: yo.LOW,
linkManager: yo.LOW,
terminalManager: yo.LOW,
mineralHarvester: yo.LOW,
labTech: yo.IDLE,
factoryWorker: yo.IDLE
};

function Kc(e) {
var t;
return null !== (t = Vc[e]) && void 0 !== t ? t : yo.MEDIUM;
}

var Hc = function() {
function t() {
this.registeredCreeps = new Set, this.lastSyncTick = -1;
}
return t.prototype.syncCreepProcesses = function() {
var e, t;
if (this.lastSyncTick !== Game.time) {
this.lastSyncTick = Game.time;
var r = new Set, o = 0, n = 0, a = 0, i = Object.keys(Game.creeps).length;
for (var s in Game.creeps) {
var c = Game.creeps[s];
c.spawning ? a++ : (r.add(s), this.registeredCreeps.has(s) || (this.registerCreepProcess(c), 
o++));
}
try {
for (var u = p(this.registeredCreeps), l = u.next(); !l.done; l = u.next()) s = l.value, 
r.has(s) || (this.unregisterCreepProcess(s), n++);
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = u.return) && t.call(u);
} finally {
if (e) throw e.error;
}
}
var m = i < 5;
(o > 0 || n > 0 || Game.time % 10 == 0 || m) && $r.info("CreepProcessManager: ".concat(r.size, " active, ").concat(a, " spawning, ").concat(i, " total (registered: ").concat(o, ", unregistered: ").concat(n, ")"), {
subsystem: "CreepProcessManager",
meta: {
activeCreeps: r.size,
spawningCreeps: a,
totalCreeps: i,
registeredThisTick: o,
unregisteredThisTick: n
}
});
}
}, t.prototype.registerCreepProcess = function(t) {
var r = t.memory.role, o = Kc(r), n = "creep:".concat(t.name);
_o.registerProcess({
id: n,
name: "Creep ".concat(t.name, " (").concat(r, ")"),
priority: o,
frequency: "high",
interval: 1,
minBucket: this.getMinBucketForPriority(o),
cpuBudget: this.getCpuBudgetForPriority(o),
execute: function() {
var r = Game.creeps[t.name];
r && !r.spawning && function(t) {
var r = t.memory;
if (!(t.spawning || "military" !== r.family && void 0 !== t.ticksToLive && t.ticksToLive < 50 && 0 === t.store.getUsedCapacity())) {
var o = Game.rooms[r.homeRoom], n = o && function(e) {
return Object.values(Game.creeps).filter(function(t) {
return t.memory.homeRoom === e.name;
}).length < 5;
}(o);
if ((Game.time % 10 == 0 || n) && $r.info("Executing role for creep ".concat(t.name, " (").concat(r.role, ")"), {
subsystem: "CreepProcessManager",
creep: t.name
}), function(e) {
var t = e.memory;
if (!Wc.has(t.role)) return !1;
var r = t.state;
if (!r || !r.startTick) return !1;
if (Game.time - r.startTick < 3) return !1;
switch (t.role) {
case "harvester":
return function(e, t) {
if ("harvest" !== t.action && "transfer" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
if (!r || !Bc(r)) return !1;
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
return !(!r || !Bc(r) || !e.pos.inRangeTo(r.pos, 3) || "upgrade" === t.action && 0 === e.store.getUsedCapacity(RESOURCE_ENERGY) || "withdraw" === t.action && 0 === e.store.getFreeCapacity(RESOURCE_ENERGY));
}(e, r);

case "mineralHarvester":
return function(e, t) {
if ("harvestMineral" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
return !(!r || !Bc(r) || !e.pos.isNearTo(r.pos) || 0 === e.store.getFreeCapacity());
}(e, r);

case "builder":
return function(e, t) {
if ("build" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
return !(!r || !Bc(r) || !e.pos.inRangeTo(r.pos, 3) || 0 === e.store.getUsedCapacity(RESOURCE_ENERGY));
}(e, r);

case "depositHarvester":
case "factoryWorker":
case "labTech":
return !0;

default:
return !1;
}
}(t)) {
var a = function(e) {
var t = e.memory.state;
if (!t || !t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
if (!r || !Bc(r)) return !1;
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
}(t);
if (a) return;
delete r.state;
}
var i = function(e) {
var t;
return null !== (t = e.memory.family) && void 0 !== t ? t : "economy";
}(t), s = r.role;
try {
e.unifiedStats.measureSubsystem("role:".concat(s), function() {
switch (i) {
case "economy":
default:
!function(e) {
var t = wa(e);
$s(e, Dc(t, mc), t);
}(t);
break;

case "military":
!function(e) {
var t = wa(e);
$s(e, Dc(t, Oc), t);
}(t);
break;

case "utility":
!function(e) {
var t = wa(e);
$s(e, Dc(t, Mc), t);
}(t);
break;

case "power":
!function(e) {
var t = wa(e);
$s(e, Dc(t, Gc), t);
}(t);
}
});
} catch (e) {
$r.error("EXCEPTION in role execution for ".concat(t.name, " (").concat(s, "/").concat(i, "): ").concat(e), {
subsystem: "CreepProcessManager",
creep: t.name,
meta: {
error: String(e),
stack: e instanceof Error ? e.stack : void 0,
role: s,
family: i,
pos: "".concat(t.pos.x, ",").concat(t.pos.y, " in ").concat(t.room.name)
}
});
}
}
}(r);
}
}), this.registeredCreeps.add(t.name), $r.info("Registered creep process: ".concat(t.name, " (").concat(r, ") with priority ").concat(o), {
subsystem: "CreepProcessManager"
});
}, t.prototype.unregisterCreepProcess = function(e) {
var t = "creep:".concat(e);
_o.unregisterProcess(t), this.registeredCreeps.delete(e), $r.info("Unregistered creep process: ".concat(e), {
subsystem: "CreepProcessManager"
});
}, t.prototype.getMinBucketForPriority = function(e) {
return 0;
}, t.prototype.getCpuBudgetForPriority = function(e) {
return e >= yo.CRITICAL ? .012 : e >= yo.HIGH ? .01 : e >= yo.MEDIUM ? .008 : .006;
}, t.prototype.getStats = function() {
var e, t, r, o, n = {};
try {
for (var a = p(this.registeredCreeps), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = Game.creeps[s];
if (c) {
var u = Kc(c.memory.role), l = null !== (r = yo[u]) && void 0 !== r ? r : "UNKNOWN";
n[l] = (null !== (o = n[l]) && void 0 !== o ? o : 0) + 1;
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
return {
totalCreeps: Object.keys(Game.creeps).length,
registeredCreeps: this.registeredCreeps.size,
creepsByPriority: n
};
}, t.prototype.forceResync = function() {
this.lastSyncTick = -1, this.syncCreepProcesses();
}, t.prototype.reset = function() {
this.registeredCreeps.clear(), this.lastSyncTick = -1;
}, t;
}(), jc = new Hc, Yc = {
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
}, qc = {
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
}, zc = {
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
}, Xc = function() {
function e() {
this.STRUCTURE_CACHE_NAMESPACE = "evolution:structures", this.structureCacheTtl = 20;
}
return e.prototype.determineEvolutionStage = function(e, t, r) {
var o, n, a, i, s = null !== (n = null === (o = t.controller) || void 0 === o ? void 0 : o.level) && void 0 !== n ? n : 0, c = Game.gcl.level, u = this.getStructureCounts(t), l = null !== (i = null === (a = e.remoteAssignments) || void 0 === a ? void 0 : a.length) && void 0 !== i ? i : 0;
return this.meetsThreshold("empireDominance", s, r, c, u, l) ? "empireDominance" : this.meetsThreshold("fortifiedHive", s, r, c, u, l) ? "fortifiedHive" : this.meetsThreshold("matureColony", s, r, c, u, l) ? "matureColony" : this.meetsThreshold("foragingExpansion", s, r, c, u, l) ? "foragingExpansion" : "seedNest";
}, e.prototype.meetsThreshold = function(e, t, r, o, n, a) {
var i, s, c = Yc[e], u = null !== (i = n[STRUCTURE_TOWER]) && void 0 !== i ? i : 0, l = null !== (s = n[STRUCTURE_LAB]) && void 0 !== s ? s : 0;
return !(t < c.rcl || c.minRooms && r < c.minRooms || c.minGcl && o < c.minGcl || c.minRemoteRooms && a < c.minRemoteRooms || c.minTowerCount && u < c.minTowerCount || c.requiresStorage && !n[STRUCTURE_STORAGE] || c.requiresTerminal && t >= 6 && !n[STRUCTURE_TERMINAL] || c.requiresLabs && 0 === l || c.minLabCount && t >= 6 && l < c.minLabCount || c.requiresFactory && t >= 7 && !n[STRUCTURE_FACTORY] || c.requiresPowerSpawn && t >= 7 && !n[STRUCTURE_POWER_SPAWN] || c.requiresObserver && t >= 8 && !n[STRUCTURE_OBSERVER] || c.requiresNuker && t >= 8 && !n[STRUCTURE_NUKER]);
}, e.prototype.getStructureCounts = function(e) {
var t, r, o, n = Mo.get(e.name, {
namespace: this.STRUCTURE_CACHE_NAMESPACE,
ttl: this.structureCacheTtl
});
if (n) return n;
var a = {}, i = e.find(FIND_MY_STRUCTURES);
try {
for (var s = p(i), c = s.next(); !c.done; c = s.next()) {
var u = c.value.structureType;
a[u] = (null !== (o = a[u]) && void 0 !== o ? o : 0) + 1;
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
return Mo.set(e.name, a, {
namespace: this.STRUCTURE_CACHE_NAMESPACE,
ttl: this.structureCacheTtl
}), a;
}, e.prototype.updateEvolutionStage = function(e, t, r) {
var o = this.determineEvolutionStage(e, t, r);
return o !== e.colonyLevel && ($r.info("Room evolution: ".concat(e.colonyLevel, " -> ").concat(o), {
room: t.name,
subsystem: "Evolution"
}), e.colonyLevel = o, !0);
}, e.prototype.updateMissingStructures = function(e, t) {
var r, o, n, a, i, s, c, u, l, m, p, d, f = this.getStructureCounts(t), y = null !== (o = null === (r = t.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0, h = Yc[e.colonyLevel], g = h.requiresLabs && y >= 6, v = g ? null !== (n = h.minLabCount) && void 0 !== n ? n : 3 : 0, R = h.requiresFactory && y >= 7, E = h.requiresTerminal && y >= 6, T = h.requiresStorage && y >= 4, S = h.requiresPowerSpawn && y >= 7, C = h.requiresObserver && y >= 8, w = h.requiresNuker && y >= 8;
e.missingStructures = {
spawn: 0 === (null !== (a = f[STRUCTURE_SPAWN]) && void 0 !== a ? a : 0),
storage: !!T && 0 === (null !== (i = f[STRUCTURE_STORAGE]) && void 0 !== i ? i : 0),
terminal: !!E && 0 === (null !== (s = f[STRUCTURE_TERMINAL]) && void 0 !== s ? s : 0),
labs: !!g && (null !== (c = f[STRUCTURE_LAB]) && void 0 !== c ? c : 0) < v,
nuker: !!w && 0 === (null !== (u = f[STRUCTURE_NUKER]) && void 0 !== u ? u : 0),
factory: !!R && 0 === (null !== (l = f[STRUCTURE_FACTORY]) && void 0 !== l ? l : 0),
extractor: y >= 6 && 0 === (null !== (m = f[STRUCTURE_EXTRACTOR]) && void 0 !== m ? m : 0),
powerSpawn: !!S && 0 === (null !== (p = f[STRUCTURE_POWER_SPAWN]) && void 0 !== p ? p : 0),
observer: !!C && 0 === (null !== (d = f[STRUCTURE_OBSERVER]) && void 0 !== d ? d : 0)
};
}, e;
}(), Qc = function() {
function e() {}
return e.prototype.determinePosture = function(e, t) {
if (t) return t;
var r = e.pheromones, o = e.danger;
return o >= 3 ? "siege" : o >= 2 ? "war" : r.siege > 30 ? "siege" : r.war > 25 ? "war" : r.defense > 20 ? "defensive" : r.nukeTarget > 40 ? "nukePrep" : r.expand > 30 && 0 === o ? "expand" : o >= 1 ? "defensive" : "eco";
}, e.prototype.updatePosture = function(e, t, r) {
var o = this.determinePosture(e, t);
if (o !== e.posture) {
var n = e.posture, a = null != r ? r : e.role;
return $r.info("Posture change: ".concat(n, " -> ").concat(o), {
room: a,
subsystem: "Posture"
}), e.posture = o, _o.emit("posture.change", {
roomName: a,
oldPosture: n,
newPosture: o,
source: "PostureManager"
}), !0;
}
return !1;
}, e.prototype.getSpawnProfile = function(e) {
return qc[e];
}, e.prototype.getResourcePriorities = function(e) {
return zc[e];
}, e.prototype.allowsBuilding = function(e) {
return "evacuate" !== e && "siege" !== e;
}, e.prototype.allowsUpgrading = function(e) {
return "evacuate" !== e && "siege" !== e && "war" !== e;
}, e.prototype.isCombatPosture = function(e) {
return "defensive" === e || "war" === e || "siege" === e;
}, e.prototype.allowsExpansion = function(e) {
return "eco" === e || "expand" === e;
}, e;
}(), $c = new Xc, Jc = new Qc;

function Zc(e) {
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

var eu = {
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
}, tu = {
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
}, ru = {
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
}, ou = {
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
}, nu = {
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

function au(e, t, r) {
for (var o = e.getTerrain(), n = -1; n <= 1; n++) for (var a = -1; a <= 1; a++) {
var i = t + n, s = r + a;
if (i < 1 || i > 48 || s < 1 || s > 48) return !1;
if (o.get(i, s) === TERRAIN_MASK_WALL) return !1;
}
return !0;
}

function iu(e, t, r) {
var o, n, a, i, s, c = e.getTerrain(), u = null !== (s = r.minSpaceRadius) && void 0 !== s ? s : 7, l = 0, m = 0;
if (t.x < u || t.x > 49 - u || t.y < u || t.y > 49 - u) return {
fits: !1,
reason: "Anchor too close to room edge (needs ".concat(u, " tile margin)")
};
try {
for (var d = p(r.structures), f = d.next(); !f.done; f = d.next()) {
var y = f.value, h = t.x + y.x, g = t.y + y.y;
if (h < 1 || h > 48 || g < 1 || g > 48) return {
fits: !1,
reason: "Structure ".concat(y.structureType, " at (").concat(y.x, ",").concat(y.y, ") would be outside room bounds")
};
m++, c.get(h, g) === TERRAIN_MASK_WALL && l++;
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
for (var v = p(r.roads), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
h = t.x + E.x, g = t.y + E.y, h < 1 || h > 48 || g < 1 || g > 48 || (m++, c.get(h, g) === TERRAIN_MASK_WALL && l++);
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
var T = m > 0 ? l / m * 100 : 0;
return "bunker" === r.type && T > 10 ? {
fits: !1,
reason: "Too many walls in blueprint area (".concat(T.toFixed(1), "% walls, max ").concat(10, "% for bunker)"),
wallCount: l,
totalTiles: m
} : "spread" === r.type && T > 25 ? {
fits: !1,
reason: "Too many walls in blueprint area (".concat(T.toFixed(1), "% walls, max ").concat(25, "% for spread layout)"),
wallCount: l,
totalTiles: m
} : {
fits: !0,
wallCount: l,
totalTiles: m
};
}

function su(e, t) {
var r, o, n, a, i, s = e.controller;
if (!s) return null;
var c = e.find(FIND_SOURCES), u = s.pos.x, l = s.pos.y;
try {
for (var m = p(c), d = m.next(); !d.done; d = m.next()) u += (U = d.value).pos.x, 
l += U.pos.y;
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
for (var f = Math.round(u / (c.length + 1)), y = Math.round(l / (c.length + 1)), h = null !== (i = t.minSpaceRadius) && void 0 !== i ? i : 7, g = [], v = 0; v <= 15; v++) {
for (var R = -v; R <= v; R++) for (var E = -v; E <= v; E++) if (!(Math.abs(R) !== v && Math.abs(E) !== v && v > 0)) {
var T = f + R, S = y + E;
if (!(T < h || T > 49 - h || S < h || S > 49 - h)) {
var C = new RoomPosition(T, S, e.name), w = iu(e, C, t);
if (w.fits) {
var b = 1e3, x = C.getRangeTo(s);
x >= 4 && x <= 8 ? b += 100 : x < 4 ? b -= 50 : x > 12 && (b -= 30);
var O = 0;
try {
for (var _ = (n = void 0, p(c)), A = _.next(); !A.done; A = _.next()) {
var U = A.value;
O += C.getRangeTo(U);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
A && !A.done && (a = _.return) && a.call(_);
} finally {
if (n) throw n.error;
}
}
var N = O / c.length;
N >= 5 && N <= 10 ? b += 80 : N < 5 && (b -= 20);
var M = Math.abs(T - 25) + Math.abs(S - 25);
if (M < 10 ? b += 50 : M > 20 && (b -= 30), void 0 !== w.wallCount && void 0 !== w.totalTiles) {
var k = w.wallCount / w.totalTiles * 100;
b += Math.max(0, 50 - 2 * k);
}
g.push({
pos: C,
score: b
});
}
}
}
if (g.length > 0) return g.sort(function(e, t) {
return t.score - e.score;
}), g[0].pos;
}
return null;
}

function cu(e, t) {
var r, o = Zc(t), n = {}, a = e.structures.filter(function(e) {
var t, r, a = e.structureType, i = null !== (t = o[a]) && void 0 !== t ? t : 0, s = null !== (r = n[a]) && void 0 !== r ? r : 0;
return !(s >= i || (n[a] = s + 1, 0));
}), i = null !== (r = o[STRUCTURE_EXTENSION]) && void 0 !== r ? r : 0;
return i > 0 && (a = function(e, t) {
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
return f(f([], d(e), !1), d(a), !1);
}(a, i)), a;
}

function uu(e) {
return function(e) {
return e >= 7 ? ou : e >= 5 ? ru : e >= 3 ? tu : eu;
}(e);
}

function lu(e, t) {
if (t >= 8) {
var r = su(e, nu);
if (r) return {
blueprint: nu,
anchor: r
};
if (o = su(e, ou)) return {
blueprint: ou,
anchor: o
};
}
var o;
if (t >= 7 && (o = su(e, ou))) return {
blueprint: ou,
anchor: o
};
if (t >= 5) {
var n = su(e, ru);
if (n) return {
blueprint: ru,
anchor: n
};
}
if (t >= 3) {
var a = su(e, tu);
if (a) return {
blueprint: tu,
anchor: a
};
}
var i = su(e, eu);
if (i) return {
blueprint: eu,
anchor: i
};
var s = function(e) {
var t, r, o = e.controller;
if (!o) return null;
var n = e.find(FIND_SOURCES), a = e.getTerrain(), i = o.pos.x, s = o.pos.y;
try {
for (var c = p(n), u = c.next(); !u.done; u = c.next()) {
var l = u.value;
i += l.pos.x, s += l.pos.y;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
u && !u.done && (r = c.return) && r.call(c);
} finally {
if (t) throw t.error;
}
}
for (var m = Math.round(i / (n.length + 1)), d = Math.round(s / (n.length + 1)), f = 0; f < 15; f++) for (var y = -f; y <= f; y++) for (var h = -f; h <= f; h++) if (Math.abs(y) === f || Math.abs(h) === f) {
var g = m + y, v = d + h;
if (!(g < 3 || g > 46 || v < 3 || v > 46) && au(e, g, v)) {
if (Math.max(Math.abs(g - o.pos.x), Math.abs(v - o.pos.y)) > 20) continue;
if (a.get(g, v) === TERRAIN_MASK_WALL) continue;
return new RoomPosition(g, v, e.name);
}
}
return null;
}(e);
return s ? {
blueprint: eu,
anchor: s
} : null;
}

var mu = [ STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_TOWER, STRUCTURE_LAB, STRUCTURE_LINK, STRUCTURE_FACTORY, STRUCTURE_OBSERVER, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN, STRUCTURE_EXTRACTOR ], pu = new Set(mu);

function du(e) {
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

var fu = {
info: function(e, t) {
return $r.info(e, t);
},
warn: function(e, t) {
return $r.warn(e, t);
},
error: function(e, t) {
return $r.error(e, t);
},
debug: function(e, t) {
return $r.debug(e, t);
}
}, yu = new (function() {
function e() {
this.manager = new a.ChemistryManager({
logger: fu
});
}
return e.prototype.getReaction = function(e) {
return this.manager.getReaction(e);
}, e.prototype.calculateReactionChain = function(e, t) {
return this.manager.calculateReactionChain(e, t);
}, e.prototype.hasResourcesForReaction = function(e, t, r) {
return void 0 === r && (r = 100), this.manager.hasResourcesForReaction(e, t, r);
}, e.prototype.planReactions = function(e, t) {
var r = du(t);
return this.manager.planReactions(e, r);
}, e.prototype.scheduleCompoundProduction = function(e, t) {
var r = du(t);
return this.manager.scheduleCompoundProduction(e, r);
}, e.prototype.executeReaction = function(e, t) {
this.manager.executeReaction(e, t);
}, e;
}()), hu = function() {
function e() {}
return e.prototype.shouldBoost = function(e, t) {
var r, o = e.memory;
if (o.boosted) return !1;
var n = a.getBoostConfig(o.role);
if (!n) return !1;
var i = !0 === (null !== (r = Memory.boostDefensePriority) && void 0 !== r ? r : {})[e.room.name] ? Math.max(1, n.minDanger - 1) : n.minDanger;
return !(t.danger < i || t.missingStructures.labs);
}, e.prototype.boostCreep = function(e, t) {
var r, o, n = e.memory, i = a.getBoostConfig(n.role);
if (!i) return !1;
var s = t.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}), c = [], u = function(t) {
if (e.body.some(function(e) {
return e.boost === t;
})) return "continue";
c.push(t);
var r = s.find(function(e) {
return e.mineralType === t && e.store[t] >= 30;
});
if (!r) return $r.debug("Lab not ready with ".concat(t, " for ").concat(e.name), {
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
if (o === OK) $r.info("Boosted ".concat(e.name, " with ").concat(t), {
subsystem: "Boost"
}); else if (o !== ERR_NOT_FOUND) return $r.error("Failed to boost ".concat(e.name, ": ").concat(function(e) {
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
for (var l = p(i.boosts), m = l.next(); !m.done; m = l.next()) {
var d = u(m.value);
if ("object" == typeof d) return d.value;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
return 0 === c.length && (n.boosted = !0, $r.info("".concat(e.name, " fully boosted (all ").concat(i.boosts.length, " boosts applied)"), {
subsystem: "Boost"
}), !0);
}, e.prototype.areBoostLabsReady = function(e, t) {
var r, o, n = a.getBoostConfig(t);
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
for (var c = p(n.boosts), u = c.next(); !u.done; u = c.next()) {
var l = s(u.value);
if ("object" == typeof l) return l.value;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
return !0;
}, e.prototype.getMissingBoosts = function(e, t) {
var r, o, n = a.getBoostConfig(t);
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
for (var u = p(n.boosts), l = u.next(); !l.done; l = u.next()) c(l.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
return s;
}, e.prototype.prepareLabs = function(e, t) {
var r, o, n, i, s, c;
if (!(t.danger < 2)) {
var u = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (!(u.length < 3)) {
var l = u.slice(2), m = new Set, d = [ a.getBoostConfig("soldier"), a.getBoostConfig("ranger"), a.getBoostConfig("healer"), a.getBoostConfig("siegeUnit") ].filter(function(e) {
return void 0 !== e && t.danger >= e.minDanger;
});
try {
for (var f = p(d), y = f.next(); !y.done; y = f.next()) {
var h = y.value;
try {
for (var g = (n = void 0, p(h.boosts)), v = g.next(); !v.done; v = g.next()) {
var R = v.value;
m.add(R);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
v && !v.done && (i = g.return) && i.call(g);
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
y && !y.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
var E = 0;
try {
for (var T = p(m), S = T.next(); !(S.done || (R = S.value, E >= l.length)); S = T.next()) {
var C = l[E];
(C.mineralType !== R || C.store[R] < 1e3) && $r.debug("Lab ".concat(C.id, " needs ").concat(R, " for boosting"), {
subsystem: "Boost"
}), E++;
}
} catch (e) {
s = {
error: e
};
} finally {
try {
S && !S.done && (c = T.return) && c.call(T);
} finally {
if (s) throw s.error;
}
}
}
}
}, e.prototype.calculateBoostCost = function(e, t) {
return a.calculateBoostCost(e, t);
}, e.prototype.analyzeBoostROI = function(e, t, r, o) {
if (!a.getBoostConfig(e)) return {
worthwhile: !1,
roi: 0,
reasoning: "No boost config for role"
};
var n = this.calculateBoostCost(e, t), i = n.mineral + .1 * n.energy, s = 0;
switch (e) {
case "soldier":
s = 30 * Math.floor(t / 3) * 4 * r;
break;

case "ranger":
s = 10 * Math.floor(t / 3) * 4 * r;
break;

case "healer":
s = 12 * Math.floor(t / 3) * 4 * r;
break;

case "siegeUnit":
s = 50 * Math.floor(t / 3) * 4 * r;
break;

default:
s = 10 * t * r;
}
var c = (s *= 1 + .5 * o) / i, u = c > 1.5, l = u ? "High ROI: ".concat(c.toFixed(2), "x (gain: ").concat(s.toFixed(0), ", cost: ").concat(i.toFixed(0), ")") : "Low ROI: ".concat(c.toFixed(2), "x (gain: ").concat(s.toFixed(0), ", cost: ").concat(i.toFixed(0), ")");
return {
worthwhile: u,
roi: c,
reasoning: l
};
}, e;
}(), gu = new hu;

function vu(e) {
return e >= 2 && e <= 3;
}

var Ru = {
enablePheromones: !0,
enableEvolution: !0,
enableSpawning: !0,
enableConstruction: !0,
enableTowers: !0,
enableProcessing: !0
}, Eu = new Map, Tu = new Map;

function Su(e) {
var t = Eu.get(e.name);
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
return Eu.set(e.name, o), o;
}

var Cu = function() {
function r(e, t) {
void 0 === t && (t = {}), this.roomName = e, this.config = l(l({}, Ru), t);
}
return r.prototype.run = function(t) {
var r, n, a, i = e.unifiedStats.startRoom(this.roomName), s = Game.rooms[this.roomName];
if (s && (null === (r = s.controller) || void 0 === r ? void 0 : r.my)) {
!function(e) {
var t, r, o;
if (null === (o = e.controller) || void 0 === o ? void 0 : o.my) {
e.storage && Mo.set(e.storage.id, e.storage, {
namespace: Po,
ttl: 10
}), e.terminal && Mo.set(e.terminal.id, e.terminal, {
namespace: Po,
ttl: 10
}), e.controller && Mo.set(e.controller.id, e.controller, {
namespace: Po,
ttl: 10
});
var n = e.find(FIND_SOURCES);
try {
for (var a = p(n), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
Mo.set(s.id, s, {
namespace: Po,
ttl: 5
});
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
}(s);
var c = Cn.getOrInitSwarmState(this.roomName);
if (this.config.enablePheromones && Game.time % 5 == 0 && Ns.updateMetrics(s, c), 
this.updateThreatAssessment(s, c), o.emergencyResponseManager.assess(s, c), o.safeModeManager.checkSafeMode(s, c), 
this.config.enableEvolution && ($c.updateEvolutionStage(c, s, t), $c.updateMissingStructures(c, s)), 
Jc.updatePosture(c), this.config.enablePheromones && Ns.updatePheromones(c, s), 
this.config.enableTowers && this.runTowerControl(s, c), this.config.enableConstruction && Jc.allowsBuilding(c.posture)) {
var u = vu(null !== (a = null === (n = s.controller) || void 0 === n ? void 0 : n.level) && void 0 !== a ? a : 1) ? 5 : 10;
Game.time % u === 0 && this.runConstruction(s, c);
}
this.config.enableProcessing && Game.time % 5 == 0 && this.runResourceProcessing(s, c);
var l = Game.cpu.getUsed() - i;
e.unifiedStats.recordRoom(s, l), e.unifiedStats.endRoom(this.roomName, i);
} else e.unifiedStats.endRoom(this.roomName, i);
}, r.prototype.updateThreatAssessment = function(e, r) {
var n, a, i, s, c, u, l, m, y, h;
if (Game.time % 5 == 0) {
var g = Su(e), v = g.spawns.length + g.towers.length, R = Tu.get(this.roomName);
R && R.lastTick < Game.time && v < R.lastStructureCount && (g.spawns.length < R.lastSpawns.length && _o.emit("structure.destroyed", {
roomName: this.roomName,
structureType: STRUCTURE_SPAWN,
structureId: "unknown",
source: this.roomName
}), g.towers.length < R.lastTowers.length && _o.emit("structure.destroyed", {
roomName: this.roomName,
structureType: STRUCTURE_TOWER,
structureId: "unknown",
source: this.roomName
})), Tu.set(this.roomName, {
lastStructureCount: v,
lastSpawns: f([], d(g.spawns), !1),
lastTowers: f([], d(g.towers), !1),
lastTick: Game.time
});
}
var E = t.safeFind(e, FIND_HOSTILE_CREEPS);
!(E.length > 0 || r.danger > 0) || t.safeFind(e, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
try {
for (var T = p(E), S = T.next(); !S.done; S = T.next()) {
var C = S.value;
try {
for (var w = (i = void 0, p(C.body)), b = w.next(); !b.done; b = w.next()) {
var x = b.value;
x.hits > 0 && (x.type === ATTACK || (x.type, RANGED_ATTACK));
}
} catch (e) {
i = {
error: e
};
} finally {
try {
b && !b.done && (s = w.return) && s.call(w);
} finally {
if (i) throw i.error;
}
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
S && !S.done && (a = T.return) && a.call(T);
} finally {
if (n) throw n.error;
}
}
if (E.length > 0) {
var O = o.assessThreat(e), _ = O.dangerLevel;
if (_ > r.danger) {
if (Ns.updateDangerFromThreat(r, O.threatScore, O.dangerLevel), r.clusterId) {
var A = Cn.getCluster(r.clusterId);
A && Ns.diffuseDangerToCluster(e.name, O.threatScore, A.memberRooms);
}
Cn.addRoomEvent(this.roomName, "hostileDetected", "".concat(E.length, " hostiles, danger=").concat(_, ", score=").concat(O.threatScore));
try {
for (var U = p(E), N = U.next(); !N.done; N = U.next()) C = N.value, _o.emit("hostile.detected", {
roomName: this.roomName,
hostileId: C.id,
hostileOwner: C.owner.username,
bodyParts: C.body.length,
threatLevel: _,
source: this.roomName
});
} catch (e) {
c = {
error: e
};
} finally {
try {
N && !N.done && (u = U.return) && u.call(U);
} finally {
if (c) throw c.error;
}
}
}
r.danger = _;
} else r.danger > 0 && (_o.emit("hostile.cleared", {
roomName: this.roomName,
source: this.roomName
}), r.danger = 0);
if (Game.time % 10 == 0) {
var M = e.find(FIND_NUKES);
if (M.length > 0) {
if (!r.nukeDetected) {
Ns.onNukeDetected(r);
var k = null !== (h = null === (y = M[0]) || void 0 === y ? void 0 : y.launchRoomName) && void 0 !== h ? h : "unidentified source";
Cn.addRoomEvent(this.roomName, "nukeDetected", "".concat(M.length, " nuke(s) incoming from ").concat(k)), 
r.nukeDetected = !0;
try {
for (var P = p(M), I = P.next(); !I.done; I = P.next()) {
var G = I.value;
_o.emit("nuke.detected", {
roomName: this.roomName,
nukeId: G.id,
landingTick: Game.time + G.timeToLand,
launchRoomName: G.launchRoomName,
source: this.roomName
});
}
} catch (e) {
l = {
error: e
};
} finally {
try {
I && !I.done && (m = P.return) && m.call(P);
} finally {
if (l) throw l.error;
}
}
}
} else r.nukeDetected = !1;
}
}, r.prototype.runTowerControl = function(e, r) {
var n, a, i, s, c = Su(e).towers;
if (0 !== c.length) {
var u = t.safeFind(e, FIND_HOSTILE_CREEPS), l = u.length > 0 ? this.selectTowerTarget(u) : null, m = function(t) {
if (t.store.getUsedCapacity(RESOURCE_ENERGY) < 10) return "continue";
if (l) return t.attack(l), "continue";
var n;
if ("siege" !== r.posture && (n = t.pos.findClosestByRange(FIND_MY_CREEPS, {
filter: function(e) {
return e.hits < e.hitsMax;
}
}))) return t.heal(n), "continue";
if (!Jc.isCombatPosture(r.posture) && (n = t.pos.findClosestByRange(FIND_STRUCTURES, {
filter: function(e) {
return e.hits < .8 * e.hitsMax && e.structureType !== STRUCTURE_WALL && e.structureType !== STRUCTURE_RAMPART;
}
}))) return t.repair(n), "continue";
if (!Jc.isCombatPosture(r.posture) && 0 === u.length) {
var a = null !== (s = null === (i = e.controller) || void 0 === i ? void 0 : i.level) && void 0 !== s ? s : 1, c = o.calculateWallRepairTarget(a, r.danger), m = t.pos.findClosestByRange(FIND_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART) && e.hits < c;
}
});
m && t.repair(m);
}
};
try {
for (var d = p(c), f = d.next(); !f.done; f = d.next()) m(f.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (a = d.return) && a.call(d);
} finally {
if (n) throw n.error;
}
}
}
}, r.prototype.selectTowerTarget = function(e) {
var t, r = this;
return null !== (t = e.sort(function(e, t) {
var o = r.getHostilePriority(e);
return r.getHostilePriority(t) - o;
})[0]) && void 0 !== t ? t : null;
}, r.prototype.getHostilePriority = function(e) {
var t, r, o = 0;
if (o += 100 * e.getActiveBodyparts(HEAL), o += 50 * e.getActiveBodyparts(RANGED_ATTACK), 
o += 40 * e.getActiveBodyparts(ATTACK), o += 60 * e.getActiveBodyparts(CLAIM), (o += 30 * e.getActiveBodyparts(WORK)) > 0) try {
for (var n = p(e.body), a = n.next(); !a.done; a = n.next()) if (a.value.boost) {
o += 20;
break;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return o;
}, r.prototype.runConstruction = function(e, t) {
var r, n, a, i = Su(e), s = i.constructionSites;
if (!(s.length >= 10)) {
var c = null !== (n = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== n ? n : 1, u = i.spawns[0], m = null == u ? void 0 : u.pos;
if (u) {
var y = lu(e, c);
if (y) m = y.anchor; else {
if (!uu(c)) return;
m = u.pos;
}
var h = null !== (a = null == y ? void 0 : y.blueprint) && void 0 !== a ? a : uu(c);
if (h && m) {
if (!Jc.isCombatPosture(t.posture)) {
var g = function(e, t, r, o, n) {
var a, i;
void 0 === n && (n = []);
var s = function(e, t, r, o) {
var n, a, i, s, c, u, m;
void 0 === o && (o = []);
var d = null !== (u = null === (c = e.controller) || void 0 === c ? void 0 : c.level) && void 0 !== u ? u : 1, f = cu(r, d), y = e.getTerrain(), h = [], g = new Map;
try {
for (var v = p(f), R = v.next(); !R.done; R = v.next()) {
var E = R.value, T = t.x + E.x, S = t.y + E.y;
if (!(T < 1 || T > 48 || S < 1 || S > 48) && y.get(T, S) !== TERRAIN_MASK_WALL) {
var C = "".concat(T, ",").concat(S);
g.has(E.structureType) || g.set(E.structureType, new Set), null === (m = g.get(E.structureType)) || void 0 === m || m.add(C);
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
R && !R.done && (a = v.return) && a.call(v);
} finally {
if (n) throw n.error;
}
}
var w = function(e, t, r, o) {
var n, a, i, s, c, u, m, d, f, y, h;
void 0 === o && (o = []);
var g = new Set, v = e.getTerrain();
try {
for (var R = p(r), E = R.next(); !E.done; E = R.next()) {
var T = E.value, S = t.x + T.x, C = t.y + T.y;
S >= 1 && S <= 48 && C >= 1 && C <= 48 && v.get(S, C) !== TERRAIN_MASK_WALL && g.add("".concat(S, ",").concat(C));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
E && !E.done && (a = R.return) && a.call(R);
} finally {
if (n) throw n.error;
}
}
var w = zi(e, t);
try {
for (var b = p(w.positions), x = b.next(); !x.done; x = b.next()) {
var O = x.value;
g.add(O);
}
} catch (e) {
i = {
error: e
};
} finally {
try {
x && !x.done && (s = b.return) && s.call(b);
} finally {
if (i) throw i.error;
}
}
var _ = e.storage, A = e.find(FIND_MY_SPAWNS)[0], U = null !== (h = null == _ ? void 0 : _.pos) && void 0 !== h ? h : null == A ? void 0 : A.pos;
if (U) {
var N = function(e, t, r) {
var o, n, a, i;
void 0 === r && (r = {});
var s = l(l({}, Yi), r), c = new Set;
try {
for (var u = p([ "top", "bottom", "left", "right" ]), m = u.next(); !m.done; m = u.next()) {
var d = m.value;
try {
var f = Qi(e.name, d);
if (0 === f.length) continue;
var y = $i(t, f);
if (!y) continue;
var h = PathFinder.search(t, {
pos: y,
range: 0
}, {
plainCost: 2,
swampCost: 10,
maxOps: s.maxPathOps,
roomCallback: function(t) {
return t === e.name && es(t);
}
});
if (h.incomplete) $r.warn("Incomplete path when calculating exit road for ".concat(d, " in ").concat(e.name, " (target exit: ").concat(y.x, ",").concat(y.y, "). Path length: ").concat(h.path.length), {
subsystem: "RoadNetwork"
}); else try {
for (var g = (a = void 0, p(h.path)), v = g.next(); !v.done; v = g.next()) {
var R = v.value;
R.roomName === e.name && c.add("".concat(R.x, ",").concat(R.y));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
v && !v.done && (i = g.return) && i.call(g);
} finally {
if (a) throw a.error;
}
}
} catch (t) {
var E = t instanceof Error ? t.message : String(t);
$r.warn("Failed to calculate exit road for ".concat(d, " in ").concat(e.name, ": ").concat(E), {
subsystem: "RoadNetwork"
});
}
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
return c;
}(e, U);
try {
for (var M = p(N), k = M.next(); !k.done; k = M.next()) O = k.value, g.add(O);
} catch (e) {
c = {
error: e
};
} finally {
try {
k && !k.done && (u = M.return) && u.call(M);
} finally {
if (c) throw c.error;
}
}
}
if (o.length > 0) {
var P = Ji(e, o).get(e.name);
if (P) try {
for (var I = p(P), G = I.next(); !G.done; G = I.next()) O = G.value, g.add(O);
} catch (e) {
m = {
error: e
};
} finally {
try {
G && !G.done && (d = I.return) && d.call(I);
} finally {
if (m) throw m.error;
}
}
}
var L = function(e, t) {
var r, o, n, a;
void 0 === t && (t = 10);
var i = new Set, s = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
}), c = e.find(FIND_CONSTRUCTION_SITES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
});
try {
for (var u = p(s), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
ts(m.pos, t) && i.add("".concat(m.pos.x, ",").concat(m.pos.y));
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = u.return) && o.call(u);
} finally {
if (r) throw r.error;
}
}
try {
for (var d = p(c), f = d.next(); !f.done; f = d.next()) {
var y = f.value;
ts(y.pos, t) && i.add("".concat(y.pos.x, ",").concat(y.pos.y));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (a = d.return) && a.call(d);
} finally {
if (n) throw n.error;
}
}
return i;
}(e);
try {
for (var D = p(L), F = D.next(); !F.done; F = D.next()) O = F.value, g.add(O);
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
return g;
}(e, t, r.roads, o);
if (g.set(STRUCTURE_ROAD, w), d >= 6) {
var b = e.find(FIND_MINERALS);
if (b.length > 0) {
var x = b[0], O = new Set;
O.add("".concat(x.pos.x, ",").concat(x.pos.y)), g.set(STRUCTURE_EXTRACTOR, O);
}
}
var _ = e.find(FIND_STRUCTURES, {
filter: function(e) {
return pu.has(e.structureType) && (!0 === e.my || e.structureType === STRUCTURE_ROAD);
}
});
try {
for (var A = p(_), U = A.next(); !U.done; U = A.next()) {
var N = U.value, M = (C = "".concat(N.pos.x, ",").concat(N.pos.y), N.structureType), k = g.get(M);
k && k.has(C) || h.push({
structure: N,
reason: "".concat(N.structureType, " at ").concat(C, " is not in blueprint")
});
}
} catch (e) {
i = {
error: e
};
} finally {
try {
U && !U.done && (s = A.return) && s.call(A);
} finally {
if (i) throw i.error;
}
}
return h;
}(e, t, r, n), c = 0;
try {
for (var u = p(s), m = u.next(); !m.done; m = u.next()) {
var d = m.value, f = d.structure, y = d.reason;
if (c >= o) break;
f.destroy() === OK && (c++, $r.info("Destroyed misplaced structure: ".concat(y), {
subsystem: "Blueprint",
room: f.room.name,
meta: {
structureType: f.structureType,
pos: f.pos.toString(),
reason: y
}
}));
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
return c;
}(e, m, h, 1, t.remoteAssignments);
if (g > 0) {
var v = 1 === g ? "structure" : "structures";
Cn.addRoomEvent(this.roomName, "structureDestroyed", "".concat(g, " misplaced ").concat(v, " destroyed for blueprint compliance"));
}
}
var R = {
sitesPlaced: 0,
wallsRemoved: 0
};
if (c >= 2 && s.length < 8) {
var E = vu(c) ? 5 : 3;
(R = o.placeRoadAwarePerimeterDefense(e, m, h.roads, c, E, t.remoteAssignments)).wallsRemoved > 0 && Cn.addRoomEvent(this.roomName, "wallRemoved", "".concat(R.wallsRemoved, " wall(s) removed to allow road passage"));
}
var T = function(e, t, r) {
var o, n, a, i, s, c, u, l, m, y, h, g, v, R, E = null !== (y = null === (m = e.controller) || void 0 === m ? void 0 : m.level) && void 0 !== y ? y : 1, T = cu(r, E), S = e.getTerrain(), C = [];
if (E >= 6) {
var w = e.find(FIND_MINERALS);
if (w.length > 0) {
var b = w[0];
C.push({
x: b.pos.x - t.x,
y: b.pos.y - t.y,
structureType: STRUCTURE_EXTRACTOR
});
}
}
var x = f(f([], d(T), !1), d(C), !1), O = 0, _ = e.find(FIND_MY_CONSTRUCTION_SITES), A = e.find(FIND_STRUCTURES);
if (_.length >= 10) return 0;
var U = {};
try {
for (var N = p(A), M = N.next(); !M.done; M = N.next()) {
var k = M.value.structureType;
U[k] = (null !== (h = U[k]) && void 0 !== h ? h : 0) + 1;
}
} catch (e) {
o = {
error: e
};
} finally {
try {
M && !M.done && (n = N.return) && n.call(N);
} finally {
if (o) throw o.error;
}
}
try {
for (var P = p(_), I = P.next(); !I.done; I = P.next()) k = I.value.structureType, 
U[k] = (null !== (g = U[k]) && void 0 !== g ? g : 0) + 1;
} catch (e) {
a = {
error: e
};
} finally {
try {
I && !I.done && (i = P.return) && i.call(P);
} finally {
if (a) throw a.error;
}
}
var G = Zc(E), L = function(r) {
var o = null !== (v = U[r.structureType]) && void 0 !== v ? v : 0;
if (o >= (null !== (R = G[r.structureType]) && void 0 !== R ? R : 0)) return "continue";
var n = t.x + r.x, a = t.y + r.y;
return n < 1 || n > 48 || a < 1 || a > 48 || S.get(n, a) === TERRAIN_MASK_WALL || A.some(function(e) {
return e.pos.x === n && e.pos.y === a && e.structureType === r.structureType;
}) || _.some(function(e) {
return e.pos.x === n && e.pos.y === a && e.structureType === r.structureType;
}) ? "continue" : e.createConstructionSite(n, a, r.structureType) === OK && (O++, 
U[r.structureType] = o + 1, O >= 3 || _.length + O >= 10) ? "break" : void 0;
};
try {
for (var D = p(x), F = D.next(); !F.done && "break" !== L(F.value); F = D.next()) ;
} catch (e) {
s = {
error: e
};
} finally {
try {
F && !F.done && (c = D.return) && c.call(D);
} finally {
if (s) throw s.error;
}
}
if (O < 3 && _.length + O < 10) {
var B = function(r) {
var o = t.x + r.x, n = t.y + r.y;
return o < 1 || o > 48 || n < 1 || n > 48 || S.get(o, n) === TERRAIN_MASK_WALL || A.some(function(e) {
return e.pos.x === o && e.pos.y === n && e.structureType === STRUCTURE_ROAD;
}) || _.some(function(e) {
return e.pos.x === o && e.pos.y === n && e.structureType === STRUCTURE_ROAD;
}) ? "continue" : e.createConstructionSite(o, n, STRUCTURE_ROAD) === OK && (++O >= 3 || _.length + O >= 10) ? "break" : void 0;
};
try {
for (var W = p(r.roads), V = W.next(); !V.done && "break" !== B(V.value); V = W.next()) ;
} catch (e) {
u = {
error: e
};
} finally {
try {
V && !V.done && (l = W.return) && l.call(W);
} finally {
if (u) throw u.error;
}
}
}
return O;
}(e, m, h), S = function(e, t) {
var r, o, n = e.find(FIND_MY_CONSTRUCTION_SITES);
if (n.length >= 10) return 0;
var a = zi(e, t), i = e.getTerrain(), s = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
}), c = new Set(s.map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), u = new Set(n.filter(function(e) {
return e.structureType === STRUCTURE_ROAD;
}).map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), l = 0;
try {
for (var m = p(a.positions), f = m.next(); !f.done; f = m.next()) {
var y = f.value;
if (l >= 2) break;
if (n.length + l >= 10) break;
if (!c.has(y) && !u.has(y)) {
var h = d(y.split(","), 2), g = h[0], v = h[1], R = parseInt(g, 10), E = parseInt(v, 10);
i.get(R, E) !== TERRAIN_MASK_WALL && e.createConstructionSite(R, E, STRUCTURE_ROAD) === OK && l++;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
return l;
}(e, m), C = {
placed: 0
};
if (c >= 2 && s.length < 9) {
var w = t.danger >= 2 ? 3 : 2;
(C = o.placeRampartsOnCriticalStructures(e, c, t.danger, w)).placed > 0 && Cn.addRoomEvent(this.roomName, "rampartPlaced", "".concat(C.placed, " rampart(s) placed on critical structures"));
}
t.metrics.constructionSites = s.length + T + S + R.sitesPlaced + C.placed;
}
} else if (1 === c && 0 === s.length) {
var b = lu(e, c);
b && e.createConstructionSite(b.anchor.x, b.anchor.y, STRUCTURE_SPAWN);
}
}
}, r.prototype.runResourceProcessing = function(e, t) {
var r, o, n = null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0;
n >= 6 && this.runLabs(e), n >= 7 && this.runFactory(e), n >= 8 && this.runPowerSpawn(e), 
this.runLinks(e);
}, r.prototype.runLabs = function(e) {
var t = Cn.getSwarmState(e.name);
if (t) {
uc.initialize(e.name), gu.prepareLabs(e, t);
var r = yu.planReactions(e, t);
if (r) {
var o = {
product: r.product,
input1: r.input1,
input2: r.input2,
amountNeeded: 1e3,
priority: r.priority
};
if (uc.areLabsReady(e.name, o)) {
var n = ks.getConfig(e.name), a = null == n ? void 0 : n.activeReaction;
a && a.input1 === r.input1 && a.input2 === r.input2 && a.output === r.product || uc.setActiveReaction(e.name, r.input1, r.input2, r.product), 
yu.executeReaction(e, r);
} else $r.debug("Labs not ready for reaction: ".concat(r.input1, " + ").concat(r.input2, " -> ").concat(r.product), {
subsystem: "Labs",
room: e.name
});
}
uc.save(e.name);
}
}, r.prototype.runFactory = function(e) {
var t, r, o = Su(e).factory;
if (o && !(o.cooldown > 0)) {
var n = [ RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_HYDROGEN, RESOURCE_OXYGEN ];
try {
for (var a = p(n), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
if (o.store.getUsedCapacity(s) >= 500 && o.store.getUsedCapacity(RESOURCE_ENERGY) >= 200 && o.produce(RESOURCE_UTRIUM_BAR) === OK) break;
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
}, r.prototype.runPowerSpawn = function(e) {
var t = Su(e).powerSpawn;
t && t.store.getUsedCapacity(RESOURCE_POWER) >= 1 && t.store.getUsedCapacity(RESOURCE_ENERGY) >= 50 && t.processPower();
}, r.prototype.runLinks = function(e) {
var t, r, o = Su(e), n = o.links;
if (!(n.length < 2)) {
var a = e.storage;
if (a) {
var i = n.find(function(e) {
return e.pos.getRangeTo(a) <= 2;
});
if (i) {
var s = o.sources, c = n.filter(function(e) {
return s.some(function(t) {
return e.pos.getRangeTo(t) <= 2;
});
}), u = e.controller, l = u ? n.find(function(e) {
return e.pos.getRangeTo(u) <= 3 && e.id !== i.id;
}) : void 0;
try {
for (var m = p(c), d = m.next(); !d.done; d = m.next()) {
var f = d.value;
if (f.store.getUsedCapacity(RESOURCE_ENERGY) >= 400 && 0 === f.cooldown && i.store.getFreeCapacity(RESOURCE_ENERGY) >= 400) return void f.transferEnergy(i);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
d && !d.done && (r = m.return) && r.call(m);
} finally {
if (t) throw t.error;
}
}
if (l && 0 === i.cooldown) {
var y = l.store.getUsedCapacity(RESOURCE_ENERGY) < 400, h = i.store.getUsedCapacity(RESOURCE_ENERGY) >= 400;
y && h && i.transferEnergy(l);
}
}
}
}
}, r;
}(), wu = function() {
function e() {
this.nodes = new Map;
}
return e.prototype.run = function() {
var e, t, r, o, n, a, i, s, c = global, u = c._ownedRooms, l = c._ownedRoomsTick;
s = u && l === Game.time ? u : Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
var m = s.length;
try {
for (var f = p(s), y = f.next(); !y.done; y = f.next()) {
var h = y.value;
this.nodes.has(h.name) || this.nodes.set(h.name, new Cu(h.name));
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
for (var g = p(this.nodes), v = g.next(); !v.done; v = g.next()) {
var R = d(v.value, 1)[0];
(h = Game.rooms[R]) && (null === (i = h.controller) || void 0 === i ? void 0 : i.my) || this.nodes.delete(R);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
v && !v.done && (o = g.return) && o.call(g);
} finally {
if (r) throw r.error;
}
}
try {
for (var E = p(this.nodes.values()), T = E.next(); !T.done; T = E.next()) {
var S = T.value;
try {
S.run(m);
} catch (e) {
var C = e instanceof Error ? e.message : String(e), w = e instanceof Error && e.stack ? e.stack : void 0;
$r.error("Error in room ".concat(S.roomName, ": ").concat(C), {
subsystem: "RoomManager",
room: S.roomName,
meta: {
stack: w
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
T && !T.done && (a = E.return) && a.call(E);
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
this.nodes.has(e.name) || this.nodes.set(e.name, new Cu(e.name));
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
$r.error("Error in room ".concat(e.name, ": ").concat(s), {
subsystem: "RoomManager",
room: e.name,
meta: {
stack: c
}
});
}
}
}, e;
}(), bu = new wu;

function xu(e) {
var t, r, o;
return e.find(FIND_HOSTILE_CREEPS).length > 0 ? yo.CRITICAL : (null === (t = e.controller) || void 0 === t ? void 0 : t.my) ? yo.HIGH : "ralphschuler" === (null === (o = null === (r = e.controller) || void 0 === r ? void 0 : r.reservation) || void 0 === o ? void 0 : o.username) ? yo.MEDIUM : yo.LOW;
}

function Ou(e) {
var t;
if (!(null === (t = e.controller) || void 0 === t ? void 0 : t.my)) return .02;
var r = e.controller.level;
return e.find(FIND_HOSTILE_CREEPS).length > 0 ? .12 : r <= 3 ? .04 : r <= 6 ? .06 : .08;
}

function _u(e, t, r) {
var o;
return t === yo.CRITICAL ? {
tickModulo: void 0,
tickOffset: void 0
} : t === yo.HIGH && (null === (o = e.controller) || void 0 === o ? void 0 : o.my) ? {
tickModulo: 5,
tickOffset: r % 5
} : t === yo.MEDIUM ? {
tickModulo: 10,
tickOffset: r % 10
} : t === yo.LOW ? {
tickModulo: 20,
tickOffset: r % 20
} : {
tickModulo: void 0,
tickOffset: void 0
};
}

var Au = function() {
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
var a = "room:".concat(o), i = _o.getProcess(a), s = xu(n), c = Ou(n);
this.registeredRooms.has(o) ? i && (i.priority !== s || Math.abs(i.cpuBudget - c) > 1e-4) && this.updateRoomProcess(n, s, c) : this.registerRoomProcess(n);
}
try {
for (var u = p(this.registeredRooms), l = u.next(); !l.done; l = u.next()) o = l.value, 
r.has(o) || this.unregisterRoomProcess(o);
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = u.return) && t.call(u);
} finally {
if (e) throw e.error;
}
}
}
}, e.prototype.registerRoomProcess = function(e) {
var t, r = xu(e), o = Ou(e), n = "room:".concat(e.name), a = this.getRoomIndex(e.name), i = _u(e, r, a);
_o.registerProcess({
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
t && bu.runRoom(t);
}
}), this.registeredRooms.add(e.name);
var s = i.tickModulo ? "(mod=".concat(i.tickModulo, ", offset=").concat(i.tickOffset, ")") : "(every tick)";
$r.debug("Registered room process: ".concat(e.name, " with priority ").concat(r, " ").concat(s), {
subsystem: "RoomProcessManager"
});
}, e.prototype.updateRoomProcess = function(e, t, r) {
var o, n = "room:".concat(e.name), a = this.getRoomIndex(e.name), i = _u(e, t, a);
_o.unregisterProcess(n), _o.registerProcess({
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
t && bu.runRoom(t);
}
});
var s = i.tickModulo ? "mod=".concat(i.tickModulo, ", offset=").concat(i.tickOffset) : "every tick";
$r.debug("Updated room process: ".concat(e.name, " priority=").concat(t, " budget=").concat(r, " (").concat(s, ")"), {
subsystem: "RoomProcessManager"
});
}, e.prototype.unregisterRoomProcess = function(e) {
var t = "room:".concat(e);
_o.unregisterProcess(t), this.registeredRooms.delete(e), this.roomIndices.delete(e), 
$r.debug("Unregistered room process: ".concat(e), {
subsystem: "RoomProcessManager"
});
}, e.prototype.getMinBucketForPriority = function(e) {
return 0;
}, e.prototype.getStats = function() {
var e, t, r, o, n, a = {}, i = 0;
try {
for (var s = p(this.registeredRooms), c = s.next(); !c.done; c = s.next()) {
var u = c.value, l = Game.rooms[u];
if (l) {
var m = xu(l), d = null !== (r = yo[m]) && void 0 !== r ? r : "UNKNOWN";
a[d] = (null !== (o = a[d]) && void 0 !== o ? o : 0) + 1, (null === (n = l.controller) || void 0 === n ? void 0 : n.my) && i++;
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
return {
totalRooms: Object.keys(Game.rooms).length,
registeredRooms: this.registeredRooms.size,
roomsByPriority: a,
ownedRooms: i
};
}, e.prototype.forceResync = function() {
this.lastSyncTick = -1, this.syncRoomProcesses();
}, e.prototype.reset = function() {
this.registeredRooms.clear(), this.roomIndices.clear(), this.nextRoomIndex = 0, 
this.lastSyncTick = -1;
}, e;
}(), Uu = new Au, Nu = {
debug: function(e, t) {
return Qr("RemoteMining").debug(e, t);
},
info: function(e, t) {
return Qr("RemoteMining").info(e, t);
},
warn: function(e, t) {
return Qr("RemoteMining").warn(e, t);
},
error: function(e, t) {
return Qr("RemoteMining").error(e, t);
}
}, Mu = {
getCachedPath: function(e, t) {
var r = Go(e, t), o = Mo.get(r, {
namespace: Io
});
if (!o) return null;
try {
return Room.deserializePath(o);
} catch (e) {
return Mo.invalidate(r, Io), null;
}
},
cachePath: Lo,
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
}, ku = {
scheduleTask: function(e, r, o, n, a) {
t.scheduleTask(e, r, o, n, a);
}
}, Pu = new s.RemotePathCache(Mu, Nu), Iu = new s.RemotePathScheduler(Nu, ku, Pu);

new s.RemoteMiningMovement(Nu, Mu, Pu, Oa.moveTo);

var Gu = function() {
function e() {}
return e.prototype.get = function(e) {
return Cn.getHeapCache().get(e);
}, e.prototype.set = function(e, t, r) {
Cn.getHeapCache().set(e, t, r);
}, e;
}(), Lu = function() {
function e() {
this.logger = Qr("Pathfinding");
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
}(), Du = function() {
function e() {}
return e.prototype.on = function(e, t) {
Ro.on(e, t);
}, e;
}(), Fu = function() {
function e() {}
return e.prototype.invalidateRoom = function(e) {
!function(e) {
var t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), r = new RegExp("^".concat(t, ":|:").concat(t, ":|:").concat(t, "$"));
Mo.invalidatePattern(r, Io);
}(e);
}, e.prototype.cacheCommonRoutes = function(e) {
!function(e) {
var t, r, o;
if (null === (o = e.controller) || void 0 === o ? void 0 : o.my) {
var n = e.storage;
if (n) {
var a = e.find(FIND_SOURCES);
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = e.findPath(n.pos, c.pos, {
ignoreCreeps: !0,
serialize: !1
});
u.length > 0 && (Lo(n.pos, c.pos, u), Lo(c.pos, n.pos, u));
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
if (e.controller) {
var l = e.findPath(n.pos, e.controller.pos, {
ignoreCreeps: !0,
range: 3,
serialize: !1
});
l.length > 0 && Lo(n.pos, e.controller.pos, l);
}
}
}
}(e);
}, e;
}(), Bu = function() {
function e() {}
return e.prototype.getRemoteRoomsForRoom = function(e) {
return function(e) {
return s.getRemoteRoomsForRoom(e);
}(e);
}, e.prototype.precacheRemoteRoutes = function(e, t) {
!function(e, t) {
Pu.precacheRemoteRoutes(e, t);
}(e, t);
}, e;
}();

new i.PortalManager(new Gu, new Lu);

var Wu, Vu = new i.PathCacheEventManager(new Lu, new Du, new Fu, new Bu), Ku = Qr("SS2TerminalComms"), Hu = function() {
function e() {}
return e.parseTransaction = function(e) {
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
for (var o = p(Game.market.incomingTransactions), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (!a.order && a.description && a.sender) {
var i = this.parseTransaction(a.description);
if (i) {
var s = "".concat(a.sender.username, ":").concat(i.msgId), c = this.messageBuffers.get(s);
if (!c) {
if (void 0 === i.finalPacket) continue;
c = {
msgId: i.msgId,
sender: a.sender.username,
finalPacket: i.finalPacket,
packets: new Map,
receivedAt: Game.time
}, this.messageBuffers.set(s, c);
}
if (c.packets.set(i.packetId, i.messageChunk), c.packets.size === c.finalPacket + 1) {
for (var u = [], l = 0; l <= c.finalPacket; l++) {
var m = c.packets.get(l);
if (!m) {
Ku.warn("Missing packet in multi-packet message", {
meta: {
packetId: l,
messageId: i.msgId,
sender: a.sender.username
}
});
break;
}
u.push(m);
}
if (u.length === c.finalPacket + 1) {
var d = u.join("");
r.push({
sender: a.sender.username,
message: d
}), this.messageBuffers.delete(s), Ku.info("Received complete multi-packet message from ".concat(a.sender.username), {
meta: {
messageId: i.msgId,
packets: u.length,
totalSize: d.length,
sender: a.sender.username
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
return r.length > 0 && Ku.debug("Processed ".concat(Game.market.incomingTransactions.length, " terminal transactions, completed ").concat(r.length, " messages")), 
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
return i ? (this.queuePackets(e.id, t, r, o, a, i), Ku.info("Queued ".concat(a.length, " packets for multi-packet message"), {
meta: {
terminalId: e.id,
messageId: i,
packets: a.length,
targetRoom: t
}
}), OK) : (Ku.error("Failed to extract message ID from first packet"), ERR_INVALID_ARGS);
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
var n = 0, a = [], i = Game.cpu.getUsed();
try {
for (var s = p(Object.entries(Memory.ss2PacketQueue)), c = s.next(); !c.done; c = s.next()) {
var u = d(c.value, 2), l = u[0], m = u[1];
if (Game.cpu.getUsed() - i > 5) {
Ku.debug("Queue processing stopped due to CPU budget limit (".concat(5, " CPU)"));
break;
}
var f = Game.getObjectById(m.terminalId);
if (f) {
if (!(f.cooldown > 0)) {
var y = m.packets[m.nextPacketIndex];
if (y) {
var h = f.send(m.resourceType, m.amount, m.targetRoom, y);
if (h === OK) {
if (Memory.ss2PacketQueue[l].nextPacketIndex = m.nextPacketIndex + 1, n++, Memory.ss2PacketQueue[l].nextPacketIndex >= m.packets.length) {
var g = this.extractMessageId(y);
Ku.info("Completed sending multi-packet message", {
meta: {
messageId: g,
packets: m.packets.length,
targetRoom: m.targetRoom
}
}), a.push(l);
}
} else h === ERR_NOT_ENOUGH_RESOURCES ? Ku.warn("Not enough resources to send packet, will retry next tick", {
meta: {
queueKey: l,
resource: m.resourceType,
amount: m.amount
}
}) : (Ku.error("Failed to send packet: ".concat(h, ", removing queue item"), {
meta: {
queueKey: l,
result: h
}
}), a.push(l));
} else Ku.warn("No packet at index ".concat(m.nextPacketIndex, ", removing queue item"), {
meta: {
queueKey: l
}
}), a.push(l);
}
} else Ku.warn("Terminal not found for queue item, removing from queue", {
meta: {
queueKey: l,
terminalId: m.terminalId
}
}), a.push(l);
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
for (var v = p(a), R = v.next(); !R.done; R = v.next()) {
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
return n > 0 && Ku.debug("Sent ".concat(n, " queued packets this tick")), n;
}, e.cleanupExpiredQueue = function() {
var e, t, r, o;
if (Memory.ss2PacketQueue) {
var n = Game.time, a = [];
try {
for (var i = p(Object.entries(Memory.ss2PacketQueue)), s = i.next(); !s.done; s = i.next()) {
var c = d(s.value, 2), u = c[0], l = c[1];
if (n - l.queuedAt > this.QUEUE_TIMEOUT) {
var m = this.extractMessageId(l.packets[0]);
Ku.warn("Queue item timed out after ".concat(n - l.queuedAt, " ticks"), {
meta: {
messageId: m,
queueKey: u,
sentPackets: l.nextPacketIndex,
totalPackets: l.packets.length
}
}), a.push(u);
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
try {
for (var f = p(a), y = f.next(); !y.done; y = f.next()) {
var h = y.value;
delete Memory.ss2PacketQueue[h];
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
for (var o = p(this.messageBuffers.entries()), n = o.next(); !n.done; n = o.next()) {
var a = d(n.value, 2), i = a[0], s = a[1];
r - s.receivedAt > this.MESSAGE_TIMEOUT && (Ku.warn("Message timed out", {
meta: {
messageId: s.msgId,
sender: s.sender
}
}), this.messageBuffers.delete(i));
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
return Ku.error("Error parsing JSON", {
meta: {
error: String(e)
}
}), null;
}
}, e.formatJSON = function(e) {
return JSON.stringify(e);
}, e.MAX_DESCRIPTION_LENGTH = 100, e.MESSAGE_CHUNK_SIZE = 91, e.MESSAGE_TIMEOUT = 1e3, 
e.QUEUE_TIMEOUT = 1e3, e.MESSAGE_ID_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 
e.messageBuffers = new Map, e.nextMessageId = 0, e;
}(), ju = {
lowBucketThreshold: 2e3,
highBucketThreshold: 9e3,
targetCpuUsage: .8,
highFrequencyInterval: 1,
mediumFrequencyInterval: 5,
lowFrequencyInterval: 20
}, Yu = function() {
function e(e) {
void 0 === e && (e = {}), this.tasks = new Map, this.currentMode = "normal", this.tickCpuUsed = 0, 
this.config = l(l({}, ju), e);
}
return e.prototype.registerTask = function(e) {
this.tasks.set(e.name, l(l({}, e), {
lastRun: 0
}));
}, e.prototype.unregisterTask = function(e) {
this.tasks.delete(e);
}, e.prototype.getBucketMode = function() {
var e = _o.getBucketMode();
return "critical" === e || "low" === e ? "low" : "high" === e ? "high" : "normal";
}, e.prototype.updateBucketMode = function() {
var e = this.getBucketMode();
e !== this.currentMode && ($r.info("Bucket mode changed: ".concat(this.currentMode, " -> ").concat(e), {
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
for (var o = p(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (this.shouldRunTask(a)) {
var i = Game.cpu.getUsed();
if (!(i + this.getCpuLimit() * a.cpuBudget > this.getCpuLimit() && "high" !== a.frequency)) {
try {
a.execute(), a.lastRun = Game.time;
} catch (e) {
var s = e instanceof Error ? e.message : String(e);
$r.error("Task ".concat(a.name, " failed: ").concat(s), {
subsystem: "Scheduler"
});
}
var c = Game.cpu.getUsed() - i;
if (this.tickCpuUsed += c, !this.hasCpuBudget()) {
$r.warn("CPU budget exhausted, skipping remaining tasks", {
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

new Yu, (Wu = {})[FIND_STRUCTURES] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, Wu[FIND_MY_STRUCTURES] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, Wu[FIND_HOSTILE_STRUCTURES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Wu[FIND_SOURCES_ACTIVE] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, Wu[FIND_SOURCES] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, Wu[FIND_MINERALS] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, Wu[FIND_DEPOSITS] = {
lowBucket: 200,
normal: 100,
highBucket: 50
}, Wu[FIND_MY_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Wu[FIND_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Wu[FIND_CREEPS] = {
lowBucket: 10,
normal: 5,
highBucket: 3
}, Wu[FIND_MY_CREEPS] = {
lowBucket: 10,
normal: 5,
highBucket: 3
}, Wu[FIND_HOSTILE_CREEPS] = {
lowBucket: 10,
normal: 3,
highBucket: 1
}, Wu[FIND_DROPPED_RESOURCES] = {
lowBucket: 20,
normal: 5,
highBucket: 3
}, Wu[FIND_TOMBSTONES] = {
lowBucket: 30,
normal: 10,
highBucket: 5
}, Wu[FIND_RUINS] = {
lowBucket: 30,
normal: 10,
highBucket: 5
}, Wu[FIND_FLAGS] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, Wu[FIND_MY_SPAWNS] = {
lowBucket: 200,
normal: 100,
highBucket: 50
}, Wu[FIND_HOSTILE_SPAWNS] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, Wu[FIND_HOSTILE_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Wu[FIND_NUKES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Wu[FIND_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, Wu[FIND_MY_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, Wu[FIND_HOSTILE_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, Wu[FIND_EXIT_TOP] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, Wu[FIND_EXIT_RIGHT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, Wu[FIND_EXIT_BOTTOM] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, Wu[FIND_EXIT_LEFT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, Wu[FIND_EXIT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
};

var qu = new r.RoomVisualizer({}, Cn), zu = new r.MapVisualizer({}, Cn), Xu = !1, Qu = !1;

function $u() {
var e, t;
if (So().visualizations) {
var r = function() {
var e;
return null !== (e = Mo.get("ownedRooms", {
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
for (var o = p(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
try {
qu.draw(a);
} catch (e) {
var i = e instanceof Error ? e.message : String(e);
$r.error("Visualization error in ".concat(a.name, ": ").concat(i), {
subsystem: "visualizations",
room: a.name
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
zu.draw();
} catch (e) {
i = e instanceof Error ? e.message : String(e), $r.error("Map visualization error: ".concat(i), {
subsystem: "visualizations"
});
}
}
}

function Ju() {
var r, a;
Qu && Game.time % 10 != 0 || $r.info("SwarmBot loop executing at tick ".concat(Game.time), {
subsystem: "SwarmBot",
meta: {
systemsInitialized: Qu
}
}), Qu || (Lr({
level: (a = So()).debug ? Nr.DEBUG : Nr.INFO,
cpuLogging: a.profiling,
enableBatching: !0,
maxBatchSize: 50
}), $r.info("Bot initialized", {
subsystem: "SwarmBot",
meta: {
debug: a.debug,
profiling: a.profiling
}
}), e.unifiedStats.initialize(), a.profiling && (function() {
if (PathFinder.search && !PathFinder.search.__nativeCallsTrackerWrapped) {
var t = Object.getOwnPropertyDescriptor(PathFinder, "search");
if (t && !1 === t.configurable) Gs.warn("Cannot wrap PathFinder.search - property is not configurable"); else {
var r = PathFinder.search;
try {
var o = function() {
for (var t = [], o = 0; o < arguments.length; o++) t[o] = arguments[o];
return e.unifiedStats.recordNativeCall("pathfinderSearch"), r.apply(PathFinder, t);
};
o.__nativeCallsTrackerWrapped = !0, Object.defineProperty(PathFinder, "search", {
value: o,
writable: !0,
enumerable: !0,
configurable: !0
});
} catch (e) {
Gs.warn("Failed to wrap PathFinder.search", {
meta: {
error: String(e)
}
});
}
}
}
}(), Ls(r = Creep.prototype, "moveTo", "moveTo"), Ls(r, "move", "move"), Ls(r, "harvest", "harvest"), 
Ls(r, "transfer", "transfer"), Ls(r, "withdraw", "withdraw"), Ls(r, "build", "build"), 
Ls(r, "repair", "repair"), Ls(r, "upgradeController", "upgradeController"), Ls(r, "attack", "attack"), 
Ls(r, "rangedAttack", "rangedAttack"), Ls(r, "heal", "heal"), Ls(r, "dismantle", "dismantle"), 
Ls(r, "say", "say")), _o.on("structure.destroyed", function(e) {
var t = Cn.getSwarmState(e.roomName);
t && (Ns.onStructureDestroyed(t, e.structureType), $r.debug("Pheromone update: structure destroyed in ".concat(e.roomName), {
subsystem: "Pheromone",
room: e.roomName
}));
}), _o.on("remote.lost", function(e) {
var t = Cn.getSwarmState(e.homeRoom);
t && (Ns.onRemoteSourceLost(t), $r.info("Pheromone update: remote source lost for ".concat(e.homeRoom), {
subsystem: "Pheromone",
room: e.homeRoom
}));
}), $r.info("Pheromone event handlers initialized", {
subsystem: "Pheromone"
}), Vu.initializePathCacheEvents(), Iu.initialize(t.TaskPriority.MEDIUM), ro.initialize(), 
ta.initialize(), Qu = !0), _o.updateFromCpuConfig(So().cpu), Xu || ($r.info("Registering all processes with kernel...", {
subsystem: "ProcessRegistry"
}), function() {
for (var e, t, r = [], o = 0; o < arguments.length; o++) r[o] = arguments[o];
try {
for (var n = p(r), a = n.next(); !a.done; a = n.next()) Qn(a.value);
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
$r.info("Registered decorated processes from ".concat(r.length, " instance(s)"), {
subsystem: "ProcessDecorators"
});
}(Is, n.terminalManager, n.factoryManager, n.linkManager, Si, bi, ss, n.marketManager, Pi, Li, Ni, Bi, ji, ta, ls, Os, ii, o.evacuationManager, o.defenseCoordinator), 
$r.info("Registered ".concat(_o.getProcesses().length, " processes with kernel"), {
subsystem: "ProcessRegistry"
}), _o.initialize(), Xu = !0), e.unifiedStats.startTick(), "critical" === _o.getBucketMode() && Game.time % 10 == 0 && $r.warn("CRITICAL: CPU bucket at ".concat(Game.cpu.bucket, ", continuing normal processing"), {
subsystem: "SwarmBot"
}), Aa.clear(), Ea.clear(), Ro.startTick();
var i, s = "_ownedRooms", c = "_ownedRoomsTick", u = global, l = u[s], m = u[c];
l && m === Game.time ? i = l : (i = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), u[s] = i, u[c] = Game.time), Oa.preTick(), Cn.initialize(), e.unifiedStats.measureSubsystem("processSync", function() {
jc.syncCreepProcesses(), Uu.syncRoomProcesses();
}), e.unifiedStats.measureSubsystem("kernel", function() {
_o.run();
}), e.unifiedStats.measureSubsystem("eventQueue", function() {
Ro.processQueue();
}), e.unifiedStats.measureSubsystem("spawns", function() {
!function() {
var e, t, r;
try {
for (var o = p(Object.values(Game.rooms)), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
(null === (r = a.controller) || void 0 === r ? void 0 : r.my) && ga(a, Cn.getOrInitSwarmState(a.name));
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
}), e.unifiedStats.measureSubsystem("ss2PacketQueue", function() {
Hu.processQueue();
}), _o.hasCpuBudget() && e.unifiedStats.measureSubsystem("powerCreeps", function() {
!function() {
var e, t;
try {
for (var r = p(Object.values(Game.powerCreeps)), o = r.next(); !o.done; o = r.next()) {
var n = o.value;
void 0 !== n.ticksToLive && Fc(n);
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
}), _o.hasCpuBudget() && e.unifiedStats.measureSubsystem("visualizations", function() {
$u();
}), Oa.reconcileTraffic(), _o.hasCpuBudget() && e.unifiedStats.measureSubsystem("scheduledTasks", function() {
var e = Math.max(0, Game.cpu.limit - Game.cpu.getUsed());
t.runScheduledTasks(e);
}), Cn.persistHeapCache(), e.unifiedStats.collectProcessStats(_o.getProcesses().reduce(function(e, t) {
return e.set(t.id, t), e;
}, new Map)), e.unifiedStats.collectKernelBudgetStats(_o), e.unifiedStats.setSkippedProcesses(_o.getSkippedProcessesThisTick()), 
e.unifiedStats.finalizeTick(), $r.flush();
}

var Zu = function() {
function e() {}
return e.prototype.status = function(e) {
var t, r, o, n, a, i, s, c, u = ks.getConfig(e);
if (!u) return "No lab configuration for ".concat(e);
var l = "=== Lab Status: ".concat(e, " ===\n");
l += "Valid: ".concat(u.isValid, "\n"), l += "Labs: ".concat(u.labs.length, "\n"), 
l += "Last Update: ".concat(Game.time - u.lastUpdate, " ticks ago\n\n"), u.activeReaction && (l += "Active Reaction:\n", 
l += "  ".concat(u.activeReaction.input1, " + ").concat(u.activeReaction.input2, " → ").concat(u.activeReaction.output, "\n\n")), 
l += "Lab Assignments:\n";
try {
for (var m = p(u.labs), d = m.next(); !d.done; d = m.next()) {
var f = d.value, y = Game.getObjectById(f.labId), h = null !== (s = null == y ? void 0 : y.mineralType) && void 0 !== s ? s : "empty", g = null !== (c = null == y ? void 0 : y.store[h]) && void 0 !== c ? c : 0;
l += "  ".concat(f.role, ": ").concat(h, " (").concat(g, ") @ (").concat(f.pos.x, ",").concat(f.pos.y, ")\n");
}
} catch (e) {
t = {
error: e
};
} finally {
try {
d && !d.done && (r = m.return) && r.call(m);
} finally {
if (t) throw t.error;
}
}
var v = uc.getLabResourceNeeds(e);
if (v.length > 0) {
l += "\nResource Needs:\n";
try {
for (var R = p(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
l += "  ".concat(T.resourceType, ": ").concat(T.amount, " (priority ").concat(T.priority, ")\n");
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
var S = uc.getLabOverflow(e);
if (S.length > 0) {
l += "\nOverflow (needs emptying):\n";
try {
for (var C = p(S), w = C.next(); !w.done; w = C.next()) {
var b = w.value;
l += "  ".concat(b.resourceType, ": ").concat(b.amount, " (priority ").concat(b.priority, ")\n");
}
} catch (e) {
a = {
error: e
};
} finally {
try {
w && !w.done && (i = C.return) && i.call(C);
} finally {
if (a) throw a.error;
}
}
}
return l;
}, e.prototype.setReaction = function(e, t, r, o) {
return uc.setActiveReaction(e, t, r, o) ? "Set active reaction: ".concat(t, " + ").concat(r, " → ").concat(o) : "Failed to set reaction (check lab configuration)";
}, e.prototype.clear = function(e) {
return uc.clearReactions(e), "Cleared active reactions in ".concat(e);
}, e.prototype.boost = function(e, t) {
var r, o, n = Game.rooms[e];
if (!n) return "Room ".concat(e, " not visible");
var a = gu.areBoostLabsReady(n, t), i = gu.getMissingBoosts(n, t), s = "=== Boost Status: ".concat(e, " / ").concat(t, " ===\n");
if (s += "Ready: ".concat(a, "\n"), i.length > 0) {
s += "\nMissing Boosts:\n";
try {
for (var c = p(i), u = c.next(); !u.done; u = c.next()) {
var l = u.value;
s += "  - ".concat(l, "\n");
}
} catch (e) {
r = {
error: e
};
} finally {
try {
u && !u.done && (o = c.return) && o.call(c);
} finally {
if (r) throw r.error;
}
}
} else s += "\nAll boosts ready!";
return s;
}, m([ lo({
name: "labs.status",
description: "Get lab status for a room",
usage: "labs.status(roomName)",
examples: [ "labs.status('E1S1')" ],
category: "Labs"
}) ], e.prototype, "status", null), m([ lo({
name: "labs.setReaction",
description: "Set active reaction for a room",
usage: "labs.setReaction(roomName, input1, input2, output)",
examples: [ "labs.setReaction('E1S1', RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_HYDROXIDE)" ],
category: "Labs"
}) ], e.prototype, "setReaction", null), m([ lo({
name: "labs.clear",
description: "Clear active reaction for a room",
usage: "labs.clear(roomName)",
examples: [ "labs.clear('E1S1')" ],
category: "Labs"
}) ], e.prototype, "clear", null), m([ lo({
name: "labs.boost",
description: "Check boost lab readiness for a role",
usage: "labs.boost(roomName, role)",
examples: [ "labs.boost('E1S1', 'soldier')" ],
category: "Labs"
}) ], e.prototype, "boost", null), e;
}(), el = function() {
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
var e, t, r, o, n, a = Object.values(Game.market.orders);
if (0 === a.length) return "No active market orders";
var i = "=== Active Market Orders (".concat(a.length, ") ===\n");
i += "Type | Resource | Price | Remaining | Room\n", i += "-".repeat(70) + "\n";
try {
for (var s = p(a), c = s.next(); !c.done; c = s.next()) {
var u = c.value, l = u.type === ORDER_BUY ? "BUY " : "SELL", m = u.price.toFixed(3), d = null !== (o = null === (r = u.remainingAmount) || void 0 === r ? void 0 : r.toString()) && void 0 !== o ? o : "?";
i += "".concat(l, " | ").concat(u.resourceType, " | ").concat(m, " | ").concat(d, " | ").concat(null !== (n = u.roomName) && void 0 !== n ? n : "N/A", "\n");
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
return i;
}, e.prototype.profit = function() {
var e = "=== Market Profit ===\n";
return (e += "Credits: ".concat(Game.market.credits.toLocaleString(), "\n")) + "\nNote: Detailed profit tracking requires memory access\n";
}, m([ lo({
name: "market.data",
description: "Get market data for a resource",
usage: "market.data(resource)",
examples: [ "market.data(RESOURCE_ENERGY)", "market.data(RESOURCE_GHODIUM)" ],
category: "Market"
}) ], e.prototype, "data", null), m([ lo({
name: "market.orders",
description: "List your active market orders",
usage: "market.orders()",
examples: [ "market.orders()" ],
category: "Market"
}) ], e.prototype, "orders", null), m([ lo({
name: "market.profit",
description: "Show market trading profit statistics",
usage: "market.profit()",
examples: [ "market.profit()" ],
category: "Market"
}) ], e.prototype, "profit", null), e;
}(), tl = function() {
function e() {}
return e.prototype.gpl = function() {
var e = ji.getGPLState();
if (!e) return "GPL tracking not available (no power unlocked)";
var t = "=== GPL Status ===\n";
t += "Level: ".concat(e.currentLevel, "\n"), t += "Progress: ".concat(e.currentProgress, " / ").concat(e.progressNeeded, "\n"), 
t += "Completion: ".concat((e.currentProgress / e.progressNeeded * 100).toFixed(1), "%\n"), 
t += "Target Milestone: ".concat(e.targetMilestone, "\n");
var r = e.ticksToNextLevel === 1 / 0 ? "N/A (no progress yet)" : "".concat(e.ticksToNextLevel.toLocaleString(), " ticks");
return (t += "Estimated Time: ".concat(r, "\n")) + "\nTotal Power Processed: ".concat(e.totalPowerProcessed.toLocaleString(), "\n");
}, e.prototype.creeps = function() {
var e, t, r = ji.getAssignments();
if (0 === r.length) return "No power creeps created yet";
var o = "=== Power Creeps (".concat(r.length, ") ===\n");
o += "Name | Role | Room | Level | Spawned\n", o += "-".repeat(70) + "\n";
try {
for (var n = p(r), a = n.next(); !a.done; a = n.next()) {
var i = a.value, s = i.spawned ? "✓" : "✗";
o += "".concat(i.name, " | ").concat(i.role, " | ").concat(i.assignedRoom, " | ").concat(i.level, " | ").concat(s, "\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.operations = function() {
var e, t, r = Bi.getActiveOperations();
if (0 === r.length) return "No active power bank operations";
var o = "=== Power Bank Operations (".concat(r.length, ") ===\n");
try {
for (var n = p(r), a = n.next(); !a.done; a = n.next()) {
var i = a.value;
o += "\nRoom: ".concat(i.roomName, "\n"), o += "Power: ".concat(i.power, "\n"), 
o += "State: ".concat(i.state, "\n"), o += "Home: ".concat(i.homeRoom, "\n"), o += "Attackers: ".concat(i.assignedCreeps.attackers.length, "\n"), 
o += "Healers: ".concat(i.assignedCreeps.healers.length, "\n"), o += "Carriers: ".concat(i.assignedCreeps.carriers.length, "\n"), 
o += "Damage: ".concat(Math.round(i.damageDealt / 1e3), "k / 2000k\n"), o += "Collected: ".concat(i.powerCollected, "\n"), 
o += "Decay: ".concat(i.decayTick - Game.time, " ticks\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.assign = function(e, t) {
return ji.reassignPowerCreep(e, t) ? "Reassigned ".concat(e, " to ").concat(t) : "Failed to reassign ".concat(e, " (not found)");
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
}, m([ lo({
name: "power.gpl",
description: "Show GPL (Global Power Level) status",
usage: "power.gpl()",
examples: [ "power.gpl()" ],
category: "Power"
}) ], e.prototype, "gpl", null), m([ lo({
name: "power.creeps",
description: "List power creeps and their assignments",
usage: "power.creeps()",
examples: [ "power.creeps()" ],
category: "Power"
}) ], e.prototype, "creeps", null), m([ lo({
name: "power.operations",
description: "List active power bank operations",
usage: "power.operations()",
examples: [ "power.operations()" ],
category: "Power"
}) ], e.prototype, "operations", null), m([ lo({
name: "power.assign",
description: "Reassign a power creep to a different room",
usage: "power.assign(powerCreepName, roomName)",
examples: [ "power.assign('operator_eco', 'E2S2')" ],
category: "Power"
}) ], e.prototype, "assign", null), m([ lo({
name: "power.create",
description: "Manually create a new power creep (automatic creation is also enabled)",
usage: "power.create(name, className)",
examples: [ "power.create('operator_eco', POWER_CLASS.OPERATOR)", "power.create('my_operator', 'operator')" ],
category: "Power"
}) ], e.prototype, "create", null), m([ lo({
name: "power.spawn",
description: "Manually spawn a power creep at a power spawn",
usage: "power.spawn(powerCreepName, roomName?)",
examples: [ "power.spawn('operator_eco')", "power.spawn('operator_eco', 'E2S2')" ],
category: "Power"
}) ], e.prototype, "spawn", null), m([ lo({
name: "power.upgrade",
description: "Manually upgrade a power creep with a specific power",
usage: "power.upgrade(powerCreepName, power)",
examples: [ "power.upgrade('operator_eco', PWR_OPERATE_SPAWN)", "power.upgrade('operator_eco', PWR_OPERATE_TOWER)" ],
category: "Power"
}) ], e.prototype, "upgrade", null), e;
}(), rl = new Zu, ol = new el, nl = new tl, al = function() {
function e() {}
return e.prototype.status = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = ta.getCurrentShardState();
if (!o) return "No shard state found for ".concat(r);
var n = o.health, a = [ "=== Shard Status: ".concat(r, " ==="), "Role: ".concat(o.role.toUpperCase()), "Rooms: ".concat(n.roomCount, " (Avg RCL: ").concat(n.avgRCL, ")"), "Creeps: ".concat(n.creepCount), "CPU: ".concat(n.cpuCategory.toUpperCase(), " (").concat(Math.round(100 * n.cpuUsage), "%)"), "Bucket: ".concat(n.bucketLevel), "Economy Index: ".concat(n.economyIndex, "%"), "War Index: ".concat(n.warIndex, "%"), "Portals: ".concat(o.portals.length), "Active Tasks: ".concat(o.activeTasks.length), "Last Update: ".concat(n.lastUpdate) ];
return o.cpuLimit && a.push("CPU Limit: ".concat(o.cpuLimit)), a.join("\n");
}, e.prototype.all = function() {
var e, t, r = ta.getAllShards();
if (0 === r.length) return "No shards tracked yet";
var o = [ "=== All Shards ===" ];
try {
for (var n = p(r), a = n.next(); !a.done; a = n.next()) {
var i = a.value, s = i.health;
o.push("".concat(i.name, " [").concat(i.role, "]: ").concat(s.roomCount, " rooms, RCL ").concat(s.avgRCL, ", ") + "CPU ".concat(s.cpuCategory, " (").concat(Math.round(100 * s.cpuUsage), "%), ") + "Eco ".concat(s.economyIndex, "%, War ").concat(s.warIndex, "%"));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o.join("\n");
}, e.prototype.setRole = function(e) {
var t = [ "core", "frontier", "resource", "backup", "war" ];
return t.includes(e) ? (ta.setShardRole(e), "Shard role set to: ".concat(e.toUpperCase())) : "Invalid role: ".concat(e, ". Valid roles: ").concat(t.join(", "));
}, e.prototype.portals = function(e) {
var t, r, o, n, a, i = null !== (n = null === (o = Game.shard) || void 0 === o ? void 0 : o.name) && void 0 !== n ? n : "shard0", s = ta.getCurrentShardState();
if (!s) return "No shard state found for ".concat(i);
var c = s.portals;
if (e && (c = c.filter(function(t) {
return t.targetShard === e;
})), 0 === c.length) return e ? "No portals to ".concat(e) : "No portals discovered yet";
var u = [ e ? "=== Portals to ".concat(e, " ===") : "=== All Portals ===" ];
try {
for (var l = p(c), m = l.next(); !m.done; m = l.next()) {
var d = m.value, f = d.isStable ? "✓" : "✗", y = "⚠".repeat(d.threatRating), h = null !== (a = d.traversalCount) && void 0 !== a ? a : 0, g = Game.time - d.lastScouted;
u.push("".concat(d.sourceRoom, " → ").concat(d.targetShard, "/").concat(d.targetRoom, " ") + "[".concat(f, "] ").concat(y || "○", " (").concat(h, " uses, ").concat(g, "t ago)"));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
m && !m.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
return u.join("\n");
}, e.prototype.bestPortal = function(e, t) {
var r, o = ta.getOptimalPortalRoute(e, t);
if (!o) return "No portal found to ".concat(e);
var n = o.isStable ? "Stable" : "Unstable", a = o.threatRating > 0 ? " (Threat: ".concat(o.threatRating, ")") : "";
return "Best portal to ".concat(e, ":\n") + "  Source: ".concat(o.sourceRoom, " (").concat(o.sourcePos.x, ",").concat(o.sourcePos.y, ")\n") + "  Target: ".concat(o.targetShard, "/").concat(o.targetRoom, "\n") + "  Status: ".concat(n).concat(a, "\n") + "  Traversals: ".concat(null !== (r = o.traversalCount) && void 0 !== r ? r : 0, "\n") + "  Last Scouted: ".concat(Game.time - o.lastScouted, " ticks ago");
}, e.prototype.createTask = function(e, t, r, o) {
void 0 === o && (o = 50);
var n = [ "colonize", "reinforce", "transfer", "evacuate" ];
return n.includes(e) ? (ta.createTask(e, t, r, o), "Created ".concat(e, " task to ").concat(t).concat(r ? "/".concat(r) : "", " (priority: ").concat(o, ")")) : "Invalid task type: ".concat(e, ". Valid types: ").concat(n.join(", "));
}, e.prototype.transferResource = function(e, t, r, o, n) {
return void 0 === n && (n = 50), ta.createResourceTransferTask(e, t, r, o, n), "Created resource transfer task:\n" + "  ".concat(o, " ").concat(r, " → ").concat(e, "/").concat(t, "\n") + "  Priority: ".concat(n);
}, e.prototype.transfers = function() {
var e, t, r = oa.getActiveRequests();
if (0 === r.length) return "No active resource transfers";
var o = [ "=== Active Resource Transfers ===" ];
try {
for (var n = p(r), a = n.next(); !a.done; a = n.next()) {
var i = a.value, s = Math.round(i.transferred / i.amount * 100), c = i.assignedCreeps.length;
o.push("".concat(i.taskId, ": ").concat(i.amount, " ").concat(i.resourceType, "\n") + "  ".concat(i.sourceRoom, " → ").concat(i.targetShard, "/").concat(i.targetRoom, "\n") + "  Status: ".concat(i.status.toUpperCase(), " (").concat(s, "%)\n") + "  Creeps: ".concat(c, ", Priority: ").concat(i.priority));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o.join("\n");
}, e.prototype.cpuHistory = function() {
var e, t, r = ta.getCurrentShardState();
if (!r || !r.cpuHistory || 0 === r.cpuHistory.length) return "No CPU history available";
var o = [ "=== CPU Allocation History ===" ];
try {
for (var n = p(r.cpuHistory.slice(-10)), a = n.next(); !a.done; a = n.next()) {
var i = a.value, s = Math.round(i.cpuUsed / i.cpuLimit * 100);
o.push("Tick ".concat(i.tick, ": ").concat(i.cpuUsed.toFixed(2), "/").concat(i.cpuLimit, " (").concat(s, "%) ") + "Bucket: ".concat(i.bucketLevel));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o.join("\n");
}, e.prototype.tasks = function() {
var e, t, r, o = ta.getActiveTransferTasks();
if (0 === o.length) return "No active inter-shard tasks";
var n = [ "=== Inter-Shard Tasks ===" ];
try {
for (var a = p(o), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = null !== (r = s.progress) && void 0 !== r ? r : 0;
n.push("".concat(s.id, " [").concat(s.type.toUpperCase(), "]\n") + "  ".concat(s.sourceShard, " → ").concat(s.targetShard).concat(s.targetRoom ? "/".concat(s.targetRoom) : "", "\n") + "  Status: ".concat(s.status.toUpperCase(), " (").concat(c, "%)\n") + "  Priority: ".concat(s.priority));
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
return n.join("\n");
}, e.prototype.syncStatus = function() {
var e = ta.getSyncStatus(), t = e.isHealthy ? "✓ HEALTHY" : "⚠ DEGRADED";
return "=== InterShardMemory Sync Status ===\n" + "Status: ".concat(t, "\n") + "Last Sync: ".concat(e.lastSync, " (").concat(e.ticksSinceSync, " ticks ago)\n") + "Memory Usage: ".concat(e.memorySize, " / ").concat(Vn, " bytes (").concat(e.sizePercent, "%)\n") + "Shards Tracked: ".concat(e.shardsTracked, "\n") + "Active Tasks: ".concat(e.activeTasks, "\n") + "Total Portals: ".concat(e.totalPortals);
}, e.prototype.memoryStats = function() {
var e = ta.getMemoryStats();
return "=== InterShardMemory Usage ===\n" + "Total: ".concat(e.size, " / ").concat(e.limit, " bytes (").concat(e.percent, "%)\n") + "\nBreakdown:\n" + "  Shards: ".concat(e.breakdown.shards, " bytes\n") + "  Tasks: ".concat(e.breakdown.tasks, " bytes\n") + "  Portals: ".concat(e.breakdown.portals, " bytes\n") + "  Other: ".concat(e.breakdown.other, " bytes");
}, e.prototype.forceSync = function() {
return ta.forceSync(), "InterShardMemory sync forced. Check logs for results.";
}, m([ lo({
name: "shard.status",
description: "Display current shard status and metrics",
usage: "shard.status()",
examples: [ "shard.status()" ],
category: "Shard"
}) ], e.prototype, "status", null), m([ lo({
name: "shard.all",
description: "List all known shards with summary info",
usage: "shard.all()",
examples: [ "shard.all()" ],
category: "Shard"
}) ], e.prototype, "all", null), m([ lo({
name: "shard.setRole",
description: "Manually set the role for the current shard",
usage: "shard.setRole(role)",
examples: [ "shard.setRole('core')", "shard.setRole('frontier')", "shard.setRole('resource')", "shard.setRole('backup')", "shard.setRole('war')" ],
category: "Shard"
}) ], e.prototype, "setRole", null), m([ lo({
name: "shard.portals",
description: "List all known portals from the current shard",
usage: "shard.portals(targetShard?)",
examples: [ "shard.portals()", "shard.portals('shard1')" ],
category: "Shard"
}) ], e.prototype, "portals", null), m([ lo({
name: "shard.bestPortal",
description: "Find the optimal portal route to a target shard",
usage: "shard.bestPortal(targetShard, fromRoom?)",
examples: [ "shard.bestPortal('shard1')", "shard.bestPortal('shard2', 'E1N1')" ],
category: "Shard"
}) ], e.prototype, "bestPortal", null), m([ lo({
name: "shard.createTask",
description: "Create a cross-shard task",
usage: "shard.createTask(type, targetShard, targetRoom?, priority?)",
examples: [ "shard.createTask('colonize', 'shard1', 'E5N5', 80)", "shard.createTask('reinforce', 'shard2', 'W1N1', 90)", "shard.createTask('evacuate', 'shard0', 'E1N1', 100)" ],
category: "Shard"
}) ], e.prototype, "createTask", null), m([ lo({
name: "shard.transferResource",
description: "Create a cross-shard resource transfer task",
usage: "shard.transferResource(targetShard, targetRoom, resourceType, amount, priority?)",
examples: [ "shard.transferResource('shard1', 'E5N5', 'energy', 50000, 70)", "shard.transferResource('shard2', 'W1N1', 'U', 5000, 80)" ],
category: "Shard"
}) ], e.prototype, "transferResource", null), m([ lo({
name: "shard.transfers",
description: "List active cross-shard resource transfers",
usage: "shard.transfers()",
examples: [ "shard.transfers()" ],
category: "Shard"
}) ], e.prototype, "transfers", null), m([ lo({
name: "shard.cpuHistory",
description: "Display CPU allocation history for the current shard",
usage: "shard.cpuHistory()",
examples: [ "shard.cpuHistory()" ],
category: "Shard"
}) ], e.prototype, "cpuHistory", null), m([ lo({
name: "shard.tasks",
description: "List all inter-shard tasks",
usage: "shard.tasks()",
examples: [ "shard.tasks()" ],
category: "Shard"
}) ], e.prototype, "tasks", null), m([ lo({
name: "shard.syncStatus",
description: "Display InterShardMemory sync status and health",
usage: "shard.syncStatus()",
examples: [ "shard.syncStatus()" ],
category: "Shard"
}) ], e.prototype, "syncStatus", null), m([ lo({
name: "shard.memoryStats",
description: "Display InterShardMemory size breakdown",
usage: "shard.memoryStats()",
examples: [ "shard.memoryStats()" ],
category: "Shard"
}) ], e.prototype, "memoryStats", null), m([ lo({
name: "shard.forceSync",
description: "Force a full InterShardMemory sync with validation",
usage: "shard.forceSync()",
examples: [ "shard.forceSync()" ],
category: "Shard"
}) ], e.prototype, "forceSync", null), e;
}(), il = new al, sl = {
maxPredictionTicks: 100,
safetyMargin: .9,
enableLogging: !1
}, cl = function() {
function e(e) {
void 0 === e && (e = {}), this.config = l(l({}, sl), e);
}
return e.prototype.predictEnergyInTicks = function(e, t) {
if (t < 0) throw new Error("Cannot predict negative ticks");
t > this.config.maxPredictionTicks && ($r.warn("Prediction horizon ".concat(t, " exceeds max ").concat(this.config.maxPredictionTicks, ", clamping"), {
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
return this.config.enableLogging && $r.debug("Energy prediction for ".concat(e.name, ": ").concat(n, " → ").concat(i, " (").concat(t, " ticks, ").concat(a.toFixed(2), "/tick)"), {
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
for (var a = p(o), i = a.next(); !i.done; i = a.next()) n += i.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
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
return 2 * n * .5;
}, e.prototype.calculateMinerIncome = function(e) {
var t, r, o = e.find(FIND_MY_CREEPS, {
filter: function(e) {
return "staticMiner" === e.memory.role || "miner" === e.memory.role;
}
}), n = 0;
try {
for (var a = p(o), i = a.next(); !i.done; i = a.next()) n += i.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
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
for (var a = p(o), i = a.next(); !i.done; i = a.next()) n += i.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
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
for (var a = p(o), i = a.next(); !i.done; i = a.next()) n += i.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
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
this.config = l(l({}, this.config), e);
}, e.prototype.getConfig = function() {
return l({}, this.config);
}, e;
}(), ul = new cl, ll = new (function() {
function e() {}
return e.prototype.predictEnergy = function(e, t) {
void 0 === t && (t = 50);
var r = Game.rooms[e];
if (!r) return "Room ".concat(e, " is not visible");
if (!r.controller || !r.controller.my) return "Room ".concat(e, " is not owned by you");
var o = ul.predictEnergyInTicks(r, t), n = "=== Energy Prediction: ".concat(e, " ===\n");
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
var r = ul.calculateEnergyIncome(t), o = "=== Energy Income: ".concat(e, " ===\n");
return o += "Harvesters: ".concat(r.harvesters.toFixed(2), " energy/tick\n"), o += "Static Miners: ".concat(r.miners.toFixed(2), " energy/tick\n"), 
(o += "Links: ".concat(r.links.toFixed(2), " energy/tick\n")) + "Total: ".concat(r.total.toFixed(2), " energy/tick\n");
}, e.prototype.showConsumption = function(e) {
var t = Game.rooms[e];
if (!t) return "Room ".concat(e, " is not visible");
var r = ul.calculateEnergyConsumption(t), o = "=== Energy Consumption: ".concat(e, " ===\n");
return o += "Upgraders: ".concat(r.upgraders.toFixed(2), " energy/tick\n"), o += "Builders: ".concat(r.builders.toFixed(2), " energy/tick\n"), 
o += "Towers: ".concat(r.towers.toFixed(2), " energy/tick\n"), o += "Spawning: ".concat(r.spawning.toFixed(2), " energy/tick\n"), 
(o += "Repairs: ".concat(r.repairs.toFixed(2), " energy/tick\n")) + "Total: ".concat(r.total.toFixed(2), " energy/tick\n");
}, e.prototype.canAfford = function(e, t, r) {
void 0 === r && (r = 50);
var o = Game.rooms[e];
if (!o) return "Room ".concat(e, " is not visible");
var n = ul.canAffordInTicks(o, t, r), a = ul.predictEnergyInTicks(o, r);
if (n) return "✓ Room ".concat(e, " CAN afford ").concat(t, " energy within ").concat(r, " ticks (predicted: ").concat(Math.round(a.predicted), ")");
var i = ul.getRecommendedSpawnDelay(o, t);
return i >= 999 ? "✗ Room ".concat(e, " CANNOT afford ").concat(t, " energy (negative energy flow)") : "✗ Room ".concat(e, " CANNOT afford ").concat(t, " energy within ").concat(r, " ticks (would need ").concat(i, " ticks)");
}, e.prototype.getSpawnDelay = function(e, t) {
var r = Game.rooms[e];
if (!r) return "Room ".concat(e, " is not visible");
var o = ul.getRecommendedSpawnDelay(r, t), n = r.energyAvailable;
if (0 === o) return "✓ Room ".concat(e, " can spawn ").concat(t, " energy body NOW (current: ").concat(n, ")");
if (o >= 999) return "✗ Room ".concat(e, " has negative energy flow, cannot spawn ").concat(t, " energy body");
var a = ul.predictEnergyInTicks(r, o);
return "Room ".concat(e, " needs to wait ").concat(o, " ticks to spawn ").concat(t, " energy body (current: ").concat(n, ", predicted: ").concat(Math.round(a.predicted), ")");
}, m([ lo({
name: "economy.energy.predict",
description: "Predict energy availability for a room in N ticks",
usage: "economy.energy.predict(roomName, ticks)",
examples: [ "economy.energy.predict('W1N1', 50)", "economy.energy.predict('E1S1', 100)" ],
category: "Economy"
}) ], e.prototype, "predictEnergy", null), m([ lo({
name: "economy.energy.income",
description: "Show energy income breakdown for a room",
usage: "economy.energy.income(roomName)",
examples: [ "economy.energy.income('W1N1')" ],
category: "Economy"
}) ], e.prototype, "showIncome", null), m([ lo({
name: "economy.energy.consumption",
description: "Show energy consumption breakdown for a room",
usage: "economy.energy.consumption(roomName)",
examples: [ "economy.energy.consumption('W1N1')" ],
category: "Economy"
}) ], e.prototype, "showConsumption", null), m([ lo({
name: "economy.energy.canAfford",
description: "Check if a room can afford a certain energy cost within N ticks",
usage: "economy.energy.canAfford(roomName, cost, ticks)",
examples: [ "economy.energy.canAfford('W1N1', 1000, 50)", "economy.energy.canAfford('E1S1', 500, 25)" ],
category: "Economy"
}) ], e.prototype, "canAfford", null), m([ lo({
name: "economy.energy.spawnDelay",
description: "Get recommended spawn delay for a body cost",
usage: "economy.energy.spawnDelay(roomName, cost)",
examples: [ "economy.energy.spawnDelay('W1N1', 1000)", "economy.energy.spawnDelay('E1S1', 500)" ],
category: "Economy"
}) ], e.prototype, "getSpawnDelay", null), e;
}()), ml = function() {
function e() {}
return e.prototype.status = function() {
var e, t, r, o, n, a, i, s, c, u, l = Cn.getEmpire(), m = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), d = (Game.gcl.progress / Game.gcl.progressTotal * 100).toFixed(1), f = Game.gcl.level - m.length, y = f > 0, h = l.objectives.expansionPaused, g = l.claimQueue.length, v = l.claimQueue.filter(function(e) {
return !e.claimed;
}).length, R = l.claimQueue.filter(function(e) {
return e.claimed;
}).length, E = Object.values(Game.creeps).filter(function(e) {
var t = e.memory;
return "claimer" === t.role && "claim" === t.task;
}), T = "=== Expansion System Status ===\n\nGCL: Level ".concat(Game.gcl.level, " (").concat(d, "% to next)\nOwned Rooms: ").concat(m.length, "/").concat(Game.gcl.level, "\nAvailable Room Slots: ").concat(f, "\n\nExpansion Status: ").concat(h ? "PAUSED ⚠" : y ? "READY ✓" : "AT GCL LIMIT", "\nClaim Queue: ").concat(g, " total (").concat(v, " unclaimed, ").concat(R, " in progress)\nActive Claimers: ").concat(E.length, "\n\n");
if (v > 0) {
T += "=== Top Expansion Candidates ===\n";
var S = l.claimQueue.filter(function(e) {
return !e.claimed;
}).slice(0, 5);
try {
for (var C = p(S), w = C.next(); !w.done; w = C.next()) {
var b = w.value, x = Game.time - b.lastEvaluated;
T += "  ".concat(b.roomName, ": Score ").concat(b.score.toFixed(0), ", Distance ").concat(b.distance, ", Age ").concat(x, " ticks\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
w && !w.done && (t = C.return) && t.call(C);
} finally {
if (e) throw e.error;
}
}
T += "\n";
}
if (R > 0) {
T += "=== Active Expansion Attempts ===\n";
var O = l.claimQueue.filter(function(e) {
return e.claimed;
}), _ = function(e) {
var t = Game.time - e.lastEvaluated, r = E.find(function(t) {
return t.memory.targetRoom === e.roomName;
}), o = r ? "".concat(r.name, " en route") : "No claimer assigned";
T += "  ".concat(e.roomName, ": ").concat(o, ", Age ").concat(t, " ticks\n");
};
try {
for (var A = p(O), U = A.next(); !U.done; U = A.next()) _(b = U.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
U && !U.done && (o = A.return) && o.call(A);
} finally {
if (r) throw r.error;
}
}
T += "\n";
}
T += "=== Owned Room Distribution ===\n";
var N = new Map;
try {
for (var M = p(m), k = M.next(); !k.done; k = M.next()) {
var P = null !== (s = null === (i = k.value.controller) || void 0 === i ? void 0 : i.level) && void 0 !== s ? s : 0;
N.set(P, (null !== (c = N.get(P)) && void 0 !== c ? c : 0) + 1);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
k && !k.done && (a = M.return) && a.call(M);
} finally {
if (n) throw n.error;
}
}
for (P = 8; P >= 1; P--) {
var I = null !== (u = N.get(P)) && void 0 !== u ? u : 0;
if (I > 0) {
var G = "█".repeat(I);
T += "  RCL ".concat(P, ": ").concat(G, " (").concat(I, ")\n");
}
}
return T;
}, e.prototype.pause = function() {
return Cn.getEmpire().objectives.expansionPaused = !0, "Expansion paused. Use expansion.resume() to re-enable.";
}, e.prototype.resume = function() {
return Cn.getEmpire().objectives.expansionPaused = !1, "Expansion resumed.";
}, e.prototype.addRemote = function(e, t) {
return bi.addRemoteRoom(e, t) ? "Added remote ".concat(t, " to ").concat(e) : "Failed to add remote (check logs for details)";
}, e.prototype.removeRemote = function(e, t) {
return bi.removeRemoteRoom(e, t) ? "Removed remote ".concat(t, " from ").concat(e) : "Remote ".concat(t, " not found in ").concat(e);
}, e.prototype.clearQueue = function() {
var e = Cn.getEmpire(), t = e.claimQueue.length;
return e.claimQueue = [], "Cleared ".concat(t, " candidates from claim queue. Queue will repopulate on next empire tick.");
}, m([ lo({
name: "expansion.status",
description: "Show expansion system status, GCL progress, and claim queue",
usage: "expansion.status()",
examples: [ "expansion.status()" ],
category: "Empire"
}) ], e.prototype, "status", null), m([ lo({
name: "expansion.pause",
description: "Pause autonomous expansion",
usage: "expansion.pause()",
examples: [ "expansion.pause()" ],
category: "Empire"
}) ], e.prototype, "pause", null), m([ lo({
name: "expansion.resume",
description: "Resume autonomous expansion",
usage: "expansion.resume()",
examples: [ "expansion.resume()" ],
category: "Empire"
}) ], e.prototype, "resume", null), m([ lo({
name: "expansion.addRemote",
description: "Manually add a remote room assignment",
usage: "expansion.addRemote(homeRoom, remoteRoom)",
examples: [ "expansion.addRemote('W1N1', 'W2N1')" ],
category: "Empire"
}) ], e.prototype, "addRemote", null), m([ lo({
name: "expansion.removeRemote",
description: "Manually remove a remote room assignment",
usage: "expansion.removeRemote(homeRoom, remoteRoom)",
examples: [ "expansion.removeRemote('W1N1', 'W2N1')" ],
category: "Empire"
}) ], e.prototype, "removeRemote", null), m([ lo({
name: "expansion.clearQueue",
description: "Clear the expansion claim queue",
usage: "expansion.clearQueue()",
examples: [ "expansion.clearQueue()" ],
category: "Empire"
}) ], e.prototype, "clearQueue", null), e;
}(), pl = new ml, dl = {
status: function() {
return Os.getStatus();
},
enable: function() {
return Os.enable(), "TooAngel integration enabled";
},
disable: function() {
return Os.disable(), "TooAngel integration disabled";
},
reputation: function() {
var e = ys();
return "Current TooAngel reputation: ".concat(e);
},
requestReputation: function(e) {
return gs(e) ? "Reputation request sent".concat(e ? " from ".concat(e) : "") : "Failed to send reputation request (check logs for details)";
},
quests: function() {
var e, t = Es(), r = [ "Active Quests:" ];
if (0 === Object.keys(t).length) r.push("  No active quests"); else for (var o in t) {
var n = t[o], a = n.deadline - Game.time, i = (null === (e = n.assignedCreeps) || void 0 === e ? void 0 : e.length) || 0;
r.push("  ".concat(o, ":")), r.push("    Type: ".concat(n.type)), r.push("    Target: ".concat(n.targetRoom)), 
r.push("    Status: ".concat(n.status)), r.push("    Time left: ".concat(a, " ticks")), 
r.push("    Assigned creeps: ".concat(i));
}
return r.join("\n");
},
npcs: function() {
var e = ps(), t = [ "TooAngel NPC Rooms:" ];
if (0 === Object.keys(e).length) t.push("  No NPC rooms discovered"); else for (var r in e) {
var o = e[r];
t.push("  ".concat(r, ":")), t.push("    Has terminal: ".concat(o.hasTerminal)), 
t.push("    Available quests: ".concat(o.availableQuests.length)), t.push("    Last seen: ".concat(Game.time - o.lastSeen, " ticks ago"));
}
return t.join("\n");
},
apply: function(e, t, r) {
return Cs(e, t, r) ? "Applied for quest ".concat(e).concat(r ? " from ".concat(r) : "") : "Failed to apply for quest (check logs for details)";
},
help: function() {
return [ "TooAngel Console Commands:", "", "  tooangel.status()                    - Show current status", "  tooangel.enable()                    - Enable integration", "  tooangel.disable()                   - Disable integration", "  tooangel.reputation()                - Get current reputation", "  tooangel.requestReputation(fromRoom) - Request reputation update", "  tooangel.quests()                    - List active quests", "  tooangel.npcs()                      - List discovered NPC rooms", "  tooangel.apply(id, origin, fromRoom) - Apply for a quest", "  tooangel.help()                      - Show this help" ].join("\n");
}
}, fl = function() {
function e() {}
return e.prototype.status = function() {
var e = an.checkMemoryUsage(), t = e.breakdown, r = "Memory Status: ".concat(e.status.toUpperCase(), "\n");
return r += "Usage: ".concat(an.formatBytes(e.used), " / ").concat(an.formatBytes(e.limit), " (").concat((100 * e.percentage).toFixed(1), "%)\n\n"), 
r += "Breakdown:\n", r += "  Empire:        ".concat(an.formatBytes(t.empire), " (").concat((t.empire / t.total * 100).toFixed(1), "%)\n"), 
r += "  Rooms:         ".concat(an.formatBytes(t.rooms), " (").concat((t.rooms / t.total * 100).toFixed(1), "%)\n"), 
r += "  Creeps:        ".concat(an.formatBytes(t.creeps), " (").concat((t.creeps / t.total * 100).toFixed(1), "%)\n"), 
r += "  Clusters:      ".concat(an.formatBytes(t.clusters), " (").concat((t.clusters / t.total * 100).toFixed(1), "%)\n"), 
(r += "  SS2 Queue:     ".concat(an.formatBytes(t.ss2PacketQueue), " (").concat((t.ss2PacketQueue / t.total * 100).toFixed(1), "%)\n")) + "  Other:         ".concat(an.formatBytes(t.other), " (").concat((t.other / t.total * 100).toFixed(1), "%)\n");
}, e.prototype.analyze = function(e) {
void 0 === e && (e = 10);
var t = an.getLargestConsumers(e), r = un.getRecommendations(), o = "Top ".concat(e, " Memory Consumers:\n");
return t.forEach(function(e, t) {
o += "".concat(t + 1, ". ").concat(e.type, ":").concat(e.name, " - ").concat(an.formatBytes(e.size), "\n");
}), r.length > 0 ? (o += "\nRecommendations:\n", r.forEach(function(e) {
o += "- ".concat(e, "\n");
})) : o += "\nNo recommendations at this time.\n", o;
}, e.prototype.prune = function() {
var e = un.pruneAll(), t = "Memory Pruning Complete:\n";
return t += "  Dead creeps removed:        ".concat(e.deadCreeps, "\n"), t += "  Event log entries removed:  ".concat(e.eventLogs, "\n"), 
t += "  Stale intel removed:        ".concat(e.staleIntel, "\n"), (t += "  Market history removed:     ".concat(e.marketHistory, "\n")) + "  Total bytes saved:          ".concat(an.formatBytes(e.bytesSaved), "\n");
}, e.prototype.segments = function() {
var e, t, r = pn.getActiveSegments(), o = "Memory Segments:\n\n";
o += "Active segments: ".concat(r.length, "/10\n"), r.length > 0 && (o += "  Loaded: [".concat(r.join(", "), "]\n\n")), 
o += "Allocation Strategy:\n";
var n = function(e, t) {
o += "  ".concat(e.padEnd(20), " ").concat(t.start.toString().padStart(2), "-").concat(t.end.toString().padEnd(2));
var n = r.filter(function(e) {
return e >= t.start && e <= t.end;
});
if (n.length > 0) {
var a = n.map(function(e) {
var t = pn.getSegmentSize(e);
return "".concat(e, ":").concat(an.formatBytes(t));
});
o += " [".concat(a.join(", "), "]");
}
o += "\n";
};
try {
for (var a = p(Object.entries(ln)), i = a.next(); !i.done; i = a.next()) {
var s = d(i.value, 2);
n(s[0], s[1]);
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
}, e.prototype.compress = function(e) {
var t, r, o = e.split("."), n = Memory;
try {
for (var a = p(o), i = a.next(); !i.done; i = a.next()) {
var s = i.value;
if (!n || "object" != typeof n || !(s in n)) return "Path not found: ".concat(e);
n = n[s];
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
if (!n) return "No data at path: ".concat(e);
var c = hn.getCompressionStats(n), u = "Compression Test for: ".concat(e, "\n");
return u += "  Original size:    ".concat(an.formatBytes(c.originalSize), "\n"), 
u += "  Compressed size:  ".concat(an.formatBytes(c.compressedSize), "\n"), u += "  Bytes saved:      ".concat(an.formatBytes(c.bytesSaved), "\n"), 
(u += "  Compression ratio: ".concat((100 * c.ratio).toFixed(1), "%\n")) + "  Worth compressing: ".concat(c.ratio < .9 ? "YES" : "NO", "\n");
}, e.prototype.migrations = function() {
var e = Rn.getCurrentVersion(), t = Rn.getLatestVersion(), r = Rn.getPendingMigrations(), o = "Memory Migration Status:\n";
return o += "  Current version: ".concat(e, "\n"), o += "  Latest version:  ".concat(t, "\n"), 
o += "  Status: ".concat(r.length > 0 ? "PENDING" : "UP TO DATE", "\n\n"), r.length > 0 && (o += "Pending Migrations:\n", 
r.forEach(function(e) {
o += "  v".concat(e.version, ": ").concat(e.description, "\n");
}), o += "\nMigrations will run automatically on next tick.\n"), o;
}, e.prototype.migrate = function() {
var e = Rn.getCurrentVersion();
Rn.runMigrations();
var t = Rn.getCurrentVersion();
return t > e ? "Migrated from v".concat(e, " to v").concat(t) : "No migrations needed (current: v".concat(t, ")");
}, e.prototype.reset = function(e) {
if ("CONFIRM" !== e) return "WARNING: This will clear ALL memory!\nTo confirm, use: memory.reset('CONFIRM')";
var t = Memory;
for (var r in t) delete t[r];
for (var o = 0; o < 100; o++) RawMemory.segments[o] = "";
return Cn.initialize(), "Memory reset complete. All data cleared (main memory + 100 segments).";
}, m([ lo({
name: "memory.status",
description: "Show current memory usage and status",
usage: "memory.status()",
examples: [ "memory.status()" ],
category: "Memory"
}) ], e.prototype, "status", null), m([ lo({
name: "memory.analyze",
description: "Analyze memory usage and show largest consumers",
usage: "memory.analyze([topN])",
examples: [ "memory.analyze()", "memory.analyze(20)" ],
category: "Memory"
}) ], e.prototype, "analyze", null), m([ lo({
name: "memory.prune",
description: "Manually trigger memory pruning to clean stale data",
usage: "memory.prune()",
examples: [ "memory.prune()" ],
category: "Memory"
}) ], e.prototype, "prune", null), m([ lo({
name: "memory.segments",
description: "Show memory segment allocation and usage",
usage: "memory.segments()",
examples: [ "memory.segments()" ],
category: "Memory"
}) ], e.prototype, "segments", null), m([ lo({
name: "memory.compress",
description: "Test compression on a memory path",
usage: "memory.compress(path)",
examples: [ "memory.compress('empire.knownRooms')" ],
category: "Memory"
}) ], e.prototype, "compress", null), m([ lo({
name: "memory.migrations",
description: "Show migration status and pending migrations",
usage: "memory.migrations()",
examples: [ "memory.migrations()" ],
category: "Memory"
}) ], e.prototype, "migrations", null), m([ lo({
name: "memory.migrate",
description: "Manually trigger memory migrations",
usage: "memory.migrate()",
examples: [ "memory.migrate()" ],
category: "Memory"
}) ], e.prototype, "migrate", null), m([ lo({
name: "memory.reset",
description: "Clear all memory (DANGEROUS - requires confirmation)",
usage: "memory.reset('CONFIRM')",
examples: [ "memory.reset('CONFIRM')" ],
category: "Memory"
}) ], e.prototype, "reset", null), e;
}(), yl = new fl;

function hl(e) {
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
var r = uo.getCommandsByCategory(), o = r.get(e);
if (!o || 0 === o.length) return 'Category "'.concat(e, '" not found. Available categories: ').concat(Array.from(r.keys()).join(", "));
var n = o.map(function(e) {
var t, r;
return {
title: e.metadata.description,
describe: null === (t = e.metadata.examples) || void 0 === t ? void 0 : t[0],
functionName: e.metadata.name,
commandType: !(null === (r = e.metadata.usage) || void 0 === r ? void 0 : r.includes("(")),
params: e.metadata.usage ? hl(e.metadata.usage) : void 0
};
});
return t.createHelp({
name: e,
describe: "".concat(e, " commands"),
api: n
});
}(e) : function() {
var e, r, o = uo.getCommandsByCategory(), n = [];
try {
for (var a = p(o), i = a.next(); !i.done; i = a.next()) {
var s = d(i.value, 2), c = s[0], u = s[1].map(function(e) {
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
n.push({
name: c,
describe: "".concat(c, " commands for bot management"),
api: u
});
}
} catch (t) {
e = {
error: t
};
} finally {
try {
i && !i.done && (r = a.return) && r.call(a);
} finally {
if (e) throw e.error;
}
}
return t.createHelp.apply(void 0, f([], d(n), !1));
}();
}, e.prototype.spawnForm = function(e) {
return Game.rooms[e] ? t.createElement.form("spawnCreep", [ {
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
}) : t.colorful("Room ".concat(e, " not found or not visible"), "red", !0);
}, e.prototype.roomControl = function(e) {
var r = Game.rooms[e];
if (!r) return t.colorful("Room ".concat(e, " not found or not visible"), "red", !0);
var o = '<div style="background: #2b2b2b; padding: 10px; margin: 5px;">';
return o += '<h3 style="color: #c5c599; margin: 0 0 10px 0;">Room Control: '.concat(e, "</h3>"), 
o += '<div style="margin-bottom: 10px;">', o += t.colorful("Energy: ".concat(r.energyAvailable, "/").concat(r.energyCapacityAvailable), "green") + "<br>", 
r.controller && (o += t.colorful("Controller Level: ".concat(r.controller.level, " (").concat(r.controller.progress, "/").concat(r.controller.progressTotal, ")"), "blue") + "<br>"), 
o += "</div>", o += t.createElement.button({
content: "🔄 Toggle Visualizations",
command: "() => {\n        const config = global.botConfig.getConfig();\n        global.botConfig.updateConfig({visualizations: !config.visualizations});\n        return 'Visualizations: ' + (!config.visualizations ? 'ON' : 'OFF');\n      }"
}), o += " ", (o += t.createElement.button({
content: "📊 Room Stats",
command: "() => {\n        const room = Game.rooms['".concat(e, "'];\n        if (!room) return 'Room not found';\n        let stats = '=== Room Stats ===\\n';\n        stats += 'Energy: ' + room.energyAvailable + '/' + room.energyCapacityAvailable + '\\n';\n        stats += 'Creeps: ' + Object.values(Game.creeps).filter(c => c.room.name === '").concat(e, "').length + '\\n';\n        if (room.controller) {\n          stats += 'RCL: ' + room.controller.level + '\\n';\n          stats += 'Progress: ' + room.controller.progress + '/' + room.controller.progressTotal + '\\n';\n        }\n        return stats;\n      }")
})) + "</div>";
}, e.prototype.logForm = function() {
return t.createElement.form("configureLogging", [ {
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
return t.createElement.form("configureVisualization", [ {
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
e += t.createElement.button({
content: "🚨 Emergency Mode",
command: "() => {\n        const config = global.botConfig.getConfig();\n        global.botConfig.updateConfig({emergencyMode: !config.emergencyMode});\n        return 'Emergency Mode: ' + (!config.emergencyMode ? 'ON' : 'OFF');\n      }"
}), e += " ", e += t.createElement.button({
content: "🐛 Toggle Debug",
command: "() => {\n        const config = global.botConfig.getConfig();\n        const newValue = !config.debug;\n        global.botConfig.updateConfig({debug: newValue});\n        global.botLogger.configureLogger({level: newValue ? 0 : 1});\n        return 'Debug mode: ' + (newValue ? 'ON' : 'OFF');\n      }"
}), e += " ", (e += t.createElement.button({
content: "🗑️ Clear Cache",
command: "() => {\n        global.botCacheManager.clear();\n        return 'Cache cleared successfully';\n      }"
})) + "</div>";
}, e.prototype.colorDemo = function() {
var e = "=== Console Color Demo ===\n\n";
return e += t.colorful("✓ Success message", "green", !0) + "\n", e += t.colorful("⚠ Warning message", "yellow", !0) + "\n", 
e += t.colorful("✗ Error message", "red", !0) + "\n", e += t.colorful("ℹ Info message", "blue", !0) + "\n", 
(e += "\nNormal text: " + t.colorful("colored text", "green") + " normal text\n") + "Bold text: " + t.colorful("important", null, !0) + "\n";
}, m([ lo({
name: "uiHelp",
description: "Show interactive help interface with expandable sections",
usage: "uiHelp()",
examples: [ "uiHelp()", 'uiHelp("Logging")', 'uiHelp("Visualization")' ],
category: "System"
}) ], e.prototype, "uiHelp", null), m([ lo({
name: "spawnForm",
description: "Show interactive form for spawning creeps",
usage: "spawnForm(roomName)",
examples: [ 'spawnForm("W1N1")', 'spawnForm("E2S3")' ],
category: "Spawning"
}) ], e.prototype, "spawnForm", null), m([ lo({
name: "roomControl",
description: "Show interactive room control panel",
usage: "roomControl(roomName)",
examples: [ 'roomControl("W1N1")' ],
category: "Room Management"
}) ], e.prototype, "roomControl", null), m([ lo({
name: "logForm",
description: "Show interactive form for configuring logging",
usage: "logForm()",
examples: [ "logForm()" ],
category: "Logging"
}) ], e.prototype, "logForm", null), m([ lo({
name: "visForm",
description: "Show interactive form for visualization settings",
usage: "visForm()",
examples: [ "visForm()" ],
category: "Visualization"
}) ], e.prototype, "visForm", null), m([ lo({
name: "quickActions",
description: "Show quick action buttons for common operations",
usage: "quickActions()",
examples: [ "quickActions()" ],
category: "System"
}) ], e.prototype, "quickActions", null), m([ lo({
name: "colorDemo",
description: "Show color demonstration for console output",
usage: "colorDemo()",
examples: [ "colorDemo()" ],
category: "System"
}) ], e.prototype, "colorDemo", null);
}();

var gl = Qr("VisualizationManager"), vl = function() {
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
enabledLayers: Jo.Pheromones | Jo.Defense,
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
this.config.enabledLayers = Jo.Pheromones | Jo.Paths | Jo.Traffic | Jo.Defense | Jo.Economy | Jo.Construction | Jo.Performance;
break;

case "presentation":
this.config.enabledLayers = Jo.Pheromones | Jo.Defense | Jo.Economy;
break;

case "minimal":
this.config.enabledLayers = Jo.Defense;
break;

case "performance":
this.config.enabledLayers = Jo.None;
}
this.saveConfig(), gl.info("Visualization mode set to: ".concat(e));
}, e.prototype.updateFromFlags = function() {
var e, t, r = Game.flags, o = {
viz_pheromones: Jo.Pheromones,
viz_paths: Jo.Paths,
viz_traffic: Jo.Traffic,
viz_defense: Jo.Defense,
viz_economy: Jo.Economy,
viz_construction: Jo.Construction,
viz_performance: Jo.Performance
}, n = function(e, t) {
Object.values(r).some(function(t) {
return t.name === e;
}) && !a.isLayerEnabled(t) && (a.enableLayer(t), gl.info("Enabled layer ".concat(Jo[t], " via flag")));
}, a = this;
try {
for (var i = p(Object.entries(o)), s = i.next(); !s.done; s = i.next()) {
var c = d(s.value, 2);
n(c[0], c[1]);
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
a > 10 && gl.warn("Visualization using ".concat(a.toFixed(1), "% of CPU budget"));
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
return l({}, this.config);
}, e.prototype.getPerformanceMetrics = function() {
var e = Game.cpu.limit;
return {
totalCost: this.config.totalCost,
layerCosts: l({}, this.config.layerCosts),
percentOfBudget: this.config.totalCost / e * 100
};
}, e.prototype.measureCost = function(e) {
var t = Game.cpu.getUsed();
return {
result: e(),
cost: Game.cpu.getUsed() - t
};
}, e;
}(), Rl = new vl, El = function() {
function e() {}
return e.prototype.setLogLevel = function(e) {
var t = {
debug: Nr.DEBUG,
info: Nr.INFO,
warn: Nr.WARN,
error: Nr.ERROR,
none: Nr.NONE
}[e.toLowerCase()];
return void 0 === t ? "Invalid log level: ".concat(e, ". Valid levels: debug, info, warn, error, none") : (Lr({
level: t
}), "Log level set to: ".concat(e.toUpperCase()));
}, e.prototype.toggleDebug = function() {
var e = !So().debug;
return Co({
debug: e
}), Lr({
level: e ? Nr.DEBUG : Nr.INFO
}), "Debug mode: ".concat(e ? "ENABLED" : "DISABLED", " (Log level: ").concat(e ? "DEBUG" : "INFO", ")");
}, m([ lo({
name: "setLogLevel",
description: "Set the log level for the bot",
usage: "setLogLevel(level)",
examples: [ "setLogLevel('debug')", "setLogLevel('info')", "setLogLevel('warn')", "setLogLevel('error')", "setLogLevel('none')" ],
category: "Logging"
}) ], e.prototype, "setLogLevel", null), m([ lo({
name: "toggleDebug",
description: "Toggle debug mode on/off (affects log level and debug features)",
usage: "toggleDebug()",
examples: [ "toggleDebug()" ],
category: "Logging"
}) ], e.prototype, "toggleDebug", null), e;
}(), Tl = function() {
function e() {}
return e.prototype.toggleVisualizations = function() {
var e = !So().visualizations;
return Co({
visualizations: e
}), "Visualizations: ".concat(e ? "ENABLED" : "DISABLED");
}, e.prototype.toggleVisualization = function(e) {
var t = qu.getConfig(), r = Object.keys(t).filter(function(e) {
return e.startsWith("show") && "boolean" == typeof t[e];
});
if (!r.includes(e)) return "Invalid key: ".concat(e, ". Valid keys: ").concat(r.join(", "));
var o = e;
qu.toggle(o);
var n = qu.getConfig()[o];
return "Room visualization '".concat(e, "': ").concat(n ? "ENABLED" : "DISABLED");
}, e.prototype.toggleMapVisualization = function(e) {
var t = zu.getConfig(), r = Object.keys(t).filter(function(e) {
return e.startsWith("show") && "boolean" == typeof t[e];
});
if (!r.includes(e)) return "Invalid key: ".concat(e, ". Valid keys: ").concat(r.join(", "));
var o = e;
zu.toggle(o);
var n = zu.getConfig()[o];
return "Map visualization '".concat(e, "': ").concat(n ? "ENABLED" : "DISABLED");
}, e.prototype.showMapConfig = function() {
var e = zu.getConfig();
return Object.entries(e).map(function(e) {
var t = d(e, 2), r = t[0], o = t[1];
return "".concat(r, ": ").concat(String(o));
}).join("\n");
}, e.prototype.setVisMode = function(e) {
var t = [ "debug", "presentation", "minimal", "performance" ];
return t.includes(e) ? (Rl.setMode(e), "Visualization mode set to: ".concat(e)) : "Invalid mode: ".concat(e, ". Valid modes: ").concat(t.join(", "));
}, e.prototype.toggleVisLayer = function(e) {
var t = {
pheromones: Jo.Pheromones,
paths: Jo.Paths,
traffic: Jo.Traffic,
defense: Jo.Defense,
economy: Jo.Economy,
construction: Jo.Construction,
performance: Jo.Performance
}, r = t[e.toLowerCase()];
if (!r) return "Unknown layer: ".concat(e, ". Valid layers: ").concat(Object.keys(t).join(", "));
Rl.toggleLayer(r);
var o = Rl.isLayerEnabled(r);
return "Layer ".concat(e, ": ").concat(o ? "enabled" : "disabled");
}, e.prototype.showVisPerf = function() {
var e, t, r = Rl.getPerformanceMetrics(), o = "=== Visualization Performance ===\n";
o += "Total CPU: ".concat(r.totalCost.toFixed(3), "\n"), o += "% of Budget: ".concat(r.percentOfBudget.toFixed(2), "%\n"), 
o += "\nPer-Layer Costs:\n";
try {
for (var n = p(Object.entries(r.layerCosts)), a = n.next(); !a.done; a = n.next()) {
var i = d(a.value, 2), s = i[0], c = i[1];
c > 0 && (o += "  ".concat(s, ": ").concat(c.toFixed(3), " CPU\n"));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.showVisConfig = function() {
var e, t, r, o = Rl.getConfig(), n = "=== Visualization Configuration ===\n";
n += "Mode: ".concat(o.mode, "\n"), n += "\nEnabled Layers:\n";
var a = ((e = {})[Jo.Pheromones] = "Pheromones", e[Jo.Paths] = "Paths", e[Jo.Traffic] = "Traffic", 
e[Jo.Defense] = "Defense", e[Jo.Economy] = "Economy", e[Jo.Construction] = "Construction", 
e[Jo.Performance] = "Performance", e);
try {
for (var i = p(Object.entries(a)), s = i.next(); !s.done; s = i.next()) {
var c = d(s.value, 2), u = c[0], l = c[1], m = parseInt(u, 10), f = 0 !== (o.enabledLayers & m);
n += "  ".concat(l, ": ").concat(f ? "✓" : "✗", "\n");
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
}, e.prototype.clearVisCache = function(e) {
return Rl.clearCache(e), e ? "Visualization cache cleared for room: ".concat(e) : "All visualization caches cleared";
}, m([ lo({
name: "toggleVisualizations",
description: "Toggle all visualizations on/off",
usage: "toggleVisualizations()",
examples: [ "toggleVisualizations()" ],
category: "Visualization"
}) ], e.prototype, "toggleVisualizations", null), m([ lo({
name: "toggleVisualization",
description: "Toggle a specific room visualization feature",
usage: "toggleVisualization(key)",
examples: [ "toggleVisualization('showPheromones')", "toggleVisualization('showPaths')", "toggleVisualization('showCombat')" ],
category: "Visualization"
}) ], e.prototype, "toggleVisualization", null), m([ lo({
name: "toggleMapVisualization",
description: "Toggle a specific map visualization feature",
usage: "toggleMapVisualization(key)",
examples: [ "toggleMapVisualization('showRoomStatus')", "toggleMapVisualization('showConnections')", "toggleMapVisualization('showThreats')", "toggleMapVisualization('showExpansion')" ],
category: "Visualization"
}) ], e.prototype, "toggleMapVisualization", null), m([ lo({
name: "showMapConfig",
description: "Show current map visualization configuration",
usage: "showMapConfig()",
examples: [ "showMapConfig()" ],
category: "Visualization"
}) ], e.prototype, "showMapConfig", null), m([ lo({
name: "setVisMode",
description: "Set visualization mode preset (debug, presentation, minimal, performance)",
usage: "setVisMode(mode)",
examples: [ "setVisMode('debug')", "setVisMode('presentation')", "setVisMode('minimal')", "setVisMode('performance')" ],
category: "Visualization"
}) ], e.prototype, "setVisMode", null), m([ lo({
name: "toggleVisLayer",
description: "Toggle a specific visualization layer",
usage: "toggleVisLayer(layer)",
examples: [ "toggleVisLayer('pheromones')", "toggleVisLayer('paths')", "toggleVisLayer('defense')", "toggleVisLayer('economy')", "toggleVisLayer('performance')" ],
category: "Visualization"
}) ], e.prototype, "toggleVisLayer", null), m([ lo({
name: "showVisPerf",
description: "Show visualization performance metrics",
usage: "showVisPerf()",
examples: [ "showVisPerf()" ],
category: "Visualization"
}) ], e.prototype, "showVisPerf", null), m([ lo({
name: "showVisConfig",
description: "Show current visualization configuration",
usage: "showVisConfig()",
examples: [ "showVisConfig()" ],
category: "Visualization"
}) ], e.prototype, "showVisConfig", null), m([ lo({
name: "clearVisCache",
description: "Clear visualization cache",
usage: "clearVisCache(roomName?)",
examples: [ "clearVisCache()", "clearVisCache('W1N1')" ],
category: "Visualization"
}) ], e.prototype, "clearVisCache", null), e;
}(), Sl = function() {
function t() {}
return t.prototype.showStats = function() {
var t = e.memorySegmentStats.getLatestStats();
return t ? "=== SwarmBot Stats (Tick ".concat(t.tick, ") ===\nCPU: ").concat(t.cpuUsed.toFixed(2), "/").concat(t.cpuLimit, " (Bucket: ").concat(t.cpuBucket, ")\nGCL: ").concat(t.gclLevel, " (").concat((100 * t.gclProgress).toFixed(1), "%)\nGPL: ").concat(t.gplLevel, "\nCreeps: ").concat(t.totalCreeps, "\nRooms: ").concat(t.totalRooms, "\n").concat(t.rooms.map(function(e) {
return "  ".concat(e.roomName, ": RCL").concat(e.rcl, " | ").concat(e.creepCount, " creeps | ").concat(e.storageEnergy, "E");
}).join("\n")) : "No stats available yet. Wait for a few ticks.";
}, t.prototype.cacheStats = function() {
var e, t = Mo.getCacheStats(Po);
return "=== Object Cache Statistics ===\nCache Size: ".concat(t.size, " entries\nCache Hits: ").concat(t.hits, "\nCache Misses: ").concat(t.misses, "\nHit Rate: ").concat(t.hitRate.toFixed(2), "%\nEstimated CPU Saved: ").concat((null !== (e = t.cpuSaved) && void 0 !== e ? e : 0).toFixed(3), " CPU\n\nPerformance: ").concat(t.hitRate >= 80 ? "Excellent" : t.hitRate >= 60 ? "Good" : t.hitRate >= 40 ? "Fair" : "Poor");
}, t.prototype.resetCacheStats = function() {
return Mo.clear(Po), "Cache statistics reset";
}, t.prototype.roomFindCacheStats = function() {
var e = function() {
var e = Mo.getCacheStats(Do);
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
return Mo.clear(Do), "Room.find() cache cleared and statistics reset";
}, t.prototype.toggleProfiling = function() {
var t = !So().profiling;
return Co({
profiling: t
}), e.unifiedStats.setEnabled(t), Lr({
cpuLogging: t
}), "Profiling: ".concat(t ? "ENABLED" : "DISABLED");
}, t.prototype.cpuBreakdown = function(e) {
var t, r, o, n, a, i, s, c, u = Memory.stats;
if (!u) return "No stats available. Stats collection may be disabled.";
var l = !e, m = [ "=== CPU Breakdown ===" ];
if (m.push("Tick: ".concat(u.tick)), m.push("Total CPU: ".concat(u.cpu.used.toFixed(2), "/").concat(u.cpu.limit, " (").concat(u.cpu.percent.toFixed(1), "%)")), 
m.push("Bucket: ".concat(u.cpu.bucket)), m.push(""), l || "process" === e) {
var d = u.processes || {}, f = Object.values(d);
if (f.length > 0) {
m.push("=== Process CPU Usage ===");
var y = f.sort(function(e, t) {
return t.avg_cpu - e.avg_cpu;
});
try {
for (var h = p(y.slice(0, 10)), g = h.next(); !g.done; g = h.next()) {
var v = g.value;
m.push("  ".concat(v.name, ": ").concat(v.avg_cpu.toFixed(3), " CPU (runs: ").concat(v.run_count, ", max: ").concat(v.max_cpu.toFixed(3), ")"));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
g && !g.done && (r = h.return) && r.call(h);
} finally {
if (t) throw t.error;
}
}
m.push("");
}
}
if (l || "room" === e) {
var R = u.rooms || {}, E = Object.values(R);
if (E.length > 0) {
m.push("=== Room CPU Usage ==="), y = E.sort(function(e, t) {
return t.profiler.avg_cpu - e.profiler.avg_cpu;
});
try {
for (var T = p(y), S = T.next(); !S.done; S = T.next()) {
var C = S.value, w = C.name || "unknown";
m.push("  ".concat(w, ": ").concat(C.profiler.avg_cpu.toFixed(3), " CPU (RCL ").concat(C.rcl, ")"));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
S && !S.done && (n = T.return) && n.call(T);
} finally {
if (o) throw o.error;
}
}
m.push("");
}
}
if (l || "subsystem" === e) {
var b = u.subsystems || {}, x = Object.values(b);
if (x.length > 0) {
m.push("=== Subsystem CPU Usage ==="), y = x.sort(function(e, t) {
return t.avg_cpu - e.avg_cpu;
});
try {
for (var O = p(y.slice(0, 10)), _ = O.next(); !_.done; _ = O.next()) {
var A = _.value, U = A.name || "unknown";
m.push("  ".concat(U, ": ").concat(A.avg_cpu.toFixed(3), " CPU (calls: ").concat(A.calls, ")"));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
_ && !_.done && (i = O.return) && i.call(O);
} finally {
if (a) throw a.error;
}
}
m.push("");
}
}
if (l || "creep" === e) {
var N = u.creeps || {}, M = Object.values(N);
if (M.length > 0) {
m.push("=== Top Creeps by CPU (Top 10) ==="), y = M.sort(function(e, t) {
return t.cpu - e.cpu;
});
try {
for (var k = p(y.slice(0, 10)), P = k.next(); !P.done; P = k.next()) {
var I = P.value;
if (I.cpu > 0) {
var G = I.name || "".concat(I.role, "_unknown");
m.push("  ".concat(G, " (").concat(I.role, "): ").concat(I.cpu.toFixed(3), " CPU in ").concat(I.current_room));
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
P && !P.done && (c = k.return) && c.call(k);
} finally {
if (s) throw s.error;
}
}
m.push("");
}
}
return m.join("\n");
}, t.prototype.cpuBudget = function() {
var t, r, o, n, a = e.unifiedStats.validateBudgets(), i = "=== CPU Budget Report (Tick ".concat(a.tick, ") ===\n");
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
for (var u = p(s), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
i += "  ".concat(m.target, ": ").concat(m.cpuUsed.toFixed(3), " CPU / ").concat(m.budgetLimit.toFixed(3), " limit (").concat((100 * m.percentUsed).toFixed(1), "%)\n");
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
}
if (c.length > 0) {
i += "\n⚠️  WARNING (≥80% of budget):\n";
try {
for (var d = p(c), f = d.next(); !f.done; f = d.next()) m = f.value, i += "  ".concat(m.target, ": ").concat(m.cpuUsed.toFixed(3), " CPU / ").concat(m.budgetLimit.toFixed(3), " limit (").concat((100 * m.percentUsed).toFixed(1), "%)\n");
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
return i;
}, t.prototype.cpuAnomalies = function() {
var t, r, o, n, a = e.unifiedStats.detectAnomalies();
if (0 === a.length) return "✓ No CPU anomalies detected";
var i = "=== CPU Anomalies Detected: ".concat(a.length, " ===\n\n"), s = a.filter(function(e) {
return "spike" === e.type;
}), c = a.filter(function(e) {
return "sustained_high" === e.type;
});
if (s.length > 0) {
i += "⚡ CPU Spikes (".concat(s.length, "):\n");
try {
for (var u = p(s), l = u.next(); !l.done; l = u.next()) {
var m = l.value;
i += "  ".concat(m.target, ": ").concat(m.current.toFixed(3), " CPU (").concat(m.multiplier.toFixed(1), "x baseline ").concat(m.baseline.toFixed(3), ")\n"), 
m.context && (i += "    Context: ".concat(m.context, "\n"));
}
} catch (e) {
t = {
error: e
};
} finally {
try {
l && !l.done && (r = u.return) && r.call(u);
} finally {
if (t) throw t.error;
}
}
i += "\n";
}
if (c.length > 0) {
i += "📊 Sustained High Usage (".concat(c.length, "):\n");
try {
for (var d = p(c), f = d.next(); !f.done; f = d.next()) m = f.value, i += "  ".concat(m.target, ": ").concat(m.current.toFixed(3), " CPU (").concat(m.multiplier.toFixed(1), "x budget ").concat(m.baseline.toFixed(3), ")\n"), 
m.context && (i += "    Context: ".concat(m.context, "\n"));
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
return i;
}, t.prototype.cpuProfile = function(t) {
var r, o, n, a;
void 0 === t && (t = !1);
var i = e.unifiedStats.getCurrentSnapshot(), s = "=== CPU Profile (Tick ".concat(i.tick, ") ===\n");
s += "Total: ".concat(i.cpu.used.toFixed(2), " / ").concat(i.cpu.limit, " (").concat(i.cpu.percent.toFixed(1), "%)\n"), 
s += "Bucket: ".concat(i.cpu.bucket, "\n"), s += "Heap: ".concat(i.cpu.heapUsed.toFixed(2), " MB\n\n");
var c = Object.values(i.rooms).sort(function(e, t) {
return t.profiler.avgCpu - e.profiler.avgCpu;
}), u = t ? c : c.slice(0, 10);
s += "Top ".concat(u.length, " Rooms by CPU:\n");
try {
for (var l = p(u), m = l.next(); !m.done; m = l.next()) {
var d = m.value, f = e.unifiedStats.postureCodeToName(d.brain.postureCode);
s += "  ".concat(d.name, " (RCL").concat(d.rcl, ", ").concat(f, "): avg ").concat(d.profiler.avgCpu.toFixed(3), " | peak ").concat(d.profiler.peakCpu.toFixed(3), " | samples ").concat(d.profiler.samples, "\n");
}
} catch (e) {
r = {
error: e
};
} finally {
try {
m && !m.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
s += "\nTop Kernel Processes by CPU:\n";
var y = Object.values(i.processes).filter(function(e) {
return e.avgCpu > .001;
}).sort(function(e, t) {
return t.avgCpu - e.avgCpu;
}).slice(0, t ? 999 : 10);
try {
for (var h = p(y), g = h.next(); !g.done; g = h.next()) {
var v = g.value, R = v.cpuBudget > 0 ? (v.avgCpu / v.cpuBudget * 100).toFixed(0) : "N/A";
s += "  ".concat(v.name, " (").concat(v.frequency, "): avg ").concat(v.avgCpu.toFixed(3), " / budget ").concat(v.cpuBudget.toFixed(3), " (").concat(R, "%)\n");
}
} catch (e) {
n = {
error: e
};
} finally {
try {
g && !g.done && (a = h.return) && a.call(h);
} finally {
if (n) throw n.error;
}
}
return s;
}, m([ lo({
name: "showStats",
description: "Show current bot statistics from memory segment",
usage: "showStats()",
examples: [ "showStats()" ],
category: "Statistics"
}) ], t.prototype, "showStats", null), m([ lo({
name: "cacheStats",
description: "Show object cache statistics (hits, misses, hit rate, CPU savings)",
usage: "cacheStats()",
examples: [ "cacheStats()" ],
category: "Statistics"
}) ], t.prototype, "cacheStats", null), m([ lo({
name: "resetCacheStats",
description: "Reset cache statistics counters (for benchmarking)",
usage: "resetCacheStats()",
examples: [ "resetCacheStats()" ],
category: "Statistics"
}) ], t.prototype, "resetCacheStats", null), m([ lo({
name: "roomFindCacheStats",
description: "Show room.find() cache statistics (hits, misses, hit rate)",
usage: "roomFindCacheStats()",
examples: [ "roomFindCacheStats()" ],
category: "Statistics"
}) ], t.prototype, "roomFindCacheStats", null), m([ lo({
name: "clearRoomFindCache",
description: "Clear all room.find() cache entries and reset stats",
usage: "clearRoomFindCache()",
examples: [ "clearRoomFindCache()" ],
category: "Statistics"
}) ], t.prototype, "clearRoomFindCache", null), m([ lo({
name: "toggleProfiling",
description: "Toggle CPU profiling on/off",
usage: "toggleProfiling()",
examples: [ "toggleProfiling()" ],
category: "Statistics"
}) ], t.prototype, "toggleProfiling", null), m([ lo({
name: "cpuBreakdown",
description: "Show detailed CPU breakdown by process, room, creep, and subsystem",
usage: "cpuBreakdown(type?)",
examples: [ "cpuBreakdown() // Show all breakdowns", "cpuBreakdown('process') // Show only process breakdown", "cpuBreakdown('room') // Show only room breakdown", "cpuBreakdown('creep') // Show only creep breakdown", "cpuBreakdown('subsystem') // Show only subsystem breakdown" ],
category: "Statistics"
}) ], t.prototype, "cpuBreakdown", null), m([ lo({
name: "cpuBudget",
description: "Show CPU budget status and violations for all rooms",
usage: "cpuBudget()",
examples: [ "cpuBudget()" ],
category: "Statistics"
}) ], t.prototype, "cpuBudget", null), m([ lo({
name: "cpuAnomalies",
description: "Detect and show CPU usage anomalies (spikes and sustained high usage)",
usage: "cpuAnomalies()",
examples: [ "cpuAnomalies()" ],
category: "Statistics"
}) ], t.prototype, "cpuAnomalies", null), m([ lo({
name: "cpuProfile",
description: "Show comprehensive CPU profiling breakdown by room and subsystem",
usage: "cpuProfile(showAll?)",
examples: [ "cpuProfile()", "cpuProfile(true)" ],
category: "Statistics"
}) ], t.prototype, "cpuProfile", null), t;
}(), Cl = function() {
function e() {}
return e.prototype.showConfig = function() {
var e = So(), t = Dr();
return "=== SwarmBot Config ===\nDebug: ".concat(String(e.debug), "\nProfiling: ").concat(String(e.profiling), "\nVisualizations: ").concat(String(e.visualizations), "\nLogger Level: ").concat(Nr[t.level], "\nCPU Logging: ").concat(String(t.cpuLogging));
}, m([ lo({
name: "showConfig",
description: "Show current bot configuration",
usage: "showConfig()",
examples: [ "showConfig()" ],
category: "Configuration"
}) ], e.prototype, "showConfig", null), e;
}(), wl = function() {
function e() {}
return e.prototype.showKernelStats = function() {
var e, t, r, o, n = _o.getStatsSummary(), a = _o.getConfig(), i = _o.getBucketMode(), s = "=== Kernel Stats ===\nBucket Mode: ".concat(i.toUpperCase(), "\nCPU Bucket: ").concat(Game.cpu.bucket, "\nCPU Limit: ").concat(_o.getCpuLimit().toFixed(2), " (").concat((100 * a.targetCpuUsage).toFixed(0), "% of ").concat(Game.cpu.limit, ")\nRemaining CPU: ").concat(_o.getRemainingCpu().toFixed(2), "\n\nProcesses: ").concat(n.totalProcesses, " total (").concat(n.activeProcesses, " active, ").concat(n.suspendedProcesses, " suspended)\nTotal CPU Used: ").concat(n.totalCpuUsed.toFixed(3), "\nAvg CPU/Process: ").concat(n.avgCpuPerProcess.toFixed(4), "\nAvg Health Score: ").concat(n.avgHealthScore.toFixed(1), "/100\n\nTop CPU Consumers:");
try {
for (var c = p(n.topCpuProcesses), u = c.next(); !u.done; u = c.next()) {
var l = u.value;
s += "\n  ".concat(l.name, ": ").concat(l.avgCpu.toFixed(4), " avg CPU");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
u && !u.done && (t = c.return) && t.call(c);
} finally {
if (e) throw e.error;
}
}
if (n.unhealthyProcesses.length > 0) {
s += "\n\nUnhealthy Processes (Health < 50):";
try {
for (var m = p(n.unhealthyProcesses), d = m.next(); !d.done; d = m.next()) l = d.value, 
s += "\n  ".concat(l.name, ": ").concat(l.healthScore.toFixed(1), "/100 (").concat(l.consecutiveErrors, " consecutive errors)");
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
}
return s;
}, e.prototype.listProcesses = function() {
var e, t, r = _o.getProcesses();
if (0 === r.length) return "No processes registered with kernel.";
var o = "=== Registered Processes ===\n";
o += "ID | Name | Priority | Frequency | State | Runs | Avg CPU | Health | Errors\n", 
o += "-".repeat(100) + "\n";
var n = f([], d(r), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var a = p(n), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.stats.avgCpu.toFixed(4), u = s.stats.healthScore.toFixed(0), l = s.stats.healthScore >= 80 ? "✓" : s.stats.healthScore >= 50 ? "⚠" : "✗";
o += "".concat(s.id, " | ").concat(s.name, " | ").concat(s.priority, " | ").concat(s.frequency, " | ").concat(s.state, " | ").concat(s.stats.runCount, " | ").concat(c, " | ").concat(l).concat(u, " | ").concat(s.stats.errorCount, "(").concat(s.stats.consecutiveErrors, ")\n");
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
}, e.prototype.suspendProcess = function(e) {
var t = _o.suspendProcess(e);
return 'Process "'.concat(e, t ? '" suspended.' : '" not found.');
}, e.prototype.resumeProcess = function(e) {
var t = _o.resumeProcess(e);
return 'Process "'.concat(e, t ? '" resumed.' : '" not found or not suspended.');
}, e.prototype.resetKernelStats = function() {
return _o.resetStats(), "Kernel statistics reset.";
}, e.prototype.showProcessHealth = function() {
var e, t, r = _o.getProcesses();
if (0 === r.length) return "No processes registered with kernel.";
var o = f([], d(r), !1).sort(function(e, t) {
return e.stats.healthScore - t.stats.healthScore;
}), n = "=== Process Health Status ===\n";
n += "Name | Health | Errors | Consecutive | Status | Last Success\n", n += "-".repeat(80) + "\n";
try {
for (var a = p(o), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.stats.healthScore.toFixed(0), u = s.stats.healthScore >= 80 ? "✓" : s.stats.healthScore >= 50 ? "⚠" : "✗", l = s.stats.lastSuccessfulRunTick > 0 ? Game.time - s.stats.lastSuccessfulRunTick : "never", m = "suspended" === s.state ? "SUSPENDED (".concat(s.stats.suspensionReason, ")") : s.state.toUpperCase();
n += "".concat(s.name, " | ").concat(u, " ").concat(c, "/100 | ").concat(s.stats.errorCount, " | ").concat(s.stats.consecutiveErrors, " | ").concat(m, " | ").concat(l, "\n");
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
var y = _o.getStatsSummary();
return (n += "\nAverage Health: ".concat(y.avgHealthScore.toFixed(1), "/100")) + "\nSuspended Processes: ".concat(y.suspendedProcesses);
}, e.prototype.resumeAllProcesses = function() {
var e, t, r = _o.getProcesses().filter(function(e) {
return "suspended" === e.state;
});
if (0 === r.length) return "No suspended processes to resume.";
var o = 0;
try {
for (var n = p(r), a = n.next(); !a.done; a = n.next()) {
var i = a.value;
_o.resumeProcess(i.id) && o++;
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return "Resumed ".concat(o, " of ").concat(r.length, " suspended processes.");
}, e.prototype.showCreepStats = function() {
var e, t, r = jc.getStats(), o = "=== Creep Process Stats ===\nTotal Creeps: ".concat(r.totalCreeps, "\nRegistered Processes: ").concat(r.registeredCreeps, "\n\nCreeps by Priority:");
try {
for (var n = p(Object.entries(r.creepsByPriority)), a = n.next(); !a.done; a = n.next()) {
var i = d(a.value, 2), s = i[0], c = i[1];
o += "\n  ".concat(s, ": ").concat(c);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.showRoomStats = function() {
var e, t, r = Uu.getStats(), o = "=== Room Process Stats ===\nTotal Rooms: ".concat(r.totalRooms, "\nRegistered Processes: ").concat(r.registeredRooms, "\nOwned Rooms: ").concat(r.ownedRooms, "\n\nRooms by Priority:");
try {
for (var n = p(Object.entries(r.roomsByPriority)), a = n.next(); !a.done; a = n.next()) {
var i = d(a.value, 2), s = i[0], c = i[1];
o += "\n  ".concat(s, ": ").concat(c);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.listCreepProcesses = function(e) {
var t, r, o = _o.getProcesses().filter(function(e) {
return e.id.startsWith("creep:");
});
if (e && (o = o.filter(function(t) {
return t.name.includes("(".concat(e, ")"));
})), 0 === o.length) return e ? "No creep processes found with role: ".concat(e) : "No creep processes registered.";
var n = e ? "=== Creep Processes (Role: ".concat(e, ") ===\n") : "=== All Creep Processes ===\n";
n += "Name | Priority | Runs | Avg CPU | Errors\n", n += "-".repeat(70) + "\n";
var a = f([], d(o), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var i = p(a), s = i.next(); !s.done; s = i.next()) {
var c = s.value, u = c.stats.avgCpu.toFixed(4);
n += "".concat(c.name, " | ").concat(c.priority, " | ").concat(c.stats.runCount, " | ").concat(u, " | ").concat(c.stats.errorCount, "\n");
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
return n + "\nTotal: ".concat(o.length, " creep processes");
}, e.prototype.listRoomProcesses = function() {
var e, t, r = _o.getProcesses().filter(function(e) {
return e.id.startsWith("room:");
});
if (0 === r.length) return "No room processes registered.";
var o = "=== Room Processes ===\n";
o += "Name | Priority | Runs | Avg CPU | Errors\n", o += "-".repeat(70) + "\n";
var n = f([], d(r), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var a = p(n), i = a.next(); !i.done; i = a.next()) {
var s = i.value, c = s.stats.avgCpu.toFixed(4);
o += "".concat(s.name, " | ").concat(s.priority, " | ").concat(s.stats.runCount, " | ").concat(c, " | ").concat(s.stats.errorCount, "\n");
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
return o + "\nTotal: ".concat(r.length, " room processes");
}, m([ lo({
name: "showKernelStats",
description: "Show kernel statistics including CPU usage and process info",
usage: "showKernelStats()",
examples: [ "showKernelStats()" ],
category: "Kernel"
}) ], e.prototype, "showKernelStats", null), m([ lo({
name: "listProcesses",
description: "List all registered kernel processes",
usage: "listProcesses()",
examples: [ "listProcesses()" ],
category: "Kernel"
}) ], e.prototype, "listProcesses", null), m([ lo({
name: "suspendProcess",
description: "Suspend a kernel process by ID",
usage: "suspendProcess(processId)",
examples: [ "suspendProcess('empire:manager')", "suspendProcess('cluster:manager')" ],
category: "Kernel"
}) ], e.prototype, "suspendProcess", null), m([ lo({
name: "resumeProcess",
description: "Resume a suspended kernel process",
usage: "resumeProcess(processId)",
examples: [ "resumeProcess('empire:manager')" ],
category: "Kernel"
}) ], e.prototype, "resumeProcess", null), m([ lo({
name: "resetKernelStats",
description: "Reset all kernel process statistics",
usage: "resetKernelStats()",
examples: [ "resetKernelStats()" ],
category: "Kernel"
}) ], e.prototype, "resetKernelStats", null), m([ lo({
name: "showProcessHealth",
description: "Show health status of all processes with detailed metrics",
usage: "showProcessHealth()",
examples: [ "showProcessHealth()" ],
category: "Kernel"
}) ], e.prototype, "showProcessHealth", null), m([ lo({
name: "resumeAllProcesses",
description: "Resume all suspended processes (use with caution)",
usage: "resumeAllProcesses()",
examples: [ "resumeAllProcesses()" ],
category: "Kernel"
}) ], e.prototype, "resumeAllProcesses", null), m([ lo({
name: "showCreepStats",
description: "Show statistics about creep processes managed by the kernel",
usage: "showCreepStats()",
examples: [ "showCreepStats()" ],
category: "Kernel"
}) ], e.prototype, "showCreepStats", null), m([ lo({
name: "showRoomStats",
description: "Show statistics about room processes managed by the kernel",
usage: "showRoomStats()",
examples: [ "showRoomStats()" ],
category: "Kernel"
}) ], e.prototype, "showRoomStats", null), m([ lo({
name: "listCreepProcesses",
description: "List all creep processes with their details",
usage: "listCreepProcesses(role?)",
examples: [ "listCreepProcesses()", "listCreepProcesses('harvester')" ],
category: "Kernel"
}) ], e.prototype, "listCreepProcesses", null), m([ lo({
name: "listRoomProcesses",
description: "List all room processes with their details",
usage: "listRoomProcesses()",
examples: [ "listRoomProcesses()" ],
category: "Kernel"
}) ], e.prototype, "listRoomProcesses", null), e;
}(), bl = function() {
function e() {}
return e.prototype.listCommands = function() {
return uo.generateHelp();
}, e.prototype.commandHelp = function(e) {
return uo.generateCommandHelp(e);
}, m([ lo({
name: "listCommands",
description: "List all available commands (alias for help)",
usage: "listCommands()",
examples: [ "listCommands()" ],
category: "System"
}) ], e.prototype, "listCommands", null), m([ lo({
name: "commandHelp",
description: "Get detailed help for a specific command",
usage: "commandHelp(commandName)",
examples: [ "commandHelp('setLogLevel')", "commandHelp('suspendProcess')" ],
category: "System"
}) ], e.prototype, "commandHelp", null), e;
}(), xl = new El, Ol = new Tl, _l = new Sl, Al = new Cl, Ul = new wl, Nl = new bl, Ml = Qr("Main");

!function(e) {
void 0 === e && (e = !1);
var t = function() {
uo.initialize(), mo(xl), mo(Ol), mo(_l), mo(Al), mo(Ul), mo(Nl), mo(rl), mo(ol), 
mo(nl), mo(il), mo(ll), mo(pl), mo(yl), global.tooangel = dl;
var e = global;
e.botConfig = {
getConfig: So,
updateConfig: Co
}, e.botLogger = {
configureLogger: Lr
}, e.botVisualizationManager = Rl, e.botCacheManager = Mo, uo.exposeToGlobal();
};
e ? (uo.initialize(), uo.enableLazyLoading(t), uo.exposeToGlobal()) : t();
}(So().lazyLoadConsoleCommands);

var kl = io.wrapLoop(function() {
try {
Ju();
} catch (e) {
throw Ml.error("Critical error in main loop: ".concat(String(e)), {
meta: {
stack: e instanceof Error ? e.stack : void 0,
tick: Game.time
}
}), e;
}
});

exports.loop = kl;
