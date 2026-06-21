/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { getProducts } from '@/services/productService'
import { getCategories } from '@/services/categoryService'
import { ProductCard } from '@/components/product/ProductCard'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Product } from '@/types'

// Page props in Next.js 15 receive searchParams as a Promise
interface ShopPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    sort?: string
  }>
}

export default async function ShopPage(props: ShopPageProps) {
  // Await the searchParams Promise per Next.js 15 spec
  const params = await props.searchParams
  const search = params.search || ''
  const category = params.category || ''
  const sort = params.sort || 'newest'

  // Fetch filtered products and categories directly on the server
  let products = (await getProducts({
    search: search || undefined,
    categorySlug: category || undefined
  })) as unknown as Product[]

  const categories = await getCategories()

  // Sort products
  if (sort === 'price-asc') {
    products = [...products].sort((a, b) => a.price - b.price)
  } else if (sort === 'price-desc') {
    products = [...products].sort((a, b) => b.price - a.price)
  } else if (sort === 'rating') {
    products = [...products].sort((a, b) => b.rating - a.rating)
  }

  // Active Category info
  const activeCategoryObj = categories.find((cat) => cat.slug === category)

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">
            {activeCategoryObj ? activeCategoryObj.name : 'Mango Orchard Catalogue'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {activeCategoryObj 
              ? activeCategoryObj.description 
              : 'Browse our full collection of fresh premium mangoes, preserves, and beverage mixers.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
          Showing {products.length} delicious choices
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Active filters summary */}
          {(category || search) && (
            <div className="bg-secondary/40 p-4 rounded-xl space-y-3 border border-border/60">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>Active Filters</span>
                <Link href="/shop" className="text-accent hover:underline flex items-center gap-0.5 font-semibold text-[10px]">
                  Clear All
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {category && (
                  <Link href={`/shop${search ? `?search=${search}` : ''}`} className="inline-flex items-center gap-1 bg-background border border-border text-xs px-2.5 py-1 rounded-full text-foreground hover:text-destructive hover:bg-destructive/10 transition">
                    Category: {categories.find(c => c.slug === category)?.name}
                    <X className="h-3 w-3" />
                  </Link>
                )}
                {search && (
                  <Link href={`/shop${category ? `?category=${category}` : ''}`} className="inline-flex items-center gap-1 bg-background border border-border text-xs px-2.5 py-1 rounded-full text-foreground hover:text-destructive hover:bg-destructive/10 transition">
                    Search: "{search}"
                    <X className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Keyword Search
            </h3>
            <form action="/shop" method="GET" className="flex gap-2">
              {category && <input type="hidden" name="category" value={category} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <Input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search..."
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" className="h-9 px-3 font-semibold text-xs cursor-pointer">
                Find
              </Button>
            </form>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Orchard Categories
            </h3>
            <div className="flex flex-col gap-1 text-xs">
              <Link
                href={`/shop${search ? `?search=${search}` : ''}`}
                className={`px-3 py-2 rounded-lg font-medium transition ${
                  !category
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}${search ? `&search=${search}` : ''}`}
                  className={`px-3 py-2 rounded-lg font-medium flex justify-between items-center transition ${
                    category === cat.slug
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] ${category === cat.slug ? 'text-primary-foreground/80' : 'text-muted-foreground/60'}`}>
                    ({cat._count?.products || 0})
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Sorting Filter */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sorting
            </h3>
            <div className="flex flex-col gap-1 text-xs">
              {[
                { label: 'Newest Arrivals', value: 'newest' },
                { label: 'Price: Low to High', value: 'price-asc' },
                { label: 'Price: High to Low', value: 'price-desc' },
                { label: 'Highly Rated', value: 'rating' }
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={`/shop?sort=${opt.value}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
                  className={`px-3 py-2 rounded-lg font-medium transition ${
                    sort === opt.value
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-secondary/20 rounded-2xl border border-dashed border-border/80 min-h-[400px]">
              <Search className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-base font-semibold text-foreground">No Products Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                We couldn't find any products matching your active filters. Try clearing your search keyword or selecting a different category.
              </p>
              <Link
                href="/shop"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "mt-6 font-semibold text-xs cursor-pointer"
                )}
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
