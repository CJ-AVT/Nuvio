import type { ReactElement } from "react";
import { NuvioDevShell } from "@nuvio/overlay";
export default function App(): ReactElement {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-xl space-y-16 px-6 py-20">
        <section className="space-y-3">
          <h1
            className="text-3xl tracking-tight font-bold"
            data-nuvio-id="demo.hero.title"
          >
            Nuvio v1.0
          </h1>
          <p
            className="leading-relaxed text-slate-400"
            data-nuvio-id="demo.hero.lead"
          >
            <strong className="font-medium text-slate-300">Phase 3–4</strong> —
            alpha property controls plus Phase 4 layout/effects (alignment, gap,
            width, opacity, shadow, …), Validate → Apply to disk with change
            change summary, in-memory Undo, and a dev-time source index over{" "}
            <span className="font-mono text-slate-300">data-nuvio-id</span>.
          </p>
        </section>

        <section className="space-y-4">
          <h2
            className="text-base font-bold text-slate-300"
            data-nuvio-id="demo.section.features.title"
          >
            Haider Ali
          </h2>
          <div
            className="flex flex-col gap-3 sm:flex-row"
            data-nuvio-id="demo.features.row"
          >
            <div
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900/50 p-4 mt-4"
              data-nuvio-id="demo.features.card.stable"
            >
              This is card 1
            </div>
            <div
              className="flex-1 rounded-lg border border-slate-800 p-4 bg-slate-900 m-4"
              data-nuvio-id="demo.features.card.fast"
            >
              This is Card 2
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2
            className="text-lg font-medium rounded-md text-slate-200"
            data-nuvio-id="demo.section.pricing.title"
          >
            Pricing
          </h2>
          <button
            type="button"
            className="text-sm font-medium text-white hover:bg-sky-500 rounded-xl p-2 bg-fuchsia-400"
            data-nuvio-id="demo.pricing.cta"
          >
            Button 1
          </button>
          <button
            type="button"
            className="rounded-md text-sm font-medium text-white hover:bg-sky-500 gap-4 p-2 m-4 bg-amber-950"
            data-nuvio-id="demo.pricing.cta.copy"
          >
            Button 2
          </button>
          <button
            type="button"
            className="rounded-md text-sm font-medium text-white hover:bg-sky-500 gap-4 px-4 py-2 m-2 bg-slate-900"
            data-nuvio-id="demo.pricing.cta.copy.copy"
          >
            Button 3
          </button>
        </section>

        <footer className="border-t border-slate-800 pt-8">
          <p
            className="text-xs text-slate-500 text-left"
            data-nuvio-id="demo.footer.note"
          >
            Reference demo — not production UI.
          </p>
        </footer>
      </main>
      <NuvioDevShell />
    </div>
  );
}
