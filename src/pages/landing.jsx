import React, { useEffect, useState } from "react";
import { db, session } from "../db.js";
import { WARDS } from "../seed.js";
import { navigate } from "../router.js";
import { Alert, Button, Icon, IconButton, Logo, Modal, Tabs, TextField, toast } from "../components/ui.jsx";
import { SignInForm } from "./auth.jsx";
import { Lifecycle, ProjectCard } from "./projects.jsx";
import { QuoteCard } from "./market.jsx";
import { ReportCard } from "./reports.jsx";

const NAVS = [["How it works", "how"], ["Modules", "modules"], ["Who it is for", "who"], ["FAQ", "faq"]];
const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
const Heading = ({ eyebrow, title, lead, onBrand, left }) => (
  <div className={`lp-heading ${left ? "lp-heading--left" : ""} ${onBrand ? "lp-heading--brand" : ""}`}><span className="t-eyebrow">{eyebrow}</span><h2 className="lp-title">{title}</h2>{lead && <p className="lp-lead">{lead}</p>}</div>
);
const Bullet = ({ children }) => <li className="row row--top"><Icon name="check" size={18} className="lp-tick" /><span>{children}</span></li>;
const MODULES = {
  atlas: ["MODULE A", "Every water asset on one map", "Boreholes, kiosks, tanks, pipelines and treatment works in one register. Each profile shows status, owner, history and linked projects.", ["Filter by county, sub-county and ward", "See where water access is thin", "Source and update date kept on every imported record"], "Explore the Water Atlas", "shot-asset.jpg", ["Verified mapped assets", "1,284", "of 1,530 mapped · Makueni County"]],
  projects: ["MODULE B", "Follow every project from need to handover", "Scope, budget, milestones and geotagged evidence in one place, across eight lifecycle stages.", ["Two-step verification of site evidence", "Spend against work done, per milestone", "A handover checklist before a project closes"], "See how projects work", "shot-project.jpg", ["Projects with verified evidence", "31 of 37", "active projects · Makueni County"]],
  market: ["MODULE C", "Find suppliers and compare quotations", "Send one request for quotation to verified suppliers who serve the ward, then compare price, delivery and specification.", ["Verified suppliers listed first", "Several items in one request", "Discovery and quotations only; awards follow your rules"], "See Maji Market", "shot-compare.jpg", ["Average replies per RFQ", "4.6", "from verified suppliers"]],
  reports: ["MODULE D", "Hear from residents the day a pump fails", "Residents send a photo, a location and a few words. Your team reviews each report before anything changes on the map.", ["Reports stay unverified until reviewed", "AI suggestions are labelled as suggestions", "Turn a confirmed fault into a project"], "See community reports", "shot-reports.jpg", ["Reports reviewed within 2 days", "86%", "last 30 days · sample figure"]],
};
const FAQ = [
  ["Does MajiMap replace MAJIDATA or county systems?", "No. MajiMap links to authoritative datasets and keeps their source and update date. It adds the project, procurement and evidence work those systems do not cover."],
  ["Who can see our data?", "Only the people you invite to your organisation, each with a role. Residents see only their own reports and nearby working water points."],
  ["Does it work where the network is weak?", "Field updates and resident reports save on the phone and send when there is signal. The map shows the last saved copy while you are offline."],
  ["Does Maji Market award tenders?", "No. It helps you find suppliers and compare quotations. Awards are made through your organisation's own procurement process."],
  ["What does a pilot involve?", "One county department, a few contractors and a small supplier group run the full workflow on real, authorised data for an agreed period."],
];

export function LandingPage() {
  const signedIn = !!session.get()?.orgId; const [dialog, setDialog] = useState(null); const [tab, setTab] = useState("atlas"); const [open, setOpen] = useState(0); const [menu, setMenu] = useState(false);
  const [pilot, setPilot] = useState({ name: "", email: "", org: "" }); const [err, setErr] = useState({});
  const dark = document.documentElement.dataset.theme === "dark";
  const signIn = () => (signedIn ? navigate("/overview") : setDialog("signin"));
  useEffect(() => { if (window.location.hash.includes("signin=1")) setDialog("signin"); }, []);
  const m = MODULES[tab];
  const sendPilot = () => { const e = {}; if (!pilot.name.trim()) e.name = "Enter your name"; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pilot.email)) e.email = "Enter a valid email"; if (!pilot.org.trim()) e.org = "Enter your organisation"; setErr(e); if (Object.keys(e).length) return; setDialog(null); setPilot({ name: "", email: "", org: "" }); toast("Thank you. We will be in touch about a pilot."); };
  return (
    <div className="lp">
      <a className="lp-skip" href="#how" onClick={(e) => { e.preventDefault(); go("how"); }}>Skip to content</a>
      <div className="lp-navy">
        <header className="lp-nav-wrap"><nav className="lp-nav" aria-label="Main">
          <a href="#/" aria-label="MajiMap home"><Logo size={30} onBrand /></a>
          <div className={`lp-nav__links ${menu ? "lp-nav__links--open" : ""}`}>{NAVS.map(([l, id]) => <button key={id} type="button" onClick={() => { setMenu(false); go(id); }}>{l}</button>)}</div>
          <div className="lp-nav__actions">
            <IconButton icon={dark ? "sun" : "moon"} label={dark ? "Switch to Maji Light" : "Switch to Maji Dark"} onClick={() => db.set("theme", dark ? "light" : "dark")} />
            <Button type="secondary" size="sm" className="lp-btn-ghost" onClick={signIn}>{signedIn ? "Open the app" : "Sign in"}</Button>
            <Button type="accent" size="sm" className="lp-nav__pilot" onClick={() => setDialog("pilot")}>Request a pilot</Button>
            <IconButton icon={menu ? "x" : "menu-2"} label="Menu" className="lp-nav__menu" aria-expanded={menu} onClick={() => setMenu(!menu)} />
          </div>
        </nav></header>
        <section className="lp-hero lp-wrap">
          <div className="lp-hero__copy">
            <span className="lp-pill"><Icon name="target" size={16} />Inviting one Kenyan county to pilot MajiMap</span>
            <h1 className="lp-display">Plan, build and look after water projects in one place.</h1>
            <p className="lp-lead">Information about water points is scattered across many offices. MajiMap puts it on one map and connects it to the real work: projects, suppliers, community reports and proof that the work was done.</p>
            <div className="row row--wrap"><Button type="accent" onClick={() => setDialog("pilot")}>Request a pilot</Button><Button type="secondary" className="lp-btn-ghost" onClick={signIn}>{signedIn ? "Open the app" : "Sign in"}</Button></div>
            <div className="lp-for"><span className="t-eyebrow">Built for</span><ul className="lp-chips">{[["building-community", "County water departments"], ["droplets", "Water companies"], ["users", "NGOs"], ["tool", "Contractors"], ["building-store", "Equipment suppliers"], ["message-report", "Residents reporting problems"]].map(([i, t]) => <li key={t}><Icon name={i} size={16} />{t}</li>)}</ul></div>
          </div>
          <div className="lp-journey" role="img" aria-label="MajiMap's four parts around one county map: Water Atlas, Project tracking, Maji Market and Community reporting.">
            <svg className="lp-journey__rings" viewBox="0 0 520 520" aria-hidden="true">{[70, 130, 190, 250].map((r) => <circle key={r} cx="260" cy="260" r={r} />)}</svg>
            <span className="lp-journey__pin"><span className="marker marker--operational marker--mini" style={{ width: 44, height: 44 }}><Icon name="droplet" size={20} /></span><span className="ward-label" style={{ position: "static" }}>One county map</span></span>
            {[["01 · WATER ATLAS", "map-2", "See every water point", "What is working, what is broken and which areas have too little water.", "Kasikeu ward · 31% access", 1], ["02 · PROJECT TRACKING", "route", "Follow work from idea to handover", "Budgets, deadlines, photos and progress, checked by an inspector.", "MKN-PRJ-0133 · Emali borehole", 2], ["03 · MAJI MARKET", "building-store", "Get quotes from suppliers", "Post what you need, then compare the quotes. Official tendering stays yours.", "RFQ-MKN-0042 · 4 quotes", 3], ["04 · COMMUNITY REPORTING", "message-report", "Hear from residents", "A photo and location from a phone, even on weak internet. Reviewed before it counts.", "Works offline", 4]].map(([step, icon, title, body, meta, n]) => (
              <div key={step} className={`lp-step lp-step--${n}`} aria-hidden="true"><span className="t-eyebrow">{step}</span><div className="lp-step__card"><Icon name={icon} size={18} /><span className="tbl__two"><span className="t-label">{title}</span><span>{body}</span><span className="t-mono">{meta}</span></span></div></div>))}
          </div>
        </section>
      </div>

      <section className="lp-band lp-wrap" aria-label="Works alongside your records">
        <p className="t-eyebrow c-secondary">Designed to work alongside the records you already trust</p>
        <ul className="lp-sources">{[["map-2", "OpenStreetMap", "Base map and roads"], ["database", "WASREB MAJIDATA", "Utility performance data"], ["building-community", "County records", "Development and project plans"], ["droplets", "Water service providers", "Asset registers"], ["checklist", "Field surveys", "Data collected on site"]].map(([i, t, s]) => <li key={t}><Icon name={i} size={20} /><span className="tbl__two"><span className="t-label">{t}</span><span>{s}</span></span></li>)}</ul>
        <p className="t-sm c-secondary">Each imported record keeps its source and update date. Access depends on agreements with each data owner. MajiMap is a concept project and has no agreement with these organisations.</p>
      </section>

      <section className="lp-section lp-wrap">
        <Heading eyebrow="Why MajiMap" title="Water information is scattered. The work waits on all of it." lead="It is hard to see what exists, what is broken, who is building what and where to buy equipment. MajiMap puts all of this in one place." />
        <div className="lp-grid lp-grid--4">{[["database", "Records live in many places", "Borehole, kiosk and pipeline data sits with counties, utilities, NGOs and old spreadsheets.", "info"], ["route", "Projects are hard to follow", "Budgets, milestones and site evidence are spread across email, calls and paper.", "sand"], ["truck", "Sourcing takes too long", "Finding a verified supplier for a solar pump outside Nairobi can take weeks of calls.", "operational"], ["message-report", "Faults reach the office late", "Residents know a pump has failed long before the report reaches the people who can fix it.", "unverified"]].map(([i, t, d, tone]) => (
          <article key={t} className={`lp-problem lp-problem--${tone}`}><span className="icon-chip icon-chip--round" style={{ background: "var(--mm-surface-raised)" }}><Icon name={i} size={18} /></span><h3 className="t-h4">{t}</h3><p>{d}</p></article>))}</div>
      </section>

      <section className="lp-section lp-section--tint" id="how"><div className="lp-wrap">
        <Heading eyebrow="How it works" title="One example: a borehole back in service" lead="New boreholes, pipelines, kiosks and repairs all follow the same path. Here is one borehole in four steps, with evidence at every step." />
        <div className="lp-grid lp-grid--2">
          {[["STEP 1", "A resident reports a broken water point", "A photo, the location and a voice note in their own language. The report stays unverified until your team reviews it.", <ReportCard plain r={db.collection("reports").all()[0]} />],
            ["STEP 2", "Your team confirms it and opens a project", "The confirmed fault becomes a rehabilitation project, linked to the borehole, with scope, budget and milestones.", <ProjectCard plain p={db.collection("projects").all()[0]} />],
            ["STEP 3", "Suppliers quote and you compare", "Send one request for quotation to verified suppliers who serve the ward, then compare price, delivery and spec.", <QuoteCard plain q={{ ...db.collection("quotes").all()[0], state: "shortlisted" }} />],
            ["STEP 4", "An inspector verifies and the map updates", "Geotagged evidence is checked before each stage moves on. When the work is verified, the asset is back in service on the map.", <div className="card"><Lifecycle stage={6} /></div>]].map(([s, t, d, demo]) => (
            <article key={s} className="lp-how"><div className="lp-how__demo" inert>{demo}</div><div className="stack stack--sm"><span className="t-eyebrow c-brand">{s}</span><h3 className="t-h3">{t}</h3><p className="c-secondary">{d}</p></div></article>))}
        </div></div>
      </section>

      <section className="lp-section lp-wrap" id="modules">
        <Heading eyebrow="The platform" title="Four modules, one delivery record" lead="Each module works on its own. Together they follow the work from the first sign of need to verified delivery and upkeep." />
        <div className="lp-tabs"><Tabs label="Modules" value={tab} onChange={setTab} tabs={[["atlas", "Water Atlas"], ["projects", "Projects"], ["market", "Maji Market"], ["reports", "Community reports"]]} /></div>
        <div className="lp-module" role="tabpanel">
          <div className="stack"><span className="t-eyebrow c-brand">{m[0]}</span><h3 className="lp-title lp-title--sm">{m[1]}</h3><p className="c-secondary t-lg">{m[2]}</p><ul className="stack stack--sm">{m[3].map((b) => <Bullet key={b}>{b}</Bullet>)}</ul><div><Button type="secondary" iconRight="arrow-right" onClick={signIn}>{m[4]}</Button></div></div>
          <div className="lp-module__art"><img src={`img/${m[5]}`} alt={`Screenshot of the ${m[1].toLowerCase()} screen in MajiMap`} /><div className="card lp-module__stat"><span className="t-sm c-secondary">{m[6][0]}</span><span className="t-stat">{m[6][1]}</span><span className="t-sm c-secondary">{m[6][2]}</span></div></div>
        </div>
      </section>

      <section className="lp-section lp-section--tint"><div className="lp-wrap lp-split">
        <div className="lp-phones" aria-hidden="true"><img src="img/phone-check.png" alt="" /><img src="img/phone-progress.png" alt="" /></div>
        <div className="stack"><div className="tags"><span className="tag">Progressive web app</span><span className="tag">Works offline</span><span className="tag">Low data</span></div>
          <Heading left eyebrow="For residents" title="Residents report from their phone, even offline" lead="A light app that opens from the QR code on a water point and installs from the browser. A photo, the location and a voice note in their own language are enough." />
          <ul className="stack stack--sm">{["Opens from a QR code; no app store download", "Saves the report offline and sends it when there is signal", "Updates and replies from the county arrive in the app and by SMS", "Shows the nearest working water point while a repair is under way"].map((b) => <Bullet key={b}>{b}</Bullet>)}</ul></div>
      </div></section>

      <section className="lp-section lp-wrap">
        <Heading eyebrow="Stay ahead" title="Spend your time on the fix, not the follow-up" lead="MajiMap tells you what changed and shows where the next investment is needed." />
        <div className="lp-grid lp-grid--2">
          <article className="card card--pad-xl"><span className="icon-chip icon-chip--round"><Icon name="bell" size={18} /></span><h3 className="t-h3">Know what moved while you were away</h3><p className="c-secondary">New reports, quotes and evidence arrive as notifications, each with one next step.</p>
            <div className="stack stack--sm" aria-hidden="true">{db.collection("notifications").all().slice(0, 3).map((n) => <div key={n._id} className="notif__item"><Icon name={n.icon} size={18} /><span className="tbl__two"><span className="t-label c-default">{n.title}</span><span>{n.body}</span><span className="t-mono">{n.meta}</span></span></div>)}</div></article>
          <article className="card card--pad-xl"><span className="icon-chip icon-chip--round"><Icon name="eye" size={18} /></span><h3 className="t-h3">See where water access is thin</h3><p className="c-secondary">Compare wards by people within reach of a working water point before you choose where to invest.</p>
            <table className="ward-table"><caption className="sr-only">Sample water access by ward</caption><tbody>{[...WARDS].sort((a, b) => a.access - b.access).map((w) => <tr key={w.id}><th scope="row">{w.name}</th><td className="right">{w.access}%</td><td style={{ width: "50%" }}><span className="progress" aria-hidden="true"><span style={{ width: `${w.access}%` }} /></span></td></tr>)}</tbody></table>
            <p className="t-sm c-secondary">Sample figures for six wards around Wote.</p></article>
        </div>
      </section>

      <section className="lp-section lp-wrap" id="who">
        <Heading eyebrow="Who it is for" title="Built for everyone who delivers water" lead="One shared record for the people who plan, fund, build, supply and use water infrastructure." />
        <div className="lp-grid lp-grid--5">{[["building-community", "County water departments", "Find gaps, plan and prioritise projects, and track budgets."], ["droplets", "Water utilities", "Keep the asset register current and coordinate maintenance."], ["world", "NGOs and partners", "Target communities, monitor funded work and report outcomes."], ["tool", "Contractors", "Find opportunities and submit evidence from the site."], ["truck", "Equipment suppliers", "List products, answer RFQs and manage quotes."]].map(([i, t, d]) => <article key={t} className="card"><span className="icon-chip icon-chip--round"><Icon name={i} size={18} /></span><h3 className="t-h4">{t}</h3><p className="c-secondary">{d}</p></article>)}</div>
      </section>

      <section className="lp-navy lp-section"><div className="lp-wrap">
        <Heading onBrand eyebrow="Built on trust" title="Built to complement, not replace" lead="MajiMap adds delivery and accountability on top of the records you already trust." />
        <div className="lp-grid lp-grid--3">{[["shield-check", "Verified before it counts", "Community reports and contractor evidence stay unverified until an authorised person reviews them."], ["database", "Source on every record", "Imported data keeps its source and update date, so authoritative datasets stay authoritative."], ["receipt", "Discovery, not tender award", "Maji Market helps you find and compare suppliers. Awards follow your procurement rules."]].map(([i, t, d]) => <article key={t} className="lp-trust"><Icon name={i} size={24} /><h3 className="t-h4">{t}</h3><p>{d}</p></article>)}</div>
      </div></section>

      <section className="lp-section lp-wrap lp-split lp-split--faq" id="faq">
        <Heading left eyebrow="FAQ" title="Questions counties ask" lead="Still unsure? Ask for a pilot walkthrough with your own ward data." />
        <div className="lp-faq">{FAQ.map(([q, a], i) => <div key={q} className="lp-faq__item"><h3><button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? -1 : i)}><span>{q}</span><Icon name={open === i ? "chevron-up" : "chevron-down"} size={20} /></button></h3>{open === i && <p id={`faq-${i}`} className="c-secondary">{a}</p>}</div>)}</div>
      </section>

      <section className="lp-wrap"><div className="lp-cta"><div className="stack stack--sm"><h2 className="lp-title lp-title--sm">See your county's water infrastructure in one place</h2><p>We are looking for one county water department, its contractors and a few suppliers to run the full workflow on real, authorised data.</p></div>
        <div className="stack stack--sm" style={{ alignItems: "flex-start" }}><Button onClick={() => setDialog("pilot")}>Request a pilot</Button><button type="button" className="link" style={{ color: "#16252f" }} onClick={signIn}>Already using MajiMap? Sign in</button></div></div></section>

      <footer className="lp-footer lp-wrap">
        <div className="stack stack--sm"><Logo size={28} /><p className="c-secondary">Mapping water. Connecting resources. Enabling delivery.</p></div>
        {[["Platform", [["Water Atlas", () => { setTab("atlas"); go("modules"); }], ["Projects", () => { setTab("projects"); go("modules"); }], ["Maji Market", () => { setTab("market"); go("modules"); }], ["Community reports", () => { setTab("reports"); go("modules"); }]]], ["Pilot", [["How it works", () => go("how")], ["Request a pilot", () => setDialog("pilot")], ["Sign in", signIn]]], ["About", [["Who it is for", () => go("who")], ["FAQ", () => go("faq")], ["Data and attribution", () => go("faq")]]]].map(([h, links]) => <nav key={h} className="stack stack--sm" aria-label={h}><span className="t-label">{h}</span>{links.map(([l, fn]) => <button key={l} type="button" className="c-secondary lp-footer__link" onClick={fn}>{l}</button>)}</nav>)}
        <p className="lp-footer__legal t-sm c-secondary"><span>© 2026 MajiMap. A concept project with sample data.</span><span>Map data © OpenStreetMap contributors</span></p>
      </footer>

      {dialog === "signin" && <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && setDialog(null)}><div className="auth__card" role="dialog" aria-modal="true" aria-label="Sign in to MajiMap"><div className="row row--between"><Logo size={36} /><IconButton icon="x" label="Close" onClick={() => setDialog(null)} /></div><SignInForm /></div></div>}
      {dialog === "pilot" && <Modal title="Request a pilot" onClose={() => setDialog(null)} footer={<><Button type="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={sendPilot}>Send request</Button></>}>
        <p className="c-secondary">Tell us who you are and we will arrange a walkthrough with your own ward data.</p>
        <div className="form__pair"><TextField label="Your name" value={pilot.name} onChange={(name) => setPilot({ ...pilot, name })} error={err.name} /><TextField label="Work email" type="email" value={pilot.email} onChange={(email) => setPilot({ ...pilot, email })} error={err.email} /></div>
        <TextField label="Organisation" placeholder="For example: Makueni County Water Department" value={pilot.org} onChange={(org) => setPilot({ ...pilot, org })} error={err.org} />
        <Alert>This is a concept project. Nothing is sent anywhere.</Alert></Modal>}
    </div>
  );
}
