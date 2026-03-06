import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { CartProvider } from '@/lib/cart-context'
import { products, categories } from '@/lib/data'

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary/30">
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
            New Collection 2024
          </p>
          <h1 className="mb-6 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            <span className="text-balance">Discover Your Perfect Style</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Explore our curated collection of timeless pieces designed for the modern woman. 
            Elegance meets comfort in every stitch.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[160px]">
              <Link href="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[160px]">
              <Link href="/shop?category=new">
                View New Arrivals
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -right-1/4 -top-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
    </section>
  )
}

function CategorySection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-semibold text-foreground md:text-4xl">
            Shop by Category
          </h2>
          <p className="text-muted-foreground">
            Find your style in our carefully curated collections
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/shop?category=${category.name.toLowerCase()}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-foreground/30 transition-colors group-hover:bg-foreground/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h3 className="mb-2 font-serif text-2xl font-semibold">
                  {category.name}
                </h3>
                <p className="text-sm opacity-90">{category.count} Products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedProducts() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 4)

  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-4 font-serif text-3xl font-semibold text-foreground md:text-4xl">
              Featured Collection
            </h2>
            <p className="text-muted-foreground">
              Handpicked styles for every occasion
            </p>
          </div>
          <Button asChild variant="link" className="hidden text-primary md:flex">
            <Link href="/shop">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline">
            <Link href="/shop">
              View All Products
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function TrendingSection() {
  const trendingProducts = products.filter(p => p.trending).slice(0, 4)

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
            Trending Now
          </p>
          <h2 className="mb-4 font-serif text-3xl font-semibold text-foreground md:text-4xl">
            What Everyone&apos;s Wearing
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Stay ahead of the curve with our most popular styles
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PromoSection() {
  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 font-serif text-3xl font-semibold text-primary-foreground md:text-4xl">
          Get 15% Off Your First Order
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-primary-foreground/80">
          Join our community and be the first to know about new arrivals, 
          exclusive offers, and styling tips.
        </p>
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="bg-background text-foreground hover:bg-background/90"
        >
          <Link href="/register">
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <CategorySection />
          <FeaturedProducts />
          <TrendingSection />
          <PromoSection />
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
