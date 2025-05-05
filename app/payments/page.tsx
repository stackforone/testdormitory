import { Suspense } from "react"
import { checkAuth } from "@/lib/auth"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { PaymentList } from "./components/payment-list"
import { AddPaymentDialog } from "./components/add-payment-dialog"

export default async function PaymentsPage() {
  await checkAuth()

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">การชำระเงิน</h1>
        <AddPaymentDialog>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            เพิ่มการชำระเงิน
          </Button>
        </AddPaymentDialog>
      </div>

      <div className="mt-6">
        <Suspense fallback={<PaymentListSkeleton />}>
          <PaymentList />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

function PaymentListSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
