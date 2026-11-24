import React, { useState } from "react";
import { db } from "../db.js";
import { REPORT_STATUS, REPORT_TYPES } from "../seed.js";
import { navigate } from "../router.js";
import { Alert, Badge, Button, Empty, Fact, FilterSelect, Icon, Modal, SelectField, Table, TableFooter, TextArea, TextField, toast, useFirstLoad, usePaged } from "../components/ui.jsx";
import { PageHead } from "./shell.jsx";

const col = () => db.collection("reports");
const RBadge = ({ status }) => <Badge tone={REPORT_STATUS[status].tone}>{REPORT_STATUS[status].label}</Badge>;
const Conf = ({ level }) => <span className={`conf conf--${level}`}><Icon name={level === "High" ? "check" : "alert-circle"} size={14} />{level} confidence</span>;

export function ReportCard({ r, plain }) {
  return (
    <article className="card">
      <div className="row row--between row--wrap"><span className="tbl__two"><span className="t-label c-default">{REPORT_TYPES[r.type].long}</span><span className="t-mono">{r.code}</span></span><RBadge status={r.status} /></div>
      <p className="t-sm">{r.distance} · {r.ward}, {r.wsub}<br /><span className="c-secondary">{r.at} · location accurate to 12 m</span></p>
      <p className="quote">“{r.english}”</p>
      {!plain && <div className="form__pair"><Button type="secondary" onClick={() => navigate(`/reports/${r._id}`)}>Open report</Button></div>}
    </article>
  );
}

export function ReportsPage() {
  const loading = useFirstLoad("reports"); const all = db.get("demo").reportsEmpty ? [] : col().all();
  const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [type, setType] = useState(""); const [ward, setWard] = useState(""); const [sel, setSel] = useState([]);
  const s = q.trim().toLowerCase();
  const rows = all.filter((r) => (!s || [r.code, r.title, r.ward, r.sub].some((t) => t.toLowerCase().includes(s))) && (!status || REPORT_STATUS[r.status].label === status) && (!type || REPORT_TYPES[r.type].long === type) && (!ward || r.ward === ward));
  const paged = usePaged(rows); const filtered = q || status || type || ward; const clear = () => { setQ(""); setStatus(""); setType(""); setWard(""); };
  const columns = [
    { key: "title", label: "Report", flex: 1.6, min: 230, render: (r) => <><span className="icon-chip"><Icon name={REPORT_TYPES[r.type].icon} size={18} /></span><span className="tbl__two"><span className="tbl__open">{r.title}</span><span>{r.sub}</span></span></> },
    { key: "ward", label: "Location", flex: 1.1, min: 150, render: (r) => <span className="tbl__two"><span>{r.ward}</span><span>{r.wsub}</span></span> },
    { key: "at", label: "Reported", flex: 1, min: 150, render: (r) => <span className="tbl__two"><span>{r.ago}</span><span>{r.at}</span></span> },
    { key: "ai", label: "AI suggested asset", flex: 1, min: 150, render: (r) => <span className="t-sm c-secondary">{r.ai === "location" ? "Location needed" : r.ai ? <>AI: <span className="t-mono">{r.ai}</span></> : "AI: none found"}</span> },
    { key: "status", label: "Review status", width: 160, render: (r) => <RBadge status={r.status} /> },
    { key: "go", label: "", width: 110, align: "right", render: (r) => <Button type="secondary" size="sm" onClick={() => navigate(`/reports/${r._id}`)}>Review</Button> },
  ];
  return (
    <>
      <PageHead title="Community reports" sub="Reports from residents are unverified until someone on your team reviews them." actions={<Button type="secondary" icon="map-2" onClick={() => navigate("/reports/map")}>Reports map</Button>} />
      <div className="tbl-wrap">
        {sel.length ? <div className="toolbar"><div className="toolbar toolbar--selected grow" role="region" aria-label="Selected rows"><span className="t-label" aria-live="polite">{sel.length} selected</span><Button type="tertiary" size="sm" onClick={() => setSel([])}>Clear</Button><span className="toolbar__spacer" /><Button type="secondary" size="sm" onClick={() => { sel.forEach((id) => col().get(id).status === "unverified" && col().update(id, { status: "review" })); toast(`${sel.length} reports moved to Under review`); setSel([]); }}>Start review</Button></div></div>
          : <div className="toolbar">
            <div className="toolbar__search"><TextField icon="search" placeholder="Search reports or wards" aria-label="Search reports or wards" value={q} onChange={setQ} /></div>
            <FilterSelect label="Review status" value={status} onChange={setStatus} options={Object.values(REPORT_STATUS).map((x) => x.label)} />
            <FilterSelect label="Report type" value={type} onChange={setType} options={Object.values(REPORT_TYPES).map((x) => x.long)} />
            <FilterSelect label="Ward" value={ward} onChange={setWard} options={[...new Set(all.map((r) => r.ward))].sort()} />
            {filtered && <Button type="tertiary" size="sm" onClick={clear}>Clear filters</Button>}
            <span className="toolbar__spacer" /><Button type="secondary" onClick={() => toast(`${rows.length} reports exported as community-reports.csv`)}>Export</Button>
          </div>}
        <Table label="Community reports" columns={columns} rows={paged.rows} loading={loading} minWidth={1020} selectable selected={sel} onSelect={setSel} rowLabel={(r) => r.code} onRowClick={(r) => navigate(`/reports/${r._id}`)}
          empty={<Empty icon={filtered ? "search" : "message-report"} title={filtered ? "No reports match these filters" : "No reports yet"} action={filtered && <Button type="secondary" onClick={clear}>Clear filters</Button>}>{filtered ? "Try another status or ward." : "Reports appear here when residents send them from the MajiMap resident app."}</Empty>} />
        <TableFooter total={paged.total} page={paged.page} size={paged.size} onPage={paged.setPage} onSize={paged.setSize} noun="reports" />
      </div>
    </>
  );
}

function ActionForm({ type, r, onClose }) {
  const assets = db.collection("assets").all(); const projects = db.collection("projects").all().filter((p) => !p.closed);
  const [asset, setAsset] = useState(r.asset || r.suggest || ""); const [project, setProject] = useState(projects.find((p) => p.asset === (r.asset || r.suggest))?._id || ""); const [msg, setMsg] = useState("Thank you for your report. Our team has confirmed the fault and a repair is being planned. We will text you when it is fixed."); const [err, setErr] = useState("");
  const a = assets.find((x) => x._id === asset);
  const cfg = {
    confirm: ["Confirm this fault", "Confirm fault", () => { if (!asset) return setErr("Choose the asset this report is about"); col().update(r._id, { status: "confirmed", asset }); if (a.status === "operational" || a.status === "unverified") db.collection("assets").update(asset, { status: "faulty", statusNote: `Fault confirmed 24 Nov 2026 · ${r.code}` }); toast(`Fault confirmed. ${a.name} is now marked Faulty on the map.`); onClose(); }],
    project: ["Create a project from this report", "Create project", () => { if (!asset) return setErr("Choose the asset first"); col().update(r._id, { status: "confirmed", asset }); onClose(); navigate(`/projects/new?asset=${asset}&report=${r.code}`); }],
    link: ["Link to an existing project", "Link report", () => { if (!project) return setErr("Choose a project"); const p = db.collection("projects").get(project); col().update(r._id, { status: "confirmed", linked: p.code, asset: asset || p.asset }); toast(`${r.code} linked to ${p.code}`); onClose(); }],
    message: ["Send a message to the reporter", "Send message", () => { if (msg.trim().length < 5) return setErr("Write a short message"); col().update(r._id, { status: "resolved", message: msg.trim() }); toast("Message sent by app and SMS. The report is resolved."); onClose(); }],
  }[type];
  return (
    <Modal title={cfg[0]} onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={cfg[2]}>{cfg[1]}</Button></>}>
      {type === "confirm" && <><p className="c-secondary">Confirming changes the asset's status on the map and tells the resident the fault is confirmed.</p><SelectField label="Asset" placeholder="Choose an asset" value={asset} onChange={setAsset} error={err} options={assets.map((x) => [x._id, `${x.name} · ${x.code}`])} helper={r.ai && r.ai !== "location" ? `AI suggested ${r.ai}. Check it against the photos.` : "No asset was suggested. Pick the right one."} /></>}
      {type === "project" && <><p className="c-secondary">The report is confirmed and a new project starts with this asset filled in.</p><SelectField label="Asset" placeholder="Choose an asset" value={asset} onChange={setAsset} error={err} options={assets.map((x) => [x._id, `${x.name} · ${x.code}`])} /></>}
      {type === "link" && <><p className="c-secondary">Use this when a project already covers the fault.</p><SelectField label="Project" placeholder="Choose a project" value={project} onChange={setProject} error={err} options={projects.map((p) => [p._id, `${p.code} · ${p.name}`])} /></>}
      {type === "message" && <><TextArea label="Message" value={msg} onChange={setMsg} error={err} max={320} rows={4} helper="Sent in the resident app and by SMS." /><Alert>Only your organisation sees the resident's phone number.</Alert></>}
    </Modal>
  );
}

export function ReportDetail({ id }) {
  const r = col().get(id); const [modal, setModal] = useState(null); const [notes, setNotes] = useState("");
  if (!r) return <div className="card"><Empty icon="search" title="Report not found" action={<Button onClick={() => navigate("/reports")}>Report queue</Button>}>It may have been removed when the demo data was reset.</Empty></div>;
  const asset = db.collection("assets").get(r.asset || r.suggest); const dup = r.duplicateOf && col().all().find((x) => x.code === r.duplicateOf);
  const actions = r.status === "unverified" ? <><Button type="secondary" onClick={() => { col().update(id, { status: "notfault" }); toast("Marked as not a fault. The resident will be told."); }}>Not a fault</Button><Button onClick={() => { col().update(id, { status: "review" }); toast("Review started"); }}>Start review</Button></>
    : r.status === "review" ? <><Button type="secondary" onClick={() => { col().update(id, { status: "notfault" }); toast("Marked as not confirmed. The resident will be told."); }}>Not confirmed</Button><Button onClick={() => setModal("confirm")}>Confirm fault</Button></>
    : r.status === "confirmed" ? <><Button type="secondary" onClick={() => setModal("link")}>Link to project</Button><Button type="secondary" onClick={() => setModal("message")}>Message reporter</Button><Button onClick={() => setModal("project")}>Create project</Button></>
    : <Button type="secondary" onClick={() => { col().update(id, { status: "review" }); toast("Report reopened for review"); }}>Reopen</Button>;
  return (
    <>
      <PageHead title={REPORT_TYPES[r.type].long} sub={`${r.code} · Reported ${r.at} · ${r.ward}`} badges={<RBadge status={r.status} />} actions={actions} />
      {r.status === "confirmed" && <Alert tone="success" title="Fault confirmed">{r.linked ? `Linked to project ${r.linked}.` : "Next, create a project for the repair or link the report to one that already covers it."}</Alert>}
      {r.status === "resolved" && <Alert tone="success" title="Resolved">{r.message ? `Message sent to the reporter: “${r.message}”` : "The fault was fixed and the resident was told."}</Alert>}
      {r.status === "notfault" && <Alert title="Not a fault">The reviewer found no fault. The resident was told, and the asset status did not change.</Alert>}
      {dup && r.status !== "resolved" && <Alert tone="warning" title="Possible duplicate" actions={<><Button type="secondary" size="sm" onClick={() => navigate(`/reports/${dup._id}`)}>Open {dup.code}</Button><Button type="tertiary" size="sm" onClick={() => { col().update(id, { duplicateOf: null }); toast("Kept as a separate report"); }}>Not a duplicate</Button></>}>The AI suggests this is the same fault as {dup.code}, sent {dup.at} from {dup.distance.replace(/^\d+ m from /, "near ")}. Check before you act.</Alert>}
      <div className="grid">
        <div className="col-8 col-lg-12 stack">
          <section className="card"><h2 className="t-h4">What the resident reported</h2>
            <div className="card" style={{ gap: 8 }}><div className="row row--between"><span className="t-mono c-secondary">{r.code}</span><Badge tone="brand" dot={false}>This report</Badge></div><p className="t-label">{REPORT_TYPES[r.type].long}</p><p className="t-sm c-secondary">{r.at} · {r.distance}</p><p>“{r.english}”</p><p className="row t-sm c-secondary"><Icon name="photo" size={16} />{r.photos ? `${r.photos} photo${r.photos === 1 ? "" : "s"}` : "No photo"}{r.voice ? " · voice note" : ""}</p></div>
            <div className="stack stack--xs"><span className="t-sm c-secondary">Resident's words · Kiswahili</span><p className="quote" lang="sw">“{r.words}”</p></div>
            <div className="stack stack--xs"><span className="t-sm c-secondary">Translation · English</span><p>“{r.english}”</p></div>
          </section>
          <section className="card"><h2 className="t-h4">Evidence and location</h2><dl className="facts"><Fact label="Location accuracy">{r.distance === "Location not shared" ? "Not shared" : "Within 12 m of the pin"}</Fact><Fact label="Nearest asset">{asset ? `${asset.name} · ${asset.code}` : "None within 100 m"}</Fact><Fact label="Ward">{r.ward}, {r.wsub}</Fact><Fact label="Photos">{r.photos ? `${r.photos} photo${r.photos === 1 ? "" : "s"}` : "None"}</Fact><Fact label="Voice note">{r.voice || "None"}</Fact><Fact label="Sent from">Resident app</Fact></dl>
            <div className="row row--wrap">{asset && <Button type="secondary" size="sm" icon="map-2" onClick={() => navigate(`/atlas?asset=${asset._id}`)}>View asset on map</Button>}<Button type="tertiary" size="sm" onClick={() => navigate("/reports/map")}>Open reports map</Button></div></section>
        </div>
        <div className="col-4 col-lg-12 stack">
          <section className="card"><div className="row"><Icon name="sparkles" size={18} /><h2 className="t-h4">AI suggestions</h2></div><p className="t-sm c-secondary">Suggestions only. Check them against the photos and location before you act.</p>
            <div className="stack stack--xs"><span className="t-sm c-secondary">Problem type</span><span>{REPORT_TYPES[r.type].long}</span><span className="t-sm c-secondary">From the photo and the resident's words</span><Conf level={r.confType || "Medium"} /></div>
            <div className="stack stack--xs"><span className="t-sm c-secondary">Suggested asset</span>{asset ? <><span>{asset.name}</span><span className="t-sm c-secondary">{asset.code}, {r.distance.replace(/ from.*/, "")} from the pin</span><Conf level={r.confAsset || "Medium"} /></> : <span>{r.ai === "location" ? "Needs a location first" : "No asset found nearby"}</span>}</div></section>
          <section className="card"><h2 className="t-h4">Your review</h2><TextArea label="Review notes" value={notes} onChange={setNotes} max={500} rows={4} placeholder="For example: pipe is leaking at the joint near the kiosk. Photos match the location." helper="Visible to your team. The resident sees only the outcome." />
            <Button type="secondary" disabled={!notes.trim()} onClick={() => { col().update(id, { notes: notes.trim() }); toast("Review notes saved"); }}>Save notes</Button></section>
        </div>
      </div>
      {modal && <ActionForm type={modal} r={r} onClose={() => setModal(null)} />}
    </>
  );
}
