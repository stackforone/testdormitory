"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Edit, Trash2, Phone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { EditTenantDialog } from "./edit-tenant-dialog"
import { DeleteTenantDialog } from "./delete-tenant-dialog"
import { getTenants } from "../actions"

type Tenant = {
  id: string
  name: string | null
  phone: string | null
  note: string | null
  created_at: string
}

export function TenantList() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadTenants() {
      try {
        const data = await getTenants()
        setTenants(data)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลผู้เช่าได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTenants()
  }, [toast])

  const handleTenantUpdated = () => {
    getTenants().then(setTenants)
    router.refresh()
  }

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Users className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลผู้เช่า</h3>
        <p className="mt-2 text-sm text-muted-foreground">คุณยังไม่มีผู้เช่าในระบบ กรุณาเพิ่มผู้เช่าใหม่</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map((tenant) => (
        <Card key={tenant.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              {tenant.name || "ไม่ระบุชื่อ"}
            </CardTitle>
            {tenant.phone && (
              <CardDescription className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {tenant.phone}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pb-2">
            {tenant.note ? (
              <p className="text-sm text-muted-foreground">{tenant.note}</p>
            ) : (
              <p className="text-sm text-muted-foreground">ไม่มีบันทึกเพิ่มเติม</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <EditTenantDialog tenant={tenant} onSuccess={handleTenantUpdated}>
              <Button variant="ghost" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                แก้ไข
              </Button>
            </EditTenantDialog>
            <DeleteTenantDialog tenantId={tenant.id} tenantName={tenant.name || "ผู้เช่า"} onSuccess={handleTenantUpdated}>
              <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                ลบ
              </Button>
            </DeleteTenantDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
