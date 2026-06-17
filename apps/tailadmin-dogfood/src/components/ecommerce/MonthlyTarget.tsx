export default function MonthlyTarget() {
  return (
    <div
      data-rte-id="target.monthly.card"
      className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400 hover:border-rose-400"
    >
      <h3
        data-rte-id="target.monthly.title"
        className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
      >
        Monthly Target
      </h3>
      <p
        data-rte-id="target.monthly.subtitle"
        className="mt-1 text-sm font-normal text-rose-600 xl:text-sm xl:font-normal xl:text-gray-700"
      >
        Target you&apos;ve set for each month
      </p>
      <div className="mt-4 flex h-32 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        75% progress
      </div>
    </div>
  );
}
