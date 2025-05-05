"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Edit, Trash2, DoorOpen, User, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { EditPaymentDialog } from "./edit-payment-dialog"
import { DeletePaymentDialog } from "./delete-payment-dialog"
import { getPayments } from "../actions"
import { formatDate } from "@/lib/utils"

type Payment = {
  id: string
  contract_id: string
  month: string | null
  amount: number | null
  status: string
  paid_at: string | null
  note: string | null
  created_at: string
  contract: {
    tenant: {
      name: string | null
    } | null
    room: {
      name: string
      dorm: {
        name: string
      } | null
    } | null
  } | null
}

export function PaymentList() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await getPayments()
        setPayments(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลการชำระเงินได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [toast])

  const handlePaymentUpdated = () => {
    getPayments().then(setPayments)
    router.refresh()
  }

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <CreditCard className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลการชำระเงิน</h3>
        <p className="mt-2 text-sm text-muted-foreground">คุณยังไม่มีข้อมูลการชำระเงินในระบบ กรุณาเพิ่มข้อมูลใหม่</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5 text-primary" />
                {payment.month ? `เดือน ${payment.month.split("-")[1]}/${payment.month.split("-")[0]}` : "ไม่ระบุเดือน"}
              </CardTitle>
              <Badge
                variant={payment.status === "paid" ? "default" : payment.status === "pending" ? "secondary" : "outline"}
              >
                {payment.status === "paid" ? "ชำระแล้ว" : payment.status === "pending" ? "รอชำระ" : "ยกเลิก"}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1">
              <DoorOpen className="h-3 w-3" />
              {payment.contract?.room?.name || "ไม่ระบุห้อง"}{" "}
              {payment.contract?.room?.dorm?.name && `(${payment.contract.room.dorm.name})`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pb-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{payment.contract?.tenant?.name || "ไม่ระบุผู้เช่า"}</span>
            </div>
            {payment.paid_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>วันที่ชำระ: {formatDate(payment.paid_at)}</span>
              </div>
            )}
            <div className="mt-2 text-xl font-bold">฿{payment.amount?.toLocaleString() || 0}</div>
            {payment.note && <p className="text-sm text-muted-foreground">{payment.note}</p>}
          </CardContent>
          <CardFooter className="flex justify-between">
            <EditPaymentDialog payment={payment} onSuccess={handlePaymentUpdated}>
              <Button variant="ghost" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                แก้ไข
              </Button>
            </EditPaymentDialog>
            <DeletePaymentDialog paymentId={payment.id} onSuccess={handlePaymentUpdated}>
              <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                ลบ
              </Button>
            </DeletePaymentDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
