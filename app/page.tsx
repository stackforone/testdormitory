import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default async function Home() {
  const isLoggedIn = await isAuthenticated()

  if (isLoggedIn) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }

  return null
}
