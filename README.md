# MajiMap: clickable prototype (desktop modules)

A working prototype of **MajiMap** (concept project): water assets, projects, supplier quotations and community reports on one county map.
Everything is **sample data** for one demo county (Makueni). Nothing is sent anywhere.

Built to match the Figma file *MajiMap (desktop screens)*, pages 00 to 08 and 10. The resident reporting app is a separate build.

## Open it

**On your Mac:** double-click **`START HERE.html`** (or `docs/index.html`). It opens in your browser. Nothing to install.

**Online (Railway):** upload this folder to GitHub, then in Railway choose *New Project → Deploy from GitHub repo*. Railway reads `package.json`: it installs, runs `npm run build`, then `npm start` (a tiny server on Railway's `PORT`). No settings needed. Optional healthcheck path: `/health`.

**Locally like Railway:** `npm ci && npm run build && npm start`, then open http://localhost:3000.

## How to sign in

The prototype opens on the landing page (`#/`). *Sign in* opens the sign-in dialog.

| What | Value |
|---|---|
| Email | any valid email, e.g. `amina.mwende@makueni.go.ke` |
| Password | anything. Type `wrong` to see the error state |
| Organisation | **Makueni County Water Department** gives full access |
| No access screen | choose **Kilungu Water Association** (Viewer), then open Projects |
| Possible duplicate asset | register an asset at latitude `-1.8036`, longitude `37.6237` |
| Accept invite, new password | any password of 10 characters or more |
| Supplier view | sign in with an email that contains `nzaui`, e.g. `joseph@nzauisolar.co.ke` (Joseph Musau, Nzaui Solar & Pumps) |

The same values are shown on the sign-in screens (dark "Prototype" notes) and in the Demo panel.

**Prototype controls:** the small **Demo** tab on the bottom edge (or press **Shift + D**). It has the test values, a one-click sign-in, switches (first-run Overview, offline / syncing / map error, failing save / export / refresh, empty lists), a button that makes the Kwa Mutonga project ready for inspection, jump links to every screen, and **Reset all data**.

## What's built

| Module | Screens |
|---|---|
| Landing | All sections, module tabs, FAQ, light and dark, Sign in dialog, Request a pilot |
| 00 Access | Sign in (default, error, loading), Session expired, Reset password, Accept invite, Choose organisation, No access and Request access |
| 07 Overview | Summary, loading, first run |
| 01 Water Atlas | Map with markers, popups, filters, layers (community reports, projects, water access by ward), legend, asset profile (About, Projects, History, Reports), edit asset, log maintenance, offline / syncing / error banners, no results |
| 01 Assets | Register (search, filters, sort, select, paging), Register an asset (validation, duplicate warning, save failed), Export (options, preparing, ready, failed; downloads a real CSV) |
| 02 Projects | Cards (masonry), Table and Map views, detail (Overview, Milestones, Budget, Evidence, Activity), add milestone, post update, upload evidence, two-step verify, reject, stage change (ready and not ready), handover checklist, close project, create project (5 steps) |
| 03 Maji Market (buyer) | Suppliers, Products, Requests, History, supplier profile, product specs, create RFQ (4 steps, several items), RFQ detail with questions and answers, compare quotations (shortlist, preferred) |
| 03 Maji Market (supplier) | Opportunities, My quotes, Catalogue (add, edit, stock switch), Messages, RFQ detail, ask a question, submit quotation (validation, save draft), withdraw quotation, public profile preview. A quote or question sent as the supplier shows up for the buyer (comparison, questions, bell) and the other way round |
| 04 Community reports | Queue, report detail (unverified, under review, possible duplicate, confirmed, not a fault, resolved), confirm fault, create or link project, message reporter, reports map |
| 05 Organisation | Profile (view, edit), Team and roles (invite, change role, suspend, remove with a danger confirm, access requests), Data sources (add, refresh, refresh failed), Notifications (unsaved changes bar) |
| 06 Profile and settings | Profile, Appearance (Maji Light, Maji Dark, Match system, text size, reduce motion, larger touch targets), Preferences, Security |
| 08 Help | 20 articles in 9 groups, On this page, Previous / Next, screenshots of the prototype |

Not built here: the resident app (separate build).

## How it's made (for developers)

Same set-up as the Rafiki Tax prototype.

- **React 19**, bundled with **esbuild** into plain files in `docs/`, so it runs straight from a file or from GitHub Pages.
- **Design tokens** live in `src/styles/tokens.css`. Names and values mirror the Figma variables (collection *MajiMap DS*, modes Maji Light and Maji Dark). Change a value once and it changes everywhere.
- **Data:** `src/seed.js` is the static sample data. `src/db.js` is a small document store saved in the browser's localStorage; *Reset all data* restores the seed. There is no backend.
- **Layout:** fixed sidebar and header; only the content area scrolls. Content sits on a 12-column fluid grid (24 gutter and margin at 1440) that stretches with the window and is centred past 1280. The sidebar collapses to icons at 1180 and below (and on map screens); at 720 and below it becomes a drawer and the grid becomes one column.
- **Tables:** the first column (and the checkbox column) stays in place while the other columns scroll sideways, at every width.
- **Map:** a static OpenStreetMap image of the demo area (`public/img/basemap.jpg`, exported from the Figma base map). Markers, the trunk main, ward shading, popups and filters are drawn on top from the sample data, so the map works offline. Zoom and drag scale and move the image. Maji Dark tints the same image with a CSS filter.
- **Icons:** Tabler outline. `src/icons.js` is generated by `npm run icons` (list of names in `scripts/gen-icons.mjs`).
- **Fonts:** Figtree and JetBrains Mono, self-hosted from @fontsource.
- **Help and landing screenshots** in `public/img/shot-*.jpg` are captures of this prototype at 1440 x 900.

To rebuild after changing `src/` (then upload `docs/` too, so the file version keeps working):

```bash
npm ci
npm run build
```

## Changelog

Copied from `CHANGELOG.md` by `npm run build`. Edit CHANGELOG.md, not this section.

<!-- changelog:start -->

Newest first. Prototype changes only (the Figma changes are in the project changelog).

---

### v1.1.8 (25 Nov 2026)
- Money and count fields add thousand separators as you type (1,248,000), keep the cursor in place, and ignore letters. Applies to Quote total, Guide price, Approved budget and RFQ item Quantity. Money fields show a KES prefix inside the box. Values are still saved as plain numbers.

### v1.1.7 (25 Nov 2026)
- Help is now role-aware. Suppliers see only supplier help: MajiMap for suppliers, Find opportunities, Ask the buyer a question, Quote as a supplier, Track your quotes, Manage your catalogue, How buyers see you, Update your profile, Search help and Contact support (supplier versions). Opening a county-only article link as a supplier lands on the supplier help. County, utility and NGO users see the same help as before.

### v1.1.6 (24 Nov 2026)
- Fixed: typing in "Ask a question" (supplier RFQ) lost focus after every letter. The Questions panel was rebuilt as a new component on each keystroke; it now renders in place. Same fix applied to the buyer's Questions panel and the project milestone rows.

### v1.1.5 (24 Nov 2026)
- Landing hero and "Why MajiMap" copy now follow the agreed simple explanation: "Plan, build and look after water projects in one place."
- Hero cards now show the four parts (Water Atlas, Project tracking, Maji Market, Community reporting), and a "Built for" row names who it is for: county water departments, water companies, NGOs, contractors, equipment suppliers and residents.

### v1.1.4 (24 Nov 2026)
- Landing hero rewritten so MajiMap reads as the whole delivery platform, not a repair tool: new headline and lead, and the hero cards now show find the gap (Water Atlas), plan and source (Projects and Maji Market), deliver and verify.
- "Why MajiMap", "How it works" and module copy no longer frame everything as a repair; the borehole walk-through is labelled as one example.

### v1.1.3 (24 Nov 2026)
- Landing page: the two resident phone frames are no longer clipped. The images now have transparent corners with the full bezel and side buttons, and the frames use a drop shadow instead of a rounded crop.

### v1.1.2 · 24 Nov 2026 · Organisation menu

- The organisation menu is now the same width as the organisation box when the sidebar is open, and opens beside the icon when it is collapsed. Each organisation shows its name with the role on a second line, instead of one long cut-off line.
- The changelog now also sits at the end of README.md. `npm run build` copies CHANGELOG.md into it, so the two always match.

---

### v1.1.1 · 24 Nov 2026 · Menus, date picker, alerts

- New date picker in place of the browser's own calendar, on all 7 date fields (Needed by, Quotes close on, Valid until, Start date, End date, milestone Due dates). It opens at the full width of its field, uses MajiMap tokens in both themes, marks today, blocks dates before a minimum where one applies (End date after Start date; RFQ dates from today), and works by keyboard (arrows, Page Up / Page Down, Enter, Escape). Dates can also be typed as 24 Nov 2026 or 24/11/2026; anything else shows an error.
- One-line alerts (no title) now centre the icon and the text.

- All dropdown menus (organisation switcher, row actions, Manage) now float above the page instead of inside their container, so the collapsed sidebar and sideways-scrolling tables can no longer clip them.
- With the sidebar collapsed, the organisation menu opens to the right of the organisation icon.
- Menus follow their button when the page or a table scrolls, flip upwards near the bottom of the window, and stay inside the screen edges.

---

### v1.1 · 24 Nov 2026 · Supplier view

Checked in a headless browser at 1440, 1024 and 390 wide: no sideways overflow, no console errors, and a scripted run (supplier signs in, validation errors, submits a quote, asks a question, adds a product; buyer then sees the fifth quote in the comparison and the new question).

- Second demo person: Joseph Musau, Nzaui Solar & Pumps (sign in with an email containing `nzaui`, or from the Demo panel).
- Suppliers see only Maji Market and Help: Opportunities, My quotes, Catalogue, Messages, RFQ detail, submit / save draft / withdraw quotation, ask a question, public profile preview.
- Buyers only see quotations that were submitted (drafts and withdrawn quotes stay hidden). A submitted quote adds a notification to the buyer's bell.
- Help: new article "Quote as a supplier".

---

### v1.0 · 24 Nov 2026 · First build (desktop modules)

Checked in a headless browser at 1440, 1024 and 390 wide, Maji Light and Maji Dark: no sideways page overflow, no console errors, and a scripted run through sign in, no access, register asset, export, asset profile, verify evidence, stage change, create RFQ, compare quotes, confirm fault, remove member and theme switch. Not yet tested by a person on a real phone.

- Landing page that links into the app, with the sign-in dialog and built-in sign-in help.
- Access flows, Overview, Water Atlas, Assets, Projects, Maji Market, Community reports (reviewer), Organisation, Profile and settings, Help.
- Static base map with live layers; static sample data in the browser; Demo panel (Shift + D).
- Fluid 12-column grid; sidebar collapses at 1180; drawer and one column at 720.
- Tables keep the first column in place at every width.
- Remove member uses a Danger confirm.
- Landing navy bands keep fixed brand colours in Maji Dark, so gold on navy stays at 5.19:1 (the Figma hero measured 1.29:1 in Maji Dark).

Known gaps: Kiswahili not translated; ward shapes are schematic; overview totals are fixed sample figures and do not change with the register.

<!-- changelog:end -->
