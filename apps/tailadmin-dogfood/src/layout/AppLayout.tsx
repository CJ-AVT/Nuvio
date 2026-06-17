import { RteDevShell } from "@rte/overlay";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <RteDevShell />
    </div>
  );
}
