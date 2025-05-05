"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { getDormitories } from "@/app/dormitories/actions"

interface DormitorySelectorProps {
  initialDormId?: string
}

export function DormitorySelector({ initialDormId }: DormitorySelectorProps) {
  const [dormitories, setDormitories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

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

  const handleDormitoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("dormId", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="กำลังโหลด..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (dormitories.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="ไม่พบข้อมูลหอพัก" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={initialDormId || ""} onValueChange={handleDormitoryChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="เลือกหอพัก" />
      </SelectTrigger>
      <SelectContent>
        {dormitories.map((dorm) => (
          <SelectItem key={dorm.id} value={dorm.id}>
            {dorm.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
