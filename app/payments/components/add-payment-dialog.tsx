"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { addPayment } from "../actions"
import { getContractsForPayment } from "../actions"

interface AddPaymentDialogProps {
  children: React.ReactNode
}

export function AddPaymentDialog({ children }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [contractId, setContractId] = useState("")
  const [month, setMonth] = useState("")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState("paid")
  const [paidAt, setPaidAt] = useState("")
  const [note, setNote] = useState("")
  const [contracts, setContracts] = useState<
    { id: string; tenant_name: string; room_name: string; dorm_name: string }[]
  >([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // สร้างตัวเลือกเดือน
  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return {
      value: `${year}-${month.toString().padStart(2, "0")}`,
      label: `${month.toString().padStart(2, "0")}/${year}`,
    }
  })

  useEffect(() => {
    async function loadContracts() {
      try {
        const data = await getContractsForPayment()
        setContracts(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลสัญญาเช่าได้",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      setIsLoading(true)
      loadContracts()
      // ตั้งค่าวันที่ชำระเป็นวันที่ปัจจุบัน
      const today = new Date().toISOString().split("T")[0]
      setPaidAt(today)
    }
  }, [open, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contractId) {
      toast({
        title: "กรุณาเลือกสัญญาเช่า",
        variant: "destructive",
      })
      return
    }

    if (!month) {
      toast({
        title: "กรุณาเลือกเดือน",
        variant: "destructive",
      })
      return
    }

    if (!amount) {
      toast({
        title: "กรุณาระบุจำนวนเงิน",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await addPayment({
        contractId,
        month,
        amount: Number.parseFloat(amount),
        status,
        paidAt: status === "paid" ? paidAt : null,
        note: note || null,
      })

      toast({
        title: "เพิ่มการชำระเงินสำเร็จ",
        description: "เพิ่มข้อมูลการชำระเงินเรียบร้อยแล้ว",
      })

      setContractId("")
      setMonth("")
      setAmount("")
      setStatus("paid")
      setPaidAt("")
      setNote("")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มข้อมูลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มการชำระเงิน</DialogTitle>
          <DialogDescription>กรอกข้อมูลการชำระเงินที่ต้องการเพิ่มในระบบ</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 text-center">กำลังโหลดข้อมูล...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contract">สัญญาเช่า</Label>
                <Select value={contractId} onValueChange={setContractId} required>
                  <SelectTrigger id="contract">
                    <SelectValue placeholder="เลือกสัญญาเช่า" />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.length > 0 ? (
                      contracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.room_name} - {contract.tenant_name} ({contract.dorm_name})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        ไม่พบข้อมูลสัญญาเช่า
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="month">เดือน</Label>
                <Select value={month} onValueChange={setMonth} required>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="เลือกเดือน" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="ระบุจำนวนเงิน"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">สถานะการชำระเงิน</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="เลือกสถานะการชำระเงิน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">ชำระแล้ว</SelectItem>
                    <SelectItem value="pending">รอชำระ</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {status === "paid" && (
                <div className="grid gap-2">
                  <Label htmlFor="paid-at">วันที่ชำระ</Label>
                  <Input id="paid-at" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="note">หมายเหตุ</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ระบุหมายเหตุหรือข้อมูลเพิ่มเติม"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
