'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings, ExternalLink, LogOut, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface AppSidebarProps {
  profile: Profile
  unreadCount: number
}

export function AppSidebar({ profile, unreadCount }: AppSidebarProps) {
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItems = [
    {
      href: '/dashboard',
      label: 'Submissions',
      icon: LayoutDashboard,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ]

  return (
    <aside className="flex w-[260px] flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800/50 dark:bg-[#0d0d0d]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: profile.brand_color || '#0891b2' }}>
          <span className="text-sm font-bold text-white">{profile.business_name?.charAt(0) || 'A'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-neutral-950 dark:text-white">{profile.business_name}</p>
          <p className="truncate text-[11px] text-neutral-400">Aush Forms</p>
        </div>
      </div>

      <div className="mx-5 h-px bg-neutral-200 dark:bg-neutral-800/50" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-white text-neutral-950 shadow-sm dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-500 hover:bg-white hover:text-neutral-900 dark:hover:bg-neutral-800/50 dark:hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-600 px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              ) : null}
            </Link>
          )
        })}

        <div className="my-3 mx-3 h-px bg-neutral-200 dark:bg-neutral-800/50" />

        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">Quick Links</p>

        {/* Public link */}
        <a
          href={`/f/${profile.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-neutral-500 transition-all hover:bg-white hover:text-neutral-900 dark:hover:bg-neutral-800/50 dark:hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="flex-1">Public Form</span>
        </a>
      </nav>

      {/* Footer */}
      <div className="space-y-2 px-3 pb-4">
        {/* Shareable link pill */}
        <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Your Form Link</p>
          <p className="mt-0.5 truncate font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400">/f/{profile.slug}</p>
        </div>

        <div className="flex items-center justify-end px-1">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-neutral-400 transition-all hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
