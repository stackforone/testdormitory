"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ดึงข้อมูลค่าน้ำ-ค่าไฟทั้งหมด
export async function getUtilities() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("utilities")
    .select(
      `
      *,
      room:room_id (
        name,
        dorm:dorm_id (
          name
        )
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching utilities:", error)
    throw new Error("ไม่สามารถดึงข้อมูลค่าน้ำ-ค่าไฟได้")
  }

  return data || []
}

// ดึงข้อมูลห้องพักสำหรับค่าน้ำ-ค่าไฟ
export async function getRoomsForUtility() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("rooms")
    .select(
      `
      id,
      name,
      dorm:dorm_id (
        name
      )
    `,
    )
    .order("name")

  if (error) {
    console.error("Error fetching rooms for utility:", error)
    throw new Error("ไม่สามารถดึงข้อมูลห้องพักได้")
  }

  // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
  return (
    data?.map((room) => ({
      id: room.id,
      name: room.name,
      dorm_name: room.dorm?.name || "ไม่ระบุหอพัก",
    })) || []
  )
}

// เพิ่มค่าน้ำ-ค่าไฟใหม่
export async function addUtility({
  roomId,
  month,
  waterUnit,
  electricityUnit,
  waterRate,
  electricityRate,
}: {
  roomId: string
  month: string
  waterUnit: number | null
  electricityUnit: number | null
  waterRate: number | null
  electricityRate: number | null
}) {
  const supabase = createServerClient()

  const { error } = await supabase.from("utilities").insert({
    room_id: roomId,
    month,
    water_unit: waterUnit,
    electricity_unit: electricityUnit,
    water_rate: waterRate,
    electricity_rate: electricityRate,
  })

  if (error) {
    console.error("Error adding utility:", error)
    throw new Error("ไม่สามารถเพิ่มค่าน้ำ-ค่าไฟได้")
  }

  revalidatePath("/utilities")
}

// แก้ไขค่าน้ำ-ค่าไฟ
export async function updateUtility({
  id,
  roomId,
  month,
  waterUnit,
  electricityUnit,
  waterRate,
  electricityRate,
}: {
  id: string
  roomId: string
  month: string
  waterUnit: number | null
  electricityUnit: number | null
  waterRate: number | null
  electricityRate: number | null
}) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("utilities")
    .update({
      room_id: roomId,
      month,
      water_unit: waterUnit,
      electricity_unit: electricityUnit,
      water_rate: waterRate,
      electricity_rate: electricityRate,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating utility:", error)
    throw new Error("ไม่สามารถแก้ไขค่าน้ำ-ค่าไฟได้")
  }

  revalidatePath("/utilities")
}

// ลบค่าน้ำ-ค่าไฟ
export async function deleteUtility(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("utilities").delete().eq("id", id)

  if (error) {
    console.error("Error deleting utility:", error)
    throw new Error("ไม่สามารถลบค่าน้ำ-ค่าไฟได้")
  }

  revalidatePath("/utilities")
}
