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
import { deleteUtility } from "../actions"

interface DeleteUtilityDialogProps {
  children: React.ReactNode
  utilityId: string
  onSuccess?: () => void
}

export function DeleteUtilityDialog({ children, utilityId, onSuccess }: DeleteUtilityDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteUtility(utilityId)

      toast({
        title: "ลบข้อมูลค่าน้ำ-ค่าไฟสำเร็จ",
        description: "ลบข้อมูลค่าน้ำ-ค่าไฟเรียบร้อยแล้ว",
      })

      setOpen(false)
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลค่าน้ำ-ค่าไฟได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>ยืนยันการลบข้อมูลค่าน้ำ-ค่าไฟ</DialogTitle>
          <DialogDescription>คุณต้องการลบข้อมูลค่าน้ำ-ค่าไฟนี้ใช่หรือไม่? การลบจะทำให้ข้อมูลถูกลบไปอย่างถาวร</DialogDescription>
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
