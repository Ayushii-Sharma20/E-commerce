"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { ADMIN_API } from "@/lib/api"

export default function AdminPage() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    axios.get(`${ADMIN_API}/stats`)
      .then(res => setStats(res.data))
  }, [])

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <p>Total Orders: {stats.totalOrders}</p>
      <p>Total Revenue: ₹{stats.totalRevenue}</p>
    </div>
  )
}