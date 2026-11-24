import React, { useState } from "react";
import { db } from "../db.js";
import { ASSET_TYPES, STAGES, STAGE_LONG, kes } from "../seed.js";
import { navigate, query, setQuery } from "../router.js";
import { DateField, Alert, Badge, Button, Checkbox, Empty, Fact, FilterSelect, Icon, Modal, Photos, Progress, Segmented, SelectField, Skel, Table, Tabs, TextArea, TextField, toast, useFirstLoad } from "../components/ui.jsx";
import { PageHead } from "./shell.jsx";
import { MapCanvas } from "./atlas.jsx";

const TODAY = "24 Nov 2026";
const HEALTH = { "on-track": ["operational", "check"], "at-risk": ["warning", "alert-circle"], delayed: ["faulty", "x"], inspection: ["info", "info-circle"], completed: ["operational", "check"], "not-started": ["info", "info-circle"], closed: ["neutral", "lock"] };
const MS = { done: ["Done", "operational", "check"], progress: ["In progress", "info", "clock"], overdue: ["Overdue", "faulty", "alert-triangle"], upcoming: ["Upcoming", "neutral", "flag"] };
const col = () => db.collection("projects");
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const assetOf = (p) => db.collection("assets").get(p.asset);
export const HealthBadge = ({ p }) => <Badge tone={HEALTH[p.health][0]} icon={HEALTH[p.health][1]} dot={false}>{p.healthLabel}</Badge>;

export function Lifecycle({ stage }) {
  return (
    <ol className="lifecycle" aria-label={`Project lifecycle, stage ${stage} of 8: ${STAGES[stage - 1]}`}>
      {STAGES.map((s, i) => { const st = i + 1 < stage ? "done" : i + 1 === stage ? "current" : "todo"; return (
        <li key={s} className={`lifecycle__step lifecycle__step--${st}`} aria-current={st === "current" ? "step" : undefined}>
          <span className="lifecycle__dot">{st === "done" ? <Icon name="check" size={16} /> : i + 1}</span><span>{s}<span className="sr-only">{st === "done" ? ", completed" : st === "current" ? ", in progress" : ", not started"}</span></span>
        </li>); })}
    </ol>
  );
}

export function ProjectCard({ p, plain }) {
  const a = assetOf(p); const spent = pct(p.spent, p.budget);
  return (
    <article className="card pcard">
      <div className="row row--between row--wrap"><span className="tag">Stage {p.stage} of 8 · {STAGE_LONG[p.stage - 1]}</span><HealthBadge p={p} /></div>
      <div className="stack stack--xs"><h3 className="t-h4">{p.name}</h3><p className="t-sm c-secondary">{p.code} · Funded by {p.funder}</p></div>
      <div className="stack stack--xs">
        <div className="row row--between"><span className="row t-sm"><Icon name="map-pin" size={16} />{p.ward}</span>{!plain && <a className="link t-sm" href={`#/atlas?asset=${p.asset}`}>View on map</a>}</div>
        {a && <span className="row t-sm"><Icon name={ASSET_TYPES[a.type].icon} size={16} />{ASSET_TYPES[a.type].label} <span className="t-mono">{a.code}</span></span>}
      </div>
      <div className="stack stack--xs"><span className="t-mono c-secondary">Approved budget</span><span className="t-stat">{kes(p.budget)}</span><span className="t-sm c-secondary">{p.spent ? `Spent ${kes(p.spent)} (${spent}%)` : "Nothing spent yet"}</span></div>
      <div className="stack stack--xs"><div className="row row--between t-sm"><span>Work done</span><span>{p.done}%</span></div><Progress value={p.done} label="Work done" tone={p.health === "delayed" ? "bad" : p.health === "completed" ? "ok" : null} />
        {p.warn && <p className="row t-sm" style={{ color: "var(--mm-status-warning-text)" }}><Icon name="alert-triangle" size={16} />{p.warn}</p>}</div>
      <hr className="divider" />
      <dl className="facts facts--2 facts--keep"><Fact label="Contractor">{p.contractor}</Fact><Fact label={p.closed ? "Handed over" : "Ends"}>{p.ends}</Fact></dl>
      <dl><Fact label={p.closed ? "Last milestone" : "Next milestone"}>{p.next}</Fact></dl>
      {p.photos > 0 && <><div className="row row--between row--wrap"><span className="t-sm">Evidence · {p.photos} photos</span><Badge tone={p.evidenceTone || "neutral"}>{p.evidenceNote}</Badge></div><Photos count={p.photos} /></>}
      {!plain && <div className="form__pair card__foot" style={p.closed ? { gridTemplateColumns: "1fr" } : undefined}>
        <Button type="secondary" onClick={() => navigate(`/projects/${p._id}`)}>View project</Button>
        {!p.closed && (p.rfq ? <Button type="tonal" onClick={() => navigate("/market?tab=requests")}>View quotes</Button> : <Button type="tonal" onClick={() => navigate(`/projects/${p._id}?tab=milestones&do=${p.action ? "stage" : "update"}`)}>{p.action || "Add update"}</Button>)}
      </div>}
    </article>
  );
}

export function ProjectsPage() {
  const loading = useFirstLoad("projects"); const all = db.get("demo").projectsEmpty ? [] : col().all();
  const view = query().get("view") || "cards";
  const [q, setQ] = useState(""); const [ward, setWard] = useState(""); const [stage, setStage] = useState(""); const [funder, setFunder] = useState("");
  const s = q.trim().toLowerCase();
  const rows = all.filter((p) => (!s || [p.name, p.code, p.ward].some((t) => t.toLowerCase().includes(s))) && (!ward || p.ward === ward) && (!stage || STAGES[p.stage - 1] === stage) && (!funder || p.funder === funder));
  const filtered = q || ward || stage || funder; const clear = () => { setQ(""); setWard(""); setStage(""); setFunder(""); };
  const empty = <Empty icon={filtered ? "search" : "copy"} title={filtered ? "No projects match these filters" : "No projects yet"} action={filtered ? <Button type="secondary" onClick={clear}>Clear filters</Button> : <Button onClick={() => navigate("/projects/new")}>New project</Button>}>{filtered ? "Try another ward, stage or funder." : "Create a project from a faulty asset or a confirmed community report."}</Empty>;
  return (
    <>
      <PageHead title="Projects" actions={<Segmented label="View" value={view} onChange={(v) => setQuery({ view: v === "cards" ? null : v })} options={[["cards", "Cards"], ["table", "Table"], ["map", "Map"]]} />} />
      <div className="toolbar" style={{ borderRadius: "var(--mm-radius-card)", border: "1px solid var(--mm-border-default)" }}>
        <div className="toolbar__search"><TextField icon="search" placeholder="Search projects, IDs or wards" aria-label="Search projects, IDs or wards" value={q} onChange={setQ} /></div>
        <FilterSelect label="Ward" value={ward} onChange={setWard} options={[...new Set(all.map((p) => p.ward))]} />
        <FilterSelect label="Stage" value={stage} onChange={setStage} options={STAGES} />
        <FilterSelect label="Funder" value={funder} onChange={setFunder} options={[...new Set(all.map((p) => p.funder))]} />
        {filtered && <Button type="tertiary" size="sm" onClick={clear}>Clear filters</Button>}
        <span className="toolbar__spacer" />
        <Button type="secondary" onClick={() => toast(`${rows.length} projects exported as makueni-projects.csv`)}>Export</Button><Button onClick={() => navigate("/projects/new")}>New project</Button>
      </div>
      {loading ? <div className="masonry">{[280, 360, 320].map((h) => <div key={h} className="card"><Skel w="50%" /><Skel w="80%" h={20} /><Skel h={h - 160} /><Skel w="60%" /></div>)}</div>
        : rows.length === 0 ? <div className="card">{empty}</div>
        : view === "cards" ? <div className="masonry">{rows.map((p) => <ProjectCard key={p._id} p={p} />)}</div>
        : view === "table" ? (
          <div className="tbl-wrap"><Table label="Projects" minWidth={1040} rows={rows} onRowClick={(p) => navigate(`/projects/${p._id}`)} columns={[
            { key: "name", label: "Project", flex: 1.8, min: 240, render: (p) => <span className="tbl__two"><span className="tbl__open">{p.name}</span><span className="t-mono">{p.code}</span></span> },
            { key: "stage", label: "Stage", flex: 1, min: 150, render: (p) => <span className="tbl__two"><span>{STAGES[p.stage - 1]}</span><span>Stage {p.stage} of 8</span></span> },
            { key: "health", label: "Status", width: 150, render: (p) => <HealthBadge p={p} /> },
            { key: "ward", label: "Ward", flex: 1.2, min: 160 },
            { key: "done", label: "Work done", width: 110, align: "right", render: (p) => `${p.done}%` },
            { key: "spent", label: "Spent", width: 140, align: "right", render: (p) => <span className="nowrap">{kes(p.spent)}</span> },
            { key: "budget", label: "Approved budget", width: 150, align: "right", render: (p) => <span className="nowrap">{kes(p.budget)}</span> },
          ]} /></div>
        ) : (
          <MapCanvas assets={[]} layers={{ projects: true }} overlay={null} onSelect={() => {}} onProject={(p) => navigate(`/projects/${p._id}`)}>
            <div className="map-card map-card--left"><h2 className="t-h4">{rows.filter((p) => !p.closed).length} open projects</h2>{rows.filter((p) => !p.closed).map((p) => <button key={p._id} type="button" className="list-row" onClick={() => navigate(`/projects/${p._id}`)}><span className="list-row__text"><span className="t-label">{p.name}</span><span className="t-sm c-secondary">{p.ward}</span></span></button>)}</div>
          </MapCanvas>
        )}
    </>
  );
}

/* ───────── Dialogs ───────── */
function MilestoneForm({ p, onClose }) {
  const [v, setV] = useState({ title: "", note: "", due: "", owner: p.contractor }); const [err, setErr] = useState({}); const up = (k) => (x) => setV((o) => ({ ...o, [k]: x }));
  function save() { const e = {}; if (!v.title.trim()) e.title = "Name the milestone"; if (!v.due) e.due = "Choose a due date"; setErr(e); if (Object.keys(e).length) return;
    const due = new Date(v.due).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    col().update(p._id, { milestones: [...p.milestones, { title: v.title.trim(), note: v.note.trim() || "No description", due, owner: v.owner, progress: 0, evidence: 0, status: "upcoming" }] }); toast("Milestone added"); onClose(); }
  return (
    <Modal title="Add milestone" onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={save}>Add milestone</Button></>}>
      {Object.keys(err).length > 0 && <Alert tone="error" title="Add the missing details" />}
      <TextField label="Milestone" placeholder="For example: Solar array installed" value={v.title} onChange={up("title")} error={err.title} />
      <TextArea label="What will be delivered" optional rows={3} max={200} value={v.note} onChange={up("note")} />
      <div className="form__pair"><DateField label="Due date" value={v.due} onChange={up("due")} error={err.due} /><SelectField label="Owner" value={v.owner} onChange={up("owner")} options={[...new Set([p.contractor, "Makueni Water Dept", "Kioko Water Consult"])]} /></div>
    </Modal>
  );
}
function UpdateForm({ p, onClose }) {
  const open = p.milestones.map((m, i) => [String(i), m.title]).filter(([i]) => p.milestones[i].status !== "done");
  const [i, setI] = useState(open[0]?.[0] ?? "0"); const m = p.milestones[i]; const [progress, setProgress] = useState(String(Math.min(100, (m?.progress || 0) + 25))); const [note, setNote] = useState(""); const [err, setErr] = useState({});
  function save() { const e = {}; const n = Number(progress); if (!note.trim()) e.note = "Say what was done"; if (!(n >= 0 && n <= 100) || progress === "") e.progress = "Enter a number from 0 to 100"; else if (n < m.progress) e.progress = `Progress was already ${m.progress}%`; setErr(e); if (Object.keys(e).length) return;
    const ms = p.milestones.map((x, k) => (k === +i ? { ...x, progress: n, status: n === 100 ? "done" : x.status === "upcoming" ? "progress" : x.status } : x));
    const done = Math.round(ms.reduce((t, x) => t + x.progress, 0) / ms.length);
    col().update(p._id, { milestones: ms, done, activity: [{ icon: "tool", title: `${m.title}: ${n}%`, meta: `${TODAY} · Amina Mwende`, body: note.trim() }, ...(p.activity || [])] }); toast(`Update posted. ${m.title} is at ${n}%.`); onClose(); }
  if (!open.length) return <Modal title="Post progress update" onClose={onClose} footer={<Button onClick={onClose}>Close</Button>}><Alert tone="success" title="Every milestone is done">There is nothing left to update. Move the project to the next stage.</Alert></Modal>;
  return (
    <Modal title="Post progress update" onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={save}>Post update</Button></>}>
      <SelectField label="Milestone" value={i} onChange={(x) => { setI(x); setProgress(String(Math.min(100, p.milestones[x].progress + 25))); }} options={open} />
      <TextField label="Progress (%)" inputMode="numeric" value={progress} onChange={setProgress} error={err.progress} helper={`Currently ${m.progress}%.`} />
      <TextArea label="What was done" value={note} onChange={setNote} error={err.note} max={300} rows={3} placeholder="For example: pump lowered to 120 m and tested for two hours." />
    </Modal>
  );
}
function EvidenceForm({ p, onClose }) {
  const [title, setTitle] = useState(""); const [file, setFile] = useState(false); const [gps, setGps] = useState(true); const [err, setErr] = useState("");
  function save() { if (!title.trim() || !file) return setErr(!file ? "Add a photo first" : "Describe the photo");
    col().update(p._id, { photos: p.photos + 1, evidence: [...p.evidence, { _id: "ev" + Date.now(), title: title.trim(), gps: gps ? "-1.8035, 37.6238 · within 5 m" : null, by: `Uploaded by Amina Mwende · ${TODAY}, 14:10`, step1: null, step2: null }] }); toast("Evidence uploaded. It is waiting for the site inspector."); onClose(); }
  return (
    <Modal title="Upload evidence" onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={save}>Upload evidence</Button></>}>
      {file ? <div className="list-row"><Icon name="photo" /><span className="list-row__text"><span className="t-label">IMG_2026-11-24_1410.jpg</span><span className="t-sm c-secondary">2.4 MB · {gps ? "location found, within 5 m" : "no location in this photo"}</span></span><Button type="tertiary" size="sm" onClick={() => setFile(false)}>Remove</Button></div>
        : <button type="button" className="dropzone" onClick={() => { setFile(true); setErr(""); }}><Icon name="upload" size={24} /><span className="t-label">Choose a photo</span><span className="t-sm c-secondary">JPG or PNG, up to 10 MB. Photos taken on site keep their location.</span></button>}
      {file && !gps && <Alert tone="warning" title="This photo has no location">Evidence without a location cannot be verified by the inspector. Retake it on site with location turned on, or upload it as a note only.</Alert>}
      <TextField label="What does the photo show?" placeholder="For example: tank stand foundation" value={title} onChange={setTitle} error={err} />
      {file && <Checkbox checked={gps} onChange={setGps} label="Photo has a location" helper="Prototype switch: untick to see the no-location warning." />}
    </Modal>
  );
}
function VerifyForm({ p, ev, reject, onClose }) {
  const step = ev.step1 ? 2 : 1; const [note, setNote] = useState(""); const [err, setErr] = useState("");
  const set = (patch) => col().update(p._id, { evidence: p.evidence.map((e) => (e._id === ev._id ? { ...e, ...patch } : e)) });
  function go() {
    if (reject) { if (!note.trim()) return setErr("Say why, so the contractor knows what to fix"); set({ rejected: note.trim() }); toast("Evidence rejected. The contractor has been told why."); return onClose(); }
    set(step === 1 ? { step1: "A. Mwende, 24 Nov" } : { step2: "A. Mwende, 24 Nov" }); toast(step === 1 ? "Verified as site inspector. Waiting for the county engineer." : "Evidence verified"); onClose();
  }
  return (
    <Modal title={reject ? "Reject evidence" : `Verify evidence · step ${step} of 2`} onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button type={reject ? "danger" : "primary"} onClick={go}>{reject ? "Reject evidence" : step === 1 ? "Verify as site inspector" : "Verify as county engineer"}</Button></>}>
      <div className="photo photo--wide"><Icon name="photo" size={28} />{ev.gps && <span className="photo__gps"><Icon name="map-pin" size={12} />GPS</span>}</div>
      <div className="tbl__two"><span className="t-label">{ev.title}</span><span className="t-mono">{ev.gps || "No location"}</span><span>{ev.by}</span></div>
      {reject ? <TextArea label="Reason" value={note} onChange={setNote} error={err} rows={3} max={300} placeholder="For example: the photo does not show the pump serial number." />
        : <Alert>{step === 1 ? "As site inspector you confirm the photo was taken at the project location and shows the work described." : "As county engineer you confirm the work meets the specification. This is the final check."}</Alert>}
    </Modal>
  );
}
function StageForm({ p, onClose }) {
  const checks = [[`All ${p.milestones.length} milestones are done`, p.milestones.every((m) => m.status === "done")], [`${p.evidence.filter((e) => e.step2).length} of ${p.evidence.length} photos are verified`, p.evidence.every((e) => e.step2 || e.rejected)], ["Spend is recorded for this stage", true]];
  const ready = checks.every((c) => c[1]) || p.stage !== 5; const next = STAGES[p.stage];
  function go() { const stage = p.stage + 1; const lab = { 4: ["on-track", "On track"], 5: ["on-track", "On track"], 6: ["inspection", "In inspection"], 7: ["inspection", "In handover"] }[stage] || ["on-track", "On track"];
    col().update(p._id, { stage, health: lab[0], healthLabel: lab[1], action: stage === 6 ? "Record inspection" : null, activity: [{ icon: "flag", title: `Moved to ${next}`, meta: `${TODAY} · Amina Mwende` }, ...(p.activity || [])] }); toast(`Project moved to ${next}`); onClose(); if (stage === 7) navigate(`/projects/${p._id}/handover`); }
  return (
    <Modal title={`Move to ${next.toLowerCase()}`} onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={go} disabled={!ready}>Move to {next.toLowerCase()}</Button></>}>
      {p.stage === 5 ? <>
        <p className="c-secondary">A project moves to inspection when the work and its evidence are complete.</p>
        <ul className="stack stack--sm">{checks.map(([l, ok]) => <li key={l} className="row"><span className={`icon-chip ${ok ? "icon-chip--ok" : "icon-chip--bad"}`}><Icon name={ok ? "check" : "alert-triangle"} size={14} /></span><span>{l}<span className="sr-only">{ok ? ": met" : ": not met"}</span></span></li>)}</ul>
        {!ready && <Alert tone="warning" title="Not ready yet">Finish the open milestones and verify the remaining photos first.</Alert>}
      </> : <p>{p.stage === 6 ? "Record that the county inspection is complete. The project then moves to handover." : `Move ${p.name} from ${STAGES[p.stage - 1]} to ${next}.`}</p>}
    </Modal>
  );
}

/* ───────── Project detail ───────── */
function Head({ p, crumb, actions }) {
  return (
    <>
      <PageHead title={p.name} sub={`${p.code} · Funded by ${p.funder} · Contractor ${p.contractor}`} badges={<><Badge tone="brand" dot={false}>{STAGES[p.stage - 1]}</Badge><HealthBadge p={p} /></>} actions={actions} />
      <Lifecycle stage={p.closed ? 9 : p.stage} />
    </>
  );
}
export function ProjectDetail({ id }) {
  const p = col().get(id); const tab = query().get("tab") || "overview"; const [modal, setModal] = useState(() => { const d = query().get("do"); return d ? { type: d } : null; });
  if (!p) return <div className="card"><Empty icon="search" title="Project not found" action={<Button onClick={() => navigate("/projects")}>All projects</Button>}>It may have been removed when the demo data was reset.</Empty></div>;
  const a = assetOf(p); const committed = p.committed || 0; const remaining = p.budget - p.spent - committed; const nextM = p.milestones.find((m) => m.status !== "done");
  const close = () => { setModal(null); if (query().get("do")) setQuery({ do: null }); };
  const primary = p.closed ? null : p.stage === 7 ? <Button onClick={() => navigate(`/projects/${p._id}/handover`)}>Open handover</Button> : p.stage < 7 ? <Button onClick={() => setModal({ type: "stage" })}>{p.stage === 5 ? "Request inspection" : p.stage === 6 ? "Record inspection" : `Move to ${STAGES[p.stage].toLowerCase()}`}</Button> : null;
  const MsRow = ({ m }) => (
    <li className="ms-row">
      <span className={`icon-chip ${m.status === "done" ? "icon-chip--ok" : m.status === "overdue" ? "icon-chip--bad" : "icon-chip--wait"}`}><Icon name={MS[m.status][2]} size={14} /></span>
      <span className="tbl__two ms-row__title"><span className="t-label">{m.title}</span><span>{m.note}</span></span>
      <span className="tbl__two"><span className="t-sm c-secondary">Due</span><span className="c-default t-body nowrap">{m.due}</span></span>
      <span className="tbl__two"><span className="t-sm c-secondary">Owner</span><span className="c-default t-body">{m.owner}</span></span>
      <span className="stack stack--xs ms-row__bar"><span className="row row--between t-sm"><span className="c-secondary">Progress</span><span>{m.progress}%</span></span><Progress value={m.progress} label={`${m.title} progress`} /></span>
      <span className="tbl__two"><span className="t-sm c-secondary">Evidence</span><span className="c-default t-body nowrap">{m.evidence ? `${m.evidence} photo${m.evidence === 1 ? "" : "s"}` : "No evidence yet"}</span></span>
      <span className="ms-row__status"><Badge tone={MS[m.status][1]}>{MS[m.status][0]}</Badge></span>
    </li>
  );
  return (
    <>
      <Head p={p} actions={<>{!p.closed && <Button type="secondary" onClick={() => setModal({ type: "update" })}>Add update</Button>}{primary}</>} />
      <Tabs label="Project sections" value={tab} onChange={(t) => setQuery({ tab: t === "overview" ? null : t })} tabs={[["overview", "Overview"], ["milestones", "Milestones", p.milestones.filter((m) => m.status !== "done").length], ["budget", "Budget"], ["evidence", "Evidence", p.evidence.filter((e) => !e.step2 && !e.rejected).length], ["activity", "Activity", (p.activity || []).length]]} />
      {tab === "overview" && (
        <div className="grid grid--stretch">
          <div className="col-8 col-lg-12 stack">
            <section className="card"><h2 className="t-h4">Project details</h2>{p.objective && <p>{p.objective}</p>}<dl className="facts"><Fact label="Location">{p.ward}</Fact><Fact label="Start">{p.start}</Fact><Fact label="End">{p.ends}</Fact><Fact label="Contractor">{p.contractor}</Fact><Fact label="Funder">{p.funder}</Fact><Fact label="Project lead">{p.lead}</Fact></dl></section>
            {nextM && <section className="card"><h2 className="t-h4">Next milestone</h2><ul className="ms-list ms-list--stack">{MsRow({ m: nextM })}</ul></section>}
            <section className="card"><div className="card__head"><h2 className="t-h4">Recent activity</h2><button type="button" className="link link--plain" onClick={() => setQuery({ tab: "activity" })}>View all</button></div><Activity items={(p.activity || []).slice(0, 3)} /></section>
          </div>
          <div className="col-4 col-lg-12 stack">
            <BudgetCard p={p} committed={committed} remaining={remaining} />
            {a && <section className="card" style={{ flex: 1 }}><h2 className="t-h4">Linked asset</h2><div className="row row--wrap"><span className="tag">{ASSET_TYPES[a.type].label}</span></div><div className="tbl__two"><span className="t-label">{a.name}</span><span className="t-mono">{a.code}</span></div><Button type="secondary" className="card__foot" onClick={() => navigate(`/atlas?asset=${a._id}`)}>View on map</Button></section>}
          </div>
        </div>
      )}
      {tab === "milestones" && <section className="card"><div className="card__head"><h2 className="t-h4">Milestones</h2>{!p.closed && <div className="row"><Button type="secondary" onClick={() => setModal({ type: "milestone" })}>Add milestone</Button><Button type="tonal" onClick={() => setModal({ type: "update" })}>Post update</Button></div>}</div>
        {p.milestones.length ? <ul className="ms-list">{p.milestones.map((m, i) => <React.Fragment key={i}>{MsRow({ m })}</React.Fragment>)}</ul> : <Empty icon="flag" title="No milestones yet">Add the first milestone to track progress.</Empty>}</section>}
      {tab === "budget" && <div className="grid grid--stretch"><div className="col-4 col-lg-12"><BudgetCard p={p} committed={committed} remaining={remaining} /></div>
        <section className="card col-8 col-lg-12"><h2 className="t-h4">Spend by milestone</h2>
          <table className="spend"><caption className="sr-only">Spend by milestone</caption><thead className="sr-only"><tr><th>Milestone</th><th>Spent</th><th>Share of budget</th></tr></thead>
            <tbody>{(p.spend || p.milestones.map((m) => [m.title, Math.round((p.spent / p.milestones.length) * (m.progress / 100))])).map(([t, v]) => <tr key={t}><th scope="row">{t}</th><td className="nowrap">{kes(v)}</td><td className="c-secondary t-sm nowrap">{pct(v, p.budget)}% of budget</td></tr>)}</tbody></table></section></div>}
      {tab === "evidence" && <section className="card"><div className="card__head"><h2 className="t-h4">Evidence · {p.photos} photos, {p.evidence.filter((e) => e.step2).length} verified here</h2>{!p.closed && <Button onClick={() => setModal({ type: "evidence" })}>Upload evidence</Button>}</div>
        {p.evidence.length ? <div className="ev-grid">{p.evidence.map((e) => (
          <article key={e._id} className="card ev-card">
            <div className="photo photo--wide"><Icon name="photo" size={24} />{e.gps && <span className="photo__gps"><Icon name="map-pin" size={12} />GPS</span>}</div>
            <div className="tbl__two"><span className="t-label">{e.title}</span><span className="t-mono">{e.gps ? e.gps : "No location"}</span><span>{e.by}</span></div>
            {e.rejected ? <Alert tone="error" title="Rejected">{e.rejected}</Alert> : <ul className="stack stack--sm">{[["Step 1 · Site inspector", e.step1, "Awaiting site inspector", true], ["Step 2 · County engineer", e.step2, e.step1 ? "Awaiting county engineer" : "Waiting for site inspector", !!e.step1]].map(([l, v, w, unlocked]) => (
              <li key={l} className="row"><span className={`icon-chip ${v ? "icon-chip--ok" : "icon-chip--wait"}`}><Icon name={v ? "check" : unlocked ? "clock" : "lock"} size={14} /></span><span className="tbl__two"><span className="t-sm c-secondary">{l}</span><span className="c-default t-body">{v ? `Verified · ${v}` : w}</span></span></li>))}</ul>}
            {!e.step2 && !e.rejected && !p.closed && <div className="row row--end card__foot"><Button type="secondary" onClick={() => setModal({ type: "verify", ev: e, reject: true })}>Reject</Button><Button onClick={() => setModal({ type: "verify", ev: e })}>Verify</Button></div>}
          </article>))}</div> : <Empty icon="camera" title="No evidence yet" action={!p.closed && <Button onClick={() => setModal({ type: "evidence" })}>Upload evidence</Button>}>Geotagged photos from the site show here for the inspector to verify.</Empty>}</section>}
      {tab === "activity" && <section className="card"><h2 className="t-h4">Activity</h2>{(p.activity || []).length ? <Activity items={p.activity} /> : <Empty icon="history" title="No activity yet">Updates, evidence and stage changes are listed here.</Empty>}</section>}
      {modal?.type === "milestone" && <MilestoneForm p={p} onClose={close} />}
      {modal?.type === "update" && <UpdateForm p={p} onClose={close} />}
      {modal?.type === "evidence" && <EvidenceForm p={p} onClose={close} />}
      {modal?.type === "verify" && <VerifyForm p={p} ev={modal.ev} reject={modal.reject} onClose={close} />}
      {modal?.type === "stage" && <StageForm p={p} onClose={close} />}
    </>
  );
}
function BudgetCard({ p, committed, remaining }) {
  return (
    <section className="card"><div className="tbl__two"><h2 className="t-h4 c-default">Budget</h2><span>Funded by {p.funder}</span></div>
      <div className="stack stack--xs"><span className="t-sm c-secondary">Approved budget</span><span className="t-stat">{kes(p.budget)}</span></div>
      <Progress value={pct(p.spent, p.budget)} second={pct(committed, p.budget)} label="Budget used" />
      <dl className="stack stack--sm">{[["Spent", p.spent, "var(--mm-action-primary)"], ["Committed", committed, "var(--mm-surface-accent)"], ["Remaining", remaining, "var(--mm-surface-low)"]].map(([l, v, c]) => <div key={l} className="row row--between"><dt className="row"><span className="legend-dot" style={{ background: c, border: "1px solid var(--mm-border-input)" }} />{l} ({pct(v, p.budget)}%)</dt><dd className="nowrap">{kes(v)}</dd></div>)}</dl>
    </section>
  );
}
function Activity({ items }) {
  return <ol className="timeline">{items.map((it, i) => (
    <li key={i} className="timeline__item"><span className={`timeline__dot ${it.pending ? "timeline__dot--pending" : ""}`}><Icon name={it.icon} size={16} /></span>
      <div className="grow stack stack--xs"><div className="row row--between row--top"><span className="tbl__two"><span className="t-label">{it.title}</span><span>{it.meta}</span></span>{it.verified && <Badge tone="operational">Verified</Badge>}</div>{it.body && <p>{it.body}</p>}{it.photos && <span className="row t-sm c-link"><Icon name="photo" size={16} />{it.photos} geotagged photos</span>}</div></li>))}</ol>;
}

/* ───────── Handover and close ───────── */
export function HandoverPage({ id }) {
  const p = col().get(id); const [confirm, setConfirm] = useState(false);
  if (!p) return null;
  const items = p.handover || [{ title: "Completion certificate", note: "Signed by the county engineer and the contractor.", status: "pending" }, { title: "Asset record update", note: "Set the asset to Operational.", status: "pending" }];
  const set = (i, status) => col().update(p._id, { handover: items.map((x, k) => (k === i ? { ...x, status } : x)) });
  const done = items.filter((x) => x.status === "done").length; const msDone = p.milestones.every((m) => m.status === "done"); const evDone = p.evidence.every((e) => e.step2 || e.rejected);
  const checks = [[`All ${p.milestones.length} milestones are done`, msDone], [`Evidence is verified`, evDone], [done === items.length ? "Every handover item is done" : `${items.length - done} handover items are open`, done === items.length], ["Final spend is recorded", true]];
  const ready = checks.every((c) => c[1]);
  function closeProject() { col().update(p._id, { closed: true, stage: 8, health: "completed", healthLabel: "Completed", done: 100, next: `Handed over, ${TODAY}`, ends: TODAY, activity: [{ icon: "flag-check", title: "Project closed and handed over", meta: `${TODAY} · Amina Mwende` }, ...(p.activity || [])] });
    if (p.asset) db.collection("assets").update(p.asset, { status: "operational", statusNote: `Since ${TODAY} · project ${p.code} closed`, maintained: TODAY }); setConfirm(false); toast("Project closed. The asset is Operational on the map."); navigate(`/projects/${p._id}`); }
  return (
    <>
      <Head p={p} actions={<><Button type="secondary" onClick={() => navigate(`/projects/${p._id}`)}>Back to project</Button><Button disabled={!ready || p.closed} onClick={() => setConfirm(true)}>Close project</Button></>} />
      <div className="grid grid--stretch">
        <section className="card col-8 col-lg-12"><h2 className="t-h4">Handover checklist · {done} of {items.length} done</h2>
          <ul className="ms-list">{items.map((it, i) => (
            <li key={it.title} className="ms-row ms-row--simple"><span className={`icon-chip ${it.status === "done" ? "icon-chip--ok" : it.status === "blocked" ? "icon-chip--bad" : "icon-chip--wait"}`}><Icon name={it.status === "done" ? "check" : it.status === "blocked" ? "lock" : "clock"} size={14} /></span>
              <span className="tbl__two ms-row__title"><span className="t-label">{it.title}</span><span>{it.note}</span></span>
              <span className="ms-row__status"><Badge tone={it.status === "done" ? "operational" : it.status === "blocked" ? "faulty" : "neutral"}>{it.status === "done" ? "Done" : it.status === "blocked" ? "Blocked" : "Pending"}</Badge></span>
              {!p.closed && <Button type="tertiary" size="sm" disabled={it.status === "blocked" && !evDone} onClick={() => set(i, it.status === "done" ? "pending" : "done")}>{it.status === "done" ? "Undo" : "Mark done"}</Button>}
            </li>))}</ul></section>
        <section className="card col-4 col-lg-12"><h2 className="t-h4">Ready to close?</h2>
          <ul className="stack stack--sm">{checks.map(([l, ok]) => <li key={l} className="row"><span className={`icon-chip ${ok ? "icon-chip--ok" : "icon-chip--bad"}`}><Icon name={ok ? "check" : "alert-triangle"} size={14} /></span><span>{l}<span className="sr-only">{ok ? ": met" : ": not met"}</span></span></li>)}</ul>
          <p className="t-sm c-secondary card__foot">{p.closed ? "This project is closed. Its documents stay here for future maintenance." : "Close project becomes available when every check is met."}</p></section>
      </div>
      {confirm && <Modal title="Close this project?" onClose={() => setConfirm(false)} footer={<><Button type="secondary" onClick={() => setConfirm(false)}>Cancel</Button><Button onClick={closeProject}>Close project</Button></>}>
        <p>{p.name} will be marked Completed and its linked asset set to Operational. The documents and evidence stay available for maintenance.</p><Alert tone="warning" title="A closed project cannot be edited">An administrator can reopen it if something was missed.</Alert></Modal>}
    </>
  );
}

/* ───────── Create project (5 steps) ───────── */
const STEPS = [["Scope and objectives", "Name and goals"], ["Location and asset", "Where and what"], ["Budget and funding", "Amount and funder"], ["Milestones", "Dates and owners"], ["Review", "Check and submit"]];
export function CreateProject() {
  const assets = db.collection("assets").all(); const pre = query().get("asset"); const from = query().get("report");
  const [step, setStep] = useState(0); const [err, setErr] = useState({});
  const [v, setV] = useState(() => db.get("projectDraft") || { name: pre ? `${assets.find((a) => a._id === pre)?.name} rehabilitation` : "", objective: "", type: "Rehabilitation", asset: pre || "", budget: "", funder: "", ref: "", start: "", end: "", contractor: "", ms: [{ title: "", due: "" }] });
  const up = (k) => (x) => setV((o) => ({ ...o, [k]: x })); const a = assets.find((x) => x._id === v.asset);
  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
  function check() { const e = {};
    if (step === 0) { if (!v.name.trim()) e.name = "Give the project a name"; if (v.objective.trim().length < 10) e.objective = "Describe the goal in a sentence or two"; }
    if (step === 1 && !v.asset) e.asset = "Choose the asset this project works on";
    if (step === 2) { const n = Number(String(v.budget).replace(/[^\d.]/g, "")); if (!n) e.budget = "Enter the approved budget in shillings"; if (!v.funder) e.funder = "Choose a funding source"; if (!v.start) e.start = "Choose a start date"; if (!v.end) e.end = "Choose an end date"; else if (v.start && v.end < v.start) e.end = "The end date is before the start date"; }
    if (step === 3 && !v.ms.some((m) => m.title.trim() && m.due)) e.ms = "Add at least one milestone with a due date";
    setErr(e); return !Object.keys(e).length; }
  const next = () => check() && setStep(step + 1);
  const save = () => { db.set("projectDraft", v); toast("Draft saved"); };
  function submit() { const all = col().all(); const n = 136 + all.length;
    const p = col().insert({ code: `MKN-PRJ-0${n}`, name: v.name.trim(), stage: 3, health: "not-started", healthLabel: "Awaiting approval", ward: `${a.wardName}, ${a.sub}`, asset: a._id, budget: Number(String(v.budget).replace(/[^\d.]/g, "")), spent: 0, done: 0, contractor: v.contractor.trim() || "Not appointed", ends: fmt(v.end), start: fmt(v.start), funder: v.funder, lead: "Amina Mwende", objective: v.objective.trim(), photos: 0, x: a.x, y: Math.max(4, a.y - 5), action: "Submit for approval", next: `Funding approval`, evidence: [],
      milestones: v.ms.filter((m) => m.title.trim() && m.due).map((m) => ({ title: m.title.trim(), note: "No description", due: fmt(m.due), owner: v.contractor.trim() || "Makueni Water Dept", progress: 0, evidence: 0, status: "upcoming" })), activity: [{ icon: "flag", title: "Project submitted for approval", meta: `${TODAY} · Amina Mwende` }] }, { first: true });
    db.collection("assets").update(a._id, { project: p._id }); db.set("projectDraft", null); toast(`${p.code} submitted for approval`); navigate(`/projects/${p._id}`); }
  return (
    <>
      <PageHead title="New project" sub="Nothing is shared until you submit for approval." />
      {from && <Alert title={`Started from community report ${from}`}>The confirmed fault is linked to this project when you submit.</Alert>}
      <div className="wizard">
        <ol className="vsteps" aria-label="Steps">{STEPS.map(([t, s], i) => <li key={t} className={`vstep ${i < step ? "vstep--done" : i === step ? "vstep--current" : ""}`} aria-current={i === step ? "step" : undefined}><span className="vstep__dot">{i < step ? <Icon name="check" size={16} /> : i + 1}</span><span className="vstep__text"><span className="t-label">{t}</span><span className="t-sm c-secondary">{s}</span></span></li>)}</ol>
        <section className="card card--pad-xl">
          <div className="stack stack--xs"><span className="t-sm c-secondary">Step {step + 1} of 5 · {STEPS[step][0].split(" ")[0]}</span><h2 className="t-h4">{STEPS[step][0]}</h2></div>
          {Object.keys(err).length > 0 && <Alert tone="error" title="Some details need attention">Fix the fields marked below to continue.</Alert>}
          {step === 0 && <><TextField label="Project name" placeholder="For example: Nguu borehole rehabilitation" value={v.name} onChange={up("name")} error={err.name} /><SelectField label="Project type" value={v.type} onChange={up("type")} options={["Rehabilitation", "New infrastructure", "Extension", "Maintenance"]} /><TextArea label="Objective" value={v.objective} onChange={up("objective")} error={err.objective} max={400} placeholder="What will change for the community when this is done?" /></>}
          {step === 1 && <><SelectField label="Linked asset" placeholder="Choose an asset" value={v.asset} onChange={up("asset")} error={err.asset} options={assets.map((x) => [x._id, `${x.name} · ${x.code}`])} helper="The project appears on this asset's profile and on the map." />
            {a && <div className="list-row"><span className="icon-chip"><Icon name={ASSET_TYPES[a.type].icon} size={18} /></span><span className="list-row__text"><span className="t-label">{a.name}</span><span className="t-sm c-secondary">{a.wardName}, {a.sub} · {a.coords}</span></span></div>}</>}
          {step === 2 && <><TextField label="Approved budget" number prefix="KES" placeholder="3,450,000" value={v.budget} onChange={up("budget")} error={err.budget} helper="Include contingency." />
            <div className="form__pair"><SelectField label="Funding source" placeholder="Choose a funder" value={v.funder} onChange={up("funder")} error={err.funder} options={["Water Sector Trust Fund", "County Government of Makueni", "World Vision Kenya", "Other partner"]} /><TextField label="Funding reference" optional placeholder="WSTF/MKN/2026/041" value={v.ref} onChange={up("ref")} helper="As on the award letter." /></div>
            <div className="form__pair"><DateField label="Start date" value={v.start} onChange={up("start")} error={err.start} helper="Planned start." /><DateField label="End date" min={v.start} value={v.end} onChange={up("end")} error={err.end} helper="Planned completion." /></div></>}
          {step === 3 && <><TextField label="Contractor" optional placeholder="Leave empty if not appointed yet" value={v.contractor} onChange={up("contractor")} />
            {v.ms.map((m, i) => <div key={i} className="form__pair"><TextField label={`Milestone ${i + 1}`} placeholder="For example: Pump installed" value={m.title} onChange={(x) => up("ms")(v.ms.map((y, k) => (k === i ? { ...y, title: x } : y)))} error={i === 0 ? err.ms : null} /><DateField label="Due date" value={m.due} onChange={(x) => up("ms")(v.ms.map((y, k) => (k === i ? { ...y, due: x } : y)))} /></div>)}
            <Button type="secondary" block icon="plus" onClick={() => up("ms")([...v.ms, { title: "", due: "" }])}>Add another milestone</Button></>}
          {step === 4 && <><dl className="facts facts--2"><Fact label="Project">{v.name}</Fact><Fact label="Type">{v.type}</Fact><Fact label="Linked asset">{a?.name} · {a?.code}</Fact><Fact label="Location">{a?.wardName}, {a?.sub}</Fact><Fact label="Approved budget">{kes(Number(String(v.budget).replace(/[^\d.]/g, "")))}</Fact><Fact label="Funder">{v.funder}</Fact><Fact label="Dates">{fmt(v.start)} to {fmt(v.end)}</Fact><Fact label="Contractor">{v.contractor || "Not appointed"}</Fact></dl>
            <dl><Fact label="Objective">{v.objective}</Fact></dl><dl><Fact label="Milestones">{v.ms.filter((m) => m.title.trim() && m.due).map((m) => `${m.title} (${fmt(m.due)})`).join(" · ")}</Fact></dl>
            <Alert>Submitting sends the project to your administrator for approval. Contractors are appointed through your own procurement process.</Alert></>}
          <div className="form__actions"><Button type="tertiary" onClick={() => (step ? setStep(step - 1) : navigate("/projects"))}>{step ? "Back" : "Cancel"}</Button><Button type="secondary" onClick={save}>Save draft</Button>{step < 4 ? <Button onClick={next}>Next</Button> : <Button onClick={submit}>Submit for approval</Button>}</div>
        </section>
      </div>
    </>
  );
}
