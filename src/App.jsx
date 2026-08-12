import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Check, AlertTriangle, Lock, Plus, Trash2, Package, Smile, Meh, Frown, ShoppingCart, Download, Copy, ShieldAlert, Camera } from "lucide-react";
import { supabase, supabaseEnabled } from "./supabaseClient";

const COLORS = {
  bg: "#EDEAE2",       // warme, zachte off-white greige
  surface: "#FAF8F2",  // lichte surface, iets warmer dan wit
  ink: "#1F3A3E",       // diep petrol-navy i.p.v. paars-bruin
  inkSoft: "#5C6E6E",   // gedempt grijsgroen, zachte ondersteuning
  header: "#3F6E6E",   // petrol/teal — hoofdaccent uit je moodboard
  warn: "#B8542E",      // warme terracotta, blijft dicht bij origineel
  warnBg: "#F5E2D8",    // zachte perzik-achtergrond bij warn
  line: "#DAD5C7",      // subtiele warme lijnkleur
};

const CATEGORY_COLORS = {
  Groente: "#7C9B72",   // zacht salie-groen
  Fruit: "#D6883C",     // warme abrikoos/oranje
  Granen: "#C9A44A",    // mosterd/honing — direct uit je moodboard
  Eiwit: "#A2503F",     // warme baksteen-rood
  Zuivel: "#8B7AA0",    // zacht lavendel, blijft onderscheidend van teal
};

const FOODS = [
  { id: "avocado", name: "Avocado", cat: "Fruit", minAge: 6, prep: { 6: "Fijn geprakt met een vork.", 8: "In dikke sticks als vingervoedsel." }, note: "" },
  { id: "banaan", name: "Banaan", cat: "Fruit", minAge: 6, prep: { 6: "Geprakt of als dikke puree.", 8: "Halve banaan als stick om vast te houden." }, note: "" },
  { id: "zoete-aardappel", name: "Zoete aardappel", cat: "Groente", minAge: 6, prep: { 6: "Gekookt en fijn geprakt.", 9: "In zachte, gegaarde blokjes." }, note: "" },
  { id: "aardappel", name: "Aardappel", cat: "Groente", minAge: 6, prep: { 6: "Gekookt en fijngeprakt, eventueel met een klontje boter of wat melk.", 9: "In zachte, gegaarde blokjes als vingervoedsel." }, note: "Nooit rauw. Groene plekjes en uitlopers ruim wegsnijden." },
  { id: "wortel", name: "Wortel", cat: "Groente", minAge: 6, prep: { 6: "Gekookt tot heel zacht, geprakt of in puree." }, choking: "Nooit rauw of in harde stukken geven — verstikkingsgevaar. Enkel goed gaar en zacht.", note: "" },
  { id: "broccoli", name: "Broccoli", cat: "Groente", minAge: 6, prep: { 6: "Gestoomd tot zacht, als puree.", 8: "Zachte roosjes als vingervoedsel." }, note: "" },
  { id: "courgette", name: "Courgette", cat: "Groente", minAge: 6, prep: { 6: "Gestoomd en geprakt." }, note: "" },
  { id: "pompoen", name: "Pompoen", cat: "Groente", minAge: 6, prep: { 6: "Gekookt en fijngeprakt." }, note: "" },
  { id: "appel", name: "Appel", cat: "Fruit", minAge: 6, prep: { 6: "Gestoofd en geprakt (niet rauw).", 9: "Rauw geraspt of heel dun gesneden." }, choking: "Nooit rauwe stukken of partjes met schil — verstikkingsgevaar.", note: "" },
  { id: "peer", name: "Peer", cat: "Fruit", minAge: 6, prep: { 6: "Gestoofd en geprakt, of heel rijp geprakt." }, note: "" },
  { id: "perzik", name: "Perzik", cat: "Fruit", minAge: 6, prep: { 6: "Geschild en geprakt." }, note: "" },
  { id: "mango", name: "Mango", cat: "Fruit", minAge: 6, prep: { 6: "Fijn geprakt.", 8: "In zachte, dunne repen." }, note: "" },
  { id: "blauwe-bessen", name: "Blauwe bessen", cat: "Fruit", minAge: 6, prep: { 6: "Altijd platdrukken of in kwartjes snijden." }, choking: "Rond en glad — verstikkingsgevaar. Nooit heel geven, ook niet later.", note: "" },
  { id: "druiven", name: "Druiven", cat: "Fruit", minAge: 9, prep: { 9: "In de lengte in kwartjes gesneden, nooit heel." }, choking: "Klassieke verstikkingshazard. Altijd in kwartjes snijden, ook bij grotere kinderen.", note: "" },
  { id: "havermout", name: "Havermout", cat: "Granen", minAge: 6, prep: { 6: "Als papje met moedermelk/opvolgmelk of water." }, note: "" },
  { id: "volkoren-brood", name: "Volkoren brood", cat: "Granen", minAge: 6, prep: { 6: "Geroosterd in dikke soldaatjes." }, note: "Let op broodjes met hele noten of zaden erop — apart houden." },
  { id: "rijst", name: "Rijst", cat: "Granen", minAge: 6, prep: { 6: "Goed gaar gekookt, eventueel fijngeprakt." }, note: "" },
  { id: "quinoa", name: "Quinoa", cat: "Granen", minAge: 6, prep: { 6: "Goed gaar gekookt en zacht." }, note: "" },
  { id: "pasta", name: "Volkoren pasta", cat: "Granen", minAge: 8, prep: { 8: "Goed gaar, grote pastavormen als vingervoedsel." }, note: "" },
  { id: "kip", name: "Kip", cat: "Eiwit", minAge: 6, prep: { 6: "Goed gaar, fijngeprakt of gemalen.", 9: "In dradige stukjes." }, choking: "Altijd controleren op botjes.", note: "" },
  { id: "rundvlees", name: "Rundsgehakt", cat: "Eiwit", minAge: 6, prep: { 6: "Goed gaar gebakken, fijngeprakt." }, note: "" },
  { id: "vis", name: "Witte vis / zalm", cat: "Eiwit", minAge: 6, prep: { 6: "Goed gaar, fijngeprakt." }, choking: "Zorgvuldig controleren op graten.", allergen: true, note: "Mogelijk allergeen — start met een klein beetje en observeer." },
  { id: "ei", name: "Ei", cat: "Eiwit", minAge: 6, prep: { 6: "Volledig gaar (geen lopend eigeel), geprakt of als reepjes omelet." }, allergen: true, note: "Belangrijk allergeen — vroeg introduceren wordt net aangeraden. Bij eczeem of familiale allergie: overleg eerst met je kinderarts." },
  { id: "linzen", name: "Linzen", cat: "Eiwit", minAge: 6, prep: { 6: "Goed gaar gekookt en fijngeprakt." }, note: "" },
  { id: "kikkererwten", name: "Kikkererwten", cat: "Eiwit", minAge: 6, prep: { 6: "Gaar en goed geprakt (velletjes kunnen blijven plakken)." }, choking: "Hele kikkererwten kunnen verstikkingsgevaar geven — goed prakken.", note: "" },
  { id: "pindakaas", name: "Pindakaas (glad)", cat: "Eiwit", minAge: 6, prep: { 6: "Dun uitgesmeerd op brood of aangelengd met wat water/puree — nooit een lepel dik." }, allergen: true, choking: "Nooit een klodder pure pindakaas geven — plakt en verstikt.", note: "Belangrijk allergeen. Vroege introductie wordt aangeraden. Bij eczeem of familiale allergie: overleg eerst met je kinderarts of Kind en Gezin." },
  { id: "yoghurt", name: "Volle natuuryoghurt", cat: "Zuivel", minAge: 6, prep: { 6: "Puur, zonder toegevoegde suiker." }, note: "Zuivel als voeding mag vanaf 6m; koemelk als drank pas vanaf 12m." },
  { id: "kaas", name: "Zachte kaas (gepasteuriseerd)", cat: "Zuivel", minAge: 6, prep: { 6: "In kleine geraspte of gesmolten stukjes." }, note: "Vermijd rauwmelkse/ongepasteuriseerde kaas." },
  { id: "honing", name: "Honing", cat: "Fruit", minAge: 12, prep: {}, choking: "Nooit vóór 12 maanden — risico op infant botulisme.", note: "Pas vanaf 12 maanden, ook niet verwerkt in gebak voor die leeftijd." },
  { id: "bloemkool", name: "Bloemkool", cat: "Groente", minAge: 6, prep: { 6: "Gestoomd tot zacht, als puree.", 8: "Zachte roosjes als vingervoedsel." }, note: "" },
  { id: "erwten", name: "Erwten", cat: "Groente", minAge: 6, prep: { 6: "Goed gaar en fijngeprakt of als puree." }, choking: "Rond en glad — altijd prakken of platdrukken, nooit los geven.", note: "" },
  { id: "spinazie", name: "Spinazie", cat: "Groente", minAge: 6, prep: { 6: "Vers bereid, goed gaar en fijngehakt door puree." }, note: "Nitraatrijk — kleine porties, vers bereiden en restjes niet opnieuw opwarmen." },
  { id: "pastinaak", name: "Pastinaak", cat: "Groente", minAge: 6, prep: { 6: "Gekookt en fijngeprakt.", 9: "In zachte, gegaarde blokjes." }, note: "" },
  { id: "knolselder", name: "Knolselder", cat: "Groente", minAge: 6, prep: { 6: "Gekookt en fijngeprakt." }, note: "" },
  { id: "prei", name: "Prei", cat: "Groente", minAge: 6, prep: { 6: "Enkel het wit, goed gaar en heel fijn gesneden door puree." }, note: "Vezelig — meng door puree zodat er geen slierten blijven." },
  { id: "groene-boontjes", name: "Groene boontjes", cat: "Groente", minAge: 6, prep: { 6: "Goed gaar, draadjes verwijderd, fijngehakt of geprakt.", 9: "Zachte, gegaarde boontjes in stukjes." }, note: "" },
  { id: "paprika", name: "Paprika", cat: "Groente", minAge: 6, prep: { 6: "Geroosterd of gestoomd, zonder vel, fijngeprakt.", 10: "Rauw in heel dunne reepjes." }, note: "Het vel laat moeilijk los — even roosteren maakt pellen makkelijk." },
  { id: "komkommer", name: "Komkommer", cat: "Groente", minAge: 6, prep: { 6: "Geschild, in dikke sticks om op te sabbelen.", 9: "In dunne reepjes." }, note: "" },
  { id: "tomaat", name: "Tomaat", cat: "Groente", minAge: 6, prep: { 6: "Zonder vel en pitjes, fijngeprakt.", 9: "Rijpe partjes zonder vel." }, choking: "Kerstomaatjes altijd in kwartjes snijden, nooit heel — zelfde risico als druiven.", note: "" },
  { id: "aubergine", name: "Aubergine", cat: "Groente", minAge: 6, prep: { 6: "Goed gaar gestoofd en fijngeprakt." }, note: "" },
  { id: "rode-biet", name: "Rode biet", cat: "Groente", minAge: 6, prep: { 6: "Gekookt en fijngeprakt." }, note: "Nitraatrijk — kleine porties. Niet schrikken: bietjes kunnen plas en luier roze kleuren." },
  { id: "champignons", name: "Champignons", cat: "Groente", minAge: 8, prep: { 8: "Goed gaar gebakken en fijngesneden." }, note: "Enkel gekweekte champignons, nooit rauw." },
  { id: "mais", name: "Maïs", cat: "Groente", minAge: 8, prep: { 8: "Gekookt en fijngeprakt, of als smeuïge polenta." }, choking: "Hele korrels pas geven als kauwen al goed lukt — eerst prakken.", note: "" },
  { id: "aardbei", name: "Aardbei", cat: "Fruit", minAge: 6, prep: { 6: "Rijp, geprakt of in dunne plakjes." }, note: "Kan rode irritatie rond het mondje geven door het zuur — onschuldig, geen allergie." },
  { id: "framboos", name: "Framboos", cat: "Fruit", minAge: 6, prep: { 6: "Platgedrukt of geprakt." }, note: "" },
  { id: "kiwi", name: "Kiwi", cat: "Fruit", minAge: 6, prep: { 6: "Rijp, geschild en geprakt." }, note: "Zuur — kan onschuldige irritatie rond de mond geven. Start met kleine beetjes." },
  { id: "meloen", name: "Meloen", cat: "Fruit", minAge: 6, prep: { 6: "Rijp, zonder pitten, geprakt.", 8: "In dunne, zachte plakjes als vingervoedsel." }, note: "" },
  { id: "pruim", name: "Pruim", cat: "Fruit", minAge: 6, prep: { 6: "Rijp of gestoofd, zonder pit, geprakt." }, note: "Helpt bij een trage stoelgang." },
  { id: "abrikoos", name: "Abrikoos", cat: "Fruit", minAge: 6, prep: { 6: "Rijp of gestoofd, zonder pit, geprakt." }, note: "" },
  { id: "kers", name: "Kers", cat: "Fruit", minAge: 9, prep: { 9: "Ontpit en in kwartjes." }, choking: "Altijd ontpitten en in kwartjes snijden — zelfde risico als druiven.", note: "" },
  { id: "sinaasappel", name: "Sinaasappel / mandarijn", cat: "Fruit", minAge: 6, prep: { 6: "Vruchtvlees zonder vliesjes en pitjes, fijngehakt.", 12: "Partjes in stukjes, vliesjes mogen dan." }, note: "Zuur — kan onschuldige huidirritatie rond de mond geven." },
  { id: "ananas", name: "Ananas", cat: "Fruit", minAge: 6, prep: { 6: "Rijp, fijngehakt of geprakt — harde kern weglaten." }, note: "Zuur — kleine beetjes." },
  { id: "rozijnen", name: "Rozijnen", cat: "Fruit", minAge: 12, prep: { 12: "Even weken in warm water zodat ze zacht zijn." }, choking: "Klein, taai en kleverig — pas vanaf 12 maanden en geweekt.", note: "Zoet en plakkerig — liever bij de maaltijd dan als tussendoortje (tandjes)." },
  { id: "couscous", name: "Couscous", cat: "Granen", minAge: 6, prep: { 6: "Goed gaar en smeuïg gemaakt met wat groentepuree of saus." }, note: "" },
  { id: "bulgur", name: "Bulgur", cat: "Granen", minAge: 8, prep: { 8: "Goed gaar en vochtig, gemengd met puree of saus." }, note: "" },
  { id: "polenta", name: "Polenta", cat: "Granen", minAge: 6, prep: { 6: "Als smeuïge pap, of afgekoeld en in zachte reepjes." }, note: "" },
  { id: "gierst", name: "Gierst", cat: "Granen", minAge: 6, prep: { 6: "Als papje gekookt, zoals havermout." }, note: "" },
  { id: "rijstwafel", name: "Rijstwafel (ongezouten)", cat: "Granen", minAge: 8, prep: { 8: "Ongezouten en zonder toppings — lost makkelijk op in de mond." }, note: "Met mate vanwege arseen in rijstproducten. Kies altijd de ongezouten versie." },
  { id: "pannenkoek", name: "Pannenkoek", cat: "Granen", minAge: 8, prep: { 8: "Zelfgemaakt zonder suiker, in dunne reepjes." }, note: "Bevat ei, melk en gluten — handig pas nadat die apart al eens getest zijn." },
  { id: "tofu", name: "Tofu", cat: "Eiwit", minAge: 6, prep: { 6: "Zachte tofu geprakt, of stevige tofu in gegaarde blokjes." }, allergen: true, note: "Soja is een mogelijk allergeen — start met een klein beetje en observeer." },
  { id: "kalkoen", name: "Kalkoen", cat: "Eiwit", minAge: 6, prep: { 6: "Goed gaar, fijngeprakt of gemalen.", 9: "In dradige stukjes." }, note: "" },
  { id: "varkensvlees", name: "Varkensvlees", cat: "Eiwit", minAge: 6, prep: { 6: "Mals gestoofd en fijngemalen." }, note: "Kies mager vlees; geen bewerkte charcuterie zoals worst of hesp (zout en nitriet)." },
  { id: "witte-bonen", name: "Witte / bruine bonen", cat: "Eiwit", minAge: 6, prep: { 6: "Goed gaar en geprakt, velletjes zoveel mogelijk fijn." }, choking: "Hele bonen kunnen verstikken — altijd prakken.", note: "" },
  { id: "hummus", name: "Hummus", cat: "Eiwit", minAge: 6, prep: { 6: "Gladde hummus, dun op brood of als dipje." }, allergen: true, note: "Bevat sesam (tahin) — mogelijk allergeen. Zelfgemaakt zonder zout is ideaal." },
  { id: "tahin", name: "Tahin (sesampasta)", cat: "Eiwit", minAge: 6, prep: { 6: "Heel dun uitgesmeerd of aangelengd door puree." }, allergen: true, choking: "Puur en dik plakt het zoals pindakaas — altijd dun uitsmeren of aanlengen.", note: "Sesam is een belangrijk allergeen — vroeg en met kleine beetjes introduceren." },
  { id: "notenpasta", name: "Notenpasta (glad)", cat: "Eiwit", minAge: 6, prep: { 6: "Gladde amandel- of cashewpasta, dun uitgesmeerd of aangelengd." }, allergen: true, choking: "Nooit hele noten of stukjes noot vóór 5 jaar — verstikkingsgevaar. Enkel gladde pasta.", note: "Noten zijn een belangrijk allergeen — introduceer elke notensoort apart." },
  { id: "makreel", name: "Makreel / sardien", cat: "Eiwit", minAge: 6, prep: { 6: "Goed gaar, fijngeprakt en zorgvuldig ontgraat." }, allergen: true, choking: "Zorgvuldig controleren op graten.", note: "Vette vis is heel gezond. Uit blik: kies zonder toegevoegd zout." },
  { id: "plattekaas", name: "Volle plattekaas", cat: "Zuivel", minAge: 6, prep: { 6: "Puur, zonder toegevoegde suiker." }, note: "" },
  { id: "ricotta", name: "Ricotta", cat: "Zuivel", minAge: 6, prep: { 6: "Puur of gemengd door groente- of fruitpuree." }, note: "" },
  { id: "boter", name: "Boter", cat: "Zuivel", minAge: 6, prep: { 6: "Dun op brood of een klontje door de groenten." }, note: "Met mate — gewone ongezouten boter is prima." },
  { id: "mozzarella", name: "Mozzarella", cat: "Zuivel", minAge: 8, prep: { 8: "Verse mozzarella in kleine, dunne stukjes." }, note: "Enkel gepasteuriseerd — verse mozzarella uit de winkel is dat vrijwel altijd." },
];

const RECIPES = [
  { id: "r1", name: "Avocado-bananenprak", mealType: "Ontbijt", foodIds: ["avocado", "banaan"], steps: ["Prak avocado en banaan apart fijn met een vork.", "Meng samen tot een gladde prak.", "Serveer meteen — avocado verkleurt snel."] },
  { id: "r2", name: "Havermoutpap met peer", mealType: "Ontbijt", foodIds: ["havermout", "peer"], steps: ["Kook havermout gaar met water of moedermelk/opvolgmelk.", "Stoof de peer zacht en prak fijn.", "Meng door de pap."] },
  { id: "r3", name: "Omeletreepjes met kaas", mealType: "Ontbijt", foodIds: ["ei", "kaas"], steps: ["Klop het ei los, meng er wat geraspte kaas door.", "Bak op laag vuur volledig gaar, geen lopend deel meer.", "Snijd in dunne reepjes."] },
  { id: "r4", name: "Zoete aardappel-appelpuree", mealType: "Lunch", foodIds: ["zoete-aardappel", "appel"], steps: ["Kook zoete aardappel en appel apart gaar.", "Prak beiden fijn.", "Meng samen tot een gladde puree."] },
  { id: "r5", name: "Broccoli-kaasprak", mealType: "Lunch", foodIds: ["broccoli", "kaas"], steps: ["Stoom de broccoli tot heel zacht.", "Prak fijn en meng er wat geraspte kaas door tot die smelt."] },
  { id: "r6", name: "Kikkererwtenprak met courgette", mealType: "Lunch", foodIds: ["kikkererwten", "courgette"], steps: ["Kook de courgette zacht.", "Prak kikkererwten goed fijn (velletjes kunnen blijven plakken).", "Meng samen."] },
  { id: "r7", name: "Quinoasalade met broccoli", mealType: "Lunch", foodIds: ["quinoa", "broccoli"], steps: ["Kook quinoa gaar en zacht.", "Stoom broccoli tot zacht en snijd klein.", "Meng lauw of koud."] },
  { id: "r8", name: "Kip-groentestoofje", mealType: "Diner", foodIds: ["kip", "wortel", "courgette"], steps: ["Stoof kip, wortel en courgette samen goed gaar.", "Prak of snijd fijn naargelang leeftijd.", "Controleer altijd op botjes."] },
  { id: "r9", name: "Linzen-pompoenpuree", mealType: "Diner", foodIds: ["linzen", "pompoen"], steps: ["Kook linzen en pompoen samen gaar.", "Prak tot een gladde puree."] },
  { id: "r10", name: "Rundsgehakt met zoete aardappel", mealType: "Diner", foodIds: ["rundvlees", "zoete-aardappel"], steps: ["Bak het gehakt volledig gaar, verkruimel fijn.", "Kook de zoete aardappel gaar en prak.", "Meng samen."] },
  { id: "r11", name: "Zalmpuree met wortel", mealType: "Diner", foodIds: ["vis", "wortel"], steps: ["Gaar de zalm en controleer zorgvuldig op graten.", "Kook de wortel heel zacht.", "Prak beide samen."] },
  { id: "r12", name: "Yoghurt met mango", mealType: "Snack", foodIds: ["yoghurt", "mango"], steps: ["Prak de mango fijn.", "Meng door de volle yoghurt."] },
  { id: "r13", name: "Toast met pindakaas", mealType: "Snack", foodIds: ["volkoren-brood", "pindakaas"], steps: ["Rooster het brood.", "Smeer een heel dunne laag gladde pindakaas uit — nooit een dikke klodder.", "Snijd in soldaatjes."] },
  { id: "r14", name: "Gierstpap met abrikoos", mealType: "Ontbijt", foodIds: ["gierst", "abrikoos"], steps: ["Kook de gierst tot een zacht papje.", "Stoof de abrikoos zacht en prak fijn.", "Meng door de pap."] },
  { id: "r15", name: "Plattekaas met aardbei", mealType: "Ontbijt", foodIds: ["plattekaas", "aardbei"], steps: ["Prak rijpe aardbeien fijn.", "Meng door de volle plattekaas."] },
  { id: "r16", name: "Polentapap met pruim", mealType: "Ontbijt", foodIds: ["polenta", "pruim"], steps: ["Kook de polenta als een smeuïge pap.", "Stoof de pruim zonder pit en prak fijn.", "Meng samen."] },
  { id: "r17", name: "Toast met hummus en komkommer", mealType: "Lunch", foodIds: ["volkoren-brood", "hummus", "komkommer"], steps: ["Rooster het brood en smeer er gladde hummus op.", "Snijd in soldaatjes.", "Geef geschilde komkommersticks ernaast."] },
  { id: "r18", name: "Couscous met tomaat en erwten", mealType: "Lunch", foodIds: ["couscous", "tomaat", "erwten"], steps: ["Maak de couscous smeuïg met wat water of groentenat.", "Ontvel de tomaat en prak samen met de gare erwten goed fijn.", "Meng alles door elkaar."] },
  { id: "r19", name: "Witte bonenprak met paprika", mealType: "Lunch", foodIds: ["witte-bonen", "paprika"], steps: ["Rooster de paprika en verwijder het vel.", "Prak de gare bonen goed fijn samen met de paprika."] },
  { id: "r20", name: "Kalkoen-pastinaakstoofje", mealType: "Diner", foodIds: ["kalkoen", "pastinaak", "wortel"], steps: ["Stoof kalkoen, pastinaak en wortel samen goed gaar.", "Prak of maal fijn naargelang leeftijd."] },
  { id: "r21", name: "Pasta met spinazie en ricotta", mealType: "Diner", foodIds: ["pasta", "spinazie", "ricotta"], steps: ["Kook de pasta goed gaar.", "Laat verse spinazie slinken en hak heel fijn.", "Meng met de ricotta door de pasta."] },
  { id: "r22", name: "Varkensstoofje met knolselder en appel", mealType: "Diner", foodIds: ["varkensvlees", "knolselder", "appel"], steps: ["Stoof mager varkensvlees heel mals.", "Kook knolselder en appel gaar en prak fijn.", "Meng alles samen."] },
  { id: "r23", name: "Linzen-auberginestoof", mealType: "Diner", foodIds: ["linzen", "aubergine", "tomaat"], steps: ["Stoof de aubergine en ontvelde tomaat zacht.", "Kook de linzen gaar.", "Prak alles samen tot een smeuïge stoof."] },
  { id: "r24", name: "Makreelprak met pastinaak", mealType: "Diner", foodIds: ["makreel", "pastinaak"], steps: ["Gaar de makreel en controleer zorgvuldig op graten.", "Kook de pastinaak zacht en prak.", "Meng samen."] },
  { id: "r25", name: "Meloen met ricotta-dip", mealType: "Snack", foodIds: ["meloen", "ricotta"], steps: ["Snijd rijpe meloen zonder pitten in dunne, zachte plakjes.", "Geef een lepeltje ricotta als dipje erbij."] },
  { id: "r26", name: "Rijstwafel met tahin en banaan", mealType: "Snack", foodIds: ["rijstwafel", "tahin", "banaan"], steps: ["Smeer een heel dun laagje tahin op de rijstwafel.", "Beleg met dunne plakjes banaan."] },
];

function ageLabel(age) {
  return age >= 12 ? `${Math.round(age / 12 * 10) / 10}j` : `${age}m`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}
function isoOf(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function todayISO() {
  return isoOf(new Date());
}
function nowTimeString() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const WEEKDAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(isoOf(d));
  }
  return days;
}
function dayLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  return { weekday: WEEKDAYS[d.getDay()], num: d.getDate() };
}
function dateTitle(iso) {
  const d = new Date(iso + "T00:00:00");
  if (iso === todayISO()) return "Vandaag";
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (iso === isoOf(yest)) return "Gisteren";
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const MEAL_TYPES = ["Ontbijt", "Lunch", "Diner"];
function recipeAgeMin(r) {
  return Math.max(...r.foodIds.map((id) => FOODS.find((f) => f.id === id)?.minAge || 0));
}
function recipePantryReady(r, pantry) {
  return r.foodIds.every((id) => pantry.includes(id));
}

const ALLERGENS = [
  { key: "ei", label: "Ei", foodId: "ei" },
  { key: "pinda", label: "Pinda (pindakaas)", foodId: "pindakaas" },
  { key: "vis", label: "Vis", foodId: "vis" },
  { key: "zuivel", label: "Koemelk / zuivel", foodId: "yoghurt" },
  { key: "gluten", label: "Gluten (tarwe)", foodId: "volkoren-brood" },
];

const REACTIONS = [
  { key: "lekker", label: "Lekker", icon: Smile, color: "#7A9B6E" },
  { key: "neutraal", label: "Neutraal", icon: Meh, color: "#C9A227" },
  { key: "vies", label: "Vies", icon: Frown, color: "#B8452C" },
];

const MEALS = ["Ontbijt", "Lunch", "Snack", "Diner"];

const AMOUNTS = [
  { key: "weinig", label: "Weinig" },
  { key: "half", label: "De helft" },
  { key: "alles", label: "(Bijna) alles" },
];

// Oudere entries hebben één foodId, nieuwere een foodIds-array.
function entryFoodIds(e) {
  return e.foodIds || (e.foodId ? [e.foodId] : []);
}

function guessMeal(time) {
  const h = Number(time.slice(0, 2));
  if (h < 10) return "Ontbijt";
  if (h < 14) return "Lunch";
  if (h < 17) return "Snack";
  return "Diner";
}

const PHOTO_BUCKET = "isaac-photos";

// Verklein foto's client-side vóór upload — origineel telefoonformaat is
// onnodig groot voor in de app en vertraagt de sync.
async function compressImage(file, maxDim = 1200, quality = 0.8) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function weekFrequency(logs) {
  const days = last7Days();
  const counts = {};
  logs.forEach((e) => {
    if (!days.includes(e.date)) return;
    entryFoodIds(e).forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([foodId, count]) => ({ foodId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
// jsonb bewaart object-sleutels in een andere volgorde dan JS — sorteer ze
// zodat lokale data en data uit Supabase dezelfde string opleveren.
function stableStringify(obj) {
  return JSON.stringify(obj, (key, value) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.keys(value).sort().reduce((acc, k) => {
        acc[k] = value[k];
        return acc;
      }, {})
      : value
  );
}
function currentWeekDays() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(isoOf(d));
  }
  return days;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState([]);
  const [ageSlider, setAgeSlider] = useState(5);
  const [tried, setTried] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("menu");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [showAddLog, setShowAddLog] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logSelection, setLogSelection] = useState([]);
  const [recipeSubView, setRecipeSubView] = useState("list");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [weekPlan, setWeekPlan] = useState({});
  const [planPicker, setPlanPicker] = useState(null);
  const [pantry, setPantry] = useState([]);
  const [pantrySearch, setPantrySearch] = useState("");
  const [pantryOnly, setPantryOnly] = useState(false);
  const [selectedLogEntry, setSelectedLogEntry] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Kopieer");
  const [customFoods, setCustomFoods] = useState([]);
  const [showAddFood, setShowAddFood] = useState(false);
  const [foodDraft, setFoodDraft] = useState({ name: "", cat: "Groente", minAge: 6, prep: "", note: "", allergen: false });
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    const link1 = document.createElement("link");
    link1.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap";
    link1.rel = "stylesheet";
    document.head.appendChild(link1);
  }, []);

  const lastSyncedRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  // actuele waarden voor de realtime-handler (die heeft een lege deps-array)
  const ageSliderRef = useRef(ageSlider);
  useEffect(() => {
    ageSliderRef.current = ageSlider;
  }, [ageSlider]);
  const customFoodsRef = useRef(customFoods);
  useEffect(() => {
    customFoodsRef.current = customFoods;
  }, [customFoods]);

  useEffect(() => {
    (async () => {
      if (supabaseEnabled) {
        try {
          const { data } = await supabase.from("isaac_data").select("data").eq("id", "isaac").single();
          if (data && data.data) {
            const d = data.data;
            setTried(d.tried || []);
            setLogs(d.logs || []);
            setWeekPlan(d.weekPlan || {});
            setPantry(d.pantry || []);
            setAgeSlider(d.ageSlider || 5);
            setCustomFoods(d.customFoods || []);
            lastSyncedRef.current = stableStringify(d);
          } else {
            const initial = { tried: [], logs: [], weekPlan: {}, pantry: [], ageSlider: 5, customFoods: [] };
            await supabase.from("isaac_data").upsert({ id: "isaac", data: initial });
            lastSyncedRef.current = stableStringify(initial);
          }
        } catch (e) {
          // if this fails, the app still works locally for this session
        }
      } else {
        try {
          const raw = localStorage.getItem("isaac-data");
          if (raw) {
            const parsed = JSON.parse(raw);
            setTried(parsed.tried || []);
            setLogs(parsed.logs || []);
            setWeekPlan(parsed.weekPlan || {});
            setPantry(parsed.pantry || []);
            setAgeSlider(parsed.ageSlider || 5);
            setCustomFoods(parsed.customFoods || []);
          }
        } catch (e) {
          // no saved data yet
        }
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const current = { tried, logs, weekPlan, pantry, ageSlider, customFoods };
    const currentStr = stableStringify(current);
    if (currentStr === lastSyncedRef.current) return;

    if (!supabaseEnabled) {
      try {
        localStorage.setItem("isaac-data", currentStr);
      } catch (e) {
        // storage full or unavailable
      }
      lastSyncedRef.current = currentStr;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await supabase.from("isaac_data").upsert({ id: "isaac", data: current, updated_at: new Date().toISOString() });
        lastSyncedRef.current = currentStr;
      } catch (e) {
        // will retry on next change
      }
    }, 800);
  }, [tried, logs, weekPlan, pantry, ageSlider, customFoods, loaded]);

  useEffect(() => {
    if (!supabaseEnabled) return;
    const channel = supabase
      .channel("isaac_data_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "isaac_data", filter: "id=eq.isaac" },
        (payload) => {
          const incoming = payload.new?.data;
          if (!incoming) return;
          // Een client met een oude app-versie stuurt data zonder de nieuwere
          // velden mee; behoud dan de lokale waarden in plaats van te resetten.
          const merged = {
            tried: incoming.tried || [],
            logs: incoming.logs || [],
            weekPlan: incoming.weekPlan || {},
            pantry: incoming.pantry || [],
            ageSlider: incoming.ageSlider ?? ageSliderRef.current,
            customFoods: incoming.customFoods ?? customFoodsRef.current,
          };
          const mergedStr = stableStringify(merged);
          if (mergedStr === lastSyncedRef.current) return;
          setTried(merged.tried);
          setLogs(merged.logs);
          setWeekPlan(merged.weekPlan);
          setPantry(merged.pantry);
          setAgeSlider(merged.ageSlider);
          setCustomFoods(merged.customFoods);
          lastSyncedRef.current = mergedStr;
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const togglePantry = (id) => {
    setPantry((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const toggleTried = (id) => {
    setTried((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  };

  const addLogEntry = (foodIds) => {
    if (!foodIds.length) return;
    const time = nowTimeString();
    const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, foodIds, date: selectedDate, time, meal: guessMeal(time), amount: null, reaction: null, note: "", photo: null };
    setLogs((l) => [...l, entry]);
    setTried((t) => [...new Set([...t, ...foodIds])]);
  };

  const updateLogEntry = (id, updates) => {
    setLogs((l) => l.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeLogEntry = (id) => {
    const entry = logs.find((e) => e.id === id);
    if (entry?.photo && supabaseEnabled) {
      supabase.storage.from(PHOTO_BUCKET).remove([entry.photo]);
    }
    setLogs((l) => l.filter((e) => e.id !== id));
  };

  const photoUrl = (path) => supabase?.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;

  const addEntryPhoto = async (entry, file) => {
    if (!supabaseEnabled) return;
    setPhotoBusy(true);
    try {
      let blob;
      let ext = "jpg";
      let type = "image/jpeg";
      try {
        blob = await compressImage(file);
        if (!blob) throw new Error("compressie mislukt");
      } catch {
        // Formaten die de browser niet kan decoderen (bv. HEIC buiten
        // Safari) uploaden we onverkleind als origineel.
        blob = file;
        type = file.type || "application/octet-stream";
        ext = (file.name.split(".").pop() || "bin").toLowerCase();
      }
      const path = `${entry.id}.${ext}`;
      const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { upsert: true, contentType: type });
      if (error) throw error;
      updateLogEntry(entry.id, { photo: path });
      setSelectedLogEntry((e) => ({ ...e, photo: path }));
    } catch (e) {
      window.alert(`Foto uploaden lukte niet: ${e?.message || e}`);
    } finally {
      setPhotoBusy(false);
    }
  };

  const removeEntryPhoto = (entry) => {
    if (entry.photo && supabaseEnabled) {
      supabase.storage.from(PHOTO_BUCKET).remove([entry.photo]);
    }
    updateLogEntry(entry.id, { photo: null });
    setSelectedLogEntry((e) => ({ ...e, photo: null }));
  };

  const assignPlan = (date, mealType, recipeId) => {
    setWeekPlan((wp) => ({ ...wp, [`${date}-${mealType}`]: recipeId }));
    setPlanPicker(null);
  };

  const clearPlan = (date, mealType) => {
    setWeekPlan((wp) => {
      const copy = { ...wp };
      delete copy[`${date}-${mealType}`];
      return copy;
    });
    setPlanPicker(null);
  };

  const toggleCat = (cat) => {
    setActiveCats((c) => (c.includes(cat) ? c.filter((x) => x !== cat) : [...c, cat]));
  };

  const allFoods = useMemo(() => [...FOODS, ...customFoods], [customFoods]);

  const addCustomFood = () => {
    const name = foodDraft.name.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newFood = {
      id: `custom-${slug}-${Date.now().toString(36)}`,
      name,
      cat: foodDraft.cat,
      minAge: foodDraft.minAge,
      prep: foodDraft.prep.trim() ? { [foodDraft.minAge]: foodDraft.prep.trim() } : {},
      note: foodDraft.note.trim(),
      custom: true,
      ...(foodDraft.allergen ? { allergen: true } : {}),
    };
    setCustomFoods((c) => [...c, newFood]);
    setFoodDraft({ name: "", cat: "Groente", minAge: 6, prep: "", note: "", allergen: false });
    setShowAddFood(false);
  };

  const removeCustomFood = (id) => {
    if (!window.confirm("Dit voedingsmiddel verwijderen? Ook de dagboek-entries ervan verdwijnen.")) return;
    setCustomFoods((c) => c.filter((f) => f.id !== id));
    setTried((t) => t.filter((x) => x !== id));
    setPantry((p) => p.filter((x) => x !== id));
    setLogs((l) =>
      l
        .map((e) => {
          const ids = entryFoodIds(e);
          if (!ids.includes(id)) return e;
          const rest = ids.filter((x) => x !== id);
          if (!rest.length) return null;
          const { foodId, ...clean } = e;
          return { ...clean, foodIds: rest };
        })
        .filter(Boolean)
    );
    setSelected(null);
  };

  const filtered = useMemo(() => {
    return allFoods.filter((f) => {
      if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (activeCats.length && !activeCats.includes(f.cat)) return false;
      return true;
    }).sort((a, b) => a.minAge - b.minAge || a.name.localeCompare(b.name));
  }, [allFoods, query, activeCats]);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: COLORS.ink }}>
      <div className="max-w-md px-4 pb-16 mx-auto">
        <header className="pt-8 pb-5">
          <p style={{ color: COLORS.inkSoft, fontFamily: "'IBM Plex Sans', sans-serif" }} className="mb-1 text-xs tracking-widest uppercase">Isaac's eerste happen</p>
          <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header, fontWeight: 600 }} className="text-3xl leading-tight">
            Wat kan Isaac al eten?
          </h1>
        </header>

        <div className="flex gap-1 p-1 mb-5 rounded-full" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
          {[
            { key: "menu", label: "Menu" },
            { key: "log", label: "Dagboek" },
            { key: "recipes", label: "Recepten" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className="flex-1 py-2 text-sm font-medium transition rounded-full"
              style={{
                background: view === t.key ? COLORS.header : "transparent",
                color: view === t.key ? "#fff" : COLORS.inkSoft,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {view === "menu" && (
          <>
            <div className="p-4 mb-4 rounded-2xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-baseline justify-between mb-2">
                <label style={{ color: COLORS.inkSoft }} className="text-sm">Isaac is nu</label>
                <span style={{ color: COLORS.header, fontFamily: "'Fraunces', serif" }} className="text-lg font-semibold">{ageLabel(ageSlider)}</span>
              </div>
              <input
                type="range"
                min={4}
                max={24}
                value={ageSlider}
                onChange={(e) => setAgeSlider(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: COLORS.header }}
              />
              <div className="flex justify-between mt-1 text-xs" style={{ color: COLORS.inkSoft }}>
                <span>4m</span>
                <span>24m</span>
              </div>
            </div>

            <div className="relative mb-3">
              <Search size={16} className="absolute -translate-y-1/2 left-3 top-1/2" style={{ color: COLORS.inkSoft }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek een voedingsmiddel..."
                className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none"
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {Object.keys(CATEGORY_COLORS).map((cat) => {
                const active = activeCats.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCat(cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition"
                    style={{
                      background: active ? CATEGORY_COLORS[cat] : COLORS.surface,
                      color: active ? "#fff" : COLORS.ink,
                      border: `1px solid ${active ? CATEGORY_COLORS[cat] : COLORS.line}`,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filtered.map((f) => {
                const available = f.minAge <= ageSlider;
                const isTried = tried.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f)}
                    className="relative p-3 text-left rounded-2xl"
                    style={{
                      background: COLORS.surface,
                      border: `1px solid ${COLORS.line}`,
                      opacity: available ? 1 : 0.55,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="inline-block rounded-full"
                        style={{ width: 12, height: 12, background: CATEGORY_COLORS[f.cat], borderRadius: "50%" }}
                      />
                      {isTried && <Check size={16} style={{ color: CATEGORY_COLORS.Groente }} />}
                      {!available && <Lock size={13} style={{ color: COLORS.inkSoft }} />}
                    </div>
                    <p className="text-sm font-medium leading-tight">{f.name}</p>
                    <p className="mt-1 text-xs" style={{ color: available ? COLORS.inkSoft : COLORS.warn }}>
                      {available ? "geschikt nu" : `vanaf ${ageLabel(f.minAge)}`}
                    </p>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="mt-8 text-sm text-center" style={{ color: COLORS.inkSoft }}>Niets gevonden voor deze zoekopdracht.</p>
            )}

            <button
              onClick={() => setShowAddFood(true)}
              className="flex items-center justify-center w-full gap-2 py-3 mt-4 text-sm font-medium rounded-2xl"
              style={{ background: COLORS.surface, border: `1px dashed ${COLORS.inkSoft}`, color: COLORS.header }}
            >
              <Plus size={16} />
              Zelf een voedingsmiddel toevoegen
            </button>
          </>
        )}

        {view === "log" && (
          <div>
            <div className="flex gap-2 pb-1 mb-5 overflow-x-auto">
              {last7Days().map((iso) => {
                const dayEntries = logs.filter((e) => e.date === iso);
                const cats = [...new Set(dayEntries.flatMap((e) => entryFoodIds(e).map((id) => allFoods.find((f) => f.id === id)?.cat)))].filter(Boolean);
                const { weekday, num } = dayLabel(iso);
                const active = iso === selectedDate;
                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className="flex flex-col items-center justify-center flex-shrink-0 rounded-xl"
                    style={{
                      width: 44,
                      height: 58,
                      background: active ? COLORS.header : COLORS.surface,
                      border: `1px solid ${active ? COLORS.header : COLORS.line}`,
                    }}
                  >
                    <span className="text-[10px]" style={{ color: active ? "#fff" : COLORS.inkSoft }}>{weekday}</span>
                    <span className="text-sm font-medium" style={{ color: active ? "#fff" : COLORS.ink }}>{num}</span>
                    <div className="flex gap-0.5 mt-1">
                      {cats.slice(0, 3).map((c) => (
                        <span key={c} style={{ width: 4, height: 4, borderRadius: "50%", background: active ? "#fff" : CATEGORY_COLORS[c] }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header }} className="text-xl font-semibold">
                {dateTitle(selectedDate)}
              </h2>
              <button
                onClick={() => {
                  setLogSelection([]);
                  setLogSearch("");
                  setShowAddLog(true);
                }}
                className="flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5"
                style={{ background: COLORS.header, color: "#fff" }}
              >
                <Plus size={14} /> Toevoegen
              </button>
            </div>

            <div className="space-y-2">
              {logs
                .filter((e) => e.date === selectedDate)
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((entry) => {
                  const entryFoods = entryFoodIds(entry).map((id) => allFoods.find((f) => f.id === id)).filter(Boolean);
                  if (!entryFoods.length) return null;
                  const reactionInfo = REACTIONS.find((r) => r.key === entry.reaction);
                  const ReactionIcon = reactionInfo?.icon;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}
                    >
                      <button
                        onClick={() => {
                          setSelectedLogEntry(entry);
                          setNoteDraft(entry.note || "");
                        }}
                        className="flex items-center flex-1 gap-3 text-left"
                      >
                        <div className="flex -space-x-1.5 flex-shrink-0">
                          {entryFoods.slice(0, 3).map((f) => (
                            <span
                              key={f.id}
                              style={{ width: 18, height: 18, background: CATEGORY_COLORS[f.cat], borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%", border: `1.5px solid ${COLORS.surface}` }}
                            />
                          ))}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entryFoods.map((f) => f.name).join(" + ")}</p>
                          <p className="text-xs" style={{ color: COLORS.inkSoft }}>
                            {entry.meal ? `${entry.meal} · ` : ""}{entry.time}
                            {entry.amount ? ` · ${AMOUNTS.find((a) => a.key === entry.amount)?.label.toLowerCase()} gegeten` : ""}
                            {entry.note ? " · heeft notitie" : ""}
                          </p>
                        </div>
                        {entry.photo && supabaseEnabled && (
                          <img src={photoUrl(entry.photo)} alt="" className="flex-shrink-0 object-cover rounded-lg w-9 h-9" />
                        )}
                        {ReactionIcon && <ReactionIcon size={16} style={{ color: reactionInfo.color, flexShrink: 0 }} />}
                      </button>
                      <button onClick={() => removeLogEntry(entry.id)}>
                        <Trash2 size={15} style={{ color: COLORS.inkSoft }} />
                      </button>
                    </div>
                  );
                })}
              {logs.filter((e) => e.date === selectedDate).length === 0 && (
                <p className="py-8 text-sm text-center" style={{ color: COLORS.inkSoft }}>
                  Nog niets gelogd op {dateTitle(selectedDate).toLowerCase()}.
                </p>
              )}
            </div>

            {weekFrequency(logs).length > 0 && (
              <div className="p-4 mt-6 rounded-2xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                <p className="mb-3 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Deze week vaakst gegeten</p>
                <div className="space-y-2">
                  {weekFrequency(logs).map(({ foodId, count }) => {
                    const food = allFoods.find((f) => f.id === foodId);
                    if (!food) return null;
                    const max = weekFrequency(logs)[0].count;
                    return (
                      <div key={foodId} className="flex items-center gap-2">
                        <span className="flex-shrink-0 w-24 text-xs truncate">{food.name}</span>
                        <div className="flex-1 h-2 rounded-full" style={{ background: COLORS.bg }}>
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${(count / max) * 100}%`, background: CATEGORY_COLORS[food.cat] }}
                          />
                        </div>
                        <span className="flex-shrink-0 text-xs" style={{ color: COLORS.inkSoft }}>{count}×</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "recipes" && (
          <div>
            <div className="flex gap-1 p-1 mb-4 rounded-full" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              {[
                { key: "list", label: "Recepten" },
                { key: "plan", label: "Weekplan" },
                { key: "pantry", label: "Voorraad" },
                { key: "allergens", label: "Allergenen" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setRecipeSubView(t.key)}
                  className="flex-1 text-xs font-medium py-1.5 rounded-full transition"
                  style={{
                    background: recipeSubView === t.key ? COLORS.header : "transparent",
                    color: recipeSubView === t.key ? "#fff" : COLORS.inkSoft,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {recipeSubView === "list" && (
              <div className="space-y-2">
                <button
                  onClick={() => setPantryOnly((v) => !v)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 mb-1 text-xs font-medium"
                  style={{
                    background: pantryOnly ? CATEGORY_COLORS.Groente : COLORS.surface,
                    color: pantryOnly ? "#fff" : COLORS.inkSoft,
                    border: `1px solid ${pantryOnly ? CATEGORY_COLORS.Groente : COLORS.line}`,
                  }}
                >
                  <Package size={13} /> Enkel wat ik in huis heb
                </button>
                {RECIPES.slice()
                  .filter((r) => !pantryOnly || recipePantryReady(r, pantry))
                  .sort((a, b) => recipeAgeMin(a) - recipeAgeMin(b))
                  .map((r) => {
                    const minAge = recipeAgeMin(r);
                    const available = minAge <= ageSlider;
                    const allKnown = r.foodIds.every((id) => tried.includes(id));
                    const inPantry = recipePantryReady(r, pantry);
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRecipe(r)}
                        className="flex items-center w-full gap-3 p-3 text-left rounded-2xl"
                        style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, opacity: available ? 1 : 0.55 }}
                      >
                        <div className="flex -space-x-1.5 flex-shrink-0">
                          {r.foodIds.slice(0, 3).map((id) => {
                            const f = allFoods.find((ff) => ff.id === id);
                            return (
                              <span
                                key={id}
                                style={{ width: 18, height: 18, background: CATEGORY_COLORS[f?.cat], borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%", border: `1.5px solid ${COLORS.surface}` }}
                              />
                            );
                          })}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-tight">{r.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: available ? COLORS.inkSoft : COLORS.warn }}>
                            {r.mealType} · {available ? "geschikt nu" : `vanaf ${ageLabel(minAge)}`}
                          </p>
                        </div>
                        {inPantry && <Package size={15} style={{ color: CATEGORY_COLORS.Groente, flexShrink: 0 }} />}
                        {allKnown && <Check size={16} style={{ color: CATEGORY_COLORS.Groente, flexShrink: 0 }} />}
                        {!available && <Lock size={13} style={{ color: COLORS.inkSoft, flexShrink: 0 }} />}
                      </button>
                    );
                  })}
              </div>
            )}

            {recipeSubView === "plan" && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowShoppingList(true)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 mb-1 text-xs font-medium"
                  style={{ background: COLORS.header, color: "#fff" }}
                >
                  <ShoppingCart size={13} /> Boodschappenlijst
                </button>
                {currentWeekDays().map((iso) => (
                  <div key={iso} className="p-3 rounded-2xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                    <p className="mb-2 text-xs font-medium" style={{ color: COLORS.header }}>{dateTitle(iso)}</p>
                    <div className="space-y-1.5">
                      {MEAL_TYPES.map((mt) => {
                        const recipeId = weekPlan[`${iso}-${mt}`];
                        const recipe = RECIPES.find((r) => r.id === recipeId);
                        return (
                          <button
                            key={mt}
                            onClick={() => setPlanPicker({ date: iso, mealType: mt })}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-xl"
                            style={{ background: COLORS.bg }}
                          >
                            <span className="text-xs" style={{ color: COLORS.inkSoft }}>{mt}</span>
                            <span className="text-xs font-medium" style={{ color: recipe ? COLORS.header : COLORS.inkSoft }}>
                              {recipe ? recipe.name : "+ kies recept"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recipeSubView === "pantry" && (
              <div>
                <div className="relative mb-3">
                  <Search size={16} className="absolute -translate-y-1/2 left-3 top-1/2" style={{ color: COLORS.inkSoft }} />
                  <input
                    value={pantrySearch}
                    onChange={(e) => setPantrySearch(e.target.value)}
                    placeholder="Zoek een ingrediënt..."
                    className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none"
                    style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
                  />
                </div>
                <p className="mb-3 text-xs" style={{ color: COLORS.inkSoft }}>
                  {pantry.length} van {allFoods.length} in huis — tik om aan of af te vinken.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {allFoods.filter((f) => f.name.toLowerCase().includes(pantrySearch.toLowerCase()))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((f) => {
                      const has = pantry.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          onClick={() => togglePantry(f.id)}
                          className="flex items-center gap-2 rounded-xl p-2.5 text-left"
                          style={{
                            background: has ? CATEGORY_COLORS[f.cat] : COLORS.surface,
                            border: `1px solid ${has ? CATEGORY_COLORS[f.cat] : COLORS.line}`,
                          }}
                        >
                          <span
                            className="flex-shrink-0"
                            style={{ width: 14, height: 14, background: has ? "#fff" : CATEGORY_COLORS[f.cat], borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%", opacity: has ? 0.9 : 1 }}
                          />
                          <span className="text-xs font-medium" style={{ color: has ? "#fff" : COLORS.ink }}>{f.name}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {recipeSubView === "allergens" && (
              <div className="space-y-2">
                <p className="mb-2 text-xs" style={{ color: COLORS.inkSoft }}>
                  De grote allergenen uit dit menu — introduceer ze bewust en één voor één, en overleg bij eczeem of familiale allergie met je kinderarts.
                </p>
                {ALLERGENS.map((a) => {
                  const food = allFoods.find((f) => f.id === a.foodId);
                  const introduced = tried.includes(a.foodId);
                  const firstLog = logs.filter((e) => entryFoodIds(e).includes(a.foodId)).sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time))[0];
                  return (
                    <button
                      key={a.key}
                      onClick={() => food && setSelected(food)}
                      className="flex items-center w-full gap-3 p-3 text-left rounded-2xl"
                      style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}
                    >
                      <span
                        className="flex items-center justify-center flex-shrink-0 rounded-full"
                        style={{ width: 28, height: 28, background: introduced ? CATEGORY_COLORS.Groente : COLORS.warnBg }}
                      >
                        {introduced ? <Check size={14} color="#fff" /> : <ShieldAlert size={14} style={{ color: COLORS.warn }} />}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.label}</p>
                        <p className="text-xs" style={{ color: COLORS.inkSoft }}>
                          {introduced ? `Geïntroduceerd${firstLog ? ` op ${dateTitle(firstLog.date).toLowerCase()}` : ""}` : "Nog niet geïntroduceerd"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <p className="mt-8 text-xs leading-relaxed" style={{ color: COLORS.inkSoft }}>
          Algemene richtlijn, geen medisch advies. Bij twijfel — zeker rond allergenen of verstikkingsgevaar — overleg met je kinderarts of Kind en Gezin.
        </p>

        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-2 mt-4 text-xs font-medium"
          style={{ color: COLORS.inkSoft }}
        >
          <Download size={13} /> Exporteer mijn gegevens
        </button>

        <p className="mt-2 text-xs" style={{ color: COLORS.inkSoft }}>
          {supabaseEnabled ? "🔄 Gesynchroniseerd tussen toestellen" : "📱 Enkel lokaal opgeslagen op dit toestel"}
        </p>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(51,42,49,0.4)" }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
            style={{ background: COLORS.surface }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span
                  className="inline-block mb-2 rounded-full"
                  style={{ width: 30, height: 30, background: CATEGORY_COLORS[selected.cat], borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%" }}
                />
                <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header }} className="text-2xl font-semibold">{selected.name}</h2>
                <p className="mt-1 text-xs" style={{ color: COLORS.inkSoft }}>
                  {selected.cat} · vanaf {ageLabel(selected.minAge)}
                  {selected.custom && " · zelf toegevoegd"}
                </p>
              </div>
              <button onClick={() => setSelected(null)}><X size={20} style={{ color: COLORS.inkSoft }} /></button>
            </div>

            {selected.allergen && (
              <div className="flex items-start gap-2 p-3 mb-3 rounded-xl" style={{ background: COLORS.warnBg }}>
                <AlertTriangle size={16} style={{ color: COLORS.warn, flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm" style={{ color: COLORS.warn }}>{selected.note || "Mogelijk allergeen — introduceer met aandacht."}</p>
              </div>
            )}
            {selected.choking && (
              <div className="flex items-start gap-2 p-3 mb-3 rounded-xl" style={{ background: COLORS.warnBg }}>
                <AlertTriangle size={16} style={{ color: COLORS.warn, flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm" style={{ color: COLORS.warn }}>{selected.choking}</p>
              </div>
            )}
            {!selected.allergen && selected.note && (
              <p className="mb-3 text-sm" style={{ color: COLORS.inkSoft }}>{selected.note}</p>
            )}

            <p className="mt-4 mb-2 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Bereiding per leeftijd</p>
            <div className="mb-5 space-y-2">
              {Object.entries(selected.prep).map(([age, text]) => (
                <div key={age} className="flex gap-3">
                  <span
                    className="text-xs font-medium rounded-full px-2 py-0.5 h-fit"
                    style={{ background: COLORS.bg, color: COLORS.header }}
                  >
                    {ageLabel(Number(age))}
                  </span>
                  <p className="flex-1 text-sm">{text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => toggleTried(selected.id)}
              className="flex items-center justify-center w-full gap-2 py-3 text-sm font-medium rounded-xl"
              style={{
                background: tried.includes(selected.id) ? CATEGORY_COLORS.Groente : COLORS.bg,
                color: tried.includes(selected.id) ? "#fff" : COLORS.ink,
              }}
            >
              <Check size={16} />
              {tried.includes(selected.id) ? "Al geprobeerd" : "Markeer als geprobeerd"}
            </button>

            {selected.custom && (
              <button
                onClick={() => removeCustomFood(selected.id)}
                className="flex items-center justify-center w-full gap-2 py-3 mt-2 text-sm font-medium rounded-xl"
                style={{ background: COLORS.warnBg, color: COLORS.warn }}
              >
                <Trash2 size={16} />
                Verwijder dit voedingsmiddel
              </button>
            )}
          </div>
        </div>
      )}

      {showAddFood && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(51,42,49,0.4)" }}
          onClick={() => setShowAddFood(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
            style={{ background: COLORS.surface }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header }} className="text-xl font-semibold">
                Zelf een voedingsmiddel toevoegen
              </h2>
              <button onClick={() => setShowAddFood(false)}><X size={20} style={{ color: COLORS.inkSoft }} /></button>
            </div>

            <label className="text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Naam</label>
            <input
              value={foodDraft.name}
              onChange={(e) => setFoodDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Bv. Zoete puntpaprika"
              autoFocus
              className="w-full rounded-xl py-2.5 px-3 text-sm outline-none mt-1 mb-4"
              style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
            />

            <label className="text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Categorie</label>
            <div className="flex flex-wrap gap-2 mt-1 mb-4">
              {Object.keys(CATEGORY_COLORS).map((cat) => {
                const active = foodDraft.cat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFoodDraft((d) => ({ ...d, cat }))}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition"
                    style={{
                      background: active ? CATEGORY_COLORS[cat] : COLORS.bg,
                      color: active ? "#fff" : COLORS.ink,
                      border: `1px solid ${active ? CATEGORY_COLORS[cat] : COLORS.line}`,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-baseline justify-between">
              <label className="text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Vanaf</label>
              <span style={{ color: COLORS.header, fontFamily: "'Fraunces', serif" }} className="text-base font-semibold">{ageLabel(foodDraft.minAge)}</span>
            </div>
            <input
              type="range"
              min={4}
              max={24}
              value={foodDraft.minAge}
              onChange={(e) => setFoodDraft((d) => ({ ...d, minAge: Number(e.target.value) }))}
              className="w-full mb-4"
              style={{ accentColor: COLORS.header }}
            />

            <label className="text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Bereiding (optioneel)</label>
            <textarea
              value={foodDraft.prep}
              onChange={(e) => setFoodDraft((d) => ({ ...d, prep: e.target.value }))}
              placeholder="Bv. Gestoomd tot zacht en fijngeprakt."
              rows={2}
              className="w-full rounded-xl py-2.5 px-3 text-sm outline-none mt-1 mb-4 resize-none"
              style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
            />

            <label className="text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Opmerking (optioneel)</label>
            <input
              value={foodDraft.note}
              onChange={(e) => setFoodDraft((d) => ({ ...d, note: e.target.value }))}
              placeholder="Bv. Enkel goed rijp geven."
              className="w-full rounded-xl py-2.5 px-3 text-sm outline-none mt-1 mb-4"
              style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
            />

            <button
              onClick={() => setFoodDraft((d) => ({ ...d, allergen: !d.allergen }))}
              className="flex items-center w-full gap-2 p-3 mb-4 text-left rounded-xl"
              style={{ background: foodDraft.allergen ? COLORS.warnBg : COLORS.bg, border: `1px solid ${COLORS.line}` }}
            >
              <AlertTriangle size={16} style={{ color: foodDraft.allergen ? COLORS.warn : COLORS.inkSoft }} />
              <span className="flex-1 text-sm" style={{ color: foodDraft.allergen ? COLORS.warn : COLORS.ink }}>Mogelijk allergeen</span>
              {foodDraft.allergen && <Check size={16} style={{ color: COLORS.warn }} />}
            </button>

            <button
              onClick={addCustomFood}
              disabled={!foodDraft.name.trim()}
              className="flex items-center justify-center w-full gap-2 py-3 text-sm font-medium rounded-xl"
              style={{
                background: foodDraft.name.trim() ? COLORS.header : COLORS.bg,
                color: foodDraft.name.trim() ? "#fff" : COLORS.inkSoft,
              }}
            >
              <Plus size={16} />
              Toevoegen
            </button>
          </div>
        </div>
      )}

      {showAddLog && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(51,42,49,0.4)" }}
          onClick={() => setShowAddLog(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl p-5 pb-8 max-h-[75vh] overflow-y-auto"
            style={{ background: COLORS.surface }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header }} className="text-xl font-semibold">
                Toevoegen — {dateTitle(selectedDate).toLowerCase()}
              </h2>
              <button onClick={() => setShowAddLog(false)}><X size={20} style={{ color: COLORS.inkSoft }} /></button>
            </div>

            <div className="relative mb-3">
              <Search size={16} className="absolute -translate-y-1/2 left-3 top-1/2" style={{ color: COLORS.inkSoft }} />
              <input
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Zoek een voedingsmiddel..."
                autoFocus
                className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none"
                style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
              />
            </div>

            <div className="space-y-1.5">
              {allFoods.filter((f) => f.name.toLowerCase().includes(logSearch.toLowerCase())).map((f) => {
                const picked = logSelection.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => setLogSelection((s) => (picked ? s.filter((x) => x !== f.id) : [...s, f.id]))}
                    className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left"
                    style={{ background: COLORS.bg, border: `1px solid ${picked ? COLORS.header : "transparent"}` }}
                  >
                    <span
                      className="flex-shrink-0"
                      style={{ width: 18, height: 18, background: CATEGORY_COLORS[f.cat], borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%" }}
                    />
                    <span className="flex-1 text-sm" style={{ fontWeight: picked ? 600 : 400 }}>{f.name}</span>
                    {picked ? <Check size={16} style={{ color: COLORS.header }} /> : <Plus size={16} style={{ color: COLORS.inkSoft }} />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (logSelection.length) {
                  addLogEntry(logSelection);
                  setLogSelection([]);
                  setLogSearch("");
                }
                setShowAddLog(false);
              }}
              className="sticky bottom-0 w-full py-3 mt-4 text-sm font-medium rounded-xl"
              style={{ background: COLORS.header, color: "#fff" }}
            >
              {logSelection.length
                ? `Voeg maaltijd toe (${logSelection.length} ${logSelection.length === 1 ? "item" : "items"})`
                : "Klaar"}
            </button>
          </div>
        </div>
      )}
      {selectedRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(51,42,49,0.4)" }}
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
            style={{ background: COLORS.surface }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="mb-1 text-xs" style={{ color: COLORS.inkSoft }}>{selectedRecipe.mealType} · vanaf {ageLabel(recipeAgeMin(selectedRecipe))}</p>
                <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header }} className="text-2xl font-semibold">{selectedRecipe.name}</h2>
              </div>
              <button onClick={() => setSelectedRecipe(null)}><X size={20} style={{ color: COLORS.inkSoft }} /></button>
            </div>

            <p className="mt-4 mb-2 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Ingrediënten</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {selectedRecipe.foodIds.map((id) => {
                const f = allFoods.find((ff) => ff.id === id);
                const known = tried.includes(id);
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1"
                    style={{ background: COLORS.bg }}
                  >
                    <span style={{ width: 14, height: 14, background: CATEGORY_COLORS[f?.cat], borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%" }} />
                    <span className="text-xs">{f?.name}</span>
                    {known && <Check size={12} style={{ color: CATEGORY_COLORS.Groente }} />}
                  </span>
                );
              })}
            </div>

            <p className="mb-2 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Bereiding</p>
            <div className="space-y-2">
              {selectedRecipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs font-medium rounded-full"
                    style={{ background: COLORS.bg, color: COLORS.header }}
                  >
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {planPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(51,42,49,0.4)" }}
          onClick={() => setPlanPicker(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl p-5 pb-8 max-h-[75vh] overflow-y-auto"
            style={{ background: COLORS.surface }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header }} className="text-xl font-semibold">
                {planPicker.mealType} — {dateTitle(planPicker.date).toLowerCase()}
              </h2>
              <button onClick={() => setPlanPicker(null)}><X size={20} style={{ color: COLORS.inkSoft }} /></button>
            </div>

            {weekPlan[`${planPicker.date}-${planPicker.mealType}`] && (
              <button
                onClick={() => clearPlan(planPicker.date, planPicker.mealType)}
                className="w-full text-sm font-medium rounded-xl py-2.5 mb-3"
                style={{ background: COLORS.warnBg, color: COLORS.warn }}
              >
                Leegmaken
              </button>
            )}

            <div className="space-y-1.5">
              {RECIPES.slice()
                .sort((a, b) => {
                  const pantryDiff = (recipePantryReady(b, pantry) ? 1 : 0) - (recipePantryReady(a, pantry) ? 1 : 0);
                  if (pantryDiff !== 0) return pantryDiff;
                  return (a.mealType === planPicker.mealType ? -1 : 1) - (b.mealType === planPicker.mealType ? -1 : 1);
                })
                .map((r) => {
                  const inPantry = recipePantryReady(r, pantry);
                  return (
                    <button
                      key={r.id}
                      onClick={() => assignPlan(planPicker.date, planPicker.mealType, r.id)}
                      className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left"
                      style={{ background: COLORS.bg }}
                    >
                      <div className="flex -space-x-1.5 flex-shrink-0">
                        {r.foodIds.slice(0, 3).map((id) => {
                          const f = allFoods.find((ff) => ff.id === id);
                          return (
                            <span
                              key={id}
                              style={{ width: 14, height: 14, background: CATEGORY_COLORS[f?.cat], borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%", border: `1.5px solid ${COLORS.bg}` }}
                            />
                          );
                        })}
                      </div>
                      <span className="flex-1 text-sm">{r.name}</span>
                      {inPantry && <Package size={14} style={{ color: CATEGORY_COLORS.Groente }} />}
                      <span className="text-xs" style={{ color: COLORS.inkSoft }}>{r.mealType}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {selectedLogEntry && (
        <LogEntryModal
          entry={selectedLogEntry}
          foods={entryFoodIds(selectedLogEntry).map((id) => allFoods.find((f) => f.id === id)).filter(Boolean)}
          noteDraft={noteDraft}
          setNoteDraft={setNoteDraft}
          tried={tried}
          onUpdate={(updates) => {
            updateLogEntry(selectedLogEntry.id, updates);
            setSelectedLogEntry((e) => ({ ...e, ...updates }));
          }}
          onSave={() => {
            updateLogEntry(selectedLogEntry.id, { note: noteDraft });
            setSelectedLogEntry(null);
          }}
          onClose={() => setSelectedLogEntry(null)}
          photoUrl={photoUrl}
          photoBusy={photoBusy}
          onPhotoPick={(file) => addEntryPhoto(selectedLogEntry, file)}
          onPhotoRemove={() => removeEntryPhoto(selectedLogEntry)}
        />
      )}

      {showShoppingList && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(51,42,49,0.4)" }}
          onClick={() => setShowShoppingList(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl p-5 pb-8 max-h-[75vh] overflow-y-auto"
            style={{ background: COLORS.surface }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header }} className="text-xl font-semibold">Boodschappenlijst</h2>
              <button onClick={() => setShowShoppingList(false)}><X size={20} style={{ color: COLORS.inkSoft }} /></button>
            </div>
            <p className="mb-3 text-xs" style={{ color: COLORS.inkSoft }}>
              Op basis van je weekplan, min wat je al in huis hebt. Vink af zodra je het kocht — het wordt dan meteen toegevoegd aan je voorraad.
            </p>
            {(() => {
              const neededIds = [
                ...new Set(
                  Object.values(weekPlan)
                    .map((rid) => RECIPES.find((r) => r.id === rid))
                    .filter(Boolean)
                    .flatMap((r) => r.foodIds)
                ),
              ].filter((id) => !pantry.includes(id));
              if (neededIds.length === 0) {
                return (
                  <p className="py-8 text-sm text-center" style={{ color: COLORS.inkSoft }}>
                    Niets nodig — je hebt alles al in huis, of je weekplan is nog leeg.
                  </p>
                );
              }
              return (
                <div className="space-y-1.5">
                  {neededIds.map((id) => {
                    const f = allFoods.find((ff) => ff.id === id);
                    if (!f) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => togglePantry(id)}
                        className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left"
                        style={{ background: COLORS.bg }}
                      >
                        <span
                          className="flex-shrink-0"
                          style={{ width: 16, height: 16, background: CATEGORY_COLORS[f.cat], borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%" }}
                        />
                        <span className="flex-1 text-sm">{f.name}</span>
                        <Check size={16} style={{ color: COLORS.inkSoft }} />
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {showExport && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(51,42,49,0.4)" }}
          onClick={() => { setShowExport(false); setCopyLabel("Kopieer"); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl p-5 pb-8 max-h-[75vh] overflow-y-auto"
            style={{ background: COLORS.surface }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header }} className="text-xl font-semibold">Exporteer gegevens</h2>
              <button onClick={() => { setShowExport(false); setCopyLabel("Kopieer"); }}><X size={20} style={{ color: COLORS.inkSoft }} /></button>
            </div>
            <p className="mb-3 text-xs" style={{ color: COLORS.inkSoft }}>
              Kopieer deze tekst en bewaar ze ergens veilig (bv. Notities of e-mail) als back-up.
            </p>
            <textarea
              readOnly
              value={JSON.stringify({ tried, logs, weekPlan, pantry }, null, 2)}
              rows={10}
              className="w-full p-3 mb-3 font-mono text-xs outline-none rounded-xl"
              style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
            />
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(JSON.stringify({ tried, logs, weekPlan, pantry }, null, 2));
                  setCopyLabel("Gekopieerd!");
                } catch (e) {
                  setCopyLabel("Kopiëren mislukt — selecteer manueel");
                }
              }}
              className="flex items-center justify-center w-full gap-2 py-3 text-sm font-medium rounded-xl"
              style={{ background: COLORS.header, color: "#fff" }}
            >
              <Copy size={15} /> {copyLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LogEntryModal({ entry, foods, noteDraft, setNoteDraft, onSave, onClose, onUpdate, tried, photoUrl, photoBusy, onPhotoPick, onPhotoRemove }) {
  const mealName = foods.map((f) => f.name).join(" + ");
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(51,42,49,0.4)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
        style={{ background: COLORS.surface }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.header }} className="text-2xl font-semibold">{mealName}</h2>
            <p className="mt-1 text-xs" style={{ color: COLORS.inkSoft }}>{entry.time}</p>
          </div>
          <button onClick={onClose}><X size={20} style={{ color: COLORS.inkSoft }} /></button>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <p className="mb-2 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Datum</p>
            <input
              type="date"
              value={entry.date}
              onChange={(e) => e.target.value && onUpdate({ date: e.target.value })}
              className="w-full px-3 py-2 text-sm outline-none rounded-xl"
              style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
            />
          </div>
        </div>

        <p className="mb-2 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Maaltijd</p>
        <div className="flex gap-2 mb-4">
          {MEALS.map((m) => {
            const active = entry.meal === m;
            return (
              <button
                key={m}
                onClick={() => onUpdate({ meal: m })}
                className="flex-1 py-2 text-xs font-medium rounded-xl"
                style={{ background: active ? COLORS.header : COLORS.bg, color: active ? "#fff" : COLORS.inkSoft }}
              >
                {m}
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Hoeveel gegeten?</p>
        <div className="flex gap-2 mb-4">
          {AMOUNTS.map((a) => {
            const active = entry.amount === a.key;
            return (
              <button
                key={a.key}
                onClick={() => onUpdate({ amount: active ? null : a.key })}
                className="flex-1 rounded-xl py-2.5 text-xs font-medium"
                style={{ background: active ? CATEGORY_COLORS.Groente : COLORS.bg, color: active ? "#fff" : COLORS.inkSoft }}
              >
                {a.label}
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Reactie</p>
        <div className="flex gap-2 mb-4">
          {REACTIONS.map((r) => {
            const Icon = r.icon;
            const active = entry.reaction === r.key;
            return (
              <button
                key={r.key}
                onClick={() => onUpdate({ reaction: active ? null : r.key })}
                className="flex-1 flex flex-col items-center gap-1 rounded-xl py-2.5"
                style={{ background: active ? r.color : COLORS.bg, color: active ? "#fff" : COLORS.inkSoft }}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            );
          })}
        </div>

        {supabaseEnabled && (
          <>
            <p className="mb-2 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Foto</p>
            {entry.photo ? (
              <div className="relative mb-4">
                <img src={photoUrl(entry.photo)} alt={mealName} className="object-cover w-full rounded-xl max-h-64" />
                <button
                  onClick={onPhotoRemove}
                  className="absolute top-2 right-2 rounded-full p-1.5"
                  style={{ background: "rgba(51,42,49,0.6)" }}
                >
                  <Trash2 size={14} color="#fff" />
                </button>
              </div>
            ) : (
              <label
                className="flex items-center justify-center w-full gap-2 py-3 mb-4 text-sm font-medium cursor-pointer rounded-xl"
                style={{ background: COLORS.bg, color: photoBusy ? COLORS.inkSoft : COLORS.ink, border: `1px dashed ${COLORS.inkSoft}` }}
              >
                <Camera size={16} />
                {photoBusy ? "Bezig met uploaden..." : "Foto toevoegen"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={photoBusy}
                  onChange={(e) => e.target.files?.[0] && onPhotoPick(e.target.files[0])}
                />
              </label>
            )}
          </>
        )}

        <p className="mb-2 text-xs tracking-wide uppercase" style={{ color: COLORS.inkSoft }}>Notitie</p>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Bv. huiduitslag, veel gegeten, spuugde het uit..."
          rows={3}
          className="w-full p-3 mb-4 text-sm outline-none rounded-xl"
          style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
        />

        <button
          onClick={onSave}
          className="w-full py-3 text-sm font-medium rounded-xl"
          style={{ background: COLORS.header, color: "#fff" }}
        >
          Opslaan
        </button>
      </div>
    </div>
  );
}
