export function NestedMetricCard() {
  return (
    <div data-rte-id="metric.revenue.card" className="rounded-xl border p-4 md:p-6">
      <div className="flex items-end justify-between">
        <div>
          <p data-rte-id="metric.revenue.label" className="text-sm text-gray-500">
            Revenue
          </p>
          <h3 data-rte-id="metric.revenue.value" className="text-3xl font-bold text-gray-800">
            $20K
          </h3>
        </div>
        <span data-rte-id="metric.revenue.trend" className="text-sm text-emerald-500">
          +10%
        </span>
      </div>
    </div>
  );
}
