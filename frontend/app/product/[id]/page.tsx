'use client'

import { useEffect, useState } from "react"
import Image from 'next/image'
import Link from 'next/link'
import { Star, Minus, Plus, ShoppingBag, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import {  useCart } from '@/lib/cart-context'
import { products } from '@/lib/data'
import { ORDER_API } from "@/lib/api";
import { useRouter } from "next/navigation"
function ProductDetailContent({ id }: { id: string }) {
const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const { addItem } = useCart()

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  // ✅ Fetch product
  useEffect(() => {
    fetch(`http://localhost:3002/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  // ✅ Loading
  if (loading) {
    return <p className="text-center py-10">Loading...</p>
  }

  // ❌ Not found
  if (!product) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Product Not Found</h1>
        <Button asChild>
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    )
  }

  // ✅ ENHANCED PRODUCT (ADD AFTER PRODUCT CHECK)
  const enhancedProduct = {
  ...product,
  sizes: ["S", "M", "L"],
  colors: ["Red", "Black"],
}

const handleAddToCart = () => {
  if (!selectedSize || !selectedColor) {
    alert("Please select size and color")
    return
  }

  addItem(enhancedProduct, quantity, selectedSize, selectedColor)


  // ✅ Redirect to cart
  router.push("/cart")
}
  return (
    <div className="container mx-auto px-4 py-8">

      {/* Back */}
      <Link href="/shop" className="mb-6 inline-flex items-center text-sm">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">

        {/* IMAGE */}
        <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
          <Image
            src={enhancedProduct.image}
            alt={enhancedProduct.name}
            fill
            className="object-cover"
          />
        </div>

        {/* DETAILS */}
        <div>

          <p className="text-sm text-primary mb-2">
            {enhancedProduct.category}
          </p>

          <h1 className="text-3xl font-semibold mb-2">
            {enhancedProduct.name}
          </h1>

          {/* ⭐ Rating */}
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span>{enhancedProduct.rating}</span>
            <span className="text-muted-foreground">
              ({enhancedProduct.reviews} reviews)
            </span>
          </div>

          <p className="text-xl font-bold mb-4">
            ₹{enhancedProduct.price}
          </p>

          <p className="text-muted-foreground mb-6">
            {enhancedProduct.description}
          </p>

          {/* SIZE */}
          <div className="mb-4">
            <p className="mb-2 font-medium">Size</p>
            <Select onValueChange={setSelectedSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {enhancedProduct.sizes.map((size: string) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* COLOR */}
          <div className="mb-4">
            <p className="mb-2 font-medium">Color</p>
            <Select onValueChange={setSelectedColor}>
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {enhancedProduct.colors.map((color: string) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* QUANTITY */}
          <div className="flex items-center gap-3 mb-6">
            <Button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
              <Minus />
            </Button>
            <span>{quantity}</span>
            <Button onClick={() => setQuantity(q => q + 1)}>
              <Plus />
            </Button>
          </div>

          {/* ADD TO CART */}
         <Button onClick={handleAddToCart}>
  Add to Cart
</Button>

        </div>
      </div>
    </div>
  )
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ProductDetailContent id={params.id} />
      </main>
      <Footer />
   </>
  )
}