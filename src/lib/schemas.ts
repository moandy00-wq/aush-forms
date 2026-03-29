import { z } from 'zod'

// ============================================================
// Form Step Schemas
// ============================================================

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  ssnLast4: z.string().regex(/^\d{4}$/, 'Must be exactly 4 digits').or(z.literal('')).optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code'),
  // Medical-specific
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
})

export const employmentSchema = z.object({
  employerName: z.string().min(1, 'Employer name is required'),
  jobTitle: z.string().optional().or(z.literal('')),
  annualIncome: z.string().min(1, 'Annual income is required'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  yearsEmployed: z.string().optional().or(z.literal('')),
})

export const medicalSchema = z.object({
  primaryCarePhysician: z.string().min(1, 'Primary care physician is required'),
  allergies: z.string().optional().or(z.literal('')),
  currentMedications: z.string().optional().or(z.literal('')),
  medicalConditions: z.string().optional().or(z.literal('')),
})

export const legalSchema = z.object({
  caseType: z.string().min(1, 'Case type is required'),
  opposingParty: z.string().optional().or(z.literal('')),
  caseDescription: z.string().min(1, 'Case description is required'),
  urgencyLevel: z.string().min(1, 'Urgency level is required'),
})

export const additionalDetailsSchema = z.object({
  reasonForVisit: z.string().min(1, 'Reason for visit is required'),
  referralSource: z.string().optional().or(z.literal('')),
  preferredContact: z.string().min(1, 'Preferred contact method is required'),
  notes: z.string().optional().or(z.literal('')),
})

// ============================================================
// Setup Schemas
// ============================================================

export const setupStep1Schema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  notificationEmail: z.string().email('Invalid email address'),
})

export const setupStep2Schema = z.object({
  template: z.enum(['financial', 'medical', 'legal', 'general']),
})

// ============================================================
// Step Field Maps (for trigger() validation)
// ============================================================

export const personalInfoFields = [
  'firstName', 'lastName', 'dateOfBirth', 'email', 'phone',
  'address', 'city', 'state', 'zipCode',
] as const

export const employmentFields = [
  'employerName', 'annualIncome', 'employmentStatus',
] as const

export const medicalFields = [
  'primaryCarePhysician',
] as const

export const legalFields = [
  'caseType', 'caseDescription', 'urgencyLevel',
] as const

export const additionalDetailsFields = [
  'reasonForVisit', 'preferredContact',
] as const

// ============================================================
// Helpers
// ============================================================

export function isValidImageType(file: File): boolean {
  return ['image/jpeg', 'image/png'].includes(file.type)
}
