import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
const tableData = [
  {
    id: 1,
    name: "MacBook Pro 13”",
    category: "Laptop",
    price: "$2,399",
    status: "Delivered",
  },
  {
    id: 2,
    name: "Apple Watch Ultra",
    category: "Watch",
    price: "$879",
    status: "Pending",
  },
  {
    id: 3,
    name: "iPhone 15 Pro Max",
    category: "Phone",
    price: "$1,869",
    status: "Delivered",
  },
];
export default function RecentOrders() {
  return (
    <div
      data-rte-id="orders.card"
      className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400 hover:border-rose-400"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3
          data-rte-id="orders.title"
          className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
        >
          Recent Orders
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            data-rte-id="orders.filter"
            className="inline-flex items-center gap-2 font-medium bg-rose-600 text-white rounded-xl px-4 py-2 xl:bg-rose-600 xl:text-white xl:rounded-xl xl:px-4 xl:py-2 hover:bg-rose-700 hover:bg-rose-700 hover:bg-rose-700"
          >
            Filter
          </button>
          <button
            type="button"
            data-rte-id="orders.seeAll"
            className="inline-flex items-center gap-2 font-medium bg-rose-600 text-white rounded-xl px-4 py-2 xl:bg-rose-600 xl:text-white xl:rounded-xl xl:px-4 xl:py-2 hover:bg-rose-700 hover:bg-rose-700 hover:bg-rose-700"
          >
            See all
          </button>
        </div>
      </div>
      <div
        data-rte-id="orders.table"
        className="overflow-x-auto max-w-full border border-rose-300 rounded-xl xl:border-gray-200"
      >
        <Table>
          <TableHeader>
            <TableRow data-rte-id="orders.header.row">
              <TableCell isHeader data-rte-id="orders.header.products">
                Products
              </TableCell>
              <TableCell isHeader data-rte-id="orders.header.category">
                Category
              </TableCell>
              <TableCell isHeader data-rte-id="orders.header.price">
                Price
              </TableCell>
              <TableCell isHeader data-rte-id="orders.header.status">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((product) => (
              <TableRow
                key={product.id}
                data-rte-id={`orders.row.${product.id}`}
              >
                <TableCell>
                  <span
                    data-rte-id={`orders.row.${product.id}.nameText`}
                    className="font-medium text-gray-800 xl:text-sm xl:font-normal xl:text-gray-600"
                  >
                    {product.name}
                  </span>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
