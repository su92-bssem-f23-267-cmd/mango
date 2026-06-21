import Link from 'next/link'
import { notFound } from 'next/navigation'
import db from '@/lib/db'
import { CheckCircle2, ArrowRight, ShieldCheck, Calendar, User, Mail, MapPin } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Page props in Next.js 15 receive params as a Promise
interface OrderSuccessPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderSuccessPage(props: OrderSuccessPageProps) {
  // Await the params Promise per Next.js 15 spec
  const params = await props.params
  const orderId = params.id

  // Query order directly from PostgreSQL with relations
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      address: true,
      orderItems: {
        include: {
          mango: true
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  // Calculate estimated delivery date (3 days from now)
  const deliveryDate = new Date(order.createdAt)
  deliveryDate.setDate(deliveryDate.getDate() + 3)

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      {/* Header Success Alert Banner */}
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-10 w-10 fill-emerald-100 dark:fill-emerald-950/20" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary tracking-tight">Order Placed Successfully!</h1>
          <p className="text-sm text-muted-foreground">
            Thank you for shopping at Mango Mart. Your harvest has been reserved.
          </p>
        </div>
      </div>

      {/* Invoice Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Shipment Details */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-foreground/75 shrink-0" />
              <span>Recipient: <strong className="text-foreground">{order.user.name || order.address.fullName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-foreground/75 shrink-0" />
              <span>Invoice Email: <strong className="text-foreground">{order.user.email}</strong></span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-foreground/75 mt-0.5 shrink-0" />
              <span>Address: <strong className="text-foreground">{order.address.address}, {order.address.area}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Estimated Delivery Time */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              Delivery Promise
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>Est. Delivery: <strong className="text-emerald-600 font-semibold">{deliveryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            </div>
            <div className="flex items-start gap-1.5 bg-secondary/35 border border-border/80 p-3 rounded-xl mt-2">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Your mangoes are packed inside shock-absorbent thermal pulpy sleeves and shipped via temperature-controlled delivery.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items Summary */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 pt-0 text-xs">
          {/* Invoice ID and Date */}
          <div className="py-3 flex justify-between items-center text-muted-foreground">
            <span>Invoice ID: <strong className="text-foreground">{order.id}</strong></span>
            <span>Date: <strong className="text-foreground">{new Date(order.createdAt).toLocaleDateString()}</strong></span>
          </div>

          {/* Product rows */}
          <div className="py-4 space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-semibold text-foreground">{item.mango.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Quantity: {item.quantity} x Rs. {Number(item.price).toLocaleString()}</p>
                </div>
                <span className="font-bold text-primary">
                  Rs. {Number(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-4 flex justify-between items-center text-base font-black text-primary">
            <span>Amount Paid</span>
            <span>Rs. {Number(order.totalAmount).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-center pt-2">
        <Link
          href="/profile/orders"
          className={cn(
            buttonVariants({ size: "lg" }),
            "font-bold cursor-pointer shadow-sm flex items-center gap-2"
          )}
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
