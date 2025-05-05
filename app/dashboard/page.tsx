import { Suspense } from "react"
import { checkAuth } from "@/lib/auth"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, DoorOpen, Users, FileText, CreditCard, Droplets } from "lucide-react"
import Link from "next/link"
import { getDormitorySummary } from "./actions"
import { RecentPayments } from "./components/recent-payments"
import { OccupancyChart } from "./components/occupancy-chart"

export default async function DashboardPage() {
  await checkAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ด</h1>
          <div className="text-sm text-muted-foreground">
            ข้อมูล ณ วันที่ {new Date().toLocaleDateString("th-TH", { dateStyle: "long" })}
          </div>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

async function DashboardContent() {
  const summary = await getDormitorySummary()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dormitories" className="transition-transform hover:scale-[1.02]">
          <Card className="border-l-4 border-l-primary hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">หอพักทั้งหมด</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.dormitoryCount}</div>
              <p className="text-xs text-muted-foreground">แห่ง</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/rooms" className="transition-transform hover:scale-[1.02]">
          <Card className="border-l-4 border-l-blue-500 hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ห้องพักทั้งหมด</CardTitle>
              <DoorOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.roomCount}</div>
              <p className="text-xs text-muted-foreground">ห้อง</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenants" className="transition-transform hover:scale-[1.02]">
          <Card className="border-l-4 border-l-green-500 hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้เช่าทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.tenantCount}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/contracts" className="transition-transform hover:scale-[1.02]">
          <Card className="border-l-4 border-l-amber-500 hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สัญญาที่ยังใช้งาน</CardTitle>
              <FileText className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeContractCount}</div>
              <p className="text-xs text-muted-foreground">สัญญา</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle>รายได้ประจำเดือน</CardTitle>
            <CardDescription>รายได้ค่าเช่าและค่าบริการในเดือนนี้</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">฿{summary.monthlyIncome.toLocaleString()}</div>
              <div className="ml-2 text-sm text-muted-foreground">บาท</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">ค่าเช่าห้อง</p>
                  <p className="text-lg font-semibold">฿{Math.round(summary.monthlyIncome * 0.8).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">ค่าน้ำ-ค่าไฟ</p>
                  <p className="text-lg font-semibold">฿{Math.round(summary.monthlyIncome * 0.2).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-500/5">
            <CardTitle>อัตราการเข้าพัก</CardTitle>
            <CardDescription>จำนวนห้องว่างและห้องที่มีผู้เช่า</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">
                {summary.vacantRoomCount} / {summary.roomCount}
              </div>
              <div className="ml-2 text-sm text-muted-foreground">ห้องว่าง</div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>อัตราการเข้าพัก</span>
                <span className="font-medium">
                  {Math.round(((summary.roomCount - summary.vacantRoomCount) / summary.roomCount) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${Math.round(((summary.roomCount - summary.vacantRoomCount) / summary.roomCount) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>การชำระเงินล่าสุด</CardTitle>
            <CardDescription>รายการชำระเงินล่าสุด 5 รายการ</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentPayments />
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>อัตราการเข้าพักแยกตามหอพัก</CardTitle>
            <CardDescription>แสดงอัตราการเข้าพักของแต่ละหอพัก</CardDescription>
          </CardHeader>
          <CardContent>
            <OccupancyChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full mt-4" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
