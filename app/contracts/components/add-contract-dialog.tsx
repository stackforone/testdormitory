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
import { useToast } from "@/components/ui/use-toast"
import { addContract } from "../actions"
import { getTenants } from "@/app/tenants/actions"
import { getRoomsForContract } from "../actions"

interface AddContractDialogProps {
  children: React.ReactNode
}

export function AddContractDialog({ children }: AddContractDialogProps) {
  const [open, setOpen] = useState(false)
  const [tenantId, setTenantId] = useState("")
  const [roomId, setRoomId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [deposit, setDeposit] = useState("")
  const [status, setStatus] = useState("active")
  const [tenants, setTenants] = useState<{ id: string; name: string | null }[]>([])
  const [rooms, setRooms] = useState<{ id: string; name: string; dorm_name: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const [tenantsData, roomsData] = await Promise.all([getTenants(), getRoomsForContract()])
        setTenants(tenantsData)
        setRooms(roomsData)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      setIsLoading(true)
      loadData()
    }
  }, [open, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tenantId) {
      toast({
        title: "กรุณาเลือกผู้เช่า",
        variant: "destructive",
      })
      return
    }

    if (!roomId) {
      toast({
        title: "กรุณาเลือกห้องพัก",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await addContract({
        tenantId,
        roomId,
        startDate: startDate || null,
        endDate: endDate || null,
        deposit: deposit ? Number.parseFloat(deposit) : null,
        status,
      })

      toast({
        title: "เพิ่มสัญญาเช่าสำเร็จ",
        description: "เพิ่มสัญญาเช่าเรียบร้อยแล้ว",
      })

      setTenantId("")
      setRoomId("")
      setStartDate("")
      setEndDate("")
      setDeposit("")
      setStatus("active")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสัญญาเช่าได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มสัญญาเช่าใหม่</DialogTitle>
          <DialogDescription>กรอกข้อมูลสัญญาเช่าที่ต้องการเพิ่มในระบบ</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 text-center">กำลังโหลดข้อมูล...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tenant">ผู้เช่า</Label>
                <Select value={tenantId} onValueChange={setTenantId} required>
                  <SelectTrigger id="tenant">
                    <SelectValue placeholder="เลือกผู้เช่า" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.length > 0 ? (
                      tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name || "ไม่ระบุชื่อ"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        ไม่พบข้อมูลผู้เช่า
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room">ห้องพัก</Label>
                <Select value={roomId} onValueChange={setRoomId} required>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="เลือกห้องพัก" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.length > 0 ? (
                      rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} ({room.dorm_name})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        ไม่พบข้อมูลห้องพัก
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date">วันที่เริ่มสัญญา</Label>
                  <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date">วันที่สิ้นสุดสัญญา</Label>
                  <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deposit">เงินประกัน (บาท)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="ระบุจำนวนเงิน"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">สถานะสัญญา</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="เลือกสถานะสัญญา" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="expired">หมดอายุ</SelectItem>
                      <SelectItem value="cancelled">ยกเลิก</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
