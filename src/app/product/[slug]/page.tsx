/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { getProductBySlug } from '@/services/productService'
import { ProductDetailsClient } from '@/components/product/ProductDetailsClient'
import { Star, ArrowLeft, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types'

// Page props in Next.js 15 receive params as a Promise
interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage(props: ProductPageProps) {
  // Await the params Promise per Next.js 15 spec
  const params = await props.params
  const slug = params.slug

  // Query product directly from PostgreSQL using the Prisma data service
  const product = (await getProductBySlug(slug)) as unknown as Product

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center max-w-md">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-black text-foreground">Harvest Not Found</h1>
        <p className="text-sm text-muted-foreground mt-2">
          We couldn't find a product matching the address "/product/{slug}". It might have been sold out or seasonal availability changed.
        </p>
        <Link href="/shop" className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent transition">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side: Product Gallery */}
        <div className="relative aspect-square overflow-hidden bg-secondary/30 rounded-2xl border border-border shadow-sm">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {product.category && (
            <Badge variant="secondary" className="absolute top-4 left-4 uppercase tracking-wider font-extrabold text-[10px]">
              {product.category.name}
            </Badge>
          )}
        </div>

        {/* Right Side: Specifications and Checkout Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category and Rating */}
            <div className="flex items-center gap-4">
              {product.category && (
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  {product.category.name}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm font-black">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">(Orchard Rated)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-primary leading-tight">
              {product.name}
            </h1>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Embedded Interactive Client Section */}
          <ProductDetailsClient product={product} />
        </div>
      </div>
    </div>
  )
}
