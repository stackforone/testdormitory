"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getPaymentStatusReport } from "../actions"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"

export function PaymentStatusReport() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getPaymentStatusReport()
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

  const {
    totalPayments,
    paidCount,
    pendingCount,
    cancelledCount,
    paidRate,
    pendingRate,
    cancelledRate,
    recentPayments,
  } = reportData

  // แปลงข้อมูลสำหรับกราฟวงกลม
  const pieData = [
    { name: "ชำระแล้ว", value: paidCount },
    { name: "รอชำระ", value: pendingCount },
    { name: "ยกเลิก", value: cancelledCount },
  ]

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ชำระแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidCount} รายการ</div>
            <p className="text-xs text-muted-foreground">
              {totalPayments > 0 ? `คิดเป็น ${paidRate}% ของการชำระเงินทั้งหมด` : "ยังไม่มีข้อมูลการชำระเงิน"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">รอชำระ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount} รายการ</div>
            <p className="text-xs text-muted-foreground">
              {totalPayments > 0 ? `คิดเป็น ${pendingRate}% ของการชำระเงินทั้งหมด` : "ยังไม่มีข้อมูลการชำระเงิน"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ยกเลิก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledCount} รายการ</div>
            <p className="text-xs text-muted-foreground">
              {totalPayments > 0 ? `คิดเป็น ${cancelledRate}% ของการชำระเงินทั้งหมด` : "ยังไม่มีข้อมูลการชำระเงิน"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สถานะการชำระเงิน</CardTitle>
            <CardDescription>แสดงสัดส่วนสถานะการชำระเงินทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {totalPayments > 0 ? (
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
                    <Tooltip formatter={(value) => `${value} รายการ`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">ไม่มีข้อมูลการชำระเงิน</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การชำระเงินล่าสุด</CardTitle>
            <CardDescription>แสดงรายการชำระเงินล่าสุด 5 รายการ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {recentPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{payment.tenant_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.room_name} - {payment.month || "ไม่ระบุเดือน"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">฿{payment.amount?.toLocaleString() || 0}</p>
                        <Badge
                          variant={
                            payment.status === "paid"
                              ? "default"
                              : payment.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                          className="mt-1"
                        >
                          {payment.status === "paid" ? "ชำระแล้ว" : payment.status === "pending" ? "รอชำระ" : "ยกเลิก"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center">
                  <p className="text-muted-foreground">ไม่มีข้อมูลการชำระเงิน</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
