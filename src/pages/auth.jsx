import React, { useState } from "react";
import { db, session } from "../db.js";
import { seed } from "../seed.js";
import { navigate } from "../router.js";
import { Alert, Badge, Button, Checkbox, Icon, Logo, Modal, PasswordField, ProtoHint, RadioRow, TextArea, TextField, toast, wait } from "../components/ui.jsx";

const Ripple = () => (
  <svg className="ripple" viewBox="0 0 1100 1100" aria-hidden="true">{[150, 280, 410, 540].map((r) => <circle key={r} cx="550" cy="550" r={r} />)}</svg>
);
export function AuthPage({ children }) {
  return <main className="auth"><Ripple /><div className="auth__card"><a href="#/" aria-label="MajiMap home"><Logo size={36} /></a>{children}</div></main>;
}
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* Sign-in form. Used on its own page and inside the landing page dialog. */
export function SignInForm({ expired }) {
  const [email, setEmail] = useState(expired ? seed.user.email : ""); const [pw, setPw] = useState(""); const [keep, setKeep] = useState(false);
  const [err, setErr] = useState({}); const [busy, setBusy] = useState(false); const [failed, setFailed] = useState(false);
  async function submit() {
    const e = {};
    if (!validEmail(email)) e.email = "Enter an email address like name@organisation.go.ke";
    if (!pw) e.pw = "Enter your password";
    setErr(e); setFailed(false);
    if (Object.keys(e).length) return;
    setBusy(true); await wait(700); setBusy(false);
    if (pw.toLowerCase() === "wrong") { setFailed(true); return; }
    session.signIn(email.trim());
    navigate(session.supplier() ? "/market" : "/choose-organisation");
  }
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
      <div className="stack stack--xs">
        <h1 className="t-h3">{expired ? "Your session has ended" : "Sign in to MajiMap"}</h1>
        <p className="c-secondary">{expired ? "You were signed out after 30 minutes without activity. Sign in again to carry on where you left off." : "Use your organisation email to continue."}</p>
      </div>
      {failed && <Alert tone="error" title="Email or password is not right">Check both and try again, or reset your password.</Alert>}
      <TextField label="Email" type="email" autoComplete="username" placeholder="name@organisation.go.ke" value={email} onChange={setEmail} error={err.email} />
      <PasswordField label="Password" autoComplete="current-password" placeholder="Enter your password" value={pw} onChange={setPw} error={err.pw} />
      <div className="row row--between row--wrap">
        <Checkbox checked={keep} onChange={setKeep} label="Keep me signed in" />
        <a className="link" href="#/reset-password">Forgot password?</a>
      </div>
      <Button htmlType="submit" block loading={busy}>{busy ? "Signing in" : "Sign in"}</Button>
      <ProtoHint>Any email and any password sign you in as Amina Mwende. Use an email with <code>nzaui</code> in it (for example <code>joseph@nzauisolar.co.ke</code>) to sign in as a supplier instead. Type <code>wrong</code> as the password to see the error. More test values are in the <b>Demo</b> tab at the bottom of the screen (Shift + D).</ProtoHint>
      <p className="auth__foot">Need an account? Ask your organisation administrator.</p>
    </form>
  );
}
export const LoginPage = ({ expired }) => <AuthPage><SignInForm expired={expired} /></AuthPage>;

export function ResetPage() {
  const [email, setEmail] = useState(""); const [err, setErr] = useState(""); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  async function submit() { if (!validEmail(email)) return setErr("Enter the email you sign in with"); setErr(""); setBusy(true); await wait(600); setBusy(false); setSent(true); }
  return (
    <AuthPage>
      {sent ? (
        <div className="form">
          <div className="stack stack--xs"><h1 className="t-h3">Check your email</h1><p className="c-secondary">If {email} has a MajiMap account, a link to set a new password is on its way. The link works for 30 minutes.</p></div>
          <Alert tone="success" title="Reset link sent">No email after a few minutes? Check the spam folder or ask your administrator.</Alert>
          <Button block onClick={() => navigate("/login")}>Back to sign in</Button>
          <Button type="tertiary" block onClick={() => { setSent(false); toast("Reset link sent again"); setSent(true); }}>Send the link again</Button>
        </div>
      ) : (
        <form className="form" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
          <div className="stack stack--xs"><h1 className="t-h3">Reset your password</h1><p className="c-secondary">Enter your organisation email and we will send a link to set a new password.</p></div>
          <TextField label="Email" type="email" placeholder="name@organisation.go.ke" value={email} onChange={setEmail} error={err} />
          <Button htmlType="submit" block loading={busy}>Send reset link</Button>
          <ProtoHint>Any valid email works. No email is sent.</ProtoHint>
          <p className="auth__foot"><a className="link" href="#/login">Back to sign in</a></p>
        </form>
      )}
    </AuthPage>
  );
}

export function AcceptInvitePage() {
  const [name, setName] = useState("David Musyoka"); const [pw, setPw] = useState(""); const [pw2, setPw2] = useState(""); const [err, setErr] = useState({});
  function submit() {
    const e = {};
    if (!name.trim()) e.name = "Enter your full name";
    if (pw.length < 10) e.pw = "Use at least 10 characters";
    if (pw2 !== pw) e.pw2 = "The two passwords do not match";
    setErr(e); if (Object.keys(e).length) return;
    session.signIn("david.musyoka@makueni.go.ke"); session.chooseOrg("makueni"); toast("Welcome to Makueni County Water Department"); navigate("/overview");
  }
  return (
    <AuthPage>
      <form className="form" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        <div className="stack stack--xs"><h1 className="t-h3">Join Makueni County Water Department</h1><p className="c-secondary">Peter Mutua invited you as an Inspector for Kasikeu ward. Set a password to finish.</p></div>
        <TextField label="Email" value="david.musyoka@makueni.go.ke" disabled />
        <TextField label="Full name" value={name} onChange={setName} error={err.name} />
        <PasswordField label="Password" value={pw} onChange={setPw} error={err.pw} helper="At least 10 characters." autoComplete="new-password" />
        <PasswordField label="Confirm password" value={pw2} onChange={setPw2} error={err.pw2} autoComplete="new-password" />
        <Button htmlType="submit" block>Accept invite</Button>
        <ProtoHint>Any password of 10 characters or more works, as long as both fields match.</ProtoHint>
      </form>
    </AuthPage>
  );
}

export function ChooseOrgPage() {
  const orgs = session.orgs(); const [pick, setPick] = useState(session.get()?.orgId || orgs[0].id);
  const org = orgs.find((o) => o.id === pick) || orgs[0];
  return (
    <AuthPage>
      <div className="form">
        <div className="stack stack--xs"><h1 className="t-h3">Choose an organisation</h1><p className="c-secondary">You belong to more than one. Pick the one to work in. You can switch later.</p></div>
        <div className="stack stack--sm" role="radiogroup" aria-label="Organisation">
          {orgs.map((o) => (
            <RadioRow key={o.id} name="org" checked={pick === o.id} onChange={() => setPick(o.id)} className={`org-row ${pick === o.id ? "org-row--on" : ""}`}>
              <span className="icon-chip icon-chip--brand"><Icon name="building" size={18} /></span>
              <span className="tbl__two grow"><span className="t-label">{o.name}</span><span>{o.place}</span></span>
              <Badge>{o.role}</Badge>
            </RadioRow>
          ))}
        </div>
        <Button block onClick={() => { session.chooseOrg(pick); navigate("/overview"); }}>Continue as {org.role}</Button>
        <ProtoHint>Pick <b>Kilungu Water Association</b> (Viewer) to see the No access screen when you open Projects.</ProtoHint>
        <p className="auth__foot">Signed in as {session.user()?.email}</p>
      </div>
    </AuthPage>
  );
}

/* Shown inside the app shell when the role in this organisation cannot open a module */
export function NoAccess({ module = "Projects" }) {
  const [open, setOpen] = useState(false); const [note, setNote] = useState(""); const org = session.org(); const sent = db.get("accessRequested");
  return (
    <div className="card card--pad-xl narrow" style={{ marginTop: 48, alignItems: "center", textAlign: "center" }}>
      <span className="empty__icon"><Icon name="lock" size={28} /></span>
      <h1 className="t-h3">You do not have access to {module}</h1>
      <p className="c-secondary">Your role in {org.name} is {org.role}. {module} is open to project engineers, inspectors and administrators.</p>
      {sent ? <Alert tone="success" title="Request sent">An administrator of {org.name} will review it. You will get a notification when they decide.</Alert>
        : <div className="row row--wrap" style={{ justifyContent: "center" }}><Button type="secondary" onClick={() => navigate("/overview")}>Back to Overview</Button><Button onClick={() => setOpen(true)}>Request access</Button></div>}
      {sent && <Button type="secondary" onClick={() => navigate("/overview")}>Back to Overview</Button>}
      {open && (
        <Modal title={`Request access to ${module}`} onClose={() => setOpen(false)} footer={<><Button type="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { db.set("accessRequested", true); setOpen(false); toast("Access request sent"); }}>Send request</Button></>}>
          <p className="c-secondary">Your request goes to the administrators of {org.name}.</p>
          <TextField label="Role you need" value="Project engineer" disabled />
          <TextArea label="Why do you need it?" optional value={note} onChange={setNote} max={300} placeholder="For example: I manage the Kilungu kiosk repairs." />
        </Modal>
      )}
    </div>
  );
}
