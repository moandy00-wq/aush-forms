import { createWorker, type Worker } from 'tesseract.js'
import type { IntakeFormData, OcrResult } from './types'

let workerInstance: Worker | null = null

export async function getOcrWorker(): Promise<Worker> {
  if (!workerInstance) {
    workerInstance = await createWorker('eng')
  }
  return workerInstance
}

export async function terminateOcrWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate()
    workerInstance = null
  }
}

export async function processImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  try {
    const worker = await getOcrWorker()

    // Convert file to image URL
    const imageUrl = URL.createObjectURL(file)

    const { data } = await worker.recognize(imageUrl)
    URL.revokeObjectURL(imageUrl)

    const text = data.text || ''
    const confidence = data.confidence || 0

    if (!text.trim()) {
      return { text: '', confidence: 0, extractedFields: {}, status: 'failed' }
    }

    const extractedFields = parseAllFields(text)
    const fieldCount = Object.keys(extractedFields).length

    return {
      text,
      confidence,
      extractedFields,
      status: fieldCount >= 3 ? 'success' : fieldCount > 0 ? 'partial' : 'failed',
    }
  } catch (err) {
    console.error('[OCR] Processing error:', err)
    return { text: '', confidence: 0, extractedFields: {}, status: 'failed' }
  }
}

// ============================================================
// Field Parsers
// ============================================================

function parseAllFields(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}

  // Try driver's license patterns first
  const dlFields = parseDriversLicense(text)
  Object.assign(fields, dlFields)

  // Try financial document patterns
  const finFields = parseFinancialDoc(text)
  Object.assign(fields, finFields)

  return fields
}

export function parseDriversLicense(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Name patterns
  // Look for "FN: John" or "FIRST NAME: John" or "LN: Doe" patterns
  const fnMatch = text.match(/(?:FN|FIRST\s*NAME|GIVEN\s*NAME)[:\s]+([A-Za-z'-]+)/i)
  const lnMatch = text.match(/(?:LN|LAST\s*NAME|FAMILY\s*NAME|SURNAME)[:\s]+([A-Za-z'-]+)/i)

  if (fnMatch) fields.firstName = capitalize(fnMatch[1]!)
  if (lnMatch) fields.lastName = capitalize(lnMatch[1]!)

  // If no labeled name found, try "NAME: FIRST LAST" pattern
  if (!fnMatch && !lnMatch) {
    const nameMatch = text.match(/(?:NAME)[:\s]+([A-Za-z'-]+)\s+([A-Za-z'-]+)/i)
    if (nameMatch) {
      fields.firstName = capitalize(nameMatch[1]!)
      fields.lastName = capitalize(nameMatch[2]!)
    }
  }

  // Date of birth — MM/DD/YYYY or MM-DD-YYYY
  const dobMatch = text.match(/(?:DOB|DATE\s*OF\s*BIRTH|BIRTH\s*DATE|BD)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i)
  if (dobMatch) {
    const parts = dobMatch[1]!.split(/[\/-]/)
    if (parts.length === 3) {
      const month = parts[0]!.padStart(2, '0')
      const day = parts[1]!.padStart(2, '0')
      let year = parts[2]!
      if (year.length === 2) year = (parseInt(year) > 50 ? '19' : '20') + year
      fields.dateOfBirth = `${year}-${month}-${day}`
    }
  }

  // Address — look for street number pattern
  const addrMatch = text.match(/(?:ADDRESS|ADDR|ADD)[:\s]*(.+)/i)
  if (addrMatch) {
    const addr = addrMatch[1]!.trim()
    fields.address = addr
  } else {
    // Try to find a line that starts with a number (street address)
    for (const line of lines) {
      if (/^\d+\s+[A-Za-z]/.test(line) && line.length > 10) {
        fields.address = line
        break
      }
    }
  }

  // City, State, ZIP — "CITY, ST 12345" pattern
  const cszMatch = text.match(/([A-Za-z\s]+),?\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/i)
  if (cszMatch) {
    fields.city = capitalize(cszMatch[1]!.trim())
    fields.state = cszMatch[2]!.toUpperCase()
    fields.zipCode = cszMatch[3]!
  }

  return fields
}

export function parseFinancialDoc(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}

  // Employer name
  const employerMatch = text.match(/(?:EMPLOYER|COMPANY|EMPLOYER\s*NAME)[:\s]+(.+)/i)
  if (employerMatch) {
    fields.employerName = employerMatch[1]!.trim()
  }

  // Income / pay amount — dollar amounts
  const incomeMatch = text.match(/(?:GROSS\s*PAY|TOTAL\s*PAY|SALARY|ANNUAL\s*(?:INCOME|SALARY)|YTD\s*GROSS)[:\s]*\$?([\d,]+\.?\d*)/i)
  if (incomeMatch) {
    fields.annualIncome = incomeMatch[1]!.replace(/,/g, '')
  }

  // Job title
  const titleMatch = text.match(/(?:TITLE|POSITION|JOB\s*TITLE|OCCUPATION)[:\s]+(.+)/i)
  if (titleMatch) {
    fields.jobTitle = titleMatch[1]!.trim()
  }

  return fields
}

export function parseMedicalDoc(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}

  // Insurance member name
  const memberMatch = text.match(/(?:MEMBER|INSURED|SUBSCRIBER|PATIENT)[:\s]+([A-Za-z\s'-]+)/i)
  if (memberMatch) {
    const parts = memberMatch[1]!.trim().split(/\s+/)
    if (parts.length >= 2) {
      fields.firstName = capitalize(parts[0]!)
      fields.lastName = capitalize(parts[parts.length - 1]!)
    }
  }

  return fields
}

// ============================================================
// Helpers
// ============================================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
