'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { createMango, updateMango, deleteMango, getMangoes, getVarieties, toggleMangoStatus } from '@/actions/mangoActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Power,
  ImageIcon
} from 'lucide-react'

interface Variety {
  id: string
  name: string
}

interface Mango {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image: string
  varietyId: string
  variety: Variety
  isActive: boolean
  createdAt: string
}

type ModalMode = 'create' | 'edit' | 'view' | null

export default function AdminMangoesPage() {
  const [mangoes, setMangoes] = useState<Mango[]>([])
  const [varieties, setVarieties] = useState<Variety[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedMango, setSelectedMango] = useState<Mango | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formVarietyId, setFormVarietyId] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formStock, setFormStock] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formImage, setFormImage] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Mango | null>(null)

  async function fetchMangoes() {
    setLoading(true)
    const res = await getMangoes(search, page, 10)
    if (res.error) {
      toast.error(res.error)
    } else {
      setMangoes((res.mangoes as unknown as Mango[]) || [])
      setTotalPages(res.pages || 1)
      setTotal(res.total || 0)
    }
    setLoading(false)
  }

  async function fetchVarieties() {
    const res = await getVarieties(true)
    if (res.varieties) {
      setVarieties(res.varieties)
    }
  }

  useEffect(() => {
    fetchVarieties()
  }, [])

  useEffect(() => {
    fetchMangoes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page])

  function resetForm() {
    setFormName('')
    setFormVarietyId('')
    setFormDescription('')
    setFormPrice('')
    setFormStock('')
    setFormIsActive(true)
    setFormImage(null)
    setFormImagePreview(null)
    setFormError('')
  }

  function openCreateModal() {
    resetForm()
    setSelectedMango(null)
    setModalMode('create')
  }

  function openEditModal(mango: Mango) {
    setSelectedMango(mango)
    setFormName(mango.name)
    setFormVarietyId(mango.varietyId)
    setFormDescription(mango.description)
    setFormPrice(mango.price.toString())
    setFormStock(mango.stock.toString())
    setFormIsActive(mango.isActive)
    setFormImage(null)
    setFormImagePreview(mango.image)
    setFormError('')
    setModalMode('edit')
  }

  function openViewModal(mango: Mango) {
    setSelectedMango(mango)
    setModalMode('view')
  }

  function closeModal() {
    setModalMode(null)
    setSelectedMango(null)
    resetForm()
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFormImage(file)
      setFormImagePreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormSubmitting(true)
    setFormError('')

    const formData = new FormData()
    formData.set('name', formName)
    formData.set('varietyId', formVarietyId)
    formData.set('description', formDescription)
    formData.set('price', formPrice)
    formData.set('stock', formStock)
    formData.set('isActive', formIsActive.toString())
    if (formImage) {
      formData.set('image', formImage)
    }

    if (modalMode === 'create') {
      const res = await createMango(formData)
      if (res.error) {
        setFormError(res.error)
        toast.error(res.error)
      } else {
        toast.success('Mango created successfully!')
        closeModal()
        fetchMangoes()
      }
    } else if (modalMode === 'edit' && selectedMango) {
      const res = await updateMango(selectedMango.id, formData)
      if (res.error) {
        setFormError(res.error)
        toast.error(res.error)
      } else {
        toast.success('Mango updated successfully!')
        closeModal()
        fetchMangoes()
      }
    }

    setFormSubmitting(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const res = await deleteMango(deleteTarget.id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Mango deleted successfully!')
        fetchMangoes()
      }
      setDeleteTarget(null)
    })
  }

  async function handleToggleStatus(mango: Mango) {
    startTransition(async () => {
      const res = await toggleMangoStatus(mango.id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Mango ${mango.isActive ? 'deactivated' : 'activated'}!`)
        fetchMangoes()
      }
    })
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchMangoes()
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight md:text-3xl">🥭 Mango Management</h1>
          <p className="text-xs text-muted-foreground mt-1">{total} mangoes in inventory</p>
        </div>
        <Button onClick={openCreateModal} className="font-bold cursor-pointer gap-2">
          <Plus className="h-4 w-4" />
          Add Mango
        </Button>
      </div>

      {/* Search */}
      <Card className="shadow-sm border-border/80">
        <CardContent className="py-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search by name or variety..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 text-xs"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </form>
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
              <p className="text-sm text-muted-foreground">No mangoes found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/60">
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-muted-foreground">Image</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-muted-foreground">Variety</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-muted-foreground">Price (PKR)</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-muted-foreground">Stock</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-muted-foreground">Created</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mangoes.map((mango) => (
                      <tr key={mango.id} className="border-b border-border/50 transition-colors odd:bg-transparent even:bg-secondary/20 hover:bg-primary/5">
                        <td className="px-4 py-3">
                          <img src={mango.image} alt={mango.name} className="h-10 w-10 rounded-lg bg-secondary object-cover" />
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">{mango.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{mango.variety?.name}</td>
                        <td className="px-4 py-3 font-bold text-primary">Rs. {mango.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={mango.stock === 0 ? 'font-bold text-destructive' : 'text-foreground'}>
                            {mango.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleToggleStatus(mango)} disabled={isPending} className="cursor-pointer">
                            <Badge variant={mango.isActive ? 'default' : 'secondary'} className={`text-[10px] px-2 py-0.5 ${mango.isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'}`}>
                              <Power className="mr-1 h-2.5 w-2.5" />
                              {mango.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(mango.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => openViewModal(mango)} aria-label="View">
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => openEditModal(mango)} aria-label="Edit">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => setDeleteTarget(mango)} aria-label="Delete">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-3 lg:hidden">
                {mangoes.map((mango) => (
                  <div key={mango.id} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
                    <img src={mango.image} alt={mango.name} className="h-16 w-16 shrink-0 rounded-xl bg-secondary object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-foreground">{mango.name}</h3>
                          <p className="text-[11px] text-muted-foreground">{mango.variety?.name}</p>
                        </div>
                        <button onClick={() => handleToggleStatus(mango)} disabled={isPending} className="cursor-pointer">
                          <Badge variant={mango.isActive ? 'default' : 'secondary'} className={`text-[9px] px-1.5 py-0.5 ${mango.isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'}`}>
                            <Power className="mr-0.5 h-2.5 w-2.5" />
                            {mango.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-sm font-black text-primary">Rs. {mango.price.toLocaleString()}</span>
                        <span className={`text-[11px] font-semibold ${mango.stock === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          Stock: {mango.stock}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Button variant="outline" size="xs" className="h-7 flex-1 cursor-pointer text-[10px] font-bold" onClick={() => openViewModal(mango)}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Button>
                        <Button variant="outline" size="xs" className="h-7 flex-1 cursor-pointer text-[10px] font-bold" onClick={() => openEditModal(mango)}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="xs" className="h-7 cursor-pointer px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(mango)} aria-label="Delete">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
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

      {/* ===== CREATE / EDIT MODAL ===== */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold text-primary">
                {modalMode === 'create' ? '🥭 Add New Mango' : '✏️ Edit Mango'}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg font-medium border border-destructive/20">
                    {formError}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Mango Name *</label>
                  <Input
                    type="text"
                    placeholder="e.g. Chaunsa Premium"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={formSubmitting}
                    className="text-xs"
                    required
                  />
                </div>

                {/* Variety */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Variety *</label>
                  <select
                    value={formVarietyId}
                    onChange={(e) => setFormVarietyId(e.target.value)}
                    disabled={formSubmitting}
                    required
                    className="w-full h-9 px-3 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Select Variety</option>
                    {varieties.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Description *</label>
                  <textarea
                    placeholder="Describe the mango variety, taste, texture..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    disabled={formSubmitting}
                    required
                    rows={3}
                    className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  />
                </div>

                {/* Price + Stock Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Price (PKR) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="350"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      disabled={formSubmitting}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Stock Quantity *</label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="100"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      disabled={formSubmitting}
                      className="text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Image {modalMode === 'create' ? '*' : '(Optional)'}
                  </label>
                  <div className="flex items-start gap-4">
                    {formImagePreview ? (
                      <img src={formImagePreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-border bg-secondary" />
                    ) : (
                      <div className="h-20 w-20 rounded-lg border border-dashed border-border bg-secondary/30 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageChange}
                        disabled={formSubmitting}
                        className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">JPG, JPEG, PNG, WebP. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    disabled={formSubmitting}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${formIsActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formIsActive ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className={`text-xs font-semibold ${formIsActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {formIsActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Submit */}
                <Button type="submit" disabled={formSubmitting} className="w-full font-bold cursor-pointer h-10 mt-2">
                  {formSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    modalMode === 'create' ? 'Create Mango' : 'Update Mango'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== VIEW MODAL ===== */}
      {modalMode === 'view' && selectedMango && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
          <Card className="w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold text-primary">🥭 Mango Details</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <img src={selectedMango.image} alt={selectedMango.name} className="w-full h-48 object-cover rounded-lg border border-border bg-secondary" />
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Name</p>
                  <p className="text-sm font-semibold text-foreground">{selectedMango.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Variety</p>
                  <p className="text-sm text-foreground">{selectedMango.variety?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedMango.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Price (PKR)</p>
                    <p className="text-sm font-black text-primary">Rs. {selectedMango.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stock</p>
                    <p className="text-sm font-semibold text-foreground">{selectedMango.stock}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                    <Badge variant={selectedMango.isActive ? 'default' : 'secondary'} className={`text-[10px] mt-0.5 ${selectedMango.isActive ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'}`}>
                      {selectedMango.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Created</p>
                  <p className="text-xs text-muted-foreground">{new Date(selectedMango.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 cursor-pointer text-xs font-bold" onClick={() => { closeModal(); openEditModal(selectedMango) }}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>
                <Button variant="outline" className="flex-1 cursor-pointer text-xs font-bold text-destructive hover:bg-destructive/10" onClick={() => { closeModal(); setDeleteTarget(selectedMango) }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDeleteTarget(null)}>
          <Card className="w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-destructive">⚠️ Confirm Deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Are you sure you want to delete <strong className="text-foreground">&quot;{deleteTarget.name}&quot;</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 cursor-pointer text-xs font-bold" onClick={() => setDeleteTarget(null)} disabled={isPending}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1 cursor-pointer text-xs font-bold" onClick={handleDelete} disabled={isPending}>
                  {isPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Deleting...</> : 'Yes, Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
