import Link from 'next/link'
import { getMangoProducts, getActiveVarieties } from '@/actions/shopActions'
import { MangoCard } from '@/components/product/MangoCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface MangoesPageProps {
  searchParams: Promise<{
    search?: string
    variety?: string
    minPrice?: string
    maxPrice?: string
    stockStatus?: string
    sort?: string
    page?: string
  }>
}

export default async function MangoesPage({ searchParams }: MangoesPageProps) {
  // Await searchParams in Next.js 15
  const resolvedParams = await searchParams
  
  const search = resolvedParams.search || ''
  const variety = resolvedParams.variety || ''
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined
  const stockStatus = resolvedParams.stockStatus as 'in-stock' | 'out-of-stock' | undefined
  const sort = (resolvedParams.sort || 'newest') as any
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1

  // Fetch data
  const [productsRes, varietiesRes] = await Promise.all([
    getMangoProducts({
      search,
      variety,
      minPrice,
      maxPrice,
      stockStatus,
      sort,
      page,
      limit: 9
    }),
    getActiveVarieties()
  ])

  const mangoes = productsRes.success ? (productsRes.mangoes || []) : []
  const totalItems = productsRes.success ? (productsRes.total || 0) : 0
  const totalPages = productsRes.success ? (productsRes.pages || 1) : 1
  const varieties = varietiesRes.success ? (varietiesRes.varieties || []) : []

  // Helper to construct query strings
  const getQueryString = (updatedParams: Record<string, string | number | undefined | null>) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (variety) params.set('variety', variety)
    if (minPrice !== undefined) params.set('minPrice', minPrice.toString())
    if (maxPrice !== undefined) params.set('maxPrice', maxPrice.toString())
    if (stockStatus) params.set('stockStatus', stockStatus)
    if (sort && sort !== 'newest') params.set('sort', sort)
    if (page && page > 1) params.set('page', page.toString())

    Object.entries(updatedParams).forEach(([key, val]) => {
      if (val === null || val === undefined) {
        params.delete(key)
      } else {
        params.set(key, val.toString())
      }
    })

    const str = params.toString()
    return str ? `?${str}` : ''
  }

  const activeFiltersCount = 
    (search ? 1 : 0) + 
    (variety ? 1 : 0) + 
    (minPrice !== undefined ? 1 : 0) + 
    (maxPrice !== undefined ? 1 : 0) + 
    (stockStatus ? 1 : 0)

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-border/30 pb-5">
        <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight text-3d-green cursor-default select-none">Browse Our Harvest</h1>
        <p className="text-sm text-muted-foreground">Select from fresh, premium, natural mangoes hand-selected for sweetness.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-7 bg-card/50 p-6 rounded-2xl border border-border/30 h-fit">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="h-6 w-6 text-primary" />
              Filters
            </h2>
            {activeFiltersCount > 0 && (
              <Link
                href="/mangoes"
                className="text-xs font-bold text-destructive hover:underline flex items-center gap-1.5 bg-destructive/5 px-3 py-1 rounded-full"
              >
                Clear All <X className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Search Filter (Fallback/Sidebar) */}
          <div className="space-y-3">
            <label className="text-base font-black text-foreground uppercase tracking-widest block">Search</label>
            <form action="/mangoes" method="GET" className="relative">
              <Input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="Search name or variety..."
                className="pl-10 text-base py-3 bg-secondary/35 border-border/60 h-12 font-medium"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              {/* Keep other active filters as hidden inputs */}
              {variety && <input type="hidden" name="variety" value={variety} />}
              {minPrice !== undefined && <input type="hidden" name="minPrice" value={minPrice} />}
              {maxPrice !== undefined && <input type="hidden" name="maxPrice" value={maxPrice} />}
              {stockStatus && <input type="hidden" name="stockStatus" value={stockStatus} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
            </form>
          </div>

          {/* Variety Filter */}
          <div className="space-y-3">
            <label className="text-base font-black text-foreground uppercase tracking-widest block">Varieties</label>
            <div className="flex flex-col gap-2 text-base">
              <Link
                href={getQueryString({ variety: null, page: 1 })}
                className={`flex justify-between items-center px-3 py-3 rounded-lg transition text-base ${!variety ? 'bg-primary/10 text-primary font-black' : 'hover:bg-secondary/40 text-muted-foreground font-semibold'}`}
              >
                <span>All Varieties</span>
              </Link>
              {varieties.map((v: any) => (
                <Link
                  key={v.id}
                  href={getQueryString({ variety: v.name, page: 1 })}
                  className={`flex justify-between items-center px-3 py-3 rounded-lg transition text-base ${variety.toLowerCase() === v.name.toLowerCase() ? 'bg-primary/10 text-primary font-black' : 'hover:bg-secondary/40 text-muted-foreground font-semibold'}`}
                >
                  <span>{v.name}</span>
                  <span className="text-sm bg-secondary px-2.5 py-1 rounded-full font-bold">{v._count?.mangoes || 0}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <label className="text-base font-black text-foreground uppercase tracking-widest block">Price Range</label>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href={getQueryString({ minPrice: undefined, maxPrice: 2000, page: 1 })}
                className={`p-3.5 border border-border/60 rounded-xl text-center text-base font-bold transition-all duration-200 ${minPrice === undefined && maxPrice === 2000 ? 'bg-primary/15 border-primary/40 text-primary font-black shadow-sm' : 'hover:bg-amber-500/5 hover:border-amber-500/30'}`}
              >
                Under Rs. 2,000
              </Link>
              <Link
                href={getQueryString({ minPrice: 2000, maxPrice: 3500, page: 1 })}
                className={`p-3.5 border border-border/60 rounded-xl text-center text-base font-bold transition-all duration-200 ${minPrice === 2000 && maxPrice === 3500 ? 'bg-primary/15 border-primary/40 text-primary font-black shadow-sm' : 'hover:bg-amber-500/5 hover:border-amber-500/30'}`}
              >
                Rs. 2,000 - 3,500
              </Link>
              <Link
                href={getQueryString({ minPrice: 3500, maxPrice: undefined, page: 1 })}
                className={`p-3.5 border border-border/60 rounded-xl text-center text-base font-bold transition-all duration-200 ${minPrice === 3500 && maxPrice === undefined ? 'bg-primary/15 border-primary/40 text-primary font-black shadow-sm' : 'hover:bg-amber-500/5 hover:border-amber-500/30'}`}
              >
                Over Rs. 3,500
              </Link>
              <Link
                href={getQueryString({ minPrice: null, maxPrice: null, page: 1 })}
                className={`p-3.5 border border-border/60 rounded-xl text-center text-base font-bold transition-all duration-200 hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive ${minPrice === undefined && maxPrice === undefined ? 'hidden' : ''}`}
              >
                Reset Price
              </Link>
            </div>
          </div>

          {/* Stock Status Filter */}
          <div className="space-y-3">
            <label className="text-base font-black text-foreground uppercase tracking-widest block">Stock Status</label>
            <div className="flex flex-col gap-2 text-base">
              <Link
                href={getQueryString({ stockStatus: null, page: 1 })}
                className={`flex items-center px-3 py-3 rounded-lg transition text-base ${!stockStatus ? 'bg-primary/10 text-primary font-black' : 'hover:bg-secondary/40 text-muted-foreground font-semibold'}`}
              >
                All Status
              </Link>
              <Link
                href={getQueryString({ stockStatus: 'in-stock', page: 1 })}
                className={`flex items-center px-3 py-3 rounded-lg transition text-base ${stockStatus === 'in-stock' ? 'bg-primary/10 text-primary font-black' : 'hover:bg-secondary/40 text-muted-foreground font-semibold'}`}
              >
                Available In-Stock
              </Link>
              <Link
                href={getQueryString({ stockStatus: 'out-of-stock', page: 1 })}
                className={`flex items-center px-3 py-3 rounded-lg transition text-base ${stockStatus === 'out-of-stock' ? 'bg-primary/10 text-primary font-black' : 'hover:bg-secondary/40 text-muted-foreground font-semibold'}`}
              >
                Out of Stock
              </Link>
            </div>
          </div>
        </aside>

        {/* Product List Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top sorting controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-secondary/15 p-4 rounded-2xl border border-border/40">
            <span className="text-xs text-muted-foreground">
              Showing <strong className="text-foreground">{mangoes.length}</strong> of <strong className="text-foreground">{totalItems}</strong> mango products
            </span>
            
            {/* Sorting selectors */}
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <span className="text-muted-foreground font-medium">Sort By:</span>
              <div className="flex bg-background border border-border rounded-lg p-0.5 shadow-sm">
                <Link
                  href={getQueryString({ sort: 'newest', page: 1 })}
                  className={`px-3 py-1 rounded-md transition-all ${sort === 'newest' ? 'bg-primary text-primary-foreground font-bold shadow-inner' : 'hover:bg-secondary/50 text-muted-foreground'}`}
                >
                  Newest
                </Link>
                <Link
                  href={getQueryString({ sort: 'price-asc', page: 1 })}
                  className={`px-3 py-1 rounded-md transition-all ${sort === 'price-asc' ? 'bg-primary text-primary-foreground font-bold shadow-inner' : 'hover:bg-secondary/50 text-muted-foreground'}`}
                >
                  Price: Low-High
                </Link>
                <Link
                  href={getQueryString({ sort: 'price-desc', page: 1 })}
                  className={`px-3 py-1 rounded-md transition-all ${sort === 'price-desc' ? 'bg-primary text-primary-foreground font-bold shadow-inner' : 'hover:bg-secondary/50 text-muted-foreground'}`}
                >
                  Price: High-Low
                </Link>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          {mangoes.length === 0 ? (
            <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-border/30 max-w-xl mx-auto space-y-4">
              <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-bold text-foreground">No harvests match your filters</h3>
                <p className="text-xs text-muted-foreground mt-1">Try resetting search parameters or selecting another variety.</p>
              </div>
              <Link href="/mangoes" className="inline-flex justify-center items-center bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4 py-2 rounded-full text-xs cursor-pointer shadow-sm">
                Reset All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mangoes.map((mango: any) => (
                <MangoCard key={mango.id} mango={mango} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6 border-t border-border/40">
              <Link
                href={getQueryString({ page: Math.max(1, page - 1) })}
                className={`px-3 py-1.5 rounded-full border border-border bg-card text-xs font-bold transition hover:bg-secondary ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
              >
                Previous
              </Link>
              <div className="text-xs text-muted-foreground font-semibold">
                Page {page} of {totalPages}
              </div>
              <Link
                href={getQueryString({ page: Math.min(totalPages, page + 1) })}
                className={`px-3 py-1.5 rounded-full border border-border bg-card text-xs font-bold transition hover:bg-secondary ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
              >
                Next
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
