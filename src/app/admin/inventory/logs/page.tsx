'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getInventoryLogs } from '@/actions/inventoryActions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  History,
  Plus,
  Minus,
  Pencil
} from 'lucide-react'
import { toast } from 'sonner'

interface InventoryLog {
  id: string
  mangoId: string
  actionType: 'ADD' | 'REMOVE' | 'UPDATE'
  oldStock: number
  newStock: number
  quantity: number
  note: string | null
  createdAt: string
  mango: {
    name: string
    variety: {
      name: string
    }
  }
  admin: {
    name: string
    email: string
  }
}

export default function InventoryLogsPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  async function fetchLogs() {
    setLoading(true)
    const res = await getInventoryLogs(undefined, page, 15)
    if (res.error) {
      toast.error(res.error)
    } else {
      setLogs((res.logs as unknown as InventoryLog[]) || [])
      setTotalPages(res.pages || 1)
      setTotal(res.total || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const ActionIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'ADD': return <Plus className="h-3 w-3 mr-1" />
      case 'REMOVE': return <Minus className="h-3 w-3 mr-1" />
      case 'UPDATE': return <Pencil className="h-3 w-3 mr-1" />
      default: return null
    }
  }

  const ActionBadge = ({ type }: { type: string }) => {
    switch (type) {
      case 'ADD':
        return <Badge className="text-[10px] bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"><ActionIcon type={type} /> ADDED</Badge>
      case 'REMOVE':
        return <Badge className="text-[10px] bg-rose-500/15 text-rose-600 border-rose-500/30 hover:bg-rose-500/20"><ActionIcon type={type} /> REMOVED</Badge>
      case 'UPDATE':
        return <Badge className="text-[10px] bg-blue-500/15 text-blue-600 border-blue-500/30 hover:bg-blue-500/20"><ActionIcon type={type} /> UPDATED</Badge>
      default:
        return <Badge className="text-[10px]">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/inventory">
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">📜 Inventory Logs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track all stock additions, removals, and updates.</p>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm border-border/80 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20">
              <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No logs found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Change</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Note</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-muted-foreground">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-foreground">{log.mango.name}</p>
                        <p className="text-[10px] text-muted-foreground">{log.mango.variety.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ActionBadge type={log.actionType} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="text-muted-foreground">{log.oldStock}</span>
                          <span className="text-muted-foreground/50">→</span>
                          <span className={log.actionType === 'ADD' ? 'text-emerald-500' : log.actionType === 'REMOVE' ? 'text-rose-500' : 'text-blue-500'}>
                            {log.newStock}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal ml-1">
                            ({log.actionType === 'ADD' ? '+' : log.actionType === 'REMOVE' ? '-' : ''}{log.quantity})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                        {log.note || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{log.admin.name}</p>
                        <p className="text-[10px] text-muted-foreground">{log.admin.email}</p>
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
            Page {page} of {totalPages} ({total} total logs)
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
    </div>
  )
}
