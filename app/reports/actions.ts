"use server"

import { createServerClient } from "@/lib/supabase/server"

// ดึงข้อมูลรายงานรายได้
export async function getIncomeReport() {
  const supabase = createServerClient()

  // ดึงข้อมูลการชำระเงินทั้งหมด
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .order("month", { ascending: false })

  if (paymentsError) {
    console.error("Error fetching payments:", paymentsError)
    throw new Error("ไม่สามารถดึงข้อมูลการชำระเงินได้")
  }

  // คำนวณรายได้ทั้งหมด
  const totalIncome = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

  // คำนวณรายได้ที่ชำระแล้ว
  const paidIncome = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)

  // คำนวณรายได้ที่รอชำระ
  const pendingIncome = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)

  // จัดกลุ่มรายได้ตามเดือน
  const monthlyIncomeMap = new Map()

  payments.forEach((payment) => {
    if (payment.month) {
      const month = payment.month
      const amount = payment.amount || 0

      if (monthlyIncomeMap.has(month)) {
        monthlyIncomeMap.set(month, monthlyIncomeMap.get(month) + amount)
      } else {
        monthlyIncomeMap.set(month, amount)
      }
    }
  })

  // แปลงเป็นอาร์เรย์และเรียงตามเดือน
  const monthlyIncome = Array.from(monthlyIncomeMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))

  return {
    totalIncome,
    paidIncome,
    pendingIncome,
    monthlyIncome,
  }
}

// ดึงข้อมูลรายงานอัตราการเข้าพัก
export async function getOccupancyReport() {
  const supabase = createServerClient()

  // ดึงข้อมูลห้องพักทั้งหมด
  const { data: rooms, error: roomsError } = await supabase.from("rooms").select("*, dorm:dorm_id(id, name)")

  if (roomsError) {
    console.error("Error fetching rooms:", roomsError)
    throw new Error("ไม่สามารถดึงข้อมูลห้องพักได้")
  }

  // จำนวนห้องทั้งหมด
  const totalRooms = rooms.length

  // จำนวนห้องที่มีผู้เช่า
  const occupiedRooms = rooms.filter((room) => room.status !== "ว่าง").length

  // จำนวนห้องว่าง
  const vacantRooms = totalRooms - occupiedRooms

  // อัตราการเข้าพัก (%)
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  // จัดกลุ่มตามหอพัก
  const dormitoryMap = new Map()

  rooms.forEach((room) => {
    const dormId = room.dorm?.id
    const dormName = room.dorm?.name || "ไม่ระบุหอพัก"
    const isOccupied = room.status !== "ว่าง"

    if (!dormitoryMap.has(dormId)) {
      dormitoryMap.set(dormId, {
        id: dormId,
        name: dormName,
        totalRooms: 0,
        occupiedRooms: 0,
        vacantRooms: 0,
      })
    }

    const dormData = dormitoryMap.get(dormId)
    dormData.totalRooms += 1
    if (isOccupied) {
      dormData.occupiedRooms += 1
    } else {
      dormData.vacantRooms += 1
    }
  })

  // คำนวณอัตราการเข้าพักของแต่ละหอพัก
  const dormitoryOccupancy = Array.from(dormitoryMap.values()).map((dorm) => ({
    ...dorm,
    occupancyRate: dorm.totalRooms > 0 ? Math.round((dorm.occupiedRooms / dorm.totalRooms) * 100) : 0,
  }))

  return {
    totalRooms,
    occupiedRooms,
    vacantRooms,
    occupancyRate,
    dormitoryOccupancy,
  }
}

// ดึงข้อมูลรายงานสถานะการชำระเงิน
export async function getPaymentStatusReport() {
  const supabase = createServerClient()

  // ดึงข้อมูลการชำระเงินทั้งหมด
  const { data: payments, error: paymentsError } = await supabase.from("payments").select("*")

  if (paymentsError) {
    console.error("Error fetching payments:", paymentsError)
    throw new Error("ไม่สามารถดึงข้อมูลการชำระเงินได้")
  }

  // จำนวนการชำระเงินทั้งหมด
  const totalPayments = payments.length

  // จำนวนการชำระเงินที่ชำระแล้ว
  const paidCount = payments.filter((payment) => payment.status === "paid").length

  // จำนวนการชำระเงินที่รอชำระ
  const pendingCount = payments.filter((payment) => payment.status === "pending").length

  // จำนวนการชำระเงินที่ยกเลิก
  const cancelledCount = payments.filter((payment) => payment.status === "cancelled").length

  // อัตราการชำระเงินที่ชำระแล้ว (%)
  const paidRate = totalPayments > 0 ? Math.round((paidCount / totalPayments) * 100) : 0

  // อัตราการชำระเงินที่รอชำระ (%)
  const pendingRate = totalPayments > 0 ? Math.round((pendingCount / totalPayments) * 100) : 0

  // อัตราการชำระเงินที่ยกเลิก (%)
  const cancelledRate = totalPayments > 0 ? Math.round((cancelledCount / totalPayments) * 100) : 0

  // ดึงข้อมูลการชำระเงินล่าสุด 5 รายการ
  const { data: recentPaymentsData, error: recentPaymentsError } = await supabase
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

  if (recentPaymentsError) {
    console.error("Error fetching recent payments:", recentPaymentsError)
    throw new Error("ไม่สามารถดึงข้อมูลการชำระเงินล่าสุดได้")
  }

  // แปลงข้อมูลการชำระเงินล่าสุดให้อยู่ในรูปแบบที่ต้องการ
  const recentPayments = recentPaymentsData.map((payment) => ({
    id: payment.id,
    month: payment.month,
    amount: payment.amount,
    status: payment.status,
    tenant_name: payment.contract?.tenant?.name || "ไม่ระบุชื่อ",
    room_name: payment.contract?.room?.name || "ไม่ระบุห้อง",
  }))

  return {
    totalPayments,
    paidCount,
    pendingCount,
    cancelledCount,
    paidRate,
    pendingRate,
    cancelledRate,
    recentPayments,
  }
}
