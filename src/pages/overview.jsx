import React from "react";
import { db, session } from "../db.js";
import { REPORT_TYPES } from "../seed.js";
import { navigate } from "../router.js";
import { Badge, Button, Icon, Skel, toast, useFirstLoad } from "../components/ui.jsx";
import { PageHead } from "./shell.jsx";

const Tile = ({ label, value, note, to, loading }) => (
  <button type="button" className="card kpi col-3" onClick={() => navigate(to)} disabled={loading}>
    <span className="t-sm c-secondary">{label}</span>
    {loading ? <Skel w={96} h={32} /> : <span className="t-stat">{value}</span>}
    {loading ? <Skel w="70%" h={12} /> : <span className="t-sm c-secondary">{note}</span>}
  </button>
);
function Panel({ title, to, rows, loading }) {
  return (
    <section className="card col-6" aria-label={title}>
      <div className="card__head"><h2 className="t-h4">{title}</h2><a className="link--plain link" href={"#" + to}>View all</a></div>
      <div className="stack stack--sm">
        {loading ? [0, 1, 2].map((i) => <div key={i} className="list-row"><span className="list-row__text"><Skel w="60%" /><Skel w="40%" h={12} /></span><Skel w={96} h={20} /></div>)
          : rows.map((r) => <button key={r.title} type="button" className="list-row" onClick={() => navigate(r.to)}><span className="list-row__text"><span className="t-label">{r.title}</span><span className="t-sm c-secondary">{r.sub}</span></span><Badge tone={r.tone} icon={r.icon} dot={false}>{r.badge}</Badge></button>)}
      </div>
    </section>
  );
}
const STEPS = [
  ["Add your first assets", "Register boreholes, kiosks and tanks, or import a register.", "/assets", "Open Assets"],
  ["Connect a data source", "Link the county register or a utility list, with its source and update date.", "/settings/sources", "Add a source"],
  ["Invite your team", "Give engineers, inspectors and viewers the right role.", "/settings/team", "Invite people"],
  ["Create a project", "Turn a faulty asset into a project with a budget and milestones.", "/projects/new", "New project"],
];

export function OverviewPage() {
  const loading = useFirstLoad("overview", 900); const org = session.org(); const mode = db.get("demo").overview;
  const reports = db.collection("reports").all().filter((r) => r.status === "unverified"); const rfqs = db.collection("rfqs").all().filter((r) => r.status !== "closed");
  const head = <PageHead title="Overview" sub={`${org.name} · Updated 5 minutes ago`} actions={<><Button type="secondary" onClick={() => toast("Summary exported as overview-24-nov-2026.pdf")}>Export summary</Button><Button onClick={() => navigate("/projects/new")}>Create project</Button></>} />;
  if (mode === "first") return (
    <>{head}
      <section className="card card--pad-xl" aria-label="Get started">
        <div className="stack stack--xs"><h2 className="t-h3">Welcome to MajiMap</h2><p className="c-secondary">Four steps get {org.name} ready. You can do them in any order.</p></div>
        <ol className="stack stack--sm">{STEPS.map(([t, d, to, cta], i) => (
          <li key={t} className="list-row" style={{ flexWrap: "wrap" }}><span className="count count--brand" style={{ width: 28, height: 28, borderRadius: 14 }}>{i + 1}</span><span className="list-row__text" style={{ flexBasis: 220 }}><span className="t-label">{t}</span><span className="t-sm c-secondary">{d}</span></span><Button type="secondary" size="sm" onClick={() => navigate(to)}>{cta}</Button></li>))}</ol>
      </section>
      <div className="grid">{[["Operational assets", "0", "No assets mapped yet"], ["Active projects", "0", "No projects yet"], ["Open requests for quotation", "0", "No RFQs yet"], ["Unverified reports", "0", "No reports yet"]].map(([l, v, n]) => <div key={l} className="card kpi col-3"><span className="t-sm c-secondary">{l}</span><span className="t-stat">{v}</span><span className="t-sm c-secondary">{n}</span></div>)}</div>
    </>
  );
  return (
    <>{head}
      <div className="grid grid--stretch" aria-busy={loading || undefined}>
        <Tile loading={loading} label="Operational assets" value="1,284" note="92% of 1,396 mapped assets" to="/assets" />
        <Tile loading={loading} label="Active projects" value="37" note="6 need attention" to="/projects" />
        <Tile loading={loading} label="Open requests for quotation" value={rfqs.length + 7} note="14 quotations waiting for review" to="/market?tab=requests" />
        <Tile loading={loading} label="Unverified reports" value={reports.length + 6} note="3 are older than 7 days" to="/reports" />
        <Panel loading={loading} title="Projects needing attention" to="/projects" rows={[
          { title: "Kathonzweni hand pump repair", sub: "Pump replacement overdue by 12 days", badge: "Behind schedule", tone: "warning", icon: "alert-circle", to: "/projects/prj_0124" },
          { title: "Kwa Mutonga borehole rehabilitation", sub: "1 photo is waiting for the site inspector", badge: "Evidence to verify", tone: "info", icon: "eye-check", to: "/projects/prj_0117?tab=evidence" },
          { title: "Emali borehole drilling", sub: "Funding approval waiting for 6 days", badge: "Awaiting approval", tone: "info", icon: "clock", to: "/projects/prj_0133" }]} />
        <Panel loading={loading} title="Community reports to review" to="/reports" rows={reports.slice(0, 3).map((r, i) => ({ title: `${r.code} · ${r.ward}`, sub: `${REPORT_TYPES[r.type].long} · ${r.photos} photo${r.photos === 1 ? "" : "s"} · ${r.ago}`, badge: i === 2 ? "Older than 1 day" : "Unverified", tone: i === 2 ? "warning" : "unverified", icon: i === 2 ? "alert-circle" : "clock", to: `/reports/${r._id}` }))} />
        <Panel loading={loading} title="Underserved areas" to="/atlas?layer=access" rows={[
          { title: "Kasikeu ward", sub: "6 km to the nearest working water point", badge: "31% covered", tone: "warning", icon: "alert-circle", to: "/atlas?layer=access" },
          { title: "Kilungu ward", sub: "4 km to the nearest working water point", badge: "38% covered", tone: "warning", icon: "alert-circle", to: "/atlas?layer=access" },
          { title: "Mukaa ward", sub: "3 km to the nearest working water point", badge: "52% covered", tone: "info", icon: "info-circle", to: "/atlas?layer=access" }]} />
        <Panel loading={loading} title="Recent activity" to="/projects/prj_0117?tab=activity" rows={[
          { title: "Rising main verified · Kwa Mutonga borehole", sub: "Verified by J. Kioko", badge: "18 Nov", icon: "circle-check", to: "/projects/prj_0117?tab=activity" },
          { title: "Quotation received · Solar pump set", sub: "From Wote Pumps & Water Ltd", badge: "Yesterday", icon: "circle-check", to: "/market/rfq/rfq_0042" },
          { title: "Asset registered · Mavindini kiosk", sub: "By Amina Mwende", badge: "Mon", icon: "circle-check", to: "/atlas?asset=a_mavindini" }]} />
      </div>
    </>
  );
}
