'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartProvider, useCart } from '@/lib/cart-context'

function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: { 
  item: { product: { id: string; name: string; price: number; image: string }; quantity: number; size: string; color: string }
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex gap-4 py-4">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-foreground">{item.product.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Size: {item.size} | Color: {item.color}
            </p>
          </div>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${item.product.name} from cart`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="font-semibold text-foreground">
            ${(item.product.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}

function CartContent() {
  const { items, updateQuantity, removeItem, total } = useCart()

  const shipping = total > 100 ? 0 : 9.99
  const tax = total * 0.08
  const grandTotal = total + shipping + tax

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 font-serif text-2xl font-semibold">Your Cart is Empty</h1>
        <p className="mb-6 text-muted-foreground">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Button asChild>
          <Link href="/shop">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-serif text-3xl font-semibold text-foreground md:text-4xl">
        Shopping Cart
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">
                {items.length} item{items.length !== 1 ? 's' : ''} in your cart
              </h2>
              <Link 
                href="/shop" 
                className="text-sm text-primary hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
            <Separator />
            <div className="divide-y divide-border">
              {items.map((item) => (
                <CartItem
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  item={item}
                  onUpdateQuantity={(quantity) => 
                    updateQuantity(item.product.id, item.size, item.color, quantity)
                  }
                  onRemove={() => removeItem(item.product.id, item.size, item.color)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-foreground">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span className="text-foreground">${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {total < 100 && (
              <p className="mt-4 text-sm text-muted-foreground">
                Add ${(100 - total).toFixed(2)} more for free shipping!
              </p>
            )}

            <Button asChild className="mt-6 w-full" size="lg">
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <CartContent />
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
