import { checkAuth } from "@/lib/auth"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncomeReport } from "./components/income-report"
import { OccupancyReport } from "./components/occupancy-report"
import { PaymentStatusReport } from "./components/payment-status-report"

export default async function ReportsPage() {
  await checkAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">รายงาน</h1>

        <Tabs defaultValue="income" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="income">รายได้</TabsTrigger>
            <TabsTrigger value="occupancy">อัตราการเข้าพัก</TabsTrigger>
            <TabsTrigger value="payment-status">สถานะการชำระเงิน</TabsTrigger>
          </TabsList>
          <TabsContent value="income" className="space-y-4">
            <IncomeReport />
          </TabsContent>
          <TabsContent value="occupancy" className="space-y-4">
            <OccupancyReport />
          </TabsContent>
          <TabsContent value="payment-status" className="space-y-4">
            <PaymentStatusReport />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
