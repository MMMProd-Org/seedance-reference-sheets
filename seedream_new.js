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
        ? sdPlaceCat(t.objCat)
          ? "Pour créer un lieu d'après une photo : les planches reprennent son architecture, son aménagement, ses matières et ses couleurs, et tes réglages choisissent la lumière et le moment."
          : "Pour créer un objet d'après une photo : les planches reprennent sa forme, ses matières, ses couleurs et son usure, et tes marques, détails et état du moment s'y ajoutent."
        : "Pour créer un personnage d'après la photo d'une personne réelle, uniquement avec son accord. Les planches reprennent son visage et ses cheveux, ses habits avec « Utiliser les habits de la photo » (activé par défaut), et son corps avec « Garder le corps tel quel ».",
    "Joins la photo là où une carte le demande.",
  ].map(function (x, i) {
    return (0, l.jsx)("span", { style: { display: "block", marginTop: i ? "0.45rem" : 0 }, children: x }, i);
  });
}
/* v117: tooltip of the child's "Partir d'une photo" */
function sdChildPhotoTip() {
  return [
    "Pour créer un enfant d'après une photo, uniquement avec l'accord de ses parents. La planche tête reprend son visage et ses cheveux, jamais ses habits, son fond ni sa pose.",
    "La planche corps part de la planche tête : l'enfant y est habillé avec la tenue de l'onglet Tenue, en vêtements de tous les jours.",
  ].map(function (x, i) {
    return (0, l.jsx)("span", { style: { display: "block", marginTop: i ? "0.45rem" : 0 }, children: x }, i);
  });
}
function sdPhotoOnlyTip(t) {
  var pl = sdIsPlace(t);
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
  return "join" === op && sdNanoJoin()
    ? sdT("Copié. Dans Nano Banana, ajoute ta planche corps sans tête telle quelle (image 1) puis la planche tête (image 2).", "Copied. In Nano Banana, add your headless body sheet as it is (image 1) then the head sheet (image 2).")
    : "join" === op && sdGptJoin()
    ? sdT("Copié. Dans ChatGPT (GPT Image 2.5), ajoute ta planche corps sans tête telle quelle (image 1) puis la planche tête (image 2), dans le même message.", "Copied. In ChatGPT (GPT Image 2.5), add your headless body sheet as it is (image 1) then the head sheet (image 2), in the same message.")
    : "join" === op
    ? sdT("Copié. Dans Seedream, ajoute ta planche corps sans tête préparée (+25 % en haut, image 1) puis la planche tête (image 2).", "Copied. In Seedream, add your prepared headless body sheet (+25% at the top, image 1) then the head sheet (image 2).")
    : "heads" === op
      ? sdT("Copié. Dans Seedream, ajoute ta planche habillée préparée (+25 % en haut, image 1) puis la planche tête (image 2).", "Copied. In Seedream, add your prepared dressed sheet (+25% at the top, image 1) then the head sheet (image 2).")
      : "dress" === op
        ? sdT("Copié. Dans Seedream, ajoute ta planche corps sans tête (image 1).", "Copied. In Seedream, add your headless body sheet (image 1).")
        : "dressMine" === op
        ? sdT("Copié. Dans Seedream, ajoute ta planche corps validée, sans tête ou assemblée (image 1).", "Copied. In Seedream, add your approved body sheet, headless or combined (image 1).")
        : sdT("Copié. Dans Seedream, ajoute la planche à retoucher (image 1).", "Copied. In Seedream, add the sheet to retouch (image 1).");
}
function sdBodyCopyMsg(t) {
  /* v117: a child from a photo: the headless body takes the skin tone from the head sheet (image 1) */
  if (sdChildHl(t) && !sdChildPh(t)) return "";
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
  if ("seedream" === t.model && sdChildPh(t)) return sdT("Copié. Dans Seedream, ajoute la photo de l'enfant comme image 1.", "Copied. In Seedream, add the child's photo as image 1.");
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
    ", waist, hips, glutes and legs keep their shape and read through the fit of the clothes; " +
    /* v130 (GPT audit of v129, checked: "apply red lipstick" asked, then the face "stays exactly as it is"): the makeup the outfit names
       goes on a face that keeps its identity and features */
    (fr && rq(Object.assign({}, e, { bodyRef: !1 }), sdFreeMk)
      ? "the head and hair, if image 1 shows them, stay exactly as they are, and the face keeps exactly its identity, features and proportions: only the makeup this outfit names is added to it"
      : "the head, face and hair, if image 1 shows them, stay exactly as they are")
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
        : /* v156 */ "dawn" === e.objTime
          ? "Dawn: soft, cool, pale light with no direct sun on the house and the grey floor, the windows still lit warmly from inside; the backdrop stays plain grey, with no sky."
          : "golden" === e.objTime
            ? "Golden hour: low, warm light from the left, long soft shadows on the grey floor; the backdrop stays plain grey, with no sky."
            : s + " (top row). " + u + " (bottom row).";
}
/* v110: selections apply to separate cards. Empty older saves keep the established three views. */
var SD_PLACE_LBL = {
  house: [["FACE", "FRONT"], ["TROIS QUARTS", "THREE-QUARTER"], ["ARRIÈRE", "REAR"], ["CÔTÉ GAUCHE", "LEFT SIDE"], ["CÔTÉ DROIT", "RIGHT SIDE"], ["VUE AÉRIENNE", "AERIAL"]],
  interior: [["ENTRÉE", "ENTRANCE"], ["COIN OPPOSÉ", "OPPOSITE CORNER"], ["FENÊTRES", "WINDOWS"], ["MUR GAUCHE", "LEFT WALL"], ["MUR DROIT", "RIGHT WALL"], ["PLONGÉE", "HIGH ANGLE"]],
  /* v137 "Extérieur": tiles in the order of the house (main view, diagonal, reverse; left, right, aerial) */
  exterior: [["PLAN LARGE", "WIDE"], ["DIAGONALE", "DIAGONAL"], ["CONTRECHAMP", "REVERSE"], ["CÔTÉ GAUCHE", "LEFT SIDE"], ["CÔTÉ DROIT", "RIGHT SIDE"], ["VUE AÉRIENNE", "AERIAL"]],
};
function sdIsPlace(t) {
  return "object" === t.mode && sdPlaceCat(t.objCat);
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
  if (sdExt())
    return [
      "eye-level wide main view of the whole location from its main approach (the reference viewpoint)",
      "diagonal wide view from about 45 degrees to the left of the main view",
      "reverse view from the far side of the location looking back toward the main viewpoint",
      "side view from the left edge of the location (left as seen from the main viewpoint) looking across it toward the right",
      "side view from the right edge of the location (right as seen from the main viewpoint) looking across it toward the left",
      "high aerial three-quarter view showing the whole location and its layout",
    ];
  return "house" === e.objCat
    ? ["front view", "three-quarter view from the front left", "rear view", "exact left side view", "exact right side view", sdHouseGrey() ? "high aerial three-quarter view showing the roof" : "high aerial three-quarter view showing the roof and the plot"]
    : /* v115: each interior view is a camera position and a direction (user's Seedream test of v114b: "from the entrance door" was read as
         "of the door", two panels framed the door, the same shot came back twice and no panel faced the windows) */
      [
        "wide view from the entrance doorway (the camera stands in the doorway with its back to the entrance door, which is not visible, and looks into the whole room)",
        "wide view from the corner farthest from the entrance (the camera looks back across the room toward the entrance door, which is visible)",
        sdPlaceWin()
          ? "view toward the main windows (the camera stands in the middle of the room and faces them squarely, the window wall filling the frame)"
          : "view toward the main light source (the camera stands in the middle of the room and faces it)",
        "view along the left wall (left as seen from the entrance; the camera stands at the entrance end of that wall and looks along it to the far end of the room)",
        "view along the right wall (right as seen from the entrance; the camera stands at the entrance end of that wall and looks along it to the far end of the room)",
        "high-angle view from a top corner showing the whole layout",
      ];
}
/* v115 (user's Seedream test of v114b, "Mise en planche seulement"): an interior from a photo had no camera line and kept the photo's own
   framing; v137: an outdoor location too. All the views, by day: sdPlaceOne keeps the one of each card */
function sdPlaceCamAll() {
  return sdExt()
    ? "Eye-level views from about 1.6 m high with a 24mm lens, from far enough to show the whole location; the aerial view from high enough to show the whole location and its surroundings. Vertical lines kept straight."
    : "Eye-level views from about 1.5 m high with a 24mm lens, vertical lines kept straight, the whole room readable; the high-angle view from a top corner of the room.";
}
/* v115: an interior from a photo: the sides the photo does not show are completed like what it shows (the old sentence, "with nothing new",
   made the model keep the photo's own framing instead of turning the camera) */
var SD_PLACE_FILL = "Walls, windows, doors, floor and ceiling that the photo does not show are completed with exactly the same moldings, paint, flooring, materials and light as in the photo, with no new furniture or objects.";
function sdPlaceAr(x) {
  if (sdExt()) return x.replace("parts the photos do not show continue what is visible, with nothing new.", SD_EXT_FILL_AR);
  return "interior" === e.objCat
    ? x.replace("parts the photos do not show continue what is visible, with nothing new.", "walls, windows, doors, floor and ceiling that the photos do not show are completed with exactly the same moldings, paint, flooring, materials and light as in the photos, with no new furniture or objects.")
    : x;
}
/* ---------- v137 "Lieu" (user: "ajouter un nouvel onglet lieu, et mettre maison, intérieur et extérieur dedans ; on doit pouvoir désigner
   un lieu comme on peut et le dire sans cliquer pour éviter les blocages, ensuite il peut y avoir des boutons pour aider à la création";
   his choice: the helper buttons write into the text) ----------
   "Lieu" is a type of its own in the type row, built on the mode "object" with objCat "house", "interior" or the new "exterior" (an outdoor
   location), like "Enfant" on "person": the place prompts, views, light, photo and Seedream paths of v104 to v115 are kept as they are. The
   object and the place keep their own settings (name, description, views, photo...): switching swaps them (modeCfg.sdObj, modeCfg.sdPlace).
   The description comes first, in the user's own words; the helpers below it add or remove English phrases in that same text. */
var SD_PLACE_CATS = ["house", "interior", "exterior"],
  SD_PLACE_CAT_OPTS = [
    ["house", "Maison", "house"],
    ["interior", "Intérieur", "interior room"],
    ["exterior", "Extérieur", "outdoor location"],
  ],
  SD_EXT_FILL = "Ground, buildings, vegetation and sky that the photo does not show are completed with exactly the same architecture, materials and plants as in the photo, with no new buildings or objects.",
  SD_EXT_FILL_AR = "ground, buildings, vegetation and sky that the photos do not show are completed with exactly the same architecture, materials, plants and light as in the photos, with no new buildings or objects.";
function sdPlaceCat(c) {
  return SD_PLACE_CATS.indexOf(c) >= 0;
}
function sdExt() {
  return "object" === e.mode && "exterior" === e.objCat;
}
/* the house's daylight and weather, said for an outdoor place lit at night by what it holds */
function sdExtLightFix(x) {
  return sdExt()
    ? x
        .replace("the house lit by its own warm interior light through the windows and by its exterior lamps", "the place lit only by its own light sources (street lamps, lit windows or signs, as fits the place), or left in the dark where it has none")
        .replace("light fog glowing around the lamps", "light fog glowing around any lights")
        .replace("the windows already lit warmly from inside", "the first artificial lights switched on")
        .replace("the windows still lit warmly from inside", "the last artificial lights still on")
        .replace("fresh snow on the roof and the ground", "fresh snow on the ground and on every surface")
    : x;
}
/* v156 (user: "concernant les ambiances pour les lieux on a droit à très peu de modes, il faut en ajouter", then "ajoute d'autres détails
   intéressants, c'est pas assez, pareil pour les lieux"): "Moment" gains Aube (dawn) and Heure dorée (golden hour), between the others in the
   order of the day; their light for a house or an outdoor place (with its weather), an interior with windows, and the house on grey (in
   sdHouseGreyLight). An interior with no daylight is lit by its own lamps at any moment, as by day. */
/* v156 review: golden hour in each weather, its own words (not the weather's text after "softened by") */
var SD_GOLDEN_W = {
  overcast: "Golden hour: the low sun from the left breaking through an overcast sky, its warm light soft and diffused, long soft shadows",
  rain: "Golden hour: the low sun from the left under light rain, its warm light glinting on wet surfaces and reflections, long soft shadows",
  fog: "Golden hour: the low sun from the left glowing through light fog, a warm haze softening the distance, long soft shadows",
  snow: "Golden hour: low, warm sunlight from the left on fresh snow on the roof and the ground, long soft shadows",
};
/* v157b: with a description, the sources off by day and at golden hour defer to it ("a room lit by burning candles"); two reviews found no
   reliable reading of "lit" by pattern (the French "lit", "lit by the sun", "the lamps on", "a roaring fire") */
function sdSrcDesc() {
  return t5(e.objDesc) ? ", unless the description says otherwise" : "";
}
function sdMomentLight(k, out, w, clear, win, src) {
  if (out)
    return "golden" === k
      ? clear
        ? "Golden hour: low, warm sunlight from the left just above the horizon, long soft shadows, a clear warm sky"
        : SD_GOLDEN_W[e.objWeather] || "Golden hour: the low sun from the left, its warm light softened by the weather, long soft shadows"
      : clear
        ? "Dawn: the first light before sunrise, a pale pink and blue sky, soft cool light with no direct sun, the windows still lit warmly from inside"
        : "Dawn: the first grey-blue light before sunrise, " + w + ", soft cool light with no direct sun, the windows still lit warmly from inside";
  if (win)
    return "golden" === k
      ? /* v157b (GPT audit of v157, checked: "with candles switched off" next to "a room lit by burning candles"): by day the light comes
           from the windows and the sources are off (the hint says it), unless the description says otherwise (sdSrcDesc) */
        "Golden hour: low, warm sunlight enters through the windows in long beams across the room" + (src ? ", with " + src + " switched off" + sdSrcDesc() : "")
      : "Dawn: pale, cool early light through the windows, the room still dim" + (src ? ", " + src + " still on" : "");
  return "";
}
/* v156 (user: "je trouve que le HTML devrait m'aider pour les lieux, car je fais la description mais le style n'est pas souvent
   cinématographique ; est-ce qu'il y aurait une technique pour donner plus de profondeur, de densité au lieu qu'on crée, avec un prompt
   assez automatique ajouté, pour que l'IA améliore ce qui est dit"): "Direction artistique cinéma" (objCine, on by default), a production
   designer's and a cinematographer's layer after the place text, before the layout: the description kept whole and completed with
   consistent details; depth (foreground, middle ground, background, leading lines; haze in the distance outdoors); the density the place
   would really have (never empty unless the atmosphere asks it, never cluttered at random); materials with history at the strength the
   condition, era and atmosphere set; motivated light with real falloff and detail in the shadows; a palette of two or three colors and an
   accent (or the dominant colors set). Every view stays readable: nothing in the foreground hides the place, the same dressing in every
   panel. Not with a photo (copied as it is) and not on the house alone on grey (no surroundings to dress, its light fixed). */
function sdCine() {
  if (!e.objCine || e.photo || "object" !== e.mode || !sdPlaceCat(e.objCat)) return "";
  var h = "house" === e.objCat,
    x = sdExt(),
    g = sdHouseGrey();
  if (g) return "";
  return (
    "PRODUCTION DESIGN:\nDress it as a finished film set, the way a production designer would: keep everything stated above and complete it with specific, consistent details that show who uses the place and how, never contradicting it. " +
    (h
      ? "Depth: the house set in its surroundings, with a foreground, the house and a background, paths and fences leading the eye to it; nothing hides the house. "
      : x
        ? "Depth in every view: a foreground, a middle ground and a background, with facades, kerbs, paths or the terrain leading the eye into the distance, and a slight haze softening the farthest planes; nothing in the foreground hides the place. "
        : "Depth in every view: a foreground, a middle ground and a background, with furniture, doorways and walls leading the eye into the room; nothing in the foreground hides the room. ") +
    (h
      ? "Density: the details this house would really show, at their real scale and where they belong; never empty unless the description or the atmosphere asks for it, never cluttered at random. "
      : x
        ? "Density: the benches, lamp posts, signs, vegetation and small objects this place would really hold, at their real scale and where they would really be; never empty unless the atmosphere asks for it, never cluttered at random. "
        : "Density: the objects, textiles, papers and fittings this room would really hold, at their real scale and where they would really be; never empty unless the atmosphere asks for it, never cluttered at random. ") +
    "Materials with history: patina, wear, small repairs and dust in the corners, at the strength the condition, era and atmosphere set. " +
    "Motivated light: every light has a visible or implied source (the sky, a window, a lamp, a sign), with real falloff; light and shadow areas shape the space, with detail kept in the shadows. " +
    (nd("objColSel", "colorOpts").length || t5(e.objColor) ? "A coherent palette built on the dominant colors above, with one accent." : "A coherent palette: two or three dominant colors and one accent, true to the atmosphere and the light.") +
    " The same dressing in every panel.\n\n"
  );
}
/* v156 (user: "dans véhicule j'ai mis « bad shape car » dans la description, ça n'a pas marché, ça m'a fait une voiture sortie du
   concessionnaire"): the condition line said "in good condition, with faint signs of use" (Usure on its default) after a description that
   says the opposite, and a product-photo frame. A description (or the details) that names a condition now wins over "Bon état" and "Neuf";
   with Usé, Très usé or Abîmé the object is never cleaned up or restored for the photo. Objects and places alike. */
var SD_COND_RX = /\b(bad|poor|terrible|rough|awful) (shape|condition|state)\b|\b(rust(y|ed|ing)?|dent(s|ed)?|wreck(s|ed)?|battered|beat[- ]?up|banged[- ]?up|damaged|broken|crashed|abandoned|derelict|neglected|decay(ed|ing)?|rott(en|ing)|worn[- ]out|weathered|scratched|scuffed|dirty|filthy|muddy|grimy|peeling|cracked|burnt|burned|shabby|ramshackle|run[- ]down|dilapidated|junk(ed|yard)?|scrap(ped)?|corroded|moldy|mouldy)\b|rouill|cabossé|abîmé|épave|délabré|accidenté|mauvais état|crasseu|déglingu|pourri|cassé|fissuré|brûlé/i;
/* v156 review: colors and finishes named like damage ("rust-colored", "burnt orange", "blanc cassé", "broken-in leather", "a weathered oak
   finish") are not a condition; a description that says the object is new keeps the setting's words */
var SD_COND_NOT = /\brust[- ]?(colou?red|red|orange|brown)\b|\bburn(t|ed) (orange|sienna|umber)\b|blanc cassé|\bbroken-in\b|\b(weathered|distressed)[- ]([a-z]+[- ])?(finish|look|effect|stain|style)\b/gi;
var SD_COND_NEW = /\b(brand[- ]new|like new|mint condition|showroom condition)\b|comme neu|tout neu|flambant neu/i;
var SD_COND_RX2 = /\bruin(ed|s)?\b|\bcrumbling\b|\bcollapsed\b|\broofless\b|\bvandali[sz]ed\b|ruine|effondré|vandalisé/i;
/* v157b (GPT audit of v157, checked: "a silver car without rust or dents" with "Neuf" said "its wear and damage clearly visible"; two
   reviews then found no reliable reading of negations by pattern: lists, "except", "and", French, line breaks): a damage word with no
   negation in the text keeps the v156 rule (the description wins); with a negation word anywhere in it, the setting is said and the
   prompt lets the description decide, which the image model reads in full (sdCond) */
var SD_COND_NEGW = /\b(?:without|no|not|never|neither|nor|free (?:of|from)|zero|sans|pas|jamais|non|aucune?|ni|z[ée]ro)\b|\b[a-z]+-free\b|\bn['’]/i;
function sdCondTxt() {
  return (String(e.objDesc || "") + ".\n" + String(e.objMarks || "")).replace(/[«»"]/g, "").replace(SD_COND_NOT, " ");
}
function sdCondDesc() {
  var d = sdCondTxt();
  return !SD_COND_NEW.test(d) && (SD_COND_RX.test(d) || SD_COND_RX2.test(d));
}
/* v156 review: an abandoned, squalid or post-apocalyptic place is never in good condition either */
function sdCondMood() {
  return sdPlaceCat(e.objCat) && ["abandoned", "squalid", "postapo"].indexOf(e.objMood) >= 0;
}
function sdCond() {
  var w = +e.objWear;
  /* v157b review: an abandoned, squalid or post-apocalyptic mood wins over the setting before the negation case, as the hint says */
  return w <= 1 && sdCondDesc() && !SD_COND_NEGW.test(sdCondTxt())
    ? "as the description says, its wear and damage clearly visible at that level; never new, cleaned up or restored for the photo"
    : w <= 1 && sdCondMood()
    ? "worn and neglected as the atmosphere says, its wear and damage clearly visible; never new, cleaned up or restored for the photo"
    : w <= 1 && sdCondDesc()
    ? t1("objWear", e.objWear) + ", unless the description or the details describe actual wear or damage: then that wear and damage show clearly, never cleaned up or restored for the photo"
    : t1("objWear", e.objWear) + (w >= 2 ? "; not cleaned up or restored for the photo" : "");
}
/* the settings kept apart by switching: the per-mode keys of the app (name, photo, style, state...), except the lock, and every object key
   (v137 review: "Nouvel objet" and "Nouveau lieu" clear the object keys of the active kind; the inactive kind lives in modeCfg only). The
   views stay as they are: "objViews" and "placeViews" are already apart */
function sdKindKeys() {
  return r4
    .filter(function (x) {
      return "locked" !== x && "base" !== x;
    })
    .concat(
      Object.keys(tJ).filter(function (k) {
        return 0 === k.indexOf("obj") && "objViews" !== k;
      }),
    );
}
function sdKindSwap(r, toPlace) {
  var K = sdKindKeys(),
    mc = Object.assign({}, r.modeCfg || {}),
    cur = {},
    d = Object.assign({}, r6("object", r.style)),
    o = {};
  K.forEach(function (k) {
    k in r && (cur[k] = Array.isArray(r[k]) ? r[k].slice() : r[k]);
    o[k] = k in d ? d[k] : Array.isArray(tJ[k]) ? tJ[k].slice() : tJ[k];
  });
  mc[toPlace ? "sdObj" : "sdPlace"] = cur;
  o.objCat = toPlace ? "exterior" : "object";
  o.style = r.style;
  var back = mc[toPlace ? "sdPlace" : "sdObj"] || {};
  K.forEach(function (k) {
    k in back && (o[k] = back[k]);
  });
  /* a stale or missing category never lands on the other kind */
  sdPlaceCat(o.objCat) !== toPlace && (o.objCat = toPlace ? "exterior" : "object");
  return Object.assign({}, r, o, { modeCfg: mc });
}
/* the type row: "place" is the mode "object" with a place; "object" with an object; the other types as before (sdChildMode) */
function sdPlaceMode(v, s, core) {
  var P = "place" === v,
    r = sdChildMode(P ? "object" : v, s, core);
  return "object" !== r.mode || sdChild(r) || sdPlaceCat(r.objCat) === P ? r : sdKindSwap(r, P);
}
/* the helpers: [group FR, group EN, meaning ("" = several choices; otherwise one choice, across the three kinds: changing "Type de lieu"
   then picking a place type replaces the one of the other kind), [[label FR, label EN, English phrase], ...]] */
var SD_ERA = ["Époque", "Era", "era", [["Antiquité", "Antiquity", "in Roman antiquity"], ["Moyen Âge", "Middle Ages", "in the Middle Ages"], ["Renaissance", "Renaissance", "in the Renaissance"], ["XVIIIe siècle", "18th century", "in the 18th century"], ["XIXe siècle", "19th century", "in the 19th century"], ["Années 1900", "1900s", "in the early 1900s"], ["Années 1920", "1920s", "in the 1920s"], ["Années 1930", "1930s", "in the 1930s"], ["Années 1950", "1950s", "in the 1950s"], ["Années 1960", "1960s", "in the 1960s"], ["Années 1970", "1970s", "in the 1970s"], ["Années 1980", "1980s", "in the 1980s"], ["Années 1990", "1990s", "in the 1990s"], ["Années 2000", "2000s", "in the 2000s"], ["Aujourd'hui", "Today", "in the present day"], ["Futur proche", "Near future", "in the near future"], ["Futur lointain", "Far future", "in the far future"]]],
  SD_PLACE_HELP = {
    exterior: [
      ["Lieu", "Place", "kind", [["Rue", "Street", "a city street"], ["Ruelle", "Alley", "a narrow back alley"], ["Place", "Square", "a town square"], ["Parking", "Car park", "an open-air car park"], ["Quai de gare", "Station platform", "an outdoor railway platform"], ["Toit", "Rooftop", "a city rooftop"], ["Port", "Harbour", "a harbour quay"], ["Forêt", "Forest", "a forest clearing"], ["Plage", "Beach", "a sandy beach"], ["Désert", "Desert", "a desert road"], ["Montagne", "Mountain", "a mountain path"], ["Campagne", "Countryside", "a country road between fields"], ["Friche", "Wasteland", "an industrial wasteland"], ["Pont", "Bridge", "a city bridge"], ["Tunnel", "Tunnel", "a road tunnel"], ["Marché", "Market", "an open-air market"], ["Cour", "Courtyard", "an inner courtyard between buildings"], ["Parc", "Park", "a city park"], ["Cimetière", "Cemetery", "an old cemetery"], ["Chantier", "Building site", "a construction site"], ["Station-service", "Petrol station", "a petrol station"], ["Autoroute", "Motorway", "a motorway"], ["Village", "Village", "a village street"], ["Lac", "Lake", "a lakeshore"], ["Rivière", "River", "a riverbank"], ["Falaise", "Cliff", "a sea cliff"], ["Jungle", "Jungle", "a jungle"], ["Docks", "Docks", "industrial docks with cranes and containers"], ["Terrain vague", "Vacant lot", "a vacant lot"], ["Stade", "Stadium", "an empty stadium"], ["Champ", "Field", "an open wheat field"]]],
      SD_ERA,
      ["Saison", "Season", "season", [["Printemps", "Spring", "in spring"], ["Été", "Summer", "in summer"], ["Automne", "Autumn", "in autumn"], ["Hiver", "Winter", "in winter"]]],
      ["Sol", "Ground", "ground", [["Asphalte", "Asphalt", "asphalt ground"], ["Pavés", "Cobblestones", "cobblestones"], ["Terre", "Dirt", "packed dirt and gravel"], ["Herbe", "Grass", "grass"], ["Sable", "Sand", "sand"], ["Béton", "Concrete", "bare concrete ground"], ["Gravier", "Gravel", "gravel"], ["Boue", "Mud", "mud"], ["Planches", "Boardwalk", "a wooden boardwalk"]]],
      ["Détails", "Details", "", [["Lampadaires", "Street lamps", "street lamps"], ["Voitures garées", "Parked cars", "parked cars"], ["Tags", "Graffiti", "graffiti on the walls"], ["Câbles", "Power lines", "overhead power lines"], ["Flaques", "Puddles", "puddles"], ["Feuilles mortes", "Fallen leaves", "fallen leaves"], ["Enseignes", "Shop signs", "shop signs"], ["Bancs", "Benches", "benches"], ["Arbres", "Trees", "trees"], ["Néons", "Neon signs", "neon signs"], ["Vapeur", "Street steam", "steam rising from street vents"], ["Échafaudages", "Scaffolding", "scaffolding"], ["Poubelles", "Bins", "overflowing bins"], ["Terrasse de café", "Café terrace", "café tables on the pavement"], ["Affiches", "Posters", "torn posters on the walls"], ["Feux", "Traffic lights", "traffic lights"], ["Vélos", "Bicycles", "parked bicycles"], ["Kiosque", "Newsstand", "a newsstand"], ["Linge", "Laundry", "laundry hanging between the windows"], ["Barrières", "Barriers", "construction barriers"], ["Fontaine", "Fountain", "a fountain"], ["Bouche de métro", "Metro entrance", "a metro entrance"]]],
    ],
    interior: [
      ["Pièce", "Room", "kind", [["Salon", "Living room", "a living room"], ["Cuisine", "Kitchen", "a kitchen"], ["Chambre", "Bedroom", "a bedroom"], ["Salle de bain", "Bathroom", "a bathroom"], ["Bureau", "Office", "an office"], ["Couloir", "Corridor", "a corridor"], ["Hall", "Entrance hall", "an entrance hall"], ["Cave", "Cellar", "a cellar"], ["Grenier", "Attic", "an attic"], ["Bar", "Bar", "a bar"], ["Restaurant", "Restaurant", "a restaurant dining room"], ["Atelier", "Workshop", "a workshop"], ["Entrepôt", "Warehouse", "a warehouse"], ["Salle de classe", "Classroom", "a classroom"], ["Boîte de nuit", "Nightclub", "a nightclub"], ["Chambre d'hôtel", "Hotel room", "a hotel room"], ["Chambre d'hôpital", "Hospital room", "a hospital room"], ["Salle de sport", "Gym", "a gym"], ["Boutique", "Shop", "a small shop"], ["Usine", "Factory", "a factory floor"], ["Laboratoire", "Laboratory", "a laboratory"], ["Parking souterrain", "Underground car park", "an underground car park"], ["Quai de métro", "Metro platform", "an underground metro platform"], ["Église", "Church", "a church nave"], ["Open space", "Open-plan office", "an open-plan office"], ["Salle de réunion", "Meeting room", "a meeting room"], ["Garage", "Car garage", "a car repair garage"], ["Loft", "Loft", "a loft"], ["Salle de cinéma", "Cinema", "a cinema auditorium"], ["Commissariat", "Police station", "a police station office"]]],
      SD_ERA,
      ["Style", "Style", "style", [["Haussmannien", "Haussmann", "Haussmann-style moldings and herringbone parquet"], ["Industriel", "Industrial", "industrial style, exposed brick and steel beams"], ["Scandinave", "Scandinavian", "Scandinavian style, pale wood and white walls"], ["Rustique", "Rustic", "rustic style, exposed wooden beams and stone walls"], ["Art déco", "Art Deco", "Art Deco style"], ["Minimaliste", "Minimalist", "modern minimalist style"], ["Bohème", "Bohemian", "bohemian style, eclectic and layered"], ["Baroque", "Baroque", "baroque style, gilding and ornament"], ["Brutaliste", "Brutalist", "brutalist style, raw concrete"], ["Japonais", "Japanese", "Japanese style, tatami mats and sliding paper screens"], ["Années 50", "Mid-century", "mid-century modern style"], ["Victorien", "Victorian", "Victorian style, dark wood and patterned wallpaper"], ["Contemporain", "Contemporary", "contemporary style"], ["Marocain", "Moroccan", "Moroccan style, zellige tiles and carved wood"]]],
      ["Taille", "Size", "size", [["Exiguë", "Cramped", "small and cramped"], ["Spacieuse", "Spacious", "large and spacious"]]],
      ["Plafond", "Ceiling", "ceiling", [["Haut", "High", "high ceilings"], ["Bas", "Low", "a low ceiling"]]],
      ["Sol", "Floor", "floor", [["Carrelage", "Tiled floor", "a tiled floor"], ["Parquet", "Wooden floor", "a wooden floor"], ["Moquette", "Carpet", "wall-to-wall carpet"], ["Béton", "Concrete", "a bare concrete floor"], ["Pierre", "Stone", "stone flagstones"], ["Lino", "Linoleum", "worn linoleum"], ["Tomettes", "Terracotta tiles", "hexagonal terracotta floor tiles"], ["Marbre", "Marble", "a marble floor"]]],
      ["Détails", "Details", "", [["Grandes fenêtres", "Large windows", "large windows"], ["Bibliothèque", "Bookshelves", "bookshelves"], ["Plantes", "Plants", "plants"], ["Escalier", "Staircase", "a staircase"], ["Papier peint décollé", "Peeling wallpaper", "peeling wallpaper"], ["Poutres", "Exposed beams", "exposed wooden beams"], ["Briques", "Brick walls", "exposed brick walls"], ["Lustre", "Chandelier", "a chandelier"], ["Rideaux", "Curtains", "heavy curtains"], ["Tapis", "Rugs", "rugs on the floor"], ["Tableaux", "Pictures", "framed pictures on the walls"], ["Miroir", "Mirror", "a large mirror"], ["Moulures", "Moldings", "ornate moldings"], ["Cartons", "Boxes", "stacked cardboard boxes"], ["Tuyaux", "Pipes", "exposed pipes"], ["Stores", "Blinds", "venetian blinds"]]],
    ],
    house: [
      ["Type", "Type", "kind", [["Pavillon", "Suburban house", "a detached suburban house"], ["Ferme", "Farmhouse", "a country farmhouse"], ["Villa", "Villa", "a modern villa"], ["Chalet", "Chalet", "a mountain chalet"], ["Maison de ville", "Townhouse", "a narrow townhouse"], ["Cabane", "Cabin", "a wooden cabin"], ["Manoir", "Manor", "a manor house"], ["Maison de plage", "Beach house", "a beach house"], ["Longère", "Longhouse", "a long single-storey stone farmhouse"], ["Mas", "Mas", "a Provençal stone farmhouse"], ["Bastide", "Bastide", "a Provençal country manor"], ["Bungalow", "Bungalow", "a bungalow"], ["Mobile home", "Mobile home", "a mobile home"], ["Ruine", "Ruin", "a ruined, roofless house"], ["Moulin", "Mill", "a converted watermill"], ["Maison d'architecte", "Architect house", "a modern architect-designed house"]]],
      SD_ERA,
      ["Style", "Style", "style", [["Normand", "Normandy", "Normandy half-timbered style"], ["Provençal", "Provençal", "Provençal stone with terracotta roof tiles"], ["Américain", "American", "American clapboard style"], ["Méditerranéen", "Mediterranean", "Mediterranean whitewashed walls"], ["Scandinave", "Scandinavian", "Scandinavian painted wood"], ["Brique", "Brick", "red brick walls"], ["Basque", "Basque", "Basque style, white walls and red timbers"], ["Breton", "Breton", "Breton granite walls and a slate roof"], ["Alsacien", "Alsatian", "Alsatian half-timbered style in bright colors"], ["Contemporain", "Contemporary", "contemporary glass and concrete"], ["Victorien", "Victorian", "Victorian style with bay windows"], ["Colonial", "Colonial", "colonial style with a wide veranda"], ["Japonais", "Japanese", "Japanese style, dark timber and a tiled roof"]]],
      ["Étages", "Storeys", "storeys", [["Plain-pied", "Single-storey", "single-storey"], ["Un étage", "Two storeys", "two storeys"], ["Deux étages", "Three storeys", "three storeys"]]],
      ["Détails", "Details", "", [["Jardin", "Garden", "a front garden"], ["Garage", "Garage", "a garage"], ["Porche", "Porch", "a porch"], ["Volets", "Shutters", "shutters"], ["Cheminée", "Chimney", "a chimney"], ["Clôture", "Fence", "a fence"], ["Piscine", "Pool", "a swimming pool"], ["Lierre", "Ivy", "ivy on the walls"], ["Panneaux solaires", "Solar panels", "solar panels"], ["Terrasse", "Terrace", "a terrace"], ["Balcon", "Balcony", "balconies"], ["Véranda", "Veranda", "a glass veranda"], ["Portail", "Gate", "a wrought-iron gate"], ["Allée", "Driveway", "a gravel driveway"], ["Haie", "Hedge", "a hedge"], ["Grand arbre", "Old tree", "a large old tree"], ["Boîte aux lettres", "Letterbox", "a letterbox"], ["Antenne", "TV aerial", "a TV aerial on the roof"]]],
    ],
  };
/* a phrase is one item of the text, between commas, periods, semicolons or line breaks, whatever its case */
function sdPhrRx(p, g) {
  return new RegExp("(^|[,.;\\n])\\s*" + p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*(?=[,.;\\n]|$)", g ? "gi" : "i");
}
function sdPhrHas(x, p) {
  return sdPhrRx(p).test(String(x || ""));
}
function sdPhrDel(x, p) {
  return String(x || "").replace(sdPhrRx(p, 1), "").replace(/^\s*[,.;]\s*/, "");
}
/* the phrases of one meaning in the three kinds */
function sdPhrGroup(key) {
  var r = [];
  for (var c in SD_PLACE_HELP)
    SD_PLACE_HELP[c].forEach(function (gr) {
      gr[2] === key &&
        gr[3].forEach(function (q) {
          r.indexOf(q[2]) < 0 && r.push(q[2]);
        });
    });
  return r;
}
function sdPhrToggle(x, p, group) {
  if (sdPhrHas(x, p)) return sdPhrDel(x, p);
  (group || []).forEach(function (q) {
    x = sdPhrDel(x, q);
  });
  var b = String(x || "").replace(/[\s,.;]+$/, "");
  return b ? b + ", " + p : p;
}
function sdPlaceHelp(t, g) {
  var G = SD_PLACE_HELP[t.objCat];
  if (!sdIsPlace(t) || !G) return null;
  var x = String(t.objDesc || ""),
    cls = "relative inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium cursor-pointer select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ";
  return (0, l.jsxs)(
    "div",
    {
      className: "py-4 border-b last:border-0",
      id: "sd-place-help",
      children: [
        (0, l.jsx)("p", { className: "font-semibold", children: sdT("Aides", "Helpers") }),
        (0, l.jsx)("p", {
          className: "mt-1 text-sm text-muted-foreground",
          children: sdT("Chaque bouton écrit dans ta description, en anglais ; reclique pour l'enlever. Tout reste modifiable à la main.", "Each button writes into your description, in English; click again to remove it. Everything stays editable by hand."),
        }),
      ].concat(
        G.map(function (gr, gi) {
          var nm = sdT(gr[0], gr[1]);
          return (0, l.jsxs)(
            "div",
            {
              className: "mt-3",
              role: "group",
              "aria-label": nm,
              children: [
                (0, l.jsx)("p", { className: "mb-2 text-sm font-medium text-muted-foreground", children: nm }),
                (0, l.jsx)("div", {
                  className: "flex flex-wrap gap-2",
                  children: gr[3].map(function (it) {
                    var on = sdPhrHas(x, it[2]);
                    return (0, l.jsx)(
                      "button",
                      {
                        type: "button",
                        "aria-pressed": on,
                        "data-phrase": it[2],
                        className: cls + (on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-foreground/40"),
                        onClick: function () {
                          g(
                            "objDesc",
                            sdPhrToggle(x, it[2], gr[2] ? sdPhrGroup(gr[2]) : null),
                          );
                        },
                        children: sdT(it[0], it[1]),
                      },
                      it[2],
                    );
                  }),
                }),
              ],
            },
            "g" + gi,
          );
        }),
      ),
    },
    "sd-place-help",
  );
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
      : (SD_PLACE_LBL[t.objCat] || SD_PLACE_LBL.interior).slice();
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
   no Beauté, no makeup, no reference outfit, no retouch, never the adult's photo options (v117: its own photo for the face and hair only, and the
   single-text outfit with its own keys; every typed text of a child accepted only in the known words of its field, sdChildTypedOk).
   Always fully dressed in everyday clothes; a head sheet,
   then a full-body sheet with the head, in both engines. Clothing or marks that would undress or sexualize a child are dropped, never sent. */
function sdChild(t) {
  return !!t && "person" === t.mode && !!t.child;
}
/* v117 (user, with the parents' consent): a child from a photo ("Partir d'une photo" in the child mode, key childPhoto, apart from the adult's
   photo). The photo gives only the face and hair of the head sheet: never its clothing, accessories, background or pose; no "Mise en planche
   seulement", no body or clothes from the photo; the body sheet starts from the head sheet, dressed as for any child. Never for a baby. */
function sdChildPh(t) {
  return sdChild(t) && !t.baby && !!t.childPhoto;
}
/* v117 (third review): after a child's or a baby's GPT head sheet, an adult prompt never falls back on "the most recent head sheet" */
function sdNoKidHead() {
  return "person" === e.mode && !sdChild(e) && +e.sdLastHeadKid > 0 ? ", never the head sheet of a child or a baby" : "";
}
function sdGptKidMsg(t, k) {
  return ("body" === k || "iter" === k) && "person" === t.mode && !sdChild(t) && +t.sdLastHeadKid > 0
    ? sdT("Copié. La dernière planche tête copiée était celle d'un enfant : dans GPT, joins à ton message la planche tête de ce personnage.", "Copied. The last head sheet copied was a child's: in GPT, attach this character's head sheet to your message.")
    : "";
}
/* the state shortcuts of a child: no cut, blood, torn sleeve, wet clothes or sweat (the child word lists refuse them) */
function sdChildChips() {
  return [
    ["Hématome", "bruise on the [left/right] [cheek], purple and yellow"],
    ["Pansement", "white bandage around the [left/right] [forearm]"],
    ["Saleté", "mud on the knees and dust on the shoes"],
  ];
}
/* v117 (independent review): GPT keeps the conversation, where the child's photo was attached for the head sheet */
var SD_CHILD_PH_BODY = "Never use the photo of this child from earlier in this conversation for the body, build, clothing or pose.";
/* v117 (third review): the typed name of a child never goes into a prompt; a neutral reference drawn from it keeps the characters of one
   GPT conversation apart ("«child 3F7K»") */
function sdChildRef() {
  var x = sdChildNorm(t5(e.name)),
    h = 5381;
  if (!x) return "this child";
  for (var i = 0; i < x.length; i++) h = ((h * 33) ^ x.charCodeAt(i)) >>> 0;
  return "«child " + ("000" + h.toString(36).toUpperCase()).slice(-4) + "»";
}
function sdChildFic() {
  return sdChildPh(e) ? "" : "fictional ";
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
  "maillots? de bain", "maillots? (une|deux) pieces?", "shorts? de bain", "(?<!jupe-|jupe )culottes?(?! courtes?)", "soutiens?[- ]gorges?", "(?<!non-|anti-|non |anti )slips?(?![- ]on)",
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
  "tattoo\\w*", "tatouage\\w*", "tatoue\\w*", "piercing\\w*", "pierced", "percee?s?",
  /* v117: the single-text outfit opens the field to any wording: more revealing cuts refused */
  "low[- ]?rise", "taille basse", "short shorts", "booty shorts", "micro[- ]?(shorts?|skirts?|jupes?|dress\\w*|robes?)", "tiny (shorts|skirts?|tops?|dress\\w*)",
  "skin[- ]?tight", "tube tops?", "bodycon", "fishnets?", "resille\\w*", "latex",
  /* v117 (independent review): the families the list still let through */
  "mini[- ]?(dress\\w*|robes?|shorts?|tops?)", "minis", "(?<!low |low-|flat |flat-)heel(ed)?", "wedges?", "pumps", "platforms?",
  "eye[- ]?shadows?", "blush(er|es)?", "kohl", "khol", "fards?", "faux[- ]cils", "false (eye)?lash\\w*", "lash extensions?", "painted (nails|toenails)", "nails? (painted|varnished|polish\\w*)",
  "ongles (peints|vernis|faits)", "nail[- ]?polish", "lip[- ]?gloss\\w*",
  "nothing (but|else|on|under\\w*|beneath)", "wearing (only|just|nothing)", "(only|just) wearing", "rien (d'autre|que|sous|dessous)", "(uniquement|seulement) (un|une|en|des)",
  "no (tops?|shirts?|t-?shirts?|pants|trousers|bottoms?|clothes|clothing|outfit|dress|skirt|shorts)", "without (a |any )?(tops?|shirts?|t-?shirts?|pants|trousers|bottoms?|clothes|clothing|dress|skirt)",
  "sans (haut|t-?shirt|tee-?shirt|chemise|pantalon|vetements?|habits?|jupe|robe|culotte)", "half[- ]?(naked|nude|dressed)", "barely (dressed|clothed|covered)", "scant\\w*", "partially (dressed|clothed)", "a moitie (nue?s?|habille\\w*)",
  "g[- ]?strings?", "y[- ]?fronts?", "jockstraps?", "night[- ]?dress\\w*", "negligees?", "robes? de nuit", "porte[- ]jarretelles?", "jarretel\\w*", "jarretieres?", "slip dress\\w*",
  "spaghetti( straps?)?", "thin straps?", "halter\\w*", "bandeaux?(?! dans les cheveux)", "open[- ]?back\\w*", "slits?", "fendue?s?", "deep[- ]?v([- ]?neck\\w*)?", "plunge\\w*", "(?<!carre )plongeant\\w*", "cut[- ]?outs?",
  "above the (navel|belly( button)?|waist)", "belly[- ]?buttons?", "navels?", "nombrils?", "crop[- ]?tees?", "see[- ]?thru", "tops? transparent\\w*",
  "echancre\\w*", "moulant\\w*", "figure[- ]hugging", "form[- ]fitting", "body[- ]?hugging", "catsuits?", "unitards?", "spandex", "lycra", "bare[- ]?legged",
  "tight (dress\\w*|tops?|skirts?|shorts|jeans|leggings|clothes|clothing|outfits?|fit)", "tie[- ]?front", "front[- ]?tie", "(knotted|tied)( (in|on|at))?( the)? (waist|front|belly|midriff|navel)", "over-the-knees?", "over the knees? (socks|boots|stockings|chaussettes|bottes)", "over[- ]knees?",
  "birthday'?s? (suits?|clothes)", "in the buff", "au naturel", "cat[- ]suits?", "(plus|sans) (de |d')?(vetements|habits)",
  /* v117 (third review) */
  "(dog|pet|cat|leather|spiked|studded) collars?", "chokers?", "leash\\w*", "laisses?", "colliers? (de|pour) chien",
  "(socks|chaussettes|boots|bottes) over the knees?", "tie (at |on |in )?(the |its |her |his )?front", "front (is )?tied", "tied (in|on|at|over)( the| its| her| his)? front",
  "(above|behind|inside) (the |his |her )?((left|right) )?knees?",
  "jailbait", "lolis?", "lolicons?", "shotas?", "shotacons?", "hentai", "porn\\w*", "nsfw", "sluts?", "slutty", "whores?", "milfs?", "horny", "boobs?", "boobies",
  "tits", "titty", "titties", "sexpots?", "strippers?", "stripteas\\w*", "onlyfans", "naturis\\w*", "nudis\\w*", "nubile", "chesty", "thicc", "barely legal", "nymphos?",
  "bimbos?", "minx", "vixens?", "pedo\\w*", "paedo\\w*", "camgirls?", "lap ?danc\\w*", "salopes?", "putes?", "putain", "cochonnes?", "lust\\w*", "seductress",
  "temptress", "playboy", "playmates?", "babygirl", "hotties?",
  "(clothes|clothing|outfit|pants|trousers|jeans|dress|top|shirt|bottom|skirt|shorts)s?[- ]?less", "wet", "damp", "soaking", "dripping", "moist", "oiled", "oily", "glisten\\w*",
  "beds?", "bedtime", "bedroom", "lying", "allonge\\w*", "under the covers", "sous la couette", "au lit", "dans (son|sa|le|un) lit", "beach\\w*", "plage", "pool\\w*", "piscine", "sunbath\\w*", "bronzage",
  "(one|two|1|2|une|deux)[- ]pieces?(?! suits?)", "bathers", "cossies?", "togs", "budgie smugglers?", "petticoats?", "jupons?", "camis", "undershirts?", "maillots? de corps",
  "dressing gowns?", "bathrobes?", "peignoirs?", "robes? de chambre", "pyjamas?", "pajamas?", "onesies?", "nightwear", "sleepwear", "loungewear", "lacy",
  "(?<!vis |vis-|visibility )vests?", "nylons", "nose rings?", "hoop earrings?", "earrings?", "boucles? d'oreilles?", "manicure\\w*", "pedicure\\w*", "glitter\\w*", "paillettes",
  "(pink|red|glitter|manicured|fake|false|long|painted|glossy) (finger|toe)?nails", "toenails?", "(glossy|red|pink) lips", "rouge a joues",
  "(sports?|sporty|running|gym|workout|athletic|fitness) (tops?|bras?|brassieres?)", "little black dress\\w*", "petite robe noire",
  "lingeries", "underwears", "mascaras", "eye[- ]?liners", "make[- ]?ups", "nudit(ies|e|es)", "sexuel\\w*", "mesh\\w*",
  "bas (resille|nylon|de soie|blancs?|noirs?|chair|transparents?|autofixants?)", "collants? (chair|transparents?)",
  "curv(y|es|aceous)", "busty", "bust", "poitrine", "voluptu\\w*", "(wide|large|broad) hips", "hips", "hanches?", "hourglass", "(long|slender|slim|bare|toned|shapely) legs", "jambes? (nues?|fines?|longues?)",
  "thighs?", "cuisses?", "sexi\\w*", "sexx\\w*", "sex", "flirt\\w*", "sultry", "fetish\\w*", "fetich\\w*", "bondage", "aguich\\w*", "nymph\\w*", "allumeuse", "coquin\\w*", "naughty", "kinky"
];
var SD_CHILD_BAN = new RegExp("(^|[^a-z0-9])(" + SD_CHILD_BAN_TERMS.join("|") + ")(?=$|[^a-z0-9])");
/* everyday phrases removed before the check, so their words do not count ("nu-pieds", "pieds nus": barefoot) */
var SD_CHILD_ALLOW = /(^|[^a-z0-9])(nu-pieds|pieds[- ]nus)(?=$|[^a-z0-9])/g;
/* v117 (independent review): look-alike letters and hidden characters no longer get a word past the list: compatibility forms folded (full-width,
   ligatures, styled letters), accents and invisible characters (zero-width, soft hyphen, joiners) removed, dashes, quotes and spaces made plain;
   a letter still outside plain ASCII after that (Cyrillic, Greek...) refuses the text */
function sdChildNorm(x) {
  return String(x || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g, "")
    .replace(/[\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180b-\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\ufe00-\ufe0f\ufeff\uffa0]/g, "")
    .toLowerCase()
    .replace(/[‐-―−⁃﹘﹣－]/g, "-")
    .replace(/[‘’‚‛′ʼ`´]/g, "'")
    .replace(/[«»“-‟‹›]/g, '"')
    .replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000•‣◦·]/g, " ")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss")
    .replace(/ø/g, "o")
    .replace(/ł/g, "l")
    .replace(/[đð]/g, "d")
    .replace(/þ/g, "th")
    .replace(/ı/g, "i");
}
/* the list is also tested with the hyphens read as spaces and with the hyphens removed ("short-shorts", "taille-basse", "tube-top") */
function sdChildOk(x) {
  var s = sdChildNorm(x).replace(SD_CHILD_ALLOW, "$1 ");
  return !/[^\x00-\x7e]/.test(s) && !SD_CHILD_BAN.test(s) && !SD_CHILD_BAN.test(s.replace(/-/g, " ")) && !SD_CHILD_BAN.test(s.replace(/-/g, ""));
}
/* v117: typed text of a child, also read with every non-letter removed, so spaced or dotted letters ("b-i-k-i-n-i", "s e x y") and glued words
   ("shortshorts", "croptop") are caught */
var SD_CHILD_COMPACT = /bikini|monokini|tankini|lingerie|underwear|underpant|undies|thong|gstring|nude|naked|nudit|topless|shirtless|sexy|sexi|sexual|sexuel|erotic|erotiq|seduct|seduis|lolita|nymph|swimsuit|swimwear|bathingsuit|maillotdebain|croptop|lipstick|lipgloss|makeup|maquill|mascara|eyeliner|eyeshadow|nailpolish|stiletto|highheel|soutiengorge|sousvetement|nuisette|fishnet|resille|bodycon|microshort|microskirt|minijupe|miniskirt|minishort|minidress|minirobe|hotpant|seethrough|seethru|lowrise|taillebasse|shortshort|bootyshort|tubetop|negligee|jockstrap|bralette|jarretel|garter|corset|bustier|catsuit|plunge|decollete|cleavage|strapless|backless|offshoulder|offtheshoulder|spaghetti|halter|bandeau|fetish|bondage|aguich|provocan|sultry|flirt|busty|voluptu|curvy|hourglass|kohl|khol|skintight|latex|birthdaysuit|birthdayssuit|clothesless|clothingless|outfitless|pantsless|trouserless|trousersless|jeansless|dressless|bottomless|skirtless|shortsless/;
/* v117 (three independent reviews: a block list cannot cover free text, and allowed words combine): a child's typed text is accepted
   only when every word is a known word of its field, English or French: the outfit (the single text and the Haut, Bas, Chaussures,
   Accessoires fields), the hair (style and color), the skin, the eyes, the marks, the current state and the origin each have their own
   short list; the name takes any word but no function word, clothing word or word of the name list below, in at most 4 words. One
   unknown word refuses the whole field and the red note names it. The block list and the compact reading stay a second gate. Function
   words never take a plural or feminine ending ("less" is not "les"); "for" and "of" are not outfit words ("a ribbon for a top"); an
   accessory word before a garment ("a scarf skirt"), a garment made "of" an accessory, and "un", "de" or "dis" before an undoing verb
   ("un-buttoned") are refused. Left out of the outfit on purpose: short, mini, micro, tiny, small, little, very, petit, cropped, low,
   deep, v, strap, lace, back, open, bare, cut, tight, fitted, slim, skinny, thin, sheer, wide, heavy, body, skin, neck, knee, front,
   tied, under, up, down, off, nothing, no, without, only, sans, sous, court, satin, silk, mesh, tulle, rubber, leather, straw, nylon,
   padded, pants, jumpsuit, numbers, wedding, robe and chemise alone (bathrobe and lingerie in English), the words for the child itself,
   swim, bath, bed and night words, makeup, heels. Rubber, leather, straw, pants, robe and chemise come back only in fixed phrases
   (rubber boots, leather shoes, straw hat, cargo pants, une robe, une chemise). */
function sdChildDict(x) {
  var o = Object.create(null);
  x.split(" ").forEach(function (w) {
    w && (o[w] = !0);
  });
  return o;
}
var SD_CHILD_FN = sdChildDict(
  "a an the and or with over in on at to by its it " +
  "his her their matching same plus s un une des de du d la " +
  "le les l et ou avec sur en au aux par son sa " +
  "ses one two three deux trois "
),
  SD_CHILD_COLORS =   "red blue green yellow orange purple violet pink white black grey gray brown beige " +
  "navy cream ivory khaki olive teal turquoise maroon burgundy lilac lavender mint coral mustard " +
  "camel denim light dark pale bright pastel neon multicolored multicoloured colorful colourful rainbow gold " +
  "golden silver offwhite color colour colored coloured rouge bleu vert jaune rose blanc blanche " +
  "noir gris marron brun marine kaki bordeaux clair fonce vif dore argente multicolore couleur " +
  "arcenciel ",
  SD_CHILD_GARM =   "worn wearing wears rolled zipped buttoned tucked untucked layered cuffed fastened lined trim trimmed " +
  "sleeve sleeves sleeveless longsleeved shortsleeved collar collared crewneck turtleneck hood hooded hoodup pocket pockets " +
  "button buttons zip zipper zipup buttonup shoelaces sole soles brim cuff cuffs patch patches " +
  "badge logo print printed pompom pompon drawstring frills frill ruffle ruffles puff smocked sash " +
  "toggle toggles crest capuche col manche manches mancheslongues manchescourtes poche poches bouton boutons fermeture " +
  "eclair lacets semelle scratch velcro shirt tshirt tee top tanktop blouse polo sweater jumper " +
  "pullover sweatshirt hoodie cardigan jacket coat raincoat anorak parka windbreaker duffle bomber blazer fleece " +
  "gilet waistcoat bodywarmer downjacket puffer overalls dungarees dress skirt kilt pinafore tunic jeans jean " +
  "trousers joggers sweatpants tracksuit shorts bermuda cargo chinos corduroys corduroy leggings tights socks uniform " +
  "suit costume apron poncho cape kit jersey snowsuit skisuit hivisvest gi hanbok dirndl boubou " +
  "qipao shoes shoe sneakers trainers boots boot wellies wellie wellington gumboot sandals sandal slippers " +
  "loafers clogs flats maryjanes moccasins rainboot cleats nonslip hightop espadrille hat cap beanie beret " +
  "bobble sunhat scarf gloves mittens backpack bag satchel crossbody belt glasses sunglasses skigoggles frames " +
  "frame headband hairclip bow bowtie ribbon watch wristwatch umbrella helmet earmuffs earflaps bandana tie " +
  "jewelry jewellery discreet necklace bracelet crown tiara bob bucket keyring lunchbox mask wings eyepatch " +
  "chemisier pull sweat veste blouson manteau doudoune impermeable cire kway salopette jupe jupeculotte tunique " +
  "pantalon jogging survetement legging collant chaussette chaussure baskets basket botte bottine sandale nupieds piedsnus " +
  "barefoot chausson mocassin sabot tablier uniforme couronne debardeur haut maillotdesport crampon casquette bonnet chapeau " +
  "echarpe foulard gant moufle sac sacados cartable ceinture lunettes soleil serretete barrette noeud ruban " +
  "montre collier bijou bijoux parapluie casque deguisement mariniere caban cagoule cotton wool woolen woollen " +
  "woolly knit knitted linen canvas suede waterproof quilted puffy fluffy faux fur felt tweed " +
  "flannel velvet sequins sequined coton laine polaire velours cotele lin daim toile tricot tricote " +
  "feutre matelasse flanelle fourre ",
  SD_CHILD_GARMD = sdChildDict(SD_CHILD_GARM),
  /* clothing words that are also common names or places (Jean, Bob, Kit, Jersey): allowed in a name */
  SD_CHILD_NAMEOK = sdChildDict("jean bob kit jersey polo"),
  /* words a name never holds: clothing words the outfit list itself refuses, and words that sexualize */
  SD_CHILD_LABELNO = sdChildDict("heel heels talon talons string strings vernis voile bas transparent transparente lip lips nail nails skin body hot hottie babe babes daddy sugar lover kitten tease doll toy plaything slave mistress pet sexy"),
  /* the word list of each child field */
  SD_CHILD_V = {
    wear: sdChildDict(SD_CHILD_COLORS + SD_CHILD_GARM +
  "striped stripes stripe plaid tartan checked checkered check gingham polka dots dot dotted spotted " +
  "spots floral flowery flower patterned pattern camo camouflage graphic star heart dinosaur unicorn rocket " +
  "cartoon character cat bear lion fox tiger shark pumpkin raye rayure carreaux pois fleuri " +
  "fleur imprime motif etoile coeur dinosaure licorne ecossais vichy brode embroidered plain simple solid " +
  "everyday casual comfortable cozy cosy warm soft thick chunky big large long loose baggy " +
  "oversized straight relaxed regular classic smart neat clean new old faded round raw kneehigh " +
  "kneelength longlength ankle wideleg straightleg pleated favorite favourite outfit clothes clothing tenue vetement " +
  "habit left right wrist steel metal rolledsleeves backwards varsity uni ample grand grande longue " +
  "chaud chaude epais epaisse confortable decontracte neuf nouveau rond ronde doux douce droit droite " +
  "classique delave plisse plat envers lumineux lumineuse peinture school sports sport sporty outdoor winter " +
  "summer spring autumn fall rain rainy snow ski hiking running football soccer rugby basketball " +
  "baseball tennis party birthday christmas holiday weekend halloween communion judo karate ecole scolaire ete " +
  "hiver printemps automne pluie neige fete anniversaire noel randonnee foot pirate knight astronaut wizard " +
  "witch fairy superhero skeleton princess explorer cowboy armour armor sailor police firefighter doctor chef " +
  "chevalier astronaute sorcier sorciere fee princesse explorateur armure pompier "),
    hair: sdChildDict(SD_CHILD_COLORS +
  "of hair hairs braid braids braided plait plaits plaited pigtail pigtails ponytail ponytails bun " +
  "buns knot knots topknot curl curls curly curled wavy wave waves straight frizzy fluffy " +
  "messy tidy neat short long medium mid length shoulder shoulders chin ear ears jaw " +
  "jawline nape cut bob fringe bangs side sides part parting parted middle center centre " +
  "afro cornrows locs dreadlocks twists twisted coily coils puffs puff spiky spikes buzzcut crewcut " +
  "bowlcut pixiecut pixie mullet babyhairs tied loose loosely pulled back behind tucked clip clips " +
  "hairclip headband ribbon ribbons bow bows elastic elastics scrunchie scrunchies bead beads thick thin " +
  "fine volume voluminous layered layers natural slightly bit swept brushed combed gelled cowlick half " +
  "up down high low double single french dutch fishtail crown framing forehead tousled tangled " +
  "unruly sleek shiny silky soft tips tip ends roots highlights streaks blonde blond brunette " +
  "chestnut auburn ginger copper strawberry honey ash ashy platinum sandy jet mousy dirty cheveux " +
  "tresse natte couette queue cheval chignon frange raie cote milieu boucle frise ondule raide " +
  "lisse attache detache court courte courts longs longue mi carre degrade ebouriffe bataille pince " +
  "barrette elastique noeud ruban serretete epais epaisse fin fine naturel releve tire arriere oreille " +
  "oreilles epaule epaules menton nuque haute basse souple brillant chatain roux rousse cuivre miel " +
  "cendre venitien meches reflets pointes racines africain "),
    skin: sdChildDict(SD_CHILD_COLORS +
  "of skin tone tones toned complexion fair medium tan deep warm cool neutral undertone " +
  "undertones porcelain peach peachy rosy freckled freckles ebony umber chestnut honey caramel bronze ruddy " +
  "even natural matte cheeks peau teint carnation claire mate doree hale halee brune foncee " +
  "noire metisse rosee taches tache rousseur ivoire peche caramel miel ambre cuivre naturel naturelle " +
  "unie joues "),
    eyes: sdChildDict(SD_CHILD_COLORS +
  "of eyes eye hazel amber flecks flecked fleck ring rim speckled heterochromia each deep " +
  "almond round large left right yeux oeil noisette vairons ambre reflets cercle gauche droit " +
  "droite chaque "),
    marks: sdChildDict(SD_CHILD_COLORS +
  "of backof freckle freckles freckled mole moles birthmark birthmarks scar scars scarred dimple dimples " +
  "gap tooth teeth missing babytooth chipped braces hearingaid vitiligo eczema cleftlip scratch scratches bruise " +
  "bruises bruised graze grazes grazed plaster plasters bandage bandages band aid cast sling spot " +
  "spots chickenpox rash cheek cheeks chin nose forehead eyebrow eyebrows brow jaw ear ears " +
  "earlobe temple neck head hand hands wrist wrists arm arms forearm forearms elbow elbows " +
  "knee knees shin shins finger fingers thumb face left right side both near above " +
  "below corner bridge middle centre center tip edge across along small little tiny faint " +
  "round thin long short wide narrow old healed fresh few several cluster sprinkle sprinkled " +
  "scattered slight slightly each tache taches rousseur grain grains beaute cicatrice cicatrices fossette fossettes " +
  "egratignure egratignures bleus pansement pansements platre dent dents manquante appareil dentaire joue joues menton " +
  "nez front sourcil sourcils oreille oreilles tempe cou tete main mains poignet coude coudes " +
  "genou genoux tibia doigt doigts pouce visage gauche droite droit cote pres dessus milieu " +
  "coin bout petit petite fine leger legere quelques plusieurs ancienne "),
    state: sdChildDict(SD_CHILD_COLORS +
  "of muddy mud dirty dirt dust dusty tired messy tousled scruffy smudge smudged smudges " +
  "grass stain stains stained paint chalk crumbs chocolate jam icecream runnynose outofbreath fullof crying " +
  "rain raindrops snow snowflakes snowy windswept windblown wind leaf leaves twig twigs scratch scratches " +
  "scraped scrape grazed graze bruise bruised plaster bandage around knee knees elbow elbows hand " +
  "hands face cheek cheeks nose forehead chin forearm arm arms hair sleeve sleeves shoes " +
  "boots trousers jeans jacket coat hoodie sneakers slightly after playing play playground football game " +
  "park garden school day running left right side both boueux boueuse boue sale sales " +
  "poussiere poussiereux fatigue fatiguee ebouriffe decoiffe decoiffee tache taches herbe peinture craie miettes chocolat " +
  "confiture pluie gouttes neige vent feuilles feuille brindilles egratigne egratignure ecorche bleus pansement genou " +
  "genoux coude coudes mains main visage joues joue nez front menton cheveux jean chaussures " +
  "bottes apres jeu jouer recreation parc jardin ecole course essouffle gauche droite droit autour "),
    orig: sdChildDict("and of from the half mixed et de d du des origin origine descent heritage franco anglo sino indo hispano italo germano luso jersey " +
  "afghan albanian algerian american andorran angolan antiguan argentine argentinian armenian australian austrian azerbaijani azeri " +
  "bahamian bahraini bangladeshi barbadian belarusian belgian belizean beninese bhutanese bolivian bosnian botswanan brazilian british " +
  "bruneian bulgarian burkinabe burmese burundian cambodian cameroonian canadian chadian chilean chinese colombian comorian congolese " +
  "croatian cuban cypriot czech danish djiboutian dominican dutch ecuadorian egyptian emirati english eritrean estonian " +
  "ethiopian fijian filipino filipina finnish french gabonese gambian georgian german ghanaian greek grenadian guatemalan " +
  "guinean guyanese haitian honduran hungarian icelandic indian indonesian iranian iraqi irish israeli italian ivorian " +
  "jamaican japanese jordanian kazakh kenyan korean kosovar kuwaiti kyrgyz lao laotian latvian lebanese liberian " +
  "libyan lithuanian luxembourgish malagasy malawian malaysian maldivian malian maltese mauritanian mauritian mexican moldovan mongolian " +
  "montenegrin moroccan mozambican namibian nepalese nepali nicaraguan nigerian nigerien norwegian omani pakistani palestinian panamanian " +
  "papuan paraguayan peruvian polish portuguese qatari romanian russian rwandan salvadoran samoan saudi scottish senegalese " +
  "serbian singaporean slovak slovakian slovenian somali spanish sudanese surinamese swedish swiss syrian taiwanese tajik " +
  "tanzanian thai tibetan togolese tongan trinidadian tunisian turkish turkmen ugandan ukrainian uruguayan uzbek venezuelan " +
  "vietnamese welsh yemeni zambian zimbabwean african american asian european arab arabic berber amazigh kabyle " +
  "kurdish basque breton corsican catalan sicilian romani inuit maori aboriginal polynesian hawaiian tahitian melanesian " +
  "caribbean antillean guadeloupean martinican reunionese creole latino latina hispanic scandinavian nordic slavic mediterranean balkan " +
  "baltic celtic persian punjabi tamil bengali gujarati hmong cantonese han yoruba igbo hausa wolof " +
  "fulani zulu xhosa ashanti somali amhara tigrayan north south east west central northern southern " +
  "eastern western middle sub saharan indies coast ivory sri lankan costa rican puerto rican " +
  "south korea leone sierra cape verdean new zealand zealander francais algerien marocain tunisien senegalais " +
  "malien ivoirien camerounais congolais comorien malgache haitien antillais reunionnais guadeloupeen martiniquais guyanais berbere arabe " +
  "turc turque portugais espagnol italien allemand anglais belge suisse polonais roumain russe ukrainien chinois " +
  "japonais coreen vietnamien cambodgien laotien thai indien pakistanais bangladais libanais syrien iranien irakien egyptien " +
  "ethiopien erythreen somalien nigerian ghaneen bresilien mexicain colombien peruvien chilien argentin cubain americain canadien " +
  "quebecois armenien georgien grec grecque serbe croate bosniaque albanais kurde afro metis asiatique africain " +
  "europeen maghrebin nord sud est ouest moyen orient orientale oriental caribeen tahitien polynesien kanak " +
  "france algeria algerie morocco maroc tunisia tunisie senegal mali ivoire cameroon cameroun congo comoros comores madagascar haiti martinique guadeloupe reunion guyana guyane mayotte philippines japan japon korea coree china chine vietnam cambodia cambodge laos thailand thailande india inde pakistan bangladesh lebanon liban syria syrie iran iraq irak egypt egypte ethiopia ethiopie eritrea erythree somalia somalie nigeria ghana kenya brazil bresil mexico mexique colombia colombie peru perou chile chili argentina argentine cuba usa america amerique canada quebec armenia armenie georgia georgie greece grece serbia serbie croatia croatie bosnia bosnie albania albanie kurdistan turkey turquie portugal spain espagne italy italie germany allemagne england angleterre britain uk ireland irlande scotland ecosse wales belgium belgique switzerland suisse poland pologne romania roumanie russia russie ukraine sweden suede norway norvege denmark danemark finland finlande netherlands holland hollande pays bas israel jordan jordanie palestine yemen oman qatar saudi arabia arabie emirates taiwan mongolia mongolie nepal tibet indonesia indonesie malaysia malaisie singapore singapour australia australie zealand zelande samoa tonga fiji tahiti polynesia polynesie caledonie caledonia "),
  },
  /* the name: the function words it may hold */
  SD_CHILD_NAMEP = sdChildDict("de du d la le l van von el al ben mc mac da di dos das del della an"),
  /* the outfit: an accessory word before a garment, a garment made of an accessory, an undoing verb after un, de, dis */
  SD_CHILD_ACC = sdChildDict("bandana scarf belt ribbon headband bow tie sash hat cap beanie beret glasses sunglasses gloves mittens bag backpack satchel necklace bracelet watch wristwatch frames frame mask wings crown tiara keyring lunchbox umbrella helmet earmuffs earflaps foulard echarpe ceinture ruban noeud chapeau casquette bonnet lunettes gant moufle sac collier montre couronne serretete barrette"),
  SD_CHILD_BODY = sdChildDict("top tops tanktop tshirt tee shirt blouse skirt shorts dress trousers kilt pinafore tunic overalls dungarees bermuda leggings tights haut jupe pantalon debardeur chemisier tunique salopette legging collant"),
  SD_CHILD_UNDO = sdChildDict("button buttoned buttons zip zipped zips zipping fasten fastened tie tied dress dressed do done lace laced buckle buckled tuck tucked clothe clothed robe robed cover covered wrap wrapped hook hooked snap snapped boutonne zippe attache habille");
/* compound words read as one before the check ("t-shirt", "sac à dos", "un short", "manches courtes": only these uses of the risky words pass) */
var SD_CHILD_PHR = [
  [/\b(t|tee)[- ]?shirts?\b/g, " tshirt "],
  [/\bsweat[- ]shirts?\b/g, " sweatshirt "],
  [/\b(short|long)[- ]sleeve[sd]?\b/g, " $1sleeved "],
  [/\bmanches? courtes?\b/g, " manchescourtes "],
  [/\bmanches? longues?\b/g, " mancheslongues "],
  [/\bknee[- ]?(high|length)s?\b/g, " knee$1 "],
  [/\b(ankle|mid|calf|full|floor)[- ]length\b/g, " longlength "],
  [/\bcrew[- ]?necks?\b/g, " crewneck "],
  [/\bturtle[- ]?necks?\b/g, " turtleneck "],
  [/\bcols? roules?\b/g, " col turtleneck "],
  [/\blace[- ]?ups? (shoes|boots|sneakers|trainers|bottines|chaussures|baskets)\b/g, " $1 "],
  [/\bshoe[- ]?laces?\b/g, " shoelaces "],
  [/\bslip[- ]?ons? (shoes|sneakers|trainers|baskets|chaussures|loafers)\b/g, " $1 "],
  [/\bnon[- ]?slip\b/g, " nonslip "],
  [/\bzip[- ]?ups?\b/g, " zipup "],
  [/\bbutton[- ]?(ups?|downs?)\b/g, " buttonup "],
  [/\bhigh[- ]?tops?\b/g, " hightop "],
  [/\bpull[- ]?overs?\b/g, " pullover "],
  [/\b(wide|straight)[- ]legs?(ged)?\b/g, " $1leg "],
  [/\btank[- ]?tops?\b/g, " tanktop "],
  [/\bmary[- ]?janes?\b/g, " maryjanes "],
  [/\bnu[- ]?pieds\b/g, " nupieds "],
  [/\bpieds[- ]nus\b/g, " piedsnus "],
  [/\bbare[- ]?f(oo|ee)t(ed)?\b/g, " barefoot "],
  [/\bsacs?[- ]a[- ]dos\b/g, " sacados "],
  [/\bserre[- ]?tetes?\b/g, " serretete "],
  [/\bk[- ]?way\b/g, " kway "],
  [/\bjupes?[- ]culottes?\b/g, " jupeculotte "],
  [/\bmaillots? de (foot|football|rugby|basket|basketball|sport|cyclisme|velo|hockey|handball)\b/g, " maillotdesport "],
  /* "un short" is French for shorts, never before another garment ("un short skirt") */
  [/\b(un|le|ce|mon|ton|son|leur|du) short\b(?! (skirt|dress|top|tops|tshirt|shirt|blouse|jupe|robe|haut|kilt|tunic|pinafore)\b)/g, " $1 shorts "],
  [/\barc[- ]en[- ]ciel\b/g, " arcenciel "],
  [/\bpom[- ]?poms?\b/g, " pompom "],
  [/\bhair[- ]?(clips?|bands?|ties?|bows?|slides?|pins?)\b/g, " hairclip "],
  [/\bhead[- ]?bands?\b/g, " headband "],
  [/\bear[- ]?muffs?\b/g, " earmuffs "],
  [/\boff[- ]?white\b/g, " offwhite "],
  [/\bsweat[- ]?pants\b/g, " sweatpants "],
  [/\btrack[- ]?suits?\b/g, " tracksuit "],
  [/\bwind[- ]?breakers?\b/g, " windbreaker "],
  [/\bbody[- ]?warmers?\b/g, " bodywarmer "],
  [/\bdown jackets?\b/g, " downjacket "],
  [/\bbow[- ]?ties?\b/g, " bowtie "],
  [/\bballet[- ]flats?\b/g, " flats "],
  [/\bballerines\b/g, " flats "],
  [/\blow[- ]?(cut|top)s? (sneakers|shoes|trainers|boots|baskets|socks)\b/g, " $2 "],
  [/\b((?:sun)?glasses) with (transparent|clear) frames?\b/g, " $1 with frames "],
  /* rubber, leather, straw only for shoes and a few accessories; pants only as trousers; robe and chemise only as French (une robe, une chemise) */
  [/\brubber (boots?|soles?|wellies|clogs)\b/g, " $1 "],
  [/\b(bottes?|semelles?) en caoutchouc\b/g, " $1 "],
  [/\bleather (shoes?|boots?|sneakers|jackets?|belts?|bags?|satchels?|gloves|sandals|loafers|moccasins|backpacks?)\b/g, " $1 "],
  [/\b(chaussures|bottes?|bottines?|veste|blouson|ceinture|sac|cartable|sandales|gants|mocassins) en cuir\b/g, " $1 "],
  [/\bpadded (jackets?|coats?|gilets?)\b/g, " $1 "],
  [/\bstraw (hats?|bags?)\b/g, " $1 "],
  [/\b(chapeaux?|sacs?) de paille\b/g, " $1 "],
  [/\b(cargo|track|rain|snow|ski|jogging|corduroy|denim|khaki|linen|cotton|wool|fleece|hiking|waterproof|dress) pants\b/g, " $1 trousers "],
  [/\b(a |one )?pairs? of\b/g, " "],
  [/\b(une|la|ma|ta|sa|cette|leur|des|les|ses) robes?\b/g, " $1 dress "],
  [/\b(une|la|ma|ta|sa|cette|leur|des|les|ses) chemises?\b/g, " $1 shirt "],
  [/\bchaussures? vernies?\b/g, " chaussures "],
  [/\bsuper[- ]?(heros?|heroes)\b/g, " superhero "],
  [/\b(kimonos? (de )?(judo|karate)|(judo|karate) kimonos?)\b/g, " judo gi "],
  [/\bsun[- ]?hats?\b/g, " sunhat "],
  [/\bski goggles\b/g, " skigoggles "],
  [/\bear[- ]?flaps?\b/g, " earflaps "],
  [/\bhood (is )?up\b/g, " hoodup "],
  [/\b(rolled[- ]up sleeves|sleeves rolled up)\b/g, " rolledsleeves "],
  [/\b(high|hi)[- ]?vis(ibility)?( (vests?|jackets?))?\b/g, " hivisvest "],
  [/\b(combinaisons? de ski|ski[- ]?suits?)\b/g, " skisuit "],
  [/\bcombinaisons? de pluie\b/g, " raincoat "],
  [/\bsnow[- ]?suits?\b/g, " snowsuit "],
  [/\bbandeau dans les cheveux\b/g, " headband "],
  [/\blunch[- ]?box(es)?\b/g, " lunchbox "],
  [/\bkey[- ]?rings?\b/g, " keyring "],
  [/\beye[- ]?patch(es)?\b/g, " eyepatch "],
  [/\bpeter pan collars?\b/g, " collar "],
  /* hair */
  [/\b(buzz|crew|bowl|pixie)[- ]?cuts?\b/g, " $1cut "],
  [/\bspace buns\b/g, " buns "],
  [/\bbox braids\b/g, " braids "],
  [/\bbantu knots\b/g, " knots "],
  [/\btop[- ]?knots?\b/g, " topknot "],
  [/\bbaby hairs?\b/g, " babyhairs "],
  [/\bcarre plongeant\b/g, " carre "],
  /* marks: "the back of the left hand" (never the back itself) */
  [/\bback of (?=(the |his |her )?(left |right )?(hands?|neck|knees?|wrists?|fingers?|head)\b)/g, " backof "],
  [/\bdos de (la|sa) main\b/g, " backof main "],
  [/\bport[- ]wine stains?\b/g, " birthmark "],
  [/\bcleft lip\b/g, " cleftlip "],
  [/\bappareil dentaire\b/g, " braces "],
  [/\b(dents? de lait|baby (tooth|teeth))\b/g, " babytooth "],
  [/\bhearing aids?\b/g, " hearingaid "],
  /* state */
  [/\bice[- ]?cream\b/g, " icecream "],
  [/\brunny nose\b/g, " runnynose "],
  [/\bout of breath\b/g, " outofbreath "],
  [/\bfull of\b/g, " fullof "],
];
/* a word of the field list D: as written, or a list word with a plural or feminine ending (never a function word with one) */
function sdChildKnown(w, D) {
  return (
    !!SD_CHILD_FN[w] ||
    !!(D[w] || (/s$/.test(w) && D[w.slice(0, -1)]) || (/es$/.test(w) && D[w.slice(0, -2)]) || (/e$/.test(w) && D[w.slice(0, -1)]) || (/x$/.test(w) && D[w.slice(0, -1)]) ||
      (/nnes?$/.test(w) && D[w.replace(/nes?$/, "")]))
  );
}
/* the words of a typed text, compound words joined (a word with a letter outside plain ASCII stays whole, and is unknown) */
function sdChildWords(x) {
  var s = " " + sdChildNorm(x) + " ";
  SD_CHILD_PHR.forEach(function (p) {
    s = s.replace(p[0], p[1]);
  });
  return s.split(/[^a-z0-9\u0080-\uffff]+/).filter(Boolean);
}
function sdChildSing(w, D) {
  return D[w] || (/s$/.test(w) && D[w.slice(0, -1)]);
}
/* the unknown words of a typed text for the field list D, in order, once each, then the refused combinations */
function sdChildUnknown(x, D) {
  D = D || SD_CHILD_V.wear;
  var u = [],
    w = sdChildWords(x),
    put = function (v) {
      u.indexOf(v) < 0 && u.push(v);
    };
  w.forEach(function (v, i) {
    sdChildKnown(v, D) || put(v);
    ("un" === v || "de" === v || "dis" === v) && w[i + 1] && SD_CHILD_UNDO[w[i + 1]] && put(v + " " + w[i + 1]);
    if (D !== SD_CHILD_V.wear) return;
    var n1 = w[i + 1] || "",
      n2 = w[i + 2] || "",
      n3 = w[i + 3] || "";
    (sdChildSing(v, SD_CHILD_ACC) || "shorts" === v) && sdChildSing(n1, SD_CHILD_BODY) && put(v + " " + n1);
    sdChildSing(v, SD_CHILD_BODY) && /^(en|in|de|d|of|from|made)$/.test(n1) && (sdChildSing(n2, SD_CHILD_ACC) || (SD_CHILD_V.wear[n2] && sdChildSing(n3, SD_CHILD_ACC))) && put(v + " " + n1 + " " + n2);
  });
  return u;
}
/* the name: at most 4 words, letters only, no function word but its particles, no clothing word, no word of SD_CHILD_LABELNO */
function sdChildLabelBad(x, P) {
  var w = sdChildNorm(x).split(/[^a-z0-9\u0080-\uffff]+/).filter(Boolean),
    u = [];
  w.forEach(function (v) {
    (!/^[a-z]+$/.test(v) || (SD_CHILD_FN[v] && !P[v]) || SD_CHILD_LABELNO[v] || (!SD_CHILD_NAMEOK[v] && (SD_CHILD_GARMD[v] || (/s$/.test(v) && SD_CHILD_GARMD[v.slice(0, -1)])))) && u.indexOf(v) < 0 && u.push(v);
  });
  w.length > 4 && u.push(w.slice(4).join(" "));
  return u;
}
function sdChildRandomText(x) {
  return /^(random|au hasard|hasard|al[ée]atoire)$/i.test(sdFreeClean(x));
}
/* a typed text of a child: the list on the text as typed, as cleaned for the single text (sdFreeClean) and as sent from a field (t5), the
   compact reading, then the field check: D a word list (sdChildUnknown) or P the particles of a name (sdChildLabelBad); the origin is a
   word list of its own, at most 4 words */
function sdChildTypedOk(x, D, P) {
  var v = [x, sdFreeClean(x), t5(x)];
  return v.every(function (y) {
    return (
      sdChildOk(y) &&
      !SD_CHILD_COMPACT.test(sdChildNorm(y).replace(/[^a-z]/g, "")) &&
      (!D || (!sdChildUnknown(y, D).length && (D !== SD_CHILD_V.orig || sdChildWords(y).length <= 4))) &&
      (!P || !sdChildLabelBad(y, P).length)
    );
  });
}
/* the single text of a child: "random" alone is the plain everyday outfit, as for an adult */
function sdChildFreeOk(x) {
  return sdChildRandomText(x) || sdChildTypedOk(x, SD_CHILD_V.wear);
}
/* free-text fields that reach a child prompt outside the outfit: blanked when they fail the list (prompt state only, via sdG);
   v117 (independent review: they took any word the block list missed, "a wet one-piece", "in pyjamas", "a nose ring"): each with its own
   word list (the origin too), the name with the label rule; the marks and state texts added. With the child's photo, the face and hair
   fields are not used and not reported */
var SD_CHILD_FREE = [
  ["hairStyle", "cheveux", "hair"],
  ["hairColorCustom", "cheveux", "hair"],
  ["skinCustom", "visage", "skin"],
  ["eyeColorCustom", "visage", "eyes"],
  ["originDetail", "visage", "orig"],
  ["marks", "signes", "marks"],
  ["eState", "état du moment", "state"],
];
/* a child field that reaches the prompts: with the child's photo, the face and hair come from it */
function sdChildFreeUsed(t, f) {
  return !(sdChildPh(t) && ("visage" === f[1] || "cheveux" === f[1]));
}
function sdChildFieldOk(f, x) {
  return sdChildTypedOk(x, f[2] ? SD_CHILD_V[f[2]] : null, "name" === f[3] ? SD_CHILD_NAMEP : null);
}
/* v117: the outfit fields of the Tenue tab (Haut, Bas, Chaussures, Accessoires), for a child only with known clothing words (sdChildWearOk) */
var SD_CHILD_WEAR = ["top", "bottom", "shoes", "acc"];
function sdChildClean(t) {
  var o = null;
  SD_CHILD_FREE.forEach(function (f) {
    sdChildFieldOk(f, t[f[0]]) || ((o = o || Object.assign({}, t)), (o[f[0]] = ""));
  });
  return o || t;
}
/* the outfit fields of a child, after "random" became a child garment (sdRndOutfit): one field refused and the whole outfit is the safe one */
function sdChildWearOk(t) {
  return SD_CHILD_WEAR.every(function (k) {
    return sdChildTypedOk(t[k], SD_CHILD_V.wear);
  });
}
/* v117 (independent review: the adult's single text dressed the child): a child has its own switch and text (childOutfitFree, childOutfitText),
   read in place of the adult's; never for a baby */
function sdChildMap(t) {
  return sdChild(t) ? Object.assign({}, t, { outfitFree: !sdBaby(t) && !!t.childOutfitFree, outfitText: sdBaby(t) ? "" : String(t.childOutfitText || "") }) : t;
}
/* the switch of the Tenue tab box, on the saved state */
function sdFreeSw(t) {
  return sdChild(t) ? !sdBaby(t) && !!t.childOutfitFree : !!t.outfitFree;
}
/* the words of a child's typed texts that are not accepted, for the red note: the unknown words; when there are none, what the list found;
   when it found nothing, what the compact reading found (v117 review: not every form of the same word) */
function sdChildBadWords(t) {
  var u = [],
    put = function (w) {
      w && u.indexOf(w) < 0 && u.push(w);
    },
    add = function (x, D, P) {
      if (sdChildTypedOk(x, D, P)) return;
      var n0 = u.length;
      [x, sdFreeClean(x), t5(x)].forEach(function (y) {
        (D ? sdChildUnknown(y, D) : []).concat(P ? sdChildLabelBad(y, P) : []).forEach(put);
      });
      if (u.length > n0) return;
      [x, sdFreeClean(x)].forEach(function (y) {
        var n = sdChildNorm(y).replace(SD_CHILD_ALLOW, "$1 "),
          m = SD_CHILD_BAN.exec(n) || SD_CHILD_BAN.exec(n.replace(/-/g, " ")) || SD_CHILD_BAN.exec(n.replace(/-/g, ""));
        put(m && m[2]);
      });
      if (u.length > n0) return;
      [x, sdFreeClean(x)].forEach(function (y) {
        var c = SD_CHILD_COMPACT.exec(sdChildNorm(y).replace(/[^a-z]/g, ""));
        put(c && c[0]);
      });
    };
  sdFreeSw(t)
    ? sdChildRandomText(t.childOutfitText) || add(t.childOutfitText, SD_CHILD_V.wear)
    : SD_CHILD_WEAR.forEach(function (k) {
        add(sdRndOutfit(t)[k], SD_CHILD_V.wear);
      });
  SD_CHILD_FREE.forEach(function (f) {
    sdChildFreeUsed(t, f) && add(t[f[0]], f[2] ? SD_CHILD_V[f[2]] : null, "name" === f[3] ? SD_CHILD_NAMEP : null);
  });
  return u.slice(0, 8);
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
  if (!sdChildOk(o) || (!sdFreeOn() && !sdChildWearOk(e))) return "a T-shirt, jeans and sneakers in plain solid colors";
  /* v117: the free outfit text of a child, completed with plain everyday clothes for anything it does not name */
  return sdFreeText()
    ? o + (sdChildHl(e) ? " (anything worn on the head or the face stays outside the frame)" : "") + "; anything this description does not name is plain everyday clothing, so the child is fully dressed"
    : o;
}
/* v108: the head sheet is cropped at the base of the neck, the shoulders and clothes out of frame: Seedance took the top of the outfit from the head sheet */
function sdChildCrop(gpt) {
  var lg = sdHairPast();
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
  if (!sdChildOk(sdChildRawOutfit(e)) || (!sdFreeOn() && !sdChildWearOk(e))) return "";
  /* v117 (independent review: the whole text was pasted on the head sheet): only the parts of the single text worn on the head or the face,
     cut at commas, semicolons and "and", "with", "et", "avec"; nothing worn at the neck */
  if (sdFreeOn()) return sdChildHeadParts(sdFreeText());
  var a = tZ.accOpts
      .filter(function (o) {
        return (e.accSel || []).indexOf(o[0]) >= 0 && SD_CHILD_HEADACC.indexOf(o[0]) >= 0;
      })
      .map(function (o) {
        return o[2];
      }),
    x = sdChildHeadParts(t5(e.acc));
  /* v117 (third review): the Accessoires text cut in the same way, never pasted whole */
  x && a.push(x);
  return a.join(", ");
}
/* the head items of an outfit text: cut at commas, semicolons, "and", "over", "under", "et", "plus", "sur", "sous"; a "with" or "avec" part
   that names a body garment is cut off too ("a cap with a dinosaur on it" stays whole); nothing worn at the neck, no body garment */
var SD_CHILD_BODYRX = /\b(t-?shirts?|tee|tops?|tank ?tops?|shirts?|blouse|dress(es)?|robe|jacket|coat|hoodie|sweater|jumper|cardigan|jeans|trousers|pants|skirt|shorts|leggings|tights|socks|boots|shoes|sneakers|sandals|uniform|suit|costume|pull|veste|manteau|jupe|pantalon|chaussures|baskets|bottes)\b/i;
function sdChildHeadParts(fx) {
  return String(fx || "")
    .split(/\s*[,;:]\s*|\s+(?:and|over|under|et|plus|sur|sous)\s+/i)
    .map(function (x) {
      var m = /\s+(?:with|avec)\s+/i.exec(x);
      return m && SD_CHILD_BODYRX.test(x.slice(m.index)) ? x.slice(0, m.index) : x;
    })
    .filter(function (x) {
      return /glass|\bhats?\b|\bcaps?\b|beanie|beret|helmet|head ?band|hair ?clip|\bbob\b|\bcrown\b|bandana|earmuff|casquette|lunettes|bonnet|chapeau|serre-?t[êe]te|couronne|barrette|casque/i.test(x) &&
        !/scarf|necklace|choker|\bhood|collar|earring|piercing|jewel|[ée]charpe|foulard|collier|capuche|\bcol\b|bijou/i.test(x) &&
        !SD_CHILD_BODYRX.test(x);
    })
    .join(", ");
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
  sdFreeSw(t)
    ? sdChildFreeOk(t.childOutfitText) || d.push("tenue en un seul texte")
    : (sdChildWearOk(sdRndOutfit(t)) && sdChildOk(sdChildRawOutfit(sdChildMap(sdChildOpts(t))))) || d.push("tenue");
  rq(t, function () {
    sdChildOk(rg(!0)) || d.push("signes");
    sdChildOk(rl()) || d.push("état du moment");
  });
  SD_CHILD_FREE.forEach(function (f) {
    !sdChildFreeUsed(t, f) || sdChildFieldOk(f, t[f[0]]) || d.indexOf(f[1]) >= 0 || d.push(f[1]);
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
  if (sdChildPh(e)) return ["photo", sdChildWho(), sdChildMarks()].join("\n");
  return [sdChildWho() + sdChildOrigin(), t7("skin"), sdChildEyes(), ne(), sdChildFace(), sdChildMarks()].join("\n");
}
function sdChildBuild() {
  return (
    { small: "small for " + sdChildPos() + " age", tall: "tall for " + sdChildPos() + " age" }[e.childHeight] ||
    "of average height for " + sdChildPos() + " age"
  ) + ", " + ({ slim: "a slim build", sturdy: "a sturdy build" }[e.childBuild] || "an average build");
}
/* v145 (user: the arms out "pour tous les prompts de création de corps ou personnage en entier"): the adult Seedream text tested on his
   sheet; the other full-body sheets (child, GPT) say the gap, not an angle, so the arms fit their equal panels (GPT checks panel widths;
   the figure includes the head); GPT names the waist, hips and thighs, not "from the armpit down", since its very large bust spreads
   "against the inner arms". The baby sheet keeps its sitting pose: a baby does not stand with its arms out */
var SD_ARMS_OUT = "arms straight and held about 20 degrees out from the body, palms toward the thighs, hands visible: in the front and back views a clear gap of backdrop between each arm and the waist, hips and thighs, the hands well clear of the thighs";
var SD_ARMS_OUT_C = "arms straight and held slightly out from the body, hands visible: in the front and back views a clear gap of backdrop between each arm and the body from the armpit down, the hands inside the panel";
var SD_ARMS_OUT_G = "arms straight and held slightly out from the body, just enough for a clear gap of backdrop between each arm and the waist, hips and thighs in the front and back views, the hands inside the panel";
/* v145 review: the Seedream sheets have no panel-width check (no GENERATION LIMIT) and Seedream draws less than the angle said (about 12
   degrees for 20 on his sheet): "slightly out" could leave no gap; the child sheet of Seedream and the GPT text rewritten for Seedream (3D,
   2D, from a photo; sdGptSdText) say the angle */
var SD_ARMS_OUT_CS = "arms straight and held about 20 degrees out from the body, hands visible: in the front and back views a clear gap of backdrop between each arm and the body from the armpit down, the hands inside the panel";
var SD_ARMS_OUT_GS = "arms straight and held about 20 degrees out from the body, a clear gap of backdrop between each arm and the waist, hips and thighs in the front and back views, the hands inside the panel";
/* v157 (user, on his render: "les bras ne sont pas écartés, pourquoi" (about 11 degrees measured each side for the "about 20 degrees" asked,
   as in v145), then "je dois pouvoir écarter plus l'entrejambe"): "Écart des bras", Marqué by default (the v156 texts are Léger), and
   "Écart des pieds" (hips, as before; shoulders; wide, the A-pose of 3D character references), adults only, both engines. The marked
   arms say a distance the model can see (a hand's width between hand and thigh) on top of the angle; the front and back panels widen
   and the figure shrinks a little to fit (v151 measure), a full 45-degree A-pose does not fit four views in 16:9. Applied last to the
   finished prompts (sdPoseM), as exact replacements of the v156 texts. */
var SD_ARMS_M = [
  [SD_ARMS_OUT, "arms straight and held well out, about 30 degrees, palms toward the thighs: each hand a full hand's width from the outer thigh, a clear wedge of backdrop between each arm and the body from the armpit down in the front and back views"],
  [SD_ARMS_OUT_GS, "arms straight and held well out, about 30 degrees, each hand a full hand's width from the outer thigh, a clear wedge of backdrop between each arm and the waist, hips and thighs in the front and back views, the hands inside the panel"],
  [SD_ARMS_OUT_G, "arms straight and held well out from the body, each hand about a hand's width away from the outer thigh, a clear wedge of backdrop between each arm and the waist, hips and thighs in the front and back views, the hands inside the panel"],
];
var SD_FEET = {
  shoulders: "feet shoulder-width apart",
  wide: "feet set wide, about one and a half shoulder widths apart, legs straight, as in the A-pose of a 3D character reference",
};
/* v157 (user, a Seedream head sheet with "Barbe fournie (3 mois)": "la barbe de 3 mois sur Seedream ça va pas du tout", a beard of about two
   weeks drawn): "about three months" is a time, not something seen, and three other parts of the head line asked for the line of the jaw
   the beard hides (the jaw, the age, the face fat), with "fine" facial hair in the skin line. With "Barbe fournie" or "Barbe longue": the
   jaw said under the beard, its line and the double chin no longer asked to show, the facial hair dense (both engines) */
/* v157b (GPT audit of v157, checked: "Très anguleux" with "Graisse : visage" Marquée said "hollow cheeks" and "plump cheeks", "a sharp
   jawline" and "a soft jawline"): the face fat says the soft tissue, so the angularity keeps the bone: no hollow cheeks from "Légère" up,
   the angular bone structure under the soft tissue and no sharp or crisp jawline from "Visible" up (both engines) */
var SD_ANGLE_FAT = [
  ["a strongly angular, sculpted face: high, sharply defined cheekbones and hollow cheeks and a sharp jawline and chin", "a strongly angular bone structure: high, sharply defined cheekbones and a sharp jawline and chin", "a strongly angular bone structure under the soft tissue: high, sharply defined cheekbones"],
  ["angular, sculpted contours: defined cheekbones with slight hollows beneath them and a crisp jawline", "angular, sculpted contours: defined cheekbones and a crisp jawline", "an angular bone structure under the soft tissue: defined cheekbones"],
];
function sdFaceAngleFat(s) {
  var v = sdFaceFatLv();
  v &&
    SD_ANGLE_FAT.forEach(function (a) {
      s = s.split(a[0]).join(v >= 2 ? a[2] : a[1]);
    });
  return s;
}
function sdBeardFull() {
  return sdBeardOn() && ["full", "long"].indexOf(e.facialHair) >= 0;
}
function sdBeardJaw(s) {
  if (!sdBeardFull()) return s;
  s = s
    .split("full, rounded cheeks and a softer jawline, the face visibly fleshy").join("full, rounded cheeks, the face visibly fleshy")
    .split("a round, fleshy face with plump cheeks, a soft jawline and the start of a double chin").join("a round, fleshy face with plump cheeks above the beard")
    .split("a heavy, fleshy face with full jowls along the jaw and a clear double chin").join("a heavy, fleshy face with full jowls, the beard rounded over a double chin")
    .split(", slightly sagging jawline").join("")
    .split("sagging jawline and neck skin").join("sagging neck skin")
    .split("strong, defined jawline").join("a strong jaw under the beard")
    .split(" with visible corners").join(" under the beard")
    .split(" with softly rounded corners").join(" under the beard")
    .replace(/a clearly defined, (moderately wide|slender) jaw/g, "a $1 jaw under the beard")
    .replace(/a clearly defined jaw(?=[,.;])/g, "a strong jaw under the beard")
    /* v157 review 3: no chin shape asked under a beard that hides it (a mark on the chin set by hand stays) */
    .replace(/, (?:a|an) (?:[a-z-]+,? (?:and )?){0,3}chin(?: of medium (?:projection|size))?(?=[,.;])/g, "")
    .replace(/: (?:a|an) (?:[a-z-]+,? (?:and )?){0,3}chin(?: of medium (?:projection|size))?, /g, ": ")
    .replace(/, a clean,? (?:clearly defined|smooth) line from the jaw to the neck/g, "")
    .replace(/,? and (?:a )?(?:[a-z-]+,? ){0,2}jawline(?: and chin)?(?=[,.;:])/g, "")
    .replace(/, (?:a )?(?:[a-z-]+,? ){0,2}jawline(?: and chin)?(?=[,.;:])/g, "")
    .replace(/: (?:a )?(?:[a-z-]+,? ){0,2}jawline(?: and chin)?, /g, ": ")
    .split("fine, natural facial hair texture").join("coarse, dense beard hair, its individual hairs visible");
  return s;
}
/* v157 (user, photos in swimwear: "les poils ne suivent pas les cheveux, on doit pouvoir décider soit cheveux, soit noir, soit autre"):
   "Comme les cheveux" said nothing where no amount of body hair was set, so the faint body hair every sheet asks for came in any color;
   it is now said in the color of the hair when that color is named (not "Auto (âge)", typed by hand, platinum or bald, nor with a photo).
   The peach fuzz of "Duvet" stays pale unless a color is chosen (fine vellus hair) */
function sdHairBodyCol() {
  if ("person" !== e.mode || sdChild(e) || e.photo || !sdBodyHairColOn() || (e.bodyHairColor && "auto" !== e.bodyHairColor)) return "";
  if (t5(e.hairColorCustom) || "bald" === e.hairStyleSel || "auto" === e.hairColor || "platinum" === e.hairColor) return "";
  return t1("hairColor", e.hairColor) || "";
}
/* v157b (GPT audit of v157, checked: "Set the feet hip-width apart." typed as a free retouch was copied as "Set the feet set wide, about
   one and a half shoulder widths apart"): the final rewrites below (stance, arms, legs, beard, body hair color, face fat) are for the
   app's own sentences; every text the user typed (retouch, outfit, marks, state, accessories, hair, colors, origin) is set aside while
   they run, then put back as typed */
var SD_USER_KEYS = ["outfitText", "eState", "marks", "acc", "top", "bottom", "shoes", "hairStyle", "originDetail", "skinCustom", "eyeColorCustom", "hairColorCustom", "name", "eName"];
/* v157b review: a user text that is only a piece of one of the app's sentences below (for example "feet hip-width apart" or "hollow
   cheeks" typed alone) is not set aside in the other prompts, so those sentences are still rewritten; in the prompt that holds the
   retouch typed in card 3 ("iter") or the edit text (editHead, editBody), that text is always set aside */
var SD_POSE_TARGETS = [
  "feet hip-width apart", "faint body hair", "fine, natural facial hair texture", "legs with subtle muscle tone", "legs with defined but slim muscles", "with sharply defined, slim muscles",
  "toned, not bulky thighs", "defined but not bulky thighs", "thighs that taper clearly to the knees, not bulky", " that taper clearly to the knees", " and taper to the knees",
  "the upper outer thighs continue the curve of the hips, tapering to the knees", ", with a slight inward dip between the hip and the bulge", ", with a clear inward dip between the hip and the bulge",
  "so each side of the outline shows a double curve, the hip and then the saddlebag below it, in the front and back views", " rather than one smooth, idealized curve",
  " Front view: each side of the lower body shows the double curve, hip then saddlebag, never a single smooth curve.", " with a wide base,", ", its base covering most of the width of the chest in the front view",
  "the inner thighs touching from the top down to just above the knees", "Neutral standing reference pose, weight on both feet, arms", ", little breast tissue",
  /* the beard (sdBeardJaw), the slender bust and the straight legs */
  "full, rounded cheeks and a softer jawline, the face visibly fleshy", "a round, fleshy face with plump cheeks, a soft jawline and the start of a double chin", "a heavy, fleshy face with full jowls along the jaw and a clear double chin",
  ", slightly sagging jawline", "sagging jawline and neck skin", "strong, defined jawline", " with visible corners", " with softly rounded corners", ", a clearly defined jaw,", "a clearly defined, moderately wide jaw",
  "a clearly defined, slender jaw", "a clearly defined jaw", "a clean, clearly defined line from the jaw to the neck", "a clean, smooth line from the jaw to the neck",
  " with a wide base spanning the full width of the chest, its outer edges reaching the inner side of the upper arms in the front view", "; in the front view the bust fills the whole width of the chest, its outer sides bulging past the ribcage against the inner arms",
  "in the front view it fills the whole width of the chest, its outer sides bulging past the ribcage against the inner arms, and ", "straight legs with little taper: the thighs, knees and calves close in width, a straight outline from the hips to the ankles",
];
function sdPoseFrag(x) {
  return SD_POSE_TARGETS.concat(
    SD_ARMS_M.map(function (a) {
      return a[0];
    }),
    SD_ANGLE_FAT.map(function (a) {
      return a[0];
    }),
  ).some(function (t) {
    /* v157b review: without case, "Hollow cheeks" is a piece of "hollow cheeks" */
    return t.toLowerCase().indexOf(x.toLowerCase()) >= 0;
  });
}
function sdUserTxts(k) {
  var o = [],
    /* as typed, as the app cleans it (quotes, spaces, the end dots, the line breaks of an outfit text), and with its first letter in
       capitals or not (the prompts open a sentence with it) */
    add = function (x, all) {
      x = String(x || "");
      var v = [];
      [x, t5(x), sdFreeClean(x)].forEach(function (z) {
        z = z.trim();
        [z, z.replace(/[.\s]+$/, "")].forEach(function (w) {
          w.length >= 6 && v.indexOf(w) < 0 && v.push(w);
        });
      });
      /* v157b review: one variant a piece of an app sentence, none of them set aside */
      (all ||
        !v.some(function (w) {
          return sdPoseFrag(w);
        })) &&
        v.forEach(function (w) {
          [w, w.charAt(0).toUpperCase() + w.slice(1), w.charAt(0).toLowerCase() + w.slice(1)].forEach(function (y) {
            o.indexOf(y) < 0 && o.push(y);
          });
        });
    };
  SD_USER_KEYS.forEach(function (n) {
    var v = "string" == typeof e[n] ? e[n] : "";
    [v].concat(v.split(/\n+/)).forEach(function (x) {
      add(x);
    });
  });
  add(sdFreeText());
  "iter" === k && add(e.sdIter, !0);
  /* v157b review: the edit text only in its own slot of its own edit */
  ("body" === e.fixImg ? "editBody" : "editHead") === k && t5(e.fixText) && add("«" + t5(e.fixText) + "»", !0);
  return o.sort(function (a, b) {
    return b.length - a.length;
  });
}
function sdPoseTxt(s, k) {
  if ("string" != typeof s || "person" !== e.mode || sdChild(e)) return s;
  var keep = [];
  sdUserTxts(k).forEach(function (x) {
    s.indexOf(x) >= 0 && (keep.push(x), (s = s.split(x).join("\u0002" + (keep.length - 1) + "\u0003")));
  });
  s = sdPoseTxt0(s);
  return keep.length
    ? s.replace(/\u0002(\d+)\u0003/g, function (m, i) {
        return keep[+i];
      })
    : s;
}
function sdPoseTxt0(s) {
  /* v157b review: the face fat before the beard, whose jaw removal would hide the angularity sentence */
  s = sdFaceAngleFat(s);
  s = sdBeardJaw(s);
  sdHairBodyCol() && (s = s.split("faint body hair").join("faint " + sdHairBodyCol() + " body hair"));
  "light" !== e.armsOut &&
    SD_ARMS_M.forEach(function (a) {
      s = s.split(a[0]).join(a[1]);
    });
  var f = SD_FEET[e.feetW];
  f && (s = s.split("feet hip-width apart").join(f));
  /* v157 (user, his render with "Muscles apparents : jambes" on Marqués: "il y a presque aucune différence"): on slim thighs ("Fines",
     "Très fines") the legs said "subtle muscle tone" (Présents) and "defined but slim muscles" (Marqués), weaker than the other sizes; now
     what shows, the muscles staying slim (both engines, whatever came before them) */
  s = s
    .replace(/((?:lean,? )?(?:slender )?legs) with subtle muscle tone/g, "$1 with visible muscle, the quadriceps outlined above the knee and the calves visible")
    .replace(/((?:lean,? )?(?:slender )?legs) with defined but slim muscles/g, "$1 with sharply defined, slim muscles, the quadriceps separations visible above the knee, the inner thigh muscle drawn and the calves sharp");
  /* v157: "Droites": no taper said elsewhere */
  "straight" === e.legShape &&
    (s = s
      .split(" that taper clearly to the knees").join("")
      .replace(/[;,] the thighs (?:then )?taper(?: smoothly)? to the knees/g, "")
      .split(" and taper to the knees").join("")
      .split("the upper outer thighs continue the curve of the hips, tapering to the knees").join("the upper outer thighs continue the curve of the hips"));
  /* v157 (his render): with muscular legs set, the defined leg muscles are no longer said slim */
  sdLegMus() && (s = s.split("with sharply defined, slim muscles").join("with sharply defined muscles"));
  /* v157 review: never "not bulky" next to muscular front thighs or sprinter's legs (GPT's leg definition) */
  (+e.thighFront >= 3 || "sprinter" === e.legShape) &&
    (s = s.split("toned, not bulky thighs").join("toned thighs").split("defined but not bulky thighs").join("defined thighs").split("thighs that taper clearly to the knees, not bulky").join("thighs that taper clearly to the knees"));
  /* v157 review: full sides: the saddlebags keep their bulge, without the dip above it */
  sdGlSide() >= 3 &&
    (s = s
      .replace(/, with a (?:slight )?dip above it/g, "")
      .split(", with a slight inward dip between the hip and the bulge").join("")
      /* v157 review: the marked saddlebags too, in both engines, and GPT's check of the double curve */
      .split(", with a clear inward dip between the hip and the bulge").join("")
      .split("so each side of the outline shows a double curve, the hip and then the saddlebag below it, in the front and back views").join("so each side of the outline widens again below the hip at the saddlebag, in the front and back views")
      .split(" rather than one smooth, idealized curve").join("")
      .split(" Front view: each side of the lower body shows the double curve, hip then saddlebag, never a single smooth curve.").join(""));
  /* v157 review: a slender bust never said wide at the base; an athletic bust from "Généreuse" up keeps its tissue */
  "slender" === e.bustShape &&
    (s = s
      .split(" with a wide base spanning the full width of the chest, its outer edges reaching the inner side of the upper arms in the front view").join("")
      .split(", its base covering most of the width of the chest in the front view").join("")
      .split(" with a wide base,").join(",")
      .split("; in the front view the bust fills the whole width of the chest, its outer sides bulging past the ribcage against the inner arms").join("")
      .split("in the front view it fills the whole width of the chest, its outer sides bulging past the ribcage against the inner arms, and ").join(""));
  "athletic" === e.bustShape && e.chest >= 3 && (s = s.split(", little breast tissue").join(""));
  /* v157 review: wide feet never next to thighs touching down to the knees */
  "wide" === e.feetW && (s = s.split("the inner thighs touching from the top down to just above the knees").join("the inner thighs touching at the top"));
  /* v157 review: the pose of "Mise en planche" (from photos) has no feet clause: the stance set is said there too */
  f && (s = s.split("Neutral standing reference pose, weight on both feet, arms").join("Neutral standing reference pose, weight on both feet, " + f + ", arms"));
  return s;
}
function sdPoseM(m) {
  var o = {},
    k;
  for (k in m) o[k] = sdPoseTxt(m[k], k);
  return o;
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
    ph = sdChildPh(e),
    who = sdChildWho() + (ph ? "" : sdChildOrigin()),
    id = (ph
      ? (gpt ? "The attached photo is the only source for this child's face and hair" : "Image 1 is a photo of this child, the only source for " + p + " face and hair") +
        ": copy exactly " + p + " face, bone structure, eyes, eyebrows, nose, lips, ears, skin tone and texture, hair (cut, color, length and parting) and any visible mark, with their natural asymmetry; do not beautify, age, de-age or restyle them. Take only the face and hair from the photo: never its clothing, accessories, background, light or pose.\n" +
        sdChildA() + who + ", a child character for a family film.\n"
      : sdChildA() + who + ", a fictional child character for a family film: " + t7("skin") + ", " + sdChildEyes() + ". " + t6(ne()) + ".\n" +
        "Face, " + p + " own and kept exactly in every panel: " + sdChildFace() + ".\n") +
      (mk ? "Distinctive marks, each on the stated side: " + mk + ".\n" : "") +
      (st ? "Current state, on the stated side: " + st + ".\n" : "") +
      (sdChildHeadAcc() ? "Worn on the head and face, identical in every panel: " + sdChildHeadAcc() + (sdFreeText() ? ".\n" : ", plain and unbranded.\n") : "") +
      "A natural, ordinary child's face with the soft features of that age and the slight asymmetry of a real face, no makeup.\n";
  if (!gpt)
    return (
      sdChildLead() + ", 16:9 landscape, four equal 16:9 panels in a 2 by 2 grid separated by thin mid-grey gaps: an identity reference sheet of one " + sdChildFic() + "child character for a family film, the same child in all four panels.\n" +
      "Top left: front view, looking straight into the lens. Top right: three-quarter view, " + p + " face turned toward the left edge of the frame. Bottom left: exact profile facing the left edge of the frame, showing the left side of " + p + " face. Bottom right: back view, the back of " + p + " head seen straight from behind, no face visible" + sdBackHair() + ".\n" + sdChildCrop(0) +
      id + "\n" +
      "Calm, natural expression, mouth closed.\n\n" +
      "Plain seamless mid-grey backdrop. Soft, even studio light, the same in all four panels. 85mm lens at eye level, the whole head in sharp focus.\n\n" +
      sdChildRender(0) + " No text, labels or watermark."
    );
  return (
    "Create " + t9().noun + " to be used as an identity reference for AI video: four close-up studio views of " + (ph ? "the same child, from the attached photo" : "the same original fictional child character") + ", side by side in one image.\n\n" +
    "CHARACTER:\n" +
    (ph
      ? e.multiChar
        ? "Several characters are created in this conversation. This one, " + sdChildRef() + ", is the child in the attached photo: never mix " + ("m" === e.childSex ? "him" : "her") + " with anyone from earlier images; the name is only for reference and never appears in the image.\n"
        : "Use only the attached photo for this child, never anyone from earlier images in this conversation.\n"
      : e.multiChar
      ? "Several characters are created in this conversation. This one, " + sdChildRef() + ", is a different child from all of them: give " + ("m" === e.childSex ? "him" : "her") + " " + p + " own face and hair, and never reuse anyone from earlier images; the name is only for reference and never appears in the image.\n"
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
  /* v137: "Objet" shows the object categories, "Lieu" the three kinds of place */
  if ("objCat" === i && "object" === t.mode)
    return sdIsPlace(t)
      ? SD_PLACE_CAT_OPTS
      : tZ.objCat.filter(function (o) {
          return !sdPlaceCat(o[0]);
        });
  if ("glutesDefOpts" === i || "glutesDefOptsM" === i) {
    var gv = Array.isArray(t.glutesDef) ? t.glutesDef : [],
      own = tZ[i];
    return own.concat(
      tZ["glutesDefOpts" === i ? "glutesDefOptsM" : "glutesDefOpts"].filter(function (o) {
        return gv.indexOf(o[0]) >= 0 && !own.some(function (x) {
          return x[0] === o[0];
        });
      }),
    );
  }
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
  return "person" === e.mode && !sdBaby(e) && !sdPhotoClothes() && !nv() && !!e.outfitFree;
}
/* the typed text as it goes into the prompt (v117: also read by the child check, so the words checked are the words sent) */
function sdFreeClean(x) {
  return String(x || "")
    .replace(/[«»]/g, "")
    .replace(/^[\s,;:\-–•*]+/, "")
    .replace(/[\s,;]*\n[\s,;\-–•*]*/g, "; ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s.;,:!?…]+$/, "");
}
function sdFreeText() {
  if (!sdFreeOn()) return "";
  var x = sdFreeClean(e.outfitText);
  /* "random" alone is not an outfit: the plain one, as for an empty text */
  return /^(random|au hasard|hasard|al[ée]atoire)$/i.test(x) ? "" : x;
}
/* v116: the free outfit text names makeup (user's silver lounge set: "Light at-home evening makeup: thin black eyeliner..."): it replaces
   the Maquillage setting in the prompts, which said "No makeup" at the same time */
/* v157b (GPT audit of v157, checked: "red lipstick" changed to "black lipstick" in "Tenue en un seul texte" left the head signature
   unchanged, since v130 the free outfit line is left out of it so a change of trousers is not a new face): the makeup parts of that text
   (between commas and semicolons) are kept in the signature */
var SD_MK_RX = /\bmake-?up\b|eye-?liner|\bwinged liner\b|mascara|\blipstick\b(?![- ](?:red|pink|rose|coral|nude|plum|berry|colou?red|tones?|toned|shade)\b)|\blip ?gloss\b|\blip ?(?:liner|stain|tint)\b|\b(?:red|pink|nude|dark|black|plum|berry|coral|matte|glossy|painted|bright|deep|wine|cherry)(?:,? (?:red|pink|nude|dark|black|plum|berry|coral|matte|glossy))? lips\b(?![- ]?(?:print\w*|logo|motif|pattern|patch|graphic|embroider\w*|badge|pin|appliqu\w*|tee|t-shirt|shirt|top|sweater|hoodie|bag|earrings?|pendant)\b)|\blips (?:painted|tinted|stained|glossed|lined)\b(?! on\b)|\bsmok[e]?y eyes?\b|\bfalse lashes\b|\blash extensions\b|eye ?shadow|\bblush\b(?![- ](?:pink|rose|red|peach|beige|nude|colou?red|tones?|toned|silk|satin|chiffon|linen|lace|dress|gown|top|shirt|blouse|skirt|suit|sweater|cardigan|jacket|coat)\b)|maquillage|rouge à lèvres|fard à|\bkhôl\b|\bkohl\b/i;
var SD_MK_GARM = sdChildDict("gown gowns jumpsuit romper corset bodysuit heels pumps stilettos lingerie bra bikini swimsuit robe");
function sdFreeMkSig() {
  /* v157b reviews: each makeup word's clause, from the comma or semicolon before it to the one after it, cut at "and", "with", "over",
     "under" (et, avec, sur, sous); a piece that names a garment and no makeup is left out ("a black slip dress and red lipstick" gives
     "red lipstick"; "black and gold eyeshadow", "smoky eyes with silver shimmer", "lipstick in a deep berry shade", "deep red, glossy
     lips" stay whole) */
  var t = sdFreeText(),
    out = [],
    rx = new RegExp(SD_MK_RX.source, "gi"),
    m;
  while ((m = rx.exec(t))) {
    var a = Math.max(t.lastIndexOf(",", m.index - 1), t.lastIndexOf(";", m.index - 1)) + 1,
      r = t.slice(m.index + m[0].length).search(/[,;]/),
      b = r < 0 ? t.length : m.index + m[0].length + r;
    t.slice(a, b)
      .split(/\s+(?:and|with|over|under|et|avec|sur|sous)\s+/i)
      .forEach(function (p) {
        p = p.trim();
        p &&
          (SD_MK_RX.test(p) ||
            !p
              .toLowerCase()
              .split(/[^a-zà-ÿ]+/)
              .some(function (w) {
                return SD_CHILD_GARMD[w] || SD_MK_GARM[w];
              })) &&
          out.indexOf(p) < 0 &&
          out.push(p);
      });
    rx.lastIndex = Math.max(rx.lastIndex, b);
    m[0].length || rx.lastIndex++;
  }
  return out.join("; ");
}
function sdFreeMk() {
  /* v130 (GPT audit of v129, checked: "a blush pink silk dress" took the "Soirée" makeup away): "blush" before a color, a fabric or a
     garment is a color */
  return SD_MK_RX.test(sdFreeText());
}
/* v116: a body copied from a photo ("Garder le corps tel quel") named part by part, so a loose garment does not slim or flatten it
   (user: the bust disappeared under a cowl-neck camisole) */
function sdAsIsShape() {
  return (
    " The same " +
    ("m" === e.pres ? "shoulders, chest" : "shoulders, bust size, shape and hang") +
    ", waist, hips, glutes, thighs and legs, the same muscle definition and skin: under the clothes they keep exactly this shape and size and read through the fit, and a loose garment drapes over them without flattening, hiding or slimming them."
  );
}
/* the closing "no text" line of a prompt keeps the logos and prints the free outfit names */
function sdFreeNoText(s) {
  return sdFreeText() ? String(s).replace(/\.$/, ", except any logo or print this outfit description names.") : s;
}
/* the Tenue tab box: the switch, then the text; v117: a child's own keys (childOutfitFree, childOutfitText), and the reference outfit, which
   never dresses a child, is not named for one */
function sdFreeBox(t, g, L) {
  var c = sdChild(t),
    on = sdFreeSw(t),
    ref = t.bodyRef && !c;
  return (0, l.jsxs)("div", {
    className: "my-4 rounded-2xl border p-4 " + (on ? "border-[hsl(var(--tape))]" : ""),
    children: [
      /* v116: with the reference outfit on, the label says which sheet the text dresses (user: both switches on looked like a bug) */
      (0, l.jsx)(ax, { checked: on, onChange: (v) => g(c ? "childOutfitFree" : "outfitFree", v), children: ref ? "Tenue en un seul texte, pour « Habiller avec ma tenue »" : "Tenue en un seul texte" }),
      (0, l.jsx)("p", {
        className: "mt-2 text-sm text-muted-foreground",
        children: on
          ? ref
            ? "Ton texte remplace tous les choix de cet onglet pour la retouche « Habiller avec ma tenue » ; les planches tête et corps gardent la tenue de référence. Il part tel quel dans le prompt : écris-le en anglais de préférence. Vide : une tenue simple, unie."
            : c
            ? "Ton texte remplace tous les choix de cet onglet, pour la tête et le corps : écris-le en anglais de préférence. Pour un enfant, seuls les mots de vêtements de tous les jours sont acceptés : un seul mot inconnu ou refusé (maillot, sous-vêtement, maquillage, talons, mini, court...) écarte tout le texte, il est signalé en rouge et une tenue simple de tous les jours est utilisée. Ce que le texte ne nomme pas est complété en vêtements de tous les jours."
            : "Ton texte remplace tous les choix de cet onglet, pour la tête et le corps, et part tel quel dans le prompt : écris-le en anglais de préférence. Vide : une tenue simple, unie."
          : "Pour décrire toute la tenue d'un coup, sans cocher chaque pièce.",
      }),
      on &&
        (0, l.jsx)("textarea", {
          id: "c-outfitText",
          "aria-label": "Tenue en un seul texte",
          className: L + " min-h-[96px] resize-y",
          placeholder: c
            ? "ex. red rain jacket over a striped long-sleeve top, dark blue jeans, yellow rubber boots, a red baseball cap"
            : "ex. black leather biker jacket worn open over a white cotton t-shirt, straight dark blue jeans, black leather ankle boots, silver ring on the right hand",
          value: (c ? t.childOutfitText : t.outfitText) || "",
          onChange: (ev) => g(c ? "childOutfitText" : "outfitText", ev.target.value),
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
    skin = sdChildPh(e)
      ? "Skin tone on the hands, arms and neck, and any hair that falls below the neck: exactly as on the head sheet."
      : "Skin tone on the hands, arms and neck: " + t7("skin") + "." + (["shoulder", "long", "vlong"].indexOf(e.hairLen) >= 0 ? " The part of the hair that falls below the neck shows: " + ne() + "." : "");
  if (!gpt)
    return (
      sdChildLead() + ", 16:9, four equal vertical panels with thin grey gaps: a body and costume reference turnaround of one " + sdChildFic() + "child character for a family film, framed from the neck down, the same child in every panel. Left to right: front; left side, facing the left edge; back; right side, facing the right edge; the two profiles face opposite ways.\n" +
      crop + "\n" +
      (sdChildPh(e) ? "Image 1 is this child's head reference sheet: take only the skin tone and any hair that falls below the neck from it; the head itself is outside the frame.\n" : "") +
      "\n" +
      body + " " + skin + "\n\n" + out + (st ? " Current state: " + st + "." : "") + "\n\n" +
      "Neutral, relaxed standing pose, feet slightly apart, " + SD_ARMS_OUT_CS + ".\n\n" +
      "Seamless mid-grey backdrop. Soft, even studio light. Long lens at the child's chest height. " + sdChildRender(0) + " Five fingers per hand. No text or watermark."
    );
  return (
    "Create " + t9().noun + " to be used as a costume and character reference for AI video: four studio views of the body of the same " + sdChildFic() + "child character, framed from the neck down, side by side in one image.\n\n" +
    "BODY:\n" + body + "\n" + skin + " If a head sheet of this child is earlier in this conversation or attached, take only the skin tone and any hair that falls below the neck from it; the head itself is outside the frame." + (sdChildPh(e) ? " " + SD_CHILD_PH_BODY : "") + "\n\n" +
    "OUTFIT:\n" + out + (st ? "\nCurrent state: " + st + "." : "") + "\n\n" +
    "LAYOUT:\nA 16:9 landscape image split into four equal vertical panels of the same size, separated by narrow gaps of the same grey as the backdrop. From left to right: front view, exact left side view, back view, exact right side view; the two side views face opposite directions. " + crop + "\n\n" +
    "POSE:\nNeutral, relaxed standing pose, feet slightly apart, " + SD_ARMS_OUT_C + ". " + nX + "\n\n" +
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
      sdChildLead() + ", 16:9, four equal vertical panels with thin grey gaps: a full-body costume reference turnaround of one " + sdChildFic() + "child character for a family film, the same child in every panel. Left to right: front; left side, facing the left edge; back; right side, facing the right edge; the two profiles face opposite ways.\n" +
      "Whole figure in every panel, hair to feet, same scale and floor line, with some grey space above the head and below the feet.\n" +
      "Image 1 is this child's head reference sheet: copy face, hair and skin tone exactly; ignore its layout and clothing.\n" +
      (sdChildPh(e) ? "Hair exactly as in image 1, the same in every panel.\n\n" : "Hair exactly as in image 1: " + ne() + ", the same in every panel.\n\n") +
      body + "\n\n" + out + (st ? " Current state: " + st + "." : "") + "\n\n" +
      "Neutral, relaxed standing pose, feet slightly apart, " + SD_ARMS_OUT_CS + ".\n\n" +
      "Seamless mid-grey backdrop. Soft, even studio light. Long lens at the child's chest height. " + sdChildRender(0) + " Five fingers per hand. No text or watermark."
    );
  return (
    "Create " + t9().noun + " to be used as a costume and character reference for AI video: four full-body studio views of the same " + sdChildFic() + "child character, side by side in one image.\n\n" +
    "IDENTITY:\nThe head sheet (four head close-ups on a grey backdrop) earlier in this conversation is the identity anchor: match its face, hair and every visible mark exactly. If a head sheet is attached to this message, it is the anchor.\n" +
    (sdChildPh(e) ? "Hair exactly as on the head sheet. " + SD_CHILD_PH_BODY + "\n\n" : "Hair exactly as on the head sheet: " + ne() + ".\n\n") +
    "BODY:\n" + body + "\n\n" +
    "OUTFIT:\n" + out + (st ? "\nCurrent state: " + st + "." : "") + "\n\n" +
    "LAYOUT:\nA 16:9 landscape image split into four equal vertical panels of the same size, separated by narrow gaps of the same grey as the backdrop. From left to right: front view, exact left side view, back view, exact right side view; the two side views face opposite directions. Whole figure in every panel, from the top of the hair to the feet, at the same scale and on the same floor line, with some grey space above the head and below the feet.\n\n" +
    "POSE:\nNeutral, relaxed standing pose, feet slightly apart, " + SD_ARMS_OUT_C + ". " + nX + "\n\n" +
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
/* "Enfant au hasard": the child's own settings, face and hair at random, an everyday outfit; nothing of the adult body.
   v117: from a photo, the sex and age stay as set (they describe the child in the photo) */
function sdChildRandom(s) {
  var n = Object.assign({}, s, SD_HEAD0, { faceSeed: rh(), faceGen: 2 }),
    ph = sdChildPh(s),
    girl = ph ? "m" !== s.childSex : Math.random() < 0.5,
    prev = e;
  n.childSex = girl ? "f" : "m";
  ph || (n.childAge = rY(3, 12));
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
  /* v117 (reviews): the drawn outfit is what dresses the child, so the single text is switched off (its text kept) */
  n.childOutfitFree = !1;
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
        ? (0, l.jsx)("p", {
            className: "text-muted-foreground",
            children: sdFreeSw(t)
              ? "Enfant : toujours habillé avec ton texte, en vêtements de tous les jours. Texte vide ou refusé : une tenue simple de tous les jours."
              : "Enfant : toujours habillé avec la tenue choisie ici, en vêtements de tous les jours. Rien de coché : une tenue simple de tous les jours.",
          })
        : null,
      d.length
        ? (0, l.jsx)("p", {
            className: "mt-2 font-semibold text-destructive",
            children: sdT(
              "Ignoré pour un enfant (" + d.join(", ") + ") : seuls des vêtements de tous les jours et des signes ordinaires sont envoyés.",
              "Ignored for a child (" + d.map(function (x) { return { tenue: "outfit", "tenue en un seul texte": "single-text outfit", signes: "marks", "état du moment": "current state", cheveux: "hair", visage: "face", nom: "name" }[x] || x; }).join(", ") + "): only everyday clothes and ordinary marks are sent.",
            ),
          })
        : null,
      d.length && sdChildBadWords(t).length
        ? (0, l.jsx)("p", {
            className: "mt-2 text-destructive",
            children: sdT(
              "Mots non acceptés pour un enfant : " + sdChildBadWords(t).join(", ") + ". Chaque champ n'accepte que ses mots courants (vêtements de tous les jours pour la tenue).",
              "Words not accepted for a child: " + sdChildBadWords(t).join(", ") + ". Each field accepts only its everyday words (everyday clothes for the outfit).",
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
/* v127 (user: preparing image 1 is for Seedream only, make it clear; Nano Banana assembles well but smooths everything, flawless and
   immaculate: a button to do it with Nano Banana, its own prompt, minding the body, forcing it to keep every detail and flaw): "Assembler"
   can be written for Nano Banana (sdJoinFor). Image 1 as it is (no band), the figure scaled down evenly to make room for the head at an
   adult's size (about 7.5 to 8 heads: Winter's head of 0.130 of the height is 7.7), and a long list of what must survive the edit,
   since smoothing is what it does wrong. */
function sdNanoJoin() {
  return "join" === sdOp(e) && "nano" === e.sdJoinFor;
}
/* v134 (user: "assembler corps et tête dispo avec GPT aussi, car finalement aucun ne fait les choses bien mis à part Nano Banana";
   "GPT dans le choix"): a third model for "Assembler", GPT Image 2.5, with the Nano Banana text (image 1 as it is, the figure scaled
   down evenly, every flaw kept) plus what a GPT conversation needs: only the two attached images, the format, a measured check and a
   limit on retries, as in the GPT head and body prompts. Not yet checked on renders. */
function sdGptJoin() {
  return "join" === sdOp(e) && "gpt" === e.sdJoinFor;
}
function sdJoinNoPrep() {
  return sdNanoJoin() || sdGptJoin();
}
function sdJoinGptText(who, p) {
  return (
    sdJoinNanoText(who, p).replace("Combine these two reference sheets into one full-body reference sheet", "Combine the two reference sheets attached to this message into one full-body reference sheet") +
    " Use only these two images, nothing from earlier images in this conversation. A 16:9 landscape image, like image 1." +
    "\n\nProduce one image. Check by measuring, not by eye, in the front view: the head, top of the hair to the chin, 12.5 to 13.3% of the figure height, top of the hair to the soles (7.5 to 8 heads); the body, the outfit, the skin and every flaw as in image 1; the face as in image 2; the four panels laid out as in image 1. " +
    "If a requirement is clearly missed, regenerate at most twice (three images in total), fixing the most visible miss first. A generation stopped by the safety filter does not count: retry it once unchanged. Then deliver the best attempt and stop."
  );
}
function sdJoinNanoText(who, p) {
  /* v128 review: a man's chest is never called a bust (sdRibs' rule), and no cellulite is listed for him */
  var ch = "m" === e.pres || !(e.chest >= 1) ? "chest" : "bust";
  return (
    "Combine these two reference sheets into one full-body reference sheet of this " + who + ": image 1 is " + p + " body, cut at the collarbones; image 2 is " + p + " head. " +
    "Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view, an exact profile on each side view, facing the same way as that body, the back of the head on the back view. " +
    "From image 2 take only the face, hair and skin tone: ignore its layout, its framing, its scale and its three-quarter view. " +
    "Proportions: scale each whole body down evenly, never stretched or reshaped, so the complete figure fits with the head; the head, top of the hair to the chin, is an adult's size for that body, the figure about 7.5 to 8 heads tall, with a natural neck joining it at the collarbones, never sized to image 2. The body keeps exactly its build, proportions, outfit and every shape of image 1. " +
    "This is an unretouched photograph and must stay one: keep every detail and every flaw of both images exactly as they are, never smoothed, retouched, beautified, idealized or made symmetrical: " +
    (sdPick(SD_FHAIR, "fHair") && "m" !== e.pres && "smooth" === e.fHair ? "the skin texture with its pores, fine lines" : "the skin texture with its pores, fine lines, " + (sdBodyHair() ? "body hair" : "faint body hair")) + ", redness and uneven tone; " + ("m" === e.pres ? "" : "cellulite, dimpling, ") + "stretch marks, soft folds, rolls and creases; moles, marks, scars and veins; " +
    "the exact shape of the " + ch + ", belly, hips, glutes and thighs, including any sag, dip, flatness or asymmetry; the face exactly as in image 2, with its pores, lines and asymmetry, no makeup added. " +
    "Same light, white balance and fine film grain as image 1; nothing airbrushed, plastic, glossy or doll-like. Where a detail is unclear, keep it as it is rather than cleaning it up. " +
    "Framing, the same in every panel: the whole figure, top of the hair to the soles, with a band of plain grey backdrop above the hair and below the feet, nothing cut by the panel edges. Four panels laid out as in image 1, same scale and floor line in every panel, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark."
  );
}
/* v134 review: with "Lunettes de vue" the joins take the glasses from the head sheet too */
function sdJoinSpecs(x) {
  return sdSpecsKey() && "string" == typeof x ? sdJoinGlasses(x) : x;
}
function sdJoinGlasses(x) {
  return x.replace("take only the face, hair and skin tone:", "take only the face, hair, skin tone and glasses:").replace("same face, hair and skin tone as image 2", "same face, hair, skin tone and glasses as image 2");
}
function sdPresetJoin(nano) {
  var a = +e.age || 30,
    w = a + "-year-old " + (a < 21 ? "adult " : "") + ("m" === e.pres ? "man" : "f" === e.pres ? "woman" : "person"),
    f = void 0 === nano ? e.sdJoinFor : !0 === nano ? "nano" : !1 === nano ? "seedream" : nano;
  return sdJoinSpecs("nano" === f ? sdJoinNanoText(w, sdPos()) : "gpt" === f ? sdJoinGptText(w, sdPos()) : sdJoinText(w, sdPos()));
}
/* v101-v102: image 1 is cut at the collarbones and image 2 is a close-up sheet, so the figure is scaled down to make room for the head, framed with a margin (85% of the panel height) and given a head of one eighth of its height (8 heads, as in sdLegs); the three-quarter view of image 2 is not reused.
   Measured at the pixel (top of the hair, lower edge of the chin, soles): v101 text 6.7 to 7.0 heads; this text (6 results) 6.5 to 6.8 heads, so no gain on the head size,
   margins 1 to 3%, equal panels in 5 of 6. The text alone does not shrink the head: see the lessons file (canvas extended by 25% upward, to test) */
/* v126 (user, two assembled sheets: "the body proportions are not right at all, it doesn't look like a human being"; audit measured at the
   pixel on both: head, top of the hair to the lower edge of the chin, 0.155 of the height (6.4 to 6.5 heads) against 0.130 for an adult,
   chin at 0.845 of the height against 0.870, shoulders at 0.795 against 0.818, chest at 0.72 as expected (Winter's proportions, quoted by
   Yoo, Nixon and Harris 2002); below the chest the body is as asked (crotch 43.2% of the way down from the collarbones, 43% asked).
   The head is too big and pushes the shoulders down. Same defect as v99 to v102 (9 sheets, 6.5 to 7.0 heads): asked in words, the
   shrinking of the body is left to the model, which then fills the space it made with the close-up head of image 2.
   Now the geometry is set in pixels: card 3 extends image 1 by 25% upward in the browser (sdPrepImage: a grey band above each body,
   room for a neck and a head of 0.13 of the height, (1 - 0.818) / 0.818 = 22% plus a margin), and the prompt draws the head and neck in
   that band without moving or resizing the bodies. To check on the user's next sheets, measured the same way. */
function sdJoinText(who, p) {
  return "Combine these two reference sheets into one full-body reference sheet of this " + who + ": image 1 is " + p + " body, cut at the collarbones, with an empty grey band above each body; image 2 is " + p +
    " head. Keep the four views and their order from image 1 (front, left side, back, right side) and draw the matching head and neck from image 2 in the empty grey band above each body: the front face above the front view, an exact profile above each side view, facing the same way as that body, the back of the head above the back view. From image 2 take only the face, hair and skin tone: ignore its layout, its framing, its scale and its three-quarter view. The bodies of image 1 stay exactly where they are, at the same size: never move, shrink or enlarge them. The neck joins each body at the collarbones and the head fits inside the band, the top of the hair a little below the top edge, sized to the shoulders of image 1, never to image 2. Keep the body, outfit, proportions, skin and light of image 1 exactly, and the face, hair and skin tone of image 2 exactly. The four panels keep their widths from image 1, same scale and floor line in every panel, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark.";
}
/* v151: the v126 to v150 text said "Four panels of equal width", which the sheets with the arms held out no longer have (sdPanelCuts):
   kept to recognize it in saved sessions (sdJoinMigrate) */
function sdJoinText150(who, p) {
  return sdJoinText(who, p).replace("The four panels keep their widths from image 1, same scale", "Four panels of equal width, same scale");
}
/* older "Assembler" texts, kept to recognize them in saved sessions: [0] v75 to v100, [1] v101, [2] this repository before v110b, [3] v102 to v125 */
function sdJoinOld(who, p, v) {
  return "Combine these two reference sheets into one full-body reference sheet of this " + who + ": image 1 is " + p + " body, image 2 is " + p +
    (2 === v
      ? " head. Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view; on the left side view, the left profile from image 2; on the right side view, the right side of the face as shown in the three-quarter view of image 2, turned to an exact profile facing the right edge, never a mirror image of the left profile; the back of the head on the back view. Keep the body, outfit, proportions, skin texture and light of image 1 exactly, and the face and hair of image 2 exactly. Skin tone: image 2's tone over the whole body, so the neck shows no seam. Whole figure in every panel, hair to feet, same scale and floor line, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark."
      : 3 === v
      ? " head. Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view, an exact profile on each side view, facing the same way as that body, the back of the head on the back view. From image 2 take only the face, hair and skin tone: ignore its layout, its framing and its three-quarter view. Keep the body, outfit, proportions, skin and light of image 1 exactly, and the face, hair and skin tone of image 2 exactly. Image 1 is cut at the collarbones, so scale each whole body down evenly to make room for the head and neck. Framing, the same in every panel: the whole figure, top of the hair to the soles, fills about 85% of the panel height, centred, with an equal band of plain grey backdrop above the hair and below the feet; nothing is cut by the panel edges. Head size: the head, top of the hair to the chin, is one eighth of the figure's height (the figure is 8 heads tall), sized to the neck and shoulders of image 1, not to image 2. Four panels of equal width, same scale and floor line in every panel, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark."
      : 0 === v
      ? " head. Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view, a profile on each side view facing the same way as that body, the back of the head on the back view. Keep the body, outfit, proportions, skin and light of image 1 exactly, and the face, hair and skin tone of image 2 exactly. Whole figure in every panel, hair to feet, same scale and floor line, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark."
      : " head. Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view, an exact profile on each side view, facing the same way as that body, the back of the head on the back view. From image 2 take only the face, hair and skin tone: ignore its layout and its three-quarter view. Keep the body, outfit, proportions, skin and light of image 1 exactly, and the face, hair and skin tone of image 2 exactly. Image 1 is cut at the collarbones, so scale each whole body down evenly to make room for the head and neck: the head is drawn at natural adult size for that body, not at its size in image 2, and the whole figure, top of the head to the soles, is about 8 heads tall. Whole figure in every panel, hair to feet, with plain backdrop above the hair and below the feet: nothing touches or is cut by the panel edges. Same scale and floor line in every panel, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark.");
}
/* saved sessions keep the "Assembler" text of the version that wrote it in sdIter: an unedited older text is rewritten on load (exact match), an edited one is kept */
function sdJoinMigrate(t) {
  var s = "join" === t.sdIterOp ? String(t.sdIter || "").trim() : "",
    m = /^Combine these two reference sheets into one full-body reference sheet of this ([^:]+): image 1 is (her|his|their) body/.exec(s);
  if (m && ([0, 1, 2, 3].some(function (v) { return s === sdJoinOld(m[1], m[2], v); }) || s === sdJoinText150(m[1], m[2]))) {
    t.sdIterPre === t.sdIter && (t.sdIterPre = sdJoinText(m[1], m[2]));
    t.sdIter = sdJoinText(m[1], m[2]);
  }
  /* v151 review: the v134 to v150 text with "Lunettes de vue" (sdJoinSpecs' words, applied here on the string: sdJoinSpecs reads e, not t) */
  if (m && s === sdJoinGlasses(sdJoinText150(m[1], m[2]))) {
    t.sdIterPre === t.sdIter && (t.sdIterPre = sdJoinGlasses(sdJoinText(m[1], m[2])));
    t.sdIter = sdJoinGlasses(sdJoinText(m[1], m[2]));
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
    " head above the rear body; " + (sdSpecsKey() ? "same face, hair, skin tone and glasses as image 2" : "same face, hair and skin tone as image 2") + ", joined seamlessly to each neck"
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
/* v134 (user: "pour tombante il faut un curseur très tombante pour vraiment exagérer, une poitrine gant de toilette qui tombe sur le
   ventre, c'est un vrai défaut, il faut réussir à le simuler"): "Chute de la poitrine", under "Forme de la poitrine", only with
   "Tombante" chosen by hand (not the Auto tiers), a woman or an androgynous person with a bust, adults only. "Très tombante" is a severe
   ptosis: the nipple below the fold under the breast and at its lowest point (Regnault grade 3, Martinez and Chung, StatPearls, 2023),
   the breast emptied and long, lying on the belly; the levels on the belly are prompt landmarks, not measurements. Both engines. */
function sdDropOn() {
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1 && "low" === e.bustShape && !e.sdAutoTier && !e.photo;
}
/* v136 (self-review: the outfit option still said "haut triangle" with "Très tombante"): the same test on the saved state, for the option label */
function sdDropRaw(t) {
  return !!t && "person" === t.mode && !sdChild(t) && "m" !== t.pres && t.chest >= 1 && "low" === t.bustShape && "very" === t.bustDrop && !t.photo;
}
function sdDropX() {
  return sdDropOn() && "very" === e.bustDrop;
}
/* v136 (self-review of v135, after the user's "Très tombante" + "Moyenne" sheet, "la poitrine c'est une catastrophe"): a B to C cup was
   asked to reach a hand's width below the ribcage, onto the belly, a length its volume cannot hang to. The lowest point now goes down with
   the size: a few fingers below the fold for "Menue", the bottom of the ribcage for "Moyenne", onto the belly from "Généreuse", the navel
   at "Très généreuse" (prompt landmarks ordered by volume, not measurements) */
var SD_DROP_LOW = [
  "a few fingers' width below the fold under the bust",
  "a few fingers' width below the fold under the bust",
  "at the bottom of the ribcage",
  "just below the bottom of the ribcage, touching the upper belly",
  "a hand's width below the bottom of the ribcage, resting on the upper belly with a deep crease under it",
  "resting on the belly about level with the navel, with a deep crease under it",
];
function sdDropLow() {
  return "the lowest point " + SD_DROP_LOW[sdCi(e.chest)];
}
function sdDropUp() {
  return sdPecsF() ? "the upper chest flat and firm with pectoral muscle" : "the upper chest flat and slightly hollow";
}
/* v135 (user, two Seedream sheets with "Très tombante", a "Moyenne" bust and the bikini: "la poitrine c'est une catastrophe"): the bikini
   triangles came out as long, empty bags hanging from the neck tie. Two words did it: the breast said "like a soft, half-empty pouch",
   an image the model gave to the fabric, and the triangles said to "cover each breast down to its lowest point and hang with it" (v134).
   Now the breast is said by its skin and its shape, never as a pouch; and, the user's choice ("Top court ample"), with "Très tombante"
   the tanga comes with the loose cropped top instead of the tied triangles, its fabric falling over the bust to its lowest point. */
function sdDropSd() {
  var c = sdCi(e.chest);
  return c <= 1
    ? "deflated and hanging, a real body flaw kept on purpose: the little volume emptied, the slack skin lying low against the ribs; " + sdDropUp() + "; " + sdDropLow() + ", the nipples pointing straight down; never lifted or firm"
    : /* v136 (self-review): "little volume left" said next to "about an H cup"; the volume is said where it sits, its size kept */
      "with a very strong natural drop, a real body flaw kept on purpose: deflated, emptied in the upper part, the volume settled at the bottom, the slack skin stretched down; " + sdDropUp() + "; " + sdDropLow() + "; in profile it hangs straight down, far below the fold under it; never lifted, round or firm";
}
function sdDropGpt() {
  return "a very low, deflated bust line, a real body flaw kept on purpose: " + (sdCi(e.chest) <= 1 ? "the little volume emptied, the slack skin lying low against the ribs" : "each breast emptied in its upper part, the volume settled at the bottom, the slack skin stretched far down, below the fold under each breast") +
    ", " + sdDropUp() + ", " + sdDropLow() + ", each breast pointing straight down at its lowest point; never lifted, round or firm";
}
/* the landmarks of a "Tombante" bust in the outfit and check texts of both engines (lowest point at the lower ribs or at elbow level, a hem
   above the navel) follow "Très tombante" */
function sdDropLm() {
  return ["a few fingers' width below the fold under the bust", "a few fingers' width below the fold under the bust", "at the bottom of the ribcage", "just below the bottom of the ribcage, touching the upper belly", "a hand's width below the bottom of the ribcage, on the upper belly", "on the belly, about level with the navel"][sdCi(e.chest)];
}
function sdDropFix(txt) {
  if (!sdDropX() || "string" != typeof txt) return txt;
  var c = sdCi(e.chest),
    lm = sdDropLm();
  txt = txt
    .replace("from the collarbone down to its lowest point at about the lower ribs, then hangs straight down", "from the collarbone down to its lowest point " + lm + ", then hangs straight down")
    .replace("then the front sloping down to its lowest point just below the ribcage, at elbow level, never a high, rounded shelf.", "then the front sloping down to its lowest point " + lm + ", never a high, rounded shelf.")
    .replace("its lowest point at the lower ribs; never lifted, round or high", "its lowest point " + lm + "; never lifted, round or high");
  c >= 3 &&
    (txt = txt
      .split(", its plain hem ends just above the navel")
      .join(", its plain hem ends a hand's width below the lowest point of the bust, covering it whole")
      .replace("so the waist and navel show between them", "so a little skin shows between them")
      .replace("and its heavy lower half reaches far forward and down, well beyond the line of the stomach", "and its heavy lower half hangs down onto the belly"));
  /* v136 (self-review): from "Moyenne" up the lowest point reaches the bottom of the ribcage, the upper belly or the navel; a hem a hand's
     width below it covered the navel or the abdomen said bare: the loose hem ends just below the bust (the Seedream loose top: sdLooseTop) */
  c >= 2 &&
    (txt = txt.replace(", ending on the upper abdomen, a hand's width below the bust, so the navel and the lower abdomen stay visible, hanging loose at the hem", ", ending just below the bust, so " + (c >= 3 ? "the lower abdomen stays" : "the navel and the lower abdomen stay") + " visible, hanging loose at the hem"));
  return txt;
}
function sdDropM(m) {
  if (!sdDropX() || "string" != typeof m.body) return m;
  var o = {},
    k;
  for (k in m) o[k] = m[k];
  /* v138: the loose top of the body sheet with a décolleté (the head sheet and the retouch texts keep their neckline) */
  o.body = sdDropFix(m.body).split("a " + nm).join(sdDropNeck());
  return o;
}
/* v134 (user: "on doit pouvoir ajouter en plus asymétrique ou non, car la plupart des poitrines des femmes sont asymétriques"; "Non /
   Oui"): "Asymétrie de la poitrine" with every shape, "Très tombante" included, Auto too; the shape "Asymétrique" stays (saved sessions)
   with its own text and hides it. The same words as that shape, in each engine. */
var SD_ASYM_SD = "clearly asymmetric, the left side visibly fuller and slightly lower than the right in every view";
var SD_ASYM_GPT =
  "clearly asymmetric: the character's left side is visibly fuller and sits a little lower than the right side; in the front view the difference is easy to see, and in the left side view the bust projects further than in the right side view; models tend to make both sides identical, so keep this difference in every view";
/* v157 (user: "il faut aussi des poitrines qui remontent très haut, là elle tombe toute finalement, et on devrait pouvoir cocher plusieurs
   formes à la fois : une poitrine peut être très haute et athlétique", then "attention, tu as un double « écarté » … garde-le dans la forme
   puisqu'on peut cliquer sur plusieurs à la fois"): "Forme de la poitrine" becomes one control where several can be ticked, one per
   group: the shape (bustShape: Ronde, Goutte, En obus, Poire, Athlétique, Fine et allongée, Tombante; none ticked = Auto, by age), the
   height (bustHigh: Haute, Très haute), the spacing (bustWide: Écartée "yes", Rapprochée "close", Vers l'extérieur "out", v157c Vers l'avant "fwd") and Asymétrique
   (bustAsym). "Asymétrie" and "Écartement", their own controls since v134 and v140, are now in it. The saved shapes "high", "wide" and
   "asym" (and the v157 preview's "close", "eastwest") are read into their group and keep their texts until the next click. A drooping,
   pear or slender shape is never high: the height is not said with them. */
var SD_BUST_POS = {
  high: "set high on the chest, the upper part full just below the collarbones, the lowest point well above the bottom of the ribcage",
  vhigh: "set very high on the chest and lifted: the upper part full right below the collarbones, the fullest point at about mid-upper-arm level, the lower crease well above the bottom of the ribcage; firm and natural, never implant-like",
  close: "close-set: both sides sitting close to the center of the chest, little space between them, the inner edges nearly touching",
  out: "each side angled outward, pointing away from the center of the chest toward the sides, a clear gap between them at the center",
  /* v157c (user, on his reference: "c'est une poitrine qui goutte vers l'avant", the shape and the spacing groups gave no forward
     projection): pointing ahead, the slight natural outward angle kept (his photos), the projection read in the side views */
  fwd: "each side projecting straight forward, only slightly angled outward, the forward projection clear in the side views, never implant-like",
};
var SD_BUST_NOHIGH = ["low", "pear", "slender"];
/* a drooping, pear, slender or athletic shape (flatter in profile) and a chute never point straight forward; v157c review: nor the conical
   one, which already projects forward (and slightly down) in its own words */
var SD_BUST_NOFWD = ["low", "pear", "slender", "athletic", "conical"];
/* "Vers l'avant" said (sdMus then never says the bust soft and shaped by gravity, as with a height; GPT drops "gravity-affected"); v157c
   review: read from the settings, not from the text */
function sdBustFwdOn() {
  return sdBustOk() && "fwd" === e.bustWide && SD_BUST_NOFWD.indexOf(e.bustShape) < 0 && !sdDropX() && e.chest >= 2;
}
/* "never implant-like" once in the bust phrase: the shape's own words may say it */
function sdBustPosIn(x) {
  return /never implant-like/.test(x || "") ? sdBustPos().split(", never implant-like").join("") : sdBustPos();
}
function sdBustOk() {
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1;
}
/* v157 review: a height is set (sdMus then never says the bust soft and shaped by gravity) */
function sdBustHighOn() {
  return /^set (?:very )?high/.test(sdBustPos());
}
function sdBustPos() {
  if (!sdBustOk()) return "";
  /* v157 review: no height below "Moyenne" (a nearly flat bust "set high, the upper part full" contradicts itself); "firm" never next to a
     setting of "Peau de la poitrine" */
  var h = SD_BUST_NOHIGH.indexOf(e.bustShape) >= 0 || sdDropX() || !(e.chest >= 2) ? "" : SD_BUST_POS[e.bustHigh] || "",
    w = "close" === e.bustWide || "out" === e.bustWide ? SD_BUST_POS[e.bustWide] : "";
  sdBustFwdOn() && (w = SD_BUST_POS.fwd);
  /* "never implant-like" once */
  "fwd" === e.bustWide && /never implant-like/.test(h) && (w = w.replace(", never implant-like", ""));
  h && sdBustSkin() && (h = h.split("; firm and natural, never implant-like").join(", never implant-like"));
  return [h, w].filter(Boolean).join("; ");
}
var SD_BUST_UI = [
  ["round", "Ronde", "f"],
  ["teardrop", "Goutte", "f"],
  ["conical", "En obus", "f"],
  ["pear", "Poire", "f"],
  ["athletic", "Athlétique", "f"],
  ["slender", "Fine et allongée", "f"],
  ["low", "Tombante", "f"],
  ["high", "Haute", "h"],
  ["vhigh", "Très haute", "h"],
  ["wide", "Écartée", "w"],
  ["close", "Rapprochée", "w"],
  ["out", "Vers l'extérieur", "w"],
  ["fwd", "Vers l'avant", "w"],
  ["asym", "Asymétrique", "a"],
];
/* the ticked items, read from the four keys (and the saved single shapes) */
function sdBustSel(t) {
  var f = t.bustShape,
    o = [];
  ["round", "teardrop", "conical", "pear", "athletic", "slender", "low"].indexOf(f) >= 0 && o.push(f);
  ("high" === f || "high" === t.bustHigh) && o.push("high");
  "vhigh" === t.bustHigh && o.indexOf("high") < 0 && o.push("vhigh");
  /* v157 review: the spacing of a saved shape first, as the prompt says it */
  var w = "wide" === f ? "wide" : "close" === f ? "close" : "eastwest" === f ? "out" : "yes" === t.bustWide ? "wide" : "close" === t.bustWide ? "close" : "out" === t.bustWide ? "out" : "fwd" === t.bustWide ? "fwd" : "";
  w && o.push(w);
  ("asym" === f || "yes" === t.bustAsym) && o.push("asym");
  return o;
}
function sdBustClick(t, id) {
  var sel = sdBustSel(t),
    g = (SD_BUST_UI.filter(function (x) {
      return x[0] === id;
    })[0] || [])[2],
    on = sel.indexOf(id) >= 0;
  sel = sel.filter(function (x) {
    var gx = (SD_BUST_UI.filter(function (y) {
      return y[0] === x;
    })[0] || [])[2];
    return x !== id && (on || gx !== g);
  });
  on || sel.push(id);
  /* a drooping, pear or slender shape and a height never together: the last click wins */
  var nh = sel.some(function (x) {
      return SD_BUST_NOHIGH.indexOf(x) >= 0;
    }),
    hh = sel.indexOf("high") >= 0 || sel.indexOf("vhigh") >= 0;
  nh && hh && (sel = sel.filter(function (x) {
    return SD_BUST_NOHIGH.indexOf(id) >= 0 ? "high" !== x && "vhigh" !== x : SD_BUST_NOHIGH.indexOf(x) < 0;
  }));
  /* v157c: "Vers l'avant" and a drooping, pear, slender or athletic shape never together: the last click wins */
  var nf = sel.some(function (x) {
    return SD_BUST_NOFWD.indexOf(x) >= 0;
  });
  nf && sel.indexOf("fwd") >= 0 && (sel = sel.filter(function (x) {
    return SD_BUST_NOFWD.indexOf(id) >= 0 ? "fwd" !== x : SD_BUST_NOFWD.indexOf(x) < 0;
  }));
  var pick = function (gr) {
    return sel.filter(function (x) {
      return (SD_BUST_UI.filter(function (y) {
        return y[0] === x;
      })[0] || [])[2] === gr;
    })[0] || "";
  };
  var w = pick("w");
  return {
    bustShape: pick("f") || "auto",
    bustHigh: pick("h") || "auto",
    bustWide: "wide" === w ? "yes" : w || "no",
    bustAsym: pick("a") ? "yes" : "no",
  };
}
/* v157 review: "Auto (âge)" clears the shape only; a saved "high", "wide", "asym", "close" or "eastwest" goes into its group first */
function sdBustAuto(t) {
  var sel = sdBustSel(t),
    w = sel.indexOf("wide") >= 0 ? "yes" : sel.indexOf("close") >= 0 ? "close" : sel.indexOf("out") >= 0 ? "out" : sel.indexOf("fwd") >= 0 ? "fwd" : "no";
  return { bustShape: "auto", bustHigh: sel.indexOf("high") >= 0 ? "high" : sel.indexOf("vhigh") >= 0 ? "vhigh" : "auto", bustWide: w, bustAsym: sel.indexOf("asym") >= 0 ? "yes" : "no" };
}
function sdBustChips(t, set, hint) {
  if ("person" !== t.mode || sdChild(t) || "m" === t.pres || !(t.chest >= 1)) return null;
  var sel = sdBustSel(t),
    auto = !sel.some(function (x) {
      return ["round", "teardrop", "conical", "pear", "athletic", "slender", "low"].indexOf(x) >= 0;
    }),
    cls = "relative inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium cursor-pointer select-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ",
    chip = function (id, lab, on, click) {
      return (0, l.jsxs)(
        "label",
        {
          className: cls + (on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-foreground/40"),
          "data-bust": id,
          children: [
            (0, l.jsx)("input", { type: "checkbox", className: "absolute inset-0 opacity-0 cursor-pointer", checked: on, onChange: click }),
            sdTr(lab),
          ],
        },
        id,
      );
    };
  return (0, l.jsxs)("fieldset", {
    className: "py-4 border-b last:border-0 min-w-0",
    id: "sd-bust",
    children: [
      (0, l.jsx)("legend", { className: "float-left w-full font-semibold mb-3", children: sdTr("Forme de la poitrine") }),
      (0, l.jsx)("div", {
        className: "clear-both flex flex-wrap gap-2",
        children: [
          chip("auto", "Auto (âge)", auto, function () {
            set(function (s) {
              return Object.assign({}, s, sdBustAuto(s));
            });
          }),
        ].concat(
          SD_BUST_UI.filter(function (x) {
            /* v157 review: the heights from "Moyenne" up, as the prompt says them; v157c: "Vers l'avant" too */
            return ("h" !== x[2] && "fwd" !== x[0]) || t.chest >= 2;
          }).map(function (x) {
            return chip(x[0], x[1], sel.indexOf(x[0]) >= 0, function () {
              set(function (s) {
                return Object.assign({}, s, sdBustClick(s, x[0]));
              });
            });
          }),
        ),
      }),
      (0, l.jsx)("p", {
        className: "mt-2 text-sm text-muted-foreground",
        children: (0, l.jsx)(SdMore, {
          text:
            sdT(
              "Coche plusieurs choix, un par groupe : la forme (Ronde, Goutte, En obus, Poire, Athlétique, Fine et allongée, Tombante), la hauteur (Haute, Très haute, dès « Moyenne »), l'écartement (Écartée, Rapprochée, Vers l'extérieur, Vers l'avant dès « Moyenne ») et Asymétrique. Goutte décrit le profil (le bas plus plein), pas l'orientation. Tombante, Poire et Fine et allongée ne vont pas avec une hauteur ; Tombante, Poire, Fine et allongée, Athlétique et En obus (déjà projetée vers l'avant) ne vont pas avec Vers l'avant. Sans forme cochée : Auto, selon l'âge, ronde avec une hauteur ou Vers l'avant.",
              "Tick several, one per group: the shape (Round, Teardrop, Conical, Pear, Athletic, Slender, Drooping), the height (High, Very high, from “Average” up), the spacing (Wide-set, Close-set, East-west, Forward from “Average” up) and Asymmetric. Teardrop is the profile (the lower half fuller), not the direction. Drooping, Pear and Slender do not go with a height; Drooping, Pear, Slender, Athletic and Conical (already projecting forward) do not go with Forward. No shape ticked: Auto, by age, round with a height or Forward.",
            ) + (hint ? " " + sdTr(hint) : ""),
        }),
      }),
    ],
  });
}
function sdAsymOn() {
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1 && "asym" !== e.bustShape && "yes" === e.bustAsym;
}
function sdAsymGpt(x) {
  /* v140: "Écartement de la poitrine" first, then the skin of the bust, then the asymmetry */
  /* v157: the height and the close-set or outward spacing before them */
  x = sdBustPos() ? (x ? x + "; " : "") + sdBustPosIn(x) : x;
  x = sdWideOn() ? (x ? x + "; " : "") + SD_WIDE_GPT : x;
  x = sdBustSkin() ? (x ? x + "; " : "") + sdBustSkin() : x;
  return sdAsymOn() ? (x ? x + "; " : "") + SD_ASYM_GPT : x;
}
/* v140 (user's reference photo: a low, teardrop bust that is also wide-set, two shapes the "Forme" choice kept apart): "Écartement de la
   poitrine" with every shape but "Écartée" itself, the words of that shape in each engine */
var SD_WIDE_SD = "wide-set, about a hand's width apart at the center, each side angled slightly outward";
var SD_WIDE_GPT = "a wide-set bust line: a clearly wider space than average between the two sides at the center of the chest, about a hand's width, each side sitting toward the outer chest and angled slightly outward";
/* v140 (user: "il peut y avoir aussi des plis sur la poitrine, la peau peut ne pas être tendue sur ce type de poitrine"): "Peau de la
   poitrine" from "Moyenne" up, both engines; not with "Très tombante", whose text already says the slack skin. Words chosen away from
   those that made Seedream block the drooping bust in v77 (lessons file): no "saggy", "breasts", "nipples", "hanging", "deflated" */
/* v140 review: never "soft" (lessons file: 11 or more blocked every time), said only where the outfit leaves that skin bare (a skin texture
   under the outfit pushed toward underwear, lessons §2) */
var SD_BUST_SKIN = {
  /* v144 (user's render: lines like stretch marks on the upper bust with "Souple"): no creases, the one fold where the bust rests */
  soft: "the skin of the bust supple, settling with its weight, with a gentle fold only where the bust rests on the ribcage, wherever the outfit leaves it bare",
  loose: "the skin of the bust relaxed, finely creased on the upper slope, with a gentle crease at the bottom, wherever the outfit leaves it bare",
};
function sdBustSkin() {
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && sdCi(e.chest) >= 2 && !sdDropX() && SD_BUST_SKIN[e.bustSkin] ? SD_BUST_SKIN[e.bustSkin] : "";
}
function sdWideOn() {
  /* v157: never with the close-set shape */
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.chest >= 1 && ["wide", "close", "eastwest"].indexOf(e.bustShape) < 0 && "yes" === e.bustWide;
}
/* v134 (user, a GPT head sheet and a Seedream one with "Nez, largeur : Fin" and "Lèvres : Fines": "c'est tout sauf un nez fin, pareil pour
   la bouche, ou alors il faut ajouter nez et bouche très fins"): "narrow nose" and "thin lips", two words in a list, drew an ordinary nose
   with a full tip and wide nostrils. Said with landmarks a model can draw, in the head line both engines share (adults); "Très fin" and
   "Très fines" below them. A nose as wide as the space between the inner corners of the eyes is the neoclassical canon, met by a minority
   of real adults, the nose being most often wider (Farkas et al. 1985, as summarized by Al-Sebaei 2015): "Fin" asks that canon, "Très
   fin" narrower. Not yet checked on renders. */
var SD_NOSE_LM = {
  /* v135 (user, two sheets with "Fin": "le nez fin ne marche toujours pas"; measured in the front view the width held, 1.0 and 0.75 of the
     space between the inner corners of the eyes, but the tip came out round and fleshy and the nostrils showed): the tip and the nostril
     wings said too */
  narrow: " (a slim, straight bridge, a small tip with a fine, sharp outline, thin nostril wings close to the tip, the nostrils barely visible from the front: in the front view the nose is about as wide as the space between the inner corners of the eyes)",
  xnarrow: " (a very slim, straight bridge, a very small tip with a fine, sharp outline, thin nostril wings close to the tip, the nostrils barely visible from the front: in the front view the nose is clearly narrower than the space between the inner corners of the eyes; in profile a fine, straight line down to the small tip)",
};
var SD_LIPS_LM = {
  thin: "thin lips (a thin upper lip, the lower lip only slightly fuller, little red showing)",
  xthin: "very thin lips (the upper lip a thin line, the lower lip thin too, both lying flat with very little red showing)",
};
/* v136 (self-review: the v135 nostril redness left out at one skin level only): with a fine nose, the redness of the skin lines of both
   engines sits on the chin, never around the nose or the nostrils */
function sdNoseSkin(x) {
  return sdNoseLm() && "string" == typeof x ? x.replace("redness around the nose and chin", "redness on the chin").replace(", slight redness around the nostrils", "") : x;
}
function sdNoseM(m) {
  /* v136 review: every prompt of the set (the GPT edit prompts carry the skin line too), not the head only */
  if (!sdNoseLm()) return m;
  var o = {},
    k;
  for (k in m) o[k] = sdNoseSkin(m[k]);
  return o;
}
function sdNoseLm() {
  var x = "person" === e.mode && !sdChild(e) ? SD_NOSE_LM[e.noseW] || "" : "";
  /* v134 review: an aquiline or upturned profile set too: the bridge is not called straight */
  x = x && ["aquiline", "upturned"].indexOf(e.noseP) >= 0 ? x.replace(", straight bridge", " bridge").replace("; in profile a fine, straight line down to the small tip", "") : x;
  /* v135 review: an upturned tip shows the nostrils from the front */
  return x && "upturned" === e.noseP ? x.replace(", the nostrils barely visible from the front", "") : x;
}
function sdLipsLm(x) {
  return "person" === e.mode && !sdChild(e) && SD_LIPS_LM[e.lips] ? SD_LIPS_LM[e.lips] : x;
}
/* v134 (user: "ajoute un bouton dans Signes : lunettes de vue, avec différents styles et un Auto qui s'adapte en fonction de l'âge"):
   "Lunettes de vue", adults, both engines, in the marks line of the head sheet and of a body sheet with the head (never a headless one).
   Auto: two styles per age band, picked with the face draw (a style calibration, not a statistic). */
var SD_SPECS = {
  rect: "thin rectangular frames in dark metal",
  round: "small round frames in thin gold metal",
  square: "square frames in thick tortoiseshell acetate",
  cat: "cat-eye frames in black acetate",
  half: "half-rim frames with a thin dark browline on top and the lower edge of the lenses rimless",
  rimless: "rimless frames, the lenses held by small screws, with thin metal temples",
  big: "large, thick black acetate frames",
};
var SD_SPECS_AGE = [
  [30, ["round", "square"]],
  [50, ["rect", "square"]],
  [65, ["half", "rect"]],
  [1e3, ["rimless", "half"]],
];
/* v134 (user, three Seedream headless sheets with "wears prescription glasses" written in "Autres signes": "sur certaines images on voit
   la tête"; the glasses and the chin showed above the collarbones): on a headless body sheet, the marks written by hand that belong to
   the face or the head are left out, each part between commas or semicolons */
var SD_FACE_MARK = /\b(glasses|spectacles|eyeglasses|sunglasses|monocle|eyebrows?|eyelids?|eyelashes|eyes?|lips?|nose|nostrils?|cheeks?|cheekbones?|chin|jaw|jawline|forehead|temples?|ears?|earlobes?|earrings?|face|facial|scalp|hairline|beard|moustache|mustache)\b/i;
function sdBodyMarks(x) {
  return String(x || "")
    .split(/\s*[;,]\s*/)
    .filter(function (p) {
      return p && !SD_FACE_MARK.test(p);
    })
    .join(", ");
}
function sdSpecsKey() {
  if ("person" !== e.mode || sdChild(e) || !e.specs || "none" === e.specs) return "";
  if ("auto" !== e.specs) return SD_SPECS[e.specs] ? e.specs : "";
  var a = +e.age || 30,
    b = (
      SD_SPECS_AGE.filter(function (x) {
        return a < x[0];
      })[0] || SD_SPECS_AGE[SD_SPECS_AGE.length - 1]
    )[1];
  return b[Math.abs(Math.floor(+e.faceSeed || 0)) % 2];
}
function sdSpecs() {
  var k = sdSpecsKey();
  return k ? "wears prescription glasses, " + SD_SPECS[k] + ", clear lenses with a faint natural reflection, the eyes clearly visible through them, the same glasses in every view, the temple arm running back over the ear in the profile" : "";
}
function sdAutoBust(t) {
  if (t.photo || "m" === t.pres || "auto" !== t.bustShape || !(t.chest >= 2)) return t;
  /* v157: "Haute" or "Très haute" ticked without a shape: the young, round tier, never a drop; v157c review: "Vers l'avant" too (the
     tiers of an older age give pear or drooping, never pointed forward) */
  if ("high" === t.bustHigh || "vhigh" === t.bustHigh || "fwd" === t.bustWide) return Object.assign({}, t, { bustShape: "round", sdAutoTier: "young" });
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
    (e.thighs >= 3 && !(sdPick(SD_THIGHGAP, "thighGap") && "gap" === e.thighGap) ? "; thighs touching from groin to knees" : "")
  );
}
var SD_FORTE_DETAIL = { "clearly visible collarbones": "softly padded collarbones", "a narrow ribcage": "a slightly wide ribcage", "a vertical, slit-like navel": "a deep, round navel", "bony, clearly drawn knees": "soft, rounded knees", "high calves with long lower tendons": "low, full calves", "slim ankles": "sturdy ankles", "long, slender fingers": "plump fingers" };
function sdForteBuild(x) {
  x = 4 === e.fat && "slim" === e.biceps ? x.replace(" all over", "") : x;
  /* v118: an athlete named for a slim build (dancer, swimmer, gymnast...) brings narrow hips and small glutes with it */
  /* v128: soft fat in a zone ("Visible" or more) does not go with a slim athlete either */
  x = sdCurvy() || SD_FAT_Z.some(function (z) {
    return sdFatOn(z[0]) >= 2;
  })
    ? x.replace(/,? like an? (swimmer or a dancer|dancer|long-distance runner|rock climber|gymnast)(: [^.]*)?$/, "")
    : x;
  /* v119: at the top of the scale the slimness is the waist's */
  /* v128 review: fat on the belly, flanks or back from "Visible" up: the build is slim, not lean or wiry, and never a fitness model's;
     fat at the waist: never slim-waisted */
  /* v136 (self-review: "Very lean and wiry" next to soft upper arms that sag): the soft upper arms too */
  /* v139: the front of the thighs too */
  x = sdFatTorso() >= 2 || sdArmFat() >= 2 || sdFatOn("fatThighs") >= 2 || sdFatOn("fatKnees") >= 2 ? x.replace(/^(very )?lean( and (wiry|sinewy))?\b/, "$1slim").replace(", like a fitness model", "") : x;
  x = sdCurvyMax() && !sdFatWaist() ? x.replace(/^(very )?slim\b/, "$1slim-waisted") : x;
  /* v130 (user: the fat did not show under "well-developed but lean muscles") */
  x = SD_FAT_Z.some(function (z) {
    return sdFatOn(z[0]) >= 2;
  })
    ? x.replace("well-developed but lean muscles", "well-developed muscles under a layer of soft fat")
    : x;
  /* v121 (user, from two v120 sheets: the glutes grew, the hips did not, and the body came out as a fitness model's, abs and veins
     showing): at the top of the scale a slim woman with ordinary muscle is curvy, not "athletic" or "toned" */
  return sdCurvyMax() && e.fat <= 1 && e.muscle <= 2 ? x.replace(/ and (lightly toned|athletic)$/, " and curvy") : x;
}
/* v121: in the front view the width of the hips is drawn by the upper thighs, so "slim" or "average" thighs cap it (the v120 sheets:
   slim thighs with a gap between them, hips no wider than the shoulders); at the top of the hip scale the upper thighs are full and
   carry that width (the user allowed fuller thighs), slimmer from mid-thigh down. Both engines. */
var SD_THIGH_CURVE = "full upper thighs that touch at the top, their outer line continuing the curve of the hips, slimmer from mid-thigh to the knees";
function sdThighCurve() {
  return 4 === e.hips && sdCurvy() && e.thighs <= 2;
}
function sdThighs() {
  /* v140: "Intérieur des cuisses" on "Écart": the full upper thighs no longer touch */
  var x = sdThighs0();
  return sdPick(SD_THIGHGAP, "thighGap") && "gap" === e.thighGap ? x.replace(" that touch at the top", "").replace(" touching at the top", "") : x;
}
function sdThighs0() {
  return sdThighCurve()
    ? /* v122: square glutes or hip dips: the outer line is not a curve from the hip into the thigh */
      sdGlDefOn("dips")
      ? "full upper thighs touching at the top, as wide as the hips below the dip, slimmer from mid-thigh down"
      : sdGlDefOn("square")
        ? "full upper thighs touching at the top, as wide as the hips, slimmer from mid-thigh down"
        : SD_THIGH_CURVE
    : t1("thighs", e.thighs);
}
/* v122 (user: the glutes always came out perfect; wanted malformed ones, by their name): "Fessiers : défauts", ticked on top of the
   volume and the shape, adult person only (a child's Corps tab shows only the child's own controls). Names from plastic surgery: the
   square frame of Mendieta's classification (the upper hip and the outer thigh standing out equally; Centeno and Bossert, "Gluteal
   contouring and rejuvenation"), the depression on the side below the hip ("hip dips"; the retrotrochanteric depression, Lee, Roberts
   and Bruner 2009), gluteal ptosis (the lower part drooping below the crease) with a transverse roll of fat just below the crease
   ("banana roll", same 2009 paper). Both engines. */
function sdGlDefOn(k) {
  /* v157: "Fessiers : côtés" set (not Auto) decides the dip: Creux and Légèrement creux say it, Pleins and Très pleins take it away */
  if ("dips" === k && sdGlSide() >= 0) return sdGlSide() <= 1;
  /* v157 review: full sides never next to square sides; glute muscles from "Toniques" up never next to "Mous" */
  if ("square" === k && sdGlSide() >= 3) return !1;
  if ("soft" === k && +e.gluteMus >= 2 && "person" === e.mode && !sdChild(e)) return !1;
  return "person" === e.mode && !sdChild(e) && (e.glutesDef || []).indexOf(k) >= 0;
}
/* v157 (user, his render with "Très bombés": "sur les côtés il doit pouvoir aussi être plus rempli, avec un curseur, regarde bien il y a un
   creux"): "Fessiers : côtés", from a clear hollow on each side to very full sides, Auto in the middle (2, nothing said, as before); a
   woman's or an androgynous person's (a man has his own flaw "Pleins sur les côtés"); -1 when Auto or not shown */
/* v157 (user: "je dois pouvoir faire des jambes fuselées aussi, de coureur ; là les jambes ont toujours finalement la même forme"):
   "Forme des jambes", the outline of the whole leg, after the thighs (both engines); the size of the thighs and of the calves keep their
   own sliders: with "Mollets" set, the calves are its own, and the calves drawn at random go whenever a shape names them */
/* v157 review: the shape of the leg, never its size (the thigh size set above stays), and the quadriceps of "Puissantes" left to "Cuisses :
   avant" when it is set */
var SD_LEGSHAPE = {
  runner: ["long, tapered runner's legs: lean, elongated thigh muscles, the thighs narrowing steadily from the hips to slim knees", "; high, compact calves and slim ankles"],
  sprinter: ["powerful sprinter's legs: muscular thighs%q, the legs tapering firmly to the ankles", "; thick, muscular calves"],
  straight: ["straight legs with little taper: the thighs, knees and calves close in width, a straight outline from the hips to the ankles", ""],
  curvy: ["shapely legs: rounded upper thighs, a clear inward curve at the knees", "; rounded calves and slim ankles"],
};
/* v157 (ui_v157): the calves of a shape after a semicolon, never read as part of "within the thigh size set above" */
function sdLegShape() {
  var x = sdPick(SD_LEGSHAPE, "legShape");
  /* v157 (user, his render with these sliders near the top: "j'ai toujours des jambes qui sont les mêmes … les mollets qui doivent être
     musclés, ça se voit pas"): the calves set by "Mollets" said here, with the legs, no longer at the end of the body details */
  /* v157b (GPT audit of v157, checked: "Droites" with "Cuisses" Très fortes and "Mollets" Minces said the thighs, knees and calves close in
     width): with the calves set, "Droites" says the straight axis of the leg, the widths left to the thighs and calves set */
  x && "straight" === e.legShape && +e.calves >= 1 && (x = ["straight legs: no inward curve at the knees, each leg running straight down from the hip to the ankle", ""]);
  var t = x ? x[0].replace("%q", +e.thighFront >= 1 ? "" : " with a visible sweep of the quadriceps above the knee") + ", within the thigh size set above" + (+e.calves >= 1 ? "" : x[1]) : "";
  /* v157 review: "Forte" or soft knees: no lean muscles, slim knees or slim ankles said with the shape */
  (+e.fat >= 3 || sdFatOn("fatKnees") >= 2) && (t = t.split("to slim knees").join("to the knees"));
  +e.fat >= 3 && (t = t.split("lean, elongated").join("elongated").split(" and slim ankles").join(""));
  return [t, sdThighFront(), sdCalvesTxt()].filter(Boolean).join("; ");
}
function sdCalvesTxt() {
  return "person" === e.mode && !sdChild(e) && +e.calves >= 1 ? t1("calves", Math.min(4, Math.round(+e.calves))) : "";
}
/* v157 (same render): Seedream weights the start of the prompt most (Runware, Seedream prompting guide, v129): muscular legs or glutes
   set by these sliders are also said in the first sentence, with the age, height and weight */
function sdLegMus() {
  return "person" === e.mode && !sdChild(e) && ("sprinter" === e.legShape || +e.thighFront >= 3 || +e.calves >= 3);
}
function sdLegLead() {
  var l = sdLegMus(),
    g = "person" === e.mode && !sdChild(e) && +e.gluteMus >= 3;
  return l || g ? ", with strong, muscular " + (l && g ? "legs and glutes" : l ? "legs" : "glutes") : "";
}
/* the shape names the ankles (runner, shapely), "Mollets" left on Auto: the drawn ankles go */
function sdLegAnkles() {
  var x = sdPick(SD_LEGSHAPE, "legShape");
  return !!x && !(+e.calves >= 1) && /ankles/.test(x[1]);
}
/* v157 (user: "il faut que je puisse changer l'avant de la jambe, le haut de la cuisse, qui est finalement toujours pareil quel que soit le
   curseur"): "Cuisses : avant", the front of the thighs in profile, from flat to a powerful quadriceps sweep (Auto: nothing written);
   said with the leg shape (sdLegShape), both engines and the body text of "Itérer" and of a locked edit */
var SD_THIGHFRONT = [
  "",
  "the front of the thighs flat, running almost straight from the hip to the knee in profile",
  "the front of the thighs gently rounded in profile, a soft forward curve from the hip to the knee",
  "muscular front thighs: the quadriceps rounded and bowing forward in profile, the inner teardrop muscle visible just above the knee",
  "very muscular front thighs: a powerful sweep of the quadriceps, the front of the thigh bowing clearly forward in profile and widening the outer thigh in the front view, the inner teardrop muscle bulging above the knee",
];
function sdThighFront() {
  return "person" === e.mode && !sdChild(e) ? SD_THIGHFRONT[Math.max(0, Math.min(4, Math.round(+e.thighFront || 0)))] || "" : "";
}
function sdGlSide() {
  var v = Math.round(+e.glutesSide);
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && !isNaN(v) && 2 !== v && v >= 0 && v <= 4 ? v : -1;
}
/* v156 (user: "les fessiers défaut pour les hommes c'est pas les mêmes"): a man's list (glutesDefOptsM). A shallow hollow on the side of a
   man's glutes (the trochanteric depression) is the look rated most attractive for men, not a flaw (Kollu et al., Plastic and
   Reconstructive Surgery, December 2023, via HealthDay, 3 January 2024): so no "Creux sur les côtés" offered to a man, and its opposite,
   the sides filled out with no hollow, is one of his flaws; no "Carrés" either (a man's frame is commonly square). "Tombants" is shared.
   v156 review: a flaw ticked from the other list (a man saved by v155 with "Carrés", a character whose presentation changed) is still
   said, as before, and shown after the list (sdOpts) so it can be unticked. */
/* a sagging glute is never high */
/* port review: "Gros" and "Très gros" (v119) describe a round glute that projects in profile; with "Plats" or "Bas" set in "Fessiers :
   galbe", which its hint says is independent of the volume, the size stays and the profile words go (they contradicted "flat in profile"
   and "never round"), both engines */
function sdGlVol(x) {
  return ["flat", "low"].indexOf(e.glutesShape) >= 0
    ? String(x)
        .replace("very large, round glutes", "very large glutes")
        .replace(", projecting far behind the line of the lower back", "")
        .replace("in the side views the back of the glutes sits about a hand's width behind the line of the shoulder blades, a deep shelf below the lower back, and ", "")
    : x;
}
function sdGlShape(x) {
  return sdGlDefOn("sag") ? String(x).replace(/\b(very )?high and /, "") : x;
}
function sdGlDef() {
  var a = [];
  sdGlDefOn("square")
    ? a.push("square from behind, the sides running almost straight into the thighs" + (sdGlDefOn("dips") ? (0 === sdGlSide() ? " apart from a clear hollow below each hip" : " apart from a shallow dip below each hip") : ""))
    : sdGlDefOn("dips") && a.push(0 === sdGlSide() ? "a clear hollow on each side between the hip and the thigh" : "a shallow dip on each side between the hip and the thigh");
  /* v157 review: with visible or marked saddlebags, filled out down to the saddlebag, which keeps its bulge */
  var sb = rM() && "light" !== e.saddle;
  3 === sdGlSide() && a.push(sb ? "full at the sides, the glutes and hips rounded outward from the hip down to the saddlebag, no hollow between them" : "full at the sides, the glutes and hips rounded outward between the hip and the thigh in one smooth curve");
  4 === sdGlSide() && a.push(sb ? "very full at the sides: the side of the hips and glutes filled out from the waist down to the saddlebag, no hollow between them, in the front and back views" : "very full at the sides: the side of the hips and glutes filled out in one round, continuous curve from the waist to the thigh in the front and back views");
  sdGlDefOn("sag") &&
    a.push("low" === e.glutesShape ? "a soft roll of fat just below the crease on each thigh" : "the lower part drooping over the crease, a soft roll of fat just below it on each thigh");
  /* v156: a man's own flaws */
  sdGlDefOn("full") && a.push("full at the sides, rounded out between the hip and the thigh, with no hollow on the side");
  /* v157 (user: "il faut aussi des muscles dans les fessiers, car la partie sur le côté des fessiers peut être très musclée ; là il n'y a pas
     de curseur, du coup ça donne un creux au niveau des fesses sur les côtés"): "Fessiers : muscles", the gluteus maximus and, from
     "Musclés", the gluteus medius filling the upper side of each hip (no hollow there, unless "Fessiers : côtés" sets one). Both engines,
     the body text of "Itérer" and of a locked edit too (with the flaws, sdGlDef) */
  var gm = "person" === e.mode && !sdChild(e) ? Math.max(0, Math.min(4, Math.round(+e.gluteMus || 0))) : 0,
    hollow = sdGlDefOn("dips");
  gm &&
    a.push(
      [
        "",
        /* v157c (user: "je ne peux pas dire plein et doux, ça existe pas"): "Doux", supple flesh, never loose, unless another setting makes the
           glutes sag (a man's "Mous", "Tombants", the low shape, glute fat from "Marquée", the "Forte" build); no "soft" added (the filter,
           lessons 1) */
        "smooth, supple glutes with little muscle tone" + (sdGlDefOn("soft") || sdGlDefOn("sag") || "low" === e.glutesShape || sdFatOn("fatGlutes") >= 3 || 4 === +e.fat ? "" : ", never loose or sagging"),
        "toned, firm glute muscles",
        "muscular glutes: a firm, well-developed gluteus maximus, and the gluteus medius visibly full on the upper side of each hip" + (hollow ? "" : ", filling it into a smooth, full curve"),
        "very muscular glutes: a powerful, sharply shaped gluteus maximus and a thick gluteus medius bulging on the upper side of each hip" + (hollow ? "" : ", the side of the hips full and firm") + ", as on a sprinter or a weightlifter",
      ][gm],
    );
  sdGlDefOn("soft") && a.push("soft and untoned, little muscle under the skin, the shape slightly loose");
  return a.join("; ");
}
/* v122: with a flaw ticked the glutes are plainly natural: "naturally shaped, not surgically enhanced" goes (word budget) */
function sdGlNat(x) {
  return sdGlDef() ? String(x).replace("; naturally shaped, not surgically enhanced", "") : x;
}
/* v122 (user: from a description, Seedream never draws very large glutes or very wide hips, but it enlarges them at once in an edit of the
   body sheet it generated): with "Très gros" glutes or "Très larges" hips, card 2b gives that edit, to run on the body sheet of card 2
   (Seedream, native adult person only: where card 3 exists) */
/* v144 (user, card 2b on his render: "c'est toujours pas comme la fille"; the waist kept, the width added down the whole thigh): with the
   hourglass (sdHourglass) card 2b also exists from "Larges" hips, and narrows the waist as it widens the hips */
function sdGrowOn(t) {
  return "seedream" === t.model && "person" === t.mode && !sdChild(t) && sdNative(t) && !sdOff(t) && (4 === +t.hips || 4 === +t.glutes || rq(t, sdHourglass));
}
/* v143 (user: "quand on choisit le max, mettre un mot qui dit : si on veut plus, cliquer Agrandir"): the hint of "Hanches" and "Fessiers :
   volume" at the top of the scale, where card 2b exists (sdGrowOn). His three renders kept the hips at about 1.4 times the waist in the
   front view whatever the text asked (v143 lessons), the v121 sheets too. */
function sdGrowHint(k) {
  /* the first sentence is the one shown before "Plus" (SdMore cuts at the first . ! ? » or ")"): the whole step, no quote marks in it */
  if (!sdGrowOn(e) || 4 !== +e[k]) return "";
  return "hips" === k
    ? sdT("Au maximum : pour des hanches plus larges, génère la planche corps, puis clique sur Agrandir et lance ce prompt dans Seedream sur l'image obtenue, une ou deux fois. Seedream ne va guère plus loin à partir du texte seul (carte 2b, retouche de la planche).",
        "At the maximum: for wider hips, generate the body sheet, then click Enlarge and run that prompt in Seedream on the image you got, once or twice. Seedream goes hardly further from the text alone (card 2b, an edit of the sheet).")
    : sdT("Au maximum : pour des fessiers plus gros, génère la planche corps, puis clique sur Agrandir et lance ce prompt dans Seedream sur l'image obtenue, une ou deux fois. Seedream ne va guère plus loin à partir du texte seul (carte 2b, retouche de la planche)." + (sdHourglass() ? " Avec le sablier, cette retouche affine aussi la taille et élargit les hanches." : ""),
        "At the maximum: for larger glutes, generate the body sheet, then click Enlarge and run that prompt in Seedream on the image you got, once or twice. Seedream goes hardly further from the text alone (card 2b, an edit of the sheet)." + (sdHourglass() ? " With the hourglass, that edit also narrows the waist and widens the hips." : ""));
}
function sdGrowPrompt() {
  var hg = sdHourglass(),
    h = 4 === +e.hips,
    g = 4 === +e.glutes,
    p = "m" === e.pres ? "his" : "f" === e.pres ? "her" : "their",
    a = [],
    f = [];
  /* v123 (user: "Agrandir" is a bit too much, 25% less): every amount one step down ("much" to "noticeably", "clearly wider" to "wider",
     "much further" to "further"), "a moderate step" said, and "at the top of what real bodies show" removed, since it pushed toward the
     maximum. Wording, not a measured 25%: a text prompt sets no exact amount; a step too small is run again (card 2b, step 3). */
  /* v144: the hourglass, the waist narrowed and the width added at the top of the hips, the thighs tapering to the knees */
  hg
    ? a.push(
        /* the narrowest point where "Hauteur de la taille" puts it (the body prompt says the same); the inner thighs before the taper */
        /* review: "wider than the shoulders" only where the body says so; the widest point as "Point le plus large des hanches" says
           ("Haut" has no effect at "Très larges", sdHipPos); the inner thighs as "Intérieur des cuisses" says, nothing on "Auto" */
        /* v145 (user, on two edits of his sheet: "ça me semble pas réaliste en agrandissant, c'est bizarre"; measured: the hips +7 and
           +15%, the waist -4 and -5%, but pinched just above the bikini line and flaring at once, the upper thighs bulging): the waist
           curving in smoothly, the hips widening gradually and, without a dip, saddlebags or square glutes (which break that outline, as
           in sdHipPos), one long curve down to the knees with the width spread along the thighs; "Haut" keeps its curve just below the
           waist, as the body prompt says */
        "in the front and back views the sides of the torso curve in smoothly to the narrower waist, its narrowest point " +
          ("high" === e.waistPos ? "just below the ribs" : "low" === e.waistPos ? "close to the top of the hips" : "a little above the navel") +
          ("high" === e.hipPos && 4 !== +e.hips ? ", then curve out just below the waist into the hips, widest at the hip bones" : sdHipFlare() ? ", then swing out in a full, rounded curve that starts just below the navel, already far wider than the waist a hand's width below it, widest at the top of the thighs" : ", then widen gradually into the hips, widest at the top of the thighs") +
          (+e.shoulders < +e.hips ? " and wider than the shoulders" : "") +
          /* v145 review: not with "Haut" (its width at the hip bones, as sdHipPos says it without the sweep); the width on the hips and the
             upper thighs, fading toward the knees (the v144 card put it down the whole thigh: a heavy pear) */
          (("high" === e.hipPos && 4 !== +e.hips) || sdHipFlare() || sdGlDefOn("dips") || sdGlDefOn("square") || rM() ? "" : ", the outline one long, smooth curve from the waist down to the knees, the extra width spread over the hips and upper thighs, fading out toward the knees") +
          "; " +
          ({ touch: "the inner thighs touching at the top, ", touchlong: "the inner thighs touching from the top down to just above the knees, " }[sdPick(SD_THIGHGAP, "thighGap") ? e.thighGap : ""] || "") +
          "the thighs then taper smoothly to the knees",
      )
    : h && a.push("in the front and back views the hips and upper thighs become wider than the shoulders" + (sdHipFlare() ? ", swinging out in a full, rounded curve that starts just below the navel" : "") + ", the upper thighs fuller" + (sdPick(SD_THIGHGAP, "thighGap") && "gap" === e.thighGap ? "" : " and touching at the top"));
  g && a.push("in the side views the glutes project further behind the lower back" + (h || hg ? "" : ", and from behind they fill the whole width of the hips"));
  /* v122 (user: with this prompt, never a caricature; every flaw kept, even made stronger: with glutes that big, flaws are a must).
     v144 (user: "de la cellulite, de la graisse, je n'ai jamais demandé ça"): every flaw kept at its strength, none made stronger */
  sdGlDefOn("square") && f.push("the glutes stay square from behind, the sides almost straight into the thighs");
  sdGlDefOn("dips") && f.push("the dip below each hip stays, next to the wider hips");
  sdGlDefOn("sag")
    ? f.push("the lower part keeps its droop, its long crease and the roll of fat just below it")
    : "low" === e.glutesShape && f.push("the glutes stay low and heavy, fullest just above the crease, never lifted");
  return (
    "Edit image 1, a four-view body reference sheet of one adult " + ("m" === e.pres ? "man" : "f" === e.pres ? "woman" : "person") + ": make " + p + " " +
    (hg ? "waist noticeably narrower and " + p + " hips noticeably wider" + (g ? ", and " + p + " glutes noticeably larger" : "") : h && g ? "hips noticeably wider and " + p + " glutes noticeably larger" : h ? "hips noticeably wider" : "glutes noticeably larger") +
    /* v145: with the hourglass, a small step (the user found two moderate steps unrealistic); run again if it is not enough */
    " in all four views, " + (hg ? "a small step" : "a moderate step") + ", by the same amount in every view: " + a.join("; ") + "." +
    /* v144 (user: "quand on agrandit c'est horrible, de la cellulite apparaît, de la graisse, je n'ai jamais demandé ça"): the added
       volume is flesh like the rest of the body, the skin and its flaws kept at the strength image 1 has (v122 made them grow) */
    " The result stays a believable real body, never a cartoon, inflated or caricatured shape: the added volume is natural flesh that settles with gravity like the rest of the body." +
    " The skin, its texture and every mark of image 1 stay exactly as they are, at the same strength, simply following the new shape" +
    (f.length ? "; " + f.join("; ") : "") + "." +
    /* v145 (tested on his sheet): wider hips need room beside the arms, which "Keep the arms" and "pose" pinned against the body; and
       the edit turned the full-coverage top into a plunging one ("same cut and coverage" not kept): every garment said */
    " Keep " + (nw() ? "" : "the head and face, ") +
    (hg ? "the bust, the shoulders, the knees, the lower legs" : "the waist, the upper body, the lower legs") +
    " and everything else exactly as in image 1: framing, pose" + (hg || h ? " (the arms may move outward just enough that a clear gap of backdrop still shows between each arm and the wider hips and thighs)" : "") +
    /* v145 review: every garment, not "top and bottom" (a shirtless man, a one-piece swimsuit, the user's own outfit) */
    ", skin tone, marks, outfit (" + ("m" === e.pres ? "the same garments as in image 1, with the same cut and coverage" : "every garment exactly as in image 1, with the same cut, neckline, straps and coverage") + ", simply following the new shape), light, backdrop and panel layout. Not surgically enhanced."
  );
}
/* v132 (user, two Seedream body sheets from the v131 prompt, audited in pixels: the deltoids sharper but the width across them +1.5% and
   +3.6% only, deltoids / hips 1.17 and 1.15 for 1.4 asked, a small bust drawn on "Très menue" in both; then "oui, fais-le"): the
   method of card 2b, which works for the hips and glutes (v122, seen by the user), for the upper body: broader shoulders and larger
   deltoids, wider lats, a flat chest, as an edit of the body sheet Seedream generated. Seedream, native adult person only, as card 2b.
   Not checked on renders yet. */
function sdGrowUpParts() {
  var d = sdMusLv("delts");
  return {
    big: ["big", "huge"].indexOf(d) >= 0,
    sh: ["big", "huge"].indexOf(d) >= 0 || e.shoulders >= 3,
    la: ["big", "huge"].indexOf(sdMusLv("lats")) >= 0,
    fl: "m" !== e.pres && sdCi(e.chest) <= 0,
  };
}
function sdGrowUpOn(t) {
  return (
    "seedream" === t.model && "person" === t.mode && !sdChild(t) && sdNative(t) && !sdOff(t) &&
    rq(t, function () {
      var p = sdGrowUpParts();
      return p.sh || p.la || p.fl;
    })
  );
}
function sdGrowUpPrompt() {
  var p = sdGrowUpParts(),
    pr = "m" === e.pres ? "his" : "f" === e.pres ? "her" : "their",
    r = sdShoulderRatio(),
    v = e.waist <= 2 && sdFatOn("fatFlanks") < 2 && 4 !== +e.fat,
    fat = sdArmFat() >= 2 || sdFatOn("fatBack") >= 2 || e.fat >= 3,
    a = [];
  p.sh &&
    a.push(
      "make " + pr + " shoulders noticeably broader" +
        (p.big ? " and " + pr + " deltoids larger and rounder, their caps standing out further past the upper arms" : "") +
        (r ? ", the shoulders reaching about " + r + " times the hip width across the deltoids in the front view" : ""),
    );
  p.la && a.push("make " + pr + " lats wider, flaring further out below the armpits" + (v ? ", the back clearly wider there than at the waist" : ""));
  p.fl &&
    a.push(
      /* v134: in positive terms only (SD_PECS_FLAT_SD) */
      "make " + pr + " chest completely flat, like " + (sdPecsF() ? "a male athlete's" : "a slim man's") + " chest: in the side views the chest line runs straight down from the collarbones" +
        (sdPecsF() ? ", shaped only by the firm pectoral muscles" : "") +
        ", the top lying flat on it",
    );
  return (
    "Edit image 1, a four-view body reference sheet of one adult " + ("m" === e.pres ? "man" : "f" === e.pres ? "woman" : "person") +
    ": retouch the upper body only, in all four views, a moderate step, by the same amount in every view: " + a.join("; ") + "." +
    " The result stays a believable real body, never a cartoon or a caricature" +
    (p.sh || p.la ? ": the added muscle is dense, real muscle with its natural shape" + (fat ? ", under the same soft layer of fat as in image 1" : "") : "") + "." +
    " Keep " + (nw() ? "" : "the head and face, ") +
    "the waist, the belly, the hips, the glutes, the legs, the skin texture, the marks and soft folds, the outfit (same cut and coverage, following the new shape), the light, the backdrop, the framing, the pose and the panel layout exactly as in image 1."
  );
}
/* v147 (user, after three edits of his sheet measured in both profiles, "oui, fais-le"): the bust retouch, for "Très généreuse" +
   "Tombante" (the v146 text; not "Très tombante", not the moderate Auto drop), Seedream, native adult. From a description Seedream draws
   that bust full and domed in profile whatever the text (four renders, three texts: the upper slope 12 to 18 px above a straight line);
   in an edit "lower" alone added volume (+14 to 35%), "less deep" alone lifted it and halved it in profile; the lowest point held and the
   lost depth sent to the sides (this text, tested as it is): one render in two, the depth -8 to -11%, the dome -30 to -38%, the drop kept,
   the profile volume -11 to -19%. A small effect: run twice, keep the better, never again on a retouched image (more volume lost). */
function sdGrowBustOn(t) {
  return (
    "seedream" === t.model && "person" === t.mode && !sdChild(t) && sdNative(t) && !sdOff(t) &&
    rq(sdAutoBust(t), function () {
      /* v147 review: not when the body comes from the dressed sheet ("Source du corps : Ma planche habillée"), whose prompt has no bust text */
      return "m" !== e.pres && 4 === +e.chest && "low" === e.bustShape && "moderate" !== e.sdAutoTier && !sdDropX() && !sdUseBodyImg();
    })
  );
}
function sdGrowBustPrompt() {
  return (
    "Edit image 1, a four-view body reference sheet of one adult " + ("f" === e.pres ? "woman" : "person") +
    ": change the bust only, by the same amount in every view: in the two side views it sits closer to the chest, its front about two fingers' width nearer the ribcage, the front of the bust a straight slope from below the collarbones down to its fullest point; its lowest point stays exactly at the same level as in image 1, a hand's width above the navel, so it keeps its low, heavy drop; the depth it loses goes to the sides: in the front view it spreads slightly wider toward the arms, at the same height." +
    " The result stays a believable real body: natural flesh that settles with gravity like the rest of the body. The skin, its texture and every mark of image 1 stay exactly as they are, at the same strength." +
    " Keep everything else exactly as in image 1: " + (nw() ? "" : "the head and face, ") +
    "framing, pose, shoulders and arms, waist, hips, glutes, legs, skin tone, marks, outfit (every garment exactly as in image 1, with the same cut, neckline, straps and coverage, simply following the new shape), light, backdrop and panel layout. Not surgically enhanced."
  );
}
/* v123 (user: the buttons of the bottom bar need a tooltip on hover, Tête, Corps, Agrandir, Ma tenue..., translated): what each one copies.
   French here, English through the interface map (the title prop is translated like the labels). */
function sdBarTip(k, off) {
  /* this repository's animal and object bars: the animal sheet first, its head close-ups optional; one card per object or place view */
  if ("animal" === e.mode && "body" === k) return sdT("Copier le prompt de la planche de l'animal (carte 1)", "Copy the prompt of the animal sheet (card 1)");
  if ("animal" === e.mode && "head" === k) return sdT("Copier le prompt des gros plans de tête (carte 2)", "Copy the prompt of the head close-ups (card 2)");
  var v = "object" === e.mode && /^obj(\d?)$/.exec(k);
  if (v) return sdT("Copier le prompt de la vue " + (v[1] || 1) + " (carte " + (v[1] || 1) + ")", "Copy the prompt of view " + (v[1] || 1) + " (card " + (v[1] || 1) + ")");
  if ("head" === k) return sdBaby(e) ? "Copier le prompt de la planche bébé (carte 1)" : "Copier le prompt de la planche tête (carte 1)";
  if ("body" === k) return nw() || sdChildHl(e) ? "Copier le prompt de la planche corps sans tête (carte 2)" : "Copier le prompt de la planche corps (carte 2)";
  if ("grow" === k) return sdHourglass() ? (4 === +e.glutes ? "Copier le prompt de la carte 2b : affiner la taille, élargir les hanches et agrandir les fessiers de ta planche corps" : "Copier le prompt de la carte 2b : affiner la taille et élargir les hanches de ta planche corps") : "Copier le prompt de la carte 2b : agrandir hanches et fessiers de ta planche corps";
  if ("growUp" === k) return "Copier le prompt de la retouche du haut du corps de ta planche corps (épaules, dos, poitrine)";
  if ("fin" === k) return "Copier le prompt de la carte 4 : finition photo de ta planche finale";
  if ("growBust" === k) return "Copier le prompt de la retouche de la poitrine de ta planche corps (moins bombée de profil, la chute gardée)";
  if ("iter" === k) {
    if (off) return "Carte 3 : choisis ou écris d'abord une retouche";
    var op = sdOp(e);
    return "join" === op
      ? sdNanoJoin()
        ? "Copier le prompt de la carte 3 pour Nano Banana : assembler ta planche corps sans tête et la planche tête"
        : sdGptJoin()
        ? "Copier le prompt de la carte 3 pour GPT Image 2.5 : assembler ta planche corps sans tête et la planche tête"
        : "Copier le prompt de la carte 3 : assembler ta planche corps sans tête et la planche tête"
      : "dress" === op
        ? "Copier le prompt de la carte 3 : habiller ta planche corps sans tête"
        : "dressMine" === op
          ? String(e.sdIter || "").trim()
            ? "Copier le prompt de la carte 3 : habiller ta planche corps selon ton texte de la carte 3"
            : "Copier le prompt de la carte 3 : habiller ta planche corps avec la tenue de l'onglet Tenue"
          : "heads" === op
            ? "Copier le prompt de la carte 3 : ajouter les têtes à ta planche habillée"
            : "Copier le prompt de la carte 3 : ta retouche";
  }
  return { obj: "Copier le prompt de la planche (carte 1)", editHead: "Copier le prompt de retouche de la planche tête", editBody: "Copier le prompt de retouche de la planche corps", editObj: "Copier le prompt de retouche de la planche" }[k] || "";
}
/* v125 (user: "we should be able to export and import the data, or we get lost every time finding the things, the people and what we
   had set; a new Import / Export button, in colour, prominent and working"): "Exporter" saves the whole saved state (every setting, the
   settings kept for the other modes, the name, the last head sheet copied) as a .json file named after the character; "Importer" reads
   such a file back. The file is checked (format tag, then each key against the type of its default; unknown keys dropped, list items
   other than text or numbers dropped), a confirmation is asked (it replaces the current settings), then it is written to the storage the
   tool reads and the page reloads, so an imported file goes through the same migrations as a saved state. Photos are never stored by the
   tool, so never exported: a "Partir d'une photo" setting comes back on, the photo has to be attached again in Seedream or GPT. */
var SD_IO_APP = "planches-seedance";
function sdIoVal(v, d) {
  if (null === d) return null === v || ("object" == typeof v && !Array.isArray(v));
  if (Array.isArray(d)) return Array.isArray(v);
  return typeof v === typeof d && ("number" != typeof v || isFinite(v));
}
/* v130 (GPT audit of v129, checked: an exported file edited to "fat": 500 was saved, then the page broke, blank; "state": [] replaced
   every setting): each value is also checked against the choices of its control (every option list of the tabs, a range for the
   numbers typed in, the type and engine switches); a value outside them is dropped, never saved; a file with nothing usable is refused
   and the session is kept. 2.5 stays allowed for the bust (an option of its list). */
var SD_IO_DOM = null,
  sdIoDrop = 0;
function sdIoDom() {
  if (SD_IO_DOM) return SD_IO_DOM;
  /* v138 (review): "tangaTop" is set by its own radio, outside the tabs: its two values here */
  var d = { mode: ["person", "animal", "object"], style: ["photo", "3d", "2d"], model: ["gpt", "seedream"], tangaTop: ["loose", "bikini"] };
  /* v143 review: the last "Silhouette type" button clicked, an empty value or a button's id */
  d.sdShapePick = [""].concat(SD_SHAPES.map(function (x) {
    return x[0];
  }));
  /* v157c review: the spacing and the height of "Forme de la poitrine" (since v157 their values were not all in tZ: "close", "out", "fwd"
     dropped at import, any height accepted) */
  d.bustWide = ["no", "yes", "close", "out", "fwd"];
  d.bustHigh = ["auto", "high", "vhigh"];
  [t2, t3, t4].forEach(function (tabs) {
    (tabs || []).forEach(function (tb) {
      (tb.items || []).forEach(function (it) {
        if (!it || "string" != typeof it.k) return;
        if ("num" === it.t) {
          "number" == typeof it.min && "number" == typeof it.max && (d[it.k] = { min: it.min, max: it.max });
          return;
        }
        var names = "function" == typeof it.o
          ? ["f", "m", "x"].map(function (p) {
              return rq(Object.assign({}, e, { pres: p }), it.o);
            })
          : [it.o || it.k],
          v = Array.isArray(d[it.k]) ? d[it.k] : [];
        names.forEach(function (n) {
          (tZ[n] || []).forEach(function (o) {
            v.indexOf(o[0]) < 0 && v.push(o[0]);
          });
        });
        v.length && (d[it.k] = v);
      });
    });
  });
  return (SD_IO_DOM = d);
}
function sdIoClean(s, nested) {
  var o = {};
  if (!s || "object" != typeof s || Array.isArray(s)) return o;
  var dom = sdIoDom();
  for (var k in tJ) {
    if (!Object.prototype.hasOwnProperty.call(s, k) || (nested && "modeCfg" === k)) continue;
    var v = s[k],
      dm = dom[k];
    if (!sdIoVal(v, tJ[k])) {
      sdIoDrop++;
      continue;
    }
    Array.isArray(v) &&
      (v = v.filter(function (x) {
        return ("string" == typeof x || ("number" == typeof x && isFinite(x))) && !(Array.isArray(dm) && dm.indexOf(x) < 0);
      }));
    if (!Array.isArray(v) && dm && (Array.isArray(dm) ? dm.indexOf(v) < 0 : "number" == typeof v && (v < dm.min || v > dm.max))) {
      sdIoDrop++;
      continue;
    }
    o[k] = v;
  }
  o.base && (o.base = sdIoClean(o.base, !0));
  if (o.modeCfg) {
    var m = {};
    /* v137: "sdObj" and "sdPlace" keep the object and the place of the shared mode "object" apart (sdKindSwap) */
    ["person", "animal", "object", "sdObj", "sdPlace"].forEach(function (k) {
      o.modeCfg[k] && "object" == typeof o.modeCfg[k] && !Array.isArray(o.modeCfg[k]) && (m[k] = sdIoClean(o.modeCfg[k], !0));
    });
    o.modeCfg = m;
  }
  return o;
}
function sdIoFile(t) {
  var d = new Date(),
    p = function (x) {
      return (x < 10 ? "0" : "") + x;
    };
  return (
    "planches_" +
    (t8("object" === t.mode ? t.objName : t.name) || ("object" === t.mode ? "objet" : "animal" === t.mode ? "animal" : "perso")) +
    "_" + d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "_" + p(d.getHours()) + "h" + p(d.getMinutes()) + ".json"
  );
}
function sdExport(t, h) {
  try {
    var f = sdIoFile(t),
      b = new Blob([JSON.stringify({ app: SD_IO_APP, format: 1, exported: new Date().toISOString(), state: t }, null, 1)], { type: "application/json" }),
      u = URL.createObjectURL(b),
      a = document.createElement("a");
    a.href = u;
    a.download = f;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(u);
    }, 1e3);
    h(sdT("Exporté : " + f + ". Garde ce fichier : « Importer » le recharge.", "Exported: " + f + ". Keep this file: “Import” loads it back."));
  } catch (x) {
    h(sdT("Export impossible dans ce navigateur.", "Export is not possible in this browser."));
  }
}
function sdImport(ev, h) {
  var fl = ev.target.files && ev.target.files[0];
  ev.target.value = "";
  if (!fl) return;
  var rd = new FileReader();
  rd.onload = function () {
    var j;
    try {
      j = JSON.parse(String(rd.result));
    } catch (x) {
      return h(sdT("Fichier illisible : ce n'est pas un export de Planches de référence.", "Unreadable file: not a Reference sheets export."));
    }
    if (!j || j.app !== SD_IO_APP || !j.state || "object" != typeof j.state || Array.isArray(j.state))
      return h(sdT("Ce fichier n'est pas un export de Planches de référence.", "This file is not a Reference sheets export."));
    sdIoDrop = 0;
    var cl = sdIoClean(j.state),
      nd = sdIoDrop;
    if (!Object.keys(cl).length || !cl.mode)
      return h(sdT("Ce fichier ne contient aucun réglage utilisable : rien n'a été changé.", "This file holds no usable setting: nothing was changed."));
    /* v133 (user: in the app's preview, "Importer" did nothing, the settings stayed, "Exporter" worked): the preview runs the page in a
       sandboxed frame where window.confirm is ignored (it returns false at once) and the storage may be refused, so the import stopped
       without a word. The question is now asked in the page, and the settings are applied to the page state directly (through the same
       loader as at start-up, ac), with no reload; the page saves them itself where the browser allows it. */
    sdIoPending = {
      name: fl.name,
      state: cl,
      /* v155: the settings this older file does not hold (sdNewMissing), marked once the import is confirmed */
      missing: sdNewMissing(j.state),
      q: sdT("Remplacer tous les réglages actuels par ceux de « " + fl.name + " » ? Exporte d'abord les réglages actuels si tu veux les garder." + (nd ? " " + nd + " valeur" + (nd > 1 ? "s" : "") + " hors des choix possibles " + (nd > 1 ? "seront ignorées" : "sera ignorée") + "." : ""), "Replace all the current settings with those of “" + fl.name + "”? Export the current settings first if you want to keep them." + (nd ? " " + nd + " value" + (nd > 1 ? "s" : "") + " outside the possible choices will be ignored." : "")),
    };
    h(sdT("Confirme l'import en haut de la page.", "Confirm the import at the top of the page."));
  };
  rd.onerror = function () {
    h(sdT("Fichier illisible.", "Unreadable file."));
  };
  rd.readAsText(fl);
}
var sdIoPending = null;
/* the import, once confirmed in the page: the same loader as at start-up (ac) on the imported settings, no reload */
function sdIoApply(n, h) {
  var p = sdIoPending;
  sdIoPending = null;
  if (!p) return;
  sdNewSetAll(p.missing);
  var st = ac(p.state),
    /* v155 review: what the imported page will show (a hidden setting, step 4 where it does not exist, are not announced) */
    nm = rq(sdG(st), sdNewCount);
  n(st);
  h(sdT("Importé : " + p.name + (nm ? ". Nouveautés depuis ce fichier marquées en rouge, sur leur valeur par défaut." : ""), "Imported: " + p.name + (nm ? ". What is new since this file is marked in red, on its default value." : "")));
}
function sdIoButtons(t, h, n) {
  var cls = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    st = { background: "hsl(var(--ok))" },
    ic = function (up) {
      return (0, l.jsx)("svg", {
        width: 16,
        height: 16,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2.4,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": !0,
        children: (0, l.jsx)("path", { d: up ? "M12 19V5M5 12l7-7 7 7M4 21h16" : "M12 3v14M5 10l7 7 7-7M4 21h16" }),
      });
    };
  return (0, l.jsxs)("div", {
    className: "flex flex-wrap items-center gap-2",
    role: "group",
    "aria-label": "Sauvegarde des réglages",
    children: [
      (0, l.jsxs)("button", {
        type: "button",
        className: cls,
        style: st,
        title: "Enregistre tous tes réglages dans un fichier .json (personne, animal, objet, nom, dernière planche tête copiée). Exporte avant « Nouveau personnage » pour ne rien perdre.",
        onClick: function () {
          sdExport(t, h);
        },
        children: [ic(!1), "Exporter"],
      }),
      (0, l.jsxs)("button", {
        type: "button",
        className: cls,
        style: st,
        title: "Recharge un fichier exporté : il remplace tous les réglages actuels.",
        onClick: function () {
          var i = document.getElementById("sd-io-file");
          i && i.click();
        },
        children: [ic(!0), "Importer"],
      }),
      (0, l.jsx)("input", {
        id: "sd-io-file",
        type: "file",
        accept: ".json,application/json",
        "aria-label": "Fichier à importer",
        style: { display: "none" },
        onChange: function (ev) {
          sdImport(ev, h);
        },
      }),
      sdNewNotice(h),
      sdIoPending &&
        (0, l.jsxs)("div", {
          role: "alertdialog",
          "aria-label": "Confirmer l'import",
          className: "w-full rounded-xl border-2 border-[hsl(var(--tape))] bg-card p-3 text-sm",
          children: [
            (0, l.jsx)("p", { className: "font-semibold", children: sdIoPending.q }),
            (0, l.jsxs)("div", {
              className: "mt-2 flex flex-wrap gap-2",
              children: [
                (0, l.jsx)("button", {
                  type: "button",
                  className: cls,
                  style: st,
                  onClick: function () {
                    sdIoApply(n, h);
                  },
                  children: "Remplacer",
                }),
                (0, l.jsx)("button", {
                  type: "button",
                  className: "inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  onClick: function () {
                    sdIoPending = null;
                    h(sdT("Import annulé : rien n'a changé.", "Import cancelled: nothing changed."));
                  },
                  children: "Annuler",
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
/* v126: image 1 of "Assembler" / "Ajouter les têtes", extended by 25% upward in the browser (nothing is sent anywhere): the body keeps
   its pixels and its size, and a band of backdrop grey above it leaves room for the neck and the head (the band, column by column,
   below). */
var SD_PREP = 0.25;
/* v134 (user, in the app's preview: "Image illisible" on a real sheet): the image was read through a blob: URL, which a page whose
   Content-Security-Policy leaves blob: out of img-src refuses to load (reproduced: the same message). The file is now decoded with
   createImageBitmap, which takes the file itself and no URL; then a data: URL, then the blob: URL. Only a file that none can decode is
   "illisible"; a failure after decoding says so, with its error name. */
function sdDecodeImage(f, ok, bad) {
  var viaUrl = function (u, next) {
      var im = new Image();
      im.onload = function () {
        ok(im, im.naturalWidth, im.naturalHeight, function () {
          /^blob:/.test(u) && URL.revokeObjectURL(u);
        });
      };
      im.onerror = function () {
        /^blob:/.test(u) && URL.revokeObjectURL(u);
        next();
      };
      im.src = u;
    },
    viaBlob = function () {
      try {
        viaUrl(URL.createObjectURL(f), bad);
      } catch (z) {
        bad();
      }
    },
    viaData = function () {
      try {
        var r = new FileReader();
        r.onload = function () {
          viaUrl(String(r.result || ""), viaBlob);
        };
        r.onerror = viaBlob;
        r.readAsDataURL(f);
      } catch (z) {
        viaBlob();
      }
    };
  /* the EXIF orientation applied, as an <img> does; a browser that does not know the option rejects it and the data: URL is used */
  var pr = null;
  try {
    pr = "function" == typeof window.createImageBitmap ? window.createImageBitmap(f, { imageOrientation: "from-image" }) : null;
  } catch (z) {
    pr = null;
  }
  pr && "function" == typeof pr.then
    ? pr.then(
        function (bm) {
          ok(bm, bm.width, bm.height, function () {
            bm.close && bm.close();
          });
        },
        viaData,
      )
    : viaData();
}
/* v151 (self-review, his renders measured: with the arms held out (v145) Seedream widens the front and back panels, their boundaries near
   550 to 625, 930 to 985 and 1510 to 1535 px of 1920 instead of 480, 960 and 1440; the arms-down render had 482, 961 and 1436): the panel
   boundaries are found on the image, one within 35% of a quarter around each quarter line, as a column where nearly every row has a
   sharp vertical edge (a gap or a change of backdrop from one panel to the next), with the other edge of a gap when there is one (up to
   2.5% of the width apart); a boundary not found stays at the quarter. Each boundary is [left, right].
   v151 review: a straight line inside a figure (a pinstripe, a pleat, a coat's edge) also has an edge in nearly every row it crosses: a
   candidate counts only if just outside it, on both sides, the image is backdrop (grey, little colour, smooth from row to row, the film
   grain allowed) in at least 85% of the rows (his renders: 89 to 99% beside the boundaries, at most 77% at a figure's edge); the strongest
   such candidate wins */
function sdPanelCuts(d, W, H) {
  var q = W / 4, ys = [], y, i, j, k, wide = Math.round(W * 0.025) + 4, E = [], out = [],
    lum = function (i, y) {
      var o = 4 * (y * W + i);
      return 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];
    },
    bgCol = function (x) {
      if (x < 0 || x >= W) return 1;
      var n = 0;
      for (var j = 0; j < ys.length; j++) {
        var o = 4 * (ys[j] * W + x), r = d[o], g = d[o + 1], b = d[o + 2],
          nx = j + 1 < ys.length ? lum(x, ys[j + 1]) : lum(x, ys[j]);
        Math.max(r, g, b) - Math.min(r, g, b) < 22 && Math.abs(lum(x, ys[j]) - nx) < 8 && n++;
      }
      return ys.length ? n / ys.length : 0;
    };
  for (y = Math.round(H * 0.05); y < Math.round(H * 0.95); y += 4) ys.push(y);
  for (i = 0; i < W; i++) {
    var n = 0;
    if (ys.length && i >= 2 && i < W - 2) for (j = 0; j < ys.length; j++) Math.abs(lum(i + 2, ys[j]) - lum(i - 2, ys[j])) > 6 && n++;
    E.push(ys.length ? n / ys.length : 0);
  }
  for (k = 1; k <= 3; k++) {
    var lo = Math.max(4, Math.round((k - 0.35) * q)), hi = Math.min(W - 5, Math.round((k + 0.35) * q)), cand = [], got = null;
    for (i = lo; i <= hi; i++) E[i] >= 0.7 && cand.push(i);
    cand.sort(function (a, b) {
      return E[b] - E[a] || Math.abs(a - k * q) - Math.abs(b - k * q);
    });
    for (var c = 0; c < cand.length && c < 60 && !got; c++) {
      /* the other edge of a gap: past a low stretch (the gap's flat inside), the next strong edge within 2.5% of the width, the nearer side */
      var m = cand[c], side = function (dir) {
          for (var i = m + dir, low = !1; i >= lo && i <= hi && Math.abs(i - m) <= wide; i += dir) {
            if (E[i] < 0.3) low = !0;
            else if (low && E[i] >= 0.7) return i;
          }
          return -1;
        },
        rr = side(1), ll = side(-1),
        o2 = rr < 0 ? ll : ll < 0 ? rr : rr - m <= m - ll ? rr : ll;
      var l = o2 < 0 ? m : Math.min(m, o2), r = o2 < 0 ? m : Math.max(m, o2);
      bgCol(l - 6) >= 0.85 && bgCol(r + 6) >= 0.85 && (got = [l, r]);
    }
    out.push(got || [k * q, k * q]);
  }
  return out;
}
function sdPrepImage(f, done) {
  sdDecodeImage(f, function (im, W, H, free) {
    try {
      var B = Math.round(H * SD_PREP),
        c = document.createElement("canvas");
      c.width = W;
      c.height = H + B;
      var x = c.getContext("2d");
      x.drawImage(im, 0, B);
      var R = Math.min(3, H),
        top = x.getImageData(0, B, W, R).data,
        band = x.createImageData(W, B),
        q = W / 4,
        C = sdPanelCuts(x.getImageData(0, B, W, H).data, W, H),
        px = function (i) {
          var r = 0, g = 0, b = 0, j;
          for (j = 0; j < R; j++) (r += top[4 * (j * W + i)]), (g += top[4 * (j * W + i) + 1]), (b += top[4 * (j * W + i) + 2]);
          return [r / R, g / R, b / R];
        },
        med = function (a) {
          a.sort(function (m, n) {
            return m - n;
          });
          return a[a.length >> 1] || 0;
        };
      /* each column of the band continues its own top pixel where that pixel is backdrop, or a thin, isolated panel gap near a panel boundary; where the
         body (or hair) is cut by the top edge, the band is the backdrop of its panel (median of the top rows near the panel's side
         edges), so no skin or hair is carried upward (v151: the panels as found on the image, sdPanelCuts; before, the quarters) */
      var T0 = [], far = [], bgs = [], i, y, k;
      for (i = 0; i < W; i++) T0.push(px(i));
      for (k = 0; k < 4; k++) {
        /* v151: the panels as found (sdPanelCuts), between the boundaries, the backdrop sampled near their own edges; the columns of a gap
           take the backdrop of the panel on their left (they keep their own colour as a gap below) */
        var x0 = k ? Math.round(C[k - 1][1]) + 1 : 0,
          x1 = 3 > k ? Math.round(C[k][0]) : W,
          pw = Math.max(1, x1 - x0),
          rs = [], gs = [], bs = [];
        for (i = Math.round(x0 + pw * 0.02); i < Math.round(x0 + pw * 0.12); i++) rs.push(T0[i][0]), gs.push(T0[i][1]), bs.push(T0[i][2]);
        for (i = Math.round(x1 - pw * 0.12); i < Math.round(x1 - pw * 0.02); i++) rs.push(T0[i][0]), gs.push(T0[i][1]), bs.push(T0[i][2]);
        /* v151 review: the grey samples only (little colour), so skin, hair or a garment at the panel's edge never sets the band's colour;
           none: all of them, as before */
        var gi = rs.map(function (v, n) {
            return Math.max(v, gs[n], bs[n]) - Math.min(v, gs[n], bs[n]) < 22 ? n : -1;
          }).filter(function (n) {
            return n >= 0;
          });
        gi.length && ((rs = gi.map(function (n) {
          return rs[n];
        })), (gs = gi.map(function (n) {
          return gs[n];
        })), (bs = gi.map(function (n) {
          return bs[n];
        })));
        var bg = [med(rs), med(gs), med(bs)];
        for (i = x0; i < (3 > k ? Math.round(C[k][1]) + 1 : W); i++) (bgs[i] = bg), (far[i] = Math.hypot(T0[i][0] - bg[0], T0[i][1] - bg[1], T0[i][2] - bg[2]) > 24);
      }
      var col = T0.slice(), thin = Math.max(3, Math.round(W * 0.015)), edge = Math.max(4, Math.round(W * 0.005)), runs = [];
      for (i = 0; i < W; ) {
        if (!far[i]) {
          i++;
          continue;
        }
        var a0 = i;
        while (i < W && far[i]) i++;
        runs.push([a0, i - 1]);
      }
      runs.forEach(function (r, n) {
        var c = (r[0] + r[1]) / 2,
          gap =
            r[1] - r[0] + 1 <= thin &&
            /* the outer edges count too, as the quarter lines 0 and 4 did before v151 (a light frame strip at the image's sides) */
            Math.min.apply(null, [c, W - c].concat(C.map(function (z) {
              return Math.abs(c - (z[0] + z[1]) / 2);
            }))) <= q * 0.1 &&
            (!n || r[0] - runs[n - 1][1] > 4 * thin) &&
            (n === runs.length - 1 || runs[n + 1][0] - r[1] > 4 * thin),
          /* v151: a run that meets a gap found from top to bottom (sdPanelCuts), however wide or close to a shoulder: within the gap, the
             columns of the gap's own colour go up; any other column of the run (skin or hair touching it) takes the backdrop (review) */
          gz = gap ? null : C.filter(function (z) {
            return z[1] - z[0] >= 4 && r[1] >= z[0] - edge - 2 && r[0] <= z[1] + edge + 2;
          })[0],
          gc = gz ? T0[Math.round((gz[0] + gz[1]) / 2)] : null;
        /* plus a few pixels on each side: the soft edge of the body or the hair is not carried upward either */
        if (!gap)
          for (var z = Math.max(0, r[0] - edge); z <= Math.min(W - 1, r[1] + edge); z++)
            (gz && z >= gz[0] - 2 && z <= gz[1] + 2 && Math.hypot(T0[z][0] - gc[0], T0[z][1] - gc[1], T0[z][2] - gc[2]) < 30) || (col[z] = bgs[z]);
      });
      for (i = 0; i < W; i++)
        for (y = 0; y < B; y++) {
          var o = 4 * (y * W + i);
          band.data[o] = col[i][0];
          band.data[o + 1] = col[i][1];
          band.data[o + 2] = col[i][2];
          band.data[o + 3] = 255;
        }
      x.putImageData(band, 0, 0);
      /* v127 (user: accept JPEG too): the output keeps the input's format (JPEG and WebP at the highest quality, 1: still re-encoded, the
         body pixels move by a few levels at most), PNG otherwise */
      var ty = /^image\/(jpeg|png|webp)$/.test(f.type) ? f.type : "image/png",
        ext = (/\.(jpe?g|png|webp)$/i.exec(f.name || "") || [0, "image/jpeg" === ty ? "jpg" : "image/webp" === ty ? "webp" : "png"])[1],
        n = String(f.name || "planche").replace(/\.[a-z0-9]+$/i, "") + "_place-tete." + ("image/png" === ty ? "png" : ext);
      free();
      c.toBlob(function (bl) {
        if (!bl) return done("toBlob");
        /* v128 review: a browser that cannot encode the type gives a PNG; the name follows */
        bl.type && bl.type !== ty && (n = n.replace(/\.[a-z0-9]+$/i, "." + (bl.type.split("/")[1] || "png").replace("jpeg", "jpg")));
        var a = document.createElement("a"),
          v = URL.createObjectURL(bl);
        a.href = v;
        a.download = n;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
          URL.revokeObjectURL(v);
        }, 1e3);
        done(!1, n, W, H + B);
      }, ty, 1);
    } catch (z) {
      free();
      done(String((z && z.name) || "Error"));
    }
  }, function () {
    done(!0);
  });
}
function SdPrep(pr) {
  var st = (0, s.useState)(""),
    msg = st[0],
    set = st[1],
    t = pr.t || {},
    nano = !pr.heads && "nano" === t.sdJoinFor,
    gp = !pr.heads && "gpt" === t.sdJoinFor,
    sw = function (v) {
      /* v127: "Assembler" written for one model or the other; switching puts that model's text in place (v134: three models) */
      pr.g("sdJoinFor", v);
      pr.g("sdIter", sdPresetJoin(v));
      pr.g("sdIterOp", "join");
    };
  return (0, l.jsxs)("div", {
    className: "mt-3 rounded-xl border px-3 py-2",
    children: [
      !pr.heads &&
        (0, l.jsxs)("div", {
          className: "mb-3",
          children: [
            (0, l.jsx)("p", { className: "mb-2 text-sm font-semibold", children: "Assembler avec" }),
            /* v134: three models; short labels and a box that scrolls rather than widening the page on a phone */
            (0, l.jsx)("div", {
              style: { width: 0, minWidth: "100%", overflowX: "auto" },
              children: (0, l.jsx)(ab, {
                label: "Modèle pour assembler",
                value: nano ? "nano" : gp ? "gpt" : "seedream",
                onChange: sw,
                options: [
                  ["seedream", "Seedream"],
                  ["nano", "Nano Banana"],
                  ["gpt", "GPT"],
                ],
              }),
            }),
          ],
        }),
      /* v126 (user: say that Nano Banana assembles head and body best for an overall view of the character, ChatGPT second, and that
         Seedream can be tried with 3 generations at once for more precision): the user's own ranking, shown as advice */
      (0, l.jsxs)("p", {
        role: "note",
        className: "mb-3 rounded-xl border border-[hsl(var(--tape))] p-3 text-sm",
        children: gp
          ? [
              (0, l.jsx)("b", { children: "GPT Image 2.5 : " }),
              "le prompt de Nano Banana, avec ce qu'il faut à une conversation ChatGPT : seulement les deux images jointes, le format et une vérification mesurée. Comme Nano Banana, il lisse : ce prompt l'oblige à garder la peau, la cellulite, les plis et chaque défaut. Joins ta planche corps sans tête telle quelle et la planche tête dans le même message : pas de préparation.",
            ]
          : nano
          ? [
              (0, l.jsx)("b", { children: "Nano Banana : " }),
              "il assemble le mieux la tête et le corps pour une vue d'ensemble du personnage, mais il lisse tout : peau sans défaut, corps immaculé. Ce prompt l'oblige à garder la peau, la cellulite, les plis et chaque défaut. Joins ta planche corps sans tête telle quelle : pas de préparation.",
            ]
          : [
              (0, l.jsx)("b", { children: "Conseil pour assembler : " }),
              /* v128 review: the v126 advice said "this same prompt" for Nano Banana, which now has its own (no preparation) */
              "Nano Banana assemble le mieux la tête et le corps pour une vue d'ensemble du personnage : choisis « Nano Banana » ci-dessus, sans préparation. ChatGPT ensuite : choisis « GPT » ci-dessus. Avec Seedream, prépare l'image 1 ci-dessous, lance 3 générations en même temps et garde la plus juste.",
            ],
      }),
      /* v134 (user: "là j'ai rien compris ce qu'il faut faire, c'est pas explicite"): what to do, in order, then why */
      !nano && !gp && (0, l.jsx)("p", { className: "text-sm font-semibold", children: "Avec Seedream : prépare d'abord l'image 1, en trois étapes" }),
      !nano && !gp &&
        (0, l.jsxs)("ol", {
          className: "mt-1 list-decimal space-y-1 pl-5 text-sm",
          children: [
            (0, l.jsx)("li", {
              children: pr.heads
                ? "Clique sur « Choisir ma planche et préparer l'image 1 » ci-dessous, puis choisis le fichier de ta planche habillée sans tête."
                : "Clique sur « Choisir ma planche et préparer l'image 1 » ci-dessous, puis choisis le fichier de ta planche corps sans tête validée.",
            }),
            (0, l.jsx)("li", {
              children: "L'outil agrandit l'image vers le haut : il ajoute au-dessus des corps une bande vide de la couleur du fond, haute de 25 % de l'image, la place du cou et de la tête. L'image prête se télécharge aussitôt.",
            }),
            (0, l.jsx)("li", { children: "Dans Seedream : l'image téléchargée en image 1, ta planche tête en image 2, puis copie le prompt de cette carte." }),
          ],
        }),
      !nano && !gp &&
        (0, l.jsx)("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: pr.heads
            ? "Pourquoi : sans cette bande, Seedream rétrécit les corps pour faire de la place aux têtes, et les têtes sortent trop grandes. Rien n'est envoyé : tout se fait dans ton navigateur."
            : "Pourquoi : sans cette bande, Seedream rétrécit les corps pour faire de la place aux têtes, et les têtes sortent trop grandes. Avec Nano Banana, pas de préparation : joins ta planche telle quelle. Rien n'est envoyé : tout se fait dans ton navigateur.",
        }),
      !nano && !gp &&
        (0, l.jsx)("button", {
          type: "button",
          className: "mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          style: { background: "hsl(var(--ok))" },
          title: "Choisis ta planche : l'outil ajoute une bande vide de 25 % au-dessus des corps et télécharge l'image 1 prête",
          onClick: function () {
            var i = document.getElementById("sd-prep-file");
            i && i.click();
          },
          children: "Choisir ma planche et préparer l'image 1",
        }),
      !nano && !gp &&
        (0, l.jsx)("input", {
          id: "sd-prep-file",
          type: "file",
          accept: "image/*,.png,.jpg,.jpeg,.webp",
          "aria-label": "Planche à préparer",
          style: { display: "none" },
          onChange: function (ev) {
            var f = ev.target.files && ev.target.files[0];
            ev.target.value = "";
            f &&
              sdPrepImage(f, function (err, n, w, h) {
                set(
                  "string" == typeof err
                    ? sdT("L'image est lue, mais la préparation a échoué dans cette page (" + err + "). Ouvre le fichier HTML de l'outil directement dans Chrome, Firefox ou Safari et recommence.", "The image was read, but the preparation failed in this page (" + err + "). Open the tool's HTML file directly in Chrome, Firefox or Safari and try again.")
                    : err
                    ? sdT("Image illisible : choisis un PNG, un JPEG (.jpg ou .jpeg) ou un WebP.", "Unreadable image: choose a PNG, a JPEG (.jpg or .jpeg) or a WebP.")
                    : sdT("Image 1 prête et téléchargée : " + n + " (" + w + " × " + h + " px). Ajoute-la dans Seedream en image 1, puis la planche tête en image 2, puis copie le prompt de cette carte.", "Image 1 ready and downloaded: " + n + " (" + w + " × " + h + " px). Add it in Seedream as image 1, then the head sheet as image 2, then copy the prompt of this card."),
                );
              });
          },
        }),
      !nano && !gp && msg && (0, l.jsx)("p", { role: "status", className: "mt-2 text-sm font-semibold", children: msg }),
    ],
  });
}
function sdGrowCopyMsg() {
  return sdT("Copié. Dans Seedream, ajoute ta planche corps de la carte 2 (image 1).", "Copied. In Seedream, add your body sheet from card 2 (image 1).");
}
/* v118 (user: a slim woman with "Larges" hips or "Gros" glutes came out with ordinary hips: "slim", "like a dancer", "hip bones" and
   "no extra padding" spoke against them): a woman whose hips or glutes are set large keeps her slimness above the hips only */
function sdCurvy() {
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && (e.hips >= 3 || e.glutes >= 3);
}
/* v119 (user: the top of both sliders still gave an ordinary body; "about 57 kg" at 171 cm told the model "thin"): the top of the scale
   is said as the top ("extremely", out of proportion with a slim waist), and the weight counts the volume of the hips and glutes, as a
   BMI step (prompt calibration, not a measured figure) */
/* v135 (user, a slim Seedream body with "Hanches : Étroites" and "Fessiers : Gros": the prompt said "narrow hips" and then "with full
   hips and glutes"): the curvy build names only what is set large, the hips, the glutes or both */
function sdCurvyWhat() {
  return e.hips >= 3 && e.glutes >= 3 ? "hips and glutes" : e.hips >= 3 ? "hips" : "glutes";
}
/* v135: where the extra width of a curvy or high-glute body sits, in both engines: never "the hips" when they are set narrow */
function sdExtraWho() {
  var gw = e.glutes >= 3 || "high" === e.glutesShape || "shelf" === e.glutesShape;
  return gw && e.hips < 3 ? "glutes" : !gw && e.hips >= 3 ? "hips" : !gw && e.hips < 3 ? "outer upper thighs" : "hips and glutes";
}
function sdCurvyMax() {
  return sdCurvy() && (4 === e.hips || 4 === e.glutes);
}
function sdCurvyKg() {
  /* only for a slim or average build: from "Enrobée" up, the BMI of the build already carries that volume */
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && e.fat <= 2 ? ([0, 0, 0, 0.7, 2][e.glutes] || 0) + ([0, 0, 0, 0.5, 1.5][e.hips] || 0) : 0;
}
function sdForteDetail(x) {
  return SD_FORTE_DETAIL[x] || x;
}
function sdG(t) {
  sdChild(t) && ((t.photo || t.photoOnly) && (t = Object.assign({}, t, { photo: !1, photoOnly: !1 })), (t = sdChildClean(t)));
  /* v114 (UI audit): grey hair, a receding hairline and heels are neither offered to nor sent for a child (a saved value falls back to the default) */
  sdChild(t) && (t = sdChildOpts(t));
  /* v113: never the free outfit for a baby; v117: a child has its own (sdChildMap: the adult's text never dresses the child), refused whole
     (an empty text: a plain everyday outfit) unless every word is a known clothing word and the list finds nothing */
  sdChild(t) && ((t = sdChildMap(t)), t.outfitFree && !sdChildFreeOk(t.outfitText) && (t = Object.assign({}, t, { outfitText: "" })));
  t = sdForteParts(t);
  /* "several in the same GPT conversation" names the subject within a GPT conversation (its toggle is hidden in Seedream: P13) */
  "seedream" === t.model && t.multiChar && (t = Object.assign({}, t, { multiChar: !1 }));
  t = sdIterNorm(t);
  return sdAutoBust(sdShift(sdRndOutfit(!sdNat(t) && ("tanga" === t.refCover || "brief" === t.refCover || "sport" === t.refCover || "fitted" === t.refCover) ? Object.assign({}, t, { refCover: "sport" === t.refCover || "fitted" === t.refCover ? "short" : "swim" }) : t)));
}
/* v129 (user: a shade button for the eye color, dark, light and very, very light, for blue eyes so pale they look almost white): "Teinte
   des yeux" (eyeShade: auto, dark, light, pale), adults only (hidden for a child, never applied to one), both engines through the eye
   color word (t7); no effect with an eye color written by hand; "Marron foncé" keeps its shade with "Claire" and "Très claire". The very
   pale blue and grey keep a darker outer ring and a sharp pupil, so the eye never reads as white, glowing or blind. */
var SD_EYE_TONE = {
  dark: { darkbrown: "very dark brown, almost black", brown: "deep brown", hazel: "dark hazel", amber: "deep amber", green: "dark green", blue: "deep blue", grey: "dark grey" },
  light: { brown: "light brown", hazel: "light hazel", amber: "light amber", green: "light green", blue: "light blue", grey: "light grey" },
  pale: { brown: "light honey-brown", hazel: "pale hazel", amber: "pale golden amber", green: "very pale green", blue: "very pale, icy blue", grey: "very pale silver-grey" },
};
function sdEyeTone(c) {
  var m = !sdChild(e) && SD_EYE_TONE[e.eyeShade];
  return (m && m[e.eyeColor]) || c;
}
function sdIris() {
  if (t5(e.eyeColorCustom))
    return "Natural iris texture with visible fibres, the color not oversaturated.";
  var tn = sdEyeTone("");
  if (tn && "pale" === e.eyeShade && ("blue" === e.eyeColor || "grey" === e.eyeColor))
    return t6(tn) + " irises, so light they look almost silver-white in the light, with a thin darker outer ring and a sharp, dark pupil that keep them clearly eyes, never white, glowing or blind-looking.";
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
  ).replace(/^Natural (dark brown|brown|hazel|amber|muted green|green|blue|grey)\b/, function (m0, w) {
    return tn ? "Natural " + tn : m0;
  });
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
/* v118 (user: the head sheets crop the hair, so its length never shows): the hair can run past the bottom edge of a head sheet. An adult
   head is framed down to the collarbones (long and very long hair pass it), a child's down to the base of the neck (shoulder-length hair
   passes it too); from a photo the length is unknown, so it may pass. One rule for the crop note and the back view of every head sheet. */
function sdHairPast() {
  if ("bald" === e.hairStyleSel || "shaved" === e.hairLen) return !1;
  return sdChild(e) ? sdChildPh(e) || ["shoulder", "long", "vlong"].indexOf(e.hairLen) >= 0 : !!e.photo || "long" === e.hairLen || "vlong" === e.hairLen;
}
/* the back view of a head sheet; v118: when the hair can pass the bottom edge, the back view no longer asks to show its length (an
   impossible order in that frame, which can make the model pull the camera back or shorten the hair): the length shows on the body sheet */
var SD_HAIR_PAST = "; hair longer than the frame runs on past its bottom edge, never shortened to fit";
/* v118 (user: the nose is sometimes cut in the profile): a 16:9 sheet in four vertical panels gives panels about 4:9; at head-and-shoulders
   scale the head in profile, from the tip of the nose to the back of the head, is wider than the panel, and nothing said what may be cut.
   The face never is: only the back of the head and the hair may pass the far edge (adult head sheets, both engines; the child's and the
   baby's head panels are 16:9 or wider and keep their text) */
var SD_FACE_IN = "In the three-quarter view and the profile, the whole face stays inside the panel, with grey space between the tip of the nose and the nearest panel edge; only the back of the head and the hair may run past the opposite edge, never the nose or the chin.";
function sdBackHair() {
  /* v130 (GPT audit of v129, checked: with a photo, adult or child, the back view still followed the hairstyle left in the hidden form,
     "worn down" or "gathered ... the tie"): the hair is the photo's */
  if ((e.photo && !sdChild(e)) || sdChildPh(e))
    return ", showing the hair from behind as the photo has it: the same length and style, worn down, tied or braided exactly as in the photo" + SD_HAIR_PAST;
  /* v129: from "Marquée" up the hair loss shows on the crown in the back view */
  var b = sdBackHair0();
  return sdHairLossLv() >= 3
    ? b.replace("the parting and the tie", "the tie").replace(" and its parting", "").replace(", its length and parting", ", its length").replace("its length, the parting and the tie", "its length and the tie") +
        ", the thinning or bald crown seen from behind"
    : b;
}
function sdBackHair0(before118) {
  var past = !before118 && sdHairPast();
  return "bald" === e.hairStyleSel || "shaved" === e.hairLen
    ? ""
    : ["ponytail", "bun", "braid"].indexOf(e.hairStyleSel) >= 0
      ? past && "bun" !== e.hairStyleSel
        ? ", showing how the hair is gathered at the back: the parting and the tie" + SD_HAIR_PAST
        : ", showing how the hair is gathered at the back: its length, the parting and the tie"
      : ["boxbraids", "cornrows", "locs", "twists", "afro", "undercut", "mohawk", "receding"].indexOf(e.hairStyleSel) >= 0
        ? past && ["boxbraids", "cornrows", "locs", "twists"].indexOf(e.hairStyleSel) >= 0
          ? ", showing the hairstyle from behind and its pattern" + SD_HAIR_PAST
          : ", showing the hairstyle from behind, its length and pattern"
        : past
          ? ", showing how the hair falls at the back and its parting, worn down with no tie or clip" + SD_HAIR_PAST
          : ", showing how the hair falls at the back, its length and parting, worn down with no tie or clip";
}
function sdLooks() {
  /* Scale recalibrated on renders (Seedream v80, GPT v82): the former "Quelconque" text renders as "Ordinaire", so it moves to 2.
     3 and 4 name the measured gaps between a "super fille" render and an ordinary one: eye aperture, brow height,
     lower-face length, and a visible asymmetry (renders came out more symmetric than asked). Sides match the drawn details. */
  if (e.looks >= 2) return sdLooksText(e.looks);
  var b = "f" === e.pres ? "Beautiful" : "m" === e.pres ? "Handsome" : "Good-looking";
  if (0 === e.looks && "m" === e.pres)
    /* v128: shorter (the head stayed over 600 words with a character): no "thick natural eyebrows" (the eyebrows are the face's), no
       "neither feminized nor exaggerated" ("clearly male" says it), the skin only when the skin slider leaves it healthy. v128 review:
       "a lean face" only for a slim or average build, as for a woman. The defined jaw only while the jaw is on Auto (PR #55 review) */
    return "Strikingly handsome in a clearly male way, like a top male model in an unretouched agency polaroid: harmonious proportions close to the average of real faces" + (sdCanonSlim() ? ", a lean face" : "") + ("auto" === e.jaw ? ", a clearly defined jaw" : "") + (e.imperf <= 2 ? ", healthy skin with warm, even color" : "") + ", with the slight asymmetry of a real face; an original person who resembles no celebrity.";
  /* v128 (user: "Canon" should be the beauty that leaves people speechless): stronger for a woman or an androgynous person; a leaner face
     (Coetzee, Perrett and Stephen 2009); the skin stays the skin slider's. v129 (user, a "Canon" sheet still far from canon): "close to
     the average of real faces" is gone. An average face shape is attractive but not optimally attractive: the mean shape of attractive
     faces is preferred to the mean of the sample, and more so once its differences from the mean are exaggerated (Perrett, May and
     Yoshikawa, Nature, 1994); feminized shapes of a female face are preferred to the average one (Perrett et al., Nature, 1998). The
     features that carry the beauty are set in the face structure (sdCanonFace), so a feature the user chose is never contradicted here. */
  return (
    (0 === e.looks
      ? "Strikingly " + b.toLowerCase() + ", like a top model in an agency polaroid: refined, harmonious features" + (sdCanonSlim() ? ", a lean face" : "")
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
/* New and saved face signatures must ignore the same clothing-only instructions, and the v118 framing line (the face kept
   inside the panel), which changes no face: a head copied before v118 is still the same face */
function sdSigWithoutOutfit(sig) {
  /* port review: a copy made before the port has the back view of sdBackHair0(true) (long hair and a photo's hair included) and its random
     traits before v131 (sdFaceFix) and v133 (sdOrdFix) resolved the contradictory pairs: both sides are brought to that back view and
     through both fixes, which change no setting (each is idempotent, so a current signature is unchanged by them) */
  var bh = sdBackHair(),
    b0 = sdBackHair0(!0);
  /* from "Marquée" up the hair loss is in the back view (v129): a setting, kept */
  bh && bh !== b0 && sdHairLossLv() < 3 && (sig = sig.split(bh).join(b0));
  return sdOrdFix(sdFaceFix(sig))
    .split("\n" + SD_FACE_IN)
    .join("")
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
  /* port review: v156 "Graisse : visage" is the face's own fat, so a change of it is a new face too; it rides in headFat after the
     corpulence ("2/3"), a copy without it reads as 0 */
  var a = String(e.headFat).split("/"),
    b = String(sdHeadFatNow()).split("/");
  return "person" === e.mode && null != e.headLooks && "" !== e.headLooks && (+e.headLooks !== +e.looks || +a[0] !== +b[0] || +(a[1] || 0) !== +(b[1] || 0));
}
/* what a GPT head copy records as its fat: the corpulence, then the face fat when it is set */
function sdHeadFatNow() {
  var v = sdFaceFatLv();
  return v ? e.fat + "/" + v : e.fat;
}
function sdLooksText(lv) {
  var p = sdPos(),
    lean = sdLean(),
    /* port: with "Graisse : visage" (v156) set, the face's fat is the user's, not the body's: no "lean face, no fullness under the chin" */
    leanTx = lean && !sdFaceFatLv() ? sdLeanText() : "",
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
      (leanTx ? "; " + leanTx : "") +
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
      (leanTx ? leanTx + "; " : "") +
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
      (leanTx ? leanTx + "; " : "") +
      "strongly uneven: " +
      p +
      " right eye clearly smaller and lower than " +
      p +
      " left, the nose clearly bent toward " +
      p +
      " right, the mouth sitting crooked, its right corner lower."
  );
}
/* the head sheet's facial hair or peach fuzz (sdSkinHead, with Imperfections 1 or more), also said by "Finition photo" (v154) */
function sdFaceFuzz() {
  return 0 === e.looks && "m" === e.pres
    ? "clean-shaven" === (t1("facialHair", e.facialHair) || "clean-shaven")
      ? "a faint, even beard shadow on the jaw and upper lip"
      : "fine, natural facial hair texture"
    : /* v129 review: a beard or stubble is never "peach fuzz" (v128 already had it with the short and long beards) */
      "f" !== e.pres && t1("facialHair", e.facialHair)
      ? "fine, natural facial hair texture"
      : /* v157: the face's peach fuzz in the color set in "Couleur des poils"; from "Ordinaire" up, under the clinical light, it does not catch the light */
        "fine " + (sdBodyHairPick() ? sdBodyHairPick() + " " : "") + "peach fuzz" + (e.looks >= 2 ? "" : " catching the light") + " on the cheeks and jaw";
}
function sdSkinHead() {
  var x = [
    [
      "Smooth skin that still shows fine pores",
      "Natural skin: fine pores, slight unevenness",
      /* v104: with "Canon", "Naturelles" keeps the skin texture but not the redness or the spots, as the Beauté hint says and as GPT already does (ru) */
      0 === e.looks
        ? "Real, unretouched skin with visible pores and a natural, healthy texture, clear and even-toned"
        : "Real, unretouched skin: visible pores on the nose and cheeks" + (sdNoseLm() ? "" : ", slight redness around the nostrils") + ", small blemishes, slightly uneven tone, faint shadows under the eyes",
      "Clearly imperfect skin: enlarged pores on the nose and cheeks, several small spots and blemishes, redness around the nose and chin, dark under-eye circles, an oily shine on the forehead and nose, an uneven, slightly blotchy tone",
      "Rough skin: acne scars, a few active spots, broken capillaries, under-eye bags, an oily shine, a blotchy tone",
    ][e.imperf] || "Natural skin with fine pores",
  ];
  e.imperf >= 1 && x.push(sdFaceFuzz(), "natural lip texture with fine lines");
  "bald" !== e.hairStyleSel && "shaved" !== e.hairLen && x.push("a few flyaway hairs");
  /* v116: makeup named in the free outfit text wins over the Maquillage setting (no "no makeup" next to "thin black eyeliner") */
  var m = sdFreeMk() ? "free" : r8();
  "none" === m ? x.push("no makeup") : "free" === m || (!r9() && e.looks <= 1 && x.push("little or no makeup"));
  return x.join(", ") + "." + ("none" !== m && "free" !== m && r9() ? " Makeup: " + r9() + "." : "");
}
/* v157 (user, a head sheet of a man: "il devrait être torse nu, sinon Seedance va vouloir utiliser le haut … ne pas dire torse nu, mais on ne
   doit pas voir le vêtement, sans tronquer l'image"): an adult's head sheet with the placeholder top (no top chosen, the reference outfit's
   t-shirt or top) shows the bare neck and shoulders, the frame unchanged, ending above the clothing; a top chosen, typed or taken from the
   photo is the character's costume and keeps its neckline; a child keeps the top (both engines) */
var SD_BARE_NECK_SD = "Bare neck, shoulders and collarbones at the bottom edge of each panel, the frame ending above the clothing: no top, strap or neckline shows.";
var SD_BARE_NECK_GPT = "Bare neck and shoulders: the frame ends just below the collarbones, above the clothing, so no clothing, strap or neckline shows in any panel.\n";
/* v157 review 3: with something worn on the head and face (a scarf, a hood, a necklace), the neck is bare apart from it */
var SD_BARE_NECK_SD_ACC = "Neck, shoulders and collarbones at the bottom edge of each panel, bare apart from what is worn on the head and face, the frame ending above the clothing: no top, strap or neckline shows.";
var SD_BARE_NECK_GPT_ACC = "Bare neck and shoulders apart from what is worn on the head and face: the frame ends just below the collarbones, above the clothing, so no top, strap or neckline shows in any panel.\n";
function sdBareNeckSd() {
  return nz() ? SD_BARE_NECK_SD_ACC : SD_BARE_NECK_SD;
}
function sdBareNeckGpt() {
  return nz() ? SD_BARE_NECK_GPT_ACC : SD_BARE_NECK_GPT;
}
function sdBareNeck() {
  if ("person" !== e.mode || sdChild(e) || e.child) return !1;
  /* v157 review 3: the reference outfit replaces the photo's clothes too */
  if (nv() && !an()) return !0;
  if (sdPhotoClothes()) return !1;
  if (nv()) return !0;
  if (sdFreeOn()) return !sdFreeText();
  return !nh("topSel", "topOpts", "top").length;
}
function sdNeck() {
  if (sdBareNeck()) return sdBareNeckSd();
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
    lg = sdHairPast(),
    pr =
      0 === e.looks
        ? /* v129 review: not with a beard that covers the chin and the jaw line */
          "f" !== e.pres && ["short", "full", "long", "chinstrap"].indexOf(e.facialHair) >= 0
          ? "In profile: the lips just behind the line from nose tip to chin."
          : "In profile: the lips just behind the line from nose tip to chin, " +
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
          /* v129 (user, a "Canon" + "Méchant" sheet far from canon beauty): the guide for Seedream says it weights the start of the prompt most
             heavily and asks for the subject's defining attributes in the first clause (Runware, Seedream 4.5 prompting guide); with "Canon"
             the beauty was said only after the face structure */
          (0 === e.looks ? ("m" === e.pres ? "strikingly handsome " : "f" === e.pres ? "strikingly beautiful " : "strikingly good-looking ") : "") +
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
      ". " +
      SD_FACE_IN +
      "\n\n";
  s +=
    t6(rS()) +
    ": " +
    nn() +
    ". " +
    t6(sdCurls(ne())) +
    ". " +
    t6(nT()) +
    "." +
    (sdIris() ? " " + sdIris() : "") +
    (sdOrigin() ? " " + sdOrigin() : "") +
    "\n";
  var f = sdCharFace(sdFace());
  f && (s += f + "\n");
  /* v156: "Graisse : visage" */
  sdFaceFatLine() && (s += sdFaceFatLine() + "\n");
  /* v128: with "Canon" or "Beau" the beauty comes first, the character after it (Seedream) */
  var cb = +e.looks <= 1 && sdChar(!1, !0);
  cb || (sdChar(!1, !0) && (s += sdChar(!1, !0) + "\n"));
  s += sdLooks() + (pr ? " " + pr : "") + "\n";
  cb && (s += sdChar(!0, !0) + "\n");
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
/* v131 (user, two Seedream head sheets with "Bouclés": loose waves drawn, GPT drew the curls): the curls said as they look, right after
   the hair (Seedream head and body), with the styles where the curls show (not braids, cornrows, locs or twists) */
function sdCurls(t) {
  var i = "string" == typeof t ? t.indexOf(" hair") : -1;
  if (i < 0 || "curly" !== e.hairTex || "shaved" === e.hairLen || ["loose", "ponytail", "bun", "afro", "fringe", "undercut", "mohawk", "receding"].indexOf(e.hairStyleSel || "loose") < 0) return t;
  var rest = t.slice(i + 5);
  return t.slice(0, i + 5) + ", in defined, springy curls from the roots to the ends, never loose waves" + (rest ? "," + rest : "");
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
    ? "a lower, wider scoop neckline showing " + (sdClavFlesh() ? "" : "the collarbones, ") + "the breastbone and the first ribs under the thin skin, down to about a hand's width below the collarbones (never the bust itself)"
    : "a modest round neckline";
}
/* "Très généreuse": loose sleeveless top, arms bare, the side of the bust visible through the armholes (wanted by the user to judge the drop).
   A fitted top at this size was replaced as sensitive content after generation (v84 to v86), the loose top passed. */
function sdLooseTop() {
  /* v136 (user: "la poitrine a tendance à sortir au-delà du soutien-gorge"; self-review: with "Très tombante" the wide armholes showed "the
     bare side of the bust ... down to its lowest point", on the belly): the fabric follows the bust and covers its sides; a shorter text */
  /* v138 (user: "juste très tombante on laisse le haut ample mais essaye de mettre au moins un décolleté"): a deep neckline, which also
     shows the long, flat upper chest of the drop */
  if (sdDropX())
    return "a loose cobalt-blue sleeveless cropped top in medium-weight cotton jersey, with " + sdDropNeck() + " and armholes hugging the shoulder joints; it covers the whole bust, sides included, draping over it without lifting or pressing it, double-layered at the front, no padding; in the side views it follows the bust down to its lowest point; its hem hangs loose " + (sdCi(e.chest) <= 1 ? "a hand's width below the bust, the navel and lower abdomen bare" : "just below the bust, " + (sdCi(e.chest) >= 3 ? "the lower abdomen bare" : "the navel and lower abdomen bare")) + ", the upper back covered";
  return "a loose cobalt-blue sleeveless cropped top in medium-weight, opaque cotton jersey, with " + sdTopNeck() + " and wide armholes, so the whole arms and shoulders are bare; it covers the whole bust and drapes over it without " + ("low" === e.bustShape ? "lifting or pressing it" : "clinging, lifting or flattening it") + ", double-layered at the front so no detail shows through, no padding, no underwire; " + ("low" === e.bustShape ? "the soft jersey settles onto the bust, never forming a high shelf or a forward point on the chest;" : "in the side views its front falls straight down from the fullest point of the bust, so the full size of the bust reads clearly;") + " in the side views the wide armholes show the bare side of the bust and its full outline from the armpit down to its lowest point, so its size and its " + (sdBustHighOn() || sdBustFwdOn() ? "shape" : "drop") + " read clearly; its hem hangs loose a hand's width below the bust, so the navel and the lower abdomen are bare; seen from behind, it covers the upper back";
}
/* v138 (review): below "Moyenne" the drop text empties the little volume against the ribs: no "cleavage" there, the same depth */
function sdDropNeck() {
  return sdCi(e.chest) >= 2 ? "a deep scoop neckline down to the top of the cleavage" : "a deep scoop neckline down to the middle of the breastbone";
}
/* v138 (user: "il faut que je puisse avoir la possibilité d'avoir une très grosse poitrine tombante avec un haut de maillot, pas juste un
   bustier ample"): with the tanga and "Très généreuse", "Haut de maillot" (tangaTop "bikini") gives a full-coverage bikini top instead of
   the loose top, never with "Très tombante" (its loose top stays, the user's word). Seedream blocked "Très généreuse" in v75 (every
   outfit) and v76 (triangles and tanga; lessons file); since v79 this size has the loose top with the tanga: "Haut ample" stays the
   default and the hint says it. */
function sdBigTopOn(t) {
  return "person" === t.mode && !sdChild(t) && "tanga" === sdShownCover(t) && t.chest >= 4 && !sdDropRaw(t);
}
function sdBigTop() {
  /* v141 (user's render, "Tombante" with "Haut de maillot": "la poitrine un peu trop bombée sur le dessus"; the top came out as a structured,
     lifted bra, the upper part filled out): for "Tombante", unlined fabric panels lying flat on the upper slope, no "cups", no negated
     "underwire" (a negated word stays a word, lessons file) */
  if ("low" === e.bustShape)
    /* v146 (user's v145 render: the top's lower edge across the middle of the bust, its lower part below it, two masses; a stretched panel
       fills the upper slope): the panels reach down into the crease under the bust; the fabric rests on the skin, settling with the bust */
    /* v146 review: "unstructured" kept (v141, against a structured bra); no "lower edge ... along the crease" (a bra band's place, support
       and lift) and no "slack" (gaping): each panel reaching down into the crease */
    /* v148 (11 renders of the user's sheet, v146 text, 1023 and 729 words: a plunging top in all 11, the inner half of each breast bare, the
       relief showing through the fabric in several; user: "oui" to a closed, covering, opaque top): a straight neckline a hand's width
       below the collarbones (a landmark, as sdTopNeck), the whole bust covered from side to side; opaque and
       double-layered in place of "thin, unlined" (the see-through; the relief of a clinging fabric may stay, v77); "soft, unstructured"
       kept (v141, against a lifted bra). v148 review: no "one front panel" (a flat sheet across his wide-set bust would merge the two
       sides; "panel" is also the sheet layout's word); second review: the neckline lying on the breastbone (the middle closed), the bust
       covered "from side to side" (no "each breast", which with "bikini top" reads as two cups; no "between them", a pronoun without a
       plural), "settling with the bust" (no "settling with it so its"); "fully lined" not taken (a lining gave the lifted bra of v141),
       "wide" straps kept (the hint says them); "a strap across the back" as the other shapes say it; no negated "plunge" or "cleavage"
       (a negated word stays a word); the same number of words (70), "soft" once as before */
    return "a cobalt-blue full-coverage bikini top with wide shoulder straps and a strap across the back, in soft, opaque, double-layered, unstructured fabric; its straight neckline, a hand's width below the collarbones, lies on the breastbone; the fabric covers the bust from side to side and down into the crease beneath it, settling with the bust so its low, heavy shape and its drop read clearly; the abdomen bare below the top";
  return (
    "a cobalt-blue full-coverage bikini top with wide shoulder straps and a strap across the back: two large, soft cups with no padding and no underwire, each covering the whole breast, " +
    /* v138 (review): "Tombante" without "sides and underside included", kept off its triangles since v135 (they follow the drop) */
    ("low" === e.bustShape
      ? "resting on it without lifting it, so its low, heavy shape and its drop read clearly"
      : "conical" === e.bustShape
        ? "sides and underside included, following its long, forward-projecting shape without lifting or pressing it"
        : "sides and underside included, following its natural shape without lifting or pressing it") +
    "; the abdomen bare below the top"
  );
}
function sdBigTopUI(t, g) {
  return sdBigTopOn(t)
    ? (0, l.jsx)(
        "div",
        {
          className: "mt-3",
          children: (0, l.jsx)(ay, {
            name: "c-tangaTop",
            label: sdT("Haut avec le tanga", "Top with the tanga"),
            opts: [
              ["loose", sdT("Haut ample", "Loose top")],
              ["bikini", sdT("Haut de maillot", "Swimsuit top")],
            ],
            value: "bikini" === t.tangaTop ? "bikini" : "loose",
            onChange: function (v) {
              g("tangaTop", v);
            },
            hint: sdT(
              "« Haut de maillot » : un haut de bikini couvrant, à larges bretelles, sans armature ni rembourrage, qui ne remonte pas la poitrine. Seedream a bloqué « Très généreuse » en v75 (toutes les tenues) et en v76 (triangle et tanga) ; depuis la v79, cette taille a un haut ample avec le tanga. Si l'image est bloquée ou retirée, repasse sur « Haut ample ».",
              "“Swimsuit top”: a full-coverage bikini top with wide straps, no underwire and no padding, that does not lift the bust. Seedream blocked “Very generous” in v75 (every outfit) and in v76 (triangles and tanga); since v79 this size has had a loose top with the tanga. If the image is blocked or removed, go back to “Loose top”.",
            ),
          }),
        },
        "sd-tanga-top",
      )
    : null;
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
  /* v128 review: never next to fat on the belly, the flanks or the back */
  if (sdFatTorso()) return "";
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
        /* v130 (user: "Très menue" drew a bust): what flat shows in profile. v134: in positive terms only (SD_PECS_FLAT_SD) */
        "a completely flat chest like a slim man's: in profile the chest line runs straight down from the collarbones",
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
    /* v140 (user: "je pense que c'est du F ou G"): "Bonnet écrit (Très généreuse)", H by default or F to G; the rest of the text kept */
    cup = ["", "", "about a B to C cup", "about a D cup", "about a D to E cup", "fg" === e.cupTG ? "about an F to G cup" : "about an H cup"][ci] || "",
    sh =
      c >= 1
        ? {
            round: "a rounded shape" + ("young" === e.sdAutoTier && !sdBustSkin() ? ", naturally full and firm" : ""),
            high: "a high-set shape",
            low: sdDropX()
              ? sdDropSd()
              : c >= 3 && "moderate" === e.sdAutoTier
                ? "soft, with a visible natural drop: the upper chest slightly emptied below the collarbones, the volume settled in the lower half, the lowest point near the bottom of the ribcage; never round, firm or high"
                : c >= 4
                ? /* v144 (user's render: "la poitrine est en obus au lieu d'être tombante en goutte"): the shape said in positive terms only
                     (no "round, conical, pointed, firm, high or lifted", negated words drawn; no "projects well forward", which pointed it).
                     v146 (user's v145 render, "une poitrine qui ressemble à un obus plus qu'à une poitrine tombante en forme de goutte"; measured
                     in profile: the upper slope 12 to 14 px above a straight line, a full, projecting bust): a teardrop (straight or slightly
                     concave upper slope, nipple turned upward; Mallucci and Branford) is not a drop (Regnault: the nipple at or below the fold,
                     pointing down), and his reference photo is neither: with the arm down, the upper part full and sloping gently, the volume
                     low and spreading outward, the weight pulling down and to the sides. Said so (the user agreed), no longer "long and flat for
                     two hands' width" or "slightly hollow"; no "soft" added (word count). v146 review: no "rounded" (the "round" v144 took out,
                     a shape word drawn at full strength), no "pointing" (the nipple wording this size leaves out, close to "pointed") */
                  "with a strong natural drop, heavy and soft, settling low and out to the sides under its weight: the upper part relaxed, sloping gently down from below the collarbones; most of the volume in the lower part, which spreads toward the sides and rests low against the ribcage with a soft crease beneath it, its lowest point a hand's width above the navel; in profile its weight carries it down, the front sloping gently down from the chest; the fullest point is low, near the bottom of the bust; slightly uneven, the left side a little lower"
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
            /* v157 (user: "il manque des formes de seins, il y a des femmes avec des seins de formes différentes qui ne sont pas dans le style ;
               il faut impérativement que tu audites et que tu rajoutes ce qu'il faut"): audited against the twelve common shapes of
               Healthline ("Breast shapes", Maisha Johnson, medically reviewed by Catherine Hannan, M.D., 26 April 2019): round, conical,
               side set (Écartée), bell (Poire), relaxed (Tombante), asymmetrical were here; teardrop, athletic, close set, east west and
               slender were missing. No nipple wording (the filter, v76). */
            teardrop: "a natural teardrop shape: rounded, the upper slope gently sloping, the lower half slightly fuller than the upper, no real drop",
            athletic: "athletic: a wide base over firm pectoral muscle, little breast tissue, flatter in profile, the outer edges reaching toward the armpits",
            close: "close-set: both sides sitting close to the center of the chest, little space between them, the inner edges nearly touching",
            eastwest: "each side angled outward, pointing away from the center of the chest toward the sides, a clear gap between them at the center",
            slender: "slender: narrow at the base and longer than wide, sitting a little low and pointing slightly downward, little fullness at the top",
          }[e.bustShape]
        : "";
  sdBustPos() && (sh = (sh ? sh + "; " : "") + sdBustPosIn(sh));
  sdWideOn() && (sh = (sh ? sh + "; " : "") + SD_WIDE_SD);
  sdBustSkin() && (sh = (sh ? sh + "; " : "") + sdBustSkin());
  sdAsymOn() && (sh = (sh ? sh.replace("; slightly uneven, the left side a little lower", "") + "; " : "") + SD_ASYM_SD);
  var big = 5 === ci,
    out =
      size +
      (cup ? " (" + cup + ")" : "") +
      /* "Assez généreuse": same front landmark as the GPT text (v93); not with the conical shape, whose base is narrow */
      (3 === ci && "conical" !== e.bustShape ? ", its base covering most of the width of the chest in the front view" : "") +
      /* v135 (user: with "Moyenne" on a slim body the bust came out small in every sheet, the profile 1.4 to 1.5% of the body height ahead of
         the ribs; one step up, 2.1%, was the bust wanted): on a slim build (Mince, Très mince) the medium bust is said full for the frame,
         with the front landmark of "Assez généreuse" (calibration on the user's renders, not a measurement) */
      (2 === ci && e.fat <= 1 && "conical" !== e.bustShape && !sdDropX() ? ", full for " + ("f" === e.pres ? "her" : "the") + " slim frame, covering most of the chest width" : "") +
      (c >= 3 && !big && ["low", "conical"].indexOf(e.bustShape) < 0 ? " with a wide base" : "") +
      (3 === c && ["pear", "conical"].indexOf(e.bustShape) >= 0 ? ", clearly larger than average" : "") +
      (sh ? ", " + sh : "");
  /* "Très généreuse": visibly bigger than "Généreuse" through landmarks and its cup (about an H, v80), no nipple wording */
  /* v131: a woman's pectorals, when set, instead of the flat chest or above the bust */
  return sdPecsBust(big
    ? out.replace(/,? the nipples pointing[^,;.]*/, "") +
        "; in the front view the bust fills the whole width of the chest, its outer sides " + ("low" === e.bustShape ? "spreading" : "bulging") + " past the ribcage against the inner arms" +
        ("low" !== e.bustShape ? "; in profile it projects forward from the ribcage by a little more than the length of her hand, far beyond the stomach" : "")
    : out, 1);
}
/* v128 (user: "Discrets" and "Présents" abs gave the same body; and: add abdominal fat with a slider, and fat next to the other zones too,
   to mix muscle and fat, more realistic, as Nano Banana does with fat here and there): (1) each level of abs definition says what it
   shows and what it does not, so "Discrets" (a hint, no segments) and "Présents" (segments readable) differ; (2) "Graisse" sliders for
   the belly, the flanks (love handles), the arms and the back, next to their "Muscles apparents", 0 to 4, adults, both engines, after the
   existing "Graisse : hanches et cuisses". The fat sits over the muscles: where both are set, the muscles read as soft shapes under it,
   and the definition never slims those zones; belly fat from "Visible" up hides fine abs. Words that said the opposite (slender arms,
   hip bones, no extra padding) go when the zone carries fat. The weight counts the fat, as a BMI step for a slim or average build
   (prompt calibration, not a measure). */
var SD_ABS_DEF = {
  subtle: "abs only hinted: a faint vertical line above the navel, no visible segments or horizontal lines",
  clear: "visible abs: the upper segments and the centre line readable, with soft shadows",
  strong: "sharply visible abdominal segments with deep shadows between them",
};
/* v128 review: the same two levels inside GPT's "Muscles apparents : toutes les zones" text (rT), which said "a soft outline" and "a
   visible outline" of the abdominal muscles, two words apart */
var SD_ABS_GPT = {
  subtle: "abs only hinted by a faint vertical line above the navel",
  clear: "visible upper abs with a readable centre line",
};
var SD_FAT_Z = [
  /* v156 (user: "pectoraux pour les hommes tu peux mettre graisse"): soft fat over a man's pectorals, never a bust; first, head to toe, so
     the fat line of every other character is unchanged */
  ["fatChest", "chest", [0, 0.1, 0.25, 0.45, 0.7]],
  ["fatBelly", "belly", [0, 0.4, 0.9, 1.6, 2.5]],
  ["fatFlanks", "love handles", [0, 0.2, 0.5, 0.9, 1.4]],
  ["fatArms", "upper arms", [0, 0.1, 0.25, 0.45, 0.7]],
  /* v149: fat on the front of the upper arms, over the biceps; no weight step (the arm's own step is "Graisse : bras (arrière, triceps)") */
  ["fatBiceps", "front of the upper arms", [0, 0, 0, 0, 0]],
  ["fatBack", "back", [0, 0.1, 0.25, 0.45, 0.7]],
  /* v130 (user: the glutes had no fat slider): soft fat within the glute size set by "Fessiers : volume", so no weight step */
  ["fatGlutes", "glutes", [0, 0, 0, 0, 0]],
  /* v139 (user: "de la graisse sur la face avant haute des cuisses", "des bourrelets"): soft fat on the front of the upper thighs, from
     "Visible" a fold, from "Marquée" a roll at the top along the hip crease, within the thigh size set by "Cuisses", so no weight step */
  ["fatThighs", "front of the upper thighs", [0, 0, 0, 0, 0]],
  /* v140 (user: settings for real bodies he had not thought of): soft fat pads above the knees, no weight step */
  ["fatKnees", "knees", [0, 0, 0, 0, 0]],
];
/* v128 review: a whole level from 0 to 4 (an imported file may hold anything); none with "Forte", whose text already gives the fat of
   every zone (a big belly, rolls on the back, thick upper arms) and whose sliders are hidden */
function sdFatOn(k) {
  /* v149 (user: "il faudrait pouvoir ajouter du gras sur le biceps, il n'y a pas ce curseur, et mettre Auto si besoin"; asked, "Auto" follows
     the back of the arm): "Graisse : bras (avant, biceps)", "Auto" by default, one step below "Graisse : bras (arrière, triceps)"; a level
     set by hand ("0" to "4") overrides it */
  /* v149 review: "auto", empty or not a number is "Auto"; a number is rounded and kept between 0 and 4, as every other zone */
  if ("fatBiceps" === k && ("auto" === e.fatBiceps || null == e.fatBiceps || "" === e.fatBiceps || isNaN(+e.fatBiceps))) return Math.max(0, sdFatOn("fatArms") - 1);
  /* v156: "Graisse : pectoraux" is a man's only (a woman's chest is the bust's) */
  if ("fatChest" === k && "m" !== e.pres) return 0;
  return "person" === e.mode && !sdChild(e) && 4 !== +e.fat ? Math.max(0, Math.min(4, Math.round(+e[k] || 0))) : 0;
}
/* v149: the fat of the upper arm, back or front, for the muscle, vein and build words that follow it (with "Auto" the front is one step
   below the back, so these words are as in v148 unless the front is set higher by hand; the fat line itself gains the front item from
   "Visible" at the back) */
function sdArmFat() {
  return Math.max(sdFatOn("fatArms"), sdFatOn("fatBiceps"));
}
/* fat on the torso (belly, flanks or back): no ribs showing, no "lean" build word */
function sdFatTorso() {
  /* v156: a man's chest fat too */
  return Math.max(sdFatOn("fatBelly"), sdFatOn("fatFlanks"), sdFatOn("fatBack"), sdFatOn("fatChest"));
}
/* the waist carries fat from "Visible" up: never said slim */
function sdFatWaist() {
  /* v130 (GPT audit of v129: "Taille : Très large" with "Hanches : Très larges" also said a waist-to-hip ratio of 0.6): the same with a
     wide waist set by hand */
  /* v142: love handles under a waist set narrow by hand ("Fin", "Très fin") sit at the top of the hips (SD_FLANKS_NW): the waist stays slim */
  return sdFatOn("fatBelly") >= 2 || (sdFatOn("fatFlanks") >= 2 && !sdFlanksLow()) || ("m" !== e.pres && e.waist >= 3);
}
/* v142 (user, with his reference photos and a Seedream render of his settings: "la taille n'est pas fine du tout", the love handles said
   "at the sides of the waist" or "over the hip line" had widened it): under a waist set to "Fin" or "Très fin" (woman, adult), the love
   handles are said at the top of the hips, below the waist, which is said to stay narrow (both engines, the fat line; calibration to
   check on renders). "Visible" keeps its own words for the outline (v135, SD_FAT_OUTLINE, which no longer matches it here). Review: not
   with belly fat from "Visible" up, which keeps the waist from being said slim (sdFatWaist); "Moyenne" says its general softness at the
   top of the hips too. A woman or an androgynous adult, as the curvy texts (sdCurvy). */
function sdFlanksLow() {
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && +e.waist <= 1 && sdFatOn("fatBelly") < 2;
}
var SD_FLANKS_NW = {
  "a slight softness at the sides of the waist": "a slight softness at the top of the hips, just below the %w waist",
  "small love handles, soft rolls at the sides of the waist": "small love handles: soft rolls at the top of the hips, showing in the outline, just below the %w waist",
  "clear love handles spilling slightly over the hip line": "clear love handles at the top of the hips, spilling slightly over the hip line, the waist above them still %w",
  "large love handles wrapping to the lower back, spilling over the hip line": "large love handles at the top of the hips, wrapping to the lower back and spilling over the hip line, the waist above them still %w",
};
/* v142: a narrow waist set by hand between wide hips and a large bust, from "Très mince" to "Moyenne", is an hourglass: said so in the
   lead of the Seedream photo prompt, the waist compared with the bust and the hips, and never "a dramatic pear shape" or "a pear-shaped
   build" (both engines). Review: not with belly fat from "Visible" up (sdFlanksLow) */
function sdHourglass() {
  return sdFlanksLow() && +e.hips >= 3 && sdCi(e.chest) >= 4 && +e.fat <= 2;
}
var SD_CELL_FRONT = {
  "light cellulite dimpling on the backs of the thighs and just under the glutes, faint but visible in a full-body view": "light cellulite dimpling on the front and back of the upper thighs and just under the glutes, faint but visible in a full-body view from the front as well as from behind",
  "visible cellulite dimpling on the thighs and the lower glutes where the skin is uncovered": "visible cellulite dimpling on the front and back of the thighs and on the lower glutes, in the front view as well as from behind, where the skin is uncovered",
  "marked cellulite with clear dimpling on the thighs, hips and lower glutes where the skin is uncovered": "marked cellulite with clear dimpling on the front and back of the thighs, the hips and the lower glutes, in the front view as well as from behind, where the skin is uncovered",
};
/* v128 review: the option texts that call the waist slim, when the waist carries fat (t1, both engines) */
function sdOptFix(k, x) {
  /* v156: a man's chest carrying fat from "Visible" up is never said flat */
  if ("pecs" === k) return "flat chest" === x && sdFatOn("fatChest") >= 2 ? "chest with little muscle under the fat" : x;
  if ("thighs" === k) {
    /* v139: thighs carrying fat at the front from "Visible" up are never said lean */
    /* owner's render, 2026-10-28 ("Graisse : hanches et cuisses" at "Légère" on "Fines" thighs, no difference): the same for every soft
       thigh the leg definition already says soft (sdThighSoft: hip and thigh fat, saddlebags or cellulite, as well as the front fat),
       never "slim, lean thighs" next to it (both engines) */
    sdThighSoft() && (x = x.replace("slim, lean thighs", "slim thighs"));
    /* v140: "Intérieur des cuisses" set to touching: no gap said by the size */
    sdPick(SD_THIGHGAP, "thighGap") && "gap" !== e.thighGap && (x = x.replace(" with a clear gap between them", ""));
    /* v141 (prompt check): "not bulky" never next to visible saddlebags, marked hip and thigh fat or front thigh fat */
    (sdFatOn("fatThighs") >= 2 || ("m" !== e.pres && (e.fatLower >= 3 || "visible" === e.saddle || "marked" === e.saddle))) && "person" === e.mode && !sdChild(e) && (x = x.replace(", not bulky", ""));
    /* v157: never "not bulky" next to muscular front thighs */
    sdThighFront() && +e.thighFront >= 3 && (x = x.replace(", not bulky", ""));
    return x;
  }
  if ("fatFlanks" === k) return sdFlanksLow() && SD_FLANKS_NW[x] ? SD_FLANKS_NW[x].replace("%w", 0 === +e.waist ? "very narrow" : "narrow") : x;
  /* v150 (user: "le gras et le défaut du corps au niveau de la face avant de la cuisse : il se concentre toujours sur l'arrière"; the light
     cellulite said "on the backs of the thighs"): with fat on the front of the thighs, the cellulite there too, said in the front view as
     well as from behind; the end " where the skin is uncovered" kept (sdSkinBody cuts it on a reference-outfit sheet, nv). v150 review: only
     where the reference outfit leaves the front of the upper thighs bare (the tanga, a one-piece swimsuit; not the bike or swim shorts,
     GPT's included, nor a sheet in the user's own clothes) */
  if ("cellulite" === k && sdFatOn("fatThighs") >= 1 && nv() && ["tanga", "onepiece"].indexOf(sdShownCover(e)) >= 0) return SD_CELL_FRONT[x] || x;
  /* v139 review: on slim thighs ("Très fines", "Fines") the front fat stays soft, never heavy or padded */
  if ("fatThighs" === k && e.thighs <= 1) return x.replace("heavy, padded front upper thighs", "padded front upper thighs").replace("clearly padded front upper thighs", "padded front upper thighs");
  return "glutes" === k && sdFatWaist() ? x.replace("out of proportion with a slim waist", "out of proportion with the waist") : x;
}
/* v139: soft thighs (saddlebags, "Graisse : hanches et cuisses" or cellulite: rN; or fat on the front of the thighs from "Visible" up):
   the leg definition says the knees and calves, the thighs soft (both engines). rN itself is unchanged: it also writes GPT's pear-shaped
   "Fat distribution" sentence for women */
function sdKneeLeg(m) {
  var o = {},
    k;
  for (k in m)
    o[k] = m[k].replace("drawn knees, ", "").replace("sharp knees and calves", "sharp calves").replace(/^lean, /, "").replace(/^lean legs/, "legs") + ", rounded knees";
  return o;
}
/* v157d review: the leg definition with "Genoux : Lisses" (the smooth knees are said in the body details) */
function sdKneeSmoothLeg(m) {
  var o = {},
    k;
  for (k in m) o[k] = m[k].replace("drawn knees, ", "").replace("sharp knees and calves", "sharp calves");
  return o;
}
function sdThighSoft() {
  return rN() || sdFatOn("fatThighs") >= 2;
}
function sdListOr(a) {
  var s = sdList(a),
    i = s.lastIndexOf(" and ");
  return i < 0 ? s : s.slice(0, i) + " or " + s.slice(i + 5);
}
function sdFatKg() {
  return e.fat <= 2
    ? SD_FAT_Z.reduce(function (a, z) {
        return a + (z[2][sdFatOn(z[0])] || 0);
      }, 0)
    : 0;
}
function sdFatList() {
  return SD_FAT_Z.filter(function (z) {
    return sdFatOn(z[0]) > 0;
  }).map(function (z) {
    return t1(z[0], sdFatOn(z[0]));
  });
}
function sdFatZones() {
  return SD_FAT_Z.filter(function (z) {
    /* v149: "upper arms" already holds the front of the upper arms */
    return sdFatOn(z[0]) > 0 && !("fatBiceps" === z[0] && sdFatOn("fatArms") > 0);
  }).map(function (z) {
    return z[1];
  });
}
/* the soft fat, over the muscles, in one sentence. v128 review: how muscle and fat go together is said in the muscle line of each zone
   carrying fat from "Visible" up (soft shapes under the fat), not in a general sentence that contradicted a zone left sharp */
/* v135 (user, a slim Seedream body with love handles and upper arms "Visible": "la graisse ne me semble pas visible comme il le faudrait";
   neither showed, the body read lean): on a slim build (Mince, Très mince) the "Visible" fat is said where it changes the outline, in
   the fat line both engines share (calibration to check on renders) */
var SD_FAT_OUTLINE = [
  ["small love handles, soft rolls at the sides of the waist", ", breaking the waistline"],
  ["soft upper arms that sag slightly", ", their soft underside visible"],
  ["a small soft pooch below the navel, a shallow crease at the navel", ", rounding out in profile", "a small soft pooch below the navel"],
  ["small soft folds at the sides of the back, below the armpits", ", visible from behind"],
];
function sdFatText() {
  var f = sdFatList();
  e.fat <= 1 &&
    (f = f.map(function (x) {
      var r = SD_FAT_OUTLINE.filter(function (o) {
        return o[0] === x;
      })[0];
      return r ? (r[2] ? x.replace(r[2], r[2] + r[1]) : x + r[1]) : x;
    }));
  return f.length ? "Soft body fat, real and uneven, clearly visible and kept exactly in every view: " + f.join("; ") + "." : "";
}
/* v128 review: GPT's muscle text, rewritten where a zone carries fat (the same rules as sdMus and sdAbs for Seedream); unchanged without fat */
function sdFatGpt(s) {
  /* v157d review: "Genoux : Lisses", never drawn or sharp knees in line 4 (before the early return: soft thighs without any fat zone, as
     with cellulite, write them too) */
  sdKneesSmooth() &&
    "string" == typeof s &&
    (s = s
      .replace("clearly drawn knees and visible calf muscles, the thighs soft", "visible calf muscles, the thighs soft")
      .replace("sharply defined knees and calves, the thighs soft", "sharply defined calves, the thighs soft"));
  if (!sdFatList().length) return s;
  var b = sdFatOn("fatBelly"),
    a = sdArmFat();
  s = s
    .replace("; slim, dense, wiry muscles, not massive: a dry, lean physique like a lightweight martial artist, with the muscles clearly visible but small", "; slim, dense muscles, not massive, clearly visible but small")
    .replace(", as on a very lean athlete", "");
  a && (s = s.replace("; the arms look dry and wiry, like a lightweight martial artist's: lean, with sharp separations, not bulky", ""));
  b &&
    (s = s
      .replace(", deep shadow lines and low body fat on the abdomen", " and deep shadow lines")
      .replace(/with (very )?low body fat on the abdomen and /g, "with "));
  b >= 2 &&
    (s = s
      .replace(SD_ABS_DEF.clear, "the abs only as soft shapes under the belly fat")
      .replace(SD_ABS_DEF.strong, "the upper abs as soft shapes under the belly fat")
      .replace(SD_ABS_GPT.clear, "the abs only as soft shapes under the belly fat")
      .replace("sharply visible abdominal segments, ", "the upper abs as soft shapes under the belly fat, "));
  a >= 2 &&
    (s = s
      .replace("deep grooves between the biceps and triceps that visibly hollow the upper arms", "biceps and triceps as soft shapes under the arm fat")
      .replace("deep grooves between the deltoid, biceps and triceps that visibly hollow the upper arms", "the deltoid, biceps and triceps as soft shapes under the arm fat")
      .replace(/(a )?visible separation between biceps and triceps/, "biceps and triceps as soft shapes under the arm fat")
      .replace(", the forearms and the inner upper arms", " and the forearms")
      /* v130 (GPT audit): slim biceps under heavy arm fat, not "slim upper arms" next to "heavy upper arms" */
      .replace("Arms: slim upper arms", "Arms: slim biceps and triceps under the arm fat")
      /* v131: the other arm sizes under the arm fat too, as in Seedream (v130) */
      .replace(/Arms: (moderately developed biceps and triceps|well-developed, rounded biceps and triceps|very large, bulging biceps and triceps)/, "Arms: $1 under the arm fat")
      .replace("the forearms, the biceps and the front of the shoulders", "the forearms and the front of the shoulders"));
  /* v139: fat on the front of the thighs from "Visible" up: never lean legs (the clear and strong texts are said by sdThighSoft) */
  sdFatOn("fatThighs") >= 2 &&
    (s = s.replace("lean, softly toned legs", "softly toned calves, soft thighs").replace(" and arm muscles, lean legs", " and arm muscles, soft thighs"));
  /* v140 (review): fat above the knees from "Visible" up: rounded knees, never drawn, sharp or lean */
  sdFatOn("fatKnees") >= 2 &&
    (s = s
      .replace("clearly drawn knees and visible calf muscles, the thighs soft", "visible calf muscles, the thighs soft, the knees rounded")
      .replace("sharply defined knees and calves, the thighs soft", "sharply defined calves, the thighs soft, the knees rounded")
      .replace("softly toned calves, soft thighs", "softly toned calves, soft thighs, the knees rounded")
      .replace("lean, softly toned legs", "softly toned legs, the knees rounded")
      .replace("lean, slender legs with subtle muscle tone", "slender legs with subtle muscle tone, the knees rounded")
      .replace("lean, slender legs with defined but slim muscles", "slender legs with defined but slim muscles, the knees rounded")
      .replace(" and arm muscles, lean legs", " and arm muscles, slender legs with rounded knees"));
  sdFatOn("fatBack") >= 2 &&
    (s = s
      .replace("a defined back with visible shoulder blades and a groove along the spine", "the back muscles as soft shapes under the back fat")
      .replace("a sharply defined back: clear lats, visible separations around the shoulder blades and a deep groove along the spine", "the back muscles as soft shapes under the back fat"));
  /* v156: a man's chest fat from "Visible" up, as in Seedream */
  sdFatOn("fatChest") >= 2 &&
    (s = s
      .replace("a defined chest and shoulder outline", "a defined shoulder outline, the pectorals as soft shapes under the chest fat")
      .replace("defined chest and shoulders", "defined shoulders, the pectorals as soft shapes under the chest fat")
      .replace("a sharply defined chest outline", "the pectorals as soft shapes under the chest fat")
      .replace(/\ba defined chest\b/, "the pectorals as soft shapes under the chest fat"));
  return s;
}
/* v134 (user: "Muscles apparents : abdos, j'ai mis Présents, du coup ça contredit Plat, lisse : on peut être plat et lisse et distingué
   derrière une musculature, non ?"): with "Plat, lisse" the "Muscles apparents : abdos" set by hand were dropped, the stomach said with no
   visible segments; now a flat, smooth stomach with the abdominal muscles readable under the skin at that level (both engines) */
var SD_FLAT_ABS = {
  subtle: "a flat, smooth stomach, the abdominal muscles only hinted under the skin by a faint vertical line above the navel",
  clear: "a flat, smooth stomach with the abdominal muscles readable under the skin: the centre line and the upper segments as soft shapes",
  strong: "a flat, smooth stomach with the abdominal muscles clearly readable under the skin: the centre line and the segments outlined by soft shadows",
};
function sdFlatAbs() {
  return "flat" === e.absStyle ? SD_FLAT_ABS[e.defAbs] || "" : "";
}
function sdAbs() {
  var r = "m" !== e.pres && "dadbod" === e.absStyle ? "belly" : e.absStyle;
  if (!r || "auto" === r) return "";
  /* v128 review: belly fat from "Visible" up; a flat or smooth stomach no longer said, the segments only under the fat (both engines:
     GPT takes this line in place of its own) */
  var bf = sdFatOn("fatBelly"),
    u = 2 === bf ? ", only as soft shapes under the belly fat" : ", only faintly hinted under the belly fat";
  if (bf >= 2)
    return (
      "Abdomen: " +
      ({
        soft: "a soft belly with no visible abs",
        flat: "no visible abdominal segments",
        line: "a single soft vertical groove above the navel, no horizontal lines",
        groove: "a shallow vertical groove down the middle of the belly, above the navel, no visible abs",
        four: "four segments above the navel" + u,
        six: "six segments in three rows" + u,
        eight: "eight segments in four rows" + u,
        staggered: "abdominal segments in an uneven, staggered pattern" + u,
        belly: "a soft lower belly, no visible abs",
        dadbod: "a soft, rounded belly over a solid, broad frame, no visible abs",
      }[r] || "no visible abdominal segments") +
      "."
    );
  var m = {
      soft: "a soft, flat to slightly rounded belly with no visible abs",
      flat: sdFlatAbs() || "a flat, smooth stomach with no visible abdominal segments",
      line: "a flat stomach with a single vertical groove down the middle and no horizontal lines",
      /* v139 (user: "un ventre plat mais avec une fente au milieu"): flat and soft, the groove not from muscle (no definition level) */
      /* v140 (lessons: "soft" 11 times or more blocked every time): the same stomach without the word */
      groove: "a flat stomach with a shallow vertical groove down the middle, from below the breastbone to the navel, between two slightly fuller sides; no segments, no horizontal lines, no visible muscle",
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
            subtle: ", only faintly hinted, no deep shadows",
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
/* v131 (user: at the top of "Épaules" with a strong build, the shoulders and the back hardly change, the deltoids should be very developed;
   and: pectorals for women, for a muscular woman). Measured on the user's two Seedream body sheets (front view, settings "Épaules : Très
   larges", "Musculature : Forte"): width across the deltoids / width of the hips = 1.24 and 1.20, at or below the median woman of ANSUR II
   (Gordon et al., 2014, as tabled by The Ergonomics Center of North Carolina, 2017: bideltoid breadth 17.72 in, hip breadth 13.90 in, 1.27).
   Causes in the prompt: "Épaules" said a width word only, the hips a number (the model followed the number); no control for the volume of
   the deltoids or of the lats (the "Muscles apparents" say sharpness only, "Musculature" a whole-body comparison); a woman's pectorals were
   ruled out by three texts. Now: "Deltoïdes" and "Dorsaux" (sizes, both engines, adults; Auto follows "Musculature" from "Forte" up), said
   with the shoulders at the start of the build line; from "Larges" up, when the shoulders are wider than the hips, a width across the
   deltoids as a multiple of the hip width (prompt calibration from the ANSUR II medians and 5th to 95th percentiles, not a measure);
   "Pectoraux (muscles)" for a woman or an androgynous person (Auto: only on a "Très menue" chest, from "Forte" up). */
var SD_DELTS = {
  small: "small, flat deltoids",
  medium: "moderately developed deltoids",
  big: "well-developed, rounded deltoids that stand out past the upper arms",
  huge: "very large, round deltoids bulging past the upper arms, the widest part of the upper body",
};
var SD_PECS_FLAT = {
  small: "no breast volume: a flat chest with faint, flat pectoral muscles under the skin",
  /* v133 (user, two Seedream sheets with "Développés": "les pecs ressemblent beaucoup à des seins"; both drew rounded mounds filling the
     triangles): never "projecting in profile", which reads as a bust on a woman; said as flat plates of muscle, never round mounds */
  medium: "no breast volume: a flat chest with visible pectoral muscles, two flat muscle plates from the sternum to the armpits, never round mounds",
  big: "no breast volume: a flat chest of developed pectoral muscles, two broad, flat, squared-off muscle plates from the sternum to the armpits, never round mounds",
  huge: "no breast volume: a flat chest of very developed pectoral muscles, two thick, broad, squared-off muscle plates from the sternum to the armpits, never round mounds",
};
/* v134 (user, a Seedream sheet with the top left off, prompt v133, "Développés" on "Très menue": a medium bust, round in profile, and no
   pectoral muscle to be seen): every flat-chest text named what it ruled out ("no breast volume", "never round mounds"), words a text
   encoder may read as the thing itself (negation is poorly understood by CLIP-like vision-language models, Alhamoud et al., CVPR 2025;
   not verified for Seedream 5). In a native Seedream body the flat chest is said in positive terms only: a male athlete's chest as the
   visual reference, and the landmarks of the pectorals that can be drawn. GPT unchanged. Not yet checked on renders. */
var SD_PECS_FLAT_SD = {
  small: "a flat chest like a slim man's: faint, flat pectoral muscles under the skin; in the side views the chest line runs straight down from the collarbones",
  medium: "a flat, muscular chest like a male athlete's: two flat pectoral muscles from the sternum to the armpits, their lower edge a straight line rising toward the armpit, a firm fold at the front of each armpit; in the side views the chest line runs straight down from the collarbones",
  big: "a flat, muscular chest like a male athlete's: two broad, thick, squared-off pectoral muscles from the sternum to the armpits, a firm shelf just below the collarbones, a clear line where they meet the deltoids, their lower edge a straight line rising toward the armpit, a thick fold at the front of each armpit; in the side views the chest line runs straight down from the collarbones",
  huge: "a flat, very muscular chest like a male bodybuilder's: two very thick, broad, squared-off pectoral muscles from the sternum to the armpits, a thick shelf just below the collarbones, a deep line where they meet the deltoids, their lower edge a straight line rising toward the armpit, a thick fold at the front of each armpit; in the side views the chest line runs straight down from the collarbones",
};
var SD_PECS_ON = {
  small: "faint pectoral muscles at the top of the chest, above the bust",
  medium: "visible pectoral muscles that firm the upper chest above the bust",
  big: "developed pectoral muscles, firm and visible on the upper chest above the bust and toward the armpits",
  huge: "very developed pectoral muscles, thick and wide across the upper chest above the bust and toward the armpits",
};
function sdUpOn() {
  return "person" === e.mode && !sdChild(e) && !(e.photo && e.bodyAsIs);
}
/* Auto: nothing up to "Athlétique"; "Forte": developed (moderate on a slim or very lean build, which the build line calls narrow); "Culturiste": the largest */
function sdUpAuto() {
  return e.muscle >= 4 ? "huge" : e.muscle >= 3 ? (e.fat <= 1 ? "medium" : "big") : "";
}
function sdMusLv(k) {
  if (!sdUpOn()) return "";
  var v = e[k];
  return v && "auto" !== v ? v : sdUpAuto();
}
function sdPecsF() {
  if (!sdUpOn() || "m" === e.pres) return "";
  var v = e.pecsF;
  return v && "auto" !== v ? v : sdCi(e.chest) <= 0 ? sdUpAuto() : "";
}
function sdBuildFix(t) {
  return sdMusBig() && "string" == typeof t
    ? t.replace(" with little muscle mass", "").replace(", like a long-distance runner", "").replace(", like a swimmer or a dancer", "").replace(": a slim, narrow silhouette with compact, dense muscles", ": a slim silhouette with compact, dense muscles")
    : t;
}
/* GPT's body line with the head: its items read apart when the deltoids, the lats or a woman's pectorals are said */
function sdSep() {
  return sdShoulders() !== t1("shoulders", e.shoulders) || sdPecsF() ? "; " : ", ";
}
function sdMusBig() {
  return ["big", "huge"].indexOf(sdMusLv("delts")) >= 0 || ["big", "huge"].indexOf(sdMusLv("lats")) >= 0;
}
function sdLatsText() {
  var l = sdMusLv("lats"),
    forte = 4 === +e.fat,
    v = e.waist <= 2 && sdFatOn("fatFlanks") < 2 && !forte,
    f = "flat" !== l && (sdFatOn("fatBack") >= 2 || forte) ? " under a layer of soft back fat," : "",
    t = {
      flat: "narrow, flat lats",
      medium: "moderately developed lats" + f + " widening the back below the armpits",
      big: "wide lats" + f + " flaring out below the armpits" + (v ? ", the back clearly wider there than at the waist" : ""),
      huge: "very wide, thick lats" + f + " flaring far out below the armpits" + (v ? ", the back much wider there than at the waist" : ""),
    }[l];
  return t || "";
}
/* the shoulders of the build line in both engines: width, then the deltoids; the lats as the next item */
function sdShoulders() {
  var d = SD_DELTS[sdMusLv("delts")] || "",
    l = sdLatsText();
  return t1("shoulders", e.shoulders) + (d ? " with " + d : "") + (l ? "; " + l : "");
}
/* across the deltoids, a multiple of the hip width, only where the shoulders are set wider than the hips from "Larges" up */
function sdShoulderRatio() {
  if (!sdUpOn() || !(e.shoulders >= 3) || !(e.shoulders > e.hips)) return "";
  var b = "m" === e.pres ? 1.48 : "f" === e.pres ? 1.27 : 1.375,
    S = [0.9, 0.95, 1, 1.055, 1.11],
    H = [0.88, 0.94, 1, 1.065, 1.13],
    D = { small: 0.98, medium: 1, big: 1.04, huge: 1.08 },
    r = (b * S[e.shoulders]) / (H[e.hips] || 1) * (D[sdMusLv("delts")] || 1);
  return String(+(Math.round(r * 20) / 20).toFixed(2));
}
/* a woman's pectorals on her chest text (both engines): instead of a flat chest, or above a bust */
function sdPecsBust(x, sd) {
  var p = sdPecsF();
  if (!p || !SD_PECS_FLAT[p]) return x;
  return sdCi(e.chest) <= 0 ? (sd ? SD_PECS_FLAT_SD : SD_PECS_FLAT)[p] : sdPecsUp(x) + "; " + SD_PECS_ON[p] + ", the bust itself soft on top of them";
}
/* the texts of the bust shapes (both engines) that say the upper chest is flat, emptied or deflated: with a woman's pectorals set, the
   upper chest is firm with muscle and only the bust's own upper slope stays flat */
var SD_PECS_UPPER = [
  ["the upper chest slightly emptied below the collarbones", "the upper chest firm with pectoral muscle below the collarbones"],
  ["the upper chest stays long and flat for about two hands' width below the collarbones before the bust begins", "the upper chest, firm with pectoral muscle, stays long for about two hands' width below the collarbones before the bust begins"],
  /* v146 review: the "Tombante" + "Très généreuse" text of v146 */
  ["the upper part relaxed, sloping gently down from below the collarbones", "the upper chest firm with pectoral muscle below the collarbones, the upper part of the bust relaxed, sloping gently down from it"],
  ["in profile the upper slope is long, flat and slightly hollow", "in profile the upper slope is long and flat over the pectoral muscle"],
  ["the upper chest flat below the collarbones", "the upper chest flat and firm with pectoral muscle below the collarbones"],
  ["no fullness near the collarbones; the upper part slightly deflated, as often on lean athletic women", "no breast fullness near the collarbones, only firm pectoral muscle; the upper part of the bust slightly deflated over it"],
  /* the same pear text without ", as often on lean athletic women" (this repository, v1.1.2) */
  ["no fullness near the collarbones; the upper part slightly deflated;", "no breast fullness near the collarbones, only firm pectoral muscle; the upper part of the bust slightly deflated over it;"],
  ["the upper chest flat and slightly emptied below the collarbones", "the upper chest flat, firm with pectoral muscle, below the collarbones"],
  ["the upper chest just below the collarbones stays flat for about a hand's width before the bust begins", "the upper chest just below the collarbones stays flat and firm with pectoral muscle for about a hand's width before the bust begins"],
  ["narrower and flatter in the upper part,", "narrower and flatter in the upper part, over firm pectoral muscle,"],
];
function sdPecsUp(x) {
  return sdPecsF() && "string" == typeof x
    ? SD_PECS_UPPER.reduce(function (a, r) {
        return a.split(r[0]).join(r[1]);
      }, x)
    : x;
}
function sdMus() {
  var soft = sdSoft(),
    z = function (k, m) {
      return soft && "subtle" === rP(k) ? "" : m[rP(k)] || "";
    },
    leg = sdThighSoft()
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
    /* v140 (review): fat above the knees from "Visible" up: rounded knees, never drawn, sharp or lean */
    /* v157d review: "Genoux : Lisses", never drawn or sharp knees in the leg definition */
    leg = sdFatOn("fatKnees") >= 2 ? sdKneeLeg(leg) : sdKneesSmooth() ? sdKneeSmoothLeg(leg) : leg,
    p = [
      z("defShoulders", {
        subtle: "softly visible shoulder muscles",
        clear: "defined shoulders",
        strong: "sharply cut shoulders",
      }),
      /* v128 review: a zone carrying fat from "Visible" up shows its muscles as soft shapes under that fat */
      sdFatOn("fatBack") >= 2
        ? z("defBack", { subtle: "a softly toned back", clear: "the back muscles as soft shapes under the back fat", strong: "the back muscles as soft shapes under the back fat" })
        : z("defBack", {
        subtle: "a softly toned back",
        clear: "visible shoulder blades and spine groove",
        strong: "a sharply defined back with clear lats and a deep groove along the spine",
      }),
      sdArmFat() >= 2
        ? z("defArms", { subtle: "softly toned arms", clear: "biceps and triceps as soft shapes under the arm fat", strong: "biceps and triceps as soft shapes under the arm fat, every forearm muscle and tendon visible" })
        : z("defArms", {
        subtle: "softly toned arms",
        clear: "a visible groove between biceps and triceps",
        strong: "very marked arms: deep grooves between biceps and triceps that hollow the upper arms, " + ("none" !== rP("defShoulders") ? "the shoulder cap clearly separated, " : "") + "every forearm muscle and tendon visible" + (["big", "huge"].indexOf(e.biceps) < 0 && e.muscle <= 2 ? ", not bulky" : ""),
      }),
      z("defLegs", leg),
    ];
  /* v131: a woman's pectorals, when set, have their sharpness too */
  ("m" === e.pres || sdPecsF()) &&
    p.push(
      /* v156: a man's chest fat from "Visible" up: the pectorals as soft shapes under it */
      sdFatOn("fatChest") >= 2
        ? z("defChest", { subtle: "a softly visible chest", clear: "the pectorals as soft shapes under the chest fat", strong: "the pectorals as soft shapes under the chest fat" })
        : z("defChest", {
        subtle: "a softly visible chest",
        clear: "a defined chest",
        strong: "a sharply outlined chest",
      }),
    );
  "auto" === e.absStyle &&
    p.push(
      /* v128: belly fat from "Visible" up covers fine abs; stronger ones show as soft shapes */
      sdFatOn("fatBelly") >= 2
        ? z("defAbs", { clear: "the abs only as soft shapes under the belly fat", strong: "the upper abs as soft shapes under the belly fat" })
        : z("defAbs", SD_ABS_DEF),
    );
  "auto" !== e.biceps &&
    p.push(
      (sdArmFat() >= 2
        ? { slim: "slim biceps and triceps under the arm fat", medium: "moderate biceps and triceps under the arm fat", big: "rounded biceps and triceps under the arm fat", huge: "very large biceps and triceps under the arm fat" }
        : { slim: "slim upper arms", medium: "moderate biceps and triceps", big: "rounded biceps and triceps", huge: "very large biceps and triceps" })[e.biceps] || "",
    );
  /* v130: one soft-shape clause for the arms when their size is set */
  sdArmFat() >= 2 && "auto" !== e.biceps && (p = p.filter(function (x) {
    return x.indexOf("biceps and triceps as soft shapes under the arm fat") < 0;
  }));
  "auto" !== e.traps &&
    p.push({ flat: "a flat trapezius line", medium: "a moderate trapezius slope", big: "trapezius rising visibly from the neck", huge: "very large trapezius rising steeply from the skull" }[e.traps] || "");
  p = p.filter(Boolean);
  soft && p.unshift("barely visible muscles" + (sdNoBulk() ? ", no muscle bulk" : ""));
  p.length && "m" !== e.pres && e.chest >= 1 && "low" !== e.bustShape && !sdPecsF() && p.push("a smooth upper chest");
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
  /* v128: the soft fat of each zone, over the muscles */
  /* v130: the fat line now comes before the muscles in the Seedream body (sdBody); GPT keeps it in "Muscles and details" */
  ("strong" === r_() || "strong" === rP("defShoulders")) &&
    e.muscle <= 2 &&
    ["big", "huge"].indexOf(e.biceps) < 0 &&
    ["big", "huge"].indexOf(sdMusLv("delts")) < 0 &&
    x.push("Arm and shoulder muscles stay average-sized.");
  /* v128 review: no veins on upper arms carrying fat from "Visible" up */
  rD() &&
    x.push(
      (sdArmFat() >= 2 ? function (v) {
        return v.replace("hands, forearms and inner upper arms", "hands and forearms").replace("forearms, biceps, ", "forearms, ");
      } : function (v) {
        return v;
      })({
        none: "No visible veins on the arms and hands.",
        light: "Faint veins on the backs of the hands and inner forearms.",
        visible: "Visible veins on the hands, forearms and inner upper arms.",
        strong: "Prominent veins on the hands, forearms, biceps, front of the shoulders and lower legs.",
      }[rD()] || t6(t1("veins", rD())) + "."),
    );
  var d = rA().some(function (k) {
      var v = rP(k);
      return "clear" === v || "strong" === v;
    }),
    so = [];
  "m" !== e.pres && e.chest >= 1 && (d || rw().indexOf("the bust") >= 0) && ["conical", "high", "round"].indexOf(e.bustShape) < 0 && !sdBustHighOn() && !sdBustFwdOn() && so.push("bust");
  ("belly" === e.absStyle || "soft" === e.absStyle || "dadbod" === e.absStyle) && d && so.push("belly");
  ["low", "flat"].indexOf(e.glutesShape) >= 0 && so.push("glutes");
  (rM() || rj()) ? so.push("hips", "thighs") : sdFatOn("fatThighs") >= 2 && so.push("thighs");
  so.length &&
    (d || rw().length) &&
    "low" !== e.bustShape &&
    "low" !== e.glutesShape &&
    x.push("The " + sdList(so) + (so.length > 1 || /s$/.test(so[0]) ? " stay" : " stays") + " soft, shaped by gravity.");
  /* v157 (his render): never "not from muscle size" next to muscular legs or glutes set by their sliders */
  d && e.muscle <= 2 && "low" !== e.glutesShape && "low" !== e.bustShape && !sdFatList().length && !sdMusBig() && !sdLegLead() && x.push("Definition from leanness, not from muscle size.");
  var sk = [];
  "m" !== e.pres && e.chest >= 1 && sk.push("breasts");
  ["low", "flat"].indexOf(e.glutesShape) >= 0 && sk.push("glutes");
  (rM() || rj()) && sk.push("hips", "thighs");
  sk = sk.concat(sdFatZones().filter(function (z) {
    return sk.indexOf(z) < 0 && !("front of the upper thighs" === z && sk.indexOf("thighs") >= 0);
  }));
  d && sk.length && x.push("This definition never slims the " + sdListOr(sk) + ".");
  return x.join(" ");
}
/* v139 (user: "tache de naissance à ajouter aussi dans le signe avec le lieu : cou, corps, bras, etc."): "Tache de naissance" in Signes,
   adults (person, not a child), both engines, in the marks line (rg). Type, size, place, side (the character's). Face and neck: the head
   sheet and a body sheet with the head (the headless body sheet starts at the base of the neck); the rest: body sheets only.
   Descriptions from: DermNet, "Café au lait macule" (M. A. Krisna, 2015, updated 2025): light brown, evenly pigmented, round or oval,
   well demarcated ("a few shades browner than the skin around it" so it holds on every skin tone); Primary Care Dermatology Society,
   "Port-wine stain" (T. Cunliffe, 2022): flat, red or purple, a distinct cut-off, darkening and thickening with age in some;
   DermNet, "Congenital melanocytic naevi" (A. Oakley 2001, G. Raj and A. Oakley 2014, updated 2024): single or multi-shaded, the
   surface slightly rough or bumpy. Sizes are prompt wording, not measures. */
var SD_BM_TYPE = {
  cal: ["café-au-lait birthmark", "a flat, evenly coloured patch a few shades browner than the skin around it, round to oval, with a clear edge"],
  pws: ["port-wine stain birthmark", "a flat, wine-red to purple patch with a sharp, irregular edge"],
  /* v139 review: one shading, the same in every view; "mark", a "patch" being flat */
  cmn: ["congenital mole", "an even mid-brown mark with a few darker flecks, slightly raised, with a slightly bumpy surface"],
};
var SD_BM_SIZE = { s: "about 2 cm across", m: "about 5 cm across", l: "about 10 cm across, the size of a palm" };
/* "h": the head sheet and a body sheet with the head; "b": the body sheets */
var SD_BM_PLACE = {
  forehead: ["h", "on the % side of the forehead"],
  temple: ["h", "on the % temple"],
  cheek: ["h", "on the % cheek"],
  jaw: ["h", "along the % side of the jaw"],
  neck: ["h", "on the % side of the neck"],
  nape: ["h", "on the back of the neck, % of the centre"],
  shoulder: ["b", "on top of the % shoulder"],
  upperarm: ["b", "on the outer side of the % upper arm"],
  forearm: ["b", "on the outer side of the % forearm"],
  hand: ["b", "on the back of the % hand"],
  chest: ["b", "on the % side of the upper chest, just below the collarbone"],
  upperback: ["b", "on the % shoulder blade"],
  lowerback: ["b", "on the % side of the lower back"],
  belly: ["b", "on the belly, to the % of the navel"],
  hip: ["b", "on the outer side of the % hip"],
  thigh: ["b", "on the front of the % thigh"],
  calf: ["b", "on the back of the % calf"],
};
function sdBmOn() {
  return "person" === e.mode && !sdChild(e) && !!SD_BM_TYPE[e.bmType];
}
/* t: the head sheet (rg's argument) */
function sdBm(t) {
  if (!sdBmOn()) return "";
  var p = SD_BM_PLACE[e.bmPlace] || SD_BM_PLACE.neck,
    ty = SD_BM_TYPE[e.bmType];
  if ("h" === p[0] ? !(t || !nw()) : t) return "";
  /* v139 review: a large mark on the face or the neck spreads past its place (a temple is about 5 cm wide) */
  var sz = "l" === e.bmSize && "h" === p[0] ? "about 10 cm across, spreading onto the skin around it" : SD_BM_SIZE[e.bmSize] || SD_BM_SIZE.m;
  return "a " + ty[0] + " " + p[1].replace(/%/g, "right" === e.bmSide ? "right" : "left") + ", " + sz + ": " + ty[1];
}
/* the drawn marks of "Body details" (the last item of sdDetails) */
var SD_DRAWN_MARKS = ["a small mole on the left shoulder blade", "a small mole on the left shoulder", "a cluster of faint freckles on both shoulders", "a small birthmark above the right hip", "a small mole on the inner left forearm", "dense freckles on the shoulders and the upper back"];
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
        "none" === sdFreckleLv() ? "a small mole on the left shoulder" : "a cluster of faint freckles on both shoulders",
        /* v139: with a birthmark set, never a second one drawn */
        /* v139 review: a place no birthmark can take */
        sdBmOn() ? "a small mole on the inner right wrist" : "a small birthmark above the right hip",
        "a small mole on the inner left forearm",
      ].concat((e.bodyScars || 0) > 0 || t5(e.marks) || sdBm(!1) || sdBodySkin().length ? [] : ["no visible body marks"]).map(function (x) {
        /* v130 review: "Énormément" also on the body sheet, whatever the draw */
        return "lots" === sdFreckleLv() ? "dense freckles on the shoulders and the upper back" : x;
      }),
    ),
  );
  a = sdDetailMap(a.filter(function (x) {
    return "no visible body marks" !== x;
  }));
  return "Body details: " + a.join(", ") + ".";
}
/* the drawn body details that would contradict the build, the shoulders or the glutes, moved to their counterpart (Seedream;
   v131: GPT too, which kept "bony, clearly drawn knees" on a heavy body; broad shoulders or a strong build: never sloping shoulders or
   a narrow ribcage) */
function sdDetailMap(a) {
  e.shoulders <= 1 && (a = a.map(function (x) {
    return "square shoulders" === x ? "slightly sloping shoulders" : x;
  }));
  e.shoulders >= 3 && (a = a.map(function (x) {
    return "slightly sloping shoulders" === x ? "square shoulders" : x;
  }));
  (e.shoulders >= 3 || e.muscle >= 3) && (a = a.map(function (x) {
    return "a narrow ribcage" === x ? "a slightly wide ribcage" : x;
  }));
  var cv = e.fat <= 1
    ? { "softly padded collarbones": "clearly visible collarbones", "low, full calves": "slim calves", "soft, rounded knees": "bony, clearly drawn knees", "sturdy ankles": 0 === e.fat ? "slim ankles" : "sturdy ankles" }
    : e.fat >= 3
      ? e.fat >= 4
        ? Object.assign({}, SD_FORTE_DETAIL)
        : { "clearly visible collarbones": "softly padded collarbones", "bony, clearly drawn knees": "soft, rounded knees", "high calves with long lower tendons": "low, full calves", "slim ankles": "slim ankles" }
      : {};
  "low" === e.glutesShape && (cv["a marked curve in the lower back"] = "a fairly straight lower back");
  /* v135 (user, "Très bombés": "the lower back curves in deeply" and, drawn, "a fairly straight lower back"): the drawn lower back follows a high, round glute */
  ["high", "shelf"].indexOf(e.glutesShape) >= 0 && (cv["a fairly straight lower back"] = "a marked curve in the lower back");
  /* v140: the settings that replace a drawn detail (navel, lower back, soft knees) or join the lower back (shoulders, waist height, inner
     thighs); none set: the drawn details as before */
  /* v140 review: "Bas" glutes keep the straight lower back their shape needs (pose and glute text say it) */
  var lb = "low" === e.glutesShape && ("marked" === e.lordosis || "deep" === e.lordosis || "hyper" === e.lordosis) ? "" : sdPick(SD_LORD, "lordosis"),
    nv = sdPick(SD_NAVEL, "navel"),
    rb = sdPick(SD_RIB, "ribcage"),
    cb = sdPick(SD_CLAV, "clav"),
    /* v157 (user: "ajoute les muscles des mollets, un curseur"): "Mollets" replaces the drawn calves (both engines) */
    cf = "person" === e.mode && !sdChild(e) && +e.calves >= 1 ? t1("calves", Math.min(4, Math.round(+e.calves))) : "",
    sp = sdPick(SD_SHSHAPE, "shShape"),
    xb = [sdPick(SD_POSTURE, "shPosture"), e.waist >= 4 ? "" : sdPick(SD_WAISTPOS, "waistPos"), sdHipPos(), sdPick(SD_DIMPLES, "backDimples"), sdPick(SD_THIGHGAP, "thighGap")].filter(Boolean),
    ks = sdFatOn("fatKnees") >= 1,
    kn = sdPick(SD_KNEES, "knees"),
    an = sdPick(SD_ANKLES, "ankles"),
    fg = sdPick(SD_FINGERS, "fingers");
  var cfDone = !1,
    out = a.map(function (x) {
    var y = cv[x] || x;
    cf && ("high calves with long lower tendons" === x || "low, full calves" === x) && ((y = ""), (cfDone = !0));
    /* v157: a leg shape that names the calves: no other calves drawn */
    /* v157b: "Droites" too (calves close in width to the knees and thighs), and its ankles */
    !cf && sdPick(SD_LEGSHAPE, "legShape") && (sdPick(SD_LEGSHAPE, "legShape")[1] || "straight" === e.legShape) && ("high calves with long lower tendons" === x || "low, full calves" === x || "slim calves" === x) && (y = "");
    !cf && "straight" === e.legShape && sdPick(SD_LEGSHAPE, "legShape") && ("slim ankles" === x || "sturdy ankles" === x) && (y = "");
    sdLegAnkles() && ("slim ankles" === x || "sturdy ankles" === x) && (y = "");
    ks && ("bony, clearly drawn knees" === y || "soft, rounded knees" === y) && (y = "rounded knees");
    /* v157d (user's render: "bony, clearly drawn knees" forced on every slim body, "sturdy ankles" and "short, strong fingers" drawn on a
       fine one): "Genoux", "Chevilles", "Doigts" replace the drawn item. Knees: fat above the knees (from "Légère") keeps them rounded,
       "Marqués" never on a "Forte" body (v131); ankles: a leg shape that names them keeps its own */
    kn && !ks && !("bony" === e.knees && 4 === +e.fat) && ("bony, clearly drawn knees" === x || "soft, rounded knees" === x) && (y = kn);
    /* v157d review: from "Enrobée" a leg shape no longer names its slim ankles (sdLegShape): "Chevilles" said there */
    an && !(sdLegAnkles() && +e.fat < 3) && ("slim ankles" === x || "sturdy ankles" === x) && (y = an);
    fg && ("long, slender fingers" === x || "short, strong fingers" === x) && (y = fg);
    nv && ("a small, round navel" === x || "a vertical, slit-like navel" === x) && (y = nv);
    rb && ("a slightly wide ribcage" === x || "a narrow ribcage" === x) && (y = rb);
    cb && ("clearly visible collarbones" === x || "softly padded collarbones" === x) && (y = cb);
    sp && ("square shoulders" === x || "slightly sloping shoulders" === x) && (y = sp);
    ("a marked curve in the lower back" === x || "a fairly straight lower back" === x) && (y = [lb || y].concat(xb).join(", "));
    /* v157 review: "Extrême" pushes the glutes back and up, never with flat, low or drooping glutes */
    "hyper" === e.lordosis && (["flat", "low"].indexOf(e.glutesShape) >= 0 || sdGlDefOn("sag")) && (y = y.replace(", the glutes pushed back and up", "").replace("hollowing in sharply above them", "hollowing in sharply above the glutes"));
    return y;
  });
  /* v157: the calves set are said with the legs (sdLegShape), the drawn ones go */
  return out.filter(Boolean);
}
/* v140 (user: "Silhouettes types", "Vergetures", "Cambrure et posture", "Cuisses et nombril", and the settings for real bodies he had not
   thought of: loose belly skin, fat above the knees, spider veins, waist height). Adults (person, not a child), both engines. Stretch
   marks after S. Mikes, A. Oakley and B. Patel, "Striae Distensae", StatPearls (updated 2025): early, slightly raised, pink to violaceous
   lines; later hypopigmented, atrophic, wrinkled; on the abdomen, buttocks, thighs, breasts, back, axillae and groin. */
function sdPick(T, k) {
  return "person" === e.mode && !sdChild(e) && T[e[k]] ? T[e[k]] : "";
}
/* v157d: "Genoux", "Chevilles", "Doigts" (Auto: the drawn detail, as before) */
var SD_KNEES = { smooth: "smooth knees with only softly outlined kneecaps", bony: "bony, clearly drawn knees" };
var SD_ANKLES = { slim: "slim ankles", sturdy: "sturdy ankles" };
var SD_FINGERS = { long: "long, slender fingers", short: "short, strong fingers" };
/* "Lisses": no redness drawn on the knees (it outlined them on the user's render) */
function sdKneesSmooth() {
  /* v157d review: no effect with fat above the knees (rounded knees), as the hint says */
  return !!sdPick(SD_KNEES, "knees") && "smooth" === e.knees && sdFatOn("fatKnees") < 1;
}
var SD_LORD = {
  straight: "a fairly straight lower back",
  marked: "a marked curve in the lower back",
  /* v140 review: no "the belly and the glutes push out", which contradicted a flat belly or flat glutes */
  deep: "a deep curve in the lower back, the pelvis tipped forward",
  /* v157 (user, his render at "Très cambrée": "je dois pouvoir faire plus cambré, ça cambre pas beaucoup"): a stronger level, said with what
     the side views show */
  hyper: "a very deep, strongly arched lower back: the pelvis tipped well forward, the glutes pushed back and up, in the side views the lower back hollowing in sharply above them",
};
/* v141 (user: "il existe aussi d'autres types d'épaules non ?"): held back, and one shoulder higher (the character's side) */
var SD_POSTURE = {
  rounded: "the shoulders rolled slightly forward and the upper back gently rounded",
  back: "the shoulders held back and the chest open",
  /* v141 review: the side said as the character's (the back view swaps the image sides), as GPT's bust asymmetry does */
  rhigh: "the character's right shoulder sitting slightly higher than the left",
  lhigh: "the character's left shoulder sitting slightly higher than the right",
};
/* v150 (user, his reference photo, body type only: "la partie entre le nombril et le pubis est méga large et je n'arrive pas à le
   simuler", "un truc supplémentaire sans garantir que ça va fonctionner"; measured in that pose, turned and on one leg: the waist
   narrowest above the navel, the outline swinging out fastest just below it, widest at the top of the thighs, about 1.65 times the
   waist; the tool's text gives 1.42 to 1.53 on 11 renders of his sheet): "Bassin très évasé (essai)", a toggle with "Très larges" hips,
   a woman or an androgynous adult. The body (both engines) says the curve from just below the navel; card 2b says the same curve,
   without the long curve to the knees (the width goes to the pelvis). Not checked on renders. */
/* v150 review: shown with a waist from "Très fin" to "Moyenne" (a wide waist has no waistline to swing out from); no effect with a dip,
   square glutes, saddlebags (which break that outline, as in sdHipPos and card 2b) or a low waist (its narrowest point at the top of the
   hips, so a curve from just below the navel would pinch it); card 2b keeps its step (the amount was reached, 1.63 to 1.75: the shape is
   what changes); a landmark ("a hand's width below the navel") instead of "the band between the navel and the crotch" */
function sdHipFlareShow() {
  return "person" === e.mode && !sdChild(e) && "m" !== e.pres && 4 === +e.hips && +e.waist <= 2;
}
function sdHipFlare() {
  return sdHipFlareShow() && !!e.hipFlare && !sdGlDefOn("dips") && !sdGlDefOn("square") && !rM() && "low" !== e.waistPos;
}
var SD_HIP_FLARE = ", the outline swinging out in a full, rounded curve that starts just below the navel, the hips already far wider than the waist a hand's width below the navel";
/* v140 (user's reference photos, body type only): where the hips are widest, and the lower back dimples (dimples of Venus) */
var SD_HIPPOS = {
  high: "the hips widest high, at the hip bones, curving out just below the waist",
  low: "the hips widest low, at the top of the thighs",
};
/* v140 review: not for a man (no feminine curves said); "Haut" not with "Très larges" hips, whose text puts the widest point at the hips
   and upper thighs; "Bas" sweeps "in one curve" only without a dip, saddlebags or square glutes, which break that outline (user: "il y a
   un creux dans les hanches") */
function sdHipPos() {
  var hp = "m" !== e.pres ? sdPick(SD_HIPPOS, "hipPos") : "";
  if (!hp || ("high" === e.hipPos && e.hips >= 4)) return "";
  if ("high" === e.hipPos) return hp;
  /* v151 (self-review): with "Bassin très évasé (essai)" the curve is the one that starts just below the navel (SD_HIP_FLARE), never a
     second one "from the waist" */
  /* v157 (user, his render with "Culotte de cheval : Aucune" and "Bas": "il y en a une"): with no saddlebags the outer thighs below that
     widest point taper smoothly to the knees (said in positive terms) */
  var tp = "low" === e.hipPos && !rM() && "straight" !== e.legShape ? ", below it the outer thighs tapering smoothly and evenly to the knees" : "";
  return sdGlDefOn("dips") ? hp + ", just below the " + (0 === sdGlSide() ? "clear hollow" : "shallow dip") + " on each side" + tp : rM() || sdGlDefOn("square") || sdHipFlare() ? hp + tp : hp + ", the outline sweeping in one curve from the waist down to the upper thighs" + tp;
}
/* v141 (user's render: "les fossettes sont un peu trop marquées, c'est bizarre"): faint and shallow */
var SD_DIMPLES = { visible: "two faint, shallow dimples in the lower back, just above the glutes, one on each side of the spine" };
var SD_WAISTPOS = {
  high: "the waist set high, its narrowest point just below the ribs",
  low: "the waist set low, its narrowest point close to the top of the hips",
};
var SD_THIGHGAP = {
  gap: "a clear gap between the inner thighs",
  touch: "the inner thighs touching at the top",
  touchlong: "the inner thighs touching from the top down to just above the knees",
};
var SD_NAVEL = {
  round: "a small, round navel",
  slit: "a vertical, slit-like navel",
  deep: "a deep, round navel",
  outie: "a small outie navel that protrudes slightly",
  /* v140 (user's reference photos): a small fold of skin over the navel */
  hooded: "a vertical navel with a small fold of skin above it",
};
/* v140 (user: "épaule, il faut pouvoir choisir aussi"): the shoulder shape, drawn at random until now */
var SD_SHSHAPE = {
  /* v141 review: "rounded shoulders" is also a posture in English (rolled forward): the contour said without it */
  rounded: "shoulders with a smooth, full, rounded contour and no bony angles",
  square: "square shoulders",
  sloping: "slightly sloping shoulders",
};
/* v144 (user: "ajouter de la graisse dans les épaules, au-dessus, sur les clavicules, c'est pas possible": "Mince" always said "visible
   collarbones"): the collarbones set by hand, both engines (the drawn detail and the slim-frame sentence of the Seedream photo prompt) */
var SD_CLAV = {
  visible: "clearly visible collarbones",
  soft: "faintly visible collarbones with a little flesh over them",
  /* v156 (user: "quand je marque clavicule recouverte on les voit quand même"): said in positive terms, the collarbones padded and the skin
     smooth over them, no longer "barely visible" (a visibility word next to them); the crop lines still name the collarbones (the head and
     body sheets are cut and joined there) */
  covered: "collarbones padded by a thin layer of fat, the skin smooth and even from the base of the neck to the shoulders",
};
/* "Douces" or "Couvertes": flesh over the collarbones (never "no extra padding", never a neckline showing them under thin skin) */
function sdClavFlesh() {
  return !!sdPick(SD_CLAV, "clav") && "visible" !== e.clav;
}
/* the slim-frame sentence of the Seedream photo prompt ("Mince", "Très mince"): the collarbones as set, the hip bones after them */
function sdClavSlim(hb) {
  var c = sdPick(SD_CLAV, "clav");
  return !c || "visible" === e.clav ? "visible collarbones" + (hb ? " and hip bones" : "") : c + (hb ? "; visible hip bones" : "");
}
/* v140 (user's reference photos): the ribcage width, drawn at random until now */
var SD_RIB = { narrow: "a narrow ribcage", wide: "a slightly wide ribcage" };
/* v143 (user's render with "Blanches, nacrées": "on dirait plus des cicatrices que des vergetures"; a few single lines, sunken and
   wrinkled, drawn like cuts): a group of many fine, faint streaks side by side, flush with the skin, fading at their ends; no
   "sunken" or "wrinkled", which the model draws at their strongest (as "crinkled", v141). Calibration to check on renders. */
var SD_STRETCH = {
  white: "small groups of fine, faint streaks set close together, roughly parallel and slightly wavy, a little paler and silkier than the skin around them, flush with the skin and fading out at their ends, faint but visible in a full-body view",
  pink: "thin pink to violet lines, slightly raised",
};
var SD_STRETCH_Z = { hips: "the outer hips", thighs: "the thighs", bust: "the sides of the bust", belly: "the lower belly", glutes: "the glutes", arms: "the inner upper arms" };
/* v141 (user's render with "Un peu relâchée": "les marques sont vraiment trop fortes", the lower belly drawn deeply crinkled): no
   "crinkled", the light level faint */
var SD_LOOSE = {
  light: "the skin just below the navel very slightly loose, with a few faint, fine lines",
  marked: "loose skin on the lower belly below the navel, finely creased, settling in a shallow fold",
};
var SD_MOLES = {
  few: "a few small brown moles scattered on the shoulders, the back and the arms",
  many: "many small brown moles scattered over the shoulders, the back, the arms, the belly and the legs",
};
/* a woman's or an androgynous person's body hair (the men have the three zones): "Auto" keeps "faint body hair" */
/* v140 review: no negation ("a negated word stays a word"); the color named as for the men (a headless sheet shows no hair to take it from) */
var SD_FHAIR = {
  /* v141 (prompt check): never "smooth" skin next to the cellulite, stretch marks and texture of the same sheet */
  smooth: "hairless arms, legs and belly",
  duvet: "fine, pale peach fuzz on the forearms, the lower back and the belly",
  light: "sparse, fine hair on the forearms and the lower legs",
  natural: "natural, unshaven hair on the forearms and the lower legs, a little on the thighs",
};
var SD_SPIDER = {
  few: "a few faint spider veins, fine red and blue thread veins, on the outer thighs and the backs of the knees",
  many: "visible spider veins, fine red and blue thread veins, on the thighs, the backs of the knees and the calves",
};
/* the skin marks of the body sheets (rg, after the birthmark) */
function sdBodySkin() {
  var o = [],
    st = sdPick(SD_STRETCH, "stretch"),
    z = (Array.isArray(e.stretchZones) ? e.stretchZones : []).filter(function (k, i, a) {
      return SD_STRETCH_Z[k] && a.indexOf(k) === i;
    });
  /* v140 review: never "bust" for a man */
  st && z.length && o.push("stretch marks on " + sdList(z.map(function (k) {
    return "bust" === k && "m" === e.pres ? "the sides of the chest" : SD_STRETCH_Z[k];
  })) + ": " + st);
  sdPick(SD_LOOSE, "looseBelly") && o.push(sdPick(SD_LOOSE, "looseBelly"));
  sdPick(SD_SPIDER, "spider") && o.push(sdPick(SD_SPIDER, "spider"));
  sdPick(SD_MOLES, "bodyMoles") && o.push(sdPick(SD_MOLES, "bodyMoles"));
  return o;
}
/* "Silhouette type": buttons that set the sliders at once (only the sliders reach the prompt); the build, the bust and the glutes are
   left alone. Common body-shape names, not a medical classification. */
var SD_SHAPES = [
  ["hourglass", "Sablier", "Hourglass", { shoulders: 2, waist: 1, hips: 3, thighs: 2, fatBelly: 0, fatFlanks: 0, fatLower: 0, saddle: "none" }, 1],
  /* v143 (user: "quand je clique Sablier et ensuite Étroite, le bouton Sablier disparaît"; his character is an hourglass with narrow
     shoulders): close to the body type of his reference (v140, ui_v140.py R): narrow shoulders, a very narrow waist, very wide hips,
     light fat on the belly, the hips and thighs, light saddlebags; no love handles (R had "Légère"; none show on his photos, v142
     reading); "Sablier" unchanged for the saved characters */
  ["hourglassMarked", "Sablier marqué", "Marked hourglass", { shoulders: 1, waist: 0, hips: 4, thighs: 2, fatBelly: 1, fatFlanks: 0, fatLower: 2, saddle: "light" }, 1],
  ["pear", "Poire", "Pear", { shoulders: 1, waist: 1, hips: 3, thighs: 3, fatBelly: 0, fatFlanks: 0, fatLower: 2, saddle: "light" }, 1],
  ["apple", "Pomme", "Apple", { shoulders: 2, waist: 3, hips: 2, thighs: 1, fatBelly: 3, fatFlanks: 2, fatLower: 0, saddle: "none" }, 1],
  /* v156 (user: "silhouette type c'est ridicule, je vais pas mettre sablier, il manque en V pour les hommes"): a man's own buttons (x[4] 2),
     the five male body types of menswear (inverted triangle or V, trapezoid, rectangle, triangle, oval), on the same sliders; Poire,
     Pomme and Triangle inversé are now a woman's or an androgynous person's (x[4] 1), Rectangle is shared */
  ["vshape", "En V", "V-shape", { shoulders: 4, waist: 1, hips: 1, thighs: 2, fatBelly: 0, fatFlanks: 0 }, 2],
  ["trapeze", "Trapèze", "Trapezoid", { shoulders: 3, waist: 2, hips: 2, thighs: 2, fatBelly: 0, fatFlanks: 0 }, 2],
  ["rect", "Rectangle", "Rectangle", { shoulders: 2, waist: 3, hips: 2, thighs: 2, fatBelly: 0, fatFlanks: 0, fatLower: 0, saddle: "none" }, 0],
  ["triangleM", "Triangle", "Triangle", { shoulders: 1, waist: 3, hips: 3, thighs: 3, fatBelly: 1, fatFlanks: 1 }, 2],
  ["oval", "Ovale", "Oval", { shoulders: 2, waist: 4, hips: 2, thighs: 2, fatBelly: 3, fatFlanks: 2 }, 2],
  ["invtri", "Triangle inversé", "Inverted triangle", { shoulders: 3, waist: 2, hips: 1, thighs: 1, fatBelly: 0, fatFlanks: 0, fatLower: 0, saddle: "none" }, 1],
];
/* v144 (user: "le document doit devenir plus compréhensible sur les boutons : une ribambelle de boutons les uns après les autres, ça
   devient moins clair ; il faut garder ça mais améliorer l'UX"; the Corps tab held 64 controls in one 8 900 px column of equal rows):
   the Corps tab in named sections, head to toe, each opened by its name, one line on what it holds and the number of its settings
   that differ from the defaults; a bar of the sections at the top of the tab stays in view and jumps to each. Sections only group:
   every control stays in its tab, none changes, no prompt changes ("Longueur des jambes" moves up into "Cuisses et jambes"). A
   section with nothing to show in the current context (a child, a photo kept as is) is left out, and the bar with it under two. */
var SD_SECS = {
  gen: ["Général", "General", "Âge, hauteur, corpulence, musculature et silhouette d'ensemble.", "Age, height, build, muscle and overall body shape."],
  epaules: ["Épaules et dos", "Shoulders and back", "Largeur, posture et forme des épaules, muscles et graisse du dos.", "Shoulder width, posture and shape, back muscles and fat."],
  bras: ["Bras", "Arms", "Volume, muscles apparents, graisse et veines des bras, doigts.", "Arm volume, visible muscles, fat and veins, fingers."],
  poitrine: ["Poitrine", "Bust", "Volume, bonnet, forme, chute, écartement et peau de la poitrine.", "Bust volume, cup, shape, drop, spacing and skin."],
  taille: ["Taille et ventre", "Waist and belly", "Tour et hauteur de la taille, cage thoracique, abdominaux, ventre, nombril et poignées d'amour.", "Waist width and height, ribcage, abs, belly, navel and love handles."],
  hanches: ["Hanches et fessiers", "Hips and glutes", "Largeur des hanches, graisse, culotte de cheval, fessiers, cambrure et bas du dos.", "Hip width, fat, saddlebags, glutes, lower back curve and dimples."],
  jambes: ["Cuisses et jambes", "Thighs and legs", "Longueur des jambes, cuisses, genoux, chevilles et muscles des jambes.", "Leg length, thighs, knees, ankles and leg muscles."],
  peau: ["Peau et pilosité", "Skin and body hair", "Cellulite, vergetures, veinules, grains de beauté et poils.", "Cellulite, stretch marks, spider veins, moles and body hair."],
  planche: ["Planche", "Sheet", "Cadrage de la planche corps.", "Framing of the body sheet."],
};
var SD_SECS_M = {
  poitrine: ["Torse", "Chest", "Volume, netteté et graisse des pectoraux.", "Chest volume, definition and fat."],
  hanches: ["Hanches et fessiers", "Hips and glutes", "Largeur des hanches, fessiers, cambrure et bas du dos.", "Hip width, glutes, lower back curve and dimples."],
  peau: ["Peau et pilosité", "Skin and body hair", "Vergetures, veinules, grains de beauté et poils.", "Stretch marks, spider veins, moles and body hair."],
};
function sdSecLab(id) {
  return ("m" === e.pres && SD_SECS_M[id]) || SD_SECS[id] || [id, id, "", ""];
}
/* the settings of a section that differ from the defaults (tJ), counted on the controls shown under it */
function sdSecCount(t, keys) {
  return keys.filter(function (k) {
    var v = t[k],
      d = tJ[k];
    Array.isArray(v) && Array.isArray(d) && ((v = v.slice().sort()), (d = d.slice().sort()));
    return Object.prototype.hasOwnProperty.call(tJ, k) && JSON.stringify(v) !== JSON.stringify(d);
  }).length;
}
/* on the tab's filtered items: a header with no control under it (before the next header or the end) is left out */
function sdSecKeep(it, i, a) {
  return "sdsec" !== it.t || (i + 1 < a.length && "sdsec" !== a[i + 1].t);
}
/* each kept header gets its keys and its count; the bar gets the kept sections */
function sdSecAnn(it, i, a, t) {
  var keys = function (j) {
    for (var o = []; j < a.length && "sdsec" !== a[j].t; j++) "string" == typeof a[j].k && (o.push(a[j].k), "sdbust" === a[j].t && o.push("bustHigh", "bustWide", "bustAsym"));
    o = o.filter(function (k, i) {
      return o.indexOf(k) === i;
    });
    return o;
  };
  if ("sdsec" === it.t) return Object.assign({}, it, { n: sdSecCount(t, keys(i + 1)) });
  if ("sdsecnav" === it.t)
    return Object.assign({}, it, {
      secs: a
        .map(function (x, j) {
          return "sdsec" === x.t ? { id: x.id, n: sdSecCount(t, keys(j + 1)) } : null;
        })
        .filter(Boolean),
    });
  return it;
}
function sdSecN(n) {
  return n ? sdT(n + (n > 1 ? " réglages modifiés" : " réglage modifié"), n + (n > 1 ? " settings changed" : " setting changed")) : sdT("par défaut", "default");
}
function sdSecHead(t, r) {
  var L = sdSecLab(r.id);
  return (0, l.jsxs)(
    "div",
    {
      id: "sd-sec-" + r.id,
      "data-sec": r.id,
      tabIndex: -1,
      className: "pb-3 border-b focus-visible:outline-none",
      style: { paddingTop: 40 },
      children: [
        (0, l.jsxs)("div", {
          className: "flex items-baseline justify-between gap-3",
          children: [
            (0, l.jsx)("h3", { className: "font-bold tracking-tight", style: { fontSize: 21, lineHeight: "28px" }, children: sdT(L[0], L[1]) }),
            (0, l.jsx)("span", { className: "text-sm text-muted-foreground", "data-sec-count": r.n, children: sdSecN(r.n) }),
          ],
        }),
        (0, l.jsx)("p", { className: "mt-1 text-sm text-muted-foreground", children: sdT(L[2], L[3]) }),
      ],
    },
    "sec-" + r.id,
  );
}
/* the bar wraps on a wide screen and scrolls sideways in its own row on a phone (the compiled CSS has no responsive flex-wrap class) */
(function () {
  try {
    var st = document.createElement("style");
    st.textContent = "#sd-secnav{flex-wrap:wrap}@media (max-width:640px){#sd-secnav{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-left:4px!important;padding-right:4px!important}#sd-secnav::-webkit-scrollbar{display:none}}";
    document.head.appendChild(st);
  } catch (x) {}
})();
function sdSecNav(t, r) {
  var secs = r.secs || [];
  if (secs.length < 2) return null;
  var go = function (id) {
    var el = document.getElementById("sd-sec-" + id),
      bar = document.getElementById("sd-secnav");
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - (bar ? bar.getBoundingClientRect().height : 0) + 24;
    window.scrollTo({ top: Math.max(0, y), behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    try {
      el.focus({ preventScroll: !0 });
    } catch (x) {}
  };
  return (0, l.jsx)(
    "nav",
    {
      id: "sd-secnav",
      "aria-label": sdT("Sections du corps", "Body sections"),
      className: "bg-card",
      style: { position: "sticky", top: 0, zIndex: 20, display: "flex", gap: 8, padding: "12px 0" },
      children: secs.map(function (s) {
        var L = sdSecLab(s.id);
        return (0, l.jsxs)(
          "button",
          {
            type: "button",
            "data-sec-go": s.id,
            title: sdSecN(s.n),
            "aria-label": sdT(L[0], L[1]) + ", " + sdSecN(s.n),
            className: "rounded-full border bg-card px-3 py-1.5 text-sm font-medium hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            style: { flex: "none", whiteSpace: "nowrap" },
            onClick: function () {
              go(s.id);
            },
            children: [sdT(L[0], L[1]), s.n ? (0, l.jsx)("span", { className: "ml-1 text-muted-foreground", children: String(s.n) }) : null],
          },
          s.id,
        );
      }),
    },
    "secnav",
  );
}
/* v143 (user: after "Sablier" then "Étroites" the button lost its colour, "on a l'impression que Sablier n'a pas fonctionné, il faut
   comprendre que c'est gardé en mémoire"): the last button clicked is kept in the state (sdShapePick, UI only, never read by a prompt);
   while its sliders keep its values it is filled as before; once one of them changes (and no other button matches the sliders exactly)
   it stays marked, outlined and dashed, with "ajusté", and a line below lists each changed slider with its value and the button's. */
function sdShapeLab(k, v) {
  var o = (tZ[k] || []).filter(function (x) {
    return String(x[0]) === String(v);
  })[0];
  return o ? sdTr(o[1]) : String(v);
}
function sdShapeName(k) {
  var n = "";
  [t2, t3, t4].forEach(function (tabs) {
    (tabs || []).forEach(function (tb) {
      (tb.items || []).forEach(function (it) {
        n || !it || it.k !== k || "string" != typeof it.l || (n = it.l);
      });
    });
  });
  return sdTr(n || k);
}
/* v158 (user: "il faudrait l'adapter en fonction de chaque fille, une section de la planche spéciale pour ça" and "cache à un endroit un
   bouton spécial"; his Blender agent prompt "poitrine nue, personnage 3D" gave every character the same descent, spread and downward
   orientation, banned the conical and high shapes, took a ptosis grade set by hand, and applied bra ratios measured on padded cups to
   bodies drawn under soft, unpadded triangles): "Agent 3D", a closed, discreet panel at the end of "Poitrine", for an adult woman or
   androgynous person of 21 or more with a bust (sdRevealOk, as the tanga), never a child, a man or a photo kept as is. It writes his
   prompt filled from the character: TAILLE_POITRINE from "Poitrine", TYPE_DE_HAUT from the outfit of the body sheet, GRADE_PTOSE from
   "Forme de la poitrine" (Regnault classification: Martinez and Chung, "Breast Ptosis", StatPearls, updated 12 November 2023), the
   spacing and direction from its spacing group, the profile limits from the shape. Method A (Zhong, Zhang, Hu, Zhang, Gu and Sun,
   "Comparative Morphological Evaluation of Young Women's Breast-Bra Reshaping by Different Bra Cups", IJERPH 2023, 20(5):3856: 124
   Chinese students of 20.5 years on average, B and C cups, 3/4 bras with 13 and 23 mm cups, no underwire) kept for padded cups only,
   its ratios his own, marked "to validate" outside that population. Free thresholds are design choices, marked "À VALIDER", as in his
   prompt. The text is in a read-only field, never a <pre> (not a Seedream or GPT prompt); French in the French interface (his agent's
   language), English in the English one (sdA3dEnPass). */
/* follow-up of v158 (user: "il faudra quand même faire des tooltips, parce qu'il y a des endroits pas compréhensibles : grade de
   ptose ???"): each choice says in plain words what it is and what the agent does with it, the grades with the definitions the prompt
   uses (Regnault, from Martinez and Chung, StatPearls 2023) */
var SD_A3D_TOPS = [
  ["auto", "Auto (planche)", "Auto (sheet)", "Lu dans la tenue de la planche corps ; une tenue libre ou une planche habillée donnée en image : inconnu.", "Read from the body sheet's outfit; a free outfit or a dressed sheet given as an image: unknown."],
  ["COQUES_EPAISSES", "Coques épaisses", "Thick cups", "Soutien-gorge ou haut à coques épaisses (23 mm dans l'étude citée). En bonnet B à C, l'agent applique les écarts mesurés avec et sans soutien-gorge (Zhong 2023) ; sinon, il fait descendre la poitrine jusqu'au grade de ptose.", "Bra or top with thick moulded cups (23 mm in the cited study). At cup B to C the agent applies the gaps measured with and without a bra (Zhong 2023); otherwise it lowers the bust to the ptosis grade."],
  ["COQUES_FINES", "Coques fines", "Thin cups", "Soutien-gorge ou haut à coques fines (13 mm dans l'étude citée). En bonnet B à C, l'agent applique les écarts mesurés avec et sans soutien-gorge (Zhong 2023) ; sinon, il fait descendre la poitrine jusqu'au grade de ptose.", "Bra or top with thin moulded cups (13 mm in the cited study). At cup B to C the agent applies the gaps measured with and without a bra (Zhong 2023); otherwise it lowers the bust to the ptosis grade."],
  ["TRIANGLE_SOUPLE", "Triangle souple", "Soft triangle", "Haut de maillot à triangles souples, sans coque ni armature : il soutient à peine, la poitrine change peu sans lui.", "Soft triangle bikini top, no cups or underwire: it barely supports, so the bust changes little without it."],
  ["MAILLOT_SOUPLE", "Haut de maillot souple", "Soft bikini top", "Haut de maillot couvrant à bonnets souples, sans rembourrage ni armature : il soutient à peine, la poitrine change peu sans lui.", "Full-coverage bikini top with soft cups, no padding or underwire: it barely supports, so the bust changes little without it."],
  ["HAUT_AMPLE", "Haut ample", "Loose top", "Haut court ample qui ne soutient pas la poitrine : elle change peu sans lui.", "Loose cropped top that does not support the bust: it changes little without it."],
  ["HAUT_AJUSTE", "Haut ajusté", "Fitted top", "Haut court ajusté en jersey, qui suit la poitrine sans la remonter ni l'aplatir : maintien léger, elle change peu sans lui.", "Fitted jersey cropped top that follows the bust without lifting or flattening it: light support, it changes little without it."],
  ["UNE_PIECE_AJUSTEE", "Une-pièce ajusté", "Fitted one-piece", "Maillot une pièce au devant non structuré : maintien léger, la poitrine change peu sans lui.", "One-piece swimsuit with an unstructured front: light support, the bust changes little without it."],
  ["UNE_PIECE_GAINANTE", "Une-pièce gainant", "Shaping one-piece", "Maillot de compétition qui gaine la poitrine : sans lui, elle reprend sa forme au repos, jusqu'au grade de ptose.", "Competition swimsuit that compresses the bust: without it, the bust takes back its resting shape, down to the ptosis grade."],
  ["INCONNU", "Inconnu", "Unknown", "L'agent s'arrête et demande le type de haut avant de déformer quoi que ce soit.", "The agent stops and asks for the type of top before it deforms anything."],
];
var SD_A3D_TOPTXT = {
  COQUES_EPAISSES: "un soutien-gorge ou un haut à coques épaisses",
  COQUES_FINES: "un soutien-gorge ou un haut à coques fines",
  TRIANGLE_SOUPLE: "un haut de maillot à triangles souples, doublés, sans coque ni armature",
  MAILLOT_SOUPLE: "un haut de maillot couvrant à bonnets souples, sans rembourrage ni armature",
  HAUT_AMPLE: "un haut court ample, sans coque ni armature, qui ne soutient pas la poitrine",
  HAUT_AJUSTE: "un haut court ajusté en jersey, sans coque ni armature, qui suit la poitrine sans la remonter ni l'aplatir",
  UNE_PIECE_AJUSTEE: "un maillot une pièce au devant non structuré, qui suit la poitrine sans la remonter ni l'aplatir",
  UNE_PIECE_GAINANTE: "un maillot une pièce de compétition qui gaine la poitrine",
  INCONNU: "un haut de type inconnu",
};
var SD_A3D_GRADES = [
  ["auto", "Auto (forme)", "Auto (shape)", "Tiré de « Forme de la poitrine » sur la planche : un choix de conception, aucun grade n'est sourcé pour une forme donnée.", "Taken from “Bust shape” on the sheet: a design choice, no grade is sourced for a given shape."],
  ["AUCUNE", "Aucune", "None", "Pas de chute : le mamelon au-dessus du pli sous le sein, rien du sein sous ce pli.", "No sag: the nipple above the fold under the breast, nothing of the breast below that fold."],
  ["I", "I", "I", "Chute légère : le mamelon au niveau du pli sous le sein.", "Slight sag: the nipple level with the fold under the breast."],
  ["II", "II", "II", "Chute moyenne : le mamelon sous le pli, sans être le point le plus bas du sein.", "Moderate sag: the nipple below the fold, but not the lowest point of the breast."],
  ["III", "III", "III", "Chute marquée : le mamelon sous le pli, au point le plus bas du sein.", "Marked sag: the nipple below the fold, at the lowest point of the breast."],
  ["PSEUDO", "Pseudo", "Pseudo", "Pseudo-ptose : le mamelon au niveau du pli ou au-dessus, mais le bas du sein descend sous le pli.", "Pseudoptosis: the nipple at or above the fold, but the lower breast hangs below it."],
];
/* Follow-up of v158 (user, 2026-10-28: "il existe différents types de mamelon : soit on laisse auto, rien ne change, on laisse le
   skill faire, soit on oblige un type de mamelon en particulier"): "Mamelons" and "Aréoles", Auto by default. On Auto the prompt is
   unchanged (both stay out of the agent's scope); a type set by hand brings them into its scope, geometry only, in their own shape key.
   The areola's color stays texture work, out of scope: no source found for its tint relative to the skin. Sourced data, each with its
   population and method (the targets per type are design choices on these data, marked "À VALIDER" in the prompt):
   - Lee, Yang, Chung, Chung and Cho, "Anthropometric Measurement for the Nipple Areola Complex", Archives of Plastic Surgery 2008,
     35(4):461-464: 225 Korean women in their 20s to 50s, sizes from a questionnaire; areola 30.93 ± 10.07 mm, nipple diameter
     10.21 ± 4.14 mm, nipple height 6.54 ± 3.74 mm; the areola larger with age, marriage, delivery and lactation.
   - Sanuki, Fukuma and Uchida, "Morphologic Study of Nipple-Areola Complex in 600 Breasts", Aesthetic Plastic Surgery 2009,
     33(3):295-297: 300 adult women, calipers; areola 4.0 cm, nipple 1.3 cm, nipple height 0.9 cm (means, no SD in the abstract);
     elevated plateau type without constriction in 60.2% of breasts, inverted nipples in 3.5%. Its other types are not defined in
     the abstract, so no areola relief is offered.
   - Demiröz, Türkmen, Yıldız and Dağhan, "Anthropometric breast measurements of young women with no history of pregnancy or surgery
     in Turkey", Journal of Plastic Surgery and Hand Surgery 2021, 55(1):13-16: 88 women of 18 to 30, BMI 21.1 on average, one plastic
     surgeon; nipple projection 4.0 ± 1.8 mm on the right (1 to 9), 3.9 ± 1.8 mm on the left (1 to 10).
   - Park, Yoon and Kim, "The Prevalence of Congenital Inverted Nipple", Aesthetic Plastic Surgery 1999, 23(2):144-146: 1,625
     unmarried Korean women of 19 to 26; inverted nipples in 3.26%, both sides in 86.79% of them, umbilicated in 96.23%. */
var SD_A3D_NIPS = [
  ["auto", "Auto (maillage)", "Auto (mesh)", "Le prompt ne touche pas aux mamelons du maillage.", "The prompt leaves the mesh's nipples as they are."],
  ["PLAT", "Plats", "Flat", "Environ 2 mm de haut au-dessus de l'aréole.", "About 2 mm high above the areola."],
  ["MOYEN", "Moyens", "Average", "Environ 5 mm de haut au-dessus de l'aréole.", "About 5 mm high above the areola."],
  ["SAILLANT", "Saillants", "Projecting", "Environ 9 mm de haut au-dessus de l'aréole.", "About 9 mm high above the areola."],
  ["OMBILIQUE", "Ombiliqués", "Umbilicated", "Rentrés dans un creux au centre de l'aréole, la forme la plus fréquente des mamelons rentrés.", "Drawn into a dip at the centre of the areola, the most common form of inverted nipple."],
];
var SD_A3D_AREOLAS = [
  ["auto", "Auto (maillage)", "Auto (mesh)", "Le prompt ne touche pas aux aréoles du maillage.", "The prompt leaves the mesh's areolas as they are."],
  ["PETITE", "Petites", "Small", "Environ 21 mm de diamètre : la zone est marquée pour la texture, le maillage ne bouge pas pour elle.", "About 21 mm across: the area is marked for the texture, the mesh does not move for it."],
  ["MOYENNE", "Moyennes", "Average", "Environ 31 mm de diamètre : la zone est marquée pour la texture, le maillage ne bouge pas pour elle.", "About 31 mm across: the area is marked for the texture, the mesh does not move for it."],
  /* "Big", not "Large": the page translates the French chip "Large" (a waist) into "Wide" */
  ["GRANDE", "Grandes", "Big", "Environ 41 mm de diamètre : la zone est marquée pour la texture, le maillage ne bouge pas pour elle.", "About 41 mm across: the area is marked for the texture, the mesh does not move for it."],
];
/* the target of each type, in real millimetres (design choices on the data above) */
var SD_A3D_NIP_MM = { PLAT: 2, MOYEN: 5, SAILLANT: 9 },
  SD_A3D_ARE_MM = { PETITE: 21, MOYENNE: 31, GRANDE: 41 };
function sdA3dNip() {
  return sdA3dManual("a3dNip", SD_A3D_NIPS) ? e.a3dNip : "AUTO";
}
function sdA3dAre() {
  return sdA3dManual("a3dAre", SD_A3D_AREOLAS) ? e.a3dAre : "AUTO";
}
/* follow-up (user: "il y a des aréoles disgracieuses ... on doit pouvoir le faire"; "analyser la forme des seins ... ça peut amener à
   des choses supplémentaires"): "Relief de l'aréole" and "Tubercules", Auto by default (the prompt unchanged), geometry only, in the
   "mamelons" shape key. Sources: Sanuki, Fukuma and Uchida 2009 (see SD_A3D_NIPS: the elevated plateau type without constriction, 60.2% of
   breasts, the most common); the herniated areola of the tuberous breast (Grolleau, as described by Denoël et al., Rev Med Liège 2002,
   57(10):655-660). No published height of either relief was read, nor a reliable count of the areolar (Montgomery) tubercles: those stay
   free, marked "À VALIDER". */
var SD_A3D_RELIEFS = [
  ["auto", "Auto (maillage)", "Auto (mesh)", "Le prompt ne touche pas au relief des aréoles du maillage.", "The prompt leaves the relief of the mesh's areolas as it is."],
  ["PLATE", "Plate", "Flush", "Au ras du sein, sans marche ni bourrelet au bord.", "Flush with the breast, with no step or ridge at its edge."],
  ["PLATEAU", "En plateau", "Raised plateau", "Surélevée en plateau, sans étranglement à sa base : le type le plus fréquent (60,2 % des seins chez Sanuki 2009).", "Raised as a plateau, with no constriction at its base: the most common type (60.2% of breasts in Sanuki 2009)."],
  ["HERNIEE", "Bombée", "Domed", "Bombée en dôme, un sillon à sa base : l'aréole des seins tubéreux (Grolleau, Denoël 2002).", "Domed, with a groove at its base: the areola of tuberous breasts (Grolleau, Denoël 2002)."],
];
var SD_A3D_TUBS = [
  ["auto", "Auto (maillage)", "Auto (mesh)", "Le prompt ne touche pas aux petites bosses de l'aréole.", "The prompt leaves the small bumps of the areola as they are."],
  ["VISIBLES", "Visibles", "Visible", "Petites bosses arrondies des glandes aréolaires (Montgomery) ; nombre et taille libres, aucun chiffre fiable lu.", "Small round bumps of the areolar (Montgomery) glands; count and size free, no reliable figure read."],
];
function sdA3dRel() {
  return sdA3dManual("a3dRel", SD_A3D_RELIEFS) ? e.a3dRel : "AUTO";
}
function sdA3dTub() {
  return sdA3dManual("a3dTub", SD_A3D_TUBS) ? e.a3dTub : "AUTO";
}
/* owner's render (2026-10-28, Seedream 5.0, the sheet edited with this prompt: "Saillants", "Moyennes", "Bombée"): larger areolas and
   more projecting nipples, no dome; the context line gave only the codes, and their description in words came at word 1,613 of 3,148,
   past the 600 words reported for Seedream ("ça marchait bien avant ... parle lui comme si c'était un LLM qui construit des images").
   The context line now says each choice in plain words, the same values as the targets; codes and targets stay in INPUTS and TARGETS. */
var SD_A3D_LOOK = {
  nip: {
    AUTO: ["mamelons inchangés", "nipples unchanged"],
    PLAT: ["mamelons plats, environ " + SD_A3D_NIP_MM.PLAT + " mm de haut au-dessus de l'aréole", "flat nipples, about " + SD_A3D_NIP_MM.PLAT + " mm high above the areola"],
    MOYEN: ["mamelons moyens, environ " + SD_A3D_NIP_MM.MOYEN + " mm de haut au-dessus de l'aréole", "average nipples, about " + SD_A3D_NIP_MM.MOYEN + " mm high above the areola"],
    SAILLANT: ["mamelons saillants, environ " + SD_A3D_NIP_MM.SAILLANT + " mm de haut au-dessus de l'aréole", "projecting nipples, about " + SD_A3D_NIP_MM.SAILLANT + " mm high above the areola"],
    OMBILIQUE: ["mamelons ombiliqués, rentrés dans un creux au centre de l'aréole", "umbilicated nipples, drawn into a dip at the centre of the areola"],
  },
  are: {
    AUTO: ["taille des aréoles inchangée", "areola size unchanged"],
    PETITE: ["petites aréoles, environ " + SD_A3D_ARE_MM.PETITE + " mm de diamètre", "small areolas, about " + SD_A3D_ARE_MM.PETITE + " mm across"],
    MOYENNE: ["aréoles moyennes, environ " + SD_A3D_ARE_MM.MOYENNE + " mm de diamètre", "average areolas, about " + SD_A3D_ARE_MM.MOYENNE + " mm across"],
    GRANDE: ["grandes aréoles, environ " + SD_A3D_ARE_MM.GRANDE + " mm de diamètre", "big areolas, about " + SD_A3D_ARE_MM.GRANDE + " mm across"],
  },
  rel: {
    PLATE: ["aréoles au ras de la peau du sein, sans marche ni bourrelet au bord", "areolas flush with the breast skin, with no step or ridge at their edge"],
    PLATEAU: ["aréoles surélevées en plateau au-dessus de la peau du sein, sans étranglement à leur base", "areolas raised as a plateau above the breast skin, with no constriction at their base"],
    /* owner's renders (2026-10-28): the view-by-view dome stayed faint; a clay guide image gave the dome but its clay look and a sharp
       ring; a realism pass gave real skin but flattened the dome. The owner's example: the whole areola a soft cone extending the tip of
       the breast, its edge blending into the skin. Said so, with the usual English term, and the breast's own skin (owner: "il réussisse
       à faire ça quand je clique le bon prompt sans forcément avoir besoin de lui donner des images en plus") */
    HERNIEE: [
      "aréoles bombées (puffy areolas) : chaque aréole entière forme un petit cône arrondi et souple qui prolonge la pointe du sein ; de profil, la pointe a deux étages, la courbe du sein puis le cône de l'aréole, le mamelon au sommet ; à sa base, un léger étranglement qui se fond dans la peau, sans arête ni anneau ; même peau et même grain que le sein",
      "puffy areolas: each whole areola forms a small, soft, rounded cone that extends the tip of the breast; in profile the tip has two steps, the curve of the breast then the cone of the areola, the nipple on top; at its base a slight constriction that blends into the skin, with no sharp edge or ring; the same skin and grain as the breast",
    ],
  },
  tub: { VISIBLES: ["petites bosses arrondies (tubercules de Montgomery) visibles sur les aréoles", "small round bumps (Montgomery tubercles) visible on the areolas"] },
};
function sdA3dOn(t) {
  return "person" === t.mode && !sdChild(t) && "m" !== t.pres && t.chest >= 1 && !t.photo && sdRevealOk(t);
}
/* v158 review: the top read from the outfit line the body sheet really writes (Seedream sdOutfit, else nR: head or no head, style, size,
   drop, GPT), never guessed from the cover; the dressed sheet given as an image, a free outfit: unknown */
function sdA3dTopAuto() {
  /* v158 second review: the dressed sheet given as an image is Seedream's own (GPT always writes its outfit); the outfit line read on the
     state the prompts use (sdG: the Auto bust resolved, which changes the one-piece front) */
  if (!nv() || (sdNat(e) && sdUseBodyImg())) return "INCONNU";
  var o = String(rq(sdG(Object.assign({}, e)), function () {
    return sdNat(e) ? sdOutfit() : nR();
  })).toLowerCase().slice(0, 400);
  return /halter bikini top|triangles/.test(o)
    ? "TRIANGLE_SOUPLE"
    : /full-coverage bikini top/.test(o)
      ? "MAILLOT_SOUPLE"
      : /loose(, boxy)? (cobalt-blue )?sleeveless cropped top/.test(o)
        ? "HAUT_AMPLE"
        : /fitted (cobalt-blue )?sleeveless cropped top/.test(o)
          ? "HAUT_AJUSTE"
          : /one-piece/.test(o)
            ? /unstructured front|follows the natural/.test(o) ? "UNE_PIECE_AJUSTEE" : "UNE_PIECE_GAINANTE"
            : "INCONNU";
}
function sdA3dManual(k, T) {
  return T.some(function (x) { return x[0] === e[k] && "auto" !== x[0]; });
}
function sdA3dTop() {
  return sdA3dManual("a3dTop", SD_A3D_TOPS) ? e.a3dTop : sdA3dTopAuto();
}
/* the shape the sheet says (Auto by age resolved as the prompts resolve it) */
function sdA3dShape() {
  return "auto" === e.bustShape ? sdAutoBust(e) : e;
}
/* v158 review: from what the sheet writes. "Très tombante" (the lowest point at the nipple) III; "Tombante" II from "Assez généreuse",
   I below (the text says "slightly low"); Auto by age: young AUCUNE, natural (a teardrop with a slight natural drop) I, moderate and
   marked (the drooping text of "Tombante") II; Poire PSEUDO (hollow above, full below); Fine et allongée I. A design choice, said so in
   the prompt (no default grade is sourced for a given volume) */
function sdA3dGradeAuto() {
  var s = sdA3dShape(),
    f = s.bustShape,
    tier = "auto" === e.bustShape ? s.sdAutoTier : "";
  /* v158 second review: the sheet writes a marked drop from "Généreuse" up only (below, "soft and slightly low"): II from there, I below */
  if (sdDropX()) return "III";
  if (tier) return "young" === tier ? "AUCUNE" : "natural" === tier ? "I" : e.chest >= 3 ? "II" : "I";
  return "low" === f ? (e.chest >= 3 ? "II" : "I") : "pear" === f ? "PSEUDO" : "slender" === f ? "I" : "AUCUNE";
}
function sdA3dGrade() {
  return sdA3dManual("a3dGrade", SD_A3D_GRADES) ? e.a3dGrade : sdA3dGradeAuto();
}
function sdA3dSpread() {
  var w = (sdBustSel(e).filter(function (x) { return ["wide", "close", "out", "fwd"].indexOf(x) >= 0; })[0] || "");
  return "wide" === w ? "ECARTEE" : "close" === w ? "RAPPROCHEE" : "out" === w ? "VERS_EXTERIEUR" : "fwd" === w && sdBustFwdOn() ? "VERS_AVANT" : "NORMAL";
}
function sdA3dLab(T, k) {
  return ((T || []).filter(function (x) { return String(x[0]) === String(e[k]); })[0] || [])[1] || "";
}
/* port review (Codex; AGENTS.md: every visible French string has English): the agent prompt follows the interface language. French keeps
   the owner's text as v158 wrote it; English says the same, and sdA3dEnPass then turns its codes, file and shape key names, measure
   names and decimal commas into English (applied to the English text only, so the French one is unchanged) */
var SD_A3D_EN = [
  ["TAILLE_POITRINE", "BUST_SIZE"], ["PLUS_GRANDE", "LARGER"], ["PETITE", "SMALL"], ["TYPE_DE_HAUT", "TOP_TYPE"],
  ["COQUES_EPAISSES", "THICK_CUPS"], ["COQUES_FINES", "THIN_CUPS"], ["TRIANGLE_SOUPLE", "SOFT_TRIANGLE"], ["MAILLOT_SOUPLE", "SOFT_BIKINI_TOP"],
  ["HAUT_AMPLE", "LOOSE_TOP"], ["HAUT_AJUSTE", "FITTED_TOP"], ["UNE_PIECE_AJUSTEE", "FITTED_ONE_PIECE"], ["UNE_PIECE_GAINANTE", "SHAPING_ONE_PIECE"],
  ["INCONNU", "UNKNOWN"], ["GRADE_PTOSE", "PTOSIS_GRADE"], ["AUCUNE", "NONE"], ["ECARTEMENT", "SPACING"], ["ECARTEE", "WIDE"],
  ["RAPPROCHEE", "CLOSE"], ["VERS_EXTERIEUR", "OUTWARD"], ["VERS_AVANT", "FORWARD"], ["FORME", "SHAPE"], ["EN_OBUS", "CONICAL"],
  ["HAUTE", "HIGH"], ["AUTRE", "OTHER"], ["ASYMETRIE", "ASYMMETRY"], ["OUI", "YES"], ["NON", "NO"],
  ["SILLON_SOUS_MAMMAIRE", "INFRAMAMMARY_FOLD"], ["FICHIER_SOURCE", "SOURCE_FILE"], ["nu_relache", "bare_rest"],
  ["rapport_nu", "report_bare"], ["deform_nu", "deform_bare"], ["sein_G", "breast_L"], ["sein_D", "breast_R"], ["z_bas", "z_low"],
  /* the nipple and areola choices */
  ["TAILLE_PERSONNAGE", "CHARACTER_HEIGHT"], ["MAMELON", "NIPPLE"], ["AREOLE", "AREOLA"], ["PLAT", "FLAT"], ["MOYENNE", "AVERAGE"],
  ["MOYEN", "AVERAGE"], ["SAILLANT", "PROJECTING"], ["OMBILIQUE", "UMBILICATED"], ["GRANDE", "LARGE"], ["areole_G", "areola_L"],
  ["areole_D", "areola_R"],
  ["RELIEF_AREOLE", "AREOLA_RELIEF"], ["TUBERCULES", "TUBERCLES"], ["PLATEAU", "PLATEAU"], ["PLATE", "FLUSH"], ["HERNIEE", "DOMED"],
  ["VISIBLES", "VISIBLE"],
];
function sdA3dEnPass(t) {
  if ("en" !== sdLang) return t;
  SD_A3D_EN.forEach(function (p) {
    t = t.replace(new RegExp("\\b" + p[0] + "\\b", "g"), p[1]);
  });
  return t
    .replace(/"_nu"/g, '"_bare"')
    .replace(/"mamelons"/g, '"nipples"')
    .replace(/_après\b/g, "_after")
    .replace(/_avant\b/g, "_before")
    .replace(/_cible\b/g, "_target")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/(\d) %/g, "$1%");
}
/* a label of the sheet, in the interface language */
function sdA3dLabT(T, k) {
  var v = sdA3dLab(T, k);
  return v ? sdTr(v) : v;
}
var SD_A3D_TOPTXT_EN = {
  COQUES_EPAISSES: "a bra or top with thick moulded cups",
  COQUES_FINES: "a bra or top with thin moulded cups",
  TRIANGLE_SOUPLE: "a bikini top with soft, lined triangles, no cups or underwire",
  MAILLOT_SOUPLE: "a full-coverage bikini top with soft cups, no padding or underwire",
  HAUT_AMPLE: "a loose cropped top, no cups or underwire, that does not support the bust",
  HAUT_AJUSTE: "a fitted jersey cropped top, no cups or underwire, that follows the bust without lifting or flattening it",
  UNE_PIECE_AJUSTEE: "a one-piece swimsuit with an unstructured front, that follows the bust without lifting or flattening it",
  UNE_PIECE_GAINANTE: "a competition one-piece swimsuit that compresses the bust",
  INCONNU: "a top of unknown type",
};
function sdA3dText() {
  var tr = sdT,
    age = Math.round(+e.age || 30),
    size = e.chest >= 2.5 ? "PLUS_GRANDE" : e.chest >= 2 ? "B_C" : "PETITE",
    top = sdA3dTop(),
    grade = sdA3dGrade(),
    spread = sdA3dSpread(),
    sh = sdA3dShape(),
    tier = "auto" === e.bustShape ? sh.sdAutoTier : "",
    cone = "conical" === sh.bustShape,
    high = !!sdBustPos() && /^set (?:very )?high/.test(sdBustPos()),
    pw = cone ? "" : spread === "VERS_AVANT" || high ? "0,6" : "0,5",
    coques = "COQUES_EPAISSES" === top || "COQUES_FINES" === top,
    methA = "B_C" === size && coques,
    none = "AUCUNE" === grade,
    soft = ["TRIANGLE_SOUPLE", "MAILLOT_SOUPLE", "HAUT_AMPLE"].indexOf(top) >= 0,
    onePiece = /^UNE_PIECE/.test(top),
    light = "HAUT_AJUSTE" === top || "UNE_PIECE_AJUSTEE" === top,
    asym = sdAsymOn() || "asym" === e.bustShape,
    manT = "auto" !== (e.a3dTop || "auto") && sdA3dManual("a3dTop", SD_A3D_TOPS),
    manG = "auto" !== (e.a3dGrade || "auto") && sdA3dManual("a3dGrade", SD_A3D_GRADES),
    nip = sdA3dNip(),
    are = sdA3dAre(),
    rel = sdA3dRel(),
    tub = sdA3dTub(),
    /* a geometry asked: the nipple, the relief of the areola or its tubercles, in the "mamelons" shape key */
    geo = "AUTO" !== nip || "AUTO" !== rel || "AUTO" !== tub,
    nac = "AUTO" !== nip || "AUTO" !== are || "AUTO" !== rel || "AUTO" !== tub,
    taken =
      sdT(" Noms ", " Names ") +
      [geo ? "\"mamelons\"" : "", "AUTO" !== are ? sdT("\"areole_G\" ou \"areole_D\"", "\"areole_G\" or \"areole_D\"") : ""].filter(Boolean).join(", ") +
      sdT(" déjà pris (shape key ou vertex group) : arrête-toi et demande, ne renomme rien.", " already taken (shape key or vertex group): stop and ask, rename nothing."),
    pd = "AUTO" === nip ? "" : "OMBILIQUE" === nip ? ", p" : sdT(", p et d", ", p and d"),
    hcm = Math.round(+e.height || 170),
    forms = sdBustSel(e)
      .filter(function (x) {
        return "asym" !== x;
      })
      .map(function (x) {
        return sdTr(((SD_BUST_UI.filter(function (y) { return y[0] === x; })[0] || [])[1]) || x);
      }),
    shapeTxt =
      (forms.length ? forms.join(", ") : tr("Auto (âge)", "Auto (age)")) +
      (tier
        ? tr(" (la planche écrit : ", " (the sheet says: ") +
          {
            young: sdBustSkin() ? tr("ronde", "round") : tr("ronde, ferme", "round, firm"),
            natural: tr("goutte, légère chute naturelle", "teardrop, slight natural drop"),
            moderate: e.chest >= 3 ? tr("tombante", "drooping") : tr("un peu basse", "slightly low"),
            marked: e.chest >= 3 ? tr("tombante", "drooping") : tr("un peu basse", "slightly low"),
          }[tier] +
          ")"
        : ""),
    lat = spread === "VERS_EXTERIEUR" ? tr(", et vers l'extérieur", ", and outward") : spread === "VERS_AVANT" ? tr(", au plus 15° vers l'extérieur", ", at most 15° outward") : "",
    orient = none
      ? spread === "VERS_AVANT" || spread === "VERS_EXTERIEUR"
        ? tr("mamelon orienté vers l'avant", "nipple pointing forward") + lat
        : tr("orientation de la forme de base gardée", "orientation of the base shape kept")
      : ("I" === grade ? tr("mamelon orienté vers l'avant, légèrement vers le bas", "nipple pointing forward, slightly down") : tr("mamelon orienté vers l'avant et le bas", "nipple pointing forward and down")) + lat,
    supp = methA
      ? tr(
          "Haut à coques, bonnet B à C : méthode A, ratios de Zhong et al., IJERPH 2023, 20(5):3856 (124 Chinoises de 18 à 25 ans, IMC moyen 20,3, bonnets B et C, coques de 13 et 23 mm sans armature ; hors de cette population, ratios À VALIDER",
          "A top with moulded cups, a B to C cup: method A, ratios from Zhong et al., IJERPH 2023, 20(5):3856 (124 Chinese women of 18 to 25, mean BMI 20,3, B and C cups, 13 and 23 mm moulded cups, no underwire; outside that population, ratios TO VALIDATE",
        ) +
        (age < 18 || age > 25 ? tr(" ; ce personnage a " + age + " ans, hors de la plage de l'étude : à signaler dans le rapport", "; this character is " + age + ", outside the study's range: to flag in the report") : "") +
        ")."
      : coques
        ? tr(
            "Haut à coques, mais les ratios mesurés ne valent que pour les bonnets B à C : descente et écartement jusqu'au grade et à l'écartement demandés, sans plus (aucune mesure publiée : À VALIDER).",
            "A top with moulded cups, but the measured ratios only hold for B to C cups: lowering and spreading to the requested grade and spacing, no further (no published measure: TO VALIDATE).",
          )
        : soft
          ? tr(
              "Haut presque sans soutien : le mesh est déjà presque au repos ; descente et écartement seulement s'il ne remplit pas encore le grade et l'écartement demandés, jamais au-delà (aucune mesure publiée : À VALIDER).",
              "A top with almost no support: the mesh is already close to rest; lowering and spreading only if it does not yet meet the requested grade and spacing, never further (no published measure: TO VALIDATE).",
            )
          : light
            ? tr("Maintien léger", "Light support") +
              (!manT && e.chest >= 2 ? tr(" (c'est ce que dit la planche)", " (this is what the sheet says)") : "") +
              tr(" : déformation minimale jusqu'au grade et à l'écartement demandés, jamais au-delà (aucune mesure publiée : À VALIDER).", ": a minimal deformation to the requested grade and spacing, never further (no published measure: TO VALIDATE).")
            : "UNE_PIECE_GAINANTE" === top
              ? tr(
                  "Le maillot gainait la poitrine : elle reprend sa forme au repos jusqu'au grade et à l'écartement demandés, sans plus (aucune mesure publiée : À VALIDER).",
                  "The swimsuit compressed the bust: it takes back its resting shape to the requested grade and spacing, no further (no published measure: TO VALIDATE).",
                )
              : tr("Type de haut inconnu : avant toute déformation, arrête-toi et demande le type de haut.", "Unknown type of top: before any deformation, stop and ask for the type of top."),
    gradeTxt = {
      AUCUNE: tr("AUCUNE : mamelon au-dessus du sillon sous-mammaire, aucune partie du sein sous le sillon", "AUCUNE: nipple above the inframammary fold, no part of the breast below the fold"),
      I: tr("I : mamelon au niveau du sillon", "I: nipple level with the fold"),
      II: tr("II : mamelon sous le sillon, sans être le point le plus bas du sein", "II: nipple below the fold, but not the lowest point of the breast"),
      III: tr("III : mamelon sous le sillon, au point le plus bas du sein", "III: nipple below the fold, at the lowest point of the breast"),
      PSEUDO: tr("PSEUDO : mamelon au niveau du sillon ou au-dessus, le bas du sein sous le sillon", "PSEUDO: nipple at or above the fold, the lower breast below the fold"),
    }[grade],
    spreadTxt = {
      NORMAL: tr("écartement d'au moins 0, ampleur libre mais minimale, À VALIDER", "spread of at least 0, amount free but minimal, TO VALIDATE"),
      ECARTEE: tr("écartement d'au moins 0, ampleur libre, À VALIDER", "spread of at least 0, amount free, TO VALIDATE"),
      RAPPROCHEE: tr("aucun écartement : |WBB_après - WBB_avant| ≤ tol", "no spread: |WBB_après - WBB_avant| ≤ tol"),
      VERS_EXTERIEUR: tr("écartement d'au moins 0, chaque sein orienté vers l'extérieur", "spread of at least 0, each breast pointing outward"),
      VERS_AVANT: tr(
        "aucun écartement : |WBB_après - WBB_avant| ≤ tol ; chaque sein orienté vers l'avant, au plus 15° vers l'extérieur (À VALIDER)",
        "no spread: |WBB_après - WBB_avant| ≤ tol; each breast pointing forward, at most 15° outward (TO VALIDATE)",
      ),
    }[spread],
    noSpread = "RAPPROCHEE" === spread || "VERS_AVANT" === spread,
    profTarget = cone
      ? tr("P_après ≤ P_avant + tol (forme « En obus » réglée : profil conique permis, pas de cible P/W ni A)", "P_après ≤ P_avant + tol (“Conical” shape set: a conical profile is allowed, no P/W or A target)")
      : tr("P_après / W ≤ " + pw + " ; P_après ≤ P_avant + tol ; A_après ≥ 120°", "P_après / W ≤ " + pw + "; P_après ≤ P_avant + tol; A_après ≥ 120°"),
    fiche = [
      tr("corpulence ", "build ") + (sdA3dLabT(tZ.fat, "fat") || "?"),
      tr("poitrine ", "bust ") + (sdA3dLabT(tZ.bust, "chest") || "?"),
      tr("forme : ", "shape: ") + shapeTxt,
    ]
      .concat(
        sdDropX() ? [tr("chute : très tombante", "drop: very drooping")] : [],
        asym ? [tr("asymétrique", "asymmetric")] : [],
        sdBustSkin() ? [tr("peau de la poitrine ", "bust skin ") + sdA3dLabT(tZ.bustSkin, "bustSkin").toLowerCase()] : [],
      )
      .join(tr(" ; ", "; ")),
    L = [],
    B = !methA,
    nipSet = "AUTO" !== nip,
    areSet = "AUTO" !== are,
    nipMm = SD_A3D_NIP_MM[nip],
    hAr = "AUTO" !== rel ? ", h_ar" : "",
    hand = tr("à la main", "by hand");
  /* owner: "Cannot exceed 10000 characters" (the image tool's prompt box). Only the method in use is written, the inputs without their
     lists of values, the published data as short citations next to the targets they support, in shorter wording: every instruction the
     agent executes stays. tests/smoke.py checks the length on the longest settings, in both languages. */
  L.push(tr("# Prompt agent : poitrine sans haut, personnage 3D", "# Agent prompt: bust without a top, 3D character"), "");
  L.push(tr("## CONTEXTE", "## CONTEXT"), "");
  L.push(
    tr("Personnage 3D " + ("x" === e.pres ? "adulte androgyne" : "féminin adulte") + " (" + age + " ans) pour un jeu vidéo. Il porte ", "Adult " + ("x" === e.pres ? "androgynous" : "female") + " 3D character (" + age + " years old) for a video game. It currently wears ") +
      ("en" === sdLang ? SD_A3D_TOPTXT_EN : SD_A3D_TOPTXT)[top] +
      tr(
        ". Objectif : version sans haut de la poitrine, au repos, debout, sans aucun soutien, fidèle à la forme de CE personnage, jamais ramenée à une forme moyenne.",
        ". Goal: a version of the bust without the top, at rest, standing, with no support at all, true to the shape of THIS character, never brought back to an average shape.",
      ) +
      /* owner (2026-10-28): "il ne faut pas que le prompt change le tanga il faut qu'il le garde": an image model given this text as an
         edit prompt redrew the bottom (a regular brief for a Brazilian tanga); a one-piece has no separate bottom */
      (onePiece ? "" : tr(" Seul le haut est retiré : le bas garde exactement sa coupe, sa couleur et son tissu, et tout le reste reste tel quel.", " Only the top is removed: the bottom keeps exactly its cut, color and fabric, and everything else stays as it is.")) +
      (nac
        ? tr(" Mamelons et aréoles : ", " Nipples and areolas: ") +
          [SD_A3D_LOOK.nip[nip], SD_A3D_LOOK.are[are], SD_A3D_LOOK.rel[rel], SD_A3D_LOOK.tub[tub]]
            .filter(Boolean)
            .map(function (x) {
              return tr(x[0], x[1]);
            })
            .join(tr(" ; ", "; ")) +
          "."
        : ""),
    "",
  );
  L.push(tr("Fiche du personnage : ", "Character sheet: ") + fiche + ".", "");
  L.push(
    tr("Règle centrale : volume inchangé ; le haut retiré ne change la poitrine qu'autant qu'il la soutenait. ", "Central rule: volume unchanged; removing the top changes the bust only as much as it supported it. ") +
      supp +
      "",
    "",
  );
  L.push(tr("## ENTRÉES", "## INPUTS"), "");
  L.push("- FICHIER_SOURCE =");
  L.push("- TAILLE_POITRINE = " + size + tr(" (planche : ", " (sheet: ") + (sdA3dLabT(tZ.bust, "chest") || "?") + ")");
  L.push("- TYPE_DE_HAUT = " + top + " (" + (manT ? hand : tr("lu sur la planche", "read from the sheet")) + ")");
  B && L.push("- GRADE_PTOSE = " + grade + " (" + (manG ? hand : tr("tiré de la planche", "taken from the sheet")) + ")", "- ECARTEMENT = " + spread);
  L.push("- FORME = " + (cone ? "EN_OBUS" : high ? "HAUTE" : "AUTRE"), "- ASYMETRIE = " + (asym ? "OUI" : "NON"));
  nac &&
    L.push(
      "- MAMELON = " + nip + (nipSet ? "" : tr(" (celui du mesh, inchangé)", " (the mesh's own, unchanged)")),
      "- AREOLE = " + are + (areSet ? "" : tr(" (celle du mesh, inchangée)", " (the mesh's own, unchanged)")),
      "- RELIEF_AREOLE = " + rel + ("AUTO" !== rel ? "" : tr(" (celui du mesh, inchangé)", " (the mesh's own, unchanged)")),
      "- TUBERCULES = " + tub + ("AUTO" !== tub ? "" : tr(" (ceux du mesh, inchangés)", " (the mesh's own, unchanged)")),
      "- TAILLE_PERSONNAGE = " + hcm + " cm",
    );
  B && L.push(tr("- SILLON_SOUS_MAMMAIRE = AUTO (ou son vertex group)", "- SILLON_SOUS_MAMMAIRE = AUTO (or its vertex group)"));
  L.push(
    "",
    tr("Champ requis vide : arrête-toi et demande, ne suppose rien. Méthode : ", "A required field empty: stop and ask, assume nothing. Method: ") +
      (methA ? "A" : "B") +
      ".",
    "",
  );
  L.push(tr("## CIBLES", "## TARGETS"), "");
  if (methA) {
    var thin = "COQUES_FINES" === top;
    L.push(
      tr(
        "Méthode A, par côté : HU = hauteur de BP (point saillant) au-dessus du bas du sein UBP ; WBB = écart entre les BP. HU_cible = HU_avant × (1 - r_v) ; WBB_cible = WBB_avant × (1 + r_h) ; V_cible = V_avant ; ",
        "Method A, per side: HU = height of BP (bust point) above the bottom of the breast UBP; WBB = distance between the BPs. HU_cible = HU_avant × (1 - r_v); WBB_cible = WBB_avant × (1 + r_h); V_cible = V_avant; ",
      ) +
        top +
        (thin
          ? tr(" : r_v = 0,26, r_h = 0,10 (debout : HU 5,47 cm nue, 7,42 cm en coques de 13 mm ; WBB 18,41 et 16,69 cm).", ": r_v = 0,26, r_h = 0,10 (standing: HU 5,47 cm bare, 7,42 cm in 13 mm cups; WBB 18,41 and 16,69 cm).")
          : tr(" : r_v = 0,17, r_h = 0,13 (debout : HU 5,47 cm nue, 6,59 cm en coques de 23 mm ; WBB 18,41 et 16,26 cm).", ": r_v = 0,17, r_h = 0,13 (standing: HU 5,47 cm bare, 6,59 cm in 23 mm cups; WBB 18,41 and 16,26 cm).")) +
        tr(
          " Limites : soutien-gorge, coques de maillot assimilées ; avec soutien, BP mesuré sur la coque ; moyennes de population ; UBP fixé (il descend d'environ 0,2 cm dans l'étude).",
          " Limits: a bra, swimsuit cups treated as the same; with support, BP measured on the cup; population means; UBP held fixed (it drops by about 0,2 cm in the study).",
        ),
      "",
    );
  } else {
    L.push(
      tr(
        "Méthode B, par côté : z_SMS = hauteur du sillon sous-mammaire dans le plan vertical de BP, forme de base (fixe ; AUTO : courbure concave maximale sous le sein ; ambiguë : demande le vertex group) ; z_BP = hauteur de BP (mamelon) et z_bas du point le plus bas du sein, après déformation ; WBB = écart latéral entre les BP gauche et droit ; tol = 0,003 × H (H : taille en unités de scène).",
        "Method B, per side: z_SMS = height of the inframammary fold in the vertical plane of BP, base shape (fixed; AUTO: maximum concave curvature under the breast; ambiguous: ask for the vertex group); z_BP = height of BP (nipple) and z_bas of the lowest point of the breast, after deformation; WBB = lateral distance between the left and right BP; tol = 0,003 × H (H: height in scene units).",
      ),
      "",
      tr("Grade de ptose demandé (Regnault modifié) : ", "Requested ptosis grade (modified Regnault): ") +
        gradeTxt +
        (manG ? tr(" (à la main)", " (by hand)") : tr(" (tiré de la planche : choix de conception, À VALIDER)", " (from the sheet: a design choice, TO VALIDATE)")) +
        tr(" ; condition : ", "; condition: ") +
        {
          AUCUNE: tr("z_BP > z_SMS + tol et z_bas ≥ z_SMS - tol", "z_BP > z_SMS + tol and z_bas ≥ z_SMS - tol"),
          I: tr("abs(z_BP - z_SMS) ≤ tol et z_bas < z_BP", "abs(z_BP - z_SMS) ≤ tol and z_bas < z_BP"),
          II: "z_bas + tol < z_BP < z_SMS - tol",
          III: tr("z_BP < z_SMS - tol et z_BP ≤ z_bas + tol (à valider visuellement)", "z_BP < z_SMS - tol and z_BP ≤ z_bas + tol (to validate visually)"),
          PSEUDO: tr("z_BP ≥ z_SMS - tol et z_bas < z_SMS - tol", "z_BP ≥ z_SMS - tol and z_bas < z_SMS - tol"),
        }[grade] +
        tr(". Base qui la remplit : aucune descente ; base déjà plus basse (mamelon ou bas du sein sous la cible) : ne la remonte pas, demande.", ". A base that meets it: no lowering; a base already lower (the nipple or lower breast below the target): do not lift it, ask."),
      "",
      tr("Forme : volume de chaque sein à ±2 % ; écartement ", "Shape: volume of each breast within ±2 %; spread ") +
        spread +
        tr(" : ", ": ") +
        spreadTxt +
        tr(" ; ", "; ") +
        (none
          ? tr("le haut du sein garde son plein (au-dessus de BP, recul du profil ≤ tol), rien sous le sillon", "the upper breast keeps its fullness (above BP, the profile recedes by tol at most), nothing below the fold")
          : tr("le haut du sein se vide, le bas se remplit, contact sein / thorax sous le sillon permis", "the upper breast empties, the lower breast fills, breast-to-chest contact below the fold allowed")) +
        tr(" ; ", "; ") +
        orient +
        tr(" ; interpénétration interdite.", "; no interpenetration."),
      "",
    );
  }
  L.push(
    tr(
      "Profil, par côté : plan de paroi = moindres carrés des vertices de poids 0 du bord de la zone, W = largeur médiale-latérale de ce bord à la hauteur de BP (fixes, forme de base) ; P = distance maximale du sein à ce plan ; A = angle en BP, coupe sagittale, vers les points du profil 0,15 × W plus haut et plus bas (point bas hors du sein : son point le plus bas).",
      "Profile, per side: wall plane = least squares of the weight-0 vertices on the edge of the area, W = the medial-lateral width of that edge at the height of BP (fixed, base shape); P = the maximum distance from the breast to this plane; A = the angle at BP, sagittal section, to the profile points 0,15 × W higher and lower (a lower point off the breast: its lowest point).",
    ),
    "",
    tr("Cibles de profil : ", "Profile targets: ") +
      profTarget +
      "." +
      (cone ? "" : methA ? tr(" Base en cône : demande s'il faut passer en B.", " A conical base: ask whether to switch to B.") : tr(" Base en cône : 7f corrige.", " A conical base: 7f corrects it.")) +
      tr(" Seuil P/W (Shahlini 2014)", " P/W threshold (Shahlini 2014)") +
      (cone
        ? tr(" ; la forme « En obus » réglée passe avant", "; the “Conical” shape set comes first")
        : "0,6" === pw
          ? spread === "VERS_AVANT"
            ? tr(" ; relevé à 0,6 pour « Vers l'avant », À VALIDER", "; raised to 0,6 for “Forward”, TO VALIDATE")
            : tr(" ; relevé à 0,6 pour la hauteur réglée, À VALIDER", "; raised to 0,6 for the height set, TO VALIDATE")
          : "") +
      tr(". Seuils ±0,01, ±2 %, tol", ". Thresholds ±0,01, ±2 %, tol") +
      (cone ? "" : ", " + pw + ", 120°") +
      (spread === "VERS_AVANT" && B ? ", 15°" : "") +
      tr(" : choix de conception.", ": design choices."),
    "",
  );
  if (nac) {
    var tg = [
      tr("C = sommet du mamelon du mesh (bosse locale), sinon BP", "C = the tip of the mesh's nipple (a local bump), otherwise BP"),
      areSet
        ? tr("aréole ", "areola ") +
          are +
          tr(" : D_ar = ", ": D_ar = ") +
          SD_A3D_ARE_MM[are] +
          tr(" mm (Lee et al. 2008 : 30,93 ± 10,07 mm, ", " mm (Lee et al. 2008: 30,93 ± 10,07 mm, ") +
          { PETITE: tr("moyenne moins un écart-type", "mean minus one SD"), MOYENNE: tr("moyenne", "mean"), GRANDE: tr("moyenne plus un écart-type ; Sanuki et al. 2009 : 40 mm", "mean plus one SD; Sanuki et al. 2009: 40 mm") }[are] +
          tr("), disque géodésique centré sur C, vertex groups \"areole_G\" et \"areole_D\" (poids 1 dedans, 0 dehors)", "), a geodesic disc centred on C, vertex groups \"areole_G\" and \"areole_D\" (weight 1 inside, 0 outside)")
        : tr("aréole du mesh inchangée, D_ar = son diamètre (relief ou vertex group ; illisible : demande)", "the mesh's areola unchanged, D_ar = its diameter (relief or vertex group; unreadable: ask)"),
    ];
    (nipSet || "AUTO" !== rel) && tg.push(tr("plan de l'aréole = moindres carrés des vertices entre 0,8 et 1,0 × D_ar / 2 de C", "areola plane = least squares of the vertices between 0,8 and 1,0 × D_ar / 2 from C"));
    nipSet &&
      tg.push(
        "OMBILIQUE" === nip
          ? tr(
              "mamelon OMBILIQUE : p < 0, p = distance signée du plan au fond d'un creux central ; profondeur et ouverture libres (aucune mesure publiée ; 96,23 % des mamelons rentrés, Park et al. 1999)",
              "nipple OMBILIQUE: p < 0, p = the signed distance from the plane to the bottom of a central dip; depth and opening free (no published measure; 96,23 % of inverted nipples, Park et al. 1999)",
            )
          : tr("mamelon ", "nipple ") +
            nip +
            tr(" : p = ", ": p = ") +
            nipMm +
            " mm (" +
            { PLAT: tr("Demiröz et al. 2021 : 4,0 ± 1,8 mm, moins un écart-type", "Demiröz et al. 2021: 4,0 ± 1,8 mm, minus one SD"), MOYEN: tr("entre Demiröz et al. 2021, 4,0 mm, et Lee, 6,54 mm", "between Demiröz et al. 2021, 4,0 mm, and Lee, 6,54 mm"), SAILLANT: tr("moyenne de Sanuki et al. 2009", "the mean of Sanuki et al. 2009") }[nip] +
            tr("), d = 10 mm (Lee et al. 2008 ; 13 mm chez Sanuki et al. 2009) ; p = distance signée du plan au sommet du mamelon, d = son diamètre à mi-hauteur de p", "), d = 10 mm (Lee et al. 2008; 13 mm in Sanuki et al. 2009); p = the signed distance from the plane to the tip of the nipple, d = its diameter at half of p"),
      );
    "AUTO" !== rel &&
      tg.push(
        {
          PLATE: tr("aréole PLATE : |h_ar| ≤ 0,5 mm, bord sans marche ni bourrelet", "areola PLATE: |h_ar| ≤ 0,5 mm, its edge with no step or ridge"),
          PLATEAU: tr("aréole PLATEAU : h_ar > 0, dessus à peu près plat, bord montant de la peau sans sillon (60,2 % des seins, Sanuki et al. 2009) ; h_ar libre", "areola PLATEAU: h_ar > 0, the top roughly flat, the edge rising from the skin with no groove (60,2 % of breasts, Sanuki et al. 2009); h_ar free"),
          HERNIEE: tr("aréole HERNIEE : h_ar > 0, l'aréole bombée en dôme, un sillon de resserrement à sa base (hernie aréolaire, Denoël et al. 2002), h_ar et sillon libres", "areola HERNIEE: h_ar > 0, the areola domed, a constricting groove at its base (areolar herniation, Denoël et al. 2002), h_ar and groove free"),
        }[rel] +
          tr(" ; h_ar = distance du plan de l'aréole à celui de la peau entre 1,0 et 1,3 × D_ar / 2 de C, positive vers l'avant", "; h_ar = the distance from the areola plane to that of the skin between 1,0 and 1,3 × D_ar / 2 from C, positive forward"),
      );
    "AUTO" !== tub && tg.push(tr("tubercules VISIBLES : petites bosses arrondies sur l'aréole, nombre et taille libres", "tubercles VISIBLES: small round bumps on the areola, count and size free"));
    L.push(
      tr("Mamelons et aréoles, par côté, sur \"nu_relache\" à 1,0 (choix de conception, À VALIDER) : ", "Nipples and areolas, per side, on \"nu_relache\" at 1,0 (design choices, TO VALIDATE): ") +
        tg.join(tr(" ; ", "; ")) +
        tr(". Échelle : cibles et tolérances en mm d'une personne de " + hcm + " cm ; en unités de scène, multiplie-les par H / " + hcm * 10 + ".", ". Scale: targets and tolerances in mm of a person of " + hcm + " cm; in scene units, multiply them by H / " + hcm * 10 + "."),
      "",
    );
  }
  L.push("## DEFINITION OF DONE", "");
  L.push(
    (nac
      ? geo
        ? tr("Shape keys \"nu_relache\" et \"mamelons\" sur le corps ; à 1,0, V1 à V11 OK", "Shape keys \"nu_relache\" and \"mamelons\" on the body; at 1,0, V1 to V11 OK")
        : tr("Shape key \"nu_relache\" et vertex groups des aréoles sur le corps ; à 1,0, V1 à V11 OK", "Shape key \"nu_relache\" and the areola vertex groups on the body; at 1,0, V1 to V11 OK")
      : tr("Shape key \"nu_relache\" sur le corps ; à 1,0, V1 à V10 OK", "Shape key \"nu_relache\" on the body; at 1,0, V1 to V10 OK")) +
      tr(" ; FICHIER_SOURCE intact ; rapport livré.", "; FICHIER_SOURCE untouched; report delivered."),
    "",
  );
  L.push(tr("## CONTRAINTES", "## CONSTRAINTS"), "");
  L.push(
    tr("1. Blender avec Python (bpy, bmesh, mathutils) ; absent ou import raté : arrête-toi et signale.", "1. Blender with Python (bpy, bmesh, mathutils); missing or the import failing: stop and report."),
    tr(
      "2. Ne jamais écraser FICHIER_SOURCE ; sauvegarde \"_nu\" (.blend), même dossier ; déformation dans \"nu_relache\"" + (geo ? ", mamelons et aréoles dans \"mamelons\"" : "") + " ; forme de base intacte.",
      "2. Never overwrite FICHIER_SOURCE; save as \"_nu\" (.blend), same folder; deformation in \"nu_relache\"" + (geo ? ", nipples and areolas in \"mamelons\"" : "") + "; base shape untouched.",
    ),
    tr("3. Topologie, UV, vertex groups, poids de skinning et shape keys existants inchangés.", "3. Topology, UVs, vertex groups, skinning weights and existing shape keys unchanged."),
    tr("4. Rien au-delà des cibles : ni volume, ni bonnet, ni esthétique.", "4. Nothing beyond the targets: no volume, cup or aesthetic change."),
    tr("5. Aucune hypothèse silencieuse : vérifie axes avant et vertical, unité, objet corps, côtés, sillon ; ambiguïté : demande.", "5. No silent assumption: check the forward and vertical axes, unit, body object, sides, fold; ambiguity: ask."),
    nac
      ? tr(
          "6. Hors périmètre : textures et UV (couleur et grain de l'aréole compris), jiggle, rig, autres zones ; mamelons et aréoles : seulement leurs quatre entrées. Signale les problèmes sans les corriger.",
          "6. Out of scope: textures and UVs (the areola's color and grain included), jiggle, rig, other areas; nipples and areolas: only their four inputs. Report problems without fixing them.",
        )
      : tr("6. Hors périmètre : textures et UV, aréoles et mamelons, jiggle, rig, autres zones. Signale les problèmes sans les corriger.", "6. Out of scope: textures and UVs, areolas and nipples, jiggle, rig, other areas. Report problems without fixing them."),
    tr("7. Même état de mesure avant et après (Rest Position, Subdivision et lissages coupés, shape keys à leur valeur) ; Mirror : édite la moitié réelle, mesure le mesh évalué.", "7. The same measuring state before and after (Rest Position, Subdivision and smoothing off, shape keys at their value); Mirror: edit the real half, measure the evaluated mesh."),
    tr("8. Paramètres libres (zone, décroissance, " + (B ? "écartement, " : "") + "itérations) : dans le rapport, À VALIDER.", "8. Free parameters (area, falloff, " + (B ? "spread, " : "") + "iterations): in the report, TO VALIDATE."),
    "",
  );
  L.push(tr("## ÉTAPES", "## STEPS"), "");
  L.push(
    tr("1. Inventaire : objets, corps, maillot, modificateurs, shape keys, armature ; haut masqué (hide_viewport, hide_render), pas supprimé", "1. Inventory: objects, body, swimsuit, modifiers, shape keys, armature; the top hidden (hide_viewport, hide_render), not deleted") +
      (onePiece ? "." : tr(" ; bas inchangé.", "; the bottom unchanged.")),
    tr("2. Complétude : mesh continu et fermé sous le haut ; arête moyenne de la zone ≤ 2 × celle du torse ; sinon ARRÊT, captures, aucune reconstruction.", "2. Completeness: a continuous, closed mesh under the top; mean edge length in the area ≤ 2 × the torso's; otherwise STOP, screenshots, no reconstruction."),
    tr(
      "3. Forme héritée (shape key, Shrinkwrap, modificateur qui plaque le corps sur le maillot) : signale-la, ne corrige rien ; si elle écraserait \"nu_relache\" : ARRÊT et demande. Écart corps / haut (BVHTree.find_nearest) : min, médiane, max, traversées.",
      "3. Inherited shape (a shape key, Shrinkwrap or modifier pressing the body onto the swimsuit): report it, fix nothing; if it would override \"nu_relache\": STOP and ask. Body-to-top gap (BVHTree.find_nearest): min, median, max, crossings.",
    ),
    tr("4. Repère : axes vertical, avant et latéral en rest pose (armature, sinon normale moyenne du torse) ; H ; unité.", "4. Frame: vertical, forward and lateral axes in rest pose (armature, otherwise the torso's mean normal); H; unit."),
    tr("5. Zone : groupes poitrine du rig, sinon \"sein_G\" et \"sein_D\" jusqu'au sillon, au sternum et à la ligne axillaire antérieure ; poids 1 au centre, 0 au bord, décroissance douce fixe", "5. Area: the rig's breast groups, otherwise \"sein_G\" and \"sein_D\" up to the fold, the sternum and the anterior axillary line; weight 1 at the centre, 0 at the edge, a fixed soft falloff") +
      (B ? tr(" ; peau sous le sillon à poids 0", "; the skin below the fold at weight 0") : "") +
      tr(" ; capture des poids.", "; a screenshot of the weights."),
    tr("6. Mesures AVANT, par côté : BP = vertex le plus en avant de poids > 0,5 ; ", "6. Measures BEFORE, per side: BP = the most forward vertex of weight > 0,5; ") +
      (methA ? tr("UBP = vertex le plus bas du contour inférieur, au sillon, dans le plan vertical de BP ; HU ; ", "UBP = the lowest vertex of the lower outline, at the fold, in the vertical plane of BP; HU; ") : "") +
      tr("WBB ; ", "WBB; ") +
      (B ? tr("z_SMS, z_BP et z_bas de la base ; ", "z_SMS, z_BP and z_bas of the base; ") : "") +
      tr("V = volume des faces de poids > 0 (copie bmesh, bmesh.ops.holes_fill, bm.calc_volume()) ; plan de paroi, P, W, A", "V = volume of the faces of weight > 0 (a bmesh copy, bmesh.ops.holes_fill, bm.calc_volume()); wall plane, P, W, A") +
      (nac ? tr(" ; C, D_ar", "; C, D_ar") + pd + hAr + tr(" du mesh", " of the mesh") : "") +
      ".",
    tr("7. Déformation dans \"nu_relache\"", "7. Deformation in \"nu_relache\"") + (geo ? tr(" (M : dans \"mamelons\")", " (M: in \"mamelons\")") : "") + tr(" :", ":"),
    methA
      ? tr("   - a. descente pondérée jusqu'à HU_cible (UBP au bord, la baisse porte sur BP) ; b. écartement latéral de (WBB_avant × r_h) / 2 au niveau de BP.", "   - a. a weighted lowering to HU_cible (UBP at the edge, the drop on BP); b. a lateral spread of (WBB_avant × r_h) / 2 at the level of BP.")
      : tr("   - a. descente de la masse, croissante vers le bas, jusqu'au grade ", "   - a. lowering of the mass, increasing downward, to grade ") +
          grade +
          tr(", pas au-delà", ", no further") +
          (none ? "" : tr(" ; le bas peut passer sous le sillon et toucher le thorax sans le traverser", "; the lower breast may pass below the fold and touch the chest without going through it")) +
          tr(" ; b. écartement selon ECARTEMENT ; c. ", "; b. spread as ECARTEMENT; c. ") +
          orient +
          ".",
    tr("   - d. volume à ±2 % (gonflement le long des normales) ; e. lissage dans la zone, re-mesure, itération", "   - d. volume within ±2 % (inflating along the normals); e. smoothing in the area, re-measure, iterate") +
      (cone
        ? "."
        : tr(" ; f. si P_après / W > ", "; f. if P_après / W > ") +
          pw +
          tr(" ou A_après < 120° : recule le sommet vers le plan de paroi, rends ce volume ", " or A_après < 120°: move the apex back toward the wall plane, give that volume back ") +
          (methA
            ? tr("vers le bas et l'extérieur, reprends d et e.", "downward and outward, repeat d and e.")
            : (none ? tr("vers la base sans baisser le mamelon ni vider le haut", "toward the base without lowering the nipple or emptying the upper breast") : tr("vers le bas", "downward") + (noSpread ? "" : tr(" et l'extérieur", " and outward"))) +
              tr(", reprends d et e ; le grade reste vrai.", ", repeat d and e; the grade stays true."))),
  );
  nac &&
    L.push(
      geo
        ? tr("   - M (mamelons et aréoles), en dernier, shape key \"mamelons\" à part, sur \"nu_relache\" à 1,0 : ", "   - M (nipples and areolas), last, a separate shape key \"mamelons\", on \"nu_relache\" at 1,0: ") +
            [
              "AUTO" === nip
                ? tr("le mamelon du mesh gardé : ses vertices (la bosse locale autour de C) ne bougent pas", "the mesh's nipple kept: its vertices (the local bump around C) do not move")
                : "OMBILIQUE" === nip
                  ? tr("creux central, le mamelon au fond, le bord de l'aréole inchangé", "a central dip, the nipple at its bottom, the edge of the areola unchanged")
                  : tr("mamelon remodelé autour de C à p et d visés, flancs nets, sommet arrondi", "the nipple reshaped around C to the target p and d, clean sides, a rounded tip"),
              { PLATE: tr("aréole ramenée au ras du sein", "the areola brought flush with the breast"), PLATEAU: tr("aréole surélevée en plateau, bord net sans sillon", "the areola raised as a plateau, a clean edge with no groove"), HERNIEE: tr("aréole bombée en dôme, un sillon à sa base", "the areola domed, a groove at its base") }[rel] || "",
              "AUTO" !== tub ? tr("petites bosses arrondies sur l'aréole", "small round bumps on the areola") : "",
            ]
              .filter(Boolean)
              .join(tr(" ; ", "; ")) +
            (areSet ? tr(" ; vertex groups des aréoles", "; areola vertex groups") : "") +
            tr(" ; seul le disque de l'aréole bouge. Moins de 3 anneaux d'arêtes dans d (À VALIDER) : arrête-toi et signale, ne subdivise pas.", "; only the areola disc moves. Fewer than 3 edge rings across d (TO VALIDATE): stop and report, do not subdivide.") +
            taken
        : tr("   - M (aréoles) : vertex groups des aréoles au diamètre D_ar sur \"nu_relache\" à 1,0 ; aucune déformation, pas de shape key \"mamelons\" (la taille se verra par la texture peinte plus tard, hors périmètre).", "   - M (areolas): areola vertex groups at the diameter D_ar on \"nu_relache\" at 1,0; no deformation, no \"mamelons\" shape key (the size will show through the texture painted later, out of scope).") + taken,
    );
  L.push(
    tr("8. Mesures APRÈS : celles de l'étape 6, BP", "8. Measures AFTER: those of step 6, BP") +
      (methA ? ", UBP" : "") +
      tr(" et point le plus bas re-détectés", " and the lowest point detected again") +
      (B ? tr(", z_SMS gardé", ", z_SMS kept") : "") +
      (geo ? tr(", \"mamelons\" à 1,0", ", \"mamelons\" at 1,0") : "") +
      ".",
    tr("9. Vérifications, \"nu_relache\" à 1,0 :", "9. Checks, \"nu_relache\" at 1,0:"),
    tr("   - V1 : ", "   - V1: ") +
      (methA ? tr("HU_après / HU_avant = 1 - r_v à ±0,01. V2 : WBB_après / WBB_avant = 1 + r_h à ±0,01.", "HU_après / HU_avant = 1 - r_v within ±0,01. V2: WBB_après / WBB_avant = 1 + r_h within ±0,01.") : tr("grade " + grade + " vrai par sein (z_SMS, z_BP, z_bas, tol reportés). V2 : ", "grade " + grade + " true for each breast (z_SMS, z_BP, z_bas, tol reported). V2: ") + (noSpread ? "|WBB_après - WBB_avant| ≤ tol." : "WBB_après ≥ WBB_avant.")),
    tr("   - V3 : |V_après - V_avant| / V_avant ≤ 0,02 par sein. V4 : vertices, arêtes, faces et UV en même nombre que la source. V5 : vertices de poids 0 déplacés de 1e-6 unité de scène au plus.", "   - V3: |V_après - V_avant| / V_avant ≤ 0,02 for each breast. V4: vertices, edges, faces and UVs in the same number as the source. V5: weight-0 vertices moved by 1e-6 scene unit at most."),
    tr("   - V6 : aucune auto-intersection dans la zone, sein / thorax compris (BVHTree.overlap, hors faces voisines), aucune normale inversée, aucune aire de face × 3 ou plus.", "   - V6: no self-intersection in the area, breast against chest included (BVHTree.overlap, neighbouring faces excluded), no flipped normal, no face area × 3 or more."),
    tr("   - V7 : ", "   - V7: ") +
      (methA ? tr("écart des ratios gauche / droite ≤ 0,01", "gap between the left and right ratios ≤ 0,01") : tr("même grade des deux côtés", "the same grade on both sides")) +
      (asym ? tr(" ; ASYMETRIE = OUI : asymétrie d'origine gardée, non corrigée, mesurée, signalée.", "; ASYMETRIE = OUI: original asymmetry kept, not corrected, measured, reported.") : tr(" ; asymétrie d'origine gardée, mesurée, signalée.", "; original asymmetry kept, measured, reported.")),
    tr("   - V8 : avec armature, captures en rest pose, bras levés, buste penché, sans artefact ; sinon INVÉRIFIABLE et pourquoi. V9 : rendus avant/après de face, profil, trois-quarts, même caméra et lumière ; point le plus bas et sillon lisibles de profil. V10 : cibles de profil vraies.", "   - V8: with an armature, screenshots in rest pose, arms raised, torso bent, with no artefact; otherwise UNVERIFIABLE and why. V9: before/after renders, front, profile, three-quarter, same camera and light; the lowest point and the fold readable in profile. V10: the profile targets true."),
  );
  nac &&
    L.push(
      tr("   - V11 : par côté : ", "   - V11: per side: ") +
        [
          areSet ? tr("D_ar à ± 2 mm", "D_ar within ± 2 mm") : "",
          "AUTO" === nip ? "" : "OMBILIQUE" === nip ? tr("p < 0 au centre de l'aréole", "p < 0 at the centre of the areola") : tr("p à ± 1 mm, d à ± 2 mm", "p within ± 1 mm, d within ± 2 mm"),
          {
            PLATE: tr("|h_ar| ≤ 0,5 mm ; sur 8 coupes radiales passant par C, entre 0,8 et 1,2 × D_ar / 2 de C, la surface reste à ± 0,5 mm du plan de la peau autour (ni marche ni bourrelet)", "|h_ar| ≤ 0,5 mm; on 8 radial sections through C, between 0,8 and 1,2 × D_ar / 2 from C, the surface stays within ± 0,5 mm of the plane of the skin around (no step or ridge)"),
            PLATEAU: tr("h_ar > 0, pas de sillon au bord de l'aréole", "h_ar > 0, no groove at the edge of the areola"),
            HERNIEE: tr("h_ar > 0, un sillon au bord de l'aréole", "h_ar > 0, a groove at the edge of the areola"),
          }[rel] || "",
          "AUTO" !== tub ? tr("des bosses sur l'aréole, leur nombre reporté", "bumps on the areola, their count reported") : "",
          geo && "AUTO" === nip ? tr("MAMELON = AUTO : dans \"mamelons\", vertices du mamelon déplacés de 1e-6 unité de scène au plus", "MAMELON = AUTO: in \"mamelons\", nipple vertices moved by 1e-6 scene unit at most") : "",
          geo ? tr("\"mamelons\" à 0 : V1 à V10 inchangés ; dans \"mamelons\", hors des disques des aréoles, 1e-6 unité de scène au plus", "\"mamelons\" at 0: V1 to V10 unchanged; in \"mamelons\", outside the areola discs, 1e-6 scene unit at most") : "",
        ]
          .filter(Boolean)
          .join(tr(" ; ", "; ")) +
        ".",
    );
  L.push(tr("   Échec : corrige et recommence ; 3 échecs sur un critère : arrête-toi et rapporte les valeurs.", "   Failure: fix and start again; 3 failures on one criterion: stop and report the values."), "");
  L.push(tr("## SORTIE", "## OUTPUT"), "");
  L.push(
    tr("1. Le .blend \"_nu\" et le script deform_nu.py, headless : `blender -b FICHIER_SOURCE -P deform_nu.py`", "1. The \"_nu\" .blend and the script deform_nu.py, headless: `blender -b FICHIER_SOURCE -P deform_nu.py`"),
    tr("2. rapport_nu.md : méthode ; ", "2. rapport_nu.md: method; ") +
      (B ? tr("z de la base et grade demandé ; ", "z of the base and requested grade; ") : "") +
      tr(
        "par côté, mesures avant/après, cibles, ΔV % ; paramètres libres ; V1 à " + (nac ? "V11" : "V10") + " OK ou KO avec valeurs ; anomalies relevées ; liste INVÉRIFIABLE.",
        "per side, before/after measures, targets, ΔV%; free parameters; V1 to " + (nac ? "V11" : "V10") + " OK or FAILED with values; anomalies found; UNVERIFIABLE list.",
      ),
    tr("3. Captures PNG avant/après et carte de poids.", "3. Before/after PNG screenshots and the weight map."),
    "",
  );
  return sdA3dEnPass(L.join("\n"));
}
function sdA3dCopy(ev) {
  /* v158 second review: the message in its own span (never rendered with children by React), the button label left to React (language) */
  var b = ev.currentTarget,
    ta = b.parentNode && b.parentNode.querySelector("textarea"),
    msg = b.parentNode && b.parentNode.querySelector("[data-a3d-msg]"),
    txt = ta ? ta.value : "",
    show = function (m) {
      if (!msg) return;
      msg.textContent = m;
      clearTimeout(msg._a3dT);
      msg._a3dT = setTimeout(function () {
        msg.textContent = "";
      }, 1500);
    },
    fallback = function () {
      var okc = !1;
      try {
        ta && (ta.select(), (okc = document.execCommand("copy")));
      } catch (er) {
        okc = !1;
      }
      show(okc ? sdT("Copié", "Copied") : sdT("Sélectionné : copie avec Ctrl+C", "Selected: copy with Ctrl+C"));
    };
  try {
    navigator.clipboard.writeText(txt).then(function () {
      show(sdT("Copié", "Copied"));
    }, fallback);
  } catch (er) {
    fallback();
  }
}
function sdA3dChips(t, set, k, T) {
  var v = T.some(function (x) { return x[0] === t[k]; }) ? t[k] : "auto";
  return (0, l.jsx)("div", {
    className: "mt-2 flex flex-wrap gap-1.5",
    role: "group",
    children: T.map(function (x) {
      var on = v === x[0];
      return (0, l.jsx)(
        "button",
        {
          type: "button",
          "aria-pressed": on,
          "data-a3d": k + ":" + x[0],
          className: "rounded-full border px-2.5 py-1 text-xs " + (on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-foreground/40"),
          onClick: function () {
            set(function (s) {
              var o = Object.assign({}, s);
              o[k] = x[0];
              return o;
            });
          },
          title: x[3] ? sdT(x[3], x[4]) : void 0,
          children: sdT(x[1], x[2]),
        },
        x[0],
      );
    }),
  });
}
function sdAgent3d(t, set) {
  if (!sdA3dOn(t)) return null;
  var txt = rq(t, sdA3dText);
  return (0, l.jsxs)("details", {
    className: "py-2 text-xs text-muted-foreground",
    id: "sd-a3d",
    children: [
      (0, l.jsx)("summary", { className: "cursor-pointer select-none opacity-60 hover:opacity-100", children: sdT("Agent 3D", "3D agent") }),
      (0, l.jsx)("p", {
        className: "mt-2",
        children: sdT(
          "Prompt de l'agent Blender qui retire le haut du personnage 3D, rempli depuis la planche : taille, type de haut, grade de ptose tiré de « Forme de la poitrine », écartement, profil permis. Les choix Auto suivent la planche ; pour les mamelons et les aréoles, Auto laisse ceux du maillage.",
          "Prompt for the Blender agent that removes the top of the 3D character, filled from the sheet: size, type of top, ptosis grade from “Bust shape”, spacing, allowed profile. Auto follows the sheet; for the nipples and areolas, Auto keeps the mesh's own.",
        ),
      }),
      (0, l.jsx)("p", { className: "mt-2 font-semibold", children: sdT("Type de haut", "Type of top") }),
      sdA3dChips(t, set, "a3dTop", SD_A3D_TOPS),
      (0, l.jsx)("p", { className: "mt-2 font-semibold", children: sdT("Grade de ptose (chute de la poitrine)", "Ptosis grade (how far the bust sags)") }),
      sdA3dChips(t, set, "a3dGrade", SD_A3D_GRADES),
      (0, l.jsx)("p", { className: "mt-2 font-semibold", children: sdT("Mamelons", "Nipples") }),
      sdA3dChips(t, set, "a3dNip", SD_A3D_NIPS),
      (0, l.jsx)("p", { className: "mt-2 font-semibold", children: sdT("Aréoles", "Areolas") }),
      sdA3dChips(t, set, "a3dAre", SD_A3D_AREOLAS),
      (0, l.jsx)("p", { className: "mt-2 font-semibold", children: sdT("Relief de l'aréole", "Areola relief") }),
      sdA3dChips(t, set, "a3dRel", SD_A3D_RELIEFS),
      (0, l.jsx)("p", { className: "mt-2 font-semibold", children: sdT("Tubercules de Montgomery", "Montgomery tubercles") }),
      sdA3dChips(t, set, "a3dTub", SD_A3D_TUBS),
      (0, l.jsx)("textarea", { readOnly: !0, value: txt, rows: 8, className: "mt-2 w-full rounded-md border bg-card p-2 font-mono text-xs", "aria-label": sdT("Prompt de l'agent 3D", "3D agent prompt") }),
      (0, l.jsx)("button", {
        type: "button",
        className: "mt-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:border-foreground/40",
        onClick: sdA3dCopy,
        children: sdT("Copier le prompt de l'agent", "Copy the agent prompt"),
      }),
      (0, l.jsx)("span", { className: "ml-2 font-semibold", "data-a3d-msg": "1", "aria-live": "polite" }),
    ],
  });
}
/* owner, 2026-10-28 (his Blender agent prompt "enlève le bas bleu, personnage 3D", which only erased the grooves left by the bottom's edges
   and forbade any global reshaping, then: "pour éviter que les fesses restent en l'air", "si elles doivent descendre parce qu'elles sont
   grosses elles descendent, si elles ne bougent pas parce qu'elles sont musclées elles ne bougent pas ... comme un anatomiste"): "Agent 3D :
   fesses", a closed panel at the end of "Hanches", gated as the bust's (an adult woman or androgynous person of 21 or more, never a child, a
   man or a photo kept as is). It writes his prompt filled from the character: the bottom from the body sheet's outfit, the natural ptosis
   grade of the glutes from their settings, the height. Grades: Gonzalez, "Etiology, Definition, and Classification of Gluteal Ptosis",
   Aesthetic Plastic Surgery 2006, 30(3):320-326 (five degrees; weight, age and weight loss related to their severity, from the abstract);
   the definition of each grade (lines T, through the ischial tuberosity, and M, through the middle of the thigh, seen from behind) read in
   a secondary source only (Blaya, "Classificação Ptose Glútea", 2020), so said "À VALIDER" in the prompt. No published measure of what a
   bottom changes was found: a tanga or a thong holds nothing (a mechanical deduction, his), the owner's "<0.5 cm" for a classic brief could
   not be verified and is not cited. The grade of each setting is a design choice, said so in the prompt; the glutes are only ever lowered
   to it, never lifted. */
var SD_A3G_BOTTOMS = [
  ["auto", "Auto (planche)", "Auto (sheet)", "Lu dans la tenue de la planche corps ; une tenue libre ou une planche habillée donnée en image : inconnu.", "Read from the body sheet's outfit; a free outfit or a dressed sheet given as an image: unknown."],
  ["TANGA_STRING", "Tanga ou string", "Tanga or thong", "Ne couvre ni ne porte la masse des fesses : elles sont déjà au repos.", "Neither covers nor carries the mass of the glutes: they are already at rest."],
  ["CULOTTE_CLASSIQUE", "Culotte classique", "Classic brief", "Culotte non gainante : couvre sans porter ; aucune mesure vérifiée de son effet.", "A non-shaping brief: covers without carrying; no verified measure of its effect."],
  ["SHORT_AJUSTE", "Short ajusté", "Fitted shorts", "Cycliste ou short de bain ajusté, en tissu fin, qui suit les hanches et les fesses sans les aplatir : maintien léger.", "Bike shorts or fitted swim shorts in thin fabric, that follow the hips and glutes without flattening them: light support."],
  ["SHORT_COMPRESSION", "Short de compression", "Compression shorts", "Comprime les fesses : sans lui, elles reprennent leur forme au repos, jusqu'au grade de ptose.", "Compresses the glutes: without them, they take back their resting shape, down to the ptosis grade."],
  ["CULOTTE_GAINANTE", "Culotte gainante", "Shaping brief", "Comprime et remonte les fesses : sans elle, elles reprennent leur forme au repos, jusqu'au grade de ptose.", "Compresses and lifts the glutes: without it, they take back their resting shape, down to the ptosis grade."],
  ["CULOTTE_REMBOURREE", "Culotte rembourrée", "Padded brief", "Le rembourrage est au vêtement : un corps modelé dessus arrête l'agent ; sinon, chute jusqu'au grade de ptose.", "The padding is the garment's: a body modelled on it stops the agent; otherwise, a drop to the ptosis grade."],
  ["UNE_PIECE", "Une-pièce", "One-piece", "Couvre les fesses comme une culotte : passe d'abord le prompt poitrine, puis celui-ci sur son résultat.", "Covers the glutes as a brief does: run the bust prompt first, then this one on its result."],
  ["INCONNU", "Inconnu", "Unknown", "L'agent s'arrête et demande le type de bas avant de déformer quoi que ce soit.", "The agent stops and asks for the type of bottom before it deforms anything."],
];
var SD_A3G_GRADES = [
  ["auto", "Auto (fessiers)", "Auto (glutes)", "Tiré des réglages des fessiers (volume, galbe, muscles, défauts, graisse) : un choix de conception, aucun grade n'est sourcé pour un réglage.", "Taken from the glute settings (volume, shape, muscles, flaws, fat): a design choice, no grade is sourced for a setting."],
  ["0", "0", "0", "Pas de chute : pas de pli sous la fesse, ou un pli court, en dedans de la tubérosité ischiatique.", "No sag: no crease under the glute, or a short one, inside the ischial tuberosity."],
  ["1", "1", "1", "Pré-ptose minimale : le pli dépasse la tubérosité ischiatique sans atteindre le milieu de la cuisse.", "Minimal pre-ptosis: the crease passes the ischial tuberosity without reaching the middle of the thigh."],
  ["2", "2", "2", "Pré-ptose modérée : le pli atteint le milieu de la cuisse, la fesse retombe sur lui côté intérieur.", "Moderate pre-ptosis: the crease reaches the middle of the thigh, the glute rests over it on the inner side."],
  ["3", "3", "3", "Pré-ptose limite : le pli dépasse le milieu de la cuisse, sans fesse qui retombe dessus à cet endroit.", "Borderline pre-ptosis: the crease runs past the middle of the thigh, with no glute resting over it there."],
  ["4", "4", "4", "Ptose vraie : la fesse retombe sur le pli jusqu'au milieu de la cuisse.", "True ptosis: the glute hangs over the crease out to the middle of the thigh."],
];
/* the grade of each degree in plain words, for the context line an image model reads first (the same definitions) */
var SD_A3G_LOOK = {
  0: ["à leur hauteur et dans leur forme, un pli court sous chacune, côté intérieur", "at their height and in their shape, a short crease under each, on the inner side"],
  1: ["un pli sous chaque fesse un peu plus long vers l'extérieur, sans que la fesse retombe dessus", "a crease under each glute slightly longer toward the outside, with no glute resting over it"],
  2: ["un pli sous chaque fesse jusqu'au milieu de l'arrière de la cuisse, le bas de la fesse retombant légèrement dessus côté intérieur", "a crease under each glute out to the middle of the back of the thigh, the lower glute resting slightly over it on the inner side"],
  3: ["un pli sous chaque fesse au-delà du milieu de l'arrière de la cuisse, le bas de la fesse retombant dessus côté intérieur", "a crease under each glute running past the middle of the back of the thigh, the lower glute resting over it on the inner side"],
  4: ["le bas de chaque fesse retombant sur le pli jusqu'au milieu de l'arrière de la cuisse, un léger bourrelet dessous", "the lower part of each glute hanging over the crease out to the middle of the back of the thigh, a slight roll below it"],
};
var SD_A3G_TXT = {
  TANGA_STRING: ["un bas de maillot tanga ou un string", "a tanga bikini bottom or a thong"],
  CULOTTE_CLASSIQUE: ["une culotte classique non gainante", "a classic, non-shaping brief"],
  SHORT_AJUSTE: ["un short ajusté en tissu fin (cycliste ou short de bain), qui suit les hanches et les fesses", "fitted shorts in thin fabric (bike shorts or swim shorts), that follow the hips and glutes"],
  SHORT_COMPRESSION: ["un short de compression", "compression shorts"],
  CULOTTE_GAINANTE: ["une culotte gainante", "a shaping brief"],
  CULOTTE_REMBOURREE: ["une culotte rembourrée", "a padded brief"],
  UNE_PIECE: ["un maillot une pièce", "a one-piece swimsuit"],
  INCONNU: ["un bas de type inconnu", "a bottom of unknown type"],
};
var SD_A3G_EN = {
  TANGA_STRING: "TANGA_THONG", CULOTTE_CLASSIQUE: "CLASSIC_BRIEF", SHORT_AJUSTE: "FITTED_SHORTS", SHORT_COMPRESSION: "COMPRESSION_SHORTS", CULOTTE_GAINANTE: "SHAPING_BRIEF",
  CULOTTE_REMBOURREE: "PADDED_BRIEF", UNE_PIECE: "ONE_PIECE", INCONNU: "UNKNOWN",
};
function sdA3gOn(t) {
  return "person" === t.mode && !sdChild(t) && "m" !== t.pres && !t.photo && sdRevealOk(t);
}
/* the bottom read from the outfit line the body sheet really writes, as the bust's top (sdA3dTopAuto) */
function sdA3gBottomAuto() {
  if (!nv() || (sdNat(e) && sdUseBodyImg())) return "INCONNU";
  var o = String(rq(sdG(Object.assign({}, e)), function () {
    return sdNat(e) ? sdOutfit() : nR();
  })).toLowerCase();
  /* GPT draws no tanga: its "tanga" sheet wears fitted swim shorts, its "sport" sheet compression shorts */
  return /compression shorts/.test(o)
    ? "SHORT_COMPRESSION"
    : /tanga|thong/.test(o)
      ? "TANGA_STRING"
      : /shorts/.test(o)
        ? "SHORT_AJUSTE"
        : /one-piece/.test(o)
          ? "UNE_PIECE"
          : /\bbriefs?\b/.test(o)
            ? "CULOTTE_CLASSIQUE"
            : "INCONNU";
}
function sdA3gBottom() {
  return sdA3dManual("a3gBottom", SD_A3G_BOTTOMS) ? e.a3gBottom : sdA3gBottomAuto();
}
/* the natural grade from the glute settings (design choices, the prompt says so): fat first ("Graisse : fessiers" Visible: a soft crease, 1;
   Marquée: a slight sag, 2; Très marquée: sagging over a deep crease, 4; the "Forte" build, 3), large or very large glutes without muscle
   tone 1; each step of "Fessiers : muscles" from "Toniques" up takes one step away ("si elles ne bougent pas parce qu'elles sont musclées
   elles ne bougent pas"); then what the sheet draws by hand: "Bombés" and "Très bombés" lifted, 0; "Bas" at least 2; "Tombants" 4 */
function sdA3gGradeAuto() {
  var fg = sdFatOn("fatGlutes"),
    gm = Math.max(0, Math.min(4, Math.round(+e.gluteMus || 0))),
    g = Math.max([0, 0, 1, 2, 4][fg] || 0, 4 === +e.fat ? 3 : 0, +e.glutes >= 3 && gm <= 1 ? 1 : 0);
  gm >= 2 && (g = Math.max(0, g - (gm - 1)));
  /^(high|shelf)$/.test(e.glutesShape) && (g = 0);
  "low" === e.glutesShape && (g = Math.max(g, 2));
  sdGlDefOn("sag") && (g = 4);
  return String(g);
}
function sdA3gGrade() {
  return sdA3dManual("a3gGrade", SD_A3G_GRADES) ? String(e.a3gGrade) : sdA3gGradeAuto();
}
function sdA3gText() {
  var tr = sdT,
    en = "en" === sdLang,
    age = Math.round(+e.age || 30),
    hcm = Math.round(+e.height || 170),
    bot = sdA3gBottom(),
    code = function (c) {
      return en ? SD_A3G_EN[c] || c : c;
    },
    g = sdA3gGrade(),
    gn = +g,
    manB = sdA3dManual("a3gBottom", SD_A3G_BOTTOMS),
    manG = sdA3dManual("a3gGrade", SD_A3G_GRADES),
    onePiece = "UNE_PIECE" === bot,
    gm = Math.max(0, Math.min(4, Math.round(+e.gluteMus || 0))),
    defs = (e.glutesDef || []).filter(function (k) {
      return sdGlDefOn(k);
    }),
    W = function (a, i) {
      return (a[i] || a[0])[en ? 1 : 0];
    },
    vol = W([["moyens", "average"], ["très petits", "very small"], ["petits", "small"], ["moyens", "average"], ["gros", "large"], ["très gros", "very large"]], 1 + Math.max(0, Math.min(4, Math.round(+e.glutes || 0)))),
    shp = { flat: ["plats", "flat"], round: ["ronds", "round"], high: ["bombés", "high and round"], shelf: ["très bombés", "very high and round"], low: ["bas", "low-set"] }[e.glutesShape],
    fatW = [null, ["légère", "light"], ["visible", "visible"], ["marquée", "marked"], ["très marquée", "very marked"]][sdFatOn("fatGlutes")],
    fiche = [tr("corpulence : ", "build: ") + (sdA3dLabT(tZ.fat, "fat") || "?").toLowerCase(), tr("fessiers : ", "glutes: ") + vol]
      .concat(
        shp ? [tr("galbe : ", "shape: ") + shp[en ? 1 : 0]] : [],
        gm ? [tr("muscles des fessiers : ", "glute muscles: ") + W([["doux", "soft"], ["doux", "soft"], ["toniques", "toned"], ["musclés", "muscular"], ["très musclés", "very muscular"]], gm)] : [],
        defs.length
          ? [
              tr("défauts : ", "flaws: ") +
                defs
                  .map(function (k) {
                    return ({ square: ["carrés", "square"], dips: ["creux sur les côtés", "hip dips"], sag: ["tombants", "drooping"] }[k] || [k, k])[en ? 1 : 0];
                  })
                  .join(", "),
            ]
          : [],
        fatW ? [tr("graisse des fessiers : ", "glute fat: ") + fatW[en ? 1 : 0]] : [],
      )
      .join(tr(" ; ", "; ")),
    gradeDef = {
      0: tr("0 : pas de pli, ou pli limité en dedans de T", "0: no crease, or a crease kept inside T"),
      1: tr("1 : le pli dépasse T sans atteindre M", "1: the crease passes T without reaching M"),
      2: tr("2 : le pli atteint M, tissu ptotique sur T", "2: the crease reaches M, ptotic tissue on T"),
      3: tr("3 : le pli dépasse M, pas de tissu ptotique sur M", "3: the crease runs past M, no ptotic tissue on M"),
      4: tr("4 : tissu ptotique sur M (sa hauteur h_M reportée)", "4: ptotic tissue on M (its height h_M reported)"),
    },
    supp = {
      TANGA_STRING: tr(
        "Tanga ou string : il ne couvre ni ne porte la masse des fesses (déduction mécanique, aucune mesure publiée) ; le mesh est déjà au repos : chute seulement s'il ne remplit pas encore le grade demandé, jamais au-delà.",
        "Tanga or thong: it neither covers nor carries the mass of the glutes (a mechanical deduction, no published measure); the mesh is already at rest: a drop only if it does not yet meet the requested grade, never further.",
      ),
      CULOTTE_CLASSIQUE: tr(
        "Culotte classique non gainante : elle couvre sans porter (aucune mesure vérifiée de son effet) : chute seulement si le mesh ne remplit pas encore le grade demandé, jamais au-delà.",
        "Classic, non-shaping brief: it covers without carrying (no verified measure of its effect): a drop only if the mesh does not yet meet the requested grade, never further.",
      ),
      SHORT_AJUSTE: tr(
        "Short ajusté en tissu fin : maintien léger ; déformation minimale jusqu'au grade demandé, jamais au-delà (aucune mesure publiée : À VALIDER).",
        "Fitted shorts in thin fabric: light support; a minimal deformation to the requested grade, never further (no published measure: TO VALIDATE).",
      ),
      SHORT_COMPRESSION: tr(
        "Short de compression : il comprimait les fesses : elles reprennent leur forme au repos jusqu'au grade demandé, sans plus (aucune mesure publiée : À VALIDER).",
        "Compression shorts: they compressed the glutes: they take back their resting shape down to the requested grade, no further (no published measure: TO VALIDATE).",
      ),
      CULOTTE_GAINANTE: tr(
        "Culotte gainante : elle comprimait et remontait les fesses : elles reprennent leur forme au repos jusqu'au grade demandé, sans plus (aucune mesure publiée : À VALIDER).",
        "Shaping brief: it compressed and lifted the glutes: they take back their resting shape down to the requested grade, no further (no published measure: TO VALIDATE).",
      ),
      CULOTTE_REMBOURREE: tr(
        "Culotte rembourrée : le rembourrage est au vêtement, pas au corps ; un corps modelé dessus est une forme héritée (étape 3) ; sinon, chute jusqu'au grade demandé, sans plus (aucune mesure publiée : À VALIDER).",
        "Padded brief: the padding is the garment's, not the body's; a body modelled on it is an inherited shape (step 3); otherwise, a drop to the requested grade, no further (no published measure: TO VALIDATE).",
      ),
      UNE_PIECE: tr(
        "Maillot une pièce : il couvre les fesses comme une culotte classique ; FICHIER_SOURCE est le fichier \"_nu\" du prompt poitrine, maillot déjà masqué (sinon : arrête-toi et demande) ; chute seulement si le mesh ne remplit pas encore le grade demandé, jamais au-delà.",
        "One-piece swimsuit: it covers the glutes as a classic brief does; SOURCE_FILE is the \"_bare\" file of the bust prompt, the swimsuit already hidden (otherwise: stop and ask); a drop only if the mesh does not yet meet the requested grade, never further.",
      ),
      INCONNU: tr("Type de bas inconnu : avant toute déformation, arrête-toi et demande le type de bas.", "Unknown type of bottom: before any deformation, stop and ask for the type of bottom."),
    }[bot],
    L = [];
  L.push(tr("# Prompt agent : fesses sans bas, personnage 3D", "# Agent prompt: glutes without a bottom, 3D character"), "");
  L.push(tr("## CONTEXTE", "## CONTEXT"), "");
  /* as the bust's (owner: "parle-lui comme si c'était un LLM qui construit des images"): the context line says the goal in plain words, first,
     for an image model given this text as an edit prompt */
  L.push(
    tr("Personnage 3D " + ("x" === e.pres ? "adulte androgyne" : "féminin adulte") + " (" + age + " ans) pour un jeu vidéo. Il porte ", "Adult " + ("x" === e.pres ? "androgynous" : "female") + " 3D character (" + age + " years old) for a video game. It currently wears ") +
      SD_A3G_TXT[bot][en ? 1 : 0] +
      tr(
        ". Objectif : version nue des fesses, au repos, debout, fidèle à CE personnage : volume inchangé, et la chute naturelle de son volume et de son tonus, jamais remontées.",
        ". Goal: a bare version of the glutes, at rest, standing, true to THIS character: volume unchanged, and the natural drop of its volume and muscle tone, never lifted.",
      ) +
      (onePiece
        ? tr(" Pars du résultat du prompt poitrine, maillot déjà retiré ; tout le reste reste tel quel.", " Start from the result of the bust prompt, the swimsuit already removed; everything else stays as it is.")
        : tr(" Seul le bas est retiré : le haut garde exactement sa coupe, sa couleur et son tissu, et tout le reste reste tel quel.", " Only the bottom is removed: the top keeps exactly its cut, color and fabric, and everything else stays as it is.")) +
      tr(" Fesses : ", " Glutes: ") +
      SD_A3G_LOOK[gn][en ? 1 : 0] +
      tr(" ; même taille, même peau et même grain ; les marques laissées par les bords du bas effacées.", "; the same size, the same skin and grain; the marks left by the bottom's edges erased."),
    "",
  );
  L.push(tr("Fiche du personnage : ", "Character sheet: ") + fiche + ".", "");
  L.push(
    tr("Règle centrale : volume inchangé ; le bas retiré ne change les fesses qu'autant qu'il les portait ou les comprimait, puis seule la chute naturelle du grade demandé s'applique, vers le bas seulement. ", "Central rule: volume unchanged; removing the bottom changes the glutes only as much as it carried or compressed them, then only the natural drop of the requested grade applies, downward only. ") +
      supp,
    "",
  );
  L.push(tr("## ENTRÉES", "## INPUTS"), "");
  L.push(
    en ? "- SOURCE_FILE =" : "- FICHIER_SOURCE =",
    (en ? "- BOTTOM_TYPE = " : "- TYPE_DE_BAS = ") + code(bot) + " (" + (manB ? tr("à la main", "by hand") : tr("lu sur la planche", "read from the sheet")) + ")",
    (en ? "- GLUTEAL_PTOSIS_GRADE = " : "- GRADE_PTOSE_FESSIERE = ") + g + " (" + (manG ? tr("à la main", "by hand") : tr("tiré des fessiers de la planche", "taken from the sheet's glutes")) + ")",
    (en ? "- CHARACTER_HEIGHT = " : "- TAILLE_PERSONNAGE = ") + hcm + " cm",
    "",
    tr(
      "Champ requis vide : arrête-toi et demande, ne suppose rien. FICHIER_SOURCE peut être le fichier \"_nu\" du prompt poitrine : sa shape key \"nu_relache\" reste alors strictement inchangée.",
      "A required field empty: stop and ask, assume nothing. SOURCE_FILE may be the \"_bare\" file of the bust prompt: its shape key \"bare_rest\" then stays strictly unchanged.",
    ),
    "",
  );
  L.push(tr("## CIBLES", "## TARGETS"), "");
  L.push(
    tr(
      "Repères, par côté, vu de dos, en rest pose : pli = pli sous-fessier, ligne de courbure concave maximale entre fesse et cuisse ; T = verticale de la tubérosité ischiatique (os ou repère du rig, sinon vertex groups \"ischion_G\" et \"ischion_D\" ; absents : à mi-chemin entre le pli interfessier et M, au niveau du pli, signalé, À VALIDER) ; M = verticale du milieu de la cuisse, à mi-largeur médiale-latérale au niveau du pli ; tissu ptotique sur une verticale = dans la coupe sagittale à cet endroit, la fesse descend sous le fond du pli de plus de tol ; tol = 0,003 × H (H : taille en unités de scène).",
      "Landmarks, per side, seen from behind, in rest pose: crease = the infragluteal fold, the line of maximum concave curvature between glute and thigh; T = the vertical through the ischial tuberosity (a rig bone or landmark, otherwise vertex groups \"ischium_L\" and \"ischium_R\"; missing: halfway between the intergluteal cleft and M, at the level of the crease, reported, TO VALIDATE); M = the vertical through the middle of the thigh, at half its medial-lateral width at the level of the crease; ptotic tissue on a vertical = in the sagittal section there, the glute goes down below the bottom of the crease by more than tol; tol = 0.003 × H (H: height in scene units).",
    ),
    "",
    tr("Grades de ptose fessière (Gonzalez, Aesthetic Plastic Surgery 2006, 30(3):320-326 ; définitions lues dans une source secondaire, Blaya 2020 : À VALIDER) : ", "Gluteal ptosis grades (Gonzalez, Aesthetic Plastic Surgery 2006, 30(3):320-326; definitions read in a secondary source, Blaya 2020: TO VALIDATE): ") +
      [0, 1, 2, 3, 4]
        .map(function (k) {
          return gradeDef[k];
        })
        .join(tr(" ; ", "; ")) +
      ".",
    "",
    tr("Grade demandé : ", "Requested grade: ") +
      gradeDef[gn] +
      (manG ? tr(" (à la main)", " (by hand)") : tr(" (tiré des fessiers de la planche : choix de conception, À VALIDER)", " (from the sheet's glutes: a design choice, TO VALIDATE)")) +
      tr(". Base qui le remplit : aucune chute ; base déjà à un grade plus élevé : ne la remonte pas, signale-le.", ". A base that meets it: no drop; a base already at a higher grade: do not lift it, report it."),
    "",
    tr(
      "Forme : volume de chaque fesse à ±2 % ; P = projection maximale en arrière d'un plan frontal fixe, P_après ≤ P_avant + tol ; largeur vue de dos inchangée à tol près ; le bas de la fesse peut recouvrir le pli et toucher la cuisse sans la traverser ; pli interfessier inchangé.",
      "Shape: volume of each glute within ±2%; P = the maximum backward projection from a fixed frontal plane, P_after ≤ P_before + tol; width seen from behind unchanged within tol; the lower glute may cover the crease and touch the thigh without going through it; the intergluteal cleft unchanged.",
    ),
    "",
    tr(
      "Sillons du bas : b = 0,015 × H (demi-largeur de la bande de bord : un vertex en fait partie s'il est à moins de b d'une courbe de bord projetée sur la peau) ; sillon si l'écart au profil de référence dépasse p = 0,001 × H ; écart résiduel ≤ 0,25 × p. Seuils, T faute de repère et grade tiré des réglages : choix de conception.",
      "Grooves of the bottom: b = 0.015 × H (half-width of the edge band: a vertex belongs to it if it is within b of an edge curve projected onto the skin); a groove if the gap to the reference profile exceeds p = 0.001 × H; residual gap ≤ 0.25 × p. Thresholds, T without a landmark and the grade taken from the settings: design choices.",
    ),
    "",
  );
  L.push("## DEFINITION OF DONE", "");
  L.push(
    tr(
      "Shape key \"nu_fesses\" sur le corps ; à 1,0, V1 à V8 OK ; FICHIER_SOURCE intact ; rapport livré. Aucun sillon et grade déjà rempli : aucune shape key, le rapport le démontre ; c'est un résultat valide.",
      "Shape key \"bare_glutes\" on the body; at 1.0, V1 to V8 OK; SOURCE_FILE untouched; report delivered. No groove and the grade already met: no shape key, the report shows it; this is a valid result.",
    ),
    "",
  );
  L.push(tr("## CONTRAINTES", "## CONSTRAINTS"), "");
  L.push(
    tr("1. Blender avec Python (bpy, bmesh, mathutils) ; absent ou import raté : arrête-toi et signale.", "1. Blender with Python (bpy, bmesh, mathutils); missing or the import failing: stop and report."),
    tr("2. Ne jamais écraser FICHIER_SOURCE ; sauvegarde \"_fesses\" (.blend), même dossier ; déformation dans \"nu_fesses\" ; forme de base intacte.", "2. Never overwrite SOURCE_FILE; save as \"_glutes\" (.blend), same folder; deformation in \"bare_glutes\"; base shape untouched."),
    tr("3. Topologie, UV, vertex groups, poids de skinning et shape keys existants inchangés (\"nu_relache\" compris).", "3. Topology, UVs, vertex groups, skinning weights and existing shape keys unchanged (\"bare_rest\" included)."),
    tr("4. Rien au-delà des cibles : ni volume, ni largeur, ni projection, ni esthétique ; jamais de remontée.", "4. Nothing beyond the targets: no volume, width, projection or aesthetic change; never any lift."),
    tr("5. Aucune hypothèse silencieuse : vérifie axes avant et vertical, unité, objet corps, objet du bas, côtés, plis ; ambiguïté : demande.", "5. No silent assumption: check the forward and vertical axes, unit, body object, bottom object, sides, creases; ambiguity: ask."),
    tr(
      "6. Plis anatomiques : le pli interfessier et le pli sous-fessier ne sont pas des sillons de vêtement ; un segment de bord à moins de b de l'un d'eux n'est pas corrigé, il est signalé avec capture ; doute : ne corrige pas, signale.",
      "6. Anatomical creases: the intergluteal cleft and the infragluteal fold are not garment grooves; an edge segment within b of either is not corrected, it is reported with a screenshot; in doubt: do not correct, report.",
    ),
    tr(
      "7. Hors périmètre : zone génitale (ni modélisée ni modifiée), textures et UV, jiggle, rig, poitrine, autres zones. Géométrie absente ou simplifiée sous le bas : signale sans modéliser.",
      "7. Out of scope: the genital area (neither modelled nor changed), textures and UVs, jiggle, rig, bust, other areas. Geometry missing or simplified under the bottom: report it without modelling.",
    ),
    tr("8. Même état de mesure avant et après (Rest Position, Subdivision et lissages coupés, shape keys à leur valeur) ; Mirror : édite la moitié réelle, mesure le mesh évalué.", "8. The same measuring state before and after (Rest Position, Subdivision and smoothing off, shape keys at their value); Mirror: edit the real half, measure the evaluated mesh."),
    tr("9. Paramètres libres (zone, décroissance, itérations, T faute de repère) : dans le rapport, À VALIDER.", "9. Free parameters (area, falloff, iterations, T without a landmark): in the report, TO VALIDATE."),
    "",
  );
  L.push(tr("## ÉTAPES", "## STEPS"), "");
  L.push(
    tr("1. Inventaire : objets, corps, bas, modificateurs, shape keys, armature ; bas masqué (hide_viewport, hide_render), pas supprimé", "1. Inventory: objects, body, bottom, modifiers, shape keys, armature; the bottom hidden (hide_viewport, hide_render), not deleted") +
      (onePiece ? "." : tr(" ; haut inchangé.", "; the top unchanged.")),
    tr("2. Complétude : mesh continu et fermé sous le bas ; arête moyenne de la zone ≤ 2 × celle du reste du bassin ; sinon ARRÊT, captures, aucune reconstruction.", "2. Completeness: a continuous, closed mesh under the bottom; mean edge length in the area ≤ 2 × the rest of the pelvis's; otherwise STOP, screenshots, no reconstruction."),
    tr(
      "3. Forme héritée (shape key, Shrinkwrap, modificateur qui plaque le corps sur le bas, corps modelé sur un rembourrage) : signale-la, ne corrige rien ; si elle écraserait \"nu_fesses\" : ARRÊT et demande. Écart corps / face interne du bas (BVHTree.find_nearest) : min, médiane, max, traversées.",
      "3. Inherited shape (a shape key, Shrinkwrap or modifier pressing the body onto the bottom, a body modelled on padding): report it, fix nothing; if it would override \"bare_glutes\": STOP and ask. Body-to-inner-bottom gap (BVHTree.find_nearest): min, median, max, crossings.",
    ),
    tr("4. Repère : axes vertical, avant et latéral en rest pose (armature, sinon normale moyenne du bassin) ; H, b, p, tol ; unité.", "4. Frame: vertical, forward and lateral axes in rest pose (armature, otherwise the pelvis's mean normal); H, b, p, tol; unit."),
    tr(
      "5. Bords : arêtes de bord (boucles ouvertes) du bas, taille, contours de cuisse, ficelles, projetées sur le corps (BVHTree.find_nearest) ; segments à moins de b des plis anatomiques exclus (contrainte 6) ; vertex group \"bande_bord\" : poids 1 sur les courbes retenues, décroissance douce jusqu'à 0 à la distance b.",
      "5. Edges: the bottom's boundary edges (open loops), waist, leg openings, strings, projected onto the body (BVHTree.find_nearest); segments within b of the anatomical creases excluded (constraint 6); vertex group \"edge_band\": weight 1 on the kept curves, a soft falloff to 0 at distance b.",
    ),
    tr(
      "6. Sillons : le long de chaque courbe retenue, un échantillon tous les b/2 ; profil de la surface dans le plan perpendiculaire à la courbe, polynôme de degré 3 ajusté aux points entre b et 2b de la courbe, des deux côtés ; écart signé = surface réelle moins polynôme dans la bande (négatif : creux ; positif : bourrelet) ; sillon si |écart| > p.",
      "6. Grooves: along each kept curve, a sample every b/2; the surface profile in the plane perpendicular to the curve, a degree-3 polynomial fitted to the points between b and 2b from the curve, on both sides; signed gap = real surface minus polynomial within the band (negative: a dip; positive: a bulge); a groove if |gap| > p.",
    ),
    tr(
      "7. Zone et mesures AVANT : vertex group \"region_fessiere\", des crêtes iliaques au pli sous-fessier plus 0,05 × H sur la cuisse, du sacrum à la face latérale de la hanche, des deux côtés ; poids 1 au centre, 0 au bord, sa limite à plus de b de toute courbe retenue. Par côté : V = volume des faces de poids > 0 (copie bmesh, bmesh.ops.holes_fill, bm.calc_volume()) ; P ; largeur ; pli, T, M ; grade de la base ; captures.",
      "7. Area and measures BEFORE: vertex group \"glute_region\", from the iliac crests to the infragluteal fold plus 0.05 × H on the thigh, from the sacrum to the side of the hip, both sides; weight 1 at the centre, 0 at the edge, its limit more than b from any kept curve. Per side: V = volume of the faces of weight > 0 (a bmesh copy, bmesh.ops.holes_fill, bm.calc_volume()); P; width; crease, T, M; grade of the base; screenshots.",
    ),
    tr("8. Déformation dans \"nu_fesses\" :", "8. Deformation in \"bare_glutes\":"),
    tr(
      "   - a. sillons : chaque vertex de \"bande_bord\" vers le point le plus proche du profil ajusté, le long de sa normale, pondéré par son poids ; creux et bourrelets corrigés ; lissage dans la bande seulement, re-mesure, itération.",
      "   - a. grooves: each vertex of \"edge_band\" toward the nearest point of the fitted profile, along its normal, weighted by its weight; dips and bulges corrected; smoothing within the band only, re-measure, iterate.",
    ),
    gn
      ? tr(
          "   - b. chute, seulement si la base est sous le grade " + g + " : descente de la masse, croissante vers le bas, et pli allongé vers l'extérieur jusqu'au grade, pas au-delà ; jamais de remontée ; volume à ±2 % (gonflement le long des normales) ; lissage dans la zone, re-mesure, itération.",
          "   - b. drop, only if the base is below grade " + g + ": lowering of the mass, increasing downward, and the crease lengthened outward to the grade, no further; never any lift; volume within ±2% (inflating along the normals); smoothing in the area, re-measure, iterate.",
        )
      : tr("   - b. chute : aucune (grade 0) ; hors \"bande_bord\", rien ne bouge.", "   - b. drop: none (grade 0); outside \"edge_band\", nothing moves."),
    tr("9. Mesures APRÈS : celles de l'étape 7, pli, T, M et grade re-détectés.", "9. Measures AFTER: those of step 7, the crease, T, M and the grade detected again."),
    tr("10. Vérifications, \"nu_fesses\" à 1,0 :", "10. Checks, \"bare_glutes\" at 1.0:"),
    tr("   - V1 : |écart résiduel| ≤ 0,25 × p sur tous les échantillons retenus.", "   - V1: |residual gap| ≤ 0.25 × p on every kept sample."),
    tr(
      "   - V2 : par côté, grade " + g + " vrai, ou celui de la base s'il était déjà plus élevé (signalé) ; pli, T, M, h_M et tol reportés ; base au grade ou au-delà : hors \"bande_bord\", vertices de la zone déplacés de 1e-6 unité de scène au plus.",
      "   - V2: per side, grade " + g + " true, or the base's grade if it was already higher (reported); crease, T, M, h_M and tol reported; a base at the grade or past it: outside \"edge_band\", the area's vertices moved by 1e-6 scene unit at most.",
    ),
    tr("   - V3 : |V_après - V_avant| / V_avant ≤ 0,02 par côté ; P_après ≤ P_avant + tol ; largeur à tol près.", "   - V3: |V_after - V_before| / V_before ≤ 0.02 for each side; P_after ≤ P_before + tol; width within tol."),
    tr("   - V4 : vertices, arêtes, faces et UV en même nombre que la source. V5 : vertices de poids 0 déplacés de 1e-6 unité de scène au plus.", "   - V4: vertices, edges, faces and UVs in the same number as the source. V5: weight-0 vertices moved by 1e-6 scene unit at most."),
    tr("   - V6 : aucune auto-intersection dans la zone, fesse / cuisse comprises (BVHTree.overlap, hors faces voisines), aucune normale inversée.", "   - V6: no self-intersection in the area, glute against thigh included (BVHTree.overlap, neighbouring faces excluded), no flipped normal."),
    tr("   - V7 : \"nu_relache\", s'il existe, aux coordonnées de la source ; la poitrine et tout ce qui est hors zone inchangés.", "   - V7: \"bare_rest\", if it exists, at the source's coordinates; the bust and everything outside the area unchanged."),
    tr(
      "   - V8 : rendus avant/après de dos, profil et trois-quarts arrière, même caméra et lumière ; avec armature, flexion de hanche sans artefact ; sinon INVÉRIFIABLE et pourquoi.",
      "   - V8: before/after renders from behind, in profile and three-quarter back, same camera and light; with an armature, a hip flexion with no artefact; otherwise UNVERIFIABLE and why.",
    ),
    tr("   Échec : corrige et recommence ; 3 échecs sur un critère : arrête-toi et rapporte les valeurs.", "   Failure: fix and start again; 3 failures on one criterion: stop and report the values."),
    "",
  );
  L.push(tr("## SORTIE", "## OUTPUT"), "");
  L.push(
    tr("1. Le .blend \"_fesses\" (seulement si \"nu_fesses\" a été créée) et le script deform_fesses.py, headless : `blender -b FICHIER_SOURCE -P deform_fesses.py`", "1. The \"_glutes\" .blend (only if \"bare_glutes\" was created) and the script deform_glutes.py, headless: `blender -b SOURCE_FILE -P deform_glutes.py`"),
    tr(
      "2. rapport_fesses.md : H, b, p, tol, unité ; écart corps / bas ; segments de bord retenus ou exclus avec la raison ; écart maximal avant/après par segment retenu ; grade de la base et grade demandé ; par côté, mesures avant/après, ΔV % ; paramètres libres ; V1 à V8 OK ou KO avec valeurs ; anomalies relevées ; liste INVÉRIFIABLE.",
      "2. report_glutes.md: H, b, p, tol, unit; body-to-bottom gap; edge segments kept or excluded with the reason; maximum gap before/after per kept segment; grade of the base and requested grade; per side, before/after measures, ΔV%; free parameters; V1 to V8 OK or FAILED with values; anomalies found; UNVERIFIABLE list.",
    ),
    tr("3. Captures PNG avant/après et cartes de poids de \"bande_bord\" et \"region_fessiere\".", "3. Before/after PNG screenshots and the weight maps of \"edge_band\" and \"glute_region\"."),
    "",
  );
  return L.join("\n");
}
function sdAgent3g(t, set) {
  if (!sdA3gOn(t)) return null;
  var txt = rq(t, sdA3gText);
  return (0, l.jsxs)("details", {
    className: "py-2 text-xs text-muted-foreground",
    id: "sd-a3g",
    children: [
      (0, l.jsx)("summary", { className: "cursor-pointer select-none opacity-60 hover:opacity-100", children: sdT("Agent 3D : fesses", "3D agent: glutes") }),
      (0, l.jsx)("p", {
        className: "mt-2",
        children: sdT(
          "Prompt de l'agent Blender qui retire le bas du personnage 3D, rempli depuis la planche : type de bas, grade de ptose tiré des fessiers (volume, galbe, muscles, défauts, graisse), taille. Les fesses ne descendent que jusqu'à ce grade, jamais remontées ; les marques des bords du bas sont effacées.",
          "Prompt for the Blender agent that removes the bottom of the 3D character, filled from the sheet: type of bottom, ptosis grade from the glutes (volume, shape, muscles, flaws, fat), height. The glutes only drop to that grade, never lifted; the marks of the bottom's edges are erased.",
        ),
      }),
      (0, l.jsx)("p", { className: "mt-2 font-semibold", children: sdT("Type de bas", "Type of bottom") }),
      sdA3dChips(t, set, "a3gBottom", SD_A3G_BOTTOMS),
      (0, l.jsx)("p", { className: "mt-2 font-semibold", children: sdT("Grade de ptose fessière (chute des fesses)", "Gluteal ptosis grade (how far the glutes sag)") }),
      sdA3dChips(t, set, "a3gGrade", SD_A3G_GRADES),
      (0, l.jsx)("textarea", { readOnly: !0, value: txt, rows: 8, className: "mt-2 w-full rounded-md border bg-card p-2 font-mono text-xs", "aria-label": sdT("Prompt de l'agent 3D : fesses", "3D agent prompt: glutes") }),
      (0, l.jsx)("button", {
        type: "button",
        className: "mt-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:border-foreground/40",
        onClick: sdA3dCopy,
        children: sdT("Copier le prompt de l'agent", "Copy the agent prompt"),
      }),
      (0, l.jsx)("span", { className: "ml-2 font-semibold", "data-a3d-msg": "1", "aria-live": "polite" }),
    ],
  });
}
/* the default of every slider a silhouette sets */
function sdShapeDef() {
  var o = {};
  SD_SHAPES.forEach(function (x) {
    Object.keys(x[3]).forEach(function (k) {
      o[k] = tJ[k];
    });
  });
  return o;
}
/* every slider a silhouette sets, back to its default, the last button cleared */
function sdShapeNone(s) {
  return Object.assign({}, s, sdShapeDef(), { sdShapePick: "" });
}
function sdShapeBtns(t, set) {
  if ("person" !== t.mode || sdChild(t)) return null;
  var cls = "relative inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium cursor-pointer select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ";
  var man = "m" === t.pres,
    shapes = SD_SHAPES.filter(function (x) {
      return man ? 1 !== x[4] : 2 !== x[4];
    }),
    shown = function (k) {
      return "fatBelly" === k || "fatFlanks" === k ? 4 !== +t.fat : "fatLower" === k || "saddle" === k ? "m" !== t.pres : !0;
    },
    same = function (x) {
      return Object.keys(x[3]).every(function (k) {
        return !shown(k) || String(t[k]) === String(x[3][k]);
      });
    },
    /* v157c: "Aucune" lit only when these sliders are at their defaults (read as the buttons are), never with sliders set by hand */
    atNone = same(["none", "", "", sdShapeDef()]),
    adjX = shapes.some(same) || atNone
      ? null
      : shapes.filter(function (x) {
          return x[0] === t.sdShapePick;
        })[0] || null;
  return (0, l.jsxs)("div", {
    className: "py-4 border-b last:border-0",
    id: "sd-shape",
    role: "group",
    "aria-label": sdT("Silhouette type", "Body shape"),
    children: [
      (0, l.jsx)("p", { className: "font-semibold", children: sdT("Silhouette type", "Body shape") }),
      (0, l.jsx)("p", {
        className: "mt-1 text-sm text-muted-foreground",
        /* v144: the first sentence shown, the rest behind "Plus" (SdMore, as the hints of the other controls) */
        children: (0, l.jsx)(SdMore, { text: man ? sdT(
          "Règle d'un coup Épaules, Tour de taille, Hanches, Cuisses et la graisse du ventre et des flancs. Le bouton lui-même ne part pas dans le prompt, seulement ces curseurs : ajuste-les ensuite un par un. Le dernier bouton cliqué reste marqué ; si tu changes un de ses curseurs, il indique « ajusté » et la liste de tes changements s'affiche dessous. Ne touche ni à la corpulence, ni aux pectoraux, ni aux fessiers. « Aucune » remet ces curseurs à leurs valeurs par défaut (épaules, taille, hanches et cuisses moyennes, sans graisse) et s'allume quand ils ont ces valeurs.",
          "Sets Shoulders, Waist, Hips, Thighs and the fat of the belly and the flanks at once. The button itself does not go into the prompt, only these sliders: adjust them one by one afterwards. The last button clicked stays marked; if you change one of its sliders, it shows “adjusted” and the list of your changes appears below. It changes neither the build, nor the chest, nor the glutes. “None” puts these sliders back to their defaults (medium shoulders, waist, hips and thighs, no fat) and lights up when they have these values.",
        ) : sdT(
          "Règle d'un coup Épaules, Tour de taille, Hanches, Cuisses et la graisse du ventre, des flancs, des hanches et cuisses et la culotte de cheval. Le bouton lui-même ne part pas dans le prompt, seulement ces curseurs : ajuste-les ensuite un par un. Le dernier bouton cliqué reste marqué ; si tu changes un de ses curseurs, il indique « ajusté » et la liste de tes changements s'affiche dessous. Ne touche ni à la corpulence, ni à la poitrine, ni aux fessiers. « Aucune » remet ces curseurs à leurs valeurs par défaut (épaules, taille, hanches et cuisses moyennes, sans graisse ni culotte de cheval) et s'allume quand ils ont ces valeurs.",
          "Sets Shoulders, Waist, Hips, Thighs and the fat of the belly, the flanks, the hips and thighs and the saddlebags at once. The button itself does not go into the prompt, only these sliders: adjust them one by one afterwards. The last button clicked stays marked; if you change one of its sliders, it shows “adjusted” and the list of your changes appears below. It changes neither the build, nor the bust, nor the glutes. “None” puts these sliders back to their defaults (medium shoulders, waist, hips and thighs, no fat or saddlebags) and lights up when they have these values.",
        ) }),
      }),
      (0, l.jsx)("div", {
        className: "mt-3 flex flex-wrap gap-2",
        /* v157c (user: "on peut pas mettre aucune une fois qu'on a cliqué sur une silhouette, ça bloque"): "Aucune" puts the sliders the
           buttons set back to their defaults (no button matches them) and clears the last button; lit only at these defaults */
        children: [
          (0, l.jsx)(
            "button",
            {
              type: "button",
              "aria-pressed": atNone,
              "data-shape": "none",
              className: cls + (atNone ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-foreground/40"),
              onClick: function () {
                set(sdShapeNone);
              },
              children: sdT("Aucune", "None"),
            },
            "none",
          ),
        ].concat(shapes.map(function (x) {
          var v = x[3],
            on = same(x),
            adj = !on && adjX === x;
          return (0, l.jsx)(
            "button",
            {
              type: "button",
              "aria-pressed": on || adj,
              "data-shape": x[0],
              "data-adjusted": adj ? "true" : "false",
              className: cls + (on ? "bg-primary text-primary-foreground border-primary" : adj ? "bg-card" : "bg-card hover:border-foreground/40"),
              style: adj ? { borderStyle: "dashed", borderColor: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.08)" } : void 0,
              title: adj ? sdT("Dernier bouton cliqué, curseurs ajustés ensuite. Clique pour revenir à ses valeurs.", "Last button clicked, sliders adjusted since. Click to go back to its values.") : void 0,
              onClick: function () {
                set(function (s) {
                  return Object.assign({}, s, v, { sdShapePick: x[0] });
                });
              },
              children: sdT(x[1], x[2]) + (adj ? sdT(" · ajusté", " · adjusted") : ""),
            },
            x[0],
          );
        })),
      }),
      adjX &&
        (0, l.jsx)("p", {
          className: "mt-2 text-sm text-muted-foreground",
          "data-shape-changes": adjX[0],
          children:
            sdT("Base : « " + adjX[1] + " », ajustée ensuite : ", "Base: “" + adjX[2] + "”, adjusted since: ") +
            Object.keys(adjX[3])
              .filter(function (k) {
                return shown(k) && String(t[k]) !== String(adjX[3][k]);
              })
              .map(function (k) {
                return sdShapeName(k) + " (" + sdShapeLab(k, adjX[3][k]) + " → " + sdShapeLab(k, t[k]) + ")";
              })
              .join(", ") +
            ".",
        }),
    ],
  });
}
/* v129 (user: body hair on the legs, the arms or the chest for men; more facial hair, beards from two days to three months, moustache;
   for men, a hair loss from slight to strong): adult men only (never a child, never a woman), both engines. Body hair per zone, 0 to 4,
   in the body prompts where the skin shows, in the color of the hair; "faint body hair" goes when a zone is set. Hair loss 0 to 4
   following the stages of male pattern baldness (temples first, then the crown, then a band of hair at the sides and back: Norwood,
   Southern Medical Journal, 1975), in every hair description (ne), the back view showing the crown from "Marquée" up; hidden with
   "Chauve", and "Dégarni" gives way to it. */
var SD_BODY_HAIR = [
  ["bodyHairChest", ["", "a few fine hairs on the chest", "light chest hair around the sternum", "moderate chest hair across the chest and down the middle of the abdomen to the navel", "thick chest hair across the chest and the abdomen, rising toward the collarbones"]],
  ["bodyHairArms", ["", "fine, light hair on the forearms", "visible hair on the forearms, lighter on the upper arms", "dense hair on the forearms, the upper arms and the backs of the hands", "thick, dense hair along the whole arms, on the backs of the hands and the fingers"]],
  ["bodyHairLegs", ["", "fine, light hair on the lower legs", "visible hair on the lower legs, lighter on the thighs", "dense hair on the legs, from the ankles to the thighs", "thick, dense hair over the whole legs"]],
];
function sdHairOn(k) {
  return "person" === e.mode && "m" === e.pres && !sdChild(e) ? Math.max(0, Math.min(4, Math.round(+e[k] || 0))) : 0;
}
function sdBodyHair() {
  /* v140: a woman's or an androgynous person's body hair ("Pilosité du corps") */
  var fh = "m" !== e.pres ? sdPick(SD_FHAIR, "fHair") : "",
    f = SD_BODY_HAIR.filter(function (z) {
      return sdHairOn(z[0]);
    }).map(function (z) {
      return z[1][sdHairOn(z[0])];
    }),
    /* v129 review: the color named, since a headless Seedream body sheet shows no hair to take it from; natural when the hair is bald,
       dyed (written by hand) or platinum */
    /* v156: "Couleur des poils" set by hand comes first; with "Auto (âge)" on the hair, the body hair follows the age the same way */
    c = sdBodyHairPick() || (t5(e.hairColorCustom) ? "" : "auto" === e.hairColor ? sdHairAuto() : "bald" === e.hairStyleSel || "platinum" === e.hairColor ? "" : t1("hairColor", e.hairColor));
  if (fh) return "smooth" === e.fHair ? fh : "duvet" === e.fHair ? "body hair, kept exactly in every view where the skin shows: " + (sdBodyHairPick() ? fh.replace("fine, pale peach fuzz", "fine, " + sdBodyHairPick() + " peach fuzz") : fh) : "body hair, " + (c ? c : "of a natural color") + ", kept exactly in every view where the skin shows: " + fh;
  if (f.length) return "body hair, " + (c ? c : "of a natural color") + ", kept exactly in every view where the skin shows: " + f.join("; ");
  /* v156: a color set by hand with no amount set: the faint body hair every sheet already asks for, in that color */
  return sdBodyHairPick() ? "body hair, " + c + ", kept exactly in every view where the skin shows: faint and fine" : "";
}
/* v156 (user: "la couleur des poils aussi on devrait pouvoir la choisir, ainsi que la couleur de la barbe, pour les hommes et même pour
   les femmes"): "Couleur de la barbe" and "Couleur des poils", "Comme les cheveux" by default (nothing changes then); the same colors as
   the hair, without platinum. Adults only, never with a photo for the beard (the face is the photo's). */
function sdBodyHairPick() {
  var b = e.bodyHairColor;
  /* v157 (user: "le duvet, les poils, même pour les femmes, on doit pouvoir choisir la couleur"): the peach fuzz takes the color too; only
     "Peau lisse" (no hair at all) leaves it out */
  return "person" === e.mode && !sdChild(e) && b && "auto" !== b && !("m" !== e.pres && "smooth" === e.fHair) ? t1("beardColor", b) : "";
}
function sdBodyHairColOn() {
  return "person" === e.mode && !sdChild(e) && !("m" !== e.pres && "smooth" === e.fHair);
}
function sdBeardOn() {
  return "person" === e.mode && !sdChild(e) && !e.photo && "f" !== e.pres && !!t1("facialHair", e.facialHair);
}
function sdBeardCol(x) {
  var b = e.beardColor;
  return x && sdBeardOn() && b && "auto" !== b && t1("beardColor", b) ? x + ", the facial hair " + t1("beardColor", b) : x;
}
/* v156 (user: "un bouton auto sur les cheveux qui s'adapte surtout avec l'âge, pour la couleur"): "Auto (âge)" in the hair colors, a natural
   color greying with the age. Rough steps, not data for one person: greying varies between people, it starts later on average in people
   of Asian and African origin and men grey more than women, and only 6 to 23% of people have half their hair grey at 50 (Panhard et al.,
   British Journal of Dermatology, 2012, via cosmeticsdesign-europe, 2 October 2012). A child keeps a natural color. */
function sdHairAuto() {
  var a = +e.age || 30;
  return sdChild(e) || a < 35
    ? "natural-colored"
    : a < 45
      ? "natural-colored, lightly grey-flecked"
      : a < 55
        ? "greying"
        : a < 65
          ? "salt-and-pepper"
          : a < 75
            ? "mostly grey"
            : "grey and white";
}
/* v156 (user: "il faudrait aussi pouvoir ajouter de la graisse sur le visage ; j'ai l'impression que le gras n'existe pas si on ne le force
   pas"; then "la graisse sur le visage est complètement absente"): "Graisse : visage", 0 to 4, adults only, never with a photo (the face is
   the photo's). Its own line after the face structure, both engines; the random traits that contradict it go from the "Face structure"
   and "Individual details" lines (never a trait the user set). */
function sdFaceFatLv() {
  return "person" === e.mode && !sdChild(e) && !e.photo ? Math.max(0, Math.min(4, Math.round(+e.faceFat || 0))) : 0;
}
function sdFaceFatLine() {
  var v = sdFaceFatLv();
  return v ? "Face fat, kept exactly in every panel: " + t1("faceFat", v) + "." : "";
}
var SD_FACEFAT_OFF = [
  ["lean cheeks with slight hollows", 1],
  ["lean cheeks", 1],
  ["slender cheeks", 1],
  ["slightly narrow cheeks", 1],
  ["soft cheeks of medium fullness", 2],
  /* port: this repository's plain face (sdPlainFace) turns "full, rounded cheeks" into these for a lean body, and narrows a slim body's jaw */
  ["cheeks of medium fullness", 2],
  ["soft, slightly flatter cheeks", 2],
  ["an angular jaw with visible corners", 2],
  ["a clearly defined jaw with visible corners", 2],
  ["a clearly defined, slender jaw", 2],
  ["a clearly defined jaw", 2],
  ["strong, defined jawline", 2],
  ["high, prominent cheekbones", 3],
  ["wide, prominent cheekbones", 3],
  ["high, wide-set cheekbones", 3],
  ["defined cheekbones", 3],
  ["a narrow, tapering jaw", 3],
  ["a narrow face", 3],
  ["a jaw narrower than the cheekbones", 3],
];
function sdFaceFatTrim(txt) {
  var v = sdFaceFatLv();
  if (!v || "string" != typeof txt) return txt;
  return txt.replace(/(^|\n)((?:Face structure|Individual details)[^\n]*)/g, function (m0, a, line) {
    SD_FACEFAT_OFF.forEach(function (o) {
      if (v < o[1]) return;
      line = line.split(", " + o[0] + ",").join(",").split(", " + o[0] + ".").join(".").split(": " + o[0] + ", ").join(": ");
    });
    return a + line;
  }).replace(/(^|\n)([^\n]*)/g, function (m0, a, line) {
    /* v156 review: the jaw words of the "Canon" line and of the profile, written for a lean face */
    if (/^(Face structure|Individual details)/.test(line)) return m0;
    v >= 2 && (line = line.replace(", a clearly defined jaw", "").replace("a clean, clearly defined line from the jaw to the neck", "a clean, smooth line from the jaw to the neck").replace(", a clean jaw-to-neck line.", ", a smooth jaw-to-neck line."));
    v >= 3 &&
      (line = line
        .replace(", a smooth jaw-to-neck line.", ".")
        .replace(/In the profile view, the face is as beautiful as in the front and three-quarter views: a clean, smooth line from the jaw to the neck\. ?/, "")
        .replace(", a clean, smooth line from the jaw to the neck", ""));
    return a + line;
  });
}
function sdFaceFatMap(m) {
  if (!sdFaceFatLv()) return m;
  var o = {},
    k;
  for (k in m) o[k] = /^(head|editHead)$/.test(k) ? sdFaceFatTrim(m[k]) : m[k];
  return o;
}
var SD_HAIR_LOSS = ["", "a slightly receding hairline at the temples", "a clearly receding hairline with deep recessions at the temples", "a receding hairline with deep temple recessions and thinning hair on the crown, the scalp showing through on top", "bald on top of the head, only a horseshoe band of hair left at the sides and the back"];
/* v129 review: hair loss only with the styles where a receding or bald top can show (not "Chauve", "Crête", "Undercut", "Frange" or the
   braided and locked styles) and never with a photo, whose hair is the photo's */
var SD_LOSS_OFF = ["bald", "mohawk", "undercut", "fringe", "cornrows", "boxbraids", "locs", "twists"];
function sdHairLossLv() {
  return SD_LOSS_OFF.indexOf(e.hairStyleSel) >= 0 || e.photo ? 0 : sdHairOn("hairLoss");
}
/* the random "a low forehead" never next to a hair loss */
function sdLossForehead(txt) {
  return sdHairLossLv() && "string" == typeof txt ? txt.replace(/(Face structure[^\n]*?)(, a low forehead\b|\ba low forehead, )/, "$1") : txt;
}
function sdHairLoss() {
  return SD_HAIR_LOSS[sdHairLossLv()] || "";
}
function sdSkinBody() {
  var s =
      t6(t7("skin")) +
      (nw() ? " everywhere" : " everywhere, as on the face") +
      (e.skin <= 1 && !t5(e.skinCustom) ? ", never tanned" : "") +
      ". ",
    x = ["Matte texture: fine pores", sdBodyHair() ? "" : "faint body hair"];
  e.imperf >= 1 &&
    x.push(
      !nw() && nv() ? "" : sdKneesSmooth() ? "redness on the elbows" : "redness on knees and elbows",
    );
  var q = ["", "", "slightly uneven tone", "visible marks, redness and uneven tone", "rough patches, scars and blotchy tone"][e.imperf];
  q && x.push(q);
  "none" !== e.cellulite && "m" !== e.pres && (nw() || !nv()) && x.push(nv() ? t1("cellulite", e.cellulite).replace(/,? where the skin is uncovered$/, "") : t1("cellulite", e.cellulite)); /* v150: the comma of SD_CELL_FRONT too */
  s += x.filter(Boolean).join(", ") + "." + (sdBodyHair() ? " " + t6(sdBodyHair()) + "." : "") + " Not oiled or airbrushed.";
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
      "a cobalt-blue halter bikini top: " +
      /* v130 (user, a Seedream body sheet with "Très menue": a bust drawn under "two large triangles that fully cover each breast") */
      (e.chest <= 0
        ? sdPecsF()
          ? /* v134: in positive terms only (SD_PECS_FLAT_SD) */ "two small, fully lined triangles lying flat and slightly loose on the flat, muscular chest"
          : "two small, fully lined triangles lying flat and slightly loose on the completely flat chest"
        : e.chest <= 1
          ? "two small, soft, fully lined triangles lying almost flat over the very small bust"
          : "two large, soft, fully lined triangles" +
      ("low" === e.bustShape
        ? /* v136 (self-review, the v135 lesson): no "hang" for fabric tied at the neck */ " that cover each breast down to the ribs, following its drop"
        : /* v135 (user: "même en obus, la poitrine a tendance à sortir au-delà du soutien-gorge, parfois ça marche, parfois pas"): the size of
             the triangles said against the breast they hold (not with "Tombante", whose triangles follow the drop); v136: said once with the cover */
          ", each big enough to cover the whole breast, sides and underside included, following its " + ("conical" === e.bustShape ? "long, forward-projecting" : "natural") + " shape")) +
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
        : "tanga" === c && e.chest >= 4 && "bikini" === e.tangaTop && !sdDropX()
            ? sdBigTop() + "; a cobalt-blue Brazilian-cut tanga bottom, high-cut legs, thin sides, covering about half of the glutes; barefoot"
        : "tanga" === c && (e.chest >= 4 || sdDropX())
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
  var bmi = ([17.5, 19, 23, 27, 36][e.fat] || 23) + ([0, 0, 0.5, 1.5, 3][e.muscle] || 0) + sdCurvyKg() + sdFatKg(),
    h = (e.height || 170) / 100;
  return Math.round(bmi * h * h);
}
/* the operation is explicit data: editing the text never changes it (a precision keeps the two images);
   leaving a preset is the "Retouche libre" chip; a two-image preset whose text no longer names image 2 gets a warning */
/* v130: a zone carries fat from "Visible" up (its soft folds get the hard light's shadows) */
function sdFatFolds() {
  return SD_FAT_Z.some(function (z) {
    return sdFatOn(z[0]) >= 2;
  });
}
function sdIterOpEff(t) {
  return String(t.sdIter || "").trim() ? t.sdIterOp || "" : "";
}
function sdIterMismatch(t) {
  var op = sdIterOpEff(t);
  return ("join" === op || "heads" === op) && !/image 2/i.test(String(t.sdIter || ""));
}
/* v124 (user, with two sourced notes on close-fitting clothes: a fabric close to the body keeps the convex volumes and bridges over the
   hollows; a flat, smoothed garment, or a body flattened or reshaped under it, is the error to avoid): how the clothes fit, in every
   redress of card 3 ("Habiller", "Habiller avec ma tenue", a free retouche that changes the clothes; never "Ajouter les têtes").
   Sourced: the air gap of a fitted T-shirt, about 6 to 9 mm and over 30 mm only in the hollows of the lower back (Frackiewicz-Kaczmarek,
   Psikuta and Rossi, 3D Body Scanning conference, 2010); a bra raises the fullest point of the bust by 1.2 to 2.2 cm and brings the
   breasts closer (Zhong et al., IJERPH 2023). Deduced, not measured (the notes say so): bridging over the hollows, contact kept by a
   second-skin garment, few folds at rest, elastic edges pressing in. Left out on purpose: the crotch and the pubic mound (they add
   nothing to a fitting reference and push toward a sexualized image), body hair, compression depths (simulated only), the shape of the
   bust under a compression top (unknown in the notes). */
/* accent-folded text (sdIterText), in English or French */
var SD_OUTFIT_RX = /\b(outfit|bikini|top|tanga|fabric|triangles?|swim\w*|shorts|clothing|clothes|dress\w*|t-?shirts?|shirts?|leggings?|pants|trousers|jeans|skirts?|jackets?|shoes|sneakers|boots|wear\w*|socks?|tenues?|maillots?|tissus?|vetements?|habill\w*|robes?|chemises?|pantalons?|jupes?|vestes?|chaussures?|baskets?|bottes?|chaussettes?|brassieres?)\b/;
function sdFitText() {
  var m = "m" === e.pres;
  return (
    /* the garment classes of the notes, by their ease (smaller than the body, or about its size), never "second skin": the dress
       retouche must keep the garments as described (lessons, v91) */
    "Fit of every close-fitting garment, each one as described above (stretch garments smaller than the body, such as leggings, tights or a bodysuit; fitted garments about the body's size, such as a fitted T-shirt, a tank top or a close dress): " +
    "the fabric follows every rounded volume underneath without smoothing or flattening it, so the shoulders, shoulder blades, " +
    (m ? "chest" : "bust") +
    ", belly, hips, glutes, thighs, knees, calves and arms keep their exact shape and size; over the hollows it bridges instead of sinking in (" +
    (m ? "" : "between and under the breasts, ") +
    "the navel, the spine groove, the small of the back, the groin folds, the cleft between the glutes, the backs of the knees), so it reads as fabric, never as painted-on skin. " +
    "A stretch garment is pulled taut and touches the body everywhere else; a fitted one touches the high points and stands slightly off the body between them, a gap of under a centimetre that opens wider only over the small of the back. " +
    "Few folds at rest: small tension folds only at bent joints, a little bunching where the fabric is longer than the limb (ankles, wrists); elastic edges such as a waistband, a bra band or cuffs press in only slightly." +
    (m ? "" : " With no bra in the outfit, the bust keeps its own shape and hang under the fabric; a bra with cups lifts it slightly, its fullest point about 1 to 2 cm higher, and brings the breasts a little closer together.")
  );
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
      [SD_OUTFIT_RX, "the outfit"],
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
    (keep = ["the four views, the framing and scale", "the muscles", "the skin", "the light", "the backdrop"].concat(
      nw() ? [] : [sdPos() + " face and hair" + (rq(Object.assign({}, e, { bodyRef: !1 }), sdFreeMk) ? " (only the makeup this outfit names is added)" : "")],
    ));
  return (
    "Edit image 1, the approved body reference sheet of this " +
    w +
    ".\nPurpose: a neutral anatomy and costume-fitting reference for a film's VFX team.\nChange only this: " +
    c +
    "." +
    /* v124: a redress gets the fit of close-fitting clothes */
    ("heads" !== e.sdIterOp && SD_OUTFIT_RX.test(lc) ? "\n" + sdFitText() : "") +
    "\nKeep everything this change does not touch exactly as in image 1" +
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
  /* v129: the same with a hair loss */
  return ("receding" === e.hairStyleSel || sdHairLossLv()) && "a high forehead" !== x ? 0 : a.push(x);
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
  /* v116: also with a photo and "Garder le corps tel quel" (user: the headless sheet was out of reach there) */
  return "person" === t.mode && !t.child && !!t.headless;
}
function sdOpOk(t, op) {
  return "join" === op || "dress" === op || "heads" === op ? sdHlRaw(t) : !0;
}
function sdIterNorm(t) {
  var op = t.sdIterOp;
  if (!op || "free" === op) return t;
  /* v155 (user: "le truc de finition a disparu … c'est pas clair tout ça"): "Finition photo" left card 3 for its own step 4; a "finish"
     saved by v154 leaves card 3 on its default retouche, or, with a text typed under it, that text as a free retouche */
  if ("finish" === op) return Object.assign({}, t, { sdIterOp: String(t.sdIter || "").trim() ? "free" : "" });
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
  /* v153 (user: "la section Habiller, c'est quoi le deal ?"): named for what it is for, apart from "Habiller avec ma tenue" */
  ["dress", "Habiller pour l'assemblage", "Habiller"],
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
  /* v155 (user: "le truc de finition a disparu … c'est pas clair tout ça", then "étape 4 à part"): step 4, "Finition photo", under card 3,
     always shown where card 3 is */
  return [B("iter", "3", sdIterTitle(t), sdIterOff(t), "Choisis ou écris une retouche ci-dessous."), sdFinOn(t) ? B("fin", "4", "Finition photo", !1) : null];
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
  return [["head", "Tête", !1], ["body", "Corps", !1]].concat(sdGrowOn(t) ? [["grow", "Agrandir", !1]] : [], sdGrowUpOn(t) ? [["growUp", "Haut du corps", !1]] : [], sdGrowBustOn(t) ? [["growBust", "Poitrine", !1]] : [], sdHlRaw(t) || !sdIterOff(t) ? [it] : [], sdFinOn(t) && t.sdFinTg ? [["fin", "Finition", !1]] : []);
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
  if ("fin-pre" === k) return sdFinPre(t, g);
  if ("body-pre" === k)
    return nv() && !nw()
      ? (0, l.jsxs)("div", {
          className: "mt-3",
          children: [
            (0, l.jsx)("p", { className: "mb-2 text-sm font-semibold", children: "Le corps vient de" }),
            /* v153: short options, the retouche named below (the long option ran past its card at every width, and past a phone's screen) */
            (0, l.jsx)(ab, {
              label: "Source du corps",
              value: useImg ? "img" : "text",
              onChange: (v) => g("sdBodyImg", "img" === v),
              wrap: !0,
              options: [
                ["img", "Ma planche habillée"],
                ["text", "Mes réglages"],
              ],
            }),
            (0, l.jsx)("p", {
              className: "mt-2 text-sm text-muted-foreground",
              children: sdT(
                "Ma planche habillée : ta planche corps sans tête habillée par la retouche « Habiller pour l'assemblage » (carte 3), jointe en image 2.",
                "My dressed sheet: your headless body sheet dressed by the “Dress for assembly” retouch (card 3), added as image 2.",
              ),
            }),
          ],
        })
      : null;
  /* v122: card 2b says how to run it, in view (user: "explain how to do it") */
  if ("grow-pre" === k)
    return (0, l.jsxs)("div", {
      className: "mt-3 text-sm",
      children: [
        (0, l.jsx)("p", { className: "text-muted-foreground", children: sdHourglass() ? "Seedream dessine mal une taille fine entre des hanches larges à partir d'une description, mais les retouche tout de suite sur sa propre planche." : "Seedream dessine mal des hanches et des fessiers extrêmes à partir d'une description, mais les agrandit tout de suite en retouche." }),
        (0, l.jsx)("ol", {
          className: "mt-2",
          /* the compiled CSS has no list classes: inline style */
          style: { listStyle: "decimal", paddingLeft: "1.25rem", margin: 0 },
          children: [
            "Génère la planche corps (carte 2).",
            "Dans Seedream, ajoute-la en image 1, colle ce prompt et génère.",
            "Pas assez ? Recommence sur la nouvelle image avec le même prompt. Trop, ou caricatural ? Garde l'image d'avant.",
            nw() ? "Garde la planche agrandie comme planche corps validée, pour la carte 3." : "Garde la planche agrandie comme planche corps validée.",
          ].map(function (x, i) {
            return (0, l.jsx)("li", { children: x }, i);
          }),
        }),
      ],
    });
  /* v132: the upper body retouch, the same way */
  if ("growUp-pre" === k)
    return (0, l.jsxs)("div", {
      className: "mt-3 text-sm",
      children: [
        (0, l.jsx)("p", {
          className: "text-muted-foreground",
          children:
            "Décrits en texte, des épaules très larges, des deltoïdes ou des dorsaux très développés et une poitrine plate sont ramenés vers la moyenne. Pour les hanches et les fessiers, Seedream suit bien mieux une retouche de la planche qu'il a générée : cette carte applique la même méthode au haut du corps (pas encore vérifiée sur des rendus).",
        }),
        (0, l.jsx)("ol", {
          className: "mt-2",
          style: { listStyle: "decimal", paddingLeft: "1.25rem", margin: 0 },
          children: [
            sdGrowOn(t) ? "Génère la planche corps (carte 2), puis la retouche 2b si tu t'en sers." : "Génère la planche corps (carte 2).",
            "Dans Seedream, ajoute-la en image 1, colle ce prompt et génère.",
            "Pas assez ? Recommence sur la nouvelle image avec le même prompt. Trop, ou caricatural ? Garde l'image d'avant.",
            nw() ? "Garde la planche retouchée comme planche corps validée, pour la carte 3." : "Garde la planche retouchée comme planche corps validée.",
          ].map(function (x, i) {
            return (0, l.jsx)("li", { children: x }, i);
          }),
        }),
      ],
    });
  /* v147: the bust retouch, its small effect said as measured */
  if ("growBust-pre" === k)
    return (0, l.jsxs)("div", {
      className: "mt-3 text-sm",
      children: [
        (0, l.jsx)("p", {
          className: "text-muted-foreground",
          children:
            "De profil, Seedream dessine une très grosse poitrine pleine et bombée en haut, quel que soit le texte. Cette retouche la rapproche du buste en gardant son point le plus bas. Effet faible : sur les rendus mesurés, environ 10 % d'avancée en moins et un haut moins bombé, un rendu sur deux.",
        }),
        (0, l.jsx)("ol", {
          className: "mt-2",
          style: { listStyle: "decimal", paddingLeft: "1.25rem", margin: 0 },
          /* v147 review: the order with 2b and with the upper body retouch (whose keep list leaves the bust out), each its own step */
          children: [
            "Génère la planche corps (carte 2) deux ou trois fois et garde le profil le moins bombé.",
            sdGrowOn(t) ? "La retouche 2b peut venir avant ou après celle-ci." : "",
            sdGrowUpOn(t) ? "Fais la retouche du haut du corps avant celle-ci : elle peut défaire la poitrine." : "",
            "Dans Seedream, ajoute ta planche en image 1, colle ce prompt et génère deux fois.",
            "Garde la meilleure des deux. Si aucune ne va mieux, garde l'image d'avant. Ne la relance pas sur une image qu'elle a déjà retouchée : la poitrine y perd du volume.",
            nw() ? "Garde la planche retouchée comme planche corps validée, pour la carte 3." : "Garde la planche retouchée comme planche corps validée.",
          ].filter(Boolean).map(function (x, i) {
            return (0, l.jsx)("li", { children: x }, i);
          }),
        }),
      ],
    });
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
  /* v126: "Assembler" and "Ajouter les têtes" start from image 1 extended by 25% upward, prepared here */
  if ("iter-pre" === k) {
    var op0 = sdOp(t);
    return "join" === op0 || "heads" === op0 ? (0, l.jsx)(SdPrep, { heads: "heads" === op0, t: t, g: g }) : null;
  }
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
                         (a headless body's default "join" builds its prompt from the preset while the text is empty).
                         v153: "Habiller" says what it puts on and what it is for (the onglet Tenue is not read); "Habiller avec ma tenue" says
                         which outfit of the Tenue tab it uses, read as its prompt reads it (the reference outfit off) */
                      [
                        "dress" === op
                          ? "m" === t.pres
                            ? sdT(
                                "Même corps, avec un haut de sport sans manches et un collant de course bleu cobalt, pour assembler ensuite la tête et le corps. L'onglet Tenue n'est pas utilisé.",
                                "Same body, in a cobalt-blue sleeveless training top and running tights, to combine the head and the body next. The Outfit tab is not used.",
                              )
                            : sdT(
                                "Même corps, avec un haut court ajusté sans manches et un legging bleu cobalt, pour assembler ensuite la tête et le corps. L'onglet Tenue n'est pas utilisé.",
                                "Same body, in a fitted cobalt-blue sleeveless cropped top and leggings, to combine the head and the body next. The Outfit tab is not used.",
                              )
                          : "dressMine" === op && String(tn.sdIter || "").trim()
                            ? /* a text typed below replaces the outfit of the Tenue tab in the prompt (sdIterText), sent as written */
                              sdT("Tenue utilisée : ton texte ci-dessous (l'onglet Tenue n'est plus lu).", "Outfit used: your text below (the Outfit tab is no longer read).") +
                              sdT(" Joins ta planche corps validée, sans tête ou déjà assemblée avec la tête.", " Add your approved body sheet, headless or already combined with the head.")
                            : "dressMine" === op
                              ? (t.bodyRef
                                  ? sdT("Même corps, habillé avec ta tenue de l'onglet Tenue.", "Same body, dressed in your outfit from the Outfit tab.")
                                  : sdT("Pour changer la tenue d'un corps déjà validé : change l'onglet Tenue.", "To change the outfit of a body you already approved: change the Outfit tab.")) +
                                /* the outfit of the prompt: the Tenue tab read on sdG(t) with the reference off */
                                sdT(" Tenue utilisée : ", " Outfit used: ") + sdWearWord(Object.assign({}, sdG(t), { bodyRef: !1 }), 1) + "." +
                                sdT(" Joins ta planche corps validée, sans tête ou déjà assemblée avec la tête. Le texte suit l'onglet Tenue : tu le vois dans « Détails et prompt ».", " Add your approved body sheet, headless or already combined with the head. The text follows the Outfit tab: you can see it in “Details and prompt”.") +
                                (nw() ? sdT(" Tant que « Planche corps sans tête » est coché, les accessoires de tête (chapeau, lunettes) ne sont pas ajoutés.", " While “Headless body sheet” is ticked, head accessories (hat, glasses) are not added.") : "")
                              : "heads" === op
                                ? "Prépare d'abord l'image 1 ci-dessus, en trois étapes."
                                : "join" === op
                                  ? sdT(
                                      "Le corps est gardé, la tête est ajoutée. Changer de modèle (Seedream, Nano Banana ou GPT Image) remet le texte de ce modèle.",
                                      "The body is kept and the head is added. Switching the model (Seedream, Nano Banana or GPT Image) puts that model's text back.",
                                    )
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
  /* v127: card 3 "Assembler" written for Nano Banana */
  var nb = "iter" === e && sdNanoJoin();
  nb && (D = "Nano Banana");
  "iter" === e && sdGptJoin() && (D = "GPT Image 2.5");
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
            (0, l.jsx)("p", { className: "text-sm text-muted-foreground", children: nb ? "À joindre dans Nano Banana" : "iter" === e && sdGptJoin() ? "À joindre dans ChatGPT, dans le même message" : "À joindre dans Seedream" }),
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
          /* v155: step 4's prompt box only once "Détails et prompt" is open (sdFinOn's note) */
          ("fin" !== e || d) &&
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
      "Hair exactly as in image 1: " + sdCurls(ne()) + ("loose" === (e.hairStyleSel || "loose") && "shaved" !== e.hairLen ? ", worn down, never tied up" : "") + ", the same in every panel.\n";
  var sf = [],
    hd = [];
  "m" !== e.pres && e.chest >= 3 && "low" === e.bustShape && sf.push("bust");
  ["low", "flat"].indexOf(e.glutesShape) >= 0 && sf.push("glutes");
  (rM() || rj()) && sf.push("hips", "thighs");
  [["defArms", "arms"], ["defShoulders", "shoulders"], ["defBack", "back"]].forEach(function (z) {
    var v = rP(z[0]);
    /* v130 (user: the fat did not show; the lead said "sharply defined arms" next to soft upper arms) */
    ("clear" === v || "strong" === v) && !("arms" === z[1] && sdArmFat() >= 2) && !("back" === z[1] && sdFatOn("fatBack") >= 2) && hd.push(z[1]);
  });
  sdFatOn("fatBelly") >= 2 && sf.push("belly");
  sdArmFat() >= 2 && sf.push("upper arms");
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
      ? (sdHourglass()
          ? " A real woman's body with a marked hourglass shape (a " + (0 === +e.waist ? "very narrow" : "narrow") + " waist between " + (5 === sdCi(e.chest) ? "a very large bust" : "a large bust") + " and " + (4 === +e.hips ? "extremely wide hips" : "wide hips") + "), the most striking feature of her silhouette"
          : e.fat <= 1 && sdCurvyMax()
          ? e.hips >= 3
            ? " A real woman's body with a dramatic pear shape: " + (sdFatWaist() || sdMusBig() ? "narrower" : "slim") + " above the hips, with " + (4 === e.hips ? "extremely wide hips" : "wide hips") + (e.glutes >= 3 ? " and " + (4 === e.glutes ? "extremely large glutes" : "large glutes") : "") + ", the most striking feature of her silhouette"
            : " A real woman's body, " + (sdFatWaist() || sdMusBig() ? "narrower" : "slim") + " above the hips, with extremely large glutes, the most striking feature of her silhouette"
          : e.fat <= 1 && sdCurvy()
            ? " A real woman's body, " + (sdFatWaist() || sdMusBig() ? "narrower" : "slim") + " above the hips, with full " + sdCurvyWhat()
            : " A real, " + (e.fat <= 1 ? "slim " : e.muscle >= 3 ? "strong " : "ordinary ") + ("m" === e.pres ? "man's" : "woman's") + " body") +
        ", deliberately imperfect" +
        (e.muscle <= 2 ? ", not a fitness model" : "") +
        (sf.length && hd.length
          ? ": soft, heavy " + sdList(sf) + ", with " + (1 === hd.length && "back" === hd[0] ? "a " : "") + "sharply defined " + sdList(hd) + "."
          : ", not a 3D character.")
      : "";
  s += "\n" + t6(rS()) + ", " + e.height + " cm, about " + sdKg() + " kg" + rb() + sdLegLead() + "." + ni + " " + sdLegs(hl) + "\n\u0001";
  var sil = [
    sdShoulders(),
    "m" === e.pres
      ? rx()
      : sdHourglass()
        ? 0 === +e.waist
          ? "a very narrow waist (much narrower than the bust and the hips)"
          : "a narrow waist (clearly narrower than the bust and the hips)"
        : ["a very narrow waist", "a narrow waist", "a natural, average waist", "a wide waist, little waistline", "a very wide waist, no waistline"][e.waist] || rx(),
    rk(),
    e.shoulders < e.hips
      ? "the hips clearly wider than the shoulders"
      : e.shoulders > e.hips
        ? sdShoulderRatio()
          ? "the shoulders about " + sdShoulderRatio() + " times the hip width across the deltoids"
          : "the shoulders wider than the hips"
        : "shoulders and hips about the same width",
  ];
  "m" !== e.pres &&
    2 === e.shoulders &&
    2 === e.waist &&
    2 === e.hips &&
    /* v131: not when the deltoids or the lats are said */
    sdShoulders() === t1("shoulders", e.shoulders) &&
    (sil = ["average shoulders, waist and hips, the shoulders as wide as the hips"]);
  "m" === e.pres && sil.push("male bone structure and fat distribution, with no feminine curves");
  var gl =
      sdGlVol(t1("glutes", e.glutes)) +
      /* v122: a drooping glute is never high */
      sdGlShape((!hl
        ? { flat: ", flat in profile", round: ", round in profile", high: ", high and round", shelf: ", very high and round", low: ", low and soft, never round or lifted" }
        : {
        flat: ", flat in profile",
        round: ", round in profile",
        high: ", high and round in profile",
        /* v135 (user: "Très bombés" with "Moyen" came out only rounded, 4.9% of the body height behind the lower back; "Gros", 5.8%, about
           a hand's width on a 177 cm woman, was the shape wanted): the projection said as a length (calibration on the user's renders) */
        shelf: ", very high and very round, projecting strongly in profile: the lower back curves in deeply above them and they stand " + (2 === +e.glutes ? "out about a hand's width behind it" : +e.glutes <= 1 ? "out behind it" : "far out behind it"),
        low: ", low, saggy, heavy and deliberately unflattering: in profile the upper half is flat and slopes down from the lower back, most volume in the lower third, fullest just above the crease, never halfway; from behind they look long, wider at the bottom, the soft lower part folding in a heavy roll over a long, deep crease across the whole back of each thigh; never round, lifted, high or bubble-shaped",
      })[e.glutesShape] || ""),
    lo = [sdGlNat(gl), sdGlDef(), sdThighs(), sdLegShape()];
  rj() && lo.push(t1("fatLower", e.fatLower));
  rM() &&
    /* v120: at the top of the hip scale the light fullness is already the curve of the hips (the line below), said once */
    !(4 === e.hips && sdCurvy() && "light" === e.saddle) &&
    lo.push(
      {
        light: "a slight fullness on the outer upper thighs",
        visible: "visible saddlebags: a soft bulge on each outer upper thigh, a hand's width below the hip bone, with a slight dip above it",
        marked: "marked saddlebags: a soft bulge on each outer upper thigh, a hand's width below the hip bone, as wide as the hips, with a dip above it",
      }[e.saddle] || "",
    );
  /* v120: at the top of the hip scale the upper outer thighs carry the curve of the hips (a pear shape), whatever the thigh slider says below */
  4 === e.hips && sdCurvy()
    ? sdThighCurve() || sdGlDefOn("square") || sdGlDefOn("dips") || lo.push("the upper outer thighs continue the curve of the hips, tapering to the knees")
    : e.thighs <= 2 &&
      !rj() &&
      (e.hips >= 3 || e.glutes >= 3 || "high" === e.glutesShape || "shelf" === e.glutesShape || rM()) &&
      /* v136 (self-review): "a slight fullness on the outer upper thighs; the extra width stays in the outer upper thighs": said once */
      lo.push("outer upper thighs" === sdExtraWho() && ["light", "visible", "marked"].indexOf(e.saddle) >= 0 ? "the thighs taper to the knees" : "the extra width stays in the " + sdExtraWho() + ", the thighs taper to the knees");
  var bd = n_();
  /* v157 (his render): a light musculature with muscular legs or glutes set: the light tone is the upper body's */
  sdLegLead() && e.muscle <= 1 && (bd = bd.replace(/^(.*?) and lightly toned$/i, "$1, with a lightly toned upper body"));
  ni && (bd = bd.replace(/, fit and athletic build/, " build, moderately toned").replace(/athletic/g, "toned"));
  e.fat <= 1 && (bd = bd.replace(/like a swimmer or a dancer/, "like a dancer"));
  s +=
    t6(bd) +
    ": " +
    /* v131: with the deltoids or the lats said, the items read apart */
    sil.join(sdShoulders() !== t1("shoulders", e.shoulders) ? "; " : ", ") +
    ". " +
    (e.fat <= 1 ? ("m" !== e.pres && e.chest >= 2 ? "Apart from the bust, a " + (sdMusBig() ? "lean " : "slim ") : sdMusBig() ? "A lean " : "A slim ") + (sdCurvy() ? (sdFatWaist() ? "upper body" : "upper body and waist") : "frame") + ": " + (function (a, l) {
      return a && l ? "slender arms and legs, " : a ? "slender arms, " : l ? "slender legs, " : "";
    })(
      ["big", "huge"].indexOf(e.biceps) < 0 && ("auto" !== e.biceps || e.muscle <= 2) && sdArmFat() < 2,
      /* v139 review: never "slender legs" next to fat on the front of the thighs from "Visible" up */
      !sdCurvy() && e.thighs <= 2 && e.fatLower <= 1 && ("none" === e.saddle || "light" === e.saddle) && e.muscle <= 2 && sdFatOn("fatThighs") < 2 && sdFatOn("fatKnees") < 2 &&
        /* v157 review: never "slender legs" next to sprinter's legs, muscular front thighs or muscular calves */
        "sprinter" !== e.legShape && !(+e.thighFront >= 3) && !(+e.calves >= 3),
    ) + sdClavSlim(!sdCurvy() && !sdFatOn("fatFlanks") && !sdFatOn("fatBelly") && (nw() || !nv())) + (0 === e.fat ? sdRibs() : "") + (!sdCurvy() && !sdFatZones().length && e.fatLower <= 1 && ("none" === e.saddle || "light" === e.saddle) && !/(?<!not )\bhigh and round|very round, projecting/.test(gl) && !sdClavFlesh() ? ", no extra padding" : "") + (sdCurvy() && !sdCurvyMax() ? "; the " + sdCurvyWhat() + " carry real volume" : "") + ". " : 2 === e.fat && e.muscle <= 2 ? "A normal, healthy layer of soft body fat: no visible ribs or hip bones" + (sdFatOn("fatFlanks") || sdArmFat() ? ". " : sdFlanksLow() ? ", a slight softness at the top of the hips and on the upper arms. " : ", a slight softness at the sides of the waist and on the upper arms. ") : 4 === e.fat ? sdForteFat() + ". " : "") +
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
          : (sdUseBodyImg() ? function (x) { return x; } : function (x) { return sdPecsBust(x, 1); })(["a flat chest", "a small bust", "a medium bust", "a fairly full bust", "a large bust", "a very large bust, out of proportion with her frame"][sdCi(e.chest)] || "a medium bust") +
            ("low" === e.bustShape && e.chest >= 2
              ? ", heavy and low under the thin shirt: the fabric falls straight from " + (sdPecsF() ? "the muscular upper chest" : "a flat upper chest") + " and rests on the bust, its lowest point at the lower ribs; never lifted, round or high"
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
  /* v130 (user: the fat did not show): the fat line before the muscle line */
  sdFatText() && (s += sdFatText() + "\n");
  s += sdMus() + "\n";
  var dt = sdDetails();
  /* v136 (self-review, word budget): a drawn detail the build line already says is not said twice: the collarbones of a slim frame, the
     curve of the lower back above "Très bombés" */
  dt && s.indexOf("visible collarbones") >= 0 && (dt = dt.replace("clearly visible collarbones, ", ""));
  /* v144: "Clavicules" set to "Douces" or "Couvertes", said by the slim-frame sentence: not again in the details */
  dt && sdPick(SD_CLAV, "clav") && s.indexOf(sdPick(SD_CLAV, "clav")) >= 0 && (dt = dt.replace(sdPick(SD_CLAV, "clav") + ", ", ""));
  dt && s.indexOf("the lower back curves in deeply above them") >= 0 && (dt = dt.replace(", a marked curve in the lower back", ""));
  /* v140: "Cambrure" on "Dos droit" with "Très bombés": the lower back is not curved by the glute text */
  sdPick(SD_LORD, "lordosis") && "straight" === e.lordosis && (s = s.replace(/the lower back curves in deeply above them and they stand (.*?) behind it/, "they stand $1 behind the lower back"));
  /* v136: the drawn mark that is one of the marks written by the user (the "Distinctive marks" line below) is said there only */
  var mk0 = rg(!1).split(/[;,]/).map(function (x) {
    return x.trim().replace(/\.$/, "").toLowerCase();
  });
  dt && (dt = dt.replace(/, ([^,]+)\.$/, function (m, x) {
    return SD_DRAWN_MARKS.indexOf(x) >= 0 && mk0.indexOf(x.toLowerCase()) >= 0 ? "." : m;
  }));
  dt && (s += dt + "\n");
  s += "\n" + sdSkinBody() + "\n";
  var mk = rg(!1);
  mk && (s += "Distinctive marks, each on the stated side, only where the skin is uncovered: " + mk + ".\n");
  rl() && (s += "Current state, on the stated side, in every view where it faces the camera: " + rl() + ".\n");
  s += "\n" + sdOutfit() + "\n\n";
  /* v145 (user, after the test of this pose on his sheet: "on devrait toujours mettre les bras écartés dorénavant, comme pour les personnages
     de jeu vidéo, pour se rendre compte de tous les endroits du corps"): the arms out, a gap of backdrop between them and the body, so the
     waist, hips and thighs show in the front and back views (arms against the body hid the widest point of the hips). The text tested on
     his sheet: "about 20 degrees" was drawn at about 12 degrees, the front and back panels widened by Seedream to fit; a video game
     A-pose (45 degrees) does not fit four views in 16:9 at this scale */
  s +=
    "Neutral standing pose, feet hip-width apart" +
    ("low" === e.glutesShape ? ", pelvis slightly tucked, lower back flat" : "") +
    ", " + SD_ARMS_OUT +
    ("m" !== e.pres && "conical" === e.bustShape && e.chest >= 2 ? "; in the side views the arms hang straight down behind the bust, fully separate from it" : "") +
    /* v145 review: "neutral expression" its own sentence, no longer hanging on the gap of the arms */
    (hl ? "." : ". Neutral expression.") +
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
          ? "crisp shadows that bring out the veins" + (sdFatFolds() ? " and the soft folds of fat" : "") + "; the muscles stay smooth"
          : "crisp shadows on the muscles" + (["visible", "strong"].indexOf(rD()) >= 0 ? " and veins" : "") +
            /* v130: the soft folds of a zone carrying fat get their shadows too */
            (sdFatFolds() ? " and on the soft folds of fat" : ""))
      : d || nv()
        ? "Soft key light from slightly above and in front, gentle fill: " +
          /* v121: with no muscle detail asked, the top of the hip and glute scale is lit for its curves, not for muscles */
          (sdCurvyMax() && !d ? "soft shadows that model her curves" : "soft shadows on the muscles")
        : "Soft, even studio light") +
    ". Long lens at hip height. Natural colors, fine film grain, not a 3D render. Five fingers per hand. " + sdFreeNoText(sdLetters() ? SD_LETTERS : "No text or watermark.");
  var kp = [
    t1("shoulders", e.shoulders),
    "m" === e.pres ? "" : ["a very narrow waist", "a narrow waist", "an average waist", "a wide waist", "a very wide waist"][e.waist] || "",
    /* v120: the top of the hip scale is a long text in the body; a summary line names it in three words, as the glutes below */
    "m" === e.pres ? "" : 4 === e.hips ? "extremely wide hips" : 4 === e.fat ? t1("hips", e.hips).replace(/, (clearly|much) wider than the waist/, "") : t1("hips", e.hips),
    "m" === e.pres ? "" : ["a flat chest", "a small bust", "a medium bust", "a fairly full bust", "a large bust", "a very large bust out of proportion with her frame"][sdCi(e.chest)] || "",
    sdGlVol(["very small glutes", "small glutes", "average-sized glutes", "very large, round glutes, much bigger than average", "extremely large glutes, out of proportion with " + (sdFatWaist() ? "the waist" : "a slim waist")][e.glutes] || ""),
    sdThighCurve() ? "full upper thighs" : ["very slim thighs", "slim thighs", "average thighs", "full thighs", "very thick thighs"][e.thighs] || "",
  ].filter(Boolean),
    ks = "Key proportions: " + kp.join(", ") + ".\n";
  /* v136 review: counted on the text as sent (sdWrap adds the adult words and the "Très tombante" landmarks after this) */
  /* v157: counted after the final replacements too (sdPoseTxt: the marked arms, the stance, the leg texts) */
  s = s.replace("\u0001", sdWords(sdPoseTxt(sdDropFix(sdAdult(s)))) + sdWords(ks) <= 600 ? ks : "");
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
  return !!sdPlaceCat(e.objCat);
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
    /* v115: an interior's views as camera positions and directions; "Garder le lieu de la photo tel quel" names the windows, as its
       layout did (or the main light source if the photos show none, sdPlaceOne) */
    pt = "interior" === c || "exterior" === c ? (e.photo && e.photoOnly ? rq(Object.assign({}, e, { objLightSel: ["windows"], objLight: "" }), sdPlaceViewTxt) : sdPlaceViewTxt()) : [];
  return "house" === c
    ? [
        ["facade", ["Vue 1 : façade", "View 1: front"], "the front view", "front view of the house, straight on"],
        ["34", ["Vue 2 : trois-quarts", "View 2: three-quarter"], "", "three-quarter view from the front left"],
        ["arriere", ["Vue 3 : arrière (facultatif)", "View 3: rear (optional)"], "", "rear view"],
      ]
    : "interior" === c
      ? [
          ["entree", ["Vue 1 : depuis l'entrée", "View 1: from the entrance"], "the view from the entrance doorway", pt[0]],
          ["contrechamp", ["Vue 2 : contrechamp", "View 2: reverse angle"], "", pt[1]],
          ["lumiere", ["Vue 3 : vers la lumière (facultatif)", "View 3: toward the light (optional)"], "", pt[2]],
        ]
      : /* v137: an outdoor location, in the order of the house: the main view, a diagonal, the reverse */
        "exterior" === c
      ? [
          ["plan-large", ["Vue 1 : plan large", "View 1: wide view"], "the wide main view", pt[0]],
          ["diagonale", ["Vue 2 : diagonale", "View 2: diagonal"], "", pt[1]],
          ["contrechamp", ["Vue 3 : contrechamp (facultatif)", "View 3: reverse (optional)"], "", pt[2]],
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
      : s.replace(/\nSOURCE:\n/, "\nSOURCE:\n" + same.replace(/\n/g, " "));
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
      / to be used as a location reference for AI video: a six-view reference sheet of the (house|interior|outdoor location) in the attached photo\(s\), in one image\./,
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
      /* v137: an outdoor location has its own lens and heights (the generated prompt otherwise carries the room's) */
      if (sdExt())
        return !night && /aerial/.test(v[3])
          ? "Aerial view from high enough to show the whole location and its surroundings. Vertical lines kept straight."
          : "Eye-level view from about 1.6 m high with a 24mm lens, from far enough to show the whole location. Vertical lines kept straight.";
      if (!night && /aerial/.test(v[3])) return "Aerial view from about 15 m high, showing the whole house and roof. Vertical lines kept straight.";
      if (!night && /high-angle/.test(v[3])) return "High-angle view from a top corner of the room, with a 24mm lens, vertical lines kept straight, the whole room readable.";
      return camera;
    })
    .replace("; the aerial view from about 15 m high", "")
    .replace("; the high-angle view from a top corner of the room", "")
    .replace("No captions, labels, panel numbers or watermarks", "No captions, labels, numbers or watermarks")
    /* v156: the production design of one view; a later view keeps view 1's, as the same-place sentence says */
    .replace(" The same dressing in every panel.\n\n", "\n\n")
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
  return sdPlaceCat(t.objCat)
    ? sdT("Garder le lieu de la photo tel quel", "Keep the place in the photo as is")
    : sdT("Garder l'objet de la photo tel quel", "Keep the object in the photo as is");
}
function sdOnlyHelp(t) {
  return [
    (0, l.jsx)("b", { children: sdOnlyLabel(t) + "." }, "b"),
    " " +
      (sdPlaceCat(t.objCat)
        ? "exterior" === t.objCat
          ? sdT(
              "Les prompts reprennent le lieu de ta photo sans rien y changer (architecture, agencement, végétation, matières, couleurs, usure, lumière et moment de la journée) ; seul le point de vue change. Les autres réglages sont ignorés tant que cette option est cochée ; seuls le type de lieu et les vues choisies restent au choix.",
              "The prompts take the place in your photo and change nothing in it (architecture, layout, vegetation, materials, colors, wear, light and time of day); only the viewpoint changes. Other settings are ignored while this option is on; only the type of place and the selected views can still be chosen.",
            )
          : sdT(
              "Les prompts reprennent le lieu de ta photo sans rien y changer (architecture, agencement, mobilier, matières, couleurs, usure, lumière et moment de la journée) ; seul le point de vue change. Les autres réglages sont ignorés tant que cette option est cochée ; seuls le type de lieu et les vues choisies restent au choix.",
              "The prompts take the place in your photo and change nothing in it (architecture, layout, furniture, materials, colors, wear, light and time of day); only the viewpoint changes. Other settings are ignored while this option is on; only the type of place and the selected views can still be chosen.",
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
/* v129 (user, a "Canon" + "Méchant" sheet of a woman far from canon beauty: its random traits were "a softly square face, a broad face,
   close-set eyes, medium-sized eyes, wide cheekbones with full cheeks, lean cheeks with slight hollows, a fuller upper lip"): "Canon" for a
   woman or an androgynous person moves some traits drawn at random (features left on Auto, never the ones the user set) toward the
   features measured as attractive in female faces: larger eyes, eyes no closer than average, prominent cheekbones, narrow cheeks, eyebrows
   set high (Cunningham, Journal of Personality and Social Psychology, 1986); a thinner jaw and a less square face (feminized shapes,
   Perrett et al., Nature, 1998); no upper lip larger than the lower one (Atiyeh et al., Plastic and Reconstructive Surgery Global Open,
   2025); no hanging upper lid, frown line or forehead crease, read as fatigue (Sundelin et al., SLEEP, 2013). v129 review: the slimming
   moves (face width, cheeks) only for a slim or average build from 23 (the age line gives younger faces soft full cheeks), with the face
   shape, the finesse and the angularity left as set by default and no round face chosen; the feminizing moves (face shape, jaw, brows)
   for a woman only, the jaw left as drawn with a square face chosen; several traits keep their variety (soft cheeks, rounded
   cheekbones, round, long or downturned eyes), so the Canon faces do not all look alike. Only the "Face structure" and "Individual
   details" lines. [from, to, scope]: a all, s slimming, f feminine. */
var SD_CANON_F = [
  ["a softly square face", "an oval face", "f"],
  ["a broad face", "a face of medium width", "s"],
  ["close-set eyes", "eyes set at an average distance", "a"],
  ["softly hooded eyes", "almond-shaped eyes", "a"],
  ["medium-sized eyes", "large eyes", "a"],
  ["low, heavy eyebrows close to the eyes", "eyebrows set high above the eyes", "f"],
  ["wide cheekbones with full cheeks", "high, prominent cheekbones", "s"],
  ["full, rounded cheeks", "slender cheeks", "s"],
  ["lean cheeks with slight hollows", "slender cheeks", "a"],
  ["a fuller upper lip", "a slightly fuller lower lip", "a"],
  ["a wide jaw", "a narrow, tapering jaw", "j"],
  ["an angular jaw with visible corners", "a clearly defined, slender jaw", "j"],
  ["a faint vertical line between the eyebrows", "a small dimple at the left corner of the mouth", "a"],
  ["a faint crease across the forehead", "a small mole on the left cheekbone", "a"],
];
/* a slim or average build, an adult face past the soft full cheeks of the age line, and no full or coarse face set by the user */
function sdCanonSlim() {
  return e.fat <= 2 && (+e.age || 30) >= 23 && 0 !== +e.featFine && !(+e.faceAngle <= 1) && "round" !== e.face && !sdFaceFatLv();
}
/* v130 (user, a Seedream head sheet of a 37-year-old man, "Ordinaire" + "Angélique": he looks like a kid; GPT renders the same prompt
   as an adult): the traits drawn at random came from sex-neutral pools (heart-shaped face, fine light eyebrows, full round cheeks, very
   full lips, a soft round jaw, a small round chin), and large, round eyes, high eyebrows and a small chin are what make a face read as a
   babyface (Berry and McArthur, Journal of Personality and Social Psychology, 1985). For a man in Seedream, from "Beau" down ("Canon"
   has its own moves, SD_CANON_M), those traits move to an adult man's; the eyes keep their size and shape (the character may set them). */
var SD_MAN_ADULT = [
  ["a heart-shaped face", "an oval face"],
  ["full, rounded cheeks", "soft cheeks of medium fullness"],
  ["very full lips", "full lips"],
  ["a small, rounded chin", "a rounded chin of medium size"],
  ["a soft, rounded jaw", "a softly defined jaw"],
  ["fine, light eyebrows", "eyebrows of medium thickness"],
  ["thin, high-arched eyebrows", "softly arched eyebrows of medium thickness"],
  ["a softly scooped nose bridge", "a straight nose bridge"],
  ["a low, softly scooped nose bridge", "a straight nose bridge"],
  /* v130 review: the cheekbones said "full cheeks" next to cheeks now of medium fullness; a receding chin and a tapering jaw are a
     babyface's too */
  ["wide cheekbones with full cheeks", "wide, prominent cheekbones"],
  ["a slightly receding chin", "a chin of medium projection"],
  ["a narrow, tapering jaw", "a jaw of medium width"],
];
/* with "Angélique" or "Gentil", whose swaps give large or round eyes: an adult man's eyes (the gentleness is in the gaze) */
var SD_MAN_ADULT_EYES = [
  ["round eyes", "almond-shaped eyes"],
  ["large eyes", "medium-sized eyes"],
];
function sdManAdult(txt, t) {
  if (!(t.looks >= 1) || "m" !== t.pres || "person" !== t.mode || t.photo || "string" != typeof txt) return txt;
  var L = "ange" === sdCharOn() || "gentil" === sdCharOn() ? SD_MAN_ADULT.concat(SD_MAN_ADULT_EYES) : SD_MAN_ADULT;
  return txt.replace(/(^|\n)(Face structure[^\n]*)/, function (m0, a, line) {
    L.forEach(function (p) {
      line = line.split(p[0]).join("\u0000" + p[1] + "\u0000");
    });
    line = line.replace(/\u0000/g, "");
    L.forEach(function (p) {
      var i = line.indexOf(p[1]), j = line.lastIndexOf(", " + p[1]);
      i >= 0 && j > i && (line = line.slice(0, j) + line.slice(j + 2 + p[1].length));
    });
    return a + line;
  });
}
function sdCanonFace(txt, t) {
  if (0 === t.looks && "m" !== t.pres && "person" === t.mode && !t.photo && "string" == typeof txt) {
    var sl = sdCanonSlim(),
      f = "f" === t.pres,
      on = SD_CANON_F.filter(function (p) {
        return "a" === p[2] || ("s" === p[2] && sl) || ("f" === p[2] && f) || ("j" === p[2] && f && "square" !== e.face);
      });
    return txt.replace(/(^|\n)((?:Face structure|Individual details)[^\n]*)/g, function (m0, a, line) {
      on.forEach(function (p) {
        line = line.split(p[0]).join("\u0000" + p[1] + "\u0000");
      });
      line = line.replace(/\u0000/g, "");
      /* a trait moved onto one already drawn appears once */
      on.forEach(function (p) {
        var i = line.indexOf(p[1]), j = line.lastIndexOf(", " + p[1]);
        i >= 0 && j > i && (line = line.slice(0, j) + line.slice(j + 2 + p[1].length));
      });
      return a + line;
    });
  }
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
/* v128 (user, a Seedream head sheet with "Gueule" and "Canon": far from a beauty that leaves people speechless; check the other characters
   too): with "Canon" or "Beau", "Beauté" did not keep the last word. "Gueule" said "weathered" and "deeper facial lines than usual for
   the age" (against "Canon" and against the age line), "a heavy brow", "narrowed eyes", "a hard jaw", and its swaps gave a woman low,
   heavy eyebrows close to the eyes, deep-set or hooded eyes, a long rectangular face and a downturned nose tip; "Méchant" gave small eyes
   and thin lips. A sentence saying "the looks take precedence" does not undo that in an image model. Now, with "Canon" or "Beau", these
   two characters are written in an attractive register (character in the bone structure and the gaze, no ageing, no harsh features),
   and their swaps keep only the traits that go with beauty (by sex for "Gueule": a man keeps a square face, a strong chin and thick,
   straight eyebrows). "Gentil" and "Angélique" already go with beauty: their traits are unchanged, their text only shorter. */
var SD_CHAR_BEAU = {
  gueule: "a face full of character: strong, sculpted bone structure, an intense, steady gaze",
  /* #### handsome, beautiful or striking (v128 review: an androgynous person had "the cold, striking face of a striking film villain").
     v129 (user: a villain can be very beautiful, menacing like a panther; the v128 sheet read cold, tired and harsh): the menace is in the
     gaze only, said as such, never in the features */
  mechant: "a #### film villain's face, dangerous like a panther: a calm, predatory gaze, the menace in the eyes only",
  /* the same characters, shorter under the beauty (the head stays nearer 600 words) */
  gentil: "a kind, warm face: gentle, friendly eyes, the corners of the mouth slightly upturned",
  ange: "an angelic face: clear, wide-open eyes with a gentle gaze, smooth, delicate contours",
};
var SD_CHAR_SWAP_BEAU = {
  gueule: [
    ["full, rounded cheeks", "lean cheeks with slight hollows"], ["soft cheeks of medium fullness", "lean cheeks with slight hollows"],
    ["wide cheekbones with full cheeks", "high, prominent cheekbones"], ["softly rounded cheekbones", "high, prominent cheekbones"], ["flat cheekbones and a smooth mid-face", "high, prominent cheekbones"],
    ["a soft, rounded jaw", "a clearly defined jaw"], ["a narrow, tapering jaw", "a clearly defined jaw"], ["a slightly receding chin", "a well-defined chin"],
    ["fine, light eyebrows", "full, straight eyebrows"], ["thin, high-arched eyebrows", "full, straight eyebrows"],
  ],
  gueuleM: [
    ["a round face", "a square face"], ["a heart-shaped face", "a square face"], ["an oval face", "a square face"],
    ["full, rounded cheeks", "lean cheeks with slight hollows"], ["soft cheeks of medium fullness", "lean cheeks with slight hollows"],
    ["wide cheekbones with full cheeks", "high, prominent cheekbones"], ["softly rounded cheekbones", "high, prominent cheekbones"], ["flat cheekbones and a smooth mid-face", "high, prominent cheekbones"],
    ["a soft, rounded jaw", "an angular jaw with visible corners"], ["a narrow, tapering jaw", "an angular jaw with visible corners"],
    ["a small, rounded chin", "a strong, square chin"], ["a gently projected, rounded chin", "a strong, well-projected chin"], ["a slightly receding chin", "a strong, square chin"], ["a pointed chin", "a square chin"],
    ["fine, light eyebrows", "thick, straight eyebrows"], ["thin, high-arched eyebrows", "thick, straight eyebrows"], ["full, softly arched eyebrows", "thick, straight eyebrows"],
  ],
  mechant: [
    ["full, softly arched eyebrows", "angled eyebrows with a sharp peak"], ["thin, high-arched eyebrows", "angled eyebrows with a sharp peak"],
    ["full, rounded cheeks", "lean cheeks with slight hollows"], ["soft cheeks of medium fullness", "lean cheeks with slight hollows"],
    /* v129: the v128 sheet had "wide cheekbones with full cheeks, lean cheeks with slight hollows" */
    ["wide cheekbones with full cheeks", "high, prominent cheekbones"],
    ["a soft, rounded jaw", "an angular jaw with visible corners"],
  ],
};
function sdCharOn() {
  return "person" === e.mode && !sdChild(e) && !e.photo && "string" === typeof SD_CHAR[e.faceChar] ? e.faceChar : "";
}
/* "Canon" (0) or "Beau" (1) with a character that has an attractive version */
function sdCharBeau() {
  var c = sdCharOn();
  return c && SD_CHAR_BEAU[c] && +e.looks <= 1 ? c : "";
}
function sdChar(above, man) {
  var c = sdCharOn(),
    b = sdCharBeau(),
    t = c ? (+e.looks <= 1 ? SD_CHAR_BEAU[b || c].replace("####", "m" === e.pres ? "handsome" : "f" === e.pres ? "beautiful" : "striking") : SD_CHAR[c]) : "";
  /* v130: for a man, "Angélique" and "Gentil" keep a grown man's face (the soft, delicate features read as a boy's in Seedream); Seedream head only */
  man &&
    "m" === e.pres &&
    (t = t
      .replace(SD_CHAR.ange, "an angelic, serene look on a grown man's face: clear, open eyes with a pure, gentle gaze, a calm expression, the bone structure of a man of his age")
      .replace(SD_CHAR_BEAU.ange, "an angelic look on a grown man's face: clear, open eyes with a gentle gaze, the bone structure of a man of his age")
      .replace(SD_CHAR.gentil, SD_CHAR.gentil.replace("soft, open features", "open features") + ", the bone structure of a man of his age"));
  t = sdCharFix(c, t);
  return c
    ? /* with "Canon" or "Beau", every character is said under the beauty, in a few words (the head stays near 600 words, so the looks
       line is not the part a model skips); v128 review: "second to the beauty", said before the character, 6 words shorter */
      (+e.looks <= 1
        ? "Character of the face, second to the beauty " + (above ? "above" : "below") + ": " + t + "."
        : "Character of the face, readable at rest: " + t + ". The features above and the looks below take precedence; the character shows in the gaze and overall look.")
    : "";
}
/* v131 (user, a "Gueule" + "Ordinaire" head sheet of a 26-year-old woman, GPT and Seedream: forehead lines and deep frown lines, the soft
   jaw she chose drawn hard): the character line said "weathered" and "deeper facial lines than usual for the age" next to "no wrinkles or
   expression lines", and "angular bone structure", "a hard jaw" next to the soft contours set by the user. A sentence of precedence does
   not undo them: the words that contradict the age (under 30, where the age line rules out lines) or a feature the user set go. */
function sdCharFix(c, t) {
  var a = +e.faceAngle,
    ff = +e.featFine,
    jaw = e.jaw && "auto" !== e.jaw ? e.jaw : "";
  if (!c || !t) return t;
  if ("gueule" === c) {
    (+e.age || 30) < 30 && (t = t.replace("a rugged, weathered face", "a rugged face").replace(", deeper facial lines than usual for the age", ""));
    (a <= 1 || "soft" === jaw) && (t = t.replace("angular bone structure, ", "").replace("strong, sculpted bone structure, ", ""));
    /* v156 review: never a hard jaw from "Graisse : visage" Visible up, nor prominent cheekbones and angular bones from Marquée up */
    (a <= 1 || "soft" === jaw || "medium" === jaw || sdFaceFatLv() >= 2) && (t = t.replace(", a hard jaw", ""));
    (0 === a || sdFaceFatLv() >= 3) && (t = t.replace(", prominent cheekbones", ""));
    sdFaceFatLv() >= 3 && (t = t.replace("angular bone structure, ", ""));
    e.eyeShape && "auto" !== e.eyeShape && (t = t.replace("deep-set, narrowed eyes", "narrowed eyes"));
  }
  if ("mechant" === c) {
    (a <= 1 || "soft" === jaw) && (t = t.replace(", sharp, hard features", ""));
    ("medium" === e.lips || "full" === e.lips) && (t = t.replace("a thin, tight-lipped mouth", "a tight-lipped mouth"));
  }
  "gentil" === c && (a >= 3 || "strong" === jaw) && (t = t.replace("soft, open features", "open features"));
  if ("ange" === c) {
    (a >= 3 || ff <= 1) && (t = t.replace("soft, delicate features, ", ""));
    (a >= 3 || "strong" === jaw) && (t = t.replace(", smooth contours", "").replace(", smooth, delicate contours", ""));
  }
  return t;
}
/* v130 (user: freckles on the face with a slider, from none to many): "Taches de rousseur", adults (never a child), both engines. Auto keeps
   the freckles drawn at random; any other choice replaces them in the "Individual details" line; "Aucune" also takes the drawn
   freckles off the shoulders of the body sheet. */
var SD_FRECKLES = {
  few: "a few faint freckles across the nose",
  some: "a light scattering of freckles across the nose and cheeks",
  many: "many freckles across the nose, the cheeks and the forehead",
  lots: "dense freckles all over the face, the neck and the shoulders",
};
function sdFreckleLv() {
  return "person" === e.mode && !sdChild(e) && !e.photo && (SD_FRECKLES[e.freckles] || "none" === e.freckles) ? e.freckles : "";
}
function sdFreckles(txt) {
  var lv = sdFreckleLv();
  if (!lv || "string" != typeof txt) return txt;
  return txt.replace(/(^|\n)(Individual details[^\n]*)/, function (m0, a, line) {
    line = line.replace(/, (a few faint freckles across the nose|a scattering of freckles across the cheeks and nose)(?=[,.])/g, "").replace(/: (a few faint freckles across the nose|a scattering of freckles across the cheeks and nose), /, ": ");
    /* v130 review: before the closing sentence of the older face form ("They set this face apart ...") */
    SD_FRECKLES[lv] && (line = / They set this face apart/.test(line) ? line.replace(/\. They set this face apart/, ", " + SD_FRECKLES[lv] + ". They set this face apart") : line.replace(/\.$/, ", " + SD_FRECKLES[lv] + "."));
    return a + line;
  });
}
/* v131 (user, the same sheets): drawn traits that contradict each other, the age line or the contours the user set, in both engines.
   Under 30 the age line says "no wrinkles or expression lines": a drawn frown line or forehead crease becomes another detail of the same
   draw (with "Canon" in Seedream the Canon moves already do it); a drawn "a high, broad forehead" with a drawn "a low hairline": a rounded
   hairline; soft contours set by the user ("Doux", "Très doux"): a drawn or moved square face is softly square. */
var SD_SOFT_TRAIT = { "a square face": "a softly square face" };
function sdFaceFix(txt) {
  if ("string" != typeof txt || "person" !== e.mode || sdChild(e) || e.photo) return txt;
  var young = (+e.age || 30) < 30 && !("seedream" === e.model && 0 === +e.looks && sdNative(e) && "m" !== e.pres),
    /* not for a "Canon" man in Seedream: his Canon moves take the high forehead to medium height */
    hi = /(^|\n)Face structure[^\n]*a high, broad forehead/.test(txt) && !("seedream" === e.model && 0 === +e.looks && sdNative(e) && "m" === e.pres);
  txt = txt.replace(/(^|\n)(Individual details[^\n]*)/, function (m0, a, line) {
    young && (line = line.replace("a faint vertical line between the eyebrows", "a small dimple at the left corner of the mouth").replace("a faint crease across the forehead", "the left eyebrow sitting slightly higher than the right"));
    hi && (line = line.replace("a low hairline", "a rounded hairline"));
    return a + line;
  });
  return +e.faceAngle <= 1
    ? txt.replace(/(^|\n)(Face structure[^\n]*)/, function (m0, a, line) {
        return a + line.replace(/(^|[:,] )a square face(?=[,.])/, "$1a softly square face");
      })
    : txt;
}
/* v133 (user, a GPT head sheet with "Ordinaire": "c'est du moche, on dirait une sorcière"). The traits drawn at random are drawn one by one,
   so a "Beau" or "Ordinaire" face could stack a long, rectangular face with a broad face, an aquiline nose bridge with an upturned tip,
   a prominent, forward chin with a hooked or long nose or a long face (the nose-and-chin profile of a caricature), round and large eyes
   (a staring look), and GPT was told "do not average it toward a generic face, and keep it even where it is less conventional". A
   caricature is made by exaggerating the differences between a face and a norm (Rhodes, Brennan and Carey, Cognitive Psychology, 1987);
   an ordinary face differs from it in a few traits, at an everyday degree. With "Beau" and "Ordinaire", after the character moves: the contradictory pairs resolved, the
   caricature profile and the staring eyes ("Ordinaire") moved to a medium trait; from "Ordinaire" down, GPT keeps the structure "each
   trait at the degree of a real, everyday face, never exaggerated or caricatured". "Quelconque" and "Ingrat" have their own moves
   (SD_PLAIN). */
var SD_ORD_ID = ". This structure is what makes the face recognizable: do not average it toward a generic face, and keep it even where it is less conventional.";
function sdOrdFix(txt) {
  if ("string" != typeof txt || "person" !== e.mode || sdChild(e) || e.photo) return txt;
  var lk = +e.looks;
  /* this repository keeps GPT's structure sentence (SD_ORD_ID) at every level: its "Ordinaire" to "Ingrat" texts were calibrated with
     it; only the contradictory random pairs below are resolved */
  if (lk < 1 || lk > 2) return txt;
  return txt.replace(/(^|\n)(Face structure[^\n]*)/, function (m0, a, line) {
    var has = function (x) {
      return line.indexOf(x) >= 0;
    };
    /(?:a long, rectangular face|a long face)(?=[,.])/.test(line) && (line = line.replace(/(?<=[:,] )a broad face(?=[,.])/, "a face of medium width"));
    /a round face(?=[,.])/.test(line) && (line = line.replace(/(?<=[:,] )a narrow face(?=[,.])/, "a face of medium width"));
    (has("an aquiline nose bridge") || has("a high nose bridge with a visible bump")) && (line = line.replace("an upturned nose tip", "a rounded nose tip"));
    (has("an aquiline nose bridge") || has("a high nose bridge with a visible bump") || has("a long nose") || /a long(?:, rectangular)? face(?=[,.])/.test(line)) &&
      (line = line.replace("a prominent, forward chin", "a chin of medium projection"));
    2 === lk && has("round eyes") && (line = line.replace(/(?<=[:,] )large eyes(?=[,.])/, "medium-sized eyes"));
    return a + line;
  });
}
function sdCharFace(txt) {
  return sdOrdFix(sdCharFace0(txt));
}
/* v134 (user, two Seedream head sheets audited: "no visible moles on the face", yet a dark spot at the left corner of the mouth in the
   three-quarter view of both): with the neutral expression of the sheets a dimple does not show, and Seedream drew "a small dimple at
   the left corner of the mouth" as a mark. In a native Seedream head (drawn, moved by Canon or by the under-30 fix) it becomes a drawn
   detail of the same kind that does show at rest (the eye one, so the faces under 30 and with Canon do not all share the eyebrow one);
   GPT, and Seedream 3D, 2D or from a photo (GPT's text), unchanged. */
function sdDimpleFix(txt) {
  var D = "a small dimple at the left corner of the mouth",
    E = "the right eye very slightly smaller than the left";
  return "string" == typeof txt
    ? txt.replace(/(^|\n)(Individual details: [^\n]*)/, function (m0, a, line) {
        return a + (line.indexOf(E) >= 0 ? line.replace(", " + D, "").replace(D + ", ", "") : line.replace(D, E));
      })
    : txt;
}
/* v134 review: Canon moves "a faint crease across the forehead" to "a small mole on the left cheekbone" (SD_CANON_F), on a line whose
   drawn mark can be "no visible moles on the face" (a contradiction) or that same mole (said twice): there, the moved one becomes the
   eyebrow detail (the eye one when the eyebrow is drawn; neither is, the crease took their place). Native Seedream head. */
function sdMoleFix(txt) {
  var M = "a small mole on the left cheekbone",
    N = "no visible moles on the face",
    B = "the left eyebrow sitting slightly higher than the right",
    E = "the right eye very slightly smaller than the left";
  return "string" == typeof txt
    ? txt.replace(/(^|\n)(Individual details: [^\n]*)/, function (m0, a, line) {
        var i = line.lastIndexOf(M);
        if (i < 0 || !(line.indexOf(N) >= 0 || line.indexOf(M) !== i)) return m0;
        return a + line.slice(0, i) + (line.indexOf(B) < 0 ? B : E) + line.slice(i + M.length);
      })
    : txt;
}
function sdCharFace0(txt) {
  txt = sdFaceFix(sdFreckles(sdLossForehead(txt)));
  var c = sdCharOn(),
    b = sdCharBeau(),
    sw = b ? SD_CHAR_SWAP_BEAU["gueule" === b && "m" === e.pres ? "gueuleM" : b] || SD_CHAR_SWAP[c] : SD_CHAR_SWAP[c];
  if (!c || "string" != typeof txt) return txt;
  +e.faceAngle <= 1 &&
    (sw = sw.map(function (p) {
      return [p[0], SD_SOFT_TRAIT[p[1]] || p[1]];
    }));
  return txt.replace(/(^|\n)(Face structure[^\n]*)/, function (m0, a, line) {
    sw.forEach(function (p) {
      line = line.split(p[0]).join("\u0000" + p[1] + "\u0000");
    });
    line = line.replace(/\u0000/g, "");
    /* v129: cheeks moved to lean, then the cheekbones never say "full cheeks" (the v128 sheet had both) */
    /* v129 review: from "Quelconque" down in the plain register (SD_PLAIN gives the same as v128 in Seedream) */
    /lean cheeks/.test(line) && (line = line.replace("wide cheekbones with full cheeks", +e.looks >= 3 ? "low, broad cheekbones" : "wide, prominent cheekbones"));
    /* a trait moved onto one already drawn appears once */
    sw.forEach(function (p) {
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
/* v134 (user: GPT drew a head sheet in "wide panoramic landscape, 2.7:1 aspect ratio" on its own, "ça a placé les visages parfaitement
   sans rien couper"; "Oui, GPT seulement"): four panels of 0.675 width for 1 height instead of 0.44 in 16:9, room for a head with its hair.
   GPT adult person head sheet only (children, animals and Seedream keep 16:9); one render, not yet checked further. */
var SD_GPT_WIDE = ["A 16:9 landscape image split into four equal vertical panels of the same size, separated by narrow gaps of the same grey as the backdrop.\nEach panel is a tight close-up of the head and neck", "A wide panoramic landscape image, 2.7:1 aspect ratio, split into four equal vertical panels of the same size, separated by narrow gaps of the same grey as the backdrop.\nEach panel is a tight close-up of the head and neck"];
function sdGptWide(t, m) {
  if ("person" !== t.mode || sdChild(t) || "string" != typeof m.head || m.head.indexOf(SD_GPT_WIDE[0]) < 0) return m;
  var o = {},
    k;
  for (k in m) o[k] = m[k];
  o.head = m.head.replace(SD_GPT_WIDE[0], SD_GPT_WIDE[1]);
  return o;
}
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
    .replace(SD_ARMS_OUT_G, SD_ARMS_OUT_GS)
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
    /* a person's GPT prompts: face fat, wide head sheet, very low bust, nose and pose rewrites (each one checks the person itself) */
    o = sdPoseM(sdNoseM(sdDropM(sdGptWide(t, sdFaceFatMap(o)))));
    return "seedream" === t.model ? sdSolo(o) : o;
  }
  if (!sdNative(t)) return sdPoseM(sdGptSd(t, sdNoseM(sdDropM(sdFaceFatMap(sdGptPost(t, m))))));
  for (k in m) o[k] = m[k];
  o.head = sdFaceFatTrim(sdNoseSkin(sdMoleFix(sdDimpleFix(sdManAdult(sdCanonFace(sdPlainFace(sdAdult(sdHead()), t.looks), t), t)))));
  o.body = sdDropFix(sdAdult(sdBody()));
  o.iter = sdDropFix(String(e.sdIter || "").trim() || "dressMine" === e.sdIterOp ? sdAdult(sdIterText()) : nw() && "free" !== e.sdIterOp ? sdAdult(sdPresetJoin()) : "");
  /* v155: step 4, "Finition photo" */
  o.fin = sdFinOn(t) ? sdDropFix(sdAdult(sdPresetFinish())) : "";
  o.grow = sdGrowOn(t) ? sdGrowPrompt() : "";
  o.growUp = sdGrowUpOn(t) ? sdGrowUpPrompt() : "";
  o.growBust = sdGrowBustOn(t) ? sdGrowBustPrompt() : "";
  return sdPoseM(sdNoseM(o));
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
    /* v134: the format the GPT head prompt now asks */
    "string" == typeof m.head && m.head.indexOf(SD_GPT_WIDE[1]) >= 0 &&
      ["head", "editHead"].forEach(function (k) {
        o[k] &&
          (o[k] = o[k].map(function (r) {
            return "Format" === r[0] ? ["Format", "2.7:1, demandé dans le prompt : vérifie l'image obtenue"] : r;
          }));
      });
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
    [J, sdChildPh(t) ? "La photo de l'enfant" : "Aucune image"],
    ["Format", F],
    [N, R(rU(sdBaby(t) ? "bebe" : "tete"))],
    ["Longueur", sdLen(m.head, !0)],
  ];
  o.body = [
    [
      J,
      nw() || (sdChildHl(t) && !sdChildPh(t))
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
  sdGrowOn(t) &&
    (o.grow = [
      [J, nw() ? "1. ta planche corps sans tête, celle de la carte 2" : "1. ta planche corps, celle de la carte 2"],
      ["Format", "Identique à l'image 1"],
      [N, "Même nom + _v2, _v3…"],
      ["Longueur", sdLen(m.grow, !0)],
    ]);
  sdGrowUpOn(t) &&
    (o.growUp = [
      [J, nw() ? "1. ta planche corps sans tête, celle de la carte 2" + (sdGrowOn(t) ? " ou de la retouche 2b" : "") : "1. ta planche corps, celle de la carte 2" + (sdGrowOn(t) ? " ou de la retouche 2b" : "")],
      ["Format", "Identique à l'image 1"],
      [N, "Même nom + _v2, _v3…"],
      ["Longueur", sdLen(m.growUp, !0)],
    ]);
  /* v155: step 4 */
  sdFinOn(t) &&
    (o.fin = [
      [J, "1. ta planche " + sdFinWord(0)],
      ["Format", "Identique à l'image 1"],
      [N, "Même nom + _v2, _v3…"],
      ["Longueur", sdLen(m.fin, !0)],
    ]);
  sdGrowBustOn(t) &&
    (o.growBust = [
      [J, nw() ? "1. ta planche corps sans tête, celle de la carte 2" + (sdGrowOn(t) ? " ou de la retouche 2b" : "") : "1. ta planche corps, celle de la carte 2" + (sdGrowOn(t) ? " ou de la retouche 2b" : "")],
      ["Format", "Identique à l'image 1"],
      [N, "Même nom + _v2, _v3…"],
      ["Longueur", sdLen(m.growBust, !0)],
    ]);
  o.iter = [
    [
      J,
      "join" === sdOp(e)
        ? sdJoinNoPrep()
          ? "1 : ta planche corps sans tête validée, telle quelle, sans préparation. 2 : la planche tête."
          : "1 : ta planche corps sans tête validée, préparée ci-dessus (+25 % en haut). 2 : la planche tête."
        : "heads" === sdIterOpEff(e)
        ? "1 : ta planche habillée, préparée ci-dessus (+25 % en haut). 2 : la planche tête."
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
/* v153 (user: "on peut cliquer « Tenue en un seul texte » et « Tenue de référence corps » mais du coup il va prendre lequel en compte, et la
   section Habiller c'est quoi le deal", then "c'est pas clair pour moi, les utilisateurs vont se poser la question"): the Tenue tab says,
   live, what the head and body sheets and "Habiller avec ma tenue" wear, read with the same functions as the prompts (nv, nC, sdFreeOn,
   sdFreeText, sdPhotoClothes, nj, on the state shown); card 3 says which outfit "Habiller avec ma tenue" uses. Card 3 and its "Habiller avec
   ma tenue" exist only with Seedream, an adult in Photo style and no starting photo (sdMineTenue, the same guard as the Tenue tab's note). */
function sdDressMineOn(t) {
  return "person" === t.mode && !sdChild(t) && sdMineTenue(t);
}
/* an outfit source, as the summary names it; card: from card 3, where "ci-dessous" would be wrong */
function sdWearWord(s, card) {
  return rq(s, function () {
    if (sdFreeOn()) {
      if (sdFreeText()) return card ? sdT("ton texte de l'onglet Tenue", "your text in the Outfit tab") : sdT("ton texte", "your text");
      var raw = sdFreeClean(e.outfitText);
      return raw
        ? sdT("une tenue simple de tous les jours, unie (« " + raw + " » ne décrit pas de tenue)", "a simple everyday outfit in plain colors (“" + raw + "” describes no outfit)")
        : sdT("une tenue simple de tous les jours, unie (ton texte est vide)", "a simple everyday outfit in plain colors (your text is empty)");
    }
    if (sdPhotoClothes()) return sdT("les habits de ta photo", "the clothes in your photo");
    return nj()
      ? card
        ? sdT("tes choix de l'onglet Tenue", "your choices in the Outfit tab")
        : sdT("tes choix ci-dessous", "your choices below")
      : card
        ? sdT("une tenue simple de tous les jours, unie (rien de coché dans l'onglet Tenue)", "a simple everyday outfit in plain colors (nothing ticked in the Outfit tab)")
        : sdT("une tenue simple de tous les jours, unie (rien de coché)", "a simple everyday outfit in plain colors (nothing ticked)");
  });
}
/* the summary at the top of the Tenue tab, for an adult; not with the photo's clothes, whose own note already says the sheets keep them.
   Read on sdG(t), the state the prompts are written from (a piece field set to "random" is drawn there, possibly to nothing). Review of
   v153: with the head, Seedream dresses the body in the fitted top and leggings, or takes the body from the dressed sheet (sdOutfit,
   sdCoverNote), not the reference choice below; a text typed in card 3 replaces the outfit of "Habiller avec ma tenue" (sdIterText). */
function sdTenueLines(t) {
  if ("person" !== t.mode || sdChild(t)) return [];
  var g = sdG(t);
  if (rq(g, nC)) return [];
  var ref = rq(g, nv),
    mine = sdDressMineOn(t),
    off = Object.assign({}, g, { bodyRef: !1 }),
    tn = sdIterNorm(t),
    typed = "dressMine" === tn.sdIterOp && !!String(tn.sdIter || "").trim(),
    dressW = typed ? sdT("ton texte écrit dans la carte 3 (l'onglet Tenue n'est plus lu)", "the text you typed in card 3 (the Outfit tab is no longer read)") : sdWearWord(off),
    L = [];
  if (ref) {
    /* not "bleu cobalt" here: a man's head sheet in GPT shows a bare neck */
    L.push(sdT("Planches tête et corps : la tenue de référence, pas ta tenue.", "Head and body sheets: the reference outfit, not your outfit."));
    sdNat(t) &&
      !t.headless &&
      L.push(
        rq(g, sdUseBodyImg)
          ? sdT("Planche corps : avec la tête, le corps et sa tenue viennent de ta planche habillée (« Le corps vient de », carte 2).", "Body sheet: with the head, the body and its outfit come from your dressed sheet (“The body comes from”, card 2).")
          : "m" === t.pres
            ? sdT(
                "Planche corps : avec la tête, un haut de sport sans manches et un collant de course bleu cobalt ; le choix ci-dessous ne sert qu'avec « Planche corps sans tête » (onglet Corps).",
                "Body sheet: with the head, a cobalt-blue sleeveless training top and running tights; the choice below only applies with “Headless body sheet” (Body tab).",
              )
            : sdT(
                "Planche corps : avec la tête, un haut court ajusté sans manches et un legging bleu cobalt ; le choix ci-dessous ne sert qu'avec « Planche corps sans tête » (onglet Corps).",
                "Body sheet: with the head, a fitted cobalt-blue sleeveless cropped top and leggings; the choice below only applies with “Headless body sheet” (Body tab).",
              ),
      );
    L.push(
      mine
        ? sdT("« Habiller avec ma tenue » (carte 3), sur ta planche corps validée : ", "“Dress in my outfit” (card 3), on your approved body sheet: ") + dressW + "."
        : rq(off, sdPhotoClothes)
          ? sdT("Les habits de ta photo ne sont pas utilisés : la tenue de référence les remplace.", "The clothes in your photo are not used: the reference outfit replaces them.")
          : sdT(
              "Tant que « Tenue de référence corps » est cochée, ta tenue n'est pas utilisée : décoche-la pour habiller les planches avec ta tenue.",
              "While “Body reference outfit” is on, your outfit is not used: switch it off to dress the sheets in your outfit.",
            ),
    );
  } else if (mine && !typed)
    L.push(sdT("Planches tête et corps, et « Habiller avec ma tenue » (carte 3) : ", "Head and body sheets, and “Dress in my outfit” (card 3): ") + sdWearWord(g) + ".");
  else {
    L.push(sdT("Planches tête et corps : ", "Head and body sheets: ") + sdWearWord(g) + ".");
    mine && L.push(sdT("« Habiller avec ma tenue » (carte 3) : ", "“Dress in my outfit” (card 3): ") + dressW + ".");
  }
  /* the piece choices, hidden while the text replaces them, are kept: said where they would otherwise be used */
  (!ref || (mine && !typed)) &&
    rq(off, sdFreeOn) &&
    rq(off, nj) &&
    L.push(sdT("Tes choix de pièces sont gardés mais ignorés tant que « Tenue en un seul texte » est coché.", "Your piece choices are kept but ignored while “Outfit in a single text” is on."));
  return L;
}
function sdTenueSum(t) {
  var L = sdTenueLines(t);
  return L.length
    ? (0, l.jsxs)("div", {
        "data-sd-wear": "1",
        className: "my-4 rounded-xl bg-muted p-4 text-sm",
        children: [(0, l.jsx)("p", { className: "font-semibold", children: sdT("Ce que portent tes planches", "What your sheets wear") }, "h")].concat(
          L.map(function (x, i) {
            return (0, l.jsx)("p", { className: "mt-1", children: x }, i);
          }),
        ),
      })
    : null;
}
/* v154 "Finition photo" (card 3 in v154, step 4 since v155; user: "les nombreuses itérations sortent une image plus contrastée qui ensuite devient du vrai plastique sur
   Seedance", "il faut que le réalisme des photos soit le mieux possible en termes de texture de peau et couleur de peau ainsi que luminosité";
   his own test prompt asked for soft natural daylight, visible pores, fine body hair, slightly uneven tone, redness at the elbows and
   knuckles, natural muscle tone instead of sculpted shiny definition, no glossy highlights, light film grain). On the final sheet, last:
   only the photographic rendering changes. The light keeps its direction, hardness and shadows (a daylight change would move the shading
   that draws the shapes; v154 review: no added fill either, against the weak fill the sheets set for the muscles and the skin texture),
   its contrast never stronger than image 1's; the muscles keep their definition (set in the Corps tab), read from light and shadow, not shine;
   the skin color and texture follow the settings (skin tone, Imperfections, body hair, age) as the sheets say them (sdSkinBody,
   sdSkinHead). À VÉRIFIER on renders.
   v154 reviews: image 1 is one of three sheets, chosen under the hint ("Planche à finir": the combined sheet, the headless body sheet or
   the head sheet with "Sans tête"; the body sheet, which has the head, or the head sheet without it), so the prompt names only what that
   sheet shows: no face, hair or glasses on a headless body (v134: they made a chin and glasses show above the collarbones), the cut at
   the collarbones kept there only, no body, hands or body hair on a head sheet. Each word is the sheet's own, at its strength (v144: no
   flaw added or made stronger): the body sheet's "fine pores" and the head sheet's stronger pores on the nose and cheeks; the tone of
   each sheet ("Canon" evens the face at "Naturelles" only, v104); the redness on the knees and elbows only where the body sheet asks it
   (sdSkinBody: not with the head and the reference outfit), the rest of the skin no redder; no knuckles (no sheet names them); the head
   sheet's peach fuzz or beard shadow (sdFaceFuzz); "chest" for a man and for "Très menue" (sdJoinNanoText's rule); the cellulite only
   where the body sheet names it; an "État du moment" (sweat, flush, wet skin) kept, the matte words dropped then; at Imperfections 3
   and 4 the head sheet's oily shine not forbidden on the face, the body kept matte as its sheet says at every level; "adult" under 21,
   as sdPresetJoin; no "identity" on the headless body (it anchors a face in this tool); the head sheet's Purpose is a character's. (v154's
   typed text and pasted prompt under "Finition photo" went with card 3: a free retouche is card 3's.) */
/* v155 (user: "le truc de finition a disparu … c'est pas clair tout ça"; then, asked, "Étape 4 à part"): "Finition photo" is step 4, a card
   of its own under card 3, shown wherever card 3 is (Seedream, an adult in Photo style, no starting photo): no folded list to open, no
   card 3 retouche to give up. Its text cannot be written over any more (a free retouche is card 3's "Retouche libre"). The card holds,
   above what to add: what it does, then "Planche à finir" with its tooltips; its tooltip and its copy message; its button in the phone's
   bottom bar ("Finition") once a sheet is chosen, as card 3's once a retouche is (v155 review: always there, it crowded the bar to two
   rows or past a 320 px screen). Its prompt box is drawn when "Détails et prompt" is opened (the copy never reads it). */
function sdFinOn(t) {
  return "seedream" === t.model && "person" === t.mode && !sdChild(t) && sdNative(t) && !sdOff(t);
}
function sdFinCopyMsg() {
  sdNewClear("card:fin");
  return sdT("Copié. Dans Seedream, ajoute ta planche " + sdFinWord(0) + " (image 1), puis compare le résultat avec elle.", "Copied. In Seedream, add your " + sdFinWord(1) + " sheet (image 1), then compare the result with it.");
}
function sdFinPre(t, g) {
  return (0, l.jsxs)("div", {
    className: "mt-3 grid gap-3 text-sm",
    children: [
      sdNewHas("card:fin")
        ? (0, l.jsxs)("p", {
            "data-sd-new-card": "fin",
            className: "font-semibold",
            children: [
              (0, l.jsx)("span", { className: "mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white", style: { background: "hsl(var(--destructive))" }, children: sdT("Nouveau", "New") }),
              sdT("absente de ton fichier : la dernière étape avant Seedance.", "not in your file: the last step before Seedance."),
            ],
          })
        : null,
      (0, l.jsx)("p", {
        className: "text-muted-foreground",
        children: sdT(
          "À faire en dernier, sur ta planche finale, avant Seedance : la peau, sa couleur et la lumière d'une vraie photo, le reste inchangé. Le texte suit tes réglages de peau : onglets Visage (teint, imperfections, beauté), Corps (âge, pilosité, cellulite) et Signes (état du moment). Pars toujours de ta planche finale, jamais d'une image déjà finie, et garde la plus naturelle des deux. Tête et corps donnés séparément à Seedance : finis les deux et vérifie que la peau reste la même.",
          "Do it last, on your final sheet, before Seedance: the skin, its color and the light of a real photograph, everything else unchanged. The text follows your skin settings: Face tab (skin tone, imperfections, beauty), Body tab (age, body hair, cellulite) and Marks tab (state of the moment). Always start from your final sheet, never from an image already finished, and keep the more natural of the two. Head and body given to Seedance separately: finish both and check the skin stays the same.",
        ),
      }),
      (0, l.jsxs)("div", {
        children: [
          /* v154 (user: "je comprends pas ce que ça veut dire … assemblé, corps sans tête et tête ???? il faut un tooltip hover"): the heading's
             tooltip (hover, keyboard focus, tap) says what each sheet is; each option says its own on hover */
          (0, l.jsx)("div", {
            className: "mb-2",
            children: sdTip((0, l.jsx)("span", { className: "font-semibold", children: "Planche à finir" }), sdFinTip(), "sd-fintg-tip"),
          }),
          (0, l.jsx)(ab, {
            label: "Planche à finir",
            value: nw() || "head" === sdFinTg() ? sdFinTg() : "full",
            onChange: (v) => (sdNewClear("card:fin"), g("sdFinTg", v)),
            wrap: !0,
            options: nw()
              ? [
                  ["join", "Assemblée", sdFinTipText("join")],
                  ["body", "Corps sans tête", sdFinTipText("body")],
                  ["head", "Tête", sdFinTipText("head")],
                ]
              : [
                  ["full", "Corps", sdFinTipText("full")],
                  ["head", "Tête", sdFinTipText("head")],
                ],
          }),
        ],
      }),
    ],
  });
}
/* v154 review: the saved choice ("join", "body" for the headless body, "full" for the body with the head, "head") never turns a body with
   the head into a headless one when "Sans tête" is ticked afterwards (a radio click saves even the option already checked) */
function sdFinTg() {
  var v = e.sdFinTg;
  return nw() ? ("body" === v || "head" === v ? v : "join") : "head" === v ? "head" : "body";
}
/* v154 (user: "je comprends pas ce que ça veut dire finition photo, assemblé, corps sans tête et tête ???? il faut un tooltip hover"): what
   each sheet of "Planche à finir" is, on hover of each option and in the heading's tooltip */
function sdFinTipText(k) {
  return {
    join: sdT(
      "Assemblée : la planche où la tête est posée sur le corps, le résultat de « Assembler tête et corps » ou de « Ajouter les têtes » (carte 3).",
      "Combined: the sheet where the head sits on the body, the result of “Combine head and body” or “Add the heads” (card 3).",
    ),
    body: sdT("Corps sans tête : ta planche corps sans tête (carte 2), telle que tu l'as validée.", "Headless body: your headless body sheet (card 2), as you approved it."),
    full: sdT("Corps : ta planche corps avec la tête (carte 2), telle que tu l'as validée.", "Body: your body sheet with the head (card 2), as you approved it."),
    head: sdT("Tête : ta planche tête (carte 1), les gros plans du visage.", "Head: your head sheet (card 1), the close-ups of the face."),
  }[k];
}
function sdFinTip() {
  return [
    sdT(
      "Choisis la planche que tu joins en image 1. Le prompt ne parle que de ce qu'elle montre : pas de visage sur un corps sans tête, pas de corps sur une tête.",
      "Choose the sheet you add as image 1. The prompt only speaks of what it shows: no face on a headless body, no body on a head.",
    ),
  ]
    .concat(
      (nw() ? ["join", "body", "head"] : ["full", "head"]).map(function (k) {
        return sdFinTipText(k);
      }),
    )
    .map(function (x, i) {
      return (0, l.jsx)("span", { style: { display: "block", marginTop: i ? "0.45rem" : 0 }, children: x }, i);
    });
}
/* the sheet "Finition photo" finishes, as the attach row and the copy message say it (French 0, English 1) */
function sdFinWord(en) {
  return { join: ["assemblée", "combined"], body: nw() ? ["corps sans tête", "headless body"] : ["corps", "body"], head: ["tête", "head"] }[sdFinTg()][en ? 1 : 0];
}
function sdPresetFinish() {
  var tg = sdFinTg(),
    face = "body" !== tg || !nw(),
    body = "head" !== tg,
    lv = +e.imperf || 0,
    st = rl(),
    young = (+e.age || 30) < 21,
    w = (young ? "adult " : "") + sdWho(),
    x = ["fine pores on all the skin that shows" + (face && 2 === lv ? (0 === e.looks ? ", visible on the face" : ", visible on the nose and cheeks") : face && 3 === lv ? ", enlarged on the nose and cheeks" : "")],
    ht = face ? [null, "a slightly uneven tone", 0 === e.looks ? "an even tone" : "a slightly uneven tone", "an uneven, slightly blotchy tone", "a blotchy tone"][lv] : null,
    bt = body ? [null, null, "a slightly uneven tone", "an uneven tone", "a blotchy tone"][lv] : null,
    k = "body" === tg && nw() ? [] : ["the identity"];
  ht && bt ? x.push(ht === bt ? ht : ht + " on the face, " + bt + " on the body") : ht ? x.push(ht + (body ? " on the face" : "")) : bt && x.push(bt + (face ? " on the body" : ""));
  body && lv >= 1 && (nw() || !nv()) && x.push("faint natural redness on " + (sdKneesSmooth() ? "the elbows" : "the knees and elbows") + ", wherever they show; the rest of the skin no redder than in image 1");
  body && !sdBodyHair() && x.push("faint, fine body hair");
  face && lv >= 1 && x.push(sdFaceFuzz());
  /* matte as the body sheet says it at every level ("Matte texture", "Not oiled"); the head sheet's oily shine at Imperfections 3 and 4, and an
     "État du moment" (sweat, wet skin), keep the highlights of image 1 */
  x.push(
    st || (lv >= 3 && !body)
      ? "the highlights on the skin as in image 1, never waxy or plastic"
      : lv >= 3 && face
        ? "matte on the body, the highlights as small and soft as in image 1 or softer, never oily, waxy, glossy or plastic; on the face, the highlights as in image 1, never waxy or plastic"
        : "matte, the highlights on the skin as small and soft as in image 1 or softer, never oily, waxy, glossy or plastic",
    "no airbrushing or smoothing",
  );
  face && k.push("the face with every feature and its expression, the hair, any glasses and makeup");
  body
    ? k.push(
        "the body's size, shape and proportions, " +
          ("m" === e.pres || !(e.chest >= 1) ? "the chest" : "the bust's size, shape and hang") +
          ", the muscles and how defined they are (read from light and shadow, not from shine), the hands with five fingers each",
      )
    : k.push("the neck and shoulders");
  k.push(
    "every freckle, mole, vein, scar, tattoo or other mark already on the skin" +
      (body && "none" !== e.cellulite && "m" !== e.pres && (nw() || !nv()) ? ", and the cellulite" : "") +
      ", at the same place, size and strength",
  );
  st && k.push("the current state of image 1 (" + st + ")");
  k.push(
    "the pose, the framing, crop and scale of every panel" +
      ("body" === tg && nw() ? " (a body cut at the collarbones stays cut there, nothing added above)" : "") +
      ", every view, the outfit, the backdrop and the panel layout",
  );
  return (
    "Edit image 1, the approved " +
    { join: "combined head and body", body: nw() ? "headless body" : "body", head: "head" }[tg] +
    " reference sheet of this " +
    w +
    ".\nPurpose: a neutral " +
    ("head" === tg ? "character" : nv() ? "anatomy and costume-fitting" : "costume and character") +
    " reference for a film's VFX team.\n" +
    ("Change only the photographic rendering, the same in every panel, so that it looks like an unretouched photograph taken with a real camera, not a render.\n" +
        "Light: the same direction, hardness and shadows as in image 1; the natural contrast of a real photograph, never stronger than in image 1: the shadows keep their detail, no highlight is blown out, no HDR look, no glow or bloom.\n" +
        "Color: neutral white balance; skin color: " +
        t7("skin") +
        ", true to life, not redder, more orange, more tanned or more saturated than that" +
        (st ? ", apart from the current state kept below" : "") +
        "; the backdrop stays a plain neutral grey.\n" +
        "Skin: " +
        x.join("; ") +
        "." +
        (body && sdBodyHair() ? " " + t6(sdBodyHair()) + "." : "") +
        " Texture only: no new mark, spot, line or wrinkle, none made stronger. The skin of " +
        (/^(8|11|18|8\d)$/.test(String(e.age)) ? "an " : "a ") +
        e.age +
        "-year-old" +
        (young ? " adult" : "") +
        ", not older.\n" +
        "Detail: real lens sharpness with no sharpening halos or crunchy edges, fine even film grain over the whole image.\n" +
        "Keep everything else exactly as in image 1, each wherever it shows: ") +
    k.join("; ") +
    "; nothing grows, shrinks, lifts or slims. " +
    /* no "marks above" or outfit text in this prompt: the lettering of image 1 (a tattoo, a print) is simply kept */
    "Nothing added: no captions, labels, panel numbers or watermark; any lettering already in image 1 stays exactly as it is."
  );
}
/* v155 (user: "il faut passer trois heures à aller vers le haut ; une flèche ne peut pas s'afficher, pour quand on descend un peu trop loin :
   on clique et on va direct en bas ou direct en haut, comme sur ChatGPT ou Claude"): two round arrows. "Tout en haut" shows once the page is
   scrolled more than one screen down, "Tout en bas" while more than one screen is left below; each jumps straight to its end (smoothly,
   at once with "reduce motion"). Wide screens (the three steps beside the settings): in the settings sheet's right padding and the gap
   before the steps, so they cover no control and no step. Narrower: 4 px from the right edge, in the page's margin as far as it goes,
   above the bottom bar (its height measured, two rows too). Labels and hover tooltips in French and English. */
function sdScrollGo(top) {
  var d = document.documentElement,
    rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: top ? 0 : d.scrollHeight, behavior: rm ? "auto" : "smooth" });
}
function SdScrollNav() {
  var st = (0, s.useState)(null),
    v = st[0],
    setV = st[1];
  (0, s.useEffect)(function () {
    var raf = 0;
    function upd() {
      raf = 0;
      var d = document.documentElement,
        vh = window.innerHeight,
        vw = d.clientWidth,
        y = window.scrollY || d.scrollTop || 0,
        left = d.scrollHeight - vh - y,
        aside = document.querySelector("aside"),
        ar = aside && aside.getBoundingClientRect(),
        bar = document.querySelector("div.fixed.inset-x-0.bottom-0"),
        bh = bar && "none" !== getComputedStyle(bar).display ? bar.getBoundingClientRect().height : 0,
        /* the steps beside the settings (lg): the arrows sit just left of them */
        side = !!(ar && ar.width && ar.left > vw / 2 && ar.top < vh);
      var n = { up: y > vh, down: left > vh, right: side ? Math.round(vw - ar.left + 2) : 4, bottom: bh ? Math.round(bh + 12) : 0, side: side };
      setV(function (o) {
        return o && o.up === n.up && o.down === n.down && o.right === n.right && o.bottom === n.bottom && o.side === n.side ? o : n;
      });
    }
    function on() {
      raf || (raf = requestAnimationFrame(upd));
    }
    upd();
    window.addEventListener("scroll", on, { passive: !0 });
    window.addEventListener("resize", on);
    /* a fold opened or closed changes the page's height without a scroll */
    var ro = "function" == typeof ResizeObserver ? new ResizeObserver(on) : null;
    ro && ro.observe(document.getElementById("root") || document.body);
    return function () {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      ro && ro.disconnect();
      raf && cancelAnimationFrame(raf);
    };
  }, []);
  if (!v || !(v.up || v.down)) return null;
  var size = v.side ? 40 : 44,
    btn = function (top) {
      var lab = top ? sdT("Aller tout en haut", "Go to the top") : sdT("Aller tout en bas", "Go to the bottom");
      return (0, l.jsx)(
        "button",
        {
          type: "button",
          "aria-label": lab,
          title: lab,
          "data-sd-scroll": top ? "top" : "bottom",
          onClick: function () {
            sdScrollGo(top);
          },
          className:
            "inline-flex items-center justify-center rounded-full border bg-card text-foreground shadow-md transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          style: { width: size, height: size },
          children: (0, l.jsx)("svg", {
            width: 18,
            height: 18,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 2.25,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": "true",
            children: (0, l.jsx)("path", { d: top ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M19 12l-7 7-7-7" }),
          }),
        },
        top ? "top" : "bottom",
      );
    };
  return (0, l.jsxs)("div", {
    id: "sd-scrollnav",
    style: {
      position: "fixed",
      right: v.right,
      bottom: v.bottom ? v.bottom : "calc(16px + env(safe-area-inset-bottom, 0px))",
      zIndex: 25,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    children: [v.up ? btn(!0) : null, v.down ? btn(!1) : null],
  });
}
/* v155 (user, after importing an older file: "le truc de finition a disparu, on a l'impression que je suis revenu à une ancienne version ; il
   devrait dire qu'il faut remplir des trucs qui n'existaient pas avant, sinon je vais avoir des soucis de compatibilité, et mes utilisateurs
   aussi ; mettre les sliders en rouge pour dire que ce sont des nouveaux trucs, et laisser les curseurs sur normal ou sur rien, à toi de
   voir"). The loader already gives every setting missing from an older file or an older saved page its default value (ac: "n in e ? e[n] :
   tJ[n]"); what was missing is telling it. A setting of the tabs that a full older state does not hold is marked "new": a red bar at its
   left (no layout shift: the bar takes the room it adds back), a red dot on its tab, a line under Exporter / Importer with "Retirer les
   marques"; step 4, "Finition photo", too when the state predates it (no "sdFinTg"): a red "Nouveau" on its card, gone on its first copy or
   sheet choice. The value stays the default. Marks are kept in the browser until they go.
   v155 review: a mark goes when its setting is used (a click, a value typed or slid, a key that changes it; not a finger that scrolls past
   it, not Tab) or when its value changes by any other way (a random draw, a silhouette button...): the value seen the first time the mark
   is drawn is kept and compared. The notice and the tab dots count only what the page shows (a setting hidden by another one, step 4 where
   it exists); a hidden mark shows once its setting does. A full state holds at least 60% of the settings of the tabs (every export and saved
   page since v125 holds 70% or more of today's; the tests' states 47 keys at most): a partial one, written by hand, marks nothing. */
var SD_NEW_KEY = "fiche-perso-seedance-new-v1",
  sdNewSet = null,
  sdNewWrapSet = {};
/* marks: { key: the value first drawn with the mark (JSON), or null before it is drawn } */
function sdNewLoad() {
  if (sdNewSet) return sdNewSet;
  sdNewSet = {};
  try {
    var a = JSON.parse(localStorage.getItem(SD_NEW_KEY) || "{}");
    a &&
      "object" == typeof a &&
      !Array.isArray(a) &&
      Object.keys(a).forEach(function (k) {
        sdNewSet[k] = "string" == typeof a[k] ? a[k] : null;
      });
  } catch (x) {}
  for (var k in sdNewSet) sdNewWrapSet[k] = 1;
  return sdNewSet;
}
function sdNewSave() {
  try {
    Object.keys(sdNewSet || {}).length ? localStorage.setItem(SD_NEW_KEY, JSON.stringify(sdNewSet)) : localStorage.removeItem(SD_NEW_KEY);
  } catch (x) {}
}
function sdNewHas(k) {
  return k in sdNewLoad();
}
function sdFieldKeys() {
  var o = {};
  [t2, t3, t4].forEach(function (tabs) {
    (tabs || []).forEach(function (tb) {
      (tb.items || []).forEach(function (it) {
        it && "string" == typeof it.k && it.k in tJ && (o[it.k] = 1);
      });
    });
  });
  return Object.keys(o);
}
/* the settings a full older state does not hold, and "card:fin" when it predates "Finition photo" */
function sdNewMissing(raw) {
  if (!raw || "object" != typeof raw || Array.isArray(raw)) return [];
  var f = sdFieldKeys(),
    m = f.filter(function (k) {
      return !(k in raw);
    });
  if (f.length - m.length < 0.6 * f.length) return [];
  "sdFinTg" in raw || m.push("card:fin");
  return m;
}
/* at start-up (ac with no file): the marks of an older saved page join the ones kept; an import sets its own (sdIoApply) */
function sdNewSeen(raw, isImport) {
  try {
    if (!isImport) {
      var m = sdNewMissing(raw);
      if (m.length) {
        sdNewLoad();
        m.forEach(function (k) {
          k in sdNewSet || (sdNewSet[k] = null);
          sdNewWrapSet[k] = 1;
        });
        sdNewSave();
      }
    }
  } catch (x) {}
  return raw;
}
function sdNewSetAll(m) {
  sdNewLoad();
  sdNewSet = {};
  sdNewWrapSet = {};
  (m || []).forEach(function (k) {
    sdNewSet[k] = null;
    sdNewWrapSet[k] = 1;
  });
  sdNewSave();
}
function sdNewClear(k, node) {
  if (!sdNewHas(k)) return;
  delete sdNewSet[k];
  sdNewSave();
  node && node.style && (node.style.borderLeftColor = "transparent");
}
/* the tab settings the page shows now (the tabs of the current type, each with its own condition) */
function sdNewShown() {
  var tabs = "object" === e.mode ? t3 : "animal" === e.mode ? t4 : t2,
    o = {};
  (tabs || []).forEach(function (tb) {
    (!tb.show || tb.show()) &&
      (tb.items || []).forEach(function (it) {
        it && "string" == typeof it.k && (!it.show || it.show()) && (o[it.k] = 1);
      });
  });
  return o;
}
function sdNewTabOn(tb) {
  return (tb.items || []).some(function (it) {
    return it && "string" == typeof it.k && sdNewHas(it.k) && (!it.show || it.show());
  });
}
/* what the notice counts: the shown settings, and step 4 where it exists */
function sdNewCounts() {
  var sh = sdNewShown(),
    f = Object.keys(sdNewLoad()).filter(function (k) {
      return "card:fin" !== k && sh[k];
    }).length;
  return { f: f, fin: sdNewHas("card:fin") && sdFinOn(e) };
}
function sdNewCount() {
  var c = sdNewCounts();
  return c.f + (c.fin ? 1 : 0);
}
/* the field renderer of the tabs (M), wrapped: a marked setting gets its bar; the wrapper stays for the session once there, so touching a
   slider never remounts it mid-drag */
function sdNewM(M) {
  return function (r) {
    return sdNewWrap(r, M(r));
  };
}
var SD_NEW_NOKEY = ["Tab", "Shift", "Control", "Alt", "Meta", "Escape", "CapsLock", "ContextMenu"];
function sdNewWrap(r, el) {
  var k = r && r.k;
  if (!el || "string" != typeof k || (sdNewLoad(), !sdNewWrapSet[k])) return el;
  var on = sdNewHas(k);
  if (on) {
    /* the value first drawn with the mark; any other value since (set from elsewhere) takes the mark away */
    var cur = JSON.stringify(void 0 === e[k] ? null : e[k]);
    null === sdNewSet[k] ? ((sdNewSet[k] = cur), sdNewSave()) : sdNewSet[k] !== cur && (sdNewClear(k), (on = !1));
  }
  var go = function (ev) {
    sdNewClear(k, ev.currentTarget);
  };
  return (0, l.jsxs)(
    "div",
    {
      "data-sd-new": k,
      title: on ? sdT("Nouveau réglage : absent de ton fichier, il est sur sa valeur par défaut. Touche-le pour retirer la marque.", "New setting: not in your file, it is on its default value. Touch it to remove the mark.") : void 0,
      style: { borderLeft: "3px solid " + (on ? "hsl(var(--destructive))" : "transparent"), paddingLeft: 12, marginLeft: -15 },
      onClickCapture: go,
      onInputCapture: go,
      onChangeCapture: go,
      onKeyDownCapture: function (ev) {
        SD_NEW_NOKEY.indexOf(ev.key) < 0 && go(ev);
      },
      children: [
        on
          ? (0, l.jsx)("span", {
              style: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" },
              children: sdT("Nouveau réglage, sur sa valeur par défaut.", "New setting, on its default value."),
            })
          : null,
        el,
      ],
    },
    k,
  );
}
/* the red dot of a tab that shows a marked setting */
function sdNewTab(tab) {
  return tab && sdNewTabOn(tab)
    ? (0, l.jsx)("span", {
        "data-sd-new-tab": "1",
        "aria-hidden": "true",
        style: { display: "inline-block", width: 8, height: 8, borderRadius: 999, background: "hsl(var(--destructive))", marginLeft: 6, verticalAlign: "middle" },
      })
    : null;
}
/* the line under Exporter / Importer while shown marks remain */
function sdNewNotice(h) {
  var c = sdNewCounts(),
    f = c.f,
    fin = c.fin;
  if (!f && !fin) return null;
  return (0, l.jsxs)("div", {
    id: "sd-new-notice",
    role: "status",
    /* the red edge inline: design.css gives every bordered rounded-xl box the light edge */
    className: "w-full rounded-xl border bg-card p-3 text-sm",
    style: { borderColor: "hsl(var(--destructive))" },
    children: [
      (0, l.jsx)("p", {
        children: sdT(
          "Nouveautés depuis ton fichier ou ta version précédente du HTML : " +
            (f ? f + (f > 1 ? " réglages, marqués" : " réglage, marqué") + " d'une barre rouge (leur onglet a un point rouge), sur leur valeur par défaut" : "") +
            (f && fin ? " ; " : "") +
            (fin ? "l'étape 4, « Finition photo »" : "") +
            ". Règle-les ou laisse-les ; une marque s'enlève dès que tu touches le réglage.",
          "New since your file or your previous version of the HTML: " +
            (f ? f + (f > 1 ? " settings, marked" : " setting, marked") + " with a red bar (their tab has a red dot), on their default value" : "") +
            (f && fin ? "; " : "") +
            (fin ? "step 4, “Final photo pass”" : "") +
            ". Set them or leave them; a mark goes as soon as you touch the setting.",
        ),
      }),
      (0, l.jsx)("button", {
        type: "button",
        className: "mt-2 inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        onClick: function () {
          sdNewSetAll([]);
          h(sdT("Marques retirées.", "Marks removed."));
        },
        children: sdT("Retirer les marques", "Remove the marks"),
      }),
    ],
  });
}
