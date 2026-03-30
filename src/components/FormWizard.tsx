'use client'

import { useState, useCallback } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Send, Download, Mail, RotateCcw } from 'lucide-react'
import { ProgressBar } from './ui/ProgressBar'
import { PersonalInfo } from './steps/PersonalInfo'
import { DocumentUpload } from './steps/DocumentUpload'
import { Employment } from './steps/Employment'
import { MedicalInfo } from './steps/MedicalInfo'
import { LegalInfo } from './steps/LegalInfo'
import { AdditionalDetails } from './steps/AdditionalDetails'
import { ReviewSubmit } from './steps/ReviewSubmit'
import { useTranslation } from '@/lib/i18n/TranslationProvider'
import { getTemplate, defaultFormValues } from '@/lib/templates'
import { generateIntakePdf, downloadBlob } from '@/lib/pdf'
import { createClient } from '@/lib/supabase/client'
import type { Profile, IntakeFormData, UploadedFile, UploadedFiles } from '@/lib/types'

interface FormWizardProps {
  profile: Profile
}

export function FormWizard({ profile }: FormWizardProps) {
  const { t, locale } = useTranslation()
  const template = getTemplate(profile.template)
  const fieldConfig = { ...template.defaultFieldConfig, ...profile.field_config }

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

  // File state (separate from form)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    idDocument: null,
    taxReturn: null,
    payStub: null,
    insuranceCard: null,
    legalDocument: null,
    utilityBill: null,
  })

  const methods = useForm<IntakeFormData>({
    defaultValues: defaultFormValues,
    mode: 'onTouched',
  })

  const [missingFields, setMissingFields] = useState<string[]>([])

  // Filter out steps where all fields are disabled — skip empty sections
  const steps = template.steps.filter((step) => {
    // Always show steps with no fields (personal info upload, document upload, review)
    if (step.fields.length === 0) return true
    // Show step if at least one field is enabled
    return step.fields.some((f) => fieldConfig[f]?.enabled !== false)
  })

  // Step validation field maps
  const getStepFields = (stepId: string): string[] => {
    const step = steps.find((s) => s.id === stepId)
    if (!step) return []
    // Only validate enabled + required fields
    return step.fields.filter((f) => fieldConfig[f]?.enabled && fieldConfig[f]?.required)
  }

  const goNext = useCallback(() => {
    setMissingFields([])
    setDirection(1)
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
  }, [steps])

  const goBack = useCallback(() => {
    setDirection(-1)
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }, [currentStep])

  const handleSubmit = useCallback(async () => {
    // Check all required fields across all steps before submitting
    const formData = methods.getValues()
    const missing: string[] = []

    for (const step of steps) {
      for (const field of step.fields) {
        if (fieldConfig[field]?.enabled && fieldConfig[field]?.required) {
          const value = formData[field as keyof IntakeFormData]
          if (!value || !value.trim()) {
            // Format field name for display: "firstName" → "First Name"
            missing.push(field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()))
          }
        }
      }
    }

    if (missing.length > 0) {
      setMissingFields(missing)
      return
    }

    setMissingFields([])
    setSubmitting(true)

    try {
      const supabase = createClient()

      // Upload files to Supabase Storage
      const docRecords: { document_type: string; file_url: string; file_name: string; ocr_text: string | null }[] = []

      for (const [key, fileData] of Object.entries(uploadedFiles)) {
        if (!fileData) continue
        const path = `${profile.id}/${Date.now()}-${fileData.file.name}`
        const { data: uploadData } = await supabase.storage
          .from('documents')
          .upload(path, fileData.file)

        if (uploadData) {
          const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
          docRecords.push({
            document_type: key,
            file_url: urlData.publicUrl,
            file_name: fileData.file.name,
            ocr_text: fileData.ocrText || null,
          })
        }
      }

      // Generate PDF
      const pdf = await generateIntakePdf(formData, uploadedFiles, profile, locale as 'en' | 'es')
      setPdfBlob(pdf)

      // Upload PDF to storage
      let pdfUrl: string | null = null
      const pdfPath = `${profile.id}/${Date.now()}-intake.pdf`
      const { data: pdfUpload } = await supabase.storage
        .from('pdfs')
        .upload(pdfPath, pdf, { contentType: 'application/pdf' })

      if (pdfUpload) {
        const { data: pdfUrlData } = supabase.storage.from('pdfs').getPublicUrl(pdfPath)
        pdfUrl = pdfUrlData.publicUrl
      }

      // Save submission
      const { data: submission } = await supabase
        .from('submissions')
        .insert({
          owner_id: profile.id,
          form_data: formData as unknown as Record<string, unknown>,
          template: profile.template,
          pdf_url: pdfUrl,
        })
        .select('id')
        .single()

      // Save document records
      if (submission && docRecords.length > 0) {
        await supabase
          .from('submission_documents')
          .insert(docRecords.map((doc) => ({
            ...doc,
            submission_id: submission.id,
          })))
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }, [methods, uploadedFiles, profile, locale])

  const handleDownloadPdf = useCallback(() => {
    if (pdfBlob) {
      downloadBlob(pdfBlob, `${profile.business_name}-intake.pdf`)
    }
  }, [pdfBlob, profile])

  const handleStartOver = useCallback(() => {
    methods.reset(defaultFormValues)
    setUploadedFiles({
      idDocument: null, taxReturn: null, payStub: null,
      insuranceCard: null, legalDocument: null, utilityBill: null,
    })
    setCurrentStep(0)
    setSubmitted(false)
    setPdfBlob(null)
  }, [methods])

  const isLastStep = currentStep === steps.length - 1

  // Animation variants
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  }

  // Success state
  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded" style={{ backgroundColor: profile.brand_color }}>
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-neutral-950 dark:text-white">{t('success.title')}</h2>
        <p className="mt-2 max-w-md text-sm text-neutral-500">{t('success.message')}</p>

        <div className="mt-8 flex items-center gap-3">
          {pdfBlob && (
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: profile.brand_color }}
            >
              <Download className="h-4 w-4" />
              {t('wizard.downloadPdf')}
            </button>
          )}
          <button
            onClick={() => {
              alert(`${t('success.emailSent')} ${methods.getValues('email')}`)
            }}
            className="flex items-center gap-2 rounded-sm border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Mail className="h-4 w-4" />
            {t('wizard.emailPdf')}
          </button>
        </div>

        <button
          onClick={handleStartOver}
          className="mt-6 flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-700"
        >
          <RotateCcw className="h-4 w-4" />
          {t('wizard.startOver')}
        </button>
      </div>
    )
  }

  // Render current step
  function renderStep() {
    const stepConfig = steps[currentStep]
    if (!stepConfig) return null

    switch (stepConfig.component) {
      case 'PersonalInfo':
        return (
          <PersonalInfo
            fieldConfig={fieldConfig}
            idDocument={uploadedFiles.idDocument}
            onIdDocument={(file) => setUploadedFiles((prev) => ({ ...prev, idDocument: file }))}
            showMedicalFields={profile.template === 'medical'}
          />
        )
      case 'DocumentUpload':
        return (
          <DocumentUpload
            documentTypes={template.documentTypes}
            files={uploadedFiles as unknown as Record<string, UploadedFile | null>}
            onFileChange={(key, file) => setUploadedFiles((prev) => ({ ...prev, [key]: file }))}
          />
        )
      case 'Employment':
        return <Employment fieldConfig={fieldConfig} />
      case 'MedicalInfo':
        return <MedicalInfo fieldConfig={fieldConfig} />
      case 'LegalInfo':
        return <LegalInfo fieldConfig={fieldConfig} />
      case 'AdditionalDetails':
        return <AdditionalDetails fieldConfig={fieldConfig} template={profile.template} />
      case 'ReviewSubmit':
        return (
          <ReviewSubmit
            template={profile.template}
            uploadedFiles={uploadedFiles}
            onEditStep={goToStep}
          />
        )
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <div>
        {/* Progress */}
        <ProgressBar
          steps={steps}
          currentStep={currentStep}
          brandColor={profile.brand_color}
        />

        {/* Step content */}
        <div className="relative mt-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Missing fields warning */}
        {missingFields.length > 0 && (
          <div className="mt-6 rounded border border-rose-500/20 bg-rose-500/5 p-4">
            <p className="text-sm font-semibold text-rose-500">Please fill out the following required fields:</p>
            <ul className="mt-2 space-y-1">
              {missingFields.map((f) => (
                <li key={f} className="text-xs text-rose-400">• {f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {currentStep > 0 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('wizard.back')}
            </button>
          ) : <div />}

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-sm px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: profile.brand_color }}
            >
              <Send className="h-4 w-4" />
              {submitting ? t('wizard.submitting') : t('wizard.submit')}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-2 rounded-sm bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {t('wizard.next')}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </FormProvider>
  )
}
