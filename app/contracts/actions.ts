"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ดึงข้อมูลสัญญาเช่าทั้งหมด
export async function getContracts() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("contracts")
    .select(
      `
      *,
      tenant:tenant_id (
        name
      ),
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
    console.error("Error fetching contracts:", error)
    throw new Error("ไม่สามารถดึงข้อมูลสัญญาเช่าได้")
  }

  return data || []
}

// ดึงข้อมูลห้องพักสำหรับสัญญาเช่า
export async function getRoomsForContract() {
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
    console.error("Error fetching rooms for contract:", error)
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

// เพิ่มสัญญาเช่าใหม่
export async function addContract({
  tenantId,
  roomId,
  startDate,
  endDate,
  deposit,
  status,
}: {
  tenantId: string
  roomId: string
  startDate: string | null
  endDate: string | null
  deposit: number | null
  status: string
}) {
  const supabase = createServerClient()

  // เพิ่มสัญญาเช่า
  const { error: contractError } = await supabase.from("contracts").insert({
    tenant_id: tenantId,
    room_id: roomId,
    start_date: startDate,
    end_date: endDate,
    deposit,
    status,
  })

  if (contractError) {
    console.error("Error adding contract:", contractError)
    throw new Error("ไม่สามารถเพิ่มสัญญาเช่าได้")
  }

  // อัปเดตสถานะห้องพัก
  const { error: roomError } = await supabase.from("rooms").update({ status: "ไม่ว่าง" }).eq("id", roomId)

  if (roomError) {
    console.error("Error updating room status:", roomError)
    // ไม่ throw error เพราะสัญญาเช่าถูกเพิ่มแล้ว
  }

  revalidatePath("/contracts")
  revalidatePath("/rooms")
  revalidatePath("/dashboard")
}

// แก้ไขสัญญาเช่า
export async function updateContract({
  id,
  tenantId,
  roomId,
  startDate,
  endDate,
  deposit,
  status,
}: {
  id: string
  tenantId: string
  roomId: string
  startDate: string | null
  endDate: string | null
  deposit: number | null
  status: string
}) {
  const supabase = createServerClient()

  // ดึงข้อมูลสัญญาเช่าเดิม
  const { data: oldContract, error: fetchError } = await supabase
    .from("contracts")
    .select("room_id")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error fetching old contract:", fetchError)
    throw new Error("ไม่สามารถดึงข้อมูลสัญญาเช่าเดิมได้")
  }

  // แก้ไขสัญญาเช่า
  const { error: contractError } = await supabase
    .from("contracts")
    .update({
      tenant_id: tenantId,
      room_id: roomId,
      start_date: startDate,
      end_date: endDate,
      deposit,
      status,
    })
    .eq("id", id)

  if (contractError) {
    console.error("Error updating contract:", contractError)
    throw new Error("ไม่สามารถแก้ไขสัญญาเช่าได้")
  }

  // ถ้าเปลี่ยนห้อง หรือสถานะสัญญาเปลี่ยน ให้อัปเดตสถานะห้องพัก
  if (oldContract.room_id !== roomId || status !== "active") {
    // อัปเดตสถานะห้องพักเดิมเป็นว่าง
    const { error: oldRoomError } = await supabase.from("rooms").update({ status: "ว่าง" }).eq("id", oldContract.room_id)

    if (oldRoomError) {
      console.error("Error updating old room status:", oldRoomError)
    }

    // ถ้าสถานะสัญญายังใช้งานอยู่ ให้อัปเดตสถานะห้องพักใหม่เป็นไม่ว่าง
    if (status === "active") {
      const { error: newRoomError } = await supabase.from("rooms").update({ status: "ไม่ว่าง" }).eq("id", roomId)

      if (newRoomError) {
        console.error("Error updating new room status:", newRoomError)
      }
    }
  }

  revalidatePath("/contracts")
  revalidatePath("/rooms")
  revalidatePath("/dashboard")
}

// ลบสัญญาเช่า
export async function deleteContract(id: string) {
  const supabase = createServerClient()

  // ดึงข้อมูลสัญญาเช่า
  const { data: contract, error: fetchError } = await supabase.from("contracts").select("room_id").eq("id", id).single()

  if (fetchError) {
    console.error("Error fetching contract:", fetchError)
    throw new Error("ไม่สามารถดึงข้อมูลสัญญาเช่าได้")
  }

  // ลบสัญญาเช่า
  const { error: deleteError } = await supabase.from("contracts").delete().eq("id", id)

  if (deleteError) {
    console.error("Error deleting contract:", deleteError)
    throw new Error("ไม่สามารถลบสัญญาเช่าได้")
  }

  // อัปเดตสถานะห้องพักเป็นว่าง
  const { error: roomError } = await supabase.from("rooms").update({ status: "ว่าง" }).eq("id", contract.room_id)

  if (roomError) {
    console.error("Error updating room status:", roomError)
    // ไม่ throw error เพราะสัญญาเช่าถูกลบแล้ว
  }

  revalidatePath("/contracts")
  revalidatePath("/rooms")
  revalidatePath("/dashboard")
}
