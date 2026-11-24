import React, { useEffect, useRef, useState } from "react";
import { db, session } from "../db.js";
import { navigate } from "../router.js";
import { Icon, IconButton, Logo, Menu, TextField, toast } from "../components/ui.jsx";

export const NAV = [
  { path: "/overview", label: "Overview", icon: "layout-dashboard" },
  { path: "/atlas", label: "Water Atlas", icon: "map-2" },
  { path: "/assets", label: "Assets", icon: "droplets" },
  { path: "/projects", label: "Projects", icon: "copy" },
  { path: "/market", label: "Maji Market", icon: "building-store" },
  { path: "/reports", label: "Community reports", icon: "message-report", count: true },
];
const NAV_FOOT = [{ path: "/settings", label: "Settings", icon: "settings" }, { path: "/help", label: "Help", icon: "help-circle" }];

function useNarrow(query) {
  const [m, setM] = useState(() => window.matchMedia(query).matches);
  useEffect(() => { const mq = window.matchMedia(query); const on = () => setM(mq.matches); mq.addEventListener("change", on); return () => mq.removeEventListener("change", on); }, [query]);
  return m;
}

export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Icon name="home" size={16} />
      {items.map(([label, to], i) => (
        <React.Fragment key={i}>
          {i > 0 && <Icon name="chevron-right" size={14} />}
          {to && i < items.length - 1 ? <a href={"#" + to}>{label}</a> : <span className={i === items.length - 1 ? "crumbs__here" : ""} aria-current={i === items.length - 1 ? "page" : undefined}>{label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

function GlobalSearch({ onDone }) {
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => { const out = (e) => { if (ref.current && !ref.current.contains(e.target)) { setQ(""); onDone && onDone(); } }; document.addEventListener("mousedown", out); return () => document.removeEventListener("mousedown", out); }, []);
  const s = q.trim().toLowerCase();
  const hit = (t) => t.toLowerCase().includes(s);
  const results = !s ? [] : session.supplier() ? [
    ...db.collection("rfqs").all().filter((r) => r.status !== "closed" && (hit(r.title) || hit(r.code))).map((r) => ({ icon: "receipt", title: `${r.code} · ${r.title}`, sub: `Opportunity · closes ${r.closes}`, to: `/market/rfq/${r._id}` })),
    ...db.collection("products").find({ supplier: session.org().supplier }).filter((p) => hit(p.name) || hit(p.cat)).map((p) => ({ icon: "tag", title: p.name, sub: `Your catalogue · ${p.cat}`, to: "/market?tab=catalogue" })),
  ].slice(0, 8) : [
    ...db.collection("assets").all().filter((a) => hit(a.name) || hit(a.code) || hit(a.wardName)).map((a) => ({ icon: "droplets", title: a.name, sub: `Asset · ${a.code} · ${a.wardName}`, to: `/atlas?asset=${a._id}` })),
    ...db.collection("projects").all().filter((p) => hit(p.name) || hit(p.code)).map((p) => ({ icon: "copy", title: p.name, sub: `Project · ${p.code}`, to: `/projects/${p._id}` })),
    ...db.collection("suppliers").all().filter((x) => hit(x.name) || x.tags.some(hit)).map((x) => ({ icon: "building-store", title: x.name, sub: `Supplier · ${x.tags.join(", ")}`, to: `/market/supplier/${x._id}` })),
    ...db.collection("reports").all().filter((r) => hit(r.code) || hit(r.title) || hit(r.ward)).map((r) => ({ icon: "message-report", title: `${r.code} · ${r.title}`, sub: `Community report · ${r.ward}`, to: `/reports/${r._id}` })),
  ].slice(0, 8);
  return (
    <div className="header__search" ref={ref} role="search">
      <TextField icon="search" placeholder={session.supplier() ? "Search RFQs and your products" : "Search assets, projects, suppliers"} value={q} onChange={setQ} aria-label={session.supplier() ? "Search RFQs and your products" : "Search assets, projects, suppliers"} onKeyDown={(e) => { if (e.key === "Escape") { setQ(""); onDone && onDone(); } }} />
      {s && (
        <div className="search-results" role="listbox" aria-label="Search results">
          {results.length === 0 ? <p className="c-secondary" style={{ padding: 12 }}>Nothing matches “{q}”. Try a ward, an asset ID or a supplier name.</p>
            : results.map((r) => <button key={r.to} type="button" role="option" aria-selected="false" className="menu__item" onClick={() => { setQ(""); onDone && onDone(); navigate(r.to); }}><Icon name={r.icon} size={18} /><span className="tbl__two"><span>{r.title}</span><span>{r.sub}</span></span></button>)}
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false); const ref = useRef(null);
  const col = db.collection("notifications"); const aud = session.supplier() ? "supplier" : undefined; const list = col.all().filter((n) => n.aud === aud); const unread = list.filter((n) => !n.read).length;
  useEffect(() => { if (!open) return; const out = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", out); document.addEventListener("keydown", esc); return () => { document.removeEventListener("mousedown", out); document.removeEventListener("keydown", esc); }; }, [open]);
  return (
    <div className="bell" ref={ref}>
      <IconButton icon="bell" label={`Notifications, ${unread} unread`} aria-expanded={open} onClick={() => setOpen(!open)} />
      {unread > 0 && <span className="bell__count" aria-hidden="true">{unread}</span>}
      {open && (
        <div className="notif" role="dialog" aria-label="Notifications">
          <div className="row row--between"><h2 className="t-h4">Notifications</h2><div className="row"><span className="c-secondary t-sm">{unread} unread</span><IconButton icon="x" label="Close notifications" size="sm" onClick={() => setOpen(false)} /></div></div>
          {list.map((n) => (
            <button key={n._id} type="button" className={`notif__item ${n.read ? "notif__item--read" : ""}`} onClick={() => { col.update(n._id, { read: true }); setOpen(false); navigate(n.to); }}>
              <span className="notif__dot" aria-hidden="true" /><Icon name={n.icon} size={18} />
              <span className="tbl__two grow"><span className="t-label">{n.read ? "" : <span className="sr-only">Unread. </span>}{n.title}</span><span>{n.body}</span><span className="t-mono" style={{ marginTop: 4 }}>{n.meta}</span></span>
            </button>
          ))}
          {unread > 0 && <button type="button" className="btn btn--tertiary btn--sm" onClick={() => list.forEach((n) => col.update(n._id, { read: true }))}>Mark all as read</button>}
        </div>
      )}
    </div>
  );
}

export function AppShell({ active, crumbs = [], map, warm, children }) {
  const org = session.org(); const user = session.user(); const profile = db.get(session.profileKey()); const supplier = session.supplier();
  const phone = useNarrow("(max-width: 720px)"); const laptop = useNarrow("(max-width: 1180px)");
  const [navOpen, setNavOpen] = useState(false); const [search, setSearch] = useState(false);
  const collapsed = !phone && (laptop || map || db.get("navCollapsed"));
  const unverified = db.collection("reports").find({ status: "unverified" }).length;
  const go = (path) => { setNavOpen(false); navigate(path); };
  const link = (n) => (
    <button key={n.path} type="button" className={`nav-link ${active === n.path ? "nav-link--active" : ""}`} aria-current={active === n.path ? "page" : undefined} title={collapsed ? n.label : undefined} onClick={() => go(n.path)}>
      <Icon name={n.icon} size={20} /><span className="nav-link__label">{n.label}</span>
      {n.count && unverified > 0 && <span className="count count--brand" aria-label={`${unverified} unverified`}>{unverified}</span>}
    </button>
  );
  return (
    <div className={`app ${collapsed ? "app--collapsed" : ""} ${navOpen ? "app--nav-open" : ""} ${warm ? "app--warm" : ""}`}>
      <button type="button" className="scrim scrim--nav" aria-label="Close menu" onClick={() => setNavOpen(false)} />
      <aside className="sidebar" aria-label="Main menu">
        <div className="sidebar__top">
          <button type="button" onClick={() => go(supplier ? "/market" : "/overview")} aria-label={`MajiMap, go to ${supplier ? "Maji Market" : "Overview"}`}><Logo size={32} /></button>
          {phone ? <IconButton icon="x" label="Close menu" onClick={() => setNavOpen(false)} />
            : !laptop && !map && <IconButton icon={collapsed ? "chevron-right" : "chevron-left"} size="sm" className="sidebar__collapse" label={collapsed ? "Expand menu" : "Collapse menu"} onClick={() => db.set("navCollapsed", !db.get("navCollapsed"))} />}
        </div>
        <Menu matchWidth align={collapsed ? "side" : "left"} trigger={({ open, toggle }) => (
          <button type="button" className="org" aria-haspopup="menu" aria-expanded={open} onClick={toggle} title={org?.name}>
            <span className="icon-chip icon-chip--brand"><Icon name="building" size={18} /></span>
            <span className="org__text"><span className="t-label">{org?.name}</span><span className="t-sm c-secondary">{org?.role}</span></span>
            <Icon name="chevron-down" size={18} />
          </button>
        )} items={supplier ? [{ label: "How buyers see your profile", icon: "eye", onClick: () => go(`/market/supplier/${org.supplier}`) }, { label: "Your catalogue", icon: "tag", onClick: () => go("/market?tab=catalogue") }]
          : [...session.orgs().filter((o) => o.id !== org?.id).map((o) => ({ label: o.name, sub: o.role, icon: "building", onClick: () => { session.chooseOrg(o.id); toast(`Now working in ${o.name}`); go("/overview"); } })), { label: "Organisation settings", icon: "settings", onClick: () => go("/settings") }]} />
        <nav className="stack stack--xs" aria-label="Modules">{(supplier ? NAV.filter((n) => n.path === "/market") : NAV).map(link)}</nav>
        <div className="sidebar__spacer" />
        <nav className="stack stack--xs" aria-label="Settings and help">{(supplier ? NAV_FOOT.filter((n) => n.path === "/help") : NAV_FOOT).map(link)}</nav>
        <div className="user">
          <button type="button" className="user__main" onClick={() => go("/account")} title="Profile and settings">
            <span className="avatar">{user.initials}</span>
            <span className="user__text"><span className="t-label">{profile.name}</span><span className="t-sm c-secondary">{profile.email}</span></span>
          </button>
          <IconButton icon="logout" label="Sign out" size="sm" onClick={() => { session.signOut(); navigate("/login"); toast("You are signed out"); }} />
        </div>
      </aside>
      <div className="main">
        <header className={`header ${search ? "header--search" : ""}`}>
          <IconButton icon="menu-2" label="Open menu" className="header__menu" onClick={() => setNavOpen(true)} />
          <div className="header__crumbs"><Crumbs items={crumbs} /></div>
          <GlobalSearch onDone={() => setSearch(false)} />
          <IconButton icon="search" label="Search" className="header__find" onClick={() => setSearch(true)} />
          <Notifications />
        </header>
        {map ? children : <main className="content" id="content"><div className="content__inner">{children}</div></main>}
      </div>
    </div>
  );
}

export function PageHead({ title, sub, badges, actions, children }) {
  return (
    <div className="page-head">
      <div className="page-head__title">
        <div className="row row--wrap"><h1 className="t-h2">{title}</h1>{badges}</div>
        {sub && <p className="c-secondary">{sub}</p>}
        {children}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </div>
  );
}
