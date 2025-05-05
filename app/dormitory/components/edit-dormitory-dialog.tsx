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
import { updateDormitory } from "../actions"

interface EditDormitoryDialogProps {
  children: React.ReactNode
  dormitory: {
    id: string
    name: string
    location: string | null
  }
  onSuccess?: () => void
}

export function EditDormitoryDialog({ children, dormitory, onSuccess }: EditDormitoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(dormitory.name)
  const [location, setLocation] = useState(dormitory.location || "")
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
      await updateDormitory({
        id: dormitory.id,
        name,
        location: location || null,
      })

      toast({
        title: "แก้ไขหอพักสำเร็จ",
        description: `แก้ไขข้อมูลหอพัก "${name}" เรียบร้อยแล้ว`,
      })

      setOpen(false)
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขข้อมูลหอพักได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>แก้ไขข้อมูลหอพัก</DialogTitle>
          <DialogDescription>แก้ไขข้อมูลหอพักตามที่ต้องการ</DialogDescription>
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
