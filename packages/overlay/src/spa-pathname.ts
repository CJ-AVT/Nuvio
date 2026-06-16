import { useEffect, useState } from "react";

/** Track SPA pathname changes (popstate + patched history). */
export function useSpaPathname(): string {
  const [pathname, setPathname] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", sync);

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      originalPushState(...args);
      sync();
    };
    history.replaceState = (...args) => {
      originalReplaceState(...args);
      sync();
    };

    return () => {
      window.removeEventListener("popstate", sync);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return pathname;
}
