"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ดึงข้อมูลการชำระเงินทั้งหมด
export async function getPayments() {
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
          name,
          dorm:dorm_id (
            name
          )
        )
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
    throw new Error("ไม่สามารถดึงข้อมูลการชำระเงินได้")
  }

  return data || []
}

// ดึงข้อมูลสัญญาเช่าสำหรับการชำระเงิน
export async function getContractsForPayment() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("contracts")
    .select(
      `
      id,
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
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contracts for payment:", error)
    throw new Error("ไม่สามารถดึงข้อมูลสัญญาเช่าได้")
  }

  // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
  return (
    data?.map((contract) => ({
      id: contract.id,
      tenant_name: contract.tenant?.name || "ไม่ระบุชื่อ",
      room_name: contract.room?.name || "ไม่ระบุห้อง",
      dorm_name: contract.room?.dorm?.name || "ไม่ระบุหอพัก",
    })) || []
  )
}

// เพิ่มการชำระเงินใหม่
export async function addPayment({
  contractId,
  month,
  amount,
  status,
  paidAt,
  note,
}: {
  contractId: string
  month: string
  amount: number
  status: string
  paidAt: string | null
  note: string | null
}) {
  const supabase = createServerClient()

  const { error } = await supabase.from("payments").insert({
    contract_id: contractId,
    month,
    amount,
    status,
    paid_at: paidAt,
    note,
  })

  if (error) {
    console.error("Error adding payment:", error)
    throw new Error("ไม่สามารถเพิ่มการชำระเงินได้")
  }

  revalidatePath("/payments")
  revalidatePath("/dashboard")
  revalidatePath("/reports")
}

// แก้ไขการชำระเงิน
export async function updatePayment({
  id,
  contractId,
  month,
  amount,
  status,
  paidAt,
  note,
}: {
  id: string
  contractId: string
  month: string
  amount: number
  status: string
  paidAt: string | null
  note: string | null
}) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("payments")
    .update({
      contract_id: contractId,
      month,
      amount,
      status,
      paid_at: paidAt,
      note,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating payment:", error)
    throw new Error("ไม่สามารถแก้ไขการชำระเงินได้")
  }

  revalidatePath("/payments")
  revalidatePath("/dashboard")
  revalidatePath("/reports")
}

// ลบการชำระเงิน
export async function deletePayment(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("payments").delete().eq("id", id)

  if (error) {
    console.error("Error deleting payment:", error)
    throw new Error("ไม่สามารถลบการชำระเงินได้")
  }

  revalidatePath("/payments")
  revalidatePath("/dashboard")
  revalidatePath("/reports")
}
