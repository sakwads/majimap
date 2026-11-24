import React, { useState } from "react";
import { db, session } from "../db.js";
import { ROLES } from "../seed.js";
import { navigate, query, setQuery } from "../router.js";
import { Alert, Badge, Button, Checkbox, Empty, Fact, FilterSelect, Menu, Modal, Segmented, SelectField, Table, TableFooter, Tabs, Tag, TextArea, TextField, toast, useFirstLoad, usePaged, wait } from "../components/ui.jsx";
import { PageHead } from "./shell.jsx";

const C = (n) => db.collection(n);
const ST = { active: ["Active", "operational"], invited: ["Invited", "info"], suspended: ["Suspended", "neutral"] };
const SRC = { current: ["Current", "operational"], stale: ["Out of date", "warning"], pending: ["Pending approval", "info"], failed: ["Refresh failed", "faulty"] };
const WARDS = ["All wards", "Kilungu ward", "Wote/Nziu ward", "Kasikeu ward", "Kibwezi West ward", "Mbooni ward"];
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function MemberForm({ type, m, onClose }) {
  const [v, setV] = useState({ email: "", role: m?.role || "Viewer", wards: m?.wards || "All wards" }); const [err, setErr] = useState("");
  const invite = () => { if (!validEmail(v.email)) return setErr("Enter an email address like name@makueni.go.ke"); if (C("members").all().some((x) => x.email === v.email.trim())) return setErr("This person is already a member");
    const name = v.email.split("@")[0].split(/[._]/).map((s) => s[0].toUpperCase() + s.slice(1)).join(" "); C("members").insert({ name, email: v.email.trim(), role: v.role, active: "Not yet", activeOn: "Invited 24 Nov 2026", wards: v.wards, status: "invited" }); toast(`Invite sent to ${v.email.trim()}`); onClose(); };
  if (type === "remove") return (
    <Modal title={`Remove ${m.name}?`} onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button type="danger" onClick={() => { C("members").remove(m._id); toast(`${m.name} was removed from the organisation`); onClose(); }}>Remove member</Button></>}>
      <p>{m.name} will lose access to {session.org().name} straight away. Their past updates, evidence and reviews stay on the record under their name.</p>
      <Alert tone="warning" title="This cannot be undone">To give access back you will need to send a new invite.</Alert>
    </Modal>
  );
  if (type === "role") return (
    <Modal title={`Change role for ${m.name}`} onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => { C("members").update(m._id, { role: v.role, wards: v.wards }); toast(`${m.name} is now ${v.role}`); onClose(); }}>Save role</Button></>}>
      <SelectField label="Role" value={v.role} onChange={(role) => setV({ ...v, role })} options={Object.keys(ROLES)} helper={ROLES[v.role]} />
      <SelectField label="Ward access" value={v.wards} onChange={(wards) => setV({ ...v, wards })} options={WARDS} />
    </Modal>
  );
  return (
    <Modal title="Invite a member" onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={invite}>Send invite</Button></>}>
      <TextField label="Email" type="email" placeholder="name@makueni.go.ke" value={v.email} onChange={(email) => setV({ ...v, email })} error={err} />
      <div className="form__pair"><SelectField label="Role" value={v.role} onChange={(role) => setV({ ...v, role })} options={Object.keys(ROLES)} helper={ROLES[v.role]} /><SelectField label="Ward access" value={v.wards} onChange={(wards) => setV({ ...v, wards })} options={WARDS} /></div>
      <Alert>The invite link works for 7 days. They set their own password when they accept.</Alert>
    </Modal>
  );
}

function Team() {
  const loading = useFirstLoad("team"); const view = query().get("view") || "members"; const all = C("members").all(); const reqs = C("requests").all();
  const [q, setQ] = useState(""); const [role, setRole] = useState(""); const [status, setStatus] = useState(""); const [ward, setWard] = useState(""); const [modal, setModal] = useState(null); const [sel, setSel] = useState([]);
  const s = q.trim().toLowerCase(); const rows = all.filter((m) => (!s || m.name.toLowerCase().includes(s) || m.email.includes(s)) && (!role || m.role === role) && (!status || ST[m.status][0] === status) && (!ward || m.wards === ward));
  const paged = usePaged(rows); const me = "amina.mwende@makueni.go.ke";
  return (
    <>
      <div><Segmented label="Team view" value={view} onChange={(v) => setQuery({ view: v === "members" ? null : v })} options={[["members", "Members"], ["requests", `Access requests (${reqs.length})`]]} /></div>
      {view === "members" ? (
        <div className="tbl-wrap">
          <div className="toolbar">
            <div className="toolbar__search"><TextField icon="search" placeholder="Search members" aria-label="Search members" value={q} onChange={setQ} /></div>
            <FilterSelect label="Role" value={role} onChange={setRole} options={Object.keys(ROLES)} /><FilterSelect label="Status" value={status} onChange={setStatus} options={["Active", "Invited", "Suspended"]} /><FilterSelect label="Ward" value={ward} onChange={setWard} options={WARDS} />
            <span className="toolbar__spacer" /><Button type="secondary" onClick={() => setModal({ type: "invite" })}>Invite member</Button>
          </div>
          <Table label="Members" minWidth={960} loading={loading} rows={paged.rows} selectable selected={sel} onSelect={setSel} rowLabel={(m) => m.name} empty={<Empty icon="users" title="No members match">Try another role or status.</Empty>} columns={[
            { key: "name", label: "Member", flex: 1.6, min: 230, render: (m) => <span className="tbl__two"><span className="t-label">{m.name}{m.email === me ? " (you)" : ""}</span><span>{m.email}</span></span> },
            { key: "role", label: "Role", flex: 1.2, min: 170, render: (m) => <span className="tbl__two"><span>{m.role}</span><span>{ROLES[m.role]}</span></span> },
            { key: "active", label: "Last active", flex: 1, min: 150, render: (m) => <span className="tbl__two"><span>{m.active}</span><span>{m.activeOn}</span></span> },
            { key: "wards", label: "Ward access", flex: 1, min: 140, render: (m) => <span className="t-sm c-secondary">{m.wards}</span> },
            { key: "status", label: "Status", width: 130, render: (m) => <Badge tone={ST[m.status][1]}>{ST[m.status][0]}</Badge> },
            { key: "go", label: "", width: 120, align: "right", stop: true, render: (m) => <Menu trigger={({ toggle, open }) => <Button type="secondary" size="sm" aria-expanded={open} aria-haspopup="menu" onClick={toggle}>Manage</Button>} items={[
              { label: "Change role", icon: "user-check", onClick: () => setModal({ type: "role", m }) },
              m.status === "invited" && { label: "Send invite again", icon: "send", onClick: () => toast(`Invite sent again to ${m.email}`) },
              m.status !== "invited" && { label: m.status === "suspended" ? "Restore access" : "Suspend", icon: m.status === "suspended" ? "refresh" : "lock", onClick: () => { C("members").update(m._id, { status: m.status === "suspended" ? "active" : "suspended" }); toast(m.status === "suspended" ? `${m.name} can sign in again` : `${m.name} is suspended`); } },
              m.email !== me && { label: "Remove member", icon: "trash", danger: true, onClick: () => setModal({ type: "remove", m }) }]} /> },
          ]} />
          <TableFooter total={paged.total} page={paged.page} size={paged.size} onPage={paged.setPage} onSize={paged.setSize} noun="members" />
        </div>
      ) : reqs.length ? <div className="stack">{reqs.map((r) => (
        <article key={r._id} className="card"><div className="row row--between row--wrap row--top"><span className="tbl__two"><span className="t-label c-default">{r.name}</span><span>{r.email} · {r.when}</span></span><Badge>Wants: {r.role}</Badge></div><p>{r.note}</p>
          <div className="row row--end row--wrap"><Button type="secondary" onClick={() => { C("requests").remove(r._id); toast(`Request from ${r.name} declined`); }}>Decline</Button><Button onClick={() => { C("requests").remove(r._id); C("members").insert({ name: r.name, email: r.email, role: r.role, active: "Not yet", activeOn: "Approved 24 Nov 2026", wards: "All wards", status: "active" }); toast(`${r.name} added as ${r.role}`); }}>Approve as {r.role}</Button></div></article>))}</div>
        : <div className="card"><Empty icon="user-check" title="No access requests">Requests from people who want to join show here.</Empty></div>}
      {modal && <MemberForm type={modal.type} m={modal.m} onClose={() => setModal(null)} />}
    </>
  );
}

function Sources() {
  const loading = useFirstLoad("sources"); const all = C("sources").all(); const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [modal, setModal] = useState(null); const [busy, setBusy] = useState(null);
  const [v, setV] = useState({ name: "", provider: "", licence: "Data sharing agreement" }); const [err, setErr] = useState({});
  const rows = all.filter((s) => (!q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase())) && (!status || SRC[s.status][0] === status));
  async function refresh(s) { setBusy(s._id); await wait(900); setBusy(null); if (db.get("demo").refreshFails) { C("sources").update(s._id, { status: "failed" }); return toast(`${s.name} could not be refreshed`, { icon: "alert-circle" }); } C("sources").update(s._id, { status: "current", updated: "Just now", updatedOn: "24 Nov 2026, 14:20" }); toast(`${s.name} refreshed`); }
  const failed = all.filter((s) => s.status === "failed");
  return (
    <>
      {failed.length > 0 && <Alert tone="error" title={`${failed[0].name} could not be refreshed`} actions={<Button type="secondary" size="sm" onClick={() => refresh(failed[0])}>Try again</Button>}>The last good copy is still in use. If it keeps failing, check the agreement with {failed[0].provider}.</Alert>}
      <div className="tbl-wrap">
        <div className="toolbar"><div className="toolbar__search"><TextField icon="search" placeholder="Search sources" aria-label="Search sources" value={q} onChange={setQ} /></div><FilterSelect label="Status" value={status} onChange={setStatus} options={Object.values(SRC).map((x) => x[0])} /><span className="toolbar__spacer" /><Button type="secondary" onClick={() => setModal("add")}>Add source</Button></div>
        <Table label="Data sources" minWidth={1000} loading={loading} rows={rows} empty={<Empty icon="database" title="No sources match">Try another status.</Empty>} columns={[
          { key: "name", label: "Source", flex: 1.6, min: 240, render: (s) => <span className="tbl__two"><span className="t-label">{s.name}</span><span>{s.provider}</span></span> },
          { key: "licence", label: "Licence and attribution", flex: 1.4, min: 200, render: (s) => <span className="tbl__two"><span>{s.licence}</span><span>{s.attribution}</span></span> },
          { key: "updated", label: "Last updated", flex: 1, min: 160, render: (s) => <span className="tbl__two"><span>{s.updated}</span><span>{s.updatedOn}</span></span> },
          { key: "records", label: "Records", width: 130, render: (s) => <span className="t-sm c-secondary">{s.records}</span> },
          { key: "status", label: "Status", width: 170, render: (s) => <Badge tone={SRC[s.status][1]}>{SRC[s.status][0]}</Badge> },
          { key: "go", label: "", width: 120, align: "right", render: (s) => <Button type="secondary" size="sm" loading={busy === s._id} disabled={s.status === "pending"} onClick={() => refresh(s)}>Refresh</Button> }]} />
        <div className="tbl-foot"><span>Showing {rows.length} of {all.length} sources. Every imported record keeps its source and update date.</span></div>
      </div>
      {modal && <Modal title="Add a data source" onClose={() => setModal(null)} footer={<><Button type="secondary" onClick={() => setModal(null)}>Cancel</Button><Button onClick={() => { const e = {}; if (!v.name.trim()) e.name = "Name the source"; if (!v.provider.trim()) e.provider = "Say who provides it"; setErr(e); if (Object.keys(e).length) return;
        C("sources").insert({ name: v.name.trim(), provider: v.provider.trim(), licence: v.licence, attribution: `Attribution: ${v.provider.trim()}`, updated: "Not yet imported", updatedOn: "Awaiting approval", records: "No records", status: "pending" }); setModal(null); setV({ name: "", provider: "", licence: "Data sharing agreement" }); toast("Source added. It needs approval before the first import."); }}>Add source</Button></>}>
        <TextField label="Source name" placeholder="For example: Kibwezi utility asset list" value={v.name} onChange={(name) => setV({ ...v, name })} error={err.name} />
        <div className="form__pair"><TextField label="Provider" placeholder="Organisation that owns the data" value={v.provider} onChange={(provider) => setV({ ...v, provider })} error={err.provider} /><SelectField label="Licence" value={v.licence} onChange={(licence) => setV({ ...v, licence })} options={["Data sharing agreement", "Open licence", "Own data", "Licence to be confirmed"]} /></div>
        <Alert>Only add data you are allowed to use. The provider's name is shown on every record that comes from this source.</Alert>
      </Modal>}
    </>
  );
}

function Notifications() {
  const saved = C("notifPrefs").all(); const [draft, setDraft] = useState(null); const rows = draft || saved; const groups = [...new Set(rows.map((r) => r.group))];
  const set = (id, k, val) => setDraft(rows.map((r) => (r._id === id ? { ...r, [k]: val } : r)));
  return (
    <>
      {groups.map((g) => <section key={g} className="card"><h2 className="t-h4">{g}</h2><div>{rows.filter((r) => r.group === g).map((r) => (
        <div key={r._id} className="pref-row"><span className="pref-row__text"><span className="t-label">{r.title}</span><span className="t-sm c-secondary">{r.note}</span></span>
          <span className="pref-row__opts" role="group" aria-label={`${r.title} channels`}>{[["app", "In app"], ["email", "Email"], ["sms", "SMS"]].map(([k, l]) => <Checkbox key={k} checked={r[k]} onChange={(c) => set(r._id, k, c)} label={l} />)}</span></div>))}</div></section>)}
      {draft && <div className="savebar" role="status"><span className="grow">You have unsaved changes.</span><Button type="tertiary" onClick={() => setDraft(null)}>Discard</Button><Button type="accent" onClick={() => { draft.forEach((r) => C("notifPrefs").update(r._id, r)); setDraft(null); toast("Notification settings saved"); }}>Save changes</Button></div>}
    </>
  );
}

function OrgProfile() {
  const p = db.get("orgProfile"); const org = session.org(); const admin = org.role !== "Viewer"; const [edit, setEdit] = useState(null); const [err, setErr] = useState({});
  if (edit) return (
    <section className="card card--pad-xl narrow" style={{ margin: 0 }}><h2 className="t-h4">Edit organisation details</h2>
      <TextField label="Organisation name" value={edit.name} onChange={(name) => setEdit({ ...edit, name })} error={err.name} />
      <div className="form__pair"><SelectField label="Type" value={edit.type} onChange={(type) => setEdit({ ...edit, type })} options={["County department", "Water utility", "NGO", "Community association", "Contractor", "Supplier"]} /><TextField label="County" value={edit.county} onChange={(county) => setEdit({ ...edit, county })} /></div>
      <div className="form__pair"><TextField label="Contact email" type="email" value={edit.email} onChange={(email) => setEdit({ ...edit, email })} error={err.email} /><TextField label="Phone" value={edit.phone} onChange={(phone) => setEdit({ ...edit, phone })} /></div>
      <div className="form__actions"><Button type="secondary" onClick={() => { setEdit(null); setErr({}); }}>Cancel</Button><Button onClick={() => { const e = {}; if (!edit.name.trim()) e.name = "Enter the organisation name"; if (!validEmail(edit.email)) e.email = "Enter a valid email"; setErr(e); if (Object.keys(e).length) return; db.set("orgProfile", edit); setEdit(null); toast("Organisation profile saved"); }}>Save changes</Button></div>
    </section>
  );
  return (
    <div className="grid grid--stretch">
      <div className="col-8 col-lg-12 stack">
        <section className="card"><h2 className="t-h4">Organisation details</h2><dl className="facts"><Fact label="Organisation name">{p.name}</Fact><Fact label="Type">{p.type}</Fact><Fact label="County">{p.county}</Fact><Fact label="Contact email">{p.email}</Fact><Fact label="Phone">{p.phone}</Fact><Fact label="Members">{C("members").all().length} people</Fact></dl></section>
        <section className="card"><h2 className="t-h4">Service area</h2><div className="tags">{p.wards.map((w) => <Tag key={w}>{w}</Tag>)}</div></section>
      </div>
      <section className="card col-4 col-lg-12"><h2 className="t-h4">Your access</h2><p className="t-label">{admin ? org.role : "Viewer"}</p><p className="t-sm c-secondary">{admin ? "You can edit this profile, manage data sources and invite people." : "You can read this profile. Ask an administrator to change it."}</p>
        <Button type="secondary" className="card__foot" disabled={!admin} onClick={() => setEdit(p)}>Edit profile</Button></section>
    </div>
  );
}

export function OrgPage({ tab }) {
  return (
    <>
      <PageHead title="Organisation" />
      <Tabs label="Organisation settings" value={tab} onChange={(t) => navigate(`/settings/${t}`)} tabs={[["profile", "Organisation profile"], ["team", "Team and roles"], ["sources", "Data sources"], ["notifications", "Notifications"]]} />
      {tab === "profile" && <OrgProfile />}{tab === "team" && <Team />}{tab === "sources" && <Sources />}{tab === "notifications" && <Notifications />}
    </>
  );
}
