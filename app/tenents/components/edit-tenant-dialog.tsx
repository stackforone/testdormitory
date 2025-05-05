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
import { updateTenant } from "../actions"

interface EditTenantDialogProps {
  children: React.ReactNode
  tenant: {
    id: string
    name: string | null
    phone: string | null
    note: string | null
  }
  onSuccess?: () => void
}

export function EditTenantDialog({ children, tenant, onSuccess }: EditTenantDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(tenant.name || "")
  const [phone, setPhone] = useState(tenant.phone || "")
  const [note, setNote] = useState(tenant.note || "")
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
      await updateTenant({
        id: tenant.id,
        name,
        phone: phone || null,
        note: note || null,
      })

      toast({
        title: "แก้ไขผู้เช่าสำเร็จ",
        description: `แก้ไขข้อมูลผู้เช่า "${name}" เรียบร้อยแล้ว`,
      })

      setOpen(false)
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขข้อมูลผู้เช่าได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>แก้ไขข้อมูลผู้เช่า</DialogTitle>
          <DialogDescription>แก้ไขข้อมูลผู้เช่าตามที่ต้องการ</DialogDescription>
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
