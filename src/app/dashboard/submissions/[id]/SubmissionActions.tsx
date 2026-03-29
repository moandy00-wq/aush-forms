'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Archive, Download } from 'lucide-react'

interface Props {
  submissionId: string
  status: string
  pdfUrl: string | null
}

export function SubmissionActions({ submissionId, status, pdfUrl }: Props) {
  const router = useRouter()

  async function updateStatus(newStatus: string) {
    const supabase = createClient()
    await supabase
      .from('submissions')
      .update({ status: newStatus })
      .eq('id', submissionId)
    router.refresh()
  }

  return (
    <div className="mt-4 flex items-center gap-2">
      {status !== 'reviewed' && (
        <button
          onClick={() => updateStatus('reviewed')}
          className="flex items-center gap-2 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
        >
          <CheckCircle className="h-4 w-4" />
          Mark as Reviewed
        </button>
      )}
      {status !== 'archived' && (
        <button
          onClick={() => updateStatus('archived')}
          className="flex items-center gap-2 rounded-sm border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <Archive className="h-4 w-4" />
          Archive
        </button>
      )}
      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-sm border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 transition-all hover:bg-cyan-100 dark:border-cyan-500/20 dark:bg-cyan-500/5 dark:text-cyan-400 dark:hover:bg-cyan-500/10"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      )}
    </div>
  )
}
