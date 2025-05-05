"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getOccupancyReport } from "../actions"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function OccupancyReport() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getOccupancyReport()
        setReportData(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลรายงานได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [toast])

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (!reportData) {
    return <div>ไม่พบข้อมูลรายงาน</div>
  }

  const { totalRooms, occupiedRooms, vacantRooms, occupancyRate, dormitoryOccupancy } = reportData

  // แปลงข้อมูลสำหรับกราฟวงกลม
  const pieData = [
    { name: "ห้องที่มีผู้เช่า", value: occupiedRooms },
    { name: "ห้องว่าง", value: vacantRooms },
  ]

  const COLORS = ["#3b82f6", "#e5e7eb"]

  // แปลงข้อมูลสำหรับกราฟแยกตามหอพัก
  const dormChartData = dormitoryOccupancy.map((dorm: any) => ({
    name: dorm.name,
    ห้องที่มีผู้เช่า: dorm.occupiedRooms,
    ห้องว่าง: dorm.vacantRooms,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">จำนวนห้องทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms} ห้อง</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ห้องที่มีผู้เช่า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedRooms} ห้อง</div>
            <p className="text-xs text-muted-foreground">
              {totalRooms > 0 ? `คิดเป็น ${occupancyRate}% ของห้องทั้งหมด` : "ยังไม่มีห้องพัก"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ห้องว่าง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vacantRooms} ห้อง</div>
            <p className="text-xs text-muted-foreground">
              {totalRooms > 0 ? `คิดเป็น ${100 - occupancyRate}% ของห้องทั้งหมด` : "ยังไม่มีห้องพัก"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>อัตราการเข้าพักโดยรวม</CardTitle>
            <CardDescription>แสดงสัดส่วนห้องที่มีผู้เช่าและห้องว่าง</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {totalRooms > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} ห้อง`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">ไม่มีข้อมูลห้องพัก</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>อัตราการเข้าพักแยกตามหอพัก</CardTitle>
            <CardDescription>แสดงจำนวนห้องที่มีผู้เช่าและห้องว่างในแต่ละหอพัก</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dormitoryOccupancy.length > 0 ? (
                dormitoryOccupancy.map((dorm: any) => (
                  <div key={dorm.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{dorm.name}</h4>
                      <span className="text-sm text-muted-foreground">{dorm.occupancyRate}% เข้าพัก</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${dorm.occupancyRate}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>ห้องที่มีผู้เช่า: {dorm.occupiedRooms}</span>
                      <span>ห้องว่าง: {dorm.vacantRooms}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-[250px] items-center justify-center">
                  <p className="text-muted-foreground">ไม่มีข้อมูลหอพัก</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
