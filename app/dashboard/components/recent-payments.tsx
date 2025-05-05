"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getRecentPayments } from "../actions"

export function RecentPayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await getRecentPayments()
        setPayments(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลการชำระเงินล่าสุดได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-12 mt-1" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (payments.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">ไม่พบข้อมูลการชำระเงิน</div>
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{payment.tenant_name || "ไม่ระบุชื่อ"}</p>
            <p className="text-xs text-muted-foreground">
              {payment.room_name || "ไม่ระบุห้อง"} - {payment.month || "ไม่ระบุเดือน"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">฿{payment.amount?.toLocaleString() || 0}</p>
            <Badge
              variant={payment.status === "paid" ? "default" : payment.status === "pending" ? "secondary" : "outline"}
              className="mt-1"
            >
              {payment.status === "paid" ? "ชำระแล้ว" : payment.status === "pending" ? "รอชำระ" : "ยกเลิก"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
