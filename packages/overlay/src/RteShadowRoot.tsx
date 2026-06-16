import { useEffect, useState } from "react";
import { RTE_SHADOW_HOST_ID } from "./rte-chrome-hit.js";
import { getOverlayCssHref, getOverlayCssMode } from "./load-overlay-styles.js";

export type RteShadowMount = {
  host: HTMLElement;
  mount: HTMLElement;
};

export function useRteShadowMount(): RteShadowMount | null {
  const [mount, setMount] = useState<RteShadowMount | null>(null);

  useEffect(() => {
    const host = document.createElement("div");
    host.id = RTE_SHADOW_HOST_ID;
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2147483000";
    host.style.pointerEvents = "none";
    host.style.background = "transparent";

    const shadow = host.attachShadow({ mode: "open" });
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = getOverlayCssHref();
    link.setAttribute("data-rte-overlay-css-mode", getOverlayCssMode());
    shadow.appendChild(link);

    const portalMount = document.createElement("div");
    portalMount.className = "rte-shadow-mount";
    shadow.appendChild(portalMount);

    document.body.appendChild(host);
    setMount({ host, mount: portalMount });

    return () => {
      setMount(null);
      host.remove();
    };
  }, []);

  return mount;
}
