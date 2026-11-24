import React, { useEffect, useRef, useState } from "react";
import { db } from "../db.js";
import { ASSET_TYPES, CLUSTER, PIPELINE, REPORT_STATUS, REPORT_TYPES, STATUS, WARDS } from "../seed.js";
import { navigate, query, setQuery } from "../router.js";
import { Alert, Badge, Button, Checkbox, Empty, Fact, FilterSelect, Icon, IconButton, Menu, Modal, Photos, Progress, Segmented, SelectField, Switch, Table, TableFooter, Tabs, TextField, toast, useFirstLoad, usePaged, wait } from "../components/ui.jsx";
import { PageHead } from "./shell.jsx";

const MAP_W = 1360, MAP_H = 836;
export const StatusBadge = ({ status }) => <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>;
export const TypeChip = ({ type, size = 32 }) => <span className="icon-chip" style={{ width: size, height: size }}><Icon name={ASSET_TYPES[type].icon} size={size * 0.56} /></span>;
const band = (pct) => (pct < 40 ? ["Low access", 1] : pct <= 70 ? ["Medium access", 2] : ["High access", 3]);
const defaultFilters = { q: "", sub: "", ward: "", types: [], statuses: [], reports: false, projects: true, access: false };

/* ───────── Map canvas: a static base map image with live layers on top ───────── */
export function MapCanvas({ assets, selected, onSelect, layers, reports = [], selectedReport, onReport, onProject, overlay, children }) {
  const box = useRef(null);
  const [size, setSize] = useState({ w: MAP_W, h: MAP_H });
  const [view, setView] = useState({ z: 1, x: 0, y: 0 });
  const drag = useRef(null);
  useEffect(() => {
    const fit = () => { const r = box.current.getBoundingClientRect(); const s = Math.max(r.width / MAP_W, r.height / MAP_H); setSize({ w: MAP_W * s, h: MAP_H * s, bw: r.width, bh: r.height }); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(box.current); return () => ro.disconnect();
  }, []);
  const clamp = (v) => {
    const mx = Math.max(0, (size.w * v.z - (size.bw || size.w)) / 2), my = Math.max(0, (size.h * v.z - (size.bh || size.h)) / 2);
    return { z: v.z, x: Math.max(-mx, Math.min(mx, v.x)), y: Math.max(-my, Math.min(my, v.y)) };
  };
  const zoom = (d) => setView((v) => clamp({ ...v, z: Math.max(1, Math.min(3, +(v.z + d).toFixed(2))) }));
  const down = (e) => { if (e.target.closest("button")) return; drag.current = { x: e.clientX - view.x, y: e.clientY - view.y }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { if (drag.current) setView((v) => clamp({ ...v, x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })); };
  const key = (e) => { const step = 48; const m = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (m && e.target === e.currentTarget) { e.preventDefault(); setView((v) => clamp({ ...v, x: v.x + m[0], y: v.y + m[1] })); } if (e.key === "+" || e.key === "=") zoom(0.5); if (e.key === "-") zoom(-0.5); };
  const inv = { transform: `translate(-50%, -100%) scale(${1 / view.z})` };
  return (
    <div className="map" ref={box}>
      <div className="map__canvas" tabIndex={0} role="application" aria-label="Map of water assets around Wote, Makueni County. Use the arrow keys to move and plus or minus to zoom. The same assets are listed in the List view."
        style={{ width: size.w, height: size.h, transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px)) scale(${view.z})`, cursor: drag.current ? "grabbing" : "grab" }}
        onPointerDown={down} onPointerMove={move} onPointerUp={() => (drag.current = null)} onKeyDown={key}>
        <img className="map__img" src="img/basemap.jpg" alt="" draggable="false" />
        <svg className="map__svg" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true">
          {layers.access && WARDS.map((w) => <polygon key={w.id} points={w.shape} className={`ward ward--${band(w.access)[1]}`} />)}
          {!layers.access && <polyline className="pipeline" points={PIPELINE.map(([x, y]) => `${x * MAP_W / 100},${y * MAP_H / 100}`).join(" ")} />}
        </svg>
        {layers.access && WARDS.map((w) => <span key={w.id} className="ward-label" style={{ left: `${w.label[0] / MAP_W * 100}%`, top: `${w.label[1] / MAP_H * 100}%`, transform: `translate(-50%, -50%) scale(${1 / view.z})` }}>{w.name} · {w.access}%</span>)}
        {!layers.access && <>
          <button type="button" className="marker marker--cluster" style={{ left: `${CLUSTER.x}%`, top: `${CLUSTER.y}%`, ...inv }} aria-label={`${CLUSTER.count} assets close together. Zoom in to see them.`} onClick={() => { zoom(1); toast("Zoom in to tell the 42 assets apart", { icon: "zoom-in" }); }}>{CLUSTER.count}</button>
          {layers.projects && db.collection("projects").all().filter((p) => !p.closed).map((p) => (
            <button key={p._id} type="button" className="marker marker--project" style={{ left: `${p.x}%`, top: `${p.y}%`, ...inv }} aria-label={`Project: ${p.name}, ${p.healthLabel}`} title={p.name} onClick={() => onProject ? onProject(p) : navigate(`/projects/${p._id}`)}><Icon name="copy" size={18} /></button>
          ))}
          {assets.map((a) => (
            <button key={a._id} type="button" className={`marker marker--${a.status} ${selected === a._id ? "marker--on" : ""}`} style={{ left: `${a.x}%`, top: `${a.y}%`, ...inv }}
              aria-label={`${a.name}, ${ASSET_TYPES[a.type].label}, ${STATUS[a.status].label}`} aria-pressed={selected === a._id} onClick={() => onSelect(a)}>
              <Icon name={ASSET_TYPES[a.type].icon} size={18} /><span className="marker__badge"><Icon name={STATUS[a.status].icon} size={10} /></span>
              {selected === a._id && <span className="marker__label">{a.name}</span>}
            </button>
          ))}
          {layers.reports && reports.map((r) => (
            <button key={r._id} type="button" className={`marker marker--report ${selectedReport === r._id ? "marker--on" : ""}`} style={{ left: `${r.x}%`, top: `${r.y}%`, ...inv }}
              aria-label={`Community report ${r.code}: ${r.title}, ${REPORT_STATUS[r.status].label}`} onClick={() => onReport(r)}><Icon name={REPORT_TYPES[r.type].icon} size={16} /></button>
          ))}
        </>}
        {overlay && <div className="map__popup" style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, transform: `translate(-50%, calc(-100% - ${52 / view.z}px)) scale(${1 / view.z})`, transformOrigin: "bottom center" }}>{overlay.node}</div>}
      </div>
      <div className="map__zoom">
        <div className="map__ctl"><IconButton icon="plus" label="Zoom in" onClick={() => zoom(0.5)} disabled={view.z >= 3} /><hr className="divider" /><IconButton icon="minus" label="Zoom out" onClick={() => zoom(-0.5)} disabled={view.z <= 1} /></div>
        <div className="map__ctl"><IconButton icon="current-location" label="Back to the whole county view" onClick={() => setView({ z: 1, x: 0, y: 0 })} /></div>
      </div>
      <p className="map__attr">© OpenStreetMap contributors · Assets: Makueni County asset register, updated 4 Nov 2026</p>
      {children}
    </div>
  );
}

function Legend({ access, open, onToggle }) {
  if (access) return (
    <div className="map-card map-card--legend" aria-label="Legend">
      <h2 className="t-label">Water access by ward</h2>
      <p className="t-sm c-secondary">People within reach of a working water point. Darker means lower access.</p>
      {[["Under 40% within reach", 1], ["40–70% within reach", 2], ["Over 70% within reach", 3]].map(([l, b]) => <span key={b} className="row t-sm"><span className={`ward-swatch ward-swatch--${b}`} />{l}</span>)}
    </div>
  );
  return (
    <div className={`map-card map-card--legend ${open ? "" : "map-card--closed"}`}>
      <button type="button" className="row row--between" style={{ width: "100%" }} aria-expanded={open} onClick={onToggle}><h2 className="t-label">Legend</h2><Icon name={open ? "chevron-down" : "chevron-right"} size={18} /></button>
      {open && <>
        <p className="t-mono c-secondary">Asset status</p>
        {Object.entries(STATUS).map(([k, s]) => <span key={k} className="row t-sm"><span className={`marker marker--${k} marker--mini`}><Icon name={s.icon} size={10} /></span>{s.label}</span>)}
        <p className="t-mono c-secondary">Asset types</p>
        {Object.values(ASSET_TYPES).map((t) => <span key={t.label} className="row t-sm"><span className="icon-chip icon-chip--round" style={{ width: 24, height: 24 }}><Icon name={t.icon} size={14} /></span>{t.label}</span>)}
        <p className="t-mono c-secondary">Projects and network</p>
        <span className="row t-sm"><span className="marker marker--project marker--mini"><Icon name="copy" size={10} /></span>Project</span>
        <span className="row t-sm"><span className="pipeline-swatch" />Trunk main</span>
        <span className="row t-sm"><span className="marker marker--report marker--mini"><Icon name="droplet" size={10} /></span>Community report</span>
      </>}
    </div>
  );
}

function WardPanel() {
  return (
    <div className="map-card map-card--left" aria-label="Water access by ward">
      <h2 className="t-h4">Water access by ward</h2>
      <p className="c-secondary">People within reach of a working water point, lowest first. Sample figures.</p>
      <table className="ward-table"><caption className="sr-only">Share of people within reach of a working water point, by ward</caption>
        <tbody>{[...WARDS].sort((a, b) => a.access - b.access).map((w) => { const [l, b] = band(w.access); return (
          <tr key={w.id}><th scope="row">{w.name}</th><td className="right">{w.access}%</td><td><span className={`access-band access-band--${b}`}><span className="meter" aria-hidden="true"><i /><i /><i /></span>{l}</span></td></tr>); })}</tbody>
      </table>
      <p className="t-sm c-secondary">Bands are placeholders: low under 40%, medium 40 to 70%, high over 70%.</p>
    </div>
  );
}

function FilterPanel({ f, set, counts, onClose, active }) {
  const toggle = (k, v) => set({ [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  const subs = [...new Set(db.collection("assets").all().map((a) => a.sub))].sort();
  const wards = [...new Set(db.collection("assets").all().filter((a) => !f.sub || a.sub === f.sub).map((a) => a.wardName))].sort();
  return (
    <div className="map-card map-card--left map-card--filters" role="region" aria-label="Filters">
      <div className="row row--between"><h2 className="t-h4">Filters</h2><div className="row">{active > 0 && <Button type="tertiary" size="sm" onClick={() => set({ ...defaultFilters, reports: f.reports, projects: f.projects, access: f.access })}>Clear</Button>}<IconButton icon="x" size="sm" label="Hide filters" onClick={onClose} /></div></div>
      <TextField icon="search" placeholder="Search assets, IDs or wards" aria-label="Search assets, IDs or wards" value={f.q} onChange={(q) => set({ q })} />
      <p className="t-mono c-secondary">Place</p>
      <SelectField label="Sub-county" value={f.sub} onChange={(sub) => set({ sub, ward: "" })} placeholder="All sub-counties" options={subs} />
      <SelectField label="Ward" value={f.ward} onChange={(ward) => set({ ward })} placeholder="All wards" options={wards} />
      <hr className="divider" />
      <p className="t-mono c-secondary">Asset type</p>
      <div className="chips">{Object.entries(ASSET_TYPES).map(([k, t]) => <button key={k} type="button" className={`chip ${f.types.includes(k) ? "chip--on" : ""}`} aria-pressed={f.types.includes(k)} onClick={() => toggle("types", k)}>{f.types.includes(k) && <Icon name="check" size={14} />}{t.label}</button>)}</div>
      <hr className="divider" />
      <p className="t-mono c-secondary">Status</p>
      {Object.entries(STATUS).map(([k, s]) => <div key={k} className="row row--between"><Checkbox checked={f.statuses.includes(k)} onChange={() => toggle("statuses", k)} label={s.label} /><span className="t-mono c-secondary">{counts[k] || 0}</span></div>)}
      <hr className="divider" />
      <p className="t-mono c-secondary">Layers</p>
      {[["reports", "Community reports", "Unverified until reviewed"], ["projects", "Projects", "Open projects"], ["access", "Water access by ward", "Shows underserved areas"]].map(([k, l, n]) => (
        <div key={k} className="row row--between"><span className="tbl__two"><span>{l}</span><span>{n}</span></span><Switch checked={f[k]} onChange={(v) => set({ [k]: v })} label={l} /></div>
      ))}
    </div>
  );
}

/* ───────── Asset dialogs ───────── */
function EditAsset({ asset, onClose }) {
  const [status, setStatus] = useState(asset.status); const [managedBy, setManagedBy] = useState(asset.managedBy);
  return (
    <Modal title={`Edit ${asset.name}`} onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => { db.collection("assets").update(asset._id, { status, managedBy, statusNote: `Updated ${TODAY} by Amina Mwende` }); toast("Asset record updated"); onClose(); }}>Save changes</Button></>}>
      <div className="form__pair"><SelectField label="Operational status" value={status} onChange={setStatus} options={Object.entries(STATUS).map(([k, s]) => [k, s.label])} /><TextField label="Managed by" value={managedBy} onChange={setManagedBy} /></div>
      <Alert>Every change is kept in the asset history with your name and the date.</Alert>
    </Modal>
  );
}
const TODAY = "24 Nov 2026";
function LogMaintenance({ asset, onClose }) {
  const [what, setWhat] = useState(""); const [err, setErr] = useState("");
  return (
    <Modal title="Log maintenance" onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => { if (!what.trim()) return setErr("Say what was done"); db.collection("assets").update(asset._id, { maintained: TODAY, log: [{ title: what.trim(), meta: `${TODAY} · Amina Mwende` }, ...(asset.log || [])] }); toast("Maintenance logged"); onClose(); }}>Save</Button></>}>
      <TextField label="What was done?" placeholder="For example: replaced the pump seal" value={what} onChange={setWhat} error={err} />
      <div className="form__pair"><TextField label="Date" value={TODAY} disabled /><TextField label="Done by" value="Amina Mwende" disabled /></div>
    </Modal>
  );
}

function AssetPanel({ asset, onClose }) {
  const [tab, setTab] = useState("about"); const [modal, setModal] = useState(null);
  const project = asset.project && db.collection("projects").get(asset.project);
  const reps = db.collection("reports").all().filter((r) => r.asset === asset._id || r.suggest === asset._id);
  const history = [...(asset.log || []), { title: "Record checked against the county register", meta: "4 Nov 2026 · Data import" }, { title: `Asset registered (${asset.installed === "Not recorded" ? "survey" : "installed " + asset.installed})`, meta: asset.source.split(" · ")[0] }];
  return (
    <aside className="map-card map-card--panel" aria-label={`${asset.name} profile`}>
      <div className="row row--top"><TypeChip type={asset.type} size={40} /><div className="tbl__two grow"><h2 className="t-h4">{asset.name}</h2><span className="t-mono">{asset.code}</span></div><IconButton icon="x" label="Close asset profile" onClick={onClose} /></div>
      <div className="row row--wrap"><StatusBadge status={asset.status} />{asset.statusNote && <span className="t-sm c-secondary">{asset.statusNote}</span>}</div>
      <Photos count={asset.photos || 0} />
      <div className="form__pair"><Button type="secondary" onClick={() => setModal("edit")}>Edit asset</Button><Button type="tonal" onClick={() => setModal("log")}>Log maintenance</Button></div>
      <Tabs label="Asset profile" value={tab} onChange={setTab} tabs={[["about", "About"], ["projects", "Projects", project ? 1 : 0], ["history", "History"], ["reports", "Reports", reps.length]]} />
      {tab === "about" && <>
        {project && <Alert title={`Active project: ${project.name}`} actions={<Button type="secondary" size="sm" onClick={() => navigate(`/projects/${project._id}`)}>View project</Button>}>Stage {project.stage} of 8 · {project.healthLabel}. Next: {project.next}.</Alert>}
        <dl className="facts facts--2 facts--keep">
          <Fact label="Asset type">{ASSET_TYPES[asset.type].label}</Fact><Fact label="Owner">{asset.owner}</Fact>
          <Fact label="Managed by">{asset.managedBy}</Fact><Fact label="Ward">{asset.wardName}, {asset.sub}</Fact>
          <Fact label="Coordinates">{asset.coords}</Fact><Fact label="Installed">{asset.installed}</Fact>
          {asset.depth && <Fact label="Depth">{asset.depth}</Fact>}{asset.yield && <Fact label="Yield">{asset.yield}</Fact>}{asset.capacity && <Fact label="Capacity">{asset.capacity}</Fact>}
          <Fact label="Last maintained">{asset.maintained}</Fact><Fact label="Serves">{asset.serves}</Fact>
        </dl>
        <p className="row t-sm c-secondary"><Icon name="clock" size={14} />Source: {asset.source}</p>
      </>}
      {tab === "projects" && (project ? (
        <button type="button" className="list-row" onClick={() => navigate(`/projects/${project._id}`)}><span className="list-row__text"><span className="t-label">{project.name}</span><span className="t-sm c-secondary">{project.code} · Stage {project.stage} of 8</span><Progress value={project.done} label="Work done" /></span><Badge>{project.healthLabel}</Badge></button>
      ) : <Empty icon="copy" title="No projects yet" action={<Button type="secondary" onClick={() => navigate(`/projects/new?asset=${asset._id}`)}>Create a project</Button>}>Create a rehabilitation or expansion project for this asset.</Empty>)}
      {tab === "history" && <ol className="timeline">{history.map((h, i) => <li key={i} className="timeline__item"><span className="timeline__dot"><Icon name="history" size={16} /></span><span className="tbl__two"><span className="t-label">{h.title}</span><span>{h.meta}</span></span></li>)}</ol>}
      {tab === "reports" && (reps.length ? <div className="stack stack--sm">{reps.map((r) => (
        <button key={r._id} type="button" className="list-row" onClick={() => navigate(`/reports/${r._id}`)}><span className="list-row__text"><span className="t-label">{r.code} · {REPORT_TYPES[r.type].long}</span><span className="t-sm c-secondary">{r.at}</span></span><Badge tone={REPORT_STATUS[r.status].tone}>{REPORT_STATUS[r.status].label}</Badge></button>
      ))}</div> : <Empty icon="message-report" title="No community reports">Reports that residents send about this asset will show here.</Empty>)}
      {modal === "edit" && <EditAsset asset={asset} onClose={() => setModal(null)} />}
      {modal === "log" && <LogMaintenance asset={asset} onClose={() => setModal(null)} />}
    </aside>
  );
}

/* ───────── Water Atlas page ───────── */
export function AtlasPage({ reportsMode }) {
  const saved = db.get("atlas") || {};
  const f = { ...defaultFilters, ...saved, ...(reportsMode ? { reports: true, access: false } : {}) };
  const set = (patch) => db.set("atlas", { ...f, ...patch });
  useEffect(() => { if (query().get("layer") === "access" && !f.access) set({ access: true }); }, []);
  const [filtersOpen, setFiltersOpen] = useState(() => window.innerWidth > 900 && !query().get("asset"));
  const [legendOpen, setLegendOpen] = useState(() => window.innerWidth > 1180 && !query().get("asset"));
  const [popup, setPopup] = useState(null); const [reportPopup, setReportPopup] = useState(null);
  const all = db.collection("assets").all(); const demo = db.get("demo");
  const s = f.q.trim().toLowerCase();
  const shown = all.filter((a) => (!s || [a.name, a.code, a.wardName].some((t) => t.toLowerCase().includes(s))) && (!f.sub || a.sub === f.sub) && (!f.ward || a.wardName === f.ward) && (!f.types.length || f.types.includes(a.type)) && (!f.statuses.length || f.statuses.includes(a.status)));
  const counts = all.reduce((c, a) => ({ ...c, [a.status]: (c[a.status] || 0) + 1 }), {});
  const active = (f.q ? 1 : 0) + (f.sub ? 1 : 0) + (f.ward ? 1 : 0) + f.types.length + f.statuses.length;
  const openId = query().get("asset"); const open = openId && all.find((a) => a._id === openId);
  const reports = db.collection("reports").all().filter((r) => ["unverified", "review"].includes(r.status));
  const pop = popup && all.find((a) => a._id === popup); const rpop = reportPopup && reports.find((r) => r._id === reportPopup);
  const overlay = pop ? { x: pop.x, y: pop.y, node: (
    <div className="map-card map-card--popup" role="dialog" aria-label={pop.name}>
      <div className="row row--top"><TypeChip type={pop.type} /><div className="tbl__two grow"><span className="t-label">{pop.name}</span><span className="t-mono">{pop.code}</span></div><IconButton icon="x" size="sm" label="Close" onClick={() => setPopup(null)} /></div>
      <div><StatusBadge status={pop.status} /></div>
      <p className="t-sm">{pop.wardName}, {pop.sub}<br />Last maintained {pop.maintained}</p>
      <Button type="secondary" block size="sm" onClick={() => { setPopup(null); setFiltersOpen(false); setLegendOpen(false); setQuery({ asset: pop._id }); }}>View details</Button>
    </div>) } : rpop ? { x: rpop.x, y: rpop.y, node: (
    <div className="map-card map-card--popup" role="dialog" aria-label={rpop.code}>
      <div className="row row--top"><span className="icon-chip"><Icon name={REPORT_TYPES[rpop.type].icon} size={18} /></span><div className="tbl__two grow"><span className="t-label">{REPORT_TYPES[rpop.type].long}</span><span className="t-mono">{rpop.code}</span></div><IconButton icon="x" size="sm" label="Close" onClick={() => setReportPopup(null)} /></div>
      <div><Badge tone={REPORT_STATUS[rpop.status].tone}>{REPORT_STATUS[rpop.status].label}</Badge></div>
      <p className="t-sm">{rpop.ward}, {rpop.wsub}<br />{rpop.at} · {rpop.distance}</p>
      <Button type="secondary" block size="sm" onClick={() => navigate(`/reports/${rpop._id}`)}>Open report</Button>
    </div>) } : null;
  return (
    <div className="map-page">
      {demo.connection !== "online" && <div className={`map-banner ${demo.connection === "error" ? "map-banner--error" : ""}`} role="status">
        <Icon name={demo.connection === "offline" ? "wifi-off" : demo.connection === "error" ? "alert-circle" : "refresh"} size={18} className={demo.connection === "syncing" ? "spin" : ""} />
        <span className="grow">{demo.connection === "offline" ? "You are offline. The map shows what was saved on 24 Nov 2026, 14:02. Changes save here and send when you are back online." : demo.connection === "error" ? "The map could not load. Your assets are still in the List view." : "Syncing 3 field updates…"}</span>
        {demo.connection === "error" && <Button size="sm" type="secondary" onClick={() => db.patch("demo", { connection: "online" })}>Try again</Button>}
      </div>}
      <MapCanvas assets={shown} selected={open?._id || popup} layers={f} reports={reports} selectedReport={reportPopup} overlay={overlay}
        onSelect={(a) => { setReportPopup(null); setPopup(a._id); }} onReport={(r) => { setPopup(null); setReportPopup(r._id); }}>
        {f.access ? <WardPanel /> : filtersOpen ? <FilterPanel f={f} set={set} counts={counts} active={active} onClose={() => setFiltersOpen(false)} />
          : <button type="button" className="btn btn--tonal map__filters-btn" onClick={() => { setFiltersOpen(true); if (open) setQuery({ asset: null }); }}><Icon name="filter" size={18} />Filters{active ? ` (${active})` : ""}<Icon name="chevron-down" size={16} /></button>}
        <div className="map__view">{f.access
          ? <Button type="secondary" size="sm" icon="x" onClick={() => { set({ access: false }); if (query().get("layer")) setQuery({ layer: null }); }}>Close water access</Button>
          : <Segmented label="View" value="map" onChange={(v) => v === "list" && navigate(reportsMode ? "/reports" : "/assets")} options={[["map", "Map"], ["list", "List"]]} />}</div>
        {!f.access && shown.length === 0 && <div className="map-card map-card--center"><Empty icon="search" title="No assets match these filters" action={<Button type="secondary" onClick={() => set({ ...defaultFilters, reports: f.reports, projects: f.projects })}>Clear filters</Button>}>Try another ward or remove a status.</Empty></div>}
        {open ? <AssetPanel key={open._id} asset={open} onClose={() => setQuery({ asset: null })} /> : <Legend access={f.access} open={legendOpen} onToggle={() => setLegendOpen(!legendOpen)} />}
      </MapCanvas>
    </div>
  );
}

/* ───────── Assets: the register ───────── */
function RegisterAsset({ onClose }) {
  const [v, setV] = useState({ name: "", type: "", ward: "", lat: "", lng: "", owner: "County government", status: "operational" });
  const [err, setErr] = useState({}); const [busy, setBusy] = useState(false); const [failed, setFailed] = useState(false);
  const up = (k) => (val) => setV((o) => ({ ...o, [k]: val }));
  const ready = v.name && v.type && v.ward && v.lat && v.lng;
  const dup = v.lat.trim().startsWith("-1.8036") && v.lng.trim().startsWith("37.6237");
  async function save() {
    const e = {};
    if (!v.name.trim()) e.name = "Enter the asset name";
    if (!v.type) e.type = "Choose a type"; if (!v.ward) e.ward = "Choose a ward";
    if (!/^-?\d+(\.\d+)?$/.test(v.lat.trim()) || Math.abs(+v.lat) > 5) e.lat = "Use decimal degrees, for example -1.7915";
    if (!/^-?\d+(\.\d+)?$/.test(v.lng.trim()) || +v.lng < 33 || +v.lng > 42) e.lng = "Use decimal degrees, for example 37.4468";
    setErr(e); setFailed(false); if (Object.keys(e).length) return;
    setBusy(true); await wait(800); setBusy(false);
    if (db.get("demo").saveFails) return setFailed(true);
    const t = ASSET_TYPES[v.type]; const num = String(4612 + db.collection("assets").all().length).padStart(6, "0");
    const a = db.collection("assets").insert({ name: v.name.trim(), type: v.type, code: `MKN-${t.code}-${num}`, ward: "wote", wardName: v.ward, sub: db.collection("assets").all().find((x) => x.wardName === v.ward)?.sub || "Makueni", status: v.status, managedBy: "Not recorded", maintained: "Not recorded",
      x: 30 + Math.random() * 40, y: 30 + Math.random() * 40, owner: v.owner, installed: "Not recorded", serves: "Not recorded", coords: `${v.lat}, ${v.lng}`, source: `Registered by Amina Mwende · ${TODAY}` }, { first: true });
    onClose(); toast(`${a.name} registered as ${a.code}`, { action: { label: "View asset", onClick: () => navigate(`/atlas?asset=${a._id}`) } });
  }
  const wards = [...new Set(db.collection("assets").all().map((a) => a.wardName))].sort();
  return (
    <Modal title="Register an asset" onClose={onClose} locked={busy} footer={<><Button type="secondary" onClick={onClose} disabled={busy}>Cancel</Button><Button onClick={save} loading={busy} disabled={!ready && !Object.keys(err).length}>{failed ? "Try again" : "Register asset"}</Button></>}>
      {failed && <Alert tone="error" title="The asset was not saved">Check your connection and try again. Nothing you typed has been lost.</Alert>}
      {Object.keys(err).length > 0 && <Alert tone="error" title="Some details need attention">Fix the fields marked below.</Alert>}
      {dup && <Alert tone="warning" title="Possible duplicate">Kwa Mutonga borehole (MKN-BH-004217) is at this location. Check before you register a second record.</Alert>}
      <TextField label="Asset name" placeholder="For example: Mbooni market borehole" value={v.name} onChange={up("name")} error={err.name} />
      <div className="form__pair"><SelectField label="Asset type" placeholder="Choose a type" value={v.type} onChange={up("type")} error={err.type} options={Object.entries(ASSET_TYPES).map(([k, t]) => [k, t.label])} /><SelectField label="Ward" placeholder="Choose a ward" value={v.ward} onChange={up("ward")} error={err.ward} options={wards} /></div>
      <div className="form__pair"><TextField label="Latitude" inputMode="decimal" placeholder="-1.7915" value={v.lat} onChange={up("lat")} error={err.lat} helper="Decimal degrees" /><TextField label="Longitude" inputMode="decimal" placeholder="37.4468" value={v.lng} onChange={up("lng")} error={err.lng} helper="Decimal degrees" /></div>
      <div><Button type="tertiary" icon="map-pin" onClick={() => { setV((o) => ({ ...o, lat: "-1.7915", lng: "37.4468" })); toast("Location picked from the map", { icon: "map-pin" }); }}>Pick location on map</Button></div>
      <div className="form__pair"><SelectField label="Ownership" value={v.owner} onChange={up("owner")} options={["County government", "Water utility", "Community", "NGO", "Private"]} /><SelectField label="Operational status" value={v.status} onChange={up("status")} options={Object.entries(STATUS).map(([k, s]) => [k, s.label])} /></div>
    </Modal>
  );
}

function ExportAssets({ count, selected, onClose }) {
  const [step, setStep] = useState("options"); const [format, setFormat] = useState("CSV"); const [scope, setScope] = useState(selected ? "selected" : "filtered");
  const [inc, setInc] = useState({ coords: true, history: false, source: true }); const [pct, setPct] = useState(0);
  useEffect(() => {
    if (step !== "preparing") return;
    const t = setInterval(() => setPct((p) => { if (p >= 100) { clearInterval(t); setStep(db.get("demo").exportFails ? "failed" : "ready"); return 100; } return p + 20; }), 280);
    return () => clearInterval(t);
  }, [step]);
  const n = scope === "selected" ? selected : count; const file = `makueni-assets-2026-11-24.${format.toLowerCase()}`;
  const download = () => { const rows = [["Register ID", "Asset", "Type", "Ward", "Status", "Managed by", "Last maintained", "Source"], ...db.collection("assets").all().slice(0, n).map((a) => [a.code, a.name, ASSET_TYPES[a.type].label, a.wardName, STATUS[a.status].label, a.managedBy, a.maintained, a.source])];
    const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.replace(/\.\w+$/, ".csv"); a.click(); toast("Download started"); onClose(); };
  return (
    <Modal title="Export assets" onClose={onClose} locked={step === "preparing"} footer={
      step === "options" ? <><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => { setPct(0); setStep("preparing"); }}>Export {n} assets</Button></>
      : step === "preparing" ? <><Button type="secondary" disabled>Cancel</Button><Button loading>Preparing</Button></>
      : step === "ready" ? <><Button type="secondary" onClick={onClose}>Close</Button><Button icon="download" onClick={download}>Download file</Button></>
      : <><Button type="secondary" onClick={onClose}>Close</Button><Button onClick={() => { setPct(0); setStep("preparing"); }}>Try again</Button></>}>
      {step === "options" && <>
        <div className="form__pair"><SelectField label="Format" value={format} onChange={setFormat} options={["CSV", "XLSX", "GeoJSON"]} /><SelectField label="What to export" value={scope} onChange={setScope} options={[...(selected ? [["selected", `Selected rows (${selected})`]] : []), ["filtered", `Current filters (${count})`]]} /></div>
        <fieldset className="stack stack--sm" style={{ border: 0, padding: 0, margin: 0 }}><legend className="field__label" style={{ marginBottom: 8 }}>Include</legend>
          <Checkbox checked={inc.coords} onChange={(c) => setInc({ ...inc, coords: c })} label="Coordinates" /><Checkbox checked={inc.history} onChange={(c) => setInc({ ...inc, history: c })} label="Maintenance history" /><Checkbox checked={inc.source} onChange={(c) => setInc({ ...inc, source: c })} label="Source and last-updated date" helper="Recommended, so the file stays traceable." />
        </fieldset>
        <Alert>Every export keeps the source and last-updated date of each record.</Alert>
      </>}
      {step === "preparing" && <div className="stack stack--sm"><p className="t-label">Preparing {n} assets</p><Progress value={pct} label="Export progress" /><p className="t-sm c-secondary">{pct}% · This usually takes a few seconds. Keep this window open.</p></div>}
      {step === "ready" && <><Alert tone="success" title="Your file is ready">{n} assets, with source and last-updated date.</Alert><div className="list-row"><Icon name="file-text" /><span className="list-row__text"><span className="t-label">{file}</span><span className="t-sm c-secondary">{Math.max(4, n * 2)} KB</span></span></div></>}
      {step === "failed" && <Alert tone="error" title="The export did not finish">Nothing was downloaded. Try again; if it keeps failing, export fewer assets.</Alert>}
    </Modal>
  );
}

export function AssetsPage() {
  const loading = useFirstLoad("assets"); const all = db.collection("assets").all();
  const [q, setQ] = useState(""); const [ward, setWard] = useState(""); const [status, setStatus] = useState(""); const [type, setType] = useState("");
  const [sel, setSel] = useState([]); const [modal, setModal] = useState(null);
  const s = q.trim().toLowerCase();
  const rows = all.filter((a) => (!s || [a.name, a.code, a.wardName].some((t) => t.toLowerCase().includes(s))) && (!ward || a.wardName === ward) && (!status || STATUS[a.status].label === status) && (!type || ASSET_TYPES[a.type].label === type));
  const paged = usePaged(rows, { key: "name", dir: 1 }); const filtered = q || ward || status || type;
  const clear = () => { setQ(""); setWard(""); setStatus(""); setType(""); };
  const columns = [
    { key: "name", label: "Asset", flex: 1.6, min: 220, sort: true, render: (a) => <><TypeChip type={a.type} /><span className="tbl__two"><button type="button" className="tbl__open" onClick={() => navigate(`/atlas?asset=${a._id}`)}>{a.name}</button><span>{ASSET_TYPES[a.type].label}</span></span></> },
    { key: "code", label: "Register ID", width: 152, sort: true, render: (a) => <span className="t-mono">{a.code}</span> },
    { key: "wardName", label: "Ward", flex: 1.2, min: 150, sort: true, render: (a) => <span className="tbl__two"><span>{a.wardName}</span><span>{a.sub}</span></span> },
    { key: "status", label: "Status", width: 150, sort: true, render: (a) => <StatusBadge status={a.status} /> },
    { key: "managedBy", label: "Managed by", flex: 1.2, min: 150, sort: true },
    { key: "maintained", label: "Last maintained", width: 140 },
    { key: "menu", label: "", width: 64, align: "right", stop: true, render: (a) => <Menu trigger={({ toggle, open }) => <IconButton icon="dots-vertical" size="sm" label={`Actions for ${a.name}`} aria-expanded={open} onClick={toggle} />} items={[{ label: "View on map", icon: "map-2", onClick: () => navigate(`/atlas?asset=${a._id}`) }, { label: "Create project", icon: "copy", onClick: () => navigate(`/projects/new?asset=${a._id}`) }]} /> },
  ];
  return (
    <>
      <PageHead title="Asset register" actions={<Segmented label="View" value="list" onChange={(v) => v === "map" && navigate("/atlas")} options={[["map", "Map"], ["list", "List"]]} />} />
      <div className="tbl-wrap">
        {sel.length ? (
          <div className="toolbar"><div className="toolbar toolbar--selected grow" role="region" aria-label="Selected rows"><span className="t-label" aria-live="polite">{sel.length} selected</span><Button type="tertiary" size="sm" onClick={() => setSel([])}>Clear</Button><span className="toolbar__spacer" /><Button type="secondary" size="sm" onClick={() => setModal("export")}>Export selected</Button></div></div>
        ) : (
          <div className="toolbar">
            <div className="toolbar__search"><TextField icon="search" placeholder="Search assets, IDs or wards" aria-label="Search assets, IDs or wards" value={q} onChange={setQ} /></div>
            <FilterSelect label="Ward" value={ward} onChange={setWard} options={[...new Set(all.map((a) => a.wardName))].sort()} />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={Object.values(STATUS).map((x) => x.label)} />
            <FilterSelect label="Asset type" value={type} onChange={setType} options={Object.values(ASSET_TYPES).map((x) => x.label)} />
            {filtered && <Button type="tertiary" size="sm" onClick={clear}>Clear filters</Button>}
            <span className="toolbar__spacer" />
            <Button type="secondary" onClick={() => setModal("export")}>Export</Button><Button onClick={() => setModal("add")}>Add asset</Button>
          </div>
        )}
        <Table label="Asset register" columns={columns} rows={paged.rows} loading={loading} selectable selected={sel} onSelect={setSel} rowLabel={(a) => a.name} sort={paged.sort} onSort={paged.setSort} minWidth={1060}
          empty={<Empty icon="search" title={filtered ? "No assets match these filters" : "No assets yet"} action={filtered ? <Button type="secondary" onClick={clear}>Clear filters</Button> : <Button onClick={() => setModal("add")}>Add asset</Button>}>{filtered ? "Try another ward or remove a filter." : "Register your first asset to see it here and on the map."}</Empty>} />
        <TableFooter total={paged.total} page={paged.page} size={paged.size} onPage={paged.setPage} onSize={paged.setSize} noun="assets" />
      </div>
      {modal === "add" && <RegisterAsset onClose={() => setModal(null)} />}
      {modal === "export" && <ExportAssets count={rows.length} selected={sel.length} onClose={() => setModal(null)} />}
    </>
  );
}
