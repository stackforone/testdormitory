"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { EditDormitoryDialog } from "./edit-dormitory-dialog"
import { DeleteDormitoryDialog } from "./delete-dormitory-dialog"
import { getDormitories } from "../actions"

type Dormitory = {
  id: string
  name: string
  location: string | null
  created_at: string
}

export function DormitoryList() {
  const [dormitories, setDormitories] = useState<Dormitory[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadDormitories() {
      try {
        const data = await getDormitories()
        setDormitories(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลหอพักได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDormitories()
  }, [toast])

  const handleDormitoryUpdated = () => {
    getDormitories().then(setDormitories)
    router.refresh()
  }

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (dormitories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Building2 className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลหอพัก</h3>
        <p className="mt-2 text-sm text-muted-foreground">คุณยังไม่มีหอพักในระบบ กรุณาเพิ่มหอพักใหม่</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dormitories.map((dormitory) => (
        <Card key={dormitory.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              {dormitory.name}
            </CardTitle>
            {dormitory.location && <CardDescription>{dormitory.location}</CardDescription>}
          </CardHeader>
          <CardContent className="pb-2">
            <Button variant="outline" className="w-full" onClick={() => router.push(`/rooms?dormId=${dormitory.id}`)}>
              ดูห้องพักทั้งหมด
            </Button>
          </CardContent>
          <CardFooter className="flex justify-between">
            <EditDormitoryDialog dormitory={dormitory} onSuccess={handleDormitoryUpdated}>
              <Button variant="ghost" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                แก้ไข
              </Button>
            </EditDormitoryDialog>
            <DeleteDormitoryDialog
              dormitoryId={dormitory.id}
              dormitoryName={dormitory.name}
              onSuccess={handleDormitoryUpdated}
            >
              <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                ลบ
              </Button>
            </DeleteDormitoryDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
