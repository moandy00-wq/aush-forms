'use client'

import { FormField } from '@/components/ui/FormField'
import type { FieldConfig, TemplateId } from '@/lib/types'

interface AdditionalDetailsProps {
  fieldConfig: Record<string, FieldConfig>
  template: TemplateId
}

function getReasonOptions(template: TemplateId) {
  switch (template) {
    case 'financial':
      return [
        { value: 'financial_planning', labelKey: 'form.reasonForVisit.financial_planning' },
        { value: 'tax_preparation', labelKey: 'form.reasonForVisit.tax_preparation' },
        { value: 'insurance_review', labelKey: 'form.reasonForVisit.insurance_review' },
        { value: 'investment_management', labelKey: 'form.reasonForVisit.investment_management' },
        { value: 'retirement_planning', labelKey: 'form.reasonForVisit.retirement_planning' },
        { value: 'other', labelKey: 'form.reasonForVisit.other' },
      ]
    case 'medical':
      return [
        { value: 'checkup', labelKey: 'form.reasonForVisit.checkup' },
        { value: 'followup', labelKey: 'form.reasonForVisit.followup' },
        { value: 'new_patient', labelKey: 'form.reasonForVisit.new_patient' },
        { value: 'consultation', labelKey: 'form.reasonForVisit.consultation' },
        { value: 'other', labelKey: 'form.reasonForVisit.other' },
      ]
    case 'legal':
      return [
        { value: 'consultation', labelKey: 'form.reasonForVisit.consultation' },
        { value: 'other', labelKey: 'form.reasonForVisit.other' },
      ]
    default:
      return [
        { value: 'consultation', labelKey: 'form.reasonForVisit.consultation' },
        { value: 'other', labelKey: 'form.reasonForVisit.other' },
      ]
  }
}

export function AdditionalDetails({ fieldConfig, template }: AdditionalDetailsProps) {
  const isEnabled = (field: string) => fieldConfig[field]?.enabled !== false
  const isRequired = (field: string) => fieldConfig[field]?.required === true

  return (
    <div className="space-y-4">
      {isEnabled('reasonForVisit') && (
        <FormField
          name="reasonForVisit"
          labelKey="form.reasonForVisit"
          type="select"
          required={isRequired('reasonForVisit')}
          options={getReasonOptions(template)}
        />
      )}

      {isEnabled('referralSource') && (
        <FormField name="referralSource" labelKey="form.referralSource" required={isRequired('referralSource')} />
      )}

      {isEnabled('preferredContact') && (
        <FormField
          name="preferredContact"
          labelKey="form.preferredContact"
          type="select"
          required={isRequired('preferredContact')}
          options={[
            { value: 'email', labelKey: 'form.preferredContact.email' },
            { value: 'phone', labelKey: 'form.preferredContact.phone' },
            { value: 'text', labelKey: 'form.preferredContact.text' },
          ]}
        />
      )}

      {isEnabled('notes') && (
        <FormField name="notes" labelKey="form.notes" type="textarea" placeholder="Anything else you'd like us to know..." required={isRequired('notes')} />
      )}
    </div>
  )
}
