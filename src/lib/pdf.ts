import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { IntakeFormData, UploadedFiles, Profile } from './types'

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.substring(0, 2), 16)
  const g = parseInt(cleaned.substring(2, 4), 16)
  const b = parseInt(cleaned.substring(4, 6), 16)
  return [r, g, b]
}

function lightenColor(rgb: [number, number, number], factor: number): [number, number, number] {
  return [
    Math.min(255, Math.round(rgb[0] + (255 - rgb[0]) * factor)),
    Math.min(255, Math.round(rgb[1] + (255 - rgb[1]) * factor)),
    Math.min(255, Math.round(rgb[2] + (255 - rgb[2]) * factor)),
  ]
}

interface PdfLabels {
  personalInfo: string
  employment: string
  medicalInfo: string
  legalInfo: string
  additionalDetails: string
  uploadedDocuments: string
  [key: string]: string
}

const enLabels: PdfLabels = {
  personalInfo: 'Personal Information',
  employment: 'Employment & Income',
  medicalInfo: 'Medical Information',
  legalInfo: 'Case Information',
  additionalDetails: 'Additional Details',
  uploadedDocuments: 'Uploaded Documents',
}

const esLabels: PdfLabels = {
  personalInfo: 'Información Personal',
  employment: 'Empleo e Ingresos',
  medicalInfo: 'Información Médica',
  legalInfo: 'Información del Caso',
  additionalDetails: 'Detalles Adicionales',
  uploadedDocuments: 'Documentos Subidos',
}

const fieldLabels: Record<string, { en: string; es: string }> = {
  firstName: { en: 'First Name', es: 'Nombre' },
  lastName: { en: 'Last Name', es: 'Apellido' },
  dateOfBirth: { en: 'Date of Birth', es: 'Fecha de Nacimiento' },
  ssnLast4: { en: 'SSN (Last 4)', es: 'SSN (Últimos 4)' },
  email: { en: 'Email', es: 'Correo Electrónico' },
  phone: { en: 'Phone', es: 'Teléfono' },
  address: { en: 'Address', es: 'Dirección' },
  city: { en: 'City', es: 'Ciudad' },
  state: { en: 'State', es: 'Estado' },
  zipCode: { en: 'ZIP Code', es: 'Código Postal' },
  emergencyContactName: { en: 'Emergency Contact', es: 'Contacto de Emergencia' },
  emergencyContactPhone: { en: 'Emergency Phone', es: 'Teléfono de Emergencia' },
  employerName: { en: 'Employer', es: 'Empleador' },
  jobTitle: { en: 'Job Title', es: 'Título del Puesto' },
  annualIncome: { en: 'Annual Income', es: 'Ingreso Anual' },
  employmentStatus: { en: 'Employment Status', es: 'Estado de Empleo' },
  yearsEmployed: { en: 'Years Employed', es: 'Años Empleado' },
  primaryCarePhysician: { en: 'Primary Physician', es: 'Médico Primario' },
  allergies: { en: 'Allergies', es: 'Alergias' },
  currentMedications: { en: 'Medications', es: 'Medicamentos' },
  medicalConditions: { en: 'Conditions', es: 'Condiciones' },
  caseType: { en: 'Case Type', es: 'Tipo de Caso' },
  opposingParty: { en: 'Opposing Party', es: 'Parte Contraria' },
  caseDescription: { en: 'Case Description', es: 'Descripción del Caso' },
  urgencyLevel: { en: 'Urgency', es: 'Urgencia' },
  reasonForVisit: { en: 'Reason for Visit', es: 'Motivo de Visita' },
  referralSource: { en: 'Referral Source', es: 'Fuente de Referencia' },
  preferredContact: { en: 'Preferred Contact', es: 'Contacto Preferido' },
  notes: { en: 'Notes', es: 'Notas' },
}

interface SectionConfig {
  titleKey: keyof PdfLabels
  fields: string[]
}

const sectionsByTemplate: Record<string, SectionConfig[]> = {
  financial: [
    { titleKey: 'personalInfo', fields: ['firstName', 'lastName', 'dateOfBirth', 'ssnLast4', 'email', 'phone', 'address', 'city', 'state', 'zipCode'] },
    { titleKey: 'employment', fields: ['employerName', 'jobTitle', 'annualIncome', 'employmentStatus', 'yearsEmployed'] },
    { titleKey: 'additionalDetails', fields: ['reasonForVisit', 'referralSource', 'preferredContact', 'notes'] },
  ],
  medical: [
    { titleKey: 'personalInfo', fields: ['firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'emergencyContactName', 'emergencyContactPhone'] },
    { titleKey: 'medicalInfo', fields: ['primaryCarePhysician', 'allergies', 'currentMedications', 'medicalConditions'] },
    { titleKey: 'additionalDetails', fields: ['reasonForVisit', 'referralSource', 'preferredContact', 'notes'] },
  ],
  legal: [
    { titleKey: 'personalInfo', fields: ['firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'address', 'city', 'state', 'zipCode'] },
    { titleKey: 'legalInfo', fields: ['caseType', 'opposingParty', 'caseDescription', 'urgencyLevel'] },
    { titleKey: 'additionalDetails', fields: ['reasonForVisit', 'referralSource', 'preferredContact', 'notes'] },
  ],
  general: [
    { titleKey: 'personalInfo', fields: ['firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'address', 'city', 'state', 'zipCode'] },
    { titleKey: 'additionalDetails', fields: ['reasonForVisit', 'referralSource', 'preferredContact', 'notes'] },
  ],
}

export async function generateIntakePdf(
  data: IntakeFormData,
  files: UploadedFiles,
  profile: Pick<Profile, 'business_name' | 'brand_color' | 'business_logo_url' | 'template'>,
  locale: 'en' | 'es' = 'en'
): Promise<Blob> {
  const doc = new jsPDF()
  const brandColor = hexToRgb(profile.brand_color || '#0891b2')
  const lightBrand = lightenColor(brandColor, 0.9)
  const labels = locale === 'es' ? esLabels : enLabels
  const pageWidth = doc.internal.pageSize.getWidth()

  // ── Header ──
  doc.setFillColor(...brandColor)
  doc.rect(0, 0, pageWidth, 40, 'F')

  // Business name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(profile.business_name || 'Aush Forms', 14, 18)

  // Subtitle
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(locale === 'es' ? 'Formulario de Admisión del Cliente' : 'Client Intake Form', 14, 28)

  // Date
  doc.setFontSize(9)
  doc.text(new Date().toLocaleDateString(locale === 'es' ? 'es-US' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }), 14, 35)

  let cursorY = 50

  // ── Sections ──
  const sections = sectionsByTemplate[profile.template] || sectionsByTemplate.general

  for (const section of sections) {
    const sectionTitle = labels[section.titleKey] || section.titleKey
    const rows: [string, string][] = []

    for (const fieldKey of section.fields) {
      const value = (data as unknown as Record<string, string>)[fieldKey]
      if (value && value.trim()) {
        const label = fieldLabels[fieldKey]
          ? (locale === 'es' ? fieldLabels[fieldKey]!.es : fieldLabels[fieldKey]!.en)
          : fieldKey
        rows.push([label, value])
      }
    }

    if (rows.length === 0) continue

    // Check if we need a new page
    if (cursorY > 250) {
      doc.addPage()
      cursorY = 20
    }

    autoTable(doc, {
      startY: cursorY,
      head: [[sectionTitle, '']],
      body: rows,
      headStyles: {
        fillColor: brandColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [30, 30, 30],
      },
      alternateRowStyles: {
        fillColor: lightBrand,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    })

    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  }

  // ── Uploaded Documents ──
  const fileEntries = Object.entries(files).filter(([, f]) => f !== null) as [string, { file: File; preview: string }][]

  if (fileEntries.length > 0) {
    if (cursorY > 200) {
      doc.addPage()
      cursorY = 20
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...brandColor)
    doc.text(labels.uploadedDocuments, 14, cursorY)
    cursorY += 8

    for (const [key, fileData] of fileEntries) {
      if (cursorY > 220) {
        doc.addPage()
        cursorY = 20
      }

      // Label
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      const docLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
      doc.text(docLabel, 14, cursorY)
      cursorY += 4

      // Embed image
      try {
        const base64 = await fileToBase64(fileData.file)
        const format = fileData.file.type === 'image/png' ? 'PNG' : 'JPEG'
        doc.addImage(base64, format, 14, cursorY, 80, 60)
        cursorY += 65
      } catch {
        doc.setTextColor(150, 150, 150)
        doc.text('[Image could not be embedded]', 14, cursorY + 10)
        cursorY += 20
      }
    }
  }

  // ── Footer on all pages ──
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    const footerText = locale === 'es'
      ? `Generado por ${profile.business_name || 'Aush Forms'} — Página ${i} de ${pageCount}`
      : `Generated by ${profile.business_name || 'Aush Forms'} — Page ${i} of ${pageCount}`
    doc.text(footerText, pageWidth / 2, 290, { align: 'center' })
  }

  return doc.output('blob')
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
