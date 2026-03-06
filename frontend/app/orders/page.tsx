'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'
import { sampleOrders } from '@/lib/data'
import { Order } from '@/lib/types'

const statusConfig: Record<Order['status'], { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', icon: Clock, variant: 'secondary' },
  processing: { label: 'Processing', icon: Package, variant: 'default' },
  shipped: { label: 'Shipped', icon: Truck, variant: 'default' },
  delivered: { label: 'Delivered', icon: CheckCircle, variant: 'outline' },
  cancelled: { label: 'Cancelled', icon: XCircle, variant: 'destructive' }
}

function OrderCard({ order }: { order: Order }) {
  
  const status = statusConfig[order.status]
  const StatusIcon = status.icon

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-medium">
            Order {order.id}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on {new Date(order.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <Badge variant={status.variant} className="flex items-center gap-1">
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Items Preview */}
          <div className="flex flex-wrap gap-3">
            {order.items.slice(0, 3).map((item, index) => (
              <div 
                key={`${item.product.id}-${index}`}
                className="relative h-16 w-16 overflow-hidden rounded-lg bg-secondary"
              >
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-sm font-medium text-muted-foreground">
                +{order.items.length - 3}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} item{order.items.length !== 1 ? 's' : ''}
              </p>
              <p className="font-semibold">Total: ${order.total.toFixed(2)}</p>
            </div>
            <Button variant="outline" size="sm">
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrdersContent() {
  if (sampleOrders.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
        <Package className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 font-serif text-2xl font-semibold">No Orders Yet</h1>
        <p className="mb-6 text-muted-foreground">
          You haven&apos;t placed any orders yet. Start shopping to see your orders here.
        </p>
        <Button asChild>
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground md:text-4xl">
          Order History
        </h1>
        <p className="text-muted-foreground">
          Track and manage your orders
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sampleOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <OrdersContent />
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
