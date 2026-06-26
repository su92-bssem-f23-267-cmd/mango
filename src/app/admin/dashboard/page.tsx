import db from '@/lib/db'
import {
  Users, ShoppingBag, DollarSign, Leaf, CheckCircle, XCircle, AlertTriangle,
  Tags, AlertCircle, Clock, Truck, Wallet, CalendarDays, Boxes, PackageCheck, Send,
} from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import OrdersDonut from '@/components/admin/OrdersDonut'

export default async function AdminDashboardPage() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    userCount,
    totalOrders,
    pendingOrders,
    approvedOrders,
    dispatchedOrders,
    rejectedOrders,
    deliveredOrders,
    revenueResult,
    todayOrders,
    monthlySalesResult,
    totalMangoes,
    activeMangoes,
    outOfStockMangoes,
    totalVarieties,
    lowStockProducts,
    outOfStockProducts,
  ] = await Promise.all([
    db.user.count(),
    db.order.count(),
    db.order.count({ where: { status: 'PENDING' } }),
    db.order.count({ where: { status: 'APPROVED' } }),
    db.order.count({ where: { status: 'DISPATCHED' } }),
    db.order.count({ where: { status: 'REJECTED' } }),
    db.order.count({ where: { status: 'DELIVERED' } }),
    db.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalAmount: true },
    }),
    db.order.count({ where: { createdAt: { gte: startOfToday } } }),
    db.order.aggregate({
      where: { status: 'DELIVERED', createdAt: { gte: startOfMonth } },
      _sum: { totalAmount: true },
    }),
    db.mango.count(),
    db.mango.count({ where: { isActive: true } }),
    db.mango.count({ where: { stock: 0 } }),
    db.variety.count(),
    db.mango.findMany({ where: { stock: { gt: 0, lte: 10 } }, select: { name: true, stock: true } }),
    db.mango.findMany({ where: { stock: 0 }, select: { name: true } }),
  ])

  const totalRevenue = revenueResult._sum.totalAmount ? Number(revenueResult._sum.totalAmount) : 0
  const monthlySales = monthlySalesResult._sum.totalAmount ? Number(monthlySalesResult._sum.totalAmount) : 0
  const fmt = (n: number) => `Rs. ${n.toLocaleString()}`

  const donutSegments = [
    { label: 'Pending', value: pendingOrders, color: 'bg-amber-500', stroke: '#F59E0B' },
    { label: 'Approved', value: approvedOrders, color: 'bg-sky-500', stroke: '#0EA5E9' },
    { label: 'Dispatched', value: dispatchedOrders, color: 'bg-violet-500', stroke: '#8B5CF6' },
    { label: 'Delivered', value: deliveredOrders, color: 'bg-emerald-500', stroke: '#22C55E' },
    { label: 'Rejected', value: rejectedOrders, color: 'bg-rose-500', stroke: '#F43F5E' },
  ]

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-xs text-muted-foreground">Real-time overview of Fruit Gala performance and COD orders.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live data
        </span>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {outOfStockProducts.length > 0 && (
            <div className="flex gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 shadow-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              <div>
                <h3 className="text-sm font-bold tracking-tight text-rose-600 dark:text-rose-400">Out of Stock Alerts</h3>
                <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80">The following boxes have 0 stock:</p>
                <ul className="mt-2 list-inside list-disc text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {outOfStockProducts.map((p) => <li key={p.name}>{p.name}</li>)}
                </ul>
              </div>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold tracking-tight text-amber-600 dark:text-amber-400">Low Stock Alerts</h3>
                <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">10 or fewer items remaining:</p>
                <ul className="mt-2 list-inside list-disc text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {lowStockProducts.map((p) => <li key={p.name}>{p.name} <span className="text-amber-500/70">({p.stock} left)</span></li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Highlight KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard highlight index={0} title="Total Revenue" value={fmt(totalRevenue)} description="Delivered COD collected" icon={DollarSign} tone="emerald" />
        <StatCard highlight index={1} title="Monthly Sales" value={fmt(monthlySales)} description="Delivered this month" icon={Wallet} tone="green" badge="This month" />
        <StatCard highlight index={2} title="Total Orders" value={totalOrders} description="All orders placed" icon={ShoppingBag} tone="blue" />
        <StatCard highlight index={3} title="Today's Orders" value={todayOrders} description="Placed since midnight" icon={CalendarDays} tone="amber" badge="Today" />
      </div>

      {/* Orders Overview + status cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="reveal-up rounded-2xl border border-border/50 bg-card p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-sm font-black tracking-tight text-foreground">Orders Overview</h2>
          <OrdersDonut segments={donutSegments} centerLabel="Orders" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2 xl:grid-cols-3">
          <StatCard index={0} title="Pending" value={pendingOrders} description="Awaiting approval" icon={Clock} tone="amber" />
          <StatCard index={1} title="Approved" value={approvedOrders} description="Preparing harvest" icon={CheckCircle} tone="sky" />
          <StatCard index={2} title="Dispatched" value={dispatchedOrders} description="On the way" icon={Send} tone="violet" />
          <StatCard index={3} title="Delivered" value={deliveredOrders} description="Completed COD" icon={Truck} tone="emerald" />
          <StatCard index={4} title="Rejected" value={rejectedOrders} description="Cancelled orders" icon={XCircle} tone="rose" />
          <StatCard index={5} title="Customers" value={userCount} description="Registered accounts" icon={Users} tone="violet" />
        </div>
      </div>

      {/* Catalog */}
      <div>
        <h2 className="mb-3 text-sm font-black tracking-tight text-foreground">Catalog</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard index={0} title="Total Products" value={totalMangoes} description={`${activeMangoes} active`} icon={Leaf} tone="green" />
          <StatCard index={1} title="Varieties" value={totalVarieties} description="Listed categories" icon={Tags} tone="amber" />
          <StatCard index={2} title="In Stock" value={totalMangoes - outOfStockMangoes} description="Available products" icon={PackageCheck} tone="emerald" />
          <StatCard index={3} title="Out of Stock" value={outOfStockMangoes} description="Need restocking" icon={Boxes} tone="rose" />
        </div>
      </div>
    </div>
  )
}
