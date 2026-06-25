'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getInventory, getInventoryDashboardStats, addStock, removeStock, updateStock } from '@/actions/inventoryActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Minus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Package,
  History,
  AlertTriangle,
  AlertCircle
} from 'lucide-react'

interface MangoInventory {
  id: string
  name: string
  stock: number
  price: number
  isActive: boolean
  updatedAt: string
  variety: {
    id: string
    name: string
  }
}

type StatusFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
type ModalMode = 'add' | 'remove' | 'update' | null

export default function AdminInventoryPage() {
  const [mangoes, setMangoes] = useState<MangoInventory[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Stats
  const [stats, setStats] = useState<any>(null)

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedMango, setSelectedMango] = useState<MangoInventory | null>(null)
  
  // Form fields
  const [quantity, setQuantity] = useState<number | ''>('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')

  async function fetchInventory() {
    setLoading(true)
    const res = await getInventory(search, statusFilter, page, 10)
    if (res.error) {
      toast.error(res.error)
    } else {
      setMangoes((res.mangoes as unknown as MangoInventory[]) || [])
      setTotalPages(res.pages || 1)
      setTotal(res.total || 0)
    }
    setLoading(false)
  }

  async function fetchStats() {
    const res = await getInventoryDashboardStats()
    if (res.stats) setStats(res.stats)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page])

  function openModal(mode: ModalMode, mango: MangoInventory) {
    setModalMode(mode)
    setSelectedMango(mango)
    setQuantity('')
    setNote('')
    setFormError('')
  }

  function closeModal() {
    setModalMode(null)
    setSelectedMango(null)
  }

  async function handleActionSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMango || quantity === '' || Number(quantity) < 0) return

    startTransition(async () => {
      setFormError('')
      const formData = new FormData()
      formData.set('mangoId', selectedMango.id)
      formData.set('quantity', quantity.toString())
      if (note) formData.set('note', note)

      let res
      if (modalMode === 'add') {
        res = await addStock(formData)
      } else if (modalMode === 'remove') {
        res = await removeStock(formData)
      } else if (modalMode === 'update') {
        res = await updateStock(formData)
      }

      if (res?.error) {
        setFormError(res.error)
      } else {
        toast.success(`Stock ${modalMode}d successfully!`)
        closeModal()
        fetchInventory()
        fetchStats()
      }
    })
  }

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'In Stock', value: 'in-stock' },
    { label: 'Low Stock', value: 'low-stock' },
    { label: 'Out of Stock', value: 'out-of-stock' }
  ]

  return (
    <div className="space-y-6">
      {/* Page Title & Logs Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight md:text-3xl">📦 Inventory Management</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage stock levels across all products.</p>
        </div>
        <Link href="/admin/inventory/logs">
          <Button variant="outline" className="font-bold cursor-pointer gap-2">
            <History className="h-4 w-4" />
            View Logs
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 card-3d-container">
          <Card className="card-3d-hover preserve-3d glow-mango glow-mango-hover shadow-sm border-border/40 bg-card hover:border-amber-500/20 transition-all duration-300 rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between preserve-3d">
              <div className="preserve-3d">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 pop-z-text">Total Products</p>
                <p className="text-2xl font-black pop-z-text">{stats.totalMangoes}</p>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center pop-z-text">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-3d-hover preserve-3d glow-mango glow-mango-hover shadow-sm border-border/40 bg-card hover:border-amber-500/20 transition-all duration-300 rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between preserve-3d">
              <div className="preserve-3d">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 pop-z-text">Total Units</p>
                <p className="text-2xl font-black pop-z-text">{stats.totalInventoryUnits}</p>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center pop-z-text">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-3d-hover preserve-3d glow-mango glow-mango-hover shadow-sm border-border/40 bg-card hover:border-amber-500/20 transition-all duration-300 rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between preserve-3d">
              <div className="preserve-3d">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 pop-z-text">Low Stock</p>
                <p className="text-2xl font-black text-amber-500 pop-z-text">{stats.lowStockItems}</p>
              </div>
              <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center pop-z-text">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-3d-hover preserve-3d glow-mango glow-mango-hover shadow-sm border-border/40 bg-card hover:border-amber-500/20 transition-all duration-300 rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between preserve-3d">
              <div className="preserve-3d">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 pop-z-text">Out of Stock</p>
                <p className="text-2xl font-black text-rose-500 pop-z-text">{stats.outOfStock}</p>
              </div>
              <div className="h-10 w-10 bg-rose-500/10 rounded-full flex items-center justify-center pop-z-text">
                <AlertCircle className="h-5 w-5 text-rose-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search + Filters */}
      <Card className="shadow-sm border-border/80">
        <CardContent className="py-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search by mango or variety name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 text-xs"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Filter:</span>
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => { setStatusFilter(btn.value); setPage(1); }}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors cursor-pointer ${
                  statusFilter === btn.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-border/80 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : mangoes.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No products found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Variety</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Current Stock</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Last Updated</th>
                    <th className="text-right px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {mangoes.map((mango) => {
                    const isOutOfStock = mango.stock === 0
                    const isLowStock = mango.stock > 0 && mango.stock <= 10

                    return (
                      <tr key={mango.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{mango.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{mango.variety.name}</td>
                        <td className="px-4 py-3">
                          <span className="font-black text-foreground text-sm">{mango.stock}</span>
                        </td>
                        <td className="px-4 py-3">
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="text-[10px] px-2 py-0.5">OUT OF STOCK</Badge>
                          ) : isLowStock ? (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-amber-500 border-amber-500 bg-amber-500/10">LOW STOCK</Badge>
                          ) : (
                            <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600">IN STOCK</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(mango.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" onClick={() => openModal('add', mango)} title="Add Stock">
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => openModal('remove', mango)} title="Remove Stock">
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" onClick={() => openModal('update', mango)} title="Update Exact Stock">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-8 text-xs cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 text-xs cursor-pointer"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ===== ACTION MODAL ===== */}
      {modalMode && selectedMango && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
          <Card className="w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">
                {modalMode === 'add' && <span className="text-emerald-500">➕ Add Stock</span>}
                {modalMode === 'remove' && <span className="text-rose-500">➖ Remove Stock</span>}
                {modalMode === 'update' && <span className="text-blue-500">✏️ Update Stock</span>}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4 bg-secondary/30 p-3 rounded-lg border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Target Product</p>
                <p className="text-sm font-semibold">{selectedMango.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] bg-background">Current: {selectedMango.stock}</Badge>
                </div>
              </div>

              <form onSubmit={handleActionSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg font-medium border border-destructive/20">
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    {modalMode === 'add' ? 'Quantity to Add *' : modalMode === 'remove' ? 'Quantity to Remove *' : 'New Exact Stock *'}
                  </label>
                  <Input
                    type="number"
                    min={modalMode === 'update' ? 0 : 1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={isPending}
                    required
                    className="text-sm font-bold"
                  />
                  {modalMode === 'add' && quantity !== '' && (
                    <p className="text-[10px] text-emerald-500 font-semibold mt-1">New Total: {selectedMango.stock + Number(quantity)}</p>
                  )}
                  {modalMode === 'remove' && quantity !== '' && (
                    <p className={`text-[10px] font-semibold mt-1 ${selectedMango.stock - Number(quantity) < 0 ? 'text-rose-500' : 'text-blue-500'}`}>
                      New Total: {selectedMango.stock - Number(quantity)}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Note (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. Received new shipment..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isPending}
                    className="text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1 cursor-pointer text-xs font-bold" onClick={closeModal} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} className={`flex-1 font-bold cursor-pointer text-xs ${modalMode === 'add' ? 'bg-emerald-500 hover:bg-emerald-600' : modalMode === 'remove' ? 'bg-rose-500 hover:bg-rose-600 hover:text-white' : 'bg-blue-500 hover:bg-blue-600'}`}>
                    {isPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving...</> : 'Confirm'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
