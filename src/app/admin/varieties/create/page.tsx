'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createVariety } from '@/actions/varietyActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, Tags } from 'lucide-react'

export default function CreateVarietyPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.set('name', name)
    formData.set('description', description)
    formData.set('isActive', isActive.toString())

    const res = await createVariety(formData)
    if (res.error) {
      setError(res.error)
      toast.error(res.error)
    } else {
      toast.success('Variety created successfully!')
      router.push('/admin/varieties')
    }

    setSubmitting(false)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/varieties">
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">🏷️ Add New Variety</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create a new mango variety classification.</p>
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Tags className="h-4 w-4 text-primary" />
            Variety Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg font-medium border border-destructive/20">
                {error}
              </div>
            )}

            {/* Variety Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Variety Name *</label>
              <Input
                type="text"
                placeholder="e.g. Chaunsa, Sindhri, Langra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                className="text-xs"
                required
                minLength={3}
                maxLength={100}
              />
              <p className="text-[10px] text-muted-foreground">3–100 characters. Must be unique.</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Description</label>
              <textarea
                placeholder="Brief description of this variety's characteristics..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
                className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Status</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                disabled={submitting}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-semibold ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Link href="/admin/varieties" className="flex-1">
                <Button type="button" variant="outline" className="w-full cursor-pointer text-xs font-bold" disabled={submitting}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={submitting} className="flex-1 font-bold cursor-pointer h-10">
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  'Create Variety'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
