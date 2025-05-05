"use server"

import { createServerClient } from "@/lib/supabase/server"

// ดึงข้อมูลภาพรวมหอพัก
export async function getDormitoryOverview() {
  const supabase = createServerClient()

  // ดึงข้อมูลหอพักทั้งหมด
  const { data: dormitories, error: dormitoriesError } = await supabase
    .from("dormitories")
    .select("*")
    .order("created_at", { ascending: false })

  if (dormitoriesError) {
    console.error("Error fetching dormitories:", dormitoriesError)
    throw new Error("ไม่สามารถดึงข้อมูลหอพักได้")
  }

  // ดึงข้อมูลห้องพักทั้งหมด
  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("*, tenant:contracts(tenant_id(id, name, phone))")
    .order("name")

  if (roomsError) {
    console.error("Error fetching rooms:", roomsError)
    throw new Error("ไม่สามารถดึงข้อมูลห้องพักได้")
  }

  // แปลงข้อมูลห้องพักให้อยู่ในรูปแบบที่ต้องการ
  const processedRooms = rooms.map((room) => {
    // ดึงข้อมูลผู้เช่าล่าสุดจากสัญญาเช่า (ถ้ามี)
    let tenant = null
    if (room.tenant && room.tenant.length > 0) {
      const activeTenant = room.tenant.find((t: any) => t.tenant_id)
      if (activeTenant) {
        tenant = activeTenant.tenant_id
      }
    }

    return {
      ...room,
      tenant,
    }
  })

  // จัดกลุ่มห้องพักตามหอพัก
  const dormitoryMap = new Map()

  dormitories.forEach((dorm) => {
    dormitoryMap.set(dorm.id, {
      ...dorm,
      rooms: [],
      totalRooms: 0,
      occupiedRooms: 0,
      vacantRooms: 0,
      tenantCount: 0,
      occupancyRate: 0,
    })
  })

  processedRooms.forEach((room) => {
    const dormId = room.dorm_id
    if (dormitoryMap.has(dormId)) {
      const dormData = dormitoryMap.get(dormId)
      dormData.rooms.push(room)
      dormData.totalRooms += 1

      if (room.status !== "ว่าง") {
        dormData.occupiedRooms += 1
      } else {
        dormData.vacantRooms += 1
      }

      if (room.tenant) {
        dormData.tenantCount += 1
      }
    }
  })

  // คำนวณอัตราการเข้าพักของแต่ละหอพัก
  dormitoryMap.forEach((dorm) => {
    dorm.occupancyRate = dorm.totalRooms > 0 ? Math.round((dorm.occupiedRooms / dorm.totalRooms) * 100) : 0
  })

  return {
    dormitories: Array.from(dormitoryMap.values()),
  }
}
