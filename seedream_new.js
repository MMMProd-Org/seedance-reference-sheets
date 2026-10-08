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
var SD_MSG = "Seedream gère pour l'instant les personnes, en style Photo, sans photo de départ. Pour tout autre cas, passe sur GPT Image 2.5.";
function sdMsg(t) {
  /* translated here: the message is also shown in the prompt box, which the render-time translation skips */
  return sdTr(
    t && "person" === t.mode && t.photo
      ? "Seedream ne part pas d'une photo. Pour garder un corps existant, décoche « Partir d'une photo » et passe par « Retoucher une planche validée »."
      : SD_MSG,
  );
}
function sdOk(t) {
  return (
    "person" === t.mode &&
    "photo" === t.style &&
    !t.photo &&
    !(t.locked && t.base && t.base.mode === t.mode)
  );
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
  return [
    "Pour créer un personnage d'après la photo d'une personne réelle, uniquement avec son accord. Les planches reprennent son visage et ses cheveux, et son corps avec « Garder le corps tel quel ».",
    "Pas besoin pour le corps entier : ta planche tête suffit, ajoute-la comme image 1 dans le générateur.",
    "seedream" === t.model ? "Disponible avec GPT Image 2.5 uniquement." : "Ajoute la photo à chaque planche dans ta conversation GPT.",
  ].map(function (x, i) {
    return (0, l.jsx)("span", { style: { display: "block", marginTop: i ? "0.45rem" : 0 }, children: x }, i);
  });
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
        : sdT("Copié. Dans Seedream, ajoute la planche à retoucher (image 1).", "Copied. In Seedream, add the sheet to retouch (image 1).");
}
function sdBodyCopyMsg(t) {
  if (nw())
    return t.sdShapeRef
      ? sdT("Copié. Dans Seedream, ajoute ton image guide comme image 1.", "Copied. In Seedream, add your shape guide as image 1.")
      : "";
  var f = rU("tete");
  if (!t.sdHeadSig)
    return sdT(
      "Copié. Il manque la planche tête : crée-la d'abord, puis ajoute-la comme image 1 dans Seedream.",
      "Copied. The head sheet is missing: create it first, then add it as image 1 in Seedream.",
    );
  var st = sdSigState(t.sdHeadSig);
  if ("changed" === st)
    return sdT(
      "Copié. Ta planche tête n'est plus à jour : refais-la, puis ajoute-la comme image 1.",
      "Copied. Your head sheet is out of date: make it again, then add it as image 1.",
    );
  if ("legacy" === st)
    return sdT(
      "Copié. Ta planche tête vient d'une version précédente de l'outil : refais-la seulement si tu as changé la corpulence depuis, sinon ajoute-la comme image 1.",
      "Copied. Your head sheet comes from an earlier version of the tool: make it again only if you changed the build since, otherwise add it as image 1.",
    );
  return sdUseBodyImg()
    ? sdT(
        "Copié. Dans Seedream, ajoute la planche tête (" + f + ") comme image 1 et ta planche habillée comme image 2.",
        "Copied. In Seedream, add the head sheet (" + f + ") as image 1 and your dressed sheet as image 2.",
      )
    : t.sdShapeRef
      ? sdT(
          "Copié. Dans Seedream, ajoute la planche tête (" + f + ") comme image 1 et ton image guide comme image 2.",
          "Copied. In Seedream, add the head sheet (" + f + ") as image 1 and your shape guide as image 2.",
        )
      : sdT(
          "Copié. Dans Seedream, ajoute la planche tête (" + f + ") comme image 1.",
          "Copied. In Seedream, add the head sheet (" + f + ") as image 1.",
        );
}
function sdPresetDress() {
  var p = sdPos(),
    m = "m" === e.pres;
  return (
    "the outfit is replaced by a thin, stretchy, opaque cobalt-blue sleeveless cropped top with a modest round neckline and armholes that hug the shoulder joints, ending just above the navel, mid-rise ankle-length cobalt-blue leggings with the waistband a few fingers below the navel, and plain white training shoes; the fabric clings to " +
    p +
    " exact silhouette from image 1 like a second skin, so every visible outline stays where it is: the " +
    (m ? "chest keeps its volume and shape" : "bust keeps its volume" + ("low" === e.bustShape && e.chest >= 2 ? ", its low hang and its lowest point" : " and its shape")) +
    ", the glutes and legs keep their shape; the arms and shoulders stay bare, and the waist and navel stay visible between the top's hem and the leggings; the top is medium-weight opaque jersey, double-layered at the front and smooth over the bust so no detail shows through, no padding"
  );
}
function sdPresetJoin() {
  var p = sdPos(),
    who = (+e.age || 30) + "-year-old " + ((+e.age || 30) < 21 ? "adult " : "") + ("m" === e.pres ? "man" : "f" === e.pres ? "woman" : "person");
  return (
    "Combine these two reference sheets into one full-body reference sheet of this " +
    who +
    ": image 1 is " +
    p +
    " body, image 2 is " +
    p +
    " head. Keep the four views and their order from image 1 (front, left side, back, right side) and put the matching head from image 2 on each body: the front face on the front view; on the left side view, the left profile from image 2; on the right side view, the right side of the face as shown in the three-quarter view of image 2, turned to an exact profile facing the right edge, never a mirror image of the left profile; the back of the head on the back view. Keep the body, outfit, proportions, skin texture and light of image 1 exactly, and the face and hair of image 2 exactly. Skin tone: image 2's tone over the whole body, so the neck shows no seam. Whole figure in every panel, hair to feet, same scale and floor line, plain mid-grey backdrop, thin grey gaps between the panels. No text or watermark."
  );
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
  if ("sport" === c) return "m" !== e.pres ? "sport" : "short";
  if (("swim" === c || "short" === c) && "m" !== e.pres) return "sport";
  if ("tanga" === c || "beach" === c) return "m" !== e.pres ? (sdRevealOk(e) ? "tanga" : "sport") : "swim";
  if ("brief" === c) return "m" === e.pres && sdRevealOk(e) ? "brief" : "swim";
  if ("m" === e.pres && "onepiece" === c) return "swim";
  return c;
}
function sdShownCover(t) {
  var c = t.refCover;
  if ("sport" === c) return "seedream" === t.model && "m" !== t.pres ? "sport" : "short";
  if (("swim" === c || "short" === c) && "seedream" === t.model && "m" !== t.pres) return "sport";
  if ("tanga" === c) return "seedream" === t.model && "m" !== t.pres ? (sdRevealOk(t) ? "tanga" : "sport") : "swim";
  if ("brief" === c) return "seedream" === t.model && "m" === t.pres && sdRevealOk(t) ? "brief" : "swim";
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
    o = null;
  ["top", "bottom", "shoes", "acc"].forEach(function (k) {
    if (!re.test(String(t[k] || ""))) return;
    o = o || Object.assign({}, t);
    o[k] = (t[k + "Sel"] || []).length ? "" : sdPickItem(t, k, "");
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
            "Tenue au hasard selon l'âge",
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
                        "Choisis une ambiance : la tenue s'adapte à l'âge (" + (+t.age || 30) + " ans).",
                        "Pick a mood: the outfit fits the age (" + (+t.age || 30) + ").",
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
    sc = (a <= 25 ? 0 : a <= 35 ? 1 : a <= 50 ? 2 : a <= 65 ? 3 : 4) + (t.chest >= 4 ? 2 : 3 === t.chest ? 1 : 0) + (t.fat >= 3 ? 1 : 0),
    tier = sc <= 1 ? "young" : sc <= 3 ? "natural" : sc <= 5 ? "moderate" : "marked";
  return Object.assign({}, t, {
    bustShape: { young: "round", natural: "pear", moderate: "low", marked: "low" }[tier],
    sdAutoTier: tier,
  });
}
function sdG(t) {
  return sdAutoBust(sdShift(sdRndOutfit("seedream" !== t.model && ("tanga" === t.refCover || "brief" === t.refCover || "sport" === t.refCover) ? Object.assign({}, t, { refCover: "sport" === t.refCover ? "short" : "swim" }) : t)));
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
/* "same", "changed", or "legacy": a signature saved before v90 has no corpulence class; when everything it does hold
   still matches, only that class is unknown, so the tool says so instead of announcing a changed face */
function sdSigState(saved) {
  if (!saved) return "none";
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
      "Real, unretouched skin: visible pores on the nose and cheeks, slight redness around the nostrils, small blemishes, slightly uneven tone, faint shadows under the eyes",
      "Clearly imperfect skin: enlarged pores on the nose and cheeks, several small spots and blemishes, redness around the nose and chin, dark under-eye circles, an oily shine on the forehead and nose, an uneven, slightly blotchy tone",
      "Rough skin: acne scars, a few active spots, broken capillaries, under-eye bags, an oily shine, a blotchy tone",
    ][e.imperf] || "Natural skin with fine pores",
  ];
  e.imperf >= 1 &&
    x.push(
      e.looks >= 2 ? "fine peach fuzz on the cheeks and jaw" : "fine peach fuzz catching the light on the cheeks and jaw",
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
          ("auto" === e.jaw ? ("m" === e.pres ? "a strong, projected chin, " : "a gently projected chin, ") : "") +
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
  var f = sdFace();
  f && (s += f + "\n");
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
      ? " Accurate, neutral colors and sharp detail, not airbrushed, not a 3D render. No text, labels, scale bars, markings or watermark."
      : " Natural colors, fine film grain, not airbrushed, not a 3D render. No text, labels or watermark.");
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
function sdBust() {
  if ("m" === e.pres) return t1("pecs", e.chest);
  var c = e.chest,
    size =
      [
        "a completely flat chest",
        "a very small bust, almost flat in profile",
        "a medium bust",
        "low" === e.bustShape && "moderate" !== e.sdAutoTier
          ? "large, heavy, low-hanging saggy breasts"
          : "low" === e.bustShape
            ? "a large, soft natural bust"
          : "pear" === e.bustShape
            ? "a large, heavy natural bust"
            : "conical" === e.bustShape
              ? "a large, generous natural bust"
              : "a large, full natural bust",
        "a very large, heavy natural bust",
      ][c] || "a medium bust",
    cup = ["", "", "B to C", "D to E", "F or larger"][c] || "",
    sh =
      c >= 1
        ? {
            round: "a rounded shape" + ("young" === e.sdAutoTier ? ", naturally full and firm" : ""),
            high: "a high-set shape",
            low:
              c >= 3 && "moderate" === e.sdAutoTier
                ? "soft, with a visible natural drop: the upper chest slightly emptied below the collarbones, the volume settled in the lower half, the lowest point near the bottom of the ribcage; never round, firm or high"
                : c >= 3
                ? "long, soft and slightly deflated, hanging from an empty, flat upper chest, the nipples pointing down, the lowest point only a hand's width above the navel, resting on the ribs; in profile they hang down rather than out; slightly uneven, the left one a little lower; never round, firm, high or balloon-like"
                : 2 === c
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
                ? "pear-shaped, hollow above and full below: in profile the upper slope from the chest down to the fullest point is slightly hollow, a concave upper pole, then a deep, round, full curve below it, a convex lower pole holding most of the volume; from the front narrow at the top, no fullness near the collarbones; the upper part slightly deflated, as often on lean athletic women; the lowest point near the bottom of the ribcage; natural and unenhanced, never implant-like, round all over, high or balloon-like"
                : "small, flatter at the top, the little volume sitting in the lower half",
            wide: "wide-set, about a hand's width apart at the center, each side angled slightly outward",
            asym: "clearly asymmetric, the left side visibly fuller and slightly lower than the right in every view",
          }[e.bustShape]
        : "";
  return (
    size +
    (cup ? " (about " + (/^F/.test(cup) ? "an " : "a ") + cup + " cup)" : "") +
    (c >= 3 && ["low", "conical"].indexOf(e.bustShape) < 0 ? " with a wide base" : "") +
    (3 === c && ["pear", "conical"].indexOf(e.bustShape) >= 0 ? ", clearly larger than average" : "") +
    (sh ? ", " + sh : "")
  );
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
function sdMus() {
  var z = function (k, m) {
      return m[rP(k)] || "";
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
        strong: "very marked arms: deep grooves between biceps and triceps that hollow the upper arms, " + ("none" !== rP("defShoulders") ? "the shoulder cap clearly separated, " : "") + "every forearm muscle and tendon visible" + (["big", "huge"].indexOf(e.biceps) < 0 ? ", not bulky" : ""),
      }),
      leg[rO()] || "",
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
  var cv = e.fat <= 1
    ? { "softly padded collarbones": "clearly visible collarbones", "low, full calves": "slim calves" }
    : e.fat >= 3
      ? { "clearly visible collarbones": "softly padded collarbones", "bony, clearly drawn knees": "soft, rounded knees", "high calves with long lower tendons": "low, full calves", "slim ankles": e.fat >= 4 ? "sturdy ankles" : "slim ankles" }
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
      "Fully dressed in this outfit in every panel; the body shapes above read through the fit of the clothes."
    );
  if (!nw())
    return (
      "Outfit, the same in every view: a fitted cobalt-blue sleeveless cropped top in medium-weight, opaque cotton jersey, with a modest round neckline and armholes that hug the shoulder joints, so the arms and shoulders are bare; it covers the whole chest" +
      ("m" !== e.pres && e.chest >= 2
        ? " and follows the natural size, shape and position of the bust like a fitted T-shirt, without flattening or lifting it"
        : "") +
      ", double-layered at the front and lying smooth over the bust so no detail shows through, no padding, its plain hem ends just above the navel, no seams or bands across the front; seen from behind, the same top covers the upper back; mid-rise ankle-length cobalt-blue leggings whose waistband sits a few fingers below the navel, so the waist and navel show between them, the stretch fabric following the shape of the hips and glutes without flattening them; plain white training shoes. Opaque, plain, no logos."
    );
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
        : "sport" === c
            ? "a fitted cobalt-blue sleeveless cropped top in medium-weight, opaque cotton jersey, with a modest round neckline and armholes that hug the shoulder joints; it covers the whole chest" +
              (e.chest >= 2 ? " and follows the natural size, shape and position of the bust like a fitted T-shirt, without flattening or lifting it" : "") +
              ", double-layered at the front and lying smooth over the bust so no detail shows through, no padding, its plain hem ends just above the navel; seen from behind, the same top covers the upper back; fitted cobalt-blue bike shorts in thin stretch fabric, ending at mid-thigh, the stretch fabric following the shape of the hips and glutes without flattening them; barefoot"
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
  var bmi = ([17.5, 19, 23, 27, 32][e.fat] || 23) + ([0, 0, 0.5, 1.5, 3][e.muscle] || 0),
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
  var c = String(e.sdIter || "").trim().replace(/[.\s]+$/, ""),
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
  return (
    "Edit image 1, the approved body reference sheet of this " +
    w +
    ".\nPurpose: a neutral anatomy and costume-fitting reference for a film's VFX team.\nChange only this: " +
    c +
    ".\nKeep everything this change does not touch exactly as in image 1" +
    (keep.length ? ": " + sdList(keep) : "") +
    "; nothing else grows, shrinks, lifts or slims. No text or watermark."
  );
}
function sdOp(t) {
  return String(t.sdIter || "").trim() ? sdIterOpEff(t) : nw() ? "join" : "";
}
function sdIterBlock(t, g, B, L) {
  sdCur = { t: t, g: g, L: L };
  var op = sdOp(t),
    title = { join: "Assembler tête et corps", dress: "Habiller", heads: "Ajouter les têtes" }[op] || (nw() ? "Retouche" : "Retouche (facultatif)");
  return B("iter", "3", title, !String(t.sdIter || "").trim() && !nw(), "Ouvre « Autres retouches » et choisis ou écris une retouche.");
}
/* F. a case Seedream cannot do yet: one clear card with the way out */
function sdUnsup(t, n) {
  return (0, l.jsxs)("div", {
    className: "rounded-2xl border bg-card p-4",
    children: [
      (0, l.jsx)("h3", { className: "text-lg font-bold leading-tight", children: "Pas encore possible avec Seedream" }),
      (0, l.jsx)("p", { className: "mt-2 text-sm", children: sdMsg(t) }),
      (0, l.jsx)("button", {
        type: "button",
        onClick: () => n((s) => ({ ...s, model: "gpt", modelPick: 1 })),
        className:
          "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-bold tape-chip hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        children: "Passer sur GPT Image 2.5",
      }),
    ],
  });
}
function sdBarItems(t) {
  var op = String(t.sdIter || "").trim() ? sdIterOpEff(t) : "join";
  return [
    ["head", "Tête", !1],
    ["body", "Corps", !1],
    ["iter", { join: "Assembler", dress: "Habiller", heads: "Têtes" }[op] || "Retouche", !1],
  ];
}
/* options shown inside a card, folded: what you rarely need stays out of the way */
function sdFold(label, children, open) {
  return (0, l.jsxs)("details", {
    className: "mt-3 rounded-xl bg-muted px-3 py-2 text-sm",
    open: !!open,
    children: [(0, l.jsx)("summary", { className: "cursor-pointer font-semibold", children: label }), (0, l.jsx)("div", { className: "mt-2 grid gap-3", children: children })],
  });
}
function sdCardExtra(k) {
  if (!sdCur) return null;
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
                ["img", "Ma planche habillée"],
                ["text", "Mes réglages"],
              ],
            }),
          ],
        })
      : null;
  if ("body" === k)
    return [
      nw() &&
        (0, l.jsx)("p", { className: "mt-3 text-sm text-muted-foreground", children: "Recommence jusqu'à ce que le corps te convienne." }, "again"),
      (0, l.jsx)(
        "div",
        {
          children: sdFold("Option : forme de poitrine imposée par une image", [
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
    var op = sdOp(t);
    return [
      (0, l.jsx)(
        "div",
        {
          children: sdFold(
            "Autres retouches",
            [
              (0, l.jsx)(
                "div",
                {
                  className: "flex flex-wrap gap-2",
                  children: [
                    ["join", "Assembler tête et corps", sdPresetJoin()],
                    ["dress", "Habiller", sdPresetDress()],
                    ["heads", "Ajouter les têtes (canevas agrandi)", sdPresetHeads()],
                    ["", "Retouche libre", null],
                  ].map(function (b) {
                    /* a preset picked with its text is removed by a second click; "join", shown as the
                       default for a headless body while the text is empty, is filled in instead */
                    var on = op === b[0],
                      picked = on && !!String(t.sdIter || "").trim();
                    return (0, l.jsxs)(
                      "button",
                      {
                        type: "button",
                        "aria-pressed": on,
                        onClick: () => (null === b[2] ? g("sdIterOp", "") : (g("sdIter", picked ? "" : b[2]), g("sdIterOp", picked ? "" : b[0]))),
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
                    : "dress" === op
                      ? "Même corps, avec un haut court et un legging."
                      : "heads" === op
                        ? "Agrandis d'abord ta planche habillée de 25 % vers le haut, fond gris."
                        : "join" === op
                          ? "Le corps est gardé, la tête est ajoutée."
                          : "Ta retouche, écrite ci-dessous.",
                },
                "hint",
              ),
              (0, l.jsx)(
                "textarea",
                {
                  id: "sd-iter",
                  className: L + " min-h-[88px] resize-y",
                  placeholder: "Ou écris ta propre retouche, ex. sharper biceps and triceps",
                  value: t.sdIter || "",
                  onChange: (ev) => (g("sdIter", ev.target.value), ev.target.value.trim() || g("sdIterOp", "")),
                },
                "ta",
              ),
            ],
            "" === op,
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
    className: "rounded-2xl border bg-card p-4",
    children: [
      (0, l.jsxs)("div", {
        className: "flex items-center gap-3",
        children: [
          (0, l.jsx)("span", {
            className: "grid h-9 w-9 flex-none place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground",
            children: t,
          }),
          (0, l.jsx)("h3", { className: "text-lg font-bold leading-tight", children: "body" === e && nw() ? sdT("Planche corps sans tête", "Headless body sheet") : n }),
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
  "m" !== e.pres && e.chest >= 3 && "low" === e.bustShape && sf.push("breasts");
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
      " is a shape guide only: copy from it only the shape and profile of the " +
      ("m" === e.pres ? "chest" : "bust") +
      "; ignore everything else in it: its person, body size, face, skin, clothing, framing and style. Where the guide and this text differ on that shape, follow the guide.\n");
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
    (e.fat <= 1 ? ("m" !== e.pres && (e.chest >= 3 || (!hl && e.chest >= 2)) ? "Apart from the bust, a slim frame" : "A slim frame") + ": " + (function (a, l) {
      return a && l ? "slender arms and legs, " : a ? "slender arms, " : l ? "slender legs, " : "";
    })(
      ["big", "huge"].indexOf(e.biceps) < 0 && ("auto" !== e.biceps || e.muscle <= 2),
      e.thighs <= 2 && e.fatLower <= 1 && ("none" === e.saddle || "light" === e.saddle) && e.muscle <= 2,
    ) + "visible collarbones" + (nw() || !nv() ? " and hip bones" : "") + (e.fatLower <= 1 && ("none" === e.saddle || "light" === e.saddle) ? ", no extra padding" : "") + ". " : "") +
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
          : (["a flat chest", "a small bust", "a medium bust", "a large bust", "a very large bust"][e.chest] || "a medium bust") +
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
      ? "Key light from above and to the side, weak fill: crisp shadows on the muscles" +
        (["visible", "strong"].indexOf(rD()) >= 0 ? " and veins" : "")
      : d || nv()
        ? "Soft key light from slightly above and in front, gentle fill: soft shadows on the muscles"
        : "Soft, even studio light") +
    ". Long lens at hip height. Natural colors, fine film grain, not a 3D render. Five fingers per hand. No text or watermark.";
  var kp = [
    t1("shoulders", e.shoulders),
    "m" === e.pres ? "" : ["a very narrow waist", "a narrow waist", "an average waist", "a wide waist", "a very wide waist"][e.waist] || "",
    "m" === e.pres ? "" : t1("hips", e.hips),
    "m" === e.pres ? "" : ["a flat chest", "a small bust", "a medium bust", "a large bust", "a very large bust"][e.chest] || "",
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
  return "person" === t.mode && !t.photo && t.looks >= 3 ? (t.looks >= 4 ? 2 : 1) : 0;
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
function sdObjViewsSpec() {
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
function sdObjNight() {
  return sdObjPlace() && "both" === e.objTime;
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
  return s;
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
    .replace("; the aerial view from about 15 m high", "")
    .replace("; the high-angle view from a top corner of the room", "")
    .replace("No captions, labels, panel numbers or watermarks", "No captions, labels, numbers or watermarks")
    .replace(" Panels whose widths differ by more than about 10% are a missed requirement.", "");
  return s;
}
function sdObjSplit(t, m) {
  if ("object" !== t.mode) return m;
  var o = Object.assign({}, m),
    place = sdObjPlace();
  if ("string" == typeof m.obj) {
    o.obj = place ? sdPlaceOne(m.obj, 0) : sdObjOne(m.obj, 0);
    o.obj2 = place ? sdPlaceOne(m.obj, 1) : sdObjOne(m.obj, 1);
    o.obj3 = place ? sdPlaceOne(m.obj, 2) : sdObjOne(m.obj, 2);
    sdObjNight() && (o.obj4 = sdPlaceOne(m.obj, 0, !0));
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
    c = [B("obj", "1", sdT(V[0][1][0], V[0][1][1])), B("obj2", "2", sdT(V[1][1][0], V[1][1][1])), B("obj3", "3", sdT(V[2][1][0], V[2][1][1]))];
  sdObjNight() && c.push(B("obj4", "4", sdT("De nuit : même point de vue que la vue de jour choisie", "At night: same viewpoint as the chosen day view")));
  return c;
}
function sdObjBar() {
  return [
    ["obj", sdT("Copier vue 1", "Copy view 1"), !1],
    ["obj2", sdT("Copier vue 2", "Copy view 2"), !1],
  ];
}
function sdObjRow(i, t, R, I) {
  var V = sdObjViewsSpec(),
    place = sdObjPlace(),
    F = place
      ? sdT("16:9, demandé dans le prompt : vérifie l'image obtenue", "16:9, asked in the prompt: check the image you get")
      : sdT("3:2 (2:3 si l'objet est plus haut que large), demandé dans le prompt : vérifie l'image obtenue", "3:2 (2:3 if the object is taller than wide), asked in the prompt: check the image you get");
  if (3 === i)
    return [
      [
        "Joins",
        (t.photo ? sdT("Ta photo. ", "Your photo. ") : "") +
          sdT("La vue de jour à refaire de nuit : rien si elle est juste au-dessus dans la conversation, sinon joins-la", "The day view to redo at night: nothing if it is just above in the conversation, otherwise attach it"),
      ],
      ["Format", F],
      ["Nomme-la", R(rU("nuit"))],
    ];
  return [
    [
      "Joins",
      0 === i
        ? t.photo
          ? "Ta photo"
          : "Rien"
        : (0, l.jsxs)("span", {
            children: [
              t.photo ? sdT("Ta photo. ", "Your photo. ") : "",
              sdT("La vue 1 : rien si elle est juste au-dessus dans la conversation, sinon ", "View 1: nothing if it is just above in the conversation, otherwise "),
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
  return (0, l.jsxs)("span", {
    children: [
      t.photo ? sdT("Ta photo. ", "Your photo. ") : "",
      sdT("La planche de l'animal : rien si elle est juste au-dessus dans la conversation, sinon ", "The animal sheet: nothing if it is just above in the conversation, otherwise "),
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
function sdWrap(t, m) {
  if ("seedream" !== t.model) return sdAnimalSplit(t, sdObjSplit(t, sdGptPost(t, m)));
  var o = {},
    k;
  if (!sdOk(t)) {
    for (k in m) o[k] = sdMsg(t);
    return o;
  }
  for (k in m) o[k] = m[k];
  o.head = sdPlainFace(sdAdult(sdHead()), t.looks);
  o.body = sdAdult(sdBody());
  o.iter = String(t.sdIter || "").trim() ? sdAdult(sdIterText()) : nw() ? sdAdult(sdPresetJoin()) : "";
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
  if ("seedream" !== t.model) {
    for (k in o) "string" == typeof m[k] && o[k] && (o[k] = o[k].concat([["Longueur", sdLen(m[k], !1)]]));
    return o;
  }
  if (!sdOk(t)) return q;
  var F = "16:9, à choisir dans Seedream",
    J = "Images à ajouter",
    N = "Nom du fichier";
  o.head = [
    [J, "Aucune image"],
    ["Format", F],
    [N, R(rU("tete"))],
    ["Longueur", sdLen(m.head, !0)],
  ];
  o.body = [
    [
      J,
      nw()
        ? t.sdShapeRef
          ? "1. ton image guide de forme"
          : "Aucune image"
        : (0, l.jsxs)("span", {
            children: sdUseBodyImg()
              ? ["1. la planche tête (", R(rU("tete")), ") ; 2. ta planche habillée validée."]
              : ["1. la planche tête (", R(rU("tete")), ")", t.sdShapeRef ? " ; 2. ton image guide de forme." : "."],
          }),
    ],
    ["Format", F],
    [N, R(rU("corps"))],
    ["Longueur", sdLen(m.body, !0)],
  ];
  nw() ||
    o.body.push([
      "À savoir",
      (0, l.jsx)("span", {
        children:
          "Ce prompt redessine le corps : la poitrine peut changer. Pour garder ton corps validé, utilise plutôt la Retouche : « Habiller », agrandis le canevas de 25 % vers le haut, puis « Ajouter les têtes ». N'ajoute jamais une image en maillot à côté d'un visage.",
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
          ? "1 : ta planche corps sans tête validée"
          : "1 : la planche à retoucher",
    ],
    ["Format", "Identique à l'image 1"],
    [N, "Même nom + _v2, _v3…"],
  ];
  return o;
}
