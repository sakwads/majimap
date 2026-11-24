import React, { useState } from "react";
import { db } from "../db.js";
import { kes } from "../seed.js";
import { navigate, query, setQuery } from "../router.js";
import { DateField, Alert, Badge, Button, Checkbox, Empty, Fact, FilterSelect, Icon, Modal, Photos, SelectField, Skel, Table, Tabs, Tag, TextArea, TextField, toast, useFirstLoad } from "../components/ui.jsx";
import { PageHead } from "./shell.jsx";
import { session } from "../db.js";
// Buyers only see quotations that suppliers have actually sent
export const sentQuotes = (rfq) => db.collection("quotes").find({ rfq }).filter((q) => !["draft", "withdrawn"].includes(q.state));

const TODAY = "24 Nov 2026";
const C = (n) => db.collection(n);
const CATS = ["Solar pumps", "Submersible pumps", "Piping", "Storage tanks", "Treatment", "Testing", "Civil works"];
const RFQ_TONE = { open: ["info", "info-circle"], closing: ["warning", "alert-circle"], closed: ["neutral", "circle-check"] };
const Verified = ({ s }) => s.verified ? <Badge tone="operational" icon="check" dot={false}>Verified supplier</Badge> : <Badge tone="unverified" icon="clock" dot={false}>Verification pending</Badge>;
const startRfq = (patch = {}) => { const d = db.get("rfqDraft") || { title: "", project: "", deliver: "", needed: "", closes: "", items: [], suppliers: [] }; db.set("rfqDraft", { ...d, ...patch }); navigate("/market/rfq/new"); };

export function SupplierCard({ s }) {
  return (
    <article className="card">
      <div className="scard__head"><span className="icon-chip icon-chip--brand"><Icon name="building" size={18} /></span><div className="stack stack--xs grow"><h3 className="t-h4">{s.name}</h3><div><Verified s={s} /></div></div></div>
      <p className="row t-sm"><Icon name="map-pin" size={16} />Based in {s.base} · Serves {s.serves}</p>
      <div className="tags">{s.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
      <hr className="divider" />
      <dl className="facts facts--keep"><Fact label="Replies">{s.replies}</Fact><Fact label="Quotes sent">{s.quotes}</Fact><Fact label="Since">{s.since}</Fact></dl>
      <Photos count={s.photos} />
      <div className="form__pair card__foot"><Button type="secondary" onClick={() => navigate(`/market/supplier/${s._id}`)}>View profile</Button><Button type="accent" onClick={() => startRfq({ suppliers: [s._id] })}>Request quote</Button></div>
    </article>
  );
}
const Stock = ({ p }) => p.stock ? <Badge tone="operational" icon="check" dot={false}>In stock</Badge> : <Badge tone="warning">On order · about 3 weeks</Badge>;
function addToRfq(p) { const d = db.get("rfqDraft") || { title: "", project: "", deliver: "", needed: "", closes: "", items: [], suppliers: [] };
  db.set("rfqDraft", { ...d, items: [...d.items, { name: p.name, spec: `${p.cat} · ${p.specs.slice(0, 2).map((x) => x[1]).join(", ")}`, qty: "1" }] });
  toast(`${p.name} added to your RFQ draft`, { action: { label: "Open draft", onClick: () => navigate("/market/rfq/new") } }); }
function ProductCard({ p, onSpecs }) {
  const s = C("suppliers").get(p.supplier);
  return (
    <article className="card">
      <div className="pimg" role="img" aria-label={`Photo of ${p.name}`}><Icon name="photo" size={24} /></div>
      <div className="row row--wrap"><Tag>{p.cat}</Tag><Stock p={p} /></div>
      <div className="stack stack--xs"><h3 className="t-h4">{p.name}</h3><p className="t-sm c-secondary">{s.name}</p></div>
      <hr className="divider" /><p className="t-sm c-secondary">Specifications</p>
      <dl className="facts facts--2 facts--keep">{p.specs.map(([k, v]) => <Fact key={k} label={k}>{v}</Fact>)}</dl>
      <div className="stack stack--xs"><span className="t-label">Guide price {kes(p.price)}</span><span className="t-sm c-secondary">{p.priceNote}</span></div>
      {session.supplier() ? <Button type="secondary" className="card__foot" onClick={() => onSpecs(p)}>Full specs</Button> : <div className="form__pair card__foot"><Button type="secondary" onClick={() => onSpecs(p)}>Full specs</Button><Button type="accent" onClick={() => addToRfq(p)}>Add to RFQ</Button></div>}
    </article>
  );
}
function RfqCard({ r }) {
  return (
    <article className="card">
      <div className="row row--between"><span className="t-mono c-secondary">{r.code}</span><Badge tone={RFQ_TONE[r.status][0]} icon={RFQ_TONE[r.status][1]} dot={false}>{r.statusLabel}</Badge></div>
      <h3 className="t-h4">{r.title}</h3>
      <div className="stack stack--xs t-sm"><span className="row row--top"><Icon name="copy" size={16} />For {r.projectLabel}</span><span className="row"><Icon name="map-pin" size={16} />Deliver to {r.deliver}</span></div>
      <div><p className="t-mono c-secondary">Items</p><table className="items"><tbody>{r.items.map((it) => <tr key={it.name}><th scope="row">{it.name}</th><td>{it.qty}</td></tr>)}</tbody></table></div>
      <dl className="facts facts--keep"><Fact label={r.status === "closed" ? "Closed" : "Closes"}>{r.closes}</Fact><Fact label="Quotes">{r.received} received</Fact><Fact label="Estimate">{kes(r.estimate)}</Fact></dl>
      <div className="form__pair card__foot" style={r.status === "closed" ? { gridTemplateColumns: "1fr" } : undefined}>
        {r.status !== "closed" && <Button type="secondary" onClick={() => navigate(`/market/rfq/${r._id}`)}>View RFQ</Button>}
        <Button type="accent" onClick={() => navigate(r._id === "rfq_0042" ? `/market/rfq/${r._id}/compare` : `/market/rfq/${r._id}`)}>{r.status === "closed" ? `View ${r.received} quotes` : "Compare quotes"}</Button>
      </div>
    </article>
  );
}

export function MarketPage() {
  const tab = query().get("tab") || "suppliers"; const loading = useFirstLoad("market-" + tab);
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [county, setCounty] = useState(""); const [ver, setVer] = useState(""); const [status, setStatus] = useState(""); const [specs, setSpecs] = useState(null); const [more, setMore] = useState(false);
  const s = q.trim().toLowerCase(); const has = (...t) => !s || t.some((x) => x.toLowerCase().includes(s));
  const suppliers = C("suppliers").all().filter((x) => has(x.name, ...x.tags) && (!cat || x.tags.some((t) => t.toLowerCase().includes(cat.toLowerCase().split(" ")[0])) || x.category.includes(cat)) && (!county || x.serves.includes(county)) && (!ver || (ver === "Verified") === x.verified)).sort((a, b) => b.verified - a.verified);
  const products = C("products").all().filter((x) => has(x.name, x.cat, ...x.specs.map((y) => y[1])) && (!cat || x.cat === cat) && (!ver || (ver === "Verified") === C("suppliers").get(x.supplier).verified));
  const rfqs = C("rfqs").all().filter((x) => has(x.title, x.code) && (!status || x.statusLabel.startsWith(status)) && (!cat || x.cat === cat));
  const filtered = q || cat || county || ver || status; const clear = () => { setQ(""); setCat(""); setCounty(""); setVer(""); setStatus(""); };
  const none = (what) => <div className="card"><Empty icon="search" title={`No ${what} match`} action={<Button type="secondary" onClick={clear}>Clear filters</Button>}>Try a broader category or remove a filter.</Empty></div>;
  const draft = db.get("rfqDraft");
  return (
    <>
      <PageHead title="Maji Market" actions={<Button onClick={() => startRfq()}>{draft ? "Continue RFQ draft" : "Create RFQ"}</Button>} />
      <Tabs label="Maji Market sections" value={tab} onChange={(t) => { clear(); setQuery({ tab: t === "suppliers" ? null : t }); }} tabs={[["suppliers", "Suppliers"], ["products", "Products", C("products").all().length], ["requests", "Requests", C("rfqs").all().filter((r) => r.status !== "closed").length], ["history", "History", C("history").all().length]]} />
      {tab !== "history" && <div className="toolbar" style={{ borderRadius: "var(--mm-radius-card)", border: "1px solid var(--mm-border-default)" }}>
        <div className="toolbar__search"><TextField icon="search" placeholder={tab === "suppliers" ? "Search suppliers or services" : tab === "products" ? "Search products or specifications" : "Search RFQs by title or ID"} aria-label="Search" value={q} onChange={setQ} /></div>
        {tab === "requests" && <FilterSelect label="Status" value={status} onChange={setStatus} options={["Open", "Closes", "Closed"]} />}
        <FilterSelect label="Category" value={cat} onChange={setCat} options={CATS} />
        {tab === "suppliers" && <FilterSelect label="County" value={county} onChange={setCounty} options={["Makueni", "Machakos", "Kitui", "Kajiado"]} />}
        {tab !== "requests" && <FilterSelect label="Verification" value={ver} onChange={setVer} options={["Verified", "Pending"]} />}
        {filtered && <Button type="tertiary" size="sm" onClick={clear}>Clear filters</Button>}
      </div>}
      {loading ? <div className="masonry">{[300, 260, 340].map((h) => <div key={h} className="card"><Skel w="60%" h={20} /><Skel w="40%" /><Skel h={h - 140} /></div>)}</div> : <>
        {tab === "suppliers" && <><p className="t-sm c-secondary">{suppliers.length} of 24 suppliers serving Makueni County. Verified suppliers are listed first.</p>
          {suppliers.length ? <div className="masonry">{suppliers.map((x) => <SupplierCard key={x._id} s={x} />)}</div> : none("suppliers")}
          {!filtered && !more && <div className="row" style={{ justifyContent: "center" }}><Button type="secondary" onClick={() => { setMore(true); toast("The prototype has 6 sample suppliers", { icon: "info-circle" }); }}>Show 6 more of 24</Button></div>}</>}
        {tab === "products" && <><p className="t-sm c-secondary">{products.length} sample products from suppliers serving Makueni County. Guide prices exclude delivery and are not offers.</p>
          {products.length ? <div className="masonry">{products.map((x) => <ProductCard key={x._id} p={x} onSpecs={setSpecs} />)}</div> : none("products")}</>}
        {tab === "requests" && <><p className="t-sm c-secondary">{rfqs.length} RFQs from your projects. Closed RFQs stay visible for 30 days.</p>
          {rfqs.length ? <div className="masonry">{rfqs.map((x) => <RfqCard key={x._id} r={x} />)}</div> : none("requests")}</>}
        {tab === "history" && <div className="tbl-wrap"><Table label="Procurement history" minWidth={860} rows={C("history").all()} columns={[
          { key: "title", label: "Request", flex: 2, min: 240, render: (h) => <span className="tbl__two"><span className="t-label">{h.title}</span><span className="t-mono">{h.code}</span></span> },
          { key: "supplier", label: "Supplier", flex: 1.4, min: 180 },
          { key: "state", label: "Your note", width: 140, render: (h) => <Badge tone={h.state === "Preferred" ? "operational" : "neutral"}>{h.state}</Badge> },
          { key: "when", label: "Date", width: 130 },
          { key: "total", label: "Quote total", width: 150, align: "right", render: (h) => <span className="nowrap">{kes(h.total)}</span> }]} />
          <div className="tbl-foot">Preferred is your team's note. Awards are made through your own procurement process.</div></div>}
      </>}
      {specs && <Modal title={specs.name} onClose={() => setSpecs(null)} footer={<><Button type="secondary" onClick={() => setSpecs(null)}>Close</Button><Button type="accent" onClick={() => { addToRfq(specs); setSpecs(null); }}>Add to RFQ</Button></>}>
        <div className="row row--wrap"><Tag>{specs.cat}</Tag><Stock p={specs} /></div>
        <p className="c-secondary">Sold by {C("suppliers").get(specs.supplier).name}. {specs.stock ? "Usually delivered to Makueni within 14 days." : "Ordered in on request; allow about 3 weeks."}</p>
        <dl className="facts facts--2 facts--keep">{specs.specs.map(([k, v]) => <Fact key={k} label={k}>{v}</Fact>)}</dl>
        <Alert title={`Guide price ${kes(specs.price)}`}>{specs.priceNote}. A guide price is not an offer: request a quotation for a firm price.</Alert>
      </Modal>}
    </>
  );
}

export function SupplierProfile({ id }) {
  const s = C("suppliers").get(id); const tab = query().get("tab") || "overview";
  if (!s) return null;
  const prods = C("products").find({ supplier: id }); const hist = C("history").find({ supplier: s.name }); const listed = (db.get("shortlist") || []).includes(id); const own = session.org()?.supplier === id;
  return (
    <>
      <PageHead title={s.name} sub={`Based in ${s.base} · Serves ${s.serves}`} badges={<><Badge tone="brand" dot={false}>{s.category}</Badge>{s.verified ? <Badge tone="operational">Verified</Badge> : <Badge tone="unverified" icon="clock" dot={false}>Verification pending</Badge>}</>}
        actions={own ? <Button type="secondary" onClick={() => navigate("/market")}>Back to Maji Market</Button> : <><Button type="secondary" onClick={() => { db.set("shortlist", listed ? db.get("shortlist").filter((x) => x !== id) : [...(db.get("shortlist") || []), id]); toast(listed ? "Removed from your shortlist" : "Added to your shortlist"); }}>{listed ? "Remove from shortlist" : "Add to shortlist"}</Button><Button onClick={() => startRfq({ suppliers: [id] })}>Request quote</Button></>} />
      {own && <Alert title="This is how buyers see your profile">Your profile is checked by the MajiMap review team. To change it, write to support with your registration documents.</Alert>}
      <Tabs label="Supplier sections" value={tab} onChange={(t) => setQuery({ tab: t === "overview" ? null : t })} tabs={[["overview", "Overview"], ["products", "Products", prods.length], ["coverage", "Coverage"], ["history", "Procurement history", hist.length]]} />
      {!s.verified && <Alert tone="warning" title="Verification pending">MajiMap is still checking this supplier's registration and licence. You can request a quotation, but check their documents yourself before you rely on them.</Alert>}
      {tab === "overview" && <div className="grid grid--stretch">
        <div className="col-8 col-lg-12 stack">
          <section className="card"><h2 className="t-h4">About</h2><p>{s.about}</p><dl className="facts"><Fact label="Based in">{s.base}, Makueni County</Fact><Fact label="Serves">{s.serves}</Fact><Fact label="Trading since">{s.since}</Fact><Fact label="Typical lead time">{s.lead}</Fact><Fact label="Average reply time">{s.replies}</Fact><Fact label="Quotes sent">{s.quotes}</Fact></dl></section>
          <section className="card"><h2 className="t-h4">Services and categories</h2><div className="tags">{s.services.map((t) => <Tag key={t}>{t}</Tag>)}</div></section>
          <section className="card"><h2 className="t-h4">Verification</h2>{s.verified ? <dl className="facts"><Fact label="Business registration">Checked 12 Mar 2026</Fact><Fact label="KRA PIN">Checked 12 Mar 2026</Fact><Fact label="Contractor licence">Valid to Dec 2027</Fact><Fact label="Verified by">MajiMap review team</Fact><Fact label="Last reviewed">12 Mar 2026</Fact><Fact label="Insurance cover">Valid to Jun 2027</Fact></dl> : <p className="c-secondary">Documents were submitted on 18 Nov 2026 and are being checked.</p>}</section>
        </div>
        <section className="card col-4 col-lg-12"><h2 className="t-h4">Contact</h2><p>{s.contact}</p><p className="t-mono">{s.phone}</p>{!own && <Button type="secondary" className="card__foot" onClick={() => startRfq({ suppliers: [id] })}>Request quote</Button>}</section>
      </div>}
      {tab === "products" && (prods.length ? <ProductsOf prods={prods} /> : <div className="card"><Empty icon="tag" title="No products listed yet">This supplier has not added a catalogue. You can still request a quotation.</Empty></div>)}
      {tab === "coverage" && <section className="card"><h2 className="t-h4">Where they deliver</h2><div className="tags">{s.serves.split(", ").map((c) => <Tag key={c}>{c} County</Tag>)}</div><p className="c-secondary">Delivery to site is quoted per request. Lead time is usually {s.lead}.</p></section>}
      {tab === "history" && (hist.length ? <section className="card"><h2 className="t-h4">Quotations to your organisation</h2><div className="stack stack--sm">{hist.map((h) => <div key={h._id} className="list-row"><span className="list-row__text"><span className="t-label">{h.title}</span><span className="t-sm c-secondary">{h.code} · {h.when} · {kes(h.total)}</span></span><Badge tone={h.state === "Preferred" ? "operational" : "neutral"}>{h.state}</Badge></div>)}</div></section> : <div className="card"><Empty icon="history" title="No history with your organisation">Quotations this supplier sends you will be listed here.</Empty></div>)}
    </>
  );
}
function ProductsOf({ prods }) { const [specs, setSpecs] = useState(null); return <><div className="masonry">{prods.map((x) => <ProductCard key={x._id} p={x} onSpecs={setSpecs} />)}</div>
  {specs && <Modal title={specs.name} onClose={() => setSpecs(null)} footer={<Button onClick={() => setSpecs(null)}>Close</Button>}><dl className="facts facts--2 facts--keep">{specs.specs.map(([k, v]) => <Fact key={k} label={k}>{v}</Fact>)}</dl></Modal>}</>; }

/* ───────── Create RFQ (4 steps, several items) ───────── */
const STEPS = [["Requirement", "Title and project"], ["Items", "What you need"], ["Suppliers", "Who and when"], ["Review", "Check and publish"]];
export function CreateRfq() {
  const d = db.get("rfqDraft") || { title: "", project: "", deliver: "", needed: "", closes: "", items: [], suppliers: [] };
  const [step, setStep] = useState(0); const [err, setErr] = useState({}); const [item, setItem] = useState({ name: "", cat: "Solar pumps", qty: "1", spec: "" });
  const set = (patch) => db.set("rfqDraft", { ...d, ...patch }); const projects = C("projects").all().filter((p) => !p.closed); const suppliers = C("suppliers").all();
  const fmt = (x) => (x ? new Date(x).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
  function addItem() { const e = {}; if (!item.name.trim()) e.item = "Name the item"; if (!(Number(String(item.qty).replace(/,/g, "")) > 0)) e.qty = "Enter a quantity"; if (item.spec.trim().length < 5) e.spec = "Add a measurable specification"; setErr(e); if (Object.keys(e).length) return;
    set({ items: [...d.items, { name: item.name.trim(), spec: `${item.cat} · ${item.spec.trim()}`, qty: item.qty }] }); setItem({ name: "", cat: item.cat, qty: "1", spec: "" }); }
  function next() { const e = {};
    if (step === 0) { if (!d.title.trim()) e.title = "Give the request a title"; if (!d.project) e.project = "Link the project this is for"; if (!d.deliver.trim()) e.deliver = "Say where to deliver"; }
    if (step === 1 && !d.items.length) e.items = "Add at least one item";
    if (step === 2) { if (d.suppliers.length < 1) e.suppliers = "Choose at least one supplier"; if (!d.closes) e.closes = "Choose when quotes close"; }
    setErr(e); if (!Object.keys(e).length) setStep(step + 1); }
  function publish() { const p = C("projects").get(d.project); const n = 43 + C("rfqs").all().length - 3;
    const r = C("rfqs").insert({ code: `RFQ-MKN-00${n}`, title: d.title.trim(), status: "open", statusLabel: "Open", cat: d.items[0].spec.split(" · ")[0], project: p._id, projectLabel: `${p.code} · ${p.name}`, deliver: d.deliver.trim(), closes: fmt(d.closes), closesLong: `${fmt(d.closes)}, 17:00`, published: TODAY, needed: fmt(d.needed) || "Not set", estimate: 0, received: 0, items: d.items, questions: [], sentTo: d.suppliers.length, invited: d.suppliers }, { first: true });
    db.set("rfqDraft", null); toast(`${r.code} published to ${d.suppliers.length} supplier${d.suppliers.length === 1 ? "" : "s"}`); navigate(`/market/rfq/${r._id}`); }
  return (
    <>
      <PageHead title="New RFQ" sub="Your draft saves as you go. Nothing is shared with suppliers until you publish." />
      <div className="wizard">
        <ol className="vsteps" aria-label="Steps">{STEPS.map(([t, s], i) => <li key={t} className={`vstep ${i < step ? "vstep--done" : i === step ? "vstep--current" : ""}`} aria-current={i === step ? "step" : undefined}><span className="vstep__dot">{i < step ? <Icon name="check" size={16} /> : i + 1}</span><span className="vstep__text"><span className="t-label">{t}</span><span className="t-sm c-secondary">{s}</span></span></li>)}</ol>
        <section className="card card--pad-xl">
          <div className="stack stack--xs"><span className="t-sm c-secondary">Step {step + 1} of 4 · {STEPS[step][0]}</span><h2 className="t-h4">{["What do you need quoted?", "Items and specifications", "Suppliers and closing date", "Review and publish"][step]}</h2></div>
          {step === 0 && <><TextField label="Title" placeholder="For example: Solar pump set for Nguu borehole" value={d.title} onChange={(title) => set({ title })} error={err.title} />
            <SelectField label="Linked project" placeholder="Choose a project" value={d.project} onChange={(project) => set({ project, deliver: d.deliver || projects.find((p) => p._id === project)?.ward || "" })} error={err.project} options={projects.map((p) => [p._id, `${p.code} · ${p.name}`])} />
            <div className="form__pair"><TextField label="Deliver to" placeholder="Ward or site" value={d.deliver} onChange={(deliver) => set({ deliver })} error={err.deliver} /><DateField label="Needed by" optional min="2026-11-24" value={d.needed} onChange={(needed) => set({ needed })} /></div></>}
          {step === 1 && <>
            <div><p className="t-label">Items in this RFQ ({d.items.length})</p>{d.items.length === 0 ? <p className={`t-sm ${err.items ? "c-error" : "c-secondary"}`} role={err.items ? "alert" : undefined}>{err.items || "No items yet. Add the first one below."}</p>
              : d.items.map((it, i) => <div key={i} className="item-row"><span className="tbl__two grow"><span className="t-label">{it.name}</span><span>{it.spec}</span></span><span className="nowrap">Qty {it.qty}</span><Button type="tertiary" size="sm" onClick={() => set({ items: d.items.filter((_, k) => k !== i) })} aria-label={`Remove ${it.name}`}>Remove</Button></div>)}</div>
            <p className="t-label">Add an item</p>
            <TextField label="Item" placeholder="For example: Pump controller" value={item.name} onChange={(name) => setItem({ ...item, name })} error={err.item} helper="Name one item. Add the next one after this." />
            <div className="form__pair"><SelectField label="Category" value={item.cat} onChange={(cat) => setItem({ ...item, cat })} options={CATS} /><TextField label="Quantity" number value={item.qty} onChange={(qty) => setItem({ ...item, qty })} error={err.qty} helper="Number of units." /></div>
            <TextArea label="Specification" value={item.spec} onChange={(spec) => setItem({ ...item, spec })} error={err.spec} max={500} rows={3} placeholder="MPPT controller, 48 V DC input, dry-run protection." helper="Use measurable specifications so quotes can be compared." />
            <Button type="secondary" block onClick={addItem}>Add item to RFQ</Button></>}
          {step === 2 && <>
            <fieldset className="stack stack--sm" style={{ border: 0, padding: 0, margin: 0 }}><legend className="field__label" style={{ marginBottom: 8 }}>Send to</legend>
              {suppliers.map((s) => <Checkbox key={s._id} checked={d.suppliers.includes(s._id)} onChange={(c) => set({ suppliers: c ? [...d.suppliers, s._id] : d.suppliers.filter((x) => x !== s._id) })} label={s.name} helper={`${s.verified ? "Verified" : "Verification pending"} · ${s.tags.join(", ")} · replies ${s.replies.toLowerCase()}`} />)}
              {err.suppliers && <span className="field__error t-sm" role="alert"><Icon name="alert-circle" size={14} />{err.suppliers}</span>}</fieldset>
            <DateField label="Quotes close on" min="2026-11-24" value={d.closes} onChange={(closes) => set({ closes })} error={err.closes} helper="Suppliers can quote until 17:00 on this day." /></>}
          {step === 3 && <><dl className="facts facts--2"><Fact label="Title">{d.title}</Fact><Fact label="Linked project">{projects.find((p) => p._id === d.project)?.name}</Fact><Fact label="Deliver to">{d.deliver}</Fact><Fact label="Quotes close">{fmt(d.closes)}, 17:00</Fact></dl>
            <div><p className="t-mono c-secondary">Items</p>{d.items.map((it, i) => <div key={i} className="item-row"><span className="tbl__two grow"><span className="t-label">Item {i + 1} · {it.name}</span><span>{it.spec}</span></span><span className="nowrap">Qty {it.qty}</span></div>)}</div>
            <dl><Fact label="Sent to">{d.suppliers.map((x) => C("suppliers").get(x).name).join(" · ")}</Fact></dl>
            <Alert title="Publishing asks for quotations only">It does not award a contract. Awards follow your organisation's procurement rules.</Alert></>}
          <div className="form__actions"><Button type="tertiary" onClick={() => (step ? setStep(step - 1) : navigate("/market?tab=requests"))}>{step ? "Back" : "Cancel"}</Button><Button type="secondary" onClick={() => { toast("Draft saved"); navigate("/market?tab=requests"); }}>Save draft</Button>{step < 3 ? <Button onClick={next}>Next</Button> : <Button onClick={publish}>Publish RFQ</Button>}</div>
        </section>
      </div>
    </>
  );
}

/* ───────── RFQ detail and comparison ───────── */
export function RfqDetail({ id }) {
  const r = C("rfqs").get(id); const tab = query().get("tab") || "overview"; const [answer, setAnswer] = useState(null); const [text, setText] = useState("");
  if (!r) return null;
  const quotes = sentQuotes(id); const canCompare = quotes.length > 0;
  const Questions = () => <section className="card"><div className="tbl__two"><h2 className="t-h4 c-default">Questions and answers</h2><span>{r.code} · {r.questions.length} question{r.questions.length === 1 ? "" : "s"}</span></div>
    <Alert>Every answer is shared with all suppliers quoting on this RFQ.</Alert>
    {r.questions.length === 0 && <p className="c-secondary">No supplier has asked a question yet.</p>}
    {r.questions.map((q) => <div key={q._id} className="qa"><span className="t-sm c-secondary">Question from a supplier · {q.when}</span><p>{q.q}</p>
      {q.a ? <div className="qa__answer"><span className="t-sm c-secondary">Answer from Makueni County Water · {q.aWhen}</span><p>{q.a}</p></div> : <div className="row row--between"><Badge tone="warning">Awaiting answer</Badge><Button type="tonal" size="sm" onClick={() => { setAnswer(q); setText(""); }}>Answer</Button></div>}</div>)}</section>;
  return (
    <>
      <PageHead title={r.title} sub={`${r.code} · Published ${r.published} · For ${r.projectLabel.split(" · ")[1] || r.projectLabel}`} badges={<><Badge tone="brand" dot={false}>{r.cat}</Badge><Badge tone={RFQ_TONE[r.status][0]}>{r.statusLabel}</Badge></>}
        actions={<><Button type="secondary" onClick={() => toast("Editing a published RFQ is not part of this prototype", { icon: "info-circle" })}>Edit RFQ</Button><Button disabled={!canCompare} onClick={() => navigate(`/market/rfq/${id}/compare`)}>Compare quotes</Button></>} />
      <Tabs label="RFQ sections" value={tab} onChange={(t) => setQuery({ tab: t === "overview" ? null : t })} tabs={[["overview", "Overview"], ["quotes", "Quotes", r.received], ["questions", "Questions", r.questions.filter((q) => !q.a).length]]} />
      {tab === "overview" && <div className="grid grid--stretch">
        <div className="col-8 col-lg-12 stack">
          <section className="card"><h2 className="t-h4">RFQ details</h2><dl className="facts"><Fact label="Linked project">{r.projectLabel.split(" · ")[1] || r.projectLabel}</Fact><Fact label="Deliver to">{r.deliver}</Fact><Fact label="Published">{r.published}</Fact><Fact label="Quotes close">{r.closesLong}</Fact><Fact label="Needed by">{r.needed}</Fact><Fact label="Estimate">{r.estimate ? kes(r.estimate) : "Not set"}</Fact></dl></section>
          <section className="card"><h2 className="t-h4">Items requested</h2><div className="tags">{r.items.map((it) => <Tag key={it.name}>{it.name} × {it.qty}</Tag>)}</div></section>
          {Questions()}
        </div>
        <section className="card col-4 col-lg-12"><h2 className="t-h4">Quote summary</h2><p>{r.received} quotation{r.received === 1 ? "" : "s"} received</p><p className="t-mono c-secondary">{r.status === "closed" ? "Closed" : "Closes"} {r.closesLong}</p>
          {r.received === 0 && <p className="c-secondary">Sent to {r.sentTo || 0} suppliers. Quotes appear here as they arrive.</p>}
          <Button type="secondary" className="card__foot" disabled={!canCompare} onClick={() => navigate(`/market/rfq/${id}/compare`)}>Compare quotes</Button></section>
      </div>}
      {tab === "quotes" && (quotes.length ? <div className="masonry">{quotes.map((q) => <QuoteCard key={q._id} q={q} />)}</div> : <div className="card"><Empty icon="receipt" title={r.received ? "Quotes are summarised only" : "No quotes yet"}>{r.received ? `This sample RFQ shows a count of ${r.received} quotes. Open RFQ-MKN-0042 to see full quotations.` : "Suppliers can quote until the closing date."}</Empty></div>)}
      {tab === "questions" && Questions()}
      {answer && <Modal title="Answer the question" onClose={() => setAnswer(null)} footer={<><Button type="secondary" onClick={() => setAnswer(null)}>Cancel</Button><Button disabled={text.trim().length < 3} onClick={() => { C("rfqs").update(id, { questions: r.questions.map((q) => (q._id === answer._id ? { ...q, a: text.trim(), aWhen: TODAY } : q)) }); setAnswer(null); toast("Answer shared with all suppliers on this RFQ"); }}>Share answer</Button></>}>
        <div className="quote">{answer.q}</div><TextArea label="Your answer" value={text} onChange={setText} max={500} rows={4} helper="Shared with every supplier quoting on this RFQ." /></Modal>}
    </>
  );
}
export function QuoteCard({ q, plain }) {
  return (
    <article className="card">
      <div className="row row--between row--wrap"><Badge tone={q.state === "preferred" ? "operational" : q.state === "shortlisted" ? "info" : "neutral"}>{q.state[0].toUpperCase() + q.state.slice(1)}</Badge>{q.lowest && <Badge tone="brand" dot={false}>Lowest total</Badge>}</div>
      <h3 className="t-h4">{q.supplier}</h3>
      <div className="stack stack--xs"><span className="t-mono c-secondary">Quote total</span><span className="t-stat">{kes(q.total)}</span><span className="t-sm c-secondary">Incl. VAT · RFQ-MKN-0042</span></div>
      <p className="row t-sm"><Icon name="check" size={16} />Meets the RFQ spec: {q.match}</p>
      <dl className="facts facts--keep"><Fact label="Delivery">{q.delivery}</Fact><Fact label="Valid until">{q.valid}</Fact><Fact label="Warranty">{q.warranty}</Fact></dl>
      {!plain && <Button type="secondary" className="card__foot" onClick={() => navigate(`/market/rfq/${q.rfq}/compare`)}>Compare</Button>}
    </article>
  );
}
export function CompareQuotes({ id }) {
  const r = C("rfqs").get(id); const quotes = sentQuotes(id); const [notice, setNotice] = useState(true); const [scrolled, setScrolled] = useState(false);
  if (!r) return null;
  const expired = r.status === "closed"; const set = (q, state) => { if (state === "preferred") quotes.forEach((x) => x.state === "preferred" && C("quotes").update(x._id, { state: "shortlisted" })); C("quotes").update(q._id, { state }); toast(state === "preferred" ? `${q.supplier} marked as preferred. This is a note for your team, not an award.` : state === "shortlisted" ? `${q.supplier} shortlisted` : `${q.supplier} removed from the shortlist`); };
  const rows = [["Total (incl. VAT)", (q) => <><span className="t-label nowrap">{kes(q.total)}</span>{q.lowest && <Badge tone="brand" dot={false}>Lowest total</Badge>}</>], ["Spec match", (q) => q.match], ["Delivery", (q) => q.delivery], ["Warranty", (q) => q.warranty], ["Valid until", (q) => q.valid]];
  return (
    <>
      <PageHead title="Compare quotations" sub={`${r.code} · ${r.title} · ${quotes.length} quotations`} actions={<Button type="secondary" onClick={() => navigate(`/market/rfq/${id}`)}>Back to RFQ</Button>} />
      {notice && <Alert onClose={() => setNotice(false)}>Marking a quotation as preferred is a note for your team. It does not award the contract. Award through your procurement process.</Alert>}
      {quotes.length === 0 ? <div className="card"><Empty icon="receipt" title="No quotations to compare yet">Quotes appear here as suppliers send them.</Empty></div> : (
        <div className="tbl-wrap"><div className={`tbl-scroll ${scrolled ? "tbl-scroll--scrolled" : ""}`} onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)} tabIndex={0} role="region" aria-label="Quotation comparison, scrolls sideways">
          <div className="compare" style={{ "--n": quotes.length }} role="table" aria-label="Quotation comparison">
            <div className="compare__label" role="rowheader">Supplier</div>
            {quotes.map((q) => <div key={q._id} role="columnheader" className={q.state === "preferred" ? "compare__pick" : ""}><span className="t-label">{q.supplier}</span><Badge tone={q.state === "preferred" ? "operational" : q.state === "shortlisted" ? "info" : "neutral"}>{q.state[0].toUpperCase() + q.state.slice(1)}</Badge></div>)}
            {rows.map(([label, cell]) => <React.Fragment key={label}><div className="compare__label" role="rowheader">{label}</div>{quotes.map((q) => <div key={q._id} role="cell" className={q.state === "preferred" ? "compare__pick" : ""}>{cell(q)}</div>)}</React.Fragment>)}
            <div className="compare__label" />
            {quotes.map((q) => <div key={q._id} className={q.state === "preferred" ? "compare__pick" : ""} style={{ alignItems: "stretch" }}>
              {q.state === "submitted" && <Button type="secondary" disabled={expired} onClick={() => set(q, "shortlisted")}>Shortlist</Button>}
              {q.state === "shortlisted" && <><Button type="accent" onClick={() => set(q, "preferred")}>Mark preferred</Button><Button type="tertiary" size="sm" onClick={() => set(q, "submitted")}>Remove from shortlist</Button></>}
              {q.state === "preferred" && <Button type="tertiary" size="sm" onClick={() => set(q, "shortlisted")}>Undo preferred</Button>}
            </div>)}
          </div>
        </div></div>
      )}
    </>
  );
}
