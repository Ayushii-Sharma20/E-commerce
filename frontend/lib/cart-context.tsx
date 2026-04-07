'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CartItem, Product } from './types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity: number, size: string, color: string) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (product: Product, quantity: number, size: string, color: string) => {
    const matchedVariant = product.variants?.find((variant) => variant.color === color)
    const cartProduct = matchedVariant ? { ...product, image: matchedVariant.image } : product

    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product._id === product._id && item.size === size && item.color === color
      )
      
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity += quantity
        updated[existingIndex].product = cartProduct
        return updated
        
        
      }
      
      return [...prev, { product: cartProduct, quantity, size, color }]
    })
  }

  const removeItem = (productId: string, size: string, color: string) => {
    setItems(prev => prev.filter(
      item => !(item.product._id === productId && item.size === size && item.color === color)
    ))
  }

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size, color)
      return
    }
    
    setItems(prev => prev.map(item => {
      if (item.product._id === productId && item.size === size && item.color === color) {
        return { ...item, quantity }
      }
      return item
    }))
  }

  const clearCart = () => setItems([])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
