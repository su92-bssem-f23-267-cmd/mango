'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react'
import type { OrderStatus } from '@prisma/client'
import { getAllOrders, updateOrderStatus, addAdminRemarks } from '@/actions/orderActions'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Search, User, Phone, MapPin, Calendar } from 'lucide-react'
import useMounted from '@/hooks/useMounted'
import { cn } from '@/lib/utils'

type AdminOrderItem = { id: string; quantity: number; mango?: { name?: string } | null }
type AdminOrder = {
  id: string
  status: string
  address: { fullName: string; mobileNumber: string; whatsapp?: string | null; city: string; address: string }
  orderItems: AdminOrderItem[]
  createdAt: string | Date
  adminRemarks?: string | null
}

export default function AdminOrdersPage() {
  const mounted = useMounted()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [remarksInputs, setRemarksInputs] = useState<{ [orderId: string]: string }>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const result = await getAllOrders()
    if (result.error) {
      toast.error(result.error)
    } else if (result.orders) {
      const list = result.orders as unknown as AdminOrder[]
      setOrders(list)
      // Initialize remarks inputs
      const remarks: { [orderId: string]: string } = {}
      list.forEach((o) => {
        remarks[o.id] = o.adminRemarks || ''
      })
      setRemarksInputs(remarks)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    let result = [...orders]

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status === statusFilter)
    }

    // Apply search query (Customer name, mobile number, order ID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.address.fullName.toLowerCase().includes(q) ||
        o.address.mobileNumber.includes(q) ||
        o.address.address.toLowerCase().includes(q) ||
        o.address.city.toLowerCase().includes(q)
      )
    }

    setFilteredOrders(result)
  }, [orders, statusFilter, searchQuery])

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Order status updated to ${newStatus}`)
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
    setUpdatingId(null)
  }

  const handleRemarksSave = async (orderId: string) => {
    const remarks = remarksInputs[orderId] || ''
    const result = await addAdminRemarks(orderId, remarks)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Admin notes updated')
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, adminRemarks: remarks } : o))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30">Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30">Rejected</Badge>
      case 'DISPATCHED':
        return <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30">Dispatched</Badge>
      case 'DELIVERED':
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Delivered</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Shared status-action buttons used by both the desktop table and mobile cards
  const renderStatusActions = (order: { id: string; status: string }) => (
    <div className="flex flex-wrap gap-1.5">
      {order.status === 'PENDING' && (
        <>
          <Button
            size="xs"
            onClick={() => handleStatusUpdate(order.id, 'APPROVED')}
            disabled={updatingId === order.id}
            className="h-7 bg-emerald-600 px-2.5 py-1 text-[10px] font-bold hover:bg-emerald-700"
          >
            Approve
          </Button>
          <Button
            size="xs"
            variant="destructive"
            onClick={() => handleStatusUpdate(order.id, 'REJECTED')}
            disabled={updatingId === order.id}
            className="h-7 px-2.5 py-1 text-[10px] font-bold"
          >
            Reject
          </Button>
        </>
      )}
      {order.status === 'APPROVED' && (
        <Button
          size="xs"
          onClick={() => handleStatusUpdate(order.id, 'DISPATCHED')}
          disabled={updatingId === order.id}
          className="h-7 bg-violet-600 px-2.5 py-1 text-[10px] font-bold hover:bg-violet-700"
        >
          Dispatch
        </Button>
      )}
      {order.status === 'DISPATCHED' && (
        <Button
          size="xs"
          onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
          disabled={updatingId === order.id}
          className="h-7 bg-emerald-600 px-2.5 py-1 text-[10px] font-bold hover:bg-emerald-700"
        >
          Deliver
        </Button>
      )}
    </div>
  )

  const renderRemarks = (orderId: string) => (
    <div className="flex w-full items-center gap-1.5">
      <input
        type="text"
        placeholder="Add note..."
        aria-label="Admin note"
        value={remarksInputs[orderId] || ''}
        onChange={(e) => setRemarksInputs((prev) => ({ ...prev, [orderId]: e.target.value }))}
        className="h-7 w-full rounded-md border border-border bg-secondary/30 p-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/40"
      />
      <Button
        size="xs"
        variant="outline"
        onClick={() => handleRemarksSave(orderId)}
        className="h-7 px-2 text-[9px] font-bold"
      >
        Save
      </Button>
    </div>
  )

  if (!mounted) {
    return <div className="text-center py-20">Loading order management...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight md:text-3xl flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Order Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Review, approve, and track Cash on Delivery (COD) orders.</p>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/60 p-3 shadow-sm backdrop-blur-sm sm:p-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {['ALL', 'PENDING', 'APPROVED', 'DISPATCHED', 'DELIVERED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200',
                statusFilter === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border/60 bg-card text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
              )}
            >
              {tab === 'ALL' ? 'All Orders' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by customer, mobile, city, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 text-xs"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Results count */}
      {!loading && filteredOrders.length > 0 && (
        <p className="text-xs font-semibold text-muted-foreground">
          Showing <span className="text-foreground">{filteredOrders.length}</span> order{filteredOrders.length === 1 ? '' : 's'}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-border/40 bg-secondary/30" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-dashed py-12 text-center">
          <CardContent className="space-y-3">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="font-bold text-foreground">No orders found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your filters or search term.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:block">
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-secondary/80 font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 transition-colors odd:bg-transparent even:bg-secondary/20 hover:bg-primary/5">
                      <td className="p-4 font-semibold text-foreground">
                        <div className="space-y-0.5">
                          <div>{order.address.fullName}</div>
                          <div className="select-all text-[10px] text-muted-foreground">#{order.id}</div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        <div className="space-y-1">
                          <div>{order.address.mobileNumber}</div>
                          {order.address.whatsapp && (
                            <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">WA: {order.address.whatsapp}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-foreground">{order.address.city}</td>
                      <td className="max-w-xs truncate p-4 text-muted-foreground" title={order.address.address}>
                        {order.address.address}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        <div className="space-y-1">
                          {order.orderItems.map((item: AdminOrderItem) => (
                            <div key={item.id}>
                              <strong className="text-foreground">{item.mango?.name || 'Mango Box'}</strong>{' '}
                              <span className="text-[10px]">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(order.status)}</td>
                      <td className="whitespace-nowrap p-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-end gap-2">
                          {renderStatusActions(order)}
                          <div className="w-full max-w-[200px]">{renderRemarks(order.id)}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-4 lg:hidden">
            {filteredOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{order.address.fullName}</span>
                    </div>
                    <p className="mt-0.5 select-all text-[10px] text-muted-foreground">#{order.id}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{order.address.mobileNumber}</span>
                    {order.address.whatsapp && (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">· WA {order.address.whatsapp}</span>
                    )}
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span><strong className="text-foreground">{order.address.city}</strong> — {order.address.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-secondary/30 p-2.5 text-xs">
                  {order.orderItems.map((item: AdminOrderItem) => (
                    <div key={item.id}>
                      <strong className="text-foreground">{item.mango?.name || 'Mango Box'}</strong>{' '}
                      <span className="text-[10px] text-muted-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-2">
                  {renderStatusActions(order)}
                  {renderRemarks(order.id)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
