'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import {
  Package,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

/* =========================
   STATUS CONFIG
========================= */
const statusConfig: any = {
  pending: { label: 'Pending', icon: Clock, variant: 'secondary' },
  processing: { label: 'Processing', icon: Package, variant: 'default' },
  shipped: { label: 'Shipped', icon: Truck, variant: 'default' },
  delivered: { label: 'Delivered', icon: CheckCircle, variant: 'outline' },
  cancelled: { label: 'Cancelled', icon: XCircle, variant: 'destructive' }
}

/* =========================
   ORDER CARD
========================= */
function OrderCard({ order }: any) {
  const status = statusConfig[order.status] || statusConfig.processing
  const StatusIcon = status.icon

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-medium">
            Order {order._id}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <Badge variant={status.variant} className="flex items-center gap-1">
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">

          {/* Images */}
          <div className="flex gap-3">
            {order.items?.slice(0, 3).map((item: any, index: number) => (
              <div
                key={index}
                className="relative h-16 w-16 overflow-hidden rounded-lg bg-secondary"
              >
               <Image
  src={item.image || '/placeholder.png'}
  alt={item.name || 'Product'}
  fill
  className="object-cover"
/>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {order.items?.length || 0} items
              </p>
              <p className="font-semibold">
                Total: ₹{order.totalAmount}
              </p>
            </div>

            {/* ✅ FIXED LINK */}
            <Link href={`/orders/${order._id}`}>
              <Button variant="outline" size="sm">
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* =========================
   ORDERS CONTENT
========================= */
function OrdersContent() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Get real logged-in userId from browser

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      // ✅ Get userId inside useEffect (safer)
      const userId = localStorage.getItem("userId")

      // ❗ Stop if no userId
      if (!userId) {
        console.error("❌ No userId found. User not logged in.")
        setLoading(false)
        return
      }

      console.log("👉 Fetching orders for:", userId)

      const res = await fetch(
        `http://localhost:3003/api/orders/user/${userId}`
      )

      const data = await res.json()

      setOrders(data)

    } catch (err) {
      console.error("❌ Order fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchOrders()
}, [])

  if (loading) {
    return <p className="text-center mt-10">Loading orders...</p>
  }

  if (orders.length === 0) {
    return (
      <div className="text-center mt-10">
        <p>No orders found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">
        Order History
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  )
}

/* =========================
   PAGE
========================= */
export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <OrdersContent />
      </main>
      <Footer />
    </div>
  )
}