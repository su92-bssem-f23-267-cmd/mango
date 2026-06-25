/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { ArrowRight, Leaf, ShieldCheck, Truck, RefreshCw, Star, MessageSquare } from 'lucide-react'
import { getFeaturedMangoes, getActiveVarieties, getMangoProducts } from '@/actions/shopActions'
import { MangoCard } from '@/components/product/MangoCard'
import { buttonVariants } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { cn } from '@/lib/utils'

type HomeMango = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image: string
  variety: { id: string; name: string }
}

type HomeVariety = {
  id: string
  name: string
  description?: string | null
  _count?: { mangoes?: number }
}

export default async function Home() {
  // Parallel server-side data fetching from PostgreSQL
  const [featuredRes, varietiesRes, latestRes] = await Promise.all([
    getFeaturedMangoes(),
    getActiveVarieties(),
    getMangoProducts({ sort: 'newest', limit: 4 })
  ])

  const featuredMangoes = featuredRes.success ? (featuredRes.mangoes || []) : []
  const varieties = varietiesRes.success ? (varietiesRes.varieties || []) : []
  const latestMangoes = latestRes.success ? (latestRes.mangoes || []) : []

  // Mock testimonials
  const reviews = [
    {
      id: 1,
      name: 'Sarah K.',
      rating: 5,
      comment: 'The Sindhri mangoes were exceptionally sweet and arrived perfectly chilled. Absolute top tier quality!',
      date: 'Yesterday'
    },
    {
      id: 2,
      name: 'Farooq A.',
      rating: 5,
      comment: 'Anwar Ratol is my absolute favorite. The fragrance of these mangoes filled the whole room. Highly recommended!',
      date: '3 days ago'
    },
    {
      id: 3,
      name: 'Michael T.',
      rating: 5,
      comment: 'Extremely fast delivery and the packaging was excellent. None of the mangoes were bruised.',
      date: '1 week ago'
    }
  ]

  return (
    <div className="w-full space-y-16 pb-16">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500/12 via-background via-55% to-lime-400/12 py-20 lg:py-32">
        {/* Background radial glow decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-14 relative z-10">
          {/* Hero Text */}
          <div className="max-w-2xl text-center lg:text-left space-y-7">
            <div className="inline-flex items-center space-x-2 bg-primary/12 border border-primary/30 rounded-full px-5 py-2 text-primary shadow-sm reveal-up">
              <Leaf className="h-4 w-4 text-primary fill-primary/20 animate-bounce" />
              <span className="text-xs font-extrabold uppercase tracking-widest">Premium Fresh Harvests</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-primary text-3d-green cursor-default select-none">
              Taste the Sunshine: <br />
              <span className="text-gradient-green inline-block">Fresh Fruits</span> Direct From Our Farms
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              Savor the luscious sweetness of the world&apos;s most sought-after fruits. Handpicked at peak ripeness and shipped via cold-chain logistics.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                href="/mangoes"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "font-bold cursor-pointer flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
                )}
              >
                Browse Harvests
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#varieties"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "font-bold border-primary text-primary hover:bg-primary/10 cursor-pointer rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                )}
              >
                Explore Varieties
              </Link>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="relative w-full max-w-md lg:max-w-lg aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/65 dark:border-white/10 animate-float-3d preserve-3d">
            <img
              src="/uploads/mangoes/hero-mangoes.png"
              alt="Fresh Premium Alphonso Mangoes"
              className="h-full w-full object-cover pop-z-image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-border flex items-center gap-3 shadow-xl transform translate-z-20 preserve-3d">
              <div className="bg-gradient-to-br from-amber-400/20 to-amber-600/20 h-11 w-11 rounded-full flex items-center justify-center text-amber-600 font-black text-sm translate-z-10">
                4.9
              </div>
              <div className="translate-z-10">
                <p className="text-xs font-bold text-foreground">Highest Customer Rating</p>
                <p className="text-[10px] text-muted-foreground">Certified Organic Quality</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values Section (Why Choose Us) */}
      <section className="py-14 border-y border-border/40 bg-gradient-to-b from-card/60 to-background">
        <div className="container mx-auto px-4">
          <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-amber-500/5 transition-colors duration-300">
              <div className="bg-gradient-to-br from-amber-400/15 to-amber-600/15 p-3.5 rounded-2xl text-amber-600 shrink-0 shadow-sm">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Orchard Sourced</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">100% naturally ripened using traditional organic methods.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-amber-500/5 transition-colors duration-300">
              <div className="bg-gradient-to-br from-amber-400/15 to-amber-600/15 p-3.5 rounded-2xl text-amber-600 shrink-0 shadow-sm">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Cold-Chain Shipping</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Rapid temperature controlled transit to seal the flavor.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-amber-500/5 transition-colors duration-300">
              <div className="bg-gradient-to-br from-amber-400/15 to-amber-600/15 p-3.5 rounded-2xl text-amber-600 shrink-0 shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Premium Selection</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Strict quality grading on size, color, and sugar brix level.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-amber-500/5 transition-colors duration-300">
              <div className="bg-gradient-to-br from-amber-400/15 to-amber-600/15 p-3.5 rounded-2xl text-amber-600 shrink-0 shadow-sm">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Fresh Replacements</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Any bruising or issues? Get instant free product replacements.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured Mangoes Section */}
      {featuredMangoes.length > 0 && (
        <section className="container mx-auto px-4 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Featured Harvests</h2>
              <p className="text-xs text-muted-foreground">Handpicked bestsellers in high demand this week.</p>
            </div>
            <Link href="/mangoes" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline">
              View All Catalogue
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMangoes.slice(0, 4).map((mango: HomeMango) => (
              <MangoCard key={mango.id} mango={mango} />
            ))}
          </Reveal>
        </section>
      )}

      {/* Popular Varieties Section */}
      {varieties.length > 0 && (
        <section id="varieties" className="bg-secondary/20 py-16">
          <div className="container mx-auto px-4 space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Browse Varieties</h2>
              <p className="text-xs text-muted-foreground">Select a variety to filter and explore different flavors and sizes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 card-3d-container">
              {varieties.map((varItem: HomeVariety) => (
                <Link
                  href={`/mangoes?variety=${encodeURIComponent(varItem.name)}`}
                  key={varItem.id}
                  className="card-3d-hover preserve-3d glow-mango glow-mango-hover group relative block p-6 rounded-2xl border border-border bg-card text-card-foreground"
                >
                  <div className="space-y-2 preserve-3d">
                    <span className="inline-block text-[10px] text-amber-600 font-extrabold uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full pop-z-text">
                      {varItem._count?.mangoes || 0} Harvests
                    </span>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors pop-z-text">
                      {varItem.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pop-z-text">
                      {varItem.description || 'Premium seasonal farm-fresh mango variety.'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-primary group-hover:text-accent transition-colors gap-1 pop-z-text">
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products Section */}
      {latestMangoes.length > 0 && (
        <section className="container mx-auto px-4 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Latest Arrivals</h2>
              <p className="text-xs text-muted-foreground">The newest seasonal products added straight from the packaging house.</p>
            </div>
            <Link href="/mangoes?sort=newest" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline">
              View Newest
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestMangoes.map((mango: HomeMango) => (
              <MangoCard key={mango.id} mango={mango} />
            ))}
          </Reveal>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section className="bg-gradient-to-b from-card to-background py-16 border-y border-border/40">
        <div className="container mx-auto px-4 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight flex items-center justify-center gap-2">
              <MessageSquare className="h-6 w-6 text-amber-500" />
              What Our Customers Say
            </h2>
            <p className="text-xs text-muted-foreground">Real reviews from our mango enthusiasts.</p>
          </div>

          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-6 rounded-2xl border border-border/40 bg-background hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg hover:shadow-amber-500/5">
                <div className="space-y-3">
                  <div className="flex items-center space-x-0.5 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/30 pt-3">
                  <span className="font-bold text-foreground">{rev.name}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Callout Sign Up Banner */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-emerald-900 text-primary-foreground relative overflow-hidden rounded-3xl container mx-auto px-6 shadow-2xl">
        <div className="relative z-10 max-w-xl mx-auto text-center space-y-7">
          <Leaf className="h-12 w-12 text-amber-400 fill-amber-400 mx-auto drop-shadow-lg" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Become a Premium Member</h2>
          <p className="text-sm md:text-base text-zinc-200/90 leading-relaxed">
            Create an account or login to register as a premium member, track orders, save items to your wishlist, and get first access on limited seasonal drops.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-amber-500 text-amber-950 hover:bg-amber-400 font-black cursor-pointer rounded-full px-10 shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300"
              )}
            >
              Sign Up Free
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-16 -left-16 h-64 w-64 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-64 w-64 bg-amber-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
      </section>
    </div>
  )
}
