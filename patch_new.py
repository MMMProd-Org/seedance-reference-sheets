import os
import json
os.chdir(os.path.dirname(os.path.abspath(__file__)))
LANG='en'  # default interface language ('en' or 'fr'; tests/smoke.py expects 'en'); visitors can switch in the header
src=open('new/pretty.js',encoding='utf-8').read()
sd=open('seedream_new.js',encoding='utf-8').read()+'\n'+open('sd_i18n.js',encoding='utf-8').read()
# the release version shown in the header, set by CI from version.py; none in a local build
VERSION=os.environ.get('SD_VERSION','')
assert VERSION=='' or VERSION.count('.')==2 and all(p.isdigit() for p in VERSION.split('.')),VERSION
sd+='\nvar SD_VERSION = '+json.dumps(VERSION)+';'
def rep(old,new,count=1):
    global src
    n=src.count(old)
    assert n==count,(n,old[:90])
    src=src.replace(old,new)
# P1 state defaults
rep('    veins: "auto",\n    photoOnly: !1,\n  },', '    veins: "auto",\n    photoOnly: !1,\n    model: "seedream",\n    modelPick: 0,\n    sdIter: "",\n    sdShapeRef: !1,\n    sdRndN: 0,\n    sdRndOpen: !1,\n    sdRndMood: "everyday",\n    sdHeadSig: "",\n    sdIterOp: "",\n    sdIterPre: "",\n    uiLang: "'+LANG+'",\n    sdBodyImg: !0,\n    objMannequin: !1,\n  },')
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
    "; " +''','''    sdAsymGpt(sdDropX() ? sdDropGpt() : "marked" === e.sdAutoTier ? SD_GPT_MARKED : "natural" === e.sdAutoTier ? SD_GPT_NATURAL : t1("bustShape", e.bustShape)) +
    "; " +''')
rep('''    bustShape: [
      ["auto", "Auto", ""],''','''    bustShape: [
      ["auto", "Auto (âge)", ""],''')
# P21 long status messages stay longer and wrap inside the screen
rep('''          let e = setTimeout(() => h(""), 2400);''', '''          let e = setTimeout(() => h(""), d.length > 60 ? 7e3 : 2400);''')
rep('''        }, [d]),
        (e = t));''', '''        }, [d]),
        (0, s.useEffect)(() => {
          const bar = document.getElementById("sd-mobile-copy-bar");
          const measure = () => bar.parentElement.style.setProperty("--sd-copy-bar-height", bar.getBoundingClientRect().height + "px");
          const observer = new ResizeObserver(measure);
          observer.observe(bar, { box: "border-box" });
          measure();
          return () => observer.disconnect();
        }, []),
        (e = t));''')
rep('''            className:
              "pointer-events-none fixed left-1/2 z-30 -translate-x-1/2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity bottom-24 lg:bottom-6 " +
              (d ? "opacity-100" : "opacity-0"),
            children: d,''', '''            className:
              "pointer-events-none fixed left-1/2 z-30 -translate-x-1/2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity bottom-24 lg:bottom-6 " +
              (d.length > 60 ? "rounded-2xl " : "rounded-full ") +
              (d ? "opacity-100" : "opacity-0"),
            style: { maxWidth: "min(92vw, 560px)", width: d.length > 60 ? "max-content" : void 0, textAlign: "center", "--sd-toast-bottom": y && U.length > 2 ? "max(6rem, calc(var(--sd-copy-bar-height, 0px) + 8px))" : void 0 },
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
                        ? "Repère pour toi. En Seedream 5.0, le prompt cite aussi une taille de bonnet (B à C, D, D à E, puis H pour Très généreuse, ou F à G au choix) ; en GPT Image 2.5, aucune taille de bonnet n'est envoyée. "
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
                  SD_VERSION &&
                    (0, l.jsx)("span", {
                      className: "text-xs text-muted-foreground",
                      style: { alignSelf: "center" },
                      children: "v" + SD_VERSION,
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
            sdKey = sdModel + ":" + e.mode + ":" + sdKind(e),
            sdKid0 = sdKind(e),
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
            n((e) => (e.mode === sdMode0 && e.faceSeed === sdSeed0 && sdKind(e) === sdKid0 ? { ...e, ...sdSnap } : e));
          a && sdHeadNow && sdSeq === sdHeadCopySeq[sdKey] && n((e) => (e.mode === sdMode0 && e.faceSeed === sdSeed0 && sdKind(e) === sdKid0 ? { ...e, sdHeadSig: sdHeadNow } : e));''')
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
                                                          ? (t.chest >= 4 ? [["sport", "Haut ample sans manches et cycliste, pieds nus"], ["fitted", "Haut ajusté et cycliste, pieds nus", "", null, "warn"]] : [["sport", "Haut ajusté et cycliste, pieds nus"]]).concat(
                                                              ap.filter(function (o) {
                                                                return "onepiece" === o[0];
                                                              }),
                                                              sdRevealOk(t)
                                                                ? [["tanga", t.chest >= 4 ? "Seedream : haut ample sans manches et tanga coupe brésilienne, pieds nus (remplace le triangle en Très généreuse)" : sdDropRaw(t) ? "Seedream : haut ample sans manches et tanga coupe brésilienne, pieds nus (remplace le triangle en Très tombante)" : "Seedream : haut triangle et tanga coupe brésilienne, pieds nus"]]
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
                : "Tes deux images"''', '''              : "seedream" === t.model && t.headless && !sdChild(t) && !sdOff(t)
                ? "Tes trois étapes, dans l'ordre"
                : "Tes images"''')
rep('''              ? [["obj", "Copier la planche", !1]]
              : [
                  ["head", "Copier tête", !1],
                  ["body", "Copier corps", !1],
                ]''', '''              ? [["obj", "Copier la planche", !1]]
              : "seedream" === t.model && t.headless && !sdChild(t) && !sdOff(t)
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
# A saved GPT session P53 would never have saved counts as picked by hand, so P53 never switches it: one for a subject
# Seedream can do (saved by a build without P53), or one from before the model choice was recorded (no modelPick key).
rep('''    t.modelPick || (t.model = sdOk(t) ? "seedream" : "gpt");''', '''    t.modelPick || ("gpt" === e.model && (sdOk(t) || !("modelPick" in e)) ? (t.modelPick = 1) : (t.model = sdOk(t) ? "seedream" : "gpt"));''')
rep('''  return t
    .split("\\n")
    .filter(function (e) {
      return !/^(Clothing at the bottom edge|Bare neck|Worn on the head and face|Current state|No text)/.test(
        e,
      );
    })
    .join("\\n");
}''', '''  return sdSigWithoutOutfit(t
    .split("\\n")
    .filter(function (e) {
      return !/^(Clothing at the bottom edge|Bare neck|Worn on the head and face|Current state|No text)/.test(
        e,
      );
    })
    .join("\\n")) + sdSigExtra();
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
          obj4: sdObjRow(3, t, R, I),
          obj5: sdObjRow(4, t, R, I),
          objTri: sdObjTriRow(t, R),''')
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
rep('''              className: "mx-auto flex max-w-[640px] gap-2",''', '''              className: "mx-auto flex max-w-[640px] gap-2",
              style: y && U.length > 2 ? { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } : void 0,''')
rep('''              "fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 px-4 pt-3 backdrop-blur lg:hidden",''', '''              "fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 px-4 pt-3 backdrop-blur lg:hidden",
            id: "sd-mobile-copy-bar",''')
# P47 "Mise en planche seulement" on an object or a place: its own name and help, nothing of a person's face or outfit;
# for a garment, the optional invisible mannequin, explained on hover (sdKeepMannequin)
rep('''                              onChange: (e) => g("photoOnly", e),
                              disabled: k,
                              children: "Mise en planche seulement",
                            }),''', '''                              onChange: (e) => g("photoOnly", e),
                              disabled: k,
                              children: y ? sdOnlyLabel(t) : "Mise en planche seulement",
                            }),
                          y &&
                            t.photo &&
                            t.photoOnly &&
                            "clothing" === t.objCat &&
                            sdTip(
                              (0, l.jsx)(ax, {
                                checked: !!t.objMannequin,
                                onChange: (e) => g("objMannequin", e),
                                disabled: k,
                                children: sdT("Sur mannequin invisible", "On an invisible mannequin"),
                              }),
                              sdMannequinTip(),
                              "sd-tip-mannequin",
                            ),''')
rep('''                            className: "text-sm",
                            children: [
                              (0, l.jsx)("b", {
                                children: "Mise en planche seulement.",
                              }),''', '''                            className: "text-sm",
                            children: y ? sdOnlyHelp(t) : [
                              (0, l.jsx)("b", {
                                children: "Mise en planche seulement.",
                              }),''')
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
# P42 separate images for objects and places; v110 replaces the static preview with selectable views
for _call in ('''                  y &&
                    (0, l.jsx)(aS, { cat: t.objCat, className: "lg:hidden" }),
''', '''                  y &&
                    (0, l.jsx)(aS, {
                      cat: t.objCat,
                      className: "hidden lg:block",
                    }),
'''):
    _cls = 'lg:hidden' if 'lg:hidden' in _call else 'hidden lg:block'
    rep(_call, '                  y && sdPlaceThumb(t, g, h, ' + repr(_cls) + '),\n')
_a = src.index('function aS({ cat: e, className: t }) {')
_b = src.index('\nfunction ', _a + 10)
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
rep('"seedream" === t.model && t.headless && !sdChild(t) && !sdOff(t)', '"seedream" === t.model && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)', 2)
rep('  return e.photo || !e.headSig || (e.headOwner || "") !== n1(e.name) || sdFaceReset()', '  return "seedream" === e.model || e.photo || !e.headSig || (e.headOwner || "") !== n1(e.name) || sdFaceReset()')
rep('''        I = "16:9, demandé dans le prompt : vérifie l'image obtenue",''', '''        I = "seedream" === t.model ? "16:9, à choisir dans Seedream" : "16:9, demandé dans le prompt : vérifie l'image obtenue",''')
# the help texts name GPT and its conversation; in Seedream (people too) they name neither
rep('''" Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation du personnage.",''', '''"seedream" === sdModelNow
                                                    ? " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt."
                                                    : " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation du personnage.",''')
rep('ph: "vide = Auto : GPT choisit une race précise",', 'ph: "vide = Auto : l\'IA choisit une race précise",')
rep('hint: "Vide : GPT choisit lui-même une race ou un type précis', 'hint: "Vide : l\'IA choisit elle-même une race ou un type précis')
# P48 bust: intermediate level "Assez généreuse" (value 2.5, between Moyenne and Généreuse); slider maps positions <-> values; GPT very slim: visible ribs
rep('      [2, "Moyenne", "a medium bust, average for an adult woman"],\n', '      [2, "Moyenne", "a medium bust, average for an adult woman"],\n      [\n        2.5,\n        "Assez généreuse",\n        "a fairly full bust, a little larger than average, its base covering most of the width of the chest in the front view",\n      ],\n')
rep('  af = [\n    "≈ bonnet AA à A",\n    "≈ bonnet A à B",\n    "≈ bonnet B à C",\n    "≈ bonnet D à E",\n    "≈ bonnet F et plus",\n  ],', '  af = [\n    "≈ bonnet AA à A",\n    "≈ bonnet A à B",\n    "≈ bonnet B à C",\n    "≈ bonnet C à D",\n    "≈ bonnet D à E",\n    "≈ bonnet F et plus",\n  ],')
rep('function t0(e, t) {\n  for (var n = tZ[e], r = 0; r < n.length; r++)\n    if (String(n[r][0]) === String(t)) return n[r];\n  return n[0];\n}', 'function t0(e, t) {\n  for (var n = tZ[e], r = 0; r < n.length; r++)\n    if (String(n[r][0]) === String(t)) return n[r];\n  if ("number" == typeof t)\n    for (r = n.length - 1; r >= 0; r--)\n      if ("number" == typeof n[r][0] && n[r][0] <= t) return n[r];\n  return n[0];\n}\nfunction sdBinPos(i, v) {\n  if ("bust" === i) {\n    for (var n = tZ.bust, r = 0; r < n.length; r++) if (String(n[r][0]) === String(v)) return r;\n    return 2;\n  }\n  return "number" == typeof v ? Math.floor(v) : v;\n}')
rep('                value: t[a],\n                min: 0,\n                max: e,\n                display: String(t0(i, t[a])[1]),', '                value: sdBinPos(i, t[a]),\n                min: 0,\n                max: e,\n                display: String(t0(i, t[a])[1]),')
rep('badge: "bust" === i ? af[t[a]] : void 0,', 'badge: "bust" === i ? af[sdBinPos(i, t[a])] : void 0,')
rep('                onChange: (e) => g(a, e),\n              },\n              a + i,', '                onChange: (e) => g(a, "bust" === i ? tZ.bust[e][0] : e),\n              },\n              a + i,')
rep('    " Body composition: " +\n    n_() +\n    ". " +', '    " Body composition: " +\n    n_() +\n    (0 === e.fat && !(e.photo && e.bodyAsIs) ? sdRibs() : "") +\n    ". " +')
rep('                                      ": " +\n                                      n_() +\n                                      "; " +', '                                      ": " +\n                                      n_() +\n                                      (0 === e.fat && !(e.photo && e.bodyAsIs) ? sdRibs() : "") +\n                                      "; " +')
# P49 GPT "Très généreuse": clearly bigger than "Généreuse" (front-view and profile landmarks, out of proportion with the frame)
rep('        "a very large, full bust with a wide base extending slightly beyond the sides of the ribcage in the front view, much larger than average",', '        "a very large, heavy bust, out of proportion with her frame, much larger than average and clearly bigger than an ordinary large bust: in the front view it fills the whole width of the chest, its outer sides bulging past the ribcage against the inner arms, and in profile it projects forward from the ribcage by a little more than the length of her hand, far beyond the stomach",')
rep('      ? "a very large, full bust with a wide base extending slightly beyond the sides of the ribcage in the front view, much larger than average and fuller in its lower half"', '      ? "a very large, heavy bust, out of proportion with her frame, much larger than average and clearly bigger than an ordinary large bust: in the front view it fills the whole width of the chest, its outer sides bulging past the ribcage against the inner arms, and its heavy lower half reaches far forward and down, well beyond the line of the stomach"')
# P50 GPT lighting: muscle-sculpting key light only with real muscle (sdHardLight; Seedream keeps the v1.1.2 rule of sdBody)
rep("""                          (!o && n0()
                            ? "A studio key light from above and slightly to the side of the camera""", """                          (!o && sdHardLight()
                            ? "A studio key light from above and slightly to the side of the camera""")
# P51 outfit radio: an option flagged "warn" is drawn in red; warning under the outfit choice (fitted top at "Très généreuse")
rep("""                (n
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:border-foreground/40"),
              children: [
                (0, l.jsx)("input", {
                  type: "radio",""", """                ("warn" === t[4]
                  ? n
                    ? "bg-destructive text-destructive-foreground border-destructive"
                    : "bg-card border-destructive text-destructive"
                  : n
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:border-foreground/40"),
              children: [
                (0, l.jsx)("input", {
                  type: "radio",""")
rep("""                                                    value: sdShownCover(t),
                                                    onChange: (e) =>
                                                      g("refCover", e),
                                                  }),""", """                                                    value: sdShownCover(t),
                                                    onChange: (e) =>
                                                      g("refCover", e),
                                                    children: sdFittedWarn(t),
                                                  }),""")
# P52 (v94) GPT: lettering asked in the marks field is allowed on the person, captions still forbidden (head and body),
# also with clothing taken from the source photo, whose own logos and prints stay
rep('''      nh("topSel", "topOpts", "top").length
        ? nY
        : "No text, labels, numbers, watermarks or logos anywhere in the image, except any logo or print on the clothing taken from the photo."))''', '''      nh("topSel", "topOpts", "top").length
        ? sdNoTextGpt(nY)
        : sdNoTextGpt("No text, labels, numbers, watermarks or logos anywhere in the image, except any logo or print on the clothing taken from the photo.", 1)))''')
rep('''                      (o
                        ? nY
                        : nk()
                          ? "No text, labels, numbers, watermarks or logos anywhere in the image, except any logo or print on the clothing taken from the photo."
                          : nY))),''', '''                      (o
                        ? nY
                        : nk()
                          ? sdNoTextGpt("No text, labels, numbers, watermarks or logos anywhere in the image, except any logo or print on the clothing taken from the photo.", 1)
                          : sdNoTextGpt(nY)))),''')
# P53 (v94) engine not chosen by hand: the same rule live as at load (Seedream when it can, else GPT), so a reload never switches it
rep('''      ((0, s.useEffect)(() => {
        try {
          localStorage.setItem(au, JSON.stringify(t));
        } catch {}
      }, [t]),''', '''      ((0, s.useEffect)(() => {
        if (!t.modelPick && t.model !== (sdOk(t) ? "seedream" : "gpt")) {
          n((x) => (x.modelPick ? x : { ...x, model: sdOk(x) ? "seedream" : "gpt" }));
          return;
        }
        try {
          localStorage.setItem(au, JSON.stringify(t));
        } catch {}
      }, [t]),''')
# P39 (v96) "Forte": a fat, heavy build (was "heavy-set"), the body fat described in GPT too, slim body details swapped, slider hint
rep('''    "heavy-set, large and soft build",
    "heavy-set with some muscle tone under the softness",
    "heavy-set but strong and mobile",
    "very heavy and strong, thick muscles under a lot of body fat",
    "very large and massively powerful, like a super-heavyweight strongman",''', '''    "obese, fat and heavy, large and soft all over",
    "obese, fat and heavy, with some muscle tone under the fat",
    "obese, fat and heavy, soft on the surface, with ordinary muscle underneath",
    "obese and strong, thick muscles under a lot of body fat",
    "very large and massively powerful, like a super-heavyweight strongman",''')
rep('    !t && rR() && n.push("Skin texture: " + rR()),', '    sdForteFat(1) && n.push(sdForteFat(1)),\n    !t && rR() && n.push("Skin texture: " + rR()),')
rep('''                                    "Individual body details that make this body unique, kept identical in all four views: " +
                                      a.join(", ") +''', '''                                    "Individual body details that make this body unique, kept identical in all four views: " +
                                      (4 === e.fat ? a.map(sdForteDetail) : a).join(", ") +''')
rep('{ t: "bins", k: "fat", l: "Corpulence" },', '{ t: "bins", k: "fat", l: "Corpulence", hint: "Forte : gros ventre (si Abdominaux est sur Auto) ; laissés au milieu, Tour de taille passe à Très large, Hanches, Fessiers et Cuisses au cran au-dessus, dans le prompt seulement." },')
# P40 (v101) "Front" (forehead height) in the Visage tab: Auto (random, as before), Petit, Naturel, Grand; both engines through nn(); replaces the random forehead
rep('''    noseW: "auto",
    noseP: "auto",''', '''    noseW: "auto",
    noseP: "auto",
    forehead: "auto",''')
rep('    noseW: [', '''    forehead: [
      ["auto", "Auto", ""],
      ["low", "Petit", "a low forehead, the hairline close to the eyebrows"],
      ["medium", "Naturel", "a forehead of medium height"],
      ["high", "Grand", "a high forehead, the hairline set well above the eyebrows"],
    ],
    noseW: [''')
rep('        { t: "chips", k: "face", l: "Forme du visage" },', '        { t: "chips", k: "face", l: "Forme du visage" },\n        { t: "chips", k: "forehead", l: "Front", hint: "Hauteur du front, des sourcils à la racine des cheveux. Auto : tiré avec le visage." },')
rep('      a ? a + " nose" : "",', '      sdForehead(),\n      a ? a + " nose" : "",')
rep('          l.push(g),', '          ("auto" === (e.forehead || "auto")) && l.push(g),')
rep('''      a.push(
        r([
          "a low hairline",
          "a slight widow's peak",
          "a rounded hairline",
          "a straight hairline",
        ]),
      );''', '''      a.push(
        sdHairlineFix(r([
          "a low hairline",
          "a slight widow's peak",
          "a rounded hairline",
          "a straight hairline",
        ])),
      );''')
rep('''      ? h.push(
          u([
            "a high forehead",
            "a low hairline",
            "a slight widow's peak",
            "a rounded hairline",
          ]),
        )''', '''      ? h.push(
          sdHairlineFix(u([
            "a high forehead",
            "a low hairline",
            "a slight widow's peak",
            "a rounded hairline",
          ])),
        )''')
rep('      : h.push("a high forehead"),', '      : ("auto" === (e.forehead || "auto")) && h.push("a high forehead"),')
rep('      (n.jaw = a("jaw")),', '      (n.jaw = a("jaw")),\n      (n.forehead = "auto"),')
# P41 (v101-v102) saved sessions: an unedited older "Assembler tête et corps" text (v75-v100, v101) is rewritten to the current one (sdJoinMigrate)
rep('    for (let n in tJ) t[n] = n in e ? e[n] : tJ[n];', '    for (let n in tJ) t[n] = n in e ? e[n] : tJ[n];\n    sdJoinMigrate(t);\n    sdChild(t) && ((t.photo = !1), (t.photoOnly = !1));')
# P42 (v103) animal: its own head shape drawn from faceSeed (sdAnimalHead, GPT head prompt); "Autre tête" (same settings, another individual) shown for an animal too;
# "Animal au hasard" (species and breed kept) and "Nouvel animal" give an animal a new faceSeed as for a person; animals saved with faceSeed 0 keep their prompt
rep(r""""." +
              (nV() ? " " + nV() : "") +
              "\n"),
        t5(e.amarks) &&""", r""""." +
              (nV() ? " " + nV() : "") +
              "\n" +
              (sdAnimalHead() ? sdAnimalHead() + "\n" : "")),
        t5(e.amarks) &&""")
rep('                                    faceSeed: "person" === t.mode ? rh() : 0,', '                                    faceSeed: "object" !== t.mode ? rh() : 0,')
rep('                              faceSeed: "person" === e.mode ? rh() : 0,', '                              faceSeed: "object" !== e.mode ? rh() : 0,')
rep("""                          !y &&
                            !b &&
                            !t.photo &&
                            (0, l.jsxs)("button", {
                              type: "button",
                              title:
                                "Mêmes réglages : une autre personne à chaque clic. Tous les traits laissés sur Auto sont retirés (forme du visage, yeux, nez, bouche, mâchoire) ainsi que les détails du corps.",""", """                          !y &&
                            !t.photo &&
                            (0, l.jsxs)("button", {
                              type: "button",
                              title: b
                                ? "Mêmes réglages : un autre individu de la même espèce et de la même race à chaque clic. Seule la forme de la tête change (crâne, museau ou bec, yeux)."
                                : "Mêmes réglages : une autre personne à chaque clic. Tous les traits laissés sur Auto sont retirés (forme du visage, yeux, nez, bouche, mâchoire) ainsi que les détails du corps.",""")
rep("""                                  h(
                                    "Autre visage : une nouvelle personne, mêmes réglages.",
                                  ));""", """                                  h(
                                    b
                                      ? "Autre tête : un autre individu, mêmes réglages."
                                      : "Autre visage : une nouvelle personne, mêmes réglages.",
                                  ));""")
rep("""                                (0, l.jsx)(tK, { size: 16 }),
                                "Autre visage",""", """                                (0, l.jsx)(tK, { size: 16 }),
                                b ? "Autre tête" : "Autre visage",""")
rep('? "Pour un autre animal : « Nouvel animal », en bas."', '? "Pour un autre animal : « Autre tête » (mêmes réglages) ou « Nouvel animal », en bas (tout remettre à zéro)."')
# P43 (v104) "Habiller avec ma tenue" (Seedream): the Tenue tab stays usable while the body sheet keeps the reference outfit; a note says what the outfit is used for
rep("""                                                    children: sdFittedWarn(t),
                                                  }),
                                                }),
                                            ],""", """                                                    children: sdFittedWarn(t),
                                                  }),
                                                }),
                                              t.bodyRef &&
                                                sdMineTenue(t) &&
                                                (0, l.jsx)("p", {
                                                  className:
                                                    "mt-3 text-sm text-muted-foreground",
                                                  children:
                                                    "Ta tenue, ci-dessous : la planche corps garde la tenue de référence ; ta tenue sert à la retouche « Habiller avec ma tenue » (carte 3, Autres retouches).",
                                                }),
                                            ],""")
rep("""                                              !(t.bodyRef && "tenue" === w.id),""", """                                              !(t.bodyRef && "tenue" === w.id && !sdMineTenue(t)),""")
# P44 (v104) "Fantastique" (GPT animal, house, interior): stated as the defining feature, physically present, impossible to miss; no "believable" house or room with it; checked in the generation limit
rep(r"""function nV() {
  return t5(e.afantasy)
    ? "Fantastic features, intentional and rendered as if real, identical in every panel where they show: " +
        t5(e.afantasy) +
        "."
    : "";
}""", r"""function nV() {
  return t5(e.afantasy) ? sdFantasyText(t5(e.afantasy), 0) : "";
}""")
rep(r"""              (nV()
                ? " Add only these fantastic features to it, without changing anything else: " +
                  t5(e.afantasy) +
                  "."
                : "") +""", r"""              (nV()
                ? " Add the fantastic elements below to it, without changing anything else. " +
                  nV()
                : "") +""")
rep(r"""                              (nV()
                                ? ", except these fantastic features, intentional and identical in every view where they show: " +
                                  t5(e.afantasy)
                                : "") +
                              ".\n")""", r"""                              (nV() ? ", except the fantastic elements below" : "") +
                              ".\n" +
                              (nV() ? nV() + "\n" : ""))""")
rep(r"""                          t5(e.objFantasy) &&
                            (a +=
                              "Fantastic elements, intentional and rendered as if real, identical in every view where they show: " +
                              t5(e.objFantasy) +
                              ".\n"),""", r"""                          t5(e.objFantasy) &&
                            (a += sdFantasyText(t5(e.objFantasy), 1) + "\n"),""")
rep(r"""                                  : n
                                    ? ": a believable, lived-in house"
                                    : ": a believable, lived-in room") +""", r"""                                  : n
                                    ? t5(e.objFantasy)
                                      ? ": a lived-in house"
                                      : ": a believable, lived-in house"
                                    : t5(e.objFantasy)
                                      ? ": a lived-in room"
                                      : ": a believable, lived-in room") +""")
rep(r"""            an()
          )
            return "";
          var n = at[e.legs] || 47;""", r"""            an()
          )
            return sdFantasyMiss();
          var n = at[e.legs] || 47;""")
# P45 (v104) house: "Décor" chips, "Décor entier" (as before) or "Sol et fond gris neutre" (house alone on a grey floor and backdrop); weather hidden in the grey case
rep(r"""    objFantasy: "",""", r"""    objFantasy: "",
    objBg: "scene",""")
rep(r"""    objCat: [""", r"""    objBg: [
      ["scene", "Décor entier", ""],
      ["grey", "Sol et fond gris neutre", ""],
    ],
    objCat: [""")
rep(r"""          hint: "Règle la présentation : véhicule posé sur ses roues, vêtement sur mannequin invisible, objet seul comme en photo produit. Maison et Intérieur donnent des vues de repérage de lieu, avec jour et nuit dans l'onglet Lumière et ambiance.",
        },""", r"""          hint: "Règle la présentation : véhicule posé sur ses roues, vêtement sur mannequin invisible, objet seul comme en photo produit. Maison et Intérieur donnent des vues de repérage de lieu, avec jour et nuit dans l'onglet Lumière et ambiance.",
        },
        {
          t: "chips",
          k: "objBg",
          l: "Décor",
          show: function () {
            return "house" === e.objCat;
          },
          hint: "« Sol et fond gris neutre » : la maison seule, posée sur un sol gris devant un fond gris, avec ses ombres au sol, sans jardin, rue ni ciel, pour l'intégrer plus facilement.",
        },""")
rep(r"""          k: "objWeather",
          l: "Météo",
          show: function () {
            return "house" === e.objCat;
          },""", r"""          k: "objWeather",
          l: "Météo",
          show: function () {
            return "house" === e.objCat && "grey" !== e.objBg;
          },""")
rep(r"""                        (t5(e.objSize) &&
                          (a += "Approximate size: " + t5(e.objSize) + ".\n"),""", r"""                        ((a += sdHouseBg()),
                        t5(e.objSize) &&
                          (a += "Approximate size: " + t5(e.objSize) + ".\n"),""")
rep(r"""                            (n
                              ? "architecture, surroundings"
                              : "architecture, layout, furniture") +""", r"""                            (n
                              ? sdHouseGrey()
                                ? "architecture"
                                : "architecture, surroundings"
                              : "architecture, layout, furniture") +""")
rep(r"""              "high aerial three-quarter view showing the roof and the plot",""", r"""              sdHouseGrey()
                ? "high aerial three-quarter view showing the roof"
                : "high aerial three-quarter view showing the roof and the plot",""")
rep(r"""function rr() {
  var t = "house" === e.objCat,""", r"""function rr() {
  if (sdHouseGrey()) return sdHouseGreyLight();
  var t = "house" === e.objCat,""")
rep(r"""                              ? "Eye-level views from about 1.6 m high with a 35mm lens, from far enough to show the whole house and its immediate surroundings, kept simple and identical in every view" +""", r"""                              ? (sdHouseGrey()
                                  ? "Eye-level views from about 1.6 m high with a 35mm lens, from far enough to show the whole house with some grey floor around it, identical in every view"
                                  : "Eye-level views from about 1.6 m high with a 35mm lens, from far enough to show the whole house and its immediate surroundings, kept simple and identical in every view") +""")
rep(r"""              return [
                e.objTime,
                e.objWeather,""", r"""              return [
                e.objBg,
                e.objTime,
                e.objWeather,""")
rep(r"""              return (
                "Light and atmosphere: «" +
                rr() +""", r"""              return (
                (sdHouseGrey() ? sdHouseBg().replace(/\n$/, " ") : "") +
                "Light and atmosphere: «" +
                rr() +""")
# P46 (v104) hair: "Épaisseur" (fine, thick), "Aspect" (neat, tousled, messy, greasy) and the "Frisottés" texture, in both engines through ne(); hidden for a bald or shaved head; Auto keeps the old text
rep(r"""    hairLen: "shoulder",
    hairTex: "straight",
    hairColor: "darkbrown",""", r"""    hairLen: "shoulder",
    hairTex: "straight",
    hairThick: "auto",
    hairCare: "auto",
    hairColor: "darkbrown",""")
rep(r"""      ["coily", "Crépus", "coily"],
    ],""", r"""      ["coily", "Crépus", "coily"],
      ["frizzy", "Frisottés", "frizzy"],
    ],
    hairThick: [
      ["auto", "Auto", ""],
      ["fine", "Fins", "fine"],
      ["thick", "Épais", "thick"],
    ],
    hairCare: [
      ["auto", "Auto", ""],
      ["neat", "Soigné", "neatly combed and styled"],
      ["tousled", "Décoiffé", "tousled, as if wind-blown or slept on, with loose strands"],
      ["messy", "Négligé", "unkempt and uncombed, tangled in places, with frizz and stray strands"],
      ["greasy", "Gras", "unwashed, with greasy, flat roots and clumped strands"],
    ],""")
rep(r"""        { t: "chips", k: "hairTex", l: "Texture" },""", r"""        { t: "chips", k: "hairTex", l: "Texture" },
        {
          t: "chips",
          k: "hairThick",
          l: "Épaisseur",
          show: function () {
            return "shaved" !== e.hairLen && "bald" !== e.hairStyleSel;
          },
        },""")
rep(r"""        { t: "chips", k: "hairStyleSel", l: "Coiffure" },""", r"""        { t: "chips", k: "hairStyleSel", l: "Coiffure" },
        {
          t: "chips",
          k: "hairCare",
          l: "Aspect",
          show: function () {
            return "shaved" !== e.hairLen && "bald" !== e.hairStyleSel;
          },
          hint: "Négligé : non coiffés, emmêlés, frisottis et mèches folles. Gras : racines grasses, mèches collées. Auto : rien n'est précisé.",
        },""")
rep(r"""            t1("hairLen", e.hairLen) +
            " " +
            t1("hairTex", e.hairTex) +""", r"""            t1("hairLen", e.hairLen) +
            " " +
            (t1("hairThick", e.hairThick) ? t1("hairThick", e.hairThick) + " " : "") +
            t1("hairTex", e.hairTex) +""")
rep(r"""          "loose" !== n && (t += " " + t1("hairStyleSel", n))),""", r"""          "loose" !== n && (t += " " + t1("hairStyleSel", n)),
          t1("hairCare", e.hairCare) && (t += ", " + t1("hairCare", e.hairCare))),""")
rep(r"""    ((n.hairStyleSel = l), (n.hairStyle = ""), (n.hairColorCustom = ""));""", r"""    ((n.hairStyleSel = l), (n.hairStyle = ""), (n.hairColorCustom = ""), (n.hairThick = "auto"), (n.hairCare = "auto"));""")
# P47 (v106) child mode "Enfant": a 4th type button (person with child: true); child settings in Corps; adult controls hidden; no photo, reference outfit,
# headless body, retouch or variant; "Enfant au hasard"; "Nouveau personnage" keeps the child; prompts from sdChildPrompts in both engines
rep(r"""    objFantasy: "",
    objBg: "scene",""", r"""    objFantasy: "",
    objBg: "scene",
    child: !1,
    childPhotoBak: 0,
    childSex: "f",
    childAge: 7,
    childHeight: "avg",
    childBuild: "avg",
    childHeadless: !1,
    placeViews: [],
    view: "sheets",
    integAsset: "",
    integPlace: "",
    integOrient: "",
    integScale: "",
    integLit: !1,
    integLight: "",""")
rep(r"""    objBg: [
      ["scene", "Décor entier", ""],""", r"""    childSex: [
      ["f", "Fille", "girl"],
      ["m", "Garçon", "boy"],
    ],
    childHeight: [
      ["small", "Petit pour son âge", "small"],
      ["avg", "Taille moyenne", "average"],
      ["tall", "Grand pour son âge", "tall"],
    ],
    childBuild: [
      ["slim", "Mince", "slim"],
      ["avg", "Moyenne", "average"],
      ["sturdy", "Costaud", "sturdy"],
    ],
    objBg: [
      ["scene", "Décor entier", ""],""")
rep(r"""        { t: "chips", k: "pres", l: "Présentation" },""", r"""        { t: "chips", k: "pres", l: "Présentation" },
        {
          t: "chips",
          k: "childSex",
          l: "Fille ou garçon",
          show: function () {
            return !!e.child;
          },
        },
        {
          t: "num",
          k: "childAge",
          l: "Âge",
          show: function () {
            return !!e.child;
          },
          min: 3,
          max: 12,
          unit: " ans",
          hint: "Enfants de 3 à 12 ans. Planches toujours habillées, sans réglage du corps : seulement la taille pour l'âge et la silhouette.",
        },
        {
          t: "chips",
          k: "childHeight",
          l: "Taille pour son âge",
          show: function () {
            return !!e.child;
          },
        },
        {
          t: "chips",
          k: "childBuild",
          l: "Silhouette",
          show: function () {
            return !!e.child;
          },
        },
        {
          t: "toggle",
          k: "childHeadless",
          l: "Planche corps sans tête",
          show: function () {
            return !!e.child;
          },
          hint: "Corps habillé, cadré du cou aux pieds, fait sans image. Dans Seedance, joins la planche tête et cette planche : le visage ne vient que de la planche tête.",
        },""")
rep(r"""function nv() {
  return "animal" !== e.mode && !!e.bodyRef;
}
function nw() {
  return (
    "person" === e.mode &&
    !!e.headless &&""", r"""function nv() {
  return "animal" !== e.mode && !e.child && !!e.bodyRef;
}
function nw() {
  return (
    "person" === e.mode &&
    !e.child &&
    !!e.headless &&""")
rep(r"""function n2() {
  return "seedream" === e.model || e.photo || !e.headSig""", r"""function n2() {
  return sdChild(e) || "seedream" === e.model || e.photo || !e.headSig""")
rep(r"""function as() {
  var t;
  if ("object" === e.mode) return "";""", r"""function as() {
  var t;
  if ("object" === e.mode) return "";
  if (sdChild(e)) return sdChildSig();""")
rep(r"""                          (0, l.jsx)(ab, {
                            label: "Type",
                            value: t.mode,
                            onChange: (e) =>
                              n((t) =>
                                (function (e, t) {""", r"""                          (0, l.jsx)(ab, {
                            label: "Type",
                            value: sdChild(t) ? "child" : t.mode,
                            onChange: (e) =>
                              n((t) =>
                                sdChildMode(e, t, function (e, t) {""")
rep(r"""                                })(t, e),
                              ),
                            options: [
                              ["person", "Personne"],
                              ["animal", "Animal"],""", r"""                                }),
                              ),
                            options: [
                              ["person", "Personne"],
                              ["child", "Enfant"],
                              ["animal", "Animal"],""")
rep(r"""                          sdTip(
                            (0, l.jsx)(ax, {
                              checked: t.photo,""", r"""                          !sdChild(t) &&
                          sdTip(
                            (0, l.jsx)(ax, {
                              checked: t.photo,""")
rep(r"""                              onClick: () => {
                                (n((t) => {
                                  let n = {
                                    ...t,
                                    headSig: "",""", r"""                              onClick: () => {
                                if (sdChild(t))
                                  return (n((s) => sdChildRandom(s)), h("Enfant tiré au hasard."));
                                (n((t) => {
                                  let n = {
                                    ...t,
                                    headSig: "",""")
rep(r"""                                b ? "Animal au hasard" : "Personnage au hasard",""", r"""                                b ? "Animal au hasard" : sdChild(t) ? "Enfant au hasard" : "Personnage au hasard",""")
rep(r"""        z = (e, t) => {
          let n = "animal" === e.mode;
          return (
            !!(ae[e.mode] || []).includes(t) &&""", r"""        z = (e, t) => {
          let n = "animal" === e.mode;
          return (
            !(sdChild(e) && ("corps" === t || "tenue" === t)) &&
            !!(ae[e.mode] || []).includes(t) &&""")
rep(r"""                                        "tenue" === w.id &&
                                          (0, l.jsxs)("div", {
                                            className:
                                              "my-4 rounded-2xl border p-4 " +""", r"""                                        sdChild(t) &&
                                          sdChildNote(t, w.id),
                                        "tenue" === w.id &&
                                          !sdChild(t) &&
                                          (0, l.jsxs)("div", {
                                            className:
                                              "my-4 rounded-2xl border p-4 " +""")
rep(r"""                                            (e) =>
                                              (!e.show || e.show()) &&
                                              !(
                                                b &&""", r"""                                            (e) =>
                                              (!e.show || e.show()) &&
                                              !sdChildHide(t, w.id, e.k) &&
                                              !(
                                                b &&""")
rep(r"""                                              !(t.bodyRef && "tenue" === w.id && !sdMineTenue(t)),""", r"""                                              !(t.bodyRef && "tenue" === w.id && !sdMineTenue(t) && !sdChild(t)),""")
rep(r"""                                  "modelPick" !== r &&
                                  "uiLang" !== r &&""", r"""                                  "modelPick" !== r &&
                                  "uiLang" !== r &&
                                  "child" !== r &&
                                  "view" !== r &&
                                  "placeViews" !== r &&
                                  0 !== r.indexOf("integ") &&""")
rep(r"""                                    "seedream" === t.model && !sdX && "person" === t.mode && sdIterBlock(t, g, B, L),""", r"""                                    "seedream" === t.model && !sdX && "person" === t.mode && (sdChild(t) ? ((sdCur = { t: t, g: g, L: L }), null) : sdIterBlock(t, g, B, L)),""")
# P48 (v106) "Intégration d'image": a 3rd switch in the header (Planches / Intégration d'image); the tool replaces the sheets view and its mobile bar
rep(r"""                    label: "Langue de l'interface",
                    value: "en" === t.uiLang ? "en" : "fr",
                    onChange: (e) => n((t) => ({ ...t, uiLang: e })),
                    options: [
                      ["fr", "Français"],
                      ["en", "English"],
                    ],
                  }),""", r"""                    label: "Langue de l'interface",
                    value: "en" === t.uiLang ? "en" : "fr",
                    onChange: (e) => n((t) => ({ ...t, uiLang: e })),
                    options: [
                      ["fr", "Français"],
                      ["en", "English"],
                    ],
                  }),
                  (0, l.jsx)(ab, {
                    label: "Outil",
                    value: "integ" === t.view ? "integ" : "sheets",
                    onChange: (e) => n((t) => ({ ...t, view: e })),
                    options: [
                      ["sheets", "Planches"],
                      ["integ", "Intégration d'image"],
                    ],
                  }),""")
rep(r"""          (0, l.jsxs)("div", {
            className:
              "grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start",""", r"""          "integ" === t.view && sdIntegTool(t, n, h),
          (0, l.jsxs)("div", {
            className:
              ("integ" === t.view ? "hidden " : "") +
              "grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start",""")
rep(r"""            className:
              "fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 px-4 pt-3 backdrop-blur lg:hidden",""", r"""            className:
              ("integ" === t.view ? "hidden " : "") +
              "fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 px-4 pt-3 backdrop-blur lg:hidden",""")
# P49 v107 child: "Cheveux au hasard" draws as for a young person (no grey, bald, receding, mohawk, undercut or shaved head)
rep('''  if ("cheveux" === t) {
    var i = e.origin,''', '''  if ("cheveux" === t) {
    if (sdChild(e) && !e.sdKid) return sdChildHair();
    var i = e.origin,''')
# P51 (v108) child body without the head: no hat, cap or glasses in its outfit (same filter as the adult headless body); "Moment" hint follows the chosen views
rep(r"""  (nw() &&
    (u = u.filter(function (e) {""", r"""  ((nw() || sdChildHl(e)) &&
    (u = u.filter(function (e) {""")
# P52 (v109) "Bébé": a 5th type button (person with child and baby); only "Fille ou garçon" in Corps; one card "Planche bébé"; "Bébé au hasard";
# animals in Seedream: no retouch card for an animal, the "three steps" heading and bar only for a person
rep(r"""    child: !1,
    childPhotoBak: 0,""", r"""    child: !1,
    baby: !1,
    childPhotoBak: 0,""")
rep(r"""                            value: sdChild(t) ? "child" : t.mode,""", r"""                            value: sdChild(t) ? (t.baby ? "baby" : "child") : t.mode,""")
rep(r"""                              ["child", "Enfant"],""", r"""                              ["child", "Enfant"],
                              ["baby", "Bébé"],""")
rep(r"""                                  return (n((s) => sdChildRandom(s)), h("Enfant tiré au hasard."));""", r"""                                  return (n((s) => (sdBaby(s) ? sdBabyRandom(s) : sdChildRandom(s))), h(sdBaby(t) ? "Bébé tiré au hasard." : "Enfant tiré au hasard."));""")
rep(r"""                                b ? "Animal au hasard" : sdChild(t) ? "Enfant au hasard" : "Personnage au hasard",""", r"""                                b ? "Animal au hasard" : sdBaby(t) ? "Bébé au hasard" : sdChild(t) ? "Enfant au hasard" : "Personnage au hasard",""")
rep(r"""                                  "child" !== r &&""", r"""                                  "child" !== r &&
                                  "baby" !== r &&""")
rep(r"""          ...(y ? t3 : b ? t4 : t2).filter((e) => !e.show || e.show()),""", r"""          ...(y ? t3 : b ? t4 : t2).filter((e) => (!e.show || e.show()) && (!sdBaby(t) || "corps" === e.id)),""")
rep('B("head", "1", "Planche tête")', 'B("head", "1", sdBaby(t) ? "Planche bébé" : "Planche tête")')
rep(': B("body", "2", "Planche corps")', ': !sdBaby(t) && B("body", "2", "Planche corps")')
rep(r'''              : "seedream" === t.model && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)
                ? "Tes trois étapes, dans l'ordre"
                : "Tes images"''', r'''              : sdBaby(t)
                ? "Ta planche"
                : "seedream" === t.model && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)
                ? "Tes trois étapes, dans l'ordre"
                : "Tes images"''')
rep(r"""              : "seedream" === t.model && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)
                ? sdBarItems(t)""", r"""              : sdBaby(t)
                ? [["head", "Copier la planche", !1]]
                : "seedream" === t.model && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)
                ? sdBarItems(t)""")
rep('        $ = "seedream" !== t.model && !y && "animal" !== t.mode && !!t.headSig && "changed" === sdSigState(t.headSig),', '        $ = "seedream" !== t.model && !y && "animal" !== t.mode && !sdBaby(t) && !!t.headSig && "changed" === sdSigState(t.headSig),')
rep(r"""                      !y &&
                        "seedream" !== t.model &&
                        (0, l.jsxs)("div", {
                          className: "mt-4",""", r"""                      !y &&
                        "seedream" !== t.model &&
                        !sdBaby(t) &&
                        (0, l.jsxs)("div", {
                          className: "mt-4",""")
rep(r"""            ["Nomme-la", R(rU("tete"))],""", r"""            ["Nomme-la", R(rU(sdBaby(t) ? "bebe" : "tete"))],""")
# P53 (v109) the Type selector has 5 buttons: it may wrap on a narrow screen (optional "wrap" on the segmented control, used only there)
rep(r"""  big: a,
  disabled: o,
}) {
  return (0, l.jsx)("div", {
    role: "radiogroup",
    "aria-label": r,
    "aria-disabled": o || void 0,
    className:
      "rounded-full border bg-card p-1 " +
      (a ? "flex w-full sm:inline-flex sm:w-auto shadow-sm" : "inline-flex") +""", r"""  big: a,
  disabled: o,
  wrap: sdW,
}) {
  return (0, l.jsx)("div", {
    role: "radiogroup",
    "aria-label": r,
    "aria-disabled": o || void 0,
    className:
      (sdW ? "rounded-2xl" : "rounded-full") +
      " border bg-card p-1 " +
      (a ? "flex w-full sm:inline-flex sm:w-auto shadow-sm" : sdW ? "flex flex-wrap" : "inline-flex") +""")
rep(r"""                            label: "Type",
                            value: sdChild(t) ? (t.baby ? "baby" : "child") : t.mode,""", r"""                            label: "Type",
                            wrap: !0,
                            value: sdChild(t) ? (t.baby ? "baby" : "child") : t.mode,""")
# P54 (v109) review: the Seedream head record is kept per type (person, animal), like the GPT one; the baby UI never points to the hidden
# "Plusieurs personnages" box
rep(r"""    "headRemovals",
    "headLooks",
    "headFat",
    "faceSeed",
    "faceGen",
  ],
  r5 = [""", r"""    "headRemovals",
    "headLooks",
    "headFat",
    "sdHeadSig",
    "faceSeed",
    "faceGen",
  ],
  r5 = [""")
rep(r"""    headRemovals: "",
    headLooks: "",
    headFat: "",
    eState: "",""", r"""    headRemovals: "",
    headLooks: "",
    headFat: "",
    sdHeadSig: "",
    eState: "",""")
rep(r"""                        !y &&
                          (0, l.jsxs)(l.Fragment, {
                            children: [
                              " Pour enchaîner des ",""", r"""                        !y &&
                          !sdBaby(t) &&
                          (0, l.jsxs)(l.Fragment, {
                            children: [
                              " Pour enchaîner des ",""")
rep(r"""                  (0, l.jsx)(aN, { obj: y, sd: "seedream" === t.model }),""", r"""                  (0, l.jsx)(aN, { obj: y, sd: "seedream" === t.model, baby: sdBaby(t) }),""")
# v110 selections drive the separate-view cards; the triptych keeps its three established views.
rep('    placeViews: [],', '    placeViews: [],\n    objViews: [],')
rep('                                  "placeViews" !== r &&', '                                  "placeViews" !== r &&\n                                  "objViews" !== r &&')
# P58 (v110, GPT Pro audit) GPT card of a child body without the head: no image is required
rep(r"""                  children: [
                        t.photo ? "Ta photo. " : "",
                        "La planche tête : rien si elle est juste au-dessus dans la conversation, sinon ",
                        R(rU("tete")),
                      ],""", r"""                  children: sdChildHl(t)
                        ? ["Rien d'obligatoire. Tu peux joindre la planche tête (", R(rU("tete")), ") pour reprendre le teint et les cheveux sous le cou."]
                        : [
                            t.photo ? "Ta photo. " : "",
                            "La planche tête : rien si elle est juste au-dessus dans la conversation, sinon ",
                            R(rU("tete")),
                          ],""")
# P59 (v110, review) Forte with slim arms and receding hairlines
rep(r"""function n_() {
  return nP[e.fat][e.muscle];
}""", r"""function n_() {
  return sdForteBuild(nP[e.fat][e.muscle]);
}""")
rep(r"""    "bald" !== e.hairStyleSel &&
      "shaved" !== e.hairLen &&
      a.push(
        sdHairlineFix(r([""", r"""    "bald" !== e.hairStyleSel &&
      "shaved" !== e.hairLen &&
      sdPushHairline(
        a,
        sdHairlineFix(r([""")
rep(r"""    "bald" !== e.hairStyleSel && "shaved" !== e.hairLen
      ? h.push(
          sdHairlineFix(u([""", r"""    "bald" !== e.hairStyleSel && "shaved" !== e.hairLen
      ? sdPushHairline(
          h,
          sdHairlineFix(u([""")
# P55 (v109) rules panel: no "Plusieurs personnages" sentence for a baby (after P27, which rewrites the panel's first lines)
rep(r"""function aN({ obj: e, sd: sdM }) {""", r"""function aN({ obj: e, sd: sdM, baby: sdBb }) {""")
rep(r"""            : "Une conversation GPT par personnage permet de regrouper ses références. Pour chaque retouche, joins la planche à utiliser. Pour des personnages secondaires dans une même conversation, coche « Plusieurs personnages dans la même conversation GPT ».",""", r"""            : sdBb
              ? "Une conversation GPT par personnage permet de regrouper ses références. Pour chaque retouche, joins la planche à utiliser."
              : "Une conversation GPT par personnage permet de regrouper ses références. Pour chaque retouche, joins la planche à utiliser. Pour des personnages secondaires dans une même conversation, coche « Plusieurs personnages dans la même conversation GPT ».",""")
# P60 (v111) person from a photo: "Utiliser les habits de la photo" (on by default) for the head and the body; off, the Tenue tab comes back and
# is used for both, unset parts plain (never from the photo); a session saved with a photo and a chosen outfit keeps that outfit (box off)
rep(r"""function nj() {
  return (""", r"""function nj() {
  if (sdPhotoClothes()) return !1;
  return (""")
rep(r"""  var n = nd("colorSel", "colorOpts").length ? "" : " in a solid neutral color";
  return e.photo
    ? "top" === t""", r"""  var n = nd("colorSel", "colorOpts").length ? "" : " in a solid neutral color";
  return sdPhotoClothes()
    ? "top" === t""")
rep(r"""  if (!nj())
    return e.photo
      ? "exactly as in the attached photo;""", r"""  if (!nj())
    return sdPhotoClothes()
      ? "exactly as in the attached photo;""")
rep(r"""  if ("person" !== e.mode || !e.photo || nv()) return "";
  if (!nj()) return "all";""", r"""  if ("person" !== e.mode || !sdPhotoClothes() || nv()) return "";
  if (!nj()) return "all";""")
rep(r"""  return "person" === e.mode && e.photo && !nv() && !nj();""", r"""  return "person" === e.mode && sdPhotoClothes() && !nv();""")
rep(r"""  var t = nh("topSel", "topOpts", "top");
  return t.length ? t.join(", ") : nN("top");""", r"""  var t = sdPhotoClothes() ? [] : nh("topSel", "topOpts", "top");
  return t.length ? t.join(", ") : nN("top");""")
rep(r"""              (!e.photo || nh("topSel", "topOpts", "top").length || nv()""", r"""              (!sdPhotoClothes() || nv()""")
rep(r"""      !e.photo ||
      nv() ||
      nh("topSel", "topOpts", "top").length
        ? sdNoTextGpt(nY)""", r"""      !sdPhotoClothes() ||
      nv()
        ? sdNoTextGpt(nY)""")
rep(r"""            (!!n || "tenue" !== t || !e.bodyRef) &&""", r"""            (!!n || "tenue" !== t || !e.bodyRef) &&
            !("tenue" === t && sdPhotoClothes(e)) &&""")
rep(r"""                              children: y ? sdOnlyLabel(t) : "Mise en planche seulement",
                            }),""", r"""                              children: y ? sdOnlyLabel(t) : "Mise en planche seulement",
                            }),
                          t.photo &&
                            !t.photoOnly &&
                            "person" === t.mode &&
                            (0, l.jsx)(ax, {
                              checked: !1 !== t.photoClothes,
                              onChange: (e) => g("photoClothes", e),
                              disabled: k,
                              children: "Utiliser les habits de la photo",
                            }),""")
rep(r"""    placeViews: [],
    objViews: [],""", r"""    placeViews: [],
    objViews: [],
    photoClothes: !0,""")
rep(r"""                              : "Joins ta photo aux deux planches : visage et cheveux viendront d'elle. Pour garder aussi son corps, active « Garder le corps tel quel » dans Corps.",""", r"""                              : !sdBodyPhoto(t)
                                ? "Joins ta photo à la planche tête : visage et cheveux viendront d'elle. Pour garder aussi son corps, active « Garder le corps tel quel » dans Corps."
                                : sdPhotoClothes(t) && !t.bodyRef
                                  ? "Joins ta photo aux deux planches : visage, cheveux et habits viendront d'elle. Pour garder aussi son corps, active « Garder le corps tel quel » dans Corps."
                                  : "Joins ta photo aux deux planches : visage et cheveux viendront d'elle. Pour garder aussi son corps, active « Garder le corps tel quel » dans Corps.",""")
rep(r"""    sdChild(t) && ((t.photo = !1), (t.photoOnly = !1));""", r"""    sdChild(t) && ((t.photo = !1), (t.photoOnly = !1));
    if (!("photoClothes" in e)) {
      var personPhoto = "person" === t.mode
        ? t.photo || (sdChild(t) && t.childPhotoBak > 0)
        : t.modeCfg && t.modeCfg.person && t.modeCfg.person.photo;
      t.photoClothes = !(personPhoto && sdGarmentSet(t));
    }""")
rep(r"""                                              "Rien de coché : la tenue de ta photo est gardée telle quelle. Pour régler son usure, choisis une tenue ici, ou décris-la dans Signes, état du moment.",""", r"""                                              "Les habits de ta photo sont gardés, pour la tête et le corps. Pour choisir une tenue ici, décoche « Utiliser les habits de la photo » en haut ; pour régler leur usure, décris-la dans Signes, état du moment.",""")
rep(r"""                                              !(t.bodyRef && "tenue" === w.id && !sdMineTenue(t) && !sdChild(t)),""", r"""                                              !(t.bodyRef && "tenue" === w.id && !sdMineTenue(t) && !sdChild(t)) &&
                                              !("tenue" === w.id && sdPhotoClothes(t)),""")
# P61 (v111, review) photo clothes: no hidden Tenue accessories on the head; the photo's clothing said to be ignored when it is not used;
# the body card asks for the photo only when the body sheet uses it
rep(r"""function nz() {
  if (nv()) return "";""", r"""function nz() {
  if (nv() || sdPhotoClothes()) return "";""")
rep(r"""              "The attached photo is the only source for the face and hair: reproduce exactly the face, bone structure, eyes, eyebrows, nose, lips, jawline, skin tone and texture, hairline, hairstyle and hair color, with natural asymmetry. Do not beautify, age, de-age or restyle them.\n" +""", r"""              "The attached photo is the only source for the face and hair: reproduce exactly the face, bone structure, eyes, eyebrows, nose, lips, jawline, skin tone and texture, hairline, hairstyle and hair color, with natural asymmetry. Do not beautify, age, de-age or restyle them.\n" +
              (nC() ? "" : "Its clothing is not used: the person wears only the clothing described below.\n") +""")
rep(r"""                              "BODY:\nBody build, height and proportions exactly as in the attached photo, without any change.\n\n")""", r"""                              "BODY:\nBody build, height and proportions exactly as in the attached photo, without any change." +
                              (nC() ? "" : " Only the body comes from the photo, not its clothing.") +
                              "\n\n")""")
rep(r"""                            t.photo ? "Ta photo. " : "",
                            "La planche tête : rien si elle est juste au-dessus dans la conversation, sinon ",""", r"""                            sdBodyPhoto(t) ? "Ta photo. " : "",
                            "La planche tête : rien si elle est juste au-dessus dans la conversation, sinon ",""")
# P62 (v112) Seedream open for every case (sdOk): the cases without a dedicated Seedream builder (sdNative) take their GPT prompt rewritten for
# Seedream (sdGptSd); the Seedream-only parts (card 3 and its retouches, reference outfits with a cup size, headless hint, "Habiller avec ma tenue")
# stay with the dedicated builder (sdNat); the engine of a session that never picked one is unchanged (sdAuto); copy messages name the photo;
# GPT body: the photo is asked and named only when the body uses it (v111 regression for an animal from a photo)
rep(r"""    t.modelPick || ("gpt" === e.model && (sdOk(t) || !("modelPick" in e)) ? (t.modelPick = 1) : (t.model = sdOk(t) ? "seedream" : "gpt"));""", r"""    t.modelPick || ("gpt" === e.model && (sdAuto(t) || !("modelPick" in e)) ? (t.modelPick = 1) : (t.model = sdAuto(t) ? "seedream" : "gpt"));""")
rep(r"""        if (!t.modelPick && t.model !== (sdOk(t) ? "seedream" : "gpt")) {
          n((x) => (x.modelPick ? x : { ...x, model: sdOk(x) ? "seedream" : "gpt" }));""", r"""        if (!t.modelPick && t.model !== (sdAuto(t) ? "seedream" : "gpt")) {
          n((x) => (x.modelPick ? x : { ...x, model: sdAuto(x) ? "seedream" : "gpt" }));""")
rep(r"""(sdChild(t) ? ((sdCur = { t: t, g: g, L: L }), null) : sdIterBlock(t, g, B, L)),""", r"""(sdChild(t) ? ((sdCur = { t: t, g: g, L: L }), null) : !sdNative(t) ? ((sdCur = null), null) : sdIterBlock(t, g, B, L)),""")
rep(r"""                : "seedream" === t.model && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)
                ? sdBarItems(t)""", r"""                : sdNat(t) && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)
                ? sdBarItems(t)""")
rep(r'''                : "seedream" === t.model && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)
                ? "Tes trois étapes, dans l'ordre"
                : "Tes images"''', r'''                : sdNat(t) && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)
                ? "Tes trois étapes, dans l'ordre"
                : "Tes images"''')
rep(r"""                                                        ? "seedream" === t.model && sdRevealOk(t)""", r"""                                                        ? sdNat(t) && sdRevealOk(t)""")
rep(r"""                                                        : "seedream" === t.model
                                                          ? (t.chest >= 4 ? [["sport",""", r"""                                                        : sdNat(t)
                                                          ? (t.chest >= 4 ? [["sport",""")
rep(r"""                    ? ("seedream" === t.model
                        ? "Repère pour toi. En Seedream 5.0,""", r"""                    ? (sdNat(t)
                        ? "Repère pour toi. En Seedream 5.0,""")
rep(r"""                  "headless" === a &&
                    "seedream" === t.model &&""", r"""                  "headless" === a &&
                    sdNat(t) &&""")
rep(r"""            sdMsg = "seedream" !== sdModel || "person" !== e.mode ? "" : "body" === t ? sdBodyCopyMsg(e) : "iter" === t ? sdIterCopyMsg(e) : "";""", r"""            sdMsg = "seedream" !== sdModel || "person" !== e.mode ? "" : "body" === t ? sdBodyCopyMsg(e) : "iter" === t ? sdIterCopyMsg(e) : sdSrcCopyMsg(e);""")
rep(r"""                            sdBodyPhoto(t) ? "Ta photo. " : "",""", r"""                            sdBodyPhotoAny(t) ? "Ta photo. " : "",""")
rep(r"""                          (e.photo
                            ? " The attached photo shows the same " +""", r"""                          (sdBodyPhotoAny(e)
                            ? " The attached photo shows the same " +""")
# P63 (v112, user) no "Pas encore possible avec Seedream" card or GPT-only message left (Seedream takes every case);
# "Mise en planche seulement": tooltip on hover or focus (what it keeps, what changes, what the unticked switch does)
rep(r"""        sdX = sdOff(t),
        sdM = sdMsg(t),
""", r"""        sdX = sdOff(t),
""")
rep(r"""              disabledHint: sdX ? sdM : a,""", r"""              disabledHint: a,""")
rep(r"""                                    "seedream" === t.model && sdX ? sdUnsup(t, n) : b ? B("body", "1", sdT("Planche de l'animal", "Animal sheet")) : B("head", "1", sdBaby(t) ? "Planche bébé" : "Planche tête"),""", r"""                                    b ? B("body", "1", sdT("Planche de l'animal", "Animal sheet")) : B("head", "1", sdBaby(t) ? "Planche bébé" : "Planche tête"),""")
rep(r"""                          t.photo &&
                            (0, l.jsx)(ax, {
                              checked: !!t.photoOnly,
                              onChange: (e) => g("photoOnly", e),
                              disabled: k,
                              children: y ? sdOnlyLabel(t) : "Mise en planche seulement",
                            }),""", r"""                          t.photo &&
                            sdTip(
                              (0, l.jsx)(ax, {
                                checked: !!t.photoOnly,
                                onChange: (e) => g("photoOnly", e),
                                disabled: k,
                                children: y ? sdOnlyLabel(t) : "Mise en planche seulement",
                              }),
                              sdPhotoOnlyTip(t),
                              "sd-tip-photoonly",
                            ),""")
# P63 review: GPT body card in "Mise en planche seulement": only the photo (its prompt uses no head sheet); header help for it;
# "typical adult adult" for a neutral person (both engines) -> "typical adult person"
rep(r"""                      children: sdChildHl(t)
                        ? ["Rien d'obligatoire. Tu peux joindre la planche tête (", R(rU("tete")), ") pour reprendre le teint et les cheveux sous le cou."]
                        : [
                            sdBodyPhotoAny(t) ? "Ta photo. " : "",""", r"""                      children: sdChildHl(t)
                        ? ["Rien d'obligatoire. Tu peux joindre la planche tête (", R(rU("tete")), ") pour reprendre le teint et les cheveux sous le cou."]
                        : t.photo && t.photoOnly && !sdChild(t)
                        ? ["Ta photo"]
                        : [
                            sdBodyPhotoAny(t) ? "Ta photo. " : "",""")
rep(r'''                      t.photo &&
                        (0, l.jsx)("p", {
                          className: "mt-3 text-sm text-muted-foreground",
                          children: y
                            ? "Joins ta photo à la planche : l'objet viendra d'elle. La description reste utile pour préciser."''', r'''                      t.photo &&
                        (0, l.jsx)("p", {
                          className: "mt-3 text-sm text-muted-foreground",
                          children: t.photoOnly
                            ? "Joins ta photo, ou plusieurs photos du même sujet, à chaque planche : tout viendra d'elles, tel quel."
                            : y
                            ? "Joins ta photo à la planche : l'objet viendra d'elle. La description reste utile pour préciser."''')
rep(r"""                                      (i =
                                        "m" === e.pres
                                          ? "man"
                                          : "f" === e.pres
                                            ? "woman"
                                            : "adult"),""", r"""                                      (i =
                                        "m" === e.pres
                                          ? "man"
                                          : "f" === e.pres
                                            ? "woman"
                                            : "person"),""")
# The repository's separate object cards keep their own attachment rows.
rep(r"""? "seedream" === t.model && sdX
                                ? sdUnsup(t, n)
                                : sdObjCards(B)""", r"""? sdObjCards(B)""")
# P64-P68: v113/v114b outfit text, vehicles, face character and contextual controls.
rep(r'''function nz() {
  if (nv() || sdPhotoClothes()) return "";''', r'''function nz() {
  if (nv() || sdPhotoClothes() || sdFreeOn()) return "";''')
rep(r'''  var t = sdPhotoClothes() ? [] : nh("topSel", "topOpts", "top");
  return t.length ? t.join(", ") : nN("top");''', r'''  if (sdFreeOn()) return sdFreeText() ? "the top of this outfit: " + sdFreeText() : "a plain crew-neck top in a solid neutral color";
  var t = sdPhotoClothes() ? [] : nh("topSel", "topOpts", "top");
  return t.length ? t.join(", ") : nN("top");''')
rep(r'''  var r = "; outfit condition: " + t1("wear", e.wear);
  if (!nj())''', r'''  if (sdFreeOn()) return sdFreeText() ? sdFreeText() + (nw() ? " (anything worn on the head or the face stays outside the frame)" : "") : "a simple realistic everyday outfit in plain solid colors";
  var r = "; outfit condition: " + t1("wear", e.wear);
  if (!nj())''')
rep(r'''function nx() {
  var e = nk();''', r'''function nx() {
  if (sdFreeText()) return "No logos or printed text beyond what this outfit description names.";
  var e = nk();''')
rep(r'''            : "Clothing at the bottom edge of each panel, only its neckline visible: " +''', r'''            : sdFreeText()
              ? "Clothing and accessories of this outfit, identical in every panel, only the parts a head close-up shows (the neckline at the bottom edge, and anything worn at the neck, on the head or on the face): " + sdFreeText() + ".\n"
              : "Clothing at the bottom edge of each panel, only its neckline visible: " +''')
rep(r'''                            : ". Fully clothed. The outfit is identical in all four views.") +''', r'''                            : sdFreeText()
                              ? ". Exactly this outfit, with nothing added or left out. The outfit is identical in all four views."
                              : ". Fully clothed. The outfit is identical in all four views.") +''')
rep(r'''                                              !("tenue" === w.id && sdPhotoClothes(t)),''', r'''                                              !("tenue" === w.id && sdPhotoClothes(t)) &&
                                              !("tenue" === w.id && t.outfitFree && !sdChild(t)),''')
rep(r'''            !("tenue" === t && sdPhotoClothes(e)) &&''', r'''            !("tenue" === t && sdPhotoClothes(e)) &&
            !("tenue" === t && e.outfitFree && !sdChild(e)) &&''')
rep(r'''                                                    "Ta tenue, ci-dessous : la planche corps garde la tenue de référence ; ta tenue sert à la retouche « Habiller avec ma tenue » (carte 3, Autres retouches).",
                                                }),
                                            ],
                                          }),''', r'''                                                    "Ta tenue, ci-dessous : la planche corps garde la tenue de référence ; ta tenue sert à la retouche « Habiller avec ma tenue » (carte 3, Autres retouches).",
                                                }),
                                            ],
                                          }),
                                        "tenue" === w.id &&
                                          !sdChild(t) &&
                                          !sdPhotoClothes(t) &&
                                          !(t.bodyRef && !sdMineTenue(t)) &&
                                          sdFreeBox(t, g, L),''')
rep(r'''    objViews: [],
    photoClothes: !0,''', r'''    objViews: [],
    photoClothes: !0,
    outfitFree: !1,
    outfitText: "",''')
rep(r'''                            ? "The vehicle stands on its wheels on the seamless grey studio floor, wheels pointing straight ahead, all doors, hood and trunk closed, with a soft contact shadow."''', r'''                            ? sdVehicle()''')
rep(r'''          ph: "en anglais : ex. compact 1980s hatchback, boxy shape, round headlights",
          hint: "Forme, éléments, époque. En anglais de préférence : le texte part tel quel dans le prompt.",''', r'''          ph: "en anglais : ex. compact 1980s hatchback, boxy shape, round headlights",
          get hint() {
            return "vehicle" === e.objCat
              ? "Tout véhicule : voiture, moto, vélo, avion, hélicoptère, bateau, char… Écris son type ici, en anglais de préférence : sa mise en place sur la planche suit (roues, train d'atterrissage, coque sur un support, chenilles). Le texte part tel quel dans le prompt."
              : "Forme, éléments, époque. En anglais de préférence : le texte part tel quel dans le prompt.";
          },''')
rep(r'''    noseW: "auto",
    noseP: "auto",
    forehead: "auto",''', r'''    noseW: "auto",
    noseP: "auto",
    forehead: "auto",
    faceChar: "auto",''')
rep(r'''    forehead: [
      ["auto", "Auto", ""],''', r'''    faceChar: [
      ["auto", "Auto", ""],
      ["gueule", "Gueule", ""],
      ["mechant", "Méchant", ""],
      ["gentil", "Gentil", ""],
      ["ange", "Angélique", ""],
    ],
    forehead: [
      ["auto", "Auto", ""],''')
rep(r'''          hint: "Peau, asymétrie, cernes : ce qui rend un visage réel. « Naturelles » est le bon point de départ.",
        },
        { t: "chips", k: "face", l: "Forme du visage" },''', r'''          hint: "Peau, asymétrie, cernes : ce qui rend un visage réel. « Naturelles » est le bon point de départ.",
        },
        {
          t: "chips",
          k: "faceChar",
          l: "Caractère",
          hint: "L'air du visage, lisible même au repos : « Gueule » pour un visage buriné qui a du caractère (avant 30 ans, sans rides ajoutées : l'âge garde le dernier mot ; avec Canon ou Beau : une ossature sculptée et un regard intense, sans marques ajoutées), « Méchant », « Gentil », « Angélique ». Il oriente les traits laissés sur Auto, jamais ceux que tu choisis (contours, mâchoire, lèvres, forme des yeux), et se combine avec Beauté, qui garde le dernier mot.",
        },
        { t: "chips", k: "face", l: "Forme du visage" },''')
rep(r'''              (rm() ? "\n" + rm() : "") +
              "\nLooks: " +''', r'''              (rm() ? "\n" + sdCharFace(rm()) : "") +
              (sdChar() ? "\n" + sdChar() : "") +
              "\nLooks: " +''')
rep(r'''                : sdNat(t) && "person" === t.mode && t.headless && !sdChild(t) && !sdOff(t)
                ? sdBarItems(t)''', r'''                : sdNat(t) && "person" === t.mode && !sdChild(t) && !sdOff(t)
                ? sdBarItems(t)''')
rep(r'''                        "Conseillé : sans visage dans l'image, Seedream respecte mieux la poitrine, les fessiers et les proportions. La tête s'ajoute ensuite avec la carte 3 (« Assembler tête et corps »).",''', r'''                        [
                          "m" === t.pres
                            ? "Conseillé : sans visage dans l'image, Seedream respecte mieux les pectoraux, les fessiers et les proportions."
                            : "Conseillé : sans visage dans l'image, Seedream respecte mieux la poitrine, les fessiers et les proportions.",
                          " Joins ensuite ce corps et la planche tête séparément dans Seedance, ou assemble-les en une planche avec la carte 3 (« Assembler tête et corps »).",
                        ],''')
rep(r'''+ "Bonnet européen = tour de poitrine moins dessous de poitrine, par paliers de 2 cm (A ≈ 12 cm, C ≈ 16 cm, E ≈ 20 cm). À partir de « Généreuse », le haut de la tenue de référence suit la poitrine comme un T-shirt ajusté, sans la remonter ni l'aplatir. Le modèle suit une description, pas des mesures."''', r'''+ "Bonnet européen = tour de poitrine moins dessous de poitrine, par paliers de 2 cm (A ≈ 12 cm, C ≈ 16 cm, E ≈ 20 cm). Le modèle suit une description, pas des mesures."''')
rep(r'''          hint: "Avec la tenue de référence, le haut est ample, court, sans manches, à décolleté rond classique, sans armature ni compression : il laisse le ventre visible et ne serre jamais la poitrine. Le maillot une pièce soutient toujours un peu : préfère le short ou l'ensemble de bain. Avec une tenue ordinaire, le prompt demande seulement de ne pas remonter ni aplatir la forme. Si le filtre bloque, repasse sur « Auto ».",''', r'''          get hint() {
            return sdNat(e)
              ? "Le prompt demande de ne pas remonter ni aplatir la forme. Si le filtre bloque, repasse sur « Auto »."
              : "Avec la tenue de référence, le haut est ample, court, sans manches, à décolleté rond classique, sans armature ni compression : il laisse le ventre visible et ne serre jamais la poitrine. Le maillot une pièce soutient toujours un peu : préfère le short ou l'ensemble de bain. Avec une tenue ordinaire, le prompt demande seulement de ne pas remonter ni aplatir la forme. Si le filtre bloque, repasse sur « Auto ».";
          },''')
rep(r'''                              " Les prompts mettent la photo en planche (",
                              y
                                ? "une image par vue"
                                : "animal" === t.mode
                                  ? "l'animal entier en quatre vues, gros plans de tête en option"
                                  : "tête et corps en quatre vues",
                              ") sur fond gris, sous une lumière neutre, sans rien modifier d'autre : ni le visage, ni les cheveux, ni le maquillage, ni la tenue, ni les marques. Les autres réglages sont ignorés tant que cette option est active ; seul le format reste au choix.",''', r'''                              ...[].concat(sdPhotoOnlyText(t)),''')
rep(r'''                              opts: tZ.objCat,
                              value: t.objCat,
                              onChange: (e) => g("objCat", e),
                            }),
                          !y &&
                            !b &&''', r'''                              opts: tZ.objCat,
                              value: t.objCat,
                              onChange: (e) => g("objCat", e),
                            }),
                          y &&
                            "house" === t.objCat &&
                            (0, l.jsx)(ay, {
                              name: "c-po-objBg",
                              label: "Décor",
                              opts: tZ.objBg,
                              value: t.objBg || "scene",
                              onChange: (e) => g("objBg", e),
                            }),
                          !y &&
                            !b &&''')
rep(r'''                          children: t.photoOnly
                            ? "Joins ta photo, ou plusieurs photos du même sujet, à chaque planche : tout viendra d'elles, tel quel."
                            : y
                            ? "Joins ta photo à la planche : l'objet viendra d'elle. La description reste utile pour préciser."
                            : b
                              ? "Joins ta photo aux deux planches : l'animal viendra d'elle."
                              : !sdBodyPhoto(t)
                                ? "Joins ta photo à la planche tête : visage et cheveux viendront d'elle. Pour garder aussi son corps, active « Garder le corps tel quel » dans Corps."
                                : sdPhotoClothes(t) && !t.bodyRef
                                  ? "Joins ta photo aux deux planches : visage, cheveux et habits viendront d'elle. Pour garder aussi son corps, active « Garder le corps tel quel » dans Corps."
                                  : "Joins ta photo aux deux planches : visage et cheveux viendront d'elle. Pour garder aussi son corps, active « Garder le corps tel quel » dans Corps.",''', r'''                          children: t.photoOnly
                            ? "Joins ta photo, ou plusieurs photos du même sujet, à chaque planche : tout viendra d'elles, tel quel."
                            : sdPhotoHelp(t),''')
rep(r'''                          t.photo &&
                            !t.photoOnly &&
                            "person" === t.mode &&
                            (0, l.jsx)(ax, {
                              checked: !1 !== t.photoClothes,''', r'''                          t.photo &&
                            !t.photoOnly &&
                            "person" === t.mode &&
                            !t.bodyRef &&
                            (0, l.jsx)(ax, {
                              checked: !1 !== t.photoClothes,''')
rep(r'''                        (0, l.jsxs)("b", {
                          children: [
                            y ? "Objet" : b ? "Animal" : "Personnage",
                            " important : ouvre une nouvelle conversation GPT Image 2.5, vierge",
                          ],
                        }),
                        ", avant de coller le premier prompt. Dans une conversation déjà utilisée, GPT peut reprendre des traits des images précédentes.",
                        !y &&
                          !sdBaby(t) &&
                          (0, l.jsxs)(l.Fragment, {
                            children: [
                              " Pour enchaîner des ",
                              b ? "animaux" : "personnages",
                              " secondaires dans une même conversation, coche plutôt « Plusieurs ",
                              b ? "animaux" : "personnages",
                              " dans la même conversation GPT ».",
                            ],
                          }),''', r'''                        (0, l.jsx)("b", {
                          children: y
                            ? sdT("Objet important : ouvre une nouvelle conversation GPT Image 2.5, vierge", "Important object: open a new, empty GPT Image 2.5 conversation")
                            : b
                              ? sdT("Animal important : ouvre une nouvelle conversation GPT Image 2.5, vierge", "Important animal: open a new, empty GPT Image 2.5 conversation")
                              : sdT("Personnage important : ouvre une nouvelle conversation GPT Image 2.5, vierge", "Important character: open a new, empty GPT Image 2.5 conversation"),
                        }),
                        ", avant de coller le premier prompt. Dans une conversation déjà utilisée, GPT peut reprendre des traits des images précédentes.",
                        !y &&
                          !sdBaby(t) &&
                          (b
                            ? sdT(" Pour enchaîner des animaux secondaires dans une même conversation, coche plutôt « Plusieurs animaux dans la même conversation GPT ».", " To chain secondary animals in one conversation, tick “Several animals in the same GPT conversation” instead.")
                            : sdT(" Pour enchaîner des personnages secondaires dans une même conversation, coche plutôt « Plusieurs personnages dans la même conversation GPT ».", " To chain secondary characters in one conversation, tick “Several characters in the same GPT conversation” instead.")),''')
rep(r'''(0, l.jsx)(aN, { obj: y, sd: "seedream" === t.model, baby: sdBaby(t) }),''', r'''(0, l.jsx)(aN, { obj: y, sd: "seedream" === t.model, baby: sdBaby(t), an: b }),''')
rep(r'''                                                    : " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation du personnage.",''', r'''                                                    : y
                                                      ? " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation de l'objet."
                                                      : b
                                                        ? " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation de l'animal."
                                                        : " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation du personnage.",''')
rep(r'''                                                  "Remplace ce qui est entre crochets. Précise toujours le côté ",
                                                  y
                                                    ? "de l'objet"
                                                    : "du personnage",''', r'''                                                  "Remplace ce qui est entre crochets. Précise toujours le côté ",
                                                  y
                                                    ? "de l'objet"
                                                    : b
                                                      ? "de l'animal"
                                                      : "du personnage",''')
rep(r'''                        "aria-label": y
                          ? "Nom de l'objet"
                          : "Nom du personnage",
                        placeholder: y ? "Nom de l'objet" : "Nom du personnage",''', r'''                        "aria-label": y
                          ? "Nom de l'objet"
                          : b
                            ? "Nom de l'animal"
                            : "Nom du personnage",
                        placeholder: y ? "Nom de l'objet" : b ? "Nom de l'animal" : "Nom du personnage",''')
rep(r'''!sdBaby(t) && B("body", "2", "Planche corps")''', r'''!sdBaby(t) && B("body", "2", nw() || sdChildHl(t) ? "Planche corps sans tête" : "Planche corps")''')
rep(r'''                      ". Règle à gauche, copie les prompts à droite.",''', r'''                      ". Règle ta planche, puis copie les prompts.",''')
rep(r'''                      ". Set things up on the left, copy the prompts on the right.",''', r'''                      ". Set up your sheet, then copy the prompts.",''')
rep(r'''                    onChange: (e) => n((t) => ({ ...t, model: e, modelPick: 1 })),
                    options: [
                      ["gpt", "GPT Image 2.5"],
                      ["seedream", "Seedream 5.0"],
                    ],
                  }),''', r'''                    onChange: (e) => n((t) => ({ ...t, model: e, modelPick: 1 })),
                    options: [
                      ["gpt", "GPT Image 2.5"],
                      ["seedream", "Seedream 5.0"],
                    ],
                  }),
                  !t.modelPick &&
                    (0, l.jsx)("p", {
                      className: "text-sm text-muted-foreground",
                      style: { flexBasis: "100%" },
                      children:
                        "Modèle choisi automatiquement : Seedream 5.0 pour une personne, un enfant ou un bébé en style Photo sans photo de départ et pour les animaux, objets et lieux ; GPT Image 2.5 sinon. Choisis un modèle pour le garder.",
                    }),''')
rep(r'''                              "-mx-1 flex items-center gap-1 overflow-x-auto border-b pb-3",''', r'''                              "-mx-1 flex flex-wrap items-center gap-1 border-b pb-3",''')
rep(r'''                                                  "Le corps de ta photo, sans aucun changement : les curseurs ci-dessous sont ignorés.",''', r'''                                                  "Le corps de ta photo, sans aucun changement : les réglages du corps sont ignorés.",''')
rep(r'''                    "Ta tenue, ci-dessous : la planche corps garde la tenue de référence ; ta tenue sert à la retouche « Habiller avec ma tenue » (carte 3, Autres retouches).",''', r'''                    "Ta tenue, ci-dessous : la planche corps garde la tenue de référence ; ta tenue sert à la retouche « Habiller avec ma tenue » (carte 3, Choisir la retouche).",''')
rep(r'''                      opts: tZ[i],
                      values: t[a],''', r'''                      opts: sdOpts(t, i),
                      values: t[a],''')
rep(r'''                opts: tZ[i],
                value:
                  "absStyle" === a''', r'''                opts: sdOpts(t, i),
                value:
                  "absStyle" === a''')
rep(r'''                              children: [
                                "Plusieurs ",
                                b ? "animaux" : "personnages",
                                " dans la même conversation GPT",
                              ],''', r'''                              children: b ? "Plusieurs animaux dans la même conversation GPT" : "Plusieurs personnages dans la même conversation GPT",''')
rep(r'''            : sdBb
              ? "Une conversation GPT par personnage permet de regrouper ses références. Pour chaque retouche, joins la planche à utiliser."
              : "Une conversation GPT par personnage permet de regrouper ses références. Pour chaque retouche, joins la planche à utiliser. Pour des personnages secondaires dans une même conversation, coche « Plusieurs personnages dans la même conversation GPT ».",''', r'''            : sdRulesGpt(sdBb, sdAn, e),''')
rep(r'''function aN({ obj: e, sd: sdM, baby: sdBb }) {''', r'''function aN({ obj: e, sd: sdM, baby: sdBb, an: sdAn }) {''')
rep(r'''                      "flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +''', r'''                      "flex-1 inline-flex items-center justify-center " +
                      (U.length > 2 ? "min-w-0 gap-1.5 px-2 text-sm " : U.length > 1 ? "min-w-0 gap-1.5 px-3 text-sm " : "gap-2 px-4 ") +
                      "rounded-full py-3 font-bold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +''')
rep(r'''                      o === e
                        ? (0, l.jsx)(tB, { size: 17 })
                        : (0, l.jsx)(tV, { size: 17 }),''', r'''                      U.length > 2
                        ? null
                        : o === e
                          ? (0, l.jsx)(tB, { size: 17 })
                          : (0, l.jsx)(tV, { size: 17 }),''')
rep(r'''                    disabled: n || sdX,
                    onClick: () => A(e, m[e]),''', r'''                    disabled: (n && "iter" !== e) || sdX,
                    onClick: () => (n && "iter" === e ? (sdGoIter(), h("Choisis ou écris une retouche dans la carte 3.")) : A(e, m[e])),''')
rep(r'''                      "rounded-full py-3 font-bold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +''', r'''                      "rounded-full py-3 font-bold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                      (n && "iter" === e ? "opacity-45 " : "") +''')
rep(r'''                                                    children: sdFittedWarn(t),''', r'''                                                    children: sdCoverNote(t) ? null : sdFittedWarn(t),''')
rep(r'''                                              t.bodyRef &&
                                                sdMineTenue(t) &&''', r'''                                              t.bodyRef &&
                                                sdCoverNote(t) &&
                                                (0, l.jsx)("p", {
                                                  className:
                                                    "mt-3 text-sm text-muted-foreground",
                                                  children: sdCoverNote(t),
                                                }),
                                              t.bodyRef &&
                                                sdMineTenue(t) &&''')
rep(r'''                          !y &&
                            !k &&
                            !(t.photo && t.photoOnly) &&
                            (0, l.jsxs)("button", {''', r'''                          !y &&
                            !k &&
                            !(t.photo && t.photoOnly) &&
                            !("person" === t.mode && !sdChild(t) && (ae.person || []).every((x) => !z(t, x))) &&
                            (0, l.jsxs)("button", {''')
# The photo-only house decor control uses the same staging as the supplied build.
rep(r'''Reproduce exactly its architecture, layout, furniture, materials, colors, wear, light and time of day. " +
                      ar +
                      " The only change is the viewing angles. No people.\n\nLAYOUT:\nA 16:9 landscape image split into six equal panels in a 3 by 2 grid, separated by narrow gaps of neutral grey. " +''', r'''" +
                      (sdHouseGrey()
                        ? "Reproduce exactly its architecture, materials, colors and wear. " +
                          ar +
                          " The only changes are the viewing angles and the setting: " +
                          sdHouseBg().replace(/\n$/, "") +
                          " Its light: neutral daylight from the upper left. No people."
                        : "Reproduce exactly its architecture, layout, furniture, materials, colors, wear, light and time of day. " +
                          ar +
                          " The only change is the viewing angles. No people.") +
                      "\n\nLAYOUT:\nA 16:9 landscape image split into six equal panels in a 3 by 2 grid, separated by narrow gaps of neutral grey. " +''')
# P69 (v115, user's Seedream test of v114b) interior from a photo: each view a camera position and direction (module), the sides the photo does
# not show completed like what it shows instead of "with nothing new", a camera line in "Mise en planche seulement" too
rep(r'''                        : "Reproduce exactly its architecture, layout, furniture, materials, colors, wear, light and time of day. " +
                          ar +''', r'''                        : "Reproduce exactly its architecture, layout, furniture, materials, colors, wear, light and time of day. " +
                          sdPlaceAr(ar) +''')
# (this repository's photo-only place prompt keeps its six-view layout, rewritten per view by sdPlaceOne, which keeps each card's camera;
# v137: an outdoor location too, by day)
rep(r'''                        "view toward the main windows, or toward the main light source if the photos show no window",
                      ) +
                      "\n\nRENDERING:\n" +
                      aa()''', r'''                        "view toward the main windows, or toward the main light source if the photos show no window",
                      ) +
                      ("interior" === e.objCat || sdExt() ? "\n\nCAMERA:\n" + sdPlaceCamAll() : "") +
                      "\n\nRENDERING:\n" +
                      aa()''')
rep(r'''The attached photo is the only source for its architecture, layout, materials, colors and wear: reproduce them exactly." +''', r'''The attached photo is the only source for its architecture, layout, materials, colors and wear: reproduce them exactly." +
                                (n ? "" : " " + SD_PLACE_FILL) +''')
# P70 (v116, user) "Planche corps sans tête" also with a photo and "Garder le corps tel quel" (switch shown in Corps, nw); the body copied from the
# photo named part by part (sdAsIsShape); makeup named in the free outfit text wins over the Maquillage setting (sdFreeMk)
rep(r'''function nw() {
  return (
    "person" === e.mode &&
    !e.child &&
    !!e.headless &&
    (!!(e.photo && e.photoOnly) || !(e.photo && e.bodyAsIs))
  );
}''', r'''function nw() {
  return "person" === e.mode && !e.child && !!e.headless;
}''')
rep(r'''          k: "headless",
          l: "Planche corps sans tête",
          show: function () {
            return !(e.photo && e.bodyAsIs);
          },''', r'''          k: "headless",
          l: "Planche corps sans tête",''')
rep(r'''                                                O &&
                                                "corps" === w.id &&
                                                !("pres" === e.k && t.bodyRef)''', r'''                                                O &&
                                                "corps" === w.id &&
                                                !("pres" === e.k && t.bodyRef) &&
                                                "headless" !== e.k''')
rep(r'''                              "BODY:\nBody build, height and proportions exactly as in the attached photo, without any change." +''', r'''                              "BODY:\nBody build, height and proportions exactly as in the attached photo, without any change." +
                              sdAsIsShape() +''')
rep(r'''                  ("none" === r8()
                    ? "no makeup"''', r'''                  (sdFreeMk()
                    ? "the makeup described above"
                    : "none" === r8()
                    ? "no makeup"''')
rep(r'''              ("none" === r8()
                ? "No makeup: remove any makeup visible in the photo and leave bare, natural skin, without changing the face.\n"''', r'''              (sdFreeMk()
                ? ""
                : "none" === r8()
                ? "No makeup: remove any makeup visible in the photo and leave bare, natural skin, without changing the face.\n"''')
rep(r'''              (r9() ? "\nMakeup: " + r9() + "." : "") +''', r'''              (!sdFreeMk() && r9() ? "\nMakeup: " + r9() + "." : "") +''')
rep(r'''                  (r9() ? " Makeup: " + r9() + "." : "") +''', r'''                  (!sdFreeMk() && r9() ? " Makeup: " + r9() + "." : "") +''')
rep(r'''                              ("none" === r8()
                                ? " No makeup, as on the head sheet."''', r'''                              (sdFreeMk()
                                ? ""
                                : "none" === r8()
                                ? " No makeup, as on the head sheet."''')
# P71 (v117, user, with the parents' consent) the child: "Partir d'une photo" (key childPhoto, face and hair only, sdChildPh) and "Tenue en un
# seul texte" (own keys childOutfitFree, childOutfitText: the adult's text never dresses the child; accepted only with known everyday
# clothing words, sdChildTypedOk); never for a baby; the face and hair tabs say they come from the photo
rep(r'''                          !sdChild(t) &&
                          sdTip(
                            (0, l.jsx)(ax, {
                              checked: t.photo,
                              onChange: (e) => g("photo", e),
                              disabled: k,
                              children: "Partir d'une photo",
                            }),
                            sdPhotoTip(t),
                            "sd-tip-photo",
                          ),''', r'''                          !sdChild(t) &&
                          sdTip(
                            (0, l.jsx)(ax, {
                              checked: t.photo,
                              onChange: (e) => g("photo", e),
                              disabled: k,
                              children: "Partir d'une photo",
                            }),
                            sdPhotoTip(t),
                            "sd-tip-photo",
                          ),
                          sdChild(t) &&
                            !sdBaby(t) &&
                            sdTip(
                              (0, l.jsx)(ax, {
                                checked: !!t.childPhoto,
                                onChange: (e) => g("childPhoto", e),
                                disabled: k,
                                children: "Partir d'une photo",
                              }),
                              sdChildPhotoTip(),
                              "sd-tip-photo",
                            ),''')
rep(r'''                          !y &&
                            !t.photo &&
                            (0, l.jsxs)("button", {
                              type: "button",
                              title: b''', r'''                          !y &&
                            !t.photo &&
                            !sdChildPh(t) &&
                            (0, l.jsxs)("button", {
                              type: "button",
                              title: b''')
rep(r'''                                w.photo && t.photo
                                  ? (0, l.jsxs)(l.Fragment, {
                                      children: [
                                        "visage" === w.id &&''', r'''                                w.photo && (t.photo || sdChildPh(t))
                                  ? (0, l.jsxs)(l.Fragment, {
                                      children: [
                                        "visage" === w.id &&
                                          !sdChild(t) &&''')
rep(r'''                                        "tenue" === w.id &&
                                          !sdChild(t) &&
                                          !sdPhotoClothes(t) &&
                                          !(t.bodyRef && !sdMineTenue(t)) &&
                                          sdFreeBox(t, g, L),''', r'''                                        "tenue" === w.id &&
                                          !sdBaby(t) &&
                                          !sdPhotoClothes(t) &&
                                          !(t.bodyRef && !sdMineTenue(t) && !sdChild(t)) &&
                                          sdFreeBox(t, g, L),''')
rep(r'''                                              !("tenue" === w.id && t.outfitFree && !sdChild(t)),''', r'''                                              !("tenue" === w.id && sdFreeSw(t)),''')
rep(r'''    childHeadless: !1,
    placeViews: [],''', r'''    childHeadless: !1,
    childPhoto: !1,
    childOutfitFree: !1,
    childOutfitText: "",
    placeViews: [],''')
rep(r'''            (!!n || !e.photo || ("visage" !== t && "cheveux" !== t)) &&''', r'''            (!!n || !e.photo || ("visage" !== t && "cheveux" !== t)) &&
            !(sdChildPh(e) && ("visage" === t || "cheveux" === t)) &&''')
rep(r'''          hint: "Corps habillé, cadré du cou aux pieds, fait sans image. Dans Seedance, joins la planche tête et cette planche : le visage ne vient que de la planche tête.",''', r'''          hint: "Corps habillé, cadré du cou aux pieds, fait sans image (d'après une photo : avec la planche tête, pour le teint). Dans Seedance, joins la planche tête et cette planche : le visage ne vient que de la planche tête.",''')
rep(r'''            ["Joins", "animal" === t.mode ? sdAnimalHeadJoin(t, R) : t.photo ? "Ta photo" : "Rien"],
            ["Format", I],
            ["Nomme-la", R(rU(sdBaby(t) ? "bebe" : "tete"))],''', r'''            ["Joins", "animal" === t.mode ? sdAnimalHeadJoin(t, R) : t.photo || sdChildPh(t) ? "Ta photo" : "Rien"],
            ["Format", I],
            ["Nomme-la", R(rU(sdBaby(t) ? "bebe" : "tete"))],''')
# P71 (v117, independent review) a child: the Signes and state placeholders and the state shortcuts without a cut, blood, torn sleeve,
# wet clothes or sweat (the child word lists refuse them)
rep(r'''              ph: r.ph,''', r'''              ph: sdChild(t) && "marks" === a ? "ex. freckles on the nose, a small scar on the left eyebrow" : r.ph,''')
rep(r'''                                                children: (y ? ag : ah).map(''', r'''                                                children: (y ? ag : sdChild(t) ? ah.filter(function (x) { return ["Hématome", "Pansement", "Saleté"].indexOf(x[0]) >= 0; }) : ah).map(''')
rep(r'''                                                  : "ex. fresh cut on the left cheekbone, a little dried blood; right sleeve torn at the elbow",''', r'''                                                  : sdChild(t)
                                                    ? "ex. muddy knees, messy hair, dust on the shoes"
                                                    : "ex. fresh cut on the left cheekbone, a little dried blood; right sleeve torn at the elbow",''')
# P71 (v117, third review) GPT keeps one conversation: after a child's head sheet (a real child from a photo), an adult body or retouch
# prompt said "otherwise use the most recent head sheet". The kind of the last GPT head copied is kept (sdLastHeadKid: 0 adult, 1 child,
# 2 baby); while it is a child's, the adult prompts add "never the head sheet of a child or a baby" and the copy message says to attach
# the adult's head sheet. The state shortcuts of a child come from the module (sdChildChips).
rep(r'''    childOutfitFree: !1,
    childOutfitText: "",''', r'''    childOutfitFree: !1,
    childOutfitText: "",
    sdLastHeadKid: 0,''')
rep(r'''          let a = await ad(r);
          a &&
            sdSnap &&''', r'''          let a = await ad(r);
          a && "head" === t && "seedream" !== sdModel && n((e) => ({ ...e, sdLastHeadKid: sdKid0 }));
          a &&
            sdSnap &&''')
rep(r'''            sdMsg = "seedream" !== sdModel || "person" !== e.mode ? "" : "body" === t ? sdBodyCopyMsg(e) : "iter" === t ? sdIterCopyMsg(e) : sdSrcCopyMsg(e);''', r'''            sdMsg = "seedream" !== sdModel ? sdGptKidMsg(e, t) : "person" !== e.mode ? "" : "body" === t ? sdBodyCopyMsg(e) : "iter" === t ? sdIterCopyMsg(e) : sdSrcCopyMsg(e);''')
rep(r'''                            : "generated in this conversation") +
                          ".\n\n")''', r'''                            : "generated in this conversation") +
                          sdNoKidHead() +
                          ".\n\n")''')
rep(r'''                            : "generated in this conversation") +
                          ", and ignore every other " +''', r'''                            : "generated in this conversation") +
                          sdNoKidHead() +
                          ", and ignore every other " +''')
rep(r'''            " in this conversation";''', r'''            " in this conversation" +
            sdNoKidHead();''')
rep(r'''                                                children: (y ? ag : sdChild(t) ? ah.filter(function (x) { return ["Hématome", "Pansement", "Saleté"].indexOf(x[0]) >= 0; }) : ah).map(''', r'''                                                children: (y ? ag : sdChild(t) ? sdChildChips() : ah).map(''')
# P72 (v118, user: the nose is sometimes cut in the profile) GPT head layout of a person: the face never cropped in the three-quarter view and
# the profile, only the back of the head and the hair (SD_FACE_IN, the same sentence as the Seedream head)
rep(r'''sdBackHair() + ".\nThe head is the same size and at the same height in all four panels. Long hair may be cropped by the panel edges.";''', r'''sdBackHair() + ".\nThe head is the same size and at the same height in all four panels. Long hair may be cropped by the panel edges.\n" + SD_FACE_IN;''')
# P72 (v118, user: "Gros" glutes looked medium-plus, "Très gros" looked large, "Très larges" hips looked only nicely wide; the light cellulite
# never showed): the two top glute sizes and the widest hips said with more volume, the hip-to-waist width targets raised one step, and the
# light cellulite said visible at the distance of a full-body view ("visible only up close" made it vanish)
# v119 (user, from the v118 sheet: the top of both sliders still gave an ordinary body): "Gros" takes the volume "Très gros" had, and
# "Très gros" glutes and "Très larges" hips are the extreme of the scale, out of proportion with a slim waist
rep(r'''[3, "Gros", "large glutes"],''', r'''[3, "Gros", "very large, round glutes, much bigger than average, projecting far behind the line of the lower back"],''')
# v120 (user, from the v119 sheet: better, but every slider at the top should still be bigger, without going absurd): the top of the scale
# anchored on body landmarks a model can draw (the glutes a hand's width behind the shoulder blades in profile, the outer hips beyond the
# ribcage in front, a waist-to-hip ratio of about 0.6), and kept natural; nothing said twice (the front view already compares the hips with
# the shoulders, and hips filled by the glutes from behind are wider than the waist), so the user's sheet keeps its "Key proportions" line
rep(r'''[4, "Très gros", "very large glutes"],''', r'''[4, "Très gros", "extremely large, heavy glutes, out of proportion with a slim waist: in the side views the back of the glutes sits about a hand's width behind the line of the shoulder blades, a deep shelf below the lower back, and from behind they fill the whole width of the hips; naturally shaped, not surgically enhanced"],''')
rep(r'''[4, "Très larges", "very wide hips, much wider than the waist"],''', r'''[4, "Très larges", "extremely wide hips, with a waist-to-hip ratio of about 0.6: a dramatic pear shape whose widest point is at the hips and upper thighs"],''')
rep(r'''"slight cellulite dimpling on the backs of the thighs, visible only up close",''', r'''"light cellulite dimpling on the backs of the thighs and just under the glutes, faint but visible in a full-body view",''')
rep(r'''{ 1: "1.2", 2: "1.35", 3: "1.5", 4: "1.6" }''', r'''(4 === e.hips ? { 1: "1.5", 2: "1.75", 3: "1.9", 4: "2" } : { 1: "1.25", 2: "1.45", 3: "1.6", 4: "1.75" })''')
# P73 v121 (user, from two v120 sheets: the glutes grew, the hips did not): GPT takes the same upper thighs as Seedream at the top of the
# hip scale (sdThighs, seedream_new.js), and no longer says the thighs below the hips stay slim there; the top glute text loses
# "far bigger than average" (said by "extremely large"), so the Seedream sheet keeps its "Key proportions" line whatever the random body details
rep('''ry() +
                                        "; " +
                                        t1("thighs", e.thighs) +''', '''ry() +
                                        "; " +
                                        sdThighs() +''')
rep('''(e.thighs <= 2 &&
                                        !rj() &&''', '''(e.thighs <= 2 &&
                                        !sdThighCurve() &&
                                        !rj() &&''')
# P74 v122 (user: the glutes always came out perfect; wanted malformed ones, by their name): "Fessiers : défauts" (glutesDef, a
# multi-select under "Fessiers : galbe"), square, hip dips, drooping with a roll below the crease; texts and rules in seedream_new.js
# (sdGlDef, sdGlShape, sdThighs); GPT takes them after the glutes in "3. Glutes and legs"
rep('''    glutesShape: "auto",\n''', '''    glutesShape: "auto",\n    eyeShade: "auto",\n    fatGlutes: 0,\n    freckles: "auto",\n    bodyHairChest: 0,\n    bodyHairArms: 0,\n    bodyHairLegs: 0,\n    hairLoss: 0,\n    glutesDef: [],\n    sdJoinFor: "seedream",\n    fatBelly: 0,\n    fatFlanks: 0,\n    fatArms: 0,\n    fatBack: 0,\n    delts: "auto",\n    lats: "auto",\n    pecsF: "auto",\n''')  # v127: sdJoinFor, the model "Assembler" is written for; v128: the fat of each zone
rep('''    glutesShape: [
      ["auto", "Auto", ""],''', '''    glutesDefOpts: [
      ["square", "Carrés", "square"],
      ["dips", "Creux sur les côtés", "hip dips"],
      ["sag", "Tombants", "drooping"],
    ],
    glutesShape: [
      ["auto", "Auto", ""],''')
rep('''          k: "glutesShape",
          l: "Fessiers : galbe",
          hint: "Indépendant du volume : un fessier large mais plat, ou petit mais très bombé.",
        },''', '''          k: "glutesShape",
          l: "Fessiers : galbe",
          hint: "Indépendant du volume : un fessier large mais plat, ou petit mais très bombé.",
        },
        {
          t: "multi",
          k: "glutesDef",
          o: "glutesDefOpts",
          l: "Fessiers : défauts",
          hint: "À cocher en plus du volume et du galbe. Carrés : vus de dos, côtés presque droits jusqu'aux cuisses (forme carrée de la classification de Mendieta). Creux sur les côtés : un creux entre la hanche et la cuisse (« hip dips »). Tombants : le bas retombe sur le pli, avec un bourrelet juste dessous (« banana roll »).",
        },''')
rep('''      ? " (" + t1("glutesShape", e.glutesShape) + ")"''', '''      ? " (" + sdGlShape(t1("glutesShape", e.glutesShape)) + ")"''')
rep('''ry() +
                                        "; " +
                                        sdThighs() +''', '''ry() +
                                        (sdGlDef() ? "; " + sdGlDef() : "") +
                                        "; " +
                                        sdThighs() +''')
# P75 v122 (user: from a description Seedream never draws very large glutes or very wide hips, but enlarges them at once in an edit of the
# generated body sheet; "a specific prompt appears, explain how to do it"): card 2b "Retouche : hanches et fessiers" (sdGrowOn,
# sdGrowPrompt, rows with "Comment faire" in seedream_new.js), between the body card and card 3, with its copy message and the step count
rep('''                                        : !sdBaby(t) && B("body", "2", nw() || sdChildHl(t) ? "Planche corps sans tête" : "Planche corps")),''', '''                                        : !sdBaby(t) && B("body", "2", nw() || sdChildHl(t) ? "Planche corps sans tête" : "Planche corps")),
                                    !sdX && sdGrowOn(t) && B("grow", "2b", "Retouche : hanches et fessiers"),''')
rep('''                ? "Tes trois étapes, dans l'ordre"''', '''                ? sdGrowOn(t) ? "Tes quatre étapes, dans l'ordre" : "Tes trois étapes, dans l'ordre"''')
rep('''"iter" === t ? sdIterCopyMsg(e) : sdSrcCopyMsg(e);''', '''"iter" === t ? sdIterCopyMsg(e) : "grow" === t ? sdGrowCopyMsg(e) : sdSrcCopyMsg(e);''')
# P76 v123 (user: a tooltip on hover on the buttons of the bottom bar, translated): title from sdBarTip (seedream_new.js)
rep('''                  "button",
                  {
                    type: "button",
                    disabled: (n && "iter" !== e) || sdX,''', '''                  "button",
                  {
                    type: "button",
                    title: sdBarTip(e, n),
                    disabled: (n && "iter" !== e) || sdX,''')
# P77 v125 (user: export and import the settings, with a new colored button, prominent and working): "Exporter" / "Importer" in the
# header, after the Outil switch (sdIoButtons, seedream_new.js)
rep('''                    options: [
                      ["sheets", "Planches"],
                      ["integ", "Intégration d'image"],
                    ],
                  }),
                  SD_VERSION &&''', '''                    options: [
                      ["sheets", "Planches"],
                      ["integ", "Intégration d'image"],
                    ],
                  }),
                  sdIoButtons(t, h),
                  SD_VERSION &&''')
# P78 v128 (user: "Discrets" and "Présents" abs look the same; fat sliders for the belly and the other zones, to mix muscle and fat): the
# fat options, the sliders next to each zone's "Muscles apparents", GPT's abs wording and the fat sentence in its "Muscles and details"
rep('''    fatLower: [
      [0, "Aucune", ""],''', '''    fatBelly: [
      [0, "Aucune", ""],
      [1, "Légère", "a thin layer of soft fat below the navel"],
      [2, "Visible", "a small soft pooch below the navel, a shallow crease at the navel"],
      [3, "Marquée", "a soft, rounded belly that rounds forward in profile, a soft crease across the navel"],
      [4, "Très marquée", "a large, soft belly hanging slightly over the waistband line, a deep crease below the navel"],
    ],
    fatFlanks: [
      [0, "Aucune", ""],
      [1, "Légère", "a slight softness at the sides of the waist"],
      [2, "Visible", "small love handles, soft rolls at the sides of the waist"],
      [3, "Marquée", "clear love handles spilling slightly over the hip line"],
      [4, "Très marquée", "large love handles wrapping to the lower back, spilling over the hip line"],
    ],
    fatArms: [
      [0, "Aucune", ""],
      [1, "Légère", "a little softness at the back of the upper arms"],
      [2, "Visible", "soft upper arms that sag slightly when the arms hang"],
      [3, "Marquée", "loose fat at the back and inside of the upper arms, hanging below the bone"],
      [4, "Très marquée", "heavy upper arms with loose, hanging fat and soft fat at the armpits"],
    ],
    fatBack: [
      [0, "Aucune", ""],
      [1, "Légère", "a slight softness below the shoulder blades"],
      [2, "Visible", "small soft folds at the sides of the back, below the armpits"],
      [3, "Marquée", "soft rolls across the back below the shoulder blades"],
      [4, "Très marquée", "several soft rolls across the back, from the armpits to the waist"],
    ],
    fatLower: [
      [0, "Aucune", ""],''')
rep('''                subtle: "a soft outline of the abdominal muscles",
                clear: "a visible outline of the abdominal muscles",
                strong: "sharply visible abdominal segments",
              }[rP("defAbs")],''', '''                subtle: SD_ABS_DEF.subtle,
                clear: SD_ABS_DEF.clear,
                strong: SD_ABS_DEF.strong,
              }[rP("defAbs")],''')
rep('''                                    "4. Muscles and details: " +
                                      rT() +
                                      "." +
                                      (l ? " " + l : ""),''', '''                                    "4. Muscles and details: " +
                                      sdFatGpt(
                                        rT() +
                                        "." +
                                        (sdFatText() ? " " + sdFatText() : "") +
                                        (l ? " " + l : ""),
                                      ),''')
# v128 review: the same in the body text of "Itérer" (rv), which had no fat zones
rep('''    rT() +
    "." +
    rI() +
    " Every limb keeps''', '''    sdFatGpt(rT() + "." + rI() + (sdFatText() ? " " + sdFatText() : "")) +
    " Every limb keeps''')
# v128 review: the zones carrying fat stay soft under the definition (GPT's "never firmed" list, and no "very low body fat" then)
rep('''    (rM() || rj()) && t.push("the hips and outer thighs"),
    t
  );''', '''    (rM() || rj()) && t.push("the hips and outer thighs"),
    sdFatZones().forEach(function (z) {
      t.indexOf("the " + z) < 0 && t.push("the " + z);
    }),
    t
  );''')
# v128 review: "Fat distribution: the arms and the back are lean and dry, ... the soft fat sits on the hips and thighs" never with fat
# on the arms or the back
rep('''function rC() {
  var e = [];
  return (''', '''function rC() {
  var e = [];
  if (sdFatOn("fatArms") || sdFatOn("fatBack")) return "";
  return (''')
rep('''                                      rN()
                                        ? " Fat distribution: " +''', '''                                      rN() &&
                                      rC()
                                        ? " Fat distribution: " +''')
# v128 review: GPT's "Muscles apparents : toutes les zones" says two different things at "Discrets" and "Présents" for the abs
rep('''                "a defined shoulder outline, ",
              )),
          2 === e.thighs &&''', '''                "a defined shoulder outline, ",
              )),
          (r = r
            .replace("a soft outline of the abdominal muscles", SD_ABS_GPT.subtle)
            .replace("a visible outline of the abdominal muscles", SD_ABS_GPT.clear)),
          2 === e.thighs &&''')
# v128 review: belly fat from "Visible" up: GPT's abdomen line is the one written for it (sdAbs), not a flat or low-fat stomach
rep('''    "auto" !== r &&
      n.push(
        "Abdomen: " +
          (a''', '''    "auto" !== r &&
      n.push(
        sdFatOn("fatBelly") >= 2 ? sdAbs().slice(0, -1) + ", visible wherever the skin there is uncovered" : "Abdomen: " +
          (a''')
FATHINT = "Gras sous la peau de cette zone, en plus des muscles : dès « Visible », les muscles apparents de la zone se lisent en formes douces sous le gras. Ajoute un peu au poids du prompt (corpulence mince ou moyenne). Masqué en corpulence Forte, qui décrit déjà le gras de chaque zone."
FB = '{ t: "bins", k: "%s", l: "%s", hint: "' + FATHINT + '", show: function () { return 4 !== +e.fat; } },'
rep('''          k: "defBack",
          l: "Muscles apparents : dos et trapèzes",
          o: "defZone",
        },
        { t: "chips", k: "biceps", l: "Biceps et triceps" },''', '''          k: "defBack",
          l: "Muscles apparents : dos et trapèzes",
          o: "defZone",
        },
        ''' + FB % ("fatBack", "Graisse : dos") + '''
        { t: "chips", k: "biceps", l: "Biceps et triceps" },''')
rep('''          k: "defArms",
          l: "Muscles apparents : bras",
          o: "defZone",
          hint: "« Comme ci-dessus » suit « Muscles apparents : toutes les zones ». Exemple : bras secs et marqués, jambes lisses.",
        },''', '''          k: "defArms",
          l: "Muscles apparents : bras",
          o: "defZone",
          hint: "« Comme ci-dessus » suit « Muscles apparents : toutes les zones ». Exemple : bras secs et marqués, jambes lisses.",
        },
        ''' + FB % ("fatArms", "Graisse : bras") + '''''')
rep('''          k: "defAbs",
          l: "Muscles apparents : abdos",
          o: "defAbsZone",
          hint: "Auto : la netteté propre à la forme choisie au-dessus (carreaux nets, ligne centrale douce) ; sans forme choisie, suit « toutes les zones ». Non, Discrets, Présents, Marqués : imposent la netteté de cette forme.",
        },''', '''          k: "defAbs",
          l: "Muscles apparents : abdos",
          o: "defAbsZone",
          hint: "Auto : la netteté propre à la forme choisie au-dessus (carreaux nets, ligne centrale douce) ; sans forme choisie, suit « toutes les zones ». Non, Discrets, Présents, Marqués : imposent la netteté de cette forme.",
        },
        ''' + FB % ("fatBelly", "Graisse : ventre") + '''
        ''' + FB % ("fatFlanks", "Graisse : flancs (poignées d\'amour)") + '''''')
# v128 review: the option texts that call the waist slim follow the fat of the waist (sdOptFix)
rep('''function t1(e, t) {
  return t0(e, t)[2] || "";
}''', '''function t1(e, t) {
  return sdOptFix(e, t0(e, t)[2] || "");
}''')
# P79 v129 (user: dark, light and very light eye shades): the option, its chips under the eye color (adults: not in SD_CHILD_FACE), the eye
# color word through sdEyeTone in every prompt (t7), the shade reset with the random face as the eye color is
rep('''    eyeShape: [
      ["auto", "Auto", ""],''', '''    eyeShade: [
      ["auto", "Auto", ""],
      ["dark", "Foncée", ""],
      ["light", "Claire", ""],
      ["pale", "Très claire", ""],
    ],
    eyeShape: [
      ["auto", "Auto", ""],''')
rep('''          custom: "eyeColorCustom",
          ph: "autre, en anglais : ex. pale grey, heterochromia (her left eye blue, her right eye brown)",
        },''', '''          custom: "eyeColorCustom",
          ph: "autre, en anglais : ex. pale grey, heterochromia (her left eye blue, her right eye brown)",
        },
        {
          t: "chips",
          k: "eyeShade",
          l: "Teinte des yeux",
          hint: "Foncée, Claire ou Très claire, sur la couleur choisie. Très claire en bleu ou en gris : des yeux si pâles qu'ils paraissent presque blancs à la lumière, avec un fin cercle plus foncé autour de l'iris et une pupille nette, pour qu'ils restent des yeux. Sans effet avec une couleur écrite à la main ; « Marron foncé » garde sa teinte avec Claire et Très claire.",
        },''')
rep('''function t7(t) {
  return t5(e[t + "Custom"]) || t1(t, e[t]);
}''', '''function t7(t) {
  return t5(e[t + "Custom"]) || ("eyeColor" === t ? sdEyeTone(t1(t, e[t])) : t1(t, e[t]));
}''')
rep('''      (n.eyeColorCustom = ""),
      (n.eyeColor =''', '''      (n.eyeColorCustom = ""),
      (n.eyeShade = "auto"),
      (n.eyeColor =''')
# P80 v129 (user: body hair for men on the legs, arms or chest; beards from two days to three months, moustache and more; hair loss for
# men): the options, the UI (body hair after "Cellulite", men; hair loss after "Coiffure", men, not with "Chauve"; facial hair options), the
# hair loss in every hair description (ne), body hair in GPT's skin lines; "stubble" said "three-day stubble" next to the new "2 jours"
rep('''    fatLower: [
      [0, "Aucune", ""],''', '''    bodyHairChest: [[0, "Auto", ""], [1, "Légers", ""], [2, "Moyens", ""], [3, "Fournis", ""], [4, "Très fournis", ""]],
    bodyHairArms: [[0, "Auto", ""], [1, "Légers", ""], [2, "Moyens", ""], [3, "Fournis", ""], [4, "Très fournis", ""]],
    bodyHairLegs: [[0, "Auto", ""], [1, "Légers", ""], [2, "Moyens", ""], [3, "Fournis", ""], [4, "Très fournis", ""]],
    hairLoss: [[0, "Aucune", ""], [1, "Légère", ""], [2, "Visible", ""], [3, "Marquée", ""], [4, "Très marquée", ""]],
    fatLower: [
      [0, "Aucune", ""],''')
rep('''      ["stubble", "3 jours", "stubble"],
      ["short", "Barbe courte", "short beard"],
      ["long", "Barbe longue", "long beard"],
      ["mustache", "Moustache", "moustache"],
      ["goatee", "Bouc", "goatee"],''', '''      ["stubble2", "2 jours", "light two-day stubble"],
      ["stubble", "3 jours", "three-day stubble"],
      ["week", "1 semaine", "a one-week beard, short and even, the skin still showing through it"],
      ["short", "Barbe courte (1 mois)", "short beard"],
      ["full", "Barbe fournie (3 mois)", "a full, thick beard of about three months, rounded below the chin"],
      ["long", "Barbe longue (6 mois et plus)", "long beard"],
      ["mustache", "Moustache", "moustache"],
      ["goatee", "Bouc", "goatee"],
      ["mustgoatee", "Moustache et bouc", "a moustache and a goatee, the cheeks shaved"],
      ["chinstrap", "Barbe collier", "a short beard along the jawline and the chin, no moustache"],''')
rep('''          hint: "Texture de peau sur les cuisses et les fessiers, visible seulement là où la peau est découverte.",
        },''', '''          hint: "Texture de peau sur les cuisses et les fessiers, visible seulement là où la peau est découverte.",
        },
        { t: "bins", k: "bodyHairChest", l: "Poils : torse", hint: HAIRHINT, show: function () { return "m" === e.pres && !e.child; } },
        { t: "bins", k: "bodyHairArms", l: "Poils : bras", hint: HAIRHINT, show: function () { return "m" === e.pres && !e.child; } },
        { t: "bins", k: "bodyHairLegs", l: "Poils : jambes", hint: HAIRHINT, show: function () { return "m" === e.pres && !e.child; } },'''.replace("HAIRHINT", '"Poils de cette zone, de la couleur des cheveux, visibles là où la peau est découverte, identiques dans les quatre vues. Auto : des poils fins et discrets, comme avant. Hommes adultes."'))
rep('''        { t: "chips", k: "hairStyleSel", l: "Coiffure" },''', '''        { t: "chips", k: "hairStyleSel", l: "Coiffure" },
        {
          t: "bins",
          k: "hairLoss",
          l: "Calvitie",
          show: function () {
            return "m" === e.pres && !e.child && !e.photo && SD_LOSS_OFF.indexOf(e.hairStyleSel) < 0;
          },
          hint: "Calvitie masculine, par étapes : Légère, les tempes reculent un peu ; Visible, golfes profonds aux tempes ; Marquée, le sommet s'éclaircit aussi, le cuir chevelu se voit ; Très marquée, chauve sur le dessus, une couronne de cheveux sur les côtés et l'arrière. Remplace « Dégarni ». Masquée avec Chauve, Crête, Undercut, Frange et les styles tressés ou locks. Hommes adultes.",
        },''')
rep('''          "loose" !== n && (t += " " + t1("hairStyleSel", n)),''', '''          "loose" !== n && !("receding" === n && sdHairLossLv()) && (t += " " + t1("hairStyleSel", n)),''')
rep('''    t5(e.hairStyle) && (t += ", " + t5(e.hairStyle)),
    t
  );
}
function nt() {''', '''    "bald" !== n && sdHairLoss() && (t += ", " + sdHairLoss()),
    t5(e.hairStyle) && (t += ", " + t5(e.hairStyle)),
    t
  );
}
function nt() {''')
rep('''                                    (rR() && !n ? "; " + rR() : "") +
                                    ".",''', '''                                    (rR() && !n ? "; " + rR() : "") +
                                    (sdBodyHair() ? "; " + sdBodyHair() : "") +
                                    ".",''')
rep('''      ? "; the same natural, matte texture over the whole body, the torso and arms as much as the legs: fine pores and faint body hair" +''', '''      ? "; the same natural, matte texture over the whole body, the torso and arms as much as the legs: fine pores" + (sdBodyHair() ? "" : " and faint body hair") +''')
rep('''      ? " Skin: the same natural, matte texture over the whole body, the torso and arms as much as the legs: fine pores and faint body hair" +
        (e.imperf >= 1 ? ", with small natural marks" : "") +
        "; no oiled, glossy or airbrushed skin."
      : "")''', '''      ? " Skin: the same natural, matte texture over the whole body, the torso and arms as much as the legs: fine pores" + (sdBodyHair() ? "" : " and faint body hair") +
        (e.imperf >= 1 ? ", with small natural marks" : "") +
        "; no oiled, glossy or airbrushed skin."
      : "") +
    (sdBodyHair() ? " " + t6(sdBodyHair()) + "." : "")''')
# P81 v130 (users requests): the sex in the header next to the type (person: Femme, Homme, Androgyne; child and baby: Fille, Garçon), always
# visible; GPT's "Ordinaire" said with what it shows (GPT drew it as "Beau"); freckles set by hand (option, chips after "Imperfections",
# the body detail of GPT)
rep('''                              ["animal", "Animal"],
                              ["object", "Objet"],
                            ],
                          }),''', '''                              ["animal", "Animal"],
                              ["object", "Objet"],
                            ],
                          }),
                          "person" === t.mode &&
                            (0, l.jsx)(ab, {
                              label: "Sexe",
                              value: sdChild(t) ? t.childSex || "f" : t.pres,
                              onChange: (e) => g(sdChild(t) ? "childSex" : "pres", e),
                              options: sdChild(t)
                                ? [
                                    ["f", "Fille"],
                                    ["m", "Garçon"],
                                  ]
                                : [
                                    ["f", "Femme"],
                                    ["m", "Homme"],
                                    ["x", "Androgyne"],
                                  ],
                            }),''')
# (v130's own GPT "Ordinaire" sentence in rc is not ported: this repository's recalibrated "Ordinaire", P32 and sdGptPost, stays)
rep('''    fatLower: [
      [0, "Aucune", ""],''', '''    freckles: [
      ["auto", "Auto", ""],
      ["none", "Aucune", ""],
      ["few", "Un peu", ""],
      ["some", "Moyennement", ""],
      ["many", "Beaucoup", ""],
      ["lots", "Énormément", ""],
    ],
    fatLower: [
      [0, "Aucune", ""],''')
rep('''          hint: "Peau, asymétrie, cernes : ce qui rend un visage réel. « Naturelles » est le bon point de départ.",
        },''', '''          hint: "Peau, asymétrie, cernes : ce qui rend un visage réel. « Naturelles » est le bon point de départ.",
        },
        {
          t: "chips",
          k: "freckles",
          l: "Taches de rousseur",
          hint: "Auto : tirées au hasard avec les autres signes. Aucune, Un peu, Moyennement, Beaucoup, Énormément : imposées sur le visage, dans les deux moteurs (Énormément : aussi le cou et les épaules). Adultes.",
        },''')
rep('''                                          "a cluster of faint freckles on both shoulders",''', '''                                          "none" === sdFreckleLv() ? "a small mole on the left shoulder" : "a cluster of faint freckles on both shoulders",''')
# P82 v130 (GPT audit of v129, each point checked before the fix): the face signature leaves out the free outfit line too (a change of
# trousers said "the face has changed"); the light of a body kept from a photo no longer follows hidden muscle settings; the hip text
# drops the 0.6 waist-to-hip ratio and the width ratio with a wide waist; body hair at 0 is "Auto" (faint body hair, as before), not
# "Aucuns"
rep('''      return !/^(Clothing at the bottom edge|Bare neck|Worn on the head and face|Current state|No text)/.test(''', '''      return !/^(Clothing at the bottom edge|Clothing and accessories of this outfit|Bare neck|Worn on the head and face|Current state|No text)/.test(''')
rep('''                        ((l =
                          !o &&
                          (rA().some(''', '''                        ((l =
                          !o &&
                          !(e.photo && e.bodyAsIs) &&
                          (rA().some(''')
rep('''    "m" !== e.pres &&
      e.hips >= 3 &&
      n >= 1 &&
      (t +=''', '''    "m" !== e.pres &&
      e.hips >= 3 &&
      n >= 1 &&
      e.waist <= 2 &&
      (t +=''')
rep('''    e.waist >= e.hips &&
      e.hips >= 3 &&
      (t = t
        .replace(", clearly wider than the waist", "")
        .replace(", much wider than the waist", "")),''', '''    e.waist >= e.hips &&
      e.hips >= 3 &&
      (t = t
        .replace(", clearly wider than the waist", "")
        .replace(", much wider than the waist", "")),
    "m" !== e.pres &&
      e.waist >= 3 &&
      (t = t.replace(", with a waist-to-hip ratio of about 0.6: a dramatic pear shape whose widest point is at", ", their widest point at")),''')
# P83 v130 (user: no fat on the glutes; and fat at the back of the upper arms, the triceps, is very common in women): "Graisse : fessiers"
# (adults, both engines, within the glute size), and the arm fat slider named for the triceps so it is found
rep('''    fatLower: [
      [0, "Aucune", ""],''', '''    fatGlutes: [
      [0, "Aucune", ""],
      [1, "Légère", "a thin layer of soft fat on the glutes, within the glute size set above"],
      [2, "Visible", "soft glutes with a light padding of fat and a soft crease under each, within the glute size set above"],
      [3, "Marquée", "clearly soft, padded glutes with a deeper crease under each and a slight sag, within the glute size set above"],
      [4, "Très marquée", "heavy, soft glutes with a lot of fat, sagging over a deep crease at the top of the thighs, within the glute size set above"],
    ],
    fatLower: [
      [0, "Aucune", ""],''')
rep('''{ t: "bins", k: "fatArms", l: "Graisse : bras", ''', '''{ t: "bins", k: "fatArms", l: "Graisse : bras (arrière, triceps)", ''')
rep('''Tombants : le bas retombe sur le pli, avec un bourrelet juste dessous (« banana roll »).",
        },''', '''Tombants : le bas retombe sur le pli, avec un bourrelet juste dessous (« banana roll »).",
        },
        { t: "bins", k: "fatGlutes", l: "Graisse : fessiers", hint: "Gras doux sur les fessiers, dans le volume réglé par « Fessiers : volume » : il ne les grossit pas. Masqué en corpulence Forte, qui décrit déjà le gras de chaque zone.", show: function () { return 4 !== +e.fat; } },''')
# P84 v130 (review and user): GPT's "Ordinaire" without the street (it is also the body prompt's and the 2D/3D prompts'); the header
# "Sexe" hidden where the Corps tab hides "Présentation" (photo only, photo with the body kept and no reference outfit)
rep('''                          "person" === t.mode &&
                            (0, l.jsx)(ab, {
                              label: "Sexe",''', '''                          "person" === t.mode &&
                            !(t.photo && (t.photoOnly || (t.bodyAsIs && !t.bodyRef))) &&
                            (0, l.jsx)(ab, {
                              label: "Sexe",''')
# P85 v131 (user: at the top of "Épaules" the shoulders and the back hardly change, the deltoids should be very developed; pectorals for
# women; a real audit of the upper body): "Deltoïdes" and "Dorsaux" (sizes, adults, both engines; Auto follows "Musculature" from
# "Forte" up), "Pectoraux (muscles)" for a woman or an androgynous person, with their sharpness ("Muscles apparents : pectoraux"); the
# shoulders of both GPT build lines through sdShoulders, the width across the deltoids as a multiple of the hip width (sdShoulderRatio);
# a woman's chest text through sdPecsBust; the GPT texts that ruled out her pectorals or called the muscles small only when nothing
# says otherwise; GPT's drawn body details through the Seedream map (sdDetailMap)
rep('''    makeupF: [
      ["auto", "Auto", ""],''', '''    delts: [
      ["auto", "Auto", ""],
      ["small", "Discrets", ""],
      ["medium", "Moyens", ""],
      ["big", "Développés", ""],
      ["huge", "Massifs", ""],
    ],
    lats: [
      ["auto", "Auto", ""],
      ["flat", "Plats", ""],
      ["medium", "Moyens", ""],
      ["big", "Larges", ""],
      ["huge", "Très larges", ""],
    ],
    pecsF: [
      ["auto", "Auto", ""],
      ["small", "Discrets", ""],
      ["medium", "Visibles", ""],
      ["big", "Développés", ""],
      ["huge", "Très développés", ""],
    ],
    makeupF: [
      ["auto", "Auto", ""],''')
rep('''        { t: "bins", k: "shoulders", l: "Épaules" },''', '''        {
          t: "bins",
          k: "shoulders",
          l: "Épaules",
          hint: "Largeur de la carrure. Le volume des muscles se règle dans « Deltoïdes » et « Dorsaux ». À partir de « Larges », quand les épaules dépassent les hanches, le prompt donne la largeur aux deltoïdes en multiple de celle des hanches.",
        },
        {
          t: "chips",
          k: "delts",
          l: "Deltoïdes",
          hint: "Volume des muscles de l'épaule, en plus de la largeur. Auto : rien de plus jusqu'à « Athlétique », développés en Musculature « Forte » (moyens en corpulence Mince ou Très mince), massifs en « Culturiste ». La netteté se règle dans « Muscles apparents : épaules ».",
        },''')
rep('''        { t: "chips", k: "traps", l: "Trapèzes" },''', '''        { t: "chips", k: "traps", l: "Trapèzes" },
        {
          t: "chips",
          k: "lats",
          l: "Dorsaux (largeur du dos)",
          hint: "Largeur du dos sous les aisselles, la forme en V. Auto : comme les deltoïdes. Avec une taille large ou des flancs gras, pas de V jusqu'à la taille. La netteté se règle dans « Muscles apparents : dos et trapèzes ».",
        },''')
rep('''          o: function () {
            return "m" === e.pres ? "pecs" : "bust";
          },
        },''', '''          o: function () {
            return "m" === e.pres ? "pecs" : "bust";
          },
        },
        {
          t: "chips",
          k: "pecsF",
          l: "Pectoraux (muscles)",
          show: function () {
            return "m" !== e.pres;
          },
          hint: "Pour une femme musclée. Auto : rien avec une poitrine ; avec une poitrine « Très menue », visibles ou développés en Musculature « Forte », très développés en « Culturiste ». Avec une poitrine, ils raffermissent le haut du buste au-dessus d'elle, la poitrine reste souple. Leur netteté : « Muscles apparents : pectoraux ».",
        },''')
rep('''          l: "Muscles apparents : pectoraux",
          o: "defZone",
          show: function () {
            return "m" === e.pres;
          },''', '''          l: "Muscles apparents : pectoraux",
          o: "defZone",
          show: function () {
            return "m" === e.pres || !!sdPecsF();
          },''')
# GPT, body with the head (rv): the shoulders, the deltoids and the lats; the width across the deltoids
rep('''    t6(t1("shoulders", e.shoulders)) +
    ", " +
    nD() +
    ", " +
    rx() +
    ", " +
    rk() +
    ", " +
    ry() +
    ", " +''', '''    t6(sdShoulders()) +
    sdSep() +
    sdPecsBust(nD()) +
    sdSep() +
    rx() +
    sdSep() +
    rk() +
    sdSep() +
    ry() +
    sdSep() +''')
rep('''      : e.shoulders > e.hips
        ? "the shoulders are wider than the hips"
        : "the shoulders and hips are about the same width") +''', '''      : e.shoulders > e.hips
        ? sdShoulderRatio()
          ? "across the deltoids, the shoulders are about " + sdShoulderRatio() + " times the hip width in the front view"
          : "the shoulders are wider than the hips"
        : "the shoulders and hips are about the same width") +''')
# GPT, numbered body lines
rep('''                                      t1("shoulders", e.shoulders) +''', '''                                      sdShoulders() +''')
rep('''                                      : e.shoulders > e.hips
                                        ? "the shoulders are wider than the hips"''', '''                                      : e.shoulders > e.hips
                                        ? sdShoulderRatio()
                                          ? "across the deltoids, the shoulders are about " + sdShoulderRatio() + " times the hip width in the front view"
                                          : "the shoulders are wider than the hips"''')
# GPT chest text: a woman's pectorals when set, after the bust shape (numbered line); the bust shape texts that call the upper chest flat
# or emptied, and the side-view check, say it firm with muscle then (review)
rep('''                                      nD() +
                                      (rL() ? " (" + rL() + ")" : "") +''', '''                                      sdPecsBust(nD() + (rL() ? " (" + rL() + ")" : "")) +''')
rep('''function rL() {
  if (!("m" !== e.pres && e.chest >= 1 && "auto" !== e.bustShape)) return "";''', '''function rL() {
  return sdPecsUp(rL0());
}
function rL0() {
  if (!("m" !== e.pres && e.chest >= 1 && "auto" !== e.bustShape)) return "";''')
rep('''"the chest flat just below the collarbones, then the front sloping down''', '''(sdPecsF() ? "the chest flat and muscular" : "the chest flat") + " just below the collarbones, then the front sloping down''')
# the build words of a slight or narrow body, or a runner's, go with big deltoids or lats (both engines)
rep('''function n_() {
  return sdForteBuild(nP[e.fat][e.muscle]);
}''', '''function n_() {
  return sdBuildFix(sdForteBuild(nP[e.fat][e.muscle]));
}''')
rep('''". The definition is sharper, not bigger: the muscles keep the size set by the build and by the arm and shoulder settings"''', '''". The definition is sharper, not bigger: the muscles keep the size set by the build and by the " + (sdMusLv("lats") || sdPecsF() ? "arm, shoulder, back and chest" : "arm and shoulder") + " settings"''')
rep('''  return ["defArms", "defLegs", "defShoulders", "defBack", "defAbs"].concat(
    "m" === e.pres ? ["defChest"] : [],''', '''  return ["defArms", "defLegs", "defShoulders", "defBack", "defAbs"].concat(
    "m" === e.pres || sdPecsF() ? ["defChest"] : [],''')
rep('''          "m" === e.pres &&
            "dadbod" !== e.absStyle &&
            n.push(
              {
                none: "no visible chest muscle definition",''', '''          ("m" === e.pres || (sdPecsF() && "none" !== rP("defChest"))) &&
            "dadbod" !== e.absStyle &&
            n.push(
              {
                none: "no visible chest muscle definition",''')
rep('''  ("m" !== e.pres &&
    e.chest >= 1 &&
    n.some(function (e) {
      return "none" !== e;
    }) &&''', '''  ("m" !== e.pres &&
    e.chest >= 1 &&
    !sdPecsF() &&
    n.some(function (e) {
      return "none" !== e;
    }) &&''')
rep('''    a("strong") &&
      e.muscle <= 2 &&
      e.fat <= 2 &&
      "auto" === e.biceps &&
      "auto" === e.traps &&''', '''    a("strong") &&
      e.muscle <= 2 &&
      e.fat <= 2 &&
      "auto" === e.biceps &&
      "auto" === e.traps &&
      !sdMusBig() &&''')
rep('''                                    "Individual body details that make this body unique, kept identical in all four views: " +
                                      (4 === e.fat ? a.map(sdForteDetail) : a).join(", ") +''', '''                                    "Individual body details that make this body unique, kept identical in all four views: " +
                                      sdDetailMap(a).join(", ") +''')
# P86 v132 (user, the v131 renders audited: deltoids sharper but hardly wider, a small bust on "Très menue"; "oui, fais-le"): the upper
# body retouch (sdGrowUpOn, sdGrowUpPrompt, its rows and steps in seedream_new.js), right after card 2b, numbered 2c (2b without it),
# with its copy message and the step count
rep('''                                    !sdX && sdGrowOn(t) && B("grow", "2b", "Retouche : hanches et fessiers"),''', '''                                    !sdX && sdGrowOn(t) && B("grow", "2b", "Retouche : hanches et fessiers"),
                                    !sdX && sdGrowUpOn(t) && B("growUp", sdGrowOn(t) ? "2c" : "2b", "Retouche : haut du corps"),''')
rep('''                ? sdGrowOn(t) ? "Tes quatre étapes, dans l'ordre" : "Tes trois étapes, dans l'ordre"''', '''                ? ["Tes trois étapes, dans l'ordre", "Tes quatre étapes, dans l'ordre", "Tes cinq étapes, dans l'ordre"][(sdGrowOn(t) ? 1 : 0) + (sdGrowUpOn(t) ? 1 : 0)]''')
rep('''"iter" === t ? sdIterCopyMsg(e) : "grow" === t ? sdGrowCopyMsg(e) : sdSrcCopyMsg(e);''', '''"iter" === t ? sdIterCopyMsg(e) : "grow" === t || "growUp" === t ? sdGrowCopyMsg(e) : sdSrcCopyMsg(e);''')
# P87 v133 (user: in the app's preview "Importer" did nothing, "Exporter" worked): the import confirmed in the page (sdIoPending,
# sdIoApply in seedream_new.js) and applied through the start-up loader ac, which now takes the imported settings, with no reload
rep('''function ac() {
  try {''', '''function ac(src) {
  try {''')
rep('''      })(JSON.parse(localStorage.getItem(au) || "{}") || {}),''', '''      })(src ? JSON.parse(JSON.stringify(src)) : JSON.parse(localStorage.getItem(au) || "{}") || {}),''')
rep('''                  sdIoButtons(t, h),''', '''                  sdIoButtons(t, h, n),''')
# P88 v134 (user: "pour tombante il faut un curseur très tombante pour vraiment exagérer, une poitrine gant de toilette qui tombe sur le
# ventre, c'est un vrai défaut"): "Chute de la poitrine" (bustDrop: std, very) under "Forme de la poitrine", shown only with "Tombante"
# chosen by hand (sdDropOn); the texts in seedream_new.js (sdDropSd, sdDropGpt)
rep('''    glutesShape: "auto",\n    eyeShade: "auto",''', '''    glutesShape: "auto",\n    bustDrop: "std",\n    eyeShade: "auto",''')
rep('''    pecsF: [\n      ["auto", "Auto", ""],''', '''    bustDrop: [\n      ["std", "Tombante", ""],\n      ["very", "Très tombante", ""],\n    ],\n    pecsF: [\n      ["auto", "Auto", ""],''')
rep('''          },\n        },\n        { t: "bins", k: "waist", l: "Tour de taille" },''', '''          },\n        },\n        {\n          t: "chips",\n          k: "bustDrop",\n          l: "Chute de la poitrine",\n          show: function () {\n            return sdDropOn();\n          },\n          hint: "« Très tombante » : un vrai défaut, exagéré exprès : la poitrine vidée en haut, le volume tombé en bas, le mamelon au point le plus bas. Plus la poitrine est grosse, plus elle descend : sous le pli en « Menue », au bas des côtes en « Moyenne », contre le haut du ventre en « Assez généreuse », sur le ventre en « Généreuse », au nombril en « Très généreuse ». Avec le tanga, le haut ample remplace le triangle. Seulement avec « Tombante » choisi à la main.",\n        },\n        { t: "bins", k: "waist", l: "Tour de taille" },''')
# P89 v134 (user: "on doit pouvoir ajouter en plus asymétrique ou non"; "Non / Oui"): "Asymétrie de la poitrine" (bustAsym: no, yes) with
# every shape; GPT's shape line also with an Auto shape left as it is (a "Menue" bust); the texts in seedream_new.js (sdAsymOn, sdAsymGpt)
rep('''    bustDrop: "std",\n''', '''    bustDrop: "std",\n    bustAsym: "no",\n''')
rep('''    bustDrop: [\n''', '''    bustAsym: [\n      ["no", "Non", ""],\n      ["yes", "Oui", ""],\n    ],\n    bustDrop: [\n''')
rep('''Seulement avec « Tombante » choisi à la main.",\n        },\n''', '''Seulement avec « Tombante » choisi à la main.",\n        },\n        {\n          t: "chips",\n          k: "bustAsym",\n          l: "Asymétrie de la poitrine",\n          show: function () {\n            return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1 && "asym" !== e.bustShape;\n          },\n          hint: "« Oui » : le côté gauche nettement plus plein et un peu plus bas que le droit, dans chaque vue, avec n'importe quelle forme, « Très tombante » comprise. La plupart des poitrines réelles sont un peu asymétriques : « Oui » rend la différence visible sur le rendu.",\n        },\n''')
rep('''function rL0() {\n  if (!("m" !== e.pres && e.chest >= 1 && "auto" !== e.bustShape)) return "";''', '''function rL0() {\n  if (!("m" !== e.pres && e.chest >= 1 && ("auto" !== e.bustShape || sdAsymOn()))) return "";''')
# P90 v134 (user: "j'ai marqué nez fin, c'est tout sauf un nez fin, pareil pour la bouche, ou alors il faut ajouter nez et bouche très fins";
# and "ajoute un bouton dans Signes : lunettes de vue, avec différents styles et un Auto qui s'adapte en fonction de l'âge"): the nose and
# lips of the shared head line with their landmarks (sdNoseLm, sdLipsLm), "Très fin" and "Très fines"; "Lunettes de vue" (specs) in
# Signes, in the marks line (sdSpecs), never on a headless sheet
rep('''      a ? a + " nose" : "",\n      t1("lips", e.lips),''', '''      a ? a + " nose" + sdNoseLm() : "",\n      sdLipsLm(t1("lips", e.lips)),''')
rep('''    noseW: [\n      ["auto", "Auto", ""],\n      ["narrow", "Fin", "narrow"],''', '''    noseW: [\n      ["auto", "Auto", ""],\n      ["xnarrow", "Très fin", "very narrow"],\n      ["narrow", "Fin", "narrow"],''')
rep('''    lips: [\n      ["auto", "Auto", ""],\n      ["thin", "Fines", "thin lips"],''', '''    lips: [\n      ["auto", "Auto", ""],\n      ["xthin", "Très fines", "very thin lips"],\n      ["thin", "Fines", "thin lips"],''')
rep('''    bustDrop: [\n''', '''    specs: [\n      ["none", "Aucune", ""],\n      ["auto", "Auto (âge)", ""],\n      ["rect", "Rectangulaires fines", ""],\n      ["round", "Rondes en métal", ""],\n      ["square", "Carrées en écaille", ""],\n      ["cat", "Œil-de-chat", ""],\n      ["half", "Demi-cerclées", ""],\n      ["rimless", "Sans monture", ""],\n      ["big", "Épaisses noires", ""],\n    ],\n    bustDrop: [\n''')
rep('''    bustDrop: "std",\n''', '''    bustDrop: "std",\n    specs: "none",\n''')
rep('''        {\n          t: "area",\n          k: "marks",\n          l: "Autres signes distinctifs",''', '''        {\n          t: "chips",\n          k: "specs",\n          l: "Lunettes de vue",\n          show: function () {\n            return "person" === e.mode && !sdChild(e);\n          },\n          hint: "Sur la planche tête et sur une planche corps avec la tête, jamais sur une planche sans tête. Auto : un style selon l'âge (rondes en métal ou carrées en écaille avant 30 ans, rectangulaires fines ou carrées de 30 à 49 ans, demi-cerclées ou rectangulaires de 50 à 64 ans, sans monture ou demi-cerclées à partir de 65 ans), tiré avec le visage. Ne coche pas aussi « Lunettes » dans les accessoires de la tenue.",\n        },\n        {\n          t: "area",\n          k: "marks",\n          l: "Autres signes distinctifs",''')
rep('''    t5(e.marks) && n.push(t5(e.marks)),\n    n.join("; ")''', '''    (t || !nw()) && sdSpecs() && n.push(sdSpecs()),\n    t5(e.marks) && (t || !nw() ? n.push(t5(e.marks)) : sdBodyMarks(t5(e.marks)) && n.push(sdBodyMarks(t5(e.marks)))),\n    n.join("; ")''')
# P91 v134 review and user: the outfit accessory "Lunettes" or "Lunettes de soleil" not said next to "Lunettes de vue" (head, body with the
# head, and the "Remove" list of a GPT head update); GPT's "Plat, lisse" stomach with the abs visibility set by hand (sdFlatAbs)
rep('''      return (e.accSel || []).indexOf(t[0]) >= 0 && nO.indexOf(t[0]) >= 0;''', '''      return (e.accSel || []).indexOf(t[0]) >= 0 && nO.indexOf(t[0]) >= 0 && !(sdSpecsKey() && ("glasses" === t[0] || "sunglasses" === t[0]));''')
rep('''  ((nw() || sdChildHl(e)) &&\n    (u = u.filter(function (e) {''', '''  sdSpecsKey() &&\n    (u = u.filter(function (x) {\n      return "glasses" !== x && "sunglasses" !== x;\n    }));\n  ((nw() || sdChildHl(e)) &&\n    (u = u.filter(function (e) {''')
rep('''        return e && n.indexOf(e) === t && 0 > a.indexOf(e);''', '''        return e && n.indexOf(e) === t && 0 > a.indexOf(e) && !(sdSpecsKey() && "glasses" === e);''')
rep('''            : t1("absStyle", r)) +''', '''            : sdFlatAbs() || t1("absStyle", r)) +''')
# P92 v135 (user, a slim body with "Hanches : Étroites" and big or "Très bombés" glutes: "narrow hips" then "the extra width is in the
# hips and glutes"): GPT's thigh clause names where the extra width really is (sdExtraWho)
rep('''      ? "the extra width is in the hips and glutes only: the thighs below them stay " +''', '''      ? "the extra width is in the " + sdExtraWho() + " only: the thighs below them stay " +''')
rep('''                                          ? "; the extra width is in the hips" +
                                            (rM()
                                              ? ", the glutes and the outer upper thighs only, the rest of the thighs stay "
                                              : " and glutes only, the thighs below them stay ") +''', '''                                          ? "; the extra width is in the " +
                                            (rM()
                                              ? ("outer upper thighs" === sdExtraWho() ? "outer upper thighs" : ("glutes" === sdExtraWho() ? "glutes" : "hips" === sdExtraWho() ? "hips" : "hips, the glutes") + " and the outer upper thighs") + " only, the rest of the thighs stay "
                                              : sdExtraWho() + " only, the thighs below them stay ") +''')
# P93 v137 (user: "ajouter un nouvel onglet lieu, et mettre maison, intérieur et extérieur dedans ; on doit pouvoir désigner un lieu comme
# on peut et le dire sans cliquer pour éviter les blocages, ensuite il peut y avoir des boutons pour aider à la création"; his choice: the
# helper buttons write into the text): "Lieu" in the type row (the mode "object" with a place, sdPlaceMode), "Extérieur" (exterior) next
# to the house and the interior, the description first, the helpers (sdPlaceHelp) below the type; the place prompts say the outdoor
# location where they said the house or the room
rep("""      ["interior", "Intérieur", "interior room"],
    ],""", """      ["interior", "Intérieur", "interior room"],
      ["exterior", "Extérieur", "outdoor location"],
    ],""")
rep("""function n9() {
  return "house" === e.objCat || "interior" === e.objCat;
}""", """function n9() {
  return sdPlaceCat(e.objCat);
}""")
rep("""                            value: sdChild(t) ? (t.baby ? "baby" : "child") : t.mode,
                            onChange: (e) =>
                              n((t) =>
                                sdChildMode(e, t, function (e, t) {""", """                            value: sdChild(t) ? (t.baby ? "baby" : "child") : sdIsPlace(t) ? "place" : t.mode,
                            onChange: (e) =>
                              n((t) =>
                                sdPlaceMode(e, t, function (e, t) {""")
rep("""                              ["animal", "Animal"],
                              ["object", "Objet"],
                            ],
                          }),
                          "person" === t.mode &&""", """                              ["animal", "Animal"],
                              ["object", "Objet"],
                              ["place", "Lieu"],
                            ],
                          }),
                          "person" === t.mode &&""")
rep("""  t3 = [
    {
      id: "objet",
      label: "Objet",
      items: [
        {
          t: "chips",
          k: "objCat",
          l: "Catégorie",
          hint: "Règle la présentation : véhicule posé sur ses roues, vêtement sur mannequin invisible, objet seul comme en photo produit. Maison et Intérieur donnent des vues de repérage de lieu, avec jour et nuit dans l'onglet Lumière et ambiance.",
        },""", """  t3 = [
    {
      id: "objet",
      get label() {
        return n9() ? "Lieu" : "Objet";
      },
      items: [
        {
          t: "area",
          k: "objDesc",
          l: "Décris ton lieu",
          show: function () {
            return n9();
          },
          ph: "avec tes mots : ex. une ruelle pavée sous la pluie, vieilles façades, une enseigne de bar éteinte",
          hint: "Dis ton lieu comme tu veux, sans rien cocher : le texte part tel quel dans le prompt (en anglais de préférence). Le type ci-dessous règle les vues ; les aides écrivent dans ce texte.",
        },
        {
          t: "chips",
          k: "objCat",
          get l() {
            return n9() ? "Type de lieu" : "Catégorie";
          },
          get hint() {
            return n9()
              ? "Règle les vues : Maison, un bâtiment entier vu du dehors ; Intérieur, une pièce ; Extérieur, un lieu en plein air (rue, place, quai, forêt, plage…). Jour et nuit dans l'onglet Lumière et ambiance."
              : "Règle la présentation : véhicule posé sur ses roues, vêtement sur mannequin invisible, objet seul comme en photo produit. Maisons, intérieurs et extérieurs : type Lieu, en haut.";
          },
        },
        {
          t: "sdhelp",
          k: "sdPlaceHelp",
          show: function () {
            return n9();
          },
        },""")
rep("""        {
          t: "area",
          k: "objDesc",
          l: "Description",
          ph: "en anglais : ex. compact 1980s hatchback, boxy shape, round headlights",""", """        {
          t: "area",
          k: "objDesc",
          l: "Description",
          show: function () {
            return !n9();
          },
          ph: "en anglais : ex. compact 1980s hatchback, boxy shape, round headlights",""")
rep("""            i = "function" == typeof r.o ? r.o() : r.o || a;
          if ("num" === r.t)""", """            i = "function" == typeof r.o ? r.o() : r.o || a;
          if ("sdhelp" === r.t) return sdPlaceHelp(t, g);
          if ("num" === r.t)""")
rep("""                        "aria-label": y
                          ? "Nom de l'objet"
                          : b""", """                        "aria-label": y
                          ? sdIsPlace(t) ? "Nom du lieu" : "Nom de l'objet"
                          : b""")
rep("""                        placeholder: y ? "Nom de l'objet" : b ? "Nom de l'animal" : "Nom du personnage",""", """                        placeholder: y ? (sdIsPlace(t) ? "Nom du lieu" : "Nom de l'objet") : b ? "Nom de l'animal" : "Nom du personnage",""")
rep("""                                    : "object" === n
                                      ? 0 === r.indexOf("obj")""", """                                    : "object" === n
                                      ? 0 === r.indexOf("obj") && !("objCat" === r && sdIsPlace(e))""")
rep("""                            y
                              ? "Nouvel objet."
                              : b""", """                            y
                              ? sdIsPlace(t) ? "Nouveau lieu." : "Nouvel objet."
                              : b""")
rep("""                        ? y
                          ? "Confirmer : effacer cet objet"
                          : b""", """                        ? y
                          ? sdIsPlace(t) ? "Confirmer : effacer ce lieu" : "Confirmer : effacer cet objet"
                          : b""")
rep("""                        : y
                          ? "Nouvel objet"
                          : b""", """                        : y
                          ? sdIsPlace(t) ? "Nouveau lieu" : "Nouvel objet"
                          : b""")
rep("""                              opts: tZ.objCat,""", """                              opts: sdOpts(t, "objCat"),""")
rep("""          k: "objWeather",
          l: "Météo",
          show: function () {
            return "house" === e.objCat && "grey" !== e.objBg;
          },""", """          k: "objWeather",
          l: "Météo",
          show: function () {
            return ("house" === e.objCat && "grey" !== e.objBg) || "exterior" === e.objCat;
          },""")
rep("""function rr() {
  if (sdHouseGrey()) return sdHouseGreyLight();
  var t = "house" === e.objCat,""", """function rr() {
  return sdExtLightFix(rr0());
}
function rr0() {
  if (sdHouseGrey()) return sdHouseGreyLight();
  var t = "house" === e.objCat || "exterior" === e.objCat,""")
rep("""                            (n
                              ? "house, seen from outside,"
                              : "interior room") +""", """                            (n
                              ? "house, seen from outside,"
                              : sdExt()
                                ? "outdoor location"
                                : "interior room") +""")
rep("""                                (n ? "" : " " + SD_PLACE_FILL) +""", """                                (n ? "" : " " + (sdExt() ? SD_EXT_FILL : SD_PLACE_FILL)) +""")
rep("""                                (n ? "house" : "interior") +
                                (r
                                  ? ": «" + r + "»"
                                  : n
                                    ? t5(e.objFantasy)
                                      ? ": a lived-in house"
                                      : ": a believable, lived-in house"
                                    : t5(e.objFantasy)""", """                                (n ? "house" : sdExt() ? "outdoor location" : "interior") +
                                (r
                                  ? ": «" + r + "»"
                                  : n
                                    ? t5(e.objFantasy)
                                      ? ": a lived-in house"
                                      : ": a believable, lived-in house"
                                    : sdExt()
                                    ? t5(e.objFantasy)
                                      ? ": an outdoor place"
                                      : ": a believable, real-looking outdoor place"
                                    : t5(e.objFantasy)""")
rep("""                              : "architecture, layout, furniture") +""", """                              : sdExt()
                                ? "layout, buildings, vegetation, ground"
                                : "architecture, layout, furniture") +""")
rep("""                      ("house" === e.objCat ? "house" : "interior") +""", """                      ("house" === e.objCat ? "house" : sdExt() ? "outdoor location" : "interior") +""")
# (the camera of "Keep the place in the photo as is", outdoor locations included, is written in P69)
rep("""                        : "Reproduce exactly its architecture, layout, furniture, materials, colors, wear, light and time of day. " +""", """                        : "Reproduce exactly its architecture, layout, " + (sdExt() ? "vegetation" : "furniture") + ", materials, colors, wear, light and time of day. " +""")
rep("""          k: "objSize",
          l: "Taille réelle",
          ph: "facultatif, en anglais : ex. about 3.6 m long and 1.4 m tall",""", """          k: "objSize",
          l: "Taille réelle",
          get ph() {
            return n9() ? "facultatif, en anglais : ex. about 40 m long and 12 m wide" : "facultatif, en anglais : ex. about 3.6 m long and 1.4 m tall";
          },""")
# v137 review: the words of an object said of a place (rules card, the state's hint, the side, the marks, the photo-only category)
rep("""                  (0, l.jsx)(aN, { obj: y, sd: "seedream" === t.model, baby: sdBaby(t), an: b }),""", """                  (0, l.jsx)(aN, { obj: y, sd: "seedream" === t.model, baby: sdBaby(t), an: b, pl: sdIsPlace(t) }),""")
rep("""function aN({ obj: e, sd: sdM, baby: sdBb, an: sdAn }) {""", """function aN({ obj: e, sd: sdM, baby: sdBb, an: sdAn, pl: sdPl }) {""")
rep("""          "Convention de l'outil : fond gris uni, aucun texte ajouté, la même lumière et " +
            (e ? "le même objet" : "le même sujet") +
            " sur chaque vue, rien d'inversé.",""", """          sdPl
            ? "Convention de l'outil : aucun texte ajouté, la même lumière et le même lieu sur chaque vue, rien d'inversé."
            : "Convention de l'outil : fond gris uni, aucun texte ajouté, la même lumière et " +
              (e ? "le même objet" : "le même sujet") +
              " sur chaque vue, rien d'inversé.",""")
rep("""                                                    : y
                                                      ? " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation de l'objet."
""", """                                                    : y
                                                      ? sdIsPlace(t)
                                                        ? " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation du lieu."
                                                        : " Ajouté aux planches créées. Pour une variante, change-le et recopie le prompt dans la conversation de l'objet."
""")
rep("""                                                  "Remplace ce qui est entre crochets. Précise toujours le côté ",
                                                  y
                                                    ? "de l'objet\"""", """                                                  "Remplace ce qui est entre crochets. Précise toujours le côté ",
                                                  y
                                                    ? sdIsPlace(t) ? "du lieu" : "de l'objet\"""")
rep("""          ph: "ex. dent on the left rear door, sticker on the right side of the bumper",
          hint: "Précise toujours le côté de l'objet : gauche ou droit.",""", """          ph: "ex. dent on the left rear door, sticker on the right side of the bumper",
          get hint() {
            return n9() ? "Précise toujours le côté : gauche ou droit, vu depuis la vue principale." : "Précise toujours le côté de l'objet : gauche ou droit.";
          },""")
rep("""                              label: "Catégorie (règle les vues)",
                              opts: sdOpts(t, "objCat"),""", """                              label: sdIsPlace(t) ? "Type de lieu (règle les vues)" : "Catégorie (règle les vues)",
                              opts: sdOpts(t, "objCat"),""")
# P94 v138 (user: "il faut que je puisse avoir la possibilité d'avoir une très grosse poitrine tombante avec un haut de maillot, pas juste
# un bustier ample"): "Haut avec le tanga" (tangaTop: loose, bikini) under the reference outfit with "Très généreuse" (sdBigTopUI), its own
# outfit label; tangaTop kept by the loader and the import (a default in tJ)
rep("""    refCover: "short",""", """    refCover: "short",
    tangaTop: "loose",""")
rep("""                                              t.bodyRef &&
                                                sdCoverNote(t) &&""", """                                              t.bodyRef && sdBigTopUI(t, g),
                                              t.bodyRef &&
                                                sdCoverNote(t) &&""")
rep("""[["tanga", t.chest >= 4 ? "Seedream : haut ample sans manches et tanga coupe brésilienne, pieds nus (remplace le triangle en Très généreuse)" :""", """[["tanga", t.chest >= 4 ? (sdBigTopOn(t) && "bikini" === t.tangaTop ? "Seedream : haut de maillot couvrant et tanga coupe brésilienne, pieds nus" : "Seedream : haut ample sans manches et tanga coupe brésilienne, pieds nus (remplace le triangle en Très généreuse)") :""")
# P95 v139 (user: "un ventre plat mais avec une fente au milieu, de la graisse sur la face avant haute des cuisses, des bourrelets ; tache
# de naissance à ajouter aussi dans le signe avec le lieu : cou, corps, bras, etc."): abs "Plat, sillon au milieu" (groove), "Graisse :
# cuisses (avant)" (fatThighs), "Tache de naissance" in Signes (bmType, bmSize, bmPlace, bmSide; sdBm in seedream_new.js), adults
rep("""    tangaTop: "loose",""", """    tangaTop: "loose",
    fatThighs: 0,
    bmType: "none",
    bmSize: "m",
    bmPlace: "neck",
    bmSide: "left",""")
rep('''    fatLower: [
      [0, "Aucune", ""],''', '''    fatThighs: [
      [0, "Aucune", ""],
      [1, "Légère", "a thin layer of soft fat on the front of the upper thighs, within the thigh size set above"],
      [2, "Visible", "soft fat on the front of the upper thighs, rounding them slightly in profile, with a soft fold at the top along the hip crease, within the thigh size set above"],
      [3, "Marquée", "clearly soft, padded front upper thighs with a soft roll at the top along the hip crease, within the thigh size set above"],
      [4, "Très marquée", "heavy, soft front upper thighs with a thick soft roll at the top along the hip crease, within the thigh size set above"],
    ],
    bmType: [
      ["none", "Aucune", ""],
      ["cal", "Café au lait", ""],
      ["pws", "Tache de vin", ""],
      ["cmn", "Naevus congénital", ""],
    ],
    bmSize: [
      ["s", "Petite (2 cm)", ""],
      ["m", "Moyenne (5 cm)", ""],
      ["l", "Grande (10 cm)", ""],
    ],
    bmPlace: [
      ["forehead", "Front", ""],
      ["temple", "Tempe", ""],
      ["cheek", "Joue", ""],
      ["jaw", "Mâchoire", ""],
      ["neck", "Cou", ""],
      ["nape", "Nuque", ""],
      ["shoulder", "Épaule", ""],
      ["upperarm", "Haut du bras", ""],
      ["forearm", "Avant-bras", ""],
      ["hand", "Main", ""],
      ["chest", "Haut de la poitrine", ""],
      ["upperback", "Haut du dos", ""],
      ["lowerback", "Bas du dos", ""],
      ["belly", "Ventre", ""],
      ["hip", "Hanche", ""],
      ["thigh", "Cuisse", ""],
      ["calf", "Mollet", ""],
    ],
    bmSide: [
      ["left", "Gauche", ""],
      ["right", "Droite", ""],
    ],
    fatLower: [
      [0, "Aucune", ""],''')
rep('''        "a flat, toned stomach with a single vertical groove down the middle, from below the ribs to the navel, softly shadowed, and faint lines at the sides; no horizontal lines and no six-pack: the skin on each side of the groove stays smooth and continuous",
      ],''', '''        "a flat, toned stomach with a single vertical groove down the middle, from below the ribs to the navel, softly shadowed, and faint lines at the sides; no horizontal lines and no six-pack: the skin on each side of the groove stays smooth and continuous",
      ],
      [
        "groove",
        "Plat, sillon au milieu",
        "a flat, soft stomach with a soft vertical groove down the middle, from below the breastbone to the navel, between two slightly fuller sides; no abdominal segments, no horizontal lines and no visible muscle",
      ],''')
rep('''          hint: "« Auto » suit les réglages de musculature et de muscles apparents. Un style choisi remplace leur description du ventre.",''', '''          hint: "« Auto » suit les réglages de musculature et de muscles apparents. Un style choisi remplace leur description du ventre. « Ligne centrale » : un ventre tonique, le sillon dessiné par les muscles. « Plat, sillon au milieu » : un ventre plat et doux, un sillon vertical sans muscle visible ; « Muscles apparents : abdos » ne le change pas.",''')
rep('''          hint: "Indépendant des muscles et des fessiers : des cuisses fortes avec de petits fessiers, ou l'inverse.",
        },''', '''          hint: "Indépendant des muscles et des fessiers : des cuisses fortes avec de petits fessiers, ou l'inverse.",
        },
        { t: "bins", k: "fatThighs", l: "Graisse : cuisses (avant)", hint: "Gras doux sur l'avant du haut des cuisses, dans le volume réglé par « Cuisses » : il ne les grossit pas. Dès « Visible », un pli doux en haut de la cuisse, au pli de l'aine ; dès « Marquée », un bourrelet. Les autres bourrelets : « Graisse : ventre », « Graisse : flancs (poignées d'amour) », « Graisse : dos ». Masqué en corpulence Forte, qui décrit déjà le gras de chaque zone.", show: function () { return 4 !== +e.fat; } },''')
rep('''          ph: "ex. freckles, wave tattoo on the right forearm, mole above the left lip",
          hint: "Précise toujours le côté : gauche ou droit du personnage. En anglais de préférence : le texte part tel quel dans un prompt rédigé en anglais.",
        },''', '''          ph: "ex. freckles, wave tattoo on the right forearm, mole above the left lip",
          hint: "Précise toujours le côté : gauche ou droit du personnage. En anglais de préférence : le texte part tel quel dans un prompt rédigé en anglais.",
        },
        {
          t: "chips",
          k: "bmType",
          l: "Tache de naissance",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Café au lait : plate, brun clair uni, ronde à ovale, bord net. Tache de vin : plate, rouge vin à violacée, bord net et irrégulier. Naevus congénital : brun moyen avec quelques points plus foncés, un peu en relief, surface légèrement bosselée. Visage et cou : planche tête et planche corps avec la tête (une planche sans tête commence à la base du cou) ; reste du corps : planches corps, visible là où la peau est découverte. Deux moteurs, adultes.",
        },
        {
          t: "chips",
          k: "bmSize",
          l: "Tache de naissance : taille",
          show: function () {
            return "person" === e.mode && !sdChild(e) && "none" !== e.bmType;
          },
        },
        {
          t: "chips",
          k: "bmPlace",
          l: "Tache de naissance : emplacement",
          show: function () {
            return "person" === e.mode && !sdChild(e) && "none" !== e.bmType;
          },
        },
        {
          t: "chips",
          k: "bmSide",
          l: "Tache de naissance : côté",
          show: function () {
            return "person" === e.mode && !sdChild(e) && "none" !== e.bmType;
          },
          hint: "Gauche ou droite du personnage.",
        },''')
rep('''    t5(e.marks) && (t || !nw() ? n.push(t5(e.marks)) : sdBodyMarks(t5(e.marks)) && n.push(sdBodyMarks(t5(e.marks)))),
    n.join("; ")''', '''    t5(e.marks) && (t || !nw() ? n.push(t5(e.marks)) : sdBodyMarks(t5(e.marks)) && n.push(sdBodyMarks(t5(e.marks)))),
    sdBm(t) && n.push(sdBm(t)),
    n.join("; ")''')
rep('''    ("belly" === e.absStyle ||
      "soft" === e.absStyle ||
      "dadbod" === e.absStyle) &&
      t.push("the belly"),''', '''    ("belly" === e.absStyle ||
      "soft" === e.absStyle ||
      "groove" === e.absStyle ||
      "dadbod" === e.absStyle) &&
      t.push("the belly"),''')
rep('''          rN() &&
            ((t.clear =''', '''          sdThighSoft() &&
            ((t.clear =''')
rep('''    rN() &&
      !rz() &&
      ("strong" === rO() || "clear" === rO()) &&''', '''    sdThighSoft() &&
      !rz() &&
      ("strong" === rO() || "clear" === rO()) &&''')
rep('''                                          "a small birthmark above the right hip",
                                          "a small mole on the inner left forearm",
                                        ].concat(
                                          (e.bodyScars || 0) > 0 || t5(e.marks)
                                            ? []''', '''                                          sdBmOn() ? "a small mole on the inner right wrist" : "a small birthmark above the right hip",
                                          "a small mole on the inner left forearm",
                                        ].concat(
                                          (e.bodyScars || 0) > 0 || t5(e.marks) || sdBm(!1)
                                            ? []''')
# v139 review: a birthmark on the head sheet counts as a set mark, so no random face mole or "no visible moles on the face" next to it
# (the draw is made before this test: the sequence is kept). The locked-sheet retouch (rB) is left as is: "locked" is never set (v112)
rep('''function rf() {
  return !!t5(e.marks) || (e.faceScars || 0) > 0;
}''', '''function rf() {
  return !!t5(e.marks) || (e.faceScars || 0) > 0 || !!sdBm(!0);
}''')
# P96 v140 (user: "Silhouettes types, Vergetures, Cambrure et posture, Cuisses et nombril", then "ajoute des réglages auxquels je n'ai pas
# pensé" for real bodies): "Silhouette type" buttons (sdShapeBtns), "Posture des épaules", "Hauteur de la taille", "Nombril", "Peau du
# ventre", "Cambrure", "Graisse : genoux (au-dessus)", "Intérieur des cuisses", "Vergetures" and its zones, "Veinules"; adults, both
# engines (texts and rules in seedream_new.js: sdDetailMap, sdBodySkin, SD_FAT_Z)
import re as _re
rep("""    bmSide: "left",""", """    bmSide: "left",
    fatKnees: 0,
    shPosture: "auto",
    waistPos: "auto",
    navel: "auto",
    ribcage: "auto",
    shShape: "auto",
    looseBelly: "none",
    lordosis: "auto",
    backDimples: "none",
    thighGap: "auto",
    stretch: "none",
    stretchZones: ["hips", "thighs"],
    spider: "none",
    hipPos: "auto",
    bodyMoles: "none",
    fHair: "auto",""")
rep('''    fatLower: [
      [0, "Aucune", ""],''', '''    fatKnees: [
      [0, "Aucune", ""],
      [1, "Légère", "a little fat just above the knees"],
      [2, "Visible", "pads of fat just above the knees and on their inner side"],
      [3, "Marquée", "clear pads of fat above the knees, rounding the inner knees"],
      [4, "Très marquée", "thick pads of fat above the knees, folding slightly over them"],
    ],
    shPosture: [
      ["auto", "Auto", ""],
      ["rounded", "Arrondies, en avant", ""],
    ],
    waistPos: [
      ["auto", "Auto", ""],
      ["high", "Haute", ""],
      ["low", "Basse", ""],
    ],
    navel: [
      ["auto", "Auto", ""],
      ["round", "Rond", ""],
      ["slit", "En fente verticale", ""],
      ["deep", "Profond", ""],
      ["outie", "Ressorti", ""],
      ["hooded", "Recouvert d'un pli", ""],
    ],
    ribcage: [
      ["auto", "Auto", ""],
      ["narrow", "Étroite", ""],
      ["wide", "Large", ""],
    ],
    shShape: [
      ["auto", "Auto", ""],
      ["rounded", "Arrondies", ""],
      ["square", "Carrées", ""],
      ["sloping", "En pente", ""],
    ],
    looseBelly: [
      ["none", "Ferme", ""],
      ["light", "Un peu relâchée", ""],
      ["marked", "Relâchée", ""],
    ],
    lordosis: [
      ["auto", "Auto", ""],
      ["straight", "Dos droit", ""],
      ["marked", "Cambrée", ""],
      ["deep", "Très cambrée", ""],
    ],
    backDimples: [
      ["none", "Aucune", ""],
      ["visible", "Visibles", ""],
    ],
    thighGap: [
      ["auto", "Auto", ""],
      ["gap", "Écart", ""],
      ["touch", "Se touchent en haut", ""],
      ["touchlong", "Se touchent jusqu'aux genoux", ""],
    ],
    stretch: [
      ["none", "Aucune", ""],
      ["white", "Anciennes, claires", ""],
      ["pink", "Récentes, rosées", ""],
    ],
    stretchZoneOpts: [
      ["hips", "Hanches", ""],
      ["thighs", "Cuisses", ""],
      ["bust", "Côtés de la poitrine", ""],
      ["belly", "Bas du ventre", ""],
      ["glutes", "Fessiers", ""],
      ["arms", "Intérieur des bras", ""],
    ],
    spider: [
      ["none", "Aucune", ""],
      ["few", "Quelques-unes", ""],
      ["many", "Visibles", ""],
    ],
    hipPos: [
      ["auto", "Auto", ""],
      ["high", "Haut (os du bassin)", ""],
      ["low", "Bas (haut des cuisses)", ""],
    ],
    bodyMoles: [
      ["none", "Aucun", ""],
      ["few", "Quelques-uns", ""],
      ["many", "Nombreux", ""],
    ],
    fHair: [
      ["auto", "Auto", ""],
      ["smooth", "Peau lisse", ""],
      ["duvet", "Duvet", ""],
      ["light", "Légère", ""],
      ["natural", "Naturelle", ""],
    ],
    fatLower: [
      [0, "Aucune", ""],''')
rep('''        {
          t: "bins",
          k: "muscle",
          l: "Musculature (volume)",''', '''        {
          t: "sdshape",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
        },
        {
          t: "bins",
          k: "muscle",
          l: "Musculature (volume)",''')
_m = _re.search(r'          k: "shoulders",\n          l: "Épaules",\n          hint: "[^"\n]*",\n        \},\n', src)
assert _m and src.count(_m.group(0)) == 1
src = src.replace(_m.group(0), _m.group(0) + '''        {
          t: "chips",
          k: "shPosture",
          l: "Posture des épaules",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Arrondies : épaules un peu enroulées vers l'avant, haut du dos légèrement voûté, comme une posture du quotidien. Auto : rien n'est dit.",
        },
        {
          t: "chips",
          k: "shShape",
          l: "Forme des épaules",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Remplace la forme tirée au hasard. Arrondies : contour plein et lisse, sans angle osseux. Carrées, En pente : comme leur nom. Auto : tirée au hasard selon la largeur des épaules.",
        },
''')
rep('''        { t: "bins", k: "waist", l: "Tour de taille" },''', '''        { t: "bins", k: "waist", l: "Tour de taille" },
        {
          t: "chips",
          k: "waistPos",
          l: "Hauteur de la taille",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Où se trouve le point le plus fin du tronc : juste sous les côtes (Haute) ou près du haut des hanches (Basse). Indépendante du tour de taille et de la longueur des jambes. Auto : rien n'est dit.",
        },
        {
          t: "chips",
          k: "ribcage",
          l: "Cage thoracique",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Largeur des côtes sous la poitrine. Large avec une taille fine : la taille paraît plus creusée. Auto : tirée au hasard.",
        },''')
_m = _re.search(r'        \{ t: "bins", k: "fatBelly", l: "Graisse : ventre", [^\n]*\},\n', src)
assert _m and src.count(_m.group(0)) == 1
src = src.replace(_m.group(0), _m.group(0) + '''        {
          t: "chips",
          k: "navel",
          l: "Nombril",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Auto : tiré au hasard (rond ou en fente). Ressorti : un petit nombril qui dépasse. Recouvert d'un pli : un nombril vertical avec un petit pli de peau au-dessus.",
        },
        {
          t: "chips",
          k: "looseBelly",
          l: "Peau du ventre",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Un peu relâchée : peau très légèrement relâchée juste sous le nombril, quelques lignes fines et discrètes. Relâchée : peau relâchée sous le nombril, finement plissée, un pli peu profond. Par exemple après une grossesse ou une perte de poids. Indépendante de la graisse du ventre ; visible là où la peau est découverte.",
        },
''')
rep('''          k: "glutesShape",
          l: "Fessiers : galbe",
          hint: "Indépendant du volume : un fessier large mais plat, ou petit mais très bombé.",
        },''', '''          k: "glutesShape",
          l: "Fessiers : galbe",
          hint: "Indépendant du volume : un fessier large mais plat, ou petit mais très bombé.",
        },
        {
          t: "chips",
          k: "lordosis",
          l: "Cambrure",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Creux du bas du dos, vu de profil. Très cambrée : bassin basculé vers l'avant. Avec des fessiers « Bas », le dos reste droit : leur galbe le demande. Auto : tirée au hasard, selon le galbe des fessiers.",
        },
        {
          t: "chips",
          k: "backDimples",
          l: "Fossettes du bas du dos",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Deux petits creux juste au-dessus des fessiers, un de chaque côté de la colonne, vus de dos.",
        },''')
rep('''        { t: "bins", k: "fatThighs", l: "Graisse : cuisses (avant)", ''', '''        { t: "bins", k: "fatKnees", l: "Graisse : genoux (au-dessus)", hint: "Coussinets de gras doux juste au-dessus des genoux et sur leur face interne ; dès « Visible », des genoux doux, jamais dessinés ni saillants. Masqué en corpulence Forte, qui décrit déjà le gras de chaque zone.", show: function () { return 4 !== +e.fat; } },
        {
          t: "chips",
          k: "thighGap",
          l: "Intérieur des cuisses",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Écart entre les cuisses, ou cuisses qui se touchent, debout pieds légèrement écartés. Auto : selon la taille des cuisses.",
        },
        { t: "bins", k: "fatThighs", l: "Graisse : cuisses (avant)", ''')
rep('''          k: "cellulite",
          l: "Cellulite",
          show: function () {
            return "m" !== e.pres;
          },
          hint: "Texture de peau sur les cuisses et les fessiers, visible seulement là où la peau est découverte.",
        },''', '''          k: "cellulite",
          l: "Cellulite",
          show: function () {
            return "m" !== e.pres;
          },
          hint: "Texture de peau sur les cuisses et les fessiers, visible seulement là où la peau est découverte.",
        },
        {
          t: "chips",
          k: "stretch",
          l: "Vergetures",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Anciennes : petits groupes de stries fines et pâles, serrées et presque parallèles, à fleur de peau, qui s'estompent aux extrémités. Récentes : fines lignes roses à violacées, un peu en relief. Visibles là où la peau est découverte.",
        },
        {
          t: "multi",
          k: "stretchZones",
          o: "stretchZoneOpts",
          l: "Vergetures : zones",
          show: function () {
            return "person" === e.mode && !sdChild(e) && "none" !== e.stretch;
          },
        },
        {
          t: "chips",
          k: "spider",
          l: "Veinules",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Fines veinules rouges et bleues : sur l'extérieur des cuisses et l'arrière des genoux (Quelques-unes), jusqu'aux mollets (Visibles). Différent de « Veines apparentes ».",
        },''')
rep('''          if ("sdhelp" === r.t) return sdPlaceHelp(t, g);''', '''          if ("sdhelp" === r.t) return sdPlaceHelp(t, g);
          if ("sdshape" === r.t) return sdShapeBtns(t, n);''')
rep('''    sdBm(t) && n.push(sdBm(t)),
    n.join("; ")''', '''    sdBm(t) && n.push(sdBm(t)),
    t ||
      (e.photo && e.bodyAsIs) ||
      sdBodySkin().forEach(function (x) {
        n.push(x);
      }),
    n.join("; ")''')
rep('''                                          (e.bodyScars || 0) > 0 || t5(e.marks) || sdBm(!1)
                                            ? []''', '''                                          (e.bodyScars || 0) > 0 || t5(e.marks) || sdBm(!1) || sdBodySkin().length
                                            ? []''')
# P96 (continued, user's reference photos and choice): "Point le plus large des hanches", "Grains de beauté (corps)", "Pilosité du corps"
# (a woman or an androgynous person; the men keep their three zones)
rep("""        { t: "bins", k: "hips", l: "Hanches" },""", """        { t: "bins", k: "hips", l: "Hanches" },
        {
          t: "chips",
          k: "hipPos",
          l: "Point le plus large des hanches",
          show: function () {
            return "person" === e.mode && !sdChild(e) && "m" !== e.pres;
          },
          hint: "Haut : les hanches s'élargissent juste sous la taille, au niveau des os du bassin (sans effet avec des hanches Très larges, qui sont déjà au plus large au haut des cuisses). Bas : le plus large au haut des cuisses, d'une seule courbe depuis la taille, sauf avec un creux sur les côtés, une culotte de cheval ou des fessiers carrés. Auto : rien n'est dit.",
        },""")
rep("""          hint: "Fines veinules rouges et bleues : sur l'extérieur des cuisses et l'arrière des genoux (Quelques-unes), jusqu'aux mollets (Visibles). Différent de « Veines apparentes ».",
        },""", """          hint: "Fines veinules rouges et bleues : sur l'extérieur des cuisses et l'arrière des genoux (Quelques-unes), jusqu'aux mollets (Visibles). Différent de « Veines apparentes ».",
        },
        {
          t: "chips",
          k: "bodyMoles",
          l: "Grains de beauté (corps)",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Petits grains de beauté bruns épars : épaules, dos et bras (Quelques-uns), jusqu'au ventre et aux jambes (Nombreux). Visibles là où la peau est découverte. Pour un signe précis, écris-le dans « Autres signes distinctifs ».",
        },""")
_m = _re.search(r'        \{ t: "bins", k: "bodyHairLegs", l: "Poils : jambes", [^\n]*\},\n', src)
assert _m and src.count(_m.group(0)) == 1
src = src.replace(_m.group(0), _m.group(0) + """        {
          t: "chips",
          k: "fHair",
          l: "Pilosité du corps",
          show: function () {
            return "person" === e.mode && !sdChild(e) && "m" !== e.pres;
          },
          hint: "Peau lisse : aucun poil visible. Duvet : duvet fin et clair sur les avant-bras, le bas du dos et le ventre. Légère, Naturelle : poils fins puis non rasés sur les avant-bras et le bas des jambes, de la couleur des cheveux. Auto : de fins poils discrets, comme avant.",
        },
""")
# P96 (continued, user's reference photo): "Écartement de la poitrine" (bustWide: no, yes) with every shape but "Écartée" (sdWideOn)
rep("""    bustAsym: "no",\n""", """    bustAsym: "no",\n    bustWide: "no",\n""")
rep("""    bustAsym: [\n""", """    bustWide: [\n      ["no", "Normal", ""],\n      ["yes", "Écartée", ""],\n    ],\n    bustAsym: [\n""")
rep("""("auto" !== e.bustShape || sdAsymOn())""", """("auto" !== e.bustShape || sdAsymOn() || sdWideOn() || !!sdBustSkin())""")
_m = _re.search(r'        \{\n          t: "chips",\n          k: "bustAsym",\n          l: "Asymétrie de la poitrine",\n          show: function \(\) \{\n[^\n]*\n          \},\n          hint: "[^"\n]*",\n        \},\n', src)
assert _m and src.count(_m.group(0)) == 1
src = src.replace(_m.group(0), _m.group(0) + """        {
          t: "chips",
          k: "bustWide",
          l: "Écartement de la poitrine",
          show: function () {
            return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1 && "wide" !== e.bustShape;
          },
          hint: "« Écartée » : un écart d'environ une main entre les deux côtés, chacun tourné un peu vers l'extérieur, avec n'importe quelle forme (« Tombante » comprise). La forme « Écartée » le dit déjà.",
        },
        {
          t: "chips",
          k: "bustSkin",
          l: "Peau de la poitrine",
          show: function () {
            return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 2 && !(sdDropOn() && "very" === e.bustDrop);
          },
          hint: "Souple : peau souple qui suit le poids de la poitrine, un seul pli doux là où elle repose sur les côtes. Relâchée : peau détendue, finement plissée sur le haut, un pli doux en bas. Visible seulement là où la tenue la découvre ; « Très tombante » le dit déjà. Seedream a déjà bloqué des textes de poitrine tombante (v77) : si l'image est bloquée, repasse sur Auto.",
        },
""")
# P96 (continued, user: "je pense que c'est du F ou G"): "Bonnet écrit (Très généreuse)" (cupTG: h, fg), Seedream only (GPT gets no cup)
rep("""    bustWide: "no",\n""", """    bustWide: "no",\n    cupTG: "h",\n    bustSkin: "auto",\n""")
rep("""    bustWide: [\n""", """    cupTG: [\n      ["h", "H (par défaut)", ""],\n      ["fg", "F à G", ""],\n    ],\n    bustSkin: [\n      ["auto", "Auto", ""],\n      ["soft", "Souple", ""],\n      ["loose", "Relâchée", ""],\n    ],\n    bustWide: [\n""")
rep("""          o: function () {
            return "m" === e.pres ? "pecs" : "bust";
          },
        },""", """          o: function () {
            return "m" === e.pres ? "pecs" : "bust";
          },
        },
        {
          t: "chips",
          k: "cupTG",
          l: "Bonnet écrit (Très généreuse)",
          show: function () {
            return "person" === e.mode && !sdChild(e) && "m" !== e.pres && 4 === +e.chest && sdNat(e);
          },
          hint: "Seedream écrit une lettre de bonnet dans le prompt ; GPT n'en reçoit aucune. H par défaut ; F à G pour un volume un peu moindre, toujours très au-dessus de la moyenne. Le reste du texte de « Très généreuse » ne change pas.",
        },""")
# P96 (continued, v140 review): v139's groove and front thigh fat texts without "soft" (lessons file: "soft" 11 times or more blocked every
# time on Seedream); the same meaning
rep("""        "a flat, soft stomach with a soft vertical groove down the middle, from below the breastbone to the navel, between two slightly fuller sides; no abdominal segments, no horizontal lines and no visible muscle",""", """        "a flat stomach, not muscular, with a shallow vertical groove down the middle, from below the breastbone to the navel, between two slightly fuller sides; no abdominal segments, no horizontal lines and no visible muscle",""")
rep("""      [1, "Légère", "a thin layer of soft fat on the front of the upper thighs, within the thigh size set above"],
      [2, "Visible", "soft fat on the front of the upper thighs, rounding them slightly in profile, with a soft fold at the top along the hip crease, within the thigh size set above"],
      [3, "Marquée", "clearly soft, padded front upper thighs with a soft roll at the top along the hip crease, within the thigh size set above"],
      [4, "Très marquée", "heavy, soft front upper thighs with a thick soft roll at the top along the hip crease, within the thigh size set above"],""", """      [1, "Légère", "a thin layer of fat on the front of the upper thighs, within the thigh size set above"],
      [2, "Visible", "a padding of fat on the front of the upper thighs, rounding them slightly in profile, with a shallow fold at the top along the hip crease, within the thigh size set above"],
      [3, "Marquée", "clearly padded front upper thighs with a roll of fat at the top along the hip crease, within the thigh size set above"],
      [4, "Très marquée", "heavy, padded front upper thighs with a thick roll of fat at the top along the hip crease, within the thigh size set above"],""")
# P97 v141 (user's renders and prompt): "Posture des épaules" also "En arrière", "Droite plus haute", "Gauche plus haute"; the texts in
# seedream_new.js (SD_POSTURE; the belly skin, the dimples, the women's smooth body hair and "not bulky" softened or dropped)
rep("""    shPosture: [
      ["auto", "Auto", ""],
      ["rounded", "Arrondies, en avant", ""],
    ],""", """    shPosture: [
      ["auto", "Auto", ""],
      ["rounded", "Arrondies, en avant", ""],
      ["back", "En arrière", ""],
      ["rhigh", "Droite plus haute", ""],
      ["lhigh", "Gauche plus haute", ""],
    ],""")
rep("""          hint: "Arrondies : épaules un peu enroulées vers l'avant, haut du dos légèrement voûté, comme une posture du quotidien. Auto : rien n'est dit.",""", """          hint: "Arrondies : épaules un peu enroulées vers l'avant, haut du dos légèrement voûté, comme une posture du quotidien. En arrière : épaules tirées en arrière, poitrine ouverte. Droite ou gauche plus haute : une épaule un peu plus haute que l'autre (côté du personnage), comme sur beaucoup de vrais corps. Auto : rien n'est dit. La forme se règle dans « Forme des épaules ».",""")
# P98 v142 (user, his reference photos and a render of his settings: "la taille n'est pas fine du tout"): a narrow waist set by hand
# between wide hips and a large bust is an hourglass (sdHourglass, seedream_new.js): "Très larges" no longer says "a dramatic pear shape"
# there, nor GPT's fat distribution sentence "a pear-shaped build" (both engines); the love handles under a narrow waist, the hourglass
# lead and the waist text are in seedream_new.js
rep('''    "m" !== e.pres &&
      e.waist >= 3 &&
      (t = t.replace(", with a waist-to-hip ratio of about 0.6: a dramatic pear shape whose widest point is at", ", their widest point at")),''', '''    "m" !== e.pres &&
      e.waist >= 3 &&
      (t = t.replace(", with a waist-to-hip ratio of about 0.6: a dramatic pear shape whose widest point is at", ", their widest point at")),
    sdHourglass() &&
      (t = t.replace(": a dramatic pear shape whose widest point is at the hips and upper thighs", "")),''')
rep('''" lean and dry, with very little fat and clearly visible muscle, while the soft fat sits on the hips and thighs, as on many real women with a pear-shaped build."''',
    '''" lean and dry, with very little fat and clearly visible muscle, while the soft fat sits on the hips and thighs" + (sdHourglass() ? "." : ", as on many real women with a pear-shaped build.")''')
# P99 v143 (user: after "Sablier" then "Étroites" the button lost its colour, as if "Sablier" had not worked): the last "Silhouette type"
# button clicked is kept in the state (sdShapePick, UI only, never read by a prompt; reset with the other defaults), shown as "ajusté" with
# the changed sliders listed (seedream_new.js, sdShapeBtns); "Sablier marqué" added there; the stretch marks "Blanches, nacrées" and the
# "Agrandir" hint at the top of the hips and glutes also in seedream_new.js
rep("""    cupTG: "h",\n    bustSkin: "auto",\n""", """    cupTG: "h",\n    bustSkin: "auto",\n    sdShapePick: "",\n""")
# v143 review: a random body ("Corps au hasard", "Personnage au hasard") forgets the last shape button, which would read "ajusté"
rep("""      (n.thighs = rX(5)),\n""", """      (n.thighs = rX(5)),\n      (n.sdShapePick = ""),\n""")
# v143 (user: at the maximum, say that "Agrandir" goes further): the hint of "Hanches" and "Fessiers : volume" (sdGrowHint)
rep("""        { t: "bins", k: "hips", l: "Hanches" },""", """        { t: "bins", k: "hips", l: "Hanches", get hint() { return sdGrowHint("hips"); } },""")
rep("""        { t: "bins", k: "glutes", l: "Fessiers : volume" },""", """        { t: "bins", k: "glutes", l: "Fessiers : volume", get hint() { return sdGrowHint("glutes"); } },""")
# P100 v144 (user: the controls read as "une ribambelle de boutons les uns après les autres"): the Corps tab in named sections (sdsec,
# seedream_new.js: SD_SECS, sdSecHead), head to toe, with a bar of the sections at the top of the tab (sdsecnav); a header with nothing
# under it is left out (sdSecKeep), each gets its count of changed settings (sdSecAnn). "Longueur des jambes" moves up into "Cuisses et
# jambes". No control changes, no prompt changes.
rep("""        { t: "chips", k: "pres", l: "Présentation" },""", """        { t: "sdsecnav", show: function () { return "person" === e.mode && !sdChild(e); } },
        { t: "sdsec", id: "gen", show: function () { return "person" === e.mode && !sdChild(e); } },
        { t: "chips", k: "pres", l: "Présentation" },""")
rep("""        {\n          t: "bins",\n          k: "shoulders",\n          l: "Épaules",""", """        { t: "sdsec", id: "epaules", show: function () { return "person" === e.mode && !sdChild(e); } },\n        {\n          t: "bins",\n          k: "shoulders",\n          l: "Épaules",""")
rep("""        { t: "chips", k: "biceps", l: "Biceps et triceps" },""", """        { t: "sdsec", id: "bras", show: function () { return "person" === e.mode && !sdChild(e); } },
        { t: "chips", k: "biceps", l: "Biceps et triceps" },""")
rep("""        {\n          t: "bins",\n          k: "chest",\n          l: function () {""", """        { t: "sdsec", id: "poitrine", show: function () { return "person" === e.mode && !sdChild(e); } },\n        {\n          t: "bins",\n          k: "chest",\n          l: function () {""")
rep("""        { t: "bins", k: "waist", l: "Tour de taille" },""", """        { t: "sdsec", id: "taille", show: function () { return "person" === e.mode && !sdChild(e); } },
        { t: "bins", k: "waist", l: "Tour de taille" },""")
rep("""        { t: "bins", k: "hips", l: "Hanches", get hint() { return sdGrowHint("hips"); } },""", """        { t: "sdsec", id: "hanches", show: function () { return "person" === e.mode && !sdChild(e); } },
        { t: "bins", k: "hips", l: "Hanches", get hint() { return sdGrowHint("hips"); } },""")
rep("""        { t: "bins", k: "legs", l: "Longueur des jambes" },\n""", "")
rep("""        {\n          t: "bins",\n          k: "thighs",\n          l: "Cuisses",""", """        { t: "sdsec", id: "jambes", show: function () { return "person" === e.mode && !sdChild(e); } },\n        { t: "bins", k: "legs", l: "Longueur des jambes" },\n        {\n          t: "bins",\n          k: "thighs",\n          l: "Cuisses",""")
rep("""        {\n          t: "chips",\n          k: "cellulite",\n          l: "Cellulite",""", """        { t: "sdsec", id: "peau", show: function () { return "person" === e.mode && !sdChild(e); } },\n        {\n          t: "chips",\n          k: "cellulite",\n          l: "Cellulite",""")
rep("""        {\n          t: "toggle",\n          k: "headless",\n          l: "Planche corps sans tête",""", """        { t: "sdsec", id: "planche", show: function () { return "person" === e.mode && !sdChild(e); } },\n        {\n          t: "toggle",\n          k: "headless",\n          l: "Planche corps sans tête",""")
rep("""          if ("sdshape" === r.t) return sdShapeBtns(t, n);""", """          if ("sdshape" === r.t) return sdShapeBtns(t, n);
          if ("sdsec" === r.t) return sdSecHead(t, r);
          if ("sdsecnav" === r.t) return sdSecNav(t, r);""")
rep("""                                              !("tenue" === w.id && sdFreeSw(t)),
                                          )
                                          .map(M),""", """                                              !("tenue" === w.id && sdFreeSw(t)),
                                          )
                                          .filter(sdSecKeep)
                                          .map(function (x, i, a) {
                                            return sdSecAnn(x, i, a, t);
                                          })
                                          .map(M),""")
# P101 v144 (user's render and his reference: "ajouter de la graisse sur les épaules, sur les clavicules, c'est pas possible"; card 2b "c'est
# horrible, de la cellulite, de la graisse"; the waist never narrows): "Clavicules" (Auto, Visibles, Douces, Couvertes; SD_CLAV in
# seedream_new.js), after "Forme des épaules"; card 2b named for the hourglass when it narrows the waist (sdGrowPrompt)
rep("""    shShape: "auto",\n""", """    shShape: "auto",\n    clav: "auto",\n""")
rep("""    shShape: [
      ["auto", "Auto", ""],
      ["rounded", "Arrondies", ""],
      ["square", "Carrées", ""],
      ["sloping", "En pente", ""],
    ],""", """    shShape: [
      ["auto", "Auto", ""],
      ["rounded", "Arrondies", ""],
      ["square", "Carrées", ""],
      ["sloping", "En pente", ""],
    ],
    clav: [
      ["auto", "Auto", ""],
      ["visible", "Visibles", ""],
      ["soft", "Douces", ""],
      ["covered", "Couvertes", ""],
    ],""")
rep("""          hint: "Remplace la forme tirée au hasard. Arrondies : contour plein et lisse, sans angle osseux. Carrées, En pente : comme leur nom. Auto : tirée au hasard selon la largeur des épaules.",
        },""", """          hint: "Remplace la forme tirée au hasard. Arrondies : contour plein et lisse, sans angle osseux. Carrées, En pente : comme leur nom. Auto : tirée au hasard selon la largeur des épaules.",
        },
        {
          t: "chips",
          k: "clav",
          l: "Clavicules",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Douces : un peu de chair dessus, à peine visibles. Couvertes : presque invisibles sous une fine couche de gras. Visibles : bien marquées. Auto : visibles en corpulence Mince ou Très mince, couvertes de chair en Enrobée et Forte, tirées au hasard en Moyenne.",
        },""")
rep("""                                    !sdX && sdGrowOn(t) && B("grow", "2b", "Retouche : hanches et fessiers"),""", """                                    !sdX && sdGrowOn(t) && B("grow", "2b", rq(t, sdHourglass) ? (4 === +t.glutes ? "Retouche : taille, hanches et fessiers" : "Retouche : taille et hanches") : "Retouche : hanches et fessiers"),""")
# P102 (v145, user: "on devrait toujours mettre les bras écartés dorénavant, comme pour les personnages de jeu vidéo, pour tous les prompts
# de création de corps ou personnage en entier"): the GPT body sheet and the GPT sheet from photos (also rewritten for Seedream in 3D, 2D
# and from a photo) hold the arms out with a gap of backdrop beside the body (SD_ARMS_OUT_G, seedream_new.js); and the hip multiple
# without the waist-to-hip ratio said with it (audit of his prompt: two targets in one sentence)
rep(""""Neutral standing reference pose, weight on both feet, feet hip-width apart, arms relaxed and held slightly away from the body so the silhouette and both hands stay readable" +""",
    """"Neutral standing reference pose, weight on both feet, feet hip-width apart, " + SD_ARMS_OUT_G + ", so the silhouette and both hands stay readable" +""")
rep(""": "Neutral standing reference pose, weight on both feet, arms relaxed and held slightly away from the body; the pose is the only other change.")""",
    """: "Neutral standing reference pose, weight on both feet, " + SD_ARMS_OUT_G + "; the pose is the only other change.")""")
rep("""      e.waist <= 2 &&
      (t +=
        ", about " +""", """      e.waist <= 2 &&
      (t = t.replace(", with a waist-to-hip ratio of about 0.6", ""), t +=
        ", about " +""")
# P103 (v147, user: "oui, fais-le"): the bust retouch (sdGrowBustOn, sdGrowBustPrompt, its intro, rows and tooltip in seedream_new.js),
# after cards 2b and 2c, numbered by the retouches before it; in the step count and with the same copy message
rep('''                                    !sdX && sdGrowUpOn(t) && B("growUp", sdGrowOn(t) ? "2c" : "2b", "Retouche : haut du corps"),''', '''                                    !sdX && sdGrowUpOn(t) && B("growUp", sdGrowOn(t) ? "2c" : "2b", "Retouche : haut du corps"),
                                    !sdX && sdGrowBustOn(t) && B("growBust", ["2b", "2c", "2d"][(sdGrowOn(t) ? 1 : 0) + (sdGrowUpOn(t) ? 1 : 0)], "Retouche : poitrine"),''')
rep('''["Tes trois étapes, dans l'ordre", "Tes quatre étapes, dans l'ordre", "Tes cinq étapes, dans l'ordre"][(sdGrowOn(t) ? 1 : 0) + (sdGrowUpOn(t) ? 1 : 0)]''', '''["Tes trois étapes, dans l'ordre", "Tes quatre étapes, dans l'ordre", "Tes cinq étapes, dans l'ordre", "Tes six étapes, dans l'ordre"][(sdGrowOn(t) ? 1 : 0) + (sdGrowUpOn(t) ? 1 : 0) + (sdGrowBustOn(t) ? 1 : 0)]''')
rep('''"grow" === t || "growUp" === t ? sdGrowCopyMsg(e) : sdSrcCopyMsg(e);''', '''"grow" === t || "growUp" === t || "growBust" === t ? sdGrowCopyMsg(e) : sdSrcCopyMsg(e);''')
# P103b (v147 review: with the bust retouch the phone bar can hold six buttons, about 50 px each at 375 px, labels cut or on three lines; five
# already cut "Assembler"): from five buttons, two rows of three at most, each label on one line; four or fewer unchanged
# (an object's bar keeps this repository's two-column grid from three buttons up)
rep('''              style: y && U.length > 2 ? { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } : void 0,
              children: U.map(''', '''              style: y && U.length > 2 ? { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } : U.length >= 5 ? { flexWrap: "wrap" } : void 0,
              children: U.map(''')
rep('''                    title: sdBarTip(e, n),''', '''                    title: sdBarTip(e, n),
                    style: !y && U.length >= 5 ? { flex: "1 1 30%", whiteSpace: "nowrap" } : void 0,''')
# P104 (v149, user: "il faudrait pouvoir ajouter du gras sur le biceps, il n'y a pas ce curseur, et mettre Auto si besoin"; asked, "Auto"
# follows the back of the arm): "Graisse : bras (avant, biceps)", chips Auto, Aucune to Très marquée, under "Graisse : bras (arrière,
# triceps)", hidden with "Forte" as the other fat settings; adults, both engines (sdFatOn, sdArmFat, SD_FAT_Z in seedream_new.js). Values
# are strings ("auto", "0" to "4"), as the chips store them; GPT's "Fat distribution: the arms ... lean and dry" also left out with it.
# v149 review: the texts say the fat on the front only, never the biceps (its size and definition are the muscle line's: "very large
# biceps and triceps under the arm fat" next to "the biceps only a faint shape" contradicted it) nor the whole arm (the back is its own
# setting)
rep('''    fatKnees: 0,
''', '''    fatKnees: 0,
    fatBiceps: "auto",
''')
rep('''    fatKnees: [
      [0, "Aucune", ""],''', '''    fatBiceps: [
      ["auto", "Auto", ""],
      ["0", "Aucune", ""],
      ["1", "Légère", "a little padding over the front of the upper arms"],
      ["2", "Visible", "a smooth layer of fat over the front of the upper arms, rounding their front"],
      ["3", "Marquée", "a clear layer of fat over the front of the upper arms, their front full and rounded"],
      ["4", "Très marquée", "a thick layer of fat over the front of the upper arms, their front heavy and rounded down to the elbow"],
    ],
    fatKnees: [
      [0, "Aucune", ""],''')
_m = _re.search(r'        \{ t: "bins", k: "fatArms", l: "Graisse : bras \(arrière, triceps\)", [^\n]*\n', src)
assert _m and src.count(_m.group(0)) == 1
src = src.replace(_m.group(0), _m.group(0) + '''        { t: "chips", k: "fatBiceps", l: "Graisse : bras (avant, biceps)", hint: "Gras sur l'avant du haut du bras, par-dessus le biceps ; dès « Visible », les muscles du bras se lisent en formes douces sous le gras. Auto : un cran sous « Graisse : bras (arrière, triceps) ». N'ajoute rien au poids du prompt. Masqué en corpulence Forte, qui décrit déjà le gras de chaque zone.", show: function () { return 4 !== +e.fat; } },
''')
rep('''  if (sdFatOn("fatArms") || sdFatOn("fatBack")) return "";''', '''  if (sdArmFat() || sdFatOn("fatBack")) return "";''')
# P105 (v150, user, his reference photo: "la partie entre le nombril et le pubis est méga large et je n'arrive pas à le simuler", "un truc
# supplémentaire sans garantir que ça va fonctionner"): "Bassin très évasé (essai)", a toggle under "Point le plus large des hanches",
# with "Très larges" hips and a waist up to "Moyenne", a woman or an androgynous adult (sdHipFlareShow; no effect with a dip, square glutes,
# saddlebags or a low waist: sdHipFlare); its words at the end of the hip text of both engines (rk), card 2b in seedream_new.js. Off by
# default: no prompt changes
rep('''    fatBiceps: "auto",
''', '''    fatBiceps: "auto",
    hipFlare: !1,
''')
rep('''    sdHourglass() &&
      (t = t.replace(": a dramatic pear shape whose widest point is at the hips and upper thighs", "")),
    t
  );''', '''    sdHourglass() &&
      (t = t.replace(": a dramatic pear shape whose widest point is at the hips and upper thighs", "")),
    sdHipFlare() && (t += SD_HIP_FLARE),
    t
  );''')
_m = _re.search(r'        \{\n          t: "chips",\n          k: "hipPos",\n(?:          [^\n]*\n)*?        \},\n', src)
assert _m and src.count(_m.group(0)) == 1
src = src.replace(_m.group(0), _m.group(0) + '''        {
          t: "toggle",
          k: "hipFlare",
          l: "Bassin très évasé (essai)",
          show: function () {
            return sdHipFlareShow();
          },
          hint: "Essai, sans garantie : le contour s'évase dès sous le nombril, les hanches déjà bien plus larges que la taille une main sous le nombril, de face ; la carte 2b (Seedream) reprend cette courbe, du même pas. Sans effet avec « Creux sur les côtés » ou des fessiers « Carrés », des culottes de cheval ou une taille basse, qui cassent cette courbe. Sur ta planche : 1,42 à 1,53 fois la taille par le texte seul (11 rendus), 1,63 à 1,75 avec la carte 2b sans cet essai (3 rendus).",
        },
''')
# P106 (v150, user: "pareil pour le gras et le défaut du corps au niveau de la face avant de la cuisse : il se concentre toujours sur l'arrière
# et jamais sur l'avant de la cuisse en haut"; his prompt said the fat on the front of the thighs "rounding them slightly in profile" and the
# light cellulite "on the backs of the thighs"): "Graisse : cuisses (avant)" said showing in the front view; the cellulite with it on the
# front of the thighs too (sdOptFix, seedream_new.js), its hint says so
rep('''      [1, "Légère", "a thin layer of fat on the front of the upper thighs, within the thigh size set above"],''', '''      [1, "Légère", "a thin layer of fat on the front of the upper thighs, showing in the front view, within the thigh size set above"],''')
rep('''      [2, "Visible", "a padding of fat on the front of the upper thighs, rounding them slightly in profile, with a shallow fold at the top along the hip crease, within the thigh size set above"],''', '''      [2, "Visible", "a padding of fat on the front of the upper thighs with a shallow fold at the top along the hip crease, both showing in the front view, the thighs rounded slightly in profile, within the thigh size set above"],''')
rep('''      [3, "Marquée", "clearly padded front upper thighs with a roll of fat at the top along the hip crease, within the thigh size set above"],''', '''      [3, "Marquée", "clearly padded front upper thighs with a roll of fat at the top along the hip crease, showing in the front view, within the thigh size set above"],''')
rep('''      [4, "Très marquée", "heavy, padded front upper thighs with a thick roll of fat at the top along the hip crease, within the thigh size set above"],''', '''      [4, "Très marquée", "heavy, padded front upper thighs with a thick roll of fat at the top along the hip crease, showing in the front view, within the thigh size set above"],''')
rep('''          hint: "Texture de peau sur les cuisses et les fessiers, visible seulement là où la peau est découverte.",''', '''          hint: "Texture de peau sur les cuisses et les fessiers, visible seulement là où la peau est découverte. Avec « Graisse : cuisses (avant) », aussi sur l'avant des cuisses, dite visible de face comme de dos.",''')
# P107 (v151, self-review of his sheet: "soft upper arms that sag slightly when the arms hang" next to the arms held out about 20 degrees,
# v145): "Graisse : bras (arrière, triceps)" at "Visible" without "when the arms hang" (SD_FAT_OUTLINE follows, seedream_new.js)
rep('''      [2, "Visible", "soft upper arms that sag slightly when the arms hang"],''', '''      [2, "Visible", "soft upper arms that sag slightly"],''')
# P109 (v153, user: "on peut cliquer « Tenue en un seul texte » et « Tenue de référence corps » mais du coup il va prendre lequel en compte",
# then "c'est pas clair pour moi, les utilisateurs vont se poser la question", "corrige, fonce, fais ça bien"): the Tenue tab opens with what
# the head and body sheets and "Habiller avec ma tenue" wear, live (sdTenueSum, seedream_new.js)
rep('''                                        "tenue" === w.id &&
                                          !sdChild(t) &&
                                          (0, l.jsxs)("div", {
                                            className:
                                              "my-4 rounded-2xl border p-4 " +
                                              (t.bodyRef''', '''                                        "tenue" === w.id && sdTenueSum(t),
                                        "tenue" === w.id &&
                                          !sdChild(t) &&
                                          (0, l.jsxs)("div", {
                                            className:
                                              "my-4 rounded-2xl border p-4 " +
                                              (t.bodyRef''')
# P109b (v153): the reference outfit box's note says that both sheets keep it, as the summary does
rep('''"Ta tenue, ci-dessous : la planche corps garde la tenue de référence ; ta tenue sert à la retouche « Habiller avec ma tenue » (carte 3, Choisir la retouche).",''',
    '''"Ta tenue, ci-dessous : les planches tête et corps gardent la tenue de référence ; ta tenue sert à la retouche « Habiller avec ma tenue » (carte 3, Choisir la retouche).",''')
# P110 (v154 review): the sheet "Finition photo" finishes (card 3, "Planche à finir": combined, headless body, body or head), a saved key
# like sdBodyImg; empty: the combined sheet with "Sans tête", the body sheet without it (sdFinTg)
rep('    sdBodyImg: !0,\n    objMannequin: !1,\n  },', '    sdBodyImg: !0,\n    objMannequin: !1,\n    sdFinTg: "",\n  },')
# P111 (v154, user: "il faut un tooltip hover" on the options of "Planche à finir"): an option of the segmented control may carry a third
# element, its tooltip (the button's title, translated like every title); every other control has none and is unchanged
rep('''    children: t.map(([t, r]) =>
      (0, l.jsx)(
        "button",
        {
          type: "button",
          role: "radio",''', '''    children: t.map(([t, r, sdTt]) =>
      (0, l.jsx)(
        "button",
        {
          type: "button",
          role: "radio",
          title: sdTt,''')
# P112 (v155, user: "une flèche … on clique et on va direct en bas ou direct en haut, comme sur ChatGPT ou Claude"): the two scroll arrows
# (SdScrollNav), rendered once, just before the phone's bottom bar
rep('''          (0, l.jsx)("div", {
            className:
              ("integ" === t.view ? "hidden " : "") +
              "fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 px-4 pt-3 backdrop-blur lg:hidden",''', '''          (0, l.jsx)(SdScrollNav, {}),
          (0, l.jsx)("div", {
            className:
              ("integ" === t.view ? "hidden " : "") +
              "fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 px-4 pt-3 backdrop-blur lg:hidden",''')
# P113 (v155, user: "il devrait dire qu'il faut remplir des trucs qui n'existaient pas avant … mettre les sliders en rouge"): the marks of the
# settings an older full state does not hold (sdNew*): read at start-up from the saved page, set by an import (sdIoApply); the field renderer
# of the tabs wrapped (both lists); a red dot on a tab that holds one
rep('''})(src ? JSON.parse(JSON.stringify(src)) : JSON.parse(localStorage.getItem(au) || "{}") || {}),''', '''})(sdNewSeen(src ? JSON.parse(JSON.stringify(src)) : JSON.parse(localStorage.getItem(au) || "{}") || {}, !!src)),''')
rep('.map(M),', '.map(sdNewM(M)),', 2)
rep('''                                        : "text-muted-foreground hover:text-foreground"),
                                    children: e.label,''', '''                                        : "text-muted-foreground hover:text-foreground"),
                                    children: sdNewTab(e) ? [e.label, sdNewTab(e)] : e.label,''')
# P114 (v155, user then chose "Étape 4 à part"): the copy message of step 4, "Finition photo" (sdFinCopyMsg)
rep('''"iter" === t ? sdIterCopyMsg(e) : "grow" === t || "growUp" === t || "growBust" === t ? sdGrowCopyMsg(e)''', '''"iter" === t ? sdIterCopyMsg(e) : "fin" === t ? sdFinCopyMsg(e) : "grow" === t || "growUp" === t || "growBust" === t ? sdGrowCopyMsg(e)''')
# P115 (v155): step 4 counts in "Tes N étapes, dans l'ordre"
rep('''["Tes trois étapes, dans l'ordre", "Tes quatre étapes, dans l'ordre", "Tes cinq étapes, dans l'ordre", "Tes six étapes, dans l'ordre"][(sdGrowOn(t) ? 1 : 0) + (sdGrowUpOn(t) ? 1 : 0) + (sdGrowBustOn(t) ? 1 : 0)]''', '''["Tes trois étapes, dans l'ordre", "Tes quatre étapes, dans l'ordre", "Tes cinq étapes, dans l'ordre", "Tes six étapes, dans l'ordre", "Tes sept étapes, dans l'ordre"][(sdGrowOn(t) ? 1 : 0) + (sdGrowUpOn(t) ? 1 : 0) + (sdGrowBustOn(t) ? 1 : 0) + (sdFinOn(t) ? 1 : 0)]''')
# P116 (v156, user: "concernant les ambiances pour les lieux on a droit à très peu de modes, il faut en ajouter", then "ajoute d'autres
# détails intéressants, c'est pas assez"): "Ambiance" of a place, from 6 to 24 choices, each said with what it shows (materials, light,
# objects), not one adjective
rep("""      ["eerie", "Inquiétante", "eerie and unsettling, with deep shadows"],
    ],""", """      ["eerie", "Inquiétante", "eerie and unsettling, with deep shadows"],
      ["calm", "Paisible", "calm and peaceful, airy and uncluttered, in soft, even light"],
      ["romantic", "Romantique", "romantic and intimate, with warm, low light and soft shadows"],
      ["festive", "Festive", "festive, dressed with decorations, garlands and warm string lights"],
      ["mystery", "Mystérieuse", "mysterious, with a soft haze and pools of light separated by shadow"],
      ["oppressive", "Oppressante", "oppressive and claustrophobic, cramped, with low light and heavy shadows"],
      ["squalid", "Sordide", "grimy and squalid, with stains, peeling paint and dirty, worn surfaces"],
      ["industrial", "Industrielle", "industrial and raw, with bare concrete, exposed steel, pipes and cables"],
      ["rustic", "Rustique", "rustic, with rough wood, old stone and handmade objects"],
      ["retro", "Rétro", "retro, with dated period furnishings, colors and fittings, slightly faded"],
      ["nostalgic", "Nostalgique", "nostalgic, with warm, sun-faded colors and gentle wear"],
      ["futuristic", "Futuriste", "futuristic, sleek and high-tech, with seamless surfaces and integrated light strips"],
      ["cyberpunk", "Cyberpunk", "cyberpunk, dense and neon-lit, with glowing signs and screens, tangled cables and layered clutter"],
      ["postapo", "Post-apocalyptique", "post-apocalyptic, ruined and overgrown, with debris, broken glass and plants pushing through the cracks"],
      ["austere", "Austère", "austere and bare, with few objects and plain, hard surfaces"],
      ["noir", "Polar", "film-noir tension, with hard light, deep shadows and slatted light through blinds"],
      ["dream", "Onirique", "dreamlike, with a soft glow, a gentle haze and pastel light"],
      ["clinical", "Clinique", "clinical and sterile, with white surfaces and cold, even light"],
      ["lush", "Luxuriante", "lush and green, overflowing with plants and foliage"],
    ],""")
# P117 (v156): "Moment" gains Aube and Heure dorée, in the order of the day ("Jour et nuit" last)
rep("""    objTime: [
      ["day", "Jour", "day"],
      ["night", "Nuit", "night"],
      ["both", "Jour et nuit", "both"],
      ["dusk", "Crépuscule", "dusk"],
    ],""", """    objTime: [
      ["dawn", "Aube", "dawn"],
      ["day", "Jour", "day"],
      ["golden", "Heure dorée", "golden hour"],
      ["dusk", "Crépuscule", "dusk"],
      ["night", "Nuit", "night"],
      ["both", "Jour et nuit", "both"],
    ],""")
# P118 (v156): their light (sdMomentLight); an interior with no daylight keeps its daytime text
rep("""  return "day" === n
    ? s + "."
    : "night" === n
      ? u + "."
      : "dusk" === n
        ? c + "."
        : s + " (top row). " + u + " (bottom row).";""", """  return "day" === n
    ? s + "."
    : "night" === n
      ? u + "."
      : "dusk" === n
        ? c + "."
        : "dawn" === n || "golden" === n
          ? (sdMomentLight(n, t, r, "clear" === e.objWeather, i, l(o)) || s) + "."
          : s + " (top row). " + u + " (bottom row).";""")
# P119 (v156): "Direction artistique cinéma" (objCine), on by default; P120 its switch, last of "Lumière et ambiance"
rep('    objMannequin: !1,\n    sdFinTg: "",\n  },', '    objMannequin: !1,\n    sdFinTg: "",\n    objCine: !0,\n  },')
rep("""          hint: "Éléments qui sortent du réel, rendus comme s'ils existaient vraiment, identiques sur chaque vue.",
        },
      ],
    },
  ],
  t4 = [""", """          hint: "Éléments qui sortent du réel, rendus comme s'ils existaient vraiment, identiques sur chaque vue.",
        },
        {
          t: "toggle",
          k: "objCine",
          l: "Direction artistique cinéma",
          show: function () {
            return n9() && !e.photo;
          },
          hint: "Activé : le prompt habille ton lieu comme un décor de tournage, en gardant tout ce que tu écris : profondeur (premier plan, plan moyen, arrière-plan), densité d'objets crédible, matières qui ont vécu, lumière qui vient de vraies sources, palette cohérente. Désactivé : seulement ta description et tes réglages.",
        },
      ],
    },
  ],
  t4 = [""")
# P121 (v156): the layer itself (sdCine), after the place text, before the layout
rep("""                            ("LAYOUT:\\nA 16:9 landscape image split into six equal panels in a 3 by 2 grid, separated by narrow gaps of neutral grey. " +
                              rn()) +""", """                            sdCine() +
                            ("LAYOUT:\\nA 16:9 landscape image split into six equal panels in a 3 by 2 grid, separated by narrow gaps of neutral grey. " +
                              rn()) +""")
# P122 (v156, user: "« bad shape car » dans la description … une voiture sortie du concessionnaire"): the condition line (sdCond), place and object
rep("""(a +=
                              "Condition: " +
                              t1("objWear", e.objWear) +
                              ".\\n"));""", """(a +=
                              "Condition: " +
                              sdCond() +
                              ".\\n"));""")
rep("""\"Condition: " + t1("objWear", e.objWear) + ".\\n"));""", """\"Condition: " + sdCond() + ".\\n"));""")
# P123 (v156): "Usure" says how the description and the setting meet
rep("""{ t: "bins", k: "objWear", l: "Usure" },""", """{ t: "bins", k: "objWear", l: "Usure", hint: "L'état de l'objet. Si ta description dit déjà son état (rusty, dented, wrecked, rouillé, cabossé…), elle passe avant « Neuf » et « Bon état » ; pour un lieu, l'ambiance Abandonnée, Sordide ou Post-apocalyptique aussi. Avec Usé, Très usé ou Abîmé, l'objet n'est ni nettoyé ni restauré pour la photo." },""")
# P124 (v156, user: men's settings, face fat, hair colour by age, beard and body hair colours): defaults; nothing changes for a saved
# character until one of them is set ("Comme les cheveux" for both colours)
rep('    sdFinTg: "",\n    objCine: !0,\n  },', '    sdFinTg: "",\n    objCine: !0,\n    faceFat: 0,\n    fatChest: 0,\n    beardColor: "auto",\n    bodyHairColor: "auto",\n  },')
# P125 (v156): the options. "Auto (âge)" last of the hair colours (sdHairAuto); the beard and body hair colours, the hair's without platinum
rep('''      ["white", "Blanc", "white", "#E9E9E7"],
    ],
    wear: [''', '''      ["white", "Blanc", "white", "#E9E9E7"],
      ["auto", "Auto (âge)", "", "linear-gradient(180deg,#3A2619 0%,#6F6C68 55%,#E9E9E7 100%)"],
    ],
    beardColor: [
      ["auto", "Comme les cheveux", "", "repeating-linear-gradient(45deg,#8F8F8F 0 3px,#E9E9E7 3px 6px)"],
      ["black", "Noir", "black", "#17130F"],
      ["darkbrown", "Brun foncé", "dark brown", "#3A2619"],
      ["brown", "Châtain", "brown", "#5E3E26"],
      ["lightbrown", "Châtain clair", "light brown", "#8A6440"],
      ["blond", "Blond", "blond", "#C9A462"],
      ["red", "Roux", "copper red", "#A4471F"],
      ["auburn", "Auburn", "auburn", "#7A2E1C"],
      ["saltpepper", "Poivre et sel", "salt-and-pepper grey", "#6F6C68"],
      ["grey", "Gris", "grey", "#8F8F8F"],
      ["white", "Blanc", "white", "#E9E9E7"],
    ],
    faceFat: [
      [0, "Aucune", ""],
      [1, "Légère", "slightly full cheeks, a soft layer of fat that rounds the face a little"],
      [2, "Visible", "full, rounded cheeks and a softer jawline, the face visibly fleshy"],
      [3, "Marquée", "a round, fleshy face with plump cheeks, a soft jawline and the start of a double chin"],
      [4, "Très marquée", "a heavy, fleshy face with full jowls along the jaw and a clear double chin"],
    ],
    fatChest: [
      [0, "Aucune", ""],
      [1, "Légère", "a slight softness over the pectorals"],
      [2, "Visible", "soft fat over the pectorals, the lower edge of the chest slightly rounded"],
      [3, "Marquée", "a soft, fleshy chest, the fat over the pectorals rounding and sagging slightly at the lower edge"],
      [4, "Très marquée", "a heavy, soft chest, thick fat over the pectorals sagging over a crease at its lower edge"],
    ],
    wear: [''')
rep('''    glutesDefOpts: [
      ["square", "Carrés", "square"],''', '''    glutesDefOptsM: [
      ["sag", "Tombants", "drooping"],
      ["full", "Pleins sur les côtés", "full at the sides"],
      ["soft", "Mous", "soft"],
    ],
    glutesDefOpts: [
      ["square", "Carrés", "square"],''')
# P126 (v156): "Graisse : visage" after "Forme du visage" (adults, never with a photo)
rep('''        { t: "chips", k: "face", l: "Forme du visage" },''', '''        { t: "chips", k: "face", l: "Forme du visage" },
        {
          t: "bins",
          k: "faceFat",
          l: "Graisse : visage",
          show: function () {
            return "person" === e.mode && !sdChild(e) && !e.photo;
          },
          hint: "Gras du visage, indépendant de la corpulence. Légère : joues un peu pleines. Visible : joues pleines, mâchoire adoucie. Marquée : visage rond et charnu, début de double menton. Très marquée : bajoues et double menton net. Retire du visage tiré au hasard les traits qui le contredisent (joues minces ou creuses, puis mâchoire anguleuse dès Visible, pommettes saillantes dès Marquée), jamais ceux que tu choisis. Adultes.",
        },''')
# P127 (v156): "Graisse : pectoraux", a man's, after "Muscles apparents : pectoraux"
rep('''          show: function () {
            return "m" === e.pres || !!sdPecsF();
          },
        },''', '''          show: function () {
            return "m" === e.pres || !!sdPecsF();
          },
        },
        { t: "bins", k: "fatChest", l: "Graisse : pectoraux", hint: "Gras doux sur les pectoraux, jamais une poitrine : dès « Visible », les pectoraux se lisent en formes douces sous le gras et le bas du torse s'arrondit. Ajoute un peu au poids du prompt (corpulence mince ou moyenne). Masqué en corpulence Forte, qui décrit déjà le gras de chaque zone. Hommes adultes.", show: function () { return "m" === e.pres && 4 !== +e.fat; } },''')
# P128 (v156): "Fessiers : défauts", a man's own list (SD_GLDEF, seedream_new.js)
rep('''          o: "glutesDefOpts",
          l: "Fessiers : défauts",
          hint: "À cocher en plus du volume et du galbe. Carrés : vus de dos, côtés presque droits jusqu'aux cuisses (forme carrée de la classification de Mendieta). Creux sur les côtés : un creux entre la hanche et la cuisse (« hip dips »). Tombants : le bas retombe sur le pli, avec un bourrelet juste dessous (« banana roll »).",''', '''          o: function () {
            return "m" === e.pres ? "glutesDefOptsM" : "glutesDefOpts";
          },
          l: "Fessiers : défauts",
          get hint() {
            return "m" === e.pres
              ? "À cocher en plus du volume et du galbe. Tombants : le bas retombe sur le pli, avec un bourrelet juste dessous. Pleins sur les côtés : arrondis entre la hanche et la cuisse, sans le léger creux latéral d'un fessier d'homme. Mous : peu de tonus, la forme un peu relâchée."
              : "À cocher en plus du volume et du galbe. Carrés : vus de dos, côtés presque droits jusqu'aux cuisses (forme carrée de la classification de Mendieta). Creux sur les côtés : un creux entre la hanche et la cuisse (« hip dips »). Tombants : le bas retombe sur le pli, avec un bourrelet juste dessous (« banana roll »).";
          },''')
# P129 (v156): "Couleur de la barbe" after "Pilosité faciale"; "Couleur des poils" after "Pilosité du corps"
rep('''          k: "facialHair",
          l: "Pilosité faciale",
          show: function () {
            return "f" !== e.pres;
          },
        },''', '''          k: "facialHair",
          l: "Pilosité faciale",
          show: function () {
            return "f" !== e.pres;
          },
        },
        {
          t: "swatch",
          k: "beardColor",
          l: "Couleur de la barbe",
          show: function () {
            return sdBeardOn();
          },
          hint: "Comme les cheveux : aucune couleur écrite, la barbe suit les cheveux, comme avant. Une autre couleur s'écrit dans le prompt, par exemple une barbe poivre et sel sous des cheveux bruns. Adultes.",
        },''')
rep('''          hint: "Peau lisse : aucun poil visible. Duvet : duvet fin et clair sur les avant-bras, le bas du dos et le ventre. Légère, Naturelle : poils fins puis non rasés sur les avant-bras et le bas des jambes, de la couleur des cheveux. Auto : de fins poils discrets, comme avant.",
        },''', '''          hint: "Peau lisse : aucun poil visible. Duvet : duvet fin et clair sur les avant-bras, le bas du dos et le ventre. Légère, Naturelle : poils fins puis non rasés sur les avant-bras et le bas des jambes, de la couleur des cheveux. Auto : de fins poils discrets, comme avant.",
        },
        {
          t: "swatch",
          k: "bodyHairColor",
          o: "beardColor",
          l: "Couleur des poils",
          show: function () {
            return sdBodyHairColOn();
          },
          hint: "Comme les cheveux : la couleur des cheveux, comme avant (naturelle avec Platine, Chauve ou une couleur écrite à la main). Une autre couleur s'écrit dans le prompt du corps ; sans réglage de pilosité, ce sont les poils fins et discrets de toutes les planches qui la prennent. Adultes.",
        },''')
# P130 (v156): "Auto (âge)" written by age (sdHairAuto); its hint on the colour control
rep('''function t7(t) {
  return t5(e[t + "Custom"]) || ("eyeColor" === t ? sdEyeTone(t1(t, e[t])) : t1(t, e[t]));
}''', '''function t7(t) {
  return t5(e[t + "Custom"]) || ("eyeColor" === t ? sdEyeTone(t1(t, e[t])) : "hairColor" === t && "auto" === e[t] ? sdHairAuto() : t1(t, e[t]));
}''')
rep('''          custom: "hairColorCustom",
          ph: "autre, en anglais : ex. silver white, black with pastel pink tips",''', '''          custom: "hairColorCustom",
          ph: "autre, en anglais : ex. silver white, black with pastel pink tips",
          hint: "Auto (âge) : une couleur naturelle qui grisonne avec l'âge, par paliers moyens : quelques fils gris dès 35 ans, grisonnants dès 45, poivre et sel dès 55, surtout gris dès 65, gris et blancs dès 75. Le grisonnement varie beaucoup d'une personne à l'autre.",''')
# P131 (v156): the beard colour after the facial hair (sdBeardCol); the face fat line after the face structure in GPT's head (sdFaceFatLine)
rep('''        : t1("facialHair", e.facialHair) ||
          ("m" === e.pres ? "clean-shaven" : ""),''', '''        : sdBeardCol(t1("facialHair", e.facialHair)) ||
          ("m" === e.pres ? "clean-shaven" : ""),''')
rep('''              (rm() ? "\\n" + sdCharFace(rm()) : "") +''', '''              (rm() ? "\\n" + sdCharFace(rm()) : "") +
              (sdFaceFatLine() ? "\\n" + sdFaceFatLine() : "") +''')
# P132 (v156 self-review, seen with "Graisse : pectoraux" alone: "the chest stay soft and are never firmed"): one singular zone takes a
# singular verb (since v128 "the bust stay soft" for a woman whose only soft zone was the bust)
rep('''        o.join(", ").replace(/, ([^,]*)$/, " and $1") +
        " stay soft and are never firmed or tightened by this muscle definition"),''', '''        o.join(", ").replace(/, ([^,]*)$/, " and $1") +
        (1 === o.length && /^the (bust|belly|chest|back|front of)\\b/.test(o[0]) ? " stays soft and is" : " stay soft and are") +
        " never firmed or tightened by this muscle definition"),''')
# P133 (v156 review): a locked character's edit sees a change of "Graisse : visage" (the face entry of rB, its key and its text)
rep('''                  r9() +
                  "|" +
                  ("2d" === e.style ? "" : ru())
                );''', '''                  r9() +
                  "|" +
                  ("2d" === e.style ? "" : ru()) +
                  "|" +
                  sdFaceFatLine()
                );''')
rep('''                  nc() +
                  " Looks: " +
                  rc() +
                  "." +''', '''                  nc() +
                  (sdFaceFatLine() ? " " + sdFaceFatLine() : "") +
                  " Looks: " +
                  rc() +
                  "." +''')
# P134 (v156 review, since v122): the glute flaws in the body text of "Itérer" and of a locked character's edit (rv), as in the GPT body
# sheet; before, ticking "Tombants" on a locked character gave an empty edit
rep('''    ry() +
    sdSep() +
    t1("thighs", e.thighs) +''', '''    ry() +
    (sdGlDef() ? "; " + sdGlDef() : "") +
    sdSep() +
    t1("thighs", e.thighs) +''')
# P135 (v157, user: "les bras ne sont pas écartés, pourquoi", "je dois pouvoir écarter plus l'entrejambe"): "Écart des bras" (Marqué by
# default) and "Écart des pieds" (Hanches by default), in the sheet section of the Corps tab (sdPoseM, seedream_new.js)
rep('    faceFat: 0,\n    fatChest: 0,\n    beardColor: "auto",\n    bodyHairColor: "auto",\n  },', '    faceFat: 0,\n    fatChest: 0,\n    beardColor: "auto",\n    bodyHairColor: "auto",\n    armsOut: "marked",\n    feetW: "hips",\n  },')
rep('''    faceFat: [
      [0, "Aucune", ""],''', '''    armsOut: [
      ["light", "Léger", ""],
      ["marked", "Marqué", ""],
    ],
    feetW: [
      ["hips", "Largeur des hanches", ""],
      ["shoulders", "Largeur des épaules", ""],
      ["wide", "Écartés", ""],
    ],
    faceFat: [
      [0, "Aucune", ""],''')
rep('''          l: "Planche corps sans tête",
          hint: "Cadrée du cou aux pieds. Le visage ne vient plus que de la planche tête : pour Seedance, une image par rôle (visage, corps). Le modèle ne peut plus rater la taille de la tête.",
        },''', '''          l: "Planche corps sans tête",
          hint: "Cadrée du cou aux pieds. Le visage ne vient plus que de la planche tête : pour Seedance, une image par rôle (visage, corps). Le modèle ne peut plus rater la taille de la tête.",
        },
        {
          t: "chips",
          k: "armsOut",
          l: "Écart des bras",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Marqué : bras bien écartés, une largeur de main entre chaque main et la cuisse, pour voir la taille, les hanches et les cuisses de face et de dos. Léger : l'écart d'avant (environ 20 degrés demandés, à peu près 11 rendus par Seedream). Plus les bras s'écartent, plus le personnage rapetisse un peu dans sa case.",
        },
        {
          t: "chips",
          k: "feetW",
          l: "Écart des pieds",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "Largeur des hanches : comme avant. Largeur des épaules : un peu plus d'espace entre les jambes. Écartés : la pose en A des personnages de référence 3D, l'intérieur des cuisses bien visible.",
        },''')
# P136 (v157, user: "le duvet, les poils, même pour les femmes, on doit pouvoir choisir la couleur"): "Couleur des poils" shown with "Duvet" too, its hint and
# the hint of "Pilosité du corps" say it
rep('''hint: "Comme les cheveux : la couleur des cheveux, comme avant (naturelle avec Platine, Chauve ou une couleur écrite à la main). Une autre couleur s'écrit dans le prompt du corps ; sans réglage de pilosité, ce sont les poils fins et discrets de toutes les planches qui la prennent. Adultes.",''', '''hint: "Comme les cheveux : la couleur des cheveux, comme avant (naturelle avec Platine, Chauve ou une couleur écrite à la main ; le duvet reste clair). Une autre couleur s'écrit dans le prompt, duvet du corps et du visage compris ; sans réglage de pilosité, ce sont les poils fins et discrets de toutes les planches qui la prennent. Adultes.",''')
rep('''hint: "Peau lisse : aucun poil visible. Duvet : duvet fin et clair sur les avant-bras, le bas du dos et le ventre. Légère, Naturelle : poils fins puis non rasés sur les avant-bras et le bas des jambes, de la couleur des cheveux. Auto : de fins poils discrets, comme avant.",''', '''hint: "Peau lisse : aucun poil visible. Duvet : duvet fin sur les avant-bras, le bas du dos et le ventre, clair ou de la couleur choisie dans « Couleur des poils ». Légère, Naturelle : poils fins puis non rasés sur les avant-bras et le bas des jambes, de la couleur des cheveux ou de « Couleur des poils ». Auto : de fins poils discrets, comme avant.",''')
# P137 (v157, user: "ajoute les muscles des mollets, un curseur"): "Mollets" (calves, 0 Auto to 4), after "Graisse : genoux" (sdDetailMap)
rep('    armsOut: "marked",\n    feetW: "hips",\n  },', '    armsOut: "marked",\n    feetW: "hips",\n    calves: 0,\n  },')
rep('''    armsOut: [
      ["light", "Léger", ""],''', '''    calves: [
      [0, "Auto", ""],
      [1, "Minces", "slim calves with little muscle bulk"],
      [2, "Moyens", "calves of average size"],
      [3, "Musclés", "muscular, well-developed calves, their bulge clear in the side views"],
      [4, "Très musclés", "very large, powerful calf muscles, both heads of the calf bulging at the back of the lower leg in the side and back views"],
    ],
    armsOut: [
      ["light", "Léger", ""],''')
rep('''        { t: "bins", k: "fatKnees", l: "Graisse : genoux (au-dessus)",''', '''        { t: "bins", k: "calves", l: "Mollets", hint: "Volume des mollets. Auto : tirés au hasard avec les autres détails du corps (hauts et fins, ou bas et pleins). Minces à Très musclés : imposés, dans les deux moteurs. Leur netteté : « Muscles apparents : jambes ».", show: function () { return "person" === e.mode && !sdChild(e); } },
        { t: "bins", k: "fatKnees", l: "Graisse : genoux (au-dessus)",''')
# P138 (v157, user's render: "je dois pouvoir faire plus cambré", "sur les côtés il doit pouvoir être plus rempli, avec un curseur, il y a un
# creux"): "Cambrure : Extrême"; "Fessiers : côtés" (Auto in the middle), after "Fessiers : défauts"; with "Bas" and no saddlebags the outer
# thighs taper smoothly (sdHipPos)
rep('    armsOut: "marked",\n    feetW: "hips",\n    calves: 0,\n  },', '    armsOut: "marked",\n    feetW: "hips",\n    calves: 0,\n    glutesSide: 2,\n  },')
rep('''      ["deep", "Très cambrée", ""],
    ],''', '''      ["deep", "Très cambrée", ""],
      ["hyper", "Extrême", ""],
    ],''')
rep('''    calves: [
      [0, "Auto", ""],''', '''    glutesSide: [
      [0, "Creux", ""],
      [1, "Légèrement creux", ""],
      [2, "Auto", ""],
      [3, "Pleins", ""],
      [4, "Très pleins", ""],
    ],
    calves: [
      [0, "Auto", ""],''')
rep('''        { t: "bins", k: "fatGlutes", l: "Graisse : fessiers",''', '''        { t: "bins", k: "glutesSide", l: "Fessiers : côtés", hint: "Plein ou creux des côtés, entre la hanche et la cuisse. Auto : rien d'écrit, comme avant. Creux, Légèrement creux : un creux de chaque côté (remplace « Creux sur les côtés »). Pleins, Très pleins : côtés remplis, d'une seule courbe de la taille à la cuisse, sans creux (passe avant « Creux sur les côtés »).", show: function () { return "person" === e.mode && !sdChild(e) && "m" !== e.pres; } },
        { t: "bins", k: "fatGlutes", l: "Graisse : fessiers",''')
rep('''hint: "Creux du bas du dos, vu de profil. Très cambrée : bassin basculé vers l'avant. Avec des fessiers « Bas », le dos reste droit : leur galbe le demande. Auto : tirée au hasard, selon le galbe des fessiers.",''', '''hint: "Creux du bas du dos, vu de profil. Très cambrée : bassin basculé vers l'avant. Extrême : bassin très basculé, fessiers poussés vers l'arrière et vers le haut, le bas du dos très creusé de profil. Avec des fessiers « Bas », le dos reste droit : leur galbe le demande. Auto : tirée au hasard, selon le galbe des fessiers.",''')
# P139 (v157, user: "je dois pouvoir faire des jambes fuselées aussi, de coureur"): "Forme des jambes" (legShape), after "Cuisses", in both
# engines' leg line (sdLegShape) and in the body text of "Itérer" and of a locked edit (rv)
rep('    calves: 0,\n    glutesSide: 2,\n  },', '    calves: 0,\n    glutesSide: 2,\n    legShape: "auto",\n  },')
rep('''    glutesSide: [
      [0, "Creux", ""],''', '''    legShape: [
      ["auto", "Auto", ""],
      ["runner", "Fuselées (course)", ""],
      ["sprinter", "Puissantes (sprint)", ""],
      ["straight", "Droites", ""],
      ["curvy", "Galbées", ""],
    ],
    glutesSide: [
      [0, "Creux", ""],''')
rep('''        {
          t: "bins",
          k: "thighs",
          l: "Cuisses",''', '''        {
          t: "chips",
          k: "legShape",
          l: "Forme des jambes",
          show: function () {
            return "person" === e.mode && !sdChild(e);
          },
          hint: "La forme de toute la jambe. Fuselées : jambes longues et effilées de coureur, cuisses qui s'affinent jusqu'aux genoux, mollets hauts, chevilles fines. Puissantes : jambes de sprinteur, cuisses pleines et musclées. Droites : peu d'affinement, cuisses, genoux et mollets de largeur proche. Galbées : haut des cuisses plein, genoux bien dessinés, mollets ronds. Le volume des cuisses et des mollets reste celui de leurs curseurs. Auto : rien d'écrit, comme avant.",
        },
        {
          t: "bins",
          k: "thighs",
          l: "Cuisses",''')
rep('''                                        sdThighs() +
                                        (rj()''', '''                                        sdThighs() +
                                        (sdLegShape() ? "; " + sdLegShape() : "") +
                                        (rj()''')
rep('''    t1("thighs", e.thighs) +
    (rj() ? ", " + t1("fatLower", e.fatLower) : "") +''', '''    t1("thighs", e.thighs) +
    (sdLegShape() ? "; " + sdLegShape() : "") +
    (rj() ? ", " + t1("fatLower", e.fatLower) : "") +''')
# P140 (v157, user: "il faut ajouter l'Océanie … pour les visages", then "fais ce qu'il faut"): Oceania beyond Polynesia, two origins named in
# the prompt ("of … descent"), Aboriginal Australian and Melanesian. No preset of face traits (nl, ni): no study of their faces could be
# read and checked here, so none is written (the hint of the presets does not show). Their skin range for "Tout aléatoire" (rZ): wide,
# brown to very dark brown.
rep('''      [
        "pacific",
        "Polynésie, Pacifique",
        "of Polynesian (Pacific Islander) descent",
      ],
    ],''', '''      [
        "pacific",
        "Polynésie, Pacifique",
        "of Polynesian (Pacific Islander) descent",
      ],
      ["aboriginal", "Aborigène d'Australie", "of Aboriginal Australian descent"],
      ["melanesian", "Mélanésie (Papouasie, Fidji, Kanak)", "of Melanesian descent (Papua New Guinea, Solomon Islands, Vanuatu, Fiji or New Caledonia)"],
    ],''')
rep('''  latino: [1, 5],
  pacific: [3, 6],
};''', '''  latino: [1, 5],
  pacific: [3, 6],
  aboriginal: [4, 7],
  melanesian: [4, 7],
};''')
# P141 (v157, user: "il manque des formes de seins … il faut impérativement que tu audites et que tu rajoutes ce qu'il faut"): five shapes from
# the audit (teardrop, athletic, close-set, east-west, slender; sources and Seedream texts in seedream_new.js), GPT's own lines here; the
# hint names them; "Écartement" hidden with the close-set shape
rep('''      [
        "asym",
        "Asymétrique",''', '''      ["teardrop", "Goutte", "a natural teardrop bust line: rounded, the lower half slightly fuller than the upper, the upper slope gently sloping, no real drop"],
      ["athletic", "Athlétique", "an athletic bust line: a wide base over firm pectoral muscle, little breast tissue, flatter in profile"],
      ["close", "Rapprochée", "a close-set bust line: both sides close to the center of the chest, little space between them"],
      ["eastwest", "Vers l'extérieur", "an east-west bust line: each side angled outward, pointing away from the center of the chest"],
      ["slender", "Fine et allongée", "a slender bust line: narrow at the base and longer than wide, sitting a little low and pointing slightly downward, little fullness at the top"],
      [
        "asym",
        "Asymétrique",''')
rep('''              ? "Le prompt demande de ne pas remonter ni aplatir la forme. Si le filtre bloque, repasse sur « Auto »."
              : "Avec la tenue de référence, le haut est ample, court, sans manches, à décolleté rond classique, sans armature ni compression : il laisse le ventre visible et ne serre jamais la poitrine. Le maillot une pièce soutient toujours un peu : préfère le short ou l'ensemble de bain. Avec une tenue ordinaire, le prompt demande seulement de ne pas remonter ni aplatir la forme. Si le filtre bloque, repasse sur « Auto ».";''', '''              ? "Goutte : ronde, le bas un peu plus plein, sans vraie chute. Athlétique : base large sur des pectoraux fermes, peu de volume. Rapprochée : les deux côtés près du centre. Vers l'extérieur : chaque côté tourné vers l'extérieur. Fine et allongée : base étroite, plus longue que large, un peu basse. Le prompt demande de ne pas remonter ni aplatir la forme. Si le filtre bloque, repasse sur « Auto »."
              : "Goutte : ronde, le bas un peu plus plein, sans vraie chute. Athlétique : base large sur des pectoraux fermes, peu de volume. Rapprochée : les deux côtés près du centre. Vers l'extérieur : chaque côté tourné vers l'extérieur. Fine et allongée : base étroite, plus longue que large, un peu basse. Avec la tenue de référence, le haut est ample, court, sans manches, à décolleté rond classique, sans armature ni compression : il laisse le ventre visible et ne serre jamais la poitrine. Le maillot une pièce soutient toujours un peu : préfère le short ou l'ensemble de bain. Avec une tenue ordinaire, le prompt demande seulement de ne pas remonter ni aplatir la forme. Si le filtre bloque, repasse sur « Auto ».";''')
rep('''            return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1 && "wide" !== e.bustShape;''', '''            return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1 && "wide" !== e.bustShape && "close" !== e.bustShape;''')
# P142 (v157, user: "il faut aussi des muscles dans les fessiers … le côté des fessiers peut être très musclé"): "Fessiers : muscles" (gluteMus,
# 0 Auto to 4), after "Fessiers : côtés" (sdGlDef)
rep('    legShape: "auto",\n  },', '    legShape: "auto",\n    gluteMus: 0,\n  },')
rep('''    legShape: [
      ["auto", "Auto", ""],''', '''    gluteMus: [
      [0, "Auto", ""],
      [1, "Peu musclés", ""],
      [2, "Toniques", ""],
      [3, "Musclés", ""],
      [4, "Très musclés", ""],
    ],
    legShape: [
      ["auto", "Auto", ""],''')
rep('''        { t: "bins", k: "fatGlutes", l: "Graisse : fessiers",''', '''        { t: "bins", k: "gluteMus", l: "Fessiers : muscles", hint: "Les muscles des fessiers, indépendants de leur volume et de leur graisse. Peu musclés, Toniques : le grand fessier. Musclés, Très musclés : aussi le moyen fessier, sur le haut du côté de chaque hanche, qui remplit le côté : plus de creux là (sauf si « Fessiers : côtés » en demande un). Auto : rien d'écrit, comme avant.", show: function () { return "person" === e.mode && !sdChild(e); } },
        { t: "bins", k: "fatGlutes", l: "Graisse : fessiers",''')
# P143 (v157, user: "l'avant de la jambe, le haut de la cuisse, est toujours pareil quel que soit le curseur"): "Cuisses : avant" (thighFront,
# 0 Auto to 4), after "Cuisses" (sdThighFront, said with sdLegShape)
rep('    legShape: "auto",\n    gluteMus: 0,\n  },', '    legShape: "auto",\n    gluteMus: 0,\n    thighFront: 0,\n  },')
rep('''    gluteMus: [
      [0, "Auto", ""],''', '''    thighFront: [
      [0, "Auto", ""],
      [1, "Plat", ""],
      [2, "Arrondi", ""],
      [3, "Musclé", ""],
      [4, "Très musclé", ""],
    ],
    gluteMus: [
      [0, "Auto", ""],''')
rep('''          hint: "Indépendant des muscles et des fessiers : des cuisses fortes avec de petits fessiers, ou l'inverse.",
        },''', '''          hint: "Indépendant des muscles et des fessiers : des cuisses fortes avec de petits fessiers, ou l'inverse.",
        },
        { t: "bins", k: "thighFront", l: "Cuisses : avant", hint: "L'avant de la cuisse vu de profil, du plat au quadriceps très développé. Plat : presque droit de la hanche au genou. Arrondi : une douce courbe vers l'avant. Musclé : quadriceps bombé, le muscle en goutte visible au-dessus du genou. Très musclé : quadriceps puissant, qui élargit aussi la cuisse de face. Le volume des cuisses reste celui de « Cuisses ». Auto : rien d'écrit, comme avant.", show: function () { return "person" === e.mode && !sdChild(e); } },''')
# P144 (v157, user: "on devrait pouvoir cocher plusieurs formes à la fois … très haute et athlétique", "tu as un double « écarté »"):
# "Forme de la poitrine" drawn by sdBustChips (several ticks, one per group: shape, height, spacing, asymmetry); "Asymétrie de la poitrine"
# and "Écartement de la poitrine" folded into it (hidden, their keys kept); bustHigh (Haute, Très haute)
rep('    thighFront: 0,\n  },', '    thighFront: 0,\n    bustHigh: "auto",\n  },')
rep('''          t: "chips",
          k: "bustShape",
          l: "Forme de la poitrine",''', '''          t: "sdbust",
          k: "bustShape",
          l: "Forme de la poitrine",''')
rep('''          if ("sdshape" === r.t) return sdShapeBtns(t, n);''', '''          if ("sdshape" === r.t) return sdShapeBtns(t, n);
          if ("sdbust" === r.t) return sdBustChips(t, n);''')
rep('''            return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1 && "asym" !== e.bustShape;
          },''', '''            return !1;
          },''')
rep('''            return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1 && "wide" !== e.bustShape && "close" !== e.bustShape;
          },''', '''            return !1;
          },''')
# P145 (v157 review): "Accorder à l'origine" only for an origin with a preset of colors (r2): the two origins of Oceania have none
rep('''                  "origin" === a &&
                    "na" !== t.origin &&
                    (0, l.jsxs)("div", {
                      className: "mt-3 flex flex-wrap items-center gap-3",''', '''                  "origin" === a &&
                    "na" !== t.origin &&
                    !!r2[t.origin] &&
                    (0, l.jsxs)("div", {
                      className: "mt-3 flex flex-wrap items-center gap-3",''')
# P146 (v157 review 2): GPT's bust sentence also for a height or a spacing alone (sdBustPos); "Écartée" and "Asymétrique" ticked in the
# bust control keep what the saved shapes had in GPT (the bust named in the "idealized" check, the wide-set check of the front view); the
# bust control shows the field's hint (definitions, outfit)
rep('''("auto" !== e.bustShape || sdAsymOn() || sdWideOn() || !!sdBustSkin())''', '''("auto" !== e.bustShape || sdAsymOn() || sdWideOn() || !!sdBustSkin() || !!sdBustPos())''')
rep('''      ["low", "asym", "wide"].indexOf(e.bustShape) >= 0 &&
      t.push("the bust"),''', '''      (["low", "asym", "wide"].indexOf(e.bustShape) >= 0 || sdWideOn() || sdAsymOn()) &&
      t.push("the bust"),''')
rep('''(nv() && !np() && "m" !== e.pres && e.chest >= 1 && "wide" === e.bustShape''', '''(nv() && !np() && "m" !== e.pres && e.chest >= 1 && ("wide" === e.bustShape || sdWideOn())''')
rep('''          if ("sdbust" === r.t) return sdBustChips(t, n);''', '''          if ("sdbust" === r.t) return sdBustChips(t, n, r.hint);''')
# P147 (v157, user: "la barbe de 3 mois sur Seedream ça va pas du tout", a beard of about two weeks drawn): "Barbe fournie (3 mois)" said by
# what shows instead of a time; with it and "Barbe longue" the beard comes right after the features, before the character's "coarse
# features: …" list (sdBeardJaw drops the jaw lines it hides)
rep('''["full", "Barbe fournie (3 mois)", "a full, thick beard of about three months, rounded below the chin"]''', '''["full", "Barbe fournie (3 mois)", "a full, thick, untrimmed beard covering the cheeks, the jaw and the chin, dense and long enough to hide the line of the jaw and the shape of the chin, rounded and projecting clearly below the chin, joined to a full moustache"]''')
rep('''  return (i && o.push(i), l && o.push(l), t && o.push(t), o.join(", "));''', '''  var bf = "f" !== e.pres && ["full", "long"].indexOf(e.facialHair) >= 0;
  return (bf && t && o.push(t), i && o.push(i), l && o.push(l), !bf && t && o.push(t), o.join(", "));''')
# P148 (v157, user: "il devrait être torse nu, sinon Seedance va vouloir utiliser le haut"): GPT's head sheet with the placeholder top shows
# the bare neck and shoulders (sdBareNeck; its line starts with "Bare neck", which the state-change prompt already leaves out)
rep('''          nv() && "m" === e.pres
            ? "Bare neck, no clothing visible.\\n"
            : sdFreeText()''', '''          sdBareNeck()
            ? sdBareNeckGpt()
            : nv() && "m" === e.pres
            ? "Bare neck, no clothing visible.\\n"
            : sdFreeText()''')
# P149 (v157 review 3): the head edit (locked character) says the bare neck when the head sheet shows it, compares it as such, and drops
# "Fully clothed" there; GPT never says the bust soft, unlifted or never firmed next to a height set ("Haute", "Très haute")
rep('''              return t ? nL() + "|" + nz() : nR();''', '''              return t ? (sdBareNeck() ? "bare" : nL()) + "|" + nz() : nR();''')
rep('''                ? "Clothing at the neckline: «" +
                    nL() +
                    "»." +
                    u +''', '''                ? (sdBareNeck() ? sdBareNeckGpt().trim() : "Clothing at the neckline: «" + nL() + "».") +
                    u +''')
rep('''      (!s && r("outfit") && !nv() ? " Fully clothed." : "") +''', '''      (!s && r("outfit") && !nv() && !(u && sdBareNeck()) ? " Fully clothed." : "") +''')
rep('''      (["low", "asym", "wide"].indexOf(e.bustShape) >= 0 || sdWideOn() || sdAsymOn()) &&
      t.push("the bust"),''', '''      (["low", "asym", "wide"].indexOf(e.bustShape) >= 0 || sdWideOn() || sdAsymOn()) &&
      !sdBustHighOn() &&
      t.push("the bust"),''')
rep('''    "m" !== e.pres && e.chest >= 1 && t.push("the bust"),
    ("belly" === e.absStyle ||''', '''    "m" !== e.pres && e.chest >= 1 && !sdBustHighOn() && t.push("the bust"),
    ("belly" === e.absStyle ||''')
# P150 (v157b, GPT audit of v157, checked): the head signature keeps the makeup named in "Tenue en un seul texte" (sdFreeMkSig), the rest of
# that line still left out (a change of trousers is not a new face)
# (before sdSigExtra, which sdSigState expects at the very end of a signature)
rep('''      );
    })
    .join("\\n")) + sdSigExtra();
}
let au = "fiche-perso-seedance-v1";''', '''      );
    })
    .join("\\n") + (sdFreeMkSig() ? "\\nMakeup: " + sdFreeMkSig() : "")) + sdSigExtra();
}
let au = "fiche-perso-seedance-v1";''')
# P151 (v157b review, the GPT audit of v157 checked): by day the sources of an interior with windows are switched off or barely visible (the
# hint says it), unless the description says otherwise (sdSrcDesc), as at golden hour
rep('''          (o.length ? ", with " + l(o) + " switched off or barely visible" : "")''', '''          (o.length ? ", with " + l(o) + " switched off or barely visible" + sdSrcDesc() : "")''')
# P152 (v157b review): the locked place edit carries no description, so its light line names the description the sources defer to
rep('''                "Light and atmosphere: «" +
                rr() +''', '''                "Light and atmosphere: «" +
                rr().replace(sdSrcDesc(), sdSrcDesc() && ", unless the place description «" + t5(e.objDesc) + "» says otherwise") +''')
# P153 (v157c, user: "bas du ventre arrondi on peut pas le mettre"; "je ne peux pas dire plein et doux ça existe pas"): "Ventre rond"
# already said a flat belly with a small, rounded lower belly: named for it; the first step of "Fessiers : muscles" becomes "Doux"
# (sdGlDef), its hint with it
rep('''        "belly",
        "Ventre rond",''', '''        "belly",
        "Bas du ventre arrondi",''')
# P153 (v157c review): with "Vers l'avant" the bust stays in rw() (the realism lines of both engines and of an asymmetric bust, P146), only
# the GPT words "gravity-affected" go, as Seedream's "shaped by gravity" (sdMus)
rep('''                                      " exactly as described, with soft, natural, gravity-affected shapes as on an ordinary real adult;''', '''                                      " exactly as described, with soft, natural" + (sdBustFwdOn() && u.indexOf("the bust") >= 0 ? "" : ", gravity-affected") + " shapes as on an ordinary real adult;''')
rep('''      [1, "Peu musclés", ""],''', '''      [1, "Doux", ""],''')
rep('''Peu musclés, Toniques : le grand fessier. Musclés, Très musclés''', '''Doux : une chair souple et lisse, jamais relâchée, sauf si un autre réglage la fait tomber (galbe « Bas », « Tombants », « Mous », graisse des fessiers dès « Marquée », corpulence Forte). Toniques : le grand fessier, ferme. Musclés, Très musclés''')
# P154 (v157d, user's render: "bony, clearly drawn knees" on every slim body, "sturdy ankles" and "short, strong fingers" drawn on a fine
# one; "oui pour tes ajouts"): "Genoux" and "Chevilles" after "Graisse : genoux", "Doigts" at the end of "Bras" (sdDetailMap)
rep('''    fatKnees: 0,
''', '''    fatKnees: 0,
    knees: "auto",
    ankles: "auto",
    fingers: "auto",
''')
rep('''    fatKnees: [
''', '''    knees: [
      ["auto", "Auto", ""],
      ["smooth", "Lisses", ""],
      ["bony", "Marqués", ""],
    ],
    ankles: [
      ["auto", "Auto", ""],
      ["slim", "Fines", ""],
      ["sturdy", "Robustes", ""],
    ],
    fingers: [
      ["auto", "Auto", ""],
      ["long", "Longs et fins", ""],
      ["short", "Courts et forts", ""],
    ],
    fatKnees: [
''')
rep('''jamais dessinés ni saillants. Masqué en corpulence Forte, qui décrit déjà le gras de chaque zone.", show: function () { return 4 !== +e.fat; } },
        {
          t: "chips",
          k: "thighGap",''', '''jamais dessinés ni saillants. Masqué en corpulence Forte, qui décrit déjà le gras de chaque zone.", show: function () { return 4 !== +e.fat; } },
        { t: "chips", k: "knees", l: "Genoux", hint: "Remplace le genou tiré au hasard. Auto : genoux osseux en corpulence Mince ou Très mince, arrondis en Enrobée ou Forte, au hasard en Moyenne. Lisses : la rotule à peine dessinée, sans la rougeur des genoux. Marqués : genoux osseux, nets. Sans effet avec « Graisse : genoux (au-dessus) » dès « Légère » (genoux arrondis) ; Marqués sans effet en corpulence Forte.", show: function () { return "person" === e.mode && !sdChild(e); } },
        { t: "chips", k: "ankles", l: "Chevilles", hint: "Remplace la cheville tirée au hasard. Auto : fines en corpulence Très mince, robustes en Forte, au hasard sinon. Sans effet quand « Forme des jambes » les décrit déjà (Fuselées (course), Galbées, avec « Mollets » sur Auto, en corpulence Très mince à Moyenne) ; dites aussi avec « Droites ».", show: function () { return "person" === e.mode && !sdChild(e); } },
        {
          t: "chips",
          k: "thighGap",''')
rep('''        { t: "sdsec", id: "poitrine",''', '''        { t: "chips", k: "fingers", l: "Doigts", hint: "Remplace les doigts tirés au hasard. Auto : au hasard ; en corpulence Forte, des doigts longs et fins deviennent charnus.", show: function () { return "person" === e.mode && !sdChild(e); } },
        { t: "sdsec", id: "poitrine",''')
# P155 (v158, user: "une section de la planche spéciale pour ça", "cache à un endroit un bouton spécial"): "Agent 3D", a closed panel at
# the end of "Poitrine" (sdAgent3d), its choices in the state (a3dTop, a3dGrade; a3dNip and a3dAre, the nipples and areolas; Auto by default)
rep('''    knees: "auto",\n''', '''    knees: "auto",\n    a3dTop: "auto",\n    a3dGrade: "auto",\n    a3dNip: "auto",\n    a3dAre: "auto",\n''')
rep('''        { t: "sdsec", id: "taille",''', '''        { t: "sdagent3d", show: function () { return sdA3dOn(e); } },
        { t: "sdsec", id: "taille",''')
rep('''          if ("sdbust" === r.t) return sdBustChips(t, n, r.hint);''', '''          if ("sdbust" === r.t) return sdBustChips(t, n, r.hint);
          if ("sdagent3d" === r.t) return sdAgent3d(t, n);''')
open('new/patched.js','w',encoding='utf-8').write(src)
orig=open('original/Planches_de_référence_pour_Seedance.html',encoding='utf-8').read()
assert orig.count('.bottom-24{bottom:6rem}')==1
orig=orig.replace('.bottom-24{bottom:6rem}', '.bottom-24{bottom:var(--sd-toast-bottom,6rem)}')
assert orig.count('.pb-32{padding-bottom:8rem}')==1
orig=orig.replace('.pb-32{padding-bottom:8rem}', '.pb-32{padding-bottom:max(8rem,calc(var(--sd-copy-bar-height,0px) + 1rem))}')
# P54 dark theme: lighter destructive red (and dark text on it), so red text (warnings, red outfit option, word-count alert) passes WCAG AA on dark cards
for a in [':root:not([data-theme=light]){', ':root[data-theme=dark]{']:
    assert orig.count(a+'--background:220 10% 7%;')==1, a
    orig=orig.replace(a+'--background:220 10% 7%;', a+'--destructive:0 84% 66%;--destructive-foreground:220 10% 8%;--background:220 10% 7%;')
# P108 (v152, user: "il faut améliorer le design de mon html en utilisant la puissance de ce skill", design-taste-frontend): a restyle
# layer, design.css, inserted after the compiled CSS as one line (the file is split on newlines below); no markup, text or behaviour change
import re as _re2
_css = _re2.sub(r'/\*.*?\*/', '', open('design.css', encoding='utf-8').read(), flags=_re2.S)
_css = _re2.sub(r'\s+', ' ', _css).strip()
assert '</style' not in _css and '\n' not in _css and orig.count('</style>') == 1
orig = orig.replace('</style>', '</style><style id=sd-design>' + _css + '</style>', 1)
L=orig.split('\n')
assert '</script' not in src
# P36 English page defaults before the script runs (sdSetLang keeps lang and title in sync afterwards)
if LANG=='en':
    title=json.load(open('i18n/extra.json',encoding='utf-8'))['Fiche personnage pour Seedance']
    for a,b in [('<html lang=fr','<html lang=en'),('<title>Fiche personnage pour Seedance</title>','<title>'+title+'</title>')]:
        assert L[0].count(a)==1,a
        L[0]=L[0].replace(a,b)
open('new/merged.html','w',encoding='utf-8').write('\n'.join([L[0],L[1],'    <script type="module">'+src+'</script>']+L[3:]))
print('ok',len(src))
