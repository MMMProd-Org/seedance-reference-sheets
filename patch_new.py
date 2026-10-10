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
rep('    veins: "auto",\n    photoOnly: !1,\n  },', '    veins: "auto",\n    photoOnly: !1,\n    model: "seedream",\n    modelPick: 0,\n    sdIter: "",\n    sdShapeRef: !1,\n    sdRndN: 0,\n    sdRndOpen: !1,\n    sdRndMood: "everyday",\n    sdHeadSig: "",\n    sdIterOp: "",\n    uiLang: "'+LANG+'",\n    sdBodyImg: !0,\n  },')
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
# P24 GPT body, men in the reference outfit: natural front fill (same wording as Seedream), no "flat front panel"
rep('''        ("m" === e.pres
          ? "shirtless, fitted competition swim shorts ending at the upper thigh"
          : "a swim set: a " +
            ny() +
            ", and fitted swim shorts ending at the upper thigh") +
        t +
        "; fully opaque in all four views,''', '''        ("m" === e.pres
          ? "shirtless, square-cut swim trunks ending at the upper thigh"
          : "a swim set: a " +
            ny() +
            ", and fitted swim shorts ending at the upper thigh") +
        t +
        ("m" === e.pres ? "; the front naturally filled, in proportion to his adult build, neither flattened nor padded nor exaggerated" : "") +
        "; fully opaque in all four views,''')
rep('''      ("m" === e.pres
        ? "shirtless, " +
          n +
          ", in plain cobalt blue, plain unbranded white training shoes"''', '''      ("m" === e.pres
        ? "shirtless, " +
          n.replace(" with a flat front panel", "") +
          ", in plain cobalt blue; the front naturally filled, in proportion to his adult build, neither flattened nor padded nor exaggerated; plain unbranded white training shoes"''')
# P25 Seedream recommendation shown with the "Planche corps sans tête" toggle (Corps tab)
rep('''                  (0, l.jsx)(ax, {
                    checked: !!t[a],
                    onChange: (e) => g(a, e),
                    children: o,
                  }),
                  r.hint &&''', '''                  (0, l.jsx)(ax, {
                    checked: !!t[a],
                    onChange: (e) => g(a, e),
                    children: o,
                  }),
                  "headless" === a &&
                    "seedream" === t.model &&
                    (0, l.jsx)("p", {
                      className: "mt-1 text-sm font-semibold",
                      children:
                        "Conseillé : sans visage dans l'image, Seedream respecte mieux la poitrine, les fessiers et les proportions. La tête s'ajoute ensuite avec la carte 3 (« Assembler tête et corps »).",
                    }),
                  r.hint &&''')
# P26 Seedream: dedicated card component + column title
rep('''        B = (e, t, n, r, a) =>
          (0, l.jsx)(
            aj,''', '''        B = (e, t, n, r, a) =>
          (0, l.jsx)(
            "seedream" === sdModelNow && !sdX ? sdCard : aj,''')
rep('''            ? y
              ? "Ta planche"
              : "Tes deux images"
            : "Ta retouche",
        W =''', '''            ? y
              ? "Ta planche"
              : "seedream" === t.model
                ? "Tes trois étapes, dans l'ordre"
                : "Tes deux images"
            : "Ta retouche",
        W =''')
# P29 GPT head sheet: four views (back of the head added) for people; looks and imperfection texts; flat light for plain faces
rep('''      " to be used as an identity reference for AI video: three " +
      (n ? "" : "close-up ") +
      "studio portraits of the same " +''', '''      " to be used as an identity reference for AI video: " +
      (n ? "three studio portraits" : "four close-up studio views") +
      " of the same " +''')
rep('''                    "Create a real photograph to be used as an identity reference for AI video: three " +
                    ((t = "animal" === e.mode) ? "" : "close-up ") +
                    "studio portraits of the " +''', '''                    "Create a real photograph to be used as an identity reference for AI video: " +
                    ((t = "animal" === e.mode) ? "three studio portraits" : "four close-up studio views") +
                    " of the " +''')
rep('''    : "A 16:9 landscape image split into three equal vertical panels of the same size, separated by narrow gaps of the same grey as the backdrop.\\nEach panel is a tight close-up of the head and neck, framed from just above the top of the hair down to the base of the neck and cropped at the collarbones, so the head, from the top of the hair to the chin, fills about two thirds of the panel height. Nothing below the collarbones is visible: no chest and no torso.\\nLeft panel: front view, facing the camera, eyes looking into the lens.\\nCenter panel: three-quarter view, head turned 45 degrees toward the subject's left.\\nRight panel: exact profile of the subject's left side, the face pointing toward the left edge of the panel.\\nThe head is the same size and at the same height in all three panels. Long hair may be cropped by the panel edges.";''', '''    : "A 16:9 landscape image split into four equal vertical panels of the same size, separated by narrow gaps of the same grey as the backdrop.\\nEach panel is a tight close-up of the head and neck, framed from just above the top of the hair down to the base of the neck and cropped at the collarbones, so the head, from the top of the hair to the chin, fills about two thirds of the panel height. Nothing below the collarbones is visible: no chest and no torso.\\nFirst panel (left): front view, facing the camera, eyes looking into the lens.\\nSecond panel: three-quarter view, head turned 45 degrees toward the subject's left.\\nThird panel: exact profile of the subject's left side, the face pointing toward the left edge of the panel.\\nFourth panel (right): back view, the back of the head seen straight from behind, no face visible" + sdBackHair() + ".\\nThe head is the same size and at the same height in all four panels. Long hair may be cropped by the panel edges.";''')
rep('''the same light in all three panels. 85mm lens''', '''the same light in every panel. 85mm lens''')
rep('''    ["p3", "Profil", "the right panel (left profile)"],
  ],''', '''    ["p3", "Profil", "the third panel (left profile)"],
    ["p4", "Dos", "the fourth panel (back view)"],
  ],''')
rep('''                                : "tête en trois vues, corps en quatre vues",''', '''                                : "tête et corps en quatre vues",''')
rep('''        "plain, unremarkable looks with slightly irregular features, clearly not a model",''', '''        "a plain, forgettable face, the kind nobody notices in a crowd: features slightly out of proportion with each other, a little heavy or a little bland in places, no striking feature",''')
rep('''        "unconventional, homely looks with irregular, uneven features, clearly not conventionally attractive",''', '''        "a homely, unconventional face: clearly irregular, uneven features that do not fit together harmoniously, nothing striking or glamorous",''')
rep('''        "clearly imperfect skin: visible pores, blemishes, redness, under-eye shadows, uneven tone, noticeable facial asymmetry",''', '''        "clearly imperfect skin: enlarged pores on the nose and cheeks, several small spots and blemishes, redness around the nose and chin, dark under-eye circles, an oily shine on the forehead and nose, an uneven, slightly blotchy tone, noticeable facial asymmetry",''')
rep('''        "rough skin texture: acne scars, broken capillaries, under-eye bags, blotchy tone, strong facial asymmetry",''', '''        "rough skin texture: acne scars, a few active spots, broken capillaries, under-eye bags, an oily shine, a blotchy tone, strong facial asymmetry",''')
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
            ? "Seedream ne se souvient de rien d'une génération à l'autre : chaque prompt se suffit à lui-même. Choisis dans Seedream le format indiqué sur chaque carte et ajoute les images qu'elle demande."
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
# (the tracked copy, sdTracked: a person's head sheet, an animal's whole-animal sheet)
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
            sdKey = sdModel + ":" + e.mode,
            sdMsg = "seedream" !== sdModel ? "" : "body" === t ? sdBodyCopyMsg(e) : "iter" === t ? sdIterCopyMsg(e) : "";
          sdTracked(t, e.mode) && (sdSeq = sdHeadCopySeq[sdKey] = (sdHeadCopySeq[sdKey] || 0) + 1);
          if (sdTracked(t, e.mode) && "seedream" !== sdModel) {
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
            sdSeq === sdHeadCopySeq[sdKey] &&
            n((e) => (e.mode === sdMode0 && e.faceSeed === sdSeed0 ? { ...e, ...sdSnap } : e));
          a && sdHeadNow && sdSeq === sdHeadCopySeq[sdKey] && n((e) => (e.mode === sdMode0 && e.faceSeed === sdSeed0 ? { ...e, sdHeadSig: sdHeadNow } : e));''')
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
                                                        ? "seedream" === t.model && sdRevealOk(t)
                                                          ? am.concat([["brief", "Seedream : slip de bain, torse nu, pieds nus"]])
                                                          : am
                                                        : "seedream" === t.model
                                                          ? [["sport", "Haut ajusté et cycliste, pieds nus"]].concat(
                                                              ap.filter(function (o) {
                                                                return "onepiece" === o[0];
                                                              }),
                                                              sdRevealOk(t)
                                                                ? [["tanga", "Seedream : haut triangle et tanga coupe brésilienne, pieds nus"]]
                                                                : [],
                                                            )
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
# P35 French grammar in the multi-character hints: "cet animal", "nouvel animal" (elision before a vowel)
rep('''Change le nom pour chaque nouveau " +
                                    (b ? "animal" : "personnage") +
                                    "."
                                  : "Donne un nom : c'est lui qui distingue ce " +
                                    (b ? "animal" : "personnage") +''', '''Change le nom pour chaque " +
                                    (b ? "nouvel animal" : "nouveau personnage") +
                                    "."
                                  : "Donne un nom : c'est lui qui distingue " +
                                    (b ? "cet animal" : "ce personnage") +''')
# P28 Seedream: unsupported case -> one actionable card; column title by workflow; mobile bar with step 3
rep('''                                    B("head", "1", "Planche tête"),''', '''                                    "seedream" === t.model && sdX ? sdUnsup(t, n) : B("head", "1", "Planche tête"),''')
rep('''                                    B("body", "2", "Planche corps"),''', '''                                    !("seedream" === t.model && sdX) && B("body", "2", "Planche corps"),''')
rep('''              : "seedream" === t.model
                ? "Tes trois étapes, dans l'ordre"
                : "Tes deux images"''', '''              : "seedream" === t.model && t.headless && !sdOff(t)
                ? "Tes trois étapes, dans l'ordre"
                : "Tes images"''')
rep('''              ? [["obj", "Copier la planche", !1]]
              : [
                  ["head", "Copier tête", !1],
                  ["body", "Copier corps", !1],
                ]''', '''              ? [["obj", "Copier la planche", !1]]
              : "seedream" === t.model && t.headless && !sdOff(t)
                ? sdBarItems(t)
                : [
                    ["head", "Copier tête", !1],
                    ["body", "Copier corps", !1],
                  ]''')
# P30 "Beauté" slider: warn when chosen features contradict a plain face
rep('''                    : r.hint,
                badge: "bust" === i ? af[t[a]] : void 0,''', '''                    : "looks" === a && sdLooksConflict(t)
                      ? sdLooksConflict(t)
                      : r.hint,
                badge: "bust" === i ? af[t[a]] : void 0,''')
# P27 Seedream: rules panel folded
rep('''function aN({ obj: e, sd: sdM }) {
  return (0, l.jsxs)("div", {
    className: "rounded-2xl border border-dashed p-4",
    children: [
      (0, l.jsx)("h3", {
        className: "font-bold",
        children: "Règles de tes planches",''', '''function aN({ obj: e, sd: sdM }) {
  return (0, l.jsxs)(sdM ? "details" : "div", {
    className: "rounded-2xl border border-dashed p-4",
    children: [
      (0, l.jsx)(sdM ? "summary" : "h3", {
        className: "font-bold" + (sdM ? " cursor-pointer" : ""),
        children: "Règles de tes planches",''')
# P31 audit v76: four-panel person head sheet described as such; three-quarter view named by frame side; noise removed; Seedream object card
rep("""Second panel: three-quarter view, head turned 45 degrees toward the subject's left.""", """Second panel: three-quarter view, head turned 45 degrees toward the right edge of the panel, showing more of the right side of the face.""")
rep('''    ["p2", "Trois quarts", "the center panel (three-quarter view)"],''', '''    ["p2", "Trois quarts", "the second panel (three-quarter view)"],''')
rep('''      (u ? " (three head close-ups)" : " (four full-body views)") +''', '''      (u
        ? s
          ? " (three head close-ups)"
          : " (four head close-ups: front, three-quarter, profile and back of the head)"
        : " (four full-body views)") +''')
rep('''The head sheet (three head close-ups on a grey backdrop)''', '''The head sheet (" +
                          (o ? "three head close-ups" : "four head close-ups: front, three-quarter, profile and back of the head") +
                          " on a grey backdrop)''', 2)
rep('''        })(r),
      ) +
      (0 === r.indexOf("edit")''', '''        })(r),
      ).replace(
        " A percentage within one point of its range counts as correct (not the body-to-head ratio).",
        "body" !== r || "person" !== e.mode || (e.photo && e.bodyAsIs) || an()
          ? ""
          : " A percentage within one point of its range counts as correct (not the body-to-head ratio).",
      ) +
      (0 === r.indexOf("edit")''')
rep('''            "Real photograph with natural skin, hair, fur and fabric texture, natural color, no retouching." +''', '''            "Real photograph with natural " +
            ("person" === e.mode ? "skin, hair and fabric" : "skin, hair, fur and fabric") +
            " texture, natural color, no retouching." +''')
rep('''                              ? B("obj", "1", "Planche objet")''', '''                              ? "seedream" === t.model && sdX
                                ? sdUnsup(t, n)
                                : B("obj", "1", "Planche objet")''')
# P32 GPT parity with Seedream (v77/v78): "Ordinaire" worded without "average" or "model"; skin micro-detail and film grain that Seedream renders
rep('''      [2, "Ordinaire", "an ordinary, average-looking person, not a model"],''', '''      [2, "Ordinaire", "an ordinary face you would pass in the street without noticing: no feature stands out, the proportions are a little uneven and not quite harmonious"],''')
rep('''function ru() {
  return rs(
    0 === e.looks && 2 === e.imperf
      ? "real, unretouched skin with visible pores and a natural, healthy texture"
      : t1("imperf", e.imperf),
  );
}''', '''function ru() {
  return (
    rs(
      0 === e.looks && 2 === e.imperf
        ? "real, unretouched skin with visible pores and a natural, healthy texture"
        : t1("imperf", e.imperf),
    ) +
    ("photo" === e.style && "person" === e.mode && !e.photo && e.imperf >= 1
      ? ", fine peach fuzz catching the light on the cheeks and jaw, natural lip texture with fine lines" +
        ("bald" === e.hairStyleSel || "shaved" === e.hairLen ? "" : ", a few flyaway hairs")
      : "")
  );
}''')
rep('''            " texture, natural color, no retouching." +''', '''            " texture, natural color, " +
            ("person" === e.mode ? "fine film grain, " : "") +
            "no retouching." +''')
# P33 eye size and nose width as sliders (Seedream module sdScaleCtl); new end values described in the prompt
rep('''        { t: "chips", k: "eyeSize", l: "Taille des yeux" },''', '''        { t: "sdscale", k: "eyeSize", l: "Taille des yeux" },''')
rep('''        { t: "chips", k: "noseW", l: "Nez, largeur" },''', '''        { t: "sdscale", k: "noseW", l: "Nez, largeur" },''')
rep('''          if ("sdrnd" === r.t) return sdRndBtn(t, g);''', '''          if ("sdrnd" === r.t) return sdRndBtn(t, g);
          if ("sdscale" === r.t) return sdScaleCtl(t, g, a);''')
rep('''      { small: "small", large: "large", xlarge: "very large, wide-open" }[
        e.eyeSize
      ] || "",''', '''      {
        xsmall: "very small",
        small: "small",
        medium: "medium-sized",
        large: "large",
        xlarge: "very large, wide-open",
      }[e.eyeSize] || "",''')
rep('''    a = [t1("noseW", e.noseW), t1("noseP", e.noseP)].filter(Boolean).join(", "),''', '''    a = [
      { xnarrow: "very narrow", xwide: "very wide" }[e.noseW] || t1("noseW", e.noseW),
      t1("noseP", e.noseP),
    ]
      .filter(Boolean)
      .join(", "),''')
# P34 GPT: a change of beauty level or corpulence since the last copied head sheet makes a new face, not an update of it
rep('''function n2() {
  return e.photo || !e.headSig || (e.headOwner || "") !== n1(e.name)
    ? null''', '''function n2() {
  return e.photo || !e.headSig || (e.headOwner || "") !== n1(e.name) || sdFaceReset()
    ? null''')
rep('''              headKind: o ? (o.sameFace ? "same" : "updated") : "new",
              headOwner: n1(e.name),''', '''              headKind: o ? (o.sameFace ? "same" : "updated") : "new",
              headOwner: n1(e.name),
              headLooks: e.looks,
              headFat: e.fat,''')
# P37 headLooks and headFat (P34) live wherever the other head-sheet fields do: default state, per-subject cache and
# defaults, and the two buttons that forget the head sheet; otherwise a reload or a subject switch loses them
for a in ['''    headKind: "",
    headRemovals: "",
    faceScars: 0,''', '''    headKind: "",
    headRemovals: "",
    eState: "",''']:
    rep(a, a.replace('    headRemovals: "",\n', '    headRemovals: "",\n    headLooks: "",\n    headFat: "",\n'))
rep('''    "headKind",
    "headRemovals",
    "faceSeed",''', '''    "headKind",
    "headRemovals",
    "headLooks",
    "headFat",
    "faceSeed",''')
for i in (34, 36):
    pad = ' ' * i
    a = pad + 'headKind: "",\n' + pad + 'headRemovals: "",\n'
    rep(a, a + pad + 'headLooks: "",\n' + pad + 'headFat: "",\n')
# P38 a head copy saved before P37 has no headLooks or headFat: take the current ones on load, as the loader does for headOwner
rep('''          r(e),
          e.base && n(e.base),''', '''          r(e),
          [e].concat(Object.values(e.modeCfg || {})).forEach(function (o) {
            o &&
              o.headSig &&
              (null == o.headLooks || "" === o.headLooks) &&
              ((o.headLooks = e.looks), (o.headFat = e.fat));
          }),
          e.base && n(e.base),''')
# P39 audit v89: the signature covers the final face, a saved GPT session keeps GPT (head references on reload: P37; Seedream copy order: P11)
rep('''    t.modelPick || (t.model = sdOk(t) ? "seedream" : "gpt");''', '''    t.modelPick || (t.model = "gpt" === e.model || !sdOk(t) ? "gpt" : "seedream");''')
rep('''    .filter(function (e) {
      return !/^(Clothing at the bottom edge|Bare neck|Worn on the head and face|Current state|No text)/.test(
        e,
      );
    })
    .join("\\n");
}''', '''    .filter(function (e) {
      return !/^(Clothing at the bottom edge|Bare neck|Worn on the head and face|Current state|No text)/.test(
        e,
      );
    })
    .join("\\n") + sdSigExtra();
}''')
# P40 audit v90: signatures saved before v90 are judged on what they hold (no false "face changed"); GPT says when only the build class is unknown
rep('''      : { sameFace: as() === e.headSig && "updated" !== e.headKind };''', '''      : { sameFace: "changed" !== sdSigState(e.headSig) && "updated" !== e.headKind };''')
rep('''        $ = "seedream" !== t.model && !y && !!t.headSig && t.headSig !== as(),''', '''        $ = "seedream" !== t.model && !y && !!t.headSig && "changed" === sdSigState(t.headSig),
        sdLegacyHead = "seedream" !== t.model && !y && !!t.headSig && "legacy" === sdSigState(t.headSig),''')
rep('''                                          " (origine, traits, yeux, cheveux, âge, beauté ou maquillage). Recopie d'abord la planche tête : la planche corps reprend toujours le visage de la dernière planche tête.",
                                        ],
                                      }),''', '''                                          " (origine, traits, yeux, cheveux, âge, beauté ou maquillage). Recopie d'abord la planche tête : la planche corps reprend toujours le visage de la dernière planche tête.",
                                        ],
                                      }),
                                    sdLegacyHead &&
                                      (0, l.jsx)("p", {
                                        className: "rounded-xl border p-3 text-sm text-muted-foreground",
                                        children: sdT(
                                          "Ta dernière planche tête a été copiée avec une version précédente de l'outil. Recopie-la seulement si tu as changé la corpulence depuis.",
                                          "Your last head sheet was copied with an earlier version of the tool. Copy it again only if you changed the build since.",
                                        ),
                                      }),''')
# P41 objects: one image per view (cards, rows, mobile bar, layout preview); Auto chip for materials and dominant colors
rep('''                                ? sdUnsup(t, n)
                                : B("obj", "1", "Planche objet")''', '''                                ? sdUnsup(t, n)
                                : sdObjCards(B)''')
rep('''          obj: [
            ["Joins", t.photo ? "Ta photo" : "Rien"],
            ["Format", I],
            ["Nomme-la", R(rU("planche"))],
          ],''', '''          obj: sdObjRow(0, t, R, I),
          obj2: sdObjRow(1, t, R, I),
          obj3: sdObjRow(2, t, R, I),
          obj4: sdObjRow(3, t, R, I),''')
rep('''          editObj: [
            ["Joins", D(rU("planche"))],
            ["Format", I],
            ["Nomme-la", F("planche", N || C.length > 0)],
          ],''', '''          editObj: [
            ["Joins", sdT("La vue à retoucher. Refais la même retouche sur chaque vue, une image à la fois.", "The view to retouch. Repeat the same retouch on each view, one image at a time.")],
            ["Format", sdT("Identique à la vue retouchée", "Same as the retouched view")],
            ["Nomme-la", F("vue", N || C.length > 0)],
          ],''')
rep('''              ? [["obj", "Copier la planche", !1]]''', '''              ? sdObjBar()''')
rep('''                  (0, l.jsx)(av, {
                    label: o,
                    opts: tZ[i],
                    values: t[a],
                    swatch: !!r.swatch,
                    onChange: (e) => g(a, e),
                  }),''', '''                  (0, l.jsx)(
                    av,
                    sdMultiAuto(a, r, t, n, {
                      label: o,
                      opts: tZ[i],
                      values: t[a],
                      swatch: !!r.swatch,
                      onChange: (e) => g(a, e),
                    }),
                  ),''')
# P42 one image per view for every object category and place: the six-square layout preview goes, texts say views, not a sheet
for _call in ('''                  y &&
                    (0, l.jsx)(aS, { cat: t.objCat, className: "lg:hidden" }),
''', '''                  y &&
                    (0, l.jsx)(aS, {
                      cat: t.objCat,
                      className: "hidden lg:block",
                    }),
'''):
    rep(_call, '')
_a = src.index('function aS({ cat: e, className: t }) {'); _b = src.index('\nfunction ', _a + 10)
src = src[:_a] + src[_b + 1:]
rep('''          hint: "Règle la présentation : véhicule posé sur ses roues, vêtement sur mannequin invisible, objet seul comme en photo produit. Maison et Intérieur donnent une planche de repérage de lieu, avec jour et nuit dans l'onglet Lumière et ambiance.",''', '''          hint: "Règle la présentation : véhicule posé sur ses roues, vêtement sur mannequin invisible, objet seul comme en photo produit. Maison et Intérieur donnent des vues de repérage de lieu, avec jour et nuit dans l'onglet Lumière et ambiance.",''')
rep('''          hint: "« Jour et nuit » : rangée du haut de jour, rangée du bas de nuit, mêmes points de vue. C'est ce qui fixe la lumière pour Seedance.",''', '''          hint: "« Jour et nuit » : les vues de jour, puis une carte « De nuit » à faire depuis la vue de jour choisie, même point de vue. C'est ce qui fixe la lumière pour Seedance.",''')
rep('''                              y
                                ? "six vues"
                                : "tête et corps en quatre vues",''', '''                              y
                                ? "une image par vue"
                                : "tête et corps en quatre vues",''')
rep('''          "Limite documentée de Seedance 2.5 (BytePlus, relayée par Civitai et Atlas Cloud) : 300 à 6000 px de côté, ratio 0,4 à 2,5. Le 16:9 passe.",''', '''          "Limite documentée de Seedance 2.5 (BytePlus, relayée par Civitai et Atlas Cloud) : 300 à 6000 px de côté, ratio 0,4 à 2,5. Le 16:9, le 3:2 et le 2:3 passent.",''')
# P43 animals: body sheet first and self-sufficient, head close-ups optional and made from it; head-tracking notices are for people only
rep('''            ["Joins", t.photo ? "Ta photo" : "Rien"],
            ["Format", I],
            ["Nomme-la", R(rU("tete"))],''', '''            ["Joins", "animal" === t.mode ? sdAnimalHeadJoin(t, R) : t.photo ? "Ta photo" : "Rien"],
            ["Format", I],
            ["Nomme-la", R(rU("tete"))],''')
rep('''            [
              "Joins",
              (0, l.jsxs)(
                "span",
                {
                  children: [
                    t.photo ? "Ta photo. " : "",
                    "La planche tête : rien si elle est juste au-dessus dans la conversation, sinon ",
                    R(rU("tete")),
                  ],
                },
                "joins",
              ),
            ],''', '''            [
              "Joins",
              "animal" === t.mode
                ? t.photo
                  ? "Ta photo"
                  : "Rien"
                : (0, l.jsxs)(
                    "span",
                    {
                      children: [
                        t.photo ? "Ta photo. " : "",
                        "La planche tête : rien si elle est juste au-dessus dans la conversation, sinon ",
                        R(rU("tete")),
                      ],
                    },
                    "joins",
                  ),
            ],''')
rep('''                : [
                    ["head", "Copier tête", !1],
                    ["body", "Copier corps", !1],
                  ]
            : y''', '''                : "animal" === t.mode
                  ? [
                      ["body", "Copier corps", !1],
                      ["head", "Copier tête", !1],
                    ]
                  : [
                      ["head", "Copier tête", !1],
                      ["body", "Copier corps", !1],
                    ]
            : y''')
rep('''        $ = "seedream" !== t.model && !y && !!t.headSig && "changed" === sdSigState(t.headSig),
        sdLegacyHead = "seedream" !== t.model && !y && !!t.headSig && "legacy" === sdSigState(t.headSig),
        H = "seedream" !== t.model && !y && !!n2(),''', '''        $ = "seedream" !== t.model && !y && "animal" !== t.mode && !!t.headSig && "changed" === sdSigState(t.headSig),
        sdLegacyHead = "seedream" !== t.model && !y && "animal" !== t.mode && !!t.headSig && "legacy" === sdSigState(t.headSig),
        H = "seedream" !== t.model && !y && "animal" !== t.mode && !!n2(),''')
rep('''                                    "seedream" === t.model && sdX ? sdUnsup(t, n) : B("head", "1", "Planche tête"),''', '''                                    "seedream" === t.model && sdX ? sdUnsup(t, n) : b ? B("body", "1", "Planche corps") : B("head", "1", "Planche tête"),''')
rep('''                                    !("seedream" === t.model && sdX) && B("body", "2", "Planche corps"),''', '''                                    !("seedream" === t.model && sdX) &&
                                      (b
                                        ? B("head", "2", sdT("Gros plans de tête (facultatif)", "Head close-ups (optional)"))
                                        : B("body", "2", "Planche corps")),''')
rep('''                              y
                                ? "une image par vue"
                                : "tête et corps en quatre vues",''', '''                              y
                                ? "une image par vue"
                                : "animal" === t.mode
                                  ? "corps en quatre vues, gros plans de tête en option"
                                  : "tête et corps en quatre vues",''')
# P44 animals: the whole-animal sheet is named as such; "Copier tête" / "Copier corps" are for people only
rep('''            ["Format", I],
            ["Nomme-la", R(rU("corps"))],''', '''            ["Format", I],
            ["Nomme-la", R(rU("animal" === t.mode ? "animal" : "corps"))],''')
rep('''                : "animal" === t.mode
                  ? [
                      ["body", "Copier corps", !1],
                      ["head", "Copier tête", !1],
                    ]''', '''                : "animal" === t.mode
                  ? [["body", sdT("Copier l'animal", "Copy the animal"), !1]]''')
rep('''              : [
                  ["editHead", "Copier tête", !P],
                  ["editBody", "Copier corps", !T],
                ],''', '''              : "animal" === t.mode
                ? [
                    ["editBody", sdT("Copier l'animal", "Copy the animal"), !T],
                    ["editHead", sdT("Copier gros plans", "Copy close-ups"), !P],
                  ]
                : [
                    ["editHead", "Copier tête", !P],
                    ["editBody", "Copier corps", !T],
                  ],''')
rep('''b ? B("body", "1", "Planche corps") : B("head", "1", "Planche tête"),''', '''b ? B("body", "1", sdT("Planche de l'animal", "Animal sheet")) : B("head", "1", "Planche tête"),''')
rep('''                                    B(
                                      "editHead",
                                      "1",
                                      "Tête retouchée",
                                      !P,
                                      T
                                        ? "Rien ne change sur la tête : seule la planche corps est à refaire."
                                        : W,
                                    ),
                                    B(
                                      "editBody",
                                      "2",
                                      "Corps retouché",
                                      !T,
                                      !T || N || C.length || "body" === t.fixImg
                                        ? W
                                        : "Rien ne change sur le corps : seule la planche tête est à refaire.",
                                    ),''', '''                                    "animal" === t.mode
                                      ? B(
                                          "editBody",
                                          "1",
                                          sdT("Animal retouché", "Retouched animal"),
                                          !T,
                                          !T || N || C.length || "body" === t.fixImg
                                            ? W
                                            : sdT("Rien ne change sur l'animal : seuls les gros plans sont à refaire.", "Nothing changes on the animal: only the close-ups need redoing."),
                                        )
                                      : B(
                                          "editHead",
                                          "1",
                                          "Tête retouchée",
                                          !P,
                                          T
                                            ? "Rien ne change sur la tête : seule la planche corps est à refaire."
                                            : W,
                                        ),
                                    "animal" === t.mode
                                      ? B(
                                          "editHead",
                                          "2",
                                          sdT("Gros plans retouchés (facultatif)", "Retouched close-ups (optional)"),
                                          !P,
                                          T
                                            ? sdT("Rien ne change sur les gros plans : seule la planche de l'animal est à refaire.", "Nothing changes on the close-ups: only the animal sheet needs redoing.")
                                            : W,
                                        )
                                      : B(
                                          "editBody",
                                          "2",
                                          "Corps retouché",
                                          !T,
                                          !T || N || C.length || "body" === t.fixImg
                                            ? W
                                            : "Rien ne change sur le corps : seule la planche tête est à refaire.",
                                        ),''')
rep('''                                : "animal" === t.mode
                                  ? "corps en quatre vues, gros plans de tête en option"''', '''                                : "animal" === t.mode
                                  ? "l'animal entier en quatre vues, gros plans de tête en option"''')
# P45 animals: the tracking line names the animal sheet, the copy their prompts build on (sdTracked), never the head close-ups
rep('''            "the most recent head sheet" +''', '''            (t ? "the most recent animal sheet" : "the most recent head sheet") +''')
for a in ['''" described below. If this conversation has no such head sheet, this is a new, original " +''', '''" only where the description below differs from that sheet. If this conversation has no such head sheet, this is a new, original " +''']:
    rep(a, a.replace('no such head sheet, this is a new, original " +', 'no such " +\n                (t ? "animal" : "head") +\n                " sheet, this is a new, original " +'))
# P46 Seedream for objects, places and animals (prompts: sdSolo): the retouch card, the copy messages and the
# three-step layout stay a person's; a GPT copy's tracking never reaches a Seedream prompt; formats are set in Seedream
rep('"seedream" === t.model && !sdX && sdIterBlock(t, g, B, L),', '"seedream" === t.model && !sdX && "person" === t.mode && sdIterBlock(t, g, B, L),')
rep('sdMsg = "seedream" !== sdModel ? "" : "body" === t ?', 'sdMsg = "seedream" !== sdModel || "person" !== e.mode ? "" : "body" === t ?')
rep('"seedream" === t.model && t.headless && !sdOff(t)', '"seedream" === t.model && "person" === t.mode && t.headless && !sdOff(t)', 2)
rep('  return e.photo || !e.headSig || (e.headOwner || "") !== n1(e.name) || sdFaceReset()', '  return "seedream" === e.model || e.photo || !e.headSig || (e.headOwner || "") !== n1(e.name) || sdFaceReset()')
rep('''        I = "16:9, demandé dans le prompt : vérifie l'image obtenue",''', '''        I = "seedream" === t.model ? "16:9, à choisir dans Seedream" : "16:9, demandé dans le prompt : vérifie l'image obtenue",''')
# the help texts name GPT and its conversation; in Seedream (people too) they name neither
rep('''" Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation du personnage.",''', '''"seedream" === sdModelNow
                                                    ? " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt."
                                                    : " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation du personnage.",''')
rep('ph: "vide = Auto : GPT choisit une race précise",', 'ph: "vide = Auto : l\'IA choisit une race précise",')
rep('hint: "Vide : GPT choisit lui-même une race ou un type précis', 'hint: "Vide : l\'IA choisit elle-même une race ou un type précis')
open('new/patched.js','w',encoding='utf-8').write(src)
orig=open('original/Planches_de_référence_pour_Seedance.html',encoding='utf-8').read()
L=orig.split('\n'); assert '</script' not in src
# P36 English page defaults before the script runs (sdSetLang keeps lang and title in sync afterwards)
if LANG=='en':
    title=json.load(open('i18n/extra.json',encoding='utf-8'))['Fiche personnage pour Seedance']
    for a,b in [('<html lang=fr','<html lang=en'),('<title>Fiche personnage pour Seedance</title>','<title>'+title+'</title>')]:
        assert L[0].count(a)==1,a
        L[0]=L[0].replace(a,b)
open('new/merged.html','w',encoding='utf-8').write('\n'.join([L[0],L[1],'    <script type="module">'+src+'</script>']+L[3:]))
print('ok',len(src))
