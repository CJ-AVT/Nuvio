import DemographicCard from "../../components/ecommerce/DemographicCard";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
export default function Home() {
  return (
    <div className="space-y-6">
      <h1
        data-rte-id="dashboard.title"
        className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
      >
        Ecommerce Dashboard
      </h1>
      <EcommerceMetrics />
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlySalesChart />
        <MonthlyTarget />
      </div>
      <StatisticsChart />
      <div className="grid gap-6 lg:grid-cols-2">
        <DemographicCard />
        <RecentOrders />
      </div>
    </div>
  );
}
