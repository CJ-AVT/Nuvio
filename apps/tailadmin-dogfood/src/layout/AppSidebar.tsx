import { Link } from "react-router";

export default function AppSidebar() {
  return (
    <aside
      data-rte-id="app.sidebar"
      className="w-56 shrink-0 border-r border-gray-200 bg-white p-4"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Demo
      </p>
      <nav className="space-y-1">
        <Link
          to="/"
          data-rte-id="nav.dashboard"
          className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <Link
          to="/form-elements"
          data-rte-id="nav.form-elements"
          className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Form Elements
        </Link>
        <Link
          to="/basic-tables"
          data-rte-id="nav.basic-tables"
          className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Basic Tables
        </Link>
        <Link
          to="/badge"
          className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Badges
        </Link>
      </nav>
    </aside>
  );
}
