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

  const dlFields = parseDriversLicense(text)
  Object.assign(fields, dlFields)

  const finFields = parseFinancialDoc(text)
  Object.assign(fields, finFields)

  return fields
}

export function parseDriversLicense(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const upper = text.toUpperCase()

  // ── Name extraction (multiple strategies) ──

  // Strategy 1: Labeled fields — FN, LN, FIRST NAME, LAST NAME, etc.
  const fnMatch = text.match(/(?:FN|1|FIRST\s*NAME|GIVEN\s*NAME|NOMBRE)[:\s]+([A-Za-z'-]+)/i)
  const lnMatch = text.match(/(?:LN|2|LAST\s*NAME|FAMILY\s*NAME|SURNAME|APELLIDO)[:\s]+([A-Za-z'-]+)/i)

  if (fnMatch) fields.firstName = capitalize(fnMatch[1]!)
  if (lnMatch) fields.lastName = capitalize(lnMatch[1]!)

  // Strategy 2: "NAME: LAST, FIRST" or "NAME: FIRST LAST"
  if (!fields.firstName && !fields.lastName) {
    const nameCommaMatch = text.match(/(?:NAME|NM)[:\s]+([A-Za-z'-]+)\s*,\s*([A-Za-z'-]+)/i)
    if (nameCommaMatch) {
      fields.lastName = capitalize(nameCommaMatch[1]!)
      fields.firstName = capitalize(nameCommaMatch[2]!)
    } else {
      const nameMatch = text.match(/(?:NAME|NM)[:\s]+([A-Za-z'-]+)\s+([A-Za-z'-]+)/i)
      if (nameMatch) {
        fields.firstName = capitalize(nameMatch[1]!)
        fields.lastName = capitalize(nameMatch[2]!)
      }
    }
  }

  // Strategy 3: DL-specific — look for "4d" labels used on many US licenses
  if (!fields.firstName) {
    const dl4d = text.match(/4d\w?\s*[:\s]+([A-Za-z'-]+)/i)
    if (dl4d) fields.firstName = capitalize(dl4d[1]!)
  }
  if (!fields.lastName) {
    const dl1 = text.match(/(?:1|4a)\s*[:\s]+([A-Za-z'-]+)/i)
    if (dl1) fields.lastName = capitalize(dl1[1]!)
  }

  // Strategy 4: Fallback — look for all-caps name lines (common on DLs)
  if (!fields.firstName && !fields.lastName) {
    for (const line of lines) {
      // Skip lines that look like addresses or dates
      if (/\d{5}/.test(line) || /\d{1,2}[\/-]\d{1,2}/.test(line)) continue
      // Match "LASTNAME FIRSTNAME" or "LASTNAME, FIRSTNAME" (2-3 all-caps words, no numbers)
      const allCapsName = line.match(/^([A-Z][A-Z'-]+)\s*,?\s+([A-Z][A-Z'-]+)(?:\s+[A-Z]\.?)?$/)
      if (allCapsName && line.length < 40) {
        fields.lastName = capitalize(allCapsName[1]!)
        fields.firstName = capitalize(allCapsName[2]!)
        break
      }
    }
  }

  // ── Date of birth ──
  // Try labeled DOB first
  const dobMatch = text.match(/(?:DOB|DATE\s*OF\s*BIRTH|BIRTH\s*DATE|BD|FECHA\s*DE\s*NAC)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i)
  if (dobMatch) {
    fields.dateOfBirth = normalizeDate(dobMatch[1]!)
  } else {
    // Fallback: find any date that looks like a birthdate (not an expiry — person would be 16-100 years old)
    const allDates = text.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g)
    if (allDates) {
      for (const d of allDates) {
        const normalized = normalizeDate(d)
        if (normalized && looksLikeBirthdate(normalized)) {
          fields.dateOfBirth = normalized
          break
        }
      }
    }
  }

  // ── Address ──
  const addrMatch = text.match(/(?:ADDRESS|ADDR|ADD|STREET|DOMICILIO)[:\s]*(.+)/i)
  if (addrMatch) {
    fields.address = cleanAddress(addrMatch[1]!)
  } else {
    // Fallback: line starting with a street number
    for (const line of lines) {
      if (/^\d+\s+[A-Za-z]/.test(line) && line.length > 8 && line.length < 80) {
        // Make sure it's not a zip code line or date
        if (!/^\d{5}/.test(line) && !/\d[\/-]\d/.test(line)) {
          fields.address = cleanAddress(line)
          break
        }
      }
    }
  }

  // ── City, State, ZIP ──
  // Pattern: "CITY, ST 12345" or "CITY ST 12345"
  const cszMatch = text.match(/([A-Za-z][A-Za-z\s]{2,25}),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/i)
  if (cszMatch) {
    fields.city = capitalize(cszMatch[1]!.trim())
    fields.state = cszMatch[2]!.toUpperCase()
    fields.zipCode = cszMatch[3]!
  } else {
    // Try to find state abbreviation and zip separately
    const stateZip = text.match(/\b([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/)
    if (stateZip && isUSState(stateZip[1]!)) {
      fields.state = stateZip[1]!
      fields.zipCode = stateZip[2]!
    }

    // Try to find city from a line before the state
    if (fields.state && !fields.city) {
      for (const line of lines) {
        if (line.includes(fields.state) && fields.zipCode && line.includes(fields.zipCode)) {
          const cityPart = line.split(/,?\s+/)[0]
          if (cityPart && cityPart.length > 2 && /^[A-Za-z]/.test(cityPart)) {
            fields.city = capitalize(cityPart)
          }
        }
      }
    }
  }

  // ── Sex/Gender (can help verify it's a DL) ──
  // Not stored but can boost confidence

  return fields
}

export function parseFinancialDoc(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}

  const employerMatch = text.match(/(?:EMPLOYER|COMPANY|EMPLOYER\s*NAME)[:\s]+(.+)/i)
  if (employerMatch) {
    fields.employerName = employerMatch[1]!.trim()
  }

  const incomeMatch = text.match(/(?:GROSS\s*PAY|TOTAL\s*PAY|SALARY|ANNUAL\s*(?:INCOME|SALARY)|YTD\s*GROSS)[:\s]*\$?([\d,]+\.?\d*)/i)
  if (incomeMatch) {
    fields.annualIncome = incomeMatch[1]!.replace(/,/g, '')
  }

  const titleMatch = text.match(/(?:TITLE|POSITION|JOB\s*TITLE|OCCUPATION)[:\s]+(.+)/i)
  if (titleMatch) {
    fields.jobTitle = titleMatch[1]!.trim()
  }

  return fields
}

export function parseMedicalDoc(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}

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

function normalizeDate(raw: string): string {
  const parts = raw.split(/[\/-]/)
  if (parts.length !== 3) return ''
  const month = parts[0]!.padStart(2, '0')
  const day = parts[1]!.padStart(2, '0')
  let year = parts[2]!
  if (year.length === 2) year = (parseInt(year) > 50 ? '19' : '20') + year
  return `${year}-${month}-${day}`
}

function looksLikeBirthdate(isoDate: string): boolean {
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  const age = (now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  return age >= 14 && age <= 110
}

function cleanAddress(raw: string): string {
  // Remove trailing city/state/zip if stuck on same line
  return raw.replace(/,?\s+[A-Z]{2}\s+\d{5}.*$/, '').trim()
}

const US_STATE_SET = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
])

function isUSState(str: string): boolean {
  return US_STATE_SET.has(str.toUpperCase())
}
