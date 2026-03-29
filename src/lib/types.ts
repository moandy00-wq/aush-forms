import type { LucideIcon } from 'lucide-react'

// ============================================================
// Form Data
// ============================================================

export interface IntakeFormData {
  // Personal Info (all templates)
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  ssnLast4: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string

  // Medical-specific
  emergencyContactName: string
  emergencyContactPhone: string

  // Employment (financial template)
  employerName: string
  jobTitle: string
  annualIncome: string
  employmentStatus: string
  yearsEmployed: string

  // Medical-specific
  primaryCarePhysician: string
  allergies: string
  currentMedications: string
  medicalConditions: string

  // Legal-specific
  caseType: string
  opposingParty: string
  caseDescription: string
  urgencyLevel: string

  // Additional Details (all templates)
  reasonForVisit: string
  referralSource: string
  preferredContact: string
  notes: string
}

// ============================================================
// File Uploads
// ============================================================

export interface UploadedFile {
  file: File
  preview: string
  ocrText?: string
  ocrFields?: Partial<IntakeFormData>
  ocrStatus?: 'idle' | 'processing' | 'success' | 'partial' | 'failed'
  ocrProgress?: number
}

export interface UploadedFiles {
  idDocument: UploadedFile | null
  taxReturn: UploadedFile | null
  payStub: UploadedFile | null
  insuranceCard: UploadedFile | null
  legalDocument: UploadedFile | null
  utilityBill: UploadedFile | null
}

// ============================================================
// OCR
// ============================================================

export interface OcrResult {
  text: string
  confidence: number
  extractedFields: Partial<IntakeFormData>
  status: 'success' | 'partial' | 'failed'
}

// ============================================================
// Templates
// ============================================================

export type TemplateId = 'financial' | 'medical' | 'legal' | 'general'

export interface FieldConfig {
  enabled: boolean
  required: boolean
}

export interface StepConfig {
  id: string
  titleKey: string
  descriptionKey: string
  component: string
  fields: (keyof IntakeFormData)[]
}

export interface TemplateConfig {
  id: TemplateId
  name: string
  description: string
  iconName: string
  steps: StepConfig[]
  defaultFieldConfig: Record<string, FieldConfig>
  documentTypes: string[]
}

// ============================================================
// Database Models
// ============================================================

export interface Profile {
  id: string
  slug: string
  business_name: string
  business_logo_url: string | null
  brand_color: string
  template: TemplateId
  field_config: Record<string, FieldConfig>
  notification_email: string
  setup_completed: boolean
  created_at: string
}

export interface Submission {
  id: string
  owner_id: string
  form_data: Record<string, string>
  template: TemplateId
  status: 'new' | 'reviewed' | 'archived'
  read: boolean
  pdf_url: string | null
  created_at: string
  documents?: SubmissionDocument[]
}

export interface SubmissionDocument {
  id: string
  submission_id: string
  document_type: string
  file_url: string
  file_name: string
  ocr_text: string | null
  ocr_fields: Record<string, string> | null
  created_at: string
}

// ============================================================
// UI
// ============================================================

export type StepStatus = 'upcoming' | 'current' | 'completed'
