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
        o.address.mobileNumber.includes(q) ||
        o.address.address.toLowerCase().includes(q) ||
        o.address.city.toLowerCase().includes(q)
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
          placeholder="Search by customer, mobile, city, or ID..."
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
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4">City</th>
                <th className="p-4">Address</th>
                <th className="p-4">Ordered Product</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 font-semibold text-foreground">
                    <div className="space-y-0.5">
                      <div>{order.address.fullName}</div>
                      <div className="text-[10px] text-muted-foreground select-all">#{order.id}</div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="space-y-1">
                      <div>{order.address.mobileNumber}</div>
                      {order.address.whatsapp && (
                        <div className="text-[10px] text-emerald-600 font-medium">WA: {order.address.whatsapp}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-foreground font-semibold">
                    {order.address.city}
                  </td>
                  <td className="p-4 text-muted-foreground max-w-xs truncate" title={order.address.address}>
                    {order.address.address}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="space-y-1">
                      {order.orderItems.map((item: any) => (
                        <div key={item.id}>
                          <strong className="text-foreground">{item.mango?.name || 'Mango Box'}</strong>{' '}
                          <span className="text-[10px]">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4 text-muted-foreground whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2 items-end">
                      {/* Status Actions */}
                      <div className="flex gap-1">
                        {order.status === 'PENDING' && (
                          <>
                            <Button
                              size="xs"
                              onClick={() => handleStatusUpdate(order.id, 'APPROVED')}
                              disabled={updatingId === order.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold py-1 px-2 h-7"
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(order.id, 'REJECTED')}
                              disabled={updatingId === order.id}
                              className="text-[10px] font-bold py-1 px-2 h-7"
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
                            className="bg-purple-600 hover:bg-purple-700 text-[10px] font-bold py-1 px-2 h-7"
                          >
                            Dispatch
                          </Button>
                        )}
                        {order.status === 'DISPATCHED' && (
                          <Button
                            size="xs"
                            onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                            disabled={updatingId === order.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold py-1 px-2 h-7"
                          >
                            Deliver
                          </Button>
                        )}
                      </div>
                      {/* Remarks/Notes */}
                      <div className="flex gap-1 items-center w-full max-w-[200px]">
                        <input
                          type="text"
                          placeholder="Notes..."
                          value={remarksInputs[order.id] || ''}
                          onChange={(e) => setRemarksInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                          className="w-full text-[10px] p-1 bg-secondary/30 rounded border border-border focus:outline-none h-6"
                        />
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleRemarksSave(order.id)}
                          className="text-[9px] h-6 px-1.5 font-bold cursor-pointer"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
