import sys, os, json
os.chdir(os.path.dirname(os.path.abspath(__file__)))
LANG='en'  # default interface language ('en' or 'fr'; tests/smoke.py expects 'en'); visitors can switch in the header
src=open('new/pretty.js',encoding='utf-8').read()
sd=open('seedream_new.js',encoding='utf-8').read()+'\n'+open('sd_i18n.js',encoding='utf-8').read()
def rep(old,new,count=1):
    global src
    n=src.count(old)
    assert n==count,(n,old[:90])
    src=src.replace(old,new)
# P1 state defaults
rep('    veins: "auto",\n    photoOnly: !1,\n  },', '    veins: "auto",\n    photoOnly: !1,\n    model: "seedream",\n    modelPick: 0,\n    sdIter: "",\n    sdShapeRef: !1,\n    sdRndN: 0,\n    sdRndOpen: !1,\n    sdRndMood: "everyday",\n    sdHeadSig: "",\n    sdIterOp: "",\n    uiLang: "'+LANG+'",\n  },')
# P17 new bust shape "Poire" (GPT + Seedream)
rep('''      [
        "conical",
        "En obus",
        "a more forward-projecting, tapered bust line in the side views",
      ],''','''      [
        "conical",
        "En obus",
        "a more forward-projecting, tapered bust line in the side views",
      ],
      [
        "pear",
        "Poire",
        "a pear-shaped bust line: narrower and flatter in the upper part, the volume gathering in a fuller, rounded lower half, slightly elongated, with a moderate natural drop; not round all over, not high",
      ],''')
# P18 hint: "random" in the free outfit fields
for a,b in [('ph: "autre, en anglais : ex. grey wool turtleneck",','ph: "autre, en anglais : ex. grey wool turtleneck, ou random (choisi selon l\'âge)",'),
            ('ph: "autre : ex. straight raw denim jeans",','ph: "autre : ex. straight raw denim jeans, ou random",'),
            ('ph: "autre : ex. worn brown leather boots",','ph: "autre : ex. worn brown leather boots, ou random",'),
            ('ph: "autre : ex. steel watch on the left wrist",','ph: "autre : ex. steel watch on the left wrist, ou random",')]:
    rep(a,b)
# P19 one-click age-appropriate outfit button (Tenue tab)
rep('''      id: "tenue",
      label: "Tenue",
      items: [
        {''','''      id: "tenue",
      label: "Tenue",
      items: [
        { t: "sdrnd", k: "sdRndN", l: "Tenue au hasard" },
        {''')
rep('''          if ("toggle" === r.t)
            return (0, l.jsxs)(''','''          if ("sdrnd" === r.t) return sdRndBtn(t, g);
          if ("toggle" === r.t)
            return (0, l.jsxs)(''')
# P20 GPT: marked auto tier text + Auto label
rep('''    t1("bustShape", e.bustShape) +
    "; " +''','''    ("marked" === e.sdAutoTier ? SD_GPT_MARKED : "natural" === e.sdAutoTier ? SD_GPT_NATURAL : t1("bustShape", e.bustShape)) +
    "; " +''')
rep('''    bustShape: [
      ["auto", "Auto", ""],''','''    bustShape: [
      ["auto", "Auto (âge)", ""],''')
# P21 long status messages stay longer and wrap inside the screen
rep('''          let e = setTimeout(() => h(""), 2400);''', '''          let e = setTimeout(() => h(""), d.length > 60 ? 7e3 : 2400);''')
rep('''            className:
              "pointer-events-none fixed left-1/2 z-30 -translate-x-1/2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity bottom-24 lg:bottom-6 " +
              (d ? "opacity-100" : "opacity-0"),
            children: d,''', '''            className:
              "pointer-events-none fixed left-1/2 z-30 -translate-x-1/2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity bottom-24 lg:bottom-6 " +
              (d.length > 60 ? "rounded-2xl " : "rounded-full ") +
              (d ? "opacity-100" : "opacity-0"),
            style: { maxWidth: "min(92vw, 560px)", width: d.length > 60 ? "max-content" : void 0, textAlign: "center" },
            children: d,''')
# P22 tooltip on "Partir d'une photo"
rep('''                          (0, l.jsx)(ax, {
                            checked: t.photo,
                            onChange: (e) => g("photo", e),
                            disabled: k,
                            children: "Partir d'une photo",
                          }),''', '''                          sdTip(
                            (0, l.jsx)(ax, {
                              checked: t.photo,
                              onChange: (e) => g("photo", e),
                              disabled: k,
                              children: "Partir d'une photo",
                            }),
                            sdPhotoTip(t),
                            "sd-tip-photo",
                          ),''')
# P23 bust slider help: cup sizes are sent in Seedream, not in GPT
rep('''                  "bust" === i
                    ? "Repère pour toi, jamais envoyé au modèle : le prompt décrit le volume par sa projection de profil, sans taille de bonnet.''', '''                  "bust" === i
                    ? ("seedream" === t.model
                        ? "Repère pour toi. En Seedream 5.0, le prompt cite aussi une fourchette de bonnet (B à C, D à E, F et plus) ; en GPT Image 2.5, aucune taille de bonnet n'est envoyée. "
                        : "Repère pour toi, jamais envoyé au modèle : le prompt décrit le volume par sa projection de profil, sans taille de bonnet. ") + "''')
rep(''' Bonnet européen = tour de poitrine moins dessous de poitrine''', '''Bonnet européen = tour de poitrine moins dessous de poitrine''')
# P2 Seedream module (module scope, before the root render)
rep('let aE = [],\n  aT = { person: "corps", animal: "espece", object: "objet" };', sd+'\nlet aE = [],\n  aT = { person: "corps", animal: "espece", object: "objet" };')
# P3 GPT state view (tanga -> swim in GPT) + Seedream wrap of the prompt object
rep('        (e = t));\n      let m = (function () {', '        (sdSetLang(t), (e = sdG(t))));\n      let m = sdWrap(\n        t,\n        (function () {')
rep('''                  editHead: rH("head"),
                  editBody: rH("body"),
                });
        })(),
        g = (e, t) => n((n) => ({ ...n, [e]: t })),''','''                  editHead: rH("head"),
                  editBody: rH("body"),
                });
        })(),
      ),
        g = (e, t) => n((n) => ({ ...n, [e]: t })),
        sdX = sdOff(t),
        sdM = sdMsg(t),
        sdDst = "seedream" === t.model ? "Seedream 5.0" : "GPT Image 2.5",''')
# P4 card + mobile bar: block unsupported Seedream cases, show destination
rep('''              text: m[e],
              disabled: r,
              disabledHint: a,''','''              text: m[e],
              disabled: r || sdX,
              disabledHint: sdX ? sdM : a,
              dest: sdDst,''')
rep('''                    disabled: n,
                    onClick: () => A(e, m[e]),''','''                    disabled: n || sdX,
                    onClick: () => A(e, m[e]),''')
# P5 card rows
rep('        q = {\n          head: [', '        q = sdRows(t, m, R, {\n          head: [')
rep('''            ["Nomme-la", F("planche", N || C.length > 0)],
          ],
        },
        B = (e, t, n, r, a) =>''','''            ["Nomme-la", F("planche", N || C.length > 0)],
          ],
        }),
        B = (e, t, n, r, a) =>''')
# P6 GPT-conversation notices hidden in Seedream
rep('        $ = !y && !!t.headSig && t.headSig !== as(),\n        H = !y && !!n2(),', '        $ = "seedream" !== t.model && !y && !!t.headSig && t.headSig !== as(),\n        H = "seedream" !== t.model && !y && !!n2(),')
# P7 header subtitle + model switch
rep('''              (0, l.jsx)("p", {
                className: "mt-1.5 text-[15px] text-muted-foreground",
                children:
                  "Personnages, animaux et objets pour Seedance 2.5, générés dans GPT Image 2.5. À droite, les prompts à copier.",
              }),''','''              (0, l.jsx)("p", {
                className: "mt-1.5 text-[15px] text-muted-foreground",
                children:
                  sdT(
                    "Personnages, animaux et objets pour Seedance 2.5, à générer dans " +
                      ("seedream" === t.model ? "Seedream 5.0" : "GPT Image 2.5") +
                      ". Règle à gauche, copie les prompts à droite.",
                    "Characters, animals and objects for Seedance 2.5, to generate in " +
                      ("seedream" === t.model ? "Seedream 5.0" : "GPT Image 2.5") +
                      ". Set things up on the left, copy the prompts on the right.",
                  ),
              }),
              (0, l.jsxs)("div", {
                className: "mt-4 flex flex-wrap gap-3",
                children: [
                  (0, l.jsx)(ab, {
                    label: "Modèle de génération",
                    value: "seedream" === t.model ? "seedream" : "gpt",
                    onChange: (e) => n((t) => ({ ...t, model: e, modelPick: 1 })),
                    options: [
                      ["gpt", "GPT Image 2.5"],
                      ["seedream", "Seedream 5.0"],
                    ],
                  }),
                  (0, l.jsx)(ab, {
                    label: "Langue de l'interface",
                    value: "en" === t.uiLang ? "en" : "fr",
                    onChange: (e) => n((t) => ({ ...t, uiLang: e })),
                    options: [
                      ["fr", "Français"],
                      ["en", "English"],
                    ],
                  }),
                ],
              }),''')
# P8 rules panel
rep('(0, l.jsx)(aN, { obj: y }),', '(0, l.jsx)(aN, { obj: y, sd: "seedream" === t.model }),')
rep('function aN({ obj: e }) {', 'function aN({ obj: e, sd: sdM }) {')
rep('''          "Une conversation GPT par personnage permet de regrouper ses références. Pour chaque retouche, joins la planche à utiliser. Pour des personnages secondaires dans une même conversation, coche « Plusieurs personnages dans la même conversation GPT ».",''','''          sdM
            ? "Seedream ne se souvient de rien d'une génération à l'autre : chaque prompt se suffit à lui-même. Choisis le format 16:9 dans Seedream et ajoute les images indiquées sur chaque carte."
            : "Une conversation GPT par personnage permet de regrouper ses références. Pour chaque retouche, joins la planche à utiliser. Pour des personnages secondaires dans une même conversation, coche « Plusieurs personnages dans la même conversation GPT ».",''')
rep('''          "En mode Thinking, ChatGPT peut vérifier et relancer l'image plusieurs fois. Chaque prompt demande au plus 4 images produites, chaque nouvel essai devant corriger d'abord l'écart le plus visible ; une génération bloquée par le filtre ne compte pas et peut être relancée une fois, à l'identique ; après deux blocages, ChatGPT s'arrête et livre la meilleure image déjà produite. Le respect de ces consignes dépend de ChatGPT.",''','''          sdM
            ? "Seedream ne vérifie pas son image : c'est toi qui juges et relances. Vise moins de 600 mots (conseil de BytePlus) ; le compteur t'alerte au-delà. Si ta plateforme propose d'optimiser le prompt automatiquement, désactive cette option."
            : "En mode Thinking, ChatGPT peut vérifier et relancer l'image plusieurs fois. Chaque prompt demande au plus 4 images produites, chaque nouvel essai devant corriger d'abord l'écart le plus visible ; une génération bloquée par le filtre ne compte pas et peut être relancée une fois, à l'identique ; après deux blocages, ChatGPT s'arrête et livre la meilleure image déjà produite. Le respect de ces consignes dépend de ChatGPT.",''')
# P9 "Nouveau personnage" keeps the model choice
rep('''                                "mode" !== r &&
                                  "modeCfg" !== r &&''','''                                "mode" !== r &&
                                  "modeCfg" !== r &&
                                  "model" !== r &&
                                  "modelPick" !== r &&
                                  "uiLang" !== r &&''')
# P10 GPT-conversation alert hidden in Seedream
rep('''                  f &&
                    (0, l.jsxs)("p", {
                      role: "alert",
                      className:
                        "rounded-xl border border-[hsl(var(--tape))] p-3 text-sm",''','''                  f &&
                    "seedream" !== t.model &&
                    (0, l.jsxs)("p", {
                      role: "alert",
                      className:
                        "rounded-xl border border-[hsl(var(--tape))] p-3 text-sm",''')
# P11 copy handler: snapshot taken at click time (before the clipboard await), newest head copy wins
rep('''          let a = await ad(r);
          if (a && "head" === t) {
            var o;
            let t =
              ((o = n2()),
              {
                headSig: as(),
                headFull: n3(),
                headKind: o ? (o.sameFace ? "same" : "updated") : "new",
                headOwner: n1(e.name),
                headRemovals: n6("animal" === e.mode),
              });
            n((e) => ({ ...e, ...t }));
          }''','''          var sdModel = e.model,
            sdSnap = null,
            sdSeq = 0,
            sdHeadNow = "head" === t && "seedream" === sdModel && "object" !== e.mode ? as() : "",
            sdMode0 = e.mode,
            sdSeed0 = e.faceSeed,
            sdMsg = "body" === t && "seedream" === sdModel ? sdBodyCopyMsg(e) : "";
          "head" === t && (sdSeq = ++sdHeadCopySeq);
          if ("head" === t && "seedream" !== sdModel) {
            var o = n2();
            sdSnap = {
              headSig: as(),
              headFull: n3(),
              headKind: o ? (o.sameFace ? "same" : "updated") : "new",
              headOwner: n1(e.name),
              headRemovals: n6("animal" === e.mode),
            };
          }
          let a = await ad(r);
          a &&
            sdSnap &&
            sdSeq === sdHeadCopySeq &&
            n((e) => (e.mode === sdMode0 && e.faceSeed === sdSeed0 ? { ...e, ...sdSnap } : e));
          a && sdHeadNow && sdSeq === sdHeadCopySeq && n((e) => (e.mode === sdMode0 && e.faceSeed === sdSeed0 ? { ...e, sdHeadSig: sdHeadNow } : e));''')
rep('h("Copié. Colle-le dans GPT Image 2.5.")', 'h(sdMsg || sdT("Copié. Colle-le dans ", "Copied. Paste it into ") + ("seedream" === sdModel ? "Seedream 5.0." : "GPT Image 2.5."))')
# P12 tanga option (Seedream, women) + displayed value
rep('''                                                    opts:
                                                      "m" === t.pres ? am : ap,
                                                    value:
                                                      "m" === t.pres &&
                                                      "onepiece" === t.refCover
                                                        ? "swim"
                                                        : t.refCover,''','''                                                    opts:
                                                      "m" === t.pres
                                                        ? "seedream" === t.model
                                                          ? am.concat([["brief", "Seedream : slip de bain, torse nu, pieds nus"]])
                                                          : am
                                                        : "seedream" === t.model
                                                          ? ap.concat([
                                                              [
                                                                "tanga",
                                                                "Seedream : haut triangle et tanga coupe brésilienne, pieds nus",
                                                              ],
                                                            ])
                                                          : ap,
                                                    value: sdShownCover(t),''')
# P13 multiChar toggle is GPT-only
rep('''                      !y &&
                        (0, l.jsxs)("div", {
                          className: "mt-4",
                          children: [
                            (0, l.jsxs)(ax, {
                              checked: !!t.multiChar,''','''                      !y &&
                        "seedream" !== t.model &&
                        (0, l.jsxs)("div", {
                          className: "mt-4",
                          children: [
                            (0, l.jsxs)(ax, {
                              checked: !!t.multiChar,''')
# P14 destination on the copy button
rep('''  copied: c,
  open: d,
  setOpen: h,
}) {
  let f = (0, s.useRef)(null);''','''  copied: c,
  open: d,
  setOpen: h,
  dest: sdD,
}) {
  let f = (0, s.useRef)(null);''')
rep('            c ? "Copié" : "Copier le prompt",', '            c ? "Copié" : sdD ? sdT("Copier pour ", "Copy for ") + sdD : "Copier le prompt",')
# P15 loader: model never chosen explicitly -> Seedream; stored "beach" -> tanga in Seedream, swim in GPT
rep('    for (let n in tJ) t[n] = n in e ? e[n] : tJ[n];', '    for (let n in tJ) t[n] = n in e ? e[n] : tJ[n];\n    t.modelPick || (t.model = sdOk(t) ? "seedream" : "gpt");')
rep('        var a = e.modeCfg && e.modeCfg.person;', '        var a = e.modeCfg && e.modeCfg.person,\n          sdBeach = !e.modelPick || "seedream" === e.model;')
rep('              ("beach" === e.refCover && (e.refCover = "swim"),', '              ("beach" === e.refCover && (e.refCover = sdBeach ? "tanga" : "swim"),')
# P16 Seedream iteration card (edit of an approved body sheet), Seedream create mode only
rep("""                                    B("body", "2", "Planche corps"),
                                  ],
                                })),""", """                                    B("body", "2", "Planche corps"),
                                    "seedream" === t.model && !sdX && sdIterBlock(t, g, B, L),
                                  ],
                                })),""")
# P25 French grammar in the multi-character hints: "cet animal", "nouvel animal" (elision before a vowel)
rep('''Change le nom pour chaque nouveau " +
                                    (b ? "animal" : "personnage") +
                                    "."
                                  : "Donne un nom : c'est lui qui distingue ce " +
                                    (b ? "animal" : "personnage") +''', '''Change le nom pour chaque " +
                                    (b ? "nouvel animal" : "nouveau personnage") +
                                    "."
                                  : "Donne un nom : c'est lui qui distingue " +
                                    (b ? "cet animal" : "ce personnage") +''')
open('new/patched.js','w',encoding='utf-8').write(src)
orig=open('original/Planches_de_référence_pour_Seedance.html',encoding='utf-8').read()
L=orig.split('\n'); assert '</script' not in src
# P24 English page defaults before the script runs (sdSetLang keeps lang and title in sync afterwards)
if LANG=='en':
    title=json.load(open('i18n/extra.json',encoding='utf-8'))['Fiche personnage pour Seedance']
    for a,b in [('<html lang=fr','<html lang=en'),('<title>Fiche personnage pour Seedance</title>','<title>'+title+'</title>')]:
        assert L[0].count(a)==1,a
        L[0]=L[0].replace(a,b)
open('new/merged.html','w',encoding='utf-8').write('\n'.join([L[0],L[1],'    <script type="module">'+src+'</script>']+L[3:]))
print('ok',len(src))
