import db from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShoppingBag, CreditCard, DollarSign, Leaf, CheckCircle, XCircle, AlertTriangle, Tags, AlertCircle, Clock, Truck } from 'lucide-react'

export default async function AdminDashboardPage() {
  const [
    userCount,
    totalOrders,
    pendingOrders,
    approvedOrders,
    rejectedOrders,
    deliveredOrders,
    revenueResult,
    totalMangoes,
    activeMangoes,
    inactiveMangoes,
    outOfStockMangoes,
    totalVarieties,
    activeVarieties,
    inactiveVarieties,
    totalMangoesLinked,
    lowStockProducts,
    outOfStockProducts
  ] = await Promise.all([
    db.user.count(),
    db.order.count(),
    db.order.count({ where: { status: 'PENDING' } }),
    db.order.count({ where: { status: 'APPROVED' } }),
    db.order.count({ where: { status: 'REJECTED' } }),
    db.order.count({ where: { status: 'DELIVERED' } }),
    db.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: {
        totalAmount: true
      }
    }),
    db.mango.count(),
    db.mango.count({ where: { isActive: true } }),
    db.mango.count({ where: { isActive: false } }),
    db.mango.count({ where: { stock: 0 } }),
    db.variety.count(),
    db.variety.count({ where: { isActive: true } }),
    db.variety.count({ where: { isActive: false } }),
    db.mango.count({ where: { varietyId: { not: '' } } }),
    db.mango.findMany({ where: { stock: { gt: 0, lte: 10 } }, select: { name: true, stock: true } }),
    db.mango.findMany({ where: { stock: 0 }, select: { name: true } })
  ])

  const totalRevenue = revenueResult._sum.totalAmount ? Number(revenueResult._sum.totalAmount) : 0

  const orderStats = [
    {
      title: 'Total Revenue (COD)',
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      description: 'Delivered orders cash collected',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      description: 'Total orders placed',
      icon: ShoppingBag,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      description: 'Awaiting admin approval',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      title: 'Approved Orders',
      value: approvedOrders.toString(),
      description: 'Approved & preparing harvest',
      icon: CheckCircle,
      color: 'text-sky-500 bg-sky-500/10'
    },
    {
      title: 'Delivered Orders',
      value: deliveredOrders.toString(),
      description: 'Successfully delivered COD',
      icon: Truck,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      title: 'Rejected Orders',
      value: rejectedOrders.toString(),
      description: 'Cancelled or rejected harvest',
      icon: XCircle,
      color: 'text-rose-500 bg-rose-500/10'
    }
  ]

  const storeMetrics = [
    {
      title: 'Registered Users',
      value: userCount.toString(),
      description: 'Customer accounts',
      icon: Users,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      title: 'Total Mangoes',
      value: totalMangoes.toString(),
      description: 'Mango varieties listed',
      icon: Leaf,
      color: 'text-amber-500 bg-amber-500/10'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight md:text-3xl">Admin Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">Real-time overview of Fruit Gala performance and COD orders.</p>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {outOfStockProducts.length > 0 && (
            <div className="p-4 border border-rose-500/30 bg-rose-500/10 rounded-xl flex gap-3 shadow-sm">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-500 tracking-tight">Out of Stock Alerts</h3>
                <p className="text-xs text-rose-600/80 mt-1">The following boxes have 0 stock:</p>
                <ul className="mt-2 text-xs font-semibold text-rose-600 list-disc list-inside">
                  {outOfStockProducts.map(p => <li key={p.name}>{p.name}</li>)}
                </ul>
              </div>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="p-4 border border-amber-500/30 bg-amber-500/10 rounded-xl flex gap-3 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-500 tracking-tight">Low Stock Alerts</h3>
                <p className="text-xs text-amber-600/80 mt-1">The following boxes have 10 or fewer items remaining:</p>
                <ul className="mt-2 text-xs font-semibold text-amber-600 list-disc list-inside">
                  {lowStockProducts.map(p => <li key={p.name}>{p.name} <span className="text-amber-500/70">({p.stock} left)</span></li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Stats Grid */}
      <div className="card-3d-container">
        <h2 className="text-lg font-bold text-foreground tracking-tight mb-3">📦 Order Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orderStats.map((stat) => (
            <Card key={stat.title} className="card-3d-hover preserve-3d glow-mango glow-mango-hover shadow-sm border-border/40 bg-card hover:border-amber-500/20 transition-all duration-300 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 preserve-3d">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground pop-z-text">{stat.title}</CardTitle>
                <div className={`p-2.5 rounded-xl shadow-sm ${stat.color} pop-z-text`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="preserve-3d pt-2">
                <div className="text-2xl font-black tracking-tight text-foreground pop-z-text">{stat.value}</div>
                <p className="text-[10px] text-muted-foreground mt-1 pop-z-text leading-relaxed">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Catalog Stats */}
      <div className="grid gap-4 md:grid-cols-2 card-3d-container">
        {storeMetrics.map((stat) => (
          <Card key={stat.title} className="card-3d-hover preserve-3d glow-mango glow-mango-hover shadow-sm border-border/40 bg-card hover:border-amber-500/20 transition-all duration-300 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 preserve-3d">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground pop-z-text">{stat.title}</CardTitle>
              <div className={`p-2.5 rounded-xl shadow-sm ${stat.color} pop-z-text`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="preserve-3d pt-2">
              <div className="text-2xl font-black tracking-tight text-foreground pop-z-text">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground mt-1 pop-z-text leading-relaxed">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
