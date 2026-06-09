import { NuvioDevShell } from "@nuvio/overlay";
import { Button } from "./components/ui/button.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card.js";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <h1
          className="text-xl font-semibold"
          data-nuvio-id="dashboard.title"
        >
          shadcn dashboard
        </h1>
        <Button data-nuvio-id="dashboard.export.button">Export</Button>
      </header>
      <main className="mx-auto max-w-4xl p-6 grid gap-4 sm:grid-cols-2">
        <Card data-nuvio-id="dashboard.revenue.card">
          <CardHeader>
            <CardTitle data-nuvio-id="dashboard.revenue.title">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold"
              data-nuvio-id="dashboard.revenue.value"
            >
              $12,450
            </p>
            <p className="text-sm text-slate-500 mt-1">+8% from last month</p>
          </CardContent>
        </Card>
        <Card data-nuvio-id="dashboard.orders.card">
          <CardHeader>
            <CardTitle data-nuvio-id="dashboard.orders.title">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold"
              data-nuvio-id="dashboard.orders.value"
            >
              248
            </p>
          </CardContent>
        </Card>
      </main>
      <NuvioDevShell />
    </div>
  );
}
