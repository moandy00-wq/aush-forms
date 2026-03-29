import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from './AppSidebar'
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
    <div className="flex min-h-dvh">
      <AppSidebar
        profile={profile as Profile}
        unreadCount={unreadCount || 0}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
