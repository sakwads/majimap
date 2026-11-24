import React, { useState } from "react";
import { db, session } from "../db.js";
import { kes } from "../seed.js";
import { navigate, query, setQuery } from "../router.js";
import { DateField, Alert, Badge, Button, Checkbox, Empty, Fact, FilterSelect, Icon, Modal, SelectField, Skel, Switch, Table, Tabs, Tag, TextArea, TextField, toast, useFirstLoad } from "../components/ui.jsx";
import { PageHead } from "./shell.jsx";

/* The supplier's own view of Maji Market: open RFQs to quote on, their quotations, their catalogue and buyer answers.
   Demo account: Joseph Musau, Nzaui Solar & Pumps (sign in with any email that contains "nzaui"). */
const TODAY = "24 Nov 2026";
const C = (n) => db.collection(n);
const me = () => session.org().supplier;
const myName = () => C("suppliers").get(me()).name;
const MY_CATS = ["Solar pumps", "Submersible pumps", "Piping"];
const RFQ_TONE = { open: ["info", "info-circle"], closing: ["warning", "alert-circle"], closed: ["neutral", "circle-check"] };
export const opportunities = () => C("rfqs").all().filter((r) => r.status !== "closed" && ((r.invited || []).includes(me()) || MY_CATS.includes(r.cat)));
const myQuote = (rfq) => C("quotes").all().find((q) => q.rfq === rfq && q.supplierId === me() && q.state !== "withdrawn");
const QSTATE = { draft: ["Draft, not sent", "warning"], submitted: ["Submitted", "info"], shortlisted: ["Submitted", "info"], preferred: ["Submitted", "info"], withdrawn: ["Withdrawn", "neutral"] };
const PAST = [{ _id: "past1", code: "RFQ-MKN-0031", title: "Solar pumping kit for Ilima borehole", total: 684000, state: "Closed · another supplier was chosen", when: "28 Oct 2026" }, { _id: "past2", code: "RFQ-MKN-0024", title: "Pump controller replacement, Kaiti pan", total: 52000, state: "Closed · awarded to you by the buyer", when: "16 Sep 2026" }];

/* ───────── Quotation dialog ───────── */
function QuoteForm({ r, onClose }) {
  const existing = myQuote(r._id);
  const [v, setV] = useState({ total: existing ? String(existing.total) : "", delivery: existing?.delivery || "14 days", warranty: existing?.warranty || "1 year", valid: "", ref: existing?.ref || "", note: existing?.note || "", meets: r.items.map((_, i) => !existing || i < Number((existing.match || "").split(" ")[0] || 0)) });
  const [err, setErr] = useState({}); const up = (k) => (x) => setV((o) => ({ ...o, [k]: x }));
  const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const closes = new Date(r.closes + " 17:00");
  function save(send) {
    const e = {}; const total = Number(String(v.total).replace(/[^\d.]/g, ""));
    if (!total) e.total = "Enter the total in shillings, including VAT";
    if (send) { if (!v.valid) e.valid = "Say how long the price holds"; else if (new Date(v.valid) <= closes) e.valid = `Must be after quotes close on ${r.closes}`; if (!v.meets.some(Boolean)) e.meets = "Tick at least one item you can supply"; }
    setErr(e); if (Object.keys(e).length) return;
    const doc = { rfq: r._id, supplier: myName(), supplierId: me(), total, match: `${v.meets.filter(Boolean).length} of ${r.items.length} items`, delivery: v.delivery, warranty: v.warranty, valid: v.valid ? fmt(v.valid) : "", ref: v.ref.trim(), note: v.note.trim(), state: send ? "submitted" : "draft", submittedOn: send ? TODAY : null };
    if (existing) C("quotes").update(existing._id, doc); else C("quotes").insert(doc);
    if (send) {
      C("rfqs").update(r._id, { received: r.received + 1 });
      C("notifications").insert({ icon: "building-store", title: `New quote on ${r.code}`, body: `${myName()} quoted ${kes(total)}. ${r.received + 1} quotes received so far.`, meta: "Maji Market · Just now", to: `/market/rfq/${r._id}/compare`, read: false }, { first: true });
      toast(`Quotation of ${kes(total)} submitted`, { action: { label: "View quotation", onClick: () => navigate(`/market/rfq/${r._id}`) } });
    } else toast("Draft saved. The buyer cannot see it until you submit.");
    onClose();
  }
  return (
    <Modal title="Submit a quotation" onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button type="secondary" onClick={() => save(false)}>Save draft</Button><Button onClick={() => save(true)}>Submit quotation</Button></>}>
      {Object.keys(err).length > 0 && <Alert tone="error" title="Some details need attention">Fix the fields marked below before you submit.</Alert>}
      <TextField label="Quote total (incl. VAT)" number prefix="KES" placeholder="1,248,000" value={v.total} onChange={up("total")} error={err.total} />
      <fieldset className="stack stack--sm" style={{ border: 0, padding: 0, margin: 0 }}><legend className="field__label" style={{ marginBottom: 8 }}>Items you can supply to the specification</legend>
        {r.items.map((it, i) => <Checkbox key={i} checked={v.meets[i]} onChange={(c) => up("meets")(v.meets.map((x, k) => (k === i ? c : x)))} label={`${it.name} × ${it.qty}`} helper={it.spec} />)}
        {err.meets && <span className="field__error t-sm" role="alert"><Icon name="alert-circle" size={14} />{err.meets}</span>}</fieldset>
      <div className="form__pair"><SelectField label="Delivery time" value={v.delivery} onChange={up("delivery")} options={["7 days", "10 days", "14 days", "21 days", "30 days"]} /><SelectField label="Warranty" value={v.warranty} onChange={up("warranty")} options={["6 months", "1 year", "2 years", "3 years"]} /></div>
      <div className="form__pair"><DateField label="Valid until" value={v.valid} onChange={up("valid")} error={err.valid} helper="Must be after quotes close." /><TextField label="Your reference" optional placeholder="QT-2026-118" value={v.ref} onChange={up("ref")} /></div>
      <TextArea label="Note to buyer" optional value={v.note} onChange={up("note")} max={300} rows={3} placeholder="For example: price includes delivery to Kilungu ward and commissioning." helper="Visible to the buyer only." />
      <Alert>A quotation is an offer for comparison. It is not a contract. The buyer awards through its own procurement process.</Alert>
    </Modal>
  );
}

function OppCard({ r, onQuote }) {
  const q = myQuote(r._id);
  return (
    <article className="card">
      <div className="row row--between"><span className="t-mono c-secondary">{r.code}</span><Badge tone={RFQ_TONE[r.status][0]} icon={RFQ_TONE[r.status][1]} dot={false}>{r.statusLabel}</Badge></div>
      <h3 className="t-h4">{r.title}</h3>
      <div className="stack stack--xs t-sm"><span className="row row--top"><Icon name="copy" size={16} />For {r.projectLabel}</span><span className="row"><Icon name="map-pin" size={16} />Deliver to {r.deliver}</span></div>
      <div><p className="t-mono c-secondary">Items</p><table className="items"><tbody>{r.items.map((it) => <tr key={it.name}><th scope="row">{it.name}</th><td>{it.qty}</td></tr>)}</tbody></table></div>
      <dl className="facts facts--keep"><Fact label="Closes">{r.closes}</Fact><Fact label="Your quote">{q ? QSTATE[q.state][0] : "Not started"}</Fact><Fact label="Buyer estimate">{r.estimate ? kes(r.estimate) : "Not shared"}</Fact></dl>
      <div className="form__pair card__foot"><Button type="secondary" onClick={() => navigate(`/market/rfq/${r._id}?tab=questions`)}>Ask a question</Button>
        {q && q.state !== "draft" ? <Button type="tonal" onClick={() => navigate(`/market/rfq/${r._id}`)}>View quotation</Button> : <Button type="accent" onClick={() => onQuote(r)}>{q ? "Finish quote" : "Submit quote"}</Button>}</div>
    </article>
  );
}

function ProductForm({ p, onClose }) {
  const [v, setV] = useState(p ? { name: p.name, cat: p.cat, price: String(p.price), note: p.priceNote, s1: p.specs[0]?.[1] || "", s2: p.specs[1]?.[1] || "" } : { name: "", cat: "Solar pumps", price: "", note: "", s1: "", s2: "" });
  const [err, setErr] = useState({}); const up = (k) => (x) => setV((o) => ({ ...o, [k]: x }));
  function save() { const e = {}; const price = Number(String(v.price).replace(/[^\d.]/g, "")); if (!v.name.trim()) e.name = "Name the product"; if (!price) e.price = "Enter a guide price in shillings"; if (!v.s1.trim()) e.s1 = "Add at least one specification"; setErr(e); if (Object.keys(e).length) return;
    const doc = { name: v.name.trim(), cat: v.cat, price, priceNote: v.note.trim() || "Excl. delivery", specs: [["Power or size", v.s1.trim()], ...(v.s2.trim() ? [["Other", v.s2.trim()]] : []), ...(p ? p.specs.slice(2) : [["Warranty", "12 months"]])] };
    if (p) C("products").update(p._id, doc); else C("products").insert({ ...doc, supplier: me(), stock: true });
    toast(p ? "Product updated" : "Product added. Buyers can now find it in the catalogue."); onClose(); }
  return (
    <Modal title={p ? `Edit ${p.name}` : "Add a product"} onClose={onClose} footer={<><Button type="secondary" onClick={onClose}>Cancel</Button><Button onClick={save}>{p ? "Save changes" : "Add product"}</Button></>}>
      <TextField label="Product name" placeholder="For example: Solar pumping kit 5 kW" value={v.name} onChange={up("name")} error={err.name} />
      <div className="form__pair"><SelectField label="Category" value={v.cat} onChange={up("cat")} options={["Solar pumps", "Submersible pumps", "Piping", "Storage tanks", "Treatment", "Testing"]} /><TextField label="Guide price" number prefix="KES" placeholder="438,000" value={v.price} onChange={up("price")} error={err.price} /></div>
      <div className="form__pair"><TextField label="Main specification" placeholder="3 kW, 120 m head" value={v.s1} onChange={up("s1")} error={err.s1} /><TextField label="Second specification" optional placeholder="4 m³/h at 80 m" value={v.s2} onChange={up("s2")} /></div>
      <TextField label="Price note" optional placeholder="Excl. installation" value={v.note} onChange={up("note")} />
      <Alert>A guide price helps buyers plan. It is not an offer: buyers still ask for a quotation.</Alert>
    </Modal>
  );
}

export function SupplierMarket() {
  const tab = query().get("tab") || "opportunities"; const loading = useFirstLoad("sup-" + tab);
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [closing, setClosing] = useState(""); const [quote, setQuote] = useState(null); const [product, setProduct] = useState(undefined);
  const opps = opportunities().filter((r) => (!q.trim() || [r.title, r.code].some((t) => t.toLowerCase().includes(q.trim().toLowerCase()))) && (!cat || r.cat === cat) && (!closing || (closing === "This week" ? r.status === "closing" : r.status === "open")));
  const mine = C("quotes").all().filter((x) => x.supplierId === me());
  const prods = C("products").find({ supplier: me() });
  const answered = opportunities().flatMap((r) => r.questions.map((x) => ({ ...x, r })));
  const s = C("suppliers").get(me());
  return (
    <>
      <PageHead title="Maji Market" sub={`${s.name} · ${s.verified ? "Verified supplier" : "Verification pending"} · serves ${s.serves}`} actions={<Button type="secondary" icon="eye" onClick={() => navigate(`/market/supplier/${me()}`)}>How buyers see you</Button>} />
      <Tabs label="Maji Market sections" value={tab} onChange={(t) => setQuery({ tab: t === "opportunities" ? null : t })} tabs={[["opportunities", "Opportunities", opportunities().length], ["quotes", "My quotes", mine.length], ["catalogue", "Catalogue", prods.length], ["messages", "Messages", answered.filter((x) => x.a).length]]} />
      {tab === "opportunities" && <>
        <div className="toolbar" style={{ borderRadius: "var(--mm-radius-card)", border: "1px solid var(--mm-border-default)" }}>
          <div className="toolbar__search"><TextField icon="search" placeholder="Search open RFQs" aria-label="Search open RFQs" value={q} onChange={setQ} /></div>
          <FilterSelect label="Category" value={cat} onChange={setCat} options={MY_CATS} /><FilterSelect label="Closing" value={closing} onChange={setClosing} options={["This week", "Later"]} />
          {(q || cat || closing) && <Button type="tertiary" size="sm" onClick={() => { setQ(""); setCat(""); setClosing(""); }}>Clear filters</Button>}
        </div>
        <p className="t-sm c-secondary">{opps.length} open RFQ{opps.length === 1 ? "" : "s"} in Makueni County match your categories or invited you. Quotes are for comparison and do not award a contract.</p>
        {loading ? <div className="masonry">{[320, 300].map((h) => <div key={h} className="card"><Skel w="40%" /><Skel w="80%" h={20} /><Skel h={h - 140} /></div>)}</div>
          : opps.length ? <div className="masonry">{opps.map((r) => <OppCard key={r._id} r={r} onQuote={setQuote} />)}</div>
          : <div className="card"><Empty icon="receipt" title="No open RFQs match">New requests in your categories will show here, and you get a notification when a buyer invites you.</Empty></div>}
      </>}
      {tab === "quotes" && <div className="tbl-wrap">
        <Table label="My quotations" minWidth={900} loading={loading} rows={[...mine.map((x) => ({ ...x, r: C("rfqs").get(x.rfq) })), ...PAST.map((x) => ({ ...x, past: true }))]} onRowClick={(x) => !x.past && navigate(`/market/rfq/${x.rfq}`)}
          empty={<Empty icon="receipt" title="No quotations yet">Quotations you start or send are listed here.</Empty>} columns={[
          { key: "title", label: "Request", flex: 2, min: 260, render: (x) => <span className="tbl__two"><span className={x.past ? "t-label" : "tbl__open"}>{x.past ? x.title : x.r.title}</span><span className="t-mono">{x.past ? x.code : x.r.code}</span></span> },
          { key: "state", label: "Status", flex: 1.4, min: 200, render: (x) => x.past ? <span className="t-sm c-secondary">{x.state}</span> : <Badge tone={QSTATE[x.state][1]}>{QSTATE[x.state][0]}</Badge> },
          { key: "when", label: "Closes", width: 140, render: (x) => (x.past ? x.when : x.r.closes) },
          { key: "total", label: "Quote total", width: 150, align: "right", render: (x) => <span className="nowrap">{kes(x.total)}</span> }]} />
        <div className="tbl-foot">Buyers see only quotations you submit. Drafts stay private to your organisation.</div></div>}
      {tab === "catalogue" && <>
        <div className="row row--between row--wrap"><p className="t-sm c-secondary">Products in your catalogue appear to buyers in Makueni, Kitui and nearby counties.</p><Button onClick={() => setProduct(null)}>Add product</Button></div>
        {prods.length ? <div className="masonry">{prods.map((p) => (
          <article key={p._id} className="card">
            <div className="pimg" role="img" aria-label={`Photo of ${p.name}`}><Icon name="photo" size={24} /></div>
            <div className="row row--wrap"><Tag>{p.cat}</Tag>{p.stock ? <Badge tone="operational" icon="check" dot={false}>In stock</Badge> : <Badge tone="warning">On order</Badge>}</div>
            <h3 className="t-h4">{p.name}</h3>
            <dl className="facts facts--2 facts--keep">{p.specs.slice(0, 4).map(([k, val]) => <Fact key={k} label={k}>{val}</Fact>)}</dl>
            <div className="stack stack--xs"><span className="t-label">Guide price {kes(p.price)}</span><span className="t-sm c-secondary">{p.priceNote}</span></div>
            <div className="row row--between"><span className="tbl__two"><span className="t-label c-default">In stock</span><span>Buyers see the stock status</span></span><Switch checked={p.stock} onChange={(c) => { C("products").update(p._id, { stock: c }); toast(c ? `${p.name} marked in stock` : `${p.name} marked on order`); }} label={`${p.name} in stock`} /></div>
            <Button type="secondary" className="card__foot" onClick={() => setProduct(p)}>Edit product</Button>
          </article>))}</div> : <div className="card"><Empty icon="tag" title="Your catalogue is empty" action={<Button onClick={() => setProduct(null)}>Add product</Button>}>Add the products you sell so buyers can find you.</Empty></div>}
      </>}
      {tab === "messages" && <section className="card"><h2 className="t-h4">Questions and answers on your RFQs</h2><Alert>Answers are shared with every supplier on the RFQ. Who asked is never shown.</Alert>
        {answered.length ? answered.map((x) => (
          <div key={x.r._id + x._id} className="qa"><span className="t-sm c-secondary">{x.r.code} · {x.r.title} · {x.when}</span><p>{x.q}</p>
            {x.a ? <div className="qa__answer"><span className="t-sm c-secondary">Answer from Makueni County Water · {x.aWhen}</span><p>{x.a}</p></div> : <div><Badge tone="warning">Awaiting answer</Badge></div>}
            <div><Button type="tertiary" size="sm" onClick={() => navigate(`/market/rfq/${x.r._id}?tab=questions`)}>Open {x.r.code}</Button></div></div>))
          : <Empty icon="message" title="No questions yet">Questions you or other suppliers ask on your RFQs show here with the buyer's answers.</Empty>}</section>}
      {quote && <QuoteForm r={quote} onClose={() => setQuote(null)} />}
      {product !== undefined && <ProductForm p={product} onClose={() => setProduct(undefined)} />}
    </>
  );
}

export function SupplierRfq({ id }) {
  const r = C("rfqs").get(id); const tab = query().get("tab") || "overview"; const [modal, setModal] = useState(null); const [ask, setAsk] = useState(""); const [err, setErr] = useState("");
  if (!r || r.status === "closed") return <div className="card"><Empty icon="receipt" title="This RFQ is not open" action={<Button onClick={() => navigate("/market")}>Opportunities</Button>}>It may have closed. Closed RFQs stay in My quotes if you quoted on them.</Empty></div>;
  const q = myQuote(id); const sent = q && q.state !== "draft";
  function send() { if (ask.trim().length < 8) return setErr("Write your question in a sentence"); C("rfqs").update(id, { questions: [...r.questions, { _id: "q" + Date.now(), when: "Today, just now", q: ask.trim(), a: null }] }); setAsk(""); setErr(""); toast("Question sent. The buyer's answer will be shared with every supplier."); }
  const Questions = () => (
    <section className="card"><div className="tbl__two"><h2 className="t-h4 c-default">Questions and answers</h2><span>{r.code} · {r.questions.length} question{r.questions.length === 1 ? "" : "s"}</span></div>
      <Alert>Every answer is shared with all suppliers quoting on this RFQ.</Alert>
      {r.questions.map((x) => <div key={x._id} className="qa"><span className="t-sm c-secondary">Question from a supplier · {x.when}</span><p>{x.q}</p>
        {x.a ? <div className="qa__answer"><span className="t-sm c-secondary">Answer from Makueni County Water · {x.aWhen}</span><p>{x.a}</p></div> : <div><Badge tone="warning">Awaiting answer</Badge></div>}</div>)}
      <div className="qa"><TextArea label="Ask a question" value={ask} onChange={setAsk} error={err} max={500} rows={3} placeholder="For example: what voltage is the site supply?" helper="Questions close 2 days before quotes close. Who asked is never shown." />
        <div className="row row--end"><Button onClick={send}>Send question</Button></div></div>
    </section>
  );
  return (
    <>
      <PageHead title={r.title} sub={`${r.code} · Published ${r.published} · For ${r.projectLabel.split(" · ")[1] || r.projectLabel}`} badges={<><Badge tone="brand" dot={false}>{r.cat}</Badge><Badge tone={RFQ_TONE[r.status][0]}>{r.statusLabel}</Badge></>}
        actions={sent ? <><Button type="secondary" onClick={() => setModal("withdraw")}>Withdraw quotation</Button><Button onClick={() => setModal("view")}>View quotation</Button></> : <><Button type="secondary" onClick={() => setQuery({ tab: "questions" })}>Ask a question</Button><Button onClick={() => setModal("quote")}>{q ? "Finish quotation" : "Submit quotation"}</Button></>} />
      {sent && <Alert tone="success" title="Quotation submitted">Makueni County Water can see your quote of {kes(q.total)}. You can withdraw it until quotes close on {r.closesLong}.</Alert>}
      {q && !sent && <Alert tone="warning" title="Your quotation is a draft" actions={<Button size="sm" onClick={() => setModal("quote")}>Finish quotation</Button>}>The buyer cannot see it until you submit. Quotes close on {r.closesLong}.</Alert>}
      <Tabs label="RFQ sections" value={tab} onChange={(t) => setQuery({ tab: t === "overview" ? null : t })} tabs={[["overview", "Overview"], ["questions", "Questions", r.questions.length]]} />
      {tab === "overview" ? <div className="grid grid--stretch">
        <div className="col-8 col-lg-12 stack">
          <section className="card"><h2 className="t-h4">RFQ details</h2><dl className="facts"><Fact label="Linked project">{r.projectLabel.split(" · ")[1] || r.projectLabel}</Fact><Fact label="Deliver to">{r.deliver}</Fact><Fact label="Published">{r.published}</Fact><Fact label="Quotes close">{r.closesLong}</Fact><Fact label="Needed by">{r.needed}</Fact><Fact label="Buyer estimate">{r.estimate ? kes(r.estimate) : "Not shared"}</Fact></dl></section>
          <section className="card"><h2 className="t-h4">Items requested</h2>{r.items.map((it, i) => <div key={i} className="item-row"><span className="tbl__two grow"><span className="t-label c-default">{it.name}</span><span>{it.spec}</span></span><span className="nowrap">Qty {it.qty}</span></div>)}</section>
        </div>
        <section className="card col-4 col-lg-12"><h2 className="t-h4">Your quotation</h2>
          {q ? <><p className="t-stat">{kes(q.total)}</p><div><Badge tone={QSTATE[q.state][1]}>{QSTATE[q.state][0]}</Badge></div><dl className="facts facts--2 facts--keep"><Fact label="Spec match">{q.match}</Fact><Fact label="Delivery">{q.delivery}</Fact><Fact label="Warranty">{q.warranty}</Fact><Fact label="Valid until">{q.valid || "Not set"}</Fact></dl>{q.submittedOn && <p className="t-mono c-secondary">Submitted {q.submittedOn}</p>}</>
            : <><p>Not started</p><p className="t-mono c-secondary">Closes {r.closesLong}</p></>}
          {!sent && <Button type="secondary" className="card__foot" onClick={() => setModal("quote")}>{q ? "Finish quotation" : "Submit quotation"}</Button>}
        </section>
      </div> : Questions()}
      {modal === "quote" && <QuoteForm r={r} onClose={() => setModal(null)} />}
      {modal === "view" && <Modal title="Your quotation" onClose={() => setModal(null)} footer={<Button onClick={() => setModal(null)}>Close</Button>}>
        <dl className="facts facts--2 facts--keep"><Fact label="Quote total">{kes(q.total)}</Fact><Fact label="Spec match">{q.match}</Fact><Fact label="Delivery">{q.delivery}</Fact><Fact label="Warranty">{q.warranty}</Fact><Fact label="Valid until">{q.valid}</Fact><Fact label="Your reference">{q.ref || "None"}</Fact></dl>
        {q.note && <dl><Fact label="Note to buyer">{q.note}</Fact></dl>}<p className="t-sm c-secondary">Submitted {q.submittedOn}. To change it, withdraw it and submit a new one before quotes close.</p></Modal>}
      {modal === "withdraw" && <Modal title="Withdraw your quotation?" onClose={() => setModal(null)} footer={<><Button type="secondary" onClick={() => setModal(null)}>Cancel</Button><Button type="danger" onClick={() => { C("quotes").update(q._id, { state: "withdrawn" }); C("rfqs").update(id, { received: Math.max(0, r.received - 1) }); setModal(null); toast("Quotation withdrawn. The buyer can no longer see it."); }}>Withdraw quotation</Button></>}>
        <p>Makueni County Water will no longer see your quote of {kes(q.total)}. You can submit a new one until {r.closesLong}.</p></Modal>}
    </>
  );
}
