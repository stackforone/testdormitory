"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getIncomeReport } from "../actions"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function IncomeReport() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getIncomeReport()
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

  const { monthlyIncome, totalIncome, pendingIncome, paidIncome } = reportData

  // แปลงข้อมูลสำหรับกราฟ
  const chartData = monthlyIncome.map((item: any) => ({
    month: `${item.month.split("-")[1]}/${item.month.split("-")[0].substring(2)}`,
    รายได้: item.amount,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">รายได้ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">รวมทั้งที่ชำระแล้วและรอชำระ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">รายได้ที่ชำระแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{paidIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalIncome > 0 ? `คิดเป็น ${Math.round((paidIncome / totalIncome) * 100)}% ของรายได้ทั้งหมด` : "ยังไม่มีรายได้"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">รายได้ที่รอชำระ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{pendingIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalIncome > 0
                ? `คิดเป็น ${Math.round((pendingIncome / totalIncome) * 100)}% ของรายได้ทั้งหมด`
                : "ยังไม่มีรายได้"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายได้รายเดือน</CardTitle>
          <CardDescription>แสดงรายได้ทั้งหมดในแต่ละเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `฿${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="รายได้" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">ไม่มีข้อมูลรายได้</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
