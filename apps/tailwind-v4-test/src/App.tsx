import { NuvioDevShell } from "@nuvio/overlay";
export default function App() {
  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-14">
        <header className="mb-10">
          <h1
            data-nuvio-id="tw4.hero.title"
            className="text-4xl font-bold tracking-tight text-white"
          >
            Tailwind v4 test app
          </h1>
          <p
            data-nuvio-id="tw4.hero.subtitle"
            className="mt-3 max-w-2xl text-base text-slate-300/90"
          >
            This fixture validates Nuvio on Tailwind v4 + Vite (no
            tailwind.config.js). Edit literal className strings, validate,
            apply, and undo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              data-nuvio-id="tw4.hero.button.primary"
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
            >
              Get started
            </button>
            <button
              data-nuvio-id="tw4.hero.button.ghost"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15"
            >
              Learn more
            </button>
          </div>
        </header>

        <section
          data-nuvio-id="tw4.grid.section"
          className="grid gap-6 md:grid-cols-2"
        >
          <div
            data-nuvio-id="tw4.card.analytics"
            className="rounded-2xl border border-white/10 bg-slate-950/30 p-6 shadow-xl shadow-black/40 backdrop-blur-md"
          >
            <h3 className="text-lg font-semibold tracking-tight">Analytics</h3>
            <p className="mt-2 text-sm text-slate-300/90">
              Try padding, radius, text color, and background utilities.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                data-nuvio-id="tw4.card.analytics.cta.primary"
                className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-sky-400"
              >
                Primary 101
              </button>
              <button
                data-nuvio-id="tw4.card.analytics.cta.secondary"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/15"
              >
                Secondary
              </button>
            </div>
          </div>

          <div
            data-nuvio-id="tw4.card.team"
            className="rounded-2xl border border-white/10 bg-slate-950/30 p-6 shadow-xl shadow-black/40 backdrop-blur-md"
          >
            <h3 className="text-lg font-semibold tracking-tight">Team</h3>
            <p className="mt-2 text-sm text-slate-300/90">
              Second card for sibling move / selection checks.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                data-nuvio-id="tw4.card.team.cta.primary"
                className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-sky-400"
              >
                Primary
              </button>
              <button
                data-nuvio-id="tw4.card.team.cta.secondary"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/15"
              >
                Secondary
              </button>
            </div>
          </div>
        </section>

        <section
          data-nuvio-id="tw4.pricing.section"
          className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <h2
            data-nuvio-id="tw4.pricing.title"
            className="text-lg font-semibold text-white"
          >
            Pricing row
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              data-nuvio-id="tw4.pricing.tier.basic"
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
            >
              Basic
            </button>
            <button
              data-nuvio-id="tw4.pricing.tier.pro"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
            >
              Pro
            </button>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2
            data-nuvio-id="tw4.footer.title"
            className="text-lg font-semibold text-white"
          >
            Dark mode wrapper (host)
          </h2>
          <p
            data-nuvio-id="tw4.footer.note"
            className="mt-2 text-sm text-slate-300/90"
          >
            Host styling should not affect Nuvio chrome (Shadow DOM +
            self-contained CSS).
          </p>
        </section>
      </main>

      <NuvioDevShell />
    </>
  );
}
