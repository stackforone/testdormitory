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
import { addRoom } from "../actions"

interface AddRoomDialogProps {
  children: React.ReactNode
  dormId: string
}

export function AddRoomDialog({ children, dormId }: AddRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [floor, setFloor] = useState("")
  const [type, setType] = useState("")
  const [price, setPrice] = useState("")
  const [status, setStatus] = useState("ว่าง")
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
      await addRoom({
        dormId,
        name,
        floor: floor ? Number.parseInt(floor) : null,
        type: type || null,
        price: price ? Number.parseFloat(price) : null,
        status,
      })

      toast({
        title: "เพิ่มห้องพักสำเร็จ",
        description: `เพิ่มห้องพัก "${name}" เรียบร้อยแล้ว`,
      })

      setName("")
      setFloor("")
      setType("")
      setPrice("")
      setStatus("ว่าง")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มห้องพักได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>เพิ่มห้องพักใหม่</DialogTitle>
          <DialogDescription>กรอกข้อมูลห้องพักที่ต้องการเพิ่มในระบบ</DialogDescription>
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
