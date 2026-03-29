import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { businessName, slug, notificationEmail, template, brandColor, fieldConfig } = body

  if (!businessName || !slug || !template) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check slug availability
  const serviceClient = await createServiceClient()
  const { data: existing } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('slug', slug)
    .neq('id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'This URL is already taken. Try another.' }, { status: 409 })
  }

  // Upsert profile
  const { error } = await serviceClient
    .from('profiles')
    .upsert({
      id: user.id,
      business_name: businessName,
      slug,
      notification_email: notificationEmail || user.email || '',
      template,
      brand_color: brandColor || '#0891b2',
      field_config: fieldConfig || {},
      setup_completed: true,
    })

  if (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
