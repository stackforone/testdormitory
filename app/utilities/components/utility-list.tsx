"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Edit, Trash2, Zap, DoorOpen } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { EditUtilityDialog } from "./edit-utility-dialog"
import { DeleteUtilityDialog } from "./delete-utility-dialog"
import { getUtilities } from "../actions"

type Utility = {
  id: string
  room_id: string
  month: string | null
  water_unit: number | null
  electricity_unit: number | null
  water_rate: number | null
  electricity_rate: number | null
  created_at: string
  room: {
    name: string
    dorm: {
      name: string
    } | null
  } | null
}

export function UtilityList() {
  const [utilities, setUtilities] = useState<Utility[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadUtilities() {
      try {
        const data = await getUtilities()
        setUtilities(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลค่าน้ำ-ค่าไฟได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUtilities()
  }, [toast])

  const handleUtilityUpdated = () => {
    getUtilities().then(setUtilities)
    router.refresh()
  }

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (utilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Droplets className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลค่าน้ำ-ค่าไฟ</h3>
        <p className="mt-2 text-sm text-muted-foreground">คุณยังไม่มีข้อมูลค่าน้ำ-ค่าไฟในระบบ กรุณาเพิ่มข้อมูลใหม่</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {utilities.map((utility) => {
        // คำนวณค่าน้ำ-ค่าไฟ
        const waterCost = (utility.water_unit || 0) * (utility.water_rate || 0)
        const electricityCost = (utility.electricity_unit || 0) * (utility.electricity_rate || 0)
        const totalCost = waterCost + electricityCost

        return (
          <Card key={utility.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Droplets className="h-5 w-5 text-primary" />
                {utility.month || "ไม่ระบุเดือน"}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <DoorOpen className="h-3 w-3" />
                {utility.room?.name || "ไม่ระบุห้อง"} {utility.room?.dorm?.name && `(${utility.room.dorm.name})`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span>น้ำ: {utility.water_unit || 0} หน่วย</span>
                </div>
                <span className="font-medium">฿{waterCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>ไฟ: {utility.electricity_unit || 0} หน่วย</span>
                </div>
                <span className="font-medium">฿{electricityCost.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between font-medium">
                  <span>รวมทั้งสิ้น</span>
                  <span>฿{totalCost.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <EditUtilityDialog utility={utility} onSuccess={handleUtilityUpdated}>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Edit className="h-4 w-4" />
                  แก้ไข
                </Button>
              </EditUtilityDialog>
              <DeleteUtilityDialog utilityId={utility.id} onSuccess={handleUtilityUpdated}>
                <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  ลบ
                </Button>
              </DeleteUtilityDialog>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
