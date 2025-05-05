"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DoorOpen, Edit, Trash2, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { EditRoomDialog } from "./edit-room-dialog"
import { DeleteRoomDialog } from "./delete-room-dialog"
import { getRooms, getDormitoryById } from "../actions"

type Room = {
  id: string
  name: string
  floor: number | null
  type: string | null
  price: number | null
  status: string
  created_at: string
}

interface RoomListProps {
  dormId: string
}

export function RoomList({ dormId }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [dormitory, setDormitory] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [roomsData, dormData] = await Promise.all([getRooms(dormId), getDormitoryById(dormId)])
        setRooms(roomsData)
        setDormitory(dormData)
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลห้องพักได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [dormId, toast])

  const handleRoomUpdated = () => {
    getRooms(dormId).then(setRooms)
    router.refresh()
  }

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <DoorOpen className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลห้องพัก</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {dormitory ? `หอพัก ${dormitory.name} ยังไม่มีห้องพัก` : "ไม่พบข้อมูลห้องพัก"} กรุณาเพิ่มห้องพักใหม่
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <Card key={room.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <DoorOpen className="h-5 w-5 text-primary" />
                {room.name}
              </CardTitle>
              <Badge variant={room.status === "ว่าง" ? "outline" : "secondary"}>{room.status}</Badge>
            </div>
            <CardDescription>
              {room.floor && `ชั้น ${room.floor}`}
              {room.type && room.floor && " • "}
              {room.type && `ประเภท: ${room.type}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {room.price ? (
              <div className="text-lg font-semibold">
                ฿{room.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ เดือน</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">ยังไม่ได้กำหนดราคา</div>
            )}

            {room.status !== "ว่าง" && (
              <Button
                variant="outline"
                className="mt-2 w-full gap-1"
                onClick={() => router.push(`/tenants?roomId=${room.id}`)}
              >
                <Users className="h-4 w-4" />
                ดูข้อมูลผู้เช่า
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <EditRoomDialog room={room} onSuccess={handleRoomUpdated}>
              <Button variant="ghost" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                แก้ไข
              </Button>
            </EditRoomDialog>
            <DeleteRoomDialog roomId={room.id} roomName={room.name} onSuccess={handleRoomUpdated}>
              <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                ลบ
              </Button>
            </DeleteRoomDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
