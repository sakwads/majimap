// In-app help for people who use MajiMap. One short article per task, grouped like the side menu.
// s: sections [heading, paragraph or list of steps]. shot: screenshot file in public/img (optional).
// aud: who sees the article. "staff" = county, utility and NGO teams; "supplier" = supplier accounts; "both" = everyone.
const A = (id, group, title, lead, shot, caption, s, aud = "staff") => ({ id, group, title, lead, shot, caption, s, aud });
export const HELP = [
  A("what-is-majimap", "Getting started", "What is MajiMap?", "A short introduction to what MajiMap does and who it is for.", "shot-overview.jpg", "The Overview screen", [
    ["What it does", "MajiMap brings water assets, projects, supplier quotations and community reports into one map-based workspace."],
    ["Who it is for", "County water departments, utilities, NGOs, contractors and suppliers each see the parts that match their role."],
    ["How the help is organised", "The help menu follows the same order as the side menu in the app, so you can find a topic where you expect it."]]),
  A("choose-your-organisation", "Getting started", "Choose your organisation", "Pick which organisation you are working in, and switch later.", null, null, [
    ["When you sign in", "If you belong to more than one organisation, MajiMap asks which one to open. Your role can be different in each."],
    ["Switch later", ["Open the organisation box at the top of the side menu.", "Choose another organisation.", "MajiMap reloads the Overview for that organisation."]],
    ["If a module says No access", "Your role in that organisation does not include the module. Use Request access and an administrator will decide."]]),
  A("find-your-first-asset", "Getting started", "Find your first asset", "Three ways to find a borehole, kiosk, tank or pump.", "shot-atlas.jpg", "An asset selected on the Water Atlas", [
    ["Search", "Type a name, an asset ID such as MKN-BH-004217, or a ward into the search box at the top of any screen."],
    ["Use the map", ["Open Water Atlas.", "Narrow the map with the filters: place, asset type and status.", "Select a marker, then View details."]],
    ["Use the list", "Open Assets to see the register as a table you can sort, filter and export."]]),
  A("read-your-overview", "Overview", "Read your overview", "What the four numbers and four lists on the Overview mean.", "shot-overview.jpg", "The Overview screen", [
    ["The four numbers", "Operational assets, active projects, open requests for quotation and unverified reports. Select a number to open its list."],
    ["The four lists", "Projects needing attention, community reports to review, underserved areas and recent activity. Each row opens the item it names."],
    ["How fresh it is", "The line under the title shows when the figures were last updated."]]),
  A("set-up-a-new-organisation", "Overview", "Set up a new organisation", "The four first steps for a new organisation.", null, null, [
    ["The first-run checklist", "A new organisation sees a short checklist on the Overview instead of empty lists."],
    ["The steps", ["Add your first assets, or connect a register.", "Connect a data source and record its licence.", "Invite your team and give each person a role.", "Create your first project."]],
    ["You can skip around", "The steps can be done in any order. The checklist goes away once you have assets and a project."]]),
  A("explore-the-map", "Water Atlas", "Explore the map", "Move around the Water Atlas, filter it and switch layers.", "shot-atlas.jpg", "The Water Atlas with filters open", [
    ["Move and zoom", "Drag the map to move it. Use the plus and minus buttons to zoom, and the target button to go back to the whole view. With a keyboard, use the arrow keys and plus or minus."],
    ["Filter", "Filters narrow the markers by sub-county, ward, asset type and status. The number on the Filters button shows how many are on."],
    ["Layers", "Turn on Community reports to see unverified reports, Projects for open projects, and Water access by ward to see where access is thin."],
    ["What the markers mean", "Colour and shape show status, and the small badge repeats it with a symbol: a tick for operational, a triangle for needs repair, a cross for faulty and a clock for unverified."]]),
  A("read-an-asset-profile", "Water Atlas", "Read an asset profile", "What you can see and do on an asset's profile.", "shot-asset.jpg", "An asset profile", [
    ["Open it", "Select a marker and choose View details, or select an asset name in the Assets list."],
    ["The tabs", "About has the details and the source of the record. Projects lists linked projects. History shows maintenance and changes. Reports lists community reports about the asset."],
    ["Keep it current", "Use Edit asset to change status or who manages it, and Log maintenance after a repair. Every change is kept in History."]]),
  A("browse-the-asset-register", "Assets", "Browse the asset register", "Sort, filter and select assets in the register.", "shot-assets.jpg", "The asset register", [
    ["Sort and filter", "Select a column heading to sort. Use Ward, Status and Asset type to filter, or search by name or ID."],
    ["Wide tables", "On a narrow screen the Asset column stays in place while the other columns scroll sideways."],
    ["Select rows", "Tick rows to export only those assets."]]),
  A("register-an-asset", "Assets", "Register an asset", "Add a new asset to the register.", "shot-assets.jpg", "Add asset is at the top right of the register", [
    ["Steps", ["Open Assets and select Add asset.", "Enter the name, type and ward.", "Type the latitude and longitude in decimal degrees, or pick the location on the map.", "Choose ownership and status, then Register asset."]],
    ["Possible duplicate", "If another asset is already at that location, MajiMap warns you before saving. Check the existing record first."],
    ["If saving fails", "Nothing you typed is lost. Check your connection and select Try again."]]),
  A("export-assets", "Assets", "Export assets", "Download the register as a file.", null, null, [
    ["Steps", ["Open Assets and select Export.", "Choose the format and whether to export the current filters or only selected rows.", "Choose what to include, then Export.", "When the file is ready, select Download file."]],
    ["Source stays with the data", "Every export keeps the source and last-updated date of each record."]]),
  A("create-a-project", "Projects", "Create a project", "Set up a project in five short steps.", "shot-projects.jpg", "The Projects list", [
    ["Steps", ["Open Projects and select New project.", "Scope: name the project and describe the objective.", "Location: link the asset the project works on.", "Budget: enter the approved budget, funder and dates.", "Milestones: add at least one milestone with a due date.", "Review, then Submit for approval."]],
    ["Drafts", "Save draft keeps your work. Nothing is shared until you submit."],
    ["From a report", "You can also start a project from a confirmed community report. The asset is filled in for you."]]),
  A("track-progress-and-evidence", "Projects", "Track progress and evidence", "Post updates, upload photos and verify work.", "shot-project.jpg", "A project with its lifecycle and tabs", [
    ["Post an update", "On the Milestones tab select Post update, choose the milestone, enter the progress and say what was done."],
    ["Upload evidence", "On the Evidence tab select Upload evidence. Photos taken on site keep their location; a photo without a location cannot be verified."],
    ["Two-step verification", "A site inspector verifies first, then the county engineer. Either can reject with a reason so the contractor knows what to fix."],
    ["Move to the next stage", "A project moves to inspection when every milestone is done and every photo is verified. Handover has its own checklist before the project can be closed."]]),
  A("request-quotations", "Maji Market", "Request quotations", "Ask several suppliers to quote for the same items.", "shot-market.jpg", "The supplier directory", [
    ["Steps", ["Open Maji Market and select Create RFQ.", "Requirement: give a title, link the project and say where to deliver.", "Items: add each item with a quantity and a measurable specification.", "Suppliers: choose who to send it to and when quotes close.", "Review, then Publish RFQ."]],
    ["Add from the catalogue", "On the Products tab, Add to RFQ puts a product into your draft with its key specifications."],
    ["What publishing means", "Publishing asks for quotations. It does not award a contract."]]),
  A("compare-quotes", "Maji Market", "Compare quotes", "Compare quotations side by side and note your preference.", "shot-compare.jpg", "The comparison table", [
    ["Open the comparison", "Open the RFQ and select Compare quotes."],
    ["Read the table", "Each column is a supplier. Rows show the total, how many items match the specification, delivery time, warranty and how long the quote is valid."],
    ["Shortlist and prefer", "Shortlist the quotes worth a closer look, then mark one as preferred."],
    ["Preferred is not an award", "Preferred is a note for your team. Award the contract through your own procurement process."]]),
  A("quote-as-a-supplier", "Maji Market", "Quote as a supplier", "Find open requests, ask questions and send a quotation.", null, null, [
    ["Opportunities", "Open RFQs in your categories, and RFQs a buyer invited you to, are listed under Opportunities in Maji Market."],
    ["Send a quotation", ["Open the RFQ and read the items and their specifications.", "Ask a question if anything is unclear. The answer is shared with every supplier, and who asked is never shown.", "Select Submit quotation, enter the total including VAT and tick the items you can supply to the specification.", "Set how long the price holds, then submit. You can save a draft and finish later."]],
    ["After you submit", "The buyer can see your quotation and compare it with others. You can withdraw it until quotes close. A quotation is not a contract: buyers award through their own procurement process."],
    ["Your catalogue", "List your products with a guide price and stock status so buyers can find you."]], "both"),
  A("maji-market-for-suppliers", "Getting started", "MajiMap for suppliers", "What you can do in MajiMap as a supplier.", null, null, [
    ["What MajiMap is", "Counties, water companies and NGOs use MajiMap to plan, build and look after water projects. When they need equipment or services, they post a request for quotation (RFQ) in Maji Market."],
    ["What you can do", "See open RFQs in your categories and any you were invited to, ask the buyer questions before you quote, send, save and withdraw quotations, and keep a catalogue of your products so buyers can find you."],
    ["What it is not", "A quotation in MajiMap is not a tender award or a contract. Buyers award through their own procurement process, which may ask you for more documents."]], "supplier"),
  A("find-opportunities", "Maji Market", "Find opportunities", "See which RFQs you can quote on.", null, null, [
    ["Where they are", "Open Maji Market. The Opportunities tab lists open RFQs in the categories you serve, and any RFQ a buyer invited you to."],
    ["Narrow the list", "Search by title or RFQ code, or filter by category and by when quotes close."],
    ["Open one", "Select an RFQ to read the items, specifications, delivery place and the date quotes close."]], "supplier"),
  A("ask-the-buyer-a-question", "Maji Market", "Ask the buyer a question", "Check a detail before you quote.", null, null, [
    ["Steps", ["Open the RFQ and choose the Questions tab.", "Type your question in a sentence, up to 500 characters.", "Select Send question."]],
    ["Who sees it", "Every answer is shared with all suppliers quoting on the RFQ, so everyone quotes on the same facts. Who asked is never shown."],
    ["When questions close", "Questions close 2 days before quotes close. Answers also appear on the Messages tab."]], "supplier"),
  A("track-your-quotes", "Maji Market", "Track your quotes", "See the state of every quotation you started.", null, null, [
    ["My quotes", "The My quotes tab lists each quotation with its RFQ, total and state."],
    ["What the states mean", "Draft, not sent: only you can see it; open it and select Finish quotation. Submitted: the buyer can see it and compare it with others. Withdrawn: the buyer can no longer see it."],
    ["Change your mind", "You can withdraw a submitted quotation until quotes close."]], "supplier"),
  A("manage-your-catalogue", "Maji Market", "Manage your catalogue", "List your products so buyers can find you.", null, null, [
    ["Add a product", ["Open the Catalogue tab and select Add product.", "Enter the name, category, guide price in KES and a price note such as Excl. installation.", "Add the main specifications, for example 3 kW, 120 m head.", "Set whether it is in stock, then save."]],
    ["Keep it current", "Use Edit product when a price or stock level changes. Guide prices help buyers plan; your quotation is the price that counts."]], "supplier"),
  A("how-buyers-see-you", "Maji Market", "How buyers see you", "Preview your public supplier profile.", null, null, [
    ["Preview it", "In Maji Market, select How buyers see you. You see the same profile a buyer sees: your company, where you deliver, your categories and your catalogue."],
    ["Verified supplier", "Verified suppliers are listed first. Verification is done by the MajiMap team; contact support if yours is pending."],
    ["Update your details", "Change your name, phone or job title in Profile and settings."]], "supplier"),
  A("review-a-report", "Community reports", "Review a report", "Check a resident's report and decide what happens next.", "shot-reports.jpg", "The report queue", [
    ["Steps", ["Open Community reports and select Review on a report.", "Read what the resident said, and check the photos and location.", "Check the AI suggestions. They are suggestions only.", "Start the review, then Confirm fault or mark it Not confirmed."]],
    ["After confirming", "Create a project for the repair, link the report to an existing project, or message the reporter."],
    ["Unverified until reviewed", "A report never changes an asset's status until someone on your team confirms it."]]),
  A("report-a-problem", "Community reports", "Report a problem", "How residents send reports from their phones.", null, null, [
    ["The resident app", "Residents use a separate, light app that opens from the QR code on a water point. It works offline and sends the report when there is signal."],
    ["What a report holds", "A photo, the location and a few words or a voice note in the resident's own language."],
    ["What residents see", "They can follow their report from Sent to Fixed, and get updates in the app and by SMS."]]),
  A("manage-your-team", "Settings", "Manage your team", "Invite people, change roles and handle access requests.", "shot-team.jpg", "Team and roles", [
    ["Invite someone", ["Open Settings, then Team and roles.", "Select Invite member.", "Enter their email, choose a role and ward access, then Send invite."]],
    ["Roles", "Administrators manage people and settings. Project engineers create and edit projects. Inspectors verify evidence. Viewers can read only."],
    ["Change or remove", "Use Manage on a member's row to change their role, suspend them or remove them. Removing asks you to confirm."],
    ["Access requests", "Requests from people who want to join are under Access requests."]]),
  A("update-your-profile", "Settings", "Update your profile", "Change your details, the theme and your password.", null, null, [
    ["Open it", "Select your name at the bottom of the side menu."],
    ["Appearance", "Choose Maji Light, Maji Dark or Match system. You can also make text larger, reduce motion and make touch targets bigger."],
    ["Security", "Change your password and sign out of other devices."]], "both"),
  A("search-help", "Search and support", "Search help", "Find things quickly in the app and in this help.", null, null, [
    ["Search the app", "The search box at the top of every screen finds assets, projects, suppliers and reports by name, ID or ward."],
    ["Browse the help", "Open a group in the help menu to see its articles. On this page lists the headings of the article you are reading."]]),
  A("search-as-a-supplier", "Search and support", "Search help", "Find RFQs and your products quickly.", null, null, [
    ["Search the app", "The search box at the top of every screen finds open RFQs by title or code, such as RFQ-MKN-0042, and the products in your catalogue."],
    ["Browse the help", "Open a group in the help menu to see its articles. On this page lists the headings of the article you are reading."]], "supplier"),
  A("contact-support", "Search and support", "Contact support", "How to reach the MajiMap team.", null, null, [
    ["Ask your administrator first", "They can change roles, ward access and data sources for your organisation."],
    ["Write to us", "Email support@majimap.example with the name of your organisation and what you were doing. This is a concept project, so the address is a placeholder."],
    ["Tell us if an article helped", "Use Yes or No at the bottom of each article."]]),
  A("contact-support-supplier", "Search and support", "Contact support", "How to reach the MajiMap team.", null, null, [
    ["Questions about an RFQ", "Ask the buyer on the RFQ's Questions tab. The answer is shared with every supplier quoting on it."],
    ["Your account or verification", "Email support@majimap.example with your company name and what you were doing. This is a concept project, so the address is a placeholder."],
    ["Tell us if an article helped", "Use Yes or No at the bottom of each article."]], "supplier"),
];
const SUPPLIER_ORDER = ["maji-market-for-suppliers", "find-opportunities", "ask-the-buyer-a-question", "quote-as-a-supplier", "track-your-quotes", "manage-your-catalogue", "how-buyers-see-you", "update-your-profile", "search-as-a-supplier", "contact-support-supplier"];
export const helpFor = (supplier) => supplier ? SUPPLIER_ORDER.map((id) => HELP.find((h) => h.id === id)) : HELP.filter((h) => h.aud !== "supplier");
export const HELP_GROUPS = [...new Set(HELP.map((h) => h.group))];
export const helpGroups = (list) => [...new Set(list.map((h) => h.group))];
