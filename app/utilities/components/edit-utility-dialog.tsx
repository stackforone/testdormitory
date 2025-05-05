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
import { updateUtility } from "../actions"
import { getRoomsForUtility } from "../actions"

interface EditUtilityDialogProps {
  children: React.ReactNode
  utility: {
    id: string
    room_id: string
    month: string | null
    water_unit: number | null
    electricity_unit: number | null
    water_rate: number | null
    electricity_rate: number | null
  }
  onSuccess?: () => void
}

export function EditUtilityDialog({ children, utility, onSuccess }: EditUtilityDialogProps) {
  const [open, setOpen] = useState(false)
  const [roomId, setRoomId] = useState(utility.room_id)
  const [month, setMonth] = useState(utility.month || "")
  const [waterUnit, setWaterUnit] = useState(utility.water_unit?.toString() || "")
  const [electricityUnit, setElectricityUnit] = useState(utility.electricity_unit?.toString() || "")
  const [waterRate, setWaterRate] = useState(utility.water_rate?.toString() || "18")
  const [electricityRate, setElectricityRate] = useState(utility.electricity_rate?.toString() || "8")
  const [rooms, setRooms] = useState<{ id: string; name: string; dorm_name: string }[]>([])
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
    async function loadRooms() {
      try {
        const data = await getRoomsForUtility()
        setRooms(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลห้องพักได้",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      setIsLoading(true)
      loadRooms()
    }
  }, [open, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomId) {
      toast({
        title: "กรุณาเลือกห้องพัก",
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

    setIsSubmitting(true)

    try {
      await updateUtility({
        id: utility.id,
        roomId,
        month,
        waterUnit: waterUnit ? Number.parseInt(waterUnit) : null,
        electricityUnit: electricityUnit ? Number.parseInt(electricityUnit) : null,
        waterRate: waterRate ? Number.parseFloat(waterRate) : null,
        electricityRate: electricityRate ? Number.parseFloat(electricityRate) : null,
      })

      toast({
        title: "แก้ไขค่าน้ำ-ค่าไฟสำเร็จ",
        description: "แก้ไขข้อมูลค่าน้ำ-ค่าไฟเรียบร้อยแล้ว",
      })

      setOpen(false)
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขข้อมูลค่าน้ำ-ค่าไฟได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>แก้ไขค่าน้ำ-ค่าไฟ</DialogTitle>
          <DialogDescription>แก้ไขข้อมูลค่าน้ำ-ค่าไฟตามที่ต้องการ</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 text-center">กำลังโหลดข้อมูล...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="water-unit">หน่วยน้ำ</Label>
                  <Input
                    id="water-unit"
                    type="number"
                    value={waterUnit}
                    onChange={(e) => setWaterUnit(e.target.value)}
                    placeholder="ระบุหน่วยน้ำ"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="water-rate">ราคาต่อหน่วย (บาท)</Label>
                  <Input
                    id="water-rate"
                    type="number"
                    value={waterRate}
                    onChange={(e) => setWaterRate(e.target.value)}
                    placeholder="ระบุราคาต่อหน่วย"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="electricity-unit">หน่วยไฟ</Label>
                  <Input
                    id="electricity-unit"
                    type="number"
                    value={electricityUnit}
                    onChange={(e) => setElectricityUnit(e.target.value)}
                    placeholder="ระบุหน่วยไฟ"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="electricity-rate">ราคาต่อหน่วย (บาท)</Label>
                  <Input
                    id="electricity-rate"
                    type="number"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(e.target.value)}
                    placeholder="ระบุราคาต่อหน่วย"
                  />
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
