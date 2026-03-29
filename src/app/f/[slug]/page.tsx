import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Profile } from '@/lib/types'
import { PublicFormClient } from './PublicFormClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicFormPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .eq('setup_completed', true)
    .single()

  if (error || !profile) {
    notFound()
  }

  return <PublicFormClient profile={profile as Profile} />
}
