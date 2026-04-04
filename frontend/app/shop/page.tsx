"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { CartProvider } from "@/lib/cart-context";
import API from "../../lib/api";
const ITEMS_PER_PAGE = 8;

function FilterSidebar({
  products,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  onReset,
}: any) {
  const categories = [...new Set(products.map((p: any) => p.category))];

  const toggleCategory = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter((c: string) => c !== category)
        : [...selectedCategories, category]
    );
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
     <div>
  <h3 className="mb-4 font-semibold">Categories</h3>
  <div className="space-y-3">
   {categories.map((category) => (
  <div key={category as string} className="flex items-center space-x-2">
    <Checkbox
      checked={selectedCategories.includes(category as string)}
      onCheckedChange={() => toggleCategory(category as string)}
    />
    <span>{category as string}</span>
  </div>
))}
   
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
  );
}

function ShopContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
  console.log("API:", API);
  console.log("TYPE:", typeof API.get);

  API.get("/products")
    .then(res => {
      console.log("DATA:", res.data); // optional
      setProducts(res.data);
    })
    .catch(err => console.error(err));
}, []);

  // 🔍 FILTER
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const search =
        p.name.toLowerCase().includes(searchQuery.toLowerCase());

      const category =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);

      const price = p.price >= priceRange[0] && p.price <= priceRange[1];

      return search && category && price;
    });
  }, [products, searchQuery, selectedCategories, priceRange]);

  // 📄 PAGINATION
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      {/* Search */}
      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="flex gap-8 mt-6">
        {/* Sidebar */}
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

        {/* Products */}
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4">
            {paginatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* Pagination */}
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
  );
}

export default function ShopPage() {
  return (
    <CartProvider>
      <Navbar />
      <ShopContent />
      <Footer />
    </CartProvider>
  );
}