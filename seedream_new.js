var sdLang = "fr";
function sdT(fr, en) {
  return "en" === sdLang ? en : fr;
}
function sdNum(n) {
  return n.toLocaleString("en" === sdLang ? "en-US" : "fr-FR");
}
/* ===== Seedream 5.0 : constructeurs de prompts (Personne, Photo, sans photo de départ, création) ===== */
var SD_MSG = "Seedream gère pour l'instant les personnes, en style Photo, sans photo de départ. Pour ce cas, passe sur GPT Image 2.5.";
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
var sdHeadCopySeq = 0;
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
function sdBodyCopyMsg(t) {
  if (nw())
    return t.sdShapeRef
      ? sdT("Copié. Dans Seedream, ajoute ton image guide comme image 1.", "Copied. In Seedream, add your shape guide as image 1.")
      : "";
  var cur = "object" === t.mode ? "" : as(),
    f = rU("tete");
  if (!t.sdHeadSig)
    return sdT(
      "Copié. Il manque la planche tête : crée-la d'abord, puis ajoute-la comme image 1 dans Seedream.",
      "Copied. The head sheet is missing: create it first, then add it as image 1 in Seedream.",
    );
  if (t.sdHeadSig !== cur)
    return sdT(
      "Copié. Ta planche tête n'est plus à jour : refais-la, puis ajoute-la comme image 1.",
      "Copied. Your head sheet is out of date: make it again, then add it as image 1.",
    );
  return nv()
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
    "the swimwear is replaced by a thin, stretchy, opaque cobalt-blue short-sleeve jersey t-shirt, ankle-length cobalt-blue leggings and plain white training shoes; the fabric clings to " +
    p +
    " exact silhouette from image 1 like a second skin, so every visible outline stays where it is: the " +
    (m ? "chest keeps its volume and shape" : "bust keeps its volume" + ("low" === e.bustShape && e.chest >= 2 ? ", its low hang and its lowest point" : " and its shape")) +
    ", the glutes and legs keep their shape; a single layer, plain hem at the hips, nothing structured underneath"
  );
}
function sdPresetHeads() {
  var p = sdPos();
  return (
    "the empty space above each body is filled with " +
    p +
    " head and neck, copied from the head reference sheet in image 2: the front face above the front-facing body, " +
    p +
    " profiles above the side bodies, the rear of " +
    p +
    " head above the rear body; same face, hair and skin tone as image 2, joined seamlessly to each neck"
  );
}
function sdPos() {
  return "f" === e.pres ? "her" : "m" === e.pres ? "his" : "their";
}
function sdCov() {
  var c = e.refCover;
  if ("tanga" === c || "beach" === c) return "m" === e.pres ? "swim" : "tanga";
  if ("brief" === c) return "m" === e.pres ? "brief" : "swim";
  if ("m" === e.pres && "onepiece" === c) return "swim";
  return c;
}
function sdShownCover(t) {
  var c = t.refCover;
  if ("tanga" === c) return "seedream" === t.model && "m" !== t.pres ? "tanga" : "swim";
  if ("brief" === c) return "seedream" === t.model && "m" === t.pres ? "brief" : "swim";
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
  return sdAutoBust(sdRndOutfit("seedream" !== t.model && ("tanga" === t.refCover || "brief" === t.refCover) ? Object.assign({}, t, { refCover: "swim" }) : t));
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
function sdLooks() {
  if (e.looks >= 2)
    return t6(t1("looks", e.looks)) + ", with the asymmetry of a real face.";
  var b = "f" === e.pres ? "Beautiful" : "m" === e.pres ? "Handsome" : "Good-looking";
  return (
    (0 === e.looks
      ? b + " in a natural, individual way, like a real model in an unretouched agency polaroid"
      : "Attractive in a natural, everyday way") +
    ", with the slight asymmetry of a real face; an original person who resembles no celebrity."
  );
}
function sdSkinHead() {
  var x = [
    [
      "Smooth skin that still shows fine pores",
      "Natural skin: fine pores, slight unevenness",
      "Real, unretouched skin: visible pores on the nose and cheeks, slight redness around the nostrils, small blemishes, slightly uneven tone, faint shadows under the eyes",
      "Clearly imperfect skin: visible pores, blemishes, redness, under-eye shadows, uneven tone",
      "Rough skin: acne scars, broken capillaries, under-eye bags, blotchy tone",
    ][e.imperf] || "Natural skin with fine pores",
  ];
  e.imperf >= 1 &&
    x.push(
      "fine peach fuzz catching the light on the cheeks and jaw",
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
      "Unretouched studio photograph, 16:9 landscape, four equal vertical panels separated by thin mid-grey gaps: an identity reference sheet of one " +
      sdWho() +
      ", the same person in all four panels.\nFirst panel: front view, looking straight into the lens. Second panel: three-quarter view, " +
      p +
      " face turned toward the left edge of the frame. Third panel: exact profile facing the left edge of the frame, showing the left side of " +
      p +
      " face and " +
      p +
      " left ear. Fourth panel: back view, the back of " +
      p +
      " head seen straight from behind, no face visible" +
      ("bald" === e.hairStyleSel || "shaved" === e.hairLen
        ? ""
        : ["ponytail", "bun", "braid"].indexOf(e.hairStyleSel) >= 0
          ? ", showing how the hair is gathered at the back: its length, the parting and the tie"
          : ["boxbraids", "cornrows", "locs", "twists", "afro", "undercut", "mohawk", "receding"].indexOf(e.hairStyleSel) >= 0
            ? ", showing the hairstyle from behind, its length and pattern"
            : ", showing how the hair falls at the back, its length and parting, worn down with no tie or clip") +
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
    "Plain seamless mid-grey backdrop. One large soft key light from camera left, slightly above eye level, with a weak fill on the right, so the far cheek and the side of the nose keep gentle shadow and the skin texture reads; the same fixed light in all four panels. 85mm lens at eye level, the whole head in sharp focus.\n\n";
  s +=
    sdSkinHead() +
    " Natural colors, fine film grain, not airbrushed, not a 3D render. No text, labels or watermark.";
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
      (r >= 1.35 ? "; the crotch is clearly above the middle of the panel." : ".")
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
  var ab = !nw() && nv() ? "" : sdAbs();
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
    x.push("The " + sdList(so) + " stay soft, shaped by gravity.");
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
  !nw() &&
    nv() &&
    (a = a.filter(function (x) {
      return !/navel/.test(x);
    }));
  a = a.map(function (x) {
    return cv[x] || x;
  });
  return "Body details: " + a.join(", ") + ".";
}
function sdSkinBody() {
  var s =
      t6(t7("skin")) +
      " everywhere, as on the face" +
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
      " Healthy skin of a " + e.age + "-year-old, not older.");
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
    return "Outfit, the same in every view: a thin, soft, fitted cobalt-blue short-sleeve jersey t-shirt with nothing structured underneath, a single layer with a plain hem at the hips covering the waistband, no seams, bands or layers across the front; ankle-length cobalt-blue leggings and plain white training shoes. Opaque, plain, no logos.";
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
function sdIterText() {
  var c = String(e.sdIter || "").trim().replace(/[.\s]+$/, ""),
    lc = c.toLowerCase(),
    w = sdWho(),
    keep = [
      [/\b(views?|fram\w*|scale|panels?)\b/, "the four views, the framing and scale"],
      [/\b(size|weight|proportions?|height|taller|shorter|slimmer|thinner|fatter|heavier overall|waist|narrower|wider)\b/, "the body's size, weight and proportions"],
      [/\b(breasts?|bust|chest|nipples?)\b/, "m" === e.pres ? "the chest" : "the breasts' size, shape and hang"],
      [/\b(glutes?|butt\w*|crease)\b/, "the glutes"],
      [/\b(hips?|thighs?|legs?|saddlebags?|knees?|calf|calves)\b/, "the hips and legs"],
      [/\b(arms?|shoulders?|back|muscles?|muscular|abs|abdom\w*|veins?|biceps|triceps|forearms?)\b/, "the muscles"],
      [/\b(skin|tan|cellulite|pores?|freckles?|marks?|scars?)\b/, "the skin"],
      [/\b(outfit|bikini|top|tanga|fabric|triangles?|swim\w*|shorts|clothing|clothes|dress\w*|t-?shirts?|shirts?|leggings?|pants|trousers|jeans|skirts?|jackets?|shoes|sneakers|boots|wear\w*|socks?)\b/, "the outfit"],
      [/\b(light\w*|shadows?)\b/, "the light"],
      [/\b(backdrop|background|grey|gray)\b/, "the backdrop"],
      [nw() ? /^$/ : /\b(face|faces|hair|head|heads|eyes|nose|mouth|expression)\b/, nw() ? "" : sdPos() + " face and hair"],
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
function sdIterBlock(t, g, B, L) {
  return (0, l.jsxs)(l.Fragment, {
    children: [
      (0, l.jsxs)("label", {
            className: "flex items-start gap-2 rounded-2xl border bg-card p-4 text-sm",
            children: [
              (0, l.jsx)("input", {
                type: "checkbox",
                className: "mt-1",
                checked: !!t.sdShapeRef,
                onChange: (ev) => g("sdShapeRef", ev.target.checked),
              }),
              (0, l.jsxs)("span", {
                children: [
                  (0, l.jsx)("b", { children: "J'ajoute une image guide de forme" }),
                  (0, l.jsx)("span", {
                    className: "block text-muted-foreground",
                    children: "Pour la planche corps : un croquis ou une photo habillée qui montre la forme de poitrine voulue. Souvent plus efficace que les mots, sans garantie.",
                  }),
                ],
              }),
            ],
          }),
      (0, l.jsxs)("div", {
        className: "rounded-2xl border bg-card p-4",
        children: [
          (0, l.jsx)("label", {
            htmlFor: "sd-iter",
            className: "font-bold",
            children: "Retoucher une planche validée",
          }),
          (0, l.jsx)("p", {
            className: "mt-1 text-sm text-muted-foreground",
            children:
              "Change un détail sans refaire tout le corps. Écris seulement le changement, en anglais de préférence, ou choisis une retouche toute prête.",
          }),
          (0, l.jsx)("div", {
            className: "mt-3 flex flex-wrap gap-2",
            children: [
              ["dress", "Habiller en tenue de sport", sdPresetDress()],
              ["heads", "Ajouter les têtes", sdPresetHeads()],
            ].map(function (b) {
              var on = t.sdIterOp === b[0];
              return (0, l.jsxs)(
                "button",
                {
                  type: "button",
                  "aria-pressed": on,
                  onClick: () => (on ? g("sdIterOp", "") : (g("sdIter", b[2]), g("sdIterOp", b[0]))),
                  className:
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium cursor-pointer select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                    (on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-foreground/40"),
                  children: [on ? (0, l.jsx)(tB, { size: 14 }) : null, b[1]],
                },
                b[0],
              );
            }),
          }),
          (0, l.jsx)("textarea", {
            id: "sd-iter",
            className: L + " min-h-[88px] resize-y",
            placeholder: "Le changement, ex. sharper biceps and triceps",
            value: t.sdIter || "",
            onChange: (e) => (g("sdIter", e.target.value), e.target.value.trim() || g("sdIterOp", "")),
          }),
        ],
      }),
      B("iter", "3", "Retouche", !String(t.sdIter || "").trim(), "Écris d'abord le changement."),
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
      (nv()
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
    (hl || !nv()) &&
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
    (e.fat <= 1 ? ("m" !== e.pres && e.chest >= 3 ? "Apart from the bust, a slim frame" : "A slim frame") + ": " + (function (a, l) {
      return a && l ? "slender arms and legs, " : a ? "slender arms, " : l ? "slender legs, " : "";
    })(
      ["big", "huge"].indexOf(e.biceps) < 0 && ("auto" !== e.biceps || e.muscle <= 2),
      e.thighs <= 2 && e.fatLower <= 1 && ("none" === e.saddle || "light" === e.saddle) && e.muscle <= 2,
    ) + "visible collarbones" + (nw() || !nv() ? " and hip bones" : "") + (e.fatLower <= 1 && ("none" === e.saddle || "light" === e.saddle) ? ", no extra padding" : "") + ". " : "") +
    t6(
      hl
        ? sdBust()
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
function sdWrap(t, m) {
  if ("seedream" !== t.model) return m;
  var o = {},
    k;
  if (!sdOk(t)) {
    for (k in m) o[k] = sdMsg(t);
    return o;
  }
  for (k in m) o[k] = m[k];
  o.head = sdHead();
  o.body = sdBody();
  o.iter = String(t.sdIter || "").trim() ? sdIterText() : "";
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
          ? "Image 1 : ton image guide de forme"
          : "Aucune image"
        : (0, l.jsxs)("span", {
            children: nv()
              ? ["Image 1 : la planche tête (", R(rU("tete")), "). Image 2 : ta planche habillée (Retouche, « Habiller »).", t.sdShapeRef ? " L'image guide ne sert pas ici." : ""]
              : ["Image 1 : la planche tête (", R(rU("tete")), ")", t.sdShapeRef ? ". Image 2 : ton image guide de forme." : "."],
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
      "heads" === e.sdIterOp
        ? "Image 1 : ta planche habillée, agrandie de 25 % vers le haut. Image 2 : la planche tête."
        : "dress" === e.sdIterOp
          ? "Image 1 : ta planche corps sans tête, en maillot"
          : "Image 1 : la planche à retoucher",
    ],
    ["Format", "Identique à l'image 1"],
    [N, "Même nom + _v2, _v3…"],
  ];
  return o;
}
