"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ดึงข้อมูลผู้เช่าทั้งหมด
export async function getTenants() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("tenants").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tenants:", error)
    throw new Error("ไม่สามารถดึงข้อมูลผู้เช่าได้")
  }

  return data || []
}

// เพิ่มผู้เช่าใหม่
export async function addTenant({
  name,
  phone,
  note,
}: {
  name: string
  phone: string | null
  note: string | null
}) {
  const supabase = createServerClient()

  const { error } = await supabase.from("tenants").insert({ name, phone, note })

  if (error) {
    console.error("Error adding tenant:", error)
    throw new Error("ไม่สามารถเพิ่มผู้เช่าได้")
  }

  revalidatePath("/tenants")
  revalidatePath("/dashboard")
}

// แก้ไขข้อมูลผู้เช่า
export async function updateTenant({
  id,
  name,
  phone,
  note,
}: {
  id: string
  name: string
  phone: string | null
  note: string | null
}) {
  const supabase = createServerClient()

  const { error } = await supabase.from("tenants").update({ name, phone, note }).eq("id", id)

  if (error) {
    console.error("Error updating tenant:", error)
    throw new Error("ไม่สามารถแก้ไขข้อมูลผู้เช่าได้")
  }

  revalidatePath("/tenants")
  revalidatePath("/dashboard")
}

// ลบผู้เช่า
export async function deleteTenant(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("tenants").delete().eq("id", id)

  if (error) {
    console.error("Error deleting tenant:", error)
    throw new Error("ไม่สามารถลบผู้เช่าได้")
  }

  revalidatePath("/tenants")
  revalidatePath("/dashboard")
}
