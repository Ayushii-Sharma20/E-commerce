'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id') || 'ORD-000000'

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="pt-8">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
            Order Confirmed!
          </h1>
          <p className="mb-6 text-muted-foreground">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          <div className="mb-6 rounded-lg bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="text-lg font-semibold text-foreground">{orderId}</p>
          </div>

          <div className="mb-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Estimated Delivery</p>
                <p className="text-sm text-muted-foreground">3-5 business days</p>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address with the order details 
              and tracking information.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/orders">
                View Order Details
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={
            <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
              <p>Loading...</p>
            </div>
          }>
            <OrderConfirmationContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
