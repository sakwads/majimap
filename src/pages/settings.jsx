import React, { useState } from "react";
import { db, session } from "../db.js";
import { query, setQuery } from "../router.js";
import { Alert, Badge, Button, Fact, Icon, Modal, PasswordField, RadioRow, Segmented, SelectField, Switch, Tabs, TextField, toast } from "../components/ui.jsx";
import { PageHead } from "./shell.jsx";

/* Appearance: Maji Light, Maji Dark or follow the device. Also text size, motion and touch targets. */
export function applyTheme() {
  const t = db.get("theme"); const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const el = document.documentElement; el.dataset.theme = dark ? "dark" : "light";
  el.dataset.text = db.get("textSize") || "default"; el.dataset.motion = db.get("reduceMotion") ? "reduce" : "full"; el.dataset.targets = db.get("largeTargets") ? "large" : "default";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#071c29" : "#0f4c6b");
}
const Art = ({ t }) => <span className="theme__art" aria-hidden="true">{(t === "system" ? ["l", "d"] : [t === "dark" ? "d" : "l"]).map((c) => <i key={c} className={c}><b /><b /><b /></i>)}</span>;

function Profile() {
  const key = session.profileKey(); const p = db.get(key); const u = session.user(); const org = session.org(); const [edit, setEdit] = useState(null); const [err, setErr] = useState({});
  if (!edit) return (
    <section className="card"><div className="card__head"><div className="row"><span className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>{u.initials}</span><span className="tbl__two"><h2 className="t-h4 c-default">{p.name}</h2><span>{p.title} · {org.name}</span></span></div><Button type="secondary" onClick={() => setEdit(p)}>Edit profile</Button></div>
      <dl className="facts"><Fact label="Full name">{p.name}</Fact><Fact label="Email">{p.email}</Fact><Fact label="Phone">{p.phone}</Fact><Fact label="Job title">{p.title}</Fact><Fact label="Organisations">{session.orgs().length}</Fact><Fact label="Member since">{session.supplier() ? "2 Jun 2026" : "12 Mar 2026"}</Fact></dl></section>
  );
  return (
    <section className="card card--pad-xl narrow" style={{ margin: 0 }}><h2 className="t-h4">Edit your profile</h2>
      <div className="form__pair"><TextField label="Full name" value={edit.name} onChange={(name) => setEdit({ ...edit, name })} error={err.name} /><TextField label="Job title" value={edit.title} onChange={(title) => setEdit({ ...edit, title })} /></div>
      <div className="form__pair"><TextField label="Email" value={edit.email} disabled helper="Ask an administrator to change your sign-in email." /><TextField label="Phone" value={edit.phone} onChange={(phone) => setEdit({ ...edit, phone })} error={err.phone} helper="Used for SMS alerts." /></div>
      <div className="form__actions"><Button type="secondary" onClick={() => { setEdit(null); setErr({}); }}>Cancel</Button><Button onClick={() => { const e = {}; if (!edit.name.trim()) e.name = "Enter your name"; if (!/^\+?[\d\s]{9,16}$/.test(edit.phone.trim())) e.phone = "Enter a phone number like +254 722 604 118"; setErr(e); if (Object.keys(e).length) return; db.set(key, edit); setEdit(null); toast("Profile saved"); }}>Save changes</Button></div>
    </section>
  );
}
function Appearance() {
  const theme = db.get("theme");
  return (
    <>
      <section className="card"><h2 className="t-h4">Theme</h2><p className="c-secondary">Choose how MajiMap looks. Maji Dark keeps the brand colours and meets the same contrast rules as Maji Light.</p>
        <div className="themes" role="radiogroup" aria-label="Theme">{[["light", "Maji Light", "Teal brand on light surfaces"], ["dark", "Maji Dark", "Brand kept visible on dark surfaces"], ["system", "Match system", "Follows your device setting"]].map(([v, l, n]) => (
          <RadioRow key={v} name="theme" className={`theme ${theme === v ? "theme--on" : ""}`} checked={theme === v} onChange={() => { db.set("theme", v); toast(`Theme set to ${l}`); }}><span className="tbl__two"><span className="t-label c-default">{l}</span><span>{n}</span></span><Art t={v} /></RadioRow>))}</div></section>
      <section className="card"><h2 className="t-h4">Reading and motion</h2>
        <div className="stack stack--sm"><span className="t-label">Text size</span><div><Segmented label="Text size" value={db.get("textSize")} onChange={(v) => db.set("textSize", v)} options={[["default", "Default"], ["large", "Large"], ["xlarge", "Extra large"]]} /></div></div>
        <div className="row row--between"><span className="tbl__two"><span className="t-label c-default">Reduce motion</span><span>Stops map and panel animations.</span></span><Switch checked={db.get("reduceMotion")} onChange={(v) => db.set("reduceMotion", v)} label="Reduce motion" /></div>
        <div className="row row--between"><span className="tbl__two"><span className="t-label c-default">Larger touch targets</span><span>Makes buttons and fields taller for field use.</span></span><Switch checked={db.get("largeTargets")} onChange={(v) => db.set("largeTargets", v)} label="Larger touch targets" /></div></section>
    </>
  );
}
function Preferences() {
  const key = session.profileKey(); const p = db.get(key); const set = (k) => (v) => { db.set(key, { ...p, [k]: v }); toast("Preference saved"); };
  return (
    <section className="card card--pad-xl narrow" style={{ margin: 0 }}><h2 className="t-h4">Language and region</h2>
      <div className="form__pair"><SelectField label="Language" value={p.language} onChange={set("language")} options={["English", "Kiswahili"]} helper="Kiswahili is not translated in this prototype." /><SelectField label="Units" value={p.units} onChange={set("units")} options={["Metric", "Imperial"]} /></div>
      <div className="form__pair"><SelectField label="Date format" value={p.dates} onChange={set("dates")} options={["24 Nov 2026", "24/11/2026", "2026-11-24"]} /><SelectField label="Start page" value={p.start} onChange={set("start")} options={session.supplier() ? ["Maji Market"] : ["Overview", "Water Atlas", "Projects"]} helper="Where you land after signing in." /></div>
    </section>
  );
}
function Security() {
  const [modal, setModal] = useState(null); const [v, setV] = useState({ cur: "", next: "", again: "" }); const [err, setErr] = useState({}); const others = db.get("otherSessions") ?? 2;
  const sessions = [["MacBook · Chrome", "Wote, Kenya · This device", true], ["Pixel 8 · MajiMap app", "Wote, Kenya · 2 hours ago"], ["Windows · Edge", "Nairobi, Kenya · 3 days ago"]].slice(0, 1 + others);
  return (
    <>
      <section className="card"><div className="card__head"><span className="tbl__two"><h2 className="t-h4 c-default">Password</h2><span>Last changed 2 Sep 2026</span></span><Button type="secondary" onClick={() => setModal("pw")}>Change password</Button></div></section>
      <section className="card"><div className="card__head"><h2 className="t-h4">Signed-in devices</h2><Button type="secondary" disabled={!others} onClick={() => setModal("out")}>Sign out other devices</Button></div>
        <div className="stack stack--sm">{sessions.map(([d, w, cur]) => <div key={d} className="list-row"><Icon name={d.includes("Pixel") ? "device-mobile" : "device-desktop"} /><span className="list-row__text"><span className="t-label">{d}</span><span className="t-sm c-secondary">{w}</span></span>{cur && <Badge tone="operational">Current</Badge>}</div>)}</div></section>
      {modal === "pw" && <Modal title="Change password" onClose={() => setModal(null)} footer={<><Button type="secondary" onClick={() => setModal(null)}>Cancel</Button><Button onClick={() => { const e = {}; if (!v.cur) e.cur = "Enter your current password"; if (v.next.length < 10) e.next = "Use at least 10 characters"; if (v.again !== v.next) e.again = "The two passwords do not match"; setErr(e); if (Object.keys(e).length) return; setModal(null); setV({ cur: "", next: "", again: "" }); toast("Password changed"); }}>Change password</Button></>}>
        <PasswordField label="Current password" value={v.cur} onChange={(cur) => setV({ ...v, cur })} error={err.cur} autoComplete="current-password" /><PasswordField label="New password" value={v.next} onChange={(next) => setV({ ...v, next })} error={err.next} helper="At least 10 characters." autoComplete="new-password" /><PasswordField label="Confirm new password" value={v.again} onChange={(again) => setV({ ...v, again })} error={err.again} autoComplete="new-password" /></Modal>}
      {modal === "out" && <Modal title="Sign out other devices?" onClose={() => setModal(null)} footer={<><Button type="secondary" onClick={() => setModal(null)}>Cancel</Button><Button onClick={() => { db.set("otherSessions", 0); setModal(null); toast("Signed out of 2 other devices"); }}>Sign out other devices</Button></>}>
        <p>You will stay signed in on this device. The other {others} devices will need your password to sign in again.</p><Alert>Field updates saved offline on those devices are sent before they sign out.</Alert></Modal>}
    </>
  );
}
export function AccountPage() {
  const tab = query().get("tab") || "profile";
  return (
    <>
      <PageHead title="Profile and settings" />
      <Tabs label="Profile and settings" value={tab} onChange={(t) => setQuery({ tab: t === "profile" ? null : t })} tabs={[["profile", "Profile"], ["appearance", "Appearance"], ["preferences", "Preferences"], ["security", "Security"]]} />
      {tab === "profile" && <Profile />}{tab === "appearance" && <Appearance />}{tab === "preferences" && <Preferences />}{tab === "security" && <Security />}
    </>
  );
}
