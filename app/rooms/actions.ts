"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ดึงข้อมูลห้องพักทั้งหมดในหอพัก
export async function getRooms(dormId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("rooms").select("*").eq("dorm_id", dormId).order("name")

  if (error) {
    console.error("Error fetching rooms:", error)
    throw new Error("ไม่สามารถดึงข้อมูลห้องพักได้")
  }

  return data || []
}

// ดึงข้อมูลหอพักตาม ID
export async function getDormitoryById(dormId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("dormitories").select("id, name").eq("id", dormId).single()

  if (error) {
    console.error("Error fetching dormitory:", error)
    throw new Error("ไม่สามารถดึงข้อมูลหอพักได้")
  }

  return data
}

// เพิ่มห้องพักใหม่
export async function addRoom({
  dormId,
  name,
  floor,
  type,
  price,
  status,
}: {
  dormId: string
  name: string
  floor: number | null
  type: string | null
  price: number | null
  status: string
}) {
  const supabase = createServerClient()

  const { error } = await supabase.from("rooms").insert({
    dorm_id: dormId,
    name,
    floor,
    type,
    price,
    status,
  })

  if (error) {
    console.error("Error adding room:", error)
    throw new Error("ไม่สามารถเพิ่มห้องพักได้")
  }

  revalidatePath("/rooms")
  revalidatePath("/dashboard")
}

// แก้ไขข้อมูลห้องพัก
export async function updateRoom({
  id,
  name,
  floor,
  type,
  price,
  status,
}: {
  id: string
  name: string
  floor: number | null
  type: string | null
  price: number | null
  status: string
}) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("rooms")
    .update({
      name,
      floor,
      type,
      price,
      status,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating room:", error)
    throw new Error("ไม่สามารถแก้ไขข้อมูลห้องพักได้")
  }

  revalidatePath("/rooms")
  revalidatePath("/dashboard")
}

// ลบห้องพัก
export async function deleteRoom(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("rooms").delete().eq("id", id)

  if (error) {
    console.error("Error deleting room:", error)
    throw new Error("ไม่สามารถลบห้องพักได้")
  }

  revalidatePath("/rooms")
  revalidatePath("/dashboard")
}
