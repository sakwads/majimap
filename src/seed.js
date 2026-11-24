// Static sample data for the MajiMap prototype. Nothing here is real: names, figures and
// coordinates are made up for one demo county (Makueni). The store in db.js copies this
// into the browser, so "Reset all data" always comes back to exactly this file.

export const ASSET_TYPES = {
  borehole: { label: "Borehole", icon: "building-broadcast-tower", code: "BH" },
  handpump: { label: "Hand pump", icon: "bucket-droplet", code: "HP" },
  tank: { label: "Water tank", icon: "cylinder", code: "WT" },
  valve: { label: "Valve", icon: "steering-wheel", code: "VL" },
  kiosk: { label: "Water kiosk", icon: "building-store", code: "WK" },
  dam: { label: "Dam or pan", icon: "ripple", code: "DP" },
  works: { label: "Treatment works", icon: "building-factory-2", code: "TW" },
};
export const STATUS = {
  operational: { label: "Operational", tone: "operational", icon: "check" },
  repair: { label: "Needs repair", tone: "repair", icon: "alert-triangle" },
  faulty: { label: "Faulty", tone: "faulty", icon: "x" },
  unverified: { label: "Unverified", tone: "unverified", icon: "clock" },
};
export const WARDS = [
  // Share of people within reach of a working water point (sample figures) and the ward shape on the map image (1360 x 836)
  { id: "kasikeu", name: "Kasikeu", sub: "Kilome", access: 31, label: [362, 512], shape: "110,400 180,395 250,357 340,352 430,360 452,430 462,500 500,610 455,655 420,700 380,770 330,715 290,690 210,672 150,640 130,620 126,540 112,470" },
  { id: "kilungu", name: "Kilungu", sub: "Kaiti", access: 38, label: [512, 202], shape: "250,70 320,46 400,52 470,24 520,20 620,22 700,30 760,50 742,130 735,190 700,235 665,270 640,340 580,338 520,372 470,368 430,360 340,352 250,357 180,395 110,400 108,330 130,260 165,200 205,130" },
  { id: "mukaa", name: "Mukaa", sub: "Kilome", access: 52, label: [966, 198], shape: "760,50 830,62 900,56 1010,30 1080,70 1140,112 1210,128 1290,150 1284,230 1262,310 1230,380 1150,388 1080,396 980,388 880,400 820,372 760,360 700,340 640,340 665,270 700,235 735,190 742,130" },
  { id: "mbooni", name: "Mbooni", sub: "Mbooni", access: 61, label: [1096, 512], shape: "880,400 980,388 1080,396 1150,388 1230,380 1262,440 1290,500 1292,600 1250,650 1210,682 1160,700 1130,740 1060,762 1000,770 950,772 900,800 850,740 828,690 830,640 836,570 846,500" },
  { id: "kathonzweni", name: "Kathonzweni", sub: "Makueni", access: 74, label: [692, 728], shape: "500,610 560,618 600,632 650,634 690,616 760,628 830,640 828,690 850,740 900,800 830,818 760,830 690,822 620,820 550,806 480,790 430,782 380,770 420,700 455,655" },
  { id: "wote", name: "Wote", sub: "Makueni", access: 83, label: [740, 452], shape: "430,360 470,368 520,372 580,338 640,340 700,340 760,360 820,372 880,400 846,500 836,570 830,640 760,628 690,616 650,634 600,632 560,618 500,610 462,500 452,430" },
];
const WARD_FULL = { kilungu: "Kilungu ward", wote: "Wote/Nziu ward", kasikeu: "Kasikeu ward", mbooni: "Mbooni ward", mukaa: "Mukaa ward", kathonzweni: "Kathonzweni ward" };

const A = (_id, name, type, num, ward, wardName, sub, status, managedBy, maintained, x, y, extra = {}) => ({
  _id, name, type, code: `MKN-${ASSET_TYPES[type].code}-${num}`, ward, wardName, sub, status, managedBy, maintained, x, y,
  owner: "Makueni County", installed: "2014", serves: "About 800 people", coords: "-1.7861, 37.6312", source: "Makueni County asset register · updated 4 Nov 2026", ...extra,
});
const assets = [
  A("a_kwamutonga", "Kwa Mutonga borehole", "borehole", "004217", "kilungu", "Kilungu ward", "Kaiti", "operational", "Makueni Water Co.", "4 Nov 2026", 38.7, 39,
    { installed: "2009", depth: "180 m", yield: "2.1 m³ per hour", serves: "About 2,400 people", coords: "-1.8036, 37.6237", statusNote: "Since 4 Nov 2026 · temporary pump", project: "prj_0117", photos: 9 }),
  A("a_nguu", "Nguu borehole", "borehole", "004388", "mukaa", "Nguu/Masumba ward", "Kibwezi East", "faulty", "Makueni County", "2 Jul 2026", 63.7, 34.5,
    { depth: "210 m", yield: "Not flowing", serves: "About 1,900 people", coords: "-1.7911, 37.6602", statusNote: "Pump failed 14 Nov 2026", photos: 4 }),
  A("a_kasikeu", "Kasikeu hand pump", "handpump", "001187", "kasikeu", "Kasikeu ward", "Kilome", "repair", "Water committee", "28 Sep 2026", 27, 62, { serves: "About 350 people", photos: 3 }),
  A("a_wotehp", "Wote road hand pump", "handpump", "001240", "wote", "Wote/Nziu ward", "Makueni", "repair", "Water committee", "3 Sep 2026", 52, 56, { serves: "About 420 people", photos: 2 }),
  A("a_kalamba", "Kalamba valve chamber", "valve", "000245", "wote", "Nzaui/Kilili/Kalamba ward", "Makueni", "unverified", "Not recorded", "Not recorded", 51, 65.5, { owner: "Not recorded", installed: "Not recorded", serves: "Not recorded", source: "Field survey 2026 · added 20 Nov 2026" }),
  A("a_mboonitank", "Mbooni tank", "tank", "000611", "kasikeu", "Mbooni ward", "Mbooni", "operational", "Mbooni water project", "19 Nov 2026", 34.5, 70.5, { capacity: "50,000 L", serves: "About 1,200 people", project: "prj_0130" }),
  A("a_wotekiosk", "Wote market kiosk", "kiosk", "000318", "wote", "Wote/Nziu ward", "Makueni", "operational", "WOMIWASCO", "30 Oct 2026", 57, 47, { serves: "About 600 people a day", project: "prj_0121" }),
  A("a_kathkiosk", "Kathonzweni kiosk", "kiosk", "000356", "kathonzweni", "Kathonzweni ward", "Makueni", "unverified", "Not recorded", "Not recorded", 62.4, 80, { owner: "Not recorded", source: "Community report RPT-MKN-0287 · added 18 Nov 2026" }),
  A("a_emali", "Emali borehole", "borehole", "004501", "kilungu", "Emali/Mulala ward", "Kibwezi West", "operational", "Makueni County", "15 Oct 2026", 19, 24, { depth: "160 m", yield: "3.4 m³ per hour" }),
  A("a_kathhp", "Kathonzweni hand pump", "handpump", "001102", "kathonzweni", "Kathonzweni ward", "Makueni", "repair", "Water committee", "12 Aug 2026", 45, 90, { project: "prj_0124" }),
  A("a_mtito", "Mtito Andei borehole", "borehole", "004563", "mukaa", "Mtito Andei ward", "Kibwezi East", "faulty", "Makueni County", "21 Jun 2026", 88, 31, { depth: "240 m", yield: "Not flowing" }),
  A("a_tulimani", "Tulimani kiosk", "kiosk", "000342", "kasikeu", "Tulimani ward", "Mbooni", "operational", "Mbooni water project", "7 Nov 2026", 14, 52),
  A("a_woteworks", "Wote treatment works", "works", "000012", "mukaa", "Wote/Nziu ward", "Makueni", "operational", "WOMIWASCO", "11 Nov 2026", 61, 11, { capacity: "1,200 m³ a day", serves: "About 18,000 people" }),
  A("a_kaitipan", "Kaiti water pan", "dam", "000087", "kilungu", "Kilungu ward", "Kaiti", "operational", "Water committee", "2 Oct 2026", 28, 16, { capacity: "12,000 m³" }),
  A("a_mukaatank", "Mukaa tank", "tank", "000640", "mukaa", "Mukaa ward", "Kilome", "repair", "Makueni Water Co.", "17 Jul 2026", 80, 20, { capacity: "24,000 L" }),
  A("a_mbooniborehole", "Mbooni market borehole", "borehole", "004611", "mbooni", "Mbooni ward", "Mbooni", "operational", "Mbooni water project", "9 Nov 2026", 82, 63),
  A("a_kikumini", "Kikumini hand pump", "handpump", "001311", "mbooni", "Kikumini ward", "Makueni", "faulty", "Water committee", "30 May 2026", 91, 74),
  A("a_kitise", "Kitise kiosk", "kiosk", "000371", "kathonzweni", "Kitise ward", "Makueni", "operational", "WOMIWASCO", "1 Nov 2026", 55, 94),
  A("a_nzauivalve", "Nzaui valve chamber", "valve", "000251", "wote", "Nzaui/Kilili/Kalamba ward", "Makueni", "operational", "Makueni Water Co.", "22 Oct 2026", 43, 50),
  A("a_kyuso", "Kalawa borehole", "borehole", "004702", "mbooni", "Kalawa ward", "Mbooni", "operational", "Makueni County", "5 Nov 2026", 73, 86),
  A("a_mavindini", "Mavindini kiosk", "kiosk", "000388", "mbooni", "Mavindini ward", "Makueni", "unverified", "Not recorded", "Not recorded", 95, 52, { source: "Registered by Amina Mwende · 23 Nov 2026" }),
  A("a_kilometank", "Kilome tank", "tank", "000655", "kasikeu", "Kasikeu ward", "Kilome", "operational", "Makueni Water Co.", "14 Nov 2026", 11, 70),
  A("a_ilima", "Ilima hand pump", "handpump", "001352", "kilungu", "Ilima ward", "Kaiti", "operational", "Water committee", "26 Oct 2026", 47, 10),
  A("a_ukia", "Ukia borehole", "borehole", "004733", "kilungu", "Ukia ward", "Kaiti", "repair", "Makueni County", "8 Sep 2026", 9, 34),
];
// The trunk main drawn on the map (percent points) and one asset cluster
export const PIPELINE = [[28, 86], [41.2, 74], [63.7, 34.5], [79.5, 29.8]];
export const CLUSTER = { x: 76, y: 56.5, count: 42 };

const M = (title, note, due, owner, progress, evidence, status) => ({ title, note, due, owner, progress, evidence, status });
const P = (_id, code, name, stage, health, healthLabel, ward, asset, budget, spent, done, contractor, ends, next, funder, extra = {}) => ({
  _id, code, name, stage, health, healthLabel, ward, asset, budget, spent, done, contractor, ends, next, funder,
  start: "6 Oct 2026", lead: "Amina Mwende", photos: 4, evidenceNote: "Last update 2 Oct", milestones: [], evidence: [], ...extra,
});
export const STAGES = ["Identification", "Assessment", "Approval", "Procurement", "Implementation", "Inspection", "Handover", "Maintenance"];
export const STAGE_LONG = ["Project identification", "Assessment and proposal", "Approval and funding", "Procurement", "Implementation", "Inspection and verification", "Completion and handover", "Operational maintenance"];
const projects = [
  P("prj_0117", "MKN-PRJ-0117", "Kwa Mutonga borehole rehabilitation", 5, "on-track", "On track", "Kilungu ward, Kaiti", "a_kwamutonga", 3450000, 1725000, 50, "Ukambani Pumps", "28 Feb 2027", "Pump installation, due 15 Dec 2026", "Water Sector Trust Fund", {
    x: 43, y: 24, committed: 690000, photos: 9, evidenceNote: "Verified to 18 Nov", evidenceTone: "operational", fundingRef: "WSTF/MKN/2026/041",
    objective: "Return the Kwa Mutonga borehole to full service with a solar pump, a new rising main and a kiosk for about 2,400 people.",
    milestones: [
      M("Site assessment and borehole survey", "Hydrogeological survey, yield test and assessment report", "12 Oct 2026", "Kioko Water Consult", 100, 6, "done"),
      M("Pump and rising main supply", "Submersible pump, solar array and 120 m HDPE rising main", "15 Dec 2026", "Ukambani Pumps", 50, 4, "progress"),
      M("Storage tank and kiosk", "10,000 L tank, stand and water kiosk", "30 Nov 2026", "Ukambani Pumps", 25, 1, "overdue"),
      M("Commissioning and handover", "Test run, training and handover to the water committee", "28 Feb 2027", "Makueni Water Dept", 0, 0, "upcoming"),
    ],
    spend: [["Site assessment and borehole survey", 150000], ["Pump and rising main supply", 1320000], ["Storage tank and kiosk", 255000], ["Commissioning and handover", 0]],
    evidence: [
      { _id: "ev1", title: "Pump house, east side", gps: "-1.8036, 37.6237 · within 4 m", by: "Uploaded by Ukambani Pumps · 18 Nov 2026, 10:42", step1: "J. Kioko, 18 Nov", step2: "F. Musyoka, 19 Nov" },
      { _id: "ev2", title: "Rising main, trench 2", gps: "-1.8038, 37.6240 · within 6 m", by: "Uploaded by Ukambani Pumps · 18 Nov 2026, 11:05", step1: "J. Kioko, 18 Nov", step2: null },
      { _id: "ev3", title: "Tank stand foundation", gps: "-1.8033, 37.6235 · within 5 m", by: "Uploaded by Ukambani Pumps · 21 Nov 2026, 09:18", step1: null, step2: null },
    ],
    activity: [
      { icon: "clock", title: "Pump installation", meta: "Due 15 Dec 2026 · Ukambani Pumps", pending: true },
      { icon: "tool", title: "Rising main replaced", meta: "18 Nov 2026 · Ukambani Pumps", body: "120 m of HDPE rising main laid and pressure-tested.", photos: 4, verified: true },
      { icon: "tool", title: "Temporary pump fitted", meta: "28 Oct 2026 · Ukambani Pumps", photos: 3, verified: true },
      { icon: "tool", title: "Site cleared and borehole flushed", meta: "20 Oct 2026 · Ukambani Pumps", photos: 2, verified: true },
      { icon: "receipt", title: "Contractor appointed", meta: "2 Oct 2026 · Makueni County procurement", body: "Ukambani Pumps appointed through the county procurement process." },
      { icon: "coin", title: "Funding approved", meta: "18 Sep 2026 · Water Sector Trust Fund", body: "KES 3,450,000 approved under WSTF/MKN/2026/041." },
    ],
    handover: [
      { title: "Completion certificate", note: "Signed by the county engineer and the contractor.", status: "pending" },
      { title: "As-built drawings and pump specifications", note: "To be uploaded by Ukambani Pumps.", status: "pending" },
      { title: "Training for the water committee", note: "Two sessions at the Kwa Mutonga water point.", status: "pending" },
      { title: "Warranty and service agreement", note: "12 months parts and labour, signed copy attached.", status: "pending" },
      { title: "Asset record update", note: "Set the borehole to Operational once the county engineer verifies.", status: "blocked" },
    ],
  }),
  P("prj_0121", "MKN-PRJ-0121", "Wote market kiosk extension", 4, "at-risk", "At risk", "Wote/Nziu ward, Makueni", "a_wotekiosk", 1180000, 118000, 0, "Kitui Pipeworks", "31 Mar 2027", "Appoint contractor, due 30 Nov 2026", "County Government of Makueni", { x: 57, y: 43, photos: 0, rfq: true,
    milestones: [M("Design and bill of quantities", "Kiosk extension drawings and BoQ", "30 Oct 2026", "Makueni Water Dept", 100, 2, "done"), M("Appoint contractor", "Evaluate quotations and appoint", "30 Nov 2026", "Makueni Water Dept", 20, 0, "progress"), M("Build extension", "Two more taps and a 5,000 L tank", "28 Feb 2027", "Kitui Pipeworks", 0, 0, "upcoming")] }),
  P("prj_0124", "MKN-PRJ-0124", "Kathonzweni hand pump repair", 5, "delayed", "Delayed", "Kathonzweni ward, Makueni", "a_kathhp", 420000, 277000, 50, "Kathonzweni Works", "30 Oct 2026", "Pump replacement, was due 12 Nov 2026", "World Vision Kenya", { x: 45, y: 86, warn: "Spend is ahead of work: 66% spent, 50% done", evidenceTone: "warning",
    milestones: [M("Strip and inspect pump", "Remove rods, inspect cylinder", "20 Sep 2026", "Kathonzweni Works", 100, 3, "done"), M("Pump replacement", "Fit new India Mark II head and rods", "12 Nov 2026", "Kathonzweni Works", 40, 1, "overdue")] }),
  P("prj_0130", "MKN-PRJ-0130", "Mbooni tank pipeline", 6, "inspection", "In inspection", "Mbooni ward, Mbooni", "a_mboonitank", 5900000, 5664000, 100, "Mbooni Civil", "20 Dec 2026", "County inspection, booked 26 Nov 2026", "Water Sector Trust Fund", { x: 34.5, y: 66, photos: 14, evidenceNote: "Awaiting inspection", evidenceTone: "warning", action: "Record inspection",
    milestones: [M("Trenching and pipe laying", "2.4 km of 63 mm HDPE", "30 Sep 2026", "Mbooni Civil", 100, 8, "done"), M("Tank connection and testing", "Connect, pressure-test and flush", "10 Nov 2026", "Mbooni Civil", 100, 6, "done")] }),
  P("prj_0135", "MKN-PRJ-0135", "Kasikeu hand pump rehabilitation", 7, "completed", "Completed", "Kasikeu ward, Kilome", "a_kasikeu", 380000, 368000, 100, "Kasikeu Pumps", "4 Nov 2026", "Hand pump back in operation, 4 Nov 2026", "County Government of Makueni", { x: 27, y: 58, photos: 16, evidenceNote: "Verified by county", evidenceTone: "operational", closed: true,
    milestones: [M("Replace pump head and rods", "New head, rods and apron repair", "28 Oct 2026", "Kasikeu Pumps", 100, 10, "done"), M("Handover to water committee", "Training and handover", "4 Nov 2026", "Makueni Water Dept", 100, 6, "done")] }),
  P("prj_0133", "MKN-PRJ-0133", "Emali borehole drilling", 3, "not-started", "Not started", "Emali/Mulala ward, Kibwezi West", "a_emali", 6200000, 0, 0, "Kamba Drillers", "30 Jun 2027", "Funding approval, due 15 Jan 2027", "Water Sector Trust Fund", { x: 19, y: 20, photos: 0, action: "Submit for approval",
    milestones: [M("Hydrogeological survey", "Survey and drilling permit", "20 Dec 2026", "Kioko Water Consult", 0, 0, "upcoming")] }),
];

const suppliers = [
  { _id: "s_wote", name: "Wote Pumps & Water Ltd", verified: true, base: "Wote", serves: "Makueni, Machakos, Kitui", tags: ["Solar pumps", "Submersible pumps", "Borehole drilling"], replies: "Within 1 day", quotes: "12 on MajiMap", since: "2021", category: "Pumps & drilling", photos: 20,
    about: "Family-run supplier of submersible and solar pumps, tanks and pipe fittings for borehole projects across Ukambani. Offers installation support and a 12-month workmanship warranty.", lead: "7 to 14 days", contact: "Faith Mutua, sales lead", phone: "+254 712 000 000", services: ["Submersible pumps", "Solar pumping kits", "Water storage tanks", "HDPE and PVC piping", "Pump installation"] },
  { _id: "s_kilungu", name: "Kilungu Tanks & Piping", verified: true, base: "Kilungu", serves: "Makueni, Kitui", tags: ["Water tanks", "HDPE piping"], replies: "Within 2 days", quotes: "9 on MajiMap", since: "2019", category: "Tanks & piping", photos: 20,
    about: "Stockist of storage tanks from 1,000 to 24,000 litres and HDPE pipe in coils, with delivery to site across Makueni.", lead: "5 to 10 days", contact: "Daniel Kyalo, depot manager", phone: "+254 713 000 000", services: ["Water storage tanks", "HDPE piping", "Pipe fittings"] },
  { _id: "s_mbooni", name: "Mbooni Civil Works", verified: true, base: "Mbooni", serves: "Makueni", tags: ["Civil works", "Plumbing"], replies: "Within 1 day", quotes: "7 on MajiMap", since: "2020", category: "Civil works", photos: 20,
    about: "Registered contractor for trenching, tank stands, kiosks and pipeline installation.", lead: "14 to 30 days", contact: "Ruth Nduku, director", phone: "+254 714 000 000", services: ["Trenching and pipe laying", "Tank stands", "Kiosk construction", "Plumbing"] },
  { _id: "s_kibwezi", name: "Kibwezi Drillers Co-op", verified: false, base: "Kibwezi", serves: "Makueni", tags: ["Borehole drilling"], replies: "Not yet known", quotes: "None yet", since: "2026", category: "Pumps & drilling", photos: 0,
    about: "New drilling cooperative with one rotary rig. Verification documents are being checked.", lead: "Not yet known", contact: "Musa Ndolo, chair", phone: "+254 715 000 000", services: ["Borehole drilling", "Test pumping"] },
  { _id: "s_nzaui", name: "Nzaui Solar & Pumps", verified: true, base: "Wote", serves: "Makueni, Kitui", tags: ["Solar pumps", "Plumbing"], replies: "Within 1 day", quotes: "5 on MajiMap", since: "2022", category: "Pumps & drilling", photos: 20,
    about: "Solar pumping installer for community boreholes and farm supplies.", lead: "7 to 21 days", contact: "Joseph Musau, sales engineer", phone: "+254 716 000 000", services: ["Solar pumping kits", "Controllers", "Installation and service"] },
  { _id: "s_athi", name: "Athi Water Technologies", verified: true, base: "Athi River", serves: "Machakos, Makueni, Kajiado", tags: ["Water treatment", "Testing equipment"], replies: "Within 3 days", quotes: "15 on MajiMap", since: "2018", category: "Treatment & testing", photos: 20,
    about: "Supplies chlorine dosing units, filters and handheld water quality meters, with operator training.", lead: "10 to 21 days", contact: "Brian Otieno, technical sales", phone: "+254 717 000 000", services: ["Chlorine dosing", "Filtration", "Water testing kits", "Operator training"] },
];
const products = [
  { _id: "p_solar5", name: "Solar pumping kit 5 kW", cat: "Solar pumps", stock: true, supplier: "s_wote", price: 612000, priceNote: "Panels included", specs: [["Power", "5 kW (solar DC)"], ["Max head", "180 m"], ["Flow", "6 m³/h at 120 m head"], ["Outlet", "2 inch"], ["Controller", "Included"], ["Warranty", "2 years"]] },
  { _id: "p_sub3", name: "Submersible pump 3 HP", cat: "Submersible pumps", stock: true, supplier: "s_wote", price: 148000, priceNote: "Excl. installation", specs: [["Power", "2.2 kW"], ["Max head", "140 m"], ["Flow", "3.6 m³/h at 100 m"], ["Outlet", "1¼ inch"], ["Controller", "Sold separately"], ["Warranty", "12 months"]] },
  { _id: "p_hdpe63", name: "HDPE pipe 63 mm, 100 m coil", cat: "Piping", stock: false, supplier: "s_kilungu", price: 38500, priceNote: "Excl. fittings", specs: [["Material", "HDPE PE100"], ["Pressure", "PN 10"], ["Diameter", "63 mm"], ["Length", "100 m coil"], ["Standard", "KS ISO 4427"], ["Warranty", "12 months"]] },
  { _id: "p_tank10", name: "Water tank 10,000 L", cat: "Storage tanks", stock: true, supplier: "s_kilungu", price: 95000, priceNote: "Delivery quoted separately", specs: [["Capacity", "10,000 L"], ["Material", "Polyethylene"], ["Colour", "Black"], ["Use", "Potable water"], ["Standard", "KEBS marked"], ["Warranty", "5 years"]] },
  { _id: "p_chlor", name: "Chlorine dosing unit", cat: "Treatment", stock: true, supplier: "s_athi", price: 72000, priceNote: "Excl. installation", specs: [["Type", "Pump-fed dosing"], ["Dose range", "0.5 to 5 mg/L"], ["Flow", "Up to 8 m³/h"], ["Power", "230 V AC"], ["Tank", "60 L"], ["Warranty", "12 months"]] },
  { _id: "p_nz3", name: "Solar pumping kit 3 kW", cat: "Solar pumps", stock: true, supplier: "s_nzaui", price: 438000, priceNote: "Panels and controller included", specs: [["Power", "3 kW (solar DC)"], ["Max head", "120 m"], ["Flow", "4 m³/h at 80 m head"], ["Outlet", "1½ inch"], ["Controller", "Included"], ["Warranty", "2 years"]] },
  { _id: "p_nzctl", name: "Solar pump controller 48 V", cat: "Solar pumps", stock: false, supplier: "s_nzaui", price: 46500, priceNote: "Excl. installation", specs: [["Input", "48 V DC, MPPT"], ["Max power", "5.5 kW"], ["Protection", "Dry-run, over-voltage"], ["Display", "LED status"], ["Enclosure", "IP65"], ["Warranty", "12 months"]] },
  { _id: "p_meter", name: "Handheld water quality meter", cat: "Testing", stock: false, supplier: "s_athi", price: 28500, priceNote: "Probes included", specs: [["Measures", "pH, EC, TDS, temp"], ["Range", "0 to 14 pH"], ["Accuracy", "± 0.1 pH"], ["Display", "Backlit LCD"], ["Power", "2 AAA batteries"], ["Warranty", "12 months"]] },
];
const rfqs = [
  { _id: "rfq_0042", code: "RFQ-MKN-0042", title: "Solar pump set for Kwa Mutonga borehole", status: "open", statusLabel: "Open", cat: "Solar pumps", project: "prj_0117", projectLabel: "MKN-PRJ-0117 · Kwa Mutonga borehole rehabilitation", deliver: "Kilungu ward, Kaiti", closes: "30 Nov 2026", closesLong: "30 Nov 2026, 17:00", published: "20 Nov 2026", needed: "15 Dec 2026", estimate: 1300000, received: 4,
    items: [{ name: "Solar submersible pump, 5 kW", spec: "Solar pumps · Max head 180 m, 6 m³/h", qty: "1" }, { name: "Solar panel array, 6 kW", spec: "Solar pumps · 12 panels, mounting frame included", qty: "1 set" }, { name: "Pump controller", spec: "Solar pumps · MPPT controller, 48 V DC input, dry-run protection", qty: "1" }],
    questions: [{ _id: "q1", when: "Today, 9:40", q: "What is the static water level and the total head the pump must deliver?", a: null }, { _id: "q2", when: "20 Nov 2026", q: "Is 2 kW the minimum panel array, or can we offer a larger array?", a: "2 kW is the minimum. You can offer a larger array as an option, priced on its own line.", aWhen: "21 Nov 2026" }] },
  { _id: "rfq_0041", code: "RFQ-MKN-0041", title: "HDPE pipe for Kibwezi distribution line", status: "closing", statusLabel: "Closes in 2 days", cat: "Piping", project: null, projectLabel: "MKN-PRJ-0109 · Kibwezi pipeline extension", deliver: "Kibwezi town", closes: "25 Nov 2026", closesLong: "25 Nov 2026, 17:00", published: "11 Nov 2026", needed: "10 Dec 2026", estimate: 1540000, received: 6,
    items: [{ name: "HDPE pipe 63 mm, PN 10", spec: "Piping · 100 m coils", qty: "40 coils" }, { name: "Electrofusion couplers", spec: "Piping · 63 mm", qty: "60" }, { name: "Gate valves 63 mm", spec: "Piping · Brass, flanged", qty: "12" }], questions: [] },
  { _id: "rfq_0036", code: "RFQ-MKN-0036", title: "Storage tanks for Mtito Andei pan", status: "closed", statusLabel: "Closed", cat: "Storage tanks", project: null, projectLabel: "MKN-PRJ-0098 · Mtito Andei pan desilting", deliver: "Mtito Andei", closes: "12 Nov 2026", closesLong: "12 Nov 2026, 17:00", published: "28 Oct 2026", needed: "30 Nov 2026", estimate: 920000, received: 5,
    items: [{ name: "Water tank, 10,000 L", spec: "Storage tanks · Polyethylene", qty: "3" }, { name: "Steel tank stand", spec: "Storage tanks · 3 m", qty: "3" }, { name: "Float valves", spec: "Storage tanks · 1 inch", qty: "3" }], questions: [] },
];
const quotes = [
  { _id: "qt1", rfq: "rfq_0042", supplier: "Wote Pumps & Water Ltd", total: 1248000, match: "3 of 3 items", delivery: "14 days", warranty: "2 years", valid: "12 Dec 2026", state: "submitted" },
  { _id: "qt2", rfq: "rfq_0042", supplier: "Machakos Solar Ltd", total: 1196500, match: "3 of 3 items", delivery: "21 days", warranty: "1 year", valid: "10 Dec 2026", state: "submitted", lowest: true },
  { _id: "qt3", rfq: "rfq_0042", supplier: "Kibwezi Pumps Co.", total: 1310000, match: "2 of 3 items", delivery: "10 days", warranty: "2 years", valid: "5 Dec 2026", state: "submitted" },
  { _id: "qt4", rfq: "rfq_0042", supplier: "Mwangaza Water Treatment", total: 1402000, match: "3 of 3 items", delivery: "7 days", warranty: "3 years", valid: "15 Dec 2026", state: "submitted" },
  // Nzaui Solar & Pumps (the supplier demo account) has a draft quote it has not sent yet
  { _id: "qt_nz_0041", rfq: "rfq_0041", supplier: "Nzaui Solar & Pumps", supplierId: "s_nzaui", total: 1495000, match: "2 of 3 items", delivery: "14 days", warranty: "1 year", valid: "", ref: "NSP-Q-2026-087", note: "", state: "draft" },
];
const history = [
  { _id: "h1", title: "Storage tanks for Mtito Andei pan", code: "RFQ-MKN-0036", supplier: "Kilungu Tanks & Piping", total: 884000, state: "Preferred", when: "14 Nov 2026" },
  { _id: "h2", title: "Hand pump spares, Kasikeu", code: "RFQ-MKN-0029", supplier: "Wote Pumps & Water Ltd", total: 96500, state: "Preferred", when: "9 Oct 2026" },
  { _id: "h3", title: "Chlorine dosing, Wote works", code: "RFQ-MKN-0021", supplier: "Athi Water Technologies", total: 214000, state: "Declined", when: "2 Sep 2026" },
];

const RT = { leak: { label: "Pipe leak", long: "Leak or damaged pipe", icon: "droplet" }, nowater: { label: "No water", long: "No water", icon: "droplet-off" }, pump: { label: "Hand pump broken", long: "Broken water point", icon: "bucket-droplet" } };
export const REPORT_TYPES = RT;
const R = (n, type, title, sub, ward, wsub, ago, at, ai, status, extra = {}) => ({ _id: "rpt_" + n, code: "RPT-MKN-0" + n, type, title, sub, ward, wsub, ago, at, ai, status, ...extra });
const reports = [
  R(311, "leak", "Pipe leak", "2 photos · near MKN-BH-004217", "Kilungu ward", "Kaiti", "12 minutes ago", "23 Nov 2026, 20:55", "MKN-BH-004217", "unverified", { asset: "a_kwamutonga", x: 40.2, y: 43, words: "Maji yanavuja kwenye bomba karibu na kioski tangu asubuhi.", english: "Water has been leaking from the pipe near the kiosk since morning.", distance: "12 m from Kwa Mutonga borehole", photos: 2, voice: "0:18, Kiswahili", confType: "High", confAsset: "Medium" }),
  R(310, "nowater", "No water for 3 days", "1 photo · Wote market", "Wote/Nziu ward", "Makueni", "1 hour ago", "23 Nov 2026, 20:05", null, "unverified", { x: 58.5, y: 50.5, words: "Hakuna maji kwenye kioski kwa siku tatu.", english: "There has been no water at the kiosk for three days.", distance: "40 m from Wote market kiosk", photos: 1, confType: "High", suggest: "a_wotekiosk", confAsset: "Low" }),
  R(309, "pump", "Hand pump broken", "3 photos · MKN-HP-001187", "Kasikeu ward", "Kilome", "3 hours ago", "23 Nov 2026, 18:10", "MKN-HP-001187", "unverified", { asset: "a_kasikeu", x: 28.4, y: 65.5, words: "Pampu ya mkono imevunjika mpini.", english: "The hand pump handle is broken.", distance: "4 m from Kasikeu hand pump", photos: 3, confType: "High", confAsset: "High" }),
  R(308, "leak", "Pipe leak", "1 photo · Emali road", "Emali/Mulala ward", "Kibwezi West", "5 hours ago", "23 Nov 2026, 16:02", null, "review", { x: 22, y: 30, words: "Bomba limepasuka kando ya barabara ya Emali.", english: "A pipe has burst beside the Emali road.", distance: "No asset within 100 m", photos: 1, confType: "Medium" }),
  R(307, "pump", "Hand pump broken", "2 photos · MKN-HP-001102", "Kathonzweni ward", "Makueni", "Yesterday", "22 Nov 2026, 14:30", "MKN-HP-001102", "review", { asset: "a_kathhp", x: 46.5, y: 84, words: "Pampu haitoi maji.", english: "The pump gives no water.", distance: "6 m from Kathonzweni hand pump", photos: 2, confType: "High", confAsset: "High", duplicateOf: "RPT-MKN-0296" }),
  R(306, "nowater", "No water for 1 week", "No photo", "Mtito Andei ward", "Kibwezi East", "Yesterday", "22 Nov 2026, 09:15", "location", "unverified", { x: 86.5, y: 35, words: "Hatuna maji wiki nzima.", english: "We have had no water for a whole week.", distance: "Location not shared", photos: 0, confType: "Medium" }),
  R(305, "leak", "Pipe leak", "4 photos · Tulimani kiosk", "Tulimani ward", "Mbooni", "2 days ago", "21 Nov 2026, 17:40", null, "review", { x: 15.5, y: 55.5, words: "Maji yanamwagika karibu na kioski cha Tulimani.", english: "Water is spilling near the Tulimani kiosk.", distance: "18 m from Tulimani kiosk", photos: 4, confType: "High", suggest: "a_tulimani", confAsset: "Medium" }),
  R(304, "nowater", "No water for 2 days", "1 photo · Nguu borehole", "Nguu/Masumba ward", "Kibwezi East", "2 days ago", "21 Nov 2026, 08:20", null, "unverified", { x: 65.2, y: 38, words: "Kisima cha Nguu hakitoi maji.", english: "The Nguu borehole is not giving water.", distance: "9 m from Nguu borehole", photos: 1, confType: "High", suggest: "a_nguu", confAsset: "High" }),
  R(303, "pump", "Hand pump broken", "1 photo · near Kalamba", "Nzaui/Kilili/Kalamba ward", "Makueni", "3 days ago", "20 Nov 2026, 12:05", null, "unverified", { x: 49, y: 69, words: "Pampu imeharibika.", english: "The pump is damaged.", distance: "No asset within 100 m", photos: 1, confType: "Medium" }),
  R(302, "leak", "Pipe leak", "2 photos · Mbooni tank", "Mbooni ward", "Mbooni", "3 days ago", "20 Nov 2026, 07:45", null, "review", { x: 36, y: 74, words: "Bomba la tangi la Mbooni linavuja.", english: "The Mbooni tank pipe is leaking.", distance: "22 m from Mbooni tank", photos: 2, confType: "High", suggest: "a_mboonitank", confAsset: "Medium" }),
  R(298, "nowater", "No water for 3 days", "1 photo · Wote market kiosk", "Wote/Nziu ward", "Makueni", "12 days ago", "12 Nov 2026, 08:15", "MKN-WK-000318", "resolved", { asset: "a_wotekiosk", x: 56, y: 51, words: "Hakuna maji kwenye kioski kwa siku tatu.", english: "There has been no water at the kiosk for three days.", distance: "15 m from Wote market kiosk", photos: 1, confType: "High", confAsset: "High" }),
  R(296, "pump", "Hand pump broken", "1 photo · MKN-HP-001102", "Kathonzweni ward", "Makueni", "13 days ago", "11 Nov 2026, 10:40", "MKN-HP-001102", "notfault", { asset: "a_kathhp", x: 44, y: 87, words: "Pampu ni ngumu kusukuma.", english: "The pump is hard to push.", distance: "5 m from Kathonzweni hand pump", photos: 1, confType: "Medium", confAsset: "High" }),
];
export const REPORT_STATUS = { unverified: { label: "Unverified", tone: "unverified" }, review: { label: "Under review", tone: "info" }, confirmed: { label: "Fault confirmed", tone: "repair" }, notfault: { label: "Not a fault", tone: "neutral" }, resolved: { label: "Resolved", tone: "operational" } };

const members = [
  ["Amina Mwende", "amina.mwende@makueni.go.ke", "Project engineer", "Today, 14:02", "24 Nov 2026", "All wards", "active"],
  ["Peter Mutua", "peter.mutua@makueni.go.ke", "Administrator", "Today, 09:15", "24 Nov 2026", "All wards", "active"],
  ["Grace Ndunge", "grace.ndunge@makueni.go.ke", "Inspector", "Yesterday", "23 Nov 2026", "Kilungu ward", "active"],
  ["Joseph Kioko", "joseph.kioko@makueni.go.ke", "Viewer", "3 days ago", "21 Nov 2026", "All wards", "active"],
  ["Esther Mwikali", "esther.mwikali@makueni.go.ke", "Project engineer", "4 days ago", "20 Nov 2026", "Kibwezi West ward", "active"],
  ["David Musyoka", "david.musyoka@makueni.go.ke", "Inspector", "Not yet", "Invited 22 Nov 2026", "Kasikeu ward", "invited"],
  ["Lucy Wambua", "lucy.wambua@makueni.go.ke", "Viewer", "12 days ago", "12 Nov 2026", "All wards", "suspended"],
  ["Samuel Mulwa", "samuel.mulwa@makueni.go.ke", "Project engineer", "6 days ago", "18 Nov 2026", "Mbooni ward", "active"],
].map(([name, email, role, active, activeOn, wards, status], i) => ({ _id: "m" + i, name, email, role, active, activeOn, wards, status }));
export const ROLES = { "Administrator": "Manages people and settings", "Project engineer": "Creates and edits projects", "Inspector": "Verifies evidence", "Viewer": "Read only" };
const requests = [
  { _id: "rq1", name: "Mercy Katunge", email: "mercy.katunge@makueni.go.ke", role: "Inspector", note: "Site inspector for Kaiti sub-county.", when: "Today, 08:40" },
  { _id: "rq2", name: "John Mbithi", email: "j.mbithi@worldvision.or.ke", role: "Viewer", note: "Monitoring the Kathonzweni hand pump repair we fund.", when: "Yesterday" },
  { _id: "rq3", name: "Faith Mutua", email: "faith@wotepumps.co.ke", role: "Viewer", note: "Supplier contact for RFQ-MKN-0042.", when: "21 Nov 2026" },
];
const sources = [
  ["WASREB MAJIDATA water points", "WASREB", "Licence to be confirmed", "Attribution: WASREB MAJIDATA", "2 hours ago", "24 Nov 2026, 12:10", "4,812 assets", "current"],
  ["OpenStreetMap base map", "OpenStreetMap", "ODbL 1.0", "© OpenStreetMap contributors", "Today", "24 Nov 2026, 03:00", "Map tiles", "current"],
  ["Makueni project records", "Makueni County Government", "Data sharing agreement", "Attribution: Makueni County", "9 days ago", "15 Nov 2026, 10:30", "312 projects", "stale"],
  ["Water Service Provider register", "Water service providers", "Data sharing agreement", "Attribution: each provider", "3 days ago", "21 Nov 2026, 16:45", "27 providers", "current"],
  ["Water Sector Trust Fund projects", "Water Sector Trust Fund", "Licence to be confirmed", "Attribution: WSTF", "Not yet imported", "Awaiting approval", "No records", "pending"],
  ["Field survey 2026", "Makueni County Water Department", "Own data", "Collected by our team", "Yesterday", "23 Nov 2026, 17:20", "1,046 assets", "current"],
].map(([name, provider, licence, attribution, updated, updatedOn, records, status], i) => ({ _id: "src" + i, name, provider, licence, attribution, updated, updatedOn, records, status }));
const notifPrefs = [
  ["Reports", "New report in your wards", "When a resident sends a report in a ward you cover."],
  ["Reports", "Possible duplicate found", "When the AI suggests two reports are the same fault."],
  ["Projects", "Milestone due soon", "Three days before a project milestone is due."],
  ["Projects", "Evidence waiting for verification", "When a contractor submits evidence to check."],
  ["Data and access", "Data source update failed", "When a data source could not be refreshed."],
  ["Data and access", "New access request", "When someone asks to join your organisation."],
].map(([group, title, note], i) => ({ _id: "np" + i, group, title, note, app: true, email: true, sms: i % 2 === 0 }));
const notifications = [
  { _id: "n1", icon: "message-report", title: "New community report near Kwa Mutonga borehole", body: "Leak or damaged pipe, with 2 photos. Unverified until your team reviews it.", meta: "Community reports · 12 min ago", to: "/reports/rpt_311", read: false },
  { _id: "n2", icon: "building-store", title: "New quote on RFQ-MKN-0042", body: "Wote Pumps & Water Ltd quoted KES 1,248,000. 4 quotes received so far.", meta: "Maji Market · 3 h ago", to: "/market/rfq/rfq_0042/compare", read: false },
  { _id: "n3", icon: "photo", title: "Evidence added to MKN-PRJ-0117", body: "Ukambani Pumps added 3 geotagged photos. Ready for inspection.", meta: "Projects · Yesterday", to: "/projects/prj_0117?tab=evidence", read: false },
  { _id: "ns1", aud: "supplier", icon: "message", title: "Answer on RFQ-MKN-0042", body: "Makueni County Water answered a question about the panel array. Every supplier on this RFQ can see it.", meta: "Maji Market · 21 Nov", to: "/market?tab=messages", read: false },
  { _id: "ns2", aud: "supplier", icon: "clock", title: "RFQ-MKN-0041 closes in 2 days", body: "Your quote for HDPE pipe is still a draft. Finish it before 25 Nov, 17:00.", meta: "Maji Market · Today", to: "/market/rfq/rfq_0041", read: false },
  { _id: "n4", icon: "user-plus", title: "Mercy Katunge asked to join", body: "Requested the Inspector role for Kaiti sub-county.", meta: "Settings · Today, 08:40", to: "/settings/team?view=requests", read: false },
];

export const seed = {
  seedVersion: 4,
  user: { name: "Amina Mwende", initials: "AM", email: "amina.mwende@makueni.go.ke", phone: "+254 722 604 118", title: "Project engineer" },
  supplierUser: { name: "Joseph Musau", initials: "JM", email: "joseph@nzauisolar.co.ke", phone: "+254 716 000 000", title: "Sales engineer" },
  orgs: [
    { id: "makueni", name: "Makueni County Water Department", place: "Makueni County", role: "Project engineer" },
    { id: "kilungu", name: "Kilungu Water Association", place: "Kilungu ward, Makueni County", role: "Viewer" },
    { id: "wote", name: "Wote Water Services", place: "Wote, Makueni County", role: "Administrator" },
    { id: "nzaui", name: "Nzaui Solar & Pumps", place: "Wote, Makueni County", role: "Supplier", supplier: "s_nzaui" },
  ],
  collections: { assets, projects, suppliers, products, rfqs, quotes, history, reports, members, requests, sources, notifPrefs, notifications },
  kv: {
    session: null,
    theme: "system", textSize: "default", reduceMotion: false, largeTargets: false,
    demo: { saveFails: false, exportFails: false, refreshFails: false, overview: "live", connection: "online" },
    orgProfile: { name: "Makueni County Water Department", type: "County department", county: "Makueni County", email: "water@makueni.go.ke", phone: "+254 700 123 456", wards: ["Kilungu ward", "Wote/Nziu ward", "Kasikeu ward", "Kibwezi West ward", "Mbooni ward"] },
    supplierProfile: { name: "Joseph Musau", email: "joseph@nzauisolar.co.ke", phone: "+254 716 000 000", title: "Sales engineer", language: "English", units: "Metric", dates: "24 Nov 2026", start: "Maji Market" },
    profile: { name: "Amina Mwende", email: "amina.mwende@makueni.go.ke", phone: "+254 722 604 118", title: "Project engineer", language: "English", units: "Metric", dates: "24 Nov 2026", start: "Overview" },
    rfqDraft: null, projectDraft: null, accessRequested: false, helpful: {},
  },
};
export const WARD_NAMES = WARD_FULL;
export const kes = (n) => "KES " + Number(n).toLocaleString("en-KE");
