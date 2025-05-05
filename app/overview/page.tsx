import { Suspense } from "react"
import { checkAuth } from "@/lib/auth"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { DormitoryOverview } from "./components/dormitory-overview"

export default async function OverviewPage() {
  await checkAuth()

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">ภาพรวมหอพัก</h1>
      </div>

      <div className="mt-6">
        <Suspense fallback={<OverviewSkeleton />}>
          <DormitoryOverview />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}
