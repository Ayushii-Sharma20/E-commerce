'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ORDER_API } from '@/lib/api'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await ORDER_API.get(`/${id}`)
        setOrder(res.data.order)
      } catch (err) {
        console.error("❌ Error fetching order:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  // ✅ Loading state
  if (loading) {
    return <p className="text-center mt-10">Loading...</p>
  }

  // ❌ If no order
  if (!order) {
    return <p className="text-center mt-10">Order not found</p>
  }

  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 py-10">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold mb-6">
          Order Details
        </h1>

        {/* MAIN CARD */}
        <Card className="mb-6">
          <CardHeader className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{order._id}</p>
            </div>

            <Badge className="capitalize">
              {order.status || 'Processing'}
            </Badge>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-gray-500 mb-2">
              Placed on{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "N/A"}
            </p>

            <p className="text-lg font-semibold">
              Total: ₹{order.totalAmount || 0}
            </p>
          </CardContent>
        </Card>

        {/* ITEMS */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-2">
            Items
          </h2>

          {/* ✅ SAFE CHECK */}
          {order.items && order.items.length > 0 ? (
            order.items.map((item: any, index: number) => (
              <Card key={index}>
                <CardContent className="flex gap-4 items-center p-4">

                  {/* IMAGE */}
                  <div className="relative w-20 h-20 rounded overflow-hidden bg-gray-100">
                   <Image
  src={
    item.image
      ? item.image.startsWith("http")
        ? item.image
        : `http://localhost:3002${item.image}`
      : "https://via.placeholder.com/150"
  }
  alt={item.name || "Product"}
  fill
  className="object-cover"
/>
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.name || "Product"}
                    </p>

                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity || 0}
                    </p>

                    <p className="text-sm text-gray-500">
                      Price: ₹{item.price || 0}
                    </p>
                  </div>

                  {/* SUBTOTAL */}
                  <div className="font-semibold">
                    ₹{(item.quantity || 0) * (item.price || 0)}
                  </div>

                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500">No items found</p>
          )}
        </div>

      </div>

      <Footer />
    </>
  )
}
