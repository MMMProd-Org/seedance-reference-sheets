import json, sys, os
HERE=os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0,os.path.join(HERE,'i18n'))
ui=json.load(open(os.path.join(HERE,'ui_fr2.json')))
D={}
for mod in ('en_a','en_b','en_c'):
    m=__import__(mod)
    for i,v in m.T.items(): D[ui[i]]=v
    if hasattr(m,'L'): D.update(m.L)
# Seedream variant of the bust help (prefix + original rest)
orig=ui[487]; rest=orig[orig.index('Bonnet européen'):]
D["Repère pour toi. En Seedream 5.0, le prompt cite aussi une fourchette de bonnet (B à C, D à E, F et plus) ; en GPT Image 2.5, aucune taille de bonnet n'est envoyée. "+rest]=("A guide for you. In Seedream 5.0 the prompt also names a cup range (B to C, D to E, F and up); GPT Image 2.5 gets no cup size. "+D[orig][D[orig].index('European cup'):])
extra=json.load(open(os.path.join(HERE,'i18n','extra.json')))
D.update(extra)
js='''/* ---- interface language (FR / EN): translation applied to rendered props, prompts untouched ---- */
var SD_EN = '''+json.dumps(D, ensure_ascii=False, indent=0)+''';
var SD_EN_RX = [
  [/^([\\d\\s\\u202f\\u00a0.,]+) caractères$/, "$1 characters"],
  [/^([\\d\\s\\u202f\\u00a0.,]+) mots$/, "$1 words"],
  [/^(.+), autre$/, function (m, a) {
    return sdTr(a) + ", other";
  }],
  [/^(\\d+) ans$/, "$1 years"],
  /* input hints: "[prefix, ][en anglais : ]ex. <English example>[, ou random[ (choisi selon l'âge)]]" */
  [/^(?:(?!en anglais)(.+?)(, | : ))?(en anglais : )?ex\\. ([\\s\\S]+?)(, ou random)?( \\(choisi selon l'âge\\))?$/, function (m, pre, sep, en, ex, rnd, age) {
    return (pre ? sdTr(pre) + (", " === sep ? ", " : ": ") : "") + (en ? "in English: " : "") + "e.g. " + ex + (rnd ? ", or random" : "") + (age ? " (picked to suit the age)" : "");
  }],
];
function sdTr(s) {
  if ("string" != typeof s || "en" !== sdLang || !s) return s;
  var v = SD_EN[s];
  if (null != v) return v;
  var m = s.match(/^(\\s*)([\\s\\S]*?)(\\s*)$/);
  if (m && m[2] !== s && null != SD_EN[m[2]]) return m[1] + SD_EN[m[2]] + m[3];
  for (var i = 0; i < SD_EN_RX.length; i++) if (SD_EN_RX[i][0].test(s)) return s.replace(SD_EN_RX[i][0], SD_EN_RX[i][1]);
  return s;
}
function sdTrProps(type, p) {
  if ("en" !== sdLang || !p || "pre" === type || "code" === type) return p;
  var o = null,
    set = function (k, v) {
      o || (o = Object.assign({}, p));
      o[k] = v;
    },
    c = p.children;
  if ("textarea" !== type) {
    if ("string" == typeof c) {
      var tc = sdTr(c);
      tc !== c && set("children", tc);
    } else if (Array.isArray(c)) {
      var ch = !1,
        ac = c.map(function (x) {
          var y = "string" == typeof x ? sdTr(x) : x;
          return (y !== x && (ch = !0), y);
        });
      ch && set("children", ac);
    }
  }
  ["placeholder", "aria-label", "title", "label", "hint", "disabledHint", "ph", "display", "badge", "alt"].forEach(function (k) {
    if ("string" == typeof p[k]) {
      var tk = sdTr(p[k]);
      tk !== p[k] && set(k, tk);
    }
  });
  ["options", "opts"].forEach(function (k) {
    var v = p[k];
    if (Array.isArray(v) && v.length && Array.isArray(v[0])) {
      var ch = !1,
        av = v.map(function (x) {
          if ("string" == typeof x[1]) {
            var tx = sdTr(x[1]);
            if (tx !== x[1]) {
              ch = !0;
              var y = x.slice();
              return ((y[1] = tx), y);
            }
          }
          return x;
        });
      ch && set(k, av);
    }
  });
  if (Array.isArray(p.ends)) {
    var e2 = p.ends.map(sdTr);
    e2.some(function (x, i) {
      return x !== p.ends[i];
    }) && set("ends", e2);
  }
  return o || p;
}
function sdSetLang(t) {
  sdLang = "en" === t.uiLang ? "en" : "fr";
  try {
    document.documentElement.lang = sdLang;
    document.title = sdTr("Fiche personnage pour Seedance");
  } catch (er) {}
}
(function () {
  var j0 = l.jsx,
    j1 = l.jsxs;
  l.jsx = function (a, p, k) {
    return j0(a, sdTrProps(a, p), k);
  };
  l.jsxs = function (a, p, k) {
    return j1(a, sdTrProps(a, p), k);
  };
})();
'''
open(os.path.join(HERE,'sd_i18n.js'),'w').write(js)
print('entries', len(D))
