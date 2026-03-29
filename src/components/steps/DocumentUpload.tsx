'use client'

import { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { processImage } from '@/lib/ocr'
import type { IntakeFormData, UploadedFile } from '@/lib/types'
import { useTranslation } from '@/lib/i18n/TranslationProvider'

interface DocumentUploadProps {
  documentTypes: string[]
  files: Record<string, UploadedFile | null>
  onFileChange: (key: string, file: UploadedFile | null) => void
}

const docLabels: Record<string, { en: string; es: string }> = {
  drivers_license: { en: "Driver's License / State ID", es: 'Licencia de Conducir / ID' },
  tax_return: { en: 'Tax Return', es: 'Declaración de Impuestos' },
  pay_stub: { en: 'Pay Stub', es: 'Recibo de Pago' },
  insurance_card: { en: 'Insurance Card', es: 'Tarjeta de Seguro' },
  legal_document: { en: 'Legal Document', es: 'Documento Legal' },
  utility_bill: { en: 'Utility Bill', es: 'Factura de Servicios' },
}

export function DocumentUpload({ documentTypes, files, onFileChange }: DocumentUploadProps) {
  const { setValue } = useFormContext<IntakeFormData>()
  const { t, locale } = useTranslation()

  const handleUpload = useCallback(async (docType: string, file: File) => {
    const preview = URL.createObjectURL(file)
    onFileChange(docType, { file, preview, ocrStatus: 'processing' })

    const result = await processImage(file)

    onFileChange(docType, {
      file,
      preview,
      ocrText: result.text,
      ocrFields: result.extractedFields,
      ocrStatus: result.status,
    })

    // Auto-fill any extracted fields
    if (result.extractedFields) {
      for (const [key, value] of Object.entries(result.extractedFields)) {
        if (value && typeof value === 'string') {
          setValue(key as keyof IntakeFormData, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          })
        }
      }
    }
  }, [onFileChange, setValue])

  // Filter out drivers_license since it's handled in PersonalInfo step
  const additionalDocs = documentTypes.filter((dt) => dt !== 'drivers_license')

  if (additionalDocs.length === 0) {
    return (
      <div className="rounded border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
        <p className="text-sm text-neutral-500">{t('steps.documents.description')}</p>
        <p className="mt-1 text-xs text-neutral-400">No additional documents required for this template.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded bg-amber-50 px-4 py-3 dark:bg-amber-500/5">
        <p className="text-sm text-amber-700 dark:text-amber-400">{t('upload.warning')}</p>
      </div>

      {additionalDocs.map((docType) => {
        const label = locale === 'es' ? docLabels[docType]?.es : docLabels[docType]?.en
        const fileData = files[docType] || null

        return (
          <FileDropzone
            key={docType}
            label={label || docType}
            onFile={(file) => handleUpload(docType, file)}
            preview={fileData?.preview}
            isProcessing={fileData?.ocrStatus === 'processing'}
            ocrStatus={fileData?.ocrStatus}
            onRetry={() => fileData?.file && handleUpload(docType, fileData.file)}
            onClear={() => onFileChange(docType, null)}
          />
        )
      })}
    </div>
  )
}
