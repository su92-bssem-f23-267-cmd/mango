'use client'
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShoppingBag, ArrowLeft, Truck } from 'lucide-react'
import { toast } from 'sonner'
import useMangoCartStore from '@/store/cart-store'
import useMounted from '@/hooks/useMounted'
import { createOrder } from '@/actions/orderActions'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'


export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const mounted = useMounted()

  const cartItems = useMangoCartStore((state) => state.items)
  const cartTotal = useMangoCartStore((state) => state.cartTotal())
  const clearCart = useMangoCartStore((state) => state.clearCart)

  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState('')
  const [whatsApp, setWhatsApp] = useState('')
  const [area, setArea] = useState('F-6')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Prepopulate full name if logged in
  useEffect(() => {
    if (session?.user) {
      setFullName(session.user.name || '')
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !mobile || !address || !area) {
      toast.error('Please enter all required shipping details.')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    setLoading(true)
    try {
      const orderPayload = {
        fullName,
        mobile,
        whatsApp: whatsApp || null,
        address,
        area,
        notes: notes || null,
        items: cartItems.map((item) => ({
          mangoId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      }

      const result = await createOrder(orderPayload)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success && result?.orderId) {
        toast.success('Order placed successfully!')
        clearCart()
        router.push(`/order-success/${result.orderId}`)
      }
    } catch (err) {
      toast.error('Checkout failed. Please try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <p className="text-sm text-muted-foreground">Loading checkout...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center max-w-md">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-black text-foreground">Your Cart is Empty</h1>
        <p className="text-sm text-muted-foreground mt-2">
          You must add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/mangoes"
          className={cn(buttonVariants(), "mt-8 font-bold cursor-pointer text-center justify-center flex items-center h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-4 rounded-lg")}
        >
          Browse Orchard Catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <Link href="/mangoes" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent transition">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Checkout Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-primary tracking-tight">Delivery Details (Cash on Delivery Only)</CardTitle>
              <CardDescription className="text-xs">
                Please enter your shipping address details to confirm your order. Payment is only due upon physical delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full name input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Full Name *</label>
                  <Input
                    type="text"
                    placeholder="Recipient's full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mobile number input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Mobile Number *</label>
                    <Input
                      type="tel"
                      placeholder="e.g. 03001234567"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      disabled={loading}
                      className="text-xs"
                      required
                    />
                  </div>

                  {/* WhatsApp input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">WhatsApp Number (Optional)</label>
                    <Input
                      type="tel"
                      placeholder="e.g. 03001234567"
                      value={whatsApp}
                      onChange={(e) => setWhatsApp(e.target.value)}
                      disabled={loading}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Delivery Area select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Delivery Area *</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    disabled={loading}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="F-6">F-6</option>
                    <option value="F-7">F-7</option>
                    <option value="F-8">F-8</option>
                    <option value="F-9">F-9</option>
                    <option value="DHA Islamabad">DHA Islamabad</option>
                    <option value="Bahria Town Rawalpindi">Bahria Town Rawalpindi</option>
                  </select>
                </div>

                {/* Delivery address input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Complete Address *</label>
                  <Input
                    type="text"
                    placeholder="House / Apartment number, Street, Sector"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    className="text-xs"
                    required
                  />
                </div>

                {/* Optional order notes input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Order Notes (Optional)</label>
                  <textarea
                    placeholder="e.g. Special delivery instructions, preferred delivery time, landmarks"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={loading}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Payment Simulation Note */}
                <div className="bg-secondary/30 border border-border/80 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    Payment Method
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    We strictly use <strong>Cash on Delivery (COD)</strong>. You will pay only when your mango box is delivered to your doorstep.
                  </p>
                </div>

                {/* Submit Checkout */}
                <Button type="submit" disabled={loading} size="lg" className="w-full font-bold cursor-pointer mt-2">
                  {loading ? 'Placing Order...' : `Confirm COD Order (Rs. ${cartTotal.toLocaleString()})`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Order Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-lg font-bold text-primary tracking-tight">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 pt-0 text-xs">
              {/* Product loop */}
              <div className="py-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Quantity: {item.quantity} x Rs. {item.price.toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-primary shrink-0">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal metrics */}
              <div className="py-4 space-y-2">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[10px]">Free Delivery</span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-primary pt-2">
                  <span>Total Amount</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
