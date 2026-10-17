try {
  var sdCss = document.createElement("style");
  sdCss.textContent = "@media (min-width:1024px){aside.lg\\:sticky{max-height:calc(100vh - 2rem);overflow-y:auto;overscroll-behavior:contain;padding-bottom:1rem}}";
  document.head.appendChild(sdCss);
} catch (er) {}
var sdLang = "fr",
  sdModelNow = "",
  sdCur = null;
function sdT(fr, en) {
  return "en" === sdLang ? en : fr;
}
function sdNum(n) {
  return n.toLocaleString("en" === sdLang ? "en-US" : "fr-FR");
}
/* ===== Seedream 5.0 : constructeurs de prompts (Personne, Photo, sans photo de départ, création) ===== */
/* New person cases reuse GPT prose; the existing person, animal and object builders keep their routing. */
function sdOk(t) {
  return !0;
}
function sdNative(t) {
  return "person" !== t.mode || sdChild(t) || (!t.photo && "photo" === t.style);
}
function sdNat(t) {
  return "seedream" === t.model && sdNative(t);
}
/* Availability grows, but automatic engine choices and old GPT saves keep the published policy. */
function sdAuto(t) {
  return !(t.locked && t.base && t.base.mode === t.mode) && ("person" !== t.mode || ("photo" === t.style && !t.photo));
}
function sdOff(t) {
  return "seedream" === t.model && !sdOk(t);
}
function sdWords(s) {
  return String(s || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
function sdList(a) {
  return a.join(", ").replace(/, ([^,]*)$/, " and $1");
}
function sdWho() {
  return "f" === e.pres ? "woman" : "m" === e.pres ? "man" : "person";
}
/* latest head copy per model and subject: an older copy that finishes last must not overwrite a newer one */
var sdHeadCopySeq = {};
/* tooltip on hover / keyboard focus / tap of the "?" for a control */
function sdTip(control, text, id) {
  return (0, l.jsxs)("span", {
    className: "sd-tip",
    style: { position: "relative", display: "inline-flex", alignItems: "center", gap: "0.5rem", maxWidth: "100%" },
    children: [
      (0, l.jsx)("style", {
        children:
          ".sd-tip-pop{position:absolute;left:0;top:calc(100% + 8px);z-index:40;width:max-content;max-width:min(340px,82vw);padding:.65rem .8rem;border-radius:.75rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-size:.875rem;line-height:1.4;font-weight:500;box-shadow:0 6px 24px rgba(0,0,0,.18);opacity:0;visibility:hidden;transform:translateY(-2px);transition:opacity .15s ease .25s,transform .15s ease .25s,visibility 0s linear .4s;pointer-events:none}" +
          ".sd-tip:hover .sd-tip-pop,.sd-tip:focus-within .sd-tip-pop{opacity:1;visibility:visible;transform:none;transition-delay:.25s,.25s,0s}" +
          ".sd-tip-btn{display:inline-flex;align-items:center;justify-content:center;width:1.25rem;height:1.25rem;border-radius:999px;border:1px solid hsl(var(--border));font-size:.75rem;font-weight:700;color:hsl(var(--muted-foreground));background:transparent;cursor:help}" +
          ".sd-tip-btn:focus-visible{outline:2px solid hsl(var(--ring));outline-offset:2px}" +
          "@media (prefers-reduced-motion: reduce){.sd-tip-pop{transition:none}}",
      }),
      control,
      (0, l.jsx)("button", {
        type: "button",
        className: "sd-tip-btn",
        "aria-label": "Aide",
        "aria-describedby": id,
        children: "?",
      }),
      (0, l.jsx)("span", { id: id, role: "tooltip", className: "sd-tip-pop", children: text }),
    ],
  });
}
function sdPhotoTip(t) {
  /* v112: by type (it showed the person text for an animal or an object); no line that contradicts the cards */
  return [
    "animal" === t.mode
      ? "Pour créer un animal d'après une photo : un vrai animal ou une image trouvée. Les planches reprennent l'animal de la photo, et tes réglages peuvent y ajouter des accessoires, un état du moment ou des éléments fantastiques."
      : "object" === t.mode
        ? "house" === t.objCat || "interior" === t.objCat
          ? "Pour créer un lieu d'après une photo : les planches reprennent son architecture, son aménagement, ses matières et ses couleurs, et tes réglages choisissent la lumière et le moment."
          : "Pour créer un objet d'après une photo : les planches reprennent sa forme, ses matières, ses couleurs et son usure, et tes marques, détails et état du moment s'y ajoutent."
        : "Pour créer un personnage d'après la photo d'une personne réelle, uniquement avec son accord. Les planches reprennent son visage et ses cheveux, ses habits avec « Utiliser les habits de la photo » (activé par défaut), et son corps avec « Garder le corps tel quel ».",
    "Joins la photo là où une carte le demande.",
  ].map(function (x, i) {
    return (0, l.jsx)("span", { style: { display: "block", marginTop: i ? "0.45rem" : 0 }, children: x }, i);
  });
}
function sdPhotoOnlyTip(t) {
  var pl = "object" === t.mode && ("house" === t.objCat || "interior" === t.objCat);
  return [
    "person" === t.mode
      ? "Coché : ta photo est reprise telle quelle, sans rien inventer ni retoucher (visage, cheveux, maquillage, corps, tenue, accessoires). Seuls changent les angles de vue, la pose, le fond gris et la lumière de studio."
      : "animal" === t.mode
        ? "Coché : ta photo est reprise telle quelle, sans rien inventer ni retoucher (race, pelage, marques, accessoires, corps). Seuls changent les angles de vue, la pose, le fond gris et la lumière de studio."
        : pl
          ? "Coché : ta photo est reprise telle quelle, sans rien inventer ni retoucher (architecture, aménagement, matières, couleurs, usure), avec sa lumière et son moment, sans version de nuit. Seuls changent les angles de vue" + ("house" === t.objCat ? ", et aussi le décor et la lumière avec « Sol et fond gris neutre »." : ".")
          : "Coché : ta photo est reprise telle quelle, sans rien inventer ni retoucher (forme, matières, couleurs, usure, marques). Seuls changent les angles de vue, le fond gris et la lumière de studio.",
    "person" === t.mode
      ? "Décoché : la photo donne le visage et les cheveux, et tu choisis si elle donne aussi les habits et le corps."
      : "animal" === t.mode
        ? "Décoché : la photo donne l'animal, et tes réglages peuvent y ajouter des accessoires, un état du moment ou des éléments fantastiques."
        : pl
          ? "Décoché : la photo donne le lieu, et tes réglages choisissent la lumière et le moment."
          : "Décoché : la photo donne l'objet, et tes marques, détails et état du moment s'y ajoutent.",
  ].map(function (x, i) {
    return (0, l.jsx)("span", { style: { display: "block", marginTop: i ? "0.45rem" : 0 }, children: x }, i);
  });
}
/* the "?" of "On an invisible mannequin", for a garment kept as in the photo (sdKeepMannequin) */
function sdMannequinTip() {
  return sdT(
    "Présente le vêtement comme porté, sur un mannequin invisible : il prend la forme d'un corps, sans personne ni mannequin visibles (vues 1 et 2, cases de gauche et du milieu du triptyque). La vue 3 reste à plat. Cela change la présentation de ta photo (par exemple une veste posée sur un lit ou sur un cintre) ; le vêtement lui-même (coupe, matières, couleurs, marquages) reste identique.",
    "Shows the garment as if worn, on an invisible mannequin: it takes the shape of a body, with no person and no visible mannequin (views 1 and 2, left and middle panels of the triptych). View 3 stays laid flat. This changes how your photo presents it (a jacket lying on a bed or on a hanger, for example); the garment itself (cut, materials, colors, markings) stays the same.",
  );
}
/* message shown after "Copier corps" in Seedream: what to attach, or that the head sheet is missing / outdated */
function sdIterCopyMsg(t) {
  var op = sdOp(t);
  return "join" === op
    ? sdT("Copié. Dans Seedream, ajoute ta planche corps sans tête (image 1) puis la planche tête (image 2).", "Copied. In Seedream, add your headless body sheet (image 1) then the head sheet (image 2).")
    : "heads" === op
      ? sdT("Copié. Dans Seedream, ajoute ta planche habillée agrandie (image 1) puis la planche tête (image 2).", "Copied. In Seedream, add your extended dressed sheet (image 1) then the head sheet (image 2).")
      : "dress" === op
        ? sdT("Copié. Dans Seedream, ajoute ta planche corps sans tête (image 1).", "Copied. In Seedream, add your headless body sheet (image 1).")
        : "dressMine" === op
        ? sdT("Copié. Dans Seedream, ajoute ta planche corps validée, sans tête ou assemblée (image 1).", "Copied. In Seedream, add your approved body sheet, headless or combined (image 1).")
        : sdT("Copié. Dans Seedream, ajoute la planche à retoucher (image 1).", "Copied. In Seedream, add the sheet to retouch (image 1).");
}
function sdBodyCopyMsg(t) {
  if (sdChildHl(t)) return "";
  /* v112: a GPT prompt rewritten for Seedream (sdGptSd): "Mise en planche seulement" takes only the photos; otherwise the head sheet is
     image 1, then the photo when the body needs it (sdBodyPhotoAny); no shape guide */
  var gp = !sdNative(t);
  if (gp && an()) return sdT("Copié. Dans Seedream, ajoute ta photo ou tes photos.", "Copied. In Seedream, add your photo or photos.");
  if (nw() && !gp)
    return t.sdShapeRef
      ? sdT("Copié. Dans Seedream, ajoute ton image guide comme image 1.", "Copied. In Seedream, add your shape guide as image 1.")
      : "";
  var f = rU("tete");
  if (!t.sdHeadSig)
    return sdT(
      "Copié. Tu n'as pas encore copié le prompt tête : crée d'abord la planche tête, puis ajoute-la comme image 1 dans Seedream.",
      "Copied. You have not copied the head prompt yet: make the head sheet first, then add it as image 1 in Seedream.",
    );
  var st = sdSigState(t.sdHeadSig);
  if ("changed" === st)
    return sdT(
      "Copié. Le visage a changé depuis le dernier prompt tête copié : refais la planche tête, puis ajoute-la comme image 1.",
      "Copied. The face has changed since the last copied head prompt: make the head sheet again, then add it as image 1.",
    );
  if ("legacy" === st)
    return sdT(
      "Copié. Ta planche tête vient d'une version précédente de l'outil : refais-la seulement si tu as changé la corpulence depuis, sinon ajoute-la comme image 1.",
      "Copied. Your head sheet comes from an earlier version of the tool: make it again only if you changed the build since, otherwise add it as image 1.",
    );
  if (gp)
    return sdBodyPhotoAny(t)
      ? sdT(
          "Copié. Dans Seedream, ajoute la planche tête (" + f + ") comme image 1 et ta photo comme image 2.",
          "Copied. In Seedream, add the head sheet (" + f + ") as image 1 and your photo as image 2.",
        )
      : sdT(
          "Copié. Dans Seedream, ajoute la planche tête (" + f + ") comme image 1.",
          "Copied. In Seedream, add the head sheet (" + f + ") as image 1.",
        );
  return sdUseBodyImg()
    ? sdT(
        "Copié. Dans Seedream, ajoute la planche tête (" + f + ") comme image 1 et ta planche habillée comme image 2.",
        "Copied. In Seedream, add the head sheet (" + f + ") as image 1 and your dressed sheet as image 2.",
      )
    : t.sdShapeRef && "person" === t.mode && !sdChild(t)
      ? sdT(
          "Copié. Dans Seedream, ajoute la planche tête (" + f + ") comme image 1 et ton image guide comme image 2.",
          "Copied. In Seedream, add the head sheet (" + f + ") as image 1 and your shape guide as image 2.",
        )
      : sdT(
          "Copié. Dans Seedream, ajoute la planche tête (" + f + ") comme image 1.",
          "Copied. In Seedream, add the head sheet (" + f + ") as image 1.",
        );
}
/* v112: message after copying a head or object prompt made from a photo in Seedream */
function sdSrcCopyMsg(t) {
  return "seedream" === t.model && t.photo && !sdChild(t)
    ? an()
      ? sdT("Copié. Dans Seedream, ajoute ta photo ou tes photos.", "Copied. In Seedream, add your photo or photos.")
      : sdT("Copié. Dans Seedream, ajoute ta photo comme image 1.", "Copied. In Seedream, add your photo as image 1.")
    : "";
}
/* "Habiller": the same outfit text as the with-head body prompt (sdHeadOutfit), so the dressed sheet used as image 2 matches that prompt */
function sdPresetDress() {
  var p = sdPos(),
    m = "m" === e.pres;
  return (
    "the outfit is replaced by " +
    sdHeadOutfit() +
    "; opaque, plain, no logos; " +
    p +
    " body stays exactly as in image 1, every visible outline in place: the " +
    (m ? "chest keeps its volume and shape" : "bust keeps its volume" + ("low" === e.bustShape && e.chest >= 2 ? ", its low hang and its lowest point" : " and its shape")) +
    ", the glutes and legs keep their shape"
  );
}
/* v104 "Habiller avec ma tenue": the approved body sheet (headless or combined) dressed in the outfit of the Tenue tab, for a man or a woman.
   The outfit is read as if the reference outfit were off (bodyRef: false), so the choices of the Tenue tab are used even while the body sheet keeps the reference outfit. Live text: it follows the Tenue tab. */
function sdPresetDressMine() {
  var p = sdPos(),
    o = rq(Object.assign({}, e, { bodyRef: !1 }), function () {
      return t6(nR()) + ". " + nx();
    }),
    fr = rq(Object.assign({}, e, { bodyRef: !1 }), sdFreeText);
  return (
    "the outfit is replaced by this outfit, identical in all four views: " +
    o +
    (fr ? " Dressed in exactly this outfit in every view, with nothing added or left out. " : " Fully dressed in it in every view. ") +
    t6(p) +
    " body stays exactly as in image 1 under the clothes: the same build, proportions and posture; the " +
    ("m" === e.pres ? "chest" : "bust") +
    ", waist, hips, glutes and legs keep their shape and read through the fit of the clothes; the head, face and hair, if image 1 shows them, stay exactly as they are"
  );
}
/* v104 "Fantastique" (GPT: animal, house, interior): the elements were one list item in a prompt that asks for a believable, ordinary photo, and came out faint or missing.
   They are now the defining feature, physically present and impossible to miss, and a missing or faint element is a missed requirement in the generation limit. */
function sdFantasyText(x, place) {
  return (
    "Fantastic elements, the defining feature of this " +
    (place ? "place" : "animal") +
    " and impossible to miss: " +
    x +
    ". Each one is clearly visible, at the size described, and unmistakable in every view where its part of the " +
    (place ? "place" : "body") +
    " faces the camera, shown as physically present in this world, with real light, shadows and reflections on it and around it; never toned down below what is described, shrunk, hidden or replaced by something ordinary."
  );
}
function sdFantasyMiss() {
  /* v105: not in "Mise en planche seulement" (an()), whose prompts ignore the fantasy field: a stale value left an orphan requirement */
  return an()
    ? ""
    : ("animal" === e.mode && t5(e.afantasy)) || ("object" === e.mode && n9() && t5(e.objFantasy))
    ? " A fantastic element that is missing, barely visible or turned into something ordinary is a clearly missed requirement."
    : "";
}
/* v104 house (GPT): "Décor entier" (as before) or "Sol et fond gris neutre": the house alone on a plain grey floor in front of a plain grey backdrop,
   so a garden, a street or a sky never get in the way of the integration; it keeps its contact shadows on the floor. */
function sdHouseGrey() {
  return "object" === e.mode && "house" === e.objCat && "grey" === e.objBg;
}
function sdHouseBg() {
  return sdHouseGrey()
    ? "Isolated presentation: the house alone, standing on a flat, plain mid-grey floor in front of a seamless plain mid-grey backdrop, like a building standing in a large studio; no garden, trees, fences, street, sky, background landscape or neighbouring buildings. Only the house itself and what is attached to it (foundations, steps, porch, terrace) are shown, and it casts soft, realistic contact shadows on the grey floor.\n"
    : "";
}
function sdHouseGreyLight() {
  var s = "Daytime: neutral daylight from the upper left, like soft sunlight, lighting the house and casting its shadows softly on the grey floor; the backdrop stays plain grey, with no sky",
    u = "Night: dim, cool ambient light, the grey floor and backdrop barely visible; the house lit by its own warm interior light through the windows and by its exterior lamps, which light the grey floor around it",
    c = "Dusk: dim, cool blue ambient light on the house and the grey floor, the windows already lit warmly from inside";
  return "day" === e.objTime
    ? s + "."
    : "night" === e.objTime
      ? u + "."
      : "dusk" === e.objTime
        ? c + "."
        : s + " (top row). " + u + " (bottom row).";
}
/* v110: selections apply to separate cards. Empty older saves keep the established three views. */
var SD_PLACE_LBL = {
  house: [["FACE", "FRONT"], ["TROIS QUARTS", "THREE-QUARTER"], ["ARRIÈRE", "REAR"], ["CÔTÉ GAUCHE", "LEFT SIDE"], ["CÔTÉ DROIT", "RIGHT SIDE"], ["VUE AÉRIENNE", "AERIAL"]],
  interior: [["ENTRÉE", "ENTRANCE"], ["COIN OPPOSÉ", "OPPOSITE CORNER"], ["FENÊTRES", "WINDOWS"], ["MUR GAUCHE", "LEFT WALL"], ["MUR DROIT", "RIGHT WALL"], ["PLONGÉE", "HIGH ANGLE"]],
};
function sdIsPlace(t) {
  return "object" === t.mode && ("house" === t.objCat || "interior" === t.objCat);
}
function sdViewChoice(t) {
  var v = sdIsPlace(t) ? t.placeViews : t.objViews,
    max = sdIsPlace(t) || "clothing" === t.objCat ? 5 : 6;
  return Array.isArray(v) ? [0, 1, 2, 3, 4, 5, 6].filter(function (i) { return i <= max && v.indexOf(i) >= 0; }).slice(0, 4) : [];
}
function sdPlaceSel(t) {
  var v = sdViewChoice(t);
  return v.length ? v : [0, 1, 2];
}
function sdObjSel(t) {
  var v = sdViewChoice(t);
  return v.length ? v : "clothing" === t.objCat ? [0, 1, 5] : [2, 6, 5];
}
function sdPlaceWin() {
  return nh("objLightSel", "objLightOpts", "objLight").indexOf("daylight through the windows") >= 0;
}
function sdPlaceViewTxt() {
  return "house" === e.objCat
    ? ["front view", "three-quarter view from the front left", "rear view", "exact left side view", "exact right side view", sdHouseGrey() ? "high aerial three-quarter view showing the roof" : "high aerial three-quarter view showing the roof and the plot"]
    : ["wide view from the entrance door", "wide view from the opposite corner, looking back toward the entrance", sdPlaceWin() ? "view toward the main windows" : "view toward the main light source", "view along the left wall", "view along the right wall", "high-angle view from a top corner showing the whole layout"];
}
function sdObjViewTxt() {
  var c = e.objCat;
  return ["front view", "vehicle" === c ? "rear view" : "back view", "three-quarter front view", "exact left side view", "exact right side view", "clothing" === c ? "the garment laid flat, seen from directly above" : "top view, seen from directly above", "three-quarter rear view from the opposite corner: its back and its other side both show, camera slightly above it"];
}
/* v113: one "Véhicule" category for every vehicle: its presentation follows the kind written in the description, then in the real model's name:
   a boat on a cradle, an aircraft on its landing gear, a two-wheeler upright, a tracked vehicle on its tracks, a car or truck on its wheels, and
   a few other vehicles (carriage, sled, train, cable car, quad, kart...) in their normal parked position. The kind named first wins (a "SUV with a
   bike rack" is a car), the longer name when two start at the same word ("flying boat", "tank truck"). Nothing recognized: the car text of v112
   and before, or with a photo the normal parked position. */
var SD_VEH = [
  ["water", /(?<!(space|air|star|mother|rocket) )\bships?\b|\b(\w*boats?|yachts?|dinghy|dinghies|canoes?|kayaks?|ferry|ferries|submarines?|trawlers?|catamarans?|trimarans?|gondolas?|rafts?|jet[- ]?skis?|(steam|war|battle|flag|cargo|container|cruise|pirate|sail|sailing|merchant|tall) ?ships?|galleons?|schooners?|frigates?|aircraft carriers?|porte-avions?|bateaux?|navires?|voiliers?|barques?|canots?|sous-marins?|peniches?|chalutiers?|paquebots?|vedettes?|zodiacs?)\b/],
  ["air", /\b(air ?planes?|aeroplanes?|war ?planes?|planes?|aircrafts?|airliners?|jetliners?|biplanes?|gliders?|seaplanes?|flying boats?|helicopters?|helicos?|gyrocopters?|autogyros?|airships?|blimps?|zeppelins?|space ?ships?|star ?ships?|mother ?ships?|rocket ?ships?|space rockets?|spacecrafts?|space shuttles?|drones?|avions?|helicopteres?|planeurs?|hydravions?|dirigeables?|vaisseaux?|fusees?|navettes? spatiales?|boeing|airbus|cessna|concorde|learjet|gulfstream|antonov|sukhoi|embraer|sikorsky|eurocopter)\b|\bjets?\b(?![- ]?(black|age|inspired|style|set|stream|skis?)\b)/],
  ["two", /\b(motorcycles?|motorbikes?|motor bikes?|scooters?|mopeds?|bicycles?|push ?bikes?|bikes?|e-bikes?|dirt bikes?|motocross|vespa|harley|ducati|kawasaki|trottinettes?|motos?|velos?|vtt|velomoteurs?|mobylettes?|cyclomoteurs?)\b/],
  ["track", /\b(battle tanks?|army tanks?|military tanks?|tank destroyers?|bulldozers?|excavators?|snowmobiles?|motoneiges?|half-tracks?|tracked|chars?|chenilles?|pelleteuses?)\b|(?<!(fuel|gas|petrol|water|oil|diesel|septic|fish|full|empty) )(?<!-)\btanks?\b(?![- ](tops?|trucks?|cars?|caps?)\b)/],
  ["car", /\b(cars?|race ?cars?|hyper ?cars?|super ?cars?|sports? cars?|sedans?|saloons?|hatchbacks?|coupes?|convertibles?|suvs?|pick-?ups?|trucks?|tank(er)? trucks?|lorry|lorries|vans?|minivans?|minibus(es)?|buses|bus|jeeps?|limousines?|limos?|taxis?|cabs?|roadsters?|station wagons?|estate cars?|4x4|voitures?|camions?|camionnettes?|fourgons?|fourgonnettes?|berlines?|citadines?|cabriolets?|autobus|autocars?)\b/],
  ["gen", /\b(horse-drawn|carriages?|carts?|wagons?|sleds?|sledges?|sleighs?|hovercrafts?|trains?|locomotives?|trams?|tramways?|trolleys?|cable cars?|gondola lifts?|ski lifts?|quad bikes?|quads?|atvs?|go-?karts?|karts?|caleches?|charrettes?|traineaux?|luges?)\b/],
];
function sdVehKind() {
  var x = (t5(e.objDesc) + " " + ("real" === e.objBrand ? t5(e.objModel) : "")).trim(),
    n = x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[‘’]/g, "'"),
    best = null;
  SD_VEH.forEach(function (k) {
    var m = k[1].exec(n);
    m && (!best || m.index < best.i || (m.index === best.i && m[0].length > best.l)) && (best = { k: k[0], i: m.index, l: m[0].length });
  });
  return best ? best.k : e.photo ? "gen" : "car";
}
function sdVehicle() {
  return {
    water: "The boat sits upright and level on a low, plain grey cradle on the seamless grey studio floor, the whole hull visible down to the keel, with a soft contact shadow; no water around it; hatches and covers closed.",
    air: "The aircraft stands level on the seamless grey studio floor on its landing gear, skids or floats, with a soft contact shadow; doors, hatches and canopy closed, rotors and propellers at rest.",
    two: "The vehicle stands upright on its wheels on the seamless grey studio floor, front wheel pointing straight ahead, with a soft contact shadow; no rider.",
    track: "The vehicle stands level on its tracks on the seamless grey studio floor, with a soft contact shadow; all hatches closed.",
    car: "The vehicle stands on its wheels on the seamless grey studio floor, wheels pointing straight ahead, all doors, hood and trunk closed, with a soft contact shadow.",
    gen: "The vehicle stands in its normal parked position on the seamless grey studio floor, with a soft contact shadow; doors, hatches and covers closed.",
  }[sdVehKind()];
}
function sdPlaceThumb(t0, g, h, cls) {
  var obj = !sdIsPlace(t0),
    t = !obj && t0.photo && t0.photoOnly ? Object.assign({}, t0, { objTime: "day" }) : t0,
    sel = obj ? sdObjSel(t) : sdPlaceSel(t),
    max = 4,
    n = sel.length,
    lbl = obj
      ? [
          ["FACE", "FRONT"],
          "vehicle" === t.objCat ? ["ARRIÈRE", "REAR"] : ["DOS", "BACK"],
          ["TROIS QUARTS", "THREE-QUARTER"],
          ["CÔTÉ GAUCHE", "LEFT SIDE"],
          ["CÔTÉ DROIT", "RIGHT SIDE"],
          "clothing" === t.objCat ? ["À PLAT, DESSUS", "LAID FLAT"] : ["DESSUS", "TOP"],
        ]
      : SD_PLACE_LBL["house" === t.objCat ? "house" : "interior"].slice();
  !obj && "interior" === t.objCat && !(t0.photo && t0.photoOnly) && !rq(t, sdPlaceWin) && (lbl[2] = ["LUMIÈRE", "LIGHT"]);
  obj && "clothing" !== t.objCat && lbl.push(["TROIS QUARTS ARRIÈRE", "THREE-QUARTER REAR"]);
  function tog(i) {
    var on = sel.indexOf(i) >= 0;
    if (on && 1 === n) return void h(sdT("Garde au moins une vue.", "Keep at least one view."));
    if (!on && n >= max)
      return void h(sdT("4 vues au maximum : décoche d'abord une vue.", "4 views at most: untick a view first."));
    g(
      obj ? "objViews" : "placeViews",
      (on
        ? sel.filter(function (x) {
            return x !== i;
          })
        : sel.concat([i])
      ).sort(function (a, b) {
        return a - b;
      }),
    );
  }
  return (0, l.jsxs)("div", {
    className: "stage-bg rounded-3xl p-3 " + (cls || ""),
    children: [
      (0, l.jsx)("svg", {
        viewBox: obj && "clothing" !== t.objCat ? "0 0 320 267" : "0 0 320 180",
        className: "block h-auto w-full",
        role: "group",
        "aria-label": sdT("Vues de la planche : clique pour choisir", "Sheet views: click to choose"),
        children: lbl.map(function (w, i) {
          var x = 4 + (i % 3) * 105,
            y = 4 + 87 * Math.floor(i / 3),
            on = sel.indexOf(i) >= 0,
            nm = sdT(w[0], w[1]);
          return (0, l.jsxs)(
            "g",
            {
              role: "button",
              tabIndex: 0,
              "aria-pressed": on,
              "aria-label": nm,
              "data-view": i,
              className: "cursor-pointer",
              onClick: function () {
                tog(i);
              },
              onKeyDown: function (ev) {
                ("Enter" !== ev.key && " " !== ev.key) || (ev.preventDefault(), tog(i));
              },
              children: [
                (0, l.jsx)("rect", {
                  x: x,
                  y: y,
                  width: "100",
                  height: "82",
                  rx: "6",
                  className: on ? "" : "fill-card/70 stroke-border",
                  style: on ? { fill: "hsl(var(--primary))", stroke: "hsl(var(--primary))" } : void 0,
                  strokeWidth: "1",
                }),
                (0, l.jsx)("text", {
                  x: x + 50,
                  y: y + 45,
                  textAnchor: "middle",
                  className: "text-[9px] font-semibold tracking-wider" + (on ? "" : " fill-muted-foreground"),
                  style: on ? { fill: "hsl(var(--primary-foreground))" } : void 0,
                  children: nm,
                }),
              ],
            },
            i,
          );
        }),
      }),
      (0, l.jsx)("p", { className: "pt-2 text-center text-sm text-muted-foreground", children: sdT("Choisis 1 à 4 vues séparées. Le triptyque garde ses trois vues habituelles ; la carte de nuit reprend la vue de jour que tu joins.", "Choose 1 to 4 separate views. The triptych keeps its usual three views; the night card uses the day view you attach.") }),
    ],
  });
}
/* ---------- v106 child mode ("Enfant") ----------
   A person with child: true, chosen with the "Enfant" button next to Personne, Animal and Objet. Kept apart from every adult control: no body sliders,
   no Beauté, no makeup, no reference outfit, no headless body, no retouch, no photo source. Always fully dressed in everyday clothes; a head sheet,
   then a full-body sheet with the head, in both engines. Clothing or marks that would undress or sexualize a child are dropped, never sent. */
function sdChild(t) {
  return !!t && "person" === t.mode && !!t.child;
}
var SD_CHILD_KEYS = ["childSex", "childAge", "childHeight", "childBuild", "childHeadless"],
  SD_CHILD_FACE = ["origin", "originDetail", "skin", "face", "forehead", "eyeColor", "eyeShape", "brows", "noseW"];
/* which controls a child shows: the child's own in Corps, the neutral face features in Visage, all of Cheveux and Tenue (no outfit at random), the face marks in Signes */
function sdChildHide(t, g, k) {
  if (!sdChild(t)) return SD_CHILD_KEYS.indexOf(k) >= 0;
  if (sdBaby(t)) return "childSex" !== k;
  return "corps" === g
    ? SD_CHILD_KEYS.indexOf(k) < 0
    : "visage" === g
      ? SD_CHILD_FACE.indexOf(k) < 0
      : "tenue" === g
        ? "sdRndN" === k
        : "signes" === g && "bodyScars" === k;
}
/* v107: accent-insensitive word list with plurals (English and French), checked on whole words; ordinary words stay allowed
   ("bras", "nu-pieds", "maillot de foot", "slip-on", "non-slip", "jupe-culotte", "cropped jeans", "low-cut sneakers", "souliers vernis", "low-heeled boots", "shoe strings", "100 percent cotton") */
var SD_CHILD_BAN_TERMS = [
  /* swimwear, underwear, nightwear */
  "bikinis?", "monokinis?", "tankinis?", "swim\\w*", "bathing( ?suits?)?", "board ?shorts", "trunks", "speedos?", "underwear", "underpants", "undies", "lingerie",
  "bra", "bralettes?", "sports? bras?", "briefs", "boxers?", "boxer (shorts|briefs)", "pant(y|ies)", "knickers", "thongs?", "tangas?", "g-?strings?",
  "(un|en|le|des|les|petit|mini) strings?", "nighties?", "nightgowns?", "babydolls?", "camisoles?", "bodysuits?", "leotards?",
  "corsets?", "bustiers?", "garters?", "stockings?",
  "maillots? de bain", "maillots? (une|deux) pieces?", "shorts? de bain", "(?<!jupe-|jupe )culottes?(?! courtes?)", "soutiens?[- ]gorges?", "(?<!non-|anti-)slips?(?![- ]on)",
  "calecons?", "brassieres?", "sous[- ]vetements?", "nuisettes?", "chemises? de nuit", "justaucorps",
  /* bare body, body parts */
  "shirtless", "topless", "bare[- ]?(chest\\w*|belly|midriff|torso|shoulders?|back|legs?|skin|bottom|bum)", "no (shirt|clothes|clothing)", "without (a shirt|any clothes|clothes|clothing)",
  "nudes?", "naked(ness)?", "nudity", "undress\\w*", "unclothed", "backless", "breasts?", "nipples?", "buttocks?", "butts?", "bum", "genital\\w*", "crotch", "groin",
  "nus?", "nues?", "torse[- ]nus?", "dos[- ]nus?", "tout nu", "toute nue", "tous nus", "toutes nues", "a poil", "nudite", "deshabill\\w*", "denude\\w*", "sans vetements?",
  "(ventre|fesses|torse|dos) a l'air", "seins?", "fesses?", "tetons?", "sexe",
  /* revealing cuts and fabrics */
  "see[- ]?through", "sheer", "transparent\\w* (top|shirt|t-shirt|tee|dress|blouse|fabric|clothes|clothing|nightgown)s?", "(robe|haut|chemise|chemisier|t-shirt|tee-shirt|vetement)s? transparent\\w*",
  "mesh (top|shirt|dress)\\w*", "crop[- ]?tops?", "cropped (top|tee|t-shirt|shirt|hoodie|sweater|tank)s?", "midriff", "strapless", "off[- ](the[- ])?shoulders?",
  "low[- ]?cut (top|dress|blouse|shirt|t-shirt|tee|neckline)s?", "plunging", "cleavage", "decollete\\w*", "mini[- ]?(skirt|jupe)s?", "hot ?pants", "skimpy", "revealing",
  /* bath, wet */
  "towels?", "serviettes?( de bain)?", "baths?", "bathtubs?", "bain", "baignoire", "showers?", "douches?", "soaked", "wet (clothes|clothing|shirt|t-shirt|dress)", "mouille\\w*", "trempe\\w*",
  "diapers?", "nappy", "nappies", "couches?[- ]culottes?",
  /* sexualizing words */
  "sexy", "sexual\\w*", "sensual\\w*", "sensuel\\w*", "seductive", "seduisant\\w*", "erotic\\w*", "erotique\\w*", "provocative", "provocant\\w*", "suggestive", "suggestif\\w*", "lolita\\w*",
  /* makeup, heels, tattoos, piercings */
  "lipsticks?", "make[- ]?up", "mascara", "eye[- ]?liner", "lip ?gloss", "fond de teint", "nail (polish|varnish)", "vernis a ongles", "ongles vernis",
  "maquill\\w*", "rouge a levres", "high[- ]?heel\\w*", "(?<!low |low-|flat |flat-)heels", "stilettos?", "hauts? talons", "talons? (hauts?|aiguilles?)", "a talons(?! plats)", "escarpins?",
  "tattoo\\w*", "tatouage\\w*", "tatoue\\w*", "piercing\\w*", "pierced", "percee?s?"
];
var SD_CHILD_BAN = new RegExp("(^|[^a-z0-9])(" + SD_CHILD_BAN_TERMS.join("|") + ")(?=$|[^a-z0-9])");
/* everyday phrases removed before the check, so their words do not count ("nu-pieds", "pieds nus": barefoot) */
var SD_CHILD_ALLOW = /(^|[^a-z0-9])(nu-pieds|pieds[- ]nus)(?=$|[^a-z0-9])/g;
function sdChildNorm(x) {
  return String(x || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
function sdChildOk(x) {
  return !SD_CHILD_BAN.test(sdChildNorm(x).replace(SD_CHILD_ALLOW, "$1 "));
}
/* free-text fields that reach a child prompt outside the outfit, marks and state: blanked when they fail the list (prompt state only, via sdG) */
var SD_CHILD_FREE = [
  ["hairStyle", "cheveux"],
  ["hairColorCustom", "cheveux"],
  ["skinCustom", "visage"],
  ["eyeColorCustom", "visage"],
  ["originDetail", "visage"],
  ["name", "nom"],
];
function sdChildClean(t) {
  var o = null;
  SD_CHILD_FREE.forEach(function (f) {
    sdChildOk(t[f[0]]) || ((o = o || Object.assign({}, t)), (o[f[0]] = ""));
  });
  return o || t;
}
function sdChildAge() {
  return Math.max(3, Math.min(12, Math.round(+e.childAge || 7)));
}
function sdChildWho() {
  return sdChildAge() + "-year-old " + ("m" === e.childSex ? "boy" : "girl");
}
/* "an 8-year-old", "an 11-year-old" */
function sdChildA() {
  return 8 === sdChildAge() || 11 === sdChildAge() ? "An " : "A ";
}
function sdChildPos() {
  return "m" === e.childSex ? "his" : "her";
}
function sdChildOrigin() {
  var o = nt();
  return o ? " " + (/^of /.test(o) ? o : "of " + o + " origin") : "";
}
function sdChildRawOutfit(t) {
  return rq(Object.assign({}, t, { bodyRef: !1, headless: !1, photo: !1 }), function () {
    return nR();
  });
}
function sdChildOutfit() {
  var o = sdChildRawOutfit(e);
  return sdChildOk(o) ? o : "a T-shirt, jeans and sneakers in plain solid colors";
}
/* v108: the head sheet is cropped at the base of the neck, the shoulders and clothes out of frame: Seedance took the top of the outfit from the head sheet */
function sdChildCrop(gpt) {
  var lg = ["shoulder", "long", "vlong"].indexOf(e.hairLen) >= 0;
  return (
    (gpt ? "Each panel is a tight, centered close-up of the head and neck, framed from just above the top of the hair down to the base of the neck" : "Each panel is a tight, centered close-up of the head and neck, from just above the top of the hair down to the base of the neck") +
    ", so the head, from the top of the hair to the chin, fills about three quarters of the panel height, with plain grey on both sides. The shoulders and the clothes stay below the bottom edge, out of the frame" +
    (lg ? "; long hair may run past the bottom edge" : "") +
    (gpt ? ". The head is the same size and at the same height in all four panels.\n" : ". The head has the same size and height in all four panels.\n\n")
  );
}
/* hat, cap, glasses on the head sheet; v108: nothing worn around the neck or on the clothes (scarf, jewelry), since the head sheet shows no clothes */
var SD_CHILD_HEADACC = ["glasses", "sunglasses", "cap", "beanie", "hat"];
function sdChildHeadAcc() {
  if (!sdChildOk(sdChildRawOutfit(e))) return "";
  var a = tZ.accOpts
      .filter(function (o) {
        return (e.accSel || []).indexOf(o[0]) >= 0 && SD_CHILD_HEADACC.indexOf(o[0]) >= 0;
      })
      .map(function (o) {
        return o[2];
      }),
    x = t5(e.acc);
  x && /glass|\bhats?\b|\bcaps?\b|beanie|helmet|headband|hair ?clip/i.test(x) && !/scarf|necklace|choker|hood|collar|earring|piercing|jewel/i.test(x) && sdChildOk(x) && a.push(x);
  return a.join(", ");
}
function sdChildMarks() {
  var m = rg(!0);
  return m && sdChildOk(m) ? m : "";
}
function sdChildState() {
  var m = rl();
  return m && sdChildOk(m) ? m : "";
}
/* what was dropped, read on the saved state t (the prompt state is already cleaned), for the red note */
function sdChildDropped(t) {
  var d = [];
  sdChildOk(sdChildRawOutfit(t)) || d.push("tenue");
  rq(t, function () {
    sdChildOk(rg(!0)) || d.push("signes");
    sdChildOk(rl()) || d.push("état du moment");
  });
  SD_CHILD_FREE.forEach(function (f) {
    sdChildOk(t[f[0]]) || d.indexOf(f[1]) >= 0 || d.push(f[1]);
  });
  return d;
}
/* the child's own face: chosen features first, then traits drawn from faceSeed for the features left on Auto (child-appropriate pools) */
function sdChildFace() {
  var w = { xnarrow: "very narrow", xwide: "very wide" }[e.noseW] || t1("noseW", e.noseW),
    f = [
      t1("face", e.face),
      sdForehead(),
      t1("brows", e.brows),
      w ? w + " nose" : "",
    ].filter(Boolean),
    t = (0x7f4a7c15 ^ (e.faceSeed || 1)) >>> 0,
    n = function () {
      var x = (t = (t + 0x6d2b79f5) >>> 0);
      return (
        (x = Math.imul(x ^ (x >>> 15), 1 | x)),
        (((x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ (x >>> 14)) >>> 0) / 0x100000000
      );
    },
    r = function (a) {
      return a[Math.floor(n() * a.length)];
    };
  var shape = r(["a round face", "an oval face", "a heart-shaped face", "a slightly long, oval face"]),
    cheeks = r(["full, round cheeks", "soft, rounded cheeks", "slightly narrow cheeks"]),
    eyes = r(["round eyes", "almond-shaped eyes", "slightly hooded eyes", "wide-open eyes"]),
    gap = r(["wide-set eyes", "eyes set at an average distance", "slightly close-set eyes"]),
    brows = r(["light, thin eyebrows", "thick, straight eyebrows", "softly arched eyebrows", "fair, barely visible eyebrows"]),
    nose = r(["a small button nose", "a small, straight nose", "a small nose with a slightly upturned tip", "a short, wide nose"]),
    mouth = r(["a small mouth", "a wide mouth", "a mouth of medium width"]),
    ears = r(["ears that stick out slightly", "small ears close to the head", "ears of medium size"]),
    det = r(["a few faint freckles across the nose", "a small mole on the left cheek", "a cowlick at the front hairline", "a small healed scrape on the chin", "a dimple in the chin", "no particular mark"]);
  "auto" === e.face && f.push(shape);
  f.push(cheeks);
  "auto" === e.eyeShape && f.push(eyes);
  f.push(gap);
  "auto" === e.brows && f.push(brows);
  "auto" === e.noseW && f.push(nose);
  f.push(mouth, ears);
  (["bald", "receding", "mohawk", "undercut", "fringe", "cornrows", "boxbraids", "locs", "twists"].indexOf(e.hairStyleSel) >= 0 || "shaved" === e.hairLen) && /cowlick/.test(det) && (det = "no particular mark");
  "no particular mark" !== det && f.push(det);
  return f.join(", ");
}
function sdChildEyes() {
  return t7("eyeColor") + " " + (t1("eyeShape", e.eyeShape) || "eyes");
}
function sdChildSig() {
  if (sdBaby(e)) return sdBabyWho() + "\n" + sdBabyFace();
  return [sdChildWho() + sdChildOrigin(), t7("skin"), sdChildEyes(), ne(), sdChildFace(), sdChildMarks()].join("\n");
}
function sdChildBuild() {
  return (
    { small: "small for " + sdChildPos() + " age", tall: "tall for " + sdChildPos() + " age" }[e.childHeight] ||
    "of average height for " + sdChildPos() + " age"
  ) + ", " + ({ slim: "a slim build", sturdy: "a sturdy build" }[e.childBuild] || "an average build");
}
var SD_CHILD_LIMIT =
  "GENERATION LIMIT:\nProduce one image. Panels whose widths differ by more than about 10% are a missed requirement. If a requirement is clearly missed, regenerate at most three times (four images in total), fixing the most visible miss first and changing the image clearly each time. A generation stopped by the safety filter does not count: retry it once unchanged; after two stops in total, deliver the best image so far, say so and stop. Then deliver the best attempt and stop: no variations.";
/* v112: the child and baby Seedream sheets in 3D or 2D open with that style instead of "Studio photograph" (Photo: unchanged) */
function sdChildLead() {
  return "photo" === e.style ? "Studio photograph" : "3d" === e.style ? "3D animated feature film character image" : "2D animation character model sheet illustration";
}
function sdChildRender(gpt) {
  return "photo" === e.style
    ? gpt
      ? "Real photograph with natural skin, hair and fabric texture, natural color, no retouching. Honest, natural photography of a child for a film costume test, not a fashion or advertising shoot."
      : "Natural skin texture, natural colors, fine film grain, not a 3D render."
    : t9().render;
}
function sdChildHead(gpt) {
  var p = sdChildPos(),
    mk = sdChildMarks(),
    st = sdChildState(),
    who = sdChildWho() + sdChildOrigin(),
    id = sdChildA() + who + ", a fictional child character for a family film: " + t7("skin") + ", " + sdChildEyes() + ". " + t6(ne()) + ".\n" +
      "Face, " + p + " own and kept exactly in every panel: " + sdChildFace() + ".\n" +
      (mk ? "Distinctive marks, each on the stated side: " + mk + ".\n" : "") +
      (st ? "Current state, on the stated side: " + st + ".\n" : "") +
      (sdChildHeadAcc() ? "Worn on the head and face, identical in every panel: " + sdChildHeadAcc() + ", plain and unbranded.\n" : "") +
      "A natural, ordinary child's face with the soft features of that age and the slight asymmetry of a real face, no makeup.\n";
  if (!gpt)
    return (
      sdChildLead() + ", 16:9 landscape, four equal 16:9 panels in a 2 by 2 grid separated by thin mid-grey gaps: an identity reference sheet of one fictional child character for a family film, the same child in all four panels.\n" +
      "Top left: front view, looking straight into the lens. Top right: three-quarter view, " + p + " face turned toward the left edge of the frame. Bottom left: exact profile facing the left edge of the frame, showing the left side of " + p + " face. Bottom right: back view, the back of " + p + " head seen straight from behind, no face visible" + sdBackHair() + ".\n" + sdChildCrop(0) +
      id + "\n" +
      "Calm, natural expression, mouth closed.\n\n" +
      "Plain seamless mid-grey backdrop. Soft, even studio light, the same in all four panels. 85mm lens at eye level, the whole head in sharp focus.\n\n" +
      sdChildRender(0) + " No text, labels or watermark."
    );
  return (
    "Create " + t9().noun + " to be used as an identity reference for AI video: four close-up studio views of the same original fictional child character, side by side in one image.\n\n" +
    "CHARACTER:\n" +
    (e.multiChar
      ? "Several characters are created in this conversation. This one, " + ri() + ", is a different child from all of them: give " + ("m" === e.childSex ? "him" : "her") + " " + p + " own face and hair, and never reuse anyone from earlier images; the name is only for reference and never appears in the image.\n"
      : "This is a new, original child character: do not reuse the face or hair of anyone from earlier images in this conversation.\n") +
    id +
    nX + "\n\n" +
    "LAYOUT:\nA 16:9 landscape image split into four equal 16:9 panels in a 2 by 2 grid, separated by narrow gaps of the same grey as the backdrop.\n" +
    sdChildCrop(1) +
    "Top left: front view, facing the camera, eyes looking into the lens.\nTop right: three-quarter view, head turned 45 degrees toward the subject's left.\nBottom left: exact profile of the subject's left side, the face pointing toward the left edge of the panel.\nBottom right: back view, the back of the head seen straight from behind, no face visible" + sdBackHair() + ".\n\n" +
    "EXPRESSION:\nCalm and natural, mouth closed.\n\n" +
    "LIGHT, BACKGROUND, CAMERA:\nSeamless plain mid-grey studio backdrop, identical in all panels. Soft, even studio lighting, neutral daylight white balance, the same light in every panel. 85mm lens at the child's eye level, the same distance in every panel, the whole head sharp.\n\n" +
    "RENDERING:\n" + sdChildRender(1) + "\nNo text, labels, numbers, watermarks or logos anywhere in the image.\n\n" +
    SD_CHILD_LIMIT
  );
}
/* v108: the child's body sheet from the neck down, dressed, made without any image; the head comes only from the head sheet */
function sdChildHl(t) {
  return sdChild(t) && !!t.childHeadless;
}
/* v111 "Utiliser les habits de la photo" (person from a photo, on by default): the clothes of the photo for the head and the body, the Tenue tab
   set aside; off: the Tenue tab is used for both, and what it leaves unset is a plain default, never taken from the photo */
function sdPhotoClothes(t) {
  t = t || e;
  return "person" === t.mode && !!t.photo && (!!t.photoOnly || !1 !== t.photoClothes);
}
/* the body sheet needs the photo: its body kept as is, or its clothes (not replaced by the reference outfit) */
function sdBodyPhoto(t) {
  return "person" === t.mode && !!t.photo && (!!t.photoOnly || !!t.bodyAsIs || (sdPhotoClothes(t) && !t.bodyRef));
}
/* v112: the body sheet needs the photo, person or animal (an animal's body always comes from its photo) */
function sdBodyPhotoAny(t) {
  return sdBodyPhoto(t) || ("animal" === t.mode && !!t.photo);
}
/* v114 (UI audit): options a child is never offered */
var SD_CHILD_OPT_OFF = { hairColor: ["saltpepper", "grey", "white"], hairStyleSel: ["receding"], shoesOpts: ["heels"] };
function sdOpts(t, i) {
  var off = sdChild(t) && SD_CHILD_OPT_OFF[i];
  return off
    ? tZ[i].filter(function (o) {
        return off.indexOf(o[0]) < 0;
      })
    : tZ[i];
}
function sdChildOpts(t) {
  var o = null,
    set = function (k, v) {
      o = o || Object.assign({}, t);
      o[k] = v;
    };
  SD_CHILD_OPT_OFF.hairColor.indexOf(t.hairColor) >= 0 && set("hairColor", tJ.hairColor);
  SD_CHILD_OPT_OFF.hairStyleSel.indexOf(t.hairStyleSel) >= 0 && set("hairStyleSel", tJ.hairStyleSel);
  (t.shoesSel || []).indexOf("heels") >= 0 &&
    set(
      "shoesSel",
      t.shoesSel.filter(function (x) {
        return "heels" !== x;
      }),
    );
  return o || t;
}
/* v114 (UI audit): the GPT line of the rules panel by type (it spoke of characters and retouches for an object or an animal; GPT has no retouch card) */
function sdRulesGpt(baby, animal, obj) {
  return obj
    ? "Une conversation GPT par objet ou par lieu permet de regrouper ses références."
    : animal
      ? "Une conversation GPT par animal permet de regrouper ses références. Pour des animaux secondaires dans une même conversation, coche « Plusieurs animaux dans la même conversation GPT »."
      : baby
        ? "Une conversation GPT par personnage permet de regrouper ses références."
        : "Une conversation GPT par personnage permet de regrouper ses références. Pour des personnages secondaires dans une même conversation, coche « Plusieurs personnages dans la même conversation GPT ».";
}
/* v114 (UI audit): the help under "Partir d'une photo" (not "Mise en planche seulement"): "lieu" for a house or an interior, no advice to turn on
   "Garder le corps tel quel" when it is on */
function sdPhotoHelp(t) {
  if ("object" === t.mode) return sdIsPlace(t) ? "Joins ta photo à la planche : le lieu viendra d'elle. La description reste utile pour préciser." : "Joins ta photo à la planche : l'objet viendra d'elle. La description reste utile pour préciser.";
  if ("animal" === t.mode) return "Joins ta photo aux deux planches : l'animal viendra d'elle.";
  var body = t.bodyAsIs ? " Son corps aussi, avec « Garder le corps tel quel »." : " Pour garder aussi son corps, active « Garder le corps tel quel » dans Corps.";
  return [
    !sdBodyPhoto(t)
      ? "Joins ta photo à la planche tête : visage et cheveux viendront d'elle."
      : sdPhotoClothes(t) && !t.bodyRef
        ? "Joins ta photo aux deux planches : visage, cheveux et habits viendront d'elle."
        : "Joins ta photo aux deux planches : visage et cheveux viendront d'elle.",
    body,
  ];
}
/* v114 (review of the audit): with the head, the Seedream body does not read the reference outfit choice (fixed fitted top and leggings, or the
   dressed sheet); said under the choice */
function sdCoverNote(t) {
  if (!(sdNat(t) && "person" === t.mode && !sdChild(t) && t.bodyRef && !t.headless)) return "";
  return sdUseBodyImg()
    ? "Avec la tête, Seedream n'utilise pas ce choix : le corps et sa tenue viennent de ta planche habillée (« Le corps vient de », carte 2). Il sert à la planche corps sans tête."
    : "m" === t.pres
      ? "Avec la tête, Seedream n'utilise pas ce choix : le corps porte un haut de sport sans manches et un collant de course bleu cobalt. Il sert à la planche corps sans tête."
      : "Avec la tête, Seedream n'utilise pas ce choix : le corps porte un haut court ajusté sans manches et un legging bleu cobalt. Il sert à la planche corps sans tête.";
}
/* v114 (review): the mobile bar's "Retouche" with nothing to copy explains and shows card 3 instead of doing nothing */
function sdGoIter() {
  sdIterOpen = !0;
  var c = document.getElementById("sd-card-iter");
  c && c.scrollIntoView({ behavior: "smooth", block: "start" });
}
/* v114 (UI audit): the "Mise en planche seulement" box by type: what the sheets keep from the photo and which settings still count */
function sdPhotoOnlyText(t) {
  /* GPT: the "Plusieurs ... dans la même conversation GPT" switch still counts (the prompts then name the character) */
  var gpt = "seedream" !== t.model;
  return "animal" === t.mode
    ? gpt
      ? " Les prompts mettent la photo en planche (l'animal entier en quatre vues, gros plans de tête en option) sur fond gris, sous une lumière de studio, sans rien modifier d'autre : race, pelage, marques et accessoires restent ceux de la photo. Seuls comptent ici le type de corps, qui règle les vues et la pose, et « Plusieurs animaux dans la même conversation GPT »."
      : " Les prompts mettent la photo en planche (l'animal entier en quatre vues, gros plans de tête en option) sur fond gris, sous une lumière de studio, sans rien modifier d'autre : race, pelage, marques et accessoires restent ceux de la photo. Seul compte ici le type de corps, qui règle les vues et la pose."
    : gpt
      ? " Les prompts mettent la photo en planche (tête et corps en quatre vues) sur fond gris, sous une lumière de studio, sans rien modifier d'autre : visage, cheveux, maquillage, tenue et marques restent ceux de la photo. Seuls comptent ici le cadrage du corps sans tête et « Plusieurs personnages dans la même conversation GPT »."
      : " Les prompts mettent la photo en planche (tête et corps en quatre vues) sur fond gris, sous une lumière de studio, sans rien modifier d'autre : visage, cheveux, maquillage, tenue et marques restent ceux de la photo. Seul compte ici le cadrage du corps sans tête.";
}
/* v113 "Tenue en un seul texte" (Tenue tab): the whole outfit typed once replaces every choice of the tab (pieces, accessories, colors, wear) for the
   head neckline and the body, in both engines and in "Habiller avec ma tenue". Never for a child or a baby (sdG clears it), never with the photo's
   clothes, never while the reference outfit dresses the body (nv). Empty: a plain everyday outfit, never the hidden choices. */
function sdFreeOn() {
  return "person" === e.mode && !sdChild(e) && !sdPhotoClothes() && !nv() && !!e.outfitFree;
}
function sdFreeText() {
  if (!sdFreeOn()) return "";
  var x = String(e.outfitText || "")
    .replace(/[«»]/g, "")
    .replace(/^[\s,;:\-–•*]+/, "")
    .replace(/[\s,;]*\n[\s,;\-–•*]*/g, "; ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s.;,:!?…]+$/, "");
  /* "random" alone is not an outfit: the plain one, as for an empty text */
  return /^(random|au hasard|hasard|al[ée]atoire)$/i.test(x) ? "" : x;
}
/* the closing "no text" line of a prompt keeps the logos and prints the free outfit names */
function sdFreeNoText(s) {
  return sdFreeText() ? String(s).replace(/\.$/, ", except any logo or print this outfit description names.") : s;
}
/* the Tenue tab box: the switch, then the text */
function sdFreeBox(t, g, L) {
  return (0, l.jsxs)("div", {
    className: "my-4 rounded-2xl border p-4 " + (t.outfitFree ? "border-[hsl(var(--tape))]" : ""),
    children: [
      (0, l.jsx)(ax, { checked: !!t.outfitFree, onChange: (v) => g("outfitFree", v), children: "Tenue en un seul texte" }),
      (0, l.jsx)("p", {
        className: "mt-2 text-sm text-muted-foreground",
        children: t.outfitFree
          ? t.bodyRef
            ? "Ton texte remplace tous les choix de cet onglet pour la retouche « Habiller avec ma tenue » ; la planche corps garde la tenue de référence. Il part tel quel dans le prompt : écris-le en anglais de préférence. Vide : une tenue simple, unie."
            : "Ton texte remplace tous les choix de cet onglet, pour la tête et le corps, et part tel quel dans le prompt : écris-le en anglais de préférence. Vide : une tenue simple, unie."
          : "Pour décrire toute la tenue d'un coup, sans cocher chaque pièce.",
      }),
      t.outfitFree &&
        (0, l.jsx)("textarea", {
          id: "c-outfitText",
          "aria-label": "Tenue en un seul texte",
          className: L + " min-h-[96px] resize-y",
          placeholder: "ex. black leather biker jacket worn open over a white cotton t-shirt, straight dark blue jeans, black leather ankle boots, silver ring on the right hand",
          value: t.outfitText || "",
          onChange: (ev) => g("outfitText", ev.target.value),
        }),
    ],
  });
}
/* a garment chosen in the Tenue tab (top, bottom, shoes), for sessions saved before v111 */
function sdGarmentSet(t) {
  return (
    ["topSel", "bottomSel", "shoesSel"].some(function (k) {
      return (t[k] || []).length;
    }) ||
    ["top", "bottom", "shoes"].some(function (k) {
      return !!t5(t[k]);
    })
  );
}
/* who the person is, for a head copy that ends after a switch: 0 adult, 1 child, 2 baby */
function sdKind(t) {
  return sdChild(t) ? (t.baby ? 2 : 1) : 0;
}
/* the same, on the module state (inside the card, "e" is the card key) */
function sdChildHlNow() {
  return sdChildHl(e);
}
function sdChildBodyHl(gpt, body, out, st) {
  var crop = "Each panel's top edge cuts across the base of the neck, just above the collar of the top: no chin and no face. Feet included, same scale and floor line in every panel, with some grey space below the feet.",
    skin = "Skin tone on the hands, arms and neck: " + t7("skin") + "." + (["shoulder", "long", "vlong"].indexOf(e.hairLen) >= 0 ? " The part of the hair that falls below the neck shows: " + ne() + "." : "");
  if (!gpt)
    return (
      sdChildLead() + ", 16:9, four equal vertical panels with thin grey gaps: a body and costume reference turnaround of one fictional child character for a family film, framed from the neck down, the same child in every panel. Left to right: front; left side, facing the left edge; back; right side, facing the right edge; the two profiles face opposite ways.\n" +
      crop + "\n\n" +
      body + " " + skin + "\n\n" + out + (st ? " Current state: " + st + "." : "") + "\n\n" +
      "Neutral, relaxed standing pose, feet slightly apart, arms relaxed at the sides, hands visible.\n\n" +
      "Seamless mid-grey backdrop. Soft, even studio light. Long lens at the child's chest height. " + sdChildRender(0) + " Five fingers per hand. No text or watermark."
    );
  return (
    "Create " + t9().noun + " to be used as a costume and character reference for AI video: four studio views of the body of the same fictional child character, framed from the neck down, side by side in one image.\n\n" +
    "BODY:\n" + body + "\n" + skin + " If a head sheet of this child is earlier in this conversation or attached, take only the skin tone and any hair that falls below the neck from it; the head itself is outside the frame.\n\n" +
    "OUTFIT:\n" + out + (st ? "\nCurrent state: " + st + "." : "") + "\n\n" +
    "LAYOUT:\nA 16:9 landscape image split into four equal vertical panels of the same size, separated by narrow gaps of the same grey as the backdrop. From left to right: front view, exact left side view, back view, exact right side view; the two side views face opposite directions. " + crop + "\n\n" +
    "POSE:\nNeutral, relaxed standing pose, feet slightly apart, arms relaxed at the sides, hands visible. " + nX + "\n\n" +
    "LIGHT, BACKGROUND, CAMERA:\nSeamless plain mid-grey studio backdrop and floor, identical in all panels. Soft, even studio light, neutral white balance, a soft contact shadow under the feet, the same light in every panel. Long lens at the child's chest height, the same distance in every panel, deep focus.\n\n" +
    "RENDERING:\n" + sdChildRender(1) + " Realistic hands with five fingers each.\nNo text, labels, numbers, watermarks or logos anywhere in the image.\n\n" +
    SD_CHILD_LIMIT
  );
}
function sdChildBody(gpt) {
  var p = sdChildPos(),
    mk = e.childHeadless ? (sdChildOk(t5(e.marks)) ? t5(e.marks) : "") : sdChildMarks(),
    body = sdChildA() + sdChildWho() + ": " + sdChildBuild() + ", with the natural proportions of a real child of that age, not a small adult." +
      (mk ? " Distinctive marks, each on the stated side, visible only where the skin is uncovered: " + mk + "." : ""),
    out = "Fully dressed in every panel in this outfit, identical in all four views: " + sdChildOutfit() + ". " + nx(),
    st = sdChildState();
  if (e.childHeadless) return sdChildBodyHl(gpt, body, out, st);
  if (!gpt)
    return (
      sdChildLead() + ", 16:9, four equal vertical panels with thin grey gaps: a full-body costume reference turnaround of one fictional child character for a family film, the same child in every panel. Left to right: front; left side, facing the left edge; back; right side, facing the right edge; the two profiles face opposite ways.\n" +
      "Whole figure in every panel, hair to feet, same scale and floor line, with some grey space above the head and below the feet.\n" +
      "Image 1 is this child's head reference sheet: copy face, hair and skin tone exactly; ignore its layout and clothing.\n" +
      "Hair exactly as in image 1: " + ne() + ", the same in every panel.\n\n" +
      body + "\n\n" + out + (st ? " Current state: " + st + "." : "") + "\n\n" +
      "Neutral, relaxed standing pose, feet slightly apart, arms relaxed at the sides, hands visible.\n\n" +
      "Seamless mid-grey backdrop. Soft, even studio light. Long lens at the child's chest height. " + sdChildRender(0) + " Five fingers per hand. No text or watermark."
    );
  return (
    "Create " + t9().noun + " to be used as a costume and character reference for AI video: four full-body studio views of the same fictional child character, side by side in one image.\n\n" +
    "IDENTITY:\nThe head sheet (four head close-ups on a grey backdrop) earlier in this conversation is the identity anchor: match its face, hair and every visible mark exactly. If a head sheet is attached to this message, it is the anchor.\n" +
    "Hair exactly as on the head sheet: " + ne() + ".\n\n" +
    "BODY:\n" + body + "\n\n" +
    "OUTFIT:\n" + out + (st ? "\nCurrent state: " + st + "." : "") + "\n\n" +
    "LAYOUT:\nA 16:9 landscape image split into four equal vertical panels of the same size, separated by narrow gaps of the same grey as the backdrop. From left to right: front view, exact left side view, back view, exact right side view; the two side views face opposite directions. Whole figure in every panel, from the top of the hair to the feet, at the same scale and on the same floor line, with some grey space above the head and below the feet.\n\n" +
    "POSE:\nNeutral, relaxed standing pose, feet slightly apart, arms relaxed at the sides, hands visible. " + nX + "\n\n" +
    "LIGHT, BACKGROUND, CAMERA:\nSeamless plain mid-grey studio backdrop and floor, identical in all panels. Soft, even studio light, neutral white balance, a soft contact shadow under the feet, the same light in every panel. Long lens at the child's chest height, the same distance in every panel, deep focus.\n\n" +
    "RENDERING:\n" + sdChildRender(1) + " Realistic hands with five fingers each.\nNo text, labels, numbers, watermarks or logos anywhere in the image.\n\n" +
    SD_CHILD_LIMIT
  );
}
function sdChildPrompts(t, m) {
  var o = {},
    k,
    g = "seedream" !== t.model;
  for (k in m) o[k] = "";
  if (sdBaby(t)) return ((o.head = sdBabySheet(g)), o);
  o.head = sdChildHead(g);
  o.body = sdChildBody(g);
  return o;
}
/* mode buttons: "Enfant" is the person mode with child: true; switching to it turns the photo source off */
/* the adult and the child share the person's head record: a head copied for one must never make the other a "variant".
   Leaving the child: cleared before the switch, so the person settings saved for later do not keep the child's head; the animal or object record is untouched. */
var SD_HEAD0 = { headSig: "", headOwner: "", headFull: "", headKind: "", headRemovals: "", headLooks: "", headFat: "", sdHeadSig: "" };
function sdChildMode(v, s, sw) {
  var c = "child" === v || "baby" === v,
    was = sdChild(s),
    base = was && !c ? Object.assign({}, s, { photo: s.childPhotoBak > 0, photoOnly: 2 === s.childPhotoBak, childPhotoBak: 0 }, SD_HEAD0) : s,
    r = sw(base, c ? "person" : v),
    o = Object.assign({}, r, { child: c, baby: "baby" === v });
  c && !was && Object.assign(o, { childPhotoBak: r.photo ? (r.photoOnly ? 2 : 1) : 0, photo: !1, photoOnly: !1 }, SD_HEAD0);
  /* v109: the child and the baby are two identities too */
  c && was && !!s.baby !== ("baby" === v) && Object.assign(o, SD_HEAD0);
  return o;
}
/* ---------- v109 baby ("Bébé") ----------
   A person with child: true and baby: true, chosen with the "Bébé" button. Only "Fille ou garçon" and "Autre visage" (faceSeed): one sheet for both
   engines, three head close-ups and the whole baby sitting in three views, always in a full-length sleepsuit. Every other setting is ignored. */
function sdBaby(t) {
  return sdChild(t) && !!t.baby;
}
function sdBabyRng() {
  var t = (0x3c6ef372 ^ (e.faceSeed || 1)) >>> 0,
    n = function () {
      var x = (t = (t + 0x6d2b79f5) >>> 0);
      return (
        (x = Math.imul(x ^ (x >>> 15), 1 | x)),
        (((x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ (x >>> 14)) >>> 0) / 0x100000000
      );
    };
  return function (a) {
    return a[Math.floor(n() * a.length)];
  };
}
/* skin, hair and eyes drawn together so they stay coherent */
var SD_BABY_LOOK = [
  ["fair skin", "fine, light blond wisps of hair", "blue-grey eyes"],
  ["light skin", "short, fine light-brown hair", "blue eyes"],
  ["light skin", "almost no hair, only a fine reddish fuzz", "grey-green eyes"],
  ["light olive skin", "a soft tuft of dark brown hair on top of the head", "dark brown eyes"],
  ["light golden skin", "straight, fine black hair standing up a little", "dark brown eyes"],
  ["medium tan skin", "short, fine black hair", "brown eyes"],
  ["warm brown skin", "soft black curls", "dark brown eyes"],
  ["deep brown skin", "short, tight black curls", "dark brown eyes"],
];
function sdBabyDraw() {
  var r = sdBabyRng();
  return {
    look: r(SD_BABY_LOOK),
    face: [
      r(["a round face", "a slightly oval face"]),
      r(["full, round cheeks", "very chubby cheeks", "soft, slightly flatter cheeks"]),
      r(["large, round eyes", "almond-shaped eyes", "wide-set eyes", "slightly narrow eyes"]),
      r(["faint, barely visible eyebrows", "soft, slightly darker eyebrows"]),
      r(["a small button nose", "a small nose with a low, flat bridge and a round tip", "a small nose with an upturned tip"]),
      r(["a small mouth with a full lower lip", "a small bow-shaped mouth", "a wide little mouth"]),
      r(["small ears close to the head", "ears that stick out slightly"]),
      r(["a small dimple in the chin", "dimples in both cheeks", "a tiny pale birthmark at the left temple", "no particular mark"]),
    ].filter(function (x) {
      return "no particular mark" !== x;
    }),
    color: r(["soft grey", "cream", "sage green", "pale yellow", "light blue", "oatmeal beige", "dusty pink"]),
  };
}
function sdBabyWho() {
  return "9-month-old baby " + ("m" === e.childSex ? "boy" : "girl");
}
function sdBabyFace() {
  var d = sdBabyDraw();
  return d.look.join(", ") + "; " + d.face.join(", ");
}
function sdBabySheet(gpt) {
  var d = sdBabyDraw(),
    p = "m" === e.childSex ? "his" : "her",
    id = "A " + sdBabyWho() + ", a fictional baby character for a family film: " + d.look[0] + ", " + d.look[2] + ". Hair: " + d.look[1] + ".\n" +
      "Face, " + p + " own and kept exactly in every panel: " + d.face.join(", ") + ".\n" +
      "A natural, real baby with the proportions of that age.\n",
    out = "Dressed in every panel in the same long-sleeved, full-length cotton sleepsuit in plain " + d.color + ", covering the arms, legs and feet, with a round neck, plain and unbranded.",
    top = "Top row, close-ups of the head and shoulders, left to right: front view, looking straight into the lens; three-quarter view, " + p + " face turned toward the left edge of the frame; exact profile facing the left edge of the frame, showing the left side of " + p + " face. The head has the same size and height in these three panels.",
    bot = "Bottom row, the whole baby sitting upright on the grey floor, left to right: front view; exact left side view, facing the left edge of the frame; back view. Same scale and floor line in these three panels, with some grey space around the baby.";
  if (!gpt)
    return (
      sdChildLead() + ", 16:9 landscape, six equal panels in a 3 by 2 grid separated by thin mid-grey gaps: an identity and body reference sheet of one fictional baby character for a family film, the same baby in all six panels.\n" +
      top + "\n" + bot + "\n\n" +
      id + "\n" + out + "\n\n" +
      "Calm, content expression, mouth closed. Sitting steadily, hands resting on the legs.\n\n" +
      "Plain seamless mid-grey backdrop and floor. Soft, even studio light, the same in all six panels. 85mm lens at the baby's eye level for the close-ups, long lens at the baby's chest height for the sitting views. " +
      sdChildRender(0) + " No text, labels or watermark."
    );
  return (
    "Create " + t9().noun + " to be used as an identity and body reference for AI video: three close-ups of the head and three views of the whole baby, of the same original fictional baby character, in one image.\n\n" +
    "CHARACTER:\nThis is a new, original baby character: do not reuse the face or hair of anyone from earlier images in this conversation.\n" +
    id + nX + "\n\n" +
    "OUTFIT:\n" + out + "\n\n" +
    "LAYOUT:\nA 16:9 landscape image split into six equal panels in a 3 by 2 grid, separated by narrow gaps of the same grey as the backdrop.\n" + top + "\n" + bot + "\n\n" +
    "EXPRESSION AND POSE:\nCalm and content, mouth closed. Sitting steadily, hands resting on the legs.\n\n" +
    "LIGHT, BACKGROUND, CAMERA:\nSeamless plain mid-grey studio backdrop and floor, identical in all panels. Soft, even studio light, neutral daylight white balance, a soft contact shadow under the baby, the same light in every panel. 85mm lens at the baby's eye level for the close-ups, long lens at the baby's chest height for the sitting views, the same distance within each row.\n\n" +
    "RENDERING:\n" + sdChildRender(1) + " Realistic hands with five fingers each.\nNo text, labels, numbers, watermarks or logos anywhere in the image.\n\n" +
    SD_CHILD_LIMIT
  );
}
/* "Bébé au hasard": girl or boy and another face */
function sdBabyRandom(s) {
  return Object.assign({}, s, SD_HEAD0, { childSex: Math.random() < 0.5 ? "f" : "m", faceSeed: rh(), faceGen: 2 });
}
/* "Cheveux au hasard" and "Enfant au hasard" for a child: drawn as for a young person, then no bald, receding, mohawk, undercut or shaved head */
function sdChildHair() {
  var prev = e,
    n;
  e = Object.assign({}, prev, { pres: "m" === prev.childSex ? "m" : "f", age: 30, sdKid: 1 });
  try {
    n = r1("cheveux");
  } finally {
    e = prev;
  }
  ["receding", "bald", "mohawk", "undercut"].indexOf(n.hairStyleSel) >= 0 && (n.hairStyleSel = "loose");
  "shaved" === n.hairLen && (n.hairLen = "short");
  return n;
}
/* "Enfant au hasard": the child's own settings, face and hair at random, an everyday outfit; nothing of the adult body */
function sdChildRandom(s) {
  var n = Object.assign({}, s, SD_HEAD0, { faceSeed: rh(), faceGen: 2 }),
    girl = Math.random() < 0.5,
    prev = e;
  n.childSex = girl ? "f" : "m";
  n.childAge = rY(3, 12);
  n.childHeight = rK(["small", "avg", "avg", "tall"]);
  n.childBuild = rK(["slim", "avg", "avg", "sturdy"]);
  try {
    e = Object.assign({}, n, { pres: n.childSex });
    Object.assign(n, r1("visage"));
    e = n;
    Object.assign(n, sdChildHair());
  } finally {
    e = prev;
  }
  var dress = girl && Math.random() < 0.3;
  n.topSel = [dress ? "dress" : rK(["tshirt", "tshirt", "sweater", "hoodie", "polo"])];
  n.bottomSel = dress ? [] : [rK(girl ? ["jeans", "sweatpants", "shorts", "skirt", "leggings"] : ["jeans", "sweatpants", "shorts", "cargo"])];
  n.shoesSel = [rK(["sneakers", "sneakers", "boots", "sandals"])];
  n.accSel = [];
  n.colorSel = [];
  n.top = n.bottom = n.shoes = n.acc = "";
  n.marks = "";
  n.eState = "";
  return n;
}
function sdChildNote(t, gid) {
  if (sdBaby(t)) return null;
  var d = sdChildDropped(t);
  if ("tenue" !== gid && !d.length) return null;
  return (0, l.jsxs)("div", {
    className: "my-4 rounded-2xl border p-4 text-sm",
    children: [
      "tenue" === gid
        ? (0, l.jsx)("p", { className: "text-muted-foreground", children: "Enfant : toujours habillé avec la tenue choisie ici, en vêtements de tous les jours. Rien de coché : une tenue simple de tous les jours." })
        : null,
      d.length
        ? (0, l.jsx)("p", {
            className: "mt-2 font-semibold text-destructive",
            children: sdT(
              "Ignoré pour un enfant (" + d.join(", ") + ") : seuls des vêtements de tous les jours et des signes ordinaires sont envoyés.",
              "Ignored for a child (" + d.map(function (x) { return { tenue: "outfit", signes: "marks", "état du moment": "current state", cheveux: "hair", visage: "face", nom: "name" }[x] || x; }).join(", ") + "): only everyday clothes and ordinary marks are sent.",
            ),
          })
        : null,
    ],
  });
}
/* ---------- v106 "Intégration d'image": a still compositing prompt (plate + asset), from Mehdi's base prompt; placeholders filled from the form ---------- */
function sdIntegArticle(x) {
  return sdIntegClean(x).replace(/^(a|an|the)\s+/i, "");
}
function sdIntegClean(x) {
  return t5(x).replace(/[\s.;,:]+$/, "");
}
function sdIntegText(t) {
  var a = sdIntegArticle(t.integAsset) || "[ASSET]",
    pl = sdIntegClean(t.integPlace) || "[EMPLACEMENT]",
    or = sdIntegClean(t.integOrient),
    sc = sdIntegClean(t.integScale) || "the people and objects of known size around it in Image 1",
    li = sdIntegClean(t.integLight);
  return (
    "Image 1 is the base plate: a real photograph from a film shoot. It is the master reference for camera, lighting, color and texture.\n" +
    "Image 2 is the asset to insert. Images 3 and following, if provided, are additional views of the same asset. Use the asset images only for the asset's identity: shape, proportions, materials, intrinsic colors, markings, and the exact wording, spelling and layout of any text or label. Ignore their original pose or orientation, background, lighting, reflections, shadows and color grade. The lighting and color of Image 1 apply on top of the asset's intrinsic colors.\n\n" +
    "Task: insert the " + a + " from Image 2 into Image 1, " + pl + (or ? ", " + or : "") + ", so that it looks photographed in the same shot, by the same camera, at the same moment. The asset appears only once in the result: never duplicated and never flipped left to right; the reflections required below are not extra copies.\n\n" +
    "Preserve: keep everything in Image 1 exactly the same (framing, aspect ratio, people, set, objects, sky, color grade), except the area covered by the asset and the shadows, reflections, bounce light, occlusions and any light that the asset itself creates. Do not add, remove or restyle anything else.\n\n" +
    "Integration requirements, in order of priority:\n" +
    "1. Scale and perspective: size the asset relative to " + sc + ", and match the camera height, lens perspective and vanishing lines of Image 1.\n" +
    "2. Light: relight the asset to match the light direction, hardness and color temperature visible in Image 1, read from its existing shadows and highlights.\n" +
    "3. Reflections and highlights: if the asset has glossy, metallic or glass surfaces, its reflections and specular highlights must show the environment and light sources of Image 1, extended plausibly beyond the frame, never its original surroundings. Transparent parts must show what is behind them in Image 1.\n" +
    "4. Contact: where the asset touches its supporting surface (ground, table, shelf, wall), add a contact shadow whose density matches the existing shadows of Image 1, darkest right at the contact line. If Image 1 shows clear cast shadows, also add a cast shadow with the same direction, softness and density, and the same length relative to height as the cast shadows in Image 1. If it shows none, add only soft ambient occlusion and no directional shadow. If the supporting surface is reflective, add the asset's reflection in it with the same strength and blur as the existing reflections in Image 1.\n" +
    "5. Bounce and occlusion: add subtle color bounce from the surrounding surfaces onto the asset's shadow side. Let any element of Image 1 that is closer to the camera overlap the asset.\n" +
    "6. Tonal match: match the black level, contrast, saturation and white balance of Image 1.\n" +
    "7. Texture of the whole image: keep the original photographic grain, noise and sharpness of Image 1 everywhere. Do not denoise, smooth, sharpen or beautify any part of the image. Give the asset the same grain, the same softness at its distance and the same depth of field as the plate, and the same lens distortion, vignetting and motion blur as the plate at its position.\n" +
    "8. Atmosphere: apply the same haze or atmospheric fade as Image 1 at that depth.\n" +
    "9. Emitted light: " +
    (t.integLit
      ? "the " + a + " is switched on" + (li ? " (" + li + ")" : "") + ": its light must fall on nearby surfaces of Image 1 with natural falloff and the color of its source."
      : "the asset is switched off and emits no light.")
  );
}
function sdIntegTool(t, n, h) {
  var set = function (k, v) {
      n(function (s) {
        var o = Object.assign({}, s);
        o[k] = v;
        return o;
      });
    },
    sd = "seedream" === t.model,
    ready = /[\p{L}\p{N}]/u.test(sdIntegArticle(t.integAsset)) && /[\p{L}\p{N}]/u.test(sdIntegClean(t.integPlace)),
    txt = sdIntegText(t),
    inp = "mt-2 w-full rounded-xl border border-transparent bg-muted px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[hsl(var(--tape))] focus:bg-card placeholder:text-muted-foreground/70",
    field = function (k, lab, ph, hint, area) {
      return (0, l.jsxs)(
        "div",
        {
          className: "py-3",
          children: [
            (0, l.jsx)("label", { htmlFor: "integ-" + k, className: "font-semibold", children: lab }),
            (0, l.jsx)(area ? "textarea" : "input", {
              id: "integ-" + k,
              className: inp + (area ? " min-h-[60px] resize-y" : ""),
              placeholder: ph,
              value: t[k] || "",
              onChange: function (ev) {
                set(k, ev.target.value);
              },
              autoComplete: "off",
            }),
            hint ? (0, l.jsx)("p", { className: "mt-1 text-sm text-muted-foreground", children: hint }) : null,
          ],
        },
        k,
      );
    };
  return (0, l.jsxs)("div", {
    className: "grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start",
    children: [
      (0, l.jsxs)(aC, {
        children: [
          (0, l.jsx)("h2", { className: "text-lg font-bold tracking-tight", children: "Intégration d'image" }),
          (0, l.jsx)("p", {
            className: "mt-1 text-sm text-muted-foreground",
            children: "Insère un objet (l'asset) dans une photo de tournage (la plaque), comme s'il avait été filmé dans le même plan. Pour une image fixe, pas une vidéo. Champs en anglais de préférence : le texte part tel quel dans le prompt.",
          }),
          field("integAsset", "Asset à insérer", "ex. red vintage motorcycle, 1970s café racer", "L'objet de l'image 2, en quelques mots.", 0),
          field("integPlace", "Emplacement dans la plaque", "ex. on the pavement at the left of the frame, just in front of the shop window", "Où le poser dans l'image 1, et sur quelle surface.", 1),
          field("integOrient", "Orientation de l'asset", "ex. seen from its left side, the front pointing to the right of the frame", "Facultatif : comment il est tourné par rapport à la caméra.", 0),
          field("integScale", "Repère d'échelle", "ex. the man by the door, about 1.80 m tall; the motorcycle is about 2.1 m long", "Un élément de taille connue dans l'image 1. Vide : les personnes et objets de taille connue autour de l'emplacement.", 1),
          (0, l.jsx)("div", {
            className: "py-3",
            children: (0, l.jsx)(ax, {
              checked: !!t.integLit,
              onChange: function (v) {
                set("integLit", v);
              },
              children: "L'asset est allumé et éclaire autour de lui",
            }),
          }),
          t.integLit ? field("integLight", "Lumière émise", "ex. warm white headlight and a red rear light", "Facultatif : couleur et sources de sa lumière.", 0) : null,
        ],
      }),
      (0, l.jsxs)("div", {
        className: "min-w-0 rounded-2xl border bg-card p-4 grid gap-3 lg:sticky lg:top-4",
        children: [
          (0, l.jsx)("h3", { className: "text-lg font-bold leading-tight", children: "Prompt d'intégration" }),
          (0, l.jsxs)("div", {
            className: "rounded-xl border p-3 text-sm",
            children: [
              (0, l.jsx)("p", { className: "text-muted-foreground", children: sd ? "À joindre dans Seedream, dans cet ordre" : "À joindre dans GPT Image 2.5, dans cet ordre" }),
              (0, l.jsx)("p", { className: "font-semibold", children: "1. la plaque (photo du tournage) ; 2. l'asset ; 3 et suivantes, facultatif : d'autres vues du même asset." }),
              (0, l.jsx)("p", { className: "mt-1 text-muted-foreground", children: sd ? "Format : identique à l'image 1." : "Format : celui de l'image 1, à vérifier sur le résultat." }),
            ],
          }),
          (0, l.jsx)("button", {
            type: "button",
            disabled: !ready,
            onClick: async function () {
              var ok = await ad(txt);
              h(ok ? sdT("Copié. Joins la plaque (image 1), puis l'asset (image 2).", "Copied. Attach the plate (image 1), then the asset (image 2).") : sdT("Copie impossible : sélectionne le texte du prompt et copie-le.", "Copy failed: select the prompt text and copy it."));
            },
            className:
              "inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-40 tape-chip hover:brightness-105",
            children: sd ? "Copier pour Seedream 5.0" : "Copier pour GPT Image 2.5",
          }),
          ready ? null : (0, l.jsx)("p", { className: "text-sm text-muted-foreground", children: "Remplis l'asset et l'emplacement." }),
          (0, l.jsx)("p", { className: "text-sm", children: sdLen(txt, sd) }),
          (0, l.jsxs)("details", {
            className: "rounded-xl bg-muted px-3 py-2 text-sm",
            children: [
              (0, l.jsx)("summary", { className: "cursor-pointer font-semibold", children: "Voir le prompt" }),
              (0, l.jsx)("pre", { className: "prompt-box mono mt-2 max-h-[40vh] overflow-auto rounded-xl bg-muted p-3 text-[12px] leading-relaxed", children: txt }),
            ],
          }),
        ],
      }),
    ],
  });
}
function sdMineTenue(t) {
  return sdNat(t);
}
/* outfit of the with-head body sheet and of "Habiller": fitted top and leggings */
function sdHeadOutfit() {
  /* v106: a man got the women's cropped top and leggings; he gets a sleeveless training top down to the waistband and running tights */
  if ("m" === e.pres)
    return "a fitted cobalt-blue sleeveless training top in " + sdTopCloth() + ", with " + sdTopNeck() + " and armholes that hug the shoulder joints, so the arms and shoulders are bare; it covers the whole chest" + sdLining() + ", and its plain hem reaches the waistband, no seams or bands across the front; seen from behind, the same top covers the back; mid-rise ankle-length cobalt-blue running tights, the stretch fabric following the shape of the hips, glutes and legs without flattening them; plain white training shoes";
  return (
    "a fitted cobalt-blue sleeveless cropped top in " + sdTopCloth() + ", with " + sdTopNeck() + " and armholes that hug the shoulder joints, so the arms and shoulders are bare; it covers the whole chest" +
    ("m" !== e.pres && e.chest >= 2 ? sdTopFollow() : "") +
    sdLining() + ", its plain hem ends just above the navel, no seams or bands across the front; seen from behind, the same top covers the upper back; mid-rise ankle-length cobalt-blue leggings whose waistband sits a few fingers below the navel, so the waist and navel show between them, the stretch fabric following the shape of the hips and glutes without flattening them; plain white training shoes"
  );
}
function sdPresetJoin() {
  var a = +e.age || 30;
  return sdJoinText(a + "-year-old " + (a < 21 ? "adult " : "") + ("m" === e.pres ? "man" : "f" === e.pres ? "woman" : "person"), sdPos());
}
/* v101-v102: image 1 is cut at the collarbones and image 2 is a close-up sheet, so the figure is scaled down to make room for the head, framed with a margin (85% of the panel height) and given a head of one eighth of its height (8 heads, as in sdLegs); the three-quarter view of image 2 is not reused.
   Measured at the pixel (top of the hair, lower edge of the chin, soles): v101 text 6.7 to 7.0 heads; this text (6 results) 6.5 to 6.8 heads, so no gain on the head size,
   margins 1 to 3%, equal panels in 5 of 6. The text alone does not shrink the head: see the lessons file (canvas extended by 25% upward, to test) */
function sdJoinText(who, p) {
  return "Combine these two reference sheets into one full-body reference sheet of this " + who + ": image 1 is " + p + " body, image 2 is " + p +
    " head. Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view, an exact profile on each side view, facing the same way as that body, the back of the head on the back view. From image 2 take only the face, hair and skin tone: ignore its layout, its framing and its three-quarter view. Keep the body, outfit, proportions, skin and light of image 1 exactly, and the face, hair and skin tone of image 2 exactly. Image 1 is cut at the collarbones, so scale each whole body down evenly to make room for the head and neck. Framing, the same in every panel: the whole figure, top of the hair to the soles, fills about 85% of the panel height, centred, with an equal band of plain grey backdrop above the hair and below the feet; nothing is cut by the panel edges. Head size: the head, top of the hair to the chin, is one eighth of the figure's height (the figure is 8 heads tall), sized to the neck and shoulders of image 1, not to image 2. Four panels of equal width, same scale and floor line in every panel, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark.";
}
/* Saved unedited presets: [0] v75 to v100, [1] v101, [2] this repository before v110b. */
function sdJoinOld(who, p, v) {
  return "Combine these two reference sheets into one full-body reference sheet of this " + who + ": image 1 is " + p + " body, image 2 is " + p +
    (2 === v
      ? " head. Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view; on the left side view, the left profile from image 2; on the right side view, the right side of the face as shown in the three-quarter view of image 2, turned to an exact profile facing the right edge, never a mirror image of the left profile; the back of the head on the back view. Keep the body, outfit, proportions, skin texture and light of image 1 exactly, and the face and hair of image 2 exactly. Skin tone: image 2's tone over the whole body, so the neck shows no seam. Whole figure in every panel, hair to feet, same scale and floor line, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark."
      : 0 === v
      ? " head. Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view, a profile on each side view facing the same way as that body, the back of the head on the back view. Keep the body, outfit, proportions, skin and light of image 1 exactly, and the face, hair and skin tone of image 2 exactly. Whole figure in every panel, hair to feet, same scale and floor line, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark."
      : " head. Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view, an exact profile on each side view, facing the same way as that body, the back of the head on the back view. From image 2 take only the face, hair and skin tone: ignore its layout and its three-quarter view. Keep the body, outfit, proportions, skin and light of image 1 exactly, and the face, hair and skin tone of image 2 exactly. Image 1 is cut at the collarbones, so scale each whole body down evenly to make room for the head and neck: the head is drawn at natural adult size for that body, not at its size in image 2, and the whole figure, top of the head to the soles, is about 8 heads tall. Whole figure in every panel, hair to feet, with plain backdrop above the hair and below the feet: nothing touches or is cut by the panel edges. Same scale and floor line in every panel, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark.");
}
/* saved sessions keep the "Assembler" text of the version that wrote it in sdIter: an unedited older text is rewritten on load (exact match), an edited one is kept */
function sdJoinMigrate(t) {
  var s = "join" === t.sdIterOp ? String(t.sdIter || "").trim() : "",
    m = /^Combine these two reference sheets into one full-body reference sheet of this ([^:]+): image 1 is (her|his|their) body/.exec(s);
  if (m && (s === sdJoinOld(m[1], m[2], 0) || s === sdJoinOld(m[1], m[2], 1) || s === sdJoinOld(m[1], m[2], 2))) {
    t.sdIterPre === t.sdIter && (t.sdIterPre = sdJoinText(m[1], m[2]));
    t.sdIter = sdJoinText(m[1], m[2]);
  }
  return t;
}
function sdPresetHeads() {
  var p = sdPos();
  return (
    "the empty space above each body is filled with " +
    p +
    " head and neck, copied from the head reference sheet in image 2: the front face above the front-facing body, " +
    p +
    " left profile above the left side view, the right side of " +
    p +
    " face as shown in the three-quarter view of image 2, turned to an exact profile, above the right side view, never a mirror image of the left profile, the rear of " +
    p +
    " head above the rear body; same face, hair and skin tone as image 2, joined seamlessly to each neck"
  );
}
function sdPos() {
  return "f" === e.pres ? "her" : "m" === e.pres ? "his" : "their";
}
function sdUseBodyImg() {
  return nv() && !nw() && !1 !== e.sdBodyImg;
}
function sdRevealOk(t) {
  return (+t.age || 30) >= 21;
}
function sdCov() {
  var c = e.refCover;
  if ("fitted" === c) return "m" !== e.pres ? (e.chest >= 4 ? "fitted" : "sport") : "short";
  if ("sport" === c) return "m" !== e.pres ? "sport" : "short";
  if (("swim" === c || "short" === c) && "m" !== e.pres) return "sport";
  if ("tanga" === c || "beach" === c) return "m" !== e.pres ? (sdRevealOk(e) ? "tanga" : "sport") : "swim";
  if ("brief" === c) return "m" === e.pres && sdRevealOk(e) ? "brief" : "swim";
  if ("m" === e.pres && "onepiece" === c) return "swim";
  return c;
}
/* v112: the Seedream reference outfits only with the dedicated Seedream builder (sdNat); a GPT prompt rewritten for Seedream keeps the GPT ones */
function sdShownCover(t) {
  var c = t.refCover;
  if ("fitted" === c) return sdNat(t) && "m" !== t.pres ? (t.chest >= 4 ? "fitted" : "sport") : "short";
  if ("sport" === c) return sdNat(t) && "m" !== t.pres ? "sport" : "short";
  if (("swim" === c || "short" === c) && sdNat(t) && "m" !== t.pres) return "sport";
  if ("tanga" === c) return sdNat(t) && "m" !== t.pres ? (sdRevealOk(t) ? "tanga" : "sport") : "swim";
  if ("brief" === c) return sdNat(t) && "m" === t.pres && sdRevealOk(t) ? "brief" : "swim";
  return "m" === t.pres && "onepiece" === c ? "swim" : c;
}
/* "random" in a free outfit field: the tool picks one concrete, age-appropriate item (seeded by the face, so the
   head and body prompts get the same garment and it does not change between copies) */
var SD_WARDROBE = {
  f: [
    [25, {
      top: ["a fitted white cotton t-shirt", "a cropped grey hoodie", "an oversized striped long-sleeve top", "a black ribbed tank top under an open denim shirt"],
      bottom: ["high-waisted light-blue straight jeans", "black wide-leg trousers", "a pleated beige midi skirt", "dark green cargo trousers"],
      shoes: ["white canvas sneakers", "chunky black sneakers", "black ankle boots"],
      acc: ["small silver hoop earrings", "a thin black hair tie on the left wrist", ""],
    }],
    [40, {
      top: ["a cream knit sweater", "a light-blue button-down shirt", "a black fitted turtleneck", "a navy-and-white striped long-sleeve top"],
      bottom: ["dark straight jeans", "camel tailored trousers", "a black knee-length skirt", "olive chinos"],
      shoes: ["white leather sneakers", "brown leather ankle boots", "black loafers"],
      acc: ["a slim watch with a leather strap", "small gold stud earrings", ""],
    }],
    [60, {
      top: ["a navy cardigan over a white t-shirt", "a soft grey merino sweater", "a dark green blouse with a small print", "a beige linen shirt"],
      bottom: ["dark straight trousers", "a mid-length navy A-line skirt", "dark slim jeans", "grey wool trousers"],
      shoes: ["low-heeled black pumps", "brown leather loafers", "comfortable white sneakers"],
      acc: ["a simple metal wristwatch", "a thin gold necklace", ""],
    }],
    [75, {
      top: ["a lilac knitted cardigan over a floral blouse", "a beige cable-knit sweater", "a pale blue blouse with a rounded collar", "a soft burgundy fleece jacket"],
      bottom: ["beige elastic-waist trousers", "a knee-length navy pleated skirt with skin-coloured tights", "grey straight trousers"],
      shoes: ["comfortable beige walking shoes", "low-heeled brown court shoes", "black lace-up comfort shoes"],
      acc: ["small pearl stud earrings", "a simple wristwatch", ""],
    }],
    [200, {
      top: ["a beige knitted cardigan over a cream blouse with a small floral print", "a powder-blue twinset", "a soft grey wool cardigan buttoned up over a white blouse", "a dusty-pink knitted cardigan over a patterned blouse"],
      bottom: ["a knee-length brown wool skirt with skin-coloured tights", "loose grey elastic-waist trousers", "a calf-length navy pleated skirt with tights"],
      shoes: ["flat beige comfort shoes with a velcro strap", "low-heeled brown leather shoes", "soft black slip-on shoes"],
      acc: ["a thin gold chain with a small pendant", "a simple wristwatch with a leather strap", ""],
    }],
  ],
  m: [
    [25, {
      top: ["a plain grey hoodie", "an oversized black t-shirt", "a white t-shirt under an open checked flannel shirt", "a navy zip-up track jacket"],
      bottom: ["loose light-blue jeans", "black cargo trousers", "grey jogging trousers"],
      shoes: ["white sneakers", "black high-top sneakers"],
      acc: ["a black digital wristwatch", ""],
    }],
    [40, {
      top: ["a navy crew-neck sweater", "a light-blue oxford shirt", "a plain white t-shirt under an olive field jacket"],
      bottom: ["dark slim jeans", "beige chinos", "charcoal trousers"],
      shoes: ["white leather sneakers", "brown leather boots", "tan suede desert boots"],
      acc: ["a steel wristwatch", ""],
    }],
    [60, {
      top: ["a grey quarter-zip sweater", "a blue checked flannel shirt", "a navy polo shirt", "a dark blue overshirt"],
      bottom: ["dark straight jeans", "stone chinos", "grey wool trousers"],
      shoes: ["brown leather lace-up shoes", "dark comfortable sneakers", "black loafers"],
      acc: ["a steel wristwatch", ""],
    }],
    [75, {
      top: ["a beige V-neck sweater over a checked shirt", "a navy cardigan over a light-blue shirt", "a brown corduroy jacket over a knitted polo"],
      bottom: ["grey flannel trousers", "beige pleated trousers", "dark brown corduroy trousers"],
      shoes: ["brown leather comfort shoes", "black lace-up shoes", "grey walking shoes"],
      acc: ["a wristwatch with a leather strap", ""],
    }],
    [200, {
      top: ["a grey knitted cardigan buttoned over a checked shirt", "a beige sleeveless sweater vest over a white shirt", "a navy zip cardigan over a pale shirt"],
      bottom: ["loose grey trousers with a belt", "brown pleated trousers", "beige elastic-waist trousers"],
      shoes: ["black comfort shoes with a velcro strap", "soft brown leather comfort shoes"],
      acc: ["a simple wristwatch", ""],
    }],
  ],
};
var SD_MOODS = {
  work: {
    f: [
      [35, { top: ["a white blouse under a camel blazer", "a fitted grey knit top under a navy blazer"], bottom: ["black straight trousers", "a navy knee-length pencil skirt"], shoes: ["black loafers", "low block-heeled black pumps"], acc: ["a slim watch with a leather strap", "small stud earrings"] }],
      [60, { top: ["a light-blue shirt under a dark grey blazer", "a cream blouse under a navy cardigan"], bottom: ["dark tailored trousers", "a grey knee-length skirt"], shoes: ["low-heeled black pumps", "brown leather loafers"], acc: ["a simple metal watch", "a thin necklace"] }],
      [200, { top: ["a cream blouse under a navy wool jacket", "a soft grey twinset"], bottom: ["dark straight trousers", "a mid-length tweed skirt"], shoes: ["low-heeled brown court shoes", "black comfort loafers"], acc: ["a classic wristwatch", ""] }],
    ],
    m: [
      [35, { top: ["a light-blue shirt under a navy blazer, no tie", "a white shirt under a grey knit sweater"], bottom: ["navy chinos", "charcoal trousers"], shoes: ["brown leather derby shoes", "white leather sneakers"], acc: ["a steel wristwatch", ""] }],
      [60, { top: ["a white shirt and blue tie under a navy suit jacket", "a pale shirt under a grey blazer"], bottom: ["navy suit trousers", "grey wool trousers"], shoes: ["black oxford shoes", "brown leather loafers"], acc: ["a steel wristwatch", ""] }],
      [200, { top: ["a light shirt and patterned tie under a tweed jacket", "a white shirt under a navy blazer"], bottom: ["grey flannel trousers", "brown corduroy trousers"], shoes: ["polished brown lace-up shoes", "black leather shoes"], acc: ["a wristwatch with a leather strap", ""] }],
    ],
  },
  evening: {
    f: [
      [35, { top: ["a black satin camisole under a cropped tailored blazer", "a fitted emerald-green long-sleeve wrap top"], bottom: ["a black satin midi skirt", "black wide-leg tailored trousers"], shoes: ["black strappy heeled sandals", "black pointed heeled pumps"], acc: ["small gold drop earrings", "a thin gold bracelet"] }],
      [60, { top: ["a navy silky blouse with a soft bow", "a black fitted knit top under a velvet blazer"], bottom: ["a black pencil skirt below the knee", "black wide-leg evening trousers"], shoes: ["black low-heeled pumps", "nude block-heeled sandals"], acc: ["pearl drop earrings", "a fine silver necklace"] }],
      [200, { top: ["a burgundy velvet jacket over a cream blouse", "a navy long-sleeve blouse with lace trim"], bottom: ["a long black pleated skirt", "dark straight evening trousers"], shoes: ["black low-heeled court shoes", "dark comfortable dress shoes"], acc: ["a string of pearls", "small pearl earrings"] }],
    ],
    m: [
      [35, { top: ["a slim black blazer over a white shirt with an open collar", "a dark navy knit polo under a charcoal blazer"], bottom: ["slim black tailored trousers", "charcoal suit trousers"], shoes: ["black leather Chelsea boots", "polished black derby shoes"], acc: ["a steel dress watch", ""] }],
      [60, { top: ["a navy suit jacket over a light-blue shirt and dark tie", "a charcoal blazer over a black turtleneck"], bottom: ["navy suit trousers", "dark grey wool trousers"], shoes: ["polished black oxford shoes", "dark brown leather loafers"], acc: ["a steel dress watch", "a silk pocket square"] }],
      [200, { top: ["a dark grey suit jacket and waistcoat over a white shirt", "a navy blazer over a pale shirt and patterned tie"], bottom: ["matching grey suit trousers", "grey flannel trousers"], shoes: ["polished black lace-up shoes", "brown leather dress shoes"], acc: ["a gold watch on a leather strap", ""] }],
    ],
  },
  cozy: {
    f: [
      [35, { top: ["an oversized cream knit sweater", "a soft grey hoodie"], bottom: ["loose grey jogging trousers", "soft ribbed oatmeal lounge trousers"], shoes: ["fluffy beige slippers", "thick wool socks"], acc: [""] }],
      [60, { top: ["a soft beige cardigan over a white t-shirt", "a long grey knit cardigan over a cotton top"], bottom: ["wide soft lounge trousers", "navy jogging trousers"], shoes: ["felt house slippers", "warm knitted socks"], acc: [""] }],
      [200, { top: ["a soft lilac fleece cardigan over a cotton top", "a warm knitted shawl over a cream sweater"], bottom: ["loose soft lounge trousers", "a long flannel skirt"], shoes: ["felt slippers with a closed heel", "warm wool socks"], acc: [""] }],
    ],
    m: [
      [35, { top: ["a grey hoodie", "an oversized sweatshirt"], bottom: ["grey jogging trousers", "loose flannel pyjama trousers"], shoes: ["slide sandals over white socks", "thick wool socks"], acc: [""] }],
      [60, { top: ["a navy zip sweatshirt over a t-shirt", "a soft grey knit sweater"], bottom: ["dark jogging trousers", "soft flannel lounge trousers"], shoes: ["leather house slippers", "thick socks"], acc: [""] }],
      [200, { top: ["a brown knitted cardigan over a checked shirt", "a beige fleece zip jacket"], bottom: ["soft corduroy trousers", "loose grey lounge trousers"], shoes: ["felt slippers", "warm socks"], acc: [""] }],
    ],
  },
  morning: {
    f: [
      [35, { top: ["an oversized white sleep t-shirt", "a pale pink cotton pyjama top"], bottom: ["matching cotton pyjama shorts", "loose striped pyjama trousers"], shoes: ["barefoot"], acc: [""] }],
      [60, { top: ["a light-blue cotton pyjama shirt with buttons", "a soft cotton robe over a sleep top"], bottom: ["matching long pyjama trousers"], shoes: ["soft house slippers", "barefoot"], acc: [""] }],
      [200, { top: ["a quilted floral dressing gown over a long cotton nightdress"], bottom: ["the nightdress reaching below the knees"], shoes: ["felt slippers"], acc: [""] }],
    ],
    m: [
      [35, { top: ["a plain grey sleep t-shirt"], bottom: ["loose plaid pyjama trousers"], shoes: ["barefoot", "slide sandals"], acc: [""] }],
      [60, { top: ["a navy cotton pyjama shirt", "a towelling bathrobe over a t-shirt"], bottom: ["matching pyjama trousers"], shoes: ["leather slippers"], acc: [""] }],
      [200, { top: ["a striped cotton pyjama shirt under a dark wool dressing gown"], bottom: ["matching striped pyjama trousers"], shoes: ["brown felt slippers"], acc: [""] }],
    ],
  },
  sport: {
    f: [
      [35, { top: ["a fitted black long-sleeve running top", "a loose grey training t-shirt"], bottom: ["black leggings", "navy running shorts over leggings"], shoes: ["running shoes"], acc: ["a sports watch", ""] }],
      [60, { top: ["a teal zip-up training jacket", "a breathable navy t-shirt"], bottom: ["dark leggings", "loose track trousers"], shoes: ["grey running shoes"], acc: ["a sports watch", ""] }],
      [200, { top: ["a pastel zip fleece", "a loose cotton t-shirt"], bottom: ["soft track trousers"], shoes: ["white walking sneakers"], acc: [""] }],
    ],
    m: [
      [35, { top: ["a fitted grey training t-shirt", "a black hoodie"], bottom: ["black running shorts", "dark track trousers"], shoes: ["running shoes"], acc: ["a sports watch", ""] }],
      [60, { top: ["a navy zip training jacket", "a technical grey t-shirt"], bottom: ["dark track trousers"], shoes: ["running shoes"], acc: ["a sports watch", ""] }],
      [200, { top: ["a beige zip fleece", "a loose polo shirt"], bottom: ["comfortable track trousers"], shoes: ["white walking sneakers"], acc: [""] }],
    ],
  },
};
var SD_MOOD_LABELS = [
  ["everyday", "Quotidien"],
  ["work", "Travail"],
  ["evening", "Soirée"],
  ["cozy", "Cocooning"],
  ["morning", "Au réveil"],
  ["sport", "Sport"],
];
function sdPickItem(t, k, salt, mood) {
  var md = mood || t.sdRndMood || "everyday",
    src = "everyday" !== md && SD_MOODS[md] ? SD_MOODS[md] : SD_WARDROBE,
    band = (src["f" === t.pres ? "f" : "m"] || []).find(function (b) {
      return (+t.age || 30) <= b[0];
    });
  if (!band) return "";
  var L = band[1][k],
    h = 2166136261,
    x = String(t.faceSeed || 0) + "|" + (t.pres || "") + "|" + band[0] + "|" + ("everyday" !== md ? md + "|" : "") + k + (salt || "");
  for (var i = 0; i < x.length; i++) h = Math.imul(h ^ x.charCodeAt(i), 16777619);
  return L[(h >>> 0) % L.length];
}
function sdRndOutfit(t) {
  var re = /^\s*(random|au hasard|hasard|al[ée]atoire)\s*$/i,
    o = null,
    kid = { top: ["t-shirt", "sweater", "hoodie", "polo shirt"], bottom: ["jeans", "sweatpants", "shorts", "cargo pants"], shoes: ["sneakers", "boots", "sandals"], acc: [""] };
  ["top", "bottom", "shoes", "acc"].forEach(function (k) {
    if (!re.test(String(t[k] || ""))) return;
    o = o || Object.assign({}, t);
    o[k] = (t[k + "Sel"] || []).length ? "" : sdChild(t) ? kid[k][((t.faceSeed || 1) >>> 0) % kid[k].length] : sdPickItem(t, k, "");
  });
  return o || t;
}
/* one-click outfit: writes concrete English garments into the four free fields (editable), clears the garment chips;
   each click draws a new combination for the current age and presentation */
function sdRndBtn(t, g) {
  /* only classes that exist in the compiled stylesheet; layout details that have no class are inline styles */
  var mood = t.sdRndMood || "everyday",
    moodLabel = (SD_MOOD_LABELS.find(function (m) {
      return m[0] === mood;
    }) || ["", "Quotidien"])[1],
    drawn = (+t.sdRndN || 0) > 0,
    fill = function (md) {
      var n = (+t.sdRndN || 0) + 1;
      ["top", "bottom", "shoes", "acc"].forEach(function (k) {
        g(k, sdPickItem(t, k, "#" + n, md));
      });
      ["topSel", "bottomSel", "shoesSel", "accSel", "colorSel"].forEach(function (k) {
        g(k, []);
      });
      g("sdRndMood", md);
      g("sdRndN", n);
    },
    chip = function (m) {
      var on = drawn && mood === m[0];
      return (0, l.jsxs)(
        "button",
        {
          type: "button",
          "aria-pressed": on,
          onClick: () => fill(m[0]),
          className:
            "relative inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium cursor-pointer select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
            (on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-foreground/40"),
          children: [on ? (0, l.jsx)(tB, { size: 14 }) : null, m[1]],
        },
        m[0],
      );
    },
    row = function (label, value) {
      return [
        (0, l.jsx)("dt", { className: "text-muted-foreground", children: label }, label + "-dt"),
        (0, l.jsx)(
          "dd",
          { className: "min-w-0 break-words", style: { margin: 0 }, children: value || "Aucun" },
          label + "-dd",
        ),
      ];
    };
  return (0, l.jsxs)(
    "div",
    {
      className: "py-4 border-b",
      children: [
        (0, l.jsx)("style", {
          children:
            "@keyframes sdRndIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}" +
            ".sd-rnd-card{animation:sdRndIn .22s ease-out}" +
            "@media (prefers-reduced-motion: reduce){.sd-rnd-card{animation:none}}",
        }),
        (0, l.jsxs)("button", {
          type: "button",
          "aria-expanded": !!t.sdRndOpen,
          "aria-controls": "sd-rnd-panel",
          onClick: () => g("sdRndOpen", !t.sdRndOpen),
          className:
            "inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          children: [
            (0, l.jsx)(t$, {
              size: 16,
              "aria-hidden": !0,
              className: "transition-transform duration-200 " + (t.sdRndOpen ? "rotate-180" : ""),
            }),
            "Tenue par ambiance",
          ],
        }),
        t.sdRndOpen &&
          (0, l.jsxs)("div", {
            id: "sd-rnd-panel",
            className: "mt-3 rounded-2xl border bg-card p-4",
            children: [
              (0, l.jsx)("p", { className: "font-semibold mb-3", children: "Choisis une ambiance" }),
              (0, l.jsx)("div", {
                className: "flex flex-wrap gap-2",
                role: "group",
                "aria-label": "Ambiance de la tenue",
                children: SD_MOOD_LABELS.map(chip),
              }),
              (0, l.jsx)("div", {
                "aria-live": "polite",
                children: drawn
                  ? (0, l.jsxs)(
                      "div",
                      {
                        className: "sd-rnd-card mt-4 rounded-xl bg-muted p-4 text-sm",
                        style: { borderLeft: "3px solid hsl(var(--tape))" },
                        children: [
                          (0, l.jsxs)("div", {
                            className: "flex items-center justify-between gap-3",
                            children: [
                              (0, l.jsx)("p", {
                                className: "font-semibold",
                                children: sdT(
                                  "Tenue " + moodLabel.toLowerCase() + ", " + (+t.age || 30) + " ans",
                                  { everyday: "Everyday", work: "Work", evening: "Evening", cozy: "Cozy", morning: "Morning", sport: "Sport" }[mood] + " outfit, age " + (+t.age || 30),
                                ),
                              }),
                              (0, l.jsx)("button", {
                                type: "button",
                                onClick: () => fill(mood),
                                className:
                                  "shrink-0 whitespace-nowrap rounded-full border bg-card px-3.5 py-1.5 text-sm font-semibold transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                children: "Autre tenue",
                              }),
                            ],
                          }),
                          (0, l.jsx)("dl", {
                            className: "mt-3",
                            style: { display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "0.75rem", rowGap: "0.25rem", margin: "0.75rem 0 0" },
                            children: [].concat(
                              row("Haut", t.top),
                              row("Bas", t.bottom),
                              row("Chaussures", t.shoes),
                              row("Accessoires", t.acc),
                            ),
                          }),
                          (0, l.jsx)("p", {
                            className: "mt-3 text-muted-foreground",
                            children: "Ajoutée aux champs ci-dessous, tu peux la modifier.",
                          }),
                        ],
                      },
                      "draw-" + t.sdRndN,
                    )
                  : (0, l.jsx)("p", {
                      className: "mt-3 text-sm text-muted-foreground",
                      children: sdT(
                        "La tenue tirée s'adapte à l'âge (" + (+t.age || 30) + " ans).",
                        "The outfit drawn fits the age (" + (+t.age || 30) + ").",
                      ),
                    }),
              }),
            ],
          }),
      ],
    },
    "sdRndN",
  );
}
var SD_GPT_NATURAL =
  "a natural teardrop bust line: a gently sloping upper part, the lower half slightly fuller, a slight natural drop; not round all over, not high";
var SD_GPT_MARKED =
  "a heavy, low bust line with a clear natural drop that comes with age: the upper chest flat and slightly emptied below the collarbones, the volume settled in the lower half, the lowest point below the bottom of the ribcage, toward the waist; not round, not lifted, not high";
function sdAutoBust(t) {
  if (t.photo || "m" === t.pres || "auto" !== t.bustShape || !(t.chest >= 2)) return t;
  var a = +t.age || 30,
    sc = (a <= 25 ? 0 : a <= 35 ? 1 : a <= 50 ? 2 : a <= 65 ? 3 : 4) + (t.chest >= 4 ? 2 : t.chest >= 3 ? 1 : t.chest > 2 ? 0.5 : 0) + (t.fat >= 3 ? 1 : 0),
    tier = sc <= 1 ? "young" : sc <= 3 ? "natural" : sc <= 5 ? "moderate" : "marked";
  return Object.assign({}, t, {
    bustShape: { young: "round", natural: "pear", moderate: "low", marked: "low" }[tier],
    sdAutoTier: tier,
  });
}
/* v96 "Forte": waist, hips, glutes and thighs left in the middle ("Moyen") take the next step up, so the prompt no longer says "average" for a fat body (prompts only, the sliders do not move) */
function sdForteParts(t) {
  if (4 !== +t.fat || "person" !== t.mode) return t;
  var u = Object.assign({}, t);
  ["waist", "hips", "glutes", "thighs"].forEach(function (k) {
    2 === +u[k] && (u[k] = "waist" === k ? 4 : 3);
  });
  return u;
}
/* v96 "Forte": the body fat described by what shows in the frame (belly only when Abdomen is Auto) */
function sdForteFat(gpt) {
  if (4 !== e.fat || "person" !== e.mode) return "";
  return (
    (gpt ? "Body fat: " : "A lot of soft body fat: ") +
    ("auto" === e.absStyle && !(e.waist <= 1)
      ? "a big, heavy, round belly that sticks out further than the " + ("m" === e.pres ? "chest" : "bust") + " in profile" +
        (e.waist >= 3 ? ", is wider than the hips in the front view" : "") +
        " and sags low, with a deep crease above the garment below it, which stays fully visible in every view; "
      : "") +
    "soft rolls on the back above the hips" +
    ("slim" === e.biceps ? "" : "; thick, soft upper arms") +
    (e.thighs >= 3 ? "; thighs touching from groin to knees" : "")
  );
}
var SD_FORTE_DETAIL = { "clearly visible collarbones": "softly padded collarbones", "a narrow ribcage": "a slightly wide ribcage", "a vertical, slit-like navel": "a deep, round navel", "bony, clearly drawn knees": "soft, rounded knees", "high calves with long lower tendons": "low, full calves", "slim ankles": "sturdy ankles", "long, slender fingers": "plump fingers" };
function sdForteBuild(x) {
  return 4 === e.fat && "slim" === e.biceps ? x.replace(" all over", "") : x;
}
function sdForteDetail(x) {
  return SD_FORTE_DETAIL[x] || x;
}
function sdG(t) {
  sdChild(t) && ((t.photo || t.photoOnly) && (t = Object.assign({}, t, { photo: !1, photoOnly: !1 })), (t = sdChildClean(t)));
  /* v114 (UI audit): grey hair, a receding hairline and heels are neither offered to nor sent for a child (a saved value falls back to the default) */
  sdChild(t) && (t = sdChildOpts(t));
  /* v113: never the free outfit for a child or a baby */
  sdChild(t) && (t.outfitFree || t.outfitText) && (t = Object.assign({}, t, { outfitFree: !1, outfitText: "" }));
  t = sdForteParts(t);
  /* "several in the same GPT conversation" names the subject within a GPT conversation (its toggle is hidden in Seedream: P13) */
  "seedream" === t.model && t.multiChar && (t = Object.assign({}, t, { multiChar: !1 }));
  t = sdIterNorm(t);
  return sdAutoBust(sdShift(sdRndOutfit(!sdNat(t) && ("tanga" === t.refCover || "brief" === t.refCover || "sport" === t.refCover || "fitted" === t.refCover) ? Object.assign({}, t, { refCover: "sport" === t.refCover || "fitted" === t.refCover ? "short" : "swim" }) : t)));
}
function sdIris() {
  if (t5(e.eyeColorCustom))
    return "Natural iris texture with visible fibres, the color not oversaturated.";
  return (
    {
      blue: "Natural blue irises with grey flecks and a darker outer ring, not saturated.",
      grey: "Natural grey irises with faint blue flecks and a darker outer ring.",
      green: "Natural muted green irises with amber flecks around the pupil, not saturated.",
      hazel: "Natural hazel irises, green-brown with visible fibres.",
      amber: "Natural amber irises with visible fibres.",
      brown: "Natural brown irises with visible fibres.",
      darkbrown: "Natural dark brown irises with visible fibres in the light.",
    }[e.eyeColor] || ""
  );
}
function sdOrigin() {
  var o = nt();
  if (!o) return "";
  var n = nu(),
    f = ["face", "eyes", "nose", "brows", "lips", "jaw"]
      .filter(function (k) {
        return n[k];
      })
      .map(function (k) {
        return n[k];
      });
  return f.length
    ? "Facial bone structure typical of people " + o + ", with " + f.join(", ") + ", natural, not a caricature."
    : "";
}
function sdFace() {
  return rm()
    .replace(
      /Face structure, this person's own and kept exactly in every panel: /,
      "Face structure: ",
    )
    .replace(/ This structure is what makes the face recognizable:[^.]*\./, "")
    .replace(
      /Individual details that make this face unique and recognizable, kept identical in every panel: /,
      "Individual details: ",
    )
    .replace(/Individual details, kept identical in every panel: /, "Individual details: ")
    .replace(/ They set this face apart from a generic face: keep every one of them\./, "");
}
function sdBackHair() {
  return "bald" === e.hairStyleSel || "shaved" === e.hairLen
    ? ""
    : ["ponytail", "bun", "braid"].indexOf(e.hairStyleSel) >= 0
      ? ", showing how the hair is gathered at the back: its length, the parting and the tie"
      : ["boxbraids", "cornrows", "locs", "twists", "afro", "undercut", "mohawk", "receding"].indexOf(e.hairStyleSel) >= 0
        ? ", showing the hairstyle from behind, its length and pattern"
        : ", showing how the hair falls at the back, its length and parting, worn down with no tie or clip";
}
function sdLooks() {
  /* Scale recalibrated on renders (Seedream v80, GPT v82): the former "Quelconque" text renders as "Ordinaire", so it moves to 2.
     3 and 4 name the measured gaps between a "super fille" render and an ordinary one: eye aperture, brow height,
     lower-face length, and a visible asymmetry (renders came out more symmetric than asked). Sides match the drawn details. */
  if (e.looks >= 2) return sdLooksText(e.looks);
  var b = "f" === e.pres ? "Beautiful" : "m" === e.pres ? "Handsome" : "Good-looking";
  if (0 === e.looks && "m" === e.pres)
    return "Handsome in a natural, clearly male way, like a real male model in an unretouched agency polaroid: harmonious, well-balanced proportions close to the average of real faces rather than unusual ones, a lean face" +
      ("auto" === e.jaw ? ", a clearly defined jaw" : "") +
      ("auto" === e.brows ? ", thick natural eyebrows" : "") +
      ", clear, healthy skin with warm, even color, neither feminized nor exaggerated, with the slight asymmetry of a real face; an original person who resembles no celebrity.";
  return (
    (0 === e.looks
      ? b + " in a natural, individual way, like a real model in an unretouched agency polaroid"
      : "Attractive in a natural, everyday way") +
    ", with the slight asymmetry of a real face; an original person who resembles no celebrity."
  );
}
/* a plain face is broad from its bones, not from fat: up to "Moyenne" corpulence the face stays as lean as the body
   (GPT rendered an athletic woman with a fat face when "full cheeks", "heavy" and "fleshy" stacked up) */
function sdLean() {
  return +e.fat <= 2;
}
/* "Très mince" and "Mince": the plain face stays narrow. Measured: the GPT render with "broad face" and "wide jaw"
   came out wider (width/height 0.863, jaw 0.801) than the renders read as fat; the slim reference photo is 0.801 / 0.750 */
function sdSlim() {
  return +e.fat <= 1;
}
/* New and saved face signatures must ignore the same clothing-only instructions. */
function sdSigWithoutOutfit(sig) {
  return sig
    .replace(/^Clothing and accessories of this outfit,[^\n]*(?:\n|$)/gm, "")
    .replace(/^Its clothing is not used: the person wears only the clothing described below\.(?:\n|$)/gm, "")
    .replace(/^(No captions, labels, panel numbers, watermarks or logos added to the image; the only lettering is the one the marks above describe), except any logo or print this outfit description names\.$/gm, "$1.")
    .replace(/^(No captions, labels, panel numbers, watermarks or logos added to the image; the only lettering is the one the marks above describe), besides any logo or print on the clothing taken from the photo\.$/gm, "$1.");
}
/* "same", "changed", or "legacy": a signature saved before v90 has no corpulence class; when everything it does hold
   still matches, only that class is unknown, so the tool says so instead of announcing a changed face */
function sdSigState(saved) {
  if (!saved) return "none";
  saved = sdSigWithoutOutfit(saved);
  var cur = as();
  if (saved === cur) return "same";
  var x = sdSigExtra();
  return x && -1 === saved.indexOf("\n#face-fat:") && saved === cur.slice(0, cur.length - x.length) ? "legacy" : "changed";
}
/* appended to the head signature: from "Ordinaire" up the final face text also depends on the corpulence class */
function sdSigExtra() {
  return "person" === e.mode && !e.photo && e.looks >= 2 ? "\n#face-fat:" + (sdSlim() ? "slim" : sdLean() ? "lean" : "full") : "";
}
function sdLeanText() {
  return (
    "facial fat in line with " +
    sdPos() +
    " body (" +
    n_() +
    "): " +
    (sdSlim()
      ? "a lean, narrow face, the jaw clearly narrower than the cheekbones, no puffiness, no fullness under the chin and a clear angle between jaw and neck"
      : "a lean face with no puffiness, no fullness under the chin and a clear angle between jaw and neck; the breadth comes from the bones, not from fat")
  );
}
/* GPT: a new beauty level or corpulence is a new face, not an update of the last head sheet (the update kept a fat face).
   Both belong to the person: an animal head copy records them too, but they say nothing about the animal */
function sdFaceReset() {
  return "person" === e.mode && null != e.headLooks && "" !== e.headLooks && (+e.headLooks !== +e.looks || +e.headFat !== +e.fat);
}
function sdLooksText(lv) {
  var p = sdPos(),
    lean = sdLean(),
    ang = +e.faceAngle > 2,
    fine = +e.featFine > 2,
    jaw = "strong" === e.jaw,
    feat = ang || fine || jaw ? "plain, unremarkable features" : "",
    lip = "f" === e.pres && !("none" !== r8() && r9()) ? "lips barely darker than the skin around them, " : "";
  if (2 === lv)
    return (
      "A plain, forgettable face, the kind nobody notices in a crowd: " +
      (feat || (lean ? "plain, unremarkable features, nothing chiselled" : "soft, slightly heavy features with little definition, no sculpted cheekbones or jawline")) +
      ", features slightly out of proportion with each other, " +
      lip +
      "hair without shine, no striking feature, with the asymmetry of a real face" +
      (lean ? "; " + sdLeanText() : "") +
      "."
    );
  /* 3 = the user's reference photos of "quelconque" women, measured against the renders: wider nose (largest gap),
     narrower eyes, wider jaw, fuller cheeks, broader face. Renders also came out more symmetric than asked. */
  if (3 === lv)
    return (
      "A plain, everyday face, the kind nobody notices in a crowd: " +
      [
        ang ? (sdSlim() ? "" : "a broad face") : sdSlim() ? "a flat mid-face" : lean ? "a broad face from its bone structure, with a flat mid-face" : "a broad face with full cheeks and a flat mid-face",
        fine && "auto" === e.noseW && "auto" === e.noseP ? "" : "a broad nose, clearly wider than the gap between the eyes",
      ]
        .filter(Boolean)
        .map(function (s) {
          return s + ", ";
        })
        .join("") +
      ("auto" === e.eyeSize ? "rather small eyes, each about a fifth of the face width, " : "") +
      (sdSlim() ? "" : "a wide jaw, nearly as wide as the cheekbones, ") +
      (feat ? feat + ", " : lean ? "plain, unremarkable features, nothing chiselled, " : "soft features with no definition, no sculpted cheekbones or jawline, ") +
      lip +
      "hair without shine; " +
      (lean ? sdLeanText() + "; " : "") +
      "slightly uneven: " +
      p +
      " right eye a little smaller than " +
      p +
      " left, the nose bending slightly toward " +
      p +
      " right."
    );
  return (
      "A homely face that nobody looks at twice: " +
      ("auto" === e.eyeSize ? "small, deep-set eyes under heavy lids" : "deep-set eyes under heavy lids") +
      ", low, heavy brows, " +
      (jaw ? "a long lower face, a big jaw and chin" : lean ? "a long lower face, a big, plain jaw and chin" : "a long, heavy lower face, a fleshy jaw and chin with no shape") +
      ", features that do not fit together, " +
      lip +
      "dull hair; " +
      (lean ? sdLeanText() + "; " : "") +
      "strongly uneven: " +
      p +
      " right eye clearly smaller and lower than " +
      p +
      " left, the nose clearly bent toward " +
      p +
      " right, the mouth sitting crooked, its right corner lower."
  );
}
function sdSkinHead() {
  var x = [
    [
      "Smooth skin that still shows fine pores",
      "Natural skin: fine pores, slight unevenness",
      /* v104: with "Canon", "Naturelles" keeps the skin texture but not the redness or the spots, as the Beauté hint says and as GPT already does (ru) */
      0 === e.looks
        ? "Real, unretouched skin with visible pores and a natural, healthy texture, clear and even-toned"
        : "Real, unretouched skin: visible pores on the nose and cheeks, slight redness around the nostrils, small blemishes, slightly uneven tone, faint shadows under the eyes",
      "Clearly imperfect skin: enlarged pores on the nose and cheeks, several small spots and blemishes, redness around the nose and chin, dark under-eye circles, an oily shine on the forehead and nose, an uneven, slightly blotchy tone",
      "Rough skin: acne scars, a few active spots, broken capillaries, under-eye bags, an oily shine, a blotchy tone",
    ][e.imperf] || "Natural skin with fine pores",
  ];
  e.imperf >= 1 &&
    x.push(
      0 === e.looks && "m" === e.pres
        ? "clean-shaven" === (t1("facialHair", e.facialHair) || "clean-shaven")
          ? "a faint, even beard shadow on the jaw and upper lip"
          : "fine, natural facial hair texture"
        : e.looks >= 2 ? "fine peach fuzz on the cheeks and jaw" : "fine peach fuzz catching the light on the cheeks and jaw",
      "natural lip texture with fine lines",
    );
  "bald" !== e.hairStyleSel && "shaved" !== e.hairLen && x.push("a few flyaway hairs");
  var m = r8();
  "none" === m ? x.push("no makeup") : !r9() && e.looks <= 1 && x.push("little or no makeup");
  return x.join(", ") + "." + ("none" !== m && r9() ? " Makeup: " + r9() + "." : "");
}
function sdNeck() {
  if (nv()) {
    /* a face sheet never shows undress or swimwear: always a plain, clothed neckline */
    return (
      "At the bottom edge of each panel only the " +
      ("m" === e.pres ? "crew neckline of a plain cobalt-blue t-shirt" : "scoop neckline of a plain cobalt-blue sleeveless top") +
      " shows."
    );
  }
  if (sdFreeText()) return "Only the parts of this outfit that a head close-up shows, identical in every panel: the neckline at the bottom edge, and anything worn at the neck, on the head or on the face: " + sdFreeText() + ".";
  return (
    "At the bottom edge of each panel only the neckline of " +
    (nL() || "a plain crew-neck top in a solid neutral color") +
    " shows, plain and unbranded."
  );
}
function sdHead() {
  var p = sdPos(),
    lg = "long" === e.hairLen || "vlong" === e.hairLen,
    pr =
      0 === e.looks
        ? "In profile: the lips just behind the line from nose tip to chin, " +
          ("auto" === e.jaw && !sdCharOn() ? ("m" === e.pres ? "a strong, projected chin, " : "a gently projected chin, ") : "") +
          "a clean jaw-to-neck line."
        : "",
    s =
      (e.looks >= 2
        ? "Standardized clinical photograph from a general dermatology patient record, 16:9 landscape, four equal vertical panels separated by thin mid-grey gaps: the same everyday " +
          sdWho() +
          " in all four panels, photographed as " +
          ("f" === e.pres ? "she is" : "m" === e.pres ? "he is" : "they are") +
          "."
        : "Unretouched studio photograph, 16:9 landscape, four equal vertical panels separated by thin mid-grey gaps: an identity reference sheet of one " +
          sdWho() +
          ", the same person in all four panels.") +
      "\nFirst panel: front view, looking straight into the lens. Second panel: three-quarter view, " +
      p +
      " face turned toward the right edge of the frame, showing more of the right side of " +
      p +
      " face. Third panel: exact profile facing the left edge of the frame, showing the left side of " +
      p +
      " face and " +
      p +
      " left ear. Fourth panel: back view, the back of " +
      p +
      " head seen straight from behind, no face visible" +
      sdBackHair() +
      ". Each panel is a tight head-and-shoulders close-up, from just above the top of the hair to just below the collarbones; the head has the same size and height in all four panels" +
      (lg ? ", long hair may be cropped by the panel edges" : "") +
      ".\n\n";
  s +=
    t6(rS()) +
    ": " +
    nn() +
    ". " +
    t6(ne()) +
    ". " +
    t6(nT()) +
    "." +
    (sdIris() ? " " + sdIris() : "") +
    (sdOrigin() ? " " + sdOrigin() : "") +
    "\n";
  var f = sdCharFace(sdFace());
  f && (s += f + "\n");
  sdChar() && (s += sdChar() + "\n");
  s += sdLooks() + (pr ? " " + pr : "") + "\n";
  var mk = rg(!0);
  mk && (s += "Distinctive marks, each on the stated side: " + mk + ".\n");
  rl() &&
    (s +=
      "Current state, on the stated side, where it shows in a head close-up: " + rl() + ".\n");
  nz() && (s += "Worn on the head and face, identical in every panel: " + nz() + ", plain and unbranded.\n");
  s += sdNeck() + "\n\nNeutral, relaxed expression, lips closed, no smile.\n\n";
  s +=
    e.looks >= 2
      ? "Plain mid-grey backdrop. Standard clinical lighting: two diffused lights at 45 degrees on either side of the camera, even and neutral, with no shaping shadows; the same light in all four panels. 50mm lens at eye level, the whole head in sharp focus.\n\n"
      : "Plain seamless mid-grey backdrop. One large soft key light from camera left, slightly above eye level, with a weak fill on the right, so the far cheek and the side of the nose keep gentle shadow and the skin texture reads; the same fixed light in all four panels. 85mm lens at eye level, the whole head in sharp focus.\n\n";
  s +=
    sdSkinHead() +
    (e.looks >= 2
      ? " Accurate, neutral colors and sharp detail, not airbrushed, not a 3D render. " + sdFreeNoText(sdLetters() ? SD_LETTERS : "No text, labels, scale bars, markings or watermark.")
      : " Natural colors, fine film grain, not airbrushed, not a 3D render. " + sdFreeNoText(sdLetters() ? SD_LETTERS : "No text, labels or watermark."));
  return s;
}
function sdLegs(hl) {
  var L = at[e.legs] || 47,
    lead =
      [
        "Very short legs, long torso",
        "Short legs, longer torso",
        "Average leg-to-torso proportions",
        "Long legs, short torso",
        "Very long legs, short torso",
      ][e.legs] || "Average leg-to-torso proportions";
  if (hl) {
    var r = Math.round((L / (83.375 - L)) * 10) / 10;
    return (
      lead +
      ": the legs (crotch to soles) are " +
      (r <= 1.05 ? "about as long as" : "about " + String(r) + " times as long as") +
      " the torso (neck base to crotch). From the collarbones at the top edge down to the soles, the crotch sits about " +
      Math.round(100 / (1 + r)) +
      "% of the way down, so the legs fill the lower " +
      (100 - Math.round(100 / (1 + r))) +
      "% of the figure" +
      (r >= 1.35 ? "; the crotch is clearly above the middle of the panel." : r <= 1.2 ? "; the crotch is close to the middle of the panel, not above it, and the legs look short for the torso." : ".")
    );
  }
  return (
    lead +
    ": the crotch sits " +
    (["well below", "below", "slightly below", "exactly at", "above"][e.legs] || "slightly below") +
    " half of the total height, about 8 heads tall."
  );
}
/* warning under the outfit choice: fitted top with a "Très généreuse" bust in Seedream */
function sdFittedWarn(t) {
  return sdNat(t) && "m" !== t.pres && t.chest >= 4 && "fitted" === sdShownCover(t)
    ? (0, l.jsx)("p", {
        className: "mt-3 text-sm font-semibold text-destructive",
        children: sdT(
          "Haut ajusté avec une poitrine Très généreuse : Seedream retire souvent l'image juste après l'avoir générée (« sensitive content »). Relance plusieurs fois ; si ça bloque toujours, prends le haut ample.",
          "Fitted top with a Very generous bust: Seedream often removes the image right after generating it (\"sensitive content\"). Run it several times; if it keeps getting blocked, use the loose top.",
        ),
      })
    : null;
}
/* same warning where the fitted top and leggings are always used: the with-head body sheet (reference outfit on) and the "Habiller" / "Ajouter les têtes" retouches */
function sdHeadWarn(t, k) {
  var on =
    "person" === t.mode &&
    "m" !== t.pres &&
    t.chest >= 4 &&
    ("body" === k ? nv() && !nw() : "dress" === sdOp(t) || "heads" === sdOp(t));
  return on
    ? (0, l.jsx)(
        "p",
        {
          className: "mt-3 text-sm font-semibold text-destructive",
          children: sdT(
            "Haut ajusté avec une poitrine Très généreuse : Seedream retire souvent l'image juste après l'avoir générée (« sensitive content »). Relance plusieurs fois ; si ça bloque toujours, fais la planche corps sans tête en haut ample, puis « Assembler tête et corps ».",
            "Fitted top with a Very generous bust: Seedream often removes the image right after generating it (\"sensitive content\"). Run it several times; if it keeps getting blocked, make the headless body sheet in the loose top, then use \"Combine head and body\".",
          ),
        },
        "warn",
      )
    : null;
}
/* "Très mince": a lower scoop neckline so the bony upper chest shows (collarbones, breastbone, first ribs), never the bust itself */
function sdTopNeck() {
  return "m" !== e.pres && 0 === e.fat
    ? "a lower, wider scoop neckline showing the collarbones, the breastbone and the first ribs under the thin skin, down to about a hand's width below the collarbones (never the bust itself)"
    : "a modest round neckline";
}
/* "Très généreuse": loose sleeveless top, arms bare, the side of the bust visible through the armholes (wanted by the user to judge the drop).
   A fitted top at this size was replaced as sensitive content after generation (v84 to v86), the loose top passed. */
function sdLooseTop() {
  return "a loose cobalt-blue sleeveless cropped top in medium-weight, opaque cotton jersey, with " + sdTopNeck() + " and wide armholes, so the whole arms and shoulders are bare; it covers the whole bust and drapes over it without " + ("low" === e.bustShape ? "lifting or pressing it" : "clinging, lifting or flattening it") + ", double-layered at the front so no detail shows through, no padding, no underwire; " + ("low" === e.bustShape ? "the soft jersey settles onto the bust, never forming a high shelf or a forward point on the chest;" : "in the side views its front falls straight down from the fullest point of the bust, so the full size of the bust reads clearly;") + " in the side views the wide armholes show the bare side of the bust and its full outline from the armpit down to its lowest point, so its size and its drop read clearly; its hem hangs loose a hand's width below the bust, so the navel and the lower abdomen are bare; seen from behind, it covers the upper back";
}
/* fitted top from "Généreuse" up: heavyweight matte jersey with a little ease, close but not skin-tight, so it shows the size and the low position of the bust but no surface detail.
   v85 tried a built-in lining: the bust looked supported and details still showed; Seedream then replaced the image as sensitive content after display. */
function sdTopCloth() {
  return "m" !== e.pres && e.chest >= 3 ? "heavyweight, matte, opaque cotton jersey" : "medium-weight, opaque cotton jersey";
}
function sdTopFollow() {
  return "m" !== e.pres && e.chest >= 3
    ? " and follows the size, shape and position of the bust like a regular T-shirt with a little ease, close but not skin-tight, without flattening or lifting it"
    : " and follows the natural size, shape and position of the bust like a fitted T-shirt, without flattening or lifting it";
}
function sdLining() {
  return "m" !== e.pres && e.chest >= 3
    ? ", its smooth, thick front bridging over the bust so no detail shows through"
    : ", double-layered at the front and lying smooth over the " + ("m" === e.pres ? "chest" : "bust") + " so no detail shows through, no padding";
}
/* GPT body light (P50): the hard light that sculpts the muscles only with musculature Athlétique or more, or a zone set to Marqués
   (visible veins alone no longer trigger it). Seedream keeps its own rule in sdBody (v1.1.2, tested on renders): a lean body
   with veins gets the hard light for the veins alone */
function sdHardLight() {
  return n0() && (e.muscle >= 2 || rA().some(function (k) {
    return "strong" === rP(k);
  }));
}
/* very slim build: the ribs show where the torso is uncovered (Seedream and GPT) */
function sdRibs() {
  return ", the ribs showing clearly under the thin skin wherever the torso is uncovered, along the sides of the ribcage and below the " + ("m" === e.pres || !(e.chest >= 1) ? "chest" : "bust") + " in the front view and along the flanks in the side views";
}
/* bust values: 0, 1, 2, 2.5 (intermediate), 3, 4 -> positions 0..5 */
function sdCi(c) {
  var i = [0, 1, 2, 2.5, 3, 4].indexOf(+c);
  return i < 0 ? 2 : i;
}
function sdBust() {
  if ("m" === e.pres) return t1("pecs", e.chest);
  var c = e.chest,
    ci = sdCi(c),
    size =
      [
        "a completely flat chest",
        "a very small bust, almost flat in profile",
        "a medium bust",
        "a fairly full bust, larger than average",
        "low" === e.bustShape && "moderate" !== e.sdAutoTier
          ? "a large, heavy natural bust"
          : "low" === e.bustShape
            ? "a large, soft natural bust"
          : "pear" === e.bustShape
            ? "a large, heavy natural bust"
            : "conical" === e.bustShape
              ? "a large, generous natural bust"
              : "a large, full natural bust",
        "a very large, heavy natural bust, out of proportion with her " + (e.fat <= 1 ? "slim " : "") + "frame",
      ][ci] || "a medium bust",
    cup = ["", "", "about a B to C cup", "about a D cup", "about a D to E cup", "about an H cup"][ci] || "",
    sh =
      c >= 1
        ? {
            round: "a rounded shape" + ("young" === e.sdAutoTier ? ", naturally full and firm" : ""),
            high: "a high-set shape",
            low:
              c >= 3 && "moderate" === e.sdAutoTier
                ? "soft, with a visible natural drop: the upper chest slightly emptied below the collarbones, the volume settled in the lower half, the lowest point near the bottom of the ribcage; never round, firm or high"
                : c >= 4
                ? "with a strong natural drop, heavy and soft rather than firm, round or pointed, like a heavy, well-filled soft pouch: the upper chest stays long and flat for about two hands' width below the collarbones before the bust begins; the volume spreads wide toward the sides and settles low, its lowest point a hand's width above the navel, resting against the ribcage with a soft crease beneath it; in profile the upper slope is long, flat and slightly hollow, and all the volume sits in a heavy, full lower part that projects well forward of the stomach, low on the ribcage; the fullest point is low, near the bottom of the bust, never in the middle; slightly uneven, the left side a little lower; never round, conical, firm, high or lifted"
                : c >= 3
                ? "with a pronounced natural drop: the upper chest flat below the collarbones, the volume settled low, the lowest point only a hand's width above the navel, resting against the ribcage; in profile the bust falls downward more than it projects forward; slightly uneven, the left side a little lower; never round, firm, high or lifted"
                : c >= 2
                  ? "soft and slightly low, the fullest part in the lower half, the nipples pointing slightly down, the lowest point at the lower ribs; never round, firm or high"
                  : "slightly drooping, the little volume sitting low",
            conical:
              c >= 2
                ? "shaped like an eggplant seen from the side: a narrow base on the chest, the volume projecting forward and slightly down to a full, rounded tip, clearly more projecting than wide; natural and unenhanced, never implant-like, round, hemispherical or wide at the base"
                : "small and slightly pointed, projecting a little forward from a narrow base",
            pear:
              "natural" === e.sdAutoTier
                ? "a natural teardrop shape: a gently sloping upper part, the lower half fuller, a slight natural drop; natural and unenhanced, never implant-like"
                : c >= 2
                ? "pear-shaped, hollow above and full below: in profile the upper slope from the chest down to the fullest point is slightly hollow, a concave upper pole, then a deep, round, full curve below it, a convex lower pole holding most of the volume; from the front narrow at the top, no fullness near the collarbones; the upper part slightly deflated; the lowest point near the bottom of the ribcage; natural and unenhanced, never implant-like, round all over, high or balloon-like"
                : "small, flatter at the top, the little volume sitting in the lower half",
            wide: "wide-set, about a hand's width apart at the center, each side angled slightly outward",
            asym: "clearly asymmetric, the left side visibly fuller and slightly lower than the right in every view",
          }[e.bustShape]
        : "";
  var big = 5 === ci,
    out =
      size +
      (cup ? " (" + cup + ")" : "") +
      /* "Assez généreuse": same front landmark as the GPT text (v93); not with the conical shape, whose base is narrow */
      (3 === ci && "conical" !== e.bustShape ? ", its base covering most of the width of the chest in the front view" : "") +
      (c >= 3 && !big && ["low", "conical"].indexOf(e.bustShape) < 0 ? " with a wide base" : "") +
      (3 === c && ["pear", "conical"].indexOf(e.bustShape) >= 0 ? ", clearly larger than average" : "") +
      (sh ? ", " + sh : "");
  /* "Très généreuse": visibly bigger than "Généreuse" through landmarks and its cup (about an H, v80), no nipple wording */
  return big
    ? out.replace(/,? the nipples pointing[^,;.]*/, "") +
        "; in the front view the bust fills the whole width of the chest, its outer sides " + ("low" === e.bustShape ? "spreading" : "bulging") + " past the ribcage against the inner arms" +
        ("low" !== e.bustShape ? "; in profile it projects forward from the ribcage by a little more than the length of her hand, far beyond the stomach" : "")
    : out;
}
function sdAbs() {
  var r = "m" !== e.pres && "dadbod" === e.absStyle ? "belly" : e.absStyle;
  if (!r || "auto" === r) return "";
  var m = {
      soft: "a soft, flat to slightly rounded belly with no visible abs",
      flat: "a flat, smooth stomach with no visible abdominal segments",
      line: "a flat stomach with a single vertical groove down the middle and no horizontal lines",
      four: "four segments above the navel, the lower belly smooth and flat",
      six: "six segments in three rows",
      eight: "eight segments in four rows, down to below the navel",
      staggered: "abdominal segments in an uneven, staggered pattern",
      belly: "a small, soft lower belly that protrudes slightly, no visible abs",
      dadbod: "a soft, rounded belly over a solid, broad frame, no visible abs",
    }[r],
    seg = ["four", "six", "eight", "staggered", "line"].indexOf(r) >= 0,
    lv =
      {
        none: ", barely visible",
        subtle: ", softly visible",
        clear: ", with clear shadow lines",
        strong: ", sharply outlined with deep shadow lines",
      }[e.defAbs] || ", with clear shadow lines";
  return m ? "Abdomen: " + m + (seg ? lv : "") + "." : "";
}
/* The Muscles line's zones at "Discrets" share one phrase when they are at least as many as its zones at "Présents" or
   "Marqués": listed one by one, they were among the cues that made a slim body athletic (docs/PROMPT-LOG.md). Abs with a
   chosen style have their own line (sdAbs) and do not count. */
function sdSoft() {
  var v = rA()
      .filter(function (k) {
        return "defAbs" !== k || "auto" === e.absStyle;
      })
      .map(rP),
    n = function (l) {
      return v.filter(function (x) {
        return l.indexOf(x) >= 0;
      }).length;
    };
  return n(["subtle"]) > 0 && n(["subtle"]) >= n(["clear", "strong"]);
}
/* Musculature at "Athlétique" or less, no biceps or trapezius at "Développés" or "Massifs". */
function sdNoBulk() {
  return e.muscle <= 2 && ["big", "huge"].indexOf(e.biceps) < 0 && ["big", "huge"].indexOf(e.traps) < 0;
}
function sdMus() {
  var soft = sdSoft(),
    z = function (k, m) {
      return soft && "subtle" === rP(k) ? "" : m[rP(k)] || "";
    },
    leg = rN()
      ? {
          subtle: "softly toned calves, soft thighs",
          clear: "drawn knees, visible calves",
          strong: "sharp knees and calves, soft thighs",
        }
      : e.thighs <= 1
        ? {
            subtle: "lean, softly toned legs",
            clear: "lean legs with subtle muscle tone",
            strong: "lean legs with defined but slim muscles",
          }
        : 2 === e.thighs
          ? {
              subtle: "softly toned legs",
              clear: "toned thighs and visible calves",
              strong: "toned thighs and sharp calves",
            }
          : {
              subtle: "softly toned legs",
              clear: "visible quadriceps and calves",
              strong: "separated quadriceps and sharp calves",
            },
    p = [
      z("defShoulders", {
        subtle: "softly visible shoulder muscles",
        clear: "defined shoulders",
        strong: "sharply cut shoulders",
      }),
      z("defBack", {
        subtle: "a softly toned back",
        clear: "visible shoulder blades and spine groove",
        strong: "a sharply defined back with clear lats and a deep groove along the spine",
      }),
      z("defArms", {
        subtle: "softly toned arms",
        clear: "a visible groove between biceps and triceps",
        strong: "very marked arms: deep grooves between biceps and triceps that hollow the upper arms, " + ("none" !== rP("defShoulders") ? "the shoulder cap clearly separated, " : "") + "every forearm muscle and tendon visible" + (["big", "huge"].indexOf(e.biceps) < 0 && e.muscle <= 2 ? ", not bulky" : ""),
      }),
      z("defLegs", leg),
    ];
  "m" === e.pres &&
    p.push(
      z("defChest", {
        subtle: "a softly visible chest",
        clear: "a defined chest",
        strong: "a sharply outlined chest",
      }),
    );
  "auto" === e.absStyle &&
    p.push(
      z("defAbs", {
        subtle: "a soft outline of the abs",
        clear: "visible abs",
        strong: "sharply visible abdominal segments",
      }),
    );
  "auto" !== e.biceps &&
    p.push({ slim: "slim upper arms", medium: "moderate biceps and triceps", big: "rounded biceps and triceps", huge: "very large biceps and triceps" }[e.biceps] || "");
  "auto" !== e.traps &&
    p.push({ flat: "a flat trapezius line", medium: "a moderate trapezius slope", big: "trapezius rising visibly from the neck", huge: "very large trapezius rising steeply from the skull" }[e.traps] || "");
  p = p.filter(Boolean);
  soft && p.unshift("barely visible muscles" + (sdNoBulk() ? ", no muscle bulk" : ""));
  p.length && "m" !== e.pres && e.chest >= 1 && "low" !== e.bustShape && p.push("a smooth upper chest");
  var x = [],
    nz = [];
  "none" === rP("defShoulders") && nz.push("shoulders");
  "none" === rP("defBack") && nz.push("back");
  "none" === r_() && nz.push("arms");
  "none" === rO() && nz.push("legs");
  p.length
    ? (x.push("Muscles: " + p.join(", ") + "."), nz.length && x.push("No visible muscle definition on the " + sdList(nz) + "."))
    : "auto" === e.absStyle &&
      "auto" === e.biceps &&
      "auto" === e.traps &&
      x.push("No visible muscle definition.");
  var ab = sdAbs();
  ab && x.push(ab);
  ("strong" === r_() || "strong" === rP("defShoulders")) &&
    e.muscle <= 2 &&
    ["big", "huge"].indexOf(e.biceps) < 0 &&
    x.push("Arm and shoulder muscles stay average-sized.");
  rD() &&
    x.push(
      {
        none: "No visible veins on the arms and hands.",
        light: "Faint veins on the backs of the hands and inner forearms.",
        visible: "Visible veins on the hands, forearms and inner upper arms.",
        strong: "Prominent veins on the hands, forearms, biceps, front of the shoulders and lower legs.",
      }[rD()] || t6(t1("veins", rD())) + ".",
    );
  var d = rA().some(function (k) {
      var v = rP(k);
      return "clear" === v || "strong" === v;
    }),
    so = [];
  "m" !== e.pres && e.chest >= 1 && (d || rw().indexOf("the bust") >= 0) && ["conical", "high", "round"].indexOf(e.bustShape) < 0 && so.push("bust");
  ("belly" === e.absStyle || "soft" === e.absStyle || "dadbod" === e.absStyle) && d && so.push("belly");
  ["low", "flat"].indexOf(e.glutesShape) >= 0 && so.push("glutes");
  (rM() || rj()) && so.push("hips", "thighs");
  so.length &&
    (d || rw().length) &&
    "low" !== e.bustShape &&
    "low" !== e.glutesShape &&
    x.push("The " + sdList(so) + (so.length > 1 || /s$/.test(so[0]) ? " stay" : " stays") + " soft, shaped by gravity.");
  d && e.muscle <= 2 && "low" !== e.glutesShape && "low" !== e.bustShape && x.push("Definition from leanness, not from muscle size.");
  var sk = [];
  "m" !== e.pres && e.chest >= 1 && sk.push("breasts");
  ["low", "flat"].indexOf(e.glutesShape) >= 0 && sk.push("glutes");
  (rM() || rj()) && sk.push("hips", "thighs");
  d && sk.length && x.push("This definition never slims the " + sdList(sk).replace(/ and ([^ ]+)$/, " or $1") + ".");
  return x.join(" ");
}
function sdDetails() {
  if (!e.faceSeed) return "";
  var t = (0x9e3779b9 ^ e.faceSeed) >>> 0,
    n = function () {
      var e = (t = (t + 0x6d2b79f5) >>> 0);
      return (
        (e = Math.imul(e ^ (e >>> 15), 1 | e)),
        (((e ^= e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ (e >>> 14)) >>> 0) / 0x100000000
      );
    },
    r = function (e) {
      return e[Math.floor(n() * e.length)];
    },
    a = [];
  a.push(r(["slightly sloping shoulders", "square shoulders"]));
  a.push(r(["clearly visible collarbones", "softly padded collarbones"]));
  a.push(r(["a slightly wide ribcage", "a narrow ribcage"]));
  a.push(r(["a small, round navel", "a vertical, slit-like navel"]));
  a.push(r(["bony, clearly drawn knees", "soft, rounded knees"]));
  a.push(r(["high calves with long lower tendons", "low, full calves"]));
  a.push(r(["slim ankles", "sturdy ankles"]));
  a.push(r(["long, slender fingers", "short, strong fingers"]));
  a.push(r(["a marked curve in the lower back", "a fairly straight lower back"]));
  a.push(
    r(
      [
        "a small mole on the left shoulder blade",
        "a cluster of faint freckles on both shoulders",
        "a small birthmark above the right hip",
        "a small mole on the inner left forearm",
      ].concat((e.bodyScars || 0) > 0 || t5(e.marks) ? [] : ["no visible body marks"]),
    ),
  );
  a = a.filter(function (x) {
    return "no visible body marks" !== x;
  });
  e.shoulders <= 1 && (a = a.map(function (x) {
    return "square shoulders" === x ? "slightly sloping shoulders" : x;
  }));
  var cv = e.fat <= 1
    ? { "softly padded collarbones": "clearly visible collarbones", "low, full calves": "slim calves", "soft, rounded knees": "bony, clearly drawn knees", "sturdy ankles": 0 === e.fat ? "slim ankles" : "sturdy ankles" }
    : e.fat >= 3
      ? e.fat >= 4
        ? Object.assign({}, SD_FORTE_DETAIL)
        : { "clearly visible collarbones": "softly padded collarbones", "bony, clearly drawn knees": "soft, rounded knees", "high calves with long lower tendons": "low, full calves", "slim ankles": "slim ankles" }
      : {};
  "low" === e.glutesShape && (cv["a marked curve in the lower back"] = "a fairly straight lower back");
  a = a.map(function (x) {
    return cv[x] || x;
  });
  return "Body details: " + a.join(", ") + ".";
}
function sdSkinBody() {
  var s =
      t6(t7("skin")) +
      (nw() ? " everywhere" : " everywhere, as on the face") +
      (e.skin <= 1 && !t5(e.skinCustom) ? ", never tanned" : "") +
      ". ",
    x = ["Matte texture: fine pores", "faint body hair"];
  e.imperf >= 1 &&
    x.push(
      !nw() && nv() ? "" : "redness on knees and elbows",
    );
  var q = ["", "", "slightly uneven tone", "visible marks, redness and uneven tone", "rough patches, scars and blotchy tone"][e.imperf];
  q && x.push(q);
  "none" !== e.cellulite && "m" !== e.pres && (nw() || !nv()) && x.push(nv() ? t1("cellulite", e.cellulite).replace(/ where the skin is uncovered$/, "") : t1("cellulite", e.cellulite));
  s += x.filter(Boolean).join(", ") + ". Not oiled or airbrushed.";
  e.age < 40 &&
    (n0() || rD()) &&
    (s +=
      " Healthy skin of " + (/^(8|11|18|8\d)$/.test(String(e.age)) ? "an " : "a ") + e.age + "-year-old, not older.");
  return s;
}
function sdOutfit() {
  if (!nv())
    return (
      t6(nR()) +
      ". The outfit is identical in all four views. " +
      nx() +
      (/\s$/.test(nx()) || !nx() ? "" : " ") +
      (sdFreeText()
        ? "Dressed in exactly this outfit in every panel, with nothing added or left out; the body shapes above read through the fit of the clothes."
        : "Fully dressed in this outfit in every panel; the body shapes above read through the fit of the clothes.")
    );
  if (!nw())
    return "Outfit, the same in every view: " + sdHeadOutfit() + ". Opaque, plain, no logos.";
  var c = sdCov(),
    top =
      "a loose, boxy cobalt-blue sleeveless cropped top with a scoop neckline and narrow armholes, thick opaque " +
      ("short" === c ? "cotton" : "swim") +
      " jersey, no padding, resting on " +
      (e.chest >= 1 ? "the bust" : "the chest") +
      " without lifting it, its front hem exactly at the lowest point of " +
      (e.chest >= 1 ? "the breasts" : "the chest") +
      ", the whole abdomen bare below it",
    sdTri =
      "a cobalt-blue halter bikini top: two large, soft, fully lined triangles that " +
      ("low" === e.bustShape
        ? "cover each breast down to the ribs and hang with it"
        : "conical" === e.bustShape
          ? "cover each breast and follow its long, forward-projecting shape"
          : "fully cover each breast and follow its natural shape") +
      ", no padding, no underwire, a thin tie behind the neck and one across the back; the abdomen bare below the triangles",
    o;
  o =
    "m" === e.pres
      ? "short" === c
        ? "shirtless; cobalt-blue fitted compression shorts ending at the upper thigh, in thin stretch fabric that fits like an adult athlete's: the front naturally filled, in proportion to his adult build, neither flattened nor padded nor exaggerated; plain white training shoes"
        : "brief" === c
          ? "shirtless; cobalt-blue classic swim briefs with moderate sides, in thin stretch fabric that fits like an adult competitive swimmer's: the front naturally filled, in proportion to his adult build, neither flattened nor padded nor exaggerated; barefoot"
        : "shirtless; cobalt-blue square-cut swim trunks ending at the upper thigh, in thin stretch fabric that fits like an adult competitive swimmer's: the front naturally filled, in proportion to his adult build, neither flattened nor padded nor exaggerated; barefoot"
      : np()
        ? "a cobalt-blue racerback one-piece competition swimsuit with a modest leg cut" +
          (nb() ? " and an unstructured front that follows the natural shape of the bust" : "") +
          "; barefoot"
        : "sport" === c && e.chest >= 4
            ? sdLooseTop() + "; fitted cobalt-blue bike shorts in thin stretch fabric, ending at mid-thigh, the stretch fabric following the shape of the hips and glutes without flattening them; barefoot"
        : "sport" === c || "fitted" === c
            ? "a fitted cobalt-blue sleeveless cropped top in " + sdTopCloth() + ", with " + sdTopNeck() + " and armholes that hug the shoulder joints; it covers the whole chest" +
              (e.chest >= 2 ? sdTopFollow() : "") +
              sdLining() + ", its plain hem ends just above the navel; seen from behind, the same top covers the upper back; fitted cobalt-blue bike shorts in thin stretch fabric, ending at mid-thigh, the stretch fabric following the shape of the hips and glutes without flattening them; barefoot"
        : "tanga" === c && e.chest >= 4
            ? sdLooseTop() + "; a cobalt-blue Brazilian-cut tanga bottom, high-cut legs, thin sides, covering about half of the glutes; barefoot"
        : "tanga" === c
            ? sdTri +
              "; a cobalt-blue Brazilian-cut tanga bottom, high-cut legs, thin sides, covering about half of the glutes; barefoot"
            : "swim" === c
              ? top + "; cobalt-blue fitted swim shorts ending at the upper thigh; barefoot"
              : top + "; cobalt-blue fitted compression shorts ending at the upper thigh; plain white training shoes";
  return (
    "Outfit, the same in every view: " + o + ". Opaque, no logos."
  );
}
function sdKg() {
  var bmi = ([17.5, 19, 23, 27, 36][e.fat] || 23) + ([0, 0, 0.5, 1.5, 3][e.muscle] || 0),
    h = (e.height || 170) / 100;
  return Math.round(bmi * h * h);
}
/* the operation is explicit data: editing the text never changes it (a precision keeps the two images);
   leaving a preset is the "Retouche libre" chip; a two-image preset whose text no longer names image 2 gets a warning */
function sdIterOpEff(t) {
  return String(t.sdIter || "").trim() ? t.sdIterOp || "" : "";
}
function sdIterMismatch(t) {
  var op = sdIterOpEff(t);
  return ("join" === op || "heads" === op) && !/image 2/i.test(String(t.sdIter || ""));
}
function sdIterText() {
  if ("join" === sdIterOpEff(e)) return String(e.sdIter || "").trim();
  var c = (String(e.sdIter || "").trim() || ("dressMine" === e.sdIterOp ? sdPresetDressMine() : "")).replace(/[.\s]+$/, ""),
    /* accents folded so the French words below match: \b only knows ASCII letters */
    lc = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    w = sdWho(),
    keep = [
      [/\b(views?|fram\w*|scale|panels?|vues?|cadr\w*|echelle|panneaux?)\b/, "the four views, the framing and scale"],
      [/\b(size|weight|proportions?|height|taller|shorter|slimmer|thinner|fatter|heavier|waist|narrower|wider|broader|bigger|smaller|larger|fuller|rounder|curv(?:y|ier|aceous)|plump(?:er)?|leaner|skinnier|bulkier|bulk up|chubb(?:y|ier)|taille|poids|hauteur|a?minc\w*|maigr\w*|gros|gross\w*|lourd\w*|elarg\w*|etroit\w*|affin\w*|plus larges?|plus grande?s?|plus petite?s?)\b/, "the body's size, weight and proportions"],
      [/\b(breasts?|bust|chest|torso|nipples?|seins?|poitrine|buste|mamelons?|tetons?|torse|pectoraux)\b/, "m" === e.pres ? "the chest" : "the bust's size, shape and hang"],
      [/\b(glutes?|butt\w*|crease|fesses?|fessiers?|sillon)\b/, "the glutes"],
      [/\b(hips?|thighs?|legs?|saddlebags?|knees?|calf|calves|hanches?|bassin|cuisses?|jambes?|culotte de cheval|genoux?|mollets?)\b/, "the hips and legs"],
      [/\b(arms?|shoulders?|back|abs|abdom\w*|bell(?:y|ies)|stomachs?|tumm(?:y|ies)|midriffs?|veins?|biceps|triceps|forearms?|bras|epaules?|dos|muscu?l\w*|abdos?|ventre|veines?|pectoraux)\b/, "the muscles"],
      [/\b(skin|tan|cellulite|pores?|freckles?|marks?|scars?|peau|bronz\w*|taches?|rousseur|grains? de beaute|cicatrices?|vergetures?|(les|des|ses|ces|une|la|sa) marques?|marques? (de|des|du|d))\b/, "the skin"],
      [/\b(outfit|bikini|top|tanga|fabric|triangles?|swim\w*|shorts|clothing|clothes|dress\w*|t-?shirts?|shirts?|leggings?|pants|trousers|jeans|skirts?|jackets?|shoes|sneakers|boots|wear\w*|socks?|tenues?|maillots?|tissus?|vetements?|habill\w*|robes?|chemises?|pantalons?|jupes?|vestes?|chaussures?|baskets?|bottes?|chaussettes?|brassieres?)\b/, "the outfit"],
      [/\b(light\w*|shadows?|lumieres?|eclairages?|eclairee?s?|eclairer|ombres?)\b/, "the light"],
      [/\b(backdrop|background|grey|gray|fond|arriere[- ]plan|grise?)\b/, "the backdrop"],
      [nw() ? /^$/ : /\b(face|faces|hair|head|heads|eyes|nose|mouth|expression|visages?|cheveux|coiffure|tetes?|yeux|nez|bouche)\b/, nw() ? "" : sdPos() + " face and hair"],
    ]
      .filter(function (k) {
        return k[1] && !k[0].test(lc);
      })
      .map(function (k) {
        return k[1];
      });
  /* "Habiller avec ma tenue" (live text): the outfit words ("lightly worn", "every view") must not drop the views, the light or the face from what is kept */
  "dressMine" === e.sdIterOp &&
    !String(e.sdIter || "").trim() &&
    (keep = ["the four views, the framing and scale", "the muscles", "the skin", "the light", "the backdrop"].concat(nw() ? [] : [sdPos() + " face and hair"]));
  return (
    "Edit image 1, the approved body reference sheet of this " +
    w +
    ".\nPurpose: a neutral anatomy and costume-fitting reference for a film's VFX team.\nChange only this: " +
    c +
    ".\nKeep everything this change does not touch exactly as in image 1" +
    (keep.length ? ": " + sdList(keep) : "") +
    "; nothing else grows, shrinks, lifts or slims. " +
    ("dressMine" === e.sdIterOp && !String(e.sdIter || "").trim()
      ? rq(Object.assign({}, e, { bodyRef: !1 }), function () {
          return sdFreeNoText("No text or watermark.");
        })
      : "No text or watermark.")
  );
}
/* v94: lettering asked in the person's marks field (a tattoo reading a word, a name, a date): the general "No text" would forbid it */
function sdLetters() {
  return "person" === e.mode && /["\u201c\u201d\u00ab\u00bb]|\b(reading|reads|says|saying|spell\w*|letter\w*|words?|text|inscri\w*|initials|names?|dates?|numbers?|digits?|lettres?|mots?|texte|prénoms?|initiales|chiffres?|nombres?)\b|écrit/i.test(String(e.marks || ""));
}
var SD_LETTERS = "No captions, labels, panel numbers or watermark added to the image; the only lettering is the one the marks above describe.";
/* clothing: the ending of a person whose clothing is taken from the source photo, whose own logos and prints stay */
function sdNoTextGpt(d, clothing) {
  return sdFreeNoText(sdLetters()
    ? "No captions, labels, panel numbers, watermarks or logos added to the image; the only lettering is the one the marks above describe" +
        (clothing ? ", besides any logo or print on the clothing taken from the photo" : "") +
        "."
    : d);
}
/* v101 "Front" (forehead height): the chosen value replaces the random forehead of the face; Auto keeps the random draw.
   With a fringe the forehead is mostly hidden, so the prompt says so instead of asking for a visible forehead. */
function sdForehead() {
  if (!e.forehead || "auto" === e.forehead || "person" !== e.mode) return "";
  var t = t1("forehead", e.forehead);
  return t ? t + ("fringe" === e.hairStyleSel ? ", mostly covered by the fringe" : "") : "";
}
/* random hairline / forehead details that would contradict the chosen forehead */
/* v110: with a receding hairline, the drawn hairline trait is left out (the draw is kept, so the other drawn traits do not move) */
function sdPushHairline(a, x) {
  return "receding" === e.hairStyleSel && "a high forehead" !== x ? 0 : a.push(x);
}
function sdHairlineFix(x) {
  if (!e.forehead || "auto" === e.forehead) return x;
  if ("a high forehead" === x) return "a rounded hairline";
  if ("a low hairline" === x && "high" === e.forehead) return "a rounded hairline";
  return x;
}
/* v103: an animal's own head shape, drawn from faceSeed (new seed with "Autre tête", "Animal au hasard" or "Nouvel animal"), so two animals with the same settings are two individuals.
   Shape only, relative to its breed or kind: coat, eyes color, ears and marks stay the user's. None while faceSeed is 0 (older animals keep their prompt) or with a photo. Both engines use the body-first animal flow. */
function sdAnimalHead() {
  if (!e.faceSeed || e.photo || "animal" !== e.mode) return "";
  var t = (0x2545f491 ^ e.faceSeed) >>> 0,
    n = function () {
      var x = (t = (t + 0x6d2b79f5) >>> 0);
      return (
        (x = Math.imul(x ^ (x >>> 15), 1 | x)),
        (((x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ (x >>> 14)) >>> 0) / 0x100000000
      );
    },
    r = function (a) {
      return a[Math.floor(n() * a.length)];
    },
    S = {
      quad: [
        ["a broad skull", "a narrow skull"],
        ["a short, broad muzzle", "a short, narrow muzzle", "a long, broad muzzle", "a long, narrow muzzle", "a muzzle of medium length and width"],
        ["wide-set eyes", "close-set eyes"],
        ["round eyes", "almond-shaped eyes"],
        ["a heavy, prominent brow", "a flat, smooth brow"],
        ["full, heavy cheeks", "lean, flat cheeks"],
      ],
      bird: [
        ["a rounded crown", "a flat crown"],
        ["a short, stout beak", "a long, slender beak", "a beak of medium length"],
        ["large eyes", "small eyes"],
        ["a thick neck", "a slender neck"],
      ],
      fish: [
        ["a blunt, rounded snout", "a pointed snout"],
        ["large eyes", "small eyes"],
        ["a deep, high head", "a low, streamlined head"],
        ["a wide mouth", "a small mouth"],
      ],
      snake: [
        ["a broad head", "a narrow head"],
        ["a blunt snout", "a pointed snout"],
        ["large eyes", "small eyes"],
      ],
      other: [
        ["a broad head", "a narrow head"],
        ["large eyes", "small eyes"],
        ["wide-set eyes", "close-set eyes"],
      ],
    },
    k = (S[e.abody] || S.other).map(r),
    w = t5(e.breed) ? "breed" : "kind";
  return (
    "Head shape, this animal's own and kept exactly in every panel, compared with others of its " + w + ": " + k.join(", ") +
    ". This is what makes it recognizable: do not average it toward a typical example of its " + w + "."
  );
}
/* v114 (UI audit): "Assembler", "Habiller" and "Ajouter les têtes" start from a headless body sheet, so card 3 offers them only with "Planche corps
   sans tête"; "Habiller avec ma tenue" and "Retouche libre" always. A saved choice that is not offered any more counts as a free retouche of its text,
   in the card, the bar, the copy message and the prompt alike (sdIterNorm, also applied in sdG). */
function sdHlRaw(t) {
  return "person" === t.mode && !t.child && !!t.headless && (!!(t.photo && t.photoOnly) || !(t.photo && t.bodyAsIs));
}
function sdOpOk(t, op) {
  return "join" === op || "dress" === op || "heads" === op ? sdHlRaw(t) : !0;
}
function sdIterNorm(t) {
  var op = t.sdIterOp;
  if (!op || "free" === op) return t;
  /* a value no version wrote (corrupted or edited by hand): its text as a free retouche */
  if (!SD_OPS.some(function (o) {
    return o[0] === op;
  }))
    return Object.assign({}, t, { sdIterOp: "free" });
  if (sdOpOk(t, op)) return t;
  /* "Assembler" and "Ajouter les têtes" need the headless body and the head sheet: without "sans tête", nothing chosen (the saved text comes back
     with "sans tête"); "Habiller" is a one-image edit: its text stays, as a free retouche */
  return "dress" === op ? Object.assign({}, t, { sdIterOp: "free" }) : Object.assign({}, t, { sdIterOp: "", sdIter: "" });
}
var SD_OPS = [
  ["join", "Assembler tête et corps", "Assembler"],
  ["dress", "Habiller", "Habiller"],
  ["dressMine", "Habiller avec ma tenue", "Ma tenue"],
  ["heads", "Ajouter les têtes", "Têtes"],
  ["free", "Retouche libre", "Retouche"],
];
var sdIterOpen = null;
function sdOp(t) {
  t = sdIterNorm(t);
  return "free" === t.sdIterOp ? "" : String(t.sdIter || "").trim() ? sdIterOpEff(t) : "dressMine" === t.sdIterOp ? "dressMine" : sdHlRaw(t) ? "join" : "";
}
/* the free retouche is the active one: chosen, or a text typed with no preset */
function sdFreeIter(t) {
  t = sdIterNorm(t);
  return "free" === t.sdIterOp || ("" === sdOp(t) && !!String(t.sdIter || "").trim());
}
function sdIterOff(t) {
  t = sdIterNorm(t);
  return !String(t.sdIter || "").trim() && "dressMine" !== t.sdIterOp && (!sdHlRaw(t) || "free" === t.sdIterOp);
}
function sdIterTitle(t) {
  var op = sdOp(t);
  return op
    ? SD_OPS.filter(function (o) {
        return o[0] === op;
      })[0][1]
    : sdFreeIter(t)
      ? "Retouche libre"
      : "Retouche (facultatif)";
}
function sdIterBlock(t, g, B, L) {
  sdCur = { t: t, g: g, L: L };
  return B("iter", "3", sdIterTitle(t), sdIterOff(t), "Choisis ou écris une retouche ci-dessous.");
}
function sdBarItems(t) {
  t = sdIterNorm(t);
  var op = "free" === t.sdIterOp && !String(t.sdIter || "").trim() ? "" : String(t.sdIter || "").trim() ? sdIterOpEff(t) : "dressMine" === t.sdIterOp ? "dressMine" : "join";
  if (sdChild(t))
    return [
      ["head", "Tête", !1],
      ["body", "Corps", !1],
    ];
  /* with a body sheet with its head, card 3 is optional: in the bar only once a retouche is set */
  var lab = (SD_OPS.filter(function (o) {
      return o[0] === (op || (sdFreeIter(t) ? "free" : ""));
    })[0] || [0, 0, "Retouche"])[2],
    it = ["iter", lab, sdIterOff(t)];
  return [["head", "Tête", !1], ["body", "Corps", !1]].concat(sdHlRaw(t) || !sdIterOff(t) ? [it] : []);
}
/* options shown inside a card, folded: what you rarely need stays out of the way */
function sdFold(label, children, open, onToggle) {
  return (0, l.jsxs)("details", {
    className: "mt-3 rounded-xl bg-muted px-3 py-2 text-sm",
    open: !!open,
    onToggle: onToggle,
    children: [(0, l.jsx)("summary", { className: "cursor-pointer font-semibold", children: label }), (0, l.jsx)("div", { className: "mt-2 grid gap-3", children: children })],
  });
}
function sdCardExtra(k) {
  /* the body and retouch options are a person's; e is the state being rendered, sdCur may be an earlier person's */
  if (!sdCur || "person" !== e.mode) return null;
  var t = sdCur.t,
    g = sdCur.g,
    L = sdCur.L,
    useImg = nv() && !nw() && !1 !== t.sdBodyImg;
  if ("body-pre" === k)
    return nv() && !nw()
      ? (0, l.jsxs)("div", {
          className: "mt-3",
          children: [
            (0, l.jsx)("p", { className: "mb-2 text-sm font-semibold", children: "Le corps vient de" }),
            (0, l.jsx)(ab, {
              label: "Source du corps",
              value: useImg ? "img" : "text",
              onChange: (v) => g("sdBodyImg", "img" === v),
              options: [
                ["img", "Ma planche habillée (retouche « Habiller »)"],
                ["text", "Mes réglages"],
              ],
            }),
          ],
        })
      : null;
  if ("body" === k && sdChild(t)) return [sdHeadWarn(t, "body")];
  if ("body" === k)
    return [
      sdHeadWarn(t, "body"),
      nw() &&
        (0, l.jsx)("p", { className: "mt-3 text-sm text-muted-foreground", children: "Recommence jusqu'à ce que le corps te convienne." }, "again"),
      /* v114: not offered when the body comes from the dressed sheet (it would have no effect) */
      !useImg &&
      (0, l.jsx)(
        "div",
        {
          children: sdFold("m" === t.pres ? "Option : forme des pectoraux imposée par une image" : "Option : forme de poitrine imposée par une image", [
            (0, l.jsxs)(
              "label",
              {
                className: "flex items-start gap-2",
                children: [
                  (0, l.jsx)("input", { type: "checkbox", className: "mt-1", checked: !!t.sdShapeRef, onChange: (ev) => g("sdShapeRef", ev.target.checked) }),
                  (0, l.jsx)("span", {
                    children: t.sdShapeRef
                      ? nw()
                        ? "Joins aussi ton image guide (image 1)."
                        : useImg
                          ? "Inutile ici : le corps vient de ta planche habillée."
                          : "Joins aussi ton image guide (image 2)."
                      : "J'ajoute un croquis ou une photo qui montre la forme voulue.",
                  }),
                ],
              },
              "cb",
            ),
          ], t.sdShapeRef),
        },
        "guide",
      ),
    ];
  if ("iter" === k) {
    var op = sdOp(t),
      fr = sdFreeIter(t),
      tn = sdIterNorm(t),
      pre = { join: sdPresetJoin(), dress: sdPresetDress(), heads: sdPresetHeads(), dressMine: "" };
    return [
      sdHeadWarn(t, "iter"),
      (0, l.jsx)(
        "div",
        {
          children: sdFold(
            "Choisir la retouche",
            [
              (0, l.jsx)(
                "div",
                {
                  className: "flex flex-wrap gap-2",
                  children: SD_OPS.filter(function (b) {
                    return sdOpOk(t, b[0]);
                  }).map(function (b) {
                    var on = "free" === b[0] ? fr : op === b[0],
                      picked = on && (!!String(tn.sdIter || "").trim() || "dressMine" === b[0]),
                      left = !!String(tn.sdIter || "").trim() && tn.sdIter === t.sdIterPre;
                    /* Leaving a preset keeps personal edits, including after its generated text changes. */
                    return (0, l.jsxs)(
                      "button",
                      {
                        type: "button",
                        "aria-pressed": on,
                        onClick: () => ((sdIterOpen = !0), "free" === b[0] ? (left && g("sdIter", ""), g("sdIterOp", "free")) : (g("sdIter", picked ? "" : pre[b[0]]), g("sdIterOp", picked ? "" : b[0]), g("sdIterPre", picked ? "" : pre[b[0]]))),
                        className:
                          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold cursor-pointer select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                          (on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-foreground/40"),
                        children: [on ? (0, l.jsx)(tB, { size: 14 }) : null, b[1]],
                      },
                      b[0],
                    );
                  }),
                },
                "chips",
              ),
              (0, l.jsx)(
                "p",
                {
                  className: "text-muted-foreground",
                  children: sdIterMismatch(t)
                    ? sdT(
                        "Ton texte ne mentionne plus l'image 2 : si tu ne fais plus cette opération, choisis « Retouche libre ».",
                        "Your text no longer mentions image 2: if you are no longer doing this operation, choose “Free retouch”.",
                      )
                    : /* what the text below is for: written by the user, ready from a preset, or not needed yet
                         (a headless body's default "join" builds its prompt from the preset while the text is empty) */
                      [
                        "dress" === op
                          ? "m" === t.pres ? "Même corps, avec un haut de sport sans manches et un collant de course." : "Même corps, avec un haut court et un legging."
                          : "dressMine" === op
                            ? (t.bodyRef
                              ? sdT("Même corps, habillé avec la tenue de l'onglet Tenue (rien de coché : une tenue simple de tous les jours).", "Same body, dressed in the outfit of the Outfit tab (nothing ticked: a simple everyday outfit).")
                              : sdT("Pour changer la tenue d'un corps déjà validé : change l'onglet Tenue.", "To change the outfit of a body you already approved: change the Outfit tab.")) +
                              sdT(" Joins ta planche corps validée, sans tête ou déjà assemblée avec la tête. Le texte suit l'onglet Tenue : tu le vois dans « Détails et prompt ».", " Add your approved body sheet, headless or already combined with the head. The text follows the Outfit tab: you can see it in “Details and prompt”.") +
                              (nw() ? sdT(" Tant que « Planche corps sans tête » est coché, les accessoires de tête (chapeau, lunettes) ne sont pas ajoutés.", " While “Headless body sheet” is ticked, head accessories (hat, glasses) are not added.") : "")
                          : "heads" === op
                            ? "Agrandis d'abord ta planche habillée de 25 % vers le haut, fond gris."
                            : "join" === op
                              ? "Le corps est gardé, la tête est ajoutée."
                              : sdT(
                                  "Écris ce qu'il faut changer sur ta planche (image 1), en français ou en anglais. Le prompt reprend ce texte et garde tout le reste identique : rien d'autre à ajouter, puis clique sur « Copier pour Seedream 5.0 ».",
                                  "Write what to change on your sheet (image 1), in English or French. The prompt uses this text and keeps everything else the same: nothing else to add, then click “Copy for Seedream 5.0”.",
                                ),
                        op && " ",
                        op &&
                          (String(t.sdIter || "").trim()
                            ? sdT(
                                "Le texte ci-dessous est prêt et déjà dans le prompt : rien à ajouter, modifie-le seulement si tu veux changer la retouche.",
                                "The text below is ready and already in the prompt: nothing to add; edit it only if you want a different retouch.",
                              )
                            : sdT("Le prompt est déjà prêt : la case peut rester vide.", "The prompt is already complete: the box can stay empty.")),
                      ],
                },
                "hint",
              ),
              (0, l.jsx)(
                "textarea",
                {
                  id: "sd-iter",
                  className: L + " min-h-[88px] resize-y",
                  placeholder: sdT("ex. biceps et triceps plus dessinés", "e.g. sharper biceps and triceps"),
                  value: tn.sdIter || "",
                  onChange: (ev) => {
                    var v = ev.target.value,
                      op2 = tn.sdIterOp || "";
                    /* an edited preset stays that retouche, its text copied as written (v113); emptied, a preset is unset, while the free retouche and
                       "Habiller avec ma tenue" stay; typing saves the normalized retouche, so the text is not lost */
                    v.trim() || "free" === op2 || "dressMine" === op2 || (op2 = "");
                    g("sdIter", v);
                    op2 !== (t.sdIterOp || "") && g("sdIterOp", op2);
                  },
                },
                "ta",
              ),
            ],
            "" === op || !!sdIterOpen,
            (ev) => (sdIterOpen = ev.currentTarget.open),
          ),
        },
        "more",
      ),
    ];
  }
  return null;
}
/* Seedream card: the image(s) to add, the copy button, then everything else folded */
function sdCard({ k: e, n: t, title: n, rows: r, text: a, disabled: o, disabledHint: i, dest: D, onCopy: u, copied: c, open: d, setOpen: h }) {
  var f = (0, s.useRef)(null),
    join = r && r[0] ? r[0][1] : null,
    rest = (r || []).slice(1);
  (0, s.useEffect)(() => {
    if (d && f.current && "1" === f.current.dataset.select) {
      var rg = document.createRange();
      rg.selectNodeContents(f.current);
      var sel = window.getSelection();
      sel && (sel.removeAllRanges(), sel.addRange(rg));
      f.current.dataset.select = "0";
    }
  }, [d]);
  return (0, l.jsxs)("div", {
    id: "sd-card-" + e,
    className: "rounded-2xl border bg-card p-4",
    children: [
      (0, l.jsxs)("div", {
        className: "flex items-center gap-3",
        children: [
          (0, l.jsx)("span", {
            className: "grid h-9 w-9 flex-none place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground",
            children: t,
          }),
          (0, l.jsx)("h3", { className: "text-lg font-bold leading-tight", children: "body" === e && (nw() || sdChildHlNow()) ? sdT("Planche corps sans tête", "Headless body sheet") : n }),
        ],
      }),
      sdCardExtra(e + "-pre"),
      join &&
        (0, l.jsxs)("div", {
          className: "mt-3 rounded-xl border px-3 py-2",
          children: [
            (0, l.jsx)("p", { className: "text-sm text-muted-foreground", children: "À joindre dans Seedream" }),
            "string" == typeof join && /^1 ?: .+\. 2 ?: /.test(sdTr(join))
              ? (0, l.jsx)("ol", {
                  className: "text-base font-semibold",
                  style: { listStyle: "none", padding: 0, margin: 0 },
                  children: sdTr(join)
                    .replace(/\.$/, "")
                    .split(/\. (?=2 ?: )/)
                    .map(function (x, i) {
                      return (0, l.jsx)("li", { children: x.replace(/^(\d) ?: /, "$1. ") }, i);
                    }),
                })
              : (0, l.jsx)("p", { className: "text-base font-semibold", children: join }),
          ],
        }),
      (0, l.jsxs)("button", {
        type: "button",
        disabled: o,
        onClick: u,
        className:
          "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-40 " +
          (c ? "bg-[hsl(var(--ok))] text-white" : "tape-chip hover:brightness-105"),
        children: [c ? (0, l.jsx)(tB, { size: 18 }) : (0, l.jsx)(tV, { size: 18 }), c ? "Copié" : D ? sdT("Copier pour ", "Copy for ") + D : "Copier le prompt"],
      }),
      o && i && (0, l.jsx)("p", { className: "mt-2 text-center text-sm text-muted-foreground", children: i }),
      !o && sdWords(a) > 600 && (0, l.jsx)("p", { className: "mt-2 text-sm font-semibold text-destructive", children: sdT(sdNum(sdWords(a)) + " mots : plus de 600, le modèle risque d'en ignorer une partie.", sdNum(sdWords(a)) + " words: over 600, the model may skip some of it.") }),
      sdCardExtra(e),
      (0, l.jsxs)("details", {
        className: "mt-3 text-sm",
        open: !!d,
        onToggle: (ev) => (ev.currentTarget.open !== !!d ? h(ev.currentTarget.open) : null),
        children: [
          (0, l.jsx)("summary", { className: "cursor-pointer font-semibold text-muted-foreground", children: "Détails et prompt" }),
          (0, l.jsx)("dl", {
            className: "mt-2 grid gap-1.5",
            children: rest.map(function (x) {
              return (0, l.jsxs)(
                "div",
                {
                  className: "grid grid-cols-[5.5rem_1fr] gap-2",
                  children: [(0, l.jsx)("dt", { className: "text-muted-foreground", children: x[0] }), (0, l.jsx)("dd", { className: "min-w-0 break-words", children: x[1] })],
                },
                x[0],
              );
            }),
          }),
          (0, l.jsx)("pre", {
            ref: f,
            "data-out": e,
            className: "prompt-box mono mt-2 max-h-[40vh] overflow-auto rounded-xl bg-muted p-3 text-[12px] leading-relaxed",
            lang: "en",
            children: a,
          }),
        ],
      }),
    ],
  });
}
function sdBody() {
  var hl = nw(),
    w = sdWho(),
    s =
      "Unretouched studio photograph, 16:9, four equal vertical panels with thin grey gaps: a " +
      (hl ? "body" : "full-body") +
      " reference turnaround of one " +
      w +
      ", same " +
      (hl ? "body" : "person") +
      " in every panel. Left to right: front; left side, facing the left edge; back; right side, facing the right edge; the two profiles face opposite ways.\n";
  s += hl
    ? "Each panel's top edge sits at the collarbones: no chin or face. Feet included, same scale and floor line in every panel.\n"
    : "Whole figure in every panel, hair to feet, same scale and floor line.\nImage 1 is this " +
      w +
      "'s head reference sheet: copy face, hair and skin tone exactly; ignore its layout and clothing.\n" +
      (sdUseBodyImg()
        ? "Image 2 is " + sdPos() + " approved body reference sheet, already in this outfit: copy the body and outfit exactly from it, its proportions, " + ("m" === e.pres ? "chest" : "bust size and hang") + ", waist, hips, glutes and legs; where this text and image 2 differ, follow image 2.\n"
        : "") +
      "Hair exactly as in image 1: " + ne() + ("loose" === (e.hairStyleSel || "loose") && "shaved" !== e.hairLen ? ", worn down, never tied up" : "") + ", the same in every panel.\n";
  var sf = [],
    hd = [];
  "m" !== e.pres && e.chest >= 3 && "low" === e.bustShape && sf.push("bust");
  ["low", "flat"].indexOf(e.glutesShape) >= 0 && sf.push("glutes");
  (rM() || rj()) && sf.push("hips", "thighs");
  [["defArms", "arms"], ["defShoulders", "shoulders"], ["defBack", "back"]].forEach(function (z) {
    var v = rP(z[0]);
    ("clear" === v || "strong" === v) && hd.push(z[1]);
  });
  e.sdShapeRef &&
    (hl || !sdUseBodyImg()) &&
    (s +=
      "Image " +
      (hl ? "1" : "2") +
      " is a shape guide only: copy from it only the " +
      ("m" === e.pres ? "chest" : "bust") +
      ": its shape, its profile and its size relative to the torso; ignore everything else in it: its person, body size, face, skin, clothing, framing and style. Where the guide and this text differ on that shape, follow the guide.\n");
  (hd.length && hl) ||
    (s += "Purpose: a neutral " + (nv() ? "anatomy and costume-fitting" : "costume and character") + " reference for a film's VFX team.\n");
  var ni =
    rw().length || ("m" !== e.pres && "low" === e.bustShape) || "low" === e.glutesShape
      ? " A real, " + (e.fat <= 1 ? "slim " : "ordinary ") +
        ("m" === e.pres ? "man's" : "woman's") +
        " body, deliberately imperfect" +
        (e.muscle <= 2 ? ", not a fitness model" : "") +
        (sf.length && hd.length
          ? ": soft, heavy " + sdList(sf) + ", with " + (1 === hd.length && "back" === hd[0] ? "a " : "") + "sharply defined " + sdList(hd) + "."
          : ", not a 3D character.")
      : "";
  s += "\n" + t6(rS()) + ", " + e.height + " cm, about " + sdKg() + " kg" + rb() + "." + ni + " " + sdLegs(hl) + "\n\u0001";
  var sil = [
    t1("shoulders", e.shoulders),
    "m" === e.pres
      ? rx()
      : ["a very narrow waist", "a narrow waist", "a natural, average waist", "a wide waist, little waistline", "a very wide waist, no waistline"][e.waist] || rx(),
    rk(),
    e.shoulders < e.hips
      ? "the hips clearly wider than the shoulders"
      : e.shoulders > e.hips
        ? "the shoulders wider than the hips"
        : "shoulders and hips about the same width",
  ];
  "m" !== e.pres &&
    2 === e.shoulders &&
    2 === e.waist &&
    2 === e.hips &&
    (sil = ["average shoulders, waist and hips, the shoulders as wide as the hips"]);
  "m" === e.pres && sil.push("male bone structure and fat distribution, with no feminine curves");
  var gl =
      t1("glutes", e.glutes) +
      ((!hl
        ? { flat: ", flat in profile", round: ", round in profile", high: ", high and round", shelf: ", very high and round", low: ", low and soft, never round or lifted" }
        : {
        flat: ", flat in profile",
        round: ", round in profile",
        high: ", high and round in profile",
        shelf: ", very high and very round, projecting strongly in profile",
        low: ", low, saggy, heavy and deliberately unflattering: in profile the upper half is flat and slopes down from the lower back, most volume in the lower third, fullest just above the crease, never halfway; from behind they look long, wider at the bottom, the soft lower part folding in a heavy roll over a long, deep crease across the whole back of each thigh; never round, lifted, high or bubble-shaped",
      })[e.glutesShape] || ""),
    lo = [gl, t1("thighs", e.thighs)];
  rj() && lo.push(t1("fatLower", e.fatLower));
  rM() &&
    lo.push(
      {
        light: "a slight fullness on the outer upper thighs",
        visible: "visible saddlebags: a soft bulge on each outer upper thigh, a hand's width below the hip bone, with a slight dip above it",
        marked: "marked saddlebags: a soft bulge on each outer upper thigh, a hand's width below the hip bone, as wide as the hips, with a dip above it",
      }[e.saddle] || "",
    );
  e.thighs <= 2 &&
    !rj() &&
    (e.hips >= 3 || e.glutes >= 3 || "high" === e.glutesShape || "shelf" === e.glutesShape || rM()) &&
    lo.push("the extra width stays in the hips and glutes, the thighs taper to the knees");
  var bd = n_();
  ni && (bd = bd.replace(/, fit and athletic build/, " build, moderately toned").replace(/athletic/g, "toned"));
  e.fat <= 1 && (bd = bd.replace(/like a swimmer or a dancer/, "like a dancer"));
  s +=
    t6(bd) +
    ": " +
    sil.join(", ") +
    ". " +
    (e.fat <= 1 ? ("m" !== e.pres && (e.chest > 2 || (!hl && e.chest >= 2)) ? "Apart from the bust, a slim frame" : "A slim frame") + ": " + (function (a, l) {
      return a && l ? "slender arms and legs, " : a ? "slender arms, " : l ? "slender legs, " : "";
    })(
      ["big", "huge"].indexOf(e.biceps) < 0 && ("auto" !== e.biceps || e.muscle <= 2),
      e.thighs <= 2 && e.fatLower <= 1 && ("none" === e.saddle || "light" === e.saddle) && e.muscle <= 2,
    ) + "visible collarbones" + (nw() || !nv() ? " and hip bones" : "") + (0 === e.fat ? sdRibs() : "") + (e.fatLower <= 1 && ("none" === e.saddle || "light" === e.saddle) ? ", no extra padding" : "") + ". " : 2 === e.fat && e.muscle <= 2 ? "A normal, healthy layer of soft body fat: no visible ribs or hip bones, a slight softness at the sides of the waist and on the upper arms. " : 4 === e.fat ? sdForteFat() + ". " : "") +
    t6(
      hl
        ? sdBust()
        : !sdUseBodyImg() && "m" !== e.pres && e.chest >= 1
          ? sdBust()
              .replace(/,? (the )?nipples pointing[^,;.]*/g, "")
              .replace("in profile they hang down rather than out", "in profile it hangs down rather than out")
              .replace("the left one a little lower", "the left side a little lower")
        : "m" === e.pres
          ? t1("pecs", e.chest)
          : (["a flat chest", "a small bust", "a medium bust", "a fairly full bust", "a large bust", "a very large bust, out of proportion with her frame"][sdCi(e.chest)] || "a medium bust") +
            ("low" === e.bustShape && e.chest >= 2
              ? ", heavy and low under the thin shirt: the fabric falls straight from a flat upper chest and rests on the bust, its lowest point at the lower ribs; never lifted, round or high"
              : ""),
    ) +
    ". " +
    t6(
      (function (g) {
        (e.fat <= 1 || e.glutes <= 1) && (g = g.replace(", saggy, heavy and", ", saggy and"));
        e.glutes <= 1 && (g = g.replace("in a heavy roll", "in a soft roll"));
        return g;
      })(lo.filter(Boolean).join("; ")),
    ) +
    ".\n";
  s += sdMus() + "\n";
  var dt = sdDetails();
  dt && (s += dt + "\n");
  s += "\n" + sdSkinBody() + "\n";
  var mk = rg(!1);
  mk && (s += "Distinctive marks, each on the stated side, only where the skin is uncovered: " + mk + ".\n");
  rl() && (s += "Current state, on the stated side, in every view where it faces the camera: " + rl() + ".\n");
  s += "\n" + sdOutfit() + "\n\n";
  s +=
    "Neutral standing pose, feet hip-width apart, arms relaxed slightly away from the body, hands visible" +
    ("low" === e.glutesShape ? ", pelvis slightly tucked, lower back flat" : "") +
    ("m" !== e.pres && "conical" === e.bustShape && e.chest >= 2 ? "; in the side views the arms hang straight down behind the bust, fully separate from it" : "") +
    (hl ? "." : ", neutral expression.") +
    "\n\n";
  var d = rA().some(function (k) {
    return "none" !== rP(k);
  });
  s +=
    "Seamless mid-grey backdrop. " +
    (n0()
      ? "Key light from above and to the side, weak fill: " +
        (sdNoBulk() &&
        sdSoft() &&
        !rA().some(function (k) {
          return "strong" === rP(k);
        }) /* a lean body: the hard light is for the veins alone */
          ? "crisp shadows that bring out the veins; the muscles stay smooth"
          : "crisp shadows on the muscles" + (["visible", "strong"].indexOf(rD()) >= 0 ? " and veins" : ""))
      : d || nv()
        ? "Soft key light from slightly above and in front, gentle fill: soft shadows on the muscles"
        : "Soft, even studio light") +
    ". Long lens at hip height. Natural colors, fine film grain, not a 3D render. Five fingers per hand. " + sdFreeNoText(sdLetters() ? SD_LETTERS : "No text or watermark.");
  var kp = [
    t1("shoulders", e.shoulders),
    "m" === e.pres ? "" : ["a very narrow waist", "a narrow waist", "an average waist", "a wide waist", "a very wide waist"][e.waist] || "",
    "m" === e.pres ? "" : 4 === e.fat ? t1("hips", e.hips).replace(/, (clearly|much) wider than the waist/, "") : t1("hips", e.hips),
    "m" === e.pres ? "" : ["a flat chest", "a small bust", "a medium bust", "a fairly full bust", "a large bust", "a very large bust out of proportion with her frame"][sdCi(e.chest)] || "",
    t1("glutes", e.glutes),
    ["very slim thighs", "slim thighs", "average thighs", "full thighs", "very thick thighs"][e.thighs] || "",
  ].filter(Boolean),
    ks = "Key proportions: " + kp.join(", ") + ".\n";
  s = s.replace("\u0001", sdWords(s) + sdWords(ks) <= 600 ? ks : "");
  hl || (s = s.replace(/\bbreasts\b/g, "bust"));
  return s;
}
function sdAdult(s) {
  return (+e.age || 30) >= 21
    ? s
    : s
        .replace(/\b(\d+)-year-old (woman|man|person)\b/g, "$1-year-old adult $2")
        .replace(/sheet of this (woman|man|person)\b/, "sheet of this adult $1");
}
/* eye size and nose width as ordered scales, so a chosen trait can no longer block the level (Auto stays with the draw).
   Eyes: one step smaller with "Quelconque", two with "Ingrat". Nose (the largest measured gap with the reference photos):
   at least "Large", and one step (two with "Ingrat") wider than the choice: Fin -> Large, Large -> Très large. */
var SD_EYES = [
    ["xsmall", "Très petits", "Very small"],
    ["small", "Petits", "Small"],
    ["medium", "Moyens", "Medium"],
    ["large", "Grands", "Large"],
    ["xlarge", "Très grands", "Very large"],
  ],
  SD_NOSE = [
    ["xnarrow", "Très fin", "Very narrow"],
    ["narrow", "Fin", "Narrow"],
    ["medium", "Moyen", "Medium"],
    ["wide", "Large", "Wide"],
    ["xwide", "Très large", "Very wide"],
  ];
function sdIdx(L, v) {
  for (var i = 0; i < L.length; i++) if (L[i][0] === v) return i;
  return -1;
}
function sdShiftOf(t) {
  return "person" === t.mode && !sdChild(t) && !t.photo && t.looks >= 3 ? (t.looks >= 4 ? 2 : 1) : 0;
}
function sdEffIdx(eyes, i, s) {
  return eyes ? Math.max(0, i - s) : Math.min(SD_NOSE.length - 1, Math.max(3, i + s));
}
function sdShift(t) {
  var s = sdShiftOf(t);
  if (!s) return t;
  var o = {},
    i = sdIdx(SD_EYES, t.eyeSize),
    j = sdIdx(SD_NOSE, t.noseW);
  i >= 0 && (o.eyeSize = SD_EYES[sdEffIdx(!0, i, s)][0]);
  j >= 0 && (o.noseW = SD_NOSE[sdEffIdx(!1, j, s)][0]);
  /* other chosen traits that read as beauty markers, softened the same way, never past neutral */
  +t.featFine > 2 && (o.featFine = Math.max(2, +t.featFine - s));
  +t.faceAngle > 2 && (o.faceAngle = Math.max(2, +t.faceAngle - s));
  "full" === t.lips && (o.lips = 1 === s ? "medium" : "thin");
  return Object.assign({}, t, o);
}
function sdScaleCtl(t, g, k) {
  var eyes = "eyeSize" === k,
    L = eyes ? SD_EYES : SD_NOSE,
    i = sdIdx(L, t[k]),
    auto = i < 0,
    s = sdShiftOf(t),
    eff = auto ? -1 : sdEffIdx(eyes, i, s),
    lab = function (x) {
      return sdT(x[1], x[2]);
    },
    lv = t.looks >= 4 ? sdT("Ingrat", "Homely") : sdT("Quelconque", "Plain");
  return (0, l.jsx)(
    aw,
    {
      id: "l-" + k,
      label: eyes ? sdT("Taille des yeux", "Eye size") : sdT("Nez, largeur", "Nose width"),
      value: auto ? 2 : i,
      min: 0,
      max: L.length - 1,
      display: auto ? sdT("Au hasard", "Random") : lab(L[i]),
      ends: [lab(L[0]), lab(L[L.length - 1])],
      badge: !auto && s && eff !== i ? lv + " → " + lab(L[eff]) : void 0,
      hint: (0, l.jsxs)("span", {
        children: [
          s
            ? eyes
              ? sdT("Avec « " + lv + " », les yeux passent " + (2 === s ? "deux crans" : "un cran") + " plus petits que ton réglage. ", "With “" + lv + "”, the eyes go " + (2 === s ? "two steps" : "one step") + " smaller than your setting. ")
              : sdT("Avec « " + lv + " », le nez est au moins Large et " + (2 === s ? "deux crans" : "un cran") + " plus large que ton réglage. ", "With “" + lv + "”, the nose is at least Wide and " + (2 === s ? "two steps" : "one step") + " wider than your setting. ")
            : "",
          auto
            ? sdT("Au hasard : le tirage du visage choisit.", "Random: the face draw decides.")
            : (0, l.jsx)("button", {
                type: "button",
                className: "font-semibold text-foreground underline",
                style: { textUnderlineOffset: "2px" },
                onClick: function () {
                  g(k, "auto");
                },
                children: sdT("Revenir au hasard", "Back to random"),
              }),
        ],
      }),
      onChange: function (x) {
        g(k, L[x][0]);
      },
    },
    k,
  );
}
/* objects and places: one image per view instead of one six-view sheet. A view keeps the whole frame, so its details
   get every pixel; views 2 and 3 are made from view 1 in the same conversation, so the subject stays identical.
   Two opposite views cover the sides a shot is likely to see (fiche 04: a reference still carries proportions and colors
   under angles it does not show; fiche 05: a face, a reverse angle or a place shown nowhere is invented). View 3 is optional.
   Places stay 16:9 (a set plate is used for framing, fiche 04); "Jour et nuit" adds a night card made from the chosen day view. */
function sdObjPlace() {
  return "house" === e.objCat || "interior" === e.objCat;
}
function sdObjViewsSpec(defaults) {
  var choice = defaults ? [] : sdViewChoice(e);
  if (choice.length) {
    var place = sdObjPlace(), texts = place ? sdPlaceViewTxt() : sdObjViewTxt(),
      labels = place ? SD_PLACE_LBL[e.objCat] : [["face", "front"], ["dos", "back"], ["trois-quarts", "three-quarter"], ["côté gauche", "left side"], ["côté droit", "right side"], ["clothing" === e.objCat ? "à plat" : "dessus", "clothing" === e.objCat ? "laid flat" : "top"], ["trois-quarts arrière", "three-quarter rear"]];
    return choice.map(function (id, i) {
      var light = "interior" === e.objCat && 2 === id,
        label = light && !sdPlaceWin() ? ["lumière", "light"] : labels[id];
      return [light ? "lumiere" : !place && "clothing" === e.objCat && 5 === id ? "plat" : "vue-" + id,
        ["Vue " + (i + 1) + " : " + label[0].toLowerCase(), "View " + (i + 1) + ": " + label[1].toLowerCase()],
        texts[id], texts[id]];
    });
  }
  var c = e.objCat,
    noWin = "interior" === c && 0 > nh("objLightSel", "objLightOpts", "objLight").indexOf("daylight through the windows");
  return "house" === c
    ? [
        ["facade", ["Vue 1 : façade", "View 1: front"], "the front view", "front view of the house, straight on"],
        ["34", ["Vue 2 : trois-quarts", "View 2: three-quarter"], "", "three-quarter view from the front left"],
        ["arriere", ["Vue 3 : arrière (facultatif)", "View 3: rear (optional)"], "", "rear view"],
      ]
    : "interior" === c
      ? [
          ["entree", ["Vue 1 : depuis l'entrée", "View 1: from the entrance"], "the view from the entrance door", "wide view from the entrance door"],
          ["contrechamp", ["Vue 2 : contrechamp", "View 2: reverse angle"], "", "wide view from the opposite corner, looking back toward the entrance"],
          ["lumiere", ["Vue 3 : vers la lumière (facultatif)", "View 3: toward the light (optional)"], "", noWin ? "view toward the main light source" : "view toward the main windows"],
        ]
      : "clothing" === c
        ? [
            ["face", ["Vue 1 : face", "View 1: front"], "the front view", "Front view, straight on."],
            ["dos", ["Vue 2 : dos", "View 2: back"], "", "Back view, straight on."],
            ["plat", ["Vue 3 : à plat (facultatif)", "View 3: laid flat (optional)"], "", "The garment laid flat, seen from directly above."],
          ]
        : [
            ["34av", ["Vue 1 : trois-quarts avant", "View 1: three-quarter front"], "the three-quarter front view", "Three-quarter front view: turned about 45 degrees so its front and one side both show, camera slightly above it."],
            ["34ar", ["Vue 2 : trois-quarts arrière", "View 2: three-quarter rear"], "", "Three-quarter rear view from the opposite corner: its back and its other side both show, camera slightly above it."],
            ["dessus", ["Vue 3 : dessus (facultatif)", "View 3: top (optional)"], "", "Top view, seen from directly above."],
          ];
}
/* "Sheet layout only" keeps the photo's own light and has no light section to turn to night */
/* the copy later prompts build on: a person's head sheet; an animal's whole-animal sheet, which carries its identity */
function sdTracked(t, mode) {
  return ("animal" === mode ? "body" : "head") === t;
}
function sdObjNight() {
  return sdObjPlace() && "both" === e.objTime && !(e.photo && e.photoOnly);
}
function sdObjOne(s, i) {
  var V = sdObjViewsSpec(),
    v = V[i],
    same =
      "The same single object as in view 1 (" +
      V[0][2] +
      ": the image just above in this conversation, or attached): identical shape, proportions, colors, materials, markings and wear; only the viewpoint changes.\n";
  s = String(s || "")
    .replace(
      / to be used as a multi-angle reference for AI video: a six-view studio turnaround of one single (.+?) in one image, as for a product or prop reference\./,
      " to be used as an identity reference for AI video: one view of one single $1, as for a product or prop reference.",
    )
    .replace(
      / to be used as an object reference for AI video: a six-view studio turnaround of the (.+?) in the attached photo\(s\), in one image\./,
      " to be used as an object reference for AI video: one view of the $1 in the attached photo(s).",
    )
    .replace("\nIt is the same single object in all six views: identical shape, proportions, colors, materials, markings and wear. ", "\n")
    .replace(
      /LAYOUT:\nA 16:9 landscape image split into six equal panels in a 3 by 2 grid, separated by narrow gaps of the same grey as the backdrop\. [^\n]*\nThe whole ([^\n]*?) is visible in every panel, centered, at the same scale in the front, back and side views, filling about 80% of the panel\./,
      "LAYOUT:\nA 3:2 landscape image, or 2:3 portrait if the $1 is clearly taller than wide, showing the whole $1 once, centered, filling about 80% of the frame. " + v[3],
    )
    .replace(", horizontal in the side views,", ",")
    .replace(", identical in all panels. ", ". ")
    .replace("the same light in all six panels", "the same light in every view of this object")
    .replace(", camera perpendicular to the object for the front, back and side views and directly above it for the top view, deep focus", ", deep focus")
    .replace(" Panels whose widths differ by more than about 10% are a missed requirement.", "");
  /* the garment's view 3 is laid flat: the mannequin of views 1 and 2 would contradict it */
  if ("plat" === v[0])
    s = s.replace(
      "The garment is shown on an invisible mannequin (ghost mannequin), with its natural shape, volume and drape; no person and no visible mannequin.",
      "The garment is laid flat on the seamless grey backdrop, smoothed out, with its natural shape; no person and no mannequin.",
    );
  if (i > 0)
    s = /\nOBJECT:\n/.test(s)
      ? s.replace(/\nOBJECT:\n(This is a new object: do not reuse any object from earlier images in this conversation\.\n)?/, "\nOBJECT:\n" + same)
      : s.replace(/\nSOURCE:\n/, "\nSOURCE:\n" + same.replace("\n", " "));
  if (i > 0) s = sdPhotoAlso(s, "object", "view 1");
  return s;
}
/* objects, not places: the triptych, the category's three views side by side in one 16:9 image, built from the same
   six-view prompt. Seedance 2.5 takes an image with several views of one subject (fiche 07, Vues multiples); each view
   gets a third of the pixels, so the separate views stay for details. Without a source photo it makes up its own
   object: the triptych or the separate views, not both (sdObjTriRow says so). */
function sdObjTri(s) {
  var V = sdObjViewsSpec(!0);
  return String(s || "")
    .replace(/( reference for AI video: a )six-view studio turnaround /, "$1three-view studio turnaround ")
    .replace("It is the same single object in all six views:", "It is the same single object in all three views:")
    .replace(
      /\nA 16:9 landscape image split into six equal panels in a 3 by 2 grid(, separated by narrow gaps of the same grey as the backdrop\. )[^\n]*\n(The whole [^\n]*? is visible in every panel, centered, at the same scale in )the front, back and side views/,
      function (m0, gaps, whole) {
        return "\nA 16:9 landscape image split into three equal panels side by side" + gaps + "Left panel: " + V[0][3] + " Middle panel: " + V[1][3] + " Right panel: " + V[2][3] + "\n" + whole + "the left and middle panels";
      },
    )
    .replace(
      "The garment is shown on an invisible mannequin (ghost mannequin), with its natural shape, volume and drape; no person and no visible mannequin.",
      "The garment is shown on an invisible mannequin (ghost mannequin) in the left and middle panels, with its natural shape, volume and drape, and laid flat on the seamless grey backdrop in the right panel; no person and no visible mannequin.",
    )
    .replace(", horizontal in the side views,", ",")
    .replace("the same light in all six panels", "the same light in all three panels")
    .replace(", camera perpendicular to the object for the front, back and side views and directly above it for the top view, deep focus", ", deep focus");
}
/* "Keep the object in the photo as is" has no PRESENTATION section: a garment keeps the photo's presentation, unless
   "On an invisible mannequin" is ticked. Same sentence as the other garment prompts, so sdObjOne lays view 3 flat and
   sdObjTri splits it across the triptych's panels. */
function sdKeepMannequin(t, s) {
  return t.photo && t.photoOnly && t.objMannequin && "clothing" === t.objCat
    ? s
        .replace(
          " The only changes are the viewing angles, the plain grey backdrop and an even studio light. ",
          " The only changes are the viewing angles, the presentation described below, the plain grey backdrop and an even studio light. ",
        )
        .replace(
          "\n\nRENDERING:\n",
          "\n\nPRESENTATION:\nThe garment is shown on an invisible mannequin (ghost mannequin), with its natural shape, volume and drape; no person and no visible mannequin.\n\nRENDERING:\n",
        )
    : s;
}
/* with a source photo, views 2 and up and the night card are made from an earlier image of the same subject (view 1,
   or the day view): the photo's "never ... from earlier images" lets that one image through, attached after the photo */
function sdPhotoAlso(s, what, ref) {
  return s.replace(new RegExp("Use only the attached photo(\\(s\\)| for this " + what + "), never an? " + what + " from earlier images"), function (m0, tail) {
    var pl = "(s)" === tail ? "(s)" : "";
    ref += " (attached after the photo" + pl + ", or the image just above in this conversation)";
    return "Use only the attached photo" + (pl ? "(s) and " + ref : " and " + ref + tail) + ", never any other " + what + " from earlier images";
  });
}
/* i: view index; night: the night card, made from the day view just above */
function sdPlaceOne(s, i, night) {
  var V = sdObjViewsSpec(),
    v = V[i];
  s = String(s || "")
    .replace(
      / to be used as a location reference for AI video: a six-view reference sheet of one single (.+?),? in one image, as for a film location scout\./,
      " to be used as a location reference for AI video: one view of one single $1, as for a film location scout.",
    )
    .replace(
      / to be used as a location reference for AI video: a six-view reference sheet of the (house|interior) in the attached photo\(s\), in one image\./,
      " to be used as a location reference for AI video: one view of the $1 in the attached photo(s).",
    )
    .replace(/It is the same single place in all six views: identical (.+?), materials, colors and wear(; only the light changes between day and night)?\. /, function (m0, what) {
      return night
        ? "The same place and the same viewpoint as the image just above in this conversation (or attached): identical " + what + ", materials, colors and wear; only the light changes, to night. "
        : i > 0
          ? "The same place as in view 1 (" + V[0][2] + ": the image just above in this conversation, or attached): identical " + what + ", materials, colors and wear; only the viewpoint changes. "
          : "";
    })
    .replace(
      /LAYOUT:\nA 16:9 landscape image split into six equal panels in a 3 by 2 grid, separated by narrow gaps of neutral grey\. [^\n]*/,
      "LAYOUT:\nA 16:9 landscape image showing one single view: " + (night ? "exactly the viewpoint of the image just above" : v[3] + (/attached photo/.test(s) && "lumiere" === v[0] ? ", or toward the main light source if the photos show no window" : "")) + ".",
    )
    .replace(/(LIGHT AND TIME OF DAY:\n)(.*?) \(top row\)\. (.*?) \(bottom row\)\./, function (m0, h, day, nig) {
      return h + (night ? nig : day) + ".";
    })
    .replace(/Eye-level views[^\n]+(?=\n\n)/, function (camera) {
      if (night && sdViewChoice(e).length) return "Exactly the same camera position, lens, framing and perspective as the attached day view.";
      if (!night && /aerial/.test(v[3])) return "Aerial view from about 15 m high, showing the whole house and roof. Vertical lines kept straight.";
      if (!night && /high-angle/.test(v[3])) return "High-angle view from a top corner of the room, with a 24mm lens, vertical lines kept straight, the whole room readable.";
      return camera;
    })
    .replace("; the aerial view from about 15 m high", "")
    .replace("; the high-angle view from a top corner of the room", "")
    .replace("No captions, labels, panel numbers or watermarks", "No captions, labels, numbers or watermarks")
    .replace(" Panels whose widths differ by more than about 10% are a missed requirement.", "");
  if (i > 0 || night) s = sdPhotoAlso(s, "place", night ? "the day view" : "view 1");
  return s;
}
function sdObjSplit(t, m) {
  if ("object" !== t.mode) return m;
  var o = Object.assign({}, m),
    place = sdObjPlace();
  if ("string" == typeof m.obj) {
    var s = sdKeepMannequin(t, m.obj);
    var V = sdObjViewsSpec();
    V.forEach(function (v, i) { o[i ? "obj" + (i + 1) : "obj"] = place ? sdPlaceOne(s, i) : sdObjOne(s, i); });
    sdObjNight() && (o[V.length > 3 ? "obj5" : "obj4"] = sdPlaceOne(s, 0, !0));
    place || (o.objTri = sdObjTri(s));
  }
  "string" == typeof m.editObj &&
    (o.editObj = m.editObj.replace(
      "Edit the object reference sheet attached to this message, or if none is attached, the latest object reference sheet in this conversation. It shows one single object from six viewpoints, in separate panels on a grey backdrop.",
      place
        ? "Edit the location reference image attached to this message, or if none is attached, the latest location reference image in this conversation. It shows one single place from one viewpoint."
        : "Edit the object reference image attached to this message, or if none is attached, the latest object reference image in this conversation. It shows one single object from one viewpoint on a grey backdrop.",
    ));
  return o;
}
function sdObjCards(B) {
  var V = sdObjViewsSpec(),
    c = V.map(function (v, i) { return B(i ? "obj" + (i + 1) : "obj", String(i + 1), sdT(v[1][0], v[1][1])); });
  sdObjNight() && c.push(B(V.length > 3 ? "obj5" : "obj4", String(V.length + 1), sdT("De nuit : même point de vue que la vue de jour choisie", "At night: same viewpoint as the chosen day view")));
  sdObjPlace() || c.unshift(B("objTri", "T", sdT("Triptyque : les 3 vues sur une image", "Triptych: the 3 views in one image")));
  return c;
}
/* "Joins" stays first: Seedream's card shows the first row as the image(s) to add */
function sdObjTriRow(t, R) {
  return [
    ["Joins", t.photo ? "Ta photo" : "Rien"],
    t.photo
      ? null
      : [
          sdT("Au choix", "Either or"),
          sdT(
            "Le triptyque ou les vues séparées, pas les deux : sans photo de départ, chacun invente son propre objet.",
            "The triptych or the separate views, not both: without a source photo, each one makes up its own object.",
          ),
        ],
    [
      "Format",
      "seedream" === t.model
        ? sdT("16:9, à choisir dans Seedream", "16:9, set in Seedream")
        : sdT("16:9, demandé dans le prompt : vérifie l'image obtenue", "16:9, asked in the prompt: check the image you get"),
    ],
    ["Nomme-la", R(rU("triptyque"))],
  ].filter(Boolean);
}
/* "Mise en planche seulement" on an object or a place: there is no sheet any more, and nothing of a person to keep */
function sdOnlyLabel(t) {
  return "house" === t.objCat || "interior" === t.objCat
    ? sdT("Garder le lieu de la photo tel quel", "Keep the place in the photo as is")
    : sdT("Garder l'objet de la photo tel quel", "Keep the object in the photo as is");
}
function sdOnlyHelp(t) {
  return [
    (0, l.jsx)("b", { children: sdOnlyLabel(t) + "." }, "b"),
    " " +
      ("house" === t.objCat || "interior" === t.objCat
        ? sdT(
            "Les prompts reprennent le lieu de ta photo sans rien y changer (architecture, agencement, mobilier, matières, couleurs, usure, lumière et moment de la journée) ; seul le point de vue change. Les autres réglages sont ignorés tant que cette option est cochée ; seuls la catégorie et les vues choisies restent au choix.",
            "The prompts take the place in your photo and change nothing in it (architecture, layout, furniture, materials, colors, wear, light and time of day); only the viewpoint changes. Other settings are ignored while this option is on; only the category and the selected views can still be chosen.",
          )
        : "clothing" === t.objCat
          ? sdT(
              "Les prompts reprennent le vêtement de ta photo sans rien y changer (forme, proportions, matières, couleurs, marquages, usure) ; seuls changent le point de vue, le fond gris uni, la lumière de studio égale et, si tu coches « Sur mannequin invisible », la présentation. Les autres réglages sont ignorés tant que cette option est cochée ; seuls la catégorie, les vues choisies et « Sur mannequin invisible » restent au choix.",
              "The prompts take the garment in your photo and change nothing in it (shape, proportions, materials, colors, markings, wear); only the viewpoint, the plain grey backdrop, the even studio light and, if you tick “On an invisible mannequin”, the presentation change. Other settings are ignored while this option is on; only the category, the selected views and “On an invisible mannequin” can still be chosen.",
            )
          : sdT(
            "Les prompts reprennent l'objet de ta photo sans rien y changer (forme, proportions, matières, couleurs, marquages, usure) ; seuls changent le point de vue, le fond gris uni et la lumière de studio égale. Les autres réglages sont ignorés tant que cette option est cochée ; seuls la catégorie et les vues choisies restent au choix.",
            "The prompts take the object in your photo and change nothing in it (shape, proportions, materials, colors, markings, wear); only the viewpoint, the plain grey backdrop and the even studio light change. Other settings are ignored while this option is on; only the category and the selected views can still be chosen.",
          )),
    "house" === t.objCat && sdT(
      " Avec le décor « Sol et fond gris neutre », la maison est posée sur un sol gris, sous une lumière de jour neutre.",
      " With the “Neutral grey floor and backdrop” setting, the house stands on a grey floor in neutral daylight.",
    ),
  ];
}
function sdObjBar() {
  /* Older saves keep the two main shortcuts; explicit selections expose every chosen view. */
  return sdObjViewsSpec().slice(0, sdViewChoice(e).length || 2).map(function (v, i) {
    return [i ? "obj" + (i + 1) : "obj", sdT("Copier vue " + (i + 1), "Copy view " + (i + 1)), !1];
  });
}
function sdObjRow(i, t, R, I) {
  /* Seedream has no conversation, so the earlier view is always attached, and its image shape is set in Seedream */
  var V = sdObjViewsSpec(),
    place = sdObjPlace(),
    sd = "seedream" === t.model,
    F = sd
      ? place
        ? sdT("16:9, à choisir dans Seedream", "16:9, set in Seedream")
        : sdT("3:2 (2:3 si l'objet est plus haut que large), à choisir dans Seedream", "3:2 (2:3 if the object is taller than wide), set in Seedream")
      : place
        ? sdT("16:9, demandé dans le prompt : vérifie l'image obtenue", "16:9, asked in the prompt: check the image you get")
        : sdT("3:2 (2:3 si l'objet est plus haut que large), demandé dans le prompt : vérifie l'image obtenue", "3:2 (2:3 if the object is taller than wide), asked in the prompt: check the image you get");
  if (sdObjNight() && i === Math.max(3, V.length))
    return [
      [
        "Joins",
        sd
          ? t.photo
            ? sdT("Ta photo, puis la vue de jour à refaire de nuit", "Your photo, then the day view to redo at night")
            : sdT("La vue de jour à refaire de nuit", "The day view to redo at night")
          : t.photo
            ? sdT("Ta photo, puis la vue de jour à refaire de nuit : rien si elle est juste au-dessus dans la conversation, sinon joins-la", "Your photo, then the day view to redo at night: nothing if it is just above in the conversation, otherwise attach it")
            : sdT("La vue de jour à refaire de nuit : rien si elle est juste au-dessus dans la conversation, sinon joins-la", "The day view to redo at night: nothing if it is just above in the conversation, otherwise attach it"),
      ],
      ["Format", F],
      ["Nomme-la", R(rU("nuit"))],
    ];
  if (i >= V.length) return [];
  return [
    [
      "Joins",
      0 === i
        ? t.photo
          ? "Ta photo"
          : "Rien"
        : (0, l.jsxs)("span", {
            children: [
              sd
                ? t.photo
                  ? sdT("Ta photo, puis la vue 1 : ", "Your photo, then view 1: ")
                  : sdT("La vue 1 : ", "View 1: ")
                : t.photo
                  ? sdT("Ta photo, puis la vue 1 : rien si elle est juste au-dessus dans la conversation, sinon ", "Your photo, then view 1: nothing if it is just above in the conversation, otherwise ")
                  : sdT("La vue 1 : rien si elle est juste au-dessus dans la conversation, sinon ", "View 1: nothing if it is just above in the conversation, otherwise "),
              R(rU(V[0][0])),
            ],
          }),
    ],
    ["Format", F],
    ["Nomme-la", R(rU(V[i][0]))],
  ];
}
/* animals: the body sheet is the identity reference on its own (its four views show the head, coat and markings);
   head close-ups are optional, only for shots that see the head close, and are made from the body sheet.
   Two independent sheets of the same animal would be two references competing for the head (fiche 04). */
function sdAnimalSplit(t, m) {
  if ("animal" !== t.mode || "string" != typeof m.head || "string" != typeof m.body) return m;
  var h = m.head,
    b = m.body,
    subj = (h.match(/\nSUBJECT:\n([\s\S]*?)\n\n/) || [])[1],
    o = Object.assign({}, m);
  if (!subj || !/\nREFERENCE:\n[\s\S]*?\n\n/.test(b)) return m;
  o.body = b
    .replace(
      /\nREFERENCE:\n[\s\S]*?\n\n/,
      "\nSUBJECT:\n" +
        subj.replace(", the same in every panel)", ", the same in every view)") +
        "\nThe head is clearly visible in every view, with its eyes, ears and markings readable: this sheet is the animal's identity reference.\n\n",
    )
    .replace(/ \(the same breed or type as on the head sheet\)/g, " (the breed or type described above)")
    .replace(" Every new attempt keeps the face and identity exactly as in the head sheet: only fix what was missed.", " Every new attempt keeps the animal's identity: only fix what was missed.");
  /* with a source photo, the close-ups keep the photo as their source (the body sheet comes from it too) */
  o.head = /\nSUBJECT:\nUse only the attached photo/.test(h)
    ? h
    : h
    .replace(
      /\nSUBJECT:\n[^\n]*\n/,
      "\nSUBJECT:\nThe same animal as on its four-view sheet (the image just above in this conversation, or attached): identical breed, head, eyes, coat, markings and accessories; only the framing changes, to close-ups of the head.\n",
    )
    .replace("a specific breed or regional type of your own choice, not the most common default, the same in every panel", "the breed or type of its four-view sheet");
  return o;
}
function sdAnimalHeadJoin(t, R) {
  /* with a source photo, the close-ups are made from the photo alone (see sdAnimalSplit) */
  if (t.photo) return sdT("Ta photo", "Your photo");
  return (0, l.jsxs)("span", {
    children: [
      "seedream" === t.model
        ? sdT("La planche de l'animal : ", "The animal sheet: ")
        : sdT("La planche de l'animal : rien si elle est juste au-dessus dans la conversation, sinon ", "The animal sheet: nothing if it is just above in the conversation, otherwise "),
      R(rU("animal")),
    ],
  });
}
/* "Matières" and "Couleurs dominantes": an explicit Auto chip, pressed while nothing is chosen (the prompt then names none) */
function sdMultiAuto(a, r, t, n, p) {
  if ("objMatSel" !== a && "objColSel" !== a) return p;
  var vals = Array.isArray(t[a]) ? t[a] : [],
    auto = !vals.length && !String(t[r.custom] || "").trim();
  return Object.assign({}, p, {
    opts: [["auto", "Auto", "", ""]].concat(p.opts),
    values: auto ? ["auto"] : vals,
    onChange: function (v) {
      var x = {};
      x[a] = [];
      r.custom && (x[r.custom] = "");
      !auto && v.indexOf("auto") >= 0
        ? n(function (s) {
            return Object.assign({}, s, x);
          })
        : p.onChange(
            v.filter(function (k) {
              return "auto" !== k;
            }),
          );
    },
  });
}
/* "plain" / "homely": the traits drawn at random (features left on Auto) are swapped for their unglamorous counterparts.
   Only the "Face structure" line is touched: it holds the random traits only, never the features the user set. */
var SD_PLAIN = [
  ["very full lips", "thin lips"],
  ["full lips", "thin lips"],
  ["large eyes", "small eyes"],
  ["almond-shaped eyes", "hooded eyes with a heavy upper lid"],
  ["upturned, cat-like eyes", "downturned eyes"],
  ["prominent eyes with a visible upper lid", "deep-set eyes"],
  ["thin, high-arched eyebrows", "low, heavy eyebrows close to the eyes"],
  ["angled eyebrows with a sharp peak", "thick, straight eyebrows"],
  ["full, softly arched eyebrows", "thick, straight eyebrows"],
  ["an oval face", "a round face"],
  ["a heart-shaped face", "a long, rectangular face"],
  ["a diamond-shaped face", "a face wider at the jaw than at the forehead"],
  ["a narrow face", "a broad face"],
  ["a narrow nose", "a broad nose"],
  ["a short nose", "a nose of medium length"],
  ["an upturned nose tip", "a rounded, fleshy nose tip"],
  ["a pointed nose tip", "a bulbous nose tip"],
  ["high, prominent cheekbones", "flat cheekbones and a smooth mid-face"],
  ["wide cheekbones with full cheeks", "low, broad cheekbones"],
  ["lean cheeks with slight hollows", "full, rounded cheeks"],
  ["a narrow, tapering jaw", "a soft, rounded jaw"],
  ["an angular jaw with visible corners", "a wide jaw"],
  ["a pointed chin", "a small, rounded chin"],
  ["a cleft chin", "a slightly receding chin"],
  ["a prominent, forward chin", "a slightly receding chin"],
  ["a short distance between the nose and the upper lip", "a long distance between the nose and the upper lip"],
];
function sdPlainFace(txt, looks) {
  var L = looks >= 2 ? SD_PLAIN : null;
  if (!L || "string" != typeof txt) return txt;
  var out = txt.replace(/(^|\n)(Face structure[^\n]*)/, function (m0, a, line) {
    var ang = +e.faceAngle > 2,
      fine = +e.featFine > 2 && "auto" === e.noseW && "auto" === e.noseP;
    L.forEach(function (p) {
      (sdSlim() && ("a narrow face" === p[0] || "an oval face" === p[0])) ||
        (ang && /cheek|jaw/.test(p[0])) ||
        (fine && /nose/.test(p[0])) ||
        (line = line.split(p[0]).join("\u0000" + p[1] + "\u0000"));
    });
    /* 3+: the looks line asks for small eyes, a broad nose and a broad face, the drawn traits must not say otherwise */
    looks >= 3 &&
      (line = line
        .replace(/(^|[^\u0000])medium-sized eyes/, "$1small eyes")
        .replace(/(^|[^\u0000])a nose of medium width/, +e.featFine > 2 && "auto" === e.noseW && "auto" === e.noseP ? "$1a nose of medium width" : "$1a broad nose")
        .replace(/(^|[^\u0000])a face of medium width/, sdSlim() ? "$1a face of medium width" : "$1a broad face"));
    line = line.replace(/\u0000/g, "");
    /* slim body: the drawn face width and jaw follow the corpulence, the shapes stay */
    sdSlim() &&
      (line = line
        .replace(/a broad face|a face of medium width/g, "a narrow face")
        .replace(/a round face/g, "an oval face")
        .replace(/a high, broad forehead/g, "a high forehead")
        .replace(/a wide jaw/g, "a jaw narrower than the cheekbones")
        .replace(/a square chin/g, "a narrow, square chin"));
    sdLean() && (line = line.replace(/full, rounded cheeks/g, "cheeks of medium fullness").replace(/a soft, rounded jaw/g, "a rounded jaw"));
    return a + line;
  });
  sdLean() && (out = out.replace(", soft full cheeks,", ","));
  /* slim body: origin texts keep their cheekbones, nose and profile, without asking for a broad or round face */
  sdSlim() &&
    (out = out
      .replace(/\ba (broader|broad|rounder|broad, large) face with (?=[a-z])/g, "")
      .replace(", a broader jawline", "")
      .replace(" with a slightly wider lower face", "")
      .replace("plump and firm skin", "firm skin"));
  return out;
}
/* v104 "Canon" for a man (Seedream): the random traits (features left on Auto) came from sex-neutral pools, so a man could get high-arched thin brows,
   cat-like eyes, a heart-shaped face, full round cheeks and a soft or tapering jaw, which reads as an odd, feminized face. Research on male faces:
   closeness to the average face raises attractiveness, symmetry and masculinity have no robust effect (Kleisner, Turecek & Pavlovic, Evolution and Human Behavior, 2024);
   jaw prominence and eyebrow thickness weigh more than cheekbones and eye size (Mogilski & Welling, Frontiers in Psychology, 2018);
   a leaner face (Coetzee, Perrett & Stephen, Perception, 2009) and healthy, warm skin color (Stephen et al., Evolution and Human Behavior, 2012) read as healthier and more attractive.
   So the random traits are moved to moderate, close-to-average male traits with a defined jaw and thick brows. Only the "Face structure" and "Individual details" lines. */
var SD_CANON_M = [
  ["a heart-shaped face", "an oval face"],
  ["a diamond-shaped face", "an oval face"],
  ["a round face", "an oval face"],
  ["a long face", "an oval face"],
  ["a narrow face", "a face of medium width"],
  ["a broad face", "a face of medium width"],
  ["a high, broad forehead", "a forehead of medium height"],
  ["a low forehead", "a forehead of medium height"],
  ["close-set eyes", "eyes set at an average distance"],
  ["wide-set eyes", "eyes set at an average distance"],
  ["upturned, cat-like eyes", "almond-shaped eyes"],
  ["slightly downturned eyes", "almond-shaped eyes"],
  ["round eyes", "almond-shaped eyes"],
  ["large eyes", "medium-sized eyes"],
  ["thin, high-arched eyebrows", "thick, fairly straight eyebrows"],
  ["full, softly arched eyebrows", "thick, fairly straight eyebrows"],
  ["fine, light eyebrows", "thick, fairly straight eyebrows"],
  ["angled eyebrows with a sharp peak", "thick eyebrows with a soft, low angle"],
  ["a softly scooped nose bridge", "a straight nose bridge"],
  ["a short nose", "a nose of medium length"],
  ["a narrow nose", "a nose of medium width"],
  ["a softly lifted nose tip", "a defined, straight nose tip"],
  ["a refined, slightly pointed nose tip", "a defined, straight nose tip"],
  ["a rounded nose tip", "a defined, straight nose tip"],
  ["high, prominent cheekbones", "defined cheekbones"],
  ["wide cheekbones with full cheeks", "defined cheekbones"],
  ["softly rounded cheekbones", "defined cheekbones"],
  ["full, rounded cheeks", "lean cheeks"],
  ["soft cheeks of medium fullness", "lean cheeks"],
  ["lean cheeks with slight hollows", "lean cheeks"],
  ["full lips", "lips of medium fullness"],
  ["a fuller upper lip", "a slightly fuller lower lip"],
  ["a wide mouth", "a mouth of medium width"],
  ["a narrow mouth", "a mouth of medium width"],
  ["a narrow, tapering jaw", "a clearly defined jaw with visible corners"],
  ["a soft, rounded jaw", "a clearly defined jaw with visible corners"],
  ["an angular jaw with visible corners", "a clearly defined jaw with visible corners"],
  ["a wide jaw", "a clearly defined, moderately wide jaw"],
  ["slightly protruding ears", "ears lying close to the head"],
  ["small ears lying close to the head", "ears lying close to the head"],
  ["large ears", "ears lying close to the head"],
];
function sdCanonFace(txt, t) {
  if (0 !== t.looks || "m" !== t.pres || "person" !== t.mode || t.photo || "string" != typeof txt) return txt;
  /* v114 (review): with "Angélique" or "Gentil", the defined jaw of Canon keeps soft corners */
  var soft = "ange" === sdCharOn() || "gentil" === sdCharOn();
  return txt.replace(/(^|\n)((?:Face structure|Individual details)[^\n]*)/g, function (m0, a, line) {
    SD_CANON_M.forEach(function (p) {
      line = line.split(p[0]).join("\u0000" + (soft && ("a soft, rounded jaw" === p[0] || "a narrow, tapering jaw" === p[0]) ? "a clearly defined jaw with softly rounded corners" : p[1]) + "\u0000");
    });
    return a + line.replace(/\u0000/g, "");
  });
}
/* v114 "Caractère" (Visage tab): the look of the face, readable at rest with the neutral expression of the sheets: "Gueule" (rugged, weathered, full of
   character), "Méchant", "Gentil", "Angélique". Adult person, no photo source, both engines. The traits drawn at random (features left on Auto, the
   "Face structure" line only) are moved toward the character (SD_CHAR_SWAP), never the features the user set; the "Beauté" transforms (sdPlainFace,
   sdCanonFace, the Looks line) run after it, so the beauty slider keeps the last word. No real person is named. */
var SD_CHAR = {
  gueule:
    "a rugged, weathered face full of character: angular bone structure, a heavy brow, deep-set, narrowed eyes with a steady gaze, prominent cheekbones, a hard jaw, deeper facial lines than usual for the age",
  mechant:
    "a menacing, cold face, the face of a film villain: a hard, piercing stare under low brows, narrowed eyes, a thin, tight-lipped mouth, sharp, hard features; unsettling even when still",
  gentil:
    "a kind, warm, trustworthy face: soft, open features, gentle eyes with a warm, friendly gaze, relaxed brows, a soft mouth whose corners sit naturally a little upward",
  ange: "an angelic, innocent face: soft, delicate features, clear, wide-open eyes with a pure, gentle gaze, smooth contours, a calm, serene look",
};
var SD_CHAR_SWAP = {
  gueule: [
    ["a round face", "a square face"], ["a heart-shaped face", "a long, rectangular face"], ["an oval face", "a square face"],
    ["full, rounded cheeks", "lean cheeks with slight hollows"], ["soft cheeks of medium fullness", "lean cheeks with slight hollows"],
    ["wide cheekbones with full cheeks", "high, prominent cheekbones"], ["softly rounded cheekbones", "high, prominent cheekbones"], ["flat cheekbones and a smooth mid-face", "high, prominent cheekbones"],
    ["a soft, rounded jaw", "an angular jaw with visible corners"], ["a narrow, tapering jaw", "an angular jaw with visible corners"],
    ["a small, rounded chin", "a strong, square chin"], ["a gently projected, rounded chin", "a strong, well-projected chin"], ["a slightly receding chin", "a strong, square chin"], ["a pointed chin", "a square chin"],
    ["large eyes", "medium-sized eyes"], ["round eyes", "deep-set eyes"], ["prominent eyes with a visible upper lid", "deep-set eyes"], ["upturned, cat-like eyes", "hooded eyes with a heavy upper lid"],
    ["fine, light eyebrows", "thick, straight eyebrows"], ["thin, high-arched eyebrows", "low, heavy eyebrows close to the eyes"], ["full, softly arched eyebrows", "thick, straight eyebrows"],
    ["very full lips", "lips of medium fullness"], ["an upturned nose tip", "a slightly downturned nose tip"], ["a softly lifted nose tip", "a slightly downturned nose tip"],
  ],
  mechant: [
    ["large eyes", "small eyes"], ["round eyes", "deep-set eyes"], ["prominent eyes with a visible upper lid", "deep-set eyes"],
    ["full, softly arched eyebrows", "angled eyebrows with a sharp peak"], ["fine, light eyebrows", "low, heavy eyebrows close to the eyes"], ["thin, high-arched eyebrows", "angled eyebrows with a sharp peak"],
    ["very full lips", "thin lips"], ["full lips", "thin lips"], ["full, rounded cheeks", "lean cheeks with slight hollows"], ["soft cheeks of medium fullness", "lean cheeks with slight hollows"],
    ["a soft, rounded jaw", "an angular jaw with visible corners"], ["a small, rounded chin", "a pointed chin"], ["a gently projected, rounded chin", "a pointed chin"], ["a round face", "a diamond-shaped face"],
  ],
  gentil: [
    ["angled eyebrows with a sharp peak", "full, softly arched eyebrows"], ["low, heavy eyebrows close to the eyes", "full, softly arched eyebrows"],
    ["small eyes", "medium-sized eyes"], ["thin lips", "lips of medium fullness"], ["lean cheeks with slight hollows", "soft cheeks of medium fullness"],
    ["an angular jaw with visible corners", "a soft, rounded jaw"], ["a wide jaw", "a soft, rounded jaw"], ["a strong, square chin", "a gently projected, rounded chin"],
    ["a prominent, forward chin", "a gently projected, rounded chin"], ["a square chin", "a gently projected, softly square chin"], ["hooded eyes with a heavy upper lid", "softly hooded eyes"], ["upturned, cat-like eyes", "almond-shaped eyes"],
    ["a strong, well-projected chin", "a gently projected, rounded chin"],
  ],
  ange: [
    ["low, heavy eyebrows close to the eyes", "fine, light eyebrows"], ["angled eyebrows with a sharp peak", "full, softly arched eyebrows"], ["thick, straight eyebrows", "full, softly arched eyebrows"],
    ["small eyes", "large eyes"], ["deep-set eyes", "round eyes"], ["hooded eyes with a heavy upper lid", "round eyes"], ["thin lips", "full lips"],
    ["an angular jaw with visible corners", "a soft, rounded jaw"], ["a wide jaw", "a soft, rounded jaw"], ["a strong, square chin", "a small, rounded chin"], ["a prominent, forward chin", "a small, rounded chin"], ["a square chin", "a small, rounded chin"],
    ["a strong, well-projected chin", "a small, rounded chin"], ["a cleft chin", "a small, rounded chin"], ["a gently projected, softly square chin", "a gently projected, rounded chin"], ["a softly square face", "an oval face"],
    ["a square face", "an oval face"], ["a long, rectangular face", "an oval face"], ["a face wider at the jaw than at the forehead", "a heart-shaped face"],
    ["lean cheeks with slight hollows", "soft cheeks of medium fullness"], ["a bulbous nose tip", "a rounded nose tip"], ["a high nose bridge with a visible bump", "a softly scooped nose bridge"],
    ["an aquiline nose bridge", "a straight nose bridge"], ["a broad nose", "a nose of medium width"],
  ],
};
function sdCharOn() {
  return "person" === e.mode && !sdChild(e) && !e.photo && "string" === typeof SD_CHAR[e.faceChar] ? e.faceChar : "";
}
function sdChar() {
  var c = sdCharOn();
  return c
    ? "Character of the face, readable at rest: " +
        SD_CHAR[c] +
        ". The features above and the looks below take precedence; the character shows in the gaze and overall look."
    : "";
}
function sdCharFace(txt) {
  var c = sdCharOn();
  if (!c || "string" != typeof txt) return txt;
  return txt.replace(/(^|\n)(Face structure[^\n]*)/, function (m0, a, line) {
    SD_CHAR_SWAP[c].forEach(function (p) {
      line = line.split(p[0]).join("\u0000" + p[1] + "\u0000");
    });
    line = line.replace(/\u0000/g, "");
    /* a trait moved onto one already drawn appears once */
    SD_CHAR_SWAP[c].forEach(function (p) {
      var i = line.indexOf(p[1]), j = line.lastIndexOf(", " + p[1]);
      i >= 0 && j > i && (line = line.slice(0, j) + line.slice(j + 2 + p[1].length));
    });
    return a + line;
  });
}
/* settings the user chose that pull a "plain" face toward beauty */
function sdLooksConflict(t) {
  if (!(t.looks >= 3)) return "";
  var f = [],
    en = "en" === sdLang,
    adj = sdShiftOf(t)
      ? sdT(
          "Ce niveau ajuste déjà le nez, la taille des yeux, les lèvres pleines, les traits fins et anguleux que tu as choisis. ",
          "This level already adjusts the nose, eye size, full lips, and fine or angular features you chose. ",
        )
      : "";
  ("almond" === t.eyeShape || "up" === t.eyeShape) && f.push(en ? "almond or upturned eyes" : "yeux en amande ou relevés");
  ["oval", "heart", "diamond"].indexOf(t.face) >= 0 && f.push(en ? "an oval, heart or diamond face" : "visage ovale, en cœur ou en diamant");
  return (
    adj +
    (f.length
      ? sdT(
          "Ces réglages rendent le visage plus attirant : " + f.join(", ") + ". Mets-les sur Auto pour un visage quelconque.",
          "These settings make the face more attractive: " + f.join(", ") + ". Set them to Auto for a plain face.",
        )
      : "")
  );
}
/* GPT looks texts as rendered by the tool's levels 2-4 (tZ.looks), replaced by the recalibrated Seedream texts */
var SD_GPT_LOOKS_OLD = {
  2: "an ordinary face you would pass in the street without noticing: no feature stands out, the proportions are a little uneven and not quite harmonious",
  3: "a plain, forgettable face, the kind nobody notices in a crowd: features slightly out of proportion with each other, a little heavy or a little bland in places, no striking feature",
  4: "a homely, unconventional face: clearly irregular, uneven features that do not fit together harmoniously, nothing striking or glamorous",
};
function sdGptPost(t, m) {
  if (!(t.looks >= 2) || "person" !== t.mode || t.photo) return m;
  var lv = Math.min(4, +t.looks),
    newL = sdLooksText(lv).replace(/^A /, "a ").replace(/\.$/, ""),
    clin = "photo" === t.style && !t.photo,
    o = {},
    k,
    s;
  for (k in m) {
    s = m[k];
    if ("string" == typeof s) {
      s = s.split(SD_GPT_LOOKS_OLD[lv]).join(newL);
      if (/^(head|editHead)$/.test(k)) {
        s = sdPlainFace(s, t.looks).replace("85mm lens", "50mm lens");
        s = clin
          ? s
              .replace(
                "Create a real photograph to be used as an identity reference for AI video: four close-up studio views of the same original fictional character",
                "Create a standardized clinical photograph, as filed in a general dermatology patient record, to be used as an identity reference for AI video: four close-up views of the same original fictional everyday person, photographed as they are",
              )
              .replace(
                "Seamless plain mid-grey studio backdrop, identical in all panels. Soft, even studio lighting from a large softbox slightly above the camera",
                "Plain mid-grey backdrop, identical in all panels. Standard clinical lighting: two diffused lights at 45 degrees on either side of the camera, even and neutral, with no shaping shadows",
              )
              .replace(
                "Real photograph with natural skin, hair and fabric texture, natural color, fine film grain, no retouching. Honest, unretouched photography of a real-looking person, not a beauty or fashion shoot.",
                "Real clinical photograph with natural skin, hair and fabric texture, accurate, neutral color and sharp detail, no retouching.",
              )
              .replace(
                "No text, labels, numbers, watermarks or logos anywhere in the image.",
                "No text, labels, numbers, watermarks, logos, rulers, scale bars or markings anywhere in the image.",
              )
              .replace("fine peach fuzz catching the light on the cheeks and jaw", "fine peach fuzz on the cheeks and jaw")
          : s.replace(
              "Soft, even studio lighting from a large softbox slightly above the camera",
              "Flat, even frontal light like an ID photo, with no flattering shadows and no glamour",
            );
      }
    }
    o[k] = s;
  }
  return o;
}
/* Seedream keeps nothing from one generation to the next and never checks its own image: an object, place or animal
   prompt is the GPT one minus what only ChatGPT acts on (earlier images of the conversation, the regenerate loop).
   ponytail: reuses the GPT wording; write Seedream prose builders, as for people, if Seedream reads these worse */
function sdSolo(m) {
  var o = {},
    k;
  for (k in m)
    o[k] =
      "string" != typeof m[k]
        ? m[k]
        : m[k]
            .replace(/\n\nGENERATION LIMIT:\n[^\n]*$/, "")
            .replace(/This is a new[^\n:]*: do not reuse any \w+ from earlier images in this conversation\.\n/, "")
            .replace(/, never (an?|any other) \w+ from earlier images in this conversation|, never anything from earlier images in this conversation/g, "")
            .replace(/, or the image just above in this conversation\)/g, ")")
            .replace(/: the image just above in this conversation, or attached\)/g, ": attached)")
            .replace(/\(the image just above in this conversation, or attached\)/g, "(attached)")
            .replace(/the image just above in this conversation \(or attached\)|the image just above(?=\.)/g, "the attached day view");
  return o;
}
/* shortcut: adapt the existing person prose; add a dedicated builder only if render tests show a layout failure. */
function sdGptSdText(x, body, photo2) {
  var s = String(x || "")
    .replace(/\n\nGENERATION LIMIT:[\s\S]*$/, "")
    .replace(/^This is a new[^\n]* from earlier images in this conversation\.\n/gm, "")
    .replace(/,? never (?:a|an|any|anything)\b[^.;\n]*? from earlier images in this conversation/g, "");
  if (!body) return s;
  s = s
    .replace(
      /The head sheet \((four head close-ups: front, three-quarter, profile and back of the head on a grey backdrop)\) is the identity anchor: match its ([^.]*) exactly\. If a head sheet is attached to this message, it is the anchor and overrides every earlier image in this conversation; otherwise use the most recent head sheet [^.;]*, and ignore every other (animal|person)\./,
      function (z, n, w, a) {
        return "Image 1 is this " + ("animal" === a ? "animal" : "character") + "'s head sheet (" + n + "): it is the identity anchor; match its " + w + " exactly.";
      },
    )
    .replace(
      "The head sheet (four head close-ups: front, three-quarter, profile and back of the head on a grey backdrop) belongs to this character, but the head itself is outside the frame here:",
      "Image 1 is this character's head sheet (four head close-ups: front, three-quarter, profile and back of the head on a grey backdrop), but the head itself is outside the frame here:",
    )
    .replace(/ If a head sheet is attached to this message, use it; otherwise use the most recent head sheet [^.]*\./, "");
  if (!photo2) return s.replace(/ The attached photo shows the same (animal|person)\./, "");
  s = s
    .replace(/ The attached photo shows the same (animal|person)\./, " Image 2 is a photo of the same $1.")
    .replace(/the attached photo(?:\(s\))?/g, "image 2")
    .replace("areas the photos do not show", "areas image 2 does not show");
  /* the headless body has no such sentence: image 2 is named after the head sheet */
  return /Image 2 is a photo/.test(s) ? s : s.replace(/(REFERENCE:\n[^\n]*)/, "$1 Image 2 is a photo of the same person.");
}
function sdGptSd(t, m) {
  var o = {}, k, po = an();
  for (k in m) o[k] = "";
  o.head = sdAdult(sdGptSdText(m.head, !1, !1));
  o.body = sdAdult(sdGptSdText(m.body, !po, !po && sdBodyPhoto(t)));
  return o;
}
function sdWrap(t, m) {
  if (sdChild(t) && ("seedream" !== t.model || sdOk(t))) return sdChildPrompts(t, m);
  var o = {},
    k;
  if ("seedream" !== t.model || "person" !== t.mode) {
    o = sdAnimalSplit(t, sdObjSplit(t, sdGptPost(t, m)));
    return "seedream" === t.model ? sdSolo(o) : o;
  }
  if (!sdNative(t)) return sdGptSd(t, sdGptPost(t, m));
  for (k in m) o[k] = m[k];
  o.head = sdCanonFace(sdPlainFace(sdAdult(sdHead()), t.looks), t);
  o.body = sdAdult(sdBody());
  o.iter = String(e.sdIter || "").trim() || "dressMine" === e.sdIterOp ? sdAdult(sdIterText()) : nw() && "free" !== e.sdIterOp ? sdAdult(sdPresetJoin()) : "";
  return o;
}
function sdLen(s, sd) {
  var c = String(s || "").length,
    w = sdWords(s),
    t = sd ? sdT(sdNum(w) + " mots, " + sdNum(c) + " caractères", sdNum(w) + " words, " + sdNum(c) + " characters") : sdT(sdNum(c) + " caractères", sdNum(c) + " characters");
  if (c > SD_MAXC)
    return (0, l.jsx)("span", {
      className: "font-semibold text-destructive",
      children:
        t +
        (sd
          ? sdT(". Plus de 10 000 caractères : raccourcis les champs libres.", ". Over 10,000 characters: shorten the free-text fields.")
          : sdT(". Trop long pour Seedream (coupé à 10 000), mais ce prompt est pour GPT Image 2.5.", ". Too long for Seedream (cut at 10,000), but this prompt is for GPT Image 2.5.")),
    });
  if (sd && w > 600)
    return (0, l.jsx)("span", {
      className: "font-semibold text-destructive",
      children: t + sdT(". Plus de 600 mots : le modèle risque d'en ignorer une partie.", ". Over 600 words: the model may skip some of it."),
    });
  return t + (sd ? sdT(". Conseillé : moins de 600 mots.", ". Recommended: under 600 words.") : "");
}
var SD_MAXC = 1e4;
function sdRows(t, m, R, q) {
  var o = {},
    k;
  for (k in q) o[k] = q[k];
  if (!sdOff(t) && ("seedream" !== t.model || "person" !== t.mode)) {
    for (k in o) "string" == typeof m[k] && o[k] && (o[k] = o[k].concat([["Longueur", sdLen(m[k], "seedream" === t.model)]]));
    return o;
  }
  if (!sdOk(t)) return q;
  var F = "16:9, à choisir dans Seedream",
    J = "Images à ajouter",
    N = "Nom du fichier";
  /* v112: a GPT prompt rewritten for Seedream (sdGptSd): the photo(s) for a head sheet; the head sheet (image 1), then the
     photo when the body needs it (image 2); "Mise en planche seulement" (an()): only the photos */
  if (!sdNative(t)) {
    var P = t.photo ? (an() ? "Ta photo ou tes photos" : "Ta photo") : "Aucune image";
    o.head = [
      [J, P],
      ["Format", F],
      [N, R(rU("tete"))],
      ["Longueur", sdLen(m.head, !0)],
    ];
    o.body = [
      [
        J,
        an()
          ? P
          : (0, l.jsxs)("span", {
              children: ["1. la planche tête (", R(rU("tete")), ")", sdBodyPhoto(t) ? " ; 2. ta photo." : "."],
            }),
      ],
      ["Format", F],
      [N, R(rU("corps"))],
      ["Longueur", sdLen(m.body, !0)],
    ];
    return o;
  }
  o.head = [
    [J, "Aucune image"],
    ["Format", F],
    [N, R(rU(sdBaby(t) ? "bebe" : "tete"))],
    ["Longueur", sdLen(m.head, !0)],
  ];
  o.body = [
    [
      J,
      nw() || sdChildHl(t)
        ? t.sdShapeRef && !sdChild(t)
          ? "1. ton image guide de forme"
          : "Aucune image"
        : (0, l.jsxs)("span", {
            children: sdUseBodyImg()
              ? ["1. la planche tête (", R(rU("tete")), ") ; 2. ta planche habillée validée."]
              : ["1. la planche tête (", R(rU("tete")), ")", t.sdShapeRef && "person" === t.mode && !sdChild(t) ? " ; 2. ton image guide de forme." : "."],
          }),
    ],
    ["Format", F],
    [N, R(rU("corps"))],
    ["Longueur", sdLen(m.body, !0)],
  ];
  nw() ||
    sdChild(t) ||
    "animal" === t.mode ||
    o.body.push([
      "À savoir",
      (0, l.jsx)("span", {
        children:
          "Ce prompt redessine le corps : la poitrine peut changer. Pour garder un corps validé, fais-le sans tête (« Planche corps sans tête » dans Corps), puis « Assembler tête et corps » en carte 3. N'ajoute jamais une image en maillot à côté d'un visage.",
      }),
    ]);
  o.iter = [
    [
      J,
      "join" === sdOp(e)
        ? "1 : ta planche corps sans tête validée. 2 : la planche tête."
        : "heads" === sdIterOpEff(e)
        ? "1 : ta planche habillée, agrandie de 25 % vers le haut. 2 : la planche tête."
        : "dress" === sdIterOpEff(e)
          ? "1. ta planche corps sans tête validée"
          : "dressMine" === sdOp(e)
          ? "1. ta planche corps validée, sans tête ou assemblée"
          : "1. la planche à retoucher",
    ],
    ["Format", "Identique à l'image 1"],
    [N, "Même nom + _v2, _v3…"],
  ];
  return o;
}
