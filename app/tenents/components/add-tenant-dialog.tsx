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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { addTenant } from "../actions"

interface AddTenantDialogProps {
  children: React.ReactNode
}

export function AddTenantDialog({ children }: AddTenantDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "กรุณาระบุชื่อผู้เช่า",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await addTenant({
        name,
        phone: phone || null,
        note: note || null,
      })

      toast({
        title: "เพิ่มผู้เช่าสำเร็จ",
        description: `เพิ่มผู้เช่า "${name}" เรียบร้อยแล้ว`,
      })

      setName("")
      setPhone("")
      setNote("")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มผู้เช่าได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>เพิ่มผู้เช่าใหม่</DialogTitle>
          <DialogDescription>กรอกข้อมูลผู้เช่าที่ต้องการเพิ่มในระบบ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ชื่อผู้เช่า</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ระบุชื่อผู้เช่า"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ระบุเบอร์โทรศัพท์" />
            </div>
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
      </DialogContent>
    </Dialog>
  )
}
