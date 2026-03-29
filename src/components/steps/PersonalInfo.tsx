'use client'

import { useCallback, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '@/components/ui/FormField'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { processImage, terminateOcrWorker } from '@/lib/ocr'
import type { IntakeFormData, UploadedFile, FieldConfig } from '@/lib/types'
import { useTranslation } from '@/lib/i18n/TranslationProvider'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

interface PersonalInfoProps {
  fieldConfig: Record<string, FieldConfig>
  idDocument: UploadedFile | null
  onIdDocument: (file: UploadedFile | null) => void
  showMedicalFields?: boolean
}

export function PersonalInfo({ fieldConfig, idDocument, onIdDocument, showMedicalFields }: PersonalInfoProps) {
  const { setValue } = useFormContext<IntakeFormData>()
  const { t } = useTranslation()
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())

  const isEnabled = (field: string) => fieldConfig[field]?.enabled !== false
  const isRequired = (field: string) => fieldConfig[field]?.required === true

  const handleIdUpload = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file)
    onIdDocument({ file, preview, ocrStatus: 'processing', ocrProgress: 0 })

    const result = await processImage(file)

    onIdDocument({
      file,
      preview,
      ocrText: result.text,
      ocrFields: result.extractedFields,
      ocrStatus: result.status,
    })

    // Auto-fill fields
    if (result.extractedFields) {
      const filled = new Set<string>()
      for (const [key, value] of Object.entries(result.extractedFields)) {
        if (value && typeof value === 'string') {
          setValue(key as keyof IntakeFormData, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          })
          filled.add(key)
        }
      }
      setAutoFilledFields(filled)
    }
  }, [onIdDocument, setValue])

  const handleRetry = useCallback(async () => {
    if (idDocument?.file) {
      handleIdUpload(idDocument.file)
    }
  }, [idDocument, handleIdUpload])

  return (
    <div className="space-y-6">
      {/* ID Upload */}
      <FileDropzone
        label={t('form.firstName') + ' — ' + t('steps.personal.description')}
        onFile={handleIdUpload}
        preview={idDocument?.preview}
        isProcessing={idDocument?.ocrStatus === 'processing'}
        progress={idDocument?.ocrProgress}
        ocrStatus={idDocument?.ocrStatus}
        onRetry={handleRetry}
        onClear={() => onIdDocument(null)}
      />

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isEnabled('firstName') && (
          <FormField name="firstName" labelKey="form.firstName" required={isRequired('firstName')} autoFilled={autoFilledFields.has('firstName')} />
        )}
        {isEnabled('lastName') && (
          <FormField name="lastName" labelKey="form.lastName" required={isRequired('lastName')} autoFilled={autoFilledFields.has('lastName')} />
        )}
      </div>

      {isEnabled('dateOfBirth') && (
        <FormField name="dateOfBirth" labelKey="form.dateOfBirth" type="date" required={isRequired('dateOfBirth')} autoFilled={autoFilledFields.has('dateOfBirth')} />
      )}

      {isEnabled('ssnLast4') && (
        <FormField name="ssnLast4" labelKey="form.ssnLast4" placeholder="1234" required={isRequired('ssnLast4')} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isEnabled('email') && (
          <FormField name="email" labelKey="form.email" type="email" required={isRequired('email')} />
        )}
        {isEnabled('phone') && (
          <FormField name="phone" labelKey="form.phone" type="tel" required={isRequired('phone')} />
        )}
      </div>

      {isEnabled('address') && (
        <FormField name="address" labelKey="form.address" required={isRequired('address')} autoFilled={autoFilledFields.has('address')} />
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {isEnabled('city') && (
          <FormField name="city" labelKey="form.city" required={isRequired('city')} autoFilled={autoFilledFields.has('city')} />
        )}
        {isEnabled('state') && (
          <FormField
            name="state"
            labelKey="form.state"
            type="select"
            required={isRequired('state')}
            autoFilled={autoFilledFields.has('state')}
            options={US_STATES.map((s) => ({ value: s, label: s }))}
          />
        )}
        {isEnabled('zipCode') && (
          <FormField name="zipCode" labelKey="form.zipCode" required={isRequired('zipCode')} autoFilled={autoFilledFields.has('zipCode')} />
        )}
      </div>

      {/* Medical-specific emergency contact */}
      {showMedicalFields && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isEnabled('emergencyContactName') && (
            <FormField name="emergencyContactName" labelKey="form.emergencyContactName" required={isRequired('emergencyContactName')} />
          )}
          {isEnabled('emergencyContactPhone') && (
            <FormField name="emergencyContactPhone" labelKey="form.emergencyContactPhone" type="tel" required={isRequired('emergencyContactPhone')} />
          )}
        </div>
      )}
    </div>
  )
}
