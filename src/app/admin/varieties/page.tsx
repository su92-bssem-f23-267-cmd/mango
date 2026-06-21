'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getVarieties, deleteVariety } from '@/actions/varietyActions'
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
  Tags,
  Leaf
} from 'lucide-react'

interface Variety {
  id: string
  name: string
  description: string | null
  isActive: boolean
  mangoCount: number
  createdAt: string
}

type StatusFilter = 'all' | 'active' | 'inactive'
type ModalMode = 'view' | null

export default function AdminVarietiesPage() {
  const [varieties, setVarieties] = useState<Variety[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // View modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Variety | null>(null)

  async function fetchVarieties() {
    setLoading(true)
    const res = await getVarieties(search, statusFilter, page, 10)
    if (res.error) {
      toast.error(res.error)
    } else {
      setVarieties((res.varieties as unknown as Variety[]) || [])
      setTotalPages(res.pages || 1)
      setTotal(res.total || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchVarieties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page])

  function openViewModal(variety: Variety) {
    setSelectedVariety(variety)
    setModalMode('view')
  }

  function closeModal() {
    setModalMode(null)
    setSelectedVariety(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const res = await deleteVariety(deleteTarget.id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Variety deleted successfully!')
        fetchVarieties()
      }
      setDeleteTarget(null)
    })
  }

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ]

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight md:text-3xl">🏷️ Variety Management</h1>
          <p className="text-xs text-muted-foreground mt-1">{total} varieties in database</p>
        </div>
        <Link href="/admin/varieties/create">
          <Button className="font-bold cursor-pointer gap-2">
            <Plus className="h-4 w-4" />
            Add Variety
          </Button>
        </Link>
      </div>

      {/* Search + Filters */}
      <Card className="shadow-sm border-border/80">
        <CardContent className="py-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search by variety name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 text-xs"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          ) : varieties.length === 0 ? (
            <div className="text-center py-20">
              <Tags className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No varieties found.</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Mango Count</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Created</th>
                    <th className="text-right px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {varieties.map((variety) => (
                    <tr key={variety.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Tags className="h-3.5 w-3.5 text-primary/50" />
                          {variety.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                        {variety.description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Leaf className="h-3 w-3 text-emerald-500" />
                          <span className="font-bold text-foreground">{variety.mangoCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={variety.isActive ? 'default' : 'secondary'}
                          className={`text-[10px] px-2 py-0.5 ${
                            variety.isActive
                              ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                          }`}
                        >
                          <Power className="h-2.5 w-2.5 mr-1" />
                          {variety.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(variety.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => openViewModal(variety)}>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Link href={`/admin/varieties/${variety.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => setDeleteTarget(variety)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* ===== VIEW MODAL ===== */}
      {modalMode === 'view' && selectedVariety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
          <Card className="w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold text-primary">🏷️ Variety Details</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Name</p>
                  <p className="text-sm font-semibold text-foreground">{selectedVariety.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedVariety.description || 'No description provided.'}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mangoes</p>
                    <p className="text-sm font-black text-primary">{selectedVariety.mangoCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                    <Badge variant={selectedVariety.isActive ? 'default' : 'secondary'} className={`text-[10px] mt-0.5 ${selectedVariety.isActive ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'}`}>
                      {selectedVariety.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Created</p>
                    <p className="text-xs text-muted-foreground">{new Date(selectedVariety.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Link href={`/admin/varieties/${selectedVariety.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full cursor-pointer text-xs font-bold">
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex-1 cursor-pointer text-xs font-bold text-destructive hover:bg-destructive/10"
                  onClick={() => { closeModal(); setDeleteTarget(selectedVariety) }}
                >
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
                Are you sure you want to delete <strong className="text-foreground">&quot;{deleteTarget.name}&quot;</strong>?
                {deleteTarget.mangoCount > 0 && (
                  <span className="block mt-2 text-destructive font-semibold">
                    ⚠️ This variety has {deleteTarget.mangoCount} mango(es) linked. Deletion will be blocked.
                  </span>
                )}
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
