'use client'

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { PRODUCT_API } from "@/lib/api"
import { normalizeProduct } from "@/lib/product-utils"

const ITEMS_PER_PAGE = 8

function FilterSidebar({
  products,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  onReset,
}: any) {

  const categories = [...new Set(products.map((p: any) => p.category))]

  const toggleCategory = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter((c: string) => c !== category)
        : [...selectedCategories, category]
    )
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-4 font-semibold">Categories</h3>
        <div className="space-y-3">
         {categories.map((category) => {
  const cat = category as string;

  return (
    <div key={cat} className="flex items-center space-x-2">
      <Checkbox
        checked={selectedCategories.includes(cat)}
        onCheckedChange={() => toggleCategory(cat)}
      />
      <span>{cat}</span>
    </div>
  );
})}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-4 font-semibold">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          min={0}
          max={100000}
          step={1000}
        />
      </div>

      <Button onClick={onReset}>Reset Filters</Button>
    </div>
  )
}

function ShopContent() {

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)   // ✅ ADDED

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [currentPage, setCurrentPage] = useState(1)

  // ✅ FIXED FETCH
  useEffect(() => {
    PRODUCT_API.get("/")
      .then(res => {
        setProducts((res.data.products || []).map(normalizeProduct))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  // 🔍 FILTER
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const search =
        p.name.toLowerCase().includes(searchQuery.toLowerCase())

      const category =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category)

      const price =
        p.price >= priceRange[0] && p.price <= priceRange[1]

      return search && category && price
    })
  }, [products, searchQuery, selectedCategories, priceRange])

  // 📄 PAGINATION
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setPriceRange([0, 100000])
    setCurrentPage(1)
  }

  return (
    <div className="p-6">

      {/* SEARCH */}
      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="flex gap-8 mt-6">

        {/* SIDEBAR */}
        <aside className="w-64 hidden lg:block">
          <FilterSidebar
            products={products}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            onReset={resetFilters}
          />
        </aside>

        {/* PRODUCTS */}
        <div className="flex-1">

          {/* ✅ LOADING */}
          {loading ? (
            <p>Loading products...</p>
          ) : paginatedProducts.length === 0 ? (
            <p>No products found</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          <div className="mt-6 flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button key={n} onClick={() => setCurrentPage(n)}>
                {n}
              </Button>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
export default function ShopPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ShopContent />
      </main>
      <Footer />
    </div>
  )
}
