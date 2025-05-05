"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ดึงข้อมูลหอพักทั้งหมด
export async function getDormitories() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("dormitories").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching dormitories:", error)
    throw new Error("ไม่สามารถดึงข้อมูลหอพักได้")
  }

  return data || []
}

// เพิ่มหอพักใหม่
export async function addDormitory({
  name,
  location,
}: {
  name: string
  location: string | null
}) {
  const supabase = createServerClient()

  const { error } = await supabase.from("dormitories").insert({ name, location })

  if (error) {
    console.error("Error adding dormitory:", error)
    throw new Error("ไม่สามารถเพิ่มหอพักได้")
  }

  revalidatePath("/dormitories")
  revalidatePath("/dashboard")
}

// แก้ไขข้อมูลหอพัก
export async function updateDormitory({
  id,
  name,
  location,
}: {
  id: string
  name: string
  location: string | null
}) {
  const supabase = createServerClient()

  const { error } = await supabase.from("dormitories").update({ name, location }).eq("id", id)

  if (error) {
    console.error("Error updating dormitory:", error)
    throw new Error("ไม่สามารถแก้ไขข้อมูลหอพักได้")
  }

  revalidatePath("/dormitories")
  revalidatePath("/dashboard")
}

// ลบหอพัก
export async function deleteDormitory(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("dormitories").delete().eq("id", id)

  if (error) {
    console.error("Error deleting dormitory:", error)
    throw new Error("ไม่สามารถลบหอพักได้")
  }

  revalidatePath("/dormitories")
  revalidatePath("/dashboard")
}
