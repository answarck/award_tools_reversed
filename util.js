const JE = require("crypto-js");
var DB,
  OB = (function () {
    function e(t, n) {
      ((this.hexDigits = "0123456789ABCDEF"),
        t instanceof e
          ? ((this.enc = t.enc), (this.pos = t.pos))
          : ((this.enc = t), (this.pos = n)));
    }
    return (
      (e.prototype.get = function (e) {
        if ((void 0 === e && (e = this.pos++), e >= this.enc.length))
          throw new Error(
            "Requesting byte offset "
              .concat(e, " on a stream of length ")
              .concat(this.enc.length),
          );
        return "string" == typeof this.enc
          ? this.enc.charCodeAt(e)
          : this.enc[e];
      }),
      (e.prototype.hexByte = function (e) {
        return (
          this.hexDigits.charAt((e >> 4) & 15) + this.hexDigits.charAt(15 & e)
        );
      }),
      (e.prototype.hexDump = function (e, t, n) {
        for (var a = "", r = e; r < t; ++r)
          if (((a += this.hexByte(this.get(r))), !0 !== n))
            switch (15 & r) {
              case 7:
                a += "  ";
                break;
              case 15:
                a += "\n";
                break;
              default:
                a += " ";
            }
        return a;
      }),
      (e.prototype.isASCII = function (e, t) {
        for (var n = e; n < t; ++n) {
          var a = this.get(n);
          if (a < 32 || a > 176) return !1;
        }
        return !0;
      }),
      (e.prototype.parseStringISO = function (e, t) {
        for (var n = "", a = e; a < t; ++a)
          n += String.fromCharCode(this.get(a));
        return n;
      }),
      (e.prototype.parseStringUTF = function (e, t) {
        for (var n = "", a = e; a < t; ) {
          var r = this.get(a++);
          n +=
            r < 128
              ? String.fromCharCode(r)
              : r > 191 && r < 224
                ? String.fromCharCode(((31 & r) << 6) | (63 & this.get(a++)))
                : String.fromCharCode(
                    ((15 & r) << 12) |
                      ((63 & this.get(a++)) << 6) |
                      (63 & this.get(a++)),
                  );
        }
        return n;
      }),
      (e.prototype.parseStringBMP = function (e, t) {
        for (var n, a, r = "", i = e; i < t; )
          ((n = this.get(i++)),
            (a = this.get(i++)),
            (r += String.fromCharCode((n << 8) | a)));
        return r;
      }),
      (e.prototype.parseTime = function (e, t, n) {
        var a = this.parseStringISO(e, t),
          r = (n ? PB : EB).exec(a);
        return r
          ? (n && ((r[1] = +r[1]), (r[1] += +r[1] < 70 ? 2e3 : 1900)),
            (a = r[1] + "-" + r[2] + "-" + r[3] + " " + r[4]),
            r[5] &&
              ((a += ":" + r[5]),
              r[6] && ((a += ":" + r[6]), r[7] && (a += "." + r[7]))),
            r[8] &&
              ((a += " UTC"),
              "Z" != r[8] && ((a += r[8]), r[9] && (a += ":" + r[9]))),
            a)
          : "Unrecognized time: " + a;
      }),
      (e.prototype.parseInteger = function (e, t) {
        for (
          var n, a = this.get(e), r = a > 127, i = r ? 255 : 0, o = "";
          a == i && ++e < t;
        )
          a = this.get(e);
        if (0 === (n = t - e)) return r ? -1 : 0;
        if (n > 4) {
          for (o = a, n <<= 3; !(128 & (+o ^ i)); ) ((o = +o << 1), --n);
          o = "(" + n + " bit)\n";
        }
        r && (a -= 256);
        for (var s = new NB(a), l = e + 1; l < t; ++l)
          s.mulAdd(256, this.get(l));
        return o + s.toString();
      }),
      (e.prototype.parseBitString = function (e, t, n) {
        for (
          var a = this.get(e),
            r = "(" + (((t - e - 1) << 3) - a) + " bit)\n",
            i = "",
            o = e + 1;
          o < t;
          ++o
        ) {
          for (var s = this.get(o), l = o == t - 1 ? a : 0, c = 7; c >= l; --c)
            i += (s >> c) & 1 ? "1" : "0";
          if (i.length > n) return r + LB(i, n);
        }
        return r + i;
      }),
      (e.prototype.parseOctetString = function (e, t, n) {
        if (this.isASCII(e, t)) return LB(this.parseStringISO(e, t), n);
        var a = t - e,
          r = "(" + a + " byte)\n";
        a > (n /= 2) && (t = e + n);
        for (var i = e; i < t; ++i) r += this.hexByte(this.get(i));
        return (a > n && (r += "…"), r);
      }),
      (e.prototype.parseOID = function (e, t, n) {
        for (var a = "", r = new NB(), i = 0, o = e; o < t; ++o) {
          var s = this.get(o);
          if ((r.mulAdd(128, 127 & s), (i += 7), !(128 & s))) {
            if ("" === a)
              if ((r = r.simplify()) instanceof NB)
                (r.sub(80), (a = "2." + r.toString()));
              else {
                var l = r < 80 ? (r < 40 ? 0 : 1) : 2;
                a = l + "." + (r - 40 * l);
              }
            else a += "." + r.toString();
            if (a.length > n) return LB(a, n);
            ((r = new NB()), (i = 0));
          }
        }
        return (i > 0 && (a += ".incomplete"), a);
      }),
      e
    );
  })(),
  BB = (function () {
    function e(e, t, n, a, r) {
      if (!(a instanceof FB)) throw new Error("Invalid tag value.");
      ((this.stream = e),
        (this.header = t),
        (this.length = n),
        (this.tag = a),
        (this.sub = r));
    }
    return (
      (e.prototype.typeName = function () {
        switch (this.tag.tagClass) {
          case 0:
            switch (this.tag.tagNumber) {
              case 0:
                return "EOC";
              case 1:
                return "BOOLEAN";
              case 2:
                return "INTEGER";
              case 3:
                return "BIT_STRING";
              case 4:
                return "OCTET_STRING";
              case 5:
                return "NULL";
              case 6:
                return "OBJECT_IDENTIFIER";
              case 7:
                return "ObjectDescriptor";
              case 8:
                return "EXTERNAL";
              case 9:
                return "REAL";
              case 10:
                return "ENUMERATED";
              case 11:
                return "EMBEDDED_PDV";
              case 12:
                return "UTF8String";
              case 16:
                return "SEQUENCE";
              case 17:
                return "SET";
              case 18:
                return "NumericString";
              case 19:
                return "PrintableString";
              case 20:
                return "TeletexString";
              case 21:
                return "VideotexString";
              case 22:
                return "IA5String";
              case 23:
                return "UTCTime";
              case 24:
                return "GeneralizedTime";
              case 25:
                return "GraphicString";
              case 26:
                return "VisibleString";
              case 27:
                return "GeneralString";
              case 28:
                return "UniversalString";
              case 30:
                return "BMPString";
            }
            return "Universal_" + this.tag.tagNumber.toString();
          case 1:
            return "Application_" + this.tag.tagNumber.toString();
          case 2:
            return "[" + this.tag.tagNumber.toString() + "]";
          case 3:
            return "Private_" + this.tag.tagNumber.toString();
        }
      }),
      (e.prototype.content = function (e) {
        if (void 0 === this.tag) return null;
        void 0 === e && (e = 1 / 0);
        var t = this.posContent(),
          n = Math.abs(this.length);
        if (!this.tag.isUniversal())
          return null !== this.sub
            ? "(" + this.sub.length + " elem)"
            : this.stream.parseOctetString(t, t + n, e);
        switch (this.tag.tagNumber) {
          case 1:
            return 0 === this.stream.get(t) ? "false" : "true";
          case 2:
            return this.stream.parseInteger(t, t + n);
          case 3:
            return this.sub
              ? "(" + this.sub.length + " elem)"
              : this.stream.parseBitString(t, t + n, e);
          case 4:
            return this.sub
              ? "(" + this.sub.length + " elem)"
              : this.stream.parseOctetString(t, t + n, e);
          case 6:
            return this.stream.parseOID(t, t + n, e);
          case 16:
          case 17:
            return null !== this.sub
              ? "(" + this.sub.length + " elem)"
              : "(no elem)";
          case 12:
            return LB(this.stream.parseStringUTF(t, t + n), e);
          case 18:
          case 19:
          case 20:
          case 21:
          case 22:
          case 26:
            return LB(this.stream.parseStringISO(t, t + n), e);
          case 30:
            return LB(this.stream.parseStringBMP(t, t + n), e);
          case 23:
          case 24:
            return this.stream.parseTime(t, t + n, 23 == this.tag.tagNumber);
        }
        return null;
      }),
      (e.prototype.toString = function () {
        return (
          this.typeName() +
          "@" +
          this.stream.pos +
          "[header:" +
          this.header +
          ",length:" +
          this.length +
          ",sub:" +
          (null === this.sub ? "null" : this.sub.length) +
          "]"
        );
      }),
      (e.prototype.toPrettyString = function (e) {
        void 0 === e && (e = "");
        var t = e + this.typeName() + " @" + this.stream.pos;
        if (
          (this.length >= 0 && (t += "+"),
          (t += this.length),
          this.tag.tagConstructed
            ? (t += " (constructed)")
            : !this.tag.isUniversal() ||
              (3 != this.tag.tagNumber && 4 != this.tag.tagNumber) ||
              null === this.sub ||
              (t += " (encapsulates)"),
          (t += "\n"),
          null !== this.sub)
        ) {
          e += "  ";
          for (var n = 0, a = this.sub.length; n < a; ++n)
            t += this.sub[n].toPrettyString(e);
        }
        return t;
      }),
      (e.prototype.posStart = function () {
        return this.stream.pos;
      }),
      (e.prototype.posContent = function () {
        return this.stream.pos + this.header;
      }),
      (e.prototype.posEnd = function () {
        return this.stream.pos + this.header + Math.abs(this.length);
      }),
      (e.prototype.toHexString = function () {
        return this.stream.hexDump(this.posStart(), this.posEnd(), !0);
      }),
      (e.decodeLength = function (e) {
        var t = e.get(),
          n = 127 & t;
        if (n == t) return n;
        if (n > 6)
          throw new Error(
            "Length over 48 bits not supported at position " + (e.pos - 1),
          );
        if (0 === n) return null;
        t = 0;
        for (var a = 0; a < n; ++a) t = 256 * t + e.get();
        return t;
      }),
      (e.prototype.getHexStringValue = function () {
        var e = this.toHexString(),
          t = 2 * this.header,
          n = 2 * this.length;
        return e.substring(t, t + n);
      }),
      (e.decode = function (t) {
        var n;
        n = t instanceof OB ? t : new OB(t, 0);
        var a = new OB(n),
          r = new FB(n),
          i = e.decodeLength(n),
          o = n.pos,
          s = o - a.pos,
          l = null,
          c = function () {
            var t = [];
            if (null !== i) {
              for (var a = o + i; n.pos < a; ) t[t.length] = e.decode(n);
              if (n.pos != a)
                throw new Error(
                  "Content size is not correct for container starting at offset " +
                    o,
                );
            } else
              try {
                for (;;) {
                  var r = e.decode(n);
                  if (r.tag.isEOC()) break;
                  t[t.length] = r;
                }
                i = o - n.pos;
              } catch (wh) {
                throw new Error(
                  "Exception while decoding undefined length content: " + wh,
                );
              }
            return t;
          };
        if (r.tagConstructed) l = c();
        else if (r.isUniversal() && (3 == r.tagNumber || 4 == r.tagNumber))
          try {
            if (3 == r.tagNumber && 0 != n.get())
              throw new Error(
                "BIT STRINGs with unused bits cannot encapsulate.",
              );
            l = c();
            for (var u = 0; u < l.length; ++u)
              if (l[u].tag.isEOC())
                throw new Error("EOC is not supposed to be actual content.");
          } catch (wh) {
            l = null;
          }
        if (null === l) {
          if (null === i)
            throw new Error(
              "We can't skip over an invalid tag with undefined length at offset " +
                o,
            );
          n.pos = o + Math.abs(i);
        }
        return new e(a, s, i, r, l);
      }),
      e
    );
  })(),
  FB = (function () {
    function e(e) {
      var t = e.get();
      if (
        ((this.tagClass = t >> 6),
        (this.tagConstructed = !!(32 & t)),
        (this.tagNumber = 31 & t),
        31 == this.tagNumber)
      ) {
        var n = new NB();
        do {
          ((t = e.get()), n.mulAdd(128, 127 & t));
        } while (128 & t);
        this.tagNumber = n.simplify();
      }
    }
    return (
      (e.prototype.isUniversal = function () {
        return 0 === this.tagClass;
      }),
      (e.prototype.isEOC = function () {
        return 0 === this.tagClass && 0 === this.tagNumber;
      }),
      e
    );
  })();

var TB,
  IB = {
    decode: function (e) {
      var t;
      if (void 0 === TB) {
        for (TB = Object.create(null), t = 0; t < 64; ++t)
          TB[
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(
              t,
            )
          ] = t;
        for (TB["-"] = 62, TB._ = 63, t = 0; t < 9; ++t)
          TB["= \f\n\r\t \u2028\u2029".charAt(t)] = -1;
      }
      var n = [],
        a = 0,
        r = 0;
      for (t = 0; t < e.length; ++t) {
        var i = e.charAt(t);
        if ("=" == i) break;
        if (-1 != (i = TB[i])) {
          if (void 0 === i) throw new Error("Illegal character at offset " + t);
          ((a |= i),
            ++r >= 4
              ? ((n[n.length] = a >> 16),
                (n[n.length] = (a >> 8) & 255),
                (n[n.length] = 255 & a),
                (a = 0),
                (r = 0))
              : (a <<= 6));
        }
      }
      switch (r) {
        case 1:
          throw new Error(
            "Base64 encoding incomplete: at least 2 bits missing",
          );
        case 2:
          n[n.length] = a >> 10;
          break;
        case 3:
          ((n[n.length] = a >> 16), (n[n.length] = (a >> 8) & 255));
      }
      return n;
    },
    re: /-----BEGIN [^-]+-----([A-Za-z0-9+\/=\s]+)-----END [^-]+-----|begin-base64[^\n]+\n([A-Za-z0-9+\/=\s]+)====/,
    unarmor: function (e) {
      var t = IB.re.exec(e);
      if (t)
        if (t[1]) e = t[1];
        else {
          if (!t[2]) throw new Error("RegExp out of sync");
          e = t[2];
        }
      return IB.decode(e);
    },
  };
var SB,
  _B = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var RB = 1e13,
  NB = (function () {
    function e(e) {
      this.buf = [+e || 0];
    }
    return (
      (e.prototype.mulAdd = function (e, t) {
        var n,
          a,
          r = this.buf,
          i = r.length;
        for (n = 0; n < i; ++n)
          ((a = r[n] * e + t) < RB ? (t = 0) : (a -= (t = 0 | (a / RB)) * RB),
            (r[n] = a));
        t > 0 && (r[n] = t);
      }),
      (e.prototype.sub = function (e) {
        var t,
          n,
          a = this.buf,
          r = a.length;
        for (t = 0; t < r; ++t)
          ((n = a[t] - e) < 0 ? ((n += RB), (e = 1)) : (e = 0), (a[t] = n));
        for (; 0 === a[a.length - 1]; ) a.pop();
      }),
      (e.prototype.toString = function (e) {
        if (10 != (e || 10)) throw new Error("only base 10 is supported");
        for (
          var t = this.buf, n = t[t.length - 1].toString(), a = t.length - 2;
          a >= 0;
          --a
        )
          n += (RB + t[a]).toString().substring(1);
        return n;
      }),
      (e.prototype.valueOf = function () {
        for (var e = this.buf, t = 0, n = e.length - 1; n >= 0; --n)
          t = t * RB + e[n];
        return t;
      }),
      (e.prototype.simplify = function () {
        var e = this.buf;
        return 1 == e.length ? e[0] : this;
      }),
      e
    );
  })(),
  PB =
    /^(\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/,
  EB =
    /^(\d\d\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/;
function LB(e, t) {
  return (e.length > t && (e = e.substring(0, t) + "…"), e);
}
function kB(e) {
  var t,
    n,
    a = "";
  for (t = 0; t + 3 <= e.length; t += 3)
    ((n = parseInt(e.substring(t, t + 3), 16)),
      (a += _B.charAt(n >> 6) + _B.charAt(63 & n)));
  for (
    t + 1 == e.length
      ? ((n = parseInt(e.substring(t, t + 1), 16)), (a += _B.charAt(n << 2)))
      : t + 2 == e.length &&
        ((n = parseInt(e.substring(t, t + 2), 16)),
        (a += _B.charAt(n >> 2) + _B.charAt((3 & n) << 4)));
    (3 & a.length) > 0;
  )
    a += "=";
  return a;
}

var NF =
  (globalThis && globalThis.__extends) ||
  (function () {
    var e = function (t, n) {
      return (e =
        Object.setPrototypeOf ||
        ({
          __proto__: [],
        } instanceof Array &&
          function (e, t) {
            e.__proto__ = t;
          }) ||
        function (e, t) {
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        })(t, n);
    };
    return function (t, n) {
      if ("function" != typeof n && null !== n)
        throw new TypeError(
          "Class extends value " + String(n) + " is not a constructor or null",
        );
      function a() {
        this.constructor = t;
      }
      (e(t, n),
        (t.prototype =
          null === n
            ? Object.create(n)
            : ((a.prototype = n.prototype), new a())));
    };
  })();
var kF = (function () {
  function e() {
    ((this.n = null),
      (this.e = 0),
      (this.d = null),
      (this.p = null),
      (this.q = null),
      (this.dmp1 = null),
      (this.dmq1 = null),
      (this.coeff = null));
  }
  return (
    (e.prototype.doPublic = function (e) {
      return e.modPowInt(this.e, this.n);
    }),
    (e.prototype.doPrivate = function (e) {
      if (null == this.p || null == this.q) return e.modPow(this.d, this.n);
      for (
        var t = e.mod(this.p).modPow(this.dmp1, this.p),
          n = e.mod(this.q).modPow(this.dmq1, this.q);
        t.compareTo(n) < 0;
      )
        t = t.add(this.p);
      return t
        .subtract(n)
        .multiply(this.coeff)
        .mod(this.p)
        .multiply(this.q)
        .add(n);
    }),
    (e.prototype.setPublic = function (e, t) {
      null != e &&
        null != t &&
        e.length > 0 &&
        t.length > 0 &&
        ((this.n = jB(e, 16)), (this.e = parseInt(t, 16)));
    }),
    (e.prototype.encrypt = function (e, t) {
      void 0 === t && (t = AF);
      var n = (this.n.bitLength() + 7) >> 3,
        a = t(e, n);
      if (null == a) return null;
      var r = this.doPublic(a);
      if (null == r) return null;
      for (var i = r.toString(16), o = i.length, s = 0; s < 2 * n - o; s++)
        i = "0" + i;
      return i;
    }),
    (e.prototype.setPrivate = function (e, t, n) {
      null != e &&
        null != t &&
        e.length > 0 &&
        t.length > 0 &&
        ((this.n = jB(e, 16)),
        (this.e = parseInt(t, 16)),
        (this.d = jB(n, 16)));
    }),
    (e.prototype.setPrivateEx = function (e, t, n, a, r, i, o, s) {
      null != e &&
        null != t &&
        e.length > 0 &&
        t.length > 0 &&
        ((this.n = jB(e, 16)),
        (this.e = parseInt(t, 16)),
        (this.d = jB(n, 16)),
        (this.p = jB(a, 16)),
        (this.q = jB(r, 16)),
        (this.dmp1 = jB(i, 16)),
        (this.dmq1 = jB(o, 16)),
        (this.coeff = jB(s, 16)));
    }),
    (e.prototype.generate = function (e, t) {
      var n = new uF(),
        a = e >> 1;
      this.e = parseInt(t, 16);
      for (var r = new HB(t, 16); ; ) {
        for (
          ;
          (this.p = new HB(e - a, 1, n)),
            0 != this.p.subtract(HB.ONE).gcd(r).compareTo(HB.ONE) ||
              !this.p.isProbablePrime(10);
        );
        for (
          ;
          (this.q = new HB(a, 1, n)),
            0 != this.q.subtract(HB.ONE).gcd(r).compareTo(HB.ONE) ||
              !this.q.isProbablePrime(10);
        );
        if (this.p.compareTo(this.q) <= 0) {
          var i = this.p;
          ((this.p = this.q), (this.q = i));
        }
        var o = this.p.subtract(HB.ONE),
          s = this.q.subtract(HB.ONE),
          l = o.multiply(s);
        if (0 == l.gcd(r).compareTo(HB.ONE)) {
          ((this.n = this.p.multiply(this.q)),
            (this.d = r.modInverse(l)),
            (this.dmp1 = this.d.mod(o)),
            (this.dmq1 = this.d.mod(s)),
            (this.coeff = this.q.modInverse(this.p)));
          break;
        }
      }
    }),
    (e.prototype.decrypt = function (e) {
      var t = jB(e, 16),
        n = this.doPrivate(t);
      return null == n
        ? null
        : (function (e, t) {
            for (var n = e.toByteArray(), a = 0; a < n.length && 0 == n[a]; )
              ++a;
            if (n.length - a != t - 1 || 2 != n[a]) return null;
            for (++a; 0 != n[a]; ) if (++a >= n.length) return null;
            for (var r = ""; ++a < n.length; ) {
              var i = 255 & n[a];
              i < 128
                ? (r += String.fromCharCode(i))
                : i > 191 && i < 224
                  ? ((r += String.fromCharCode(
                      ((31 & i) << 6) | (63 & n[a + 1]),
                    )),
                    ++a)
                  : ((r += String.fromCharCode(
                      ((15 & i) << 12) |
                        ((63 & n[a + 1]) << 6) |
                        (63 & n[a + 2]),
                    )),
                    (a += 2));
            }
            return r;
          })(n, (this.n.bitLength() + 7) >> 3);
    }),
    (e.prototype.generateAsync = function (e, t, n) {
      var a = new uF(),
        r = e >> 1;
      this.e = parseInt(t, 16);
      var i = new HB(t, 16),
        o = this,
        s = function () {
          var t = function () {
              if (o.p.compareTo(o.q) <= 0) {
                var e = o.p;
                ((o.p = o.q), (o.q = e));
              }
              var t = o.p.subtract(HB.ONE),
                a = o.q.subtract(HB.ONE),
                r = t.multiply(a);
              0 == r.gcd(i).compareTo(HB.ONE)
                ? ((o.n = o.p.multiply(o.q)),
                  (o.d = i.modInverse(r)),
                  (o.dmp1 = o.d.mod(t)),
                  (o.dmq1 = o.d.mod(a)),
                  (o.coeff = o.q.modInverse(o.p)),
                  setTimeout(function () {
                    n();
                  }, 0))
                : setTimeout(s, 0);
            },
            l = function () {
              ((o.q = KB()),
                o.q.fromNumberAsync(r, 1, a, function () {
                  o.q.subtract(HB.ONE).gcda(i, function (e) {
                    0 == e.compareTo(HB.ONE) && o.q.isProbablePrime(10)
                      ? setTimeout(t, 0)
                      : setTimeout(l, 0);
                  });
                }));
            },
            c = function () {
              ((o.p = KB()),
                o.p.fromNumberAsync(e - r, 1, a, function () {
                  o.p.subtract(HB.ONE).gcda(i, function (e) {
                    0 == e.compareTo(HB.ONE) && o.p.isProbablePrime(10)
                      ? setTimeout(l, 0)
                      : setTimeout(c, 0);
                  });
                }));
            };
          setTimeout(c, 0);
        };
      setTimeout(s, 0);
    }),
    (e.prototype.sign = function (e, t, n) {
      var a = (MF[n] || "") + t(e).toString(),
        r = this.n.bitLength() / 4,
        i = (function (e, t) {
          if (t < e.length + 22) return null;
          for (var n = t - e.length - 6, a = "", r = 0; r < n; r += 2)
            a += "ff";
          return jB("0001" + a + "00" + e, 16);
        })(a, r);
      if (null == i) return null;
      var o = this.doPrivate(i);
      if (null == o) return null;
      for (var s = o.toString(16), l = s.length, c = 0; c < r - l; c++)
        s = "0" + s;
      return s;
    }),
    (e.prototype.verify = function (e, t, n) {
      var a = jB(t, 16),
        r = this.doPublic(a);
      return null == r
        ? null
        : (function (e) {
            for (var t in MF)
              if (MF.hasOwnProperty(t)) {
                var n = MF[t],
                  a = n.length;
                if (e.substring(0, a) == n) return e.substring(a);
              }
            return e;
          })(r.toString(16).replace(/^1f+00/, "")) == n(e).toString();
    }),
    e
  );
})();
var PF = (function (e) {
  function t(n) {
    var a = e.call(this) || this;
    return (
      n &&
        ("string" == typeof n
          ? a.parseKey(n)
          : (t.hasPrivateKeyProperty(n) || t.hasPublicKeyProperty(n)) &&
            a.parsePropertiesFrom(n)),
      a
    );
  }
  return (
    NF(t, e),
    (t.prototype.parseKey = function (e) {
      try {
        var t = 0,
          n = 0,
          a = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/.test(e)
            ? (function (e) {
                var t;
                if (void 0 === SB) {
                  var n = "0123456789ABCDEF";
                  for (SB = {}, t = 0; t < 16; ++t) SB[n.charAt(t)] = t;
                  for (n = n.toLowerCase(), t = 10; t < 16; ++t)
                    SB[n.charAt(t)] = t;
                  for (t = 0; t < 8; ++t)
                    SB[" \f\n\r\t \u2028\u2029".charAt(t)] = -1;
                }
                var a = [],
                  r = 0,
                  i = 0;
                for (t = 0; t < e.length; ++t) {
                  var o = e.charAt(t);
                  if ("=" == o) break;
                  if (-1 != (o = SB[o])) {
                    if (void 0 === o)
                      throw new Error("Illegal character at offset " + t);
                    ((r |= o),
                      ++i >= 2
                        ? ((a[a.length] = r), (r = 0), (i = 0))
                        : (r <<= 4));
                  }
                }
                if (i)
                  throw new Error("Hex encoding incomplete: 4 bits missing");
                return a;
              })(e)
            : IB.unarmor(e),
          r = BB.decode(a);
        if ((3 === r.sub.length && (r = r.sub[2].sub[0]), 9 === r.sub.length)) {
          ((t = r.sub[1].getHexStringValue()),
            (this.n = jB(t, 16)),
            (n = r.sub[2].getHexStringValue()),
            (this.e = parseInt(n, 16)));
          var i = r.sub[3].getHexStringValue();
          this.d = jB(i, 16);
          var o = r.sub[4].getHexStringValue();
          this.p = jB(o, 16);
          var s = r.sub[5].getHexStringValue();
          this.q = jB(s, 16);
          var l = r.sub[6].getHexStringValue();
          this.dmp1 = jB(l, 16);
          var c = r.sub[7].getHexStringValue();
          this.dmq1 = jB(c, 16);
          var u = r.sub[8].getHexStringValue();
          this.coeff = jB(u, 16);
        } else {
          if (2 !== r.sub.length) return !1;
          if (r.sub[0].sub) {
            var d = r.sub[1].sub[0];
            ((t = d.sub[0].getHexStringValue()),
              (this.n = jB(t, 16)),
              (n = d.sub[1].getHexStringValue()),
              (this.e = parseInt(n, 16)));
          } else
            ((t = r.sub[0].getHexStringValue()),
              (this.n = jB(t, 16)),
              (n = r.sub[1].getHexStringValue()),
              (this.e = parseInt(n, 16)));
        }
        return !0;
      } catch (oz) {
        return !1;
      }
    }),
    (t.prototype.getPrivateBaseKey = function () {
      var e = {
        array: [
          new IF.asn1.DERInteger({
            int: 0,
          }),
          new IF.asn1.DERInteger({
            bigint: this.n,
          }),
          new IF.asn1.DERInteger({
            int: this.e,
          }),
          new IF.asn1.DERInteger({
            bigint: this.d,
          }),
          new IF.asn1.DERInteger({
            bigint: this.p,
          }),
          new IF.asn1.DERInteger({
            bigint: this.q,
          }),
          new IF.asn1.DERInteger({
            bigint: this.dmp1,
          }),
          new IF.asn1.DERInteger({
            bigint: this.dmq1,
          }),
          new IF.asn1.DERInteger({
            bigint: this.coeff,
          }),
        ],
      };
      return new IF.asn1.DERSequence(e).getEncodedHex();
    }),
    (t.prototype.getPrivateBaseKeyB64 = function () {
      return kB(this.getPrivateBaseKey());
    }),
    (t.prototype.getPublicBaseKey = function () {
      var e = new IF.asn1.DERSequence({
          array: [
            new IF.asn1.DERObjectIdentifier({
              oid: "1.2.840.113549.1.1.1",
            }),
            new IF.asn1.DERNull(),
          ],
        }),
        t = new IF.asn1.DERSequence({
          array: [
            new IF.asn1.DERInteger({
              bigint: this.n,
            }),
            new IF.asn1.DERInteger({
              int: this.e,
            }),
          ],
        }),
        n = new IF.asn1.DERBitString({
          hex: "00" + t.getEncodedHex(),
        });
      return new IF.asn1.DERSequence({
        array: [e, n],
      }).getEncodedHex();
    }),
    (t.prototype.getPublicBaseKeyB64 = function () {
      return kB(this.getPublicBaseKey());
    }),
    (t.wordwrap = function (e, t) {
      if (!e) return e;
      var n = "(.{1," + (t = t || 64) + "})( +|$\n?)|(.{1," + t + "})";
      return e.match(RegExp(n, "g")).join("\n");
    }),
    (t.prototype.getPrivateKey = function () {
      var e = "-----BEGIN RSA PRIVATE KEY-----\n";
      return (
        (e += t.wordwrap(this.getPrivateBaseKeyB64()) + "\n") +
        "-----END RSA PRIVATE KEY-----"
      );
    }),
    (t.prototype.getPublicKey = function () {
      var e = "-----BEGIN PUBLIC KEY-----\n";
      return (
        (e += t.wordwrap(this.getPublicBaseKeyB64()) + "\n") +
        "-----END PUBLIC KEY-----"
      );
    }),
    (t.hasPublicKeyProperty = function (e) {
      return (e = e || {}).hasOwnProperty("n") && e.hasOwnProperty("e");
    }),
    (t.hasPrivateKeyProperty = function (e) {
      return (
        (e = e || {}).hasOwnProperty("n") &&
        e.hasOwnProperty("e") &&
        e.hasOwnProperty("d") &&
        e.hasOwnProperty("p") &&
        e.hasOwnProperty("q") &&
        e.hasOwnProperty("dmp1") &&
        e.hasOwnProperty("dmq1") &&
        e.hasOwnProperty("coeff")
      );
    }),
    (t.prototype.parsePropertiesFrom = function (e) {
      ((this.n = e.n),
        (this.e = e.e),
        e.hasOwnProperty("d") &&
          ((this.d = e.d),
          (this.p = e.p),
          (this.q = e.q),
          (this.dmp1 = e.dmp1),
          (this.dmq1 = e.dmq1),
          (this.coeff = e.coeff)));
    }),
    t
  );
})(kF);
var LF = (function () {
  function e(e) {
    (void 0 === e && (e = {}),
      (this.default_key_size = e.default_key_size
        ? parseInt(e.default_key_size, 10)
        : 1024),
      (this.default_public_exponent = e.default_public_exponent || "010001"),
      (this.log = e.log || !1),
      (this.key = e.key || null));
  }
  return (
    (e.prototype.setKey = function (e) {
      e
        ? (this.log && this.key, (this.key = new PF(e)))
        : !this.key && this.log;
    }),
    (e.prototype.setPrivateKey = function (e) {
      this.setKey(e);
    }),
    (e.prototype.setPublicKey = function (e) {
      this.setKey(e);
    }),
    (e.prototype.decrypt = function (e) {
      try {
        return this.getKey().decrypt(MB(e));
      } catch (oz) {
        return !1;
      }
    }),
    (e.prototype.encrypt = function (e) {
      try {
        return kB(this.getKey().encrypt(e));
      } catch (oz) {
        return !1;
      }
    }),
    (e.prototype.encryptOAEP = function (e) {
      try {
        return kB(this.getKey().encrypt(e, _F));
      } catch (oz) {
        return !1;
      }
    }),
    (e.prototype.sign = function (e, t, n) {
      (void 0 === t &&
        (t = function (e) {
          return e;
        }),
        void 0 === n && (n = ""));
      try {
        return kB(this.getKey().sign(e, t, n));
      } catch (oz) {
        return !1;
      }
    }),
    (e.prototype.signSha256 = function (e) {
      return this.sign(
        e,
        function (e) {
          return pF(dF(e));
        },
        "sha256",
      );
    }),
    (e.prototype.verify = function (e, t, n) {
      void 0 === n &&
        (n = function (e) {
          return e;
        });
      try {
        return this.getKey().verify(e, MB(t), n);
      } catch (oz) {
        return !1;
      }
    }),
    (e.prototype.verifySha256 = function (e, t) {
      return this.verify(e, t, function (e) {
        return pF(dF(e));
      });
    }),
    (e.prototype.getKey = function (e) {
      if (!this.key) {
        if (
          ((this.key = new PF()),
          e && "[object Function]" === {}.toString.call(e))
        )
          return void this.key.generateAsync(
            this.default_key_size,
            this.default_public_exponent,
            e,
          );
        this.key.generate(this.default_key_size, this.default_public_exponent);
      }
      return this.key;
    }),
    (e.prototype.getPrivateKey = function () {
      return this.getKey().getPrivateKey();
    }),
    (e.prototype.getPrivateKeyB64 = function () {
      return this.getKey().getPrivateBaseKeyB64();
    }),
    (e.prototype.getPublicKey = function () {
      return this.getKey().getPublicKey();
    }),
    (e.prototype.getPublicKeyB64 = function () {
      return this.getKey().getPublicBaseKeyB64();
    }),
    (e.version = undefined),
    e
  );
})();

var vP, TP;
var yP = { exports: {} };
var IP = { exports: {} };

function xP() {
  return (
    vP ||
      ((vP = 1),
      (yP.exports = (function (e) {
        var t;
        var n = function () {
          if (t) {
            if ("function" == typeof t.getRandomValues)
              try {
                return t.getRandomValues(new Uint32Array(1))[0];
              } catch (_We) {}
            if ("function" == typeof t.randomBytes)
              try {
                return t.randomBytes(4).readInt32LE();
              } catch (_We) {}
          }
          return Math.floor(Math.random() * 0xffffffff);
        };
        var a =
          Object.create ||
          function (t) {
            function e() {}
            e.prototype = t;
            var n = new e();
            e.prototype = null;
            return n;
          };
        var r = {};
        var i = (r.lib = {});
        var o = (i.Base = {
          extend: function (e) {
            var t = a(this);
            return (
              e && t.mixIn(e),
              (t.hasOwnProperty("init") && this.init !== t.init) ||
                (t.init = function () {
                  t.$super.init.apply(this, arguments);
                }),
              (t.init.prototype = t),
              (t.$super = this),
              t
            );
          },
          create: function () {
            var e = this.extend();
            return (e.init.apply(e, arguments), e);
          },
          init: function () {},
          mixIn: function (e) {
            for (var t in e) e.hasOwnProperty(t) && (this[t] = e[t]);
          },
          clone: function () {
            return this.init.prototype.extend(this);
          },
        });
        var s = (i.WordArray = o.extend({
          init: function (e, t) {
            ((this.words = e || []),
              (this.sigBytes = null != t ? t : 4 * this.words.length));
          },
          toString: function (e) {
            return (e || c).stringify(this);
          },
          concat: function (e) {
            var t = this.words,
              n = e.words,
              a = this.sigBytes,
              r = e.sigBytes;
            if ((this.clamp(), a % 4))
              for (var i = 0; i < r; i++) {
                var o = (n[i >>> 2] >>> (24 - (i % 4) * 8)) & 255;
                t[(a + i) >>> 2] |= o << (24 - ((a + i) % 4) * 8);
              }
            else for (var s = 0; s < r; s += 4) t[(a + s) >>> 2] = n[s >>> 2];
            return ((this.sigBytes += r), this);
          },
          clamp: function () {
            var t = this.words,
              n = this.sigBytes;
            t[n >>> 2] &= 4294967295 << (32 - (n % 4) * 8);
            t.length = Math.ceil(n / 4);
          },
          clone: function () {
            var e = o.clone.call(this);
            return ((e.words = this.words.slice(0)), e);
          },
        }));
        var l = (r.enc = {});
        var c = (l.Hex = {
          stringify: function (e) {
            for (var t = e.words, n = e.sigBytes, a = [], r = 0; r < n; r++) {
              var i = (t[r >>> 2] >>> (24 - (r % 4) * 8)) & 255;
              (a.push((i >>> 4).toString(16)), a.push((15 & i).toString(16)));
            }
            return a.join("");
          },
        });
        l.Latin1 = {
          parse: function (e) {
            for (var t = e.length, n = [], a = 0; a < t; a++)
              n[a >>> 2] |= (255 & e.charCodeAt(a)) << (24 - (a % 4) * 8);
            return new s.init(n, t);
          },
        };
        l.Utf8 = {
          parse: function (e) {
            return l.Latin1.parse(unescape(encodeURIComponent(e)));
          },
        };
        return r;
      })(Math))),
    yP.exports
  );
}

function RP() {
  if (TP) return IP.exports;
  TP = 1;
  var e = xP();
  e.enc.Base64 = {
    stringify: function (e) {
      var t = e.words,
        n = e.sigBytes,
        a = this._map;
      e.clamp();
      for (var r = [], i = 0; i < n; i += 3)
        for (
          var o =
              (((t[i >>> 2] >>> (24 - (i % 4) * 8)) & 255) << 16) |
              (((t[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 255) << 8) |
              ((t[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 255),
            s = 0;
          s < 4 && i + 0.75 * s < n;
          s++
        )
          r.push(a.charAt((o >>> (6 * (3 - s))) & 63));
      var l = a.charAt(64);
      if (l) while (r.length % 4) r.push(l);
      return r.join("");
    },
    parse: function (e) {
      var t = e.length,
        a = this._map,
        r = this._reverseMap;
      if (!r) {
        r = this._reverseMap = [];
        for (var i = 0; i < a.length; i++) r[a.charCodeAt(i)] = i;
      }
      var o = a.charAt(64);
      if (o) {
        var s = e.indexOf(o);
        -1 !== s && (t = s);
      }
      return (function (e, t, a) {
        for (var r = [], i = 0, o = 0; o < t; o++)
          if (o % 4) {
            var s =
              (a[e.charCodeAt(o - 1)] << ((o % 4) * 2)) |
              (a[e.charCodeAt(o)] >>> (6 - (o % 4) * 2));
            ((r[i >>> 2] |= s << (24 - (i % 4) * 8)), i++);
          }
        return xP().lib.WordArray.create(r, i);
      })(e, t, r);
    },
    _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  };
  return ((IP.exports = e), e);
}

const CryptoLib = RP();
const ZE = CryptoLib;
var AES = require("crypto-js/aes");
const { json } = require("stream/consumers");

function OF(e, t = "1234567891011120", n = "ZazkH4wK") {
  try {
    const r =
        n + "ZazkH4wKKfkq/zQPfgM23k9kHzufbkwZHWzk2kZmKfA=".slice(n.length),
      i = JSON.stringify(e),
      o = ZE.enc.Base64.parse(r),
      s = ZE.enc.Utf8.parse(t);
    return AES.encrypt(i, o, {
      iv: s,
      mode: JE.mode.CBC,
    }).toString();
  } catch (r) {}
}
function AF(e, t) {
  if (t < e.length + 11) return null;
  for (var n = [], a = e.length - 1; a >= 0 && t > 0; ) {
    var r = e.charCodeAt(a--);
    r < 128
      ? (n[--t] = r)
      : r > 127 && r < 2048
        ? ((n[--t] = (63 & r) | 128), (n[--t] = (r >> 6) | 192))
        : ((n[--t] = (63 & r) | 128),
          (n[--t] = ((r >> 6) & 63) | 128),
          (n[--t] = (r >> 12) | 224));
  }
  n[--t] = 0;
  for (var i = new uF(), o = []; t > 2; ) {
    for (o[0] = 0; 0 == o[0]; ) i.nextBytes(o);
    n[--t] = o[0];
  }
  return ((n[--t] = 2), (n[--t] = 0), new HB(n));
}
function eF(e) {
  var t,
    n = 1;
  return (
    0 != (t = e >>> 16) && ((e = t), (n += 16)),
    0 != (t = e >> 8) && ((e = t), (n += 8)),
    0 != (t = e >> 4) && ((e = t), (n += 4)),
    0 != (t = e >> 2) && ((e = t), (n += 2)),
    0 != (t = e >> 1) && ((e = t), (n += 1)),
    n
  );
}
function QB(e) {
  var t = KB();
  return (t.fromInt(e), t);
}
var GB = (function () {
    function e(e) {
      ((this.m = e),
        (this.mp = e.invDigit()),
        (this.mpl = 32767 & this.mp),
        (this.mph = this.mp >> 15),
        (this.um = (1 << (e.DB - 15)) - 1),
        (this.mt2 = 2 * e.t));
    }
    return (
      (e.prototype.convert = function (e) {
        var t = KB();
        return (
          e.abs().dlShiftTo(this.m.t, t),
          t.divRemTo(this.m, null, t),
          e.s < 0 && t.compareTo(HB.ZERO) > 0 && this.m.subTo(t, t),
          t
        );
      }),
      (e.prototype.revert = function (e) {
        var t = KB();
        return (e.copyTo(t), this.reduce(t), t);
      }),
      (e.prototype.reduce = function (e) {
        for (; e.t <= this.mt2; ) e[e.t++] = 0;
        for (var t = 0; t < this.m.t; ++t) {
          var n = 32767 & e[t],
            a =
              (n * this.mpl +
                (((n * this.mph + (e[t] >> 15) * this.mpl) & this.um) << 15)) &
              e.DM;
          for (
            e[(n = t + this.m.t)] += this.m.am(0, a, e, t, 0, this.m.t);
            e[n] >= e.DV;
          )
            ((e[n] -= e.DV), e[++n]++);
        }
        (e.clamp(),
          e.drShiftTo(this.m.t, e),
          e.compareTo(this.m) >= 0 && e.subTo(this.m, e));
      }),
      (e.prototype.mulTo = function (e, t, n) {
        (e.multiplyTo(t, n), this.reduce(n));
      }),
      (e.prototype.sqrTo = function (e, t) {
        (e.squareTo(t), this.reduce(t));
      }),
      e
    );
  })(),
  WB = (function () {
    function e(e) {
      ((this.m = e),
        (this.r2 = KB()),
        (this.q3 = KB()),
        HB.ONE.dlShiftTo(2 * e.t, this.r2),
        (this.mu = this.r2.divide(e)));
    }
    return (
      (e.prototype.convert = function (e) {
        if (e.s < 0 || e.t > 2 * this.m.t) return e.mod(this.m);
        if (e.compareTo(this.m) < 0) return e;
        var t = KB();
        return (e.copyTo(t), this.reduce(t), t);
      }),
      (e.prototype.revert = function (e) {
        return e;
      }),
      (e.prototype.reduce = function (e) {
        for (
          e.drShiftTo(this.m.t - 1, this.r2),
            e.t > this.m.t + 1 && ((e.t = this.m.t + 1), e.clamp()),
            this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3),
            this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
          e.compareTo(this.r2) < 0;
        )
          e.dAddOffset(1, this.m.t + 1);
        for (e.subTo(this.r2, e); e.compareTo(this.m) >= 0; )
          e.subTo(this.m, e);
      }),
      (e.prototype.mulTo = function (e, t, n) {
        (e.multiplyTo(t, n), this.reduce(n));
      }),
      (e.prototype.sqrTo = function (e, t) {
        (e.squareTo(t), this.reduce(t));
      }),
      e
    );
  })();
function yB(e) {
  return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(e);
}
function bB(e, t) {
  return e & t;
}
function vB(e, t) {
  return e | t;
}
function xB(e, t) {
  return e ^ t;
}
function wB(e, t) {
  return e & ~t;
}
function CB(e) {
  if (0 == e) return -1;
  var t = 0;
  return (
    65535 & e || ((e >>= 16), (t += 16)),
    255 & e || ((e >>= 8), (t += 8)),
    15 & e || ((e >>= 4), (t += 4)),
    3 & e || ((e >>= 2), (t += 2)),
    1 & e || ++t,
    t
  );
}
function AB(e) {
  for (var t = 0; 0 != e; ) ((e &= e - 1), ++t);
  return t;
}
var UB = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
    157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
    239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
    331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
    421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
    509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607,
    613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701,
    709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811,
    821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911,
    919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997,
  ],
  zB = (1 << 26) / UB[UB.length - 1];
DB;
var HB = (function () {
  function e(e, t, n) {
    null != e &&
      ("number" == typeof e
        ? this.fromNumber(e, t, n)
        : null == t && "string" != typeof e
          ? this.fromString(e, 256)
          : this.fromString(e, t));
  }
  return (
    (e.prototype.toString = function (e) {
      if (this.s < 0) return "-" + this.negate().toString(e);
      var t;
      if (16 == e) t = 4;
      else if (8 == e) t = 3;
      else if (2 == e) t = 1;
      else if (32 == e) t = 5;
      else {
        if (4 != e) return this.toRadix(e);
        t = 2;
      }
      var n,
        a = (1 << t) - 1,
        r = !1,
        i = "",
        o = this.t,
        s = this.DB - ((o * this.DB) % t);
      if (o-- > 0)
        for (
          s < this.DB && (n = this[o] >> s) > 0 && ((r = !0), (i = yB(n)));
          o >= 0;
        )
          (s < t
            ? ((n = (this[o] & ((1 << s) - 1)) << (t - s)),
              (n |= this[--o] >> (s += this.DB - t)))
            : ((n = (this[o] >> (s -= t)) & a),
              s <= 0 && ((s += this.DB), --o)),
            n > 0 && (r = !0),
            r && (i += yB(n)));
      return r ? i : "0";
    }),
    (e.prototype.negate = function () {
      var t = KB();
      return (e.ZERO.subTo(this, t), t);
    }),
    (e.prototype.abs = function () {
      return this.s < 0 ? this.negate() : this;
    }),
    (e.prototype.compareTo = function (e) {
      var t = this.s - e.s;
      if (0 != t) return t;
      var n = this.t;
      if (0 != (t = n - e.t)) return this.s < 0 ? -t : t;
      for (; --n >= 0; ) if (0 != (t = this[n] - e[n])) return t;
      return 0;
    }),
    (e.prototype.bitLength = function () {
      return this.t <= 0
        ? 0
        : this.DB * (this.t - 1) + eF(this[this.t - 1] ^ (this.s & this.DM));
    }),
    (e.prototype.mod = function (t) {
      var n = KB();
      return (
        this.abs().divRemTo(t, null, n),
        this.s < 0 && n.compareTo(e.ZERO) > 0 && t.subTo(n, n),
        n
      );
    }),
    (e.prototype.modPowInt = function (e, t) {
      var n;
      return (
        (n = e < 256 || t.isEven() ? new VB(t) : new GB(t)),
        this.exp(e, n)
      );
    }),
    (e.prototype.clone = function () {
      var e = KB();
      return (this.copyTo(e), e);
    }),
    (e.prototype.intValue = function () {
      if (this.s < 0) {
        if (1 == this.t) return this[0] - this.DV;
        if (0 == this.t) return -1;
      } else {
        if (1 == this.t) return this[0];
        if (0 == this.t) return 0;
      }
      return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
    }),
    (e.prototype.byteValue = function () {
      return 0 == this.t ? this.s : (this[0] << 24) >> 24;
    }),
    (e.prototype.shortValue = function () {
      return 0 == this.t ? this.s : (this[0] << 16) >> 16;
    }),
    (e.prototype.signum = function () {
      return this.s < 0
        ? -1
        : this.t <= 0 || (1 == this.t && this[0] <= 0)
          ? 0
          : 1;
    }),
    (e.prototype.toByteArray = function () {
      var e = this.t,
        t = [];
      t[0] = this.s;
      var n,
        a = this.DB - ((e * this.DB) % 8),
        r = 0;
      if (e-- > 0)
        for (
          a < this.DB &&
          (n = this[e] >> a) != (this.s & this.DM) >> a &&
          (t[r++] = n | (this.s << (this.DB - a)));
          e >= 0;
        )
          (a < 8
            ? ((n = (this[e] & ((1 << a) - 1)) << (8 - a)),
              (n |= this[--e] >> (a += this.DB - 8)))
            : ((n = (this[e] >> (a -= 8)) & 255),
              a <= 0 && ((a += this.DB), --e)),
            128 & n && (n |= -256),
            0 == r && (128 & this.s) != (128 & n) && ++r,
            (r > 0 || n != this.s) && (t[r++] = n));
      return t;
    }),
    (e.prototype.equals = function (e) {
      return 0 == this.compareTo(e);
    }),
    (e.prototype.min = function (e) {
      return this.compareTo(e) < 0 ? this : e;
    }),
    (e.prototype.max = function (e) {
      return this.compareTo(e) > 0 ? this : e;
    }),
    (e.prototype.and = function (e) {
      var t = KB();
      return (this.bitwiseTo(e, bB, t), t);
    }),
    (e.prototype.or = function (e) {
      var t = KB();
      return (this.bitwiseTo(e, vB, t), t);
    }),
    (e.prototype.xor = function (e) {
      var t = KB();
      return (this.bitwiseTo(e, xB, t), t);
    }),
    (e.prototype.andNot = function (e) {
      var t = KB();
      return (this.bitwiseTo(e, wB, t), t);
    }),
    (e.prototype.not = function () {
      for (var e = KB(), t = 0; t < this.t; ++t) e[t] = this.DM & ~this[t];
      return ((e.t = this.t), (e.s = ~this.s), e);
    }),
    (e.prototype.shiftLeft = function (e) {
      var t = KB();
      return (e < 0 ? this.rShiftTo(-e, t) : this.lShiftTo(e, t), t);
    }),
    (e.prototype.shiftRight = function (e) {
      var t = KB();
      return (e < 0 ? this.lShiftTo(-e, t) : this.rShiftTo(e, t), t);
    }),
    (e.prototype.getLowestSetBit = function () {
      for (var e = 0; e < this.t; ++e)
        if (0 != this[e]) return e * this.DB + CB(this[e]);
      return this.s < 0 ? this.t * this.DB : -1;
    }),
    (e.prototype.bitCount = function () {
      for (var e = 0, t = this.s & this.DM, n = 0; n < this.t; ++n)
        e += AB(this[n] ^ t);
      return e;
    }),
    (e.prototype.testBit = function (e) {
      var t = Math.floor(e / this.DB);
      return t >= this.t ? 0 != this.s : !!(this[t] & (1 << (e % this.DB)));
    }),
    (e.prototype.setBit = function (e) {
      return this.changeBit(e, vB);
    }),
    (e.prototype.clearBit = function (e) {
      return this.changeBit(e, wB);
    }),
    (e.prototype.flipBit = function (e) {
      return this.changeBit(e, xB);
    }),
    (e.prototype.add = function (e) {
      var t = KB();
      return (this.addTo(e, t), t);
    }),
    (e.prototype.subtract = function (e) {
      var t = KB();
      return (this.subTo(e, t), t);
    }),
    (e.prototype.multiply = function (e) {
      var t = KB();
      return (this.multiplyTo(e, t), t);
    }),
    (e.prototype.divide = function (e) {
      var t = KB();
      return (this.divRemTo(e, t, null), t);
    }),
    (e.prototype.remainder = function (e) {
      var t = KB();
      return (this.divRemTo(e, null, t), t);
    }),
    (e.prototype.divideAndRemainder = function (e) {
      var t = KB(),
        n = KB();
      return (this.divRemTo(e, t, n), [t, n]);
    }),
    (e.prototype.modPow = function (e, t) {
      var n,
        a,
        r = e.bitLength(),
        i = QB(1);
      if (r <= 0) return i;
      ((n = r < 18 ? 1 : r < 48 ? 3 : r < 144 ? 4 : r < 768 ? 5 : 6),
        (a = r < 8 ? new VB(t) : t.isEven() ? new WB(t) : new GB(t)));
      var o = [],
        s = 3,
        l = n - 1,
        c = (1 << n) - 1;
      if (((o[1] = a.convert(this)), n > 1)) {
        var u = KB();
        for (a.sqrTo(o[1], u); s <= c; )
          ((o[s] = KB()), a.mulTo(u, o[s - 2], o[s]), (s += 2));
      }
      var d,
        p,
        m = e.t - 1,
        h = !0,
        f = KB();
      for (r = eF(e[m]) - 1; m >= 0; ) {
        for (
          r >= l
            ? (d = (e[m] >> (r - l)) & c)
            : ((d = (e[m] & ((1 << (r + 1)) - 1)) << (l - r)),
              m > 0 && (d |= e[m - 1] >> (this.DB + r - l))),
            s = n;
          !(1 & d);
        )
          ((d >>= 1), --s);
        if (((r -= s) < 0 && ((r += this.DB), --m), h))
          (o[d].copyTo(i), (h = !1));
        else {
          for (; s > 1; ) (a.sqrTo(i, f), a.sqrTo(f, i), (s -= 2));
          (s > 0 ? a.sqrTo(i, f) : ((p = i), (i = f), (f = p)),
            a.mulTo(f, o[d], i));
        }
        for (; m >= 0 && !(e[m] & (1 << r)); )
          (a.sqrTo(i, f),
            (p = i),
            (i = f),
            (f = p),
            --r < 0 && ((r = this.DB - 1), --m));
      }
      return a.revert(i);
    }),
    (e.prototype.modInverse = function (t) {
      var n = t.isEven();
      if ((this.isEven() && n) || 0 == t.signum()) return e.ZERO;
      for (
        var a = t.clone(),
          r = this.clone(),
          i = QB(1),
          o = QB(0),
          s = QB(0),
          l = QB(1);
        0 != a.signum();
      ) {
        for (; a.isEven(); )
          (a.rShiftTo(1, a),
            n
              ? ((i.isEven() && o.isEven()) ||
                  (i.addTo(this, i), o.subTo(t, o)),
                i.rShiftTo(1, i))
              : o.isEven() || o.subTo(t, o),
            o.rShiftTo(1, o));
        for (; r.isEven(); )
          (r.rShiftTo(1, r),
            n
              ? ((s.isEven() && l.isEven()) ||
                  (s.addTo(this, s), l.subTo(t, l)),
                s.rShiftTo(1, s))
              : l.isEven() || l.subTo(t, l),
            l.rShiftTo(1, l));
        a.compareTo(r) >= 0
          ? (a.subTo(r, a), n && i.subTo(s, i), o.subTo(l, o))
          : (r.subTo(a, r), n && s.subTo(i, s), l.subTo(o, l));
      }
      return 0 != r.compareTo(e.ONE)
        ? e.ZERO
        : l.compareTo(t) >= 0
          ? l.subtract(t)
          : l.signum() < 0
            ? (l.addTo(t, l), l.signum() < 0 ? l.add(t) : l)
            : l;
    }),
    (e.prototype.pow = function (e) {
      return this.exp(e, new $B());
    }),
    (e.prototype.gcd = function (e) {
      var t = this.s < 0 ? this.negate() : this.clone(),
        n = e.s < 0 ? e.negate() : e.clone();
      if (t.compareTo(n) < 0) {
        var a = t;
        ((t = n), (n = a));
      }
      var r = t.getLowestSetBit(),
        i = n.getLowestSetBit();
      if (i < 0) return t;
      for (
        r < i && (i = r), i > 0 && (t.rShiftTo(i, t), n.rShiftTo(i, n));
        t.signum() > 0;
      )
        ((r = t.getLowestSetBit()) > 0 && t.rShiftTo(r, t),
          (r = n.getLowestSetBit()) > 0 && n.rShiftTo(r, n),
          t.compareTo(n) >= 0
            ? (t.subTo(n, t), t.rShiftTo(1, t))
            : (n.subTo(t, n), n.rShiftTo(1, n)));
      return (i > 0 && n.lShiftTo(i, n), n);
    }),
    (e.prototype.isProbablePrime = function (e) {
      var t,
        n = this.abs();
      if (1 == n.t && n[0] <= UB[UB.length - 1]) {
        for (t = 0; t < UB.length; ++t) if (n[0] == UB[t]) return !0;
        return !1;
      }
      if (n.isEven()) return !1;
      for (t = 1; t < UB.length; ) {
        for (var a = UB[t], r = t + 1; r < UB.length && a < zB; ) a *= UB[r++];
        for (a = n.modInt(a); t < r; ) if (a % UB[t++] == 0) return !1;
      }
      return n.millerRabin(e);
    }),
    (e.prototype.copyTo = function (e) {
      for (var t = this.t - 1; t >= 0; --t) e[t] = this[t];
      ((e.t = this.t), (e.s = this.s));
    }),
    (e.prototype.fromInt = function (e) {
      ((this.t = 1),
        (this.s = e < 0 ? -1 : 0),
        e > 0
          ? (this[0] = e)
          : e < -1
            ? (this[0] = e + this.DV)
            : (this.t = 0));
    }),
    (e.prototype.fromString = function (t, n) {
      var a;
      if (16 == n) a = 4;
      else if (8 == n) a = 3;
      else if (256 == n) a = 8;
      else if (2 == n) a = 1;
      else if (32 == n) a = 5;
      else {
        if (4 != n) return void this.fromRadix(t, n);
        a = 2;
      }
      ((this.t = 0), (this.s = 0));
      for (var r = t.length, i = !1, o = 0; --r >= 0; ) {
        var s = 8 == a ? 255 & +t[r] : XB(t, r);
        s < 0
          ? "-" == t.charAt(r) && (i = !0)
          : ((i = !1),
            0 == o
              ? (this[this.t++] = s)
              : o + a > this.DB
                ? ((this[this.t - 1] |= (s & ((1 << (this.DB - o)) - 1)) << o),
                  (this[this.t++] = s >> (this.DB - o)))
                : (this[this.t - 1] |= s << o),
            (o += a) >= this.DB && (o -= this.DB));
      }
      (8 == a &&
        128 & +t[0] &&
        ((this.s = -1),
        o > 0 && (this[this.t - 1] |= ((1 << (this.DB - o)) - 1) << o)),
        this.clamp(),
        i && e.ZERO.subTo(this, this));
    }),
    (e.prototype.clamp = function () {
      for (var e = this.s & this.DM; this.t > 0 && this[this.t - 1] == e; )
        --this.t;
    }),
    (e.prototype.dlShiftTo = function (e, t) {
      var n;
      for (n = this.t - 1; n >= 0; --n) t[n + e] = this[n];
      for (n = e - 1; n >= 0; --n) t[n] = 0;
      ((t.t = this.t + e), (t.s = this.s));
    }),
    (e.prototype.drShiftTo = function (e, t) {
      for (var n = e; n < this.t; ++n) t[n - e] = this[n];
      ((t.t = Math.max(this.t - e, 0)), (t.s = this.s));
    }),
    (e.prototype.lShiftTo = function (e, t) {
      for (
        var n = e % this.DB,
          a = this.DB - n,
          r = (1 << a) - 1,
          i = Math.floor(e / this.DB),
          o = (this.s << n) & this.DM,
          s = this.t - 1;
        s >= 0;
        --s
      )
        ((t[s + i + 1] = (this[s] >> a) | o), (o = (this[s] & r) << n));
      for (s = i - 1; s >= 0; --s) t[s] = 0;
      ((t[i] = o), (t.t = this.t + i + 1), (t.s = this.s), t.clamp());
    }),
    (e.prototype.rShiftTo = function (e, t) {
      t.s = this.s;
      var n = Math.floor(e / this.DB);
      if (n >= this.t) t.t = 0;
      else {
        var a = e % this.DB,
          r = this.DB - a,
          i = (1 << a) - 1;
        t[0] = this[n] >> a;
        for (var o = n + 1; o < this.t; ++o)
          ((t[o - n - 1] |= (this[o] & i) << r), (t[o - n] = this[o] >> a));
        (a > 0 && (t[this.t - n - 1] |= (this.s & i) << r),
          (t.t = this.t - n),
          t.clamp());
      }
    }),
    (e.prototype.subTo = function (e, t) {
      for (var n = 0, a = 0, r = Math.min(e.t, this.t); n < r; )
        ((a += this[n] - e[n]), (t[n++] = a & this.DM), (a >>= this.DB));
      if (e.t < this.t) {
        for (a -= e.s; n < this.t; )
          ((a += this[n]), (t[n++] = a & this.DM), (a >>= this.DB));
        a += this.s;
      } else {
        for (a += this.s; n < e.t; )
          ((a -= e[n]), (t[n++] = a & this.DM), (a >>= this.DB));
        a -= e.s;
      }
      ((t.s = a < 0 ? -1 : 0),
        a < -1 ? (t[n++] = this.DV + a) : a > 0 && (t[n++] = a),
        (t.t = n),
        t.clamp());
    }),
    (e.prototype.multiplyTo = function (t, n) {
      var a = this.abs(),
        r = t.abs(),
        i = a.t;
      for (n.t = i + r.t; --i >= 0; ) n[i] = 0;
      for (i = 0; i < r.t; ++i) n[i + a.t] = a.am(0, r[i], n, i, 0, a.t);
      ((n.s = 0), n.clamp(), this.s != t.s && e.ZERO.subTo(n, n));
    }),
    (e.prototype.squareTo = function (e) {
      for (var t = this.abs(), n = (e.t = 2 * t.t); --n >= 0; ) e[n] = 0;
      for (n = 0; n < t.t - 1; ++n) {
        var a = t.am(n, t[n], e, 2 * n, 0, 1);
        (e[n + t.t] += t.am(n + 1, 2 * t[n], e, 2 * n + 1, a, t.t - n - 1)) >=
          t.DV && ((e[n + t.t] -= t.DV), (e[n + t.t + 1] = 1));
      }
      (e.t > 0 && (e[e.t - 1] += t.am(n, t[n], e, 2 * n, 0, 1)),
        (e.s = 0),
        e.clamp());
    }),
    (e.prototype.divRemTo = function (t, n, a) {
      var r = t.abs();
      if (!(r.t <= 0)) {
        var i = this.abs();
        if (i.t < r.t)
          return (
            null != n && n.fromInt(0),
            void (null != a && this.copyTo(a))
          );
        null == a && (a = KB());
        var o = KB(),
          s = this.s,
          l = t.s,
          c = this.DB - eF(r[r.t - 1]);
        c > 0
          ? (r.lShiftTo(c, o), i.lShiftTo(c, a))
          : (r.copyTo(o), i.copyTo(a));
        var u = o.t,
          d = o[u - 1];
        if (0 != d) {
          var p = d * (1 << this.F1) + (u > 1 ? o[u - 2] >> this.F2 : 0),
            m = this.FV / p,
            h = (1 << this.F1) / p,
            f = 1 << this.F2,
            g = a.t,
            y = g - u,
            b = null == n ? KB() : n;
          for (
            o.dlShiftTo(y, b),
              a.compareTo(b) >= 0 && ((a[a.t++] = 1), a.subTo(b, a)),
              e.ONE.dlShiftTo(u, b),
              b.subTo(o, o);
            o.t < u;
          )
            o[o.t++] = 0;
          for (; --y >= 0; ) {
            var v =
              a[--g] == d ? this.DM : Math.floor(a[g] * m + (a[g - 1] + f) * h);
            if ((a[g] += o.am(0, v, a, y, 0, u)) < v)
              for (o.dlShiftTo(y, b), a.subTo(b, a); a[g] < --v; )
                a.subTo(b, a);
          }
          (null != n && (a.drShiftTo(u, n), s != l && e.ZERO.subTo(n, n)),
            (a.t = u),
            a.clamp(),
            c > 0 && a.rShiftTo(c, a),
            s < 0 && e.ZERO.subTo(a, a));
        }
      }
    }),
    (e.prototype.invDigit = function () {
      if (this.t < 1) return 0;
      var e = this[0];
      if (!(1 & e)) return 0;
      var t = 3 & e;
      return (t =
        ((t =
          ((t =
            ((t = (t * (2 - (15 & e) * t)) & 15) * (2 - (255 & e) * t)) & 255) *
            (2 - (((65535 & e) * t) & 65535))) &
          65535) *
          (2 - ((e * t) % this.DV))) %
        this.DV) > 0
        ? this.DV - t
        : -t;
    }),
    (e.prototype.isEven = function () {
      return 0 == (this.t > 0 ? 1 & this[0] : this.s);
    }),
    (e.prototype.exp = function (t, n) {
      if (t > 4294967295 || t < 1) return e.ONE;
      var a = KB(),
        r = KB(),
        i = n.convert(this),
        o = eF(t) - 1;
      for (i.copyTo(a); --o >= 0; )
        if ((n.sqrTo(a, r), (t & (1 << o)) > 0)) n.mulTo(r, i, a);
        else {
          var s = a;
          ((a = r), (r = s));
        }
      return n.revert(a);
    }),
    (e.prototype.chunkSize = function (e) {
      return Math.floor((Math.LN2 * this.DB) / Math.log(e));
    }),
    (e.prototype.toRadix = function (e) {
      if ((null == e && (e = 10), 0 == this.signum() || e < 2 || e > 36))
        return "0";
      var t = this.chunkSize(e),
        n = Math.pow(e, t),
        a = QB(n),
        r = KB(),
        i = KB(),
        o = "";
      for (this.divRemTo(a, r, i); r.signum() > 0; )
        ((o = (n + i.intValue()).toString(e).substring(1) + o),
          r.divRemTo(a, r, i));
      return i.intValue().toString(e) + o;
    }),
    (e.prototype.fromRadix = function (t, n) {
      (this.fromInt(0), null == n && (n = 10));
      for (
        var a = this.chunkSize(n),
          r = Math.pow(n, a),
          i = !1,
          o = 0,
          s = 0,
          l = 0;
        l < t.length;
        ++l
      ) {
        var c = XB(t, l);
        c < 0
          ? "-" == t.charAt(l) && 0 == this.signum() && (i = !0)
          : ((s = n * s + c),
            ++o >= a &&
              (this.dMultiply(r), this.dAddOffset(s, 0), (o = 0), (s = 0)));
      }
      (o > 0 && (this.dMultiply(Math.pow(n, o)), this.dAddOffset(s, 0)),
        i && e.ZERO.subTo(this, this));
    }),
    (e.prototype.fromNumber = function (t, n, a) {
      if ("number" == typeof n)
        if (t < 2) this.fromInt(1);
        else
          for (
            this.fromNumber(t, a),
              this.testBit(t - 1) ||
                this.bitwiseTo(e.ONE.shiftLeft(t - 1), vB, this),
              this.isEven() && this.dAddOffset(1, 0);
            !this.isProbablePrime(n);
          )
            (this.dAddOffset(2, 0),
              this.bitLength() > t && this.subTo(e.ONE.shiftLeft(t - 1), this));
      else {
        var r = [],
          i = 7 & t;
        ((r.length = 1 + (t >> 3)),
          n.nextBytes(r),
          i > 0 ? (r[0] &= (1 << i) - 1) : (r[0] = 0),
          this.fromString(r, 256));
      }
    }),
    (e.prototype.bitwiseTo = function (e, t, n) {
      var a,
        r,
        i = Math.min(e.t, this.t);
      for (a = 0; a < i; ++a) n[a] = t(this[a], e[a]);
      if (e.t < this.t) {
        for (r = e.s & this.DM, a = i; a < this.t; ++a) n[a] = t(this[a], r);
        n.t = this.t;
      } else {
        for (r = this.s & this.DM, a = i; a < e.t; ++a) n[a] = t(r, e[a]);
        n.t = e.t;
      }
      ((n.s = t(this.s, e.s)), n.clamp());
    }),
    (e.prototype.changeBit = function (t, n) {
      var a = e.ONE.shiftLeft(t);
      return (this.bitwiseTo(a, n, a), a);
    }),
    (e.prototype.addTo = function (e, t) {
      for (var n = 0, a = 0, r = Math.min(e.t, this.t); n < r; )
        ((a += this[n] + e[n]), (t[n++] = a & this.DM), (a >>= this.DB));
      if (e.t < this.t) {
        for (a += e.s; n < this.t; )
          ((a += this[n]), (t[n++] = a & this.DM), (a >>= this.DB));
        a += this.s;
      } else {
        for (a += this.s; n < e.t; )
          ((a += e[n]), (t[n++] = a & this.DM), (a >>= this.DB));
        a += e.s;
      }
      ((t.s = a < 0 ? -1 : 0),
        a > 0 ? (t[n++] = a) : a < -1 && (t[n++] = this.DV + a),
        (t.t = n),
        t.clamp());
    }),
    (e.prototype.dMultiply = function (e) {
      ((this[this.t] = this.am(0, e - 1, this, 0, 0, this.t)),
        ++this.t,
        this.clamp());
    }),
    (e.prototype.dAddOffset = function (e, t) {
      if (0 != e) {
        for (; this.t <= t; ) this[this.t++] = 0;
        for (this[t] += e; this[t] >= this.DV; )
          ((this[t] -= this.DV),
            ++t >= this.t && (this[this.t++] = 0),
            ++this[t]);
      }
    }),
    (e.prototype.multiplyLowerTo = function (e, t, n) {
      var a = Math.min(this.t + e.t, t);
      for (n.s = 0, n.t = a; a > 0; ) n[--a] = 0;
      for (var r = n.t - this.t; a < r; ++a)
        n[a + this.t] = this.am(0, e[a], n, a, 0, this.t);
      for (r = Math.min(e.t, t); a < r; ++a) this.am(0, e[a], n, a, 0, t - a);
      n.clamp();
    }),
    (e.prototype.multiplyUpperTo = function (e, t, n) {
      --t;
      var a = (n.t = this.t + e.t - t);
      for (n.s = 0; --a >= 0; ) n[a] = 0;
      for (a = Math.max(t - this.t, 0); a < e.t; ++a)
        n[this.t + a - t] = this.am(t - a, e[a], n, 0, 0, this.t + a - t);
      (n.clamp(), n.drShiftTo(1, n));
    }),
    (e.prototype.modInt = function (e) {
      if (e <= 0) return 0;
      var t = this.DV % e,
        n = this.s < 0 ? e - 1 : 0;
      if (this.t > 0)
        if (0 == t) n = this[0] % e;
        else for (var a = this.t - 1; a >= 0; --a) n = (t * n + this[a]) % e;
      return n;
    }),
    (e.prototype.millerRabin = function (t) {
      var n = this.subtract(e.ONE),
        a = n.getLowestSetBit();
      if (a <= 0) return !1;
      var r = n.shiftRight(a);
      (t = (t + 1) >> 1) > UB.length && (t = UB.length);
      for (var i = KB(), o = 0; o < t; ++o) {
        i.fromInt(UB[Math.floor(Math.random() * UB.length)]);
        var s = i.modPow(r, this);
        if (0 != s.compareTo(e.ONE) && 0 != s.compareTo(n)) {
          for (var l = 1; l++ < a && 0 != s.compareTo(n); )
            if (0 == (s = s.modPowInt(2, this)).compareTo(e.ONE)) return !1;
          if (0 != s.compareTo(n)) return !1;
        }
      }
      return !0;
    }),
    (e.prototype.square = function () {
      var e = KB();
      return (this.squareTo(e), e);
    }),
    (e.prototype.gcda = function (e, t) {
      var n = this.s < 0 ? this.negate() : this.clone(),
        a = e.s < 0 ? e.negate() : e.clone();
      if (n.compareTo(a) < 0) {
        var r = n;
        ((n = a), (a = r));
      }
      var i = n.getLowestSetBit(),
        o = a.getLowestSetBit();
      if (o < 0) t(n);
      else {
        (i < o && (o = i), o > 0 && (n.rShiftTo(o, n), a.rShiftTo(o, a)));
        var s = function () {
          ((i = n.getLowestSetBit()) > 0 && n.rShiftTo(i, n),
            (i = a.getLowestSetBit()) > 0 && a.rShiftTo(i, a),
            n.compareTo(a) >= 0
              ? (n.subTo(a, n), n.rShiftTo(1, n))
              : (a.subTo(n, a), a.rShiftTo(1, a)),
            n.signum() > 0
              ? setTimeout(s, 0)
              : (o > 0 && a.lShiftTo(o, a),
                setTimeout(function () {
                  t(a);
                }, 0)));
        };
        setTimeout(s, 10);
      }
    }),
    (e.prototype.fromNumberAsync = function (t, n, a, r) {
      if ("number" == typeof n)
        if (t < 2) this.fromInt(1);
        else {
          (this.fromNumber(t, a),
            this.testBit(t - 1) ||
              this.bitwiseTo(e.ONE.shiftLeft(t - 1), vB, this),
            this.isEven() && this.dAddOffset(1, 0));
          var i = this,
            o = function () {
              (i.dAddOffset(2, 0),
                i.bitLength() > t && i.subTo(e.ONE.shiftLeft(t - 1), i),
                i.isProbablePrime(n)
                  ? setTimeout(function () {
                      r();
                    }, 0)
                  : setTimeout(o, 0));
            };
          setTimeout(o, 0);
        }
      else {
        var s = [],
          l = 7 & t;
        ((s.length = 1 + (t >> 3)),
          n.nextBytes(s),
          l > 0 ? (s[0] &= (1 << l) - 1) : (s[0] = 0),
          this.fromString(s, 256));
      }
    }),
    e
  );
})();
function KB() {
  return new HB(null);
}
var YB = "undefined" != typeof navigator;
YB && "Microsoft Internet Explorer" == navigator.appName
  ? ((HB.prototype.am = function (e, t, n, a, r, i) {
      for (var o = 32767 & t, s = t >> 15; --i >= 0; ) {
        var l = 32767 & this[e],
          c = this[e++] >> 15,
          u = s * l + c * o;
        ((r =
          ((l = o * l + ((32767 & u) << 15) + n[a] + (1073741823 & r)) >>> 30) +
          (u >>> 15) +
          s * c +
          (r >>> 30)),
          (n[a++] = 1073741823 & l));
      }
      return r;
    }),
    (DB = 30))
  : YB && "Netscape" != navigator.appName
    ? ((HB.prototype.am = function (e, t, n, a, r, i) {
        for (; --i >= 0; ) {
          var o = t * this[e++] + n[a] + r;
          ((r = Math.floor(o / 67108864)), (n[a++] = 67108863 & o));
        }
        return r;
      }),
      (DB = 26))
    : ((HB.prototype.am = function (e, t, n, a, r, i) {
        for (var o = 16383 & t, s = t >> 14; --i >= 0; ) {
          var l = 16383 & this[e],
            c = this[e++] >> 14,
            u = s * l + c * o;
          ((r =
            ((l = o * l + ((16383 & u) << 14) + n[a] + r) >> 28) +
            (u >> 14) +
            s * c),
            (n[a++] = 268435455 & l));
        }
        return r;
      }),
      (DB = 28));
function cF() {
  if (null == tF) {
    for (tF = new aF(); nF < 256; ) {
      var e = Math.floor(65536 * Math.random());
      rF[nF++] = 255 & e;
    }
    for (tF.init(rF), nF = 0; nF < rF.length; ++nF) rF[nF] = 0;
    nF = 0;
  }
  return tF.next();
}

var tF,
  nF,
  aF = (function () {
    function e() {
      ((this.i = 0), (this.j = 0), (this.S = []));
    }
    return (
      (e.prototype.init = function (e) {
        var t, n, a;
        for (t = 0; t < 256; ++t) this.S[t] = t;
        for (n = 0, t = 0; t < 256; ++t)
          ((n = (n + this.S[t] + e[t % e.length]) & 255),
            (a = this.S[t]),
            (this.S[t] = this.S[n]),
            (this.S[n] = a));
        ((this.i = 0), (this.j = 0));
      }),
      (e.prototype.next = function () {
        var e;
        return (
          (this.i = (this.i + 1) & 255),
          (this.j = (this.j + this.S[this.i]) & 255),
          (e = this.S[this.i]),
          (this.S[this.i] = this.S[this.j]),
          (this.S[this.j] = e),
          this.S[(e + this.S[this.i]) & 255]
        );
      }),
      e
    );
  })(),
  rF = null;
if (null == rF) {
  ((rF = []), (nF = 0));
  var iF = void 0;
  if (
    "undefined" != typeof window &&
    self.crypto &&
    self.crypto.getRandomValues
  ) {
    var oF = new Uint32Array(256);
    for (self.crypto.getRandomValues(oF), iF = 0; iF < oF.length; ++iF)
      rF[nF++] = 255 & oF[iF];
  }
  var sF = 0,
    lF = function (e) {
      if ((sF = sF || 0) >= 256 || nF >= 256)
        self.removeEventListener
          ? self.removeEventListener("mousemove", lF, !1)
          : self.detachEvent && self.detachEvent("onmousemove", lF);
      else
        try {
          var t = e.x + e.y;
          ((rF[nF++] = 255 & t), (sF += 1));
        } catch (wh) {}
    };
  "undefined" != typeof window &&
    (self.addEventListener
      ? self.addEventListener("mousemove", lF, !1)
      : self.attachEvent && self.attachEvent("onmousemove", lF));
}
var uF = (function () {
  function e() {}
  return (
    (e.prototype.nextBytes = function (e) {
      for (var t = 0; t < e.length; ++t) e[t] = cF();
    }),
    e
  );
})();

var ZB,
  JB,
  qB = [];
for (ZB = "0".charCodeAt(0), JB = 0; JB <= 9; ++JB) qB[ZB++] = JB;
for (ZB = "a".charCodeAt(0), JB = 10; JB < 36; ++JB) qB[ZB++] = JB;
for (ZB = "A".charCodeAt(0), JB = 10; JB < 36; ++JB) qB[ZB++] = JB;
function jB(e, t) {
  return new HB(e, t);
}
var YB = "undefined" != typeof navigator;
(YB && "Microsoft Internet Explorer" == navigator.appName
  ? ((HB.prototype.am = function (e, t, n, a, r, i) {
      for (var o = 32767 & t, s = t >> 15; --i >= 0; ) {
        var l = 32767 & this[e],
          c = this[e++] >> 15,
          u = s * l + c * o;
        ((r =
          ((l = o * l + ((32767 & u) << 15) + n[a] + (1073741823 & r)) >>> 30) +
          (u >>> 15) +
          s * c +
          (r >>> 30)),
          (n[a++] = 1073741823 & l));
      }
      return r;
    }),
    (DB = 30))
  : YB && "Netscape" != navigator.appName
    ? ((HB.prototype.am = function (e, t, n, a, r, i) {
        for (; --i >= 0; ) {
          var o = t * this[e++] + n[a] + r;
          ((r = Math.floor(o / 67108864)), (n[a++] = 67108863 & o));
        }
        return r;
      }),
      (DB = 26))
    : ((HB.prototype.am = function (e, t, n, a, r, i) {
        for (var o = 16383 & t, s = t >> 14; --i >= 0; ) {
          var l = 16383 & this[e],
            c = this[e++] >> 14,
            u = s * l + c * o;
          ((r =
            ((l = o * l + ((16383 & u) << 14) + n[a] + r) >> 28) +
            (u >> 14) +
            s * c),
            (n[a++] = 268435455 & l));
        }
        return r;
      }),
      (DB = 28)),
  (HB.prototype.DB = DB),
  (HB.prototype.DM = (1 << DB) - 1),
  (HB.prototype.DV = 1 << DB),
  (HB.prototype.FV = Math.pow(2, 52)),
  (HB.prototype.F1 = 52 - DB),
  (HB.prototype.F2 = 2 * DB - 52));
((HB.ZERO = QB(0)), (HB.ONE = QB(1)));
var ZB,
  JB,
  qB = [];
for (ZB = "0".charCodeAt(0), JB = 0; JB <= 9; ++JB) qB[ZB++] = JB;
for (ZB = "a".charCodeAt(0), JB = 10; JB < 36; ++JB) qB[ZB++] = JB;
for (ZB = "A".charCodeAt(0), JB = 10; JB < 36; ++JB) qB[ZB++] = JB;
function XB(e, t) {
  var n = qB[e.charCodeAt(t)];
  return null == n ? -1 : n;
}
function UF(e, t) {
  let a;
  a = JSON.stringify(e);
  var r = new LF(),
    i = [
      "\n  -----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsBbGGvzBHu97VrrXoSX3\n8tJQ9ZnoowENhs+DFO8zIsD8c8Vmj2VttYtAbU4lHXGHOl2E64Z10nooptQnR9ec\ntapGCr5FxzD/rPWMwjyzFbxuMnv/SiJis5osYkORdlP+aYH71fVgmfgpgGhOtPgk\nF0dSdhjeGO0mdBfWr6tpxx+hIdEEOLvMvJfC6q7OXsz06H/hg4CNHLNkvlyiz+Gh\nQUqkcJLd6L3sL4xjzG/8udwkqObBJH8jXb4EewkIzHq5P28QJETczBH+Gw8oZPVx\nrFHEnONXBx7AheTmI/R6qmQawP0QtaRMs23YDElZuCQjtSsqWnz8WmypJGBlN6ur\nQQIDAQAB\n-----END PUBLIC KEY-----",
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk6MxEFnoVgn9CrqciL6d\n8GsgLUcAOIU3gQ4olk2sazk4M+LId3g41vvd0LF1djySsFLWBBWqPidkLwJPOH9q\nPynlM3fuBOkxcJGuFt9sxjgfZ/ItG56xhGez3k+SFjP0MEDboJenpjdrShnTsKha\nLFkW/gwjeyZOVIrPdIo/bc1Uyj966Mkiy6fV9L32MZlrEc7YVqnCygsCD67a55S2\nYljJ0q1HuXQYYSO1i/i0prQ6N/AB15nVXb6DtNfLASV9a9poH4ewqbHlKmIIhRe8\nT60cEpOiR56BcJVxBZhik00tlSnqMyehWZOCEXQXD18/N3igv1ESYXgnZSox5J7E\nVQIDAQAB\n-----END PUBLIC KEY-----",
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgBOjRODisn528GGxkksU\n1z9mKGejG8P/zg46JYbRQz0OVXJCvTvBZ+9PRAun2PVozsouZRZt9WVFVJifzE1z\nx6wpaeA3w49bULUG8voCRJ2CqSaITITKLU6B1uP7QGdiQJW6NQ8bS4i5m0NGgEgT\n5wMVeiZHhRQehesG7hCmBm/QuHEukoSpQVTt5f6JK1xKUU9RJ2VEurB4tYY1dj4X\n91+Rkn4WN30eyqavFF+wxSrkCev2LxBpBSq7cm5yQyuAHQr5lqnGPan/uB5g9bpU\n8ktT1kU0fv/dexozwMLzpN7k6mRpwvv9bx4HC7TcVPtcJSaL4A6FTml6Fdapsqy4\nnwIDAQAB\n-----END PUBLIC KEY-----",
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjl1WcVCjMaDtmJZ2k2Ey\nF7simUv+XB3gWKX9by5TPJ5Q+TuRcGK9Ol52SLkjqQ5LcaWbJZPb3WGOaHf50L+e\nw3w2JNKpf17Qpzvo3qEhie/CnfQ7viab8bX/V5DKn/Rh49uq6gBsJChm66Xrg4Hz\ndagnHYxMTONxzEeobHlGPsD+imhjFohyB7JpdHcz1bGGjJrNDDzTPl4mWrlIMtQm\nq6+Cmuc6A9bocImR0seuAIsBOe6TZWEJ84WP23xOJsh9Rwt8zKL+IfUBANi91gtX\nYW8kVmkkBWRDGSeZyBm1at3G4aUyR6bYpPsAPAG/GwNqS/8jyMzEp+JZeQrBXVnJ\nwQIDAQAB\n-----END PUBLIC KEY-----",
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxW0KKf/HQfQH/F5ewrZB\nx6YX/aeKg6s7uSIwSbKv/raP1+F5nIN9s2yyZOmDcKoJKZdVPEI8/1Za4hMJIYfX\nFNhAPKDfPoJxWS4G51RvgO+BISPks4ZRBarAu9r7+PDkkhfYSLAAj1MHGoSuMO+b\nQBWpYM1yXFPIi/C5mPQPusDCSIHVLdIZWS9oV+EU4zQD5cF/vRmJ+kwds7wMXylg\nFHEo85F7DQTz37So3YrBSwPR20O7av/ocmUXEZtA1qmTV+rRpm0Io1g7NOjGWJoW\ns/ndX3t7nz/b7y+gZdSQsKNpsGdREVDeKjGYiQqc8S9F0VFT2oppSjziEIPyQBSK\n4wIDAQAB\n-----END PUBLIC KEY-----",
    ][t];
  return (r.setPublicKey(i), r.encrypt(a));
}
function zF(e) {
  n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let a = "";
  for (let r = 0; r < e; r++) a += n[Math.floor(Math.random() * n.length)];
  return a;
}

function HF() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) {
    const r = (Math.random() * 16) | 0;

    const v = t === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}

function $F(e, t, n, a) {
  const {
      randomKey: i,
      randomKey2: o,
      randomKey3: s,
      en_vi: l,
    } = (function () {
      const o = Math.random().toString().slice(-2);
      return {
        randomKey: o,
        randomKey2: Math.random().toString().slice(-2),
        randomKey3:
          t.signInUserSession?.idToken?.payload?.jti?.slice(0, 8) || "ZazkH4wK",
        en_vi: "12345678910111" + o,
      };
    })(t),
    v2 = i + "" + o + OF(e, l),
    v5 = i + "" + o + OF(e, l, s),
    v6 = (function () {
      return UF(
        {
          request_time: Date.now(),
          version: 1,
          short_key: "bb330584-62dd-4b55-8af3-cd4f346ba463",
        },
        0,
      );
    })(),
    v7 = (function (e) {
      return (
        zF(4) +
        1 +
        UF(
          {
            time: Date.now(),
            version: 1,
            sk: "bb330584-62dd-4b55-8af3-cd4f346ba463",
            record_id: null == e ? void 0 : e["record_id"],
            uuid: "request_" + HF(),
          },
          1,
        )
      );
    })(e),
    v8 = ((g = v7), zF(4) + 9 + g),
    v9 =
      ((f = v8),
      "" +
        (function () {
          return Math.floor(10 * Math.random());
        })() +
        10 +
        f);
  var f, g;
  return a
    ? {
        ciphered_request: OF(e),
        ciphered_requestV2: v2,
        ciphered_requestV5: v5,
        ciphered_requestV6: v6,
        ciphered_requestV7: v7,
        ciphered_requestV8: v8,
        ciphered_requestV9: v9,
        request_time: Date.now(),
        path: n,
      }
    : {
        ciphered_requestV2: v2,
        ciphered_requestV5: v5,
        ciphered_requestV6: v6,
        ciphered_requestV7: v7,
        ciphered_requestV8: v8,
        ciphered_requestV9: v9,
        request_time: Date.now(),
        path: n,
      };
}

function create_payload(obj, sign_info) {
  var asdasdasdasd, ccccccccc;
  const d = (function () {
    const t = (function () {
        return JE.lib.WordArray.random(32).toString(JE.enc.Hex);
      })(),
      n = JE.enc.Hex.parse(t),
      a = Math.floor(Date.now() / 1e3).toString(),
      r = JE.HmacSHA256(a, n).toString(JE.enc.Hex),
      i = JSON.stringify({
        ts: a,
        sig: r,
      }),
      o = JE.lib.WordArray.random(16),
      s = JE.AES.encrypt(i, n, {
        iv: o,
        mode: JE.mode.CBC,
        padding: JE.pad.Pkcs7,
      }),
      l = JE.enc.Base64.stringify(s.ciphertext);
    asdasdasdasd = a;
    ccccccccc = l;
    return [t, JE.enc.Base64.stringify(o) + "." + l];
  })();

  var payl = $F(
    obj,
    sign_info,
    "https://www.awardtool-api.com/api/v1/seatmap_v2",
    false,
  );
  payl.ciphered_requestV0 = d[0];
  payl.ciphered_requestV1 = d[1];
  payl.ciphered_requestV10 = (function (e, t) {
    ((a = JE.SHA256("rAnd0m$eCretStr")),
      (r = JE.lib.WordArray.random(16)),
      (i = JSON.stringify({
        ts: Date.now(),
        path: e || "",
        uid: t || "",
      })),
      (o = JE.AES.encrypt(i, a, {
        iv: r,
        mode: JE.mode.CBC,
        padding: JE.pad.Pkcs7,
      })));
    return (
      JE.enc.Base64.stringify(r) + "." + JE.enc.Base64.stringify(o.ciphertext)
    );
  })(asdasdasdasd, ccccccccc);
  return payl;
}

async function sendAwardToolRequest(input_payload, authentication) {
  const header =
    "id_" + Math.random().toString(36) + "@" + new Date().toISOString();
  const url = "https://www.awardtool-api.com/api/v1/seatmap_v2";

  const payload = create_payload(input_payload, authentication);

  console.log(payload);
  console.log("header: " + header);

  const headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    authentication: authentication.signInUserSession.idToken.jwtToken,
    "cache-control": "no-cache",
    "content-type": "application/json",
    origin: "https://www.awardtool.com",
    pragma: "no-cache",
    referer: "https://www.awardtool.com/",
    "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "x-unique-id": header,
  };

  var iiiiiii;
  try {
    console.log("Sending SEATMAPv2 request.");
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error ${response.status}: ${errorText}`);
      return;
    }

    const gB = require("pako");
    const jsonResponse = await response.json();
    const n = jsonResponse.ciphered_data;
    const a = Uint8Array.from(atob(n), (e) => e.charCodeAt(0)),
      r = gB.inflate(a, {
        to: "string",
      });
    iiiiiii = JSON.parse(r);
  } catch (err) {
    console.error("Request failed:", err);
  }
  return iiiiiii;
}

module.exports = sendAwardToolRequest;
