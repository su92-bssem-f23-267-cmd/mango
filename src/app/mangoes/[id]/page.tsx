import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getMangoProduct } from '@/actions/shopActions'
import MangoDetailsClient from '@/components/product/MangoDetailsClient'
import { MangoCard } from '@/components/product/MangoCard'

interface MangoDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MangoDetailsPage({ params }: MangoDetailsPageProps) {
  // Await params in Next.js 15
  const resolvedParams = await params
  const { id } = resolvedParams

  const res = await getMangoProduct(id)

  if (res.error || !res.mango) {
    notFound()
  }

  const mango = res.mango
  const related = res.related || []

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Back button link */}
      <div>
        <Link href="/mangoes" className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:text-amber-600 transition">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalogue
        </Link>
      </div>

      {/* Main product presentation */}
      <MangoDetailsClient mango={mango as any} />

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="space-y-6 border-t border-border/40 pt-10">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-primary tracking-tight">You May Also Like</h2>
            <p className="text-xs text-muted-foreground">Other seasonal mango harvests of the same variety.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item: any) => (
              <MangoCard key={item.id} mango={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
