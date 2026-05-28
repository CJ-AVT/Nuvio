type Metric = { id: string; label: string; value: string };

export function MapFixture({ metrics }: { metrics: Metric[] }) {
  return (
    <div data-nuvio-id="metrics.list" className="grid gap-4 p-4">
      {metrics.map((metric) => (
        <article key={metric.id} className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">{metric.label}</p>
          <h3 className="text-2xl font-bold">{metric.value}</h3>
        </article>
      ))}
    </div>
  );
}
