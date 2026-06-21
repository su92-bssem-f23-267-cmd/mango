'use client'

import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus, addAdminRemarks } from '@/actions/orderActions'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Search, Clock, CheckCircle, XCircle, Truck, Clipboard, User, Phone, MapPin, Calendar, HelpCircle } from 'lucide-react'
import useMounted from '@/hooks/useMounted'

export default function AdminOrdersPage() {
  const mounted = useMounted()
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
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
      setOrders(result.orders)
      // Initialize remarks inputs
      const remarks: { [orderId: string]: string } = {}
      result.orders.forEach((o: any) => {
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
        o.address.mobile.includes(q) ||
        o.address.address.toLowerCase().includes(q) ||
        o.address.area.toLowerCase().includes(q)
      )
    }

    setFilteredOrders(result)
  }, [orders, statusFilter, searchQuery])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    const result = await updateOrderStatus(orderId, newStatus as any)
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
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Rejected</Badge>
      case 'DISPATCHED':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Dispatched</Badge>
      case 'DELIVERED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Delivered</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

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

      {/* Tabs / Filters Bar */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {['ALL', 'PENDING', 'APPROVED', 'DISPATCHED', 'DELIVERED', 'REJECTED'].map((tab) => (
          <Button
            key={tab}
            variant={statusFilter === tab ? 'default' : 'outline'}
            onClick={() => setStatusFilter(tab)}
            size="sm"
            className="text-xs font-bold"
          >
            {tab === 'ALL' ? 'All Orders' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Input
          type="text"
          placeholder="Search by customer, mobile, area, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs"
        />
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Clock className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground mt-2">Fetching harvest logs...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent className="space-y-3">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="font-bold text-foreground">No orders found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your filters or search term.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary/60 shadow-sm">
              <div className="bg-secondary/10 px-6 py-4 border-b border-border/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary select-all">#{order.id}</span>
                    {getStatusBadge(order.status)}
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap gap-2">
                  {order.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'APPROVED')}
                        disabled={updatingId === order.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(order.id, 'REJECTED')}
                        disabled={updatingId === order.id}
                        className="text-xs font-bold flex items-center gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                  {order.status === 'APPROVED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order.id, 'DISPATCHED')}
                      disabled={updatingId === order.id}
                      className="bg-purple-600 hover:bg-purple-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Truck className="h-3.5 w-3.5" /> Mark Dispatched
                    </Button>
                  )}
                  {order.status === 'DISPATCHED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                      disabled={updatingId === order.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Mark Delivered
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Customer shipping details */}
                  <div className="lg:col-span-5 space-y-3 border-b lg:border-b-0 lg:border-r border-border/60 pb-4 lg:pb-0 lg:pr-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> Customer Info
                    </h4>
                    <div className="space-y-2 text-xs">
                      <p><span className="text-muted-foreground">Name:</span> <strong className="text-foreground">{order.address.fullName}</strong></p>
                      <p className="flex items-center gap-2"><span className="text-muted-foreground">Mobile:</span> <strong className="text-foreground">{order.address.mobile}</strong></p>
                      {order.address.whatsApp && (
                        <p><span className="text-muted-foreground">WhatsApp:</span> <strong className="text-foreground">{order.address.whatsApp}</strong></p>
                      )}
                      <p className="flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> <span><strong className="text-foreground font-semibold">[{order.address.area}]</strong> {order.address.address}</span></p>
                    </div>
                  </div>

                  {/* Items description */}
                  <div className="lg:col-span-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5 text-primary" /> Purchased Items
                    </h4>
                    <div className="space-y-2 text-xs">
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-muted-foreground">
                          <span>
                            <strong className="text-foreground">{item.mango?.name || 'Mango Box'}</strong> (10KG Box)
                          </span>
                          <span className="font-bold text-foreground">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-border/40 pt-2 flex justify-between items-center font-black text-primary text-sm">
                        <span>Total Price</span>
                        <span>Rs. {Number(order.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin notes remarks */}
                  <div className="lg:col-span-3 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Clipboard className="h-3.5 w-3.5 text-primary" /> Admin Remarks
                    </h4>
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Add delivery notes, driver instructions..."
                        value={remarksInputs[order.id] || ''}
                        onChange={(e) => setRemarksInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                        className="w-full text-xs p-2 bg-secondary/30 rounded border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemarksSave(order.id)}
                        className="w-full text-[10px] h-7 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
