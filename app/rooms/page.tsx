import { Suspense } from "react"
import { checkAuth } from "@/lib/auth"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { RoomList } from "./components/room-list"
import { AddRoomDialog } from "./components/add-room-dialog"
import { DormitorySelector } from "./components/dormitory-selector"

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: { dormId?: string }
}) {
  await checkAuth()
  const dormId = searchParams.dormId

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">จัดการห้องพัก</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DormitorySelector initialDormId={dormId} />
          {dormId && (
            <AddRoomDialog dormId={dormId}>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                เพิ่มห้องพัก
              </Button>
            </AddRoomDialog>
          )}
        </div>
      </div>

      <div className="mt-6">
        {dormId ? (
          <Suspense fallback={<RoomListSkeleton />}>
            <RoomList dormId={dormId} />
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mt-4 text-lg font-semibold">กรุณาเลือกหอพัก</h3>
            <p className="mt-2 text-sm text-muted-foreground">เลือกหอพักที่ต้องการจัดการห้องพัก</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function RoomListSkeleton() {
  return (
    <div className="space-y-4">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
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
