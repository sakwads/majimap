# MajiMap prototype changelog

Newest first. Prototype changes only (the Figma changes are in the project changelog).

---

## v1.1.8 (25 Nov 2026)
- Money and count fields add thousand separators as you type (1,248,000), keep the cursor in place, and ignore letters. Applies to Quote total, Guide price, Approved budget and RFQ item Quantity. Money fields show a KES prefix inside the box. Values are still saved as plain numbers.

## v1.1.7 (25 Nov 2026)
- Help is now role-aware. Suppliers see only supplier help: MajiMap for suppliers, Find opportunities, Ask the buyer a question, Quote as a supplier, Track your quotes, Manage your catalogue, How buyers see you, Update your profile, Search help and Contact support (supplier versions). Opening a county-only article link as a supplier lands on the supplier help. County, utility and NGO users see the same help as before.

## v1.1.6 (24 Nov 2026)
- Fixed: typing in "Ask a question" (supplier RFQ) lost focus after every letter. The Questions panel was rebuilt as a new component on each keystroke; it now renders in place. Same fix applied to the buyer's Questions panel and the project milestone rows.

## v1.1.5 (24 Nov 2026)
- Landing hero and "Why MajiMap" copy now follow the agreed simple explanation: "Plan, build and look after water projects in one place."
- Hero cards now show the four parts (Water Atlas, Project tracking, Maji Market, Community reporting), and a "Built for" row names who it is for: county water departments, water companies, NGOs, contractors, equipment suppliers and residents.

## v1.1.4 (24 Nov 2026)
- Landing hero rewritten so MajiMap reads as the whole delivery platform, not a repair tool: new headline and lead, and the hero cards now show find the gap (Water Atlas), plan and source (Projects and Maji Market), deliver and verify.
- "Why MajiMap", "How it works" and module copy no longer frame everything as a repair; the borehole walk-through is labelled as one example.

## v1.1.3 (24 Nov 2026)
- Landing page: the two resident phone frames are no longer clipped. The images now have transparent corners with the full bezel and side buttons, and the frames use a drop shadow instead of a rounded crop.

## v1.1.2 · 24 Nov 2026 · Organisation menu

- The organisation menu is now the same width as the organisation box when the sidebar is open, and opens beside the icon when it is collapsed. Each organisation shows its name with the role on a second line, instead of one long cut-off line.
- The changelog now also sits at the end of README.md. `npm run build` copies CHANGELOG.md into it, so the two always match.

---

## v1.1.1 · 24 Nov 2026 · Menus, date picker, alerts

- New date picker in place of the browser's own calendar, on all 7 date fields (Needed by, Quotes close on, Valid until, Start date, End date, milestone Due dates). It opens at the full width of its field, uses MajiMap tokens in both themes, marks today, blocks dates before a minimum where one applies (End date after Start date; RFQ dates from today), and works by keyboard (arrows, Page Up / Page Down, Enter, Escape). Dates can also be typed as 24 Nov 2026 or 24/11/2026; anything else shows an error.
- One-line alerts (no title) now centre the icon and the text.

- All dropdown menus (organisation switcher, row actions, Manage) now float above the page instead of inside their container, so the collapsed sidebar and sideways-scrolling tables can no longer clip them.
- With the sidebar collapsed, the organisation menu opens to the right of the organisation icon.
- Menus follow their button when the page or a table scrolls, flip upwards near the bottom of the window, and stay inside the screen edges.

---

## v1.1 · 24 Nov 2026 · Supplier view

Checked in a headless browser at 1440, 1024 and 390 wide: no sideways overflow, no console errors, and a scripted run (supplier signs in, validation errors, submits a quote, asks a question, adds a product; buyer then sees the fifth quote in the comparison and the new question).

- Second demo person: Joseph Musau, Nzaui Solar & Pumps (sign in with an email containing `nzaui`, or from the Demo panel).
- Suppliers see only Maji Market and Help: Opportunities, My quotes, Catalogue, Messages, RFQ detail, submit / save draft / withdraw quotation, ask a question, public profile preview.
- Buyers only see quotations that were submitted (drafts and withdrawn quotes stay hidden). A submitted quote adds a notification to the buyer's bell.
- Help: new article "Quote as a supplier".

---

## v1.0 · 24 Nov 2026 · First build (desktop modules)

Checked in a headless browser at 1440, 1024 and 390 wide, Maji Light and Maji Dark: no sideways page overflow, no console errors, and a scripted run through sign in, no access, register asset, export, asset profile, verify evidence, stage change, create RFQ, compare quotes, confirm fault, remove member and theme switch. Not yet tested by a person on a real phone.

- Landing page that links into the app, with the sign-in dialog and built-in sign-in help.
- Access flows, Overview, Water Atlas, Assets, Projects, Maji Market, Community reports (reviewer), Organisation, Profile and settings, Help.
- Static base map with live layers; static sample data in the browser; Demo panel (Shift + D).
- Fluid 12-column grid; sidebar collapses at 1180; drawer and one column at 720.
- Tables keep the first column in place at every width.
- Remove member uses a Danger confirm.
- Landing navy bands keep fixed brand colours in Maji Dark, so gold on navy stays at 5.19:1 (the Figma hero measured 1.29:1 in Maji Dark).

Known gaps: Kiswahili not translated; ward shapes are schematic; overview totals are fixed sample figures and do not change with the register.
