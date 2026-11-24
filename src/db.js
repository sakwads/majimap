// MajiDB: a tiny document store that lives in the browser.
// Collections of JSON documents with a MongoDB-style API (find, get, insert, update, remove),
// saved to localStorage so the prototype keeps its data between visits on the same browser.
// Everything starts from the static seed in seed.js; "Reset all data" restores it.
import { seed } from "./seed.js";

const KEY = "majimap-db-v1";
const listeners = new Set();
let state = load();
let rev = 0;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.seedVersion === seed.seedVersion) {
        for (const [k, v] of Object.entries(seed.collections)) if (!saved.collections[k]) saved.collections[k] = structuredClone(v);
        for (const [k, v] of Object.entries(seed.kv)) if (!(k in saved.kv)) saved.kv[k] = structuredClone(v);
        return saved;
      }
    }
  } catch (e) { /* storage blocked: fall back to memory */ }
  return structuredClone(seed);
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* memory only */ }
  rev++;
  listeners.forEach((fn) => fn());
}
const uid = () => Math.random().toString(36).slice(2, 10);
const matches = (doc, q = {}) => Object.entries(q).every(([k, v]) => (typeof v === "function" ? v(doc[k]) : doc[k] === v));

function collection(name) {
  if (!state.collections[name]) state.collections[name] = [];
  const docs = () => state.collections[name];
  return {
    all: () => docs(),
    find: (q) => docs().filter((d) => matches(d, q)),
    get: (id) => docs().find((d) => d._id === id) || null,
    insert(doc, { first } = {}) { const d = { _id: uid(), ...doc }; first ? docs().unshift(d) : docs().push(d); persist(); return d; },
    update(id, patch) { const d = docs().find((x) => x._id === id); if (!d) return null; Object.assign(d, patch); persist(); return d; },
    remove(id) { state.collections[name] = docs().filter((d) => d._id !== id); persist(); },
  };
}

export const db = {
  collection,
  get: (k) => state.kv[k],
  set(k, v) { state.kv[k] = v; persist(); },
  patch(k, v) { state.kv[k] = { ...(state.kv[k] || {}), ...v }; persist(); },
  reset() { state = structuredClone(seed); persist(); },
  resetCollections(names) { names.forEach((n) => { state.collections[n] = structuredClone(seed.collections[n]); }); persist(); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  version: () => rev,
};

// Session: who is signed in and which organisation they are working in.
// Two demo people: Amina Mwende (county staff, three organisations) and Joseph Musau (supplier, Nzaui Solar & Pumps).
export const isSupplierEmail = (email = "") => /nzaui/i.test(email);
export const session = {
  get: () => db.get("session"),
  supplier: () => db.get("session")?.persona === "supplier",
  user: () => (!db.get("session") ? null : db.get("session").persona === "supplier" ? seed.supplierUser : seed.user),
  profileKey: () => (db.get("session")?.persona === "supplier" ? "supplierProfile" : "profile"),
  orgs: () => seed.orgs.filter((o) => (db.get("session")?.persona === "supplier") === !!o.supplier),
  org: () => seed.orgs.find((o) => o.id === db.get("session")?.orgId) || null,
  signIn(email) { const sup = isSupplierEmail(email); db.set("session", { email, persona: sup ? "supplier" : "staff", orgId: sup ? "nzaui" : null, at: Date.now() }); },
  chooseOrg(orgId) { db.patch("session", { orgId }); },
  signOut() { db.set("session", null); },
};
