import { Suspense } from "react"
import { checkAuth } from "@/lib/auth"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ContractList } from "./components/contract-list"
import { AddContractDialog } from "./components/add-contract-dialog"

export default async function ContractsPage() {
  await checkAuth()

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">สัญญาเช่า</h1>
        <AddContractDialog>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            เพิ่มสัญญาเช่า
          </Button>
        </AddContractDialog>
      </div>

      <div className="mt-6">
        <Suspense fallback={<ContractListSkeleton />}>
          <ContractList />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

function ContractListSkeleton() {
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
