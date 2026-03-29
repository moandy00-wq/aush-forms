import type { TemplateConfig, StepConfig, FieldConfig } from './types'

// ============================================================
// Step Definitions
// ============================================================

const personalInfoStep: StepConfig = {
  id: 'personal',
  titleKey: 'steps.personal.title',
  descriptionKey: 'steps.personal.description',
  component: 'PersonalInfo',
  fields: ['firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'address', 'city', 'state', 'zipCode'],
}

const documentUploadStep: StepConfig = {
  id: 'documents',
  titleKey: 'steps.documents.title',
  descriptionKey: 'steps.documents.description',
  component: 'DocumentUpload',
  fields: [], // No form fields to validate — just uploads
}

const employmentStep: StepConfig = {
  id: 'employment',
  titleKey: 'steps.employment.title',
  descriptionKey: 'steps.employment.description',
  component: 'Employment',
  fields: ['employerName', 'annualIncome', 'employmentStatus'],
}

const medicalInfoStep: StepConfig = {
  id: 'medical',
  titleKey: 'steps.medical.title',
  descriptionKey: 'steps.medical.description',
  component: 'MedicalInfo',
  fields: ['primaryCarePhysician'],
}

const legalInfoStep: StepConfig = {
  id: 'legal',
  titleKey: 'steps.legal.title',
  descriptionKey: 'steps.legal.description',
  component: 'LegalInfo',
  fields: ['caseType', 'caseDescription', 'urgencyLevel'],
}

const additionalDetailsStep: StepConfig = {
  id: 'additional',
  titleKey: 'steps.additional.title',
  descriptionKey: 'steps.additional.description',
  component: 'AdditionalDetails',
  fields: ['reasonForVisit', 'preferredContact'],
}

const reviewStep: StepConfig = {
  id: 'review',
  titleKey: 'steps.review.title',
  descriptionKey: 'steps.review.description',
  component: 'ReviewSubmit',
  fields: [], // No validation — review only
}

// ============================================================
// Field Defaults (enabled + required)
// ============================================================

function field(enabled: boolean, required: boolean): FieldConfig {
  return { enabled, required }
}

// ============================================================
// Templates
// ============================================================

export const templates: Record<string, TemplateConfig> = {
  financial: {
    id: 'financial',
    name: 'Financial Services',
    description: 'Tax prep, financial planning, insurance, investment management',
    iconName: 'DollarSign',
    steps: [personalInfoStep, documentUploadStep, employmentStep, additionalDetailsStep, reviewStep],
    documentTypes: ['drivers_license', 'tax_return', 'pay_stub'],
    defaultFieldConfig: {
      firstName: field(true, true),
      lastName: field(true, true),
      dateOfBirth: field(true, true),
      ssnLast4: field(true, false),
      email: field(true, true),
      phone: field(true, true),
      address: field(true, true),
      city: field(true, true),
      state: field(true, true),
      zipCode: field(true, true),
      employerName: field(true, true),
      jobTitle: field(true, false),
      annualIncome: field(true, true),
      employmentStatus: field(true, true),
      yearsEmployed: field(true, false),
      reasonForVisit: field(true, true),
      referralSource: field(true, false),
      preferredContact: field(true, true),
      notes: field(true, false),
    },
  },
  medical: {
    id: 'medical',
    name: 'Healthcare',
    description: 'Medical offices, clinics, dental practices, therapy',
    iconName: 'Heart',
    steps: [personalInfoStep, documentUploadStep, medicalInfoStep, additionalDetailsStep, reviewStep],
    documentTypes: ['drivers_license', 'insurance_card'],
    defaultFieldConfig: {
      firstName: field(true, true),
      lastName: field(true, true),
      dateOfBirth: field(true, true),
      ssnLast4: field(false, false),
      email: field(true, true),
      phone: field(true, true),
      address: field(true, true),
      city: field(true, true),
      state: field(true, true),
      zipCode: field(true, true),
      emergencyContactName: field(true, true),
      emergencyContactPhone: field(true, true),
      primaryCarePhysician: field(true, true),
      allergies: field(true, false),
      currentMedications: field(true, false),
      medicalConditions: field(true, false),
      reasonForVisit: field(true, true),
      referralSource: field(true, false),
      preferredContact: field(true, true),
      notes: field(true, false),
    },
  },
  legal: {
    id: 'legal',
    name: 'Legal Services',
    description: 'Law firms, legal consultations, case intake',
    iconName: 'Scale',
    steps: [personalInfoStep, documentUploadStep, legalInfoStep, additionalDetailsStep, reviewStep],
    documentTypes: ['drivers_license', 'legal_document'],
    defaultFieldConfig: {
      firstName: field(true, true),
      lastName: field(true, true),
      dateOfBirth: field(true, true),
      ssnLast4: field(false, false),
      email: field(true, true),
      phone: field(true, true),
      address: field(true, true),
      city: field(true, true),
      state: field(true, true),
      zipCode: field(true, true),
      caseType: field(true, true),
      opposingParty: field(true, false),
      caseDescription: field(true, true),
      urgencyLevel: field(true, true),
      reasonForVisit: field(true, true),
      referralSource: field(true, false),
      preferredContact: field(true, true),
      notes: field(true, false),
    },
  },
  general: {
    id: 'general',
    name: 'General',
    description: 'General purpose intake for any business type',
    iconName: 'FileText',
    steps: [personalInfoStep, documentUploadStep, additionalDetailsStep, reviewStep],
    documentTypes: ['drivers_license'],
    defaultFieldConfig: {
      firstName: field(true, true),
      lastName: field(true, true),
      dateOfBirth: field(true, false),
      ssnLast4: field(false, false),
      email: field(true, true),
      phone: field(true, true),
      address: field(true, true),
      city: field(true, true),
      state: field(true, true),
      zipCode: field(true, true),
      reasonForVisit: field(true, true),
      referralSource: field(true, false),
      preferredContact: field(true, true),
      notes: field(true, false),
    },
  },
}

export function getTemplate(id: string): TemplateConfig {
  return templates[id] || templates.general
}

export const defaultFormValues = {
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  ssnLast4: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  employerName: '',
  jobTitle: '',
  annualIncome: '',
  employmentStatus: '',
  yearsEmployed: '',
  primaryCarePhysician: '',
  allergies: '',
  currentMedications: '',
  medicalConditions: '',
  caseType: '',
  opposingParty: '',
  caseDescription: '',
  urgencyLevel: '',
  reasonForVisit: '',
  referralSource: '',
  preferredContact: '',
  notes: '',
}
