import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
const rows = [
  {
    name: "John Doe",
    role: "Admin",
    status: "Active",
  },
  {
    name: "Jane Smith",
    role: "Editor",
    status: "Pending",
  },
];
export default function BasicTables() {
  return (
    <div className="space-y-6">
      <h2
        data-rte-id="tables.page.title"
        className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
      >
        Basic Tables
      </h2>
      <div
        data-rte-id="tables.basic.card"
        className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
      >
        <h3
          data-rte-id="tables.basic.title"
          className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
        >
          Basic Table 1
        </h3>
        <div
          data-rte-id="tables.basic.table"
          className="mt-4 overflow-x-auto max-w-full border border-rose-300 rounded-xl"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Role</TableCell>
                <TableCell isHeader>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
