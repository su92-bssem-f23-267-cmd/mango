import Link from 'next/link'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { User, Mail, ShoppingBag, Heart, Calendar, ShieldCheck, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center max-w-md space-y-5">
        <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground">
          <User className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Access Denied</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please sign in to view your dashboard, order history, and account settings.
          </p>
        </div>
        <Link
          href="/login?callbackUrl=/profile"
          className={cn(buttonVariants({ size: "lg" }), "font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6")}
        >
          Sign In
        </Link>
      </div>
    )
  }

  const userId = session.user.id

  // Fetch metrics in parallel from database
  const [orderCount, wishlistCount, orders] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.wishlist.count({ where: { userId } }),
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        orderItems: {
          include: {
            mango: true
          }
        }
      },
      take: 5 // Latest 5 orders
    })
  ])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner Header */}
      <div className="space-y-1.5 border-b border-border/40 pb-4">
        <h1 className="text-3xl font-black text-primary tracking-tight">Your Dashboard</h1>
        <p className="text-xs text-muted-foreground">Welcome back, {session.user.name || 'Mango Enthusiast'}. Manage your profile and track active orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Card & Summary stats */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="text-center pb-4 border-b border-border/40">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-3xl mx-auto shadow-inner border border-primary/20">
                {(session.user.name || 'U')[0].toUpperCase()}
              </div>
              <CardTitle className="text-lg font-bold text-foreground mt-4 leading-tight">
                {session.user.name}
              </CardTitle>
              <CardDescription className="text-xs flex items-center justify-center gap-1.5 mt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                {session.user.role || 'USER'} Account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-foreground/80 shrink-0" />
                <span>Full Name: <strong className="text-foreground">{session.user.name}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-foreground/80 shrink-0" />
                <span className="truncate">Email Address: <strong className="text-foreground">{session.user.email}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/profile/orders" className="block">
              <Card className="shadow-sm border-border/60 text-center p-4 hover:border-accent transition duration-300">
                <ShoppingBag className="h-6 w-6 text-primary mx-auto mb-2" />
                <span className="text-2xl font-black text-foreground block">{orderCount}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Orders</span>
              </Card>
            </Link>

            <Link href="/wishlist" className="block">
              <Card className="shadow-sm border-border/60 text-center p-4 hover:border-rose-300 transition duration-300">
                <Heart className="h-6 w-6 text-rose-500 mx-auto mb-2 fill-rose-50/50" />
                <span className="text-2xl font-black text-foreground block">{wishlistCount}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider hover:text-rose-500 transition-colors">Wishlist Items</span>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Column: Order History Log */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-primary tracking-tight">Recent Harvest Orders</CardTitle>
                <CardDescription className="text-xs">Displaying your latest purchase and delivery logs.</CardDescription>
              </div>
              <Link href="/profile/orders">
                <Button size="sm" variant="outline" className="text-xs font-bold cursor-pointer">
                  View All Orders
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {orders.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-bold text-foreground text-sm">No orders recorded yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Browse our catalogue and purchase some premium varieties.</p>
                  </div>
                  <Link
                    href="/mangoes"
                    className={cn(buttonVariants({ size: "sm" }), "font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 cursor-pointer")}
                  >
                    Shop Mangoes
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/40 text-xs">
                  {orders.map((order) => (
                    <div key={order.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-muted-foreground">
                        <span className="text-foreground font-bold">
                          Order ID: <span className="text-primary select-all">#{order.id}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className={cn(
                            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                            order.status === 'DELIVERED' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
                            order.status === 'PENDING' && 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
                            order.status === 'APPROVED' && 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
                            order.status === 'DISPATCHED' && 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
                            order.status === 'REJECTED' && 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                          )}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items row list */}
                      <div className="space-y-2 pl-2 border-l border-border/80">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-muted-foreground gap-4">
                            <span>
                              {item.mango?.name || 'Unknown Mango Variety'} <span className="text-foreground font-semibold">x {item.quantity}</span>
                            </span>
                            <span className="font-bold text-foreground">Rs. {Number(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-muted-foreground">City: {order.address.city}</span>
                        <span className="text-sm font-black text-primary">
                          Total: Rs. {Number(order.totalAmount).toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Link to Success/Invoice view page */}
                      <div className="flex justify-end pt-1">
                        <Link href={`/profile/orders`} className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1">
                          Track Status & Details <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
