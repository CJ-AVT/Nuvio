export default function Badges() {
  return (
    <div className="space-y-6">
      <h1
        data-rte-id="badges.page.title"
        className="sr-only text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
      >
        Badges
      </h1>
      <div
        data-rte-id="badges.light.card"
        className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
      >
        <h3 className="text-base font-medium text-gray-800">
          With Light Background
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <span
            data-rte-id="badges.demo.primary"
            className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-rose-100 text-rose-700"
          >
            Primary
          </span>
          <span
            data-rte-id="badges.demo.success"
            className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-rose-100 text-rose-700"
          >
            Success
          </span>
        </div>
      </div>
    </div>
  );
}
