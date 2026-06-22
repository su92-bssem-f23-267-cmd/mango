'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUserOrders } from '@/actions/orderActions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, ArrowLeft, Calendar, Info, Clock, CheckCircle, XCircle, Truck, RefreshCw } from 'lucide-react'
import useMounted from '@/hooks/useMounted'
import { toast } from 'sonner'

export default function UserOrdersPage() {
  const mounted = useMounted()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    const result = await getUserOrders()
    if (result.error) {
      toast.error(result.error)
    } else if (result.orders) {
      setOrders(result.orders)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Awaiting Approval</Badge>
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
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <p className="text-sm text-muted-foreground">Loading orders dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="space-y-1">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent mb-2 transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-primary tracking-tight">Your Harvest Orders</h1>
          <p className="text-xs text-muted-foreground">Track status and delivery details for your active orders.</p>
        </div>
        <Button onClick={fetchOrders} disabled={loading} size="sm" variant="outline" className="h-8 text-xs font-semibold flex items-center gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Clock className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground mt-2 font-medium">Fetching orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <CardContent className="space-y-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-bold text-lg text-foreground">No orders recorded</h3>
              <p className="text-xs text-muted-foreground mt-1">You have not placed any orders yet.</p>
            </div>
            <Link href="/mangoes">
              <Button size="sm" className="font-bold mt-2 cursor-pointer">Shop Exotic Mangoes</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-sm overflow-hidden border border-border/60">
              <div className="bg-secondary/10 px-6 py-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="text-foreground font-black text-xs mr-2">Order ID: <span className="text-primary font-bold select-all">#{order.id}</span></span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">{order.paymentMethod} Payment</span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Items list */}
                  <div className="lg:col-span-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Order Items</h4>
                    <div className="space-y-3">
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-xs text-muted-foreground">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground">{item.mango?.name || 'Mango Box'}</p>
                            <p className="text-[10px] text-muted-foreground">10KG Box &bull; Quantity: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-foreground">Rs. {Number(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery details */}
                  <div className="lg:col-span-3 space-y-2 text-xs border-t lg:border-t-0 lg:border-l lg:border-r border-border/60 pt-4 lg:pt-0 lg:px-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Delivery Address</h4>
                    <p><span className="text-muted-foreground">Name:</span> <strong className="text-foreground">{order.address.fullName}</strong></p>
                    <p><span className="text-muted-foreground">Mobile:</span> <strong className="text-foreground">{order.address.mobileNumber}</strong></p>
                    <p><span className="text-muted-foreground">City:</span> <strong className="text-primary font-bold">{order.address.city}</strong></p>
                    <p className="leading-relaxed"><span className="text-muted-foreground">Address:</span> <span className="text-foreground">{order.address.address}</span></p>
                  </div>

                  {/* Order notes and summary */}
                  <div className="lg:col-span-3 space-y-4 pt-4 lg:pt-0 text-xs">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                        <Info className="h-3.5 w-3.5 text-primary" /> Admin Remarks
                      </h4>
                      <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed italic">
                        {order.adminRemarks || 'No remarks added by vendor yet.'}
                      </p>
                    </div>

                    <div className="border-t border-border/40 pt-3 flex justify-between items-center text-sm font-black text-primary">
                      <span>Total (COD)</span>
                      <span>Rs. {Number(order.totalAmount).toLocaleString()}</span>
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
