"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getDormitoryOverview } from "../actions"
import { Badge } from "@/components/ui/badge"
import { Building2, DoorOpen, Users } from "lucide-react"

export function DormitoryOverview() {
  const [overviewData, setOverviewData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadOverview() {
      try {
        const data = await getDormitoryOverview()
        setOverviewData(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลภาพรวมหอพักได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadOverview()
  }, [toast])

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (!overviewData || overviewData.dormitories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Building2 className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลหอพัก</h3>
        <p className="mt-2 text-sm text-muted-foreground">คุณยังไม่มีหอพักในระบบ กรุณาเพิ่มหอพักใหม่</p>
      </div>
    )
  }

  const { dormitories } = overviewData

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">จำนวนหอพัก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dormitories.length} หอพัก</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">จำนวนห้องทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dormitories.reduce((sum, dorm) => sum + dorm.totalRooms, 0)} ห้อง</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">จำนวนผู้เช่าทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dormitories.reduce((sum, dorm) => sum + dorm.tenantCount, 0)} คน</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={dormitories[0]?.id}>
        <TabsList className="mb-4 w-full overflow-x-auto">
          {dormitories.map((dorm: any) => (
            <TabsTrigger key={dorm.id} value={dorm.id}>
              {dorm.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {dormitories.map((dorm: any) => (
          <TabsContent key={dorm.id} value={dorm.id}>
            <DormitoryDetail dormitory={dorm} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function DormitoryDetail({ dormitory }: { dormitory: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dormitory.name}</CardTitle>
          <CardDescription>{dormitory.location || "ไม่ระบุที่อยู่"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">ห้องพักทั้งหมด</p>
                <p className="text-lg font-bold">{dormitory.totalRooms} ห้อง</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">ผู้เช่าทั้งหมด</p>
                <p className="text-lg font-bold">{dormitory.tenantCount} คน</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">อัตราการเข้าพัก</p>
              <p className="text-lg font-bold">
                {dormitory.occupancyRate}% ({dormitory.occupiedRooms}/{dormitory.totalRooms})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการห้องพัก</CardTitle>
          <CardDescription>แสดงรายการห้องพักทั้งหมดในหอพัก {dormitory.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {dormitory.rooms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dormitory.rooms.map((room: any) => (
                <Card key={room.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">{room.name}</CardTitle>
                      <Badge
                        variant={room.status === "ว่าง" ? "outline" : room.status === "ไม่ว่าง" ? "default" : "secondary"}
                      >
                        {room.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {room.floor && `ชั้น ${room.floor}`}
                      {room.type && room.floor && " • "}
                      {room.type && `ประเภท: ${room.type}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">ราคาเช่า</p>
                        <p className="font-medium">
                          {room.price ? `฿${room.price.toLocaleString()} / เดือน` : "ไม่ระบุราคา"}
                        </p>
                      </div>
                      {room.tenant && (
                        <div>
                          <p className="text-sm text-muted-foreground">ผู้เช่า</p>
                          <p className="font-medium">{room.tenant.name || "ไม่ระบุชื่อ"}</p>
                          {room.tenant.phone && <p className="text-xs text-muted-foreground">{room.tenant.phone}</p>}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <DoorOpen className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลห้องพัก</h3>
              <p className="mt-2 text-sm text-muted-foreground">หอพักนี้ยังไม่มีห้องพัก กรุณาเพิ่มห้องพักใหม่</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
