import { NuvioDevShell } from "@nuvio/overlay";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-lg px-6 py-16 space-y-6">
        <h1
          className="text-3xl font-bold tracking-tight"
          data-nuvio-id="page.title"
        >
          Welcome to nuvio
        </h1>
        <p className="text-slate-600 leading-relaxed">
          Turn <strong>Edit on</strong>, click this title or the paragraph below,
          then use <strong>Make Editable</strong> on untagged text.
        </p>
        <p className="text-slate-500">
          No manual <code className="text-sm">data-nuvio-id</code> required for your
          first edit.
        </p>
      </main>
      <NuvioDevShell />
    </div>
  );
}
