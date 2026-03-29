import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from './AppSidebar'
import { DashboardTour } from './DashboardTour'
import type { Profile } from '@/lib/types'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.setup_completed) redirect('/setup')

  // Get unread submissions count
  const { count: unreadCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .eq('read', false)

  return (
    <>
      <div className="flex min-h-dvh" data-tour-wrapper>
        <AppSidebar
          profile={profile as Profile}
          unreadCount={unreadCount || 0}
        />
        <main className="relative flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="relative">
            {children}
          </div>
        </main>
      </div>
      <DashboardTour slug={(profile as Profile).slug} />
    </>
  )
}
