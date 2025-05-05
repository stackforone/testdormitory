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
import { useToast } from "@/components/ui/use-toast"
import { deleteTenant } from "../actions"

interface DeleteTenantDialogProps {
  children: React.ReactNode
  tenantId: string
  tenantName: string
  onSuccess?: () => void
}

export function DeleteTenantDialog({ children, tenantId, tenantName, onSuccess }: DeleteTenantDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteTenant(tenantId)

      toast({
        title: "ลบผู้เช่าสำเร็จ",
        description: `ลบผู้เช่า "${tenantName}" เรียบร้อยแล้ว`,
      })

      setOpen(false)
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบผู้เช่าได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบผู้เช่า</DialogTitle>
          <DialogDescription>
            คุณต้องการลบผู้เช่า "{tenantName}" ใช่หรือไม่? การลบจะทำให้ข้อมูลที่เกี่ยวข้องทั้งหมดถูกลบไปด้วย
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            ยกเลิก
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "กำลังลบ..." : "ลบ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
