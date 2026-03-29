'use client'

import { useFormContext } from 'react-hook-form'
import { useTranslation } from '@/lib/i18n/TranslationProvider'
import type { IntakeFormData, UploadedFiles, TemplateId } from '@/lib/types'

interface ReviewSubmitProps {
  template: TemplateId
  uploadedFiles: UploadedFiles
  onEditStep: (step: number) => void
}

const fieldLabels: Record<string, string> = {
  firstName: 'form.firstName', lastName: 'form.lastName', dateOfBirth: 'form.dateOfBirth',
  ssnLast4: 'form.ssnLast4', email: 'form.email', phone: 'form.phone',
  address: 'form.address', city: 'form.city', state: 'form.state', zipCode: 'form.zipCode',
  emergencyContactName: 'form.emergencyContactName', emergencyContactPhone: 'form.emergencyContactPhone',
  employerName: 'form.employerName', jobTitle: 'form.jobTitle', annualIncome: 'form.annualIncome',
  employmentStatus: 'form.employmentStatus', yearsEmployed: 'form.yearsEmployed',
  primaryCarePhysician: 'form.primaryCarePhysician', allergies: 'form.allergies',
  currentMedications: 'form.currentMedications', medicalConditions: 'form.medicalConditions',
  caseType: 'form.caseType', opposingParty: 'form.opposingParty',
  caseDescription: 'form.caseDescription', urgencyLevel: 'form.urgencyLevel',
  reasonForVisit: 'form.reasonForVisit', referralSource: 'form.referralSource',
  preferredContact: 'form.preferredContact', notes: 'form.notes',
}

interface SectionDef {
  titleKey: string
  fields: string[]
  editStep: number
}

function getSections(template: TemplateId): SectionDef[] {
  const sections: SectionDef[] = [
    {
      titleKey: 'review.section.personal',
      fields: ['firstName', 'lastName', 'dateOfBirth', 'ssnLast4', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'emergencyContactName', 'emergencyContactPhone'],
      editStep: 0,
    },
  ]

  if (template === 'financial') {
    sections.push({
      titleKey: 'review.section.employment',
      fields: ['employerName', 'jobTitle', 'annualIncome', 'employmentStatus', 'yearsEmployed'],
      editStep: 2,
    })
  } else if (template === 'medical') {
    sections.push({
      titleKey: 'review.section.medical',
      fields: ['primaryCarePhysician', 'allergies', 'currentMedications', 'medicalConditions'],
      editStep: 2,
    })
  } else if (template === 'legal') {
    sections.push({
      titleKey: 'review.section.legal',
      fields: ['caseType', 'opposingParty', 'caseDescription', 'urgencyLevel'],
      editStep: 2,
    })
  }

  sections.push({
    titleKey: 'review.section.additional',
    fields: ['reasonForVisit', 'referralSource', 'preferredContact', 'notes'],
    editStep: template === 'general' ? 2 : 3,
  })

  return sections
}

export function ReviewSubmit({ template, uploadedFiles, onEditStep }: ReviewSubmitProps) {
  const { getValues } = useFormContext<IntakeFormData>()
  const { t } = useTranslation()
  const values = getValues()
  const sections = getSections(template)

  const fileEntries = Object.entries(uploadedFiles).filter(([, f]) => f !== null)

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const activeFields = section.fields.filter((f) => {
          const val = (values as unknown as Record<string, string>)[f]
          return val && val.trim()
        })
        if (activeFields.length === 0) return null

        return (
          <div key={section.titleKey} className="rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">{t(section.titleKey)}</h3>
              <button
                onClick={() => onEditStep(section.editStep)}
                className="text-xs font-medium text-cyan-600 hover:text-cyan-500"
              >
                {t('review.edit')}
              </button>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {activeFields.map((field) => (
                <div key={field} className="flex items-start justify-between px-5 py-3">
                  <span className="text-sm text-neutral-500">{t(fieldLabels[field] || field)}</span>
                  <span className="text-right text-sm font-medium text-neutral-950 dark:text-white">
                    {(values as unknown as Record<string, string>)[field]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Uploaded documents */}
      {fileEntries.length > 0 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">{t('review.section.documents')}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {fileEntries.map(([key, file]) => (
              <div key={key} className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800">
                  <img src={(file as UploadedFiles[keyof UploadedFiles])?.preview || ''} alt={key} className="h-full w-full object-cover" />
                </div>
                <p className="px-3 py-2 text-xs text-neutral-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
