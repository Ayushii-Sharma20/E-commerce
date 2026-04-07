'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const defaultSize = product.sizes?.[0] || "M"
  const defaultColor = product.colors?.[0] || "Black"
  const [selectedColor, setSelectedColor] = useState(defaultColor)

  const imageSrc = useMemo(() => {
    const matchedVariant = product.variants?.find((variant) => variant.color === selectedColor)
    return matchedVariant?.image || product.image || "/placeholder.jpg"
  }, [product.image, product.variants, selectedColor])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1, defaultSize, selectedColor)
  }

  return (
    <Link href={`/product/${product._id}`}>
      <Card className="group overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {product.originalPrice && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Sale
            </span>
          )}
          <div className="absolute bottom-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="icon"
              onClick={handleAddToCart}
              className="h-10 w-10 rounded-full shadow-lg"
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mb-2 line-clamp-1 font-medium text-foreground">
            {product.name}
          </h3>
          {product.colors.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedColor(color)
                  }}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    selectedColor === color
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          )}
          <div className="mb-2 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
