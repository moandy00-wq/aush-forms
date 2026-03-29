'use client'

import { FormField } from '@/components/ui/FormField'
import type { FieldConfig } from '@/lib/types'

interface EmploymentProps {
  fieldConfig: Record<string, FieldConfig>
}

export function Employment({ fieldConfig }: EmploymentProps) {
  const isEnabled = (field: string) => fieldConfig[field]?.enabled !== false
  const isRequired = (field: string) => fieldConfig[field]?.required === true

  return (
    <div className="space-y-4">
      {isEnabled('employerName') && (
        <FormField name="employerName" labelKey="form.employerName" required={isRequired('employerName')} />
      )}

      {isEnabled('jobTitle') && (
        <FormField name="jobTitle" labelKey="form.jobTitle" required={isRequired('jobTitle')} />
      )}

      {isEnabled('annualIncome') && (
        <FormField name="annualIncome" labelKey="form.annualIncome" placeholder="$50,000" required={isRequired('annualIncome')} />
      )}

      {isEnabled('employmentStatus') && (
        <FormField
          name="employmentStatus"
          labelKey="form.employmentStatus"
          type="select"
          required={isRequired('employmentStatus')}
          options={[
            { value: 'full-time', labelKey: 'form.employmentStatus.fulltime' },
            { value: 'part-time', labelKey: 'form.employmentStatus.parttime' },
            { value: 'self-employed', labelKey: 'form.employmentStatus.selfEmployed' },
            { value: 'unemployed', labelKey: 'form.employmentStatus.unemployed' },
            { value: 'retired', labelKey: 'form.employmentStatus.retired' },
          ]}
        />
      )}

      {isEnabled('yearsEmployed') && (
        <FormField name="yearsEmployed" labelKey="form.yearsEmployed" placeholder="3" required={isRequired('yearsEmployed')} />
      )}
    </div>
  )
}
