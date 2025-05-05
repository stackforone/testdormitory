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
import { deleteContract } from "../actions"

interface DeleteContractDialogProps {
  children: React.ReactNode
  contractId: string
  onSuccess?: () => void
}

export function DeleteContractDialog({ children, contractId, onSuccess }: DeleteContractDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteContract(contractId)

      toast({
        title: "ลบสัญญาเช่าสำเร็จ",
        description: "ลบสัญญาเช่าเรียบร้อยแล้ว",
      })

      setOpen(false)
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสัญญาเช่าได้ กรุณาลองใหม่อีกครั้ง",
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
          <DialogTitle>ยืนยันการลบสัญญาเช่า</DialogTitle>
          <DialogDescription>คุณต้องการลบสัญญาเช่านี้ใช่หรือไม่? การลบจะทำให้ข้อมูลที่เกี่ยวข้องทั้งหมดถูกลบไปด้วย</DialogDescription>
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
