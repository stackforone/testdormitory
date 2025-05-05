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
import { useToast } from "@/components/ui/use-toast"
import { addDormitory } from "../actions"

interface AddDormitoryDialogProps {
  children: React.ReactNode
}

export function AddDormitoryDialog({ children }: AddDormitoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "กรุณาระบุชื่อหอพัก",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await addDormitory({
        name,
        location: location || null,
      })

      toast({
        title: "เพิ่มหอพักสำเร็จ",
        description: `เพิ่มหอพัก "${name}" เรียบร้อยแล้ว`,
      })

      setName("")
      setLocation("")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มหอพักได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>เพิ่มหอพักใหม่</DialogTitle>
          <DialogDescription>กรอกข้อมูลหอพักที่ต้องการเพิ่มในระบบ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ชื่อหอพัก</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ระบุชื่อหอพัก"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">ที่อยู่/ที่ตั้ง</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ระบุที่อยู่หรือที่ตั้งของหอพัก (ไม่บังคับ)"
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
      </DialogContent>
    </Dialog>
  )
}
