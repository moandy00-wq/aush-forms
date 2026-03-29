'use client'

import { FormField } from '@/components/ui/FormField'
import type { FieldConfig } from '@/lib/types'

interface LegalInfoProps {
  fieldConfig: Record<string, FieldConfig>
}

export function LegalInfo({ fieldConfig }: LegalInfoProps) {
  const isEnabled = (field: string) => fieldConfig[field]?.enabled !== false
  const isRequired = (field: string) => fieldConfig[field]?.required === true

  return (
    <div className="space-y-4">
      {isEnabled('caseType') && (
        <FormField
          name="caseType"
          labelKey="form.caseType"
          type="select"
          required={isRequired('caseType')}
          options={[
            { value: 'family', labelKey: 'form.caseType.family' },
            { value: 'criminal', labelKey: 'form.caseType.criminal' },
            { value: 'personal_injury', labelKey: 'form.caseType.personal_injury' },
            { value: 'business', labelKey: 'form.caseType.business' },
            { value: 'estate', labelKey: 'form.caseType.estate' },
            { value: 'immigration', labelKey: 'form.caseType.immigration' },
            { value: 'other', labelKey: 'form.caseType.other' },
          ]}
        />
      )}

      {isEnabled('opposingParty') && (
        <FormField name="opposingParty" labelKey="form.opposingParty" required={isRequired('opposingParty')} />
      )}

      {isEnabled('caseDescription') && (
        <FormField name="caseDescription" labelKey="form.caseDescription" type="textarea" placeholder="Describe your case..." required={isRequired('caseDescription')} />
      )}

      {isEnabled('urgencyLevel') && (
        <FormField
          name="urgencyLevel"
          labelKey="form.urgencyLevel"
          type="select"
          required={isRequired('urgencyLevel')}
          options={[
            { value: 'low', labelKey: 'form.urgencyLevel.low' },
            { value: 'medium', labelKey: 'form.urgencyLevel.medium' },
            { value: 'high', labelKey: 'form.urgencyLevel.high' },
            { value: 'critical', labelKey: 'form.urgencyLevel.critical' },
          ]}
        />
      )}
    </div>
  )
}
