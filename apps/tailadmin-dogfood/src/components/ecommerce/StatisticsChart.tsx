export default function StatisticsChart() {
  return (
    <div
      data-rte-id="chart.sales"
      className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400 hover:border-rose-400"
    >
      <h3
        data-rte-id="chart.sales.title"
        className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
      >
        Statistics
      </h3>
      <p
        data-rte-id="chart.sales.subtitle"
        className="mt-1 text-sm font-normal text-rose-600 xl:text-sm xl:font-normal xl:text-gray-700"
      >
        Revenue overview for the last 12 months
      </p>
      <div className="mt-4 h-40 rounded-lg bg-gradient-to-r from-rose-100 to-rose-50" />
    </div>
  );
}
