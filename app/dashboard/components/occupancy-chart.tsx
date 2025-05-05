"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { getDormitoryOccupancy } from "../actions"

export function OccupancyChart() {
  const [dormitories, setDormitories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDormitoryOccupancy()
        setDormitories(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลอัตราการเข้าพักได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (dormitories.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">ไม่พบข้อมูลหอพัก</div>
  }

  return (
    <div className="space-y-4">
      {dormitories.map((dorm) => (
        <div key={dorm.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{dorm.name}</h4>
            <span className="text-sm text-muted-foreground">{dorm.occupancyRate}% เข้าพัก</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-primary"
              style={{ width: `${dorm.occupancyRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>ห้องที่มีผู้เช่า: {dorm.occupiedRooms}</span>
            <span>ห้องว่าง: {dorm.vacantRooms}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
