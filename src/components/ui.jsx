import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ICONS } from "../icons.js";
import { db } from "../db.js";

/* Re-render when the data store changes */
export function useDb() { return useSyncExternalStore(db.subscribe, db.version); }

/* ───────── Icon (Tabler outline) ───────── */
export function Icon({ name, size = 20, className = "", title }) {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title && <title>{title}</title>}
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
export const Spinner = ({ size = 20 }) => <Icon name="loader-2" size={size} className="spin" />;

/* ───────── Brand ───────── */
export function LogoMark({ size = 32, onBrand }) {
  const c = onBrand ? ["#a8d8e8", "#6ab4d6", "#fafcfb"] : ["var(--mm-logo-ring-outer)", "var(--mm-logo-ring-inner)", "var(--mm-logo-drop)"];
  return (
    <svg width={size} height={size} viewBox="4 8 56 56" fill="none" aria-hidden="true" className="logo__mark">
      <circle cx="32" cy="36" r="25.5" stroke={c[0]} strokeWidth="3" /><circle cx="32" cy="36" r="17" stroke={c[1]} strokeWidth="3" />
      <path d="M32 22s-7.5 8.6-7.5 13.6a7.5 7.5 0 0 0 15 0C39.5 30.6 32 22 32 22Z" fill={c[2]} />
    </svg>
  );
}
export function Logo({ size = 32, onBrand, markOnly }) {
  return (
    <span className={`logo ${onBrand ? "logo--on-brand" : ""}`}>
      <LogoMark size={size} onBrand={onBrand} />
      {!markOnly && <span className="logo__word" style={{ fontSize: size * 0.75 }}>Maji<span>Map</span></span>}
    </span>
  );
}

/* ───────── Buttons ───────── */
export function Button({ type = "primary", size, block, icon, iconRight, loading, disabled, children, className = "", htmlType = "button", ...rest }) {
  const cls = ["btn", `btn--${type}`, size === "sm" && "btn--sm", block && "btn--block", className].filter(Boolean).join(" ");
  return (
    <button type={htmlType} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Spinner size={18} /> : icon ? <Icon name={icon} size={18} /> : null}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </button>
  );
}
export function IconButton({ icon, label, size, className = "", ...rest }) {
  return <button type="button" className={`icon-btn ${size === "sm" ? "icon-btn--sm" : ""} ${className}`} aria-label={label} title={label} {...rest}><Icon name={icon} size={20} /></button>;
}

/* ───────── Fields ───────── */
let fieldCount = 0;
export function useId(prefix = "f") { const ref = useRef(null); if (!ref.current) ref.current = `${prefix}-${++fieldCount}`; return ref.current; }

export function Field({ label, optional, helper, error, count, children, id }) {
  return (
    <div className="field">
      {label && <label className="field__label" htmlFor={id}>{label}{optional && <span className="field__opt"> (optional)</span>}</label>}
      {children}
      {(error || helper || count) && (
        <div className="field__help" id={`${id}-help`}>
          {error ? <span className="field__error" role="alert"><Icon name="alert-circle" size={14} />{error}</span> : <span>{helper}</span>}
          {count && <span className="nowrap">{count}</span>}
        </div>
      )}
    </div>
  );
}
// Whole numbers with thousand separators: 1248000 -> "1,248,000". Used by amount and count fields.
export const groupDigits = (v) => { const d = String(v ?? "").replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 13); return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""; };
export function TextField({ label, optional, value, onChange, placeholder, helper, error, icon, type = "text", onEnter, disabled, trailing, size, number, prefix, ...rest }) {
  const id = useId(); const ref = useRef(null); const caret = useRef(null);
  const shown = number ? groupDigits(value) : value ?? "";
  useLayoutEffect(() => {
    if (!number || caret.current == null || !ref.current || document.activeElement !== ref.current) return;
    let want = caret.current, pos = 0; caret.current = null;
    while (pos < shown.length && want > 0) { if (/\d/.test(shown[pos])) want--; pos++; }
    ref.current.setSelectionRange(pos, pos);
  }, [shown, number]);
  const change = (e) => {
    if (!onChange) return;
    if (!number) return onChange(e.target.value);
    const el = e.target; let raw = el.value; let before = raw.slice(0, el.selectionStart ?? raw.length).replace(/\D/g, "").length;
    // Backspace on a comma only removed the comma: remove the digit before it instead.
    if (raw.length < shown.length && raw.replace(/\D/g, "") === shown.replace(/\D/g, "") && before > 0) { const d = raw.replace(/\D/g, ""); raw = d.slice(0, before - 1) + d.slice(before); before -= 1; }
    caret.current = before; onChange(groupDigits(raw));
  };
  return (
    <Field label={label} optional={optional} helper={helper} error={error} id={id}>
      <div className={`input ${error ? "input--error" : ""} ${disabled ? "input--disabled" : ""} ${size === "sm" ? "input--sm" : ""}`}>
        {icon && <Icon name={icon} size={18} />}
        {prefix && <span className="input__prefix" aria-hidden="true">{prefix}</span>}
        <input ref={ref} id={id} className={`input__control ${number ? "input__control--num" : ""}`} value={shown} placeholder={placeholder} type={type} disabled={disabled}
          inputMode={number ? "numeric" : rest.inputMode} autoComplete={number ? "off" : rest.autoComplete}
          aria-invalid={error ? true : undefined} aria-describedby={error || helper ? `${id}-help` : undefined}
          onChange={change} onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }} {...rest} />
        {trailing}
      </div>
    </Field>
  );
}
export function PasswordField(props) {
  const [show, setShow] = useState(false);
  return <TextField {...props} type={show ? "text" : "password"} trailing={
    <button type="button" className="icon-btn icon-btn--sm" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow(!show)}><Icon name={show ? "eye-off" : "eye"} size={18} /></button>} />;
}
/* ───────── Date field ─────────
   Our own calendar instead of the browser's, so it matches the system and opens at the field's full width.
   value / onChange use yyyy-mm-dd. Type a date (24 Nov 2026 or 24/11/2026) or pick one.
   Keyboard: arrows move a day or a week, Page Up / Page Down change month, Enter picks, Escape closes. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = [["Mon", "Monday"], ["Tue", "Tuesday"], ["Wed", "Wednesday"], ["Thu", "Thursday"], ["Fri", "Friday"], ["Sat", "Saturday"], ["Sun", "Sunday"]];
const TODAY_ISO = "2026-11-24"; // the prototype's "today", so sample data and dates agree
const pad = (n) => String(n).padStart(2, "0");
const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
export const formatDate = (s) => { const d = fromIso(s); return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : ""; };
function parseTyped(t) {
  t = t.trim(); if (!t) return "";
  let m = /^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})$/.exec(t); if (m) { const d = new Date(+m[3], +m[2] - 1, +m[1]); return d.getMonth() === +m[2] - 1 ? toIso(d) : null; }
  m = /^(\d{1,2})\s+([a-z]{3,})\.?\s+(\d{4})$/i.exec(t); if (m) { const mi = MONTHS.findIndex((x) => m[2].toLowerCase().startsWith(x.toLowerCase())); if (mi < 0) return null; const d = new Date(+m[3], mi, +m[1]); return d.getMonth() === mi ? toIso(d) : null; }
  return /^\d{4}-\d{2}-\d{2}$/.test(t) && fromIso(t) ? t : null;
}
export function DateField({ label, optional, value, onChange, helper, error, min, disabled }) {
  const id = useId("date"); const box = useRef(null); const pop = useRef(null);
  const [open, setOpen] = useState(false); const [text, setText] = useState(formatDate(value)); const [typedErr, setTypedErr] = useState("");
  const [focus, setFocus] = useState(() => fromIso(value) || fromIso(TODAY_ISO)); const [pos, setPos] = useState(null);
  useEffect(() => { setText(formatDate(value)); }, [value]);
  const place = () => { const r = box.current?.getBoundingClientRect(); if (!r) return; const h = pop.current?.offsetHeight || 360; const below = r.bottom + 4 + h <= window.innerHeight - 8; setPos({ left: r.left, width: r.width, top: below ? r.bottom + 4 : Math.max(8, r.top - 4 - h) }); };
  useEffect(() => {
    if (!open) return; place(); const raf = requestAnimationFrame(place);
    const out = (e) => { if (!box.current?.contains(e.target) && !pop.current?.contains(e.target)) setOpen(false); };
    const follow = (e) => { if (!pop.current?.contains(e.target)) place(); };
    document.addEventListener("mousedown", out); window.addEventListener("scroll", follow, true); window.addEventListener("resize", follow);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("mousedown", out); window.removeEventListener("scroll", follow, true); window.removeEventListener("resize", follow); };
  }, [open]);
  // Move keyboard focus into the calendar once it is placed, and follow the focused day
  useEffect(() => { if (open && pos) pop.current?.querySelector('[data-focus="true"]')?.focus(); }, [focus, open, !!pos]);
  const minD = fromIso(min); const sel = fromIso(value);
  const pick = (d) => { if (minD && d < minD) return; onChange(toIso(d)); setTypedErr(""); setOpen(false); box.current?.querySelector("input")?.focus(); };
  const openAt = () => { if (disabled) return; setFocus(fromIso(value) || fromIso(TODAY_ISO)); setPos(null); setOpen(true); };
  const y = focus.getFullYear(), mo = focus.getMonth();
  const first = new Date(y, mo, 1); const start = new Date(y, mo, 1 - ((first.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const move = (n) => setFocus(new Date(focus.getFullYear(), focus.getMonth(), focus.getDate() + n));
  const month = (n) => { const d = new Date(focus.getFullYear(), focus.getMonth() + n, 1); d.setDate(Math.min(focus.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); setFocus(d); };
  function key(e) {
    const k = { ArrowLeft: () => move(-1), ArrowRight: () => move(1), ArrowUp: () => move(-7), ArrowDown: () => move(7), PageUp: () => month(-1), PageDown: () => month(1), Home: () => move(-((focus.getDay() + 6) % 7)), End: () => move(6 - ((focus.getDay() + 6) % 7)) }[e.key];
    if (k) { e.preventDefault(); k(); } else if (e.key === "Escape") { e.preventDefault(); setOpen(false); box.current?.querySelector("input")?.focus(); }
  }
  const same = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const today = fromIso(TODAY_ISO); const err = error || typedErr;
  return (
    <Field label={label} optional={optional} helper={helper} error={err} id={id}>
      <div ref={box} className={`input ${err ? "input--error" : ""} ${disabled ? "input--disabled" : ""} ${open ? "input--open" : ""}`}>
        <input id={id} className="input__control" value={text} placeholder="Choose or type a date" disabled={disabled} autoComplete="off"
          aria-invalid={err ? true : undefined} aria-describedby={err || helper ? `${id}-help` : undefined}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => { const v = parseTyped(text); if (v === null) setTypedErr("Use a date like 24 Nov 2026 or 24/11/2026"); else { setTypedErr(""); if (v !== (value || "")) onChange(v); } }}
          onKeyDown={(e) => { if (e.key === "ArrowDown" || (e.altKey && e.key === "ArrowDown")) { e.preventDefault(); openAt(); } if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); e.currentTarget.focus(); } }} />
        <button type="button" className="icon-btn icon-btn--sm" aria-label={`${open ? "Close" : "Open"} calendar for ${label}`} aria-haspopup="dialog" aria-expanded={open} disabled={disabled} onClick={() => (open ? setOpen(false) : openAt())}><Icon name="calendar" size={18} /></button>
      </div>
      {open && (
        <div ref={pop} className="cal" role="dialog" aria-modal="false" aria-label={`Choose ${label ? label.toLowerCase() : "a date"}`} onKeyDown={key}
          style={pos ? { top: pos.top, left: pos.left, width: pos.width } : { visibility: "hidden", top: 0, left: 0 }}>
          <div className="cal__head">
            <span className="t-label" aria-live="polite">{MONTHS_LONG[mo]} {y}</span>
            <div className="row" style={{ gap: 4 }}><IconButton icon="chevron-left" size="sm" label="Previous month" onClick={() => month(-1)} /><IconButton icon="chevron-right" size="sm" label="Next month" onClick={() => month(1)} /></div>
          </div>
          <table className="cal__grid" role="grid" aria-label={`${MONTHS_LONG[mo]} ${y}`}>
            <thead><tr>{DOW.map(([s, l]) => <th key={s} scope="col" abbr={l}>{s}</th>)}</tr></thead>
            <tbody>{[0, 1, 2, 3, 4, 5].map((w) => <tr key={w}>{days.slice(w * 7, w * 7 + 7).map((d) => {
              const out = d.getMonth() !== mo; const off = minD && d < minD; const isSel = same(d, sel); const isFocus = same(d, focus); const isToday = same(d, today);
              return <td key={d.getTime()}><button type="button" tabIndex={isFocus ? 0 : -1} data-focus={isFocus} disabled={off}
                className={`cal__day ${out ? "cal__day--out" : ""} ${isSel ? "cal__day--on" : ""} ${isToday ? "cal__day--today" : ""}`}
                aria-pressed={isSel} aria-current={isToday ? "date" : undefined} aria-label={`${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}${isToday ? ", today" : ""}`}
                onClick={() => pick(d)}>{d.getDate()}</button></td>; })}</tr>)}</tbody>
          </table>
          <div className="cal__foot">
            <Button type="tertiary" size="sm" onClick={() => { onChange(""); setText(""); setOpen(false); }}>Clear</Button>
            <Button type="tertiary" size="sm" disabled={minD && today < minD} onClick={() => pick(today)}>Today</Button>
          </div>
        </div>
      )}
    </Field>
  );
}

export function SelectField({ label, optional, value, onChange, options, placeholder, helper, error, disabled }) {
  const id = useId();
  return (
    <Field label={label} optional={optional} helper={helper} error={error} id={id}>
      <div className={`input ${error ? "input--error" : ""} ${disabled ? "input--disabled" : ""}`}>
        <select id={id} className="input__control" value={value ?? ""} disabled={disabled} aria-invalid={error ? true : undefined} onChange={(e) => onChange(e.target.value)}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}
        </select>
        <Icon name="chevron-down" size={18} />
      </div>
    </Field>
  );
}
export function TextArea({ label, optional, value, onChange, placeholder, helper, error, max, rows = 4 }) {
  const id = useId();
  return (
    <Field label={label} optional={optional} helper={helper} error={error} id={id} count={max ? `${(value || "").length} / ${max}` : null}>
      <div className={`input input--area ${error ? "input--error" : ""}`}>
        <textarea id={id} className="input__control" rows={rows} value={value ?? ""} placeholder={placeholder} maxLength={max} aria-invalid={error ? true : undefined} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  );
}
export function Checkbox({ checked, mixed, onChange, label, helper, ariaLabel }) {
  return (
    <label className="choice" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" className="sr-only" checked={!!checked} aria-label={ariaLabel} ref={(el) => { if (el) el.indeterminate = !!mixed; }} onChange={(e) => onChange(e.target.checked)} />
      <span className={`checkbox ${checked || mixed ? "checkbox--on" : ""}`} aria-hidden="true">{checked ? <Icon name="check" size={14} /> : mixed ? <Icon name="minus" size={14} /> : null}</span>
      {label && <span className="choice__text"><span>{label}</span>{helper && <span className="t-sm c-secondary">{helper}</span>}</span>}
    </label>
  );
}
export function RadioRow({ checked, onChange, name, children, className = "" }) {
  return (
    <label className={`choice ${className}`}>
      <input type="radio" className="sr-only" name={name} checked={checked} onChange={onChange} />
      <span className={`radio ${checked ? "radio--on" : ""}`} aria-hidden="true" />
      {children}
    </label>
  );
}
export function Switch({ checked, onChange, label }) {
  return (
    <label className="choice" style={{ alignItems: "center" }}>
      <input type="checkbox" role="switch" className="sr-only" checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)} />
      <span className={`switch ${checked ? "switch--on" : ""}`} aria-hidden="true"><span className="switch__knob">{checked && <Icon name="check" size={12} />}</span></span>
    </label>
  );
}
export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={value === v} className={`seg__btn ${value === v ? "seg__btn--on" : ""}`} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}
/* Filter chip backed by a native select: works with keyboards, screen readers and phone pickers */
export function FilterSelect({ label, value, options, onChange }) {
  return (
    <span className="filter">
      <span className={`chip ${value ? "chip--on" : ""}`} aria-hidden="true">{value ? `${label}: ${value}` : label}<Icon name="chevron-down" size={16} /></span>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Any {label.toLowerCase()}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </span>
  );
}

/* ───────── Status ───────── */
export function Badge({ tone = "neutral", icon, dot = true, children }) {
  return <span className={`badge badge--${tone}`}>{icon ? <Icon name={icon} size={14} /> : dot ? <span className="badge__dot" /> : null}{children}</span>;
}
export const Tag = ({ children }) => <span className="tag">{children}</span>;
export function Alert({ tone = "info", title, children, actions, onClose }) {
  const icon = { info: "info-circle", warning: "alert-triangle", error: "alert-circle", success: "circle-check" }[tone];
  return (
    <div className={`alert alert--${tone} ${!title && !actions ? "alert--center" : ""}`} role={tone === "error" ? "alert" : "note"}>
      <Icon name={icon} size={20} />
      <div className="alert__text">{title && <p className="alert__title">{title}</p>}{children && <p className="t-sm">{children}</p>}{actions && <div className="alert__actions">{actions}</div>}</div>
      {onClose && <IconButton icon="x" label="Dismiss" size="sm" onClick={onClose} />}
    </div>
  );
}
export function Empty({ icon = "search", title, children, action }) {
  return <div className="empty"><span className="empty__icon"><Icon name={icon} size={28} /></span><p className="t-h4 c-default">{title}</p><p>{children}</p>{action}</div>;
}
export const Skel = ({ w = "100%", h = 14, style }) => <span className="skel" style={{ width: w, height: h, ...style }} aria-hidden="true" />;
export function Progress({ value, second, tone, label }) {
  return <div className={`progress ${tone ? "progress--" + tone : ""}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}><span style={{ width: `${value}%` }} />{second ? <span style={{ width: `${second}%` }} /> : null}</div>;
}
export function Fact({ label, children }) { return <div className="fact"><dt>{label}</dt><dd>{children}</dd></div>; }
export function Photos({ count = 3 }) {
  if (!count) return null;
  return (
    <div className="photos" role="img" aria-label={`${count} geotagged photos`}>
      <div className="photo"><Icon name="photo" /><span className="photo__gps"><Icon name="map-pin" size={12} /></span></div>
      {count > 1 && <div className="photo"><Icon name="photo" /><span className="photo__gps"><Icon name="map-pin" size={12} /></span></div>}
      {count > 2 && <div className="photo photo--more">+{count - 2}</div>}
    </div>
  );
}

/* ───────── Tabs ───────── */
export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map(([v, l, n]) => <button key={v} type="button" role="tab" aria-selected={value === v} className={`tab ${value === v ? "tab--on" : ""}`} onClick={() => onChange(v)}>{l}{n != null && <span className="count">{n}</span>}</button>)}
    </div>
  );
}

/* ───────── Table ─────────
   columns: [{ key, label, flex, width, align, render(row), sort }]. The first column (and the checkbox column) stays
   in place while the other columns scroll sideways when the table is wider than its container. */
export function Table({ label, columns, rows, selectable, selected = [], onSelect, onRowClick, rowLabel, empty, loading, minWidth, sort, onSort }) {
  const ref = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const ids = rows.map((r) => r._id);
  const all = ids.length > 0 && ids.every((id) => selected.includes(id));
  const some = !all && ids.some((id) => selected.includes(id));
  const cell = (c) => (c.width ? { flex: "none", width: c.width } : { flex: `${c.flex || 1} 0 0`, minWidth: c.min || 0 });
  return (
    <div className={`tbl-scroll ${scrolled ? "tbl-scroll--scrolled" : ""}`} ref={ref} onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)} tabIndex={0} role="region" aria-label={`${label}, scrolls sideways`}>
      <div className={`tbl ${selectable ? "tbl--sel" : ""}`} role="table" aria-label={label} aria-busy={loading || undefined} style={minWidth ? { "--tbl-min": minWidth + "px" } : undefined}>
        <div className="tbl__head" role="row">
          {selectable && <div className="tbl__cell tbl__cell--check" role="columnheader"><Checkbox ariaLabel="Select all on this page" checked={all} mixed={some} onChange={(v) => onSelect(v ? [...new Set([...selected, ...ids])] : selected.filter((s) => !ids.includes(s)))} /></div>}
          {columns.map((c, i) => (
            <div key={c.key} role="columnheader" className={`tbl__cell ${i === 0 ? "tbl__cell--first" : ""} ${c.align === "right" ? "tbl__cell--right" : ""}`} style={cell(c)}
              aria-sort={sort && sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
              {c.sort ? <button type="button" className="tbl__sort" onClick={() => onSort({ key: c.key, dir: sort?.key === c.key ? -sort.dir : 1 })}>{c.label}<Icon name={sort?.key === c.key ? (sort.dir === 1 ? "chevron-up" : "chevron-down") : "selector"} size={14} /></button> : c.label}
            </div>
          ))}
        </div>
        {loading ? Array.from({ length: 8 }, (_, r) => (
          <div key={r} className="tbl__row" aria-hidden="true">
            {selectable && <div className="tbl__cell tbl__cell--check"><Skel w={20} h={20} /></div>}
            {columns.map((c, i) => <div key={c.key} className={`tbl__cell ${i === 0 ? "tbl__cell--first" : ""}`} style={cell(c)}><Skel w={c.label ? "70%" : "40%"} /></div>)}
          </div>
        )) : rows.length === 0 ? empty : rows.map((r) => {
          const on = selected.includes(r._id);
          return (
            <div key={r._id} role="row" className={`tbl__row ${on ? "tbl__row--on" : ""} ${onRowClick ? "tbl__row--click" : ""}`} onClick={onRowClick ? () => onRowClick(r) : undefined}>
              {selectable && <div className="tbl__cell tbl__cell--check" role="cell"><Checkbox ariaLabel={`Select ${rowLabel ? rowLabel(r) : r._id}`} checked={on} onChange={(v) => onSelect(v ? [...selected, r._id] : selected.filter((s) => s !== r._id))} /></div>}
              {columns.map((c, i) => (
                <div key={c.key} role="cell" className={`tbl__cell ${i === 0 ? "tbl__cell--first" : ""} ${c.align === "right" ? "tbl__cell--right" : ""}`} style={cell(c)} onClick={c.stop ? (e) => e.stopPropagation() : undefined}>
                  {c.render ? c.render(r) : r[c.key]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "…", pages];
  if (page >= pages - 3) return [1, "…", pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, "…", page - 1, page, page + 1, "…", pages];
}
export function TableFooter({ total, page, size, onPage, onSize, noun = "records" }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total ? (page - 1) * size + 1 : 0, to = Math.min(total, page * size);
  return (
    <div className="tbl-foot">
      <div className="row row--wrap" style={{ gap: 24 }}>
        <span aria-live="polite">Showing {from}–{to} of {total} {noun}</span>
        <label className="row">Rows per page
          <span className="input input--sm" style={{ width: 72 }}><select className="input__control" value={size} onChange={(e) => { onSize(Number(e.target.value)); onPage(1); }}>{[10, 25, 50].map((n) => <option key={n}>{n}</option>)}</select><Icon name="chevron-down" size={14} /></span>
        </label>
      </div>
      <nav className="pager" aria-label="Pages">
        <button type="button" className="pager__btn" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}><Icon name="chevron-left" size={16} /></button>
        {pageList(page, pages).map((p, i) => p === "…" ? <span key={"e" + i} className="pager__btn" aria-hidden="true">…</span>
          : <button key={p} type="button" className={`pager__btn ${p === page ? "pager__btn--on" : ""}`} aria-current={p === page ? "page" : undefined} aria-label={`Page ${p}`} onClick={() => onPage(p)}>{p}</button>)}
        <button type="button" className="pager__btn" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}><Icon name="chevron-right" size={16} /></button>
      </nav>
    </div>
  );
}
/* Client-side paging and sorting for a list of rows */
export function usePaged(rows, initialSort) {
  const [page, setPage] = useState(1); const [size, setSize] = useState(10); const [sort, setSort] = useState(initialSort || null);
  const sorted = sort ? [...rows].sort((a, b) => String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), "en", { numeric: true }) * sort.dir) : rows;
  const pages = Math.max(1, Math.ceil(sorted.length / size)); const p = Math.min(page, pages);
  return { rows: sorted.slice((p - 1) * size, p * size), total: sorted.length, page: p, size, sort, setPage, setSize, setSort };
}

/* ───────── Popover menu ───────── */
/* Menus are drawn with position: fixed from the trigger's position, so a scrolling or clipped parent
   (the collapsed sidebar, a sideways-scrolling table) can never cut them off.
   align: "left" | "right" (below the trigger) or "side" (to the right of the trigger, for the collapsed sidebar). */
export function Menu({ trigger, items, align, matchWidth }) {
  const [open, setOpen] = useState(false); const [pos, setPos] = useState(null); const ref = useRef(null); const menuRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = ref.current?.getBoundingClientRect(); if (!r) return;
      const m = menuRef.current; const mh = m ? m.offsetHeight : 0; const mw = m ? m.offsetWidth : 220;
      let top = align === "side" ? r.top : r.bottom + 4; let left = align === "side" ? r.right + 8 : align === "left" ? r.left : r.right - mw;
      if (top + mh > window.innerHeight - 8) top = Math.max(8, (align === "side" ? r.bottom : r.top - 4) - mh);
      left = Math.max(8, Math.min(left, window.innerWidth - mw - 8));
      setPos({ top, left, width: matchWidth && align !== "side" ? r.width : undefined });
    };
    place(); const raf = requestAnimationFrame(place);
    const out = (e) => { if (ref.current && !ref.current.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    // Follow the trigger when the page or a table scrolls; close if the trigger scrolls out of view
    const follow = (e) => { if (menuRef.current?.contains(e.target)) return; const r = ref.current?.getBoundingClientRect(); if (!r || r.bottom < 0 || r.top > window.innerHeight) setOpen(false); else place(); };
    document.addEventListener("mousedown", out); document.addEventListener("keydown", esc);
    window.addEventListener("scroll", follow, true); window.addEventListener("resize", follow);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("mousedown", out); document.removeEventListener("keydown", esc); window.removeEventListener("scroll", follow, true); window.removeEventListener("resize", follow); };
  }, [open, align]);
  return (
    <span className="pop" ref={ref} onClick={(e) => e.stopPropagation()}>
      {trigger({ open, toggle: () => { setPos(null); setOpen(!open); } })}
      {open && (
        <div ref={menuRef} className="menu menu--fixed" role="menu" style={pos ? { top: pos.top, left: pos.left, width: pos.width, minWidth: pos.width ? 0 : undefined } : { visibility: "hidden", top: 0, left: 0 }}>
          {items.filter(Boolean).map((it) => <button key={it.label} type="button" role="menuitem" className={`menu__item ${it.danger ? "menu__item--danger" : ""}`} onClick={() => { setOpen(false); it.onClick(); }}>{it.icon && <Icon name={it.icon} size={18} />}{it.sub ? <span className="tbl__two"><span>{it.label}</span><span>{it.sub}</span></span> : it.label}</button>)}
        </div>
      )}
    </span>
  );
}

/* ───────── Modal ───────── */
export function Modal({ title, onClose, locked, children, footer, width }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement; ref.current?.focus();
    const k = (e) => { if (e.key === "Escape" && !locked) onClose(); };
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); prev?.focus?.(); };
  }, [locked]);
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget && !locked) onClose(); }}>
      <div ref={ref} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} style={width ? { width } : undefined}>
        <div className="modal__head"><h2 id="modal-title" className="t-h4">{title}</h2><IconButton icon="x" label="Close" onClick={onClose} disabled={locked} /></div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ───────── Toasts ───────── */
const toastListeners = new Set();
let toasts = [];
const emit = () => toastListeners.forEach((fn) => fn(toasts));
export function toast(message, opts = {}) {
  const t = { id: Math.random(), message, icon: opts.icon || "circle-check", action: opts.action };
  toasts = [...toasts, t]; emit();
  setTimeout(() => { toasts = toasts.filter((x) => x.id !== t.id); emit(); }, opts.action ? 8000 : 3600);
}
export function ToastStack() {
  const [list, setList] = useState(toasts);
  useEffect(() => { toastListeners.add(setList); return () => toastListeners.delete(setList); }, []);
  return (
    <div className="toast-stack" aria-live="polite">
      {list.map((t) => <div key={t.id} className="toast" role="status"><Icon name={t.icon} size={20} /><span className="grow">{t.message}</span>
        {t.action && <button type="button" className="btn" onClick={() => { toasts = toasts.filter((x) => x.id !== t.id); emit(); t.action.onClick(); }}>{t.action.label}</button>}</div>)}
    </div>
  );
}

/* Prototype-only tip: tells testers which values to use. Not part of the design. */
export function ProtoHint({ children }) {
  return <p className="proto-hint" role="note"><span className="proto-hint__tag">Prototype</span><span>{children}</span></p>;
}
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/* Short loading state the first time a list opens in a session, so the skeletons can be seen */
const seen = new Set();
export function useFirstLoad(key, ms = 650) {
  const [loading, setLoading] = useState(!seen.has(key));
  useEffect(() => { if (!loading) return; const t = setTimeout(() => { seen.add(key); setLoading(false); }, ms); return () => clearTimeout(t); }, []);
  return loading;
}
export const replayLoading = () => seen.clear();
