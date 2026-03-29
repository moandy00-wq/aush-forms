'use client'

import { FormField } from '@/components/ui/FormField'
import type { FieldConfig } from '@/lib/types'

interface MedicalInfoProps {
  fieldConfig: Record<string, FieldConfig>
}

export function MedicalInfo({ fieldConfig }: MedicalInfoProps) {
  const isEnabled = (field: string) => fieldConfig[field]?.enabled !== false
  const isRequired = (field: string) => fieldConfig[field]?.required === true

  return (
    <div className="space-y-4">
      {isEnabled('primaryCarePhysician') && (
        <FormField name="primaryCarePhysician" labelKey="form.primaryCarePhysician" required={isRequired('primaryCarePhysician')} />
      )}

      {isEnabled('allergies') && (
        <FormField name="allergies" labelKey="form.allergies" type="textarea" placeholder="List any known allergies..." required={isRequired('allergies')} />
      )}

      {isEnabled('currentMedications') && (
        <FormField name="currentMedications" labelKey="form.currentMedications" type="textarea" placeholder="List current medications..." required={isRequired('currentMedications')} />
      )}

      {isEnabled('medicalConditions') && (
        <FormField name="medicalConditions" labelKey="form.medicalConditions" type="textarea" placeholder="List any medical conditions..." required={isRequired('medicalConditions')} />
      )}
    </div>
  )
}
