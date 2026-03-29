import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, CheckCircle, Archive } from 'lucide-react'
import { SubmissionActions } from './SubmissionActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch submission
  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!submission) notFound()

  // Fetch documents
  const { data: documents } = await supabase
    .from('submission_documents')
    .select('*')
    .eq('submission_id', id)

  // Mark as read
  if (!submission.read) {
    await supabase
      .from('submissions')
      .update({ read: true })
      .eq('id', id)
  }

  const formData = submission.form_data as Record<string, string>
  const name = [formData?.firstName, formData?.middleName, formData?.lastName].filter(Boolean).join(' ') || 'Unknown'
  const date = new Date(submission.created_at).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  // Group fields by section
  const personalFields = ['firstName', 'middleName', 'lastName', 'dateOfBirth', 'ssnLast4', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'emergencyContactName', 'emergencyContactPhone']
  const employmentFields = ['employerName', 'jobTitle', 'annualIncome', 'employmentStatus', 'yearsEmployed']
  const medicalFields = ['primaryCarePhysician', 'allergies', 'currentMedications', 'medicalConditions']
  const legalFields = ['caseType', 'opposingParty', 'caseDescription', 'urgencyLevel']
  const additionalFields = ['reasonForVisit', 'referralSource', 'preferredContact', 'notes']

  const fieldLabels: Record<string, string> = {
    firstName: 'First Name', middleName: 'Middle Name', lastName: 'Last Name', dateOfBirth: 'Date of Birth',
    ssnLast4: 'SSN (Last 4)', email: 'Email', phone: 'Phone', address: 'Address',
    city: 'City', state: 'State', zipCode: 'ZIP Code',
    emergencyContactName: 'Emergency Contact', emergencyContactPhone: 'Emergency Phone',
    employerName: 'Employer', jobTitle: 'Job Title', annualIncome: 'Annual Income',
    employmentStatus: 'Employment Status', yearsEmployed: 'Years Employed',
    primaryCarePhysician: 'Primary Physician', allergies: 'Allergies',
    currentMedications: 'Medications', medicalConditions: 'Conditions',
    caseType: 'Case Type', opposingParty: 'Opposing Party',
    caseDescription: 'Case Description', urgencyLevel: 'Urgency',
    reasonForVisit: 'Reason for Visit', referralSource: 'Referral Source',
    preferredContact: 'Preferred Contact', notes: 'Notes',
  }

  function renderSection(title: string, fields: string[]) {
    const activeFields = fields.filter((f) => formData[f] && formData[f].trim())
    if (activeFields.length === 0) return null

    return (
      <div className="rounded border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">{title}</h3>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {activeFields.map((field) => (
            <div key={field} className="flex items-start justify-between px-5 py-3">
              <span className="text-sm text-neutral-500">{fieldLabels[field] || field}</span>
              <span className="text-right text-sm font-medium text-neutral-950 dark:text-white">{formData[field]}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      {/* Back link */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300">
        <ArrowLeft className="h-4 w-4" />
        Back to submissions
      </Link>

      {/* Header */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-neutral-950 dark:text-white">{name}</h1>
          <p className="mt-1 text-sm text-neutral-500">{date} &middot; {submission.template} template</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-sm px-2.5 py-1 text-xs font-medium ${
            submission.status === 'new'
              ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400'
              : submission.status === 'reviewed'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
          }`}>
            {submission.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <SubmissionActions
        submissionId={submission.id}
        status={submission.status}
        pdfUrl={submission.pdf_url}
      />

      {/* Form Data */}
      <div className="mt-6 space-y-4">
        {renderSection('Personal Information', personalFields)}
        {renderSection('Employment & Income', employmentFields)}
        {renderSection('Medical Information', medicalFields)}
        {renderSection('Case Information', legalFields)}
        {renderSection('Additional Details', additionalFields)}
      </div>

      {/* Documents */}
      {documents && documents.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-neutral-950 dark:text-white">Uploaded Documents</h3>
          <div className="grid grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="overflow-hidden rounded border border-neutral-200 dark:border-neutral-800">
                <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800">
                  {doc.file_url && (
                    <img
                      src={doc.file_url}
                      alt={doc.file_name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-950 dark:text-white">{doc.document_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-neutral-400">{doc.file_name}</p>
                  </div>
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-500">
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
