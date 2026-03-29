import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Eye, Archive, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('slug')
    .eq('id', user.id)
    .single()

  // Get submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const allSubs = submissions || []
  const unreadCount = allSubs.filter((s) => !s.read).length
  const thisWeek = allSubs.filter((s) => {
    const d = new Date(s.created_at)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  }).length

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-neutral-950 dark:text-white">Submissions</h1>
          <p className="mt-1 text-sm text-neutral-500">View and manage client intake submissions.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
            Your link: <span className="font-semibold text-cyan-600 dark:text-cyan-400">/f/{profile?.slug}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white">{allSubs.length}</p>
              <p className="text-xs text-neutral-500">Total Submissions</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white">{unreadCount}</p>
              <p className="text-xs text-neutral-500">Unread</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white">{thisWeek}</p>
              <p className="text-xs text-neutral-500">This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="mt-8">
        {allSubs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <FileText className="h-6 w-6 text-neutral-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-neutral-950 dark:text-white">No submissions yet</h3>
            <p className="mt-1 text-sm text-neutral-500">Share your form link with clients to start receiving submissions.</p>
            <p className="mt-4 rounded-lg bg-cyan-50 px-4 py-2 font-mono text-sm text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">
              {typeof window !== 'undefined' ? window.location.host : ''}/f/{profile?.slug}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Template</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-950">
                {allSubs.map((sub) => {
                  const formData = sub.form_data as Record<string, string>
                  const name = [formData?.firstName, formData?.lastName].filter(Boolean).join(' ') || 'Unknown'
                  const date = new Date(sub.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })
                  return (
                    <tr key={sub.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/submissions/${sub.id}`} className="flex items-center gap-2">
                          {!sub.read && (
                            <span className="h-2 w-2 rounded-full bg-cyan-500" />
                          )}
                          <span className={`text-sm font-medium ${!sub.read ? 'text-neutral-950 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                            {name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          {sub.template}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-md px-2 py-1 text-xs font-medium ${
                          sub.status === 'new'
                            ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400'
                            : sub.status === 'reviewed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-500">{date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
