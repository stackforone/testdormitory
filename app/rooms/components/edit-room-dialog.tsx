"use client"

import type React from "react"

import { useState } from "react"
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
import { updateRoom } from "../actions"

interface EditRoomDialogProps {
  children: React.ReactNode
  room: {
    id: string
    name: string
    floor: number | null
    type: string | null
    price: number | null
    status: string
  }
  onSuccess?: () => void
}

export function EditRoomDialog({ children, room, onSuccess }: EditRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(room.name)
  const [floor, setFloor] = useState(room.floor?.toString() || "")
  const [type, setType] = useState(room.type || "")
  const [price, setPrice] = useState(room.price?.toString() || "")
  const [status, setStatus] = useState(room.status)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "กรุณาระบุชื่อห้อง",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await updateRoom({
        id: room.id,
        name,
        floor: floor ? Number.parseInt(floor) : null,
        type: type || null,
        price: price ? Number.parseFloat(price) : null,
        status,
      })

      toast({
        title: "แก้ไขห้องพักสำเร็จ",
        description: `แก้ไขข้อมูลห้องพัก "${name}" เรียบร้อยแล้ว`,
      })

      setOpen(false)
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขข้อมูลห้องพักได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>แก้ไขข้อมูลห้องพัก</DialogTitle>
          <DialogDescription>แก้ไขข้อมูลห้องพักตามที่ต้องการ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ชื่อห้อง/เลขห้อง</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ระบุชื่อห้องหรือเลขห้อง"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="floor">ชั้น</Label>
                <Input
                  id="floor"
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="ระบุชั้น"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">ประเภทห้อง</Label>
                <Input
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="เช่น ห้องเดี่ยว, ห้องคู่"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">ราคาเช่า (บาท/เดือน)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="ระบุราคาเช่า"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">สถานะห้อง</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="เลือกสถานะห้อง" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ว่าง">ว่าง</SelectItem>
                    <SelectItem value="ไม่ว่าง">ไม่ว่าง</SelectItem>
                    <SelectItem value="จอง">จอง</SelectItem>
                    <SelectItem value="ปิดปรับปรุง">ปิดปรับปรุง</SelectItem>
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
      </DialogContent>
    </Dialog>
  )
}
