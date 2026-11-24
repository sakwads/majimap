import { useEffect, useState } from "react";

// Hash routing (#/path) so the app works from a file and on GitHub Pages.
export function navigate(path, { replace = false } = {}) {
  const url = "#" + path;
  if (replace) window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function useRoute() {
  // Track the whole hash (query included) so a new ?tab= re-renders the page
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    window.addEventListener("popstate", on);
    on();
    return () => { window.removeEventListener("hashchange", on); window.removeEventListener("popstate", on); };
  }, []);
  return (hash.replace(/^#/, "") || "/").split("?")[0];
}

// Query string after the hash path, e.g. #/projects/prj_0117?tab=evidence
export const query = () => new URLSearchParams((window.location.hash.split("?")[1]) || "");
export const setQuery = (patch) => {
  const q = query(); Object.entries(patch).forEach(([k, v]) => (v == null || v === "" ? q.delete(k) : q.set(k, v)));
  const path = (window.location.hash.replace(/^#/, "") || "/").split("?")[0]; const s = q.toString();
  navigate(path + (s ? "?" + s : ""), { replace: true });
};
