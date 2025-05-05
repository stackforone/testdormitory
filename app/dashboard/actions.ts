"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getDormitorySummary() {
  const supabase = createServerClient()

  // ดึงข้อมูลจำนวนหอพัก
  const { count: dormitoryCount } = await supabase.from("dormitories").select("*", { count: "exact", head: true })

  // ดึงข้อมูลจำนวนห้องพัก
  const { count: roomCount } = await supabase.from("rooms").select("*", { count: "exact", head: true })

  // ดึงข้อมูลจำนวนห้องว่าง
  const { count: vacantRoomCount } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("status", "ว่าง")

  // ดึงข้อมูลจำนวนผู้เช่า
  const { count: tenantCount } = await supabase.from("tenants").select("*", { count: "exact", head: true })

  // ดึงข้อมูลจำนวนสัญญาที่ยังใช้งาน
  const { count: activeContractCount } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  // คำนวณรายได้ประจำเดือน (จากห้องที่มีสัญญาเช่า)
  const { data: rooms } = await supabase.from("rooms").select("price").neq("status", "ว่าง")

  const monthlyIncome = rooms?.reduce((sum, room) => sum + (room.price || 0), 0) || 0

  return {
    dormitoryCount: dormitoryCount || 0,
    roomCount: roomCount || 0,
    vacantRoomCount: vacantRoomCount || 0,
    tenantCount: tenantCount || 0,
    activeContractCount: activeContractCount || 0,
    monthlyIncome,
  }
}

export async function getRecentPayments() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      contract:contract_id (
        tenant:tenant_id (
          name
        ),
        room:room_id (
          name
        )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent payments:", error)
    throw new Error("ไม่สามารถดึงข้อมูลการชำระเงินล่าสุดได้")
  }

  // แปลงข้อมูลการชำระเงินล่าสุดให้อยู่ในรูปแบบที่ต้องการ
  return (
    data?.map((payment) => ({
      id: payment.id,
      month: payment.month,
      amount: payment.amount,
      status: payment.status,
      tenant_name: payment.contract?.tenant?.name || "ไม่ระบุชื่อ",
      room_name: payment.contract?.room?.name || "ไม่ระบุห้อง",
    })) || []
  )
}

export async function getDormitoryOccupancy() {
  const supabase = createServerClient()

  // ดึงข้อมูลหอพักทั้งหมด
  const { data: dormitories, error: dormitoriesError } = await supabase.from("dormitories").select("*")

  if (dormitoriesError) {
    console.error("Error fetching dormitories:", dormitoriesError)
    throw new Error("ไม่สามารถดึงข้อมูลหอพักได้")
  }

  // ดึงข้อมูลห้องพักทั้งหมด
  const { data: rooms, error: roomsError } = await supabase.from("rooms").select("dorm_id, status")

  if (roomsError) {
    console.error("Error fetching rooms:", roomsError)
    throw new Error("ไม่สามารถดึงข้อมูลห้องพักได้")
  }

  // จัดกลุ่มห้องพักตามหอพัก
  const dormitoryMap = new Map()

  dormitories.forEach((dorm) => {
    dormitoryMap.set(dorm.id, {
      id: dorm.id,
      name: dorm.name,
      totalRooms: 0,
      occupiedRooms: 0,
      vacantRooms: 0,
      occupancyRate: 0,
    })
  })

  rooms.forEach((room) => {
    const dormId = room.dorm_id
    if (dormitoryMap.has(dormId)) {
      const dormData = dormitoryMap.get(dormId)
      dormData.totalRooms += 1

      if (room.status !== "ว่าง") {
        dormData.occupiedRooms += 1
      } else {
        dormData.vacantRooms += 1
      }
    }
  })

  // คำนวณอัตราการเข้าพักของแต่ละหอพัก
  dormitoryMap.forEach((dorm) => {
    dorm.occupancyRate = dorm.totalRooms > 0 ? Math.round((dorm.occupiedRooms / dorm.totalRooms) * 100) : 0
  })

  return Array.from(dormitoryMap.values())
}
