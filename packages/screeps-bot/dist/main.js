"use strict";

var e = require("@ralphschuler/screeps-kernel"), t = require("@ralphschuler/screeps-intershard"), r = function(e, t) {
return r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
}, r(e, t);
};

function o(e, t) {
if ("function" != typeof t && null !== t) throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
function o() {
this.constructor = e;
}
r(e, t), e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, 
new o);
}

var n = function() {
return n = Object.assign || function(e) {
for (var t, r = 1, o = arguments.length; r < o; r++) for (var n in t = arguments[r]) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
return e;
}, n.apply(this, arguments);
};

function a(e, t, r, o) {
var n, a = arguments.length, i = a < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, r) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, r, o); else for (var s = e.length - 1; s >= 0; s--) (n = e[s]) && (i = (a < 3 ? n(i) : a > 3 ? n(t, r, i) : n(t, r)) || i);
return a > 3 && i && Object.defineProperty(t, r, i), i;
}

function i(e) {
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

function s(e, t) {
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

function c(e, t, r) {
if (r || 2 === arguments.length) for (var o, n = 0, a = t.length; n < a; n++) !o && n in t || (o || (o = Array.prototype.slice.call(t, 0, n)), 
o[n] = t[n]);
return e.concat(o || Array.prototype.slice.call(t));
}

"function" == typeof SuppressedError && SuppressedError;

var l = "#555555", u = "#AAAAAA", m = "#FFE87B", p = "#F53547", f = "#181818", d = "#8FBB93";

"undefined" != typeof RoomVisual && (RoomVisual.prototype.structure = function(e, t, r, o) {
void 0 === o && (o = {});
var a = n({
opacity: 1
}, o);
switch (r) {
case STRUCTURE_EXTENSION:
this.circle(e, t, {
radius: .5,
fill: f,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: l,
opacity: a.opacity
});
break;

case STRUCTURE_SPAWN:
this.circle(e, t, {
radius: .65,
fill: f,
stroke: "#CCCCCC",
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: m,
opacity: a.opacity
});
break;

case STRUCTURE_POWER_SPAWN:
this.circle(e, t, {
radius: .65,
fill: f,
stroke: p,
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: m,
opacity: a.opacity
});
break;

case STRUCTURE_TOWER:
this.circle(e, t, {
radius: .6,
fill: f,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: l,
opacity: a.opacity
}), this.rect(e - .2, t - .3, .4, .6, {
fill: u,
opacity: a.opacity
});
break;

case STRUCTURE_STORAGE:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: d,
strokeWidth: .05,
fill: f,
opacity: a.opacity
}), this.rect(e - .35, t - .45, .7, .9, {
fill: m,
opacity: .6 * a.opacity
});
break;

case STRUCTURE_TERMINAL:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: d,
strokeWidth: .05,
fill: f,
opacity: a.opacity
}), this.circle(e, t, {
radius: .3,
fill: u,
opacity: a.opacity
}), this.rect(e - .15, t - .15, .3, .3, {
fill: l,
opacity: a.opacity
});
break;

case STRUCTURE_LAB:
this.circle(e, t, {
radius: .55,
fill: f,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: l,
opacity: a.opacity
}), this.rect(e - .15, t + .1, .3, .25, {
fill: u,
opacity: a.opacity
});
break;

case STRUCTURE_LINK:
this.circle(e, t, {
radius: .5,
fill: f,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: u,
opacity: a.opacity
});
break;

case STRUCTURE_NUKER:
this.circle(e, t, {
radius: .65,
fill: f,
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
fill: f,
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
fill: f,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.rect(e - .35, t - .35, .7, .7, {
fill: "transparent",
stroke: l,
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
fill: f,
stroke: u,
strokeWidth: .05,
opacity: a.opacity
});
break;

case STRUCTURE_EXTRACTOR:
this.circle(e, t, {
radius: .6,
fill: f,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: l,
opacity: a.opacity
});
break;

default:
this.circle(e, t, {
radius: .5,
fill: l,
stroke: d,
strokeWidth: .05,
opacity: a.opacity
});
}
}, RoomVisual.prototype.speech = function(e, t, r, o) {
var n, a, i, s, c;
void 0 === o && (o = {});
var l = null !== (n = o.background) && void 0 !== n ? n : "#2ccf3b", u = null !== (a = o.textcolor) && void 0 !== a ? a : "#000000", m = null !== (i = o.textsize) && void 0 !== i ? i : .5, p = null !== (s = o.textfont) && void 0 !== s ? s : "Times New Roman", f = null !== (c = o.opacity) && void 0 !== c ? c : 1, d = m, y = e.length * d * .4 + .4, g = d + .4;
this.rect(t - y / 2, r - 1 - g, y, g, {
fill: l,
opacity: .9 * f
});
var h = [ [ t - .1, r - 1 ], [ t + .1, r - 1 ], [ t, r - .6 ] ];
this.poly(h, {
fill: l,
opacity: .9 * f,
stroke: "transparent"
}), this.text(e, t, r - 1 - g / 2 + .1, {
color: u,
font: "".concat(d, " ").concat(p),
opacity: f
});
}, RoomVisual.prototype.animatedPosition = function(e, t, r) {
var o, n, a, i;
void 0 === r && (r = {});
var s = null !== (o = r.color) && void 0 !== o ? o : "#ff0000", c = null !== (n = r.opacity) && void 0 !== n ? n : 1, l = null !== (a = r.radius) && void 0 !== a ? a : .75, u = null !== (i = r.frames) && void 0 !== i ? i : 6, m = Game.time % u, p = l * (1 - m / u), f = c * (m / u);
this.circle(e, t, {
radius: p,
fill: "transparent",
stroke: s,
strokeWidth: .1,
opacity: f
});
}, RoomVisual.prototype.resource = function(e, t, r, o) {
var n, a;
void 0 === o && (o = .25);
var i = null !== (a = ((n = {})[RESOURCE_ENERGY] = m, n[RESOURCE_POWER] = p, n[RESOURCE_HYDROGEN] = "#FFFFFF", 
n[RESOURCE_OXYGEN] = "#DDDDDD", n[RESOURCE_UTRIUM] = "#48C5E5", n[RESOURCE_LEMERGIUM] = "#24D490", 
n[RESOURCE_KEANIUM] = "#9269EC", n[RESOURCE_ZYNTHIUM] = "#D9B478", n[RESOURCE_CATALYST] = "#F26D6F", 
n[RESOURCE_GHODIUM] = "#FFFFFF", n)[e]) && void 0 !== a ? a : "#CCCCCC";
this.circle(t, r, {
radius: o,
fill: f,
opacity: .9
}), this.circle(t, r, {
radius: .8 * o,
fill: i,
opacity: .8
});
var s = e.length <= 2 ? e : e.substring(0, 2).toUpperCase();
this.text(s, t, r + .03, {
color: f,
font: "".concat(1.2 * o, " monospace"),
align: "center",
opacity: .9
});
});

var y = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

function g(e) {
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

var h, v, R = {}, E = {}, T = {}, C = {};

function S() {
if (h) return C;
h = 1;
const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
return C.encode = function(t) {
if (0 <= t && t < e.length) return e[t];
throw new TypeError("Must be between 0 and 63: " + t);
}, C;
}

function w() {
if (v) return T;
v = 1;
const e = S();
return T.encode = function(t) {
let r, o = "", n = function(e) {
return e < 0 ? 1 + (-e << 1) : 0 + (e << 1);
}(t);
do {
r = 31 & n, n >>>= 5, n > 0 && (r |= 32), o += e.encode(r);
} while (n > 0);
return o;
}, T;
}

var b, O, _, x = {}, U = {}, A = {
exports: {}
}, N = A.exports;

function M() {
return b || (b = 1, e = A, t = A.exports, function(r) {
var o = t && !t.nodeType && t, n = e && !e.nodeType && e, a = "object" == typeof y && y;
a.global !== a && a.window !== a && a.self !== a || (r = a);
var i, s, c = 2147483647, l = 36, u = /^xn--/, m = /[^\x20-\x7E]/, p = /[\x2E\u3002\uFF0E\uFF61]/g, f = {
overflow: "Overflow: input needs wider integers to process",
"not-basic": "Illegal input >= 0x80 (not a basic code point)",
"invalid-input": "Invalid input"
}, d = Math.floor, g = String.fromCharCode;
function h(e) {
throw new RangeError(f[e]);
}
function v(e, t) {
for (var r = e.length, o = []; r--; ) o[r] = t(e[r]);
return o;
}
function R(e, t) {
var r = e.split("@"), o = "";
return r.length > 1 && (o = r[0] + "@", e = r[1]), o + v((e = e.replace(p, ".")).split("."), t).join(".");
}
function E(e) {
for (var t, r, o = [], n = 0, a = e.length; n < a; ) (t = e.charCodeAt(n++)) >= 55296 && t <= 56319 && n < a ? 56320 == (64512 & (r = e.charCodeAt(n++))) ? o.push(((1023 & t) << 10) + (1023 & r) + 65536) : (o.push(t), 
n--) : o.push(t);
return o;
}
function T(e) {
return v(e, function(e) {
var t = "";
return e > 65535 && (t += g((e -= 65536) >>> 10 & 1023 | 55296), e = 56320 | 1023 & e), 
t + g(e);
}).join("");
}
function C(e) {
return e - 48 < 10 ? e - 22 : e - 65 < 26 ? e - 65 : e - 97 < 26 ? e - 97 : l;
}
function S(e, t) {
return e + 22 + 75 * (e < 26) - ((0 != t) << 5);
}
function w(e, t, r) {
var o = 0;
for (e = r ? d(e / 700) : e >> 1, e += d(e / t); e > 455; o += l) e = d(e / 35);
return d(o + 36 * e / (e + 38));
}
function b(e) {
var t, r, o, n, a, i, s, u, m, p, f = [], y = e.length, g = 0, v = 128, R = 72;
for ((r = e.lastIndexOf("-")) < 0 && (r = 0), o = 0; o < r; ++o) e.charCodeAt(o) >= 128 && h("not-basic"), 
f.push(e.charCodeAt(o));
for (n = r > 0 ? r + 1 : 0; n < y; ) {
for (a = g, i = 1, s = l; n >= y && h("invalid-input"), ((u = C(e.charCodeAt(n++))) >= l || u > d((c - g) / i)) && h("overflow"), 
g += u * i, !(u < (m = s <= R ? 1 : s >= R + 26 ? 26 : s - R)); s += l) i > d(c / (p = l - m)) && h("overflow"), 
i *= p;
R = w(g - a, t = f.length + 1, 0 == a), d(g / t) > c - v && h("overflow"), v += d(g / t), 
g %= t, f.splice(g++, 0, v);
}
return T(f);
}
function O(e) {
var t, r, o, n, a, i, s, u, m, p, f, y, v, R, T, C = [];
for (y = (e = E(e)).length, t = 128, r = 0, a = 72, i = 0; i < y; ++i) (f = e[i]) < 128 && C.push(g(f));
for (o = n = C.length, n && C.push("-"); o < y; ) {
for (s = c, i = 0; i < y; ++i) (f = e[i]) >= t && f < s && (s = f);
for (s - t > d((c - r) / (v = o + 1)) && h("overflow"), r += (s - t) * v, t = s, 
i = 0; i < y; ++i) if ((f = e[i]) < t && ++r > c && h("overflow"), f == t) {
for (u = r, m = l; !(u < (p = m <= a ? 1 : m >= a + 26 ? 26 : m - a)); m += l) T = u - p, 
R = l - p, C.push(g(S(p + T % R, 0))), u = d(T / R);
C.push(g(S(u, 0))), a = w(r, v, o == n), r = 0, ++o;
}
++r, ++t;
}
return C.join("");
}
if (i = {
version: "1.4.1",
ucs2: {
decode: E,
encode: T
},
decode: b,
encode: O,
toASCII: function(e) {
return R(e, function(e) {
return m.test(e) ? "xn--" + O(e) : e;
});
},
toUnicode: function(e) {
return R(e, function(e) {
return u.test(e) ? b(e.slice(4).toLowerCase()) : e;
});
}
}, o && n) if (e.exports == o) n.exports = i; else for (s in i) i.hasOwnProperty(s) && (o[s] = i[s]); else r.punycode = i;
}(N)), A.exports;
var e, t;
}

function k() {
return _ ? O : (_ = 1, O = TypeError);
}

var P, I, G, L, D, F, B, H, W, Y, K, j, V, q, z, X, Q, Z, $, J, ee, te, re, oe, ne, ae, ie, se, ce, le, ue, me, pe, fe, de, ye, ge, he, ve, Re, Ee, Te, Ce, Se, we, be, Oe, _e, xe, Ue, Ae, Ne, Me, ke, Pe, Ie, Ge, Le, De, Fe, Be, He, We, Ye, Ke, je, Ve, qe, ze, Xe, Qe, Ze, $e, Je, et, tt, rt, ot, nt, at, it, st, ct, lt, ut, mt, pt, ft, dt, yt, gt, ht, vt = g(Object.freeze({
__proto__: null,
default: {}
}));

function Rt() {
if (I) return P;
I = 1;
var e = "function" == typeof Map && Map.prototype, t = Object.getOwnPropertyDescriptor && e ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null, r = e && t && "function" == typeof t.get ? t.get : null, o = e && Map.prototype.forEach, n = "function" == typeof Set && Set.prototype, a = Object.getOwnPropertyDescriptor && n ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null, i = n && a && "function" == typeof a.get ? a.get : null, s = n && Set.prototype.forEach, c = "function" == typeof WeakMap && WeakMap.prototype ? WeakMap.prototype.has : null, l = "function" == typeof WeakSet && WeakSet.prototype ? WeakSet.prototype.has : null, u = "function" == typeof WeakRef && WeakRef.prototype ? WeakRef.prototype.deref : null, m = Boolean.prototype.valueOf, p = Object.prototype.toString, f = Function.prototype.toString, d = String.prototype.match, g = String.prototype.slice, h = String.prototype.replace, v = String.prototype.toUpperCase, R = String.prototype.toLowerCase, E = RegExp.prototype.test, T = Array.prototype.concat, C = Array.prototype.join, S = Array.prototype.slice, w = Math.floor, b = "function" == typeof BigInt ? BigInt.prototype.valueOf : null, O = Object.getOwnPropertySymbols, _ = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? Symbol.prototype.toString : null, x = "function" == typeof Symbol && "object" == typeof Symbol.iterator, U = "function" == typeof Symbol && Symbol.toStringTag && (Symbol.toStringTag, 
1) ? Symbol.toStringTag : null, A = Object.prototype.propertyIsEnumerable, N = ("function" == typeof Reflect ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(e) {
return e.__proto__;
} : null);
function M(e, t) {
if (e === 1 / 0 || e === -1 / 0 || e != e || e && e > -1e3 && e < 1e3 || E.call(/e/, t)) return t;
var r = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
if ("number" == typeof e) {
var o = e < 0 ? -w(-e) : w(e);
if (o !== e) {
var n = String(o), a = g.call(t, n.length + 1);
return h.call(n, r, "$&_") + "." + h.call(h.call(a, /([0-9]{3})/g, "$&_"), /_$/, "");
}
}
return h.call(t, r, "$&_");
}
var k = vt, G = k.custom, L = j(G) ? G : null, D = {
__proto__: null,
double: '"',
single: "'"
}, F = {
__proto__: null,
double: /(["\\])/g,
single: /(['\\])/g
};
function B(e, t, r) {
var o = r.quoteStyle || t, n = D[o];
return n + e + n;
}
function H(e) {
return h.call(String(e), /"/g, "&quot;");
}
function W(e) {
return !U || !("object" == typeof e && (U in e || void 0 !== e[U]));
}
function Y(e) {
return "[object Array]" === z(e) && W(e);
}
function K(e) {
return "[object RegExp]" === z(e) && W(e);
}
function j(e) {
if (x) return e && "object" == typeof e && e instanceof Symbol;
if ("symbol" == typeof e) return !0;
if (!e || "object" != typeof e || !_) return !1;
try {
return _.call(e), !0;
} catch (e) {}
return !1;
}
P = function e(t, n, a, p) {
var v = n || {};
if (q(v, "quoteStyle") && !q(D, v.quoteStyle)) throw new TypeError('option "quoteStyle" must be "single" or "double"');
if (q(v, "maxStringLength") && ("number" == typeof v.maxStringLength ? v.maxStringLength < 0 && v.maxStringLength !== 1 / 0 : null !== v.maxStringLength)) throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
var E = !q(v, "customInspect") || v.customInspect;
if ("boolean" != typeof E && "symbol" !== E) throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
if (q(v, "indent") && null !== v.indent && "\t" !== v.indent && !(parseInt(v.indent, 10) === v.indent && v.indent > 0)) throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
if (q(v, "numericSeparator") && "boolean" != typeof v.numericSeparator) throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
var w = v.numericSeparator;
if (void 0 === t) return "undefined";
if (null === t) return "null";
if ("boolean" == typeof t) return t ? "true" : "false";
if ("string" == typeof t) return Q(t, v);
if ("number" == typeof t) {
if (0 === t) return 1 / 0 / t > 0 ? "0" : "-0";
var O = String(t);
return w ? M(t, O) : O;
}
if ("bigint" == typeof t) {
var P = String(t) + "n";
return w ? M(t, P) : P;
}
var I = void 0 === v.depth ? 5 : v.depth;
if (void 0 === a && (a = 0), a >= I && I > 0 && "object" == typeof t) return Y(t) ? "[Array]" : "[Object]";
var G, F = function(e, t) {
var r;
if ("\t" === e.indent) r = "\t"; else {
if (!("number" == typeof e.indent && e.indent > 0)) return null;
r = C.call(Array(e.indent + 1), " ");
}
return {
base: r,
prev: C.call(Array(t + 1), r)
};
}(v, a);
if (void 0 === p) p = []; else if (X(p, t) >= 0) return "[Circular]";
function V(t, r, o) {
if (r && (p = S.call(p)).push(r), o) {
var n = {
depth: v.depth
};
return q(v, "quoteStyle") && (n.quoteStyle = v.quoteStyle), e(t, n, a + 1, p);
}
return e(t, v, a + 1, p);
}
if ("function" == typeof t && !K(t)) {
var Z = function(e) {
if (e.name) return e.name;
var t = d.call(f.call(e), /^function\s*([\w$]+)/);
return t ? t[1] : null;
}(t), oe = re(t, V);
return "[Function" + (Z ? ": " + Z : " (anonymous)") + "]" + (oe.length > 0 ? " { " + C.call(oe, ", ") + " }" : "");
}
if (j(t)) {
var ne = x ? h.call(String(t), /^(Symbol\(.*\))_[^)]*$/, "$1") : _.call(t);
return "object" != typeof t || x ? ne : $(ne);
}
if ((G = t) && "object" == typeof G && ("undefined" != typeof HTMLElement && G instanceof HTMLElement || "string" == typeof G.nodeName && "function" == typeof G.getAttribute)) {
for (var ae = "<" + R.call(String(t.nodeName)), ie = t.attributes || [], se = 0; se < ie.length; se++) ae += " " + ie[se].name + "=" + B(H(ie[se].value), "double", v);
return ae += ">", t.childNodes && t.childNodes.length && (ae += "..."), ae + "</" + R.call(String(t.nodeName)) + ">";
}
if (Y(t)) {
if (0 === t.length) return "[]";
var ce = re(t, V);
return F && !function(e) {
for (var t = 0; t < e.length; t++) if (X(e[t], "\n") >= 0) return !1;
return !0;
}(ce) ? "[" + te(ce, F) + "]" : "[ " + C.call(ce, ", ") + " ]";
}
if (function(e) {
return "[object Error]" === z(e) && W(e);
}(t)) {
var le = re(t, V);
return "cause" in Error.prototype || !("cause" in t) || A.call(t, "cause") ? 0 === le.length ? "[" + String(t) + "]" : "{ [" + String(t) + "] " + C.call(le, ", ") + " }" : "{ [" + String(t) + "] " + C.call(T.call("[cause]: " + V(t.cause), le), ", ") + " }";
}
if ("object" == typeof t && E) {
if (L && "function" == typeof t[L] && k) return k(t, {
depth: I - a
});
if ("symbol" !== E && "function" == typeof t.inspect) return t.inspect();
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
var ue = [];
return o && o.call(t, function(e, r) {
ue.push(V(r, t, !0) + " => " + V(e, t));
}), ee("Map", r.call(t), ue, F);
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
me.push(V(e, t));
}), ee("Set", i.call(t), me, F);
}
if (function(e) {
if (!c || !e || "object" != typeof e) return !1;
try {
c.call(e, c);
try {
l.call(e, l);
} catch (e) {
return !0;
}
return e instanceof WeakMap;
} catch (e) {}
return !1;
}(t)) return J("WeakMap");
if (function(e) {
if (!l || !e || "object" != typeof e) return !1;
try {
l.call(e, l);
try {
c.call(e, c);
} catch (e) {
return !0;
}
return e instanceof WeakSet;
} catch (e) {}
return !1;
}(t)) return J("WeakSet");
if (function(e) {
if (!u || !e || "object" != typeof e) return !1;
try {
return u.call(e), !0;
} catch (e) {}
return !1;
}(t)) return J("WeakRef");
if (function(e) {
return "[object Number]" === z(e) && W(e);
}(t)) return $(V(Number(t)));
if (function(e) {
if (!e || "object" != typeof e || !b) return !1;
try {
return b.call(e), !0;
} catch (e) {}
return !1;
}(t)) return $(V(b.call(t)));
if (function(e) {
return "[object Boolean]" === z(e) && W(e);
}(t)) return $(m.call(t));
if (function(e) {
return "[object String]" === z(e) && W(e);
}(t)) return $(V(String(t)));
if ("undefined" != typeof window && t === window) return "{ [object Window] }";
if ("undefined" != typeof globalThis && t === globalThis || void 0 !== y && t === y) return "{ [object globalThis] }";
if (!function(e) {
return "[object Date]" === z(e) && W(e);
}(t) && !K(t)) {
var pe = re(t, V), fe = N ? N(t) === Object.prototype : t instanceof Object || t.constructor === Object, de = t instanceof Object ? "" : "null prototype", ye = !fe && U && Object(t) === t && U in t ? g.call(z(t), 8, -1) : de ? "Object" : "", ge = (fe || "function" != typeof t.constructor ? "" : t.constructor.name ? t.constructor.name + " " : "") + (ye || de ? "[" + C.call(T.call([], ye || [], de || []), ": ") + "] " : "");
return 0 === pe.length ? ge + "{}" : F ? ge + "{" + te(pe, F) + "}" : ge + "{ " + C.call(pe, ", ") + " }";
}
return String(t);
};
var V = Object.prototype.hasOwnProperty || function(e) {
return e in this;
};
function q(e, t) {
return V.call(e, t);
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
return Q(g.call(e, 0, t.maxStringLength), t) + o;
}
var n = F[t.quoteStyle || "single"];
return n.lastIndex = 0, B(h.call(h.call(e, n, "\\$1"), /[\x00-\x1f]/g, Z), "single", t);
}
function Z(e) {
var t = e.charCodeAt(0), r = {
8: "b",
9: "t",
10: "n",
12: "f",
13: "r"
}[t];
return r ? "\\" + r : "\\x" + (t < 16 ? "0" : "") + v.call(t.toString(16));
}
function $(e) {
return "Object(" + e + ")";
}
function J(e) {
return e + " { ? }";
}
function ee(e, t, r, o) {
return e + " (" + t + ") {" + (o ? te(r, o) : C.call(r, ", ")) + "}";
}
function te(e, t) {
if (0 === e.length) return "";
var r = "\n" + t.prev + t.base;
return r + C.call(e, "," + r) + "\n" + t.prev;
}
function re(e, t) {
var r = Y(e), o = [];
if (r) {
o.length = e.length;
for (var n = 0; n < e.length; n++) o[n] = q(e, n) ? t(e[n], e) : "";
}
var a, i = "function" == typeof O ? O(e) : [];
if (x) {
a = {};
for (var s = 0; s < i.length; s++) a["$" + i[s]] = i[s];
}
for (var c in e) q(e, c) && (r && String(Number(c)) === c && c < e.length || x && a["$" + c] instanceof Symbol || (E.call(/[^\w$]/, c) ? o.push(t(c, e) + ": " + t(e[c], e)) : o.push(c + ": " + t(e[c], e))));
if ("function" == typeof O) for (var l = 0; l < i.length; l++) A.call(e, i[l]) && o.push("[" + t(i[l]) + "]: " + t(e[i[l]], e));
return o;
}
return P;
}

function Et() {
return F ? D : (F = 1, D = Object);
}

function Tt() {
return H ? B : (H = 1, B = Error);
}

function Ct() {
return Y ? W : (Y = 1, W = EvalError);
}

function St() {
return j ? K : (j = 1, K = RangeError);
}

function wt() {
return q ? V : (q = 1, V = ReferenceError);
}

function bt() {
return X ? z : (X = 1, z = SyntaxError);
}

function Ot() {
return Z ? Q : (Z = 1, Q = URIError);
}

function _t() {
return J ? $ : (J = 1, $ = Math.abs);
}

function xt() {
return te ? ee : (te = 1, ee = Math.floor);
}

function Ut() {
return oe ? re : (oe = 1, re = Math.max);
}

function At() {
return ae ? ne : (ae = 1, ne = Math.min);
}

function Nt() {
return se ? ie : (se = 1, ie = Math.pow);
}

function Mt() {
return le ? ce : (le = 1, ce = Math.round);
}

function kt() {
return me ? ue : (me = 1, ue = Number.isNaN || function(e) {
return e != e;
});
}

function Pt() {
if (fe) return pe;
fe = 1;
var e = kt();
return pe = function(t) {
return e(t) || 0 === t ? t : t < 0 ? -1 : 1;
};
}

function It() {
return ye ? de : (ye = 1, de = Object.getOwnPropertyDescriptor);
}

function Gt() {
if (he) return ge;
he = 1;
var e = It();
if (e) try {
e([], "length");
} catch (t) {
e = null;
}
return ge = e;
}

function Lt() {
if (Re) return ve;
Re = 1;
var e = Object.defineProperty || !1;
if (e) try {
e({}, "a", {
value: 1
});
} catch (t) {
e = !1;
}
return ve = e;
}

function Dt() {
if (Se) return Ce;
Se = 1;
var e = "undefined" != typeof Symbol && Symbol, t = Te ? Ee : (Te = 1, Ee = function() {
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
return Ce = function() {
return "function" == typeof e && "function" == typeof Symbol && "symbol" == typeof e("foo") && "symbol" == typeof Symbol("bar") && t();
};
}

function Ft() {
return be ? we : (be = 1, we = "undefined" != typeof Reflect && Reflect.getPrototypeOf || null);
}

function Bt() {
return _e ? Oe : (_e = 1, Oe = Et().getPrototypeOf || null);
}

function Ht() {
if (Ue) return xe;
Ue = 1;
var e = Object.prototype.toString, t = Math.max, r = function(e, t) {
for (var r = [], o = 0; o < e.length; o += 1) r[o] = e[o];
for (var n = 0; n < t.length; n += 1) r[n + e.length] = t[n];
return r;
};
return xe = function(o) {
var n = this;
if ("function" != typeof n || "[object Function]" !== e.apply(n)) throw new TypeError("Function.prototype.bind called on incompatible " + n);
for (var a, i = function(e) {
for (var t = [], r = 1, o = 0; r < e.length; r += 1, o += 1) t[o] = e[r];
return t;
}(arguments), s = t(0, n.length - i.length), c = [], l = 0; l < s; l++) c[l] = "$" + l;
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
var u = function() {};
u.prototype = n.prototype, a.prototype = new u, u.prototype = null;
}
return a;
}, xe;
}

function Wt() {
if (Ne) return Ae;
Ne = 1;
var e = Ht();
return Ae = Function.prototype.bind || e;
}

function Yt() {
return ke ? Me : (ke = 1, Me = Function.prototype.call);
}

function Kt() {
return Ie ? Pe : (Ie = 1, Pe = Function.prototype.apply);
}

function jt() {
if (He) return Be;
He = 1;
var e = Wt(), t = k(), r = Yt(), o = function() {
if (Fe) return De;
Fe = 1;
var e = Wt(), t = Kt(), r = Yt(), o = Le ? Ge : (Le = 1, Ge = "undefined" != typeof Reflect && Reflect && Reflect.apply);
return De = o || e.call(r, t);
}();
return Be = function(n) {
if (n.length < 1 || "function" != typeof n[0]) throw new t("a function is required");
return o(e, r, n);
};
}

function Vt() {
if (Ye) return We;
Ye = 1;
var e, t = jt(), r = Gt();
try {
e = [].__proto__ === Array.prototype;
} catch (e) {
if (!e || "object" != typeof e || !("code" in e) || "ERR_PROTO_ACCESS" !== e.code) throw e;
}
var o = !!e && r && r(Object.prototype, "__proto__"), n = Object, a = n.getPrototypeOf;
return We = o && "function" == typeof o.get ? t([ o.get ]) : "function" == typeof a && function(e) {
return a(null == e ? e : n(e));
};
}

function qt() {
if (je) return Ke;
je = 1;
var e = Ft(), t = Bt(), r = Vt();
return Ke = e ? function(t) {
return e(t);
} : t ? function(e) {
if (!e || "object" != typeof e && "function" != typeof e) throw new TypeError("getProto: not an object");
return t(e);
} : r ? function(e) {
return r(e);
} : null;
}

function zt() {
if (qe) return Ve;
qe = 1;
var e = Function.prototype.call, t = Object.prototype.hasOwnProperty, r = Wt();
return Ve = r.call(e, t);
}

function Xt() {
if (Xe) return ze;
var e;
Xe = 1;
var t = Et(), r = Tt(), o = Ct(), n = St(), a = wt(), i = bt(), s = k(), c = Ot(), l = _t(), u = xt(), m = Ut(), p = At(), f = Nt(), d = Mt(), y = Pt(), g = Function, h = function(e) {
try {
return g('"use strict"; return (' + e + ").constructor;")();
} catch (e) {}
}, v = Gt(), R = Lt(), E = function() {
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
}() : E, C = Dt()(), S = qt(), w = Bt(), b = Ft(), O = Kt(), _ = Yt(), x = {}, U = "undefined" != typeof Uint8Array && S ? S(Uint8Array) : e, A = {
__proto__: null,
"%AggregateError%": "undefined" == typeof AggregateError ? e : AggregateError,
"%Array%": Array,
"%ArrayBuffer%": "undefined" == typeof ArrayBuffer ? e : ArrayBuffer,
"%ArrayIteratorPrototype%": C && S ? S([][Symbol.iterator]()) : e,
"%AsyncFromSyncIteratorPrototype%": e,
"%AsyncFunction%": x,
"%AsyncGenerator%": x,
"%AsyncGeneratorFunction%": x,
"%AsyncIteratorPrototype%": x,
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
"%Function%": g,
"%GeneratorFunction%": x,
"%Int8Array%": "undefined" == typeof Int8Array ? e : Int8Array,
"%Int16Array%": "undefined" == typeof Int16Array ? e : Int16Array,
"%Int32Array%": "undefined" == typeof Int32Array ? e : Int32Array,
"%isFinite%": isFinite,
"%isNaN%": isNaN,
"%IteratorPrototype%": C && S ? S(S([][Symbol.iterator]())) : e,
"%JSON%": "object" == typeof JSON ? JSON : e,
"%Map%": "undefined" == typeof Map ? e : Map,
"%MapIteratorPrototype%": "undefined" != typeof Map && C && S ? S((new Map)[Symbol.iterator]()) : e,
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
"%SetIteratorPrototype%": "undefined" != typeof Set && C && S ? S((new Set)[Symbol.iterator]()) : e,
"%SharedArrayBuffer%": "undefined" == typeof SharedArrayBuffer ? e : SharedArrayBuffer,
"%String%": String,
"%StringIteratorPrototype%": C && S ? S(""[Symbol.iterator]()) : e,
"%Symbol%": C ? Symbol : e,
"%SyntaxError%": i,
"%ThrowTypeError%": T,
"%TypedArray%": U,
"%TypeError%": s,
"%Uint8Array%": "undefined" == typeof Uint8Array ? e : Uint8Array,
"%Uint8ClampedArray%": "undefined" == typeof Uint8ClampedArray ? e : Uint8ClampedArray,
"%Uint16Array%": "undefined" == typeof Uint16Array ? e : Uint16Array,
"%Uint32Array%": "undefined" == typeof Uint32Array ? e : Uint32Array,
"%URIError%": c,
"%WeakMap%": "undefined" == typeof WeakMap ? e : WeakMap,
"%WeakRef%": "undefined" == typeof WeakRef ? e : WeakRef,
"%WeakSet%": "undefined" == typeof WeakSet ? e : WeakSet,
"%Function.prototype.call%": _,
"%Function.prototype.apply%": O,
"%Object.defineProperty%": R,
"%Object.getPrototypeOf%": w,
"%Math.abs%": l,
"%Math.floor%": u,
"%Math.max%": m,
"%Math.min%": p,
"%Math.pow%": f,
"%Math.round%": d,
"%Math.sign%": y,
"%Reflect.getPrototypeOf%": b
};
if (S) try {
null.error;
} catch (e) {
var N = S(S(e));
A["%Error.prototype%"] = N;
}
var M = function e(t) {
var r;
if ("%AsyncFunction%" === t) r = h("async function () {}"); else if ("%GeneratorFunction%" === t) r = h("function* () {}"); else if ("%AsyncGeneratorFunction%" === t) r = h("async function* () {}"); else if ("%AsyncGenerator%" === t) {
var o = e("%AsyncGeneratorFunction%");
o && (r = o.prototype);
} else if ("%AsyncIteratorPrototype%" === t) {
var n = e("%AsyncGenerator%");
n && S && (r = S(n.prototype));
}
return A[t] = r, r;
}, P = {
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
}, I = Wt(), G = zt(), L = I.call(_, Array.prototype.concat), D = I.call(O, Array.prototype.splice), F = I.call(_, String.prototype.replace), B = I.call(_, String.prototype.slice), H = I.call(_, RegExp.prototype.exec), W = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, Y = /\\(\\)?/g, K = function(e, t) {
var r, o = e;
if (G(P, o) && (o = "%" + (r = P[o])[0] + "%"), G(A, o)) {
var n = A[o];
if (n === x && (n = M(o)), void 0 === n && !t) throw new s("intrinsic " + e + " exists, but is not available. Please file an issue!");
return {
alias: r,
name: o,
value: n
};
}
throw new i("intrinsic " + e + " does not exist!");
};
return ze = function(e, t) {
if ("string" != typeof e || 0 === e.length) throw new s("intrinsic name must be a non-empty string");
if (arguments.length > 1 && "boolean" != typeof t) throw new s('"allowMissing" argument must be a boolean');
if (null === H(/^%?[^%]*%?$/, e)) throw new i("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
var r = function(e) {
var t = B(e, 0, 1), r = B(e, -1);
if ("%" === t && "%" !== r) throw new i("invalid intrinsic syntax, expected closing `%`");
if ("%" === r && "%" !== t) throw new i("invalid intrinsic syntax, expected opening `%`");
var o = [];
return F(e, W, function(e, t, r, n) {
o[o.length] = r ? F(n, Y, "$1") : t || e;
}), o;
}(e), o = r.length > 0 ? r[0] : "", n = K("%" + o + "%", t), a = n.name, c = n.value, l = !1, u = n.alias;
u && (o = u[0], D(r, L([ 0, 1 ], u)));
for (var m = 1, p = !0; m < r.length; m += 1) {
var f = r[m], d = B(f, 0, 1), y = B(f, -1);
if (('"' === d || "'" === d || "`" === d || '"' === y || "'" === y || "`" === y) && d !== y) throw new i("property names with quotes must have matching quotes");
if ("constructor" !== f && p || (l = !0), G(A, a = "%" + (o += "." + f) + "%")) c = A[a]; else if (null != c) {
if (!(f in c)) {
if (!t) throw new s("base intrinsic for " + e + " exists, but the property is not available.");
return;
}
if (v && m + 1 >= r.length) {
var g = v(c, f);
c = (p = !!g) && "get" in g && !("originalValue" in g.get) ? g.get : c[f];
} else p = G(c, f), c = c[f];
p && !l && (A[a] = c);
}
}
return c;
}, ze;
}

function Qt() {
if (Ze) return Qe;
Ze = 1;
var e = Xt(), t = jt(), r = t([ e("%String.prototype.indexOf%") ]);
return Qe = function(o, n) {
var a = e(o, !!n);
return "function" == typeof a && r(o, ".prototype.") > -1 ? t([ a ]) : a;
};
}

function Zt() {
if (Je) return $e;
Je = 1;
var e = Xt(), t = Qt(), r = Rt(), o = k(), n = e("%Map%", !0), a = t("Map.prototype.get", !0), i = t("Map.prototype.set", !0), s = t("Map.prototype.has", !0), c = t("Map.prototype.delete", !0), l = t("Map.prototype.size", !0);
return $e = !!n && function() {
var e, t = {
assert: function(e) {
if (!t.has(e)) throw new o("Side channel does not contain " + r(e));
},
delete: function(t) {
if (e) {
var r = c(e, t);
return 0 === l(e) && (e = void 0), r;
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

function $t() {
if (ot) return rt;
ot = 1;
var e = k(), t = Rt(), r = function() {
if (L) return G;
L = 1;
var e = Rt(), t = k(), r = function(e, t, r) {
for (var o, n = e; null != (o = n.next); n = o) if (o.key === t) return n.next = o.next, 
r || (o.next = e.next, e.next = o), o;
};
return G = function() {
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
}(), o = Zt(), n = function() {
if (tt) return et;
tt = 1;
var e = Xt(), t = Qt(), r = Rt(), o = Zt(), n = k(), a = e("%WeakMap%", !0), i = t("WeakMap.prototype.get", !0), s = t("WeakMap.prototype.set", !0), c = t("WeakMap.prototype.has", !0), l = t("WeakMap.prototype.delete", !0);
return et = a ? function() {
var e, t, u = {
assert: function(e) {
if (!u.has(e)) throw new n("Side channel does not contain " + r(e));
},
delete: function(r) {
if (a && r && ("object" == typeof r || "function" == typeof r)) {
if (e) return l(e, r);
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
return u;
} : o;
}(), a = n || o || r;
return rt = function() {
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
}

function Jt() {
if (at) return nt;
at = 1;
var e = String.prototype.replace, t = /%20/g, r = "RFC3986";
return nt = {
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

function er() {
if (st) return it;
st = 1;
var e = Jt(), t = $t(), r = Object.prototype.hasOwnProperty, o = Array.isArray, n = t(), a = function(e, t) {
return n.set(e, t), e;
}, i = function(e) {
return n.has(e);
}, s = function(e) {
return n.get(e);
}, c = function(e, t) {
n.set(e, t);
}, l = function() {
for (var e = [], t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
return e;
}(), u = function(e, t) {
for (var r = t && t.plainObjects ? {
__proto__: null
} : {}, o = 0; o < e.length; ++o) void 0 !== e[o] && (r[o] = e[o]);
return r;
}, m = 1024;
return it = {
arrayToObject: u,
assign: function(e, t) {
return Object.keys(t).reduce(function(e, r) {
return e[r] = t[r], e;
}, e);
},
combine: function(e, t, r, o) {
if (i(e)) {
var n = s(e) + 1;
return e[n] = t, c(e, n), e;
}
var l = [].concat(e, t);
return l.length > r ? a(u(l, {
plainObjects: o
}), l.length - 1) : l;
},
compact: function(e) {
for (var t = [ {
obj: {
o: e
},
prop: "o"
} ], r = [], n = 0; n < t.length; ++n) for (var a = t[n], i = a.obj[a.prop], s = Object.keys(i), c = 0; c < s.length; ++c) {
var l = s[c], u = i[l];
"object" == typeof u && null !== u && -1 === r.indexOf(u) && (t.push({
obj: i,
prop: l
}), r.push(u));
}
return function(e) {
for (;e.length > 1; ) {
var t = e.pop(), r = t.obj[t.prop];
if (o(r)) {
for (var n = [], a = 0; a < r.length; ++a) void 0 !== r[a] && n.push(r[a]);
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
encode: function(t, r, o, n, a) {
if (0 === t.length) return t;
var i = t;
if ("symbol" == typeof t ? i = Symbol.prototype.toString.call(t) : "string" != typeof t && (i = String(t)), 
"iso-8859-1" === o) return escape(i).replace(/%u[0-9a-f]{4}/gi, function(e) {
return "%26%23" + parseInt(e.slice(2), 16) + "%3B";
});
for (var s = "", c = 0; c < i.length; c += m) {
for (var u = i.length >= m ? i.slice(c, c + m) : i, p = [], f = 0; f < u.length; ++f) {
var d = u.charCodeAt(f);
45 === d || 46 === d || 95 === d || 126 === d || d >= 48 && d <= 57 || d >= 65 && d <= 90 || d >= 97 && d <= 122 || a === e.RFC1738 && (40 === d || 41 === d) ? p[p.length] = u.charAt(f) : d < 128 ? p[p.length] = l[d] : d < 2048 ? p[p.length] = l[192 | d >> 6] + l[128 | 63 & d] : d < 55296 || d >= 57344 ? p[p.length] = l[224 | d >> 12] + l[128 | d >> 6 & 63] + l[128 | 63 & d] : (f += 1, 
d = 65536 + ((1023 & d) << 10 | 1023 & u.charCodeAt(f)), p[p.length] = l[240 | d >> 18] + l[128 | d >> 12 & 63] + l[128 | d >> 6 & 63] + l[128 | 63 & d]);
}
s += p.join("");
}
return s;
},
isBuffer: function(e) {
return !(!e || "object" != typeof e || !(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e)));
},
isOverflow: i,
isRegExp: function(e) {
return "[object RegExp]" === Object.prototype.toString.call(e);
},
maybeMap: function(e, t) {
if (o(e)) {
for (var r = [], n = 0; n < e.length; n += 1) r.push(t(e[n]));
return r;
}
return t(e);
},
merge: function e(t, n, l) {
if (!n) return t;
if ("object" != typeof n && "function" != typeof n) {
if (o(t)) t.push(n); else {
if (!t || "object" != typeof t) return [ t, n ];
if (i(t)) {
var m = s(t) + 1;
t[m] = n, c(t, m);
} else (l && (l.plainObjects || l.allowPrototypes) || !r.call(Object.prototype, n)) && (t[n] = !0);
}
return t;
}
if (!t || "object" != typeof t) {
if (i(n)) {
for (var p = Object.keys(n), f = l && l.plainObjects ? {
__proto__: null,
0: t
} : {
0: t
}, d = 0; d < p.length; d++) f[parseInt(p[d], 10) + 1] = n[p[d]];
return a(f, s(n) + 1);
}
return [ t ].concat(n);
}
var y = t;
return o(t) && !o(n) && (y = u(t, l)), o(t) && o(n) ? (n.forEach(function(o, n) {
if (r.call(t, n)) {
var a = t[n];
a && "object" == typeof a && o && "object" == typeof o ? t[n] = e(a, o, l) : t.push(o);
} else t[n] = o;
}), t) : Object.keys(n).reduce(function(t, o) {
var a = n[o];
return r.call(t, o) ? t[o] = e(t[o], a, l) : t[o] = a, t;
}, y);
}
};
}

function tr() {
if (lt) return ct;
lt = 1;
var e = $t(), t = er(), r = Jt(), o = Object.prototype.hasOwnProperty, n = {
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
}, c = Date.prototype.toISOString, l = r.default, u = {
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
format: l,
formatter: r.formatters[l],
indices: !1,
serializeDate: function(e) {
return c.call(e);
},
skipNulls: !1,
strictNullHandling: !1
}, m = {}, p = function r(o, n, i, c, l, p, f, d, y, g, h, v, R, E, T, C, S, w) {
for (var b, O = o, _ = w, x = 0, U = !1; void 0 !== (_ = _.get(m)) && !U; ) {
var A = _.get(o);
if (x += 1, void 0 !== A) {
if (A === x) throw new RangeError("Cyclic object value");
U = !0;
}
void 0 === _.get(m) && (x = 0);
}
if ("function" == typeof g ? O = g(n, O) : O instanceof Date ? O = R(O) : "comma" === i && a(O) && (O = t.maybeMap(O, function(e) {
return e instanceof Date ? R(e) : e;
})), null === O) {
if (p) return y && !C ? y(n, u.encoder, S, "key", E) : n;
O = "";
}
if ("string" == typeof (b = O) || "number" == typeof b || "boolean" == typeof b || "symbol" == typeof b || "bigint" == typeof b || t.isBuffer(O)) return y ? [ T(C ? n : y(n, u.encoder, S, "key", E)) + "=" + T(y(O, u.encoder, S, "value", E)) ] : [ T(n) + "=" + T(String(O)) ];
var N, M = [];
if (void 0 === O) return M;
if ("comma" === i && a(O)) C && y && (O = t.maybeMap(O, y)), N = [ {
value: O.length > 0 ? O.join(",") || null : void 0
} ]; else if (a(g)) N = g; else {
var k = Object.keys(O);
N = h ? k.sort(h) : k;
}
var P = d ? String(n).replace(/\./g, "%2E") : String(n), I = c && a(O) && 1 === O.length ? P + "[]" : P;
if (l && a(O) && 0 === O.length) return I + "[]";
for (var G = 0; G < N.length; ++G) {
var L = N[G], D = "object" == typeof L && L && void 0 !== L.value ? L.value : O[L];
if (!f || null !== D) {
var F = v && d ? String(L).replace(/\./g, "%2E") : String(L), B = a(O) ? "function" == typeof i ? i(I, F) : I : I + (v ? "." + F : "[" + F + "]");
w.set(o, x);
var H = e();
H.set(m, w), s(M, r(D, B, i, c, l, p, f, d, "comma" === i && C && a(O) ? null : y, g, h, v, R, E, T, C, S, H));
}
}
return M;
};
return ct = function(t, i) {
var c, l = t, m = function(e) {
if (!e) return u;
if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
var t = e.charset || u.charset;
if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
var i = r.default;
if (void 0 !== e.format) {
if (!o.call(r.formatters, e.format)) throw new TypeError("Unknown format option provided.");
i = e.format;
}
var s, c = r.formatters[i], l = u.filter;
if (("function" == typeof e.filter || a(e.filter)) && (l = e.filter), s = e.arrayFormat in n ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : u.arrayFormat, 
"commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
var m = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || u.allowDots : !!e.allowDots;
return {
addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : u.addQueryPrefix,
allowDots: m,
allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : u.allowEmptyArrays,
arrayFormat: s,
charset: t,
charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : u.charsetSentinel,
commaRoundTrip: !!e.commaRoundTrip,
delimiter: void 0 === e.delimiter ? u.delimiter : e.delimiter,
encode: "boolean" == typeof e.encode ? e.encode : u.encode,
encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : u.encodeDotInKeys,
encoder: "function" == typeof e.encoder ? e.encoder : u.encoder,
encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : u.encodeValuesOnly,
filter: l,
format: i,
formatter: c,
serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : u.serializeDate,
skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : u.skipNulls,
sort: "function" == typeof e.sort ? e.sort : null,
strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : u.strictNullHandling
};
}(i);
"function" == typeof m.filter ? l = (0, m.filter)("", l) : a(m.filter) && (c = m.filter);
var f = [];
if ("object" != typeof l || null === l) return "";
var d = n[m.arrayFormat], y = "comma" === d && m.commaRoundTrip;
c || (c = Object.keys(l)), m.sort && c.sort(m.sort);
for (var g = e(), h = 0; h < c.length; ++h) {
var v = c[h], R = l[v];
m.skipNulls && null === R || s(f, p(R, v, d, y, m.allowEmptyArrays, m.strictNullHandling, m.skipNulls, m.encodeDotInKeys, m.encode ? m.encoder : null, m.filter, m.sort, m.allowDots, m.serializeDate, m.format, m.formatter, m.encodeValuesOnly, m.charset, g));
}
var E = f.join(m.delimiter), T = !0 === m.addQueryPrefix ? "?" : "";
return m.charsetSentinel && ("iso-8859-1" === m.charset ? T += "utf8=%26%2310003%3B&" : T += "utf8=%E2%9C%93&"), 
E.length > 0 ? T + E : "";
}, ct;
}

function rr() {
if (mt) return ut;
mt = 1;
var e = er(), t = Object.prototype.hasOwnProperty, r = Array.isArray, o = {
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
var s = function(e, r) {
var o = r.allowDots ? e.replace(/\.([^.[]+)/g, "[$1]") : e;
if (r.depth <= 0) {
if (!r.plainObjects && t.call(Object.prototype, o) && !r.allowPrototypes) return;
return [ o ];
}
var n = /(\[[^[\]]*])/g, a = /(\[[^[\]]*])/.exec(o), i = a ? o.slice(0, a.index) : o, s = [];
if (i) {
if (!r.plainObjects && t.call(Object.prototype, i) && !r.allowPrototypes) return;
s.push(i);
}
for (var c = 0; null !== (a = n.exec(o)) && c < r.depth; ) {
c += 1;
var l = a[1].slice(1, -1);
if (!r.plainObjects && t.call(Object.prototype, l) && !r.allowPrototypes) return;
s.push(a[1]);
}
if (a) {
if (!0 === r.strictDepth) throw new RangeError("Input depth exceeded depth option of " + r.depth + " and strictDepth is true");
s.push("[" + o.slice(a.index) + "]");
}
return s;
}(r, n);
if (s) return function(t, r, o, n) {
var i = 0;
if (t.length > 0 && "[]" === t[t.length - 1]) {
var s = t.slice(0, -1).join("");
i = Array.isArray(r) && r[s] ? r[s].length : 0;
}
for (var c = n ? r : a(r, o, i), l = t.length - 1; l >= 0; --l) {
var u, m = t[l];
if ("[]" === m && o.parseArrays) u = e.isOverflow(c) ? c : o.allowEmptyArrays && ("" === c || o.strictNullHandling && null === c) ? [] : e.combine([], c, o.arrayLimit, o.plainObjects); else {
u = o.plainObjects ? {
__proto__: null
} : {};
var p = "[" === m.charAt(0) && "]" === m.charAt(m.length - 1) ? m.slice(1, -1) : m, f = o.decodeDotInKeys ? p.replace(/%2E/g, ".") : p, d = parseInt(f, 10);
o.parseArrays || "" !== f ? !isNaN(d) && m !== f && String(d) === f && d >= 0 && o.parseArrays && d <= o.arrayLimit ? (u = [])[d] = c : "__proto__" !== f && (u[f] = c) : u = {
0: c
};
}
c = u;
}
return c;
}(s, o, n, i);
}
};
return ut = function(s, c) {
var l = function(t) {
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
if ("" === s || null == s) return l.plainObjects ? {
__proto__: null
} : {};
for (var u = "string" == typeof s ? function(i, s) {
var c = {
__proto__: null
}, l = s.ignoreQueryPrefix ? i.replace(/^\?/, "") : i;
l = l.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
var u = s.parameterLimit === 1 / 0 ? void 0 : s.parameterLimit, m = l.split(s.delimiter, s.throwOnLimitExceeded ? u + 1 : u);
if (s.throwOnLimitExceeded && m.length > u) throw new RangeError("Parameter limit exceeded. Only " + u + " parameter" + (1 === u ? "" : "s") + " allowed.");
var p, f = -1, d = s.charset;
if (s.charsetSentinel) for (p = 0; p < m.length; ++p) 0 === m[p].indexOf("utf8=") && ("utf8=%E2%9C%93" === m[p] ? d = "utf-8" : "utf8=%26%2310003%3B" === m[p] && (d = "iso-8859-1"), 
f = p, p = m.length);
for (p = 0; p < m.length; ++p) if (p !== f) {
var y, g, h = m[p], v = h.indexOf("]="), R = -1 === v ? h.indexOf("=") : v + 1;
if (-1 === R ? (y = s.decoder(h, o.decoder, d, "key"), g = s.strictNullHandling ? null : "") : null !== (y = s.decoder(h.slice(0, R), o.decoder, d, "key")) && (g = e.maybeMap(a(h.slice(R + 1), s, r(c[y]) ? c[y].length : 0), function(e) {
return s.decoder(e, o.decoder, d, "value");
})), g && s.interpretNumericEntities && "iso-8859-1" === d && (g = n(String(g))), 
h.indexOf("[]=") > -1 && (g = r(g) ? [ g ] : g), null !== y) {
var E = t.call(c, y);
E && "combine" === s.duplicates ? c[y] = e.combine(c[y], g, s.arrayLimit, s.plainObjects) : E && "last" !== s.duplicates || (c[y] = g);
}
}
return c;
}(s, l) : s, m = l.plainObjects ? {
__proto__: null
} : {}, p = Object.keys(u), f = 0; f < p.length; ++f) {
var d = p[f], y = i(d, u[d], l, "string" == typeof s);
m = e.merge(m, y, l);
}
return !0 === l.allowSparse ? m : e.compact(m);
};
}

function or() {
if (ft) return pt;
ft = 1;
var e = tr(), t = rr();
return pt = {
formats: Jt(),
parse: t,
stringify: e
};
}

function nr() {
return gt || (gt = 1, yt = "function" == typeof URL ? URL : function() {
if (dt) return U;
dt = 1;
var e = M();
function t() {
this.protocol = null, this.slashes = null, this.auth = null, this.host = null, this.port = null, 
this.hostname = null, this.hash = null, this.search = null, this.query = null, this.pathname = null, 
this.path = null, this.href = null;
}
var r = /^([a-z0-9.+-]+:)/i, o = /:[0-9]*$/, n = /^(\/\/?(?!\/)[^?\s]*)(\?[^\s]*)?$/, a = [ "{", "}", "|", "\\", "^", "`" ].concat([ "<", ">", '"', "`", " ", "\r", "\n", "\t" ]), i = [ "'" ].concat(a), s = [ "%", "/", "?", ";", "#" ].concat(i), c = [ "/", "?", "#" ], l = /^[+a-z0-9A-Z_-]{0,63}$/, u = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, m = {
javascript: !0,
"javascript:": !0
}, p = {
javascript: !0,
"javascript:": !0
}, f = {
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
}, d = or();
function y(e, r, o) {
if (e && "object" == typeof e && e instanceof t) return e;
var n = new t;
return n.parse(e, r, o), n;
}
return t.prototype.parse = function(t, o, a) {
if ("string" != typeof t) throw new TypeError("Parameter 'url' must be a string, not " + typeof t);
var y = t.indexOf("?"), g = -1 !== y && y < t.indexOf("#") ? "?" : "#", h = t.split(g);
h[0] = h[0].replace(/\\/g, "/");
var v = t = h.join(g);
if (v = v.trim(), !a && 1 === t.split("#").length) {
var R = n.exec(v);
if (R) return this.path = v, this.href = v, this.pathname = R[1], R[2] ? (this.search = R[2], 
this.query = o ? d.parse(this.search.substr(1)) : this.search.substr(1)) : o && (this.search = "", 
this.query = {}), this;
}
var E = r.exec(v);
if (E) {
var T = (E = E[0]).toLowerCase();
this.protocol = T, v = v.substr(E.length);
}
if (a || E || v.match(/^\/\/[^@/]+@[^@/]+/)) {
var C = "//" === v.substr(0, 2);
!C || E && p[E] || (v = v.substr(2), this.slashes = !0);
}
if (!p[E] && (C || E && !f[E])) {
for (var S, w, b = -1, O = 0; O < c.length; O++) -1 !== (_ = v.indexOf(c[O])) && (-1 === b || _ < b) && (b = _);
for (-1 !== (w = -1 === b ? v.lastIndexOf("@") : v.lastIndexOf("@", b)) && (S = v.slice(0, w), 
v = v.slice(w + 1), this.auth = decodeURIComponent(S)), b = -1, O = 0; O < s.length; O++) {
var _;
-1 !== (_ = v.indexOf(s[O])) && (-1 === b || _ < b) && (b = _);
}
-1 === b && (b = v.length), this.host = v.slice(0, b), v = v.slice(b), this.parseHost(), 
this.hostname = this.hostname || "";
var x = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];
if (!x) for (var U = this.hostname.split(/\./), A = (O = 0, U.length); O < A; O++) {
var N = U[O];
if (N && !N.match(l)) {
for (var M = "", k = 0, P = N.length; k < P; k++) N.charCodeAt(k) > 127 ? M += "x" : M += N[k];
if (!M.match(l)) {
var I = U.slice(0, O), G = U.slice(O + 1), L = N.match(u);
L && (I.push(L[1]), G.unshift(L[2])), G.length && (v = "/" + G.join(".") + v), this.hostname = I.join(".");
break;
}
}
}
this.hostname.length > 255 ? this.hostname = "" : this.hostname = this.hostname.toLowerCase(), 
x || (this.hostname = e.toASCII(this.hostname));
var D = this.port ? ":" + this.port : "", F = this.hostname || "";
this.host = F + D, this.href += this.host, x && (this.hostname = this.hostname.substr(1, this.hostname.length - 2), 
"/" !== v[0] && (v = "/" + v));
}
if (!m[T]) for (O = 0, A = i.length; O < A; O++) {
var B = i[O];
if (-1 !== v.indexOf(B)) {
var H = encodeURIComponent(B);
H === B && (H = escape(B)), v = v.split(B).join(H);
}
}
var W = v.indexOf("#");
-1 !== W && (this.hash = v.substr(W), v = v.slice(0, W));
var Y = v.indexOf("?");
if (-1 !== Y ? (this.search = v.substr(Y), this.query = v.substr(Y + 1), o && (this.query = d.parse(this.query)), 
v = v.slice(0, Y)) : o && (this.search = "", this.query = {}), v && (this.pathname = v), 
f[T] && this.hostname && !this.pathname && (this.pathname = "/"), this.pathname || this.search) {
D = this.pathname || "";
var K = this.search || "";
this.path = D + K;
}
return this.href = this.format(), this;
}, t.prototype.format = function() {
var e = this.auth || "";
e && (e = (e = encodeURIComponent(e)).replace(/%3A/i, ":"), e += "@");
var t = this.protocol || "", r = this.pathname || "", o = this.hash || "", n = !1, a = "";
this.host ? n = e + this.host : this.hostname && (n = e + (-1 === this.hostname.indexOf(":") ? this.hostname : "[" + this.hostname + "]"), 
this.port && (n += ":" + this.port)), this.query && "object" == typeof this.query && Object.keys(this.query).length && (a = d.stringify(this.query, {
arrayFormat: "repeat",
addQueryPrefix: !1
}));
var i = this.search || a && "?" + a || "";
return t && ":" !== t.substr(-1) && (t += ":"), this.slashes || (!t || f[t]) && !1 !== n ? (n = "//" + (n || ""), 
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
var l = s[c];
"protocol" !== l && (o[l] = e[l]);
}
return f[o.protocol] && o.hostname && !o.pathname && (o.pathname = "/", o.path = o.pathname), 
o.href = o.format(), o;
}
if (e.protocol && e.protocol !== o.protocol) {
if (!f[e.protocol]) {
for (var u = Object.keys(e), m = 0; m < u.length; m++) {
var d = u[m];
o[d] = e[d];
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
var g = o.pathname || "", h = o.search || "";
o.path = g + h;
}
return o.slashes = o.slashes || e.slashes, o.href = o.format(), o;
}
var v = o.pathname && "/" === o.pathname.charAt(0), R = e.host || e.pathname && "/" === e.pathname.charAt(0), E = R || v || o.host && e.pathname, T = E, C = o.pathname && o.pathname.split("/") || [], S = (y = e.pathname && e.pathname.split("/") || [], 
o.protocol && !f[o.protocol]);
if (S && (o.hostname = "", o.port = null, o.host && ("" === C[0] ? C[0] = o.host : C.unshift(o.host)), 
o.host = "", e.protocol && (e.hostname = null, e.port = null, e.host && ("" === y[0] ? y[0] = e.host : y.unshift(e.host)), 
e.host = null), E = E && ("" === y[0] || "" === C[0])), R) o.host = e.host || "" === e.host ? e.host : o.host, 
o.hostname = e.hostname || "" === e.hostname ? e.hostname : o.hostname, o.search = e.search, 
o.query = e.query, C = y; else if (y.length) C || (C = []), C.pop(), C = C.concat(y), 
o.search = e.search, o.query = e.query; else if (null != e.search) return S && (o.host = C.shift(), 
o.hostname = o.host, (x = !!(o.host && o.host.indexOf("@") > 0) && o.host.split("@")) && (o.auth = x.shift(), 
o.hostname = x.shift(), o.host = o.hostname)), o.search = e.search, o.query = e.query, 
null === o.pathname && null === o.search || (o.path = (o.pathname ? o.pathname : "") + (o.search ? o.search : "")), 
o.href = o.format(), o;
if (!C.length) return o.pathname = null, o.search ? o.path = "/" + o.search : o.path = null, 
o.href = o.format(), o;
for (var w = C.slice(-1)[0], b = (o.host || e.host || C.length > 1) && ("." === w || ".." === w) || "" === w, O = 0, _ = C.length; _ >= 0; _--) "." === (w = C[_]) ? C.splice(_, 1) : ".." === w ? (C.splice(_, 1), 
O++) : O && (C.splice(_, 1), O--);
if (!E && !T) for (;O--; O) C.unshift("..");
!E || "" === C[0] || C[0] && "/" === C[0].charAt(0) || C.unshift(""), b && "/" !== C.join("/").substr(-1) && C.push("");
var x, U = "" === C[0] || C[0] && "/" === C[0].charAt(0);
return S && (o.hostname = U ? "" : C.length ? C.shift() : "", o.host = o.hostname, 
(x = !!(o.host && o.host.indexOf("@") > 0) && o.host.split("@")) && (o.auth = x.shift(), 
o.hostname = x.shift(), o.host = o.hostname)), (E = E || o.host && C.length) && !U && C.unshift(""), 
C.length > 0 ? o.pathname = C.join("/") : (o.pathname = null, o.path = null), null === o.pathname && null === o.search || (o.path = (o.pathname ? o.pathname : "") + (o.search ? o.search : "")), 
o.auth = e.auth || o.auth, o.slashes = o.slashes || e.slashes, o.href = o.format(), 
o;
}, t.prototype.parseHost = function() {
var e = this.host, t = o.exec(e);
t && (":" !== (t = t[0]) && (this.port = t.substr(1)), e = e.substr(0, e.length - t.length)), 
e && (this.hostname = e);
}, U.parse = y, U.resolve = function(e, t) {
return y(e, !1, !0).resolve(t);
}, U.resolveObject = function(e, t) {
return e ? y(e, !1, !0).resolveObject(t) : t;
}, U.format = function(e) {
return "string" == typeof e && (e = y(e)), e instanceof t ? e.format() : t.prototype.format.call(e);
}, U.Url = t, U;
}().URL), yt;
}

function ar() {
if (ht) return x;
ht = 1;
const e = nr();
x.getArg = function(e, t, r) {
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
x.toSetString = t ? r : function(e) {
return o(e) ? "$" + e : e;
}, x.fromSetString = t ? r : function(e) {
return o(e) ? e.slice(1) : e;
}, x.compareByGeneratedPositionsInflated = function(e, t) {
let r = e.generatedLine - t.generatedLine;
return 0 !== r ? r : (r = e.generatedColumn - t.generatedColumn, 0 !== r ? r : (r = n(e.source, t.source), 
0 !== r ? r : (r = e.originalLine - t.originalLine, 0 !== r ? r : (r = e.originalColumn - t.originalColumn, 
0 !== r ? r : n(e.name, t.name)))));
}, x.parseSourceMapInput = function(e) {
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
}), f = i(t => {
t.href = new e(".", t.toString()).toString();
}), d = i(e => {});
function y(e, t) {
const r = u(t), o = u(e);
if (e = p(e), "absolute" === r) return s(t, void 0);
if ("absolute" === o) return s(t, e);
if ("scheme-relative" === r) return d(t);
if ("scheme-relative" === o) return s(t, s(e, a)).slice(5);
if ("path-absolute" === r) return d(t);
if ("path-absolute" === o) return s(t, s(e, a)).slice(11);
const n = c(t + e);
return m(n, s(t, s(e, n)));
}
return x.normalize = d, x.join = y, x.relative = function(t, r) {
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
return "string" == typeof o ? o : d(r);
}, x.computeSourceURL = function(e, t, r) {
e && "path-absolute" === u(t) && (t = t.replace(/^\//, ""));
let o = d(t || "");
return e && (o = y(e, o)), r && (o = y(f(r), o)), o;
}, x;
}

var ir, sr = {};

function cr() {
if (ir) return sr;
ir = 1;
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
return sr.ArraySet = e, sr;
}

var lr, ur, mr = {};

function pr() {
if (ur) return E;
ur = 1;
const e = w(), t = ar(), r = cr().ArraySet, o = function() {
if (lr) return mr;
lr = 1;
const e = ar();
return mr.MappingList = class {
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
}, mr;
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
const f = this._mappings.toArray();
for (let d = 0, y = f.length; d < y; d++) {
if (o = f[d], r = "", o.generatedLine !== s) for (i = 0; o.generatedLine !== s; ) r += ";", 
s++; else if (d > 0) {
if (!t.compareByGeneratedPositionsInflated(o, f[d - 1])) continue;
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
return n.prototype._version = 3, E.SourceMapGenerator = n, E;
}

var fr, dr = {}, yr = {};

function gr() {
return fr || (fr = 1, function(e) {
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
}(yr)), yr;
}

var hr, vr, Rr, Er, Tr = {
exports: {}
};

function Cr() {
if (hr) return Tr.exports;
hr = 1;
let e = null;
return Tr.exports = function() {
if ("string" == typeof e) return fetch(e).then(e => e.arrayBuffer());
if (e instanceof ArrayBuffer) return Promise.resolve(e);
throw new Error("You must provide the string URL or ArrayBuffer contents of lib/mappings.wasm by calling SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) before using SourceMapConsumer");
}, Tr.exports.initialize = t => {
e = t;
}, Tr.exports;
}

function Sr() {
if (Rr) return vr;
Rr = 1;
const e = Cr();
function t() {
this.generatedLine = 0, this.generatedColumn = 0, this.lastGeneratedColumn = null, 
this.source = null, this.originalLine = null, this.originalColumn = null, this.name = null;
}
let r = null;
return vr = function() {
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

var wr, br, Or, _r = {}, xr = (br || (br = 1, R.SourceMapGenerator = pr().SourceMapGenerator, 
R.SourceMapConsumer = function() {
if (Er) return dr;
Er = 1;
const e = ar(), t = gr(), r = cr().ArraySet;
w();
const o = Cr(), n = Sr(), a = Symbol("smcInternal");
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
i.LEAST_UPPER_BOUND = 2, dr.SourceMapConsumer = i;
class s extends i {
constructor(t, o) {
return super(a).then(a => {
let i = t;
"string" == typeof t && (i = e.parseSourceMapInput(t));
const s = e.getArg(i, "version"), c = e.getArg(i, "sources").map(String), l = e.getArg(i, "names", []), u = e.getArg(i, "sourceRoot", null), m = e.getArg(i, "sourcesContent", null), p = e.getArg(i, "mappings"), f = e.getArg(i, "file", null), d = e.getArg(i, "x_google_ignoreList", null);
if (s != a._version) throw new Error("Unsupported version: " + s);
return a._sourceLookupCache = new Map, a._names = r.fromArray(l.map(String), !0), 
a._sources = r.fromArray(c, !0), a._absoluteSources = r.fromArray(a._sources.toArray().map(function(t) {
return e.computeSourceURL(u, t, o);
}), !0), a.sourceRoot = u, a.sourcesContent = m, a._mappings = p, a._sourceMapURL = o, 
a.file = f, a.x_google_ignoreList = d, a._computedColumnSpans = !1, a._mappingsPtr = 0, 
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
s.prototype.consumer = i, dr.BasicSourceMapConsumer = s;
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
return dr.IndexedSourceMapConsumer = c, dr;
}().SourceMapConsumer, R.SourceNode = function() {
if (wr) return _r;
wr = 1;
const e = pr().SourceMapGenerator, t = ar(), r = /(\r?\n)/, o = "$$$isSourceNode$$$";
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
let u, m = 1, p = 0, f = null;
return o.eachMapping(function(e) {
if (null !== f) {
if (!(m < e.generatedLine)) {
u = s[c] || "";
const t = u.substr(0, e.generatedColumn - p);
return s[c] = u.substr(e.generatedColumn - p), p = e.generatedColumn, d(f, t), void (f = e);
}
d(f, l()), m++, p = 0;
}
for (;m < e.generatedLine; ) i.add(l()), m++;
p < e.generatedColumn && (u = s[c] || "", i.add(u.substr(0, e.generatedColumn)), 
s[c] = u.substr(e.generatedColumn), p = e.generatedColumn), f = e;
}, this), c < s.length && (f && d(f, l()), i.add(s.splice(c).join(""))), o.sources.forEach(function(e) {
const r = o.sourceContentFor(e);
null != r && (null != a && (e = t.join(a, e)), i.setSourceContent(e, r));
}), i;
function d(e, r) {
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
return _r.SourceNode = n, _r;
}().SourceNode), R);

!function(e) {
e[e.DEBUG = 0] = "DEBUG", e[e.INFO = 1] = "INFO", e[e.WARN = 2] = "WARN", e[e.ERROR = 3] = "ERROR", 
e[e.NONE = 4] = "NONE";
}(Or || (Or = {}));

var Ur = {
level: Or.INFO,
cpuLogging: !1,
enableBatching: !0,
maxBatchSize: 50
}, Ar = n({}, Ur), Nr = [];

function Mr(e) {
Ar.enableBatching ? (Nr.push(e), Nr.length >= Ar.maxBatchSize && kr()) : console.log(e);
}

function kr() {
0 !== Nr.length && (console.log(Nr.join("\n")), Nr = []);
}

var Pr = new Set([ "type", "level", "message", "tick", "subsystem", "room", "creep", "processId", "shard" ]);

function Ir(e, t, r, o) {
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
r.meta)) for (var a in r.meta) Pr.has(a) || (n[a] = r.meta[a]);
return JSON.stringify(n);
}

function Gr(e, t) {
Ar.level <= Or.DEBUG && Mr(Ir("DEBUG", e, t));
}

function Lr(e, t) {
Ar.level <= Or.INFO && Mr(Ir("INFO", e, t));
}

function Dr(e, t) {
Ar.level <= Or.WARN && Mr(Ir("WARN", e, t));
}

function Fr(e, t) {
Ar.level <= Or.ERROR && Mr(Ir("ERROR", e, t));
}

function Br(e, t, r) {
if (!Ar.cpuLogging) return t();
var o = Game.cpu.getUsed(), n = t(), a = Game.cpu.getUsed() - o;
return Gr("".concat(e, ": ").concat(a.toFixed(3), " CPU"), r), n;
}

var Hr = new Set([ "type", "key", "value", "tick", "unit", "subsystem", "room", "shard" ]);

function Wr(e, t, r, o) {
var n = {
type: "stat",
key: e,
value: t,
tick: "undefined" != typeof Game ? Game.time : 0,
shard: "undefined" != typeof Game && Game.shard ? Game.shard.name : "shard0"
};
if (r && (n.unit = r), o && (o.shard && (n.shard = o.shard), o.subsystem && (n.subsystem = o.subsystem), 
o.room && (n.room = o.room), o.meta)) for (var a in o.meta) Hr.has(a) || (n[a] = o.meta[a]);
Mr(JSON.stringify(n));
}

function Yr(e) {
return {
debug: function(t, r) {
Gr(t, "string" == typeof r ? {
subsystem: e,
room: r
} : n({
subsystem: e
}, r));
},
info: function(t, r) {
Lr(t, "string" == typeof r ? {
subsystem: e,
room: r
} : n({
subsystem: e
}, r));
},
warn: function(t, r) {
Dr(t, "string" == typeof r ? {
subsystem: e,
room: r
} : n({
subsystem: e
}, r));
},
error: function(t, r) {
Fr(t, "string" == typeof r ? {
subsystem: e,
room: r
} : n({
subsystem: e
}, r));
},
stat: function(t, r, o, a) {
Wr(t, r, o, "string" == typeof a ? {
subsystem: e,
room: a
} : n({
subsystem: e
}, a));
},
measureCpu: function(t, r, o) {
return Br(t, r, "string" == typeof o ? {
subsystem: e,
room: o
} : n({
subsystem: e
}, o));
}
};
}

var Kr, jr = {
debug: Gr,
info: Lr,
warn: Dr,
error: Fr,
stat: Wr,
measureCpu: Br,
configure: function(e) {
Ar = n(n({}, Ar), e);
},
getConfig: function() {
return n({}, Ar);
},
createLogger: Yr,
flush: kr
};

!function(e) {
e[e.CRITICAL = 100] = "CRITICAL", e[e.HIGH = 75] = "HIGH", e[e.NORMAL = 50] = "NORMAL", 
e[e.LOW = 25] = "LOW", e[e.BACKGROUND = 10] = "BACKGROUND";
}(Kr || (Kr = {}));

var Vr = {
"hostile.detected": Kr.CRITICAL,
"nuke.detected": Kr.CRITICAL,
"safemode.activated": Kr.CRITICAL,
"structure.destroyed": Kr.HIGH,
"hostile.cleared": Kr.HIGH,
"creep.died": Kr.HIGH,
"energy.critical": Kr.HIGH,
"spawn.emergency": Kr.HIGH,
"posture.change": Kr.HIGH,
"spawn.completed": Kr.NORMAL,
"rcl.upgrade": Kr.NORMAL,
"construction.complete": Kr.NORMAL,
"remote.lost": Kr.NORMAL,
"squad.formed": Kr.NORMAL,
"squad.dissolved": Kr.NORMAL,
"market.transaction": Kr.LOW,
"pheromone.update": Kr.LOW,
"cluster.update": Kr.LOW,
"expansion.candidate": Kr.LOW,
"powerbank.discovered": Kr.LOW,
"cpu.spike": Kr.BACKGROUND,
"bucket.modeChange": Kr.BACKGROUND
}, qr = {
maxEventsPerTick: 50,
maxQueueSize: 200,
lowBucketThreshold: 2e3,
criticalBucketThreshold: 1e3,
maxEventAge: 100,
enableLogging: !1,
statsLogInterval: 100,
enableCoalescing: !0
}, zr = function() {
function e(e) {
void 0 === e && (e = {}), this.handlers = new Map, this.eventQueue = [], this.handlerIdCounter = 0, 
this.stats = {
eventsEmitted: 0,
eventsProcessed: 0,
eventsDeferred: 0,
eventsDropped: 0,
handlersInvoked: 0,
eventsCoalesced: 0
}, this.tickEvents = new Map, this.config = n(n({}, qr), e);
}
return e.prototype.on = function(e, t, r) {
var o, n, a, i, s = this;
void 0 === r && (r = {});
var c = {
handler: t,
priority: null !== (o = r.priority) && void 0 !== o ? o : Kr.NORMAL,
minBucket: null !== (n = r.minBucket) && void 0 !== n ? n : 0,
once: null !== (a = r.once) && void 0 !== a && a,
id: "handler_".concat(++this.handlerIdCounter)
}, l = null !== (i = this.handlers.get(e)) && void 0 !== i ? i : [];
return l.push(c), l.sort(function(e, t) {
return t.priority - e.priority;
}), this.handlers.set(e, l), this.config.enableLogging && jr.debug('EventBus: Registered handler for "'.concat(e, '" (id: ').concat(c.id, ")"), {
subsystem: "EventBus"
}), function() {
return s.off(e, c.id);
};
}, e.prototype.once = function(e, t, r) {
return void 0 === r && (r = {}), this.on(e, t, n(n({}, r), {
once: !0
}));
}, e.prototype.off = function(e, t) {
var r = this.handlers.get(e);
if (r) {
var o = r.findIndex(function(e) {
return e.id === t;
});
-1 !== o && (r.splice(o, 1), this.config.enableLogging && jr.debug('EventBus: Unregistered handler "'.concat(t, '" from "').concat(e, '"'), {
subsystem: "EventBus"
}));
}
}, e.prototype.offAll = function(e) {
this.handlers.delete(e), this.config.enableLogging && jr.debug('EventBus: Removed all handlers for "'.concat(e, '"'), {
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
var o, a, i, s;
void 0 === r && (r = {});
var c = n(n({}, t), {
tick: Game.time
}), l = null !== (a = null !== (o = r.priority) && void 0 !== o ? o : Vr[e]) && void 0 !== a ? a : Kr.NORMAL, u = null !== (i = r.immediate) && void 0 !== i ? i : l >= Kr.CRITICAL, m = null === (s = r.allowCoalescing) || void 0 === s || s;
if (this.config.enableCoalescing && m && !u) {
var p = this.getCoalescingKey(e, c), f = this.tickEvents.get(p);
if (f) return f.count++, this.stats.eventsCoalesced++, void (this.config.enableLogging && jr.debug('EventBus: Coalesced "'.concat(e, '" (count: ').concat(f.count, ")"), {
subsystem: "EventBus"
}));
this.tickEvents.set(p, {
name: e,
payload: c,
priority: l,
count: 1
});
}
this.stats.eventsEmitted++, this.config.enableLogging && jr.debug('EventBus: Emitting "'.concat(e, '" (priority: ').concat(l, ", immediate: ").concat(String(u), ")"), {
subsystem: "EventBus"
});
var d = Game.cpu.bucket;
u || d >= this.config.lowBucketThreshold ? this.processEvent(e, c) : d >= this.config.criticalBucketThreshold ? this.queueEvent(e, c, l) : l >= Kr.CRITICAL ? this.processEvent(e, c) : (this.stats.eventsDropped++, 
this.config.enableLogging && jr.warn('EventBus: Dropped event "'.concat(e, '" due to critical bucket'), {
subsystem: "EventBus"
}));
}, e.prototype.processEvent = function(e, t) {
var r, o, n, a, s = this.handlers.get(e);
if (s && 0 !== s.length) {
var c = Game.cpu.bucket, l = [];
try {
for (var u = i(s), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (!(c < p.minBucket)) try {
p.handler(t), this.stats.handlersInvoked++, p.once && l.push(p.id);
} catch (t) {
var f = t instanceof Error ? t.message : String(t);
jr.error('EventBus: Handler error for "'.concat(e, '": ').concat(f), {
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
for (var d = i(l), y = d.next(); !y.done; y = d.next()) {
var g = y.value;
this.off(e, g);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
y && !y.done && (a = d.return) && a.call(d);
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
return e.event.priority < Kr.HIGH;
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
for (var o = i(this.handlers.values()), a = o.next(); !a.done; a = o.next()) r += a.value.length;
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
return n(n({}, this.stats), {
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
return n({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = n(n({}, this.config), e);
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
jr.debug("EventBus stats: ".concat(e.eventsEmitted, " emitted, ").concat(e.eventsProcessed, " processed, ") + "".concat(e.eventsDeferred, " deferred, ").concat(e.eventsDropped, " dropped, ") + "".concat(e.eventsCoalesced, " coalesced, ") + "".concat(e.queueSize, " queued, ").concat(e.handlerCount, " handlers"), {
subsystem: "EventBus"
});
}
}, e;
}(), Xr = new zr, Qr = {
ecoRoomLimit: .1,
warRoomLimit: .25,
overmindLimit: 1,
strictMode: !1
}, Zr = function() {
function e(e) {
void 0 === e && (e = {}), this.budgetViolations = new Map, this.config = n(n({}, Qr), e);
}
return e.prototype.checkBudget = function(e, t, r) {
var o, n = this.getBudgetLimit(t), a = r <= n;
if (!a) {
var i = (null !== (o = this.budgetViolations.get(e)) && void 0 !== o ? o : 0) + 1;
this.budgetViolations.set(e, i);
var s = ((r - n) / n * 100).toFixed(1);
this.config.strictMode ? jr.error("CPU budget violation: ".concat(e, " used ").concat(r.toFixed(3), " CPU (limit: ").concat(n, ", overage: ").concat(s, "%)"), {
subsystem: "CPUBudget"
}) : jr.warn("CPU budget exceeded: ".concat(e, " used ").concat(r.toFixed(3), " CPU (limit: ").concat(n, ", overage: ").concat(s, "%)"), {
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
return jr.error("Error in ".concat(e, ": ").concat(i), {
subsystem: "CPUBudget"
}), null;
}
}, e.prototype.executeRoomWithBudget = function(e, t, r) {
var o = t ? "warRoom" : "ecoRoom", n = Game.cpu.getUsed();
try {
r();
var a = Game.cpu.getUsed() - n;
!this.checkBudget(e, o, a) && this.config.strictMode && jr.warn("Skipping ".concat(e, " due to budget violation"), {
subsystem: "CPUBudget"
});
} catch (t) {
var i = t instanceof Error ? t.message : String(t);
jr.error("Error in room ".concat(e, ": ").concat(i), {
subsystem: "CPUBudget"
});
}
}, e.prototype.getViolationsSummary = function() {
return Array.from(this.budgetViolations.entries()).map(function(e) {
var t = s(e, 2);
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
return n({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = n(n({}, this.config), e);
}, e;
}();

new Zr;

var $r = -1;

function Jr() {
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
var e = Jr();
e.rehydrated || (this.rehydrateFromMemory(), e.rehydrated = !0);
}, e.prototype.rehydrateFromMemory = function() {
var e, t, r = Jr(), o = eo(), n = 0, a = 0;
try {
for (var c = i(Object.entries(o.data)), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value, 2), m = u[0], p = u[1];
void 0 !== p.ttl && p.ttl !== $r && Game.time - p.lastModified > p.ttl ? a++ : (r.entries.set(m, {
value: p.value,
lastModified: p.lastModified,
dirty: !1,
ttl: p.ttl
}), n++);
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
n > 0 && Game.time % 100 == 0 && jr.info("Rehydrated ".concat(n, " entries from Memory"), {
subsystem: "HeapCache",
meta: {
rehydratedCount: n,
expiredCount: a
}
});
}, e.prototype.get = function(e) {
var t = Jr(), r = t.entries.get(e);
if (r) return void 0 !== r.ttl && r.ttl !== $r && Game.time - r.lastModified > r.ttl ? void t.entries.delete(e) : r.value;
var o = eo(), n = o.data[e];
return n ? void 0 !== n.ttl && n.ttl !== $r && Game.time - n.lastModified > n.ttl ? void delete o.data[e] : (t.entries.set(e, {
value: n.value,
lastModified: n.lastModified,
dirty: !1,
ttl: n.ttl
}), n.value) : void 0;
}, e.prototype.set = function(e, t, r) {
Jr().entries.set(e, {
value: t,
lastModified: Game.time,
dirty: !0,
ttl: null != r ? r : 1e3
});
}, e.prototype.delete = function(e) {
Jr().entries.delete(e), delete eo().data[e];
}, e.prototype.has = function(e) {
return void 0 !== this.get(e);
}, e.prototype.clear = function() {
Jr().entries.clear(), eo().data = {};
}, e.prototype.persist = function(e) {
var t, r;
if (void 0 === e && (e = !1), !e && Game.time - this.lastPersistenceTick < 10) return 0;
var o = Jr(), n = eo(), a = 0;
try {
for (var c = i(o.entries), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value, 2), m = u[0], p = u[1];
p.dirty && (n.data[m] = {
value: p.value,
lastModified: p.lastModified,
ttl: p.ttl
}, p.dirty = !1, a++);
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
return n.lastSync = Game.time, this.lastPersistenceTick = Game.time, a;
}, e.prototype.getStats = function() {
var e, t, r = Jr(), o = eo(), n = 0;
try {
for (var a = i(r.entries.values()), s = a.next(); !s.done; s = a.next()) s.value.dirty && n++;
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = a.return) && t.call(a);
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
var e = Jr();
return Array.from(e.entries.keys());
}, e.prototype.values = function() {
var e = Jr();
return Array.from(e.entries.values()).map(function(e) {
return e.value;
});
}, e.prototype.cleanExpired = function() {
var e, t, r, o, n = Jr(), a = eo(), c = 0;
try {
for (var l = i(n.entries), u = l.next(); !u.done; u = l.next()) {
var m = s(u.value, 2), p = m[0], f = m[1];
void 0 !== f.ttl && f.ttl !== $r && Game.time - f.lastModified > f.ttl && (n.entries.delete(p), 
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
for (var d = i(Object.entries(a.data)), y = d.next(); !y.done; y = d.next()) {
var g = s(y.value, 2), h = (p = g[0], g[1]);
void 0 !== h.ttl && h.ttl !== $r && Game.time - h.lastModified > h.ttl && (delete a.data[p], 
c++);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
return c;
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
this._consumer = new xr.SourceMapConsumer(t), this._sourceMapAvailable = !0, ro.set(oo, !0, 1 / 0);
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
}();

!function(e) {
e[e.DEBUG = 0] = "DEBUG", e[e.INFO = 1] = "INFO", e[e.WARN = 2] = "WARN", e[e.ERROR = 3] = "ERROR", 
e[e.NONE = 4] = "NONE";
}(ao || (ao = {}));

var so = {
level: ao.INFO,
cpuLogging: !1,
enableBatching: !0,
maxBatchSize: 50
}, co = n({}, so), lo = [];

function uo(e) {
co = n(n({}, co), e);
}

function mo() {
return n({}, co);
}

function po(e) {
co.enableBatching ? (lo.push(e), lo.length >= co.maxBatchSize && fo()) : console.log(e);
}

function fo() {
0 !== lo.length && (console.log(lo.join("\n")), lo = []);
}

var yo = new Set([ "type", "level", "message", "tick", "subsystem", "room", "creep", "processId", "shard" ]);

function go(e, t, r, o) {
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
r.meta)) for (var a in r.meta) yo.has(a) || (n[a] = r.meta[a]);
return JSON.stringify(n);
}

function ho(e, t) {
co.level <= ao.DEBUG && po(go("DEBUG", e, t));
}

function vo(e, t) {
co.level <= ao.INFO && po(go("INFO", e, t));
}

function Ro(e, t) {
co.level <= ao.WARN && po(go("WARN", e, t));
}

function Eo(e, t) {
co.level <= ao.ERROR && po(go("ERROR", e, t));
}

function To(e, t, r) {
if (!co.cpuLogging) return t();
var o = Game.cpu.getUsed(), n = t(), a = Game.cpu.getUsed() - o;
return ho("".concat(e, ": ").concat(a.toFixed(3), " CPU"), r), n;
}

var Co = new Set([ "type", "key", "value", "tick", "unit", "subsystem", "room", "shard" ]);

function So(e, t, r, o) {
var n = {
type: "stat",
key: e,
value: t,
tick: "undefined" != typeof Game ? Game.time : 0,
shard: "undefined" != typeof Game && Game.shard ? Game.shard.name : "shard0"
};
if (r && (n.unit = r), o && (o.shard && (n.shard = o.shard), o.subsystem && (n.subsystem = o.subsystem), 
o.room && (n.room = o.room), o.meta)) for (var a in o.meta) Co.has(a) || (n[a] = o.meta[a]);
po(JSON.stringify(n));
}

function wo(e) {
return {
debug: function(t, r) {
ho(t, "string" == typeof r ? {
subsystem: e,
room: r
} : n({
subsystem: e
}, r));
},
info: function(t, r) {
vo(t, "string" == typeof r ? {
subsystem: e,
room: r
} : n({
subsystem: e
}, r));
},
warn: function(t, r) {
Ro(t, "string" == typeof r ? {
subsystem: e,
room: r
} : n({
subsystem: e
}, r));
},
error: function(t, r) {
Eo(t, "string" == typeof r ? {
subsystem: e,
room: r
} : n({
subsystem: e
}, r));
},
stat: function(t, r, o, a) {
So(t, r, o, "string" == typeof a ? {
subsystem: e,
room: a
} : n({
subsystem: e
}, a));
},
measureCpu: function(t, r, o) {
return To(t, r, "string" == typeof o ? {
subsystem: e,
room: o
} : n({
subsystem: e
}, o));
}
};
}

var bo = {
debug: ho,
info: vo,
warn: Ro,
error: Eo,
stat: So,
measureCpu: To,
configure: uo,
getConfig: mo,
createLogger: wo,
flush: fo
}, Oo = [], _o = function() {
function e() {
this.commands = new Map, this.initialized = !1, this.lazyLoadEnabled = !1, this.commandsRegistered = !1, 
this.commandsExposed = !1;
}
return e.prototype.register = function(e, t) {
var r;
this.commands.has(e.name) && bo.warn('Command "'.concat(e.name, '" is already registered, overwriting'), {
subsystem: "CommandRegistry"
}), this.commands.set(e.name, {
metadata: n(n({}, e), {
category: null !== (r = e.category) && void 0 !== r ? r : "General"
}),
handler: t
}), bo.debug('Registered command "'.concat(e.name, '"'), {
subsystem: "CommandRegistry"
});
}, e.prototype.unregister = function(e) {
var t = this.commands.delete(e);
return t && bo.debug('Unregistered command "'.concat(e, '"'), {
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
var c = new Map;
try {
for (var l = i(this.commands.values()), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = null !== (n = m.metadata.category) && void 0 !== n ? n : "General", f = null !== (a = c.get(p)) && void 0 !== a ? a : [];
f.push(m), c.set(p, f);
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
for (var d = i(c), y = d.next(); !y.done; y = d.next()) {
var g = s(y.value, 2), h = (p = g[0], g[1]);
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
y && !y.done && (o = d.return) && o.call(d);
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
return o.handler.apply(o, c([], s(t), !1));
} catch (t) {
var n = t instanceof Error ? t.message : String(t);
return bo.error('Error executing command "'.concat(e, '": ').concat(n), {
subsystem: "CommandRegistry"
}), "Error: ".concat(n);
}
}, e.prototype.generateHelp = function() {
var e, t, r, o, n, a, s, c = this.getCommandsByCategory(), l = [ "=== Available Console Commands ===", "" ], u = Array.from(c.keys()).sort(function(e, t) {
return "General" === e ? -1 : "General" === t ? 1 : e.localeCompare(t);
});
try {
for (var m = i(u), p = m.next(); !p.done; p = m.next()) {
var f = p.value, d = c.get(f);
if (d && 0 !== d.length) {
l.push("--- ".concat(f, " ---"));
try {
for (var y = (r = void 0, i(d)), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = null !== (s = h.metadata.usage) && void 0 !== s ? s : "".concat(h.metadata.name, "()");
if (l.push("  ".concat(v)), l.push("    ".concat(h.metadata.description)), h.metadata.examples && h.metadata.examples.length > 0) {
l.push("    Examples:");
try {
for (var R = (n = void 0, i(h.metadata.examples)), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
l.push("      ".concat(T));
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
var a = this.commands.get(e);
if (!a) return 'Command "'.concat(e, '" not found. Use help() to see available commands.');
var s = [ "=== ".concat(a.metadata.name, " ==="), "", "Description: ".concat(a.metadata.description), "Usage: ".concat(null !== (o = a.metadata.usage) && void 0 !== o ? o : "".concat(a.metadata.name, "()")), "Category: ".concat(null !== (n = a.metadata.category) && void 0 !== n ? n : "General") ];
if (a.metadata.examples && a.metadata.examples.length > 0) {
s.push(""), s.push("Examples:");
try {
for (var c = i(a.metadata.examples), l = c.next(); !l.done; l = c.next()) {
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
for (var n = i(this.commands), a = n.next(); !a.done; a = n.next()) {
var c = s(a.value, 2), l = c[0], u = c[1];
o[l] = u.handler;
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
this.commandsExposed = !0, bo.debug("Exposed ".concat(this.commands.size, " commands to global scope"), {
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
}), this.initialized = !0, bo.info("Command registry initialized", {
subsystem: "CommandRegistry"
}));
}, e.prototype.enableLazyLoading = function(e) {
this.lazyLoadEnabled = !0, this.registrationCallback = e, bo.info("Console commands lazy loading enabled", {
subsystem: "CommandRegistry"
});
}, e.prototype.triggerLazyLoad = function() {
!this.commandsRegistered && this.registrationCallback && (bo.debug("Lazy loading console commands on first access", {
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
}(), xo = new _o;

function Uo(e) {
return function(t, r, o) {
Oo.push({
metadata: e,
methodName: String(r),
target: t
});
};
}

function Ao(e) {
var t, r, o = Object.getPrototypeOf(e);
try {
for (var n = i(Oo), a = n.next(); !a.done; a = n.next()) {
var s = a.value;
if (No(s.target, o)) {
var c = e[s.methodName];
if ("function" == typeof c) {
var l = c.bind(e);
xo.register(s.metadata, l), bo.debug('Registered decorated command "'.concat(s.metadata.name, '"'), {
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

function No(e, t) {
return null !== t && (e === t || Object.getPrototypeOf(e) === t || e === Object.getPrototypeOf(t));
}

var Mo, ko, Po = function() {
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
for (var a = i(t), s = a.next(); !s.done; s = a.next()) n(s.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
e.lastUpdate = Game.time;
}, e.prototype.autoAssignRoles = function(e, t) {
var r, o, n, a, s, c, l, u, m, p;
if (t.length < 3) e.isValid = !1; else {
var f = new Map;
try {
for (var d = i(t), y = d.next(); !y.done; y = d.next()) {
var g = y.value, h = [];
try {
for (var v = (n = void 0, i(t)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
g.id !== E.id && g.pos.getRangeTo(E) <= 2 && h.push(E.id);
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
f.set(g.id, h);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
var T = t.map(function(e) {
var t, r;
return {
lab: e,
reach: null !== (r = null === (t = f.get(e.id)) || void 0 === t ? void 0 : t.length) && void 0 !== r ? r : 0
};
}).sort(function(e, t) {
return t.reach - e.reach;
});
if (T.length < 3 || (null !== (u = null === (l = T[0]) || void 0 === l ? void 0 : l.reach) && void 0 !== u ? u : 0) < 2) return e.isValid = !1, 
void jr.warn("Lab layout in ".concat(e.roomName, " is not optimal for reactions"), {
subsystem: "Labs"
});
var C = null === (m = T[0]) || void 0 === m ? void 0 : m.lab, S = null === (p = T[1]) || void 0 === p ? void 0 : p.lab;
if (C && S) {
try {
for (var w = i(e.labs), b = w.next(); !b.done; b = w.next()) {
var O = b.value;
if (O.labId === C.id) O.role = "input1", O.lastConfigured = Game.time; else if (O.labId === S.id) O.role = "input2", 
O.lastConfigured = Game.time; else {
var _ = C.pos.getRangeTo(Game.getObjectById(O.labId)) <= 2, x = S.pos.getRangeTo(Game.getObjectById(O.labId)) <= 2;
O.role = _ && x ? "output" : "boost", O.lastConfigured = Game.time;
}
}
} catch (e) {
s = {
error: e
};
} finally {
try {
b && !b.done && (c = w.return) && c.call(w);
} finally {
if (s) throw s.error;
}
}
e.isValid = !0, e.lastUpdate = Game.time, jr.info("Auto-assigned lab roles in ".concat(e.roomName, ": ") + "".concat(e.labs.filter(function(e) {
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
var n, a, s = this.configs.get(e);
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
for (var u = i(s.labs.filter(function(e) {
return "output" === e.role;
})), m = u.next(); !m.done; m = u.next()) m.value.resourceType = o;
} catch (e) {
n = {
error: e
};
} finally {
try {
m && !m.done && (a = u.return) && a.call(u);
} finally {
if (n) throw n.error;
}
}
return s.lastUpdate = Game.time, jr.info("Set active reaction in ".concat(e, ": ").concat(t, " + ").concat(r, " -> ").concat(o), {
subsystem: "Labs"
}), !0;
}, e.prototype.clearActiveReaction = function(e) {
var t, r, o = this.configs.get(e);
if (o) {
delete o.activeReaction;
try {
for (var n = i(o.labs), a = n.next(); !a.done; a = n.next()) delete a.value.resourceType;
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
var l = i.some(function(e) {
var t = Game.getObjectById(e.labId);
return t && s.pos.getRangeTo(t) <= 2 && c.pos.getRangeTo(t) <= 2;
});
e.isValid = l;
} else e.isValid = !1;
}
}
}, e.prototype.runReactions = function(e) {
var t, r, o = this.configs.get(e);
if (!o || !o.isValid || !o.activeReaction) return 0;
var n = this.getInputLabs(e), a = n.input1, s = n.input2;
if (!a || !s) return 0;
var c = this.getOutputLabs(e), l = 0;
try {
for (var u = i(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
0 === p.cooldown && p.runReaction(a, s) === OK && l++;
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
}, e.prototype.saveToMemory = function(e) {
var t = this.configs.get(e);
if (t) {
var r = Memory.rooms[e];
if (r) {
r.labConfig = t;
var o = "memory:room:".concat(e, ":labConfig");
ro.set(o, t, $r);
}
}
}, e.prototype.loadFromMemory = function(e) {
var t = "memory:room:".concat(e, ":labConfig"), r = ro.get(t);
if (!r) {
var o = Memory.rooms[e], n = null == o ? void 0 : o.labConfig;
n && (ro.set(t, n, $r), r = n);
}
r && this.configs.set(e, r);
}, e.prototype.getConfiguredRooms = function() {
return Array.from(this.configs.keys());
}, e.prototype.hasValidConfig = function(e) {
var t, r = this.configs.get(e);
return null !== (t = null == r ? void 0 : r.isValid) && void 0 !== t && t;
}, e;
}(), Io = new Po, Go = function() {
function e() {}
return e.prototype.getLabResourceNeeds = function(e) {
var t, r, o, n, a;
if (!Game.rooms[e]) return [];
var s = Io.getConfig(e);
if (!s || !s.isValid) return [];
var c, l = [], u = Io.getInputLabs(e), m = u.input1, p = u.input2;
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
var f = Io.getBoostLabs(e), d = function(e) {
var t = s.labs.find(function(t) {
return t.labId === e.id;
});
if (null == t ? void 0 : t.resourceType) {
var r = null !== (a = e.store[t.resourceType]) && void 0 !== a ? a : 0;
r < 1e3 && l.push({
labId: e.id,
resourceType: t.resourceType,
amount: 1500 - r,
priority: 8
});
}
};
try {
for (var y = i(f), g = y.next(); !g.done; g = y.next()) d(g.value);
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
var t, r, o, n, a, s;
if (!Game.rooms[e]) return [];
var c = Io.getConfig(e);
if (!c) return [];
var l = [], u = Io.getOutputLabs(e);
try {
for (var m = i(u), p = m.next(); !p.done; p = m.next()) {
var f = (T = p.value).mineralType;
if (f) {
var d = null !== (a = T.store[f]) && void 0 !== a ? a : 0, y = c.activeReaction && f !== c.activeReaction.output;
(d > 2e3 || y && d > 0) && l.push({
labId: T.id,
resourceType: f,
amount: d,
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
var g = Io.getInputLabs(e), h = [ g.input1, g.input2 ].filter(function(e) {
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
for (var R = i(h), E = R.next(); !E.done; E = R.next()) {
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
var r, o, n, a, s = Io.getConfig(e);
if (!s || !s.isValid) return !1;
var c = Io.getInputLabs(e), l = c.input1, u = c.input2;
if (!l || !u) return !1;
if ((null !== (n = l.store[t.input1]) && void 0 !== n ? n : 0) < 500) return !1;
if ((null !== (a = u.store[t.input2]) && void 0 !== a ? a : 0) < 500) return !1;
var m = Io.getOutputLabs(e);
if (0 === m.length) return !1;
try {
for (var p = i(m), f = p.next(); !f.done; f = p.next()) {
var d = f.value.store.getFreeCapacity();
if (null === d || d < 100) return !1;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
return !0;
}, e.prototype.clearReactions = function(e) {
Io.clearActiveReaction(e), jr.info("Cleared active reactions in ".concat(e), {
subsystem: "Labs"
});
}, e.prototype.setActiveReaction = function(e, t, r, o) {
var n = Io.setActiveReaction(e, t, r, o);
return n && jr.info("Set active reaction: ".concat(t, " + ").concat(r, " -> ").concat(o), {
subsystem: "Labs",
room: e
}), n;
}, e.prototype.runReactions = function(e) {
return Io.runReactions(e);
}, e.prototype.hasAvailableBoostLabs = function(e) {
return Io.getBoostLabs(e).length > 0;
}, e.prototype.prepareBoostLab = function(e, t) {
var r, o, n, a, s, c = Io.getConfig(e);
if (!c) return null;
var l = Io.getBoostLabs(e);
try {
for (var u = i(l), m = u.next(); !m.done; m = u.next()) if ((y = m.value).mineralType === t && (null !== (s = y.store[t]) && void 0 !== s ? s : 0) >= 30) return y.id;
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
for (var f = i(l), d = f.next(); !d.done; d = f.next()) {
var y, g = p(y = d.value);
if ("object" == typeof g) return g.value;
}
} catch (e) {
n = {
error: e
};
} finally {
try {
d && !d.done && (a = f.return) && a.call(f);
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
for (var s = i(n), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
this.handleUnboost(l, o) && a++;
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
for (var a = i(n), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = c.store.getFreeCapacity();
if (null !== l && l >= 50) {
if (!e.pos.isNearTo(c)) return e.moveTo(c), !1;
if (c.unboostCreep(e) === OK) return jr.info("Unboosted ".concat(e.name, ", recovered resources"), {
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
s && !s.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
return !1;
}, e.prototype.getLabTaskStatus = function(e) {
var t = Io.getConfig(e);
return t && t.isValid ? t.activeReaction ? "reacting" : this.getLabResourceNeeds(e).length > 0 ? "loading" : this.getLabOverflow(e).length > 0 ? "unloading" : "idle" : "idle";
}, e.prototype.initialize = function(e) {
Io.initialize(e), Io.loadFromMemory(e);
}, e.prototype.save = function(e) {
Io.saveToMemory(e);
}, e;
}(), Lo = new Go, Do = {
info: function() {},
warn: function() {},
error: function() {},
debug: function() {}
}, Fo = ((Mo = {})[RESOURCE_HYDROXIDE] = {
product: RESOURCE_HYDROXIDE,
input1: RESOURCE_HYDROGEN,
input2: RESOURCE_OXYGEN,
priority: 10
}, Mo[RESOURCE_ZYNTHIUM_KEANITE] = {
product: RESOURCE_ZYNTHIUM_KEANITE,
input1: RESOURCE_ZYNTHIUM,
input2: RESOURCE_KEANIUM,
priority: 10
}, Mo[RESOURCE_UTRIUM_LEMERGITE] = {
product: RESOURCE_UTRIUM_LEMERGITE,
input1: RESOURCE_UTRIUM,
input2: RESOURCE_LEMERGIUM,
priority: 10
}, Mo[RESOURCE_GHODIUM] = {
product: RESOURCE_GHODIUM,
input1: RESOURCE_ZYNTHIUM_KEANITE,
input2: RESOURCE_UTRIUM_LEMERGITE,
priority: 15
}, Mo[RESOURCE_UTRIUM_HYDRIDE] = {
product: RESOURCE_UTRIUM_HYDRIDE,
input1: RESOURCE_UTRIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, Mo[RESOURCE_UTRIUM_OXIDE] = {
product: RESOURCE_UTRIUM_OXIDE,
input1: RESOURCE_UTRIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, Mo[RESOURCE_KEANIUM_HYDRIDE] = {
product: RESOURCE_KEANIUM_HYDRIDE,
input1: RESOURCE_KEANIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, Mo[RESOURCE_KEANIUM_OXIDE] = {
product: RESOURCE_KEANIUM_OXIDE,
input1: RESOURCE_KEANIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, Mo[RESOURCE_LEMERGIUM_HYDRIDE] = {
product: RESOURCE_LEMERGIUM_HYDRIDE,
input1: RESOURCE_LEMERGIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, Mo[RESOURCE_LEMERGIUM_OXIDE] = {
product: RESOURCE_LEMERGIUM_OXIDE,
input1: RESOURCE_LEMERGIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, Mo[RESOURCE_ZYNTHIUM_HYDRIDE] = {
product: RESOURCE_ZYNTHIUM_HYDRIDE,
input1: RESOURCE_ZYNTHIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, Mo[RESOURCE_ZYNTHIUM_OXIDE] = {
product: RESOURCE_ZYNTHIUM_OXIDE,
input1: RESOURCE_ZYNTHIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, Mo[RESOURCE_GHODIUM_HYDRIDE] = {
product: RESOURCE_GHODIUM_HYDRIDE,
input1: RESOURCE_GHODIUM,
input2: RESOURCE_HYDROGEN,
priority: 20
}, Mo[RESOURCE_GHODIUM_OXIDE] = {
product: RESOURCE_GHODIUM_OXIDE,
input1: RESOURCE_GHODIUM,
input2: RESOURCE_OXYGEN,
priority: 20
}, Mo[RESOURCE_UTRIUM_ACID] = {
product: RESOURCE_UTRIUM_ACID,
input1: RESOURCE_UTRIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_UTRIUM_ALKALIDE] = {
product: RESOURCE_UTRIUM_ALKALIDE,
input1: RESOURCE_UTRIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_KEANIUM_ACID] = {
product: RESOURCE_KEANIUM_ACID,
input1: RESOURCE_KEANIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_KEANIUM_ALKALIDE] = {
product: RESOURCE_KEANIUM_ALKALIDE,
input1: RESOURCE_KEANIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_LEMERGIUM_ACID] = {
product: RESOURCE_LEMERGIUM_ACID,
input1: RESOURCE_LEMERGIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_LEMERGIUM_ALKALIDE] = {
product: RESOURCE_LEMERGIUM_ALKALIDE,
input1: RESOURCE_LEMERGIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_ZYNTHIUM_ACID] = {
product: RESOURCE_ZYNTHIUM_ACID,
input1: RESOURCE_ZYNTHIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_ZYNTHIUM_ALKALIDE] = {
product: RESOURCE_ZYNTHIUM_ALKALIDE,
input1: RESOURCE_ZYNTHIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_GHODIUM_ACID] = {
product: RESOURCE_GHODIUM_ACID,
input1: RESOURCE_GHODIUM_HYDRIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_GHODIUM_ALKALIDE] = {
product: RESOURCE_GHODIUM_ALKALIDE,
input1: RESOURCE_GHODIUM_OXIDE,
input2: RESOURCE_HYDROXIDE,
priority: 30
}, Mo[RESOURCE_CATALYZED_UTRIUM_ACID] = {
product: RESOURCE_CATALYZED_UTRIUM_ACID,
input1: RESOURCE_UTRIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo[RESOURCE_CATALYZED_UTRIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
input1: RESOURCE_UTRIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo[RESOURCE_CATALYZED_KEANIUM_ACID] = {
product: RESOURCE_CATALYZED_KEANIUM_ACID,
input1: RESOURCE_KEANIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
input1: RESOURCE_KEANIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo[RESOURCE_CATALYZED_LEMERGIUM_ACID] = {
product: RESOURCE_CATALYZED_LEMERGIUM_ACID,
input1: RESOURCE_LEMERGIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
input1: RESOURCE_LEMERGIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = {
product: RESOURCE_CATALYZED_ZYNTHIUM_ACID,
input1: RESOURCE_ZYNTHIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
input1: RESOURCE_ZYNTHIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo[RESOURCE_CATALYZED_GHODIUM_ACID] = {
product: RESOURCE_CATALYZED_GHODIUM_ACID,
input1: RESOURCE_GHODIUM_ACID,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = {
product: RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
input1: RESOURCE_GHODIUM_ALKALIDE,
input2: RESOURCE_CATALYST,
priority: 40
}, Mo), Bo = ((ko = {})[RESOURCE_CATALYZED_UTRIUM_ACID] = 3e3, ko[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 3e3, 
ko[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 3e3, ko[RESOURCE_CATALYZED_GHODIUM_ACID] = 3e3, 
ko[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 2e3, ko[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = 2e3, 
ko[RESOURCE_GHODIUM] = 5e3, ko[RESOURCE_HYDROXIDE] = 5e3, ko);

function Ho(e, t) {
var r, o, n, a = null !== (r = Bo[e]) && void 0 !== r ? r : 1e3, i = null !== (o = t.pheromones.war) && void 0 !== o ? o : 0, s = null !== (n = t.pheromones.siege) && void 0 !== n ? n : 0, c = Math.max(i, s), l = c > 50 ? 1 + c / 100 * .5 : 1;
return !("war" === t.posture || "siege" === t.posture || c > 50) || e !== RESOURCE_CATALYZED_UTRIUM_ACID && e !== RESOURCE_CATALYZED_KEANIUM_ALKALIDE && e !== RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE && e !== RESOURCE_CATALYZED_GHODIUM_ACID ? "war" !== t.posture && "siege" !== t.posture || e !== RESOURCE_CATALYZED_GHODIUM_ALKALIDE && e !== RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE ? a : .5 * a : a * Math.min(1.5 * l, 1.75);
}

function Wo(e) {
var t = [];
return t.push(RESOURCE_GHODIUM, RESOURCE_HYDROXIDE), "war" === e.posture || "siege" === e.posture || e.danger >= 2 ? t.push(RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, RESOURCE_CATALYZED_GHODIUM_ACID) : t.push(RESOURCE_CATALYZED_GHODIUM_ALKALIDE, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE), 
t;
}

var Yo = function() {
function e(e) {
var t;
void 0 === e && (e = {}), this.logger = null !== (t = e.logger) && void 0 !== t ? t : Do;
}
return e.prototype.getReaction = function(e) {
return Fo[e];
}, e.prototype.calculateReactionChain = function(e, t) {
return function(e, t) {
var r = [], o = new Set, n = function(e) {
var a, i, s;
if (o.has(e)) return !0;
o.add(e);
var c = Fo[e];
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
var r, o, n, a, c, l, u;
if (e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}).length < 3) return null;
var m = e.terminal;
if (!m) return null;
var p = Wo(t);
try {
for (var f = i(p), d = f.next(); !d.done; d = f.next()) {
var y = d.value;
if (Fo[y] && (null !== (u = m.store[y]) && void 0 !== u ? u : 0) < Ho(y, t)) {
var g = {};
try {
for (var h = (n = void 0, i(Object.entries(m.store))), v = h.next(); !v.done; v = h.next()) {
var R = s(v.value, 2), E = R[0], T = R[1];
g[E] = T;
}
} catch (e) {
n = {
error: e
};
} finally {
try {
v && !v.done && (a = h.return) && a.call(h);
} finally {
if (n) throw n.error;
}
}
var C = this.calculateReactionChain(y, g);
try {
for (var S = (c = void 0, i(C)), w = S.next(); !w.done; w = S.next()) {
var b = w.value;
if (this.hasResourcesForReaction(m, b, 1e3)) return b;
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
d && !d.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
return null;
}, e.prototype.scheduleCompoundProduction = function(e, t) {
var r, o, n, a, c, l, u, m, p, f = [];
try {
for (var d = i(e), y = d.next(); !y.done; y = d.next()) {
var g = y.value, h = g.terminal;
if (h) {
var v = Wo(t);
try {
for (var R = (n = void 0, i(v)), E = R.next(); !E.done; E = R.next()) {
var T = E.value, C = Fo[T];
if (C) {
var S = null !== (p = h.store[T]) && void 0 !== p ? p : 0, w = Ho(T, t), b = w - S;
if (b > 0) {
var O = b / w, _ = C.priority * (1 + Math.min(O, .5)), x = {};
try {
for (var U = (c = void 0, i(Object.entries(h.store))), A = U.next(); !A.done; A = U.next()) {
var N = s(A.value, 2), M = N[0], k = N[1];
x[M] = k;
}
} catch (e) {
c = {
error: e
};
} finally {
try {
A && !A.done && (l = U.return) && l.call(U);
} finally {
if (c) throw c.error;
}
}
var P = this.calculateReactionChain(T, x);
try {
for (var I = (u = void 0, i(P)), G = I.next(); !G.done; G = I.next()) {
var L = G.value;
if (this.hasResourcesForReaction(h, L, 1e3)) {
f.push({
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
G && !G.done && (m = I.return) && m.call(I);
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
y && !y.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
return f.sort(function(e, t) {
return t.priority - e.priority;
}), f;
}, e.prototype.executeReaction = function(e, t) {
var r, o, n = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (!(n.length < 3)) {
var a = n[0], s = n[1];
if (a && s) {
var c = n.slice(2);
(a.mineralType !== t.input1 || a.store[t.input1] < 500) && this.logger.debug("Lab ".concat(a.id, " needs ").concat(t.input1), {
subsystem: "Chemistry"
}), (s.mineralType !== t.input2 || s.store[t.input2] < 500) && this.logger.debug("Lab ".concat(s.id, " needs ").concat(t.input2), {
subsystem: "Chemistry"
});
try {
for (var l = i(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!(m.cooldown > 0)) {
var p = m.store.getFreeCapacity();
null !== p && p < 100 ? this.logger.debug("Lab ".concat(m.id, " is full, needs unloading"), {
subsystem: "Chemistry"
}) : m.runReaction(a, s) === OK && this.logger.debug("Produced ".concat(t.product, " in lab ").concat(m.id), {
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
}(), Ko = [ {
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

function jo(e) {
return Ko.find(function(t) {
return t.role === e;
});
}

var Vo, qo = function() {
function e() {}
return e.prototype.shouldBoost = function(e, t) {
var r, o = e.memory;
if (o.boosted) return !1;
var n = jo(o.role);
if (!n) return !1;
var a = !0 === (null !== (r = Memory.boostDefensePriority) && void 0 !== r ? r : {})[e.room.name] ? Math.max(1, n.minDanger - 1) : n.minDanger;
return !(t.danger < a || t.missingStructures.labs);
}, e.prototype.boostCreep = function(e, t) {
var r, o, n = e.memory, a = jo(n.role);
if (!a) return !1;
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
if (!r) return jr.debug("Lab not ready with ".concat(t, " for ").concat(e.name), {
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
if (o === OK) jr.info("Boosted ".concat(e.name, " with ").concat(t), {
subsystem: "Boost"
}); else if (o !== ERR_NOT_FOUND) return jr.error("Failed to boost ".concat(e.name, ": ").concat(function(e) {
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
for (var u = i(a.boosts), m = u.next(); !m.done; m = u.next()) {
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
return 0 === c.length && (n.boosted = !0, jr.info("".concat(e.name, " fully boosted (all ").concat(a.boosts.length, " boosts applied)"), {
subsystem: "Boost"
}), !0);
}, e.prototype.areBoostLabsReady = function(e, t) {
var r, o, n = jo(t);
if (!n) return !0;
var a = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}), s = function(e) {
if (!a.find(function(t) {
return t.mineralType === e && t.store[e] >= 30;
})) return {
value: !1
};
};
try {
for (var c = i(n.boosts), l = c.next(); !l.done; l = c.next()) {
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
var r, o, n = jo(t);
if (!n) return [];
var a = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
}), s = [], c = function(e) {
a.find(function(t) {
return t.mineralType === e && t.store[e] >= 30;
}) || s.push(e);
};
try {
for (var l = i(n.boosts), u = l.next(); !u.done; u = l.next()) c(u.value);
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
var r, o, n, a, s, c;
if (!(t.danger < 2)) {
var l = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
if (!(l.length < 3)) {
var u = l.slice(2), m = new Set, p = [ jo("soldier"), jo("ranger"), jo("healer"), jo("siegeUnit") ].filter(function(e) {
return void 0 !== e && t.danger >= e.minDanger;
});
try {
for (var f = i(p), d = f.next(); !d.done; d = f.next()) {
var y = d.value;
try {
for (var g = (n = void 0, i(y.boosts)), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
m.add(v);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (a = g.return) && a.call(g);
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
d && !d.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
var R = 0;
try {
for (var E = i(m), T = E.next(); !(T.done || (v = T.value, R >= u.length)); T = E.next()) {
var C = u[R];
(C.mineralType !== v || C.store[v] < 1e3) && jr.debug("Lab ".concat(C.id, " needs ").concat(v, " for boosting"), {
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
var r = jo(e);
return r ? {
mineral: 30 * t * r.boosts.length,
energy: 20 * t * r.boosts.length
} : {
mineral: 0,
energy: 0
};
}(e, t);
}, e.prototype.analyzeBoostROI = function(e, t, r, o) {
if (!jo(e)) return {
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
}(), zo = new qo;

!function(e) {
e[e.None = 0] = "None", e[e.Pheromones = 1] = "Pheromones", e[e.Paths = 2] = "Paths", 
e[e.Traffic = 4] = "Traffic", e[e.Defense = 8] = "Defense", e[e.Economy = 16] = "Economy", 
e[e.Construction = 32] = "Construction", e[e.Performance = 64] = "Performance";
}(Vo || (Vo = {}));

var Xo, Qo, Zo, $o, Jo = Yr("MemoryMonitor"), en = 2097152, tn = new (function() {
function e() {
this.lastCheckTick = 0, this.lastStatus = "normal";
}
return e.prototype.checkMemoryUsage = function() {
var e = RawMemory.get().length, t = e / en, r = "normal";
t >= .9 ? r = "critical" : t >= .8 && (r = "warning"), r !== this.lastStatus && ("critical" === r ? (Game.notify("CRITICAL: Memory at ".concat((100 * t).toFixed(1), "% (").concat(this.formatBytes(e), "/").concat(this.formatBytes(en), ")")), 
Jo.error("Memory usage critical", {
meta: {
used: e,
limit: en,
percentage: t
}
})) : "warning" === r ? Jo.warn("Memory usage warning", {
meta: {
used: e,
limit: en,
percentage: t
}
}) : Jo.info("Memory usage normal", {
meta: {
used: e,
limit: en,
percentage: t
}
}), this.lastStatus = r);
var o = this.getMemoryBreakdown();
return {
used: e,
limit: en,
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
Jo.info("Memory Usage", {
meta: {
used: this.formatBytes(t.used),
limit: this.formatBytes(t.limit),
percentage: "".concat((100 * t.percentage).toFixed(1), "%"),
status: t.status.toUpperCase()
}
}), Jo.info("Memory Breakdown", {
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
}()), rn = 1e4, on = function() {
function e() {}
return e.prototype.pruneAll = function() {
var e = RawMemory.get().length, t = {
deadCreeps: 0,
eventLogs: 0,
staleIntel: 0,
marketHistory: 0,
bytesSaved: 0
};
t.deadCreeps = this.pruneDeadCreeps(), t.eventLogs = this.pruneEventLogs(20), t.staleIntel = this.pruneStaleIntel(rn), 
t.marketHistory = this.pruneMarketHistory(5e3);
var r = RawMemory.get().length;
return t.bytesSaved = Math.max(0, e - r), t.bytesSaved > 0 && jr.info("Memory pruning complete", {
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
var a = 0, i = Game.time - rn;
for (var r in t.knownRooms) {
var s = t.knownRooms[r];
s.lastSeen < i && !s.isHighway && !s.hasPortal && a++;
}
a > 50 && e.push("".concat(a, " stale intel entries (older than ").concat(rn, " ticks)"));
}
var c = 0;
for (var l in Memory.creeps) l in Game.creeps || c++;
return c > 10 && e.push("".concat(c, " dead creeps in memory")), e;
}, e;
}(), nn = new on, an = {
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
}, sn = function() {
function e() {
this.activeSegments = new Set, this.segmentCache = new Map;
}
return e.prototype.requestSegment = function(e) {
if (e < 0 || e > 99) throw new Error("Invalid segment ID: ".concat(e, ". Must be 0-99."));
this.activeSegments.add(e);
var t = Array.from(this.activeSegments);
if (t.length > 10) throw jr.error("Cannot have more than 10 active segments", {
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
if (void 0 === o && (o = 1), !this.isSegmentLoaded(e)) return jr.warn("Attempted to write to unloaded segment", {
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
return s.length > 102400 ? (jr.error("Segment data exceeds 100KB limit", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e,
key: t,
size: s.length
}
}), !1) : (RawMemory.segments[e] = s, this.segmentCache.set(e, a), !0);
} catch (r) {
return jr.error("Failed to write segment data", {
subsystem: "MemorySegmentManager",
meta: {
segmentId: e,
key: t,
error: String(r)
}
}), !1;
}
}, e.prototype.readSegment = function(e, t) {
if (!this.isSegmentLoaded(e)) return jr.warn("Attempted to read from unloaded segment", {
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
return jr.error("Failed to read segment data", {
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
this.isSegmentLoaded(e) ? (RawMemory.segments[e] = "", this.segmentCache.delete(e)) : jr.warn("Attempted to clear unloaded segment", {
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
for (var t = an[e], r = t.start; r <= t.end; r++) if (!this.isSegmentLoaded(r) || this.getSegmentSize(r) < 92160) return r;
return t.start;
}, e.prototype.migrateToSegment = function(e, t, r) {
var o, n, a = e.split("."), s = Memory;
try {
for (var c = i(a), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (!s || "object" != typeof s || !(u in s)) return jr.warn("Memory path not found for migration", {
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
l && !l.done && (n = c.return) && n.call(c);
} finally {
if (o) throw o.error;
}
}
if (!this.isSegmentLoaded(t)) return this.requestSegment(t), jr.info("Segment not loaded, will migrate next tick", {
subsystem: "MemorySegmentManager",
meta: {
memoryPath: e,
segmentId: t,
key: r
}
}), !1;
var m = this.writeSegment(t, r, s);
return m && jr.info("Successfully migrated data to segment", {
subsystem: "MemorySegmentManager",
meta: {
memoryPath: e,
segmentId: t,
key: r,
dataSize: JSON.stringify(s).length
}
}), m;
}, e;
}(), cn = new sn, ln = {
exports: {}
}, un = (Xo || (Xo = 1, Qo = ln, Zo = function() {
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
var o, n, a, i = {}, s = {}, c = "", l = "", u = "", m = 2, p = 3, f = 2, d = [], y = 0, g = 0;
for (a = 0; a < e.length; a += 1) if (c = e.charAt(a), Object.prototype.hasOwnProperty.call(i, c) || (i[c] = p++, 
s[c] = !0), l = u + c, Object.prototype.hasOwnProperty.call(i, l)) u = l; else {
if (Object.prototype.hasOwnProperty.call(s, u)) {
if (u.charCodeAt(0) < 256) {
for (o = 0; o < f; o++) y <<= 1, g == t - 1 ? (g = 0, d.push(r(y)), y = 0) : g++;
for (n = u.charCodeAt(0), o = 0; o < 8; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
d.push(r(y)), y = 0) : g++, n >>= 1;
} else {
for (n = 1, o = 0; o < f; o++) y = y << 1 | n, g == t - 1 ? (g = 0, d.push(r(y)), 
y = 0) : g++, n = 0;
for (n = u.charCodeAt(0), o = 0; o < 16; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
d.push(r(y)), y = 0) : g++, n >>= 1;
}
0 == --m && (m = Math.pow(2, f), f++), delete s[u];
} else for (n = i[u], o = 0; o < f; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
d.push(r(y)), y = 0) : g++, n >>= 1;
0 == --m && (m = Math.pow(2, f), f++), i[l] = p++, u = String(c);
}
if ("" !== u) {
if (Object.prototype.hasOwnProperty.call(s, u)) {
if (u.charCodeAt(0) < 256) {
for (o = 0; o < f; o++) y <<= 1, g == t - 1 ? (g = 0, d.push(r(y)), y = 0) : g++;
for (n = u.charCodeAt(0), o = 0; o < 8; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
d.push(r(y)), y = 0) : g++, n >>= 1;
} else {
for (n = 1, o = 0; o < f; o++) y = y << 1 | n, g == t - 1 ? (g = 0, d.push(r(y)), 
y = 0) : g++, n = 0;
for (n = u.charCodeAt(0), o = 0; o < 16; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
d.push(r(y)), y = 0) : g++, n >>= 1;
}
0 == --m && (m = Math.pow(2, f), f++), delete s[u];
} else for (n = i[u], o = 0; o < f; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, 
d.push(r(y)), y = 0) : g++, n >>= 1;
0 == --m && (m = Math.pow(2, f), f++);
}
for (n = 2, o = 0; o < f; o++) y = y << 1 | 1 & n, g == t - 1 ? (g = 0, d.push(r(y)), 
y = 0) : g++, n >>= 1;
for (;;) {
if (y <<= 1, g == t - 1) {
d.push(r(y));
break;
}
g++;
}
return d.join("");
},
decompress: function(e) {
return null == e ? "" : "" == e ? null : a._decompress(e.length, 32768, function(t) {
return e.charCodeAt(t);
});
},
_decompress: function(t, r, o) {
var n, a, i, s, c, l, u, m = [], p = 4, f = 4, d = 3, y = "", g = [], h = {
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
for (i = 0, c = Math.pow(2, d), l = 1; l != c; ) s = h.val & h.position, h.position >>= 1, 
0 == h.position && (h.position = r, h.val = o(h.index++)), i |= (s > 0 ? 1 : 0) * l, 
l <<= 1;
switch (u = i) {
case 0:
for (i = 0, c = Math.pow(2, 8), l = 1; l != c; ) s = h.val & h.position, h.position >>= 1, 
0 == h.position && (h.position = r, h.val = o(h.index++)), i |= (s > 0 ? 1 : 0) * l, 
l <<= 1;
m[f++] = e(i), u = f - 1, p--;
break;

case 1:
for (i = 0, c = Math.pow(2, 16), l = 1; l != c; ) s = h.val & h.position, h.position >>= 1, 
0 == h.position && (h.position = r, h.val = o(h.index++)), i |= (s > 0 ? 1 : 0) * l, 
l <<= 1;
m[f++] = e(i), u = f - 1, p--;
break;

case 2:
return g.join("");
}
if (0 == p && (p = Math.pow(2, d), d++), m[u]) y = m[u]; else {
if (u !== f) return null;
y = a + a.charAt(0);
}
g.push(y), m[f++] = a + y.charAt(0), a = y, 0 == --p && (p = Math.pow(2, d), d++);
}
}
};
return a;
}(), null != Qo ? Qo.exports = Zo : "undefined" != typeof angular && null != angular && angular.module("LZString", []).factory("LZString", function() {
return Zo;
})), ln.exports), mn = function() {
function e() {}
return e.prototype.compress = function(e, t) {
void 0 === t && (t = 1);
var r = JSON.stringify(e), o = r.length, n = un.compressToUTF16(r);
return {
compressed: n,
originalSize: o,
compressedSize: n.length,
timestamp: Game.time,
version: t
};
}, e.prototype.decompress = function(e) {
try {
var t = "string" == typeof e ? e : e.compressed, r = un.decompressFromUTF16(t);
return r ? JSON.parse(r) : (jr.error("Decompression returned null", {
subsystem: "MemoryCompressor"
}), null);
} catch (e) {
return jr.error("Failed to decompress data", {
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
}(), pn = new mn, fn = [ {
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
var l = cn.suggestSegmentForType("HISTORICAL_INTEL");
if (!cn.isSegmentLoaded(l)) return cn.requestSegment(l), void jr.info("Segment not loaded, migration will continue next tick", {
subsystem: "MemoryMigrations",
meta: {
segmentId: l
}
});
if (!cn.writeSegment(l, "historicalIntel", a)) return void jr.error("Failed to write historical intel to segment", {
subsystem: "MemoryMigrations",
meta: {
segmentId: l
}
});
o.knownRooms = n, jr.info("Migrated historical intel to segments", {
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
if (o && !pn.isCompressed(o)) {
var n = pn.compressPortalMap(o);
r.compressedPortals = n, delete r.portals, jr.info("Compressed portal map data", {
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
var n = pn.compressMarketHistory(o), a = cn.suggestSegmentForType("MARKET_HISTORY");
if (!cn.isSegmentLoaded(a)) return cn.requestSegment(a), void jr.info("Segment not loaded, migration will continue next tick", {
subsystem: "MemoryMigrations",
meta: {
segmentId: a
}
});
cn.writeSegment(a, "priceHistory", n) ? (delete r.priceHistory, jr.info("Migrated market history to segments", {
subsystem: "MemoryMigrations",
meta: {
originalSize: n.originalSize,
compressedSize: n.compressedSize,
segmentId: a
}
})) : jr.error("Failed to write market history to segment", {
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
r > 0 && jr.info("Migrated ".concat(r, " cluster array properties"), {
subsystem: "MemoryMigrations",
meta: {
clustersProcessed: Object.keys(t).length
}
});
}
}
} ], dn = function() {
function e() {}
return e.prototype.runMigrations = function() {
var e, t, r, o = Memory, n = null !== (r = o.memoryVersion) && void 0 !== r ? r : 0, a = fn.filter(function(e) {
return e.version > n;
});
if (0 !== a.length) {
jr.info("Running ".concat(a.length, " memory migration(s)"), {
subsystem: "MigrationRunner",
meta: {
fromVersion: n,
toVersion: a[a.length - 1].version
}
});
try {
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
try {
jr.info("Running migration v".concat(l.version, ": ").concat(l.description), {
subsystem: "MigrationRunner"
}), l.migrate(Memory), o.memoryVersion = l.version, jr.info("Migration v".concat(l.version, " complete"), {
subsystem: "MigrationRunner"
});
} catch (e) {
jr.error("Migration v".concat(l.version, " failed"), {
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
return 0 === fn.length ? 0 : Math.max.apply(Math, c([], s(fn.map(function(e) {
return e.version;
})), !1));
}, e.prototype.hasPendingMigrations = function() {
return this.getCurrentVersion() < this.getLatestVersion();
}, e.prototype.getPendingMigrations = function() {
var e = this.getCurrentVersion();
return fn.filter(function(t) {
return t.version > e;
});
}, e.prototype.rollbackToVersion = function(e) {
var t = Memory;
jr.warn("Rolling back memory version to ".concat(e), {
subsystem: "MigrationRunner",
meta: {
fromVersion: this.getCurrentVersion(),
toVersion: e
}
}), t.memoryVersion = e, Game.notify("Memory version rolled back to ".concat(e, ". Data may be inconsistent!"));
}, e;
}(), yn = new dn, gn = "empire", hn = "clusters", vn = function() {
function e() {
this.lastInitializeTick = null, this.lastCleanupTick = 0, this.lastPruningTick = 0, 
this.lastMonitoringTick = 0;
}
return e.prototype.initialize = function() {
this.lastInitializeTick !== Game.time && (this.lastInitializeTick = Game.time, ro.initialize(), 
yn.runMigrations(), this.ensureEmpireMemory(), this.ensureClustersMemory(), Game.time - this.lastCleanupTick >= 10 && (this.cleanDeadCreeps(), 
this.lastCleanupTick = Game.time), Game.time - this.lastPruningTick >= 100 && (nn.pruneAll(), 
this.lastPruningTick = Game.time), Game.time - this.lastMonitoringTick >= 50 && (tn.checkMemoryUsage(), 
this.lastMonitoringTick = Game.time));
}, e.prototype.ensureEmpireMemory = function() {
var e = Memory;
e[gn] || (e[gn] = {
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
e[hn] || (e[hn] = {});
}, e.prototype.getEmpire = function() {
var e = "memory:".concat(gn), t = ro.get(e);
if (!t) {
this.ensureEmpireMemory();
var r = Memory;
ro.set(e, r[gn], $r), t = r[gn];
}
return t;
}, e.prototype.getClusters = function() {
var e = "memory:".concat(hn), t = ro.get(e);
if (!t) {
this.ensureClustersMemory();
var r = Memory;
ro.set(e, r[hn], $r), t = r[hn];
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
a && (ro.set(r, a, $r), o = a);
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
}), ro.set(t, r.swarm, $r), r.swarm;
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
}(), Rn = new vn, En = {
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
bodyCosts: ($o = {}, $o[MOVE] = 50, $o[WORK] = 100, $o[CARRY] = 50, $o[ATTACK] = 80, 
$o[RANGED_ATTACK] = 150, $o[HEAL] = 250, $o[CLAIM] = 600, $o[TOUGH] = 10, $o),
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
}, Tn = n({}, En);

function Cn() {
return Tn;
}

function Sn(e) {
Tn = n(n({}, Tn), e);
}

function wn(e) {
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
enableAdaptiveBudgets: !1,
enablePriorityDecay: !0,
priorityDecayRate: 1,
maxPriorityBoost: 50
};
}

var bn = null, On = new Proxy({}, {
get: function(t, r) {
return bn || (bn = new e.Kernel(wn(Cn().cpu))), bn[r];
},
set: function(t, r, o) {
return bn || (bn = new e.Kernel(wn(Cn().cpu))), bn[r] = o, !0;
}
}), _n = [], xn = new Set;

function Un(e) {
return function(t, r, o) {
_n.push({
options: e,
methodName: String(r),
target: t
});
};
}

function An(t, r, o) {
return Un(n({
id: t,
name: r,
priority: e.ProcessPriority.MEDIUM,
frequency: "medium",
minBucket: 0,
cpuBudget: .15,
interval: 5
}, o));
}

function Nn(t, r, o) {
return Un(n({
id: t,
name: r,
priority: e.ProcessPriority.LOW,
frequency: "low",
minBucket: 0,
cpuBudget: .1,
interval: 20
}, o));
}

function Mn(t, r, o) {
return Un(n({
id: t,
name: r,
priority: e.ProcessPriority.IDLE,
frequency: "low",
minBucket: 0,
cpuBudget: .05,
interval: 100
}, o));
}

function kn() {
return function(e) {
return xn.add(e), e;
};
}

function Pn(e) {
var t = Math.floor(.1 * e), r = Math.floor(Math.random() * (2 * t + 1)) - t;
return {
interval: Math.max(1, e + r),
jitter: r
};
}

function In(t) {
var r, o, n, a, s, c = Object.getPrototypeOf(t);
try {
for (var l = i(_n), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (m.target === c || Object.getPrototypeOf(m.target) === c || m.target === Object.getPrototypeOf(c)) {
var p = t[m.methodName];
if ("function" == typeof p) {
var f = p.bind(t), d = null !== (n = m.options.interval) && void 0 !== n ? n : 5, y = Pn(d), g = y.interval, h = y.jitter;
On.registerProcess({
id: m.options.id,
name: m.options.name,
priority: null !== (a = m.options.priority) && void 0 !== a ? a : e.ProcessPriority.MEDIUM,
frequency: null !== (s = m.options.frequency) && void 0 !== s ? s : "medium",
minBucket: m.options.minBucket,
cpuBudget: m.options.cpuBudget,
interval: g,
execute: f
}), bo.debug('Registered decorated process "'.concat(m.options.name, '" (').concat(m.options.id, ") with interval ").concat(g, " (base: ").concat(d, ", jitter: ").concat(h > 0 ? "+" : "").concat(h, ")"), {
subsystem: "ProcessDecorators"
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
u && !u.done && (o = l.return) && o.call(l);
} finally {
if (r) throw r.error;
}
}
}

var Gn = {
minGPL: 1,
minPowerReserve: 1e4,
energyPerPower: 50,
minEnergyReserve: 1e5,
gplMilestones: [ 1, 2, 5, 10, 15, 20 ]
}, Ln = [ PWR_GENERATE_OPS, PWR_OPERATE_SPAWN, PWR_OPERATE_EXTENSION, PWR_OPERATE_TOWER, PWR_OPERATE_LAB, PWR_OPERATE_STORAGE, PWR_REGEN_SOURCE, PWR_OPERATE_FACTORY ], Dn = [ PWR_GENERATE_OPS, PWR_OPERATE_SPAWN, PWR_SHIELD, PWR_DISRUPT_SPAWN, PWR_DISRUPT_TOWER, PWR_FORTIFY, PWR_OPERATE_TOWER, PWR_DISRUPT_TERMINAL ], Fn = function() {
function t(e) {
void 0 === e && (e = {}), this.assignments = new Map, this.gplState = null, this.lastGPLUpdate = 0, 
this.config = n(n({}, Gn), e);
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
}, this.lastGPLUpdate !== a && a > 0 && (jr.info("GPL milestone reached: Level ".concat(a), {
subsystem: "PowerCreep"
}), this.lastGPLUpdate = a);
} else this.gplState = null;
}, t.prototype.managePowerProcessing = function() {
var e, t, r = this.evaluatePowerProcessing();
try {
for (var o = i(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (a.shouldProcess) {
var s = Game.rooms[a.roomName];
if (s) {
var c = s.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0];
if (c) {
var l = c.store.getUsedCapacity(RESOURCE_POWER) > 0, u = c.store.getUsedCapacity(RESOURCE_ENERGY) >= 50;
l && u && c.processPower() === OK && jr.debug("Processing power in ".concat(a.roomName, ": ").concat(a.reason), {
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
var e, t, r, o, n, a = [], s = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
}).length > 0;
});
try {
for (var c = i(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.storage, p = u.terminal;
if (m || p) {
var f = (null !== (r = null == m ? void 0 : m.store.getUsedCapacity(RESOURCE_POWER)) && void 0 !== r ? r : 0) + (null !== (o = null == p ? void 0 : p.store.getUsedCapacity(RESOURCE_POWER)) && void 0 !== o ? o : 0), d = null !== (n = null == m ? void 0 : m.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== n ? n : 0, y = !1, g = "", h = 0;
f < 100 ? (y = !1, g = "Insufficient power (<100)") : d < this.config.minEnergyReserve ? (y = !1, 
g = "Insufficient energy (<".concat(this.config.minEnergyReserve, ")")) : this.gplState && this.gplState.currentLevel < this.gplState.targetMilestone ? (y = !0, 
g = "GPL progression: ".concat(this.gplState.currentLevel, " → ").concat(this.gplState.targetMilestone), 
h = 100 - Math.abs(this.gplState.currentLevel - this.gplState.targetMilestone)) : f > this.config.minPowerReserve ? (y = !0, 
g = "Excess power (".concat(f, " > ").concat(this.config.minPowerReserve, ")"), 
h = 50) : (y = !1, g = "Power reserved for power banks"), a.push({
roomName: u.name,
shouldProcess: y,
reason: g,
powerAvailable: f,
energyAvailable: d,
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
return a.sort(function(e, t) {
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
}, t.prototype.createAssignment = function(e) {
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
swarm: Rn.getSwarmState(e.name)
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
return u.homeRoom = a, u.role = o, jr.info("Power creep ".concat(e.name, " assigned as ").concat(o, " to ").concat(a), {
subsystem: "PowerCreep"
}), l;
}, t.prototype.generatePowerPath = function(e) {
var t = this, r = ("powerQueen" === e ? Ln : Dn).filter(function(e) {
var r, o, n = POWER_INFO[e];
return n && void 0 !== n.level && n.level[0] <= (null !== (o = null === (r = t.gplState) || void 0 === r ? void 0 : r.currentLevel) && void 0 !== o ? o : 0);
});
return r;
}, t.prototype.checkPowerUpgrades = function() {
var e, t;
if (this.gplState) try {
for (var r = i(this.assignments), o = r.next(); !o.done; o = r.next()) {
var n = s(o.value, 2), a = n[0], c = n[1], l = Game.powerCreeps[a];
if (l && !(l.level >= this.gplState.currentLevel)) {
var u = this.selectNextPower(l, c);
if (u) {
var m = l.upgrade(u);
m === OK ? (jr.info("Upgraded ".concat(l.name, " to level ").concat(l.level + 1, " with ").concat(u), {
subsystem: "PowerCreep"
}), c.level = l.level) : m !== ERR_NOT_ENOUGH_RESOURCES && jr.warn("Failed to upgrade ".concat(l.name, ": ").concat(m), {
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
var r, o, n, a, s, c = null !== (n = t.powerPath) && void 0 !== n ? n : this.generatePowerPath(t.role);
try {
for (var l = i(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!e.powers[m]) {
var p = POWER_INFO[m];
if (p && void 0 !== p.level && p.level[0] <= (null !== (s = null === (a = this.gplState) || void 0 === a ? void 0 : a.currentLevel) && void 0 !== s ? s : 0)) return m;
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
c === OK ? jr.info("Created new power creep: ".concat(i, " (").concat(s, ")"), {
subsystem: "PowerCreep"
}) : jr.warn("Failed to create power creep: ".concat(c), {
subsystem: "PowerCreep"
});
}
}
}
}, t.prototype.checkRespawnNeeds = function() {
var e, t;
try {
for (var r = i(this.assignments), o = r.next(); !o.done; o = r.next()) {
var n = s(o.value, 2), a = n[0], c = n[1], l = Game.powerCreeps[a];
if (l) if (void 0 === l.ticksToLive) {
if (!(u = Game.rooms[c.assignedRoom])) continue;
(m = u.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0]) && l.spawn(m) === OK && (jr.info("Power creep ".concat(a, " spawned at ").concat(u.name), {
subsystem: "PowerCreep"
}), c.spawned = !0, c.lastRespawnTick = Game.time);
} else if (l.ticksToLive < 500) {
var u, m;
if (!(u = l.room)) continue;
(m = u.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_SPAWN;
}
})[0]) && l.pos.getRangeTo(m) <= 1 && l.renew(m) === OK && jr.debug("Power creep ".concat(a, " renewed"), {
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
return o && (o.memory.homeRoom = t), jr.info("Power creep ".concat(e, " reassigned to ").concat(t), {
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
jr.info("Power System: GPL ".concat(this.gplState.currentLevel, " ") + "(".concat(this.gplState.currentProgress, "/").concat(this.gplState.progressNeeded, "), ") + "Operators: ".concat(e.length, "/").concat(this.gplState.currentLevel, " ") + "(".concat(t, " eco, ").concat(r, " combat)"), {
subsystem: "PowerCreep"
});
}
}, a([ Nn("empire:powerCreep", "Power Creep Management", {
priority: e.ProcessPriority.LOW,
interval: 20,
minBucket: 0,
cpuBudget: .03
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Bn = new Fn, Hn = {
minPower: 1e3,
maxDistance: 5,
minTicksRemaining: 3e3,
healerRatio: .5,
minBucket: 0,
maxConcurrentOps: 2
}, Wn = function() {
function t(e) {
void 0 === e && (e = {}), this.operations = new Map, this.lastScan = 0, this.config = n(n({}, Hn), e);
}
return t.prototype.run = function() {
Game.time - this.lastScan >= 50 && (this.scanForPowerBanks(), this.lastScan = Game.time), 
this.updateOperations(), this.evaluateOpportunities(), Game.time % 100 == 0 && this.operations.size > 0 && this.logStatus();
}, t.prototype.scanForPowerBanks = function() {
var e, t, r = Rn.getEmpire(), o = function(o) {
var a, s, c = Game.rooms[o], l = o.match(/^[WE](\d+)[NS](\d+)$/);
if (!l) return "continue";
var u = parseInt(l[1], 10), m = parseInt(l[2], 10);
if (u % 10 != 0 && m % 10 != 0) return "continue";
var p = c.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_POWER_BANK;
}
}), f = function(a) {
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
r.powerBanks.push(s), a.power >= n.config.minPower && jr.info("Power bank discovered in ".concat(o, ": ").concat(a.power, " power"), {
subsystem: "PowerBank"
});
}
};
try {
for (var d = (a = void 0, i(p)), y = d.next(); !y.done; y = d.next()) f(y.value);
} catch (e) {
a = {
error: e
};
} finally {
try {
y && !y.done && (s = d.return) && s.call(d);
} finally {
if (a) throw a.error;
}
}
}, n = this;
for (var a in Game.rooms) o(a);
r.powerBanks = r.powerBanks.filter(function(e) {
return e.decayTick > Game.time;
});
}, t.prototype.updateOperations = function() {
var e, t;
try {
for (var r = i(this.operations), o = r.next(); !o.done; o = r.next()) {
var n = s(o.value, 2), a = n[0], c = n[1];
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
Game.time - c.startedAt > 1e4 && this.operations.delete(a);
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
if (!o) return e.state = "failed", void jr.warn("Power bank in ".concat(e.roomName, " disappeared"), {
subsystem: "PowerBank"
});
e.power = o.power, e.decayTick = Game.time + (null !== (t = o.ticksToDecay) && void 0 !== t ? t : 0), 
e.assignedCreeps.attackers.length > 0 && (e.state = "attacking", jr.info("Starting attack on power bank in ".concat(e.roomName), {
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
if (!o) return e.state = "collecting", void jr.info("Power bank destroyed in ".concat(e.roomName, ", collecting power"), {
subsystem: "PowerBank"
});
var n = null !== (t = e.lastHits) && void 0 !== t ? t : 2e6;
e.lastHits = o.hits, n > o.hits && (e.damageDealt += n - o.hits);
var a = e.decayTick - Game.time, i = e.damageDealt / Math.max(1, Game.time - e.startedAt), s = o.hits / Math.max(1, i);
s > .9 * a && jr.warn("Power bank in ".concat(e.roomName, " may decay before completion (").concat(Math.round(s), " > ").concat(a, ")"), {
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
0 === r.length && 0 === o.length && (e.state = "complete", jr.info("Power bank operation complete in ".concat(e.roomName, ": ").concat(e.powerCollected, " power collected"), {
subsystem: "PowerBank"
}));
} else 0 === e.assignedCreeps.carriers.length && (e.state = "failed");
}, t.prototype.evaluateOpportunities = function() {
var e, t, r = this;
if (!(Array.from(this.operations.values()).filter(function(e) {
return "complete" !== e.state && "failed" !== e.state;
}).length >= this.config.maxConcurrentOps)) {
var o = Rn.getEmpire(), n = Object.values(Game.rooms).filter(function(e) {
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
}, t.prototype.scorePowerBank = function(e, t) {
var r = 0;
r += .01 * e.power;
var o = e.decayTick - Game.time;
return o > 4e3 && (r += 50), o > 5e3 && (r += 30), r -= 20 * this.getMinDistanceToOwned(e.roomName, t), 
e.power >= 3e3 && (r += 50), e.power >= 5e3 && (r += 50), r;
}, t.prototype.getMinDistanceToOwned = function(e, t) {
var r, o, n = 1 / 0;
try {
for (var a = i(t), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(e, c.name);
l < n && (n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
return n;
}, t.prototype.startOperation = function(e, t) {
var r, o, n = null, a = 1 / 0;
try {
for (var s = i(t), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.map.getRoomLinearDistance(e.roomName, l.name);
u < a && (a = u, n = l);
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
this.operations.set(e.roomName, m), e.active = !0, jr.info("Started power bank operation in ".concat(e.roomName, " (").concat(e.power, " power, home: ").concat(n.name, ")"), {
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
var t, r, o = 0, n = 0, a = 0;
try {
for (var c = i(this.operations), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value, 2), m = (u[0], u[1]);
if (m.homeRoom === e && "complete" !== m.state && "failed" !== m.state) {
var p = this.getRequiredCreeps(m), f = {
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
"attacking" !== m.state && "scouting" !== m.state || (o += Math.max(0, p.attackers - f.attackers), 
n += Math.max(0, p.healers - f.healers)), "collecting" !== m.state && "attacking" !== m.state || (a += Math.max(0, p.carriers - f.carriers));
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
powerCarriers: a
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
for (var o = i(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
jr.info("Power bank op ".concat(a.roomName, ": ").concat(a.state, ", ") + "".concat(a.assignedCreeps.attackers.length, "A/").concat(a.assignedCreeps.healers.length, "H/").concat(a.assignedCreeps.carriers.length, "C, ") + "".concat(Math.round(a.damageDealt / 1e3), "k damage, ").concat(a.powerCollected, " collected"), {
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
}, a([ Nn("empire:powerBank", "Power Bank Harvesting", {
priority: e.ProcessPriority.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Yn = new Wn, Kn = function() {
function e() {}
return e.prototype.status = function(e) {
var t, r, o, n, a, s, c, l, u = Io.getConfig(e);
if (!u) return "No lab configuration for ".concat(e);
var m = "=== Lab Status: ".concat(e, " ===\n");
m += "Valid: ".concat(u.isValid, "\n"), m += "Labs: ".concat(u.labs.length, "\n"), 
m += "Last Update: ".concat(Game.time - u.lastUpdate, " ticks ago\n\n"), u.activeReaction && (m += "Active Reaction:\n", 
m += "  ".concat(u.activeReaction.input1, " + ").concat(u.activeReaction.input2, " → ").concat(u.activeReaction.output, "\n\n")), 
m += "Lab Assignments:\n";
try {
for (var p = i(u.labs), f = p.next(); !f.done; f = p.next()) {
var d = f.value, y = Game.getObjectById(d.labId), g = null !== (c = null == y ? void 0 : y.mineralType) && void 0 !== c ? c : "empty", h = null !== (l = null == y ? void 0 : y.store[g]) && void 0 !== l ? l : 0;
m += "  ".concat(d.role, ": ").concat(g, " (").concat(h, ") @ (").concat(d.pos.x, ",").concat(d.pos.y, ")\n");
}
} catch (e) {
t = {
error: e
};
} finally {
try {
f && !f.done && (r = p.return) && r.call(p);
} finally {
if (t) throw t.error;
}
}
var v = Lo.getLabResourceNeeds(e);
if (v.length > 0) {
m += "\nResource Needs:\n";
try {
for (var R = i(v), E = R.next(); !E.done; E = R.next()) {
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
for (var S = i(C), w = S.next(); !w.done; w = S.next()) {
var b = w.value;
m += "  ".concat(b.resourceType, ": ").concat(b.amount, " (priority ").concat(b.priority, ")\n");
}
} catch (e) {
a = {
error: e
};
} finally {
try {
w && !w.done && (s = S.return) && s.call(S);
} finally {
if (a) throw a.error;
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
var a = zo.areBoostLabsReady(n, t), s = zo.getMissingBoosts(n, t), c = "=== Boost Status: ".concat(e, " / ").concat(t, " ===\n");
if (c += "Ready: ".concat(a, "\n"), s.length > 0) {
c += "\nMissing Boosts:\n";
try {
for (var l = i(s), u = l.next(); !u.done; u = l.next()) {
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
}, a([ Uo({
name: "labs.status",
description: "Get lab status for a room",
usage: "labs.status(roomName)",
examples: [ "labs.status('E1S1')" ],
category: "Labs"
}) ], e.prototype, "status", null), a([ Uo({
name: "labs.setReaction",
description: "Set active reaction for a room",
usage: "labs.setReaction(roomName, input1, input2, output)",
examples: [ "labs.setReaction('E1S1', RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_HYDROXIDE)" ],
category: "Labs"
}) ], e.prototype, "setReaction", null), a([ Uo({
name: "labs.clear",
description: "Clear active reaction for a room",
usage: "labs.clear(roomName)",
examples: [ "labs.clear('E1S1')" ],
category: "Labs"
}) ], e.prototype, "clear", null), a([ Uo({
name: "labs.boost",
description: "Check boost lab readiness for a role",
usage: "labs.boost(roomName, role)",
examples: [ "labs.boost('E1S1', 'soldier')" ],
category: "Labs"
}) ], e.prototype, "boost", null), e;
}(), jn = function() {
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
var s = "=== Active Market Orders (".concat(a.length, ") ===\n");
s += "Type | Resource | Price | Remaining | Room\n", s += "-".repeat(70) + "\n";
try {
for (var c = i(a), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = u.type === ORDER_BUY ? "BUY " : "SELL", p = u.price.toFixed(3), f = null !== (o = null === (r = u.remainingAmount) || void 0 === r ? void 0 : r.toString()) && void 0 !== o ? o : "?";
s += "".concat(m, " | ").concat(u.resourceType, " | ").concat(p, " | ").concat(f, " | ").concat(null !== (n = u.roomName) && void 0 !== n ? n : "N/A", "\n");
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
}, a([ Uo({
name: "market.data",
description: "Get market data for a resource",
usage: "market.data(resource)",
examples: [ "market.data(RESOURCE_ENERGY)", "market.data(RESOURCE_GHODIUM)" ],
category: "Market"
}) ], e.prototype, "data", null), a([ Uo({
name: "market.orders",
description: "List your active market orders",
usage: "market.orders()",
examples: [ "market.orders()" ],
category: "Market"
}) ], e.prototype, "orders", null), a([ Uo({
name: "market.profit",
description: "Show market trading profit statistics",
usage: "market.profit()",
examples: [ "market.profit()" ],
category: "Market"
}) ], e.prototype, "profit", null), e;
}(), Vn = function() {
function e() {}
return e.prototype.gpl = function() {
var e = Bn.getGPLState();
if (!e) return "GPL tracking not available (no power unlocked)";
var t = "=== GPL Status ===\n";
t += "Level: ".concat(e.currentLevel, "\n"), t += "Progress: ".concat(e.currentProgress, " / ").concat(e.progressNeeded, "\n"), 
t += "Completion: ".concat((e.currentProgress / e.progressNeeded * 100).toFixed(1), "%\n"), 
t += "Target Milestone: ".concat(e.targetMilestone, "\n");
var r = e.ticksToNextLevel === 1 / 0 ? "N/A (no progress yet)" : "".concat(e.ticksToNextLevel.toLocaleString(), " ticks");
return (t += "Estimated Time: ".concat(r, "\n")) + "\nTotal Power Processed: ".concat(e.totalPowerProcessed.toLocaleString(), "\n");
}, e.prototype.creeps = function() {
var e, t, r = Bn.getAssignments();
if (0 === r.length) return "No power creeps created yet";
var o = "=== Power Creeps (".concat(r.length, ") ===\n");
o += "Name | Role | Room | Level | Spawned\n", o += "-".repeat(70) + "\n";
try {
for (var n = i(r), a = n.next(); !a.done; a = n.next()) {
var s = a.value, c = s.spawned ? "✓" : "✗";
o += "".concat(s.name, " | ").concat(s.role, " | ").concat(s.assignedRoom, " | ").concat(s.level, " | ").concat(c, "\n");
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
var e, t, r = Yn.getActiveOperations();
if (0 === r.length) return "No active power bank operations";
var o = "=== Power Bank Operations (".concat(r.length, ") ===\n");
try {
for (var n = i(r), a = n.next(); !a.done; a = n.next()) {
var s = a.value;
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
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.assign = function(e, t) {
return Bn.reassignPowerCreep(e, t) ? "Reassigned ".concat(e, " to ").concat(t) : "Failed to reassign ".concat(e, " (not found)");
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
}, a([ Uo({
name: "power.gpl",
description: "Show GPL (Global Power Level) status",
usage: "power.gpl()",
examples: [ "power.gpl()" ],
category: "Power"
}) ], e.prototype, "gpl", null), a([ Uo({
name: "power.creeps",
description: "List power creeps and their assignments",
usage: "power.creeps()",
examples: [ "power.creeps()" ],
category: "Power"
}) ], e.prototype, "creeps", null), a([ Uo({
name: "power.operations",
description: "List active power bank operations",
usage: "power.operations()",
examples: [ "power.operations()" ],
category: "Power"
}) ], e.prototype, "operations", null), a([ Uo({
name: "power.assign",
description: "Reassign a power creep to a different room",
usage: "power.assign(powerCreepName, roomName)",
examples: [ "power.assign('operator_eco', 'E2S2')" ],
category: "Power"
}) ], e.prototype, "assign", null), a([ Uo({
name: "power.create",
description: "Manually create a new power creep (automatic creation is also enabled)",
usage: "power.create(name, className)",
examples: [ "power.create('operator_eco', POWER_CLASS.OPERATOR)", "power.create('my_operator', 'operator')" ],
category: "Power"
}) ], e.prototype, "create", null), a([ Uo({
name: "power.spawn",
description: "Manually spawn a power creep at a power spawn",
usage: "power.spawn(powerCreepName, roomName?)",
examples: [ "power.spawn('operator_eco')", "power.spawn('operator_eco', 'E2S2')" ],
category: "Power"
}) ], e.prototype, "spawn", null), a([ Uo({
name: "power.upgrade",
description: "Manually upgrade a power creep with a specific power",
usage: "power.upgrade(powerCreepName, power)",
examples: [ "power.upgrade('operator_eco', PWR_OPERATE_SPAWN)", "power.upgrade('operator_eco', PWR_OPERATE_TOWER)" ],
category: "Power"
}) ], e.prototype, "upgrade", null), e;
}(), qn = new Kn, zn = new jn, Xn = new Vn, Qn = new (function(t) {
function r(e) {
return void 0 === e && (e = {}), t.call(this, e) || this;
}
return o(r, t), r.prototype.run = function() {
t.prototype.run.call(this);
}, a([ Nn("empire:shard", "Shard Manager", {
priority: e.ProcessPriority.LOW,
interval: 100,
minBucket: 0,
cpuBudget: .02
}) ], r.prototype, "run", null), a([ kn() ], r);
}(t.ShardManager)), Zn = function() {
function e() {}
return e.prototype.status = function() {
var e, t, r = null !== (t = null === (e = Game.shard) || void 0 === e ? void 0 : e.name) && void 0 !== t ? t : "shard0", o = Qn.getCurrentShardState();
if (!o) return "No shard state found for ".concat(r);
var n = o.health, a = [ "=== Shard Status: ".concat(r, " ==="), "Role: ".concat(o.role.toUpperCase()), "Rooms: ".concat(n.roomCount, " (Avg RCL: ").concat(n.avgRCL, ")"), "Creeps: ".concat(n.creepCount), "CPU: ".concat(n.cpuCategory.toUpperCase(), " (").concat(Math.round(100 * n.cpuUsage), "%)"), "Bucket: ".concat(n.bucketLevel), "Economy Index: ".concat(n.economyIndex, "%"), "War Index: ".concat(n.warIndex, "%"), "Portals: ".concat(o.portals.length), "Active Tasks: ".concat(o.activeTasks.length), "Last Update: ".concat(n.lastUpdate) ];
return o.cpuLimit && a.push("CPU Limit: ".concat(o.cpuLimit)), a.join("\n");
}, e.prototype.all = function() {
var e, t, r = Qn.getAllShards();
if (0 === r.length) return "No shards tracked yet";
var o = [ "=== All Shards ===" ];
try {
for (var n = i(r), a = n.next(); !a.done; a = n.next()) {
var s = a.value, c = s.health;
o.push("".concat(s.name, " [").concat(s.role, "]: ").concat(c.roomCount, " rooms, RCL ").concat(c.avgRCL, ", ") + "CPU ".concat(c.cpuCategory, " (").concat(Math.round(100 * c.cpuUsage), "%), ") + "Eco ".concat(c.economyIndex, "%, War ").concat(c.warIndex, "%"));
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
return t.includes(e) ? (Qn.setShardRole(e), "Shard role set to: ".concat(e.toUpperCase())) : "Invalid role: ".concat(e, ". Valid roles: ").concat(t.join(", "));
}, e.prototype.portals = function(e) {
var t, r, o, n, a, s = null !== (n = null === (o = Game.shard) || void 0 === o ? void 0 : o.name) && void 0 !== n ? n : "shard0", c = Qn.getCurrentShardState();
if (!c) return "No shard state found for ".concat(s);
var l = c.portals;
if (e && (l = l.filter(function(t) {
return t.targetShard === e;
})), 0 === l.length) return e ? "No portals to ".concat(e) : "No portals discovered yet";
var u = [ e ? "=== Portals to ".concat(e, " ===") : "=== All Portals ===" ];
try {
for (var m = i(l), p = m.next(); !p.done; p = m.next()) {
var f = p.value, d = f.isStable ? "✓" : "✗", y = "⚠".repeat(f.threatRating), g = null !== (a = f.traversalCount) && void 0 !== a ? a : 0, h = Game.time - f.lastScouted;
u.push("".concat(f.sourceRoom, " → ").concat(f.targetShard, "/").concat(f.targetRoom, " ") + "[".concat(d, "] ").concat(y || "○", " (").concat(g, " uses, ").concat(h, "t ago)"));
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
var r, o = Qn.getOptimalPortalRoute(e, t);
if (!o) return "No portal found to ".concat(e);
var n = o.isStable ? "Stable" : "Unstable", a = o.threatRating > 0 ? " (Threat: ".concat(o.threatRating, ")") : "";
return "Best portal to ".concat(e, ":\n") + "  Source: ".concat(o.sourceRoom, " (").concat(o.sourcePos.x, ",").concat(o.sourcePos.y, ")\n") + "  Target: ".concat(o.targetShard, "/").concat(o.targetRoom, "\n") + "  Status: ".concat(n).concat(a, "\n") + "  Traversals: ".concat(null !== (r = o.traversalCount) && void 0 !== r ? r : 0, "\n") + "  Last Scouted: ".concat(Game.time - o.lastScouted, " ticks ago");
}, e.prototype.createTask = function(e, t, r, o) {
void 0 === o && (o = 50);
var n = [ "colonize", "reinforce", "transfer", "evacuate" ];
return n.includes(e) ? (Qn.createTask(e, t, r, o), "Created ".concat(e, " task to ").concat(t).concat(r ? "/".concat(r) : "", " (priority: ").concat(o, ")")) : "Invalid task type: ".concat(e, ". Valid types: ").concat(n.join(", "));
}, e.prototype.transferResource = function(e, t, r, o, n) {
return void 0 === n && (n = 50), Qn.createResourceTransferTask(e, t, r, o, n), "Created resource transfer task:\n" + "  ".concat(o, " ").concat(r, " → ").concat(e, "/").concat(t, "\n") + "  Priority: ".concat(n);
}, e.prototype.transfers = function() {
var e, r, o = t.resourceTransferCoordinator.getActiveRequests();
if (0 === o.length) return "No active resource transfers";
var n = [ "=== Active Resource Transfers ===" ];
try {
for (var a = i(o), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = Math.round(c.transferred / c.amount * 100), u = c.assignedCreeps.length;
n.push("".concat(c.taskId, ": ").concat(c.amount, " ").concat(c.resourceType, "\n") + "  ".concat(c.sourceRoom, " → ").concat(c.targetShard, "/").concat(c.targetRoom, "\n") + "  Status: ".concat(c.status.toUpperCase(), " (").concat(l, "%)\n") + "  Creeps: ".concat(u, ", Priority: ").concat(c.priority));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
} finally {
if (e) throw e.error;
}
}
return n.join("\n");
}, e.prototype.cpuHistory = function() {
var e, t, r = Qn.getCurrentShardState();
if (!r || !r.cpuHistory || 0 === r.cpuHistory.length) return "No CPU history available";
var o = [ "=== CPU Allocation History ===" ];
try {
for (var n = i(r.cpuHistory.slice(-10)), a = n.next(); !a.done; a = n.next()) {
var s = a.value, c = Math.round(s.cpuUsed / s.cpuLimit * 100);
o.push("Tick ".concat(s.tick, ": ").concat(s.cpuUsed.toFixed(2), "/").concat(s.cpuLimit, " (").concat(c, "%) ") + "Bucket: ".concat(s.bucketLevel));
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
var e, t, r, o = Qn.getActiveTransferTasks();
if (0 === o.length) return "No active inter-shard tasks";
var n = [ "=== Inter-Shard Tasks ===" ];
try {
for (var a = i(o), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = null !== (r = c.progress) && void 0 !== r ? r : 0;
n.push("".concat(c.id, " [").concat(c.type.toUpperCase(), "]\n") + "  ".concat(c.sourceShard, " → ").concat(c.targetShard).concat(c.targetRoom ? "/".concat(c.targetRoom) : "", "\n") + "  Status: ".concat(c.status.toUpperCase(), " (").concat(l, "%)\n") + "  Priority: ".concat(c.priority));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
s && !s.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return n.join("\n");
}, e.prototype.syncStatus = function() {
var e = Qn.getSyncStatus(), r = e.isHealthy ? "✓ HEALTHY" : "⚠ DEGRADED";
return "=== InterShardMemory Sync Status ===\n" + "Status: ".concat(r, "\n") + "Last Sync: ".concat(e.lastSync, " (").concat(e.ticksSinceSync, " ticks ago)\n") + "Memory Usage: ".concat(e.memorySize, " / ").concat(t.INTERSHARD_MEMORY_LIMIT, " bytes (").concat(e.sizePercent, "%)\n") + "Shards Tracked: ".concat(e.shardsTracked, "\n") + "Active Tasks: ".concat(e.activeTasks, "\n") + "Total Portals: ".concat(e.totalPortals);
}, e.prototype.memoryStats = function() {
var e = Qn.getMemoryStats();
return "=== InterShardMemory Usage ===\n" + "Total: ".concat(e.size, " / ").concat(e.limit, " bytes (").concat(e.percent, "%)\n") + "\nBreakdown:\n" + "  Shards: ".concat(e.breakdown.shards, " bytes\n") + "  Tasks: ".concat(e.breakdown.tasks, " bytes\n") + "  Portals: ".concat(e.breakdown.portals, " bytes\n") + "  Other: ".concat(e.breakdown.other, " bytes");
}, e.prototype.forceSync = function() {
return Qn.forceSync(), "InterShardMemory sync forced. Check logs for results.";
}, a([ Uo({
name: "shard.status",
description: "Display current shard status and metrics",
usage: "shard.status()",
examples: [ "shard.status()" ],
category: "Shard"
}) ], e.prototype, "status", null), a([ Uo({
name: "shard.all",
description: "List all known shards with summary info",
usage: "shard.all()",
examples: [ "shard.all()" ],
category: "Shard"
}) ], e.prototype, "all", null), a([ Uo({
name: "shard.setRole",
description: "Manually set the role for the current shard",
usage: "shard.setRole(role)",
examples: [ "shard.setRole('core')", "shard.setRole('frontier')", "shard.setRole('resource')", "shard.setRole('backup')", "shard.setRole('war')" ],
category: "Shard"
}) ], e.prototype, "setRole", null), a([ Uo({
name: "shard.portals",
description: "List all known portals from the current shard",
usage: "shard.portals(targetShard?)",
examples: [ "shard.portals()", "shard.portals('shard1')" ],
category: "Shard"
}) ], e.prototype, "portals", null), a([ Uo({
name: "shard.bestPortal",
description: "Find the optimal portal route to a target shard",
usage: "shard.bestPortal(targetShard, fromRoom?)",
examples: [ "shard.bestPortal('shard1')", "shard.bestPortal('shard2', 'E1N1')" ],
category: "Shard"
}) ], e.prototype, "bestPortal", null), a([ Uo({
name: "shard.createTask",
description: "Create a cross-shard task",
usage: "shard.createTask(type, targetShard, targetRoom?, priority?)",
examples: [ "shard.createTask('colonize', 'shard1', 'E5N5', 80)", "shard.createTask('reinforce', 'shard2', 'W1N1', 90)", "shard.createTask('evacuate', 'shard0', 'E1N1', 100)" ],
category: "Shard"
}) ], e.prototype, "createTask", null), a([ Uo({
name: "shard.transferResource",
description: "Create a cross-shard resource transfer task",
usage: "shard.transferResource(targetShard, targetRoom, resourceType, amount, priority?)",
examples: [ "shard.transferResource('shard1', 'E5N5', 'energy', 50000, 70)", "shard.transferResource('shard2', 'W1N1', 'U', 5000, 80)" ],
category: "Shard"
}) ], e.prototype, "transferResource", null), a([ Uo({
name: "shard.transfers",
description: "List active cross-shard resource transfers",
usage: "shard.transfers()",
examples: [ "shard.transfers()" ],
category: "Shard"
}) ], e.prototype, "transfers", null), a([ Uo({
name: "shard.cpuHistory",
description: "Display CPU allocation history for the current shard",
usage: "shard.cpuHistory()",
examples: [ "shard.cpuHistory()" ],
category: "Shard"
}) ], e.prototype, "cpuHistory", null), a([ Uo({
name: "shard.tasks",
description: "List all inter-shard tasks",
usage: "shard.tasks()",
examples: [ "shard.tasks()" ],
category: "Shard"
}) ], e.prototype, "tasks", null), a([ Uo({
name: "shard.syncStatus",
description: "Display InterShardMemory sync status and health",
usage: "shard.syncStatus()",
examples: [ "shard.syncStatus()" ],
category: "Shard"
}) ], e.prototype, "syncStatus", null), a([ Uo({
name: "shard.memoryStats",
description: "Display InterShardMemory size breakdown",
usage: "shard.memoryStats()",
examples: [ "shard.memoryStats()" ],
category: "Shard"
}) ], e.prototype, "memoryStats", null), a([ Uo({
name: "shard.forceSync",
description: "Force a full InterShardMemory sync with validation",
usage: "shard.forceSync()",
examples: [ "shard.forceSync()" ],
category: "Shard"
}) ], e.prototype, "forceSync", null), e;
}(), $n = new Zn, Jn = {
maxPredictionTicks: 100,
safetyMargin: .9,
enableLogging: !1
}, ea = function() {
function e(e) {
void 0 === e && (e = {}), this.config = n(n({}, Jn), e);
}
return e.prototype.predictEnergyInTicks = function(e, t) {
if (t < 0) throw new Error("Cannot predict negative ticks");
t > this.config.maxPredictionTicks && (jr.warn("Prediction horizon ".concat(t, " exceeds max ").concat(this.config.maxPredictionTicks, ", clamping"), {
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
return this.config.enableLogging && jr.debug("Energy prediction for ".concat(e.name, ": ").concat(n, " → ").concat(i, " (").concat(t, " ticks, ").concat(a.toFixed(2), "/tick)"), {
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
for (var a = i(o), s = a.next(); !s.done; s = a.next()) n += s.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
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
for (var a = i(o), s = a.next(); !s.done; s = a.next()) n += s.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
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
for (var a = i(o), s = a.next(); !s.done; s = a.next()) n += s.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
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
for (var a = i(o), s = a.next(); !s.done; s = a.next()) n += s.value.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
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
this.config = n(n({}, this.config), e);
}, e.prototype.getConfig = function() {
return n({}, this.config);
}, e;
}(), ta = new ea, ra = new (function() {
function e() {}
return e.prototype.predictEnergy = function(e, t) {
void 0 === t && (t = 50);
var r = Game.rooms[e];
if (!r) return "Room ".concat(e, " is not visible");
if (!r.controller || !r.controller.my) return "Room ".concat(e, " is not owned by you");
var o = ta.predictEnergyInTicks(r, t), n = "=== Energy Prediction: ".concat(e, " ===\n");
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
var r = ta.calculateEnergyIncome(t), o = "=== Energy Income: ".concat(e, " ===\n");
return o += "Harvesters: ".concat(r.harvesters.toFixed(2), " energy/tick\n"), o += "Static Miners: ".concat(r.miners.toFixed(2), " energy/tick\n"), 
(o += "Links: ".concat(r.links.toFixed(2), " energy/tick\n")) + "Total: ".concat(r.total.toFixed(2), " energy/tick\n");
}, e.prototype.showConsumption = function(e) {
var t = Game.rooms[e];
if (!t) return "Room ".concat(e, " is not visible");
var r = ta.calculateEnergyConsumption(t), o = "=== Energy Consumption: ".concat(e, " ===\n");
return o += "Upgraders: ".concat(r.upgraders.toFixed(2), " energy/tick\n"), o += "Builders: ".concat(r.builders.toFixed(2), " energy/tick\n"), 
o += "Towers: ".concat(r.towers.toFixed(2), " energy/tick\n"), o += "Spawning: ".concat(r.spawning.toFixed(2), " energy/tick\n"), 
(o += "Repairs: ".concat(r.repairs.toFixed(2), " energy/tick\n")) + "Total: ".concat(r.total.toFixed(2), " energy/tick\n");
}, e.prototype.canAfford = function(e, t, r) {
void 0 === r && (r = 50);
var o = Game.rooms[e];
if (!o) return "Room ".concat(e, " is not visible");
var n = ta.canAffordInTicks(o, t, r), a = ta.predictEnergyInTicks(o, r);
if (n) return "✓ Room ".concat(e, " CAN afford ").concat(t, " energy within ").concat(r, " ticks (predicted: ").concat(Math.round(a.predicted), ")");
var i = ta.getRecommendedSpawnDelay(o, t);
return i >= 999 ? "✗ Room ".concat(e, " CANNOT afford ").concat(t, " energy (negative energy flow)") : "✗ Room ".concat(e, " CANNOT afford ").concat(t, " energy within ").concat(r, " ticks (would need ").concat(i, " ticks)");
}, e.prototype.getSpawnDelay = function(e, t) {
var r = Game.rooms[e];
if (!r) return "Room ".concat(e, " is not visible");
var o = ta.getRecommendedSpawnDelay(r, t), n = r.energyAvailable;
if (0 === o) return "✓ Room ".concat(e, " can spawn ").concat(t, " energy body NOW (current: ").concat(n, ")");
if (o >= 999) return "✗ Room ".concat(e, " has negative energy flow, cannot spawn ").concat(t, " energy body");
var a = ta.predictEnergyInTicks(r, o);
return "Room ".concat(e, " needs to wait ").concat(o, " ticks to spawn ").concat(t, " energy body (current: ").concat(n, ", predicted: ").concat(Math.round(a.predicted), ")");
}, a([ Uo({
name: "economy.energy.predict",
description: "Predict energy availability for a room in N ticks",
usage: "economy.energy.predict(roomName, ticks)",
examples: [ "economy.energy.predict('W1N1', 50)", "economy.energy.predict('E1S1', 100)" ],
category: "Economy"
}) ], e.prototype, "predictEnergy", null), a([ Uo({
name: "economy.energy.income",
description: "Show energy income breakdown for a room",
usage: "economy.energy.income(roomName)",
examples: [ "economy.energy.income('W1N1')" ],
category: "Economy"
}) ], e.prototype, "showIncome", null), a([ Uo({
name: "economy.energy.consumption",
description: "Show energy consumption breakdown for a room",
usage: "economy.energy.consumption(roomName)",
examples: [ "economy.energy.consumption('W1N1')" ],
category: "Economy"
}) ], e.prototype, "showConsumption", null), a([ Uo({
name: "economy.energy.canAfford",
description: "Check if a room can afford a certain energy cost within N ticks",
usage: "economy.energy.canAfford(roomName, cost, ticks)",
examples: [ "economy.energy.canAfford('W1N1', 1000, 50)", "economy.energy.canAfford('E1S1', 500, 25)" ],
category: "Economy"
}) ], e.prototype, "canAfford", null), a([ Uo({
name: "economy.energy.spawnDelay",
description: "Get recommended spawn delay for a body cost",
usage: "economy.energy.spawnDelay(roomName, cost)",
examples: [ "economy.energy.spawnDelay('W1N1', 1000)", "economy.energy.spawnDelay('E1S1', 500)" ],
category: "Economy"
}) ], e.prototype, "getSpawnDelay", null), e;
}());

function oa(e) {
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

function na(e) {
var t, r, o = Rn.getEmpire(), n = 0, a = la(e);
try {
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = o.knownRooms[l];
u && (u.owner && !ma(u.owner) && (n += 30), u.threatLevel >= 2 && (n += 10 * u.threatLevel), 
u.towerCount && u.towerCount > 0 && (n += 5 * u.towerCount));
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
return n;
}

function aa(e) {
return "plains" === e ? 15 : "swamp" === e ? -10 : 0;
}

function ia(e) {
var t, r, o = la(e);
try {
for (var n = i(o), a = n.next(); !a.done; a = n.next()) {
var s = ua(a.value);
if (s && (s.x % 10 == 0 || s.y % 10 == 0)) return !0;
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

function sa(e) {
var t, r, o = Rn.getEmpire(), n = la(e);
try {
for (var a = i(n), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = o.knownRooms[c];
if (l && l.hasPortal) return 10;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
return 0;
}

function ca(e, t, r) {
return 0 === t.length ? 0 : r <= 2 ? 25 : r <= 3 ? 15 : r <= 5 ? 5 : 0;
}

function la(e) {
var t = ua(e);
if (!t) return [];
for (var r = t.x, o = t.y, n = t.xDir, a = t.yDir, i = [], s = -1; s <= 1; s++) for (var c = -1; c <= 1; c++) if (0 !== s || 0 !== c) {
var l = r + s, u = o + c, m = n, p = a, f = l, d = u;
l < 0 && (m = "E" === n ? "W" : "E", f = Math.abs(l) - 1), u < 0 && (p = "N" === a ? "S" : "N", 
d = Math.abs(u) - 1), i.push("".concat(m).concat(f).concat(p).concat(d));
}
return i;
}

function ua(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
return t ? {
xDir: t[1],
x: parseInt(t[2], 10),
yDir: t[3],
y: parseInt(t[4], 10)
} : null;
}

function ma(e) {
return !1;
}

function pa(e, t) {
var r = [], o = ua(e);
if (!o) return [];
for (var n = o.x, a = o.y, i = o.xDir, s = o.yDir, c = -t; c <= t; c++) for (var l = -t; l <= t; l++) if (0 !== c || 0 !== l) {
var u = n + c, m = a + l, p = i, f = s, d = u, y = m;
u < 0 && (p = "E" === i ? "W" : "E", d = Math.abs(u) - 1), m < 0 && (f = "N" === s ? "S" : "N", 
y = Math.abs(m) - 1), r.push("".concat(p).concat(d).concat(f).concat(y));
}
return r;
}

function fa(e, t, r, o) {
var n, a = Game.map.getRoomLinearDistance(t, e);
if (!Number.isFinite(a) || a <= 0) throw new Error("calculateRemoteProfitability: invalid distance ".concat(a, " between ").concat(t, " and ").concat(e));
if (r.sources <= 0) throw new Error("calculateRemoteProfitability: intel.sources must be positive, got ".concat(r.sources, " for ").concat(e));
if (void 0 !== r.threatLevel && null !== r.threatLevel && (r.threatLevel < 0 || r.threatLevel > 3)) throw new Error("calculateRemoteProfitability: intel.threatLevel must be in [0, 3], got ".concat(r.threatLevel, " for ").concat(e));
var i, s, c, l, u, m = 10 * r.sources, p = 50 * a * 2, f = (650 + 450 * r.sources) / (1500 / p) / p, d = 5e3 * r.sources + 50 * a * 300, y = d / 5e4, g = m * (null !== (n = [ 0, .1, .3, .6 ][r.threatLevel]) && void 0 !== n ? n : 0), h = m - f - y - g, v = f + y, R = v > 0 ? h / v : 0;
return {
roomName: e,
sourceId: o,
energyPerTick: m,
carrierCostPerTick: f,
pathDistance: a,
infrastructureCost: d,
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

var da = {
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
}, ya = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.cachedUsername = "", this.usernameLastTick = 0, 
this.config = n(n({}, da), e);
}
return t.prototype.run = function() {
var e = Rn.getEmpire();
this.lastRun = Game.time, this.monitorExpansionProgress(e), this.updateRemoteAssignments(e), 
this.isExpansionReady(e) && this.assignClaimerTargets(e), this.assignReserverTargets();
}, t.prototype.updateRemoteAssignments = function(e) {
var t, r, o, n, a, s, c, l = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var u = i(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = Rn.getSwarmState(p.name);
if (f && !((null !== (s = null === (a = p.controller) || void 0 === a ? void 0 : a.level) && void 0 !== s ? s : 0) < this.config.minRclForRemotes)) {
var d = null !== (c = f.remoteAssignments) && void 0 !== c ? c : [], y = this.validateRemoteAssignments(d, e, p.name), g = this.calculateRemoteCapacity(p, f);
if (y.length < g) {
var h = this.findRemoteCandidates(p.name, e, y), v = g - y.length, R = h.slice(0, v);
try {
for (var E = (o = void 0, i(R)), T = E.next(); !T.done; T = E.next()) {
var C = T.value;
y.includes(C) || (y.push(C), jr.info("Assigned remote room ".concat(C, " to ").concat(p.name), {
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
JSON.stringify(y) !== JSON.stringify(f.remoteAssignments) && (f.remoteAssignments = y);
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
n.owner && (jr.info("Removing remote ".concat(e, " - now owned by ").concat(n.owner), {
subsystem: "Expansion"
}), a = "claimed");
var i = o.getMyUsername();
if (!a && n.reserver && n.reserver !== i && (jr.info("Removing remote ".concat(e, " - reserved by ").concat(n.reserver), {
subsystem: "Expansion"
}), a = "hostile"), !a && n.threatLevel >= 3 && (jr.info("Removing remote ".concat(e, " - threat level ").concat(n.threatLevel), {
subsystem: "Expansion"
}), a = "hostile"), !a) {
var s = Game.map.getRoomLinearDistance(r, e);
s > o.config.maxRemoteDistance && (jr.info("Removing remote ".concat(e, " - too far (").concat(s, ")"), {
subsystem: "Expansion"
}), a = "unreachable");
}
return !a || (On.emit("remote.lost", {
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
var c = fa(a, e, i);
if (c.isProfitable) {
var l = this.scoreRemoteCandidate(i, s);
o.push({
roomName: a,
score: l
});
} else Game.time % 1e3 == 0 && jr.debug("Skipping remote ".concat(a, " - not profitable (ROI: ").concat(c.roi.toFixed(2), ")"), {
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
return 2 === e.sources ? o += 40 : 1 === e.sources && (o += 20), o += oa(e.mineralType), 
o -= 5 * t, o -= na(e.name), o -= 15 * e.threatLevel, o += aa(e.terrain), ia(e.name) && (o += 10), 
o += sa(e.name), e.controllerLevel > 0 && !e.owner && (o += 2 * e.controllerLevel), 
o + ca(e.name, r, t);
}, t.prototype.isRemoteAssignedElsewhere = function(e, t) {
var r, o, n, a = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (l.name !== t) {
var u = Rn.getSwarmState(l.name);
if (null === (n = null == u ? void 0 : u.remoteAssignments) || void 0 === n ? void 0 : n.includes(e)) return !0;
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
}, t.prototype.assignClaimerTargets = function(e) {
var t, r, o = this.getNextExpansionTarget(e);
if (o) {
var n = Object.values(Game.creeps).some(function(e) {
var t = e.memory;
return "claimer" === t.role && t.targetRoom === o.roomName && "claim" === t.task;
});
if (!n) {
var a = !1;
try {
for (var s = i(Object.values(Game.creeps)), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = l.memory;
if ("claimer" === u.role && !u.targetRoom) {
u.targetRoom = o.roomName, u.task = "claim", jr.info("Assigned claim target ".concat(o.roomName, " to ").concat(l.name), {
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
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
a || this.requestClaimerSpawn(o.roomName, e);
}
}
}, t.prototype.requestClaimerSpawn = function(e, t) {
var r, o, n = this, a = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), s = a.filter(function(e) {
var t, r;
return (null !== (r = null === (t = e.controller) || void 0 === t ? void 0 : t.level) && void 0 !== r ? r : 0) >= n.config.minRclForClaiming;
});
if (0 !== s.length) {
var c = null, l = 999;
try {
for (var u = i(s), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = Game.map.getRoomLinearDistance(p.name, e);
f < l && (l = f, c = p);
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
var d = Rn.getSwarmState(c.name);
d && "defensive" !== d.posture && "evacuate" !== d.posture && d.danger < 2 && "expand" !== d.posture && (d.posture = "expand", 
jr.info("Set ".concat(c.name, " to expand posture for claiming ").concat(e, " (distance: ").concat(l, ")"), {
subsystem: "Expansion"
}));
}
}
}, t.prototype.assignReserverTargets = function() {
var e, t, r, o, n;
try {
for (var a = i(Object.values(Game.creeps)), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = c.memory;
if ("claimer" === l.role && !l.targetRoom) {
var u = l.homeRoom;
if (u) {
var m = Rn.getSwarmState(u);
if (null === (n = null == m ? void 0 : m.remoteAssignments) || void 0 === n ? void 0 : n.length) try {
for (var p = (r = void 0, i(m.remoteAssignments)), f = p.next(); !f.done; f = p.next()) {
var d = f.value;
if (!this.hasReserverAssigned(d)) {
l.targetRoom = d, l.task = "reserve", jr.info("Assigned reserve target ".concat(d, " to ").concat(c.name), {
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
f && !f.done && (o = p.return) && o.call(p);
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
s && !s.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
}, t.prototype.hasReserverAssigned = function(e) {
var t, r;
try {
for (var o = i(Object.values(Game.creeps)), n = o.next(); !n.done; n = o.next()) {
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
}, t.prototype.isExpansionReady = function(e) {
var t = this;
if (e.objectives.expansionPaused) return !1;
var r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (r.length >= Game.gcl.level) return !1;
var o = Game.gcl.progress / Game.gcl.progressTotal;
if (o < this.config.minGclProgressForClaim) return Game.time % 500 == 0 && jr.info("Waiting for GCL progress: ".concat((100 * o).toFixed(1), "% (need ").concat((100 * this.config.minGclProgressForClaim).toFixed(0), "%)"), {
subsystem: "Expansion"
}), !1;
var n = r.filter(function(e) {
var r, o;
return (null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0) >= t.config.minRclForClaiming;
}), a = n.length / r.length;
return !(a < this.config.minStableRoomPercentage && (Game.time % 500 == 0 && jr.info("Waiting for room stability: ".concat(n.length, "/").concat(r.length, " rooms stable (").concat((100 * a).toFixed(0), "%, need ").concat((100 * this.config.minStableRoomPercentage).toFixed(0), "%)"), {
subsystem: "Expansion"
}), 1));
}, t.prototype.getNextExpansionTarget = function(e) {
var t = this, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (r.length >= Game.gcl.level) return null;
var o = e.claimQueue.filter(function(e) {
return !e.claimed;
});
if (0 === o.length) return null;
var a = o.map(function(e) {
var o = t.getMinDistanceToOwned(e.roomName, r), a = o <= t.config.clusterExpansionDistance ? 100 : 0;
return n(n({}, e), {
clusterScore: e.score + a,
distanceToCluster: o
});
});
if (a.sort(function(e, t) {
return t.clusterScore - e.clusterScore;
}), Game.time % 100 == 0 && a.length > 0) {
var i = a[0];
jr.info("Next expansion target: ".concat(i.roomName, " (score: ").concat(i.score, ", cluster bonus: ").concat(i.clusterScore - i.score, ", distance: ").concat(i.distanceToCluster, ")"), {
subsystem: "Expansion"
});
}
return a[0];
}, t.prototype.getMinDistanceToOwned = function(e, t) {
var r, o;
if (0 === t.length) return 999;
var n = 999;
try {
for (var a = i(t), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(e, c.name);
l < n && (n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
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
}, t.prototype.performSafetyAnalysis = function(e, t) {
var r, o, n = [], a = pa(e, 2);
try {
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = t.knownRooms[l];
u && (u.owner && !ma(u.owner) && n.push("Hostile player ".concat(u.owner, " in ").concat(l)), 
u.towerCount && u.towerCount > 0 && n.push("".concat(u.towerCount, " towers in ").concat(l)), 
u.spawnCount && u.spawnCount > 0 && n.push("".concat(u.spawnCount, " spawns in ").concat(l)), 
u.threatLevel >= 2 && n.push("Threat level ".concat(u.threatLevel, " in ").concat(l)));
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
var t, r, o = Rn.getEmpire(), n = la(e), a = new Set;
try {
for (var s = i(n), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = o.knownRooms[l];
(null == u ? void 0 : u.owner) && !ma(u.owner) && a.add(u.owner);
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
return a.size >= 2;
}(e) && n.push("Room is in potential war zone between hostile players"), {
isSafe: 0 === n.length,
threatDescription: n.length > 0 ? n.join("; ") : "No threats detected"
};
}, t.prototype.monitorExpansionProgress = function(e) {
var t, r, o, n = Game.time, a = function(t) {
if (!t.claimed) return "continue";
var r = n - t.lastEvaluated;
if (r > 5e3) {
var a = Game.rooms[t.roomName];
return (null === (o = null == a ? void 0 : a.controller) || void 0 === o ? void 0 : o.my) ? (jr.info("Expansion to ".concat(t.roomName, " completed successfully"), {
subsystem: "Expansion"
}), s.removeFromClaimQueue(e, t.roomName), "continue") : (jr.warn("Expansion to ".concat(t.roomName, " timed out after ").concat(r, " ticks"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "timeout"), "continue");
}
if (!Object.values(Game.creeps).some(function(e) {
var r = e.memory;
return "claimer" === r.role && r.targetRoom === t.roomName && "claim" === r.task;
}) && r > 1e3) return jr.warn("No active claimer for ".concat(t.roomName, " expansion"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "claimer_died"), "continue";
var i = e.knownRooms[t.roomName];
if ((null == i ? void 0 : i.owner) && i.owner !== s.getMyUsername()) return jr.warn("".concat(t.roomName, " claimed by ").concat(i.owner, " before we could claim it"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "hostile_claim"), "continue";
var c = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), l = c.reduce(function(e, t) {
var r, o;
return e + (null !== (o = null === (r = t.storage) || void 0 === r ? void 0 : r.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== o ? o : 0);
}, 0), u = c.length > 0 ? l / c.length : 0;
return u < 2e4 ? (jr.warn("Cancelling expansion to ".concat(t.roomName, " due to low energy (avg: ").concat(u, ")"), {
subsystem: "Expansion"
}), s.cancelExpansion(e, t.roomName, "low_energy"), "continue") : void 0;
}, s = this;
try {
for (var c = i(e.claimQueue), l = c.next(); !l.done; l = c.next()) a(l.value);
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
for (var a = i(Object.values(Game.creeps)), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = c.memory;
"claimer" === l.role && l.targetRoom === t && "claim" === l.task && (l.targetRoom = void 0, 
l.task = void 0, jr.info("Cleared target for ".concat(c.name, " due to expansion cancellation"), {
subsystem: "Expansion"
}));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
s && !s.done && (n = a.return) && n.call(a);
} finally {
if (o) throw o.error;
}
}
jr.info("Cancelled expansion to ".concat(t, ", reason: ").concat(r), {
subsystem: "Expansion"
});
}, t.prototype.removeFromClaimQueue = function(e, t) {
var r = e.claimQueue.findIndex(function(e) {
return e.roomName === t;
});
-1 !== r && e.claimQueue.splice(r, 1);
}, t.prototype.addRemoteRoom = function(e, t) {
var r = Rn.getSwarmState(e);
return r ? (r.remoteAssignments || (r.remoteAssignments = []), r.remoteAssignments.includes(t) ? (jr.warn("Remote ".concat(t, " already assigned to ").concat(e), {
subsystem: "Expansion"
}), !1) : (r.remoteAssignments.push(t), jr.info("Manually added remote ".concat(t, " to ").concat(e), {
subsystem: "Expansion"
}), !0)) : (jr.error("Cannot add remote: ".concat(e, " not found"), {
subsystem: "Expansion"
}), !1);
}, t.prototype.removeRemoteRoom = function(e, t) {
var r = Rn.getSwarmState(e);
if (!(null == r ? void 0 : r.remoteAssignments)) return !1;
var o = r.remoteAssignments.indexOf(t);
return -1 !== o && (r.remoteAssignments.splice(o, 1), jr.info("Manually removed remote ".concat(t, " from ").concat(e), {
subsystem: "Expansion"
}), !0);
}, a([ An("expansion:manager", "Expansion Manager", {
priority: e.ProcessPriority.LOW,
interval: 20,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), ga = new ya, ha = function() {
function e() {}
return e.prototype.status = function() {
var e, t, r, o, n, a, s, c, l, u, m = Rn.getEmpire(), p = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), f = (Game.gcl.progress / Game.gcl.progressTotal * 100).toFixed(1), d = Game.gcl.level - p.length, y = d > 0, g = m.objectives.expansionPaused, h = m.claimQueue.length, v = m.claimQueue.filter(function(e) {
return !e.claimed;
}).length, R = m.claimQueue.filter(function(e) {
return e.claimed;
}).length, E = Object.values(Game.creeps).filter(function(e) {
var t = e.memory;
return "claimer" === t.role && "claim" === t.task;
}), T = "=== Expansion System Status ===\n\nGCL: Level ".concat(Game.gcl.level, " (").concat(f, "% to next)\nOwned Rooms: ").concat(p.length, "/").concat(Game.gcl.level, "\nAvailable Room Slots: ").concat(d, "\n\nExpansion Status: ").concat(g ? "PAUSED ⚠" : y ? "READY ✓" : "AT GCL LIMIT", "\nClaim Queue: ").concat(h, " total (").concat(v, " unclaimed, ").concat(R, " in progress)\nActive Claimers: ").concat(E.length, "\n\n");
if (v > 0) {
T += "=== Top Expansion Candidates ===\n";
var C = m.claimQueue.filter(function(e) {
return !e.claimed;
}).slice(0, 5);
try {
for (var S = i(C), w = S.next(); !w.done; w = S.next()) {
var b = w.value, O = Game.time - b.lastEvaluated;
T += "  ".concat(b.roomName, ": Score ").concat(b.score.toFixed(0), ", Distance ").concat(b.distance, ", Age ").concat(O, " ticks\n");
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
for (var U = i(_), A = U.next(); !A.done; A = U.next()) x(b = A.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
A && !A.done && (o = U.return) && o.call(U);
} finally {
if (r) throw r.error;
}
}
T += "\n";
}
T += "=== Owned Room Distribution ===\n";
var N = new Map;
try {
for (var M = i(p), k = M.next(); !k.done; k = M.next()) {
var P = null !== (c = null === (s = k.value.controller) || void 0 === s ? void 0 : s.level) && void 0 !== c ? c : 0;
N.set(P, (null !== (l = N.get(P)) && void 0 !== l ? l : 0) + 1);
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
return Rn.getEmpire().objectives.expansionPaused = !0, "Expansion paused. Use expansion.resume() to re-enable.";
}, e.prototype.resume = function() {
return Rn.getEmpire().objectives.expansionPaused = !1, "Expansion resumed.";
}, e.prototype.addRemote = function(e, t) {
return ga.addRemoteRoom(e, t) ? "Added remote ".concat(t, " to ").concat(e) : "Failed to add remote (check logs for details)";
}, e.prototype.removeRemote = function(e, t) {
return ga.removeRemoteRoom(e, t) ? "Removed remote ".concat(t, " from ").concat(e) : "Remote ".concat(t, " not found in ").concat(e);
}, e.prototype.clearQueue = function() {
var e = Rn.getEmpire(), t = e.claimQueue.length;
return e.claimQueue = [], "Cleared ".concat(t, " candidates from claim queue. Queue will repopulate on next empire tick.");
}, a([ Uo({
name: "expansion.status",
description: "Show expansion system status, GCL progress, and claim queue",
usage: "expansion.status()",
examples: [ "expansion.status()" ],
category: "Empire"
}) ], e.prototype, "status", null), a([ Uo({
name: "expansion.pause",
description: "Pause autonomous expansion",
usage: "expansion.pause()",
examples: [ "expansion.pause()" ],
category: "Empire"
}) ], e.prototype, "pause", null), a([ Uo({
name: "expansion.resume",
description: "Resume autonomous expansion",
usage: "expansion.resume()",
examples: [ "expansion.resume()" ],
category: "Empire"
}) ], e.prototype, "resume", null), a([ Uo({
name: "expansion.addRemote",
description: "Manually add a remote room assignment",
usage: "expansion.addRemote(homeRoom, remoteRoom)",
examples: [ "expansion.addRemote('W1N1', 'W2N1')" ],
category: "Empire"
}) ], e.prototype, "addRemote", null), a([ Uo({
name: "expansion.removeRemote",
description: "Manually remove a remote room assignment",
usage: "expansion.removeRemote(homeRoom, remoteRoom)",
examples: [ "expansion.removeRemote('W1N1', 'W2N1')" ],
category: "Empire"
}) ], e.prototype, "removeRemote", null), a([ Uo({
name: "expansion.clearQueue",
description: "Clear the expansion claim queue",
usage: "expansion.clearQueue()",
examples: [ "expansion.clearQueue()" ],
category: "Empire"
}) ], e.prototype, "clearQueue", null), e;
}(), va = new ha;

function Ra(e) {
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

function Ea() {
var e;
return (null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.npcRooms) || {};
}

function Ta(e) {
var t = Memory;
t.tooangel || (t.tooangel = {}), t.tooangel.npcRooms || (t.tooangel.npcRooms = {});
var r = t.tooangel.npcRooms[e.roomName];
if (r) {
var o = new Set(c(c([], s(r.availableQuests), !1), s(e.availableQuests), !1));
e.availableQuests = Array.from(o);
}
t.tooangel.npcRooms[e.roomName] = e;
}

function Ca() {
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

function Sa() {
var e;
return (null === (e = Ca().reputation) || void 0 === e ? void 0 : e.value) || 0;
}

function wa(e) {
try {
var t = JSON.parse(e);
if ("reputation" === t.type && "number" == typeof t.reputation) return t.reputation;
} catch (e) {}
return null;
}

function ba(e) {
var t, r, o, n = Ca(), a = (null === (t = n.reputation) || void 0 === t ? void 0 : t.lastRequestedAt) || 0;
if (Game.time - a < 1e3) return jr.debug("Reputation request on cooldown (".concat(1e3 - (Game.time - a), " ticks remaining)"), {
subsystem: "TooAngel"
}), !1;
if (e) o = Game.rooms[e]; else for (var i in Game.rooms) {
var s = Game.rooms[i];
if ((null === (r = s.controller) || void 0 === r ? void 0 : r.my) && s.terminal && s.terminal.my) {
o = s;
break;
}
}
if (!o || !o.terminal || !o.terminal.my) return jr.warn("No terminal available to request reputation", {
subsystem: "TooAngel"
}), !1;
var c = function(e) {
var t = Ea(), r = null, o = 1 / 0;
for (var n in t) {
var a = Game.map.getRoomLinearDistance(e, n);
a < o && (o = a, r = t[n]);
}
return r;
}(o.name);
if (!c || !c.hasTerminal) return jr.warn("No TooAngel NPC room with terminal found", {
subsystem: "TooAngel"
}), !1;
var l = o.terminal, u = l.store[RESOURCE_ENERGY];
if (u < 100) return jr.warn("Insufficient energy for reputation request: ".concat(u, " < ").concat(100), {
subsystem: "TooAngel"
}), !1;
var m = l.send(RESOURCE_ENERGY, 100, c.roomName, JSON.stringify({
type: "reputation"
}));
return m === OK ? (jr.info("Sent reputation request to ".concat(c.roomName, " from ").concat(o.name), {
subsystem: "TooAngel"
}), n.reputation.lastRequestedAt = Game.time, !0) : (jr.warn("Failed to send reputation request: ".concat(m), {
subsystem: "TooAngel"
}), !1);
}

var Oa = {
MAX_ACTIVE_QUESTS: 3,
MIN_APPLICATION_ENERGY: 100,
DEADLINE_BUFFER: 500,
SUPPORTED_TYPES: [ "buildcs" ]
};

function _a(e) {
try {
var t = JSON.parse(e);
if ("quest" === t.type && t.id && t.room && t.quest && "number" == typeof t.end) return !t.result && t.end <= Game.time ? (jr.debug("Ignoring quest ".concat(t.id, " with past deadline: ").concat(t.end, " (current: ").concat(Game.time, ")"), {
subsystem: "TooAngel"
}), null) : t;
} catch (e) {}
return null;
}

function xa() {
return Ca().activeQuests || {};
}

function Ua() {
var e = xa();
return Object.values(e).filter(function(e) {
return "active" === e.status || "applied" === e.status;
}).length < Oa.MAX_ACTIVE_QUESTS;
}

function Aa(e) {
return Oa.SUPPORTED_TYPES.includes(e);
}

function Na(e, t, r) {
var o, n;
if (!Ua()) return jr.debug("Cannot accept more quests (at max capacity)", {
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
if (!n || !n.terminal || !n.terminal.my) return jr.warn("No terminal available to apply for quest", {
subsystem: "TooAngel"
}), !1;
var l = n.terminal, u = l.store[RESOURCE_ENERGY];
if (u < Oa.MIN_APPLICATION_ENERGY) return jr.warn("Insufficient energy for quest application: ".concat(u, " < ").concat(Oa.MIN_APPLICATION_ENERGY), {
subsystem: "TooAngel"
}), !1;
var m = {
type: "quest",
id: e,
action: "apply"
}, p = l.send(RESOURCE_ENERGY, Oa.MIN_APPLICATION_ENERGY, t, JSON.stringify(m));
return p === OK ? (jr.info("Applied for quest ".concat(e, " from ").concat(n.name, " to ").concat(t), {
subsystem: "TooAngel"
}), Ca().activeQuests[e] = {
id: e,
type: "buildcs",
status: "applied",
targetRoom: "",
originRoom: t,
deadline: 0,
appliedAt: Game.time
}, !0) : (jr.warn("Failed to apply for quest: ".concat(p), {
subsystem: "TooAngel"
}), !1);
}

function Ma(e) {
var t = Ca(), r = t.activeQuests[e.id];
r ? ("won" === e.result ? (jr.info("Quest ".concat(e.id, " completed successfully!"), {
subsystem: "TooAngel"
}), r.status = "completed") : (jr.warn("Quest ".concat(e.id, " failed"), {
subsystem: "TooAngel"
}), r.status = "failed"), r.completedAt = Game.time, t.completedQuests.includes(e.id) || t.completedQuests.push(e.id)) : jr.warn("Received completion for unknown quest: ".concat(e.id), {
subsystem: "TooAngel"
});
}

function ka(e) {
var t, r, o, n, a, s, c, l = Game.rooms[e.targetRoom];
if (l) {
if (function(e) {
var t = Game.rooms[e];
return !!t && 0 === t.find(FIND_CONSTRUCTION_SITES).length;
}(e.targetRoom)) return jr.info("Quest ".concat(e.id, " (buildcs) completed! All construction sites built in ").concat(e.targetRoom), {
subsystem: "TooAngel"
}), function(e) {
var t, r, o = function(e) {
return xa()[e] || null;
}(e);
if (!o) return jr.warn("Cannot notify completion for unknown quest: ".concat(e), {
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
r.terminal.send(RESOURCE_ENERGY, 100, o.originRoom, JSON.stringify(i)) === OK && jr.info("Notified quest completion: ".concat(e, " (").concat("won", ")"), {
subsystem: "TooAngel"
});
}(e.id), e.status = "completed", void (e.completedAt = Game.time);
var u = l.find(FIND_CONSTRUCTION_SITES);
jr.debug("Quest ".concat(e.id, " (buildcs): ").concat(u.length, " construction sites remaining in ").concat(e.targetRoom), {
subsystem: "TooAngel"
});
var m = e.assignedCreeps || [], p = [];
try {
for (var f = i(m), d = f.next(); !d.done; d = f.next()) {
var y = d.value, g = Game.creeps[y];
g && p.push(g);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
d && !d.done && (r = f.return) && r.call(f);
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
for (var E = (o = void 0, i(R)), T = E.next(); !(T.done || ((b = (w = T.value).memory).questId = e.id, 
p.push(w), m.push(w.name), jr.info("Assigned ".concat(w.name, " to quest ").concat(e.id, " (buildcs)"), {
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
for (var C = i(p), S = C.next(); !S.done; S = C.next()) {
var w, b;
(b = (w = S.value).memory).questId = e.id, b.questTarget = e.targetRoom, b.questAction = "build";
}
} catch (e) {
a = {
error: e
};
} finally {
try {
S && !S.done && (s = C.return) && s.call(C);
} finally {
if (a) throw a.error;
}
}
} else jr.debug("Cannot execute buildcs quest ".concat(e.id, ": room ").concat(e.targetRoom, " not visible"), {
subsystem: "TooAngel"
});
}

var Pa, Ia, Ga, La = function() {
function t() {
this.lastScanTick = 0, this.lastReputationRequestTick = 0, this.lastQuestDiscoveryTick = 0;
}
return t.prototype.isEnabled = function() {
var e, t;
return null === (t = null === (e = Memory.tooangel) || void 0 === e ? void 0 : e.enabled) || void 0 === t || t;
}, t.prototype.enable = function() {
var e = Memory;
e.tooangel || (e.tooangel = {}), e.tooangel.enabled = !0, jr.info("TooAngel integration enabled", {
subsystem: "TooAngel"
});
}, t.prototype.disable = function() {
var e = Memory;
e.tooangel || (e.tooangel = {}), e.tooangel.enabled = !1, jr.info("TooAngel integration disabled", {
subsystem: "TooAngel"
});
}, t.prototype.run = function() {
if (this.isEnabled() && !(Game.cpu.bucket < 2e3)) try {
!function() {
var e, t;
if (Game.market.incomingTransactions) {
var r = Ca();
try {
for (var o = i(Game.market.incomingTransactions), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (!a.order && a.description) {
var s = wa(a.description);
null !== s && (jr.info("Received reputation update from TooAngel: ".concat(s), {
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
var r = Ca();
try {
for (var o = i(Game.market.incomingTransactions), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (!a.order && a.description) {
var s = _a(a.description);
if (s) {
if (jr.info("Received quest ".concat(s.id, ": ").concat(s.quest, " in ").concat(s.room, " (deadline: ").concat(s.end, ")"), {
subsystem: "TooAngel"
}), s.result) {
Ma(s);
continue;
}
var c = r.activeQuests[s.id];
r.activeQuests[s.id] = {
id: s.id,
type: s.quest,
status: "completed" === (null == c ? void 0 : c.status) || "failed" === (null == c ? void 0 : c.status) ? c.status : "active",
targetRoom: s.room,
originRoom: s.origin || a.from,
deadline: s.end,
appliedAt: null == c ? void 0 : c.appliedAt,
receivedAt: Game.time,
assignedCreeps: []
}, Aa(s.quest) || (jr.warn("Received unsupported quest type: ".concat(s.quest), {
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
"active" === o.status && (o.deadline > 0 && Game.time > o.deadline ? (jr.warn("Quest ".concat(r, " missed deadline (").concat(o.deadline, ")"), {
subsystem: "TooAngel"
}), o.status = "failed", o.completedAt = Game.time) : "buildcs" === o.type ? ka(o) : (jr.warn("Unsupported quest type for execution: ".concat(o.type), {
subsystem: "TooAngel"
}), o.status = "failed", o.completedAt = Game.time));
}
}(), function() {
var e = Ca().activeQuests || {};
for (var t in e) {
var r = e[t];
r.deadline > 0 && Game.time >= r.deadline - Oa.DEADLINE_BUFFER && ("active" !== r.status && "applied" !== r.status || (jr.warn("Quest ".concat(t, " expired (deadline: ").concat(r.deadline, ", current: ").concat(Game.time, ")"), {
subsystem: "TooAngel"
}), r.status = "failed", r.completedAt = Game.time)), ("completed" === r.status || "failed" === r.status) && r.completedAt && Game.time - r.completedAt > 1e4 && delete e[t];
}
}(), Game.time - this.lastScanTick >= 500 && (this.scanForNPCs(), this.lastScanTick = Game.time), 
Game.time - this.lastReputationRequestTick >= 2e3 && (this.updateReputation(), this.lastReputationRequestTick = Game.time), 
Game.time - this.lastQuestDiscoveryTick >= 1e3 && (this.discoverQuests(), this.lastQuestDiscoveryTick = Game.time);
} catch (t) {
var e = "tooangel_error_".concat(Game.time % 100);
Memory[e] || (jr.error("TooAngel manager error: ".concat(t), {
subsystem: "TooAngel"
}), Memory[e] = !0);
}
}, t.prototype.scanForNPCs = function() {
var e, t, r = function() {
var e = [];
for (var t in Game.rooms) {
var r = Ra(Game.rooms[t]);
r && (jr.info("Detected TooAngel NPC room: ".concat(t), {
subsystem: "TooAngel"
}), e.push(r));
}
return e;
}();
try {
for (var o = i(r), n = o.next(); !n.done; n = o.next()) Ta(n.value);
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
r.length > 0 && jr.info("Scanned ".concat(r.length, " TooAngel NPC rooms"), {
subsystem: "TooAngel"
});
}, t.prototype.updateReputation = function() {
ba();
}, t.prototype.discoverQuests = function() {
!function() {
var e, t;
if (Ua()) {
var r = Ea(), o = xa();
for (var n in r) {
var a = r[n];
try {
for (var s = (e = void 0, i(a.availableQuests)), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (!o[l]) return jr.info("Auto-applying for quest ".concat(l, " from ").concat(n), {
subsystem: "TooAngel"
}), void Na(l, n);
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
}, t.prototype.getReputation = function() {
return Sa();
}, t.prototype.getActiveQuests = function() {
return xa();
}, t.prototype.applyForQuest = function(e, t, r) {
return Na(e, t, r);
}, t.prototype.getStatus = function() {
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
}, a([ Nn("empire:tooangel", "TooAngel Manager", {
priority: e.ProcessPriority.LOW,
interval: 10
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Da = new La, Fa = {
status: function() {
return Da.getStatus();
},
enable: function() {
return Da.enable(), "TooAngel integration enabled";
},
disable: function() {
return Da.disable(), "TooAngel integration disabled";
},
reputation: function() {
var e = Sa();
return "Current TooAngel reputation: ".concat(e);
},
requestReputation: function(e) {
return ba(e) ? "Reputation request sent".concat(e ? " from ".concat(e) : "") : "Failed to send reputation request (check logs for details)";
},
quests: function() {
var e, t = xa(), r = [ "Active Quests:" ];
if (0 === Object.keys(t).length) r.push("  No active quests"); else for (var o in t) {
var n = t[o], a = n.deadline - Game.time, i = (null === (e = n.assignedCreeps) || void 0 === e ? void 0 : e.length) || 0;
r.push("  ".concat(o, ":")), r.push("    Type: ".concat(n.type)), r.push("    Target: ".concat(n.targetRoom)), 
r.push("    Status: ".concat(n.status)), r.push("    Time left: ".concat(a, " ticks")), 
r.push("    Assigned creeps: ".concat(i));
}
return r.join("\n");
},
npcs: function() {
var e = Ea(), t = [ "TooAngel NPC Rooms:" ];
if (0 === Object.keys(e).length) t.push("  No NPC rooms discovered"); else for (var r in e) {
var o = e[r];
t.push("  ".concat(r, ":")), t.push("    Has terminal: ".concat(o.hasTerminal)), 
t.push("    Available quests: ".concat(o.availableQuests.length)), t.push("    Last seen: ".concat(Game.time - o.lastSeen, " ticks ago"));
}
return t.join("\n");
},
apply: function(e, t, r) {
return Na(e, t, r) ? "Applied for quest ".concat(e).concat(r ? " from ".concat(r) : "") : "Failed to apply for quest (check logs for details)";
},
help: function() {
return [ "TooAngel Console Commands:", "", "  tooangel.status()                    - Show current status", "  tooangel.enable()                    - Enable integration", "  tooangel.disable()                   - Disable integration", "  tooangel.reputation()                - Get current reputation", "  tooangel.requestReputation(fromRoom) - Request reputation update", "  tooangel.quests()                    - List active quests", "  tooangel.npcs()                      - List discovered NPC rooms", "  tooangel.apply(id, origin, fromRoom) - Apply for a quest", "  tooangel.help()                      - Show this help" ].join("\n");
}
}, Ba = function() {
function e() {}
return e.prototype.status = function() {
var e = tn.checkMemoryUsage(), t = e.breakdown, r = "Memory Status: ".concat(e.status.toUpperCase(), "\n");
return r += "Usage: ".concat(tn.formatBytes(e.used), " / ").concat(tn.formatBytes(e.limit), " (").concat((100 * e.percentage).toFixed(1), "%)\n\n"), 
r += "Breakdown:\n", r += "  Empire:        ".concat(tn.formatBytes(t.empire), " (").concat((t.empire / t.total * 100).toFixed(1), "%)\n"), 
r += "  Rooms:         ".concat(tn.formatBytes(t.rooms), " (").concat((t.rooms / t.total * 100).toFixed(1), "%)\n"), 
r += "  Creeps:        ".concat(tn.formatBytes(t.creeps), " (").concat((t.creeps / t.total * 100).toFixed(1), "%)\n"), 
r += "  Clusters:      ".concat(tn.formatBytes(t.clusters), " (").concat((t.clusters / t.total * 100).toFixed(1), "%)\n"), 
(r += "  SS2 Queue:     ".concat(tn.formatBytes(t.ss2PacketQueue), " (").concat((t.ss2PacketQueue / t.total * 100).toFixed(1), "%)\n")) + "  Other:         ".concat(tn.formatBytes(t.other), " (").concat((t.other / t.total * 100).toFixed(1), "%)\n");
}, e.prototype.analyze = function(e) {
void 0 === e && (e = 10);
var t = tn.getLargestConsumers(e), r = nn.getRecommendations(), o = "Top ".concat(e, " Memory Consumers:\n");
return t.forEach(function(e, t) {
o += "".concat(t + 1, ". ").concat(e.type, ":").concat(e.name, " - ").concat(tn.formatBytes(e.size), "\n");
}), r.length > 0 ? (o += "\nRecommendations:\n", r.forEach(function(e) {
o += "- ".concat(e, "\n");
})) : o += "\nNo recommendations at this time.\n", o;
}, e.prototype.prune = function() {
var e = nn.pruneAll(), t = "Memory Pruning Complete:\n";
return t += "  Dead creeps removed:        ".concat(e.deadCreeps, "\n"), t += "  Event log entries removed:  ".concat(e.eventLogs, "\n"), 
t += "  Stale intel removed:        ".concat(e.staleIntel, "\n"), (t += "  Market history removed:     ".concat(e.marketHistory, "\n")) + "  Total bytes saved:          ".concat(tn.formatBytes(e.bytesSaved), "\n");
}, e.prototype.segments = function() {
var e, t, r = cn.getActiveSegments(), o = "Memory Segments:\n\n";
o += "Active segments: ".concat(r.length, "/10\n"), r.length > 0 && (o += "  Loaded: [".concat(r.join(", "), "]\n\n")), 
o += "Allocation Strategy:\n";
var n = function(e, t) {
o += "  ".concat(e.padEnd(20), " ").concat(t.start.toString().padStart(2), "-").concat(t.end.toString().padEnd(2));
var n = r.filter(function(e) {
return e >= t.start && e <= t.end;
});
if (n.length > 0) {
var a = n.map(function(e) {
var t = cn.getSegmentSize(e);
return "".concat(e, ":").concat(tn.formatBytes(t));
});
o += " [".concat(a.join(", "), "]");
}
o += "\n";
};
try {
for (var a = i(Object.entries(an)), c = a.next(); !c.done; c = a.next()) {
var l = s(c.value, 2);
n(l[0], l[1]);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.compress = function(e) {
var t, r, o = e.split("."), n = Memory;
try {
for (var a = i(o), s = a.next(); !s.done; s = a.next()) {
var c = s.value;
if (!n || "object" != typeof n || !(c in n)) return "Path not found: ".concat(e);
n = n[c];
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
if (!n) return "No data at path: ".concat(e);
var l = pn.getCompressionStats(n), u = "Compression Test for: ".concat(e, "\n");
return u += "  Original size:    ".concat(tn.formatBytes(l.originalSize), "\n"), 
u += "  Compressed size:  ".concat(tn.formatBytes(l.compressedSize), "\n"), u += "  Bytes saved:      ".concat(tn.formatBytes(l.bytesSaved), "\n"), 
(u += "  Compression ratio: ".concat((100 * l.ratio).toFixed(1), "%\n")) + "  Worth compressing: ".concat(l.ratio < .9 ? "YES" : "NO", "\n");
}, e.prototype.migrations = function() {
var e = yn.getCurrentVersion(), t = yn.getLatestVersion(), r = yn.getPendingMigrations(), o = "Memory Migration Status:\n";
return o += "  Current version: ".concat(e, "\n"), o += "  Latest version:  ".concat(t, "\n"), 
o += "  Status: ".concat(r.length > 0 ? "PENDING" : "UP TO DATE", "\n\n"), r.length > 0 && (o += "Pending Migrations:\n", 
r.forEach(function(e) {
o += "  v".concat(e.version, ": ").concat(e.description, "\n");
}), o += "\nMigrations will run automatically on next tick.\n"), o;
}, e.prototype.migrate = function() {
var e = yn.getCurrentVersion();
yn.runMigrations();
var t = yn.getCurrentVersion();
return t > e ? "Migrated from v".concat(e, " to v").concat(t) : "No migrations needed (current: v".concat(t, ")");
}, e.prototype.reset = function(e) {
if ("CONFIRM" !== e) return "WARNING: This will clear ALL memory!\nTo confirm, use: memory.reset('CONFIRM')";
var t = Memory;
for (var r in t) delete t[r];
for (var o = 0; o < 100; o++) RawMemory.segments[o] = "";
return Rn.initialize(), "Memory reset complete. All data cleared (main memory + 100 segments).";
}, a([ Uo({
name: "memory.status",
description: "Show current memory usage and status",
usage: "memory.status()",
examples: [ "memory.status()" ],
category: "Memory"
}) ], e.prototype, "status", null), a([ Uo({
name: "memory.analyze",
description: "Analyze memory usage and show largest consumers",
usage: "memory.analyze([topN])",
examples: [ "memory.analyze()", "memory.analyze(20)" ],
category: "Memory"
}) ], e.prototype, "analyze", null), a([ Uo({
name: "memory.prune",
description: "Manually trigger memory pruning to clean stale data",
usage: "memory.prune()",
examples: [ "memory.prune()" ],
category: "Memory"
}) ], e.prototype, "prune", null), a([ Uo({
name: "memory.segments",
description: "Show memory segment allocation and usage",
usage: "memory.segments()",
examples: [ "memory.segments()" ],
category: "Memory"
}) ], e.prototype, "segments", null), a([ Uo({
name: "memory.compress",
description: "Test compression on a memory path",
usage: "memory.compress(path)",
examples: [ "memory.compress('empire.knownRooms')" ],
category: "Memory"
}) ], e.prototype, "compress", null), a([ Uo({
name: "memory.migrations",
description: "Show migration status and pending migrations",
usage: "memory.migrations()",
examples: [ "memory.migrations()" ],
category: "Memory"
}) ], e.prototype, "migrations", null), a([ Uo({
name: "memory.migrate",
description: "Manually trigger memory migrations",
usage: "memory.migrate()",
examples: [ "memory.migrate()" ],
category: "Memory"
}) ], e.prototype, "migrate", null), a([ Uo({
name: "memory.reset",
description: "Clear all memory (DANGEROUS - requires confirmation)",
usage: "memory.reset('CONFIRM')",
examples: [ "memory.reset('CONFIRM')" ],
category: "Memory"
}) ], e.prototype, "reset", null), e;
}(), Ha = new Ba;

function Wa(e, t, r, o) {
var n = o instanceof Error ? o.message : String(o);
console.log("[SafeFind] WARN: SafeFind error in ".concat(e, "(").concat(String(t), ") at ").concat(r, ": ").concat(n));
}

function Ya(e, t, r) {
try {
return e.find(t, r);
} catch (r) {
return Wa("room.find", t, e.name, r), [];
}
}

function Ka(e, t, r) {
try {
return e.findClosestByRange(t, r);
} catch (r) {
return Wa("pos.findClosestByRange", t, "".concat(e.roomName, ":").concat(String(e.x), ",").concat(String(e.y)), r), 
null;
}
}

(Pa = {})[FIND_SOURCES] = 5e3, Pa[FIND_MINERALS] = 5e3, Pa[FIND_DEPOSITS] = 100, 
Pa[FIND_STRUCTURES] = 50, Pa[FIND_MY_STRUCTURES] = 50, Pa[FIND_HOSTILE_STRUCTURES] = 20, 
Pa[FIND_MY_SPAWNS] = 100, Pa[FIND_MY_CONSTRUCTION_SITES] = 20, Pa[FIND_CONSTRUCTION_SITES] = 20, 
Pa[FIND_CREEPS] = 5, Pa[FIND_MY_CREEPS] = 5, Pa[FIND_HOSTILE_CREEPS] = 3, Pa[FIND_DROPPED_RESOURCES] = 5, 
Pa[FIND_TOMBSTONES] = 10, Pa[FIND_RUINS] = 10, Pa[FIND_FLAGS] = 50, Pa[FIND_NUKES] = 20, 
Pa[FIND_POWER_CREEPS] = 10, Pa[FIND_MY_POWER_CREEPS] = 10, function(e) {
e[e.CRITICAL = 0] = "CRITICAL", e[e.HIGH = 1] = "HIGH", e[e.MEDIUM = 2] = "MEDIUM", 
e[e.LOW = 3] = "LOW";
}(Ga || (Ga = {}));

var ja, Va = {
bucketThresholds: (Ia = {}, Ia[Ga.CRITICAL] = 0, Ia[Ga.HIGH] = 2e3, Ia[Ga.MEDIUM] = 5e3, 
Ia[Ga.LOW] = 8e3, Ia),
defaultMaxCpu: 5,
logExecution: !1
}, qa = function() {
function e(e) {
var t;
this.tasks = new Map, this.stats = {
totalTasks: 0,
tasksByPriority: (t = {}, t[Ga.CRITICAL] = 0, t[Ga.HIGH] = 0, t[Ga.MEDIUM] = 0, 
t[Ga.LOW] = 0, t),
executedThisTick: 0,
skippedThisTick: 0,
deferredThisTick: 0,
cpuUsed: 0
}, this.config = n(n({}, Va), e);
}
return e.prototype.register = function(e) {
var t, r, o = n(n({}, e), {
lastRun: Game.time - e.interval,
maxCpu: null !== (t = e.maxCpu) && void 0 !== t ? t : this.config.defaultMaxCpu,
skippable: null === (r = e.skippable) || void 0 === r || r
});
this.tasks.set(e.id, o), this.updateStats();
}, e.prototype.unregister = function(e) {
this.tasks.delete(e), this.updateStats();
}, e.prototype.run = function(e) {
var t, r, o, a = Game.cpu.getUsed(), s = Game.cpu.bucket, c = null != e ? e : 1 / 0;
this.stats.executedThisTick = 0, this.stats.skippedThisTick = 0, this.stats.deferredThisTick = 0;
var l = Array.from(this.tasks.values()).sort(function(e, t) {
return e.priority - t.priority;
}), u = 0;
try {
for (var m = i(l), p = m.next(); !p.done; p = m.next()) {
var f = p.value;
if (!(Game.time - f.lastRun < f.interval)) {
if (f.priority !== Ga.CRITICAL && s < this.config.bucketThresholds[f.priority]) {
this.stats.skippedThisTick++;
continue;
}
var d = null !== (o = f.maxCpu) && void 0 !== o ? o : this.config.defaultMaxCpu;
if (u + d > c && f.skippable) this.stats.deferredThisTick++; else {
var y = Game.cpu.getUsed();
try {
f.execute(), f.lastRun = Game.time, this.stats.executedThisTick++;
var g = Game.cpu.getUsed() - y;
u += g, g > d && console.log("[Scheduler] WARN: Task ".concat(f.id, " exceeded CPU budget: ").concat(g.toFixed(2), " > ").concat(d));
} catch (e) {
console.log("[Scheduler] ERROR: Error executing task ".concat(f.id, ": ").concat(String(e))), 
f.lastRun = Game.time;
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
return this.stats.cpuUsed = Game.cpu.getUsed() - a, n({}, this.stats);
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
return n({}, this.stats);
}, e.prototype.getTasks = function() {
return Array.from(this.tasks.values());
}, e.prototype.hasTask = function(e) {
return this.tasks.has(e);
}, e.prototype.clear = function() {
this.tasks.clear(), this.updateStats();
}, e.prototype.updateStats = function() {
var e, t, r;
this.stats.totalTasks = this.tasks.size, this.stats.tasksByPriority = ((e = {})[Ga.CRITICAL] = 0, 
e[Ga.HIGH] = 0, e[Ga.MEDIUM] = 0, e[Ga.LOW] = 0, e);
try {
for (var o = i(this.tasks.values()), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
this.stats.tasksByPriority[a.priority]++;
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
}(), za = ((ja = global)._computationScheduler || (ja._computationScheduler = new qa), 
ja._computationScheduler), Xa = new Map;

function Qa(e) {
var t = Xa.get(e);
return t && t.tick === Game.time || (t = {
assignments: new Map,
tick: Game.time
}, Xa.set(e, t)), t;
}

function Za(e, t, r) {
var o, n;
if (0 === t.length) return null;
if (1 === t.length) return $a(e, t[0], r), t[0];
var a = Qa(e.room.name), s = null, c = 1 / 0, l = 1 / 0;
try {
for (var u = i(t), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = "".concat(r, ":").concat(p.id), d = (a.assignments.get(f) || []).length, y = e.pos.getRangeTo(p.pos);
(d < c || d === c && y < l) && (s = p, c = d, l = y);
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
return s && $a(e, s, r), s;
}

function $a(e, t, r) {
var o = Qa(e.room.name), n = "".concat(r, ":").concat(t.id), a = o.assignments.get(n) || [];
a.includes(e.name) || (a.push(e.name), o.assignments.set(n, a));
}

var Ja = {
red: "#ef9a9a",
green: "#6b9955",
yellow: "#c5c599",
blue: "#8dc5e3"
};

function ei(e, t, r) {
void 0 === t && (t = null), void 0 === r && (r = !1);
var o = t ? "color: ".concat(Ja[t], ";") : "";
return '<text style="'.concat([ o, r ? "font-weight: bolder;" : "" ].join(" "), '">').concat(e, "</text>");
}

var ti = {
customStyle: function() {
return "<style>\n      input {\n        background-color: #2b2b2b;\n        border: none;\n        border-bottom: 1px solid #888;\n        padding: 3px;\n        color: #ccc;\n      }\n      select {\n        border: none;\n        background-color: #2b2b2b;\n        color: #ccc;\n      }\n      button {\n        border: 1px solid #888;\n        cursor: pointer;\n        background-color: #2b2b2b;\n        color: #ccc;\n      }\n    </style>".replace(/\n/g, "");
},
input: function(e) {
return "".concat(e.label || "", ' <input name="').concat(e.name, '" placeholder="').concat(e.placeholder || "", '"/>');
},
select: function(e) {
var t = [ "".concat(e.label || "", ' <select name="').concat(e.name, '">') ];
return t.push.apply(t, c([], s(e.options.map(function(e) {
return ' <option value="'.concat(e.value, '">').concat(e.label, "</option>");
})), !1)), t.push("</select>"), t.join("");
},
button: function(e) {
return '<button onclick="'.concat((t = e.command, "angular.element(document.body).injector().get('Console').sendCommand('(".concat(t, ")()', 1)")), '">').concat(e.content, "</button>");
var t;
},
form: function(e, t, r) {
var o = this, n = e + Game.time.toString(), a = [ this.customStyle(), "<form name='".concat(n, "'>") ];
a.push.apply(a, c([], s(t.map(function(e) {
switch (e.type) {
case "input":
return o.input(e) + "    ";

case "select":
return o.select(e) + "    ";
}
})), !1));
var i = "(() => {\n      const form = document.forms['".concat(n, "']\n      let formDatas = {}\n      [").concat(t.map(function(e) {
return "'".concat(e.name, "'");
}).toString(), "].map(eleName => formDatas[eleName] = form[eleName].value)\n      angular.element(document.body).injector().get('Console').sendCommand(`(").concat(r.command, ")(${JSON.stringify(formDatas)})`, 1)\n    })()");
return a.push('<button type="button" onclick="'.concat(i.replace(/\n/g, ";"), '">').concat(r.content, "</button>")), 
a.push("</form>"), a.join("");
}
};

function ri() {
for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
return ai() + ii() + '<div class="module-help">'.concat(e.map(oi).join(""), "</div>");
}

var oi = function(e) {
var t = e.api.map(ni).join("");
return '<div class="module-container">\n    <div class="module-info">\n      <span class="module-title">'.concat(ei(e.name, "yellow"), '</span>\n      <span class="module-describe">').concat(ei(e.describe, "green"), '</span>\n    </div>\n    <div class="module-api-list">').concat(t, "</div>\n  </div>").replace(/\n/g, "");
}, ni = function(e) {
var t = [];
e.describe && t.push(ei(e.describe, "green")), e.params && t.push(e.params.map(function(e) {
return "  - ".concat(ei(e.name, "blue"), ": ").concat(ei(e.desc, "green"));
}).map(function(e) {
return '<div class="api-content-line">'.concat(e, "</div>");
}).join(""));
var r = e.params ? e.params.map(function(e) {
return ei(e.name, "blue");
}).join(", ") : "", o = ei(e.functionName, "yellow") + (e.commandType ? "" : "(".concat(r, ")"));
t.push(o);
var n = t.map(function(e) {
return '<div class="api-content-line">'.concat(e, "</div>");
}).join(""), a = "".concat(e.functionName).concat(Game.time);
return '\n  <div class="api-container">\n    <label for="'.concat(a, '">').concat(e.title, " ").concat(ei(e.functionName, "yellow", !0), '</label>\n    <input id="').concat(a, '" type="checkbox" />\n    <div class="api-content">').concat(n, "</div>\n  </div>\n  ").replace(/\n/g, "");
}, ai = function() {
return "\n  <style>\n  .module-help {\n    display: flex;\n    flex-flow: column nowrap;\n  }\n  .module-container {\n    padding: 0px 10px 10px 10px;\n    display: flex;\n    flex-flow: column nowrap;\n  }\n  .module-info {\n    margin: 5px;\n    display: flex;\n    flex-flow: row nowrap;\n    align-items: baseline;\n  }\n  .module-title {\n    font-size: 19px;\n    font-weight: bolder;\n    margin-left: -15px;\n  }\n  .module-api-list {\n    display: flex;\n    flex-flow: row wrap;\n  }\n  </style>".replace(/\n/g, "");
}, ii = function() {
return "\n  <style>\n  .api-content-line {\n    width: max-content;\n    padding-right: 15px;\n  }\n  .api-container {\n    margin: 5px;\n    width: 250px;\n    background-color: #2b2b2b;\n    overflow: hidden;\n    display: flex;\n    flex-flow: column;\n  }\n\n  .api-container label {\n    transition: all 0.1s;\n    min-width: 300px;\n  }\n\n  /* Hide checkbox */\n  .api-container input {\n    display: none;\n  }\n\n  .api-container label {\n    cursor: pointer;\n    display: block;\n    padding: 10px;\n    background-color: #3b3b3b;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n\n  .api-container label:hover, label:focus {\n    background-color: #525252;\n  }\n\n  /* Collapsed state */\n  .api-container input + .api-content {\n    overflow: hidden;\n    transition: all 0.1s;\n    width: auto;\n    max-height: 0px;\n    padding: 0px 10px;\n  }\n\n  /* Expanded state when checkbox is checked */\n  .api-container input:checked + .api-content {\n    max-height: 200px;\n    padding: 10px;\n    background-color: #1c1c1c;\n    overflow-x: auto;\n  }\n  </style>".replace(/\n/g, "");
};

function si(e) {
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
var t = xo.getCommandsByCategory(), r = t.get(e);
if (!r || 0 === r.length) return 'Category "'.concat(e, '" not found. Available categories: ').concat(Array.from(t.keys()).join(", "));
var o = r.map(function(e) {
var t, r;
return {
title: e.metadata.description,
describe: null === (t = e.metadata.examples) || void 0 === t ? void 0 : t[0],
functionName: e.metadata.name,
commandType: !(null === (r = e.metadata.usage) || void 0 === r ? void 0 : r.includes("(")),
params: e.metadata.usage ? si(e.metadata.usage) : void 0
};
});
return ri({
name: e,
describe: "".concat(e, " commands"),
api: o
});
}(e) : function() {
var e, t, r = xo.getCommandsByCategory(), o = [];
try {
for (var n = i(r), a = n.next(); !a.done; a = n.next()) {
var l = s(a.value, 2), u = l[0], m = l[1].map(function(e) {
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
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return ri.apply(void 0, c([], s(o), !1));
}();
}, e.prototype.spawnForm = function(e) {
return Game.rooms[e] ? ti.form("spawnCreep", [ {
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
}) : ei("Room ".concat(e, " not found or not visible"), "red", !0);
}, e.prototype.roomControl = function(e) {
var t = Game.rooms[e];
if (!t) return ei("Room ".concat(e, " not found or not visible"), "red", !0);
var r = '<div style="background: #2b2b2b; padding: 10px; margin: 5px;">';
return r += '<h3 style="color: #c5c599; margin: 0 0 10px 0;">Room Control: '.concat(e, "</h3>"), 
r += '<div style="margin-bottom: 10px;">', r += ei("Energy: ".concat(t.energyAvailable, "/").concat(t.energyCapacityAvailable), "green") + "<br>", 
t.controller && (r += ei("Controller Level: ".concat(t.controller.level, " (").concat(t.controller.progress, "/").concat(t.controller.progressTotal, ")"), "blue") + "<br>"), 
r += "</div>", r += ti.button({
content: "🔄 Toggle Visualizations",
command: "() => {\n        const config = global.botConfig.getConfig();\n        global.botConfig.updateConfig({visualizations: !config.visualizations});\n        return 'Visualizations: ' + (!config.visualizations ? 'ON' : 'OFF');\n      }"
}), r += " ", (r += ti.button({
content: "📊 Room Stats",
command: "() => {\n        const room = Game.rooms['".concat(e, "'];\n        if (!room) return 'Room not found';\n        let stats = '=== Room Stats ===\\n';\n        stats += 'Energy: ' + room.energyAvailable + '/' + room.energyCapacityAvailable + '\\n';\n        stats += 'Creeps: ' + Object.values(Game.creeps).filter(c => c.room.name === '").concat(e, "').length + '\\n';\n        if (room.controller) {\n          stats += 'RCL: ' + room.controller.level + '\\n';\n          stats += 'Progress: ' + room.controller.progress + '/' + room.controller.progressTotal + '\\n';\n        }\n        return stats;\n      }")
})) + "</div>";
}, e.prototype.logForm = function() {
return ti.form("configureLogging", [ {
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
return ti.form("configureVisualization", [ {
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
e += ti.button({
content: "🚨 Emergency Mode",
command: "() => {\n        const config = global.botConfig.getConfig();\n        global.botConfig.updateConfig({emergencyMode: !config.emergencyMode});\n        return 'Emergency Mode: ' + (!config.emergencyMode ? 'ON' : 'OFF');\n      }"
}), e += " ", e += ti.button({
content: "🐛 Toggle Debug",
command: "() => {\n        const config = global.botConfig.getConfig();\n        const newValue = !config.debug;\n        global.botConfig.updateConfig({debug: newValue});\n        global.botLogger.configureLogger({level: newValue ? 0 : 1});\n        return 'Debug mode: ' + (newValue ? 'ON' : 'OFF');\n      }"
}), e += " ", (e += ti.button({
content: "🗑️ Clear Cache",
command: "() => {\n        global.botCacheManager.clear();\n        return 'Cache cleared successfully';\n      }"
})) + "</div>";
}, e.prototype.colorDemo = function() {
var e = "=== Console Color Demo ===\n\n";
return e += ei("✓ Success message", "green", !0) + "\n", e += ei("⚠ Warning message", "yellow", !0) + "\n", 
e += ei("✗ Error message", "red", !0) + "\n", e += ei("ℹ Info message", "blue", !0) + "\n", 
(e += "\nNormal text: " + ei("colored text", "green") + " normal text\n") + "Bold text: " + ei("important", null, !0) + "\n";
}, a([ Uo({
name: "uiHelp",
description: "Show interactive help interface with expandable sections",
usage: "uiHelp()",
examples: [ "uiHelp()", 'uiHelp("Logging")', 'uiHelp("Visualization")' ],
category: "System"
}) ], e.prototype, "uiHelp", null), a([ Uo({
name: "spawnForm",
description: "Show interactive form for spawning creeps",
usage: "spawnForm(roomName)",
examples: [ 'spawnForm("W1N1")', 'spawnForm("E2S3")' ],
category: "Spawning"
}) ], e.prototype, "spawnForm", null), a([ Uo({
name: "roomControl",
description: "Show interactive room control panel",
usage: "roomControl(roomName)",
examples: [ 'roomControl("W1N1")' ],
category: "Room Management"
}) ], e.prototype, "roomControl", null), a([ Uo({
name: "logForm",
description: "Show interactive form for configuring logging",
usage: "logForm()",
examples: [ "logForm()" ],
category: "Logging"
}) ], e.prototype, "logForm", null), a([ Uo({
name: "visForm",
description: "Show interactive form for visualization settings",
usage: "visForm()",
examples: [ "visForm()" ],
category: "Visualization"
}) ], e.prototype, "visForm", null), a([ Uo({
name: "quickActions",
description: "Show quick action buttons for common operations",
usage: "quickActions()",
examples: [ "quickActions()" ],
category: "System"
}) ], e.prototype, "quickActions", null), a([ Uo({
name: "colorDemo",
description: "Show color demonstration for console output",
usage: "colorDemo()",
examples: [ "colorDemo()" ],
category: "System"
}) ], e.prototype, "colorDemo", null);
}();

var ci, li = function() {
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
for (var n = i(r.entries), a = n.next(); !a.done; a = n.next()) {
var c = s(a.value, 2), l = c[0], u = c[1];
void 0 !== u.ttl && -1 !== u.ttl && Game.time - u.cachedAt > u.ttl && (r.entries.delete(l), 
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
}(), ui = function() {
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
var t, r, o, n, a = this.getMemory(), c = [];
try {
for (var l = i(Object.entries(a.data)), u = l.next(); !u.done; u = l.next()) {
var m = s(u.value, 2), p = m[0], f = m[1];
void 0 !== f.ttl && -1 !== f.ttl && Game.time - f.cachedAt > f.ttl ? c.push(p) : e.entries.set(p, {
value: f.value,
cachedAt: f.cachedAt,
lastAccessed: Game.time,
ttl: f.ttl,
hits: f.hits,
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
for (var d = i(c), y = d.next(); !y.done; y = d.next()) p = y.value, delete a.data[p];
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
}, e.prototype.get = function(e) {
var t = this.getHeap().entries.get(e);
if (t) return t.lastAccessed !== Game.time && (t.lastAccessed = Game.time, t.dirty = !0), 
t;
}, e.prototype.set = function(e, t) {
this.getHeap().entries.set(e, n(n({}, t), {
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
var e, t, r, o, n = this.getHeap(), a = this.getMemory(), c = 0;
try {
for (var l = i(n.entries), u = l.next(); !u.done; u = l.next()) {
var m = s(u.value, 2), p = m[0], f = m[1];
void 0 !== f.ttl && -1 !== f.ttl && Game.time - f.cachedAt > f.ttl && (n.entries.delete(p), 
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
for (var d = i(Object.entries(a.data)), y = d.next(); !y.done; y = d.next()) {
var g = s(y.value, 2), h = (p = g[0], g[1]);
void 0 !== h.ttl && -1 !== h.ttl && Game.time - h.cachedAt > h.ttl && (delete a.data[p], 
c++);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = d.return) && o.call(d);
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
for (var a = i(r.entries), c = a.next(); !c.done; c = a.next()) {
var l = s(c.value, 2), u = l[0], m = l[1];
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
c && !c.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o.lastSync = Game.time, this.lastPersistTick = Game.time, n;
}, e.CACHE_VERSION = 1, e;
}(), mi = function() {
function e(e) {
void 0 === e && (e = "heap"), this.stores = new Map, this.stats = new Map, this.defaultStore = e;
}
return e.prototype.getStore = function(e, t) {
var r = null != t ? t : this.defaultStore, o = "".concat(e, ":").concat(r), n = this.stores.get(o);
return n || (n = "memory" === r ? new ui(e) : new li(e), this.stores.set(o, n)), 
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
var r = "".concat(t, ":heap"), o = "".concat(t, ":memory"), n = this.makeKey(t, e), a = !1, i = this.stores.get(r);
i && (a = i.delete(n) || a);
var s = this.stores.get(o);
return s && (a = s.delete(n) || a), a;
}, e.prototype.invalidatePattern = function(e, t) {
var r, o, n, a;
void 0 === t && (t = "default");
var s = "".concat(t, ":heap"), c = "".concat(t, ":memory"), l = 0, u = [ this.stores.get(s), this.stores.get(c) ].filter(Boolean);
try {
for (var m = i(u), p = m.next(); !p.done; p = m.next()) {
var f = p.value;
if (f) {
var d = f.keys();
try {
for (var y = (n = void 0, i(d)), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = h.indexOf(":");
if (-1 !== v) {
var R = h.substring(v + 1);
e.test(R) && (f.delete(h), l++);
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
g && !g.done && (a = y.return) && a.call(y);
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
p && !p.done && (o = m.return) && o.call(m);
} finally {
if (r) throw r.error;
}
}
return l;
}, e.prototype.clear = function(e) {
var t, r, o, n;
if (e) {
var a = "".concat(e, ":heap"), s = "".concat(e, ":memory");
null === (o = this.stores.get(a)) || void 0 === o || o.clear(), null === (n = this.stores.get(s)) || void 0 === n || n.clear(), 
this.stats.delete(e);
} else {
try {
for (var c = i(this.stores.values()), l = c.next(); !l.done; l = c.next()) l.value.clear();
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
this.stats.clear();
}
}, e.prototype.getCacheStats = function(e) {
var t, r, o, n, a, s, c, l;
if (e) {
var u = this.getStats(e), m = "".concat(e, ":heap"), p = "".concat(e, ":memory"), f = null !== (s = null === (a = this.stores.get(m)) || void 0 === a ? void 0 : a.size()) && void 0 !== s ? s : 0, d = null !== (l = null === (c = this.stores.get(p)) || void 0 === c ? void 0 : c.size()) && void 0 !== l ? l : 0, y = (g = u.hits + u.misses) > 0 ? u.hits / g : 0;
return {
hits: u.hits,
misses: u.misses,
hitRate: y,
size: f + d,
evictions: u.evictions
};
}
var g, h = 0, v = 0, R = 0, E = 0;
try {
for (var T = i(this.stats.values()), C = T.next(); !C.done; C = T.next()) h += (u = C.value).hits, 
v += u.misses, R += u.evictions;
} catch (e) {
t = {
error: e
};
} finally {
try {
C && !C.done && (r = T.return) && r.call(T);
} finally {
if (t) throw t.error;
}
}
try {
for (var S = i(this.stores.values()), w = S.next(); !w.done; w = S.next()) E += w.value.size();
} catch (e) {
o = {
error: e
};
} finally {
try {
w && !w.done && (n = S.return) && n.call(S);
} finally {
if (o) throw o.error;
}
}
return {
hits: h,
misses: v,
hitRate: y = (g = h + v) > 0 ? h / g : 0,
size: E,
evictions: R
};
}, e.prototype.evictLRU = function(e, t) {
var r, o, n = t.keys();
if (0 !== n.length) {
var a = null, s = 1 / 0;
try {
for (var c = i(n), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = t.get(u);
m && m.lastAccessed < s && (s = m.lastAccessed, a = u);
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
a && t.delete(a);
}
}, e.prototype.cleanup = function() {
var e, t, r = 0;
try {
for (var o = i(this.stores.values()), n = o.next(); !n.done; n = o.next()) {
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
for (var o = i(this.stores.values()), n = o.next(); !n.done; n = o.next()) {
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
}(), pi = new mi("heap");

!function(e) {
e.L1 = "L1", e.L2 = "L2", e.L3 = "L3";
}(ci || (ci = {}));

var fi, di = "object", yi = "path";

function gi(e, t) {
return "".concat(e.roomName, ":").concat(e.x, ",").concat(e.y, ":").concat(t.roomName, ":").concat(t.x, ",").concat(t.y);
}

function hi(e, t, r, o) {
void 0 === o && (o = {});
var n = gi(e, t), a = Room.serializePath(r);
pi.set(n, a, {
namespace: yi,
ttl: o.ttl,
maxSize: 1e3
});
}

var vi = "roomFind";

(fi = {})[FIND_SOURCES] = 5e3, fi[FIND_MINERALS] = 5e3, fi[FIND_DEPOSITS] = 100, 
fi[FIND_STRUCTURES] = 50, fi[FIND_MY_STRUCTURES] = 50, fi[FIND_HOSTILE_STRUCTURES] = 20, 
fi[FIND_MY_SPAWNS] = 100, fi[FIND_MY_CONSTRUCTION_SITES] = 20, fi[FIND_CONSTRUCTION_SITES] = 20, 
fi[FIND_CREEPS] = 5, fi[FIND_MY_CREEPS] = 5, fi[FIND_HOSTILE_CREEPS] = 3, fi[FIND_DROPPED_RESOURCES] = 5, 
fi[FIND_TOMBSTONES] = 10, fi[FIND_RUINS] = 10, fi[FIND_FLAGS] = 50, fi[FIND_NUKES] = 20, 
fi[FIND_POWER_CREEPS] = 10, fi[FIND_MY_POWER_CREEPS] = 10;

var Ri, Ei, Ti, Ci, Si = function() {
function e() {}
return e.prototype.setLogLevel = function(e) {
var t = {
debug: ao.DEBUG,
info: ao.INFO,
warn: ao.WARN,
error: ao.ERROR,
none: ao.NONE
}[e.toLowerCase()];
return void 0 === t ? "Invalid log level: ".concat(e, ". Valid levels: debug, info, warn, error, none") : (uo({
level: t
}), "Log level set to: ".concat(e.toUpperCase()));
}, e.prototype.toggleDebug = function() {
var e = !Cn().debug;
return Sn({
debug: e
}), uo({
level: e ? ao.DEBUG : ao.INFO
}), "Debug mode: ".concat(e ? "ENABLED" : "DISABLED", " (Log level: ").concat(e ? "DEBUG" : "INFO", ")");
}, a([ Uo({
name: "setLogLevel",
description: "Set the log level for the bot",
usage: "setLogLevel(level)",
examples: [ "setLogLevel('debug')", "setLogLevel('info')", "setLogLevel('warn')", "setLogLevel('error')", "setLogLevel('none')" ],
category: "Logging"
}) ], e.prototype, "setLogLevel", null), a([ Uo({
name: "toggleDebug",
description: "Toggle debug mode on/off (affects log level and debug features)",
usage: "toggleDebug()",
examples: [ "toggleDebug()" ],
category: "Logging"
}) ], e.prototype, "toggleDebug", null), e;
}(), wi = function() {
function e() {}
return e.prototype.listCommands = function() {
return xo.generateHelp();
}, e.prototype.commandHelp = function(e) {
return xo.generateCommandHelp(e);
}, a([ Uo({
name: "listCommands",
description: "List all available commands (alias for help)",
usage: "listCommands()",
examples: [ "listCommands()" ],
category: "System"
}) ], e.prototype, "listCommands", null), a([ Uo({
name: "commandHelp",
description: "Get detailed help for a specific command",
usage: "commandHelp(commandName)",
examples: [ "commandHelp('setLogLevel')", "commandHelp('suspendProcess')" ],
category: "System"
}) ], e.prototype, "commandHelp", null), e;
}(), bi = function() {
function e() {}
return e.prototype.showConfig = function() {
var e = Cn(), t = mo();
return "=== SwarmBot Config ===\nDebug: ".concat(String(e.debug), "\nProfiling: ").concat(String(e.profiling), "\nVisualizations: ").concat(String(e.visualizations), "\nLogger Level: ").concat(ao[t.level], "\nCPU Logging: ").concat(String(t.cpuLogging));
}, a([ Uo({
name: "showConfig",
description: "Show current bot configuration",
usage: "showConfig()",
examples: [ "showConfig()" ],
category: "Configuration"
}) ], e.prototype, "showConfig", null), e;
}(), Oi = (Ri = "stats", Ei = function() {
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
return console.log.apply(console, c([ "[".concat(Ri, "]"), e ], s(Ei.apply(void 0, c([], s(t), !1))), !1));
},
info: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, c([ "[".concat(Ri, "]"), e ], s(Ei.apply(void 0, c([], s(t), !1))), !1));
},
warn: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, c([ "[".concat(Ri, "] WARN:"), e ], s(Ei.apply(void 0, c([], s(t), !1))), !1));
},
error: function(e) {
for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
return console.log.apply(console, c([ "[".concat(Ri, "] ERROR:"), e ], s(Ei.apply(void 0, c([], s(t), !1))), !1));
}
}), _i = function(e) {
return {};
};

function xi(e, t) {
var r = t.roomScaling, o = r.minRooms, n = r.scaleFactor, a = r.maxMultiplier, i = Math.max(e, o), s = 1 + Math.log(i / o) / Math.log(n);
return Math.max(1, Math.min(a, s));
}

function Ui(e, t) {
var r = t.bucketMultipliers, o = r.highThreshold, n = r.lowThreshold, a = r.criticalThreshold, i = r.highMultiplier, s = r.lowMultiplier, c = r.criticalMultiplier;
return e >= o ? i : e < a ? c : e < n ? s : 1;
}

!function(e) {
e.ACTIVE = "active", e.DECAY = "decay", e.INACTIVE = "inactive";
}(Ti || (Ti = {})), function(e) {
e.PHEROMONES = "pheromones", e.PATHS = "paths", e.TARGETS = "targets", e.DEBUG = "debug";
}(Ci || (Ci = {}));

var Ai, Ni = function() {
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
n({}, this.metrics);
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
}(), Mi = new Ni, ki = {
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
}, Pi = function() {
function e(e) {
void 0 === e && (e = {}), this.subsystemMeasurements = new Map, this.roomMeasurements = new Map, 
this.lastSegmentUpdate = 0, this.segmentRequested = !1, this.skippedProcessesThisTick = 0, 
this.config = n(n({}, ki), e), this.currentSnapshot = this.createEmptySnapshot(), 
this.nativeCallsThisTick = this.createEmptyNativeCalls();
}
return e.prototype.initialize = function() {
void 0 === RawMemory.segments[this.config.segmentId] && (RawMemory.setActiveSegments([ this.config.segmentId ]), 
this.segmentRequested = !0), Oi.info("Unified stats system initialized", {
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
this.roomMeasurements.clear(), this.skippedProcessesThisTick = 0, Mi.reset();
}
}, e.prototype.finalizeTick = function() {
var e, t, r, o, a, i, s, c, l, u, m, p, f, d, y, g, h = this;
if (this.config.enabled) {
this.currentSnapshot.cpu = {
used: Game.cpu.getUsed(),
limit: Game.cpu.limit,
bucket: Game.cpu.bucket,
percent: Game.cpu.limit > 0 ? Game.cpu.getUsed() / Game.cpu.limit * 100 : 0,
heapUsed: (null !== (o = null === (r = null === (t = (e = Game.cpu).getHeapStatistics) || void 0 === t ? void 0 : t.call(e)) || void 0 === r ? void 0 : r.used_heap_size) && void 0 !== o ? o : 0) / 1024 / 1024
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
progressPercent: (null !== (p = null === (m = Game.gpl) || void 0 === m ? void 0 : m.progressTotal) && void 0 !== p ? p : 0) > 0 ? (null !== (d = null === (f = Game.gpl) || void 0 === f ? void 0 : f.progress) && void 0 !== d ? d : 0) / (null !== (g = null === (y = Game.gpl) || void 0 === y ? void 0 : y.progressTotal) && void 0 !== g ? g : 0) * 100 : 0
}
}, this.finalizeEmpireStats(), this.finalizeSubsystemStats(), this.finalizeCacheStats(), 
this.finalizePathfindingStats(), this.currentSnapshot.native = n({}, this.nativeCallsThisTick), 
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
Oi.error("CPU Budget: ".concat(E.length, " critical violations detected - ").concat(C), {
subsystem: "CPUBudget"
});
}
if (T.length > 0) {
var S = T.map(function(e) {
var t, r = "room:".concat(e.target), o = h.currentSnapshot.processes[r], n = null !== (t = null == o ? void 0 : o.tickModulo) && void 0 !== t ? t : 1, a = n > 1 ? " [runs every ".concat(n, " ticks]") : "";
return "".concat(e.target, ": ").concat((100 * e.percentUsed).toFixed(1), "%").concat(a);
}).join(", ");
Oi.warn("CPU Budget: ".concat(T.length, " warnings (≥80% of limit) - ").concat(S), {
subsystem: "CPUBudget"
});
}
}
if (R.length > 0) {
var w = R.map(function(e) {
return "".concat(e.target, " (").concat(e.type, "): ").concat(e.current.toFixed(3), " CPU (").concat(e.multiplier.toFixed(1), "x baseline)").concat(e.context ? " - ".concat(e.context) : "");
}).join(", ");
Oi.warn("CPU Anomalies: ".concat(R.length, " detected - ").concat(w), {
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
roomMultiplier: xi(r, t.adaptiveBudgetConfig),
bucketMultiplier: Ui(o, t.adaptiveBudgetConfig),
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
var r, o, n, a, c, l, u, m, p, f, d, y, g, h, v;
if (this.config.enabled) {
var R = (e.name, {}), E = Object.values(Game.creeps).filter(function(t) {
return t.room.name === e.name;
}).length, T = e.find(FIND_HOSTILE_CREEPS), C = this.currentSnapshot.rooms[e.name];
if (C || (C = {
name: e.name,
rcl: null !== (a = null === (n = e.controller) || void 0 === n ? void 0 : n.level) && void 0 !== a ? a : 0,
energy: {
available: e.energyAvailable,
capacity: e.energyCapacityAvailable,
storage: null !== (l = null === (c = e.storage) || void 0 === c ? void 0 : c.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== l ? l : 0,
terminal: null !== (m = null === (u = e.terminal) || void 0 === u ? void 0 : u.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== m ? m : 0
},
controller: {
progress: null !== (f = null === (p = e.controller) || void 0 === p ? void 0 : p.progress) && void 0 !== f ? f : 0,
progressTotal: null !== (y = null === (d = e.controller) || void 0 === d ? void 0 : d.progressTotal) && void 0 !== y ? y : 1,
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
for (var S = i(Object.entries(R.pheromones)), w = S.next(); !w.done; w = S.next()) {
var b = s(w.value, 2), O = b[0], _ = b[1];
C.pheromones[O] = _;
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
for (var n = i(Object.entries(this.currentSnapshot.rooms)), a = n.next(); !a.done; a = n.next()) {
var c = s(a.value, 2), l = c[0], u = c[1];
o.roomsEvaluated++;
var m = this.isWarRoom(l) ? this.config.budgetLimits.warRoom : this.config.budgetLimits.ecoRoom, p = "room:".concat(l), f = this.currentSnapshot.processes[p], d = m * (null !== (r = null == f ? void 0 : f.tickModulo) && void 0 !== r ? r : 1), y = u.profiler.avgCpu, g = y / d;
g >= this.config.budgetAlertThresholds.critical ? (o.roomsOverBudget++, o.alerts.push({
severity: "critical",
target: l,
targetType: "room",
cpuUsed: y,
budgetLimit: d,
percentUsed: g,
tick: Game.time
})) : g >= this.config.budgetAlertThresholds.warning ? (o.alerts.push({
severity: "warning",
target: l,
targetType: "room",
cpuUsed: y,
budgetLimit: d,
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
a && !a.done && (t = n.return) && t.call(n);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.detectAnomalies = function() {
var e, t, r, o, n, a, c, l;
if (!this.config.anomalyDetection.enabled) return [];
var u = [];
try {
for (var m = i(Object.entries(this.currentSnapshot.rooms)), p = m.next(); !p.done; p = m.next()) {
var f = s(p.value, 2), d = f[0], y = f[1];
if (!(y.profiler.samples < this.config.anomalyDetection.minSamples)) {
var g = null !== (n = this.roomMeasurements.get(d)) && void 0 !== n ? n : 0;
if (!((b = y.profiler.avgCpu) < .01)) {
var h = g / b;
if (h >= this.config.anomalyDetection.spikeThreshold) {
var v = _i(), R = v ? "RCL ".concat(null !== (l = null === (c = null === (a = Game.rooms[d]) || void 0 === a ? void 0 : a.controller) || void 0 === c ? void 0 : c.level) && void 0 !== l ? l : 0, ", posture: ").concat(v.posture, ", danger: ").concat(v.danger) : void 0;
u.push({
type: "spike",
target: d,
targetType: "room",
current: g,
baseline: b,
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
for (var E = i(Object.entries(this.currentSnapshot.processes)), T = E.next(); !T.done; T = E.next()) {
var C = s(T.value, 2), S = C[0], w = C[1];
if (!(w.runCount < this.config.anomalyDetection.minSamples)) {
g = w.maxCpu;
var b = w.avgCpu;
if (!(Game.time - w.lastRunTick > 100 || b < .01) && (g >= b * this.config.anomalyDetection.spikeThreshold && u.push({
type: "spike",
target: S,
targetType: "process",
current: g,
baseline: b,
multiplier: g / b,
tick: Game.time,
context: "".concat(w.name, " (").concat(w.frequency, ")")
}), w.cpuBudget > 0)) {
var O = b / w.cpuBudget;
O >= 1.5 && u.push({
type: "sustained_high",
target: S,
targetType: "process",
current: b,
baseline: w.cpuBudget,
multiplier: O,
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
var e, t, r, o, n, a, c, l, u, m = this.getProfilerMemory(), p = function(e, t) {
var s, p, d = t.reduce(function(e, t) {
return e + t;
}, 0), y = e.startsWith("role:"), g = y ? e.substring(5) : e;
if (y) {
var h = Object.values(Game.creeps).filter(function(e) {
return e.memory.role === g;
}), v = h.length, R = 0, E = 0, T = 0, C = 0, S = 0;
try {
for (var w = (s = void 0, i(h)), b = w.next(); !b.done; b = w.next()) {
var O = b.value, _ = O.memory, x = null !== (o = null === (r = _.state) || void 0 === r ? void 0 : r.action) && void 0 !== o ? o : "idle", U = null !== (n = _.working) && void 0 !== n ? n : "idle" !== x;
S += O.body.length, C += null !== (a = O.ticksToLive) && void 0 !== a ? a : 0, O.spawning ? R++ : U && "idle" !== x ? T++ : E++;
}
} catch (e) {
s = {
error: e
};
} finally {
try {
b && !b.done && (p = w.return) && p.call(w);
} finally {
if (s) throw s.error;
}
}
var A = t.length > 0 ? d / t.length : 0, N = (k = null === (c = m.roles) || void 0 === c ? void 0 : c[g]) ? k.avgCpu * (1 - f.config.smoothingFactor) + A * f.config.smoothingFactor : A, M = k ? Math.max(k.peakCpu, A) : A;
f.currentSnapshot.roles[g] = {
name: g,
count: v,
avgCpu: N,
peakCpu: M,
calls: t.length,
samples: (null !== (l = null == k ? void 0 : k.samples) && void 0 !== l ? l : 0) + 1,
spawningCount: R,
idleCount: E,
activeCount: T,
avgTicksToLive: v > 0 ? C / v : 0,
totalBodyParts: S
}, m.roles || (m.roles = {}), m.roles[g] = {
avgCpu: N,
peakCpu: M,
samples: f.currentSnapshot.roles[g].samples,
callsThisTick: t.length
};
} else {
var k;
N = (k = m.subsystems[g]) ? k.avgCpu * (1 - f.config.smoothingFactor) + d * f.config.smoothingFactor : d, 
M = k ? Math.max(k.peakCpu, d) : d, f.currentSnapshot.subsystems[g] = {
name: g,
avgCpu: N,
peakCpu: M,
calls: t.length,
samples: (null !== (u = null == k ? void 0 : k.samples) && void 0 !== u ? u : 0) + 1
}, m.subsystems[g] = {
avgCpu: N,
peakCpu: M,
samples: f.currentSnapshot.subsystems[g].samples,
callsThisTick: t.length
};
}
}, f = this;
try {
for (var d = i(this.subsystemMeasurements), y = d.next(); !y.done; y = d.next()) {
var g = s(y.value, 2);
p(g[0], g[1]);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
y && !y.done && (t = d.return) && t.call(d);
} finally {
if (e) throw e.error;
}
}
}, e.prototype.finalizeCreepStats = function() {
var e, t, r, o, n, a, s;
try {
for (var c = i(Object.values(Game.creeps)), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (!this.currentSnapshot.creeps[u.name]) {
var m = u.memory, p = null !== (o = null === (r = m.state) || void 0 === r ? void 0 : r.action) && void 0 !== o ? o : m.working ? "working" : "idle";
this.currentSnapshot.creeps[u.name] = {
name: u.name,
role: null !== (n = m.role) && void 0 !== n ? n : "unknown",
homeRoom: null !== (a = m.homeRoom) && void 0 !== a ? a : u.room.name,
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
this.currentSnapshot.pathfinding = Mi.getMetrics();
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
var e, t, r, o, a, c, l, u, m, p, f = Memory, d = this.currentSnapshot;
f.stats = {
tick: d.tick,
timestamp: d.timestamp,
cpu: {
used: d.cpu.used,
limit: d.cpu.limit,
bucket: d.cpu.bucket,
percent: d.cpu.percent,
heap_mb: d.cpu.heapUsed
},
kernel: {
adaptive_budgets_enabled: d.kernelBudgets.adaptiveBudgetsEnabled,
room_count: d.kernelBudgets.roomCount,
room_multiplier: d.kernelBudgets.roomMultiplier,
bucket_multiplier: d.kernelBudgets.bucketMultiplier,
budget_high: d.kernelBudgets.budgets.high,
budget_medium: d.kernelBudgets.budgets.medium,
budget_low: d.kernelBudgets.budgets.low,
total_allocated: d.kernelBudgets.totalAllocated,
total_used: d.kernelBudgets.totalUsed,
utilization_ratio: d.kernelBudgets.utilizationRatio
},
gcl: {
level: d.progression.gcl.level,
progress: d.progression.gcl.progress,
progress_total: d.progression.gcl.progressTotal,
progress_percent: d.progression.gcl.progressPercent
},
gpl: {
level: d.progression.gpl.level,
progress: d.progression.gpl.progress,
progress_total: d.progression.gpl.progressTotal,
progress_percent: d.progression.gpl.progressPercent
},
empire: {
rooms: d.empire.rooms,
creeps: d.empire.creeps,
power_creeps: {
total: d.empire.powerCreeps.total,
spawned: d.empire.powerCreeps.spawned,
eco: d.empire.powerCreeps.eco,
combat: d.empire.powerCreeps.combat
},
energy: {
storage: d.empire.energy.storage,
terminal: d.empire.energy.terminal,
available: d.empire.energy.available,
capacity: d.empire.energy.capacity
},
credits: d.empire.credits,
skipped_processes: d.empire.skippedProcesses,
shard: d.empire.shard ? {
name: d.empire.shard.name,
role: d.empire.shard.role,
cpu_usage: d.empire.shard.cpuUsage,
cpu_category: d.empire.shard.cpuCategory,
bucket_level: d.empire.shard.bucketLevel,
economy_index: d.empire.shard.economyIndex,
war_index: d.empire.shard.warIndex,
avg_rcl: d.empire.shard.avgRCL,
portals_count: d.empire.shard.portalsCount,
active_tasks_count: d.empire.shard.activeTasksCount
} : void 0
},
rooms: {},
subsystems: {},
roles: {},
native: {
pathfinder_search: d.native.pathfinderSearch,
move_to: d.native.moveTo,
move: d.native.move,
harvest: d.native.harvest,
transfer: d.native.transfer,
withdraw: d.native.withdraw,
build: d.native.build,
repair: d.native.repair,
upgrade_controller: d.native.upgradeController,
attack: d.native.attack,
ranged_attack: d.native.rangedAttack,
heal: d.native.heal,
dismantle: d.native.dismantle,
say: d.native.say,
total: d.native.total
}
};
try {
for (var y = i(Object.entries(d.rooms)), g = y.next(); !g.done; g = y.next()) {
var h = s(g.value, 2), v = h[0], R = h[1];
f.stats.rooms[v] = {
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
pheromones: n({}, R.pheromones),
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
for (var E = i(Object.entries(d.subsystems)), T = E.next(); !T.done; T = E.next()) {
var C = s(T.value, 2), S = C[0], w = C[1];
f.stats.subsystems[S] = {
avg_cpu: w.avgCpu,
peak_cpu: w.peakCpu,
calls: w.calls,
samples: w.samples
};
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
try {
for (var b = i(Object.entries(d.roles)), O = b.next(); !O.done; O = b.next()) {
var _ = s(O.value, 2), x = (S = _[0], _[1]);
f.stats.roles[S] = {
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
a = {
error: e
};
} finally {
try {
O && !O.done && (c = b.return) && c.call(b);
} finally {
if (a) throw a.error;
}
}
f.stats.processes = {};
try {
for (var U = i(Object.entries(d.processes)), A = U.next(); !A.done; A = U.next()) {
var N = s(A.value, 2), M = N[0], k = N[1];
f.stats.processes[M] = {
name: k.name,
priority: k.priority,
frequency: k.frequency,
state: k.state,
total_cpu: k.totalCpu,
run_count: k.runCount,
avg_cpu: k.avgCpu,
max_cpu: k.maxCpu,
last_run_tick: k.lastRunTick,
skipped_count: k.skippedCount,
error_count: k.errorCount,
cpu_budget: k.cpuBudget,
min_bucket: k.minBucket
};
}
} catch (e) {
l = {
error: e
};
} finally {
try {
A && !A.done && (u = U.return) && u.call(U);
} finally {
if (l) throw l.error;
}
}
f.stats.creeps = {};
try {
for (var P = i(Object.entries(d.creeps)), I = P.next(); !I.done; I = P.next()) {
var G = s(I.value, 2), L = (S = G[0], G[1]);
f.stats.creeps[S] = {
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
I && !I.done && (p = P.return) && p.call(P);
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
Oi.error("Failed to parse stats segment: ".concat(n), {
subsystem: "Stats"
});
}
t.push(this.currentSnapshot), t.length > this.config.maxHistoryPoints && (t = t.slice(-this.config.maxHistoryPoints));
var a = JSON.stringify(t);
if (a.length > e) {
for (Oi.warn("Stats segment size ".concat(a.length, " exceeds ").concat(e, " bytes, trimming history"), {
subsystem: "Stats"
}); a.length > e && t.length > 1; ) t.shift(), a = JSON.stringify(t);
if (a.length > e) return void Oi.error("Failed to persist stats segment within ".concat(e, " bytes after trimming"), {
subsystem: "Stats"
});
}
try {
RawMemory.segments[this.config.segmentId] = a;
} catch (e) {
n = e instanceof Error ? e.message : String(e), Oi.error("Failed to save stats segment: ".concat(n), {
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
var e, t, r, o, n, a, s, c, l, u, m = this.currentSnapshot;
Oi.info("=== Unified Stats Summary ==="), Oi.info("CPU: ".concat(m.cpu.used.toFixed(2), "/").concat(m.cpu.limit, " (").concat(m.cpu.percent.toFixed(1), "%) | Bucket: ").concat(m.cpu.bucket)), 
Oi.info("Empire: ".concat(m.empire.rooms, " rooms, ").concat(m.empire.creeps, " creeps, ").concat(m.empire.credits, " credits"));
var p = Object.values(m.subsystems).sort(function(e, t) {
return t.avgCpu - e.avgCpu;
}).slice(0, 5);
if (p.length > 0) {
Oi.info("Top Subsystems:");
try {
for (var f = i(p), d = f.next(); !d.done; d = f.next()) {
var y = d.value;
Oi.info("  ".concat(y.name, ": ").concat(y.avgCpu.toFixed(3), " CPU"));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
d && !d.done && (t = f.return) && t.call(f);
} finally {
if (e) throw e.error;
}
}
}
var g = Object.values(m.roles).sort(function(e, t) {
return t.avgCpu - e.avgCpu;
}).slice(0, 5);
if (g.length > 0) {
Oi.info("Top Roles:");
try {
for (var h = i(g), v = h.next(); !v.done; v = h.next()) {
var R = v.value;
Oi.info("  ".concat(R.name, ": ").concat(R.count, " creeps, ").concat(R.avgCpu.toFixed(3), " CPU"));
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
Oi.info("Top Processes:");
try {
for (var T = i(E), C = T.next(); !C.done; C = T.next()) {
var S = C.value;
Oi.info("  ".concat(S.name, ": ").concat(S.avgCpu.toFixed(3), " CPU (runs: ").concat(S.runCount, ", state: ").concat(S.state, ")"));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
C && !C.done && (a = T.return) && a.call(T);
} finally {
if (n) throw n.error;
}
}
}
var w = Object.values(m.rooms).sort(function(e, t) {
return t.profiler.avgCpu - e.profiler.avgCpu;
}).slice(0, 5);
if (w.length > 0) {
Oi.info("Top Rooms by CPU:");
try {
for (var b = i(w), O = b.next(); !O.done; O = b.next()) {
var _ = O.value;
Oi.info("  ".concat(_.name, ": ").concat(_.profiler.avgCpu.toFixed(3), " CPU (RCL ").concat(_.rcl, ")"));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
O && !O.done && (c = b.return) && c.call(b);
} finally {
if (s) throw s.error;
}
}
}
var x = Object.values(m.creeps).sort(function(e, t) {
return t.cpu - e.cpu;
}).slice(0, 5);
if (x.length > 0) {
Oi.info("Top Creeps by CPU:");
try {
for (var U = i(x), A = U.next(); !A.done; A = U.next()) {
var N = A.value;
Oi.info("  ".concat(N.name, " (").concat(N.role, "): ").concat(N.cpu.toFixed(3), " CPU in ").concat(N.currentRoom));
}
} catch (e) {
l = {
error: e
};
} finally {
try {
A && !A.done && (u = U.return) && u.call(U);
} finally {
if (l) throw l.error;
}
}
}
this.config.trackNativeCalls && Oi.info("Native calls: ".concat(m.native.total, " total"));
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
return n({}, this.currentSnapshot);
}, e.POSTURE_NAMES = [ "eco", "expand", "defensive", "war", "siege", "evacuate", "nukePrep" ], 
e;
}(), Ii = new Pi, Gi = {
primarySegment: 90,
backupSegment: 91,
retentionPeriod: 1e4,
updateInterval: 50,
maxDataPoints: 1e3
}, Li = function() {
function e(e) {
void 0 === e && (e = {}), this.statsData = null, this.segmentRequested = !1, this.lastUpdate = 0, 
this.config = n(n({}, Gi), e);
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
this.statsData = JSON.parse(e), Oi.debug("Loaded stats from segment", {
subsystem: "Stats"
});
} catch (e) {
var t = e instanceof Error ? e.message : String(e);
Oi.error("Failed to parse stats segment: ".concat(t), {
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
var t, r, o, n, a = Memory;
a.stats && "object" == typeof a.stats || (a.stats = {});
var c = a.stats;
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
for (var u = i(e.rooms), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = "stats.room.".concat(p.roomName);
c["".concat(f, ".rcl")] = p.rcl, c["".concat(f, ".energy.available")] = p.energyAvailable, 
c["".concat(f, ".energy.capacity")] = p.energyCapacity, c["".concat(f, ".storage.energy")] = p.storageEnergy, 
c["".concat(f, ".terminal.energy")] = p.terminalEnergy, c["".concat(f, ".creeps")] = p.creepCount, 
c["".concat(f, ".controller.progress")] = p.controllerProgress, c["".concat(f, ".controller.progress_total")] = p.controllerProgressTotal, 
c["".concat(f, ".controller.progress_percent")] = p.controllerProgressTotal > 0 ? p.controllerProgress / p.controllerProgressTotal * 100 : 0;
var d = _i(p.roomName);
if (d) {
if (c["".concat(f, ".brain.danger")] = d.danger, c["".concat(f, ".brain.posture_code")] = this.postureToCode(d.posture), 
c["".concat(f, ".brain.colony_level_code")] = this.colonyLevelToCode(d.colonyLevel), 
d.pheromones) try {
for (var y = (o = void 0, i(Object.entries(d.pheromones))), g = y.next(); !g.done; g = y.next()) {
var h = s(g.value, 2), v = h[0], R = h[1];
c["".concat(f, ".pheromone.").concat(v)] = R;
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
var E = d.metrics;
E && (c["".concat(f, ".metrics.energy.harvested")] = E.energyHarvested, c["".concat(f, ".metrics.energy.spawning")] = E.energySpawning, 
c["".concat(f, ".metrics.energy.construction")] = E.energyConstruction, c["".concat(f, ".metrics.energy.repair")] = E.energyRepair, 
c["".concat(f, ".metrics.energy.tower")] = E.energyTower, c["".concat(f, ".metrics.energy.available_for_sharing")] = E.energyAvailable, 
c["".concat(f, ".metrics.energy.capacity_total")] = E.energyCapacity, c["".concat(f, ".metrics.energy.need")] = E.energyNeed, 
c["".concat(f, ".metrics.controller_progress")] = E.controllerProgress, c["".concat(f, ".metrics.hostile_count")] = E.hostileCount, 
c["".concat(f, ".metrics.damage_received")] = E.damageReceived, c["".concat(f, ".metrics.construction_sites")] = E.constructionSites);
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
r.data.length > 0 && (r.min = Math.min.apply(Math, c([], s(r.data.map(function(e) {
return e.value;
})), !1)), r.max = Math.max.apply(Math, c([], s(r.data.map(function(e) {
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
var a = JSON.stringify(this.statsData);
if (a.length > n) {
for (Oi.warn("Stats data exceeds segment limit: ".concat(a.length, " bytes, trimming..."), {
subsystem: "Stats"
}); a.length > n && this.statsData.history.length > 10; ) this.statsData.history.shift(), 
a = JSON.stringify(this.statsData);
if (a.length > n) try {
for (var s = i(Object.keys(this.statsData.series)), c = s.next(); !c.done; c = s.next()) for (var l = c.value, u = this.statsData.series[l]; u.data.length > 10 && a.length > n; ) u.data.shift(), 
a = JSON.stringify(this.statsData);
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
if (a.length > n) {
Oi.warn("Stats data still exceeds limit after trimming, clearing history", {
subsystem: "Stats"
}), this.statsData.history = this.statsData.history.slice(-5);
try {
for (var m = i(Object.keys(this.statsData.series)), p = m.next(); !p.done; p = m.next()) l = p.value, 
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
a = JSON.stringify(this.statsData);
}
}
RawMemory.segments[this.config.primarySegment] = a;
} catch (e) {
var f = e instanceof Error ? e.message : String(e);
Oi.error("Failed to save stats segment: ".concat(f), {
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
for (var n = i(r.rooms), a = n.next(); !a.done; a = n.next()) {
var s = a.value;
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
a && !a.done && (t = n.return) && t.call(n);
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
}(), Di = new Li;

function Fi(e) {
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

function Bi(e) {
return Fi(e), e._metrics;
}

function Hi(e, t) {
Bi(e).damageDealt += t;
}

function Wi(e) {
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
}(Ai || (Ai = {}));

var Yi, Ki = (Yi = "VisualizationManager", {
info: function(e, t) {
t ? console.log("[".concat(Yi, "] ").concat(e), Wi(t)) : console.log("[".concat(Yi, "] ").concat(e));
},
warn: function(e, t) {
t ? console.log("[".concat(Yi, "] WARN: ").concat(e), Wi(t)) : console.log("[".concat(Yi, "] WARN: ").concat(e));
},
error: function(e, t) {
t ? console.log("[".concat(Yi, "] ERROR: ").concat(e), Wi(t)) : console.log("[".concat(Yi, "] ERROR: ").concat(e));
},
debug: function(e, t) {
t ? console.log("[".concat(Yi, "] DEBUG: ").concat(e), Wi(t)) : console.log("[".concat(Yi, "] DEBUG: ").concat(e));
}
}), ji = function() {
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
enabledLayers: Ai.Pheromones | Ai.Defense,
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
this.config.enabledLayers = Ai.Pheromones | Ai.Paths | Ai.Traffic | Ai.Defense | Ai.Economy | Ai.Construction | Ai.Performance;
break;

case "presentation":
this.config.enabledLayers = Ai.Pheromones | Ai.Defense | Ai.Economy;
break;

case "minimal":
this.config.enabledLayers = Ai.Defense;
break;

case "performance":
this.config.enabledLayers = Ai.None;
}
this.saveConfig(), Ki.info("Visualization mode set to: ".concat(e));
}, e.prototype.updateFromFlags = function() {
var e, t, r = Game.flags, o = {
viz_pheromones: Ai.Pheromones,
viz_paths: Ai.Paths,
viz_traffic: Ai.Traffic,
viz_defense: Ai.Defense,
viz_economy: Ai.Economy,
viz_construction: Ai.Construction,
viz_performance: Ai.Performance
}, n = function(e, t) {
Object.values(r).some(function(t) {
return t.name === e;
}) && !a.isLayerEnabled(t) && (a.enableLayer(t), Ki.info("Enabled layer ".concat(Ai[t], " via flag")));
}, a = this;
try {
for (var c = i(Object.entries(o)), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value, 2);
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
a > 10 && Ki.warn("Visualization using ".concat(a.toFixed(1), "% of CPU budget"));
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
return n({}, this.config);
}, e.prototype.getPerformanceMetrics = function() {
var e = Game.cpu.limit;
return {
totalCost: this.config.totalCost,
layerCosts: n({}, this.config.layerCosts),
percentOfBudget: this.config.totalCost / e * 100
};
}, e.prototype.measureCost = function(e) {
var t = Game.cpu.getUsed();
return {
result: e(),
cost: Game.cpu.getUsed() - t
};
}, e;
}(), Vi = null, qi = (null === Vi && (Vi = new ji), Vi), zi = {
showPheromones: !0,
showPaths: !1,
showCombat: !0,
showResourceFlow: !1,
showSpawnQueue: !0,
showRoomStats: !0,
showStructures: !1,
opacity: .5
}, Xi = {
expand: "#00ff00",
harvest: "#ffff00",
build: "#ff8800",
upgrade: "#0088ff",
defense: "#ff0000",
war: "#ff00ff",
siege: "#880000",
logistics: "#00ffff",
nukeTarget: "#ff0088"
}, Qi = function() {
function e(e, t) {
void 0 === e && (e = {}), this.config = n(n({}, zi), e), this.memoryManager = t;
}
return e.prototype.setMemoryManager = function(e) {
this.memoryManager = e;
}, e.prototype.draw = function(e) {
var t, r = this, o = new RoomVisual(e.name), n = null === (t = this.memoryManager) || void 0 === t ? void 0 : t.getOrInitSwarmState(e.name);
if (qi.updateFromFlags(), this.config.showRoomStats && this.drawRoomStats(o, e, n), 
this.config.showPheromones && qi.isLayerEnabled(Ai.Pheromones) && n) {
var a = qi.measureCost(function() {
r.drawPheromoneBars(o, n), r.drawPheromoneHeatmap(o, n);
}).cost;
qi.trackLayerCost("pheromones", a);
}
this.config.showCombat && qi.isLayerEnabled(Ai.Defense) && (a = qi.measureCost(function() {
r.drawCombatInfo(o, e);
}).cost, qi.trackLayerCost("defense", a)), this.config.showSpawnQueue && this.drawSpawnQueue(o, e), 
this.config.showResourceFlow && qi.isLayerEnabled(Ai.Economy) && (a = qi.measureCost(function() {
r.drawResourceFlow(o, e);
}).cost, qi.trackLayerCost("economy", a)), this.config.showPaths && qi.isLayerEnabled(Ai.Paths) && (a = qi.measureCost(function() {
r.drawTrafficPaths(o, e);
}).cost, qi.trackLayerCost("paths", a)), this.config.showStructures && qi.isLayerEnabled(Ai.Construction) && (a = qi.measureCost(function() {
r.drawEnhancedStructures(o, e);
}).cost, qi.trackLayerCost("construction", a)), (null == n ? void 0 : n.collectionPoint) && this.drawCollectionPoint(o, n), 
qi.isLayerEnabled(Ai.Performance) && this.drawPerformanceMetrics(o);
}, e.prototype.drawRoomStats = function(e, t, r) {
var o, n, a, i, s, c, l = .5, u = .5, m = .6;
e.rect(0, 0, 8, 6.5, {
fill: "#000000",
opacity: .7,
stroke: "#ffffff",
strokeWidth: .05
});
var p = null !== (n = null === (o = t.controller) || void 0 === o ? void 0 : o.level) && void 0 !== n ? n : 0, f = t.controller ? "".concat(Math.round(t.controller.progress / t.controller.progressTotal * 100), "%") : "N/A";
e.text("".concat(t.name, " | RCL ").concat(p, " (").concat(f, ")"), l, u, {
align: "left",
font: "0.5 monospace",
color: "#ffffff"
}), u += m;
var d = t.energyAvailable, y = t.energyCapacityAvailable, g = y > 0 ? Math.round(d / y * 100) : 0;
if (e.text("Energy: ".concat(d, "/").concat(y, " (").concat(g, "%)"), l, u, {
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
var r, o, n, a = .5;
if (e.rect(41.5, 0, 8, 5.5, {
fill: "#000000",
opacity: .7,
stroke: "#ffffff",
strokeWidth: .05
}), e.text("Pheromones", 45, a, {
align: "center",
font: "0.5 monospace",
color: "#ffffff"
}), a += .6, t.pheromones) try {
for (var c = i(Object.entries(t.pheromones)), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value, 2), m = u[0], p = u[1], f = null !== (n = Xi[m]) && void 0 !== n ? n : "#888888", d = 6 * Math.min(1, p / 100);
e.rect(42, a, 6, .4, {
fill: "#333333",
opacity: .8
}), d > 0 && e.rect(42, a, d, .4, {
fill: f,
opacity: this.config.opacity
}), e.text("".concat(m, ": ").concat(Math.round(p)), 41.8, a + .35, {
align: "right",
font: "0.35 monospace",
color: f
}), a += .5;
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
var o, n, a;
if (r.pheromones) {
var c = null, l = e.HEATMAP_MIN_THRESHOLD;
try {
for (var u = i(Object.entries(r.pheromones)), m = u.next(); !m.done; m = u.next()) {
var p = s(m.value, 2), f = p[0], d = p[1];
d > l && (l = d, c = f);
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
var y = null !== (a = Xi[c]) && void 0 !== a ? a : "#888888", g = .15 * Math.min(1, l / 100);
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
var r, o, n, a, s = t.find(FIND_HOSTILE_CREEPS);
try {
for (var c = i(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = this.calculateCreepThreat(u), p = m > 30 ? "#ff0000" : m > 10 ? "#ff8800" : "#ffff00", f = .4 + m / 100, d = .2 + m / 100 * .3;
e.circle(u.pos, {
radius: f,
fill: p,
opacity: d,
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
for (var g = i(y), h = g.next(); !h.done; h = g.next()) {
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
h && !h.done && (a = g.return) && a.call(g);
} finally {
if (n) throw n.error;
}
}
}
}, e.prototype.calculateCreepThreat = function(e) {
var t, r, o = 0;
try {
for (var n = i(e.body), a = n.next(); !a.done; a = n.next()) {
var s = a.value;
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
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
return o;
}, e.prototype.drawSpawnQueue = function(e, t) {
var r, o, n, a = t.find(FIND_MY_SPAWNS);
try {
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (l.spawning) {
var u = Game.creeps[l.spawning.name], m = 1 - l.spawning.remainingTime / l.spawning.needTime, p = l.pos.x - 1, f = l.pos.y - 1.5;
e.rect(p, f, 2, .3, {
fill: "#333333",
opacity: .8
}), e.rect(p, f, 2 * m, .3, {
fill: "#00ff00",
opacity: .8
});
var d = null == u ? void 0 : u.memory, y = null !== (n = null == d ? void 0 : d.role) && void 0 !== n ? n : l.spawning.name;
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
var r, o, n, a, s, c, l, u, m = t.storage;
if (m) {
var p = t.find(FIND_SOURCES);
try {
for (var f = i(p), d = f.next(); !d.done; d = f.next()) {
var y = d.value;
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
d && !d.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
var v = t.find(FIND_MY_SPAWNS);
try {
for (var R = i(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
T.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.drawFlowingArrow(e, m.pos, T.pos, "#00ff00", .3);
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
var C = t.controller;
if (C && this.drawFlowingArrow(e, m.pos, C.pos, "#00ffff", .3), m.store.getUsedCapacity() > 0) {
var S = .8, w = -.8, b = Object.keys(m.store).filter(function(e) {
return m.store[e] > 1e3;
}).sort(function(e, t) {
return m.store[t] - m.store[e];
}).slice(0, 3);
try {
for (var O = i(b), _ = O.next(); !_.done; _ = O.next()) {
var x = _.value;
e.resource(x, m.pos.x + S, m.pos.y + w, .3), S += .6;
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
var U = t.terminal;
if (U && U.store.getUsedCapacity() > 0) {
S = .8, w = -.8, b = Object.keys(U.store).filter(function(e) {
return U.store[e] > 1e3;
}).sort(function(e, t) {
return U.store[t] - U.store[e];
}).slice(0, 3);
try {
for (var A = i(b), N = A.next(); !N.done; N = A.next()) x = N.value, e.resource(x, U.pos.x + S, U.pos.y + w, .3), 
S += .6;
} catch (e) {
l = {
error: e
};
} finally {
try {
N && !N.done && (u = A.return) && u.call(A);
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
var r, o, n, a, s, c, l = qi.getCachedStructures(t.name);
if (l) try {
for (var u = i(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = this.getStructureDepthOpacity(p.type);
e.structure(p.x, p.y, p.type, {
opacity: f
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
var d = t.find(FIND_STRUCTURES), y = [];
try {
for (var g = i(d), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
f = this.getStructureDepthOpacity(v.structureType), e.structure(v.pos.x, v.pos.y, v.structureType, {
opacity: f
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
h && !h.done && (a = g.return) && a.call(g);
} finally {
if (n) throw n.error;
}
}
qi.cacheStructures(t.name, y);
}
var R = t.find(FIND_MY_CONSTRUCTION_SITES);
try {
for (var E = i(R), T = E.next(); !T.done; T = E.next()) {
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
var t, r, o = qi.getPerformanceMetrics(), n = .5, a = 7.5, c = .5;
e.rect(0, 7, 10, 5.5, {
fill: "#000000",
opacity: .8,
stroke: "#ffff00",
strokeWidth: .05
}), e.text("Visualization Performance", n, a, {
align: "left",
font: "0.5 monospace",
color: "#ffff00"
}), a += c;
var l = o.percentOfBudget > 10 ? "#ff0000" : "#00ff00";
e.text("Total: ".concat(o.totalCost.toFixed(3), " CPU"), n, a, {
align: "left",
font: "0.4 monospace",
color: l
}), a += c, e.text("(".concat(o.percentOfBudget.toFixed(1), "% of budget)"), n, a, {
align: "left",
font: "0.35 monospace",
color: l
}), a += c, e.text("Layer Costs:", n, a, {
align: "left",
font: "0.4 monospace",
color: "#ffffff"
}), a += c;
try {
for (var u = i(Object.entries(o.layerCosts)), m = u.next(); !m.done; m = u.next()) {
var p = s(m.value, 2), f = p[0], d = p[1];
d > 0 && (e.text("  ".concat(f, ": ").concat(d.toFixed(3)), n, a, {
align: "left",
font: "0.35 monospace",
color: "#aaaaaa"
}), a += .4);
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
for (var a = i(n), s = a.next(); !s.done; s = a.next()) {
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
s && !s.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.drawBlueprint = function(e, t) {
var r, o;
try {
for (var n = i(t), a = n.next(); !a.done; a = n.next()) {
var s = a.value;
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
a && !a.done && (o = n.return) && o.call(n);
} finally {
if (r) throw r.error;
}
}
}, e.prototype.setConfig = function(e) {
this.config = n(n({}, this.config), e);
}, e.prototype.getConfig = function() {
return n({}, this.config);
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

new Qi;

var Zi = {
showRoomStatus: !0,
showConnections: !0,
showThreats: !0,
showExpansion: !1,
showResourceFlow: !1,
showHighways: !1,
opacity: .6
}, $i = [ "#00ff00", "#ffff00", "#ff8800", "#ff0000" ], Ji = {
eco: "#00ff00",
expand: "#00ffff",
defense: "#ffff00",
war: "#ff8800",
siege: "#ff0000",
evacuate: "#ff00ff"
}, es = function() {
function e(e, t) {
void 0 === e && (e = {}), this.config = n(n({}, Zi), e), this.memoryManager = t;
}
return e.prototype.setMemoryManager = function(e) {
this.memoryManager = e;
}, e.prototype.draw = function() {
var e = Game.map.visual;
this.config.showRoomStatus && this.drawRoomStatus(e), this.config.showConnections && this.drawConnections(e), 
this.config.showThreats && this.drawThreats(e), this.config.showExpansion && this.drawExpansionCandidates(e), 
this.config.showResourceFlow && this.drawResourceFlow(e), this.config.showHighways && this.drawHighways(e);
}, e.prototype.drawRoomStatus = function(e) {
var t, r, o, n, a, s;
try {
for (var c = i(Object.values(Game.rooms)), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (null === (o = u.controller) || void 0 === o ? void 0 : o.my) {
var m = null === (n = this.memoryManager) || void 0 === n ? void 0 : n.getOrInitSwarmState(u.name), p = u.controller.level, f = (null == m ? void 0 : m.danger) ? Math.min(Math.max(m.danger, 0), 3) : 0, d = null !== (a = $i[f]) && void 0 !== a ? a : "#ffffff", y = {
radius: 10,
fill: d,
opacity: .5 * this.config.opacity,
stroke: d,
strokeWidth: 1
};
if (e.circle(new RoomPosition(25, 25, u.name), y), e.text("RCL".concat(p), new RoomPosition(25, 25, u.name), {
color: "#ffffff",
fontSize: 8,
align: "center"
}), m && m.posture && "eco" !== m.posture) {
var g = null !== (s = Ji[m.posture]) && void 0 !== s ? s : "#ffffff";
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
var t, r, o, n, a = function(t) {
var r, a, c, l;
if (!(null === (o = t.controller) || void 0 === o ? void 0 : o.my)) return "continue";
var u = null === (n = s.memoryManager) || void 0 === n ? void 0 : n.getOrInitSwarmState(t.name);
if (!u) return "continue";
if (u.remoteAssignments && u.remoteAssignments.length > 0) try {
for (var m = (r = void 0, i(u.remoteAssignments)), p = m.next(); !p.done; p = m.next()) {
var f = p.value, d = {
color: "#00ffff",
opacity: .8 * s.config.opacity,
width: .5
};
e.line(new RoomPosition(25, 25, t.name), new RoomPosition(25, 25, f), d);
var y = {
radius: 5,
fill: "#00ffff",
opacity: .3 * s.config.opacity
};
e.circle(new RoomPosition(25, 25, f), y);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
p && !p.done && (a = m.return) && a.call(m);
} finally {
if (r) throw r.error;
}
}
if (u && ("war" === u.posture || "siege" === u.posture)) {
var g = Object.values(Game.rooms).filter(function(e) {
return e.find(FIND_HOSTILE_CREEPS).length > 0 && Game.map.getRoomLinearDistance(t.name, e.name) <= 5;
});
try {
for (var h = (c = void 0, i(g)), v = h.next(); !v.done; v = h.next()) {
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
for (var c = i(Object.values(Game.rooms)), l = c.next(); !l.done; l = c.next()) a(l.value);
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
for (var o = i(Object.values(Game.rooms)), n = o.next(); !n.done; n = o.next()) {
var a = n.value, s = a.find(FIND_HOSTILE_CREEPS), c = a.find(FIND_HOSTILE_STRUCTURES);
if (s.length > 0 || c.length > 0) {
var l = s.length + 2 * c.length, u = l > 10 ? "#ff0000" : "#ff8800";
e.rect(new RoomPosition(20, 20, a.name), 10, 10, {
fill: u,
opacity: .5 * this.config.opacity,
stroke: u,
strokeWidth: 1
}), e.text("⚠".concat(l), new RoomPosition(25, 25, a.name), {
color: "#ffffff",
fontSize: 8,
align: "center"
});
}
if (a.find(FIND_NUKES).length > 0) {
var m = a.find(FIND_NUKES);
e.circle(new RoomPosition(25, 25, a.name), {
radius: 15,
fill: "#ff00ff",
opacity: .7 * this.config.opacity,
stroke: "#ff00ff",
strokeWidth: 2
}), e.text("☢".concat(m.length), new RoomPosition(25, 25, a.name), {
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
opacity: .3 * a.config.opacity,
stroke: "#00ff00",
strokeWidth: .5,
lineStyle: "dashed"
}), e.text("EXP", new RoomPosition(25, 25, t.name), {
color: "#00ff00",
fontSize: 6,
align: "center"
}));
}, a = this;
try {
for (var s = i(Object.values(Game.rooms)), c = s.next(); !c.done; c = s.next()) n(c.value);
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
for (var n = i(o), a = n.next(); !a.done; a = n.next()) {
var s = a.value;
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
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
}, e.prototype.drawHighways = function(e) {
var t, r;
try {
for (var o = i(Object.values(Game.rooms)), n = o.next(); !n.done; n = o.next()) {
var a = n.value, s = a.name.match(/[WE](\d+)[NS](\d+)/);
if (s) {
var c = parseInt(s[1], 10), l = parseInt(s[2], 10);
c % 10 != 0 && l % 10 != 0 || (e.rect(new RoomPosition(0, 0, a.name), 50, 50, {
fill: "#444444",
opacity: .2 * this.config.opacity
}), c % 10 == 0 && l % 10 == 0 && e.text("SK", new RoomPosition(25, 25, a.name), {
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
this.config = n(n({}, this.config), e);
}, e.prototype.getConfig = function() {
return n({}, this.config);
}, e.prototype.toggle = function(e) {
var t = this.config[e];
"boolean" == typeof t && (this.config[e] = !t);
}, e;
}();

new es;

var ts, rs = "#555555", os = "#AAAAAA", ns = "#FFE87B", as = "#F53547", is = "#181818", ss = "#8FBB93", cs = !1;

"undefined" == typeof RoomVisual || cs || (cs = !0, RoomVisual.prototype.structure = function(e, t, r, o) {
void 0 === o && (o = {});
var a = n({
opacity: 1
}, o);
switch (r) {
case STRUCTURE_EXTENSION:
this.circle(e, t, {
radius: .5,
fill: is,
stroke: ss,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: rs,
opacity: a.opacity
});
break;

case STRUCTURE_SPAWN:
this.circle(e, t, {
radius: .65,
fill: is,
stroke: "#CCCCCC",
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: ns,
opacity: a.opacity
});
break;

case STRUCTURE_POWER_SPAWN:
this.circle(e, t, {
radius: .65,
fill: is,
stroke: as,
strokeWidth: .1,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: ns,
opacity: a.opacity
});
break;

case STRUCTURE_TOWER:
this.circle(e, t, {
radius: .6,
fill: is,
stroke: ss,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: rs,
opacity: a.opacity
}), this.rect(e - .2, t - .3, .4, .6, {
fill: os,
opacity: a.opacity
});
break;

case STRUCTURE_STORAGE:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: ss,
strokeWidth: .05,
fill: is,
opacity: a.opacity
}), this.rect(e - .35, t - .45, .7, .9, {
fill: ns,
opacity: .6 * a.opacity
});
break;

case STRUCTURE_TERMINAL:
this.poly([ [ -.45, -.55 ], [ 0, -.65 ], [ .45, -.55 ], [ .55, 0 ], [ .45, .55 ], [ 0, .65 ], [ -.45, .55 ], [ -.55, 0 ] ].map(function(r) {
return [ r[0] + e, r[1] + t ];
}), {
stroke: ss,
strokeWidth: .05,
fill: is,
opacity: a.opacity
}), this.circle(e, t, {
radius: .3,
fill: os,
opacity: a.opacity
}), this.rect(e - .15, t - .15, .3, .3, {
fill: rs,
opacity: a.opacity
});
break;

case STRUCTURE_LAB:
this.circle(e, t, {
radius: .55,
fill: is,
stroke: ss,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .4,
fill: rs,
opacity: a.opacity
}), this.rect(e - .15, t + .1, .3, .25, {
fill: os,
opacity: a.opacity
});
break;

case STRUCTURE_LINK:
this.circle(e, t, {
radius: .5,
fill: is,
stroke: ss,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .35,
fill: os,
opacity: a.opacity
});
break;

case STRUCTURE_NUKER:
this.circle(e, t, {
radius: .65,
fill: is,
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
fill: is,
stroke: ss,
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
fill: is,
stroke: ss,
strokeWidth: .05,
opacity: a.opacity
}), this.rect(e - .35, t - .35, .7, .7, {
fill: "transparent",
stroke: rs,
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
fill: is,
stroke: os,
strokeWidth: .05,
opacity: a.opacity
});
break;

case STRUCTURE_EXTRACTOR:
this.circle(e, t, {
radius: .6,
fill: is,
stroke: ss,
strokeWidth: .05,
opacity: a.opacity
}), this.circle(e, t, {
radius: .45,
fill: rs,
opacity: a.opacity
});
break;

default:
this.circle(e, t, {
radius: .5,
fill: rs,
stroke: ss,
strokeWidth: .05,
opacity: a.opacity
});
}
}, RoomVisual.prototype.speech = function(e, t, r, o) {
var n, a, i, s, c;
void 0 === o && (o = {});
var l = null !== (n = o.background) && void 0 !== n ? n : "#2ccf3b", u = null !== (a = o.textcolor) && void 0 !== a ? a : "#000000", m = null !== (i = o.textsize) && void 0 !== i ? i : .5, p = null !== (s = o.textfont) && void 0 !== s ? s : "Times New Roman", f = null !== (c = o.opacity) && void 0 !== c ? c : 1, d = m, y = e.length * d * .4 + .4, g = d + .4;
this.rect(t - y / 2, r - 1 - g, y, g, {
fill: l,
opacity: .9 * f
});
var h = [ [ t - .1, r - 1 ], [ t + .1, r - 1 ], [ t, r - .6 ] ];
this.poly(h, {
fill: l,
opacity: .9 * f,
stroke: "transparent"
}), this.text(e, t, r - 1 - g / 2 + .1, {
color: u,
font: "".concat(d, " ").concat(p),
opacity: f
});
}, RoomVisual.prototype.animatedPosition = function(e, t, r) {
var o, n, a, i;
void 0 === r && (r = {});
var s = null !== (o = r.color) && void 0 !== o ? o : "#ff0000", c = null !== (n = r.opacity) && void 0 !== n ? n : 1, l = null !== (a = r.radius) && void 0 !== a ? a : .75, u = null !== (i = r.frames) && void 0 !== i ? i : 6, m = Game.time % u, p = l * (1 - m / u), f = c * (m / u);
this.circle(e, t, {
radius: p,
fill: "transparent",
stroke: s,
strokeWidth: .1,
opacity: f
});
}, RoomVisual.prototype.resource = function(e, t, r, o) {
var n, a;
void 0 === o && (o = .25);
var i = null !== (a = ((n = {})[RESOURCE_ENERGY] = ns, n[RESOURCE_POWER] = as, n[RESOURCE_HYDROGEN] = "#FFFFFF", 
n[RESOURCE_OXYGEN] = "#DDDDDD", n[RESOURCE_UTRIUM] = "#48C5E5", n[RESOURCE_LEMERGIUM] = "#24D490", 
n[RESOURCE_KEANIUM] = "#9269EC", n[RESOURCE_ZYNTHIUM] = "#D9B478", n[RESOURCE_CATALYST] = "#F26D6F", 
n[RESOURCE_GHODIUM] = "#FFFFFF", n)[e]) && void 0 !== a ? a : "#CCCCCC";
this.circle(t, r, {
radius: o,
fill: is,
opacity: .9
}), this.circle(t, r, {
radius: .8 * o,
fill: i,
opacity: .8
});
var s = e.length <= 2 ? e : e.substring(0, 2).toUpperCase();
this.text(s, t, r + .03, {
color: is,
font: "".concat(1.2 * o, " monospace"),
align: "center",
opacity: .9
});
});

var ls = Yr("CreepContext"), us = ((ts = {})[STRUCTURE_SPAWN] = 100, ts[STRUCTURE_EXTENSION] = 90, 
ts[STRUCTURE_TOWER] = 80, ts[STRUCTURE_RAMPART] = 75, ts[STRUCTURE_WALL] = 70, ts[STRUCTURE_STORAGE] = 70, 
ts[STRUCTURE_CONTAINER] = 60, ts[STRUCTURE_ROAD] = 30, ts), ms = new Map;

function ps(e) {
e._allStructuresLoaded || (e.allStructures = e.room.find(FIND_STRUCTURES), e._allStructuresLoaded = !0);
}

function fs(e) {
return void 0 === e._prioritizedSites && (e._prioritizedSites = e.room.find(FIND_MY_CONSTRUCTION_SITES).sort(function(e, t) {
var r, o, n = null !== (r = us[e.structureType]) && void 0 !== r ? r : 50;
return (null !== (o = us[t.structureType]) && void 0 !== o ? o : 50) - n;
})), e._prioritizedSites;
}

function ds(e) {
return void 0 === e._repairTargets && (ps(e), e._repairTargets = e.allStructures.filter(function(e) {
return e.hits < .75 * e.hitsMax && e.structureType !== STRUCTURE_WALL;
})), e._repairTargets;
}

function ys(e) {
var t, r, o = e.room, n = e.memory, a = function(e) {
var t = ms.get(e.name);
if (t && t.tick === Game.time) return t;
var r = {
tick: Game.time,
room: e,
hostiles: Ya(e, FIND_HOSTILE_CREEPS),
myStructures: e.find(FIND_MY_STRUCTURES),
allStructures: []
};
return ms.set(e.name, r), r;
}(o);
void 0 === n.working && (n.working = e.store.getUsedCapacity() > 0, ls.debug("".concat(e.name, " initialized working=").concat(n.working, " from carry state"), {
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
return null !== (e = (void 0 === (t = a)._minerals && (t._minerals = t.room.find(FIND_MINERALS)), 
t._minerals)[0]) && void 0 !== e ? e : null;
},
get energyAvailable() {
return (e = a, void 0 === e._activeSources && (e._activeSources = e.room.find(FIND_SOURCES_ACTIVE)), 
e._activeSources).length > 0;
var e;
},
get nearbyEnemies() {
return a.hostiles.length > 0 && function(e, t) {
var r, o;
try {
for (var n = i(t), a = n.next(); !a.done; a = n.next()) {
var s = a.value, c = Math.abs(e.x - s.pos.x), l = Math.abs(e.y - s.pos.y);
if (Math.max(c, l) <= 10) return !0;
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
}(e.pos, a.hostiles);
},
get constructionSiteCount() {
return fs(a).length;
},
get damagedStructureCount() {
return ds(a).length;
},
get droppedResources() {
return void 0 === (e = a)._droppedResources && (e._droppedResources = e.room.find(FIND_DROPPED_RESOURCES, {
filter: function(e) {
return e.resourceType === RESOURCE_ENERGY && e.amount > 50 || e.resourceType !== RESOURCE_ENERGY && e.amount > 0;
}
})), e._droppedResources;
var e;
},
get containers() {
return void 0 === (e = a)._containers && (ps(e), e._containers = e.allStructures.filter(function(e) {
return e.structureType === STRUCTURE_CONTAINER;
})), e._containers;
var e;
},
get depositContainers() {
return void 0 === (e = a)._depositContainers && (ps(e), e._depositContainers = e.allStructures.filter(function(e) {
return e.structureType === STRUCTURE_CONTAINER;
})), e._depositContainers;
var e;
},
get spawnStructures() {
return void 0 === (e = a)._spawnStructures && (e._spawnStructures = e.myStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_EXTENSION;
})), e._spawnStructures;
var e;
},
get towers() {
return void 0 === (e = a)._towers && (e._towers = e.myStructures.filter(function(e) {
return e.structureType === STRUCTURE_TOWER;
})), e._towers;
var e;
},
storage: o.storage,
terminal: o.terminal,
hostiles: a.hostiles,
get damagedAllies() {
return void 0 === (e = a)._damagedAllies && (e._damagedAllies = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
return e.hits < e.hitsMax;
}
})), e._damagedAllies;
var e;
},
get prioritizedSites() {
return fs(a);
},
get repairTargets() {
return ds(a);
},
get labs() {
return void 0 === (e = a)._labs && (e._labs = e.myStructures.filter(function(e) {
return e.structureType === STRUCTURE_LAB;
})), e._labs;
var e;
},
get factory() {
return (e = a)._factoryChecked || (e._factory = e.myStructures.find(function(e) {
return e.structureType === STRUCTURE_FACTORY;
}), e._factoryChecked = !0), e._factory;
var e;
},
get tombstones() {
return void 0 === (e = a)._tombstones && (e._tombstones = e.room.find(FIND_TOMBSTONES)), 
e._tombstones;
var e;
},
get mineralContainers() {
return void 0 === (e = a)._mineralContainers && (e._mineralContainers = e.room.find(FIND_STRUCTURES, {
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

var gs, hs = {}, vs = function() {
if (gs) return hs;
gs = 1, Object.defineProperty(hs, "__esModule", {
value: !0
});
var e = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : void 0 !== y ? y : "undefined" != typeof self ? self : {}, t = function(e) {
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
var d, g, h = function(e, t) {
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
}, S = C, w = S({}.toString), b = S("".slice), O = function(e) {
return b(w(e), 8, -1);
}, _ = n, x = O, U = Object, A = C("".split), N = _(function() {
return !U("z").propertyIsEnumerable(0);
}) ? function(e) {
return "String" === x(e) ? A(e, "") : U(e);
} : U, M = function(e) {
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
}, H = B, W = function(e) {
return "object" == typeof e ? null !== e : H(e);
}, Y = r, K = B, j = function(e, t) {
return arguments.length < 2 ? (r = Y[e], K(r) ? r : void 0) : Y[e] && Y[e][t];
var r;
}, V = C({}.isPrototypeOf), q = r.navigator, z = q && q.userAgent, X = r, Q = z ? String(z) : "", Z = X.process, $ = X.Deno, J = Z && Z.versions || $ && $.version, ee = J && J.v8;
ee && (g = (d = ee.split("."))[0] > 0 && d[0] < 4 ? 1 : +(d[0] + d[1])), !g && Q && (!(d = Q.match(/Edge\/(\d+)/)) || d[1] >= 74) && (d = Q.match(/Chrome\/(\d+)/)) && (g = +d[1]);
var te = g, re = n, oe = r.String, ne = !!Object.getOwnPropertySymbols && !re(function() {
var e = Symbol("symbol detection");
return !oe(e) || !(Object(e) instanceof Symbol) || !Symbol.sham && te && te < 41;
}), ae = ne && !Symbol.sham && "symbol" == typeof Symbol.iterator, ie = j, se = B, ce = V, le = Object, ue = ae ? function(e) {
return "symbol" == typeof e;
} : function(e) {
var t = ie("Symbol");
return se(t) && ce(t.prototype, le(e));
}, me = String, pe = B, fe = TypeError, de = function(e) {
if (pe(e)) return e;
throw new fe(function(e) {
try {
return me(e);
} catch (e) {
return "Object";
}
}(e) + " is not a function");
}, ye = de, ge = M, he = l, ve = B, Re = W, Ee = TypeError, Te = {
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
}, be = r, Oe = we, _e = "__core-js_shared__", xe = Te.exports = be[_e] || Oe(_e, {});
(xe.versions || (xe.versions = [])).push({
version: "3.42.0",
mode: "global",
copyright: "© 2014-2025 Denis Pushkarev (zloirock.ru)",
license: "https://github.com/zloirock/core-js/blob/v3.42.0/LICENSE",
source: "https://github.com/zloirock/core-js"
});
var Ue = Te.exports, Ae = Ue, Ne = function(e, t) {
return Ae[e] || (Ae[e] = t || {});
}, Me = I, ke = Object, Pe = function(e) {
return ke(Me(e));
}, Ie = Pe, Ge = C({}.hasOwnProperty), Le = Object.hasOwn || function(e, t) {
return Ge(Ie(e), t);
}, De = C, Fe = 0, Be = Math.random(), He = De(1..toString), We = function(e) {
return "Symbol(" + (void 0 === e ? "" : e) + ")_" + He(++Fe + Be, 36);
}, Ye = Ne, Ke = Le, je = We, Ve = ne, qe = ae, ze = r.Symbol, Xe = Ye("wks"), Qe = qe ? ze.for || ze : ze && ze.withoutSetter || je, Ze = function(e) {
return Ke(Xe, e) || (Xe[e] = Ve && Ke(ze, e) ? ze[e] : Qe("Symbol." + e)), Xe[e];
}, $e = l, Je = W, et = ue, tt = TypeError, rt = Ze("toPrimitive"), ot = ue, nt = function(e) {
var t = function(e, t) {
if (!Je(e) || et(e)) return e;
var r, o, n = (o = e[rt], ge(o) ? void 0 : ye(o));
if (n) {
if (void 0 === t && (t = "default"), r = $e(n, e, t), !Je(r) || et(r)) return r;
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
}), mt = a, pt = l, ft = u, dt = h, yt = D, gt = nt, ht = Le, vt = ut, Rt = Object.getOwnPropertyDescriptor;
o.f = mt ? Rt : function(e, t) {
if (e = yt(e), t = gt(t), vt) try {
return Rt(e, t);
} catch (e) {}
if (ht(e, t)) return dt(!pt(ft.f, e, t), e[t]);
};
var Et = {}, Tt = a && n(function() {
return 42 !== Object.defineProperty(function() {}, "prototype", {
value: 42,
writable: !1
}).prototype;
}), Ct = W, St = String, wt = TypeError, bt = function(e) {
if (Ct(e)) return e;
throw new wt(St(e) + " is not an object");
}, Ot = a, _t = ut, xt = Tt, Ut = bt, At = nt, Nt = TypeError, Mt = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, Pt = "enumerable", It = "configurable", Gt = "writable";
Et.f = Ot ? xt ? function(e, t, r) {
if (Ut(e), t = At(t), Ut(r), "function" == typeof e && "prototype" === t && "value" in r && Gt in r && !r[Gt]) {
var o = kt(e, t);
o && o[Gt] && (e[t] = r.value, r = {
configurable: It in r ? r[It] : o[It],
enumerable: Pt in r ? r[Pt] : o[Pt],
writable: !1
});
}
return Mt(e, t, r);
} : Mt : function(e, t, r) {
if (Ut(e), t = At(t), Ut(r), _t) try {
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
}, Ht = a, Wt = Le, Yt = Function.prototype, Kt = Ht && Object.getOwnPropertyDescriptor, jt = {
CONFIGURABLE: Wt(Yt, "name") && (!Ht || Ht && Kt(Yt, "name").configurable)
}, Vt = B, qt = Ue, zt = C(Function.toString);
Vt(qt.inspectSource) || (qt.inspectSource = function(e) {
return zt(e);
});
var Xt, Qt, Zt, $t = qt.inspectSource, Jt = B, er = r.WeakMap, tr = Jt(er) && /native code/.test(String(er)), rr = We, or = Ne("keys"), nr = function(e) {
return or[e] || (or[e] = rr(e));
}, ar = {}, ir = tr, sr = r, cr = Ft, lr = Le, ur = Ue, mr = nr, pr = ar, fr = "Object already initialized", dr = sr.TypeError, yr = sr.WeakMap;
if (ir || ur.state) {
var gr = ur.state || (ur.state = new yr);
gr.get = gr.get, gr.has = gr.has, gr.set = gr.set, Xt = function(e, t) {
if (gr.has(e)) throw new dr(fr);
return t.facade = e, gr.set(e, t), t;
}, Qt = function(e) {
return gr.get(e) || {};
}, Zt = function(e) {
return gr.has(e);
};
} else {
var hr = mr("state");
pr[hr] = !0, Xt = function(e, t) {
if (lr(e, hr)) throw new dr(fr);
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
}, Rr = C, Er = n, Tr = B, Cr = Le, Sr = a, wr = jt.CONFIGURABLE, br = $t, Or = vr.enforce, _r = vr.get, xr = String, Ur = Object.defineProperty, Ar = Rr("".slice), Nr = Rr("".replace), Mr = Rr([].join), kr = Sr && !Er(function() {
return 8 !== Ur(function() {}, "length", {
value: 8
}).length;
}), Pr = String(String).split("String"), Ir = Bt.exports = function(e, t, r) {
"Symbol(" === Ar(xr(t), 0, 7) && (t = "[" + Nr(xr(t), /^Symbol\(([^)]*)\).*$/, "$1") + "]"), 
r && r.getter && (t = "get " + t), r && r.setter && (t = "set " + t), (!Cr(e, "name") || wr && e.name !== t) && (Sr ? Ur(e, "name", {
value: t,
configurable: !0
}) : e.name = t), kr && r && Cr(r, "arity") && e.length !== r.arity && Ur(e, "length", {
value: r.arity
});
try {
r && Cr(r, "constructor") && r.constructor ? Sr && Ur(e, "prototype", {
writable: !1
}) : e.prototype && (e.prototype = void 0);
} catch (e) {}
var o = Or(e);
return Cr(o, "source") || (o.source = Mr(Pr, "string" == typeof t ? t : "")), e;
};
Function.prototype.toString = Ir(function() {
return Tr(this) && _r(this).source || br(this);
}, "toString");
var Gr = Bt.exports, Lr = B, Dr = Et, Fr = Gr, Br = we, Hr = {}, Wr = Math.ceil, Yr = Math.floor, Kr = Math.trunc || function(e) {
var t = +e;
return (t > 0 ? Yr : Wr)(t);
}, jr = function(e) {
var t = +e;
return t != t || 0 === t ? 0 : Kr(t);
}, Vr = jr, qr = Math.max, zr = Math.min, Xr = jr, Qr = Math.min, Zr = function(e) {
return t = e.length, (r = Xr(t)) > 0 ? Qr(r, 9007199254740991) : 0;
var t, r;
}, $r = D, Jr = Zr, eo = {
indexOf: function(e, t, r) {
var o = $r(e), n = Jr(o);
if (0 === n) return -1;
for (var a = function(e, t) {
var r = Vr(e);
return r < 0 ? qr(r + t, 0) : zr(r, t);
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
var mo = j, po = Hr, fo = uo, yo = bt, go = C([].concat), ho = mo("Reflect", "ownKeys") || function(e) {
var t = po.f(yo(e)), r = fo.f;
return r ? go(t, r(e)) : t;
}, vo = Le, Ro = ho, Eo = o, To = Et, Co = n, So = B, wo = /#|\.prototype\./, bo = function(e, t) {
var r = _o[Oo(e)];
return r === Uo || r !== xo && (So(t) ? Co(t) : !!t);
}, Oo = bo.normalize = function(e) {
return String(e).replace(wo, ".").toLowerCase();
}, _o = bo.data = {}, xo = bo.NATIVE = "N", Uo = bo.POLYFILL = "P", Ao = bo, No = r, Mo = o.f, ko = Ft, Po = function(e, t, r, o) {
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
}, Lo = Ao, Do = function(e, t) {
var r, o, n, a, i, s = e.target, c = e.global, l = e.stat;
if (r = c ? No : l ? No[s] || Io(s, {}) : No[s] && No[s].prototype) for (o in t) {
if (a = t[o], n = e.dontCallGetSet ? (i = Mo(r, o)) && i.value : r[o], !Lo(c ? o : s + (l ? "." : "#") + o, e.forced) && void 0 !== n) {
if (typeof a == typeof n) continue;
Go(a, n);
}
(e.sham || n && n.sham) && ko(a, "sham", !0), Po(r, o, a, e);
}
}, Fo = O, Bo = Array.isArray || function(e) {
return "Array" === Fo(e);
}, Ho = TypeError, Wo = O, Yo = C, Ko = function(e) {
if ("Function" === Wo(e)) return Yo(e);
}, jo = de, Vo = i, qo = Ko(Ko.bind), zo = Bo, Xo = Zr, Qo = function(e) {
if (e > 9007199254740991) throw Ho("Maximum allowed index exceeded");
return e;
}, Zo = function(e, t, r, o, n, a, i, s) {
for (var c, l, u = n, m = 0, p = !!i && function(e, t) {
return jo(e), void 0 === t ? e : Vo ? qo(e, t) : function() {
return e.apply(t, arguments);
};
}(i, s); m < o; ) m in r && (c = p ? p(r[m], m, t) : r[m], a > 0 && zo(c) ? (l = Xo(c), 
u = Zo(e, t, c, l, u, a - 1) - 1) : (Qo(u + 1), e[u] = c), u++), m++;
return u;
}, $o = Zo, Jo = {};
Jo[Ze("toStringTag")] = "z";
var en = "[object z]" === String(Jo), tn = B, rn = O, on = Ze("toStringTag"), nn = Object, an = "Arguments" === rn(function() {
return arguments;
}()), sn = C, cn = n, ln = B, un = en ? rn : function(e) {
var t, r, o;
return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (r = function(e, t) {
try {
return e[t];
} catch (e) {}
}(t = nn(e), on)) ? r : an ? rn(t) : "Object" === (o = rn(t)) && tn(t.callee) ? "Arguments" : o;
}, mn = $t, pn = function() {}, fn = j("Reflect", "construct"), dn = /^\s*(?:class|function)\b/, yn = sn(dn.exec), gn = !dn.test(pn), hn = function(e) {
if (!ln(e)) return !1;
try {
return fn(pn, [], e), !0;
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
return gn || !!yn(dn, mn(e));
} catch (e) {
return !0;
}
};
vn.sham = !0;
var Rn = !fn || cn(function() {
var e;
return hn(hn.call) || !hn(Object) || !hn(function() {
e = !0;
}) || e;
}) ? vn : hn, En = Bo, Tn = Rn, Cn = W, Sn = Ze("species"), wn = Array, bn = function(e, t) {
return new (function(e) {
var t;
return En(e) && (t = e.constructor, (Tn(t) && (t === wn || En(t.prototype)) || Cn(t) && null === (t = t[Sn])) && (t = void 0)), 
void 0 === t ? wn : t;
}(e))(0 === t ? 0 : t);
}, On = $o, _n = de, xn = Pe, Un = Zr, An = bn;
Do({
target: "Array",
proto: !0
}, {
flatMap: function(e) {
var t, r = xn(this), o = Un(r);
return _n(e), (t = An(r, 0)).length = On(t, r, r, o, 0, 1, e, arguments.length > 1 ? arguments[1] : void 0), 
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
var Hn, Wn = j("document", "documentElement"), Yn = bt, Kn = Nn, jn = so, Vn = ar, qn = Wn, zn = ct, Xn = "prototype", Qn = "script", Zn = nr("IE_PROTO"), $n = function() {}, Jn = function(e) {
return "<" + Qn + ">" + e + "</" + Qn + ">";
}, ea = function(e) {
e.write(Jn("")), e.close();
var t = e.parentWindow.Object;
return e = null, t;
}, ta = function() {
try {
Hn = new ActiveXObject("htmlfile");
} catch (e) {}
var e, t, r;
ta = "undefined" != typeof document ? document.domain && Hn ? ea(Hn) : (t = zn("iframe"), 
r = "java" + Qn + ":", t.style.display = "none", qn.appendChild(t), t.src = String(r), 
(e = t.contentWindow.document).open(), e.write(Jn("document.F=Object")), e.close(), 
e.F) : ea(Hn);
for (var o = jn.length; o--; ) delete ta[Xn][jn[o]];
return ta();
};
Vn[Zn] = !0;
var ra = Ze, oa = Object.create || function(e, t) {
var r;
return null !== e ? ($n[Xn] = Yn(e), r = new $n, $n[Xn] = null, r[Zn] = e) : r = ta(), 
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
var ma = $o, pa = Pe, fa = Zr, da = jr, ya = bn;
Do({
target: "Array",
proto: !0
}, {
flat: function() {
var e = arguments.length ? arguments[0] : void 0, t = pa(this), r = fa(t), o = ya(t, 0);
return o.length = ma(o, t, t, r, 0, void 0 === e ? 1 : da(e)), o;
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
const u = i ? o.depth.length : s(r.codePointAt(c++)), m = i ? 0 : o.depth, p = i ? o.depth : [], f = new Array(u);
let d = 0, y = s(r.codePointAt(c++));
for (;l < u; ) {
const o = m || p[l];
let n = 0, a = 0;
for (;a < o; ) {
const i = e - d, m = o - a, p = Math.min(i, m);
let f = Math.floor(y / t[d]);
if (f %= t[p], f *= t[a], n += f, a += p, d += p, d === e) {
if (l + 1 === u && a === o) break;
y = s(r.codePointAt(c++)), d = 0;
}
}
a > 0 && (f[l++] = n);
}
return [ f, c ];
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
var Ta = Ea;
const Ca = new Ta.Codec({
array: !1
}), Sa = {
key: "ns",
serialize(e) {
if (void 0 !== e) return Ca.encode(e);
},
deserialize(e) {
if (void 0 !== e) return Ca.decode(e);
}
}, wa = (e, t) => `cg_${e.key}_${t}`, ba = (e, t) => Object.assign(Object.assign({}, e), {
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
with: t => ba(e, t)
});
function Oa() {
var e, t;
return null !== (e = Memory[t = ga.MEMORY_CACHE_PATH]) && void 0 !== e || (Memory[t] = {}), 
Memory[ga.MEMORY_CACHE_PATH];
}
function _a() {
var e, t;
return null !== (e = Memory[t = ga.MEMORY_CACHE_EXPIRATION_PATH]) && void 0 !== e || (Memory[t] = {}), 
Memory[ga.MEMORY_CACHE_EXPIRATION_PATH];
}
const xa = {
set(e, t, r) {
if (Oa()[e] = t, void 0 !== r) {
const t = Sa.serialize(r);
t && (_a()[e] = t);
}
},
get: e => Oa()[e],
expires: e => Sa.deserialize(_a()[e]),
delete(e) {
delete Oa()[e];
},
with: e => ba(xa, e),
clean() {
const e = _a();
for (const t in e) {
const r = Sa.deserialize(e[t]);
void 0 !== r && Game.time >= r && (xa.delete(t), delete e[t]);
}
}
}, Ua = (e, t, r = 1 / 0) => {
let o = new Map, n = Game.time;
return (...a) => {
Game.time >= n + r && (n = Game.time, o = new Map);
const i = e(...a);
return o.has(i) || o.set(i, t(...a)), o.get(i);
};
}, Aa = (e, t) => Ua(e, t, 1), Na = Ua(e => e, e => {
for (let t = 2; t < e.length; t++) if ("N" === e[t] || "S" === e[t]) {
const r = e[0], o = e[t];
let n = parseInt(e.slice(1, t)), a = parseInt(e.slice(t + 1));
return "W" === r && (n = -n - 1), "N" === o && (a = -a - 1), n += 128, a += 128, 
n << 8 | a;
}
throw new Error(`Invalid room name ${e}`);
}), Ma = (e, t, r) => {
const o = Object.create(RoomPosition.prototype);
return o.__packedPos = Na(r) << 16 | e << 8 | t, o;
}, ka = (e, t, r) => {
const o = Object.create(RoomPosition.prototype);
return o.__packedPos = 4294901760 & e.__packedPos | t << 8 | r, o;
}, Pa = (e, t, r) => {
const o = e.__packedPos >> 8 & 255, n = 255 & e.__packedPos, a = Object.create(RoomPosition.prototype);
return a.__packedPos = 4294901760 & e.__packedPos | o + t << 8 | n + r, a;
}, Ia = new Ta.Codec({
array: !1,
depth: 28
}), Ga = new Ta.Codec({
array: !0,
depth: 12
}), La = new Ta.Codec({
depth: 3,
array: !0
}), Da = new Ta.Codec({
array: !0,
depth: 16
}), Fa = [ "WN", "EN", "WS", "ES" ], Ba = e => {
const t = (65280 & e.__packedPos) >> 8, r = 255 & e.__packedPos, o = e.__packedPos >>> 4 & 4294963200 | t << 6 | r;
return Ia.encode(o);
}, Ha = function(e) {
const t = Ia.decode(e), r = t << 4 & 4294901760 | (4032 & t) >> 6 << 8 | 63 & t, o = Object.create(RoomPosition.prototype);
if (o.__packedPos = r, o.x > 49 || o.y > 49) throw new Error("Invalid room position");
return o;
}, Wa = e => Ka([ e ]), Ya = e => ja(e)[0], Ka = e => Ga.encode(e.map(e => e.x << 6 | e.y)), ja = e => Ga.decode(e).map(e => {
const t = {
x: (4032 & e) >> 6,
y: 63 & e
};
if (t.x > 49 || t.y > 49) throw new Error("Invalid packed coord");
return t;
}), Va = e => e.map(e => Ba(e)).join(""), qa = e => {
var t;
return null === (t = e.match(/.{1,2}/g)) || void 0 === t ? void 0 : t.map(e => Ha(e));
}, za = e => {
let t = e.match(/^([WE])([0-9]+)([NS])([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
let [, r, o, n, a] = t;
return {
wx: "W" == r ? ~Number(o) : Number(o),
wy: "N" == n ? ~Number(a) : Number(a)
};
}, Xa = (e, t) => `${e < 0 ? "W" : "E"}${e = e < 0 ? ~e : e}${t < 0 ? "N" : "S"}${t = t < 0 ? ~t : t}`, Qa = e => {
let {x: t, y: r, roomName: o} = e;
if (t < 0 || t >= 50) throw new RangeError("x value " + t + " not in range");
if (r < 0 || r >= 50) throw new RangeError("y value " + r + " not in range");
if ("sim" == o) throw new RangeError("Sim room does not have world position");
let {wx: n, wy: a} = za(o);
return {
x: 50 * Number(n) + t,
y: 50 * Number(a) + r
};
}, Za = e => {
let [t, r] = [ Math.floor(e.x / 50), e.x % 50 ], [o, n] = [ Math.floor(e.y / 50), e.y % 50 ];
t < 0 && r < 0 && (r = 49 - ~r), o < 0 && n < 0 && (n = 49 - ~n);
let a = Xa(t, o);
return Ma(r, n, a);
}, $a = (e, t) => {
if (e.roomName === t.roomName) return e.getRangeTo(t);
let r = Qa(e), o = Qa(t);
return Math.max(Math.abs(r.x - o.x), Math.abs(r.y - o.y));
};
function Ja(e, t) {
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
const {wx: t, wy: r} = za(e.roomName);
a = Xa(t - 1, r), o = 49;
} else if (o > 49) {
const {wx: t, wy: r} = za(e.roomName);
a = Xa(t + 1, r), o = 0;
} else if (n < 0) {
const {wx: t, wy: r} = za(e.roomName);
a = Xa(t, r - 1), n = 49;
} else if (n > 49) {
const {wx: t, wy: r} = za(e.roomName);
a = Xa(t, r + 1), n = 0;
}
return a === e.roomName ? ka(e, o, n) : Ma(o, n, a);
}
const ei = e => Da.encode(e.map(e => {
const [t, r, o, n, a] = e.split(/([A-Z])([0-9]+)([A-Z])([0-9]+)/);
return Fa.indexOf(r + n) << 14 | parseInt(o) << 7 | parseInt(a);
})), ti = e => Da.decode(e).map(e => {
const t = e >> 14, r = e >> 7 & 127, o = 127 & e, [n, a] = Fa[t].split("");
return `${n}${r}${a}${o}`;
}), ri = e => ei([ e ]), oi = e => ti(e)[0], ni = new Ta.Codec({
array: !1,
depth: 15
}), ai = {
key: "mts",
serialize(e) {
if (void 0 !== e) return `${Ba(e.pos)}${ni.encode(e.range)}`;
},
deserialize(e) {
if (void 0 !== e) return {
pos: Ha(e.slice(0, 2)),
range: ni.decode(e.slice(2))
};
}
}, ii = {
key: "mtls",
serialize(e) {
if (void 0 !== e) return e.map(e => ai.serialize(e)).join("");
},
deserialize(e) {
if (void 0 === e) return;
const t = [];
for (let r = 0; r < e.length; r += 3) {
const o = ai.deserialize(e.slice(r, r + 3));
o && t.push(o);
}
return t;
}
}, si = {
key: "ps",
serialize(e) {
if (void 0 !== e) return Ba(e);
},
deserialize(e) {
if (void 0 !== e) return Ha(e);
}
}, ci = {
key: "pls",
serialize(e) {
if (void 0 !== e) return Va(e);
},
deserialize(e) {
if (void 0 !== e) return qa(e);
}
}, li = {
key: "cs",
serialize(e) {
if (void 0 !== e) return Wa(e);
},
deserialize(e) {
if (void 0 !== e) return Ya(e);
}
}, ui = {
key: "cls",
serialize(e) {
if (void 0 !== e) return Ka(e);
},
deserialize(e) {
if (void 0 !== e) return ja(e);
}
};
function mi() {
xa.clean(), Ra.clean();
}
const pi = {
HeapCache: Ra,
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
const di = e => 0 === e.x || 0 === e.y || 49 === e.x || 49 === e.y, yi = Ua((e, t = !0, r = !1) => {
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
}), t && (o = o.flatMap(gi)), r) {
const e = new fi;
for (const {pos: r, range: n} of o) Ei(r, n + 1).filter(e => !!Ci(e, !0, !1) && (!t || e.roomName === r.roomName && !di(e))).forEach(t => e.add(t));
for (const t of e) o.some(e => e.pos.inRangeTo(t, e.range)) && e.delete(t);
o = [ ...e ].map(e => ({
pos: e,
range: 0
}));
}
return o;
});
function gi({pos: e, range: t}) {
if (0 === t || e.x > t && 49 - e.x > t && e.y > t && 49 - e.y > t) return [ {
pos: e,
range: t
} ];
const r = Math.max(1, e.x - t), o = Math.min(48, e.x + t), n = Math.max(1, e.y - t), a = Math.min(48, e.y + t), i = o - r + 1, s = a - n + 1, c = Math.floor((Math.min(i, s) - 1) / 2), l = Math.floor(i / (c + 1)), u = Math.floor(s / (c + 1)), m = new Set(Array(l).fill(0).map((e, t) => Math.min(o - c, r + c + t * (2 * c + 1)))), p = new Set(Array(u).fill(0).map((e, t) => Math.min(a - c, n + c + t * (2 * c + 1)))), f = [];
for (const t of m) for (const r of p) f.push({
pos: ka(e, t, r),
range: c
});
return f;
}
const hi = (e = 1) => {
let t = new Array(2 * e + 1).fill(0).map((t, r) => r - e);
return t.flatMap(e => t.map(t => ({
x: e,
y: t
}))).filter(e => !(0 === e.x && 0 === e.y));
}, vi = e => Ri(e, 1), Ri = (e, t, r = !1) => {
if (0 === t) return [ e ];
let o = [];
return o = hi(t).map(t => e.x + t.x < 0 || e.x + t.x > 49 || e.y + t.y < 0 || e.y + t.y > 49 ? null : Pa(e, t.x, t.y)).filter(e => null !== e), 
r && o.push(e), o;
}, Ei = (e, t) => {
const r = Qa(e);
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
}, Ti = (e, t = !1) => vi(e).filter(e => Ci(e, t)), Ci = (e, t = !1, r = !1) => {
let o;
try {
o = Game.map.getRoomTerrain(e.roomName);
} catch (e) {
return !1;
}
return !(o.get(e.x, e.y) === TERRAIN_MASK_WALL || Game.rooms[e.roomName] && e.look().some(e => !(t || e.type !== LOOK_CREEPS && e.type !== LOOK_POWER_CREEPS) || !(r || !e.constructionSite || !e.constructionSite.my || !OBSTACLE_OBJECT_TYPES.includes(e.constructionSite.structureType)) || !(r || !e.structure || !(OBSTACLE_OBJECT_TYPES.includes(e.structure.structureType) || e.structure instanceof StructureRampart && !e.structure.my))));
}, Si = e => {
let t = e.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
return Number(t[1]) % 10 == 0 || Number(t[2]) % 10 == 0;
}, wi = e => {
let t = e.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
if (!t) throw new Error("Invalid room name");
let r = Number(t[1]) % 10, o = Number(t[2]) % 10;
return !(5 === r && 5 === o) && r >= 4 && r <= 6 && o >= 4 && o <= 6;
}, bi = (e, t, r) => r ? e.slice(0, t) : e.slice(t + 1), Oi = e => "_ck" + e;
function _i(e) {
wi(e) && !xa.get(Oi(e)) && xa.with(ci).set(Oi(e), [ ...Game.rooms[e].find(FIND_SOURCES), ...Game.rooms[e].find(FIND_MINERALS) ].map(e => e.pos));
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
class Ui extends xi {
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
var Ai, Ni, Mi, ki;
const Pi = new Ta.Codec({
array: !1,
depth: 30
}), Ii = new Map;
null !== (Ai = Memory[ki = ga.MEMORY_PORTAL_PATH]) && void 0 !== Ai || (Memory[ki] = []);
for (const e of Memory[ga.MEMORY_PORTAL_PATH]) {
const t = Di(e), r = null !== (Ni = Ii.get(t.room1)) && void 0 !== Ni ? Ni : new Map;
r.set(t.room2, t), Ii.set(t.room1, r);
const o = null !== (Mi = Ii.get(t.room2)) && void 0 !== Mi ? Mi : new Map;
o.set(t.room1, t), Ii.set(t.room2, o);
}
function Gi(e) {
var t, r, o, n, a;
if (!Si(e) && !(e => {
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
portalMap: new Ui
};
r.set(o.destination.roomName, n), n.portalMap.set(o.pos, o.destination), o.ticksToDecay ? n.expires = Game.time + o.ticksToDecay : delete n.expires;
}
return [ ...r.values() ];
}(e)) (null !== (t = Ii.get(o.room1)) && void 0 !== t ? t : new Map).set(o.room2, o), 
(null !== (r = Ii.get(o.room2)) && void 0 !== r ? r : new Map).set(o.room1, o), 
i.add(o.room2);
const s = Ii.get(e);
for (const t of null !== (o = null == s ? void 0 : s.keys()) && void 0 !== o ? o : []) i.has(t) || (null === (n = Ii.get(e)) || void 0 === n || n.delete(t), 
null === (a = Ii.get(t)) || void 0 === a || a.delete(e));
}
function Li(e) {
var t;
let r = "";
return r += ri(e.room1), r += ri(e.room2), r += Pi.encode(null !== (t = e.expires) && void 0 !== t ? t : 0), 
r += Ka([ ...e.portalMap.entries() ].flat()), r;
}
function Di(e) {
const t = oi(e.slice(0, 3)), r = oi(e.slice(3, 6)), o = Pi.decode(e.slice(6, 8)), n = new Ui, a = ja(e.slice(8));
for (let e = 0; e < a.length; e += 2) n.set(a[e], a[e + 1]);
return {
room1: t,
room2: r,
expires: 0 !== o ? o : void 0,
portalMap: n
};
}
function Fi(e) {
var t;
const r = new Set(Object.values(null !== (t = Game.map.describeExits(e)) && void 0 !== t ? t : {})), o = Ii.get(e);
if (!o) return [ ...r ];
for (const e of o.values()) r.add(e.room2);
return [ ...r ];
}
const Bi = new Ta.Codec({
array: !1,
depth: 15
}), Hi = (e, t) => {
var r;
if (!e || !e.length) throw new Error("Empty id");
let o = e;
o.length % 3 != 0 && (o = o.padStart(3 * Math.ceil(o.length / 3), "0"));
let n = "";
for (let e = 0; e < o.length; e += 3) n += Bi.encode(parseInt(o.slice(e, e + 3), 16));
return null !== (r = n + t) && void 0 !== r ? r : "";
}, Wi = (e, t) => Hi(e.id, t);
var Yi = Object.freeze({
__proto__: null,
creepKey: Wi,
objectIdKey: Hi,
roomKey: (e, t) => ri(e) + (null != t ? t : "")
});
const Ki = (e, t) => r => {
var o;
if (t && !t.includes(r)) return !1;
let n = null === (o = e.roomCallback) || void 0 === o ? void 0 : o.call(e, r);
return !1 === n ? n : ((e, t, r) => {
var o, n, a, i, s, c, l;
if (r.avoidCreeps && (null === (o = Game.rooms[t]) || void 0 === o || o.find(FIND_CREEPS).forEach(t => e.set(t.pos.x, t.pos.y, 255)), 
null === (n = Game.rooms[t]) || void 0 === n || n.find(FIND_POWER_CREEPS).forEach(t => e.set(t.pos.x, t.pos.y, 255))), 
r.avoidSourceKeepers && function(e, t) {
var r;
const o = null !== (r = xa.with(ci).get(Oi(e))) && void 0 !== r ? r : [];
for (const e of o) Ri(e, 5, !0).forEach(e => t.set(e.x, e.y, 255));
}(t, e), (r.avoidObstacleStructures || r.roadCost) && (r.avoidObstacleStructures && (null === (a = Game.rooms[t]) || void 0 === a || a.find(FIND_MY_CONSTRUCTION_SITES).forEach(t => {
OBSTACLE_OBJECT_TYPES.includes(t.structureType) && e.set(t.pos.x, t.pos.y, 255);
})), null === (i = Game.rooms[t]) || void 0 === i || i.find(FIND_STRUCTURES).forEach(t => {
r.avoidObstacleStructures && (OBSTACLE_OBJECT_TYPES.includes(t.structureType) || t.structureType === STRUCTURE_RAMPART && !t.my && !t.isPublic) && e.set(t.pos.x, t.pos.y, 255), 
r.roadCost && t instanceof StructureRoad && 0 === e.get(t.pos.x, t.pos.y) && e.set(t.pos.x, t.pos.y, r.roadCost);
})), r.avoidTargets) {
const o = Game.map.getRoomTerrain(t);
for (const n of r.avoidTargets(t)) for (const t of Ri(n.pos, n.range, !0)) if (o.get(t.x, t.y) !== TERRAIN_MASK_WALL) {
const o = 254 - t.getRangeTo(n.pos) * (null !== (s = r.avoidTargetGradient) && void 0 !== s ? s : 0);
e.set(t.x, t.y, Math.max(e.get(t.x, t.y), o));
}
}
return r.ignorePortals || [ ...null !== (l = null === (c = Ii.get(t)) || void 0 === c ? void 0 : c.values()) && void 0 !== l ? l : [] ].flatMap(e => t === e.room1 ? [ ...e.portalMap.keys() ] : [ ...e.portalMap.reversed.keys() ]).forEach(t => e.set(t.x, t.y, 255)), 
e;
})(n instanceof PathFinder.CostMatrix ? n.clone() : new PathFinder.CostMatrix, r, e);
};
function ji(e, t) {
const r = Game.map.getRoomTerrain(e);
let o = !1;
for (let e = 0; e < 25; e++) {
const {x: n, y: a} = Vi(t, e);
if (r.get(n, a) !== TERRAIN_MASK_WALL) {
o = !0;
break;
}
}
let n = !1;
for (let e = 25; e < 49; e++) {
const {x: o, y: a} = Vi(t, e);
if (r.get(o, a) !== TERRAIN_MASK_WALL) {
n = !0;
break;
}
}
return [ o, n ];
}
function Vi(e, t) {
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
const zi = Aa((e, t) => e + t, (e, t) => {
const {wx: r, wy: o} = za(e), {wx: n, wy: a} = za(t);
return Math.abs(r - n) + Math.abs(o - a);
}), Xi = Aa(e => e, e => {
let t = 1 / 0;
for (const r of Ii.keys()) t = Math.min(t, zi(e, r));
return t;
});
function Qi(e, t) {
return Math.min(zi(e, t), Xi(e) + Xi(t));
}
function Zi(e, t, r) {
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
let f = function(e, t, r) {
const o = Object.assign(Object.assign({}, ga.DEFAULT_MOVE_OPTS), r), n = Ua((e, t) => e + t, (e, t) => {
var r;
const n = null === (r = o.routeCallback) || void 0 === r ? void 0 : r.call(o, e, t);
return void 0 !== n ? n : Si(e) ? o.highwayRoomCost : wi(e) ? o.sourceKeeperRoomCost : o.defaultRoomCost;
}), a = function(e, t, r, o) {
var n, a;
if (t.includes(e)) return [];
const i = null !== (n = null == r ? void 0 : r.routeCallback) && void 0 !== n ? n : () => 1, s = new qi;
s.put(e, 0);
const c = new Map, l = new Map;
c.set(e, e), l.set(e, 0);
let u = s.take();
for (;u && !t.includes(u); ) {
for (const e of Fi(u)) {
const r = l.get(u) + i(u, e);
if (r !== 1 / 0 && (!l.has(e) || r < l.get(e))) {
l.set(e, r);
const o = r + Math.min(...t.map(t => Qi(e, t)));
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
const e = c.get(u), n = null === (a = Ii.get(e)) || void 0 === a ? void 0 : a.get(u);
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
if ((null == f ? void 0 : f.length) && 1 !== f.length) {
let r = e;
const o = [];
for (const e of f) if (e.portalSet) {
const t = e.rooms.includes(e.portalSet.room1) ? e.portalSet.room1 : e.portalSet.room2, n = (t === e.portalSet.room1 ? [ ...e.portalSet.portalMap.keys() ] : [ ...e.portalSet.portalMap.values() ]).map(e => ({
pos: new RoomPosition(e.x, e.y, t),
range: 1
})), a = PathFinder.search(r, n, Object.assign(Object.assign({}, m), {
maxOps: Math.min(null !== (l = m.maxOps) && void 0 !== l ? l : 1e5, (null !== (u = m.maxOpsPerRoom) && void 0 !== u ? u : 2e3) * e.rooms.length),
roomCallback: Ki(m, e.rooms)
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
roomCallback: Ki(m, e.rooms)
}));
if (!n.path.length || n.incomplete) return;
o.push(...n.path);
}
return o;
}
{
const r = null === (o = null == f ? void 0 : f[0]) || void 0 === o ? void 0 : o.rooms, s = PathFinder.search(e, t, Object.assign(Object.assign({}, m), {
maxOps: Math.min(null !== (n = m.maxOps) && void 0 !== n ? n : 1e5, (null !== (a = m.maxOpsPerRoom) && void 0 !== a ? a : 2e3) * (null !== (i = null == r ? void 0 : r.length) && void 0 !== i ? i : 1)),
roomCallback: Ki(m, r)
}));
if (!s.path.length || s.incomplete) return;
return s.path;
}
}
let $i = new Map, Ji = 0;
function es(e) {
var t;
return Game.time !== Ji && (Ji = Game.time, $i = new Map), $i.set(e, null !== (t = $i.get(e)) && void 0 !== t ? t : {
creep: new Map,
priority: new Map,
targets: new Map,
pullers: new Set,
pullees: new Set,
prefersToStay: new Set,
blockedSquares: new Set
}), $i.get(e);
}
function ts(e, t = !1) {
var r, o, n, a;
"fatigue" in e.creep && e.creep.fatigue && !t && (e.targets = [ e.creep.pos ]), 
null !== (r = e.targetCount) && void 0 !== r || (e.targetCount = e.targets.length);
const i = es(e.creep.pos.roomName);
!function(e) {
var t, r, o, n;
if (!e) return;
null !== (t = e.targetCount) && void 0 !== t || (e.targetCount = e.targets.length);
const a = es(e.creep.pos.roomName);
a.creep.delete(e.creep.id), null === (o = null === (r = a.priority.get(e.priority)) || void 0 === r ? void 0 : r.get(e.targets.length)) || void 0 === o || o.delete(e.creep.id);
for (const t of e.targets) {
const r = Ba(t);
null === (n = a.targets.get(r)) || void 0 === n || n.delete(e.creep.id);
}
}(i.creep.get(e.creep.id)), i.creep.set(e.creep.id, e);
const s = null !== (o = i.priority.get(e.priority)) && void 0 !== o ? o : new Map;
i.priority.set(e.priority, s);
const c = null !== (n = s.get(e.targets.length)) && void 0 !== n ? n : new Map;
s.set(e.targets.length, c), c.set(e.creep.id, e);
for (const t of e.targets) {
const r = Ba(t), o = null !== (a = i.targets.get(r)) && void 0 !== a ? a : new Map;
i.targets.set(r, o), o.set(e.creep.id, e);
}
e.targets.length && e.targets[0].isEqualTo(e.creep.pos) && i.prefersToStay.add(Ba(e.creep.pos));
}
function rs(e, t, r) {
var o, n, a;
const i = es(e.creep.pos.roomName), s = null !== (o = i.priority.get(e.priority)) && void 0 !== o ? o : new Map;
null === (n = s.get(t)) || void 0 === n || n.delete(e.creep.id), i.priority.set(e.priority, s);
const c = null !== (a = s.get(r)) && void 0 !== a ? a : new Map;
s.set(r, c), c.set(e.creep.id, e);
}
const os = e => {
const t = Game.cpu.getUsed();
return e(), Math.max(0, Game.cpu.getUsed() - t);
}, ns = "_crr";
function as() {
const e = xa.with(Sa).get(ns);
return Boolean(e && Game.time - 2 <= e);
}
let is = [];
function ss(e, t) {
var r, o, n, a, i, s, c, l;
const u = Game.cpu.getUsed();
let m = 0;
const p = es(e), f = p.blockedSquares;
if (null == t ? void 0 : t.visualize) for (const {creep: e, targets: t, priority: r} of p.creep.values()) t.forEach(t => {
t.isEqualTo(e.pos) ? Game.rooms[e.pos.roomName].visual.circle(e.pos, {
radius: .5,
stroke: "orange",
fill: "transparent"
}) : Game.rooms[e.pos.roomName].visual.line(e.pos, t, {
color: "orange"
});
});
for (const r of Game.rooms[e].find(FIND_MY_CREEPS).concat(Game.rooms[e].find(FIND_MY_POWER_CREEPS))) p.creep.has(r.id) || p.pullees.has(r.id) || p.pullers.has(r.id) || (ts({
creep: r,
priority: 0,
targets: [ r.pos, ...Ti(r.pos, !0) ]
}), (null == t ? void 0 : t.visualize) && Game.rooms[r.pos.roomName].visual.circle(r.pos, {
radius: 1,
stroke: "red",
fill: "transparent "
}));
for (const e of p.pullers) {
const t = Game.getObjectById(e);
if (!t) continue;
const a = Ba(t.pos);
f.add(a);
for (const t of null !== (o = null === (r = p.targets.get(a)) || void 0 === r ? void 0 : r.values()) && void 0 !== o ? o : []) {
if (t.creep.id === e) continue;
null !== (n = t.targetCount) && void 0 !== n || (t.targetCount = t.targets.length);
const r = t.targetCount;
t.targetCount -= 1, rs(t, r, t.targetCount);
}
}
const d = [ ...p.priority.entries() ].sort((e, t) => t[0] - e[0]);
for (const [e, r] of d) for (;r.size; ) {
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
const o = Ba(t);
if (!f.has(o) || e.creep.pos.isEqualTo(t) && p.pullers.has(e.creep.id)) {
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
m += os(() => e.creep.move(e.creep.pos.getDirectionTo(r))), e.resolved = !0, (null == t ? void 0 : t.visualize) && Game.rooms[e.creep.pos.roomName].visual.line(e.creep.pos, r, {
color: "green",
width: .5
});
const u = Ba(r);
f.add(u);
for (const e of null !== (i = null === (a = p.targets.get(u)) || void 0 === a ? void 0 : a.values()) && void 0 !== i ? i : []) {
if (e.resolved) continue;
null !== (s = e.targetCount) && void 0 !== s || (e.targetCount = e.targets.length);
const t = e.targetCount;
e.targetCount -= 1, rs(e, t, e.targetCount);
}
if (!r.isEqualTo(e.creep.pos) && !p.pullers.has(e.creep.id)) {
const o = Ba(e.creep.pos), a = [ ...null !== (l = null === (c = p.targets.get(o)) || void 0 === c ? void 0 : c.values()) && void 0 !== l ? l : [] ].filter(t => t !== e && t.targets.length < 2), i = a.find(e => !e.resolved && (null == r ? void 0 : r.isEqualTo(e.creep.pos)) && !p.pullers.has(e.creep.id));
i && ((null == t ? void 0 : t.visualize) && Game.rooms[i.creep.pos.roomName].visual.circle(i.creep.pos, {
radius: .2,
fill: "green"
}), a.filter(e => e.resolved).forEach(e => {
(null == t ? void 0 : t.visualize) && Game.rooms[e.creep.pos.roomName].visual.circle(e.creep.pos, {
radius: .2,
fill: "red"
});
}), f.delete(o), n.unshift(i));
}
}
}
const y = Math.max(0, Game.cpu.getUsed() - u);
is.push(m / y), is.length > 1500 && (is = is.slice(-1500));
}
function cs(e, t, r = 1) {
return e.pos ? as() ? (ts({
creep: e,
targets: t,
priority: r
}), OK) : t[0].isEqualTo(e.pos) ? OK : e.move(e.pos.getDirectionTo(t[0])) : ERR_INVALID_ARGS;
}
const ls = e => `_poi_${e}`, us = "_cpi";
function ms(e, t, r, o) {
var n;
const a = Object.assign(Object.assign({}, ga.DEFAULT_MOVE_OPTS), o), i = null !== (n = a.cache) && void 0 !== n ? n : xa, s = yi(r, null == o ? void 0 : o.keepTargetInRoom, null == o ? void 0 : o.flee);
if (null == o ? void 0 : o.visualizePathStyle) {
const e = Object.assign(Object.assign({}, ga.DEFAULT_VISUALIZE_OPTS), o.visualizePathStyle);
for (const t of s) new RoomVisual(t.pos.roomName).rect(t.pos.x - t.range - .5, t.pos.y - t.range - .5, 2 * t.range + 1, 2 * t.range + 1, e);
}
const c = i.with(ci).get(ls(e));
if (c) return c;
const l = Zi(t, s, Object.assign(Object.assign({}, a), {
flee: !1
}));
if (l) {
const t = a.reusePath ? Game.time + a.reusePath + 1 : void 0;
i.with(ci).set(ls(e), l, t);
}
return l;
}
function ps(e, t) {
var r;
return (null !== (r = null == t ? void 0 : t.cache) && void 0 !== r ? r : xa).with(ci).get(ls(e));
}
function fs(e, t) {
var r;
(null !== (r = null == t ? void 0 : t.cache) && void 0 !== r ? r : xa).delete(ls(e));
}
function ds(e, t, r) {
var o, n, a, i;
const s = (null !== (o = null == r ? void 0 : r.cache) && void 0 !== o ? o : xa).with(ci).get(ls(t));
if (!e.pos) return ERR_INVALID_ARGS;
if (!s) return ERR_NO_PATH;
if ((null == r ? void 0 : r.reverse) && e.pos.isEqualTo(s[0]) || !(null == r ? void 0 : r.reverse) && e.pos.isEqualTo(s[s.length - 1])) return OK;
let c = Ra.get(Wi(e, us));
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
Ra.set(Wi(e, us), c);
let l = Math.max(0, Math.min(s.length - 1, (null == r ? void 0 : r.reverse) ? c - 1 : c + 1));
if (null == r ? void 0 : r.visualizePathStyle) {
const t = Object.assign(Object.assign({}, ga.DEFAULT_VISUALIZE_OPTS), r.visualizePathStyle), o = bi(s, c, null == r ? void 0 : r.reverse);
null === (i = e.room) || void 0 === i || i.visual.poly(o.filter(t => {
var r;
return t.roomName === (null === (r = e.room) || void 0 === r ? void 0 : r.name);
}), t);
}
return cs(e, [ s[l] ], null == r ? void 0 : r.priority);
}
const ys = (e, t) => 0 !== e.length && 0 !== t.length && e.some(e => t.some(t => e.inRangeTo(t.pos, t.range))), vs = "_csp", Rs = "_cst", Es = (e, t) => {
if (!e.pos) return !1;
if ("fatigue" in e && e.fatigue > 0) return !1;
const r = Ra.get(Wi(e, vs)), o = Ra.get(Wi(e, Rs));
return Ra.set(Wi(e, vs), e.pos), r && o && e.pos.isEqualTo(r) ? o + t < Game.time : (Ra.set(Wi(e, Rs), Game.time), 
!1);
}, Ts = {
key: "js",
serialize(e) {
if (void 0 !== e) return JSON.stringify(e);
},
deserialize(e) {
if (void 0 !== e) return JSON.parse(e);
}
}, Cs = "_cp", Ss = "_ct", ws = "_co", bs = [ "avoidCreeps", "avoidObstacleStructures", "flee", "plainCost", "swampCost", "roadCost" ];
function Os(e, t = pi.HeapCache) {
fs(Wi(e, Cs), {
cache: t
}), t.delete(Wi(e, Ss)), t.delete(Wi(e, ws));
}
const _s = (e, t, r, o = {
avoidCreeps: !0
}) => {
var n, a, i, s;
if (!e.pos) return ERR_INVALID_ARGS;
let c = Object.assign(Object.assign({}, ga.DEFAULT_MOVE_OPTS), r);
const l = null !== (n = null == r ? void 0 : r.cache) && void 0 !== n ? n : pi.HeapCache;
let u = yi(t, c.keepTargetInRoom, c.flee), m = !1, p = l.with(ii).get(Wi(e, Ss));
for (const {pos: t, range: o} of u) {
if (!m && t.inRangeTo(e.pos, o) && e.pos.roomName === t.roomName) {
if (!(null == r ? void 0 : r.flee)) {
Os(e, l);
const t = Ki(c)(e.pos.roomName);
return cs(e, [ e.pos, ...Ti(e.pos, !0).filter(e => u.some(t => t.pos.inRangeTo(e, t.range)) && (!t || 255 !== t.get(e.x, e.y))) ], c.priority), 
OK;
}
m = !0;
}
p && !p.some(e => e && t.isEqualTo(e.pos) && o === e.range) && (Os(e, l), p = void 0);
}
const f = l.with(Ts).get(Wi(e, ws));
f && !bs.some(e => c[e] !== f[e]) || Os(e, l);
const d = [ null == r ? void 0 : r.roadCost, null == r ? void 0 : r.plainCost, null == r ? void 0 : r.swampCost ].some(e => void 0 !== e);
"body" in e && !d && (c = Object.assign(Object.assign({}, c), {
creepMovementInfo: {
usedCapacity: e.store.getUsedCapacity(),
body: e.body
}
}));
const y = c.reusePath ? Game.time + c.reusePath + 1 : void 0;
l.with(ii).set(Wi(e, Ss), u, y), l.with(Ts).set(Wi(e, ws), bs.reduce((e, t) => (e[t] = c[t], 
e), {}), y);
const g = ps(Wi(e, Cs), {
cache: l
}), h = Ra.get(Wi(e, "_cpi")), v = g && bi(g, null != h ? h : 0), R = null !== (i = null === (a = c.avoidTargets) || void 0 === a ? void 0 : a.call(c, e.pos.roomName)) && void 0 !== i ? i : [];
if (c.repathIfStuck && g && Es(e, c.repathIfStuck)) fs(Wi(e, Cs), {
cache: l
}), c = Object.assign(Object.assign({}, c), o); else if ((null == v ? void 0 : v.length) && ys(v, R)) {
let t = 0;
v.forEach((e, r) => {
R.some(t => t.pos.inRangeTo(e, t.range)) && (t = r);
});
const r = v.slice(t), o = Zi(e.pos, r.map(e => ({
pos: e,
range: 0
})), Object.assign(Object.assign({}, c), {
cache: l,
flee: !1
}));
if (o) {
let t;
for (let e = 0; e < r.length; e++) if (o[o.length - 1].inRangeTo(r[e], 1)) t = e; else if (void 0 !== t) break;
void 0 === t ? fs(Wi(e, Cs), {
cache: l
}) : l.with(ci).set(ls(Wi(e, Cs)), o.concat(r.slice(t)), y);
} else fs(Wi(e, Cs), {
cache: l
});
}
const E = ms(Wi(e, Cs), e.pos, t, Object.assign(Object.assign({}, c), {
cache: l
}));
if (!E) return ERR_NO_PATH;
if (E && (null === (s = E[E.length - 2]) || void 0 === s ? void 0 : s.isEqualTo(e.pos))) {
let t = Ki(c)(e.pos.roomName);
const o = t instanceof PathFinder.CostMatrix ? e => t.get(e.x, e.y) < 254 : () => !0, n = (null == r ? void 0 : r.flee) ? e => u.every(t => t.pos.getRangeTo(e) >= t.range) : e => u.some(t => t.pos.inRangeTo(e, t.range)), a = Ti(e.pos, !0).filter(e => n(e) && o(e));
if (a.length) return cs(e, a, c.priority), OK;
}
let T = ds(e, Wi(e, Cs), Object.assign(Object.assign({}, c), {
reverse: !1,
cache: l
}));
return T === ERR_NOT_FOUND && (Os(e, l), ms(Wi(e, Cs), e.pos, u, Object.assign(Object.assign({}, c), {
cache: l
})), T = ds(e, Wi(e, Cs), Object.assign(Object.assign({}, c), {
reverse: !1,
cache: l
}))), T;
}, xs = "_rsi";
return hs.CachingStrategies = pi, hs.CoordListSerializer = ui, hs.CoordSerializer = li, 
hs.Keys = Yi, hs.MoveTargetListSerializer = ii, hs.MoveTargetSerializer = ai, hs.NumberSerializer = Sa, 
hs.PositionListSerializer = ci, hs.PositionSerializer = si, hs.adjacentWalkablePositions = Ti, 
hs.blockSquare = function(e) {
es(e.roomName).blockedSquares.add(Ba(e));
}, hs.cachePath = ms, hs.cachedPathKey = ls, hs.calculateAdjacencyMatrix = hi, hs.calculateAdjacentPositions = vi, 
hs.calculateNearbyPositions = Ri, hs.calculatePositionsAtRange = Ei, hs.cleanAllCaches = mi, 
hs.clearCachedPath = Os, hs.compressPath = e => {
const t = [], r = e[0];
if (!r) return "";
let o = r;
for (const r of e.slice(1)) {
if (1 !== $a(o, r)) throw new Error("Cannot compress path unless each RoomPosition is adjacent to the previous one");
t.push(o.getDirectionTo(r)), o = r;
}
return Ba(r) + La.encode(t);
}, hs.config = ga, hs.decompressPath = e => {
let t = Ha(e.slice(0, 2));
const r = [ t ], o = La.decode(e.slice(2));
for (const e of o) t = Ja(t, e), r.push(t);
return r;
}, hs.fastRoomPosition = Ma, hs.fixEdgePosition = gi, hs.follow = function(e, t) {
e.move(t), t.pull(e), function(e, t) {
const r = es(e.pos.roomName);
r.pullers.add(e.id), r.pullees.add(t.id);
}(t, e);
}, hs.followPath = ds, hs.fromGlobalPosition = Za, hs.generatePath = Zi, hs.getCachedPath = ps, 
hs.getMoveIntents = es, hs.getRangeTo = $a, hs.globalPosition = Qa, hs.isExit = di, 
hs.isPositionWalkable = Ci, hs.move = cs, hs.moveByPath = function(e, t, r) {
var o, n, a, i;
const s = null !== (o = null == r ? void 0 : r.repathIfStuck) && void 0 !== o ? o : ga.DEFAULT_MOVE_OPTS.repathIfStuck, c = null !== (i = null === (a = null !== (n = null == r ? void 0 : r.avoidTargets) && void 0 !== n ? n : ga.DEFAULT_MOVE_OPTS.avoidTargets) || void 0 === a ? void 0 : a(e.pos.roomName)) && void 0 !== i ? i : [];
let l = Ra.get(Wi(e, xs));
const u = ps(t, r);
if ((s || c.length) && void 0 !== l) {
let t = null == u ? void 0 : u.findIndex(t => t.isEqualTo(e.pos));
-1 === t && (t = void 0), void 0 !== t && ((null == r ? void 0 : r.reverse) ? t <= l : t >= l) && (Ra.delete(Wi(e, xs)), 
l = void 0);
}
let m = ERR_NOT_FOUND;
if (void 0 === l && (m = ds(e, t, r)), m !== ERR_NOT_FOUND) {
const t = Ra.get(Wi(e, "_cpi"));
if (!(s && Es(e, s) || u && ys(bi(u, null != t ? t : 0, null == r ? void 0 : r.reverse), c))) return m;
void 0 !== t && (l = (null == r ? void 0 : r.reverse) ? t - 1 : t + 2, Ra.set(Wi(e, xs), l));
}
let p = ps(t, r);
return p ? (void 0 !== l && (p = bi(p, l, null == r ? void 0 : r.reverse)), 0 === p.length ? ERR_NO_PATH : _s(e, p, r)) : ERR_NO_PATH;
}, hs.moveTo = _s, hs.normalizeTargets = yi, hs.offsetRoomPosition = Pa, hs.packCoord = Wa, 
hs.packCoordList = Ka, hs.packPos = Ba, hs.packPosList = Va, hs.packRoomName = ri, 
hs.packRoomNames = ei, hs.posAtDirection = Ja, hs.preTick = function() {
mi(), function() {
for (const e in Game.rooms) _i(e), Gi(e);
!function() {
var e, t;
const r = new Set;
Memory[ga.MEMORY_PORTAL_PATH] = [];
for (const o of Ii.values()) for (const n of o.values()) r.has(n) || (r.add(n), 
n.expires && n.expires < Game.time ? (null === (e = Ii.get(n.room1)) || void 0 === e || e.delete(n.room2), 
null === (t = Ii.get(n.room2)) || void 0 === t || t.delete(n.room1)) : Memory[ga.MEMORY_PORTAL_PATH].push(Li(n)));
}();
}();
}, hs.reconcileTraffic = function(e) {
for (const t of [ ...$i.keys() ]) Game.rooms[t] && ss(t, e);
xa.with(Sa).set(ns, Game.time);
}, hs.reconciledRecently = as, hs.resetCachedPath = fs, hs.roomNameFromCoords = Xa, 
hs.roomNameToCoords = za, hs.sameRoomPosition = ka, hs.unpackCoord = Ya, hs.unpackCoordList = ja, 
hs.unpackPos = Ha, hs.unpackPosList = qa, hs.unpackRoomName = oi, hs.unpackRoomNames = ti, 
hs;
}(), Rs = function() {
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
}(), Es = new Rs, Ts = function() {
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
for (var n = i(r.entries), a = n.next(); !a.done; a = n.next()) {
var c = s(a.value, 2), l = c[0], u = c[1];
void 0 !== u.ttl && -1 !== u.ttl && Game.time - u.cachedAt > u.ttl && (r.entries.delete(l), 
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
}(), Cs = function() {
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
var t, r, o, n, a = this.getMemory(), c = [];
try {
for (var l = i(Object.entries(a.data)), u = l.next(); !u.done; u = l.next()) {
var m = s(u.value, 2), p = m[0], f = m[1];
void 0 !== f.ttl && -1 !== f.ttl && Game.time - f.cachedAt > f.ttl ? c.push(p) : e.entries.set(p, {
value: f.value,
cachedAt: f.cachedAt,
lastAccessed: Game.time,
ttl: f.ttl,
hits: f.hits,
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
for (var d = i(c), y = d.next(); !y.done; y = d.next()) p = y.value, delete a.data[p];
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
}, e.prototype.get = function(e) {
var t = this.getHeap().entries.get(e);
if (t) return t.lastAccessed !== Game.time && (t.lastAccessed = Game.time, t.dirty = !0), 
t;
}, e.prototype.set = function(e, t) {
this.getHeap().entries.set(e, n(n({}, t), {
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
var e, t, r, o, n = this.getHeap(), a = this.getMemory(), c = 0;
try {
for (var l = i(n.entries), u = l.next(); !u.done; u = l.next()) {
var m = s(u.value, 2), p = m[0], f = m[1];
void 0 !== f.ttl && -1 !== f.ttl && Game.time - f.cachedAt > f.ttl && (n.entries.delete(p), 
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
for (var d = i(Object.entries(a.data)), y = d.next(); !y.done; y = d.next()) {
var g = s(y.value, 2), h = (p = g[0], g[1]);
void 0 !== h.ttl && -1 !== h.ttl && Game.time - h.cachedAt > h.ttl && (delete a.data[p], 
c++);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = d.return) && o.call(d);
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
for (var a = i(r.entries), c = a.next(); !c.done; c = a.next()) {
var l = s(c.value, 2), u = l[0], m = l[1];
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
c && !c.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o.lastSync = Game.time, this.lastPersistTick = Game.time, n;
}, e.CACHE_VERSION = 1, e;
}();

function Ss(e, t) {
return !!(e.includes("path:") || e.includes(":path:") || e.includes("scan:") || e.includes("roomFind:") || e.includes("target:") || e.includes("role:"));
}

var ws, bs, Os = function() {
function e(e, t) {
var r, o, n;
void 0 === e && (e = "default"), void 0 === t && (t = {}), this.lastPersistTick = 0, 
this.lastSizeCheck = 0, this.namespace = e, this.config = {
syncInterval: null !== (r = t.syncInterval) && void 0 !== r ? r : 10,
maxMemoryBytes: null !== (o = t.maxMemoryBytes) && void 0 !== o ? o : 102400,
persistenceFilter: null !== (n = t.persistenceFilter) && void 0 !== n ? n : Ss
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
var t, r, o, n, a = this.getMemory(), c = 0, l = [];
try {
for (var u = i(Object.entries(a.data)), m = u.next(); !m.done; m = u.next()) {
var p = s(m.value, 2), f = p[0], d = p[1];
this.isExpirable(d) && Game.time - d.cachedAt > d.ttl ? l.push(f) : (e.entries.set(f, {
value: d.value,
cachedAt: d.cachedAt,
lastAccessed: Game.time,
ttl: d.ttl,
hits: d.hits,
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
for (var y = i(l), g = y.next(); !g.done; g = y.next()) f = g.value, delete a.data[f];
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
c > 0 && (a.memoryUsageBytes = this.estimateMemorySize(a.data));
}, e.prototype.get = function(e) {
var t = this.getHeap().entries.get(e);
if (t) return t.lastAccessed = Game.time, t;
}, e.prototype.set = function(e, t) {
var r = this.getHeap(), o = this.config.persistenceFilter(e, t);
r.entries.set(e, n(n({}, t), {
dirty: o
})), o && r.dirtyKeys.add(e);
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
var e, t, r, o, n = this.getHeap(), a = this.getMemory(), c = 0;
try {
for (var l = i(n.entries), u = l.next(); !u.done; u = l.next()) {
var m = s(u.value, 2), p = m[0], f = m[1];
this.isExpirable(f) && Game.time - f.cachedAt > f.ttl && (n.entries.delete(p), n.dirtyKeys.delete(p), 
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
for (var d = i(Object.entries(a.data)), y = d.next(); !y.done; y = d.next()) {
var g = s(y.value, 2), h = (p = g[0], g[1]);
this.isExpirable(h) && Game.time - h.cachedAt > h.ttl && (delete a.data[p], c++);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
return c > 0 && (a.memoryUsageBytes = this.estimateMemorySize(a.data)), c;
}, e.prototype.persist = function() {
var e, t;
if (Game.time - this.lastPersistTick < this.config.syncInterval) return 0;
var r = this.getHeap(), o = this.getMemory(), n = 0;
try {
for (var a = i(r.dirtyKeys), s = a.next(); !s.done; s = a.next()) {
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
s && !s.done && (t = a.return) && t.call(a);
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
var t = s(e, 1)[0];
return void 0 !== r.data[t];
}).sort(function(e, t) {
return e[1].lastAccessed - t[1].lastAccessed;
});
try {
for (var a = i(n), c = a.next(); !c.done; c = a.next()) {
var l = s(c.value, 2), u = l[0];
if (l[1], r.memoryUsageBytes <= this.config.maxMemoryBytes) break;
delete r.data[u], r.memoryUsageBytes = this.estimateMemorySize(r.data);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = a.return) && t.call(a);
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
}(), _s = function() {
function e(e) {
void 0 === e && (e = "heap"), this.stores = new Map, this.stats = new Map, this.defaultStore = e;
}
return e.prototype.getStore = function(e, t) {
var r = null != t ? t : this.defaultStore, o = "".concat(e, ":").concat(r), n = this.stores.get(o);
return n || (n = "memory" === r ? new Cs(e) : "hybrid" === r ? new Os(e) : new Ts(e), 
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
var r, o, n, a;
void 0 === t && (t = "default");
var s = "".concat(t, ":heap"), c = "".concat(t, ":memory"), l = "".concat(t, ":hybrid"), u = 0, m = [ this.stores.get(s), this.stores.get(c), this.stores.get(l) ].filter(Boolean);
try {
for (var p = i(m), f = p.next(); !f.done; f = p.next()) {
var d = f.value;
if (d) {
var y = d.keys();
try {
for (var g = (n = void 0, i(y)), h = g.next(); !h.done; h = g.next()) {
var v = h.value, R = v.indexOf(":");
if (-1 !== R) {
var E = v.substring(R + 1);
e.test(E) && (d.delete(v), u++);
}
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (a = g.return) && a.call(g);
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
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
return u;
}, e.prototype.clear = function(e) {
var t, r, o, n, a;
if (e) {
var s = "".concat(e, ":heap"), c = "".concat(e, ":memory"), l = "".concat(e, ":hybrid");
null === (o = this.stores.get(s)) || void 0 === o || o.clear(), null === (n = this.stores.get(c)) || void 0 === n || n.clear(), 
null === (a = this.stores.get(l)) || void 0 === a || a.clear(), this.stats.delete(e);
} else {
try {
for (var u = i(this.stores.values()), m = u.next(); !m.done; m = u.next()) m.value.clear();
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
var t, r, o, n, a, s, c, l, u, m;
if (e) {
var p = this.getStats(e), f = "".concat(e, ":heap"), d = "".concat(e, ":memory"), y = "".concat(e, ":hybrid"), g = null !== (s = null === (a = this.stores.get(f)) || void 0 === a ? void 0 : a.size()) && void 0 !== s ? s : 0, h = null !== (l = null === (c = this.stores.get(d)) || void 0 === c ? void 0 : c.size()) && void 0 !== l ? l : 0, v = null !== (m = null === (u = this.stores.get(y)) || void 0 === u ? void 0 : u.size()) && void 0 !== m ? m : 0, R = (E = p.hits + p.misses) > 0 ? p.hits / E : 0;
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
for (var b = i(this.stats.values()), O = b.next(); !O.done; O = b.next()) T += (p = O.value).hits, 
C += p.misses, S += p.evictions;
} catch (e) {
t = {
error: e
};
} finally {
try {
O && !O.done && (r = b.return) && r.call(b);
} finally {
if (t) throw t.error;
}
}
try {
for (var _ = i(this.stores.values()), x = _.next(); !x.done; x = _.next()) w += x.value.size();
} catch (e) {
o = {
error: e
};
} finally {
try {
x && !x.done && (n = _.return) && n.call(_);
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
var r, o, n = t.keys();
if (0 !== n.length) {
var a = null, s = 1 / 0;
try {
for (var c = i(n), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = t.get(u);
m && m.lastAccessed < s && (s = m.lastAccessed, a = u);
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
a && t.delete(a);
}
}, e.prototype.cleanup = function() {
var e, t, r = 0;
try {
for (var o = i(this.stores.values()), n = o.next(); !n.done; n = o.next()) {
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
for (var o = i(this.stores.values()), n = o.next(); !n.done; n = o.next()) {
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
}(), xs = new _s("heap");

!function(e) {
e.L1 = "L1", e.L2 = "L2", e.L3 = "L3";
}(ws || (ws = {}));

var Us = ((bs = {})[FIND_SOURCES] = 5e3, bs[FIND_MINERALS] = 5e3, bs[FIND_DEPOSITS] = 100, 
bs[FIND_STRUCTURES] = 50, bs[FIND_MY_STRUCTURES] = 50, bs[FIND_HOSTILE_STRUCTURES] = 20, 
bs[FIND_MY_SPAWNS] = 100, bs[FIND_MY_CONSTRUCTION_SITES] = 20, bs[FIND_CONSTRUCTION_SITES] = 20, 
bs[FIND_CREEPS] = 5, bs[FIND_MY_CREEPS] = 5, bs[FIND_HOSTILE_CREEPS] = 3, bs[FIND_DROPPED_RESOURCES] = 5, 
bs[FIND_TOMBSTONES] = 10, bs[FIND_RUINS] = 10, bs[FIND_FLAGS] = 50, bs[FIND_NUKES] = 20, 
bs[FIND_POWER_CREEPS] = 10, bs[FIND_MY_POWER_CREEPS] = 10, bs);

function As(e, t, r) {
var o, n, a = function(e, t, r) {
return r ? "".concat(e, ":").concat(t, ":").concat(r) : "".concat(e, ":").concat(t);
}(e.name, t, null == r ? void 0 : r.filterKey), i = xs.get(a, {
namespace: "roomFind",
ttl: null !== (n = null !== (o = null == r ? void 0 : r.ttl) && void 0 !== o ? o : Us[t]) && void 0 !== n ? n : 20,
compute: function() {
return (null == r ? void 0 : r.filter) ? e.find(t, {
filter: r.filter
}) : e.find(t);
}
});
return null != i ? i : [];
}

function Ns(e) {
return As(e, FIND_SOURCES);
}

function Ms(e, t) {
return t ? As(e, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === t;
},
filterKey: t
}) : As(e, FIND_MY_STRUCTURES);
}

function ks(e, t) {
return t ? As(e, FIND_DROPPED_RESOURCES, {
filter: function(e) {
return e.resourceType === t;
},
filterKey: t
}) : As(e, FIND_DROPPED_RESOURCES);
}

var Ps = "closest";

function Is(e, t) {
return "".concat(e, ":").concat(t);
}

function Gs(e, t, r, o) {
if (void 0 === o && (o = 10), 0 === t.length) return Ls(e, r), null;
if (1 === t.length) return t[0];
var n = Is(e.name, r), a = xs.get(n, {
namespace: Ps,
ttl: o
});
if (a) {
var i = Game.getObjectById(a);
if (i && t.some(function(e) {
return e.id === i.id;
}) && e.pos.getRangeTo(i.pos) <= 20) return i;
}
var s = e.pos.findClosestByRange(t);
return s ? xs.set(n, s.id, {
namespace: Ps,
ttl: o
}) : Ls(e, r), s;
}

function Ls(e, t) {
if (t) {
var r = Is(e.name, t);
xs.invalidate(r, Ps);
} else {
var o = new RegExp("^".concat(e.name, ":"));
xs.invalidatePattern(o, Ps);
}
}

function Ds(e) {
Ls(e);
}

function Fs(e) {
var t = Game.rooms[e];
if (!t) return null;
var r = t.find(FIND_MY_SPAWNS);
return r.length > 0 ? r[0].pos : new RoomPosition(25, 25, e);
}

var Bs = Yr("ActionExecutor"), Hs = "#ffaa00", Ws = "#ffffff", Ys = "#ff0000", Ks = "#00ff00", js = "#0000ff";

function Vs(e, t, r) {
var o, n;
if (!t || !t.type) return Bs.warn("".concat(e.name, " received invalid action, clearing state")), 
void delete r.memory.state;
var a = function(e, t) {
return t;
}(0, t);
t.type !== a.type && Bs.debug("".concat(e.name, " opportunistic action: ").concat(t.type, " → ").concat(a.type)), 
"idle" === a.type ? Bs.warn("".concat(e.name, " (").concat(r.memory.role, ") executing IDLE action")) : Bs.debug("".concat(e.name, " (").concat(r.memory.role, ") executing ").concat(a.type));
var i = !1;
switch (a.type) {
case "harvest":
i = qs(e, function() {
return e.harvest(a.target);
}, a.target, Hs, a.type);
break;

case "harvestMineral":
i = qs(e, function() {
return e.harvest(a.target);
}, a.target, "#00ff00", a.type);
break;

case "harvestDeposit":
i = qs(e, function() {
return e.harvest(a.target);
}, a.target, "#00ffff", a.type);
break;

case "pickup":
i = qs(e, function() {
return e.pickup(a.target);
}, a.target, Hs, a.type);
break;

case "withdraw":
i = qs(e, function() {
return e.withdraw(a.target, a.resourceType);
}, a.target, Hs, a.type);
break;

case "transfer":
i = qs(e, function() {
return e.transfer(a.target, a.resourceType);
}, a.target, Ws, a.type, {
resourceType: a.resourceType
});
break;

case "drop":
e.drop(a.resourceType);
break;

case "build":
i = qs(e, function() {
return e.build(a.target);
}, a.target, "#ffffff", a.type);
break;

case "repair":
i = qs(e, function() {
return e.repair(a.target);
}, a.target, "#ffff00", a.type);
break;

case "upgrade":
i = qs(e, function() {
return e.upgradeController(a.target);
}, a.target, Ws, a.type);
break;

case "dismantle":
i = qs(e, function() {
return e.dismantle(a.target);
}, a.target, Ys, a.type);
break;

case "attack":
qs(e, function() {
return e.attack(a.target);
}, a.target, Ys, a.type);
break;

case "rangedAttack":
qs(e, function() {
return e.rangedAttack(a.target);
}, a.target, Ys, a.type);
break;

case "heal":
qs(e, function() {
return e.heal(a.target);
}, a.target, Ks, a.type);
break;

case "rangedHeal":
e.rangedHeal(a.target), vs.moveTo(e, a.target, {
visualizePathStyle: {
stroke: Ks
}
}) === ERR_NO_PATH && (i = !0);
break;

case "claim":
qs(e, function() {
return e.claimController(a.target);
}, a.target, Ks, a.type);
break;

case "reserve":
qs(e, function() {
return e.reserveController(a.target);
}, a.target, Ks, a.type);
break;

case "attackController":
qs(e, function() {
return e.attackController(a.target);
}, a.target, Ys, a.type);
break;

case "moveTo":
vs.moveTo(e, a.target, {
visualizePathStyle: {
stroke: js
}
}) === ERR_NO_PATH && (i = !0);
break;

case "moveToRoom":
var s = new RoomPosition(25, 25, a.roomName);
vs.moveTo(e, {
pos: s,
range: 20
}, {
visualizePathStyle: {
stroke: js
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
vs.moveTo(e, c, {
flee: !0
}) === ERR_NO_PATH && (i = !0);
break;

case "wait":
if (vs.isExit(e.pos)) {
var l = new RoomPosition(25, 25, e.pos.roomName);
vs.moveTo(e, l, {
priority: 2
});
break;
}
e.pos.isEqualTo(a.position) || vs.moveTo(e, a.position) === ERR_NO_PATH && (i = !0);
break;

case "requestMove":
vs.moveTo(e, a.target, {
visualizePathStyle: {
stroke: js
},
priority: 5
}) === ERR_NO_PATH && (i = !0);
break;

case "idle":
if (vs.isExit(e.pos)) {
l = new RoomPosition(25, 25, e.pos.roomName), vs.moveTo(e, l, {
priority: 2
});
break;
}
var u = Game.rooms[e.pos.roomName];
if (u && (null === (o = u.controller) || void 0 === o ? void 0 : o.my)) {
Es.getOrInitSwarmState(u.name);
var m = Fs(u.name);
if (m && !e.pos.isEqualTo(m)) {
vs.moveTo(e, m, {
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
p && vs.moveTo(e, {
pos: p.pos,
range: 3
}, {
flee: !0,
priority: 2
});
}
i && (delete r.memory.state, vs.clearCachedPath(e), Ls(e)), function(e) {
var t = 0 === e.creep.store.getUsedCapacity(), r = 0 === e.creep.store.getFreeCapacity();
void 0 === e.memory.working && (e.memory.working = !t), t && (e.memory.working = !1), 
r && (e.memory.working = !0);
}(r);
}

function qs(e, t, r, o, n, a) {
var i = t();
if (i === ERR_NOT_IN_RANGE) {
var s = vs.moveTo(e, r, {
visualizePathStyle: {
stroke: o
}
});
return s !== OK && Bs.info("Movement attempt returned non-OK result", {
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
switch (Fi(e.memory), t) {
case "harvest":
case "harvestMineral":
case "harvestDeposit":
s = 2 * (R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length), Bi(e.memory).energyHarvested += s;
break;

case "transfer":
var u = null !== (n = null == o ? void 0 : o.resourceType) && void 0 !== n ? n : RESOURCE_ENERGY, m = Math.min(e.store.getUsedCapacity(u), null !== (i = null === (a = r.store) || void 0 === a ? void 0 : a.getFreeCapacity(u)) && void 0 !== i ? i : 0);
m > 0 && function(e, t) {
Bi(e).energyTransferred += t;
}(e.memory, m);
break;

case "build":
var p = 5 * (R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length);
c = e.memory, l = p, Bi(c).buildProgress += l;
break;

case "repair":
var f = 100 * (R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length);
!function(e, t) {
Bi(e).repairProgress += t;
}(e.memory, f);
break;

case "attack":
var d = 30 * e.body.filter(function(e) {
return e.type === ATTACK && e.hits > 0;
}).length;
Hi(e.memory, d);
break;

case "rangedAttack":
var y = e.body.filter(function(e) {
return e.type === RANGED_ATTACK && e.hits > 0;
}).length, g = e.pos.getRangeTo(r);
d = 0, g <= 1 ? d = 10 * y : g <= 2 ? d = 4 * y : g <= 3 && (d = 1 * y), Hi(e.memory, d);
break;

case "heal":
case "rangedHeal":
var h = e.body.filter(function(e) {
return e.type === HEAL && e.hits > 0;
}).length, v = "heal" === t ? 12 * h : 4 * h;
!function(e, t) {
Bi(e).healingDone += t;
}(e.memory, v);
break;

case "upgrade":
var R = e.body.filter(function(e) {
return e.type === WORK && e.hits > 0;
}).length;
!function(e, t) {
Bi(e).upgradeProgress += t;
}(e.memory, R);
}
}(e, n, r, a), (i === ERR_FULL || i === ERR_NOT_ENOUGH_RESOURCES || i === ERR_INVALID_TARGET) && (Bs.info("Clearing state after action error", {
room: e.pos.roomName,
creep: e.name,
meta: {
action: null != n ? n : "rangeAction",
result: i,
target: r.pos.toString()
}
}), !0);
}

var zs = Yr("StateMachine");

function Xs(e, t) {
var r, o = e.memory.state, a = function(e) {
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
if (o && a.valid) if (function(e, t) {
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
}(o, e)) zs.info("State completed, evaluating new action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: o.action,
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
}(o);
if (i) return i;
zs.info("State reconstruction failed, re-evaluating behavior", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: o.action,
role: e.memory.role
}
}), delete e.memory.state;
} else o && (zs.info("State invalid, re-evaluating behavior", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: n({
action: o.action,
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
}(s), zs.info("Committed new state action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
action: s.type,
role: e.memory.role,
targetId: null === (r = e.memory.state) || void 0 === r ? void 0 : r.targetId
}
})) : zs.info("Behavior returned idle action", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
role: e.memory.role
}
}), s) : (zs.warn("Behavior returned invalid action, defaulting to idle", {
room: e.creep.pos.roomName,
creep: e.creep.name,
meta: {
role: e.memory.role
}
}), {
type: "idle"
});
}

function Qs(e) {
var t = 0 === e.creep.store.getUsedCapacity(), r = 0 === e.creep.store.getFreeCapacity();
void 0 === e.memory.working && (e.memory.working = !t);
var o = e.memory.working;
t ? e.memory.working = !1 : r && (e.memory.working = !0);
var n = e.memory.working;
return o !== n && Ds(e.creep), n;
}

function Zs(e) {
e.memory.working = !1, Ds(e.creep);
}

var $s = Yr("EnergyCollection");

function Js(e) {
if (e.droppedResources.length > 0) {
var t = Gs(e.creep, e.droppedResources, "energy_drop", 5);
if (t) return $s.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting dropped resource at ").concat(t.pos)), 
{
type: "pickup",
target: t
};
}
var r = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (r.length > 0) {
var o = Za(e.creep, r, "energy_container");
if (o) return $s.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting container ").concat(o.id, " at ").concat(o.pos, " with ").concat(o.store.getUsedCapacity(RESOURCE_ENERGY), " energy")), 
{
type: "withdraw",
target: o,
resourceType: RESOURCE_ENERGY
};
if ($s.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") found ").concat(r.length, " containers but distribution returned null, falling back to closest")), 
a = e.creep.pos.findClosestByRange(r)) return $s.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") using fallback container ").concat(a.id, " at ").concat(a.pos)), 
{
type: "withdraw",
target: a,
resourceType: RESOURCE_ENERGY
};
}
if (e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return $s.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting storage at ").concat(e.storage.pos)), 
{
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
};
var n = Ns(e.room).filter(function(e) {
return e.energy > 0;
});
if (n.length > 0) {
var a, i = Za(e.creep, n, "energy_source");
if (i) return $s.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") selecting source ").concat(i.id, " at ").concat(i.pos)), 
{
type: "harvest",
target: i
};
if ($s.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") found ").concat(n.length, " sources but distribution returned null, falling back to closest")), 
a = e.creep.pos.findClosestByRange(n)) return $s.debug("".concat(e.creep.name, " (").concat(e.memory.role, ") using fallback source ").concat(a.id, " at ").concat(a.pos)), 
{
type: "harvest",
target: a
};
}
return $s.warn("".concat(e.creep.name, " (").concat(e.memory.role, ") findEnergy returning idle - no energy sources available")), 
{
type: "idle"
};
}

function ec(e) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (n = Gs(e.creep, t, "deliver_spawn", 5))) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (n = Gs(e.creep, r, "deliver_ext", 5))) return {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var o = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (o.length > 0 && (n = Gs(e.creep, o, "deliver_tower", 10))) return {
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
return a.length > 0 && (n = Gs(e.creep, a, "deliver_cont", 10)) ? {
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
} : null;
}

var tc = Yr("LarvaWorkerBehavior");

function rc(e) {
if (Qs(e)) {
tc.debug("".concat(e.creep.name, " larvaWorker working with ").concat(e.creep.store.getUsedCapacity(RESOURCE_ENERGY), " energy"));
var t = ec(e);
if (t) return tc.debug("".concat(e.creep.name, " larvaWorker delivering via ").concat(t.type)), 
t;
var r = function(e) {
var t, r = Es.getSwarmState(e.room.name);
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
if (e.prioritizedSites.length > 0) return tc.debug("".concat(e.creep.name, " larvaWorker building site")), 
{
type: "build",
target: e.prioritizedSites[0]
};
if (e.room.controller) return {
type: "upgrade",
target: e.room.controller
};
if (e.isEmpty) return tc.warn("".concat(e.creep.name, " larvaWorker idle (empty, working=true, no targets) - this indicates a bug")), 
{
type: "idle"
};
tc.debug("".concat(e.creep.name, " larvaWorker has energy but no targets, switching to collection mode")), 
Zs(e);
}
return Js(e);
}

var oc = Yr("HarvesterBehavior"), nc = Yr("HaulerBehavior"), ac = {
larvaWorker: rc,
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
var t, r, o, n, a, s, c = Ns(e.room);
if (0 === c.length) return null;
var l, u = "sourceCounts_".concat(e.room.name), m = "sourceCounts_tick_".concat(e.room.name), p = global, f = p[u], d = p[m];
if (f && d === Game.time) l = f; else {
l = new Map;
try {
for (var y = i(c), g = y.next(); !g.done; g = y.next()) {
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
"harvester" === R.role && R.sourceId && l.has(R.sourceId) && l.set(R.sourceId, (null !== (a = l.get(R.sourceId)) && void 0 !== a ? a : 0) + 1);
}
p[u] = l, p[m] = Game.time;
}
var E = null, T = 1 / 0;
try {
for (var C = i(c), S = C.next(); !S.done; S = C.next()) {
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
S && !S.done && (n = C.return) && n.call(C);
} finally {
if (o) throw o.error;
}
}
return E && (e.memory.sourceId = E.id), E;
}(e), oc.debug("".concat(e.creep.name, " harvester assigned to source ").concat(null == t ? void 0 : t.id))), 
!t) return oc.warn("".concat(e.creep.name, " harvester has no source to harvest")), 
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
if (n) return oc.debug("".concat(e.creep.name, " harvester transferring to container ").concat(n.id)), 
{
type: "transfer",
target: n,
resourceType: RESOURCE_ENERGY
};
var a = function(e) {
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
return a ? (oc.debug("".concat(e.creep.name, " harvester transferring to link ").concat(a.id)), 
{
type: "transfer",
target: a,
resourceType: RESOURCE_ENERGY
}) : (oc.debug("".concat(e.creep.name, " harvester dropping energy on ground")), 
{
type: "drop",
resourceType: RESOURCE_ENERGY
});
},
hauler: function(e) {
var t, r = Qs(e);
if (nc.debug("".concat(e.creep.name, " hauler state: working=").concat(r, ", energy=").concat(e.creep.store.getUsedCapacity(RESOURCE_ENERGY), "/").concat(e.creep.store.getCapacity())), 
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
if (a.length > 0 && (c = Gs(e.creep, a, "hauler_spawn", 10))) return nc.debug("".concat(e.creep.name, " hauler delivering to spawn ").concat(c.id)), 
{
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
var i = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (i.length > 0 && (c = Gs(e.creep, i, "hauler_ext", 10))) return {
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
var s = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (s.length > 0 && (c = Gs(e.creep, s, "hauler_tower", 15))) return {
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
if (l.length > 0 && (c = Gs(e.creep, l, "hauler_cont", 15))) return {
type: "transfer",
target: c,
resourceType: RESOURCE_ENERGY
};
if (e.isEmpty) return nc.warn("".concat(e.creep.name, " hauler idle (empty, working=true, no targets)")), 
{
type: "idle"
};
nc.debug("".concat(e.creep.name, " hauler has energy but no targets, switching to collection mode")), 
Zs(e);
}
if (e.droppedResources.length > 0 && (c = Gs(e.creep, e.droppedResources, "hauler_drop", 5))) return {
type: "pickup",
target: c
};
var u = e.tombstones.filter(function(e) {
return e.store.getUsedCapacity() > 0;
});
if (u.length > 0) {
var m = Gs(e.creep, u, "hauler_tomb", 10);
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
var f = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (f.length > 0) {
var d = Za(e.creep, f, "energy_container");
if (d) return nc.debug("".concat(e.creep.name, " hauler withdrawing from container ").concat(d.id, " with ").concat(d.store.getUsedCapacity(RESOURCE_ENERGY), " energy")), 
{
type: "withdraw",
target: d,
resourceType: RESOURCE_ENERGY
};
nc.warn("".concat(e.creep.name, " hauler found ").concat(f.length, " containers but distribution returned null, falling back to closest"));
var y = e.creep.pos.findClosestByRange(f);
if (y) return nc.debug("".concat(e.creep.name, " hauler using fallback container ").concat(y.id)), 
{
type: "withdraw",
target: y,
resourceType: RESOURCE_ENERGY
};
}
if (e.mineralContainers.length > 0) {
var g = Za(e.creep, e.mineralContainers, "mineral_container");
if (g) {
if (h = Object.keys(g.store).find(function(e) {
return e !== RESOURCE_ENERGY && g.store.getUsedCapacity(e) > 0;
})) return {
type: "withdraw",
target: g,
resourceType: h
};
} else {
nc.warn("".concat(e.creep.name, " hauler found ").concat(e.mineralContainers.length, " mineral containers but distribution returned null, falling back to closest"));
var h, v = e.creep.pos.findClosestByRange(e.mineralContainers);
if (v && (h = Object.keys(v.store).find(function(e) {
return e !== RESOURCE_ENERGY && v.store.getUsedCapacity(e) > 0;
}))) return nc.debug("".concat(e.creep.name, " hauler using fallback mineral container ").concat(v.id)), 
{
type: "withdraw",
target: v,
resourceType: h
};
}
}
return e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0 ? (nc.debug("".concat(e.creep.name, " hauler withdrawing from storage")), 
{
type: "withdraw",
target: e.storage,
resourceType: RESOURCE_ENERGY
}) : (nc.warn("".concat(e.creep.name, " hauler idle (no energy sources found)")), 
{
type: "idle"
});
},
builder: function(e) {
if (Qs(e)) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (o = Gs(e.creep, t, "builder_spawn", 5))) return {
type: "transfer",
target: o,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (o = Gs(e.creep, r, "builder_ext", 5))) return {
type: "transfer",
target: o,
resourceType: RESOURCE_ENERGY
};
var o, n = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (n.length > 0 && (o = Gs(e.creep, n, "builder_tower", 10))) return {
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
return Js(e);
},
upgrader: function(e) {
if (Qs(e)) {
var t = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (t.length > 0 && (u = Gs(e.creep, t, "upgrader_spawn", 5))) return {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (r.length > 0 && (u = Gs(e.creep, r, "upgrader_ext", 5))) return {
type: "transfer",
target: u,
resourceType: RESOURCE_ENERGY
};
var o = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
return o.length > 0 && (u = Gs(e.creep, o, "upgrader_tower", 10)) ? {
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
}), l.length > 0 && (u = Gs(e.creep, l, "upgrader_nearby", 30))) return {
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
if (m.length > 0 && (u = Gs(e.creep, m, "upgrader_cont", 30))) return {
type: "withdraw",
target: u,
resourceType: RESOURCE_ENERGY
};
var p = Ns(e.room).filter(function(e) {
return e.energy > 0;
});
if (p.length > 0) {
var f = Gs(e.creep, p, "upgrader_source", 30);
if (f) return {
type: "harvest",
target: f
};
}
return {
type: "idle"
};
},
queenCarrier: function(e) {
return Qs(e) ? ec(e) || (e.storage ? {
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
var t, r = As(e.room, FIND_MINERALS)[0];
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
var r = As(e.room, FIND_DEPOSITS);
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
var t, r, o, n, a, s, c, l, u, m;
if (0 === e.labs.length) return {
type: "idle"
};
var p = e.labs.slice(0, 2), f = e.labs.slice(2);
if (e.creep.store.getUsedCapacity() > 0) {
var d = Object.keys(e.creep.store)[0], y = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
if (d !== RESOURCE_ENERGY && !y.includes(d)) {
var g = null !== (u = e.terminal) && void 0 !== u ? u : e.storage;
if (g) return {
type: "transfer",
target: g,
resourceType: d
};
}
try {
for (var h = i(p), v = h.next(); !v.done; v = h.next()) {
var R = (_ = v.value).store.getFreeCapacity(d);
if (null !== R && R > 0) return {
type: "transfer",
target: _,
resourceType: d
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
for (var E = i(f), T = E.next(); !T.done; T = E.next()) {
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
T && !T.done && (n = E.return) && n.call(E);
} finally {
if (o) throw o.error;
}
}
var S = null !== (m = e.terminal) && void 0 !== m ? m : e.storage;
if (S) {
var w = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
try {
for (var b = i(p), O = b.next(); !O.done; O = b.next()) {
var _ = O.value;
try {
for (var x = (c = void 0, i(w)), U = x.next(); !U.done; U = x.next()) {
var A = U.value;
if (S.store.getUsedCapacity(A) > 0 && _.store.getFreeCapacity(A) > 0) return {
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
U && !U.done && (l = x.return) && l.call(x);
} finally {
if (c) throw c.error;
}
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
O && !O.done && (s = b.return) && s.call(b);
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
return o !== n && (Ds(e.creep), delete e.memory.targetId), n;
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
var t, r, o, n, a;
if (!e.factory) return {
type: "idle"
};
if (Qs(e)) {
var s = Object.keys(e.creep.store)[0];
return {
type: "transfer",
target: e.factory,
resourceType: s
};
}
var c = null !== (a = e.terminal) && void 0 !== a ? a : e.storage;
if (!c) return {
type: "idle"
};
var l = [ RESOURCE_UTRIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_KEANIUM_BAR, RESOURCE_ZYNTHIUM_BAR, RESOURCE_GHODIUM_MELT, RESOURCE_OXIDANT, RESOURCE_REDUCTANT, RESOURCE_PURIFIER, RESOURCE_BATTERY ];
try {
for (var u = i(l), m = u.next(); !m.done; m = u.next()) {
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
var f = [ RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_OXYGEN, RESOURCE_HYDROGEN, RESOURCE_CATALYST, RESOURCE_GHODIUM ];
try {
for (var d = i(f), y = d.next(); !y.done; y = d.next()) {
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
y && !y.done && (n = d.return) && n.call(d);
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
var t = Ns(e.room);
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
var t = Qs(e), r = e.memory.targetRoom, o = e.memory.homeRoom;
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
if (a.length > 0 && (p = Gs(e.creep, a, "remoteHauler_spawn", 5))) return {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
};
var i = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_EXTENSION && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
});
if (i.length > 0 && (p = Gs(e.creep, i, "remoteHauler_ext", 5))) return {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
};
var s = e.towers.filter(function(e) {
return e.store.getFreeCapacity(RESOURCE_ENERGY) >= 100;
});
if (s.length > 0 && (p = Gs(e.creep, s, "remoteHauler_tower", 10))) return {
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
return c.length > 0 && (p = Gs(e.creep, c, "remoteHauler_cont", 10)) ? {
type: "transfer",
target: p,
resourceType: RESOURCE_ENERGY
} : e.isEmpty || e.room.name !== o ? {
type: "idle"
} : (Zs(e), {
type: "moveToRoom",
roomName: r
});
}
if (e.room.name !== r) return {
type: "moveToRoom",
roomName: r
};
var l = .3 * e.creep.store.getCapacity(RESOURCE_ENERGY), u = As(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(RESOURCE_ENERGY) >= l;
},
filterKey: "remoteContainers"
});
if (u.length > 0 && (p = Gs(e.creep, u, "remoteHauler_remoteCont", 10))) return {
type: "withdraw",
target: p,
resourceType: RESOURCE_ENERGY
};
var m = ks(e.room, RESOURCE_ENERGY).filter(function(e) {
return e.amount > 50;
});
if (m.length > 0 && (p = Gs(e.creep, m, "remoteHauler_remoteDrop", 3))) return {
type: "pickup",
target: p
};
if (0 === u.length) {
var p, f = As(e.room, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
},
filterKey: "containers"
});
if (f.length > 0 && (p = Gs(e.creep, f, "remoteHauler_waitCont", 20)) && e.creep.pos.getRangeTo(p) > 2) return {
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
if ((s = As(i, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getFreeCapacity(a) > 0;
},
filterKey: "container_".concat(a)
})).length > 0 && (c = Gs(e.creep, s, "interRoomCarrier_targetCont", 10))) return {
type: "transfer",
target: c,
resourceType: a
};
var l = Ms(i, STRUCTURE_SPAWN);
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
} : (s = As(i, FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER && e.store.getUsedCapacity(a) > 0;
},
filterKey: "container_".concat(a)
})).length > 0 && (c = Gs(e.creep, s, "interRoomCarrier_sourceCont", 10)) ? {
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

function ic(e) {
var t;
return (null !== (t = ac[e.memory.role]) && void 0 !== t ? t : rc)(e);
}

var sc = [ "TooAngel", "TedRoastBeef" ];

function cc(e) {
var t, r = e.filter(function(e) {
return !function(e) {
return t = e.owner.username, sc.includes(t);
var t;
}(e);
}), o = e.length - r.length;
return o > 0 && console.log("[Alliance] Filtered ".concat(o, " allied creeps from hostile detection in ").concat(null === (t = e[0]) || void 0 === t ? void 0 : t.room.name)), 
r;
}

function lc(e) {
var t, r = ((t = {})[MOVE] = 50, t[WORK] = 100, t[CARRY] = 50, t[ATTACK] = 80, t[RANGED_ATTACK] = 150, 
t[HEAL] = 250, t[CLAIM] = 600, t[TOUGH] = 10, t);
return e.reduce(function(e, t) {
return e + r[t];
}, 0);
}

function uc(e, t) {
return void 0 === t && (t = 0), {
parts: e,
cost: lc(e),
minCapacity: t || lc(e)
};
}

var mc = {
larvaWorker: {
role: "larvaWorker",
family: "economy",
bodies: [ uc([ WORK, CARRY ], 150), uc([ WORK, CARRY, MOVE ], 200), uc([ WORK, WORK, CARRY, CARRY, MOVE, MOVE ], 400), uc([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ], 600), uc([ WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 800) ],
priority: 100,
maxPerRoom: 3,
remoteRole: !1
},
harvester: {
role: "harvester",
family: "economy",
bodies: [ uc([ WORK, WORK, MOVE ], 250), uc([ WORK, WORK, WORK, WORK, MOVE, MOVE ], 500), uc([ WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE ], 700), uc([ WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE ], 800), uc([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE ], 1e3) ],
priority: 95,
maxPerRoom: 2,
remoteRole: !1
},
hauler: {
role: "hauler",
family: "economy",
bodies: [ uc([ CARRY, CARRY, MOVE, MOVE ], 200), uc([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), uc([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800), uc(c(c([], s(Array(16).fill(CARRY)), !1), s(Array(16).fill(MOVE)), !1), 1600) ],
priority: 90,
maxPerRoom: 2,
remoteRole: !0
},
upgrader: {
role: "upgrader",
family: "economy",
bodies: [ uc([ WORK, CARRY, MOVE ], 200), uc([ WORK, WORK, WORK, CARRY, MOVE, MOVE ], 450), uc([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 1e3), uc([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1700) ],
priority: 60,
maxPerRoom: 2,
remoteRole: !1
},
builder: {
role: "builder",
family: "economy",
bodies: [ uc([ WORK, CARRY, MOVE, MOVE ], 250), uc([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 650), uc([ WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1400) ],
priority: 70,
maxPerRoom: 2,
remoteRole: !1
},
queenCarrier: {
role: "queenCarrier",
family: "economy",
bodies: [ uc([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE ], 300), uc([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ], 450), uc([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 85,
maxPerRoom: 1,
remoteRole: !1
},
mineralHarvester: {
role: "mineralHarvester",
family: "economy",
bodies: [ uc([ WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE ], 550), uc([ WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE ], 850) ],
priority: 40,
maxPerRoom: 1,
remoteRole: !1
},
labTech: {
role: "labTech",
family: "economy",
bodies: [ uc([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), uc([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 35,
maxPerRoom: 1,
remoteRole: !1
},
factoryWorker: {
role: "factoryWorker",
family: "economy",
bodies: [ uc([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), uc([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600) ],
priority: 35,
maxPerRoom: 1,
remoteRole: !1
},
remoteHarvester: {
role: "remoteHarvester",
family: "economy",
bodies: [ uc([ WORK, WORK, CARRY, MOVE, MOVE, MOVE ], 400), uc([ WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 750), uc([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1050), uc([ WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1600) ],
priority: 85,
maxPerRoom: 6,
remoteRole: !0
},
remoteHauler: {
role: "remoteHauler",
family: "economy",
bodies: [ uc([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), uc([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800), uc(c(c([], s(Array(16).fill(CARRY)), !1), s(Array(16).fill(MOVE)), !1), 1600) ],
priority: 80,
maxPerRoom: 6,
remoteRole: !0
},
interRoomCarrier: {
role: "interRoomCarrier",
family: "economy",
bodies: [ uc([ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 400), uc([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 600), uc([ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 800) ],
priority: 90,
maxPerRoom: 4,
remoteRole: !1
},
crossShardCarrier: {
role: "crossShardCarrier",
family: "economy",
bodies: [ uc(c(c([], s(Array(4).fill(CARRY)), !1), s(Array(4).fill(MOVE)), !1), 400), uc(c(c([], s(Array(8).fill(CARRY)), !1), s(Array(8).fill(MOVE)), !1), 800), uc(c(c([], s(Array(12).fill(CARRY)), !1), s(Array(12).fill(MOVE)), !1), 1200), uc(c(c([], s(Array(16).fill(CARRY)), !1), s(Array(16).fill(MOVE)), !1), 1600) ],
priority: 85,
maxPerRoom: 6,
remoteRole: !0
},
guard: {
role: "guard",
family: "military",
bodies: [ uc([ TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE ], 310), uc([ TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 620), uc([ TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1070), uc([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1740) ],
priority: 65,
maxPerRoom: 4,
remoteRole: !1
},
remoteGuard: {
role: "remoteGuard",
family: "military",
bodies: [ uc([ TOUGH, ATTACK, MOVE, MOVE ], 190), uc([ TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE ], 500), uc([ TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 880) ],
priority: 65,
maxPerRoom: 2,
remoteRole: !0
},
healer: {
role: "healer",
family: "military",
bodies: [ uc([ HEAL, MOVE, MOVE ], 350), uc([ TOUGH, HEAL, HEAL, MOVE, MOVE, MOVE ], 620), uc([ TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1240), uc([ TOUGH, TOUGH, TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 2640) ],
priority: 55,
maxPerRoom: 1,
remoteRole: !1
},
soldier: {
role: "soldier",
family: "military",
bodies: [ uc([ ATTACK, ATTACK, MOVE, MOVE ], 260), uc([ ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE ], 520), uc([ TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1340) ],
priority: 50,
maxPerRoom: 1,
remoteRole: !1
},
siegeUnit: {
role: "siegeUnit",
family: "military",
bodies: [ uc([ WORK, WORK, MOVE, MOVE ], 300), uc([ TOUGH, TOUGH, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 620), uc([ TOUGH, TOUGH, TOUGH, TOUGH, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1040) ],
priority: 30,
maxPerRoom: 1,
remoteRole: !1
},
ranger: {
role: "ranger",
family: "military",
bodies: [ uc([ TOUGH, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE ], 360), uc([ TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE ], 570), uc([ TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1040), uc([ TOUGH, TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1480) ],
priority: 60,
maxPerRoom: 4,
remoteRole: !1
},
harasser: {
role: "harasser",
family: "military",
bodies: [ uc([ TOUGH, ATTACK, RANGED_ATTACK, MOVE, MOVE ], 320), uc([ TOUGH, TOUGH, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE ], 640), uc([ TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 1200) ],
priority: 40,
maxPerRoom: 1,
remoteRole: !1
},
scout: {
role: "scout",
family: "utility",
bodies: [ uc([ MOVE ], 50) ],
priority: 30,
maxPerRoom: 1,
remoteRole: !0
},
claimer: {
role: "claimer",
family: "utility",
bodies: [ uc([ CLAIM, MOVE ], 650), uc([ CLAIM, CLAIM, MOVE, MOVE ], 1300) ],
priority: 50,
maxPerRoom: 3,
remoteRole: !0
},
engineer: {
role: "engineer",
family: "utility",
bodies: [ uc([ WORK, CARRY, MOVE, MOVE ], 250), uc([ WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 500) ],
priority: 55,
maxPerRoom: 2,
remoteRole: !1
},
remoteWorker: {
role: "remoteWorker",
family: "utility",
bodies: [ uc([ WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ], 500), uc([ WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 750) ],
priority: 45,
maxPerRoom: 4,
remoteRole: !0
},
powerHarvester: {
role: "powerHarvester",
family: "power",
bodies: [ uc([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 2300), uc([ TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE ], 3e3) ],
priority: 30,
maxPerRoom: 2,
remoteRole: !0
},
powerCarrier: {
role: "powerCarrier",
family: "power",
bodies: [ uc(c(c([], s(Array(20).fill(CARRY)), !1), s(Array(20).fill(MOVE)), !1), 2e3), uc(c(c([], s(Array(25).fill(CARRY)), !1), s(Array(25).fill(MOVE)), !1), 2500) ],
priority: 25,
maxPerRoom: 2,
remoteRole: !0
}
};

function pc(e) {
var t, r, o, n, a = cc(e.find(FIND_HOSTILE_CREEPS));
if (0 === a.length) return {
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
var s = 0, c = 0, l = 0, u = 0, m = 0, p = 0, f = 0, d = 0;
try {
for (var y = i(a), g = y.next(); !g.done; g = y.next()) {
var h = g.value, v = 0, R = 0, E = 0, T = 0;
try {
for (var C = (o = void 0, i(h.body)), S = C.next(); !S.done; S = C.next()) {
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
S && !S.done && (n = C.return) && n.call(C);
} finally {
if (o) throw o.error;
}
}
c += 30 * v + 10 * R, l += h.hits, h.body.some(function(e) {
return e.boost;
}) && (u++, s += 200), E > 0 && (m++, s += 100), R > 0 && p++, v > 0 && f++, T >= 5 && (d++, 
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
var b, O = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER;
}
}).reduce(function(e, t) {
if (t.store.getUsedCapacity(RESOURCE_ENERGY) < 10) return e;
var r, o = a.reduce(function(e, r) {
return e + t.pos.getRangeTo(r.pos);
}, 0);
return e + ((r = o / a.length) <= 5 ? 600 : r >= 20 ? 150 : 600 - 30 * (r - 5));
}, 0), _ = c > 1.5 * O, x = Math.min(100, Math.max(0, (c - O) / 10)), U = function(e, t, r) {
if (void 0 === t || void 0 === r) {
var o = gc("guard"), n = gc("ranger"), a = hc(o), i = hc(n), s = (a.avgDps + i.avgDps) / 2, c = (a.avgCost + i.avgCost) / 2;
t = null != t ? t : s, r = null != r ? r : c;
}
return t <= 0 && (t = 300, r = 1300), Math.ceil(e / t) * r;
}(c), A = function(e) {
return 0 === e ? 0 : e < fc ? 1 : e < dc ? 2 : 3;
}(s);
return b = s < 100 ? "monitor" : s < 500 && !_ ? "defend" : _ && s < 1e3 ? "assist" : s > 1e3 || u > 3 ? "safemode" : "defend", 
e.find(FIND_NUKES).length > 0 && (s += 500, b = "safemode", A = 3), {
roomName: e.name,
dangerLevel: A,
threatScore: s,
hostileCount: a.length,
totalHostileHitPoints: l,
totalHostileDPS: c,
healerCount: m,
rangedCount: p,
meleeCount: f,
boostedCount: u,
dismantlerCount: d,
estimatedDefenderCost: U,
assistanceRequired: _,
assistancePriority: x,
recommendedResponse: b
};
}

var fc = 300, dc = 800;

function yc(e) {
var t, r, o = 0;
try {
for (var n = i(e), a = n.next(); !a.done; a = n.next()) {
var s = a.value;
s === ATTACK ? o += 30 : s === RANGED_ATTACK && (o += 10);
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
}

function gc(e) {
var t = mc[e];
return t ? t.bodies.map(function(e) {
return {
parts: e.parts,
cost: e.cost,
dps: yc(e.parts)
};
}).sort(function(e, t) {
return e.cost - t.cost;
}) : [];
}

function hc(e) {
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

function vc(e) {
bo.info("Threat Assessment for ".concat(e.roomName, ": ") + "Danger=".concat(e.dangerLevel, ", Score=").concat(e.threatScore, ", ") + "Hostiles=".concat(e.hostileCount, ", DPS=").concat(e.totalHostileDPS, ", ") + "Response=".concat(e.recommendedResponse), {
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

function Rc(e, t) {
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

var Ec = [ STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_TOWER, STRUCTURE_LAB, STRUCTURE_FACTORY, STRUCTURE_POWER_SPAWN, STRUCTURE_NUKER, STRUCTURE_OBSERVER ], Tc = [ STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE ], Cc = {
recalculateInterval: 1e3,
maxPathOps: 2e3,
includeRemoteRoads: !0
}, Sc = new Map;

function wc(e, t, r) {
var o, a, s, c, l, u, m, p, f, d, y, g, h, v, R, E, T;
void 0 === r && (r = {});
var C = n(n({}, Cc), r), S = Sc.get(e.name);
if (S && Game.time - S.lastCalculated < C.recalculateInterval) return S;
var w = new Set, b = null !== (E = null === (R = e.controller) || void 0 === R ? void 0 : R.level) && void 0 !== E ? E : 0, O = e.find(FIND_SOURCES), _ = e.controller, x = e.storage, U = e.find(FIND_MINERALS)[0], A = null !== (T = null == x ? void 0 : x.pos) && void 0 !== T ? T : t;
try {
for (var N = i(O), M = N.next(); !M.done; M = N.next()) {
var k = Uc(A, M.value.pos, e.name, C.maxPathOps);
try {
for (var P = (s = void 0, i(k)), I = P.next(); !I.done; I = P.next()) {
var G = I.value;
w.add("".concat(G.x, ",").concat(G.y));
}
} catch (e) {
s = {
error: e
};
} finally {
try {
I && !I.done && (c = P.return) && c.call(P);
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
M && !M.done && (a = N.return) && a.call(N);
} finally {
if (o) throw o.error;
}
}
if (_) {
k = Uc(A, _.pos, e.name, C.maxPathOps);
try {
for (var L = i(k), D = L.next(); !D.done; D = L.next()) G = D.value, w.add("".concat(G.x, ",").concat(G.y));
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
if (U && b >= 6) {
k = Uc(A, U.pos, e.name, C.maxPathOps);
try {
for (var F = i(k), B = F.next(); !B.done; B = F.next()) G = B.value, w.add("".concat(G.x, ",").concat(G.y));
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
for (var H = i(O), W = H.next(); !W.done; W = H.next()) {
k = Uc(t, W.value.pos, e.name, C.maxPathOps);
try {
for (var Y = (y = void 0, i(k)), K = Y.next(); !K.done; K = Y.next()) G = K.value, 
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
f = {
error: e
};
} finally {
try {
W && !W.done && (d = H.return) && d.call(H);
} finally {
if (f) throw f.error;
}
}
if (_) {
k = Uc(t, _.pos, e.name, C.maxPathOps);
try {
for (var j = i(k), V = j.next(); !V.done; V = j.next()) G = V.value, w.add("".concat(G.x, ",").concat(G.y));
} catch (e) {
h = {
error: e
};
} finally {
try {
V && !V.done && (v = j.return) && v.call(j);
} finally {
if (h) throw h.error;
}
}
}
}
var q = {
roomName: e.name,
positions: w,
lastCalculated: Game.time
};
return Sc.set(e.name, q), jr.debug("Calculated road network for ".concat(e.name, ": ").concat(w.size, " positions"), {
subsystem: "RoadNetwork"
}), q;
}

function bc(e, t) {
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

function Oc(e, t) {
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

function _c(e, t) {
var r, o;
if (0 === t.length) return null;
var n = t[0], a = e.getRangeTo(n);
try {
for (var s = i(t), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = e.getRangeTo(l);
u < a && (a = u, n = l);
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

function xc(e, t, r) {
var o, a, s, c, l, u, m, p, f;
void 0 === r && (r = {});
var d = n(n({}, Cc), r), y = new Map;
if (!d.includeRemoteRoads) return y;
var g = e.storage, h = e.find(FIND_MY_SPAWNS)[0], v = null !== (m = null == g ? void 0 : g.pos) && void 0 !== m ? m : null == h ? void 0 : h.pos;
if (!v) return y;
try {
for (var R = i(t), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
try {
var C = bc(e.name, T);
if (!C) {
jr.warn("Cannot determine exit direction from ".concat(e.name, " to ").concat(T), {
subsystem: "RoadNetwork"
});
continue;
}
var S = Oc(e.name, C);
if (0 === S.length) {
jr.warn("No valid exit positions found in ".concat(e.name, " towards ").concat(T), {
subsystem: "RoadNetwork"
});
continue;
}
var w = _c(v, S);
if (!w) continue;
var b = PathFinder.search(v, {
pos: w,
range: 0
}, {
plainCost: 2,
swampCost: 10,
maxOps: d.maxPathOps,
roomCallback: function(t) {
return t === e.name && Ac(t);
}
});
if (!b.incomplete) try {
for (var O = (s = void 0, i(b.path)), _ = O.next(); !_.done; _ = O.next()) {
var x = _.value;
y.has(x.roomName) || y.set(x.roomName, new Set), null === (p = y.get(x.roomName)) || void 0 === p || p.add("".concat(x.x, ",").concat(x.y));
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
var U = new RoomPosition(25, 25, T), A = PathFinder.search(v, {
pos: U,
range: 20
}, {
plainCost: 2,
swampCost: 10,
maxOps: d.maxPathOps,
roomCallback: function(e) {
return Ac(e);
}
});
if (!A.incomplete) try {
for (var N = (l = void 0, i(A.path)), M = N.next(); !M.done; M = N.next()) x = M.value, 
y.has(x.roomName) || y.set(x.roomName, new Set), null === (f = y.get(x.roomName)) || void 0 === f || f.add("".concat(x.x, ",").concat(x.y));
} catch (e) {
l = {
error: e
};
} finally {
try {
M && !M.done && (u = N.return) && u.call(N);
} finally {
if (l) throw l.error;
}
}
} catch (e) {
var k = e instanceof Error ? e.message : String(e);
jr.warn("Failed to calculate remote road to ".concat(T, ": ").concat(k), {
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
E && !E.done && (a = R.return) && a.call(R);
} finally {
if (o) throw o.error;
}
}
return y;
}

function Uc(e, t, r, o) {
var n, a, s = [], c = PathFinder.search(e, {
pos: t,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxOps: o,
roomCallback: function(e) {
return e === r && Ac(e);
}
});
if (!c.incomplete) try {
for (var l = i(c.path), u = l.next(); !u.done; u = l.next()) {
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
u && !u.done && (a = l.return) && a.call(l);
} finally {
if (n) throw n.error;
}
}
return s;
}

function Ac(e) {
var t, r, o, n, a = Game.rooms[e], s = new PathFinder.CostMatrix;
if (!a) return s;
var c = a.find(FIND_STRUCTURES);
try {
for (var l = i(c), u = l.next(); !u.done; u = l.next()) {
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
var p = a.find(FIND_MY_CONSTRUCTION_SITES);
try {
for (var f = i(p), d = f.next(); !d.done; d = f.next()) {
var y = d.value;
y.structureType === STRUCTURE_ROAD ? s.set(y.pos.x, y.pos.y, 1) : y.structureType !== STRUCTURE_CONTAINER && s.set(y.pos.x, y.pos.y, 255);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
d && !d.done && (n = f.return) && n.call(f);
} finally {
if (o) throw o.error;
}
}
return s;
}

function Nc(e, t) {
return e.x <= t || e.x >= 49 - t || e.y <= t || e.y >= 49 - t;
}

function Mc(e, t, r, o) {
var a, s, c, l, u, m, p, f, d, y, g;
void 0 === o && (o = []);
var h = new Set, v = e.getTerrain();
try {
for (var R = i(r), E = R.next(); !E.done; E = R.next()) {
var T = E.value, C = t.x + T.x, S = t.y + T.y;
C >= 1 && C <= 48 && S >= 1 && S <= 48 && v.get(C, S) !== TERRAIN_MASK_WALL && h.add("".concat(C, ",").concat(S));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
E && !E.done && (s = R.return) && s.call(R);
} finally {
if (a) throw a.error;
}
}
var w = wc(e, t);
try {
for (var b = i(w.positions), O = b.next(); !O.done; O = b.next()) {
var _ = O.value;
h.add(_);
}
} catch (e) {
c = {
error: e
};
} finally {
try {
O && !O.done && (l = b.return) && l.call(b);
} finally {
if (c) throw c.error;
}
}
var x = e.storage, U = e.find(FIND_MY_SPAWNS)[0], A = null !== (g = null == x ? void 0 : x.pos) && void 0 !== g ? g : null == U ? void 0 : U.pos;
if (A) {
var N = function(e, t, r) {
var o, a, s, c;
void 0 === r && (r = {});
var l = n(n({}, Cc), r), u = new Set;
try {
for (var m = i([ "top", "bottom", "left", "right" ]), p = m.next(); !p.done; p = m.next()) {
var f = p.value;
try {
var d = Oc(e.name, f);
if (0 === d.length) continue;
var y = _c(t, d);
if (!y) continue;
var g = PathFinder.search(t, {
pos: y,
range: 0
}, {
plainCost: 2,
swampCost: 10,
maxOps: l.maxPathOps,
roomCallback: function(t) {
return t === e.name && Ac(t);
}
});
if (g.incomplete) jr.warn("Incomplete path when calculating exit road for ".concat(f, " in ").concat(e.name, " (target exit: ").concat(y.x, ",").concat(y.y, "). Path length: ").concat(g.path.length), {
subsystem: "RoadNetwork"
}); else try {
for (var h = (s = void 0, i(g.path)), v = h.next(); !v.done; v = h.next()) {
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
jr.warn("Failed to calculate exit road for ".concat(f, " in ").concat(e.name, ": ").concat(E), {
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
p && !p.done && (a = m.return) && a.call(m);
} finally {
if (o) throw o.error;
}
}
return u;
}(e, A);
try {
for (var M = i(N), k = M.next(); !k.done; k = M.next()) _ = k.value, h.add(_);
} catch (e) {
u = {
error: e
};
} finally {
try {
k && !k.done && (m = M.return) && m.call(M);
} finally {
if (u) throw u.error;
}
}
}
if (o.length > 0) {
var P = xc(e, o).get(e.name);
if (P) try {
for (var I = i(P), G = I.next(); !G.done; G = I.next()) _ = G.value, h.add(_);
} catch (e) {
p = {
error: e
};
} finally {
try {
G && !G.done && (f = I.return) && f.call(I);
} finally {
if (p) throw p.error;
}
}
}
var L = function(e, t) {
var r, o, n, a;
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
for (var u = i(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
Nc(p.pos, t) && s.add("".concat(p.pos.x, ",").concat(p.pos.y));
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
for (var f = i(l), d = f.next(); !d.done; d = f.next()) {
var y = d.value;
Nc(y.pos, t) && s.add("".concat(y.pos.x, ",").concat(y.pos.y));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
d && !d.done && (a = f.return) && a.call(f);
} finally {
if (n) throw n.error;
}
}
return s;
}(e);
try {
for (var D = i(L), F = D.next(); !F.done; F = D.next()) _ = F.value, h.add(_);
} catch (e) {
d = {
error: e
};
} finally {
try {
F && !F.done && (y = D.return) && y.call(D);
} finally {
if (d) throw d.error;
}
}
return h;
}

var kc = function() {
function t() {
this.assignments = new Map;
}
return t.prototype.getDefenseRequestsFromMemory = function() {
var e;
return null !== (e = Memory.defenseRequests) && void 0 !== e ? e : [];
}, t.prototype.setDefenseRequestsInMemory = function(e) {
Memory.defenseRequests = e;
}, t.prototype.run = function() {
var e, t, r = this.getDefenseRequestsFromMemory();
this.cleanupAssignments();
try {
for (var o = i(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
this.processDefenseRequest(a);
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
}, t.prototype.processDefenseRequest = function(e) {
var t = Game.rooms[e.roomName];
if (t) {
var r = pc(t), o = Math.max(e.urgency, r.dangerLevel, r.assistanceRequired ? 3 : 0), n = this.getAssignedDefenders(e.roomName, "guard"), a = this.getAssignedDefenders(e.roomName, "ranger"), i = r.assistanceRequired ? Math.max(0, Math.ceil(r.totalHostileDPS / 300) - n.length) : 0, s = r.assistanceRequired ? Math.max(0, Math.ceil(r.totalHostileDPS / 300) - a.length) : 0, c = Math.max(0, e.guardsNeeded - n.length, i), l = Math.max(0, e.rangersNeeded - a.length, s);
0 === c && 0 === l || (c > 0 && this.assignDefenders(e.roomName, "guard", c, o), 
l > 0 && this.assignDefenders(e.roomName, "ranger", l, o));
}
}, t.prototype.assignDefenders = function(e, t, r, o) {
var n, a, s = this, c = this.findHelperRooms(e, o), l = 0;
try {
for (var u = i(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if (l >= r) break;
for (var f = p.find(FIND_MY_CREEPS, {
filter: function(e) {
var r = e.memory;
return r.role === t && !r.assistTarget && !s.assignments.has(e.name);
}
}), d = Math.min(f.length, 2, r - l), y = 0; y < d; y++) {
var g = f[y];
if (g) {
var h = Game.map.getRoomLinearDistance(p.name, e), v = Game.time + 50 * h, R = {
creepName: g.name,
targetRoom: e,
assignedAt: Game.time,
eta: v
};
this.assignments.set(g.name, R), g.memory.assistTarget = e, l++, bo.info("Assigned ".concat(t, " ").concat(g.name, " from ").concat(p.name, " to assist ").concat(e, " (ETA: ").concat(v - Game.time, " ticks)"), {
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
m && !m.done && (a = u.return) && a.call(u);
} finally {
if (n) throw n.error;
}
}
l > 0 && bo.info("Defense coordination: Assigned ".concat(l, "/").concat(r, " ").concat(t, "s to ").concat(e), {
subsystem: "Defense"
});
}, t.prototype.findHelperRooms = function(e, t) {
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
var n = cc(r.find(FIND_HOSTILE_CREEPS));
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
}, t.prototype.getAssignedDefenders = function(e, t) {
var r, o, n = [];
try {
for (var a = i(this.assignments.entries()), c = a.next(); !c.done; c = a.next()) {
var l = s(c.value, 2), u = l[0], m = l[1];
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
c && !c.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
return n;
}, t.prototype.cleanupAssignments = function() {
var e, t, r, o, n = [];
try {
for (var a = i(this.assignments.entries()), c = a.next(); !c.done; c = a.next()) {
var l = s(c.value, 2), u = l[0], m = l[1], p = Game.creeps[u];
p ? (p.room.name === m.targetRoom && 0 === cc(p.room.find(FIND_HOSTILE_CREEPS)).length && (delete p.memory.assistTarget, 
n.push(u), bo.debug("Released ".concat(u, " from defense assistance (no hostiles in ").concat(m.targetRoom, ")"), {
subsystem: "Defense"
})), Game.time - m.assignedAt > 1e3 && (delete p.memory.assistTarget, n.push(u), 
bo.debug("Removed stale defense assignment for ".concat(u), {
subsystem: "Defense"
}))) : n.push(u);
}
} catch (t) {
e = {
error: t
};
} finally {
try {
c && !c.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
try {
for (var f = i(n), d = f.next(); !d.done; d = f.next()) u = d.value, this.assignments.delete(u);
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
}, t.prototype.getAssignmentsForRoom = function(e) {
return this.getAssignedDefenders(e);
}, t.prototype.getAllAssignments = function() {
return Array.from(this.assignments.values());
}, t.prototype.cancelAssignment = function(e) {
if (this.assignments.get(e)) {
var t = Game.creeps[e];
t && delete t.memory.assistTarget, this.assignments.delete(e), bo.info("Cancelled defense assignment for ".concat(e), {
subsystem: "Defense"
});
}
}, a([ An("cluster:defense", "Defense Coordinator", {
priority: e.ProcessPriority.HIGH,
interval: 3,
minBucket: 0,
cpuBudget: .05
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Pc = new kc;

function Ic(e) {
return !!function(e, t) {
if ("retreat" === t.recommendedResponse || "safemode" === t.recommendedResponse) return !0;
var r = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory;
return "defender" === t.role || "rangedDefender" === t.role || "guard" === t.role || "ranger" === t.role;
}
});
if (t.hostileCount > 3 * r.length) return bo.info("Creep ".concat(e.name, " retreating: heavily outnumbered (").concat(t.hostileCount, " hostiles vs ").concat(r.length, " defenders)"), {
subsystem: "Defense",
room: e.room.name,
creep: e.name
}), !0;
var o = e.room.find(FIND_MY_CREEPS, {
filter: function(e) {
return "healer" === e.memory.role;
}
});
return e.hits < .3 * e.hitsMax && t.healerCount > 0 && 0 === o.length ? (bo.info("Creep ".concat(e.name, " retreating: damaged (").concat(e.hits, "/").concat(e.hitsMax, ") facing ").concat(t.healerCount, " enemy healers without friendly healer support"), {
subsystem: "Defense",
room: e.room.name,
creep: e.name
}), !0) : t.boostedCount > 0 && r.length < 2 * t.boostedCount && (bo.info("Creep ".concat(e.name, " retreating: facing ").concat(t.boostedCount, " boosted hostiles without sufficient support"), {
subsystem: "Defense",
room: e.room.name,
creep: e.name
}), !0);
}(e, pc(e.room)) && (function(e) {
var t, r, o, n, a = e.room.find(FIND_MY_SPAWNS)[0];
if (a) {
var l = e.moveTo(a, {
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
for (var f = i(Object.entries(u)), d = f.next(); !d.done; d = f.next()) {
var y = s(d.value, 2), g = y[0], h = y[1], v = Number(g), R = Game.rooms[h];
if (null === (n = null == R ? void 0 : R.controller) || void 0 === n ? void 0 : n.my) {
var E = m[v];
if (E) {
var T = e.room.find(E);
T.length > 0 && p.push.apply(p, c([], s(T), !1));
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = f.return) && o.call(f);
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

var Gc, Lc = function() {
function e() {}
return e.prototype.coordinateDefense = function(e) {
var t, r, o, n, a = function(e) {
var t = Rn.getCluster(e);
return t ? t.memberRooms : [];
}(e);
if (0 !== a.length) {
var s = [];
try {
for (var c = i(a), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = Game.rooms[u];
if (m) {
var p = pc(m);
s.push(p), p.dangerLevel >= 2 && vc(p);
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
var f = s.filter(function(e) {
return e.assistanceRequired;
}).sort(function(e, t) {
return t.assistancePriority - e.assistancePriority;
});
try {
for (var d = i(f), y = d.next(); !y.done; y = d.next()) {
var g = y.value, h = this.findAvailableDefenders(a, g.roomName);
h.length > 0 && (this.sendDefenders(h, g.roomName), bo.info("Cluster Defense: Sending ".concat(h.length, " defenders to ").concat(g.roomName), {
subsystem: "Defense",
room: g.roomName,
meta: {
cluster: e,
targetRoom: g.roomName,
threatScore: g.threatScore,
priority: g.assistancePriority
}
}));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
this.coordinateSafeMode(s);
}
}, e.prototype.findAvailableDefenders = function(e, t) {
var r, o, n = [];
try {
for (var a = i(e), l = a.next(); !l.done; l = a.next()) {
var u = l.value;
if (u !== t) {
var m = Game.rooms[u];
if (m && 0 === pc(m).dangerLevel) {
var p = m.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory;
return ("defender" === t.role || "rangedDefender" === t.role || "guard" === t.role || "ranger" === t.role) && !t.assistTarget;
}
});
n.push.apply(n, c([], s(p), !1));
}
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
l && !l.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
return n;
}, e.prototype.sendDefenders = function(e, t) {
var r, o;
try {
for (var n = i(e), a = n.next(); !a.done; a = n.next()) a.value.memory.assistTarget = t;
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
}, e.prototype.coordinateSafeMode = function(e) {
var t, r = e.filter(function(e) {
return "safemode" === e.recommendedResponse;
});
if (0 !== r.length) {
var o = r.reduce(function(e, t) {
return t.threatScore > e.threatScore ? t : e;
}), n = Game.rooms[o.roomName];
if ((null === (t = null == n ? void 0 : n.controller) || void 0 === t ? void 0 : t.my) && n.controller.safeModeAvailable > 0 && !n.controller.safeMode && !n.controller.safeModeCooldown) {
var a = n.controller.activateSafeMode();
a === OK ? bo.warn("Activated safe mode in ".concat(o.roomName), {
subsystem: "Defense",
room: o.roomName,
meta: {
threatScore: o.threatScore,
hostiles: o.hostileCount,
dangerLevel: o.dangerLevel
}
}) : bo.error("Failed to activate safe mode in ".concat(o.roomName, ": ").concat(a), {
subsystem: "Defense",
room: o.roomName,
meta: {
errorCode: a
}
});
}
}
}, e;
}(), Dc = new Lc;

function Fc(e) {
var t, r, o, n, a, s, c = {
guards: 0,
rangers: 0,
healers: 0,
urgency: 1,
reasons: []
}, l = null !== (s = null === (a = e.controller) || void 0 === a ? void 0 : a.level) && void 0 !== s ? s : 1;
l >= 3 && (c.guards = 1, c.rangers = 1, c.reasons.push("Baseline defense force for RCL ".concat(l)));
var u = e.find(FIND_HOSTILE_CREEPS);
if (0 === u.length) return c;
var m = 0, p = 0, f = 0, d = 0, y = 0;
try {
for (var g = i(u), h = g.next(); !h.done; h = g.next()) {
var v = h.value.body, R = v.some(function(e) {
return void 0 !== e.boost;
});
R && y++;
try {
for (var E = (o = void 0, i(v)), T = E.next(); !T.done; T = E.next()) {
var C = T.value;
C.type === ATTACK && m++, C.type === RANGED_ATTACK && p++, C.type === HEAL && f++, 
C.type === WORK && d++;
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
f > 0 && (c.healers = Math.max(1, Math.ceil(f / 8)), c.reasons.push("".concat(f, " heal parts detected"))), 
d > 0 && (c.guards += Math.ceil(d / 5), c.reasons.push("".concat(d, " work parts (dismantlers)"))), 
y > 0 && (c.guards = Math.ceil(1.5 * c.guards), c.rangers = Math.ceil(1.5 * c.rangers), 
c.healers = Math.ceil(1.5 * c.healers), c.urgency = 2, c.reasons.push("".concat(y, " boosted enemies (high threat)"))), 
u.length > 0 && (c.guards = Math.max(c.guards, 2), c.rangers = Math.max(c.rangers, 2)), 
u.length >= 3 && (c.healers = Math.max(c.healers, 1)), u.length >= 5 && (c.urgency = Math.max(c.urgency, 1.5), 
c.reasons.push("".concat(u.length, " hostiles (large attack)"))), e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_STORAGE || e.structureType === STRUCTURE_TERMINAL) && e.hits < .8 * e.hitsMax;
}
}).length > 0 && (c.urgency = 3, c.reasons.push("Critical structures under attack!")), 
jr.info("Defender analysis for ".concat(e.name, ": ").concat(c.guards, " guards, ").concat(c.rangers, " rangers, ").concat(c.healers, " healers (urgency: ").concat(c.urgency, "x) - ").concat(c.reasons.join(", ")), {
subsystem: "Defense"
}), c;
}

function Bc(e) {
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

function Hc(e, t) {
var r, o;
if (t.danger < 1) return !1;
var n = Fc(e), a = Bc(e), i = n.guards - a.guards + (n.rangers - a.rangers);
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

function Wc(e, t) {
if (!Hc(e, t)) return null;
var r = Fc(e), o = Bc(e), n = {
roomName: e.name,
guardsNeeded: Math.max(0, r.guards - o.guards),
rangersNeeded: Math.max(0, r.rangers - o.rangers),
healersNeeded: Math.max(0, r.healers - o.healers),
urgency: r.urgency,
createdAt: Game.time,
threat: r.reasons.join("; ")
};
return jr.warn("Defense assistance requested for ".concat(e.name, ": ").concat(n.guardsNeeded, " guards, ").concat(n.rangersNeeded, " rangers, ").concat(n.healersNeeded, " healers - ").concat(n.threat), {
subsystem: "Defense"
}), n;
}

!function(e) {
e[e.NONE = 0] = "NONE", e[e.LOW = 1] = "LOW", e[e.MEDIUM = 2] = "MEDIUM", e[e.HIGH = 3] = "HIGH", 
e[e.CRITICAL = 4] = "CRITICAL";
}(Gc || (Gc = {}));

var Yc = function() {
function e() {
this.emergencyStates = new Map;
}
return e.prototype.assess = function(e, t) {
var r, o = this.emergencyStates.get(e.name), n = this.calculateEmergencyLevel(e, t);
return n !== Gc.NONE || o ? (o ? (r = o).level = n : (r = {
level: n,
startedAt: Game.time,
assistanceRequested: !1,
boostsAllocated: !1,
lastEscalation: 0
}, this.emergencyStates.set(e.name, r)), n === Gc.NONE ? (o && (bo.info("Emergency resolved in ".concat(e.name), {
subsystem: "Defense"
}), this.emergencyStates.delete(e.name)), r) : (o && n > o.level && (bo.warn("Emergency escalated in ".concat(e.name, ": Level ").concat(o.level, " → ").concat(n), {
subsystem: "Defense"
}), r.lastEscalation = Game.time), this.executeEmergencyResponse(e, t, r), r)) : {
level: Gc.NONE,
startedAt: Game.time,
assistanceRequested: !1,
boostsAllocated: !1,
lastEscalation: 0
};
}, e.prototype.calculateEmergencyLevel = function(e, t) {
if (0 === t.danger) return Gc.NONE;
var r = cc(e.find(FIND_HOSTILE_CREEPS)), o = Fc(e), n = Bc(e);
if (e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_SPAWN || e.structureType === STRUCTURE_STORAGE || e.structureType === STRUCTURE_TERMINAL) && e.hits < .3 * e.hitsMax;
}
}).length > 0) return Gc.CRITICAL;
var a = r.filter(function(e) {
return e.body.some(function(e) {
return e.boost;
});
}), i = o.guards - n.guards + (o.rangers - n.rangers);
return a.length > 0 && i >= 2 || r.length >= 5 && 0 === n.guards && 0 === n.rangers ? Gc.HIGH : t.danger >= 2 && i >= 1 ? Gc.MEDIUM : t.danger >= 1 ? Gc.LOW : Gc.NONE;
}, e.prototype.executeEmergencyResponse = function(e, t, r) {
r.level !== Gc.HIGH && r.level !== Gc.CRITICAL || r.assistanceRequested || this.requestDefenseAssistance(e, t) && (r.assistanceRequested = !0), 
r.level >= Gc.MEDIUM && !r.boostsAllocated && e.controller && e.controller.level >= 6 && (this.allocateBoostsForDefense(e, t), 
r.boostsAllocated = !0), this.updateDefensePosture(e, t, r);
}, e.prototype.requestDefenseAssistance = function(e, t) {
var r;
if (!Hc(e, t)) return !1;
var o = Wc(e, t);
if (!o) return !1;
var n = Memory, a = (null !== (r = n.defenseRequests) && void 0 !== r ? r : []).filter(function(t) {
return t.roomName !== e.name || Game.time - t.createdAt < 500;
});
return a.push(o), n.defenseRequests = a, bo.warn("Defense assistance requested for ".concat(e.name, ": ") + "".concat(o.guardsNeeded, " guards, ").concat(o.rangersNeeded, " rangers - ").concat(o.threat), {
subsystem: "Defense"
}), !0;
}, e.prototype.allocateBoostsForDefense = function(e, t) {
var r, o = Memory, n = null !== (r = o.boostDefensePriority) && void 0 !== r ? r : {};
n[e.name] = !0, o.boostDefensePriority = n, bo.info("Allocated boost priority for defenders in ".concat(e.name), {
subsystem: "Defense"
});
}, e.prototype.updateDefensePosture = function(e, t, r) {
switch (r.level) {
case Gc.CRITICAL:
"evacuate" !== t.posture && (t.posture = "war", t.pheromones.war = 100, t.pheromones.defense = 100, 
bo.warn("".concat(e.name, " posture: CRITICAL DEFENSE"), {
subsystem: "Defense"
}));
break;

case Gc.HIGH:
"war" !== t.posture && "evacuate" !== t.posture && (t.posture = "defensive", t.pheromones.defense = 80, 
t.pheromones.war = 40, bo.info("".concat(e.name, " posture: HIGH DEFENSE"), {
subsystem: "Defense"
}));
break;

case Gc.MEDIUM:
"eco" !== t.posture && "expand" !== t.posture || (t.posture = "defensive", t.pheromones.defense = 60, 
bo.info("".concat(e.name, " posture: MEDIUM DEFENSE"), {
subsystem: "Defense"
}));
break;

case Gc.LOW:
"eco" !== t.posture && "expand" !== t.posture || (t.pheromones.defense = 30, bo.debug("".concat(e.name, ": LOW DEFENSE alert"), {
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
return void 0 !== t && t.level > Gc.NONE;
}, e.prototype.getActiveEmergencies = function() {
var e, t, r = [];
try {
for (var o = i(this.emergencyStates.entries()), n = o.next(); !n.done; n = o.next()) {
var a = s(n.value, 2), c = a[0], l = a[1];
l.level > Gc.NONE && r.push({
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
}(), Kc = new Yc, jc = function() {
function e() {}
return e.prototype.checkSafeMode = function(e, t) {
var r, o, n, a, i;
if (!(null === (r = e.controller) || void 0 === r ? void 0 : r.safeMode) && !(null === (o = e.controller) || void 0 === o ? void 0 : o.safeModeCooldown) && 0 !== (null !== (a = null === (n = e.controller) || void 0 === n ? void 0 : n.safeModeAvailable) && void 0 !== a ? a : 0) && this.shouldTriggerSafeMode(e, t)) {
var s = null === (i = e.controller) || void 0 === i ? void 0 : i.activateSafeMode();
if (s === OK) bo.warn("SAFE MODE ACTIVATED in ".concat(e.name), {
subsystem: "Defense"
}); else {
var c = void 0 !== s ? String(s) : "undefined";
bo.error("Failed to activate safe mode in ".concat(e.name, ": ").concat(c), {
subsystem: "Defense"
});
}
}
}, e.prototype.shouldTriggerSafeMode = function(e, t) {
var r, o;
if (t.danger < 2) return !1;
var n = e.find(FIND_MY_SPAWNS);
try {
for (var a = i(n), s = a.next(); !s.done; s = a.next()) {
var c = s.value;
if (c.hits < .2 * c.hitsMax) return bo.warn("Spawn ".concat(c.name, " critical: ").concat(c.hits, "/").concat(c.hitsMax), {
subsystem: "Defense"
}), !0;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
if (e.storage && e.storage.hits < .2 * e.storage.hitsMax) return bo.warn("Storage critical: ".concat(e.storage.hits, "/").concat(e.storage.hitsMax), {
subsystem: "Defense"
}), !0;
if (e.terminal && e.terminal.hits < .2 * e.terminal.hitsMax) return bo.warn("Terminal critical: ".concat(e.terminal.hits, "/").concat(e.terminal.hitsMax), {
subsystem: "Defense"
}), !0;
var l = cc(e.find(FIND_HOSTILE_CREEPS)), u = e.find(FIND_MY_CREEPS, {
filter: function(e) {
var t = e.memory.role;
return "guard" === t || "ranger" === t || "soldier" === t;
}
});
if (l.length > 3 * u.length) return bo.warn("Overwhelmed: ".concat(l.length, " hostiles vs ").concat(u.length, " defenders"), {
subsystem: "Defense"
}), !0;
var m = l.filter(function(e) {
return e.body.some(function(e) {
return e.boost;
});
});
return m.length > 0 && u.length < 2 * m.length && (bo.warn("Boosted hostiles detected: ".concat(m.length), {
subsystem: "Defense"
}), !0);
}, e;
}(), Vc = new jc, qc = {
triggerDangerLevel: 3,
nukeEvacuationLeadTime: 5e3,
minStorageEnergy: 5e4,
priorityResources: [ RESOURCE_ENERGY, RESOURCE_POWER, RESOURCE_GHODIUM, RESOURCE_CATALYZED_GHODIUM_ACID, RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_LEMERGIUM_ACID, RESOURCE_CATALYZED_KEANIUM_ACID, RESOURCE_CATALYZED_ZYNTHIUM_ACID, RESOURCE_OPS ],
maxTransfersPerTick: 2
}, zc = function() {
function t(e) {
void 0 === e && (e = {}), this.evacuations = new Map, this.lastTransferTick = 0, 
this.transfersThisTick = 0, this.config = n(n({}, qc), e);
}
return t.prototype.run = function() {
var e, t, r, o;
Game.time !== this.lastTransferTick && (this.transfersThisTick = 0, this.lastTransferTick = Game.time), 
this.checkEvacuationTriggers();
try {
for (var n = i(this.evacuations.values()), a = n.next(); !a.done; a = n.next()) (u = a.value).complete || this.processEvacuation(u);
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
try {
for (var c = i(this.evacuations.entries()), l = c.next(); !l.done; l = c.next()) {
var u, m = s(l.value, 2), p = m[0];
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
var e, t, r, o;
for (var n in Game.rooms) {
var a = Game.rooms[n];
if ((null === (e = a.controller) || void 0 === e ? void 0 : e.my) && !this.evacuations.has(n)) {
var i = Rn.getSwarmState(n);
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
bo.warn("Triggering evacuation for ".concat(n, ": ").concat(l, " nuke(s) detected, impact in ").concat(null !== (r = c.timeToLand) && void 0 !== r ? r : 0, " ticks"), {
subsystem: "Evacuation"
}), this.startEvacuation(n, "nuke", Game.time + (null !== (o = c.timeToLand) && void 0 !== o ? o : 0));
continue;
}
}
if (i.danger >= this.config.triggerDangerLevel && "siege" === i.posture) {
var u = cc(a.find(FIND_HOSTILE_CREEPS)), m = a.find(FIND_MY_CREEPS, {
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
}, t.prototype.startEvacuation = function(e, t, r) {
var o;
if (this.evacuations.has(e)) return !1;
var n = Game.rooms[e];
if (!n || !(null === (o = n.controller) || void 0 === o ? void 0 : o.my)) return !1;
var a = this.findEvacuationTarget(e);
if (!a) return bo.error("Cannot evacuate ".concat(e, ": no valid target room found"), {
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
var s = Rn.getSwarmState(e);
return s && (s.posture = "evacuate"), bo.warn("Starting evacuation of ".concat(e, " (").concat(t, "), target: ").concat(a) + (r ? ", deadline: ".concat(r - Game.time, " ticks") : ""), {
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
var s = cc(t.find(FIND_HOSTILE_CREEPS));
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
if (!t) return e.complete = !0, void bo.error("Lost room ".concat(e.roomName, " during evacuation"), {
subsystem: "Evacuation"
});
this.transfersThisTick < this.config.maxTransfersPerTick && this.transferResources(e, t, r), 
this.recallCreeps(e, t), e.progress = this.calculateProgress(e, t), e.progress >= 100 && (e.complete = !0, 
bo.info("Evacuation of ".concat(e.roomName, " complete: ") + "".concat(e.resourcesEvacuated.reduce(function(e, t) {
return e + t.amount;
}, 0), " resources, ") + "".concat(e.creepsRecalled.length, " creeps"), {
subsystem: "Evacuation"
})), e.deadline && Game.time >= e.deadline && (e.complete = !0, bo.warn("Evacuation of ".concat(e.roomName, " reached deadline"), {
subsystem: "Evacuation"
}));
}, t.prototype.transferResources = function(e, t, r) {
var o, n, a, s, c = t.terminal, l = null == r ? void 0 : r.terminal;
if (c && l) {
var u = Game.map.getRoomLinearDistance(t.name, e.targetRoom), m = function(e) {
return Math.ceil(e * (1 - Math.exp(-u / 30)));
};
try {
for (var p = i(this.config.priorityResources), f = p.next(); !f.done; f = p.next()) {
var d = f.value;
if (!((R = c.store.getUsedCapacity(d)) <= 0 || (E = l.store.getFreeCapacity(d)) <= 0)) {
var y = m(R), g = c.store.getUsedCapacity(RESOURCE_ENERGY);
if (!(d !== RESOURCE_ENERGY && y > g || (T = Math.min(R, E, 5e4)) <= 0 || c.send(d, T, e.targetRoom) !== OK)) return e.resourcesEvacuated.push({
resourceType: d,
amount: T
}), this.transfersThisTick++, void bo.debug("Evacuated ".concat(T, " ").concat(d, " from ").concat(t.name, " to ").concat(e.targetRoom), {
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
f && !f.done && (n = p.return) && n.call(p);
} finally {
if (o) throw o.error;
}
}
try {
for (var h = i(Object.keys(c.store)), v = h.next(); !v.done; v = h.next()) {
var R, E, T;
if (!(d = v.value, this.config.priorityResources.includes(d) || (R = c.store.getUsedCapacity(d)) <= 0 || (E = l.store.getFreeCapacity(d)) <= 0 || (y = m(R), 
g = c.store.getUsedCapacity(RESOURCE_ENERGY), d !== RESOURCE_ENERGY && y > g || (T = Math.min(R, E, 5e4)) <= 0 || c.send(d, T, e.targetRoom) !== OK))) return e.resourcesEvacuated.push({
resourceType: d,
amount: T
}), void this.transfersThisTick++;
}
} catch (e) {
a = {
error: e
};
} finally {
try {
v && !v.done && (s = h.return) && s.call(h);
} finally {
if (a) throw a.error;
}
}
}
}, t.prototype.recallCreeps = function(e, t) {
var r, o;
try {
for (var n = i(t.find(FIND_MY_CREEPS)), a = n.next(); !a.done; a = n.next()) {
var s = a.value, c = s.memory;
c.evacuating || (c.evacuating = !0, c.evacuationTarget = e.targetRoom, e.creepsRecalled.push(s.name));
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
}, t.prototype.calculateProgress = function(e, t) {
var r = t.terminal, o = t.storage, n = 0, a = 0;
r && (n += 1e5, a += r.store.getUsedCapacity()), o && (n += o.store.getCapacity(), 
a += o.store.getUsedCapacity());
var i = n > 0 ? Math.min(100, (n - a) / n * 100) : 100, s = t.find(FIND_MY_CREEPS).length, c = e.creepsRecalled.length > 0 ? Math.min(100, (e.creepsRecalled.length - s) / e.creepsRecalled.length * 100) : 100;
return Math.round((i + c) / 2);
}, t.prototype.cancelEvacuation = function(e) {
var t, r, o = this.evacuations.get(e);
if (o) {
this.evacuations.delete(e);
try {
for (var n = i(o.creepsRecalled), a = n.next(); !a.done; a = n.next()) {
var s = a.value, c = Game.creeps[s];
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
a && !a.done && (r = n.return) && r.call(n);
} finally {
if (t) throw t.error;
}
}
var u = Rn.getSwarmState(e);
u && (u.posture = "eco"), bo.info("Evacuation of ".concat(e, " cancelled"), {
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
}, a([ An("cluster:evacuation", "Evacuation Manager", {
priority: e.ProcessPriority.HIGH,
interval: 5,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Xc = new zc, Qc = Yr("MilitaryBehaviors"), Zc = "patrol";

function $c(e) {
var t, r, o = e.find(FIND_MY_SPAWNS), n = o.length, a = e.name, s = xs.get(a, {
namespace: Zc
});
if (s && s.metadata.spawnCount === n) return s.waypoints.map(function(e) {
return new RoomPosition(e.x, e.y, e.roomName);
});
var c = e.name, l = [];
try {
for (var u = i(o), m = u.next(); !m.done; m = u.next()) {
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
var f = l.map(function(e) {
return {
x: Math.max(2, Math.min(47, e.x)),
y: Math.max(2, Math.min(47, e.y)),
roomName: c
};
}).filter(function(t) {
return e.getTerrain().get(t.x, t.y) !== TERRAIN_MASK_WALL;
}).map(function(e) {
return new RoomPosition(e.x, e.y, e.roomName);
}), d = {
waypoints: f.map(function(e) {
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
return xs.set(a, d, {
namespace: Zc,
ttl: 1e3
}), f;
}

function Jc(e, t) {
var r;
if (0 === t.length) return null;
var o = e.memory;
void 0 === o.patrolIndex && (o.patrolIndex = 0);
var n = t[o.patrolIndex % t.length];
return n && e.pos.getRangeTo(n) <= 2 && (o.patrolIndex = (o.patrolIndex + 1) % t.length), 
null !== (r = t[o.patrolIndex % t.length]) && void 0 !== r ? r : null;
}

function el(e) {
var t, r;
if (0 === e.hostiles.length) return null;
var o = e.hostiles.map(function(e) {
var t, r, o = 0;
if (o += 100 * e.getActiveBodyparts(HEAL), o += 50 * e.getActiveBodyparts(RANGED_ATTACK), 
o += 40 * e.getActiveBodyparts(ATTACK), o += 60 * e.getActiveBodyparts(CLAIM), (o += 30 * e.getActiveBodyparts(WORK)) > 0) try {
for (var n = i(e.body), a = n.next(); !a.done; a = n.next()) if (a.value.boost) {
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

function tl(e, t) {
return e.getActiveBodyparts(t) > 0;
}

function rl(e, t) {
if (!e.swarmState) return null;
var r = Fs(e.room.name);
return r && e.creep.pos.getRangeTo(r) > 2 ? (Qc.debug("".concat(e.creep.name, " ").concat(t, " moving to collection point at ").concat(r.x, ",").concat(r.y)), 
{
type: "moveTo",
target: r
}) : null;
}

function ol(e) {
var t;
return null === (t = Memory.squads) || void 0 === t ? void 0 : t[e];
}

function nl(e) {
var t = e.creep.memory;
if (Ic(e.creep)) return {
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
var r = el(e);
if (r) {
var o = e.creep.pos.getRangeTo(r), n = tl(e.creep, RANGED_ATTACK), a = tl(e.creep, ATTACK);
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
var i = el(e);
if (i) return o = e.creep.pos.getRangeTo(i), n = tl(e.creep, RANGED_ATTACK), a = tl(e.creep, ATTACK), 
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
var s = $c(e.room), c = Jc(e.creep, s);
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

function al(e) {
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
var l = Gs(e.creep, c, "healer_follow", 5);
if (l) return {
type: "moveTo",
target: l
};
}
var u = $c(e.room), m = Jc(e.creep, u);
return m ? {
type: "moveTo",
target: m
} : {
type: "idle"
};
}

function il(e) {
var t;
if (e.memory.squadId) {
var r = ol(e.memory.squadId);
if (r) return ll(e, r);
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
var a = el(e);
if (a) {
var i = e.creep.pos.getRangeTo(a), s = tl(e.creep, RANGED_ATTACK), c = tl(e.creep, ATTACK);
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
var l = Ka(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
if (l) return {
type: "attack",
target: l
};
var u = $c(e.room), m = Jc(e.creep, u);
if (m) return {
type: "moveTo",
target: m
};
var p = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (p.length > 0) {
var f = Gs(e.creep, p, "soldier_spawn", 20);
if (f && e.creep.pos.getRangeTo(f) > 5) return {
type: "moveTo",
target: f
};
}
return {
type: "idle"
};
}

function sl(e) {
var t;
if (e.memory.squadId) {
var r = ol(e.memory.squadId);
if (r) return ll(e, r);
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
var a = Ka(e.creep.pos, FIND_HOSTILE_SPAWNS);
if (a) return {
type: "dismantle",
target: a
};
var i = Ka(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
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
var c = Gs(e.creep, s, "siege_wall", 10);
if (c) return {
type: "dismantle",
target: c
};
}
var l = Ka(e.creep.pos, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
if (l) return {
type: "dismantle",
target: l
};
var u = rl(e, "siegeUnit");
if (u) return u;
var m = $c(e.room), p = Jc(e.creep, m);
return p ? {
type: "moveTo",
target: p
} : {
type: "idle"
};
}

function cl(e) {
var t = e.creep.memory;
if (Ic(e.creep)) return {
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
var n = el(e);
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
var a = ol(e.memory.squadId);
if (a) return ll(e, a);
}
var i, s = el(e);
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
var c = $c(e.room), l = Jc(e.creep, c);
if (l) return {
type: "moveTo",
target: l
};
var u = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (u.length > 0) {
var m = Gs(e.creep, u, "harasser_home_spawn", 20);
if (m && e.creep.pos.getRangeTo(m) > 10) return {
type: "moveTo",
target: m
};
}
return {
type: "idle"
};
}

function ll(e, t) {
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
return il(e);

case "healer":
return al(e);

case "siegeUnit":
return sl(e);

case "ranger":
return cl(e);
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

var ul = {
guard: nl,
remoteGuard: function(e) {
var t = e.creep.memory;
if (!t.targetRoom) {
if (e.creep.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = $c(e.room);
return (o = Jc(e.creep, r)) ? {
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
} : (r = $c(e.room), (o = Jc(e.creep, r)) ? {
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
return tl(e, HEAL);
}), t.filter(function(e) {
return tl(e, RANGED_ATTACK);
}), t.filter(function(e) {
return tl(e, ATTACK);
}), t ];
try {
for (var a = i(n), s = a.next(); !s.done; s = a.next()) {
var c = s.value;
if (c.length > 0) return e.creep.pos.findClosestByRange(c);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
return null;
}(e, n);
if (a) {
var s = e.creep.pos.getRangeTo(a), c = tl(e.creep, RANGED_ATTACK), l = tl(e.creep, ATTACK);
return c && s <= 3 ? {
type: "rangedAttack",
target: a
} : l && s <= 1 ? {
type: "attack",
target: a
} : {
type: "moveTo",
target: a
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
healer: al,
soldier: il,
siegeUnit: sl,
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
if (!t) return rl(e, "harasser (no target)") || {
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
var s = rl(e, "harasser (no targets)");
if (s) return s;
var c = $c(e.room), l = Jc(e.creep, c);
return l ? {
type: "moveTo",
target: l
} : {
type: "idle"
};
},
ranger: cl
};

function ml(e) {
var t;
return (null !== (t = ul[e.memory.role]) && void 0 !== t ? t : nl)(e);
}

function pl(e, t) {
var r = e.effects;
return void 0 !== r && Array.isArray(r) && r.some(function(e) {
return e.effect === t;
});
}

function fl(e) {
var t = e.memory.targetRoom;
if (!t) return {
type: "idle"
};
if (e.room.name !== t) return {
type: "moveToRoom",
roomName: t
};
var r = As(e.room, FIND_STRUCTURES, {
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
var o = As(e.room, FIND_MY_CREEPS, {
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

var dl = {
powerHarvester: fl,
powerCarrier: function(e) {
var t = e.memory.targetRoom;
if (e.creep.store.getUsedCapacity(RESOURCE_POWER) > 0) {
if (e.room.name !== e.homeRoom) return {
type: "moveToRoom",
roomName: e.homeRoom
};
var r = Game.rooms[e.homeRoom];
if (r) {
var o = Ms(r, STRUCTURE_POWER_SPAWN)[0];
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
var n = ks(e.room, RESOURCE_POWER)[0];
if (n) return {
type: "pickup",
target: n
};
var a = As(e.room, FIND_RUINS, {
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
var i = As(e.room, FIND_STRUCTURES, {
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

function yl(e) {
var t;
return (null !== (t = dl[e.memory.role]) && void 0 !== t ? t : fl)(e);
}

function gl(e, t) {
var r, o, n, a, i, s, c, l = t.knownRooms, u = l[e.name], m = null !== (r = null == u ? void 0 : u.lastSeen) && void 0 !== r ? r : 0, p = Game.time - m;
if (u && p < 2e3) {
u.lastSeen = Game.time;
var f = Ya(e, FIND_HOSTILE_CREEPS);
return u.threatLevel = f.length > 5 ? 3 : f.length > 2 ? 2 : f.length > 0 ? 1 : 0, 
void (e.controller && (u.controllerLevel = null !== (o = e.controller.level) && void 0 !== o ? o : 0, 
(null === (n = e.controller.owner) || void 0 === n ? void 0 : n.username) && (u.owner = e.controller.owner.username), 
(null === (a = e.controller.reservation) || void 0 === a ? void 0 : a.username) && (u.reserver = e.controller.reservation.username)));
}
for (var d = e.find(FIND_SOURCES), y = e.find(FIND_MINERALS)[0], g = e.controller, h = Ya(e, FIND_HOSTILE_CREEPS), v = e.getTerrain(), R = 0, E = 0, T = 5; T < 50; T += 10) for (var C = 5; C < 50; C += 10) {
var S = v.get(T, C);
S === TERRAIN_MASK_SWAMP ? R++ : 0 === S && E++;
}
var w = R > 2 * E ? "swamp" : E > 2 * R ? "plains" : "mixed", b = e.name.match(/^[WE](\d+)[NS](\d+)$/), O = !!b && (parseInt(b[1], 10) % 10 == 0 || parseInt(b[2], 10) % 10 == 0), _ = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_KEEPER_LAIR;
}
}).length > 0, x = {
name: e.name,
lastSeen: Game.time,
sources: d.length,
controllerLevel: null !== (i = null == g ? void 0 : g.level) && void 0 !== i ? i : 0,
threatLevel: h.length > 5 ? 3 : h.length > 2 ? 2 : h.length > 0 ? 1 : 0,
scouted: !0,
terrain: w,
isHighway: O,
isSK: _
};
(null === (s = null == g ? void 0 : g.owner) || void 0 === s ? void 0 : s.username) && (x.owner = g.owner.username), 
(null === (c = null == g ? void 0 : g.reservation) || void 0 === c ? void 0 : c.username) && (x.reserver = g.reservation.username), 
(null == y ? void 0 : y.mineralType) && (x.mineralType = y.mineralType), l[e.name] = x;
}

function hl(e) {
return {
type: "moveTo",
target: new RoomPosition(25, 25, e)
};
}

function vl(e) {
var t = Es.getEmpire();
if (vs.isExit(e.creep.pos)) return hl(e.room.name);
var r = e.memory.lastExploredRoom, o = e.memory.targetRoom;
if (!o) {
if (o = function(e, t, r) {
var o, n, a, c, l, u = t.knownRooms, m = Game.map.describeExits(e);
if (m) {
var p = [];
try {
for (var f = i(Object.entries(m)), d = f.next(); !d.done; d = f.next()) {
var y = s(d.value, 2)[1];
if (!r || y !== r) {
var g = null !== (c = null === (a = u[y]) || void 0 === a ? void 0 : a.lastSeen) && void 0 !== c ? c : 0;
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
d && !d.done && (n = f.return) && n.call(f);
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
for (var a = i(o), s = a.next(); !s.done; s = a.next()) {
var c = s.value;
if (n.get(c.x, c.y) !== TERRAIN_MASK_WALL) return c;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
return null;
}(e.room);
return n ? e.creep.pos.getRangeTo(n) <= 3 ? (gl(e.room, t), e.memory.lastExploredRoom = e.room.name, 
delete e.memory.targetRoom, {
type: "idle"
}) : {
type: "moveTo",
target: n
} : (gl(e.room, t), e.memory.lastExploredRoom = e.room.name, delete e.memory.targetRoom, 
{
type: "idle"
});
}
return {
type: "idle"
};
}

var Rl = {
scout: vl,
claimer: function(e) {
var t = e.memory.targetRoom;
if (!t) {
var r = e.spawnStructures.filter(function(e) {
return e.structureType === STRUCTURE_SPAWN;
});
if (r.length > 0) {
var o = Gs(e.creep, r, "claimer_spawn", 20);
if (o) return {
type: "moveTo",
target: o
};
}
return {
type: "idle"
};
}
if (vs.isExit(e.creep.pos)) return hl(e.room.name);
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
var n = Gs(e.creep, o, "engineer_critical", 5);
if (n) return {
type: "repair",
target: n
};
}
var a = e.repairTargets.filter(function(e) {
return (e.structureType === STRUCTURE_ROAD || e.structureType === STRUCTURE_CONTAINER) && e.hits < .75 * e.hitsMax;
});
if (a.length > 0) {
var i = Gs(e.creep, a, "engineer_infra", 5);
if (i) return {
type: "repair",
target: i
};
}
var s = null !== (r = null === (t = e.swarmState) || void 0 === t ? void 0 : t.danger) && void 0 !== r ? r : 0, c = 0 === s ? 1e5 : 1 === s ? 3e5 : 2 === s ? 5e6 : 5e7, l = e.repairTargets.filter(function(e) {
return e.structureType === STRUCTURE_RAMPART && e.hits < c;
});
if (l.length > 0) {
var u = Gs(e.creep, l, "engineer_rampart", 5);
if (u) return {
type: "repair",
target: u
};
}
var m = e.repairTargets.filter(function(e) {
return e.structureType === STRUCTURE_WALL && e.hits < c;
});
if (m.length > 0) {
var p = Gs(e.creep, m, "engineer_wall", 5);
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
var f = e.containers.filter(function(e) {
return e.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
});
if (f.length > 0) {
var d = Gs(e.creep, f, "engineer_cont", 15);
if (d) return {
type: "withdraw",
target: d,
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
var n = Gs(e.creep, o, "remoteWorker_spawn", 5);
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
for (var a = i(Object.keys(e.storage.store)), s = a.next(); !s.done; s = a.next()) {
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
s && !s.done && (r = a.return) && r.call(a);
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

function El(e) {
var t;
return (null !== (t = Rl[e.memory.role]) && void 0 !== t ? t : vl)(e);
}

function Tl(e) {
var t = function(e) {
var t, r, o;
if (!e.room) return null;
var n = e.room, a = null !== (o = e.memory.homeRoom) && void 0 !== o ? o : n.name, s = Ms(n, STRUCTURE_LAB), c = Ms(n, STRUCTURE_SPAWN), l = Ms(n, STRUCTURE_EXTENSION), u = Ms(n, STRUCTURE_FACTORY)[0], m = Ms(n, STRUCTURE_POWER_SPAWN)[0], p = [];
try {
for (var f = i(Object.keys(e.powers)), d = f.next(); !d.done; d = f.next()) {
var y = d.value, g = e.powers[y];
g && 0 === g.cooldown && p.push(y);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
d && !d.done && (r = f.return) && r.call(f);
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
(t.target ? e.usePower(t.power, t.target) : e.usePower(t.power)) === ERR_NOT_IN_RANGE && t.target && vs.moveTo(e, t.target);
break;

case "moveTo":
vs.moveTo(e, t.target);
break;

case "moveToRoom":
var o = new RoomPosition(25, 25, t.roomName);
vs.moveTo(e, {
pos: o,
range: 20
}, {
maxRooms: 16
});
break;

case "renewSelf":
e.renew(t.spawn) === ERR_NOT_IN_RANGE && vs.moveTo(e, t.spawn);
break;

case "enableRoom":
(null === (r = e.room) || void 0 === r ? void 0 : r.controller) && e.enableRoom(e.room.controller) === ERR_NOT_IN_RANGE && vs.moveTo(e, e.room.controller);
}
}(e, function(e) {
return "powerWarrior" === e.powerCreep.memory.role ? function(e) {
var t, r;
if (void 0 !== e.powerCreep.ticksToLive && e.powerCreep.ticksToLive < 1e3 && e.powerSpawn) return {
type: "renewSelf",
spawn: e.powerSpawn
};
var o = e.availablePowers, n = Ya(e.room, FIND_HOSTILE_CREEPS), a = Ya(e.room, FIND_HOSTILE_STRUCTURES);
if (e.room.controller && !e.room.controller.isPowerEnabled) return {
type: "enableRoom"
};
if (o.includes(PWR_GENERATE_OPS) && e.ops < 20) return {
type: "usePower",
power: PWR_GENERATE_OPS
};
if (o.includes(PWR_SHIELD) && e.ops >= 10 && n.length > 0) {
var l = As(e.room, FIND_MY_CREEPS, {
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
var u = Ya(e.room, FIND_HOSTILE_SPAWNS, {
filter: function(e) {
return !pl(e, PWR_DISRUPT_SPAWN);
}
})[0];
if (u) return {
type: "usePower",
power: PWR_DISRUPT_SPAWN,
target: u
};
}
if (o.includes(PWR_DISRUPT_TOWER) && e.ops >= 10) {
var m = Ya(e.room, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !pl(e, PWR_DISRUPT_TOWER);
}
})[0];
if (m) return {
type: "usePower",
power: PWR_DISRUPT_TOWER,
target: m
};
}
if (o.includes(PWR_OPERATE_TOWER) && e.ops >= 10 && n.length > 0) {
var p = As(e.room, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !pl(e, PWR_OPERATE_TOWER);
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
var f = c(c([], s(e.spawns), !1), [ e.storage, e.terminal ], !1).filter(function(e) {
return void 0 !== e;
});
try {
for (var d = i(f), y = d.next(); !y.done; y = d.next()) {
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
y && !y.done && (r = d.return) && r.call(d);
} finally {
if (t) throw t.error;
}
}
var v = As(e.room, FIND_STRUCTURES, {
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
var R = a.find(function(e) {
return e.structureType === STRUCTURE_TERMINAL && !pl(e, PWR_DISRUPT_TERMINAL);
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
return null !== t.spawning && !pl(t, PWR_OPERATE_SPAWN);
});
if (r) return {
type: "usePower",
power: PWR_OPERATE_SPAWN,
target: r
};
}
if (t.includes(PWR_OPERATE_EXTENSION) && e.ops >= 2 && e.extensions.reduce(function(e, t) {
return e + t.store.getFreeCapacity(RESOURCE_ENERGY);
}, 0) > 1e3 && e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1e4 && !pl(e.storage, PWR_OPERATE_EXTENSION)) return {
type: "usePower",
power: PWR_OPERATE_EXTENSION,
target: e.storage
};
if (t.includes(PWR_OPERATE_TOWER) && e.ops >= 10 && As(e.room, FIND_HOSTILE_CREEPS).length > 0) {
var o = As(e.room, FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_TOWER && !pl(e, PWR_OPERATE_TOWER);
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
return 0 === e.cooldown && e.mineralType && !pl(e, PWR_OPERATE_LAB);
});
if (n) return {
type: "usePower",
power: PWR_OPERATE_LAB,
target: n
};
}
if (t.includes(PWR_OPERATE_FACTORY) && e.ops >= 100 && e.factory && 0 === e.factory.cooldown && !pl(e.factory, PWR_OPERATE_FACTORY)) return {
type: "usePower",
power: PWR_OPERATE_FACTORY,
target: e.factory
};
if (t.includes(PWR_OPERATE_STORAGE) && e.ops >= 100 && e.storage && e.storage.store.getUsedCapacity() > .85 * e.storage.store.getCapacity() && !pl(e.storage, PWR_OPERATE_STORAGE)) return {
type: "usePower",
power: PWR_OPERATE_STORAGE,
target: e.storage
};
if (t.includes(PWR_REGEN_SOURCE) && e.ops >= 100) {
var a = As(e.room, FIND_SOURCES, {
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

function Cl(e, t, r) {
var o = 0;
if ("guard" !== r && "ranger" !== r && "healer" !== r || (o += function(e, t, r) {
var o = Fc(e), n = Bc(e);
if (0 === o.guards && 0 === o.rangers && 0 === o.healers) return 0;
var a = 0;
return ("guard" === r && n.guards < o.guards || "ranger" === r && n.rangers < o.rangers || "healer" === r && n.healers < o.healers) && (a = 100 * o.urgency), 
a;
}(e, 0, r)), "upgrader" === r && t.clusterId) {
var n = Rn.getCluster(t.clusterId);
(null == n ? void 0 : n.focusRoom) === e.name && (o += 40);
}
return o;
}

function Sl(e, t) {
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

var wl = [ {
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

function bl(e, t, r, o) {
var n, a, s, c, l, u, m = (s = t, l = (c = function(e) {
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
}(m), f = 10 * r, d = wl[0];
try {
for (var y = i(wl), g = y.next(); !g.done; g = y.next()) {
var h = g.value;
if (!(h.cost <= o)) break;
d = h;
}
} catch (e) {
n = {
error: e
};
} finally {
try {
g && !g.done && (a = y.return) && a.call(y);
} finally {
if (n) throw n.error;
}
}
var v = f * p, R = Math.max(1, Math.ceil(v / d.capacity * 1.2)), E = Math.min(2 * r, R + 1);
return jr.debug("Remote hauler calculation: ".concat(e, " -> ").concat(t, " (").concat(r, " sources, ").concat(m, " rooms away) - RT: ").concat(p, " ticks, E/tick: ").concat(f, ", Min: ").concat(R, ", Rec: ").concat(E, ", Cap: ").concat(d.capacity), {
subsystem: "HaulerDimensioning"
}), {
minHaulers: R,
recommendedHaulers: E,
haulerConfig: d,
distance: m,
roundTripTicks: p,
energyPerTick: f
};
}

var Ol = new Map, _l = -1, xl = null;

function Ul(e, t) {
var r, o;
void 0 === t && (t = !1), _l === Game.time && xl === Game.creeps || (Ol.clear(), 
_l = Game.time, xl = Game.creeps);
var n = t ? "".concat(e, "_active") : e, a = Ol.get(n);
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
return Ol.set(n, i), i;
}

function Al(e, t, r) {
var o, n, a = 0;
try {
for (var s = i(Object.values(Game.creeps)), c = s.next(); !c.done; c = s.next()) {
var l = c.value.memory;
l.homeRoom === e && l.role === t && l.targetRoom === r && a++;
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
return a;
}

function Nl(e, t, r) {
var o, n, a, s, c, l = null !== (a = r.remoteAssignments) && void 0 !== a ? a : [];
if (0 === l.length) return null;
try {
for (var u = i(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = Al(e, t, p), d = Game.rooms[p];
if (f < ("remoteHarvester" === t ? d ? Ns(d).length : 2 : "remoteHauler" === t && d ? bl(e, p, Ns(d).length, null !== (c = null === (s = Game.rooms[e]) || void 0 === s ? void 0 : s.energyCapacityAvailable) && void 0 !== c ? c : 800).recommendedHaulers : 2)) return p;
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

function Ml(e, t, r, o) {
var n, a, s;
if ("remoteHarvester" === e || "remoteHauler" === e) {
var c = Nl(o, e, r);
return !!c && (t.targetRoom = c, !0);
}
if ("remoteWorker" === e) {
var l = null !== (s = r.remoteAssignments) && void 0 !== s ? s : [];
if (l.length > 0) {
var u = 1 / 0, m = [];
try {
for (var p = i(l), f = p.next(); !f.done; f = p.next()) {
var d = f.value, y = Al(o, e, d);
y < u ? (u = y, m = [ d ]) : y === u && m.push(d);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
f && !f.done && (a = p.return) && a.call(p);
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

function kl(e, r, o, n) {
var a, s, c, l, u;
void 0 === n && (n = !1);
var m = mc[r];
if (!m) return !1;
if ("larvaWorker" === r && !n) return !1;
if ("remoteHarvester" === r || "remoteHauler" === r) return null !== Nl(e, r, o);
if ("remoteWorker" === r) {
if (0 === (f = null !== (c = o.remoteAssignments) && void 0 !== c ? c : []).length) return !1;
var p = function(e, t) {
_l === Game.time && xl === Game.creeps || (Ol.clear(), _l = Game.time, xl = Game.creeps);
var r = "".concat(e, ":").concat(t), o = Ol.get(r);
if ("number" == typeof o) return o;
var n = 0;
for (var a in Game.creeps) {
var i = Game.creeps[a].memory;
i.homeRoom === e && i.role === t && n++;
}
return Ol.set(r, n), n;
}(e, "remoteWorker");
return p < m.maxPerRoom;
}
if ("remoteGuard" === r) {
var f;
if (0 === (f = null !== (l = o.remoteAssignments) && void 0 !== l ? l : []).length) return !1;
try {
for (var d = i(f), y = d.next(); !y.done; y = d.next()) {
var g = y.value, h = Game.rooms[g];
if (h) {
var v = As(h, FIND_HOSTILE_CREEPS).filter(function(e) {
return e.body.some(function(e) {
return e.type === ATTACK || e.type === RANGED_ATTACK || e.type === WORK;
});
});
if (v.length > 0 && Al(e, r, g) < Math.min(m.maxPerRoom, Math.ceil(v.length / 2))) return !0;
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
y && !y.done && (s = d.return) && s.call(d);
} finally {
if (a) throw a.error;
}
}
return !1;
}
var R = null !== (u = Ul(e).get(r)) && void 0 !== u ? u : 0, E = m.maxPerRoom;
if ("upgrader" === r && o.clusterId && (null == (U = Rn.getCluster(o.clusterId)) ? void 0 : U.focusRoom) === e) {
var T = Game.rooms[e];
(null == T ? void 0 : T.controller) && (E = T.controller.level <= 3 ? 2 : T.controller.level <= 6 ? 4 : 6);
}
if (R >= E) return !1;
var C = Game.rooms[e];
if (!C) return !1;
if ("scout" === r) return !(o.danger >= 1) && "defensive" !== o.posture && "war" !== o.posture && "siege" !== o.posture && (0 === R || "expand" === o.posture && R < m.maxPerRoom);
if ("claimer" === r) {
var S = Rn.getEmpire(), w = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), b = w.length < Game.gcl.level, O = S.claimQueue.some(function(e) {
return !e.claimed;
}), _ = function(e, t) {
var r, o, n, a, s, c, l = null !== (n = t.remoteAssignments) && void 0 !== n ? n : [];
if (0 === l.length) return !1;
var u, m = (u = Object.values(Game.spawns)).length > 0 ? u[0].owner.username : "", p = function(e) {
var t = Game.rooms[e];
if (null == t ? void 0 : t.controller) {
var r = t.controller;
if (r.owner) return "continue";
var o = (null === (a = r.reservation) || void 0 === a ? void 0 : a.username) === m, n = null !== (c = null === (s = r.reservation) || void 0 === s ? void 0 : s.ticksToEnd) && void 0 !== c ? c : 0;
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
for (var f = i(l), d = f.next(); !d.done; d = f.next()) {
var y = p(d.value);
if ("object" == typeof y) return y.value;
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = f.return) && o.call(f);
} finally {
if (r) throw r.error;
}
}
return !1;
}(0, o);
return !(!b || !O) || !!_;
}
if ("mineralHarvester" === r) {
var x = C.find(FIND_MINERALS)[0];
if (!x) return !1;
if (!x.pos.lookFor(LOOK_STRUCTURES).find(function(e) {
return e.structureType === STRUCTURE_EXTRACTOR;
})) return !1;
if (0 === x.mineralAmount) return !1;
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
var U;
if (!(U = Rn.getCluster(o.clusterId)) || !U.resourceRequests || 0 === U.resourceRequests.length) return !1;
var A = U.resourceRequests.some(function(e) {
if (e.fromRoom !== C.name) return !1;
var t = e.assignedCreeps.filter(function(e) {
return Game.creeps[e];
}).length;
return e.amount - e.delivered > 500 && t < 2;
});
if (!A) return !1;
}
if ("crossShardCarrier" === r) {
var N = t.resourceTransferCoordinator.getActiveRequests();
if (0 === N.length) return !1;
if (A = N.some(function(e) {
var t, r;
if (e.sourceRoom !== C.name) return !1;
var o = e.assignedCreeps || [], n = e.amount - e.transferred, a = 0, s = 0;
try {
for (var c = i(o), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = Game.creeps[u];
m && (a += m.carryCapacity, s++);
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
return a < n && s < 3;
}), !A) return !1;
}
return !0;
}

function Pl(e) {
var t, r;
return (null !== (t = e.get("harvester")) && void 0 !== t ? t : 0) + (null !== (r = e.get("larvaWorker")) && void 0 !== r ? r : 0);
}

function Il(e) {
var t = Ns(e);
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

function Gl(e, t) {
var r, o, n, a, s = Ul(e, !0);
if (0 === Pl(s)) return !0;
if (0 === function(e) {
var t, r;
return (null !== (t = e.get("hauler")) && void 0 !== t ? t : 0) + (null !== (r = e.get("larvaWorker")) && void 0 !== r ? r : 0);
}(s) && (null !== (n = s.get("harvester")) && void 0 !== n ? n : 0) > 0) return !0;
var c = Ul(e, !1), l = Il(t);
try {
for (var u = i(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
if ((!p.condition || p.condition(t)) && (null !== (a = c.get(p.role)) && void 0 !== a ? a : 0) < p.minCount) return !0;
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

function Ll(e, t) {
var r, o, n = null;
try {
for (var a = i(e.bodies), s = a.next(); !s.done; s = a.next()) {
var c = s.value;
c.cost <= t && (!n || c.cost > n.cost) && (n = c);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
return n;
}

function Dl(e) {
return "".concat(e, "_").concat(Game.time, "_").concat(Math.floor(1e3 * Math.random()));
}

function Fl(e, t) {
var r, o, n, a, c, l, u = Ms(e, STRUCTURE_SPAWN).find(function(e) {
return !e.spawning;
});
if (u) {
var m = e.energyCapacityAvailable, p = e.energyAvailable, f = 0 === Pl(Ul(e.name, !0)), d = f ? p : m;
if (f && p < 150 && (jr.warn("WORKFORCE COLLAPSE: ".concat(p, " energy available, need 150 to spawn minimal larvaWorker. ") + "Room will recover once energy reaches 150.", {
subsystem: "spawn",
room: e.name
}), On.emit("spawn.emergency", {
roomName: e.name,
energyAvailable: p,
message: "Critical workforce collapse - waiting for energy to spawn minimal creep",
source: "SpawnManager"
})), Gl(e.name, e) && Game.time % 10 == 0) {
var y = Ul(e.name, !0), g = Ul(e.name, !1), h = null !== (n = y.get("larvaWorker")) && void 0 !== n ? n : 0, v = null !== (a = y.get("harvester")) && void 0 !== a ? a : 0;
jr.info("BOOTSTRAP MODE: ".concat(Pl(y), " active energy producers ") + "(".concat(h, " larva, ").concat(v, " harvest), ").concat(Pl(g), " total. ") + "Energy: ".concat(p, "/").concat(m), {
subsystem: "spawn",
room: e.name
});
}
if (Gl(e.name, e)) {
var R = function(e, t, r) {
var o, n, a;
if (0 === Pl(Ul(e, !0))) return jr.info("Bootstrap: Spawning larvaWorker (emergency - no active energy producers)", {
subsystem: "spawn",
room: e
}), "larvaWorker";
var s = Ul(e, !1), c = Il(t);
jr.info("Bootstrap: Checking ".concat(c.length, " roles in order"), {
subsystem: "spawn",
room: e,
meta: {
totalCreeps: s.size,
creepCounts: Array.from(s.entries())
}
});
try {
for (var l = i(c), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!m.condition || m.condition(t)) {
var p = null !== (a = s.get(m.role)) && void 0 !== a ? a : 0;
if (p < m.minCount) {
var f = kl(e, m.role, r, !0);
if (jr.info("Bootstrap: Role ".concat(m.role, " needs spawning (current: ").concat(p, ", min: ").concat(m.minCount, ", needsRole: ").concat(f, ")"), {
subsystem: "spawn",
room: e
}), f) return m.role;
jr.warn("Bootstrap: Role ".concat(m.role, " blocked by needsRole check (current: ").concat(p, "/").concat(m.minCount, ")"), {
subsystem: "spawn",
room: e
});
}
} else jr.info("Bootstrap: Skipping ".concat(m.role, " (condition not met)"), {
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
return jr.info("Bootstrap: No role needs spawning", {
subsystem: "spawn",
room: e
}), null;
}(e.name, e, t);
if (!R) return;
if (!(_ = mc[R])) return;
var E = Ll(_, d);
if (E && p >= E.cost) ; else if (!(E = Ll(_, p))) return void jr.info("Bootstrap: No affordable body for ".concat(R, " (available: ").concat(p, ", min needed: ").concat(null !== (l = null === (c = _.bodies[0]) || void 0 === c ? void 0 : c.cost) && void 0 !== l ? l : "unknown", ")"), {
subsystem: "spawn",
room: e.name
});
var T = Dl(R);
if (!Ml(R, x = {
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
return void jr.error("EXCEPTION during spawn attempt for ".concat(R, ": ").concat(t), {
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
if (C === OK) jr.info("BOOTSTRAP SPAWN: ".concat(R, " (").concat(T, ") with ").concat(E.parts.length, " parts, cost ").concat(E.cost, ". Recovery in progress."), {
subsystem: "spawn",
room: e.name
}), On.emit("spawn.completed", {
roomName: e.name,
creepName: T,
role: R,
cost: E.cost,
source: "SpawnManager"
}); else {
var S = C === ERR_NOT_ENOUGH_ENERGY ? "ERR_NOT_ENOUGH_ENERGY" : C === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" : C === ERR_BUSY ? "ERR_BUSY" : C === ERR_NOT_OWNER ? "ERR_NOT_OWNER" : C === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" : C === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" : "UNKNOWN(".concat(C, ")");
jr.warn("BOOTSTRAP SPAWN FAILED: ".concat(R, " (").concat(T, ") - ").concat(S, ". Body: ").concat(E.parts.length, " parts, cost: ").concat(E.cost, ", available: ").concat(p), {
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
var r, o, n, a, c = Ul(e.name), l = function(e) {
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
for (var m = i(Object.entries(mc)), p = m.next(); !p.done; p = m.next()) {
var f = s(p.value, 2), d = f[0], y = f[1];
if (kl(e.name, d, t)) {
var g = y.priority, h = null !== (n = l[d]) && void 0 !== n ? n : .5, v = Sl(d, t.pheromones), R = Cl(e, t, d), E = null !== (a = c.get(d)) && void 0 !== a ? a : 0, T = (g + R) * h * v * (y.maxPerRoom > 0 ? Math.max(.1, 1 - E / y.maxPerRoom) : .1);
u.push({
role: d,
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
for (var b = i(w), O = b.next(); !O.done; O = b.next()) {
var _;
if (R = O.value, _ = mc[R]) {
var x, U = Ll(_, d);
if (U && !(p < U.cost) && (T = Dl(R), Ml(R, x = {
role: _.role,
family: _.family,
homeRoom: e.name,
version: 1
}, t, e.name))) {
if ("interRoomCarrier" === R && t.clusterId) {
var A = Rn.getCluster(t.clusterId);
if (A) {
var N = A.resourceRequests.find(function(t) {
if (t.fromRoom !== e.name) return !1;
var r = t.assignedCreeps.filter(function(e) {
return Game.creeps[e];
}).length;
return t.amount - t.delivered > 500 && r < 2;
});
N && (x.transferRequest = {
fromRoom: N.fromRoom,
toRoom: N.toRoom,
resourceType: N.resourceType,
amount: N.amount
}, N.assignedCreeps.push(T));
}
}
if ((C = u.spawnCreep(U.parts, T, {
memory: x
})) === OK) return void On.emit("spawn.completed", {
roomName: e.name,
creepName: T,
role: R,
cost: U.cost,
source: "SpawnManager"
});
if (C !== ERR_NOT_ENOUGH_ENERGY) return S = C === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" : C === ERR_BUSY ? "ERR_BUSY" : C === ERR_NOT_OWNER ? "ERR_NOT_OWNER" : C === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" : C === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" : "UNKNOWN(".concat(C, ")"), 
void jr.warn("Spawn failed for ".concat(R, ": ").concat(S, ". Body: ").concat(U.parts.length, " parts, cost: ").concat(U.cost), {
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
O && !O.done && (o = b.return) && o.call(b);
} finally {
if (r) throw r.error;
}
}
w.length > 0 && Game.time % 20 == 0 ? jr.info("Waiting for energy: ".concat(w.length, " roles need spawning, waiting for optimal bodies. ") + "Energy: ".concat(p, "/").concat(m), {
subsystem: "spawn",
room: e.name,
meta: {
topRoles: w.slice(0, 3).join(", "),
energyAvailable: p,
energyCapacity: m
}
}) : 0 === w.length && Game.time % 100 == 0 && jr.info("No spawns needed: All roles fully staffed. Energy: ".concat(p, "/").concat(m), {
subsystem: "spawn",
room: e.name,
meta: {
energyAvailable: p,
energyCapacity: m,
activeCreeps: Ul(e.name, !0).size
}
});
}
}
}

var Bl, Hl, Wl, Yl = new Map, Kl = {
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
}, jl = function() {
function e(e) {
void 0 === e && (e = {}), this.config = n(n({}, Kl), e);
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
if (Game.time - r.createdAt > t.config.requestTimeout) return bo.debug("Resource request from ".concat(r.fromRoom, " to ").concat(r.toRoom, " expired"), {
subsystem: "ResourceSharing"
}), !1;
if (r.delivered >= r.amount) return bo.info("Resource transfer completed: ".concat(r.delivered, " ").concat(r.resourceType, " from ").concat(r.fromRoom, " to ").concat(r.toRoom), {
subsystem: "ResourceSharing"
}), !1;
if (!e.memberRooms.includes(r.toRoom) || !e.memberRooms.includes(r.fromRoom)) return !1;
if (Game.rooms[r.toRoom]) {
var o = Rn.getSwarmState(r.toRoom);
if (o && 0 === o.metrics.energyNeed) return bo.debug("Resource request from ".concat(r.fromRoom, " to ").concat(r.toRoom, " no longer needed"), {
subsystem: "ResourceSharing"
}), !1;
}
return !0;
});
}, e.prototype.getRoomStatuses = function(e) {
var t, r, o, n = [];
try {
for (var a = i(e.memberRooms), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = Game.rooms[c];
if (l && (null === (o = l.controller) || void 0 === o ? void 0 : o.my)) {
var u = Rn.getSwarmState(c);
if (u) {
var m = e.focusRoom === c, p = this.calculateRoomEnergy(l), f = p.energyAvailable, d = p.energyCapacity, y = this.calculateEnergyNeed(l, f, u, m), g = 0;
m ? g = 0 : f > this.config.surplusEnergyThreshold && (g = f - this.config.mediumEnergyThreshold);
var h = 0;
3 === y ? h = this.config.criticalEnergyThreshold - f : 2 === y ? h = this.config.mediumEnergyThreshold - f : 1 === y && (h = this.config.lowEnergyThreshold - f), 
h = m && y > 0 ? Math.max(h, 2 * this.config.minTransferAmount) : Math.max(h, this.config.minTransferAmount), 
n.push({
roomName: c,
hasTerminal: void 0 !== l.terminal && l.terminal.my,
energyAvailable: f,
energyCapacity: d,
energyNeed: y,
canProvide: g,
needsAmount: h
}), u.metrics.energyAvailable = f, u.metrics.energyCapacity = d, u.metrics.energyNeed = y;
}
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
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
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
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
}), a = t.filter(function(e) {
return e.canProvide > 0;
}).sort(function(e, t) {
return t.canProvide - e.canProvide;
});
if (0 !== n.length && 0 !== a.length) {
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
for (var u = (r = void 0, i(a)), m = u.next(); !m.done; m = u.next()) l(m.value);
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
var p = Math.min(t.needsAmount, n.canProvide), f = {
toRoom: t.roomName,
fromRoom: n.roomName,
resourceType: RESOURCE_ENERGY,
amount: p,
priority: t.energyNeed,
createdAt: Game.time,
assignedCreeps: [],
delivered: 0
};
e.resourceRequests.push(f), bo.info("Created resource transfer: ".concat(p, " energy from ").concat(n.roomName, " to ").concat(t.roomName, " (priority ").concat(f.priority, ", distance ").concat(s, ")"), {
subsystem: "ResourceSharing"
}), n.canProvide -= p;
}
}, c = this;
try {
for (var l = i(n), u = l.next(); !u.done; u = l.next()) s(u.value);
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
o.delivered += r, bo.debug("Updated transfer progress: ".concat(o.delivered, "/").concat(o.amount, " from ").concat(o.fromRoom, " to ").concat(o.toRoom), {
subsystem: "ResourceSharing"
});
}
}, e;
}(), Vl = new jl, ql = {
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

function zl(e, t) {
var r, o, n = e.coreRoom, a = 1 / 0;
try {
for (var s = i(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.map.getRoomLinearDistance(l, t);
u < a && (a = u, n = l);
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

function Xl(e, t) {
var r = function(e) {
var t, r = Math.min(3, Math.max(1, e.urgency)), o = null !== (t = ql[r]) && void 0 !== t ? t : ql[2];
return {
guards: Math.max(o.guards, e.guardsNeeded),
rangers: Math.max(o.rangers, e.rangersNeeded),
healers: Math.max(o.healers, e.healersNeeded),
siegeUnits: o.siegeUnits
};
}(t), o = "defense_".concat(t.roomName, "_").concat(Game.time), n = zl(e, t.roomName), a = {
id: o,
type: "defense",
members: [],
rallyRoom: n,
targetRooms: [ t.roomName ],
state: "gathering",
createdAt: Game.time
};
return bo.info("Created defense squad ".concat(o, " for ").concat(t.roomName, ": ") + "".concat(r.guards, "G/").concat(r.rangers, "R/").concat(r.healers, "H rally at ").concat(n), {
subsystem: "Squad"
}), a;
}

function Ql(e) {
var t = Game.time - e.createdAt;
if ("gathering" === e.state && t > 300) return bo.warn("Squad ".concat(e.id, " timed out during formation (").concat(t, " ticks)"), {
subsystem: "Squad"
}), !0;
if (0 === e.members.length && t > 50) return bo.info("Squad ".concat(e.id, " has no members, dissolving"), {
subsystem: "Squad"
}), !0;
if ("attacking" === e.state) {
var r = e.targetRooms[0];
if (r) {
var o = Game.rooms[r];
if (o && 0 === o.find(FIND_HOSTILE_CREEPS).length && t > 100) return bo.info("Squad ".concat(e.id, " mission complete, no more hostiles"), {
subsystem: "Squad"
}), !0;
}
}
return !1;
}

function Zl(e) {
var t = e.members.length;
e.members = e.members.filter(function(e) {
return Game.creeps[e];
}), e.members.length < t && bo.debug("Squad ".concat(e.id, " lost ").concat(t - e.members.length, " members"), {
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
}) && (e.state = "moving", bo.info("Squad ".concat(e.id, " gathered, moving to ").concat(o), {
subsystem: "Squad"
}));
break;

case "moving":
r.some(function(e) {
return e.room.name === o;
}) && (e.state = "attacking", bo.info("Squad ".concat(e.id, " reached ").concat(o, ", engaging"), {
subsystem: "Squad"
}));
break;

case "attacking":
Game.time - e.createdAt > 50 && r.length < 3 && (e.state = "retreating", bo.warn("Squad ".concat(e.id, " retreating - heavy casualties"), {
subsystem: "Squad"
}));
break;

case "retreating":
r.every(function(t) {
return t.room.name === e.rallyRoom;
}) && (e.state = "dissolving", bo.info("Squad ".concat(e.id, " retreated to ").concat(e.rallyRoom, ", dissolving"), {
subsystem: "Squad"
}));
}
}
}

(Bl = {})[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 300, Bl[RESOURCE_CATALYZED_UTRIUM_ACID] = 300, 
Bl[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 300, (Hl = {})[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 600, 
Hl[RESOURCE_CATALYZED_UTRIUM_ACID] = 600, Hl[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 300, 
Hl[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 600, (Wl = {})[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 900, 
Wl[RESOURCE_CATALYZED_UTRIUM_ACID] = 600, Wl[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = 900, 
Wl[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 600, Wl[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 900;

var $l = {
0: 0,
1: 5e3,
2: 15e3,
3: 5e4
};

function Jl(e, t) {
var r = $l[t], o = Rn.getClusters();
for (var n in o) o[n].defenseRequests.some(function(t) {
return t.roomName === e && t.urgency >= 2;
}) && (r += 1e4);
return r;
}

function eu(e, t, r) {
var o, n, a, s = 0;
try {
for (var c = i(e.memberRooms), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u !== t) {
var m = Game.rooms[u];
if (m && m.storage) {
var p = Rn.getSwarmState(u);
if (p) {
var f = m.storage.store.getUsedCapacity(RESOURCE_ENERGY) - Jl(u, p.danger);
f > r && f > s && (s = f, a = u);
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
if (!a) return bo.warn("No available energy source for emergency routing to ".concat(t, " (need ").concat(r, ")"), {
subsystem: "MilitaryPool"
}), {
success: !1
};
var d = Game.rooms[a], y = Game.rooms[t];
return (null == d ? void 0 : d.terminal) && (null == y ? void 0 : y.terminal) ? d.terminal.send(RESOURCE_ENERGY, r, t) === OK ? (bo.info("Emergency energy routed: ".concat(r, " from ").concat(a, " to ").concat(t), {
subsystem: "MilitaryPool"
}), {
success: !0,
sourceRoom: a
}) : {
success: !1
} : (bo.info("Creating hauler transfer request: ".concat(r, " energy from ").concat(a, " to ").concat(t), {
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

var tu = {
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

function ru(e, t) {
var r, o, n, a;
if (!t) return bo.debug("No intel for ".concat(e, ", defaulting to harassment"), {
subsystem: "Doctrine"
}), "harassment";
var i = null !== (r = t.towerCount) && void 0 !== r ? r : 0, s = null !== (o = t.spawnCount) && void 0 !== o ? o : 0, c = null !== (n = t.rcl) && void 0 !== n ? n : 0, l = 3 * i + 2 * s + 1.5 * (null !== (a = t.militaryPresence) && void 0 !== a ? a : 0) + .5 * c;
return l >= 20 || c >= 7 ? (bo.info("Selected SIEGE doctrine for ".concat(e, " (threat: ").concat(l, ")"), {
subsystem: "Doctrine"
}), "siege") : l >= 10 || c >= 5 ? (bo.info("Selected RAID doctrine for ".concat(e, " (threat: ").concat(l, ")"), {
subsystem: "Doctrine"
}), "raid") : (bo.info("Selected HARASSMENT doctrine for ".concat(e, " (threat: ").concat(l, ")"), {
subsystem: "Doctrine"
}), "harassment");
}

function ou(e, t) {
var r, o, n, a = tu[t], s = 0;
try {
for (var c = i(e.memberRooms), l = c.next(); !l.done; l = c.next()) {
var u = l.value, m = Game.rooms[u];
if (m && (null === (n = m.controller) || void 0 === n ? void 0 : n.my)) {
var p = m.storage, f = m.terminal;
p && (s += p.store.energy), f && (s += f.store.energy);
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
var d = s >= a.minEnergy;
return d || bo.debug("Cannot launch ".concat(t, ": insufficient energy (").concat(s, "/").concat(a.minEnergy, ")"), {
subsystem: "Doctrine"
}), d;
}

var nu, au = {
rclWeight: 10,
resourceWeight: 5,
strategicWeight: 3,
distancePenalty: 2,
weakDefenseBonus: 20,
strongDefensePenalty: 15,
warTargetBonus: 50
};

function iu(e, t, r, o) {
var n, a, i = 0;
i += e.controllerLevel * o.rclWeight, e.controllerLevel >= 6 ? i += 5 * o.resourceWeight : e.controllerLevel >= 4 && (i += 2 * o.resourceWeight), 
i += e.sources * o.strategicWeight, i -= t * o.distancePenalty;
var s = null !== (n = e.towerCount) && void 0 !== n ? n : 0, c = null !== (a = e.spawnCount) && void 0 !== a ? a : 0;
return 0 === s && c <= 1 ? i += o.weakDefenseBonus : (s >= 4 || s >= 2 && c >= 2) && (i -= o.strongDefensePenalty), 
r && (i += o.warTargetBonus), e.threatLevel >= 2 && !r && (i -= 10 * e.threatLevel), 
Math.max(0, i);
}

function su(e, t) {
var r, o, n = 1 / 0;
try {
for (var a = i(e.memberRooms), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(c, t);
l < n && (n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
return n;
}

!function(e) {
e[e.EMERGENCY = 1e3] = "EMERGENCY", e[e.HIGH = 500] = "HIGH", e[e.NORMAL = 100] = "NORMAL", 
e[e.LOW = 50] = "LOW";
}(nu || (nu = {}));

var cu = function() {
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
}), jr.debug("Added spawn request: ".concat(e.role, " (priority: ").concat(e.priority, ") for room ").concat(e.roomName), {
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
for (var c = i(e.inProgress), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value, 2), m = u[0], p = u[1].spawnId, f = Game.getObjectById(p);
f && f.spawning || a.push(m);
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
try {
for (var d = i(a), y = d.next(); !y.done; y = d.next()) m = y.value, e.inProgress.delete(m);
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
}, e.prototype.getPendingRequests = function(e) {
return c([], s(this.getQueue(e).requests), !1);
}, e.prototype.getQueueSize = function(e) {
return this.getQueue(e).requests.length;
}, e.prototype.clearQueue = function(e) {
this.getQueue(e).requests = [], jr.debug("Cleared spawn queue for room ".concat(e), {
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
for (var s = i(n), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = this.getNextRequest(e, o.energyAvailable);
if (!u) break;
var m = this.executeSpawn(l, u);
m === OK ? (a++, this.markInProgress(e, u.id, l.id), this.removeRequest(e, u.id)) : m !== ERR_NOT_ENOUGH_ENERGY && (this.removeRequest(e, u.id), 
jr.warn("Spawn request failed: ".concat(u.role, " in ").concat(e, " (error: ").concat(m, ")"), {
subsystem: "SpawnQueue"
}));
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
}, e.prototype.executeSpawn = function(e, t) {
var r = this.generateCreepName(t.role), o = n({
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
return e.priority >= nu.EMERGENCY;
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
return e.priority >= nu.EMERGENCY;
}).length,
high: t.requests.filter(function(e) {
return e.priority >= nu.HIGH && e.priority < nu.EMERGENCY;
}).length,
normal: t.requests.filter(function(e) {
return e.priority >= nu.NORMAL && e.priority < nu.HIGH;
}).length,
low: t.requests.filter(function(e) {
return e.priority < nu.NORMAL;
}).length,
inProgress: t.inProgress.size
};
}, e;
}(), lu = new cu, uu = {
move: 50,
work: 100,
carry: 50,
attack: 80,
ranged_attack: 150,
heal: 250,
claim: 600,
tough: 10
}, mu = new Map;

function pu(e, t, r) {
for (var o = c([], s(e), !1), n = e.reduce(function(e, t) {
return e + uu[t];
}, 0), a = r.reduce(function(e, t) {
return e + uu[t];
}, 0); n + a <= t && o.length < 50; ) o.push.apply(o, c([], s(r), !1)), n += a;
return o.slice(0, 50);
}

var fu = new Map;

function du(e) {
e.lastUpdate = Game.time;
var t = Rn.getCluster(e.clusterId);
if (!t) return e.state = "failed", void bo.error("Cluster ".concat(e.clusterId, " not found for operation ").concat(e.id), {
subsystem: "Offensive"
});
switch (e.state) {
case "forming":
!function(e) {
e.squadIds.every(function(e) {
return !function(e) {
return mu.has(e);
}(e);
}) && (e.state = "executing", bo.info("Operation ".concat(e.id, " entering execution phase"), {
subsystem: "Offensive"
})), Game.time - e.createdAt > 1e3 && (e.state = "failed", bo.warn("Operation ".concat(e.id, " formation timed out"), {
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
if (Zl(o), Ql(o)) {
bo.info("Squad ".concat(r, " dissolving, operation ").concat(e.id, " may complete"), {
subsystem: "Offensive"
});
var n = t.squads.findIndex(function(e) {
return e.id === r;
});
n >= 0 && t.squads.splice(n, 1);
}
};
try {
for (var a = i(e.squadIds), s = a.next(); !s.done; s = a.next()) n(s.value);
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
} finally {
if (r) throw r.error;
}
}
0 === e.squadIds.filter(function(e) {
return t.squads.some(function(t) {
return t.id === e;
});
}).length && (e.state = "complete", bo.info("Operation ".concat(e.id, " complete"), {
subsystem: "Offensive"
}));
}(e, t);
}
}

function yu(e, t, r) {
var o, n, a, i = 0, l = 0, u = e.getTerrain().get(t.x, t.y);
if (u === TERRAIN_MASK_WALL) return {
position: t,
score: 0,
terrain: 0,
safety: 0,
centrality: 0,
exitAccess: 0
};
if (i += o = 0 === u ? 10 : 5, e.lookForAt(LOOK_STRUCTURES, t).some(function(e) {
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
var p = Math.min.apply(Math, c([], s(m.map(function(e) {
return t.getRangeTo(e);
})), !1));
l = Math.min(10, p);
} else l = 10;
i += 2 * l;
var f = Math.sqrt(Math.pow(t.x - 25, 2) + Math.pow(t.y - 25, 2));
i += n = "defense" === r || "retreat" === r ? Math.max(0, 10 - f / 2) : Math.max(0, 5 - Math.abs(f - 15) / 2);
var d = Math.min(t.x, t.y, 49 - t.x, 49 - t.y);
return a = "offense" === r || "staging" === r ? Math.max(0, 10 - d / 2) : Math.min(10, d / 2.5), 
{
position: t,
score: i += a,
terrain: o,
safety: l,
centrality: n,
exitAccess: a
};
}

var gu, hu = {
updateInterval: 10,
minBucket: 0,
resourceBalanceThreshold: 1e4,
minTerminalEnergy: 5e4
}, vu = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = new Map, this.config = n(n({}, hu), e);
}
return t.prototype.run = function() {
var e = Rn.getClusters();
for (var t in e) {
var r = e[t];
if (this.shouldRunCluster(t)) try {
this.runCluster(r), this.lastRun.set(t, Game.time);
} catch (e) {
var o = e instanceof Error ? e.message : String(e);
bo.error("Cluster ".concat(t, " error: ").concat(o), {
subsystem: "Cluster"
});
}
}
}, t.prototype.shouldRunCluster = function(e) {
var t, r = null !== (t = this.lastRun.get(e)) && void 0 !== t ? t : 0;
return Game.time - r >= this.config.updateInterval;
}, t.prototype.runCluster = function(e) {
var t = this, r = Game.cpu.getUsed();
Ii.measureSubsystem("cluster:".concat(e.id, ":metrics"), function() {
t.updateClusterMetrics(e);
}), Ii.measureSubsystem("cluster:".concat(e.id, ":defense"), function() {
var r;
t.processDefenseRequests(e), (r = function(e) {
return Rn.getOrInitSwarmState(e).clusterId;
}(e.id)) && Dc.coordinateDefense(r);
}), Ii.measureSubsystem("cluster:".concat(e.id, ":terminals"), function() {
t.balanceTerminalResources(e);
}), Ii.measureSubsystem("cluster:".concat(e.id, ":resourceSharing"), function() {
Vl.processCluster(e);
}), Ii.measureSubsystem("cluster:".concat(e.id, ":squads"), function() {
t.updateSquads(e);
}), Ii.measureSubsystem("cluster:".concat(e.id, ":offensive"), function() {
t.updateOffensiveOperations(e);
}), Ii.measureSubsystem("cluster:".concat(e.id, ":rallyPoints"), function() {
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
var l = yu(e, new RoomPosition(s, c, e.name), "defense");
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
o && (e.rallyPoints.push(o), bo.debug("Created defense rally point for ".concat(t, " at ").concat(o.x, ",").concat(o.y), {
subsystem: "RallyPoint"
}));
}
};
try {
for (var n = i(e.memberRooms), a = n.next(); !a.done; a = n.next()) o(a.value);
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
}(e);
}), Ii.measureSubsystem("cluster:".concat(e.id, ":militaryResources"), function() {
!function(e) {
var t, r;
try {
for (var o = i(e.memberRooms), n = o.next(); !n.done; n = o.next()) {
var a = n.value, s = Rn.getSwarmState(a);
if (s) {
var c = Jl(a, s.danger);
c > 0 && Game.time % 100 == 0 && bo.debug("Military energy reservation for ".concat(a, ": ").concat(c, " (danger ").concat(s.danger, ")"), {
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
}(e);
}), Ii.measureSubsystem("cluster:".concat(e.id, ":role"), function() {
t.updateClusterRole(e);
}), Ii.measureSubsystem("cluster:".concat(e.id, ":focusRoom"), function() {
t.updateFocusRoom(e);
}), e.lastUpdate = Game.time;
var o = Game.cpu.getUsed() - r;
o > 1 && Game.time % 50 == 0 && bo.debug("Cluster ".concat(e.id, " tick: ").concat(o.toFixed(2), " CPU"), {
subsystem: "Cluster"
});
}, t.prototype.updateClusterMetrics = function(e) {
var t, r, o = 0, n = 0, a = 0, s = 0, c = 0;
try {
for (var l = i(e.memberRooms), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = Rn.getSwarmState(m);
if (p) {
o += p.metrics.energyHarvested, n += p.metrics.energySpawning + p.metrics.energyConstruction + p.metrics.energyRepair, 
a += 25 * p.danger;
var f = Game.rooms[m];
(null == f ? void 0 : f.storage) ? s += f.storage.store.getUsedCapacity(RESOURCE_ENERGY) / f.storage.store.getCapacity() * 100 : s += p.metrics.energyHarvested > 0 ? 50 : 0, 
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
e.metrics.warIndex = Math.min(100, a / c), e.metrics.economyIndex = Math.min(100, s / c)), 
e.metrics.militaryReadiness = this.calculateMilitaryReadiness(e);
}, t.prototype.calculateMilitaryReadiness = function(e) {
var t, r, o, n = 0, a = 0;
try {
for (var s = i(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
if (u && (null === (o = u.controller) || void 0 === o ? void 0 : o.my)) {
n += u.find(FIND_MY_CREEPS, {
filter: function(e) {
return "military" === e.memory.family;
}
}).length;
var m = u.controller.level;
a += Math.max(2, Math.floor(m / 2));
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
return 0 === a ? 0 : Math.min(100, Math.round(n / a * 100));
}, t.prototype.balanceTerminalResources = function(e) {
var t, r, o, n, a = [];
try {
for (var s = i(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
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
c && !c.done && (r = s.return) && r.call(s);
} finally {
if (t) throw t.error;
}
}
if (!(a.length < 2) && (this.balanceResource(a, RESOURCE_ENERGY), Game.time % 50 == 0)) {
var m = [ RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST ];
try {
for (var p = i(m), f = p.next(); !f.done; f = p.next()) {
var d = f.value;
this.balanceResource(a, d);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
f && !f.done && (n = p.return) && n.call(p);
} finally {
if (o) throw o.error;
}
}
}
}, t.prototype.balanceResource = function(e, t) {
var r, o, n, a, s, c, l = this, u = 0;
try {
for (var m = i(e), p = m.next(); !p.done; p = m.next()) u += p.value.terminal.store.getUsedCapacity(t);
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
var f = u / e.length, d = e.filter(function(e) {
return e.terminal.store.getUsedCapacity(t) > f + l.config.resourceBalanceThreshold;
}), y = e.filter(function(e) {
return e.terminal.store.getUsedCapacity(t) < f - l.config.resourceBalanceThreshold;
});
if (0 !== d.length && 0 !== y.length) try {
for (var g = i(d), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
if (!(v.terminal.cooldown > 0 || t === RESOURCE_ENERGY && v.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.minTerminalEnergy + this.config.resourceBalanceThreshold)) try {
for (var R = (s = void 0, i(y)), E = R.next(); !E.done; E = R.next()) {
var T = E.value, C = Math.min(v.terminal.store.getUsedCapacity(t) - f, f - T.terminal.store.getUsedCapacity(t), 1e4);
if (C > 1e3 && v.terminal.send(t, C, T.room.name) === OK) {
bo.debug("Transferred ".concat(C, " ").concat(t, " from ").concat(v.room.name, " to ").concat(T.room.name), {
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
h && !h.done && (a = g.return) && a.call(g);
} finally {
if (n) throw n.error;
}
}
}, t.prototype.updateSquads = function(e) {
var t, r;
try {
for (var o = i(e.squads), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
Zl(a), Ql(a) && (a.state = "dissolving");
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
for (var n = i(o), a = n.next(); !a.done; a = n.next()) {
var s = a.value, c = Xl(e, s);
e.squads.push(c);
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
var t = Array.from(fu.values()).filter(function(t) {
return t.clusterId === e.id && "complete" !== t.state && "failed" !== t.state;
});
if (t.length >= 2) bo.debug("Cluster ".concat(e.id, " at max operations (").concat(t.length, ")"), {
subsystem: "Offensive"
}); else {
var r = function(e, t, r, o) {
var a, i;
void 0 === o && (o = {});
var s = n(n({}, au), o), c = [], l = Rn.getEmpire(), u = l.knownRooms, m = new Set(l.warTargets);
for (var p in u) {
var f = u[p];
if (f.scouted && "self" !== f.owner && !f.isHighway && !f.isSK) {
var d = su(e, p);
if (!(d > 10)) {
var y = null !== (i = null === (a = Memory.lastAttacked) || void 0 === a ? void 0 : a[p]) && void 0 !== i ? i : 0;
if (!(Game.time - y < 5e3)) {
var g = iu(f, d, m.has(p), s), h = "neutral";
f.owner && (h = m.has(f.owner) || m.has(p) ? "enemy" : "hostile");
var v = ru(p, {
towerCount: f.towerCount,
spawnCount: f.spawnCount,
rcl: f.controllerLevel,
owner: f.owner
});
c.push({
roomName: p,
score: g,
distance: d,
doctrine: v,
type: h,
intel: f
});
}
}
}
}
c.sort(function(e, t) {
return t.score - e.score;
});
var R = c.slice(0, 3);
return R.length > 0 && bo.info("Found ".concat(R.length, " attack targets for cluster ").concat(e.id, ": ") + R.map(function(e) {
return "".concat(e.roomName, "(").concat(e.score.toFixed(0), ")");
}).join(", "), {
subsystem: "AttackTarget"
}), R;
}(e);
if (0 !== r.length) {
var o = r[0];
ou(e, o.doctrine) ? function(e, t, r) {
if (!function(e) {
var t = Rn.getEmpire().knownRooms[e];
return t ? !(Game.time - t.lastSeen > 5e3 && (bo.warn("Intel for ".concat(e, " is stale (").concat(Game.time - t.lastSeen, " ticks old)"), {
subsystem: "AttackTarget"
}), 1)) : (bo.warn("No intel for target ".concat(e), {
subsystem: "AttackTarget"
}), !1);
}(t)) return bo.warn("Invalid target ".concat(t), {
subsystem: "Offensive"
}), null;
var o = Rn.getEmpire().knownRooms[t], n = null != r ? r : ru(t, {
towerCount: null == o ? void 0 : o.towerCount,
spawnCount: null == o ? void 0 : o.spawnCount,
rcl: null == o ? void 0 : o.controllerLevel,
owner: null == o ? void 0 : o.owner
});
if (!ou(e, n)) return bo.warn("Cannot launch ".concat(n, " operation on ").concat(t, " - insufficient resources"), {
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
fu.set(a, i);
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
}(0, o), a = "".concat(r, "_").concat(t, "_").concat(Game.time), i = zl(e, t), s = .3;
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
return bo.info("Created ".concat(r, " squad ").concat(a, " for ").concat(t, ": ") + "".concat(n.guards, "G/").concat(n.rangers, "R/").concat(n.healers, "H/").concat(n.siegeUnits, "S rally at ").concat(i), {
subsystem: "Squad"
}), c;
}(e, t, "harassment" === n ? "harass" : n, {
towerCount: null == o ? void 0 : o.towerCount,
spawnCount: null == o ? void 0 : o.spawnCount
});
e.squads.push(c), i.squadIds.push(c.id), function(e, t) {
var r = t.id;
if (mu.has(r)) bo.debug("Squad ".concat(r, " already forming"), {
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
o = tu[n].composition;
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
mu.set(r, i);
var s = Game.rooms[t.rallyRoom];
s ? (function(e, t, r, o) {
var n = !1;
if ("defense" !== t.type) {
var a = "harass" === t.type ? "harassment" : t.type;
n = tu[a].useBoosts;
}
var i = nu.NORMAL;
"siege" === t.type ? i = nu.HIGH : "defense" === t.type && (i = nu.EMERGENCY);
var s = function(r, a) {
for (var s = function(a) {
var s = function(e, t, r) {
var o = Math.min(r, 3e3);
switch (e) {
case "harasser":
return pu([ MOVE, ATTACK ], o, [ MOVE, ATTACK ]);

case "soldier":
return pu([ TOUGH, MOVE, ATTACK, MOVE, ATTACK ], o, [ TOUGH, MOVE, ATTACK ]);

case "ranger":
return pu([ TOUGH, MOVE, RANGED_ATTACK ], o, [ MOVE, RANGED_ATTACK ]);

case "healer":
return pu([ TOUGH, MOVE, HEAL ], o, [ MOVE, HEAL ]);

case "siegeUnit":
return pu([ TOUGH, MOVE, WORK ], o, [ TOUGH, MOVE, WORK ]);

default:
return [ MOVE, ATTACK ];
}
}(r, 0, e.energyCapacityAvailable), c = s.reduce(function(e, t) {
return e + uu[t];
}, 0), l = n ? function(e) {
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
}(r) : [], u = {
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
boostRequirements: l.length > 0 ? l.map(function(e) {
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
lu.addRequest(u), o.spawnRequests.add(u.id);
}, c = 0; c < a; c++) s(c);
};
r.harassers > 0 && s("harasser", r.harassers), r.soldiers > 0 && s("soldier", r.soldiers), 
r.rangers > 0 && s("ranger", r.rangers), r.healers > 0 && s("healer", r.healers), 
r.siegeUnits > 0 && s("siegeUnit", r.siegeUnits);
}(s, t, o, i), bo.info("Started forming squad ".concat(r, ": ").concat(JSON.stringify(a)), {
subsystem: "SquadFormation"
})) : bo.warn("Rally room ".concat(t.rallyRoom, " not visible for squad ").concat(r), {
subsystem: "SquadFormation"
});
}
}(0, c), i.state = "forming", s = t, Memory.lastAttacked || (Memory.lastAttacked = {}), 
Memory.lastAttacked[s] = Game.time, bo.info("Marked ".concat(s, " as attacked at tick ").concat(Game.time), {
subsystem: "AttackTarget"
}), bo.info("Launched ".concat(n, " operation ").concat(a, " on ").concat(t, " with squad ").concat(c.id), {
subsystem: "Offensive"
});
}(e, o.roomName, o.doctrine) : bo.info("Cluster ".concat(e.id, " cannot launch ").concat(o.doctrine, " doctrine (insufficient resources)"), {
subsystem: "Offensive"
});
} else bo.debug("No attack targets found for cluster ".concat(e.id), {
subsystem: "Offensive"
});
}
}
}(e), function() {
var e, t;
!function() {
var e, t, r = Game.time;
try {
for (var o = i(mu.entries()), n = o.next(); !n.done; n = o.next()) {
var a = s(n.value, 2), c = a[0], l = r - a[1].formationStarted;
l > 500 && (bo.warn("Squad ".concat(c, " formation timed out after ").concat(l, " ticks"), {
subsystem: "SquadFormation"
}), mu.delete(c));
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
for (var r = i(fu.entries()), o = r.next(); !o.done; o = r.next()) {
var n = s(o.value, 2);
n[0], du(n[1]);
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
for (var r = i(fu.entries()), o = r.next(); !o.done; o = r.next()) {
var n = s(o.value, 2), a = n[0], c = n[1], l = Game.time - c.createdAt;
("complete" === c.state || "failed" === c.state) && l > 5e3 && (fu.delete(a), bo.debug("Cleaned up operation ".concat(a), {
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
for (var s = i(e.memberRooms), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
u && (null === (o = u.controller) || void 0 === o ? void 0 : o.my) && a.push({
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
if (0 !== a.length) {
if (e.focusRoom) {
var m = Game.rooms[e.focusRoom];
8 === (null === (n = null == m ? void 0 : m.controller) || void 0 === n ? void 0 : n.level) && (bo.info("Focus room ".concat(e.focusRoom, " reached RCL 8, selecting next room"), {
subsystem: "Cluster"
}), e.focusRoom = void 0), m || (bo.warn("Focus room ".concat(e.focusRoom, " no longer valid, selecting new focus"), {
subsystem: "Cluster"
}), e.focusRoom = void 0);
}
if (!e.focusRoom) {
var p = a.filter(function(e) {
return e.rcl < 8;
});
if (0 === p.length) return;
p.sort(function(e, t) {
return e.rcl !== t.rcl ? e.rcl - t.rcl : e.roomName.localeCompare(t.roomName);
}), e.focusRoom = p[0].roomName, bo.info("Selected ".concat(e.focusRoom, " (RCL ").concat(p[0].rcl, ") as focus room for upgrading"), {
subsystem: "Cluster"
});
}
}
}, t.prototype.createCluster = function(e) {
var t = "cluster_".concat(e), r = Rn.getCluster(t, e);
if (!r) throw new Error("Failed to create cluster for ".concat(e));
return bo.info("Created cluster ".concat(t, " with core room ").concat(e), {
subsystem: "Cluster"
}), r;
}, t.prototype.addRoomToCluster = function(e, t, r) {
void 0 === r && (r = !1);
var o = Rn.getCluster(e);
o ? r ? o.remoteRooms.includes(t) || (o.remoteRooms.push(t), bo.info("Added remote room ".concat(t, " to cluster ").concat(e), {
subsystem: "Cluster"
})) : o.memberRooms.includes(t) || (o.memberRooms.push(t), bo.info("Added member room ".concat(t, " to cluster ").concat(e), {
subsystem: "Cluster"
})) : bo.error("Cluster ".concat(e, " not found"), {
subsystem: "Cluster"
});
}, t.prototype.processDefenseRequests = function(e) {
var t, r, o, a, s;
e.defenseRequests = e.defenseRequests.filter(function(e) {
var t = Game.time - e.createdAt;
if (t > 500) return bo.debug("Defense request for ".concat(e.roomName, " expired (").concat(t, " ticks old)"), {
subsystem: "Cluster"
}), !1;
var r = Game.rooms[e.roomName];
return !(!r || 0 === r.find(FIND_HOSTILE_CREEPS).length && (bo.info("Defense request for ".concat(e.roomName, " resolved - no more hostiles"), {
subsystem: "Cluster"
}), 1));
});
try {
for (var c = i(e.defenseRequests), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u.urgency >= 3) {
var m = Game.rooms[u.roomName];
m && m.storage && m.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 1e4 && eu(e, u.roomName, 2e4);
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
var o = Rn.getSwarmState(t);
if (!o) return "continue";
if (Hc(r, o)) {
var a = e.defenseRequests.find(function(e) {
return e.roomName === t;
});
if (a) {
var i = Wc(r, o);
i && i.urgency > a.urgency && (a.urgency = i.urgency, a.guardsNeeded = i.guardsNeeded, 
a.rangersNeeded = i.rangersNeeded, a.healersNeeded = i.healersNeeded, a.threat = i.threat);
} else {
var c = Wc(r, o);
c && e.defenseRequests.push(n(n({}, c), {
assignedCreeps: []
}));
}
}
};
try {
for (var f = i(e.memberRooms), d = f.next(); !d.done; d = f.next()) p(d.value);
} catch (e) {
o = {
error: e
};
} finally {
try {
d && !d.done && (a = f.return) && a.call(f);
} finally {
if (o) throw o.error;
}
}
this.assignDefendersToRequests(e);
}, t.prototype.assignDefendersToRequests = function(e) {
var t, r, o, n, a, l;
if (0 !== e.defenseRequests.length) {
var u = c([], s(e.defenseRequests), !1).sort(function(e, t) {
return t.urgency - e.urgency;
}), m = [];
try {
for (var p = i(u), f = p.next(); !f.done; f = p.next()) {
var d = f.value;
if (Game.rooms[d.roomName]) {
try {
for (var y = (o = void 0, i(e.memberRooms)), g = y.next(); !g.done; g = y.next()) {
var h = g.value;
if (h !== d.roomName) {
var v = Game.rooms[h];
if (v) {
var R = v.find(FIND_MY_CREEPS);
try {
for (var E = (a = void 0, i(R)), T = E.next(); !T.done; T = E.next()) {
var C = T.value, S = C.memory;
if ("military" === S.family && !S.assistTarget && !d.assignedCreeps.includes(C.name)) {
var w = d.guardsNeeded > 0, b = d.rangersNeeded > 0, O = d.healersNeeded > 0, _ = "guard" === S.role, x = "ranger" === S.role, U = "healer" === S.role;
if (w && _ || b && x || O && U) {
var A = Game.map.getRoomLinearDistance(h, d.roomName);
m.push({
creep: C,
room: v,
distance: A,
targetRoom: d.roomName
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
T && !T.done && (l = E.return) && l.call(E);
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
g && !g.done && (n = y.return) && n.call(y);
} finally {
if (o) throw o.error;
}
}
m.sort(function(e, t) {
return e.distance - t.distance;
});
for (var N = d.guardsNeeded + d.rangersNeeded + d.healersNeeded, M = Math.min(N, m.length), k = 0; k < M; k++) {
var P = m[k];
P && (P.creep.memory.assistTarget = d.roomName, d.assignedCreeps.push(P.creep.name), 
bo.info("Assigned ".concat(P.creep.name, " (").concat(P.creep.memory.role, ") from ").concat(P.room.name, " to assist ").concat(d.roomName, " (distance: ").concat(P.distance, ")"), {
subsystem: "Cluster"
}), "guard" === P.creep.memory.role && d.guardsNeeded--, "ranger" === P.creep.memory.role && d.rangersNeeded--, 
"healer" === P.creep.memory.role && d.healersNeeded--);
}
for (k = m.length - 1; k >= 0; k--) d.assignedCreeps.includes(m[k].creep.name) && m.splice(k, 1);
}
}
} catch (e) {
t = {
error: e
};
} finally {
try {
f && !f.done && (r = p.return) && r.call(p);
} finally {
if (t) throw t.error;
}
}
}
}, a([ An("cluster:manager", "Cluster Manager", {
priority: e.ProcessPriority.MEDIUM,
interval: 10,
minBucket: 0,
cpuBudget: .03
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Ru = new vu, Eu = {
minBucket: 0,
minSourceLinkEnergy: 400,
controllerLinkMaxEnergy: 700,
transferThreshold: 100,
storageLinkReserve: 100
};

!function(e) {
e.SOURCE = "source", e.CONTROLLER = "controller", e.STORAGE = "storage", e.UNKNOWN = "unknown";
}(gu || (gu = {}));

var Tu, Cu, Su, wu, bu, Ou, _u, xu, Uu, Au, Nu, Mu, ku, Pu = function() {
function t(e) {
void 0 === e && (e = {}), this.config = n(n({}, Eu), e);
}
return t.prototype.run = function() {
var e, t;
if (!(Game.cpu.bucket < this.config.minBucket)) {
var r = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.controller.level >= 5;
});
try {
for (var o = i(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
this.processRoomLinks(a);
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
}, t.prototype.processRoomLinks = function(e) {
var t = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LINK;
}
});
if (!(t.length < 2)) {
var r = this.classifyLinks(e, t), o = r.filter(function(e) {
return e.role === gu.SOURCE;
}), n = r.filter(function(e) {
return e.role === gu.CONTROLLER;
}), a = r.filter(function(e) {
return e.role === gu.STORAGE;
});
this.executeTransfers(e, o, n, a);
}
}, t.prototype.classifyLinks = function(e, t) {
var r = e.controller, o = e.storage, n = e.find(FIND_SOURCES);
return t.map(function(e) {
var t, a;
if (r && e.pos.getRangeTo(r) <= 2) return {
link: e,
role: gu.CONTROLLER,
priority: 100
};
if (o && e.pos.getRangeTo(o) <= 2) return {
link: e,
role: gu.STORAGE,
priority: 50
};
try {
for (var s = i(n), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (e.pos.getRangeTo(l) <= 2) return {
link: e,
role: gu.SOURCE,
priority: 10
};
}
} catch (e) {
t = {
error: e
};
} finally {
try {
c && !c.done && (a = s.return) && a.call(s);
} finally {
if (t) throw t.error;
}
}
return {
link: e,
role: gu.UNKNOWN,
priority: 25
};
});
}, t.prototype.executeTransfers = function(e, t, r, o) {
var n, a, l, u, m = this, p = t.filter(function(e) {
return e.link.store.getUsedCapacity(RESOURCE_ENERGY) >= m.config.minSourceLinkEnergy && 0 === e.link.cooldown;
}).sort(function(e, t) {
return t.link.store.getUsedCapacity(RESOURCE_ENERGY) - e.link.store.getUsedCapacity(RESOURCE_ENERGY);
});
if (0 !== p.length) {
var f = c(c([], s(r), !1), s(o), !1).filter(function(e) {
return e.link.store.getFreeCapacity(RESOURCE_ENERGY) > m.config.transferThreshold;
}).sort(function(e, t) {
return t.priority - e.priority;
});
if (0 !== f.length) try {
for (var d = i(p), y = d.next(); !y.done; y = d.next()) {
var g = y.value;
if (!(g.link.cooldown > 0)) {
var h = null;
try {
for (var v = (l = void 0, i(f)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
if (!(E.link.store.getFreeCapacity(RESOURCE_ENERGY) < this.config.transferThreshold)) {
if (E.role === gu.CONTROLLER && E.link.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.controllerLinkMaxEnergy) {
h = E;
break;
}
if (E.role !== gu.STORAGE) !h && E.link.store.getFreeCapacity(RESOURCE_ENERGY) > this.config.transferThreshold && (h = E); else if (E.link.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.storageLinkReserve) {
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
C === OK ? bo.debug("Link transfer: ".concat(T, " energy from ").concat(g.link.pos, " to ").concat(h.link.pos, " (").concat(h.role, ")"), {
subsystem: "Link",
room: e.name
}) : C !== ERR_TIRED && C !== ERR_FULL && bo.warn("Link transfer failed: ".concat(C, " from ").concat(g.link.pos, " to ").concat(h.link.pos), {
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
y && !y.done && (a = d.return) && a.call(d);
} finally {
if (n) throw n.error;
}
}
}
}, t.prototype.getLinkRole = function(e) {
var t, r, o = e.room, n = o.controller, a = o.storage, s = o.find(FIND_SOURCES);
if (n && e.pos.getRangeTo(n) <= 2) return gu.CONTROLLER;
if (a && e.pos.getRangeTo(a) <= 2) return gu.STORAGE;
try {
for (var c = i(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (e.pos.getRangeTo(u) <= 2) return gu.SOURCE;
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
return gu.UNKNOWN;
}, t.prototype.hasLinkNetwork = function(e) {
var t;
if (!(null === (t = e.controller) || void 0 === t ? void 0 : t.my) || e.controller.level < 5) return !1;
var r = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LINK;
}
});
if (r.length < 2) return !1;
var o = this.classifyLinks(e, r), n = o.some(function(e) {
return e.role === gu.SOURCE;
}), a = o.some(function(e) {
return e.role === gu.CONTROLLER || e.role === gu.STORAGE;
});
return n && a;
}, a([ An("link:manager", "Link Manager", {
priority: e.ProcessPriority.MEDIUM,
interval: 5,
minBucket: 0,
cpuBudget: .05
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Iu = new Pu, Gu = {
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
sellThresholds: (Tu = {}, Tu[RESOURCE_ENERGY] = 5e5, Tu[RESOURCE_HYDROGEN] = 2e4, 
Tu[RESOURCE_OXYGEN] = 2e4, Tu[RESOURCE_UTRIUM] = 2e4, Tu[RESOURCE_LEMERGIUM] = 2e4, 
Tu[RESOURCE_KEANIUM] = 2e4, Tu[RESOURCE_ZYNTHIUM] = 2e4, Tu[RESOURCE_CATALYST] = 2e4, 
Tu),
buyThresholds: (Cu = {}, Cu[RESOURCE_ENERGY] = 1e5, Cu[RESOURCE_HYDROGEN] = 5e3, 
Cu[RESOURCE_OXYGEN] = 5e3, Cu[RESOURCE_UTRIUM] = 5e3, Cu[RESOURCE_LEMERGIUM] = 5e3, 
Cu[RESOURCE_KEANIUM] = 5e3, Cu[RESOURCE_ZYNTHIUM] = 5e3, Cu[RESOURCE_CATALYST] = 5e3, 
Cu),
trackedResources: [ RESOURCE_ENERGY, RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_GHODIUM, RESOURCE_POWER ],
criticalResources: [ RESOURCE_ENERGY, RESOURCE_GHODIUM ],
emergencyBuyThreshold: 5e3,
orderExtensionAge: 5e3,
maxTransportCostRatio: .3
}, Lu = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = n(n({}, Gu), e);
}
return t.prototype.run = function() {
this.lastRun = Game.time, this.ensureMarketMemory(), Game.time % this.config.priceUpdateInterval === 0 && this.updatePriceTracking(), 
this.updateOrderStats(), this.reconcilePendingArbitrage(), this.handleEmergencyBuying(), 
this.cancelOldOrders(), this.manageExistingOrders(), this.updateBuyOrders(), this.updateSellOrders(), 
this.checkArbitrageOpportunities(), this.executeDeal(), Game.time % 200 == 0 && this.balanceResourcesAcrossRooms();
}, t.prototype.ensureMarketMemory = function() {
var e = Rn.getEmpire();
e.market || (e.market = {
resources: {},
lastScan: 0,
pendingArbitrage: [],
completedArbitrage: 0,
arbitrageProfit: 0
}), e.market.orders || (e.market.orders = {}), void 0 === e.market.totalProfit && (e.market.totalProfit = 0), 
e.market.lastBalance || (e.market.lastBalance = 0), e.market.pendingArbitrage || (e.market.pendingArbitrage = []), 
void 0 === e.market.completedArbitrage && (e.market.completedArbitrage = 0), void 0 === e.market.arbitrageProfit && (e.market.arbitrageProfit = 0);
}, t.prototype.updatePriceTracking = function() {
var e, t, r = Rn.getEmpire();
if (r.market) {
try {
for (var o = i(this.config.trackedResources), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
this.updateResourcePrice(a);
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
r.market.lastScan = Game.time, bo.debug("Updated market prices for ".concat(this.config.trackedResources.length, " resources"), {
subsystem: "Market"
});
}
}, t.prototype.updateResourcePrice = function(e) {
var t = Rn.getEmpire();
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
var p = n.priceHistory.slice(-3), f = (p[2].avgPrice - p[0].avgPrice) / 2;
n.predictedPrice = p[2].avgPrice + f;
}
n.lastUpdate = Game.time;
}
}
}, t.prototype.getMarketData = function(e) {
var t;
return null === (t = Rn.getEmpire().market) || void 0 === t ? void 0 : t.resources[e];
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
Game.time - r.created > 1e4 && (Game.market.cancelOrder(t), bo.info("Cancelled old order: ".concat(r.type, " ").concat(r.resourceType), {
subsystem: "Market"
})), r.remainingAmount < 100 && Game.market.cancelOrder(t);
}
}, t.prototype.updateBuyOrders = function() {
var e, t, r, o = Rn.getEmpire().objectives.warMode, n = {};
for (var a in Game.rooms) {
var i = Game.rooms[a];
if (i.terminal && (null === (e = i.controller) || void 0 === e ? void 0 : e.my)) for (var s in i.terminal.store) n[s] = (null !== (t = n[s]) && void 0 !== t ? t : 0) + i.terminal.store[s];
}
for (var s in this.config.buyThresholds) {
var c = this.config.buyThresholds[s], l = null !== (r = n[s]) && void 0 !== r ? r : 0;
if (l < c) {
var u = this.isBuyOpportunity(s);
o || u ? this.createBuyOrder(s, c - l, o, u) : bo.debug("Skipping buy for ".concat(s, ": waiting for better price"), {
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
bo.info("Created buy order: ".concat(t, " ").concat(e, " at ").concat(i.toFixed(3), " credits").concat(u), {
subsystem: "Market"
});
}
}
}
}
}, t.prototype.sellSurplusFromTerminal = function(e, t, r) {
var o, n = Game.rooms[e];
if (!(null == n ? void 0 : n.terminal) || !(null === (o = n.controller) || void 0 === o ? void 0 : o.my)) return bo.warn("Cannot sell from ".concat(e, ": no terminal or not owned"), {
subsystem: "Market"
}), !1;
var a = n.terminal.store.getUsedCapacity(t);
if (a < r) return bo.debug("Cannot sell ".concat(r, " ").concat(t, " from ").concat(e, ": only ").concat(a, " available"), {
subsystem: "Market"
}), !1;
var i = Rn.getEmpire();
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
return u === OK ? (bo.info("Created surplus sell order: ".concat(r, " ").concat(t, " from ").concat(e, " at ").concat(c.toFixed(3), " credits/unit"), {
subsystem: "Market"
}), !0) : (bo.warn("Failed to create sell order: ".concat(u, " for ").concat(r, " ").concat(t, " from ").concat(e), {
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
l ? this.createSellOrder(i, c - s, l) : bo.debug("Holding ".concat(i, " surplus: waiting for better price"), {
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
bo.info("Created sell order: ".concat(t, " ").concat(e, " at ").concat(a.toFixed(3), " credits").concat(l), {
subsystem: "Market"
});
}
}
}
}, t.prototype.updateOrderStats = function() {
var e, t, r = Rn.getEmpire();
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
bo.info("Order completed: ".concat(a.resource, " ").concat(a.type, " - Traded: ").concat(a.totalTraded, ", Value: ").concat(a.totalValue.toFixed(0), ", Profit: ").concat(l.toFixed(0)), {
subsystem: "Market"
});
}
delete r.market.orders[n];
}
}
}
}, t.prototype.executeDeal = function() {
var e, t;
if (Game.time % 50 == 0 && Rn.getEmpire().objectives.warMode) {
var r = [ RESOURCE_CATALYZED_GHODIUM_ACID, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, RESOURCE_CATALYZED_KEANIUM_ALKALIDE ];
try {
for (var o = i(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value, s = Game.market.getAllOrders({
type: ORDER_SELL,
resourceType: a
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
Game.market.deal(c.id, u, l.name) === OK && bo.info("Bought ".concat(u, " ").concat(a, " for ").concat(c.price.toFixed(3), " credits/unit"), {
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
n && !n.done && (t = o.return) && t.call(o);
} finally {
if (e) throw e.error;
}
}
}
}, t.prototype.handleEmergencyBuying = function() {
var e, t, r, o, n;
if (!(Game.market.credits < this.config.emergencyCredits)) {
var a = {};
for (var s in Game.rooms) {
var c = Game.rooms[s];
if (c.terminal && (null === (r = c.controller) || void 0 === r ? void 0 : r.my)) for (var l in c.terminal.store) a[l] = (null !== (o = a[l]) && void 0 !== o ? o : 0) + c.terminal.store[l];
}
try {
for (var u = i(this.config.criticalResources), m = u.next(); !m.done; m = u.next()) {
var p = null !== (n = a[l = m.value]) && void 0 !== n ? n : 0;
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
Game.market.deal(n.id, a, o.name) === OK && bo.warn("EMERGENCY BUY: ".concat(a, " ").concat(e, " at ").concat(n.price.toFixed(3), " credits/unit"), {
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
bo.debug("Extended buy order for ".concat(r.resourceType, ": +").concat(r.remainingAmount, " at ").concat(r.price.toFixed(3)), {
subsystem: "Market"
}));
}
r.type === ORDER_SELL && (i = a * this.config.sellOpportunityAdjustment, r.price > 1.1 * i && r.remainingAmount > 1e3 && (Game.market.extendOrder(t, Math.min(5e3, r.remainingAmount)), 
bo.debug("Extended sell order for ".concat(r.resourceType, ": +").concat(r.remainingAmount, " at ").concat(r.price.toFixed(3)), {
subsystem: "Market"
})));
}
}
}
}
}, t.prototype.reconcilePendingArbitrage = function() {
var e, t, r, o, n, a, s, c = Rn.getEmpire().market;
if ((null == c ? void 0 : c.pendingArbitrage) && 0 !== c.pendingArbitrage.length) {
var l = [];
try {
for (var u = i(c.pendingArbitrage), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = Game.rooms[p.destinationRoom], d = null == f ? void 0 : f.terminal;
if (d && (null === (r = null == f ? void 0 : f.controller) || void 0 === r ? void 0 : r.my)) if (Game.time < p.expectedArrival || d.cooldown > 0) l.push(p); else {
var y = null !== (o = d.store[p.resource]) && void 0 !== o ? o : 0;
if (y < p.amount) l.push(p); else {
var g = !1;
if (p.sellOrderId) {
var h = Game.market.getOrderById(p.sellOrderId);
if (h && h.remainingAmount > 0 && h.roomName) {
var v = Math.min(p.amount, h.remainingAmount, y), R = Game.market.calcTransactionCost(v, d.room.name, h.roomName);
if (d.store[RESOURCE_ENERGY] >= R && Game.market.deal(h.id, v, d.room.name) === OK) {
var E = (h.price - p.buyPrice) * v;
c.totalProfit = (null !== (n = c.totalProfit) && void 0 !== n ? n : 0) + E, c.arbitrageProfit = (null !== (a = c.arbitrageProfit) && void 0 !== a ? a : 0) + E, 
c.completedArbitrage = (null !== (s = c.completedArbitrage) && void 0 !== s ? s : 0) + 1, 
bo.info("Arbitrage complete: sold ".concat(v, " ").concat(p.resource, " from ").concat(d.room.name, " at ").concat(h.price.toFixed(3), ", profit ").concat(E.toFixed(2)), {
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
roomName: d.room.name
}) === OK && (bo.info("Arbitrage posted sell order: ".concat(p.amount, " ").concat(p.resource, " at ").concat(p.targetSellPrice.toFixed(3), " from ").concat(d.room.name), {
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
}, t.prototype.checkArbitrageOpportunities = function() {
var e, t, r, o, n, a;
if (!(Game.cpu.bucket < this.config.minBucket || Game.market.credits < this.config.tradingCredits)) {
var s = Rn.getEmpire().market, c = Object.values(Game.rooms).filter(function(e) {
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
}), f = Game.market.getAllOrders({
type: ORDER_SELL,
resourceType: e
}).filter(function(e) {
return e.remainingAmount > 0 && e.roomName;
});
if (0 === p.length || 0 === f.length) return "continue";
p.sort(function(e, t) {
return t.price - e.price;
}), f.sort(function(e, t) {
return e.price - t.price;
});
var d = p[0], y = f[0];
if (!d.roomName || !y.roomName) return "continue";
if (null === (r = s.pendingArbitrage) || void 0 === r ? void 0 : r.some(function(e) {
return e.buyOrderId === y.id || e.sellOrderId === d.id;
})) return "continue";
var g = Math.min(l(d), l(y), 5e3);
if (g <= 0) return "continue";
try {
for (var h = (t = void 0, i(c)), v = h.next(); !v.done; v = h.next()) {
var R = v.value, E = R.terminal;
if (!((null !== (o = E.store.getFreeCapacity(e)) && void 0 !== o ? o : 0) < g)) {
var T = Game.market.calcTransactionCost(g, R.name, y.roomName), C = (T + Game.market.calcTransactionCost(g, R.name, d.roomName)) / g, S = d.price - y.price - C;
if (!(S <= 0 || C / y.price > m.config.maxTransportCostRatio || E.store[RESOURCE_ENERGY] < T)) {
var w = y.price * g;
if (!(Game.market.credits - w < m.config.minCredits) && Game.market.deal(y.id, g, R.name) === OK) {
var b = {
id: "".concat(e, "-").concat(Game.time, "-").concat(y.id),
resource: e,
amount: g,
buyOrderId: y.id,
sellOrderId: d.id,
targetSellPrice: d.price,
destinationRoom: R.name,
expectedArrival: Game.time + (null !== (n = E.cooldown) && void 0 !== n ? n : 0) + 1,
buyPrice: y.price,
transportCost: T
};
null === (a = s.pendingArbitrage) || void 0 === a || a.push(b), bo.info("Arbitrage started: bought ".concat(g, " ").concat(e, " at ").concat(y.price.toFixed(3), " to sell @ ").concat(d.price.toFixed(3), " (profit/unit ~").concat(S.toFixed(2), ")"), {
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
for (var p = i(this.config.trackedResources), f = p.next(); !f.done; f = p.next()) u(f.value);
} catch (t) {
e = {
error: t
};
} finally {
try {
f && !f.done && (t = p.return) && t.call(p);
} finally {
if (e) throw e.error;
}
}
}
}
}, t.prototype.balanceResourcesAcrossRooms = function() {
var e, t, r, o, n, a = Object.values(Game.rooms).filter(function(e) {
var t;
return e.terminal && (null === (t = e.controller) || void 0 === t ? void 0 : t.my);
});
if (!(a.length < 2)) try {
for (var s = i(this.config.trackedResources), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = [];
try {
for (var m = (r = void 0, i(a)), p = m.next(); !p.done; p = m.next()) {
var f = p.value;
if (f.terminal) {
var d = null !== (n = f.terminal.store[l]) && void 0 !== n ? n : 0;
u.push({
room: f,
amount: d
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
(l === RESOURCE_ENERGY && E < .1 * R || l !== RESOURCE_ENERGY && E < 1e3) && g.room.terminal.send(l, R, h.room.name) === OK && bo.info("Balanced ".concat(R, " ").concat(l, ": ").concat(g.room.name, " -> ").concat(h.room.name, " (cost: ").concat(E, " energy)"), {
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
}, a([ Nn("empire:market", "Market Manager", {
priority: e.ProcessPriority.LOW,
interval: 100,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Du = new Lu, Fu = function() {
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
var o, n, a, s, c, l, u, m, p, f = this.calculateTransferCost(r, e, t), d = {
path: [ e, t ],
cost: f,
isDirect: !0
}, y = this.buildTerminalGraph();
if (y.length < 3) return d;
var g = new Map, h = new Map, v = new Set;
try {
for (var R = i(y), E = R.next(); !E.done; E = R.next()) {
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
for (var w = (a = void 0, i(v)), b = w.next(); !b.done; b = w.next()) {
var O = b.value, _ = null !== (u = g.get(O)) && void 0 !== u ? u : 1 / 0;
_ < S && (S = _, C = O);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
b && !b.done && (s = w.return) && s.call(w);
} finally {
if (a) throw a.error;
}
}
if (!C || S === 1 / 0) break;
if (C === t) break;
if (v.delete(C), !(this.getPathLength(C, h) >= this.MAX_HOPS)) try {
for (var x = (c = void 0, i(y)), U = x.next(); !U.done; U = x.next()) {
var A = U.value;
if (v.has(A.roomName) && A.roomName !== C) {
var N = this.calculateTransferCost(r, C, A.roomName), M = (null !== (m = g.get(C)) && void 0 !== m ? m : 1 / 0) + N;
M < (null !== (p = g.get(A.roomName)) && void 0 !== p ? p : 1 / 0) && (g.set(A.roomName, M), 
h.set(A.roomName, C));
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
var k = g.get(t);
if (void 0 !== k && k < f) {
var P = this.reconstructPath(t, h);
P.length > 0 && P[0] === e && (d = {
path: P,
cost: k,
isDirect: !1
}, bo.debug("Multi-hop route found: ".concat(P.join(" -> "), " (cost: ").concat(k, " vs direct: ").concat(f, ")"), {
subsystem: "TerminalRouter"
}));
}
return d;
}, e.prototype.getPathLength = function(e, t) {
for (var r = 0, o = e; void 0 !== o && t.has(o) && (r++, o = t.get(o), !(r > this.MAX_HOPS)); ) ;
return r;
}, e.prototype.reconstructPath = function(e, t) {
for (var r = [], o = e; void 0 !== o; ) r.unshift(o), o = t.get(o);
return r;
}, e.prototype.clearOldCache = function() {
var e, t, r = Game.time - this.COST_CACHE_TTL;
try {
for (var o = i(this.costCache.entries()), n = o.next(); !n.done; n = o.next()) {
var a = s(n.value, 2), c = a[0];
a[1].timestamp < r && this.costCache.delete(c);
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
}(), Bu = new Fu, Hu = {
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
}, Wu = function() {
function t(e) {
void 0 === e && (e = {}), this.transferQueue = [], this.config = n(n({}, Hu), e);
}
return t.prototype.requestTransfer = function(e, t, r, o, n) {
if (void 0 === n && (n = 3), this.transferQueue.some(function(o) {
return o.fromRoom === e && o.toRoom === t && o.resourceType === r;
})) return bo.debug("Transfer already queued: ".concat(o, " ").concat(r, " from ").concat(e, " to ").concat(t), {
subsystem: "Terminal"
}), !1;
var a = Game.rooms[e], i = Game.rooms[t];
return a && i && a.terminal && i.terminal ? (this.transferQueue.push({
fromRoom: e,
toRoom: t,
resourceType: r,
amount: o,
priority: n
}), bo.info("Queued transfer request: ".concat(o, " ").concat(r, " from ").concat(e, " to ").concat(t, " (priority: ").concat(n, ")"), {
subsystem: "Terminal"
}), !0) : (bo.warn("Cannot queue transfer: rooms or terminals not available", {
subsystem: "Terminal"
}), !1);
}, t.prototype.run = function() {
if (!(Game.cpu.bucket < this.config.minBucket)) {
var e = Object.values(Game.rooms).filter(function(e) {
var t;
return (null === (t = e.controller) || void 0 === t ? void 0 : t.my) && e.terminal && e.terminal.my && e.terminal.isActive();
});
e.length < 2 || (Bu.clearOldCache(), this.cleanTransferQueue(), this.checkEmergencyTransfers(e), 
this.monitorTerminalCapacity(e), this.balanceEnergy(e), this.balanceMinerals(e), 
this.executeTransfers(e));
}
}, t.prototype.cleanTransferQueue = function() {
this.transferQueue = this.transferQueue.filter(function(e) {
var t = Game.rooms[e.fromRoom], r = Game.rooms[e.toRoom];
return !!(t && r && t.terminal && r.terminal);
});
}, t.prototype.checkEmergencyTransfers = function(e) {
var t, r, o, n, a = this, s = function(t) {
if (!(null === (o = t.controller) || void 0 === o ? void 0 : o.my)) return "continue";
var r = Rn.getSwarmState(t.name);
if (!r) return "continue";
if (r.danger >= c.config.emergencyDangerThreshold) {
var i = t.storage, s = t.terminal;
if ((null !== (n = null == i ? void 0 : i.store.getUsedCapacity(RESOURCE_ENERGY)) && void 0 !== n ? n : 0) + s.store.getUsedCapacity(RESOURCE_ENERGY) < c.config.energyRequestThreshold / 2) {
var l = e.filter(function(e) {
var r;
return e.name !== t.name && (null === (r = e.controller) || void 0 === r ? void 0 : r.my) && e.storage && e.storage.store.getUsedCapacity(RESOURCE_ENERGY) > a.config.energySendThreshold;
}).sort(function(e, r) {
return Game.map.getRoomLinearDistance(t.name, e.name) - Game.map.getRoomLinearDistance(t.name, r.name);
});
if (l.length > 0 && l[0]) {
var u = l[0];
if (!c.transferQueue.some(function(e) {
return e.toRoom === t.name && e.resourceType === RESOURCE_ENERGY && e.isEmergency;
})) {
var m = Bu.findOptimalRoute(u.name, t.name, c.config.emergencyEnergyAmount);
m && (c.transferQueue.push({
fromRoom: u.name,
toRoom: t.name,
resourceType: RESOURCE_ENERGY,
amount: c.config.emergencyEnergyAmount,
priority: 10,
route: m,
isEmergency: !0
}), bo.warn("Emergency energy transfer queued: ".concat(c.config.emergencyEnergyAmount, " from ").concat(u.name, " to ").concat(t.name, " (danger: ").concat(r.danger, ")"), {
subsystem: "Terminal"
}));
}
}
}
}
}, c = this;
try {
for (var l = i(e), u = l.next(); !u.done; u = l.next()) s(u.value);
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
}, t.prototype.monitorTerminalCapacity = function(e) {
var t, r;
try {
for (var o = i(e), n = o.next(); !n.done; n = o.next()) {
var a = n.value, s = a.terminal, c = s.store.getCapacity(), l = s.store.getUsedCapacity(), u = l / c;
u >= this.config.capacityWarningThreshold && u < this.config.capacityClearanceThreshold && Game.time % 100 == 0 && bo.warn("Terminal ".concat(a.name, " at ").concat((100 * u).toFixed(1), "% capacity (").concat(l, "/").concat(c, ")"), {
subsystem: "Terminal"
}), u >= this.config.capacityClearanceThreshold && this.clearExcessTerminalResources(a, s);
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
}, t.prototype.clearExcessTerminalResources = function(e, t) {
var r, o, n, a, s, c;
bo.info("Auto-clearing terminal ".concat(e.name, " (").concat((t.store.getUsedCapacity() / t.store.getCapacity() * 100).toFixed(1), "% full)"), {
subsystem: "Terminal"
});
var l, u = Rn.getClusters();
for (var m in u) {
var p = u[m];
if (p.memberRooms.includes(e.name)) {
var f = 0;
try {
for (var d = (r = void 0, i(p.memberRooms)), y = d.next(); !y.done; y = d.next()) {
var g = y.value, h = Game.rooms[g];
(null === (s = null == h ? void 0 : h.controller) || void 0 === s ? void 0 : s.my) && h.controller.level > f && (f = h.controller.level, 
l = g);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = d.return) && o.call(d);
} finally {
if (r) throw r.error;
}
}
break;
}
}
var v = Object.keys(t.store);
try {
for (var R = i(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value, C = t.store.getUsedCapacity(T);
if (0 !== C) {
var S = T === RESOURCE_ENERGY ? this.config.energySurplusThreshold : this.config.mineralSurplusThreshold;
if (C > S) {
var w = C - S;
if (l && l !== e.name) {
var b = null === (c = Game.rooms[l]) || void 0 === c ? void 0 : c.terminal;
if (b && b.store.getFreeCapacity() > w) {
var O = Bu.findOptimalRoute(e.name, l, w);
if (O) {
this.transferQueue.push({
fromRoom: e.name,
toRoom: l,
resourceType: T,
amount: w,
priority: 5,
route: O
}), bo.info("Queued clearance transfer: ".concat(w, " ").concat(T, " from ").concat(e.name, " to hub ").concat(l), {
subsystem: "Terminal"
});
continue;
}
}
}
Game.time % 10 == 0 && Du.sellSurplusFromTerminal(e.name, T, w) && bo.info("Sold ".concat(w, " ").concat(T, " from ").concat(e.name, " terminal via market"), {
subsystem: "Terminal"
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
E && !E.done && (a = R.return) && a.call(R);
} finally {
if (n) throw n.error;
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
}), a = n.filter(function(e) {
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
var o = Bu.findOptimalRoute(t.room.name, e.room.name, r);
if (!o) return "continue";
var n = o.cost / r;
if (n > l.config.maxTransferCostRatio) return bo.debug("Skipping terminal transfer from ".concat(t.room.name, " to ").concat(e.room.name, ": cost ratio ").concat(n.toFixed(2), " too high"), {
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
return bo.info("Queued energy transfer: ".concat(r, " from ").concat(t.room.name, " to ").concat(e.room.name, " (").concat(a, ", cost: ").concat(o.cost, ")"), {
subsystem: "Terminal"
}), "break";
};
try {
for (var n = (t = void 0, i(s)), a = n.next(); !a.done && "break" !== o(a.value); a = n.next()) ;
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
}, l = this;
try {
for (var u = i(a), m = u.next(); !m.done; m = u.next()) c(m.value);
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
var t, r, o, n, a, c, l = new Map;
try {
for (var u = i(e), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = p.terminal, d = Object.keys(f.store);
try {
for (var y = (o = void 0, i(d)), g = y.next(); !g.done; g = y.next()) {
var h = g.value;
if (h !== RESOURCE_ENERGY) {
var v = f.store.getUsedCapacity(h);
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
}), bo.info("Queued mineral transfer: ".concat(a, " ").concat(e, " from ").concat(r.room.name, " to ").concat(o.room.name), {
subsystem: "Terminal"
});
}, E = this;
try {
for (var T = i(l.entries()), C = T.next(); !C.done; C = T.next()) {
var S = s(C.value, 2);
R(S[0], S[1]);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
C && !C.done && (c = T.return) && c.call(T);
} finally {
if (a) throw a.error;
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
var i = n.store.getUsedCapacity(t.resourceType);
if (i < t.amount) return bo.debug("Terminal transfer cancelled: insufficient ".concat(t.resourceType, " in ").concat(t.fromRoom, " (need ").concat(t.amount, ", have ").concat(i, ")"), {
subsystem: "Terminal"
}), a.transferQueue = a.transferQueue.filter(function(e) {
return e !== t;
}), "continue";
var s = t.toRoom;
if (t.route && !t.route.isDirect) {
var c = Bu.getNextHop(t.route, t.fromRoom);
c && (s = c);
}
var l = n.send(t.resourceType, t.amount, s, "Terminal auto-balance".concat(t.isEmergency ? " [EMERGENCY]" : ""));
if (l === OK) {
var u = t.route && !t.route.isDirect, m = s === t.toRoom;
bo.info("Terminal transfer executed: ".concat(t.amount, " ").concat(t.resourceType, " from ").concat(t.fromRoom, " to ").concat(s).concat(u && !m ? " (hop to ".concat(t.toRoom, ")") : "").concat(t.isEmergency ? " [EMERGENCY]" : ""), {
subsystem: "Terminal"
}), o.add(t.fromRoom), u && !m ? t.fromRoom = s : a.transferQueue = a.transferQueue.filter(function(e) {
return e !== t;
});
} else bo.warn("Terminal transfer failed: ".concat(l, " for ").concat(t.amount, " ").concat(t.resourceType, " from ").concat(t.fromRoom, " to ").concat(s), {
subsystem: "Terminal"
}), a.transferQueue = a.transferQueue.filter(function(e) {
return e !== t;
});
}, a = this;
try {
for (var s = i(this.transferQueue), c = s.next(); !c.done; c = s.next()) n(c.value);
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
var r, o, n, a, c, l, u, m = new Map;
try {
for (var p = i(e), f = p.next(); !f.done; f = p.next()) {
var d = f.value, y = Game.rooms[d];
if (null == y ? void 0 : y.terminal) try {
for (var g = (n = void 0, i(t)), h = g.next(); !h.done; h = g.next()) {
var v = h.value, R = null !== (u = y.terminal.store[v]) && void 0 !== u ? u : 0;
m.has(v) || m.set(v, []), m.get(v).push({
roomName: d,
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
h && !h.done && (a = g.return) && a.call(g);
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
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
var E = function(e, t) {
var r, o, n, a;
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
for (var u = (r = void 0, i(l)), m = u.next(); !m.done; m = u.next()) {
var p = m.value;
try {
for (var f = (n = void 0, i(c)), d = f.next(); !d.done; d = f.next()) {
var y = d.value, g = Math.min(Math.floor((p.amount - s) / 2), Math.floor((s - y.amount) / 2), 3e3), h = e === RESOURCE_CATALYZED_UTRIUM_ACID || e === RESOURCE_CATALYZED_KEANIUM_ALKALIDE || e === RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE || e === RESOURCE_CATALYZED_GHODIUM_ACID || e === RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE || e === RESOURCE_CATALYZED_GHODIUM_ALKALIDE;
g >= (h ? 300 : 500) && (T.queueTransfer(p.roomName, y.roomName, e, g, h ? 8 : 5), 
bo.info("Queued compound balance: ".concat(g, " ").concat(e, " from ").concat(p.roomName, " to ").concat(y.roomName), {
subsystem: "Terminal"
}), p.amount -= g, y.amount += g);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
d && !d.done && (a = f.return) && a.call(f);
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
for (var C = i(m.entries()), S = C.next(); !S.done; S = C.next()) {
var w = s(S.value, 2);
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
}, a([ An("terminal:manager", "Terminal Manager", {
priority: e.ProcessPriority.MEDIUM,
interval: 20,
minBucket: 0,
cpuBudget: .1
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Yu = new Wu, Ku = {
minBucket: 0,
minStorageEnergy: 8e4,
inputBufferAmount: 2e3,
outputBufferAmount: 5e3
}, ju = ((Su = {})[RESOURCE_UTRIUM_BAR] = ((wu = {})[RESOURCE_UTRIUM] = 500, wu[RESOURCE_ENERGY] = 200, 
wu), Su[RESOURCE_LEMERGIUM_BAR] = ((bu = {})[RESOURCE_LEMERGIUM] = 500, bu[RESOURCE_ENERGY] = 200, 
bu), Su[RESOURCE_ZYNTHIUM_BAR] = ((Ou = {})[RESOURCE_ZYNTHIUM] = 500, Ou[RESOURCE_ENERGY] = 200, 
Ou), Su[RESOURCE_KEANIUM_BAR] = ((_u = {})[RESOURCE_KEANIUM] = 500, _u[RESOURCE_ENERGY] = 200, 
_u), Su[RESOURCE_GHODIUM_MELT] = ((xu = {})[RESOURCE_GHODIUM] = 500, xu[RESOURCE_ENERGY] = 200, 
xu), Su[RESOURCE_OXIDANT] = ((Uu = {})[RESOURCE_OXYGEN] = 500, Uu[RESOURCE_ENERGY] = 200, 
Uu), Su[RESOURCE_REDUCTANT] = ((Au = {})[RESOURCE_HYDROGEN] = 500, Au[RESOURCE_ENERGY] = 200, 
Au), Su[RESOURCE_PURIFIER] = ((Nu = {})[RESOURCE_CATALYST] = 500, Nu[RESOURCE_ENERGY] = 200, 
Nu), Su[RESOURCE_BATTERY] = ((Mu = {})[RESOURCE_ENERGY] = 600, Mu), Su), Vu = ((ku = {})[RESOURCE_BATTERY] = 10, 
ku[RESOURCE_UTRIUM_BAR] = 5, ku[RESOURCE_LEMERGIUM_BAR] = 5, ku[RESOURCE_ZYNTHIUM_BAR] = 5, 
ku[RESOURCE_KEANIUM_BAR] = 5, ku[RESOURCE_GHODIUM_MELT] = 4, ku[RESOURCE_OXIDANT] = 3, 
ku[RESOURCE_REDUCTANT] = 3, ku[RESOURCE_PURIFIER] = 3, ku), qu = function() {
function t(e) {
void 0 === e && (e = {}), this.config = n(n({}, Ku), e);
}
return t.prototype.run = function() {
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
for (var o = i(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
this.processFactory(a);
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
}, t.prototype.processFactory = function(e) {
var t, r, o = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_FACTORY;
}
});
if (0 !== o.length) {
var n = o[0];
if (n && !(n.cooldown > 0)) {
var a = e.storage;
if (a && !(a.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.minStorageEnergy)) {
var c = this.selectProduction(e, n, a);
if (c) {
var l = ju[c];
if (l) {
var u = !0;
try {
for (var m = i(Object.entries(l)), p = m.next(); !p.done; p = m.next()) {
var f = s(p.value, 2), d = f[0], y = f[1];
if (n.store.getUsedCapacity(d) < y) {
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
g === OK ? bo.info("Factory in ".concat(e.name, " producing ").concat(c), {
subsystem: "Factory"
}) : g !== ERR_TIRED && bo.debug("Factory production failed in ".concat(e.name, ": ").concat(g), {
subsystem: "Factory"
});
}
}
}
}
}
}
}, t.prototype.selectProduction = function(e, t, r) {
var o, n, a, c, l, u = [];
try {
for (var m = i(Object.entries(ju)), p = m.next(); !p.done; p = m.next()) {
var f = s(p.value, 2), d = f[0], y = f[1], g = d, h = !0, v = 0;
try {
for (var R = (a = void 0, i(Object.entries(y))), E = R.next(); !E.done; E = R.next()) {
var T = s(E.value, 2), C = T[0], S = T[1], w = C, b = r.store.getUsedCapacity(w);
if (b < 2 * S) {
h = !1;
break;
}
v += b / (10 * S);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
E && !E.done && (c = R.return) && c.call(R);
} finally {
if (a) throw a.error;
}
}
if (h) {
var O = t.store.getUsedCapacity(g) + r.store.getUsedCapacity(g);
if (!(O > this.config.outputBufferAmount)) {
var _ = null !== (l = Vu[g]) && void 0 !== l ? l : 1, x = _ * v * (1 - O / this.config.outputBufferAmount);
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
p && !p.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
return 0 === u.length ? null : (u.sort(function(e, t) {
return t.score - e.score;
}), u[0].commodity);
}, t.prototype.getRequiredInputs = function(e, t) {
var r, o, n = t.storage;
if (!n) return [];
var a = this.selectProduction(t, e, n);
if (!a) return [];
var c = ju[a];
if (!c) return [];
var l = [];
try {
for (var u = i(Object.entries(c)), m = u.next(); !m.done; m = u.next()) {
var p = s(m.value, 2), f = p[0], d = p[1], y = f, g = e.store.getUsedCapacity(y), h = Math.max(0, this.config.inputBufferAmount - g);
h > 0 && l.push({
resource: y,
amount: Math.min(h, 2 * d)
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
}, t.prototype.hasOutputsToRemove = function(e) {
var t, r;
try {
for (var o = i(Object.keys(ju)), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (e.store.getUsedCapacity(a) > 0) return !0;
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
}, t.prototype.canOperateWithoutLabConflict = function(e) {
if (!e.terminal) return !1;
var t = e.find(FIND_MY_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_LAB;
}
});
return t.filter(function(e) {
return e.cooldown > 0;
}).length < t.length / 2 || 0 === t.length;
}, a([ An("factory:manager", "Factory Manager", {
priority: e.ProcessPriority.LOW,
interval: 30,
minBucket: 0,
cpuBudget: .05
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), zu = new qu, Xu = {
updateInterval: 500,
minBucket: 0,
maxCpuBudget: .02,
trackedResources: [ RESOURCE_ENERGY, RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_GHODIUM ],
highVolatilityThreshold: .3,
opportunityConfidenceThreshold: .7
};

!function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.supplyDemandCache = new Map, this.opportunities = [], 
this.config = n(n({}, Xu), e);
}
t.prototype.run = function() {
var e, t, r = Game.cpu.getUsed();
this.lastRun = Game.time;
try {
for (var o = i(this.config.trackedResources), n = o.next(); !n.done; n = o.next()) {
var a = n.value, s = this.analyzeSupplyDemand(a);
s && this.supplyDemandCache.set(a, s);
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
Game.time % 1e3 == 0 && bo.info("Market trend analysis completed in ".concat(c.toFixed(2), " CPU, ").concat(this.opportunities.length, " opportunities detected"), {
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
var e, t, r, o, n, a, s, c, l, u, m, p = Rn.getEmpire(), f = [];
try {
for (var d = i(this.config.trackedResources), y = d.next(); !y.done; y = d.next()) {
var g = y.value, h = null === (n = p.market) || void 0 === n ? void 0 : n.resources[g];
if (h) {
var v = this.supplyDemandCache.get(g);
if (v) {
-1 === h.trend && v.sentiment < -.3 && (S = Math.abs(v.sentiment) * (1 - (null !== (a = h.volatility) && void 0 !== a ? a : .5))) >= this.config.opportunityConfidenceThreshold && f.push({
resource: g,
type: "buy",
expectedValue: 1e4 * (h.avgPrice - (null !== (s = h.predictedPrice) && void 0 !== s ? s : h.avgPrice)),
confidence: S,
action: "Buy ".concat(g, " at current price (falling trend, oversupply)"),
urgency: this.calculateUrgency(S, Math.abs(v.sentiment)),
createdAt: Game.time
}), 1 === h.trend && v.sentiment > .3 && (S = v.sentiment * (1 - (null !== (c = h.volatility) && void 0 !== c ? c : .5))) >= this.config.opportunityConfidenceThreshold && f.push({
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
f.push({
resource: g,
type: "arbitrage",
expectedValue: C,
confidence: S,
action: "Arbitrage ".concat(g, ": buy at ").concat(T.price.toFixed(3), ", sell at ").concat(E.price.toFixed(3)),
urgency: 3,
createdAt: Game.time
});
}
(null !== (u = h.volatility) && void 0 !== u ? u : 0) >= this.config.highVolatilityThreshold && bo.warn("High volatility detected for ".concat(g, ": ").concat((100 * (null !== (m = h.volatility) && void 0 !== m ? m : 0)).toFixed(1), "%"), {
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
y && !y.done && (t = d.return) && t.call(d);
} finally {
if (e) throw e.error;
}
}
this.opportunities = f;
try {
for (var w = i(f), b = w.next(); !b.done; b = w.next()) {
var O = b.value;
O.urgency >= 2 && bo.info("Trading opportunity: ".concat(O.action, ", expected value: ").concat(O.expectedValue.toFixed(0), " credits, confidence: ").concat((100 * O.confidence).toFixed(0), "%"), {
subsystem: "MarketTrends"
});
}
} catch (e) {
r = {
error: e
};
} finally {
try {
b && !b.done && (o = w.return) && o.call(w);
} finally {
if (r) throw r.error;
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
}, a([ Nn("empire:marketTrends", "Market Trend Analyzer", {
priority: e.ProcessPriority.LOW,
interval: 500,
minBucket: 0,
cpuBudget: .02
}) ], t.prototype, "run", null), t = a([ kn() ], t);
}();

var Qu, Zu, $u = {
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
}, Ju = function() {
function t(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = n(n({}, $u), e);
}
return t.prototype.run = function() {
var e = this, t = Game.cpu.getUsed(), r = Rn.getEmpire();
this.lastRun = Game.time, r.lastUpdate = Game.time, Ii.measureSubsystem("empire:expansion", function() {
e.updateExpansionQueue(r);
}), Ii.measureSubsystem("empire:powerBanks", function() {
e.updatePowerBanks(r);
}), Ii.measureSubsystem("empire:warTargets", function() {
e.updateWarTargets(r);
}), Ii.measureSubsystem("empire:objectives", function() {
e.updateObjectives(r);
}), Ii.measureSubsystem("empire:intelRefresh", function() {
e.refreshRoomIntel(r);
}), Ii.measureSubsystem("empire:roomDiscovery", function() {
e.discoverNearbyRooms(r);
}), Ii.measureSubsystem("empire:gclTracking", function() {
e.trackGCLProgress(r);
}), Ii.measureSubsystem("empire:expansionReadiness", function() {
e.checkExpansionReadiness(r);
}), Ii.measureSubsystem("empire:nukeCandidates", function() {
e.refreshNukeCandidates(r);
}), Ii.measureSubsystem("empire:clusterHealth", function() {
e.monitorClusterHealth();
}), Ii.measureSubsystem("empire:powerBankProfitability", function() {
e.assessPowerBankProfitability(r);
});
var o = Game.cpu.getUsed() - t;
Game.time % 100 == 0 && jr.info("Empire tick completed in ".concat(o.toFixed(2), " CPU"), {
subsystem: "Empire"
});
}, t.prototype.cleanupClaimQueue = function(e, t) {
var r = e.claimQueue.length;
e.claimQueue = e.claimQueue.filter(function(e) {
return !t.has(e.roomName) || (jr.info("Removing ".concat(e.roomName, " from claim queue - now owned"), {
subsystem: "Empire"
}), !1);
}), e.claimQueue.length < r && jr.info("Cleaned up claim queue: removed ".concat(r - e.claimQueue.length, " owned room(s)"), {
subsystem: "Empire"
});
}, t.prototype.updateExpansionQueue = function(e) {
var t, r, o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), n = new Set(o.map(function(e) {
return e.name;
})), a = Game.gcl.level, s = Object.values(Game.spawns);
if (s.length > 0 && s[0].owner) {
var c = s[0].owner.username;
try {
for (var l = i(o), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
(d = e.knownRooms[m.name]) && d.owner !== c && (d.owner = c, jr.info("Updated room intel for ".concat(m.name, " - now owned by ").concat(c), {
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
if (this.cleanupClaimQueue(e, n), !(o.length >= a || a < this.config.minGclForExpansion || e.objectives.expansionPaused)) {
var p = [];
for (var f in e.knownRooms) {
var d;
if (!(d = e.knownRooms[f]).owner && !d.reserver && d.scouted) {
var y = this.scoreExpansionCandidate(d, o);
y >= this.config.minExpansionScore && p.push({
roomName: d.name,
score: y,
distance: this.getMinDistanceToOwned(d.name, o),
claimed: !1,
lastEvaluated: Game.time
});
}
}
p.sort(function(e, t) {
return t.score - e.score;
}), e.claimQueue = p.slice(0, 10), p.length > 0 && Game.time % 100 == 0 && jr.info("Expansion queue updated: ".concat(p.length, " candidates, top score: ").concat(p[0].score), {
subsystem: "Empire"
});
}
}, t.prototype.scoreExpansionCandidate = function(e, t) {
var r = 0;
2 === e.sources ? r += 40 : 1 === e.sources && (r += 20), r += oa(e.mineralType);
var o = this.getMinDistanceToOwned(e.name, t);
return o > this.config.maxExpansionDistance ? 0 : (r -= 5 * o, r -= na(e.name), 
r -= 15 * e.threatLevel, r += aa(e.terrain), ia(e.name) && (r += 10), r += sa(e.name), 
e.controllerLevel > 0 && !e.owner && (r += 2 * e.controllerLevel), r += ca(e.name, t, o), 
e.isHighway ? 0 : (e.isSK && (r -= 50), Math.max(0, r)));
}, t.prototype.getMinDistanceToOwned = function(e, t) {
var r, o, n = 1 / 0;
try {
for (var a = i(t), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = Game.map.getRoomLinearDistance(e, c.name);
l < n && (n = l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
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
}), jr.info("Power bank discovered in ".concat(r, ": ").concat(o.power, " power"), {
subsystem: "Empire"
}));
};
try {
for (var c = (o = void 0, i(a)), l = c.next(); !l.done; l = c.next()) s(l.value);
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
r.threatLevel >= 2 && !e.warTargets.includes(t) && (e.warTargets.push(t), jr.warn("Added war target: ".concat(t, " (threat level ").concat(r.threatLevel, ")"), {
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
jr.warn("War mode enabled due to active war targets", {
subsystem: "Empire"
})), 0 === e.warTargets.length && e.objectives.warMode && (e.objectives.warMode = !1, 
jr.info("War mode disabled - no active war targets", {
subsystem: "Empire"
}));
}, t.prototype.getNextExpansionTarget = function() {
var e = Rn.getEmpire().claimQueue.filter(function(e) {
return !e.claimed;
});
return e.length > 0 ? e[0] : null;
}, t.prototype.markExpansionClaimed = function(e) {
var t = Rn.getEmpire().claimQueue.find(function(t) {
return t.roomName === e;
});
t && (t.claimed = !0, jr.info("Marked expansion target as claimed: ".concat(e), {
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
t > 0 && Game.time % 500 == 0 && jr.info("Refreshed intel for ".concat(t, " rooms"), {
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
var s = 0;
try {
for (var c = i(a), l = c.next(); !l.done; l = c.next()) {
var u = pa(l.value.name, this.config.maxRoomDiscoveryDistance);
try {
for (var m = (o = void 0, i(u)), p = m.next(); !p.done; p = m.next()) {
var f = p.value;
if (s >= this.config.maxRoomsToDiscoverPerTick) return void jr.debug("Reached discovery limit of ".concat(this.config.maxRoomsToDiscoverPerTick, " rooms per tick"), {
subsystem: "Empire"
});
e.knownRooms[f] || (e.knownRooms[f] = this.createStubIntel(f), s++);
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
s > 0 && jr.info("Discovered ".concat(s, " nearby rooms for scouting"), {
subsystem: "Empire"
});
}
}
}, t.prototype.createStubIntel = function(e) {
var t = ua(e);
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
var f = c > s ? "swamp" : s > c ? "plains" : "mixed";
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
terrain: f,
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
t >= this.config.gclNotifyThreshold && Game.time % 500 == 0 && jr.info("GCL ".concat(Game.gcl.level, " progress: ").concat(t.toFixed(1), "% (").concat(Game.gcl.progress, "/").concat(Game.gcl.progressTotal, ")"), {
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
a < 5e4 ? e.objectives.expansionPaused || (e.objectives.expansionPaused = !0, jr.info("Expansion paused: insufficient energy reserves (".concat(a.toFixed(0), " < ").concat(5e4, ")"), {
subsystem: "Empire"
})) : e.objectives.expansionPaused && (e.objectives.expansionPaused = !1, jr.info("Expansion resumed: ".concat(o.length, " stable rooms with ").concat(a.toFixed(0), " avg energy"), {
subsystem: "Empire"
}));
} else e.objectives.expansionPaused || (e.objectives.expansionPaused = !0, jr.info("Expansion paused: waiting for stable room (RCL >= 4 with storage)", {
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
}), jr.info("Added nuke candidate: ".concat(t, " (score: ").concat(a, ")"), {
subsystem: "Empire"
}));
}, n = this;
try {
for (var a = i(e.warTargets), s = a.next(); !s.done; s = a.next()) o(s.value);
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
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
var e = Rn.getClusters(), t = Object.values(Game.rooms).filter(function(e) {
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
i < 3e4 && Game.time % 500 == 0 && jr.warn("Cluster ".concat(r, " has low energy: ").concat(i.toFixed(0), " avg (threshold: 30000)"), {
subsystem: "Empire"
}), c && Game.time % 500 == 0 && jr.warn("Cluster ".concat(r, " has high CPU usage: ").concat(s.toFixed(2), " per room"), {
subsystem: "Empire"
}), o.metrics || (o.metrics = {
energyIncome: 0,
energyConsumption: 0,
energyBalance: 0,
warIndex: 0,
economyIndex: 0
});
var l = Math.min(100, i / 1e5 * 100), u = n.length / o.memberRooms.length * 100;
o.metrics.economyIndex = Math.round((l + u) / 2), o.metrics.economyIndex < 40 && Game.time % 500 == 0 && jr.warn("Cluster ".concat(r, " economy index low: ").concat(o.metrics.economyIndex, " - consider rebalancing"), {
subsystem: "Empire"
});
};
for (var o in e) r(o);
}
}, t.prototype.assessPowerBankProfitability = function(e) {
var t, r, o, n, a, s;
if (Game.time % 100 == 0) {
var c = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (0 !== c.length) try {
for (var l = i(e.powerBanks), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
if (!m.active) {
var p = 1 / 0, f = null;
try {
for (var d = (o = void 0, i(c)), y = d.next(); !y.done; y = d.next()) {
var g = y.value, h = Game.map.getRoomLinearDistance(g.name, m.roomName);
h < p && (p = h, f = g);
}
} catch (e) {
o = {
error: e
};
} finally {
try {
y && !y.done && (n = d.return) && n.call(d);
} finally {
if (o) throw o.error;
}
}
if (f) {
var v = m.decayTick - Game.time, R = 50 * p * 2 + m.power / 2, E = v > 1.5 * R && p <= 5 && m.power >= 1e3 && (null !== (s = null === (a = f.controller) || void 0 === a ? void 0 : a.level) && void 0 !== s ? s : 0) >= 7;
E || Game.time % 500 != 0 ? E && Game.time % 500 == 0 && jr.info("Profitable power bank in ".concat(m.roomName, ": ") + "power=".concat(m.power, ", distance=").concat(p, ", timeRemaining=").concat(v), {
subsystem: "Empire"
}) : jr.debug("Power bank in ".concat(m.roomName, " not profitable: ") + "power=".concat(m.power, ", distance=").concat(p, ", timeRemaining=").concat(v, ", ") + "requiredTime=".concat(R.toFixed(0)), {
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
}, a([ Nn("empire:manager", "Empire Manager", {
priority: e.ProcessPriority.MEDIUM,
interval: 30,
minBucket: 0,
cpuBudget: .05
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), em = new Ju, tm = {
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
criticalResourceThresholds: (Qu = {}, Qu[RESOURCE_GHODIUM] = 5e3, Qu),
enabled: !0
}, rm = function() {
function e(e, t) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = n(n({}, tm), e), this.memoryAccessor = t;
}
return e.prototype.setMemoryAccessor = function(e) {
this.memoryAccessor = e;
}, e.prototype.run = function() {
this.config.enabled && (this.lastRun = Game.time, this.memoryAccessor && this.memoryAccessor.ensurePixelBuyingMemory(), 
this.isPurchaseCooldownComplete() && (this.hasSurplusResources() ? this.hasEnoughCredits() ? (this.attemptPixelPurchase(), 
this.updateMemory()) : jr.debug("Pixel buying skipped: insufficient credits", {
subsystem: "PixelBuying"
}) : jr.debug("Pixel buying skipped: no resource surplus", {
subsystem: "PixelBuying"
})));
}, e.prototype.getPixelBuyingMemory = function() {
var e;
return null === (e = this.memoryAccessor) || void 0 === e ? void 0 : e.getPixelBuyingMemory();
}, e.prototype.isPurchaseCooldownComplete = function() {
var e = this.getPixelBuyingMemory();
return !e || Game.time - e.lastPurchaseTick >= this.config.purchaseCooldown;
}, e.prototype.hasSurplusResources = function() {
var e, t, r, o, n, a, c = this.calculateTotalResources(), l = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}).length, u = l * this.config.energyThresholdPerRoom;
if (c.energy < u + this.config.minEnergySurplus) return jr.debug("Pixel buying: energy below surplus (".concat(c.energy, " < ").concat(u + this.config.minEnergySurplus, ")"), {
subsystem: "PixelBuying"
}), !1;
try {
for (var m = i(Object.entries(this.config.criticalResourceThresholds)), p = m.next(); !p.done; p = m.next()) {
var f = s(p.value, 2), d = f[0], y = f[1];
if ((R = null !== (n = c[d]) && void 0 !== n ? n : 0) < y) return jr.debug("Pixel buying: ".concat(d, " below threshold (").concat(R, " < ").concat(y, ")"), {
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
for (var h = i(g), v = h.next(); !v.done; v = h.next()) {
var R, E = v.value;
if ((R = null !== (a = c[E]) && void 0 !== a ? a : 0) < this.config.minBaseMineralReserve) return jr.debug("Pixel buying: ".concat(E, " below reserve (").concat(R, " < ").concat(this.config.minBaseMineralReserve, ")"), {
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
if (c <= 0) jr.debug("Cannot afford any pixels after reserve", {
subsystem: "PixelBuying"
}); else {
var l = o.roomName ? Game.market.calcTransactionCost(c, a.name, o.roomName) : 0;
if (a.terminal.store[RESOURCE_ENERGY] < l) jr.debug("Not enough energy for pixel transaction (need ".concat(l, ")"), {
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
}), jr.info("Purchased ".concat(c, " pixels at ").concat(o.price.toFixed(2), " credits each ") + "(total: ".concat(m.toFixed(0), " credits)").concat(n ? " (GOOD PRICE!)" : ""), {
subsystem: "PixelBuying"
});
} else jr.warn("Failed to purchase pixels: error code ".concat(u), {
subsystem: "PixelBuying"
});
}
}
} else jr.debug("No terminal available for pixel purchase", {
subsystem: "PixelBuying"
});
} else jr.debug("Pixel price (".concat(o.price, ") above target (").concat(this.config.targetPixelPrice, "), waiting"), {
subsystem: "PixelBuying"
});
} else jr.debug("No pixel orders below max price (".concat(this.config.maxPixelPrice, ")"), {
subsystem: "PixelBuying"
});
} else jr.debug("No pixel sell orders available", {
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
this.config = n(n({}, this.config), e);
}, e.prototype.getConfig = function() {
return n({}, this.config);
}, e.prototype.enable = function() {
this.config.enabled = !0, jr.info("Pixel buying enabled", {
subsystem: "PixelBuying"
});
}, e.prototype.disable = function() {
this.config.enabled = !1, jr.info("Pixel buying disabled", {
subsystem: "PixelBuying"
});
}, e;
}(), om = {
enabled: !0,
fullBucketTicksRequired: 25,
bucketMax: 1e4,
cpuCostPerPixel: 1e4,
minBucketAfterGeneration: 0
}, nm = function() {
function e(e, t) {
void 0 === e && (e = {}), this.config = n(n({}, om), e), this.memoryAccessor = t;
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
e.consecutiveFullTicks = 0, e.bucketFullSince = 0, jr.info("Generated pixel from CPU bucket (total generated: ".concat(e.totalPixelsGenerated, ")"), {
subsystem: "PixelGeneration",
meta: {
bucket: Game.cpu.bucket,
ticksWaited: r
}
});
} else jr.warn("Failed to generate pixel: error code ".concat(t), {
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
this.config.enabled = !0, jr.info("Pixel generation enabled", {
subsystem: "PixelGeneration"
});
}, e.prototype.disable = function() {
this.config.enabled = !1, jr.info("Pixel generation disabled", {
subsystem: "PixelGeneration"
});
}, e.prototype.updateConfig = function(e) {
this.config = n(n({}, this.config), e);
}, e.prototype.getConfig = function() {
return n({}, this.config);
}, e;
}(), am = {
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
}, im = 1e7, sm = 5e6, cm = ((Zu = {})[STRUCTURE_SPAWN] = 15e3, Zu[STRUCTURE_TOWER] = 5e3, 
Zu[STRUCTURE_STORAGE] = 3e4, Zu[STRUCTURE_TERMINAL] = 1e5, Zu[STRUCTURE_LAB] = 5e4, 
Zu[STRUCTURE_NUKER] = 1e5, Zu[STRUCTURE_POWER_SPAWN] = 1e5, Zu[STRUCTURE_OBSERVER] = 8e3, 
Zu[STRUCTURE_EXTENSION] = 3e3, Zu[STRUCTURE_LINK] = 5e3, Zu);

function lm(e) {
return !!e.threatenedStructures && e.threatenedStructures.some(function(e) {
return e.includes(STRUCTURE_SPAWN) || e.includes(STRUCTURE_STORAGE) || e.includes(STRUCTURE_TERMINAL);
});
}

function um(e, t, r) {
t.timeToLand < 5e3 ? (r.posture = "evacuate", jr.warn("EVACUATION TRIGGERED for ".concat(e.name, ": Critical structures threatened by nuke!"), {
subsystem: "Nuke"
})) : ("war" !== r.posture && "evacuate" !== r.posture && (r.posture = "defensive"), 
jr.warn("NUKE DEFENSE PREPARATION in ".concat(e.name, ": Critical structures in blast radius"), {
subsystem: "Nuke"
})), r.pheromones.defense = 100;
}

function mm() {
var e, t = 0, r = 0;
for (var o in Game.rooms) {
var n = Game.rooms[o];
(null === (e = n.controller) || void 0 === e ? void 0 : e.my) && (n.storage && (t += n.storage.store.getUsedCapacity(RESOURCE_ENERGY) || 0), 
n.terminal && (t += n.terminal.store.getUsedCapacity(RESOURCE_ENERGY) || 0, r += n.terminal.store.getUsedCapacity(RESOURCE_GHODIUM) || 0));
}
return t >= 6e5 && r >= 1e4;
}

function pm(e, t, r, o) {
var n = 0, a = [], i = t.knownRooms[e];
if (!i) return {
roomName: e,
score: 0,
reasons: [ "No intel" ]
};
i.controllerLevel && (n += 3 * i.controllerLevel, a.push("RCL ".concat(i.controllerLevel))), 
i.towerCount && (n += 5 * i.towerCount, a.push("".concat(i.towerCount, " towers"))), 
i.spawnCount && (n += 10 * i.spawnCount, a.push("".concat(i.spawnCount, " spawns"))), 
i.owner && "" !== i.owner && (n += 30, a.push("Owned room"));
var l = o(e);
if (l) {
var u = Math.floor(l.pheromones.war / 10);
u > 0 && (n += u, a.push("War intensity: ".concat(l.pheromones.war)));
}
i.isHighway && (n += 10, a.push("Highway (strategic)")), i.threatLevel >= 2 && (n += 20, 
a.push("High threat"));
var m = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
if (m.length > 0) {
var p = Math.min.apply(Math, c([], s(m.map(function(t) {
return Game.map.getRoomLinearDistance(e, t.name);
})), !1));
n -= 2 * p, a.push("".concat(p, " rooms away"));
}
t.warTargets.includes(e) && (n += 15, a.push("War target"));
var f = new RoomPosition(25, 25, e), d = dm(e, f, t);
return d >= r.roiThreshold ? (n += Math.min(20, Math.floor(5 * d)), a.push("ROI: ".concat(d.toFixed(1), "x"))) : (n -= 20, 
a.push("Low ROI: ".concat(d.toFixed(1), "x"))), {
roomName: e,
score: n,
reasons: a
};
}

function fm(e, t, r) {
var o, n, a = {
estimatedDamage: 0,
estimatedValue: 0,
threatenedStructures: []
}, s = Game.rooms[e];
if (!s) {
var c = r.knownRooms[e];
if (c) {
var l = 5 * (c.towerCount || 0) + 10 * (c.spawnCount || 0) + 5;
a.estimatedDamage = im + sm * l, a.estimatedValue = .01 * a.estimatedDamage;
}
return a;
}
var u = s.lookForAtArea(LOOK_STRUCTURES, Math.max(0, t.y - 2), Math.max(0, t.x - 2), Math.min(49, t.y + 2), Math.min(49, t.x + 2), !0);
try {
for (var m = i(u), p = m.next(); !p.done; p = m.next()) {
var f = p.value.structure, d = Math.abs(f.pos.x - t.x), y = Math.abs(f.pos.y - t.y), g = 0 === Math.max(d, y) ? im : sm;
f.hits <= g ? (a.estimatedDamage += f.hits, a.threatenedStructures.push("".concat(f.structureType, "-").concat(f.pos.x, ",").concat(f.pos.y)), 
a.estimatedValue += ym(f)) : a.estimatedDamage += g;
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
return a;
}

function dm(e, t, r) {
var o = fm(e, t, r);
return 0 === o.estimatedValue ? 0 : o.estimatedValue / 305e3;
}

function ym(e) {
return cm[e.structureType] || 1e3;
}

function gm(e, t, r) {
var o, n, a, s = null;
try {
for (var c = i(Object.values(t)), l = c.next(); !l.done; l = c.next()) {
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
if (!s) return jr.warn("Cannot deploy siege squad for nuke on ".concat(e.targetRoom, ": No clusters available"), {
subsystem: "Nuke"
}), !1;
var p = t[s.id];
if (!p) return !1;
var f = null === (a = p.squads) || void 0 === a ? void 0 : a.find(function(t) {
return "siege" === t.type && t.targetRooms.includes(e.targetRoom);
});
if (f) return e.siegeSquadId = f.id, !0;
var d = r(e.targetRoom);
d && (d.pheromones.siege = Math.min(100, d.pheromones.siege + 80), d.pheromones.war = Math.min(100, d.pheromones.war + 60), 
jr.info("Siege pheromones increased for ".concat(e.targetRoom, " to coordinate with nuke strike"), {
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
return p.squads || (p.squads = []), p.squads.push(g), e.siegeSquadId = y, jr.warn("SIEGE SQUAD DEPLOYED: Squad ".concat(y, " will coordinate with nuke on ").concat(e.targetRoom), {
subsystem: "Nuke"
}), !0;
}

var hm = function() {
function e(e, t) {
void 0 === e && (e = {}), this.nukerReadyLogged = new Set, this.config = n(n({}, am), e), 
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
var n, a, s = Game.rooms[o];
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
}, a = function(e, t) {
var r, o, n = [], a = e.lookForAtArea(LOOK_STRUCTURES, Math.max(0, t.y - 2), Math.max(0, t.x - 2), Math.min(49, t.y + 2), Math.min(49, t.x + 2), !0);
try {
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value.structure, u = Math.abs(l.pos.x - t.x), m = Math.abs(l.pos.y - t.y), p = Math.max(u, m);
if (p <= 2) {
var f = 0 === p ? im : sm;
l.hits <= f && n.push("".concat(l.structureType, "-").concat(l.pos.x, ",").concat(l.pos.y));
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
n.threatenedStructures = a, e.incomingNukes.push(n), c.nukeDetected || (c.nukeDetected = !0, 
c.pheromones.defense = Math.min(100, c.pheromones.defense + 50), c.pheromones.siege = Math.min(100, c.pheromones.siege + 30), 
c.danger = 3, jr.warn("INCOMING NUKE DETECTED in ".concat(o, "! ") + "Landing at (".concat(t.pos.x, ", ").concat(t.pos.y, "), impact in ").concat(t.timeToLand, " ticks. ") + "Source: ".concat(t.launchRoomName || "unknown", ". ") + "Threatened structures: ".concat(a.length), {
subsystem: "Nuke"
}), c.eventLog.push({
type: "nuke_incoming",
time: Game.time,
details: "Impact in ".concat(t.timeToLand, " ticks at (").concat(t.pos.x, ",").concat(t.pos.y, ")")
}), c.eventLog.length > 20 && c.eventLog.shift());
}
};
try {
for (var m = (n = void 0, i(l)), p = m.next(); !p.done; p = m.next()) u(p.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
p && !p.done && (a = m.return) && a.call(m);
} finally {
if (n) throw n.error;
}
}
} else c.nukeDetected && (c.nukeDetected = !1, jr.info("Nuke threat cleared in ".concat(o), {
subsystem: "Nuke"
}));
};
for (var n in Game.rooms) o(n);
}(t, this.getSwarmState), this.handleEvacuations(t), function(e, t, r, o) {
var n, a, s;
if (e.incomingNukes && 0 !== e.incomingNukes.length) try {
for (var c = i(e.incomingNukes), l = c.next(); !l.done; l = c.next()) {
var u = l.value;
if (u.sourceRoom && !e.warTargets.includes(u.sourceRoom)) {
var m = e.knownRooms[u.sourceRoom];
if (m && !(m.controllerLevel < 8)) {
var p = r(u.roomName);
if (p && !(p.pheromones.war < t.counterNukeWarThreshold)) if (o()) {
if (!e.warTargets.includes(u.sourceRoom)) for (var f in e.warTargets.push(u.sourceRoom), 
jr.warn("COUNTER-NUKE AUTHORIZED: ".concat(u.sourceRoom, " added to war targets for nuke retaliation"), {
subsystem: "Nuke"
}), Game.rooms) if (null === (s = Game.rooms[f].controller) || void 0 === s ? void 0 : s.my) {
var d = r(f);
d && (d.pheromones.war = Math.min(100, d.pheromones.war + 30));
}
} else jr.warn("Counter-nuke desired against ".concat(u.sourceRoom, " but insufficient resources"), {
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
l && !l.done && (a = c.return) && a.call(c);
} finally {
if (n) throw n.error;
}
}
}(t, this.config, this.getSwarmState, mm), function(e, t, r, o) {
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
var f = "".concat(i, "-nuker");
0 === u && 0 === m ? r.has(f) || (jr.info("Nuker in ".concat(i, " is fully loaded and ready to launch"), {
subsystem: "Nuke"
}), r.add(f)) : r.delete(f);
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
(n > 0 || a > 0) && jr.debug("Nuker in ".concat(t, " needs ").concat(n, " energy, ").concat(a, " ghodium"), {
subsystem: "Nuke"
});
}
}
}
}(), function(e, t, r) {
var o, n;
if (e.nukeCandidates = [], e.objectives.warMode) {
try {
for (var a = i(e.warTargets), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = pm(c, e, t, r);
l.score >= t.minScore && (e.nukeCandidates.push({
roomName: c,
score: l.score,
launched: !1,
launchTick: 0
}), jr.info("Nuke candidate: ".concat(c, " (score: ").concat(l.score, ") - ").concat(l.reasons.join(", ")), {
subsystem: "Nuke"
}));
}
} catch (e) {
o = {
error: e
};
} finally {
try {
s && !s.done && (n = a.return) && n.call(a);
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
r.lastROI = n / o, r.nukesLaunched > 0 && r.nukesLaunched % 5 == 0 && jr.info("Nuke economics: ".concat(r.nukesLaunched, " nukes, ROI: ").concat(null === (t = r.lastROI) || void 0 === t ? void 0 : t.toFixed(2), "x, ") + "Value destroyed: ".concat((r.totalValueDestroyed / 1e3).toFixed(0), "k"), {
subsystem: "Nuke"
});
}
}
}(t), function(e, t, r, o) {
var n, a, s, c, l, u, m;
if (e.objectives.warMode && e.nukesInFlight && 0 !== e.nukesInFlight.length) {
var p = r();
try {
for (var f = i(e.nukesInFlight), d = f.next(); !d.done; d = f.next()) {
var y = d.value, g = y.impactTick - Game.time;
y.siegeSquadId || g <= t.siegeCoordinationWindow && g > 0 && gm(y, p, o) && jr.info("Siege squad deployment coordinated with nuke on ".concat(y.targetRoom, ", ") + "impact in ".concat(g, " ticks"), {
subsystem: "Nuke"
});
}
} catch (e) {
n = {
error: e
};
} finally {
try {
d && !d.done && (a = f.return) && a.call(f);
} finally {
if (n) throw n.error;
}
}
try {
for (var h = i(Object.values(p)), v = h.next(); !v.done; v = h.next()) {
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
o && !o.siegeSquadId && (o.siegeSquadId = t.id, jr.info("Linked siege squad ".concat(t.id, " with nuke on ").concat(r), {
subsystem: "Nuke"
}));
};
try {
for (var C = (l = void 0, i(E)), S = C.next(); !S.done; S = C.next()) T(S.value);
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
var r, o, n, a, l, u;
if (e.nukesInFlight && 0 !== e.nukesInFlight.length) {
var m = new Map;
try {
for (var p = i(e.nukesInFlight), f = p.next(); !f.done; f = p.next()) {
var d = f.value, y = m.get(d.targetRoom) || [];
y.push(d), m.set(d.targetRoom, y);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
try {
for (var g = i(m.entries()), h = g.next(); !h.done; h = g.next()) {
var v = s(h.value, 2), R = v[0], E = v[1];
if (!(E.length < 2)) {
var T = E.map(function(e) {
return e.impactTick;
}), C = Math.min.apply(Math, c([], s(T), !1)), S = Math.max.apply(Math, c([], s(T), !1)) - C;
if (S <= t.salvoSyncWindow) {
var w = E[0].salvoId || "salvo-".concat(R, "-").concat(C);
try {
for (var b = (l = void 0, i(E)), O = b.next(); !O.done; O = b.next()) (d = O.value).salvoId = w;
} catch (e) {
l = {
error: e
};
} finally {
try {
O && !O.done && (u = b.return) && u.call(b);
} finally {
if (l) throw l.error;
}
}
jr.info("Nuke salvo ".concat(w, " coordinated: ").concat(E.length, " nukes on ").concat(R, ", impact spread: ").concat(S, " ticks"), {
subsystem: "Nuke"
});
} else jr.warn("Nukes on ".concat(R, " not synchronized (spread: ").concat(S, " ticks > ").concat(t.salvoSyncWindow, ")"), {
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
h && !h.done && (a = g.return) && a.call(g);
} finally {
if (n) throw n.error;
}
}
}
}(t, this.config), function(e, t) {
var r, o, n, a, s;
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
for (var m = i(e.nukeCandidates), p = m.next(); !p.done; p = m.next()) {
var f = p.value;
if (!f.launched) {
try {
for (var d = (n = void 0, i(c)), y = d.next(); !y.done; y = d.next()) {
var g = y.value;
if (!(Game.map.getRoomLinearDistance(g.room.name, f.roomName) > 10)) {
var h = new RoomPosition(25, 25, f.roomName), v = fm(f.roomName, h, e), R = dm(f.roomName, h, e);
if (R < t.roiThreshold) jr.warn("Skipping nuke launch on ".concat(f.roomName, ": ROI ").concat(R.toFixed(2), "x below threshold ").concat(t.roiThreshold, "x"), {
subsystem: "Nuke"
}); else {
var E = g.launchNuke(h);
if (E === OK) {
f.launched = !0, f.launchTick = Game.time;
var T = {
id: "".concat(g.room.name, "-").concat(f.roomName, "-").concat(Game.time),
sourceRoom: g.room.name,
targetRoom: f.roomName,
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
e.nukeEconomics.lastLaunchTick = Game.time, jr.warn("NUKE LAUNCHED from ".concat(g.room.name, " to ").concat(f.roomName, "! ") + "Impact in ".concat(t.nukeFlightTime, " ticks. ") + "Predicted damage: ".concat((v.estimatedDamage / 1e6).toFixed(1), "M hits, ") + "value: ".concat((v.estimatedValue / 1e3).toFixed(0), "k, ROI: ").concat(R.toFixed(2), "x"), {
subsystem: "Nuke"
});
var C = c.indexOf(g);
C > -1 && c.splice(C, 1);
break;
}
jr.error("Failed to launch nuke: ".concat(E), {
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
y && !y.done && (a = d.return) && a.call(d);
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
r > 0 && jr.info("Cleaned up ".concat(r, " impacted nuke alert(s)"), {
subsystem: "Nuke"
});
}
}(t);
}, e.prototype.handleEvacuations = function(e) {
var t, r;
if (e.incomingNukes) try {
for (var o = i(e.incomingNukes), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (!a.evacuationTriggered && lm(a)) {
var s = Game.rooms[a.roomName];
if (s) {
var c = this.getSwarmState(a.roomName);
c && (um(s, a, c), a.evacuationTriggered = !0);
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
var f = Game.map.getRoomLinearDistance(l, e);
c.push({
room: l,
amount: p,
distance: f
});
}
}
}
}
return 0 === c.length ? null : (c.sort(function(e, t) {
return e.distance - t.distance;
}), null !== (s = null === (i = c[0]) || void 0 === i ? void 0 : i.room) && void 0 !== s ? s : null);
}(e, t, r, o);
a ? n.requestTransfer(a, e, t, r, o.terminalPriority) && jr.info("Requested ".concat(r, " ").concat(t, " transfer from ").concat(a, " to ").concat(e, " for nuker"), {
subsystem: "Nuke"
}) : jr.debug("No donor room found for ".concat(r, " ").concat(t, " to ").concat(e), {
subsystem: "Nuke"
});
}(e, t, r, this.config, Yu);
}, e.prototype.getConfig = function() {
return n({}, this.config);
}, e.prototype.updateConfig = function(e) {
this.config = n(n({}, this.config), e);
}, e;
}(), vm = {
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
}, Rm = new (function() {
function t(e) {
void 0 === e && (e = {}), this.coordinator = new hm(n(n({}, vm), e), {
getEmpire: function() {
return Rn.getEmpire();
},
getSwarmState: function(e) {
return Rn.getSwarmState(e);
},
getClusters: function() {
return Rn.getClusters();
}
});
}
return t.prototype.run = function() {
this.coordinator.run();
}, t.prototype.getConfig = function() {
return this.coordinator.getConfig();
}, t.prototype.updateConfig = function(e) {
this.coordinator.updateConfig(e);
}, a([ Nn("empire:nuke", "Nuke Manager", {
priority: e.ProcessPriority.LOW,
interval: 500,
minBucket: 0,
cpuBudget: .01
}) ], t.prototype, "run", null), a([ kn() ], t);
}()), Em = function() {
function e() {}
return e.prototype.ensurePixelBuyingMemory = function() {
var e = Rn.getEmpire();
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
var e = Rn.getEmpire();
if (e.market) return e.market.pixelBuying;
}, e;
}(), Tm = new (function(t) {
function r(e) {
return void 0 === e && (e = {}), t.call(this, e, new Em) || this;
}
return o(r, t), r.prototype.run = function() {
t.prototype.run.call(this);
}, a([ Nn("empire:pixelBuying", "Pixel Buying Manager", {
priority: e.ProcessPriority.IDLE,
interval: 200,
minBucket: 0,
cpuBudget: .01
}) ], r.prototype, "run", null), a([ kn() ], r);
}(rm)), Cm = function() {
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
}(), Sm = new (function(t) {
function r(e) {
return void 0 === e && (e = {}), t.call(this, e, new Cm) || this;
}
return o(r, t), r.prototype.run = function() {
t.prototype.run.call(this);
}, a([ Nn("empire:pixelGeneration", "Pixel Generation Manager", {
priority: e.ProcessPriority.IDLE,
interval: 1,
minBucket: 0,
cpuBudget: .01
}) ], r.prototype, "run", null), a([ kn() ], r);
}(nm));

function wm(e, t) {
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

function bm(e, t, r) {
var o, n = Rn.getSwarmState(e);
if (n) {
var a = null !== (o = n.remoteAssignments) && void 0 !== o ? o : [], i = a.indexOf(t);
if (-1 !== i) {
a.splice(i, 1), n.remoteAssignments = a;
var s = Rn.getEmpire().knownRooms[t];
s && (s.threatLevel = 3, s.lastSeen = Game.time), jr.warn("Removed remote room ".concat(t, " from ").concat(e, " due to: ").concat(r), {
subsystem: "RemoteRoomManager"
});
}
}
}

function Om(e) {
var t, r, o, n = Rn.getSwarmState(e);
if (n) {
var a = null !== (o = n.remoteAssignments) && void 0 !== o ? o : [];
if (0 !== a.length) try {
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.rooms[l];
if (u) {
var m = wm(u);
m.lost && m.reason && bm(e, l, m.reason);
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

var _m = {
updateInterval: 50,
minBucket: 0,
maxSitesPerRemotePerTick: 2
}, xm = function() {
function t(e) {
void 0 === e && (e = {}), this.config = n(n({}, _m), e);
}
return t.prototype.run = function() {
var e, t, r, o, n, a = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Rn.getSwarmState(l.name);
if (u) {
Om(l.name);
var m = null !== (n = u.remoteAssignments) && void 0 !== n ? n : [];
if (0 !== m.length) {
try {
for (var p = (r = void 0, i(m)), f = p.next(); !f.done; f = p.next()) {
var d = f.value;
this.planRemoteInfrastructure(l, d);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = p.return) && o.call(p);
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
}, t.prototype.planRemoteInfrastructure = function(e, t) {
var r, o, n = Game.rooms[t];
if (n) {
var a = n.controller, s = this.getMyUsername();
if (a) {
if (a.owner && a.owner.username !== s) return;
if (a.reservation && a.reservation.username !== s) return;
}
var c = n.find(FIND_SOURCES), l = 0;
try {
for (var u = i(c), m = u.next(); !m.done; m = u.next()) {
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
if (!r) return jr.warn("Could not find valid position for container at source ".concat(t.id, " in ").concat(e.name), {
subsystem: "RemoteInfra"
}), !1;
if (e.find(FIND_CONSTRUCTION_SITES).length >= 5) return !1;
var o = e.createConstructionSite(r.x, r.y, STRUCTURE_CONTAINER);
return o === OK ? (jr.info("Placed container construction site at source ".concat(t.id, " in ").concat(e.name), {
subsystem: "RemoteInfra"
}), !0) : (jr.debug("Failed to place container at source ".concat(t.id, " in ").concat(e.name, ": ").concat(o), {
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
var r, o, n = xc(e, t), a = n.get(e.name);
a && this.placeRoadsInRoom(e, a);
try {
for (var s = i(t), c = s.next(); !c.done; c = s.next()) {
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
var r, o, n = e.find(FIND_CONSTRUCTION_SITES), a = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_ROAD;
}
});
if (!(n.length >= 5)) {
var c = new Set(a.map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), l = new Set(n.filter(function(e) {
return e.structureType === STRUCTURE_ROAD;
}).map(function(e) {
return "".concat(e.pos.x, ",").concat(e.pos.y);
})), u = e.getTerrain(), m = 0;
try {
for (var p = i(t), f = p.next(); !f.done; f = p.next()) {
var d = f.value;
if (m >= 3) break;
if (n.length + m >= 5) break;
if (!c.has(d) && !l.has(d)) {
var y = s(d.split(","), 2), g = y[0], h = y[1], v = parseInt(g, 10), R = parseInt(h, 10);
u.get(v, R) !== TERRAIN_MASK_WALL && e.createConstructionSite(v, R, STRUCTURE_ROAD) === OK && m++;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
m > 0 && jr.debug("Placed ".concat(m, " remote road construction sites in ").concat(e.name), {
subsystem: "RemoteInfra"
});
}
}, t.prototype.getMyUsername = function() {
var e = Object.values(Game.spawns);
return e.length > 0 ? e[0].owner.username : "";
}, a([ An("remote:infrastructure", "Remote Infrastructure Manager", {
priority: e.ProcessPriority.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .05
}) ], t.prototype, "run", null), a([ kn() ], t);
}(), Um = new xm, Am = {
updateInterval: 50,
minBucket: 0,
maxCpuBudget: .01
}, Nm = function() {
function r(e) {
void 0 === e && (e = {}), this.lastRun = 0, this.config = n(n({}, Am), e);
}
return r.prototype.run = function() {
this.lastRun = Game.time;
var e = InterShardMemory.getLocal();
if (e) {
var r = t.deserializeInterShardMemory(e);
if (r) {
this.updateEnemyIntelligence(r);
var o = t.serializeInterShardMemory(r);
InterShardMemory.setLocal(o);
}
}
}, r.prototype.updateEnemyIntelligence = function(e) {
var t, r, o, n;
if (e) {
var a = Rn.getEmpire(), s = new Map;
if (e.globalTargets.enemies) try {
for (var c = i(e.globalTargets.enemies), l = c.next(); !l.done; l = c.next()) {
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
if (a.warTargets) try {
for (var m = i(a.warTargets), p = m.next(); !p.done; p = m.next()) {
var f = p.value;
(y = s.get(f)) ? (y.lastSeen = Game.time, y.threatLevel = Math.max(y.threatLevel, 1)) : s.set(f, {
username: f,
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
p && !p.done && (n = m.return) && n.call(m);
} finally {
if (o) throw o.error;
}
}
if (a.knownRooms) for (var d in a.knownRooms) {
var y, g = a.knownRooms[d];
g && g.owner && !g.owner.includes("Source Keeper") && ((y = s.get(g.owner)) ? (y.rooms.includes(d) || y.rooms.push(d), 
y.lastSeen = Math.max(y.lastSeen, g.lastSeen), y.threatLevel = Math.max(y.threatLevel, g.threatLevel)) : s.set(g.owner, {
username: g.owner,
rooms: [ d ],
threatLevel: g.threatLevel,
lastSeen: g.lastSeen,
isAlly: !1
}));
}
if (e.globalTargets.enemies = Array.from(s.values()), Game.time % 500 == 0) {
var h = e.globalTargets.enemies.length, v = e.globalTargets.enemies.filter(function(e) {
return e.threatLevel >= 2;
}).length;
jr.info("Cross-shard intel: ".concat(h, " enemies tracked, ").concat(v, " high threat"), {
subsystem: "CrossShardIntel"
});
}
}
}, r.prototype.getGlobalEnemies = function() {
var e = InterShardMemory.getLocal();
if (!e) return [];
var r = t.deserializeInterShardMemory(e);
return r && r.globalTargets.enemies || [];
}, a([ Nn("empire:crossShardIntel", "Cross-Shard Intel", {
priority: e.ProcessPriority.LOW,
interval: 50,
minBucket: 0,
cpuBudget: .01
}) ], r.prototype, "run", null), a([ kn() ], r);
}(), Mm = new Nm, km = {
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
}, Pm = function() {
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
}(), Im = function() {
function e(e) {
void 0 === e && (e = {}), this.trackers = new Map, this.config = n(n({}, km), e);
}
return e.prototype.getTracker = function(e) {
var t = this.trackers.get(e);
return t || (t = {
energyHarvested: new Pm(10),
energySpawning: new Pm(10),
energyConstruction: new Pm(10),
energyRepair: new Pm(10),
energyTower: new Pm(10),
controllerProgress: new Pm(10),
hostileCount: new Pm(5),
damageReceived: new Pm(5),
idleWorkers: new Pm(10),
lastControllerProgress: 0
}, this.trackers.set(e, t)), t;
}, e.prototype.updateMetrics = function(e, t) {
var r, o, n, a, s, c, l, u, m = this.getTracker(e.name), p = "sources_".concat(e.name), f = global[p];
f && f.tick === Game.time ? u = f.sources : (u = e.find(FIND_SOURCES), global[p] = {
sources: u,
tick: Game.time
});
var d = 0, y = 0;
try {
for (var g = i(u), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
d += v.energyCapacity, y += v.energy;
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
var R = d - y;
if (m.energyHarvested.add(R), null === (l = e.controller) || void 0 === l ? void 0 : l.my) {
var E = e.controller.progress - m.lastControllerProgress;
E > 0 && E < 1e5 && m.controllerProgress.add(E), m.lastControllerProgress = e.controller.progress;
}
var T = Ya(e, FIND_HOSTILE_CREEPS);
m.hostileCount.add(T.length);
var C = 0;
try {
for (var S = i(T), w = S.next(); !w.done; w = S.next()) {
var b = w.value;
try {
for (var O = (s = void 0, i(b.body)), _ = O.next(); !_.done; _ = O.next()) {
var x = _.value;
x.hits > 0 && (x.type === ATTACK ? C += 30 : x.type === RANGED_ATTACK && (C += 10));
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
n = {
error: e
};
} finally {
try {
w && !w.done && (a = S.return) && a.call(S);
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
for (var a = i(Object.keys(n)), s = a.next(); !s.done; s = a.next()) {
var c = s.value, l = this.config.decayFactors[c];
n[c] = this.clamp(n[c] * l);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
s && !s.done && (o = a.return) && o.call(a);
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
var f = a.energyHarvested.get() - e.metrics.energySpawning;
f > 0 && 0 === e.danger && (n.expand = this.clamp(n.expand + Math.min(f / 100, 10)));
}, e.prototype.clamp = function(e) {
return Math.max(this.config.minValue, Math.min(this.config.maxValue, e));
}, e.prototype.onHostileDetected = function(e, t, r) {
e.danger = r, e.pheromones.defense = this.clamp(e.pheromones.defense + 5 * t), r >= 2 && (e.pheromones.war = this.clamp(e.pheromones.war + 10 * r)), 
r >= 3 && (e.pheromones.siege = this.clamp(e.pheromones.siege + 20)), jr.info("Hostile detected: ".concat(t, " hostiles, danger=").concat(r), {
room: e.role,
subsystem: "Pheromone"
});
}, e.prototype.updateDangerFromThreat = function(e, t, r) {
e.danger = r, e.pheromones.defense = this.clamp(t / 10), r >= 2 && (e.pheromones.war = this.clamp(e.pheromones.war + 10 * r)), 
r >= 3 && (e.pheromones.siege = this.clamp(e.pheromones.siege + 20));
}, e.prototype.diffuseDangerToCluster = function(e, t, r) {
var o, n, a;
try {
for (var s = i(r), c = s.next(); !c.done; c = s.next()) {
var l = c.value;
if (l !== e) {
var u = Game.rooms[l];
if (null === (a = null == u ? void 0 : u.controller) || void 0 === a ? void 0 : a.my) {
var m = u.memory.swarm;
if (m) {
var p = this.clamp(t / 10), f = m.pheromones.defense, d = .05 * Math.max(0, p - f);
m.pheromones.defense = this.clamp(f + d);
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
var t, r, o, n, a, c, l, u, m = [];
try {
for (var p = i(e), f = p.next(); !f.done; f = p.next()) {
var d = s(f.value, 2), y = d[0], g = d[1], h = this.getNeighborRoomNames(y);
try {
for (var v = (o = void 0, i(h)), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
if (e.get(E)) try {
for (var T = (a = void 0, i([ "defense", "war", "expand", "siege" ])), C = T.next(); !C.done; C = T.next()) {
var S = C.value, w = g.pheromones[S];
if (w > 1) {
var b = this.config.diffusionRates[S];
m.push({
source: y,
target: E,
type: S,
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
C && !C.done && (c = T.return) && c.call(T);
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
f && !f.done && (r = p.return) && r.call(p);
} finally {
if (t) throw t.error;
}
}
try {
for (var O = i(m), _ = O.next(); !_.done; _ = O.next()) {
var x = _.value, U = e.get(x.target);
if (U) {
var A = U.pheromones[x.type] + x.amount;
U.pheromones[x.type] = this.clamp(Math.min(A, x.sourceIntensity));
}
}
} catch (e) {
l = {
error: e
};
} finally {
try {
_ && !_.done && (u = O.return) && u.call(O);
} finally {
if (l) throw l.error;
}
}
}, e.prototype.getNeighborRoomNames = function(e) {
var t = e.match(/^([WE])(\d+)([NS])(\d+)$/);
if (!t) return [];
var r = s(t, 5), o = r[1], n = r[2], a = r[3], i = r[4];
if (!(o && n && a && i)) return [];
var c = parseInt(n, 10), l = parseInt(i, 10), u = [];
return "N" === a ? u.push("".concat(o).concat(c, "N").concat(l + 1)) : l > 0 ? u.push("".concat(o).concat(c, "S").concat(l - 1)) : u.push("".concat(o).concat(c, "N0")), 
"S" === a ? u.push("".concat(o).concat(c, "S").concat(l + 1)) : l > 0 ? u.push("".concat(o).concat(c, "N").concat(l - 1)) : u.push("".concat(o).concat(c, "S0")), 
"E" === o ? u.push("E".concat(c + 1).concat(a).concat(l)) : c > 0 ? u.push("W".concat(c - 1).concat(a).concat(l)) : u.push("E0".concat(a).concat(l)), 
"W" === o ? u.push("W".concat(c + 1).concat(a).concat(l)) : c > 0 ? u.push("E".concat(c - 1).concat(a).concat(l)) : u.push("W0".concat(a).concat(l)), 
u;
}, e.prototype.getDominantPheromone = function(e) {
var t, r, o = null, n = 1;
try {
for (var a = i(Object.keys(e)), s = a.next(); !s.done; s = a.next()) {
var c = s.value;
e[c] > n && (n = e[c], o = c);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
return o;
}, e;
}(), Gm = new Im, Lm = function() {
function t() {}
return t.prototype.cleanupMemory = function() {
for (var e in Memory.creeps) Game.creeps[e] || delete Memory.creeps[e];
}, t.prototype.checkMemorySize = function() {
var e = RawMemory.get().length, t = 2097152, r = e / t * 100;
r > 90 ? bo.error("Memory usage critical: ".concat(r.toFixed(1), "% (").concat(e, "/").concat(t, " bytes)"), {
subsystem: "Memory"
}) : r > 75 && bo.warn("Memory usage high: ".concat(r.toFixed(1), "% (").concat(e, "/").concat(t, " bytes)"), {
subsystem: "Memory"
});
}, t.prototype.updateMemorySegmentStats = function() {
Di.run();
}, t.prototype.runPheromoneDiffusion = function() {
var e, t, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), o = new Map;
try {
for (var n = i(r), a = n.next(); !a.done; a = n.next()) {
var s = a.value, c = Rn.getSwarmState(s.name);
c && o.set(s.name, c);
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
Gm.applyDiffusion(o);
}, t.prototype.initializeLabConfigs = function() {
var e, t, r = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
try {
for (var o = i(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
Io.initialize(a.name);
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
}, t.prototype.precacheRoomPaths = function() {}, a([ Nn("core:memoryCleanup", "Memory Cleanup", {
priority: e.ProcessPriority.LOW,
interval: 50,
cpuBudget: .01
}) ], t.prototype, "cleanupMemory", null), a([ Mn("core:memorySizeCheck", "Memory Size Check", {
interval: 100,
cpuBudget: .005
}) ], t.prototype, "checkMemorySize", null), a([ An("core:memorySegmentStats", "Memory Segment Stats", {
priority: e.ProcessPriority.IDLE,
interval: 10,
cpuBudget: .01
}) ], t.prototype, "updateMemorySegmentStats", null), a([ An("cluster:pheromoneDiffusion", "Pheromone Diffusion", {
priority: e.ProcessPriority.MEDIUM,
interval: 10,
cpuBudget: .02
}) ], t.prototype, "runPheromoneDiffusion", null), a([ Nn("room:labConfig", "Lab Config Manager", {
priority: e.ProcessPriority.LOW,
interval: 200,
cpuBudget: .01
}) ], t.prototype, "initializeLabConfigs", null), a([ Mn("room:pathCachePrecache", "Path Cache Precache (Disabled)", {
interval: 1e3,
cpuBudget: .01
}) ], t.prototype, "precacheRoomPaths", null), a([ kn() ], t);
}(), Dm = new Lm, Fm = wo("NativeCallsTracker");

function Bm(e, t, r) {
var o = e[t];
if (o && !o.__nativeCallsTrackerWrapped) {
var n = Object.getOwnPropertyDescriptor(e, t);
if (n && !1 === n.configurable) Fm.warn("Cannot wrap method - property is not configurable", {
meta: {
methodName: t
}
}); else try {
var a = function() {
for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
return Ii.recordNativeCall(r), o.apply(this, e);
};
a.__nativeCallsTrackerWrapped = !0, Object.defineProperty(e, t, {
value: a,
writable: !0,
enumerable: !0,
configurable: !0
});
} catch (e) {
Fm.warn("Failed to wrap method", {
meta: {
methodName: t,
error: String(e)
}
});
}
}
}

function Hm(e) {
return null !== e && "object" == typeof e && "pos" in e && e.pos instanceof RoomPosition && "room" in e && e.room instanceof Room;
}

var Wm = new Set([ "harvester", "upgrader", "mineralHarvester", "depositHarvester", "factoryWorker", "labTech", "builder" ]), Ym = {
harvester: e.ProcessPriority.CRITICAL,
queenCarrier: e.ProcessPriority.CRITICAL,
hauler: e.ProcessPriority.HIGH,
guard: e.ProcessPriority.HIGH,
healer: e.ProcessPriority.HIGH,
soldier: e.ProcessPriority.HIGH,
ranger: e.ProcessPriority.HIGH,
siegeUnit: e.ProcessPriority.HIGH,
harasser: e.ProcessPriority.HIGH,
powerQueen: e.ProcessPriority.HIGH,
powerWarrior: e.ProcessPriority.HIGH,
larvaWorker: e.ProcessPriority.HIGH,
builder: e.ProcessPriority.MEDIUM,
upgrader: e.ProcessPriority.MEDIUM,
interRoomCarrier: e.ProcessPriority.MEDIUM,
scout: e.ProcessPriority.MEDIUM,
claimer: e.ProcessPriority.MEDIUM,
engineer: e.ProcessPriority.MEDIUM,
remoteHarvester: e.ProcessPriority.MEDIUM,
powerHarvester: e.ProcessPriority.MEDIUM,
powerCarrier: e.ProcessPriority.MEDIUM,
remoteHauler: e.ProcessPriority.LOW,
remoteWorker: e.ProcessPriority.LOW,
linkManager: e.ProcessPriority.LOW,
terminalManager: e.ProcessPriority.LOW,
mineralHarvester: e.ProcessPriority.LOW,
labTech: e.ProcessPriority.IDLE,
factoryWorker: e.ProcessPriority.IDLE
};

function Km(t) {
var r;
return null !== (r = Ym[t]) && void 0 !== r ? r : e.ProcessPriority.MEDIUM;
}

var jm = function() {
function t() {
this.registeredCreeps = new Set, this.lastSyncTick = -1;
}
return t.prototype.syncCreepProcesses = function() {
var e, t;
if (this.lastSyncTick !== Game.time) {
this.lastSyncTick = Game.time;
var r = new Set, o = 0, n = 0, a = 0, s = Object.keys(Game.creeps).length;
for (var c in Game.creeps) {
var l = Game.creeps[c];
l.spawning ? a++ : (r.add(c), this.registeredCreeps.has(c) || (this.registerCreepProcess(l), 
o++));
}
try {
for (var u = i(this.registeredCreeps), m = u.next(); !m.done; m = u.next()) c = m.value, 
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
(o > 0 || n > 0 || Game.time % 10 == 0 || p) && bo.info("CreepProcessManager: ".concat(r.size, " active, ").concat(a, " spawning, ").concat(s, " total (registered: ").concat(o, ", unregistered: ").concat(n, ")"), {
subsystem: "CreepProcessManager",
meta: {
activeCreeps: r.size,
spawningCreeps: a,
totalCreeps: s,
registeredThisTick: o,
unregisteredThisTick: n
}
});
}
}, t.prototype.registerCreepProcess = function(e) {
var t = e.memory.role, r = Km(t), o = "creep:".concat(e.name);
On.registerProcess({
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
if ((Game.time % 10 == 0 || o) && bo.info("Executing role for creep ".concat(e.name, " (").concat(t.role, ")"), {
subsystem: "CreepProcessManager",
creep: e.name
}), function(e) {
var t = e.memory;
if (!Wm.has(t.role)) return !1;
var r = t.state;
if (!r || !r.startTick) return !1;
if (Game.time - r.startTick < 3) return !1;
switch (t.role) {
case "harvester":
return function(e, t) {
if ("harvest" !== t.action && "transfer" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
if (!r || !Hm(r)) return !1;
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
return !(!r || !Hm(r) || !e.pos.inRangeTo(r.pos, 3) || "upgrade" === t.action && 0 === e.store.getUsedCapacity(RESOURCE_ENERGY) || "withdraw" === t.action && 0 === e.store.getFreeCapacity(RESOURCE_ENERGY));
}(e, r);

case "mineralHarvester":
return function(e, t) {
if ("harvestMineral" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
return !(!r || !Hm(r) || !e.pos.isNearTo(r.pos) || 0 === e.store.getFreeCapacity());
}(e, r);

case "builder":
return function(e, t) {
if ("build" !== t.action) return !1;
if (!t.targetId) return !1;
var r = Game.getObjectById(t.targetId);
return !(!r || !Hm(r) || !e.pos.inRangeTo(r.pos, 3) || 0 === e.store.getUsedCapacity(RESOURCE_ENERGY));
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
if (!r || !Hm(r)) return !1;
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
Ii.measureSubsystem("role:".concat(i), function() {
switch (a) {
case "economy":
default:
!function(e) {
var t = ys(e);
Vs(e, Xs(t, ic), t);
}(e);
break;

case "military":
!function(e) {
var t = ys(e);
Vs(e, Xs(t, ml), t);
}(e);
break;

case "utility":
!function(e) {
var t = ys(e);
Vs(e, Xs(t, El), t);
}(e);
break;

case "power":
!function(e) {
var t = ys(e);
Vs(e, Xs(t, yl), t);
}(e);
}
});
} catch (t) {
bo.error("EXCEPTION in role execution for ".concat(e.name, " (").concat(i, "/").concat(a, "): ").concat(t), {
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
}), this.registeredCreeps.add(e.name), bo.info("Registered creep process: ".concat(e.name, " (").concat(t, ") with priority ").concat(r), {
subsystem: "CreepProcessManager"
});
}, t.prototype.unregisterCreepProcess = function(e) {
var t = "creep:".concat(e);
On.unregisterProcess(t), this.registeredCreeps.delete(e), bo.info("Unregistered creep process: ".concat(e), {
subsystem: "CreepProcessManager"
});
}, t.prototype.getMinBucketForPriority = function(e) {
return 0;
}, t.prototype.getCpuBudgetForPriority = function(t) {
return t >= e.ProcessPriority.CRITICAL ? .012 : t >= e.ProcessPriority.HIGH ? .01 : t >= e.ProcessPriority.MEDIUM ? .008 : .006;
}, t.prototype.getStats = function() {
var t, r, o, n, a = {};
try {
for (var s = i(this.registeredCreeps), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = Game.creeps[l];
if (u) {
var m = Km(u.memory.role), p = null !== (o = e.ProcessPriority[m]) && void 0 !== o ? o : "UNKNOWN";
a[p] = (null !== (n = a[p]) && void 0 !== n ? n : 0) + 1;
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
return {
totalCreeps: Object.keys(Game.creeps).length,
registeredCreeps: this.registeredCreeps.size,
creepsByPriority: a
};
}, t.prototype.forceResync = function() {
this.lastSyncTick = -1, this.syncCreepProcesses();
}, t.prototype.reset = function() {
this.registeredCreeps.clear(), this.lastSyncTick = -1;
}, t;
}(), Vm = new jm, qm = {
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
}, zm = {
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
}, Xm = {
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
}, Qm = function() {
function e() {
this.STRUCTURE_CACHE_NAMESPACE = "evolution:structures", this.structureCacheTtl = 20;
}
return e.prototype.determineEvolutionStage = function(e, t, r) {
var o, n, a, i, s = null !== (n = null === (o = t.controller) || void 0 === o ? void 0 : o.level) && void 0 !== n ? n : 0, c = Game.gcl.level, l = this.getStructureCounts(t), u = null !== (i = null === (a = e.remoteAssignments) || void 0 === a ? void 0 : a.length) && void 0 !== i ? i : 0;
return this.meetsThreshold("empireDominance", s, r, c, l, u) ? "empireDominance" : this.meetsThreshold("fortifiedHive", s, r, c, l, u) ? "fortifiedHive" : this.meetsThreshold("matureColony", s, r, c, l, u) ? "matureColony" : this.meetsThreshold("foragingExpansion", s, r, c, l, u) ? "foragingExpansion" : "seedNest";
}, e.prototype.meetsThreshold = function(e, t, r, o, n, a) {
var i, s, c = qm[e], l = null !== (i = n[STRUCTURE_TOWER]) && void 0 !== i ? i : 0, u = null !== (s = n[STRUCTURE_LAB]) && void 0 !== s ? s : 0;
return !(t < c.rcl || c.minRooms && r < c.minRooms || c.minGcl && o < c.minGcl || c.minRemoteRooms && a < c.minRemoteRooms || c.minTowerCount && l < c.minTowerCount || c.requiresStorage && !n[STRUCTURE_STORAGE] || c.requiresTerminal && t >= 6 && !n[STRUCTURE_TERMINAL] || c.requiresLabs && 0 === u || c.minLabCount && t >= 6 && u < c.minLabCount || c.requiresFactory && t >= 7 && !n[STRUCTURE_FACTORY] || c.requiresPowerSpawn && t >= 7 && !n[STRUCTURE_POWER_SPAWN] || c.requiresObserver && t >= 8 && !n[STRUCTURE_OBSERVER] || c.requiresNuker && t >= 8 && !n[STRUCTURE_NUKER]);
}, e.prototype.getStructureCounts = function(e) {
var t, r, o, n = xs.get(e.name, {
namespace: this.STRUCTURE_CACHE_NAMESPACE,
ttl: this.structureCacheTtl
});
if (n) return n;
var a = {}, s = e.find(FIND_MY_STRUCTURES);
try {
for (var c = i(s), l = c.next(); !l.done; l = c.next()) {
var u = l.value.structureType;
a[u] = (null !== (o = a[u]) && void 0 !== o ? o : 0) + 1;
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
return xs.set(e.name, a, {
namespace: this.STRUCTURE_CACHE_NAMESPACE,
ttl: this.structureCacheTtl
}), a;
}, e.prototype.updateEvolutionStage = function(e, t, r) {
var o = this.determineEvolutionStage(e, t, r);
return o !== e.colonyLevel && (jr.info("Room evolution: ".concat(e.colonyLevel, " -> ").concat(o), {
room: t.name,
subsystem: "Evolution"
}), e.colonyLevel = o, !0);
}, e.prototype.updateMissingStructures = function(e, t) {
var r, o, n, a, i, s, c, l, u, m, p, f, d = this.getStructureCounts(t), y = null !== (o = null === (r = t.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0, g = qm[e.colonyLevel], h = g.requiresLabs && y >= 6, v = h ? null !== (n = g.minLabCount) && void 0 !== n ? n : 3 : 0, R = g.requiresFactory && y >= 7, E = g.requiresTerminal && y >= 6, T = g.requiresStorage && y >= 4, C = g.requiresPowerSpawn && y >= 7, S = g.requiresObserver && y >= 8, w = g.requiresNuker && y >= 8;
e.missingStructures = {
spawn: 0 === (null !== (a = d[STRUCTURE_SPAWN]) && void 0 !== a ? a : 0),
storage: !!T && 0 === (null !== (i = d[STRUCTURE_STORAGE]) && void 0 !== i ? i : 0),
terminal: !!E && 0 === (null !== (s = d[STRUCTURE_TERMINAL]) && void 0 !== s ? s : 0),
labs: !!h && (null !== (c = d[STRUCTURE_LAB]) && void 0 !== c ? c : 0) < v,
nuker: !!w && 0 === (null !== (l = d[STRUCTURE_NUKER]) && void 0 !== l ? l : 0),
factory: !!R && 0 === (null !== (u = d[STRUCTURE_FACTORY]) && void 0 !== u ? u : 0),
extractor: y >= 6 && 0 === (null !== (m = d[STRUCTURE_EXTRACTOR]) && void 0 !== m ? m : 0),
powerSpawn: !!C && 0 === (null !== (p = d[STRUCTURE_POWER_SPAWN]) && void 0 !== p ? p : 0),
observer: !!S && 0 === (null !== (f = d[STRUCTURE_OBSERVER]) && void 0 !== f ? f : 0)
};
}, e;
}(), Zm = function() {
function e() {}
return e.prototype.determinePosture = function(e, t) {
if (t) return t;
var r = e.pheromones, o = e.danger;
return o >= 3 ? "siege" : o >= 2 ? "war" : r.siege > 30 ? "siege" : r.war > 25 ? "war" : r.defense > 20 ? "defensive" : r.nukeTarget > 40 ? "nukePrep" : r.expand > 30 && 0 === o ? "expand" : o >= 1 ? "defensive" : "eco";
}, e.prototype.updatePosture = function(e, t, r) {
var o = this.determinePosture(e, t);
if (o !== e.posture) {
var n = e.posture, a = null != r ? r : e.role;
return jr.info("Posture change: ".concat(n, " -> ").concat(o), {
room: a,
subsystem: "Posture"
}), e.posture = o, On.emit("posture.change", {
roomName: a,
oldPosture: n,
newPosture: o,
source: "PostureManager"
}), !0;
}
return !1;
}, e.prototype.getSpawnProfile = function(e) {
return zm[e];
}, e.prototype.getResourcePriorities = function(e) {
return Xm[e];
}, e.prototype.allowsBuilding = function(e) {
return "evacuate" !== e && "siege" !== e;
}, e.prototype.allowsUpgrading = function(e) {
return "evacuate" !== e && "siege" !== e && "war" !== e;
}, e.prototype.isCombatPosture = function(e) {
return "defensive" === e || "war" === e || "siege" === e;
}, e.prototype.allowsExpansion = function(e) {
return "eco" === e || "expand" === e;
}, e;
}(), $m = new Qm, Jm = new Zm;

function ep(e) {
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

var tp = {
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
}, rp = {
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
}, op = {
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
}, np = {
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
}, ap = {
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

function ip(e, t, r) {
for (var o = e.getTerrain(), n = -1; n <= 1; n++) for (var a = -1; a <= 1; a++) {
var i = t + n, s = r + a;
if (i < 1 || i > 48 || s < 1 || s > 48) return !1;
if (o.get(i, s) === TERRAIN_MASK_WALL) return !1;
}
return !0;
}

function sp(e, t, r) {
var o, n, a, s, c, l = e.getTerrain(), u = null !== (c = r.minSpaceRadius) && void 0 !== c ? c : 7, m = 0, p = 0;
if (t.x < u || t.x > 49 - u || t.y < u || t.y > 49 - u) return {
fits: !1,
reason: "Anchor too close to room edge (needs ".concat(u, " tile margin)")
};
try {
for (var f = i(r.structures), d = f.next(); !d.done; d = f.next()) {
var y = d.value, g = t.x + y.x, h = t.y + y.y;
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
d && !d.done && (n = f.return) && n.call(f);
} finally {
if (o) throw o.error;
}
}
try {
for (var v = i(r.roads), R = v.next(); !R.done; R = v.next()) {
var E = R.value;
g = t.x + E.x, h = t.y + E.y, g < 1 || g > 48 || h < 1 || h > 48 || (p++, l.get(g, h) === TERRAIN_MASK_WALL && m++);
}
} catch (e) {
a = {
error: e
};
} finally {
try {
R && !R.done && (s = v.return) && s.call(v);
} finally {
if (a) throw a.error;
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

function cp(e, t) {
var r, o, n, a, s, c = e.controller;
if (!c) return null;
var l = e.find(FIND_SOURCES), u = c.pos.x, m = c.pos.y;
try {
for (var p = i(l), f = p.next(); !f.done; f = p.next()) u += (A = f.value).pos.x, 
m += A.pos.y;
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
for (var d = Math.round(u / (l.length + 1)), y = Math.round(m / (l.length + 1)), g = null !== (s = t.minSpaceRadius) && void 0 !== s ? s : 7, h = [], v = 0; v <= 15; v++) {
for (var R = -v; R <= v; R++) for (var E = -v; E <= v; E++) if (!(Math.abs(R) !== v && Math.abs(E) !== v && v > 0)) {
var T = d + R, C = y + E;
if (!(T < g || T > 49 - g || C < g || C > 49 - g)) {
var S = new RoomPosition(T, C, e.name), w = sp(e, S, t);
if (w.fits) {
var b = 1e3, O = S.getRangeTo(c);
O >= 4 && O <= 8 ? b += 100 : O < 4 ? b -= 50 : O > 12 && (b -= 30);
var _ = 0;
try {
for (var x = (n = void 0, i(l)), U = x.next(); !U.done; U = x.next()) {
var A = U.value;
_ += S.getRangeTo(A);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
U && !U.done && (a = x.return) && a.call(x);
} finally {
if (n) throw n.error;
}
}
var N = _ / l.length;
N >= 5 && N <= 10 ? b += 80 : N < 5 && (b -= 20);
var M = Math.abs(T - 25) + Math.abs(C - 25);
if (M < 10 ? b += 50 : M > 20 && (b -= 30), void 0 !== w.wallCount && void 0 !== w.totalTiles) {
var k = w.wallCount / w.totalTiles * 100;
b += Math.max(0, 50 - 2 * k);
}
h.push({
pos: S,
score: b
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

function lp(e, t) {
var r, o = ep(t), n = {}, a = e.structures.filter(function(e) {
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
return c(c([], s(e), !1), s(a), !1);
}(a, i)), a;
}

function up(e) {
return function(e) {
return e >= 7 ? np : e >= 5 ? op : e >= 3 ? rp : tp;
}(e);
}

function mp(e, t) {
if (t >= 8) {
var r = cp(e, ap);
if (r) return {
blueprint: ap,
anchor: r
};
if (o = cp(e, np)) return {
blueprint: np,
anchor: o
};
}
var o;
if (t >= 7 && (o = cp(e, np))) return {
blueprint: np,
anchor: o
};
if (t >= 5) {
var n = cp(e, op);
if (n) return {
blueprint: op,
anchor: n
};
}
if (t >= 3) {
var a = cp(e, rp);
if (a) return {
blueprint: rp,
anchor: a
};
}
var s = cp(e, tp);
if (s) return {
blueprint: tp,
anchor: s
};
var c = function(e) {
var t, r, o = e.controller;
if (!o) return null;
var n = e.find(FIND_SOURCES), a = e.getTerrain(), s = o.pos.x, c = o.pos.y;
try {
for (var l = i(n), u = l.next(); !u.done; u = l.next()) {
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
for (var p = Math.round(s / (n.length + 1)), f = Math.round(c / (n.length + 1)), d = 0; d < 15; d++) for (var y = -d; y <= d; y++) for (var g = -d; g <= d; g++) if (Math.abs(y) === d || Math.abs(g) === d) {
var h = p + y, v = f + g;
if (!(h < 3 || h > 46 || v < 3 || v > 46) && ip(e, h, v)) {
if (Math.max(Math.abs(h - o.pos.x), Math.abs(v - o.pos.y)) > 20) continue;
if (a.get(h, v) === TERRAIN_MASK_WALL) continue;
return new RoomPosition(h, v, e.name);
}
}
return null;
}(e);
return c ? {
blueprint: tp,
anchor: c
} : null;
}

var pp = [ STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_TOWER, STRUCTURE_LAB, STRUCTURE_LINK, STRUCTURE_FACTORY, STRUCTURE_OBSERVER, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN, STRUCTURE_EXTRACTOR ], fp = new Set(pp);

function dp(e) {
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

var yp = {
info: function(e, t) {
return jr.info(e, t);
},
warn: function(e, t) {
return jr.warn(e, t);
},
error: function(e, t) {
return jr.error(e, t);
},
debug: function(e, t) {
return jr.debug(e, t);
}
}, gp = new (function() {
function e() {
this.manager = new Yo({
logger: yp
});
}
return e.prototype.getReaction = function(e) {
return this.manager.getReaction(e);
}, e.prototype.calculateReactionChain = function(e, t) {
return this.manager.calculateReactionChain(e, t);
}, e.prototype.hasResourcesForReaction = function(e, t, r) {
return void 0 === r && (r = 100), this.manager.hasResourcesForReaction(e, t, r);
}, e.prototype.planReactions = function(e, t) {
var r = dp(t);
return this.manager.planReactions(e, r);
}, e.prototype.scheduleCompoundProduction = function(e, t) {
var r = dp(t);
return this.manager.scheduleCompoundProduction(e, r);
}, e.prototype.executeReaction = function(e, t) {
this.manager.executeReaction(e, t);
}, e;
}());

function hp(e) {
return e >= 2 && e <= 3;
}

var vp = {
enablePheromones: !0,
enableEvolution: !0,
enableSpawning: !0,
enableConstruction: !0,
enableTowers: !0,
enableProcessing: !0
}, Rp = new Map, Ep = new Map;

function Tp(e) {
var t = Rp.get(e.name);
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
return Rp.set(e.name, o), o;
}

var Cp = function() {
function e(e, t) {
void 0 === t && (t = {}), this.roomName = e, this.config = n(n({}, vp), t);
}
return e.prototype.run = function(e) {
var t, r, o, n = Ii.startRoom(this.roomName), a = Game.rooms[this.roomName];
if (a && (null === (t = a.controller) || void 0 === t ? void 0 : t.my)) {
!function(e) {
var t, r, o;
if (null === (o = e.controller) || void 0 === o ? void 0 : o.my) {
e.storage && pi.set(e.storage.id, e.storage, {
namespace: di,
ttl: 10
}), e.terminal && pi.set(e.terminal.id, e.terminal, {
namespace: di,
ttl: 10
}), e.controller && pi.set(e.controller.id, e.controller, {
namespace: di,
ttl: 10
});
var n = e.find(FIND_SOURCES);
try {
for (var a = i(n), s = a.next(); !s.done; s = a.next()) {
var c = s.value;
pi.set(c.id, c, {
namespace: di,
ttl: 5
});
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
}
}(a);
var s = Rn.getOrInitSwarmState(this.roomName);
if (this.config.enablePheromones && Game.time % 5 == 0 && Gm.updateMetrics(a, s), 
this.updateThreatAssessment(a, s), Kc.assess(a, s), Vc.checkSafeMode(a, s), this.config.enableEvolution && ($m.updateEvolutionStage(s, a, e), 
$m.updateMissingStructures(s, a)), Jm.updatePosture(s), this.config.enablePheromones && Gm.updatePheromones(s, a), 
this.config.enableTowers && this.runTowerControl(a, s), this.config.enableConstruction && Jm.allowsBuilding(s.posture)) {
var c = hp(null !== (o = null === (r = a.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 1) ? 5 : 10;
Game.time % c === 0 && this.runConstruction(a, s);
}
this.config.enableProcessing && Game.time % 5 == 0 && this.runResourceProcessing(a, s);
var l = Game.cpu.getUsed() - n;
Ii.recordRoom(a, l), Ii.endRoom(this.roomName, n);
} else Ii.endRoom(this.roomName, n);
}, e.prototype.updateThreatAssessment = function(e, t) {
var r, o, n, a, l, u, m, p, f, d;
if (Game.time % 5 == 0) {
var y = Tp(e), g = y.spawns.length + y.towers.length, h = Ep.get(this.roomName);
h && h.lastTick < Game.time && g < h.lastStructureCount && (y.spawns.length < h.lastSpawns.length && On.emit("structure.destroyed", {
roomName: this.roomName,
structureType: STRUCTURE_SPAWN,
structureId: "unknown",
source: this.roomName
}), y.towers.length < h.lastTowers.length && On.emit("structure.destroyed", {
roomName: this.roomName,
structureType: STRUCTURE_TOWER,
structureId: "unknown",
source: this.roomName
})), Ep.set(this.roomName, {
lastStructureCount: g,
lastSpawns: c([], s(y.spawns), !1),
lastTowers: c([], s(y.towers), !1),
lastTick: Game.time
});
}
var v = Ya(e, FIND_HOSTILE_CREEPS);
!(v.length > 0 || t.danger > 0) || Ya(e, FIND_HOSTILE_STRUCTURES, {
filter: function(e) {
return e.structureType !== STRUCTURE_CONTROLLER;
}
});
try {
for (var R = i(v), E = R.next(); !E.done; E = R.next()) {
var T = E.value;
try {
for (var C = (n = void 0, i(T.body)), S = C.next(); !S.done; S = C.next()) {
var w = S.value;
w.hits > 0 && (w.type === ATTACK || (w.type, RANGED_ATTACK));
}
} catch (e) {
n = {
error: e
};
} finally {
try {
S && !S.done && (a = C.return) && a.call(C);
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
E && !E.done && (o = R.return) && o.call(R);
} finally {
if (r) throw r.error;
}
}
if (v.length > 0) {
var b = pc(e), O = b.dangerLevel;
if (O > t.danger) {
if (Gm.updateDangerFromThreat(t, b.threatScore, b.dangerLevel), t.clusterId) {
var _ = Rn.getCluster(t.clusterId);
_ && Gm.diffuseDangerToCluster(e.name, b.threatScore, _.memberRooms);
}
Rn.addRoomEvent(this.roomName, "hostileDetected", "".concat(v.length, " hostiles, danger=").concat(O, ", score=").concat(b.threatScore));
try {
for (var x = i(v), U = x.next(); !U.done; U = x.next()) T = U.value, On.emit("hostile.detected", {
roomName: this.roomName,
hostileId: T.id,
hostileOwner: T.owner.username,
bodyParts: T.body.length,
threatLevel: O,
source: this.roomName
});
} catch (e) {
l = {
error: e
};
} finally {
try {
U && !U.done && (u = x.return) && u.call(x);
} finally {
if (l) throw l.error;
}
}
}
t.danger = O;
} else t.danger > 0 && (On.emit("hostile.cleared", {
roomName: this.roomName,
source: this.roomName
}), t.danger = 0);
if (Game.time % 10 == 0) {
var A = e.find(FIND_NUKES);
if (A.length > 0) {
if (!t.nukeDetected) {
Gm.onNukeDetected(t);
var N = null !== (d = null === (f = A[0]) || void 0 === f ? void 0 : f.launchRoomName) && void 0 !== d ? d : "unidentified source";
Rn.addRoomEvent(this.roomName, "nukeDetected", "".concat(A.length, " nuke(s) incoming from ").concat(N)), 
t.nukeDetected = !0;
try {
for (var M = i(A), k = M.next(); !k.done; k = M.next()) {
var P = k.value;
On.emit("nuke.detected", {
roomName: this.roomName,
nukeId: P.id,
landingTick: Game.time + P.timeToLand,
launchRoomName: P.launchRoomName,
source: this.roomName
});
}
} catch (e) {
m = {
error: e
};
} finally {
try {
k && !k.done && (p = M.return) && p.call(M);
} finally {
if (m) throw m.error;
}
}
}
} else t.nukeDetected = !1;
}
}, e.prototype.runTowerControl = function(e, t) {
var r, o, n, a, s = Tp(e).towers;
if (0 !== s.length) {
var c = Ya(e, FIND_HOSTILE_CREEPS), l = c.length > 0 ? this.selectTowerTarget(c) : null, u = function(r) {
if (r.store.getUsedCapacity(RESOURCE_ENERGY) < 10) return "continue";
if (l) return r.attack(l), "continue";
var o;
if ("siege" !== t.posture && (o = r.pos.findClosestByRange(FIND_MY_CREEPS, {
filter: function(e) {
return e.hits < e.hitsMax;
}
}))) return r.heal(o), "continue";
if (!Jm.isCombatPosture(t.posture) && (o = r.pos.findClosestByRange(FIND_STRUCTURES, {
filter: function(e) {
return e.hits < .8 * e.hitsMax && e.structureType !== STRUCTURE_WALL && e.structureType !== STRUCTURE_RAMPART;
}
}))) return r.repair(o), "continue";
if (!Jm.isCombatPosture(t.posture) && 0 === c.length) {
var i = Rc(null !== (a = null === (n = e.controller) || void 0 === n ? void 0 : n.level) && void 0 !== a ? a : 1, t.danger), s = r.pos.findClosestByRange(FIND_STRUCTURES, {
filter: function(e) {
return (e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART) && e.hits < i;
}
});
s && r.repair(s);
}
};
try {
for (var m = i(s), p = m.next(); !p.done; p = m.next()) u(p.value);
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
for (var n = i(e.body), a = n.next(); !a.done; a = n.next()) if (a.value.boost) {
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
}, e.prototype.runConstruction = function(e, t) {
var r, o, n, a = Tp(e), l = a.constructionSites;
if (!(l.length >= 10)) {
var u = null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 1, m = a.spawns[0], p = null == m ? void 0 : m.pos;
if (m) {
var f = mp(e, u);
if (f) p = f.anchor; else {
if (!up(u)) return;
p = m.pos;
}
var d = null !== (n = null == f ? void 0 : f.blueprint) && void 0 !== n ? n : up(u);
if (d && p) {
if (!Jm.isCombatPosture(t.posture)) {
var y = function(e, t, r, o, n) {
var a, s;
void 0 === n && (n = []);
var c = function(e, t, r, o) {
var n, a, s, c, l, u, m;
void 0 === o && (o = []);
var p = null !== (u = null === (l = e.controller) || void 0 === l ? void 0 : l.level) && void 0 !== u ? u : 1, f = lp(r, p), d = e.getTerrain(), y = [], g = new Map;
try {
for (var h = i(f), v = h.next(); !v.done; v = h.next()) {
var R = v.value, E = t.x + R.x, T = t.y + R.y;
if (!(E < 1 || E > 48 || T < 1 || T > 48) && d.get(E, T) !== TERRAIN_MASK_WALL) {
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
v && !v.done && (a = h.return) && a.call(h);
} finally {
if (n) throw n.error;
}
}
var S = Mc(e, t, r.roads, o);
if (g.set(STRUCTURE_ROAD, S), p >= 6) {
var w = e.find(FIND_MINERALS);
if (w.length > 0) {
var b = w[0], O = new Set;
O.add("".concat(b.pos.x, ",").concat(b.pos.y)), g.set(STRUCTURE_EXTRACTOR, O);
}
}
var _ = e.find(FIND_STRUCTURES, {
filter: function(e) {
return fp.has(e.structureType) && (!0 === e.my || e.structureType === STRUCTURE_ROAD);
}
});
try {
for (var x = i(_), U = x.next(); !U.done; U = x.next()) {
var A = U.value, N = (C = "".concat(A.pos.x, ",").concat(A.pos.y), A.structureType), M = g.get(N);
M && M.has(C) || y.push({
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
U && !U.done && (c = x.return) && c.call(x);
} finally {
if (s) throw s.error;
}
}
return y;
}(e, t, r, n), l = 0;
try {
for (var u = i(c), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = p.structure, d = p.reason;
if (l >= 1) break;
f.destroy() === OK && (l++, jr.info("Destroyed misplaced structure: ".concat(d), {
subsystem: "Blueprint",
room: f.room.name,
meta: {
structureType: f.structureType,
pos: f.pos.toString(),
reason: d
}
}));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
m && !m.done && (s = u.return) && s.call(u);
} finally {
if (a) throw a.error;
}
}
return l;
}(e, p, d, 0, t.remoteAssignments);
if (y > 0) {
var g = 1 === y ? "structure" : "structures";
Rn.addRoomEvent(this.roomName, "structureDestroyed", "".concat(y, " misplaced ").concat(g, " destroyed for blueprint compliance"));
}
}
var h = {
sitesPlaced: 0,
wallsRemoved: 0
};
if (u >= 2 && l.length < 8) {
var v = hp(u) ? 5 : 3;
(h = function(e, t, r, o, n, a) {
var l, u, m, p, f, d;
if (void 0 === n && (n = 3), void 0 === a && (a = []), o < 2) return {
sitesPlaced: 0,
wallsRemoved: 0
};
var y = function(e, t, r, o) {
var n, a, l, u;
void 0 === o && (o = []);
var m = Mc(e, t, r, o), p = function(e) {
var t, r, o, n, a, l, u, m = Game.map.getRoomTerrain(e), p = [], f = [], d = function(e) {
var t, r, o = [], n = Game.map.getRoomTerrain(e), a = Game.rooms[e], s = new Set;
if (a) {
var c = a.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_WALL || e.structureType === STRUCTURE_RAMPART;
}
});
try {
for (var l = i(c), u = l.next(); !u.done; u = l.next()) {
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
for (var f = 1; f < 49; f++) n.get(0, f) === TERRAIN_MASK_WALL || s.has("0,".concat(f)) || o.push({
x: 0,
y: f,
exitDirection: "left",
isChokePoint: !1
});
for (f = 1; f < 49; f++) n.get(49, f) === TERRAIN_MASK_WALL || s.has("49,".concat(f)) || o.push({
x: 49,
y: f,
exitDirection: "right",
isChokePoint: !1
});
return o;
}(e), y = new Map;
try {
for (var g = i(d), h = g.next(); !h.done; h = g.next()) {
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
for (var R = i(y), E = R.next(); !E.done; E = R.next()) {
for (var T = s(E.value, 2), C = T[0], S = c([], s(T[1]), !1).sort(function(e, t) {
return e.x === t.x ? e.y - t.y : e.x - t.x;
}), w = [], b = [], O = 0; O < S.length; O++) {
v = S[O];
var _ = S[O - 1];
!(_ && Math.abs(v.x - _.x) <= 1 && Math.abs(v.y - _.y) <= 1) && b.length > 0 && (w.push(b), 
b = []), b.push(v);
}
b.length > 0 && w.push(b);
try {
for (var x = (a = void 0, i(w)), U = x.next(); !U.done; U = x.next()) {
var A = U.value, N = Math.floor(A.length / 2);
for (O = 0; O < A.length; O++) {
var M = (v = A[O]).x, k = v.y;
switch (C) {
case "top":
k = 2;
break;

case "bottom":
k = 47;
break;

case "left":
M = 2;
break;

case "right":
M = 47;
}
m.get(M, k) !== TERRAIN_MASK_WALL && (A.length >= 4 && (O === N || O === N - 1) ? f.push({
x: M,
y: k,
exitDirection: C,
isChokePoint: !1
}) : p.push({
x: M,
y: k,
exitDirection: C,
isChokePoint: !1
}));
}
}
} catch (e) {
a = {
error: e
};
} finally {
try {
U && !U.done && (l = x.return) && l.call(x);
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
E && !E.done && (n = R.return) && n.call(R);
} finally {
if (o) throw o.error;
}
}
return {
walls: p,
ramparts: f
};
}(e.name), f = [], d = [], y = c([], s(p.ramparts), !1);
try {
for (var g = i(p.walls), h = g.next(); !h.done; h = g.next()) {
var v = h.value, R = "".concat(v.x, ",").concat(v.y);
m.has(R) ? (f.push(v), y.push(v)) : d.push(v);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (a = g.return) && a.call(g);
} finally {
if (n) throw n.error;
}
}
var E = [], T = e.find(FIND_STRUCTURES);
try {
for (var C = i(T), S = C.next(); !S.done; S = C.next()) {
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
walls: d,
ramparts: y,
roadCrossings: f,
wallsToRemove: E
};
}(e, t, r, a), g = e.find(FIND_MY_CONSTRUCTION_SITES), h = e.find(FIND_STRUCTURES);
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
}).length, S = o >= 2 ? 2500 : 0, w = o >= 2 ? 2500 : 0;
if (o >= 3 && y.wallsToRemove.length > 0) {
var b = function(e) {
var t = h.find(function(t) {
return t.structureType === STRUCTURE_WALL && t.pos.x === e.x && t.pos.y === e.y;
});
if (t && !h.some(function(t) {
return t.structureType === STRUCTURE_RAMPART && t.pos.x === e.x && t.pos.y === e.y;
})) {
var r = t.destroy();
r === OK ? (R++, bo.info("Removed wall at (".concat(e.x, ",").concat(e.y, ") to allow road passage"), {
subsystem: "Defense"
})) : bo.warn("Failed to remove wall at (".concat(e.x, ",").concat(e.y, "): ").concat(r), {
subsystem: "Defense"
});
}
};
try {
for (var O = i(y.wallsToRemove), _ = O.next(); !_.done; _ = O.next()) b(_.value);
} catch (e) {
l = {
error: e
};
} finally {
try {
_ && !_.done && (u = O.return) && u.call(O);
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
r || o || e.createConstructionSite(t.x, t.y, STRUCTURE_WALL) === OK && (v++, bo.debug("Placed perimeter wall at (".concat(t.x, ",").concat(t.y, ")"), {
subsystem: "Defense"
}));
};
try {
for (var U = i(y.walls), A = U.next(); !A.done && "break" !== x(A.value); A = U.next()) ;
} catch (e) {
m = {
error: e
};
} finally {
try {
A && !A.done && (p = U.return) && p.call(U);
} finally {
if (m) throw m.error;
}
}
}
if (o >= 3 && v < E && C < w) {
var N = function(t) {
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
}) ? bo.debug("Placed rampart at road crossing (".concat(t.x, ",").concat(t.y, ")"), {
subsystem: "Defense"
}) : bo.debug("Placed rampart gap at (".concat(t.x, ",").concat(t.y, ")"), {
subsystem: "Defense"
}));
};
try {
for (var M = i(y.ramparts), k = M.next(); !k.done && "break" !== N(k.value); k = M.next()) ;
} catch (e) {
f = {
error: e
};
} finally {
try {
k && !k.done && (d = M.return) && d.call(M);
} finally {
if (f) throw f.error;
}
}
}
return {
sitesPlaced: v,
wallsRemoved: R
};
}(e, p, d.roads, u, v, t.remoteAssignments)).wallsRemoved > 0 && Rn.addRoomEvent(this.roomName, "wallRemoved", "".concat(h.wallsRemoved, " wall(s) removed to allow road passage"));
}
var R = function(e, t, r) {
var o, n, a, l, u, m, p, f, d, y, g, h, v, R, E = null !== (y = null === (d = e.controller) || void 0 === d ? void 0 : d.level) && void 0 !== y ? y : 1, T = lp(r, E), C = e.getTerrain(), S = [];
if (E >= 6) {
var w = e.find(FIND_MINERALS);
if (w.length > 0) {
var b = w[0];
S.push({
x: b.pos.x - t.x,
y: b.pos.y - t.y,
structureType: STRUCTURE_EXTRACTOR
});
}
}
var O = c(c([], s(T), !1), s(S), !1), _ = 0, x = e.find(FIND_MY_CONSTRUCTION_SITES), U = e.find(FIND_STRUCTURES);
if (x.length >= 10) return 0;
var A = {};
try {
for (var N = i(U), M = N.next(); !M.done; M = N.next()) {
var k = M.value.structureType;
A[k] = (null !== (g = A[k]) && void 0 !== g ? g : 0) + 1;
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
for (var P = i(x), I = P.next(); !I.done; I = P.next()) k = I.value.structureType, 
A[k] = (null !== (h = A[k]) && void 0 !== h ? h : 0) + 1;
} catch (e) {
a = {
error: e
};
} finally {
try {
I && !I.done && (l = P.return) && l.call(P);
} finally {
if (a) throw a.error;
}
}
var G = ep(E), L = function(r) {
var o = null !== (v = A[r.structureType]) && void 0 !== v ? v : 0;
if (o >= (null !== (R = G[r.structureType]) && void 0 !== R ? R : 0)) return "continue";
var n = t.x + r.x, a = t.y + r.y;
return n < 1 || n > 48 || a < 1 || a > 48 || C.get(n, a) === TERRAIN_MASK_WALL || U.some(function(e) {
return e.pos.x === n && e.pos.y === a && e.structureType === r.structureType;
}) || x.some(function(e) {
return e.pos.x === n && e.pos.y === a && e.structureType === r.structureType;
}) ? "continue" : e.createConstructionSite(n, a, r.structureType) === OK && (_++, 
A[r.structureType] = o + 1, _ >= 3 || x.length + _ >= 10) ? "break" : void 0;
};
try {
for (var D = i(O), F = D.next(); !F.done && "break" !== L(F.value); F = D.next()) ;
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
for (var H = i(r.roads), W = H.next(); !W.done && "break" !== B(W.value); W = H.next()) ;
} catch (e) {
p = {
error: e
};
} finally {
try {
W && !W.done && (f = H.return) && f.call(H);
} finally {
if (p) throw p.error;
}
}
}
return _;
}(e, p, d), E = function(e, t) {
var r, o, n = e.find(FIND_MY_CONSTRUCTION_SITES);
if (n.length >= 10) return 0;
var a = wc(e, t), c = e.getTerrain(), l = e.find(FIND_STRUCTURES, {
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
for (var f = i(a.positions), d = f.next(); !d.done; d = f.next()) {
var y = d.value;
if (p >= 2) break;
if (n.length + p >= 10) break;
if (!u.has(y) && !m.has(y)) {
var g = s(y.split(","), 2), h = g[0], v = g[1], R = parseInt(h, 10), E = parseInt(v, 10);
c.get(R, E) !== TERRAIN_MASK_WALL && e.createConstructionSite(R, E, STRUCTURE_ROAD) === OK && p++;
}
}
} catch (e) {
r = {
error: e
};
} finally {
try {
d && !d.done && (o = f.return) && o.call(f);
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
var n, a, s, c;
void 0 === o && (o = 5);
var l = {
placed: 0,
needsRepair: 0,
totalCritical: 0,
protected: 0
};
if (t < 2) return l;
var u = function(e, t) {
var r = e.find(FIND_MY_STRUCTURES), o = t < 4 ? Tc : Ec;
return r.filter(function(e) {
return o.includes(e.structureType);
});
}(e, t);
if (l.totalCritical = u.length, 0 === u.length) return l;
var m = e.find(FIND_MY_CONSTRUCTION_SITES);
if (m.length >= 10) return l;
var p = Math.min(o, 10 - m.length), f = e.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_RAMPART;
}
}), d = Rc(t, r), y = [], g = function(t) {
var o = t.pos, n = o.x, a = o.y;
if (function(e, t, r) {
return e.lookForAt(LOOK_STRUCTURES, t, r).some(function(e) {
return e.structureType === STRUCTURE_RAMPART;
});
}(e, n, a)) {
l.protected++;
var i = f.find(function(e) {
return e.pos.x === n && e.pos.y === a;
});
i && i.hits < d && l.needsRepair++;
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
for (var h = i(u), v = h.next(); !v.done; v = h.next()) g(T = v.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
v && !v.done && (a = h.return) && a.call(h);
} finally {
if (n) throw n.error;
}
}
y.sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var R = i(y), E = R.next(); !E.done; E = R.next()) {
var T = E.value.structure;
if (l.placed >= p) break;
var C = T.pos, S = C.x, w = C.y, b = e.createConstructionSite(S, w, STRUCTURE_RAMPART);
if (b === OK) l.placed++, bo.debug("Placed rampart on ".concat(T.structureType, " at (").concat(S, ",").concat(w, ")"), {
subsystem: "Defense"
}); else if (b === ERR_FULL) break;
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
return (l.placed > 0 || y.length > 0) && bo.info("Rampart automation for ".concat(e.name, ": ") + "".concat(l.protected, "/").concat(l.totalCritical, " protected, ") + "".concat(l.placed, " placed, ") + "".concat(y.length - l.placed, " pending"), {
subsystem: "Defense"
}), l;
}(e, u, t.danger, C)).placed > 0 && Rn.addRoomEvent(this.roomName, "rampartPlaced", "".concat(T.placed, " rampart(s) placed on critical structures"));
}
t.metrics.constructionSites = l.length + R + E + h.sitesPlaced + T.placed;
}
} else if (1 === u && 0 === l.length) {
var S = mp(e, u);
S && e.createConstructionSite(S.anchor.x, S.anchor.y, STRUCTURE_SPAWN);
}
}
}, e.prototype.runResourceProcessing = function(e, t) {
var r, o, n = null !== (o = null === (r = e.controller) || void 0 === r ? void 0 : r.level) && void 0 !== o ? o : 0;
n >= 6 && this.runLabs(e), n >= 7 && this.runFactory(e), n >= 8 && this.runPowerSpawn(e), 
this.runLinks(e);
}, e.prototype.runLabs = function(e) {
var t = Rn.getSwarmState(e.name);
if (t) {
Lo.initialize(e.name), zo.prepareLabs(e, t);
var r = gp.planReactions(e, t);
if (r) {
var o = {
product: r.product,
input1: r.input1,
input2: r.input2,
amountNeeded: 1e3,
priority: r.priority
};
if (Lo.areLabsReady(e.name, o)) {
var n = Io.getConfig(e.name), a = null == n ? void 0 : n.activeReaction;
a && a.input1 === r.input1 && a.input2 === r.input2 && a.output === r.product || Lo.setActiveReaction(e.name, r.input1, r.input2, r.product), 
gp.executeReaction(e, r);
} else bo.debug("Labs not ready for reaction: ".concat(r.input1, " + ").concat(r.input2, " -> ").concat(r.product), {
subsystem: "Labs",
room: e.name
});
}
Lo.save(e.name);
}
}, e.prototype.runFactory = function(e) {
var t, r, o = Tp(e).factory;
if (o && !(o.cooldown > 0)) {
var n = [ RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_HYDROGEN, RESOURCE_OXYGEN ];
try {
for (var a = i(n), s = a.next(); !s.done; s = a.next()) {
var c = s.value;
if (o.store.getUsedCapacity(c) >= 500 && o.store.getUsedCapacity(RESOURCE_ENERGY) >= 200 && o.produce(RESOURCE_UTRIUM_BAR) === OK) break;
}
} catch (e) {
t = {
error: e
};
} finally {
try {
s && !s.done && (r = a.return) && r.call(a);
} finally {
if (t) throw t.error;
}
}
}
}, e.prototype.runPowerSpawn = function(e) {
var t = Tp(e).powerSpawn;
t && t.store.getUsedCapacity(RESOURCE_POWER) >= 1 && t.store.getUsedCapacity(RESOURCE_ENERGY) >= 50 && t.processPower();
}, e.prototype.runLinks = function(e) {
var t, r, o = Tp(e), n = o.links;
if (!(n.length < 2)) {
var a = e.storage;
if (a) {
var s = n.find(function(e) {
return e.pos.getRangeTo(a) <= 2;
});
if (s) {
var c = o.sources, l = n.filter(function(e) {
return c.some(function(t) {
return e.pos.getRangeTo(t) <= 2;
});
}), u = e.controller, m = u ? n.find(function(e) {
return e.pos.getRangeTo(u) <= 3 && e.id !== s.id;
}) : void 0;
try {
for (var p = i(l), f = p.next(); !f.done; f = p.next()) {
var d = f.value;
if (d.store.getUsedCapacity(RESOURCE_ENERGY) >= 400 && 0 === d.cooldown && s.store.getFreeCapacity(RESOURCE_ENERGY) >= 400) return void d.transferEnergy(s);
}
} catch (e) {
t = {
error: e
};
} finally {
try {
f && !f.done && (r = p.return) && r.call(p);
} finally {
if (t) throw t.error;
}
}
if (m && 0 === s.cooldown) {
var y = m.store.getUsedCapacity(RESOURCE_ENERGY) < 400, g = s.store.getUsedCapacity(RESOURCE_ENERGY) >= 400;
y && g && s.transferEnergy(m);
}
}
}
}
}, e;
}(), Sp = function() {
function e() {
this.nodes = new Map;
}
return e.prototype.run = function() {
var e, t, r, o, n, a, c, l, u = global, m = u._ownedRooms, p = u._ownedRoomsTick;
l = m && p === Game.time ? m : Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
});
var f = l.length;
try {
for (var d = i(l), y = d.next(); !y.done; y = d.next()) {
var g = y.value;
this.nodes.has(g.name) || this.nodes.set(g.name, new Cp(g.name));
}
} catch (t) {
e = {
error: t
};
} finally {
try {
y && !y.done && (t = d.return) && t.call(d);
} finally {
if (e) throw e.error;
}
}
try {
for (var h = i(this.nodes), v = h.next(); !v.done; v = h.next()) {
var R = s(v.value, 1)[0];
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
for (var E = i(this.nodes.values()), T = E.next(); !T.done; T = E.next()) {
var C = T.value;
try {
C.run(f);
} catch (e) {
var S = e instanceof Error ? e.message : String(e), w = e instanceof Error && e.stack ? e.stack : void 0;
bo.error("Error in room ".concat(C.roomName, ": ").concat(S), {
subsystem: "RoomManager",
room: C.roomName,
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
this.nodes.has(e.name) || this.nodes.set(e.name, new Cp(e.name));
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
bo.error("Error in room ".concat(e.name, ": ").concat(s), {
subsystem: "RoomManager",
room: e.name,
meta: {
stack: c
}
});
}
}
}, e;
}(), wp = new Sp;

function bp(t) {
var r, o, n;
return t.find(FIND_HOSTILE_CREEPS).length > 0 ? e.ProcessPriority.CRITICAL : (null === (r = t.controller) || void 0 === r ? void 0 : r.my) ? e.ProcessPriority.HIGH : "ralphschuler" === (null === (n = null === (o = t.controller) || void 0 === o ? void 0 : o.reservation) || void 0 === n ? void 0 : n.username) ? e.ProcessPriority.MEDIUM : e.ProcessPriority.LOW;
}

function Op(e) {
var t;
if (!(null === (t = e.controller) || void 0 === t ? void 0 : t.my)) return .02;
var r = e.controller.level;
return e.find(FIND_HOSTILE_CREEPS).length > 0 ? .12 : r <= 3 ? .04 : r <= 6 ? .06 : .08;
}

function _p(t, r, o) {
var n;
return r === e.ProcessPriority.CRITICAL ? {
tickModulo: void 0,
tickOffset: void 0
} : r === e.ProcessPriority.HIGH && (null === (n = t.controller) || void 0 === n ? void 0 : n.my) ? {
tickModulo: 5,
tickOffset: o % 5
} : r === e.ProcessPriority.MEDIUM ? {
tickModulo: 10,
tickOffset: o % 10
} : r === e.ProcessPriority.LOW ? {
tickModulo: 20,
tickOffset: o % 20
} : {
tickModulo: void 0,
tickOffset: void 0
};
}

var xp, Up = function() {
function t() {
this.registeredRooms = new Set, this.lastSyncTick = -1, this.roomIndices = new Map, 
this.nextRoomIndex = 0;
}
return t.prototype.getRoomIndex = function(e) {
var t = this.roomIndices.get(e);
return void 0 === t && (t = this.nextRoomIndex++, this.roomIndices.set(e, t)), t;
}, t.prototype.syncRoomProcesses = function() {
var e, t;
if (this.lastSyncTick !== Game.time) {
this.lastSyncTick = Game.time;
var r = new Set;
for (var o in Game.rooms) {
var n = Game.rooms[o];
r.add(o);
var a = "room:".concat(o), s = On.getProcess(a), c = bp(n), l = Op(n);
this.registeredRooms.has(o) ? s && (s.priority !== c || Math.abs(s.cpuBudget - l) > 1e-4) && this.updateRoomProcess(n, c, l) : this.registerRoomProcess(n);
}
try {
for (var u = i(this.registeredRooms), m = u.next(); !m.done; m = u.next()) o = m.value, 
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
}, t.prototype.registerRoomProcess = function(e) {
var t, r = bp(e), o = Op(e), n = "room:".concat(e.name), a = this.getRoomIndex(e.name), i = _p(e, r, a);
On.registerProcess({
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
t && wp.runRoom(t);
}
}), this.registeredRooms.add(e.name);
var s = i.tickModulo ? "(mod=".concat(i.tickModulo, ", offset=").concat(i.tickOffset, ")") : "(every tick)";
bo.debug("Registered room process: ".concat(e.name, " with priority ").concat(r, " ").concat(s), {
subsystem: "RoomProcessManager"
});
}, t.prototype.updateRoomProcess = function(e, t, r) {
var o, n = "room:".concat(e.name), a = this.getRoomIndex(e.name), i = _p(e, t, a);
On.unregisterProcess(n), On.registerProcess({
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
t && wp.runRoom(t);
}
});
var s = i.tickModulo ? "mod=".concat(i.tickModulo, ", offset=").concat(i.tickOffset) : "every tick";
bo.debug("Updated room process: ".concat(e.name, " priority=").concat(t, " budget=").concat(r, " (").concat(s, ")"), {
subsystem: "RoomProcessManager"
});
}, t.prototype.unregisterRoomProcess = function(e) {
var t = "room:".concat(e);
On.unregisterProcess(t), this.registeredRooms.delete(e), this.roomIndices.delete(e), 
bo.debug("Unregistered room process: ".concat(e), {
subsystem: "RoomProcessManager"
});
}, t.prototype.getMinBucketForPriority = function(e) {
return 0;
}, t.prototype.getStats = function() {
var t, r, o, n, a, s = {}, c = 0;
try {
for (var l = i(this.registeredRooms), u = l.next(); !u.done; u = l.next()) {
var m = u.value, p = Game.rooms[m];
if (p) {
var f = bp(p), d = null !== (o = e.ProcessPriority[f]) && void 0 !== o ? o : "UNKNOWN";
s[d] = (null !== (n = s[d]) && void 0 !== n ? n : 0) + 1, (null === (a = p.controller) || void 0 === a ? void 0 : a.my) && c++;
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
return {
totalRooms: Object.keys(Game.rooms).length,
registeredRooms: this.registeredRooms.size,
roomsByPriority: s,
ownedRooms: c
};
}, t.prototype.forceResync = function() {
this.lastSyncTick = -1, this.syncRoomProcesses();
}, t.prototype.reset = function() {
this.registeredRooms.clear(), this.roomIndices.clear(), this.nextRoomIndex = 0, 
this.lastSyncTick = -1;
}, t;
}(), Ap = new Up, Np = function() {
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

function Mp(e) {
var t, r, o = new Set;
try {
for (var n = i(Object.values(Game.creeps)), a = n.next(); !a.done; a = n.next()) {
var s = a.value.memory;
"remoteHarvester" !== s.role && "remoteHauler" !== s.role || s.homeRoom !== e.name || !s.targetRoom || s.targetRoom === e.name || o.add(s.targetRoom);
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
return Array.from(o);
}

function kp(e, t) {
var r, o, n, a, s = Game.rooms[e];
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
for (var p = i(m), f = p.next(); !f.done; f = p.next()) {
var d = f.value;
u.set(d.pos.x, d.pos.y, 1);
}
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
var y = s.find(FIND_CREEPS);
try {
for (var g = i(y), h = g.next(); !h.done; h = g.next()) {
var v = h.value;
u.set(v.pos.x, v.pos.y, 255);
}
} catch (e) {
n = {
error: e
};
} finally {
try {
h && !h.done && (a = g.return) && a.call(g);
} finally {
if (n) throw n.error;
}
}
return u;
}

!function(e) {
e[e.CRITICAL = 0] = "CRITICAL", e[e.HIGH = 1] = "HIGH", e[e.MEDIUM = 2] = "MEDIUM", 
e[e.LOW = 3] = "LOW";
}(xp || (xp = {}));

var Pp, Ip = function() {
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
var r, o, n, a, s, c, l = this, u = e.storage, m = e.find(FIND_MY_SPAWNS);
if (u || 0 !== m.length) {
var p = 0;
try {
for (var f = i(t), d = f.next(); !d.done; d = f.next()) {
var y = d.value, g = Game.rooms[y];
if (g) {
var h = g.find(FIND_SOURCES), v = g.find(FIND_STRUCTURES, {
filter: function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}
});
if (m.length > 0) {
var R = m[0];
try {
for (var E = (n = void 0, i(h)), T = E.next(); !T.done; T = E.next()) {
var C = T.value, S = PathFinder.search(R.pos, {
pos: C.pos,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxRooms: 16,
roomCallback: function(e) {
return kp(e, l.logger);
}
});
if (!S.incomplete && S.path.length > 0) {
var w = this.pathCache.convertRoomPositionsToPathSteps(S.path);
this.cacheRemoteMiningPath(R.pos, C.pos, w, "harvester"), p++;
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
}
if (u) {
var b = v.filter(function(e) {
return e.structureType === STRUCTURE_CONTAINER;
}), O = b.length > 0 ? b.map(function(e) {
return e.pos;
}) : h.map(function(e) {
return e.pos;
});
try {
for (var _ = (s = void 0, i(O)), x = _.next(); !x.done; x = _.next()) {
var U = x.value, A = PathFinder.search(U, {
pos: u.pos,
range: 1
}, {
plainCost: 2,
swampCost: 10,
maxRooms: 16,
roomCallback: function(e) {
return kp(e, l.logger);
}
});
!A.incomplete && A.path.length > 0 && (w = this.pathCache.convertRoomPositionsToPathSteps(A.path), 
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
d && !d.done && (o = f.return) && o.call(f);
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
return kp(e, o.logger);
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
}(), Gp = function() {
function e(e, t, r) {
this.logger = e, this.scheduler = t, this.pathCache = r;
}
return e.prototype.precacheAllRemoteRoutes = function() {
var e, t, r, o = 0;
try {
for (var n = i(Object.values(Game.rooms)), a = n.next(); !a.done; a = n.next()) {
var s = a.value;
if ((null === (r = s.controller) || void 0 === r ? void 0 : r.my) && (s.storage || 0 !== s.find(FIND_MY_SPAWNS).length)) {
var c = Mp(s);
0 !== c.length && (this.pathCache.precacheRemoteRoutes(s, c), o += c.length);
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
}(), Lp = {
debug: function(e, t) {
return Yr("RemoteMining").debug(e, t);
},
info: function(e, t) {
return Yr("RemoteMining").info(e, t);
},
warn: function(e, t) {
return Yr("RemoteMining").warn(e, t);
},
error: function(e, t) {
return Yr("RemoteMining").error(e, t);
}
}, Dp = {
scheduleTask: function(e, t, r, o, n) {
!function(e, t, r, o, n) {
void 0 === o && (o = Ga.MEDIUM), za.register({
id: e,
interval: t,
execute: r,
priority: o,
maxCpu: n,
skippable: o !== Ga.CRITICAL
});
}(e, t, r, o, n);
}
}, Fp = new Ip({
getCachedPath: function(e, t) {
var r = gi(e, t), o = pi.get(r, {
namespace: yi
});
if (!o) return null;
try {
return Room.deserializePath(o);
} catch (e) {
return pi.invalidate(r, yi), null;
}
},
cachePath: hi,
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
}, Lp), Bp = new Gp(Lp, Dp, Fp), Hp = function() {
function e() {
this.logger = Yr("Pathfinding");
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
}(), Wp = function() {
function e() {}
return e.prototype.on = function(e, t) {
Xr.on(e, t);
}, e;
}(), Yp = function() {
function e() {}
return e.prototype.invalidateRoom = function(e) {
!function(e) {
var t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), r = new RegExp("^".concat(t, ":|:").concat(t, ":|:").concat(t, "$"));
pi.invalidatePattern(r, yi);
}(e);
}, e.prototype.cacheCommonRoutes = function(e) {
!function(e) {
var t, r, o;
if (null === (o = e.controller) || void 0 === o ? void 0 : o.my) {
var n = e.storage;
if (n) {
var a = e.find(FIND_SOURCES);
try {
for (var s = i(a), c = s.next(); !c.done; c = s.next()) {
var l = c.value, u = e.findPath(n.pos, l.pos, {
ignoreCreeps: !0,
serialize: !1
});
u.length > 0 && (hi(n.pos, l.pos, u), hi(l.pos, n.pos, u));
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
m.length > 0 && hi(n.pos, e.controller.pos, m);
}
}
}
}(e);
}, e;
}(), Kp = function() {
function e() {}
return e.prototype.getRemoteRoomsForRoom = function(e) {
return function(e) {
return Mp(e);
}(e);
}, e.prototype.precacheRemoteRoutes = function(e, t) {
!function(e, t) {
Fp.precacheRemoteRoutes(e, t);
}(e, t);
}, e;
}(), jp = new Np(new Hp, new Wp, new Yp, new Kp), Vp = Yr("SS2TerminalComms"), qp = function() {
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
for (var o = i(Game.market.incomingTransactions), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (!a.order && a.description && a.sender) {
var s = this.parseTransaction(a.description);
if (s) {
var c = "".concat(a.sender.username, ":").concat(s.msgId), l = this.messageBuffers.get(c);
if (!l) {
if (void 0 === s.finalPacket) continue;
l = {
msgId: s.msgId,
sender: a.sender.username,
finalPacket: s.finalPacket,
packets: new Map,
receivedAt: Game.time
}, this.messageBuffers.set(c, l);
}
if (l.packets.set(s.packetId, s.messageChunk), l.packets.size === l.finalPacket + 1) {
for (var u = [], m = 0; m <= l.finalPacket; m++) {
var p = l.packets.get(m);
if (!p) {
Vp.warn("Missing packet in multi-packet message", {
meta: {
packetId: m,
messageId: s.msgId,
sender: a.sender.username
}
});
break;
}
u.push(p);
}
if (u.length === l.finalPacket + 1) {
var f = u.join("");
r.push({
sender: a.sender.username,
message: f
}), this.messageBuffers.delete(c), Vp.info("Received complete multi-packet message from ".concat(a.sender.username), {
meta: {
messageId: s.msgId,
packets: u.length,
totalSize: f.length,
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
return r.length > 0 && Vp.debug("Processed ".concat(Game.market.incomingTransactions.length, " terminal transactions, completed ").concat(r.length, " messages")), 
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
return i ? (this.queuePackets(e.id, t, r, o, a, i), Vp.info("Queued ".concat(a.length, " packets for multi-packet message"), {
meta: {
terminalId: e.id,
messageId: i,
packets: a.length,
targetRoom: t
}
}), OK) : (Vp.error("Failed to extract message ID from first packet"), ERR_INVALID_ARGS);
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
var n = 0, a = [], c = Game.cpu.getUsed();
try {
for (var l = i(Object.entries(Memory.ss2PacketQueue)), u = l.next(); !u.done; u = l.next()) {
var m = s(u.value, 2), p = m[0], f = m[1];
if (Game.cpu.getUsed() - c > 5) {
Vp.debug("Queue processing stopped due to CPU budget limit (".concat(5, " CPU)"));
break;
}
var d = Game.getObjectById(f.terminalId);
if (d) {
if (!(d.cooldown > 0)) {
var y = f.packets[f.nextPacketIndex];
if (y) {
var g = d.send(f.resourceType, f.amount, f.targetRoom, y);
if (g === OK) {
if (Memory.ss2PacketQueue[p].nextPacketIndex = f.nextPacketIndex + 1, n++, Memory.ss2PacketQueue[p].nextPacketIndex >= f.packets.length) {
var h = this.extractMessageId(y);
Vp.info("Completed sending multi-packet message", {
meta: {
messageId: h,
packets: f.packets.length,
targetRoom: f.targetRoom
}
}), a.push(p);
}
} else g === ERR_NOT_ENOUGH_RESOURCES ? Vp.warn("Not enough resources to send packet, will retry next tick", {
meta: {
queueKey: p,
resource: f.resourceType,
amount: f.amount
}
}) : (Vp.error("Failed to send packet: ".concat(g, ", removing queue item"), {
meta: {
queueKey: p,
result: g
}
}), a.push(p));
} else Vp.warn("No packet at index ".concat(f.nextPacketIndex, ", removing queue item"), {
meta: {
queueKey: p
}
}), a.push(p);
}
} else Vp.warn("Terminal not found for queue item, removing from queue", {
meta: {
queueKey: p,
terminalId: f.terminalId
}
}), a.push(p);
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
for (var v = i(a), R = v.next(); !R.done; R = v.next()) {
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
return n > 0 && Vp.debug("Sent ".concat(n, " queued packets this tick")), n;
}, e.cleanupExpiredQueue = function() {
var e, t, r, o;
if (Memory.ss2PacketQueue) {
var n = Game.time, a = [];
try {
for (var c = i(Object.entries(Memory.ss2PacketQueue)), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value, 2), m = u[0], p = u[1];
if (n - p.queuedAt > this.QUEUE_TIMEOUT) {
var f = this.extractMessageId(p.packets[0]);
Vp.warn("Queue item timed out after ".concat(n - p.queuedAt, " ticks"), {
meta: {
messageId: f,
queueKey: m,
sentPackets: p.nextPacketIndex,
totalPackets: p.packets.length
}
}), a.push(m);
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
for (var d = i(a), y = d.next(); !y.done; y = d.next()) {
var g = y.value;
delete Memory.ss2PacketQueue[g];
}
} catch (e) {
r = {
error: e
};
} finally {
try {
y && !y.done && (o = d.return) && o.call(d);
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
for (var o = i(this.messageBuffers.entries()), n = o.next(); !n.done; n = o.next()) {
var a = s(n.value, 2), c = a[0], l = a[1];
r - l.receivedAt > this.MESSAGE_TIMEOUT && (Vp.warn("Message timed out", {
meta: {
messageId: l.msgId,
sender: l.sender
}
}), this.messageBuffers.delete(c));
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
return Vp.error("Error parsing JSON", {
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
}(), zp = {
lowBucketThreshold: 2e3,
highBucketThreshold: 9e3,
targetCpuUsage: .8,
highFrequencyInterval: 1,
mediumFrequencyInterval: 5,
lowFrequencyInterval: 20
}, Xp = function() {
function e(e) {
void 0 === e && (e = {}), this.tasks = new Map, this.currentMode = "normal", this.tickCpuUsed = 0, 
this.config = n(n({}, zp), e);
}
return e.prototype.registerTask = function(e) {
this.tasks.set(e.name, n(n({}, e), {
lastRun: 0
}));
}, e.prototype.unregisterTask = function(e) {
this.tasks.delete(e);
}, e.prototype.getBucketMode = function() {
var e = On.getBucketMode();
return "critical" === e || "low" === e ? "low" : "high" === e ? "high" : "normal";
}, e.prototype.updateBucketMode = function() {
var e = this.getBucketMode();
e !== this.currentMode && (bo.info("Bucket mode changed: ".concat(this.currentMode, " -> ").concat(e), {
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
for (var o = i(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
if (this.shouldRunTask(a)) {
var s = Game.cpu.getUsed();
if (!(s + this.getCpuLimit() * a.cpuBudget > this.getCpuLimit() && "high" !== a.frequency)) {
try {
a.execute(), a.lastRun = Game.time;
} catch (e) {
var c = e instanceof Error ? e.message : String(e);
bo.error("Task ".concat(a.name, " failed: ").concat(c), {
subsystem: "Scheduler"
});
}
var l = Game.cpu.getUsed() - s;
if (this.tickCpuUsed += l, !this.hasCpuBudget()) {
bo.warn("CPU budget exhausted, skipping remaining tasks", {
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

new Xp, (Pp = {})[FIND_STRUCTURES] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, Pp[FIND_MY_STRUCTURES] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, Pp[FIND_HOSTILE_STRUCTURES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Pp[FIND_SOURCES_ACTIVE] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, Pp[FIND_SOURCES] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, Pp[FIND_MINERALS] = {
lowBucket: 1e4,
normal: 5e3,
highBucket: 1e3
}, Pp[FIND_DEPOSITS] = {
lowBucket: 200,
normal: 100,
highBucket: 50
}, Pp[FIND_MY_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Pp[FIND_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Pp[FIND_CREEPS] = {
lowBucket: 10,
normal: 5,
highBucket: 3
}, Pp[FIND_MY_CREEPS] = {
lowBucket: 10,
normal: 5,
highBucket: 3
}, Pp[FIND_HOSTILE_CREEPS] = {
lowBucket: 10,
normal: 3,
highBucket: 1
}, Pp[FIND_DROPPED_RESOURCES] = {
lowBucket: 20,
normal: 5,
highBucket: 3
}, Pp[FIND_TOMBSTONES] = {
lowBucket: 30,
normal: 10,
highBucket: 5
}, Pp[FIND_RUINS] = {
lowBucket: 30,
normal: 10,
highBucket: 5
}, Pp[FIND_FLAGS] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, Pp[FIND_MY_SPAWNS] = {
lowBucket: 200,
normal: 100,
highBucket: 50
}, Pp[FIND_HOSTILE_SPAWNS] = {
lowBucket: 100,
normal: 50,
highBucket: 20
}, Pp[FIND_HOSTILE_CONSTRUCTION_SITES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Pp[FIND_NUKES] = {
lowBucket: 50,
normal: 20,
highBucket: 10
}, Pp[FIND_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, Pp[FIND_MY_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, Pp[FIND_HOSTILE_POWER_CREEPS] = {
lowBucket: 20,
normal: 10,
highBucket: 5
}, Pp[FIND_EXIT_TOP] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, Pp[FIND_EXIT_RIGHT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, Pp[FIND_EXIT_BOTTOM] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, Pp[FIND_EXIT_LEFT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
}, Pp[FIND_EXIT] = {
lowBucket: 1e3,
normal: 500,
highBucket: 100
};

var Qp = new Qi({}, Rn), Zp = new es({}, Rn), $p = !1, Jp = !1;

function ef() {
var e, t;
if (Cn().visualizations) {
var r = function() {
var e;
return null !== (e = xs.get("ownedRooms", {
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
for (var o = i(r), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
try {
Qp.draw(a);
} catch (e) {
var s = e instanceof Error ? e.message : String(e);
bo.error("Visualization error in ".concat(a.name, ": ").concat(s), {
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
Zp.draw();
} catch (e) {
s = e instanceof Error ? e.message : String(e), bo.error("Map visualization error: ".concat(s), {
subsystem: "visualizations"
});
}
}
}

function tf() {
var t, r;
Jp && Game.time % 10 != 0 || bo.info("SwarmBot loop executing at tick ".concat(Game.time), {
subsystem: "SwarmBot",
meta: {
systemsInitialized: Jp
}
}), Jp || (uo({
level: (r = Cn()).debug ? ao.DEBUG : ao.INFO,
cpuLogging: r.profiling,
enableBatching: !0,
maxBatchSize: 50
}), bo.info("Bot initialized", {
subsystem: "SwarmBot",
meta: {
debug: r.debug,
profiling: r.profiling
}
}), Ii.initialize(), r.profiling && (function() {
if (PathFinder.search && !PathFinder.search.__nativeCallsTrackerWrapped) {
var e = Object.getOwnPropertyDescriptor(PathFinder, "search");
if (e && !1 === e.configurable) Fm.warn("Cannot wrap PathFinder.search - property is not configurable"); else {
var t = PathFinder.search;
try {
var r = function() {
for (var e = [], r = 0; r < arguments.length; r++) e[r] = arguments[r];
return Ii.recordNativeCall("pathfinderSearch"), t.apply(PathFinder, e);
};
r.__nativeCallsTrackerWrapped = !0, Object.defineProperty(PathFinder, "search", {
value: r,
writable: !0,
enumerable: !0,
configurable: !0
});
} catch (e) {
Fm.warn("Failed to wrap PathFinder.search", {
meta: {
error: String(e)
}
});
}
}
}
}(), Bm(t = Creep.prototype, "moveTo", "moveTo"), Bm(t, "move", "move"), Bm(t, "harvest", "harvest"), 
Bm(t, "transfer", "transfer"), Bm(t, "withdraw", "withdraw"), Bm(t, "build", "build"), 
Bm(t, "repair", "repair"), Bm(t, "upgradeController", "upgradeController"), Bm(t, "attack", "attack"), 
Bm(t, "rangedAttack", "rangedAttack"), Bm(t, "heal", "heal"), Bm(t, "dismantle", "dismantle"), 
Bm(t, "say", "say")), On.on("structure.destroyed", function(e) {
var t = Rn.getSwarmState(e.roomName);
t && (Gm.onStructureDestroyed(t, e.structureType), jr.debug("Pheromone update: structure destroyed in ".concat(e.roomName), {
subsystem: "Pheromone",
room: e.roomName
}));
}), On.on("remote.lost", function(e) {
var t = Rn.getSwarmState(e.homeRoom);
t && (Gm.onRemoteSourceLost(t), jr.info("Pheromone update: remote source lost for ".concat(e.homeRoom), {
subsystem: "Pheromone",
room: e.homeRoom
}));
}), jr.info("Pheromone event handlers initialized", {
subsystem: "Pheromone"
}), jp.initializePathCacheEvents(), Bp.initialize(Ga.MEDIUM), ro.initialize(), Qn.initialize(), 
Jp = !0), On.updateFromCpuConfig(Cn().cpu), $p || (bo.info("Registering all processes with kernel...", {
subsystem: "ProcessRegistry"
}), function() {
for (var e, t, r = [], o = 0; o < arguments.length; o++) r[o] = arguments[o];
try {
for (var n = i(r), a = n.next(); !a.done; a = n.next()) In(a.value);
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
bo.info("Registered decorated processes from ".concat(r.length, " instance(s)"), {
subsystem: "ProcessDecorators"
});
}(Dm, Yu, zu, Iu, em, ga, Um, Du, Tm, Sm, Rm, Yn, Bn, Qn, Mm, Da, Ru, Xc, Pc), bo.info("Registered ".concat(On.getProcesses().length, " processes with kernel"), {
subsystem: "ProcessRegistry"
}), On.initialize(), $p = !0), Ii.startTick(), "critical" === On.getBucketMode() && Game.time % 10 == 0 && bo.warn("CRITICAL: CPU bucket at ".concat(Game.cpu.bucket, ", continuing normal processing"), {
subsystem: "SwarmBot"
}), Yl.clear(), ms.clear(), e.eventBus.startTick();
var o, n = "_ownedRooms", a = "_ownedRoomsTick", s = global, c = s[n], l = s[a];
c && l === Game.time ? o = c : (o = Object.values(Game.rooms).filter(function(e) {
var t;
return null === (t = e.controller) || void 0 === t ? void 0 : t.my;
}), s[n] = o, s[a] = Game.time), vs.preTick(), Rn.initialize(), Ii.measureSubsystem("processSync", function() {
Vm.syncCreepProcesses(), Ap.syncRoomProcesses();
}), Ii.measureSubsystem("kernel", function() {
On.run();
}), Ii.measureSubsystem("eventQueue", function() {
e.eventBus.processQueue();
}), Ii.measureSubsystem("spawns", function() {
!function() {
var e, t, r;
try {
for (var o = i(Object.values(Game.rooms)), n = o.next(); !n.done; n = o.next()) {
var a = n.value;
(null === (r = a.controller) || void 0 === r ? void 0 : r.my) && Fl(a, Rn.getOrInitSwarmState(a.name));
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
}), Ii.measureSubsystem("ss2PacketQueue", function() {
qp.processQueue();
}), On.hasCpuBudget() && Ii.measureSubsystem("powerCreeps", function() {
!function() {
var e, t;
try {
for (var r = i(Object.values(Game.powerCreeps)), o = r.next(); !o.done; o = r.next()) {
var n = o.value;
void 0 !== n.ticksToLive && Tl(n);
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
}), On.hasCpuBudget() && Ii.measureSubsystem("visualizations", function() {
ef();
}), vs.reconcileTraffic(), On.hasCpuBudget() && Ii.measureSubsystem("scheduledTasks", function() {
var e;
e = Math.max(0, Game.cpu.limit - Game.cpu.getUsed()), za.run(e);
}), Rn.persistHeapCache(), Ii.collectProcessStats(On.getProcesses().reduce(function(e, t) {
return e.set(t.id, t), e;
}, new Map)), Ii.collectKernelBudgetStats(On), Ii.setSkippedProcesses(On.getSkippedProcessesThisTick()), 
Ii.finalizeTick(), bo.flush();
}

var rf = Yr("VisualizationManager"), of = function() {
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
enabledLayers: Vo.Pheromones | Vo.Defense,
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
this.config.enabledLayers = Vo.Pheromones | Vo.Paths | Vo.Traffic | Vo.Defense | Vo.Economy | Vo.Construction | Vo.Performance;
break;

case "presentation":
this.config.enabledLayers = Vo.Pheromones | Vo.Defense | Vo.Economy;
break;

case "minimal":
this.config.enabledLayers = Vo.Defense;
break;

case "performance":
this.config.enabledLayers = Vo.None;
}
this.saveConfig(), rf.info("Visualization mode set to: ".concat(e));
}, e.prototype.updateFromFlags = function() {
var e, t, r = Game.flags, o = {
viz_pheromones: Vo.Pheromones,
viz_paths: Vo.Paths,
viz_traffic: Vo.Traffic,
viz_defense: Vo.Defense,
viz_economy: Vo.Economy,
viz_construction: Vo.Construction,
viz_performance: Vo.Performance
}, n = function(e, t) {
Object.values(r).some(function(t) {
return t.name === e;
}) && !a.isLayerEnabled(t) && (a.enableLayer(t), rf.info("Enabled layer ".concat(Vo[t], " via flag")));
}, a = this;
try {
for (var c = i(Object.entries(o)), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value, 2);
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
a > 10 && rf.warn("Visualization using ".concat(a.toFixed(1), "% of CPU budget"));
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
return n({}, this.config);
}, e.prototype.getPerformanceMetrics = function() {
var e = Game.cpu.limit;
return {
totalCost: this.config.totalCost,
layerCosts: n({}, this.config.layerCosts),
percentOfBudget: this.config.totalCost / e * 100
};
}, e.prototype.measureCost = function(e) {
var t = Game.cpu.getUsed();
return {
result: e(),
cost: Game.cpu.getUsed() - t
};
}, e;
}(), nf = new of, af = function() {
function e() {}
return e.prototype.toggleVisualizations = function() {
var e = !Cn().visualizations;
return Sn({
visualizations: e
}), "Visualizations: ".concat(e ? "ENABLED" : "DISABLED");
}, e.prototype.toggleVisualization = function(e) {
var t = Qp.getConfig(), r = Object.keys(t).filter(function(e) {
return e.startsWith("show") && "boolean" == typeof t[e];
});
if (!r.includes(e)) return "Invalid key: ".concat(e, ". Valid keys: ").concat(r.join(", "));
var o = e;
Qp.toggle(o);
var n = Qp.getConfig()[o];
return "Room visualization '".concat(e, "': ").concat(n ? "ENABLED" : "DISABLED");
}, e.prototype.toggleMapVisualization = function(e) {
var t = Zp.getConfig(), r = Object.keys(t).filter(function(e) {
return e.startsWith("show") && "boolean" == typeof t[e];
});
if (!r.includes(e)) return "Invalid key: ".concat(e, ". Valid keys: ").concat(r.join(", "));
var o = e;
Zp.toggle(o);
var n = Zp.getConfig()[o];
return "Map visualization '".concat(e, "': ").concat(n ? "ENABLED" : "DISABLED");
}, e.prototype.showMapConfig = function() {
var e = Zp.getConfig();
return Object.entries(e).map(function(e) {
var t = s(e, 2), r = t[0], o = t[1];
return "".concat(r, ": ").concat(String(o));
}).join("\n");
}, e.prototype.setVisMode = function(e) {
var t = [ "debug", "presentation", "minimal", "performance" ];
return t.includes(e) ? (nf.setMode(e), "Visualization mode set to: ".concat(e)) : "Invalid mode: ".concat(e, ". Valid modes: ").concat(t.join(", "));
}, e.prototype.toggleVisLayer = function(e) {
var t = {
pheromones: Vo.Pheromones,
paths: Vo.Paths,
traffic: Vo.Traffic,
defense: Vo.Defense,
economy: Vo.Economy,
construction: Vo.Construction,
performance: Vo.Performance
}, r = t[e.toLowerCase()];
if (!r) return "Unknown layer: ".concat(e, ". Valid layers: ").concat(Object.keys(t).join(", "));
nf.toggleLayer(r);
var o = nf.isLayerEnabled(r);
return "Layer ".concat(e, ": ").concat(o ? "enabled" : "disabled");
}, e.prototype.showVisPerf = function() {
var e, t, r = nf.getPerformanceMetrics(), o = "=== Visualization Performance ===\n";
o += "Total CPU: ".concat(r.totalCost.toFixed(3), "\n"), o += "% of Budget: ".concat(r.percentOfBudget.toFixed(2), "%\n"), 
o += "\nPer-Layer Costs:\n";
try {
for (var n = i(Object.entries(r.layerCosts)), a = n.next(); !a.done; a = n.next()) {
var c = s(a.value, 2), l = c[0], u = c[1];
u > 0 && (o += "  ".concat(l, ": ").concat(u.toFixed(3), " CPU\n"));
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
var e, t, r, o = nf.getConfig(), n = "=== Visualization Configuration ===\n";
n += "Mode: ".concat(o.mode, "\n"), n += "\nEnabled Layers:\n";
var a = ((e = {})[Vo.Pheromones] = "Pheromones", e[Vo.Paths] = "Paths", e[Vo.Traffic] = "Traffic", 
e[Vo.Defense] = "Defense", e[Vo.Economy] = "Economy", e[Vo.Construction] = "Construction", 
e[Vo.Performance] = "Performance", e);
try {
for (var c = i(Object.entries(a)), l = c.next(); !l.done; l = c.next()) {
var u = s(l.value, 2), m = u[0], p = u[1], f = parseInt(m, 10), d = 0 !== (o.enabledLayers & f);
n += "  ".concat(p, ": ").concat(d ? "✓" : "✗", "\n");
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
}, e.prototype.clearVisCache = function(e) {
return nf.clearCache(e), e ? "Visualization cache cleared for room: ".concat(e) : "All visualization caches cleared";
}, a([ Uo({
name: "toggleVisualizations",
description: "Toggle all visualizations on/off",
usage: "toggleVisualizations()",
examples: [ "toggleVisualizations()" ],
category: "Visualization"
}) ], e.prototype, "toggleVisualizations", null), a([ Uo({
name: "toggleVisualization",
description: "Toggle a specific room visualization feature",
usage: "toggleVisualization(key)",
examples: [ "toggleVisualization('showPheromones')", "toggleVisualization('showPaths')", "toggleVisualization('showCombat')" ],
category: "Visualization"
}) ], e.prototype, "toggleVisualization", null), a([ Uo({
name: "toggleMapVisualization",
description: "Toggle a specific map visualization feature",
usage: "toggleMapVisualization(key)",
examples: [ "toggleMapVisualization('showRoomStatus')", "toggleMapVisualization('showConnections')", "toggleMapVisualization('showThreats')", "toggleMapVisualization('showExpansion')" ],
category: "Visualization"
}) ], e.prototype, "toggleMapVisualization", null), a([ Uo({
name: "showMapConfig",
description: "Show current map visualization configuration",
usage: "showMapConfig()",
examples: [ "showMapConfig()" ],
category: "Visualization"
}) ], e.prototype, "showMapConfig", null), a([ Uo({
name: "setVisMode",
description: "Set visualization mode preset (debug, presentation, minimal, performance)",
usage: "setVisMode(mode)",
examples: [ "setVisMode('debug')", "setVisMode('presentation')", "setVisMode('minimal')", "setVisMode('performance')" ],
category: "Visualization"
}) ], e.prototype, "setVisMode", null), a([ Uo({
name: "toggleVisLayer",
description: "Toggle a specific visualization layer",
usage: "toggleVisLayer(layer)",
examples: [ "toggleVisLayer('pheromones')", "toggleVisLayer('paths')", "toggleVisLayer('defense')", "toggleVisLayer('economy')", "toggleVisLayer('performance')" ],
category: "Visualization"
}) ], e.prototype, "toggleVisLayer", null), a([ Uo({
name: "showVisPerf",
description: "Show visualization performance metrics",
usage: "showVisPerf()",
examples: [ "showVisPerf()" ],
category: "Visualization"
}) ], e.prototype, "showVisPerf", null), a([ Uo({
name: "showVisConfig",
description: "Show current visualization configuration",
usage: "showVisConfig()",
examples: [ "showVisConfig()" ],
category: "Visualization"
}) ], e.prototype, "showVisConfig", null), a([ Uo({
name: "clearVisCache",
description: "Clear visualization cache",
usage: "clearVisCache(roomName?)",
examples: [ "clearVisCache()", "clearVisCache('W1N1')" ],
category: "Visualization"
}) ], e.prototype, "clearVisCache", null), e;
}(), sf = function() {
function e() {}
return e.prototype.showStats = function() {
var e = Di.getLatestStats();
return e ? "=== SwarmBot Stats (Tick ".concat(e.tick, ") ===\nCPU: ").concat(e.cpuUsed.toFixed(2), "/").concat(e.cpuLimit, " (Bucket: ").concat(e.cpuBucket, ")\nGCL: ").concat(e.gclLevel, " (").concat((100 * e.gclProgress).toFixed(1), "%)\nGPL: ").concat(e.gplLevel, "\nCreeps: ").concat(e.totalCreeps, "\nRooms: ").concat(e.totalRooms, "\n").concat(e.rooms.map(function(e) {
return "  ".concat(e.roomName, ": RCL").concat(e.rcl, " | ").concat(e.creepCount, " creeps | ").concat(e.storageEnergy, "E");
}).join("\n")) : "No stats available yet. Wait for a few ticks.";
}, e.prototype.cacheStats = function() {
var e, t = pi.getCacheStats(di);
return "=== Object Cache Statistics ===\nCache Size: ".concat(t.size, " entries\nCache Hits: ").concat(t.hits, "\nCache Misses: ").concat(t.misses, "\nHit Rate: ").concat(t.hitRate.toFixed(2), "%\nEstimated CPU Saved: ").concat((null !== (e = t.cpuSaved) && void 0 !== e ? e : 0).toFixed(3), " CPU\n\nPerformance: ").concat(t.hitRate >= 80 ? "Excellent" : t.hitRate >= 60 ? "Good" : t.hitRate >= 40 ? "Fair" : "Poor");
}, e.prototype.resetCacheStats = function() {
return pi.clear(di), "Cache statistics reset";
}, e.prototype.roomFindCacheStats = function() {
var e = function() {
var e = pi.getCacheStats(vi);
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
return pi.clear(vi), "Room.find() cache cleared and statistics reset";
}, e.prototype.toggleProfiling = function() {
var e = !Cn().profiling;
return Sn({
profiling: e
}), Ii.setEnabled(e), uo({
cpuLogging: e
}), "Profiling: ".concat(e ? "ENABLED" : "DISABLED");
}, e.prototype.cpuBreakdown = function(e) {
var t, r, o, n, a, s, c, l, u = Memory.stats;
if (!u) return "No stats available. Stats collection may be disabled.";
var m = !e, p = [ "=== CPU Breakdown ===" ];
if (p.push("Tick: ".concat(u.tick)), p.push("Total CPU: ".concat(u.cpu.used.toFixed(2), "/").concat(u.cpu.limit, " (").concat(u.cpu.percent.toFixed(1), "%)")), 
p.push("Bucket: ".concat(u.cpu.bucket)), p.push(""), m || "process" === e) {
var f = u.processes || {}, d = Object.values(f);
if (d.length > 0) {
p.push("=== Process CPU Usage ===");
var y = d.sort(function(e, t) {
return t.avg_cpu - e.avg_cpu;
});
try {
for (var g = i(y.slice(0, 10)), h = g.next(); !h.done; h = g.next()) {
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
for (var T = i(y), C = T.next(); !C.done; C = T.next()) {
var S = C.value, w = S.name || "unknown";
p.push("  ".concat(w, ": ").concat(S.profiler.avg_cpu.toFixed(3), " CPU (RCL ").concat(S.rcl, ")"));
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
var b = u.subsystems || {}, O = Object.values(b);
if (O.length > 0) {
p.push("=== Subsystem CPU Usage ==="), y = O.sort(function(e, t) {
return t.avg_cpu - e.avg_cpu;
});
try {
for (var _ = i(y.slice(0, 10)), x = _.next(); !x.done; x = _.next()) {
var U = x.value, A = U.name || "unknown";
p.push("  ".concat(A, ": ").concat(U.avg_cpu.toFixed(3), " CPU (calls: ").concat(U.calls, ")"));
}
} catch (e) {
a = {
error: e
};
} finally {
try {
x && !x.done && (s = _.return) && s.call(_);
} finally {
if (a) throw a.error;
}
}
p.push("");
}
}
if (m || "creep" === e) {
var N = u.creeps || {}, M = Object.values(N);
if (M.length > 0) {
p.push("=== Top Creeps by CPU (Top 10) ==="), y = M.sort(function(e, t) {
return t.cpu - e.cpu;
});
try {
for (var k = i(y.slice(0, 10)), P = k.next(); !P.done; P = k.next()) {
var I = P.value;
if (I.cpu > 0) {
var G = I.name || "".concat(I.role, "_unknown");
p.push("  ".concat(G, " (").concat(I.role, "): ").concat(I.cpu.toFixed(3), " CPU in ").concat(I.current_room));
}
}
} catch (e) {
c = {
error: e
};
} finally {
try {
P && !P.done && (l = k.return) && l.call(k);
} finally {
if (c) throw c.error;
}
}
p.push("");
}
}
return p.join("\n");
}, e.prototype.cpuBudget = function() {
var e, t, r, o, n = Ii.validateBudgets(), a = "=== CPU Budget Report (Tick ".concat(n.tick, ") ===\n");
if (a += "Rooms Evaluated: ".concat(n.roomsEvaluated, "\n"), a += "Within Budget: ".concat(n.roomsWithinBudget, "\n"), 
a += "Over Budget: ".concat(n.roomsOverBudget, "\n\n"), 0 === n.alerts.length) a += "✓ All rooms within budget!\n"; else {
a += "Alerts: ".concat(n.alerts.length, "\n");
var s = n.alerts.filter(function(e) {
return "critical" === e.severity;
}), c = n.alerts.filter(function(e) {
return "warning" === e.severity;
});
if (s.length > 0) {
a += "\n🔴 CRITICAL (≥100% of budget):\n";
try {
for (var l = i(s), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
a += "  ".concat(m.target, ": ").concat(m.cpuUsed.toFixed(3), " CPU / ").concat(m.budgetLimit.toFixed(3), " limit (").concat((100 * m.percentUsed).toFixed(1), "%)\n");
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
a += "\n⚠️  WARNING (≥80% of budget):\n";
try {
for (var p = i(c), f = p.next(); !f.done; f = p.next()) m = f.value, a += "  ".concat(m.target, ": ").concat(m.cpuUsed.toFixed(3), " CPU / ").concat(m.budgetLimit.toFixed(3), " limit (").concat((100 * m.percentUsed).toFixed(1), "%)\n");
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
}
}
return a;
}, e.prototype.cpuAnomalies = function() {
var e, t, r, o, n = Ii.detectAnomalies();
if (0 === n.length) return "✓ No CPU anomalies detected";
var a = "=== CPU Anomalies Detected: ".concat(n.length, " ===\n\n"), s = n.filter(function(e) {
return "spike" === e.type;
}), c = n.filter(function(e) {
return "sustained_high" === e.type;
});
if (s.length > 0) {
a += "⚡ CPU Spikes (".concat(s.length, "):\n");
try {
for (var l = i(s), u = l.next(); !u.done; u = l.next()) {
var m = u.value;
a += "  ".concat(m.target, ": ").concat(m.current.toFixed(3), " CPU (").concat(m.multiplier.toFixed(1), "x baseline ").concat(m.baseline.toFixed(3), ")\n"), 
m.context && (a += "    Context: ".concat(m.context, "\n"));
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
a += "\n";
}
if (c.length > 0) {
a += "📊 Sustained High Usage (".concat(c.length, "):\n");
try {
for (var p = i(c), f = p.next(); !f.done; f = p.next()) m = f.value, a += "  ".concat(m.target, ": ").concat(m.current.toFixed(3), " CPU (").concat(m.multiplier.toFixed(1), "x budget ").concat(m.baseline.toFixed(3), ")\n"), 
m.context && (a += "    Context: ".concat(m.context, "\n"));
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
}
return a;
}, e.prototype.cpuProfile = function(e) {
var t, r, o, n;
void 0 === e && (e = !1);
var a = Ii.getCurrentSnapshot(), s = "=== CPU Profile (Tick ".concat(a.tick, ") ===\n");
s += "Total: ".concat(a.cpu.used.toFixed(2), " / ").concat(a.cpu.limit, " (").concat(a.cpu.percent.toFixed(1), "%)\n"), 
s += "Bucket: ".concat(a.cpu.bucket, "\n"), s += "Heap: ".concat(a.cpu.heapUsed.toFixed(2), " MB\n\n");
var c = Object.values(a.rooms).sort(function(e, t) {
return t.profiler.avgCpu - e.profiler.avgCpu;
}), l = e ? c : c.slice(0, 10);
s += "Top ".concat(l.length, " Rooms by CPU:\n");
try {
for (var u = i(l), m = u.next(); !m.done; m = u.next()) {
var p = m.value, f = Ii.postureCodeToName(p.brain.postureCode);
s += "  ".concat(p.name, " (RCL").concat(p.rcl, ", ").concat(f, "): avg ").concat(p.profiler.avgCpu.toFixed(3), " | peak ").concat(p.profiler.peakCpu.toFixed(3), " | samples ").concat(p.profiler.samples, "\n");
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
var d = Object.values(a.processes).filter(function(e) {
return e.avgCpu > .001;
}).sort(function(e, t) {
return t.avgCpu - e.avgCpu;
}).slice(0, e ? 999 : 10);
try {
for (var y = i(d), g = y.next(); !g.done; g = y.next()) {
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
}, e.prototype.diagnoseRoom = function(e) {
var t, r, o, n;
if (!e) return "Error: Room name required. Usage: diagnoseRoom('W16S52')";
if (!Game.rooms[e]) return "Error: Room ".concat(e, " not visible. Make sure you have vision in this room.");
var a = Ii.getCurrentSnapshot(), c = a.rooms[e];
if (!c) return "Error: No stats available for ".concat(e, ". The room may not have been processed yet.");
var l = "room:".concat(e), u = a.processes[l], m = Rn.getSwarmState(e), p = m && ("war" === m.posture || "siege" === m.posture || m.danger >= 2), f = p ? .25 : .1, d = null !== (o = null == u ? void 0 : u.tickModulo) && void 0 !== o ? o : 1, y = f * d, g = "═══════════════════════════════════════════════\n";
g += "  Room Diagnostic: ".concat(e, "\n"), g += "═══════════════════════════════════════════════\n\n", 
g += "📊 Basic Info:\n", g += "  RCL: ".concat(c.rcl, "\n"), g += "  Controller Progress: ".concat(c.controller.progressPercent.toFixed(1), "%\n"), 
g += "  Posture: ".concat(Ii.postureCodeToName(c.brain.postureCode), "\n"), g += "  Danger Level: ".concat(c.brain.dangerLevel, "\n"), 
g += "  Hostiles: ".concat(c.metrics.hostileCount, "\n\n"), g += "⚡ CPU Analysis:\n", 
g += "  Average CPU: ".concat(c.profiler.avgCpu.toFixed(3), "\n"), g += "  Peak CPU: ".concat(c.profiler.peakCpu.toFixed(3), "\n"), 
g += "  Samples: ".concat(c.profiler.samples, "\n"), g += "  Budget: ".concat(y.toFixed(3), " (base ").concat(f, ", modulo ").concat(d, ")\n");
var h = c.profiler.avgCpu / y * 100;
g += "  Status: ".concat(h >= 100 ? "🔴 CRITICAL" : h >= 80 ? "⚠️  WARNING" : "✅ OK", " (").concat(h.toFixed(1), "% of budget)\n"), 
d > 1 && (g += "  Note: Room runs every ".concat(d, " ticks (distributed execution)\n")), 
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
for (var E = i(v), T = E.next(); !T.done; T = E.next()) {
var C = null !== (n = T.value.memory.role) && void 0 !== n ? n : "unknown";
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
var t = s(e, 2), r = t[0], o = t[1];
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
g += "     - War mode increases CPU budget to ".concat(p ? y.toFixed(3) : (.25 * d).toFixed(3), "\n")), 
g += "\n", (g += "Use cpuBreakdown('room') to see all rooms\n") + "Use cpuProfile() for detailed profiling";
}, a([ Uo({
name: "showStats",
description: "Show current bot statistics from memory segment",
usage: "showStats()",
examples: [ "showStats()" ],
category: "Statistics"
}) ], e.prototype, "showStats", null), a([ Uo({
name: "cacheStats",
description: "Show object cache statistics (hits, misses, hit rate, CPU savings)",
usage: "cacheStats()",
examples: [ "cacheStats()" ],
category: "Statistics"
}) ], e.prototype, "cacheStats", null), a([ Uo({
name: "resetCacheStats",
description: "Reset cache statistics counters (for benchmarking)",
usage: "resetCacheStats()",
examples: [ "resetCacheStats()" ],
category: "Statistics"
}) ], e.prototype, "resetCacheStats", null), a([ Uo({
name: "roomFindCacheStats",
description: "Show room.find() cache statistics (hits, misses, hit rate)",
usage: "roomFindCacheStats()",
examples: [ "roomFindCacheStats()" ],
category: "Statistics"
}) ], e.prototype, "roomFindCacheStats", null), a([ Uo({
name: "clearRoomFindCache",
description: "Clear all room.find() cache entries and reset stats",
usage: "clearRoomFindCache()",
examples: [ "clearRoomFindCache()" ],
category: "Statistics"
}) ], e.prototype, "clearRoomFindCache", null), a([ Uo({
name: "toggleProfiling",
description: "Toggle CPU profiling on/off",
usage: "toggleProfiling()",
examples: [ "toggleProfiling()" ],
category: "Statistics"
}) ], e.prototype, "toggleProfiling", null), a([ Uo({
name: "cpuBreakdown",
description: "Show detailed CPU breakdown by process, room, creep, and subsystem",
usage: "cpuBreakdown(type?)",
examples: [ "cpuBreakdown() // Show all breakdowns", "cpuBreakdown('process') // Show only process breakdown", "cpuBreakdown('room') // Show only room breakdown", "cpuBreakdown('creep') // Show only creep breakdown", "cpuBreakdown('subsystem') // Show only subsystem breakdown" ],
category: "Statistics"
}) ], e.prototype, "cpuBreakdown", null), a([ Uo({
name: "cpuBudget",
description: "Show CPU budget status and violations for all rooms",
usage: "cpuBudget()",
examples: [ "cpuBudget()" ],
category: "Statistics"
}) ], e.prototype, "cpuBudget", null), a([ Uo({
name: "cpuAnomalies",
description: "Detect and show CPU usage anomalies (spikes and sustained high usage)",
usage: "cpuAnomalies()",
examples: [ "cpuAnomalies()" ],
category: "Statistics"
}) ], e.prototype, "cpuAnomalies", null), a([ Uo({
name: "cpuProfile",
description: "Show comprehensive CPU profiling breakdown by room and subsystem",
usage: "cpuProfile(showAll?)",
examples: [ "cpuProfile()", "cpuProfile(true)" ],
category: "Statistics"
}) ], e.prototype, "cpuProfile", null), a([ Uo({
name: "diagnoseRoom",
description: "Comprehensive diagnostic for a specific room showing CPU usage, budget status, and potential issues",
usage: "diagnoseRoom(roomName)",
examples: [ "diagnoseRoom('W16S52')", "diagnoseRoom('E1S1')" ],
category: "Statistics"
}) ], e.prototype, "diagnoseRoom", null), e;
}(), cf = function() {
function e() {}
return e.prototype.showKernelStats = function() {
var e, t, r, o, n = On.getStatsSummary(), a = On.getConfig(), s = On.getBucketMode(), c = "=== Kernel Stats ===\nBucket Mode: ".concat(s.toUpperCase(), "\nCPU Bucket: ").concat(Game.cpu.bucket, "\nCPU Limit: ").concat(On.getCpuLimit().toFixed(2), " (").concat((100 * a.targetCpuUsage).toFixed(0), "% of ").concat(Game.cpu.limit, ")\nRemaining CPU: ").concat(On.getRemainingCpu().toFixed(2), "\n\nProcesses: ").concat(n.totalProcesses, " total (").concat(n.activeProcesses, " active, ").concat(n.suspendedProcesses, " suspended)\nTotal CPU Used: ").concat(n.totalCpuUsed.toFixed(3), "\nAvg CPU/Process: ").concat(n.avgCpuPerProcess.toFixed(4), "\nAvg Health Score: ").concat(n.avgHealthScore.toFixed(1), "/100\n\nTop CPU Consumers:");
try {
for (var l = i(n.topCpuProcesses), u = l.next(); !u.done; u = l.next()) {
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
for (var p = i(n.unhealthyProcesses), f = p.next(); !f.done; f = p.next()) m = f.value, 
c += "\n  ".concat(m.name, ": ").concat(m.healthScore.toFixed(1), "/100 (").concat(m.consecutiveErrors, " consecutive errors)");
} catch (e) {
r = {
error: e
};
} finally {
try {
f && !f.done && (o = p.return) && o.call(p);
} finally {
if (r) throw r.error;
}
}
}
return c;
}, e.prototype.listProcesses = function() {
var e, t, r = On.getProcesses();
if (0 === r.length) return "No processes registered with kernel.";
var o = "=== Registered Processes ===\n";
o += "ID | Name | Priority | Frequency | State | Runs | Avg CPU | Health | Errors\n", 
o += "-".repeat(100) + "\n";
var n = c([], s(r), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var a = i(n), l = a.next(); !l.done; l = a.next()) {
var u = l.value, m = u.stats.avgCpu.toFixed(4), p = u.stats.healthScore.toFixed(0), f = u.stats.healthScore >= 80 ? "✓" : u.stats.healthScore >= 50 ? "⚠" : "✗";
o += "".concat(u.id, " | ").concat(u.name, " | ").concat(u.priority, " | ").concat(u.frequency, " | ").concat(u.state, " | ").concat(u.stats.runCount, " | ").concat(m, " | ").concat(f).concat(p, " | ").concat(u.stats.errorCount, "(").concat(u.stats.consecutiveErrors, ")\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o;
}, e.prototype.suspendProcess = function(e) {
var t = On.suspendProcess(e);
return 'Process "'.concat(e, t ? '" suspended.' : '" not found.');
}, e.prototype.resumeProcess = function(e) {
var t = On.resumeProcess(e);
return 'Process "'.concat(e, t ? '" resumed.' : '" not found or not suspended.');
}, e.prototype.resetKernelStats = function() {
return On.resetStats(), "Kernel statistics reset.";
}, e.prototype.showProcessHealth = function() {
var e, t, r = On.getProcesses();
if (0 === r.length) return "No processes registered with kernel.";
var o = c([], s(r), !1).sort(function(e, t) {
return e.stats.healthScore - t.stats.healthScore;
}), n = "=== Process Health Status ===\n";
n += "Name | Health | Errors | Consecutive | Status | Last Success\n", n += "-".repeat(80) + "\n";
try {
for (var a = i(o), l = a.next(); !l.done; l = a.next()) {
var u = l.value, m = u.stats.healthScore.toFixed(0), p = u.stats.healthScore >= 80 ? "✓" : u.stats.healthScore >= 50 ? "⚠" : "✗", f = u.stats.lastSuccessfulRunTick > 0 ? Game.time - u.stats.lastSuccessfulRunTick : "never", d = "suspended" === u.state ? "SUSPENDED (".concat(u.stats.suspensionReason, ")") : u.state.toUpperCase();
n += "".concat(u.name, " | ").concat(p, " ").concat(m, "/100 | ").concat(u.stats.errorCount, " | ").concat(u.stats.consecutiveErrors, " | ").concat(d, " | ").concat(f, "\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
var y = On.getStatsSummary();
return (n += "\nAverage Health: ".concat(y.avgHealthScore.toFixed(1), "/100")) + "\nSuspended Processes: ".concat(y.suspendedProcesses);
}, e.prototype.resumeAllProcesses = function() {
var e, t, r = On.getProcesses().filter(function(e) {
return "suspended" === e.state;
});
if (0 === r.length) return "No suspended processes to resume.";
var o = 0;
try {
for (var n = i(r), a = n.next(); !a.done; a = n.next()) {
var s = a.value;
On.resumeProcess(s.id) && o++;
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
var e, t, r = Vm.getStats(), o = "=== Creep Process Stats ===\nTotal Creeps: ".concat(r.totalCreeps, "\nRegistered Processes: ").concat(r.registeredCreeps, "\n\nCreeps by Priority:");
try {
for (var n = i(Object.entries(r.creepsByPriority)), a = n.next(); !a.done; a = n.next()) {
var c = s(a.value, 2), l = c[0], u = c[1];
o += "\n  ".concat(l, ": ").concat(u);
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
var e, t, r = Ap.getStats(), o = "=== Room Process Stats ===\nTotal Rooms: ".concat(r.totalRooms, "\nRegistered Processes: ").concat(r.registeredRooms, "\nOwned Rooms: ").concat(r.ownedRooms, "\n\nRooms by Priority:");
try {
for (var n = i(Object.entries(r.roomsByPriority)), a = n.next(); !a.done; a = n.next()) {
var c = s(a.value, 2), l = c[0], u = c[1];
o += "\n  ".concat(l, ": ").concat(u);
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
var t, r, o = On.getProcesses().filter(function(e) {
return e.id.startsWith("creep:");
});
if (e && (o = o.filter(function(t) {
return t.name.includes("(".concat(e, ")"));
})), 0 === o.length) return e ? "No creep processes found with role: ".concat(e) : "No creep processes registered.";
var n = e ? "=== Creep Processes (Role: ".concat(e, ") ===\n") : "=== All Creep Processes ===\n";
n += "Name | Priority | Runs | Avg CPU | Errors\n", n += "-".repeat(70) + "\n";
var a = c([], s(o), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var l = i(a), u = l.next(); !u.done; u = l.next()) {
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
var e, t, r = On.getProcesses().filter(function(e) {
return e.id.startsWith("room:");
});
if (0 === r.length) return "No room processes registered.";
var o = "=== Room Processes ===\n";
o += "Name | Priority | Runs | Avg CPU | Errors\n", o += "-".repeat(70) + "\n";
var n = c([], s(r), !1).sort(function(e, t) {
return t.priority - e.priority;
});
try {
for (var a = i(n), l = a.next(); !l.done; l = a.next()) {
var u = l.value, m = u.stats.avgCpu.toFixed(4);
o += "".concat(u.name, " | ").concat(u.priority, " | ").concat(u.stats.runCount, " | ").concat(m, " | ").concat(u.stats.errorCount, "\n");
}
} catch (t) {
e = {
error: t
};
} finally {
try {
l && !l.done && (t = a.return) && t.call(a);
} finally {
if (e) throw e.error;
}
}
return o + "\nTotal: ".concat(r.length, " room processes");
}, a([ Uo({
name: "showKernelStats",
description: "Show kernel statistics including CPU usage and process info",
usage: "showKernelStats()",
examples: [ "showKernelStats()" ],
category: "Kernel"
}) ], e.prototype, "showKernelStats", null), a([ Uo({
name: "listProcesses",
description: "List all registered kernel processes",
usage: "listProcesses()",
examples: [ "listProcesses()" ],
category: "Kernel"
}) ], e.prototype, "listProcesses", null), a([ Uo({
name: "suspendProcess",
description: "Suspend a kernel process by ID",
usage: "suspendProcess(processId)",
examples: [ "suspendProcess('empire:manager')", "suspendProcess('cluster:manager')" ],
category: "Kernel"
}) ], e.prototype, "suspendProcess", null), a([ Uo({
name: "resumeProcess",
description: "Resume a suspended kernel process",
usage: "resumeProcess(processId)",
examples: [ "resumeProcess('empire:manager')" ],
category: "Kernel"
}) ], e.prototype, "resumeProcess", null), a([ Uo({
name: "resetKernelStats",
description: "Reset all kernel process statistics",
usage: "resetKernelStats()",
examples: [ "resetKernelStats()" ],
category: "Kernel"
}) ], e.prototype, "resetKernelStats", null), a([ Uo({
name: "showProcessHealth",
description: "Show health status of all processes with detailed metrics",
usage: "showProcessHealth()",
examples: [ "showProcessHealth()" ],
category: "Kernel"
}) ], e.prototype, "showProcessHealth", null), a([ Uo({
name: "resumeAllProcesses",
description: "Resume all suspended processes (use with caution)",
usage: "resumeAllProcesses()",
examples: [ "resumeAllProcesses()" ],
category: "Kernel"
}) ], e.prototype, "resumeAllProcesses", null), a([ Uo({
name: "showCreepStats",
description: "Show statistics about creep processes managed by the kernel",
usage: "showCreepStats()",
examples: [ "showCreepStats()" ],
category: "Kernel"
}) ], e.prototype, "showCreepStats", null), a([ Uo({
name: "showRoomStats",
description: "Show statistics about room processes managed by the kernel",
usage: "showRoomStats()",
examples: [ "showRoomStats()" ],
category: "Kernel"
}) ], e.prototype, "showRoomStats", null), a([ Uo({
name: "listCreepProcesses",
description: "List all creep processes with their details",
usage: "listCreepProcesses(role?)",
examples: [ "listCreepProcesses()", "listCreepProcesses('harvester')" ],
category: "Kernel"
}) ], e.prototype, "listCreepProcesses", null), a([ Uo({
name: "listRoomProcesses",
description: "List all room processes with their details",
usage: "listRoomProcesses()",
examples: [ "listRoomProcesses()" ],
category: "Kernel"
}) ], e.prototype, "listRoomProcesses", null), e;
}(), lf = new Si, uf = new af, mf = new sf, pf = new bi, ff = new cf, df = new wi, yf = wo("Main");

!function(e) {
void 0 === e && (e = !1);
var t = function() {
xo.initialize(), Ao(lf), Ao(uf), Ao(mf), Ao(pf), Ao(ff), Ao(df), Ao(qn), Ao(zn), 
Ao(Xn), Ao($n), Ao(ra), Ao(va), Ao(Ha), global.tooangel = Fa;
var e = global;
e.botConfig = {
getConfig: Cn,
updateConfig: Sn
}, e.botLogger = {
configureLogger: uo
}, e.botVisualizationManager = nf, e.botCacheManager = pi, xo.exposeToGlobal();
};
e ? (xo.initialize(), xo.enableLazyLoading(t), xo.exposeToGlobal()) : t();
}(Cn().lazyLoadConsoleCommands);

var gf = io.wrapLoop(function() {
try {
tf();
} catch (e) {
throw yf.error("Critical error in main loop: ".concat(String(e)), {
meta: {
stack: e instanceof Error ? e.stack : void 0,
tick: Game.time
}
}), e;
}
});

exports.loop = gf;
