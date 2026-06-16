export function NestedMetricCard() {
  return (
    <div data-nuvio-id="metric.revenue.card" className="rounded-xl border p-4 md:p-6">
      <div className="flex items-end justify-between">
        <div>
          <p data-nuvio-id="metric.revenue.label" className="text-sm text-gray-500">
            Revenue
          </p>
          <h3 data-nuvio-id="metric.revenue.value" className="text-3xl font-bold text-gray-800">
            $20K
          </h3>
        </div>
        <span data-nuvio-id="metric.revenue.trend" className="text-sm text-emerald-500">
          +10%
        </span>
      </div>
    </div>
  );
}
