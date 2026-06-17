export default function DemographicCard() {
  return (
    <div
      data-rte-id="demo.card"
      className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400 hover:border-rose-400"
    >
      <h3
        data-rte-id="demo.title"
        className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
      >
        Customers Demographic
      </h3>
      <p
        data-rte-id="demo.subtitle"
        className="mt-1 text-sm font-normal text-rose-600 xl:text-sm xl:font-normal xl:text-gray-700"
      >
        Number of customers by country
      </p>
      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        <li>USA — 2,379</li>
        <li>France — 589</li>
        <li>Japan — 139</li>
      </ul>
    </div>
  );
}
