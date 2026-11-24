import React, { useEffect, useState } from "react";
import { db, session } from "../db.js";
import { navigate } from "../router.js";
import { replayLoading, toast } from "./ui.jsx";

// Prototype-only controls. Not part of the product design.
// Open with the "Demo" tab on the bottom edge, or Shift + D.
const JUMPS = [
  ["Access", [["Landing", "/"], ["Sign in", "/login"], ["Session expired", "/session-expired"], ["Reset password", "/reset-password"], ["Accept invite", "/accept-invite"], ["Choose organisation", "/choose-organisation"]]],
  ["Overview and map", [["Overview", "/overview"], ["Water Atlas", "/atlas"], ["Asset profile", "/atlas?asset=a_kwamutonga"], ["Underserved areas", "/atlas?layer=access"], ["Asset register", "/assets"]]],
  ["Projects", [["Cards", "/projects"], ["Table", "/projects?view=table"], ["Map", "/projects?view=map"], ["Detail", "/projects/prj_0117"], ["Milestones", "/projects/prj_0117?tab=milestones"], ["Budget", "/projects/prj_0117?tab=budget"], ["Evidence", "/projects/prj_0117?tab=evidence"], ["Handover", "/projects/prj_0130/handover"], ["New project", "/projects/new"]]],
  ["Maji Market", [["Suppliers", "/market"], ["Products", "/market?tab=products"], ["Requests", "/market?tab=requests"], ["History", "/market?tab=history"], ["Supplier profile", "/market/supplier/s_wote"], ["Pending supplier", "/market/supplier/s_kibwezi"], ["New RFQ", "/market/rfq/new"], ["RFQ detail", "/market/rfq/rfq_0042"], ["Compare quotes", "/market/rfq/rfq_0042/compare"]]],
  ["Reports and settings", [["Report queue", "/reports"], ["Unverified", "/reports/rpt_310"], ["Under review", "/reports/rpt_308"], ["Possible duplicate", "/reports/rpt_307"], ["Resolved", "/reports/rpt_298"], ["Reports map", "/reports/map"], ["Team", "/settings/team"], ["Access requests", "/settings/team?view=requests"], ["Data sources", "/settings/sources"], ["Notifications", "/settings/notifications"], ["Org profile", "/settings/profile"], ["Appearance", "/account?tab=appearance"], ["Security", "/account?tab=security"], ["Help", "/help"]]],
];
const PUBLIC = ["/", "/login", "/session-expired", "/reset-password", "/accept-invite"];

export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const demo = db.get("demo") || {};
  useEffect(() => {
    const k = (e) => { if (e.shiftKey && (e.key === "D" || e.key === "d") && !/input|textarea|select/i.test(e.target.tagName)) setOpen((o) => !o); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  const set = (patch) => db.patch("demo", patch);
  function asSupplier(path) { session.signIn("joseph@nzauisolar.co.ke"); navigate(path); }
  function jump(path) {
    if (session.supplier() && !PUBLIC.includes(path)) session.signIn("amina.mwende@makueni.go.ke");
    if (PUBLIC.includes(path)) { if (path !== "/") session.signOut(); }
    else if (path === "/choose-organisation") { if (!session.get()) session.signIn("amina.mwende@makueni.go.ke"); }
    else { if (!session.get()) session.signIn("amina.mwende@makueni.go.ke"); if (!session.org() || (path.startsWith("/projects") && session.org().role === "Viewer")) session.chooseOrg("makueni"); }
    navigate(path);
  }
  const Toggle = ({ k, v, children }) => <button type="button" aria-pressed={(demo[k] ?? false) === v} onClick={() => set({ [k]: v })}>{children}</button>;
  const Flag = ({ k, children }) => <button type="button" aria-pressed={!!demo[k]} onClick={() => set({ [k]: !demo[k] })}>{children}</button>;
  return (
    <div className={`demo ${open ? "demo--open" : ""}`}>
      {open && (
        <div className="demo__panel" role="dialog" aria-label="Prototype controls">
          <div className="demo__head"><strong>Prototype controls</strong><span>Shift + D</span></div>
          <div className="demo__section">
            <p className="demo__label">How to sign in</p>
            <dl className="demo__codes">
              <dt>Email</dt><dd>any valid email</dd>
              <dt>Password</dt><dd>anything (wrong = error)</dd>
              <dt>Organisation</dt><dd>Makueni = full access</dd>
              <dt>No access</dt><dd>Kilungu, then Projects</dd>
              <dt>Supplier</dt><dd>email with "nzaui"</dd>
              <dt>Duplicate asset</dt><dd>-1.8036, 37.6237</dd>
            </dl>
            <div className="demo__row" style={{ marginTop: 8 }}><button type="button" onClick={() => jump("/overview")}>Sign me in and open the app</button></div>
          </div>
          <div className="demo__section">
            <p className="demo__label">Overview</p>
            <div className="demo__row"><Toggle k="overview" v="live">With data</Toggle><Toggle k="overview" v="first">First run</Toggle></div>
            <p className="demo__label">Water Atlas connection</p>
            <div className="demo__row"><Toggle k="connection" v="online">Online</Toggle><Toggle k="connection" v="syncing">Syncing</Toggle><Toggle k="connection" v="offline">Offline</Toggle><Toggle k="connection" v="error">Map error</Toggle></div>
            <p className="demo__label">Make the next action fail</p>
            <div className="demo__row"><Flag k="saveFails">Register asset</Flag><Flag k="exportFails">Export</Flag><Flag k="refreshFails">Refresh source</Flag></div>
            <p className="demo__label">Empty states</p>
            <div className="demo__row"><Flag k="projectsEmpty">No projects</Flag><Flag k="reportsEmpty">No reports</Flag></div>
            <div className="demo__row">
              <button type="button" onClick={() => { replayLoading(); const h = window.location.hash.slice(1) || "/overview"; navigate("/__reload"); setTimeout(() => navigate(h, { replace: true }), 30); }}>Replay loading states</button>
              <button type="button" onClick={() => { const c = db.collection("projects"); const p = c.get("prj_0117"); if (!p) return; c.update("prj_0117", { done: 100, milestones: p.milestones.map((m) => ({ ...m, progress: 100, status: "done" })), evidence: p.evidence.map((e) => ({ ...e, step1: e.step1 || "J. Kioko, 24 Nov", step2: e.step2 || "F. Musyoka, 24 Nov" })), handover: (p.handover || []).map((h) => ({ ...h, status: h.status === "blocked" ? "pending" : h.status })) }); toast("Kwa Mutonga is ready for inspection"); jump("/projects/prj_0117"); }}>Make Kwa Mutonga ready for inspection</button>
            </div>
          </div>
          <div className="demo__section"><p className="demo__label">Supplier view (Joseph Musau, Nzaui Solar & Pumps)</p><div className="demo__row">
            {[["Opportunities", "/market"], ["RFQ to quote on", "/market/rfq/rfq_0042"], ["Draft quote", "/market/rfq/rfq_0041"], ["My quotes", "/market?tab=quotes"], ["Catalogue", "/market?tab=catalogue"], ["Messages", "/market?tab=messages"], ["Public profile", "/market/supplier/s_nzaui"]].map(([l, p]) => <button key={p} type="button" onClick={() => asSupplier(p)}>{l}</button>)}
          </div></div>
          {JUMPS.map(([label, list]) => <div key={label} className="demo__section"><p className="demo__label">{label}</p><div className="demo__row">{list.map(([l, p]) => <button key={p} type="button" onClick={() => jump(p)}>{l}</button>)}</div></div>)}
          <div className="demo__section demo__row">
            <button type="button" onClick={() => { session.signOut(); navigate("/login"); }}>Sign out</button>
            <button type="button" className="demo__danger" onClick={() => { db.reset(); replayLoading(); navigate("/"); toast("Demo data reset"); }}>Reset all data</button>
          </div>
        </div>
      )}
      <button type="button" className="demo__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close" : "Demo"}</button>
    </div>
  );
}
