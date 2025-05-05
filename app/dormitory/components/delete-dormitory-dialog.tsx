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
import { deleteDormitory } from "../actions"

interface DeleteDormitoryDialogProps {
  children: React.ReactNode
  dormitoryId: string
  dormitoryName: string
  onSuccess?: () => void
}

export function DeleteDormitoryDialog({ children, dormitoryId, dormitoryName, onSuccess }: DeleteDormitoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteDormitory(dormitoryId)

      toast({
        title: "ลบหอพักสำเร็จ",
        description: `ลบหอพัก "${dormitoryName}" เรียบร้อยแล้ว`,
      })

      setOpen(false)
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบหอพักได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>ยืนยันการลบหอพัก</DialogTitle>
          <DialogDescription>
            คุณต้องการลบหอพัก "{dormitoryName}" ใช่หรือไม่? การลบจะทำให้ข้อมูลห้องพักและข้อมูลที่เกี่ยวข้องทั้งหมดถูกลบไปด้วย
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
