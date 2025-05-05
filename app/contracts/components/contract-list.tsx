"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Trash2, DoorOpen, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { EditContractDialog } from "./edit-contract-dialog"
import { DeleteContractDialog } from "./delete-contract-dialog"
import { getContracts } from "../actions"
import { formatDate } from "@/lib/utils"

type Contract = {
  id: string
  tenant_id: string
  room_id: string
  start_date: string | null
  end_date: string | null
  status: string
  deposit: number | null
  created_at: string
  tenant: {
    name: string | null
  } | null
  room: {
    name: string
    dorm: {
      name: string
    } | null
  } | null
}

export function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadContracts() {
      try {
        const data = await getContracts()
        setContracts(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลสัญญาเช่าได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadContracts()
  }, [toast])

  const handleContractUpdated = () => {
    getContracts().then(setContracts)
    router.refresh()
  }

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลสัญญาเช่า</h3>
        <p className="mt-2 text-sm text-muted-foreground">คุณยังไม่มีสัญญาเช่าในระบบ กรุณาเพิ่มสัญญาเช่าใหม่</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contracts.map((contract) => (
        <Card key={contract.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                สัญญาเช่า
              </CardTitle>
              <Badge
                variant={
                  contract.status === "active" ? "default" : contract.status === "expired" ? "secondary" : "outline"
                }
              >
                {contract.status === "active" ? "ใช้งาน" : contract.status === "expired" ? "หมดอายุ" : "ยกเลิก"}
              </Badge>
            </div>
            <CardDescription>
              {contract.start_date && `เริ่ม ${formatDate(contract.start_date)}`}
              {contract.end_date && contract.start_date && " - "}
              {contract.end_date && `สิ้นสุด ${formatDate(contract.end_date)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pb-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{contract.tenant?.name || "ไม่ระบุผู้เช่า"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              <span>
                {contract.room?.name || "ไม่ระบุห้อง"} {contract.room?.dorm?.name && `(${contract.room.dorm.name})`}
              </span>
            </div>
            {contract.deposit !== null && (
              <div className="font-medium">เงินประกัน: ฿{contract.deposit.toLocaleString()}</div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <EditContractDialog contract={contract} onSuccess={handleContractUpdated}>
              <Button variant="ghost" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                แก้ไข
              </Button>
            </EditContractDialog>
            <DeleteContractDialog contractId={contract.id} onSuccess={handleContractUpdated}>
              <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                ลบ
              </Button>
            </DeleteContractDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
