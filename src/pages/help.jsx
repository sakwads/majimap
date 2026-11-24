import React, { useState } from "react";
import { db, session } from "../db.js";
import { helpFor, helpGroups } from "../data/help.js";
import { navigate } from "../router.js";
import { Button, Icon } from "../components/ui.jsx";

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
export function HelpPage({ id }) {
  const HELP = helpFor(session.supplier()); const HELP_GROUPS = helpGroups(HELP);
  const i = Math.max(0, HELP.findIndex((h) => h.id === id)); const a = HELP[i]; const [open, setOpen] = useState([a.group]); const helpful = db.get("helpful") || {};
  const isOpen = (g) => open.includes(g) || g === a.group;
  return (
    <div className="help">
      <nav className="help__menu" aria-label="Help topics">
        {HELP_GROUPS.map((g) => (
          <div key={g}>
            <button type="button" className="help__group" aria-expanded={isOpen(g)} onClick={() => setOpen(isOpen(g) ? open.filter((x) => x !== g) : [...open, g])}>{g}<Icon name={isOpen(g) ? "chevron-up" : "chevron-down"} size={18} /></button>
            {isOpen(g) && HELP.filter((h) => h.group === g).map((h) => <a key={h.id} className={`help__link ${h.id === a.id ? "help__link--on" : ""}`} aria-current={h.id === a.id ? "page" : undefined} href={`#/help/${h.id}`}>{h.title}</a>)}
          </div>
        ))}
      </nav>
      <article className="help__article">
        <div className="stack stack--sm"><span className="t-eyebrow c-brand">{a.group}</span><h1 className="t-h2">{a.title}</h1><p className="t-lg c-secondary">{a.lead}</p></div>
        <hr className="divider" />
        {a.shot && <figure className="stack stack--sm"><div className="help__shot"><img src={`img/${a.shot}`} alt={a.caption} loading="lazy" /></div><figcaption className="t-sm c-secondary">{a.caption}</figcaption></figure>}
        {a.s.map(([h, body]) => (
          <section key={h} className="stack stack--sm"><h2 className="t-h4" id={slug(h)}>{h}</h2>{Array.isArray(body) ? <ol className="help__steps">{body.map((b) => <li key={b}><span>{b}</span></li>)}</ol> : <p>{body}</p>}</section>
        ))}
        <hr className="divider" />
        <div className="row row--wrap" aria-live="polite">{helpful[a.id] ? <span className="row c-secondary"><Icon name="circle-check" size={18} />Thanks for telling us.</span> : <><span className="t-label">Was this article helpful?</span><Button type="secondary" size="sm" onClick={() => db.set("helpful", { ...helpful, [a.id]: "yes" })}>Yes</Button><Button type="secondary" size="sm" onClick={() => db.set("helpful", { ...helpful, [a.id]: "no" })}>No</Button></>}</div>
        <div className="row row--between row--wrap">
          {HELP[i - 1] ? <button type="button" className="link link--plain" onClick={() => navigate(`/help/${HELP[i - 1].id}`)}>Previous: {HELP[i - 1].title}</button> : <span />}
          {HELP[i + 1] && <button type="button" className="link link--plain" onClick={() => navigate(`/help/${HELP[i + 1].id}`)}>Next: {HELP[i + 1].title}</button>}
        </div>
      </article>
      <nav className="help__toc" aria-label="On this page"><span className="t-label">On this page</span>{a.s.map(([h]) => <button key={h} type="button" className="help__link" onClick={() => document.getElementById(slug(h))?.scrollIntoView({ behavior: "smooth", block: "start" })}>{h}</button>)}</nav>
    </div>
  );
}
