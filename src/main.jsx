import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/pages.css";
import "./styles/landing.css";
import { navigate, query, useRoute } from "./router.js";
import { db, session } from "./db.js";
import { helpFor } from "./data/help.js";
import { ToastStack, useDb } from "./components/ui.jsx";
import { DemoPanel } from "./components/DemoPanel.jsx";
import { AcceptInvitePage, ChooseOrgPage, LoginPage, NoAccess, ResetPage } from "./pages/auth.jsx";
import { LandingPage } from "./pages/landing.jsx";
import { AppShell } from "./pages/shell.jsx";
import { OverviewPage } from "./pages/overview.jsx";
import { AssetsPage, AtlasPage } from "./pages/atlas.jsx";
import { CreateProject, HandoverPage, ProjectDetail, ProjectsPage } from "./pages/projects.jsx";
import { CompareQuotes, CreateRfq, MarketPage, RfqDetail, SupplierProfile } from "./pages/market.jsx";
import { ReportDetail, ReportsPage } from "./pages/reports.jsx";
import { OrgPage } from "./pages/org.jsx";
import { AccountPage, applyTheme } from "./pages/settings.jsx";
import { HelpPage } from "./pages/help.jsx";
import { SupplierMarket, SupplierRfq } from "./pages/supplier.jsx";

function Redirect({ to }) { useEffect(() => { navigate(to, { replace: true }); }, [to]); return null; }
const name = (col, id, f = "name") => db.collection(col).get(id)?.[f] || "Not found";

function Screen({ path }) {
  // Public pages
  if (path === "/" || path === "") return <LandingPage />;
  if (path === "/login") return <LoginPage />;
  if (path === "/session-expired") return <LoginPage expired />;
  if (path === "/reset-password") return <ResetPage />;
  if (path === "/accept-invite") return <AcceptInvitePage />;
  if (path === "/__reload") return null;

  const s = session.get();
  if (!s) return <Redirect to="/login" />;
  if (path === "/choose-organisation") return <ChooseOrgPage />;
  const org = session.org();
  if (!org) return <Redirect to="/choose-organisation" />;
  const viewer = org.role === "Viewer";
  const S = (active, crumbs, el, opts = {}) => <AppShell active={active} crumbs={crumbs} {...opts}>{el}</AppShell>;
  let m;

  // Suppliers work in Maji Market only (plus Help and their own profile)
  if (org.role === "Supplier") {
    if (path === "/market") return S("/market", [["Maji Market", "/market"], [{ quotes: "My quotes", catalogue: "Catalogue", messages: "Messages" }[query().get("tab")] || "Opportunities"]], <SupplierMarket key={query().get("tab") || "o"} />);
    if ((m = path.match(/^\/market\/rfq\/([\w-]+)$/))) return S("/market", [["Maji Market", "/market"], ["Opportunities", "/market"], [name("rfqs", m[1], "code")]], <SupplierRfq key={m[1]} id={m[1]} />);
    if ((m = path.match(/^\/market\/supplier\/([\w-]+)$/))) return S("/market", [["Maji Market", "/market"], ["Your public profile"]], <SupplierProfile key={m[1]} id={m[1]} />);
    if (path === "/account") return S("/account", [["Profile and settings", "/account"], [{ appearance: "Appearance", preferences: "Preferences", security: "Security" }[query().get("tab")] || "Profile"]], <AccountPage />);
    if ((m = path.match(/^\/help(?:\/([\w-]+))?$/))) { const H = helpFor(true); const a = H.find((h) => h.id === m[1]) || H[0]; return S("/help", [["Help", "/help"], [a.title]], <HelpPage key={a.id} id={a.id} />, { warm: true }); }
    return <Redirect to="/market" />;
  }

  if (path === "/overview") return S("/overview", [["Overview", "/overview"], ["Summary"]], <OverviewPage />);
  if (path === "/atlas") return S("/atlas", [["Water Atlas"]], <AtlasPage key={query().get("layer") || "map"} />, { map: true });
  if (path === "/assets") return S("/assets", [["Assets", "/assets"], ["Asset register"]], <AssetsPage />);

  if (path.startsWith("/projects")) {
    if (viewer) return S("/projects", [["Projects"]], <NoAccess module="Projects" />);
    if (path === "/projects") return S("/projects", [["Projects", "/projects"], ["All projects"]], <ProjectsPage />);
    if (path === "/projects/new") return S("/projects", [["Projects", "/projects"], ["New project"]], <CreateProject />);
    if ((m = path.match(/^\/projects\/([\w-]+)\/handover$/))) return S("/projects", [["Projects", "/projects"], [name("projects", m[1]), `/projects/${m[1]}`], ["Handover and close"]], <HandoverPage id={m[1]} />);
    if ((m = path.match(/^\/projects\/([\w-]+)$/))) return S("/projects", [["Projects", "/projects"], [name("projects", m[1])]], <ProjectDetail key={m[1]} id={m[1]} />);
  }
  if (path === "/market") return S("/market", [["Maji Market", "/market"], [{ products: "Products", requests: "Requests", history: "History" }[query().get("tab")] || "Suppliers"]], <MarketPage key={query().get("tab") || "suppliers"} />);
  if ((m = path.match(/^\/market\/supplier\/([\w-]+)$/))) return S("/market", [["Maji Market", "/market"], ["Suppliers", "/market"], [name("suppliers", m[1])]], <SupplierProfile key={m[1]} id={m[1]} />);
  if (path === "/market/rfq/new") return S("/market", [["Maji Market", "/market"], ["New RFQ"]], <CreateRfq />);
  if ((m = path.match(/^\/market\/rfq\/([\w-]+)\/compare$/))) return S("/market", [["Maji Market", "/market"], [name("rfqs", m[1], "code"), `/market/rfq/${m[1]}`], ["Compare quotations"]], <CompareQuotes id={m[1]} />);
  if ((m = path.match(/^\/market\/rfq\/([\w-]+)$/))) return S("/market", [["Maji Market", "/market"], ["Requests", "/market?tab=requests"], [name("rfqs", m[1], "code")]], <RfqDetail key={m[1]} id={m[1]} />);

  if (path === "/reports") return S("/reports", [["Community reports", "/reports"], ["Report queue"]], <ReportsPage />);
  if (path === "/reports/map") return S("/reports", [["Community reports", "/reports"], ["Reports map"]], <AtlasPage reportsMode />, { map: true });
  if ((m = path.match(/^\/reports\/([\w-]+)$/))) return S("/reports", [["Community reports", "/reports"], [name("reports", m[1], "code")]], <ReportDetail key={m[1]} id={m[1]} />);

  if (path === "/settings") return <Redirect to="/settings/team" />;
  if ((m = path.match(/^\/settings\/(profile|team|sources|notifications)$/))) return S("/settings", [["Settings", "/settings"], [{ profile: "Organisation profile", team: "Team and roles", sources: "Data sources", notifications: "Notifications" }[m[1]]]], <OrgPage tab={m[1]} />);
  if (path === "/account") return S("/settings", [["Settings", "/settings"], [{ appearance: "Appearance", preferences: "Preferences", security: "Security" }[query().get("tab")] || "Profile"]], <AccountPage />);
  if ((m = path.match(/^\/help(?:\/([\w-]+))?$/))) { const H = helpFor(false); const a = H.find((h) => h.id === m[1]) || H[0]; return S("/help", [["Help", "/help"], [a.title]], <HelpPage key={a.id} id={a.id} />, { warm: true }); }

  return <Redirect to="/overview" />;
}

function App() {
  useDb(); // re-render on any data change
  applyTheme();
  useEffect(() => { const mq = window.matchMedia("(prefers-color-scheme: dark)"); const on = () => applyTheme(); mq.addEventListener?.("change", on); return () => mq.removeEventListener?.("change", on); }, []);
  const path = useRoute();
  useEffect(() => { window.scrollTo(0, 0); document.getElementById("content")?.scrollTo(0, 0); }, [path]);
  return (<><Screen path={path} /><ToastStack /><DemoPanel /></>);
}

// PWA: offline shell. Needs HTTPS (or localhost); skipped quietly otherwise.
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
window.majiDB = db; // handy for poking at the data from the browser console
createRoot(document.getElementById("root")).render(<App />);
