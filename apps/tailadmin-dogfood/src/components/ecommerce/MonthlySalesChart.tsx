export default function MonthlySalesChart() {
  return (
    <div
      data-rte-id="chart.monthly.card"
      className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400 hover:border-rose-400"
    >
      <h3
        data-rte-id="chart.monthly.title"
        className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
      >
        Monthly Sales
      </h3>
      <div className="mt-4 flex h-40 items-end gap-2">
        {[40, 65, 45, 80, 55, 70].map((h) => (
          <div
            key={h}
            className="flex-1 rounded bg-rose-200"
            style={{
              height: `${h}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
