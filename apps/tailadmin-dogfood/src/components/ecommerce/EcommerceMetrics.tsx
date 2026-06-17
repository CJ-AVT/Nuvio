export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div
        data-rte-id="metric.customers.card"
        className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400 hover:border-rose-400"
      >
        <span
          data-rte-id="metric.customers.label"
          className="text-sm font-normal text-rose-600 xl:text-sm xl:font-normal xl:text-gray-700"
        >
          Customers
        </span>
        <h4
          data-rte-id="metric.customers.value"
          className="mt-2 text-sm font-normal text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
        >
          3,782
        </h4>
      </div>
      <div
        data-rte-id="metric.orders.card"
        className="bg-slate-50 border border-rose-300 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-md hover:border-rose-400 hover:border-rose-400"
      >
        <span
          data-rte-id="metric.orders.label"
          className="text-sm font-normal text-rose-600 xl:text-sm xl:font-normal xl:text-gray-700"
        >
          Orders
        </span>
        <h4
          data-rte-id="metric.orders.value"
          className="mt-2 text-sm font-normal text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
        >
          5,390
        </h4>
      </div>
    </div>
  );
}
